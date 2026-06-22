const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8765;
const ROOT = path.resolve(__dirname);

const MIME = {
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.json':'application/json','.png':'image/png','.jpg':'image/jpeg',
  '.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon',
  '.wasm':'application/wasm','.data':'application/octet-stream',
  '.tflite':'application/octet-stream','.txt':'text/plain',
};

const server = http.createServer((req, res) => {
  let fpath = path.join(ROOT, decodeURIComponent(req.url).split('?')[0]);
  if(fpath.endsWith('/')) fpath += 'index.html';

  fs.readFile(fpath, (err, data) => {
    if(err){
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(fpath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  });
});

server.listen(PORT, () => console.log('Server: http://localhost:' + PORT));
