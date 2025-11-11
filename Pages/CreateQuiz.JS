
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quiz } from '@/entities/Quiz';
import { InvokeLLM } from '@/integrations/Core';
import { createPageUrl } from '@/utils';
import { Wand2, Loader2, Save, Plus, Trash2, Edit, Check, BrainCircuit } from 'lucide-react';

// Modified: correct_answer is now an array
const emptyQuestion = () => ({ question: '', options: ['', '', '', ''], correct_answer: [], explanation: '' });

const quizSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    category: { type: "string", enum: ["general", "sports", "movies", "science", "history", "music", "tech", "art", "gaming", "literature", "food"] },
    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
          // Modified: correct_answer is now an array of numbers
          correct_answer: { 
            type: "array", 
            items: { type: "number", minimum: 0, maximum: 3 }, // Each item in the array must be a number (index)
            description: "An array of indices (0-3) for the correct answers in the options array. Can contain one or multiple indices." 
          },
          explanation: { type: "string", description: "A brief explanation for why the answer is correct." }
        },
        required: ["question", "options", "correct_answer"]
      }
    }
  },
  required: ["title", "questions"]
};

const AIGenerator = ({ onGenerate, onSwitchToManual }) => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      // Modified: Update prompt to instruct LLM to return an array for correct_answer
      const prompt = `Create a trivia quiz about "${topic}". It should have ${numQuestions} questions, with a difficulty of "${difficulty}". Each question must have exactly 4 options. Provide an explanation for each correct answer. The category should be auto-detected from the topic. For the 'correct_answer' field, always return an array of numbers, even if there's only one correct answer (e.g., [0] for the first option).`;
      const generatedData = await InvokeLLM({
        prompt: prompt,
        response_json_schema: quizSchema,
      });

      // Defensive normalization: Ensure correct_answer is always an array, even if LLM deviates
      const normalizedQuestions = generatedData.questions.map(q => ({
          ...q,
          correct_answer: Array.isArray(q.correct_answer) ? q.correct_answer : (typeof q.correct_answer === 'number' ? [q.correct_answer] : [])
      }));

      onGenerate({ ...generatedData, questions: normalizedQuestions, time_limit: 20, is_public: true });
    } catch (e) {
      console.error("AI Generation failed:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white p-8 brutal-card transform rotate-1 mb-8">
      <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-2"><BrainCircuit /> 1. Generate with AI</h2>
      <div className="space-y-4">
        <input type="text" placeholder="Quiz Topic (e.g., 'Roman Empire')" value={topic} onChange={e => setTopic(e.target.value)} className="w-full p-3 border-4 border-black font-bold"/>
        <div className="grid grid-cols-2 gap-4">
          <input type="number" value={numQuestions} onChange={e => setNumQuestions(parseInt(e.target.value, 10))} className="w-full p-3 border-4 border-black font-bold" min="1" max="20" />
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full p-3 border-4 border-black font-bold bg-white">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-cyan-400 text-black font-black text-xl py-4 brutal-button flex items-center justify-center gap-2">
          {isGenerating ? <Loader2 className="animate-spin" /> : <><Wand2/> GENERATE</>}
        </button>
      </div>
      <p className="text-center mt-4 font-bold">OR</p>
      <button onClick={onSwitchToManual} className="w-full mt-2 bg-gray-200 text-black font-black text-lg py-3 brutal-button flex items-center justify-center gap-2">
        <Edit/> START FROM SCRATCH
      </button>
    </div>
  );
};

