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

📸 Proof of Completion (Screenshots)

1. Successful Compilation Output (Circuits Generated)
   <img width="750" height="307" alt="build-circuits" src="https://github.com/user-attachments/assets/e0a16af3-5de3-497d-835a-a38d120075f5" />

2. Contract Deployed with Visible Address
   <img width="1168" height="621" alt="midnight-success" src="https://github.com/user-attachments/assets/60de336d-4a7a-4271-b798-7ccbd2f11eca" />
