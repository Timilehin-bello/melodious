// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MelodiousNFT721.sol";
import "./Counter.sol";
import "./MelodiousNFT1155.sol";

/**
 * @title Melodious
 * @notice Melodious is a platform for artists to upload their music and 
 * for fans to purchase fractional ownership of the music as ERC1155 tokens.
 * @dev This contract allows artists to upload their music and for fans to purchase 
 * fractional ownership of the music as ERC1155 tokens.
 */
 contract Melodious is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private songCounter;


    struct Song {
        uint256 songId;
        address artist;
        uint256 totalRevenue; // Total revenue allocated to the artist
        uint256 engagementMetric; // Popularity based on likes, streams, etc.
        uint256 nft1155TotalSupply; // Total supply of ERC1155 tokens
        address nft1155ContractAddress;
        uint256 tokenPrice;
    }
    uint256 public constant ARTIST_SHARE_ERC1155 = 30; // Artist keeps 30% of ERC1155
    uint256 public constant FAN_SHARE_ERC1155 = 70; // 70% sold to fans
    uint256 public constant PURCHASE_LIMIT = 10; // Max tokens a fan can purchase


    // struct to store the data for the ERC1155 contract
    struct ERC1155ContractData {
        address _artist;
        uint256 _totalSupply;
        uint256 _maxSupply;
        bytes _uri;
    }
    // Mappings to track song info

    mapping(uint256 => Song) public songs;
    mapping(uint256 => uint256) public totalSupply1155;

    // mapping to keep track of MelodiousNFT1155 contract address
    mapping(uint256 => address) public erc1155ContractAddress;
    mapping(uint256 => address) public erc721ContractAddress;

    // Events
    event SongUploaded(uint256 indexed songId, address indexed artist);
    event ERC1155Purchased(uint256 indexed songId, address indexed buyer, uint256 amount);

    constructor (address _owner) Ownable(_owner) {}

    // Artist uploads a song - generates both NFT721 (ownership) and NFT1155 (fractional ownership)
    function uploadSong(ERC1155ContractData memory data, uint256 _tokenPrice) external onlyOwner nonReentrant {
        songCounter.increment();
        uint256 songId = songCounter.current();

        MelodiousNFT721 erc721Contract = new MelodiousNFT721("MelodiousNFT721", "M721");
        erc721ContractAddress[songId] = address(erc721Contract);
        // Create the ERC721 for the song ownership
        erc721Contract.safeMint(songId, data._artist, data._uri);

        MelodiousNFT1155 erc1155Contract = new MelodiousNFT1155(data._artist, string(data._uri));
        erc1155ContractAddress[songId] = address(erc1155Contract);




        erc1155Contract.safeMint(data._artist, songId, data._maxSupply, data._uri);


        songs[songId] = Song({
            songId: songId,
            artist: data._artist,
            totalRevenue: 0,
            engagementMetric: 0,
            nft1155TotalSupply: data._totalSupply,
            nft1155ContractAddress: address(erc1155Contract),
            tokenPrice: _tokenPrice
        });

        emit SongUploaded(songId, data._artist);
    }

    // Fans can purchase ERC1155 tokens, with a purchase limit to prevent concentration
    function purchase1155(uint256 songId, uint256 amount, address fanAddress) external payable nonReentrant {
        Song memory song = songs[songId];
        require(song.songId != 0, "Song does not exist");
        require(amount <= PURCHASE_LIMIT, "Purchase limit exceeded");
        require(msg.value == amount * song.tokenPrice, "Incorrect payment amount");

        MelodiousNFT1155 erc1155Contract = MelodiousNFT1155(erc1155ContractAddress[songId]);
        erc1155Contract.mintToCommunity(songId, amount, fanAddress);

        // Update the total supply and total revenue
        song.nft1155TotalSupply += amount;
        song.totalRevenue += msg.value;

        emit ERC1155Purchased(songId, fanAddress, amount);
    }

    // Function to update engagement metrics
    function updateEngagementMetric(uint256 songId, uint256 engagement) external onlyOwner {
        require(songs[songId].songId == songId, "Song does not exist");

        // Update the engagement metric (likes, streams, etc.)
        songs[songId].engagementMetric = engagement;
    }

    // Function to calculate the value of ERC1155 based on revenue and engagement
    function calculateERC1155Value(uint256 songId) public view returns (uint256) {
        Song memory song = songs[songId];
        require(song.songId != 0, "Song does not exist");

        MelodiousNFT1155 erc1155Contract = MelodiousNFT1155(erc1155ContractAddress[songId]);
        uint256 totalSupply = erc1155Contract.totalSupply(songId);

        uint256 value;
        if (song.totalRevenue > 0) {
            uint256 revenueShare = (song.totalRevenue * ARTIST_SHARE_ERC1155) / 100;
            value = revenueShare / totalSupply;
        } else {
            // Fallback value calculation based on engagement metric or a predefined value
            value = 0.001 ether;  
            if (song.engagementMetric > 0) {
                value += value * song.engagementMetric / 100;
            }
        }

        return value;
    }
}
