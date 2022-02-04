async function main() {
  // We get the contract to deploy
  const NFTcontract = await ethers.getContractFactory('NFT');
  const nftContract = await NFTcontract.deploy();

  console.log('NFTcontract deployed to:', nftContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
