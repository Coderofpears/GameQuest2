import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { GameRoom, Quiz, LabyrinthState, User } from '@/entities/all';
import { createPageUrl } from '@/utils';
import { Loader2, ArrowLeft, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LabyrinthGame() {
    const navigate = useNavigate();
    const location = useLocation();
    const gameRoomId = new URLSearchParams(location.search).get('id');

    const [user, setUser] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [gameRoom, setGameRoom] = useState(null);
    const [playerStates, setPlayerStates] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [gameState, setGameState] = useState('loading');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    const myState = playerStates.find(p => p.user_email === user?.email);
    const questionsAskedRef = useRef(new Set());

    const loadGameData = useCallback(async () => {
        try {
            if (!user) {
              const u = await User.me();
              setUser(u);
            }
            const room = await GameRoom.get(gameRoomId);
            setGameRoom(room);

            if (!quiz) {
              const quizData = await Quiz.get(room.quiz_id);
              setQuiz(quizData);
            }

            const states = await LabyrinthState.filter({ game_room_id: gameRoomId });
            setPlayerStates(states);

            if (room.status === 'finished') setGameState('finished');
            else setGameState('playing');

        } catch (e) {
            console.error(e);
            navigate(createPageUrl('Lobby'));
        }
    }, [gameRoomId, navigate, user, quiz]);

    useEffect(() => {
        loadGameData();
        const interval = setInterval(loadGameData, 2000);
        return () => clearInterval(interval);
    }, [loadGameData]);

    const getRandomQuestion = useCallback(() => {
        if (!quiz) return null;
        const unused = quiz.questions.filter((_, i) => !questionsAskedRef.current.has(i));
        if (unused.length === 0) {
            questionsAskedRef.current.clear();
            return quiz.questions[Math.floor(Math.random() * quiz.questions.length)];
        }
        const q = unused[Math.floor(Math.random() * unused.length)];
        const idx = quiz.questions.indexOf(q);
        questionsAskedRef.current.add(idx);
        return q;
    }, [quiz]);

    const openQuestion = () => {
        const q = getRandomQuestion();
        if (q) {
            setCurrentQuestion(q);
            setSelectedAnswer(null);
        }
    };

    const handleAnswer = async (isCorrect) => {
        if (!myState) return;

        let newEnergy = myState.energy;
        let newScore = myState.score;

        if (isCorrect) {
            newScore += 10;
            newEnergy = Math.min(100, newEnergy + 30);
        }

        // Try to move forward
        let { position_x: newX, position_y: newY } = myState;
        if (isCorrect && gameRoom.maze_board) {
            const possibleMoves = [];
            if (newY > 0 && gameRoom.maze_board[newY - 1][newX] !== 1) possibleMoves.push({y: -1, x: 0});
            if (newY < gameRoom.maze_board.length - 1 && gameRoom.maze_board[newY + 1][newX] !== 1) possibleMoves.push({y: 1, x: 0});
            if (newX > 0 && gameRoom.maze_board[newY][newX - 1] !== 1) possibleMoves.push({y: 0, x: -1});
            if (newX < gameRoom.maze_board[0].length - 1 && gameRoom.maze_board[newY][newX + 1] !== 1) possibleMoves.push({y: 0, x: 1});

            if (possibleMoves.length > 0) {
              const move = possibleMoves[Math.floor(Math.random()*possibleMoves.length)];
              newX += move.x;
              newY += move.y;
            }
        }

        const exitX = gameRoom.maze_board[0].length - 2;
        const exitY = gameRoom.maze_board.length - 2;

        await LabyrinthState.update(myState.id, {
            energy: newEnergy,
            score: newScore,
            position_x: newX,
            position_y: newY,
            questions_answered: myState.questions_answered + 1,
            status: (newX === exitX && newY === exitY) ? 'finished' : 'playing'
        });

        setCurrentQuestion(null);
        setSelectedAnswer(null);

        if (newX === exitX && newY === exitY) {
            await GameRoom.update(gameRoomId, { status: "finished" });
            setGameState('finished');
        } else {
            loadGameData();
        }
    };

    // Keyboard movement
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (gameState !== 'playing' || currentQuestion || !myState || myState.energy === 0) return;

            const [x, y] = [myState.position_x, myState.position_y];
            let newX = x, newY = y;
            let moved = false;

            if (e.key === 'w' || e.key === 'ArrowUp') { newY = Math.max(0, y - 1); moved = true; }
            else if (e.key === 's' || e.key === 'ArrowDown') { newY = Math.min(gameRoom.maze_board.length - 1, y + 1); moved = true; }
            else if (e.key === 'a' || e.key === 'ArrowLeft') { newX = Math.max(0, x - 1); moved = true; }
            else if (e.key === 'd' || e.key === 'ArrowRight') { newX = Math.min(gameRoom.maze_board[0].length - 1, x + 1); moved = true; }

            if (!moved || gameRoom.maze_board[newY]?.[newX] === 1) return;

            const newEnergy = Math.max(0, myState.energy - 2);
            const newStepCount = myState.step_count + 1;

            LabyrinthState.update(myState.id, {
                position_x: newX,
                position_y: newY,
                energy: newEnergy,
                step_count: newStepCount
            });

            const exitX = gameRoom.maze_board[0].length - 2;
            const exitY = gameRoom.maze_board.length - 2;
            if (newX === exitX && newY === exitY) {
                GameRoom.update(gameRoomId, { status: "finished" });
                setGameState('finished');
            }

            e.preventDefault();
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [myState, gameState, currentQuestion, gameRoom, gameRoomId]);

    if (gameState === 'loading' || !myState || !quiz || !gameRoom) {
      return <div className="min-h-screen bg-indigo-900 flex items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-white" /></div>;
    }

    if (gameState === 'finished') {
        const winner = [...playerStates].sort((a,b) => b.score - a.score)[0];
        return (
            <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-center p-4 text-white">
                <h1 className="text-5xl font-black text-yellow-400 mb-4">MAZE CONQUERED!</h1>
                <h2 className="text-3xl font-bold mb-8">Winner: {winner?.user_name || 'The Maze...'}</h2>
                <div className="bg-gray-800 p-6 brutal-card mb-4">
                    <h3 className="font-black text-2xl mb-4">FINAL SCORES</h3>
                    {playerStates.sort((a,b) => b.score - a.score).map((p, i) => (
                        <div key={p.user_email} className="flex justify-between p-2 border-b border-gray-700">
                            <span className="font-bold">{i+1}. {p.user_name}</span>
                            <span className="font-black text-yellow-400">{p.score}</span>
                        </div>
                    ))}
                </div>
                <Link to={createPageUrl('Lobby')} className="mt-4 inline-block font-bold text-black bg-white p-4 border-4 border-black brutal-button flex items-center gap-2"><ArrowLeft /> BACK TO LOBBY</Link>
            </div>
        );
    }

    const cellSize = 20;
    const viewportSize = 500;
    const energyPercent = (myState.energy / 100) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-800 via-indigo-900 to-black p-4 md:p-8 text-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Main Maze */}
                    <div className="lg:col-span-3">
                        <h2 className="font-black text-3xl mb-4 text-cyan-400">The Labyrinth</h2>
                        <div className="relative bg-gray-950 border-4 border-cyan-400 rounded overflow-hidden" style={{ width: viewportSize, height: viewportSize, opacity: myState.energy === 0 ? 0.5 : 1 }}>
                            <motion.div
                                animate={{
                                    x: -myState.position_x * cellSize + viewportSize / 2,
                                    y: -myState.position_y * cellSize + viewportSize / 2,
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                style={{ width: gameRoom.maze_board[0].length * cellSize, height: gameRoom.maze_board.length * cellSize }}
                            >
                                {gameRoom.maze_board.map((row, y) =>
                                    row.map((cell, x) => (
                                        <div
                                            key={`${x}-${y}`}
                                            style={{
                                                position: 'absolute',
                                                left: x * cellSize,
                                                top: y * cellSize,
                                                width: cellSize,
                                                height: cellSize,
                                                backgroundColor: cell === 1 ? '#1a1a2e' : '#0f3460',
                                            }}
                                            className={cell === 1 ? 'border border-gray-700' : 'border border-blue-900'}
                                        />
                                    ))
                                )}
                                {/* Exit */}
                                <motion.div
                                    style={{
                                        position: 'absolute',
                                        left: (gameRoom.maze_board[0].length - 2) * cellSize,
                                        top: (gameRoom.maze_board.length - 2) * cellSize,
                                        width: cellSize,
                                        height: cellSize,
                                    }}
                                    animate={{ opacity: [0.5, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="bg-green-500 rounded shadow-lg border-2 border-green-300 flex items-center justify-center"
                                >
                                    <span className="text-xs font-bold">EXIT</span>
                                </motion.div>
                                {/* All Players */}
                                {playerStates.map(p => (
                                    <motion.div
                                        key={p.user_email}
                                        animate={{ x: p.position_x * cellSize, y: p.position_y * cellSize }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        style={{ width: cellSize, height: cellSize }}
                                        className={`absolute rounded shadow-lg border-2 ${p.user_email === user.email ? 'bg-yellow-400 border-yellow-300' : 'bg-red-400 border-red-300'}`}
                                        title={p.user_name}
                                    />
                                ))}
                            </motion.div>
                        </div>
                        <p className="mt-4 text-gray-400 text-sm">WASD/Arrows to move • Answer questions to gain energy • Reach EXIT</p>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Player HUD */}
                        <div className="bg-gray-800 p-4 brutal-card">
                            <h3 className="font-black text-white text-xl mb-2">YOUR STATS</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-gray-400">Score:</span><span className="font-black text-green-400">{myState.score}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">Steps:</span><span className="font-black">{myState.step_count}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">Questions:</span><span className="font-black">{myState.questions_answered}</span></div>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between mb-1">
                                    <span className="text-red-400 font-bold text-sm">⚡ ENERGY</span>
                                    <span className="text-red-400 font-bold text-sm">{myState.energy}/100</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-3">
                                    <div className={`h-full rounded-full transition-all ${energyPercent > 30 ? 'bg-red-500' : 'bg-red-800'}`} style={{ width: `${energyPercent}%` }} />
                                </div>
                            </div>
                        </div>

                        {/* Leaderboard */}
                        <div className="bg-gray-800 p-4 brutal-card">
                            <h3 className="font-black text-white text-xl mb-2">LEADERBOARD</h3>
                            <div className="space-y-2">
                                {playerStates.sort((a,b) => b.score - a.score).map((p, i) => (
                                    <div key={p.user_email} className="flex justify-between text-sm">
                                        <span className={p.user_email === user.email ? 'font-black text-yellow-400' : 'font-bold'}>{i+1}. {p.user_name}</span>
                                        <span className="font-black">{p.score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Question Button */}
                        <button
                            onClick={openQuestion}
                            disabled={myState.energy === 0}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-black py-4 brutal-button flex items-center justify-center gap-2"
                        >
                            <Zap /> ANSWER QUESTION
                        </button>
                    </div>
                </div>
            </div>

            {/* Question Modal */}
            {currentQuestion && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
                >
                    <div className="bg-gray-900 border-4 border-green-400 rounded-lg p-6 max-w-md w-full">
                        <p className="text-green-400 font-bold mb-6 text-lg">{currentQuestion.question}</p>
                        <div className="space-y-3 mb-6">
                            {currentQuestion.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedAnswer(idx)}
                                    className={`w-full p-3 rounded border-2 font-semibold transition ${
                                        selectedAnswer === idx
                                            ? 'border-green-400 bg-green-500 bg-opacity-30 text-green-400'
                                            : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-green-400'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => handleAnswer(selectedAnswer === currentQuestion.correct_answer)}
                            disabled={selectedAnswer === null}
                            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-gray-900 font-bold py-3 rounded"
                        >
                            Submit Answer
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}