const HTLCEscrow = artifacts.require("HTLCEscrow");
const TronWeb = require('tronweb').TronWeb;
const crypto = require('crypto');

contract("HTLCEscrow", accounts => {
  it("should allow withdrawal with correct secret", async () => {
    const maker = accounts[0];
    const taker = accounts[1];
    const rawSecret = crypto.randomBytes(32);
    const hashlock = crypto.createHash('sha256').update(rawSecret).digest();
    const timelock = Math.floor(Date.now() / 1000) + 60;

    const valueToSend = TronWeb.toSun(3);
    console.log('Value to send:', valueToSend);

    const escrow = await HTLCEscrow.new(
      hashlock,
      timelock,
      { from: taker,
        value: valueToSend,
        fee_limit: 100000000,
        consume_user_resource_percent: 30
      }
    );

    const status = await escrow.getStatus();
    console.log('Contract amount stored:', status._amount.toString());
    assert.equal(status._amount.toString(), valueToSend.toString());

    await escrow.withdraw(rawSecret, taker, { from: taker });
    const after = await escrow.getStatus();
    assert.isTrue(after._withdrawn);
  });

  // Add cancel test, getBalance, etc.
});
