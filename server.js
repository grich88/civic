const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Specifically handle _expo routes (for Expo web bundles)
app.use('/_expo', express.static(path.join(__dirname, 'dist/_expo')));

// Handle assets
app.use('/assets', express.static(path.join(__dirname, 'dist/assets')));

// Add proper headers for JS files
app.use('*.js', (req, res, next) => {
  res.set('Content-Type', 'application/javascript');
  next();
});

// Handle React Router (SPA fallback to index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Civic Impact Tickets server running on port ${PORT}`);
  console.log(`📱 App available at: http://localhost:${PORT}`);
}); 