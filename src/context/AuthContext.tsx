import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  fbSignOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  onAuthStateChanged,
  FirebaseUser
} from '../lib/firebase';
import { 
  UserProfile, 
  WeeklyCommitment, 
  RestPeriod, 
  Interest, 
  Ambition, 
  Goal, 
  MotivationPreference, 
  NavigationPage, 
  ThemeMode, 
  AnimationPreference,
  DailyTask,
  CalendarEvent,
  DailyReflection,
  DailyReflectionQuestion,
  ReflectionAnswer,
  GrowthTreeRecord,
  AnalyzerInsight,
  FocusModeSettings,
  RescheduleSuggestion,
  TaskStatus,
  ThoughtMapSession,
  ThoughtBubble,
  IdeaItem,
  AmbitionPathway,
  VaultEntry,
  SkillPathway,
  Opportunity,
  IdeaLaunchPlan,
  SharedWellnessRecommendation
} from '../types';
import * as dataService from '../services/dataService';

interface AuthContextType {
  user: FirebaseUser | { uid: string; email: string; displayName: string } | null;
  profile: UserProfile | null;
  commitments: WeeklyCommitment[];
  restPeriods: RestPeriod[];
  interests: Interest[];
  ambitions: Ambition[];
  goals: Goal[];
  tasks: DailyTask[];
  calendarEvents: CalendarEvent[];
  dailyReflections: DailyReflection[];
  reflections: DailyReflection[];
  reflectionQuestions: DailyReflectionQuestion[];
  forestRecords: GrowthTreeRecord[];
  focusMode: FocusModeSettings;
  analyzerInsights: AnalyzerInsight[];
  rescheduleSuggestion: RescheduleSuggestion | null;
  motivationPref: MotivationPreference | null;
  thoughtSessions: ThoughtMapSession[];
  ideaItems: IdeaItem[];
  vaultEntries: VaultEntry[];
  completedGoals: Goal[];
  isLoading: boolean;
  activePage: NavigationPage;
  setActivePage: (page: NavigationPage) => void;
  theme: ThemeMode;
  resolvedTheme: 'soft-focus' | 'midnight' | 'minimal';
  setTheme: (theme: ThemeMode) => Promise<void>;
  animationPref: AnimationPreference;
  setAnimationPref: (pref: AnimationPreference) => Promise<void>;
  
  // Auth methods
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;

  // Data Actions
  completeOnboarding: (payload: {
    displayName: string;
    helpCategories: string[];
    aiConsent: boolean;
    interests: string[];
    ambitions: string[];
    motivation: { tones: string[]; length: 'short' | 'medium' | 'long' };
    commitments: WeeklyCommitment[];
    restPeriods: RestPeriod[];
    goals: Goal[];
    appearance: ThemeMode;
    animationPreference: AnimationPreference;
  }) => Promise<void>;

  updateDisplayName: (name: string) => Promise<void>;
  updateAiConsent: (consent: boolean) => Promise<void>;
  
  // Commitments & Rest
  addOrUpdateCommitment: (c: WeeklyCommitment) => Promise<void>;
  removeCommitment: (id: string) => Promise<void>;
  addOrUpdateRestPeriod: (r: RestPeriod) => Promise<void>;
  removeRestPeriod: (id: string) => Promise<void>;
  
  // Goals, Milestones & Tasks
  addNewInterest: (name: string, category?: string) => Promise<void>;
  removeInterestItem: (id: string) => Promise<void>;
  addNewAmbition: (title: string, priority?: 'low' | 'medium' | 'high') => Promise<void>;
  removeAmbitionItem: (id: string) => Promise<void>;
  addNewGoal: (g: Omit<Goal, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateGoalProgress: (id: string, progress: number) => Promise<void>;
  removeGoalItem: (id: string) => Promise<void>;
  
  addOrUpdateTask: (task: DailyTask) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus, reason?: string) => Promise<void>;
  autoScheduleTask: (taskId: string) => Promise<boolean>;
  acceptRescheduleSuggestion: (suggestion: RescheduleSuggestion) => Promise<void>;
  rejectRescheduleSuggestion: () => void;
  
  // Calendar Events
  addOrUpdateCalendarEvent: (e: CalendarEvent) => Promise<void>;
  removeCalendarEvent: (id: string) => Promise<void>;

  // Daily Reflection
  saveMorningReflection: (date: string, answers: ReflectionAnswer[], priorities?: string[]) => Promise<void>;
  saveNightReflection: (date: string, answers: ReflectionAnswer[], mood?: number) => Promise<void>;
  updateQuestions: (questions: DailyReflectionQuestion[]) => Promise<void>;

  // Focus Mode
  toggleFocusMode: (settings?: Partial<FocusModeSettings>) => Promise<void>;
  setFocusMode: (settings: FocusModeSettings) => Promise<void>;

  // Analyzer
  generateAnalyzerInsights: () => Promise<void>;
  askAnalyzer: (message: string, history?: Array<{ sender: 'user' | 'analyzer'; text: string }>) => Promise<string>;
  dismissInsight: (id: string) => Promise<void>;
  acceptInsight: (id: string) => Promise<void>;

  // Motivation & Forest
  saveMotivation: (pref: MotivationPreference) => Promise<void>;
  checkAndRecordDailyTree: () => Promise<void>;

  // Step 3: Goals Archive & Portfolio
  archiveGoal: (goalId: string) => Promise<void>;
  restoreGoal: (goalId: string) => Promise<void>;

  // Step 3: Thought Sessions & Mapping
  saveThoughtSession: (session: ThoughtMapSession) => Promise<void>;
  deleteThoughtSession: (id: string) => Promise<void>;
  generateThoughtMap: (text: string) => Promise<{ nodes: ThoughtBubble[]; connections: any[] }>;

  // Step 3: Idea Bin
  saveIdeaItem: (item: IdeaItem) => Promise<void>;
  deleteIdeaItem: (id: string) => Promise<void>;
  convertIdeaToGoal: (ideaId: string) => Promise<void>;

  // Step 3: Private Vault
  saveVaultEntry: (entry: VaultEntry) => Promise<void>;
  deleteVaultEntry: (id: string) => Promise<void>;

  // Step 3: Ambition Simulator
  simulateAmbition: (title: string) => Promise<AmbitionPathway[]>;

