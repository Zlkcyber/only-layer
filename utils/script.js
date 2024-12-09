import { ethers } from 'ethers';
import fs from 'fs';
import readline from 'readline';
import log from './logger.js';

// Function to send faucet to a wallet
export async function sendFaucet(faucetAmount, addressRecipient, pvkey) {
    log.info(`Sending Faucet ${faucetAmount} To Address ${addressRecipient}`);
    try {
        const provider = new ethers.JsonRpcProvider('https://onlylayer.org');
        const wallet = new ethers.Wallet(pvkey, provider);
        const feeData = await provider.getFeeData();

        const tx = {
            to: addressRecipient,
            value: ethers.parseEther(faucetAmount),
            gasLimit: 21000,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || feeData.gasPrice,
            maxFeePerGas: feeData.maxFeePerGas || feeData.gasPrice
        };

        const txResponse = await wallet.sendTransaction(tx);
        log.info(`Transaction sent to ${addressRecipient}! Hash: ${txResponse.hash}`);

        await txResponse.wait();
    } catch (error) {
        log.error("Error sending faucet:", error);
    }
}

export async function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// Read wallets from wallets.json
export function readWallets() {
    if (fs.existsSync("wallets.json")) {
        const data = fs.readFileSync("wallets.json");
        return JSON.parse(data);
    } else {
        log.info("No wallets found in wallets.json");
        return [];
    }
}