import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from src.models.user import User

def generate_token(user_id):
    """Gera um token JWT para o usuário"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=7),  # Token válido por 7 dias
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

def verify_token(token):
    """Verifica se um token JWT é válido e retorna o user_id"""
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None  # Token expirado
    except jwt.InvalidTokenError:
        return None  # Token inválido

def token_required(f):
    """Decorator para proteger rotas que requerem autenticação"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Verificar se o token está no header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Token malformado'}), 401

        if not token:
            return jsonify({'error': 'Token de acesso é obrigatório'}), 401

        try:
            user_id = verify_token(token)
            if not user_id:
                return jsonify({'error': 'Token inválido'}), 401

            current_user = User.query.get(user_id)
            if not current_user:
                return jsonify({'error': 'Usuário não encontrado'}), 404

        except Exception as e:
            return jsonify({'error': 'Token inválido'}), 401

        return f(current_user, *args, **kwargs)

    return decorated
