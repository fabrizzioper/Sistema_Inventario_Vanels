from app import db

class Categoria(db.Model):
    __tablename__ = 'CATEGORIAS'

    id = db.Column('ID_CATEGORIA', db.Integer, primary_key=True)
    nombre = db.Column('NOMBRE', db.String(50), nullable=False)
    flag_activo = db.Column('FLAG_ACTIVO', db.Integer, nullable=False, default=1)
