export const generateMaze = (width, height) => {
    // Ensure dimensions are odd
    width = width % 2 === 0 ? width + 1 : width;
    height = height % 2 === 0 ? height + 1 : height;

    let maze = Array(height).fill(null).map(() => Array(width).fill(1)); // 1 = wall

    function carve(x, y) {
        maze[y][x] = 0; // 0 = path

        const directions = [
            { x: 0, y: -2 }, // Up
            { x: 2, y: 0 },  // Right
            { x: 0, y: 2 },  // Down
            { x: -2, y: 0 }  // Left
        ];

        // Shuffle directions
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }

        for (const dir of directions) {
            const nx = x + dir.x;
            const ny = y + dir.y;

            if (ny > 0 && ny < height -1 && nx > 0 && nx < width - 1 && maze[ny][nx] === 1) {
                maze[y + dir.y / 2][x + dir.x / 2] = 0; // Carve wall between
                carve(nx, ny);
            }
        }
    }

    carve(1, 1);
    
    // Set start and end points
    maze[1][1] = 2; // Start
    maze[height - 2][width - 2] = 3; // Exit

    return maze;
};