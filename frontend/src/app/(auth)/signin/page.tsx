import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Log In | RAISE Emerging Manager Database",
  description: "Sign in to RAISE Emerging Manager Database Platform",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-white">
      {/* Left Brand Panel */}
      <div className="relative hidden w-full lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-[#183656] p-12 xl:p-20 text-white select-none">
        {/* Subtle Geometric Polygonal Facet Overlay */}
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 1000 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon points="0,1000 1000,1000 1000,560 0,780" fill="#132c48" opacity="0.75" />
          <polygon points="0,1000 420,1000 1000,680 1000,1000" fill="#0e2239" opacity="0.6" />
          <polygon points="120,1000 680,1000 1000,800 0,910" fill="#0a1a2e" opacity="0.75" />
          <polygon points="0,1000 280,1000 1000,420 1000,580" fill="#1b395d" opacity="0.4" />
        </svg>

        {/* Top: RAISE Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo/logo-dark.png"
              alt="RAISE"
              width={160}
              height={38}
              priority
              className="h-9 w-auto"
            />
          </Link>
        </div>

        {/* Center: Hero Heading */}
        <div className="relative z-10 my-auto py-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-5">
            Emerging<br />
            Manager<br />
            Database
          </h1>
          <p className="text-lg lg:text-xl text-slate-200/90 font-normal">
            Your gateway to emerging venture.
          </p>
        </div>

        {/* Bottom: External Link */}
        <div className="relative z-10">
          <a
            href="https://www.raiseglobal.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-slate-300 underline underline-offset-4 hover:text-white transition-colors"
          >
            Go to RAISE Website
          </a>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="flex w-full lg:w-1/2 min-h-screen flex-col items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
        <SignInForm />
      </div>
    </div>
  );
}
