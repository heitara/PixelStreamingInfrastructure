// Copyright Epic Games, Inc. All Rights Reserved.
import { BaseMessage } from '@epicgames-ps/lib-pixelstreamingcommon-ue5.7';

/**
 * Message format for sending game state updates to Unreal Engine streamers
 */
export interface GameStateMessage extends BaseMessage {
    type: string;
    action: string;
    data: Record<string, any>; // Flexible payload for game state data
}
