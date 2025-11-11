import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GameRoom } from '@/entities/GameRoom';
import { User } from '@/entities/User';
import { Shield, Zap, X, Gamepad2, Loader2, Play, BrainCircuit, Clock, Compass } from 'lucide-react';


const PlayOptionsModal = ({ quiz, onClose }) => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('solo');
    const [gamemode, setGamemode] = useState('classic');
    const [timeLimit, setTimeLimit] = useState(quiz.time_limit || 20);
    const [isCreating, setIsCreating] = useState(false);
    
    const handlePlay = async () => {
        if (mode === 'solo') {
            // Labyrinth of Logic is now multiplayer-only
            const url = `${createPageUrl('Quiz')}?id=${quiz.id}&gamemode=${gamemode}&timeLimit=${timeLimit}`;
            navigate(url);
        } else {
            setIsCreating(true);
            try {
                const user = await User.me();
                
                // Check if user has unlocked Labyrinth
                if (gamemode === 'labyrinth' && (!user.unlocked_games || !user.unlocked_games.includes('labyrinth_of_logic'))) {
                    alert("⚠️ Labyrinth of Logic is a premium game! Unlock it in your Profile for 500 scrap.");
                    setIsCreating(false);
                    return;
                }
                
                const code = Math.random().toString(36).substring(2, 6).toUpperCase();
                const room = await GameRoom.create({
                    game_code: code,
                    quiz_id: quiz.id,
                    quiz_title: quiz.title,
                    host_email: user.email,
                    players: [{ email: user.email, name: user.full_name, score: 0, is_finished: false }],
                    mode: gamemode,
                    time_limit: timeLimit
                });

                if (gamemode === 'realm_rush') {
                    navigate(`${createPageUrl('RealmRushLobby')}?id=${room.id}`);
                } else if (gamemode === 'mind_maze') {
                    navigate(`${createPageUrl('MindMazeLobby')}?id=${room.id}`);
                } else if (gamemode === 'labyrinth') {
                    navigate(`${createPageUrl('LabyrinthLobby')}?id=${room.id}`);
                } else {
                    navigate(`${createPageUrl('GameRoomLobby')}?id=${room.id}`);
                }
            } catch (e) {
                console.error("Failed to create room", e);
                setIsCreating(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4" onClick={onClose}>
            <div className="bg-white border-8 border-black p-6 brutal-card w-full max-w-md transform rotate-1 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-black">Play Options</h2>
                    <button onClick={onClose} className="p-2 brutal-button hover:bg-gray-200">
                        <X size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button onClick={() => setMode('solo')} className={`py-3 font-black brutal-button ${mode === 'solo' ? 'bg-yellow-400' : 'bg-gray-200'}`}>SOLO</button>
                    <button onClick={() => setMode('multi')} className={`py-3 font-black brutal-button ${mode === 'multi' ? 'bg-yellow-400' : 'bg-gray-200'}`}>MULTIPLAYER</button>
                </div>
                
                <h3 className="font-bold text-lg mb-2">Select Gamemode:</h3>
                <div className="space-y-2 mb-4">
                    <button onClick={() => setGamemode('classic')} className={`w-full p-3 font-bold brutal-button text-left ${gamemode === 'classic' ? 'bg-green-300' : 'bg-gray-100'}`}>Classic</button>
                    <button onClick={() => setGamemode('strikeout')} className={`w-full p-3 font-bold brutal-button text-left ${gamemode === 'strikeout' ? 'bg-green-300' : 'bg-gray-100'}`}>Strikeout</button>
                    <button onClick={() => setGamemode('gamble')} className={`w-full p-3 font-bold brutal-button text-left ${gamemode === 'gamble' ? 'bg-green-300' : 'bg-gray-100'}`}>Gamble</button>
                    {mode === 'multi' && (
                        <>
                            <button onClick={() => setGamemode('sabotage')} className={`w-full p-3 font-bold brutal-button text-left ${gamemode === 'sabotage' ? 'bg-green-300' : 'bg-gray-100'}`}>Sabotage</button>
                            <button onClick={() => setGamemode('realm_rush')} className={`w-full p-3 font-bold brutal-button text-left ${gamemode === 'realm_rush' ? 'bg-green-300' : 'bg-gray-100'}`}>⚔️ Realm Rush</button>
                            <button onClick={() => setGamemode('mind_maze')} className={`w-full p-3 font-bold brutal-button text-left ${gamemode === 'mind_maze' ? 'bg-green-300' : 'bg-gray-100'}`}><BrainCircuit className="inline w-4 h-4 mr-2"/> Mind Maze</button>
                            <button onClick={() => setGamemode('labyrinth')} className={`w-full p-3 font-bold brutal-button text-left ${gamemode === 'labyrinth' ? 'bg-green-300' : 'bg-gray-100'}`}><Compass className="inline w-4 h-4 mr-2"/> Labyrinth of Logic 🔒</button>
                        </>
                    )}
                </div>

                <div className="mb-4 p-4 bg-gray-100 border-4 border-black">
                    <label className="font-bold text-sm mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> TIME PER QUESTION (SECONDS)
                    </label>
                    <input 
                        type="number" 
                        value={timeLimit} 
                        onChange={e => setTimeLimit(Number(e.target.value))}
                        min="5"
                        max="120"
                        className="w-full p-3 border-4 border-black font-black text-xl text-center"
                    />
                </div>
                
                <button
                    onClick={handlePlay}
                    disabled={isCreating}
                    className="w-full py-4 brutal-button bg-blue-500 hover:bg-blue-600 text-white font-black text-xl flex items-center justify-center gap-2"
                >
                    {isCreating ? <Loader2 className="animate-spin" /> : <Play />}
                    {isCreating ? 'Creating...' : (mode === 'solo' ? 'PLAY' : 'CREATE ROOM')}
                </button>
            </div>
        </div>
    );
};

export default function QuizCard({ quiz }) {
    const [showPlayOptions, setShowPlayOptions] = useState(false);

    return (
        <>
            <div className="bg-white border-8 border-black p-6 brutal-card transform rotate-2 hover:rotate-0 transition-transform duration-200">
                <h3 className="text-2xl font-black mb-2 brutal-text-shadow break-words">{quiz.title}</h3>
                <div className="flex justify-between items-center text-sm font-bold mb-4">
                    <span className="bg-gray-200 px-2 py-1 brutal-shadow">{quiz.category?.toUpperCase()}</span>
                    <span className="bg-gray-200 px-2 py-1 brutal-shadow">{quiz.questions?.length} Qs</span>
                </div>
                <p className="text-gray-700 mb-4 h-12 overflow-hidden break-words">{quiz.description}</p>
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowPlayOptions(true)}
                        className="py-3 px-6 bg-yellow-400 brutal-button font-black text-lg hover:bg-yellow-500"
                    >
                        PLAY
                    </button>
                </div>
            </div>
            {showPlayOptions && (
                <PlayOptionsModal
                    quiz={quiz}
                    onClose={() => setShowPlayOptions(false)}
                />
            )}
        </>
    );
}