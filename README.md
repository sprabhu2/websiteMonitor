# websiteMonitor
NodeJs application that monitors a website and send email trigger when changes detected

This is a demo code to monitor any website in a given interval and send email if any changes detected on the website page. 

For Demo,
1. Used txt file as a database to store the current website page details. This can be any treditional sql or noSql
2. Used excel file to track the history. This can be a saparate Ui application.
3. used gmail as a email server. 

To run the application
1. Checkout the code
2. npm install
3. node server.js
4. Once the application is running, call monitoring service using http://localhost:4000/:frequencyInSecond

