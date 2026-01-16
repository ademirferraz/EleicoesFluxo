from flask import Flask, request, jsonify
import sqlite3
from datetime import datetime
from flask_cors import CORS

DB_FILE = 'eleicao.db'

app = Flask(__name__)
CORS(app)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', '*')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

def calculate_age(birthdate_str):
    # expects YYYY-MM-DD
    try:
        dob = datetime.strptime(birthdate_str, '%Y-%m-%d').date()
    except Exception:
        return None
    today = datetime.utcnow().date()
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    return age

@app.route('/votar', methods=['POST'])
def votar():
    data = request.get_json() or {}
    cpf = data.get('cpf')
    candidato_id = data.get('candidato_id')
    numero_candidato = data.get('numero_candidato')

    if not cpf:
        return jsonify({'status': 'error', 'message': 'cpf é obrigatório'}), 400

    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute('SELECT * FROM eleitores WHERE cpf = ?', (cpf,))
    eleitor = cur.fetchone()
    if not eleitor:
        conn.close()
        return jsonify({'status': 'error', 'message': 'Eleitor não encontrado'}), 404

    idade = calculate_age(eleitor['data_nascimento'])
    if idade is None:
        conn.close()
        return jsonify({'status': 'error', 'message': 'Data de nascimento inválida'}), 400

    if idade < 16:
        conn.close()
        return jsonify({'status': 'error', 'message': 'Você não pode votar'}), 403

    if eleitor['ja_votou']:
        conn.close()
        return jsonify({'status': 'error', 'message': 'Eleitor já votou'}), 403

    # resolver candidato_id quando vier numero_candidato
    if not candidato_id and numero_candidato:
        cur.execute('SELECT id FROM candidatos WHERE numero = ?', (numero_candidato,))
        row = cur.fetchone()
        if not row:
            conn.close()
            return jsonify({'status': 'error', 'message': 'Candidato não encontrado'}), 404
        candidato_id = row['id']

    if not candidato_id:
        conn.close()
        return jsonify({'status': 'error', 'message': 'candidato_id é obrigatório'}), 400

    # registrar voto
    try:
        now = datetime.utcnow().isoformat()
        cur.execute('INSERT INTO registro_votos (eleitor_id, candidato_id, votado_em) VALUES (?, ?, ?)',
                    (eleitor['id'], candidato_id, now))
        cur.execute('UPDATE eleitores SET ja_votou = 1 WHERE id = ?', (eleitor['id'],))
        conn.commit()
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'status': 'error', 'message': 'Erro ao registrar voto', 'detail': str(e)}), 500

    conn.close()
    return jsonify({'status': 'ok', 'message': 'Voto registrado'}), 200

@app.route('/candidatos', methods=['GET'])
def listar_candidatos():
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute('''
            SELECT c.id, c.numero, c.nome, COALESCE(COUNT(r.id), 0) AS votos_recebidos
            FROM candidatos c
            LEFT JOIN registro_votos r ON r.candidato_id = c.id
            GROUP BY c.id, c.numero, c.nome
            ORDER BY c.numero ASC
        ''')
        rows = cur.fetchall()
        conn.close()
        candidatos = [
            {
                'id': row['id'],
                'numero': row['numero'],
                'nome': row['nome'],
                'votos_recebidos': int(row['votos_recebidos'])
            } for row in rows
        ]
        return jsonify(candidatos), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': 'Falha ao listar candidatos', 'detail': str(e)}), 500

"""
@app.route('/cadastrar_candidato', methods=['POST'])
def cadastrar_candidato():
    # rota de cadastro manual desativada temporariamente para testes
    pass
"""

@app.route('/resultados', methods=['GET'])
def resultados():
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute('''
            SELECT c.nome AS label, COALESCE(COUNT(r.id), 0) AS value
            FROM candidatos c
            LEFT JOIN registro_votos r ON r.candidato_id = c.id
            GROUP BY c.id, c.numero, c.nome
            ORDER BY value DESC
        ''')
        rows = cur.fetchall()
        result = [{'label': row['label'], 'value': int(row['value'])} for row in rows]
        total = sum(item['value'] for item in result)
        if total == 0:
            try:
                cur.execute('SELECT c.nome AS label, COALESCE(c.votos_recebidos, 0) AS value FROM candidatos c ORDER BY value DESC')
                rows2 = cur.fetchall()
                result = [{'label': row['label'], 'value': int(row['value'])} for row in rows2]
            except Exception:
                pass
        conn.close()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': 'Falha ao obter resultados', 'detail': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
