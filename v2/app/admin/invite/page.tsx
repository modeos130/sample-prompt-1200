"use client";

import dynamic from "next/dynamic";

const InviteInner = dynamic(() => import("./InviteInner"), {
  ssr: false,
  loading: () => (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#707088", fontFamily: "'DM Sans',sans-serif" }}>Loading...</p>
    </div>
  ),
});

export default function InvitePage() {
  return <InviteInner />;
}
