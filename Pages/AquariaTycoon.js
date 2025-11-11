import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/entities/User';
import { createPageUrl } from '@/utils';
import { Droplets, Fish, TrendingUp, AlertCircle, Plus, Trash2, ArrowLeft, Loader2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const AquariumGame = () => {
  const navigate = useNavigate();
  const [money, setMoney] = useState(500);
  const [day, setDay] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState('');
  const [tanks, setTanks] = useState([
    { id: 1, name: 'Tank A', capacity: 5, size: 'small', fish: [], health: 80 }
  ]);
  const [selectedTank, setSelectedTank] = useState(1);
  const [tourists, setTourists] = useState(0);
  const [events, setEvents] = useState([]);
  const [question, setQuestion] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const user = await User.me();
        if (!user.unlocked_games || !user.unlocked_games.includes('aquaria')) {
          alert("🔒 Aquaria Tycoon is locked! Unlock it from your Profile for 300 scrap.");
          navigate(createPageUrl('Profile'));
          return;
        }
        setLoading(false);
      } catch (e) {
        navigate(createPageUrl('Lobby'));
      }
    };
    checkAccess();
  }, [navigate]);

  const tankSizes = [
    { size: 'small', capacity: 5, cost: 0 },
    { size: 'medium', capacity: 10, cost: 300 },
    { size: 'large', capacity: 20, cost: 600 },
    { size: 'giant', capacity: 40, cost: 1200 }
  ];

  const fishSpecies = [
    { name: 'Goldfish', cost: 20, rarity: 1, attractiveness: 1 },
    { name: 'Guppy', cost: 15, rarity: 1, attractiveness: 1 },
    { name: 'Tetra', cost: 25, rarity: 1, attractiveness: 1 },
    { name: 'Molly', cost: 30, rarity: 2, attractiveness: 1 },
    { name: 'Platy', cost: 28, rarity: 2, attractiveness: 1 },
    { name: 'Betta', cost: 40, rarity: 2, attractiveness: 2 },
    { name: 'Angelfish', cost: 60, rarity: 2, attractiveness: 2 },
    { name: 'Neon Tetra', cost: 35, rarity: 2, attractiveness: 1 },
    { name: 'Corydoras', cost: 32, rarity: 2, attractiveness: 1 },
    { name: 'Danio', cost: 38, rarity: 2, attractiveness: 1 },
    { name: 'Discus', cost: 100, rarity: 3, attractiveness: 3 },
    { name: 'Seahorse', cost: 150, rarity: 4, attractiveness: 4 },
    { name: 'Mandarin Dragonet', cost: 120, rarity: 4, attractiveness: 4 },
    { name: 'Lionfish', cost: 180, rarity: 4, attractiveness: 4 },
    { name: 'Clownfish', cost: 75, rarity: 3, attractiveness: 3 },
    { name: 'Parrotfish', cost: 95, rarity: 3, attractiveness: 3 },
    { name: 'Pufferfish', cost: 85, rarity: 3, attractiveness: 3 },
    { name: 'Koi', cost: 110, rarity: 3, attractiveness: 3 },
  ];

  const questions = [
    {
      q: "What is the optimal water change frequency for most aquariums?",
      options: [
        { text: "20-30 percent weekly", correct: true, reward: 50 },
        { text: "50 percent daily", correct: false, reward: -30 },
        { text: "Never change water", correct: false, reward: -50 },
        { text: "100 percent monthly", correct: false, reward: -30 }
      ]
    },
    {
      q: "Which fish species is known for being highly aggressive?",
      options: [
        { text: "Goldfish", correct: false, reward: -20 },
        { text: "Betta", correct: true, reward: 50 },
        { text: "Neon Tetra", correct: false, reward: -20 },
        { text: "Corydoras", correct: false, reward: -20 }
      ]
    },
    {
      q: "What does algae growth in a tank indicate?",
      options: [
        { text: "Too much light and nutrients", correct: true, reward: 50 },
        { text: "Water is too cold", correct: false, reward: -20 },
        { text: "Not enough fish", correct: false, reward: -20 },
        { text: "Tank needs to be drained", correct: false, reward: -30 }
      ]
    },
    {
      q: "How long should you wait before adding fish to a new tank?",
      options: [
        { text: "Immediately", correct: false, reward: -50 },
        { text: "3-5 days", correct: false, reward: -20 },
        { text: "2-4 weeks for cycling", correct: true, reward: 50 },
        { text: "6 months", correct: false, reward: -30 }
      ]
    },
    {
      q: "What is the primary cause of fish death in home aquariums?",
      options: [
        { text: "Poor water quality", correct: true, reward: 50 },
        { text: "Fish age", correct: false, reward: -20 },
        { text: "Insufficient decorations", correct: false, reward: -20 },
        { text: "Too much food", correct: false, reward: -20 }
      ]
    },
    {
      q: "Which device helps maintain stable oxygen levels in the tank?",
      options: [
        { text: "Filter", correct: true, reward: 50 },
        { text: "Heater", correct: false, reward: -20 },
        { text: "Light", correct: false, reward: -20 },
        { text: "Thermometer", correct: false, reward: -20 }
      ]
    },
    {
      q: "How often should you replace filter media?",
      options: [
        { text: "Every 2-4 weeks", correct: true, reward: 50 },
        { text: "Never", correct: false, reward: -40 },
        { text: "Once a year", correct: false, reward: -20 },
        { text: "Every time you clean", correct: false, reward: -30 }
      ]
    },
    {
      q: "What is a good sign of a healthy fish?",
      options: [
        { text: "Bright colors and active swimming", correct: true, reward: 50 },
        { text: "Staying at the bottom all day", correct: false, reward: -20 },
        { text: "Refusing food", correct: false, reward: -30 },
        { text: "Rapid gill movement", correct: false, reward: -20 }
      ]
    }
  ];

  const addTank = (size) => {
    const tankConfig = tankSizes.find(t => t.size === size);
    if (!tankConfig) return;

    const newId = Math.max(...tanks.map(t => t.id), 0) + 1;
    if (money >= tankConfig.cost) {
      setTanks([...tanks, {
        id: newId,
        name: `Tank ${String.fromCharCode(65 + tanks.length)}`,
        capacity: tankConfig.capacity,
        size: size,
        fish: [],
        health: 80
      }]);
      setMoney(money - tankConfig.cost);
      addEvent(`New ${size} tank installed!`);
    }
  };

  const buyFish = (species) => {
    const tank = tanks.find(t => t.id === selectedTank);
    if (!tank) return;
    
    if (tank.fish.length >= tank.capacity) {
      addEvent(`Tank is full! Fish escaped into ventilation!`);
      return;
    }

    if (money >= species.cost) {
      const newFish = { ...species, id: Math.random(), health: 100 };
      setTanks(tanks.map(t => 
        t.id === selectedTank ? { ...t, fish: [...t.fish, newFish] } : t
      ));
      setMoney(money - species.cost);
      addEvent(`Added ${species.name} to ${tank.name}!`);
    }
  };

  const removeFish = (fishId) => {
    setTanks(tanks.map(t =>
      t.id === selectedTank ? { ...t, fish: t.fish.filter(f => f.id !== fishId) } : t
    ));
  };

  const feedFish = () => {
    const tank = tanks.find(t => t.id === selectedTank);
    if (!tank || tank.fish.length === 0) return;

    setTanks(tanks.map(t => {
      if (t.id === selectedTank) {
        return {
          ...t,
          fish: t.fish.map(f => ({ ...f, health: Math.min(100, f.health + 15) }))
        };
      }
      return t;
    }));
    setMoney(money - 10);
    addEvent('Fed the fish!');
  };

  const cleanTank = () => {
    setTanks(tanks.map(t =>
      t.id === selectedTank ? { ...t, health: Math.min(100, t.health + 20) } : t
    ));
    setMoney(money - 15);
    addEvent('Tank cleaned!');
  };

  const addEvent = (msg) => {
    setEvents([msg, ...events.slice(0, 4)]);
  };

  const askQuestion = () => {
    const randomQ = questions[Math.floor(Math.random() * questions.length)];
    setQuestion(randomQ);
    setShowQuestion(true);
  };

  const answerQuestion = (option) => {
    if (option.correct) {
      setMoney(money + option.reward);
      addEvent(`Correct! +$${option.reward}`);
    } else {
      setMoney(Math.max(0, money + option.reward));
      addEvent(`Wrong! ${option.reward < 0 ? '-$' + Math.abs(option.reward) : '+$' + option.reward}`);
    }
    setShowQuestion(false);
  };

  const advanceDay = () => {
    setDay(day + 1);

    if (day >= 60) {
      setGameOver(true);
      setGameOverReason('You survived 60 days! Great job running the aquarium!');
      return;
    }
    
    setTanks(tanks.map(t => {
      const newFish = t.fish.map(f => {
        return { ...f, health: Math.max(0, f.health - 8) };
      }).filter(f => f.health > 0);

      let healthDecay = 5 + (newFish.length * 2);
      const newHealth = Math.max(0, t.health - healthDecay);

      if (newHealth <= 0) {
        setGameOver(true);
        setGameOverReason(`${t.name} collapsed at ${Math.min(100, day)} days! Game Over!`);
      }

      return { ...t, health: newHealth, fish: newFish };
    }));

    let totalAttractiveness = 0;
    tanks.forEach(t => {
      t.fish.forEach(f => {
        totalAttractiveness += f.attractiveness;
      });
    });

    const dailyRevenue = Math.floor(totalAttractiveness * 30);
    setMoney(money + dailyRevenue);
    setTourists(totalAttractiveness * 5);

    if (dailyRevenue > 0) {
      addEvent(`Earned $${dailyRevenue} from ${totalAttractiveness * 5} tourists!`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-white" />
      </div>
    );
  }

  const tank = tanks.find(t => t.id === selectedTank);

  const TankVisual = ({ tankData }) => {
    const colors = ['bg-blue-300', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600'];
    const fishEmojis = ['🐠', '🐟', '🦐', '🐙', '🦈', '🐡', '🐲', '🦑'];
    
    return (
      <div className={`${colors[Math.min(3, tankData.fish.length)]} rounded-lg p-8 h-64 flex flex-col justify-between items-center relative overflow-hidden border-4 border-blue-900`}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-200 opacity-50 animate-pulse"></div>
        
        <div className="flex-1 flex flex-wrap gap-3 items-center justify-center content-center w-full">
          {tankData.fish.length === 0 ? (
            <div className="text-4xl opacity-30">🐠</div>
          ) : (
            tankData.fish.map((f, idx) => (
              <div
                key={f.id}
                className="text-4xl animate-bounce"
                style={{
                  animationDelay: `${idx * 0.2}s`,
                  opacity: 0.5 + (f.health / 200)
                }}
              >
                {fishEmojis[idx % fishEmojis.length]}
              </div>
            ))
          )}
        </div>
        
        <div className="text-white font-bold text-sm bg-black bg-opacity-40 px-3 py-1 rounded">
          {tankData.fish.length}/{tankData.capacity} Fish
        </div>
      </div>
    );
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 p-6 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">Game Over!</h1>
          <p className="text-3xl mb-8">{gameOverReason}</p>
          <p className="text-2xl mb-2">Final Day: {day}</p>
          <p className="text-2xl mb-8">Final Money: ${money}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-xl"
            >
              Play Again
            </button>
            <Link to={createPageUrl('Lobby')} className="px-8 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold text-xl">
              Back to Lobby
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 p-6 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Aquarium Tycoon</h1>
            <div className="flex gap-6 text-lg">
              <div className="flex items-center gap-2"><TrendingUp size={20} /> Money: ${money}</div>
              <div className="flex items-center gap-2"><Droplets size={20} /> Day: {day}/60</div>
              <div className="flex items-center gap-2"><Fish size={20} /> Tourists: {tourists}</div>
            </div>
          </div>
          <Link to={createPageUrl('Lobby')} className="bg-white text-blue-900 font-black py-3 px-6 brutal-button flex items-center gap-2">
            <ArrowLeft className="w-5 h-5"/> BACK
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-blue-800 rounded-lg p-4 h-fit">
            <h3 className="text-lg font-bold mb-3">Shop</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {fishSpecies.map((species, i) => (
                <button
                  key={i}
                  onClick={() => buyFish(species)}
                  disabled={money < species.cost}
                  className={`w-full text-left p-2 rounded transition text-xs ${
                    money >= species.cost
                      ? 'bg-blue-700 hover:bg-blue-600 cursor-pointer'
                      : 'bg-blue-900 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="font-bold">{species.name}</div>
                  <div>Rarity: {species.rarity} | ${species.cost}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <div className="bg-blue-800 rounded-lg p-4 mb-4">
              <div className="flex gap-2 flex-wrap mb-3">
                {tanks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTank(t.id)}
                    className={`px-3 py-1 rounded font-bold transition text-sm ${
                      selectedTank === t.id
                        ? 'bg-cyan-400 text-blue-900'
                        : 'bg-blue-600 hover:bg-blue-500'
                    }`}
                  >
                    {t.name} ({t.size})
                  </button>
                ))}
              </div>
              
              <div className="bg-blue-700 p-3 rounded">
                <p className="text-xs font-bold mb-2">Buy New Tank:</p>
                <div className="grid grid-cols-2 gap-2">
                  {tankSizes.slice(1).map(ts => (
                    <button
                      key={ts.size}
                      onClick={() => addTank(ts.size)}
                      disabled={money < ts.cost}
                      className={`text-xs py-1 rounded font-bold transition ${
                        money >= ts.cost
                          ? 'bg-green-600 hover:bg-green-500'
                          : 'bg-gray-600 opacity-50'
                      }`}
                    >
                      {ts.size} ${ts.cost}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {tank && (
              <>
                <TankVisual tankData={tank} />
                
                <div className="bg-blue-800 rounded-lg p-4 mt-4">
                  <h2 className="text-2xl font-bold mb-4">{tank.name}</h2>
                  
                  <div className="mb-4">
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Tank Health</span>
                      <span>{Math.round(tank.health)}%</span>
                    </div>
                    <div className="w-full bg-blue-900 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all ${
                          tank.health > 60 ? 'bg-green-500' : tank.health > 30 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${tank.health}%` }}
                      />
                    </div>
                  </div>

                  <div className="mb-4 bg-blue-700 p-3 rounded">
                    <p className="font-bold text-sm mb-2">Fish ({tank.fish.length}/{tank.capacity})</p>
                    <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto">
                      {tank.fish.map(f => (
                        <div key={f.id} className="bg-blue-600 p-2 rounded flex justify-between items-center text-xs">
                          <div>
                            <div>{f.name}</div>
                            <div className="text-xs text-gray-300">HP: {f.health}%</div>
                          </div>
                          <button
                            onClick={() => removeFish(f.id)}
                            className="text-red-300 hover:text-red-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      {tank.fish.length === 0 && (
                        <div className="text-gray-400 text-xs col-span-2">Empty tank</div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={feedFish}
                      disabled={tank.fish.length === 0}
                      className={`flex-1 py-2 rounded font-bold transition ${
                        tank.fish.length > 0
                          ? 'bg-green-600 hover:bg-green-500'
                          : 'bg-gray-600 opacity-50'
                      }`}
                    >
                      Feed ($10)
                    </button>
                    <button
                      onClick={cleanTank}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-500 py-2 rounded font-bold transition"
                    >
                      Clean ($15)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bg-blue-800 rounded-lg p-4 h-fit">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <AlertCircle size={18} /> Log
            </h3>
            <div className="space-y-1 text-sm max-h-96 overflow-y-auto">
              {events.map((e, i) => (
                <div key={i} className="text-blue-200 p-2 bg-blue-700 rounded text-xs">{e}</div>
              ))}
            </div>

            <button
              onClick={advanceDay}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-500 py-3 rounded font-bold text-lg transition"
            >
              Next Day
            </button>

            <button
              onClick={askQuestion}
              className="w-full mt-2 bg-yellow-600 hover:bg-yellow-500 py-2 rounded font-bold transition"
            >
              Answer Question
            </button>
          </div>
        </div>

        {showQuestion && question && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-blue-800 rounded-lg p-8 max-w-lg w-full border-4 border-yellow-400">
              <h2 className="text-2xl font-bold mb-6 text-center">{question.q}</h2>
              <div className="space-y-3">
                {question.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => answerQuestion(option)}
                    className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded font-bold text-left transition"
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AquariumGame;