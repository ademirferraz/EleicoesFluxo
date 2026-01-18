import sqlite3

# Caminho conforme sua estrutura no disco G:
DB_PATH = r"G:\pesquisa\EleicoesFluxo\eleicoes.db"

def reset_banco():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    # 1. Limpeza total para garantir que a simulação comece do zero
    cur.execute("DROP TABLE IF EXISTS votos")
    cur.execute("DROP TABLE IF EXISTS candidatos")
    
    # 2. Criação das tabelas
    cur.execute('''CREATE TABLE candidatos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    numero INTEGER NOT NULL UNIQUE,
                    foto TEXT)''')
                    
    cur.execute('''CREATE TABLE votos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    candidato_id INTEGER,
                    FOREIGN KEY (candidato_id) REFERENCES candidatos (id))''')

    # 3. Inserção com o mapeamento específico que você solicitou
    candidatos_dados = [
        ('Capitao Boanerges', 10, 'assets/11.png'),
        ('Coronel Alexandre Bilica', 30, 'assets/10.png'),
        ('Daniel Godoy', 50, 'assets/12.png'),
        ('Judite Alapenha', 20, 'assets/13.png'),
        ('Givaldo do Sindicato', 60, 'assets/15.png'),
        ('WASHINGTON AZEVEDO', 40, 'assets/14.png')
    ]
    cur.executemany('INSERT INTO candidatos (nome, numero, foto) VALUES (?, ?, ?)', candidatos_dados)

    # 4. Mapeamento dinâmico de NÚMERO para ID (Segurança Ph.D.)
    # Isso garante que se o Daniel Godoy (50) for o ID 3, os votos irão para o ID 3.
    cur.execute("SELECT id, numero FROM candidatos")
    mapa = {numero: id_real for id_real, numero in cur.fetchall()}

    # 5. Distribuição de 100 votos baseada nos NÚMEROS
    # Daniel Godoy (50) com 35% | Boanerges (10) com 15% | Judite (20) com 14%...
    votos_para_inserir = (
        [mapa[50]] * 35 +  # Daniel Godoy (35 votos)
        [mapa[10]] * 15 +  # Boanerges (15 votos)
        [mapa[20]] * 14 +  # Judite Alapenha (14 votos)
        [mapa[30]] * 14 +  # Coronel Bilica (14 votos)
        [mapa[40]] * 12 +  # Washington Azevedo (12 votos)
        [mapa[60]] * 10    # Givaldo do Sindicato (10 votos)
    )

    # 6. Persistência dos votos
    for c_id in votos_para_inserir:
        cur.execute('INSERT INTO votos (candidato_id) VALUES (?)', (c_id,))
    
    conn.commit()
    conn.close()
    print("---")
    print("✅ SUCESSO: Banco de dados resetado em G:\\pesquisa")
    print("📊 Simulação: 100 votos inseridos com Daniel Godoy (50) na liderança.")
    print("---")

if __name__ == "__main__":
    reset_banco()