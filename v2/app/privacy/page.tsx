import type { Metadata } from "next";
import { LegalPage } from "@/app/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy | Booman Lab",
  description: "Draft privacy policy for Booman Lab private invite-only access.",
};

const sections = [
  {
    title: "What We Collect",
    body: [
      "Booman Lab may collect account information such as email address, authentication identifiers, profile tier, active status, invite status, timestamps, and basic analytics events needed to operate the private studio.",
      "When you use sample analysis, prompt generation, or music generation, the site may process uploaded audio, prompt text, generated prompts, request metadata, and technical information needed to complete the request.",
    ],
  },
  {
    title: "How Data Is Used",
    body: [
      "Data is used to authenticate invited members, protect private routes, enforce usage limits, operate admin tools, troubleshoot errors, improve the product, and deliver AI-powered studio functions.",
      "The site should not sell personal information. Before any marketing, public analytics, advertising, or payment tracking is added, the policy should be reviewed and updated.",
    ],
  },
  {
    title: "Third-Party Services",
    body: [
      "Booman Lab uses services such as Supabase for authentication and database functions, Google AI services for prompt synthesis, music generation, and sample analysis, Vercel for hosting, and GitHub/Vercel tooling for deployment.",
      "Information sent to third-party providers is handled under those providers' terms and privacy practices. Do not upload sensitive, confidential, or uncleared material unless you have the right to do so.",
    ],
  },
  {
    title: "Cookies And Sessions",
    body: [
      "The site uses authentication cookies and related session storage to keep invited members signed in and to protect private pages. Blocking these cookies may prevent the app from working.",
    ],
  },
  {
    title: "Retention And Requests",
    body: [
      "Private beta data may be retained as needed for account access, security review, abuse prevention, troubleshooting, and legal or operational requirements. To request deletion or correction of account data, contact admin@modeos.app.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      description="How Booman Lab handles account, upload, analytics, and AI request data during private beta."
      updated="May 8, 2026"
      sections={sections}
    />
  );
}
