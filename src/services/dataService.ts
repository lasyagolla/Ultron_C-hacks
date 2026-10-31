import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  OperationType, 
  handleFirestoreError 
} from '../lib/firebase';
import { 
  UserProfile, 
  WeeklyCommitment, 
  RestPeriod, 
  Interest, 
  Ambition, 
  Goal, 
  MotivationPreference,
  DailyTask,
  CalendarEvent,
  DailyReflection,
  DailyReflectionQuestion,
  GrowthTreeRecord,
  AnalyzerInsight,
  FocusModeSettings,
  RescheduleSuggestion,
  DayOfWeek,
  ThoughtMapSession,
  ThoughtBubble,
  IdeaItem,
  VaultEntry,
  SkillPathway,
  Opportunity,
  IdeaLaunchPlan,
  SharedWellnessRecommendation,
  JournalSecurityConfig,
  EncryptedJournalEntry
} from '../types';

const LOCAL_STORAGE_PREFIX = 'bloom_app_';

// Helper for local storage resilience
function getLocalItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage write skipped:', err);
  }
}

// User Profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      setLocalItem(`profile_${userId}`, data);
      return data;
    }
    return getLocalItem<UserProfile>(`profile_${userId}`);
  } catch (error) {
    return getLocalItem<UserProfile>(`profile_${userId}`);
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  setLocalItem(`profile_${profile.userId}`, profile);
  try {
    await setDoc(doc(db, 'users', profile.userId), {
      ...profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore saveUserProfile fallback:', error);
  }
}

// Weekly Commitments
export async function getWeeklyCommitments(userId: string): Promise<WeeklyCommitment[]> {
  try {
    const colRef = collection(db, 'users', userId, 'commitments');
    const snap = await getDocs(colRef);
    const list: WeeklyCommitment[] = [];
    snap.forEach((d) => list.push(d.data() as WeeklyCommitment));
    setLocalItem(`commitments_${userId}`, list);
    return list;
  } catch (error) {
    return getLocalItem<WeeklyCommitment[]>(`commitments_${userId}`) || [];
  }
}

export async function saveWeeklyCommitment(commitment: WeeklyCommitment): Promise<void> {
  const userId = commitment.userId;
  const current = getLocalItem<WeeklyCommitment[]>(`commitments_${userId}`) || [];
  const idx = current.findIndex(c => c.id === commitment.id);
  if (idx >= 0) {
    current[idx] = commitment;
  } else {
    current.push(commitment);
  }
  setLocalItem(`commitments_${userId}`, current);

  try {
    await setDoc(doc(db, 'users', userId, 'commitments', commitment.id), commitment, { merge: true });
  } catch (error) {
    console.warn('Firestore saveWeeklyCommitment fallback:', error);
  }
}

export async function deleteWeeklyCommitment(userId: string, commitmentId: string): Promise<void> {
  const current = getLocalItem<WeeklyCommitment[]>(`commitments_${userId}`) || [];
  setLocalItem(`commitments_${userId}`, current.filter(c => c.id !== commitmentId));

  try {
    await deleteDoc(doc(db, 'users', userId, 'commitments', commitmentId));
  } catch (error) {
    console.warn('Firestore deleteWeeklyCommitment fallback:', error);
  }
}

// Protected Rest Periods
export async function getRestPeriods(userId: string): Promise<RestPeriod[]> {
  try {
    const colRef = collection(db, 'users', userId, 'restPeriods');
    const snap = await getDocs(colRef);
    const list: RestPeriod[] = [];
    snap.forEach((d) => list.push(d.data() as RestPeriod));
    setLocalItem(`rest_${userId}`, list);
    return list;
  } catch (error) {
    return getLocalItem<RestPeriod[]>(`rest_${userId}`) || [];
  }
}

export async function saveRestPeriod(restPeriod: RestPeriod): Promise<void> {
  const userId = restPeriod.userId;
  const current = getLocalItem<RestPeriod[]>(`rest_${userId}`) || [];
  const idx = current.findIndex(r => r.id === restPeriod.id);
  if (idx >= 0) {
    current[idx] = restPeriod;
  } else {
    current.push(restPeriod);
  }
  setLocalItem(`rest_${userId}`, current);

  try {
    await setDoc(doc(db, 'users', userId, 'restPeriods', restPeriod.id), restPeriod, { merge: true });
  } catch (error) {
    console.warn('Firestore saveRestPeriod fallback:', error);
  }
}

export async function deleteRestPeriod(userId: string, id: string): Promise<void> {
  const current = getLocalItem<RestPeriod[]>(`rest_${userId}`) || [];
  setLocalItem(`rest_${userId}`, current.filter(r => r.id !== id));

  try {
    await deleteDoc(doc(db, 'users', userId, 'restPeriods', id));
  } catch (error) {
    console.warn('Firestore deleteRestPeriod fallback:', error);
  }
}

// Goals
export async function getGoals(userId: string): Promise<Goal[]> {
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'goals'));
    const list: Goal[] = [];
    snap.forEach(d => list.push(d.data() as Goal));
    setLocalItem(`goals_${userId}`, list);
    return list;
  } catch {
    return getLocalItem<Goal[]>(`goals_${userId}`) || [];
  }
}

export async function saveGoal(goal: Goal): Promise<void> {
  const current = getLocalItem<Goal[]>(`goals_${goal.userId}`) || [];
  const idx = current.findIndex(g => g.id === goal.id);
  if (idx >= 0) current[idx] = goal;
  else current.push(goal);
  setLocalItem(`goals_${goal.userId}`, current);

  try {
    await setDoc(doc(db, 'users', goal.userId, 'goals', goal.id), goal, { merge: true });
  } catch (error) {
    console.warn('Firestore saveGoal fallback:', error);
  }
}

