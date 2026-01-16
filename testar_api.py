import requests

def testar_cadastro():
    url = "http://localhost:5000/cadastrar_candidato"
    
    # Dados de exemplo para o teste
    novo_candidato = {
        "nome": "Candidato de Teste",
        "numero": 99,
        "foto": "assets/teste.jpg"
    }

    print(f"--- Testando POST para: {url} ---")
    
    try:
        # Envia a requisição POST simulando o formulário ou Postman
        response = requests.post(url, json=novo_candidato)
        
        if response.status_code == 200 or response.status_code == 201:
            print("✅ Sucesso! O servidor aceitou o candidato.")
            print("Resposta do Servidor:", response.json())
        else:
            print(f"❌ Falha! O servidor retornou erro: {response.status_code}")
            print("Detalhes:", response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Erro: O servidor (app.py) não está rodando!")

if __name__ == "__main__":
    testar_cadastro()