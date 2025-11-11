import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Globe, User, Save } from 'lucide-react';

export default function GlobalVariablesManager({ gameId }) {
  const [variables, setVariables] = useState([]);
  const [newVar, setNewVar] = useState({ name: '', scope: 'client', value: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVariables();
  }, [gameId]);

  const loadVariables = async () => {
    try {
      const vars = await base44.entities.GlobalVariable.filter({ game_id: gameId });
      setVariables(vars);
    } catch (e) {
      console.error('Error loading variables:', e);
    } finally {
      setLoading(false);
    }
  };

  const addVariable = async () => {
    if (!newVar.name) return;
    
    try {
      const created = await base44.entities.GlobalVariable.create({
        game_id: gameId,
        variable_name: newVar.name,
        scope: newVar.scope,
        default_value: newVar.value,
        current_value: newVar.value
      });
      
      setVariables([...variables, created]);
      setNewVar({ name: '', scope: 'client', value: '' });
    } catch (e) {
      console.error('Error creating variable:', e);
    }
  };

  const updateVariable = async (varId, updates) => {
    try {
      await base44.entities.GlobalVariable.update(varId, updates);
      setVariables(variables.map(v => v.id === varId ? { ...v, ...updates } : v));
    } catch (e) {
      console.error('Error updating variable:', e);
    }
  };

  const deleteVariable = async (varId) => {
    try {
      await base44.entities.GlobalVariable.delete(varId);
      setVariables(variables.filter(v => v.id !== varId));
    } catch (e) {
      console.error('Error deleting variable:', e);
    }
  };

  if (loading) return <div className="text-white">Loading variables...</div>;

  return (
    <div className="bg-gray-800 p-4 brutal-card">
      <h3 className="font-black text-white text-lg mb-4 flex items-center gap-2">
        🌐 GLOBAL VARIABLES
      </h3>

      {/* Add New Variable */}
      <div className="mb-4 p-3 bg-gray-700 border-2 border-black rounded">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <input
            type="text"
            placeholder="Variable name"
            value={newVar.name}
            onChange={(e) => setNewVar({ ...newVar, name: e.target.value })}
            className="p-2 border-2 border-black font-bold text-sm"
          />
          <select
            value={newVar.scope}
            onChange={(e) => setNewVar({ ...newVar, scope: e.target.value })}
            className="p-2 border-2 border-black font-bold text-sm"
          >
            <option value="client">Client Only</option>
            <option value="all_players">All Players</option>
          </select>
          <input
            type="text"
            placeholder="Default value"
            value={newVar.value}
            onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
            className="p-2 border-2 border-black font-bold text-sm"
          />
        </div>
        <button
          onClick={addVariable}
          className="w-full bg-green-600 text-white font-bold py-2 brutal-button flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4"/> ADD VARIABLE
        </button>
      </div>

      {/* Variable List */}
      <div className="space-y-2">
        {variables.map(variable => (
          <div key={variable.id} className="bg-gray-900 p-3 border-2 border-black rounded flex items-center justify-between">
            <div className="flex-1 grid grid-cols-3 gap-2">
              <div className="flex items-center gap-2">
                {variable.scope === 'all_players' ? (
                  <Globe className="w-4 h-4 text-cyan-400" title="All Players" />
                ) : (
                  <User className="w-4 h-4 text-purple-400" title="Client Only" />
                )}
                <span className="text-white font-bold text-sm">{variable.variable_name}</span>
              </div>
              <input
                type="text"
                value={variable.current_value || ''}
                onChange={(e) => updateVariable(variable.id, { current_value: e.target.value })}
                className="p-1 border-2 border-black font-bold text-xs"
                placeholder="Current value"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Default: {variable.default_value || 'none'}</span>
                <button
                  onClick={() => deleteVariable(variable.id)}
                  className="bg-red-600 p-1 brutal-button text-white"
                >
                  <Trash2 className="w-3 h-3"/>
                </button>
              </div>
            </div>
          </div>
        ))}
        {variables.length === 0 && (
          <p className="text-gray-400 text-center py-4">No variables yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}