import { ethers } from "ethers";
import readline from 'readline';
import log from "./utils/logger.js"
import iniBapakBudi from "./utils/banner.js"
import { readWallets } from "./utils/script.js";

// RPC provider
const provider = new ethers.JsonRpcProvider("https://onlylayer.org");

// Contract address and ABI
const contractAddress = "0x8D6E7213bad28E00156c7ecddEFac64Cc508CAD5";
const contractABI = [
    "function swapExactETHForTokens(uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) payable returns (uint256[] memory)",
    "function addLiquidityETH(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) payable"
];

// Function to swap ETH for tokens
async function swapExactETHForTokens(wallet, i) {
    const amountOutMin = ethers.parseUnits("0.1", "ether");
    const path = [
        "0xcF2D86B78E12A08EF3373eE3B0d1D2a1370a7B2F",
        "0x676C1F954529dC32dA1B038D13Af1ea83cEdc772"
    ];
    const recipient = wallet.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const min = 0.00001;
    const max = 0.0001;

    // Generate a random value 
    const randomAmount = Math.random() * (max - min) + min;
    const roundedAmount = randomAmount.toFixed(7);
    const value = ethers.parseUnits(roundedAmount.toString(), "ether");

    const contract = new ethers.Contract(contractAddress, contractABI, wallet);
    log.info(`Transaction #${i} Swaping ${roundedAmount} ETH to OFI`);

    try {
        const tx = await contract.swapExactETHForTokens(
            amountOutMin,
            path,
            recipient,
            deadline,
            { value }
        );

        const receipt = await tx.wait();
        if (receipt) {
            log.info(`Transaction #${i} Swaping successfully Hash: ${tx.hash}.`);
        }
    } catch (error) {
        log.error(`Error in Transaction #${i} for ${wallet.address}:`, error);
    }
}

async function askingSwapCount() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('How many times would you like to perform the swap for each wallet? ', (answer) => {
            rl.close();
            resolve(parseInt(answer, 10));
        });
    });
}

const letsDoIt = async () => {
    log.warn(`\x1b[36m${iniBapakBudi}\x1b[0m`)
    const wallets = readWallets();
    const swapCount = await askingSwapCount();
    log.info(`You have chosen to perform ${swapCount} swaps for each wallet.`);

    for (let i = 0; i < wallets.length; i++) {
        const walletDetails = wallets[i];
        const wallet = new ethers.Wallet(walletDetails.privateKey, provider);

        log.info(`=== Starting Perform Swap Transaction for wallet ${wallet.address} ===`);

        for (let counter = 0; counter < swapCount; counter++) {
            await swapExactETHForTokens(wallet, counter + 1);

            // Add random delay between swaps
            const randomDelay = Math.random() * (30 - 5) + 5;
            log.info(`Santuy, Cooldown ${randomDelay.toFixed(2)} seconds before continue...`);

            await new Promise(resolve => setTimeout(resolve, randomDelay * 1000));
        }
    }
};


letsDoIt();
