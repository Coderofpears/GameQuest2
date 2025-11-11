import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GameRoom, User, LabyrinthState } from '@/entities/all';
import { createPageUrl } from '@/utils';
import { Users, Copy, Play, Loader2, ArrowLeft, Compass } from 'lucide-react';

// Simple maze generator for multiplayer
const generateMaze = (size) => {
  const maze = Array(size).fill(null).map(() => Array(size).fill(1));
  const stack = [];
  const visited = new Set();
  const directions = [[0, -2], [2, 0], [0, 2], [-2, 0]];
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  
  const carve = (x, y) => {
    visited.add(`${x},${y}`);
    maze[y][x] = 0;
    stack.push([x, y]);
    for (const [dx, dy] of shuffle(directions)) {
      const nx = x + dx, ny = y + dy;
      if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && !visited.has(`${nx},${ny}`)) {
        maze[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    }
  };

  carve(1, 1);
  return maze;
};

export default function LabyrinthLobby() {
  const navigate = useNavigate();
  const location = useLocation();
  const [gameRoom, setGameRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [isHost, setIsHost] = useState(false);

  const gameRoomId = new URLSearchParams(location.search).get('id');

  const fetchGameRoom = useCallback(async () => {
    if (!gameRoomId) return;
    try {
      const rooms = await GameRoom.filter({ id: gameRoomId });
      if (rooms.length > 0) {
        const room = rooms[0];
        setGameRoom(room);
        if (room.status === 'playing') {
          navigate(`${createPageUrl('LabyrinthGame')}?id=${room.id}`);
        }
      } else {
        navigate(createPageUrl('Lobby'));
      }
    } catch (e) { 
      console.error("Error fetching game room:", e);
    }
  }, [gameRoomId, navigate]);

  useEffect(() => {
    User.me().then(u => {
      setUser(u);
      if (gameRoom) setIsHost(gameRoom.host_email === u.email);
    }).catch(() => navigate(createPageUrl('Lobby')));
  }, [gameRoom, navigate]);

  useEffect(() => {
    fetchGameRoom();
    const interval = setInterval(fetchGameRoom, 3000);
    return () => clearInterval(interval);
  }, [fetchGameRoom]);

  const startGame = async () => {
    if (!isHost || !gameRoom) return;

    // Generate the maze
    const mazeSize = 35;
    const mazeBoard = generateMaze(mazeSize);

    // Create initial LabyrinthState for all players
    const statePromises = gameRoom.players.map(player => 
        LabyrinthState.create({
            game_room_id: gameRoom.id,
            user_email: player.email,
            user_name: player.name,
            position_x: 1,
            position_y: 1,
            energy: 100,
            score: 0,
            step_count: 0,
            questions_answered: 0,
            status: 'playing'
        })
    );
    await Promise.all(statePromises);

    // Update game room with maze and start
    await GameRoom.update(gameRoom.id, { 
        status: 'playing',
        maze_board: mazeBoard
    });
  };
  
  if (!gameRoom || !user) {
    return <div className="min-h-screen bg-purple-500 flex items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-black" /></div>;
  }
  
  const copyCode = () => {
    navigator.clipboard.writeText(gameRoom.game_code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-4 md:p-8 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-black border-4 border-cyan-400 p-8 brutal-card inline-block transform -rotate-1 mb-8">
          <h1 className="text-3xl md:text-4xl font-black mb-2 text-cyan-400 flex items-center justify-center gap-2"><Compass className="w-10 h-10"/> LABYRINTH LOBBY</h1>
          <p className="text-lg font-bold">{gameRoom.quiz_title}</p>
        </div>

        <div className="bg-gray-800 p-8 brutal-card mb-8">
          <h2 className="font-black text-2xl text-white mb-2">GAME CODE</h2>
          <div className="bg-gray-900 border-4 border-white p-4 flex items-center justify-center gap-4 brutal-shadow">
            <p className="text-5xl font-black text-white tracking-widest">{gameRoom.game_code}</p>
            <button onClick={copyCode} className="bg-cyan-400 p-3 brutal-button"><Copy className="w-6 h-6 text-black"/></button>
          </div>
        </div>

        <div className="bg-white p-8 brutal-card">
          <h2 className="font-black text-2xl text-black mb-4 flex items-center justify-center gap-2"><Users /> PLAYERS ({gameRoom.players.length})</h2>
          <div className="space-y-3">
            {gameRoom.players.map(p => (
              <div key={p.email} className="bg-purple-400 p-3 border-4 border-black brutal-shadow font-bold text-lg text-black">
                {p.name} {p.email === gameRoom.host_email && '(HOST)'}
              </div>
            ))}
          </div>
        </div>
        
        {isHost && (
          <button onClick={startGame} className="w-full mt-8 bg-cyan-600 text-white font-black text-3xl py-6 brutal-button flex items-center justify-center gap-4">
            <Play className="w-8 h-8"/> ENTER THE LABYRINTH
          </button>
        )}
        {!isHost && (
          <div className="mt-8 bg-black text-white p-6 brutal-card font-bold text-2xl flex items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin"/> PREPARING MAZE...
          </div>
        )}
        <Link to={createPageUrl('Lobby')} className="mt-4 inline-block font-bold text-black bg-white p-3 border-4 border-black brutal-button flex items-center gap-2"><ArrowLeft /> ESCAPE</Link>
      </div>
    </div>
  );
}