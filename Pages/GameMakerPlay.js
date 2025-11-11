import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';
import { GameRuntime } from '@/components/JavaScriptRuntime';

export default function GameMakerPlay() {
    const navigate = useNavigate();
    const location = useLocation();
    const canvasRef = useRef(null);
    const [game, setGame] = useState(null);
    const [user, setUser] = useState(null);
    const [gameRoom, setGameRoom] = useState(null);
    const [mode, setMode] = useState('solo');
    const [loading, setLoading] = useState(true);
    const [currentNode, setCurrentNode] = useState(null);
    const runtimeRef = useRef(null);

    const gameRoomId = new URLSearchParams(location.search).get('roomId');
    const gameId = new URLSearchParams(location.search).get('gameId');
    const modeParam = new URLSearchParams(location.search).get('mode');

    // Hide layout for fullscreen
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            body { margin: 0; overflow: hidden; }
            #root > div:first-child > header { display: none !important; }
            #root > div:first-child > main { padding: 0 !important; }
        `;
        document.head.appendChild(style);
        
        return () => {
            if (style.parentNode) {
                document.head.removeChild(style);
            }
        };
    }, []);

    // Initialize runtime
    useEffect(() => {
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const runtime = new GameRuntime(canvas, ctx);
        
        // Setup input handlers
        const handleKeyDown = (e) => {
            runtime.keys[e.key] = true;
        };
        const handleKeyUp = (e) => {
            runtime.keys[e.key] = false;
        };
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            runtime.mousePos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };
        const handleMouseDown = () => {
            runtime.mouseClicked = true;
            setTimeout(() => runtime.mouseClicked = false, 100);
        };
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        
        runtimeRef.current = runtime;

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
        };
    }, [canvasRef.current]);

    // Load game data
    useEffect(() => {
        const loadData = async () => {
            try {
                const u = await base44.auth.me();
                setUser(u);
                setMode(modeParam || 'solo');

                if (gameRoomId) {
                    const rooms = await base44.entities.GameRoom.filter({ id: gameRoomId });
                    if (rooms.length > 0) {
                        const room = rooms[0];
                        setGameRoom(room);
                        
                        const games = await base44.entities.GameMakerGame.filter({ id: room.gamemaker_game_id });
                        if (games.length > 0) {
                            setGame(games[0]);
                            const startNode = games[0].game_data?.nodes?.find(n => n.type === 'startgame') || games[0].game_data?.nodes?.[0];
                            setCurrentNode(startNode);
                        }
                    }
                } else if (gameId) {
                    const games = await base44.entities.GameMakerGame.filter({ id: gameId });
                    if (games.length > 0) {
                        setGame(games[0]);
                        const startNode = games[0].game_data?.nodes?.find(n => n.type === 'startgame') || games[0].game_data?.nodes?.[0];
                        setCurrentNode(startNode);
                    }
                }
            } catch (e) {
                console.error("Error loading game:", e);
                navigate(createPageUrl('GameMaker'));
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [gameRoomId, gameId, modeParam, navigate]);

    // Execute JavaScript code
    const executeJavaScript = useCallback(() => {
        if (!currentNode || !runtimeRef.current || !canvasRef.current) return;
        
        const runtime = runtimeRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Execute JavaScript code if present
        if (currentNode.javascriptCode && currentNode.codingMode === 'javascript') {
            try {
                // Create game API object
                const game = runtime;
                
                // Execute the code
                const executeCode = new Function('ctx', 'canvas', 'game', currentNode.javascriptCode);
                executeCode(ctx, canvas, game);
            } catch (e) {
                console.error('JavaScript execution error:', e);
            }
        }
    }, [currentNode]);

    // Game loop
    useEffect(() => {
        if (!currentNode || !runtimeRef.current) return;

        const interval = setInterval(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Render sprites from runtime
            const runtime = runtimeRef.current;
            runtime.entities.forEach(entity => {
                if (!entity.visible) return;
                
                if (entity.image && runtime.sprites[entity.image]) {
                    ctx.save();
                    ctx.translate(entity.x, entity.y);
                    ctx.rotate((entity.rotation || 0) * Math.PI / 180);
                    ctx.scale(entity.scale || 1, entity.scale || 1);
                    ctx.drawImage(runtime.sprites[entity.image], 0, 0);
                    ctx.restore();
                }
            });
            
            // Execute game code
            executeJavaScript();
        }, 1000 / 60); // 60 FPS

        return () => clearInterval(interval);
    }, [currentNode, executeJavaScript]);

    // Sync multiplayer state
    useEffect(() => {
        if (!gameRoomId || !runtimeRef.current) return;
        
        const interval = setInterval(async () => {
            const rooms = await base44.entities.GameRoom.filter({ id: gameRoomId });
            if (rooms.length > 0) {
                const room = rooms[0];
                setGameRoom(room);
                
                // Sync shared state
                if (room.misc_data?._shared && runtimeRef.current) {
                    runtimeRef.current.gameState = room.misc_data._shared;
                }
            }
        }, 100);
        
        return () => clearInterval(interval);
    }, [gameRoomId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 animate-spin text-white mx-auto mb-4" />
                    <p className="text-white font-bold">Loading game...</p>
                </div>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-2xl font-black mb-4">Game not found</p>
                    <button onClick={() => navigate(createPageUrl('GameMaker'))} className="bg-white text-black font-bold py-2 px-6 brutal-button">
                        Back to GameMaker
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen bg-gray-900 overflow-hidden relative">
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                className="absolute inset-0 w-full h-full"
                style={{ imageRendering: 'pixelated' }}
            />
            
            {/* Minimal UI */}
            <div className="absolute top-4 left-4 z-50 bg-black bg-opacity-70 text-white p-4 brutal-card">
                <p className="text-4xl font-black text-yellow-400">
                    {runtimeRef.current?.gameState?.score || 0}
                </p>
            </div>

            {mode === 'multiplayer' && gameRoom && (
                <div className="absolute top-20 left-4 z-50 bg-black bg-opacity-70 text-white p-4 brutal-card">
                    <h3 className="font-black text-sm mb-2">PLAYERS</h3>
                    <div className="space-y-1">
                        {gameRoom.players?.slice(0, 4).map(p => (
                            <div key={p.email} className="flex justify-between text-xs font-bold">
                                <span>{p.name.substring(0, 10)}{p.email === user?.email && ' (You)'}</span>
                                <span className="text-yellow-400 ml-2">{p.score || 0}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}