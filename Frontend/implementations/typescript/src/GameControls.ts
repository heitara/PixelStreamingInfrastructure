import { GameControlsConfig } from './game-config';

export class GameControls {
    private element: HTMLElement;
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

        this.init();
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
