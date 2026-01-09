// Copyright Epic Games, Inc. All Rights Reserved.
import { EventEmitter } from 'events';
import { GameState } from './GameState';
import { v4 as uuidv4 } from 'uuid';

/**
 * AbstractGame serves as a base class for all game implementations.
 * It manages game states, transitions, and listens for player actions.
 */
export abstract class AbstractGame extends EventEmitter {
    protected states: GameState[] = [];
    protected currentStateIndex: number = -1;
    protected timer: NodeJS.Timeout | null = null;
    protected sessionId: string = '';
    protected stateStartTime: number = 0;

    constructor() {
        super();
    }

    public start(): void {
        if (this.timer) {
            this.stop();
        }
        this.sessionId = uuidv4();
        this.currentStateIndex = -1;
        this.nextState();
    }

    public stop(): void {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.currentStateIndex = -1;
    }

    protected nextState(): void {
        // Clean up previous state
        if (this.currentStateIndex >= 0 && this.currentStateIndex < this.states.length) {
            const prevState = this.states[this.currentStateIndex];
            if (prevState.onExit) {
                prevState.onExit(this);
            }
        }

        // Advance index
        this.currentStateIndex += 1;
        if (this.currentStateIndex >= this.states.length) {
            this.currentStateIndex = 0; // Loop back to start
        }

        const currentState = this.states[this.currentStateIndex];
        this.stateStartTime = Date.now();

        if (currentState.onEnter) {
            currentState.onEnter(this);
        }

        this.emit('stateChange', {
            sessionId: this.sessionId,
            state: currentState,
            serverTime: new Date().toISOString()
        });

        console.log(
            `[Game ${this.sessionId}] Entering state: ${currentState.name} (Duration: ${currentState.duration}ms)`
        );

        this.timer = setTimeout(() => {
            this.nextState();
        }, currentState.duration);
    }

    public handleAction(_clientId: string, _action: any): void {
        // const currentState = this.getCurrentState();
        // if (!currentState) {
        //     return;
        // }
        // if (currentState.allowActions) {
        //     console.log(`[Game ${this.sessionId}] Action received from ${clientId} in state ${currentState.name}:`, action);
        //     this.emit("playerAction", { clientId, action, state: currentState.name });
        // } else {
        //     console.log(`[Game ${this.sessionId}] Action rejected from ${clientId} (Not allowed in ${currentState.name})`);
        // }
    }

    public getCurrentState(): GameState | null {
        if (this.currentStateIndex >= 0 && this.currentStateIndex < this.states.length) {
            return this.states[this.currentStateIndex];
        }
        return null;
    }

    public getSyncData(): any {
        const currentState = this.getCurrentState();
        if (!currentState) return null;

        const elapsed = Date.now() - this.stateStartTime;
        const remaining = Math.max(0, currentState.duration - elapsed);

        return {
            sessionId: this.sessionId,
            currentState: currentState.name,
            remainingTime: remaining,
            serverTime: new Date().toISOString()
        };
    }
}
