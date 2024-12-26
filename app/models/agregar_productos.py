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
