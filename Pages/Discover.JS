import React, { useState, useEffect } from 'react';
import { Quiz } from '@/entities/Quiz';
import QuizCard from '../components/QuizCard';
import { Loader2, Search } from 'lucide-react';

export default function Discover() {
    const [quizzes, setQuizzes] = useState([]);
    const [filteredQuizzes, setFilteredQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        const loadQuizzes = async () => {
            try {
                const data = await Quiz.list('-created_date');
                setQuizzes(data);
                setFilteredQuizzes(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadQuizzes();
    }, []);

    useEffect(() => {
        let result = quizzes;
        if (searchTerm) {
            result = result.filter(q => q.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (categoryFilter !== 'all') {
            result = result.filter(q => q.category === categoryFilter);
        }
        setFilteredQuizzes(result);
    }, [searchTerm, categoryFilter, quizzes]);

    const categories = ["all", "general", "sports", "movies", "science", "history", "music", "tech", "art", "gaming", "literature", "food"];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-400 via-teal-400 to-green-500 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8 transform -rotate-1">
                    <div className="bg-black text-white p-8 brutal-card inline-block">
                        <h1 className="text-4xl md:text-5xl font-black">DISCOVER BATTLES</h1>
                    </div>
                </div>

                <div className="bg-white p-6 brutal-card mb-8 grid md:grid-cols-2 gap-4 items-center">
                    <div className="relative">
                        <input type="text" placeholder="Search for a quiz..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-4 border-4 border-black text-lg font-bold brutal-shadow" />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-black/50"/>
                    </div>
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full p-4 border-4 border-black font-bold bg-white brutal-shadow text-lg">
                        {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                    </select>
                </div>

                {loading ? (
                    <div className="flex justify-center"><Loader2 className="w-16 h-16 animate-spin text-black" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredQuizzes.map(quiz => <QuizCard key={quiz.id} quiz={quiz} />)}
                    </div>
                )}
                 {filteredQuizzes.length === 0 && !loading && (
                    <div className="text-center mt-12 bg-black text-white p-8 brutal-card inline-block">
                        <p className="font-black text-2xl">NO QUIZZES FOUND!</p>
                    </div>
                )}
            </div>
        </div>
    );
}