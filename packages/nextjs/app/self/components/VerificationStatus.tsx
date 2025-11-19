"use client";

interface VerificationStatusProps {
  status: "pending" | "verified" | "failed" | null;
  isLoading?: boolean;
  txHash?: string | null;
}

export function VerificationStatus({
  status,
  isLoading = false,
  txHash,
}: VerificationStatusProps) {
  if (isLoading) {
    return (
      <div className="alert alert-info">
        <span className="loading loading-spinner loading-sm"></span>
        <span>Verifying your identity...</span>
      </div>
    );
  }

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
        <div className="flex-1">
          <h3 className="font-bold">Verification Successful!</h3>
          <div className="text-sm">
            You have been verified and received 100 tokens.
            {txHash && (
              <a
                href={`https://sepolia.celoscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary ml-2"
              >
                View Transaction
              </a>
            )}
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
        <div className="flex-1">
          <h3 className="font-bold">Verification Failed</h3>
          <div className="text-sm">
            Please try again. Make sure you meet all the requirements.
          </div>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="alert alert-warning">
        <span className="loading loading-spinner loading-sm"></span>
        <span>Waiting for verification to complete...</span>
      </div>
    );
  }

  return null;
}

