# Dockerfile para o Backend (Python/Flask)
FROM python:3.11-slim

# Definir o diretório de trabalho dentro do container
WORKDIR /app/backend

# Copiar o arquivo de requisitos e instalar dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o código-fonte do backend
COPY src/ src/

# Expor a porta 8000
EXPOSE 8000

# Comando para iniciar o servidor Gunicorn
# O Gunicorn precisa do main.py no PYTHONPATH, o que é garantido pelo WORKDIR e pela importação em main.py
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "src.main:app"]
