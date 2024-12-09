import { sendFaucet, askQuestion, readWallets } from "./utils/script.js";
import banner from "./utils/banner.js"
import log from "./utils/logger.js"

async function faucet() {
    log.warn(banner)
    const wallets = readWallets();
    log.info(`Found ${wallets.length} existing wallets...`);
    const faucetAmount = await askQuestion('How Many ETH You Want To Send to each address, example 0.01 : ')
    const pvKey = await askQuestion('Please enter your private key that has ETH on the Only-Layer-Testnet\nThis wallet will be used to send a faucet to each address : ');

    for (let i = 0; i < wallets.length; i++) {
        const wallet = wallets[i];

        log.info(`=== Starting Sending Faucet to wallet ${wallet.address} ===`);
        await sendFaucet(faucetAmount, wallet.address, pvKey);
    }
}

faucet()
