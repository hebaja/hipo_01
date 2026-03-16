import { categories } from './questions';

export interface Building {
    x: number;
    y: number;
    category: string;
    color: number;
    conquered: boolean;
}

export class MapGrid {
    public grid: Building[] = [];
    public width: number;
    public height: number;
    public tileSize: number;

    constructor(width: number, height: number, tileSize: number, buildingCount: number) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.generateBuildings(buildingCount);
    }

    private generateBuildings(count: number) {
        const positions = new Set<string>();
        
        for (let i = 0; i < count; i++) {
            let x, y, posKey;
            
            // Try to find a unique position
            do {
                x = Math.floor(Math.random() * this.width);
                y = Math.floor(Math.random() * this.height);
                posKey = `${x},${y}`;
            } while (positions.has(posKey));
            
            positions.add(posKey);
            
            // Pick random category
            const categoryData = categories[Math.floor(Math.random() * categories.length)];
            
            this.grid.push({
                x,
                y,
                category: categoryData.name,
                color: categoryData.color,
                conquered: false
            });
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
}