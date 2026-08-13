const http = require('http');
const fs = require('fs');
const path = require('path');

http.createServer((req, res) => {
  const arquivo = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

  fs.readFile(arquivo, (err, data) => {
    if (err) {
      res.writeHead(404).end('Arquivo não encontrado');
      return;
    }
    res.end(data);
  });
}).listen(3000, () => console.log('http://localhost:3000'));