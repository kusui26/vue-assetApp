import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"

const firebaseConfig = {
    // Firebase の設定
    apiKey: "AIzaSyDUK***********************",
    authDomain: "vue-assetapp.firebaseapp.com",
    projectId: "vue-assetapp",
    storageBucket: "vue-assetapp.appspot.com",
    messagingSenderId: "189444320546",
    appId: "1:189444320546:web:7d6233e14856b1499b897b"
};

// Initialize Firebase
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

        // --- 仮想通貨の更新 ---
        cryptUpdate: function () {
            this.cryptLists.forEach((cryptList) => {
                let json = { "code": cryptList.cryptCode };

                fetch('https://vue-assetapp.herokuapp.com/crypt/', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify(json)

                }).then(response => {
                    return response.json();

                }).then(body => {
                    // 数値変換 (カンマ除去 → parseFloat)
                    const cryptStock = parseFloat(String(cryptList.cryptStock).replace(/,/g, "")) || 0;
                    const cryptGetValue = parseFloat(String(cryptList.cryptGetValue).replace(/,/g, "")) || 0;
                    const bestBid = parseFloat(body.best_bid) || 0;

                    cryptList.cryptValue = Math.round(bestBid).toLocaleString();
                    cryptList.cryptTotalValue = Math.round(bestBid * cryptStock).toLocaleString();
                    cryptList.cryptProfit = Math.round(bestBid * cryptStock - cryptGetValue).toLocaleString();

                    this.totalCryptAsset += Math.round(bestBid * cryptStock);
                    this.totalCryptGet += cryptGetValue;

                    this.graphValueLists.push(Math.round(bestBid * cryptStock));
                    this.graphNameLists.push(cryptList.cryptName);

                }).catch(error => {
                    console.log(error);
                });
            });
        },

        // --- 投資信託の更新 ---
        investTrustUpdate: function () {
            this.investTrustLists.forEach((investTrustList) => {
                let json = { "code": investTrustList.investTrustCode };

                fetch('https://vue-assetapp.herokuapp.com/investtrust/', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify(json)

                }).then(response => {
                    return response.json();

                }).then(body => {
                    // 数値変換
                    const investTrustStock = parseFloat(String(investTrustList.investTrustStock).replace(/,/g, "")) || 0;
                    const investTrustGetValue = parseFloat(String(investTrustList.investTrustGetValue).replace(/,/g, "")) || 0;
                    const price = parseFloat(body) || 0;

                    investTrustList.investTrustValue = Math.round(price).toLocaleString();
                    investTrustList.investTrustTotalValue = Math.round(price * investTrustStock).toLocaleString();
                    investTrustList.investTrustProfit = Math.round(price * investTrustStock - investTrustGetValue).toLocaleString();

                    this.totalInvestTrustAsset += Math.round(price * investTrustStock);
                    this.totalInvestTrustGet += investTrustGetValue;

                    this.graphValueLists.push(Math.round(price * investTrustStock));
                    this.graphNameLists.push(investTrustList.investTrustName);

                }).catch(error => {
                    console.log(error);
                });
            });
        },

        // --- 株式の更新 ---
        stockUpdate: async function () {
            await this.exchangeGet();
            await this.stockLists.forEach((stockList) => {
                let json = { "code": stockList.stockCode };

                fetch('https://vue-assetapp.herokuapp.com/stock/', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify(json)

                }).then(response => {
                    return response.json();

                }).then(body => {
                    const stockGetValue = parseFloat(String(stockList.stockGetValue).replace(/,/g, "")) || 0;
                    const stockStock = parseFloat(String(stockList.stockStock).replace(/,/g, "")) || 0;
                    const currentPrice = parseFloat(body) || 0;
                    const exchangeValue = parseFloat(this.exchangeValue) || 0;

                    // 海外株判断
                    if (stockList.stockCode.includes(".")) {
                        // 国内以外 (NYSEなど)
                        stockList.stockValue = Math.round(currentPrice).toLocaleString();
                        stockList.stockTotalValue = Math.round(currentPrice * stockStock).toLocaleString();
                        stockList.stockProfit = Math.round(currentPrice * stockStock - stockGetValue).toLocaleString();

                        this.totalStockAsset += Math.round(currentPrice * stockStock);
                        this.totalStockGet += stockGetValue;

                        this.graphValueLists.push(Math.round(currentPrice * stockStock));
                        this.graphNameLists.push(stockList.stockName);
                    } else {
                        // 国内
                        stockList.stockValue = Math.round(currentPrice).toLocaleString();
                        stockList.stockTotalValue = Math.round(currentPrice * stockStock * exchangeValue).toLocaleString();
                        stockList.stockProfit = Math.round(currentPrice * stockStock * exchangeValue - stockGetValue).toLocaleString();

                        this.totalStockAsset += Math.round(currentPrice * stockStock * exchangeValue);
                        this.totalStockGet += stockGetValue;

                        this.graphValueLists.push(Math.round(currentPrice * stockStock * exchangeValue));
                        this.graphNameLists.push(stockList.stockName);
                    }

                }).catch(error => {
                    console.log(error);
                });
            });
        },

        // --- 為替レート取得 ---
        exchangeGet: async function () {
            await fetch('https://vue-assetapp.herokuapp.com/exchange/', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                }

            }).then(response => {
                return response.json();

            }).then(body => {
                this.exchangeValue = Math.round(body);  // 為替レート
            }).catch(error => {
                console.log(error);
            });
        },

        // --- 預金の更新 ---
        depositUpdate: function () {
            this.depositLists.forEach((depositList) => {
                // 数値変換
                const depositAmount = parseFloat(String(depositList.depositAmount).replace(/,/g, "")) || 0;
                this.totalDepositAsset += depositAmount;

                this.graphValueLists.push(depositAmount);
                this.graphNameLists.push(depositList.bankName);
            })
        },

        // 合計値の計算
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
                (this.totalCryptAsset + this.totalInvestTrustAsset + this.totalStockAsset) -
                (this.totalCryptGet + this.totalInvestTrustGet + this.totalStockGet)
            ).toLocaleString();
        },

        // 仮想通貨の行追加削除
        cryptAddList: function () {
            this.cryptLists.push({ cryptCode: '', cryptName: '', cryptGetValue: '', cryptStock: '', cryptValue: '', cryptTotalValue: '', cryptProfit: '' })
        },
        cryptDeleteList: function (index) {
            this.cryptLists.splice(index, 1);
        },

        // 投資信託の行追加削除
        investTrustAddList: function () {
            this.investTrustLists.push({
                investTrustCode: '', investTrustName: '', investTrustGetValue: '', investTrustStock: '',
                investTrustValue: '', investTrustTotalValue: '', investTrustProfit: ''
            })
        },
        investTrustDeleteList: function (index) {
            this.investTrustLists.splice(index, 1);
        },

        // 株式の行追加削除
        stockAddList: function () {
            this.stockLists.push({ stockCode: '', stockName: '', stockGetValue: '', stockStock: '', stockValue: '', stockTotalValue: '', stockProfit: '' })
        },
        stockDeleteList: function (index) {
            this.stockLists.splice(index, 1);
        },

        // 預金の行追加削除
        depositAddList: function () {
            this.depositLists.push({ bankName: '', branchName: '', depositAmount: '' })
        },
        depositDeleteList: function (index) {
            this.depositLists.splice(index, 1);
        },

        // グラフ描画
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
                            text: function (ctx) {
                                let label = ctx.chart.data.labels[ctx.dataIndex];
                                let value = ctx.dataset.data[ctx.dataIndex];
                                return label + '\n' + Number(value).toLocaleString();
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

        // Firebase 保存
        firebaseStarage: async function () {
            if (this.username === "") {
                alert("ログインしてください。")
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
                alert("保存完了！")
            }
        },

        // Firebase 読み込み
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

        // Google ログイン
        loginUser: function () {
            signInWithPopup(auth, provider)
                .then((result) => {
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    const token = credential.accessToken;
                    const user = result.user;
                    this.username = result.user.uid;
                    this.firebaseRead();

                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    const email = error.customData.email;
                    const credential = GoogleAuthProvider.credentialFromError(error);
                });
        },
    }
})

apple.mount('#apple')
