import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "./components/Header";

export const metadata: Metadata = {
  title: "Encrypted Temperature Check",
  description: "Encrypted Temperature Check System using FHE",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`bg-gradient-to-br from-gray-50 via-white to-indigo-50 text-foreground antialiased min-h-screen`}>
        <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-indigo-50 z-[-20]"></div>
        <main className="flex flex-col w-full min-h-screen">
          <Providers>
            <Header />
            <div className="flex-1">
              {children}
            </div>
          </Providers>
        </main>
      </body>
    </html>
  );
}
