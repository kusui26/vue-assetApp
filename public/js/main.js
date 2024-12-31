// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"

// --- Firebase初期化は元のまま ---
const firebaseConfig = {
    apiKey: "AIzaSyDUKVhGPuqm9JSl_Svc_shbHYJJd7gR0uc",
    authDomain: "vue-assetapp.firebaseapp.com",
    projectId: "vue-assetapp",
    storageBucket: "vue-assetapp.appspot.com",
    messagingSenderId: "189444320546",
    appId: "1:189444320546:web:7d6233e14856b1499b897b"
};
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const { createApp } = Vue

const apple = Vue.createApp({
    data: () => ({
        cryptLists: [
            { cryptCode: '', cryptName: '', cryptGetValue: '', cryptStock: '', cryptValue: '', cryptTotalValue: '', cryptProfit: '' }
        ],
        investTrustLists: [
            {
                investTrustCode: '', investTrustName: '', investTrustGetValue: '', investTrustStock: '',
                investTrustValue: '', investTrustTotalValue: '', investTrustProfit: ''
            }
        ],
        stockLists: [
            { stockCode: '', stockName: '', stockGetValue: '', stockStock: '', stockValue: '', stockTotalValue: '', stockProfit: '' }
        ],
        depositLists: [{ bankName: '', branchName: '', depositAmount: '' }],
        exchangeValue: '',

        totalCryptAsset: 0,
        totalInvestTrustAsset: 0,
        totalStockAsset: 0,
        totalDepositAsset: 0,

        totalCryptGet: 0,
        totalInvestTrustGet: 0,
        totalStockGet: 0,

        graphValueLists: [],
        graphNameLists: [],

        username: ""
    }),
    methods: {
        assetUpdate: function () {
            this.totalCryptAsset = 0
            this.totalInvestTrustAsset = 0
            this.totalStockAsset = 0
            this.totalDepositAsset = 0
            this.totalCryptGet = 0
            this.totalInvestTrustGet = 0
            this.totalStockGet = 0
            this.graphValueLists = []
            this.graphNameLists = []

            this.cryptUpdate();
            this.investTrustUpdate();
            this.stockUpdate();
            this.depositUpdate();
        },

        // --- 修正ポイント: response.ok チェック & エラーハンドリング ---
        cryptUpdate: function () {
            this.cryptLists.forEach((cryptList) => {
                let json = { code: cryptList.cryptCode };

                fetch('/crypt/', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(json)
                })
                    .then(response => {
                        if (!response.ok) {
                            // ステータスがOK以外の場合はHTMLエラーページが返る可能性があるので、ここで止める
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(body => {
                        // body が { error: "..."} の可能性もあるのでチェックしておくとより安全
                        if (body.error) {
                            throw new Error(body.error);
                        }
                        // best_bid がなかった場合のチェック
                        if (body.best_bid === undefined) {
                            throw new Error("Invalid response (no best_bid).");
                        }
                        cryptList.cryptValue = Math.round(body.best_bid).toLocaleString();
                        cryptList.cryptTotalValue = Math.round(body.best_bid * cryptList.cryptStock).toLocaleString();
                        cryptList.cryptProfit = Math.round(body.best_bid * cryptList.cryptStock - cryptList.cryptGetValue).toLocaleString();

                        this.totalCryptAsset += Math.round(body.best_bid * cryptList.cryptStock);
                        this.totalCryptGet += parseInt(cryptList.cryptGetValue);

                        this.graphValueLists.push(Math.round(body.best_bid * cryptList.cryptStock));
                        this.graphNameLists.push(cryptList.cryptName);
                    })
                    .catch(error => {
                        console.error("cryptUpdate error:", error);
                    });
            });
        },

        // --- 修正ポイント: investTrustUpdate ---
        investTrustUpdate: function () {
            this.investTrustLists.forEach((investTrustList) => {
                let json = { code: investTrustList.investTrustCode };

                fetch('/investtrust/', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(json)
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(body => {
                        if (body.error) {
                            throw new Error(body.error);
                        }
                        // body は数値を想定
                        if (typeof body !== 'number') {
                            throw new Error("Invalid response (not a number).");
                        }
                        investTrustList.investTrustValue = Math.round(body).toLocaleString();
                        investTrustList.investTrustTotalValue = Math.round(body * investTrustList.investTrustStock).toLocaleString();
                        investTrustList.investTrustProfit = Math.round(body * investTrustList.investTrustStock - investTrustList.investTrustGetValue).toLocaleString();

                        this.totalInvestTrustAsset += Math.round(body * investTrustList.investTrustStock);
                        this.totalInvestTrustGet += parseInt(investTrustList.investTrustGetValue);

                        this.graphValueLists.push(Math.round(body * investTrustList.investTrustStock));
                        this.graphNameLists.push(investTrustList.investTrustName);
                    })
                    .catch(error => {
                        console.error("investTrustUpdate error:", error);
                    });
            });
        },

        // --- 修正ポイント: stockUpdate ---
        stockUpdate: async function () {
            await this.exchangeGet();
            await this.stockLists.forEach((stockList) => {
                let json = { code: stockList.stockCode };

                fetch('/stock/', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(json)
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(body => {
                        if (body.error) {
                            throw new Error(body.error);
                        }
                        if (typeof body !== 'number') {
                            throw new Error("Invalid response (not a number).");
                        }

                        // 海外銘柄かどうかで分岐
                        if (stockList.stockCode.includes(".")) {
                            // 国内株の場合はそのまま
                            stockList.stockValue = Math.round(body).toLocaleString();
                            stockList.stockTotalValue = Math.round(body * stockList.stockStock).toLocaleString();
                            stockList.stockProfit = Math.round(body * stockList.stockStock - stockList.stockGetValue).toLocaleString();

                            this.totalStockAsset += Math.round(body * stockList.stockStock);
                            this.totalStockGet += parseInt(stockList.stockGetValue);

                            this.graphValueLists.push(Math.round(body * stockList.stockStock));
                            this.graphNameLists.push(stockList.stockName);
                        } else {
                            // 米国株等の場合は為替レートを掛ける
                            stockList.stockValue = Math.round(body).toLocaleString();
                            stockList.stockTotalValue = Math.round(body * stockList.stockStock * this.exchangeValue).toLocaleString();
                            stockList.stockProfit = Math.round(body * stockList.stockStock * this.exchangeValue - stockList.stockGetValue).toLocaleString();

                            this.totalStockAsset += Math.round(body * stockList.stockStock * this.exchangeValue);
                            this.totalStockGet += parseInt(stockList.stockGetValue);

                            this.graphValueLists.push(Math.round(body * stockList.stockStock * this.exchangeValue));
                            this.graphNameLists.push(stockList.stockName);
                        }
                    })
                    .catch(error => {
                        console.error("stockUpdate error:", error);
                    });
            });
        },

        // --- 修正ポイント: exchangeGet ---
        exchangeGet: async function () {
            await fetch('/exchange/', {
                method: 'POST',
                headers: { 'content-type': 'application/json' }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(body => {
                    if (body.error) {
                        throw new Error(body.error);
                    }
                    if (typeof body !== 'number') {
                        throw new Error("Invalid response (not a number).");
                    }
                    this.exchangeValue = Math.round(body);
                })
                .catch(error => {
                    console.error("exchangeGet error:", error);
                });
        },

        depositUpdate: function () {
            this.depositLists.forEach((depositList) => {
                this.totalDepositAsset += parseInt(depositList.depositAmount) || 0;
                this.graphValueLists.push(Math.round(depositList.depositAmount) || 0);
                this.graphNameLists.push(depositList.bankName);
            })
        },

        totalAssetCalculate: function () {
            return Math.round(
                this.totalCryptAsset +
                this.totalInvestTrustAsset +
                this.totalStockAsset +
                this.totalDepositAsset
            ).toLocaleString();
        },

        totalValueCalculate: function () {
            return Math.round(
                this.totalCryptAsset +
                this.totalInvestTrustAsset +
                this.totalStockAsset
            ).toLocaleString();
        },

        totalGetCalculate: function () {
            return Math.round(
                this.totalCryptGet +
                this.totalInvestTrustGet +
                this.totalStockGet
            ).toLocaleString();
        },

        totalProfitCalculate: function () {
            return Math.round(
                (this.totalCryptAsset + this.totalInvestTrustAsset + this.totalStockAsset)
                - (this.totalCryptGet + this.totalInvestTrustGet + this.totalStockGet)
            ).toLocaleString();
        },

        cryptAddList: function () {
            this.cryptLists.push({ cryptCode: '', cryptName: '', cryptGetValue: '', cryptStock: '', cryptValue: '', cryptTotalValue: '', cryptProfit: '' })
        },
        cryptDeleteList: function (index) {
            this.cryptLists.splice(index, 1)
        },

        investTrustAddList: function () {
            this.investTrustLists.push({
                investTrustCode: '', investTrustName: '', investTrustGetValue: '', investTrustStock: '',
                investTrustValue: '', investTrustTotalValue: '', investTrustProfit: ''
            })
        },
        investTrustDeleteList: function (index) {
            this.investTrustLists.splice(index, 1)
        },

        stockAddList: function () {
            this.stockLists.push({ stockCode: '', stockName: '', stockGetValue: '', stockStock: '', stockValue: '', stockTotalValue: '', stockProfit: '' })
        },
        stockDeleteList: function (index) {
            this.stockLists.splice(index, 1)
        },

        depositAddList: function () {
            this.depositLists.push({ bankName: '', branchName: '', depositAmount: '' })
        },
        depositDeleteList: function (index) {
            this.depositLists.splice(index, 1)
        },

        displayGraph: function () {
            let ctx = document.getElementById('myChart').getContext('2d');
            let myChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: this.graphNameLists,
                    datasets: [{
                        data: this.graphValueLists
                    }]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false,
                    plugins: {
                        colorschemes: {
                            scheme: 'brewer.SetThree12'
                        },
                        outlabels: {
                            text: (ctx) => {
                                let label = ctx.chart.data.labels[ctx.dataIndex];
                                let value = ctx.dataset.data[ctx.dataIndex];
                                return label + '\n' + value.toLocaleString();
                            },
                            color: 'black',
                            font: {
                                resizable: false,
                                size: 20
                            }
                        },
                        labels: {
                            fontColor: 'black',
                            fontSize: 20,
                            position: 'border'
                        },
                    },
                    layout: {
                        padding: {
                            left: 180,
                            right: 180,
                            bottom: 250
                        }
                    },
                    legend: {
                        display: false
                    }
                }
            });
        },

        firebaseStarage: async function () {
            if (this.username === "") {
                alert("ログインしてください。");
            } else {
                await setDoc(doc(db, "asset", this.username), {
                    cryptLists: this.cryptLists,
                    investTrustLists: this.investTrustLists,
                    stockLists: this.stockLists,
                    depositLists: this.depositLists,

                    totalCryptAsset: this.totalCryptAsset,
                    totalInvestTrustAsset: this.totalInvestTrustAsset,
                    totalStockAsset: this.totalStockAsset,
                    totalDepositAsset: this.totalDepositAsset,

                    totalCryptGet: this.totalCryptGet,
                    totalInvestTrustGet: this.totalInvestTrustGet,
                    totalStockGet: this.totalStockGet,

                    graphValueLists: this.graphValueLists,
                    graphNameLists: this.graphNameLists,
                });
                alert("保存完了！");
            }
        },

        firebaseRead: async function () {
            const docRef = doc(db, "asset", this.username);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                this.cryptLists = docSnap.get("cryptLists");
                this.investTrustLists = docSnap.get("investTrustLists");
                this.stockLists = docSnap.get("stockLists");
                this.depositLists = docSnap.get("depositLists");

                this.totalCryptAsset = docSnap.get("totalCryptAsset");
                this.totalInvestTrustAsset = docSnap.get("totalInvestTrustAsset");
                this.totalStockAsset = docSnap.get("totalStockAsset");
                this.totalDepositAsset = docSnap.get("totalDepositAsset");

                this.totalCryptGet = docSnap.get("totalCryptGet");
                this.totalInvestTrustGet = docSnap.get("totalInvestTrustGet");
                this.totalStockGet = docSnap.get("totalStockGet");

                this.graphValueLists = docSnap.get("graphValueLists");
                this.graphNameLists = docSnap.get("graphNameLists");

                console.log("Document data:", docSnap.data());
            } else {
                console.log("No such document!");
            }
        },

        loginUser: function () {
            signInWithPopup(auth, provider)
                .then((result) => {
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    const token = credential.accessToken;
                    const user = result.user;
                    this.username = result.user.uid
                    this.firebaseRead();
                })
                .catch((error) => {
                    console.error(error);
                });
        },
    }
});

apple.mount('#apple');
