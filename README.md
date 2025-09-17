1. Clonar repositorio. git clone https://github.com/amalberto/backend1-entrega1.git
2. Usar npm install 
3. Usar npm start o directamente node server.js

   El servidor quedará corriendo en puerto 8080 por defecto, se puede modificar el puerto modificando 'const PORT' en server.js
   Se pueden gestionar productos en tiempo real utilizando Socket.IO, desde /realtimeproducts

 Endpoints disponibles:

   Endpoints con handlebars (GET):
     - http://localhost:8080/ (HOME)
     - http://localhost:8080/realtimeproducts (Gestión con socket.IO)

  API REST

 api/products 
 api/carts

Carácterísticas destacadas:
 Cors habilitado, estructura básica de middlewares, FS, Handlebars y socket.IO.
