export class BettingInterface {
    
    private rootElement: HTMLElement;
    private balanceElement: HTMLElement;
    private betButton: HTMLButtonElement;
    private selectedChipValue: number = 1;
    private balance: number = 1000.00;
    private currentBets: Map<string, number> = new Map();
    private lastBets: Map<string, number> = new Map();
    private onSubmitCallback?: (betData: any) => void;
    
    private chipValues = [0.10, 0.20, 0.50, 1, 5, 25, 100, 500, 2500];
    private ticketTypes = ['1', '2', 'Bonus', 'Pachinko', '5', '10', 'Cash Hunt', 'Crazy Time'];

    constructor() {
        this.rootElement = document.createElement("div");
        this.rootElement.className = "betting-container";
        this.balanceElement = document.createElement("span");
        this.buildUI();
        this.updateBalanceUI();
    }

    public getRootElement(): HTMLElement {
        return this.rootElement;
    }

    private buildUI() {
        // 1. Header with Balance
        const header = document.createElement("div");
        header.className = "balance-header";
        
        const label = document.createElement("div");
        label.className = "balance-label";
        label.innerText = "CURRENT BALANCE";
        
        this.balanceElement.className = "balance-value";
        // Initial balance text set in updateBalanceUI

        header.appendChild(label);
        header.appendChild(this.balanceElement);
        this.rootElement.appendChild(header);

        // 2. Ticket Grid
        const grid = document.createElement("div");
        grid.className = "ticket-grid";
        
        this.ticketTypes.forEach(ticket => {
            const ticketBtn = document.createElement("button");
            ticketBtn.className = "ticket-card";
            ticketBtn.dataset['ticket'] = ticket;
            
            // Ticket Label
            const ticketFuncProps = document.createElement("div");
            ticketFuncProps.innerText = ticket;
            
            // Bet Value Badge
            const valueBadge = document.createElement("div");
            valueBadge.className = "ticket-value";
            valueBadge.innerText = "0";
            valueBadge.style.display = "none";

            ticketBtn.appendChild(ticketFuncProps);
            ticketBtn.appendChild(valueBadge);
            
            ticketBtn.onclick = () => this.placeBet(ticket);
            grid.appendChild(ticketBtn);
        });
        
        this.rootElement.appendChild(grid);

        // 3. Chip Control Row
        const controls = document.createElement("div");
        controls.className = "chip-controls";

        // Chips
        this.chipValues.forEach(val => {
            const chipBtn = document.createElement("button");
            chipBtn.className = "chip-btn";
            chipBtn.dataset['value'] = val.toString();
            if (val === this.selectedChipValue) chipBtn.classList.add("selected");
            chipBtn.innerText = val.toString();
            chipBtn.onclick = () => this.selectChip(val, chipBtn);
            controls.appendChild(chipBtn);
        });

        // Repeat Button
        const repeatBtn = document.createElement("button");
        repeatBtn.className = "action-btn";
        repeatBtn.innerText = "Repeat";
        repeatBtn.onclick = () => this.repeatLastBet();
        controls.appendChild(repeatBtn);

        // Reset Button
        const resetBtn = document.createElement("button");
        resetBtn.className = "action-btn";
        resetBtn.innerText = "Reset";
        resetBtn.title = "Clear board";
        resetBtn.onclick = () => this.resetCurrentBets();
        controls.appendChild(resetBtn);

        // Bet Button
        this.betButton = document.createElement("button");
        this.betButton.className = "action-btn";
        this.betButton.innerText = "Bet";
        this.betButton.onclick = () => this.submitBet();
        controls.appendChild(this.betButton);

        this.rootElement.appendChild(controls);
    }

    private selectChip(value: number, btnElement: HTMLElement) {
        this.selectedChipValue = value;
        // Update UI selection state
        const allChips = this.rootElement.querySelectorAll(".chip-btn");
        allChips.forEach(c => c.classList.remove("selected"));
        btnElement.classList.add("selected");
    }

