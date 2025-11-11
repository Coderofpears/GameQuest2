import React from 'react';
import { cn } from "@/lib/utils";

const tileStyles = {
    0: "bg-gray-700", // Path
    1: "bg-black", // Wall
    2: "bg-blue-500", // Start
    3: "bg-yellow-400 animate-pulse", // Exit
};

const PlayerAvatar = ({ player, isMe }) => (
    <div className={cn("w-full h-full rounded-full flex items-center justify-center transition-all duration-500", isMe ? "bg-green-500" : "bg-red-500")}>
        <span className="font-black text-xs text-white">{player.user_name.substring(0, 1)}</span>
    </div>
);

export default function MazeGrid({ board, players, myEmail }) {
    if (!board) return null;

    return (
        <div className="bg-gray-900 p-2 brutal-card" style={{ aspectRatio: `${board[0].length} / ${board.length}` }}>
            <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${board[0].length}, 1fr)`}}>
                {board.map((row, y) => 
                    row.map((tile, x) => {
                        const playersOnTile = players.filter(p => p.position_x === x && p.position_y === y);
                        return (
                            <div key={`${x}-${y}`} className={cn("relative border border-gray-800", tileStyles[tile] || "bg-gray-600")}>
                                {playersOnTile.length > 0 && (
                                    <div className="absolute inset-0 p-0.5">
                                        {playersOnTile.map(p => (
                                            <PlayerAvatar key={p.user_email} player={p} isMe={p.user_email === myEmail} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
}