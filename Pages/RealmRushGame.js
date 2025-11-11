import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { GameRoom, Quiz, RealmState, User } from '@/entities/all';
import { createPageUrl } from '@/utils';
import { Loader2, ArrowLeft, Shield, Swords, DollarSign, TreePine, Sparkles, XCircle, CheckCircle } from 'lucide-react';

const PlayerHUD = ({ realm }) => (
    <div className="bg-gray-900 p-4 border-4 border-gray-700 brutal-shadow text-white grid grid-cols-3 gap-2 text-center">
        <div className="flex items-center justify-center gap-2"><DollarSign className="text-yellow-400"/> <span className="font-black text-lg">{realm?.gold || 0}</span></div>
        <div className="flex items-center justify-center gap-2"><TreePine className="text-yellow-600"/> <span className="font-black text-lg">{realm?.wood || 0}</span></div>
        <div className="flex items-center justify-center gap-2"><Sparkles className="text-purple-400"/> <span className="font-black text-lg">{realm?.mana || 0}</span></div>
        <div className="flex items-center justify-center gap-2"><Swords className="text-red-500"/> <span className="font-black text-lg">{realm?.army || 0}</span></div>
        <div className="flex items-center justify-center gap-2"><Shield className="text-blue-500"/> <span className="font-black text-lg">{realm?.defense || 0}</span></div>
    </div>
);

const ActionsPanel = ({ realm, onAction }) => {
    const actions = [
        { name: 'Train Army', cost: { wood: 10, gold: 5 }, action: 'train_army' },
        { name: 'Build Defenses', cost: { wood: 20 }, action: 'build_defense' },
        { name: 'Enchant Army', cost: { mana: 10 }, action: 'enchant_army' },
    ];

    return (
        <div className="bg-gray-800 p-4 brutal-card">
            <h3 className="font-black text-white text-xl text-center mb-4">BUILD</h3>
            <div className="grid gap-2">
                {actions.map(a => (
                    <button key={a.action} onClick={() => onAction(a)} disabled={realm.gold < (a.cost.gold || 0) || realm.wood < (a.cost.wood || 0) || realm.mana < (a.cost.mana || 0)} className="text-left font-bold text-white bg-gray-700 p-3 brutal-button disabled:opacity-50">
                        {a.name} <span className="text-xs text-gray-400">({Object.entries(a.cost).map(([k,v]) => `${v} ${k}`).join(', ')})</span>
                    </button>
                ))}
            </div>
        </div>
    )
};

const RaidPanel = ({ opponents, onRaid }) => (
    <div className="bg-gray-800 p-4 brutal-card">
        <h3 className="font-black text-red-500 text-xl text-center mb-4">RAID</h3>
        <div className="space-y-2">
            {opponents.map(o => (
                <div key={o.user_email} className="flex justify-between items-center p-2 bg-gray-900 border-2 border-gray-700">
                    <span className="font-bold text-white">{o.user_name}</span>
                    <button onClick={() => onRaid(o)} className="bg-red-600 text-white font-bold px-4 py-1 brutal-button text-sm">RAID</button>
                </div>
            ))}
        </div>
    </div>
);

