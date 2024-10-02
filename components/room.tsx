"use client";

import { Layer } from "@/types/canvas";
import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import {
  ClientSideSuspense,
  RoomProvider,
  LiveblocksProvider,
} from "@liveblocks/react";
import React from "react";

interface RoomProps {
  children: React.ReactNode;
  roomId: string;
  fallback: NonNullable<React.ReactNode> | null;
}

export const Room = ({ children, roomId, fallback }: RoomProps) => {
  return (
    <LiveblocksProvider authEndpoint={'/api/liveblocks-auth'}>
      <RoomProvider
        id={roomId}
        initialPresence={{
          cursor: null,
          selection: [],
          pencilDraft: null,
          pencilColor: null,
        }}
        initialStorage={{
          layers: new LiveMap<string, LiveObject<Layer>>(),
          layerIds: new LiveList<string>([]),
        }}
      >
        <ClientSideSuspense fallback={fallback}>
          {() => children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
};
