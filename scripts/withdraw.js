const { getNamedAccounts } = require('hardhat');

const main = async () => {
    const { deployer } = await getNamedAccounts();
    const deployerSigner = await ethers.getSigner(deployer);
    const fundMeDeployment = await deployments.get('FundMe');
    const fundMe = await ethers.getContractAt(
        'FundMe',
        fundMeDeployment.address,
        deployerSigner,
    );

    const withdrawTxResponse = await fundMe.withdraw();
    await withdrawTxResponse.wait(1);

    console.log('Fund withdrew successfully!!!');
};

main()
    .then(() => console.log(process.exit(0)))
    .then((error) => {
        console.log(error);
        process.exit(1);
    });
