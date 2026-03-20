import { categories } from './questions';

export interface Building {
    x: number;
    y: number;
    category: string;
    color: number;
    conquered: boolean;
    questionIndex: number;
    questionNumber: number;
    stage: number;
    lastHintIndex: number;
    wrongAttempts: number;
    painterIndex: number;
    wordPositions: { word: string, startX: number, startY: number, dx: number, dy: number }[];
    gridLetters: string[][];
    foundWords: string[];
    matchedPairIds: string[];
    lockedPositions: number[];
    challengeType: 'quiz' | 'anagram' | 'twoTruthsOneLie' | 'wordSearch' | 'memoryGame';
}

export interface NPC {
    x: number;
    y: number;
    stage: number;
    name: string;
    type: string;
}

export class MapGrid {
    public grid: Building[] = [];
    public npcs: NPC[] = [];
    public lastFailedBuilding: Building | null = null;
    public lastFailedBuildingByStage: { [stage: number]: Building | null } = {};
    public width: number;
    public height: number;
    public tileSize: number;
    public discovered: boolean[][];
    public collisionGrid: boolean[][];
    public discoveryRadius: number = 0;

    constructor(width: number, height: number, tileSize: number) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;

        // Initialize discovery and collision grids
        this.discovered = Array(width).fill(null).map(() => Array(height).fill(false));
        this.collisionGrid = Array(width).fill(null).map(() => Array(height).fill(false));
    }

    public isWalkable(x: number, y: number): boolean {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        return !this.collisionGrid[x][y];
    }

    public loadFromTilemap(data: any, radii: number[]) {
        if (!data || !data.layers) return;
        this.grid = [];
        const buildingsLayer = data.layers.find((l: any) => l.name === 'buildings');
        if (!buildingsLayer) return;

        if (data.width !== this.width || data.height !== this.height) {
            console.error(`MapGrid size mismatch! Grid: ${this.width}x${this.height}, Tilemap: ${data.width}x${data.height}`);
        }

        // Find all layers with collider: true (case-insensitive check)
        const colliderLayers = data.layers.filter((l: any) => 
            l.properties?.find((p: any) => p.name.toLowerCase() === 'collider' && p.value === true)
        );

        // Reset collision grid
        this.collisionGrid = Array(this.width).fill(null).map(() => Array(this.height).fill(false));

        // Populate collision grid
        colliderLayers.forEach((layer: any) => {
            for (let i = 0; i < layer.data.length; i++) {
                if (layer.data[i] !== 0) {
                    const x = i % this.width;
                    const y = Math.floor(i / this.width);
                    this.collisionGrid[x][y] = true;
                }
            }
        });

        // Extract buildings
        const buildingPositions: {x: number, y: number, gid: number}[] = [];
        for (let i = 0; i < buildingsLayer.data.length; i++) {
            const gid = buildingsLayer.data[i];
            if (gid !== 0) {
                buildingPositions.push({
                    x: i % this.width,
                    y: Math.floor(i / this.width),
                    gid: gid
                });
            }
        }

        // Shuffle building positions to randomize challenge distribution
        const shuffledBuildings = [...buildingPositions].sort(() => Math.random() - 0.5);
        
        // Distribute challenge types
        const types: ('quiz' | 'anagram' | 'twoTruthsOneLie' | 'wordSearch' | 'memoryGame')[] = 
            ['quiz', 'anagram', 'twoTruthsOneLie', 'wordSearch', 'memoryGame'];
        
        const categoryQuestionCount: { [category: string]: number } = {};
        categories.forEach(cat => categoryQuestionCount[cat.name] = 0);

        const centerX = Math.floor(this.width / 2);
        const centerY = Math.floor(this.height / 2);

        shuffledBuildings.forEach((pos, index) => {
            // Map GID to category (1-5 -> Escultura, Pintura, Fotografia, Música, Dança)
            const catIndex = (pos.gid - 1) % categories.length;
            const categoryData = categories[catIndex];
            
            const challengeType = types[index % types.length];
            const questionIndex = categoryQuestionCount[categoryData.name] % 2;
            const questionNumber = index + 1;
            categoryQuestionCount[categoryData.name]++;

            // Calculate stage based on distance from center
            const distance = Math.sqrt(Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2));
            let stage = 0;
            for (let s = 0; s < radii.length; s++) {
                const innerRadius = s === 0 ? 0 : radii[s - 1];
                const outerRadius = radii[s];
                if (distance >= innerRadius && distance < outerRadius) {
                    stage = s;
                    break;
                }
                // If distance is beyond the last radius, assign to the last stage
                if (s === radii.length - 1 && distance >= outerRadius) {
                    stage = s;
                }
            }

            this.grid.push({
                x: pos.x,
                y: pos.y,
                category: categoryData.name,
                color: categoryData.color,
                conquered: false,
                questionIndex: questionIndex,
                questionNumber: questionNumber,
                wrongAttempts: 0,
                stage: stage,
                lastHintIndex: 0,
                painterIndex: -1,
                wordPositions: [],
                gridLetters: [],
                foundWords: [],
                matchedPairIds: [],
                lockedPositions: [],
                challengeType: challengeType
            });
        });
    }

    public getBuildingAt(x: number, y: number): Building | null {
        return this.grid.find(b => b.x === x && b.y === y) || null;
    }

    public conquerBuilding(building: Building) {
        building.conquered = true;
    }

    public getConqueredCount(): number {
        return this.grid.filter(b => b.conquered).length;
    }

    public getTotalCount(): number {
        return this.grid.length;
    }

    public isTileDiscovered(x: number, y: number): boolean {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        return this.discovered[x][y];
    }

    public revealArea(centerX: number, centerY: number, radius: number) {
        for (let x = centerX - radius; x <= centerX + radius; x++) {
            for (let y = centerY - radius; y <= centerY + radius; y++) {
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    // Simple square reveal for now, or could use distance for circle
                    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                    if (distance <= radius) {
                        this.discovered[x][y] = true;
                    }
                }
            }
        }
    }

    public updateDiscoveryFromCenter(centerX: number, centerY: number) {
        // Reset discovery (optional, depending on if we want to keep discovered areas)
        // For the requested "radius based access", we keep it simple:
        this.revealArea(centerX, centerY, this.discoveryRadius);
    }

    public revealAll() {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.discovered[x][y] = true;
            }
        }
    }

    private readonly NPC_POSITIONS: { x: number; y: number }[] = [
        { x: 11, y: 10 },
        { x: 13, y: 8 },
        { x: 5, y: 10 },
    ];

    public generateNPCs(stages: number, radii: number[]) {
        this.npcs = [];
        const occupiedPositions = new Set<string>();
        this.grid.forEach(b => occupiedPositions.add(`${b.x},${b.y}`));

        console.log(`[NPC] Generating NPCs for ${stages} stages`);
        console.log(`[NPC] Buildings in grid: ${this.grid.length}`);
        
        const stageCount: { [stage: number]: number } = {};
        this.grid.forEach(b => {
            stageCount[b.stage] = (stageCount[b.stage] || 0) + 1;
        });
        console.log(`[NPC] Buildings per stage:`, stageCount);
        console.log(`[NPC] RADII used for NPC positioning:`, radii);

        const centerX = Math.floor(this.width / 2);
        const centerY = Math.floor(this.height / 2);

        for (let s = 0; s < stages && s < this.NPC_POSITIONS.length; s++) {
            const pos = this.NPC_POSITIONS[s];
            const innerRadius = s === 0 ? 0 : radii[s - 1];
            const outerRadius = radii[s];
            const distance = Math.sqrt(Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2));

            const isBlocked = occupiedPositions.has(`${pos.x},${pos.y}`) || this.collisionGrid[pos.x]?.[pos.y];
            const isOutOfZone = distance < innerRadius || distance >= outerRadius;

            if (isBlocked || isOutOfZone) {
                console.error(`NPC for stage ${s} at (${pos.x}, ${pos.y}) is ${isBlocked ? 'BLOCKED' : 'OUT OF ZONE'}`);
                continue;
                if (positions.has(posKey)) continue;
                if (this.collisionGrid[x][y]) continue; // Avoid obstacles!

                const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                
                // Use slightly more exclusive boundaries to prevent overlap between stages
                const isWithinZone = s === 0 
                    ? distance < outerRadius 
                    : distance >= innerRadius && distance < outerRadius;

                if (isWithinZone) {
                    positions.add(posKey); // Mark this position as taken (avoids NPC overlap too)
                    
                    // Assign different character types based on stage
                    let type = 'npc1';
                    if (s === 1) type = 'npc2';
                    if (s === 2) type = 'npc3';

                    this.npcs.push({
                        x,
                        y,
                        stage: s,
                        name: `Mentor Estágio ${s + 1}`,
                        type: type
                    });
                    placed = true;
                }
            }

            occupiedPositions.add(`${pos.x},${pos.y}`);
            let type = 'npc1';
            if (s === 1) type = 'npc2';
            if (s === 2) type = 'npc3';

            console.log(`[NPC] Created NPC for stage ${s + 1}: ${pos.x}, ${pos.y} (type: ${type}) distance from center: ${distance.toFixed(2)}`);
            this.npcs.push({
                x: pos.x,
                y: pos.y,
                stage: s,
                name: `Mentor Estágio ${s + 1}`,
                type: type,
            });
        }
    }
}