const express = require('express');
const bodyParser = require('body-parser');
const GoogleScrapeQuery = require('./scrapeGoogleQuery.js'); // Include the .js extension
const scraper = new GoogleScrapeQuery();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.post('/submit', (req, res) => {
    const searchQuery = req.body.searchQuery;
    const extractRelated = req.body.extractRelated === 'on';
    const inDepthValue = extractRelated ? req.body.inDepthValue || 0:0;
    // Now you can use the GoogleScrapeQuery class
	scraper.start(searchQuery,0,callbackRelatedSearch,null);
    

    res.send('Form submitted successfully');
});
function callbackRelatedSearch(links)
{
	
}
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});