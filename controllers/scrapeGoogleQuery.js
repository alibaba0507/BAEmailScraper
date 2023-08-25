const request = require("request");
const cheerio = require('cheerio');
const Config = require("../controllers/config.js");

class GoogleScrapeQuery {
	/**
	 * this is a function that will search and parse goole page
     * based on quey and the page Number
     * @searchQueyCallback callback function if not null will extract related query and question on the page if any
	 * @pageLinksCallback callback function if not null will pase and pass all urls on the page related to the query search
	*/
  start(query, page = 0,searchQueyCallback,pageLinksCallback,selectors = ['div.UwRFLe','div.Lt3Tzc' ])
  {
	if (!searchQueyCallback && !pageLinksCallback)
		return; // do nothing
    page = Number(page);
	const url = "http://www.google.com/search?q="+query+'&start='+page*10;
	
	
	function requestCallback(error, response, body) {
		if (error) {
			console.error("Google Request error.");
			if(searchQueyCallback)
				parseRelatedSearches("",searchQueyCallback,selectors);
			if(pageLinksCallback)
				parseLinks("");
		} else {
			if (response.statusCode === 200) {
				if(searchQueyCallback)
					parseRelatedSearches(body,searchQueyCallback,selectors);
				if(pageLinksCallback)
					parseLinks(body,pageLinksCallback);
			} else {
				if (response.statusCode === 503) {
					console.error("Blocked by Google try after a couple of hours.");
					console.error("NOTE: Don't query a lot of pages at once.");
					return;
				} else {
					parsePageBody("");
				}
			}
		}
	}
    fetch(url, requestCallback);
  }
  /**
   * fetch the url and return it with callback fuction
   */
	function fetch(url, callback, params = {}) {
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
			timeout: Config.settings().reqestTimeOut
		};

		request(options, callback);
	}

  
  parseRelatedSearches(htmlText,callback,selectors = ['div.UwRFLe','div.Lt3Tzc' ])
  {
	  try {
		const $ = cheerio.load(htmlText);

		const extractedData = {};

		for (const selector of selectors) {
		  const selectedData = [];
		  //console.log('--------- selector[' + selector + '] -----');
		  $(selector).each((index, element) => {
			// console.log('--------- selector Found[' + $(element).text() + '] -----');
			selectedData.push($(element).text());
		  });
		  extractedData[selector] = selectedData;
		}
        //console.log('--------- selector End [' + JSON.stringify(extractedData) + '] -----');
		callback(extractedData);
		return 1;
	  } catch (error) {
		console.error('Error scraping Google:', error);
		return null;
	  }
  }
  parseLinks(text,callback)
  {
	var urlRegex = /(https?:\/\/[^\s]+)/g;
	var urlsArray = text.match(urlRegex) || [];
	callback(urlsArray);
  }
}

// Export the GoogleScrapeQuery class to be used in other modules
module.exports = GoogleScrapeQuery;