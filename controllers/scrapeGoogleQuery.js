const request = require("request");
const cheerio = require('cheerio');
const axios = require('axios');
const Config = require("../controllers/config.js");
const { SocksProxyAgent } = require('socks-proxy-agent');

class GoogleScrapeQuery {
	 constructor() {
		// Configure the Tor proxy address and port.
		this.torProxy = 'socks5://127.0.0.1:9150'; // Default Tor proxy address and port.

		// Create an instance of the SocksProxyAgent.
		this.agent = new SocksProxyAgent(this.torProxy);
	}
	stopProxy(){
	 this.agent = null;
	}
	/**
	 * this is a function that will search and parse goole page
     * based on quey and the page Number
     * @searchQueyCallback callback function if not null will extract related query and question on the page if any
	 * @pageLinksCallback callback function if not null will pase and pass all urls on the page related to the query search
	* for result about ['div#result-stats']
	*/
  start(query, page = 0,searchQueyCallback,pageLinksCallback,errorCallBack,selectors = ['div.UwRFLe','div.Lt3Tzc' ])
  {
	if (!searchQueyCallback && !pageLinksCallback)
		return; // do nothing
    page = Number(page);
	const url = 'http://www.google.com/search?q="'+query+'"&start='+page*10;
	
	const _this = this;
	function requestCallback(error, response, body) {
		console.log('-------------------- requestCallback [' + response?.statusCode + ']----------------------');
		if (error) {
			console.error("Google Request error.[" + query + "][" + url + "]page[" + page+ "][" + JSON.stringify(error) + "]");
			/*if(searchQueyCallback)
				_this.parseRelatedSearches("",searchQueyCallback,selectors);
			if(pageLinksCallback)
				_this.parseLinks("");
			*/
		} else {
			if (response?.statusCode === 200) {
				if(searchQueyCallback)
					_this.parseRelatedSearches(body,searchQueyCallback,selectors);
				if(pageLinksCallback)
					_this.parseLinks(body,pageLinksCallback);
			} else {
				if (response.statusCode === 503) {
					console.error("Blocked by Google try after a couple of hours.[" + query + "][" + url + "]page[" + page+ "]");
					console.error("NOTE: Don't query a lot of pages at once.[" + query + "][" + url + "]page[" + page+ "]");
					return;
				} else {
					if (errorCallBack)
						errorCallBack(body);
					//_this.parseLinks(body,(pageLinksCallback)?pageLinksCallback:searchQueyCallback);
				}
			}
		}
	}
	console.log('-------------------- Before fetch ----------------------');
    this.fetch(url, requestCallback);
  }
  /**
   * fetch the url and return it with callback fuction
   */
    fetch(url, callback, params = {}) {
		const headers = {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
		};

		// Iterate through the keys of the params object and add them to the headers
		for (const key in params) {
			headers[key] = params[key];
		}

		const options = {
			url: url,
			headers: headers,
			timeout: Config.settings().reqestTimeOut,
			agent: this.agent,// Use the Tor-enabled proxy agent
		};

		request(options, callback);
		//const a  =this.agent;
		//const client = axios.create({url, a});
		//const googlePage = client.get('/').then(res => {console.log(res.data);});
	}

  
  parseRelatedSearches(htmlText,callback,selectors = ['div.UwRFLe','div.Lt3Tzc' ])
  {
	  try {
		const $ = cheerio.load(htmlText);
        var domaninsArray = [];
		this.parseLinks(htmlText,(links)=>{
			// Create a Set to store unique domains
			const uniqueDomains = new Set();
			// Iterate through the URL links
			for (const url of links) {
			  // Parse the URL to get the hostname (domain)
			  const { hostname } = new URL(url);

			  // Add the domain to the Set (automatically handles uniqueness)
			  if (hostname.indexOf('.google.') == -1)
				uniqueDomains.add(hostname);
			}
			domaninsArray = Array.from(uniqueDomains);
		});
		const extractedData = {};

		for (const selector of selectors) {
		  const selectedData = [];
		  //console.log('--------- selector[' + selector + '] -----');
		  $(selector).each((index, element) => {
			console.log('--------- selector Found[' + $(element).text() + '] -----');
			selectedData.push($(element).text());
		  });
		  extractedData[selector] = selectedData;
		}
        //console.log('--------- selector End [' + JSON.stringify(extractedData) + '] -----');
		callback(extractedData,domaninsArray);
		return 1;
	  } catch (error) {
		console.error('Error scraping Google:', error);
		return null;
	  }
  }
  
  parseLinks(text,callback)
  {
	var urlRegex = /(https?:\/\/[^\s]+)/g;
	var urlsArray = [];//text.match(urlRegex) || [];
	text.replace(urlRegex, function(url) {
		if (url.indexOf("&amp;") !== -1) {
			var _url = url;
			if (!_url.includes("://webcache") && !_url.includes("://maps.google") && !_url.includes("/dumps/")) {
				if (_url.slice(0, url.indexOf("&amp;")) !== "") {					
					let finalUrl = _url.slice(0, url.indexOf("&amp;"));
					urlsArray.push(finalUrl);
				}
			}   
		}
	});
	callback(urlsArray);
  }
}

// Export the GoogleScrapeQuery class to be used in other modules
module.exports = GoogleScrapeQuery;