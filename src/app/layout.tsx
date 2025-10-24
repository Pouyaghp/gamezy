import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Gamezy — From Glitches to Glory",
  description:
    "Review and rate games by their story and technical performance. Report bugs and share honest opinions on Gamezy.",
  openGraph: {
    title: "Gamezy — From Glitches to Glory",
    description:
      "Where gamers share honest reviews, rate stories, and report glitches.",
    url: "https://gamez-y.com",
    siteName: "Gamezy",
    images: [
      {
        url: "/gamezy-preview.png",
        width: 1200,
        height: 630,
        alt: "Gamezy — From Glitches to Glory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gamezy — From Glitches to Glory",
    description:
      "Join the community. Review games, share feedback, and uncover the best experiences.",
    images: ["/gamezy-preview.png"],
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
        {children}
      </body>
    </html>
  );
}