export async function deleteGoal(userId: string, id: string): Promise<void> {
  const current = getLocalItem<Goal[]>(`goals_${userId}`) || [];
  setLocalItem(`goals_${userId}`, current.filter(g => g.id !== id));

  try {
    await deleteDoc(doc(db, 'users', userId, 'goals', id));
  } catch (error) {
    console.warn('Firestore deleteGoal fallback:', error);
  }
}

// Daily Tasks
export async function getDailyTasks(userId: string): Promise<DailyTask[]> {
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'tasks'));
    const list: DailyTask[] = [];
    snap.forEach(d => list.push(d.data() as DailyTask));
    setLocalItem(`tasks_${userId}`, list);
    return list;
  } catch {
    return getLocalItem<DailyTask[]>(`tasks_${userId}`) || [];
  }
}

export async function saveDailyTask(task: DailyTask): Promise<void> {
  const current = getLocalItem<DailyTask[]>(`tasks_${task.userId}`) || [];
  const idx = current.findIndex(t => t.id === task.id);
  if (idx >= 0) current[idx] = task;
  else current.push(task);
  setLocalItem(`tasks_${task.userId}`, current);

  try {
    await setDoc(doc(db, 'users', task.userId, 'tasks', task.id), task, { merge: true });
  } catch (error) {
    console.warn('Firestore saveDailyTask fallback:', error);
  }
}

export async function deleteDailyTask(userId: string, id: string): Promise<void> {
  const current = getLocalItem<DailyTask[]>(`tasks_${userId}`) || [];
  setLocalItem(`tasks_${userId}`, current.filter(t => t.id !== id));

  try {
    await deleteDoc(doc(db, 'users', userId, 'tasks', id));
  } catch (error) {
    console.warn('Firestore deleteDailyTask fallback:', error);
  }
}

// Calendar Events
export async function getCalendarEvents(userId: string): Promise<CalendarEvent[]> {
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'events'));
    const list: CalendarEvent[] = [];
    snap.forEach(d => list.push(d.data() as CalendarEvent));
    setLocalItem(`events_${userId}`, list);
    return list;
  } catch {
    return getLocalItem<CalendarEvent[]>(`events_${userId}`) || [];
  }
}

export async function saveCalendarEvent(event: CalendarEvent): Promise<void> {
  const current = getLocalItem<CalendarEvent[]>(`events_${event.userId}`) || [];
  const idx = current.findIndex(e => e.id === event.id);
  if (idx >= 0) current[idx] = event;
  else current.push(event);
  setLocalItem(`events_${event.userId}`, current);

  try {
    await setDoc(doc(db, 'users', event.userId, 'events', event.id), event, { merge: true });
  } catch (error) {
    console.warn('Firestore saveCalendarEvent fallback:', error);
  }
}

export async function deleteCalendarEvent(userId: string, id: string): Promise<void> {
  const current = getLocalItem<CalendarEvent[]>(`events_${userId}`) || [];
  setLocalItem(`events_${userId}`, current.filter(e => e.id !== id));

  try {
    await deleteDoc(doc(db, 'users', userId, 'events', id));
  } catch (error) {
    console.warn('Firestore deleteCalendarEvent fallback:', error);
  }
}

// Daily Reflections
export async function getDailyReflections(userId: string): Promise<DailyReflection[]> {
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'reflections'));
    const list: DailyReflection[] = [];
    snap.forEach(d => list.push(d.data() as DailyReflection));
    setLocalItem(`reflections_${userId}`, list);
    return list;
  } catch {
    return getLocalItem<DailyReflection[]>(`reflections_${userId}`) || [];
  }
}

export async function saveDailyReflection(reflection: DailyReflection): Promise<void> {
  const current = getLocalItem<DailyReflection[]>(`reflections_${reflection.userId}`) || [];
  const idx = current.findIndex(r => r.date === reflection.date);
  if (idx >= 0) current[idx] = reflection;
  else current.push(reflection);
  setLocalItem(`reflections_${reflection.userId}`, current);

  try {
    await setDoc(doc(db, 'users', reflection.userId, 'reflections', reflection.date), reflection, { merge: true });
  } catch (error) {
    console.warn('Firestore saveDailyReflection fallback:', error);
  }
}

// Customizable Reflection Questions
export const DEFAULT_MORNING_QUESTIONS: DailyReflectionQuestion[] = [
  { id: 'q_m_1', type: 'morning', questionText: 'What kind of a day do I aim to have?', order: 0 },
  { id: 'q_m_2', type: 'morning', questionText: 'What goals do I want to finish today?', order: 1 }
];

export const DEFAULT_NIGHT_QUESTIONS: DailyReflectionQuestion[] = [
  { id: 'q_n_1', type: 'night', questionText: 'What went well today that I want to repeat?', order: 0 },
  { id: 'q_n_2', type: 'night', questionText: 'Where did I notice friction today? What was I trying to protect?', order: 1 },
  { id: 'q_n_3', type: 'night', questionText: "How can I avoid today's mistakes from repeating tomorrow?", order: 2 }
];

export async function getReflectionQuestions(userId: string): Promise<DailyReflectionQuestion[]> {
  const cached = getLocalItem<DailyReflectionQuestion[]>(`questions_${userId}`);
  if (cached && cached.length > 0) return cached;
  const initial = [...DEFAULT_MORNING_QUESTIONS, ...DEFAULT_NIGHT_QUESTIONS];
  setLocalItem(`questions_${userId}`, initial);
  return initial;
}