  // Step 4 & 5: Explore, Skill Pathways & Opportunity Radar
  skillPathways: SkillPathway[];
  savedOpportunityIds: string[];
  dismissedOpportunityIds: string[];
  confirmedSkills: string[];
  sharedRecommendation: SharedWellnessRecommendation | null;
  crossFeaturePersonalizationEnabled: boolean;
  generateSkillPathway: (skillName: string, level?: string, customHours?: number, objective?: string) => Promise<SkillPathway>;
  saveSkillPathway: (pathway: SkillPathway) => Promise<void>;
  deleteSkillPathway: (id: string) => Promise<void>;
  saveOpportunity: (id: string) => Promise<void>;
  dismissOpportunity: (id: string) => Promise<void>;
  addConfirmedSkill: (skill: string) => Promise<void>;
  removeConfirmedSkill: (skill: string) => Promise<void>;
  convertPathwayMilestoneToGoal: (pathway: SkillPathway, milestoneIndex: number) => Promise<void>;
  createOpportunityGoal: (opp: Opportunity) => Promise<void>;
  developIdeaLaunchPlan: (idea: IdeaItem) => Promise<IdeaLaunchPlan>;
  toggleCrossFeaturePersonalization: (enabled: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | { uid: string; email: string; displayName: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [commitments, setCommitments] = useState<WeeklyCommitment[]>([]);
  const [restPeriods, setRestPeriods] = useState<RestPeriod[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [ambitions, setAmbitions] = useState<Ambition[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [dailyReflections, setDailyReflections] = useState<DailyReflection[]>([]);
  const [reflectionQuestions, setReflectionQuestions] = useState<DailyReflectionQuestion[]>([]);
  const [forestRecords, setForestRecords] = useState<GrowthTreeRecord[]>([]);
  const [focusMode, setFocusMode] = useState<FocusModeSettings>({
    enabled: false,
    examOrGoalTitle: 'Midterm Focus Sprint',
    prioritizeAcademicsOnly: true,
    aiScheduleAssistance: true
  });
  const [analyzerInsights, setAnalyzerInsights] = useState<AnalyzerInsight[]>([]);
  const [rescheduleSuggestion, setRescheduleSuggestion] = useState<RescheduleSuggestion | null>(null);
  const [motivationPref, setMotivationPref] = useState<MotivationPreference | null>(null);
  const [thoughtSessions, setThoughtSessions] = useState<ThoughtMapSession[]>([]);
  const [ideaItems, setIdeaItems] = useState<IdeaItem[]>([]);
  const [vaultEntries, setVaultEntries] = useState<VaultEntry[]>([]);
  
  // Explore & Opportunity Radar states
  const [skillPathways, setSkillPathways] = useState<SkillPathway[]>([]);
  const [savedOpportunityIds, setSavedOpportunityIds] = useState<string[]>(['opp_congressional_app', 'opp_gsoc']);
  const [dismissedOpportunityIds, setDismissedOpportunityIds] = useState<string[]>([]);
  const [confirmedSkills, setConfirmedSkills] = useState<string[]>(['Python Basics', 'Time Management', 'Creative Writing']);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activePage, setActivePage] = useState<NavigationPage>('home');
  const [theme, setThemeState] = useState<ThemeMode>('soft-focus');
  const [animationPref, setAnimationPrefState] = useState<AnimationPreference>('full');

  const completedGoals = useMemo(() => {
    return goals.filter(g => g.archived || g.status === 'completed');
  }, [goals]);

  const crossFeaturePersonalizationEnabled = profile?.crossFeaturePersonalizationEnabled ?? true;

  // Shared Wellness & Insights Evaluator
  const sharedRecommendation = useMemo(() => {
    if (!crossFeaturePersonalizationEnabled) return null;
    return dataService.evaluateSharedRecommendation(
      tasks,
      dailyReflections,
      restPeriods,
      commitments,
      goals
    );
  }, [crossFeaturePersonalizationEnabled, tasks, dailyReflections, restPeriods, commitments, goals]);

  // Compute resolved theme for 'system'
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const matcher = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    matcher.addEventListener('change', onChange);
    return () => matcher.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme: 'soft-focus' | 'midnight' | 'minimal' = useMemo(() => {
    if (theme === 'system') {
      return systemIsDark ? 'midnight' : 'soft-focus';
    }
    return theme;
  }, [theme, systemIsDark]);

  // Apply theme & animation preference attributes to HTML root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-motion', animationPref);
  }, [animationPref]);

  // Load user data helper
  const loadUserData = async (uid: string) => {
    try {
      const [
        loadedProfile, 
        loadedCommitments, 
        loadedRest, 
        loadedInterests, 
        loadedAmbitions, 
        loadedGoals, 
        loadedTasks,
        loadedEvents,
        loadedReflections,
        loadedQuestions,
        loadedForest,
        loadedFocus,
        loadedInsights,
        loadedMotivation,
        loadedSessions,
        loadedIdeas,
        loadedVault,
        loadedPathways,
        loadedSavedOpps,
        loadedDismissedOpps,
        loadedConfirmedSkills
      ] = await Promise.all([
        dataService.getUserProfile(uid),
        dataService.getWeeklyCommitments(uid),
        dataService.getRestPeriods(uid),
        dataService.getInterests(uid),
        dataService.getAmbitions(uid),
        dataService.getGoals(uid),
        dataService.getDailyTasks(uid),
        dataService.getCalendarEvents(uid),
        dataService.getDailyReflections(uid),
        dataService.getReflectionQuestions(uid),
        dataService.getForestRecords(uid),
        dataService.getFocusModeSettings(uid),
        dataService.getAnalyzerInsights(uid),
        dataService.getMotivationPreference(uid),
        dataService.getThoughtSessions(uid),
        dataService.getIdeaItems(uid),
        dataService.getVaultEntries(uid),
        dataService.getSkillPathways(uid),
        dataService.getSavedOpportunityIds(uid),
        dataService.getDismissedOpportunityIds(uid),
        dataService.getConfirmedSkills(uid)
      ]);

      if (loadedProfile) {
        setProfile(loadedProfile);
        if (loadedProfile.appearance) setThemeState(loadedProfile.appearance);
        if (loadedProfile.animationPreference) setAnimationPrefState(loadedProfile.animationPreference);
        if (loadedProfile.confirmedSkills && loadedProfile.confirmedSkills.length > 0) {
          setConfirmedSkills(loadedProfile.confirmedSkills);
        }
      }
      setCommitments(loadedCommitments);
      setRestPeriods(loadedRest);
      setInterests(loadedInterests);
      setAmbitions(loadedAmbitions);
      setGoals(loadedGoals);
      setTasks(loadedTasks);
      setCalendarEvents(loadedEvents);
      setDailyReflections(loadedReflections);
      setReflectionQuestions(loadedQuestions);
      setForestRecords(loadedForest);
      setFocusMode(loadedFocus);
      setAnalyzerInsights(loadedInsights);
      setMotivationPref(loadedMotivation);
      setThoughtSessions(loadedSessions);
      setIdeaItems(loadedIdeas);
      setVaultEntries(loadedVault);
      setSkillPathways(loadedPathways);
      setSavedOpportunityIds(loadedSavedOpps);
      setDismissedOpportunityIds(loadedDismissedOpps);
      if (loadedConfirmedSkills.length > 0) {
        setConfirmedSkills(loadedConfirmedSkills);
      }
    } catch (err) {
      console.warn('Error loading user data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen to Auth state and handle session persistence
  useEffect(() => {
    // 1. Check active persistent session first
    const activeSessionRaw = localStorage.getItem('bloom_active_session');
    if (activeSessionRaw) {
      try {
        const activeSession = JSON.parse(activeSessionRaw);
        setUser(activeSession);
        loadUserData(activeSession.uid);
        return;
      } catch {
        localStorage.removeItem('bloom_active_session');
      }
    }

    // 2. Check guest session if any
    const guestUserJson = localStorage.getItem('bloom_guest_session');
    if (guestUserJson) {
      try {
        const guestUser = JSON.parse(guestUserJson);
        setUser(guestUser);
        loadUserData(guestUser.uid);
        return;
      } catch {
        localStorage.removeItem('bloom_guest_session');
      }
    }

    // 3. Fallback to Firebase onAuthStateChanged
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        await loadUserData(fbUser.uid);
      } else {
        setUser(null);
        setProfile(null);
        setCommitments([]);
        setRestPeriods([]);
        setInterests([]);
        setAmbitions([]);
        setGoals([]);
        setTasks([]);
        setCalendarEvents([]);
        setDailyReflections([]);
        setForestRecords([]);
        setAnalyzerInsights([]);
        setMotivationPref(null);
        setThoughtSessions([]);
        setIdeaItems([]);
        setVaultEntries([]);
        setSkillPathways([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    if (profile && user) {
      const updated = { ...profile, appearance: newTheme };
      setProfile(updated);
      await dataService.saveUserProfile(updated);
    }
  };

  const setAnimationPref = async (newPref: AnimationPreference) => {
    setAnimationPrefState(newPref);
    if (profile && user) {
      const updated = { ...profile, animationPreference: newPref };
      setProfile(updated);
      await dataService.saveUserProfile(updated);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const authUser = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'Alex'
      };
      localStorage.setItem('bloom_active_session', JSON.stringify(authUser));
      setUser(fbUser);

      let existingProfile = await dataService.getUserProfile(fbUser.uid);
      if (!existingProfile) {
        existingProfile = {
          userId: fbUser.uid,
          displayName: fbUser.displayName || 'Alex',
          email: fbUser.email || '',
          onboardingCompleted: false,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          appearance: theme,
          animationPreference: animationPref,
          aiConsent: false,
          crossFeaturePersonalizationEnabled: true,
          confirmedSkills: ['Time Management'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await dataService.saveUserProfile(existingProfile);
      }
      setProfile(existingProfile);
      await loadUserData(fbUser.uid);
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.warn('Google sign in notice:', error?.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      let authUser: { uid: string; email: string; displayName: string } | null = null;
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        authUser = {
          uid: cred.user.uid,
          email: cleanEmail,
          displayName: cred.user.displayName || cleanEmail.split('@')[0]
        };
      } catch (fbErr: any) {
        // Check local registered accounts registry
        const localUsersRaw = localStorage.getItem('bloom_registered_users');
        const localUsers = localUsersRaw ? JSON.parse(localUsersRaw) : {};
        const registered = localUsers[cleanEmail];
        if (registered) {
          if (registered.password === pass) {
            authUser = {
              uid: registered.uid,
              email: registered.email,
              displayName: registered.displayName || registered.email.split('@')[0]
            };
          } else {
            const err: any = new Error('Invalid email or password. Please try again.');
            err.code = 'auth/invalid-credential';
            throw err;
          }
        } else {
          // If not in local registry and not in Firebase
          const err: any = new Error('Invalid email or password. Please try again.');
          err.code = 'auth/user-not-found';
          throw err;
        }
      }

      localStorage.setItem('bloom_active_session', JSON.stringify(authUser));
      setUser(authUser);
      await loadUserData(authUser.uid);
    } catch (err: any) {
      console.warn('Sign in notice:', err?.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    try {
      // 1. Check local accounts registry first to prevent duplicate accounts
      const localUsersRaw = localStorage.getItem('bloom_registered_users');
      const localUsers = localUsersRaw ? JSON.parse(localUsersRaw) : {};
      if (localUsers[cleanEmail]) {
        const err: any = new Error('An account with this email already exists. Try signing in.');
        err.code = 'auth/email-already-in-use';
        throw err;
      }

      let authUser: { uid: string; email: string; displayName: string } | null = null;

      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        await updateProfile(cred.user, { displayName: cleanName });
        authUser = {
          uid: cred.user.uid,
          email: cleanEmail,
          displayName: cleanName
        };
      } catch (firebaseErr: any) {
        // Fallback to local authentication if email provider is disabled in Firebase console
        const fallbackUid = 'usr_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
        authUser = {
          uid: fallbackUid,
          email: cleanEmail,
          displayName: cleanName
        };
      }

      // Store in accounts registry
      localUsers[cleanEmail] = {
        uid: authUser.uid,
        email: cleanEmail,
        displayName: cleanName,
        password: pass,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('bloom_registered_users', JSON.stringify(localUsers));
      localStorage.setItem('bloom_active_session', JSON.stringify(authUser));

      // 2. Initialize new profile with onboardingCompleted: false
      const newProfile: UserProfile = {
        userId: authUser.uid,
        displayName: cleanName,
        email: cleanEmail,
        onboardingCompleted: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        appearance: theme,
        animationPreference: animationPref,
        aiConsent: false,
        crossFeaturePersonalizationEnabled: true,
        confirmedSkills: ['Time Management'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dataService.saveUserProfile(newProfile);

      // Set user and profile state so onboarding gate is open
      setUser(authUser);
      setProfile(newProfile);
      await loadUserData(authUser.uid);
      setActivePage('home');
    } catch (error: any) {
      console.warn('Sign up notice:', error?.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = async () => {
    setIsLoading(true);
    const guestUid = 'guest_student_' + Math.random().toString(36).substring(2, 9);
    const guestUser = {
      uid: guestUid,
      email: 'alex.student@bloom.space',
      displayName: 'Alex'
    };
    localStorage.setItem('bloom_active_session', JSON.stringify(guestUser));
    setUser(guestUser);
    
    let currentProfile = await dataService.getUserProfile(guestUid);
    if (!currentProfile) {
      currentProfile = {
        userId: guestUid,
        displayName: 'Alex',
        email: 'alex.student@bloom.space',
        onboardingCompleted: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        appearance: 'soft-focus',
        animationPreference: 'full',
        aiConsent: true,
        crossFeaturePersonalizationEnabled: true,
        confirmedSkills: ['Time Management', 'Python Basics'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await dataService.saveUserProfile(currentProfile);
    }
    setProfile(currentProfile);
    await loadUserData(guestUid);
    setIsLoading(false);
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('bloom_active_session');
      localStorage.removeItem('bloom_guest_session');
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Firebase sign out notice:', e);
    } finally {
      setUser(null);
      setProfile(null);
      setCommitments([]);
      setRestPeriods([]);
      setInterests([]);
      setAmbitions([]);
      setGoals([]);
      setTasks([]);
      setCalendarEvents([]);
      setDailyReflections([]);
      setForestRecords([]);
      setAnalyzerInsights([]);
      setMotivationPref(null);
      setThoughtSessions([]);
      setIdeaItems([]);
      setVaultEntries([]);
      setSkillPathways([]);
      setActivePage('home');
    }
  };

  const completeOnboarding = async (payload: {
    displayName: string;
    helpCategories: string[];
    aiConsent: boolean;
    interests: string[];
    ambitions: string[];
    motivation: { tones: string[]; length: 'short' | 'medium' | 'long' };
    commitments: WeeklyCommitment[];
    restPeriods: RestPeriod[];
    goals: Goal[];
    appearance: ThemeMode;
    animationPreference: AnimationPreference;
  }) => {
    if (!user) return;
    const uid = user.uid;

    const updatedProfile: UserProfile = {
      userId: uid,
      displayName: payload.displayName || profile?.displayName || 'Alex',
      email: user.email || profile?.email || '',
      onboardingCompleted: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      appearance: payload.appearance,
      animationPreference: payload.animationPreference,
      helpCategories: payload.helpCategories,
      aiConsent: payload.aiConsent,
      aiConsentTimestamp: payload.aiConsent ? new Date().toISOString() : undefined,
      crossFeaturePersonalizationEnabled: true,
      confirmedSkills: profile?.confirmedSkills || ['Time Management', 'Goal Setting'],
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setThemeState(payload.appearance);
    setAnimationPrefState(payload.animationPreference);
    setProfile(updatedProfile);
    await dataService.saveUserProfile(updatedProfile);

    // Clear any unfinished onboarding draft
    localStorage.removeItem(`bloom_onboarding_draft_${uid}`);

    setThemeState(payload.appearance);
    setAnimationPrefState(payload.animationPreference);
    setProfile(updatedProfile);
    await dataService.saveUserProfile(updatedProfile);

    // Save commitments
    for (const c of payload.commitments) {
      await dataService.saveWeeklyCommitment({ ...c, userId: uid });
    }
    setCommitments(payload.commitments);

    // Save rest periods
    for (const r of payload.restPeriods) {
      await dataService.saveRestPeriod({ ...r, userId: uid });
    }
    setRestPeriods(payload.restPeriods);

    // Save interests
    const newInterests: Interest[] = [];
    for (const name of payload.interests) {
      const item: Interest = {
        id: 'interest_' + Math.random().toString(36).substring(2, 9),
        userId: uid,
        name,
        createdAt: new Date().toISOString()
      };
      await dataService.saveInterest(item);
      newInterests.push(item);
    }
    setInterests(newInterests);

    // Save ambitions
    const newAmbitions: Ambition[] = [];
    for (const title of payload.ambitions) {
      const item: Ambition = {
        id: 'ambition_' + Math.random().toString(36).substring(2, 9),
        userId: uid,
        title,
        priority: 'high',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      await dataService.saveAmbition(item);
      newAmbitions.push(item);
    }
    setAmbitions(newAmbitions);

    // Save goals
    for (const g of payload.goals) {
      await dataService.saveGoal({ ...g, userId: uid });
    }
    setGoals(payload.goals);

    // Seed default starter daily tasks from initial goals if any
    const todayStr = new Date().toISOString().split('T')[0];
    if (payload.goals.length > 0) {
      const starterTasks: DailyTask[] = [
        {
          id: 'task_' + Math.random().toString(36).substring(2, 9),
          userId: uid,
          goalId: payload.goals[0].id,
          title: `Initial research for ${payload.goals[0].title}`,
          scheduledDate: todayStr,
          scheduledTime: '16:00',
          estimatedDurationMinutes: 45,
          priority: 'high',
          difficulty: 'moderate',
          status: 'not_started',
          postponedCount: 0,
          createdAt: new Date().toISOString()
        }
      ];
      for (const t of starterTasks) {
        await dataService.saveDailyTask(t);
      }
      setTasks(starterTasks);
    }

    // Save motivation
    const motPref: MotivationPreference = {
      userId: uid,
      preferredTones: payload.motivation.tones,
      preferredLength: payload.motivation.length,
      likedCards: [],
      dismissedCards: [],
      savedFavorites: []
    };
    await dataService.saveMotivationPreference(motPref);
    setMotivationPref(motPref);

    setActivePage('home');
  };

  const updateDisplayName = async (name: string) => {
    if (!profile || !user) return;
    const updated = { ...profile, displayName: name, updatedAt: new Date().toISOString() };
    setProfile(updated);
    await dataService.saveUserProfile(updated);
  };

  const updateAiConsent = async (consent: boolean) => {
    if (!profile || !user) return;
    const updated: UserProfile = {
      ...profile,
      aiConsent: consent,
      aiConsentTimestamp: consent ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString()
    };
    setProfile(updated);
    await dataService.saveUserProfile(updated);
  };

  const addOrUpdateCommitment = async (c: WeeklyCommitment) => {
    if (!user) return;
    const item = { ...c, userId: user.uid };
    await dataService.saveWeeklyCommitment(item);
    setCommitments(prev => {
      const idx = prev.findIndex(x => x.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [...prev, item];
    });
  };

  const removeCommitment = async (id: string) => {
    if (!user) return;
    await dataService.deleteWeeklyCommitment(user.uid, id);
    setCommitments(prev => prev.filter(x => x.id !== id));
  };

  const addOrUpdateRestPeriod = async (r: RestPeriod) => {
    if (!user) return;
    const item = { ...r, userId: user.uid };
    await dataService.saveRestPeriod(item);
    setRestPeriods(prev => {
      const idx = prev.findIndex(x => x.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [...prev, item];
    });
  };

  const removeRestPeriod = async (id: string) => {
    if (!user) return;
    await dataService.deleteRestPeriod(user.uid, id);
    setRestPeriods(prev => prev.filter(x => x.id !== id));
  };

  const addNewInterest = async (name: string, category?: string) => {
    if (!user) return;
    const item: Interest = {
      id: 'interest_' + Math.random().toString(36).substring(2, 9),
      userId: user.uid,
      name,
      category,
      createdAt: new Date().toISOString()
    };
    await dataService.saveInterest(item);
    setInterests(prev => [...prev, item]);
  };

  const removeInterestItem = async (id: string) => {
    if (!user) return;
    await dataService.deleteInterest(user.uid, id);
    setInterests(prev => prev.filter(i => i.id !== id));
  };

  const addNewAmbition = async (title: string, priority: 'low' | 'medium' | 'high' = 'high') => {
    if (!user) return;
    const item: Ambition = {
      id: 'ambition_' + Math.random().toString(36).substring(2, 9),
      userId: user.uid,
      title,
      priority,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    await dataService.saveAmbition(item);
    setAmbitions(prev => [...prev, item]);
  };

  const removeAmbitionItem = async (id: string) => {
    if (!user) return;
    await dataService.deleteAmbition(user.uid, id);
    setAmbitions(prev => prev.filter(a => a.id !== id));
  };

  const addNewGoal = async (g: Omit<Goal, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const item: Goal = {
      ...g,
      id: 'goal_' + Math.random().toString(36).substring(2, 9),
      userId: user.uid,
      createdAt: new Date().toISOString()
    };
    await dataService.saveGoal(item);
    setGoals(prev => [...prev, item]);
  };

  const updateGoalProgress = async (id: string, progress: number) => {
    if (!user) return;
    const target = goals.find(g => g.id === id);
    if (!target) return;
    const updated: Goal = {
      ...target,
      progress: Math.min(100, Math.max(0, progress)),
      status: progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : target.status
    };
    await dataService.saveGoal(updated);
    setGoals(prev => prev.map(g => g.id === id ? updated : g));
  };

  const removeGoalItem = async (id: string) => {
    if (!user) return;
    await dataService.deleteGoal(user.uid, id);
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Daily Tasks
  const addOrUpdateTask = async (task: DailyTask) => {
    if (!user) return;
    const item = { ...task, userId: user.uid };
    await dataService.saveDailyTask(item);
    setTasks(prev => {
      const idx = prev.findIndex(t => t.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
    // Check if growth tree achievement unlocked
    setTimeout(() => {
      checkAndRecordDailyTree();
    }, 200);
  };

  const removeTask = async (id: string) => {
    if (!user) return;
    await dataService.deleteDailyTask(user.uid, id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTaskStatus = async (id: string, status: TaskStatus, reason?: string) => {
    if (!user) return;
    const target = tasks.find(t => t.id === id);
    if (!target) return;

    const isPostponedOrIncomplete = status === 'postponed' || status === 'not_completed';
    const updated: DailyTask = {
      ...target,
      status,
      completedAt: status === 'completed' ? new Date().toISOString() : undefined,
      postponedCount: isPostponedOrIncomplete ? target.postponedCount + 1 : target.postponedCount,
      postponedReasons: reason ? [...(target.postponedReasons || []), reason] : target.postponedReasons
    };

    await dataService.saveDailyTask(updated);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));

    // If marked Not Completed, automatically calculate and trigger intelligent rescheduling suggestion
    if (status === 'not_completed') {
      const suggestion = dataService.generateRescheduleSuggestion(
        updated,
        commitments,
        calendarEvents,
        restPeriods
      );
      if (suggestion) {
        setRescheduleSuggestion(suggestion);
      }
    }

    setTimeout(() => {
      checkAndRecordDailyTree();
    }, 200);
  };

  const autoScheduleTask = async (taskId: string): Promise<boolean> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return false;

    const suggestion = dataService.generateRescheduleSuggestion(
      task,
      commitments,
      calendarEvents,
      restPeriods
    );

    if (suggestion) {
      setRescheduleSuggestion(suggestion);
      return true;
    }
    return false;
  };

  const acceptRescheduleSuggestion = async (suggestion: RescheduleSuggestion) => {
    if (!user) return;
    const task = tasks.find(t => t.id === suggestion.taskId);
    if (!task) return;

    // 1. Update Task
    const updatedTask: DailyTask = {
      ...task,
      scheduledDate: suggestion.suggestedDate,
      scheduledTime: suggestion.suggestedStartTime,
      status: 'not_started'
    };
    await dataService.saveDailyTask(updatedTask);
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

    // 2. Add or update linked Calendar Event
    const newEvent: CalendarEvent = {
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      userId: user.uid,
      title: task.title,
      category: 'personal',
      date: suggestion.suggestedDate,
      startTime: suggestion.suggestedStartTime,
      endTime: suggestion.suggestedEndTime,
      isFixed: false,
      linkedTaskId: task.id,
      notes: `Rescheduled via Bloom Auto-Schedule: ${suggestion.reason}`
    };
    await dataService.saveCalendarEvent(newEvent);
    setCalendarEvents(prev => [...prev, newEvent]);

    setRescheduleSuggestion(null);
  };

  const rejectRescheduleSuggestion = () => {
    setRescheduleSuggestion(null);
  };

  // Calendar Events
  const addOrUpdateCalendarEvent = async (e: CalendarEvent) => {
    if (!user) return;
    const item = { ...e, userId: user.uid };
    await dataService.saveCalendarEvent(item);
    setCalendarEvents(prev => {
      const idx = prev.findIndex(x => x.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [...prev, item];
    });
  };

  const removeCalendarEvent = async (id: string) => {
    if (!user) return;
    await dataService.deleteCalendarEvent(user.uid, id);
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  };

  // Daily Reflection
  const saveMorningReflection = async (date: string, answers: ReflectionAnswer[], priorities?: string[]) => {
    if (!user) return;
    const existing = dailyReflections.find(r => r.date === date);
    const updated: DailyReflection = {
      id: existing?.id || 'refl_' + date,
      userId: user.uid,
      date,
      morningAnswers: answers,
      morningSubmittedAt: new Date().toISOString(),
      morningPriorities: priorities || existing?.morningPriorities,
      nightAnswers: existing?.nightAnswers,
      nightSubmittedAt: existing?.nightSubmittedAt,
      nightMood: existing?.nightMood,
      updatedAt: new Date().toISOString()
    };
    await dataService.saveDailyReflection(updated);
    setDailyReflections(prev => {
      const idx = prev.findIndex(r => r.date === date);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });
  };

  const saveNightReflection = async (date: string, answers: ReflectionAnswer[], mood?: number) => {
    if (!user) return;
    const existing = dailyReflections.find(r => r.date === date);
    const updated: DailyReflection = {
      id: existing?.id || 'refl_' + date,
      userId: user.uid,
      date,
      morningAnswers: existing?.morningAnswers,
      morningSubmittedAt: existing?.morningSubmittedAt,
      morningPriorities: existing?.morningPriorities,
      nightAnswers: answers,
      nightSubmittedAt: new Date().toISOString(),
      nightMood: mood || existing?.nightMood,
      updatedAt: new Date().toISOString()
    };
    await dataService.saveDailyReflection(updated);
    setDailyReflections(prev => {
      const idx = prev.findIndex(r => r.date === date);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });
  };

  const updateQuestions = async (questions: DailyReflectionQuestion[]) => {
    if (!user) return;
    await dataService.saveReflectionQuestions(user.uid, questions);
    setReflectionQuestions(questions);
  };

  // Focus Mode
  const updateFocusMode = async (settings: FocusModeSettings) => {
    if (!user) return;
    await dataService.saveFocusModeSettings(user.uid, settings);
    setFocusMode(settings);
  };

  const toggleFocusMode = async (settings?: Partial<FocusModeSettings>) => {
    if (!user) return;
    const updated: FocusModeSettings = {
      ...focusMode,
      ...settings,
      enabled: settings?.enabled !== undefined ? settings.enabled : !focusMode.enabled
    };
    await dataService.saveFocusModeSettings(user.uid, updated);
    setFocusMode(updated);
  };

  // Daily Tree & Forest Checker
  const checkAndRecordDailyTree = async () => {
    if (!user) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.scheduledDate === todayStr);
    if (todayTasks.length === 0) return;

    const completed = todayTasks.filter(t => t.status === 'completed');
    const pct = Math.round((completed.length / todayTasks.length) * 100);

    let stage: GrowthTreeRecord['stage'] = 'seed';
    if (pct === 100) stage = 'fully_grown';
    else if (pct >= 60) stage = 'young_tree';
    else if (pct >= 25) stage = 'sapling';
    else if (pct > 0) stage = 'sprout';

    // If fully grown (100%), save achievement to forest
    if (stage === 'fully_grown') {
      const existing = forestRecords.find(f => f.date === todayStr);
      if (!existing) {
        const newRecord: GrowthTreeRecord = {
          id: 'forest_' + todayStr,
          userId: user.uid,
          date: todayStr,
          stage: 'fully_grown',
          completedTaskCount: completed.length,
          totalTasksCount: todayTasks.length,
          percentage: 100,
          treeTitle: `Oak of Accomplishment (${todayTasks.length} tasks)`,
          taskSummaries: completed.map(t => t.title),
          savedAt: new Date().toISOString()
        };
        await dataService.saveForestRecord(newRecord);
        setForestRecords(prev => [newRecord, ...prev.filter(r => r.date !== todayStr)]);
      }
    }
  };

  // Analyzer Actions
  const generateAnalyzerInsights = async () => {
    if (!user) return;
    try {
      // Collect real activity data
      const permittedData = {
        tasksCount: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        postponedTasks: tasks.filter(t => t.status === 'postponed' || t.status === 'not_completed').length,
        postponementReasons: tasks.flatMap(t => t.postponedReasons || []),
        commitmentsCount: commitments.length,
        restPeriodsCount: restPeriods.length,
        reflectionsCount: dailyReflections.length,
        recentReflections: dailyReflections.slice(0, 3)
      };

      const res = await fetch('/api/analyzer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permittedData })
      });
      const data = await res.json();
      
      const formatted: AnalyzerInsight[] = [];

      // Check simplified 3-section format
      if (data?.biggestPattern) {
        formatted.push({
          id: 'ins_bp_' + Date.now(),
          userId: user.uid,
          type: 'productive_time',
          title: data.biggestPattern.title || 'Your Biggest Pattern',
          observation: data.biggestPattern.observation || '',
          supportingEvidence: data.biggestPattern.whySeeingThis || 'Grounded in your scheduled commitments and task logs.',
          possibleExplanation: 'Identified through your weekly rhythm and reflection notes.',
          recommendedAction: 'Keep nurturing this pattern by protecting your peak focus blocks.',
          createdAt: new Date().toISOString()
        });
      }

      if (data?.recurringObstacle) {
        formatted.push({
          id: 'ins_ro_' + Date.now(),
          userId: user.uid,
          type: 'recurring_obstacle',
          title: data.recurringObstacle.title || "What's Getting in Your Way?",
          observation: data.recurringObstacle.obstacle || '',
          supportingEvidence: data.recurringObstacle.whySeeingThis || 'Derived from recent task postponements and reflection answers.',
          possibleExplanation: 'Natural friction occurs when intensive academic blocks overlap with personal tasks.',
          recommendedAction: 'Add brief rest buffers before deep study tasks.',
          createdAt: new Date().toISOString()
        });
      }

      if (Array.isArray(data?.practicalSuggestions)) {
        data.practicalSuggestions.forEach((sug: any, idx: number) => {
          formatted.push({
            id: 'ins_sug_' + Date.now() + '_' + idx,
            userId: user.uid,
            type: 'improvement_opportunity',
            title: sug.title || 'What Could Help',
            observation: sug.suggestion || '',
            supportingEvidence: sug.whySeeingThis || 'Suggested based on your current balance.',
            possibleExplanation: 'A small adjustment can unlock substantial relief and progress.',
            recommendedAction: sug.suggestion || '',
            suggestedChange: {
              type: sug.actionType || 'buffer_rest',
              details: sug.title
            },
            createdAt: new Date().toISOString()
          });
        });
      }

      // Backward compatibility with legacy insights array
      if (formatted.length === 0 && Array.isArray(data?.insights) && data.insights.length > 0) {
        data.insights.forEach((ins: any) => {
          formatted.push({
            id: 'ins_' + Math.random().toString(36).substring(2, 9),
            userId: user.uid,
            type: ins.type || 'friction_trigger',
            title: ins.title || 'Productivity Observation',
            observation: ins.observation || '',
            supportingEvidence: ins.supportingEvidence || '',
            possibleExplanation: ins.possibleExplanation || '',
            recommendedAction: ins.recommendedAction || '',
            suggestedChange: ins.suggestedChange,
            createdAt: new Date().toISOString()
          });
        });
      }

      if (formatted.length > 0) {
        for (const ins of formatted) {
          await dataService.saveAnalyzerInsight(ins);
        }
        setAnalyzerInsights(formatted);
        return;
      }

      // Default data-driven deterministic synthesis if LLM API key not present or returns empty
      const defaultInsights: AnalyzerInsight[] = [
        {
          id: 'ins_default_1',
          userId: user.uid,
          type: 'productive_time',
          title: 'Morning Focus Momentum',
          observation: 'You consistently make your strongest headway when starting priority tasks before 1:00 PM.',
          supportingEvidence: `${tasks.filter(t => t.status === 'completed').length} completed tasks were scheduled in early or midday hours.`,
          possibleExplanation: 'Your cognitive focus is highest before afternoon classes and commitments begin.',
          recommendedAction: 'Save late mornings for your most challenging study blocks.',
          createdAt: new Date().toISOString()
        },
        {
          id: 'ins_default_2',
          userId: user.uid,
          type: 'recurring_obstacle',
          title: 'Afternoon Energy Dip',
          observation: 'Tasks scheduled right after multi-hour class blocks see more frequent postponements.',
          supportingEvidence: 'Observed across days with back-to-back lectures or tuition.',
          possibleExplanation: 'Your mind naturally needs a recovery pause after prolonged cognitive effort.',
          recommendedAction: 'Place a 20-30 minute rest or snack buffer before starting evening homework.',
          createdAt: new Date().toISOString()
        },
        {
          id: 'ins_default_3',
          userId: user.uid,
          type: 'improvement_opportunity',
          title: 'Protect Your Evening Rest',
          observation: 'Carving out protected wind-down periods improves next-morning motivation.',
          supportingEvidence: 'Correlated with positive ratings in your night reflections.',
          possibleExplanation: 'Rest is not lost time; it fuels the next day’s growth.',
          recommendedAction: 'Wrap up your final study task by 9:30 PM.',
          suggestedChange: {
            type: 'buffer_rest',
            details: 'Evening wind-down buffer'
          },
          createdAt: new Date().toISOString()
        }
      ];

      for (const ins of defaultInsights) {
        await dataService.saveAnalyzerInsight(ins);
      }
      setAnalyzerInsights(defaultInsights);
    } catch (err) {
      console.warn('generateAnalyzerInsights error:', err);
    }
  };

  const askAnalyzer = async (
    message: string, 
    history?: Array<{ sender: 'user' | 'analyzer'; text: string }>
  ): Promise<string> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      // Assemble rich authorized cross-feature context
      // STRICT PRIVACY EXCEPTION: Blurt entries, titles, and colours are completely EXCLUDED.
      const authorizedContext = {
        studentName: profile?.displayName || 'Student',
        goalsSummary: goals.filter(g => !g.archived).map(g => ({
          title: g.title,
          category: g.category,
          progress: `${g.progress}%`,
          priority: g.priority,
          status: g.status
        })),
        tasksSummary: tasks.slice(0, 15).map(t => ({
          title: t.title,
          scheduledDate: t.scheduledDate,
          scheduledTime: t.scheduledTime,
          status: t.status,
          postponedCount: t.postponedCount || 0,
          reasons: t.postponedReasons || []
        })),
        tasksCount: tasks.length,
        completedCount: tasks.filter(t => t.status === 'completed').length,
        postponedTasksCount: tasks.filter(t => t.status === 'postponed' || t.status === 'not_completed').length,
        commitments: commitments.map(c => ({
          title: c.title,
          days: (c.days || []).join(', '),
          time: `${c.startTime} - ${c.endTime}`,
          fixed: c.isFixed
        })),
        commitmentsCount: commitments.length,
        protectedRestBlocks: restPeriods.map(r => ({
          label: r.label,
          days: (r.days || []).join(', '),
          time: `${r.startTime} - ${r.endTime}`,
          protected: r.isProtected
        })),
        restBlocksCount: restPeriods.length,
        recentReflections: dailyReflections.slice(0, 4).map(r => ({
          date: r.date,
          morningPriorities: r.morningPriorities || [],
          nightMood: r.nightMood,
          morningAnswers: r.morningAnswers?.map(a => `${a.questionText}: ${a.answerText}`).slice(0, 2),
          nightAnswers: r.nightAnswers?.map(a => `${a.questionText}: ${a.answerText}`).slice(0, 2)
        })),
        treesGrown: forestRecords.length
      };

      const res = await fetch('/api/analyzer/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: history || [],
          context: authorizedContext
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      return data.reply || "I'm listening and thinking about how to best support your rhythm today. What feels most pressing right now?";
    } catch (err: any) {
      console.warn('askAnalyzer request issue:', err?.message);
      // Compassionate, grounded fallback when network or timeout happens
      const lower = message.toLowerCase();
      if (lower.includes('tired') || lower.includes('stress') || lower.includes('exhaust')) {
        return "It sounds like you're carrying a heavy load right now. Remember that rest isn't a reward for finishing everything—it's what makes sustainable progress possible. Can you carve out 15 minutes to pause?";
      }
      if (lower.includes('stuck') || lower.includes('overwhelm') || lower.includes('where')) {
        return "When everything feels overwhelming, let's make the next step as small and friction-free as possible. What's one 5-minute piece we can start with?";
      }
      return "I'm looking at your weekly schedule and reflection logs. What part of your day currently feels like it has the most friction?";
    }
  };

  const dismissInsight = async (id: string) => {
    setAnalyzerInsights(prev => prev.filter(i => i.id !== id));
  };

  const acceptInsight = async (id: string) => {
    const target = analyzerInsights.find(i => i.id === id);
    if (!target) return;
    setAnalyzerInsights(prev => prev.map(i => i.id === id ? { ...i, accepted: true } : i));
  };

  const saveMotivation = async (pref: MotivationPreference) => {
    if (!user) return;
    await dataService.saveMotivationPreference(pref);
    setMotivationPref(pref);
  };

  // Step 3: Goals Archive & Portfolio
  const archiveGoal = async (goalId: string) => {
    if (!user) return;
    const target = goals.find(g => g.id === goalId);
    if (!target) return;
    const updated: Goal = {
      ...target,
      status: 'completed',
      progress: 100,
      archived: true,
      completedAt: new Date().toISOString().split('T')[0],
      archivedAt: new Date().toISOString()
    };
    await dataService.archiveCompletedGoal(user.uid, updated);
    setGoals(prev => prev.map(g => g.id === goalId ? updated : g));
  };

  const restoreGoal = async (goalId: string) => {
    if (!user) return;
    await dataService.restoreArchivedGoal(user.uid, goalId);
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, archived: false, status: 'in_progress', progress: 85 } : g));
  };

  // Step 3: Thought Sessions & Mapping
  const saveThoughtSession = async (session: ThoughtMapSession) => {
    if (!user) return;
    await dataService.saveThoughtSession(session);
    setThoughtSessions(prev => {
      const idx = prev.findIndex(s => s.id === session.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = session;
        return copy;
      }
      return [session, ...prev];
    });
  };

  const deleteThoughtSession = async (id: string) => {
    if (!user) return;
    await dataService.deleteThoughtSession(user.uid, id);
    setThoughtSessions(prev => prev.filter(s => s.id !== id));
  };

  const generateThoughtMap = async (rawText: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch('/api/blurt/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      return {
        nodes: data.nodes || [],
        connections: data.connections || []
      };
    } catch (err) {
      console.warn('generateThoughtMap network/timeout fallback active:', err);
      // Fast client-side fallback
      const text = rawText.trim();
      const nodes: ThoughtBubble[] = [];
      const connections: any[] = [];
      
      const clauses = text
        .split(/(?:[.!?;:\n]+|\b(?:but|however|although|though|and also|as well as)\b)/i)
        .map(p => p.trim().replace(/^[,.\s-]+|[,.\s-]+$/g, ''))
        .filter(p => p.length > 3);

      clauses.forEach((p, idx) => {
        const lower = p.toLowerCase();
        let cat: any = 'idea';
        if (
          lower.includes('want to') || 
          lower.includes('learn ') || 
          lower.includes('improve ') || 
          lower.includes('participate in') ||
          lower.includes('skills') ||
          lower.includes('guitar') ||
          lower.includes('python')
        ) {
          cat = 'ambition';
        } else if (
          lower.includes('no time') || 
          lower.includes('not enough time') || 
          lower.includes('don\'t have enough time') ||
          lower.includes('stress') || 
          lower.includes('worried') ||
          lower.includes('overwhelm')
        ) {
          cat = 'concern';
        } else if (lower.includes('hard to') || lower.includes('busy') || lower.includes('stuck')) {
          cat = 'obstacle';
        }

        nodes.push({
          id: 'thought_' + Date.now() + '_' + idx,
          userId: user?.uid || 'user',
          text: p.replace(/^(i\s+want\s+to\s+|to\s+|but\s+)/i, '').replace(/^([a-z])/, m => m.toUpperCase()),
          category: cat,
          x: 100 + (idx % 2) * 260,
          y: 90 + Math.floor(idx / 2) * 140,
          approvedToShare: false,
          createdAt: new Date().toISOString()
        });
      });

      // Connect Ambition to Concern, and Concern to a Next Step
      const ambNode = nodes.find(n => n.category === 'ambition');
      const conNode = nodes.find(n => n.category === 'concern');
      if (ambNode && conNode) {
        connections.push({ fromId: ambNode.id, toId: conNode.id, label: 'challenged by' });

        const stepId = 'thought_step_' + Date.now();
        nodes.push({
          id: stepId,
          userId: user?.uid || 'user',
          text: 'Schedule 30-min weekly focused learning block',
          category: 'next_step',
          x: 520,
          y: 160,
          approvedToShare: false,
          createdAt: new Date().toISOString()
        });
        connections.push({ fromId: conNode.id, toId: stepId, label: 'addressed by' });
      }

      if (nodes.length === 0) {
        nodes.push({
          id: 'thought_' + Date.now(),
          userId: user?.uid || 'user',
          text: rawText.slice(0, 70),
          category: 'idea',
          x: 200,
          y: 150,
          approvedToShare: false,
          createdAt: new Date().toISOString()
        });
      }

      return { nodes, connections };
    }
  };

  // Step 3: Idea Bin
  const saveIdeaItem = async (item: IdeaItem) => {
    if (!user) return;
    await dataService.saveIdeaItem(item);
    setIdeaItems(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
  };

  const deleteIdeaItem = async (id: string) => {
    if (!user) return;
    await dataService.deleteIdeaItem(user.uid, id);
    setIdeaItems(prev => prev.filter(i => i.id !== id));
  };

  const convertIdeaToGoal = async (ideaId: string) => {
    if (!user) return;
    const idea = ideaItems.find(i => i.id === ideaId);
    if (!idea) return;
    const newGoal: Goal = {
      id: 'goal_' + Math.random().toString(36).substring(2, 9),
      userId: user.uid,
      title: idea.title,
      description: idea.description,
      category: 'Project',
      priority: 'medium',
      difficulty: 'moderate',
      status: 'in_progress',
      progress: 10,
      createdAt: new Date().toISOString()
    };
    await dataService.saveGoal(newGoal);
    setGoals(prev => [newGoal, ...prev]);

    const updatedIdea: IdeaItem = {
      ...idea,
      stage: 'in_progress',
      convertedGoalId: newGoal.id,
      updatedAt: new Date().toISOString()
    };
    await dataService.saveIdeaItem(updatedIdea);
    setIdeaItems(prev => prev.map(i => i.id === ideaId ? updatedIdea : i));
  };

  // Step 3: Private Vault
  const saveVaultEntry = async (entry: VaultEntry) => {
    if (!user) return;
    await dataService.saveVaultEntry(entry);
    setVaultEntries(prev => {
      const idx = prev.findIndex(v => v.id === entry.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = entry;
        return copy;
      }
      return [entry, ...prev];
    });
  };

  const deleteVaultEntry = async (id: string) => {
    if (!user) return;
    await dataService.deleteVaultEntry(user.uid, id);
    setVaultEntries(prev => prev.filter(v => v.id !== id));
  };

  // Step 3: Ambition Simulator
  const simulateAmbition = async (title: string): Promise<AmbitionPathway[]> => {
    try {
      const res = await fetch('/api/blurt/ambition-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ambitionTitle: title,
          studentContext: {
            commitmentsCount: commitments.length,
            activeGoalsCount: goals.filter(g => !g.archived).length,
            restBlocksCount: restPeriods.length
          }
        })
      });
      const data = await res.json();
      return data.pathways || [];
    } catch {
      return [];
    }
  };

  // ----------------------------------------------------
  // Step 4 & 5: Explore, Skill Pathways & Opportunity Radar
  // ----------------------------------------------------

  const generateSkillPathway = async (
    skillName: string, 
    level?: string, 
    customHours?: number,
    objective?: string
  ): Promise<SkillPathway> => {
    if (!user) throw new Error('User not authenticated');
    
    const availableHours = customHours || dataService.calculateAvailableWeeklyHours(commitments, restPeriods, goals);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 14000);

      const res = await fetch('/api/explore/pathway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName,
          targetObjective: objective || `Develop proficiency in ${skillName}`,
          startingLevel: level || 'Beginner',
          weeklyHoursAvailable: availableHours,
          commitmentsSummary: commitments.map(c => `${c.title} (${c.startTime}-${c.endTime})`),
          insightsContext: {
            recentPostponements: sharedRecommendation?.recentPostponementsCount || 0,
            activeGoalsCount: goals.filter(g => !g.archived).length
          },
          wellnessContext: {
            wellnessStatus: sharedRecommendation?.wellnessStatus || 'steady',
            protectedRestPeriodsCount: restPeriods.length
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      const newPathway: SkillPathway = {
        id: 'pathway_' + Date.now(),
        userId: user.uid,
        skillName: data.skillName || skillName,
        targetObjective: data.targetObjective || `Foundations of ${skillName}`,
        startingLevel: data.startingLevel || (level as any) || 'Beginner',
        weeklyHours: data.weeklyHours || availableHours,
        totalWeeks: data.totalWeeks || 8,
        milestones: data.milestones || [],
        insightsContextNote: data.insightsContextNote,
        wellnessContextNote: data.wellnessContextNote,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveSkillPathway(newPathway);
      return newPathway;
    } catch (err) {
      console.warn('generateSkillPathway fallback:', err);
      // Fallback pathway
      const fallbackPathway: SkillPathway = {
        id: 'pathway_' + Date.now(),
        userId: user.uid,
        skillName,
        targetObjective: objective || `Build ${skillName} capabilities sustainably`,
        startingLevel: (level as any) || 'Beginner',
        weeklyHours: availableHours,
        totalWeeks: 6,
        status: 'active',
        insightsContextNote: `Calibrated to your ${availableHours}h weekly window.`,
        wellnessContextNote: 'Protected rest periods are 100% guarded.',
        milestones: [
          {
            id: 'm_step_1',
            title: `Foundations of ${skillName}`,
            objective: `Understand the core principles and set up initial learning tools.`,
            estimatedHours: Math.round(availableHours * 2),
            durationWeeks: 2,
            recommendedActivities: [
              `Complete 3 foundational guides or tutorials`,
              `Set up a dedicated practice folder or environment`,
              `Practice 30 minutes, 3 times per week`
            ],
            resources: [{ name: 'Official Starter Guide & Documentation', type: 'doc' }],
            status: 'pending'
          },
          {
            id: 'm_step_2',
            title: `Practical Milestone Project`,
            objective: `Create a small, tangible deliverable showcasing your grasp of ${skillName}.`,
            estimatedHours: Math.round(availableHours * 3),
            durationWeeks: 3,
            recommendedActivities: [
              `Draft and outline project scope`,
              `Implement core functionality or practical exercises`,
              `Self-review against rubric or criteria`
            ],
            resources: [{ name: 'Practical Problem-Solving Walkthrough', type: 'tutorial' }],
            status: 'pending'
          },
          {
            id: 'm_step_3',
            title: `Refinement & Portfolio Record`,
            objective: `Refine your work, document lessons learned, and archive to Portfolio.`,
            estimatedHours: Math.round(availableHours * 1),
            durationWeeks: 1,
            recommendedActivities: [
              `Polish final project deliverable`,
              `Add accomplishment to Bloom Portfolio`
            ],
            resources: [{ name: 'Project Presentation Guidelines', type: 'doc' }],
            status: 'pending'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveSkillPathway(fallbackPathway);
      return fallbackPathway;
    }
  };

  const saveSkillPathway = async (pathway: SkillPathway) => {
    if (!user) return;
    await dataService.saveSkillPathway(pathway);
    setSkillPathways(prev => {
      const idx = prev.findIndex(p => p.id === pathway.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = pathway;
        return copy;
      }
      return [pathway, ...prev];
    });
  };

  const deleteSkillPathway = async (id: string) => {
    if (!user) return;
    await dataService.deleteSkillPathway(user.uid, id);
    setSkillPathways(prev => prev.filter(p => p.id !== id));
  };

  const saveOpportunity = async (id: string) => {
    if (!user) return;
    await dataService.saveOpportunityId(user.uid, id);
    setSavedOpportunityIds(prev => Array.from(new Set([id, ...prev])));
    setDismissedOpportunityIds(prev => prev.filter(x => x !== id));
  };

  const dismissOpportunity = async (id: string) => {
    if (!user) return;
    await dataService.dismissOpportunityId(user.uid, id);
    setDismissedOpportunityIds(prev => Array.from(new Set([...prev, id])));
    setSavedOpportunityIds(prev => prev.filter(x => x !== id));
  };

  const addConfirmedSkill = async (skill: string) => {
    if (!user || !skill.trim()) return;
    const cleanSkill = skill.trim();
    if (confirmedSkills.includes(cleanSkill)) return;
    const updated = [...confirmedSkills, cleanSkill];
    setConfirmedSkills(updated);
    await dataService.saveConfirmedSkills(user.uid, updated);
  };

  const removeConfirmedSkill = async (skill: string) => {
    if (!user) return;
    const updated = confirmedSkills.filter(s => s !== skill);
    setConfirmedSkills(updated);
    await dataService.saveConfirmedSkills(user.uid, updated);
  };

  const convertPathwayMilestoneToGoal = async (pathway: SkillPathway, milestoneIndex: number) => {
    if (!user) return;
    const milestone = pathway.milestones[milestoneIndex];
    if (!milestone) return;

    // 1. Create a linked Goal in Goal Tracker
    const newGoal: Goal = {
      id: 'goal_' + Math.random().toString(36).substring(2, 9),
      userId: user.uid,
      title: `${pathway.skillName}: ${milestone.title}`,
      description: milestone.objective,
      category: 'Skill Development',
      priority: 'high',
      difficulty: pathway.startingLevel === 'Advanced' ? 'challenging' : 'moderate',
      estimatedEffort: `${pathway.weeklyHours} hrs/week over ${milestone.durationWeeks} weeks`,
      status: 'in_progress',
      progress: 0,
      createdAt: new Date().toISOString()
    };
    await addNewGoal(newGoal);

    // 2. Schedule initial starter daily task for this milestone
    const todayStr = new Date().toISOString().split('T')[0];
    const starterTask: DailyTask = {
      id: 'task_' + Math.random().toString(36).substring(2, 9),
      userId: user.uid,
      goalId: newGoal.id,
      title: milestone.recommendedActivities[0] || `Start ${milestone.title}`,
      scheduledDate: todayStr,
      scheduledTime: '16:30',
      estimatedDurationMinutes: Math.min(60, Math.round(pathway.weeklyHours * 60 / 3)),
      priority: 'high',
      difficulty: 'moderate',
      status: 'not_started',
      postponedCount: 0,
      createdAt: new Date().toISOString()
    };
    await addOrUpdateTask(starterTask);

    // 3. Mark milestone as in_progress with linked goal ID
    const updatedMilestones = [...pathway.milestones];
    updatedMilestones[milestoneIndex] = {
      ...milestone,
      status: 'in_progress',
      convertedGoalId: newGoal.id,
      convertedTaskId: starterTask.id
    };

    const updatedPathway: SkillPathway = {
      ...pathway,
      milestones: updatedMilestones,
      updatedAt: new Date().toISOString()
    };
    await saveSkillPathway(updatedPathway);
  };

  const createOpportunityGoal = async (opp: Opportunity) => {
    if (!user) return;
    const newGoal: Goal = {
      id: 'goal_' + Math.random().toString(36).substring(2, 9),
      userId: user.uid,
      title: `Prepare for ${opp.name}`,
      description: `Submission deadline: ${opp.deadline}. Official source: ${opp.officialSource}`,
      category: 'Competitions & Opportunities',
      priority: 'high',
      difficulty: 'moderate',
      estimatedEffort: opp.estimatedCommitment,
      status: 'in_progress',
      progress: 0,
      createdAt: new Date().toISOString()
    };
    await addNewGoal(newGoal);

    // Create initial task
    const todayStr = new Date().toISOString().split('T')[0];
    const prepTask: DailyTask = {
      id: 'task_' + Math.random().toString(36).substring(2, 9),
      userId: user.uid,
      goalId: newGoal.id,
      title: `Review eligibility & guidelines for ${opp.name}`,
      scheduledDate: todayStr,
      scheduledTime: '17:00',
      estimatedDurationMinutes: 45,
      priority: 'high',
      difficulty: 'easy',
      status: 'not_started',
      postponedCount: 0,
      createdAt: new Date().toISOString()
    };
    await addOrUpdateTask(prepTask);
  };

  const developIdeaLaunchPlan = async (idea: IdeaItem): Promise<IdeaLaunchPlan> => {
    try {
      const res = await fetch('/api/explore/develop-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaTitle: idea.title,
          ideaDescription: idea.description,
          studentContext: {
            commitmentsCount: commitments.length,
            freeWeeklyHours: dataService.calculateAvailableWeeklyHours(commitments, restPeriods, goals)
          }
        })
      });
      const data = await res.json();
      return {
        id: 'launch_' + Date.now(),
        ideaId: idea.id,
        ideaTitle: idea.title,
        objective: data.objective || `Build ${idea.title}`,
        necessarySkills: data.necessarySkills || ['Planning', 'Prototyping', 'Testing'],
        approaches: data.approaches || ['Lightweight Prototype', 'Feedback Iteration'],
        recommendedResources: data.recommendedResources || ['Open-source tools', 'Student project templates'],
        milestones: data.milestones || [],
        estimatedTotalWeeks: data.estimatedTotalWeeks || 6,
        createdAt: new Date().toISOString()
      };
    } catch {
      return {
        id: 'launch_' + Date.now(),
        ideaId: idea.id,
        ideaTitle: idea.title,
        objective: `Turn ${idea.title} into an active student project`,
        necessarySkills: ['Project Planning', 'Core Subject Fundamentals', 'Prototyping & Testing', 'Documentation'],
        approaches: [
          'Lean MVP Approach: Build a minimal working prototype first and gather peer feedback',
          'Research-First Approach: Analyze existing solutions and document unique differentiators'
        ],
        recommendedResources: [
          'GitHub / Free Student Hosting for tools and distribution',
          'Notion / Google Docs for structured research documentation'
        ],
        milestones: [
          { title: 'Phase 1: Research & Outline', description: 'Define target audience and core requirements', estimatedHours: 4 },
          { title: 'Phase 2: Prototype Development', description: 'Build the primary deliverable or MVP', estimatedHours: 8 },
          { title: 'Phase 3: Refinement & Portfolio', description: 'Document outcomes and record in Portfolio', estimatedHours: 4 }
        ],
        estimatedTotalWeeks: 6,
        createdAt: new Date().toISOString()
      };
    }
  };

  const toggleCrossFeaturePersonalization = async (enabled: boolean) => {
    if (!profile || !user) return;
    const updated: UserProfile = {
      ...profile,
      crossFeaturePersonalizationEnabled: enabled,
      updatedAt: new Date().toISOString()
    };
    setProfile(updated);
    await dataService.saveUserProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        commitments,
        restPeriods,
        interests,
        ambitions,
        goals,
        tasks,
        calendarEvents,
        dailyReflections,
        reflectionQuestions,
        forestRecords,
        focusMode,
        analyzerInsights,
        rescheduleSuggestion,
        motivationPref,
        isLoading,
        activePage,
        setActivePage,
        theme,
        resolvedTheme,
        setTheme,
        animationPref,
        setAnimationPref,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsGuest,
        signOut,
        completeOnboarding,
        updateDisplayName,
        updateAiConsent,
        addOrUpdateCommitment,
        removeCommitment,
        addOrUpdateRestPeriod,
        removeRestPeriod,
        addNewInterest,
        removeInterestItem,
        addNewAmbition,
        removeAmbitionItem,
        addNewGoal,
        updateGoalProgress,
        removeGoalItem,
        addOrUpdateTask,
        removeTask,
        updateTaskStatus,
        autoScheduleTask,
        acceptRescheduleSuggestion,
        rejectRescheduleSuggestion,
        addOrUpdateCalendarEvent,
        removeCalendarEvent,
        saveMorningReflection,
        saveNightReflection,
        updateQuestions,
        toggleFocusMode,
        setFocusMode: updateFocusMode,
        reflections: dailyReflections,
        generateAnalyzerInsights,
        askAnalyzer,
        dismissInsight,
        acceptInsight,
        saveMotivation,
        checkAndRecordDailyTree,
        thoughtSessions,
        ideaItems,
        vaultEntries,
        completedGoals,
        archiveGoal,
        restoreGoal,
        saveThoughtSession,
        deleteThoughtSession,
        generateThoughtMap,
        saveIdeaItem,
        deleteIdeaItem,
        convertIdeaToGoal,
        saveVaultEntry,
        deleteVaultEntry,
        simulateAmbition,

        // Step 4 & 5: Explore & Opportunity Radar
        skillPathways,
        savedOpportunityIds,
        dismissedOpportunityIds,
        confirmedSkills,
        sharedRecommendation,
        crossFeaturePersonalizationEnabled,
        generateSkillPathway,
        saveSkillPathway,
        deleteSkillPathway,
        saveOpportunity,
        dismissOpportunity,
        addConfirmedSkill,
        removeConfirmedSkill,
        convertPathwayMilestoneToGoal,
        createOpportunityGoal,
        developIdeaLaunchPlan,
        toggleCrossFeaturePersonalization
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
