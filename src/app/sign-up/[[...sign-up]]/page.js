import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#111111",
      padding: "2rem",
    }}>
      <div style={{
        maxWidth: "500px",
        marginBottom: "2rem",
        textAlign: "center",
        color: "#e5e7eb",
      }}>
        <h2 style={{ marginBottom: "1rem", color: "#fff" }}>Rejestracja</h2>
        <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
          Rejestracja jest dostępna tylko dla autoryzowanych użytkowników. 
          Jeśli nie masz dostępu, skontaktuj się z administratorem.
        </p>
      </div>
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-[#1a1a1a] border border-[#333]",
          },
        }}
      />
    </div>
  );
}
