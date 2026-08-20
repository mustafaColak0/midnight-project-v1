# Midnight Level 1 - New Moon Project 🌑

This repository contains the Level 1 submission for the Midnight Network development track.

## 💡 Initial Product Idea

I aim to develop a privacy-focused voting system on the Midnight Network. By leveraging Zero-Knowledge proofs, users can cast their votes while keeping their identity and choice completely confidential using a **Private Witness**. At the same time, aggregate vote counts and competition results are updated on the **Public Ledger**, ensuring the outcome is fully verifiable by the public without compromising individual voter privacy.

## 🔐 Public Ledger vs Private Witness & `declose()`

In Midnight's Compact smart contracts:

- **Private Witness:** Data that remains completely encrypted and local to the user's client (e.g., secret keys, private votes, sensitive user data). It is used to generate Zero-Knowledge Proofs without exposing the actual data to the blockchain.
- **Public Ledger:** State variables stored on the blockchain that are visible to everyone (e.g., total supply, contract owners, public counters).
- **`declose()` Function:** Used intentionally to reveal specific private variables or computed results to the public ledger when necessary, converting private context into a publicly verifiable state transition.

---

## 🔌 Midnight Wallet Connection

### Previous Review Feedback Addressed ✅

**Previous feedback:**

> Please implement Connect Wallet feature.

This feedback has now been addressed.

The project includes a functional Midnight wallet connection implemented with
the Midnight DApp Connector API.

The DApp can:

- Detect an installed Midnight-compatible wallet
- Request wallet authorization
- Connect to the Midnight **Preprod** network
- Display the connected wallet status
- Display the connected unshielded public address
- Disconnect the wallet from the DApp interface

Wallet discovery is performed dynamically through `window.midnight`.

The application does not request the user's private key or seed phrase.

## 🛠️ Setup & Local Execution Instructions

Follow these steps to run the project locally on your machine:

### Prerequisites

- Node.js v22
- Docker & Docker Compose
- Compact Compiler (`compactc`)
- Midnight Proof Server

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/mustafaColak0/midnight-project-v1.git
   cd midnight-project-v1
   ```

2. **Install Dependencies:**

   ```bash
   npm install --force
   ```

3. **Build Compact circuits:**

   ```bash
   npm run build
   ```

4. **Run tests:**

   ```bash
   npm test
   ```

5. **Deploy to Preview/Pre-production:**

   ```bash
   npm run deploy
   ```

6. **Wallet Integration :**
=======

## 🔌 Midnight Wallet Connection

### Previous Review Feedback Addressed ✅

**Previous feedback:**

> Please implement Connect Wallet feature.

This feedback has now been addressed.

The project includes a functional Midnight wallet connection implemented with
the Midnight DApp Connector API.

The DApp can:

- Detect an installed Midnight-compatible wallet
- Request wallet authorization
- Connect to the Midnight **Preprod** network
- Display the connected wallet status
- Display the connected unshielded public address
- Disconnect the wallet from the DApp interface

Wallet discovery is performed dynamically through `window.midnight`.

The application does not request the user's private key or seed phrase.

## 🛠️ Setup & Local Execution Instructions

Follow these steps to run the project locally on your machine:

### Prerequisites

- Node.js v22
- Docker & Docker Compose
- Compact Compiler (`compactc`)
- Midnight Proof Server

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/mustafaColak0/midnight-project-v1.git
   cd midnight-project-v1
   ```

2. **Install Dependencies:**

   ```bash
   npm install --force
   ```

3. **Build Compact circuits:**

   ```bash
   npm run build
   ```

4. **Run tests:**

   ```bash
   npm test
   ```

5. **Deploy to Preview/Pre-production:**

   ```bash
   npm run deploy
   ```
7. **Wallet Integration :**
>>>>>>> 24aec324f1bc744d92ced05b6635c581bf135b5f

   ```bash
   @midnight-ntwrk/dapp-connector-api
   ```

📸 Proof of Completion (Screenshots)

1. Successful Compilation Output (Circuits Generated)
<<<<<<< HEAD
   <img width="750" height="307" alt="build-circuits" src="https://github.com/user-attachments/assets/341f7e84-187d-4205-a478-0cb4aa5880ab" />

2. Contract Deployed with Visible Address
   <img width="1168" height="621" alt="midnight-success" src="https://github.com/user-attachments/assets/11a6d3eb-3f01-4a15-b930-800be09ab8b9" />

3. Wallet Connection
   <img width="1052" height="786" alt="wallet_success" src="https://github.com/user-attachments/assets/c07c6988-91f9-45cd-b446-c351f3e878bb" />
=======
<img width="750" height="307" alt="build-circuits" src="https://github.com/user-attachments/assets/341f7e84-187d-4205-a478-0cb4aa5880ab" />


2. Contract Deployed with Visible Address
<img width="1168" height="621" alt="midnight-success" src="https://github.com/user-attachments/assets/11a6d3eb-3f01-4a15-b930-800be09ab8b9" />

3. Wallet Connection
<img width="1052" height="786" alt="wallet_success" src="https://github.com/user-attachments/assets/c07c6988-91f9-45cd-b446-c351f3e878bb" />




>>>>>>> 24aec324f1bc744d92ced05b6635c581bf135b5f
