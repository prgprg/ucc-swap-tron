const HTLCEscrow = artifacts.require("HTLCEscrow");

const TronWeb = require('tronweb').TronWeb;
const tronWeb = new TronWeb(
    "http://127.0.0.1:9090",
    "http://127.0.0.1:9090",
    "http://127.0.0.1:9090",
    '2480efa25a940e8dc6c2f13ffc9d1b6aa247721e7fc432323737092401a76d51',
);
module.exports = function(deployer, network, accounts) {

  const maker = tronWeb.address.fromPrivateKey(process.env.PRIVATE_KEY);
  console.log("Deploying HTLCEscrow with maker address:", maker);

  // Placeholder parameters — tests will deploy with actual values
  const placeholderHashlock = "0x" + "0".repeat(64);
  const placeholderTimelock = Math.floor(Date.now() / 1000) + 60; // 1 minute later
  const placeholderAmount = tronWeb.toSun(3); // 3 TRX in Sun

  deployer.deploy(
    HTLCEscrow,
    placeholderHashlock,
    placeholderTimelock,
    {
      from: maker,
      value: placeholderAmount,
      fee_limit: 1000*1e6,
      consume_user_resource_percent: 30
    }
  ).then(instance => {
    console.log("HTLCEscrow deployed at:", instance.address);
  }).catch(err => {
    console.error("Migration error:", err.message);
  });
};
