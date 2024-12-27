from app import db

class Marca(db.Model):
    __tablename__ = 'MARCA'

    id = db.Column('ID_MARCA', db.Integer, primary_key=True)
    nombre = db.Column('NOMBRE', db.String(100), nullable=False)
