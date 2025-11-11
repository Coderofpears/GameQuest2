import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Users, Loader2, Play } from 'lucide-react';

export default function JoinGame() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [gameCode, setGameCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeRooms, setActiveRooms] = useState([]);

    useEffect(() => {
        base44.auth.me().then(u => {
            setUser(u);
            loadActiveRooms();
        }).catch(() => {
            navigate(createPageUrl('Lobby'));
        });
    }, [navigate]);

    const loadActiveRooms = async () => {
        try {
            const rooms = await base44.entities.GameRoom.filter({ status: 'waiting' });
            setActiveRooms(rooms.slice(0, 10));
        } catch (e) {
            console.error("Error loading rooms:", e);
        }
    };

    const handleJoinWithCode = async (e) => {
        e.preventDefault();
        if (!gameCode || !user) return;
        
        setLoading(true);
        setError('');
        
        try {
            const rooms = await base44.entities.GameRoom.filter({ game_code: gameCode.toUpperCase(), status: 'waiting' });
            
            if (rooms.length > 0) {
                const room = rooms[0];
                const playerExists = room.players.find(p => p.email === user.email);
                
                if (!playerExists) {
                    const newPlayer = { email: user.email, name: user.full_name, score: 0, is_finished: false };
                    const updatedPlayers = [...room.players, newPlayer];
                    await base44.entities.GameRoom.update(room.id, { players: updatedPlayers });
                }
                
                // Navigate based on game mode
                if (room.mode === 'realm_rush') {
                    navigate(`${createPageUrl('RealmRushLobby')}?id=${room.id}`);
                } else if (room.mode === 'mind_maze') {
                    navigate(`${createPageUrl('MindMazeLobby')}?id=${room.id}`);
                } else if (room.mode === 'aquaria') {
                    navigate(`${createPageUrl('AquariaLobby')}?id=${room.id}`);
                } else if (room.gamemaker_game_id) {
                    navigate(`${createPageUrl('GameMakerLobby')}?id=${room.id}`);
                } else {
                    navigate(`${createPageUrl('GameRoomLobby')}?id=${room.id}`);
                }
            } else {
                setError('Room not found or has already started.');
            }
        } catch (err) {
            setError('Error joining room. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async (room) => {
        if (!user) return;
        
        setLoading(true);
        try {
            const playerExists = room.players.find(p => p.email === user.email);
            
            if (!playerExists) {
                const newPlayer = { email: user.email, name: user.full_name, score: 0, is_finished: false };
                const updatedPlayers = [...room.players, newPlayer];
                await base44.entities.GameRoom.update(room.id, { players: updatedPlayers });
            }
            
            // Navigate based on game mode
            if (room.mode === 'realm_rush') {
                navigate(`${createPageUrl('RealmRushLobby')}?id=${room.id}`);
            } else if (room.mode === 'mind_maze') {
                navigate(`${createPageUrl('MindMazeLobby')}?id=${room.id}`);
            } else if (room.mode === 'aquaria') {
                navigate(`${createPageUrl('AquariaLobby')}?id=${room.id}`);
            } else if (room.gamemaker_game_id) {
                navigate(`${createPageUrl('GameMakerLobby')}?id=${room.id}`);
            } else {
                navigate(`${createPageUrl('GameRoomLobby')}?id=${room.id}`);
            }
        } catch (err) {
            setError('Error joining room.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="bg-black border-8 border-purple-500 p-8 brutal-card inline-block">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <Users className="w-16 h-16 text-purple-400" />
                            <h1 className="text-5xl font-black text-white">JOIN GAME</h1>
                        </div>
                        <p className="text-xl font-bold text-purple-400">Enter a Code or Browse Active Games</p>
                    </div>
                </div>

                {/* Join by Code */}
                <div className="bg-purple-800 p-8 brutal-card mb-8">
                    <h2 className="font-black text-3xl text-white mb-6 text-center">ENTER GAME CODE</h2>
                    <form onSubmit={handleJoinWithCode} className="max-w-md mx-auto">
                        <div className="flex gap-3 mb-4">
                            <input 
                                type="text" 
                                placeholder="ENTER 4-DIGIT CODE" 
                                value={gameCode}
                                onChange={e => setGameCode(e.target.value.toUpperCase())}
                                maxLength="4"
                                className="flex-1 p-4 border-4 border-black text-2xl font-black text-center tracking-widest uppercase"
                                disabled={loading}
                            />
                            <button 
                                type="submit" 
                                disabled={loading || !gameCode}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-black px-8 brutal-button flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Play />}
                                JOIN
                            </button>
                        </div>
                        {error && <p className="text-red-400 font-bold text-center">{error}</p>}
                    </form>
                </div>

                {/* Active Rooms */}
                <div className="bg-black border-8 border-purple-500 p-8 brutal-card">
                    <h2 className="font-black text-3xl text-white mb-6 flex items-center justify-between">
                        <span>ACTIVE GAME ROOMS</span>
                        <button 
                            onClick={loadActiveRooms}
                            className="text-sm bg-purple-600 hover:bg-purple-700 px-4 py-2 brutal-button"
                        >
                            REFRESH
                        </button>
                    </h2>
                    
                    {activeRooms.length > 0 ? (
                        <div className="space-y-4">
                            {activeRooms.map(room => (
                                <div key={room.id} className="bg-purple-800 p-6 brutal-card flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className="text-3xl font-black text-yellow-400 tracking-widest">{room.game_code}</p>
                                            <span className="bg-purple-600 text-white px-3 py-1 font-bold text-xs brutal-shadow">
                                                {room.mode?.toUpperCase() || 'CLASSIC'}
                                            </span>
                                        </div>
                                        <p className="text-white font-bold">{room.quiz_title}</p>
                                        <p className="text-purple-300 text-sm">
                                            Host: {room.players?.[0]?.name} • {room.players?.length || 0} players
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleJoinRoom(room)}
                                        disabled={loading}
                                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-black py-3 px-6 brutal-button flex items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <Play />}
                                        JOIN
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Users className="w-24 h-24 mx-auto text-purple-600 mb-4" />
                            <p className="text-xl font-bold text-purple-400">No active game rooms at the moment</p>
                            <p className="text-purple-300 mt-2">Ask a friend to host a game or enter a game code above!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}