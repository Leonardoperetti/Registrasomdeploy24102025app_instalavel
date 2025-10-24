# Backend multi-stage build (Python / Flask)
FROM python:3.10-slim as build
WORKDIR /app
# install build deps
RUN apt-get update && apt-get install -y --no-install-recommends build-essential gcc libpq-dev && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

FROM python:3.10-slim
WORKDIR /app
COPY --from=build /wheels /wheels
COPY backend/requirements.txt /app/requirements.txt
RUN python -m pip install --no-cache /wheels/*
# copy source
COPY backend /app
# expose port
EXPOSE 5000
ENV FLASK_APP=app.py
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app", "--workers", "2"]
