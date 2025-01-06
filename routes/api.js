const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

router.get("/search", async (req, res) => {
  const query = req.query.query;
  const apiKey = process.env.GOOGLE_API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ error: "Google API key is missing" });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching Google Places API:", error);
    res.status(500).json({ error: "Failed to fetch data from API" });
  }
});

module.exports = router;
