"use client";

import dynamic from "next/dynamic";

const AccountInner = dynamic(() => import("./AccountInner"), {
  ssr: false,
  loading: () => (
    <div style={{ background: "#080b10", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#5a6a80", fontFamily: "'DM Sans',sans-serif" }}>Loading...</p>
    </div>
  ),
});

export default function AccountPage() {
  return <AccountInner />;
}
