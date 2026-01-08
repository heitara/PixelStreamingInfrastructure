// Copyright Epic Games, Inc. All Rights Reserved.

import { Config, PixelStreaming } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.7';
import { Application, PixelStreamingApplicationStyle, UIElementCreationMode } from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.7';
import { GameControls } from './GameControls';
import { DefaultGameControlsConfig } from './game-config';
import { BettingInterface } from './BettingInterface';

export const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();
PixelStreamingApplicationStyles.applyStyleSheet();
let game: Game = null;


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