    private placeBet(ticket: string) {
        if (this.balance < this.selectedChipValue) {
            alert("Insufficient funds!");
            return;
        }

        this.balance -= this.selectedChipValue;
        
        const currentVal = this.currentBets.get(ticket) || 0;
        const newVal = currentVal + this.selectedChipValue;
        this.currentBets.set(ticket, newVal);
        
        this.updateTicketUI(ticket, newVal);
        this.updateBalanceUI();
    }

    private updateTicketUI(ticket: string, value: number) {
        // Find the specific ticket element
        const ticketBtn = Array.from(this.rootElement.querySelectorAll(".ticket-card"))
            .find(el => (el as HTMLElement).dataset['ticket'] === ticket) as HTMLElement;

        if (ticketBtn) {
            const badge = ticketBtn.querySelector(".ticket-value") as HTMLElement;
            // Format to reasonable decimals
            badge.innerText = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);
            badge.style.display = value > 0 ? "flex" : "none";
        }
    }

    private updateBalanceUI() {
        this.balanceElement.innerText = "$" + this.balance.toFixed(2);
        
        // Update chip availability
        const chips = this.rootElement.querySelectorAll(".chip-btn");
        chips.forEach((el) => {
            const chipBtn = el as HTMLButtonElement;
            const val = parseFloat(chipBtn.dataset['value'] || "0");
            chipBtn.disabled = val > this.balance;
        });
    }

    private repeatLastBet() {
        if (this.lastBets.size === 0) {
            alert("No previous bets to repeat.");
            return;
        }

        // Calculate total cost
        let totalCost = 0;
        this.lastBets.forEach((val) => totalCost += val);

        if (totalCost > this.balance) {
            alert(`Insufficient funds to repeat bets (Cost: $${totalCost.toFixed(2)})`);
            return;
        }

        // Apply bets
        // Assuming Repeat REPLACES current state? Or ADDS?
        // Usually "Repeat" button in casinos places the same chips again.
        // If the board is empty, it populates it. If it's not, it adds to it.
        // I will just add to current.
        
        this.lastBets.forEach((amount, ticket) => {
            // Deduct balance
            this.balance -= amount;
            
            // Add to ticket
            const currentVal = this.currentBets.get(ticket) || 0;
            const newVal = currentVal + amount;
            this.currentBets.set(ticket, newVal);
            
            this.updateTicketUI(ticket, newVal);
        });

        this.updateBalanceUI();
    }

    // Call this to submit the bet
    public submitBet() {
        if (this.currentBets.size === 0) {
            alert("No bets placed to submit.");
            return;
        }
        
        // Log the actual "bet object" - all positions and stakes
        const betObject = Object.fromEntries(this.currentBets);
        console.log("Bet Submitted:", betObject);

        // Send to server if callback is set
        if (this.onSubmitCallback) {
            this.onSubmitCallback(betObject);
        }

        // Save history for Repeat
        this.lastBets = new Map(this.currentBets);
        this.currentBets.clear();
    }

    /**
     * Sets the callback function to be called when a bet is submitted.
     * @param callback - Function that receives the bet data object.
     */
    public setOnSubmit(callback: (betData: any) => void) {
        this.onSubmitCallback = callback;
    }

    /**
     * Enables or disables the bet submission button based on game state.
     * Users can still prepare bets, but cannot submit them when disabled.
     * @param enabled - Whether betting is currently allowed.
     */
    public setEnabled(enabled: boolean) {
        this.betButton.disabled = !enabled;
        if (!enabled) {
            this.betButton.title = "Betting is only allowed during the BET phase";
        } else {
            this.betButton.title = "";
        }
    }

    // Call this to reset/clear current bets (if not submitted, though we don't track state yet)
    public resetCurrentBets() {
        // Refund bets to balance
        let refundAmount = 0;
        this.currentBets.forEach((amount) => {
            refundAmount += amount;
        });
        
        this.balance += refundAmount;
        this.currentBets.clear();
        
        this.updateBalanceUI();

        // Reset UI tickets
        this.rootElement.querySelectorAll(".ticket-value").forEach((el: HTMLElement) => {
            el.innerText = "0"; 
            el.style.display = "none";
        });
    }
}
