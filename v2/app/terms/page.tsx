import type { Metadata } from "next";
import { LegalPage } from "@/app/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms | Booman Lab",
  description: "Draft terms for Booman Lab private invite-only access.",
};

const sections = [
  {
    title: "Private Access",
    body: [
      "Booman Lab is currently a private invite-only studio. Access is limited to accounts created or approved by the operator. There is no public signup flow, and access may be paused, revoked, or limited if an account is inactive, misused, or no longer invited.",
      "You are responsible for keeping your login credentials private. Do not share access with another person or use another member's account.",
    ],
  },
  {
    title: "Studio Tools",
    body: [
      "The site provides prompt-library tools, AI music generation workflows, sample-analysis tools, and private creative utilities for music production. Outputs may depend on third-party AI providers and may change, fail, or become unavailable without notice.",
      "Booman Lab does not guarantee that generated audio, prompts, or analysis will be unique, commercially usable, uninterrupted, or error free. You are responsible for reviewing all output before release, distribution, or commercial use.",
    ],
  },
  {
    title: "Rights And Responsibility",
    body: [
      "Only upload, analyze, describe, or generate from material that you own, are licensed to use, or have permission to process. Do not use the service to imitate real artists, real producers, living people, trademarks, or copyrighted works in a way that violates rights or platform rules.",
      "You remain responsible for how you use prompts, audio, and other output outside Booman Lab, including use in Suno, Lyria, or any other AI music system.",
    ],
  },
  {
    title: "Payments And Availability",
    body: [
      "The current private beta does not include a public checkout, subscription, or paid unlock flow. If paid plans are introduced later, pricing, renewal, refund, cancellation, and usage terms must be published before accepting payment.",
      "The operator may change features, limits, providers, beta access, or availability as the product is developed.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Questions about access, policy, or account status can be sent to admin@modeos.app.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      description="Rules for using Booman Lab during the private invite-only beta."
      updated="May 8, 2026"
      sections={sections}
    />
  );
}
