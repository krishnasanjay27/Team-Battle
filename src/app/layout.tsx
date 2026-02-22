import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TeamBattle – Naruto Card Game',
  description: 'Turn-based Naruto character card role assignment game',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen relative">
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
