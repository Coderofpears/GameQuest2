import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Link as LinkIcon, Code2, Save, Play, Users, Globe, User } from 'lucide-react';

const NodeTypes = {
  STARTGAME: { id: 'startgame', label: 'StartGame', color: '#22c55e', icon: '▶️' },
  PREGAME: { id: 'pregame', label: 'Pre-Game', color: '#10b981', icon: '🎮' },
  GAME: { id: 'game', label: 'Game', color: '#3b82f6', icon: '🎯' },
  SCREEN: { id: 'screen', label: 'Screen', color: '#8b5cf6', icon: '📱' },
  PLATFORMER: { id: 'platformer', label: 'Platformer', color: '#f59e0b', icon: '🏃' },
  '3D': { id: '3d', label: '3D', color: '#ef4444', icon: '🎲' },
  SERVERSCRIPT: { id: 'serverscript', label: 'ServerScript', color: '#14b8a6', icon: '⚙️' },
  LOCALSCRIPT: { id: 'localscript', label: 'LocalScript', color: '#ec4899', icon: '📱' }
};

export default function NodeGraphEditor({ game, onSave, onOpenBlockly }) {
  const [nodes, setNodes] = useState(game?.game_data?.nodes || []);
  const [connections, setConnections] = useState(game?.game_data?.connections || []);
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  // Initialize StartGame node if none exists
  useEffect(() => {
    if (nodes.length === 0 || !nodes.some(n => n.type === 'startgame')) {
      const startGameNode = {
        id: 'startgame-' + Date.now(),
        type: 'startgame',
        x: 100,
        y: 100,
        label: 'StartGame',
        inputs: [],
        outputs: ['start']
      };
      setNodes([startGameNode, ...nodes]);
    }
  }, []);

  const addNode = (type) => {
    const newNode = {
      id: Date.now().toString(),
      type,
      x: 100 + nodes.length * 50,
      y: 100 + nodes.length * 50,
      label: NodeTypes[type.toUpperCase()]?.label || type,
      inputs: type === 'startgame' ? [] : ['input'],
      outputs: ['output', 'output2']
    };
    setNodes([...nodes, newNode]);
  };

  const deleteNode = (nodeId) => {
    // Prevent deleting StartGame node
    const node = nodes.find(n => n.id === nodeId);
    if (node?.type === 'startgame') {
      alert('Cannot delete StartGame node!');
      return;
    }
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
    setSelectedNode(null);
  };

  const handleMouseDown = (e, node) => {
    if (e.button === 0) {
      setDraggedNode(node);
      setSelectedNode(node);
      const rect = canvasRef.current.getBoundingClientRect();
      setOffset({
        x: e.clientX - rect.left - node.x,
        y: e.clientY - rect.top - node.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (draggedNode) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - offset.x;
      const newY = e.clientY - rect.top - offset.y;
      
      setNodes(nodes.map(n => 
        n.id === draggedNode.id ? { ...n, x: newX, y: newY } : n
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const startConnection = (nodeId, outputIndex) => {
    setConnectingFrom({ nodeId, outputIndex });
  };

  const completeConnection = (toNodeId, inputIndex) => {
    if (connectingFrom && connectingFrom.nodeId !== toNodeId) {
      const newConnection = {
        id: Date.now().toString(),
        from: connectingFrom.nodeId,
        fromOutput: connectingFrom.outputIndex,
        to: toNodeId,
        toInput: inputIndex
      };
      setConnections([...connections, newConnection]);
    }
    setConnectingFrom(null);
  };

  const deleteConnection = (connId) => {
    setConnections(connections.filter(c => c.id !== connId));
  };

  const handleSave = () => {
    onSave({
      game_data: {
        ...game.game_data,
        nodes,
        connections
      }
    });
  };

  return (
    <div className="h-full bg-gray-900 relative">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 bg-black border-4 border-cyan-500 p-4 brutal-card">
        <h3 className="font-black text-white mb-3">ADD NODE</h3>
        <div className="space-y-2">
          {Object.entries(NodeTypes).map(([key, type]) => (
            <button
              key={key}
              onClick={() => addNode(type.id)}
              className="w-full px-4 py-2 font-bold brutal-button text-left flex items-center gap-2"
              style={{ backgroundColor: type.color, color: '#fff' }}
            >
              <span>{type.icon}</span> {type.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleSave}
          className="w-full mt-4 bg-green-600 text-white font-black py-3 brutal-button flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4"/> SAVE
        </button>
      </div>

      {/* Node Properties Panel */}
      {selectedNode && (
        <div className="absolute top-4 right-4 z-10 bg-black border-4 border-purple-500 p-4 brutal-card w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-white">NODE PROPERTIES</h3>
            <button onClick={() => setSelectedNode(null)} className="text-white hover:text-red-500">×</button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-white font-bold block mb-1">Type:</label>
              <p className="text-gray-400 text-sm">{selectedNode.type.toUpperCase()}</p>
            </div>
            <div>
              <label className="text-white font-bold block mb-1">Label:</label>
              <input
                type="text"
                value={selectedNode.label}
                onChange={(e) => {
                  setNodes(nodes.map(n => 
                    n.id === selectedNode.id ? { ...n, label: e.target.value } : n
                  ));
                  setSelectedNode({ ...selectedNode, label: e.target.value });
                }}
                className="w-full p-2 border-2 border-black font-bold"
              />
            </div>
            {selectedNode.type === 'localscript' && (
              <div className="bg-pink-900 p-2 rounded">
                <p className="text-white text-xs font-bold">⚡ Runs client-side only!</p>
              </div>
            )}
            {selectedNode.type === 'startgame' && (
              <div className="bg-green-900 p-2 rounded">
                <p className="text-white text-xs font-bold">▶️ Auto-starts on game load!</p>
              </div>
            )}
            <button
              onClick={() => onOpenBlockly(selectedNode)}
              className="w-full bg-cyan-600 text-white font-bold py-2 brutal-button flex items-center justify-center gap-2"
            >
              <Code2 className="w-4 h-4"/> EDIT CODE
            </button>
            {selectedNode.type !== 'startgame' && (
              <button
                onClick={() => deleteNode(selectedNode.id)}
                className="w-full bg-red-600 text-white font-bold py-2 brutal-button flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4"/> DELETE
              </button>
            )}
          </div>
        </div>
      )}

      {/* Canvas */}
      <svg
        ref={canvasRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ 
          backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Render Connections */}
        {connections.map(conn => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          if (!fromNode || !toNode) return null;

          const x1 = fromNode.x + 200;
          const y1 = fromNode.y + 60 + conn.fromOutput * 30;
          const x2 = toNode.x;
          const y2 = toNode.y + 40 + conn.toInput * 25;

          return (
            <g key={conn.id}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#ef4444"
                strokeWidth="3"
                onClick={() => deleteConnection(conn.id)}
                style={{ cursor: 'pointer' }}
              />
            </g>
          );
        })}

        {/* Render Nodes */}
        {nodes.map(node => {
          const nodeType = NodeTypes[node.type.toUpperCase()];
          return (
            <g key={node.id}>
              {/* Node Box */}
              <rect
                x={node.x}
                y={node.y}
                width="200"
                height="100"
                fill={selectedNode?.id === node.id ? '#1f2937' : '#000'}
                stroke={nodeType?.color || '#fff'}
                strokeWidth="4"
                onMouseDown={(e) => handleMouseDown(e, node)}
                style={{ cursor: 'move' }}
              />
              
              {/* Node Label */}
              <text
                x={node.x + 100}
                y={node.y + 30}
                textAnchor="middle"
                fill="#fff"
                fontSize="14"
                fontWeight="bold"
              >
                {nodeType?.icon} {node.label}
              </text>

              {/* Input Ports */}
              {node.inputs?.map((input, i) => (
                <g key={`input-${i}`}>
                  <circle
                    cx={node.x}
                    cy={node.y + 40 + i * 25}
                    r="8"
                    fill="#3b82f6"
                    stroke="#000"
                    strokeWidth="2"
                    onClick={() => completeConnection(node.id, i)}
                    style={{ cursor: 'pointer' }}
                  />
                  <text
                    x={node.x + 15}
                    y={node.y + 45 + i * 25}
                    fill="#fff"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {input}
                  </text>
                </g>
              ))}

              {/* Output Ports */}
              {node.outputs?.map((output, i) => (
                <g key={`output-${i}`}>
                  <circle
                    cx={node.x + 200}
                    cy={node.y + 60 + i * 30}
                    r="8"
                    fill="#10b981"
                    stroke="#000"
                    strokeWidth="2"
                    onClick={() => startConnection(node.id, i)}
                    style={{ cursor: 'pointer' }}
                  />
                  <text
                    x={node.x + 175}
                    y={node.y + 65 + i * 30}
                    textAnchor="end"
                    fill="#fff"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {output}
                  </text>
                </g>
              ))}
            </g>
          );
        })}

        {/* Active Connection Line */}
        {connectingFrom && (
          <line
            x1={nodes.find(n => n.id === connectingFrom.nodeId)?.x + 200}
            y1={nodes.find(n => n.id === connectingFrom.nodeId)?.y + 60 + connectingFrom.outputIndex * 30}
            x2={offset.x}
            y2={offset.y}
            stroke="#fbbf24"
            strokeWidth="3"
            strokeDasharray="5,5"
          />
        )}
      </svg>
    </div>
  );
}