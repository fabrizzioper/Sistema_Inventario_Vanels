from app import db

class MovimientoStock(db.Model):
    __tablename__ = 'MOVIMIENTO_STOCK'

    id = db.Column('ID_MOVIMIENTO', db.Integer, primary_key=True)
    id_producto_stock = db.Column('ID_PRODUCTO_STOCK', db.Integer, db.ForeignKey('PRODUCTO_STOCK.ID_PRODUCTO_STOCK'), nullable=False)
    tipo_movimiento = db.Column('TIPO_MOVIMIENTO', db.String(1), nullable=False)  # 'E' para entrada
    cantidad = db.Column('CANTIDAD', db.Integer, nullable=False)
    precio_unitario = db.Column('PRECIO_UNITARIO', db.Float, nullable=False)
