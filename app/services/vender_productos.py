from flask import request, jsonify
from app.models.producto import Producto
from app.models.producto_stock import ProductoStock
from app.models.movimiento_stock import MovimientoStock
from app import db
from app.models.marca import Marca
from app.models.categoria import Categoria
from app.models.precio_venta import PrecioVenta
from app.models.categoria_marca import CategoriaMarca
from app.models.precio_compra_historica import PrecioCompraHistorica


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
        "marca": (
            {
                "id_marca": producto.categoria_marca.marca.id,
                "nombre": producto.categoria_marca.marca.nombre,
            }
            if producto.categoria_marca
            else None
        ),
        "imagen_url": (
            f"{request.host_url}{producto.imagen_url}" 
            if producto.imagen_url else None
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
            if stock.cantidad > 0  # <-- FILTRO: solo stock > 0
        ],
    }

    return producto_dict

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
        "marca": (
            {
                "id_marca": producto.categoria_marca.marca.id,
                "nombre": producto.categoria_marca.marca.nombre,
            }
            if producto.categoria_marca
            else None
        ),
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
    - Si 'nuevaCantidad' es None => No se hace nada (no se actualiza).
    - Si 'nuevaCantidad' es 0 => Se pone stock = 0 (en vez de eliminar la fila).
    - De lo contrario => Se reemplaza el stock con 'nuevaCantidad'.
    """

    try:
        if "idProducto" not in producto_data:
            return {"success": False, "message": "No se proporcionó idProducto"}

        producto_id = producto_data["idProducto"]
        producto = Producto.query.get(producto_id)
        if not producto:
            return {"success": False, "message": "Producto no encontrado en la BD"}

        # Actualizar datos del producto (código, nombre, etc.)
        producto.codigo = producto_data["codigo"]
        producto.nombre = producto_data["nombre"]

        # Vincular con CATEGORIA_MARCA
        marca_id = producto_data["marcaId"]
        categoria_id = producto_data["categoriaSelect"]
        cat_marca = CategoriaMarca.query.filter_by(
            id_marca=marca_id,
            id_categoria=categoria_id
        ).first()
        if not cat_marca:
            return {
                "success": False,
                "message": "La combinación de marca y categoría no existe en la tabla CATEGORIA_MARCA",
            }
        producto.id_categoria_marca = cat_marca.id

        # Manejo de precios de venta
        precio_venta = PrecioVenta.query.filter_by(id_producto=producto.id).first()
        if precio_venta:
            precio_venta.precio_regular = producto_data["precioRegular"]
            precio_venta.precio_online = producto_data["precioOnline"]
            precio_venta.precio_promocion = producto_data["precioPromo"]
        else:
            nuevo_precio = PrecioVenta(
                id_producto=producto.id,
                precio_regular=producto_data["precioRegular"],
                precio_online=producto_data["precioOnline"],
                precio_promocion=producto_data["precioPromo"],
                flag_activo=1
            )
            db.session.add(nuevo_precio)

        # Registrar compra en PRECIO_COMPRA_HISTORICA
        nueva_compra = PrecioCompraHistorica(
            id_producto=producto.id,
            precio_compra=producto_data["precioCompra"]
        )
        db.session.add(nueva_compra)

        # Tallas EXISTENTES
        for talla in producto_data.get("tallasExistentes", []):
            pstk = ProductoStock.query.filter_by(
                id_producto=producto.id,
                id_marca_rango_talla=talla["idMarcaRangoTalla"]
            ).first()

            if not pstk:
                continue

            nueva_cantidad = talla["nuevaCantidad"]  # puede ser int, 0, None

            # 1) Si es None -> no hacer nada
            if nueva_cantidad is None:
                continue

            # 2) Si es 0 -> ponemos stock en 0 (no se borra la fila)
            if nueva_cantidad == 0:
                stock_anterior = pstk.cantidad
                pstk.cantidad = 0
                # Registrar movimiento de salida si antes había stock
                diferencia = 0 - stock_anterior
                if diferencia < 0:
                    mov = MovimientoStock(
                        id_producto_stock=pstk.id,
                        tipo_movimiento='S',
                        cantidad=abs(diferencia),
                        precio_unitario=producto_data["precioCompra"]
                    )
                    db.session.add(mov)
                continue

            # 3) Reemplazar stock normalmente
            stock_anterior = pstk.cantidad
            pstk.cantidad = nueva_cantidad

            diferencia = nueva_cantidad - stock_anterior
            if diferencia != 0:
                tipo_mov = "E" if diferencia > 0 else "S"
                mov = MovimientoStock(
                    id_producto_stock=pstk.id,
                    tipo_movimiento=tipo_mov,
                    cantidad=abs(diferencia),
                    precio_unitario=producto_data["precioCompra"]
                )
                db.session.add(mov)

        # Tallas NUEVAS
        for talla in producto_data.get("tallasAgregadas", []):
            pstk_existente = ProductoStock.query.filter_by(
                id_producto=producto.id,
                id_marca_rango_talla=talla["idMarcaRangoTalla"]
            ).first()

            nueva_cantidad = talla["nuevaCantidad"]

            if nueva_cantidad is None:
                # Ignorar
                continue

            if nueva_cantidad == 0:
                # No crear nada con 0
                continue

            # Si ya existía
            if pstk_existente:
                stock_anterior = pstk_existente.cantidad
                pstk_existente.cantidad = nueva_cantidad
                diferencia = nueva_cantidad - stock_anterior
                if diferencia != 0:
                    tipo_mov = "E" if diferencia > 0 else "S"
                    mov = MovimientoStock(
                        id_producto_stock=pstk_existente.id,
                        tipo_movimiento=tipo_mov,
                        cantidad=abs(diferencia),
                        precio_unitario=producto_data["precioCompra"]
                    )
                    db.session.add(mov)
            else:
                # Crear registro
                nuevo_pstk = ProductoStock(
                    id_producto=producto.id,
                    id_marca_rango_talla=talla["idMarcaRangoTalla"],
                    cantidad=nueva_cantidad
                )
                db.session.add(nuevo_pstk)
                db.session.flush()

                mov = MovimientoStock(
                    id_producto_stock=nuevo_pstk.id,
                    tipo_movimiento="E",
                    cantidad=nueva_cantidad,
                    precio_unitario=producto_data["precioCompra"]
                )
                db.session.add(mov)

        db.session.commit()
        return {"success": True, "message": "Producto actualizado correctamente"}

    except Exception as e:
        db.session.rollback()
        return {"success": False, "message": f"Error al actualizar producto: {str(e)}"}

    """
    Si 'nuevaCantidad' es None => Se ignora (no se actualiza el stock).
    Si 'nuevaCantidad' es 0    => Se elimina la talla (DELETE en PRODUCTO_STOCK).
    Caso contrario            => Se reemplaza el stock con 'nuevaCantidad'.
    """

    try:
        # 1) Verificar si el producto existe
        if "idProducto" not in producto_data:
            return {"success": False, "message": "No se proporcionó idProducto"}

        producto_id = producto_data["idProducto"]
        producto = Producto.query.get(producto_id)
        if not producto:
            return {"success": False, "message": "Producto no encontrado en la BD"}

        # 2) Actualizar datos básicos
        producto.codigo = producto_data["codigo"]
        producto.nombre = producto_data["nombre"]

        # 3) Vincular con CATEGORIA_MARCA
        marca_id = producto_data["marcaId"]
        categoria_id = producto_data["categoriaSelect"]
        cat_marca = CategoriaMarca.query.filter_by(
            id_marca=marca_id,
            id_categoria=categoria_id
        ).first()
        if not cat_marca:
            return {
                "success": False,
                "message": "La combinación de marca y categoría no existe en la tabla CATEGORIA_MARCA",
            }
        producto.id_categoria_marca = cat_marca.id

        # 4) Manejo de precios de venta
        precio_venta = PrecioVenta.query.filter_by(id_producto=producto.id).first()
        if precio_venta:
            precio_venta.precio_regular = producto_data["precioRegular"]
            precio_venta.precio_online = producto_data["precioOnline"]
            precio_venta.precio_promocion = producto_data["precioPromo"]
        else:
            nuevo_precio = PrecioVenta(
                id_producto=producto.id,
                precio_regular=producto_data["precioRegular"],
                precio_online=producto_data["precioOnline"],
                precio_promocion=producto_data["precioPromo"],
                flag_activo=1
            )
            db.session.add(nuevo_precio)

        # 5) Registrar compra en PRECIO_COMPRA_HISTORICA
        nueva_compra = PrecioCompraHistorica(
            id_producto=producto.id,
            precio_compra=producto_data["precioCompra"]
        )
        db.session.add(nueva_compra)

        # =============== Tallas EXISTENTES ===============
        for talla in producto_data.get("tallasExistentes", []):
            pstk = ProductoStock.query.filter_by(
                id_producto=producto.id,
                id_marca_rango_talla=talla["idMarcaRangoTalla"]
            ).first()

            if not pstk:
                # Si no existe el registro en BD (raro pero posible), lo ignoramos
                continue

            nueva_cantidad = talla["nuevaCantidad"]  # puede ser int, 0, o None

            # 1) Si es None -> no hacemos nada
            if nueva_cantidad is None:
                continue

            # 2) Si es 0 -> eliminar la talla de PRODUCTO_STOCK
            if nueva_cantidad == 0:
                db.session.delete(pstk)
                # Opcional: podrías registrar un movimiento 'Salida' de todo el stock que había
                # si stock_anterior > 0. Depende de tu necesidad de histórico.
                continue

            # 3) Caso normal: reemplazar stock
            stock_anterior = pstk.cantidad
            pstk.cantidad = nueva_cantidad

            # Generar movimiento (si deseas histórico)
            diferencia = nueva_cantidad - stock_anterior
            if diferencia != 0:
                tipo_mov = "E" if diferencia > 0 else "S"
                mov = MovimientoStock(
                    id_producto_stock=pstk.id,
                    tipo_movimiento=tipo_mov,
                    cantidad=abs(diferencia),
                    precio_unitario=producto_data["precioCompra"]
                )
                db.session.add(mov)

        # =============== Tallas NUEVAS ===============
        for talla in producto_data.get("tallasAgregadas", []):
            pstk_existente = ProductoStock.query.filter_by(
                id_producto=producto.id,
                id_marca_rango_talla=talla["idMarcaRangoTalla"]
            ).first()

            nueva_cantidad = talla["nuevaCantidad"]

            # 1) Si es None, ignorar (no creamos nada)
            if nueva_cantidad is None:
                continue

            # 2) Si es 0, tampoco creamos nada
            if nueva_cantidad == 0:
                continue  # no creamos PSTK con stock 0

            # 3) Si ya existía (caso raro), aplicamos la misma lógica: reemplazar
            if pstk_existente:
                stock_anterior = pstk_existente.cantidad
                pstk_existente.cantidad = nueva_cantidad
                diferencia = nueva_cantidad - stock_anterior
                if diferencia != 0:
                    tipo_mov = "E" if diferencia > 0 else "S"
                    mov = MovimientoStock(
                        id_producto_stock=pstk_existente.id,
                        tipo_movimiento=tipo_mov,
                        cantidad=abs(diferencia),
                        precio_unitario=producto_data["precioCompra"]
                    )
                    db.session.add(mov)
            else:
                # No existía, creamos el registro con nueva_cantidad
                nuevo_pstk = ProductoStock(
                    id_producto=producto.id,
                    id_marca_rango_talla=talla["idMarcaRangoTalla"],
                    cantidad=nueva_cantidad
                )
                db.session.add(nuevo_pstk)
                db.session.flush()

                # Registrar movimiento de entrada, p.ej.
                mov = MovimientoStock(
                    id_producto_stock=nuevo_pstk.id,
                    tipo_movimiento="E",
                    cantidad=nueva_cantidad,
                    precio_unitario=producto_data["precioCompra"]
                )
                db.session.add(mov)

        db.session.commit()
        return {"success": True, "message": "Producto actualizado correctamente"}

    except Exception as e:
        db.session.rollback()
        return {"success": False, "message": f"Error al actualizar producto: {str(e)}"}
