# Melodious NFT Contracts

This directory contains the smart contracts for the Melodious NFT integration, enabling artists to mint unique track NFTs and fungible artist tokens.

## Contracts Overview

### TrackNFT.sol (ERC721)

- **Purpose**: Unique ownership of individual tracks
- **Token Standard**: ERC721 (Non-Fungible Token)
- **Features**:
  - Mint unique NFTs for each track
  - Store track metadata (IPFS hash with Pinata gateway integration, royalty percentage, artist wallet)
  - Track activation/deactivation functionality
  - Royalty information storage
  - OpenZeppelin v5 compatible with \_update hooks

### ArtistToken.sol (ERC1155)

- **Purpose**: Fungible artist tokens tied to tracks for fan engagement
- **Token Standard**: ERC1155 (Multi-Token Standard)
- **Features**:
  - Create fungible tokens for each track
  - Fan token purchases with ETH
  - Automatic royalty distribution to artists
  - Platform fee collection
  - Token holder tracking for rewards
  - IPFS metadata integration with Pinata gateway
  - OpenZeppelin v5 compatible with \_update hooks

## Contract Addresses (After Deployment)

After deployment, update these addresses in your configuration:

```typescript
// Update in cartesi-backend/src/models/config.model.ts
trackNftContractAddress: "0x...", // TrackNFT contract address
artistTokenContractAddress: "0x...", // ArtistToken contract address
```

## Deployment Instructions

### Prerequisites

1. Install dependencies:

```bash
cd /Users/mac/personal-projects/melodious/smart-contract
yarn install
```

2. Configure your network in `hardhat.config.ts`
3. Set up your deployment wallet with sufficient funds

### Deployment Options

#### Option 1: Deploy Individual Contracts

**Deploy TrackNFT:**

```bash
npx hardhat ignition deploy ignition/modules/TrackNFT.ts --network <network-name> --parameters '{"initialOwner": "0xYourOwnerAddress"}'
```

**Deploy ArtistToken:**

```bash
npx hardhat ignition deploy ignition/modules/ArtistToken.ts --network <network-name> --parameters '{"platformWallet": "0xYourPlatformWalletAddress", "initialOwner": "0xYourOwnerAddress", "ctsiTokenAddress": "0xYourCTSITokenAddress"}'
```

#### Option 2: Deploy Both Contracts Together

```bash
npx hardhat ignition deploy ignition/modules/NFTContracts.ts --network <network-name> --parameters '{"platformWallet": "0xYourPlatformWalletAddress", "initialOwner": "0xYourOwnerAddress", "ctsiTokenAddress": "0xYourCTSITokenAddress"}'
```

### Deployment Parameters

- **initialOwner**: Address that will own the contracts (required for OpenZeppelin v5 Ownable)
- **platformWallet**: Address that will receive platform fees from artist token sales (required for ArtistToken)
- **ctsiTokenAddress**: Address of the CTSI (ERC20) token contract used for payments (required for ArtistToken)

### Example Deployment Commands

**For Local Development (Hardhat Network):**

```bash
# Start local node
npx hardhat node

# Deploy to local network
npx hardhat ignition deploy ignition/modules/NFTContracts.ts --network localhost --parameters '{"platformWallet": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "initialOwner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"}'
```

**For Testnet (e.g., Sepolia):**

```bash
npx hardhat ignition deploy ignition/modules/NFTContracts.ts --network sepolia --parameters '{"platformWallet": "0xYourPlatformWalletAddress", "initialOwner": "0xYourOwnerAddress"}'
```

## Contract Interaction Examples

### TrackNFT Contract

```typescript
// Mint a track NFT
const tx = await trackNFT.mintTrackNFT(
  artistAddress,
  "track-id-123",
  artistAddress,
  "QmYourIPFSHash",
  10 // 10% royalty
);

// Check if track is minted
const isMinted = await trackNFT.isTrackMinted("track-id-123");

// Get track metadata
const metadata = await trackNFT.getTrackMetadata(tokenId);
```

### ArtistToken Contract

```typescript
// Mint artist tokens
const tx = await artistToken.mintArtistTokens(
  "track-id-123",
  artistAddress,
  1000, // total supply
  ethers.utils.parseEther("0.01") // price per token
);

// Purchase tokens (as a fan)
// Note: Buyer must first approve CTSI tokens to the contract
const purchaseTx = await artistToken.purchaseTokens(
  tokenId,
  10, // amount to purchase
  buyerAddress // address that will receive the tokens
);

// Get token information
const tokenInfo = await artistToken.getTokenInfo(tokenId);
```

## Integration with Cartesi Backend

After deployment, update the Cartesi backend configuration:

1. **Update Config Model** (`cartesi-backend/src/models/config.model.ts`):

   - Add the deployed contract addresses

2. **Update ConfigService** (`cartesi-backend/src/services/config.service.ts`):

   - Ensure validation includes the new contract addresses

3. **Environment Variables**:
   ```bash
   TRACK_NFT_CONTRACT_ADDRESS=0x...
   ARTIST_TOKEN_CONTRACT_ADDRESS=0x...
   ```

## Testing

Run the contract tests:

```bash
npx hardhat test
```

## Verification

After deployment, verify contracts on Etherscan:

```bash
npx hardhat verify --network <network-name> <contract-address> [constructor-args]
```

## Security Considerations

1. **Access Control**: Both contracts use OpenZeppelin's `Ownable` for admin functions
2. **Reentrancy Protection**: ArtistToken uses `ReentrancyGuard` for purchase functions
3. **Input Validation**: All functions include proper input validation
4. **Emergency Functions**: Emergency withdrawal function available for contract owner

## Gas Optimization

- Use `Counters` library for efficient token ID management
- Batch operations where possible
- Efficient storage patterns for metadata

## Upgrade Path

For future upgrades, consider implementing proxy patterns:

- OpenZeppelin's upgradeable contracts
- Transparent or UUPS proxy patterns

## Support

For questions or issues:

1. Check the contract documentation
2. Review the integration proposal document
3. Test on local/testnet before mainnet deployment
