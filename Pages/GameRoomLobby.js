
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GameRoom } from '@/entities/GameRoom';
import { User } from '@/entities/User';
import { createPageUrl } from '@/utils';
import { Users, Copy, Play, Loader2, ArrowLeft } from 'lucide-react';

export default function GameRoomLobby() {
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
          navigate(`${createPageUrl('Quiz')}?id=${room.quiz_id}&gameRoomId=${room.id}`);
        }
      } else {
        navigate(createPageUrl('Lobby')); // Room not found
      }
    } catch (e) { console.error(e); }
  }, [gameRoomId, navigate]);

  useEffect(() => {
    User.me().then(u => {
      setUser(u);
      if (gameRoom) setIsHost(gameRoom.host_email === u.email);
    }).catch(() => navigate(createPageUrl('Lobby')));
  }, [gameRoom, navigate]);

  useEffect(() => {
    fetchGameRoom();
    const interval = setInterval(fetchGameRoom, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [fetchGameRoom]);

  const startGame = async () => {
    if (!isHost || !gameRoom) return;
    await GameRoom.update(gameRoom.id, { status: 'playing' });
    // Polling will handle navigation for all players
  };
  
  if (!gameRoom || !user) {
    return <div className="min-h-screen bg-purple-400 flex items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-black" /></div>;
  }
  
  const copyCode = () => {
    navigator.clipboard.writeText(gameRoom.game_code);
    // Add a toast notification here in a real app
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-orange-500 p-4 md:p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-black text-white p-8 brutal-card inline-block transform -rotate-1 mb-8">
          <h1 className="text-3xl md:text-4xl font-black mb-2">GAME ROOM</h1>
          <p className="text-lg font-bold">{gameRoom.quiz_title}</p>
        </div>

        <div className="bg-white p-8 brutal-card mb-8">
          <h2 className="font-black text-2xl text-black mb-2">GAME CODE</h2>
          <div className="bg-gray-200 border-4 border-black p-4 flex items-center justify-center gap-4 brutal-shadow">
            <p className="text-5xl font-black text-black tracking-widest">{gameRoom.game_code}</p>
            <button onClick={copyCode} className="bg-cyan-400 p-3 brutal-button"><Copy className="w-6 h-6 text-black"/></button>
          </div>
          <p className="font-bold text-black/70 mt-4">SHARE THIS CODE WITH YOUR RIVALS!</p>
        </div>

        <div className="bg-white p-8 brutal-card">
          <h2 className="font-black text-2xl text-black mb-4 flex items-center justify-center gap-2"><Users /> PLAYERS ({gameRoom.players.length})</h2>
          <div className="space-y-3">
            {gameRoom.players.map(p => (
              <div key={p.email} className="bg-green-400 p-3 border-4 border-black brutal-shadow font-bold text-lg text-black">
                {p.name} {p.email === gameRoom.host_email && '(HOST)'}
              </div>
            ))}
          </div>
        </div>
        
        {isHost && (
          <button onClick={startGame} className="w-full mt-8 bg-green-500 text-white font-black text-3xl py-6 brutal-button flex items-center justify-center gap-4">
            <Play className="w-8 h-8"/> START BATTLE
          </button>
        )}
        {!isHost && (
          <div className="mt-8 bg-black text-white p-6 brutal-card font-bold text-2xl flex items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin"/> WAITING FOR HOST...
          </div>
        )}
        <Link to={createPageUrl('Lobby')} className="mt-4 inline-block font-bold text-black bg-white p-3 border-4 border-black brutal-button flex items-center gap-2"><ArrowLeft /> LEAVE ROOM</Link>
      </div>
    </div>
  );
}
