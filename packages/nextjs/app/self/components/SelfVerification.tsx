"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
  getUniversalLink,
} from "@selfxyz/qrcode";
import { VerificationStatus } from "./VerificationStatus";
import { ProofRequirements } from "./ProofRequirements";
import { useSelfVerification } from "../lib/useSelfVerification";

// Contract address must be lowercase for Self Protocol
const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_SELF_ENDPOINT || 
  process.env.NEXT_PUBLIC_BUENO_TOKEN_ADDRESS || "").toLowerCase() as `0x${string}`;

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
      // Scope seed must match the contract deployment
      const scopeSeed = process.env.NEXT_PUBLIC_SELF_SCOPE_SEED || "zero2dapp-verification";
      
      const endpointType = "staging_celo"; // Use "celo" for mainnet
      
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "ZeroToDapp",
        scope: scopeSeed,
        endpoint: CONTRACT_ADDRESS,
        endpointType: endpointType,
        userId: address.toLowerCase(),
        userIdType: "hex",
        // Request specific disclosures: identity and age only (no OFAC)
        disclosures: {
          minimumAge: 18, // Age 18+ requirement
          // ofac: false, // OFAC check disabled
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
        <div className="card-body space-y-4">
          <h2 className="card-title text-2xl mb-4">🔐 Identity Verification</h2>
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
              📱 Scan QR Code to Verify
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

