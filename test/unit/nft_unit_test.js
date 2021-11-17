const chai = require('chai');
const { expect } = require('chai');
const { ethers } = require('hardhat');
const BN = require('bn.js');
const {
  Contract,
} = require('hardhat/internal/hardhat-network/stack-traces/model');
const { hexValue } = require('@ethersproject/bytes');
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
  });

  // Wallet Of Owner Tests, tokenURI test, withdraw
  describe('Other Functions', () => {
    before(async function () {
      NFTContract = await ethers.getContractFactory('NFT');
      NFTContract = await NFTContract.deploy('cryptoes', 'cpt', '123456');
      await NFTContract.deployed();
    });
    // it("Should return the Buyer's token IDs.", async () => {
    //   const params = {
    //     value: ethers.utils.parseUnits('.207', 'ether'),
    //   };
    //   await contract.connect(addr1).mint(3, params);
    //   ids = await contract.walletOfOwner(addr1.address);
    //   expect(ids).to.have.members([
    //     {
    //       _hex: hexValue(0x01),
    //     },
    //     {
    //       _hex: hexValue(0x02)
    //     },
    //     {
    //       _hex: hexValue(0x03),
    //     },
    //   ]);
    // });

    it("Should transfer funds to owner", async () => {
      const params = {
        value: ethers.utils.parseUnits('.345', 'ether'),
      };
      await contract.connect(addr1).mint(5, params)
      const ownerBalance = await contract.balanceOf(owner.address);
      await contract.withdraw()
      expect(ownerBalance).to.equal(ethers.utils.parseUnits('.345', 'ether'));

    })

  });
});