export async function saveReflectionQuestions(userId: string, questions: DailyReflectionQuestion[]): Promise<void> {
  setLocalItem(`questions_${userId}`, questions);
  try {
    await setDoc(doc(db, 'users', userId, 'settings', 'reflection_questions'), { questions }, { merge: true });
  } catch (error) {
    console.warn('Firestore saveReflectionQuestions fallback:', error);
  }
}

// Growth Forest Gallery Records
export async function getForestRecords(userId: string): Promise<GrowthTreeRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'forest'));
    const list: GrowthTreeRecord[] = [];
    snap.forEach(d => list.push(d.data() as GrowthTreeRecord));
    setLocalItem(`forest_${userId}`, list);
    return list;
  } catch {
    return getLocalItem<GrowthTreeRecord[]>(`forest_${userId}`) || [];
  }
}

export async function saveForestRecord(record: GrowthTreeRecord): Promise<void> {
  const current = getLocalItem<GrowthTreeRecord[]>(`forest_${record.userId}`) || [];
  const idx = current.findIndex(f => f.date === record.date);
  if (idx >= 0) current[idx] = record;
  else current.unshift(record);
  setLocalItem(`forest_${record.userId}`, current);

  try {
    await setDoc(doc(db, 'users', record.userId, 'forest', record.date), record, { merge: true });
  } catch (error) {
    console.warn('Firestore saveForestRecord fallback:', error);
  }
}

// Focus Mode Settings
export async function getFocusModeSettings(userId: string): Promise<FocusModeSettings> {
  const cached = getLocalItem<FocusModeSettings>(`focus_${userId}`);
  if (cached) return cached;
  const defaultSettings: FocusModeSettings = {
    enabled: false,
    examOrGoalTitle: 'Midterm Focus Sprint',
    prioritizeAcademicsOnly: true,
    aiScheduleAssistance: true
  };
  setLocalItem(`focus_${userId}`, defaultSettings);
  return defaultSettings;
}

export async function saveFocusModeSettings(userId: string, settings: FocusModeSettings): Promise<void> {
  setLocalItem(`focus_${userId}`, settings);
  try {
    await setDoc(doc(db, 'users', userId, 'settings', 'focus_mode'), settings, { merge: true });
  } catch (error) {
    console.warn('Firestore saveFocusModeSettings fallback:', error);
  }
}

// Analyzer Insights
export async function getAnalyzerInsights(userId: string): Promise<AnalyzerInsight[]> {
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'insights'));
    const list: AnalyzerInsight[] = [];
    snap.forEach(d => list.push(d.data() as AnalyzerInsight));
    setLocalItem(`analyzer_insights_${userId}`, list);
    return list;
  } catch {
    return getLocalItem<AnalyzerInsight[]>(`analyzer_insights_${userId}`) || [];
  }
}

export async function saveAnalyzerInsight(insight: AnalyzerInsight): Promise<void> {
  const current = getLocalItem<AnalyzerInsight[]>(`analyzer_insights_${insight.userId}`) || [];
  const idx = current.findIndex(i => i.id === insight.id);
  if (idx >= 0) current[idx] = insight;
  else current.unshift(insight);
  setLocalItem(`analyzer_insights_${insight.userId}`, current);

  try {
    await setDoc(doc(db, 'users', insight.userId, 'insights', insight.id), insight, { merge: true });
  } catch (error) {
    console.warn('Firestore saveAnalyzerInsight fallback:', error);
  }
}

// Intelligent Scheduling Algorithm (Section 6)
export function findRealisticGap(
  targetDate: string,
  durationMinutes: number,
  commitments: WeeklyCommitment[],
  events: CalendarEvent[],
  restPeriods: RestPeriod[]
): { startTime: string; endTime: string } | null {
  const dayNames: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dateObj = new Date(targetDate + 'T00:00:00');
  const dayOfWeek = dayNames[dateObj.getDay()];

  // Candidate start hours from 08:00 to 20:00 in 30-min increments
  const candidateStarts: string[] = [];
  for (let h = 8; h <= 20; h++) {
    candidateStarts.push(`${String(h).padStart(2, '0')}:00`);
    candidateStarts.push(`${String(h).padStart(2, '0')}:30`);
  }

  // Busy ranges
  const busyRanges: { start: string; end: string }[] = [];

  // Add recurring commitments for this day
  commitments.filter(c => c.days.includes(dayOfWeek)).forEach(c => {
    busyRanges.push({ start: c.startTime, end: c.endTime });
  });

  // Add existing events on this date
  events.filter(e => e.date === targetDate).forEach(e => {
    busyRanges.push({ start: e.startTime, end: e.endTime });
  });

  // Add protected rest blocks for this day
  restPeriods.filter(r => r.days.includes(dayOfWeek) && r.isProtected).forEach(r => {
    busyRanges.push({ start: r.startTime, end: r.endTime });
  });

  // Helper to convert HH:MM to minutes from midnight
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const toTimeString = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  for (const startStr of candidateStarts) {
    const startM = toMinutes(startStr);
    const endM = startM + durationMinutes;
    if (endM > 22 * 60) continue; // Do not schedule past 22:00

    const endStr = toTimeString(endM);

    // Check collision with busy ranges
    const collides = busyRanges.some(range => {
      const rStart = toMinutes(range.start);
      const rEnd = toMinutes(range.end);
      return (startM < rEnd && endM > rStart);
    });

    if (!collides) {
      return { startTime: startStr, endTime: endStr };
    }
  }

  return null;
}

