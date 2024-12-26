from app import db

class Categoria(db.Model):
    __tablename__ = 'CATEGORIAS'

    id = db.Column('ID_CATEGORIA', db.Integer, primary_key=True)
    nombre = db.Column('NOMBRE', db.String(50), nullable=False)
    flag_activo = db.Column('FLAG_ACTIVO', db.Integer, nullable=False, default=1)

class RangoEdad(db.Model):
    __tablename__ = 'RANGO_EDAD'

    id = db.Column('ID_RANGO_EDAD', db.Integer, primary_key=True)
    descripcion = db.Column('DESCRIPCION', db.String(20), nullable=False)

class MovimientoStock(db.Model):
    __tablename__ = 'MOVIMIENTO_STOCK'

    id = db.Column('ID_MOVIMIENTO', db.Integer, primary_key=True)
    id_producto_stock = db.Column('ID_PRODUCTO_STOCK', db.Integer, db.ForeignKey('PRODUCTO_STOCK.ID_PRODUCTO_STOCK'), nullable=False)
    tipo_movimiento = db.Column('TIPO_MOVIMIENTO', db.String(1), nullable=False)  # 'E' para entrada
    cantidad = db.Column('CANTIDAD', db.Integer, nullable=False)
    precio_unitario = db.Column('PRECIO_UNITARIO', db.Float, nullable=False)

class PrecioCompraHistorica(db.Model):
    __tablename__ = 'PRECIO_COMPRA_HISTORICA'

    id = db.Column('ID_PRECIO_COMPRA', db.Integer, primary_key=True)
    id_producto = db.Column('ID_PRODUCTO', db.Integer, db.ForeignKey('PRODUCTOS.ID_PRODUCTO'), nullable=False)
    precio_compra = db.Column('PRECIO_COMPRA', db.Float, nullable=False)
    fecha_registro = db.Column('FECHA_REGISTRO', db.DateTime, nullable=False, server_default=db.func.now())
