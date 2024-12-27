from app import db

class CategoriaMarca(db.Model):
    __tablename__ = 'CATEGORIA_MARCA'

    id = db.Column('ID_CATEGORIA_MARCA', db.Integer, primary_key=True)
    id_categoria = db.Column('ID_CATEGORIA', db.Integer, db.ForeignKey('CATEGORIAS.ID_CATEGORIA'), nullable=False)
    id_marca = db.Column('ID_MARCA', db.Integer, db.ForeignKey('MARCA.ID_MARCA'), nullable=False)

    marca = db.relationship('Marca', backref='categoria_marcas', lazy=True)