// Generate Reschedule Suggestion for a Not Completed task
export function generateRescheduleSuggestion(
  task: DailyTask,
  commitments: WeeklyCommitment[],
  events: CalendarEvent[],
  restPeriods: RestPeriod[]
): RescheduleSuggestion | null {
  // Try tomorrow, day after tomorrow, etc. (up to 4 days ahead)
  const baseDate = new Date();
  for (let offset = 1; offset <= 4; offset++) {
    const candidateDate = new Date(baseDate);
    candidateDate.setDate(baseDate.getDate() + offset);
    const dateStr = candidateDate.toISOString().split('T')[0];

    const gap = findRealisticGap(
      dateStr,
      task.estimatedDurationMinutes || 45,
      commitments,
      events,
      restPeriods
    );

    if (gap) {
      return {
        taskId: task.id,
        taskTitle: task.title,
        originalDate: task.scheduledDate,
        suggestedDate: dateStr,
        suggestedStartTime: gap.startTime,
        suggestedEndTime: gap.endTime,
        reason: `Open gap identified between protected rest and fixed commitments on ${dateStr} (${gap.startTime}–${gap.endTime}).`,
        status: 'pending'
      };
    }
  }

  return null;
}

// Interests, Ambitions, Motivation from Step 1 preserved
export async function getInterests(userId: string): Promise<Interest[]> {
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'interests'));
    const list: Interest[] = [];
    snap.forEach(d => list.push(d.data() as Interest));
    setLocalItem(`interests_${userId}`, list);
    return list;
  } catch {
    return getLocalItem<Interest[]>(`interests_${userId}`) || [];
  }
}

export async function saveInterest(interest: Interest): Promise<void> {
  const current = getLocalItem<Interest[]>(`interests_${interest.userId}`) || [];
  if (!current.some(i => i.id === interest.id)) current.push(interest);
  setLocalItem(`interests_${interest.userId}`, current);
  try {
    await setDoc(doc(db, 'users', interest.userId, 'interests', interest.id), interest, { merge: true });
  } catch (error) {
    console.warn('saveInterest fallback:', error);
  }
}

export async function deleteInterest(userId: string, id: string): Promise<void> {
  const current = getLocalItem<Interest[]>(`interests_${userId}`) || [];
  setLocalItem(`interests_${userId}`, current.filter(i => i.id !== id));
  try {
    await deleteDoc(doc(db, 'users', userId, 'interests', id));
  } catch (error) {
    console.warn('deleteInterest fallback:', error);
  }
}

export async function getAmbitions(userId: string): Promise<Ambition[]> {
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'ambitions'));
    const list: Ambition[] = [];
    snap.forEach(d => list.push(d.data() as Ambition));
    setLocalItem(`ambitions_${userId}`, list);
    return list;
  } catch {
    return getLocalItem<Ambition[]>(`ambitions_${userId}`) || [];
  }
}

export async function saveAmbition(ambition: Ambition): Promise<void> {
  const current = getLocalItem<Ambition[]>(`ambitions_${ambition.userId}`) || [];
  const idx = current.findIndex(a => a.id === ambition.id);
  if (idx >= 0) current[idx] = ambition;
  else current.push(ambition);
  setLocalItem(`ambitions_${ambition.userId}`, current);
  try {
    await setDoc(doc(db, 'users', ambition.userId, 'ambitions', ambition.id), ambition, { merge: true });
  } catch (error) {
    console.warn('saveAmbition fallback:', error);
  }
}

export async function deleteAmbition(userId: string, id: string): Promise<void> {
  const current = getLocalItem<Ambition[]>(`ambitions_${userId}`) || [];
  setLocalItem(`ambitions_${userId}`, current.filter(a => a.id !== id));
  try {
    await deleteDoc(doc(db, 'users', userId, 'ambitions', id));
  } catch (error) {
    console.warn('deleteAmbition fallback:', error);
  }
}

export async function getMotivationPreference(userId: string): Promise<MotivationPreference | null> {
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'settings', 'motivation'));
    if (snap.exists()) {
      const data = snap.data() as MotivationPreference;
      setLocalItem(`motivation_${userId}`, data);
      return data;
    }
    return getLocalItem<MotivationPreference>(`motivation_${userId}`);
  } catch {
    return getLocalItem<MotivationPreference>(`motivation_${userId}`);
  }
}

export async function saveMotivationPreference(pref: MotivationPreference): Promise<void> {
  setLocalItem(`motivation_${pref.userId}`, pref);
  try {
    await setDoc(doc(db, 'users', pref.userId, 'settings', 'motivation'), pref, { merge: true });
  } catch (error) {
    console.warn('saveMotivationPreference fallback:', error);
  }
}

// ----------------------------------------------------
// Step 3: Thought Sessions, Idea Items, Vault & Goal Archive
// ----------------------------------------------------

// 1. Thought Map Sessions
export async function getThoughtSessions(userId: string): Promise<ThoughtMapSession[]> {
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'thought_sessions'));
    const list: ThoughtMapSession[] = [];
    snap.forEach(d => list.push(d.data() as ThoughtMapSession));
    setLocalItem(`thought_sessions_${userId}`, list);
    return list;
  } catch {
    return getLocalItem<ThoughtMapSession[]>(`thought_sessions_${userId}`) || [];
  }
}

export async function saveThoughtSession(session: ThoughtMapSession): Promise<void> {
  const current = getLocalItem<ThoughtMapSession[]>(`thought_sessions_${session.userId}`) || [];
  const idx = current.findIndex(s => s.id === session.id);
  if (idx >= 0) current[idx] = session;
  else current.unshift(session);
  setLocalItem(`thought_sessions_${session.userId}`, current);

  try {
    await setDoc(doc(db, 'users', session.userId, 'thought_sessions', session.id), session, { merge: true });
  } catch (error) {
    console.warn('saveThoughtSession fallback:', error);
  }
}

