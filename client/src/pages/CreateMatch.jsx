import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { matchService } from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ── Custom Calendar Picker ─────────────────────────────────────────── */
const CalendarPicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const today = new Date();
  const selected = value ? new Date(value + 'T00:00:00') : null;
  const [viewYear, setViewYear] = useState(selected?.getFullYear() || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const pickDay = (day) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  };

  const isToday = (day) => day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isSelected = (day) => selected && day === selected.getDate() && viewMonth === selected.getMonth() && viewYear === selected.getFullYear();
  const isPast = (day) => new Date(viewYear, viewMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const displayText = selected
    ? `${selected.getDate()} ${monthNames[selected.getMonth()].slice(0, 3)} ${selected.getFullYear()}`
    : 'Pick a date';

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)}
        className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm font-medium text-left transition-all duration-200 flex items-center gap-2 ${open ? 'border-cricket ring-2 ring-cricket/20' : 'border-gray-100 dark:border-gray-700'} ${selected ? 'text-gray-800 dark:text-white' : 'text-gray-400'} bg-white dark:bg-dark`}>
        <span className="text-base">📅</span>
        {displayText}
      </button>
      {open && (
        <div className="absolute z-50 bottom-full mb-2 left-0 w-[280px] bg-white dark:bg-dark-light rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 text-xs font-bold transition-colors">‹</button>
            <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200">{monthNames[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 text-xs font-bold transition-colors">›</button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {dayNames.map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
              <button key={day} type="button" disabled={isPast(day)}
                onClick={() => pickDay(day)}
                className={`w-full aspect-square rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isSelected(day) ? 'bg-cricket text-white shadow-md shadow-cricket/30 scale-105' :
                  isToday(day) ? 'bg-cricket/10 text-cricket font-bold ring-1 ring-cricket/30' :
                  isPast(day) ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' :
                  'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Custom Time Picker ─────────────────────────────────────────────── */
