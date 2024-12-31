from flask import Blueprint, jsonify, render_template, request
from app.services.vender_productos import obtener_producto_por_codigo, actualizar_producto_y_stock
from app.models.marca import Marca
from app.models.categoria import Categoria
from app.services.agregar_productos import obtener_tallas_por_marca

vender_productos_bp = Blueprint('vender_productos', __name__)

def obtener_marcas():
    return Marca.query.all()

def obtener_categorias():
    return Categoria.query.all()

@vender_productos_bp.route('/', methods=['GET'])
def index():
    """
    Ruta principal que renderiza el template HTML
    """
    marcas = obtener_marcas()
    categorias = obtener_categorias()
    return render_template('vender_productos.html', marcas=marcas, categorias=categorias)


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
        
@vender_productos_bp.route('/obtener_tallas_por_marca/<int:id_marca>', methods=['GET'])
def obtener_tallas_por_marca_endpoint(id_marca):
    """
    Endpoint para obtener las tallas agrupadas por rango de edad para una marca específica.
    """
    try:
        resultado = obtener_tallas_por_marca(id_marca)
        return jsonify({'success': True, 'tallas_por_rango': resultado})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@vender_productos_bp.route('/guardar_producto', methods=['POST'])
def guardar_producto():
    """
    Endpoint para guardar o actualizar un producto con sus precios y tallas
    """
    try:
        data = request.get_json()
        
        # Validar datos básicos
        if not data or 'idProducto' not in data:
            return jsonify({
                'success': False,
                'message': 'Datos del producto inválidos'
            }), 400
            
        # Actualizar producto usando el servicio
        resultado = actualizar_producto_y_stock(data)
        
        if not resultado['success']:
            return jsonify(resultado), 400
            
        return jsonify({
            'success': True,
            'message': 'Producto actualizado correctamente'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al actualizar el producto: {str(e)}'
        }), 500
        
        
        
      