const HTLCEscrow = artifacts.require("HTLCEscrow");
const TronWeb = require('tronweb').TronWeb;
const tronWeb = new TronWeb(
    "http://127.0.0.1:9090",
    "http://127.0.0.1:9090",
    "http://127.0.0.1:9090",
    process.env.PRIVATE_KEY
);

const { assert } = require('console');
const crypto = require('crypto');

contract("HTLCEscrow", accounts => {
  it("allow withdrawal with correct secret using SHA‑256", async () => {
    const maker = tronWeb.address.fromPrivateKey(process.env.PRIVATE_KEY);
    const taker = tronWeb.address.fromPrivateKey(process.env.TAKER_KEY);

    console.log("maker address:", maker);
    const rawSecret = crypto.randomBytes(32);
    const secretHex = rawSecret.toString("hex");
    const hashlock = "0x" + crypto.createHash("sha256").update(Buffer.from(secretHex, "hex")).digest("hex");
    const timelock = Math.floor(Date.now()/1000) + 180;
    const valueSun = tronWeb.toSun(30);

    console.log("Value to send:", valueSun);
    console.log("Secret:", secretHex);
    console.log("Hashlock (SHA‑256):", hashlock);


    const escrow = await HTLCEscrow.new(
      hashlock, 
      timelock, {
      from: maker,
      callValue: valueSun
    });
    
    
    const status_before = await escrow.getStatus();   
    console.log('Withdrawn Status before:', (await status_before._withdrawn).toString()); 
    console.log("Amount in escrow:", (await status_before._amount).toString());
    console.log("Contract balance before withdrawal:", (await escrow.getBalance()).toString());

    await escrow.withdraw('0x' + secretHex, taker);

    const status_after = await escrow.getStatus();   
    console.log('Withdrawn Status after:', (await status_after._withdrawn).toString()); 
    
  });

  it("should not allow withdrawal with incorrect secret", async () => {
    const maker = tronWeb.address.fromPrivateKey(process.env.PRIVATE_KEY);
    const taker = tronWeb.address.fromPrivateKey(process.env.TAKER_KEY);

    const rawSecret = crypto.randomBytes(32);
    const secretHex = rawSecret.toString("hex");
    const hashlock = "0x" + crypto.createHash("sha256").update(Buffer.from(secretHex, "hex")).digest("hex");
    const timelock = Math.floor(Date.now()/1000) + 60;
    const valueSun = tronWeb.toSun(3);

    const escrow = await HTLCEscrow.new(
      hashlock, 
      timelock, {
      from: maker,
      callValue: valueSun
    });

    try {
      await escrow.withdraw('0x' + crypto.randomBytes(32).toString("hex"), { from: taker });
      assert.fail("Withdrawal should have failed with incorrect secret");
    } catch (error) {
      assert(error.message.includes("Invalid secret"), "Expected error message for invalid secret");
    }
  });

  it("should not allow withdrawal after timelock expires", async () => {
    const maker = tronWeb.address.fromPrivateKey(process.env.PRIVATE_KEY);
    const taker = tronWeb.address.fromPrivateKey(process.env.TAKER_KEY);

    const rawSecret = crypto.randomBytes(32);
    const secretHex = rawSecret.toString("hex");
    const hashlock = "0x" + crypto.createHash("sha256").update(Buffer.from(secretHex, "hex")).digest("hex");
    const timelock = Math.floor(Date.now()/1000) - 60; // Set timelock to past
    const valueSun = tronWeb.toSun(3);

    const escrow = await HTLCEscrow.new(
      hashlock, 
      timelock, {
      from: maker,
      callValue: valueSun
    });

    try {
      await escrow.withdraw('0x' + secretHex, { from: taker });
      assert.fail("Withdrawal should have failed after timelock expired");
    } catch (error) {
      assert(error.message.includes("Timelock expired"), "Expected error message for expired timelock");
    }
  });
});
