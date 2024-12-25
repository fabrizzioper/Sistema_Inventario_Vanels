from app import db

class Producto(db.Model):
    __tablename__ = 'PRODUCTOS'

    id = db.Column('ID_PRODUCTO', db.Integer, primary_key=True)
    codigo = db.Column('CODIGO', db.String(50), nullable=False)
    nombre = db.Column('NOMBRE', db.String(100), nullable=False)
    id_categoria_marca = db.Column('ID_CATEGORIA_MARCA', db.Integer, nullable=False)
    imagen_url = db.Column('IMAGEN_URL', db.String(255), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'codigo': self.codigo,
            'nombre': self.nombre,
            'id_categoria_marca': self.id_categoria_marca,
            'imagen_url': self.imagen_url
        }
