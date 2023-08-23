const args = require('minimist')(process.argv.slice(2));

var BAEmailScraper = require("./controllers/scraper.js");
var searchQuery = 'keyword "@gmail.com" "@live.com" "@yahoo.com" "@hotmail.com"'; /* Google search query to find email address */

// Method: start()
// parameters 1: Google search query to find emails
// parameters 2: Google Page number to start
// parameters 3: Google Page number to end
// parameters 4: List file name to save emails

// Note: Don't query to many pages at once. Query 1 to 5 than 6 - 10 and so on. Google will block you if you query to much at once.
console.log(args);
if (args.h || !args.q)
{ // this is help;
   let s = 
 "================================================================\n\
    to run: \n\
    node app.js -q<search query> --sp<start page=1> \n\
            --ep<end page=1> -f<file to save emails>\n\
			--rgex<regex to parse search page if require>\n\
			--check<check email syntax values 0 or 1>\n\
			--articles<extract articles only values 0 or 1>\n\
    good exmaple for search query will be :\n\
    \"+1@yahoo.com @hotmail.com @gmail.com @aol.com txt 2018\"\n\
    where will search emials in txt files only 2018 \n\
  ===============================================================\n\
   ";
   console.log(s);
   return;
    
}
let sp = 1;
let ep = 1;
let f = "myEmailList1.txt";
let regex = '';
let articles = false;
if (args.q)
    searchQuery = args.q;
if (args.sp)
    sp = args.sp
if (args.ep)
    ep = args.ep
if (args.f)
    f = args.f;
if (args.rgex)
	regex = args.rgex;
if (args.articles && Number(args.articles) == 1)
	articles = true;
console.log("Search Query :"  + searchQuery);
console.log("Start Page :["  + sp + "] End Page:[" + ep + "] " );
console.log("Save To File :"  + f);
console.log("regex :"  + regex);

BAEmailScraper.start(searchQuery, sp, ep, f,regex,articles);