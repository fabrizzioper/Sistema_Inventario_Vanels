import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from app.config import config

db = SQLAlchemy()

def create_app(env_name):
    app = Flask(__name__)
    app.config.from_object(config[env_name])

    # Configuración de la carpeta de subida de imágenes
    upload_folder = os.path.join(os.path.dirname(__file__), 'static/images')  # Ruta relativa al directorio 'app'
    os.makedirs(upload_folder, exist_ok=True)  # Crea el directorio si no existe
    app.config['UPLOAD_FOLDER'] = upload_folder

    db.init_app(app)

    # Registrar Blueprints existentes
    from app.routes.listar_productos import productos_bp
    app.register_blueprint(productos_bp, url_prefix='/listar_productos')
    
    from app.routes.home import home_bp
    app.register_blueprint(home_bp)  # El blueprint de home no necesita un prefijo de URL
    
    from app.routes.buscar_productos import buscar_bp
    app.register_blueprint(buscar_bp, url_prefix='/buscar_producto')

    # Registrar el blueprint para agregar productos
    from app.routes.agregar_productos import agregar_productos_bp
    app.register_blueprint(agregar_productos_bp, url_prefix='/agregar_productos')
    
    from app.routes.vender_productos import vender_productos_bp
    app.register_blueprint(vender_productos_bp, url_prefix='/vender_productos')

    return app
