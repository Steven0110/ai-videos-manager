import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import { ProjectProvider } from "./{core}/context/ProjectContext";
import { HeroUIProvider } from "@heroui/system";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Videos Manager",
  description: "Dashboard to edit AI videos as projects",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HeroUIProvider>
          <ProjectProvider>
            {children}
          </ProjectProvider>
        </HeroUIProvider>
      </body>
    </html>
  );
}