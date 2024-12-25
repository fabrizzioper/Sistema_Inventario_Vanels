

// document.addEventListener("DOMContentLoaded", () => {
//   const productosList = document.getElementById("productos-list");

//   fetch("/productos/")
//     .then((response) => response.json())
//     .then((data) => {
//       if (data.success) {
//         data.productos.forEach((producto) => {
//           const row = document.createElement("tr");

//           // Parse size information
//           const sizeInfo = parseSizeInfo(producto.tallas[0]); // Assuming first talla contains full info

//           // Format prices
//           const retailPrice = producto.precios.retail ? `$${producto.precios.retail}` : 'N/A';
//           const regularPrice = producto.precios.regular ? `$${producto.precios.regular}` : 'N/A';
//           const onlinePrice = producto.precios.online ? `$${producto.precios.online}` : 'N/A';

//           row.innerHTML = `
//             <td>
//               <img
//                 src="${producto.imagen_url}"
//                 alt="${producto.nombre}"
//                 class="product-img img-fluid rounded"
//                 style="max-width: 150px; height: auto;"
//               />
//             </td>
//             <td>${producto.nombre}</td>
//             <td>${producto.marca}</td>
//             <td>${sizeInfo.eurSize || 'N/A'}</td>
//             <td>${sizeInfo.usaSize || 'N/A'}</td>
//             <td>${sizeInfo.cmSize || 'N/A'}</td>
//             <td>${sizeInfo.units || 'N/A'}</td>
//             <td>
//               <div>Retail: ${retailPrice}</div>
//               <div>Regular: ${regularPrice}</div>
//               <div>Online: ${onlinePrice}</div>
//             </td>
//           `;

//           productosList.appendChild(row);
//         });
//       } else {
//         productosList.innerHTML = `
//           <tr>
//             <td colspan="8" class="text-center text-danger">
//               Error al cargar los productos.
//             </td>
//           </tr>
//         `;
//       }
//     })
//     .catch((error) => {
//       console.error("Error al obtener los productos:", error);
//       productosList.innerHTML = `
//         <tr>
//           <td colspan="8" class="text-center text-danger">
//             No se pudieron cargar los productos.
//           </td>
//         </tr>
//       `;
//     });
// });

// // Helper function to parse size information from the talla string
// function parseSizeInfo(tallaString) {
//   // Example format: "38.5 (EUR), 8Y (USA), 24.7 cm - 4 unidades"
//   const result = {
//     eurSize: null,
//     usaSize: null,
//     cmSize: null,
//     units: null
//   };

//   try {
//     // Extract EUR size
//     const eurMatch = tallaString.match(/(\d+\.?\d*)\s*\(EUR\)/);
//     if (eurMatch) result.eurSize = eurMatch[1];

//     // Extract USA size
//     const usaMatch = tallaString.match(/(\d+\.?\d*\w*)\s*\(USA\)/);
//     if (usaMatch) result.usaSize = usaMatch[1];

//     // Extract CM size
//     const cmMatch = tallaString.match(/(\d+\.?\d*)\s*cm/);
//     if (cmMatch) result.cmSize = cmMatch[1];

//     // Extract units
//     const unitsMatch = tallaString.match(/(\d+)\s*unidades/);
//     if (unitsMatch) result.units = unitsMatch[1];
//   } catch (error) {
//     console.error("Error parsing size information:", error);
//   }

//   return result;
// }



document.addEventListener("DOMContentLoaded", () => {
  const productosList = document.getElementById("productos-list");

  fetch("/productos/")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        data.productos.forEach((producto) => {
          const row = document.createElement("tr");

          // Parse size information
          const sizeInfo = parseSizeInfo(producto.tallas[0]); // Assuming first talla contains full info

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
            <td>${producto.marca}</td>
            <td>${sizeInfo.eurSize || 'N/A'}</td>
            <td>${sizeInfo.usaSize || 'N/A'}</td>
            <td>${sizeInfo.cmSize || 'N/A'}</td>
            <td>${sizeInfo.units || 'N/A'}</td>
            <td>${producto.precios.retail ? `S/${producto.precios.retail}` : 'N/A'}</td>
            <td>${producto.precios.regular ? `S/${producto.precios.regular}` : 'N/A'}</td>
            <td>${producto.precios.online ? `S/${producto.precios.online}` : 'N/A'}</td>
          `;

          productosList.appendChild(row);
        });
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
});

// Helper function to parse size information from the talla string
function parseSizeInfo(tallaString) {
  const result = {
    eurSize: null,
    usaSize: null,
    cmSize: null,
    units: null
  };

  try {
    // Extract EUR size
    const eurMatch = tallaString.match(/(\d+\.?\d*)\s*\(EUR\)/);
    if (eurMatch) result.eurSize = eurMatch[1];

    // Extract USA size
    const usaMatch = tallaString.match(/(\d+\.?\d*\w*)\s*\(USA\)/);
    if (usaMatch) result.usaSize = usaMatch[1];

    // Extract CM size
    const cmMatch = tallaString.match(/(\d+\.?\d*)\s*cm/);
    if (cmMatch) result.cmSize = cmMatch[1];

    // Extract units
    const unitsMatch = tallaString.match(/(\d+)\s*unidades/);
    if (unitsMatch) result.units = unitsMatch[1];
  } catch (error) {
    console.error("Error parsing size information:", error);
  }

  return result;
}
