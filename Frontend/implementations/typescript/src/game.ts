// Copyright Epic Games, Inc. All Rights Reserved.

import { Config, PixelStreaming } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.7';
import { Application, PixelStreamingApplicationStyle, UIElementCreationMode } from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.7';
import { GameControls } from './GameControls';
import { DefaultGameControlsConfig } from './game-config';
import { BettingInterface } from './BettingInterface';
import { ServerListener } from './ServerListener';

export const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();
PixelStreamingApplicationStyles.applyStyleSheet();
let game: Game = null;
const sockerConfing = {
	url: "http://localhost:8081",
	autoConnect: !true
}

document.body.onload = function() {
	// Create a config object
	const config = new Config({ useUrlParams: true });

	// Create Pixel Streaming application
	const stream = new PixelStreaming(config);
	const application = new Application({
		stream,
		onColorModeChanged: (isLightMode) => PixelStreamingApplicationStyles.setColorMode(isLightMode),
		statsPanelConfig: {isEnabled: false, visibilityButtonConfig: { creationMode: UIElementCreationMode.Disable}},
		settingsPanelConfig: {isEnabled: false, visibilityButtonConfig: { creationMode: UIElementCreationMode.Disable}},
		xrControlsConfig: undefined,
		videoQpIndicatorConfig: undefined,
		hideControlsInFullscreen: true
	});
	document.getElementById("playercontainer").appendChild(application.rootElement);

    // Initialize Game Controls
    const gameControls = new GameControls(DefaultGameControlsConfig);

	game = new Game(stream, gameControls);

	const listener = new ServerListener(sockerConfing.url);

	listener.onSync = (data) => {
		console.log(`Sync: ${data.sessionId}, Step: ${data.currentStep}`);
		// Update Game object look and feel here
	};

	listener.onGameEvent = (eventName, data) => {
		console.log(`Event ${eventName}: ${data.step}`);
		// Trigger game animations or state changes
	};
	if (sockerConfing.autoConnect) {
		listener.connect();
	}

}

class Game {

	private _pixelStreaming : PixelStreaming;
    private _gameControls: GameControls;

	constructor (pixelStreaming : PixelStreaming, gameControls: GameControls) {
		this._pixelStreaming = pixelStreaming;
		this._gameControls = gameControls;
		this._createBettingControls();
	}

	private _createBettingControls() {
		const bettingUI = new BettingInterface();
        
        this._gameControls.clearContent();
        this._gameControls.addContent(bettingUI.getRootElement());
	}

}


