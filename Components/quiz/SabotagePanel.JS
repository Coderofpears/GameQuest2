import React from 'react';
import { GameRoom } from '@/entities/GameRoom';
import { User } from '@/entities/User';
import { EyeOff, Shuffle, Hourglass, Wrench } from 'lucide-react';

const sabotages = [
  { type: 'blur', name: 'Blur Screen', icon: EyeOff, cost: 50 },
  { type: 'shuffle', name: 'Shuffle Options', icon: Shuffle, cost: 75 },
  { type: 'time_drain', name: 'Time Drain', icon: Hourglass, cost: 100 },
];

export default function SabotagePanel({ gameRoom, user, onSabotage }) {
  const opponents = gameRoom.players.filter(p => p.email !== user.email);
  
  const handleSabotage = async (type, cost, targetEmail) => {
    if (!user || user.scrap < cost) return; // Not enough scrap
    
    const newScrap = user.scrap - cost;
    await User.updateMyUserData({ scrap: newScrap });
    
    const newSabotage = {
        type,
        target_email: targetEmail,
        caster_email: user.email,
        timestamp: Date.now(),
    };
    
    await GameRoom.update(gameRoom.id, {
        sabotages: [...(gameRoom.sabotages || []), newSabotage]
    });
    
    onSabotage(newScrap);
  };

  return (
    <div className="bg-black p-4 brutal-card border-red-500 mt-6 transform -rotate-1">
      <h3 className="text-center font-black text-2xl text-red-500 mb-4">SABOTAGE</h3>
      <div className="grid gap-4">
        {opponents.map(opponent => (
          <div key={opponent.email} className="bg-gray-800 p-3 border-2 border-gray-600">
            <p className="font-bold text-lg text-white mb-2">{opponent.name}</p>
            <div className="flex gap-2 justify-center">
              {sabotages.map(sabotage => (
                <button 
                  key={sabotage.type}
                  onClick={() => handleSabotage(sabotage.type, sabotage.cost, opponent.email)}
                  disabled={!user || user.scrap < sabotage.cost}
                  className="bg-red-700 text-white p-3 brutal-button disabled:bg-gray-600 disabled:text-gray-400 flex flex-col items-center flex-1"
                >
                  <sabotage.icon className="w-6 h-6 mb-1"/>
                  <span className="font-bold text-xs flex items-center gap-1"><Wrench className="w-3 h-3"/>{sabotage.cost}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}