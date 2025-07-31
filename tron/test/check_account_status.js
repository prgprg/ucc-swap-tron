const TronWeb = require('tronweb').TronWeb;
console.log(typeof TronWeb); // Should print 'function'
console.log(TronWeb);

const PRIVATE_KEY = process.env.PRIVATE_KEY_NILE || process.env.PRIVATE_KEY_SHASTA;
const FULL_NODE = 'https://api.nileex.io'; // Change to 'https://api.shasta.trongrid.io' for Shasta
const SOLIDITY_NODE = FULL_NODE;
const EVENT_SERVER = FULL_NODE;

const tronWeb = new TronWeb(FULL_NODE, SOLIDITY_NODE, EVENT_SERVER, PRIVATE_KEY);

async function checkAccountStatus(address) {
  const acc = await tronWeb.trx.getAccount(address);
  const resources = await tronWeb.trx.getAccountResources(address);
  const balance = await tronWeb.trx.getBalance(address);

  console.log('Address:', address);
  console.log('TRX Balance:', tronWeb.fromSun(balance));
  console.log('Energy:', resources.EnergyLimit, 'used:', resources.EnergyUsed);
  console.log('Bandwidth:', resources.NetLimit, 'used:', resources.NetUsed);
  if (acc.stakeV2) {
    console.log('StakeV2:', acc.stakeV2);
  }
  if (acc.delegatedResource) {
    console.log('Delegated Resource:', acc.delegatedResource);
  }
}



tronWeb.trx.getAccount().then(acc => {
  checkAccountStatus(acc.address);
});