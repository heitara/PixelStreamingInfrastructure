// Copyright Epic Games, Inc. All Rights Reserved.
import { AbstractGame } from '../framework/AbstractGame';
import { SignallingServer } from '@epicgames-ps/lib-pixelstreamingsignalling-ue5.7';
import { GameStateMessage } from '../types/GameStateMessage';
import { Logger } from '@epicgames-ps/lib-pixelstreamingsignalling-ue5.7';
import { BaseMessage } from '@epicgames-ps/lib-pixelstreamingcommon-ue5.7';

export class SimpleGame extends AbstractGame {
    private signallingServer: SignallingServer | null = null;

    constructor(signallingServer?: SignallingServer) {
        super();
        if (signallingServer) {
            this.signallingServer = signallingServer;
        }
        this.states = [
            { name: 'start', duration: 10000, allowActions: false },
            { name: 'deal', duration: 10000, allowActions: false },
            { name: 'bet', duration: 10000, allowActions: true }, // Allow actions here
            { name: 'close', duration: 10000, allowActions: false },
            { name: 'calculate', duration: 10000, allowActions: false },
            { name: 'greet', duration: 10000, allowActions: false }
        ];
    }

    /**
     * Broadcasts game state to the default streamer
     */
    public broadcastGameStateToStreamers(): void {
        if (!this.signallingServer) {
            Logger.debug('[SimpleGame] No signalling server reference, cannot broadcast to streamers');
            return;
        }

        // TODO: read this from config, this is the UE instance streamer ID
        const defaultStreamerId = 'DefaultStreamer';

        if (!defaultStreamerId) {
            Logger.debug('[SimpleGame] No streamers connected');
            return;
        }

        const streamer = this.signallingServer.streamerRegistry.find(defaultStreamerId);

        if (!streamer) {
            Logger.debug(`[SimpleGame] Default streamer ${defaultStreamerId} not found`);
            return;
        }

        const message: GameStateMessage = {
            type: 'gameStateUpdate',
            sessionId: this.sessionId,
            currentState: this.getCurrentState(),
            previousState: this.getPreviousState(),
            serverTime: new Date().toISOString(),
            triggerScene: this.getCurrentState() ? this.getCurrentState()!.name : 'idle'
        };

        streamer.sendMessage(message as BaseMessage);
        Logger.info(`[SimpleGame] Broadcasted game state to default streamer ${defaultStreamerId}`);
    }

    /**
     * Sends game state to a specific streamer
     */
    public sendGameStateToStreamer(streamerId: string): void {
        if (!this.signallingServer) {
            Logger.debug('[SimpleGame] No signalling server reference, cannot send to streamer');
            return;
        }

        const streamer = this.signallingServer.streamerRegistry.find(streamerId);

        if (!streamer) {
            Logger.debug(`[SimpleGame] Streamer ${streamerId} not found`);
            return;
        }

        const message: GameStateMessage = {
            type: 'gameStateUpdate',
            sessionId: this.sessionId,
            currentState: this.getCurrentState(),
            previousState: this.getPreviousState(),
            serverTime: new Date().toISOString(),
            triggerScene: this.getCurrentState() ? this.getCurrentState()!.name : 'idle'
        };

        streamer.sendMessage(message as BaseMessage);
        Logger.info(`[SimpleGame] Sent game state to streamer ${streamerId}`);
    }
}
