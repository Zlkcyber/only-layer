import { ethers } from "ethers";
import solc from "solc";
import fs from "fs";
import { readWallets } from "./utils/script.js";
import banner from "./utils/banner.js"
import log from "./utils/logger.js"

const provider = new ethers.JsonRpcProvider("https://onlylayer.org");

// Solidity contract
const contractSource = `
pragma solidity ^0.8.0;

contract SimpleContract {
    string public message;

    constructor(string memory _message) {
        message = _message;
    }

    function setMessage(string memory _message) public {
        message = _message;
    }
}
`;

async function deployContract(PRIVATE_KEY) {
    try {
        log.info("Compiling And Deploying the contract...");

        const input = {
            language: "Solidity",
            sources: {
                "SimpleContract.sol": { content: contractSource },
            },
            settings: {
                outputSelection: {
                    "*": {
                        "*": ["abi", "evm.bytecode.object"],
                    },
                },
            },
        };

        const compiled = JSON.parse(solc.compile(JSON.stringify(input)));
        const contractABI = compiled.contracts["SimpleContract.sol"].SimpleContract.abi;
        const contractBytecode = compiled.contracts["SimpleContract.sol"].SimpleContract.evm.bytecode.object;

        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        const factory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
        const contract = await factory.deploy("Hello, Only-Layer!");

        await contract.waitForDeployment();

        const contractAddress = await contract.getAddress();
        log.info(`Contract deployed successfully at: ${contractAddress}`);

        // Save ABI 
        fs.writeFileSync(
            "SimpleContract.json",
            JSON.stringify({ abi: contractABI, address: contractAddress }, null, 2)
        );

        log.info("ABI and contract address saved to SimpleContract.json");

        // Interact with the contract
        await interactWithContract(contract);
    } catch (error) {
        log.error("Error deploying contract:", error);
    }
}

async function interactWithContract(contract) {
    try {
        log.info("Interacting with the contract...");

        const tx = await contract.setMessage("2025 JP from Only-layer");
        log.info("Transaction sent, waiting for confirmation...");
        await tx.wait();

        // Read the updated message
        const updatedMessage = await contract.message();
        log.info(`Updated Message: ${updatedMessage}\n`);
    } catch (error) {
        log.error("Error interacting with the contract:", error);
    }
}

async function deployContracts() {
    log.warn(banner)
    const wallets = readWallets();
    if (!wallets) {
        log.error("Please Create new wallets first...");
        process.exit(1);
    }
    log.info(`Found ${wallets.length} existing wallets...`);

    for (let i = 0; i < wallets.length; i++) {
        const wallet = wallets[i];
        log.info(`=== Starting Creating Contract for wallet ${wallet.address} ===`);
        await deployContract(wallet.privateKey);
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

deployContracts()