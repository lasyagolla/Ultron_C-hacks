import React, { useState, useMemo } from 'react';
import { 
  Map, 
  Target, 
  BookOpen, 
  Sparkles, 
  Rocket, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Bookmark, 
  ExternalLink, 
  Plus, 
  X, 
  ChevronRight, 
  Trash2, 
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SkillPathway, SkillPathwayMilestone, IdeaLaunchPlan } from '../types';

type ExploreTab = 'overview' | 'growth_map' | 'pathways' | 'skill_gap' | 'launchpad';

export const ExplorePage: React.FC = () => {
  const { 
    interests, 
    ambitions, 
    goals, 
    ideaItems, 
    confirmedSkills, 
    addConfirmedSkill, 
    removeConfirmedSkill,
    skillPathways,
    generateSkillPathway,
    saveSkillPathway,
    deleteSkillPathway,
    convertPathwayMilestoneToGoal,
    developIdeaLaunchPlan,
    addNewGoal
  } = useAuth();

  const [activeTab, setActiveTab] = useState<ExploreTab>('overview');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ----------------------------------------------------
  // Feature 1: Personal Growth Map State
  // ----------------------------------------------------
  const [selectedMapNode, setSelectedMapNode] = useState<{
    id: string;
    title: string;
    type: 'interest' | 'skill' | 'ambition' | 'goal';
    detail: string;
  } | null>(null);
  const [mapFilter, setMapFilter] = useState<'all' | 'interests' | 'skills' | 'ambitions' | 'goals'>('all');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);

  // ----------------------------------------------------
  // Feature 2: AI Skill Pathway Generator State
  // ----------------------------------------------------
  const [pathwaySkill, setPathwaySkill] = useState('');
  const [pathwayLevel, setPathwayLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [pathwayHours, setPathwayHours] = useState<number>(5);
  const [isGeneratingPathway, setIsGeneratingPathway] = useState(false);
  const [generatedPathway, setGeneratedPathway] = useState<SkillPathway | null>(null);
  const [pathwayError, setPathwayError] = useState<string | null>(null);
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);

  // ----------------------------------------------------
  // Feature 3: Skill Gap Detector State
  // ----------------------------------------------------
  const [selectedAmbitionId, setSelectedAmbitionId] = useState<string>(ambitions[0]?.id || '');

  // Determine required skills for chosen ambition
  const { targetTitle, requiredSkillsForTarget } = useMemo(() => {
    const amb = ambitions.find(a => a.id === selectedAmbitionId) || ambitions[0];
    if (!amb) {
      return { targetTitle: 'No ambition selected', requiredSkillsForTarget: [] };
    }
    const ambText = (amb.title + ' ' + (amb.description || '')).toLowerCase();
    const inferred: string[] = [];
    if (ambText.includes('python')) inferred.push('Python', 'Algorithms');
    if (ambText.includes('guitar') || ambText.includes('music')) inferred.push('Music Theory', 'Rhythm & Chords');
    if (ambText.includes('app') || ambText.includes('web') || ambText.includes('code')) inferred.push('Frontend Development', 'Git & GitHub');
    if (ambText.includes('research') || ambText.includes('biology')) inferred.push('Literature Review', 'Data Analysis');
    if (ambText.includes('compete') || ambText.includes('competition')) inferred.push('Problem Solving', 'Time Management');
    if (inferred.length === 0) inferred.push('Project Planning', 'Core Fundamentals', 'Self-Directed Practice');
    return { targetTitle: amb.title, requiredSkillsForTarget: inferred };
  }, [selectedAmbitionId, ambitions]);

  const skillGapAnalysis = useMemo(() => {
    const confirmed = requiredSkillsForTarget.filter(req => 
      confirmedSkills.some(cs => cs.toLowerCase() === req.toLowerCase())
    );
    const missing = requiredSkillsForTarget.filter(req => 
      !confirmedSkills.some(cs => cs.toLowerCase() === req.toLowerCase())
    );
    const readinessPercentage = requiredSkillsForTarget.length > 0 
      ? Math.round((confirmed.length / requiredSkillsForTarget.length) * 100) 
      : 100;
    return { confirmed, missing, readinessPercentage };
  }, [requiredSkillsForTarget, confirmedSkills]);

  // ----------------------------------------------------
  // Feature 4: Idea Launchpad State
  // ----------------------------------------------------
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>('');
  const [isDevelopingIdea, setIsDevelopingIdea] = useState(false);
  const [developedPlan, setDevelopedPlan] = useState<IdeaLaunchPlan | null>(null);
  const [ideaDevError, setIdeaDevError] = useState<string | null>(null);

  // ----------------------------------------------------
  // Handlers
  // ----------------------------------------------------
  const handleGeneratePathway = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pathwaySkill.trim()) return;

    setIsGeneratingPathway(true);
    setPathwayError(null);

    try {
      const pathway = await generateSkillPathway(pathwaySkill.trim(), pathwayLevel, pathwayHours);
      setGeneratedPathway(pathway);
      if (pathway.milestones.length > 0) {
        setExpandedMilestoneId(pathway.milestones[0].id);
      }
      showToast(`Generated pathway for ${pathway.skillName}!`);
    } catch (err: any) {
      setPathwayError(err.message || 'Unable to generate skill pathway. Please check your connection.');
    } finally {
      setIsGeneratingPathway(false);
    }
  };

  const handleSavePathway = async () => {
    if (!generatedPathway) return;
    await saveSkillPathway(generatedPathway);
    showToast(`Saved "${generatedPathway.skillName}" to your Learning Pathways!`);
  };

  const handleConvertMilestone = async (index: number) => {
    if (!generatedPathway) return;
    await convertPathwayMilestoneToGoal(generatedPathway, index);
    showToast(`Created goal for milestone: "${generatedPathway.milestones[index]?.title}"!`);
  };

  const handleDevelopIdea = async () => {
    const idea = ideaItems.find(i => i.id === selectedIdeaId);
    if (!idea) return;

    setIsDevelopingIdea(true);
    setIdeaDevError(null);

    try {
      const plan = await developIdeaLaunchPlan(idea);
      setDevelopedPlan(plan);
      showToast(`Roadmap ready for "${idea.title}"!`);
    } catch (err: any) {
      setIdeaDevError(err.message || 'Failed to generate implementation roadmap.');
    } finally {
      setIsDevelopingIdea(false);
    }
  };

  const handleLaunchPlanAsGoal = async () => {
    if (!developedPlan) return;
    await addNewGoal({
      title: developedPlan.ideaTitle,
      category: 'personal',
      priority: 'high',
      difficulty: 'moderate',
      status: 'not_started',
      progress: 0,
      targetDate: new Date(Date.now() + developedPlan.estimatedTotalWeeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      milestones: developedPlan.milestones.map((m, idx) => ({
        id: 'ms_plan_' + idx + '_' + Date.now(),
        goalId: '',
        title: m.title,
        status: 'pending'
      })),
      description: `Objective: ${developedPlan.objective}\nApproaches: ${developedPlan.approaches.join('; ')}`
    });
    showToast(`Launched "${developedPlan.ideaTitle}" into your Goal Tracker!`);
  };

  const handleAddCustomSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    await addConfirmedSkill(newSkillInput.trim());
    setNewSkillInput('');
    setShowAddSkillModal(false);
    showToast(`Added "${newSkillInput.trim()}" to your Confirmed Skills!`);
  };

  const triggerPathwayForMissingSkill = (skill: string) => {
    setPathwaySkill(skill);
    setActiveTab('pathways');
    setTimeout(() => {
      handleGeneratePathway();
    }, 100);
  };

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl border text-xs font-bold text-white bg-emerald-600 shadow-xl flex items-center space-x-2 animate-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Explore
            </h1>
            <span 
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
              style={{
                backgroundColor: 'var(--bg-accent-soft)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--accent-primary)'
              }}
            >
              Ambition &amp; Learning Hub
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Turn ambitions into structured milestones, bridge skill gaps, and incubate creative project roadmaps.
          </p>
        </div>

        {/* Feature Navigation Tabs (Opportunity Radar removed cleanly) */}
        <div 
          className="flex flex-wrap p-1 rounded-2xl border gap-1 self-start lg:self-center"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'overview' ? 'bg-[var(--accent-primary)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('growth_map')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'growth_map' ? 'bg-[var(--accent-primary)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Growth Map</span>
          </button>

          <button
            onClick={() => setActiveTab('pathways')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'pathways' ? 'bg-[var(--accent-primary)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Skill Pathways</span>
          </button>

          <button
            onClick={() => setActiveTab('skill_gap')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'skill_gap' ? 'bg-[var(--accent-primary)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Skill Gaps</span>
          </button>

          <button
            onClick={() => setActiveTab('launchpad')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'launchpad' ? 'bg-[var(--accent-primary)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Launchpad</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: OVERVIEW DASHBOARD */}
      {/* ==================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Quick Card 1: Growth Map */}
            <div 
              onClick={() => setActiveTab('growth_map')}
              className="p-5 rounded-3xl border cursor-pointer hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Map className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Personal Growth Map
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Interactive network linking your {interests.length} interests, {confirmedSkills.length} confirmed skills, and {ambitions.length} ambitions.
                </p>
              </div>
              <div className="pt-2 border-t flex items-center justify-between text-xs font-bold text-purple-600" style={{ borderColor: 'var(--border-subtle)' }}>
                <span>Explore Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Quick Card 2: AI Skill Pathways */}
            <div 
              onClick={() => setActiveTab('pathways')}
              className="p-5 rounded-3xl border cursor-pointer hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  AI Skill Pathways
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Deconstruct complex skills (Python, public speaking, research) into {skillPathways.length} active curated roadmaps.
                </p>
              </div>
              <div className="pt-2 border-t flex items-center justify-between text-xs font-bold text-emerald-600" style={{ borderColor: 'var(--border-subtle)' }}>
                <span>Generate Pathway</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Quick Card 3: Skill Gap Detector */}
            <div 
              onClick={() => setActiveTab('skill_gap')}
              className="p-5 rounded-3xl border cursor-pointer hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Skill Gap Detector
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Benchmark your confirmed skills against ambitions to pinpoint exact prerequisites.
                </p>
              </div>
              <div className="pt-2 border-t flex items-center justify-between text-xs font-bold text-amber-600" style={{ borderColor: 'var(--border-subtle)' }}>
                <span>Detect Gaps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Quick Idea Launchpad Card */}
          {ideaItems.length > 0 && (
            <div 
              className="p-5 rounded-3xl border space-y-3"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Rocket className="w-4 h-4 text-rose-500" />
                  <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                    Ideas Ready for Launch ({ideaItems.length})
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('launchpad')}
                  className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center space-x-1"
                >
                  <span>Open Launchpad</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ideaItems.slice(0, 3).map(idea => (
                  <div
                    key={idea.id}
                    onClick={() => {
                      setSelectedIdeaId(idea.id);
                      setActiveTab('launchpad');
                    }}
                    className="p-3.5 rounded-2xl border cursor-pointer hover:border-[var(--accent-primary)] transition-all space-y-1.5"
                    style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                      {idea.title}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">
                      {idea.description || 'Captured project concept.'}
                    </p>
                    <div className="text-[10px] font-semibold text-rose-500 pt-1">
                      Click to build roadmap &rarr;
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: PERSONAL GROWTH MAP */}
      {/* ==================================================== */}
      {activeTab === 'growth_map' && (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-3xl border space-y-4"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <h2 className="font-bold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
                  Interactive Personal Growth Map
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Explore how your skills, passions, ambitions, and goals interconnect.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowAddSkillModal(true)}
                  className="px-3 py-1.5 rounded-xl border text-xs font-semibold hover:bg-[var(--bg-card-subtle)] text-[var(--text-primary)] flex items-center space-x-1"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <Plus className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  <span>+ Confirmed Skill</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Filter:</span>
              {[
                { id: 'all', label: 'All Dimensions' },
                { id: 'skills', label: `Confirmed Skills (${confirmedSkills.length})` },
                { id: 'interests', label: `Interests (${interests.length})` },
                { id: 'ambitions', label: `Ambitions (${ambitions.length})` },
                { id: 'goals', label: `Active Goals (${goals.length})` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setMapFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                    mapFilter === f.id 
                      ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]' 
                      : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Visual Node Cluster */}
            <div 
              className="p-6 rounded-2xl border min-h-[340px] flex flex-wrap items-center justify-center gap-3 relative overflow-hidden"
              style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
            >
              {/* Confirmed Skills */}
              {(mapFilter === 'all' || mapFilter === 'skills') && confirmedSkills.map(skill => (
                <div
                  key={'skill_' + skill}
                  onClick={() => setSelectedMapNode({
                    id: skill,
                    title: skill,
                    type: 'skill',
                    detail: 'Confirmed mastery in your personal profile.'
                  })}
                  className="px-3.5 py-2 rounded-2xl border cursor-pointer hover:scale-105 transition-all text-xs font-bold flex items-center space-x-1.5 shadow-xs"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    borderColor: 'rgba(16, 185, 129, 0.4)',
                    color: '#059669'
                  }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{skill}</span>
                </div>
              ))}

              {/* Interests */}
              {(mapFilter === 'all' || mapFilter === 'interests') && interests.map(item => (
                <div
                  key={'interest_' + item.id}
                  onClick={() => setSelectedMapNode({
                    id: item.id,
                    title: item.name,
                    type: 'interest',
                    detail: `Core interest saved under category "${item.category}". Explore pathways to build mastery.`
                  })}
                  className="px-3.5 py-2 rounded-2xl border cursor-pointer hover:scale-105 transition-all text-xs font-bold flex items-center space-x-1.5 shadow-xs"
                  style={{
                    backgroundColor: 'rgba(20, 184, 166, 0.12)',
                    borderColor: 'rgba(20, 184, 166, 0.4)',
                    color: '#0d9488'
                  }}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </div>
              ))}

              {/* Ambitions */}
              {(mapFilter === 'all' || mapFilter === 'ambitions') && ambitions.map(amb => (
                <div
                  key={'amb_' + amb.id}
                  onClick={() => setSelectedMapNode({
                    id: amb.id,
                    title: amb.title,
                    type: 'ambition',
                    detail: amb.description || 'Target ambition. You can run Skill Gap analysis on this ambition.'
                  })}
                  className="px-3.5 py-2 rounded-2xl border cursor-pointer hover:scale-105 transition-all text-xs font-bold flex items-center space-x-1.5 shadow-xs"
                  style={{
                    backgroundColor: 'rgba(124, 58, 237, 0.12)',
                    borderColor: 'rgba(124, 58, 237, 0.4)',
                    color: '#7c3aed'
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{amb.title}</span>
                </div>
              ))}

              {/* Goals */}
              {(mapFilter === 'all' || mapFilter === 'goals') && goals.map(goal => (
                <div
                  key={'goal_' + goal.id}
                  onClick={() => setSelectedMapNode({
                    id: goal.id,
                    title: goal.title,
                    type: 'goal',
                    detail: `Active Goal (${goal.progress}% completed). Target: ${goal.targetDate || 'Ongoing'}`
                  })}
                  className="px-3.5 py-2 rounded-2xl border cursor-pointer hover:scale-105 transition-all text-xs font-bold flex items-center space-x-1.5 shadow-xs"
                  style={{
                    backgroundColor: 'rgba(14, 165, 233, 0.12)',
                    borderColor: 'rgba(14, 165, 233, 0.4)',
                    color: '#0284c7'
                  }}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>{goal.title}</span>
                </div>
              ))}
            </div>

            {/* Selected Node Details Drawer */}
            {selectedMapNode && (
              <div 
                className="p-4 rounded-2xl border space-y-3 animate-in fade-in"
                style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center justify-between pb-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-white/40 text-[var(--accent-primary)]">
                      {selectedMapNode.type}
                    </span>
                    <h4 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                      {selectedMapNode.title}
                    </h4>
                  </div>
                  <button onClick={() => setSelectedMapNode(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-[var(--text-secondary)]">
                  {selectedMapNode.detail}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setPathwaySkill(selectedMapNode.title);
                      setActiveTab('pathways');
                    }}
                    className="px-3 py-1 rounded-xl text-xs font-semibold text-white bg-[var(--accent-primary)] hover:opacity-90 flex items-center space-x-1"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Generate Learning Pathway</span>
                  </button>

                  {selectedMapNode.type === 'skill' && (
                    <button
                      onClick={async () => {
                        await removeConfirmedSkill(selectedMapNode.title);
                        setSelectedMapNode(null);
                        showToast(`Removed "${selectedMapNode.title}" from confirmed skills.`);
                      }}
                      className="px-3 py-1 rounded-xl text-xs font-semibold border border-rose-300 text-rose-600 hover:bg-rose-50 flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Skill</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: AI SKILL PATHWAYS */}
      {/* ==================================================== */}
      {activeTab === 'pathways' && (
        <div className="space-y-6">
          {/* Pathway Generator Form */}
          <div 
            className="p-6 rounded-3xl border space-y-4"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-[var(--accent-primary)]" />
                <h2 className="font-bold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
                  Skill Pathway Generator
                </h2>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Structured into actionable milestones tailored to your available weekly study hours.
              </p>
            </div>

            <form onSubmit={handleGeneratePathway} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Skill to Master</label>
                <input
                  type="text"
                  value={pathwaySkill}
                  onChange={e => setPathwaySkill(e.target.value)}
                  placeholder="e.g. Python, Machine Learning, Guitar, Public Speaking"
                  className="w-full px-3.5 py-2 rounded-xl border text-xs focus:ring-1 focus:ring-[var(--accent-primary)] focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Target Level</label>
                <select
                  value={pathwayLevel}
                  onChange={e => setPathwayLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border text-xs focus:ring-1 focus:ring-[var(--accent-primary)] focus:outline-none capitalize"
                  style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                  Weekly Hours ({pathwayHours}h)
                </label>
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={pathwayHours}
                  onChange={e => setPathwayHours(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--accent-primary)] cursor-pointer mt-2"
                />
              </div>

              <div className="sm:col-span-4 flex items-center justify-between pt-2">
                <div className="flex flex-wrap gap-1.5 text-[11px] text-[var(--text-muted)]">
                  <span>Suggested:</span>
                  {['Python', 'Web Development', 'Guitar', 'Data Structures', 'Public Speaking'].map(s => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setPathwaySkill(s)}
                      className="px-2 py-0.5 rounded-lg border hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!pathwaySkill.trim() || isGeneratingPathway}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--accent-primary)] hover:opacity-90 disabled:opacity-50 flex items-center space-x-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGeneratingPathway ? 'Generating Pathway...' : 'Generate Pathway'}</span>
                </button>
              </div>
            </form>

            {pathwayError && (
              <div className="p-3 rounded-2xl border border-rose-300 bg-rose-50 text-rose-700 text-xs">
                {pathwayError}
              </div>
            )}
          </div>

          {/* Generated Pathway Output */}
          {generatedPathway && (
            <div 
              className="p-6 rounded-3xl border space-y-4 animate-in fade-in"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700">
                      {generatedPathway.startingLevel} level
                    </span>
                    <h3 className="font-extrabold text-base sm:text-lg" style={{ color: 'var(--text-primary)' }}>
                      {generatedPathway.skillName} Mastery Pathway
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Estimated {generatedPathway.totalWeeks} weeks @ {generatedPathway.weeklyHours} hrs/week
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSavePathway}
                    className="px-3.5 py-2 rounded-xl border text-xs font-semibold hover:bg-[var(--bg-card-subtle)] text-[var(--text-primary)] flex items-center space-x-1.5"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <Bookmark className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    <span>Save Pathway</span>
                  </button>
                </div>
              </div>

              {/* Milestones Accordion */}
              <div className="space-y-3">
                {generatedPathway.milestones.map((ms, idx) => {
                  const isExpanded = expandedMilestoneId === ms.id;
                  return (
                    <div 
                      key={ms.id}
                      className="rounded-2xl border overflow-hidden transition-all"
                      style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
                    >
                      <div 
                        onClick={() => setExpandedMilestoneId(isExpanded ? null : ms.id)}
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-white text-[11px] font-black flex items-center justify-center">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm" style={{ color: 'var(--text-primary)' }}>
                              {ms.title}
                            </h4>
                            <span className="text-[11px] text-[var(--text-muted)]">
                              ~{ms.estimatedHours} hours of practice ({ms.durationWeeks} weeks)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConvertMilestone(idx);
                            }}
                            className="px-3 py-1 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-1 shadow-xs"
                            title="Add this milestone as an active goal in Goal Tracker"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Goals</span>
                          </button>
                          <ChevronRight className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 pt-0 space-y-3 border-t text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
                          <p className="text-[var(--text-secondary)] mt-3">
                            {ms.objective}
                          </p>

                          <div>
                            <span className="font-bold text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Key Activities:</span>
                            <ul className="mt-1 space-y-1">
                              {ms.recommendedActivities.map((act, i) => (
                                <li key={i} className="flex items-start space-x-2 text-[var(--text-primary)]">
                                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {ms.resources && ms.resources.length > 0 && (
                            <div>
                              <span className="font-bold text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Recommended Resources:</span>
                              <div className="mt-1.5 flex flex-wrap gap-2">
                                {ms.resources.map((res, i) => (
                                  <a
                                    key={i}
                                    href={res.url || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 rounded-xl border text-[11px] font-semibold flex items-center space-x-1.5 hover:bg-white dark:hover:bg-black/20 text-[var(--text-primary)]"
                                    style={{ borderColor: 'var(--border-subtle)' }}
                                  >
                                    <ExternalLink className="w-3 h-3 text-[var(--accent-primary)]" />
                                    <span>{res.name}</span>
                                    <span className="text-[10px] text-[var(--text-muted)] uppercase">({res.type})</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Saved Pathways Library */}
          {skillPathways.length > 0 && (
            <div 
              className="p-6 rounded-3xl border space-y-4"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
            >
              <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Your Saved Pathways ({skillPathways.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skillPathways.map(pw => (
                  <div
                    key={pw.id}
                    className="p-4 rounded-2xl border space-y-2 flex flex-col justify-between"
                    style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-white/40 text-[var(--accent-primary)]">
                          {pw.startingLevel}
                        </span>
                        <button
                          onClick={() => deleteSkillPathway(pw.id)}
                          className="text-[var(--text-muted)] hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="font-bold text-xs mt-1" style={{ color: 'var(--text-primary)' }}>
                        {pw.skillName}
                      </h4>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        {pw.milestones.length} milestones • {pw.totalWeeks} weeks estimated
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setGeneratedPathway(pw);
                        if (pw.milestones.length > 0) setExpandedMilestoneId(pw.milestones[0].id);
                      }}
                      className="text-xs font-bold text-[var(--accent-primary)] hover:underline self-start pt-1"
                    >
                      View Pathway &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: SKILL GAP DETECTOR */}
      {/* ==================================================== */}
      {activeTab === 'skill_gap' && (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-3xl border space-y-4"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div>
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[var(--accent-primary)]" />
                <h2 className="font-bold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
                  Skill Gap Detector
                </h2>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Benchmark your confirmed skills against ambitions to pinpoint exact prerequisites.
              </p>
            </div>

            {/* Target Ambition Selector */}
            <div className="max-w-md">
              <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Select Target Ambition</label>
              <select
                value={selectedAmbitionId}
                onChange={e => setSelectedAmbitionId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs focus:ring-1 focus:ring-[var(--accent-primary)]"
                style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              >
                {ambitions.map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
                {ambitions.length === 0 && <option value="">No ambitions defined yet</option>}
              </select>
            </div>

            {/* Gap Analysis Visualizer */}
            <div 
              className="p-6 rounded-2xl border space-y-4"
              style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-secondary)]">Analyzing Readiness For</span>
                  <h3 className="font-extrabold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
                    {targetTitle}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-sm font-black" style={{ color: 'var(--accent-primary)' }}>
                      {skillGapAnalysis.readinessPercentage}% Readiness
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {skillGapAnalysis.confirmed.length} of {requiredSkillsForTarget.length} prerequisites met
                    </span>
                  </div>
                </div>
              </div>

              {/* Two Column Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Confirmed / Ready Skills */}
                <div 
                  className="p-4 rounded-2xl border space-y-2.5"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-700">
                      Confirmed Strengths ({skillGapAnalysis.confirmed.length})
                    </h4>
                  </div>
                  {skillGapAnalysis.confirmed.length === 0 ? (
                    <p className="text-[11px] text-[var(--text-muted)]">No prerequisites currently confirmed for this target.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {skillGapAnalysis.confirmed.map(skill => (
                        <div key={skill} className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-white/60 dark:bg-black/20 text-xs font-semibold text-emerald-800 flex items-center justify-between">
                          <span>{skill}</span>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Missing / Development Areas */}
                <div 
                  className="p-4 rounded-2xl border space-y-2.5"
                  style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                >
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-amber-700">
                      Skills to Develop ({skillGapAnalysis.missing.length})
                    </h4>
                  </div>
                  {skillGapAnalysis.missing.length === 0 ? (
                    <p className="text-[11px] text-emerald-600 font-semibold">You have confirmed all prerequisites for this ambition!</p>
                  ) : (
                    <div className="space-y-2">
                      {skillGapAnalysis.missing.map(skill => (
                        <div key={skill} className="p-2.5 rounded-xl border border-amber-200 bg-white/60 dark:bg-black/20 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-bold text-amber-900 dark:text-amber-200">{skill}</span>
                            <p className="text-[10px] text-[var(--text-muted)]">Missing prerequisite</p>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => triggerPathwayForMissingSkill(skill)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-[var(--accent-primary)] hover:opacity-90 shadow-xs"
                              title="Generate a learning pathway for this skill"
                            >
                              Generate Pathway
                            </button>
                            <button
                              onClick={async () => {
                                await addConfirmedSkill(skill);
                                showToast(`Marked "${skill}" as confirmed!`);
                              }}
                              className="px-2 py-1 rounded-lg text-[10px] font-semibold border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                              title="I already know this skill"
                            >
                              I Have This
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: IDEA LAUNCHPAD */}
      {/* ==================================================== */}
      {activeTab === 'launchpad' && (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-3xl border space-y-4"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div>
              <div className="flex items-center space-x-2">
                <Rocket className="w-4 h-4 text-[var(--accent-primary)]" />
                <h2 className="font-bold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
                  Idea Launchpad
                </h2>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Incubate creative sparks into concrete, actionable project roadmaps.
              </p>
            </div>

            {ideaItems.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border space-y-3" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}>
                <p className="text-xs text-[var(--text-secondary)]">
                  You don't have any idea drafts yet. Add goals or project concepts to launch them into structured milestones here!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Choose Idea to Incubate</label>
                  <select
                    value={selectedIdeaId}
                    onChange={e => setSelectedIdeaId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border text-xs focus:ring-1 focus:ring-[var(--accent-primary)]"
                    style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  >
                    <option value="">-- Select an Idea --</option>
                    {ideaItems.map(idea => (
                      <option key={idea.id} value={idea.id}>
                        {idea.title} ({idea.stage} stage)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleDevelopIdea}
                    disabled={!selectedIdeaId || isDevelopingIdea}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--accent-primary)] hover:opacity-90 disabled:opacity-50 flex items-center space-x-2 shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isDevelopingIdea ? 'Architecting Roadmap...' : 'Develop Implementation Roadmap'}</span>
                  </button>
                </div>

                {ideaDevError && (
                  <div className="p-3 rounded-2xl border border-rose-300 bg-rose-50 text-rose-700 text-xs">
                    {ideaDevError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Developed Project Plan */}
          {developedPlan && (
            <div 
              className="p-6 rounded-3xl border space-y-4 animate-in fade-in"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-rose-50 text-rose-700">
                    Incubated Project Roadmap
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg mt-1" style={{ color: 'var(--text-primary)' }}>
                    {developedPlan.ideaTitle}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {developedPlan.objective}
                  </p>
                </div>

                <button
                  onClick={handleLaunchPlanAsGoal}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-1.5 shadow-sm shrink-0"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Launch as Active Goal</span>
                </button>
              </div>

              {/* Approaches */}
              <div 
                className="p-4 rounded-2xl border space-y-1.5"
                style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                  Recommended Approaches
                </span>
                <ul className="text-xs space-y-1" style={{ color: 'var(--text-primary)' }}>
                  {developedPlan.approaches.map((appr, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-[var(--accent-primary)] font-bold">•</span>
                      <span>{appr}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Skills & Resources */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  className="p-4 rounded-2xl border space-y-2"
                  style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Prerequisite Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {developedPlan.necessarySkills.map(skill => (
                      <span key={skill} className="px-2.5 py-0.5 rounded-full border text-[11px] font-semibold bg-white/40 text-[var(--text-primary)]" style={{ borderColor: 'var(--border-subtle)' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div 
                  className="p-4 rounded-2xl border space-y-2"
                  style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Curated Resources:
                  </span>
                  <div className="space-y-1">
                    {developedPlan.recommendedResources.map((res, i) => (
                      <div key={i} className="text-xs font-semibold text-[var(--text-primary)] flex items-center space-x-1">
                        <BookOpen className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                        <span>{res}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3-Phase Execution Roadmap */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Phased Milestones
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {developedPlan.milestones.map((ms, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-2xl border space-y-2 flex flex-col justify-between"
                      style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-secondary)]">
                          Phase {idx + 1}
                        </span>
                        <h5 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                          {ms.title}
                        </h5>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          {ms.description}
                        </p>
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                        Est: ~{ms.estimatedHours} hours
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Custom Skill Modal */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="w-full max-w-sm rounded-3xl p-5 border space-y-4 animate-in zoom-in-95 duration-150"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <h3 className="font-bold text-xs sm:text-sm" style={{ color: 'var(--text-primary)' }}>
                Add Confirmed Skill
              </h3>
              <button onClick={() => setShowAddSkillModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomSkill} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Skill Name</label>
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={e => setNewSkillInput(e.target.value)}
                  placeholder="e.g. Python, Git, Public Speaking"
                  className="w-full px-3 py-2 rounded-xl border text-xs focus:ring-1 focus:ring-[var(--accent-primary)]"
                  style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSkillModal(false)}
                  className="px-3 py-1.5 rounded-xl border text-xs text-[var(--text-secondary)]"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newSkillInput.trim()}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[var(--accent-primary)] hover:opacity-90 disabled:opacity-50"
                >
                  Confirm Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
