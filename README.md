# 🌙 Midnight Level 4 — Private DAO Decision Engine

## Privacy-Preserving Governance MVP on Midnight

This repository contains my **Level 4** submission for the Midnight Network development track.

The project introduces a **Private DAO Decision Engine**, a privacy-preserving governance MVP built on Midnight. It extends the previous Private Eligibility Gate into a governance flow where a user provides a private eligibility value and, after satisfying the required threshold, can participate in a DAO proposal through the deployed Compact contract.

The Level 4 Compact contract introduces two governance circuits:

- `voteYes(secretValue)`
- `voteNo(secretValue)`

Both circuits require the private eligibility condition:

```text
secretValue >= 18
```

The underlying secretValue is not intentionally stored as public contract state.
The current MVP records governance participation through public yesVotes, noVotes, and totalVotes counters. Because voteYes and voteNo are separate circuits, the selected vote direction should not be considered private in the current implementation.
Level 4 adds a new governance contract deployed on Midnight Preprod, generated Compact artifacts, governance frontend integration, automated validation tests, and production build verification.
Current privacy scope: eligibility input privacy is implemented. Private ballot direction and duplicate-vote prevention are not yet implemented and are documented as future extensions.

---

## 🌙 Product X Profile

Follow the development of Midnight Private DAO and the Private DAO Decision Engine on X:

**X:** https://x.com/PrivateDAOEngin

## 🎥 Level 4 Demo

The Level 4 demo demonstrates the Private DAO Decision Engine executing a real governance transaction on Midnight Preprod.

The demonstration includes:

- 1AM wallet connected to Midnight Preprod
- Private eligibility input
- Governance vote selection
- Zero-Knowledge proof generation
- Transaction balancing and submission
- Successful governance transaction confirmation on Preprod

