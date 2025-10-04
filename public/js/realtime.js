(function () {
  const socket = io();

  // ---- NODOS ----
  const listEl = document.getElementById('products-list');
  const createForm = document.getElementById('create-form');

  const filtersForm = document.getElementById('filters-form');
  const clearBtn = document.getElementById('filters-clear');
  const prevBtn = document.getElementById('page-prev');
  const nextBtn = document.getElementById('page-next');
  const pageCurrentEl = document.getElementById('page-current');
  const pageTotalEl = document.getElementById('page-total');
  const resultsCountEl = document.getElementById('results-count');
  const totalCountEl = document.getElementById('total-count');
  const prevLinkEl = document.getElementById('prev-link');
  const nextLinkEl = document.getElementById('next-link');
  const deleteAllBtn = document.getElementById('delete-all-btn');
  
  // Elementos para nueva categoría
  const categorySelect = document.getElementById('category-select');
  const newCategoryInput = document.getElementById('new-category-input');
  const newCategoryText = document.getElementById('new-category-text');

  // ---- STATE ----
  const state = {
    limit: 10,
    page: 1,
    sort: '',
    category: '',
    status: ''
  };

  // ---- HELPERS ----
  function buildQuery() {
    const params = new URLSearchParams();
    params.set('limit', String(state.limit));
    params.set('page', String(state.page));
    if (state.sort) params.set('sort', state.sort);
    if (state.category) params.set('category', state.category);
    if (state.status !== '' && state.status !== null) params.set('status', state.status);
    return params.toString();
  }

  // Formatear código SKU
  function formatSKU(input) {
    if (!input) return '';
    
    // Remover cualquier prefijo SKU- existente y espacios
    let cleanInput = input.toString().replace(/^SKU-?/i, '').trim();
    
    // Extraer solo números del input
    let numbers = cleanInput.replace(/[^0-9]/g, '');
    
    // Si no hay números, usar 0001
    if (!numbers) numbers = '1';
    
    // Convertir a número y luego formatear con ceros a la izquierda
    const num = parseInt(numbers);
    const formatted = num.toString().padStart(4, '0');
    
    return `SKU-${formatted}`;
  }

  // Verificar si un código ya existe
  async function checkCodeExists(code, excludeId = null) {
    try {
      const res = await fetch('/api/products?limit=1000'); // Obtener todos los productos
      const data = await res.json();
      
      let products = [];
      if (data && data.payload) {
        products = data.payload;
      } else if (Array.isArray(data)) {
        products = data;
      }
      
      if (products.length > 0) {
        return products.some(product => 
          product.code === code && product.id !== excludeId
        );
      }
      return false;
    } catch (error) {
      console.error('Error checking code:', error);
      return false;
    }
  }

  // Obtener categorías dinámicas
  async function getDynamicCategories() {
    try {
      const res = await fetch('/api/products?limit=1000'); // Obtener todos los productos
      const data = await res.json();
      
      let products = [];
      if (data && data.payload) {
        products = data.payload;
      } else if (Array.isArray(data)) {
        products = data;
      }
      
      if (products.length > 0) {
        const categories = [...new Set(products.map(p => p.category).filter(c => c))];
        return categories.sort().map(cat => ({
          value: cat,
          text: cat.charAt(0).toUpperCase() + cat.slice(1)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  async function load() {
    try {
      const qs = buildQuery();
      const res = await fetch(`/api/products?${qs}`);
      const data = await res.json();

  

      // Formato paginado (cuando hay query params)
      if (data && data.status === 'success') {
        render(data.payload);
        pageCurrentEl.textContent = data.page;
        pageTotalEl.textContent = data.totalPages;
        resultsCountEl.textContent = data.payload.length;
        totalCountEl.textContent = data.total;
        prevBtn.disabled = !data.hasPrevPage;
        nextBtn.disabled = !data.hasNextPage;
        prevLinkEl.textContent = data.prevLink || '—';
        prevLinkEl.href = data.prevLink || '#';
        nextLinkEl.textContent = data.nextLink || '—';
        nextLinkEl.href = data.nextLink || '#';
        updatePaginationButtons();
        return;
      }

      // Caso sin filtros (API devolvió arreglo plano) - Forzar paginación
      if (Array.isArray(data)) {
        // Re-hacer la petición con paginación forzada
        const paginatedRes = await fetch(`/api/products?limit=${state.limit}&page=${state.page}`);
        const paginatedData = await paginatedRes.json();
        
        if (paginatedData && paginatedData.status === 'success') {
          render(paginatedData.payload);
          pageCurrentEl.textContent = paginatedData.page;
          pageTotalEl.textContent = paginatedData.totalPages;
          resultsCountEl.textContent = paginatedData.payload.length;
          totalCountEl.textContent = paginatedData.total;
          prevBtn.disabled = !paginatedData.hasPrevPage;
          nextBtn.disabled = !paginatedData.hasNextPage;
          updatePaginationButtons();
          return;
        }
      }

      // Fallback si algo sale mal
      render([]);
      pageCurrentEl.textContent = '1';
      pageTotalEl.textContent = '1';
      resultsCountEl.textContent = '0';
      totalCountEl.textContent = '0';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      updatePaginationButtons();
    } catch (error) {
      console.error('Error loading products:', error);
      render([]);
    }
  }

  function render(items) {
    listEl.innerHTML = '';
    if (!Array.isArray(items) || items.length === 0) {
      listEl.innerHTML = '<li>No hay productos aún.</li>';
      return;
    }
    items.forEach(p => {
      const li = document.createElement('li');
      li.style = 'border: 1px solid #ddd; margin: 8px 0; padding: 12px; border-radius: 8px; background: #f9f9f9;';
      li.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="flex: 1; min-width: 200px;">
            <strong>${p.title}</strong><br>
            <small>$${p.price} — código: ${p.code} — categoría: ${p.category || 'N/A'}</small>
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px; background: white; padding: 8px; border-radius: 6px; border: 1px solid #ccc;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: bold; color: ${p.stock <= 5 ? '#e74c3c' : '#27ae60'};">Stock: ${p.stock}</span>
              <span style="padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; color: white; background: ${p.status ? '#27ae60' : '#e74c3c'};">
                ${p.status ? 'ACTIVO' : 'INACTIVO'}
              </span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <button data-id="${p.id}" data-action="manage-stock" style="background:#3498db;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:14px;font-weight:bold;margin:2px;">+/- Unidades</button>
              <button onclick="editProduct(${p.id})" style="background:#f39c12;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:14px;font-weight:bold;margin:2px;">Editar</button>
              <button data-id="${p.id}" data-action="delete" style="background:#e74c3c;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:14px;font-weight:bold;margin:2px;">Eliminar</button>
            </div>
          </div>
        </div>
      `;
      listEl.appendChild(li);
    });
  }

  // ---- EVENTOS WS ----
  socket.on('products:updated', () => {
    // Recargar la lista respetando filtros/paginación actuales
    load().catch(console.error);
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  // ---- NUEVA CATEGORÍA ----
  if (categorySelect && newCategoryInput && newCategoryText) {
    categorySelect.addEventListener('change', (e) => {
      if (e.target.value === '__nueva__') {
        newCategoryInput.style.display = 'block';
        newCategoryText.required = true;
        newCategoryText.focus();
      } else {
        newCategoryInput.style.display = 'none';
        newCategoryText.required = false;
        newCategoryText.value = '';
      }
    });
  }

  // ---- FORM CREACIÓN ----
  if (createForm) {
    // Controles de stock en el formulario
    const stockInput = createForm.querySelector('input[name="stock"]');
    const stockDecreaseBtn = document.getElementById('stock-decrease');
    const stockIncreaseBtn = document.getElementById('stock-increase');
    
    stockDecreaseBtn.addEventListener('click', () => {
      const current = Math.max(0, Number(stockInput.value) || 0);
      stockInput.value = Math.max(0, current - 1);
    });
    
    stockIncreaseBtn.addEventListener('click', () => {
      const current = Number(stockInput.value) || 0;
      stockInput.value = current + 1;
    });
    
    // Formatear código SKU en tiempo real
    const codeInput = document.getElementById('create-code');
    if (codeInput) {
      codeInput.addEventListener('blur', () => {
        if (codeInput.value.trim()) {
          codeInput.value = formatSKU(codeInput.value);
        }
      });
    }
    
    createForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const fd = new FormData(createForm);
      
      // Formatear código SKU
      const originalCode = fd.get('code');
      const formattedCode = formatSKU(originalCode);
      
      // Verificar duplicación de código
      const codeExists = await checkCodeExists(formattedCode);
      if (codeExists) {
        Swal.fire({
          icon: 'error',
          title: 'Código duplicado',
          text: `El código ${formattedCode} ya existe. Por favor usa otro código.`
        });
        return;
      }
      
      // Determinar la categoría final
      let finalCategory = fd.get('category');
      if (finalCategory === '__nueva__') {
        finalCategory = newCategoryText.value.trim().toLowerCase();
        if (!finalCategory) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debes ingresar el nombre de la nueva categoría'
          });
          return;
        }
      }
      
      const payload = {
        title: fd.get('title'),
        description: fd.get('description'),
        code: formattedCode,
        price: Number(fd.get('price')),
        stock: Number(fd.get('stock')),
        category: finalCategory,
        status: fd.get('status') === 'on',
        thumbnails: (fd.get('thumbnails') || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      };
      socket.emit('product:create', payload, (ack) => {
        if (!ack?.ok) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: ack?.error || 'Error al crear producto'
          });
        } else {
          createForm.reset();
          stockInput.value = 1; // Resetear a 1
          
          // Resetear nueva categoría
          newCategoryInput.style.display = 'none';
          newCategoryText.required = false;
          newCategoryText.value = '';
          
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Producto creado correctamente',
            timer: 2000,
            showConfirmButton: false
          });
        }
      });
    });
  }

  // ---- UI FILTROS ----
  if (filtersForm) {
    // Inicializar UI con state
    filtersForm.limit.value = state.limit;
    filtersForm.sort.value = state.sort;
    filtersForm.category.value = state.category;
    filtersForm.status.value = state.status;

    filtersForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      state.limit = Math.max(1, Number(filtersForm.limit.value) || 10);
      state.sort = String(filtersForm.sort.value || '');
      state.category = String(filtersForm.category.value || '');
      state.status = filtersForm.status.value; // '' | 'true' | 'false'
      state.page = 1; // reset page al aplicar filtros
      load().catch(console.error);
    });

    clearBtn.addEventListener('click', () => {
      filtersForm.reset();
      state.limit = 10;
      state.sort = '';
      state.category = '';
      state.status = '';
      state.page = 1;
      load().catch(console.error);
    });
  }

  // ---- BOTÓN ELIMINAR TODOS ----
  if (deleteAllBtn) {
    deleteAllBtn.addEventListener('click', async () => {
      const confirmDeleteAll = await Swal.fire({
        title: 'PELIGRO',
        html: `
          <p>Esto eliminará <strong>TODOS</strong> los productos de la base de datos.</p>
          <p style="color: #e74c3c;"><strong>Esta acción no se puede deshacer.</strong></p>
        `,
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar TODOS',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#8e44ad',
        input: 'text',
        inputPlaceholder: 'Escribe "ELIMINAR TODO" para confirmar',
        inputValidator: (value) => {
          if (value !== 'ELIMINAR TODO') {
            return 'Debes escribir exactamente "ELIMINAR TODO"';
          }
        }
      });
      
      if (confirmDeleteAll.isConfirmed) {
        socket.emit('products:deleteAll', {}, (ack) => {
          if (!ack?.ok) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: ack?.error || 'Error al eliminar todos los productos'
            });
          } else {
            Swal.fire({
              icon: 'success',
              title: 'Eliminados',
              text: 'Todos los productos han sido eliminados',
              timer: 3000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  }

  // ---- UI PAGINACIÓN ----
  prevBtn.addEventListener('click', () => {
    if (state.page > 1) {
      state.page -= 1;
      load().catch(console.error);
    }
  });
  nextBtn.addEventListener('click', () => {
    state.page += 1;
    load().catch(console.error);
  });
  
  // Función para actualizar estilos de botones de paginación
  function updatePaginationButtons() {
    if (prevBtn.disabled) {
      prevBtn.style.background = '#6c757d';
      prevBtn.style.cursor = 'not-allowed';
    } else {
      prevBtn.style.background = '#17a2b8';
      prevBtn.style.cursor = 'pointer';
    }
    
    if (nextBtn.disabled) {
      nextBtn.style.background = '#6c757d';
      nextBtn.style.cursor = 'not-allowed';
    } else {
      nextBtn.style.background = '#17a2b8';
      nextBtn.style.cursor = 'pointer';
    }
  }

  // ---- Gestión de stock y eliminación con SweetAlert2 ----
  listEl.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('button[data-id]');
    if (!btn) return;
    
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    const productElement = btn.closest('li');
    const productTitle = productElement.querySelector('strong').textContent;
    

    
    if (action === 'manage-stock') {
      // Obtener stock actual del elemento
      const stockElement = productElement.querySelector('span[style*="font-weight: bold"]');
      const stockText = stockElement ? stockElement.textContent : '';
      const currentStock = Number(stockText.match(/Stock: (\d+)/)?.[1]) || 0;
      
      const result = await Swal.fire({
        title: 'Gestionar Stock',
        html: `
          <p><strong>Producto:</strong> ${productTitle}</p>
          <p><strong>Stock actual:</strong> ${currentStock}</p>
          <hr>
          <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
            • Números positivos para <strong>agregar</strong> stock<br>
            • Números negativos para <strong>quitar</strong> stock
          </p>
        `,
        icon: 'question',
        input: 'number',
        inputLabel: 'Cantidad (+ para agregar, - para quitar)',
        inputPlaceholder: 'Ej: 5 (agregar) o -3 (quitar)',
        inputAttributes: {
          step: 1
        },
        inputValue: 1,
        showCancelButton: true,
        confirmButtonText: 'Actualizar Stock',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3498db',
        cancelButtonColor: '#95a5a6',
        inputValidator: (value) => {
          const num = Number(value);
          if (!value || !Number.isInteger(num) || num === 0) {
            return 'Debes ingresar un número entero diferente de 0';
          }
          if (num < 0 && Math.abs(num) > currentStock) {
            return `No puedes quitar ${Math.abs(num)} unidades. Stock actual: ${currentStock}`;
          }
        }
      });
      
      if (result.isConfirmed) {
        const quantity = Number(result.value);
        const actionText = quantity > 0 ? 'agregadas' : 'quitadas';
        const absQuantity = Math.abs(quantity);
        
        socket.emit('product:updateStock', { id, change: quantity }, (ack) => {
          
          if (!ack?.ok) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: ack?.error || 'Error al actualizar stock'
            });
          } else {
            Swal.fire({
              icon: 'success',
              title: 'Stock actualizado',
              text: `${absQuantity} unidades ${actionText}. Nuevo stock: ${ack.newStock}`,
              timer: 2500,
              showConfirmButton: false
            });
          }
        });
      }
      return;
    }
    
    // Manejar eliminación individual
    if (action === 'delete') {
      const confirmDelete = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Se eliminará el producto "${productTitle}"`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e74c3c'
      });
      
      if (confirmDelete.isConfirmed) {
        socket.emit('product:delete', id, (ack) => {
          if (!ack?.ok) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: ack?.error || 'Error al eliminar producto'
            });
          } else {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'Producto eliminado correctamente',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    }
  });

  // ---- FUNCIONES GLOBALES PARA LA VISTA ----
  
  // Función para actualizar stock
  window.updateStock = async function(productId, productTitle) {
    const { value: stockChange } = await Swal.fire({
      title: `Actualizar Stock - ${productTitle}`,
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p><strong>Instrucciones:</strong></p>
          <ul style="text-align: left;">
            <li>Número positivo: <strong>suma</strong> al stock actual</li>
            <li>Número negativo: <strong>resta</strong> del stock actual</li>
            <li>Ejemplo: +10 agrega 10 unidades, -5 quita 5 unidades</li>
          </ul>
        </div>
        <input id="stock-input" type="number" step="1" placeholder="Ej: +10 o -5" 
               style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px;">
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Actualizar Stock',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        document.getElementById('stock-input').focus();
      },
      preConfirm: () => {
        const input = document.getElementById('stock-input');
        const value = parseInt(input.value);
        if (isNaN(value) || value === 0) {
          Swal.showValidationMessage('Ingresa un número válido (diferente de 0)');
          return false;
        }
        return value;
      }
    });

    if (stockChange !== undefined) {
      try {
        // Obtener producto actual para calcular nuevo stock
        const productRes = await fetch(`/api/products/${productId}`);
        const product = await productRes.json();
        
        if (product.error) {
          throw new Error(product.error);
        }
        
        const newStock = Math.max(0, product.stock + stockChange);
        
        // Actualizar stock
        const updateRes = await fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock: newStock })
        });
        
        const result = await updateRes.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        Swal.fire({
          title: '¡Stock actualizado!',
          html: `
            <div style="text-align: center;">
              <p><strong>${productTitle}</strong></p>
              <p>Stock anterior: ${product.stock}</p>
              <p>Cambio: ${stockChange > 0 ? '+' : ''}${stockChange}</p>
              <p><strong>Stock nuevo: ${newStock}</strong></p>
            </div>
          `,
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });
        
        // Recargar la lista
        load();
        
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: `No se pudo actualizar el stock: ${error.message}`,
          icon: 'error'
        });
      }
    }
  };

  // Función para editar producto
  window.editProduct = async function(productId) {
    try {
      // Obtener datos del producto y categorías dinámicas
      const [productRes, categories] = await Promise.all([
        fetch(`/api/products/${productId}`),
        getDynamicCategories()
      ]);
      
      const product = await productRes.json();
      
      if (product.error) {
        throw new Error(product.error);
      }

      // Generar opciones de categorías dinámicas
      const categoryOptions = categories.map(cat => 
        `<option value="${cat.value}" ${product.category === cat.value ? 'selected' : ''}>${cat.text}</option>`
      ).join('');
      
      const { value: formValues } = await Swal.fire({
        title: `Editar Producto #${productId}`,
        html: `
          <div style="display: grid; gap: 15px; text-align: left;">
            <div>
              <label><strong>Título:</strong></label>
              <input id="edit-title" value="${product.title}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Descripción:</strong></label>
              <textarea id="edit-description" rows="3" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">${product.description}</textarea>
            </div>
            <div>
              <label><strong>Código SKU (formato automático):</strong></label>
              <input id="edit-code" value="${product.code}" placeholder="Ej: 25, SAS27, SKU-27" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
              <small style="color: #666;">Se formateará automáticamente como SKU-XXXX</small>
            </div>
            <div>
              <label><strong>Precio:</strong></label>
              <input id="edit-price" type="number" step="0.01" value="${product.price}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Stock:</strong></label>
              <input id="edit-stock" type="number" value="${product.stock}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Categoría:</strong></label>
              <select id="edit-category" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                ${categoryOptions}
                <option value="__nueva__">+ Crear nueva categoría</option>
              </select>
            </div>
            <div id="edit-new-category-input" style="display:none;margin-top:8px;">
              <label><strong>Nueva categoría:</strong></label>
              <input id="edit-new-category-text" type="text" placeholder="Nombre de la nueva categoría" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;">
            </div>
            <div>
              <label style="display: flex; align-items: center; gap: 8px;">
                <input id="edit-status" type="checkbox" ${product.status ? 'checked' : ''}>
                <strong>Producto activo</strong>
              </label>
            </div>
          </div>
        `,
        width: 600,
        showCancelButton: true,
        confirmButtonText: 'Guardar Cambios',
        cancelButtonText: 'Cancelar',
        didOpen: () => {
          // Manejar nueva categoría
          const categorySelect = document.getElementById('edit-category');
          const newCategoryInput = document.getElementById('edit-new-category-input');
          const newCategoryText = document.getElementById('edit-new-category-text');
          
          categorySelect.addEventListener('change', (e) => {
            if (e.target.value === '__nueva__') {
              newCategoryInput.style.display = 'block';
              newCategoryText.required = true;
              newCategoryText.focus();
            } else {
              newCategoryInput.style.display = 'none';
              newCategoryText.required = false;
            }
          });
          
          // Formatear código en tiempo real
          const codeInput = document.getElementById('edit-code');
          codeInput.addEventListener('blur', () => {
            if (codeInput.value.trim()) {
              codeInput.value = formatSKU(codeInput.value);
            }
          });
        },
        preConfirm: async () => {
          const title = document.getElementById('edit-title').value.trim();
          const description = document.getElementById('edit-description').value.trim();
          const rawCode = document.getElementById('edit-code').value.trim();
          const price = parseFloat(document.getElementById('edit-price').value);
          const stock = parseInt(document.getElementById('edit-stock').value);
          let category = document.getElementById('edit-category').value;
          const status = document.getElementById('edit-status').checked;
          
          // Validaciones básicas
          if (!title || !description || !rawCode || isNaN(price) || isNaN(stock)) {
            Swal.showValidationMessage('Todos los campos son obligatorios');
            return false;
          }
          
          if (price < 0 || stock < 0) {
            Swal.showValidationMessage('El precio y stock deben ser positivos');
            return false;
          }
          
          // Formatear código
          const formattedCode = formatSKU(rawCode);
          
          // Verificar duplicación de código (excluyendo el producto actual)
          const codeExists = await checkCodeExists(formattedCode, productId);
          if (codeExists) {
            Swal.showValidationMessage(`El código ${formattedCode} ya existe. Por favor usa otro código.`);
            return false;
          }
          
          // Manejar nueva categoría
          if (category === '__nueva__') {
            const newCat = document.getElementById('edit-new-category-text').value.trim().toLowerCase();
            if (!newCat) {
              Swal.showValidationMessage('Debes ingresar el nombre de la nueva categoría');
              return false;
            }
            category = newCat;
          }
          
          return { title, description, code: formattedCode, price, stock, category, status };
        }
      });

      if (formValues) {
        // Actualizar producto
        const updateRes = await fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues)
        });
        
        const result = await updateRes.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        Swal.fire({
          title: '¡Producto actualizado!',
          text: `${formValues.title} se ha actualizado correctamente`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Recargar la lista
        load();
      }
      
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: `No se pudo editar el producto: ${error.message}`,
        icon: 'error'
      });
    }
  };

  // Carga inicial - solo si no hay productos precargados
  document.addEventListener('DOMContentLoaded', function() {
    const existingProducts = document.querySelectorAll('#products-list li[data-id]');
    
    // Si no hay productos precargados, hacer la carga inicial
    if (existingProducts.length === 0) {
      load().catch(console.error);
    } else {
      // Si hay productos precargados, solo actualizar los contadores
      const totalCount = existingProducts.length;
      resultsCountEl.textContent = totalCount;
      totalCountEl.textContent = totalCount;
      pageCurrentEl.textContent = '1';
      pageTotalEl.textContent = '1';
      updatePaginationButtons();
    }
  });
})();
