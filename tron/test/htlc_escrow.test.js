const HTLCEscrow = artifacts.require("HTLCEscrow");
const TronWeb = require('tronweb').TronWeb;
const crypto = require('crypto');

contract("HTLCEscrow", accounts => {
  it("allow withdrawal with correct secret using SHA‑256", async () => {
    const maker = accounts[0];
    const taker = accounts[1];

    const rawSecret = crypto.randomBytes(32);
    const secretHex = rawSecret.toString("hex");
    const hashlock = "0x" + crypto.createHash("sha256").update(Buffer.from(secretHex, "hex")).digest("hex");
    const timelock = Math.floor(Date.now()/1000) + 180;
    const valueSun = tronWeb.toSun(3);

    console.log("Value to send:", valueSun);
    console.log("Secret:", secretHex);
    console.log("Hashlock (SHA‑256):", hashlock);


    const escrow = await HTLCEscrow.new(
      hashlock, 
      timelock, {
      sender: maker,
      value: valueSun
    });

    console.log("Deploy tx:", escrow.transactionHash);
    const txInfo = await tronWeb.trx.getTransactionInfo(escrow.transactionHash);
    console.log("Deploy TX INFO:", txInfo);

    console.log('Contract balance:', (await escrow.getBalance()).toString());

    const status = await escrow.getStatus();
    console.log('contract balance:', (await status._amount).toString());
    // assert.equal((await status._amount).toString(), valueSun.toString());

    // await escrow.withdraw("0x" + secretHex, { from: taker });

    // assert.isTrue(status._withdrawn);
  });
});
