import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";

let coinbase = Coinbase.configureFromJson({ filePath: '~/Downloads/cdp_api_key.json' });

// Create a Wallet
let wallet = await Wallet.create();
console.log(`Wallet successfully created: `, wallet.toString());

// Wallets come with a single default Address, accessible via getDefaultAddress:
let address = await wallet.getDefaultAddress();
console.log(`Default address for the wallet: `, address.toString());

const faucetTransaction = await wallet.faucet();
console.log(`Faucet transaction completed successfully: `, faucetTransaction.toString());

let anotherWallet = await Wallet.create();
console.log(`Second Wallet successfully created: `, anotherWallet.toString());

const transfer = await wallet.createTransfer({
  amount: 0.00001,
  assetId: Coinbase.assets.Eth,
  destination: anotherWallet,
});

// Wait for the transfer to settle.
await transfer.wait()

// Check if the transfer successfully completed on-chain.
if (transfer.getStatus() === 'complete') {
  console.log(`Transfer successfully completed: `, transfer.toString());
} else {
  console.error('Transfer failed on-chain: ', transfer.toString());
}
