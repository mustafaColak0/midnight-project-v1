# 🌓 Midnight Level 3 — First Quarter

## Private Eligibility Gate — Privacy-Preserving Zero-Knowledge DApp

This repository contains my **Level 3 — First Quarter** submission for the Midnight Network development track.

The project demonstrates a production-oriented privacy-preserving eligibility verification DApp built with Midnight. A user can prove that a private value satisfies an eligibility threshold without intentionally revealing the underlying value on the public ledger.

The Level 3 implementation extends the previous Preprod DApp with automated testing, CI/CD, an explicit privacy model, and a real-world **Private Eligibility Gate** use case.

The project demonstrates a frontend application connected to a deployed Compact smart contract on **Midnight Preprod**, wallet integration through the **Midnight DApp Connector API**, and a successful Zero-Knowledge circuit execution where a private value can be verified without revealing the value itself on the public ledger.

---

## 🌐 Live Demo

**Live Application:**  
[Midnight Private Eligibility Gate](https://midnight-privacy-voting.vercel.app/)

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

## 💡 Project Idea — Private Eligibility Gate

The Level 3 product idea is a **Private Eligibility Gate** built on Midnight.

Many applications need to determine whether a user satisfies an eligibility requirement without needing to know the user's exact private value. Examples include age-gated services, membership requirements, access-control systems, and privacy-preserving qualification checks.

In this DApp, the user provides a private value locally and the Compact circuit verifies whether:

```text
secretValue >= 18
```

The underlying secretValue is not intentionally published as public contract state.

Instead, the application exposes the successful verification result:

thresholdProofVerified = true

This allows the DApp to answer the question:

"Does the user satisfy the required eligibility threshold?"

without requiring the application to publicly disclose the exact private value used to produce the proof.

Product Goal

The goal is to demonstrate how Midnight Zero-Knowledge technology can support real-world eligibility verification while minimizing unnecessary disclosure of private information.

---

## 🔐 Level 3 Privacy Model

The privacy model of the Private Eligibility Gate separates the user's private input from the information intentionally exposed through the application's public contract state.

### What an Observer CAN Learn

An observer can learn:

- That an eligibility proof was successfully submitted.
- That the required eligibility condition was satisfied.
- The public verification result: `thresholdProofVerified = true`.
- Public transaction metadata and contract information exposed by Midnight Preprod.

### What an Observer CANNOT Learn From the Application's Intended Public State

An observer cannot learn the exact private `secretValue` merely from the application's intended public contract state.

For example, if a user provides:

```text
25
```

the circuit proves:

```text
secretValue >= 18
```

without publishing `25` as public contract state.

The observable result is:

```text
thresholdProofVerified = true
```

without intentionally publishing 25 as public contract state.

The privacy boundary is:

Therefore:

```text
Private secret value
        │
        ▼
Compact Zero-Knowledge Circuit
        │
        ├── Exact value remains private
        │
        ▼
Public eligibility result
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

The Level 3 frontend includes:

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
- Private Eligibility Gate validation
- Eligibility threshold verification
- Automated Vitest test suite
- GitHub Actions CI/CD
- Automated production build validation
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
│   │   │   ├── eligibility.ts
│   │   │   ├── eligibility.test.ts
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
│
├── .github/
│   └── workflows/
│       └── ci.yaml
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

## 🧪 Automated Tests

Level 3 introduces an automated test suite using **Vitest**.

The eligibility test suite validates the application's private-value boundaries and eligibility threshold behavior.

Current result:

```text
Test Files  1 passed (1)
Tests       7 passed (7)
```

The test suite covers:

- Minimum supported private value (`0`)
- Maximum supported private value (`65535`)
- Rejection of values below the supported range
- Rejection of values above the supported range
- A value below the eligibility threshold (`17`)
- The exact eligibility threshold (`18`)
- A value above the eligibility threshold

Tests can be executed with:

```bash
cd frontend
npm test
```

### 📸 Test Evidence

<img width="745" height="442" alt="Midnight-Level-3-Eligibility-Gate-7-Tests-Passing" src="https://github.com/user-attachments/assets/cc121cc6-148e-4517-be23-fce9ff4ad520" />

**7/7 automated tests passing.**

---

## ⚙️ CI/CD

The repository uses **GitHub Actions** to automatically validate the frontend on pushes and pull requests targeting the `main` branch.

The CI workflow performs:

```text
Checkout repository
        ↓
Setup Node.js
        ↓
Install dependencies
        ↓
Run automated tests
        ↓
Build production application
```

The pipeline executes:

```bash
npm ci
npm test
npm run build
```

A successful CI run confirms that both the automated eligibility test suite and the production frontend build complete successfully.

**Workflow:**

```text
.github/workflows/ci.yaml
```

### 📸 CI/CD Evidence

<img width="1882" height="597" alt="Midnight-Level-3-CI-Passing" src="https://github.com/user-attachments/assets/2fdbd0a4-29cd-43d0-a51a-656816a20e90" />

**GitHub Actions — Test and Build succeeded.**

---

## 🎥 Level 3 Demo

The Level 3 demonstration will show the complete Private Eligibility Gate flow:

1. Open the Level 3 DApp.
2. Detect and connect a Midnight-compatible wallet on Preprod.
3. Display the deployed Preprod contract.
4. Enter a private eligibility value locally.
5. Execute `Generate Private Proof`.
6. Call the deployed Compact `proveThreshold` circuit.
7. Generate the Zero-Knowledge proof.
8. Submit the transaction.
9. Display `thresholdProofVerified = true`.
10. Demonstrate that the underlying private value is not intentionally published as public contract state.
11. Show the automated test suite passing.
12. Show the GitHub Actions CI workflow passing.

### Level 2 Demo Video

[Watch the Level 2 Demo Video](https://drive.google.com/file/d/107qt5FiF_Hee7QwmN7Yv5GzWbD1t2SiS/view)

## 📸 Previous Level 2 Evidence

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

## 📸 Level 3 Proof of Completion

### 1. Automated Test Suite — 7 Tests Passing

<img width="745" height="442" alt="Midnight-Level-3-Eligibility-Gate-7-Tests-Passing" src="https://github.com/user-attachments/assets/e3f1d041-413d-492f-b5ab-8bb3832354bf" />


> Screenshot: `Midnight-Level-3-Eligibility-Gate-7-Tests-Passing.png`

### 2. GitHub Actions — Test and Build Passing

<img width="1882" height="597" alt="Midnight-Level-3-CI-Passing" src="https://github.com/user-attachments/assets/6c0a5721-a7cd-48ee-a3c5-3777cc425463" />


> Screenshot: `Midnight-Level-3-CI-Passing.png`

### 3. Private Eligibility Proof on Preprod

<!-- LEVEL-3-ELIGIBILITY-PROOF-SCREENSHOT -->

> Final Level 3 eligibility proof screenshot will be added here.

### 4. Successful Level 3 Preprod Transaction

<!-- LEVEL-3-PREPROD-TRANSACTION-SCREENSHOT -->

> Final Level 3 Preprod transaction screenshot will be added here.

---

## 📋 Level 3 Requirements

| Requirement | Implementation |
| --- | --- |
| Functional privacy-preserving DApp | ✅ Implemented |
| Private Eligibility Gate use case | ✅ Implemented |
| Deployed Compact contract on Preprod | ✅ Implemented |
| Wallet integration | ✅ Implemented |
| Zero-Knowledge circuit execution | ✅ Implemented |
| Minimum 3 automated tests | ✅ 7 tests passing |
| Automated CI/CD pipeline | ✅ GitHub Actions |
| Production build validation | ✅ Passing |
| Explicit privacy model | ✅ Documented |
| Observer CAN / CANNOT learn analysis | ✅ Documented |
| Public GitHub repository | ✅ Available |
| Live frontend deployment | ✅ Available |
| Level 3 test evidence | ✅ Captured |
| Passing CI evidence | ✅ Captured |
| Level 3 demo video | ⏳ To be added |
| Product proposal | ⏳ Submission / approval step |
| Minimum 10 meaningful commits | ✅ See Git history |

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

## 🌓 Level 3 — First Quarter

Level 3 evolves the previous Midnight DApp into a more production-oriented **Private Eligibility Gate**.

The previous implementation established wallet connectivity, Midnight.js providers, Preprod contract interaction, and Zero-Knowledge proof execution.

Level 3 adds:

```text
Private Eligibility Gate
        +
Zero-Knowledge Threshold Proof
        +
Input Validation
        +
7 Automated Tests
        +
GitHub Actions CI/CD
        +
Production Build Validation
        +
Explicit Privacy Model
        =
Level 3 Production-Oriented Midnight DApp
```

The result is a privacy-preserving application that demonstrates how an eligibility condition can be verified without intentionally exposing the underlying private value as public application state.

---

## 👨‍💻 Author

**Mustafa Çolak**

GitHub:  
https://github.com/mustafaColak0

---

## 📜 License

This project is developed as part of the Midnight Network developer track and is intended for educational and development purposes.
