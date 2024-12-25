from flask import Blueprint, render_template

agregar_productos_bp = Blueprint('agregar_productos', __name__)

@agregar_productos_bp.route('/')
def agregar_producto():
    return render_template('agregar_productos.html')
