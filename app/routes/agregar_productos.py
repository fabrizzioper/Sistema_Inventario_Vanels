from flask import Blueprint, jsonify, render_template
from app.services.agregar_productos import obtener_datos_generales

# Blueprint
agregar_productos_bp = Blueprint('agregar_producto', __name__, url_prefix='/agregar_producto')

@agregar_productos_bp.route('/')
def agregar_producto():
    return render_template('agregar_productos.html')

@agregar_productos_bp.route('/obtener_datos', methods=['GET'])
def obtener_datos():
    """
    Endpoint para obtener datos generales para el frontend.
    """
    try:
        data = obtener_datos_generales()
        return jsonify({'success': True, **data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})