export default function RealmRushGame() {
    const navigate = useNavigate();
    const location = useLocation();
    const gameRoomId = new URLSearchParams(location.search).get('id');

    const [user, setUser] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [gameRoom, setGameRoom] = useState(null);
    const [realmStates, setRealmStates] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [gameState, setGameState] = useState('loading'); // loading, playing, raiding, finished
    const [raidOpponent, setRaidOpponent] = useState(null);
    const [raidResult, setRaidResult] = useState(null);

    const myRealm = realmStates.find(r => r.user_email === user?.email);
    const opponents = realmStates.filter(r => r.user_email !== user?.email && !r.is_eliminated);

    const loadGameData = useCallback(async () => {
        try {
            const u = await User.me();
            setUser(u);
            const rooms = await GameRoom.filter({ id: gameRoomId });
            if (!rooms.length) { navigate(createPageUrl('Lobby')); return; }
            const room = rooms[0];
            setGameRoom(room);

            const quizData = await Quiz.filter({id: room.quiz_id});
            if (!quizData.length) { navigate(createPageUrl('Lobby')); return; }
            setQuiz(quizData[0]);

            const states = await RealmState.filter({ game_room_id: gameRoomId });
            setRealmStates(states);

            if (room.status === 'finished') setGameState('finished');
            else setGameState('playing');
        } catch (e) {
            console.error(e);
            navigate(createPageUrl('Lobby'));
        }
    }, [gameRoomId, navigate]);

    useEffect(() => {
        loadGameData();
        const interval = setInterval(loadGameData, 5000); // Poll for updates
        return () => clearInterval(interval);
    }, [loadGameData]);

    const handleAction = async (action) => {
        let newRealm = {...myRealm};
        newRealm.gold -= action.cost.gold || 0;
        newRealm.wood -= action.cost.wood || 0;
        newRealm.mana -= action.cost.mana || 0;

        if (action.action === 'train_army') newRealm.army += 5;
        if (action.action === 'build_defense') newRealm.defense += 5;
        if (action.action === 'enchant_army') newRealm.army += 2; // Enchanting is weaker but adds a little

        await RealmState.update(myRealm.id, newRealm);
        loadGameData();
    };

    const handleRaid = (opponent) => {
        setRaidOpponent(opponent);
        setGameState('raiding');
    };

    const handleAnswer = async (isCorrect, isRaid = false) => {
        if (isRaid) {
            // Raid battle logic
            const attackPower = myRealm.army;
            const defensePower = raidOpponent.defense;
            const raidSuccess = isCorrect && (attackPower > defensePower);
            
            if (raidSuccess) {
                const goldStolen = Math.min(raidOpponent.gold, 50);
                await RealmState.update(myRealm.id, { gold: myRealm.gold + goldStolen });
                await RealmState.update(raidOpponent.id, { gold: raidOpponent.gold - goldStolen });
                setRaidResult({ success: true, amount: goldStolen });
            } else {
                setRaidResult({ success: false });
            }
            
            setTimeout(() => {
                setRaidOpponent(null);
                setRaidResult(null);
                setGameState('playing');
                setCurrentQuestionIndex(prev => prev + 1);
            }, 3000);

        } else {
            // Normal question logic
            if (isCorrect) {
                await RealmState.update(myRealm.id, {
                    gold: myRealm.gold + 10,
                    wood: myRealm.wood + 10,
                    mana: myRealm.mana + 2
                });
            }
            setCurrentQuestionIndex(prev => prev + 1);
        }
        
        if (quiz && currentQuestionIndex >= quiz.questions.length - 1) { // Added quiz check
            await GameRoom.update(gameRoomId, {status: "finished"});
            setGameState('finished');
        }
    };

    if (gameState === 'loading' || !myRealm || !quiz) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-white" /></div>;

    if (gameState === 'finished') {
        const winner = [...realmStates].sort((a,b) => b.gold - a.gold)[0];
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-white">
                <h1 className="text-5xl font-black text-yellow-400 mb-4">WAR IS OVER</h1>
                <h2 className="text-3xl font-bold mb-8">Winner: {winner.user_name}</h2>
                <Link to={createPageUrl('Lobby')} className="mt-4 inline-block font-bold text-black bg-white p-4 border-4 border-black brutal-button flex items-center gap-2"><ArrowLeft /> BACK TO LOBBY</Link>
            </div>
        );
    }
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isRaidBattle = gameState === 'raiding';

    if (!currentQuestion) {
        // This is a safeguard for the end-of-quiz race condition
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-white" /></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-900 to-black p-4 md:p-8 text-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Left Panel */}
                    <div className="lg:col-span-1 space-y-8">
                        <PlayerHUD realm={myRealm} />
                        <ActionsPanel realm={myRealm} onAction={handleAction} />
                    </div>

                    {/* Center Panel - Game */}
                    <div className="lg:col-span-2">
                        { isRaidBattle ? (
                            <div className="bg-red-900/50 p-8 brutal-card text-center">
                                <h2 className="text-3xl font-black text-red-400">RAID BATTLE!</h2>
                                <p className="mb-4 font-bold">vs {raidOpponent.user_name}</p>
                                {raidResult ? (
                                    <div>
                                        {raidResult.success ? <p className="text-2xl font-bold text-green-400">SUCCESS! Stole {raidResult.amount} gold.</p> : <p className="text-2xl font-bold text-red-400">FAILED!</p>}
                                    </div>
                                ) : (
                                    <>
                                        <p className="font-bold text-xl mb-4">{currentQuestion.question}</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {currentQuestion.options.map((opt, i) => (
                                                <button key={i} onClick={() => handleAnswer(i === currentQuestion.correct_answer, true)} className="bg-gray-800 p-4 brutal-button font-bold">{opt}</button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gray-800 p-8 brutal-card text-center">
                                <p className="text-gray-400 mb-2">Question {currentQuestionIndex + 1}</p>
                                <p className="font-bold text-xl mb-4">{currentQuestion.question}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {currentQuestion.options.map((opt, i) => (
                                        <button key={i} onClick={() => handleAnswer(i === currentQuestion.correct_answer)} className="bg-gray-700 p-4 brutal-button font-bold">{opt}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel */}
                    <div className="lg:col-span-1">
                        <RaidPanel opponents={opponents} onRaid={handleRaid} />
                    </div>
                </div>
            </div>
        </div>
    )
}