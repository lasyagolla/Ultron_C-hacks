/**
 * Core type definitions for Bloom personal growth & well-being application
 * Extended for Step 2: Intelligent Goal Tracking, Daily Reflection, AI Analyzer & Growth Tree
 */

export type NavigationPage = 
  | 'home' 
  | 'goals' 
  | 'blurt' 
  | 'explore' 
  | 'portfolio' 
  | 'insights' 
  | 'reflection' 
  | 'analyzer' 
  | 'progress' 
  | 'settings';

export type ThemeMode = 'soft-focus' | 'midnight' | 'minimal' | 'system';
export type AnimationPreference = 'full' | 'reduced' | 'off';

export type DayOfWeek = 
  | 'monday' 
  | 'tuesday' 
  | 'wednesday' 
  | 'thursday' 
  | 'friday' 
  | 'saturday' 
  | 'sunday';

export type CommitmentCategory = 
  | 'school' 
  | 'tuition' 
  | 'extracurricular' 
  | 'hobby' 
  | 'personal' 
  | 'other';

export type RestType = 'sleep' | 'meal' | 'break' | 'personal';

export type TaskStatus = 'not_started' | 'completed' | 'partial' | 'postponed' | 'not_completed';
export type PriorityLevel = 'low' | 'medium' | 'high';
export type DifficultyLevel = 'easy' | 'moderate' | 'challenging';

export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  onboardingCompleted: boolean;
  timezone: string;
  appearance: ThemeMode;
  animationPreference: AnimationPreference;
  helpCategories?: string[];
  aiConsent: boolean;
  aiConsentTimestamp?: string;
  crossFeaturePersonalizationEnabled?: boolean;
  confirmedSkills?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyCommitment {
  id: string;
  userId: string;
  title: string;
  category: CommitmentCategory;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  days: DayOfWeek[];
  isFixed: boolean;  // fixed vs flexible
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RestPeriod {
  id: string;
  userId: string;
  restType: RestType;
  label: string;
  startTime: string;
  endTime: string;
  days: DayOfWeek[];
  isProtected: boolean;
}

export interface Interest {
  id: string;
  userId: string;
  name: string;
  category?: string;
  source?: string;
  createdAt: string;
}

export interface Ambition {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: PriorityLevel;
  status: 'active' | 'exploring' | 'achieved' | 'paused';
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  priority: PriorityLevel;
  difficulty: DifficultyLevel;
  targetDate?: string;
  estimatedEffort?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  progress: number; // 0 - 100
  milestones?: Milestone[];
  completedAt?: string;
  archived?: boolean;
  archivedAt?: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  completionDate?: string;
}

export interface DailyTask {
  id: string;
  userId: string;
  goalId?: string;
  title: string;
  description?: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:MM
  estimatedDurationMinutes: number; // e.g. 30, 45, 60
  priority: PriorityLevel;
  difficulty: DifficultyLevel;
  status: TaskStatus;
  completedAt?: string;
  postponedCount: number;
  postponedReasons?: string[];
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  category: CommitmentCategory;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isFixed: boolean;
  linkedTaskId?: string;
  linkedGoalId?: string;
  isRecurringInstance?: boolean;
  notes?: string;
  color?: string;
}

export interface RescheduleSuggestion {
  taskId: string;
  taskTitle: string;
  originalDate: string;
  suggestedDate: string;
  suggestedStartTime: string;
  suggestedEndTime: string;
  reason: string;
  status: 'pending' | 'accepted' | 'edited' | 'rejected';
}

export interface FocusModeSettings {
  enabled: boolean;
  examOrGoalTitle: string;
  targetGoalOrExam?: string;
  startDate?: string;
  endDate?: string;
  targetDate?: string;
  linkedGoalId?: string;
  prioritizeAcademicsOnly?: boolean;
  academicPrioritization?: boolean;
  distractionReduction?: boolean;
  aiScheduleAssistance?: boolean;
  notes?: string;
}

export interface DailyReflectionQuestion {
  id: string;
  type: 'morning' | 'night';
  questionText: string;
  order: number;
}

export interface ReflectionAnswer {
  questionId: string;
  questionText: string;
  answerText: string;
}

export interface DailyReflection {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  morningAnswers?: ReflectionAnswer[];
  morningSubmittedAt?: string;
  morningPriorities?: string[];
  nightAnswers?: ReflectionAnswer[];
  nightSubmittedAt?: string;
  nightMood?: number;
  updatedAt: string;
}

export interface GrowthTreeRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  stage: 'seed' | 'sprout' | 'sapling' | 'young_tree' | 'fully_grown';
  completedTaskCount: number;
  totalTasksCount: number;
  percentage: number;
  treeTitle: string;
  taskSummaries: string[];
  savedAt: string;
}

