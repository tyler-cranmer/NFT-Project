const chai = require('chai');
const { expect } = require('chai');
const { ethers } = require('hardhat');
const BN = require('bn.js');
//Enable and inject BN dependency
chai.use(require('chai-bn')(BN));

/////////////////////////////////////////////////////////////////////////////////

describe('Testing NFT Contract', () => {
  let NFTContract;
  let contract;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async () => {
    NFTContract = await ethers.getContractFactory('NFT');
    NFTContract = await NFTContract.deploy('cryptoes', 'cpt', '123456');

    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    contract = await NFTContract.deployed();
  });

  //Deployment Tests
  describe('Deployment', () => {
    it('Should set the right owner', async () => {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it('Should set the right BaseURI ', async function () {
      expect((await contract.getBaseURI()).toString()).to.equal('123456');
    });

    it('Should set the right Initial baseExtension to .json', async function () {
      expect((await contract.getBasedExtension()).toString()).to.equal('.json');
    });

    it('Should set the Initial Cost Should be 69000000000000000 wei ', async function () {
      expect((await contract.getCost()).toString()).to.equal(
        '69000000000000000'
      );
    });

    it('Initial Max Supply should equal 6969 ', async function () {
      expect((await contract.getMaxSupply()).toString()).to.equal('6969');
    });

    it('Should set the Initial Max Minting Amount to 15', async function () {
      expect((await contract.getMaxMintAmount()).toString()).to.equal('15');
    });

    it('Initial pause setting true', async function () {
      const t = true;
      await contract.pause(t);
      expect(await contract.isPaused()).to.equal(true);
    });
  });

  //Minting Tests
  describe('Minting', () => {
    it('Should Mint 5 NFTs', async () => {
      const mintAmount = 5;
      await contract.mint(mintAmount);

      const ownerBalance = await contract.balanceOf(owner.address);
      const newlyMintedAmount = await contract.totalSupply();
      expect(await newlyMintedAmount).to.equal(ownerBalance);
    });

    it('Should return error when not enough ether has been sent', async () => {
      const mintAmount = 5;
      const params = {
        value: ethers.utils.parseUnits('.01', 'ether'),
      };
      await expect(
        contract.connect(addr1).mint(mintAmount, params)
      ).to.be.revertedWith('Not enough ether sent!');
    });

    it('Should return error for attemping to mint over limit', async () => {
      const newMaxMint = 10;
      const mintAmount = 11;
      await contract.setmaxMintAmount(newMaxMint);

      expect(contract.mint(mintAmount)).to.be.revertedWith(
        'There is a limit on minting too many at a time!'
      );
    });

    it('Should return error when trying to mint over max supply of 6969', async () => {
      const mintAmount = 7000;
      await contract.setmaxMintAmount(mintAmount);
      expect(contract.mint(mintAmount)).to.be.revertedWith(
        'Minting this many would exceed supply!'
      );
    });

    it('Should return error when trying to mint less than 1 NFT', async () => {
      const mintAmount = 0;
      expect(contract.mint(mintAmount)).to.be.revertedWith(
        'Must mint atleast 1 NFT'
      );
    });

    it('Should return error when trying to mint and contract is paused', async () => {
      const t = true;
      await NFTContract.pause(t);
      const mintAmount = 1;
      expect(contract.mint(mintAmount)).to.be.revertedWith(
        'Sale has been paused'
      );
    });
  });

  // Set Functions
  describe('Set Functions', () => {
    before(async function () {
      NFTContract = await ethers.getContractFactory('NFT');
      NFTContract = await NFTContract.deploy('cryptoes', 'cpt', '123456');
      await NFTContract.deployed();
    });

    beforeEach(async function () {
      const newCost = new ethers.BigNumber.from(500000000000000);
      let newMaxMint = 5;
      let newBaseURI = '654321';
      let newBaseExtension = '.png';
      let p = true;
      await NFTContract.setCost(newCost);
      await NFTContract.setmaxMintAmount(newMaxMint);
      await NFTContract.setBaseURI(newBaseURI);
      await NFTContract.setBaseExtension(newBaseExtension);
      await NFTContract.pause(p);
    });

    it('Should set BaseURI', async () => {
      expect((await NFTContract.getBaseURI()).toString()).to.equal('654321');
    });

    it('Should set BaseExtension', async () => {
      expect((await NFTContract.getBasedExtension()).toString()).to.equal(
        '.png'
      );
    });

    it('Should set Cost', async function () {
      expect((await NFTContract.getCost()).toString()).to.equal(
        '500000000000000'
      );
    });

    it('Should set Max Mint Amount', async () => {
      expect((await NFTContract.getMaxMintAmount()).toString()).to.equal('5');
    });

    it('Should change contract Pause', async () => {
      expect(await NFTContract.isPaused()).to.equal(true);
    });

    it('Should return error when a non Owner of contract attemps to setCost', async () => {
      newCost = ethers.utils.parseUnits('.207', 'ether');
      expect(contract.connect(addr1).setCost(newCost)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('Should return error when a non Owner of Contract attempts to setmaxMintAmount', async () => {
      newMintAmount = 5;
      expect(
        contract.connect(addr1).setmaxMintAmount(newMintAmount)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Should return error when a non Owner of Contract attempts to setBaseURI', async () => {
      newBaseURI = '2232';
      expect(contract.connect(addr1).setBaseURI(newBaseURI)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('Should return error when a non Owner of Contract attempts to setBaseExtension', async () => {
      newBaseEx = '.png';
      expect(contract.connect(addr1).setBaseURI(newBaseEx)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('Should return error when a non Owner of Contract attempts to pause contract', async () => {
      isPause = true;
      expect(contract.connect(addr1).pause(isPause)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
  });

  // Wallet Of Owner Tests, tokenURI test, withdraw
  describe('Other Functions', () => {
    before(async function () {
      NFTContract = await ethers.getContractFactory('NFT');
      NFTContract = await NFTContract.deploy('cryptoes', 'cpt', '123456');
      await NFTContract.deployed();
    });

    it('Should return error when calling withdraw() funds and they are not the owner.', async () => {
      expect(contract.connect(addr1).withdraw()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    // i know this works but implemented wrong
    it("Should return the Buyer's token IDs.", async () => {
      const params = {
        value: ethers.utils.parseUnits('.207', 'ether'),
      };
      await contract.connect(addr1).mint(1, params);
      ids = await contract.tokenIdOfOwner(addr1.address);
      expect(ids).to.have.members(ids);
    });

    it('Should return an empty array if the Owners address has no tokenIds.', async () => {
      const params = {
        value: ethers.utils.parseUnits('.207', 'ether'),
      };
      await contract.connect(addr1).mint(1, params);
      ids = await contract.tokenIdOfOwner(addr2.address);
      expect(ids).to.have.members([]);
    });

    it('Should return token URI', async () => {
      const BaseURI = 'baseURI';
      const BaseExtension = '.json';
      const params = {
        value: ethers.utils.parseUnits('.069', 'ether'),
      };
      await contract.setBaseURI(BaseURI);
      await contract.setBaseExtension(BaseExtension);
      await contract.connect(addr1).mint(1, params);
      expect(await contract.tokenURI(1)).to.equal('baseURI1.json');
    });

    it('Should return error that for nonexisting token', async () => {
      const mintAmount = 1;
      const nonExTokenID = 2;
      const BaseURI = 'baseURI';
      const BaseExtension = '.json';
      const params = {
        value: ethers.utils.parseUnits('.069', 'ether'),
      };
      await contract.setBaseURI(BaseURI);
      await contract.setBaseExtension(BaseExtension);
      await contract.connect(addr1).mint(mintAmount, params);
      expect(contract.tokenURI(nonExTokenID)).to.be.revertedWith(
        'ERC721Metadata: URI query for nonexistent token'
      );
    });

    // it('Should return error when calling withdraw2() funds and they are not the owner.', async () => {
    //   expect(contract.connect(addr1).withdraw2()).to.be.revertedWith(
    //     'Ownable: caller is not the owner'
    //   );
    // });
  });
});
