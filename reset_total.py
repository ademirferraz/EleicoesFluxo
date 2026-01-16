import sqlite3
import os

BASE_DIR = r"G:\pesquisa\EleicoesFluxo"
DB_PATH = os.path.join(BASE_DIR, "eleicoes.db")

def executar_reset():
    print(f"Limpando e populando banco em: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    try:
        cur.execute("DROP TABLE IF EXISTS votos")
        cur.execute("DROP TABLE IF EXISTS candidatos")
        
        cur.execute('''CREATE TABLE candidatos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            numero INTEGER NOT NULL UNIQUE,
            foto TEXT)''')

        cur.execute('''CREATE TABLE votos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            candidato_id INTEGER,
            FOREIGN KEY (candidato_id) REFERENCES candidatos (id))''')

        candidatos_lista = [
            ('Capitao Boanerges', 10, 'assets/11.png'),
            ('Coronel Alexandre Bilica', 20, 'assets/10.png'),
            ('Daniel Godoy', 30, 'assets/12.png'),
            ('WASHINGTON AZEVEDO', 40, 'assets/14.png'),
            ('Judite Alapenha', 50, 'assets/13.png'),
            ('Givaldo do Sindicato', 60, 'assets/15.png')
        ]
        cur.executemany('INSERT INTO candidatos (nome, numero, foto) VALUES (?, ?, ?)', candidatos_lista)

        # Geração dos 100 votos (Sua base estatística)
        amostra = ([1]*15 + [2]*14 + [3]*35 + [4]*12 + [5]*14 + [6]*10)
        for c_id in amostra:
            cur.execute('INSERT INTO votos (candidato_id) VALUES (?)', (c_id,))
        
        conn.commit()
        print("Sucesso: 100 votos inseridos.")
    except Exception as e:
        print(f"Erro: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    executar_reset()