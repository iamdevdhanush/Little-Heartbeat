import React, { useEffect, useState } from 'react';
import { useUser } from '../../hooks/useUser.js';
import { usePregnancy } from '../../hooks/usePregnancy.js';
import databaseService from '../../services/databaseService.js';

// Pre-seeded milestones if database is empty
const defaultMilestonesByTrimester = {
  first: [
    { id: 'm1', week: 4, title: 'Positive Pregnancy Test 🧪', description: 'Confirming the arrival of your little heartbeat! Cells are dividing rapidly.', date: '2026-03-01' },
    { id: 'm2', week: 8, title: 'First Prenatal Doctor Scan 🩺', description: 'Hearing the tiny heartbeat for the very first time. Fetal heart chambers are developing.', date: '2026-03-28' },
    { id: 'm3', week: 12, title: 'First Trimester Milestone Celebrated 🎉', description: 'Risk of miscarriage drops significantly. Baby is fully formed and practicing moving limbs.', date: '2026-04-25' }
  ],
  second: [
    { id: 'm4', week: 16, title: 'Felt Baby\'s Quickening movements 🤰', description: 'First gentle flutters, also known as quickening. Baby is size of an avocado.', date: '2026-05-23' },
    { id: 'm5', week: 20, title: 'Halfway Mark & Gender Reveal Scan 🍌', description: 'You have reached the 20-week half-way mark. Baby begins to swallow and hear sounds.', date: '2026-06-20' },
    { id: 'm6', week: 24, title: 'Baby Sleep Cycles formed 😴', description: 'Sensory pathways are active. Fetus has sleeping and waking phases.', date: '2026-07-18' }
  ],
  third: [
    { id: 'm7', week: 28, title: 'Entering Trimester Three 🛡️', description: 'Final stretch! Baby begins to open eyes and build fat reserves.', date: '2026-08-15' },
    { id: 'm8', week: 36, title: 'Hospital Bag Packed & Ready 🎒', description: 'Baby begins descent into pelvic cavity. Preparing your checklist.', date: '2026-10-10' },
    { id: 'm9', week: 40, title: 'Expected Due Date Arrival 👶', description: 'Full term pregnancy! Ready to meet your tiny miracle.', date: '2026-11-07' }
  ]
};

