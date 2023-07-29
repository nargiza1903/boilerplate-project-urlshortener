require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const urlDatabase = {}; // A simple in-memory database to store the URLs
let counter = 0; // A counter to generate unique short URLs

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Check if the URL is valid using dns.lookup
  dns.lookup(originalUrl, (err, address, family) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Generate a unique short URL
    const shortUrl = generateShortUrl();

    // Store the URL in the database
    urlDatabase[shortUrl] = originalUrl;

    // Respond with the short URL and original URL
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

app.get('/api/shorturl/:shortUrl', function(req, res) {
  const shortUrl = req.params.shortUrl;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    // Redirect to the original URL
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'short URL not found' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

function generateShortUrl() {
  // Generate a unique short URL using a simple counter and increment it for each new URL
  return (++counter).toString();
}
