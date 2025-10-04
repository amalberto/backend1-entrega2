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
- **MongoDB** (óptimo - también funciona con FileSystem)

### Instalación

```bash
git clone [repository-url]
cd backend1-entregaFinal
npm install
```

### Configuración - Dos opciones disponibles:

####  **Opción 1: Configuración Automática (Recomendada)**
La forma más sencilla de empezar. El sistema se configurará automáticamente y podrás cambiar la persistencia desde la interfaz web:

```bash
npm start
```

Luego visita http://localhost:8080 y:
1. El sistema iniciará con **FileSystem** por defecto
2. Para cambiar a **MongoDB** (requiere Mongo instalado), simplemente haz clic en el botón **"Cambiar a MongoDB"**
3. El sistema creará automáticamente el archivo `.env` con la configuración correcta
4. Reinicia el servidor cuando se te indique, utilizando los comandos 'npm stop' (o CTRL+C en el terminal) y luego 'npm start'.

####  **Opción 2: Configuración Manual**
Si preferís configurá todo manualmente desde el inicio:

**Para usar MongoDB:**
1. Crear archivo `.env` en la raíz del proyecto:
```env
NODE_ENV=development
PORT=8080
DB_NAME=backend1
PERSISTENCE=mongo
MONGO_URL=mongodb://localhost:27017/backend1
```

2. Ejecutar scripts de configuración:
```bash
npm run db:setup    # Configura e importa datos a MongoDB
npm start
```

**Para usar FileSystem:**
1. Crear archivo `.env` en la raíz del proyecto:
```env
NODE_ENV=development
PORT=8080
DB_NAME=backend1
PERSISTENCE=fs
MONGO_URL=mongodb://localhost:27017/backend1
```

2. Iniciar el servidor:
```bash
npm start
```

### Configuración Automática Completa
```bash
npm run setup       # Configuración automática completa con datos de ejemplo
npm start
```

### ¿Cuál opción elegir?

| Aspecto | Opción 1 (Automática) | Opción 2 (Manual) |
|---------|----------------------|-------------------|
| **Facilidad** | ✅ Muy fácil - un solo comando | ⚙️ Requiere crear archivos manualmente |
| **Flexibilidad** | ✅ Cambio dinámico desde la interfaz | ⚙️ Control total desde el inicio |
| **Principiantes** | ✅ Ideal para empezar rápido | ❌ Requiere conocimiento de configuración |
| **Desarrollo** | ✅ Perfecto para pruebas y demos | ✅ Mejor para desarrollo específico |
| **Configuración .env** | ✅ Se crea automáticamente | ⚙️ Debes crearlo manualmente |

**💡 Recomendación:** Usa la **Opción 1** para empezar rápidamente y explorar el sistema. Cambia a la **Opción 2** cuando necesites un control más específico de la configuración.

### 📋 Notas Importantes

- **Archivo .env:** Si no existe, el sistema funciona con FileSystem por defecto
- **Cambio dinámico:** Puedes alternar entre MongoDB y FileSystem desde la interfaz web sin editar archivos
- **Datos independientes:** Cada sistema de persistencia mantiene sus propios datos
- **Migración:** Usa el botón "Migrar Datos" para transferir información entre sistemas
- **Reinicio requerido:** Después de cambiar la persistencia, reinicia el servidor para aplicar todos los cambios

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

| Comando | Descripción | Cuándo usar |
|---------|-------------|-------------|
| `npm start` | Iniciar servidor | Siempre para ejecutar la aplicación |
| `npm run setup` | Configuración automática completa | Primera instalación con datos de ejemplo |
| `npm run db:setup` | Configurar MongoDB con datos | Configuración manual de MongoDB |
| `npm run db:export` | Exportar datos actuales | Crear respaldo de datos |
| `npm run db:import` | Importar datos desde backup | Restaurar datos desde respaldo |

**Ejemplo de flujo típico:**
```bash
# Opción 1: Inicio rápido
npm install
npm start
# Usar interfaz web para cambiar a MongoDB si es necesario

# Opción 2: Configuración manual con MongoDB
npm install
# Crear archivo .env manualmente
npm run db:setup
npm start
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