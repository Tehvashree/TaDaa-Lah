# **Tadaa-Lah**

**Tadaa-Lah** is a decentralized ticketing platform built on the Sui blockchain. It enables secure ticket minting, listing, resale, and buyer protection using smart contracts and dynamic QR codes.

The platform consists of the following modules:

- **Profile & Seller Verification** — Users can verify themselves as trusted sellers  
- **Event Listing & Ticket Selling** — Users can create and manage events, list tickets for sale, and set prices  
- **Ticket QR Code System** — Buyers receive a unique, scannable QR code to enter events  
- **Wallet Integration** — Connect and manage crypto wallet directly in the app  

---

## **Installation**

Make sure you have **Node.js** installed, then install the required dependencies.

Navigate to the frontend folder:

**cd frontend**


Install dependencies:

**npm install**

Running the App

To start the development server:

**npm run dev**

Open your browser and visit:

**http://localhost:5173 (or the URL shown in your terminal)**

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


---

## **After launching the app:**

**1. Seller Verification**
   
•	Go to your Profile page

•	Click Verify Seller

•	Complete the verification process (on-chain transaction)

•	Once verified, your profile displays a Verified Seller badge


**2. Selling Tickets**
   
•	Go to the Sell Ticket page

•	Fill in event details and ticket price

•	Submit and sign the transaction with your wallet


**3. Buying Tickets**
   
•	Browse available events

•	Select an event and purchase tickets via wallet payment

•	Receive your ticket as a QR Code


**4. QR Ticket Screen**
   
•	The ticket screen shows a unique QR code linked to their purchase

•	Event staff can scan this QR code using any external scanner or ticket verification system 

•	The QR code contains all necessary details for verifying ownership and validity

---

## **Features**

•  **On-Chain Seller Verification** – Protects buyers by ensuring sellers are legitimate

•	**Decentralized Ticket Managemen**t – Tickets are stored securely on the blockchain

•	**QR Code Verification** – Prevents duplicate or fake tickets

•	**Wallet-Based Payments** – Secure and trustless transactions

---

## **Tech Stack**

•	**Frontend**: React

•	**Blockchain**: Sui Move Smart Contracts

•	**Wallet**: Sui Wallet Integration

•	**UI**: Figma

---

## **How to Use**

1.	Log in with Google (zkLogin)
   
2.	Connect your SUI wallet
    
3.	Verify yourself as a seller
   
4.	Create or browse events
   
5.	Buy/Sell tickets securely
    
6.	Show QR codes at the event gate

---

## **Security & Anti-Fraud Measures**

•	Blockchain-based seller verification

•	Unique non-duplicable ticket IDs

•	On-chain transaction

•	Real-time QR code validation
