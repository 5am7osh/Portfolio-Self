import { Geist, Geist_Mono, Catamaran } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const catamaran = Catamaran({
  variable: "--font-catamaran",
  subsets: ["latin", "tamil"],
  weight: ["400", "700", "900"],
  display: "swap",
});

export const metadata = {
  title: "Samuel J Prabahar",
  description: "Portfolio of Samuel J Prabahar",
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${catamaran.variable} antialiased`}
    >
      <body className="antialiased"><ScrollToTop />{children}</body>
    </html>
  );
}
