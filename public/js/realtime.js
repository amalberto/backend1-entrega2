(function () {
  const socket = io();
  const listEl = document.getElementById('products-list');
  const formEl = document.getElementById('create-form');

  function render(items) {
    listEl.innerHTML = '';
    if (!Array.isArray(items) || items.length === 0) {
      listEl.innerHTML = '<li>No hay productos aún.</li>';
      return;
    }
    items.forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${p.title}</strong> — $${p.price} — código: ${p.code} — stock: ${p.stock}
        <button data-id="${p.id}" style="margin-left:8px;">Eliminar</button>
      `;
      listEl.appendChild(li);
    });
  }

  socket.on('products:updated', render);

  if (formEl) {
    formEl.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const fd = new FormData(formEl);
      const payload = {
        title: fd.get('title'),
        description: fd.get('description'),
        code: fd.get('code'),
        price: Number(fd.get('price')),
        stock: Number(fd.get('stock')),
        category: fd.get('category'),
        status: fd.get('status') === 'on',
        thumbnails: (fd.get('thumbnails') || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      };
      socket.emit('product:create', payload, (ack) => {
        if (!ack?.ok) alert(ack?.error || 'Error al crear');
        else formEl.reset();
      });
    });
  }

  listEl.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-id]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (!confirm(`¿Eliminar producto #${id}?`)) return;
    socket.emit('product:delete', id, (ack) => {
      if (!ack?.ok) alert(ack?.error || 'Error al eliminar');
    });
  });
})();
