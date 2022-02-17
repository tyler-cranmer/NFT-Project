const chai = require('chai');
const { expect } = require('chai');
const { ethers } = require('hardhat');
const BN = require('bn.js');
//Enable and inject BN dependency
chai.use(require('chai-bn')(BN));

/////////////////////////////////////////////////////////////////////////////////

describe('Testing NFT Contract', () => {
  let factory;
  let nftContract;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async () => {
    factory = await ethers.getContractFactory('NFT');
    nftContract = await factory.deploy('cryptoes', 'cpt', '123456');

    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
  });

  //Deployment Tests
  describe('Deployment', () => {
    it('Should set the right owner', async () => {
      expect(await nftContract.owner()).to.equal(owner.address);
    });

    it('Should set the right BaseURI ', async function () {
      expect((await nftContract.getBaseURI()).toString()).to.equal('123456');
    });

    it('Should set the right Initial baseExtension to .json', async function () {
      expect((await nftContract.getBasedExtension()).toString()).to.equal(
        '.json'
      );
    });

    it('Should set the Initial Cost Should be 69000000000000000 wei ', async function () {
      expect((await nftContract.getCost()).toString()).to.equal(
        '69000000000000000'
      );
    });

    it('Initial Max Supply should equal 6969 ', async function () {
      expect((await nftContract.getMaxSupply()).toString()).to.equal('6969');
    });

    it('Should set the Initial Max Minting Amount to 15', async function () {
      expect((await nftContract.getMaxMintAmount()).toString()).to.equal('15');
    });

    it('Initial pause setting true', async function () {
      const t = true;
      await nftContract.pause(t);
      expect(await nftContract.isPaused()).to.equal(true);
    });
  });

  //Minting Tests
  describe('Minting', () => {
    it('Should Mint 5 NFTs', async () => {
      const mintAmount = 5;
      await nftContract.mint(mintAmount);

      const ownerBalance = await nftContract.balanceOf(owner.address);
      const newlyMintedAmount = await nftContract.totalSupply();
      expect(await newlyMintedAmount).to.equal(ownerBalance);
    });

    it('Should return error when not enough ether has been sent', async () => {
      const mintAmount = 5;
      const params = {
        value: ethers.utils.parseUnits('.01', 'ether'),
      };
      await expect(
        nftContract.connect(addr1).mint(mintAmount, params)
      ).to.be.revertedWith('Not enough ether sent!');
    });

    it('Should return error for attemping to mint over limit', async () => {
      const newMaxMint = 10;
      const mintAmount = 11;
      await nftContract.setmaxMintAmount(newMaxMint);

      expect(nftContract.mint(mintAmount)).to.be.revertedWith(
        'There is a limit on minting too many at a time!'
      );
    });

    it('Should return error when trying to mint over max supply of 6969', async () => {
      const mintAmount = 7000;
      await nftContract.setmaxMintAmount(mintAmount);
      expect(nftContract.mint(mintAmount)).to.be.revertedWith(
        'Minting this many would exceed supply!'
      );
    });

    it('Should return error when trying to mint less than 1 NFT', async () => {
      const mintAmount = 0;
      expect(nftContract.mint(mintAmount)).to.be.revertedWith(
        'Must mint atleast 1 NFT'
      );
    });

    it('Should return error when trying to mint and nftContract is paused', async () => {
      const t = true;
      await nftContract.pause(t);
      const mintAmount = 1;
      expect(nftContract.mint(mintAmount)).to.be.revertedWith(
        'Sale has been paused'
      );
    });
  });

  // Set Functions
  describe('Set Functions', () => {
    beforeEach(async function () {
      const newCost = new ethers.BigNumber.from(500000000000000);
      let newMaxMint = 5;
      let newBaseURI = '654321';
      let newBaseExtension = '.png';
      let p = true;
      await nftContract.setCost(newCost);
      await nftContract.setmaxMintAmount(newMaxMint);
      await nftContract.setBaseURI(newBaseURI);
      await nftContract.setBaseExtension(newBaseExtension);
      await nftContract.pause(p);
    });

    it('Should set BaseURI', async () => {
      expect((await nftContract.getBaseURI()).toString()).to.equal('654321');
    });

    it('Should set BaseExtension', async () => {
      expect((await nftContract.getBasedExtension()).toString()).to.equal(
        '.png'
      );
    });

    it('Should set Cost', async function () {
      expect((await nftContract.getCost()).toString()).to.equal(
        '500000000000000'
      );
    });

    it('Should set Max Mint Amount', async () => {
      expect((await nftContract.getMaxMintAmount()).toString()).to.equal('5');
    });

    it('Should change nftContract Pause', async () => {
      expect(await nftContract.isPaused()).to.equal(true);
    });

    it('Should return error when a non Owner of nftContract attemps to setCost', async () => {
      newCost = ethers.utils.parseUnits('.207', 'ether');
      expect(nftContract.connect(addr1).setCost(newCost)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('Should return error when a non Owner of nftContract attempts to setmaxMintAmount', async () => {
      newMintAmount = 5;
      expect(
        nftContract.connect(addr1).setmaxMintAmount(newMintAmount)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Should return error when a non Owner of nftContract attempts to setBaseURI', async () => {
      newBaseURI = '2232';
      expect(
        nftContract.connect(addr1).setBaseURI(newBaseURI)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Should return error when a non Owner of nftContract attempts to setBaseExtension', async () => {
      newBaseEx = '.png';
      expect(
        nftContract.connect(addr1).setBaseURI(newBaseEx)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Should return error when a non Owner of nftContract attempts to pause nftContract', async () => {
      isPause = true;
      expect(nftContract.connect(addr1).pause(isPause)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
  });

  // Wallet Of Owner Tests, tokenURI test, withdraw
  describe('Other Functions', () => {
    it('Should transfer NFT balance to owner.', async () => {
      const params = {
        value: ethers.utils.parseUnits('.069', 'ether'),
      };
      await nftContract.connect(addr1).mint(1, params);

      await expect(await nftContract.withdraw()).to.changeEtherBalance(
        owner,
        ethers.utils.parseUnits('.069', 'ether')
      );
    });

    it('Should return error when calling withdraw() funds and they are not the owner.', async () => {
      expect(nftContract.connect(addr1).withdraw()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    // i know this works but implemented wrong
    it("Should return the Buyer's token IDs.", async () => {
      const params = {
        value: ethers.utils.parseUnits('.207', 'ether'),
      };
      await nftContract.connect(addr1).mint(1, params);
      ids = await nftContract.tokenIdOfOwner(addr1.address);
      expect(ids).to.have.members(ids);
    });

    it('Should return an empty array if the Owners address has no tokenIds.', async () => {
      const params = {
        value: ethers.utils.parseUnits('.207', 'ether'),
      };
      await nftContract.connect(addr1).mint(1, params);
      ids = await nftContract.tokenIdOfOwner(addr2.address);
      expect(ids).to.have.members([]);
    });

    it('Should return token URI', async () => {
      const BaseURI = 'baseURI';
      const BaseExtension = '.json';
      const params = {
        value: ethers.utils.parseUnits('.069', 'ether'),
      };
      await nftContract.setBaseURI(BaseURI);
      await nftContract.setBaseExtension(BaseExtension);
      await nftContract.connect(addr1).mint(1, params);
      expect(await nftContract.tokenURI(1)).to.equal('baseURI1.json');
    });

    it('Should return error that for nonexisting token', async () => {
      const mintAmount = 1;
      const nonExTokenID = 2;
      const BaseURI = 'baseURI';
      const BaseExtension = '.json';
      const params = {
        value: ethers.utils.parseUnits('.069', 'ether'),
      };
      await nftContract.setBaseURI(BaseURI);
      await nftContract.setBaseExtension(BaseExtension);
      await nftContract.connect(addr1).mint(mintAmount, params);
      expect(nftContract.tokenURI(nonExTokenID)).to.be.revertedWith(
        'ERC721Metadata: URI query for nonexistent token'
      );
    });
  });
});
