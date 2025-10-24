# Dockerfile para o Frontend (Node.js/Vite)
FROM node:20-alpine

# Definir o diretório de trabalho dentro do container
WORKDIR /app/frontend

# Copiar os arquivos de configuração e código-fonte
COPY package*.json .
COPY src/ src/

# Instalar dependências e buildar a aplicação
RUN npm install
RUN npm run build

# Servir a aplicação estática com Nginx (ou outro servidor estático)
# Para simplificar, vamos usar um servidor estático simples do Node.js (se for um projeto Vite)
# Ou, para o propósito de build, podemos usar o serve do npm.
# Se for um projeto Vite, o build já está pronto em 'dist'.

# Assumindo que o build está em 'dist'
FROM nginx:alpine
COPY --from=0 /app/frontend/dist /usr/share/nginx/html

# Expor a porta 3000
EXPOSE 3000

# Comando padrão do Nginx para iniciar o servidor
CMD ["nginx", "-g", "daemon off;"]
