# Space Shooter

A simple and fun 2D space shooter game built with modern web technologies.

This project serves as a code sample to demonstrate how to build a simple game using Phaser 3 and Vite, and how to set up a modern development environment with linting and a proper build process.

## Features

*   Endless waves of enemies with increasing difficulty.
*   20 different enemy ship sprites.
*   A beautiful, scrolling space background.
*   Player movement and shooting.
*   Score and wave tracking.
*   Randomized enemy movement.

## Technology Stack

This project uses a number of modern web technologies to provide a great development experience and a fun game.

*   **[Phaser 3](https://phaser.io/phaser3)**: A fast, free, and fun open source HTML5 game framework that offers WebGL and Canvas rendering across desktop and mobile web browsers. We use it to handle all the core game logic, including sprites, physics, and input.

*   **[Vite](https://vitejs.dev/)**: A modern frontend build tool that provides an extremely fast development server and bundles our code for production. It handles our assets, allows us to use ES modules, and provides a great developer experience.

*   **[ESLint](https://eslint.org/)**: A pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript. We use it to enforce a consistent code style and to catch syntax errors before they become bugs.

*   **Generative AI**: All the visual assets in this game (the player ship, enemy ships, and backgrounds) were created using a generative AI model.

## How to Play

*   **Move:** Use the `Left` and `Right` arrow keys to move your ship.
*   **Shoot:** Press the `Spacebar` to fire your weapon.

## Local Development

To run the game on your local machine, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd smallgame-nano-2
    ```

3.  **Install the dependencies:**

    ```bash
    npm install
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    This will start a local server (usually on `http://localhost:5173`) with live reloading and ESLint error checking in the console.

## Code Quality

This project uses ESLint to enforce a consistent code style. To manually run the linter, use the following command:

```bash
npm run lint
```

## Build for Production

To build the game for production, run the following command:

```bash
npm run build
```

This will create a `public` directory in the root of the project. This directory contains all the optimized and bundled game files, and it is the directory that should be deployed to a static web host like Firebase Hosting.
