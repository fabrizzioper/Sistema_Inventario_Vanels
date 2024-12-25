from app.models.productos import Producto

def obtener_productos():
    productos = Producto.query.all()
    productos_list = []
    for producto in productos:
        producto_dict = producto.to_dict()
        producto_dict['imagen_url'] = f"http://127.0.0.1:5000/{producto_dict['imagen_url']}"
        productos_list.append(producto_dict)
    return productos_list