const ManualEditor = ({ initialData, onSave }) => {
  // Normalize initial data to ensure correct_answer is always an array
  const normalizedInitialData = {
    ...initialData,
    questions: initialData.questions.map(q => ({
      ...q,
      correct_answer: Array.isArray(q.correct_answer) ? q.correct_answer : (typeof q.correct_answer === 'number' ? [q.correct_answer] : [])
    }))
  };

  const [quizData, setQuizData] = useState(() => ({
      ...normalizedInitialData, // Use normalized data
      collaborators: initialData.collaborators || [] // Ensure collaborators is always an array
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');

  const handleQuizChange = (field, value) => setQuizData(prev => ({ ...prev, [field]: value }));
  
  const handleQuestionChange = (qIndex, field, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex][field] = value;
    setQuizData(prev => ({ ...prev, questions: newQuestions }));
  };
  
  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuizData(prev => ({ ...prev, questions: newQuestions }));
  };
  
  // New function to toggle correct answers, supports multiple
  const toggleCorrectAnswer = (qIndex, oIndex) => {
    const newQuestions = [...quizData.questions];
    const currentCorrectAnswers = newQuestions[qIndex].correct_answer;
    
    let updatedCorrectAnswers;
    if (currentCorrectAnswers.includes(oIndex)) {
      updatedCorrectAnswers = currentCorrectAnswers.filter(ans => ans !== oIndex);
    } else {
      updatedCorrectAnswers = [...currentCorrectAnswers, oIndex];
    }
    
    newQuestions[qIndex].correct_answer = updatedCorrectAnswers; // Always store as array
    setQuizData(prev => ({ ...prev, questions: newQuestions }));
  };

  // Helper function to check if an option is currently marked as correct
  const isCorrectAnswer = (qIndex, oIndex) => {
    const currentCorrectAnswers = quizData.questions[qIndex].correct_answer;
    // Ensure it's treated as an array for checking
    return Array.isArray(currentCorrectAnswers) && currentCorrectAnswers.includes(oIndex);
  };

  const addQuestion = () => setQuizData(prev => ({ ...prev, questions: [...prev.questions, emptyQuestion()] }));
  
  const removeQuestion = (qIndex) => {
    const newQuestions = quizData.questions.filter((_, i) => i !== qIndex);
    setQuizData(prev => ({ ...prev, questions: newQuestions }));
  };
  
  const addCollaborator = () => {
      if (collaboratorEmail && !quizData.collaborators.includes(collaboratorEmail)) {
          const newCollaborators = [...quizData.collaborators, collaboratorEmail];
          setQuizData(prev => ({...prev, collaborators: newCollaborators}));
          setCollaboratorEmail('');
      }
  };

  const removeCollaborator = (emailToRemove) => {
      const newCollaborators = quizData.collaborators.filter(email => email !== emailToRemove);
      setQuizData(prev => ({...prev, collaborators: newCollaborators}));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Defensive normalization just before save, though state should already be clean
    const dataToSave = {
      ...quizData,
      questions: quizData.questions.map(q => ({
        ...q,
        correct_answer: Array.isArray(q.correct_answer) ? q.correct_answer : (typeof q.correct_answer === 'number' ? [q.correct_answer] : [])
      }))
    };
    await onSave(dataToSave);
    setIsSaving(false);
  };

  return (
    <div className="bg-white p-8 brutal-card transform -rotate-1">
      <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-2"><Edit /> 2. Edit &amp; Refine</h2>
      <div className="space-y-6">
        {/* General Quiz Info */}
        <div className="grid md:grid-cols-2 gap-4">
            <input type="text" placeholder="Quiz Title" value={quizData.title} onChange={e => handleQuizChange('title', e.target.value)} className="w-full p-3 border-4 border-black font-bold"/>
            <select value={quizData.category} onChange={e => handleQuizChange('category', e.target.value)} className="w-full p-3 border-4 border-black font-bold bg-white">
                {quizSchema.properties.category.enum.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
        </div>
        <textarea placeholder="Description..." value={quizData.description} onChange={e => handleQuizChange('description', e.target.value)} className="w-full p-3 border-4 border-black font-bold h-24"/>
        <div className="flex items-center gap-4">
            <label className="font-bold">Public:</label>
            <input type="checkbox" checked={quizData.is_public} onChange={e => handleQuizChange('is_public', e.target.checked)} className="w-6 h-6"/>
        </div>

        {/* Collaborators */}
        <div className="bg-gray-100 border-4 border-black p-4">
            <h3 className="font-bold mb-2">Collaborators</h3>
            <div className="flex gap-2 mb-2">
                <input 
                    type="email" 
                    placeholder="Add user by email..." 
                    value={collaboratorEmail} 
                    onChange={e => setCollaboratorEmail(e.target.value)}
                    className="w-full p-2 border-2 border-black font-bold"
                />
                <button onClick={addCollaborator} className="bg-blue-500 text-white font-bold p-2 border-2 border-black brutal-button"><Plus /></button>
            </div>
            <div className="space-y-1">
                {(quizData.collaborators).map(email => (
                    <div key={email} className="flex items-center justify-between bg-white p-1 px-2">
                        <span className="text-sm font-bold">{email}</span>
                        <button onClick={() => removeCollaborator(email)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                    </div>
                ))}
            </div>
        </div>

        {/* Questions Editor */}
        <div className="space-y-8">
            {quizData.questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-gray-100 border-4 border-black p-4 relative">
                <h3 className="font-bold mb-2">Question {qIndex + 1}</h3>
                <textarea value={q.question} onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)} className="w-full p-2 border-2 border-black font-bold mb-2" placeholder="Question text..."/>
                <p className="text-xs text-gray-600 mb-2 font-bold">Click to toggle correct answers (can select multiple):</p>
                <div className="grid md:grid-cols-2 gap-2">
                {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                    <input type="text" value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} className="w-full p-2 border-2 border-black font-bold" placeholder={`Option ${oIndex+1}`}/>
                    <button 
                        onClick={() => toggleCorrectAnswer(qIndex, oIndex)} 
                        className={`p-2 border-2 border-black brutal-button ${isCorrectAnswer(qIndex, oIndex) ? 'bg-green-400' : 'bg-white'}`}
                    >
                        <Check/>
                    </button>
                    </div>
                ))}
                </div>
                <button onClick={() => removeQuestion(qIndex)} className="absolute -top-3 -right-3 bg-red-500 text-white p-1 border-2 border-black brutal-button"><Trash2 className="w-4 h-4"/></button>
            </div>
            ))}
        </div>

        <button onClick={addQuestion} className="w-full bg-yellow-400 text-black font-black py-3 brutal-button flex items-center justify-center gap-2"><Plus/> ADD QUESTION</button>
        <button onClick={handleSave} disabled={isSaving} className="w-full bg-green-500 text-white font-black text-xl py-4 brutal-button flex items-center justify-center gap-2">
          {isSaving ? <Loader2 className="animate-spin"/> : <><Save/> SAVE QUIZ</>}
        </button>
      </div>
    </div>
  );
};


export default function CreateQuiz() {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);

  const handleGenerated = (data) => {
    setQuizData(data);
  };
  
  const handleStartManual = () => {
    setQuizData({
      title: '', description: '', category: 'general', difficulty: 'medium', time_limit: 20, is_public: true, collaborators: [],
      questions: [emptyQuestion()]
    });
  };
  
  const handleSaveQuiz = async (dataToSave) => {
    // Final defensive normalization before saving to ensure correct_answer is always an array
    const finalDataToSave = {
      ...dataToSave,
      questions: dataToSave.questions.map(q => ({
        ...q,
        correct_answer: Array.isArray(q.correct_answer) ? q.correct_answer : (typeof q.correct_answer === 'number' ? [q.correct_answer] : [])
      }))
    };

    const newQuiz = await Quiz.create(finalDataToSave);
    navigate(createPageUrl("Lobby"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black bg-black text-white p-8 brutal-card inline-block transform -rotate-2">QUIZ FORGE</h1>
        </div>
        {!quizData ? (
          <AIGenerator onGenerate={handleGenerated} onSwitchToManual={handleStartManual} />
        ) : (
          <ManualEditor initialData={quizData} onSave={handleSaveQuiz} />
        )}
      </div>
    </div>
  );
}
