from flask import request
from app.models.listar_productos import Producto


def obtener_productos():
    productos = Producto.query.all()
    productos_list = []

    for producto in productos:
        producto_dict = {
            'id': producto.id,
            'codigo': producto.codigo,  # Agregar el campo código aquí
            'nombre': producto.nombre,
            'marca': producto.categoria_marca.marca.nombre if producto.categoria_marca else "Desconocida",
            'imagen_url': f"{request.host_url}{producto.imagen_url}" if producto.imagen_url else None,
            'precios': {
                'retail': producto.precios[0].precio_retail if producto.precios else None,
                'regular': producto.precios[0].precio_regular if producto.precios else None,
                'online': producto.precios[0].precio_online if producto.precios else None,
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
        productos_list.append(producto_dict)

    return productos_list

