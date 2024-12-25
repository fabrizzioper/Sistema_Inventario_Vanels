from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from app.config import config

db = SQLAlchemy()

def create_app(env_name):
    app = Flask(__name__)
    app.config.from_object(config[env_name])
    
    db.init_app(app)

    # Registrar Blueprints
    from app.routes.listar_productos import productos_bp
    app.register_blueprint(productos_bp, url_prefix='/listar_productos')
    
    from app.routes.home import home_bp
    app.register_blueprint(home_bp)  # El blueprint de home no necesita un prefijo de URL

    return app
