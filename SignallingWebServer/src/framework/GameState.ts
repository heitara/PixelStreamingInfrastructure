// Copyright Epic Games, Inc. All Rights Reserved.
import { AbstractGame } from './AbstractGame';

export interface GameState {
    name: string;
    duration: number; // Duration in milliseconds
    allowActions: boolean;

    // Optional hooks for state lifecycle
    onEnter?: (game: AbstractGame) => void;
    onExit?: (game: AbstractGame) => void;
}
