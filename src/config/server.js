const http = require('http');
const { Server } = require('socket.io');
const app = require('../app');
const { registerSocket } = require('./socket');
const { initFS } = require('./database');

const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.set('io', io);
registerSocket(io);
initFS().catch(err => {
  console.error('Error inicializando filesystem:', err);
});

module.exports = { httpServer, io };
