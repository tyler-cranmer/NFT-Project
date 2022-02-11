/ SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol'
import './@rarible/royalties/contracts/impl/RoyaltiesV2Impl.sol';
import './@rarible/royalties/contracts/LibPart.sol';
import './@rarible/royalties/contracts/LibRoyaltiesV2.sol';

contract NFT is ERC721, Ownable, RoyaltiesV2Impl {
  using Strings for uint256;
  using Counters for Counters.Counter;
  
  Counters.Counter private supply;


  string public uriPrefix = "";
  string public uriSuffix = ".json";
  uint256 public cost = 0.069 ether;
  uint256 public maxSupply = 6969;
  uint256 public maxMintAmount = 15;
  bool public paused = false;

  constructor() ERC721("NAME", "SYMBOL") {
    setBaseURI(_initBaseURI); // NEED to change
  }

  modifier mintCompliance(uint256 _minAmount) {
      require(_mintAmount > 0 && _mintAmount <= maxMintAmount, "Invalid mint amount.");
      require(supply.current() + _mintAmount <= maxSupply, "Max supply exceeded.");
      _;
  }

  function totalSupply() public view returns (uint256) {
      return supply.current()
  }

  function mint(uint256 _mintAmount) public payable mintCompliance(_mintAmount) {
      require(!paused, "The contract is paused.");
      require(msg.value >= cost * _mintAmount, "Insufficient funds!");

      _mintLoop(msg.sender, _mintAmount);
  }

  function mintForAddress(uint256 _mintAmount, address _reciever) public mintCompliance(_mintAmount) onlyOwner {
      _mintLoop(_reciever, _mintAmount);
  }

  function walletOfOwner(address _owner) public view returns (uint256[] memory){
      uint256 ownerTokenCount = balanceOf(_owner);
      uint256[] memory ownedTokenIds = new uint256[](ownerTokenCount);
      uint256 currentTokenId = 1;
      uint256 ownedTokenIndex = 0;

      while (ownedTokenIndex < ownerTokenCount && currentTokenId <= maxSupply) {
          address currentTokenOwner = ownerOf(currentTokenId);

          if(currentTokenOwner == _owner) {
              ownedtokenIds[ownedTokenIndex] = currentTokenId;
              ownedTokenIndex++;
          }

          currentTokenId++;
      }

      return ownedTokenIds;
  }

  // public
  function mint(uint256 _mintAmount) public payable {
    uint256 supply = totalSupply();
    require(!paused, 'Sale has been paused');
    require(_mintAmount > 0, 'Must mint atleast 1 NFT');
    require(
      _mintAmount <= maxMintAmount,
      'There is a limit on minting too many at a time!'
    );
    require(
      supply + _mintAmount <= maxSupply,
      'Minting this many would exceed supply!'
    );

    if (msg.sender != owner()) {
      require(msg.value >= cost * _mintAmount, 'Not enough ether sent!');
    }

    for (uint256 i = 1; i <= _mintAmount; i++) {
      _safeMint(msg.sender, supply + i);
    }
  }

  function tokenIdOfOwner(address _owner)
    public
    view
    returns (uint256[] memory)
  {
    uint256 ownerTokenCount = balanceOf(_owner);

    if (ownerTokenCount == 0) {
      return new uint256[](0);
    } else {
      uint256[] memory tokenIds = new uint256[](ownerTokenCount);

      for (uint256 i = 0; i < ownerTokenCount; i++) {
        tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
      }
      return tokenIds;
    }
  }

  function tokenURI(uint256 tokenId)
    public
    view
    virtual
    override
    returns (string memory)
  {
    require(
      _exists(tokenId),
      'ERC721Metadata: URI query for nonexistent token'
    );

    string memory currentBaseURI = _baseURI();
    return
      bytes(currentBaseURI).length > 0
        ? string(
          abi.encodePacked(currentBaseURI, tokenId.toString(), baseExtension)
        )
        : '';
  }

  function setCost(uint256 _newCost) public onlyOwner {
    cost = _newCost;
  }

  function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner {
    maxMintAmount = _newmaxMintAmount;
  }

  function setBaseURI(string memory _newBaseURI) public onlyOwner {
    baseURI = _newBaseURI;
  }

  function setBaseExtension(string memory _newBaseExtension) public onlyOwner {
    baseExtension = _newBaseExtension;
  }

  function pause(bool _state) public onlyOwner {
    paused = _state;
  }

  function getBaseURI() public view returns (string memory) {
    return baseURI;
  }

  function getBasedExtension() public view returns (string memory) {
    return baseExtension;
  }

  function getCost() public view returns (uint256) {
    return cost;
  }

  function getMaxSupply() public view returns (uint256) {
    return maxSupply;
  }

  function getMaxMintAmount() public view returns (uint256) {
    return maxMintAmount;
  }

  function isPaused() public view returns (bool) {
    return paused;
  }

  function withdraw() external onlyOwner {
    address payable to = payable(owner());
    to.transfer(address(this).balance);
  }
