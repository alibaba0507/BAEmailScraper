echo OFF
pause
rem node app.js -q "+site:docs.google.co.uk \"@gmail.com\" \"@live.com\" \"@yahoo.com\" \"@hotmail.com\"" -f docs.google.co.uk.txt
rem node app.js -q "gmail bitcoin btc filetype:txt" -f bitcoin_2.txt
node app.js -q "@ gmail|yahoo|aol|msn|hotmail keto|diet filetype:txt OR filetype:csv" -f keto_diet_4.txt
rem node app.js -q "What are the basic rules for keto" --articles 1
pause