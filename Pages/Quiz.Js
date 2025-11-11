import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Quiz } from "@/entities/Quiz";
import { GameSession } from "@/entities/GameSession";
import { User } from "@/entities/User";
import { Challenge } from "@/entities/Challenge";
import { GameRoom } from "@/entities/GameRoom";
import { DailyQuiz } from "@/entities/DailyQuiz";
import { createPageUrl } from "@/utils";
import { Clock, Zap, CheckCircle, XCircle, Shield, Heart, Send, Loader2 } from "lucide-react";

import SabotagePanel from '../components/quiz/SabotagePanel';
import { Wrench } from 'lucide-react';

export default function QuizPage() {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [gameState, setGameState] = useState("loading");
  const [user, setUser] = useState(null);
  const [startTime, setStartTime] = useState(null);
  
  // Gamemode states
  const [gamemode, setGamemode] = useState('classic');
  const [strikes, setStrikes] = useState(0);
  const [challengeId, setChallengeId] = useState(null);
  const [latestSession, setLatestSession] = useState(null);
  const [challengeEmail, setChallengeEmail] = useState("");
  const [isChallenging, setIsChallenging] = useState(false);
  const [isDaily, setIsDaily] = useState(false);

  // Sabotage/Gamble states
  const [gameRoom, setGameRoom] = useState(null);
  const [activeSabotage, setActiveSabotage] = useState(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [pointMultiplier, setPointMultiplier] = useState(1);
  
  const gameRoomId = new URLSearchParams(window.location.search).get("gameRoomId");
  
  const loadUser = useCallback(async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      navigate(createPageUrl("Lobby"));
    }
  }, [navigate]);

  const fetchGameRoom = useCallback(async () => {
    if (!gameRoomId) return;
    try {
      const rooms = await GameRoom.filter({ id: gameRoomId });
      if (rooms.length > 0) setGameRoom(rooms[0]);
    } catch (e) { console.error(e) }
  }, [gameRoomId]);

  const loadQuiz = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get("id");
    setChallengeId(urlParams.get("challengeId"));
    setGamemode(urlParams.get("gamemode") || 'classic');
    setIsDaily(urlParams.get("daily") === 'true');
    
    if (!quizId) { navigate(createPageUrl("Lobby")); return; }

    try {
      const quizData = await Quiz.filter({ id: quizId });
      if (quizData.length === 0) { navigate(createPageUrl("Lobby")); return; }
      
      const quizObj = quizData[0];
      setQuiz(quizObj);
      setTimeLeft(quizObj.time_limit || 30);
      setStartTime(Date.now());
      setGameState("playing");
    } catch (error) {
      console.error("Error loading quiz:", error);
      navigate(createPageUrl("Lobby"));
    }
  }, [navigate, setGamemode]);

  const handleSabotageUsed = (newScrap) => {
    setUser(prev => ({...prev, scrap: newScrap}));
  };

  const applyGambleEffect = useCallback(() => {
    const effects = ['freeze', 'double_points', 'shuffle', 'blur', 'nothing', 'nothing'];
    const effect = effects[Math.floor(Math.random() * effects.length)];

    setIsFrozen(false);
    setPointMultiplier(1);
    setActiveSabotage(null);

    if (effect === 'freeze') {
        setIsFrozen(true);
        setTimeout(() => setIsFrozen(false), 5000);
    } else if (effect === 'double_points') {
        setPointMultiplier(2);
    } else if (effect === 'shuffle' || effect === 'blur') {
        setActiveSabotage(effect);
        setTimeout(() => setActiveSabotage(null), 5000);
    }
  }, []);
  
  const saveGameSession = useCallback(async (finalAnswers) => {
    const correctAnswers = finalAnswers.filter(a => a.is_correct).length;
    let score = finalAnswers.length > 0 ? Math.round((correctAnswers / finalAnswers.length) * 100) : 0;
    
    score = score * pointMultiplier;
    
    if (gamemode === 'strikeout' && strikes >= 3) score = 0;
    
    const totalTime = Math.round((Date.now() - startTime) / 1000);

    const sessionData = {
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      score: score,
      total_questions: quiz.questions.length,
      correct_answers: correctAnswers,
      time_taken: totalTime,
      answers: finalAnswers
    };
    const newSession = await GameSession.create(sessionData);
    setLatestSession(newSession);

    const scrapEarned = Math.round(score / 10);
    await User.updateMyUserData({ scrap: (user.scrap || 0) + scrapEarned });

    // Handle daily quiz rewards
    if (isDaily) {
      const today = new Date().toISOString().split('T')[0];
      const dailies = await DailyQuiz.filter({ date: today });
      if (dailies.length > 0) {
        const daily = dailies[0];
        if (!daily.completed_by.includes(user.email)) {
          await DailyQuiz.update(daily.id, {
            completed_by: [...daily.completed_by, user.email]
          });
          await User.updateMyUserData({
            shields: (user.shields || 0) + daily.shield_reward,
            scrap: (user.scrap || 0) + daily.scrap_reward + scrapEarned
          });
        }
      }
    }

    if (challengeId) {
      const challenge = await Challenge.filter({id: challengeId});
      const challengerScore = challenge[0]?.challenger_score || 0;
      const winnerEmail = score > challengerScore ? user.email : challenge[0].challenger_email;
      
      await Challenge.update(challengeId, {
        challenged_session_id: newSession.id,
        challenged_score: score,
        status: 'completed',
        winner_email: winnerEmail,
      });
    }

    if (gameRoomId) {
      const room = await GameRoom.filter({id: gameRoomId});
      if (room.length > 0) {
        const updatedPlayers = room[0].players.map(p => {
          if (p.email === user.email) {
            return { ...p, score: score, is_finished: true };
          }
          return p;
        });
        await GameRoom.update(gameRoomId, { players: updatedPlayers });
      }
    }

  }, [quiz, startTime, strikes, challengeId, gameRoomId, user, pointMultiplier, gamemode, isDaily]);
  
  const handleAnswer = useCallback(async (answerIndex, timeUp = false) => {
    if ((gameState !== 'playing' && !timeUp) || isFrozen) return;
    setGameState('paused');

    const currentQuestion = quiz.questions[currentQuestionIndex];
    let isCorrect = answerIndex === currentQuestion.correct_answer;

    let usedShield = false;
    if (!isCorrect && (user?.shields || 0) > 0 && !timeUp) {
      isCorrect = true;
      usedShield = true;
      const newShields = (user.shields || 0) - 1;
      await User.updateMyUserData({ shields: newShields });
      setUser(prev => ({...prev, shields: newShields}));
    }
    
    const newAnswer = {
      question_index: currentQuestionIndex,
      selected_answer: answerIndex,
      correct_answer: currentQuestion.correct_answer,
      is_correct: isCorrect,
      time_taken: (quiz.time_limit || 30) - (timeLeft || 0),
      timed_out: timeUp,
      used_shield: usedShield,
    };

    if (!isCorrect && gamemode === 'strikeout') {
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      if (newStrikes >= 3) {
        const finalAnswers = [...answers, newAnswer];
        setAnswers(finalAnswers);
        await saveGameSession(finalAnswers);
        setGameState("finished");
        return;
      }
    }

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (gamemode === 'gamble') {
      applyGambleEffect();
    }

    setTimeout(() => {
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeLeft(quiz.time_limit || 30);
        setGameState('playing');
      } else {
        saveGameSession(newAnswers).then(() => {
          if (gameRoomId) {
            navigate(`${createPageUrl('GameRoomResults')}?id=${gameRoomId}`);
          } else {
            setGameState("finished");
          }
        });
      }
    }, 1000);
  }, [quiz, currentQuestionIndex, user, strikes, answers, saveGameSession, gameState, timeLeft, gameRoomId, navigate, isFrozen, gamemode, applyGambleEffect]);
  
  const handleTimeUp = useCallback(() => {
    handleAnswer(null, true);
  }, [handleAnswer]);

  const handleChallenge = async () => {
    if (!challengeEmail || !latestSession) return;
    setIsChallenging(true);
    await Challenge.create({
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      challenger_email: user.email,
      challenger_name: user.full_name,
      challenger_session_id: latestSession.id,
      challenger_score: latestSession.score,
      challenged_email: challengeEmail,
    });
    setIsChallenging(false);
    navigate(createPageUrl("Challenges"));
  };

  useEffect(() => { loadQuiz(); loadUser(); }, [loadQuiz, loadUser]);

  useEffect(() => { 
    if (gameRoomId) {
      fetchGameRoom();
      const interval = setInterval(fetchGameRoom, 2000);
      return () => clearInterval(interval);
    }
  }, [gameRoomId, fetchGameRoom]);
  
  useEffect(() => { 
    if(gameRoom && user) {
        const mySabotage = gameRoom.sabotages?.find(s => s.target_email === user.email && Date.now() - s.timestamp < 5000);
        setActiveSabotage(mySabotage?.type || null);
    }
  }, [gameRoom, user]);

  useEffect(() => { 
    if (gameState === "playing" && timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === "playing" && timeLeft === 0) {
      handleTimeUp();
    }
   }, [timeLeft, gameState, handleTimeUp]);

  const StrikeoutDisplay = () => (
    <div className="flex items-center gap-2">
      <span className="font-bold">STRIKES:</span>
      <div className="flex gap-1">
        {[1, 2, 3].map(i => (
          <XCircle key={i} className={`w-6 h-6 ${i <= strikes ? 'text-red-500 fill-red-200' : 'text-gray-400'}`} />
        ))}
      </div>
    </div>
  );
  
  const ShieldDisplay = () => (
    <div className="flex items-center gap-2">
      <Shield className="w-6 h-6 text-cyan-400" />
      <span className="font-black text-2xl">{user?.shields || 0}</span>
    </div>
  );

  if (gameState === "loading" || !quiz) {
    return (
      <div className="min-h-screen bg-pink-400 flex items-center justify-center p-4">
        <div className="bg-black text-pink-400 p-8 brutal-card">
          <div className="animate-pulse">
            <p className="text-2xl font-black text-center">LOADING BATTLE...</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "finished") {
    const correctCount = answers.filter(a => a.is_correct).length;
    const score = latestSession?.score || 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-cyan-400 to-purple-400 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <div className="text-center mb-8">
            <div className="bg-black text-white p-8 brutal-card inline-block transform -rotate-1">
              <h1 className="text-4xl font-black mb-4">{gamemode === 'strikeout' && strikes >= 3 ? "STRUCK OUT!" : "BATTLE COMPLETE!"}</h1>
              <div className="text-6xl font-black text-yellow-400 mb-4">{score}%</div>
              <p className="text-xl font-bold">
                {correctCount} out of {answers.length} correct
              </p>
              {isDaily && (
                <div className="mt-4 p-4 bg-yellow-400 text-black">
                  <p className="font-black text-xl">DAILY REWARDS CLAIMED!</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 brutal-card mb-8">
            <h3 className="text-2xl font-black text-black mb-4">EARNED SCRAP: {Math.round(score/10)}</h3>
            {!isDaily && (
              <>
                <h3 className="text-2xl font-black text-black mb-4">CHALLENGE A RIVAL</h3>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Enter rival's email..." 
                    value={challengeEmail}
                    onChange={e => setChallengeEmail(e.target.value)}
                    className="flex-grow p-3 border-4 border-black font-bold" 
                  />
                  <button onClick={handleChallenge} disabled={isChallenging} className="bg-purple-500 text-white font-black px-6 brutal-button flex items-center gap-2">
                    {isChallenging ? <Loader2 className="animate-spin" /> : <Send />}
                  </button>
                </div>
              </>
            )}
          </div>
          
          <div className="bg-black text-white p-6 brutal-card mb-8 transform rotate-1">
            <h3 className="text-2xl font-black mb-4">SUMMARY</h3>
            {answers.map((answer, index) => (
              <div key={index} className="flex items-center gap-2 py-2 border-b border-gray-700 last:border-b-0">
                {answer.is_correct ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
                <span className="font-bold">Q{index + 1}:</span>
                <span className="flex-grow">{quiz.questions[answer.question_index].question}</span>
                {answer.timed_out && <span className="font-bold text-yellow-400">Time Out!</span>}
                {answer.used_shield && <Shield className="text-cyan-400" title="Shield used" />}
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate(createPageUrl("Lobby"))}
              className="bg-black text-white px-8 py-4 font-black text-xl brutal-button"
            >
              BACK TO LOBBY
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  let options = currentQuestion?.options || [];
  if (activeSabotage === 'shuffle') {
    options = [...options].sort(() => Math.random() - 0.5);
  }
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-4 transition-all 
      ${activeSabotage === 'blur' || isFrozen ? 'blur-sm' : ''}`}>
      {isFrozen && <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"><p className="text-4xl font-black text-white animate-pulse">FROZEN!</p></div>}
      {pointMultiplier > 1 && <div className="fixed top-4 right-4 bg-yellow-400 text-black p-4 brutal-card font-black text-2xl animate-bounce">x{pointMultiplier} POINTS!</div>}

      <div className="max-w-4xl mx-auto pt-4">
        <div className="bg-black text-white p-4 brutal-card mb-6 transform rotate-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black">{quiz.title}</h1>
              <p className="font-bold">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
            </div>
            <div className="flex items-center gap-4">
              {gamemode === 'strikeout' && <StrikeoutDisplay />}
              <ShieldDisplay />
              <div className="flex items-center gap-2 bg-red-500 px-3 py-2 brutal-shadow">
                <Clock className="w-5 h-5" />
                <span className="text-2xl font-black">{timeLeft}</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-700 h-2 mt-4">
            <div 
              className="bg-green-400 h-full transition-all duration-500 ease-out" 
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
        {quiz && currentQuestion && (
        <div className="bg-white p-8 brutal-card mb-6 transform -rotate-1">
          <h2 className="text-3xl font-black text-black mb-8 leading-tight">
            {currentQuestion.question}
          </h2>
          
          <div className="grid gap-4">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={gameState !== 'playing' || isFrozen}
                className={`p-6 text-left font-bold text-black border-4 border-black brutal-button text-lg disabled:opacity-50
                  ${"bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <span className="bg-black text-white px-3 py-1 mr-4 font-black">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </button>
            ))}
          </div>
        </div>
        )}
        {gameRoom && gamemode === 'sabotage' && user && (
          <SabotagePanel gameRoom={gameRoom} user={user} onSabotage={handleSabotageUsed} />
        )}
      </div>
    </div>
  );
}