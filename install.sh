#!/bin/bash

# Script de Instalação Automatizada para RegistraSom

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Instalação e Configuração do RegistraSom ${NC}"
echo -e "${GREEN}=========================================${NC}"

# 1. Verificar e carregar .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado. Copiando de .env.example.${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Edite o arquivo .env com suas chaves de API.${NC}"
fi

export $(cat .env | grep -v \'^#\' | grep -v \'^$\' | xargs)

# 2. Opção de instalação
echo -e "${BLUE}Selecione o modo de instalação:${NC}"
echo -e "  1) Instalação Local (Requer Python e Node.js)"
echo -e "  2) Instalação com Docker (Requer Docker e Docker Compose)"
read -p "Opção [1/2]: " choice

if [ "$choice" == "1" ]; then
    echo -e "${GREEN}🚀 Iniciando instalação LOCAL...${NC}"
    
    # Instalação do Backend
    echo -e "${BLUE}🐍 Instalando dependências do Backend...${NC}"
    cd app/backend
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    deactivate
    cd ../..
    echo -e "${GREEN}✅ Backend configurado.${NC}"

    # Instalação do Frontend
    echo -e "${BLUE}🌐 Instalando dependências do Frontend...${NC}"
    cd app/frontend
    npm install
    npm run build
    cd ../..
    echo -e "${GREEN}✅ Frontend configurado.${NC}"

    echo -e "${GREEN}🎉 Instalação Local CONCLUÍDA. Para rodar: ./start.sh local${NC}"
    
    # Criar o script start.sh local
    echo -e "#!/bin/bash" > start.sh
    echo -e "if [ \"\$1\" == \"local\" ]; then" >> start.sh
    echo -e "  source app/backend/venv/bin/activate" >> start.sh
    echo -e "  cd app/backend/src" >> start.sh
    echo -e "  python3 main.py" >> start.sh
    echo -e "else" >> start.sh
    echo -e "  docker-compose up" >> start.sh
    echo -e "fi" >> start.sh
    chmod +x start.sh

elif [ "$choice" == "2" ]; then
    echo -e "${GREEN}🐳 Iniciando instalação com DOCKER...${NC}"
    
    # Verificar Docker
    if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ ERRO: Docker ou Docker Compose não encontrados.${NC}"
        echo -e "${RED}   Instale-os e tente novamente.${NC}"
        exit 1
    fi

    echo -e "${BLUE}🏗️  Construindo e iniciando containers...${NC}"
    docker-compose up --build -d
    
    echo -e "${GREEN}🎉 Instalação com Docker CONCLUÍDA.${NC}"
    echo -e "${YELLOW}Acesse: http://localhost:${FRONTEND_PORT:-3000}${NC}"

else
    echo -e "${RED}❌ Opção inválida.${NC}"
    exit 1
fi

