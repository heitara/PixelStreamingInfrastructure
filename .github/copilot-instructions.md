# Pixel Streaming Infrastructure AI Instructions

## Project Overview
This is a monorepo-style project for UE Pixel Streaming infrastructure. It consists of a Signalling Server (Node.js), a Frontend library (TypeScript), and shared Common utilities.

### Component Structure
- **Common**: Shared utilities, protocols, and message definitions.
- **Signalling**: Core signalling logic library.
- **SignallingWebServer (Wilbur)**: The reference signalling server application.
- **Frontend/library**: Core frontend logic (no UI).
- **Frontend/ui-library**: UI components for the frontend.
- **Frontend/implementations/typescript**: Reference web player implementation.

## Build & Run Workflows
Dependencies must be built in a specific order due to local package linking.

### Build Order
1. `Common`
2. `Signalling`
3. `SignallingWebServer`
4. `Frontend/library`
5. `Frontend/ui-library`
6. `Frontend/implementations/typescript`

### Commands
- **Build**: Run `npm install && npm run build` in each directory in the order above.
- **Dev Server**: In `SignallingWebServer`, run `npm run develop` to watch all packages concurrently.
- **Run Server**: In `SignallingWebServer`, run `npm start`.
- **Frontend Dev**: In `Frontend/implementations/typescript`, run `npm run watch` or `npm run serve`.

## Code Style & Conventions
- **Language**: TypeScript is used exclusively.
- **Copyright**: All source files must start with:
  ```typescript
  // Copyright Emil Atanasov, Inc. All Rights Reserved.
  ```
- **Linting**: ESLint with `typescript-eslint` and `prettier`. Run `npm run lint` to check.
- **Imports**: Use explicit relative paths or package names.
- **Documentation**: TSDoc is used for API documentation.

## Architecture & Patterns
- **Signalling**: The `SignallingWebServer` wraps the `Signalling` library and uses `express` for serving content.
- **Frontend**: The `library` handles WebRTC and WebSocket connections. The `ui-library` provides the visual layer.
- **Messages**: Protocol messages are defined in `Common` and shared across backend and frontend.
- **Configuration**: `SignallingWebServer` uses `commander` for CLI args and `config.json` for settings.

## Key Files
- **Server Entry**: `SignallingWebServer/src/index.ts`
- **Frontend Entry**: `Frontend/implementations/typescript/src/game.ts`
- **Protocol Definitions**: `Common/src/Messages/*` and `Common/src/Protocol/SignallingProtocol.ts`
- **Server Config**: `SignallingWebServer/config.json`
