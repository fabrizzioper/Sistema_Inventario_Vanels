from flask import request, jsonify
from app.models.producto import Producto
from app.models.producto_stock import ProductoStock
from app.models.movimiento_stock import MovimientoStock
from app import db
from app.models.marca import Marca
from app.models.categoria import Categoria

def obtener_marcas():
    return Marca.query.all()

def obtener_categorias():
    return Categoria.query.all()

def obtener_producto_por_codigo(codigo):
    producto = Producto.query.filter_by(codigo=codigo).first()

    if not producto:
        return None

    producto_dict = {
        "id": producto.id,
        "codigo": producto.codigo,
        "nombre": producto.nombre,
        "categoria": (
            producto.categoria_marca.categoria.nombre
            if producto.categoria_marca and producto.categoria_marca.categoria
            else "Desconocida"
        ),
        "marca": {
            "id_marca": producto.categoria_marca.marca.id,
            "nombre": producto.categoria_marca.marca.nombre
        } if producto.categoria_marca else None,
        "imagen_url": (
            f"{request.host_url}{producto.imagen_url}" if producto.imagen_url else None
        ),
        "precios": {
            "retail": producto.precios[0].precio_retail if producto.precios else None,
            "regular": producto.precios[0].precio_regular if producto.precios else None,
            "online": producto.precios[0].precio_online if producto.precios else None,
            "promocion": (
                producto.precios[0].precio_promocion if producto.precios else None
            ),
            "precio_compra": (
                producto.precios_compra[0].precio_compra
                if producto.precios_compra
                else None
            ),
        },
        "tallas": [
            {
                "talla_eur": stock.talla.talla_eur,
                "talla_usa": stock.talla.talla_usa,
                "talla_cm": stock.talla.talla_cm,
                "cantidad": stock.cantidad,
                "id_marca_rango_talla": stock.id_marca_rango_talla,
                "id_producto_stock": stock.id,
            }
            for stock in producto.stock
        ],
    }

    return producto_dict
