require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");
const { nanoid } = require("nanoid");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const urlDatabase = {};

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl/new", function (req, res) {
  const { url } = req.body;

  // Check if the URL is valid
  const urlObj = new URL(url);
  const hostname = urlObj.hostname;

  dns.lookup(hostname, async (err) => {
    if (err) {
      res.json({ error: "Invalid URL" });
    } else {
      const id = nanoid(6); // Generate a random alphanumeric ID with length 6
      urlDatabase[id] = url;
      res.json({ original_url: url, short_url: id });
    }
  });
});

app.get("/api/shorturl/:id", function (req, res) {
  const id = req.params.id;
  const url = urlDatabase[id];

  if (url) {
    res.redirect(url);
  } else {
    res.json({ error: "Short URL not found" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
