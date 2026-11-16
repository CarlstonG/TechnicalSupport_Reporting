import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Portside · T2 Documentation', description: 'The internal maritime technical support workspace.' };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
