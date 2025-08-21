// download-logos.js
const fs = require("fs");
const https = require("https");

const exchanges = [
  "binance",
  "coinbase",
  "kraken",
  "kucoin",
  "bitfinex",
  "huobi",
  "okx",
  "gemini",
  "gateio",
  "bitstamp",
  "bybit",
  "crypto.com",
  "poloniex",
  "bittrex",
  "deribit",
  "upbit",
  "ftx",
  "liquid",
  "probit",
  "zb"
];

const base = "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains";

const download = async (chain, folder="exchange-icons") => {
  const name = chain.replace(/\./g, "_");
  const url = `${base}/${chain}/info/logo.png`;
  const path = `public/${folder}/${name}.png`;
  https.get(url, (res) => {
    if (res.statusCode === 200) {
      res.pipe(fs.createWriteStream(path));
      console.log(`Downloaded ${name}`);
    } else {
      console.error(`Failed to fetch ${name}, status: ${res.statusCode}`);
    }
  });
};

(async () => {
  if (!fs.existsSync("public/exchange-icons")){
    fs.mkdirSync("public/exchange-icons", { recursive: true });
  }
  for (const ex of exchanges) {
    await download(ex);
  }
})();
