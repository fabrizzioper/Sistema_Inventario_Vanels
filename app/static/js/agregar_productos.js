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

// Evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    inicializarDatosTallas();

    document.getElementById('categoriaSelect')
            .addEventListener('change', handleCategoriaChange);

    // Cuando el usuario cambie de marca, llamamos a obtenerTallasPorMarca
    document.getElementById('marcaSelect')
            .addEventListener('change', obtenerTallasPorMarca);

    document.getElementById('tallasSelect')
            .addEventListener('change', mostrarTallas);
});


function registrarTallas() {
    if (!productData) {
        alert('Primero busque un producto.');
        return;
    }
    document.getElementById('modeloInput').value = productData.nombre;
    document.getElementById('tallasContainer').style.display = 'block';
}

// Función para manejar la petición de /agregar_producto/obtener_datos e inicializar datos
async function inicializarDatosTallas() {
    // Antes limpiabas tallasData, pero ya no es necesario hacerlo aquí
    // (lo harás cuando el usuario elija la marca).

    try {
        const response = await fetch('/agregar_productos/obtener_datos');
        if (!response.ok) throw new Error('Error HTTP: ' + response.status);

        const data = await response.json();

        if (data.success) {
            // Llenar selectores de categorías y marcas
            llenarSelectores(data);
            // Ojo: data.tallas_por_rango ya no lo usaríamos aquí
            // porque iremos a buscar tallas dinámicamente en otra ruta.
        } else {
            alert('Error al cargar los datos de /obtener_datos.');
        }
    } catch (error) {
        alert('Error al conectar con el servidor: ' + error);
    }
}


// Llenar los selectores con la información de categorías, marcas, clasificaciones
function llenarSelectores(data) {
    const categoriaSelect = document.getElementById('categoriaSelect');
    categoriaSelect.innerHTML = '<option value="">Seleccione una categoría</option>';
    data.categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.ID_CATEGORIA;
        option.textContent = categoria.NOMBRE;
        categoriaSelect.appendChild(option);
    });

    const marcaSelect = document.getElementById('marcaSelect');
    marcaSelect.innerHTML = '<option value="">Seleccione una marca</option>';
    data.marcas.forEach(marca => {
        const option = document.createElement('option');
        option.value = marca.ID_MARCA;
        option.textContent = marca.NOMBRE;
        marcaSelect.appendChild(option);
    });

    const tallasSelect = document.getElementById('tallasSelect');
    tallasSelect.innerHTML = '<option value="">Seleccione un rango de edad</option>';
    data.clasificaciones.forEach(clasificacion => {
        const option = document.createElement('option');
        option.value = clasificacion.DESCRIPCION.toLowerCase();
        option.textContent = clasificacion.DESCRIPCION;
        tallasSelect.appendChild(option);
    });
}

function handleCategoriaChange(event) {
    const tallasCalzadoContainer = document.getElementById('tallasCalzadoContainer');
    const tallasSelect = document.getElementById('tallasSelect');

    if (event.target.value === '1') {
        tallasCalzadoContainer.style.display = 'block';
        tallasSelect.removeAttribute('disabled');
    } else {
        tallasCalzadoContainer.style.display = 'none';
        tallasSelect.setAttribute('disabled', 'disabled');
        tallasSelect.value = '';
        document.getElementById('tallasTbody').innerHTML = '';
    }
}