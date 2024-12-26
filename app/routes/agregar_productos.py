from flask import Blueprint, jsonify, render_template, request
from app.services.agregar_productos import (obtener_datos_generales, obtener_tallas_por_marca, guardar_productos)

# Blueprint
agregar_productos_bp = Blueprint('agregar_productos', __name__, url_prefix='/agregar_productos')

@agregar_productos_bp.route('/')
def agregar_productos():
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

@agregar_productos_bp.route('/obtener_tallas_por_marca/<int:id_marca>', methods=['GET'])
def obtener_tallas_por_marca_endpoint(id_marca):
    """
    Endpoint para obtener las tallas agrupadas por rango de edad para una marca específica.
    """
    try:
        resultado = obtener_tallas_por_marca(id_marca)
        return jsonify({'success': True, 'tallas_por_rango': resultado})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})
    
@agregar_productos_bp.route('/guardar_productos', methods=['POST'])
def guardar_producto():
    """
    Ruta para guardar un producto y toda su información relacionada.
    """
    try:
        data = request.json  # Obtener datos del cliente
        resultado = guardar_productos(data)  # Delegar lógica al servicio
        return jsonify({'success': True, **resultado})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    
    