export default function JourneyPage() {
  const { user } = useUser();
  const { pregnancy, week, babyGrowth, loading: pregLoading } = usePregnancy(user?.id);
  const [selectedTrimester, setSelectedTrimester] = useState('all');
  const [userMilestones, setUserMilestones] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newWeek, setNewWeek] = useState(week || 16);

  useEffect(() => {
    if (user?.id && pregnancy?.id) {
      databaseService.getTimelineEvents(user.id, pregnancy.id).then(data => {
        if (data && data.length > 0) {
          setUserMilestones(data);
        } else {
          // If no events in DB, seed with defaults
          const seeded = [
            ...defaultMilestonesByTrimester.first,
            ...defaultMilestonesByTrimester.second,
            ...defaultMilestonesByTrimester.third
          ];
          setUserMilestones(seeded);
        }
      }).catch(err => {
        console.error(err);
        setUserMilestones([
          ...defaultMilestonesByTrimester.first,
          ...defaultMilestonesByTrimester.second,
          ...defaultMilestonesByTrimester.third
        ]);
      });
    } else {
      setUserMilestones([
        ...defaultMilestonesByTrimester.first,
        ...defaultMilestonesByTrimester.second,
        ...defaultMilestonesByTrimester.third
      ]);
    }
  }, [user, pregnancy]);

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEvent = {
      title: newTitle,
      description: newDesc,
      week: parseInt(newWeek),
      category: 'milestone',
      emoji: '✨',
      event_date: new Date().toISOString().split('T')[0]
    };

    try {
      if (user?.id && pregnancy?.id) {
        const added = await databaseService.addTimelineEvent(user.id, {
          pregnancy_id: pregnancy.id,
          ...newEvent
        });
        setUserMilestones(prev => [...prev, added].sort((a, b) => a.week - b.week));
      } else {
        setUserMilestones(prev => [...prev, { id: Date.now().toString(), ...newEvent }].sort((a, b) => a.week - b.week));
      }
      setNewTitle('');
      setNewDesc('');
      setIsAdding(false);
      alert("New milestone added, Mama!");
    } catch (e) {
      console.error(e);
      alert("Could not save milestone.");
    }
  };

  const filteredMilestones = useMemo(() => {
    return userMilestones.filter(m => {
      if (selectedTrimester === 'all') return true;
      const t = m.week <= 13 ? 'first' : m.week <= 27 ? 'second' : 'third';
      return t === selectedTrimester;
    });
  }, [userMilestones, selectedTrimester]);

  if (pregLoading) {
    return (
      <div className="screen" style={{ paddingTop: 40 }}>
        <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="sos-pulse" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Loading your timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ paddingBottom: 110, background: 'var(--color-warm-ivory)' }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 20 }}>
        <p className="serif-label">Little Heartbeat Journey</p>
        <h1 className="serif-display" style={{ fontSize: 32, color: 'var(--color-text-primary)', marginTop: 4 }}>
          Pregnancy Timeline
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
          Trace your weekly baby growth and personal milestones
        </p>
      </div>

      {/* Week Progress Card */}
      {week && (
        <div className="card-tint animate-fade-in-up delay-1" style={{
          padding: 20, marginBottom: 24, background: 'white', display: 'flex', flexDirection: 'column', gap: 12
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Overall Progress</span>
            <span className="badge badge-success" style={{ fontSize: 12 }}>Week {week} of 40</span>
          </div>
          <div className="progress-bar" style={{ background: 'var(--color-border-strong)', height: 8 }}>
            <div className="progress-bar-fill" style={{ width: `${Math.min(100, (week / 40) * 100)}%`, background: 'var(--color-success)' }} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'right' }}>
            {Math.round((week / 40) * 100)}% of pregnancy completed
          </p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="animate-fade-in-up delay-1" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 20 }}>
        {[
          { id: 'all', label: 'Show All' },
          { id: 'first', label: '1st Trimester' },
          { id: 'second', label: '2nd Trimester' },
          { id: 'third', label: '3rd Trimester' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTrimester(tab.id)}
            className={`badge ${selectedTrimester === tab.id ? 'badge-primary' : 'badge-outline'}`}
            style={{
              padding: '8px 16px', fontSize: 13, cursor: 'pointer', borderRadius: 'var(--radius-full)',
              background: selectedTrimester === tab.id ? 'var(--color-primary)' : 'white',
              color: selectedTrimester === tab.id ? 'white' : 'var(--color-text-secondary)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline Events List */}
      <div className="animate-fade-in-up delay-2" style={{
        position: 'relative',
        paddingLeft: 20,
        borderLeft: '2px solid var(--color-border-medium)'
      }}>
        {filteredMilestones.length > 0 ? (
          filteredMilestones.map((item, idx) => {
            const isTrimesterPast = week && item.week < week;
            const isTrimesterCurrent = week && item.week === week;

            return (
              <div 
                key={item.id || idx} 
                style={{
                  position: 'relative',
                  marginBottom: 28,
                  opacity: isTrimesterPast ? 0.85 : 1
                }}
              >
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: -29,
                  top: 4,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: isTrimesterPast ? 'var(--color-success)' : isTrimesterCurrent ? 'var(--color-primary)' : 'white',
                  border: `3px solid ${isTrimesterCurrent ? 'rgba(91,91,214,0.3)' : 'var(--color-border-strong)'}`,
                  zIndex: 2
                }} />

                {/* Event Card */}
                <div className="card" style={{ padding: 16, background: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span className="badge badge-primary" style={{
                      fontSize: 11, background: item.week <= 13 ? 'var(--color-blush-pink)' : item.week <= 27 ? 'var(--color-peach)' : 'var(--color-lavender)',
                      color: 'var(--color-text-primary)'
                    }}>
                      Week {item.week}
                    </span>
                    {item.date && (
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {item.date}
                      </span>
                    )}
                  </div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--color-text-muted)' }}>
            No milestones logged for this trimester.
          </div>
        )}
      </div>

      {/* Floating Add Milestone Trigger */}
      <div style={{ textAlign: 'center', marginTop: 10 }}>
        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="btn btn-primary"
            style={{ padding: '12px 24px', borderRadius: 'var(--radius-btn)' }}
          >
            + Add Personal Milestone
          </button>
        ) : (
          <form onSubmit={handleAddMilestone} className="card animate-fade-in-up" style={{ padding: 16, background: 'white', textAlign: 'left' }}>
            <h3 className="serif-title" style={{ fontSize: 18, marginBottom: 12 }}>New Milestone Log</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Milestone Title</label>
                <input 
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. First baby movement, baby shower"
                  className="input"
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Pregnancy Week</label>
                  <input 
                    type="number"
                    min="1"
                    max="40"
                    value={newWeek}
                    onChange={(e) => setNewWeek(e.target.value)}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Description / Note</label>
                <textarea 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe your feelings, details, etc."
                  className="input"
                  style={{ height: 60, resize: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Save</button>
              </div>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
