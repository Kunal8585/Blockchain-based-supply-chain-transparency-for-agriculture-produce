# AgriChain: Blockchain-Based Agricultural Supply Chain Transparency System

AgriChain is a decentralized, hybrid full-stack application designed to eliminate information asymmetry and enhance traceability in the agricultural supply chain. By substituting traditional centralized record-keeping with an immutable Ethereum ledger, the platform establishes a secure, tamper-proof audit trail from the primary harvest to final retail distribution.



## 🚀 Core Features
* **Physical+Digital Integration:** Synchronizes real-time crop logistics with unique batch identifiers using dynamic QR code generation.
* **Cryptographic Data Integrity:** Secures all provenance logs (Origin, Timestamps, and Custody updates) via the SHA-256 algorithm.
* **Granular Role-Based Access Control (RBAC):** Implements dual-verification utilizing Spring Security for UI enforcement and Solidity modifiers for on-chain transaction authorization.
* **Automated Geographical Migration:** Automatically fetches and stamps authorized Shipment Hub coordinates during state transitions to prevent manual tracking errors.
* **Identity-Linked Feedback System:** A verified consumer review portal restricted exclusively to users who have validated a legitimate Batch ID against the blockchain.

## 🏗️ System Architecture
The platform utilizes a robust Three-Tier Hybrid Architecture:
1. **Presentation Layer (Frontend):** Built with React.js and the Context API to manage traditional authentication alongside Web3 provider state.
2. **Application Layer (Backend):** Powered by Java Spring Boot, orchestrating RESTful APIs, business operations, and strict CORS/CSRF security policies.
3. **Data Layer (Dual Storage):** * **Off-Chain:** MySQL / MongoDB for high-frequency user profile records and structural metadata.
   * **On-Chain:** Ganache local Ethereum network executing Solidity Smart Contracts for immutable asset ledger transitions.

---

## 🛠️ Tech Stack
* **Frontend:** React.js, Web3.js / Ethers.js, HTML5/CSS3
* **Backend:** Java Spring Boot (Maven) / Node.js
* **Blockchain:** Solidity, Ganache (Chain ID `1337`), MetaMask
* **Database:** MySQL / MongoDB
* **Security:** SHA-256 Encryption, Spring Security JWT

---

## 💻 Getting Started

### Prerequisites
* Node.js (v16.x or higher)
* Java JDK 17+ (If running Spring Boot backend)
* Ganache (CLI or GUI interface)
* MetaMask Extension configured in your browser

### Installation & Local Setup

#### 1. Smart Contract Deployment
```bash
# Clone the repository
git clone [https://github.com/your-username/AgriChain.git](https://github.com/your-username/AgriChain.git)
cd AgriChain/blockchain

# Install dependencies and compile contracts
npm install
npx hardhat compile

# Start your Ganache instance on HTTP://127.0.0.1:7545
# Deploy the contracts locally
npx hardhat run scripts/deploy.js --network localhost
