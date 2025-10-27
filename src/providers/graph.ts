import type { Client } from '@microsoft/microsoft-graph-client';
import { createContext, createElement, useContext, type ReactNode } from 'react';

const GraphContext = createContext<Client | null>(null);

interface GraphProviderProps {
  client: Client;
  children: ReactNode;
}

export function GraphProvider({ client, children }: GraphProviderProps) {
  return createElement(GraphContext.Provider, { value: client }, children);
}

export function useGraphClient(): Client {
  const client = useContext(GraphContext);
  if (!client) {
    throw new Error('useGraphClient must be used within a GraphProvider');
  }

  return client;
}
