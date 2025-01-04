import os
from werkzeug.utils import secure_filename
from flask import Blueprint, current_app, json, jsonify, render_template, request
from app.services.agregar_productos import (
    obtener_datos_generales,
    obtener_tallas_por_marca,
    guardar_productos,
)
from flask import url_for

# Blueprint
agregar_productos_bp = Blueprint(
    "agregar_productos", __name__, url_prefix="/agregar_productos"
)


@agregar_productos_bp.route("/")
def agregar_productos():
    return render_template("agregar_productos.html")


@agregar_productos_bp.route("/obtener_datos", methods=["GET"])
def obtener_datos():
    """
    Endpoint para obtener datos generales para el frontend.
    """
    try:
        data = obtener_datos_generales()
        return jsonify({"success": True, **data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


@agregar_productos_bp.route("/obtener_tallas_por_marca/<int:id_marca>", methods=["GET"])
def obtener_tallas_por_marca_endpoint(id_marca):
    """
    Endpoint para obtener las tallas agrupadas por rango de edad para una marca específica.
    """
    try:
        resultado = obtener_tallas_por_marca(id_marca)
        return jsonify({"success": True, "tallas_por_rango": resultado})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


# @agregar_productos_bp.route('/guardar_productos', methods=['POST'])
# def guardar_producto():
#     """
#     Ruta para guardar un producto y toda su información relacionada.
#     """
#     try:
#         # 1. Obtener el JSON enviado dentro del FormData
#         json_data = request.form.get('jsonData')
#         if not json_data:
#             raise ValueError("No se enviaron datos JSON en el formulario.")

#         data = json.loads(json_data)  # Convertir el JSON string a un diccionario

#         # 2. Verificar si el producto ya existe
#         from app.models.producto import Producto
#         existe = Producto.query.filter_by(codigo=data['codigo']).first()
#         if existe:
#             raise ValueError("Producto ya registrado")

#         # 3. Procesar la imagen si se envió
#         archivo = request.files.get('imagenProducto')
#         if archivo and data['codigo']:
#             # Guardar la imagen con el nombre basado en el código del producto
#             filename = secure_filename(f"{data['codigo']}.jpg")
#             ruta_imagen_local = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
#             os.makedirs(os.path.dirname(ruta_imagen_local), exist_ok=True)
#             archivo.save(ruta_imagen_local)
#             data['imagen_url'] = ruta_imagen_local
#         else:
#             data['imagen_url'] = None

#         # 4. Guardar el producto
#         resultado = guardar_productos(data)

#         return jsonify({'success': True, **resultado})
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500


@agregar_productos_bp.route('/guardar_productos', methods=['POST'])
def guardar_producto():
    try:
        # Obtener datos
        json_data = request.form.get('jsonData')
        if not json_data:
            raise ValueError("No se enviaron datos JSON en el formulario.")
        
        data = json.loads(json_data)

        # Verificar existencia
        from app.models.producto import Producto
        existe = Producto.query.filter_by(codigo=data['codigo']).first()
        if existe:
            raise ValueError("Producto ya registrado")

        # Procesar imagen
        archivo = request.files.get('imagenProducto')
        if archivo and data['codigo']:
            filename = secure_filename(f"{data['codigo']}.jpg")
            ruta_imagen_local = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            os.makedirs(os.path.dirname(ruta_imagen_local), exist_ok=True)
            archivo.save(ruta_imagen_local)
            url_imagen = url_for('static', filename=f'images/{filename}')
            data['imagen_url'] = url_imagen
            current_app.logger.debug(f"Imagen guardada en: {ruta_imagen_local}")
            current_app.logger.debug(f"URL de la imagen: {url_imagen}")
        else:
            data['imagen_url'] = None
            current_app.logger.debug("No se recibió ninguna imagen o falta el código del producto.")

        # Guardar producto
        resultado = guardar_productos(data)
        return jsonify({'success': True, **resultado})
    except Exception as e:
        current_app.logger.error(f"Error al guardar producto: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
