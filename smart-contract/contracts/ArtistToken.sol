// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Cartesi Input Box interface
interface IInputBox {
    function addInput(
        address dapp,
        bytes calldata input
    ) external returns (bytes32);
}

/**
 * @title ArtistToken
 * @dev ERC1155 contract for fungible artist tokens tied to tracks
 * Fans can purchase these tokens to support artists and earn rewards
 */
contract ArtistToken is ERC1155, ERC1155Holder, Ownable, ReentrancyGuard {
    struct TokenInfo {
        string trackId;
        address artistWallet;
        uint256 totalSupply;
        uint256 pricePerToken;
        uint256 royaltyPercentage;
        uint256 createdTimestamp;
        bool isActive;
    }

    uint256 private _tokenIdCounter;

    // Cartesi integration
    IInputBox public inputBox;
    address public dappAddress;

    // Mapping from token ID to token information
    mapping(uint256 => TokenInfo) public tokenInfo;

    // Mapping from token ID to circulating supply (tokens sold)
    mapping(uint256 => uint256) public circulatingSupply;

    // Mapping from track ID to token ID for quick lookup
    mapping(string => uint256) public trackIdToTokenId;

    // Mapping to check if tokens for a track ID have already been created
    mapping(string => bool) public trackTokensCreated;

    // Mapping to track token holders for reward distribution
    mapping(uint256 => mapping(address => uint256)) public tokenHolders;
    mapping(uint256 => address[]) public tokenHoldersList;

    // Platform fee percentage (e.g., 5% = 500 basis points)
    uint256 public platformFeePercentage = 500; // 5%
    address public platformWallet;

    // CTSI token contract for payments
    IERC20 public ctsiToken;

    event ArtistTokensMinted(
        uint256 indexed tokenId,
        string indexed trackId,
        address indexed artist,
        uint256 supply,
        uint256 pricePerToken
    );

    event TokensPurchased(
        address indexed buyer,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 totalCost,
        address indexed artist
    );

    event TokensDeactivated(uint256 indexed tokenId, string indexed trackId);
    event TokensReactivated(uint256 indexed tokenId, string indexed trackId);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event PlatformWalletUpdated(address oldWallet, address newWallet);
    event CtsiTokenAddressUpdated(address oldAddress, address newAddress);

    constructor(
        address _platformWallet,
        address initialOwner,
        address _ctsiTokenAddress,
        address _inputBox,
        address _dappAddress
    ) ERC1155("") Ownable(initialOwner) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        require(_ctsiTokenAddress != address(0), "Invalid CTSI token address");
        require(_inputBox != address(0), "Invalid input box address");
        require(_dappAddress != address(0), "Invalid dapp address");
        platformWallet = _platformWallet;
        ctsiToken = IERC20(_ctsiTokenAddress);
        inputBox = IInputBox(_inputBox);
        dappAddress = _dappAddress;
    }

    /**
     * @dev Mint artist tokens for a specific track
     * @param trackId Unique identifier for the track
     * @param artistWallet Artist's wallet address
     * @param supply Total supply of tokens to create
     * @param pricePerToken Price per token in CTSI tokens
     * @return tokenId The newly created token ID
     */
    function mintArtistTokens(
        string memory trackId,
        address artistWallet,
        uint256 supply,
        uint256 pricePerToken,
        bytes memory payload
    ) external returns (uint256) {
        require(bytes(trackId).length > 0, "Track ID cannot be empty");
        require(artistWallet != address(0), "Invalid artist wallet");
        require(supply > 0, "Supply must be greater than 0");
        require(pricePerToken > 0, "Price must be greater than 0");
        require(
            !trackTokensCreated[trackId],
            "Tokens already created for this track"
        );

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // Mint all tokens to the contract initially
        _mint(address(this), tokenId, supply, "");

        tokenInfo[tokenId] = TokenInfo({
            trackId: trackId,
            artistWallet: artistWallet,
            totalSupply: supply,
            pricePerToken: pricePerToken,
            royaltyPercentage: 1000, // 10% default royalty
            createdTimestamp: block.timestamp,
            isActive: true
        });

        trackIdToTokenId[trackId] = tokenId;
        trackTokensCreated[trackId] = true;

        emit ArtistTokensMinted(
            tokenId,
            trackId,
            artistWallet,
            supply,
            pricePerToken
        );

        // Send payload to Cartesi backend
        inputBox.addInput(dappAddress, payload);

        return tokenId;
    }

    /**
     * @dev Purchase artist tokens
     * @param tokenId The token ID to purchase
     * @param amount Number of tokens to purchase
     */
    function purchaseTokens(
        uint256 tokenId,
        uint256 amount,
        address buyerAddress,
        bytes memory payload
    ) external nonReentrant {
        TokenInfo storage token = tokenInfo[tokenId];
        require(token.isActive, "Token not active");
        require(amount > 0, "Amount must be greater than 0");

        uint256 availableSupply = token.totalSupply -
            circulatingSupply[tokenId];
        require(availableSupply >= amount, "Insufficient supply available");

        uint256 totalCost = token.pricePerToken * amount;

        // Check CTSI token allowance and balance
        require(
            ctsiToken.allowance(buyerAddress, address(this)) >= totalCost,
            "Insufficient CTSI allowance"
        );
        require(
            ctsiToken.balanceOf(buyerAddress) >= totalCost,
            "Insufficient CTSI balance"
        );

        // Calculate fees and payments
        uint256 platformFee = (totalCost * platformFeePercentage) / 10000;
        uint256 royaltyAmount = (totalCost * token.royaltyPercentage) / 10000;

        // Ensure fees don't exceed total cost
        require(
            platformFee + royaltyAmount <= totalCost,
            "Fees exceed total cost"
        );

        uint256 artistAmount = totalCost - platformFee;

        // Transfer CTSI tokens from buyer to contract
        require(
            ctsiToken.transferFrom(buyerAddress, address(this), totalCost),
            "CTSI transfer failed"
        );

        // Update circulating supply BEFORE transfer to avoid _update issues
        circulatingSupply[tokenId] += amount;

        // Track token holder BEFORE transfer
        if (tokenHolders[tokenId][buyerAddress] == 0) {
            tokenHoldersList[tokenId].push(buyerAddress);
        }
        tokenHolders[tokenId][buyerAddress] += amount;

        // Transfer tokens to buyer (this will call _update)
        this.safeTransferFrom(address(this), buyerAddress, tokenId, amount, "");

        // Distribute CTSI payments
        if (platformFee > 0) {
            require(
                ctsiToken.transfer(platformWallet, platformFee),
                "Platform fee transfer failed"
            );
        }

        if (artistAmount > 0) {
            require(
                ctsiToken.transfer(token.artistWallet, artistAmount),
                "Artist payment transfer failed"
            );
        }

        // Keep royalty amount in contract for future distribution
        // You'll need to implement a separate function to distribute royalties to token holders

        emit TokensPurchased(
            buyerAddress,
            tokenId,
            amount,
            totalCost,
            token.artistWallet
        );

        // Send payload to Cartesi backend
        inputBox.addInput(dappAddress, payload);
    }

    /**
     * @dev Get token information by token ID
     * @param tokenId The token ID to query
     * @return TokenInfo struct containing all token information
     */
    function getTokenInfo(
        uint256 tokenId
    ) external view returns (TokenInfo memory) {
        require(tokenId < _tokenIdCounter, "Token does not exist");
        return tokenInfo[tokenId];
    }

    /**
     * @dev Get token ID by track ID
     * @param trackId The track ID to query
     * @return tokenId The corresponding token ID
     */
    function getTokenIdByTrackId(
        string memory trackId
    ) external view returns (uint256) {
        require(
            trackTokensCreated[trackId],
            "Tokens not created for this track"
        );
        return trackIdToTokenId[trackId];
    }

    /**
     * @dev Check if tokens have been created for a track
     * @param trackId The track ID to check
     * @return bool Whether tokens have been created
     */
    function areTokensCreated(
        string memory trackId
    ) external view returns (bool) {
        return trackTokensCreated[trackId];
    }

    /**
     * @dev Get available supply for a token
     * @param tokenId The token ID to query
     * @return uint256 Available supply
     */
    function getAvailableSupply(
        uint256 tokenId
    ) external view returns (uint256) {
        require(tokenId < _tokenIdCounter, "Token does not exist");
        return tokenInfo[tokenId].totalSupply - circulatingSupply[tokenId];
    }

    /**
     * @dev Get token holders for a specific token
     * @param tokenId The token ID to query
     * @return address[] Array of token holder addresses
     */
    function getTokenHolders(
        uint256 tokenId
    ) external view returns (address[] memory) {
        require(tokenId < _tokenIdCounter, "Token does not exist");
        return tokenHoldersList[tokenId];
    }

    /**
     * @dev Get token balance for a specific holder
     * @param tokenId The token ID to query
     * @param holder The holder address
     * @return uint256 Token balance
     */
    function getTokenHolderBalance(
        uint256 tokenId,
        address holder
    ) external view returns (uint256) {
        return tokenHolders[tokenId][holder];
    }

    /**
     * @dev Deactivate tokens (only owner)
     * @param tokenId The token ID to deactivate
     */
    function deactivateTokens(uint256 tokenId) external onlyOwner {
        require(tokenId < _tokenIdCounter, "Token does not exist");
        require(tokenInfo[tokenId].isActive, "Tokens already deactivated");

        tokenInfo[tokenId].isActive = false;
        emit TokensDeactivated(tokenId, tokenInfo[tokenId].trackId);
    }

    /**
     * @dev Reactivate tokens (only owner)
     * @param tokenId The token ID to reactivate
     */
    function reactivateTokens(uint256 tokenId) external onlyOwner {
        require(tokenId < _tokenIdCounter, "Token does not exist");
        require(!tokenInfo[tokenId].isActive, "Tokens already active");

        tokenInfo[tokenId].isActive = true;
        emit TokensReactivated(tokenId, tokenInfo[tokenId].trackId);
    }

    /**
     * @dev Update platform fee percentage (only owner)
     * @param newFeePercentage New fee percentage in basis points (e.g., 500 = 5%)
     */
    function updatePlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "Fee cannot exceed 10%"); // Max 10%
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = newFeePercentage;
        emit PlatformFeeUpdated(oldFee, newFeePercentage);
    }

    /**
     * @dev Update platform wallet (only owner)
     * @param newPlatformWallet New platform wallet address
     */
    function updatePlatformWallet(
        address newPlatformWallet
    ) external onlyOwner {
        require(newPlatformWallet != address(0), "Invalid platform wallet");
        address oldWallet = platformWallet;
        platformWallet = newPlatformWallet;
        emit PlatformWalletUpdated(oldWallet, newPlatformWallet);
    }

    /**
     * @dev Get the total number of token types created
     * @return uint256 The current token ID counter
     */
    function totalTokenTypes() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Override URI function to return track-specific metadata
     * @param tokenId The token ID to get URI for
     * @return string The token URI
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        require(tokenId < _tokenIdCounter, "Token does not exist");

        // Return IPFS URI using Pinata gateway for metadata
        return
            string(
                abi.encodePacked(
                    "https://chocolate-actual-weasel-471.mypinata.cloud/ipfs/",
                    tokenInfo[tokenId].trackId
                )
            );
    }

    /**
     * @dev Override transfer functions to update token holder tracking
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal override {
        super._update(from, to, ids, amounts);

        // Update token holder tracking only for user-to-user transfers
        // Skip tracking for mints (from == address(0)) and burns (to == address(0))
        // Skip tracking for contract (this will be handled in purchaseTokens)
        if (from != address(0) && to != address(0) && from != address(this)) {
            for (uint256 i = 0; i < ids.length; i++) {
                uint256 tokenId = ids[i];
                uint256 amount = amounts[i];

                // Update sender balance (with underflow protection)
                if (tokenHolders[tokenId][from] >= amount) {
                    tokenHolders[tokenId][from] -= amount;
                }

                // Update receiver balance
                if (tokenHolders[tokenId][to] == 0 && to != address(this)) {
                    tokenHoldersList[tokenId].push(to);
                }
                tokenHolders[tokenId][to] += amount;
            }
        }
    }

    /**
     * @dev Emergency withdrawal function for CTSI tokens (only owner)
     * @param amount Amount of CTSI tokens to withdraw
     */
    function emergencyWithdrawCTSI(uint256 amount) external onlyOwner {
        require(
            amount <= ctsiToken.balanceOf(address(this)),
            "Insufficient CTSI balance"
        );
        require(ctsiToken.transfer(owner(), amount), "CTSI transfer failed");
    }

    /**
     * @dev Update CTSI token address (only owner)
     * @param newCtsiTokenAddress New CTSI token contract address
     */
    function updateCtsiTokenAddress(
        address newCtsiTokenAddress
    ) external onlyOwner {
        require(
            newCtsiTokenAddress != address(0),
            "Invalid CTSI token address"
        );
        address oldAddress = address(ctsiToken);
        ctsiToken = IERC20(newCtsiTokenAddress);
        emit CtsiTokenAddressUpdated(oldAddress, newCtsiTokenAddress);
    }

    /**
     * @dev Override supportsInterface to handle multiple inheritance
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, ERC1155Holder) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
