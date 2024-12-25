from flask import Blueprint, request, jsonify
from app.services.google_openai import buscar_producto, obtener_imagen_producto
import re

buscar_bp = Blueprint('buscar', __name__)

@buscar_bp.route('/buscar', methods=['POST'])
def buscar():
    """
    Busca la información de un producto por su código,
    y devuelve JSON con {success, imagen, nombre, marca, codigo}.
    """
    codigo = request.json.get('codigo')
    try:
        info_producto = buscar_producto(codigo)
        imagen = obtener_imagen_producto(codigo)

        # Extrae los datos de nombre y marca
        lineas = info_producto.split('\n')
        linea_valida = None
        for linea in lineas:
            if "Nombre:" in linea and "Marca:" in linea:
                linea_valida = linea
                break

        nombre = "No disponible"
        marca = "No disponible"
        if linea_valida:
            partes = linea_valida.split(',')
            primera_parte = partes[0].replace('Nombre:', '').strip()
            # Quita algo como "1. " al inicio
            primera_parte = re.sub(r'^\d+\.\s*', '', primera_parte)
            nombre = primera_parte
            if len(partes) > 1:
                segunda_parte = partes[1].replace('Marca:', '').strip()
                marca = segunda_parte

        return jsonify({
            'success': True,
            'imagen': imagen,
            'nombre': nombre,
            'marca': marca,
            'codigo': codigo
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
