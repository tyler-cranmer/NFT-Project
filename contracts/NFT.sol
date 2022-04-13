// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract NFTMEME is ERC721Enumerable, Ownable {
  using Strings for uint256;

  string baseURI;
  string public baseExtension = '.json';
  uint256 public cost = 0.069 ether;
  uint256 public maxSupply = 6969;
  uint256 public maxMintAmount = 15;
  bool public paused = false;

  constructor(
    string memory _name,
    string memory _symbol,
    string memory _initBaseURI
  ) ERC721(_name, _symbol) {
    setBaseURI(_initBaseURI);
  }

  // internal
  function _baseURI() internal view virtual override returns (string memory) {
    return baseURI;
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
    uint256 tokenCount = balanceOf(_owner);

    if (tokenCount == 0) {
      return new uint256[](0);
    } else {
      uint256[] memory tokenIds = new uint256[](tokenCount);

      for (uint256 i = 0; i < tokenCount; i++) {
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

  // function setRoyalties(
  //   uint256 _tokenId,
  //   address payable _royaltiesRecipientAddress,
  //   uint96 _percentageBasisPoints
  // ) public onlyOwner {
  //   LibPart.Part[] memory _royalties = new LibPart.Part[](1);
  //   _royalties[0].value = _percentageBasisPoints;
  //   _royalties[0].account = _royaltiesRecipientAddress;
  //   _saveRoyalties(_tokenId, _royalties);
  // }

  // function supportsInterface(bytes4 interfaceId)
  //   public
  //   view
  //   virtual
  //   override(ERC721)
  //   returns (bool)
  // {
  //   if (interfaceId == LibRoyaltiesV2._INTERFACE_ID_ROYALTIES) {
  //     return true;
  //   }
  //   return super.supportsInterface(interfaceId);
  // }
}
