import React, { useState, useEffect } from "react";
import { GameSession } from "@/entities/GameSession";
import { Trophy, Medal, Award, Zap } from "lucide-react";
import { format } from "date-fns";

export default function Leaderboard() {
  const [topScores, setTopScores] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const [topData, recentData] = await Promise.all([
        GameSession.list("-score", 10),
        GameSession.list("-created_date", 20)
      ]);
      
      setTopScores(topData);
      setRecentGames(recentData);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-400 flex items-center justify-center p-4">
        <div className="bg-black text-green-400 p-8 brutal-card">
          <div className="animate-pulse">
            <p className="text-2xl font-black text-center">LOADING HALL OF FAME...</p>
          </div>
        </div>
      </div>
    );
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 0: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1: return <Medal className="w-6 h-6 text-gray-400" />;
      case 2: return <Award className="w-6 h-6 text-orange-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center font-black text-black">#{rank + 1}</span>;
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 0: return "bg-yellow-400";
      case 1: return "bg-gray-300";
      case 2: return "bg-orange-400";
      default: return "bg-white";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 transform -rotate-1">
          <div className="bg-black text-white p-8 brutal-card inline-block">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Trophy className="w-12 h-12 text-yellow-400" />
              <h1 className="text-4xl md:text-6xl font-black">HALL OF FAME</h1>
              <Trophy className="w-12 h-12 text-yellow-400" />
            </div>
            <p className="text-xl font-bold">THE ULTIMATE QUIZ WARRIORS</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Scores */}
          <div>
            <h2 className="text-3xl font-black text-black mb-6 text-center">TOP SCORES</h2>
            <div className="space-y-4">
              {topScores.slice(0, 10).map((session, index) => (
                <div
                  key={session.id}
                  className={`${getRankBg(index)} p-6 brutal-card transform ${
                    index % 2 === 0 ? 'rotate-1' : '-rotate-1'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getRankIcon(index)}
                      <div>
                        <p className="font-black text-black text-lg">
                          {session.created_by?.split('@')[0]?.toUpperCase() || 'ANONYMOUS'}
                        </p>
                        <p className="font-bold text-black/80 text-sm">
                          {session.quiz_title}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-black text-white px-4 py-2 brutal-shadow">
                        <p className="text-2xl font-black">{session.score}%</p>
                      </div>
                      <p className="text-xs font-bold text-black/80 mt-1">
                        {session.correct_answers}/{session.total_questions}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Games */}
          <div>
            <h2 className="text-3xl font-black text-black mb-6 text-center">RECENT BATTLES</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {recentGames.map((session, index) => (
                <div
                  key={session.id}
                  className={`p-4 brutal-card ${
                    session.score >= 80 
                      ? 'bg-green-400' 
                      : session.score >= 60 
                      ? 'bg-yellow-400' 
                      : 'bg-red-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-black">
                        {session.created_by?.split('@')[0]?.toUpperCase() || 'ANONYMOUS'}
                      </p>
                      <p className="font-bold text-black/80 text-sm">
                        {session.quiz_title}
                      </p>
                      <p className="font-bold text-black/60 text-xs">
                        {format(new Date(session.created_date), 'MMM d, HH:mm')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {session.score >= 90 && <Zap className="w-4 h-4 text-black" />}
                        <span className="text-xl font-black text-black">{session.score}%</span>
                      </div>
                      <p className="text-xs font-bold text-black/80">
                        {session.correct_answers}/{session.total_questions}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {(topScores.length === 0 && recentGames.length === 0) && (
          <div className="text-center mt-12">
            <div className="bg-black text-white p-8 brutal-card inline-block transform rotate-1">
              <p className="text-2xl font-black">NO BATTLES YET!</p>
              <p className="font-bold mt-2">Be the first to conquer a quiz.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}