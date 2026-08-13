const http = require('http');
const fs = require('fs');
const path = require('path');
// Adiciona o Content-Type para que os módulos ES sejam carregados corretamente
const tipos = {
'.html': 'text/html',
'.js': 'text/javascript',
'.css': 'text/css',
};

http.createServer((req, res) => {
  const arquivo = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

  fs.readFile(arquivo, (err, data) => {
    if (err) {
      res.writeHead(404).end('Arquivo não encontrado');
      return;
    }
    // Add aqui tbm a primeira linha -  Informa o tipo do arquivo, necessário para o carregamento dos módulos ES
    res.writeHead(200, {'Content-Type': tipos [path.extname(arquivo)] || 'text/plain'});
    res.end(data);
  });
}).listen(3000, () => console.log('http://localhost:3000'));
