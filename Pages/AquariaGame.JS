import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, Droplets, Trophy } from 'lucide-react';

export default function AquariaGame() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [gameRoom, setGameRoom] = useState(null);
    const [mode, setMode] = useState('solo');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gameState, setGameState] = useState('playing');
    const [fishPosition, setFishPosition] = useState({ x: 50, y: 50 });

    const gameRoomId = new URLSearchParams(location.search).get('roomId');
    const quizId = new URLSearchParams(location.search).get('quizId');
    const modeParam = new URLSearchParams(location.search).get('mode');

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
                        const quizData = await base44.entities.Quiz.filter({ id: room.quiz_id });
                        if (quizData.length > 0) setQuiz(quizData[0]);
                    }
                } else if (quizId) {
                    const quizData = await base44.entities.Quiz.filter({ id: quizId });
                    if (quizData.length > 0) setQuiz(quizData[0]);
                }
            } catch (e) {
                console.error("Error loading game:", e);
                navigate(createPageUrl('Aquaria'));
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [gameRoomId, quizId, modeParam, navigate]);

    useEffect(() => {
        if (mode === 'multiplayer' && gameRoomId) {
            const interval = setInterval(async () => {
                const rooms = await base44.entities.GameRoom.filter({ id: gameRoomId });
                if (rooms.length > 0) setGameRoom(rooms[0]);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [mode, gameRoomId]);

    const handleAnswer = async (answerIndex) => {
        if (!quiz || gameState !== 'playing') return;
        
        const currentQuestion = quiz.questions[currentQuestionIndex];
        const isCorrect = answerIndex === currentQuestion.correct_answer;
        
        const newAnswer = {
            question_index: currentQuestionIndex,
            selected_answer: answerIndex,
            correct_answer: currentQuestion.correct_answer,
            is_correct: isCorrect
        };
        
        const newAnswers = [...answers, newAnswer];
        setAnswers(newAnswers);
        
        if (isCorrect) {
            setScore(score + 100);
            setFishPosition({ x: fishPosition.x + 10, y: Math.max(20, fishPosition.y - 5) });
        } else {
            setFishPosition({ x: fishPosition.x + 5, y: Math.min(80, fishPosition.y + 5) });
        }

        if (currentQuestionIndex < quiz.questions.length - 1) {
            setTimeout(() => setCurrentQuestionIndex(currentQuestionIndex + 1), 1000);
        } else {
            setGameState('finished');
            
            if (mode === 'multiplayer' && gameRoom && user) {
                const updatedPlayers = gameRoom.players.map(p => 
                    p.email === user.email ? { ...p, score, is_finished: true } : p
                );
                await base44.entities.GameRoom.update(gameRoom.id, { players: updatedPlayers });
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-cyan-900 to-blue-900 flex items-center justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-cyan-400" />
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-cyan-900 to-blue-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-2xl font-black mb-4">Quiz not found</p>
                    <button onClick={() => navigate(createPageUrl('Aquaria'))} className="bg-cyan-600 text-white font-bold py-2 px-6 brutal-button">
                        Back to Aquaria
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'finished') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-cyan-900 to-blue-900 p-4 md:p-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 brutal-card inline-block mb-8">
                        <div className="bg-black text-white p-8">
                            <Trophy className="w-24 h-24 mx-auto mb-4 text-yellow-400" />
                            <h1 className="text-5xl font-black mb-4">GAME COMPLETE!</h1>
                            <div className="text-6xl font-black text-cyan-400 mb-4">{score} POINTS</div>
                            <p className="text-xl font-bold">
                                {answers.filter(a => a.is_correct).length} / {quiz.questions.length} Correct
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button onClick={() => navigate(createPageUrl('Aquaria'))} className="bg-cyan-600 hover:bg-cyan-700 text-white font-black py-4 px-8 brutal-button text-xl">
                            PLAY AGAIN
                        </button>
                        <button onClick={() => navigate(createPageUrl('Lobby'))} className="bg-gray-700 hover:bg-gray-600 text-white font-black py-4 px-8 brutal-button text-xl ml-4">
                            BACK TO LOBBY
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-gradient-to-b from-cyan-900 via-blue-900 to-indigo-900 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-cyan-800 p-4 brutal-card mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-white flex items-center gap-2">
                                <Droplets className="text-cyan-400" /> AQUARIA
                            </h1>
                            <p className="font-bold text-cyan-400">Question {currentQuestionIndex + 1} / {quiz.questions.length}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-black text-yellow-400">{score}</p>
                            <p className="text-sm font-bold text-white">POINTS</p>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-900/50 h-40 mb-6 relative border-8 border-black brutal-card overflow-hidden">
                    <div 
                        className="absolute text-6xl transition-all duration-500"
                        style={{ left: `${fishPosition.x}%`, top: `${fishPosition.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                        🐠
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-blue-950 to-transparent"></div>
                </div>

                <div className="bg-cyan-800 p-8 brutal-card">
                    <h2 className="text-2xl font-black text-white mb-6">{currentQuestion.question}</h2>
                    
                    <div className="grid gap-4">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                className="p-6 text-left font-bold text-white bg-blue-700 hover:bg-blue-600 border-4 border-black brutal-button text-lg"
                            >
                                <span className="bg-black text-cyan-400 px-3 py-1 mr-4 font-black">
                                    {String.fromCharCode(65 + index)}
                                </span>
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {mode === 'multiplayer' && gameRoom && (
                    <div className="mt-6 bg-black/50 p-4 brutal-card">
                        <h3 className="font-black text-white mb-3">PLAYERS</h3>
                        <div className="space-y-2">
                            {gameRoom.players.map(p => (
                                <div key={p.email} className="flex justify-between text-white font-bold">
                                    <span>{p.name}</span>
                                    <span className="text-cyan-400">{p.score || 0} pts</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}