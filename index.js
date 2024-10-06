const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
// require('electron-reload')(path.join(__dirname, 'index.html','app.py'), {
//   electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
// });
const { createProxyMiddleware } = require('http-proxy-middleware');
const PORT = 9876;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      // webSecurity: false, // Disable web security to bypass CORS
      devTools: true
    }
  });


  // Load the HTML file from the local server
  mainWindow.loadURL(`http://localhost:${PORT}`);
}

app.on('ready', () => {
  // Create the HTTP server
  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/run/') || req.url.startsWith('/files/')) {
      console.log('API request:', req.url);
      // Proxy API requests
      const apiProxy = createProxyMiddleware({
        target: 'http://api.devnet.arsenum.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/run' // Rewrite URL path
        },
        onProxyReq: (proxyReq, req, res) => {
          // Add CORS headers to the proxy request
          proxyReq.setHeader('Access-Control-Allow-Origin', '*');
          proxyReq.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          proxyReq.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
      });
      apiProxy(req, res);
    } else {
      // Serve the HTML file
      fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading index.html');
        } else {
          res.writeHead(200, {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*', // Allow all origins
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          });
          res.end(data);
        }
      });
    }
  });

  server.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
    createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});