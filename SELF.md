# Self Protocol Integration Guide

Complete guide for integrating Self Protocol identity verification to gate token minting. This workshop shows how to require users to prove they are a real person and over 18 years old before they can mint tokens.

> 💡 **Prerequisites**: This workshop assumes you've already completed the previous integrations (Celo deployment, contract setup, etc.). If you haven't, please complete those first.

## 📋 Table of Contents

- [Overview](#overview)
- [What We'll Build](#what-well-build)
- [Prerequisites](#prerequisites)
- [Step 1: Install Self Protocol Packages](#step-1-install-self-protocol-packages)
- [Step 2: Set Up Environment Variables](#step-2-set-up-environment-variables)
- [Step 3: Create Self Protocol Verification Page](#step-3-create-self-protocol-verification-page)
- [Step 4: Create Verification Components](#step-4-create-verification-components)
- [Step 5: Gate Minting Behind Verification](#step-5-gate-minting-behind-verification)
- [Step 6: Test the Integration](#step-6-test-the-integration)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

## 📖 Overview

This integration adds:

- **Self Protocol identity verification** - Users must verify their identity before minting
- **On-chain verification checks** - Verification status stored and checked on-chain
- **Proof requirements** - Users must prove:
  - They are a real person (identity proof)
  - They are over 18 years old (age proof)
- **Gated minting** - Mint function requires verification
- **Verification page** - Dedicated UI for identity verification flow

**Time:** 45-60 minutes

## 🎯 What We'll Build

1. **Verification Page** (`/self`) - Where users verify their identity
2. **Verification Components** - QR code display, status tracking
3. **On-chain Verification Registry** - Smart contract to store verification status
4. **Gated Mint Function** - Modified mint component that checks verification
5. **Verification Status Display** - Show verification status throughout the app

## ✅ Prerequisites

- ✅ BuenoToken contract already deployed on Celo Sepolia
- ✅ Frontend already set up and working
- ✅ Contract interaction page (`/contract`) already functional
- ✅ Self Protocol account (get app name and scope from [Self Protocol](https://self.xyz))

## 📦 Step 1: Install Self Protocol Packages

Navigate to the Next.js package and install Self Protocol dependencies:

```bash
cd packages/nextjs
npm install @selfxyz/qrcode @selfxyz/core ethers
```

Or from the root:

```bash
npm install @selfxyz/qrcode @selfxyz/core ethers --workspace=packages/nextjs
```

## 🔧 Step 2: Set Up Environment Variables

Add Self Protocol configuration to your `.env.local` file in `packages/nextjs/`:

```bash
# ============================================
# Self Protocol Configuration
# ============================================
NEXT_PUBLIC_SELF_APP_NAME=ZeroToDapp
NEXT_PUBLIC_SELF_ENDPOINT=0x22bc4604d67b4e3e15e3e30cc5449de02dbd8192
NEXT_PUBLIC_SELF_SCOPE_SEED=zero2dapp-verification
```

**Getting Your Self Protocol Credentials:**

1. Visit [Self Protocol](https://self.xyz)
2. Create an account or sign in
3. Create a new app
4. Copy your app name and scope
5. Add them to your `.env.local` file

## 📄 Step 3: Create Self Protocol Verification Page

Create the main verification page at `packages/nextjs/app/self/page.tsx`:

```typescript
import { SelfVerification } from "./components/SelfVerification";

export default function SelfPage() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <section className="hero min-h-[300px] bg-gradient-to-br from-primary/20 to-secondary/20">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Identity Verification
            </h1>
            <p className="text-xl opacity-80 mb-4">
              Verify your identity to mint tokens. You must prove you are a real
              person and over 18 years old.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-8 md:px-12 max-w-4xl">
          <SelfVerification />
        </div>
      </section>
    </div>
  );
}
```

## 🧩 Step 4: Create Verification Components

### 4.1: Main Verification Component

Create `packages/nextjs/app/self/components/SelfVerification.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { getUniversalLink } from "@selfxyz/core";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
} from "@selfxyz/qrcode";
import { VerificationStatus } from "./VerificationStatus";
import { ProofRequirements } from "./ProofRequirements";
import { useSelfVerification } from "../lib/useSelfVerification";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_BUENO_TOKEN_ADDRESS as `0x${string}`;

export function SelfVerification() {
  const { address, isConnected } = useAccount();
  const { isVerified, isLoading: isCheckingVerification } = useSelfVerification();
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "verified" | "failed" | null
  >(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setVerificationStatus(null);
      return;
    }

    // Set user ID to wallet address
    setUserId(address);

    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "ZeroToDapp",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE_SEED || "zero2dapp-verification",
        endpoint: CONTRACT_ADDRESS,
        endpointType: "staging_celo",
        userId: address,
        userIdType: "hex",
        // Request specific proofs
        proofs: {
          identity: true, // Real person verification
          age: { min: 18 }, // Age 18+ requirement
        },
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Error initializing SelfApp:", error);
    }
  }, [isConnected, address]);

  // Update verification status when isVerified changes
  useEffect(() => {
    if (isCheckingVerification) return;
    
    if (isVerified) {
      setVerificationStatus("verified");
    } else if (verificationStatus === "verified") {
      // Keep verified status if already verified
      return;
    }
  }, [isVerified, isCheckingVerification]);

  const handleVerificationComplete = async (data?: any) => {
    setIsVerifying(true);
    setVerificationStatus("pending");
    
    try {
      console.log("Verification data received:", data);
      
      // If we get a tx hash from the data, use it
      if (data?.txHash) {
        setTxHash(data.txHash);
        setVerificationStatus("verified");
      } else {
        // Wait a bit for the transaction to be mined
        setTimeout(() => {
          setVerificationStatus("verified");
        }, 3000);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setVerificationStatus("failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleError = (error: any) => {
    console.error("Verification error:", error);
    setVerificationStatus("failed");
    setIsVerifying(false);
  };

  if (!isConnected) {
    return (
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">🔐 Connect Your Wallet</h2>
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Please connect your wallet to start verification</span>
          </div>
        </div>
      </div>
    );
  }

  // Show verified status if already verified
  if (isVerified || verificationStatus === "verified") {
    return (
      <div className="space-y-6">
        <ProofRequirements />
        <VerificationStatus
          status="verified"
          txHash={txHash}
          isLoading={isCheckingVerification}
        />
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <div className="alert alert-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-bold">You're Already Verified!</h3>
                <p className="text-sm">
                  You have already completed verification and received your 100 tokens.
                  You can only verify once per address.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Proof Requirements */}
      <ProofRequirements />

      {/* Verification Status */}
      {verificationStatus && (
        <VerificationStatus
          status={verificationStatus}
          isLoading={isVerifying}
          txHash={txHash}
        />
      )}

      {/* QR Code Display */}
      {selfApp && userId && !verificationStatus && (
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              Scan QR Code to Verify
            </h2>
            <p className="text-sm opacity-70 mb-4">
              Use the Self Protocol app to scan this QR code and complete your
              identity verification. After verification, you will automatically receive 100 tokens.
            </p>

            <div className="flex flex-col items-center gap-4">
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={handleVerificationComplete}
                onError={handleError}
              />

              <div className="divider">OR</div>

              <a
                href={universalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Open Self App
              </a>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(universalLink);
                  alert("Universal link copied to clipboard!");
                }}
              >
                Copy Universal Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isVerifying && (
        <div className="alert alert-info">
          <span className="loading loading-spinner"></span>
          <span>Verifying your identity...</span>
        </div>
      )}
    </div>
  );
}
```

### 4.2: Proof Requirements Component

Create `packages/nextjs/app/self/components/ProofRequirements.tsx`:

```typescript
export function ProofRequirements() {
  return (
    <div className="card bg-base-200 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">📋 Verification Requirements</h2>
        <p className="text-sm opacity-70 mb-4">
          To mint tokens, you must provide the following proofs:
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="badge badge-primary badge-lg">1</div>
            <div>
              <h3 className="font-semibold">Identity Proof</h3>
              <p className="text-sm opacity-70">
                Prove you are a real person with a valid identity
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="badge badge-primary badge-lg">2</div>
            <div>
              <h3 className="font-semibold">Age Verification</h3>
              <p className="text-sm opacity-70">
                Prove you are 18 years or older
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 4.3: Verification Status Component

Create `packages/nextjs/app/self/components/VerificationStatus.tsx`:

```typescript
interface VerificationStatusProps {
  status: "pending" | "verified" | "failed";
}

export function VerificationStatus({ status }: VerificationStatusProps) {
  if (status === "verified") {
    return (
      <div className="alert alert-success">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 className="font-bold">Verification Successful!</h3>
          <div className="text-sm">
            You can now mint tokens. Go to the{" "}
            <a href="/contract" className="link link-primary">
              Contract page
            </a>{" "}
            to mint.
          </div>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 className="font-bold">Verification Failed</h3>
          <div className="text-sm">
            Please try again. Make sure you meet all requirements.
          </div>
        </div>
      </div>
    );
  }

  return null;
}
```

## 🔒 Step 5: Gate Minting Behind Verification

### 5.1: Create Verification Hook

Create `packages/nextjs/app/self/lib/useSelfVerification.ts`:

```typescript
"use client";

import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_BUENO_TOKEN_ADDRESS as `0x${string}`;

// ABI for hasVerified function
const hasVerifiedAbi = [
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "hasVerified",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function useSelfVerification() {
  const { address, isConnected } = useAccount();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check on-chain verification status
  const { data: verifiedOnChain, isLoading: isLoadingContract } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: hasVerifiedAbi,
    functionName: "hasVerified",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!CONTRACT_ADDRESS,
    },
  });

  useEffect(() => {
    if (!isConnected || !address) {
      setIsVerified(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(isLoadingContract);

    // Check on-chain status
    if (verifiedOnChain !== undefined) {
      setIsVerified(verifiedOnChain as boolean);
      setIsLoading(false);
    }
  }, [isConnected, address, verifiedOnChain, isLoadingContract]);

  return {
    isVerified,
    isLoading,
    address,
  };
}
```

### 5.2: Modify Token Transfer Component

Update `packages/nextjs/app/contract/components/TokenTransfer.tsx` to gate minting:

Add the import at the top:

```typescript
import { useSelfVerification } from "../../self/lib/useSelfVerification";
```

Add the verification check in the component:

```typescript
export function TokenTransfer() {
  const { address, isConnected } = useAccount();
  const { isVerified, isLoading: isVerificationLoading } = useSelfVerification();
  // ... existing code ...

  // In the mint section, add verification check:
  {isOwner && (
    <div className="card bg-base-200 shadow-xl border border-base-300">
      <div className="card-body space-y-4">
        <h2 className="card-title text-2xl mb-4">
          🪙 Mint Tokens{" "}
          <span className="badge badge-warning">Owner Only</span>
        </h2>

        {/* Verification Gate */}
        {!isVerificationLoading && !isVerified && (
          <div className="alert alert-warning">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Verification Required</h3>
              <div className="text-sm">
                You must verify your identity before minting tokens.{" "}
                <a href="/self" className="link link-primary">
                  Verify now →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Rest of mint form */}
        <div className="space-y-4">
          {/* ... existing mint form fields ... */}
          
          <button
            className="btn btn-secondary w-full"
            onClick={handleMint}
            disabled={
              !isVerified || // Add this check
              isMintPending ||
              isMintConfirming ||
              !mintRecipient ||
              !mintAmount
            }
          >
            {!isVerified ? "Verify Identity First" : "Mint Tokens"}
          </button>
        </div>
      </div>
    </div>
  )}
}
```

### 5.3: Add Navigation Link

Update `packages/nextjs/app/components/Header.tsx` to add Self verification link:

```typescript
<ul className="menu menu-horizontal px-1 gap-2">
  <li>
    <Link href="/">Home</Link>
  </li>
  <li>
    <Link href="/subgraph">Subgraph</Link>
  </li>
  <li>
    <Link href="/contract">Contract</Link>
  </li>
  <li>
    <Link href="/self">Verify</Link> {/* Add this */}
  </li>
  {/* ... rest of menu ... */}
</ul>
```

## 🧪 Step 6: Test the Integration

### Testing Steps

1. **Start the Development Server**
   ```bash
   npm run dev:nextjs
   ```

2. **Connect Your Wallet**
   - Open http://localhost:3000
   - Click "Connect Wallet"
   - Connect to Celo Sepolia network

3. **Try to Mint (Should Be Blocked)**
   - Navigate to `/contract` page
   - Try to mint tokens
   - Should see "Verification Required" message

4. **Complete Verification**
   - Navigate to `/self` page
   - Scan QR code with Self Protocol app
   - Complete identity verification
   - Verify all proofs are provided

5. **Verify On-Chain (Optional)**
   - If you've deployed a VerificationRegistry contract
   - Check that your address is marked as verified

6. **Mint Tokens**
   - Return to `/contract` page
   - Mint button should now be enabled
   - Complete mint transaction

## 🔍 Troubleshooting

### QR Code Not Displaying

**Issue**: QR code component not rendering

**Solutions**:
- Check that `NEXT_PUBLIC_SELF_APP_NAME`, `NEXT_PUBLIC_SELF_ENDPOINT`, and `NEXT_PUBLIC_SELF_SCOPE_SEED` are set
- Verify Self Protocol packages are installed
- Check browser console for errors

### Verification Not Working

**Issue**: Verification status not updating

**Solutions**:
- Check that `onVerificationComplete` callback is working
- Verify proof data structure matches expectations
- Check localStorage for stored verification status
- Ensure on-chain verification contract is deployed (if using)

### Mint Still Blocked After Verification

**Issue**: Can't mint even after verifying

**Solutions**:
- Check that verification status is being stored correctly
- Verify `useSelfVerification` hook is returning correct status
- Check that verification contract address is set in environment variables
- Refresh the page to reload verification status

### Self Protocol App Not Connecting

**Issue**: Can't scan QR code or open universal link

**Solutions**:
- Make sure you have Self Protocol app installed
- Check that universal link is being generated correctly
- Try copying the universal link and opening manually
- Verify network connectivity

## 📚 Resources

- [Self Protocol Documentation](https://docs.self.xyz)
- [Self Protocol Quickstart](https://docs.self.xyz/use-self/quickstart)
- [Celo Sepolia Testnet](https://docs.celo.org/tooling/testnets/celo-sepolia)
- [Remix IDE](https://remix.ethereum.org/)
- [Celo Block Explorer](https://sepolia.celoscan.io)

## 🎯 Next Steps

After completing this integration:

1. **Deploy Verification Registry Contract** (Optional)
   - Create a smart contract to store verification status on-chain
   - Update `useSelfVerification` hook to use the contract
   - Deploy to Celo Sepolia

2. **Add Verification Badges**
   - Show verification status in user profile
   - Display verified addresses differently in token ownership list

3. **Implement Proof Verification**
   - Add server-side verification of Self Protocol proofs
   - Verify age and identity
   - Store verification results on-chain

4. **Add Verification Expiration**
   - Implement time-based verification expiration
   - Require re-verification after certain period

5. **Production Deployment**
   - Deploy to Celo Mainnet
   - Update all contract addresses
   - Configure production Self Protocol app

## ✅ Verification Checklist

Use this checklist to verify your integration:

- [ ] Self Protocol packages installed
- [ ] Environment variables configured
- [ ] Verification page created (`/self`)
- [ ] Verification components working
- [ ] Mint function gated behind verification
- [ ] Navigation link added
- [ ] QR code displays correctly
- [ ] Verification flow completes
- [ ] Mint works after verification
- [ ] Error handling implemented

Happy building! 🎉

