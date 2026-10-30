import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title:'Element Calculator', description:'Explainable, deterministic chemistry calculations' };
export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="en"><body>{children}</body></html>;
}
