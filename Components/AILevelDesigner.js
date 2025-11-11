import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Wand2, Loader2, Zap, Target, Skull, Map } from 'lucide-react';

export default function AILevelDesigner({ onLevelGenerated }) {
    const [mechanics, setMechanics] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [levelType, setLevelType] = useState('platformer');
    const [generating, setGenerating] = useState(false);
    const [generatedLevel, setGeneratedLevel] = useState(null);

    const generateLevel = async () => {
        if (!mechanics) {
            alert('Please describe your game mechanics first!');
            return;
        }

        setGenerating(true);
        try {
            const prompt = `Generate a game level design with the following specifications:
            
Game Type: ${levelType}
Difficulty: ${difficulty}
Game Mechanics: ${mechanics}

Please provide:
1. Level Layout (grid-based description with coordinates)
2. Enemy Placements (types, positions, patrol routes)
3. Collectibles/Power-ups (positions and types)
4. Puzzle Elements (if applicable)
5. Hazards/Obstacles
6. Victory Condition

Format the response as a detailed JSON structure.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        level_name: { type: "string" },
                        layout: {
                            type: "object",
                            properties: {
                                width: { type: "number" },
                                height: { type: "number" },
                                grid: { type: "array", items: { type: "array", items: { type: "string" } } },
                                platforms: { type: "array", items: { type: "object" } }
                            }
                        },
                        enemies: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    x: { type: "number" },
                                    y: { type: "number" },
                                    patrol_points: { type: "array", items: { type: "object" } },
                                    behavior: { type: "string" }
                                }
                            }
                        },
                        collectibles: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    x: { type: "number" },
                                    y: { type: "number" },
                                    value: { type: "number" }
                                }
                            }
                        },
                        puzzles: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    description: { type: "string" },
                                    solution: { type: "string" },
                                    position: { type: "object" }
                                }
                            }
                        },
                        hazards: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    x: { type: "number" },
                                    y: { type: "number" },
                                    damage: { type: "number" }
                                }
                            }
                        },
                        victory_condition: { type: "string" },
                        tips: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setGeneratedLevel(result);
            if (onLevelGenerated) {
                onLevelGenerated(result);
            }

            if (window.antd) {
                window.antd.message.success('Level design generated successfully!');
            }
        } catch (e) {
            console.error('Level generation failed:', e);
            if (window.antd) {
                window.antd.message.error('Failed to generate level');
            }
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-6 brutal-card">
            <div className="flex items-center gap-3 mb-4">
                <Wand2 className="w-8 h-8 text-yellow-400" />
                <h3 className="text-2xl font-black text-white">AI LEVEL DESIGNER</h3>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="font-bold text-white mb-2 block">Game Type</label>
                    <select
                        value={levelType}
                        onChange={(e) => setLevelType(e.target.value)}
                        className="w-full p-3 border-4 border-black font-bold text-lg"
                    >
                        <option value="platformer">Platformer</option>
                        <option value="puzzle">Puzzle</option>
                        <option value="shooter">Shooter</option>
                        <option value="rpg">RPG/Adventure</option>
                        <option value="racing">Racing</option>
                    </select>
                </div>

                <div>
                    <label className="font-bold text-white mb-2 block">Difficulty</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['easy', 'medium', 'hard'].map(diff => (
                            <button
                                key={diff}
                                onClick={() => setDifficulty(diff)}
                                className={`py-3 font-black brutal-button ${
                                    difficulty === diff 
                                        ? 'bg-yellow-400 text-black' 
                                        : 'bg-gray-700 text-white'
                                }`}
                            >
                                {diff.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="font-bold text-white mb-2 block">Game Mechanics & Features</label>
                    <textarea
                        placeholder="E.g., Double jump, wall sliding, enemy types: flying and ground, collectible coins, moving platforms, spike hazards..."
                        value={mechanics}
                        onChange={(e) => setMechanics(e.target.value)}
                        className="w-full p-3 border-4 border-black font-bold h-32"
                    />
                </div>

                <button
                    onClick={generateLevel}
                    disabled={generating || !mechanics}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 text-black font-black py-4 text-xl brutal-button flex items-center justify-center gap-3"
                >
                    {generating ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            GENERATING...
                        </>
                    ) : (
                        <>
                            <Zap className="w-6 h-6" />
                            GENERATE LEVEL DESIGN
                        </>
                    )}
                </button>
            </div>

            {generatedLevel && (
                <div className="mt-6 bg-black p-4 brutal-card space-y-4">
                    <h4 className="text-xl font-black text-yellow-400 flex items-center gap-2">
                        <Map className="w-6 h-6" />
                        {generatedLevel.level_name || 'Generated Level'}
                    </h4>

                    {generatedLevel.layout && (
                        <div className="bg-gray-800 p-3 rounded">
                            <h5 className="font-black text-white mb-2">📐 LAYOUT</h5>
                            <p className="text-gray-300 text-sm">
                                Size: {generatedLevel.layout.width}x{generatedLevel.layout.height}
                            </p>
                            {generatedLevel.layout.platforms && (
                                <p className="text-gray-400 text-xs mt-1">
                                    {generatedLevel.layout.platforms.length} platforms
                                </p>
                            )}
                        </div>
                    )}

                    {generatedLevel.enemies && generatedLevel.enemies.length > 0 && (
                        <div className="bg-gray-800 p-3 rounded">
                            <h5 className="font-black text-white mb-2 flex items-center gap-2">
                                <Skull className="w-5 h-5" /> ENEMIES ({generatedLevel.enemies.length})
                            </h5>
                            <div className="space-y-1">
                                {generatedLevel.enemies.slice(0, 3).map((enemy, idx) => (
                                    <div key={idx} className="text-sm text-gray-300">
                                        • {enemy.type} at ({enemy.x}, {enemy.y}) - {enemy.behavior}
                                    </div>
                                ))}
                                {generatedLevel.enemies.length > 3 && (
                                    <p className="text-xs text-gray-500">+ {generatedLevel.enemies.length - 3} more...</p>
                                )}
                            </div>
                        </div>
                    )}

                    {generatedLevel.collectibles && generatedLevel.collectibles.length > 0 && (
                        <div className="bg-gray-800 p-3 rounded">
                            <h5 className="font-black text-white mb-2 flex items-center gap-2">
                                <Target className="w-5 h-5" /> COLLECTIBLES ({generatedLevel.collectibles.length})
                            </h5>
                            <div className="space-y-1">
                                {generatedLevel.collectibles.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="text-sm text-gray-300">
                                        • {item.type} at ({item.x}, {item.y}) - Value: {item.value}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {generatedLevel.puzzles && generatedLevel.puzzles.length > 0 && (
                        <div className="bg-gray-800 p-3 rounded">
                            <h5 className="font-black text-white mb-2">🧩 PUZZLES</h5>
                            <div className="space-y-2">
                                {generatedLevel.puzzles.map((puzzle, idx) => (
                                    <div key={idx} className="text-sm text-gray-300 border-l-2 border-yellow-400 pl-2">
                                        <p className="font-bold">{puzzle.description}</p>
                                        <p className="text-xs text-gray-400">Solution: {puzzle.solution}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {generatedLevel.victory_condition && (
                        <div className="bg-green-900 p-3 rounded">
                            <h5 className="font-black text-white mb-1">🏆 VICTORY</h5>
                            <p className="text-sm text-gray-200">{generatedLevel.victory_condition}</p>
                        </div>
                    )}

                    {generatedLevel.tips && generatedLevel.tips.length > 0 && (
                        <div className="bg-blue-900 p-3 rounded">
                            <h5 className="font-black text-white mb-2">💡 DESIGN TIPS</h5>
                            <ul className="text-sm text-gray-200 space-y-1">
                                {generatedLevel.tips.map((tip, idx) => (
                                    <li key={idx}>• {tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(generatedLevel, null, 2));
                            if (window.antd) window.antd.message.success('Copied to clipboard!');
                        }}
                        className="w-full bg-cyan-600 text-white font-bold py-2 brutal-button"
                    >
                        📋 COPY JSON DATA
                    </button>
                </div>
            )}
        </div>
    );
}