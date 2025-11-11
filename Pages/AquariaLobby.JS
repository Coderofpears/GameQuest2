import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Users, Copy, Play, Loader2, ArrowLeft, Droplets } from 'lucide-react';

export default function AquariaLobby() {
  const navigate = useNavigate();
  const location = useLocation();
  const [gameRoom, setGameRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const gameRoomId = new URLSearchParams(location.search).get('id');

  const fetchGameRoom = useCallback(async () => {
    if (!gameRoomId) return;
    try {
      const rooms = await base44.entities.GameRoom.filter({ id: gameRoomId });
      if (rooms.length > 0) {
        const room = rooms[0];
        setGameRoom(room);
        
        if (room.status === 'playing') {
          navigate(`${createPageUrl('AquariaGame')}?roomId=${room.id}&mode=multiplayer`);
        }
      } else {
        navigate(createPageUrl('Aquaria'));
      }
    } catch (e) {
      console.error("Error fetching game room:", e);
    }
  }, [gameRoomId, navigate]);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (gameRoom) setIsHost(gameRoom.host_email === u.email);
    }).catch(() => navigate(createPageUrl('Lobby')));
  }, [gameRoom, navigate]);

  useEffect(() => {
    fetchGameRoom();
    const interval = setInterval(fetchGameRoom, 2000);
    return () => clearInterval(interval);
  }, [fetchGameRoom]);

  const startGame = async () => {
    if (!isHost || !gameRoom) return;
    await base44.entities.GameRoom.update(gameRoom.id, { status: 'playing' });
  };

  const copyCode = () => {
    if (gameRoom) navigator.clipboard.writeText(gameRoom.game_code);
  };
  
  if (!gameRoom || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-900 to-blue-900 flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-900 via-blue-900 to-indigo-900 p-4 md:p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 brutal-card inline-block">
            <div className="bg-black text-white p-6">
              <div className="flex items-center justify-center gap-3">
                <Droplets className="w-12 h-12 text-cyan-400" />
                <h1 className="text-4xl font-black">AQUARIA LOBBY</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-cyan-800 p-6 brutal-card mb-6">
          <h2 className="font-black text-2xl text-white mb-2">GAME CODE</h2>
          <div className="bg-black border-4 border-white p-4 flex items-center justify-center gap-4 brutal-shadow">
            <p className="text-5xl font-black text-cyan-400 tracking-widest">{gameRoom.game_code}</p>
            <button onClick={copyCode} className="bg-cyan-400 p-3 brutal-button">
              <Copy className="w-6 h-6 text-black"/>
            </button>
          </div>
        </div>

        <div className="bg-cyan-800 p-6 brutal-card mb-6">
          <h2 className="font-black text-2xl text-white mb-4">QUIZ</h2>
          <p className="text-xl font-bold text-cyan-400">{gameRoom.quiz_title}</p>
        </div>

        <div className="bg-cyan-800 p-6 brutal-card mb-6">
          <h2 className="font-black text-2xl text-white mb-4 flex items-center justify-center gap-2">
            <Users /> PLAYERS ({gameRoom.players.length})
          </h2>
          <div className="space-y-3">
            {gameRoom.players.map(p => (
              <div key={p.email} className="bg-cyan-400 p-3 border-4 border-black brutal-shadow font-bold text-lg text-black">
                {p.name} {p.email === gameRoom.host_email && '(HOST)'}
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <button onClick={startGame} className="w-full bg-green-600 text-white font-black text-3xl py-6 brutal-button flex items-center justify-center gap-4">
            <Play className="w-8 h-8"/> START GAME
          </button>
        ) : (
          <div className="bg-black text-cyan-400 p-6 brutal-card font-bold text-2xl flex items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin"/> WAITING FOR HOST...
          </div>
        )}

        <button onClick={() => navigate(createPageUrl('Aquaria'))} className="mt-6 w-full bg-gray-700 text-white font-bold py-3 brutal-button flex items-center justify-center gap-2">
          <ArrowLeft /> LEAVE LOBBY
        </button>
      </div>
    </div>
  );
}