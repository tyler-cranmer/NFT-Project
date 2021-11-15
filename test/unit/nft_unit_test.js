const chai = require('chai');
const { expect } = require('chai');
const { ethers } = require('hardhat');
const BN = require('bn.js');

//Enable and inject BN dependency
chai.use(require('chai-bn')(BN));

//////////////////////////////////////////
//Test for initial values before launch 
//////////////////////////////////////////
describe('NFT Unit Test Initial Values', () => {
  before(async function () {
    NFTContract = await ethers.getContractFactory('NFT');
    NFTContract = await NFTContract.deploy('cryptoes', 'cpt', '123456');
    await NFTContract.deployed();
  });

  it('Initial baseURI ', async function () {
    expect((await NFTContract.getBaseURI()).toString()).to.equal('123456');
  });

  it('Initial baseExtension', async function () {
    expect((await NFTContract.getBasedExtension()).toString()).to.equal(
      '.json'
    );
  });

  it('Initial Cost Should be set to 69000000000000000 gwei ', async function () {
    expect((await NFTContract.getCost()).toString()).to.equal(
      '69000000000000000'
    );
  });

  it('Initial Max Supply should equal 6969 ', async function () {
    expect((await NFTContract.getMaxSupply()).toString()).to.equal('6969');
  });

  it('Initial Max Minting Amount', async function () {
    expect((await NFTContract.getMaxMintAmount()).toString()).to.equal('15');
  });

  // Turn on when about to deploy. 
  // it('Initial pause setting true', async function () {
  //   expect(await NFTContract.isPaused()).to.equal(true);
  // });
});




/////////////////////////////////////
// Test Setting Values after launch
///////////////////////////////////////
describe('NFT Unit Test Set Values', () => {
  before(async function () {
    NFTContract = await ethers.getContractFactory('NFT');
    NFTContract = await NFTContract.deploy('cryptoes', 'cpt', '123456');
    await NFTContract.deployed();
  });

  beforeEach(async function () {
    let newCost = '50000000000000000';
    let newMaxMint = 5;
    let newBaseURI = '654321';
    let newBaseExtension = '.png';
    let p = true;
    await NFTContract.setCost(newCost);
    await NFTContract.setmaxMintAmount(newMaxMint)
    await NFTContract.setBaseURI(newBaseURI);
    await NFTContract.setBaseExtension(newBaseExtension)
    await NFTContract.pause(p)
  });

  it('Set BaseURI', async () => {
    expect((await NFTContract.getBaseURI()).toString()).to.equal('654321');
  });


  it('Set BaseExtension', async () => {
    expect((await NFTContract.getBasedExtension()).toString()).to.equal('.png');
  });

  it('Set Cost ', async function () {
    expect((await NFTContract.getCost()).toString()).to.equal(
      '50000000000000000'
    );
  });

  it('Set Max Mint Amount', async () => {
    expect((await NFTContract.getMaxMintAmount()).toString()).to.equal('5')
  })

  it('Change Contract pause', async () => {
    expect((await NFTContract.isPaused())).to.equal(true)
  })

});
