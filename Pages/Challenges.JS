import React, { useState, useEffect } from 'react';
import { Challenge } from '@/entities/Challenge';
import { User } from '@/entities/User';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Swords, Check, X, Shield, Clock, Trophy } from 'lucide-react';

export default function Challenges() {
  const [user, setUser] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        const incoming = await Challenge.filter({ challenged_email: currentUser.email, status: 'pending' });
        const outgoing = await Challenge.filter({ challenger_email: currentUser.email, status: 'pending' });
        const completed = await Challenge.filter({ $or: [{ challenged_email: currentUser.email }, { challenger_email: currentUser.email }], status: 'completed' }, '-updated_date');
        setChallenges({ incoming, outgoing, completed });
      } catch (error) {
        console.error("Failed to load challenges", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDecline = async (challengeId) => {
    await Challenge.update(challengeId, { status: 'declined' });
    // Refresh logic could be better, for now just filter out
    setChallenges(prev => ({
      ...prev,
      incoming: prev.incoming.filter(c => c.id !== challengeId)
    }));
  };

  if (loading) {
    return <div className="min-h-screen bg-purple-400 flex items-center justify-center">
      <div className="bg-black p-8 brutal-card text-purple-400 font-black text-2xl animate-pulse">LOADING CHALLENGES...</div>
    </div>;
  }
  
  if (!user) {
    return <div className="min-h-screen bg-purple-400 flex items-center justify-center">
      <div className="bg-black p-8 brutal-card text-purple-400 font-black text-2xl">LOGIN TO SEE CHALLENGES</div>
    </div>;
  }

  const ChallengeCard = ({ challenge, type }) => {
    const isWinner = challenge.winner_email === user.email;
    const isLoser = challenge.winner_email && challenge.winner_email !== user.email;
    
    let bgColor = 'bg-white';
    if (type === 'completed') {
      if (isWinner) bgColor = 'bg-green-400';
      if (isLoser) bgColor = 'bg-red-400';
    }
    if (type === 'incoming') bgColor = 'bg-yellow-400';
    if (type === 'outgoing') bgColor = 'bg-cyan-400';

    return (
      <div className={`${bgColor} p-6 brutal-card`}>
        <p className="font-black text-black text-xl mb-2">{challenge.quiz_title}</p>
        {type === 'incoming' && (
          <>
            <p className="font-bold text-black mb-4">From: {challenge.challenger_name}</p>
            <div className="flex gap-2">
              <Link to={`${createPageUrl("Quiz")}?id=${challenge.quiz_id}&challengeId=${challenge.id}`} className="flex-1 text-center bg-green-500 text-white font-black py-3 brutal-button flex items-center justify-center gap-2"><Check /> ACCEPT</Link>
              <button onClick={() => handleDecline(challenge.id)} className="flex-1 bg-red-500 text-white font-black py-3 brutal-button flex items-center justify-center gap-2"><X /> DECLINE</button>
            </div>
          </>
        )}
        {type === 'outgoing' && (
          <p className="font-bold text-black">To: {challenge.challenged_email}</p>
        )}
        {type === 'completed' && (
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-black">Challenger: {challenge.challenger_name} ({challenge.challenger_score}%)</p>
              <p className="font-bold text-black">You: {challenge.challenged_score}%</p>
            </div>
            {isWinner && <Trophy className="w-10 h-10 text-yellow-500" />}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 transform -rotate-1">
          <div className="bg-black text-white p-8 brutal-card inline-block">
            <h1 className="text-4xl md:text-5xl font-black mb-2">CHALLENGE ARENA</h1>
            <p className="text-lg font-bold">FACE YOUR RIVALS</p>
          </div>
        </div>

        <div className="space-y-12">
          <div>
            <h2 className="text-3xl font-black text-black mb-6 text-center">INCOMING BATTLES <Clock className="inline w-8 h-8"/></h2>
            <div className="grid gap-6">
              {challenges.incoming?.length > 0 ? challenges.incoming.map(c => <ChallengeCard key={c.id} challenge={c} type="incoming" />) : <p className="text-center font-bold text-black">No one has challenged you... yet.</p>}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-black mb-6 text-center">OUTGOING DUELS <Shield className="inline w-8 h-8"/></h2>
            <div className="grid gap-6">
              {challenges.outgoing?.length > 0 ? challenges.outgoing.map(c => <ChallengeCard key={c.id} challenge={c} type="outgoing" />) : <p className="text-center font-bold text-black">You haven't challenged anyone.</p>}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-black mb-6 text-center">BATTLE HISTORY <Swords className="inline w-8 h-8"/></h2>
            <div className="grid gap-6">
              {challenges.completed?.length > 0 ? challenges.completed.map(c => <ChallengeCard key={c.id} challenge={c} type="completed" />) : <p className="text-center font-bold text-black">No completed battles.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}