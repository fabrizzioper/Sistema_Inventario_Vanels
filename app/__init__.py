from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from app.config import config

db = SQLAlchemy()

def create_app(env_name):
    app = Flask(__name__)
    app.config.from_object(config[env_name])
    
    db.init_app(app)
    
    # Registrar Blueprints
    from app.routes.productos import productos_bp
    app.register_blueprint(productos_bp, url_prefix='/productos')

    return app
