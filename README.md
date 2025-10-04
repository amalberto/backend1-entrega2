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
- **MongoDB** (opcional, pero recomendado - también funciona con FileSystem en caso de no estar instalado Mongo) 

### Instalación

```bash
git clone https://github.com/amalberto/backend1-entregaFinal
cd backend1-entregaFinal
npm install
```

### Configuración - Dos opciones disponibles:

####  **Inicio Rápido**
La forma más sencilla de empezar:

```bash
npm install
npm start
```

El sistema iniciará por defecto con **FileSystem** (archivos JSON locales). Visita http://localhost:8080 y tendrás acceso a todas las funcionalidades.

####  **Configurar MongoDB (Recomendado)**
Si preferís usar MongoDB como base de datos:

1. **Asegúrate de tener MongoDB ejecutándose** en tu sistema
2. **Configura el sistema** para usar MongoDB:
   ```bash
   npm run use:mongo
   ```
3. **Carga productos de ejemplo** (opcional):
   ```bash
   npm run db:seed
   ```
4. **Reinicia el servidor**:
   ```bash
   npm stop
   npm start
   ```

####  **Cambio Dinámico de Persistencia**
También podés cambiar entre FileSystem y MongoDB desde la interfaz web:
1. Visita http://localhost:8080
2. Haz clic en **"Cambiar a MongoDB"** o **"Cambiar a File System"**
3. Reinicia el servidor cuando se te indique

### ¿Cuál opción elegir?

| Aspecto | FileSystem | MongoDB |
|---------|------------|---------|
| **Facilidad** | ✅ Funciona inmediatamente | ⚙️ Requiere instalar MongoDB |
| **Persistencia** | 📁 Archivos JSON locales | 🗄️ Base de datos MongoDB |
| **Rendimiento** | ⚡ Rápido para pocos datos | 🚀 Mejor para gran volumen |
| **Principiantes** | ✅ Ideal para empezar | ⚙️ Requiere conocimiento de MongoDB |
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

### Scripts Disponibles

| Comando | Descripción | Cuándo usar |
|---------|-------------|-------------|
| `npm start` | Iniciar servidor | Siempre para ejecutar la aplicación |
| `npm run use:mongo` | Configurar MongoDB | Cambiar persistencia a MongoDB desde terminal |
| `npm run db:seed` | Cargar productos de ejemplo | Usar base de datos con datos de prueba |
| `npm run db:export` | Exportar datos actuales | Crear respaldo de datos |
| `npm run db:import` | Importar datos desde backup | Restaurar datos desde respaldo |

**Ejemplo de flujo típico:**
```bash
# Inicio rápido con FileSystem
npm install
npm start

# Cambiar a MongoDB con datos de ejemplo
npm run use:mongo
npm run db:seed
npm start

# O usar la interfaz web en http://localhost:8080
# para cambiar persistencia dinámicamente
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
