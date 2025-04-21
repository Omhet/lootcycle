# COPILOT EDITS OPERATIONAL GUIDELINES

## PRIME DIRECTIVE

    Avoid working on more than one file at a time.
    Multiple simultaneous edits to a file will cause corruption.
    Execute tasks efficiently and present the completed changes for review. Explain the process concisely.

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

    - Focus on one conceptual change at a time.
    - Apply the planned changes directly.
    - Provide concise explanations for the applied changes, referencing line numbers and filenames.
    - Always check if the edit maintains the project's coding style.

### Edit sequence:

    1. [First specific change] - Purpose: [why]
    2. [Second specific change] - Purpose: [why]
    3. Make the planned edits.

### EXECUTION PHASE

    - If you discover additional needed changes during editing:
    - STOP, update the plan, explain the necessary adjustments, and then continue with the revised plan.

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

### TypeScript

    - **Strict Mode:** Enable `strict` mode in `tsconfig.json` for maximum type safety.
    - **Explicit Types:** Use explicit types for function parameters, return values, and variables where type inference isn't obvious or sufficient. Avoid `any` unless absolutely necessary and provide justification.
    - **Readonly:** Use the `readonly` modifier for properties that should not be reassigned after initialization.
    - **Enums:** Use string enums for better readability and debugging unless numeric enums offer a specific advantage.
    - **Utility Types:** Leverage built-in utility types like `Partial`, `Required`, `Readonly`, `Pick`, `Omit` to create new types based on existing ones.
    - **Modules:** Organize code into modules (`import`/`export`) for better maintainability and encapsulation. Use relative paths for internal module imports.

### React

    - **Component Composition:** Break down UI into small, reusable components. Favor composition over inheritance.
    - **State Management:** For simple state, use `useState`. For complex state shared across components, use `useContext` with `useReducer` or consider a dedicated state management library if needed (though prefer simpler solutions first). Use the existing `EventBus` to communicate between React UI and the Phaser game.
    - **Props:** Pass data down via props. Use TypeScript interfaces (`interface Props { ... }`) to define prop types.
    - **Keys:** Always provide stable and unique `key` props when rendering lists of elements.
    - **Effect Cleanup:** Always clean up side effects in `useEffect` (e.g., subscriptions, timers) by returning a cleanup function.

### Architecture

    - **Separation of Concerns:** Clearly separate data, game logic (Phaser), and UI presentation (React). Avoid mixing concerns within a single module or component.
    - **SOLID Principles:** Strive to follow SOLID principles (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion) where applicable to create maintainable and scalable code.
    - **Modularity:** Design systems as loosely coupled modules with well-defined interfaces. Use the `EventBus` for inter-module communication where direct coupling isn't necessary.
    - **Data Flow:** Define clear data flow patterns. For UI-Game interaction, use the `EventBus` or dedicated state management solutions. Avoid direct manipulation of game state from the UI layer and vice-versa, except through defined channels.
    - **Configuration:** Externalize configuration values (e.g., API endpoints, game balance settings) rather than hardcoding them.