export type AnalyzerInsightType = 
  | 'friction_trigger' 
  | 'productive_time' 
  | 'incomplete_goals' 
  | 'recurring_obstacle' 
  | 'intention_vs_reality' 
  | 'schedule_compatibility' 
  | 'protective_behavior' 
  | 'improvement_opportunity';

export interface AnalyzerInsight {
  id: string;
  userId: string;
  type: AnalyzerInsightType;
  title: string;
  observation: string;
  supportingEvidence: string;
  possibleExplanation: string;
  recommendedAction: string;
  suggestedChange?: {
    type: 'reschedule' | 'adjust_duration' | 'break_down' | 'buffer_rest';
    targetTaskId?: string;
    details?: string;
  };
  dismissed?: boolean;
  accepted?: boolean;
  createdAt: string;
}

export interface MotivationPreference {
  userId: string;
  preferredTones: string[];
  preferredLength: 'short' | 'medium' | 'long';
  likedCards: string[];
  dismissedCards: string[];
  savedFavorites: string[];
}

export interface MotivationCardItem {
  id: string;
  quote: string;
  author: string;
  tone: string;
  theme: string;
}

// ----------------------------------------------------
// Step 3: Blurt, Thought Mapping, Idea Bin & Vault
// ----------------------------------------------------

export type ThoughtCategory = 
  | 'ambition' 
  | 'idea' 
  | 'concern' 
  | 'obstacle' 
  | 'next_step' 
  | 'goal' 
  | 'task' 
  | 'interest';

export interface ThoughtBubble {
  id: string;
  userId: string;
  sessionId?: string;
  text: string;
  category: ThoughtCategory;
  parentId?: string;
  x?: number;
  y?: number;
  approvedToShare?: boolean;
  transferredTo?: 'goal' | 'ideabin' | 'analyzer' | 'interest' | 'explore' | null;
  createdAt: string;
}

export interface ThoughtConnection {
  fromId: string;
  toId: string;
  label?: string;
}

export interface ThoughtMapSession {
  id: string;
  userId: string;
  rawText: string;
  audioDurationSeconds?: number;
  nodes: ThoughtBubble[];
  connections: ThoughtConnection[];
  createdAt: string;
}

export type IdeaStage = 'spark' | 'exploring' | 'planning' | 'in_progress' | 'on_hold' | 'completed';

export interface IdeaItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  tags: string[];
  notes?: string;
  stage: IdeaStage;
  linkedThoughtId?: string;
  convertedGoalId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PathwayStep {
  title: string;
  durationWeeks: number;
  milestoneTitle: string;
  description?: string;
}

export interface AmbitionPathway {
  id: string;
  ambitionTitle: string;
  pathwayName: string;
  summary: string;
  steps: PathwayStep[];
  requiredSkills: string[];
  estimatedWeeklyHours: number;
  potentialChallenges: string[];
  scheduleCompatibility: 'high' | 'moderate' | 'tight';
  compatibilityNotes: string;
}

