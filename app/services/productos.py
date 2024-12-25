from app.models.productos import Producto

def obtener_productos():
    productos = Producto.query.all()
    productos_list = []
    for producto in productos:
        producto_dict = producto.to_dict()
        producto_dict['imagen_url'] = f"http://127.0.0.1:5000/{producto_dict['imagen_url']}"

        # Imprimir información detallada
        print(f"Producto: {producto.nombre}")
        print(f"Marca: {producto_dict['marca']}")
        print(f"Tallas: {producto_dict['tallas']}")
        print(f"Precios: {producto_dict['precios']}")

        productos_list.append(producto_dict)
    return productos_list
