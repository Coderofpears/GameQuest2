import React, { useRef, useEffect } from 'react';

export class GameRuntime {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gameState = {};
        this.sprites = {};
        this.entities = [];
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.mouseClicked = false;
        this.three = null; // Three.js scene
        this.reactComponents = {};
        this.breakpoints = [];
        this.isPaused = false;
        this.currentLine = null;
        this.callStack = [];
        this.variables = {};
    }

    // Game State Management
    getGlobal(key) {
        return this.gameState[key];
    }

    setGlobal(key, value) {
        this.gameState[key] = value;
        this.variables[key] = value; // For debugging
    }

    // Input Handling
    isKeyPressed(key) {
        return this.keys[key] || false;
    }

    getMousePos() {
        return this.mousePos;
    }

    isMouseClicked() {
        return this.mouseClicked;
    }

    // Sprite Management
    createSprite(id, imageSrc, x, y) {
        const sprite = {
            id,
            image: imageSrc,
            x,
            y,
            velocityX: 0,
            velocityY: 0,
            rotation: 0,
            scale: 1,
            visible: true,
            width: 50,
            height: 50
        };
        this.entities.push(sprite);
        return sprite;
    }

    getSprite(id) {
        return this.entities.find(e => e.id === id);
    }

    moveSprite(id, dx, dy) {
        const sprite = this.getSprite(id);
        if (sprite) {
            sprite.x += dx;
            sprite.y += dy;
        }
    }

    setPosition(id, x, y) {
        const sprite = this.getSprite(id);
        if (sprite) {
            sprite.x = x;
            sprite.y = y;
        }
    }

    rotateSprite(id, angle) {
        const sprite = this.getSprite(id);
        if (sprite) {
            sprite.rotation = angle;
        }
    }

    // Physics
    applyGravity(id, force) {
        const sprite = this.getSprite(id);
        if (sprite) {
            sprite.velocityY = (sprite.velocityY || 0) + force;
            sprite.y += sprite.velocityY;
        }
    }

    applyVelocity(id, vx, vy) {
        const sprite = this.getSprite(id);
        if (sprite) {
            sprite.velocityX = vx;
            sprite.velocityY = vy;
            sprite.x += vx;
            sprite.y += vy;
        }
    }

    checkCollision(id1, id2) {
        const s1 = this.getSprite(id1);
        const s2 = this.getSprite(id2);
        if (!s1 || !s2) return false;

        return (
            s1.x < s2.x + s2.width &&
            s1.x + s1.width > s2.x &&
            s1.y < s2.y + s2.height &&
            s1.y + s1.height > s2.y
        );
    }

    // Navigation
    goToNode(nodeId) {
        if (this.onNodeChange) {
            this.onNodeChange(nodeId);
        }
    }

    broadcastToNode(nodeId, message) {
        if (this.onBroadcast) {
            this.onBroadcast(nodeId, message);
        }
    }

    // Three.js Integration
    initThree() {
        if (typeof window.THREE === 'undefined') {
            console.error('Three.js not loaded');
            return null;
        }

        const THREE = window.THREE;
        this.three = {
            scene: new THREE.Scene(),
            camera: new THREE.PerspectiveCamera(75, this.canvas.width / this.canvas.height, 0.1, 1000),
            renderer: new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true }),
            objects: {},
            lights: []
        };

        this.three.renderer.setSize(this.canvas.width, this.canvas.height);
        return this.three;
    }

    createThreeMesh(type, params, color) {
        if (!this.three || !window.THREE) return null;
        
        const THREE = window.THREE;
        let geometry;

        switch (type) {
            case 'box':
                geometry = new THREE.BoxGeometry(params.width, params.height, params.depth);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(params.radius, 32, 32);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(params.radiusTop, params.radiusBottom, params.height, 32);
                break;
            default:
                geometry = new THREE.BoxGeometry(1, 1, 1);
        }

        const material = new THREE.MeshStandardMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        
        return mesh;
    }

    // React UI Integration
    createReactComponent(name, component) {
        this.reactComponents[name] = {
            component,
            props: {},
            state: {},
            visible: true
        };
    }

    updateReactProp(name, prop, value) {
        if (this.reactComponents[name]) {
            this.reactComponents[name].props[prop] = value;
        }
    }

    // Debug Methods
    setBreakpoint(node, line) {
        this.breakpoints.push({ node, line });
    }

    removeBreakpoint(node, line) {
        this.breakpoints = this.breakpoints.filter(bp => 
            bp.node !== node || bp.line !== line
        );
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    step() {
        // Execute one line
        this.isPaused = true;
    }

    // Platformer Helpers
    platformSetGravity(force) {
        this.platformGravity = force;
    }

    platformJump(spriteId, force) {
        const sprite = this.getSprite(spriteId);
        if (sprite && sprite.isGrounded) {
            sprite.velocityY = force;
            sprite.isGrounded = false;
        }
    }

    platformIsGrounded(spriteId) {
        const sprite = this.getSprite(spriteId);
        return sprite ? sprite.isGrounded || false : false;
    }

    // Top-Down Helpers
    topdownGridMove(spriteId, direction, gridSize) {
        const sprite = this.getSprite(spriteId);
        if (!sprite) return;

        switch (direction) {
            case 'up':
                sprite.y -= gridSize;
                break;
            case 'down':
                sprite.y += gridSize;
                break;
            case 'left':
                sprite.x -= gridSize;
                break;
            case 'right':
                sprite.x += gridSize;
                break;
        }
    }

    topdownSetGridPosition(spriteId, gridX, gridY, gridSize = 32) {
        const sprite = this.getSprite(spriteId);
        if (sprite) {
            sprite.x = gridX * gridSize;
            sprite.y = gridY * gridSize;
        }
    }

    topdownGetGridPosition(spriteId, gridSize = 32) {
        const sprite = this.getSprite(spriteId);
        if (!sprite) return null;
        return {
            gridX: Math.floor(sprite.x / gridSize),
            gridY: Math.floor(sprite.y / gridSize)
        };
    }
}

export default function JavaScriptRuntimeProvider({ children, onRuntimeReady }) {
    const runtimeRef = useRef(null);

    useEffect(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const runtime = new GameRuntime(canvas, ctx);
        runtimeRef.current = runtime;

        if (onRuntimeReady) {
            onRuntimeReady(runtime);
        }
    }, [onRuntimeReady]);

    return children;
}