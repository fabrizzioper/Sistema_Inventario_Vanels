from flask import request, jsonify
from app.models.producto import Producto
from app.models.producto_stock import ProductoStock
from app.models.movimiento_stock import MovimientoStock
from app import db
from app.models.marca import Marca
from app.models.categoria import Categoria
from app.models.precio_venta import PrecioVenta

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

def actualizar_producto_y_stock(producto_data):
    """
    Actualiza un producto y su stock basado en los datos recibidos
    
    Args:
        producto_data (dict): Datos del producto a actualizar con estructura:
            {
                "idProducto": int,
                "codigo": str,
                "nombre": str,
                "marcaId": int,
                "marcaSelect": str,
                "categoriaSelect": str,
                "precioCompra": float,
                "precioRegular": float,
                "precioOnline": float,
                "precioPromo": float,
                "tallasExistentes": [
                    {
                        "idMarcaRangoTalla": int,
                        "stockAnterior": int,
                        "nuevaCantidad": int
                    }
                ],
                "tallasAgregadas": [
                    {
                        "idMarcaRangoTalla": int,
                        "stockAnterior": int,
                        "nuevaCantidad": int
                    }
                ]
            }
            
    Returns:
        dict: Resultado de la operación
    """
    try:
        # Actualizar datos básicos del producto
        producto = Producto.query.get(producto_data['idProducto'])
        if not producto:
            return {"success": False, "message": "Producto no encontrado"}
            
        producto.codigo = producto_data['codigo']
        producto.nombre = producto_data['nombre']
        producto.marca_id = producto_data['marcaId']
        producto.categoria_id = producto_data['categoriaSelect']
        
        # Actualizar precios
        precio_venta = PrecioVenta.query.filter_by(producto_id=producto.id).first()
        if precio_venta:
            precio_venta.precio_compra = producto_data['precioCompra']
            precio_venta.precio_regular = producto_data['precioRegular']
            precio_venta.precio_online = producto_data['precioOnline']
            precio_venta.precio_promo = producto_data['precioPromo']
        else:
            nuevo_precio = PrecioVenta(
                producto_id=producto.id,
                precio_compra=producto_data['precioCompra'],
                precio_regular=producto_data['precioRegular'],
                precio_online=producto_data['precioOnline'],
                precio_promo=producto_data['precioPromo']
            )
            db.session.add(nuevo_precio)
            
        # Actualizar stock de tallas existentes
        for talla in producto_data['tallasExistentes']:
            producto_stock = ProductoStock.query.filter_by(
                producto_id=producto.id,
                marca_rango_talla_id=talla['idMarcaRangoTalla']
            ).first()
            
            if producto_stock:
                producto_stock.stock = talla['nuevaCantidad']
                
        # Agregar nuevas tallas
        for talla in producto_data['tallasAgregadas']:
            nuevo_stock = ProductoStock(
                producto_id=producto.id,
                marca_rango_talla_id=talla['idMarcaRangoTalla'],
                stock=talla['nuevaCantidad']
            )
            db.session.add(nuevo_stock)
            
        db.session.commit()
        return {"success": True, "message": "Producto actualizado correctamente"}
        
    except Exception as e:
        db.session.rollback()
        return {"success": False, "message": f"Error al actualizar producto: {str(e)}"}
