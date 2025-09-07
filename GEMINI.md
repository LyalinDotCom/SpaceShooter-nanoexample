## Project Overview

This project is a simple and fun 2D space shooter game built with modern web technologies. It serves as a code sample to demonstrate how to build a simple game using Phaser 3 and Vite, and how to set up a modern development environment with linting and a proper build process.

The game features endless waves of enemies with increasing difficulty, 20 different enemy ship sprites, a scrolling space background, player movement and shooting, and score and wave tracking.

All the visual assets in this game (the player ship, enemy ships, and backgrounds) were created using a generative AI model.

## Technology Stack

*   **[Phaser 3](https://phaser.io/phaser3)**: A fast, free, and fun open source HTML5 game framework that offers WebGL and Canvas rendering across desktop and mobile web browsers. It is used to handle all the core game logic, including sprites, physics, and input.
*   **[Vite](https://vitejs.dev/)**: A modern frontend build tool that provides an extremely fast development server and bundles our code for production. It handles assets, allows the use of ES modules, and provides a great developer experience.
*   **[ESLint](https://eslint.org/)**: A pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript. It is used to enforce a consistent code style and to catch syntax errors before they become bugs.

## Building and Running

### Local Development

To run the game on your local machine, follow these steps:

1.  **Install the dependencies:**

    ```bash
    npm install
    ```

2.  **Run the development server:**

    ```bash
    npm run dev
    ```

    This will start a local server (usually on `http://localhost:5173`) with live reloading and ESLint error checking in the console.

### Build for Production

To build the game for production, run the following command:

```bash
npm run build
```

This will create a `public` directory in the root of the project. This directory contains all the optimized and bundled game files, and it is the directory that should be deployed to a static web host like Firebase Hosting.

## Development Conventions

### Code Quality

This project uses ESLint to enforce a consistent code style. To manually run the linter, use the following command:

```bash
npm run lint
```

### Testing

There are no tests configured for this project.
