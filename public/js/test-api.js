// Test script para verificar la API
console.log('Testing API endpoints...');

// Test GET products
fetch('/products?limit=10&page=1')
  .then(res => res.json())
  .then(data => {
    console.log('GET /products with pagination:', data);
  })
  .catch(err => console.error('Error:', err));

// Test GET products sin paginación
fetch('/products')
  .then(res => res.json())
  .then(data => {
    console.log('GET /products without pagination:', data);
  })
  .catch(err => console.error('Error:', err));