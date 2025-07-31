const HTLCEscrow = artifacts.require("HTLCEscrow");
const TronWeb = require('tronweb').TronWeb;
const crypto = require('crypto');

contract("HTLCEscrow", accounts => {
  it("allow withdrawal with correct secret using SHA‑256", async () => {
    const maker = tronWeb.address.fromPrivateKey(process.env.PRIVATE_KEY);
    const taker = accounts[9]

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
      sender: maker,
      value: valueSun
    });
    
    
    const status_before = await escrow.getStatus();   
    console.log('Withdrawn Status before:', (await status_before._withdrawn).toString()); 

    await escrow.withdraw('0x' + secretHex, "TLFFEDoodHSgt8Xb8yEUs9niKD3PaVf7zn");

    const status_after = await escrow.getStatus();   
    console.log('Withdrawn Status after:', (await status_after._withdrawn).toString()); 
  });
});
