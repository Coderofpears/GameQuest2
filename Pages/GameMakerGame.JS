import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft } from 'lucide-react';

export default function GameMakerGuide() {
    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-white">
            <div className="max-w-4xl mx-auto">
                <Link to={createPageUrl('GameMaker')} className="inline-flex items-center gap-2 mb-6 font-bold text-white bg-gray-700 p-3 brutal-button">
                    <ArrowLeft /> BACK TO GAMEMAKER
                </Link>

                <div className="bg-black border-8 border-cyan-500 p-8 brutal-card mb-8">
                    <h1 className="text-4xl font-black mb-2 text-cyan-400">GAMEMAKER V4 DOCS</h1>
                    <p className="text-xl font-bold">Complete Guide with AI, Auto-Save, Web Search & More!</p>
                </div>

                {/* What's New in V4.1 */}
                <div className="bg-gradient-to-r from-green-900 to-cyan-900 p-6 brutal-card mb-6">
                    <h2 className="text-2xl font-black mb-4 text-green-400">✨ NEW IN V4.1</h2>
                    <ul className="space-y-2 text-white font-bold">
                        <li>💾 <strong>Auto-Save</strong> - Automatically saves every 2 seconds</li>
                        <li>🌐 <strong>AI Web Search</strong> - AI can search the web for tutorials & solutions</li>
                        <li>🎨 <strong>Assets Panel</strong> - Moved AI asset generator to sidebar (always accessible)</li>
                        <li>📦 <strong>Shared Assets</strong> - Upload once, use in all nodes (Blockly & JS)</li>
                        <li>⚡ <strong>Fixed JS Execution</strong> - JavaScript code now runs properly</li>
                        <li>🐛 <strong>Fixed Blockly Bug</strong> - No more Mutator errors</li>
                        <li>🤖 <strong>Enhanced AI</strong> - Better code generation and analysis</li>
                    </ul>
                </div>

                {/* Auto-Save */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 brutal-card mb-6">
                    <h2 className="text-2xl font-black mb-4 text-blue-400">💾 AUTO-SAVE</h2>
                    <div className="space-y-4">
                        <div className="bg-gray-800 p-4 rounded">
                            <h3 className="font-black text-lg text-blue-400 mb-2">How It Works</h3>
                            <p className="text-sm text-gray-300 mb-3">
                                Your work is automatically saved every 2 seconds when you stop typing or editing blocks!
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-green-400">✓</span>
                                    <span className="text-sm">Saves in background without interrupting work</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-green-400">✓</span>
                                    <span className="text-sm">Works for both Blockly and JavaScript modes</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-green-400">✓</span>
                                    <span className="text-sm">No more lost work!</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Web Search */}
                <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-6 brutal-card mb-6">
                    <h2 className="text-2xl font-black mb-4 text-purple-400">🌐 AI WEB SEARCH</h2>
                    <div className="space-y-4">
                        <div className="bg-gray-800 p-4 rounded">
                            <h3 className="font-black text-lg text-purple-400 mb-2">Search-Enabled AI</h3>
                            <p className="text-sm text-gray-300 mb-3">
                                The AI can now search the internet for tutorials, examples, and solutions!
                            </p>
                            <div className="space-y-2">
                                <div className="bg-gray-900 p-2 rounded text-sm">
                                    <span className="text-purple-400">You:</span> "Search for Three.js lighting tutorial"
                                </div>
                                <div className="bg-gray-900 p-2 rounded text-sm">
                                    <span className="text-purple-400">You:</span> "How to make a platformer jump mechanic"
                                </div>
                                <div className="bg-gray-900 p-2 rounded text-sm">
                                    <span className="text-purple-400">You:</span> "Find examples of particle systems"
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded">
                            <h3 className="font-black text-lg text-purple-400 mb-2">When AI Searches</h3>
                            <p className="text-sm text-gray-300">
                                AI automatically searches the web when you use keywords like:
                                <br/>• "search" • "find" • "how to" • "tutorial" • "example"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Assets System */}
                <div className="bg-gradient-to-r from-yellow-900 to-orange-900 p-6 brutal-card mb-6">
                    <h2 className="text-2xl font-black mb-4 text-yellow-400">🎨 ASSETS PANEL</h2>
                    <div className="space-y-4">
                        <div className="bg-gray-800 p-4 rounded">
                            <h3 className="font-black text-lg text-yellow-400 mb-2">Centralized Asset Management</h3>
                            <p className="text-sm text-gray-300 mb-3">
                                AI Asset Generator and File Uploader are now in the left sidebar, accessible from all nodes!
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-yellow-400">🤖</span>
                                    <span className="text-sm"><strong>AI Generate</strong> - Create sprites, backgrounds, items</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-yellow-400">📤</span>
                                    <span className="text-sm"><strong>Upload Files</strong> - Images, sounds, data files</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-yellow-400">📋</span>
                                    <span className="text-sm"><strong>Copy URLs</strong> - One-click URL copying</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-yellow-400">✨</span>
                                    <span className="text-sm"><strong>Use Everywhere</strong> - Works in Blockly & JavaScript</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded">
                            <h3 className="font-black text-lg text-yellow-400 mb-2">How to Use Assets</h3>
                            <pre className="text-xs bg-black p-3 mt-2 overflow-x-auto text-white">
{`WORKFLOW:
1. Generate or Upload asset in Assets panel
2. Click "Copy URL" on the asset
3. Paste URL into your code:

BLOCKLY:
  Create Sprite "player" 
  Image: [paste URL here]

JAVASCRIPT:
  game.createSprite('player', 'https://...url...', 100, 100);`}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* JavaScript Execution */}
                <div className="bg-gradient-to-r from-cyan-900 to-blue-900 p-6 brutal-card mb-6">
                    <h2 className="text-2xl font-black mb-4 text-cyan-400">⚡ JAVASCRIPT EXECUTION</h2>
                    <div className="space-y-4">
                        <div className="bg-gray-800 p-4 rounded">
                            <h3 className="font-black text-lg text-cyan-400 mb-2">Fixed & Enhanced</h3>
                            <p className="text-sm text-gray-300 mb-3">
                                JavaScript code now executes properly with full GameRuntime API!
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-green-400">✓</span>
                                    <span className="text-sm">Real-time 60 FPS game loop</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-green-400">✓</span>
                                    <span className="text-sm">Full access to canvas (ctx) and game API</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-green-400">✓</span>
                                    <span className="text-sm">Input handling (keyboard, mouse)</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-green-400">✓</span>
                                    <span className="text-sm">Sprite management and physics</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded">
                            <h3 className="font-black text-lg text-cyan-400 mb-2">JavaScript Game API</h3>
                            <pre className="text-xs bg-black p-3 mt-2 overflow-x-auto text-white">
{`// Available in JS mode:

// SPRITES
game.createSprite(id, imageSrc, x, y)
game.moveSprite(id, dx, dy)
game.setPosition(id, x, y)
game.getSprite(id)
game.rotateSprite(id, angle)

// PHYSICS
game.applyGravity(id, force)
game.applyVelocity(id, vx, vy)
game.checkCollision(id1, id2)

// INPUT
game.isKeyPressed(key)     // 'ArrowRight', 'Space', etc.
game.getMousePos()         // {x, y}
game.isMouseClicked()

// STATE
game.setGlobal(key, value)
game.getGlobal(key)

// DRAWING (ctx)
ctx.fillStyle = '#FF0000'
ctx.fillRect(x, y, w, h)
ctx.fillText('Score: ' + score, x, y)
ctx.drawImage(img, x, y)`}
                            </pre>
                        </div>

                        <div className="bg-gray-800 p-4 rounded">
                            <h3 className="font-black text-lg text-cyan-400 mb-2">Example: Platformer</h3>
                            <pre className="text-xs bg-black p-3 mt-2 overflow-x-auto text-white">
{`// Create player on first run
if (!game.getSprite('player')) {
    game.createSprite('player', 'player.png', 100, 100);
    game.setGlobal('score', 0);
}

// Apply gravity
game.applyGravity('player', 0.8);

// Handle input
if (game.isKeyPressed('ArrowRight')) {
    game.moveSprite('player', 5, 0);
}
if (game.isKeyPressed('ArrowLeft')) {
    game.moveSprite('player', -5, 0);
}
if (game.isKeyPressed('Space')) {
    const player = game.getSprite('player');
    if (player.y >= 400) { // On ground
        game.applyVelocity('player', 0, -15);
    }
}

// Draw UI
ctx.fillStyle = 'white';
ctx.font = '24px Arial';
ctx.fillText('Score: ' + game.getGlobal('score'), 20, 40);`}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* AI Codebase Access */}
                <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 brutal-card mb-6">
                    <h2 className="text-2xl font-black mb-4 text-purple-400">🤖 AI FULL CODEBASE ACCESS</h2>
                    <div className="space-y-4">
                        <div className="bg-gray-800 p-4 rounded">
                            <h3 className="font-black text-lg text-purple-400 mb-2">Complete Development Control</h3>
                            <p className="text-sm text-gray-300 mb-3">
                                The AI can view, analyze, add, edit, and delete your game code!
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-green-400">➕</span>
                                    <span className="text-sm"><strong>Add Nodes</strong> - "Add a platformer node with WASD controls"</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-blue-400">✏️</span>
                                    <span className="text-sm"><strong>Edit Nodes</strong> - "Change player speed to 10"</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-red-400">🗑️</span>
                                    <span className="text-sm"><strong>Delete Nodes</strong> - "Remove unused menu node"</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-purple-400">🔍</span>
                                    <span className="text-sm"><strong>Analyze</strong> - "Show all nodes and suggest improvements"</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-yellow-400">🔧</span>
                                    <span className="text-sm"><strong>Refactor</strong> - "Optimize my game for performance"</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded">
                            <h3 className="font-black text-lg text-purple-400 mb-2">AI Sees Everything</h3>
                            <p className="text-sm text-gray-300">The AI has complete visibility into:</p>
                            <ul className="text-sm text-gray-300 space-y-1 mt-2 ml-4">
                                <li>• All nodes (type, label, code, connections)</li>
                                <li>• JavaScript & Blockly code</li>
                                <li>• Global variables</li>
                                <li>• Shared assets</li>
                                <li>• Collaborators</li>
                                <li>• Publish status</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bug Fixes */}
                <div className="bg-gradient-to-r from-red-900 to-orange-900 p-6 brutal-card mb-6">
                    <h2 className="text-2xl font-black mb-4 text-red-400">🐛 BUG FIXES</h2>
                    <div className="space-y-4">
                        <div className="bg-gray-800 p-4 rounded">
                            <h3 className="font-black text-lg text-red-400 mb-2">Fixed Issues</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-green-400">✓</span>
                                    <span className="text-sm"><strong>Blockly.Mutator Error</strong> - Removed custom mutator code</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-green-400">✓</span>
                                    <span className="text-sm"><strong>JS Execution</strong> - JavaScript code now runs properly</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-green-400">✓</span>
                                    <span className="text-sm"><strong>FocusManager</strong> - Fixed workspace disposal errors</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                                    <span className="text-green-400">✓</span>
                                    <span className="text-sm"><strong>Asset Access</strong> - Assets now work in all modes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Start */}
                <div className="bg-gray-800 p-6 brutal-card mb-6">
                    <h2 className="text-2xl font-black mb-4">🚀 QUICK START</h2>
                    <div className="space-y-3">
                        <div className="bg-gray-700 p-3 rounded">
                            <span className="bg-cyan-400 text-black px-2 py-1 font-black text-sm mr-2">1</span>
                            <span className="text-white">Create a new game</span>
                        </div>
                        <div className="bg-gray-700 p-3 rounded">
                            <span className="bg-cyan-400 text-black px-2 py-1 font-black text-sm mr-2">2</span>
                            <span className="text-white">Use <strong>Assets Panel</strong> to upload or generate sprites</span>
                        </div>
                        <div className="bg-gray-700 p-3 rounded">
                            <span className="bg-cyan-400 text-black px-2 py-1 font-black text-sm mr-2">3</span>
                            <span className="text-white">Ask <strong>AI Chat</strong> to generate your game</span>
                        </div>
                        <div className="bg-gray-700 p-3 rounded">
                            <span className="bg-cyan-400 text-black px-2 py-1 font-black text-sm mr-2">4</span>
                            <span className="text-white">Edit nodes in <strong>Blockly or JavaScript</strong> mode</span>
                        </div>
                        <div className="bg-gray-700 p-3 rounded">
                            <span className="bg-cyan-400 text-black px-2 py-1 font-black text-sm mr-2">5</span>
                            <span className="text-white">Click <strong>PLAYTEST</strong> to test instantly</span>
                        </div>
                        <div className="bg-gray-700 p-3 rounded">
                            <span className="bg-cyan-400 text-black px-2 py-1 font-black text-sm mr-2">6</span>
                            <span className="text-white"><strong>Auto-save</strong> handles the rest!</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}