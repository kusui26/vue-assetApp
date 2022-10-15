import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"

const firebaseConfig = {
    apiKey: "AIzaSyDUKVhGPuqm9JSl_Svc_shbHYJJd7gR0uc",
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
        // assetUpdate: async function () {
        //     await Promise.all([
        //         this.cryptUpdate(),
        //         this.investTrustUpdate(),
        //         this.stockUpdate(),
        //         this.depositUpdate()
        //     ]).then(() => {
        //         this.totalUpdate()
        //     })
        // },
        // assetUpdate: async function () {
        //     await this.cryptUpdate()
        //     await this.investTrustUpdate()
        //     await this.stockUpdate()
        //     await this.depositUpdate()

        //     this.totalUpdate()
        // },
        assetUpdate: function () {

            this.totalCryptAsset = 0
            this.totalInvestTrustAsset = 0
            this.totalStockAsset = 0
            this.totalDepositAsset = 0
            this.totalCryptGet = 0
            this.totalInvestTrustGet = 0
            this.totalStockGet = 0
            this.graphValueList = []
            this.graphNameLists = []

            this.cryptUpdate();
            this.investTrustUpdate();
            this.stockUpdate();
            this.depositUpdate()
        },

        cryptUpdate: function () {
            // Update: function () {
            this.cryptLists.forEach((cryptList) => {
                let json = { "code": cryptList.cryptCode };

                fetch('http://localhost:3000/crypt/', {

                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify(json)

                }).then(response => {
                    return response.json();

                }).then(body => {
                    console.log(body.best_bid);
                    cryptList.cryptValue = Math.round(body.best_bid).toLocaleString();
                    cryptList.cryptTotalValue = Math.round(body.best_bid * cryptList.cryptStock).toLocaleString();
                    cryptList.cryptProfit = Math.round(body.best_bid * cryptList.cryptStock - cryptList.cryptGetValue).toLocaleString();

                    this.totalCryptAsset = parseInt(this.totalCryptAsset) + Math.round(body.best_bid * cryptList.cryptStock);
                    this.totalCryptGet = parseInt(this.totalCryptGet) + parseInt(cryptList.cryptGetValue);

                    this.graphValueLists.push(Math.round(body.best_bid * cryptList.cryptStock));
                    this.graphNameLists.push(cryptList.cryptName);

                }).catch(error => {
                    console.log(error);
                });
            });

        },

        investTrustUpdate: function () {
            this.investTrustLists.forEach((investTrustList) => {
                let json = { "code": investTrustList.investTrustCode };

                fetch('http://localhost:3000/investtrust/', {

                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify(json)

                }).then(response => {
                    return response.json();

                }).then(body => {
                    console.log(body);
                    investTrustList.investTrustValue = Math.round(body).toLocaleString();
                    investTrustList.investTrustTotalValue = Math.round(body * investTrustList.investTrustStock).toLocaleString();
                    investTrustList.investTrustProfit = Math.round(body * investTrustList.investTrustStock - investTrustList.investTrustGetValue).toLocaleString();

                    this.totalInvestTrustAsset = parseInt(this.totalInvestTrustAsset) + Math.round(body * investTrustList.investTrustStock)
                    this.totalInvestTrustGet = parseInt(this.totalInvestTrustGet) + parseInt(investTrustList.investTrustGetValue);

                    this.graphValueLists.push(Math.round(body * investTrustList.investTrustStock));
                    this.graphNameLists.push(investTrustList.investTrustName);

                }).catch(error => {
                    console.log(error);
                });
            });
        },

        stockUpdate: async function () {

            await this.exchangeGet();
            await this.stockLists.forEach((stockList) => {
                let json = { "code": stockList.stockCode };

                fetch('http://localhost:3000/stock/', {

                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify(json)

                }).then(response => {
                    return response.json();

                }).then(body => {
                    console.log(body);

                    stockList.stockValue = Math.round(body).toLocaleString();
                    stockList.stockTotalValue = Math.round(body * stockList.stockStock * this.exchangeValue).toLocaleString();
                    stockList.stockProfit = Math.round(body * stockList.stockStock * this.exchangeValue - stockList.stockGetValue).toLocaleString();

                    this.totalStockAsset = parseInt(this.totalStockAsset) + Math.round(body * stockList.stockStock * this.exchangeValue)
                    this.totalStockGet = parseInt(this.totalStockGet) + parseInt(stockList.stockGetValue);

                    this.graphValueLists.push(Math.round(body * stockList.stockStock * this.exchangeValue));
                    this.graphNameLists.push(stockList.stockName);

                }).catch(error => {
                    console.log(error);
                });
            });
        },

        exchangeGet: async function () {
            await fetch('http://localhost:3000/exchange/', {

                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                }

            }).then(response => {
                return response.json();

            }).then(body => {
                console.log(body);
                this.exchangeValue = Math.round(body);

            }).catch(error => {
                console.log(error);
            });
        },

        depositUpdate: function () {
            this.depositLists.forEach((depositList) => {
                this.totalDepositAsset = parseInt(this.totalDepositAsset) + parseInt(depositList.depositAmount);

                this.graphValueLists.push(Math.round(depositList.depositAmount));
                this.graphNameLists.push(depositList.bankName);
            })
        },

        totalAssetCalculate: function () {
            return Math.round(parseInt(this.totalCryptAsset) + parseInt(this.totalInvestTrustAsset) + parseInt(this.totalStockAsset) + parseInt(this.totalDepositAsset)).toLocaleString()
        },

        totalValueCalculate: function () {
            return Math.round(parseInt(this.totalCryptAsset) + parseInt(this.totalInvestTrustAsset) + parseInt(this.totalStockAsset)).toLocaleString()
        },

        totalGetCalculate: function () {
            return Math.round(parseInt(this.totalCryptGet) + parseInt(this.totalInvestTrustGet) + parseInt(this.totalStockGet)).toLocaleString();
        },

        totalProfitCalculate: function () {
            return Math.round(parseInt(this.totalCryptAsset) + parseInt(this.totalInvestTrustAsset) + parseInt(this.totalStockAsset) -
                parseInt(this.totalCryptGet) - parseInt(this.totalInvestTrustGet) - parseInt(this.totalStockGet)).toLocaleString();
        },

        cryptAddList: function () {
            this.cryptLists.push({ cryptName: '', cryptGetValue: '', cryptStock: '', cryptValue: '', cryptTotalValue: '', cryptProfit: '' })
        },
        cryptDeleteList: function (index) {
            this.cryptLists.splice(index, 1)
        },

        investTrustAddList: function () {
            this.investTrustLists.push({
                investTrustNumber: '', investTrustName: '', investTrustGetValue: '', investTrustStock: '',
                investTrustValue: '', investTotalValue: '', investTrustProfit: ''
            })
        },
        investTrustDeleteList: function (index) {
            this.investTrustLists.splice(index, 1)
        },

        stockAddList: function () {
            this.stockLists.push({ stockName: '', stockGetValue: '', stockStock: '', stockValue: '', stockTotalValue: '', stockProfit: '' })
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
                            text: function (ctx) {
                                let label = ctx.chart.data.labels[ctx.dataIndex];
                                let value = ctx.dataset.data[ctx.dataIndex];
                                return label + '\n' + value.toLocaleString();
                                // return '[' + label + ']' + '\n' + value + '%';

                                // return args.value.toLocaleString() + '（' + args.percentage + '%）';
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

                        // labels: {
                        //     render: function (args) {
                        //         return args.value.toLocaleString() + '（' + args.percentage + '%）';
                        //         // return args.value.toLocaleString() + '\n' + args.percentage + '%';
                        //     },
                        //     fontColor: 'black',
                        //     fontSize: 20,
                        // },
                        // outlabels: {
                        //     text: '%l\n%p',
                        //     color: 'black'
                        // }
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
            }
            )
        },

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

        firebaseRead: async function () {
            const docRef = doc(db, "asset", this.username);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                this.cryptLists = docSnap.get("cryptLists")
                this.investTrustLists = docSnap.get("investTrustLists")
                this.stockLists = docSnap.get("stockLists")
                this.depositLists = docSnap.get("depositLists")

                this.totalCryptAsset = docSnap.get("totalCryptAsset")
                this.totalInvestTrustAsset = docSnap.get("totalInvestTrustAsset")
                this.totalStockAsset = docSnap.get("totalStockAsset")
                this.totalDepositAsset = docSnap.get("totalDepositAsset")

                this.totalCryptGet = docSnap.get("totalCryptGet")
                this.totalInvestTrustGet = docSnap.get("totalInvestTrustGet")
                this.totalStockGet = docSnap.get("totalStockGet")

                this.graphValueLists = docSnap.get("graphValueLists")
                this.graphNameLists = docSnap.get("graphNameLists")

                console.log("Document data:", docSnap.data());
            } else {
                // doc.data() will be undefined in this case
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