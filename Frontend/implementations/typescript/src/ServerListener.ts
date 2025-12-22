// Copyright Emil Atanasov, Inc. All Rights Reserved.

import { io, Socket } from "socket.io-client";

/**
 * Data structure for the 'sync' event.
 * Contains information about the current session state and timing.
 */
export interface SyncData {
    sessionId: string;
    currentStep: string;
    nextEventName: string;
    nextEventIn: number;
    serverTime: string;
}

/**
 * Data structure for the 'nosession' event.
 * Contains an informational message when no session is active.
 */
export interface NoSessionData {
    message: string;
}

/**
 * Data structure for game lifecycle events (start, deal, bet, etc.).
 * Contains session identification and the current step.
 */
export interface GameEventData {
    sessionId: string;
    step: string;
    serverTime: string;
}

/**
 * Callback definition for handling sync events.
 */
export type SyncCallback = (data: SyncData) => void;

/**
 * Callback definition for handling no-session events.
 */
export type NoSessionCallback = (data: NoSessionData) => void;

/**
 * Callback definition for handling generic game events.
 * @param eventName - The name of the event (e.g., "start", "deal").
 * @param data - The data associated with the event.
 */
export type GameEventCallback = (eventName: string, data: GameEventData) => void;

/**
 * ServerListener
 * 
 * Encapsulates the logic for listening to game server events via WebSockets (Socket.IO).
 * It connects to a specified URL and dispatches events to registered callbacks.
 * This allows the "Game" object to alter its look and feel based on the broadcasted information.
 */
export class ServerListener {
    private socket: Socket;
    private url: string;

    // Public callbacks that can be assigned by the consumer
    public onSync?: SyncCallback;
    public onNoSession?: NoSessionCallback;
    public onGameEvent?: GameEventCallback;

    /**
     * Creates an instance of ServerListener.
     * @param url - The URL of the game server to connect to. Defaults to "http://localhost:8081".
     */
    constructor(url: string = "http://localhost:8081") {
        this.url = url;
        // Initialize the socket but do not connect automatically until connect() is called
        // or we can let it auto-connect if preferred. Here we use autoConnect: false for control.
        this.socket = io(this.url, {
            autoConnect: false
        });

        this.setupListeners();
    }

    /**
     * Sets up the internal socket event listeners.
     */
    private setupListeners() {
        this.socket.on("connect", () => {
            console.log(`[ServerListener] Connected to game server at ${this.url}`);
        });

        this.socket.on("connect_error", (err) => {
            console.error(`[ServerListener] Connection error: ${err.message}`);
        });

        this.socket.on("disconnect", () => {
            console.log("[ServerListener] Disconnected from game server");
        });

        // Handle 'sync' event
        this.socket.on("sync", (data: SyncData) => {
            if (this.onSync) {
                this.onSync(data);
            }
        });

        // Handle 'nosession' event
        this.socket.on("nosession", (data: NoSessionData) => {
            if (this.onNoSession) {
                this.onNoSession(data);
            }
        });

        // Handle specific game lifecycle events
        const eventNames = ["start", "deal", "bet", "close", "calculate", "greet"];
        eventNames.forEach(eventName => {
            this.socket.on(eventName, (data: GameEventData) => {
                if (this.onGameEvent) {
                    this.onGameEvent(eventName, data);
                }
            });
        });
    }

    /**
     * Establishes the connection to the game server.
     */
    public connect() {
        if (!this.socket.connected) {
            this.socket.connect();
        }
    }

    /**
     * Disconnects from the game server.
     */
    public disconnect() {
        if (this.socket.connected) {
            this.socket.disconnect();
        }
    }
}
