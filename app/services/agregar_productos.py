import os
import requests
from werkzeug.utils import secure_filename
from app.models.categoria import Categoria
from app.models.rango_edad import RangoEdad
from app.models.precio_compra_historica import PrecioCompraHistorica
from app.models.movimiento_stock import MovimientoStock
from app.models.marca_rango_talla import MarcaRangoTalla
from app.models.marca import Marca
from app.models.categoria_marca import CategoriaMarca
from app.models.producto import Producto
from app.models.precio_venta import PrecioVenta
from app.models.producto_stock import ProductoStock
from app import db
from flask import current_app

def obtener_datos_generales():
    """
    Recupera datos necesarios para llenar los selectores en el frontend.
    """
    try:
        # Consultar categorías
        categorias = Categoria.query.filter_by(flag_activo=1).all()
        categorias_resultado = [{'ID_CATEGORIA': c.id, 'NOMBRE': c.nombre} for c in categorias]

        # Consultar marcas
        marcas = Marca.query.all()
        marcas_resultado = [{'ID_MARCA': m.id, 'NOMBRE': m.nombre} for m in marcas]

        # Consultar clasificaciones (rangos de edad)
        rangos_edad = RangoEdad.query.all()
        rangos_resultado = [{'ID_RANGO_EDAD': r.id, 'DESCRIPCION': r.descripcion} for r in rangos_edad]

        # Consultar tallas agrupadas por rango de edad
        tallas_query = (
            db.session.query(
                RangoEdad.descripcion.label('rango_edad'),
                MarcaRangoTalla.id.label('idMarcaRangoTalla'),
                MarcaRangoTalla.talla_eur.label('tallaEur')
            )
            .join(RangoEdad, MarcaRangoTalla.id_rango_edad == RangoEdad.id)
            .order_by(RangoEdad.id, MarcaRangoTalla.id)
        ).all()

        tallas_dict = {}
        for fila in tallas_query:
            if fila.rango_edad not in tallas_dict:
                tallas_dict[fila.rango_edad] = []
            tallas_dict[fila.rango_edad].append({
                'idMarcaRangoTalla': fila.idMarcaRangoTalla,
                'tallaEur': fila.tallaEur
            })

        tallas_por_rango = [
            {'rango_edad': rango, 'tallas': tallas}
            for rango, tallas in tallas_dict.items()
        ]

        # Retornar los datos
        return {
            'categorias': categorias_resultado,
            'marcas': marcas_resultado,
            'clasificaciones': rangos_resultado,
            'tallas_por_rango': tallas_por_rango
        }

    except Exception as e:
        raise e

def obtener_tallas_por_marca(id_marca):
    """
    Recupera las tallas agrupadas por rango de edad para una marca específica.
    """
    try:
        tallas_query = (
            db.session.query(
                RangoEdad.descripcion.label('rango_edad'),
                MarcaRangoTalla.id.label('idMarcaRangoTalla'),
                MarcaRangoTalla.talla_eur.label('tallaEur')
            )
            .join(RangoEdad, MarcaRangoTalla.id_rango_edad == RangoEdad.id)
            .filter(MarcaRangoTalla.id_marca == id_marca)
            .order_by(RangoEdad.id, MarcaRangoTalla.id)
        ).all()

        tallas_dict = {}
        for fila in tallas_query:
            if fila.rango_edad not in tallas_dict:
                tallas_dict[fila.rango_edad] = []
            tallas_dict[fila.rango_edad].append({
                'idMarcaRangoTalla': fila.idMarcaRangoTalla,
                'tallaEur': fila.tallaEur
            })

        resultado = [
            {'rango_edad': rango, 'tallas': tallas}
            for rango, tallas in tallas_dict.items()
        ]

        return resultado
    except Exception as e:
        raise e
    
    
# def guardar_productos(data):
#     """
#     Lógica para guardar un producto y toda su información relacionada.
#     """
#     try:
#         # Utilizar directamente la URL de la imagen ya guardada
#         imagen_url = data.get('imagen_url')  # Esto es '/static/images/{codigo}.jpg'

#         # No es necesario volver a descargar y guardar la imagen
#         # Eliminar el bloque que usa requests.get

#         # 1. Obtener o validar ID_CATEGORIA_MARCA
#         categoria_marca = CategoriaMarca.query.filter_by(
#             id_categoria=data['idCategoria'],
#             id_marca=data['idMarca']
#         ).first()
#         if not categoria_marca:
#             raise ValueError('Combinación categoría-marca no encontrada')
        
#         # 2. Insertar en PRODUCTOS
#         nuevo_producto = Producto(
#             codigo=data['codigo'],
#             nombre=data['nombre'],
#             id_categoria_marca=categoria_marca.id,
#             imagen_url=imagen_url  # Guardar la URL correcta
#         )
#         db.session.add(nuevo_producto)
#         db.session.flush()  # Para obtener el ID del producto
        
