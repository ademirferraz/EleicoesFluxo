import sqlite3
import os

def reset_banco():
    # 1. Garante que estamos no diretório correto do projeto
    db_path = 'eleicoes.db'
    
    # Remove o banco antigo para evitar conflitos de cache
    if os.path.exists(db_path):
        os.remove(db_path)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 2. Criação das tabelas (Schema)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS candidatos (
            id INTEGER PRIMARY KEY,
            nome TEXT NOT NULL,
            numero INTEGER NOT NULL,
            foto TEXT NOT NULL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS votos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            candidato_id INTEGER,
            data_voto TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (candidato_id) REFERENCES candidatos (id)
        )
    ''')

    # 3. Mapeamento preciso que você definiu (Ph.D. Precision)
    candidatos = [
        (1, 'Capitao Boanerges', 10, 'assets/11.png'),
        (2, 'Coronel Alexandre Bilica', 20, 'assets/10.png'),
        (3, 'Daniel Godoy', 30, 'assets/12.png'),
        (4, 'WASHINGTON AZEVEDO', 40, 'assets/14.png'),
        (5, 'Judite Alapenha', 50, 'assets/13.png'),
        (6, 'Givaldo do Sindicato', 60, 'assets/15.png')
    ]

    cursor.executemany('INSERT INTO candidatos VALUES (?,?,?,?)', candidatos)

    # 4. Distribuição da Amostra (100 votos conforme seu modelo)
    # Daniel Godoy (ID 3) com 35% de market share
    distribuicao = ([1]*15 + [2]*14 + [3]*35 + [4]*12 + [5]*14 + [6]*10)
    
    for cand_id in distribuicao:
        cursor.execute('INSERT INTO votos (candidato_id) VALUES (?)', (cand_id,))

    # 5. O PONTO CRÍTICO: Commit e Fechamento
    conn.commit()
    conn.close()
    print(f"Sucesso: Banco resetado, 6 candidatos e {len(distribuicao)} votos inseridos.")

if __name__ == "__main__":
    reset_banco()