const HTLCEscrow = artifacts.require("HTLCEscrow");

const TronWeb = require('tronweb').TronWeb;
const tronWeb = new TronWeb(
    "http://127.0.0.1:9090",
    "http://127.0.0.1:9090",
    "http://127.0.0.1:9090",
    '142c7ddd2da15e516ca36189087ba703502be7af3cbefab80976eb180d1c2492',
);
module.exports = function(deployer, network, accounts) {
    maker = tronWeb.address.fromPrivateKey(process.env.PRIVATE_KEY);

  // Placeholder parameters — tests will deploy with actual values
  const placeholderHashlock = "0x" + "0".repeat(64);
  const placeholderTimelock = Math.floor(Date.now() / 1000) + 3600; // 1-hour later

  deployer.deploy(
    HTLCEscrow,
    placeholderHashlock,
    placeholderTimelock,
    {
      from: maker,
      value: TronWeb.toSun(3), // 1 TRX as a placeholder
      fee_limit: 100000000,
      consume_user_resource_percent: 30
    }
  ).then(instance => {
    console.log("HTLCEscrow deployed at:", instance.address);
  }).catch(err => {
    console.error("Migration error:", err.message);
  });
};
