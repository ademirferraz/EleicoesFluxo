# Backend de Teste (Flask + SQLite)

Arquivos:

- `init_db.py` - cria o banco SQLite `election.db`, as tabelas (`candidatos`, `eleitores`, `registro_votos`) e popula dados de teste.
- `app.py` - servidor Flask com rota `POST /votar` que recebe JSON `{ cpf, numero_candidato }`.

Como rodar:

1. Criar um ambiente virtual (recomendado) e instalar dependências:

```bash
python -m venv .venv
.venv\Scripts\activate  # PowerShell/Windows
pip install -r backend/requirements.txt
```

2. Inicializar o banco:

```bash
python backend/init_db.py
```

3. Iniciar o servidor:

```bash
python backend/app.py
```

4. Teste rápido com `curl`:

```bash
curl -X POST http://localhost:5000/votar -H "Content-Type: application/json" -d '{"cpf":"11122233344","numero_candidato":1}'
```

Notes:
- Para testar a partir do emulador Android use `http://10.0.2.2:5000`.
- Se for testar em dispositivo físico, substitua `localhost` pelo IP da máquina onde o backend está rodando.
