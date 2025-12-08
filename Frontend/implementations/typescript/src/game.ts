// Copyright Epic Games, Inc. All Rights Reserved.

import { Config, PixelStreaming } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.7';
import { Application, PixelStreamingApplicationStyle } from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.7';
import { GameControls } from './GameControls';
import { DefaultGameControlsConfig } from './game-config';

export const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();
PixelStreamingApplicationStyles.applyStyleSheet();


document.body.onload = function() {
	// Create a config object
	const config = new Config({ useUrlParams: true });

	// Create Pixel Streaming application
	const stream = new PixelStreaming(config);
	const application = new Application({
		stream,
		onColorModeChanged: (isLightMode) => PixelStreamingApplicationStyles.setColorMode(isLightMode)
	});
	document.getElementById("playercontainer").appendChild(application.rootElement);

    // Initialize Game Controls
    new GameControls(DefaultGameControlsConfig);

	const game = new Game(stream);

	// Bind example selection to the onExampleChanged function
	document.getElementById("exampleSelect").onchange = (event : Event) => { game.onExampleChanged(event); };
}

class Game {

	private _pixelStreaming : PixelStreaming;
	private _exampleSettingsElem : HTMLElement;

	constructor (pixelStreaming : PixelStreaming) {
		this._pixelStreaming = pixelStreaming;
		this._exampleSettingsElem = document.getElementById("sidebarContent") as HTMLElement;
		this._createGettingStartedExample();
	}

	/**
	 * Event fired for when the selection drop down containing our showcase examples changes.
	 * @param event The change event.
	 */
	onExampleChanged(event : Event) : void {

		if(!event) { return; }

		const selectElement = event.target as HTMLSelectElement;
		const exampleName = selectElement.value;
		this._createExample(exampleName);
	}

	private _createExample(exampleName : string) {

		// clear example elements
		while (this._exampleSettingsElem.lastElementChild) {
			this._exampleSettingsElem.removeChild(this._exampleSettingsElem.lastElementChild);
		}

		// create the relevant example based on the string passed in
		switch(exampleName) {
			case "Send Data to UE":
				this._createSendUEDataExample();
				break;
			case "Getting Started":
				this._createGettingStartedExample();
				break;
			case "Send Commands to UE":
				this._createUECommandExample();
				break;
			default:
				break;
		}
	}

	private _onCharacterClicked(characterName : string) {
		this._pixelStreaming.emitUIInteraction({ Character: characterName });
	}

	private _onSkinClicked(skinIndex : number) {
		this._pixelStreaming.emitUIInteraction({ Skin: skinIndex });
	}

	private _onResClicked(width : number, height : number) {
		this._pixelStreaming.emitCommand({ Resolution: { Width: width, Height: height } });
	}

	private _createGettingStartedExample() {

	}

	private _createSendUEDataExample() {

		const characterSelectElem = document.createElement("div");
		this._exampleSettingsElem.appendChild(characterSelectElem);

		const sendDataTitle = document.createElement("h2");
		sendDataTitle.innerText = "Send data: ";
		characterSelectElem.appendChild(sendDataTitle);

		const characterSelectTitle = document.createElement("p");
		characterSelectTitle.innerText = "Select a character: ";
		characterSelectElem.appendChild(characterSelectTitle);

		// Make Aurora character
		const auroraElem = document.createElement("div");
		characterSelectElem.appendChild(auroraElem);
		const auroraImg = document.createElement("img");
		auroraImg.classList.add("characterBtn");
		auroraImg.src = "./images/Aurora.jpg";
		auroraImg.onclick = () => { this._onCharacterClicked("Aurora"); }
		auroraElem.appendChild(auroraImg);

		// Make Crunch character
		const crunchElem = document.createElement("div");
		characterSelectElem.appendChild(crunchElem);
		const crunchImg = document.createElement("img");
		crunchImg.classList.add("characterBtn");
		crunchImg.src = "./images/Crunch.jpg";
		crunchImg.onclick = () => { this._onCharacterClicked("Crunch"); }
		crunchElem.appendChild(crunchImg);

		// Make skin selection title
		const skinSelectTitle = document.createElement("p");
		skinSelectTitle.innerText = "Select a skin: ";
		this._exampleSettingsElem.appendChild(skinSelectTitle);

		// Make skin selection
		const skinSelectElem = document.createElement("div");
		skinSelectElem.classList.add("spaced-row");
		this._exampleSettingsElem.appendChild(skinSelectElem);

		// Make skin selection buttons

		// Skin1
		const skin1Btn = document.createElement("button");
		skin1Btn.classList.add("btn-flat");
		skin1Btn.onclick = () => { this._onSkinClicked(0); }
		skin1Btn.innerText = "Skin 1";
		skinSelectElem.appendChild(skin1Btn);

		// Skin2
		const skin2Btn = document.createElement("button");
		skin2Btn.classList.add("btn-flat");
		skin2Btn.onclick = () => { this._onSkinClicked(1); }
		skin2Btn.innerText = "Skin 2";
		skinSelectElem.appendChild(skin2Btn);

		// Skin3
		const skin3Btn = document.createElement("button");
		skin3Btn.classList.add("btn-flat");
		skin3Btn.onclick = () => { this._onSkinClicked(2); }
		skin3Btn.innerText = "Skin 3";
		skinSelectElem.appendChild(skin3Btn);
	}

