class PathfindingVisualizer {
    constructor() {
        this.grid = [];
        this.gridSize = 10;
        this.currentMode = 'start';
        this.currentSpeed = 'medium';
        this.isRunning = false;
        this.isPaused = false;
        this.startNode = null;
        this.endNode = null;
        
        this.speedDelays = {
            slow: 100,
            medium: 50,
            fast: 10
        };
        
        this.stats = {
            nodesExplored: 0,
            pathLength: 0,
            executionTime: 0
        };
        
        this.init();
    }
    
    init() {
        this.createGrid();
        this.setupEventListeners();
        this.setDefaultStartEnd();
        this.updateStats();
    }
    
    createGrid() {
        this.grid = [];
        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                this.grid[row][col] = {
                    row,
                    col,
                    isWall: false,
                    isStart: false,
                    isEnd: false,
                    isExplored: false,
                    isPath: false,
                    weight: 1,
                    distance: Infinity,
                    previousNode: null
                };
            }
        }
        this.renderGrid();
    }
    
    renderGrid() {
        const gridContainer = document.getElementById('pathfinding-grid');
        gridContainer.innerHTML = '';
        
        const cellSize = this.getCellSize();
        const gap = this.getGridGap();
        
        gridContainer.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        gridContainer.style.gap = gap;
        gridContainer.style.maxWidth = '90vw';
        gridContainer.style.maxHeight = '70vh';
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = document.createElement('div');
                cell.className = `grid-cell ${cellSize}`;
                cell.setAttribute('data-row', row);
                cell.setAttribute('data-col', col);
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                
                this.updateCellAppearance(cell, this.grid[row][col]);
                gridContainer.appendChild(cell);
            }
        }
    }
    
    getCellSize() {
        if (this.gridSize <= 10) return 'w-8 h-8';
        if (this.gridSize <= 15) return 'w-6 h-6';
        if (this.gridSize <= 20) return 'w-5 h-5';
        return 'w-4 h-4';
    }
    
    getGridGap() {
        if (this.gridSize <= 10) return '4px';
        if (this.gridSize <= 15) return '2px';
        return '1px';
    }
    
    updateCellAppearance(cellElement, node) {
        cellElement.className = `grid-cell ${this.getCellSize()}`;
        
        if (node.isStart) {
            cellElement.classList.add('start-node');
            cellElement.innerHTML = '▶';
        } else if (node.isEnd) {
            cellElement.classList.add('end-node');
            cellElement.innerHTML = '🏁';
        } else if (node.isWall) {
            cellElement.classList.add('wall-node');
            cellElement.innerHTML = '';
        } else if (node.isPath) {
            cellElement.classList.add('path-node');
            cellElement.innerHTML = '';
        } else if (node.isExplored) {
            cellElement.classList.add('explored-node');
            cellElement.innerHTML = '';
        } else if (node.weight > 1) {
            cellElement.classList.add('weight-node');
            cellElement.innerHTML = node.weight.toString();
        } else {
            cellElement.classList.add('empty');
            cellElement.innerHTML = '';
        }
    }
    
    handleCellClick(row, col) {
        if (this.isRunning) return;
        
        const node = this.grid[row][col];
        this.setNodeType(node, this.currentMode);
        this.updateGridDisplay();
    }
    
    setNodeType(node, mode) {
        this.clearNodeStates(node);
        
        switch (mode) {
            case 'start':
                if (this.startNode) {
                    this.startNode.isStart = false;
                }
                node.isStart = true;
                this.startNode = node;
                break;
            case 'end':
                if (this.endNode) {
                    this.endNode.isEnd = false;
                }
                node.isEnd = true;
                this.endNode = node;
                break;
            case 'wall':
                if (!node.isStart && !node.isEnd) {
                    node.isWall = !node.isWall;
                }
                break;
            case 'weight':
                if (!node.isStart && !node.isEnd && !node.isWall) {
                    node.weight = node.weight === 1 ? 3 : node.weight === 3 ? 5 : 1;
                }
                break;
        }
    }
    
    clearNodeStates(node) {
        node.isExplored = false;
        node.isPath = false;
        node.distance = Infinity;
        node.previousNode = null;
    }
    
    updateGridDisplay() {
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            const row = parseInt(cell.getAttribute('data-row'));
            const col = parseInt(cell.getAttribute('data-col'));
            this.updateCellAppearance(cell, this.grid[row][col]);
        });
    }
    
    setupEventListeners() {
        document.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setMode(e.target.getAttribute('data-mode'));
            });
        });
        
        document.querySelectorAll('[data-speed]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setSpeed(e.target.getAttribute('data-speed'));
            });
        });
        
        document.getElementById('grid-size').addEventListener('change', (e) => {
            this.setGridSize(parseInt(e.target.value));
        });
        
        document.getElementById('find-path').addEventListener('click', () => this.findPath());
        document.getElementById('clear-path').addEventListener('click', () => this.clearPath());
        document.getElementById('clear-all').addEventListener('click', () => this.clearAll());
        document.getElementById('generate-maze').addEventListener('click', () => this.generateMaze());
        
        document.getElementById('save-grid').addEventListener('click', () => this.saveGrid());
        document.getElementById('load-grid').addEventListener('click', () => this.loadGrid());
    }
    
    setMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('[data-mode]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    }
    
    setSpeed(speed) {
        this.currentSpeed = speed;
        document.querySelectorAll('[data-speed]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-speed="${speed}"]`).classList.add('active');
    }
    
    setGridSize(size) {
        if (this.isRunning) return;
        
        this.gridSize = size;
        this.createGrid();
        this.setDefaultStartEnd();
        this.resetStats();
    }
    
    setDefaultStartEnd() {
        if (this.gridSize > 2) {
            if (!this.startNode) {
                const startRow = 1;
                const startCol = 1;
                this.setNodeType(this.grid[startRow][startCol], 'start');
            }
            
            if (!this.endNode) {
                const endRow = this.gridSize - 2;
                const endCol = this.gridSize - 2;
                this.setNodeType(this.grid[endRow][endCol], 'end');
            }
            
            this.updateGridDisplay();
        }
    }
    
    async findPath() {
        if (!this.startNode || !this.endNode) {
            this.showToast('Error', 'Please set both start and end points before finding a path.', 'error');
            return;
        }
        
        this.setRunningState(true);
        this.clearPath();
        
        const startTime = performance.now();
        
        try {
            const result = await this.dijkstraAlgorithm();
            await this.animateAlgorithm(result.exploredNodes, result.shortestPath);
            
            const endTime = performance.now();
            const executionTime = (endTime - startTime) / 1000;
            
            this.stats = {
                nodesExplored: result.nodesExploredCount,
                pathLength: result.pathLength,
                executionTime
            };
            
            this.updateStats();
            
            if (result.pathFound) {
                this.showToast('Success', `Found shortest path with length ${result.pathLength} in ${executionTime.toFixed(2)}s`, 'success');
            } else {
                this.showToast('No Path', 'No path exists between the start and end points.', 'error');
            }
        } catch (error) {
            this.showToast('Error', 'An error occurred while running the pathfinding algorithm.', 'error');
        } finally {
            this.setRunningState(false);
        }
    }
    
    async dijkstraAlgorithm() {
        this.initializeNodes();
        
        const unvisitedNodes = this.getAllNodes();
        const exploredNodes = [];
        
        this.startNode.distance = 0;
        
        while (unvisitedNodes.length > 0) {
            this.sortNodesByDistance(unvisitedNodes);
            const closestNode = unvisitedNodes.shift();
            
            if (closestNode.isWall) continue;
            if (closestNode.distance === Infinity) break;
            
            closestNode.isExplored = true;
            exploredNodes.push(closestNode);
            
            if (closestNode === this.endNode) {
                const shortestPath = this.reconstructPath();
                return {
                    exploredNodes,
                    shortestPath,
                    nodesExploredCount: exploredNodes.length,
                    pathLength: shortestPath.length - 1,
                    pathFound: true
                };
            }
            
            this.updateNeighbors(closestNode);
        }
        
        return {
            exploredNodes,
            shortestPath: [],
            nodesExploredCount: exploredNodes.length,
            pathLength: 0,
            pathFound: false
        };
    }
    
    initializeNodes() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const node = this.grid[row][col];
                node.distance = Infinity;
                node.previousNode = null;
                node.isExplored = false;
                node.isPath = false;
            }
        }
    }
    
    getAllNodes() {
        const nodes = [];
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                nodes.push(this.grid[row][col]);
            }
        }
        return nodes;
    }
    
    sortNodesByDistance(nodes) {
        nodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
    }
    
    updateNeighbors(node) {
        const neighbors = this.getUnvisitedNeighbors(node);
        for (const neighbor of neighbors) {
            const distance = node.distance + neighbor.weight;
            if (distance < neighbor.distance) {
                neighbor.distance = distance;
                neighbor.previousNode = node;
            }
        }
    }
    
    getUnvisitedNeighbors(node) {
        const neighbors = [];
        const { row, col } = node;
        
        if (row > 0) neighbors.push(this.grid[row - 1][col]);
        if (row < this.gridSize - 1) neighbors.push(this.grid[row + 1][col]);
        if (col > 0) neighbors.push(this.grid[row][col - 1]);
        if (col < this.gridSize - 1) neighbors.push(this.grid[row][col + 1]);
        
        return neighbors.filter(neighbor => !neighbor.isExplored);
    }
    
    reconstructPath() {
        const path = [];
        let currentNode = this.endNode;
        
        while (currentNode !== null) {
            path.unshift(currentNode);
            currentNode = currentNode.previousNode;
        }
        
        for (let i = 1; i < path.length - 1; i++) {
            path[i].isPath = true;
        }
        
        return path;
    }
    
    async animateAlgorithm(exploredNodes, shortestPath) {
        const delay = this.speedDelays[this.currentSpeed];
        
        for (let i = 0; i < exploredNodes.length; i++) {
            if (this.isPaused) {
                await this.waitForResume();
            }
            
            const node = exploredNodes[i];
            if (!node.isStart && !node.isEnd) {
                node.isExplored = true;
            }
            
            this.stats.nodesExplored = i + 1;
            this.updateStats();
            this.updateGridDisplay();
            await this.sleep(delay);
        }
        
        if (shortestPath.length > 0) {
            for (let i = 1; i < shortestPath.length - 1; i++) {
                if (this.isPaused) {
                    await this.waitForResume();
                }
                
                shortestPath[i].isPath = true;
                this.updateGridDisplay();
                await this.sleep(delay * 2);
            }
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async waitForResume() {
        return new Promise(resolve => {
            const checkPause = () => {
                if (!this.isPaused) resolve();
                else setTimeout(checkPause, 100);
            };
            checkPause();
        });
    }
    
    clearPath() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const node = this.grid[row][col];
                node.isExplored = false;
                node.isPath = false;
                node.distance = Infinity;
                node.previousNode = null;
            }
        }
        this.updateGridDisplay();
        this.resetStats();
    }
    
    clearAll() {
        if (this.isRunning) return;
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const node = this.grid[row][col];
                node.isWall = false;
                node.isExplored = false;
                node.isPath = false;
                node.weight = 1;
                node.distance = Infinity;
                node.previousNode = null;
                if (node.isStart) {
                    this.startNode = null;
                    node.isStart = false;
                }
                if (node.isEnd) {
                    this.endNode = null;
                    node.isEnd = false;
                }
            }
        }
        this.updateGridDisplay();
        this.resetStats();
    }
    
    generateMaze() {
        if (this.isRunning) return;
        
        this.clearAll();
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (Math.random() < 0.3) {
                    this.grid[row][col].isWall = true;
                }
            }
        }
        
        this.setRandomStartEnd();
        this.updateGridDisplay();
        this.showToast('Maze Generated', 'A random maze has been generated with start and end points.', 'info');
    }
    
    setRandomStartEnd() {
        const emptyCells = [];
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (!this.grid[row][col].isWall) {
                    emptyCells.push(this.grid[row][col]);
                }
            }
        }
        
        if (emptyCells.length >= 2) {
            const startIndex = Math.floor(Math.random() * emptyCells.length);
            const startNode = emptyCells[startIndex];
            this.setNodeType(startNode, 'start');
            
            emptyCells.splice(startIndex, 1);
            const endIndex = Math.floor(Math.random() * emptyCells.length);
            const endNode = emptyCells[endIndex];
            this.setNodeType(endNode, 'end');
        }
    }
    
    saveGrid() {
        if (this.isRunning) return;
        
        try {
            const gridData = {
                size: this.gridSize,
                nodes: this.grid.map(row =>
                    row.map(node => ({
                        row: node.row,
                        col: node.col,
                        isWall: node.isWall,
                        isStart: node.isStart,
                        isEnd: node.isEnd,
                        weight: node.weight
                    }))
                )
            };
            localStorage.setItem('pathfinding-grid', JSON.stringify(gridData));
            this.showToast('Grid Saved', 'Your grid configuration has been saved to local storage.', 'success');
        } catch (error) {
            this.showToast('Save Failed', 'Failed to save grid configuration.', 'error');
        }
    }
    
    loadGrid() {
        if (this.isRunning) return;
        
        try {
            const data = localStorage.getItem('pathfinding-grid');
            if (!data) {
                this.showToast('No Saved Grid', 'No saved grid configuration found.', 'info');
                return;
            }
            
            const gridData = JSON.parse(data);
            if (!gridData.nodes || !gridData.size) {
                this.showToast('Load Failed', 'Invalid grid data format.', 'error');
                return;
            }
            
            this.gridSize = gridData.size;
            document.getElementById('grid-size').value = this.gridSize;
            this.createGrid();
            
            this.startNode = null;
            this.endNode = null;
            
            for (let row = 0; row < this.gridSize; row++) {
                for (let col = 0; col < this.gridSize; col++) {
                    const savedNode = gridData.nodes[row]?.[col];
                    if (savedNode) {
                        const node = this.grid[row][col];
                        node.isWall = savedNode.isWall || false;
                        node.weight = savedNode.weight || 1;
                        
                        if (savedNode.isStart) {
                            node.isStart = true;
                            this.startNode = node;
                        }
                        if (savedNode.isEnd) {
                            node.isEnd = true;
                            this.endNode = node;
                        }
                    }
                }
            }
            
            this.updateGridDisplay();
            this.resetStats();
            this.showToast('Grid Loaded', 'Your saved grid configuration has been loaded.', 'success');
        } catch (error) {
            this.showToast('Load Failed', 'Failed to load grid configuration.', 'error');
        }
    }
    
    setRunningState(running) {
        this.isRunning = running;
        
        const indicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        
        if (running) {
            indicator.className = 'w-3 h-3 rounded-full bg-green-500 animate-pulse';
            statusText.textContent = 'Running';
        } else {
            indicator.className = 'w-3 h-3 rounded-full bg-gray-400';
            statusText.textContent = 'Ready';
        }
        
        const controls = [
            'find-path', 'clear-path', 'clear-all', 'generate-maze',
            'save-grid', 'load-grid', 'grid-size'
        ];
        
        controls.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.disabled = running;
            }
        });
        
        document.querySelectorAll('[data-mode], [data-speed]').forEach(btn => {
            btn.disabled = running;
        });
    }
    
    updateStats() {
        document.getElementById('nodes-explored').textContent = this.stats.nodesExplored;
        document.getElementById('path-length').textContent = this.stats.pathLength;
        document.getElementById('stat-nodes-explored').textContent = this.stats.nodesExplored;
        document.getElementById('stat-path-length').textContent = this.stats.pathLength;
        
        const timeText = this.stats.executionTime < 1 
            ? `${Math.round(this.stats.executionTime * 1000)}ms`
            : `${this.stats.executionTime.toFixed(2)}s`;
        document.getElementById('stat-execution-time').textContent = timeText;
    }
    
    resetStats() {
        this.stats = {
            nodesExplored: 0,
            pathLength: 0,
            executionTime: 0
        };
        this.updateStats();
    }
    
    showToast(title, message, type = 'info') {
        const toast = document.getElementById('toast');
        const titleEl = document.getElementById('toast-title');
        const messageEl = document.getElementById('toast-message');
        const iconEl = document.getElementById('toast-icon');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        
        toast.className = `fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 transform transition-transform duration-300 z-50 toast-${type}`;
        
        let iconSvg = '';
        switch (type) {
            case 'success':
                iconSvg = '<svg class="text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
                break;
            case 'error':
                iconSvg = '<svg class="text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
                break;
            default:
                iconSvg = '<svg class="text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
        }
        iconEl.innerHTML = iconSvg;
        
        toast.style.transform = 'translateX(0)';
        
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PathfindingVisualizer();
});
