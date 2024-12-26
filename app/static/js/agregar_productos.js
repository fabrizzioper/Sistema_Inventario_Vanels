var productData = null;
let tallasData = {};

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


async function obtenerTallasPorMarca(event) {
    const idMarca = event.target.value; // ID_MARCA del <option>
    if (!idMarca) {
        // Si el usuario selecciona "Seleccione una marca", limpias la tabla:
        tallasData = {};
        document.getElementById('tallasTbody').innerHTML = '';
        return;
    }

    try {
        // Llamar a la ruta Flask que filtra por marca:
        const response = await fetch(`/agregar_productos/obtener_tallas_por_marca/${idMarca}`);
        if (!response.ok) throw new Error('Error HTTP: ' + response.status);

        const data = await response.json();
        if (data.success) {
            // tallas_por_rango = [ {rango_edad, tallas: [{idMarcaRangoTalla, tallaEur}]} ]
            // Reconstruimos tallasData
            tallasData = {};
            data.tallas_por_rango.forEach(item => {
                // item.rango_edad => "NIÑO", "ADULTO", etc.
                const key = item.rango_edad.toLowerCase();
                tallasData[key] = item.tallas;
            });

            // Opcional: si quieres resetear el select de rango de edad
            document.getElementById('tallasSelect').value = '';
            document.getElementById('tallasTbody').innerHTML = '';
        } else {
            alert('Error al cargar tallas para la marca seleccionada.');
        }

    } catch (error) {
        console.error('Error en obtenerTallasPorMarca:', error);
    }
}



function mostrarTallas() {
    const clasificacion = document.getElementById('tallasSelect').value;
    const tallasTbody = document.getElementById('tallasTbody');
    tallasTbody.innerHTML = '';

    if (!clasificacion || !tallasData[clasificacion]) return;

    tallasData[clasificacion].forEach(tallaObj => {
        const row = document.createElement('tr');
        row.className = 'talla-row';

        // Guarda ID en data attribute
        row.setAttribute('data-id-talla', tallaObj.idMarcaRangoTalla);

        // Creación de celdas
        const tdCheck = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'talla-checkbox';

        const tdTalla = document.createElement('td');
        tdTalla.textContent = `Talla ${tallaObj.tallaEur}`;

        const tdCantidad = document.createElement('td');
        const cantidadInput = document.createElement('input');
        cantidadInput.type = 'number';
        cantidadInput.className = 'talla-cantidad';
        cantidadInput.min = '0';
        cantidadInput.disabled = true;
        cantidadInput.placeholder = 'Cantidad';

        checkbox.addEventListener('change', () => {
            cantidadInput.disabled = !checkbox.checked;
            if (!checkbox.checked) {
                cantidadInput.value = '';
            }
        });

        tdCheck.appendChild(checkbox);
        tdCantidad.appendChild(cantidadInput);

        row.appendChild(tdCheck);
        row.appendChild(tdTalla);
        row.appendChild(tdCantidad);

        tallasTbody.appendChild(row);
    });
}

function cancelarTallas() {
    const tallasContainer = document.getElementById('tallasContainer');
    const tallasCalzadoContainer = document.getElementById('tallasCalzadoContainer');
    const tallasTbody = document.getElementById('tallasTbody');
    const tallasSelect = document.getElementById('tallasSelect');

    if (tallasContainer) tallasContainer.style.display = 'none';
    if (tallasCalzadoContainer) tallasCalzadoContainer.style.display = 'none';
    if (tallasTbody) tallasTbody.innerHTML = '';
    if (tallasSelect) tallasSelect.value = '';

    limpiarFormularioPrecios();
}

function limpiarFormularioPrecios() {
    const campos = ['precioRetail', 'precioRegular', 'precioOnline',
        'precioCompra', 'precioPromocion', 'fechaInicioPromo',
        'fechaFinPromo'];

    campos.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento) elemento.value = '';
    });
}



function validarPrecio(input) {
    const valor = parseFloat(input.value);
    if (valor < 0) {
        alert('El precio no puede ser negativo');
        input.value = '';
    }
}

// Event listeners para la validación de precios
document.addEventListener('DOMContentLoaded', function() {
    const preciosInputs = [
        'precioRetail', 
        'precioRegular', 
        'precioOnline', 
        'precioCompra', 
        'precioPromocion'
    ];
    
    preciosInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('change', function() {
                validarPrecio(this);
            });
        }
    });

    // Event listener para validar fechas de promoción
    const precioPromocion = document.getElementById('precioPromocion');
    if (precioPromocion) {
        precioPromocion.addEventListener('input', function() {
            const fechaInicio = document.getElementById('fechaInicioPromo');
            const fechaFin = document.getElementById('fechaFinPromo');
            
            if (this.value) {
                fechaInicio.required = true;
                fechaFin.required = true;
            } else {
                fechaInicio.required = false;
                fechaFin.required = false;
                fechaInicio.value = '';
                fechaFin.value = '';
            }
        });
    }
});

// Nueva función para limpiar los campos de precios
function limpiarFormularioPrecios() {
    document.getElementById('precioRetail').value = '';
    document.getElementById('precioRegular').value = '';
    document.getElementById('precioOnline').value = '';
    document.getElementById('precioCompra').value = '';
    document.getElementById('precioPromocion').value = '';
    document.getElementById('fechaInicioPromo').value = '';
    document.getElementById('fechaFinPromo').value = '';
}