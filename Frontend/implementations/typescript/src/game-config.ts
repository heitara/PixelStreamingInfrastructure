export interface GameControlsConfig {
    /** Initial top position in percentage (0-100) */
    top: number;
    /** Initial left position in percentage (0-100) */
    left: number;
}

export const DefaultGameControlsConfig: GameControlsConfig = {
    top: 10,
    left: 10
};
