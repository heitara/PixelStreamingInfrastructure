// Copyright Epic Games, Inc. All Rights Reserved.
import { BaseMessage } from '@epicgames-ps/lib-pixelstreamingcommon-ue5.7';
import { GameState } from '../framework/GameState';

/**
 * Message format for sending game state updates to Unreal Engine streamers
 */
export interface GameStateMessage extends BaseMessage {
    type: 'gameStateUpdate';
    sessionId: string;
    currentState: GameState | null;
    previousState: GameState | null;
    serverTime: string;
    triggerScene: string;
}
