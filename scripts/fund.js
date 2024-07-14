const { getNamedAccounts, ethers, deployments } = require('hardhat');

const main = async () => {
    const { deployer } = await getNamedAccounts();
    const deployerSigner = await ethers.getSigner(deployer);
    const fundMeDeployment = await deployments.get('FundMe');
    const fundMe = await ethers.getContractAt(
        'FundMe',
        fundMeDeployment.address,
        deployerSigner,
    );
    const fundTxResponse = await fundMe.fund({
        value: ethers.parseEther('0.1'),
    });
    await fundTxResponse.wait(1);

    console.log('Funded Successfully!');
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
