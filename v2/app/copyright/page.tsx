import type { Metadata } from "next";
import { LegalPage } from "@/app/legal/LegalPage";

export const metadata: Metadata = {
  title: "Copyright | Booman Lab",
  description: "Draft copyright policy for Booman Lab private invite-only access.",
};

const sections = [
  {
    title: "User Responsibility",
    body: [
      "You are responsible for the materials you upload, describe, analyze, or use as creative reference. Only use files, recordings, names, text, and other content that you own, have licensed, or have permission to process.",
      "AI-generated output may not be exclusive, may resemble existing material, and may require additional clearance before release. Review all output carefully before publishing, selling, licensing, or distributing it.",
    ],
  },
  {
    title: "Rights Complaints",
    body: [
      "If you believe content connected to Booman Lab infringes your rights, send a notice to admin@modeos.app with your contact information, identification of the work, identification of the allegedly infringing material, a statement that you believe the use is unauthorized, and a statement that the information is accurate.",
      "The operator may remove or disable access to disputed material while a complaint is reviewed.",
    ],
  },
  {
    title: "Repeat Infringement",
    body: [
      "Accounts used for repeated infringement, unsafe uploads, unauthorized material, or abuse of rights-management rules may be suspended or revoked.",
    ],
  },
  {
    title: "Platform Rules",
    body: [
      "When exporting prompts or output to third-party AI music systems, you are also responsible for following that platform's terms, copyright policies, and content rules.",
    ],
  },
];

export default function CopyrightPage() {
  return (
    <LegalPage
      title="Copyright"
      description="Rights and takedown guidance for Booman Lab uploads, prompts, analysis, and generated output."
      updated="May 8, 2026"
      sections={sections}
    />
  );
}
