import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, Play, Star, Eye, Copy, TrendingUp, Search } from 'lucide-react';

export default function GameMakerDiscover() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [publishedGames, setPublishedGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [showRatingModal, setShowRatingModal] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const u = await base44.auth.me();
                setUser(u);
                const games = await base44.entities.GameMakerGame.filter({ is_published: true });
                setPublishedGames(games);
                setFilteredGames(games);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        let result = [...publishedGames];
        
        if (searchTerm) {
            result = result.filter(g => 
                g.game_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                g.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        switch (sortBy) {
            case 'rating':
                result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
                break;
            case 'plays':
                result.sort((a, b) => (b.play_count || 0) - (a.play_count || 0));
                break;
            case 'recent':
            default:
                result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
                break;
        }
        
        setFilteredGames(result);
    }, [searchTerm, sortBy, publishedGames]);

    const handlePlay = async (game) => {
        await base44.entities.GameMakerGame.update(game.id, { 
            play_count: (game.play_count || 0) + 1 
        });
        navigate(`${createPageUrl('GameMakerPlay')}?gameId=${game.id}&mode=solo`);
    };

    const handleFork = async (game) => {
        if (!user) return;
        
        try {
            const forkedGame = await base44.entities.GameMakerGame.create({
                game_name: `${game.game_name} (Fork)`,
                description: game.description,
                user_id: user.email,
                game_data: game.game_data,
                quiz_id: game.quiz_id,
                group_id: null,
                is_public: false,
                is_published: false,
                forked_from: game.id
            });
            
            await base44.entities.GameMakerGame.update(game.id, {
                fork_count: (game.fork_count || 0) + 1
            });
            
            navigate(`${createPageUrl('GameMaker')}?id=${forkedGame.id}`);
        } catch (e) {
            console.error("Failed to fork game:", e);
            alert("Failed to fork game. Please try again.");
        }
    };

    const handleRateGame = async (gameId) => {
        if (!user || !rating) return;
        
        try {
            // Check if user already rated
            const existingRatings = await base44.entities.GameRating.filter({ 
                game_id: gameId, 
                user_email: user.email 
            });
            
            if (existingRatings.length > 0) {
                await base44.entities.GameRating.update(existingRatings[0].id, { rating, comment });
            } else {
                await base44.entities.GameRating.create({
                    game_id: gameId,
                    user_email: user.email,
                    rating,
                    comment
                });
            }
            
            // Update game's average rating
            const allRatings = await base44.entities.GameRating.filter({ game_id: gameId });
            const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
            
            await base44.entities.GameMakerGame.update(gameId, {
                average_rating: avgRating,
                rating_count: allRatings.length
            });
            
            setShowRatingModal(null);
            setRating(5);
            setComment('');
            
            // Refresh games
            const games = await base44.entities.GameMakerGame.filter({ is_published: true });
            setPublishedGames(games);
        } catch (e) {
            console.error("Failed to rate game:", e);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <div className="bg-black border-4 border-cyan-500 p-8 brutal-card inline-block">
                        <h1 className="text-4xl md:text-5xl font-black text-cyan-400">GAME MARKETPLACE</h1>
                        <p className="text-lg font-bold text-white mt-2">Discover & Play Community Games</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-gray-800 p-6 brutal-card mb-8">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search games..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full p-3 border-4 border-black font-bold"
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"/>
                        </div>
                        <select 
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="w-full p-3 border-4 border-black font-bold bg-white text-black"
                        >
                            <option value="recent">Most Recent</option>
                            <option value="rating">Highest Rated</option>
                            <option value="plays">Most Played</option>
                        </select>
                    </div>
                </div>

                {/* Games Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGames.map(game => (
                        <div key={game.id} className="bg-gray-800 p-4 brutal-card">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-black text-xl text-white">{game.game_name}</h3>
                                <div className="flex items-center gap-1 bg-yellow-400 text-black px-2 py-1 font-black text-sm">
                                    <Star className="w-4 h-4" fill="currentColor"/>
                                    {game.average_rating?.toFixed(1) || '0.0'}
                                </div>
                            </div>
                            
                            {game.description && (
                                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{game.description}</p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3"/> {game.play_count || 0} plays
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3"/> {game.rating_count || 0} ratings
                                </span>
                                {game.fork_count > 0 && (
                                    <span className="flex items-center gap-1">
                                        <Copy className="w-3 h-3"/> {game.fork_count} forks
                                    </span>
                                )}
                            </div>
                            
                            <p className="text-xs text-gray-500 mb-4">
                                By: {game.created_by?.split('@')[0]} • {new Date(game.created_date).toLocaleDateString()}
                            </p>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handlePlay(game)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 brutal-button flex items-center justify-center gap-2"
                                >
                                    <Play className="w-4 h-4"/> PLAY
                                </button>
                                <button 
                                    onClick={() => handleFork(game)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 brutal-button flex items-center justify-center gap-2"
                                    disabled={!user}
                                >
                                    <Copy className="w-4 h-4"/> FORK
                                </button>
                            </div>
                            
                            {user && (
                                <button 
                                    onClick={() => setShowRatingModal(game.id)}
                                    className="w-full mt-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 brutal-button flex items-center justify-center gap-2"
                                >
                                    <Star className="w-4 h-4"/> RATE
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {filteredGames.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-xl font-bold text-gray-400">No published games found</p>
                    </div>
                )}
            </div>

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowRatingModal(null)}>
                    <div className="bg-gray-800 border-8 border-black p-6 brutal-card w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-black text-white mb-4">RATE THIS GAME</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="font-bold text-white mb-2 block">Rating (1-5 stars)</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className={`text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="font-bold text-white mb-2 block">Comment (Optional)</label>
                                <textarea 
                                    placeholder="What did you think?" 
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    className="w-full p-3 border-4 border-black font-bold h-24"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowRatingModal(null)} 
                                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-black py-3 brutal-button"
                                >
                                    CANCEL
                                </button>
                                <button 
                                    onClick={() => handleRateGame(showRatingModal)} 
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-3 brutal-button"
                                >
                                    SUBMIT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}