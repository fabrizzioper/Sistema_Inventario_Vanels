from app import db

class ProductoStock(db.Model):
    __tablename__ = 'PRODUCTO_STOCK'

    id = db.Column('ID_PRODUCTO_STOCK', db.Integer, primary_key=True)
    id_producto = db.Column('ID_PRODUCTO', db.Integer, db.ForeignKey('PRODUCTOS.ID_PRODUCTO'), nullable=False)
    id_marca_rango_talla = db.Column('ID_MARCA_RANGO_TALLA', db.Integer, db.ForeignKey('MARCA_RANGO_TALLA.ID_MARCA_RANGO_TALLA'), nullable=False)
    cantidad = db.Column('CANTIDAD', db.Integer, default=0)
    precio_promedio = db.Column('PRECIO_PROMEDIO', db.Float, nullable=False, default=0.0)  

    talla = db.relationship('MarcaRangoTalla', backref='producto_stock', lazy=True)