export async function deleteThoughtSession(userId: string, id: string): Promise<void> {
  const current = getLocalItem<ThoughtMapSession[]>(`thought_sessions_${userId}`) || [];
  setLocalItem(`thought_sessions_${userId}`, current.filter(s => s.id !== id));
  try {
    await deleteDoc(doc(db, 'users', userId, 'thought_sessions', id));
  } catch (error) {
    console.warn('deleteThoughtSession fallback:', error);
  }
}

// 2. Idea Bin Items
export async function getIdeaItems(userId: string): Promise<IdeaItem[]> {
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'idea_items'));
    const list: IdeaItem[] = [];
    snap.forEach(d => list.push(d.data() as IdeaItem));
    setLocalItem(`idea_items_${userId}`, list);
    return list;
  } catch {
    return getLocalItem<IdeaItem[]>(`idea_items_${userId}`) || [];
  }
}

export async function saveIdeaItem(item: IdeaItem): Promise<void> {
  const current = getLocalItem<IdeaItem[]>(`idea_items_${item.userId}`) || [];
  const idx = current.findIndex(i => i.id === item.id);
  if (idx >= 0) current[idx] = item;
  else current.unshift(item);
  setLocalItem(`idea_items_${item.userId}`, current);

  try {
    await setDoc(doc(db, 'users', item.userId, 'idea_items', item.id), item, { merge: true });
  } catch (error) {
    console.warn('saveIdeaItem fallback:', error);
  }
}

export async function deleteIdeaItem(userId: string, id: string): Promise<void> {
  const current = getLocalItem<IdeaItem[]>(`idea_items_${userId}`) || [];
  setLocalItem(`idea_items_${userId}`, current.filter(i => i.id !== id));
  try {
    await deleteDoc(doc(db, 'users', userId, 'idea_items', id));
  } catch (error) {
    console.warn('deleteIdeaItem fallback:', error);
  }
}

// 3. Encrypted Private Vault Entries
export async function getVaultEntries(userId: string): Promise<VaultEntry[]> {
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'vault_entries'));
    const list: VaultEntry[] = [];
    snap.forEach(d => list.push(d.data() as VaultEntry));
    setLocalItem(`vault_entries_${userId}`, list);
    return list;
  } catch {
    return getLocalItem<VaultEntry[]>(`vault_entries_${userId}`) || [];
  }
}

export async function saveVaultEntry(entry: VaultEntry): Promise<void> {
  const current = getLocalItem<VaultEntry[]>(`vault_entries_${entry.userId}`) || [];
  const idx = current.findIndex(v => v.id === entry.id);
  if (idx >= 0) current[idx] = entry;
  else current.unshift(entry);
  setLocalItem(`vault_entries_${entry.userId}`, current);

  try {
    await setDoc(doc(db, 'users', entry.userId, 'vault_entries', entry.id), entry, { merge: true });
  } catch (error) {
    console.warn('saveVaultEntry fallback:', error);
  }
}

export async function deleteVaultEntry(userId: string, id: string): Promise<void> {
  const current = getLocalItem<VaultEntry[]>(`vault_entries_${userId}`) || [];
  setLocalItem(`vault_entries_${userId}`, current.filter(v => v.id !== id));
  try {
    await deleteDoc(doc(db, 'users', userId, 'vault_entries', id));
  } catch (error) {
    console.warn('deleteVaultEntry fallback:', error);
  }
}

// 3b. Blurt: Private End-to-End Encrypted Journal Storage
export async function getJournalSecurityConfig(userId: string): Promise<JournalSecurityConfig | null> {
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'journal', 'security_config'));
    if (snap.exists()) {
      const data = snap.data() as JournalSecurityConfig;
      setLocalItem(`journal_config_${userId}`, data);
      return data;
    }
    return getLocalItem<JournalSecurityConfig>(`journal_config_${userId}`);
  } catch {
    return getLocalItem<JournalSecurityConfig>(`journal_config_${userId}`);
  }
}

export async function saveJournalSecurityConfig(config: JournalSecurityConfig): Promise<void> {
  setLocalItem(`journal_config_${config.userId}`, config);
  try {
    await setDoc(doc(db, 'users', config.userId, 'journal', 'security_config'), config, { merge: true });
  } catch (error) {
    console.warn('saveJournalSecurityConfig fallback:', error);
  }
}

