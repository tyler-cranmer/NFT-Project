const chai = require('chai');
const { expect } = require('chai');
const { ethers } = require('hardhat');
const BN = require('bn.js');
//Enable and inject BN dependency
chai.use(require('chai-bn')(BN));

describe('Testing NFT2 Contract', () => {
  let factory;
  let Contract;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async () => {
    factory = await ethers.getContractFactory('test0x');
    Contract = await factory.deploy();

    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
  });

  /***********************/
  /* DEPLOYMENT SECTION */
  /***********************/
  describe('Deployment', () => {
    it('Should set the right owner', async () => {
      expect(await Contract.owner()).to.equal(owner.address);
    });

    it('Should set the right prefixURI', async function () {
      expect((await Contract.uriPrefix()).toString()).to.equal(
        'ipfs://QmdsHvfVX3EzXAzQMq7GYpGcaVSKm8YzqbBXmaDUwK3jUC/'
      );
    });

    it('Should return the right uriSuffix', async () => {
      expect((await Contract.uriSuffix()).toString()).to.equal('.json');
    });

    it('Should set cost to .069 ether', async () => {
      expect((await Contract.cost()).toString()).to.equal('69000000000000000');
    });

    it('Should return the right maxSupply number of 6969', async () => {
      expect((await Contract.maxSupply()).toString()).to.equal('6969');
    });

    it('should return maxMintAmount of 15 per transaction', async () => {
      expect((await Contract.maxMintAmount()).toString()).to.equal('15');
    });

    it('Should return false for paused variable', async () => {
      expect(await Contract.isPaused()).to.equal(false);
    });
  });

  /***********************/
  /* NORMAL MINT SECTION */
  /***********************/
  describe('Normal Mint', () => {
    it('Should mint 1 NFT from mint() for owner and cost .069 eth', async () => {
      const mintAmount = 1;
      const params = {
        value: ethers.utils.parseUnits('.069', 'ether'),
      };
      await Contract.mint(mintAmount, params);

      const ownerBalance = await Contract.balanceOf(owner.address);
      const newlyMintedAmount = await Contract.totalSupply();
      expect(await newlyMintedAmount).to.equal(ownerBalance);
    });

    it('Should mint 5 NFTs from mint() for owner and cost .345 eth', async () => {
      const mintAmount = 5;
      const params = {
        value: ethers.utils.parseUnits('.345', 'ether'),
      };
      await Contract.mint(mintAmount, params);

      const ownerBalance = await Contract.balanceOf(owner.address);
      const newlyMintedAmount = await Contract.totalSupply();
      expect(await newlyMintedAmount).to.equal(ownerBalance);
    });

    it('Should mint 1 NFT from mint() for addr1 and cost .069 eth', async () => {
      const mintAmount = 1;
      const params = {
        value: ethers.utils.parseUnits('.069', 'ether'),
      };

      await Contract.connect(addr1).mint(mintAmount, params);
      const addr1Balance = await Contract.balanceOf(addr1.address);
      const newlyMintedAmount = await Contract.totalSupply();
      expect(await newlyMintedAmount).to.equal(addr1Balance);
    });

    it('Should mint 5 NFTs from mint() for owner and cost .345 eth', async () => {
      const mintAmount = 5;
      const params = {
        value: ethers.utils.parseUnits('.345', 'ether'),
      };
      await Contract.connect(addr1).mint(mintAmount, params);
      const addr1Balance = await Contract.balanceOf(addr1.address);
      const newlyMintedAmount = await Contract.totalSupply();
      expect(await newlyMintedAmount).to.equal(addr1Balance);
    });

    it('Should return error message when not enough ether has been sent', async () => {
      const mintAmount = 2;
      const params = {
        value: ethers.utils.parseUnits('.01', 'ether'),
      };
      expect(
        Contract.connect(addr1).mint(mintAmount, params)
      ).to.be.revertedWith('Insufficient funds!');
    });

    it('Should return error message when the contract is paused', async () => {
      await Contract.setPause(true);
      const mintAmount = 1;
      const params = {
        value: ethers.utils.parseUnits('.069', 'ether'),
      };
      await expect(
        Contract.connect(addr1).mint(mintAmount, params)
      ).to.be.revertedWith('The contract is paused');
    });

    it('Should return error message when minting more than 15 NFTs in one transaction', async () => {
      const mintAmount = 16;
      const params = {
        value: ethers.utils.parseUnits('1.104', 'ether'),
      };
      await expect(
        Contract.connect(addr1).mint(mintAmount, params)
      ).to.be.revertedWith('Invalid mint amount.');
    });
    it('Should return error message when minting less than 1 NFTs in one transaction', async () => {
      const mintAmount = 0;
      const params = {
        value: ethers.utils.parseUnits('1.104', 'ether'),
      };
      await expect(
        Contract.connect(addr1).mint(mintAmount, params)
      ).to.be.revertedWith('Invalid mint amount.');
    });
  });

  /***********************/
  /* ZEROCOST MINT SECTION */
  /***********************/
  describe('zeroCost Mint', async () => {
    it('Should mint 2 NFTs for address 1', async () => {
      await Contract.zeroCostMint(2, addr1.address);
      const newOwnerBalance = await Contract.balanceOf(addr1.address);
      const newlyMintedAmount = await Contract.totalSupply();
      expect(newOwnerBalance).to.equal(newlyMintedAmount);
    });

    it('Should return error if non Owner tries to mint', async () => {
      expect(
        Contract.connect(addr1).zeroCostMint(1, addr2.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  /***********************/
  /* WHITE LIST SECTION */
  /***********************/

  describe('White List Minting', async () => {
    it('Should accept address1 into white listing', async () => {
      const merkleProof = [
        '0x5931b4ed56ace4c46b68524cb5bcbf4195f1bbaacbe5228fbd090546c88dd229',
        '0x4f8308e80fa9f9e268915ace55f8dc6e48c90e365d07b1489b7462d5c3fbc1bc',
        '0x4726e4102af77216b09ccd94f40daa10531c87c4d60bba7f3b3faf5ff9f19b3c',
      ];

      await Contract.setMerkleRoot(
        '0x5cc050dfd0bf4853c04d6b2c22077e65c88ad249186d69ad44d07a3846932b62'
      );
      const params = {
        value: ethers.utils.parseUnits('.069', 'ether'),
      };

      await Contract.connect(addr1).whiteListMint(merkleProof, 1, params);
      const OwnerBalance = await Contract.balanceOf(addr1.address);
      const newMintNumber = await Contract.totalSupply();
      expect(OwnerBalance).to.equal(newMintNumber);
    });

    it('Should accept address1 into white listing', async () => {
      const merkleProof = [
        '0x5931b4ed56ace4c46b68524cb5bcbf4195f1bbaacbe5228fbd090546c88dd229',
        '0x4f8308e80fa9f9e268915ace55f8dc6e48c90e365d07b1489b7462d5c3fbc1bc',
        '0x4726e4102af77216b09ccd94f40daa10531c87c4d60bba7f3b3faf5ff9f19b3c',
      ];

      await Contract.setMerkleRoot(
        '0x5cc050dfd0bf4853c04d6b2c22077e65c88ad249186d69ad44d07a3846932b62'
      );
      const params = {
        value: ethers.utils.parseUnits('.069', 'ether'),
      };

      await Contract.connect(addr1).whiteListMint(merkleProof, 1, params);

      await expect(
        Contract.connect(addr1).whiteListMint(merkleProof, 1, params)
      ).to.be.revertedWith('Address already claimed');
    });

    it('Should throw error that contract is paused', async () => {
      const merkleProof = [
        '0x5931b4ed56ace4c46b68524cb5bcbf4195f1bbaacbe5228fbd090546c88dd229',
        '0x4f8308e80fa9f9e268915ace55f8dc6e48c90e365d07b1489b7462d5c3fbc1bc',
        '0x4726e4102af77216b09ccd94f40daa10531c87c4d60bba7f3b3faf5ff9f19b3c',
      ];

      await Contract.setMerkleRoot(
        '0x5cc050dfd0bf4853c04d6b2c22077e65c88ad249186d69ad44d07a3846932b62'
      );
      await Contract.setPause(true);
      const params = {
        value: ethers.utils.parseUnits('.069', 'ether'),
      };
      await expect(
        Contract.connect(addr1).whiteListMint(merkleProof, 1, params)
      ).to.be.revertedWith('The contract is paused');
    });

    it('Should return Invalide Merkle Proof because user isnt on the list', async () => {
      const merkleProof = [
        '0x5931b4ed56ace4c46b68524cb5bcbf4195f1bbaacbe5228fbd090546c88dd229',
        '0x4f8308e80fa9f9e268915ace55f8dc6e48c90e365d07b1489b7462d5c3fbc1bc',
        '0x4726e4102af77216b09ccd94f40daa10531c87c4d60bba7f3b3faf5ff9f19b3c',
      ];

      const params = {
        value: ethers.utils.parseUnits('.069', 'ether'),
      };

      expect(
        Contract.connect(addr1).whiteListMint(merkleProof, 1, params)
      ).to.be.revertedWith('Invalide Merkle Proof');
    });

    it('Should change merkle root', async () => {
      const newMerkleRoot =
        '0x143750465941b29921f50a28e0e43050e5e1c2611a3ea8d7fe1001090d5e1436';
      await Contract.connect(owner).setMerkleRoot(newMerkleRoot);
      const merkleRoot = await Contract.merkleRoot();
      expect(merkleRoot).to.equal(newMerkleRoot);
    });
  });

  /***********************/
  /* SETTER FUNCTION SECTION */
  /***********************/
  describe('Setter Functions', async () => {
    it('Should set new cost and mint 1 NFT', async () => {
      const mintAmount = 1;
      const newCost = ethers.utils.parseUnits('0.207', 'ether');
      const params = {
        value: ethers.utils.parseUnits('0.207', 'ether'),
      };
      await Contract.setCost(newCost);
      await Contract.mint(mintAmount, params);
      const ownerBalance = await Contract.balanceOf(owner.address);
      const newlyMintedAmount = await Contract.totalSupply();
      expect(await newlyMintedAmount).to.equal(ownerBalance);
    });

    it('Should return error if non Owner tries to set new Cost', async () => {
      newCost = ethers.utils.parseUnits('.207', 'ether');
      expect(Contract.connect(addr1).setCost(newCost)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('Should set new maxMintAmount', async () => {
      const newMaxMintAmount = 10;
      await Contract.setmaxMintAmount(newMaxMintAmount);
      expect(await Contract.maxMintAmount()).to.equal(10);
    });

    it('Should return error if non Owner tries to set new maxMintAmount', async () => {
      const newMaxMintAmount = 10;
      expect(
        Contract.connect(addr1).setmaxMintAmount(newMaxMintAmount)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Should set URIprefix', async () => {
      const newPrefix = 'ipfs://{CID}/';
      await Contract.setUriPrefix(newPrefix);
      expect(await Contract.uriPrefix()).to.equal('ipfs://{CID}/');
    });

    it('Should return error if non Owner tries to set new URIprefix', async () => {
      const newPrefix = 'ipfs://{CID}/';
      expect(
        Contract.connect(addr1).setUriPrefix(newPrefix)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Should set URISuffix', async () => {
      const newSuffix = '.png';
      await Contract.setUriSuffix(newSuffix);
      expect(await Contract.uriSuffix()).to.equal('.png');
    });

    it('Should return error if non Owner tries to set new URIsuffix', async () => {
      const newSuffix = 'ipfs://{CID}/';
      expect(
        Contract.connect(addr1).setUriSuffix(newSuffix)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Should set Pause to true', async () => {
      const t = true;
      await Contract.setPause(t);
      expect(await Contract.isPaused()).to.equal(true);
    });

    it('Should return error is non Owner tries to pause Contract', async () => {
      const t = true;
      expect(Contract.connect(addr1).setPause(t)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
  });

  /***********************/
  /* OTHER FUNCTION SECTION */
  /***********************/
  describe('Other Functions', async () => {
    it('Should transfer Contract Eth balance to Owner', async () => {
      const params = {
        value: ethers.utils.parseUnits('0.069', 'ether'),
      };

      await Contract.connect(addr1).mint(1, params);
      await expect(await Contract.withdraw()).to.changeEtherBalance(
        owner,
        ethers.utils.parseUnits('.069', 'ether')
      );
    });

    it('Should return error if non Owner is called withdraw()', async () => {
      expect(Contract.connect(addr1).withdraw()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('Should return the Buyers token IDs', async () => {
      const params = {
        value: ethers.utils.parseUnits('.345', 'ether'),
      };
      await Contract.connect(addr1).mint(5, params);
      const ids = await Contract.walletOfOwner(addr1.address);

      expect(ids).to.have.deep.members(ids);
    });

    it('Should return an empty array if the owners address doesnt have any NFTs. WalletOfOwner()', async () => {
      const params = {
        value: ethers.utils.parseUnits('.207', 'ether'),
      };
      await Contract.connect(addr1).mint(1, params);
      ids = await Contract.walletOfOwner(addr2.address);
      expect(ids).to.have.members([]);
    });

    it('Should return token URI', async () => {
      const uriPrefix = 'ipfs://{CID}/';
      const one = 1;

      const params = {
        value: ethers.utils.parseUnits('.069', 'ether'),
      };
      await Contract.setUriPrefix(uriPrefix);
      await Contract.connect(addr1).mint(one, params);
      expect(await Contract.tokenURI(1)).to.equal(`ipfs://{CID}/${one}.json`);
    });

    it('Should return error for nonexisting token', async () => {
      const nonExTokenId = 2;
      const params = {
        value: ethers.utils.parseUnits('.069', 'ether'),
      };
      await Contract.connect(addr1).mint(1, params);
      expect(Contract.tokenURI(nonExTokenId)).to.be.revertedWith(
        'ERC721Metadata: URI query for nonexistent token'
      );
    });
    it('Should return empty token URI for nonexisting token', async () => {
      const uriPrefix = '';
      const one = 1;

      const params = {
        value: ethers.utils.parseUnits('.069', 'ether'),
      };
      await Contract.setUriPrefix(uriPrefix);
      await Contract.connect(addr1).mint(one, params);
      expect(await Contract.tokenURI(1)).to.equal('');
    });
  });
});
