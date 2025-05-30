class ScientificCalculator {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.memory = 0;
        this.history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
        this.lastAnswer = 0;
        this.parenthesesCount = 0;
        this.angleMode = 'deg'; // 'deg' or 'rad'
        this.theme = localStorage.getItem('calculatorTheme') || 'dark';
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateDisplay();
        this.updateHistory();
        this.updateMemoryIndicator();
        this.updateAngleMode();
        this.setTheme(this.theme);
    }

    initializeElements() {
        this.currentOperandElement = document.getElementById('currentOperand');
        this.previousOperandElement = document.getElementById('previousOperand');
        this.memoryIndicator = document.getElementById('memoryIndicator');
        this.historyPanel = document.getElementById('historyPanel');
        this.historyList = document.getElementById('historyList');
        this.historyToggle = document.getElementById('historyToggle');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.angleModeElement = document.getElementById('angleMode');
        this.themeToggle = document.getElementById('themeToggle');
        this.degRadToggle = document.getElementById('degRadToggle');
    }

    attachEventListeners() {
        // Button click events
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-number]')) {
                this.inputNumber(e.target.dataset.number);
            }
            
            if (e.target.matches('[data-operator]')) {
                this.inputOperator(e.target.dataset.operator);
            }
            
            if (e.target.matches('[data-action]')) {
                this.handleAction(e.target.dataset.action);
            }
            
            if (e.target.matches('[data-function]')) {
                this.handleFunction(e.target.dataset.function);
            }
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });

        // History toggle
        this.historyToggle.addEventListener('click', () => {
            this.toggleHistory();
        });

        // Clear history
        this.clearHistoryBtn.addEventListener('click', () => {
            this.clearHistory();
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Click outside to close history
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.history-panel') && 
                !e.target.closest('.history-toggle') && 
                this.historyPanel.classList.contains('active')) {
                this.toggleHistory();
            }
        });
    }

    handleKeyboard(e) {
        e.preventDefault();
        
        const key = e.key;
        
        // Numbers
        if (/[0-9]/.test(key)) {
            this.inputNumber(key);
        }
        
        // Operators
        else if (['+', '-', '*', '/'].includes(key)) {
            this.inputOperator(key);
        }
        
        // Decimal point
        else if (key === '.') {
            this.handleAction('decimal');
        }
        
        // Enter or equals
        else if (key === 'Enter' || key === '=') {
            this.handleAction('equals');
        }
        
        // Backspace
        else if (key === 'Backspace') {
            this.handleFunction('backspace');
        }
        
        // Clear
        else if (key === 'Escape') {
            this.handleAction('all-clear');
        }
        
        // Delete
        else if (key === 'Delete') {
            this.handleAction('clear');
        }
        
        // Parentheses
        else if (key === '(' || key === ')') {
            this.handleFunction('parenthesis');
        }
        
        // Scientific functions
        else if (key.toLowerCase() === 's') {
            this.handleFunction('sin');
        }
        else if (key.toLowerCase() === 'c') {
            this.handleFunction('cos');
        }
        else if (key.toLowerCase() === 't') {
            this.handleFunction('tan');
        }
        else if (key.toLowerCase() === 'l') {
            this.handleFunction('log');
        }
        else if (key.toLowerCase() === 'n') {
            this.handleFunction('ln');
        }
        else if (key.toLowerCase() === 'r') {
            this.handleFunction('sqrt');
        }
        else if (key === '^') {
            this.handleFunction('power');
        }
        else if (key === '!') {
            this.handleFunction('factorial');
        }
        else if (key.toLowerCase() === 'p') {
            this.handleFunction('pi');
        }
        else if (key.toLowerCase() === 'e') {
            this.handleFunction('e');
        }
    }

    inputNumber(number) {
        if (this.waitingForOperand) {
            this.currentOperand = number;
            this.waitingForOperand = false;
        } else {
            this.currentOperand = this.currentOperand === '0' ? number : this.currentOperand + number;
        }
        this.updateDisplay();
    }

    inputOperator(nextOperator) {
        const inputValue = parseFloat(this.currentOperand);

        if (this.previousOperand === '') {
            this.previousOperand = this.currentOperand;
        } else if (this.operation) {
            const currentValue = this.previousOperand || 0;
            const newValue = this.calculate(currentValue, inputValue, this.operation);

            this.currentOperand = String(newValue);
            this.previousOperand = this.currentOperand;
        }

        this.waitingForOperand = true;
        this.operation = nextOperator;
        this.updateDisplay();
    }

    handleAction(action) {
        switch (action) {
            case 'all-clear':
                this.allClear();
                break;
            case 'clear':
                this.clear();
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'equals':
                this.performCalculation();
                break;
            case 'memory-clear':
                this.memoryClear();
                break;
            case 'memory-recall':
                this.memoryRecall();
                break;
            case 'memory-store':
                this.memoryStore();
                break;
            case 'memory-add':
                this.memoryAdd();
                break;
            case 'memory-subtract':
                this.memorySubtract();
                break;
        }
    }

    handleFunction(func) {
        const currentValue = parseFloat(this.currentOperand);

        switch (func) {
            case 'sin':
                this.currentOperand = String(Math.sin(this.toRadians(currentValue)));
                break;
            case 'cos':
                this.currentOperand = String(Math.cos(this.toRadians(currentValue)));
                break;
            case 'tan':
                this.currentOperand = String(Math.tan(this.toRadians(currentValue)));
                break;
            case 'asin':
                if (currentValue < -1 || currentValue > 1) {
                    this.showError('Invalid input for arcsin');
                    return;
                }
                this.currentOperand = String(this.fromRadians(Math.asin(currentValue)));
                break;
            case 'acos':
                if (currentValue < -1 || currentValue > 1) {
                    this.showError('Invalid input for arccos');
                    return;
                }
                this.currentOperand = String(this.fromRadians(Math.acos(currentValue)));
                break;
            case 'atan':
                this.currentOperand = String(this.fromRadians(Math.atan(currentValue)));
                break;
            case 'log':
                if (currentValue <= 0) {
                    this.showError('Invalid input for logarithm');
                    return;
                }
                this.currentOperand = String(Math.log10(currentValue));
                break;
            case 'ln':
                if (currentValue <= 0) {
                    this.showError('Invalid input for natural logarithm');
                    return;
                }
                this.currentOperand = String(Math.log(currentValue));
                break;
            case 'sqrt':
                if (currentValue < 0) {
                    this.showError('Invalid input for square root');
                    return;
                }
                this.currentOperand = String(Math.sqrt(currentValue));
                break;
            case 'square':
                this.currentOperand = String(Math.pow(currentValue, 2));
                break;
            case 'power':
                this.inputOperator('^');
                return;
            case 'factorial':
                if (currentValue < 0 || !Number.isInteger(currentValue)) {
                    this.showError('Factorial only works with non-negative integers');
                    return;
                }
                this.currentOperand = String(this.factorial(currentValue));
                break;
            case 'pi':
                this.currentOperand = String(Math.PI);
                break;
            case 'e':
                this.currentOperand = String(Math.E);
                break;
            case 'negate':
                this.currentOperand = String(-currentValue);
                break;
            case 'backspace':
                this.backspace();
                return;
            case 'ans':
                this.currentOperand = String(this.lastAnswer);
                break;
            case 'parenthesis':
                this.handleParenthesis();
                return;
            case 'deg-rad':
                this.toggleAngleMode();
                return;
            case 'percent':
                this.currentOperand = String(currentValue / 100);
                break;
        }

        this.waitingForOperand = true;
        this.updateDisplay();
    }

    toRadians(degrees) {
        return this.angleMode === 'deg' ? degrees * (Math.PI / 180) : degrees;
    }

    fromRadians(radians) {
        return this.angleMode === 'deg' ? radians * (180 / Math.PI) : radians;
    }

    factorial(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    handleParenthesis() {
        // Simple parenthesis handling - toggle between opening and closing
        if (this.parenthesesCount > 0) {
            this.currentOperand += ')';
            this.parenthesesCount--;
        } else {
            this.currentOperand += '(';
            this.parenthesesCount++;
        }
        this.updateDisplay();
    }

    backspace() {
        if (this.currentOperand.length > 1) {
            this.currentOperand = this.currentOperand.slice(0, -1);
        } else {
            this.currentOperand = '0';
        }
        this.updateDisplay();
    }

    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentOperand = '0.';
            this.waitingForOperand = false;
        } else if (this.currentOperand.indexOf('.') === -1) {
            this.currentOperand += '.';
        }
        this.updateDisplay();
    }

    allClear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.parenthesesCount = 0;
        this.updateDisplay();
    }

    clear() {
        this.currentOperand = '0';
        this.updateDisplay();
    }

    performCalculation() {
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        const expression = `${this.previousOperand} ${this.getOperatorSymbol(this.operation)} ${this.currentOperand}`;
        const result = this.calculate(prev, current, this.operation);

        this.addToHistory(expression, result);
        this.lastAnswer = result;
        this.currentOperand = String(result);
        this.previousOperand = '';
        this.operation = null;
        this.waitingForOperand = true;
        this.updateDisplay();
    }

    calculate(firstOperand, secondOperand, operation) {
        switch (operation) {
            case '+':
                return firstOperand + secondOperand;
            case '-':
                return firstOperand - secondOperand;
            case '*':
                return firstOperand * secondOperand;
            case '/':
                if (secondOperand === 0) {
                    this.showError('Cannot divide by zero');
                    return firstOperand;
                }
                return firstOperand / secondOperand;
            case '^':
                return Math.pow(firstOperand, secondOperand);
            default:
                return secondOperand;
        }
    }

    getOperatorSymbol(operation) {
        const symbols = {
            '+': '+',
            '-': '-',
            '*': '×',
            '/': '÷',
            '^': '^'
        };
        return symbols[operation] || operation;
    }

    // Memory functions
    memoryClear() {
        this.memory = 0;
        this.updateMemoryIndicator();
    }

    memoryRecall() {
        this.currentOperand = String(this.memory);
        this.waitingForOperand = true;
        this.updateDisplay();
    }

    memoryStore() {
        this.memory = parseFloat(this.currentOperand);
        this.updateMemoryIndicator();
    }

    memoryAdd() {
        this.memory += parseFloat(this.currentOperand);
        this.updateMemoryIndicator();
    }

    memorySubtract() {
        this.memory -= parseFloat(this.currentOperand);
        this.updateMemoryIndicator();
    }

    updateMemoryIndicator() {
        if (this.memory !== 0) {
            this.memoryIndicator.classList.add('active');
        } else {
            this.memoryIndicator.classList.remove('active');
        }
    }

    // History functions
    addToHistory(expression, result) {
        const historyItem = {
            expression,
            result: this.formatNumber(result),
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.history.unshift(historyItem);
        
        // Keep only last 50 calculations
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        this.saveHistory();
        this.updateHistory();
    }

    updateHistory() {
        this.historyList.innerHTML = '';
        
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<div class="no-history">No calculations yet</div>';
            return;
        }
        
        this.history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">= ${item.result}</div>
            `;
            
            historyItem.addEventListener('click', () => {
                this.currentOperand = String(parseFloat(item.result));
                this.waitingForOperand = true;
                this.updateDisplay();
                this.toggleHistory();
            });
            
            this.historyList.appendChild(historyItem);
        });
    }

    toggleHistory() {
        this.historyPanel.classList.toggle('active');
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.updateHistory();
    }

    saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    }

    // Theme functions
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(this.theme);
        localStorage.setItem('calculatorTheme', this.theme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // Angle mode functions
    toggleAngleMode() {
        this.angleMode = this.angleMode === 'deg' ? 'rad' : 'deg';
        this.updateAngleMode();
    }

    updateAngleMode() {
        this.angleModeElement.textContent = this.angleMode.toUpperCase();
        if (this.degRadToggle) {
            this.degRadToggle.textContent = this.angleMode.toUpperCase();
        }
    }

    // Display functions
    updateDisplay() {
        this.currentOperandElement.textContent = this.formatNumber(this.currentOperand);
        
        if (this.operation != null) {
            this.previousOperandElement.textContent = 
                `${this.formatNumber(this.previousOperand)} ${this.getOperatorSymbol(this.operation)}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }

    formatNumber(number) {
        if (typeof number === 'string' && isNaN(parseFloat(number))) {
            return number;
        }
        
        const num = parseFloat(number);
        
        if (isNaN(num)) return '0';
        
        // Handle very large or very small numbers with scientific notation
        if (Math.abs(num) >= 1e10 || (Math.abs(num) < 1e-6 && num !== 0)) {
            return num.toExponential(6);
        }
        
        // Format normal numbers
        if (Number.isInteger(num)) {
            return num.toString();
        } else {
            // Limit decimal places to prevent display overflow
            return parseFloat(num.toPrecision(12)).toString();
        }
    }

    showError(message) {
        this.currentOperand = 'Error';
        this.currentOperandElement.classList.add('error');
        
        setTimeout(() => {
            this.currentOperand = '0';
            this.currentOperandElement.classList.remove('error');
            this.updateDisplay();
        }, 2000);
        
        this.updateDisplay();
        console.error('Calculator Error:', message);
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScientificCalculator();
});

// Add visual feedback for button presses
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = '';
            button.style.boxShadow = '';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
            button.style.boxShadow = '';
        });
    });
});
