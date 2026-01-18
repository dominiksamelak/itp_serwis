import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "IT-PREMIUM Serwis",
  description: "System zarządzania serwisem",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="pl">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