[Watch the Level 4 Private DAO Decision Engine Demo](https://drive.google.com/file/d/1GzTcksh6h_LREnTiaKcHNRo2fr4YFryw/view)

> The current MVP provides privacy-preserving eligibility verification for governance participation. Vote direction is public through the selected governance circuit, and duplicate-vote prevention is not yet implemented.

---

## 🌐 Level 4 Preprod Contract

**Network:** Midnight Preprod

**Level 4 Governance Contract Address:**

```text
022d78119bca01fa590c08d0a0209bdbd1e1baef1e8fae6a49670e75ca8b3695
```

The frontend is configured to connect to this deployed Compact governance contract through the Midnight.js provider architecture.
The contract currently exposes two governance circuits:

```text
voteYes(secretValue)
voteNo(secretValue)
```

Both circuits enforce the private eligibility requirement before incrementing the corresponding public governance counters.

---

## 💡 Project Idea — Private DAO Decision Engine

The Level 4 product evolves the previous **Private Eligibility Gate** into a reusable privacy-preserving governance foundation.

Traditional governance systems may require participants to disclose information that is only needed to determine whether they are eligible to participate. The Private DAO Decision Engine explores how Midnight Zero-Knowledge technology can minimize that disclosure.

In the current MVP, a participant provides a private eligibility value:

```text
secretValue
```

The Compact governance circuit verifies:

```
secretValue >= 18
```

If the requirement is satisfied, the participant can invoke either:
voteYes(secretValue)

or:
voteNo(secretValue)

The exact private eligibility value is not intentionally written to the public contract state.

### Current Governance State

The contract maintains the following public state:

proposalActive
yesVotes
noVotes
totalVotes

This allows the MVP to demonstrate private eligibility verification combined with publicly verifiable governance counters.

### Long-Term Direction

The Private DAO Decision Engine is designed as a foundation for additional privacy-preserving governance primitives, including:

- Nullifier-based duplicate participation protection
- Credential-based governance eligibility
- Privacy-preserving quadratic governance
- Stronger ballot privacy
- Anonymous organizational governance and reporting workflows

  These capabilities are part of the project roadmap and are not claimed as implemented in the current Level 4 MVP.

---

## 🔐 Level 4 Privacy Model

The Level 4 privacy model separates the participant's private eligibility input from the governance information intentionally exposed through public contract state.

### What Remains Private

The participant provides:

```text
secretValue
```

as the eligibility input used by the Compact circuit.
The application does not intentionally store the exact secretValue in the public governance ledger state.
For example, if the participant provides:
21

the governance circuit evaluates:
21 >= 18

without intentionally storing 21 as a public governance state value.

### What Is Public

The current Level 4 contract intentionally maintains:
proposalActive
yesVotes
noVotes
totalVotes

These values are part of the public governance state.
The current implementation also uses separate voteYes and voteNo circuits. Therefore, vote direction is not treated as private in the current MVP.

### Current Privacy Boundary

Private eligibility value
│
▼
Compact governance circuit
│
├── Verify secretValue >= 18
│
├── Exact eligibility value is not intentionally stored
│
▼
Selected governance circuit
(voteYes / voteNo)
│
▼
Public governance counters
(yesVotes / noVotes / totalVotes)

### Current Limitations

The Level 4 MVP does not yet implement:

- Private ballot direction
- Nullifier-based duplicate-vote prevention
- One-person-one-vote identity guarantees
- Anonymous credential verification
- Quadratic voting
  These are planned extensions of the Private DAO Decision Engine rather than features claimed by the current implementation.
  This demonstrates the separation between **private witness data** and **publicly verifiable state** provided by Midnight.

---

## 🧠 Private Witness vs Public Governance State

### Private Input

The governance flow receives `secretValue` as the private eligibility input used by the Compact circuit.

The exact eligibility value is not intentionally written to the public governance state.

For example:

```text
secretValue = 21
```

The circuit can evaluate:
secretValue >= 18

without intentionally storing the exact value 21 in the public governance counters.

### Public Governance State

The Level 4 contract maintains publicly verifiable governance state:
proposalActive
yesVotes
noVotes
totalVotes

A successful governance transaction updates the corresponding public counters.
Because the current implementation exposes separate voteYes and voteNo circuits and public vote counters, the current MVP does not claim ballot-direction privacy.
This architecture demonstrates how private eligibility data can be separated from publicly verifiable governance state.

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

1AM is supported through the same Midnight DApp Connector architecture and is currently used during Level 4 Preprod governance testing.

This demonstrates that the wallet integration layer is compatible with multiple wallets exposed through the Midnight DApp Connector API.

---

## ⚠️ Lace Preprod Development Note

During development, Lace successfully connected to the DApp on the **Preprod** network and the connect/disconnect functionality was implemented.

However, the installed Lace environment encountered a wallet-side Preprod synchronization / transaction-balancing issue during transaction execution.

The Level 4 governance flow is therefore being tested primarily with **1AM**, while the existing Lace Preprod connect/disconnect integration remains available in the DApp.

This behavior is documented transparently because the application itself successfully reaches the deployed contract and constructs the transaction before handing wallet-specific operations to the connected wallet.

---

## 🧩 Level 4 Governance Execution Flow

The Level 4 frontend connects to the deployed governance contract on Midnight Preprod through the Midnight.js provider architecture.

The current governance flow is:

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
Level 4 Governance Contract
      │
      ▼
Private Eligibility Input
(secretValue)
      │
      ▼
Verify secretValue >= 18
      │
      ▼
Select Governance Circuit
      │
      ├── voteYes(secretValue)
      │
      └── voteNo(secretValue)
      │
      ▼
Zero-Knowledge Proof Generation
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

The eligibility value is used as private circuit input and is not intentionally stored in the public governance state.
The selected governance circuit updates the corresponding public vote counter together with totalVotes.
Privacy note: The current MVP protects the eligibility input from intentional public-state disclosure, but the selected vote direction is not considered private.

---

## ✅ Level 4 Successful Preprod Governance Transaction

The Level 4 Private DAO Decision Engine successfully executed a governance vote on the Midnight Preprod network using the deployed governance contract and the 1AM wallet.

The transaction completed the full governance flow:

```text
Private eligibility input
        ↓
Eligibility requirement verified
        ↓
Governance circuit executed
        ↓
Zero-Knowledge proof generated
        ↓
Transaction balanced
        ↓
Transaction submitted through 1AM
        ↓
Confirmed on Midnight Preprod
```

### DApp Transaction ID

```text
00df940bb0a831e2e103809e7ad9f367b548505cfa40d806c6811d53abb84707c2
```

**Submitted Vote:** YES  
**Network:** Midnight Preprod  
**Wallet:** 1AM  
**Contract Address:** `022d78119bca01fa590c08d0a0209bdbd1e1baef1e8fae6a49670e75ca8b3695`

The eligibility value was used as private circuit input and was not intentionally written to the public governance state. The current MVP does not claim ballot-direction privacy or duplicate-vote prevention.
---

### 📸 Governance Vote Confirmation
<img width="1916" height="897" alt="Midnight-Level-4-Governance-Vote-Preprod-Confirmed" src="https://github.com/user-attachments/assets/ebfeaaa3-7a06-4035-9908-407b93635034" />

### 📸 Midnight Explorer Confirmation
The submitted governance transaction was successfully included on Midnight Preprod and displayed as SUCCESS by the Midnight Explorer.
<img width="1377" height="847" alt="Midnight-Level-4-Governance-Transaction-Explorer-Success" src="https://github.com/user-attachments/assets/697668e9-e485-40d0-b085-11c89f532b7a" />


## 🖥️ Level 4 Frontend Features

The Level 4 Private DAO Decision Engine frontend includes:

- Midnight-compatible wallet discovery
- Lace wallet connection and disconnection
- 1AM wallet support
- Midnight Preprod network validation
- Connected wallet identity display
- Unshielded public address display
- Level 4 governance contract address display
- Private eligibility input
- YES / NO governance vote selection
- `voteYes` Compact circuit integration
- `voteNo` Compact circuit integration
- Zero-Knowledge proof generation flow
- Transaction balancing and submission flow
- Eligibility threshold validation
- Explicit governance privacy model
- Automated Vitest validation suite
- GitHub Actions CI/CD
- Production build validation

The frontend also explicitly documents that ballot-direction privacy and duplicate-vote prevention are not implemented in the current MVP.

---

## 🔨 Level 4 Compact Contract Compilation

The Level 4 governance contract introduces the `voteYes` and `voteNo` circuits for the Private DAO Decision Engine.

Both governance circuits were successfully compiled with the Midnight Compact compiler.

### 📸 Compilation Evidence

<img width="1087" height="291" alt="Midnight-Level-4-Governance-Contract-Compile-Success" src="https://github.com/user-attachments/assets/82082735-ce0d-4112-aa05-f30e16c034b5" />

## 🌐 Level 4 Preprod Deployment

The compiled governance contract was successfully deployed to the Midnight Preprod network.

**Network:** Midnight Preprod

**Contract Address:**

```text
022d78119bca01fa590c08d0a0209bdbd1e1baef1e8fae6a49670e75ca8b3695
```

### 📸 Preprod Deployment Evidence

<img width="1350" height="787" alt="Midnight-Level-4-Governance-Contract-Preprod-Deployment" src="https://github.com/user-attachments/assets/7812101b-147d-4667-992a-65a7f1507151" />

## 👛 Level 4 Preprod Wallet Setup

A dedicated development wallet was synchronized with the Midnight Preprod network before funding and contract deployment.

### 📸 Wallet Synchronization Evidence

<img width="590" height="597" alt="Midnight-Level-4-Preprod-Wallet-Sync-Completed" src="https://github.com/user-attachments/assets/fb04b7f3-1d3f-49fb-81b4-eac2166e7d24" />

### 📸 Preprod Faucet Funding

The development wallet was funded with 5,000 tNIGHT from the Midnight Preprod faucet for contract deployment and testing.

<img width="842" height="762" alt="Midnight-Level-4-Preprod-Wallet-Funded-5000-tNight" src="https://github.com/user-attachments/assets/d957b1e7-4a8f-4439-be28-6e4f7c9ff392" />

### 📸 Funded Wallet Verification

After funding, the development wallet balance was verified on Midnight Preprod before the governance contract deployment.

<img width="1290" height="552" alt="Midnight-Level-4-Preprod-Wallet-Funded-and-Synced" src="https://github.com/user-attachments/assets/346b38cf-1a49-4102-8f05-23737c50c0b7" />

## 🧪 Level 4 Automated Tests

The Level 4 frontend validation suite verifies the supported private input range and the eligibility threshold behavior used by the governance flow.

The automated test suite contains seven tests covering:

- Minimum supported private value (`0`)
- Maximum supported private value (`65535`)
- Values below the supported range
- Values above the supported range
- A value below the eligibility threshold (`17`)
- The exact eligibility threshold (`18`)
- A value above the eligibility threshold

Current result:

```text
Test Files  1 passed (1)
Tests       7 passed (7)
```

### 📸 Automated Test Evidence

<img width="821" height="495" alt="Midnight-Level-4-Frontend-Tests-Passed" src="https://github.com/user-attachments/assets/0ccf536d-58a6-4ba9-aa77-eba33da6b5d9" />

## 🏗️ Level 4 Production Build

The Level 4 frontend successfully completes the production build process.

The production build validates that the React application, generated Compact bindings, Midnight providers, and governance integration can be bundled for deployment.

```bash
cd frontend
npm run build
```

### 📸 Production Build Evidence

<img width="910" height="726" alt="Midnight-Level-4-Frontend-Build-Success" src="https://github.com/user-attachments/assets/c5d63f58-6310-4a78-8bef-29f3fac7788f" />

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
├── demo-1/
│   └── contracts/
│       └── hello-world.compact
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
### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

### 3. Build the Compact Contract

Compile the Compact contract and generate the required contract artifacts:

```bash
cd demo-1
npm install
npm run compile
cd ..
```

> The current Compact compilation workflow is intended for a Unix-like environment such as GitHub Codespaces, with the Midnight Compact compiler installed and available on `PATH`.

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

### Level 3 Demo Video

[Watch the Level 3 Private Eligibility Gate Demo](https://drive.google.com/file/d/1eMzh6c98uPoV2iIJFWOvYzvleX3jMYiT/view)

> The demo shows the complete Level 3 flow on Midnight Preprod, including 1AM wallet connection, private eligibility input, Zero-Knowledge proof generation, transaction submission, and successful threshold verification.

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

<img width="1912" height="915" alt="Midnight-Level-3-Private-Eligibility-Proof-Preprod" src="https://github.com/user-attachments/assets/e7a1025b-18d9-422e-978c-cc7d37bff6fc" />

> The Private Eligibility Gate successfully verified the threshold proof on Midnight Preprod using 1AM. The public result was `thresholdProofVerified = true`, while the underlying secret value was not intentionally disclosed as public contract state.

### 4. Successful Level 3 Preprod Transaction

<img width="1917" height="927" alt="Midnight-Level-3-Preprod-Transaction-Confirmed" src="https://github.com/user-attachments/assets/232a8cb8-88d5-4732-ba13-38c8dd14b9f5" />

> The Level 3 eligibility proof transaction was successfully submitted and confirmed on Midnight Preprod.

---

## 📋 Level 3 Requirements

| Requirement                          | Implementation                |
| ------------------------------------ | ----------------------------- |
| Functional privacy-preserving DApp   | ✅ Implemented                |
| Private Eligibility Gate use case    | ✅ Implemented                |
| Deployed Compact contract on Preprod | ✅ Implemented                |
| Wallet integration                   | ✅ Implemented                |
| Zero-Knowledge circuit execution     | ✅ Implemented                |
| Minimum 3 automated tests            | ✅ 7 tests passing            |
| Automated CI/CD pipeline             | ✅ GitHub Actions             |
| Production build validation          | ✅ Passing                    |
| Explicit privacy model               | ✅ Documented                 |
| Observer CAN / CANNOT learn analysis | ✅ Documented                 |
| Public GitHub repository             | ✅ Available                  |
| Live frontend deployment             | ✅ Available                  |
| Level 3 test evidence                | ✅ Captured                   |
| Passing CI evidence                  | ✅ Captured                   |
| Level 3 demo video                   | ✅ Available                  |
| Product proposal                     | ⏳ Submission / approval step |
| Minimum 10 meaningful commits        | ✅ See Git history            |

---

## 🔒 Security & Privacy

The application:

- Does not request wallet seed phrases
- Does not request wallet private keys
- Uses wallet authorization through the Midnight DApp Connector API
- Uses the eligibility value as private circuit input and does not intentionally store the exact value in public governance state
- Documents the public governance state and current privacy limitations explicitly
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
