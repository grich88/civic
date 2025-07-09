const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable detailed logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Set security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Diagnostic endpoint
app.get('/debug', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const distPath = path.join(__dirname, 'dist');
  const indexPath = path.join(distPath, 'index.html');
  const jsPath = path.join(distPath, '_expo/static/js/web');
  
  try {
    const distExists = fs.existsSync(distPath);
    const indexExists = fs.existsSync(indexPath);
    const jsExists = fs.existsSync(jsPath);
    
    let jsFiles = [];
    if (jsExists) {
      jsFiles = fs.readdirSync(jsPath);
    }
    
    let indexContent = '';
    if (indexExists) {
      indexContent = fs.readFileSync(indexPath, 'utf8').substring(0, 500);
    }
    
    res.json({
      status: 'debug',
      timestamp: new Date().toISOString(),
      port: PORT,
      paths: {
        distExists,
        indexExists,
        jsExists,
        distPath,
        indexPath,
        jsPath
      },
      jsFiles,
      indexContentPreview: indexContent,
      nodeVersion: process.version,
      platform: process.platform,
      cwd: process.cwd(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      stack: error.stack
    });
  }
});

// Test emergency version
app.get('/emergency', (req, res) => {
  console.log('Serving emergency version');
  res.sendFile(path.join(__dirname, 'dist', 'test-app.html'));
});

// Catch-all handler: send back index.html for any non-API routes
app.get('*', (req, res, next) => {
  // Don't interfere with static assets
  if (req.url.includes('.')) {
    return next();
  }
  
  console.log(`Serving index.html for route: ${req.url}`);
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  const emergencyPath = path.join(__dirname, 'dist', 'test-app.html');
  
  // Try to serve the main React app first
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html, falling back to emergency version:', err);
      // Fallback to emergency version
      res.sendFile(emergencyPath, (fallbackErr) => {
        if (fallbackErr) {
          console.error('Error serving emergency version:', fallbackErr);
          res.status(500).send('Error loading application');
        }
      });
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal Server Error');
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Civic Impact Tickets server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 App available at: http://localhost:${PORT}`);
  console.log(`🔧 Debug endpoint: http://localhost:${PORT}/debug`);
  console.log(`📁 Serving from: ${__dirname}/dist`);
});

// Handle server startup errors
server.on('error', (err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
}); 