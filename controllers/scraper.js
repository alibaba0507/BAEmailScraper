exports.start = function(query, googlePageToStartFrom, maxGooglePage, fileName,regex = '',isArticles = false) {
    const request = require("request");
	const cheerio = require('cheerio');
    const Config = require("../controllers/config.js");
    const domainsToSave = Config.domains();

    var currentPage = 0;
    var extractedEmailsArray = [];
	var pageCnt = 0;
	// Desired class substrings
	const desiredClassSubstrings = ['article', 'content','main'];

	// Create a DOMParser instance
	//const parser = new DOMParser();
    //var regex = regex;
    function queryGoogle(page) {
        currentPage = page;
        console.log(">>>>>>>>>>>>> [" + regex  +"]>>>>>");
		// User-Agent header to mimic a browser
        const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3';
		//const userAgent = 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6; rv:1.9.2.16) Gecko/20110319 Firefox/3.6.16';
        // Cookie storage
		const cookies = request.jar();

        var options = {
            url: "http://www.google.com/search?q="+query+'&start='+page*10,
            /*headers: {
                'User-Agent': 'request'
            },*/
			headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            },
			//jar: cookies, // Attach cookies to the request
            timeout: Config.settings().reqestTimeOut
        };

        function requestCallback(error, response, body) {
            if (error) {
                console.error("Google Request error.");
                getUrls("");
            } else {
                if (response.statusCode === 200) {
                    getUrls(body);
                } else {
                    if (response.statusCode === 503) {
                        console.error("Blocked by Google try after a couple of hours.");
                        console.error("NOTE: Don't query a lot of pages at once.");
                        return;
                    } else {
                        getUrls("");
                    }
                }
            }
        }
        request(options, requestCallback);
    }
    queryGoogle(googlePageToStartFrom-1);

    function getUrls(text) {
        console.info("Google Page "+(currentPage+1));

        var urlsToQuery = 0;
        var callbacksMade = 0;

        if (text === "") {
            if (currentPage < maxGooglePage-1) {
                queryGoogle(currentPage+1);
            } else {
                console.log("Extracting complete. "+extractedEmailsArray.length+" total emails found.");
            }

            return;
        }
        //console.log("============ TEXT ===========[" + text + "]======================" );
		saveToFile(text,generateUniqueFileName() + '.html');
		let searchFor = scrapeGoogleSearch(text, ['div.UwRFLe','div.Lt3Tzc' ] );
		saveToFile(JSON.stringify(searchFor),generateUniqueFileName() + '.json');
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        text.replace(urlRegex, function(url) {
            if (url.indexOf("&amp;") !== -1) {
                var _url = url;
                if (!_url.includes("://webcache") && !_url.includes("://maps.google") && !_url.includes("/dumps/")) {
                    if (_url.slice(0, url.indexOf("&amp;")) !== "") {
                        urlsToQuery = urlsToQuery + 1;
                        
                        var finalUrl = _url.slice(0, url.indexOf("&amp;"));
                        
                        queryUrls(finalUrl, function(url) {
                            callbacksMade = callbacksMade + 1;

                            if (callbacksMade === urlsToQuery) {
                                console.error("Extracting complete. "+parseInt(callbacksMade*100/urlsToQuery)+"%");
                                console.log(extractedEmailsArray.length+" total emails found.");

                                if (currentPage < maxGooglePage-1) {
                                    queryGoogle(currentPage+1);
                                } else {
                                    console.log("Extracting complete. "+extractedEmailsArray.length+" total emails found.");
                                }
                            } else {
                                console.log("Extracting emails... "+parseInt(callbacksMade*100/urlsToQuery)+"%");
                            }
                        });
                    }
                }   
            }
        });
    }

    function queryUrls(url, callback) {
        var extractedEmailsString = "";

        var options = {
            url: url,
            headers: {
                'User-Agent': 'request'
            },
			//jar: request.jar(), // Attach cookies to the request
            timeout: Config.settings().reqestTimeOut
        };
        console.log("-------URL[" + url + "]------");
        function requestCallback(error, response, body) {
            if (error) {
                extractEmails("error");
                console.error("Request error.");
            } else {
                if (response.statusCode === 200) {
					
                    (!isArticles) ? extractEmails(body):extractArticle(body);
                } else {
                    extractEmails("error");
                    // console.error(response.statusCode);
                }
            }
        }
        request(options, requestCallback);
		
        function extractArticle(htmlContent)
		{
			console.log(" >>>> PARSE ARTICLE >>>>>>" );
			  // Parse the HTML content
			// Parse the HTML content
			//const doc = parser.parseFromString(htmlContent, 'text/html');
            // Load HTML content into cheerio
			const $ = cheerio.load(htmlContent);
			// Find and extract the first matching element based on class substrings
			let matchedElement = null;
			// Find and extract elements based on class substrings
			// Find and extract elements based on class substrings
			desiredClassSubstrings.forEach(substring => {
			  $(`[class]`).filter(function() {
				const classNames = $(this).attr('class').split(' ');
				return classNames.some(className => className.includes(substring));
			  }).each((index, element) => {
				  if (!matchedElement)
				  {
					const elementContent = $(element).text().trim();
					//console.log(`Element ${index + 1}:`, elementContent);
					matchedElement = elementContent;
				  }
			  });
			});
			
			// Display the extracted article body
			if (matchedElement) {
			  const elementContent = matchedElement;//matchedElement.textContent.trim();
			  saveToFile(elementContent,query + "_" + generateUniqueFileName() + '.txt');
			  //console.log('Matched Element:', elementContent);
			} else {
			  console.log('No matching element found.');
			  // saveToFile(htmlContent,generateUniqueFileName() + '.txt');
			}
		}
		
		
		
        function extractEmails(body) {
			console.log(" >>>> PARSE EMAIL >>>>>>");
			if (regex == '')
			{
				console.log(" >>>> PARSE EMAIL (I)>>>>>>");
				const extractEmails = require('extract-emails');
				var emails = extractEmails(body);
            }else
			{
				console.log(" >>>> PARSE EMAIL (II)>>>>>>");
				var striptags = require('striptags');
				//var stripedHtml = body.replace(/<(?:.|\n)*?>/gm, ' '); //body.replace(/<[^>]+>/g, '');
				//saveToFile(body,"page_" + pageCnt + ".html");
				pageCnt++;
				//var decodedStripedHtml = he.decode(stripedHtml);
				body = body = striptags(body);//stripedHtml;
				re = new RegExp(regex, "g");
				var emails = body.toLowerCase().match(re);
				if (emails)
				 console.log(">>> Custom REGEx[" + emails.length + "]>>>");
			   
					
			}
			if (emails)
				emails.forEach(function(email, i) {
					console.log(" >>>> EMAIL [" + email + "]> >>");
					if (regex != '' || 
						(!extractedEmailsArray.includes(email) && domainIsValid(email) && syntaxIsValid(email) && isCustomSyntaxValid(email))) {
						extractedEmailsArray.push(email);
						if (extractedEmailsString === "") {
							extractedEmailsString = extractedEmailsString + email;
						} else {
							extractedEmailsString = extractedEmailsString + "\n"+ email;
						}
					}

					if (i == emails.length-1) {
						saveToFile(extractedEmailsString);
					}
				});

            callback(url);
        }
    }
    function saveToFile(data,fn ='') {
        var fs = require('fs');
		if (fn != '')
			fs.appendFileSync(Config.settings().listFolder + fn, "\n"+data);
	    else if (fileName)
			fs.appendFileSync(Config.settings().listFolder + fileName, "\n"+data);
    }
    /*
    function saveToFile(data) {
        var fs = require('fs');
        fs.appendFileSync(Config.settings().listFolder + fileName, "\n"+data);
    }
	*/

    function domainIsValid(email) {
        var b = false;
    
        domainsToSave.forEach(function(domain) {
            if (domain === email.slice(email.indexOf("@"), email.length)) {
                b = true;
            }
        });

        return b;
    }

    function syntaxIsValid(email) {
        var re = /^((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))$/;
        return re.test(String(email).toLowerCase());
    }

    function isCustomSyntaxValid(email) {
        var b = true;

        if (email.slice(0, email.indexOf("@")).length > Config.settings().max_character_local_part) {
            b = false;
        }

        if (!Config.settings().saveEmailsWithNumberOnlyLocalPart) {
            function isInt(n) {
                return n % 1 === 0;
            }

            if (isInt(email.slice(0, email.indexOf("@")))) {
                b = false;
            }
        } 

        if (email.slice(0, email.indexOf("@")).length < Config.settings().min_character_local_part) {
            b = false;
        }

        return b;
    }
	
	function scrapeGoogleSearch(htmlText, selectors) {
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
		return extractedData;
	  } catch (error) {
		console.error('Error scraping Google:', error);
		return null;
	  }
	}

	// Function to generate a unique file name
	function generateUniqueFileName() {
	  const timestamp = new Date().getTime(); // Get current timestamp
	  const randomString = Math.random().toString(36).substring(2, 8); // Generate a random string
	  
	  return `${timestamp}_${randomString}`;
	}
}