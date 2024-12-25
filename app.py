from flask import Flask
from app.routes.listar_productos import productos_bp

app = Flask(__name__)

# Registrar el blueprint de productos
app.register_blueprint(productos_bp, url_prefix='/listar_productos')

if __name__ == '__main__':
    app.run(debug=True)
