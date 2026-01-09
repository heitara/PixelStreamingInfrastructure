// Copyright Epic Games, Inc. All Rights Reserved.

import { AllSettings, Config, PixelStreaming } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.7';
import { Application, PixelStreamingApplicationStyle, UIElementCreationMode } from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.7';
import { GameControls } from './GameControls';
import { DefaultGameControlsConfig } from './game-config';
import { BettingInterface } from './BettingInterface';
import { ServerListener } from './ServerListener';

export const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();
PixelStreamingApplicationStyles.applyStyleSheet();
let game: Game = null;
const socketConfig = {
	url: "http://localhost:8081",
	autoConnect: true
}

document.body.onload = function() {
	const initialConfig:  Partial<AllSettings> = {};
	//set config parameters here
	initialConfig.StreamerId = 'SFU';
	initialConfig.AutoConnect = true;
	initialConfig.SuppressBrowserKeys = true;
	initialConfig.WaitForStreamer = true;
	initialConfig.KeyboardInput = false;
	initialConfig.MouseInput = false;
	initialConfig.TouchInput = false;
	initialConfig.GamepadInput = false;
	initialConfig.XRControllerInput = false;
	// Create a config object
	const config = new Config({ useUrlParams: true, initialSettings: initialConfig });



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

	game = new Game(stream, gameControls, socketConfig.url);

	const listener = new ServerListener(socketConfig.url);

	listener.onSync = (data) => {
		console.log(`Sync: ${data.sessionId}, Step: ${data.currentStep}`);
		// Update state indicator
		gameControls.updateStateIndicator(data.currentStep);
		// Enable/disable betting based on state
		game.updateBettingState(data.currentStep);
	};

	listener.onGameEvent = (eventName, data) => {
		console.log(`Event ${eventName}: ${data.step}`);
		// Update state indicator
		gameControls.updateStateIndicator(eventName);
		// Enable/disable betting based on state
		game.updateBettingState(eventName);
	};

	// Pass listener to game
	game.setServerListener(listener);

	if (socketConfig.autoConnect) {
		listener.connect();
	}

}

class Game {

	private _pixelStreaming : PixelStreaming;
    private _gameControls: GameControls;
	private _bettingUI: BettingInterface;
	private _serverListener: ServerListener | null = null;

	constructor (pixelStreaming : PixelStreaming, gameControls: GameControls, serverUrl: string) {
		this._pixelStreaming = pixelStreaming;
		this._gameControls = gameControls;
		this._createBettingControls();
	}

	private _createBettingControls() {
		this._bettingUI = new BettingInterface();
        
        this._gameControls.clearContent();
        this._gameControls.addContent(this._bettingUI.getRootElement());
	}

	public setServerListener(listener: ServerListener) {
		this._serverListener = listener;
		
		// Set up bet submission callback
		this._bettingUI.setOnSubmit((betData: any) => {
			if (this._serverListener) {
				const actionPayload = {
					type: "bet",
					bets: betData,
					timestamp: Date.now()
				};
				console.log("Sending bet to server:", actionPayload);
				this._serverListener.sendAction(actionPayload);
			}
		});
	}

	public updateBettingState(state: string) {
		// Enable betting only during "bet" state
		const isBettingAllowed = state.toLowerCase() === 'bet';
		this._bettingUI.setEnabled(isBettingAllowed);
	}

}


