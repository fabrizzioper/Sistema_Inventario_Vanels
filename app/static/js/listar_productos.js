document.addEventListener("DOMContentLoaded", () => {
  const productosList = document.getElementById("productos-list");
  const buscarInput = document.querySelector(".search-container input");
  const columnaSelect = document.querySelector(".search-container select");
  const buscarButton = document.querySelector(".btn-search");
  const limpiarButton = document.getElementById("limpiar-btn"); // Botón de limpiar

  let productos = []; // Para almacenar los productos obtenidos

  // Lista de columnas para llenar dinámicamente el select
  const columnas = [
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

  // Función para renderizar productos
  function renderProductos(productosFiltrados) {
    productosList.innerHTML = ""; // Limpiar la tabla antes de renderizar

    productosFiltrados.forEach((producto) => {
      const mainRow = document.createElement("tr");

      mainRow.innerHTML = `
        <td rowspan="${producto.tallas.length}">
          <img
            src="${producto.imagen_url}"
            alt="${producto.nombre}"
            class="product-img img-fluid rounded"
            style="max-width: 150px; height: auto;"
          />
        </td>
        <td rowspan="${producto.tallas.length}">${producto.nombre}</td>
        <td rowspan="${producto.tallas.length}">${producto.marca}</td>
        <td rowspan="${producto.tallas.length}">${producto.precios.retail ? `S/${producto.precios.retail}` : "N/A"}</td>
        <td rowspan="${producto.tallas.length}">${producto.precios.regular ? `S/${producto.precios.regular}` : "N/A"}</td>
        <td rowspan="${producto.tallas.length}">${producto.precios.online ? `S/${producto.precios.online}` : "N/A"}</td>
      `;

      const firstSize = producto.tallas[0];
      mainRow.innerHTML += `
        <td>${firstSize.talla_eur || "N/A"}</td>
        <td>${firstSize.talla_usa || "N/A"}</td>
        <td>${firstSize.talla_cm || "N/A"}</td>
        <td>${firstSize.cantidad || "N/A"}</td>
      `;

      productosList.appendChild(mainRow);

      for (let i = 1; i < producto.tallas.length; i++) {
        const talla = producto.tallas[i];
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

  // Función para filtrar productos
  function filtrarProductos() {
    const columna = columnaSelect.value;
    const query = buscarInput.value.toLowerCase();

    if (!columna || !query) {
      renderProductos(productos); // Si no hay filtro, mostrar todo
      return;
    }

    const productosFiltrados = productos.filter((producto) => {
      if (columna === "marca") {
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

  // Función para limpiar los filtros
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
            <td colspan="10" class="text-center text-danger">
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
          <td colspan="10" class="text-center text-danger">
            No se pudieron cargar los productos.
          </td>
        </tr>
      `;
    });

  // Evento para el botón de búsqueda
  buscarButton.addEventListener("click", filtrarProductos);

  // Evento para el botón de limpiar
  limpiarButton.addEventListener("click", limpiarFiltros);
});
