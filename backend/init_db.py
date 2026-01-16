import sqlite3
from datetime import datetime

DB_FILE = "eleicoes.db"

def create_tables(conn):
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS candidatos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero INTEGER NOT NULL UNIQUE,
        nome TEXT NOT NULL,
        foto TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS eleitores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        data_nascimento TEXT NOT NULL, -- YYYY-MM-DD
        ja_votou INTEGER NOT NULL DEFAULT 0
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS registro_votos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        eleitor_id INTEGER NOT NULL,
        candidato_id INTEGER NOT NULL,
        votado_em TEXT NOT NULL,
        FOREIGN KEY(eleitor_id) REFERENCES eleitores(id),
        FOREIGN KEY(candidato_id) REFERENCES candidatos(id)
    )
    """)
    conn.commit()

def seed(conn):
    cur = conn.cursor()

    candidatos = [
        (10, 'Capitão Boanerges', 'assets/10.png'),
        (20, 'Coronel Alexandre Bilica', 'assets/20.png'),
        (30, 'Daniel Godoy', 'assets/30.png'),
        (40, 'WASHINGTON AZEVEDO', 'assets/40.png'),
        (50, 'Judite Alapenha', 'assets/50.png'),
        (60, 'Givaldo do Sindicato', 'assets/60.png')
    ]
    for numero, nome, foto in candidatos:
        try:
            cur.execute("INSERT INTO candidatos (numero, nome, foto) VALUES (?, ?, ?)", (numero, nome, foto))
        except sqlite3.IntegrityError:
            pass

    # inserir eleitores de teste (alguns menores de 16 e alguns maiores)
    # datas no formato YYYY-MM-DD
    eleitores = [
        ("João Maior", "2000-01-01", "11122233344"),  # >16
        ("Maria Menor", "2012-06-15", "22233344455"), # <16
        ("Carlos Teste", "2005-03-20", "33344455566"),# >=16 (2026 -> 21)
        ("Ana Jovem", "2010-12-01", "44455566677"),   # <16
    ]

    for nome, dob, cpf in eleitores:
        try:
            cur.execute("INSERT INTO eleitores (nome, cpf, data_nascimento, ja_votou) VALUES (?, ?, ?, 0)",
                        (nome, cpf, dob))
        except sqlite3.IntegrityError:
            pass

    conn.commit()

if __name__ == '__main__':
    conn = sqlite3.connect(DB_FILE)
    create_tables(conn)
    seed(conn)
    conn.close()
    print(f"Banco inicializado em {DB_FILE} (tabelas e dados seed).")
