// const SEPOLIA_RPC_URL = vars.get('SEPOLIA_RPC_URL') || '';
// const PRIVATE_KEY = vars.get('PRIVATE_KEY') || '';
// const ETHERSCAN_API_KEY = vars.get('ETHERSCAN_API_KEY') || '';
// const COINMARKETCAP_API_KEY = vars.get('COINMARKETCAP_API_KEY') || '';

const networkConfig = {
    31337: {
        name: 'localhost',
    },
    11155111: {
        name: 'sepolia',
        ethUsdPriceFeed: '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
    },
    137: {
        name: 'polygon',
        ethUsdPriceFeed: '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
    },
};

const developmentChains = ['hardhat', 'localhost'];
const DECIMALS = 8;
const INITIAL_ANSWER = 3200 * 10 ** 8; // to make compatible with Oracle price format

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
};
