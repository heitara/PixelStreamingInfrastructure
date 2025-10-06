// Copyright Epic Games, Inc. All Rights Reserved.

import { FullScreenIcon } from './FullscreenIcon';
import { SettingsIcon } from './SettingsIcon';
import { StatsIcon } from './StatsIcon';
import { XRIcon } from './XRIcon';
import { WebXRController } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.6';
import { UIElementConfig, UIElementCreationMode } from './UIConfigurationTypes';
import { ControlsUIConfiguration, shouldCreateButton } from './Controls';


/**
 * Element containing various controls like stats, settings, fullscreen.
 */
export class GameOverlay {
    statsIcon: StatsIcon;
    fullscreenIcon: FullScreenIcon;
    settingsIcon: SettingsIcon;
    xrIcon: XRIcon;

    _rootElement: HTMLElement;

    config?: ControlsUIConfiguration;

    /**
     * Construct the controls
     */
    constructor(config?: ControlsUIConfiguration) {
        this.config = config;
        if (!config || shouldCreateButton(config.statsButtonType)) {
            this.statsIcon = new StatsIcon();
        }
        if (!config || shouldCreateButton(config.settingsButtonType)) {
            this.settingsIcon = new SettingsIcon();
        }
        if (!config || shouldCreateButton(config.fullscreenButtonType)) {
            this.fullscreenIcon = new FullScreenIcon();
        }
        if (!config || shouldCreateButton(config.xrIconType)) {
            this.xrIcon = new XRIcon();
        }
    }

    /**
     * Get the element containing the controls.
     */
    public get rootElement(): HTMLElement {
        if (!this._rootElement) {
            this._rootElement = document.createElement('div');
            this._rootElement.id = 'controls';
            if (this.fullscreenIcon) {
                this._rootElement.appendChild(this.fullscreenIcon.rootElement);
            }
            if (this.settingsIcon) {
                this._rootElement.appendChild(this.settingsIcon.rootElement);
            }
            if (this.statsIcon) {
                this._rootElement.appendChild(this.statsIcon.rootElement);
            }
            if (this.xrIcon) {
                void WebXRController.isSessionSupported('immersive-vr').then((supported: boolean) => {
                    if (supported) {
                        this._rootElement.appendChild(this.xrIcon.rootElement);
                    }
                });
            }
            document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
        }

        return this._rootElement;
    }

    private handleFullscreenChange(): void {
        const isInFullscreen = !!document.fullscreenElement;
        if (isInFullscreen && this.config?.hideControlsInFullscreen) {
            this._rootElement.style.visibility = 'hidden';
        } else {
            this._rootElement.style.visibility = 'visible';
        }
    }
}
