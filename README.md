# RegistraSom - Plataforma de Análise e Transcrição de Áudio

Esta é a versão instalável da plataforma RegistraSom, que inclui um backend em Python (Flask) e um frontend em JavaScript (Vite/React).

## Estrutura do Projeto

```
/app_instalavel
├── app/
│   ├── backend/
│   │   ├── src/ (Código-fonte Python)
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── frontend/
│   │   ├── src/ (Código-fonte JS/React)
│   │   ├── package.json
│   │   └── Dockerfile
│   │
├── docker-compose.yml
├── install.sh
├── README.md (Este arquivo)
└── .env.example
```

## Pré-requisitos

Para rodar a aplicação, você precisará de:

*   **Docker** e **Docker Compose** (para a instalação recomendada)
*   **Python 3.10+** e **Node.js 18+** (para a instalação local)

## 1. Instalação e Configuração

O script `install.sh` automatiza todo o processo de configuração.

### 1.1. Configuração do Ambiente

1.  Crie o arquivo `.env` a partir do `.env.example` e preencha com suas configurações:
    ```bash
    cp .env.example .env
    ```
2.  **Edite o arquivo `.env`** e insira sua chave de API da OpenAI:
    ```
    OPENAI_API_KEY="SUA_CHAVE_AQUI"
    ```

### 1.2. Execução do Script de Instalação

Execute o script de instalação e escolha a opção desejada (Local ou Docker).

```bash
chmod +x install.sh
./install.sh
```

## 2. Execução da Aplicação

### 2.1. Rodar com Docker (Recomendado)

Após a instalação com Docker, a aplicação deve estar rodando em segundo plano.

*   **Para iniciar:**
    ```bash
    docker-compose up -d
    ```
*   **Para parar:**
    ```bash
    docker-compose down
    ```
*   **Acesso:**
    Acesse a aplicação em seu navegador: `http://localhost:3000` (ou a porta definida em `.env`).

### 2.2. Rodar Localmente

Se você escolheu a instalação local, o script `install.sh` criou um script `start.sh` na raiz do projeto.

*   **Para iniciar:**
    ```bash
    chmod +x start.sh
    ./start.sh local
    ```
*   **Acesso:**
    Acesse a aplicação em seu navegador: `http://localhost:5000` (ou a porta definida em `app/backend/src/main.py`).

## 3. Estrutura de Código

*   **Backend:** Localizado em `app/backend/src/`. O ponto de entrada é `main.py`.
*   **Frontend:** Localizado em `app/frontend/src/`. O build é gerado para `app/frontend/dist`.

