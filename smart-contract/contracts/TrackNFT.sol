// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TrackNFT
 * @dev ERC721 contract for unique ownership of individual tracks
 * Each track gets a unique NFT that represents ownership and royalty rights
 */
contract TrackNFT is ERC721, Ownable {
    struct TrackMetadata {
        string trackId;
        address artistWallet;
        string ipfsHash;
        uint256 royaltyPercentage;
        uint256 mintTimestamp;
        bool isActive;
    }

    uint256 private _tokenIdCounter;

    // Mapping from token ID to track metadata
    mapping(uint256 => TrackMetadata) public trackMetadata;

    // Mapping from track ID to token ID for quick lookup
    mapping(string => uint256) public trackIdToTokenId;

    // Mapping to check if a track ID has already been minted
    mapping(string => bool) public trackMinted;

    event TrackNFTMinted(
        uint256 indexed tokenId,
        string indexed trackId,
        address indexed artist,
        string ipfsHash,
        uint256 royaltyPercentage
    );

    event TrackDeactivated(uint256 indexed tokenId, string indexed trackId);
    event TrackReactivated(uint256 indexed tokenId, string indexed trackId);

    constructor(
        address initialOwner
    ) ERC721("Melodious Track NFT", "MELOTRACKNFT") Ownable(initialOwner) {}

    /**
     * @dev Mint a new track NFT
     * @param to Address to mint the NFT to (usually the artist)
     * @param trackId Unique identifier for the track
     * @param artistWallet Artist's wallet address
     * @param ipfsHash IPFS hash of the track metadata
     * @param royaltyPercentage Royalty percentage for the track (0-100)
     * @return tokenId The newly minted token ID
     */
    function mintTrackNFT(
        address to,
        string memory trackId,
        address artistWallet,
        string memory ipfsHash,
        uint256 royaltyPercentage
    ) external onlyOwner returns (uint256) {
        require(bytes(trackId).length > 0, "Track ID cannot be empty");
        require(artistWallet != address(0), "Invalid artist wallet");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(
            royaltyPercentage <= 100,
            "Royalty percentage cannot exceed 100"
        );
        require(!trackMinted[trackId], "Track already minted");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _mint(to, tokenId);

        trackMetadata[tokenId] = TrackMetadata({
            trackId: trackId,
            artistWallet: artistWallet,
            ipfsHash: ipfsHash,
            royaltyPercentage: royaltyPercentage,
            mintTimestamp: block.timestamp,
            isActive: true
        });

        trackIdToTokenId[trackId] = tokenId;
        trackMinted[trackId] = true;

        emit TrackNFTMinted(
            tokenId,
            trackId,
            artistWallet,
            ipfsHash,
            royaltyPercentage
        );

        return tokenId;
    }

    /**
     * @dev Get track metadata by token ID
     * @param tokenId The token ID to query
     * @return TrackMetadata struct containing all track information
     */
    function getTrackMetadata(
        uint256 tokenId
    ) external view returns (TrackMetadata memory) {
        require(_exists(tokenId), "Token does not exist");
        return trackMetadata[tokenId];
    }

    /**
     * @dev Get token ID by track ID
     * @param trackId The track ID to query
     * @return tokenId The corresponding token ID
     */
    function getTokenIdByTrackId(
        string memory trackId
    ) external view returns (uint256) {
        require(trackMinted[trackId], "Track not minted");
        return trackIdToTokenId[trackId];
    }

    /**
     * @dev Check if a track has been minted
     * @param trackId The track ID to check
     * @return bool Whether the track has been minted
     */
    function isTrackMinted(string memory trackId) external view returns (bool) {
        return trackMinted[trackId];
    }

    /**
     * @dev Deactivate a track (only owner)
     * @param tokenId The token ID to deactivate
     */
    function deactivateTrack(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        require(trackMetadata[tokenId].isActive, "Track already deactivated");

        trackMetadata[tokenId].isActive = false;
        emit TrackDeactivated(tokenId, trackMetadata[tokenId].trackId);
    }

    /**
     * @dev Reactivate a track (only owner)
     * @param tokenId The token ID to reactivate
     */
    function reactivateTrack(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        require(!trackMetadata[tokenId].isActive, "Track already active");

        trackMetadata[tokenId].isActive = true;
        emit TrackReactivated(tokenId, trackMetadata[tokenId].trackId);
    }

    /**
     * @dev Get the total number of tracks minted
     * @return uint256 The current token ID counter
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Override tokenURI to return IPFS metadata using Pinata gateway
     * @param tokenId The token ID to get URI for
     * @return string The token URI
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");

        TrackMetadata memory metadata = trackMetadata[tokenId];
        return
            string(
                abi.encodePacked(
                    "https://chocolate-actual-weasel-471.mypinata.cloud/ipfs/",
                    metadata.ipfsHash
                )
            );
    }

    /**
     * @dev Check if token exists
     * @param tokenId The token ID to check
     * @return bool Whether the token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId < _tokenIdCounter;
    }

    /**
     * @dev Override update function to ensure only active tracks can be transferred
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting (from == address(0)) and burning (to == address(0))
        if (from != address(0) && to != address(0)) {
            require(
                trackMetadata[tokenId].isActive,
                "Cannot transfer inactive track"
            );
        }

        return super._update(to, tokenId, auth);
    }
}
