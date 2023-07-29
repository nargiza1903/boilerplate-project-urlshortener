// Load environment variables from .env file if present
require('dotenv').config();

// Import required modules
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const shortid = require('shortid');

// Use body-parser middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: false }));

// Object to store URL mappings
const urls = {};

// Set the port number for the server
const port = process.env.PORT || 3000;

// Enable Cross-Origin Resource Sharing (CORS) for all routes
app.use(cors());

// Serve static files from the 'public' directory
app.use('/public', express.static(`${process.cwd()}/public`));

// Route to serve the index.html file
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// API endpoint to greet the user
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// API endpoint to handle URL shortening
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Parse the provided URL
  const parsedUrl = new URL(originalUrl);
  
  // Validate the URL using DNS lookup
  dns.lookup(parsedUrl.hostname, function(err, address, family) {
    if (err) {
      // If the URL is invalid, send an error response
      res.json({ error: 'invalid url' });
    } else {
      // Generate a short URL using the 'shortid' library and store the mapping
      const shortUrl = shortid.generate();
      urls[shortUrl] = originalUrl;
      // Respond with the original and short URLs
      res.json({ original_url: originalUrl, short_url: shortUrl });
    }
  });
});

// API endpoint to handle redirection based on short URLs
app.get('/api/shorturl/:id', function(req, res) {
  const shortUrl = req.params.id;
  // Look up the original URL from the 'urls' object using the short URL
  const originalUrl = urls[shortUrl];
  if (originalUrl) {
    // If the short URL exists, redirect the user to the original URL
    res.redirect(originalUrl);
  } else {
    // If the short URL does not exist, send an error response
    res.json({ error: 'invalid url' });
  }
});

// Start the server and listen on the specified port
app.listen(port, function() {
  console.log(`Server listening on port ${port}`);
});
