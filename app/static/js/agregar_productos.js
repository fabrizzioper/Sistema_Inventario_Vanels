var productData = null;

async function buscarProducto() {
    const codigo = document.getElementById('codigoProducto').value;
    if (!codigo) {
        alert('Por favor ingrese un código de producto');
        return;
    }

    // Mostrar loading y ocultar resultados anteriores
    document.getElementById('loading').style.display = 'block';
    document.getElementById('resultContainer').style.display = 'none';
    document.getElementById('tallasContainer').style.display = 'none';

    try {
        const response = await fetch('/buscar_producto/buscar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ codigo: codigo })
        });

        const data = await response.json();

        if (data.success) {
            productData = data; // Guardamos los datos del producto

            // Limpiar tabla
            const tabla = document.getElementById('resultadoTabla');
            tabla.innerHTML = '';

            // Crear nueva fila
            const fila = tabla.insertRow();

            // Celda de imagen
            const celdaImagen = fila.insertCell();
            const imagen = document.createElement('img');
            imagen.src = data.imagen;
            imagen.alt = 'Producto';
            celdaImagen.appendChild(imagen);

            // Celda de nombre
            const celdaNombre = fila.insertCell();
            celdaNombre.textContent = data.nombre;

            // Celda de marca
            const celdaMarca = fila.insertCell();
            celdaMarca.textContent = data.marca;

            // Mostrar resultados y ocultar loading
            document.getElementById('loading').style.display = 'none';
            document.getElementById('resultContainer').style.display = 'block';
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        alert('Error al buscar el producto: ' + error.message);
        document.getElementById('loading').style.display = 'none';
    }
}

function ingresarManual() {
    // Aquí irá la lógica para ingresar de manera manual
    alert('Función de ingreso manual - En desarrollo');
}