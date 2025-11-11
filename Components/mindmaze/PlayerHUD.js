import React from 'react';
import { Key, LocateFixed } from 'lucide-react';

export default function PlayerHUD({ playerState }) {
    return (
        <div className="bg-gray-800 p-4 brutal-card">
            <h3 className="font-black text-white text-xl text-center mb-4">INVENTORY</h3>
            <div className="grid grid-cols-3 gap-2 text-center h-20">
                <div className="bg-gray-700 border-2 border-gray-600 flex items-center justify-center"><span className="text-gray-500 text-xs">Empty</span></div>
                <div className="bg-gray-700 border-2 border-gray-600 flex items-center justify-center"><span className="text-gray-500 text-xs">Empty</span></div>
                <div className="bg-gray-700 border-2 border-gray-600 flex items-center justify-center"><span className="text-gray-500 text-xs">Empty</span></div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">Power-ups coming soon!</p>
        </div>
    );
}