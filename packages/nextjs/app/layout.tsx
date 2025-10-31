import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "ZeroToDapp",
  description: "A decentralized application built with Next.js and The Graph",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const initialTheme = theme || (prefersDark ? 'dark' : 'light');
                  
                  if (initialTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'celo-dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'celo');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="h-full flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1 w-full overflow-x-hidden pb-20">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