#         nuevo_precio_venta = PrecioVenta(
#             id_producto=nuevo_producto.id,
#             precio_retail=data['precios']['precioRetail'],
#             precio_regular=data['precios']['precioRegular'],
#             precio_online=data['precios']['precioOnline'],
#             precio_promocion=data['precios']['precioPromocion'],
#             fecha_ini_promocion=data['precios']['fechaInicioPromo'],
#             fecha_fin_promocion=data['precios']['fechaFinPromo'],
#             flag_activo=1
#         )
#         db.session.add(nuevo_precio_venta)

#         # 4. Insertar en PRECIO_COMPRA_HISTORICA
#         nuevo_precio_compra = PrecioCompraHistorica(
#             id_producto=nuevo_producto.id,
#             precio_compra=data['precios']['precioCompra']
#         )
#         db.session.add(nuevo_precio_compra)

#         # 5. Insertar stock por cada talla y registrar movimiento
#         for talla in data['tallas']:
#             nuevo_producto_stock = ProductoStock(
#                 id_producto=nuevo_producto.id,
#                 id_marca_rango_talla=talla['idMarcaRangoTalla'],
#                 cantidad=talla['cantidad'],
#                 precio_promedio=data['precios']['precioCompra']
#             )
#             db.session.add(nuevo_producto_stock)
#             db.session.flush()  # Para obtener el ID de producto_stock

#             nuevo_movimiento_stock = MovimientoStock(
#                 id_producto_stock=nuevo_producto_stock.id,
#                 tipo_movimiento='E',
#                 cantidad=talla['cantidad'],
#                 precio_unitario=data['precios']['precioCompra']
#             )
#             db.session.add(nuevo_movimiento_stock)

#         # Confirmar transacción
#         db.session.commit()

#         return {
#             'message': 'Producto guardado exitosamente',
#             'id_producto': nuevo_producto.id,
#             'ruta_imagen': imagen_url  # Retornar la URL relativa
#         }
#     except Exception as e:
#         db.session.rollback()
#         raise e


def guardar_productos(data):
    """
    Lógica para guardar un producto y toda su información relacionada.
    """
    try:
        # Utilizar directamente la URL de la imagen ya guardada
        imagen_url = data.get('imagen_url')  # Esto es '/static/images/{codigo}.jpg'

        # 1. Obtener o validar ID_CATEGORIA_MARCA
        categoria_marca = CategoriaMarca.query.filter_by(
            id_categoria=data['idCategoria'],
            id_marca=data['idMarca']
        ).first()
        if not categoria_marca:
            raise ValueError('Combinación categoría-marca no encontrada')
        
        # 2. Insertar en PRODUCTOS
        nuevo_producto = Producto(
            codigo=data['codigo'],
            nombre=data['nombre'],
            id_categoria_marca=categoria_marca.id,
            imagen_url=imagen_url  # Guardar la URL correcta
        )
        db.session.add(nuevo_producto)
        db.session.flush()  # Para obtener el ID del producto
        
        nuevo_precio_venta = PrecioVenta(
            id_producto=nuevo_producto.id,
            precio_retail=data['precios']['precioRetail'],
            precio_regular=data['precios']['precioRegular'],
            precio_online=data['precios']['precioOnline'],
            precio_promocion=data['precios']['precioPromocion'],
            fecha_ini_promocion=data['precios']['fechaInicioPromo'],
            fecha_fin_promocion=data['precios']['fechaFinPromo'],
            flag_activo=1
        )
        db.session.add(nuevo_precio_venta)

        # 4. Insertar en PRECIO_COMPRA_HISTORICA
        nuevo_precio_compra = PrecioCompraHistorica(
            id_producto=nuevo_producto.id,
            precio_compra=data['precios']['precioCompra']
        )
        db.session.add(nuevo_precio_compra)

        # 5. Insertar stock por cada talla y registrar movimiento
        for talla in data['tallas']:
            nuevo_producto_stock = ProductoStock(
                id_producto=nuevo_producto.id,
                id_marca_rango_talla=talla['idMarcaRangoTalla'],
                cantidad=talla['cantidad'],
                precio_promedio=data['precios']['precioCompra']
            )
            db.session.add(nuevo_producto_stock)
            db.session.flush()  # Para obtener el ID de producto_stock

            nuevo_movimiento_stock = MovimientoStock(
                id_producto_stock=nuevo_producto_stock.id,
                tipo_movimiento='E',
                cantidad=talla['cantidad'],
                precio_unitario=data['precios']['precioCompra']
            )
            db.session.add(nuevo_movimiento_stock)

        # Confirmar transacción
        db.session.commit()

        return {
            'message': 'Producto guardado exitosamente',
            'id_producto': nuevo_producto.id,
            'ruta_imagen': imagen_url  # Retornar la URL relativa
        }
    except Exception as e:
        db.session.rollback()
        raise e
