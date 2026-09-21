# 🌒 Midnight Level 2 — Waxing Crescent

## Privacy-Preserving Zero-Knowledge DApp

This repository contains my **Level 2 — Waxing Crescent** submission for the Midnight Network development track.

The project demonstrates a frontend application connected to a deployed Compact smart contract on **Midnight Preprod**, wallet integration through the **Midnight DApp Connector API**, and a successful Zero-Knowledge circuit execution where a private value can be verified without revealing the value itself on the public ledger.

---

## 🌐 Live Demo

**Live Application:**  
[Midnight Privacy Voting](https://midnight-privacy-voting.vercel.app/)

> The application is configured for the Midnight **Preprod** network.

---

## 🌐 Preprod Deployment

**Network:** Midnight Preprod

**Contract Address:**

```text
82265fe547d93fda1dcc12c31f9ccc2a5b3a421c8cd3f1fbc072bad332b8192a
```

The frontend connects to this deployed Compact contract and calls its circuit using the Midnight.js SDK.

---

## 💡 Project Idea

The long-term goal of this project is to build a **privacy-preserving voting system** on Midnight.

Traditional voting applications may expose information that can be associated with individual users. Midnight's Zero-Knowledge architecture makes it possible to verify statements about private information without publishing the underlying information itself.

In the current Level 2 implementation, the application demonstrates this principle with a private threshold proof.

A user provides a secret value locally and the Compact circuit verifies whether:

```text
secretValue >= 18
```

The private value itself is not displayed on the public ledger.

Only the result of the proof becomes observable:

```text
thresholdProofVerified = true
```

This provides the privacy primitive that can later be extended into private voting logic.

---

## 🔐 Privacy Claim

The main privacy behavior demonstrated by this DApp is:

> A user can prove that a private value satisfies a condition without revealing the original value on-chain.

For example, if the user enters:

```text
25
```

the circuit proves:

```text
25 >= 18
```

without publishing `25` as public contract state.

The observable result is:

```text
thresholdProofVerified = true
```

Therefore:

```text
Private Input
     │
     ▼
Compact Circuit
     │
     ▼
Zero-Knowledge Proof
     │
     ├── Secret value remains private
     │
     └── Verification result becomes observable
```

This demonstrates the separation between **private witness data** and **publicly verifiable state** provided by Midnight.

---

## 🧠 Private Witness vs Public Ledger

### Private Witness

Private witness data remains on the client side and can be used as private input during Zero-Knowledge proof generation.

In this project, the secret threshold value is treated as private information and is not intentionally published as public ledger state.

### Public Ledger

The public ledger contains the state required for publicly verifiable execution.

The DApp exposes the result of the threshold verification rather than the original secret value.

This allows the application to prove a statement about private information without disclosing that information.

---

## 🔌 Wallet Integration

Wallet integration is implemented using the:

```text
@midnight-ntwrk/dapp-connector-api
```

The application dynamically discovers compatible Midnight wallets through:

```javascript
window.midnight;
```

The DApp supports wallet discovery instead of depending on a hard-coded wallet instance.

### Lace Wallet

The application implements **Lace wallet connection and disconnection on Midnight Preprod**.

The DApp can:

- Detect Lace through the Midnight DApp Connector API
- Request wallet authorization
- Connect Lace to the Midnight Preprod network
- Read the wallet connection status
- Display the connected unshielded public address
- Disconnect Lace from the DApp interface

The application never requests or handles the user's seed phrase or private keys.

### 1AM Wallet

The DApp also supports the **1AM Midnight wallet** through the same wallet discovery architecture.

1AM was used to demonstrate the successful Preprod circuit transaction during development.

This demonstrates that the wallet integration layer is compatible with multiple wallets exposed through the Midnight DApp Connector API.

---

## ⚠️ Lace Preprod Development Note

During development, Lace successfully connected to the DApp on the **Preprod** network and the connect/disconnect functionality was implemented.

However, the installed Lace environment encountered a wallet-side Preprod synchronization / transaction-balancing issue during transaction execution.

The DApp therefore used **1AM** to demonstrate the successful circuit transaction while retaining the required Lace Preprod connect/disconnect implementation.

This behavior is documented transparently because the application itself successfully reaches the deployed contract and constructs the transaction before handing wallet-specific operations to the connected wallet.

---

## 🧩 Circuit Execution

The frontend connects to the deployed Preprod contract and executes the private threshold circuit.

The execution flow is:

```text
React Frontend
      │
      ▼
Midnight DApp Connector
      │
      ▼
Midnight.js Providers
      │
      ▼
Deployed Compact Contract
      │
      ▼
proveThreshold(secretValue)
      │
      ▼
Zero-Knowledge Proof
      │
      ▼
Transaction Balancing
      │
      ▼
Transaction Submission
      │
      ▼
Midnight Preprod
```

A successful execution produces a verified result in the UI:

```text
Private threshold proof verified on Preprod.

Public result:
thresholdProofVerified = true

The secret value was not disclosed to the public ledger.
```

---

## ✅ Successful Preprod Transaction

A successful Zero-Knowledge circuit execution was submitted to Midnight Preprod during testing.

Example transaction identifier:

```text
00da1669c44d65cecc13d3559a8e2dd3e526551f17c7ffe8efc9f0b55016709db1
```

The transaction was:

```text
Circuit generated
      ↓
Proof generated
      ↓
Transaction balanced
      ↓
Transaction submitted
      ↓
Accepted by wallet
      ↓
Verified on Preprod
```

---

## 🖥️ Frontend Features

The Level 2 frontend includes:

- Midnight-compatible wallet discovery
- Lace wallet connection
- Lace wallet disconnection
- 1AM wallet support
- Preprod network validation
- Connected wallet identity
- Unshielded public address display
- Deployed contract address display
- Private secret input
- Compact circuit invocation
- Zero-Knowledge proof generation
- Transaction submission
- Public verification result
- Privacy status visualization

---

## 🛠️ Technology Stack

### Smart Contract

- Midnight Compact
- Zero-Knowledge circuits
- Midnight Preprod

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Midnight Integration

- Midnight.js SDK
- Midnight DApp Connector API
- Midnight Indexer
- Midnight Proof Server
- Compact runtime

### Wallets

- Lace
- 1AM

---

## 📁 Project Architecture

```text
midnight-project-v1/
│
├── frontend/
│   ├── src/
│   │   ├── generated/
│   │   │   └── hello-world/
│   │   │
│   │   ├── midnight/
│   │   │   ├── contract.ts
│   │   │   ├── providers.ts
│   │   │   └── walletAdapter.ts
│   │   │
│   │   ├── App.tsx
│   │   └── selectWallet.ts
│   │
│   └── vite.config.ts
│
├── contract/
│   └── Compact contract source
│
└── README.md
```

> The exact generated files may vary depending on the Compact compiler version.

---

## 🚀 Local Development

### Prerequisites

Install:

- Node.js
- npm
- Compact compiler
- Midnight-compatible wallet
- Midnight Proof Server

The application must use the **Preprod** network.

---

### 1. **Clone the Repository:**

```bash
git clone https://github.com/mustafaColak0/midnight-project-v1.git
cd midnight-project-v1
```

### 2. Install Dependencies

Install the project dependencies according to the repository package configuration.

```bash
npm install
```

If the frontend is maintained in a separate directory:

```bash
cd frontend
npm install
```

---

### 3. Build the Compact Contract

Build the Compact contract and generated artifacts using the project's configured build command.

```bash
npm run build
```

---

### 4. Start the Proof Server

A compatible Midnight Proof Server must be available to the frontend.

During development, the proof provider can be configured through:

```env
VITE_PROOF_SERVER_URL=http://127.0.0.1:6302
```

The exact URL may differ depending on the local development environment.

---

### 5. Start the Frontend

```bash
cd frontend
npm run dev
```

Open the local Vite URL displayed in the terminal.

---

## 🔄 Wallet Connection Flow

```text
Open DApp
   ↓
Detect window.midnight
   ↓
Select Midnight-compatible wallet
   ↓
Request Preprod connection
   ↓
Verify network
   ↓
Read public wallet address
   ↓
Create Midnight providers
   ↓
Interact with deployed contract
```

Wallet private keys and recovery phrases are never requested by the DApp.

---

## 🎥 Level 2 Demo

The demonstration video shows:

1. The frontend running with the deployed Preprod contract
2. Lace detected by the DApp
3. Lace connected to Midnight Preprod
4. Lace disconnected from the frontend
5. A Midnight-compatible transaction wallet connected
6. A private secret value entered locally
7. `Generate Private Proof` executed
8. The Compact circuit called from the frontend
9. The transaction submitted to Midnight Preprod
10. `thresholdProofVerified = true`
11. The private value remaining undisclosed

## 🎥 Demo Video

[Watch the Level 2 Demo Video](https://drive.google.com/file/d/107qt5FiF_Hee7QwmN7Yv5GzWbD1t2SiS/view)

📸 Proof of Completion (Screenshots)

1. Successful Compilation Output (Circuits Generated)
   <img width="750" height="307" alt="build-circuits" src="https://github.com/user-attachments/assets/341f7e84-187d-4205-a478-0cb4aa5880ab" />

2. Contract Deployed with Visible Address
   <img width="1168" height="621" alt="midnight-success" src="https://github.com/user-attachments/assets/11a6d3eb-3f01-4a15-b930-800be09ab8b9" />

3. Midnight Wallet Connected on Preprod
   <img width="1217" height="701" alt="wallet-connected-preprod" src="https://github.com/user-attachments/assets/c3df6ba7-cabe-47b4-8e2c-fcdaff75ab4f" />


4. Successful Zero-Knowledge Proof on Preprod
   <img width="1917" height="877" alt="zk-proof-success-preprod" src="https://github.com/user-attachments/assets/f4030917-3ce6-4718-8448-cc67be359372" />

5. Successful Preprod Transaction — Midnight Explorer
  <img width="1917" height="900" alt="midnight-preprod-successful-transaction" src="https://github.com/user-attachments/assets/3677604f-bca7-437b-a674-6a6f9b0f7a8d" />


---

## 📋 Level 2 Requirements

| Requirement                       | Implementation      |
| --------------------------------- | ------------------- |
| Contract wired to frontend UI     | ✅ Implemented      |
| Lace wallet connection on Preprod | ✅ Implemented      |
| Lace wallet disconnection         | ✅ Implemented      |
| Circuit called from frontend      | ✅ Implemented      |
| Observable privacy behavior       | ✅ Implemented      |
| Contract deployed to Preprod      | ✅ Implemented      |
| Verifiable contract address       | ✅ Included         |
| Public GitHub repository          | ✅ Repository       |
| README privacy documentation      | ✅ Included         |
| Live demo                         | 🔗 See Live Demo    |
| Demo video                        | 🔗 See Level 2 Demo |
| Minimum 8 meaningful commits      | ✅ See Git history  |

---

## 🔒 Security & Privacy

The application:

- Does not request wallet seed phrases
- Does not request wallet private keys
- Uses wallet authorization through the Midnight DApp Connector API
- Keeps the secret circuit input private
- Publishes only the information required for verification
- Uses the Midnight Preprod network for development and testing

---

## 🌒 Level 2 — Waxing Crescent

This project advances the original Level 1 Compact contract into a functional Midnight DApp.

Level 1 established the contract and initial privacy architecture.

Level 2 adds:

```text
Compact Contract
       +
React Frontend
       +
Midnight.js
       +
DApp Connector
       +
Preprod Wallet
       +
Zero-Knowledge Circuit Execution
       =
Functional Midnight DApp
```

The result is a working frontend capable of interacting with a deployed Compact contract while demonstrating an observable privacy-preserving behavior.

---

## 👨‍💻 Author

**Mustafa Çolak**

GitHub:  
https://github.com/mustafaColak0

---

## 📜 License

This project is developed as part of the Midnight Network developer track and is intended for educational and development purposes.
