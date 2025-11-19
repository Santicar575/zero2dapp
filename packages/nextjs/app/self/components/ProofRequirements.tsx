export function ProofRequirements() {
  return (
    <div className="card bg-base-200 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">📋 Verification Requirements</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="badge badge-primary badge-lg">1</div>
            <div>
              <h3 className="font-semibold">Identity Verification</h3>
              <p className="text-sm opacity-70">
                Prove you are a real person with a valid identity document
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="badge badge-primary badge-lg">2</div>
            <div>
              <h3 className="font-semibold">Age Verification</h3>
              <p className="text-sm opacity-70">
                Confirm you are at least 18 years old
              </p>
            </div>
          </div>
        </div>
        <div className="alert alert-info mt-4">
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
          <span>
            After successful verification, you will automatically receive 100 tokens. You can only verify once per address.
          </span>
        </div>
      </div>
    </div>
  );
}

