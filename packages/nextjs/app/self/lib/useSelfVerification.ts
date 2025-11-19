"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import buenoTokenAbi from "../../../../../artifacts/BuenoToken.json";

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

