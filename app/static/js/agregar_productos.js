// Variable global para almacenar los datos del producto
var productData = null;
// Objeto para almacenar las tallas obtenidas según la marca y clasificación
let tallasData = {};

/**
 * NUEVA FUNCIÓN para flujo de "Registro Automático"
 * - Oculta la tabla y el formulario (si estuvieran visibles)
 * - Muestra el buscador
 */
function registroAutomatico() {
    // Ocultamos el contenedor de resultados y el formulario, por si estaban abiertos
    document.getElementById('resultContainer').style.display = 'none';
    document.getElementById('tallasContainer').style.display = 'none';

    // Mostramos la sección de búsqueda
    document.getElementById('search-container').style.display = 'block';
}

/**
 * Función para ingresar manualmente
 * (Tú decides cómo manejar este flujo, por ahora un alert)
 */
function ingresarManual() {
    alert('Función de ingreso manual - En desarrollo');
}

/**
 * Función para buscar un producto por código
 */
async function buscarProducto() {
    const codigo = document.getElementById('codigoProducto').value;
    if (!codigo) {
        alert('Por favor ingrese un código de producto');
        return;
    }

    // Mostrar spinner de "Buscando..." y ocultar contenedores
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
            // Guardamos la info del producto en variable global
            productData = data;

            // Limpiamos la tabla de resultados
            const tabla = document.getElementById('resultadoTabla');
            tabla.innerHTML = '';

            // Creamos la fila y las celdas
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

            // Ocultamos el spinner y mostramos el contenedor de resultados
            document.getElementById('loading').style.display = 'none';
            document.getElementById('resultContainer').style.display = 'block';

            // AHORA se oculta el buscador y se muestra directamente el formulario
            document.getElementById('search-container').style.display = 'none';
            document.getElementById('tallasContainer').style.display = 'block';

            // Rellenamos el campo 'modeloInput' con el nombre del producto
            document.getElementById('modeloInput').value = productData.nombre;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        alert('Error al buscar el producto: ' + error.message);
        document.getElementById('loading').style.display = 'none';
    }
}

/**
 * Llenar los selectores (categoría, marca, clasificaciones) con datos que vienen de Flask
 */
function llenarSelectores(data) {
    // Selector de categorías
    const categoriaSelect = document.getElementById('categoriaSelect');
    categoriaSelect.innerHTML = '<option value="">Seleccione una categoría</option>';
    data.categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.ID_CATEGORIA;
        option.textContent = categoria.NOMBRE;
        categoriaSelect.appendChild(option);
    });

    // Selector de marcas
    const marcaSelect = document.getElementById('marcaSelect');
    marcaSelect.innerHTML = '<option value="">Seleccione una marca</option>';
    data.marcas.forEach(marca => {
        const option = document.createElement('option');
        option.value = marca.ID_MARCA;
        option.textContent = marca.NOMBRE;
        marcaSelect.appendChild(option);
    });

    // Selector de clasificaciones
    const tallasSelect = document.getElementById('tallasSelect');
    tallasSelect.innerHTML = '<option value="">Seleccione un rango de edad</option>';
    data.clasificaciones.forEach(clasificacion => {
        const option = document.createElement('option');
        option.value = clasificacion.DESCRIPCION.toLowerCase();
        option.textContent = clasificacion.DESCRIPCION;
        tallasSelect.appendChild(option);
    });
}

/**
 * Inicializar los datos de categorías, marcas, etc.
 */
async function inicializarDatosTallas() {
    try {
        const response = await fetch('/agregar_productos/obtener_datos');
        if (!response.ok) throw new Error('Error HTTP: ' + response.status);

        const data = await response.json();

        if (data.success) {
            // Llenar los selectores
            llenarSelectores(data);
        } else {
            alert('Error al cargar los datos de /obtener_datos.');
        }
    } catch (error) {
        alert('Error al conectar con el servidor: ' + error);
    }
}

/**
 * Cuando el DOM cargue, llamamos a inicializarDatosTallas()
 * y asignamos listeners a los selectores que necesiten acciones
 */
