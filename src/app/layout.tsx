import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pine Activator',
  description: 'Set up WIFI on your Bambu P1S without the app',
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-gray-800 min-h-screen dark"}>
      <Navbar />
      {children}
      <Footer />
      </body>
    </html>
  )
}
