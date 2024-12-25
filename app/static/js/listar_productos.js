document.addEventListener("DOMContentLoaded", () => {
    const productosList = document.getElementById("productos-list");

    // Llamada a la API para obtener los productos
    fetch("/productos/")
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                data.productos.forEach((producto) => {
                    const row = document.createElement("tr");

                    row.innerHTML = `
              <td>
                <img
                  src="${producto.imagen_url}"
                  alt="${producto.nombre}"
                  class="product-img img-fluid rounded"
                  style="max-width: 150px; height: auto;"
                />
              </td>
              <td>${producto.nombre}</td>
              <td>${producto.id_categoria_marca}</td>
              <td>
                <span class="badge bg-light text-dark">Tallas no especificadas</span>
              </td>
            `;

                    productosList.appendChild(row);
                });
            } else {
                productosList.innerHTML = `
            <tr>
              <td colspan="4" class="text-center text-danger">Error al cargar los productos.</td>
            </tr>
          `;
            }
        })
        .catch((error) => {
            console.error("Error al obtener los productos:", error);
            productosList.innerHTML = `
          <tr>
            <td colspan="4" class="text-center text-danger">No se pudieron cargar los productos.</td>
          </tr>
        `;
        });
});