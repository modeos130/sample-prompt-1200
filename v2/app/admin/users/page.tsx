"use client";

import dynamic from "next/dynamic";

const AdminUsersInner = dynamic(() => import("./AdminUsersInner"), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#080b10" }}
    >
      <p style={{ color: "#5a6a80", fontFamily: "'DM Mono', monospace" }}>
        Loading...
      </p>
    </div>
  ),
});

export default function AdminUsersPage() {
  return <AdminUsersInner />;
}
