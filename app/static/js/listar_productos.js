document.addEventListener("DOMContentLoaded", () => {
  const productosList = document.getElementById("productos-list");
  const buscarInput = document.querySelector(".search-container input");
  const columnaSelect = document.querySelector(".search-container select");
  const buscarButton = document.querySelector(".btn-search");
  const limpiarButton = document.getElementById("limpiar-btn");

  let productos = []; // Para almacenar los productos obtenidos

  // Lista de columnas para llenar dinámicamente el select
  const columnas = [
    { value: "codigo", label: "Código" },
    { value: "nombre", label: "Modelo" },
    { value: "marca", label: "Marca" },
    { value: "precio_retail", label: "Precio Retail" },
    { value: "precio_regular", label: "Precio Regular" },
    { value: "precio_online", label: "Precio Online" },
    { value: "talla_eur", label: "Talla EUR" },
    { value: "talla_usa", label: "Talla USA" },
    { value: "talla_cm", label: "Talla CM" },
    { value: "cantidad", label: "Unidades" },
  ];

  // Llenar dinámicamente el select de columnas
  function llenarSelectColumnas() {
    columnaSelect.innerHTML = '<option value="">Selecciona una columna</option>';
    columnas.forEach((columna) => {
      const option = document.createElement("option");
      option.value = columna.value;
      option.textContent = columna.label;
      columnaSelect.appendChild(option);
    });
  }

  llenarSelectColumnas();

  
  function renderProductos(productosFiltrados) {
    productosList.innerHTML = ""; // Limpiar la tabla antes de renderizar

    productosFiltrados.forEach((producto) => {
      // 1. Filtrar tallas con stock > 0
      const tallasConStock = producto.tallas.filter((t) => t.cantidad > 0);

      // 2. Si tallasConStock está vacío, significa que todas las tallas del producto tienen 0
      if (tallasConStock.length === 0) {
        // Mostramos una sola fila con “No hay stock”
        const noStockRow = document.createElement("tr");

        // El ROWSPAN será de 1, pero si quieres que ocupe el "espacio" de tallas, 
        // usas 1 para que no genere filas extras.
        noStockRow.innerHTML = `
          <td><img
              src="${producto.imagen_url}"
              alt="${producto.nombre}"
              class="product-img img-fluid rounded"
              style="max-width: 150px; height: auto;"
          /></td>
          <td>${producto.codigo || "N/A"}</td>
          <td>${producto.nombre}</td>
          <td>${producto.marca}</td>
          <td>${producto.precios.retail ? `S/${producto.precios.retail}` : "N/A"}</td>
          <td>${producto.precios.regular ? `S/${producto.precios.regular}` : "N/A"}</td>
          <td>${producto.precios.online ? `S/${producto.precios.online}` : "N/A"}</td>
          <td>-</td>  <!-- Talla EUR -->
          <td>-</td>  <!-- Talla USA -->
          <td>-</td>  <!-- Talla CM -->
          <td>No hay stock</td>
        `;

        productosList.appendChild(noStockRow);
        return; // Pasar al siguiente producto
      }

      // 3. Si hay tallas con stock > 0, las mostramos cada una en su propia fila,
      //    con la PRIMERA fila conteniendo la imagen/datos básicos (rowspan).
      // Calcular ROWSPAN = número de tallas con stock
      const rowSpan = tallasConStock.length;

      // Crear fila principal
      const mainRow = document.createElement("tr");
      // Insertamos celdas con ROWSPAN
      mainRow.innerHTML = `
        <td rowspan="${rowSpan}">
          <img
            src="${producto.imagen_url}"
            alt="${producto.nombre}"
            class="product-img img-fluid rounded"
            style="max-width: 150px; height: auto;"
          />
        </td>
        <td rowspan="${rowSpan}">${producto.codigo || "N/A"}</td>
        <td rowspan="${rowSpan}">${producto.nombre}</td>
        <td rowspan="${rowSpan}">${producto.marca}</td>
        <td rowspan="${rowSpan}">${producto.precios.retail ? `S/${producto.precios.retail}` : "N/A"}</td>
        <td rowspan="${rowSpan}">${producto.precios.regular ? `S/${producto.precios.regular}` : "N/A"}</td>
        <td rowspan="${rowSpan}">${producto.precios.online ? `S/${producto.precios.online}` : "N/A"}</td>
      `;

      // Añadir la primera talla con stock
      const firstSize = tallasConStock[0];
      mainRow.innerHTML += `
        <td>${firstSize.talla_eur || "N/A"}</td>
        <td>${firstSize.talla_usa || "N/A"}</td>
        <td>${firstSize.talla_cm || "N/A"}</td>
        <td>${firstSize.cantidad || "N/A"}</td>
      `;

      productosList.appendChild(mainRow);

      // 4. Para las tallas restantes, creamos filas extras
      for (let i = 1; i < tallasConStock.length; i++) {
        const talla = tallasConStock[i];
        const sizeRow = document.createElement("tr");
        sizeRow.innerHTML = `
          <td>${talla.talla_eur || "N/A"}</td>
          <td>${talla.talla_usa || "N/A"}</td>
          <td>${talla.talla_cm || "N/A"}</td>
          <td>${talla.cantidad || "N/A"}</td>
        `;
        productosList.appendChild(sizeRow);
      }
    });
  }


  // Filtrar productos en tiempo real por todas las columnas
  function filtrarPorTodasLasColumnas() {
    const query = buscarInput.value.toLowerCase();

    if (!query) {
      renderProductos(productos); // Si no hay filtro, mostrar todo
      return;
    }

    const productosFiltrados = productos.filter((producto) => {
      return (
        producto.codigo.toLowerCase().includes(query) ||
        producto.nombre.toLowerCase().includes(query) ||
        producto.marca.toLowerCase().includes(query) ||
        (producto.precios.retail?.toString().includes(query)) ||
        (producto.precios.regular?.toString().includes(query)) ||
        (producto.precios.online?.toString().includes(query)) ||
        producto.tallas.some((talla) =>
          talla.talla_eur.toLowerCase().includes(query) ||
          talla.talla_usa.toLowerCase().includes(query) ||
          talla.talla_cm.toString().includes(query) ||
          talla.cantidad.toString().includes(query)
        )
      );
    });

    renderProductos(productosFiltrados);
  }

  // Filtrar productos por columna seleccionada
  function filtrarPorColumna() {
    const columna = columnaSelect.value;
    const query = buscarInput.value.toLowerCase();

    if (!columna || !query) {
      renderProductos(productos); // Si no hay filtro, mostrar todo
      return;
    }

    const productosFiltrados = productos.filter((producto) => {
      if (columna === "codigo") {
        return producto.codigo.toLowerCase().includes(query);
      } else if (columna === "marca") {
        return producto.marca.toLowerCase().includes(query);
      } else if (columna === "nombre") {
        return producto.nombre.toLowerCase().includes(query);
      } else if (columna.startsWith("precio_")) {
        return producto.precios[columna.replace("precio_", "")]?.toString().includes(query);
      } else if (columna.startsWith("talla_")) {
        return producto.tallas.some((talla) =>
          talla[columna.replace("talla_", "")]?.toString().includes(query)
        );
      } else if (columna === "cantidad") {
        return producto.tallas.some((talla) =>
          talla.cantidad?.toString().includes(query)
        );
      }
      return false;
    });

    renderProductos(productosFiltrados);
  }

  // Limpiar filtros
  function limpiarFiltros() {
    buscarInput.value = "";
    columnaSelect.value = "";
    renderProductos(productos); // Mostrar todos los productos
  }

  // Obtener productos desde la API
  fetch("/listar_productos/")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        productos = data.productos; // Guardar productos en memoria
        renderProductos(productos); // Renderizar todos los productos al inicio
      } else {
        productosList.innerHTML = `
          <tr>
            <td colspan="11" class="text-center text-danger">
              Error al cargar los productos.
            </td>
          </tr>
        `;
      }
    })
    .catch((error) => {
      console.error("Error al obtener los productos:", error);
      productosList.innerHTML = `
        <tr>
          <td colspan="11" class="text-center text-danger">
            No se pudieron cargar los productos.
          </td>
        </tr>
      `;
    });

  // Evento para el campo de búsqueda (filtrar en tiempo real)
  buscarInput.addEventListener("input", filtrarPorTodasLasColumnas);

  // Evento para el botón de búsqueda (filtrar por columna seleccionada)
  buscarButton.addEventListener("click", filtrarPorColumna);

  // Evento para el botón de limpiar
  limpiarButton.addEventListener("click", limpiarFiltros);
});