export async function getEncryptedJournalEntries(userId: string): Promise<EncryptedJournalEntry[]> {
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'journal_entries'));
    const list: EncryptedJournalEntry[] = [];
    snap.forEach(d => list.push(d.data() as EncryptedJournalEntry));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setLocalItem(`journal_entries_${userId}`, list);
    return list;
  } catch {
    const cached = getLocalItem<EncryptedJournalEntry[]>(`journal_entries_${userId}`) || [];
    return cached.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function saveEncryptedJournalEntry(entry: EncryptedJournalEntry): Promise<void> {
  const current = getLocalItem<EncryptedJournalEntry[]>(`journal_entries_${entry.userId}`) || [];
  const idx = current.findIndex(e => e.id === entry.id);
  if (idx >= 0) current[idx] = entry;
  else current.unshift(entry);
  setLocalItem(`journal_entries_${entry.userId}`, current);

  try {
    await setDoc(doc(db, 'users', entry.userId, 'journal_entries', entry.id), entry, { merge: true });
  } catch (error) {
    console.warn('saveEncryptedJournalEntry fallback:', error);
  }
}

export async function deleteEncryptedJournalEntry(userId: string, id: string): Promise<void> {
  const current = getLocalItem<EncryptedJournalEntry[]>(`journal_entries_${userId}`) || [];
  setLocalItem(`journal_entries_${userId}`, current.filter(e => e.id !== id));
  try {
    await deleteDoc(doc(db, 'users', userId, 'journal_entries', id));
  } catch (error) {
    console.warn('deleteEncryptedJournalEntry fallback:', error);
  }
}

// 4. Archive Goal to Completed Portfolio
export async function archiveCompletedGoal(userId: string, goal: Goal): Promise<void> {
  const updatedGoal: Goal = {
    ...goal,
    status: 'completed',
    progress: 100,
    archived: true,
    completedAt: goal.completedAt || new Date().toISOString().split('T')[0],
    archivedAt: new Date().toISOString()
  };

  // Update in local goals list
  const current = getLocalItem<Goal[]>(`goals_${userId}`) || [];
  const idx = current.findIndex(g => g.id === goal.id);
  if (idx >= 0) current[idx] = updatedGoal;
  else current.push(updatedGoal);
  setLocalItem(`goals_${userId}`, current);

  try {
    await setDoc(doc(db, 'users', userId, 'goals', goal.id), updatedGoal, { merge: true });
  } catch (error) {
    console.warn('archiveCompletedGoal fallback:', error);
  }
}

export async function restoreArchivedGoal(userId: string, goalId: string): Promise<void> {
  const current = getLocalItem<Goal[]>(`goals_${userId}`) || [];
  const idx = current.findIndex(g => g.id === goalId);
  if (idx >= 0) {
    current[idx].archived = false;
    current[idx].status = 'in_progress';
    current[idx].progress = 90; // restore to active status
    setLocalItem(`goals_${userId}`, current);

    try {
      await setDoc(doc(db, 'users', userId, 'goals', goalId), current[idx], { merge: true });
    } catch (error) {
      console.warn('restoreArchivedGoal fallback:', error);
    }
  }
}

// ----------------------------------------------------
// Step 4 & 5: Explore, Skill Pathways & Opportunity Radar
// ----------------------------------------------------

export async function getSkillPathways(userId: string): Promise<SkillPathway[]> {
  try {
    const colRef = collection(db, 'users', userId, 'skill_pathways');
    const snap = await getDocs(colRef);
    const list: SkillPathway[] = [];
    snap.forEach(d => list.push(d.data() as SkillPathway));
    setLocalItem(`skill_pathways_${userId}`, list);
    return list;
  } catch {
    return getLocalItem<SkillPathway[]>(`skill_pathways_${userId}`) || [];
  }
}

export async function saveSkillPathway(pathway: SkillPathway): Promise<void> {
  const current = getLocalItem<SkillPathway[]>(`skill_pathways_${pathway.userId}`) || [];
  const idx = current.findIndex(p => p.id === pathway.id);
  if (idx >= 0) current[idx] = pathway;
  else current.unshift(pathway);
  setLocalItem(`skill_pathways_${pathway.userId}`, current);

  try {
    await setDoc(doc(db, 'users', pathway.userId, 'skill_pathways', pathway.id), pathway, { merge: true });
  } catch (error) {
    console.warn('saveSkillPathway fallback:', error);
  }
}

export async function deleteSkillPathway(userId: string, pathwayId: string): Promise<void> {
  const current = getLocalItem<SkillPathway[]>(`skill_pathways_${userId}`) || [];
  setLocalItem(`skill_pathways_${userId}`, current.filter(p => p.id !== pathwayId));
  try {
    await deleteDoc(doc(db, 'users', userId, 'skill_pathways', pathwayId));
  } catch (error) {
    console.warn('deleteSkillPathway fallback:', error);
  }
}

// Saved & Dismissed Opportunities
export async function getSavedOpportunityIds(userId: string): Promise<string[]> {
  const item = getLocalItem<string[]>(`saved_opps_${userId}`);
  return item || ['opp_congressional_app', 'opp_gsoc'];
}

export async function saveOpportunityId(userId: string, oppId: string): Promise<void> {
  const current = (await getSavedOpportunityIds(userId)).filter(id => id !== oppId);
  current.unshift(oppId);
  setLocalItem(`saved_opps_${userId}`, current);
}

export async function removeSavedOpportunityId(userId: string, oppId: string): Promise<void> {
  const current = (await getSavedOpportunityIds(userId)).filter(id => id !== oppId);
  setLocalItem(`saved_opps_${userId}`, current);
}

export async function getDismissedOpportunityIds(userId: string): Promise<string[]> {
  const item = getLocalItem<string[]>(`dismissed_opps_${userId}`);
  return item || [];
}

export async function dismissOpportunityId(userId: string, oppId: string): Promise<void> {
  const current = (await getDismissedOpportunityIds(userId)).filter(id => id !== oppId);
  current.push(oppId);
  setLocalItem(`dismissed_opps_${userId}`, current);
}

// Confirmed Skills
export async function getConfirmedSkills(userId: string): Promise<string[]> {
  const profile = getLocalItem<UserProfile>(`profile_${userId}`);
  if (profile?.confirmedSkills && profile.confirmedSkills.length > 0) {
    return profile.confirmedSkills;
  }
  const local = getLocalItem<string[]>(`confirmed_skills_${userId}`);
  return local || ['Python Basics', 'Creative Writing', 'Piano Practice', 'Time Management'];
}

export async function saveConfirmedSkills(userId: string, skills: string[]): Promise<void> {
  setLocalItem(`confirmed_skills_${userId}`, skills);
  const profile = getLocalItem<UserProfile>(`profile_${userId}`);
  if (profile) {
    profile.confirmedSkills = skills;
    await saveUserProfile(profile);
  }
}

// Calculate Realistic Available Free Weekly Hours (168h - Commitments - Rest - Goals)
export function calculateAvailableWeeklyHours(
  commitments: WeeklyCommitment[],
  restPeriods: RestPeriod[],
  goals: Goal[]
): number {
  let commitmentHours = 0;
  commitments.forEach(c => {
    const [sh, sm] = (c.startTime || '09:00').split(':').map(Number);
    const [eh, em] = (c.endTime || '17:00').split(':').map(Number);
    const dayDuration = (eh * 60 + em - (sh * 60 + sm)) / 60;
    commitmentHours += Math.max(0, dayDuration) * (c.days?.length || 5);
  });

  let restHours = 0;
  restPeriods.forEach(r => {
    const [sh, sm] = (r.startTime || '23:00').split(':').map(Number);
    const [eh, em] = (r.endTime || '07:00').split(':').map(Number);
    let dayDuration = (eh * 60 + em - (sh * 60 + sm)) / 60;
    if (dayDuration < 0) dayDuration += 24; // overnight sleep
    restHours += Math.max(0, dayDuration) * (r.days?.length || 7);
  });

  // Estimate 2.5 hours per active goal
  const activeGoalsHours = goals.filter(g => !g.archived && g.status === 'in_progress').length * 2.5;

  const totalOccupied = commitmentHours + restHours + activeGoalsHours;
  const rawFree = 168 - totalOccupied;

  // Ensure safe buffer for general student living (meals, commuting, unexpected school work)
  const realisticGrowthHours = Math.max(2, Math.min(12, Math.round(rawFree * 0.25 * 2) / 2));
  return realisticGrowthHours;
}

// Shared Wellness & Insights Evaluator
export function evaluateSharedRecommendation(
  tasks: DailyTask[],
  reflections: DailyReflection[],
  restPeriods: RestPeriod[],
  commitments: WeeklyCommitment[],
  goals: Goal[]
): SharedWellnessRecommendation {
  const today = new Date();
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  // Recent postponements in past 7 days
  const recentTasks = tasks.filter(t => past7Days.includes(t.scheduledDate));
  const recentPostponements = recentTasks.filter(t => 
    t.status === 'postponed' || t.status === 'not_completed' || t.postponedCount > 0
  ).length;

  // Recent mood check from reflections
  const recentReflections = reflections.filter(r => past7Days.includes(r.date) && r.nightMood !== undefined);
  const avgMood = recentReflections.length > 0 
    ? recentReflections.reduce((acc, r) => acc + (r.nightMood || 3), 0) / recentReflections.length 
    : 3.5;

  const freeHours = calculateAvailableWeeklyHours(commitments, restPeriods, goals);

  if (recentPostponements >= 2 || avgMood < 2.8) {
    const paceHours = Math.max(1.5, Math.min(3, Math.round(freeHours * 0.6 * 2) / 2));
    return {
      type: 'balanced_pace',
      title: 'Sustainable Pacing Recommended',
      message: `You've expressed exciting ambitions, but you've also navigated a demanding week (${recentPostponements} tasks postponed recently). We recommend starting with a gentle ${paceHours} hours/week pathway so you build momentum without risking overwhelm.`,
      contextExplanation: 'Derived from your recent task postponements and daily reflection logs.',
      suggestedWeeklyHours: paceHours,
      recentPostponementsCount: recentPostponements,
      wellnessStatus: avgMood < 2.5 ? 'overwhelmed' : 'fatigued',
      allowAdjustment: true
    };
  }

  if (freeHours <= 3.5) {
    return {
      type: 'protect_rest',
      title: 'Protected Rest & Compact Focus',
      message: `Your schedule has significant academic and rest commitments this week. We suggest keeping new exploratory commitments to a tight 2 to 3 hours/week to safeguard your sleep and recovery.`,
      contextExplanation: 'Evaluated against your 7-day schedule commitments and protected rest blocks.',
      suggestedWeeklyHours: Math.min(3, freeHours),
      recentPostponementsCount: recentPostponements,
      wellnessStatus: 'steady',
      allowAdjustment: true
    };
  }

  return {
    type: 'optimal_momentum',
    title: 'Balanced Momentum Available',
    message: `Your weekly schedule has balanced room for new growth. A pathway of 3.5 to 5 hours/week comfortably fits your schedule while leaving all rest periods 100% protected.`,
    contextExplanation: 'Reflects your steady completion rate and open study blocks.',
    suggestedWeeklyHours: Math.min(6, freeHours),
    recentPostponementsCount: recentPostponements,
    wellnessStatus: 'energized',
    allowAdjustment: true
  };
}

// Verified Genuine Student Opportunities Repository (Verified Sources & Deadlines)
export const VERIFIED_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp_congressional_app',
    name: 'Congressional App Challenge',
    organization: 'U.S. House of Representatives',
    category: 'competition',
    description: 'The most prestigious national student computer science competition in the U.S. Students code an app using any programming language and present a video demonstration.',
    eligibility: 'Middle and high school students residing or enrolled in participating congressional districts.',
    deadline: 'October 24 (Annual Fall Cycle)',
    officialSource: 'https://www.congressionalappchallenge.us/',
    requiredSkills: ['Basic Programming', 'App Prototyping', 'Video Presentation'],
    estimatedCommitment: '3-4 hrs/week over 6 weeks',
    whyMatches: 'Excellent stepping-stone for budding programmers and creative problem solvers.',
    tags: ['Coding', 'Mobile', 'Web', 'Civic Tech', 'Beginner-Friendly'],
    targetAgeOrGrade: 'Grades 6-12'
  },
  {
    id: 'opp_gsoc',
    name: 'Google Summer of Code (Contributor)',
    organization: 'Google Open Source',
    category: 'student_program',
    description: 'A global mentorship program introducing students and beginners to open source software development through real-world contributions.',
    eligibility: 'Students and beginner software developers aged 18+ (or 16+ where permitted by law).',
    deadline: 'April (Annual Spring Application)',
    officialSource: 'https://summerofcode.withgoogle.com/',
    requiredSkills: ['Python Basics', 'Git & GitHub', 'Open Source Collaboration'],
    estimatedCommitment: '8-12 hrs/week',
    whyMatches: 'Build verified open-source contributions with direct industry mentorship.',
    tags: ['Open Source', 'Software Development', 'Global', 'Mentorship'],
    targetAgeOrGrade: 'High School Seniors & University'
  },
  {
    id: 'opp_nasa_space_apps',
    name: 'NASA International Space Apps Challenge',
    organization: 'NASA & Global Space Agencies',
    category: 'hackathon',
    description: 'The world\'s largest annual global hackathon where students collaborate over 48 hours to solve challenges using open data from NASA and partner space agencies.',
    eligibility: 'Open to all students, coders, scientists, designers, and storytellers worldwide of any age.',
    deadline: 'October (Annual Global Hackathon)',
    officialSource: 'https://www.spaceappschallenge.org/',
    requiredSkills: ['Data Exploration', 'Problem Solving', 'Teamwork', 'Storytelling'],
    estimatedCommitment: 'Weekend Sprint + 2 weeks prep',
    whyMatches: 'Work with real NASA Earth & space datasets alongside international peers.',
    tags: ['Space', 'Science', 'Data Visualization', 'Collaborative', 'All Ages'],
    targetAgeOrGrade: 'All student levels'
  },
  {
    id: 'opp_usaco',
    name: 'USA Computing Olympiad (USACO)',
    organization: 'USACO Foundation',
    category: 'competition',
    description: 'Four annual online algorithmic programming contests (Bronze, Silver, Gold, Platinum). Open globally to all pre-college students with automated grading.',
    eligibility: 'Pre-college students worldwide; completely free participation.',
    deadline: 'December, January, February, March (4 Monthly Contests)',
    officialSource: 'http://www.usaco.org/',
    requiredSkills: ['Python, Java, or C++', 'Algorithmic Problem Solving', 'Debugging'],
    estimatedCommitment: '3-5 hrs/week practice',
    whyMatches: 'Gold-standard algorithmic thinking practice for competitive programming.',
    tags: ['Algorithms', 'Python', 'Competitive Programming', 'Mathematics'],
    targetAgeOrGrade: 'Middle & High School'
  },
  {
    id: 'opp_technovation',
    name: 'Technovation Girls Challenge',
    organization: 'Technovation Global',
    category: 'competition',
    description: 'Global tech entrepreneurship competition where young women and gender-diverse students build mobile apps or AI prototypes tackling local community problems.',
    eligibility: 'Girls and gender-diverse students aged 8-18 worldwide.',
    deadline: 'March - April (Annual Spring Submission)',
    officialSource: 'https://www.technovation.org/',
    requiredSkills: ['App Design', 'Problem Definition', 'Pitching', 'Team Collaboration'],
    estimatedCommitment: '2-4 hrs/week over 12 weeks',
    whyMatches: 'Comprehensive journey from idea inception to prototype launch with mentor guidance.',
    tags: ['Entrepreneurship', 'Social Impact', 'App Design', 'Mentorship'],
    targetAgeOrGrade: 'Ages 8-18'
  },
  {
    id: 'opp_mit_think',
    name: 'MIT THINK Scholars Program',
    organization: 'Massachusetts Institute of Technology (MIT)',
    category: 'scholarship',
    description: 'An educational outreach initiative by MIT students that funds, mentors, and supports high school students with original research proposals.',
    eligibility: 'High school students residing in the United States with an original STEM idea.',
    deadline: 'January 1 (Annual Winter Deadline)',
    officialSource: 'https://think.mit.edu/',
    requiredSkills: ['Research Writing', 'Scientific Inquiry', 'Literature Review'],
    estimatedCommitment: '3-4 hrs/week proposal prep',
    whyMatches: 'Receive $1,000 funding, an all-expenses-paid trip to MIT, and weekly mentorship.',
    tags: ['Research', 'STEM', 'Innovation', 'Mentorship'],
    targetAgeOrGrade: 'High School'
  },
  {
    id: 'opp_rise',
    name: 'Rise Challenge for Global Innovators',
    organization: 'Schmidt Futures & Rhodes Trust',
    category: 'scholarship',
    description: 'A global talent program identifying brilliant young people aged 15-17 and supporting them with personalized, lifelong scholarships and mentoring.',
    eligibility: 'Youth aged 15-17 worldwide from any background.',
    deadline: 'January (Annual Global Application)',
    officialSource: 'https://www.risefortheworld.org/',
    requiredSkills: ['Leadership', 'Social Innovation', 'Video Reflection'],
    estimatedCommitment: '2-3 hrs/week during application',
    whyMatches: 'Lifelong university scholarships, mentorship network, and technology funding.',
    tags: ['Global Scholarship', 'Leadership', 'Social Good', 'Pre-College'],
    targetAgeOrGrade: 'Ages 15-17'
  },
  {
    id: 'opp_kaggle_learn',
    name: 'Kaggle Community Competitions & Micro-Courses',
    organization: 'Kaggle / Google',
    category: 'workshop',
    description: 'Practical, beginner-friendly data science competitions and micro-courses with real-world public datasets and instant community feedback.',
    eligibility: 'Open to everyone worldwide; 100% free with in-browser GPU notebooks.',
    deadline: 'Rolling / Year-Round',
    officialSource: 'https://www.kaggle.com/competitions',
    requiredSkills: ['Basic Python', 'Pandas', 'Data Exploration'],
    estimatedCommitment: '2-3 hrs/week',
    whyMatches: 'Hands-on practice applying machine learning and analytics to real problems.',
    tags: ['Data Science', 'Python', 'Machine Learning', 'Self-Paced'],
    targetAgeOrGrade: 'All levels'
  }
];

