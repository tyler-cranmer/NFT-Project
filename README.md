# NFT Solidity Project in Hardhat

This is the backend to my fullstack NFT project. You will find two different contracts that were developed for different purposes. NFT.sol consist of a standard NFT smart contract and NFT2.sol that utilizes more complex code including a merkle tree white listing implementation. 

## Installation

Run yarn in the terminal

```shell
npx i 
```

After all the dependencies download, try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
npx hardhat coverage
```

## Testing

Run hardhat test by typing the command into the terminal. 

```shell
npx hardhat test
```

```shell
Compiling 16 files with 0.8.0
Compilation finished successfully


  Testing NFT Contract
    Deployment
      ✓ Should set the right owner
      ✓ Should set the right BaseURI 
      ✓ Should set the right Initial baseExtension to .json
      ✓ Should set the Initial Cost Should be 69000000000000000 wei 
      ✓ Initial Max Supply should equal 6969 
      ✓ Should set the Initial Max Minting Amount to 15
      ✓ Initial pause setting true
    Minting
      ✓ Should Mint 5 NFTs (47ms)
      ✓ Should return error when not enough ether has been sent (57ms)
      ✓ Should return error for attemping to mint over limit
      ✓ Should return error when trying to mint over max supply of 6969
      ✓ Should return error when trying to mint less than 1 NFT
      ✓ Should return error when trying to mint and nftContract is paused
    Set Functions
      ✓ Should set BaseURI
      ✓ Should set BaseExtension
      ✓ Should set Cost
      ✓ Should set Max Mint Amount
      ✓ Should change nftContract Pause
      ✓ Should return error when a non Owner of nftContract attemps to setCost
      ✓ Should return error when a non Owner of nftContract attempts to setmaxMintAmount
      ✓ Should return error when a non Owner of nftContract attempts to setBaseURI
      ✓ Should return error when a non Owner of nftContract attempts to setBaseExtension
      ✓ Should return error when a non Owner of nftContract attempts to pause nftContract
    Other Functions
      ✓ Should transfer NFT balance to owner.
      ✓ Should return error when calling withdraw() funds and they are not the owner.
      ✓ Should return the Buyer's token IDs.
      ✓ Should return an empty array if the Owners address has no tokenIds.
      ✓ Should return token URI (40ms)
      ✓ Should return error that for nonexisting token

  Testing NFT2 Contract
    Deployment
      ✓ Should set the right owner
      ✓ Should set the right prefixURI
      ✓ Should return the right uriSuffix
      ✓ Should set cost to .069 ether
      ✓ Should return the right maxSupply number of 6969
      ✓ should return maxMintAmount of 15 per transaction
      ✓ Should return false for paused variable
    Normal Mint
      ✓ Should mint 1 NFT from mint() for owner and cost .069 eth
      ✓ Should mint 5 NFTs from mint() for owner and cost .345 eth
      ✓ Should mint 1 NFT from mint() for addr1 and cost .069 eth
      ✓ Should mint 5 NFTs from mint() for owner and cost .345 eth
      ✓ Should return error message when not enough ether has been sent
      ✓ Should return error message when the contract is paused
      ✓ Should return error message when minting more than 15 NFTs in one transaction
      ✓ Should return error message when minting less than 1 NFTs in one transaction
    zeroCost Mint
      ✓ Should mint 2 NFTs for address 1
      ✓ Should return error if non Owner tries to mint
    White List Minting
      ✓ Should accept address1 into white listing
      ✓ Should accept address1 into white listing
      ✓ Should throw error that contract is paused
      ✓ Should return Invalide Merkle Proof because user isnt on the list
      ✓ Should change merkle root
    Setter Functions
      ✓ Should set new cost and mint 1 NFT
      ✓ Should return error if non Owner tries to set new Cost
      ✓ Should set new maxMintAmount
      ✓ Should return error if non Owner tries to set new maxMintAmount
      ✓ Should set URIprefix
      ✓ Should return error if non Owner tries to set new URIprefix
      ✓ Should set URISuffix
      ✓ Should return error if non Owner tries to set new URIsuffix
      ✓ Should set Pause to true
      ✓ Should return error is non Owner tries to pause Contract
    Other Functions
      ✓ Should transfer Contract Eth balance to Owner
      ✓ Should return error if non Owner is called withdraw()
      ✓ Should return the Buyers token IDs
      ✓ Should return an empty array if the owners address doesnt have any NFTs. WalletOfOwner()
      ✓ Should return token URI
      ✓ Should return error for nonexisting token
      ✓ Should return empty token URI for nonexisting token


  68 passing (6s)
```
Running hardhat coverage will show the percentage of the contracts that has been tested. 

```shell
npx hardhat coverage
```

```shell
------------|----------|----------|----------|----------|----------------|
File        |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
------------|----------|----------|----------|----------|----------------|
 contracts/ |      100 |    94.12 |      100 |      100 |                |
  NFT.sol   |      100 |      100 |      100 |      100 |                |
  NFT2.sol  |      100 |    88.89 |      100 |      100 |                |
------------|----------|----------|----------|----------|----------------|
All files   |      100 |    94.12 |      100 |      100 |                |
------------|----------|----------|----------|----------|----------------|
```
I am not entirely sure why NFT2.sol %Branch is 88.89, because I have tested everything I could think of. Potentially the modifier functions are bringing down the score. With that said, all normal functions have been tested. 
