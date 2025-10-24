import os
from flask import Flask, request, jsonify, send_from_directory, send_file
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import os
import sys
# Adiciona o diretório 'backend' ao PYTHONPATH para encontrar 'utils'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import logging
import sys
import time
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
import hashlib
import jwt
import re
from functools import wraps
import json
from utils.audio_analysis import analyze_audio_features
from utils.transcription import transcribe_audio_manus
from utils.pdf_generator import generate_transcription_pdf


OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

app = Flask(__name__, static_folder="static", static_url_path="/")


# Pasta de uploads (garante caminho absoluto)
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# Configuração de logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
app.logger.setLevel(logging.INFO)

# Configurar FileHandler para logs de erro
log_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "flask.log")
file_handler = logging.FileHandler(log_file_path)
file_handler.setLevel(logging.ERROR)
file_handler.setFormatter(logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s"))
app.logger.addHandler(file_handler)


app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev_key_change_in_production")
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10MB max file size

# Configurar CORS
CORS(app, origins=["*"])

# Configuração do banco de dados
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///registrasom.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# Modelo de usuário simplificado
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    surname = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    age = db.Column(db.Integer, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        """Hash da senha usando Werkzeug com salt"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verifica se a senha está correta"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "surname": self.surname,
            "email": self.email,
            "phone": self.phone,
            "age": self.age,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

# Modelo de áudio simplificado
class Audio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    filesize = db.Column(db.Integer, nullable=False)
    bpm = db.Column(db.Float, nullable=True)
    key = db.Column(db.String(10), nullable=True)
    lufs = db.Column(db.Float, nullable=True)
    frequency_spectrum = db.Column(db.Text, nullable=True) # Armazenar como JSON string
    status = db.Column(db.String(20), default="completed")
    transcription = db.Column(db.Text, nullable=True)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)


    def to_dict(self):
        return {
            "id": self.id,
            "original_filename": self.original_filename,
            "filesize": self.filesize,
            "bpm": self.bpm,
            "key": self.key,
            "lufs": self.lufs,
            "frequency_spectrum": self.frequency_spectrum,
            "status": self.status,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "transcription": self.transcription
        }

# Utilitários de autenticação
def generate_token(user_id):
    """Gera token JWT"""
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow().timestamp() + 86400  # 24 horas
    }
    return jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")

def verify_token(token):
    """Verifica token JWT"""
    try:
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        return payload["user_id"]
    except:
        return None

def token_required(f):
    """Decorator para rotas que requerem autenticação"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Token não fornecido"}), 401

        if token.startswith("Bearer "):
            token = token[7:]

        user_id = verify_token(token)
        if not user_id:
            return jsonify({"error": "Token inválido"}), 401

        current_user = User.query.get(user_id)
        if not current_user:
            return jsonify({"error": "Usuário não encontrado"}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# Validações
def validate_email(email):
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None

def validate_password(password):
    if len(password) < 8:
        return False, "Senha deve ter pelo menos 8 caracteres"
    if not re.search(r"[A-Z]", password):
        return False, "Senha deve conter pelo menos uma letra maiúscula"
    if not re.search(r"[a-z]", password):
        return False, "Senha deve conter pelo menos uma letra minúscula"
    if not re.search(r"\d", password):
        return False, "Senha deve conter pelo menos um número"
    return True, "Senha válida"

# Rotas


@app.route("/api/register", methods=["POST"])
def register():
    """Cadastro de novo usuário"""
    try:
        data = request.json

        # Validação dos campos obrigatórios
        required_fields = ["name", "surname", "email", "age", "password"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Campo {field} é obrigatório"}), 400

        # Validação de email
        if not validate_email(data["email"]):
            return jsonify({"error": "Email inválido"}), 400

        # Verificar se email já existe
        if User.query.filter_by(email=data["email"].lower().strip()).first():
            return jsonify({"error": "Email já cadastrado"}), 400

        # Validação de senha
        is_valid, message = validate_password(data["password"])
        if not is_valid:
            return jsonify({"error": message}), 400

        # Validação de idade
        try:
            age = int(data["age"])
            if age < 13 or age > 120:
                return jsonify({"error": "Idade deve estar entre 13 e 120 anos"}), 400
        except ValueError:
            return jsonify({"error": "Idade deve ser um número válido"}), 400

        # Criar novo usuário
        user = User(
            name=data["name"].strip(),
            surname=data["surname"].strip(),
            email=data["email"].lower().strip(),
            phone=data.get("phone", "").strip() if data.get("phone") else None,
            age=age
        )
        user.set_password(data["password"])

        db.session.add(user)
        db.session.commit()

        # Gerar token de autenticação
        token = generate_token(user.id)

        return jsonify({
            "message": "Usuário cadastrado com sucesso",
            "user": user.to_dict(),
            "token": token
        }), 201

    except Exception as e:
        db.session.rollback()
        import traceback
        app.logger.error("Erro interno do servidor: %s", traceback.format_exc())
        return jsonify({"error": "Erro interno do servidor"}), 500

@app.route("/api/login", methods=["POST"])
def login():
    """Login de usuário"""
    try:
        data = request.json

        if not data.get("email") or not data.get("password"):
            return jsonify({"error": "Email e senha são obrigatórios"}), 400

        user = User.query.filter_by(email=data["email"].lower().strip()).first()

        if not user or not user.check_password(data["password"]):
            return jsonify({"error": "Email ou senha incorretos"}), 401

        token = generate_token(user.id)

        return jsonify({
            "message": "Login realizado com sucesso",
            "user": user.to_dict(),
            "token": token
        }), 200

    except Exception as e:
        import traceback
        app.logger.error("Erro interno do servidor: %s", traceback.format_exc())
        return jsonify({"error": "Erro interno do servidor"}), 500

@app.route("/api/profile", methods=["GET"])
@token_required
def profile(current_user):
    """Perfil do usuário"""
    return jsonify({"user": current_user.to_dict()}), 200

@app.route("/api/upload", methods=["POST"])
@token_required
def upload_audio(current_user):
    """Upload de arquivo de áudio (simulado)"""
    try:
        if "audio" not in request.files:
            return jsonify({"error": "Nenhum arquivo enviado"}), 400

        file = request.files["audio"]
        if file.filename == "":
            return jsonify({"error": "Nenhum arquivo selecionado"}), 400

        # Salvar o arquivo temporariamente para análise
        upload_dir = UPLOAD_FOLDER
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)

        unique_filename = f"{current_user.id}_{datetime.now().timestamp()}_{secure_filename(file.filename)}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(filepath)

        # Realizar análise de áudio
        analysis_results = analyze_audio_features(filepath)

        # Realizar transcrição de áudio
        transcription_text = transcribe_audio_manus(filepath)



        filesize = os.path.getsize(filepath)

        if not analysis_results:
            os.remove(filepath)
            return jsonify({"error": "Falha na análise do arquivo de áudio"}), 500

        # Criar registro no banco com os resultados da análise
        audio = Audio(
            user_id=current_user.id,
            filename=unique_filename,
            original_filename=file.filename,
            filesize=filesize,
            bpm=analysis_results["bpm"],
            key=analysis_results["key"],
            lufs=analysis_results["lufs"],
            frequency_spectrum=json.dumps(analysis_results.get("mean_frequency_spectrum") or analysis_results.get("frequency_spectrum")),
            status="completed",
            transcription=transcription_text
        )



        db.session.add(audio)
        db.session.commit()

        # O arquivo NÃO deve ser removido, pois é necessário para streaming e transcrição on-demand.
        # os.remove(filepath)


        return jsonify({
            "message": "Upload realizado com sucesso",
            "audio": audio.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        import traceback
        app.logger.error("Erro interno do servidor: %s", traceback.format_exc())
        return jsonify({"error": "Erro interno do servidor"}), 500

@app.route("/api/my-uploads", methods=["GET"])
@token_required
def my_uploads(current_user):
    """Lista uploads do usuário"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        audios = Audio.query.filter_by(user_id=current_user.id)\
                           .order_by(Audio.uploaded_at.desc())\
                           .paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            "audios": [audio.to_dict() for audio in audios.items],
            "total": audios.total,
            "pages": audios.pages,
            "current_page": page
        }), 200

    except Exception as e:
        import traceback
        app.logger.error("Erro interno do servidor: %s", traceback.format_exc())
        return jsonify({"error": "Erro interno do servidor"}), 500

@app.route("/api/stats", methods=["GET"])
@token_required
def stats(current_user):
    """Estatísticas do usuário"""
    try:
        total_uploads = Audio.query.filter_by(user_id=current_user.id).count()
        completed_analyses = Audio.query.filter_by(user_id=current_user.id, status="completed").count()
        pending_analyses = Audio.query.filter_by(user_id=current_user.id, status="pending").count()

        total_size = db.session.query(db.func.sum(Audio.filesize))\
                              .filter_by(user_id=current_user.id).scalar() or 0
        total_size_mb = round(total_size / (1024 * 1024), 2)

        return jsonify({
            "total_uploads": total_uploads,
            "completed_analyses": completed_analyses,
            "pending_analyses": pending_analyses,
            "total_size_mb": total_size_mb
        }), 200

    except Exception as e:
        import traceback
        app.logger.error("Erro interno do servidor: %s", traceback.format_exc())
        return jsonify({"error": "Erro interno do servidor"}), 500

@app.route("/api/audio/<int:audio_id>", methods=["DELETE"])
@token_required
def delete_audio(current_user, audio_id):
    """Excluir áudio"""
    try:
        audio = Audio.query.filter_by(id=audio_id).first()
        if not audio:
            return jsonify({"error": "Áudio não encontrado"}), 404

        db.session.delete(audio)
        db.session.commit()

        return jsonify({"message": "Áudio excluído com sucesso"}), 200

    except Exception as e:
        db.session.rollback()
        import traceback
        app.logger.error("Erro interno do servidor: %s", traceback.format_exc())
        return jsonify({"error": "Erro interno do servidor"}), 500

# Rota para servir arquivos enviados (uploads) — acessível em /uploads/<filename>
@app.route("/uploads/<path:filename>")
def serve_uploads(filename):
    try:
        return send_from_directory(UPLOAD_FOLDER, filename)
    except Exception as e:
        app.logger.error("Erro ao servir upload %s: %s", filename, str(e))
        return jsonify({"error": "Arquivo não encontrado"}), 404

# Modelo para registros de música
class MusicRegistration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    titulo = db.Column(db.String(255), nullable=False)
    genero = db.Column(db.String(100), nullable=False)
    data_criacao = db.Column(db.Date, default=date.today)
    autores = db.Column(db.Text, nullable=False) # JSON de autores
    letra = db.Column(db.Text, nullable=True)
    contratos = db.Column(db.Text, nullable=True) # JSON de contratos
    status_checklist = db.Column(db.Text, nullable=True) # JSON de status do checklist
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "titulo": self.titulo,
            "genero": self.genero,
            "data_criacao": self.data_criacao.isoformat() if self.data_criacao else None,
            "autores": json.loads(self.autores) if self.autores else [],
            "letra": self.letra,
            "contratos": json.loads(self.contratos) if self.contratos else [],
            "status_checklist": json.loads(self.status_checklist) if self.status_checklist else {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

# Rotas para Registro de Música
@app.route("/api/music-registration", methods=["POST"])
@token_required
def create_music_registration(current_user):
    try:
        data = request.json
        required_fields = ["titulo", "genero", "autores"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Campo {field} é obrigatório"}), 400

        new_registration = MusicRegistration(
            user_id=current_user.id,
            titulo=data["titulo"],
            genero=data["genero"],
            data_criacao=date.fromisoformat(data["data_criacao"]) if data.get("data_criacao") else date.today(),
            autores=json.dumps(data["autores"]),
            letra=data.get("letra"),
            contratos=json.dumps(data.get("contratos", [])),
            status_checklist=json.dumps(data.get("status_checklist", {})),
        )
        db.session.add(new_registration)
        db.session.commit()
        return jsonify({"message": "Registro de música criado com sucesso", "registration": new_registration.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        import traceback
        app.logger.error("Erro ao criar registro de música: %s", traceback.format_exc())
        return jsonify({"error": "Erro interno do servidor"}), 500

@app.route("/api/music-registration", methods=["GET"])
@token_required
def get_music_registrations(current_user):
    try:
        registrations = MusicRegistration.query.filter_by(user_id=current_user.id).all()
        return jsonify({"registrations": [reg.to_dict() for reg in registrations]}), 200
    except Exception as e:
        import traceback
        app.logger.error("Erro ao obter registros de música: %s", traceback.format_exc())
        return jsonify({"error": "Erro interno do servidor"}), 500

@app.route("/api/music-registration/<int:reg_id>", methods=["GET"])
@token_required
def get_music_registration(current_user, reg_id):
    try:
        registration = MusicRegistration.query.filter_by(id=reg_id, user_id=current_user.id).first()
        if not registration:
            return jsonify({"error": "Registro de música não encontrado"}), 404
        return jsonify({"registration": registration.to_dict()}), 200
    except Exception as e:
        import traceback
        app.logger.error("Erro ao obter registro de música: %s", traceback.format_exc())
        return jsonify({"error": "Erro interno do servidor"}), 500

@app.route("/api/music-registration/<int:reg_id>", methods=["PUT"])
@token_required
def update_music_registration(current_user, reg_id):
    try:
        registration = MusicRegistration.query.filter_by(id=reg_id, user_id=current_user.id).first()
        if not registration:
            return jsonify({"error": "Registro de música não encontrado"}), 404

        data = request.json
        registration.titulo = data.get("titulo", registration.titulo)
        registration.genero = data.get("genero", registration.genero)
        if data.get("data_criacao"):
            registration.data_criacao = date.fromisoformat(data["data_criacao"])
        if data.get("autores") is not None:
            registration.autores = json.dumps(data["autores"])
        registration.letra = data.get("letra", registration.letra)
        if data.get("contratos") is not None:
            registration.contratos = json.dumps(data["contratos"])
        if data.get("status_checklist") is not None:
            registration.status_checklist = json.dumps(data["status_checklist"])

        db.session.commit()
        return jsonify({"message": "Registro de música atualizado com sucesso", "registration": registration.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        import traceback
        app.logger.error("Erro ao atualizar registro de música: %s", traceback.format_exc())
        return jsonify({"error": "Erro interno do servidor"}), 500

@app.route("/api/music-registration/<int:reg_id>", methods=["DELETE"])
@token_required
def delete_music_registration(current_user, reg_id):
    try:
        registration = MusicRegistration.query.filter_by(id=reg_id, user_id=current_user.id).first()
        if not registration:
            return jsonify({"error": "Registro de música não encontrado"}), 404

        db.session.delete(registration)
        db.session.commit()
        return jsonify({"message": "Registro de música excluído com sucesso"}), 200
    except Exception as e:
        db.session.rollback()
        import traceback
        app.logger.error("Erro ao excluir registro de música: %s", traceback.format_exc())
        return jsonify({"error": "Erro interno do servidor"}), 500






# Criar tabelas
with app.app_context():
    db.create_all()

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":

    app.run(host="0.0.0.0", port=5000, debug=False)




@app.route("/api/audio/<int:audio_id>/stream", methods=["GET"])
def stream_audio(audio_id):
    """Serve o arquivo de áudio para o player."""
    try:
        audio = Audio.query.filter_by(id=audio_id).first()
        if not audio:
            return jsonify({"error": "Áudio não encontrado"}), 404

        # Usar send_from_directory para servir o arquivo
        # O UPLOAD_FOLDER é o diretório raiz. O audio.filename é o nome do arquivo.
        return send_from_directory(UPLOAD_FOLDER, audio.filename, as_attachment=False)

    except Exception as e:
        import traceback
        app.logger.error(f"Erro ao servir áudio: {traceback.format_exc()}")
        return jsonify({"error": "Erro interno do servidor"}), 500


@app.route("/api/audio/<int:audio_id>/download", methods=["GET"])
@token_required
def download_audio(current_user, audio_id):
    """Serve o arquivo de áudio para download."""
    try:
        audio = Audio.query.filter_by(id=audio_id).first()
        if not audio:
            return jsonify({"error": "Áudio não encontrado"}), 404

        # Usar send_from_directory para servir o arquivo para download
        return send_from_directory(UPLOAD_FOLDER, audio.filename, as_attachment=True, download_name=audio.original_filename)

    except Exception as e:
        import traceback
        app.logger.error(f"Erro ao servir áudio para download: {traceback.format_exc()}")
        return jsonify({"error": "Erro interno do servidor"}), 500


@app.route("/api/audio/<int:audio_id>/transcription", methods=["GET"])
@token_required
def get_transcription(current_user, audio_id):
    """Retorna a transcrição de um áudio específico."""
    try:
        audio = Audio.query.filter_by(id=audio_id).first()
        if not audio:
            return jsonify({"error": "Áudio não encontrado"}), 404

        # Se a transcrição ainda não foi gerada, tenta gerá-la
        if not audio.transcription:
            filepath = os.path.join(UPLOAD_FOLDER, audio.filename)
            if os.path.exists(filepath):
                transcription_text = transcribe_audio_manus(filepath)
                if transcription_text:
                    audio.transcription = transcription_text
                    db.session.commit()
                else:
                    # Retorna None para que o frontend mostre "Carregando..." ou uma mensagem de erro
                    return jsonify({"transcription": None}), 200
            else:
                 return jsonify({"error": "Arquivo de áudio não encontrado para transcrição"}), 404

        return jsonify({"transcription": audio.transcription}), 200

    except Exception as e:
        import traceback
        app.logger.error(f"Erro ao buscar transcrição: {traceback.format_exc()}")
        return jsonify({"error": "Erro interno do servidor"}), 500

