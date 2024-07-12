#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('learnsocketio:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);


// meto el SOCKET justo despues de crear el SERVER.
const io = require('socket.io')(server);

// Ahora por ejem. me suscribo al evento típico, llamado cada vez que new cliente se conecta:
io.on('connection', (socket) => {
  console.log('Se ha conectado un nuevo cliente');

  // emisión solo a los sockets que ya estaban conectados
  socket.broadcast.emit('envio_datos', {
    user: 'INFO',
    msg: 'Se ha conectado un nuevo usuario al chat'
  });

  // Emitir a todos clientes el numero de clientes conectados
  io.emit('num_sockets', io.engine.clientsCount);


  //Nos suscribimos al evento emit del cliente (html) y recibimos en el server los datos del form en este caso
  socket.on('envio_datos', data => {
    // Ahora además de recibir los datos de cualquier cliente
    io.emit('envio_datos', data); // tmb emitimos a los demás sockets(clientes) el mensaje del socket que emitió
  });

  // cuando un socket se desconecte llamamos al mismo evento num_sockets y actualizamos dato
  socket.on('disconnect', () => {
    io.emit('num_sockets', io.engine.clientsCount);
    io.emit('envio_datos', {
      user: 'INFO',
      msg: 'Se ha desconectado un cliente'
    })
  })

});


/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
