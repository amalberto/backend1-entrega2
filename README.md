# Backend1 – Entrega Final

Sistema de gestión de **productos** y **carritos** con **MongoDB (Mongoose)** como persistencia principal, vistas con **Handlebars**, y **Socket.IO** para tiempo real. Mantiene contrato de API con **IDs numéricos autoincrementales** mediante **counters**.

> ℹ️ FileSystem está disponible como modo alternativo (opcional) para desarrollo, pero **la entrega se evalúa con MongoDB**.

---

## 🚀 Requisitos previos

- **Node.js** 16+
- **MongoDB** String de conexión en `.env`

**Puedes usar:**

```bash
npm run use:mongo
```
para crear el .env automátimaticamente


**Si prefieres crearlo manualmente:**


Ejemplo `.env`:
```env
PERSISTENCE=mongo
MONGO_URL="mongodb://localhost:27017/backend1"
PORT=8080
```

> Si querés usar FileSystem para dev en .env la linea de PERSISTENCE debe quedar como: `PERSISTENCE=fs`.

## ▶️ Inicio rápido (Mongo recomendado)

```bash
git clone https://github.com/amalberto/backend1-entregaFinal
cd backend1-entregaFinal
npm install
# crear .env con PERSISTENCE=mongo y MONGO_URL o usar
```bash
npm run use:mongo
```
npm start
```

**URLs:**
- **App**: http://localhost:8080
- **Productos (API)**: http://localhost:8080/api/products
- **Carrito (vista)**: http://localhost:8080/carts/:cid
- **Productos con tiempo real**: http://localhost:8080/realtime

**Recomendado: usar datos de ejemplo**
Correr
```bash
npm run db:seed
```
o usar en la vista de home el botón 'Cargar Productos de Ejemplo'

## 🧱 Modelo de datos (Mongoose)

### Products
- `id`: Number (único, autoincremental con counters)
- `title`, `description`, `code` (único), `price`, `status` (bool), `stock`, `category`, `thumbnails[]`

### Carts
- `id`: Number (único, autoincremental con counters)
- `products`: [{ product: ObjectId(ref 'Product'), quantity: Number>=1 }]

### Counters
- `{ _id: 'products'|'carts', seq: Number }` – para generar id secuenciales (no se reutilizan).

## ✅ Reglas de validación

- `code` único.
- `price` y `stock` numéricos.
- En `PUT /api/products/:pid` no se puede modificar `id`.
- En `PUT /api/carts/:cid/products/:pid` quantity >= 1.
- `id` de productos y carritos no se reutiliza: el contador siempre incrementa.

## 📡 API

### Productos – /api/products

#### GET /api/products

**Query params:**
- `limit` (Number, default 10)
- `page` (Number, default 1)
- `sort` (asc|desc) por price
- `query` (filtro). Acepta:
  - `category:<nombre>` | `status:true|false` | o un valor simple (se interpreta como category).

**Respuesta cuando hay query params:**

```json
{
  "status": "success",
  "payload": [ /* productos */ ],
  "totalPages": 5,
  "prevPage": 1,
  "nextPage": 3,
  "page": 2,
  "hasPrevPage": true,
  "hasNextPage": true,
  "prevLink": "http://localhost:8080/api/products?limit=10&page=1",
  "nextLink": "http://localhost:8080/api/products?limit=10&page=3"
}
```

**Ejemplos:**
- `/api/products?limit=5&page=2&sort=asc`
- `/api/products?query=category:electronics&sort=desc`
- `/api/products?query=status:true&page=3&limit=4`

#### GET /api/products/:pid
Detalle por id numérico.

#### POST /api/products

**Body:**
```json
{
  "title": "Mouse",
  "description": "Optical",
  "code": "SKU-100",
  "price": 15.5,
  "status": true,
  "stock": 30,
  "category": "electronics",
  "thumbnails": []
}
```
> `id` se autogenera.

#### PUT /api/products/:pid
Actualiza campos (no `id`).

#### DELETE /api/products/:pid
Elimina producto.

### Carritos – /api/carts

#### POST /api/carts
Crea carrito:
```json
{ "id": 1, "products": [] }
```

#### GET /api/carts/:cid
Devuelve solo los productos del carrito `cid` poblados (populate del modelo Product).

#### POST /api/carts/:cid/products/:pid
Agrega producto `pid` al carrito `cid` (si existe, incrementa quantity).

### Nuevos (obligatorios)

#### DELETE /api/carts/:cid/products/:pid
Elimina ese producto del carrito.

#### PUT /api/carts/:cid
Reemplaza todo el arreglo products con:
```json
[
  { "product": 12, "quantity": 3 },
  { "product": 5, "quantity": 1 }
]
```

#### PUT /api/carts/:cid/products/:pid
Setea quantity por body:
```json
{ "quantity": 7 }
```

#### DELETE /api/carts/:cid
Vacía el carrito.

## 🖼️ Vistas (Handlebars)

- `/products` – listado con paginación, filtros (categoría/estado) y orden (precio asc/desc).
- `/products/:pid` – detalle con botón "Agregar al carrito".
- `/carts/:cid` – muestra solo los productos de ese carrito (populate).
- `/realtime` – (opcional) lista dinámica con Socket.IO y formulario de alta/baja.

## ⚡ Tiempo real (Socket.IO)

Al crear/editar/eliminar un producto por HTTP o WS, el servidor emite `products:updated`.

El cliente (vista realtime) recarga respetando filtros y paginación activos.

## 🎛️ Interfaz de Administración

### Acceso a la Aplicación
```bash
npm start  # Iniciar servidor
```
**URL Principal**: http://localhost:8080

### Panel de Gestión de Datos
La página principal incluye un panel de "Gestión de Datos" con las siguientes funciones:

1. **Cambio de Persistencia Dinámico**
   - Botón **"Cambiar a MongoDB"** / **"Cambiar a FileSystem"**
   - Crea (en caso de no existir), y configura automáticamente el archivo `.env`
   - Requiere reinicio del servidor para aplicar cambios

2. **Cargar Productos de Ejemplo**
   - Carga productos predefinidos en el sistema actual
   - Funciona tanto en MongoDB como FileSystem
   - Detecta automáticamente la persistencia activa

3. **Migrar Datos**
   - **FS → MongoDB**: Migra datos de FileSystem a MongoDB
   - **MongoDB → FS**: Migra datos de MongoDB a FileSystem
   - Preserva todos los datos durante la migración
   - Cambio automático de persistencia tras migración exitosa

### Cambio Dinámico de Persistencia
También podés cambiar entre FileSystem y MongoDB directamente desde la interfaz web:
1. Visita http://localhost:8080
2. Haz clic en **"Cambiar a MongoDB"** o **"Cambiar a File System"**
3. Reinicia el servidor cuando se te indique

## 🧰 Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor |
| `npm run db:seed` | Carga productos de ejemplo |
| `npm run use:mongo` | (Opcional) Genera .env con PERSISTENCE=mongo |
| `npm run db:export` | (Opcional) Exporta datos actuales |
| `npm run db:import` | (Opcional) Importa datos desde backup |

> **Evaluación:** usar `PERSISTENCE=mongo`.


> ⚠️ **Importante:** Si MongoDB no está instalado, el sistema automáticamente utilizará FileSystem como fallback, pero **MongoDB siempre estará disponible creando el .env según lo descripto más arriba o utilizando el comando npm run use:mongo.**
