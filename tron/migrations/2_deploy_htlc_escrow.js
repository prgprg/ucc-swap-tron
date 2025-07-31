const HTLCEscrow = artifacts.require("HTLCEscrow");

const TronWeb = require('tronweb').TronWeb;
const tronWeb = new TronWeb(
    "http://127.0.0.1:9090",
    "http://127.0.0.1:9090",
    "http://127.0.0.1:9090",
    'fc557d0943ea4d924538546f6117fab0f0a69a03dc04f780d4de63c5345ceb2f',
);


// console.log("Deploying HTLCEscrow with maker address:", maker);

module.exports = function(deployer, network, accounts) {
  const maker = tronWeb.address.fromPrivateKey(process.env.PRIVATE_KEY);
  // console.log("Deploying HTLCEscrow with maker address:", maker);

  tronWeb.trx.getAccount(maker).then(account => {
    console.log("Maker account balance:", tronWeb.fromSun(account.balance));
  });
  console.log("TronWeb is connected:", tronWeb.isConnected());

  // Placeholder parameters — tests will deploy with actual values
  const placeholderHashlock = "0x" + "0".repeat(64);
  const placeholderTimelock = Math.floor(Date.now() / 1000) + 60; // 1 minute later
  const placeholderAmount = tronWeb.toSun(1); // 1 TRX in Sun

  deployer.deploy(
    HTLCEscrow, 
    placeholderHashlock,
    placeholderTimelock,
    {
      from: maker,
      value: placeholderAmount,
      fee_limit: 1000*1e6,
      consume_user_resource_percent: 0.3
    }
  ).then(instance => {
    console.log("HTLCEscrow deployed at:", instance.address);
  }).catch(err => {
    console.error("Migration error:", err.message);
  });
};
