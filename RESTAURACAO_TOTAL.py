import sqlite3
import os
import random

BASE_DIR = r"G:\pesquisa\EleicoesFluxo"
DB_PATH = os.path.join(BASE_DIR, "eleicoes.db")

def restaurar_banco():
    print(f"Iniciando restauração completa em: {DB_PATH}")
    if not os.path.exists(BASE_DIR):
        os.makedirs(BASE_DIR)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("DROP TABLE IF EXISTS registro_votos")
    cursor.execute("DROP TABLE IF EXISTS candidatos")
    cursor.execute("DROP TABLE IF EXISTS eleitores")

    cursor.execute("CREATE TABLE candidatos (id INTEGER PRIMARY KEY, nome TEXT, numero INTEGER UNIQUE, foto TEXT)")
    cursor.execute("CREATE TABLE eleitores (cpf TEXT PRIMARY KEY, nome TEXT, ja_votou INTEGER DEFAULT 0)")
    cursor.execute("CREATE TABLE registro_votos (id INTEGER PRIMARY KEY AUTOINCREMENT, cpf TEXT, candidato_id INTEGER)")

    candidatos = [
        (1, 'Capitão Boanerges', 10, 'assets/10.png'),
        (2, 'Coronel Alexandre Bilica', 20, 'assets/20.png'),
        (3, 'Daniel Godoy', 30, 'assets/30.png'),
        (4, 'WASHINGTON AZEVEDO', 40, 'assets/40.png'),
        (5, 'Judite Alapenha', 50, 'assets/50.png'),
        (6, 'Givaldo do Sindicato', 60, 'assets/60.png')
    ]
    cursor.executemany("INSERT INTO candidatos (id, nome, numero, foto) VALUES (?, ?, ?, ?)", candidatos)

    distribuicao = [1]*15 + [2]*14 + [3]*35 + [4]*13 + [5]*13 + [6]*10
    random.shuffle(distribuicao)

    for i, candidato_id in enumerate(distribuicao, 1):
        cpf = str(i).zfill(11)
        cursor.execute("INSERT INTO eleitores (cpf, nome, ja_votou) VALUES (?, ?, ?)", (cpf, f"Eleitor {i}", 1))
        cursor.execute("INSERT INTO registro_votos (cpf, candidato_id) VALUES (?, ?)", (cpf, candidato_id))

    conn.commit()
    conn.close()
    print("Restauração concluída: 6 candidatos e 100 votos.")

if __name__ == "__main__":
    restaurar_banco()
