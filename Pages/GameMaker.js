import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, Code2, Plus, Edit, Trash2, ArrowLeft, Play, Users, Save, ShoppingBag, Eye, Share2, Wand2, X, Gamepad2, Boxes, Box, Server, Globe, UserPlus, Upload, Music, Image as ImageIcon, FileText } from 'lucide-react';
import NodeGraphEditor from '@/components/NodeGraphEditor';
import GlobalVariablesManager from '@/components/GlobalVariablesManager';
import AIChatDesigner from '@/components/AIChatDesigner';

const AIAssetGenerator = ({ onAssetGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [assetType, setAssetType] = useState('sprite');
  const [generating, setGenerating] = useState(false);

  const generateAsset = async () => {
    if (!prompt) return;
    setGenerating(true);
    
    try {
      const result = await base44.integrations.Core.GenerateImage({ 
        prompt: `game asset, ${assetType}, ${prompt}, pixel art style, transparent background, high quality` 
      });
      
      onAssetGenerated({ type: assetType, url: result.url, description: prompt });
      
      if (window.antd) {
        window.antd.message.success('Asset generated successfully!');
      }
      setPrompt('');
    } catch (e) {
      console.error('Asset generation failed:', e);
      if (window.antd) {
        window.antd.message.error('Failed to generate asset');
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-purple-100 p-4 brutal-card mb-4">
      <h4 className="font-black text-lg mb-3 flex items-center gap-2">
        <Wand2 className="w-5 h-5"/> AI ASSET GENERATOR
      </h4>
      <div className="space-y-3">
        <select
          value={assetType}
          onChange={(e) => setAssetType(e.target.value)}
          className="w-full p-2 border-2 border-black font-bold"
        >
          <option value="sprite">Sprite</option>
          <option value="background">Background</option>
          <option value="character">Character</option>
          <option value="item">Item</option>
        </select>
        <input
          type="text"
          placeholder="Describe your asset..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border-2 border-black font-bold"
        />
        <button
          onClick={generateAsset}
          disabled={!prompt || generating}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-2 brutal-button flex items-center justify-center gap-2"
        >
          {generating ? <Loader2 className="animate-spin" /> : <Wand2 />}
          {generating ? 'GENERATING...' : 'GENERATE'}
        </button>
      </div>
    </div>
  );
};

const FileUploader = ({ onFileUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const fileData = {
        type,
        name: file.name,
        url: file_url,
        size: file.size
      };
      
      setUploadedFiles(prev => [...prev, fileData]);
      if (onFileUploaded) {
        onFileUploaded(fileData);
      }

      if (window.antd) {
        window.antd.message.success(`${type} uploaded successfully!`);
      }
    } catch (e) {
      console.error('Upload failed:', e);
      if (window.antd) {
        window.antd.message.error('Failed to upload file');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-blue-100 p-4 brutal-card mb-4">
      <h4 className="font-black text-lg mb-3 flex items-center gap-2">
        <Upload className="w-5 h-5"/> FILE UPLOADER
      </h4>
      <div className="space-y-3">
        <div>
          <label className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 brutal-button flex items-center justify-center gap-2 cursor-pointer">
            <ImageIcon className="w-4 h-4"/> UPLOAD SPRITE/IMAGE
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'sprite')}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
        <div>
          <label className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 brutal-button flex items-center justify-center gap-2 cursor-pointer">
            <Music className="w-4 h-4"/> UPLOAD SOUND
            <input 
              type="file" 
              accept="audio/*"
              onChange={(e) => handleFileUpload(e, 'sound')}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
        <div>
          <label className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 brutal-button flex items-center justify-center gap-2 cursor-pointer">
            <FileText className="w-4 h-4"/> UPLOAD DATA FILE
            <input 
              type="file" 
              accept=".json,.txt"
              onChange={(e) => handleFileUpload(e, 'data')}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {uploading && (
        <div className="mt-3 flex items-center gap-2 text-sm font-bold text-gray-700">
          <Loader2 className="w-4 h-4 animate-spin"/> Uploading...
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h5 className="font-black text-sm">UPLOADED FILES:</h5>
          {uploadedFiles.map((file, idx) => (
            <div key={idx} className="bg-white p-2 border-2 border-black rounded text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold">{file.name}</span>
                <span className="text-gray-500">{(file.size / 1024).toFixed(1)}KB</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(file.url);
                  if (window.antd) window.antd.message.success('URL copied!');
                }}
                className="text-blue-600 text-xs font-bold mt-1"
              >
                📋 Copy URL
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BlocklyEditor = ({ game, node, onSave, onBack, onPlaytest, sharedAssets }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [codingMode, setCodingMode] = useState(node?.codingMode || 'blockly');
  const [javascriptCode, setJavascriptCode] = useState(node?.javascriptCode || '');
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);
  const isInitializingRef = useRef(false);
  const autoSaveTimeoutRef = useRef(null);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (codingMode === 'javascript' && javascriptCode !== node?.javascriptCode) {
        handleSave(true); // silent save
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [javascriptCode]);

  useEffect(() => {
    return () => {
      if (workspaceRef.current && !isInitializingRef.current) {
        try {
          setTimeout(() => {
            if (workspaceRef.current) {
              workspaceRef.current.dispose();
              workspaceRef.current = null;
            }
          }, 0);
        } catch (e) {
          console.error('Error disposing workspace:', e);
        }
      }
    };
  }, [node?.id]);

  useEffect(() => {
    if (codingMode !== 'blockly' || !blocklyDiv.current || workspaceRef.current || isInitializingRef.current) return;

    isInitializingRef.current = true;
    
    if (!window.Blockly) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/blockly/blockly.min.js';
      script.onload = () => {
        setTimeout(() => {
          initializeBlockly();
          isInitializingRef.current = false;
        }, 100);
      };
      document.head.appendChild(script);
    } else {
      setTimeout(() => {
        initializeBlockly();
        isInitializingRef.current = false;
      }, 100);
    }
  }, [game, node, codingMode]);

  const initializeBlockly = () => {
    if (!window.Blockly || !blocklyDiv.current || workspaceRef.current) return;
    const Blockly = window.Blockly;
    
    try {
      const workspace = Blockly.inject(blocklyDiv.current, {
        toolbox: document.getElementById('toolbox'),
        grid: { spacing: 20, length: 3, colour: '#ddd', snap: true },
        zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
        trashcan: true,
        sounds: false
      });

      if (node?.blocklyXml) {
        try {
          const xmlDoc = new DOMParser().parseFromString(node.blocklyXml, 'text/xml');
          Blockly.Xml.domToWorkspace(xmlDoc.documentElement, workspace);
        } catch (e) {
          console.error("Error loading blocks:", e);
        }
      }

      // Auto-save on workspace change
      workspace.addChangeListener(() => {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        autoSaveTimeoutRef.current = setTimeout(() => {
          handleSave(true); // silent auto-save
        }, 2000);
      });

      workspaceRef.current = workspace;
    } catch (e) {
      console.error('Error initializing Blockly:', e);
      isInitializingRef.current = false;
    }
  };

  const handleSave = async (silent = false) => {
    setIsSaving(true);
    
    try {
      if (codingMode === 'blockly' && workspaceRef.current) {
        const Blockly = window.Blockly;
        const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
        const xmlSerializer = new XMLSerializer();
        const xmlText = xmlSerializer.serializeToString(xml);
        
        await onSave(node.id, xmlText, null, codingMode);
      } else if (codingMode === 'javascript') {
        await onSave(node.id, null, javascriptCode, codingMode);
      }
      
      if (!silent && window.antd) {
        window.antd.message.success('Saved!');
      }
    } catch (e) {
      console.error('Error saving:', e);
      if (window.antd) {
        window.antd.message.error('Save failed');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Blockly Toolbox - Hidden but accessible */}
      <xml id="toolbox" style={{display: 'none'}}>
        <category name="🎮 Events" colour="60">
          <block type="controls_if"></block>
          <block type="logic_compare"></block>
          <block type="math_number"></block>
          <block type="text"></block>
        </category>
      </xml>

      {codingMode === 'blockly' ? (
        <div 
          ref={blocklyDiv} 
          className="flex-1" 
          style={{
            backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
      ) : (
        <div className="flex-1 bg-gray-900 p-4">
          <div className="h-full">
            <div className="mb-4 bg-yellow-100 p-3 border-2 border-yellow-400 rounded">
              <h4 className="font-black text-sm mb-1">📝 JAVASCRIPT MODE</h4>
              <p className="text-xs text-gray-700">Write custom JavaScript code. Use game.* API methods!</p>
            </div>
            <textarea
              value={javascriptCode}
              onChange={(e) => setJavascriptCode(e.target.value)}
              placeholder={`// JavaScript Game API
// Draw rectangle
ctx.fillStyle = '#FF0000';
ctx.fillRect(100, 100, 50, 50);

// Create sprite
const player = game.createSprite('player', 'player.png', 100, 100);

// Handle input
if (game.isKeyPressed('ArrowRight')) {
    game.moveSprite('player', 5, 0);
}

// Set game state
game.setGlobal('score', game.getGlobal('score') + 10);

// Access uploaded assets
// Use the URLs from uploaded files in the Assets panel`}
              className="w-full h-[calc(100%-120px)] p-4 bg-black text-green-400 font-mono text-sm border-4 border-cyan-500"
              spellCheck="false"
            />
          </div>
        </div>
      )}
      
      <div className="w-80 bg-white border-l-4 border-black p-4 overflow-y-auto">
        <h3 className="font-black text-lg mb-4">⚙️ NODE: {node?.label}</h3>
        
        <div className="mb-4 p-3 bg-blue-100 border-2 border-blue-400 rounded">
          <h4 className="font-black text-sm mb-2">CODING MODE:</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCodingMode('blockly')}
              className={`py-2 font-bold brutal-button ${
                codingMode === 'blockly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
              }`}
            >
              🧱 BLOCKLY
            </button>
            <button
              onClick={() => setCodingMode('javascript')}
              className={`py-2 font-bold brutal-button ${
                codingMode === 'javascript' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
              }`}
            >
              💻 JS
            </button>
          </div>
        </div>

        {node?.type === 'localscript' && (
          <div className="bg-pink-100 p-3 brutal-card mb-4">
            <p className="font-black text-sm text-pink-900">📱 CLIENT-SIDE ONLY</p>
            <p className="text-xs text-gray-700 mt-1">This code runs only on the player's device.</p>
          </div>
        )}

        {node?.type === 'startgame' && (
          <div className="bg-green-100 p-3 brutal-card mb-4">
            <p className="font-black text-sm text-green-900">▶️ AUTO-START NODE</p>
            <p className="text-xs text-gray-700 mt-1">Automatically runs on game load!</p>
          </div>
        )}
        
        {/* Show shared assets */}
        {sharedAssets && sharedAssets.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 border-2 border-green-300 rounded max-h-48 overflow-y-auto">
            <h4 className="font-black text-sm mb-2">📦 ASSETS:</h4>
            {sharedAssets.map((asset, idx) => (
              <div key={idx} className="text-xs p-1 bg-white border border-green-300 rounded mb-1">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(asset.url);
                    if (window.antd) window.antd.message.success('URL copied!');
                  }}
                  className="text-blue-600 font-bold w-full text-left"
                >
                  {asset.type === 'sprite' && '🖼️'} 
                  {asset.type === 'sound' && '🎵'} 
                  {asset.type === 'data' && '📄'} 
                  {asset.name}
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="space-y-3 mt-4">
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="w-full bg-green-600 text-white font-black py-3 brutal-button flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />} SAVE
          </button>

          <button
            onClick={onPlaytest}
            className="w-full bg-cyan-600 text-white font-black py-3 brutal-button flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4"/> QUICK PLAYTEST
          </button>

          <button
            onClick={onBack}
            className="w-full bg-gray-600 text-white font-black py-3 brutal-button flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4"/> BACK TO GRAPH
          </button>
        </div>
        
        <div className="mt-6 p-3 bg-blue-50 border-2 border-blue-300 rounded">
          <h4 className="font-black text-sm mb-2 text-blue-900">💡 TIP</h4>
          <p className="text-xs text-blue-800">
            {codingMode === 'blockly' 
              ? 'Use assets from the Assets panel. Copy URLs and paste into image/sound blocks!'
              : 'Auto-saves every 2 seconds. Use game API for sprites, physics, and state!'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default function GameMaker() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myGames, setMyGames] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [newGameDesc, setNewGameDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [showVariables, setShowVariables] = useState(false);
  const [showAIDesigner, setShowAIDesigner] = useState(false);
  const [showInEditorPlaytest, setShowInEditorPlaytest] = useState(false);
  const [sharedAssets, setSharedAssets] = useState([]);
  
  useEffect(() => {
    const loadUser = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const games = await base44.entities.GameMakerGame.filter({ created_by: u.email });
      setMyGames(games);
      const users = await base44.entities.User.list();
      setAllUsers(users);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const gameId = urlParams.get('id');
    if (gameId) {
      base44.entities.GameMakerGame.filter({ id: gameId }).then(games => {
        if (games.length > 0) {
          setCurrentGame(games[0]);
          setCollaborators(games[0].collaborators || []);
          setSharedAssets(games[0].game_data?.sharedAssets || []);
          setShowEditor(true);
        }
      });
    }
  }, [location.search]);

  const handleCreateNewGame = async () => {
    if (!newGameName || !user) return;
    setIsCreating(true);
    try {
      const newGame = await base44.entities.GameMakerGame.create({
        game_name: newGameName,
        description: newGameDesc,
        user_id: user.email,
        game_data: { nodes: [], connections: [], sharedAssets: [] },
        is_public: false,
        is_published: false,
        collaborators: []
      });
      setMyGames([...myGames, newGame]);
      setShowNewGameModal(false);
      setNewGameName('');
      setNewGameDesc('');
      setCurrentGame(newGame);
      setShowEditor(true);
      navigate(`${createPageUrl('GameMaker')}?id=${newGame.id}`);
    } catch (e) {
      console.error("Failed to create game:", e);
    }
    setIsCreating(false);
  };

  const handleDeleteGame = async (gameId) => {
    if (!confirm("Are you sure you want to delete this game?")) return;
    await base44.entities.GameMakerGame.delete(gameId);
    setMyGames(myGames.filter(g => g.id !== gameId));
    if (currentGame?.id === gameId) {
      setCurrentGame(null);
      setShowEditor(false);
      navigate(createPageUrl('GameMaker'));
    }
  };

  const handleSaveGame = async (updates) => {
    if (!currentGame) return;
    await base44.entities.GameMakerGame.update(currentGame.id, updates);
    setCurrentGame({ ...currentGame, ...updates });
    const updatedGames = myGames.map(g => g.id === currentGame.id ? { ...g, ...updates } : g);
    setMyGames(updatedGames);
  };

  const handleSaveNodeCode = async (nodeId, blocklyXml, javascriptCode, codingMode) => {
    const updatedNodes = currentGame.game_data.nodes.map(n =>
      n.id === nodeId ? { ...n, blocklyXml, javascriptCode, codingMode } : n
    );
    
    await handleSaveGame({
      game_data: {
        ...currentGame.game_data,
        nodes: updatedNodes
      }
    });
    
    setCurrentGame({
      ...currentGame,
      game_data: {
        ...currentGame.game_data,
        nodes: updatedNodes
      }
    });
  };

  const handlePublishToggle = async (game) => {
    const newPublishState = !game.is_published;
    await base44.entities.GameMakerGame.update(game.id, { is_published: newPublishState });
    const updatedGames = myGames.map(g => g.id === game.id ? { ...g, is_published: newPublishState } : g);
    setMyGames(updatedGames);
    if (currentGame?.id === game.id) {
      setCurrentGame({ ...currentGame, is_published: newPublishState });
    }
  };

  const handleAddCollaborator = async (email) => {
    if (collaborators.includes(email)) return;
    const newCollaborators = [...collaborators, email];
    setCollaborators(newCollaborators);
    await handleSaveGame({ collaborators: newCollaborators });
    setShowCollabModal(false);
  };

  const handleRemoveCollaborator = async (email) => {
    const newCollaborators = collaborators.filter(c => c !== email);
    setCollaborators(newCollaborators);
    await handleSaveGame({ collaborators: newCollaborators });
  };

  const handleHostMultiplayer = async (game) => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    const room = await base44.entities.GameRoom.create({
      game_code: code,
      quiz_id: game.quiz_id || 'custom',
      quiz_title: `${game.game_name} (Custom Game)`,
      host_email: user.email,
      players: [{ email: user.email, name: user.full_name, score: 0, is_finished: false }],
      spectators: [],
      mode: 'classic',
      gamemaker_game_id: game.id,
      misc_data: {},
      status: 'waiting'
    });
    navigate(`${createPageUrl('GameMakerLobby')}?id=${room.id}`);
  };

  const handleQuickPlaytest = () => {
    setShowInEditorPlaytest(true);
  };

  const handleAssetGenerated = (asset) => {
    const newAssets = [...sharedAssets, asset];
    setSharedAssets(newAssets);
    handleSaveGame({
      game_data: {
        ...currentGame.game_data,
        sharedAssets: newAssets
      }
    });
  };

  const handleFileUploaded = (file) => {
    const newAssets = [...sharedAssets, file];
    setSharedAssets(newAssets);
    handleSaveGame({
      game_data: {
        ...currentGame.game_data,
        sharedAssets: newAssets
      }
    });
  };

  const handleAIAddNode = async (type, label, code) => {
    const newNode = {
      id: Date.now().toString(),
      type,
      x: 100 + currentGame.game_data.nodes.length * 50,
      y: 100 + currentGame.game_data.nodes.length * 50,
      label,
      javascriptCode: code,
      codingMode: 'javascript',
      inputs: type === 'startgame' ? [] : ['input'],
      outputs: ['output']
    };
    
    const updatedNodes = [...currentGame.game_data.nodes, newNode];
    await handleSaveGame({
      game_data: {
        ...currentGame.game_data,
        nodes: updatedNodes
      }
    });
  };

  const handleAIEditNode = async (nodeId, updates) => {
    const updatedNodes = currentGame.game_data.nodes.map(n =>
      n.id === nodeId ? { ...n, ...updates } : n
    );
    
    await handleSaveGame({
      game_data: {
        ...currentGame.game_data,
        nodes: updatedNodes
      }
    });
  };

  const handleAIDeleteNode = async (nodeId) => {
    const updatedNodes = currentGame.game_data.nodes.filter(n => n.id !== nodeId);
    const updatedConnections = currentGame.game_data.connections.filter(c => 
      c.from !== nodeId && c.to !== nodeId
    );
    
    await handleSaveGame({
      game_data: {
        ...currentGame.game_data,
        nodes: updatedNodes,
        connections: updatedConnections
      }
    });
  };

  if (!user) return <div className="min-h-screen bg-gray-800 flex items-center justify-center"><Loader2 className="w-16 h-16 text-white animate-spin"/></div>;

  if (showInEditorPlaytest && currentGame) {
    return (
      <div className="h-screen bg-gray-900 flex flex-col">
        <div className="bg-black border-b-4 border-cyan-500 p-4 flex items-center justify-between">
          <h1 className="text-2xl font-black text-cyan-400">▶️ PLAYTESTING: {currentGame.game_name}</h1>
          <button 
            onClick={() => setShowInEditorPlaytest(false)}
            className="bg-red-600 text-white font-bold py-2 px-4 brutal-button flex items-center gap-2"
          >
            <X className="w-5 h-5"/> STOP PLAYTEST
          </button>
        </div>
        <div className="flex-1">
          <iframe
            src={`${createPageUrl('GameMakerPlay')}?gameId=${currentGame.id}&mode=solo`}
            className="w-full h-full border-0"
            title="Playtest"
          />
        </div>
      </div>
    );
  }

  if (showEditor && currentGame) {
    if (editingNode) {
      return (
        <div className="h-screen bg-gray-900 flex flex-col">
          <div className="bg-black border-b-4 border-cyan-500 p-4 flex items-center justify-between">
            <h1 className="text-2xl font-black text-cyan-400">EDITING: {editingNode.label}</h1>
            <button onClick={() => setEditingNode(null)} className="bg-gray-700 text-white font-bold py-2 px-4 brutal-button">
              <ArrowLeft className="w-5 h-5 inline mr-2"/> BACK TO GRAPH
            </button>
          </div>
          <div className="flex-1">
            <BlocklyEditor 
              game={currentGame}
              node={editingNode}
              onSave={handleSaveNodeCode}
              onBack={() => setEditingNode(null)}
              onPlaytest={handleQuickPlaytest}
              sharedAssets={sharedAssets}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen bg-gray-900 flex flex-col">
        <div className="bg-black border-b-4 border-cyan-500 p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-cyan-400">{currentGame.game_name}</h1>
            <p className="text-sm text-gray-400">Visual Node Editor • Auto-saves every 2s</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAIDesigner(!showAIDesigner)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 brutal-button flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4"/> AI CHAT
            </button>
            <button 
              onClick={() => setShowVariables(!showVariables)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 brutal-button flex items-center gap-2"
            >
              <Globe className="w-4 h-4"/> VARIABLES
            </button>
            <button 
              onClick={() => setShowCollabModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 brutal-button flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4"/> COLLABORATORS ({collaborators.length})
            </button>
            <button 
              onClick={handleQuickPlaytest}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 brutal-button flex items-center gap-2"
            >
              <Play className="w-4 h-4"/> PLAYTEST
            </button>
            <button 
              onClick={() => handlePublishToggle(currentGame)}
              className={`font-bold py-2 px-4 brutal-button flex items-center gap-2 ${currentGame.is_published ? 'bg-orange-600' : 'bg-green-600'} text-white`}
            >
              <Share2 className="w-4 h-4"/> {currentGame.is_published ? 'UNPUBLISH' : 'PUBLISH'}
            </button>
            <button onClick={() => {
              setShowEditor(false);
              setCurrentGame(null);
              navigate(createPageUrl('GameMaker'));
            }} className="bg-gray-700 text-white font-bold py-2 px-4 brutal-button flex items-center gap-2">
              <ArrowLeft className="w-5 h-5"/> BACK
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex">
            <div className="w-64 bg-gray-800 border-r-4 border-black p-4 overflow-y-auto">
              <h3 className="font-black text-white mb-4">🎨 ASSETS</h3>
              <AIAssetGenerator onAssetGenerated={handleAssetGenerated} />
              <FileUploader onFileUploaded={handleFileUploaded} />
            </div>
            <div className="flex-1">
              <NodeGraphEditor 
                game={currentGame}
                onSave={handleSaveGame}
                onOpenBlockly={(node) => setEditingNode(node)}
              />
            </div>
          </div>
          {showVariables && (
            <div className="w-96 border-l-4 border-black overflow-y-auto">
              <GlobalVariablesManager gameId={currentGame.id} />
            </div>
          )}
          {showAIDesigner && (
            <div className="w-96 border-l-4 border-black overflow-hidden">
              <AIChatDesigner 
                game={currentGame}
                onApplyCode={(code) => console.log('Apply code:', code)}
                onAddNode={handleAIAddNode}
                onEditNode={handleAIEditNode}
                onDeleteNode={handleAIDeleteNode}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <div className="bg-black border-4 border-cyan-500 p-8 brutal-card inline-block">
            <h1 className="text-4xl md:text-5xl font-black text-cyan-400 mb-2">GAMEMAKER V4</h1>
            <p className="text-xl font-bold">AI-Powered Visual Node-Based Game Development</p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 brutal-card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black">YOUR GAMES</h2>
            <div className="flex gap-3">
              <button onClick={() => navigate(createPageUrl('GameAssetStore'))} className="bg-purple-600 hover:bg-purple-700 text-white font-black py-3 px-6 brutal-button flex items-center gap-2">
                <ShoppingBag className="w-5 h-5"/> ASSET STORE
              </button>
              <button onClick={() => navigate(createPageUrl('GameMakerDiscover'))} className="bg-cyan-600 hover:bg-cyan-700 text-white font-black py-3 px-6 brutal-button flex items-center gap-2">
                <Eye className="w-5 h-5"/> DISCOVER
              </button>
              <button onClick={() => navigate(createPageUrl('GameMakerGuide'))} className="bg-yellow-600 hover:bg-yellow-700 text-white font-black py-3 px-6 brutal-button flex items-center gap-2">
                📚 DOCS
              </button>
              <button onClick={() => setShowNewGameModal(true)} className="bg-green-600 hover:bg-green-700 text-white font-black py-3 px-6 brutal-button flex items-center gap-2">
                <Plus className="w-5 h-5"/> NEW GAME
              </button>
            </div>
          </div>
          
          {myGames.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myGames.map(game => (
                <div key={game.id} className="bg-gray-700 p-4 brutal-card relative">
                  {game.is_published && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white px-3 py-1 font-black text-xs brutal-shadow flex items-center gap-1">
                      <Share2 className="w-3 h-3"/> PUBLISHED
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 className="w-6 h-6 text-cyan-400" />
                    <h3 className="font-black text-xl text-white">{game.game_name}</h3>
                  </div>
                  {game.description && <p className="text-gray-400 text-sm mb-4">{game.description}</p>}
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => {
                      setCurrentGame(game);
                      setCollaborators(game.collaborators || []);
                      setSharedAssets(game.game_data?.sharedAssets || []);
                      setShowEditor(true);
                      navigate(`${createPageUrl('GameMaker')}?id=${game.id}`);
                    }} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 brutal-button flex items-center justify-center gap-2">
                      <Edit className="w-4 h-4"/> EDIT
                    </button>
                    <button onClick={() => handleDeleteGame(game.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 brutal-button">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                  <button onClick={() => handleHostMultiplayer(game)} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 brutal-button flex items-center justify-center gap-2">
                    <Users className="w-4 h-4"/> HOST GAME
                  </button>
                  <p className="text-xs text-gray-500 mt-2">Created: {new Date(game.created_date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Code2 className="w-24 h-24 mx-auto text-gray-600 mb-4"/>
              <p className="text-xl font-bold text-gray-400 mb-4">No games yet. Create your first game!</p>
              <button onClick={() => setShowNewGameModal(true)} className="bg-green-600 hover:bg-green-700 text-white font-black py-3 px-8 brutal-button inline-flex items-center gap-2">
                <Plus className="w-5 h-5"/> CREATE YOUR FIRST GAME
              </button>
            </div>
          )}
        </div>
      </div>

      {showNewGameModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowNewGameModal(false)}>
          <div className="bg-gray-800 border-8 border-black p-6 brutal-card w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-white mb-4">CREATE NEW GAME</h2>
            <div className="space-y-4">
              <div>
                <label className="font-bold text-white mb-2 block">Game Name</label>
                <input 
                  type="text" 
                  placeholder="My Awesome Game" 
                  value={newGameName}
                  onChange={e => setNewGameName(e.target.value)}
                  className="w-full p-3 border-4 border-black font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-white mb-2 block">Description (Optional)</label>
                <textarea 
                  placeholder="What's your game about?" 
                  value={newGameDesc}
                  onChange={e => setNewGameDesc(e.target.value)}
                  className="w-full p-3 border-4 border-black font-bold h-24"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowNewGameModal(false)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-black py-3 brutal-button">
                  CANCEL
                </button>
                <button onClick={handleCreateNewGame} disabled={!newGameName || isCreating} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-black py-3 brutal-button flex items-center justify-center gap-2">
                  {isCreating ? <Loader2 className="animate-spin" /> : <Plus className="w-5 h-5"/>}
                  CREATE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCollabModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowCollabModal(false)}>
          <div className="bg-gray-800 border-8 border-black p-6 brutal-card w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-white mb-4">MANAGE COLLABORATORS</h2>
            
            <div className="mb-4">
              <h3 className="font-bold text-white mb-2">Current Collaborators:</h3>
              <div className="space-y-2">
                {collaborators.map(email => (
                  <div key={email} className="flex items-center justify-between bg-gray-700 p-2 border-2 border-black">
                    <span className="text-white font-bold">{email}</span>
                    <button onClick={() => handleRemoveCollaborator(email)} className="text-red-500 font-bold">×</button>
                  </div>
                ))}
                {collaborators.length === 0 && <p className="text-gray-400">No collaborators yet</p>}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-2">Add Collaborator:</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allUsers.filter(u => u.email !== user.email && !collaborators.includes(u.email)).map(u => (
                  <button
                    key={u.email}
                    onClick={() => handleAddCollaborator(u.email)}
                    className="w-full flex items-center justify-between bg-gray-700 p-2 border-2 border-black hover:bg-gray-600"
                  >
                    <span className="text-white font-bold">{u.full_name}</span>
                    <Plus className="w-4 h-4 text-green-500"/>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}