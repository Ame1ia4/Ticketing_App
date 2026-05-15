# Block 8 Ticketing — Web3 ERC-20 Ticketing System

## Overview

Block 8 Ticketing is a decentralized Ethereum-based ticket purchasing system built using:

* Solidity smart contracts
* Web3.js
* Vanilla JavaScript frontend
* MetaMask integration
* Foundry unit testing
* Jest frontend testing
* Sepolia Ethereum testnet
* Infura RPC provider

The application allows users to:

* Create Ethereum wallets
* Load encrypted keystore wallets
* Purchase ERC-20 ticket tokens
* Transfer ticket tokens
* Return tickets to the vendor
* Check balances
* Interact with the blockchain using MetaMask or raw keystore signing

---

# Architecture

## Smart Contract

Main contract:

```text
contracts/ticket_v2.sol
```

The contract implements:

* ERC-20 compatible token logic
* Ticket purchasing using Sepolia ETH
* Vendor refund / return flows
* Allowance + approval functionality
* Withdrawal of ETH by vendor
* Reentrancy protection
* Security hardening

### Important Functions

| Function         | Description                     |
| ---------------- | ------------------------------- |
| `buyToken()`     | Purchase ticket tokens with ETH |
| `transfer()`     | Transfer tokens between users   |
| `approve()`      | Approve spender allowance       |
| `transferFrom()` | Transfer using allowance        |
| `transferBack()` | Return tickets to vendor        |
| `withdraw()`     | Vendor withdraws ETH            |

---

# Frontend Structure

## Main Frontend Pages

| File                   | Purpose                    |
| ---------------------- | -------------------------- |
| `index.html`           | Homepage                   |
| `buy_ticket.html`      | Purchase tickets           |
| `transfer_ticket.html` | Transfer tickets           |
| `create_wallet.html`   | Generate encrypted wallets |
| `check_balance.html`   | Query token balances       |

## Shared JavaScript

```text
assets/js/web3_init.js
```

Handles:

* Web3 initialization
* MetaMask support
* Contract creation
* Transaction signing
* Wallet decryption
* Gas estimation
* Nonce management
* Error modal helpers

---

# Security Features

## CSP (Content Security Policy)

The frontend uses CSP headers to reduce XSS and injection risk.

Configured protections:

* Blocks inline JavaScript
* Restricts script sources
* Restricts network connections
* Disables object/embed execution
* Prevents iframe embedding

## SRI (Subresource Integrity)

External CDN dependencies use integrity hashes:

* jQuery
* Web3.js

This prevents tampered CDN assets from loading.

## Wallet Security

The frontend:

* Never stores private keys in DOM fields
* Uses encrypted keystore JSON files
* Uses password-protected decryption
* Implements decrypt attempt lockout
* Clears wallet references after transaction use

## Reentrancy Protection

The smart contract includes:

```solidity
modifier nonReentrant()
```

Protecting:

* `buyToken()`
* `withdraw()`

---

# Project Structure

```text
blockchain_project/
│
├── assets/
│   ├── css/
│   └── js/
│   └── img/
│
├── contracts/
│   └── ticket_v2.sol
|
├── documents/
│   └── ai_logs.md
│
├── frontend_tests/
│   ├── buy_ticket.test.js
│   ├── transfer_ticket.test.js
│   ├── create_wallet.test.js
│   ├── check_balance.test.js
│   ├── web3_init.test.js
│   ├── jest.config.js
│   ├── setup.js
│   └── package.json
│
├── pages/
│   ├── buy_ticket.html
│   ├── transfer_ticket.html
│   ├── create_wallet.html
│   └── check_balance.html
|
|
├── test/
│   ├── ticket.t.sol
│   └── mocks/reentrancyVendorMock.sol
│
├── lib/
│   └── forge-std/
│
├── foundry.toml
├── package.json
├── index.html
└── README.md
```

---

# Running the Frontend

## Start Local Server

From the project root:

```bash
python -m http.server 8010
```

Then open:

```text
http://localhost:8010
```

Example:

```text
http://localhost:8010/pages/buy_ticket.html
```

---

# MetaMask Setup

## Configure Sepolia

Add the Sepolia testnet to MetaMask.

## Fund Wallet

Use a Sepolia faucet to obtain test ETH.

## Contract Configuration

Edit:

```text
assets/js/config.js
```

Example:

```javascript
const CONFIG = {
    INFURA_URL: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    CONTRACT_ADDRESS: "0xYourContractAddress"
};
```

---

# Running Solidity Tests (Foundry)

## Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Install forge-std

From project root:

```bash
forge install foundry-rs/forge-std
```

---

# Running Smart Contract Tests

## Run All Tests

```bash
forge test -vv
```

## Run Gas Report

```bash
forge test --gas-report
```

## Run Coverage

```bash
forge coverage
```

## Re-run Failed Tests

```bash
forge test --rerun
```

---

# Solidity Test Coverage

