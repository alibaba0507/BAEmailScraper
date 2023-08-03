echo OFF
pause
rem node app.js -q "+site:docs.google.co.uk \"@gmail.com\" \"@live.com\" \"@yahoo.com\" \"@hotmail.com\"" -f docs.google.co.uk.txt
rem node app.js -q "gmail bitcoin btc filetype:txt" -f bitcoin_2.txt
node app.js -q "@ gmail|yahoo|aol|msn|hotmail keto|diet filetype:txt OR filetype:csv" -f keto_diet_3.txt
rem node app.js -q "View the profile @ gmail|yahoo|aol|msn|hotmail bitcoin" -f bitcoin_1.txt --rgex "\S+\s*@\s*\S+"
pause