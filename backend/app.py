import os
import sqlite3
from datetime import datetime, date
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Use the project root election.db created by backend/init_db.py
DB_FILE = os.path.join(os.getcwd(), 'election.db')


def get_conn():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def calculate_age(dob_str):
    try:
        # Expecting YYYY-MM-DD
        y, m, d = map(int, dob_str.split('-'))
        born = date(y, m, d)
        today = date.today()
        return today.year - born.year - ((today.month, today.day) < (born.month, born.day))
    except Exception:
        return None


@app.route('/candidatos', methods=['GET'])
def candidatos():
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute('SELECT id, numero, nome FROM candidatos ORDER BY numero ASC')
        rows = cur.fetchall()
        conn.close()
        return jsonify([{'id': r['id'], 'numero': r['numero'], 'nome': r['nome']} for r in rows])
    except Exception as e:
        return jsonify({'status': 'error', 'message': 'Falha ao listar candidatos', 'detail': str(e)}), 500


@app.route('/cadastrar_candidato', methods=['POST'])
def cadastrar_candidato():
    try:
        data = request.get_json(force=True) or {}
        nome = (data.get('nome') or '').strip()
        numero = data.get('numero')
        if not nome or not isinstance(numero, int):
            return jsonify({'status': 'error', 'message': 'Dados inválidos'}), 400
        conn = get_conn()
        cur = conn.cursor()
        try:
            cur.execute('INSERT INTO candidatos (numero, nome) VALUES (?, ?)', (numero, nome))
            conn.commit()
        except sqlite3.IntegrityError:
            conn.close()
            return jsonify({'status': 'error', 'message': 'Número de candidato já existe'}), 409
        conn.close()
        return jsonify({'status': 'ok', 'message': 'Candidato cadastrado'}), 201
    except Exception as e:
        return jsonify({'status': 'error', 'message': 'Falha ao cadastrar candidato', 'detail': str(e)}), 500


@app.route('/atualizar_candidato', methods=['POST'])
def atualizar_candidato():
    try:
        data = request.get_json(force=True) or {}
        cid = data.get('id')
        nome = (data.get('nome') or '').strip()
        if not isinstance(cid, int) or not nome:
            return jsonify({'status': 'error', 'message': 'Dados inválidos'}), 400
        conn = get_conn()
        cur = conn.cursor()
        cur.execute('UPDATE candidatos SET nome = ? WHERE id = ?', (nome, cid))
        conn.commit()
        conn.close()
        return jsonify({'status': 'ok', 'message': 'Candidato atualizado'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': 'Falha ao atualizar candidato', 'detail': str(e)}), 500


@app.route('/votar', methods=['POST'])
def votar():
    try:
        data = request.get_json(force=True) or {}
        cpf = (data.get('cpf') or '').strip()
        candidato_id = data.get('candidato_id')
        numero_candidato = data.get('numero_candidato')

        if not cpf:
            return jsonify({'status': 'error', 'message': 'CPF obrigatório'}), 400

        conn = get_conn()
        cur = conn.cursor()

        # Encontrar eleitor
        cur.execute('SELECT id, data_nascimento, ja_votou FROM eleitores WHERE cpf = ?', (cpf,))
        eleitor = cur.fetchone()
        if not eleitor:
            conn.close()
            return jsonify({'status': 'error', 'message': 'Eleitor não cadastrado'}), 404

        if int(eleitor['ja_votou']) == 1:
            conn.close()
            return jsonify({'status': 'error', 'message': 'Eleitor já votou'}), 400

        # Validar idade (se disponível)
        age = calculate_age(eleitor['data_nascimento'])
        if isinstance(age, int) and age < 16:
            conn.close()
            return jsonify({'status': 'error', 'message': 'Idade mínima 16 anos'}), 403

        # Determinar número do candidato
        numero = None
        if isinstance(numero_candidato, int):
            numero = numero_candidato
        elif isinstance(candidato_id, int):
            cur.execute('SELECT numero FROM candidatos WHERE id = ?', (candidato_id,))
            c = cur.fetchone()
            numero = c['numero'] if c else None

        if not isinstance(numero, int):
            conn.close()
            return jsonify({'status': 'error', 'message': 'Candidato inválido'}), 400

        # Registrar voto
        cur.execute(
            'INSERT INTO registro_votos (eleitor_id, candidato_numero, votado_em) VALUES (?, ?, ?)',
            (eleitor['id'], numero, datetime.utcnow().isoformat())
        )
        cur.execute('UPDATE eleitores SET ja_votou = 1 WHERE id = ?', (eleitor['id'],))
        conn.commit()
        conn.close()
        return jsonify({'status': 'ok', 'message': 'Voto registrado com sucesso'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': 'Falha ao registrar voto', 'detail': str(e)}), 500


@app.route('/resultados', methods=['GET'])
def resultados():
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute('SELECT numero, nome FROM candidatos')
        candidatos = {row['numero']: row['nome'] for row in cur.fetchall()}
        cur.execute('SELECT candidato_numero, COUNT(*) as total FROM registro_votos GROUP BY candidato_numero')
        votos = cur.fetchall()
        conn.close()
        data = []
        for row in votos:
            num = row['candidato_numero']
            total = int(row['total'])
            nome = candidatos.get(num, f'Candidato {num}')
            data.append({'label': nome, 'value': total})
        return jsonify({'resultados': data})
    except Exception as e:
        return jsonify({'status': 'error', 'message': 'Falha ao obter resultados', 'detail': str(e)}), 500


@app.route('/limpar_votos', methods=['POST'])
def limpar_votos():
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute('DELETE FROM registro_votos')
        cur.execute('UPDATE eleitores SET ja_votou = 0')
        conn.commit()
        conn.close()
        return jsonify({'status': 'ok', 'message': 'Votos zerados'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': 'Falha ao zerar votos', 'detail': str(e)}), 500


@app.route('/reset_candidatos', methods=['POST'])
def reset_candidatos():
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute('DELETE FROM candidatos')
        conn.commit()
        conn.close()
        return jsonify({'status': 'ok', 'message': 'Candidatos removidos'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': 'Falha ao resetar candidatos', 'detail': str(e)}), 500


@app.route('/admin_resumo', methods=['GET'])
def admin_resumo():
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute('SELECT COUNT(*) as total FROM registro_votos')
        vt_row = cur.fetchone()
        votos_totais = int(vt_row['total'] if vt_row else 0)

        cur.execute('SELECT cpf, data_nascimento FROM eleitores')
        elet_rows = cur.fetchall()
        cpfs_unicos = len({row['cpf'] for row in elet_rows})
        ages = []
        for row in elet_rows:
            a = calculate_age(row['data_nascimento'])
            if isinstance(a, int):
                ages.append(a)
        media_idade = round(sum(ages) / len(ages), 1) if ages else 0
        conn.close()
        return jsonify({'votosTotais': votos_totais, 'mediaIdade': media_idade, 'cpfsUnicos': cpfs_unicos}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': 'Falha ao obter resumo', 'detail': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

