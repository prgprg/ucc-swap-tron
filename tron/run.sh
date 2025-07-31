rm -rf build/

tronbox compile --all   

tronbox migrate --reset --network development --silence

tronbox test  test/htlc_escrow.test.js --network development