const { network } = require('hardhat');
const {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require('../helper-hardhat-config.js');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (developmentChains.includes(network.name)) {
        log('-----------Start of deployment script--------------');
        log('local network detected');
        await deploy('MockV3Aggregator', {
            contract: 'MockV3Aggregator',
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });

        log('Mocks deployed');
        log('-----------End of deployment script--------------');
    }
};

module.exports.tags = ['all', 'mocks'];
