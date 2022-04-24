const { ethers } = require('hardhat');
let { networkConfig } = require('../helper-hardhat-config');

require('dotenv').config();

const contract_name = process.env.CONTRACT2_NAME;

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  log('--------------------------------------');
  // deploys contract
  const NFFeet = await deploy(contract_name, {
    from: deployer,
    log: true,
  });

  log(`You deployed a NFT contract to ${NFFeet.address}`);
  log(`The deployer address: ${deployer}`);

  const factory = await ethers.getContractFactory(contract_name); //grabs the NFFeet contract factory.
  const accounts = await hre.ethers.getSigners(); //grabs an account.
  const signer = accounts[0];

  const tNFTcontract = new ethers.Contract(
    NFFeet.address,
    factory.interface,
    signer
  );

  const networkName = networkConfig[chainId]['name'];

  // v2 contract
  log(
    `\n Verify with: \n npx hardhat verify --network ${networkName} ${tNFTcontract.address}`
  );
};
