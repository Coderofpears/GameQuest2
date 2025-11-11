import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/entities/User';
import { GameSession } from '@/entities/GameSession';
import { Avatar } from '@/entities/Avatar';
import { Loader2, Save, User as UserIcon, Wrench, Upload, Gamepad2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { UploadFile } from '@/integrations/Core';

const AvatarStore = ({ user, onPurchase }) => {
    const [avatars, setAvatars] = useState([]);
    const navigate = useNavigate();
    
    useEffect(() => {
        Avatar.list().then(setAvatars);
    }, []);

    const handleBuy = async (avatar) => {
        if (user.scrap < avatar.cost) {
            alert("Not enough scrap!");
            return;
        }
        const newScrap = user.scrap - avatar.cost;
        await User.updateMyUserData({ scrap: newScrap, avatar_url: avatar.emoji });
        onPurchase(newScrap, avatar.emoji);
    };

    const handleUnlockGame = async (gameName, cost) => {
        if (user.scrap < cost) {
            alert(`Not enough scrap! You need ${cost} scrap to unlock this game.`);
            return;
        }
        
        if (user.unlocked_games && user.unlocked_games.includes(gameName)) {
            return;
        }
        
        const newScrap = user.scrap - cost;
        const unlockedGames = [...(user.unlocked_games || []), gameName];
        await User.updateMyUserData({ scrap: newScrap, unlocked_games: unlockedGames });
        onPurchase(newScrap, user.avatar_url);
        alert("🎉 Game unlocked!");
    };
    
    const hasLabyrinth = user.unlocked_games && user.unlocked_games.includes('labyrinth_of_logic');
    const hasAquaria = user.unlocked_games && user.unlocked_games.includes('aquaria');

    return (
        <div className="bg-white p-6 brutal-card">
            <h3 className="font-black text-xl mb-4">AVATAR SHOP & UNLOCKS</h3>
            
            {/* Premium Games */}
            <div className="space-y-4 mb-6">
                {!hasLabyrinth && (
                    <div className="p-4 bg-gradient-to-r from-purple-400 to-pink-400 border-4 border-black brutal-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Gamepad2 className="w-6 h-6 text-black"/>
                                <span className="font-black text-lg text-black">Labyrinth of Logic</span>
                            </div>
                            <span className="bg-black text-yellow-400 px-3 py-1 font-black text-sm brutal-shadow flex items-center gap-1">
                                <Wrench className="w-4 h-4"/> 500
                            </span>
                        </div>
                        <p className="text-black text-sm font-bold mb-3">A mind-bending maze game where you answer trivia to survive!</p>
                        <button onClick={() => handleUnlockGame('labyrinth_of_logic', 500)} className="w-full bg-black text-yellow-400 font-black py-2 brutal-button">
                            UNLOCK GAME
                        </button>
                    </div>
                )}
                
                {!hasAquaria && (
                    <div className="p-4 bg-gradient-to-r from-cyan-400 to-blue-400 border-4 border-black brutal-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Gamepad2 className="w-6 h-6 text-black"/>
                                <span className="font-black text-lg text-black">Aquaria Tycoon</span>
                            </div>
                            <span className="bg-black text-cyan-400 px-3 py-1 font-black text-sm brutal-shadow flex items-center gap-1">
                                <Wrench className="w-4 h-4"/> 300
                            </span>
                        </div>
                        <p className="text-black text-sm font-bold mb-3">Build and manage your own aquarium empire!</p>
                        <button onClick={() => handleUnlockGame('aquaria', 300)} className="w-full bg-black text-cyan-400 font-black py-2 brutal-button">
                            UNLOCK GAME
                        </button>
                    </div>
                )}
                
                {(hasLabyrinth || hasAquaria) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hasLabyrinth && (
                            <Link to={createPageUrl('LabyrinthOfLogic')} className="block text-center bg-green-500 text-white font-black py-2 brutal-button">
                                PLAY LABYRINTH
                            </Link>
                        )}
                        {hasAquaria && (
                            <Link to={createPageUrl('AquariaTycoon')} className="block text-center bg-blue-500 text-white font-black py-2 brutal-button">
                                PLAY AQUARIA
                            </Link>
                        )}
                    </div>
                )}
                
                {hasLabyrinth && hasAquaria && (
                    <div className="p-4 bg-green-400 border-4 border-black brutal-shadow text-center">
                        <p className="font-black text-black text-lg">🎉 All premium games unlocked!</p>
                    </div>
                )}
            </div>

            {/* Avatars */}
            <h4 className="font-bold mb-2">Avatars:</h4>
            <div className="grid grid-cols-4 gap-4">
                {avatars.map(av => (
                    <button key={av.id} onClick={() => handleBuy(av)} className="border-4 border-black bg-gray-100 flex flex-col items-center p-2 brutal-button disabled:opacity-50" disabled={user.scrap < av.cost}>
                        <span className="text-3xl">{av.emoji}</span>
                        <span className="font-bold text-xs flex items-center gap-1"><Wrench className="w-3 h-3"/>{av.cost}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('');
    const [recentGames, setRecentGames] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const u = await User.me();
            setUser(u);
            setBio(u.bio || '');
            setAvatar(u.avatar_url || '👤');
            const games = await GameSession.filter({ created_by: u.email }, '-created_date', 5);
            setRecentGames(games);
        } catch (e) {
            navigate(createPageUrl('Lobby'));
        }
    }, [navigate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSave = async () => {
        setIsSaving(true);
        await User.updateMyUserData({ bio, avatar_url: avatar });
        setIsSaving(false);
    };

    const handlePurchase = (newScrap, newAvatar) => {
        setUser(prev => ({ ...prev, scrap: newScrap, avatar_url: newAvatar }));
        if (newAvatar) setAvatar(newAvatar);
        loadData();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setIsUploading(true);
        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Failed to upload avatar:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };
    
    if (!user) return <div className="min-h-screen bg-gray-400 flex items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-black" /></div>;

    const isEmoji = /\p{Emoji}/u.test(avatar) && avatar.length < 10;
    const isBase64 = avatar.startsWith('data:image');
    const isURL = avatar.startsWith('http') || avatar.startsWith('/');

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-400 to-blue-500 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-black text-white p-8 brutal-card inline-block transform -rotate-1 mb-8">
                    <h1 className="text-4xl md:text-5xl font-black">YOUR PROFILE</h1>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 space-y-8">
                        <div className="bg-white p-6 brutal-card">
                            <div className="w-32 h-32 mx-auto border-4 border-black bg-gray-200 brutal-shadow mb-4 flex items-center justify-center overflow-hidden">
                                {isEmoji ? 
                                    <span className="text-7xl">{avatar}</span> :
                                    (isBase64 || isURL) ? 
                                    <img src={avatar} alt="avatar" className="w-full h-full object-cover"/> :
                                    <UserIcon className="w-16 h-16 text-gray-500"/>
                                }
                            </div>
                            <h2 className="text-2xl font-black text-center break-words">{user.full_name}</h2>
                            <p className="text-center text-gray-600 font-bold break-words">{user.email}</p>
                        </div>
                        <div className="bg-white p-6 brutal-card">
                             <h3 className="font-black text-xl mb-2">STATS</h3>
                             <div className="flex justify-around text-center">
                                <div>
                                    <p className="font-black text-3xl">{user.scrap}</p>
                                    <p className="font-bold text-sm">SCRAP</p>
                                </div>
                                <div>
                                    <p className="font-black text-3xl">{user.shields}</p>
                                    <p className="font-bold text-sm">SHIELDS</p>
                                </div>
                             </div>
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-8">
                         <div className="bg-white p-6 brutal-card">
                            <h3 className="font-black text-xl mb-4">EDIT PROFILE</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="font-bold mb-2 block">Avatar (Emoji or Upload Image)</label>
                                    <input type="text" placeholder="Emoji like 😎" value={avatar} onChange={e => setAvatar(e.target.value)} className="w-full p-3 border-4 border-black font-bold mb-2"/>
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="avatar-upload"
                                        />
                                        <label htmlFor="avatar-upload" className="w-full bg-gray-200 text-black font-bold py-3 brutal-button flex items-center justify-center gap-2 cursor-pointer">
                                            {isUploading ? <Loader2 className="animate-spin" /> : <><Upload className="w-4 h-4"/> UPLOAD IMAGE</>}
                                        </label>
                                    </div>
                                </div>
                                <textarea placeholder="Your Bio..." value={bio} onChange={e => setBio(e.target.value)} className="w-full p-3 border-4 border-black font-bold h-32"/>
                                <button onClick={handleSave} disabled={isSaving} className="w-full bg-green-500 text-white font-black py-3 brutal-button flex items-center justify-center gap-2">
                                  {isSaving ? <Loader2 className="animate-spin"/> : <><Save/> SAVE</>}
                                </button>
                            </div>
                        </div>
                        <AvatarStore user={user} onPurchase={handlePurchase} />
                        <div className="bg-white p-6 brutal-card">
                            <h3 className="font-black text-xl mb-4">RECENT ACTIVITY</h3>
                            <div className="space-y-2">
                                {recentGames.map(game => (
                                    <div key={game.id} className="p-3 border-2 border-black bg-gray-100 flex justify-between">
                                        <p className="font-bold break-words">{game.quiz_title}</p>
                                        <p className="font-black">{game.score}%</p>
                                    </div>
                                ))}
                                {recentGames.length === 0 && <p className="font-bold text-gray-500">No recent games played.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}