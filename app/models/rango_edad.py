from app import db

class RangoEdad(db.Model):
    __tablename__ = 'RANGO_EDAD'

    id = db.Column('ID_RANGO_EDAD', db.Integer, primary_key=True)
    descripcion = db.Column('DESCRIPCION', db.String(20), nullable=False)
