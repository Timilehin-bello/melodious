// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {Counters} from "./Counter.sol";

contract MelodiousNFT1155 is ERC1155, Ownable, ERC1155Supply {
    uint256 public constant ARTIST_SHARE = 30;
    uint256 public constant COMMUNITY_SHARE = 70;

    // uint256 pu override totalSupply;
    // max supply of the token
    uint256 public maxSupply;

    // mapping to keep track of the max supply of each token
    mapping(uint256 => uint256) public maxSupplyOfToken;
    // mapping to keep track of the current supply of each token
    mapping(uint256 => uint256) public currentSupplyOfToken;

    struct Song {
        address artist;
        uint256 id;
        uint256 artistAmount;
        uint256 maxSupply;
        bytes data;
    }

    mapping(uint256 => Song) public songs;

    constructor(address initialOwner, string memory uri) ERC1155(uri) Ownable(initialOwner) {}

    function safeMint(address _artist, uint256 id, uint256 _maxSupply, bytes memory _data) public onlyOwner {
        require(maxSupplyOfToken[id] == 0, "Token already minted");
        uint256 artistAmount = (_maxSupply * ARTIST_SHARE) / 100;
        maxSupplyOfToken[id] = _maxSupply;
        currentSupplyOfToken[id] = artistAmount;

        songs[id] = Song(_artist, id, artistAmount, _maxSupply, _data);
        _mint(_artist, id, artistAmount, _data);
    }

    function mintToCommunity(uint256 id, uint256 amount, address to) public {
        Song memory song = songs[id];
        require(to != address(0) && to != song.artist, "Invalid address");
        require(amount > 0, "Invalid amount");
        // check if the max supply is not reached and the amount is not more than the max supply
        require(totalSupply() + amount <= song.maxSupply, "Max supply reached");
        currentSupplyOfToken[id] += amount;

        _mint(to, id, amount, song.data);
    }

    function getUri(uint256 id) public view returns (string memory) {
        return uri(id);
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function balanceOf(address account, uint256 id) public view override returns (uint256) {
        return super.balanceOf(account, id);
    }

    function currentSupply(uint256 id) public view returns (uint256) {
        return currentSupplyOfToken[id];
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }
}
