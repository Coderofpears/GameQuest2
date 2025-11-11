import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Wand2, Loader2, Send, Bot, User as UserIcon, Code2, Copy, Check, Plus, Trash2, Edit3, Globe } from 'lucide-react';

export default function AIChatDesigner({ game, onApplyCode, onUpdateGame, onAddNode, onDeleteNode, onEditNode }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hi! I'm your AI Game Development Assistant with **full codebase access** and **web search**. I can:

• 📖 **View** your entire game structure, nodes, and code
• ➕ **Add** new nodes with pre-configured code
• ✏️ **Edit** existing nodes and their logic
• 🗑️ **Delete** nodes you don't need
• 🔍 **Analyze** your game and suggest improvements
• 💻 **Generate** Blockly & JavaScript code
• 🎮 **Design** levels, mechanics, and gameplay
• 🐛 **Debug** and fix issues
• 🌐 **Search web** for game dev resources and solutions

What would you like to do?`
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Check if user wants web search
            const needsWebSearch = input.toLowerCase().includes('search') || 
                                  input.toLowerCase().includes('find') ||
                                  input.toLowerCase().includes('how to') ||
                                  input.toLowerCase().includes('tutorial') ||
                                  input.toLowerCase().includes('example');

            const gameContext = game ? `
CURRENT GAME STRUCTURE:
======================

Game Name: ${game.game_name}
Description: ${game.description || 'No description'}

NODES (${game.game_data?.nodes?.length || 0}):
${game.game_data?.nodes?.map(n => `
  - ${n.type.toUpperCase()}: "${n.label}" (ID: ${n.id})
    Coding Mode: ${n.codingMode || 'blockly'}
    ${n.blocklyXml ? '✓ Has Blockly Code' : ''}
    ${n.javascriptCode ? `✓ Has JavaScript Code (${n.javascriptCode.split('\n').length} lines)` : ''}
`).join('') || 'No nodes'}

CONNECTIONS (${game.game_data?.connections?.length || 0}):
${game.game_data?.connections?.map(c => `  - ${c.from} → ${c.to}`).join('\n') || 'No connections'}

GLOBAL VARIABLES:
${game.game_data?.variables?.map(v => `  - ${v.variable_name} (${v.scope})`).join('\n') || 'No variables'}

SHARED ASSETS (${game.game_data?.sharedAssets?.length || 0}):
${game.game_data?.sharedAssets?.map(a => `  - ${a.type}: ${a.name || a.description}`).join('\n') || 'No assets'}

COLLABORATORS: ${game.collaborators?.length || 0}
PUBLISHED: ${game.is_published ? 'Yes' : 'No'}
` : 'No game loaded';

            const prompt = `You are an AI game development assistant with FULL CODEBASE ACCESS to a visual game maker platform.

${gameContext}

AVAILABLE ACTIONS:
1. **View/Analyze**: I can see all game nodes, code, and structure above
2. **Add Node**: Respond with JSON: {"action": "add_node", "type": "game|screen|platformer|3d|serverscript|localscript", "label": "Name", "code": "javascript code"}
3. **Edit Node**: Respond with JSON: {"action": "edit_node", "nodeId": "id", "updates": {"label": "new name", "javascriptCode": "new code", "codingMode": "javascript"}}
4. **Delete Node**: Respond with JSON: {"action": "delete_node", "nodeId": "id"}
5. **Suggest Code**: Provide JavaScript code with game API
6. **Refactor**: Analyze and suggest improvements

JAVASCRIPT GAME API:
- game.createSprite(id, imageSrc, x, y)
- game.moveSprite(id, dx, dy)
- game.setPosition(id, x, y)
- game.getSprite(id)
- game.applyGravity(id, force)
- game.applyVelocity(id, vx, vy)
- game.checkCollision(id1, id2)
- game.setGlobal(key, value)
- game.getGlobal(key)
- game.isKeyPressed(key)
- ctx.fillRect(x, y, w, h)
- ctx.fillText(text, x, y)

User Request: ${input}

If the user wants to modify the game structure, respond with the appropriate JSON action.
Otherwise, provide helpful advice, code, or analysis.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: needsWebSearch
            });

            // Check if response contains an action
            const responseStr = typeof response === 'string' ? response : JSON.stringify(response, null, 2);
            
            // Try to parse actions
            const actionMatch = responseStr.match(/\{"action":\s*"(add_node|edit_node|delete_node)"[^}]*\}/);
            if (actionMatch) {
                try {
                    const action = JSON.parse(actionMatch[0]);
                    await handleAIAction(action);
                    
                    const confirmMessage = { 
                        role: 'assistant', 
                        content: `✅ Action completed!\n\n${responseStr}`
                    };
                    setMessages(prev => [...prev, confirmMessage]);
                } catch (e) {
                    console.error('Error parsing action:', e);
                    setMessages(prev => [...prev, { role: 'assistant', content: responseStr }]);
                }
            } else {
                const assistantMessage = { role: 'assistant', content: responseStr };
                setMessages(prev => [...prev, assistantMessage]);
            }
        } catch (e) {
            console.error('AI error:', e);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: 'Sorry, I encountered an error. Please try again.' 
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleAIAction = async (action) => {
        switch (action.action) {
            case 'add_node':
                if (onAddNode) {
                    await onAddNode(action.type, action.label, action.code);
                }
                break;
            case 'edit_node':
                if (onEditNode) {
                    await onEditNode(action.nodeId, action.updates);
                }
                break;
            case 'delete_node':
                if (onDeleteNode) {
                    await onDeleteNode(action.nodeId);
                }
                break;
            default:
                console.log('Unknown action:', action);
        }
    };

    const copyCode = (content, index) => {
        navigator.clipboard.writeText(content);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-purple-900 to-indigo-900">
            {/* Header */}
            <div className="bg-black border-b-4 border-purple-500 p-4">
                <div className="flex items-center gap-3">
                    <Wand2 className="w-8 h-8 text-purple-400" />
                    <div>
                        <h3 className="text-xl font-black text-white">AI CODEBASE ASSISTANT</h3>
                        <p className="text-xs text-purple-300 flex items-center gap-2">
                            <Globe className="w-3 h-3"/> Full access + Web search enabled
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        )}
                        
                        <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-800'} text-white p-4 rounded-lg brutal-card`}>
                            <div className="whitespace-pre-wrap break-words text-sm">
                                {msg.content.split('```').map((part, i) => {
                                    if (i % 2 === 1) {
                                        const lines = part.split('\n');
                                        const language = lines[0].trim();
                                        const code = lines.slice(1).join('\n');
                                        
                                        return (
                                            <div key={i} className="my-2 relative">
                                                <div className="bg-black p-3 rounded font-mono text-xs overflow-x-auto border-2 border-purple-500">
                                                    {language && <div className="text-purple-400 mb-2">// {language}</div>}
                                                    {code}
                                                </div>
                                                <button
                                                    onClick={() => copyCode(code, `${idx}-${i}`)}
                                                    className="absolute top-2 right-2 bg-purple-600 hover:bg-purple-700 p-1 rounded"
                                                >
                                                    {copiedIndex === `${idx}-${i}` ? (
                                                        <Check className="w-4 h-4" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    }
                                    return <span key={i}>{part}</span>;
                                })}
                            </div>
                        </div>

                        {msg.role === 'user' && (
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                    <UserIcon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3 justify-start">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="bg-gray-800 text-white p-4 rounded-lg brutal-card flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Thinking...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t-4 border-purple-500 bg-black p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask me to add nodes, generate code, search tutorials..."
                        className="flex-1 p-3 border-2 border-purple-500 bg-gray-900 text-white font-bold rounded"
                        disabled={loading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-black px-6 brutal-button flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                    <button
                        onClick={() => setInput("Add a platformer node with WASD controls and gravity")}
                        className="text-xs bg-green-800 hover:bg-green-700 text-white px-3 py-1 rounded font-bold flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3"/> Add Node
                    </button>
                    <button
                        onClick={() => setInput("Analyze my game and suggest optimizations")}
                        className="text-xs bg-blue-800 hover:bg-blue-700 text-white px-3 py-1 rounded font-bold"
                    >
                        🔍 Analyze
                    </button>
                    <button
                        onClick={() => setInput("Search for Three.js 3D game tutorial")}
                        className="text-xs bg-cyan-800 hover:bg-cyan-700 text-white px-3 py-1 rounded font-bold flex items-center gap-1"
                    >
                        <Globe className="w-3 h-3"/> Web Search
                    </button>
                    <button
                        onClick={() => setInput("Generate a complete 2D platformer game")}
                        className="text-xs bg-yellow-800 hover:bg-yellow-700 text-white px-3 py-1 rounded font-bold"
                    >
                        ⚡ Generate Game
                    </button>
                </div>
            </div>
        </div>
    );
}