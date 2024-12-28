document.getElementById('venderForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const codigo = document.getElementById('codigo').value;

    fetch('/vender_productos/buscar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'codigo': codigo
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.producto) {
            document.getElementById('nombre').innerText = data.producto.nombre;
            document.getElementById('precio').innerText = data.producto.precios.retail;
            document.getElementById('imagen').src = data.producto.imagen_url;
            document.getElementById('marca').innerText = data.producto.marca;
            document.getElementById('stock').innerText = data.producto.tallas.join(', ');

            const tallaSelect = document.getElementById('talla');
            tallaSelect.innerHTML = ''; // Limpiar opciones anteriores
            data.producto.tallas.forEach(talla => {
                const option = document.createElement('option');
                option.value = talla; // Asignar valor de talla
                option.textContent = talla; // Mostrar talla
                tallaSelect.appendChild(option);
            });

            document.getElementById('productoDetalles').style.display = 'block';
            document.getElementById('venderButton').onclick = function() {
                venderProducto(codigo);
            };
        } else {
            document.getElementById('resultado').innerText = data.mensaje;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

function venderProducto(codigo) {
    const cantidad = document.getElementById('cantidad').value;
    const talla = document.getElementById('talla').value;

    fetch('/vender_productos/vender', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'codigo': codigo,
            'cantidad': cantidad,
            'talla': talla
        })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('resultado').innerText = data.mensaje;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
