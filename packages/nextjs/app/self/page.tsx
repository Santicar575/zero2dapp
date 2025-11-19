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
              Verify your identity to receive 100 tokens. You must prove you are a real
              person, over 18, and not on OFAC sanctions list.
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

