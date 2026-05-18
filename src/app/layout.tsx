import type { Metadata } from "next";
import { Providers } from '@/providers';
import { Navbar } from '@/components/layout';
import { Footer } from '@/components/layout';
import { Toaster } from 'react-hot-toast';
// @ts-ignore
import '@rainbow-me/rainbowkit/styles.css';
// @ts-ignore
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from '@/components/ui/tooltip';
import { CreateLaunchModal } from '@/components/launch/wizard';
import { headers } from 'next/headers';
import { cookieToInitialState, createConfig, http, cookieStorage, createStorage } from 'wagmi';
import { nexusTestnet } from '@/lib/wagmi/chain';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Exhibition",
  description: "Deterministic primary market infrastructure for an enshrined financial system",
  icons: {
    icon: "/favicon.svg",
  },
};

const serverConfig = createConfig({
  chains: [nexusTestnet],
  transports: { [nexusTestnet.id]: http('/api/rpc') },
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const cookie      = headersList.get('cookie') ?? '';
  const initialState = cookieToInitialState(serverConfig, cookie);

  return (
    <html lang="en" className={cn("dark font-sans", geist.variable)}>
      <body suppressHydrationWarning>
        <Providers initialState={initialState}>
          <TooltipProvider>
            <Navbar />
            <CreateLaunchModal />
            {children}
            <Footer />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#1A1A1A',
                  color:      '#f5f5f5',
                  border:     '1px solid rgba(255,255,255,0.1)',
                  fontSize:   '14px',
                },
                success: {
                  iconTheme: {
                    primary:   '#15c6e6',
                    secondary: '#1A1A1A',
                  },
                },
                error: {
                  iconTheme: {
                    primary:   '#fa7e09',
                    secondary: '#1A1A1A',
                  },
                },
              }}
            />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}