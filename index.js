// @ts-check

const app = require('./app');
const http = require('http');
const port = process.env.PORT || 80;
const db = require('./lib/mongodb');
app.set('port', port);

//  * Create HTTP server.
const server = http.createServer(app);

db.connect((err) => {
  if (err) {
    console.log('unable to connect')
    process.exit(1)
  }
  else {
    server.listen(port);
    // server.on('error', onError);
    // server.on('listening', onListening);
    console.log("listening on port " + port)
  }
})
