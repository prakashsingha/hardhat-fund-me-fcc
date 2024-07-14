const { deployments, ethers, getNamedAccounts, network } = require('hardhat');
const { assert, expect } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
    ? describe.skip
    : describe('FundMe', async () => {
          let fundMe, deployer, deployerSigner, mockV3Aggregator;
          let fundMeDeployment, mockV3AggregatorDeployment;
          const sendValue = ethers.parseEther('1');

          beforeEach(async () => {
              //deploy FundMe contract using hardhat-deploy
              deployer = (await getNamedAccounts()).deployer;
              deployerSigner = await ethers.getSigner(deployer);

              await deployments.fixture(['all']);
              fundMeDeployment = await deployments.get('FundMe');
              mockV3AggregatorDeployment =
                  await deployments.get('MockV3Aggregator');

              fundMe = await ethers.getContractAt(
                  'FundMe',
                  fundMeDeployment.address,
                  deployerSigner,
              );
              mockV3Aggregator = await ethers.getContractAt(
                  'MockV3Aggregator',
                  mockV3AggregatorDeployment.address,
                  deployerSigner,
              );
          });

          describe('Constructor', async () => {
              it('Should set the aggregator addresses correctly', async () => {
                  const response = await fundMe.getPriceFeed(); // ethers v6 doesn't support `priceFeed()`
                  assert.equal(response.address, mockV3Aggregator.address);
              });
          });

          describe('Fund', async () => {
              it("Should fail if you don't send enough ETH", async () => {
                  await expect(fundMe.fund({ value: 0 })).to.be.revertedWith(
                      'Amount must be minimum of 50 USD',
                  );
              });

              it('Should update the funded amount in data structure', async () => {
                  const tx = await fundMe.fund({ value: sendValue });
                  const receipt = await tx.wait();

                  const response =
                      await fundMe.getAddressToAmountFunded(deployer);

                  assert.equal(response, sendValue);

                  if (receipt.events) {
                      const event = receipt.events.find(
                          (event) => event.event === 'Funded',
                      );
                      const [funder, amount, conversionRate] = event.args;
                      console.log(`Funder: ${funder}`);
                      console.log(
                          `Amount: ${ethers.utils.formatEther(amount)}`,
                      );
                      console.log(`Conversion Rate: ${conversionRate}`);
                  } else {
                      console.log('No events found in the receipt');
                  }
              });

              it('Should add funder to s_funders list', async () => {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getFunder(0);
                  assert.equal(response, deployer);
              });
          });

          describe('Withdraw', async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue });
              });

              it('Should withdraw ETH from a single funder', async () => {
                  // Arrange
                  startingFundMeBalance =
                      await deployerSigner.provider.getBalance(
                          fundMeDeployment.address,
                      );
                  startingDeployerBalance =
                      await deployerSigner.provider.getBalance(deployer);

                  // Act
                  const txResponse = await fundMe.withdraw();
                  const txReceipt = await txResponse.wait(1);
                  const { gasUsed, gasPrice } = txReceipt;
                  // console.log(gasUsed, gasPrice);
                  const totalGasCost = gasUsed * gasPrice;

                  const endingFundMeBalance =
                      await deployerSigner.provider.getBalance(
                          fundMeDeployment.address,
                      );
                  const endingDeployerBalance =
                      await deployerSigner.provider.getBalance(deployer);

                  // Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance + startingDeployerBalance,
                      endingDeployerBalance + totalGasCost,
                  );
              });

              it('Should allow to withdraw ETH from multiple funders', async () => {
                  // Assert
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i <= 5; i++) {
                      //accounts[0] is used by deployer
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i],
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  const startingFundMeBalance =
                      await deployerSigner.provider.getBalance(
                          fundMeDeployment.address,
                      );
                  const startingDeployerBalance =
                      await deployerSigner.provider.getBalance(deployer);

                  //Act
                  const txResponse = await fundMe.withdraw();
                  const txReceipt = await txResponse.wait(1);

                  // Assert
                  for (let i = 1; i <= 5; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(accounts[i]),
                          0,
                      );
                  }
              });

              it('Should allow only the owner to withdraw', async () => {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract =
                      await fundMe.connect(attacker);

                  // custom error cannot be done like below
                  // await expect(
                  //     attackerConnectedContract.withdraw(),
                  // ).to.be.revertedWith('FundMe__NotOwner()');

                  await expect(
                      attackerConnectedContract.withdraw(),
                  ).to.be.revertedWithCustomError(fundMe, 'FundMe__NotOwner');
              });
          });

          describe('Cheaper withdraw', async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue });
              });

              it('Should withdraw ETH from a single funder', async () => {
                  // Arrange
                  startingFundMeBalance =
                      await deployerSigner.provider.getBalance(
                          fundMeDeployment.address,
                      );
                  startingDeployerBalance =
                      await deployerSigner.provider.getBalance(deployer);

                  // Act
                  const txResponse = await fundMe.cheaperWithdraw();
                  const txReceipt = await txResponse.wait(1);
                  const { gasUsed, gasPrice } = txReceipt;
                  const totalGasCost = gasUsed * gasPrice;

                  const endingFundMeBalance =
                      await deployerSigner.provider.getBalance(
                          fundMeDeployment.address,
                      );
                  const endingDeployerBalance =
                      await deployerSigner.provider.getBalance(deployer);

                  // Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance + startingDeployerBalance,
                      endingDeployerBalance + totalGasCost,
                  );
              });

              it('Should allow to withdraw ETH from multiple funders', async () => {
                  // Assert
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i <= 5; i++) {
                      //accounts[0] is used by deployer
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i],
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  const startingFundMeBalance =
                      await deployerSigner.provider.getBalance(
                          fundMeDeployment.address,
                      );
                  const startingDeployerBalance =
                      await deployerSigner.provider.getBalance(deployer);

                  //Act
                  const txResponse = await fundMe.cheaperWithdraw();
                  const txReceipt = await txResponse.wait(1);

                  // Assert
                  for (let i = 1; i <= 5; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(accounts[i]),
                          0,
                      );
                  }
              });

              it('Should allow only the owner to withdraw', async () => {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract =
                      await fundMe.connect(attacker);

                  await expect(
                      attackerConnectedContract.cheaperWithdraw(),
                  ).to.be.revertedWithCustomError(fundMe, 'FundMe__NotOwner');
              });
          });
      });