	private _createUECommandExample() {

		// Add a new element for containing elements for res changing feature
		const changeResElem = document.createElement("div");
		this._exampleSettingsElem.appendChild(changeResElem);

		// Make res change title
		const changeResTitle = document.createElement("h2");
		changeResTitle.innerText = "Send a custom command: ";
		changeResElem.appendChild(changeResTitle);

		// Make change resolution text
		const changeResText = document.createElement("p");
		changeResText.innerHTML = "Change resolution"
		changeResElem.appendChild(changeResText);

		// Make res change button container
		const changeResBtnContainer = document.createElement("div");
		changeResBtnContainer.classList.add("spaced-row");
		this._exampleSettingsElem.appendChild(changeResBtnContainer);

		// Make res change buttons

		// 720p
		const res720pBtn = document.createElement("button");
		res720pBtn.classList.add("btn-flat");
		res720pBtn.onclick = () => { this._onResClicked(1280, 720); }
		res720pBtn.innerText = "720p";
		changeResBtnContainer.appendChild(res720pBtn);

		// 1080p
		const res1080pBtn = document.createElement("button");
		res1080pBtn.classList.add("btn-flat");
		res1080pBtn.onclick = () => { this._onResClicked(1920, 1080); }
		res1080pBtn.innerText = "1080p";
		changeResBtnContainer.appendChild(res1080pBtn);

		// 1440p
		const res1440pBtn = document.createElement("button");
		res1440pBtn.classList.add("btn-flat");
		res1440pBtn.onclick = () => { this._onResClicked(2560, 1440); }
		res1440pBtn.innerText = "1440p";
		changeResBtnContainer.appendChild(res1440pBtn);

		// 4k
		const res4kBtn = document.createElement("button");
		res4kBtn.classList.add("btn-flat");
		res4kBtn.onclick = () => { this._onResClicked(3840, 2160); }
		res4kBtn.innerText = "4k";
		changeResBtnContainer.appendChild(res4kBtn);

		// Add a new element for containing elements for res changing feature
		const consoleCommandElem = document.createElement("div");
		this._exampleSettingsElem.appendChild(consoleCommandElem);

		// Make console command title
		const consoleCommandTitle = document.createElement("h2");
		consoleCommandTitle.innerText = "Send a console command: ";
		consoleCommandElem.appendChild(consoleCommandTitle);

		// Text informing using about -AllowPixelStreamingCommands
		const informPSCommandsText = document.createElement("p");
		informPSCommandsText.innerHTML = "(Requires UE side launched with <code>-AllowPixelStreamingCommands</code>)"
		consoleCommandElem.appendChild(informPSCommandsText);

		// Make buttons for stat fps/stat gpu
		const consoleCmdBtnsContainer = document.createElement("div");
		consoleCmdBtnsContainer.classList.add("spaced-row");
		this._exampleSettingsElem.appendChild(consoleCmdBtnsContainer);

		// stat fps
		const statfpsBtn = document.createElement("button");
		statfpsBtn.classList.add("btn-flat");
		statfpsBtn.onclick = () => { this._pixelStreaming.emitConsoleCommand("stat fps"); }
		statfpsBtn.innerText = "stat fps";
		consoleCmdBtnsContainer.appendChild(statfpsBtn);

		// stat pixelstreaming
		const statgpuBtn = document.createElement("button");
		statgpuBtn.classList.add("btn-flat");
		statgpuBtn.onclick = () => { this._pixelStreaming.emitConsoleCommand("stat pixelstreaming"); this._pixelStreaming.emitConsoleCommand("stat pixelstreaming2"); }
		statgpuBtn.innerText = "stat pixelstreaming";
		consoleCmdBtnsContainer.appendChild(statgpuBtn);

		//stat pixelStreamingGraphs
		const statGraphBtn = document.createElement("button");
		statGraphBtn.classList.add("btn-flat");
		statGraphBtn.onclick = () => { this._pixelStreaming.emitConsoleCommand("stat pixelstreaminggraphs"); this._pixelStreaming.emitConsoleCommand("stat pixelstreaming2graphs"); }
		statGraphBtn.innerText = "stat pixelstreaminggraphs";
		consoleCmdBtnsContainer.appendChild(statGraphBtn);

	}

}


