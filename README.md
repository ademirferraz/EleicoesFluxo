# EleicoesFluxo
Erro de Conexão: App Admin não carrega dados do Backend (503/404)
# Simulador de Fluxo Eleitoral (EleicoesFluxo) 🗳️📊

Este projeto é uma plataforma de pesquisa acadêmica desenvolvida para simular e visualizar fluxos de votação em tempo real. O sistema integra um backend estatístico com uma interface móvel de monitoramento (Dashboard Admin).

## 🔬 Objetivo da Pesquisa
A plataforma visa analisar o comportamento de persistência de dados e a distribuição de votos através de uma amostra controlada de 100 registros iniciais, distribuídos estatisticamente entre seis candidatos fictícios.

## 🏗️ Arquitetura do Sistema

O projeto é dividido em três camadas principais:

1. **Backend (Python/Flask):** Responsável pela API REST, gerenciamento de ativos (fotos dos candidatos) e integração com o banco de dados SQLite.
2. **Motor Estatístico (Reset Script):** Um módulo de preparação de dados que garante a integridade da amostra inicial e a limpeza de ruídos para cada ciclo de simulação.
3. **Frontend (React Native/Expo):** Dashboard mobile que consome os dados em tempo real, gerando gráficos de barras e tabelas de apuração.

## 🚀 Tecnologias Utilizadas
* **Linguagem:** Python 3.x
* **Framework Web:** Flask + CORS
* **Banco de Dados:** SQLite3
* **Interface:** React Native (Expo)
* **Túnel de Dados:** LocalTunnel (para exposição segura da API local)

## 📊 Estrutura da Amostra Inicial
Para fins de validação da persistência, o sistema inicia com a seguinte distribuição de votos:
* **Daniel Godoy (30):** 35%
* **Capitão Boanerges (10):** 15%
* **Judite Alapenha (50):** 14%
* **Coronel Alexandre Bilica (20):** 14%
* **Washington Azevedo (40):** 12%
* **Givaldo do Sindicato (60):** 10%

## 🛠️ Como Executar a Simulação

1. **Configurar o Banco de Dados:**
   ```bash
   python reset_total.py
