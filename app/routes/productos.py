from flask import Blueprint, jsonify, render_template
from app.services.productos import obtener_productos

productos_bp = Blueprint('productos', __name__)

@productos_bp.route('/', methods=['GET'])
def listar_productos():
    """
    Retorna los productos en formato JSON.
    """
    try:
        productos = obtener_productos()
        return jsonify({'success': True, 'productos': productos}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@productos_bp.route('/view', methods=['GET'])
def vista_productos():
    return render_template('listar_productos.html')
