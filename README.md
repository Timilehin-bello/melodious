# Melodious

Decentralized, Cartesi-powered music streaming. Melodious combines Cartesi Rollups for verifiable on-chain logic, smart contracts for NFTs and tokens, a Node/Express API with Postgres/Redis, and a Next.js frontend.

## Repo Structure

- `cartesi-backend`: Cartesi Rollups dApp backend (routes for users, genres, tracks, playlists, rewards, subscriptions, withdrawals, config).
- `smart-contract`: Hardhat project deploying `CartesiToken`, `MelodiousVault`, `TrackNFT`, and `ArtistToken` to the local Cannon network.
- `server`: Node/Express API with Prisma, Postgres, Redis, and job processing.
- `frontend`: Next.js app (GraphQL + sockets) for artists and listeners.

## Tech Stack

- Cartesi Rollups (CLI) and Cannon local chain (`anvil`) for development
- Hardhat + Ethers
- Node.js (Express), Prisma, Postgres, Redis
- Next.js (App Router), GraphQL (Apollo/URQL), React Query

## Prerequisites

- Node `>=20` (recommended) and Yarn
- Docker Desktop (Postgres + Redis)
- Cartesi CLI `@cartesi/cli@2.0.0-alpha.20`
- Foundry (for `cast`) — required to run the genre seeding script
- Browser wallet: Rabby Wallet (recommended) or MetaMask
- Git and a terminal

## Quick Start (Local Dev)

### 1) Start Cartesi dApp locally

1. Open a terminal and go to `cartesi-backend`.
   Commands:
   ```bash
   yarn install
   yarn build   # optional but recommended
   ```
2. Build and run the Cartesi machine:
   ```bash
   cartesi build
   cartesi run --services explorer,graphql --epoch-length 1
   ```
3. Copy the printed dApp contract address. You’ll use it as `DAPP_ADDRESS` in the steps below.

Notes:

- The Cannon chain (`anvil`) runs under Cartesi at `http://127.0.0.1:6751/anvil` (`chainId 13370`).
- GraphQL endpoint typically runs at `http://127.0.0.1:6751/graphql`.

### 2) Deploy smart contracts (Cannon network)

1. Open a new terminal, go to `smart-contract`.
   Commands:
   ```bash
   cd smart-contract
   yarn install
   cp .env.example .env
   # in .env
   DAPP_ADDRESS=<your_dapp_address_from_step_1>
   ```
2. Deploy everything to Cannon:
   ```bash
   yarn deploy:cannon
   ```
3. After deployment, capture addresses from the logs:
   - `CartesiToken`
   - `MelodiousVault`
   - `TrackNFT`
   - `ArtistToken`
4. Update `.env` with your `CTSI_TOKEN_ADDRESS` (CartesiToken). This helps with minting and verification scripts.

Mandatory (but useful):

- Mint CTSI to your wallet for testing:
  ```bash
  MINT_TO=<your_wallet> MINT_AMOUNT=10000 yarn mint:ctsi-to
  ```

### 3) Send config to the dApp (Cartesi input)

With the contract addresses from step 2, send a configuration payload so the Cartesi backend knows where to find each component.

1. In a terminal, run: `cartesi send`

```bash
cartesi send
```

2. Accept the default RPC URL.
3. Paste your application address (`DAPP_ADDRESS`).
4. Choose “string” encoding.
5. Paste a JSON payload like this (replace placeholders with your addresses):

```
{"method":"create_config","args":{
  "adminWalletAddresses":["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
  "cartesiTokenContractAddress":"<CartesiToken>",
  "vaultContractAddress":"<MelodiousVault>",
  "artistPercentage":70,
  "platformFeePercentage":5,
  "poolPercentage":30,
  "feePercentage":2,
  "serverAddress":"0x0000000000000000000000000000000000000000",
  "relayerAddress":"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "dappContractAddress":"<DAPP_ADDRESS>",
  "melodiousNftAddress":"0x0000000000000000000000000000000000000000",
  "referralPoints":100,
  "trackNftContractAddress":"<TrackNFT>",
  "artistTokenContractAddress":"<ArtistToken>",
  "conversionRate":1000,
  "minConversion":5,
  "maxDailyConversion":10000
}}
```

This persists configuration inside the Cartesi application state. You can later update via `{"method":"update_config",...}`.

### 3a) Seed initial Genres (required)

The dApp expects base genres to exist. Seed them via the provided script.

- Requirements: Foundry’s `cast` is installed.
  - macOS:
    ```bash
    curl -L https://foundry.paradigm.xyz | bash && foundryup
    ```
  - Linux (Debian/Ubuntu):
    ```bash
    sudo apt update && sudo apt install -y curl git
    curl -L https://foundry.paradigm.xyz | bash && foundryup
    ```
  - Windows (WSL2 + Ubuntu): enable WSL2, install Ubuntu from Microsoft Store, then run the Linux command above inside WSL. Ensure Docker Desktop uses the WSL2 backend.
  - Verify:
    ```bash
    cast --version
    ```

