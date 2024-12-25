from app import db

def get_db_connection():
    return db.session

