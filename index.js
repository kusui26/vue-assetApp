// index.js
const express = require('express');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');
const yahooFinance = require('yahoo-finance2').default;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// public フォルダ（HTML, CSS, main.js 等）を静的配信
app.use(express.static('public'));

// 外部リクエスト時のユーザーエージェント例
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; rv:118.0) Gecko/20100101 Firefox/118.0';

// ---- 1) 仮想通貨 ----
app.post('/crypt/', async (req, res) => {
    try {
        const code = req.body.code;
        // bitFlyer ticker API
        const url = `https://api.bitflyer.com/v1/getticker?product_code=${code}`;
        const response = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT },
        });
        if (!response.data || response.data.best_bid === undefined) {
            // API応答が想定外なら 500
            return res.status(500).json({ error: "Invalid crypt data." });
        }
        // そのまま JSON で返す
        // response.data は { best_bid: number, best_ask: number, ... } を想定
        res.json(response.data);
    } catch (error) {
        console.error(error);
        // 例外時は 500 ステータス + JSON で返す
        res.status(500).json({ error: error.message });
    }
});

// ---- 2) 投資信託 ----
app.post('/investtrust/', async (req, res) => {
    try {
        const code = req.body.code;
        const URL = "https://itf.minkabu.jp/fund/" + code;

        const response = await axios.get(URL, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(response.data);

        // 例: .fund_cv .stock_price から取得 → 末尾の「円」をsliceでカット
        let priceText = $(".fund_cv .stock_price").text().trim().slice(0, -1);
        // 3,456円 → "3456"
        let numericPrice = parseInt(priceText.replace(/,/g, ''), 10);

        if (isNaN(numericPrice)) {
            return res.status(500).json({ error: "Failed to parse price." });
        }
        res.json(numericPrice); // 数値を JSON 形式で返す
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// ---- 3) 株式 ----
app.post('/stock/', async (req, res) => {
    try {
        const code = req.body.code;
        const quote = await yahooFinance.quote(code);
        // quote.regularMarketPrice が数値として返ってくる想定
        if (!quote || quote.regularMarketPrice === undefined) {
            return res.status(500).json({ error: "Invalid stock data." });
        }
        res.json(quote.regularMarketPrice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// ---- 4) 為替 ----
app.post('/exchange/', async (req, res) => {
    try {
        // USDJPY=X を Yahoo Finance API で取得
        const exchange = await yahooFinance.quote('USDJPY=X');
        if (!exchange || exchange.bid === undefined) {
            return res.status(500).json({ error: "Invalid exchange data." });
        }
        // bid を返す
        res.json(exchange.bid);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
