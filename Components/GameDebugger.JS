import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Bug, Eye, EyeOff } from 'lucide-react';

export default function GameDebugger({ 
    gameState, 
    breakpoints, 
    onToggleBreakpoint,
    onStep,
    onResume,
    onPause,
    onReset,
    currentLine,
    callStack,
    variables 
}) {
    const [isPaused, setIsPaused] = useState(false);
    const [selectedVariable, setSelectedVariable] = useState(null);

    return (
        <div className="bg-gray-900 border-l-4 border-red-500 h-full flex flex-col">
            {/* Debug Controls */}
            <div className="bg-black p-4 border-b-2 border-red-500">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-black text-white flex items-center gap-2">
                        <Bug className="w-5 h-5 text-red-500" />
                        DEBUG MODE
                    </h3>
                    <div className={`px-2 py-1 font-bold text-xs ${isPaused ? 'bg-yellow-500' : 'bg-green-500'}`}>
                        {isPaused ? '⏸ PAUSED' : '▶ RUNNING'}
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setIsPaused(!isPaused);
                            isPaused ? onResume() : onPause();
                        }}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-3 py-2 brutal-button flex items-center gap-2"
                    >
                        {isPaused ? <Play className="w-4 h-4"/> : <Pause className="w-4 h-4"/>}
                        {isPaused ? 'RESUME' : 'PAUSE'}
                    </button>
                    <button
                        onClick={onStep}
                        disabled={!isPaused}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold px-3 py-2 brutal-button flex items-center gap-2"
                    >
                        <SkipForward className="w-4 h-4"/>
                        STEP
                    </button>
                    <button
                        onClick={onReset}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-2 brutal-button flex items-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4"/>
                        RESET
                    </button>
                </div>
            </div>

            {/* Variables Inspector */}
            <div className="flex-1 overflow-y-auto p-4">
                <h4 className="font-black text-white mb-2 text-sm">VARIABLES</h4>
                <div className="space-y-2">
                    {Object.entries(variables || {}).map(([key, value]) => (
                        <div key={key} className="bg-gray-800 p-2 rounded border-2 border-gray-700">
                            <div 
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => setSelectedVariable(selectedVariable === key ? null : key)}
                            >
                                <span className="font-bold text-cyan-400 text-xs">{key}</span>
                                <span className="text-white text-xs">{typeof value}</span>
                            </div>
                            {selectedVariable === key && (
                                <pre className="mt-2 text-xs text-green-400 bg-black p-2 rounded overflow-x-auto">
                                    {JSON.stringify(value, null, 2)}
                                </pre>
                            )}
                        </div>
                    ))}
                </div>

                {/* Call Stack */}
                <h4 className="font-black text-white mb-2 text-sm mt-6">CALL STACK</h4>
                <div className="space-y-1">
                    {callStack?.map((frame, idx) => (
                        <div key={idx} className="bg-gray-800 p-2 rounded text-xs">
                            <span className="text-yellow-400 font-bold">{frame.function}</span>
                            <span className="text-gray-400 ml-2">line {frame.line}</span>
                        </div>
                    ))}
                </div>

                {/* Breakpoints */}
                <h4 className="font-black text-white mb-2 text-sm mt-6">BREAKPOINTS</h4>
                <div className="space-y-1">
                    {breakpoints?.map((bp, idx) => (
                        <div key={idx} className="bg-red-900 p-2 rounded text-xs flex items-center justify-between">
                            <span className="text-white font-bold">Node: {bp.node} Line: {bp.line}</span>
                            <button
                                onClick={() => onToggleBreakpoint(bp)}
                                className="text-red-400 hover:text-red-300"
                            >
                                <EyeOff className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {(!breakpoints || breakpoints.length === 0) && (
                        <p className="text-gray-500 text-xs">No breakpoints set</p>
                    )}
                </div>

                {/* Current Execution */}
                {currentLine && (
                    <div className="mt-6 bg-yellow-900 p-3 rounded border-2 border-yellow-500">
                        <h4 className="font-black text-white mb-1 text-sm">CURRENT LINE</h4>
                        <p className="text-yellow-200 text-xs font-mono">{currentLine}</p>
                    </div>
                )}
            </div>
        </div>
    );
}