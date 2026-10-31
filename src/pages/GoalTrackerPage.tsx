import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Lock, 
  Unlock, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  AlertTriangle,
  Layers,
  ArrowRight,
  Filter,
  Trash2,
  Edit2,
  CalendarDays,
  Coffee,
  Moon,
  Zap,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  DayOfWeek, 
  WeeklyCommitment, 
  CalendarEvent, 
  DailyTask, 
  Goal, 
  TaskStatus, 
  CommitmentCategory,
  PriorityLevel,
  DifficultyLevel
} from '../types';

export const GoalTrackerPage: React.FC = () => {
  const { 
    commitments, 
    restPeriods, 
    goals, 
    tasks, 
    calendarEvents, 
    addOrUpdateCalendarEvent, 
    removeCalendarEvent,
    addOrUpdateTask,
    removeTask,
    updateTaskStatus,
    autoScheduleTask,
    addNewGoal,
    updateGoalProgress,
    removeGoalItem,
    archiveGoal,
    setActivePage,
    focusMode
  } = useAuth();

  const [completingGoalId, setCompletingGoalId] = useState<string | null>(null);
  const [goalArchivedToast, setGoalArchivedToast] = useState<string | null>(null);

  const activeGoals = useMemo(() => {
    return goals.filter(g => !g.archived && g.status !== 'completed');
  }, [goals]);

  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);

  // Form states - Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskGoalId, setTaskGoalId] = useState('');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskTime, setTaskTime] = useState('16:00');
  const [taskDuration, setTaskDuration] = useState(45);
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('high');
  const [taskDifficulty, setTaskDifficulty] = useState<DifficultyLevel>('moderate');

  // Form states - Goal
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState('Academics');
  const [goalPriority, setGoalPriority] = useState<PriorityLevel>('high');
  const [goalDifficulty, setGoalDifficulty] = useState<DifficultyLevel>('moderate');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [goalEffort, setGoalEffort] = useState('3 hours / week');

  // Form states - Event
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState<CommitmentCategory>('school');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventStartTime, setEventStartTime] = useState('10:00');
  const [eventEndTime, setEventEndTime] = useState('11:30');
  const [eventIsFixed, setEventIsFixed] = useState(false);

  // Date navigation helpers
  const dayNames: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  const formattedCurrentDate = useMemo(() => {
    return currentDate.toISOString().split('T')[0];
  }, [currentDate]);

  const currentDayOfWeek = useMemo<DayOfWeek>(() => {
    return dayNames[currentDate.getDay()];
  }, [currentDate]);

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (calendarView === 'day') next.setDate(next.getDate() - 1);
    else if (calendarView === 'week') next.setDate(next.getDate() - 7);
    else next.setMonth(next.getMonth() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (calendarView === 'day') next.setDate(next.getDate() + 1);
    else if (calendarView === 'week') next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Generate week dates (Monday to Sunday)
  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    start.setDate(diff);

    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      arr.push({
        dateObj: d,
        dateStr: d.toISOString().split('T')[0],
        dayName: dayNames[d.getDay()],
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateNumber: d.getDate(),
        isToday: d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
      });
    }
    return arr;
  }, [currentDate]);

  // Hours array from 07:00 to 22:00
  const hours = useMemo(() => {
    const list = [];
    for (let h = 7; h <= 22; h++) {
      list.push(`${String(h).padStart(2, '0')}:00`);
    }
    return list;
  }, []);

  // Filter tasks for selected/current date
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.scheduledDate === formattedCurrentDate);
  }, [tasks, formattedCurrentDate]);

  // Overlap and conflict calculation for current date
  const dayConflicts = useMemo(() => {
    const dayCommitments = commitments.filter(c => c.days.includes(currentDayOfWeek));
    const dayEvents = calendarEvents.filter(e => e.date === formattedCurrentDate);
    const allBlocks = [
      ...dayCommitments.map(c => ({ id: c.id, title: c.title, start: c.startTime, end: c.endTime, type: 'commitment' })),
      ...dayEvents.map(e => ({ id: e.id, title: e.title, start: e.startTime, end: e.endTime, type: 'event' }))
    ];

    const conflicts: { a: string; b: string; time: string }[] = [];
    for (let i = 0; i < allBlocks.length; i++) {
      for (let j = i + 1; j < allBlocks.length; j++) {
        const A = allBlocks[i];
        const B = allBlocks[j];
        if (A.start < B.end && A.end > B.start) {
          conflicts.push({
            a: A.title,
            b: B.title,
            time: `${A.start}–${A.end}`
          });
        }
      }
    }
    return conflicts;
  }, [commitments, calendarEvents, currentDayOfWeek, formattedCurrentDate]);

  // Save new/edited Task
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    if (editingTask) {
      addOrUpdateTask({
        ...editingTask,
        title: taskTitle.trim(),
        goalId: taskGoalId || undefined,
        scheduledDate: taskDate,
        scheduledTime: taskTime || undefined,
        estimatedDurationMinutes: taskDuration,
        priority: taskPriority,
        difficulty: taskDifficulty
      });
    } else {
      const newTask: DailyTask = {
        id: 'task_' + Math.random().toString(36).substring(2, 9),
        userId: 'current',
        goalId: taskGoalId || undefined,
        title: taskTitle.trim(),
        scheduledDate: taskDate,
        scheduledTime: taskTime || undefined,
        estimatedDurationMinutes: taskDuration,
        priority: taskPriority,
        difficulty: taskDifficulty,
        status: 'not_started',
        postponedCount: 0,
        createdAt: new Date().toISOString()
      };
      addOrUpdateTask(newTask);

      // Also create calendar event if time specified
      if (taskTime) {
        const [h, m] = taskTime.split(':').map(Number);
        const endMinutes = h * 60 + m + taskDuration;
        const endH = Math.floor(endMinutes / 60);
        const endM = endMinutes % 60;
        const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

        addOrUpdateCalendarEvent({
          id: 'evt_' + Math.random().toString(36).substring(2, 9),
          userId: 'current',
          title: taskTitle.trim(),
          category: 'personal',
          date: taskDate,
          startTime: taskTime,
          endTime: endTimeStr,
          isFixed: false,
          linkedTaskId: newTask.id
        });
      }
    }

    setEditingTask(null);
    setTaskTitle('');
    setIsTaskModalOpen(false);
  };

  // Save Goal
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    addNewGoal({
      title: goalTitle.trim(),
      category: goalCategory,
      priority: goalPriority,
      difficulty: goalDifficulty,
      targetDate: goalTargetDate || undefined,
      estimatedEffort: goalEffort,
      status: 'not_started',
      progress: 0
    });

    setGoalTitle('');
    setIsGoalModalOpen(false);
  };

  // Save Event
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    addOrUpdateCalendarEvent({
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      userId: 'current',
      title: eventTitle.trim(),
      category: eventCategory,
      date: eventDate,
      startTime: eventStartTime,
      endTime: eventEndTime,
      isFixed: eventIsFixed
    });

    setEventTitle('');
    setIsEventModalOpen(false);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Goal Tracker &amp; Schedule
            </h1>
            {focusMode.enabled && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                Focus Mode Active
              </span>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Google Calendar-inspired scheduler protecting sleep, recurring anchors, and daily milestones.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setEditingTask(null);
              setTaskTitle('');
              setTaskDate(formattedCurrentDate);
              setIsTaskModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>

          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border hover:bg-[var(--bg-card-subtle)]"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Date Navigation & View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-3xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl border text-xs font-semibold hover:bg-[var(--bg-card-subtle)]"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            Today
          </button>

          <div className="flex items-center space-x-1">
            <button onClick={handlePrev} className="p-1.5 rounded-lg hover:bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={handleNext} className="p-1.5 rounded-lg hover:bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric', ...(calendarView === 'day' ? { day: 'numeric', weekday: 'short' } : {}) })}
          </span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center space-x-2">
          <div className="flex p-1 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}>
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCalendarView(mode)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                  calendarView === mode
                    ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsEventModalOpen(true)}
            title="Add specific calendar event"
            className="p-2 rounded-xl border hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <CalendarDays className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conflict Warning Banner */}
      {dayConflicts.length > 0 && (
        <div className="p-3.5 rounded-2xl border flex items-start space-x-3 text-xs bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Schedule Overlap Alert for {formattedCurrentDate}:</span>
            <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
              {dayConflicts.map((c, idx) => (
                <li key={idx}><strong>{c.a}</strong> collides with <strong>{c.b}</strong> around {c.time}.</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Grid: Calendar Layout (Left 3 cols) and Goals & Daily Tasks (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* CALENDAR VIEW */}
        <div 
          className="lg:col-span-3 rounded-3xl p-5 border space-y-4"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          {/* WEEK VIEW */}
          {calendarView === 'week' && (
            <div className="space-y-3">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                {weekDays.map((d) => (
                  <button
                    key={d.dateStr}
                    onClick={() => {
                      setCurrentDate(d.dateObj);
                      setCalendarView('day');
                    }}
                    className={`flex flex-col items-center py-2 px-1 rounded-2xl border text-center transition-all ${
                      d.dateStr === formattedCurrentDate
                        ? 'bg-[var(--bg-accent-soft)] border-[var(--accent-primary)] font-bold text-[var(--accent-primary)] shadow-sm'
                        : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border-transparent'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-semibold">{d.dayLabel}</span>
                    <span className={`text-base font-extrabold mt-0.5 ${d.isToday ? 'w-6 h-6 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center' : ''}`}>
                      {d.dateNumber}
                    </span>
                  </button>
                ))}
              </div>

              {/* Week columns */}
              <div className="grid grid-cols-7 gap-2 min-h-[460px]">
                {weekDays.map((d) => {
                  const dayComms = commitments.filter(c => c.days.includes(d.dayName));
                  const dayEvts = calendarEvents.filter(e => e.date === d.dateStr);
                  const dayRest = restPeriods.filter(r => r.days.includes(d.dayName) && r.isProtected);

                  return (
                    <div 
                      key={d.dateStr}
                      className="p-2 rounded-2xl border flex flex-col space-y-1.5 overflow-y-auto max-h-[500px]"
                      style={{
                        backgroundColor: 'var(--bg-card-subtle)',
                        borderColor: 'var(--border-subtle)'
                      }}
                    >
                      {/* Protected Rest hints */}
                      {dayRest.slice(0, 1).map(r => (
                        <div key={r.id} className="p-1 rounded-lg text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center space-x-1" title="Protected sleep & recharge">
                          <Moon className="w-2.5 h-2.5" />
                          <span className="truncate">{r.label}</span>
                        </div>
                      ))}

                      {/* Commitments */}
                      {dayComms.map(c => (
                        <div
                          key={c.id}
                          className="p-1.5 rounded-xl border text-[10px] shadow-xs"
                          style={{
                            backgroundColor: 'var(--bg-card)',
                            borderColor: 'var(--border-strong)'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold truncate text-[var(--text-primary)]">{c.title}</span>
                            {c.isFixed && <Lock className="w-2.5 h-2.5 text-[var(--text-muted)]" />}
                          </div>
                          <div className="text-[9px] text-[var(--text-muted)] mt-0.5">
                            {c.startTime}–{c.endTime}
                          </div>
                        </div>
                      ))}

                      {/* Specific Events */}
                      {dayEvts.map(e => (
                        <div
                          key={e.id}
                          className="p-1.5 rounded-xl border text-[10px] bg-[var(--bg-accent-soft)] border-[var(--accent-primary)] shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold truncate text-[var(--accent-primary)]">{e.title}</span>
                          </div>
                          <div className="text-[9px] text-[var(--accent-secondary)] mt-0.5">
                            {e.startTime}–{e.endTime}
                          </div>
                        </div>
                      ))}

                      {dayComms.length === 0 && dayEvts.length === 0 && (
                        <span className="text-[10px] text-[var(--text-muted)] text-center py-8 italic opacity-60">
                          Clear
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DAY VIEW */}
          {calendarView === 'day' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b text-xs font-semibold" style={{ borderColor: 'var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-primary)' }}>Hourly Timeline ({currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })})</span>
                <span className="text-[var(--text-muted)]">Click any open slot to schedule</span>
              </div>

              <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-2">
                {hours.map((hour) => {
                  const hNum = parseInt(hour.split(':')[0], 10);
                  const matchingComms = commitments.filter(c => {
                    const cH = parseInt(c.startTime.split(':')[0], 10);
                    return c.days.includes(currentDayOfWeek) && cH === hNum;
                  });
                  const matchingEvents = calendarEvents.filter(e => {
                    const eH = parseInt(e.startTime.split(':')[0], 10);
                    return e.date === formattedCurrentDate && eH === hNum;
                  });

                  return (
                    <div 
                      key={hour} 
                      className="flex items-start space-x-3 py-1.5 border-b hover:bg-[var(--bg-card-subtle)] rounded-xl px-2 transition-colors cursor-pointer"
                      style={{ borderColor: 'var(--border-subtle)' }}
                      onClick={() => {
                        setEventDate(formattedCurrentDate);
                        setEventStartTime(hour);
                        const endH = String(hNum + 1).padStart(2, '0');
                        setEventEndTime(`${endH}:00`);
                        setIsEventModalOpen(true);
                      }}
                    >
                      <span className="text-[11px] font-mono text-[var(--text-muted)] w-12 flex-shrink-0 pt-1">
                        {hour}
                      </span>

                      <div className="flex-1 min-h-[30px] space-y-1">
                        {matchingComms.map(c => (
                          <div 
                            key={c.id}
                            className="p-2 rounded-xl border flex items-center justify-between text-xs"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center space-x-2">
                              {c.isFixed ? <Lock className="w-3 h-3 text-[var(--accent-primary)]" /> : <Unlock className="w-3 h-3 text-[var(--text-muted)]" />}
                              <span className="font-bold text-[var(--text-primary)]">{c.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-accent-soft)] text-[var(--accent-primary)] capitalize">{c.category}</span>
                            </div>
                            <span className="text-[11px] text-[var(--text-muted)] font-mono">{c.startTime}–{c.endTime}</span>
                          </div>
                        ))}

                        {matchingEvents.map(e => (
                          <div 
                            key={e.id}
                            className="p-2 rounded-xl border flex items-center justify-between text-xs bg-[var(--bg-accent-soft)] border-[var(--accent-primary)]"
                            onClick={(ev) => ev.stopPropagation()}
                          >
                            <span className="font-bold text-[var(--accent-primary)]">{e.title}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-[11px] text-[var(--accent-secondary)] font-mono">{e.startTime}–{e.endTime}</span>
                              <button onClick={() => removeCalendarEvent(e.id)} className="text-[var(--text-muted)] hover:text-rose-600">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MONTH VIEW */}
          {calendarView === 'month' && (
            <div className="p-4 text-center space-y-3">
              <CalendarIcon className="w-8 h-8 mx-auto text-[var(--accent-primary)]" />
              <h3 className="font-bold text-sm">Month Overview</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                Viewing schedule for {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Click Week or Day view to interact with individual hourly time slots.
              </p>
              <button
                onClick={() => setCalendarView('week')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                Switch to Week View
              </button>
            </div>
          )}
        </div>

        {/* GOALS & DAILY TASKS SIDE PANEL (Right col) */}
        <div className="space-y-6">
          {/* Daily Tasks Checklist for current date */}
          <div 
            className="p-5 rounded-3xl border space-y-3"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Daily Tasks ({filteredTasks.length})
                </h3>
                <span className="text-[10px] text-[var(--text-muted)]">{formattedCurrentDate}</span>
              </div>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setTaskTitle('');
                  setTaskDate(formattedCurrentDate);
                  setIsTaskModalOpen(true);
                }}
                className="p-1 rounded-md text-[var(--accent-primary)] hover:bg-[var(--bg-card-subtle)]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-[var(--text-muted)] space-y-2">
                <p>No tasks scheduled for this date.</p>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setTaskTitle('');
                    setTaskDate(formattedCurrentDate);
                    setIsTaskModalOpen(true);
                  }}
                  className="px-3 py-1 text-xs rounded-xl border hover:bg-[var(--bg-card-subtle)]"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  + Add a Daily Task
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTasks.map((t) => {
                  const isDone = t.status === 'completed';
                  const isNotDone = t.status === 'not_completed';
                  const isPostponed = t.status === 'postponed';

                  return (
                    <div 
                      key={t.id}
                      className={`p-3 rounded-2xl border space-y-2 transition-all ${
                        isDone ? 'opacity-65 bg-[var(--bg-card-subtle)]' : ''
                      }`}
                      style={{
                        backgroundColor: isDone ? 'var(--bg-card-subtle)' : 'var(--bg-card)',
                        borderColor: 'var(--border-subtle)'
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2.5">
                          <button
                            onClick={() => updateTaskStatus(t.id, isDone ? 'not_started' : 'completed')}
                            className={`w-4 h-4 mt-0.5 rounded-md flex items-center justify-center border transition-all ${
                              isDone ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]' : 'border-[var(--border-strong)]'
                            }`}
                          >
                            {isDone && <Check className="w-3 h-3" />}
                          </button>
                          <div>
                            <span className={`font-semibold text-xs block ${isDone ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                              {t.title}
                            </span>
                            <div className="flex items-center space-x-2 text-[10px] text-[var(--text-muted)] mt-0.5">
                              <span>{t.estimatedDurationMinutes}m</span>
                              <span>•</span>
                              <span className="capitalize">{t.priority} priority</span>
                              {t.postponedCount > 0 && (
                                <span className="text-amber-600 font-semibold">• Postponed {t.postponedCount}x</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status switcher dropdown or actions */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => autoScheduleTask(t.id)}
                            title="Auto-Schedule gap"
                            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-card-subtle)]"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeTask(t.id)}
                            className="p-1 rounded-md text-[var(--text-muted)] hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Status toggle chips */}
                      <div className="flex items-center space-x-1 pt-1 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                        {(['completed', 'partial', 'not_completed'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => updateTaskStatus(t.id, st)}
                            className={`px-2 py-0.5 rounded-md text-[9px] font-semibold transition-all ${
                              t.status === st
                                ? 'bg-[var(--accent-primary)] text-white'
                                : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-subtle)]'
                            }`}
                          >
                            {st === 'not_completed' ? 'Incomplete' : st}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Long-term Goals Panel */}
          <div 
            className="p-5 rounded-3xl border space-y-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Active Goals ({activeGoals.length})
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActivePage('portfolio')}
                  className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent-primary)] underline"
                >
                  Portfolio
                </button>
                <button
                  onClick={() => setIsGoalModalOpen(true)}
                  className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline"
                >
                  + Goal
                </button>
              </div>
            </div>

            {goalArchivedToast && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
                <span className="truncate">{goalArchivedToast}</span>
                <button onClick={() => setActivePage('portfolio')} className="underline font-bold text-[10px] flex-shrink-0 ml-1">
                  View
                </button>
              </div>
            )}

            <div className="space-y-3">
              {activeGoals.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--text-muted)]">
                  No active goals right now. Create a new goal or restore one from Portfolio!
                </div>
              ) : (
                activeGoals.map((g) => {
                  const isCompleting = completingGoalId === g.id;
                  return (
                    <div 
                      key={g.id} 
                      className={`p-3 rounded-2xl border space-y-2 text-xs transition-all duration-500 ease-out ${
                        isCompleting ? 'translate-x-full opacity-0 scale-95 pointer-events-none' : ''
                      }`} 
                      style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-xs block" style={{ color: 'var(--text-primary)' }}>{g.title}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">{g.category}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setCompletingGoalId(g.id);
                              setTimeout(async () => {
                                await archiveGoal(g.id);
                                setCompletingGoalId(null);
                                setGoalArchivedToast(`"${g.title}" archived under Portfolio!`);
                                setTimeout(() => setGoalArchivedToast(null), 3500);
                              }, 400);
                            }}
                            title="Complete and archive to Portfolio"
                            className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[10px] font-semibold flex items-center space-x-0.5 border border-emerald-200 dark:border-emerald-800"
                          >
                            <Check className="w-3 h-3" />
                            <span>Done</span>
                          </button>
                          <button onClick={() => removeGoalItem(g.id)} className="p-1 text-[var(--text-muted)] hover:text-rose-600">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                        <span>Progress</span>
                        <span className="font-semibold">{g.progress}% Complete</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={g.progress}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          updateGoalProgress(g.id, val);
                          if (val === 100) {
                            setCompletingGoalId(g.id);
                            setTimeout(async () => {
                              await archiveGoal(g.id);
                              setCompletingGoalId(null);
                              setGoalArchivedToast(`"${g.title}" achieved and archived to Portfolio!`);
                              setTimeout(() => setGoalArchivedToast(null), 3500);
                            }, 450);
                          }
                        }}
                        className="w-full accent-[var(--accent-primary)] cursor-pointer"
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NEW TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <h4 className="font-bold text-sm">Add Daily Task</h4>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-[var(--text-muted)]">✕</button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solve 5 Organic Chemistry Problems"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-transparent"
                  style={{ borderColor: 'var(--border-strong)' }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Link to Long-Term Goal</label>
                <select
                  value={taskGoalId}
                  onChange={(e) => setTaskGoalId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-transparent"
                  style={{ borderColor: 'var(--border-strong)' }}
                >
                  <option value="">(No specific goal)</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Time Slot (Optional)</label>
                  <input
                    type="time"
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Duration</label>
                  <select
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-xl border bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  >
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                    <option value={90}>90 mins</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-2 py-1.5 rounded-xl border bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Difficulty</label>
                  <select
                    value={taskDifficulty}
                    onChange={(e) => setTaskDifficulty(e.target.value as any)}
                    className="w-full px-2 py-1.5 rounded-xl border bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="challenging">Challenging</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-3 py-1.5 rounded-xl border">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl font-semibold text-white" style={{ backgroundColor: 'var(--accent-primary)' }}>
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW GOAL MODAL */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <h4 className="font-bold text-sm">Create Long-Term Goal</h4>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-[var(--text-muted)]">✕</button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Goal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Calculus & Linear Algebra"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-transparent"
                  style={{ borderColor: 'var(--border-strong)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Category</label>
                  <input
                    type="text"
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Target Date</label>
                  <input
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Estimated Effort</label>
                <input
                  type="text"
                  placeholder="e.g. 4 hours / week"
                  value={goalEffort}
                  onChange={(e) => setGoalEffort(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border bg-transparent"
                  style={{ borderColor: 'var(--border-strong)' }}
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button type="button" onClick={() => setIsGoalModalOpen(false)} className="px-3 py-1.5 rounded-xl border">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl font-semibold text-white" style={{ backgroundColor: 'var(--accent-primary)' }}>
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW EVENT MODAL */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <h4 className="font-bold text-sm">Schedule Calendar Event</h4>
              <button onClick={() => setIsEventModalOpen(false)} className="text-[var(--text-muted)]">✕</button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Event Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Lab Prep, Group Review"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-transparent"
                  style={{ borderColor: 'var(--border-strong)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Category</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value as any)}
                    className="w-full px-2 py-1.5 rounded-xl border bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  >
                    <option value="school">School</option>
                    <option value="tuition">Tuition</option>
                    <option value="extracurricular">Extracurricular</option>
                    <option value="hobby">Hobby</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Start Time</label>
                  <input
                    type="time"
                    required
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-secondary)]">End Time</label>
                  <input
                    type="time"
                    required
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button type="button" onClick={() => setIsEventModalOpen(false)} className="px-3 py-1.5 rounded-xl border">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl font-semibold text-white" style={{ backgroundColor: 'var(--accent-primary)' }}>
                  Add to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
