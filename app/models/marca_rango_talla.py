from app import db

class MarcaRangoTalla(db.Model):
    __tablename__ = 'MARCA_RANGO_TALLA'

    id = db.Column('ID_MARCA_RANGO_TALLA', db.Integer, primary_key=True)
    talla_eur = db.Column('TALLA_EUR', db.String(10), nullable=False)
    talla_usa = db.Column('TALLA_USA', db.String(10), nullable=False)
    talla_cm = db.Column('TALLA_CM', db.Float, nullable=False)
    id_marca = db.Column('ID_MARCA', db.Integer, db.ForeignKey('MARCA.ID_MARCA'), nullable=False)
    id_rango_edad = db.Column('ID_RANGO_EDAD', db.Integer, nullable=False)
