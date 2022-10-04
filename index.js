const express = require('express')
const app = express()
const request = require('request')
const axios = require('axios')
const cheerio = require('cheerio')
// const yahooFinance = require("yahoo-finance");
const yahooFinance = require('yahoo-finance2').default;
const port = 3000

app.use('/', express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

// Date and time acquisition
const dateGet = new Date();
const year = dateGet.getFullYear();
const month = dateGet.getMonth();
const today = dateGet.getDate();
const yesterday = dateGet.getDate() - 1;
const time = dateGet.getHours() + 9;

const convertToday = new Date(year, month, today, time);
const convertYesterday = new Date(year, month, yesterday, time);

const isoToday = convertToday.toISOString().slice(0, 10);
const isoYesterday = convertYesterday.toISOString().slice(0, 10)

app.post('/crypt/', (req, res) => {
    let options = {
        method: 'GET',
        url: "https://api.bitflyer.com/v1/getticker?product_code=" + req.body.code,
        json: true,
    };
    request(options, function (error, response, body) {
        console.log(body.best_bid);
        res.send(body);
    });
});

app.post('/investtrust/', (req, res) => {
    let URL = "https://itf.minkabu.jp/fund/" + req.body.code

    axios(URL)
        .then((response) => {
            let htmlParser = response.data
            const $ = cheerio.load(htmlParser);

            let price = $(".fund_cv", htmlParser).find(".stock_price").text().slice(0, -1);
            console.log(price);
            res.send(JSON.stringify(parseInt(price.replace(/,/, ''))));
        })
});

app.post('/stock/', (req, res) => {

    async function stock() {
        let stock = await yahooFinance.quote(req.body.code);
        console.log(stock.regularMarketPrice)
        res.send(JSON.stringify(stock.regularMarketPrice));
    }
    stock();

    // yahooFinance.historical(
    //     {
    //         symbol: req.body.code,
    //         from: isoYesterday,
    //         to: isoToday
    //     },
    //     function (err, quotes) {
    //         res.send(JSON.stringify(quotes[0].close));
    //     }
    // )
});

app.post('/exchange/', (req, res) => {
    async function exchange() {
        let exchange = await yahooFinance.quote('USDJPY=X');
        console.log(exchange.regularMarketPrice)
        res.send(JSON.stringify(exchange.bid));
    }
    exchange();
    // yahooFinance.historical(
    //     {
    //         symbol: "USDJPY=X",
    //         from: isoYesterday,
    //         to: isoToday
    //     },
    //     function (err, quotes) {
    //         res.send(JSON.stringify(quotes[0].close));
    //     }
    // )
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))