const { deployments, ethers, getNamedAccounts, network } = require('hardhat');
const { developmentChains } = require('../../helper-hardhat-config');
const { assert } = require('chai');

developmentChains.includes(network.name)
    ? describe.skip
    : describe('FundMe', async () => {
          let deployer, fundMe, fundMeDeployment;
          const sendValue = ethers.parseEther('0.1');

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              deployerSigner = await ethers.getSigner(deployer);

              fundMeDeployment = await deployments.get('FundMe');
              fundMe = await ethers.getContractAt(
                  'FundMe',
                  fundMeDeployment.address,
                  deployerSigner,
              );
          });

          it('Should allow people to fund and withdraw', async () => {
              try {
                  const fundTxResponse = await fundMe.fund({
                      value: sendValue,
                  });
              } catch (error) {
                  console.log(error);
              }

              await fundTxResponse.wait(1);
              const withdrawTxResponse = await fundMe.withdraw();
              await withdrawTxResponse.wait(1);

              const endingBalance = await deployerSigner.provider.getBalance(
                  fundMeDeployment.address,
              );

              assert.equal(endingBalance, 0);
          });
      });
