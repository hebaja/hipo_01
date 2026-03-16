# AGENTS.md

This file contains guidelines for AI agents working on this Phaser 3 TypeScript game project.

## Project Overview
Cultural Explorer Game - A Phaser 3 prototype featuring grid-based exploration, building conquest through quizzes, and cultural knowledge collection.

## Build & Development Commands

### Development
```bash
# Start development server (with logging)
npm run dev

# Start development server (without logging)
npm run dev-nolog
```
- Server runs on `http://localhost:8080`
- Hot reload enabled

### Production Build
```bash
# Build for production (with logging)
npm run build

# Build for production (without logging)
npm run build-nolog
```
- Output directory: `dist/`
- Minified with Terser

### Testing & Validation
```bash
# Check TypeScript compilation (no emit)
npx tsc --noEmit

# Run full build to validate
npm run build-nolog
```
- No dedicated test runner configured
- Validation via TypeScript compilation and build process

## Code Style Guidelines

### TypeScript Configuration
- **Target**: ES2020
- **Module**: ESNext
- **Strict mode**: Enabled
- **No unused locals/parameters**: Enabled
- **No fallthrough cases**: Enabled

### Imports
- Use named imports from Phaser modules
- Import types explicitly when needed
- Group imports: external packages, then local modules

```typescript
// Good
import { Scene } from 'phaser';
import { MapGrid, Building } from '../data/buildings';
import { Player } from '../objects/Player';

// Avoid
import * as Phaser from 'phaser'; // Tree-shaking issues
```

### Naming Conventions
- **Classes**: PascalCase (`MapScene`, `Player`, `QuizScene`)
- **Interfaces**: PascalCase with `I` prefix if needed (`Building`, `Question`)
- **Variables**: camelCase (`mapGrid`, `playerPos`, `optionButtons`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Private members**: camelCase with no underscore prefix
- **Scene keys**: String literals matching class names (`'MapScene'`, `'QuizScene'`)

### Formatting
- Use 4 spaces for indentation
- Unix line endings (LF)
- Single quotes for strings
- Trailing commas in multi-line objects/arrays
- Max line length: 120 characters

### Type Safety
- Always specify types for class properties
- Use explicit return types for methods
- Avoid `any` type - use specific types or generics
- Use `!` non-null assertion only when you're certain the value is initialized

```typescript
// Good
private mapGrid: MapGrid;
private player: Player;

// Avoid
private mapGrid: any;
```

### Error Handling
- Use console.error for development errors
- Validate data in `init()` methods
- Check for null/undefined before accessing properties
- Provide fallback values when appropriate

### Phaser-Specific Patterns

#### Scene Lifecycle
```typescript
constructor() {
    super('SceneName'); // Always call super with scene key
}

init(data: any) {
    // Initialize scene data (called once per launch)
}

create() {
    // Create game objects (called every time scene starts)
}

update() {
    // Game loop (called every frame while scene is active)
}
```

#### Input Handling
- Use `Phaser.Input.Keyboard.JustDown()` for single-press detection
- Use `setInteractive()` for clickable objects
- Clear input arrays when recreating objects (fixes input persistence bugs)

```typescript
// Good pattern for reusable input arrays
create() {
    this.optionButtons = []; // Clear previous references
    // Create new interactive objects
}
```

#### Camera Management
- Use `startFollow()` for player tracking
- Set `setScrollFactor(0)` for UI elements
- Use `midPoint` for centered positioning

#### Scene Transitions
```typescript
// Launch scene (don't stop current)
this.scene.launch('QuizScene', { question, building, mapScene: this });

// Stop scene and return to previous
this.scene.stop();
this.mapScene.onQuizComplete(isCorrect, building);
```

### File Structure
```
src/
├── game/
│   ├── main.ts           # Game configuration and startup
│   ├── scenes/           # Phaser scenes
│   │   ├── MapScene.ts
│   │   ├── QuizScene.ts
│   │   └── Game.ts       # Template scene (unused)
│   ├── objects/          # Game objects (Player, etc.)
│   ├── data/             # Data structures and questions
│   └── ui/               # UI components (if needed)
├── main.ts               # Application bootstrap
└── vite-env.d.ts         # Vite type definitions
```

### Common Patterns

#### Building Generation
- Use Set to track unique positions
- Distribute categories evenly
- Random placement within bounds

#### Quiz System
- Filter questions by building category
- Random selection from matching questions
- Disable buttons after selection to prevent double-clicks

#### Player Movement
- Grid-based movement (discrete steps)
- Bounds checking before movement
- Update visual position after grid change

### Performance Considerations
- Use `this.add.graphics()` for simple shapes (more efficient than sprites)
- Clear and redraw graphics only when needed
- Use `setDepth()` to control rendering order
- Limit text object creation in update loops

### Debugging Tips
- Use `console.log()` for temporary debugging
- Check browser console for Phaser errors
- Verify scene keys match registered scenes
- Ensure input events are properly attached to interactive objects

### Version Control
- No `.gitignore` provided - ensure `node_modules/` and `dist/` are excluded
- Keep commit messages descriptive
- Reference file paths and line numbers when discussing code

### Phaser 3 Specific Notes
- Version: 3.90.0
- Physics: Arcade physics enabled but not heavily used in this prototype
- Scale mode: FIT with CENTER_BOTH
- Background color: Configured per scene
