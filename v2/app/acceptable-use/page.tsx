import type { Metadata } from "next";
import { LegalPage } from "@/app/legal/LegalPage";

export const metadata: Metadata = {
  title: "Acceptable Use | Booman Lab",
  description: "Draft acceptable use rules for Booman Lab private invite-only access.",
};

const sections = [
  {
    title: "Allowed Use",
    body: [
      "Booman Lab is intended for lawful private music-production research, prompt drafting, sample-inspired composition, and internal creative development by invited users.",
      "You may use the tools to create original prompts, analyze sounds you are allowed to process, and generate music ideas consistent with applicable platform rules and rights obligations.",
    ],
  },
  {
    title: "Prohibited Use",
    body: [
      "Do not upload material you do not own or have permission to process. Do not use the service to infringe copyrights, impersonate real artists or producers, bypass provider rules, generate unlawful content, harass others, or misrepresent output as someone else's work.",
      "Do not attempt to bypass access controls, rate limits, security checks, account restrictions, or admin-only functions. Do not scrape, attack, probe, overload, reverse engineer, or interfere with the app or its providers.",
    ],
  },
  {
    title: "No Credential Sharing",
    body: [
      "Access is personal and invite based. Do not share your account, invite, password, session, or private links with others.",
    ],
  },
  {
    title: "Enforcement",
    body: [
      "The operator may suspend or revoke access, remove data, preserve records, or block requests that appear unsafe, abusive, infringing, or inconsistent with the private beta purpose.",
    ],
  },
];

export default function AcceptableUsePage() {
  return (
    <LegalPage
      title="Acceptable Use"
      description="Rules for safe, private, rights-aware use of Booman Lab's AI music tools."
      updated="May 8, 2026"
      sections={sections}
    />
  );
}