const TimePicker = ({ hour, minute, ampm, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)}
        className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm font-semibold text-left transition-all duration-200 flex items-center gap-2 ${open ? 'border-cricket ring-2 ring-cricket/20' : 'border-gray-100 dark:border-gray-700'} text-gray-800 dark:text-white bg-white dark:bg-dark`}>
        <span className="text-base">⏰</span>
        {hour}:{minute} <span className="text-xs font-bold text-cricket">{ampm}</span>
      </button>
      {open && (
        <div className="absolute z-50 bottom-full mb-2 left-0 w-[220px] bg-white dark:bg-dark-light rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-3 animate-in fade-in zoom-in-95 duration-200">
          {/* Hour */}
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Hour</p>
          <div className="grid grid-cols-6 gap-1 mb-3">
            {hours.map(h => (
              <button key={h} type="button" onClick={() => onChange('hour', h)}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                  hour === h ? 'bg-cricket text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>{parseInt(h)}</button>
            ))}
          </div>
          {/* Minute */}
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Minute</p>
          <div className="grid grid-cols-4 gap-1 mb-3">
            {minutes.map(m => (
              <button key={m} type="button" onClick={() => onChange('minute', m)}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                  minute === m ? 'bg-cricket text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>{m}</button>
            ))}
          </div>
          {/* AM/PM */}
          <div className="grid grid-cols-2 gap-1">
            {['AM', 'PM'].map(p => (
              <button key={p} type="button" onClick={() => { onChange('ampm', p); setOpen(false); }}
                className={`py-2 rounded-xl text-xs font-extrabold transition-all duration-150 ${
                  ampm === p ? 'bg-gradient-to-r from-cricket to-cricket-dark text-white shadow-sm' : 'bg-gray-50 dark:bg-dark text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>{p}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CreateMatch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    hour: '10',
    minute: '00',
    ampm: 'AM',
    teamSize: '11',
    teamA: 'Team A',
    teamB: 'Team B'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTimeChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!user.location || user.location.coordinates[0] === 0) {
      setError('You must set your location in your profile before creating a match');
      return;
    }

    setLoading(true);
    try {
      const timeStr = `${formData.hour}:${formData.minute} ${formData.ampm}`;
      const matchData = {
        title: formData.title,
        date: formData.date,
        time: timeStr,
        teamSize: parseInt(formData.teamSize),
        teamA: formData.teamA,
        teamB: formData.teamB,
        location: user.location 
      };
      
      await matchService.create(matchData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  const hasLocation = user && user.location && user.location.coordinates[0] !== 0;

  const teamSizes = [
    { value: '5', label: '5v5', desc: 'Quick Game' },
    { value: '7', label: '7v7', desc: 'Half Match' },
    { value: '11', label: '11v11', desc: 'Full Match' },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      {/* Back link */}
      <div className="mb-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-cricket hover:text-cricket-dark transition-colors group">
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span> 
          Back to Dashboard
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-3 duration-500">
        
        {/* Header with gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-cricket via-cricket-dark to-emerald-800 px-5 py-6 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full border-4 border-white/20"></div>
            <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full border-4 border-white/20"></div>
            <div className="absolute right-12 bottom-2 w-16 h-16 rounded-full border-4 border-white/20"></div>
          </div>
          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm mb-3 shadow-lg">
              <span className="text-2xl">🏏</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Organize a Match</h2>
            <p className="text-white/70 text-xs mt-1 font-medium">Set up your game and rally the players</p>
          </div>
        </div>

        <div className="p-5">
          {/* Error display */}
          {error && (
            <div className="mb-4 flex items-start gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3.5 py-2.5 rounded-xl text-xs animate-in fade-in zoom-in-95 duration-200">
              <span className="text-sm mt-px">⚠️</span>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {!hasLocation ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <p className="text-amber-800 dark:text-amber-400 text-sm font-semibold mb-1">Location Required</p>
              <p className="text-gray-500 text-xs mb-4">Set your location in profile to organize matches near you.</p>
              <Link to="/profile" className="btn-primary inline-flex items-center gap-1.5">
                <span>🎯</span> Update Location
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Match Title */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  <span className="text-sm">🏆</span> Match Title
                </label>
                <input 
                  name="title" 
                  className="w-full px-4 py-2.5 border-2 border-gray-100 dark:border-gray-700 dark:bg-dark dark:text-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-cricket/20 focus:border-cricket outline-none transition-all duration-200 placeholder:text-gray-400"
                  placeholder="e.g., Sunday Championship League"
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              {/* Teams Section */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                  <span className="text-sm">⚔️</span> Teams
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-[8px] font-black">A</span>
                      </div>
                      <input 
                        name="teamA" 
                        className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-100 dark:border-gray-700 dark:bg-dark dark:text-white rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all duration-200"
                        value={formData.teamA} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                  </div>
                  
                  {/* VS Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-100 flex items-center justify-center shadow-lg">
                      <span className="text-[10px] font-black text-white dark:text-gray-900 tracking-tight">VS</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white text-[8px] font-black">B</span>
                      </div>
                      <input 
                        name="teamB" 
                        className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-100 dark:border-gray-700 dark:bg-dark dark:text-white rounded-xl text-sm font-semibold focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all duration-200"
                        value={formData.teamB} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Size Selector */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                  <span className="text-sm">👥</span> Team Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {teamSizes.map(size => (
                    <button
                      key={size.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, teamSize: size.value }))}
                      className={`relative py-2.5 px-3 rounded-xl border-2 transition-all duration-200 text-center group ${
                        formData.teamSize === size.value
                          ? 'border-cricket bg-cricket/5 dark:bg-cricket/15 shadow-sm'
                          : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-dark/50'
                      }`}
                    >
                      <div className={`text-sm font-extrabold ${formData.teamSize === size.value ? 'text-cricket' : 'text-gray-700 dark:text-gray-300'}`}>
                        {size.label}
                      </div>
                      <div className={`text-[10px] font-medium mt-0.5 ${formData.teamSize === size.value ? 'text-cricket/70' : 'text-gray-400'}`}>
                        {size.desc}
                      </div>
                      {formData.teamSize === size.value && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-cricket rounded-full flex items-center justify-center shadow-sm">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {/* Hidden select for form value */}
                <select name="teamSize" className="hidden" value={formData.teamSize} onChange={handleChange}>
                  <option value="5">5</option>
                  <option value="7">7</option>
                  <option value="11">11</option>
                </select>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Date */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    <span className="text-sm">📅</span> Date
                  </label>
                  <CalendarPicker
                    value={formData.date}
                    onChange={(val) => setFormData(prev => ({ ...prev, date: val }))}
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    <span className="text-sm">⏰</span> Time
                  </label>
                  <TimePicker
                    hour={formData.hour}
                    minute={formData.minute}
                    ampm={formData.ampm}
                    onChange={handleTimeChange}
                  />
                </div>
              </div>

              {/* Location Card */}
              <div className="relative overflow-hidden bg-gradient-to-r from-cricket/5 via-emerald-50 to-cricket/5 dark:from-cricket/10 dark:via-emerald-950/30 dark:to-cricket/10 p-3.5 rounded-xl border border-cricket/15 dark:border-cricket/25">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cricket/10 dark:bg-cricket/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">📍</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-cricket/70 dark:text-cricket/60">Match Location</p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {user.locationName || 'Pinned at your current coordinates'}
                    </p>
                  </div>
                  <div className="ml-auto flex-shrink-0">
                    <Link to="/profile" className="text-[10px] font-bold text-cricket hover:text-cricket-dark transition-colors">
                      Edit →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-2.5">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-cricket to-cricket-dark hover:from-cricket-dark hover:to-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="group-hover:scale-110 transition-transform">🚀</span>
                      Publish Match
                    </>
                  )}
                </button>
                <Link to="/" className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold py-2.5 px-5 rounded-xl text-sm transition-all duration-200">
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateMatch;
