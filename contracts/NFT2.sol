// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';

contract test0x is ERC721, Ownable {
  using Strings for uint256;
  using Counters for Counters.Counter;

  Counters.Counter private supply;

  string public uriPrefix = '';
  string public uriSuffix = '.json';
  uint256 public cost = 0.069 ether;
  uint256 public maxSupply = 6969;
  uint256 public maxMintAmount = 15;
  bool public paused = false;

  bytes32 public merkleRoot =
    0x53c4e5e25bcbb26b82784b9793d8a74a02719aabab34c2d0358b26231e2f4bbe; //NEED TO ADD
  mapping(address => bool) public whitelistClaimed;

  constructor() ERC721('test0x', 't0x') {
    setUriPrefix('ipfs://QmdsHvfVX3EzXAzQMq7GYpGcaVSKm8YzqbBXmaDUwK3jUC/'); //NEED TO CHANGE
  }

  modifier mintCompliance(uint256 _mintAmount) {
    require(
      _mintAmount > 0 && _mintAmount <= maxMintAmount,
      'Invalid mint amount.'
    );
    require(
      supply.current() + _mintAmount <= maxSupply,
      'Max supply exceeded.'
    );
    _;
  }

  function totalSupply() public view returns (uint256) {
    return supply.current();
  }

  function mint(uint256 _mintAmount)
    public
    payable
    mintCompliance(_mintAmount)
  {
    require(!paused, 'The contract is paused.');
    require(msg.value >= cost * _mintAmount, 'Insufficient funds!');

    _mintLoop(msg.sender, _mintAmount);
  }

  function whiteListMint(bytes32[] calldata _merkleProof, uint256 _mintAmount)
    public
    payable
    mintCompliance(_mintAmount)
  {
    require(!paused, 'The contract is paused');
    require(!whitelistClaimed[msg.sender], 'Address already claimed');

    bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
    require(
      MerkleProof.verify(_merkleProof, merkleRoot, leaf),
      'Invalide Merkle Proof'
    );
    whitelistClaimed[msg.sender] = true;
    _mintLoop(msg.sender, _mintAmount);
  }

  function zeroCostMint(uint256 _mintAmount, address _reciever)
    public
    mintCompliance(_mintAmount)
    onlyOwner
  {
    _mintLoop(_reciever, _mintAmount);
  }

  function walletOfOwner(address _owner)
    public
    view
    returns (uint256[] memory)
  {
    uint256 ownerTokenCount = balanceOf(_owner);
    uint256[] memory ownedTokenIds = new uint256[](ownerTokenCount);
    uint256 currentTokenId = 1;
    uint256 ownedTokenIndex = 0;

    while (ownedTokenIndex < ownerTokenCount && currentTokenId <= maxSupply) {
      address currentTokenOwner = ownerOf(currentTokenId);

      if (currentTokenOwner == _owner) {
        ownedTokenIds[ownedTokenIndex] = currentTokenId;
        ownedTokenIndex++;
      }

      currentTokenId++;
    }

    return ownedTokenIds;
  }

  function tokenURI(uint256 _tokenId)
    public
    view
    virtual
    override
    returns (string memory)
  {
    require(
      _exists(_tokenId),
      'ERC721Metadata: URI query for nonexistent token'
    );

    string memory currentBaseURI = _baseURI();
    return
      bytes(currentBaseURI).length > 0
        ? string(
          abi.encodePacked(currentBaseURI, _tokenId.toString(), uriSuffix)
        )
        : '';
  }

  function setCost(uint256 _newCost) public onlyOwner {
    cost = _newCost;
  }

  function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner {
    maxMintAmount = _newmaxMintAmount;
  }

  function setUriPrefix(string memory _uriPrefix) public onlyOwner {
    uriPrefix = _uriPrefix;
  }

  function setUriSuffix(string memory _uriSuffix) public onlyOwner {
    uriSuffix = _uriSuffix;
  }

  function setPause(bool _state) public onlyOwner {
    paused = _state;
  }

  function isPaused() public view returns (bool) {
    return paused;
  }

  function withdraw() external onlyOwner {
    address payable to = payable(owner());
    to.transfer(address(this).balance);
  }

  function _mintLoop(address _reciever, uint256 _mintAmount) internal {
    for (uint256 i = 0; i < _mintAmount; i++) {
      supply.increment();
      _safeMint(_reciever, supply.current());
    }
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return uriPrefix;
  }

  function setMerkleRoot(bytes32 _newMerkleRoot) public onlyOwner {
    merkleRoot = _newMerkleRoot;
  }
}