export interface VaultEntry {
  id: string;
  userId: string;
  title: string;
  encryptedData: string; // Base64 ciphertext
  iv: string;            // Base64 AES initialization vector
  salt: string;          // Base64 PBKDF2 salt
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// Blurt: Private, PIN-Locked Journal & Pastel Pages
// ----------------------------------------------------

export interface PastelColorOption {
  name: string;
  feeling: string;
  hex: string;
  text: string;
  border: string;
}

export const PASTEL_PALETTE: PastelColorOption[] = [
  { name: 'Cream', feeling: 'Neutral / Default', hex: '#FFF8EB', text: '#3d301b', border: '#f0e2ca' },
  { name: 'Pastel Green', feeling: 'Happy / Refreshed', hex: '#D9EED3', text: '#214d24', border: '#b9dab2' },
  { name: 'Powder Blue', feeling: 'Sad / Reflective', hex: '#DCEAF7', text: '#1c3e60', border: '#bcd5eb' },
  { name: 'Dusty Rose', feeling: 'Angry / Frustrated', hex: '#F4D1D5', text: '#5a2228', border: '#e4b6bc' },
  { name: 'Lavender', feeling: 'Dreamy / Thoughtful', hex: '#E8DDF5', text: '#3c2357', border: '#d1c0e7' },
  { name: 'Butter Yellow', feeling: 'Optimistic / Cheerful', hex: '#FFF1C7', text: '#524312', border: '#eedaa2' },
  { name: 'Soft Peach', feeling: 'Warm / Content', hex: '#FFE0CC', text: '#543019', border: '#ecc1a6' },
  { name: 'Sage Green', feeling: 'Calm / Grounded', hex: '#DDE8D5', text: '#284024', border: '#c3d3b7' },
  { name: 'Misty Grey', feeling: 'Tired / Neutral', hex: '#E8E9ED', text: '#2e3038', border: '#cbccd3' },
  { name: 'Pale Lilac', feeling: 'Anxious / Overwhelmed', hex: '#EEE5F5', text: '#3f2a4f', border: '#dac9e6' },
];

export interface JournalEntry {
  id: string;
  userId: string;
  title?: string;
  content: string;
  color: string;
  colorFeeling?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EncryptedJournalEntry {
  id: string;
  userId: string;
  encryptedPayload: string; // Base64 ciphertext of JSON { title, content, color, colorFeeling }
  iv: string;               // Base64 AES-GCM initialization vector
  salt: string;             // Base64 PBKDF2 salt
  createdAt: string;
  updatedAt: string;
}

export interface JournalSecurityConfig {
  userId: string;
  salt: string;             // Base64 salt for PBKDF2 PIN derivation
  canaryCiphertext: string; // Base64 ciphertext of verification canary
  canaryIv: string;         // Base64 IV for canary
  recoveryKeyHash?: string; // SHA-256 hash of 24-char recovery key
  failedAttempts?: number;
  lockedUntil?: string;     // ISO timestamp if rate limited
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// Step 4 & 5: Explore, Skill Pathways & Opportunity Radar
// ----------------------------------------------------

export interface Opportunity {
  id: string;
  name: string;
  organization: string;
  category: 'competition' | 'hackathon' | 'scholarship' | 'workshop' | 'volunteering' | 'student_program';
  description: string;
  eligibility: string;
  deadline: string;
  officialSource: string;
  requiredSkills: string[];
  estimatedCommitment: string;
  whyMatches: string;
  tags: string[];
  targetAgeOrGrade?: string;
}

export interface SkillPathwayMilestone {
  id: string;
  title: string;
  objective: string;
  recommendedActivities: string[];
  estimatedHours: number;
  durationWeeks: number;
  resources: { name: string; type: 'doc' | 'course' | 'tutorial' | 'book'; url?: string }[];
  status: 'pending' | 'in_progress' | 'completed';
  convertedTaskId?: string;
  convertedGoalId?: string;
}

export interface SkillPathway {
  id: string;
  userId: string;
  skillName: string;
  targetObjective: string;
  startingLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  weeklyHours: number;
  totalWeeks: number;
  milestones: SkillPathwayMilestone[];
  insightsContextNote?: string;
  wellnessContextNote?: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface GrowthNode {
  id: string;
  type: 'interest' | 'ambition' | 'skill_confirmed' | 'skill_target' | 'project' | 'opportunity';
  title: string;
  subtitle?: string;
  status?: string;
  category?: string;
  sourceId?: string;
  x: number;
  y: number;
}

export interface GrowthEdge {
  fromId: string;
  toId: string;
  label?: string;
}

export interface IdeaLaunchPlan {
  id: string;
  ideaId: string;
  ideaTitle: string;
  objective: string;
  necessarySkills: string[];
  approaches: string[];
  recommendedResources: string[];
  milestones: {
    title: string;
    description: string;
    estimatedHours: number;
  }[];
  estimatedTotalWeeks: number;
  createdAt: string;
}

export interface SharedWellnessRecommendation {
  type: 'balanced_pace' | 'protect_rest' | 'optimal_momentum' | 'split_focus';
  title: string;
  message: string;
  contextExplanation: string;
  suggestedWeeklyHours: number;
  recentPostponementsCount: number;
  wellnessStatus: 'overwhelmed' | 'fatigued' | 'steady' | 'energized';
  allowAdjustment: boolean;
}

