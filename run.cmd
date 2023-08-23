echo OFF
pause
rem node app.js -q "+site:docs.google.co.uk \"@gmail.com\" \"@live.com\" \"@yahoo.com\" \"@hotmail.com\"" -f docs.google.co.uk.txt
rem node app.js -q "gmail bitcoin btc filetype:txt" -f bitcoin_5.txt --rgex "\S+\s*@\s*\S+"
rem node app.js -q "View the profile @ gmail|yahoo|aol|msn|hotmail bitcoin" -f bitcoin_1.txt --rgex "\S+\s*@\s*\S+"
node app.js -q "What are the basic rules for keto" --articles 1
pause