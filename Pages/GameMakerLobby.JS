import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Users, Copy, Play, Loader2, ArrowLeft, Send, Eye, UserPlus, X } from 'lucide-react';

export default function GameMakerLobby() {
  const navigate = useNavigate();
  const location = useLocation();
  const [gameRoom, setGameRoom] = useState(null);
  const [game, setGame] = useState(null);
  const [user, setUser] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [inviteFriend, setInviteFriend] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const gameRoomId = new URLSearchParams(location.search).get('id');

  const fetchGameRoom = useCallback(async () => {
    if (!gameRoomId) return;
    try {
      const rooms = await base44.entities.GameRoom.filter({ id: gameRoomId });
      if (rooms.length > 0) {
        const room = rooms[0];
        setGameRoom(room);
        
        if (room.gamemaker_game_id) {
          const games = await base44.entities.GameMakerGame.filter({ id: room.gamemaker_game_id });
          if (games.length > 0) setGame(games[0]);
        }
        
        if (room.status === 'playing') {
          navigate(`${createPageUrl('GameMakerPlay')}?roomId=${room.id}&mode=multiplayer`);
        }
      } else {
        navigate(createPageUrl('GameMaker'));
      }
    } catch (e) {
      console.error("Error fetching game room:", e);
    }
  }, [gameRoomId, navigate]);

  const fetchMessages = useCallback(async () => {
    if (!gameRoomId) return;
    try {
      const msgs = await base44.entities.LobbyMessage.filter({ room_id: gameRoomId }, '-created_date', 50);
      setMessages(msgs.reverse());
    } catch (e) {
      console.error("Error fetching messages:", e);
    }
  }, [gameRoomId]);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (gameRoom) setIsHost(gameRoom.host_email === u.email);
    }).catch(() => navigate(createPageUrl('Lobby')));

    // Load all users for invitations
    base44.entities.User.list().then(users => {
      setAllUsers(users);
    }).catch(() => {});
  }, [gameRoom, navigate]);

  useEffect(() => {
    fetchGameRoom();
    fetchMessages();
    const interval = setInterval(() => {
      fetchGameRoom();
      fetchMessages();
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchGameRoom, fetchMessages]);

  const startGame = async () => {
    if (!isHost || !gameRoom) return;
    await base44.entities.GameRoom.update(gameRoom.id, { status: 'playing' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    await base44.entities.LobbyMessage.create({
      room_id: gameRoomId,
      sender_email: user.email,
      sender_name: user.full_name,
      message: newMessage,
      timestamp: Date.now()
    });
    
    setNewMessage('');
    fetchMessages();
  };

  const inviteFriendToRoom = async (friendEmail) => {
    if (!friendEmail || !gameRoom || !user) return;
    
    // Send a challenge/notification (simplified - in real app, send email/notification)
    alert(`Invitation sent to ${friendEmail}! Share the game code: ${gameRoom.game_code}`);
    setShowInviteModal(false);
  };

  const toggleSpectator = async () => {
    if (!gameRoom || !user) return;
    
    const isCurrentlySpectator = gameRoom.spectators?.some(s => s.email === user.email);
    
    if (isCurrentlySpectator) {
      const newSpectators = gameRoom.spectators.filter(s => s.email !== user.email);
      await base44.entities.GameRoom.update(gameRoom.id, { spectators: newSpectators });
    } else {
      const newSpectators = [...(gameRoom.spectators || []), { email: user.email, name: user.full_name }];
      await base44.entities.GameRoom.update(gameRoom.id, { spectators: newSpectators });
    }
  };
  
  if (!gameRoom || !user || !game) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-white" />
      </div>
    );
  }
  
  const copyCode = () => {
    navigator.clipboard.writeText(gameRoom.game_code);
  };

  const isSpectator = gameRoom.spectators?.some(s => s.email === user.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black p-4 md:p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Room Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-black border-4 border-cyan-500 p-8 brutal-card">
              <h1 className="text-3xl md:text-4xl font-black mb-2 text-cyan-400">GAME LOBBY</h1>
              <p className="text-lg font-bold">{game.game_name}</p>
              {game.description && <p className="text-sm text-gray-400 mt-2">{game.description}</p>}
            </div>

            <div className="bg-gray-800 p-6 brutal-card">
              <h2 className="font-black text-2xl text-white mb-2">GAME CODE</h2>
              <div className="bg-gray-900 border-4 border-white p-4 flex items-center justify-center gap-4 brutal-shadow">
                <p className="text-5xl font-black text-white tracking-widest">{gameRoom.game_code}</p>
                <button onClick={copyCode} className="bg-cyan-400 p-3 brutal-button">
                  <Copy className="w-6 h-6 text-black"/>
                </button>
              </div>
            </div>

            <div className="bg-gray-800 p-6 brutal-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-2xl text-white flex items-center gap-2">
                  <Users /> PLAYERS ({gameRoom.players.length})
                </h2>
                {isHost && (
                  <button 
                    onClick={() => setShowInviteModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 font-bold brutal-button flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4"/> INVITE
                  </button>
                )}
              </div>
              <div className="space-y-3 mb-4">
                {gameRoom.players.map(p => (
                  <div key={p.email} className="bg-cyan-400 p-3 border-4 border-black brutal-shadow font-bold text-lg text-black">
                    {p.name} {p.email === gameRoom.host_email && '(HOST)'}
                  </div>
                ))}
              </div>
              
              {gameRoom.spectators && gameRoom.spectators.length > 0 && (
                <>
                  <h3 className="font-black text-lg text-white mb-2 flex items-center gap-2">
                    <Eye className="w-5 h-5"/> SPECTATORS ({gameRoom.spectators.length})
                  </h3>
                  <div className="space-y-2">
                    {gameRoom.spectators.map(s => (
                      <div key={s.email} className="bg-purple-400 p-2 border-2 border-black font-bold text-sm text-black">
                        {s.name} (Watching)
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {isHost && (
              <button onClick={startGame} className="w-full bg-cyan-600 text-white font-black text-3xl py-6 brutal-button flex items-center justify-center gap-4">
                <Play className="w-8 h-8"/> START GAME
              </button>
            )}
            {!isHost && (
              <>
                <div className="bg-black text-white p-6 brutal-card font-bold text-2xl flex items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin"/> WAITING FOR HOST...
                </div>
                <button 
                  onClick={toggleSpectator}
                  className={`w-full font-black py-4 brutal-button flex items-center justify-center gap-2 ${
                    isSpectator ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
                  } text-white`}
                >
                  <Eye className="w-5 h-5"/> {isSpectator ? 'LEAVE SPECTATOR MODE' : 'WATCH AS SPECTATOR'}
                </button>
              </>
            )}
          </div>

          {/* Right Column - Chat */}
          <div className="bg-gray-800 p-4 brutal-card flex flex-col" style={{ maxHeight: '600px' }}>
            <h3 className="font-black text-xl mb-4 text-white">💬 LOBBY CHAT</h3>
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {messages.map(msg => (
                <div key={msg.id} className={`p-2 rounded ${msg.sender_email === user.email ? 'bg-cyan-600 ml-8' : 'bg-gray-700 mr-8'}`}>
                  <p className="font-bold text-xs text-white/70">{msg.sender_name}</p>
                  <p className="text-white font-bold">{msg.message}</p>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                className="flex-1 p-2 border-2 border-black font-bold text-black"
              />
              <button type="submit" className="bg-green-600 p-2 brutal-button text-white">
                <Send className="w-5 h-5"/>
              </button>
            </form>
          </div>
        </div>
        
        <Link to={createPageUrl('GameMaker')} className="mt-6 inline-block font-bold text-white bg-gray-700 p-3 border-4 border-white brutal-button flex items-center gap-2">
          <ArrowLeft /> LEAVE ROOM
        </Link>
      </div>

      {/* Friend Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowInviteModal(false)}>
          <div className="bg-gray-800 border-8 border-black p-6 brutal-card w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-white">INVITE FRIENDS</h2>
              <button onClick={() => setShowInviteModal(false)} className="text-white hover:text-red-500">
                <X className="w-6 h-6"/>
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {allUsers.filter(u => u.email !== user.email && !gameRoom.players.some(p => p.email === u.email)).map(u => (
                <div key={u.email} className="flex items-center justify-between bg-gray-700 p-3 brutal-card">
                  <span className="font-bold text-white">{u.full_name}</span>
                  <button 
                    onClick={() => inviteFriendToRoom(u.email)}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 font-bold brutal-button text-white"
                  >
                    INVITE
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}