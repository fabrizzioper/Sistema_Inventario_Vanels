from app import db

class PrecioVenta(db.Model):
    __tablename__ = 'PRECIO_VENTA'

    id = db.Column('ID_PRECIO_VENTA', db.Integer, primary_key=True)
    id_producto = db.Column('ID_PRODUCTO', db.Integer, db.ForeignKey('PRODUCTOS.ID_PRODUCTO'), nullable=False)
    precio_retail = db.Column('PRECIO_RETAIL', db.Float, nullable=False)
    precio_regular = db.Column('PRECIO_REGULAR', db.Float, nullable=False)
    precio_online = db.Column('PRECIO_ONLINE', db.Float, nullable=False)
    precio_promocion = db.Column('PRECIO_PROMOCION', db.Float, nullable=True)  # Agregar este campo
    fecha_ini_promocion = db.Column('FECHA_INI_PROMOCION', db.DateTime, nullable=True)
    fecha_fin_promocion = db.Column('FECHA_FIN_PROMOCION', db.DateTime, nullable=True)
    flag_activo = db.Column('FLAG_ACTIVO', db.Integer, nullable=True, default=1)
