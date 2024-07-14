require('@nomicfoundation/hardhat-toolbox');
require('hardhat-deploy');
const { vars } = require('hardhat/config');
require('@nomicfoundation/hardhat-verify');
require('hardhat-gas-reporter');
require('solidity-coverage');

/** @type import('hardhat/config').HardhatUserConfig */
const SEPOLIA_RPC_URL = vars.get('SEPOLIA_RPC_URL') || '';
const PRIVATE_KEY = vars.get('PRIVATE_KEY') || '';
const ETHERSCAN_API_KEY = vars.get('ETHERSCAN_API_KEY') || '';
const COINMARKETCAP_API_KEY = vars.get('COINMARKETCAP_API_KEY') || '';

module.exports = {
    solidity: {
        compilers: [
            {
                version: '0.8.24',
            },
            {
                version: '0.8.0',
            },
        ],
    },
    defaultNetwork: 'hardhat',
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },
        localhost: {
            url: 'http://localhost:8545', // yarn hardhat node
            // accounts: auto set by hardhat
            chainId: 31337,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    sourcify: {
        enabled: true,
    },
    gasReporter: {
        enabled: true,
        outputFile: 'gas-report.txt',
        noColors: true,
        currency: 'USD',
        // coinmarketcap: COINMARKETCAP_API_KEY, // get API key from coinmarketcap
        TOKEN: 'MATIC',
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
};
