const fs = require('fs');
let { networkConfig } = require('../helper-hardhat-config');

require('dotenv').config();

const contract_name = process.env.CONTRACT_NAME;

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  log('--------------------------------------');
  const NFFEET = await deploy(contract_name, {
    // deploys contract
    from: deployer,
    args:['NFFeet', 'Feet', '123456'],
    log: true,
  });

  log(`You deployed a NFT contract to ${NFFEET.address}`);
  log(`The deployer address: ${deployer}`)
  // const NffeetContract = await ethers.getContractFactory(contract_name); //grabs the NFFeet contract factory.
  const accounts = await hre.ethers.getSigners(); //grabs an account.
  const signer = accounts[0];


  const networkName = networkConfig[chainId]['name'];
  log(
    `Verify with: \n npx hardhat verify --network ${networkName} ${NFFEET.address}`
  );

//   let transactionReponse = await NFfeet.create(svg); //calls the create function
//   let receipt = await transactionReponse.wait(1); //wait 1 block for transaction to go through.
//   log('You created an NFT');
//   log(`you can view the tokenURI here ${await NFfeet.tokenURI(0)}`);
};