Steps:

- Open `cartesi-backend/src/scripts/genre.script.sh` and set:
  - `APPLICATION_ADDRESS="<your DAPP_ADDRESS>"`
  - Confirm `INPUT_BOX_ADDRESS` and `RPC_URL` match your local setup (`http://127.0.0.1:6751/anvil`). But no need to change it since it's already there. Just change your `APPLICATION_ADDRESS` to your `DAPP_ADDRESS`
- From in `cartesi-backend/`, run:
  ```bash
  bash src/scripts/genre.script.sh
  ```

What it does:

- Sends Cartesi inputs to create multiple genres via the InputBox (`addInput`).
- You can verify in the frontend or by querying GraphQL notices that genres are present.

### 4) Boot the API server

1. Open a terminal and go to `server`.

   ```bash
   cd server
   yarn install
   cp .env.example .env
   # in .env (minimum)
   DAPP_ADDRESS=<your_dapp_address>
   RPC_URL=http://127.0.0.1:6751/anvil
   INPUTBOX_ADDRESS=0xc70074BDD26d8cF983Ca6A5b89b8db52D5850051

   yarn infra:up
   yarn start:dev   # choose “yes” when prompted to reset

   Open a new terminal and go to server directory and run the command to seed ads.
   ```

   ```bash
   yarn seed:ads
   ```

Subsequent runs for development:

```bash
yarn start:test
```

### 4a) Wallet Setup (Rabby recommended)

- Install Rabby Wallet: https://rabby.io (Chrome/Brave/Arc supported).
- Import the local test mnemonic (Anvil default):
  ```text
  test test test test test test test test test test test junk
  ```
  - Only for local dev; never use on mainnet.
- Add the local Cannon chain in your wallet:
  - RPC URL: `http://127.0.0.1:6751/anvil`
  - Chain ID: `13370`
  - Currency symbol: `ETH`
- MetaMask note: users sometimes hit RPC/connectivity issues on local custom chains; if you see chain mismatch or connection loops, prefer Rabby for smoother local testing.
- Test RPC connectivity:
  ```bash
  cast block-number --rpc-url http://127.0.0.1:6751/anvil
  ```

### 5) Start the frontend

1. Open a terminal and go to `frontend`.

   ```bash
   cd frontend
   yarn install
   cp .env.example .env
   # in .env
   NEXT_PUBLIC_DAPP_ADDRESS=<your_dapp_address>
   NEXT_PUBLIC_CARTESI_TOKEN_ADDRESS=<CartesiToken>
   NEXT_PUBLIC_RPC_URL=http://127.0.0.1:6751/anvil

   yarn dev
   ```

Tip: Frontend also has codegen scripts (`yarn codegen`) for GraphQL and typechain.

## Common Commands

Cartesi backend (`cartesi-backend`):

- `yarn build` — Bundle TS and prepare dApp code
- `cartesi build` — Build the Cartesi machine image
- `cartesi run --services explorer,graphql --epoch-length 1` — Run local node

Smart contracts (`smart-contract`):

- `yarn deploy:cannon` — Deploy CartesiToken, MelodiousVault, TrackNFT, ArtistToken
- `yarn mint:ctsi-to` — Mint CTSI to a wallet (`MINT_TO`, `MINT_AMOUNT`)
- `yarn verify:deployment` — Check deployed contracts are live and callable

API server (`server`):

- `yarn infra:up` / `yarn infra:down` — Start/stop Postgres + Redis
- `yarn start:dev` — Reset DB + push schema, run dev server
- `yarn start:test` — Dev server without DB reset
- `yarn seed:ads` — Seed ads data

Frontend (`frontend`):

- `yarn dev` — Start Next.js (Turbopack)
- `yarn build` / `yarn start` — Build and run in production mode
- `yarn codegen` — Generate GraphQL and typechain artifacts

## Troubleshooting

- “Insufficient CTSI balance” when subscribing or purchasing Artist tokens: mint more via `MINT_TO=<your_wallet> MINT_AMOUNT=10000 yarn mint:ctsi-to`.
- GraphQL endpoint not reachable: ensure `cartesi run` started with `--services explorer,graphql`.
- Postgres/Redis connection issues: check Docker is running and `yarn infra:up` succeeded; verify ports in `.env`.
- Contract calls failing on Cannon: confirm `cartesi run` is active, `.env` values are accurate, and you deployed to `http://127.0.0.1:6751/anvil`.

## Notes

- `genre.script.sh` seeds base genres and is part of the required local setup. It uses Foundry’s `cast` to submit inputs to the Cartesi InputBox.
- All addresses shown in examples are for local development. Replace with your own when deploying elsewhere.

Enjoy building with Melodious! 🎵
