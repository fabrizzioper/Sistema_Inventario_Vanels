
document.addEventListener("DOMContentLoaded", () => {
    const containerParent = document.getElementById("container-wrapper");

    // Plantilla para el contenedor de talla
    const sizeContainerTemplate = `
  <div class="row size-container mb-3">
    <div class="col-12 col-md-3   mb-2">
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
        placeholder="Nueva cantida"
        min="1"
        disabled
      />
    </div>

    <!-- Columna para el botón Editar -->
    <div class="col-4 col-md-1 mt-2 d-flex align-items-center">
      <button
        type="button"
        class="btn btn-warning btn-sm btn-edit w-100"
      >
        <i class="fas fa-pencil-alt me-1"></i>
      </button>
    </div>
    <!-- Columna para el botón Guardar -->
    <div class="col-4 col-md-1 mt-2 d-flex align-items-center">
      <button
        type="button"
        class="btn btn-primary btn-sm btn-save w-100"
        disabled
      >
        <i class="fas fa-save"></i>
      </button>
    </div>
    <!-- Columna para el botón Eliminar -->
    <div class="col-4 col-md-1 mt-2 d-flex align-items-center">
      <button
        type="button"
        class="btn btn-danger btn-sm btn-remove-size w-100"
       
      >
        <i class="fas fa-trash"></i>
      </button>
    </div>
  </div>
`;

    // Función para cargar los datos del producto en el formulario
    const loadProductData = (card, productData) => {
        // Cargar imagen
        const imageContainer = card.querySelector(".product-image");
        const productImage = imageContainer.querySelector("img");
        const imagePlaceholder =
            imageContainer.querySelector(".image-placeholder");

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

        // Establecer el valor seleccionado en los selects de Marca y Categoría
        const brandSelect = card.querySelector(".input-brand");
        const categorySelect = card.querySelector(".input-category");

        // Verificar y establecer Marca
        const brandOption = Array.from(brandSelect.options).find(
            (option) =>
                option.text.trim().toLowerCase() ===
                productData.marca.nombre.trim().toLowerCase()
        );

        console.log("Marca:", productData.marca); // Para depuración
        console.log("Categoria", productData.categoria); // Para depuración

        if (brandOption) {
            brandSelect.disabled = false; // Habilitar temporalmente
            brandSelect.value = brandOption.value;
            brandSelect.disabled = true; // Deshabilitar nuevamente
        } else {
            console.warn(
                `Marca con nombre "${productData.marca}" no encontrada.`
            );
        }

        // Verificar y establecer Categoría
        const categoryOption = Array.from(categorySelect.options).find(
            (option) =>
                option.text.trim().toLowerCase() ===
                productData.categoria.trim().toLowerCase()
        );

        if (categoryOption) {
            categorySelect.disabled = false; // Habilitar temporalmente
            categorySelect.value = categoryOption.value;
            categorySelect.disabled = true; // Deshabilitar nuevamente
        } else {
            console.warn(
                `Categoría con nombre "${productData.categoria}" no encontrada.`
            );
        }

        // Almacenar id_marca en un atributo de datos
        card.dataset.idMarca = productData.marca.id_marca;

        // Cargar tallas en los selects y generar contenedores de talla
        const sizesSection = card.querySelector(".sizes-section");
        const sizesList = card.querySelector(".sizes-list");
        sizesList.innerHTML = ""; // Limpiar cualquier talla existente

        productData.tallas.forEach((talla) => {
            // Crear un nuevo contenedor de talla
            const sizeContainer = document.createElement("div");
            sizeContainer.innerHTML = sizeContainerTemplate;
            const sizeRow = sizeContainer.firstElementChild;

            // Configurar el select de tallas
            const selectSize = sizeRow.querySelector(".select-size");
            selectSize.innerHTML =
                '<option value="">Seleccionar Talla</option>';

            const option = document.createElement("option");
            option.value = `${talla.id_marca_rango_talla}|${talla.cantidad}`;
            option.textContent = `EUR ${talla.talla_eur || "No disponible"}`;
            selectSize.appendChild(option);
            console.log(
                `Talla añadida: EUR ${talla.talla_eur || "No disponible"}`
            ); // Para depuración
            selectSize.value = option.value;
            selectSize.disabled = true; // Deshabilitar el select
            selectSize.value = option.value;
            selectSize.disabled = true; // Deshabilitar el select

            // Configurar el stock
            const stockInput = sizeRow.querySelector(".input-stock");
            stockInput.value = talla.cantidad;

            // Configurar la cantidad
            const quantityInput = sizeRow.querySelector(".input-quantity");
            quantityInput.value = ""; // Inicialmente vacío
            quantityInput.disabled = true; // Deshabilitado hasta que se edite

            sizesList.appendChild(sizeRow);
        });

        // Mostrar secciones
        sizesSection.classList.remove("d-none");
        card.querySelector(".details-section").classList.remove("d-none");
    };

    // Función para buscar producto
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

    // Función para habilitar campos para edición en detalles
    const enableFields = (card) => {
        const fields = card.querySelectorAll(
            ".input-purchase-price, .input-promo-price, .input-online-price, .input-regular-price, .input-category, .input-brand, .input-name, .input-codigo"
        );
        fields.forEach((field) => {
            field.disabled = false;
        });
    };

    // Función para deshabilitar campos después de guardar en detalles
    const disableFields = (card) => {
        const fields = card.querySelectorAll(
            ".input-purchase-price, .input-promo-price, .input-online-price, .input-regular-price, .input-category, .input-brand, .input-name, .input-codigo"
        );
        fields.forEach((field) => {
            field.disabled = true;
        });
    };

    // Función para validar campos
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
            if (field.tagName === "SELECT") {
                if (!field.value) {
                    return false; // Campo de selección vacío
                }
            } else {
                if (!field.value.trim()) {
                    return false; // Campo de texto vacío
                }
            }
        }
        return true; // Todos los campos están llenos
    };

    // Event listeners
    const attachEventListeners = () => {
        containerParent.addEventListener("click", async (event) => {
            const target = event.target;
            const card = target.closest(".card");

            // Búsqueda de producto
            if (target.closest(".btn-search")) {
                const productCodeInput = card.querySelector(
                    ".input-product-code"
                );
                const enteredCode = productCodeInput.value.trim();

                if (!enteredCode) {
                    alert("Por favor, ingrese un código de producto.");
                    return;
                }

                try {
                    const productData = await searchProduct(enteredCode);
                    loadProductData(card, productData);

                    console.log("ID de Marca:", productData.marca.id_marca); // Imprimir ID de Marca
                } catch (error) {
                    alert(error.message || "Error al buscar el producto");
                }
            }

            // Botón "Datos" para habilitar campos en detalles
            if (target.closest(".btn-datos")) {
                enableFields(card);
                const guardarButton = card.querySelector(".btn-guardar");
                if (guardarButton) {
                    guardarButton.disabled = false;
                }
            }

            // Botón "Guardar" para validar campos antes de guardar
            if (target.closest(".btn-guardar")) {
                const isValid = validateFields(card);
                if (!isValid) {
                    alert("Por favor, complete todos los campos requeridos antes de guardar.");
                    return;
                }
                
                disableFields(card);
                const guardarButton = card.querySelector(".btn-guardar");
                if (guardarButton) {
                    guardarButton.disabled = true;
                }
            }
            if (target.closest(".btn-guardar")) {
                disableFields(card);
                const guardarButton = card.querySelector(".btn-guardar");
                if (guardarButton) {
                    guardarButton.disabled = true;
                }
            }

            // Botón Editar en la sección de tallas
            if (target.closest(".btn-edit")) {
                const sizeRow = target.closest(".size-container");
                const quantityInput = sizeRow.querySelector(".input-quantity");
                const btnSave = sizeRow.querySelector(".btn-save");
                const btnEdit = sizeRow.querySelector(".btn-edit");

                quantityInput.disabled = false;
                btnSave.disabled = false;
                btnEdit.disabled = true;
            }

            // Botón Guardar en la sección de tallas
            if (target.closest(".btn-save")) {
                const sizeRow = target.closest(".size-container");
                const quantityInput = sizeRow.querySelector(".input-quantity");
                const btnSave = sizeRow.querySelector(".btn-save");
                const btnEdit = sizeRow.querySelector(".btn-edit");

                const quantity = parseInt(quantityInput.value);
                const stock = parseInt(
                    sizeRow.querySelector(".input-stock")?.value || "0"
                );

                if (!quantity || quantity < 1) {
                    alert("Ingrese una cantidad válida.");
                    return;
                }

                if (quantity > stock) {
                    alert(
                        `La cantidad no puede exceder el stock disponible (${stock}).`
                    );
                    return;
                }

                quantityInput.disabled = true;
                btnSave.disabled = true;
                btnEdit.disabled = false;
            }

            // Agregar talla
            if (target.closest(".btn-add-size")) {
                const sizesList = card.querySelector(".sizes-list");

                // Obtener el id_marca desde el atributo de datos
                const idMarca = card.dataset.idMarca;

                if (!idMarca) {
                    alert("No se ha especificado una marca para este producto.");
                    return;
                }

                // Crear un nuevo contenedor de talla vacío
                const sizeContainer = document.createElement("div");
                sizeContainer.innerHTML = sizeContainerTemplate;
                const sizeRow = sizeContainer.firstElementChild;

                // Habilitar el select para permitir la selección de una nueva talla
                const selectSize = sizeRow.querySelector(".select-size");
                selectSize.disabled = false; // Permitir selección

                // Remover el campo de stock ya que es una nueva talla
                const stockDiv =
                    sizeRow.querySelector(".input-stock").parentElement;
                stockDiv.remove();

                // Opcional: Agregar un campo oculto para stock con valor 0
                const hiddenStockInput = document.createElement("input");
                hiddenStockInput.type = "hidden";
                hiddenStockInput.classList.add("input-stock-hidden");
                hiddenStockInput.value = "0";
                sizeRow.appendChild(hiddenStockInput);

                // Mostrar un indicador de carga mientras se obtienen las tallas
                const loadingOption = document.createElement("option");
                loadingOption.textContent = "Cargando tallas...";
                loadingOption.disabled = true;
                loadingOption.selected = true;
                selectSize.appendChild(loadingOption);

                // Añadir el contenedor de talla al DOM antes de realizar la solicitud
                sizesList.appendChild(sizeRow);

                // Realizar la solicitud a la API para obtener las tallas
                fetch(`/vender_productos/obtener_tallas_por_marca/${idMarca}`)
                    .then((response) => response.json())
                    .then((data) => {
                        // Limpiar las opciones existentes
                        selectSize.innerHTML =
                            '<option value="">Seleccionar Talla</option>';

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
                        selectSize.innerHTML =
                            '<option value="">Error al cargar tallas</option>';
                    });
            }

            // Eliminar talla
            if (target.closest(".btn-remove-size")) {
                const sizeRow = target.closest(".size-container");
                sizeRow.remove();
            }
        });

        // Event listener para cambios en el select de tallas
        containerParent.addEventListener("change", (event) => {
            const target = event.target;
            if (target.classList.contains("select-size")) {
                const sizeRow = target.closest(".size-container");
                const stockInput = sizeRow.querySelector(".input-stock");
                const hiddenStockInput = sizeRow.querySelector(
                    ".input-stock-hidden"
                );

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

    // Inicializar
    attachEventListeners();
});