document.addEventListener('DOMContentLoaded', () => {
    inicializarDatosTallas();

    document.getElementById('categoriaSelect')
        .addEventListener('change', handleCategoriaChange);

    document.getElementById('marcaSelect')
        .addEventListener('change', obtenerTallasPorMarca);

    document.getElementById('tallasSelect')
        .addEventListener('change', mostrarTallas);
});

/**
 * Manejo del cambio de categoría:
 * - Si la categoría es ID=1 (por ejemplo, calzado), mostramos el contenedor de tallas
 * - De lo contrario, ocultamos
 */
function handleCategoriaChange(event) {
    const tallasCalzadoContainer = document.getElementById('tallasCalzadoContainer');
    const tallasSelect = document.getElementById('tallasSelect');

    // Supongamos que la categoría "1" corresponde a calzado
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

/**
 * Obtener tallas según la marca seleccionada (ruta Flask que filtra por marca)
 */
async function obtenerTallasPorMarca(event) {
    const idMarca = event.target.value;
    if (!idMarca) {
        // Si no hay marca seleccionada, limpias la tabla
        tallasData = {};
        document.getElementById('tallasTbody').innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`/agregar_productos/obtener_tallas_por_marca/${idMarca}`);
        if (!response.ok) throw new Error('Error HTTP: ' + response.status);

        const data = await response.json();
        if (data.success) {
            // Reconstruimos tallasData
            tallasData = {};
            data.tallas_por_rango.forEach(item => {
                // ej: item.rango_edad => "NIÑO", "ADULTO", etc.
                const key = item.rango_edad.toLowerCase();
                tallasData[key] = item.tallas; 
            });

            // Resetear el select y la tabla
            document.getElementById('tallasSelect').value = '';
            document.getElementById('tallasTbody').innerHTML = '';
        } else {
            alert('Error al cargar tallas para la marca seleccionada.');
        }
    } catch (error) {
        console.error('Error en obtenerTallasPorMarca:', error);
    }
}

/**
 * Mostrar las tallas de acuerdo a la clasificación seleccionada
 */
function mostrarTallas() {
    const clasificacion = document.getElementById('tallasSelect').value;
    const tallasTbody = document.getElementById('tallasTbody');
    tallasTbody.innerHTML = '';

    // Si no hay clasificación o no hay datos en tallasData, no hacemos nada
    if (!clasificacion || !tallasData[clasificacion]) return;

    // Generamos las filas con tallas y campos de cantidad
    tallasData[clasificacion].forEach(tallaObj => {
        const row = document.createElement('tr');
        row.className = 'talla-row';
        row.setAttribute('data-id-talla', tallaObj.idMarcaRangoTalla);

        // Celda de la talla
        const tdTalla = document.createElement('td');
        tdTalla.textContent = `Talla ${tallaObj.tallaEur}`;

        // Celda de la cantidad
        const tdCantidad = document.createElement('td');
        const cantidadInput = document.createElement('input');
        cantidadInput.type = 'number';
        cantidadInput.className = 'talla-cantidad form-control';
        cantidadInput.min = '0';
        cantidadInput.value = '0';
        cantidadInput.placeholder = 'Cantidad';

        tdCantidad.appendChild(cantidadInput);

        // Agregamos las celdas a la fila
        row.appendChild(tdTalla);
        row.appendChild(tdCantidad);

        // Insertamos la fila en el tbody
        tallasTbody.appendChild(row);
    });
}

/**
 * Función para cancelar/ocultar el formulario de tallas
 */
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

    // Aquí podrías opcionalmente volver a la pantalla de opciones:
    // document.getElementById('opcionesPrincipales').scrollIntoView();
}

/**
 * Limpiar campos de precios y fechas en el formulario
 */
function limpiarFormularioPrecios() {
    const campos = [
        'precioRetail',
        'precioRegular',
        'precioOnline',
        'precioCompra',
        'precioPromocion',
        'fechaInicioPromo',
        'fechaFinPromo'
    ];
    campos.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento) elemento.value = '';
    });
}

/**
 * Guardar las tallas (y el producto) usando la ruta Flask "/agregar_productos/guardar_productos"
 */
