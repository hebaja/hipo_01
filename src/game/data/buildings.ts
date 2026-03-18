import { categories } from './questions';

export interface Building {
    x: number;
    y: number;
    category: string;
    color: number;
    conquered: boolean;
    questionIndex: number;
    questionNumber: number;
    wrongAttempts: number;
}

export class MapGrid {
    public grid: Building[] = [];
    public width: number;
    public height: number;
    public tileSize: number;
    public discovered: boolean[][];
    public discoveryRadius: number = 0;

    constructor(width: number, height: number, tileSize: number) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;

        // Initialize discovery grid
        this.discovered = Array(width).fill(null).map(() => Array(height).fill(false));
    }

    public generateStagedBuildings(totalCount: number, stages: number, radii: number[]) {
        const positions = new Set<string>();
        const centerX = Math.floor(this.width / 2);
        const centerY = Math.floor(this.height / 2);

        // Track question distribution per category
        const categoryQuestionCount: { [category: string]: number } = {};
        categories.forEach(cat => {
            categoryQuestionCount[cat.name] = 0;
        });

        for (let s = 0; s < stages; s++) {
            const innerRadius = s === 0 ? 0 : radii[s - 1];
            const outerRadius = radii[s];

            const thresholdCurrent = Math.ceil((s + 1) * totalCount / stages);
            const thresholdPrev = s === 0 ? 0 : Math.ceil(s * totalCount / stages);
            const countForStage = thresholdCurrent - thresholdPrev;

            let placedInStage = 0;
            let attempts = 0;
            const maxAttempts = 500;

            while (placedInStage < countForStage && attempts < maxAttempts * 2) {
                attempts++;
                const x = Math.floor(Math.random() * this.width);
                const y = Math.floor(Math.random() * this.height);
                const posKey = `${x},${y}`;

                if (positions.has(posKey)) continue;

                const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

                // Fallback: If we've tried too many times for this specific ring,
                // accept ANY position within the outer radius (including inner areas)
                // This ensures we always place the required number of buildings.
                const isWithinZone = attempts < maxAttempts
                    ? (distance <= outerRadius && distance >= innerRadius)
                    : (distance <= outerRadius);

                if (isWithinZone) {
                    positions.add(posKey);
                    const categoryData = categories[Math.floor(Math.random() * categories.length)];

                    const questionIndex = categoryQuestionCount[categoryData.name] % 2;
                    const questionNumber = Object.values(categoryQuestionCount).reduce((a, b) => a + b, 0) + 1;
                    categoryQuestionCount[categoryData.name]++;

                    this.grid.push({
                        x,
                        y,
                        category: categoryData.name,
                        color: categoryData.color,
                        conquered: false,
                        questionIndex: questionIndex,
                        questionNumber: questionNumber,
                        wrongAttempts: 0
                    });
                    placedInStage++;
                }
            }
        }
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
}