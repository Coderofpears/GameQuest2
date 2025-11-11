import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, Upload, Download, ShoppingCart, Star, Search, Plus, Wrench, TrendingUp } from 'lucide-react';

export default function GameAssetStore() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [assets, setAssets] = useState([]);
    const [myAssets, setMyAssets] = useState([]);
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // Upload form state
    const [newAsset, setNewAsset] = useState({
        name: '',
        description: '',
        type: 'image',
        price: 0,
        tags: []
    });
    const [file, setFile] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const u = await base44.auth.me();
                setUser(u);
                const allAssets = await base44.entities.GameAsset.filter({ is_public: true });
                setAssets(allAssets);
                setFilteredAssets(allAssets);
                const userAssets = await base44.entities.GameAsset.filter({ creator_email: u.email });
                setMyAssets(userAssets);
            } catch (e) {
                console.error(e);
                navigate(createPageUrl('Lobby'));
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [navigate]);

    useEffect(() => {
        let result = [...assets];
        
        if (searchTerm) {
            result = result.filter(a => 
                a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (filterType !== 'all') {
            result = result.filter(a => a.type === filterType);
        }
        
        setFilteredAssets(result);
    }, [searchTerm, filterType, assets]);

    const handleUpload = async () => {
        if (!file || !newAsset.name || !user) return;
        
        setUploading(true);
        try {
            // Upload file
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            
            // Create asset
            await base44.entities.GameAsset.create({
                ...newAsset,
                file_url,
                thumbnail_url: file_url,
                creator_email: user.email
            });
            
            // Refresh assets
            const allAssets = await base44.entities.GameAsset.filter({ is_public: true });
            setAssets(allAssets);
            const userAssets = await base44.entities.GameAsset.filter({ creator_email: user.email });
            setMyAssets(userAssets);
            
            setShowUploadModal(false);
            setNewAsset({ name: '', description: '', type: 'image', price: 0, tags: [] });
            setFile(null);
        } catch (e) {
            console.error("Upload failed:", e);
            alert("Failed to upload asset");
        } finally {
            setUploading(false);
        }
    };

    const handlePurchase = async (asset) => {
        if (!user) return;
        
        if (asset.price > user.scrap) {
            alert(`Not enough scrap! You need ${asset.price} scrap.`);
            return;
        }
        
        if (asset.price === 0) {
            // Free download
            await base44.entities.GameAsset.update(asset.id, {
                download_count: (asset.download_count || 0) + 1
            });
            alert("Downloaded! Check your assets.");
        } else {
            // Purchase
            const newScrap = user.scrap - asset.price;
            await base44.auth.updateMe({ scrap: newScrap });
            
            await base44.entities.GameAsset.update(asset.id, {
                download_count: (asset.download_count || 0) + 1,
                purchase_count: (asset.purchase_count || 0) + 1,
                revenue_earned: (asset.revenue_earned || 0) + asset.price
            });
            
            // Give creator the money
            alert("Purchased! Asset added to your library.");
            setUser({ ...user, scrap: newScrap });
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
                    <div className="bg-black border-4 border-purple-500 p-8 brutal-card inline-block">
                        <h1 className="text-4xl md:text-5xl font-black text-purple-400">ASSET STORE</h1>
                        <p className="text-lg font-bold text-white mt-2">Images, Sounds & More for Your Games</p>
                    </div>
                </div>

                {/* My Assets */}
                {myAssets.length > 0 && (
                    <div className="bg-gray-800 p-6 brutal-card mb-8">
                        <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-green-400"/> MY ASSETS ({myAssets.length})
                        </h2>
                        <div className="grid md:grid-cols-4 gap-4">
                            {myAssets.map(asset => (
                                <div key={asset.id} className="bg-gray-700 p-4 brutal-card">
                                    <h3 className="font-black text-white mb-2">{asset.name}</h3>
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>⬇ {asset.download_count || 0}</span>
                                        <span>💰 {asset.revenue_earned || 0}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search & Filter */}
                <div className="bg-gray-800 p-6 brutal-card mb-8">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 relative">
                            <input 
                                type="text" 
                                placeholder="Search assets..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full p-3 border-4 border-black font-bold text-black"
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"/>
                        </div>
                        <select 
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            className="w-full p-3 border-4 border-black font-bold bg-white text-black"
                        >
                            <option value="all">All Types</option>
                            <option value="image">Images</option>
                            <option value="sound">Sounds</option>
                            <option value="sprite">Sprites</option>
                            <option value="background">Backgrounds</option>
                        </select>
                    </div>
                    <button 
                        onClick={() => setShowUploadModal(true)}
                        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-black py-3 brutal-button flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5"/> UPLOAD NEW ASSET
                    </button>
                </div>

                {/* Assets Grid */}
                <div className="grid md:grid-cols-4 gap-6">
                    {filteredAssets.map(asset => (
                        <div key={asset.id} className="bg-gray-800 p-4 brutal-card">
                            <div className="bg-gray-700 h-32 mb-3 flex items-center justify-center border-2 border-black">
                                {asset.thumbnail_url ? (
                                    <img src={asset.thumbnail_url} alt={asset.name} className="max-h-full max-w-full object-contain"/>
                                ) : (
                                    <span className="text-4xl">📦</span>
                                )}
                            </div>
                            <h3 className="font-black text-white mb-1">{asset.name}</h3>
                            <p className="text-xs text-gray-400 mb-2 line-clamp-2">{asset.description}</p>
                            <div className="flex items-center justify-between mb-2">
                                <span className="bg-purple-600 text-white px-2 py-1 text-xs font-bold">
                                    {asset.type}
                                </span>
                                <span className="text-xs text-gray-400">
                                    ⬇ {asset.download_count || 0}
                                </span>
                            </div>
                            <button 
                                onClick={() => handlePurchase(asset)}
                                className={`w-full font-bold py-2 brutal-button flex items-center justify-center gap-2 ${
                                    asset.price === 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
                                } text-white`}
                            >
                                {asset.price === 0 ? (
                                    <><Download className="w-4 h-4"/> FREE</>
                                ) : (
                                    <><ShoppingCart className="w-4 h-4"/> {asset.price} <Wrench className="w-4 h-4"/></>
                                )}
                            </button>
                            <p className="text-xs text-gray-500 mt-2">By: {asset.creator_email?.split('@')[0]}</p>
                        </div>
                    ))}
                </div>

                {filteredAssets.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-xl font-bold text-gray-400">No assets found</p>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowUploadModal(false)}>
                    <div className="bg-gray-800 border-8 border-black p-6 brutal-card w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-black text-white mb-4">UPLOAD ASSET</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="font-bold text-white mb-2 block">Asset Name</label>
                                <input 
                                    type="text" 
                                    placeholder="My Cool Asset" 
                                    value={newAsset.name}
                                    onChange={e => setNewAsset({...newAsset, name: e.target.value})}
                                    className="w-full p-3 border-4 border-black font-bold text-black"
                                />
                            </div>
                            <div>
                                <label className="font-bold text-white mb-2 block">Description</label>
                                <textarea 
                                    placeholder="Describe your asset..." 
                                    value={newAsset.description}
                                    onChange={e => setNewAsset({...newAsset, description: e.target.value})}
                                    className="w-full p-3 border-4 border-black font-bold text-black h-24"
                                />
                            </div>
                            <div>
                                <label className="font-bold text-white mb-2 block">Type</label>
                                <select 
                                    value={newAsset.type}
                                    onChange={e => setNewAsset({...newAsset, type: e.target.value})}
                                    className="w-full p-3 border-4 border-black font-bold bg-white text-black"
                                >
                                    <option value="image">Image</option>
                                    <option value="sound">Sound</option>
                                    <option value="sprite">Sprite</option>
                                    <option value="background">Background</option>
                                </select>
                            </div>
                            <div>
                                <label className="font-bold text-white mb-2 block">Price (Scrap, 0 = Free)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={newAsset.price}
                                    onChange={e => setNewAsset({...newAsset, price: parseInt(e.target.value)})}
                                    className="w-full p-3 border-4 border-black font-bold text-black"
                                />
                            </div>
                            <div>
                                <label className="font-bold text-white mb-2 block">Upload File</label>
                                <input 
                                    type="file" 
                                    onChange={e => setFile(e.target.files[0])}
                                    className="w-full p-2 border-4 border-black font-bold bg-white text-black"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowUploadModal(false)} 
                                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-black py-3 brutal-button"
                                >
                                    CANCEL
                                </button>
                                <button 
                                    onClick={handleUpload} 
                                    disabled={uploading || !file || !newAsset.name}
                                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-black py-3 brutal-button flex items-center justify-center gap-2"
                                >
                                    {uploading ? <Loader2 className="animate-spin" /> : <Upload className="w-5 h-5"/>}
                                    UPLOAD
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}