from app import db

class Producto(db.Model):
    __tablename__ = 'PRODUCTOS'

    id = db.Column('ID_PRODUCTO', db.Integer, primary_key=True)
    codigo = db.Column('CODIGO', db.String(50), nullable=False, unique=True)
    nombre = db.Column('NOMBRE', db.String(100), nullable=False)
    id_categoria_marca = db.Column('ID_CATEGORIA_MARCA', db.Integer, db.ForeignKey('CATEGORIA_MARCA.ID_CATEGORIA_MARCA'), nullable=False)
    imagen_url = db.Column('IMAGEN_URL', db.String(255), nullable=True)

    # Relación con ProductoStock
    stock = db.relationship('ProductoStock', backref='producto', lazy=True)

    # Relación con PrecioVenta
    precios = db.relationship('PrecioVenta', backref='producto', lazy=True)

    # Relación con PrecioCompraHistorica
    precios_compra = db.relationship('PrecioCompraHistorica', backref='producto', lazy=True)

    # Relación con CategoriaMarca
    categoria_marca = db.relationship('CategoriaMarca', backref='productos', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'codigo': self.codigo,
            'nombre': self.nombre,
            'imagen_url': self.imagen_url,
            'marca': self.categoria_marca.marca.nombre if self.categoria_marca else "Desconocida",
            'tallas': [
                f"{stock.talla.talla_eur} (EUR), {stock.talla.talla_usa} (USA), {stock.talla.talla_cm} cm - {stock.cantidad} unidades"
                for stock in self.stock if stock.talla
            ],
            'precios': {
                'retail': self.precios[0].precio_retail if self.precios else None,
                'regular': self.precios[0].precio_regular if self.precios else None,
                'online': self.precios[0].precio_online if self.precios else None,
            },
        }
