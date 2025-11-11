import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, Play, Users, Droplets } from 'lucide-react';

export default function Aquaria() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const u = await base44.auth.me();
                setUser(u);
                const allQuizzes = await base44.entities.Quiz.list();
                setQuizzes(allQuizzes);
            } catch (e) {
                console.error(e);
                navigate(createPageUrl('Lobby'));
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [navigate]);

    const handlePlaySolo = () => {
        if (!selectedQuiz) {
            alert('Please select a quiz!');
            return;
        }
        navigate(`${createPageUrl('AquariaGame')}?quizId=${selectedQuiz}&mode=solo`);
    };

    const handleHostMultiplayer = async () => {
        if (!selectedQuiz || !user) {
            alert('Please select a quiz!');
            return;
        }

        const code = Math.random().toString(36).substring(2, 6).toUpperCase();
        const selectedQuizData = quizzes.find(q => q.id === selectedQuiz);
        
        const room = await base44.entities.GameRoom.create({
            game_code: code,
            quiz_id: selectedQuiz,
            quiz_title: selectedQuizData?.title || 'Aquaria Quiz',
            host_email: user.email,
            players: [{ email: user.email, name: user.full_name, score: 0, is_finished: false }],
            spectators: [],
            mode: 'aquaria',
            misc_data: {}
        });
        
        navigate(`${createPageUrl('AquariaLobby')}?id=${room.id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-cyan-900 to-blue-900 flex items-center justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-cyan-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-cyan-900 via-blue-900 to-indigo-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 brutal-card inline-block">
                        <div className="bg-black text-white p-8">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <Droplets className="w-16 h-16 text-cyan-400" />
                                <h1 className="text-5xl font-black">AQUARIA</h1>
                                <Droplets className="w-16 h-16 text-cyan-400" />
                            </div>
                            <p className="text-xl font-bold text-cyan-400">Dive Deep Into Knowledge!</p>
                        </div>
                    </div>
                </div>

                <div className="bg-cyan-800 border-8 border-black p-8 brutal-card mb-8">
                    <h2 className="text-3xl font-black text-white mb-6">SELECT YOUR QUIZ</h2>
                    
                    <div className="mb-6">
                        <label className="font-bold text-white block mb-3">Choose a Quiz to Play:</label>
                        <select
                            value={selectedQuiz}
                            onChange={(e) => setSelectedQuiz(e.target.value)}
                            className="w-full p-4 border-4 border-black font-bold text-xl bg-white"
                        >
                            <option value="">-- Select Quiz --</option>
                            {quizzes.map(q => (
                                <option key={q.id} value={q.id}>{q.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <button 
                            onClick={handlePlaySolo}
                            disabled={!selectedQuiz}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-black py-6 brutal-button flex items-center justify-center gap-3 text-xl"
                        >
                            <Play className="w-6 h-6"/> PLAY SOLO
                        </button>
                        
                        <button 
                            onClick={handleHostMultiplayer}
                            disabled={!selectedQuiz}
                            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-black py-6 brutal-button flex items-center justify-center gap-3 text-xl"
                        >
                            <Users className="w-6 h-6"/> HOST MULTIPLAYER
                        </button>
                    </div>
                </div>

                <div className="bg-black/50 p-6 brutal-card text-white">
                    <h3 className="text-2xl font-black mb-4">HOW TO PLAY</h3>
                    <ul className="space-y-2 font-bold">
                        <li>🐠 Swim through the ocean depths</li>
                        <li>❓ Answer questions to earn points</li>
                        <li>🏆 Beat your friends in multiplayer mode</li>
                        <li>⭐ Unlock achievements and power-ups</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}