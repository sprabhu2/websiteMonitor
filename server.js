// required packages
const express = require('express');
const excelJs = require('ExcelJS')
var nodemailer = require('nodemailer');
const request = require('request');
var fs = require("fs");

//Express configuration
const app = express();
app.use(express.static('public'));
const PORT = process.env.PORT || 4000;

const dbFilePath = './LocalDatabase.txt'; //txt file as a temp DB
const historyFilePath = './history.xlsx'; //excel file to store history
const urlToCheck = 'https://sprabhu2.github.io/conferenceBingo/'; //Application Url to monitor

// Email Configs, for simplicity using gmail server
const mailProvider = 'gmail';
const mailUser = 'sachu.prabhu3@gmail.com'; // your gmailID
const mailPass = 'testPASS@1991'; // your gmailPass
const fromEmail = 'sachu.prabhu3@gmail.com';
const toEmail = 'sachu.prabhu@gmail.com';

//NodeMailer
const transporter = nodemailer.createTransport({
    service: mailProvider,
    auth: {
        user: mailUser,
        pass: mailPass
    }
});

//Main method, to start Monitoring
function startMonitor(frequency) {
    const intervalId = setInterval(function () {
        request(urlToCheck, function (err, response, body) {
            //if the request fails
            if (err) {
                console.log(`Request Error - ${err}`);
            }
            else {
                //if the page content is empty
                if (!body) {
                    console.log(`Request Body Error - ${err}`);
                }
                else {
                    fs.readFile(dbFilePath, function (err, buf) {
                        let oldPage = buf.toString();
                        if (oldPage != body) {

                            //Update DB with new website content
                            writeFile(dbFilePath, body);

                            //Update history tracker
                            writeHistory();

                            // Send alert email
                            sendEmail();
                        }
                    });
                }
            }
        });
    }, frequency);

}

// txt localDB write
function writeFile(path, data) {
    fs.writeFile(path, data, 'utf-8', err => {
        if (err) {
            console.log(err);
        }
    })
}

// Method to write change history
function writeHistory() {
    let time = new Date();
    let currentTime = time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
    let currentDate = ("0" + time.getDate()).slice(-2) + '-' + ("0" + (time.getMonth() + 1)).slice(-2) + '-' + time.getFullYear();
    var workbook = new excelJs.Workbook();
    workbook.xlsx.readFile(historyFilePath)
        .then(function () {
            var worksheet = workbook.getWorksheet(1);
            var lastRow = worksheet.lastRow;
            var getRowInsert = worksheet.getRow(++(lastRow.number));
            getRowInsert.getCell('A').value = currentDate;
            getRowInsert.getCell('B').value = currentTime;
            getRowInsert.getCell('C').value = 'Change detected home screen';
            getRowInsert.getCell('D').value = urlToCheck;
            getRowInsert.commit();
            return workbook.xlsx.writeFile(historyFilePath);
        });

}

// Method to send email on change detection
function sendEmail() {
    const mailOption = {
        to: toEmail,
        from: fromEmail,
        subject: `Change detected in ${urlToCheck}`,
        html: `Change detected in <a href="${urlToCheck}"> ${urlToCheck} </a>  `,
    };
    transporter.sendMail(mailOption, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}



// Method to kick off monitoring. This method will tale frequency as a input. (frequency is in seconds)
app.get('/:frequency', function (req, res) {
    var time = req.params.time;
    checkingFrequency = time * 1000;
    startMonitor(checkingFrequency);
    res.send('Monitoring Started');
});

//Server start
app.listen(PORT, function () {
    console.log(`Example app listening on port ${PORT}!`)
});
