const { TronWeb } = require('tronweb');

/**
 * Simple resource checker for both testnets
 */
async function checkResources() {
    const privateKey = 'c08250122e76b5ae3509cf924c27eb524f8184721b6a5fdff9528e867a22337e';
    
    const networks = {
        shasta: 'https://api.shasta.trongrid.io',
        nile: 'https://nile.trongrid.io'
    };
    
    console.log('🔍 SIMPLE RESOURCE CHECK');
    console.log('========================');
    
    for (const [name, host] of Object.entries(networks)) {
        try {
            const tronWeb = new TronWeb({ fullHost: host, privateKey });
            const address = tronWeb.address.fromPrivateKey(privateKey);
            const account = await tronWeb.trx.getAccount(address);
            
            if (account && account.balance) {
                const balance = tronWeb.fromSun(account.balance);
                console.log(`\n📡 ${name.toUpperCase()}:`);
                console.log(`Address: ${address}`);
                console.log(`Balance: ${balance} TRX`);
                
                // Check for frozen resources
                if (account.frozenV2 && account.frozenV2.length > 0) {
                    console.log('Frozen resources:');
                    account.frozenV2.forEach((frozen, i) => {
                        const amount = tronWeb.fromSun(frozen.amount || 0);
                        const type = frozen.type || 'BANDWIDTH';
                        console.log(`  ${i + 1}. ${amount} TRX for ${type}`);
                    });
                }
                
                // Check free bandwidth
                if (account.free_net_usage) {
                    console.log(`Free bandwidth used: ${account.free_net_usage}`);
                }
                
                if (balance > 10) {
                    console.log(`✅ ${name} is ready for deployment`);
                } else {
                    console.log(`⚠️ ${name} has low balance`);
                }
            } else {
                console.log(`\n❌ ${name.toUpperCase()}: No account found`);
            }
            
        } catch (error) {
            console.log(`\n❌ ${name.toUpperCase()}: Error -`, error.message);
        }
    }
    
    console.log('\n🎯 RECOMMENDATION:');
    console.log('Use the network with more TRX for deployment');
}

// Test a simple transaction
async function testTransaction() {
    console.log('\n🧪 TESTING SIMPLE TRANSACTION');
    console.log('=============================');
    
    const tronWeb = new TronWeb({
        fullHost: 'https://nile.trongrid.io', // Use Nile (more TRX)
        privateKey: 'c08250122e76b5ae3509cf924c27eb524f8184721b6a5fdff9528e867a22337e'
    });
    
    try {
        const address = tronWeb.address.fromPrivateKey(tronWeb.defaultPrivateKey);
        const balance = await tronWeb.trx.getBalance(address);
        
        console.log(`Account: ${address}`);
        console.log(`Balance: ${tronWeb.fromSun(balance)} TRX`);
        
        // Test if we can create a simple transaction (without sending)
        const transaction = await tronWeb.transactionBuilder.sendTrx(
            address, 
            1000000, // 1 TRX in sun
            address
        );
        
        console.log('✅ Transaction creation works');
        console.log('✅ Ready for contract deployment');
        
    } catch (error) {
        console.log('❌ Transaction test failed:', error.message);
    }
}

if (require.main === module) {
    checkResources().then(() => testTransaction());
}

module.exports = { checkResources, testTransaction };
