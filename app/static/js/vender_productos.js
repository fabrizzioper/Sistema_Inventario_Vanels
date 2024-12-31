document.addEventListener("DOMContentLoaded", () => {
  const containerParent = document.getElementById("container-wrapper");

  // ------------------- Plantillas de tallas -------------------

  // Plantilla para el contenedor de tallas existentes (2 botones: Editar y Guardar)
  const existingSizeContainerTemplate = `
    <div class="row size-container mb-3">
      <div class="col-12 col-md-3 mb-2">
        <label class="form-label">Tallas</label>
        <select class="form-select select-size" disabled>
          <option value="">Seleccionar Talla</option>
        </select>
      </div>
      <div class="col-12 col-md-3 mb-2">
        <label class="form-label">Stock</label>
        <input
          type="text"
          class="form-control input-stock"
          placeholder="Stock"
          disabled
        />
      </div>
      <div class="col-12 col-md-3 mb-2">
        <label class="form-label">Nueva cantidad</label>
        <input
          type="number"
          class="form-control input-quantity"
          placeholder="Nueva cantidad"
          min="1"
          disabled
        />
      </div>

      <!-- Botón Editar -->
      <div class="col-12 col-md-3 mt-2 d-flex align-items-center">
        <button
          type="button"
          class="btn btn-warning btn-sm btn-edit w-100 me-2"
        >
          <i class="fas fa-pencil-alt me-1"></i>
        </button>
        <button
          type="button"
          class="btn btn-primary btn-sm btn-save w-100"
          disabled
        >
          <i class="fas fa-save"></i>
        </button>
      </div>
    </div>
  `;

  // Plantilla para el contenedor de tallas agregadas dinámicamente (3 botones: Editar, Guardar y Eliminar)
  const addedSizeContainerTemplate = `
    <div class="row size-container mb-3">
      <div class="col-12 col-md-4 mb-2">
        <label class="form-label">Tallas</label>
        <select class="form-select select-size" disabled>
          <option value="">Seleccionar Talla</option>
        </select>
      </div>
      <div class="col-12 col-md-4 mb-2">
        <label class="form-label">Stock</label>
        <input
          type="text"
          class="form-control input-stock"
          placeholder="Stock"
          disabled
        />
      </div>
      <div class="col-12 col-md-4 mb-2">
        <label class="form-label">Nueva cantidad</label>
        <input
          type="number"
          class="form-control input-quantity"
          placeholder="Nueva cantidad"
          min="1"
          disabled
        />
      </div>

      <!-- Botones Editar, Guardar y Eliminar -->
      <div class="col-12 col-md-4 mt-2 d-flex align-items-center">
        <button
          type="button"
          class="btn btn-warning btn-sm btn-edit w-100 me-2"
        >
          <i class="fas fa-pencil-alt me-1"></i>
        </button>
        <button
          type="button"
          class="btn btn-primary btn-sm btn-save w-100 me-2"
          disabled
        >
          <i class="fas fa-save"></i>
        </button>
        <button
          type="button"
          class="btn btn-danger btn-sm btn-remove-size w-100"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;

  // ------------------- Cargar datos del producto -------------------

  const loadProductData = (card, productData) => {
    // Cargar imagen
    const imageContainer = card.querySelector(".product-image");
    const productImage = imageContainer.querySelector("img");
    const imagePlaceholder = imageContainer.querySelector(".image-placeholder");

    if (productData.imagen_url) {
      productImage.src = productData.imagen_url;
      productImage.style.display = "block";
      imagePlaceholder.style.display = "none";
    } else {
      productImage.style.display = "none";
      imagePlaceholder.style.display = "block";
    }

    // Cargar datos básicos y precio de compra
    card.querySelector(".input-purchase-price").value =
      productData.precios.precio_compra;
    card.querySelector(".input-codigo").value = productData.codigo;
    card.querySelector(".input-name").value = productData.nombre;

    card.querySelector(".input-regular-price").value =
      productData.precios.regular;
    card.querySelector(".input-online-price").value =
      productData.precios.online;
    card.querySelector(".input-promo-price").value =
      productData.precios.promocion || "";

    // Selects de Marca y Categoría
    const brandSelect = card.querySelector(".input-brand");
    const categorySelect = card.querySelector(".input-category");

    // Verificar y establecer Marca (si coincide con los <option>)
    const brandOption = Array.from(brandSelect.options).find(
      (option) =>
        option.text.trim().toLowerCase() ===
        productData.marca.nombre.trim().toLowerCase()
    );

    if (brandOption) {
      brandSelect.disabled = false; // Habilitar temporalmente
      brandSelect.value = brandOption.value;
      brandSelect.disabled = true;  // Deshabilitar nuevamente
    } else {
      console.warn(
        `Marca con nombre "${productData.marca.nombre}" no encontrada.`
      );
    }

    // Verificar y establecer Categoría (si coincide con los <option>)
    const categoryOption = Array.from(categorySelect.options).find(
      (option) =>
        option.text.trim().toLowerCase() ===
        productData.categoria.trim().toLowerCase()
    );

    if (categoryOption) {
      categorySelect.disabled = false; // Habilitar temporalmente
      categorySelect.value = categoryOption.value;
      categorySelect.disabled = true;  // Deshabilitar nuevamente
    } else {
      console.warn(
        `Categoría con nombre "${productData.categoria}" no encontrada.`
      );
    }

    // Almacenar id_marca y id_producto en atributos de datos
    card.dataset.idMarca = productData.marca.id_marca;
    card.dataset.idProducto = productData.id_producto || productData.id || "";

    // Secciones de tallas
    const sizesSection = card.querySelector(".sizes-section");
    const existingSizesList = card.querySelector(".existing-sizes-list");
    const addedSizesList = card.querySelector(".added-sizes-list");

    existingSizesList.innerHTML = ""; // Limpiar tallas existentes
    addedSizesList.innerHTML = "";    // Limpiar tallas agregadas

    // Cargar tallas existentes
    productData.tallas.forEach((talla) => {
      const sizeContainer = document.createElement("div");
      sizeContainer.innerHTML = existingSizeContainerTemplate;
      const sizeRow = sizeContainer.firstElementChild;

      const selectSize = sizeRow.querySelector(".select-size");
      selectSize.innerHTML = '<option value="">Seleccionar Talla</option>';

      // Creamos la opción con "idMarcaRangoTalla|stock"
      const option = document.createElement("option");
      option.value = `${talla.id_marca_rango_talla}|${talla.cantidad}`;
      option.textContent = `EUR ${talla.talla_eur || "No disponible"}`;
      selectSize.appendChild(option);
      selectSize.value = option.value;
      selectSize.disabled = true;

      // Stock actual
      const stockInput = sizeRow.querySelector(".input-stock");
      stockInput.value = talla.cantidad;

      // Nueva cantidad (empieza vacía, habilitable al editar)
      const quantityInput = sizeRow.querySelector(".input-quantity");
      quantityInput.value = "";
      quantityInput.disabled = true;

      // Añadimos la fila de talla existente
      existingSizesList.appendChild(sizeRow);
    });

    // Mostrar secciones
    sizesSection.classList.remove("d-none");
    card.querySelector(".details-section").classList.remove("d-none");
  };

  // ------------------- Búsqueda de producto -------------------

  const searchProduct = async (codigo) => {
    try {
      const response = await fetch(`/vender_productos/${codigo}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }
      return data.data;
    } catch (error) {
      throw error;
    }
  };

  // ------------------- Habilitar / Deshabilitar campos del detalle -------------------

  const enableFields = (card) => {
    const fields = card.querySelectorAll(
      ".input-purchase-price, .input-promo-price, .input-online-price, .input-regular-price, .input-category, .input-brand, .input-name, .input-codigo"
    );
    fields.forEach((field) => {
      field.disabled = false;
    });
  };

  const disableFields = (card) => {
    const fields = card.querySelectorAll(
      ".input-purchase-price, .input-promo-price, .input-online-price, .input-regular-price, .input-category, .input-brand, .input-name, .input-codigo"
    );
    fields.forEach((field) => {
      field.disabled = true;
    });
  };

  // ------------------- Validar campos (ejemplo genérico) -------------------

  const validateFields = (card) => {
    const requiredFields = [
      card.querySelector(".input-product-code"),
      card.querySelector(".input-name"),
      card.querySelector(".input-regular-price"),
      card.querySelector(".input-online-price"),
      card.querySelector(".input-promo-price"),
      card.querySelector(".input-purchase-price"),
      card.querySelector(".input-brand"),
      card.querySelector(".input-category"),
    ];

    for (const field of requiredFields) {
      if (!field) continue; // Evitar errores si no existe algún campo
      if (field.tagName === "SELECT") {
        if (!field.value) {
          return false;
        }
      } else {
        if (!field.value.trim()) {
          return false;
        }
      }
    }
    return true;
  };

  // ------------------- Agregar Talla Dinámica -------------------

  const addSizeDynamically = (card, idMarca) => {
    const addedSizesList = card.querySelector(".added-sizes-list");

    // Crear un nuevo contenedor de talla
    const sizeContainer = document.createElement("div");
    sizeContainer.innerHTML = addedSizeContainerTemplate;
    const sizeRow = sizeContainer.firstElementChild;

    // Habilitar select al hacer clic en "Editar"
    const selectSize = sizeRow.querySelector(".select-size");
    selectSize.disabled = true; // se activará en "Editar"

    // Remover el campo de stock (porque es nueva talla)
    const stockDiv = sizeRow.querySelector(".input-stock").parentElement;
    stockDiv.remove();

    // Campo oculto para stock con valor 0 por defecto
    const hiddenStockInput = document.createElement("input");
    hiddenStockInput.type = "hidden";
    hiddenStockInput.classList.add("input-stock-hidden");
    hiddenStockInput.value = "0";
    sizeRow.appendChild(hiddenStockInput);

    addedSizesList.appendChild(sizeRow);

    // Mostrar un "Cargando tallas..." antes de la respuesta
    const loadingOption = document.createElement("option");
    loadingOption.textContent = "Cargando tallas...";
    loadingOption.disabled = true;
    loadingOption.selected = true;
    selectSize.appendChild(loadingOption);

    // Llamar a la API para obtener tallas de la marca
    fetch(`/vender_productos/obtener_tallas_por_marca/${idMarca}`)
      .then((response) => response.json())
      .then((data) => {
        selectSize.innerHTML = '<option value="">Seleccionar Talla</option>';
        if (data.success && data.tallas_por_rango.length > 0) {
          data.tallas_por_rango.forEach((rango) => {
            rango.tallas.forEach((talla) => {
              const option = document.createElement("option");
              option.value = `${talla.idMarcaRangoTalla}|${talla.cantidad}`;
              if (talla.tallaEur) {
                option.textContent = `EUR ${talla.tallaEur}`;
              }
              selectSize.appendChild(option);
            });
          });
        } else {
          const noSizesOption = document.createElement("option");
          noSizesOption.textContent = "No se encontraron tallas.";
          noSizesOption.disabled = true;
          noSizesOption.selected = true;
          selectSize.appendChild(noSizesOption);
        }
      })
      .catch((error) => {
        console.error("Error al obtener las tallas:", error);
        selectSize.innerHTML = '<option value="">Error al cargar tallas</option>';
      });
  };

  // ------------------- Listeners de eventos -------------------

  const attachEventListeners = () => {
    containerParent.addEventListener("click", async (event) => {
      const target = event.target;
      const card = target.closest(".card");
      if (!card) return;

      // Botón Buscar
      if (target.closest(".btn-search")) {
        const productCodeInput = card.querySelector(".input-product-code");
        const enteredCode = productCodeInput.value.trim();
        if (!enteredCode) {
          alert("Por favor, ingrese un código de producto.");
          return;
        }
        try {
          const productData = await searchProduct(enteredCode);
          loadProductData(card, productData);
        } catch (error) {
          alert(error.message || "Error al buscar el producto");
        }
      }

      // Botón "Datos" (habilita campos)
      if (target.closest(".btn-datos")) {
        enableFields(card);
        const guardarButton = card.querySelector(".btn-guardar");
        if (guardarButton) {
          guardarButton.disabled = false;
        }
      }

      // Botón "Guardar" en la sección detalles
      if (target.closest(".btn-guardar")) {
        const isValid = validateFields(card);
        if (!isValid) {
          alert(
            "Por favor, complete todos los campos requeridos antes de guardar."
          );
          return;
        }
        disableFields(card);
        const guardarButton = card.querySelector(".btn-guardar");
        if (guardarButton) {
          guardarButton.disabled = true;
        }
      }

      // Botón Editar en tallas EXISTENTES
      if (target.closest(".existing-sizes-list .btn-edit")) {
        const sizeRow = target.closest(".size-container");
        const quantityInput = sizeRow.querySelector(".input-quantity");
        const btnSave = sizeRow.querySelector(".btn-save");
        const btnEdit = sizeRow.querySelector(".btn-edit");

        quantityInput.disabled = false;
        btnSave.disabled = false;
        btnEdit.disabled = true;
      }

      // Botón Guardar en tallas EXISTENTES
      if (target.closest(".existing-sizes-list .btn-save")) {
        const sizeRow = target.closest(".size-container");
        const quantityInput = sizeRow.querySelector(".input-quantity");
        const btnSave = sizeRow.querySelector(".btn-save");
        const btnEdit = sizeRow.querySelector(".btn-edit");

        const quantity = parseInt(quantityInput.value, 10) || 0;
        if (quantity < 0) {
          alert("Ingrese una cantidad válida.");
          return;
        }
        quantityInput.disabled = true;
        btnSave.disabled = true;
        btnEdit.disabled = false;
      }

      // Botón Editar en tallas AGREGADAS
      if (target.closest(".added-sizes-list .btn-edit")) {
        const sizeRow = target.closest(".size-container");
        const quantityInput = sizeRow.querySelector(".input-quantity");
        const btnSave = sizeRow.querySelector(".btn-save");
        const btnEdit = sizeRow.querySelector(".btn-edit");
        const selectSize = sizeRow.querySelector(".select-size");

        selectSize.disabled = false;
        quantityInput.disabled = false;
        btnSave.disabled = false;
        btnEdit.disabled = true;
      }

      // Botón Guardar en tallas AGREGADAS
      if (target.closest(".added-sizes-list .btn-save")) {
        const sizeRow = target.closest(".size-container");
        const quantityInput = sizeRow.querySelector(".input-quantity");
        const btnSave = sizeRow.querySelector(".btn-save");
        const btnEdit = sizeRow.querySelector(".btn-edit");
        const selectSize = sizeRow.querySelector(".select-size");

        const quantity = parseInt(quantityInput.value, 10) || 0;
        if (quantity < 0) {
          alert("Ingrese una cantidad válida.");
          return;
        }
        selectSize.disabled = true;
        quantityInput.disabled = true;
        btnSave.disabled = true;
        btnEdit.disabled = false;
      }

      // Botón Agregar Talla
      if (target.closest(".btn-add-size")) {
        const idMarca = card.dataset.idMarca;
        if (!idMarca) {
          alert("No se ha especificado una marca para este producto.");
          return;
        }
        // Verificar si la última talla agregada está completa
        const addedSizesList = card.querySelector(".added-sizes-list");
        const lastAddedSize = addedSizesList.querySelector(".size-container:last-child");
        if (lastAddedSize) {
          const selectSize = lastAddedSize.querySelector(".select-size");
          const quantityInput = lastAddedSize.querySelector(".input-quantity");
          const tallaSeleccionada = selectSize ? selectSize.value.trim() : "";
          const cantidadIngresada = quantityInput ? quantityInput.value.trim() : "";
          if (!tallaSeleccionada || !cantidadIngresada) {
            alert("Por favor, completa la talla y la cantidad antes de agregar otra.");
            return;
          }
        }
        // Si todo OK, agrega una nueva talla
        addSizeDynamically(card, idMarca);
      }

      // Botón Eliminar talla agregada
      if (target.closest(".added-sizes-list .btn-remove-size")) {
        const sizeRow = target.closest(".size-container");
        sizeRow.remove();
      }
    });

    // Cambio en el select de tallas
    containerParent.addEventListener("change", (event) => {
      const target = event.target;
      if (target.classList.contains("select-size")) {
        const sizeRow = target.closest(".size-container");
        const stockInput = sizeRow.querySelector(".input-stock");
        const hiddenStockInput = sizeRow.querySelector(".input-stock-hidden");

        if (target.value) {
          const stock = target.value.split("|")[1];
          if (stockInput) {
            stockInput.value = stock;
          }
          if (hiddenStockInput) {
            hiddenStockInput.value = stock;
          }
        } else {
          if (stockInput) {
            stockInput.value = "";
          }
          if (hiddenStockInput) {
            hiddenStockInput.value = "0";
          }
        }
      }
    });
  };

  attachEventListeners();

  // ===================== NUEVO CÓDIGO PARA IMPRIMIR JSON =====================

  // Función para recolectar datos del formulario en la card
  function collectFormData(card) {
    // Datos básicos
    const codigo = card.querySelector(".input-codigo")?.value || "";
    const nombre = card.querySelector(".input-name")?.value || "";
    const marcaSelect = card.querySelector(".input-brand")?.value || "";
    const categoriaSelect = card.querySelector(".input-category")?.value || "";

    // Precios
    const precioCompra = card.querySelector(".input-purchase-price")?.value || "";
    const precioRegular = card.querySelector(".input-regular-price")?.value || "";
    const precioOnline = card.querySelector(".input-online-price")?.value || "";
    const precioPromo = card.querySelector(".input-promo-price")?.value || "";

    // Tallas existentes
    const existingSizesList = card.querySelectorAll(".existing-sizes-list .size-container");
    const existingSizes = Array.from(existingSizesList).map((row) => {
      const selectValue = row.querySelector(".select-size")?.value || "";
      const [idMarcaRangoTalla, stock] = selectValue.split("|");
      const newQuantity = row.querySelector(".input-quantity")?.value || 0;

      // Aseguramos que stockAnterior sea numérico, y si es NaN => 0
      const stockAnterior = parseInt(stock, 10) || 0;
      const nuevaCantidad = parseInt(newQuantity, 10) || 0;

      return {
        idMarcaRangoTalla,
        stockAnterior,
        nuevaCantidad
      };
    });

    // Tallas agregadas dinámicamente
    const addedSizesList = card.querySelectorAll(".added-sizes-list .size-container");
    const addedSizes = Array.from(addedSizesList).map((row) => {
      const selectValue = row.querySelector(".select-size")?.value || "";
      const [idMarcaRangoTalla, stock] = selectValue.split("|");
      const newQuantity = row.querySelector(".input-quantity")?.value || 0;

      // MOSTRAR 0 EN LUGAR DE null O VACÍO (stockAnterior)
      const stockAnterior = parseInt(stock, 10) || 0;
      const nuevaCantidad = parseInt(newQuantity, 10) || 0;

      return {
        idMarcaRangoTalla,
        stockAnterior,
        nuevaCantidad
      };
    });

    // ID del producto y marca
    const productoId = card.dataset.idProducto || "";

    // Retornar todo
    return {
      idProducto: productoId,
      codigo,
      nombre,
      marcaSelect,
      categoriaSelect,
      precioCompra,
      precioRegular,
      precioOnline,
      precioPromo,
      tallasExistentes: existingSizes,
      tallasAgregadas: addedSizes,
    };
  }

  // Botón "Imprimir JSON"
  const printJsonButton = document.getElementById("print-json-btn");
  if (!printJsonButton) {
    console.warn("No se encontró el botón Imprimir JSON (print-json-btn)");
  }

  printJsonButton?.addEventListener("click", () => {
    const card = document.querySelector(".card");
    if (!card) {
      console.warn("No se encontró la tarjeta (card) para recolectar datos.");
      alert("No se encontró el formulario del producto");
      return;
    }

    // ---------------------------------------------
    // 1) Verificar si hay algún .btn-save habilitado
    // ---------------------------------------------
    const saveButtons = card.querySelectorAll(".btn-save");
    let anySaveEnabled = false;
    saveButtons.forEach((btn) => {
      if (!btn.disabled) {
        anySaveEnabled = true;
      }
    });

    if (anySaveEnabled) {
      alert("Por favor, guarde todos los cambios antes de imprimir el JSON.");
      return;
    }

    // 2) Recolectar datos
    const formData = collectFormData(card);

    // 3) Mostrar en consola y en un alert
    console.log("Datos recolectados:", formData);
    console.log("Datos recolectados:\n" + JSON.stringify(formData, null, 2));
    alert("Datos recolectados:\n" + JSON.stringify(formData, null, 2));

    // (El resto del fetch/guardado real está comentado para pruebas)
    /*
    try {
      const response = await fetch('/guardar_producto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        alert('Producto guardado exitosamente');
      } else {
        alert(`Error al guardar el producto: ${result.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Ocurrió un error al intentar guardar el producto. Por favor, intente nuevamente.');
    } finally {
      // Restaurar estado del botón si fuera necesario
    }
    */
  });
});

