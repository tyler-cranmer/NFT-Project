const { ethers } = require('hardhat');
const fs = require('fs');
let { networkConfig } = require('../helper-hardhat-config');

require('dotenv').config();

const contract_name = process.env.CONTRACT_NAME;

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  log('--------------------------------------');
  // deploys contract
  const NFFeet = await deploy(contract_name, {
    from: deployer,
    args: [
      'NFTname',
      'nme',
      'ipfs://QmSXYMJqC1UBwJ3ZRVWThc9eoV5y2UvDNxnCbxjSUK8Lut/', // -> ipfs://{metadata CID}/ <-
    ],
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
  log(
    `\n Verify with: \n npx hardhat verify --network ${networkName} ${tNFTcontract.address} "${NFFeet.args[0]}" "${NFFeet.args[1]}" "${NFFeet.args[2]}"`
  );
};