Current coverage for `ticket_v2.sol`:

| Metric     | Coverage |
| ---------- | -------- |
| Lines      | ~96%     |
| Statements | ~98%     |
| Branches   | ~73%     |
| Functions  | ~92%     |

Covered flows include:

* Deployment
* Initial supply
* Buying tickets
* ETH payment validation
* Transfers
* Allowances
* transferFrom
* Refund flows
* Vendor withdrawals
* Access control
* Revert cases
* Fuzz testing

---

# Running Frontend Tests (Jest)

## Navigate to frontend tests

```bash
cd frontend_tests
```

## Install dependencies

```bash
npm install
```

## Run tests

```bash
npm test
```

## Run tests with coverage

```bash
npm test -- --coverage
```

---

# Frontend Test Coverage

Frontend Jest tests validate:

## web3_init.test.js

* Web3 initialization
* MetaMask detection
* Contract factory creation
* Modal helpers
* Wallet loader

## buy_ticket.test.js

* Purchase transaction creation
* ETH amount validation
* Error handling
* DOM updates

## transfer_ticket.test.js

* Transfer button flow
* Invalid address handling
* Transaction generation
* Modal error handling

## create_wallet.test.js

* Password validation
* Wallet generation
* Keystore creation
* DOM rendering

## check_balance.test.js

* Balance lookup
* Invalid wallet handling
* Contract call failures

---

# Why Jest Required Special Handling

The frontend was originally written as browser-global JavaScript.

Browser scripts expose functions globally through:

```javascript
window.getContract
```

Node/Jest does NOT automatically expose browser globals.

To support testing:

* `module.exports` was added to shared JS files
* Web3 was mocked
* jQuery was mocked
* CONFIG was mocked
* CONTRACT_ABI was mocked
* `window.ethereum` was mocked

This allows browser-style scripts to execute in a Node test environment.

---

# Common Commands

## Compile contracts

```bash
forge build
```

## Clean build artifacts

```bash
forge clean
```

## Install frontend dependencies

```bash
npm install
```

## Run frontend tests

```bash
npm test
```

## Run Solidity tests

```bash
forge test -vv
```

---

# Gas Analysis

Current gas usage is reasonable for an educational ERC-20 ticketing system.

Optimizations already implemented:

* immutable token unit cache
* optimized reentrancy guard
* reduced storage writes
* dynamic gas estimation
* shortened revert strings

Most expensive operations:

| Function     | Approx Gas |
| ------------ | ---------- |
| transferFrom | ~140k      |
| transferBack | ~103k      |
| withdraw     | ~104k      |

These are acceptable for Sepolia and small-scale ticketing.

---

# Known Architectural Limitations

## Client-side signing

The app currently supports:

* MetaMask signing
* Raw keystore decryption in browser

Production systems should strongly prefer:

* MetaMask
* WalletConnect
* Hardware wallets

Over raw private key handling.

## No backend

The application is entirely frontend + blockchain.

This means:

* No database
* No server-side sessions
* No centralized authentication

Everything relies on Ethereum accounts.

## Frontend CSP Limitations

Because the app runs locally using:

```bash
python -m http.server
```

CSP is implemented using meta tags.

Production deployments should move CSP headers to:

* nginx
* Apache
* CDN headers
* reverse proxy

For stronger enforcement.

---

# Troubleshooting

## “Web3 is not defined”

Cause:

* web3.js failed to load
* CSP blocked CDN
* bad SRI hash

Fix:

* verify script order
* verify CSP script-src
* verify integrity hashes

---

## “$ is not defined”

Cause:

* jQuery loaded after dependent scripts
* CSP blocked CDN
* invalid integrity hash

Fix:

Ensure:

```html
<script src="jquery"></script>
<script src="web3_init.js"></script>
```

---

## MetaMask not detected

Cause:

* MetaMask extension missing
* browser privacy mode
* unsupported browser

Fix:

Install MetaMask and refresh page.

---

## forge install issues

Delete:

```text
lib/
out/
cache/
```

Then:

```bash
forge install
forge build
```

---

# Git Ignore

The project includes `.gitignore` rules for:

* node_modules
* Foundry build artifacts
* coverage reports
* Jest cache
* IDE files
* environment secrets

If files were already committed before `.gitignore` was added:

```bash
git rm -r --cached .
git add .
git commit -m "Apply gitignore"
```

---

# Final Notes

This project demonstrates:

* ERC-20 token development
* Web3 frontend integration
* Secure browser wallet handling
* Ethereum transaction signing
* Smart contract testing with Foundry
* Frontend testing with Jest
* CSP + SRI hardening
* MetaMask integration

The application is suitable for:

* educational blockchain projects
* smart contract security demonstrations
* Web3 frontend experimentation
* ERC-20 workflow testing

Not recommended for production deployment without:

* professional audit
* backend infrastructure
* stronger wallet abstraction
* hardened CSP headers
* monitoring and logging
* production-grade deployment pipeline
