import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h1>BI Dashboard MVP</h1>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/dashboard" style={{ color: "#0070f3", textDecoration: "underline" }}>
          Go to Dashboard
        </Link>
      </p>
    </main>
  );
}

