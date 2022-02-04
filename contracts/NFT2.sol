// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.2;

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/security/Pausable.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/Counters.sol";

// contract NFT is ERC721, ERC721URIStorage, Pausable, Ownable {
//     using Counters for Counters.Counter;

//     Counters.Counter private _tokenIdCounter;

//     mapping(string => uint8) existingURIs;

//     uint256 public cost = 0.069 ether;
//     uint256 public maxSupply = 50;
//     uint256 public maxMintAmount = 15;
//     bool public paused = false; 

//     constructor() ERC721("NFT", "NFTSymbol") {}

//     function _baseURI() internal pure override returns (string memory) {
//         return "ipfs://";
//     }

//     function pause() public onlyOwner {
//         _pause();
//     }

//     function unpause() public onlyOwner {
//         _unpause();
//     }

//     function safeMint(address to, string memory uri) public onlyOwner {
//         uint256 tokenId = _tokenIdCounter.current();
//         _tokenIdCounter.increment();
//         _safeMint(to, tokenId);
//         _setTokenURI(tokenId, uri);
//     }

//     function _beforeTokenTransfer(address from, address to, uint256 tokenId)
//         internal
//         whenNotPaused
//         override
//     {
//         super._beforeTokenTransfer(from, to, tokenId);
//     }

//     // The following functions are overrides required by Solidity.

//     function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
//         super._burn(tokenId);
//     }

//     function tokenURI(uint256 tokenId)
//         public
//         view
//         override(ERC721, ERC721URIStorage)
//         returns (string memory)
//     {
//         return super.tokenURI(tokenId);
//     }

//     function isContentOwned(string memory uri) public view returns (bool){
//         return existingURIs[uri] == 1;
//     }

//     function payToMint(
//         address recipient,
//         string memory metadataURI
//     ) public payable returns (uint256) {
//         require(existingURIs[metadataURI] != 1, "NFT already minted");
//         requre(msg.value >= cost, "")
//     }
// }