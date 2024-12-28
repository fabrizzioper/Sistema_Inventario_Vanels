# from app.models.producto import Producto  # Asegúrate de que este modelo exista
# from app.models.producto_stock import ProductoStock  # Asegúrate de que este modelo exista

# def buscar_producto(codigo):
#     producto = Producto.query.filter_by(codigo=codigo).first()
#     if producto:
#         return {
#             "nombre": producto.nombre,
#             "precio": producto.precios[0].precio_retail if producto.precios else None,
#             "imagen_url": producto.imagen_url,
#             "marca": producto.categoria_marca.marca.nombre if producto.categoria_marca else "Desconocida",
#             "tallas": [
#                 f"{stock.talla.talla_eur} (EUR), {stock.talla.talla_usa} (USA), {stock.talla.talla_cm} cm - {stock.stock} unidades"  # Cambiado de 'cantidad' a 'stock'
#                 for stock in producto.stock if stock.talla
#             ]
#         }
#     return None

# def vender_producto(codigo, cantidad, talla):
#     producto = Producto.query.filter_by(codigo=codigo).first()
#     if producto:
#         stock = ProductoStock.query.filter_by(producto_id=producto.id, talla=talla).first()
#         if stock and stock.cantidad >= cantidad:
#             # Actualizar el stock
#             stock.cantidad -= cantidad
#             # Aquí se puede agregar la lógica para registrar la venta en la base de datos
#             return {"mensaje": "Producto vendido con éxito", "nombre": producto.nombre, "precio": producto.precios[0].precio_retail if producto.precios else None, "cantidad": cantidad, "talla": talla}
#         else:
#             return {"mensaje": "Stock insuficiente para la talla seleccionada"}
#     else:
#         return {"mensaje": "Producto no encontrado"}


from flask import request
from app.models.producto import Producto

def obtener_producto_por_codigo(codigo):
    producto = Producto.query.filter_by(codigo=codigo).first()
    
    if not producto:
        return None
        
    producto_dict = {
        'id': producto.id,
        'codigo': producto.codigo,
        'nombre': producto.nombre,
        'marca': producto.categoria_marca.marca.nombre if producto.categoria_marca else "Desconocida",
        'imagen_url': f"{request.host_url}{producto.imagen_url}" if producto.imagen_url else None,
        'precios': {
            'retail': producto.precios[0].precio_retail if producto.precios else None,
            'regular': producto.precios[0].precio_regular if producto.precios else None,
            'online': producto.precios[0].precio_online if producto.precios else None,
            'promocion': producto.precios[0].precio_promocion if producto.precios else None,
        },
        'tallas': [
            {
                'talla_eur': stock.talla.talla_eur,
                'talla_usa': stock.talla.talla_usa,
                'talla_cm': stock.talla.talla_cm,
                'cantidad': stock.cantidad
            }
            for stock in producto.stock
        ]
    }
    
    return producto_dict