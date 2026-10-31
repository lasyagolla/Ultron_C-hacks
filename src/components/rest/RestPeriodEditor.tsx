import React, { useState } from 'react';
import { Moon, Coffee, ShieldCheck, Plus, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { RestPeriod, RestType, DayOfWeek } from '../../types';

interface RestPeriodEditorProps {
  restPeriods: RestPeriod[];
  onChange: (restPeriods: RestPeriod[]) => void;
  userId?: string;
}

const REST_TYPES: { id: RestType; label: string; icon: any; defaultStart: string; defaultEnd: string }[] = [
  { id: 'sleep', label: 'Sleep & Night Recovery', icon: Moon, defaultStart: '23:00', defaultEnd: '07:00' },
  { id: 'meal', label: 'Protected Meal Times', icon: Coffee, defaultStart: '12:30', defaultEnd: '13:30' },
  { id: 'break', label: 'Midday Recharge / Walk', icon: ShieldCheck, defaultStart: '16:00', defaultEnd: '16:45' },
  { id: 'personal', label: 'Unscheduled Personal Haven', icon: ShieldCheck, defaultStart: '20:30', defaultEnd: '21:30' },
];

const DAYS_SHORT: { id: DayOfWeek; short: string }[] = [
  { id: 'monday', short: 'M' },
  { id: 'tuesday', short: 'T' },
  { id: 'wednesday', short: 'W' },
  { id: 'thursday', short: 'T' },
  { id: 'friday', short: 'F' },
  { id: 'saturday', short: 'S' },
  { id: 'sunday', short: 'S' },
];

export const RestPeriodEditor: React.FC<RestPeriodEditorProps> = ({
  restPeriods,
  onChange,
  userId = 'user_current'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RestPeriod | null>(null);

  const [formType, setFormType] = useState<RestType>('sleep');
  const [formLabel, setFormLabel] = useState('Sleep & Recovery');
  const [formStartTime, setFormStartTime] = useState('23:00');
  const [formEndTime, setFormEndTime] = useState('07:00');
  const [formDays, setFormDays] = useState<DayOfWeek[]>([
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ]);
  const [formIsProtected, setFormIsProtected] = useState(true);

  const handleOpenAdd = (presetType?: RestType) => {
    const t = presetType || 'sleep';
    const cfg = REST_TYPES.find(x => x.id === t) || REST_TYPES[0];
    setEditingItem(null);
    setFormType(t);
    setFormLabel(cfg.label);
    setFormStartTime(cfg.defaultStart);
    setFormEndTime(cfg.defaultEnd);
    setFormDays(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
    setFormIsProtected(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: RestPeriod) => {
    setEditingItem(item);
    setFormType(item.restType);
    setFormLabel(item.label);
    setFormStartTime(item.startTime);
    setFormEndTime(item.endTime);
    setFormDays([...item.days]);
    setFormIsProtected(item.isProtected);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    onChange(restPeriods.filter(r => r.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      const updated: RestPeriod = {
        ...editingItem,
        restType: formType,
        label: formLabel.trim() || 'Rest Period',
        startTime: formStartTime,
        endTime: formEndTime,
        days: formDays,
        isProtected: formIsProtected
      };
      onChange(restPeriods.map(r => r.id === editingItem.id ? updated : r));
    } else {
      const newItem: RestPeriod = {
        id: 'rest_' + Math.random().toString(36).substring(2, 9),
        userId,
        restType: formType,
        label: formLabel.trim() || 'Rest Period',
        startTime: formStartTime,
        endTime: formEndTime,
        days: formDays,
        isProtected: formIsProtected
      };
      onChange([...restPeriods, newItem]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Protected Rest Periods
          </h4>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Bloom will guard these windows and prevent over-scheduling without your explicit approval.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenAdd()}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--bg-card)'
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Rest Block</span>
        </button>
      </div>

      {restPeriods.length === 0 ? (
        <div 
          className="p-6 text-center rounded-2xl border border-dashed"
          style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-card-subtle)' }}
        >
          <Moon className="w-8 h-8 mx-auto mb-2 opacity-40 text-[var(--accent-primary)]" />
          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            No rest periods protected yet.
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Setting protected sleep and meal hours guarantees your routine never becomes unhealthily packed.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            {REST_TYPES.slice(0, 3).map(rt => (
              <button
                key={rt.id}
                type="button"
                onClick={() => handleOpenAdd(rt.id)}
                className="px-2.5 py-1 text-xs rounded-lg border hover:bg-[var(--bg-card)] transition-colors"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                + Add {rt.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {restPeriods.map((r) => {
            const Icon = r.restType === 'sleep' ? Moon : r.restType === 'meal' ? Coffee : ShieldCheck;
            return (
              <div
                key={r.id}
                className="flex items-start justify-between p-3.5 rounded-2xl border transition-all hover:shadow-sm"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)'
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-[var(--bg-accent-soft)] text-[var(--accent-primary)]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>
                        {r.label}
                      </span>
                      {r.isProtected && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium">
                          Guarded
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {r.startTime} – {r.endTime}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-1">
                      {r.days.length === 7 ? 'Every day' : r.days.map(d => d.slice(0, 3)).join(', ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(r)}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-[var(--text-muted)] hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <h4 className="font-bold text-sm">
                {editingItem ? 'Edit Rest Block' : 'Add Protected Rest Block'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Block Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {REST_TYPES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setFormType(t.id);
                        if (!editingItem) {
                          setFormLabel(t.label);
                          setFormStartTime(t.defaultStart);
                          setFormEndTime(t.defaultEnd);
                        }
                      }}
                      className={`p-2 rounded-xl text-left border flex items-center space-x-2 transition-all ${
                        formType === t.id ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)] font-semibold' : 'opacity-70'
                      }`}
                    >
                      <t.icon className="w-4 h-4 text-[var(--accent-primary)]" />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Custom Label
                </label>
                <input
                  type="text"
                  value={formLabel}
                  onChange={e => setFormLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-transparent"
                  style={{ borderColor: 'var(--border-strong)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={e => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={e => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Active Days
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS_SHORT.map((d, idx) => {
                    const daysArr: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                    const dayKey = daysArr[idx];
                    const isChecked = formDays.includes(dayKey);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setFormDays(formDays.filter(x => x !== dayKey));
                          } else {
                            setFormDays([...formDays, dayKey]);
                          }
                        }}
                        className={`py-1.5 rounded-lg text-center text-xs font-semibold border ${
                          isChecked ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]' : 'hover:bg-[var(--bg-card-subtle)]'
                        }`}
                        style={{ borderColor: isChecked ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
                      >
                        {d.short}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div 
                className="p-3 rounded-xl border flex items-center space-x-2 cursor-pointer"
                style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)' }}
                onClick={() => setFormIsProtected(!formIsProtected)}
              >
                <input
                  type="checkbox"
                  checked={formIsProtected}
                  onChange={e => setFormIsProtected(e.target.checked)}
                  className="rounded text-[var(--accent-primary)]"
                />
                <span className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>
                  Strictly protect from scheduling overlaps
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border font-medium"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl font-semibold text-white"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  Save Rest Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
