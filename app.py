import os
import sqlite3
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = r"G:\pesquisa\EleicoesFluxo"
DB_PATH = os.path.join(BASE_DIR, "eleicoes.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'assets'), filename)

@app.route('/candidatos', methods=['GET'])
def candidatos():
    try:
        conn = get_conn()
        cur = conn.cursor()
        # Query para contar os votos e trazer as fotos
        cur.execute('''
            SELECT c.id, c.numero, c.nome, c.foto, COUNT(v.id) AS votos_recebidos
            FROM candidatos c
            LEFT JOIN votos v ON v.candidato_id = c.id
            GROUP BY c.id ORDER BY c.numero ASC
        ''')
        rows = cur.fetchall()
        conn.close()
        return jsonify([dict(r) for r in rows]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Servidor ONLINE. Nao feche esta janela.")
    app.run(host='0.0.0.0', port=5000, debug=False)