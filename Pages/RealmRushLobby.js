import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GameRoom, RealmState, User } from '@/entities/all';
import { createPageUrl } from '@/utils';
import { Users, Copy, Play, Loader2, ArrowLeft } from 'lucide-react';

export default function RealmRushLobby() {
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
          navigate(`${createPageUrl('RealmRushGame')}?id=${room.id}`);
        }
      } else {
        navigate(createPageUrl('Lobby'));
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
    const interval = setInterval(fetchGameRoom, 3000);
    return () => clearInterval(interval);
  }, [fetchGameRoom]);

  const startGame = async () => {
    if (!isHost || !gameRoom) return;

    // Create initial RealmState for all players in the room
    const realmStatePromises = gameRoom.players.map(player => 
        RealmState.create({
            game_room_id: gameRoom.id,
            user_email: player.email,
            user_name: player.name
        })
    );
    await Promise.all(realmStatePromises);

    // Start the game
    await GameRoom.update(gameRoom.id, { status: 'playing' });
  };
  
  if (!gameRoom || !user) {
    return <div className="min-h-screen bg-purple-400 flex items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-black" /></div>;
  }
  
  const copyCode = () => {
    navigator.clipboard.writeText(gameRoom.game_code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-900 to-black p-4 md:p-8 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-black border-4 border-red-500 p-8 brutal-card inline-block transform -rotate-1 mb-8">
          <h1 className="text-3xl md:text-4xl font-black mb-2 text-red-500">⚔️ REALM RUSH LOBBY</h1>
          <p className="text-lg font-bold">{gameRoom.quiz_title}</p>
        </div>

        <div className="bg-gray-800 p-8 brutal-card mb-8">
          <h2 className="font-black text-2xl text-white mb-2">GAME CODE</h2>
          <div className="bg-gray-900 border-4 border-white p-4 flex items-center justify-center gap-4 brutal-shadow">
            <p className="text-5xl font-black text-white tracking-widest">{gameRoom.game_code}</p>
            <button onClick={copyCode} className="bg-cyan-400 p-3 brutal-button"><Copy className="w-6 h-6 text-black"/></button>
          </div>
        </div>

        <div className="bg-gray-800 p-8 brutal-card">
          <h2 className="font-black text-2xl text-white mb-4 flex items-center justify-center gap-2"><Users /> PLAYERS ({gameRoom.players.length})</h2>
          <div className="space-y-3">
            {gameRoom.players.map(p => (
              <div key={p.email} className="bg-green-400 p-3 border-4 border-black brutal-shadow font-bold text-lg text-black">
                {p.name} {p.email === gameRoom.host_email && '(HOST)'}
              </div>
            ))}
          </div>
        </div>
        
        {isHost && (
          <button onClick={startGame} className="w-full mt-8 bg-red-600 text-white font-black text-3xl py-6 brutal-button flex items-center justify-center gap-4">
            <Play className="w-8 h-8"/> START THE WAR
          </button>
        )}
        {!isHost && (
          <div className="mt-8 bg-black text-white p-6 brutal-card font-bold text-2xl flex items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin"/> PREPARING FOR BATTLE...
          </div>
        )}
        <Link to={createPageUrl('Lobby')} className="mt-4 inline-block font-bold text-black bg-white p-3 border-4 border-black brutal-button flex items-center gap-2"><ArrowLeft /> RETREAT</Link>
      </div>
    </div>
  );
}