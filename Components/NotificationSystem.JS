import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, X, UserPlus, Play, ShoppingBag, Info } from 'lucide-react';

export default function NotificationSystem() {
    const [notifications, setNotifications] = useState([]);
    const [user, setUser] = useState(null);
    const [showPanel, setShowPanel] = useState(false);

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => {});
    }, []);

    useEffect(() => {
        if (!user) return;

        // Load Ant Design dynamically
        if (!window.antd) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/antd@5/dist/antd.min.js';
            document.head.appendChild(script);
        }

        // Poll for notifications
        const checkNotifications = async () => {
            try {
                // Check for pending challenges
                const challenges = await base44.entities.Challenge.filter({ 
                    challenged_email: user.email, 
                    status: 'pending' 
                });
                
                if (challenges.length > 0 && window.antd) {
                    challenges.forEach(challenge => {
                        const existingNotif = notifications.find(n => n.id === `challenge-${challenge.id}`);
                        if (!existingNotif) {
                            window.antd.notification.info({
                                message: '🎮 Friend Challenge!',
                                description: `${challenge.challenger_name} challenged you to "${challenge.quiz_title}"`,
                                duration: 0,
                                btn: React.createElement('button', {
                                    onClick: () => {
                                        window.location.href = `/Challenges`;
                                    },
                                    className: 'bg-blue-600 text-white px-4 py-2 rounded font-bold'
                                }, 'View Challenge')
                            });
                            
                            setNotifications(prev => [...prev, {
                                id: `challenge-${challenge.id}`,
                                type: 'challenge',
                                title: 'Friend Challenge!',
                                message: `${challenge.challenger_name} challenged you`,
                                timestamp: Date.now()
                            }]);
                        }
                    });
                }

                // Check for game rooms about to start
                const gameRooms = await base44.entities.GameRoom.filter({ status: 'waiting' });
                gameRooms.forEach(room => {
                    const isPlayer = room.players?.some(p => p.email === user.email);
                    if (isPlayer && room.players.length >= 2) {
                        const existingNotif = notifications.find(n => n.id === `room-${room.id}`);
                        if (!existingNotif && window.antd) {
                            window.antd.notification.success({
                                message: '🎮 Game Ready!',
                                description: `${room.players.length} players in room. Game can start!`,
                                duration: 5
                            });
                            
                            setNotifications(prev => [...prev, {
                                id: `room-${room.id}`,
                                type: 'game_ready',
                                title: 'Game Ready',
                                message: `Room ${room.game_code} ready to start`,
                                timestamp: Date.now()
                            }]);
                        }
                    }
                });

                // Check for new published assets
                const recentAssets = await base44.entities.GameAsset.list('-created_date', 5);
                recentAssets.forEach(asset => {
                    const assetAge = Date.now() - new Date(asset.created_date).getTime();
                    if (assetAge < 300000) { // Less than 5 minutes old
                        const existingNotif = notifications.find(n => n.id === `asset-${asset.id}`);
                        if (!existingNotif && asset.creator_email !== user.email && window.antd) {
                            window.antd.notification.info({
                                message: '🛍️ New Asset Available!',
                                description: `${asset.name} by ${asset.creator_email?.split('@')[0]}`,
                                duration: 5
                            });
                            
                            setNotifications(prev => [...prev, {
                                id: `asset-${asset.id}`,
                                type: 'new_asset',
                                title: 'New Asset',
                                message: asset.name,
                                timestamp: Date.now()
                            }]);
                        }
                    }
                });

            } catch (e) {
                console.error("Error checking notifications:", e);
            }
        };

        checkNotifications();
        const interval = setInterval(checkNotifications, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, [user, notifications]);

    const dismissNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'challenge': return <UserPlus className="w-5 h-5 text-blue-500" />;
            case 'game_ready': return <Play className="w-5 h-5 text-green-500" />;
            case 'new_asset': return <ShoppingBag className="w-5 h-5 text-purple-500" />;
            default: return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    if (!user) return null;

    return (
        <>
            {/* Notification Bell */}
            <button 
                onClick={() => setShowPanel(!showPanel)}
                className="fixed top-4 right-4 bg-yellow-400 p-3 brutal-button z-50"
            >
                <Bell className="w-6 h-6 text-black" />
                {notifications.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
                        {notifications.length}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {showPanel && (
                <div className="fixed top-20 right-4 w-96 bg-white border-8 border-black brutal-card z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b-4 border-black flex items-center justify-between bg-yellow-400">
                        <h3 className="font-black text-lg">NOTIFICATIONS</h3>
                        <button onClick={() => setShowPanel(false)} className="hover:opacity-70">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 font-bold">
                            No new notifications
                        </div>
                    ) : (
                        <div className="divide-y-4 divide-black">
                            {notifications.map(notif => (
                                <div key={notif.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-start gap-3">
                                        {getIcon(notif.type)}
                                        <div className="flex-1">
                                            <h4 className="font-black text-sm">{notif.title}</h4>
                                            <p className="text-xs text-gray-600 font-bold">{notif.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(notif.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => dismissNotification(notif.id)}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}