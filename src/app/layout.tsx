import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import './globals.css'
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Head from "next/head";

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
    title: 'Pine Activator',
    description: 'Set up WIFI on your Bambu P1S without the app',
}
export default function RootLayout({children}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <Head>
            <link key={1} rel="apple-touch-icon" sizes="180x180" href="/pine-activator/images/apple-touch-icon.png"/>
            <link key={2} rel="icon" type="image/png" sizes="32x32" href="/pine-activator/images/favicon-32x32.png"/>
            <link key={3} rel="icon" type="image/png" sizes="16x16" href="/pine-activator/images/favicon-16x16.png"/>
            <link key={4} rel="manifest" href="/pine-activator/site.webmanifest"/>
            <link key={5} rel="mask-icon" href="/pine-activator/images/safari-pinned-tab.svg" color="#1f2937"/>
            <link key={6} rel="shortcut icon" href="/pine-activator/images/favicon.ico"/>
            <meta key={7} name="msapplication-TileColor" content="#da532c"/>
            <meta key={8} name="msapplication-config" content="/pine-activator/browserconfig.xml"/>
            <meta key={9} name="theme-color" content="#1f2937"/>
        </Head>
        <body className={inter.className + " bg-gray-800 min-h-screen dark"}>
        <Navbar/>
        {children}
        <Footer/>
        </body>
        </html>
    )
}
