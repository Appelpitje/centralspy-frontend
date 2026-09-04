import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { PacketInspectorEvent, InspectorFilter } from '../types';
import {
  inspectorWebSocketService,
  WebSocketConnectionState,
  InspectorWebSocketService,
} from '../services/websocketService';

export interface UseProtocolInspectorOptions {
  maxBufferSize?: number;
  autoConnect?: boolean;
  service?: InspectorWebSocketService;
}

export function useProtocolInspector(options: UseProtocolInspectorOptions = {}) {
  const {
    maxBufferSize = 500,
    autoConnect = true,
    service = inspectorWebSocketService,
  } = options;

  const [packets, setPackets] = useState<PacketInspectorEvent[]>([]);
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>(service.getState());
  const [activeClients, setActiveClients] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [selectedPacket, setSelectedPacket] = useState<PacketInspectorEvent | null>(null);

  // Local filter state
  const [filter, setFilterState] = useState<InspectorFilter>({
    protocol: 'ALL',
    direction: 'ALL',
    subsystemOrCommand: '',
    clientIp: '',
    searchQuery: '',
  });

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const filterRef = useRef(filter);
  filterRef.current = filter;

  // Manage incoming packet buffer
  const handleIncomingPacket = useCallback(
    (packet: PacketInspectorEvent) => {
      if (isPausedRef.current) {
        return;
      }

      setPackets((prev) => {
        // Prevent duplicate IDs if received from history replay
        if (prev.some((p) => p.id === packet.id)) {
          return prev;
        }
        const updated = [...prev, packet];
        if (updated.length > maxBufferSize) {
          return updated.slice(updated.length - maxBufferSize);
        }
        return updated;
      });
    },
    [maxBufferSize]
  );

  useEffect(() => {
    const unsubState = service.onStateChange((state) => {
      setConnectionState(state);
    });

    const unsubPacket = service.onPacket((packet) => {
      handleIncomingPacket(packet);
    });

    const unsubStats = service.onStats((stats) => {
      setActiveClients(stats.activeClients);
    });

    if (autoConnect) {
      service.connect();
    }

    return () => {
      unsubState();
      unsubPacket();
      unsubStats();
    };
  }, [service, autoConnect, handleIncomingPacket]);

  // Synchronize filter with backend
  const updateFilter = useCallback(
    (newFilter: Partial<InspectorFilter>) => {
      setFilterState((prev) => {
        const next = { ...prev, ...newFilter };
        // Sync to backend
        const backendFilter: any = {};
        if (next.protocol && next.protocol !== 'ALL') {
          backendFilter.protocol = next.protocol;
        }
        if (next.direction && next.direction !== 'ALL') {
          backendFilter.direction = next.direction;
        }
        if (next.subsystemOrCommand) {
          backendFilter.subsystem = next.subsystemOrCommand;
        }
        if (next.clientIp) {
          backendFilter.clientIp = next.clientIp;
        }
        service.sendFilter(backendFilter);
        return next;
      });
    },
    [service]
  );

  const clearBuffer = useCallback(() => {
    setPackets([]);
    setSelectedPacket(null);
    service.clearHistory();
  }, [service]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const toggleAutoScroll = useCallback(() => {
    setAutoScroll((prev) => !prev);
  }, []);

  const reconnect = useCallback(() => {
    service.disconnect();
    setTimeout(() => {
      service.connect();
    }, 100);
  }, [service]);

  // Filter packets locally for real-time responsiveness
  const filteredPackets = useMemo(() => {
    return packets.filter((pkt) => {
      // Protocol filter
      if (filter.protocol && filter.protocol !== 'ALL' && pkt.protocol !== filter.protocol) {
        return false;
      }
      // Direction filter
      if (filter.direction && filter.direction !== 'ALL' && pkt.direction !== filter.direction) {
        return false;
      }
      // Subsystem filter
      if (
        filter.subsystemOrCommand &&
        !pkt.subsystemOrCommand.toLowerCase().includes(filter.subsystemOrCommand.toLowerCase())
      ) {
        return false;
      }
      // Client IP filter
      if (
        filter.clientIp &&
        !pkt.clientIp.toLowerCase().includes(filter.clientIp.toLowerCase())
      ) {
        return false;
      }
      // Global Search Query across payload & fields
      if (filter.searchQuery && filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase().trim();
        const inSubsystem = pkt.subsystemOrCommand.toLowerCase().includes(query);
        const inSubtype = String(pkt.subtypeOrTxn).toLowerCase().includes(query);
        const inIp = pkt.clientIp.toLowerCase().includes(query);
        let inPayload = false;
        if (typeof pkt.payload === 'string') {
          inPayload = pkt.payload.toLowerCase().includes(query);
        } else if (pkt.payload && typeof pkt.payload === 'object') {
          inPayload = JSON.stringify(pkt.payload).toLowerCase().includes(query);
        }
        if (!inSubsystem && !inSubtype && !inIp && !inPayload) {
          return false;
        }
      }
      return true;
    });
  }, [packets, filter]);

  return {
    packets: filteredPackets,
    totalBufferedPackets: packets.length,
    connectionState,
    activeClients,
    isPaused,
    setIsPaused,
    togglePause,
    autoScroll,
    setAutoScroll,
    toggleAutoScroll,
    selectedPacket,
    setSelectedPacket,
    filter,
    setFilter: updateFilter,
    clearBuffer,
    reconnect,
  };
}
