from flask import Flask
from app.routes.productos import productos_bp

app = Flask(__name__)

# Registrar el blueprint de productos
app.register_blueprint(productos_bp, url_prefix='/productos')

if __name__ == '__main__':
    app.run(debug=True)
