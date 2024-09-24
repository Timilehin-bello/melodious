// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MelodiousNFT721 is ERC721, Ownable {
    mapping(uint256 => bytes) private songIdToUri;

    constructor(string memory _name, string memory _symbol, address _owner) ERC721(_name, _symbol) Ownable(_owner) {}

    function safeMint(uint256 _id, address to, bytes memory uri) public {
        songIdToUri[_id] = uri;

        _safeMint(to, _id);
    }

    function getUri(uint256 tokenId) public view returns (bytes memory) {
        bytes memory uri = songIdToUri[tokenId];
        return uri;
    }
}
