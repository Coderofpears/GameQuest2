import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { GameRoom } from '@/entities/GameRoom';
import { createPageUrl } from '@/utils';
import { Trophy, Loader2 } from 'lucide-react';

export default function GameRoomResults() {
  const location = useLocation();
  const [gameRoom, setGameRoom] = useState(null);
  const gameRoomId = new URLSearchParams(location.search).get('id');

  const fetchGameRoom = useCallback(async () => {
    if (!gameRoomId) return;
    try {
      const rooms = await GameRoom.filter({ id: gameRoomId });
      if (rooms.length > 0) {
        setGameRoom(rooms[0]);
      }
    } catch (e) { console.error(e); }
  }, [gameRoomId]);

  useEffect(() => {
    fetchGameRoom();
    const interval = setInterval(fetchGameRoom, 3000);
    return () => clearInterval(interval);
  }, [fetchGameRoom]);

  if (!gameRoom) {
    return <div className="min-h-screen bg-green-400 flex items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-black" /></div>;
  }
  
  const sortedPlayers = [...gameRoom.players].sort((a, b) => b.score - a.score);
  const allFinished = gameRoom.players.every(p => p.is_finished);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-cyan-400 to-purple-400 p-4 md:p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-black text-white p-8 brutal-card inline-block transform -rotate-1 mb-8">
          <h1 className="text-4xl font-black mb-2">BATTLE RESULTS</h1>
          <p className="text-lg font-bold">{gameRoom.quiz_title}</p>
        </div>

        <div className="bg-white p-8 brutal-card">
          <div className="space-y-4">
            {sortedPlayers.map((p, i) => (
              <div key={p.email} className={`p-4 border-4 border-black brutal-shadow flex justify-between items-center ${i === 0 ? 'bg-yellow-400' : 'bg-gray-200'}`}>
                <div className="flex items-center gap-4">
                  <span className="font-black text-2xl">{i+1}</span>
                  <p className="font-bold text-xl">{p.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-2xl">{p.score}%</span>
                  {!p.is_finished && <Loader2 className="w-6 h-6 animate-spin"/>}
                  {i === 0 && allFinished && <Trophy className="w-8 h-8 text-yellow-600"/>}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {!allFinished && <p className="mt-6 font-bold text-black text-xl animate-pulse">Waiting for players to finish...</p>}
        
        <Link to={createPageUrl('Lobby')} className="w-full mt-8 bg-black text-white font-black text-3xl py-6 brutal-button inline-block">
          BACK TO LOBBY
        </Link>
      </div>
    </div>
  );
}