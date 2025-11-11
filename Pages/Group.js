import React, { useState, useEffect } from 'react';
import { Group } from '@/entities/Group';
import { User } from '@/entities/User';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, Users, Plus } from 'lucide-react';

export default function Groups() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [myGroups, setMyGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const u = await User.me();
                setUser(u);
                const groups = await Group.filter({ 'members.email': u.email });
                setMyGroups(groups);
            } catch (e) {
                navigate(createPageUrl('Lobby'));
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [navigate]);

    const handleCreateGroup = async () => {
        if (!newGroupName || !user) return;
        setIsCreating(true);
        try {
            const newGroup = await Group.create({
                name: newGroupName,
                owner_email: user.email,
                members: [{ email: user.email, name: user.full_name, role: 'owner' }],
            });
            navigate(`${createPageUrl('GroupDetail')}?id=${newGroup.id}`);
        } catch(e) {
            console.error(e);
        } finally {
            setIsCreating(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-500 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 transform -rotate-1">
                    <div className="bg-black text-white p-8 brutal-card inline-block">
                        <h1 className="text-4xl md:text-5xl font-black">YOUR CREW</h1>
                    </div>
                </div>

                <div className="bg-white p-6 brutal-card mb-8">
                    <h2 className="text-2xl font-black text-black mb-4">Create a New Group</h2>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Group Name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="flex-grow p-3 border-4 border-black font-bold"/>
                        <button onClick={handleCreateGroup} disabled={isCreating} className="bg-green-500 text-white font-black px-6 brutal-button flex items-center gap-2">
                            {isCreating ? <Loader2 className="animate-spin"/> : <Plus />} CREATE
                        </button>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <h2 className="text-3xl font-black text-black text-center mb-4">My Groups</h2>
                    {loading ? <Loader2 className="w-12 h-12 animate-spin mx-auto"/> : (
                        myGroups.map(group => (
                            <Link key={group.id} to={`${createPageUrl('GroupDetail')}?id=${group.id}`} className="block bg-yellow-400 p-6 brutal-card hover:translate-x-1 hover:translate-y-1 transition-transform">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-black text-black">{group.name}</h3>
                                    <div className="flex items-center gap-2 font-bold"><Users/> {group.members.length}</div>
                                </div>
                            </Link>
                        ))
                    )}
                    {!loading && myGroups.length === 0 && <p className="text-center font-bold text-black bg-white p-4 brutal-card">You're not in any groups yet. Create one!</p>}
                </div>
            </div>
        </div>
    );
}