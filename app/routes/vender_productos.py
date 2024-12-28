

# from flask import Blueprint, jsonify
# from app.services.vender_productos import obtener_producto_por_codigo

# vender_productos_bp = Blueprint('vender_productos', __name__)

# @vender_productos_bp.route('/<codigo>', methods=['GET'])
# def get_producto_por_codigo(codigo):
#     try:
#         producto = obtener_producto_por_codigo(codigo)
        
#         if producto is None:
#             return jsonify({
#                 'success': False,
#                 'message': 'Producto no encontrado',
#                 'data': None
#             }), 404
            
#         return jsonify({
#             'success': True,
#             'message': 'Producto encontrado exitosamente',
#             'data': producto
#         }), 200
        
#     except Exception as e:
#         return jsonify({
#             'success': False,
#             'message': f'Error al obtener el producto: {str(e)}',
#             'data': None
#         }), 500


from flask import Blueprint, jsonify, render_template
from app.services.vender_productos import obtener_producto_por_codigo

vender_productos_bp = Blueprint('vender_productos', __name__)

@vender_productos_bp.route('/', methods=['GET'])
def index():
    """
    Ruta principal que renderiza el template HTML
    """
    return render_template('vender_productos.html')

@vender_productos_bp.route('/<codigo>', methods=['GET'])
def get_producto_por_codigo(codigo):
    """
    Endpoint API para obtener información detallada de un producto por su código
    """
    try:
        producto = obtener_producto_por_codigo(codigo)
        
        if producto is None:
            return jsonify({
                'success': False,
                'message': 'Producto no encontrado',
                'data': None
            }), 404
            
        return jsonify({
            'success': True,
            'message': 'Producto encontrado exitosamente',
            'data': producto
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al obtener el producto: {str(e)}',
            'data': None
        }), 500