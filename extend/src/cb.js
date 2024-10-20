import { Coinbase, Wallet, TimeoutError } from "@coinbase/coinbase-sdk";

async function main() {
    // Configure Coinbase from JSON file (make sure this contains testnet credentials)
    const coinbase = Coinbase.configureFromJson({ filePath: 'cdp_api_key.json' });

    // Create the first wallet on Base Goerli Testnet
    let wallet = await Wallet.create({ networkId: Coinbase.networks.BaseSepolia });
    console.log(`Testnet Wallet successfully created: ${wallet.toString()}`);

    // Get the default address for the wallet
    let address = await wallet.getDefaultAddress();
    console.log(`Default address for the testnet wallet: ${address.toString()}`);

    // Perform a faucet transaction (if needed on testnet to fund the wallet with test ETH)
    const faucetTransaction = await wallet.faucet();
    console.log(`Faucet transaction on testnet completed successfully: ${faucetTransaction.toString()}`);

    // Create another wallet to transfer to (on testnet)
    let anotherWallet = await Wallet.create({ networkId: Coinbase.networks.BaseSepolia });
    console.log(`Second Testnet Wallet successfully created: ${anotherWallet.toString()}`);

    // Get the address of the second testnet wallet
    let recipientAddress = await anotherWallet.getDefaultAddress();

    // Create a regular transfer on Base Testnet (no gasless feature)
    try {
        const transfer = await wallet.createTransfer({
            amount: 0.00001, // Small amount for testing (ETH in testnet)
            assetId: Coinbase.assets.Eth, // Transfering testnet ETH instead of USDC
            destination: recipientAddress.getId(),
            gasless: false // Not using gasless transactions, regular gas fees apply
        });

        console.log(`Testnet ETH transfer initiated: ${transfer.toString()}`);

        // Wait for the transfer to land on-chain
        try {
            await transfer.wait();
        } catch (err) {
            if (err instanceof TimeoutError) {
                console.log("Waiting for testnet ETH transfer timed out");
            } else {
                console.error("Error while waiting for testnet ETH transfer to complete: ", err);
            }
            return;
        }

        // Check if transfer successfully completed on-chain
        if (transfer.getStatus() === 'complete') {
            console.log('Testnet ETH transfer completed on-chain: ', transfer.toString());
        } else {
            console.error('Testnet ETH transfer failed on-chain: ', transfer.toString());
        }
    } catch (error) {
        console.error(`Error while transferring testnet ETH: `, error);
    }
}

main().catch(console.error);

