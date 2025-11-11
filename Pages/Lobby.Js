
import React, { useState, useEffect, useCallback } from "react";
import { Quiz } from '@/entities/Quiz';
import { User } from '@/entities/User';
import { DailyQuiz } from '@/entities/DailyQuiz';
import { GameSession } from '@/entities/GameSession';
import QuizCard from "../components/QuizCard";
import { Trophy, Zap, Target, Shield, Swords, Bell, Gift, Star, TrendingUp, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Challenge } from '@/entities/Challenge';
import { GameRoom } from '@/entities/GameRoom';
import { useNavigate } from "react-router-dom";
import { differenceInHours, formatDistanceToNow } from 'date-fns';

export default function Lobby() {
  const navigate = useNavigate();
  const [featuredQuizzes, setFeaturedQuizzes] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingChallenges, setPendingChallenges] = useState(0);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [canClaimShield, setCanClaimShield] = useState(false);
  const [dailyQuiz, setDailyQuiz] = useState(null);
  const [hasCompletedDaily, setHasCompletedDaily] = useState(false);

  const checkShieldStatus = useCallback((u) => {
    if (u && u.last_shield_claim) {
      const hoursSinceClaim = differenceInHours(new Date(), new Date(u.last_shield_claim));
      if (hoursSinceClaim >= 24) {
        setCanClaimShield(true);
      } else {
        setCanClaimShield(false);
      }
    } else if (u) {
      setCanClaimShield(true);
    } else {
      setCanClaimShield(false);
    }
  }, []);

  const grantShield = async () => {
    if (!user || !canClaimShield) return;
    const currentShields = user.shields || 0;
    const updatedUser = { 
        shields: currentShields + 1,
        last_shield_claim: new Date().toISOString()
    };
    await User.updateMyUserData(updatedUser);
    setUser(prev => ({...prev, ...updatedUser}));
    setCanClaimShield(false);
  };

  const loadDailyQuiz = useCallback(async (userData) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dailies = await DailyQuiz.filter({ date: today });
      
      if (dailies.length > 0) {
        const daily = dailies[0];
        setDailyQuiz(daily);
        if (userData && daily.completed_by && daily.completed_by.includes(userData.email)) {
          setHasCompletedDaily(true);
        }
      } else {
        // Create a new daily quiz
        const allQuizzes = await Quiz.list();
        if (allQuizzes.length > 0) {
          const randomQuiz = allQuizzes[Math.floor(Math.random() * allQuizzes.length)];
          const shieldReward = Math.floor(Math.random() * 3) + 1;
          const scrapReward = Math.floor(Math.random() * 200) + 50;
          
          const newDaily = await DailyQuiz.create({
            quiz_id: randomQuiz.id,
            quiz_title: randomQuiz.title,
            date: today,
            shield_reward: shieldReward,
            scrap_reward: scrapReward,
            completed_by: []
          });
          setDailyQuiz(newDaily);
        }
      }
    } catch (e) {
      console.error("Error loading daily quiz:", e);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [quizzesData, userData, recentSessions] = await Promise.all([
          Quiz.list('-created_date', 6),
          User.me().catch(() => null),
          GameSession.list('-created_date', 10)
        ]);
        
        setFeaturedQuizzes(quizzesData);
        setUser(userData);
        setRecentActivity(recentSessions);
        
        if (userData) {
          checkShieldStatus(userData);
          const challenges = await Challenge.filter({ challenged_email: userData.email, status: 'pending' });
          setPendingChallenges(challenges.length);
          await loadDailyQuiz(userData);
        } else {
          await loadDailyQuiz(null);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
      setLoading(false);
    };
    loadData();
  }, [checkShieldStatus, loadDailyQuiz]);

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setJoinError('');
    if (!joinCode || !user) {
      setJoinError('Enter a code and be logged in.');
      return;
    }
    
    try {
      const rooms = await GameRoom.filter({ game_code: joinCode.toUpperCase(), status: 'waiting' });
      if (rooms.length > 0) {
        const room = rooms[0];
        const playerExists = room.players.find(p => p.email === user.email);
        
        if (!playerExists) {
          const newPlayer = { email: user.email, name: user.full_name, score: 0, is_finished: false };
          const updatedPlayers = [...room.players, newPlayer];
          await GameRoom.update(room.id, { players: updatedPlayers });
        }
        
        if (room.mode === 'realm_rush') {
          navigate(`${createPageUrl('RealmRushLobby')}?id=${room.id}`);
        } else if (room.mode === 'mind_maze') {
          navigate(`${createPageUrl('MindMazeLobby')}?id=${room.id}`);
        } else if (room.mode === 'aquaria') { // New condition for 'aquaria' mode
          navigate(`${createPageUrl('AquariaLobby')}?id=${room.id}`);
        } else {
          navigate(`${createPageUrl('GameRoomLobby')}?id=${room.id}`);
        }

      } else {
        setJoinError('Room not found or has already started.');
      }
    } catch (err) {
      setJoinError('Error joining room.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyan-400 flex items-center justify-center">
        <div className="bg-black p-8 brutal-card">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-pink-400 to-yellow-400 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 transform -rotate-1">
          <div className="bg-black text-white p-8 brutal-card inline-block">
            <h1 className="text-4xl md:text-6xl font-black mb-4">
              WELCOME TO THE
              <br />
              <span className="text-cyan-400">QUIZ ARENA</span>
            </h1>
            <p className="text-xl font-bold">
              {user ? `READY FOR BATTLE, ${user.full_name?.toUpperCase()}?` : "LOG IN TO DESTROY YOUR ENEMIES"}
            </p>
          </div>
        </div>

        {/* Quiz of the Day */}
        {dailyQuiz && (
          <div className="mb-12">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-1 brutal-card">
              <div className="bg-black text-white p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-black flex items-center gap-2">
                    <Star className="text-yellow-400" /> QUIZ OF THE DAY <Star className="text-yellow-400" />
                  </h2>
                  {hasCompletedDaily && <span className="bg-green-500 px-4 py-2 font-black brutal-shadow">✓ COMPLETED</span>}
                </div>
                <h3 className="text-2xl font-bold mb-2">{dailyQuiz.quiz_title}</h3>
                <div className="flex gap-4 mb-4 flex-wrap">
                  <div className="bg-cyan-400 text-black px-4 py-2 font-black brutal-shadow flex items-center gap-2">
                    <Shield /> +{dailyQuiz.shield_reward} SHIELDS
                  </div>
                  <div className="bg-yellow-400 text-black px-4 py-2 font-black brutal-shadow flex items-center gap-2">
                    <Gift /> +{dailyQuiz.scrap_reward} SCRAP
                  </div>
                </div>
                {user && !hasCompletedDaily && (
                  <Link to={`${createPageUrl('Quiz')}?id=${dailyQuiz.quiz_id}&daily=true`} className="inline-block bg-green-500 text-white px-8 py-4 font-black text-xl brutal-button">
                    CLAIM REWARDS
                  </Link>
                )}
                {!user && <p className="font-bold text-yellow-400">LOG IN TO PLAY</p>}
              </div>
            </div>
          </div>
        )}
        
        {user && (
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <button 
                onClick={grantShield} 
                disabled={!canClaimShield} 
                className="bg-blue-500 text-white font-black py-4 px-6 brutal-button flex items-center gap-2 text-lg disabled:bg-gray-500 disabled:text-gray-300"
            >
                <Shield/> {canClaimShield ? 'CLAIM DAILY SHIELD' : 'SHIELD CLAIMED'}
            </button>
            {pendingChallenges > 0 && (
              <Link to={createPageUrl('Challenges')} className="bg-red-500 text-white font-black py-4 px-6 brutal-button flex items-center gap-2 text-lg animate-pulse">
                <Bell /> {pendingChallenges} PENDING CHALLENGE{pendingChallenges > 1 ? 'S' : ''}!
              </Link>
            )}
          </div>
        )}

        {/* Join Game Room Section */}
        <div className="my-12 max-w-lg mx-auto">
          <form onSubmit={handleJoinRoom} className="bg-black p-6 brutal-card transform rotate-1">
            <h3 className="text-center font-black text-2xl text-white mb-4">JOIN A GAME ROOM</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="ENTER CODE" 
                value={joinCode} 
                onChange={e => setJoinCode(e.target.value)}
                maxLength="4"
                className="flex-grow p-3 border-4 border-white text-lg font-black text-center tracking-widest uppercase"
              />
              <button type="submit" className="bg-green-500 text-white font-black px-6 brutal-button">JOIN</button>
            </div>
            {joinError && <p className="text-red-500 font-bold mt-2 text-center">{joinError}</p>}
          </form>
        </div>

        {/* What Friends Are Doing */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-black mb-6 text-center flex items-center justify-center gap-2">
            <TrendingUp /> WHAT'S HAPPENING
          </h2>
          <div className="bg-white p-6 brutal-card max-h-96 overflow-y-auto">
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((session) => (
                  <div key={session.id} className="p-4 bg-gray-100 border-4 border-black flex items-center justify-between">
                    <div>
                      <p className="font-black text-lg">{session.created_by?.split('@')[0]?.toUpperCase()}</p>
                      <p className="font-bold text-sm text-gray-600">{session.quiz_title}</p>
                      <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(session.created_date))} ago</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-black ${session.score >= 80 ? 'text-green-600' : session.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {session.score}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center font-bold text-gray-500">No recent activity yet. Be the first to play!</p>
            )}
          </div>
        </div>

        {/* Featured Quizzes */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-black text-black">FEATURED BATTLES</h2>
            <Link to={createPageUrl('Discover')} className="bg-white px-6 py-3 font-black brutal-button flex items-center gap-2">
              <Search className="w-5 h-5" /> DISCOVER MORE
            </Link>
          </div>
        </div>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>

        {featuredQuizzes.length === 0 && (
          <div className="text-center mt-12">
            <div className="bg-black text-white p-8 brutal-card inline-block transform rotate-1">
              <p className="text-2xl font-black">NO QUIZZES FOUND!</p>
              <p className="font-bold mt-2">Check back later for more battles.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