async function guardarTallas() {
    try {
        // 1. Obtener valores de categoría, modelo, marca
        const categoria = document.getElementById("categoriaSelect")?.value;
        const modelo = document.getElementById("modeloInput")?.value;
        const marca = document.getElementById("marcaSelect")?.value;

        if (!categoria || !modelo || !marca) {
            alert('Error: Faltan elementos básicos del formulario (categoría, modelo o marca).');
            return;
        }

        // 2. Obtener precios
        const precioRetail   = parseFloat(document.getElementById('precioRetail')?.value)   || 0;
        const precioRegular  = parseFloat(document.getElementById('precioRegular')?.value)  || 0;
        const precioOnline   = parseFloat(document.getElementById('precioOnline')?.value)   || 0;
        const precioCompra   = parseFloat(document.getElementById('precioCompra')?.value)   || 0;
        const precioPromocion = parseFloat(document.getElementById('precioPromocion')?.value) || null;
        const fechaInicioPromo = document.getElementById('fechaInicioPromo')?.value || null;
        const fechaFinPromo   = document.getElementById('fechaFinPromo')?.value   || null;

        if (!precioRetail || !precioRegular || !precioOnline || !precioCompra) {
            alert('Los precios (retail, regular, online y de compra) son obligatorios.');
            return;
        }

        if (precioPromocion) {
            if (!fechaInicioPromo || !fechaFinPromo) {
                alert('Si ingresa un precio de promoción, debe ingresar fechas de inicio y fin.');
                return;
            }
            if (new Date(fechaFinPromo) <= new Date(fechaInicioPromo)) {
                alert('La fecha de fin de promoción debe ser posterior a la de inicio.');
                return;
            }
        }

        // 3. Recopilar tallas seleccionadas (solo si la categoría es calzado, ID=1)
        const tallas = [];
        if (categoria === '1') {
            const tallasRows = document.querySelectorAll('.talla-row');
            tallasRows.forEach(row => {
                const idMarcaRangoTalla = row.getAttribute('data-id-talla');
                const tallaEur = row.querySelector('td:first-child')?.textContent.replace('Talla ', '');
                const cantidadInput = row.querySelector('.talla-cantidad');

                const cantidad = parseInt(cantidadInput.value) || 0;
                if (cantidad > 0 && idMarcaRangoTalla) {
                    tallas.push({
                        idMarcaRangoTalla: parseInt(idMarcaRangoTalla),
                        tallaEur,
                        cantidad: cantidad
                    });
                }
            });

            if (tallas.length === 0) {
                alert('Debe ingresar al menos una cantidad mayor a 0 en tallas.');
                return;
            }
        }

        // 4. Ajustar el código del producto (si es que usas productData)
        let codigoFiltrado = '';
        if (productData?.codigo) {
            codigoFiltrado = productData.codigo.trim();
            const espacioIndex = codigoFiltrado.indexOf(' ');
            if (espacioIndex !== -1) {
                codigoFiltrado = codigoFiltrado.substring(0, espacioIndex);
            }
        } else {
            // O puedes tomarlo del input #codigoManual si no quieres depender de productData
            alert('El código del producto no está definido en productData.');
            return;
        }

        // 5. Armar el objeto con toda la info
        const datosProducto = {
            codigo: codigoFiltrado,
            nombre: modelo,
            idCategoria: parseInt(categoria),
            idMarca: parseInt(marca),
            imagen_url: productData?.imagen || '',
            precios: {
                precioRetail,
                precioRegular,
                precioOnline,
                precioCompra,
                precioPromocion,
                fechaInicioPromo,
                fechaFinPromo
            },
            tallas: tallas
        };

        // 6. Enviar datos al servidor
        const response = await fetch('/agregar_productos/guardar_productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosProducto)
        });

        const result = await response.json();

        if (result.success) {
            alert('Producto guardado exitosamente');
            cancelarTallas(); // Ocultamos el formulario y limpiamos
        } else {
            alert('Error al guardar el producto: ' + result.error);
        }
    } catch (error) {
        console.error('Error al procesar el formulario:', error);
        alert('Error al guardar el producto: ' + error.message);
    }
}
