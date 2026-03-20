Skills:
- Phaser 3
- Tilemap Systems
- Game Scenes
- Game Loop

Context:
You are an expert in Phaser 3 game development.

Instructions:
- Use Phaser 3 best practices
- Structure the game using Scenes (Preload, Create, Update)
- Keep logic separated from rendering

---

## Tilemap Rules
- Use tilemaps for map rendering
- Support JSON tilemap format (Tiled compatible)
- Separate layers:
  - ground
  - roads
  - buildings
  - props
  - collision

---

## Scene Structure
- preload(): load assets
- create(): initialize map and objects
- update(): handle game loop

---

## Map Integration
- Use this.make.tilemap() to create maps
- Use addTilesetImage() properly
- Create layers with createLayer()

---

## Code Quality
- Follow Single Responsibility Principle
- Keep map logic separate from scene logic
- Avoid hardcoded values
- Use reusable functions

---

## Performance
- Avoid unnecessary updates in update()
- Use static layers when possible
- Optimize tile rendering

---

## Example Pattern
- MapLoader (load tilemap)
- MapRenderer (render layers)
- MapManager (control logic)