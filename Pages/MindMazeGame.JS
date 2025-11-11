import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { GameRoom, Quiz, MindMazeState, User } from '@/entities/all';
import { createPageUrl } from '@/utils';
import { Loader2, ArrowLeft, CheckCircle, XCircle, Key, LocateFixed } from 'lucide-react';
import MazeGrid from '../components/mindmaze/MazeGrid';
import PlayerHUD from '../components/mindmaze/PlayerHUD';

export default function MindMazeGame() {
    const navigate = useNavigate();
    const location = useLocation();
    const gameRoomId = new URLSearchParams(location.search).get('id');

    const [user, setUser] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [gameRoom, setGameRoom] = useState(null);
    const [playerStates, setPlayerStates] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [gameState, setGameState] = useState('loading'); // loading, playing, finished
    const [feedback, setFeedback] = useState(null); // 'correct' or 'incorrect'

    const myState = playerStates.find(p => p.user_email === user?.email);

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

            const states = await MindMazeState.filter({ game_room_id: gameRoomId });
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
        const interval = setInterval(loadGameData, 3000);
        return () => clearInterval(interval);
    }, [loadGameData]);

    const handleAnswer = async (isCorrect) => {
        setFeedback(isCorrect ? 'correct' : 'incorrect');
        
        let { position_x: newX, position_y: newY } = myState;
        
        if (isCorrect) {
            const possibleMoves = [];
            if (newY > 0 && gameRoom.maze_board[newY - 1][newX] !== 1) possibleMoves.push({y: -1, x: 0}); // Up
            if (newY < gameRoom.maze_board.length - 1 && gameRoom.maze_board[newY + 1][newX] !== 1) possibleMoves.push({y: 1, x: 0}); // Down
            if (newX > 0 && gameRoom.maze_board[newY][newX - 1] !== 1) possibleMoves.push({y: 0, x: -1}); // Left
            if (newX < gameRoom.maze_board[0].length - 1 && gameRoom.maze_board[newY][newX + 1] !== 1) possibleMoves.push({y: 0, x: 1}); // Right

            if (possibleMoves.length > 0) {
              const move = possibleMoves[Math.floor(Math.random()*possibleMoves.length)];
              newX += move.x;
              newY += move.y;
            }
        }
        
        const updatedState = { ...myState, position_x: newX, position_y: newY };
        await MindMazeState.update(myState.id, updatedState);
        
        if (gameRoom.maze_board[newY][newX] === 3) { // Reached Exit
            await GameRoom.update(gameRoomId, { status: "finished" });
            setGameState('finished');
        }

        setTimeout(() => {
            setFeedback(null);
            setCurrentQuestionIndex(prev => (prev + 1) % quiz.questions.length);
            loadGameData();
        }, 1200);
    };

    if (gameState === 'loading' || !myState || !quiz || !gameRoom) {
      return <div className="min-h-screen bg-indigo-900 flex items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-white" /></div>;
    }

    if (gameState === 'finished') {
        const winner = playerStates.find(p => p.position_x === gameRoom.maze_board[0].length - 2 && p.position_y === gameRoom.maze_board.length - 2);
        return (
            <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-center p-4 text-white">
                <h1 className="text-5xl font-black text-yellow-400 mb-4">MAZE CONQUERED!</h1>
                <h2 className="text-3xl font-bold mb-8">Winner: {winner?.user_name || 'The Maze...'}</h2>
                <Link to={createPageUrl('Lobby')} className="mt-4 inline-block font-bold text-black bg-white p-4 border-4 border-black brutal-button flex items-center gap-2"><ArrowLeft /> BACK TO LOBBY</Link>
            </div>
        );
    }
    
    const currentQuestion = quiz.questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-800 via-indigo-900 to-black p-4 md:p-8 text-white overflow-hidden">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    <h2 className="font-black text-3xl mb-4 text-indigo-400">The Mind Maze</h2>
                    <MazeGrid board={gameRoom.maze_board} players={playerStates} myEmail={user.email} />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <PlayerHUD playerState={myState} />
                    <div className="bg-gray-800 p-6 brutal-card text-center relative overflow-hidden">
                        {feedback && (
                            <div className={`absolute inset-0 flex items-center justify-center text-5xl font-black animate-ping ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
                                {feedback === 'correct' ? <CheckCircle /> : <XCircle />}
                            </div>
                        )}
                        <p className="font-bold text-lg mb-4">{currentQuestion.question}</p>
                        <div className="grid grid-cols-1 gap-2">
                            {currentQuestion.options.map((opt, i) => (
                                <button key={i} onClick={() => handleAnswer(i === currentQuestion.correct_answer)} disabled={!!feedback} className="bg-indigo-700 p-3 brutal-button font-bold disabled:opacity-50">{opt}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}