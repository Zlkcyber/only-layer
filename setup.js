import { ethers } from 'ethers';
import fs from 'fs';
import { sendFaucet, askQuestion } from "./utils/script.js";
import log from "./utils/logger.js"
import iniBapakBudi from "./utils/banner.js"


// Function to create a new wallet
function createNewWallet() {
    const wallet = ethers.Wallet.createRandom();

    const walletDetails = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase
    };

    // Log the wallet details
    log.info("New Ethereum Wallet created:");
    log.info(`Address: ${walletDetails.address}`);
    log.info(`Private Key: ${walletDetails.privateKey}`);
    log.info(`Mnemonic: ${walletDetails.mnemonic}`);

    return walletDetails;
}

// Function to save the wallet
function saveWalletToFile(walletDetails) {
    let wallets = [];
    if (fs.existsSync("wallets.json")) {
        const data = fs.readFileSync("wallets.json");
        wallets = JSON.parse(data);
    }

    wallets.push(walletDetails);

    fs.writeFileSync("wallets.json", JSON.stringify(wallets, null, 2));

    log.warn("Wallet saved to wallets.json");
}

async function askingHowManyWallets() {
    const answer = await askQuestion('How many wallets would you like to create? ');
    return parseInt(answer);
}

// Main function
async function main() {
    log.warn(`\x1b[36m${iniBapakBudi}\x1b[0m`)
    const numWallets = await askingHowManyWallets();
    const pvKey = await askQuestion('Please enter your private key that has ETH on the Only-Layer-Testnet\nThis wallet will be used to send a faucet to each newly created address : ');
    const faucetAmount = await askQuestion('How Many ETH You Want To Send to each address, example 0.01 : ')
    for (let i = 0; i < numWallets; i++) {
        log.info(`Creating wallet #${i + 1}...`);

        const newWallet = createNewWallet();
        saveWalletToFile(newWallet);

        await sendFaucet(faucetAmount, newWallet.address, pvKey);
    }

    log.info("All wallets created and faucet sent.");
}

// Run
main();
