# Registrasom — Patch de melhoria (instalável)

Este ZIP contém um conjunto de melhorias e arquivos de "boilerplate" para deixar o projeto **instalável** e mais robusto:
- Dockerfiles otimizados (backend/frontend)
- docker-compose com healthchecks
- install.sh com checagens de pré-requisitos
- README expandido (instruções básicas)
- GitHub Actions (CI) básico
- .env.example, .gitignore e Makefile

**Aviso de segurança**: este patch NÃO contém segredos. Revise seu repositório original para remover quaisquer `.env` com chaves antes de publicar.

## Como usar
1. Extraia o ZIP.
2. Copie/mescle os arquivos para o seu repositório (ex.: substitua `docker-compose.yml` e os `Dockerfile`s atuais).
3. Ajuste as variáveis em `.env` (não comite as chaves).
4. Rodar (local / prod):
   ```bash
   chmod +x install.sh
   ./install.sh --non-interactive
   # ou com docker-compose manualmente
   docker compose up --build -d
   ```
5. CI: revise `.github/workflows/ci.yml` e adapte se necessário.

## Conteúdo desse ZIP
- docker-compose.yml
- backend/Dockerfile
- frontend/Dockerfile
- install.sh
- .env.example
- .gitignore
- Makefile
- .github/workflows/ci.yml

## Observações finais
Este patch é propositalmente genérico — adapte as portas, caminhos e comandos `CMD`/`ENTRYPOINT` para bater com a estrutura real do seu projeto (ex.: se o backend chama app.py, ajuste).
