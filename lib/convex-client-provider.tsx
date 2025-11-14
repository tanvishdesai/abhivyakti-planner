'use client';

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        variables: {
          colorPrimary: '#f59e0b',
          colorBackground: '#0f172a',
          colorInputBackground: 'rgba(255, 255, 255, 0.05)',
          colorInputText: '#f1f5f9',
          colorText: '#f1f5f9',
          colorTextSecondary: '#cbd5e1',
        },
        elements: {
          card: 'bg-slate-900/90 border border-white/10 backdrop-blur-xl',
          headerTitle: 'text-slate-50',
          headerSubtitle: 'text-slate-300',
          formButtonPrimary: 'bg-amber-500 hover:bg-amber-600',
          footerActionLink: 'text-amber-400 hover:text-amber-300',
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

