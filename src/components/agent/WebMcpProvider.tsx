'use client';

import { useEffect } from 'react';

type UnknownModelContext = {
  provideContext?: (context: unknown) => Promise<unknown> | unknown;
};

export function WebMcpProvider() {
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
          window.location.href = '/work';
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
          window.location.href = '/contact';
          return { ok: true };
        },
      },
    ];

    void nav.modelContext.provideContext({
      tools,
    });
  }, []);

  return null;
}
