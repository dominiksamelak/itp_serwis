import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#111111",
    }}>
      <SignIn 
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
