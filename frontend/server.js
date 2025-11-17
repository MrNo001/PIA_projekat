const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4200;

// Serve static files from the Angular app
app.use(express.static(path.join(__dirname, 'dist/frontend/browser')));

// Handle Angular routing - return index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/frontend/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

