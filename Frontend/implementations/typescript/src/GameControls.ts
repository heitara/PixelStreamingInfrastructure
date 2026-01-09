import { GameControlsConfig } from './game-config';

export class GameControls {
    private element: HTMLElement;
    private stateIndicator: HTMLElement;
    private config: GameControlsConfig;
    private isDragging: boolean = false;
    private dragStartX: number = 0;
    private dragStartY: number = 0;
    private initialLeft: number = 0;
    private initialTop: number = 0;

    constructor(config: GameControlsConfig) {
        this.config = config;
        this.element = document.getElementById('gamecontrol') as HTMLElement;

        if (!this.element) {
            console.error('Game controls element not found!');
            return;
        }

        this.createStateIndicator();
        this.init();
    }

    private createStateIndicator() {
        this.stateIndicator = document.createElement('div');
        this.stateIndicator.className = 'game-state-indicator';
        this.stateIndicator.style.position = 'absolute';
        this.stateIndicator.style.top = '10px';
        this.stateIndicator.style.left = '10px';
        this.stateIndicator.style.padding = '8px 16px';
        this.stateIndicator.style.borderRadius = '4px';
        this.stateIndicator.style.fontWeight = 'bold';
        this.stateIndicator.style.fontSize = '14px';
        this.stateIndicator.style.textTransform = 'uppercase';
        this.stateIndicator.style.backgroundColor = '#666';
        this.stateIndicator.style.color = '#fff';
        this.stateIndicator.style.zIndex = '1000';
        this.stateIndicator.innerText = 'WAITING...';
        this.element.appendChild(this.stateIndicator);
    }

    /**
     * Updates the game state indicator with the current state.
     * @param state - The current game state name.
     */
    public updateStateIndicator(state: string) {
        this.stateIndicator.innerText = state.toUpperCase();
        
        // Green for bet state, grey for others
        if (state.toLowerCase() === 'bet') {
            this.stateIndicator.style.backgroundColor = '#28a745';
        } else {
            this.stateIndicator.style.backgroundColor = '#666';
        }
    }

    private init() {
        // Apply initial configuration
        this.updatePosition(this.config.top, this.config.left);

        // Check for development mode
        // @ts-ignore
        if (process.env.NODE_ENV === 'development') {
            this.enableDrag();
            this.element.style.cursor = 'move';
            this.element.title = 'Drag to reposition (Dev Mode)';
        }
    }

    private updatePosition(topPercent: number, leftPercent: number) {
        this.element.style.top = `${topPercent}%`;
        this.element.style.left = `${leftPercent}%`;
    }

    private enableDrag() {
        this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    public clearContent() {
        this.element.innerHTML = '';
    }

    public addContent(content: HTMLElement) {
        console.log('Adding content to Game Controls');
        this.element.appendChild(content);
        this.element.appendChild(this.stateIndicator); // Re-add state indicator on top
    }

    private onMouseDown(event: MouseEvent) {
        this.isDragging = true;
        
        // Calculate offset from the element's top-left corner
        const rect = this.element.getBoundingClientRect();
        this.dragStartX = event.clientX - rect.left;
        this.dragStartY = event.clientY - rect.top;

        event.preventDefault(); // Prevent text selection
    }

    private onMouseMove(event: MouseEvent) {
        if (!this.isDragging) return;

        const parent = this.element.parentElement;
        if (!parent) return;

        const parentRect = parent.getBoundingClientRect();
        
        // Calculate new position in pixels relative to parent
        // event.clientX is viewport x. 
        // parentRect.left is parent's viewport x.
        // this.dragStartX is the offset within the element.
        // So: (Mouse Viewport X) - (Parent Viewport X) - (Offset within Element)
        let newLeftPx = event.clientX - parentRect.left - this.dragStartX;
        let newTopPx = event.clientY - parentRect.top - this.dragStartY;

        // Convert to percentage for responsive positioning
        const newLeftPercent = (newLeftPx / parentRect.width) * 100;
        const newTopPercent = (newTopPx / parentRect.height) * 100;

        this.updatePosition(newTopPercent, newLeftPercent);
    }

    private onMouseUp(event: MouseEvent) {
        if (!this.isDragging) return;
        this.isDragging = false;

        // Calculate final position for config
        const parent = this.element.parentElement;
        if (!parent) return;

        const rect = this.element.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();

        const finalLeft = ((rect.left - parentRect.left) / parentRect.width) * 100;
        const finalTop = ((rect.top - parentRect.top) / parentRect.height) * 100;

        console.log('--- Game Controls Position Updated ---');
        console.log(`Copy this to src/game-config.ts:`);
        console.log(JSON.stringify({
            top: Number(finalTop.toFixed(2)),
            left: Number(finalLeft.toFixed(2))
        }, null, 4));
        console.log('--------------------------------------');
    }
}
