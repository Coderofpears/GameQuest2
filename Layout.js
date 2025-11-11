import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Gamepad2, Trophy, Shield, PlusSquare, Wrench, Search, Users, User as UserIcon, Cog, LogIn, Code2 } from "lucide-react";
import { base44 } from '@/api/base44Client';
import NotificationSystem from "@/components/NotificationSystem";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
        try {
            const u = await base44.auth.me();
            setUser(u);
        } catch(e) {
            setUser(null)
        }
    };
    checkUser();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white">
      <style jsx>{`
        .brutal-shadow { box-shadow: 4px 4px 0 #000; }
        .brutal-button { border: 4px solid #000; transition: all 0.1s; }
        .brutal-button:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #000; }
        .brutal-button:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 #000; }
        .brutal-card { border: 8px solid #000; box-shadow: 8px 8px 0 #000; }
        .brutal-text-shadow { text-shadow: 3px 3px 0 #000; }
      `}</style>

      {/* Notification System */}
      <NotificationSystem />

      <header className="bg-cyan-400 border-b-4 border-black p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-black p-3 brutal-shadow">
              <Gamepad2 className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-black tracking-tight">GAMEQUEST</h1>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-2">
            <Link to={createPageUrl("Lobby")} className="px-4 py-3 font-bold text-black brutal-button bg-green-400 hover:bg-green-300">LOBBY</Link>
            <Link to={createPageUrl("JoinGame")} className="px-4 py-3 font-bold text-black brutal-button bg-purple-400 hover:bg-purple-300 flex items-center gap-2"><LogIn className="w-4 h-4"/>JOIN GAME</Link>
            <Link to={createPageUrl("Discover")} className="px-4 py-3 font-bold text-black brutal-button bg-blue-400 hover:bg-blue-300 flex items-center gap-2"><Search className="w-4 h-4"/>DISCOVER</Link>
            <Link to={createPageUrl("Groups")} className="px-4 py-3 font-bold text-black brutal-button bg-purple-400 hover:bg-purple-300 flex items-center gap-2"><Users className="w-4 h-4"/>GROUPS</Link>
            <Link to={createPageUrl("GameMaker")} className="px-4 py-3 font-bold text-black brutal-button bg-pink-400 hover:bg-pink-300 flex items-center gap-2"><Code2 className="w-4 h-4"/>GAMEMAKER</Link>
            <Link to={createPageUrl("CreateQuiz")} className="px-4 py-3 font-bold text-black brutal-button bg-yellow-400 hover:bg-yellow-300 flex items-center gap-2"><PlusSquare className="w-4 h-4"/>CREATE</Link>
            <Link to={createPageUrl("Leaderboard")} className="px-4 py-3 font-bold text-black brutal-button bg-orange-400 hover:bg-orange-300 flex items-center gap-2"><Trophy className="w-4 h-4"/>SCORES</Link>
            {user && (
              <>
                <div className="flex items-center gap-2 bg-black text-white px-3 py-2 brutal-shadow" title="Scrap">
                  <Wrench className="w-5 h-5 text-yellow-400" />
                  <span className="text-xl font-black">{user.scrap || 0}</span>
                </div>
                <div className="flex items-center gap-2 bg-black text-white px-3 py-2 brutal-shadow" title="Shields">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <span className="text-xl font-black">{user.shields || 0}</span>
                </div>
                <Link to={createPageUrl("Profile")} className="p-3 font-bold text-black brutal-button bg-pink-400 hover:bg-pink-300"><UserIcon className="w-5 h-5"/></Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="relative">{children}</main>
    </div>
  );
}