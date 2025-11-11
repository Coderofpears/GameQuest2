import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Group, GroupMessage, User } from '@/entities/all';
import { createPageUrl } from '@/utils';
import { Loader2, Users, Send, UserPlus } from 'lucide-react';

const MemberManager = ({ group, onMemberAdded }) => {
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);

    const handleInvite = async () => {
        if (!inviteEmail) return;
        setIsInviting(true);
        try {
            const users = await User.filter({ email: inviteEmail });
            if (users.length > 0) {
                const user = users[0];
                const newMember = { email: user.email, name: user.full_name, role: 'member' };
                // Avoid duplicates
                if (!group.members.find(m => m.email === user.email)) {
                    await Group.update(group.id, { members: [...group.members, newMember] });
                    onMemberAdded();
                }
            }
        } catch (e) { console.error(e) }
        setIsInviting(false);
        setInviteEmail('');
    };

    return (
        <div className="bg-gray-100 p-4 border-4 border-black mt-4">
            <h4 className="font-bold text-black mb-2">Manage Members</h4>
            <div className="flex gap-2">
                <input type="email" placeholder="User email to add" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="flex-1 p-2 border-2 border-black"/>
                <button onClick={handleInvite} disabled={isInviting} className="bg-blue-500 text-white font-bold p-2 brutal-button text-sm"><UserPlus/></button>
            </div>
        </div>
    );
};


const ChatWindow = ({ groupId, user }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    const fetchMessages = useCallback(async () => {
        const msgs = await GroupMessage.filter({ group_id: groupId }, '-created_date', 50);
        setMessages(msgs.reverse());
    }, [groupId]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        await GroupMessage.create({
            group_id: groupId,
            sender_email: user.email,
            sender_name: user.full_name,
            content: newMessage,
        });
        setNewMessage('');
        fetchMessages();
    };

    return (
        <div className="h-[500px] flex flex-col bg-white border-4 border-black brutal-shadow">
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender_email === user.email ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs font-bold text-gray-500">{msg.sender_name}</span>
                        <div className={`p-3 rounded-lg max-w-xs ${msg.sender_email === user.email ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSend} className="p-2 border-t-4 border-black flex gap-2">
                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} className="flex-1 p-3 border-2 border-black"/>
                <button type="submit" className="bg-green-500 text-white font-black px-6 brutal-button"><Send/></button>
            </form>
        </div>
    );
};


export default function GroupDetail() {
    const location = useLocation();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [user, setUser] = useState(null);
    const groupId = new URLSearchParams(location.search).get('id');

    const fetchGroup = useCallback(async () => {
        try {
            const groups = await Group.filter({ id: groupId });
            if (groups.length > 0) setGroup(groups[0]);
            else navigate(createPageUrl('Groups'));
        } catch (e) { console.error(e) }
    }, [groupId, navigate]);

    useEffect(() => {
        User.me().then(setUser).catch(() => navigate(createPageUrl('Lobby')));
        fetchGroup();
    }, [navigate, fetchGroup]);
    
    if (!group || !user) return <div className="min-h-screen bg-purple-500 flex items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-black" /></div>;
    
    const isOwner = user.email === group.owner_email;

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-500 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8 transform -rotate-1">
                    <div className="bg-black text-white p-8 brutal-card inline-block">
                        <h1 className="text-4xl md:text-5xl font-black">{group.name}</h1>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <ChatWindow groupId={groupId} user={user} />
                    </div>
                    <div className="space-y-4">
                        <div className="bg-white p-6 brutal-card">
                            <h3 className="text-2xl font-black text-black flex items-center gap-2"><Users/> Members ({group.members.length})</h3>
                            <ul className="mt-4 space-y-2">
                                {group.members.map(m => <li key={m.email} className="font-bold text-lg">{m.name} {m.role === 'owner' && '👑'}</li>)}
                            </ul>
                            {isOwner && <MemberManager group={group} onMemberAdded={fetchGroup} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}