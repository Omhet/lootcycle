# COPILOT EDITS OPERATIONAL GUIDELINES

## PRIME DIRECTIVE

    Avoid working on more than one file at a time.
    Multiple simultaneous edits to a file will cause corruption.
    Be chatting and teach about what you are doing while coding.

## LARGE FILE & COMPLEX CHANGE PROTOCOL

### MANDATORY PLANNING PHASE

    When working with large files (>300 lines) or complex changes:
    	1. ALWAYS start by creating a detailed plan BEFORE making any edits
            2. Your plan MUST include:
                   - All functions/sections that need modification
                   - The order in which changes should be applied
                   - Dependencies between changes
                   - Estimated number of separate edits required

            3. Format your plan as:

## PROPOSED EDIT PLAN

    Working with: [filename]
    Total planned edits: [number]

### MAKING EDITS

    - Focus on one conceptual change at a time
    - Show clear "before" and "after" snippets when proposing changes
    - Include concise explanations of what changed and why
    - Always check if the edit maintains the project's coding style

### Edit sequence:

    1. [First specific change] - Purpose: [why]
    2. [Second specific change] - Purpose: [why]
    3. Do you approve this plan? I'll proceed with Edit [number] after your confirmation.
    4. WAIT for explicit user confirmation before making ANY edits when user ok edit [number]

### EXECUTION PHASE

    - After each individual edit, clearly indicate progress:
    	"✅ Completed edit [#] of [total]. Ready for next edit?"
    - If you discover additional needed changes during editing:
    - STOP and update the plan
    - Get approval before continuing

### REFACTORING GUIDANCE

    When refactoring large files:
    - Break work into logical, independently functional chunks
    - Ensure each intermediate state maintains functionality
    - Consider temporary duplication as a valid interim step
    - Always indicate the refactoring pattern being applied

### RATE LIMIT AVOIDANCE

    - For very large files, suggest splitting changes across multiple sessions
    - Prioritize changes that are logically complete units
    - Always provide clear stopping points

## General Requirements

    Use modern technologies as described below for all code suggestions. Prioritize clean, maintainable code with appropriate comments. Do not write any redundant comments that just depicts that you did some changes (e.g. // Moved this to index.ts file OR // Added typeId)

### Phaser

    - Use the latest Phaser 3.87.0 version. Consult API docs if unsure https://docs.phaser.io/api-documentation/api-documentation
    - **Scene Management:** Utilize Phaser's scene lifecycle methods (`init`, `preload`, `create`, `update`). Use `this.scene.start()` and `this.scene.stop()` for scene transitions. Pass data between scenes using the optional data argument in `this.scene.start(key, data)`.
    - **Asset Loading:** Load all assets in a dedicated `Preloader` scene. Use specific loader methods (e.g., `this.load.image`, `this.load.spritesheet`, `this.load.aseprite`, `this.load.audio`). Ensure asset keys are unique and descriptive.
    - **Game Objects:** Create game objects using scene factories (e.g., `this.add.image()`, `this.add.sprite()`, `this.physics.add.sprite()`). Add game objects to Containers or Groups for better organization and management.
    - **Physics:** Default to Matter.js physics unless specified otherwise. Use `this.matter.world` for world configuration (e.g., gravity, bounds). Create physics-enabled sprites using `this.matter.add.sprite()`. Set up collisions using collision categories and masks (`gameObject.setCollisionCategory()`, `gameObject.setCollidesWith()`). Use `this.matter.add.collider()` for specific pair collisions if needed. For complex shapes, consider using physics editors (like PhysicsEditor) and loading the data, or manually creating compound bodies.
    - **TypeScript:** Leverage TypeScript for type safety. Define interfaces for scene data, custom game object properties, and configuration objects. Use Phaser's provided types (e.g., `Phaser.Scene`, `Phaser.GameObjects.Sprite`, `Phaser.Types.Physics.Arcade.SpriteWithDynamicBody`).
    - **State & Events:** Use the existing `EventBus` for decoupled communication between scenes or systems. Avoid relying on global variables for state management where possible.
    - **Input:** Use Phaser's Input Plugin (`this.input.on('pointerdown', ...)`), Keyboard Plugin (`this.input.keyboard.addKey(...)`), or specific Gamepad/Pointer methods as needed.
    - **Performance:** Be mindful of performance. Use object pooling for frequently created/destroyed objects. Optimize code within the `update` loop. Use Texture Atlases where appropriate.
    - **Cleanup:** Ensure proper cleanup of resources. Remove event listeners, timers, and destroy game objects when they are no longer needed, especially when a scene shuts down (use the `shutdown` event: `this.events.on('shutdown', () => { ... })`).
    -
