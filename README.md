# Backend1 - Entrega Final

## Descripción
Sistema de gestión de productos y carritos con doble persistencia (MongoDB/FileSystem), Socket.IO para tiempo real, y vistas con Handlebars. Incluye interfaz de administración para gestión de datos.

## Características Principales

### Funcionalidades Core
- **Gestión de Productos**: CRUD completo con paginación, filtros y ordenamiento
- **Gestión de Carritos**: Creación, modificación y eliminación de carritos
- **Doble Persistencia**: Soporte completo para MongoDB y FileSystem con migración automática
- **Tiempo Real**: Socket.IO para actualizaciones instantáneas
- **Interfaz Administrativa**: Panel de control para gestión de datos

### API REST Completa
- `/api/products` - Gestión de productos con paginación y filtros
- `/api/carts` - Gestión completa de carritos
- `/api/admin` - Endpoints administrativos para gestión de datos

### Sistema de Migración
- **Migración Bidireccional**: MongoDB ↔ FileSystem
- **Detección Automática**: El sistema detecta la persistencia disponible
- **Importación/Exportación**: Funciones para respaldo y restauración de datos

## Instalación y Configuración

### Requisitos Previos
- **Node.js** v14 o superior
- **MongoDB** (óptimno - también funcion con con FileSystem)

### Instalación Automática
```bash
git clone [repository-url]
cd backend1-entrega2
npm run setup       # Configuración automática completa
npm start
```

### Instalación Manual
```bash
npm install

# Con MongoDB
npm run db:setup    # Configura e importa datos a MongoDB

# Sin MongoDB - usar FileSystem (por defecto)
npm start           # El sistema se configura automáticamente
```

### Configuración de Variables de Entorno
Crear archivo `.env` en la raíz:
```env
NODE_ENV=development
PORT=8080
DB_NAME=ecommerce
PERSISTENCE_TYPE=auto    # auto|mongo|fs
MONGO_URI=mongodb://localhost:27017/ecommerce
```

## Uso del Sistema

### Acceso a la Aplicación
```bash
npm start  # Iniciar servidor
```
**URL Principal**: http://localhost:8080

### Interfaz de Administración
La página principal incluye un panel de "Gestión de Datos" con tres funciones principales:

1. **Cargar Productos de Ejemplo**
   - Carga productos predefinidos en el sistema actual
   - Funciona tanto en MongoDB como FileSystem
   - Detecta automáticamente la persistencia activa

2. **Migrar Datos**
   - Migración bidireccional entre MongoDB y FileSystem
   - Preserva todos los datos durante la migración
   - Cambio automático de persistencia tras migración exitosa

3. **Configuración**
   - Información del sistema actual
   - Estado de persistencia activo
   - Herramientas de importación/exportación

### Scripts Disponibles
```bash
npm start           # Iniciar servidor
npm run setup       # Configuración automática completa
npm run db:setup     # Configurar MongoDB con datos
npm run db:export    # Exportar datos actuales
npm run db:import    # Importar datos desde backup
```

### Vistas Disponibles
- **/** - Página principal con gestión administrativa
- **/products** - Listado de productos con paginación
- **/carts** - Gestión de carritos
- **/realtime** - Vista en tiempo real con Socket.IO

### API Endpoints

#### Productos
- `GET /api/products` - Listar productos (paginación, filtros, ordenamiento)
- `GET /api/products/:pid` - Obtener producto específico
- `POST /api/products` - Crear nuevo producto
- `PUT /api/products/:pid` - Actualizar producto
- `DELETE /api/products/:pid` - Eliminar producto

#### Carritos
- `GET /api/carts` - Listar carritos
- `POST /api/carts` - Crear nuevo carrito
- `GET /api/carts/:cid` - Obtener carrito específico
- `POST /api/carts/:cid/products/:pid` - Agregar producto al carrito
- `PUT /api/carts/:cid/products/:pid` - Actualizar cantidad en carrito
- `DELETE /api/carts/:cid/products/:pid` - Eliminar producto del carrito
- `DELETE /api/carts/:cid` - Vaciar carrito

#### Administración
- `POST /api/admin/seed-products` - Cargar productos de ejemplo
- `POST /api/admin/migrate-data` - Migrar entre persistencias
- `GET /api/admin/config` - Información de configuración