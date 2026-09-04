export interface PacketInspectorEvent {
  id: string;
  timestamp: number;
  protocol: 'FESL' | 'THEATER';
  direction: 'INCOMING' | 'OUTGOING';
  clientIp: string;
  clientPort: number;
  subsystemOrCommand: string;
  subtypeOrTxn: string | number;
  length: number;
  payload: Record<string, any> | string;
  rawHex?: string;
}

export interface InspectorFilter {
  protocol?: 'ALL' | 'FESL' | 'THEATER';
  direction?: 'ALL' | 'INCOMING' | 'OUTGOING';
  clientIp?: string;
  subsystemOrCommand?: string;
  searchQuery?: string;
}

export interface InspectorStats {
  connectedClients: number;
  totalPacketsObserved: number;
  bufferSize: number;
  uptimeSeconds: number;
}
