import React, { useState } from 'react';
import { 
  Plus, 
  Lightbulb, 
  Tag, 
  ArrowRight, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Target, 
  ChevronRight,
  Filter,
  Sparkles
} from 'lucide-react';
import { IdeaItem, IdeaStage } from '../../types';
import { useAuth } from '../../context/AuthContext';

const STAGES: { key: IdeaStage; label: string; desc: string }[] = [
  { key: 'spark', label: 'Spark', desc: 'Raw spontaneous idea' },
  { key: 'exploring', label: 'Exploring', desc: 'Gathering info & testing' },
  { key: 'planning', label: 'Planning', desc: 'Structuring outline' },
  { key: 'in_progress', label: 'In Progress', desc: 'Currently being developed' },
  { key: 'on_hold', label: 'On Hold', desc: 'Parked for later' },
  { key: 'completed', label: 'Completed', desc: 'Brought to fruition' },
];

export const IdeaBin: React.FC = () => {
  const { ideaItems, saveIdeaItem, deleteIdeaItem, convertIdeaToGoal, setActivePage } = useAuth();
  
  const [selectedStage, setSelectedStage] = useState<IdeaStage | 'all'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState<IdeaStage>('spark');
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');

  const [convertingIdea, setConvertingIdea] = useState<IdeaItem | null>(null);
  const [convertSuccess, setConvertSuccess] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStage('spark');
    setTagsInput('');
    setNotes('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (item: IdeaItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setStage(item.stage);
    setTagsInput((item.tags || []).join(', '));
    setNotes(item.notes || '');
    setIsAdding(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const payload: IdeaItem = {
      id: editingId || 'idea_' + Date.now(),
      userId: 'current',
      title: title.trim(),
      description: description.trim(),
      stage,
      tags,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveIdeaItem(payload);
    resetForm();
  };

  const handleConvertGoal = async (item: IdeaItem) => {
    setConvertingIdea(item);
    await convertIdeaToGoal(item.id);
    setConvertSuccess(true);
    setTimeout(() => {
      setConvertingIdea(null);
      setConvertSuccess(false);
      setActivePage('goals');
    }, 1200);
  };

  const filteredIdeas = ideaItems.filter(item => {
    if (selectedStage === 'all') return true;
    return item.stage === selectedStage;
  });

  return (
    <div className="space-y-6 select-none max-w-5xl mx-auto">
      {/* Header & New Idea Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Idea Bin
            </h2>
            <span 
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border text-[var(--accent-primary)] bg-[var(--bg-accent-soft)]"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              {ideaItems.length} Ideas
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Nurture creative concepts from spontaneous sparks to finished projects.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--accent-primary)] hover:opacity-90 flex items-center space-x-1.5 self-start sm:self-center transition-opacity shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Capture Idea</span>
        </button>
      </div>

      {/* Stage Filter Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedStage('all')}
          className={`px-3 py-1.5 rounded-xl font-semibold border transition-all ${
            selectedStage === 'all'
              ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-xs'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          style={{ borderColor: selectedStage === 'all' ? undefined : 'var(--border-subtle)' }}
        >
          All ({ideaItems.length})
        </button>
        {STAGES.map(s => {
          const count = ideaItems.filter(i => i.stage === s.key).length;
          return (
            <button
              key={s.key}
              onClick={() => setSelectedStage(s.key)}
              className={`px-3 py-1.5 rounded-xl font-semibold border transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                selectedStage === s.key
                  ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-xs'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              style={{ borderColor: selectedStage === s.key ? undefined : 'var(--border-subtle)' }}
            >
              <span>{s.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedStage === s.key ? 'bg-white/20' : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* New / Edit Idea Modal/Form */}
      {isAdding && (
        <form 
          onSubmit={handleSave}
          className="p-5 sm:p-6 rounded-3xl border space-y-4 animate-in fade-in duration-200"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-strong)',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              {editingId ? 'Edit Idea' : 'Capture New Idea'}
            </h3>
            <button type="button" onClick={resetForm} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Student Biology Quiz App"
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
                style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What is this idea about? What problem does it solve or what curiosity sparked it?"
                className="w-full px-3.5 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
                style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Stage</label>
                <select
                  value={stage}
                  onChange={e => setStage(e.target.value as IdeaStage)}
                  className="w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none capitalize"
                  style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                >
                  {STAGES.map(s => (
                    <option key={s.key} value={s.key}>{s.label} ({s.desc})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="biology, tech, personal"
                  className="w-full px-3.5 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Personal Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional references, links, or scratchpad thoughts..."
                className="w-full px-3.5 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
                style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              type="button"
              onClick={resetForm}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--accent-primary)] hover:opacity-90 transition-opacity"
            >
              {editingId ? 'Save Changes' : 'Add to Bin'}
            </button>
          </div>
        </form>
      )}

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
        <div 
          className="p-12 rounded-3xl border text-center space-y-3"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <Lightbulb className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-40" />
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            No ideas in this stage yet
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            Capture spontaneous inspirations from your Blurt thoughts or add one manually above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredIdeas.map(item => {
            const currentStageObj = STAGES.find(s => s.key === item.stage) || STAGES[0];
            return (
              <div 
                key={item.id}
                className="p-4 rounded-3xl border flex flex-col justify-between space-y-3 transition-all hover:shadow-sm"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase"
                      style={{
                        backgroundColor: 'var(--bg-accent-soft)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--accent-primary)'
                      }}
                    >
                      {currentStageObj.label}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleStartEdit(item)}
                        title="Edit Idea"
                        className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteIdeaItem(item.id)}
                        title="Delete Idea"
                        className="p-1 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.tags.map(t => (
                        <span 
                          key={t}
                          className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--bg-card-subtle)] border text-[var(--text-muted)]"
                          style={{ borderColor: 'var(--border-subtle)' }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Action: Convert to Goal */}
                <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                  <select
                    value={item.stage}
                    onChange={e => saveIdeaItem({ ...item, stage: e.target.value as IdeaStage })}
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg border bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] focus:outline-none"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    {STAGES.map(s => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleConvertGoal(item)}
                    disabled={convertingIdea?.id === item.id}
                    className="text-[10px] font-bold text-[var(--accent-primary)] hover:underline flex items-center space-x-1"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Convert to Goal</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
