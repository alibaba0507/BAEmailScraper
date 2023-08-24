echo OFF
pause
rem node app.js -q "+site:docs.google.co.uk \"@gmail.com\" \"@live.com\" \"@yahoo.com\" \"@hotmail.com\"" -f docs.google.co.uk.txt
rem node app.js -q "gmail bitcoin btc filetype:txt" -f bitcoin_2.txt
rem node app.js -q "@ gmail|yahoo|aol|msn|hotmail keto|diet filetype:txt OR filetype:csv" -f keto_diet_3.txt
node app.js -q "Keto diet foods to avoid" --articles 1
pause