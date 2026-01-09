// Copyright Epic Games, Inc. All Rights Reserved.
import { AbstractGame } from '../framework/AbstractGame';

export class SimpleGame extends AbstractGame {
    constructor() {
        super();
        this.states = [
            { name: 'start', duration: 10000, allowActions: false },
            { name: 'deal', duration: 10000, allowActions: false },
            { name: 'bet', duration: 10000, allowActions: true }, // Allow actions here
            { name: 'close', duration: 10000, allowActions: false },
            { name: 'calculate', duration: 10000, allowActions: false },
            { name: 'greet', duration: 10000, allowActions: false }
        ];
    }
}
