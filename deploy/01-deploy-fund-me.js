const { network } = require('hardhat');
const {
    networkConfig,
    developmentChains,
} = require('../helper-hardhat-config.js');
const { verify } = require('../utils/verify.js');

const { vars } = require('hardhat/config');
const ETHERSCAN_API_KEY = vars.get('ETHERSCAN_API_KEY');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    let ethUsdPriceFeedAddress;

    log('--------------- Start of fundme mock --------------- ');

    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get('MockV3Aggregator');
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
    }

    const args = [ethUsdPriceFeedAddress];
    const fundMe = await deploy('FundMe', {
        from: deployer,
        args: args, //put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (!developmentChains.includes(network.name) && ETHERSCAN_API_KEY) {
        await verify(fundMe.address, args);
    }

    log('--------------- End of fundme mock --------------- ');
};

module.exports.tags = ['all', 'fundme'];
