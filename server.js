const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const GoogleScrapeQuery = require('./controllers/scrapeGoogleQuery.js'); // Include the .js extension
const scraper = new GoogleScrapeQuery();

const app = express();
const port = 3000;
let inDepthValue = 0;
let rootNode = []; // Initialize the root node
let jsonStructure = ""; // Store the JSON structure
let node = null;
let searchQuery
// Setup HTTP server and Socket.IO
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.urlencoded({ extended: true }));

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

// Handle form submission
app.post('/submit', (req, res) => {
    searchQuery = req.body.searchQuery;
    const extractRelated = req.body.extractRelated === 'on';
    inDepthValue = extractRelated ? parseInt(req.body.inDepthValue) || 0 : 0;
    
    // Reset the root node for each form submission
    rootNode = [];
    
    // Now you can use the GoogleScrapeQuery class
    scraper.start(searchQuery, 0, callbackRelatedSearch, null);

    //res.send('Form submitted successfully');
	//io.emit('jsonStructure', 'Form submitted successfully');
});

// Callback for related search data
function callbackRelatedSearch(links) {
	const linkDivs = [];
	const delay = 1; // Adjust as needed
	 // Iterate through each selector's links and call scraper.start for each link multiple times
    const index = jsonStructure.indexOf( searchQuery );
	for (const selectorLinks of Object.values(links)) {
        for (const link of selectorLinks) {
			//console.log('----------------[' + link + ']-----------------');
			if (index > -1) 
             linkDivs.push(`<div class="link-div inner">${link}</div>`);
		    else
			  linkDivs.push(`<div class="link-div">${link}</div>`);
        }
    }
	
	if (index > -1) {
		const beforeQuery = jsonStructure.slice(0, index + searchQuery.length );
		const afterQuery = jsonStructure.slice(index + searchQuery.length);

		// Combine the parts with the linkDivs
		jsonStructure = beforeQuery + linkDivs.join('') + afterQuery;
		console.log('----------------[' + searchQuery + ']-----------------');
		console.log('----------------[' + jsonStructure + ']-----------------');
	}else
		jsonStructure += linkDivs.join('')
	// Inside the callbackRelatedSearch function
	io.emit('jsonStructure', { jsonStructure, searchQuery });
	// Emit a separate event to signal completion
	io.emit('processingComplete'); 
	inDepthValue--;

	return;
}

// Create a node for the tree
function createNode(link, depth) {
    return {
        link,
        depth,
        children: []
    };
}

// Build the tree structure
function buildTree(selectorLinks, depth) {		
    const nodeArray = [];
    if (node == null) return nodeArray;
    for (const link of selectorLinks) {
        const node_child = createNode(link, depth);
        //if (depth > 0) {
            //const childLinks = scraper.getLinks(link); // Assuming a method to get links from a page
            node.children.push(node_child);
        //}
    }
    nodeArray.push(node);
    return nodeArray;
}

// Convert a node to JSON
function convertNodeToJSON(node) {
    return JSON.stringify(node, null, 2); // Use 2 for indentation
}

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
