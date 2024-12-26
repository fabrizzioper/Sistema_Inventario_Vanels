from app import db

class MarcaRangoTalla(db.Model):
    __tablename__ = 'MARCA_RANGO_TALLA'

    id = db.Column('ID_MARCA_RANGO_TALLA', db.Integer, primary_key=True)
    talla_eur = db.Column('TALLA_EUR', db.String(10), nullable=False)
    talla_usa = db.Column('TALLA_USA', db.String(10), nullable=False)
    talla_cm = db.Column('TALLA_CM', db.Float, nullable=False)
    id_marca = db.Column('ID_MARCA', db.Integer, db.ForeignKey('MARCA.ID_MARCA'), nullable=False)
    id_rango_edad = db.Column('ID_RANGO_EDAD', db.Integer, nullable=False)

# class ProductoStock(db.Model):
#     __tablename__ = 'PRODUCTO_STOCK'

#     id = db.Column('ID_PRODUCTO_STOCK', db.Integer, primary_key=True)
#     id_producto = db.Column('ID_PRODUCTO', db.Integer, db.ForeignKey('PRODUCTOS.ID_PRODUCTO'), nullable=False)
#     id_marca_rango_talla = db.Column('ID_MARCA_RANGO_TALLA', db.Integer, db.ForeignKey('MARCA_RANGO_TALLA.ID_MARCA_RANGO_TALLA'), nullable=False)
#     cantidad = db.Column('CANTIDAD', db.Integer, default=0)

#     talla = db.relationship('MarcaRangoTalla', backref='producto_stock', lazy=True)

class ProductoStock(db.Model):
    __tablename__ = 'PRODUCTO_STOCK'

    id = db.Column('ID_PRODUCTO_STOCK', db.Integer, primary_key=True)
    id_producto = db.Column('ID_PRODUCTO', db.Integer, db.ForeignKey('PRODUCTOS.ID_PRODUCTO'), nullable=False)
    id_marca_rango_talla = db.Column('ID_MARCA_RANGO_TALLA', db.Integer, db.ForeignKey('MARCA_RANGO_TALLA.ID_MARCA_RANGO_TALLA'), nullable=False)
    cantidad = db.Column('CANTIDAD', db.Integer, default=0)
    precio_promedio = db.Column('PRECIO_PROMEDIO', db.Float, nullable=False, default=0.0)  

    talla = db.relationship('MarcaRangoTalla', backref='producto_stock', lazy=True)


class Producto(db.Model):
    __tablename__ = 'PRODUCTOS'

    id = db.Column('ID_PRODUCTO', db.Integer, primary_key=True)
    codigo = db.Column('CODIGO', db.String(50), nullable=False)
    nombre = db.Column('NOMBRE', db.String(100), nullable=False)
    id_categoria_marca = db.Column('ID_CATEGORIA_MARCA', db.Integer, db.ForeignKey('CATEGORIA_MARCA.ID_CATEGORIA_MARCA'), nullable=False)
    imagen_url = db.Column('IMAGEN_URL', db.String(255), nullable=True)

    # Relación con ProductoStock
    stock = db.relationship('ProductoStock', backref='producto', lazy=True)

    # Relación con PrecioVenta
    precios = db.relationship('PrecioVenta', backref='producto', lazy=True)

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

class CategoriaMarca(db.Model):
    __tablename__ = 'CATEGORIA_MARCA'

    id = db.Column('ID_CATEGORIA_MARCA', db.Integer, primary_key=True)
    id_categoria = db.Column('ID_CATEGORIA', db.Integer, db.ForeignKey('CATEGORIAS.ID_CATEGORIA'), nullable=False)
    id_marca = db.Column('ID_MARCA', db.Integer, db.ForeignKey('MARCA.ID_MARCA'), nullable=False)

    marca = db.relationship('Marca', backref='categoria_marcas', lazy=True)

class Marca(db.Model):
    __tablename__ = 'MARCA'

    id = db.Column('ID_MARCA', db.Integer, primary_key=True)
    nombre = db.Column('NOMBRE', db.String(100), nullable=False)

# class PrecioVenta(db.Model):
#     __tablename__ = 'PRECIO_VENTA'

#     id = db.Column('ID_PRECIO_VENTA', db.Integer, primary_key=True)
#     id_producto = db.Column('ID_PRODUCTO', db.Integer, db.ForeignKey('PRODUCTOS.ID_PRODUCTO'), nullable=False)
#     precio_retail = db.Column('PRECIO_RETAIL', db.Float, nullable=False)
#     precio_regular = db.Column('PRECIO_REGULAR', db.Float, nullable=False)
#     precio_online = db.Column('PRECIO_ONLINE', db.Float, nullable=False)


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
