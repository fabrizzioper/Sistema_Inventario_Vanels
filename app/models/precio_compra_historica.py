from app import db

class PrecioCompraHistorica(db.Model):
    __tablename__ = 'PRECIO_COMPRA_HISTORICA'

    id = db.Column('ID_PRECIO_COMPRA', db.Integer, primary_key=True)
    id_producto = db.Column('ID_PRODUCTO', db.Integer, db.ForeignKey('PRODUCTOS.ID_PRODUCTO'), nullable=False)
    precio_compra = db.Column('PRECIO_COMPRA', db.Float, nullable=False)
    fecha_registro = db.Column('FECHA_REGISTRO', db.DateTime, nullable=False, server_default=db.func.now())
