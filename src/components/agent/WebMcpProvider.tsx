'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type UnknownModelContext = {
  provideContext?: (context: unknown) => Promise<unknown> | unknown;
};

export function WebMcpProvider() {
  const router = useRouter();

  useEffect(() => {
    const nav = navigator as Navigator & { modelContext?: UnknownModelContext };
    if (!nav.modelContext?.provideContext) return;

    const tools = [
      {
        name: 'open_work',
        description: 'Navigate to the featured work page.',
        inputSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {},
        },
        execute: async () => {
          router.push('/work');
          return { ok: true };
        },
      },
      {
        name: 'open_contact',
        description: 'Navigate to the contact page.',
        inputSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {},
        },
        execute: async () => {
          router.push('/contact');
          return { ok: true };
        },
      },
    ];

    void nav.modelContext.provideContext({
      tools,
    });
  }, [router]);

  return null;
}
