// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";


contract TestTinyfrens is ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  uint256 public constant MAX_ELEMENTS = 10;

  event TinyfrenCreated(uint256 indexed id, string indexed tokenURI);

  constructor() ERC721("tinyfrens", "FREN") {}

  // function mintNft(string memory _tokenURI) onlyOwner public returns(uint256) {
  //   require(_tokenIds.current() < MAX_ELEMENTS, "Max minted");
    
  //   _tokenIds.increment();

  //   uint256 newItemId = _tokenIds.current();
  //   _safeMint(msg.sender, newItemId);
  //   _setTokenURI(newItemId, _tokenURI);
  //   emit TinyfrenCreated(newItemId, _tokenURI);

  //   return newItemId;
  // }
  function mintNft(uint _amount) onlyOwner() public {
    for (uint i = 0; i < _amount; i++) {
      uint newItemId = _tokenIds.current();
      _safeMint(msg.sender, newItemId);
      _tokenIds.increment();
    }

  }
}