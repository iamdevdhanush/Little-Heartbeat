import React, { useState, useMemo } from 'react';
import { useUser } from '../../hooks/useUser.js';
import { usePregnancy } from '../../hooks/usePregnancy.js';

// Week-by-week metadata database
const weekDetails = {
  1: { size: 'Sesame Seed', emoji: '🌱', length: '0.1', weight: '0.01', trimester: 1, remaining: 39, fruit: 'a poppy seed',
       insights: {
         brain: 'Neural plate begins to form. Crucial developmental block.',
         heart: 'Cardiovascular system starts organizing.',
         lungs: 'Respiratory pathways not yet defined.',
         limbs: 'Buds will appear in coming weeks.',
         senses: 'Receptors not yet developed.',
         body: 'Uterine lining thickening to receive the embryo.',
         nutrition: 'Increase folic acid intake immediately.',
         tips: 'Rest and avoid any strenuous weightlifting.'
       }
  },
  8: { size: 'Raspberry', emoji: '🍇', length: '1.6', weight: '1.0', trimester: 1, remaining: 32, fruit: 'a raspberry',
       insights: {
         brain: 'Neural pathways branching rapidly. Millions of neurons form daily.',
         heart: 'Heart beats at 150 bpm, dividing into four chambers.',
         lungs: 'Trachea and bronchial tubes forming.',
         limbs: 'Webbed fingers and toes begin to separate.',
         senses: 'Optic cups forming. Eyes remain shut.',
         body: 'Slight bloating and morning sickness peaking.',
         nutrition: 'Hydrate well; ginger tea helps with nausea.',
         tips: 'Book your first prenatal scan if not done.'
       }
  },
  16: { size: 'Avocado', emoji: '🥑', length: '12.0', weight: '100.0', trimester: 2, remaining: 24, fruit: 'an avocado',
       insights: {
         brain: 'Cerebellar control begins. Motor reflexes coordinate.',
         heart: 'Pumping ~25 quarts of blood daily. Heartbeat audible via Doppler.',
         lungs: 'Practicing breathing movements with amniotic fluid.',
         limbs: 'Joints fully functional. Fingerprints are set.',
         senses: 'Eyes can detect light through eyelids. Hearing begins.',
         body: 'Energy returning. Pregnancy glow apparent.',
         nutrition: 'Boost calcium intake for baby\'s bone hardening.',
         tips: 'Start side-sleeping using supportive pillows.'
       }
  },
  24: { size: 'Cantaloupe', emoji: '🍈', length: '30.0', weight: '600.0', trimester: 2, remaining: 16, fruit: 'an ear of corn',
       insights: {
         brain: 'Brain waves show sleep/wake cycles. Sensory cortex matures.',
         heart: 'Stable cardiac rhythm. Blood vessels proliferating.',
         lungs: 'Surfactant production starting. Crucial for air breathing.',
         limbs: 'Grip reflex develops. Fetus grasps umbilical cord.',
         senses: 'Inner ear complete. Can sense baby\'s upside-down position.',
         body: 'Skin stretching. Mindful posture relieves lower back strain.',
         nutrition: 'Focus on lean proteins and complex carbohydrates.',
         tips: 'Take a glucose screening test to rule out gestational diabetes.'
       }
  },
  32: { size: 'Squash', emoji: '🍊', length: '42.0', weight: '1700.0', trimester: 3, remaining: 8, fruit: 'a jicama',
       insights: {
         brain: 'Thalamocortical connections fully active. Sensory processing online.',
         heart: 'Strong contractions. Pulse coordinates with mother\'s activity.',
         lungs: 'Alveoli maturing. Breathing movements frequent.',
         limbs: 'Toenails and fingernails fully grown. Coordination increases.',
         senses: 'Eyes open during waking periods. Reacts to bright light.',
         body: 'Breathing shallower as uterus presses against ribcage.',
         nutrition: 'Eat smaller, frequent meals to avoid acid reflux.',
         tips: 'Create your birth plan and prepare the hospital bag.'
       }
  },
  40: { size: 'Pumpkin', emoji: '🎃', length: '51.0', weight: '3400.0', trimester: 3, remaining: 0, fruit: 'a watermelon',
       insights: {
         brain: 'Brain is fully developed, containing billions of synaptic circuits.',
         heart: 'Pumping blood efficiently. Ready for transition to air.',
         lungs: 'Fully prepared to take the first breath at birth.',
         limbs: 'Grip is strong. Movements are tight due to limited space.',
         senses: 'Fully responsive to voice, touch, and light.',
         body: 'Pelvic pressure peaks. Braxton Hicks contractions frequent.',
         nutrition: 'Maintain energy levels with light, nutritious snacks.',
         tips: 'Rest as much as possible. Keep emergency SOS setup verified.'
       }
  }
};

// Fill in other weeks dynamically so the slider is smooth
const getWeekStats = (w) => {
  const keys = Object.keys(weekDetails).map(Number).sort((a, b) => a - b);
  let lowKey = keys[0];
  let highKey = keys[keys.length - 1];

  for (let i = 0; i < keys.length; i++) {
    if (keys[i] <= w) lowKey = keys[i];
    if (keys[i] >= w) {
      highKey = keys[i];
      break;
    }
  }

  const low = weekDetails[lowKey];
  const high = weekDetails[highKey];

  if (lowKey === highKey) return low;

  // Interpolate numerical values
  const ratio = (w - lowKey) / (highKey - lowKey);
  const length = (parseFloat(low.length) + (parseFloat(high.length) - parseFloat(low.length)) * ratio).toFixed(1);
  const weight = Math.round(parseFloat(low.weight) + (parseFloat(high.weight) - parseFloat(low.weight)) * ratio);
  const remaining = Math.max(0, 40 - w);
  const trimester = w <= 13 ? 1 : w <= 26 ? 2 : 3;

  return {
    size: w < 5 ? 'Sesame Seed' : w < 12 ? 'Raspberry' : w < 20 ? 'Avocado' : w < 28 ? 'Cantaloupe' : w < 36 ? 'Squash' : 'Pumpkin',
    emoji: w < 5 ? '🌱' : w < 12 ? '🍇' : w < 20 ? '🥑' : w < 28 ? '🍈' : w < 36 ? '🍊' : '🎃',
    length,
    weight,
    trimester,
    remaining,
    fruit: high.fruit,
    insights: low.insights // Use low key's insights as baseline
  };
};

export default function BabyPage() {
  const { user } = useUser();
  const { pregnancy } = usePregnancy(user?.id);

  // Set default starting week from user profile or default to week 16 (trimester 2)
  const defaultWeek = pregnancy?.current_week || 16;
  const [currentWeek, setCurrentWeek] = useState(defaultWeek);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  const stats = useMemo(() => getWeekStats(currentWeek), [currentWeek]);

  // Fetus size scale factor based on gestation week
  const fetusScale = useMemo(() => {
    return 0.4 + (currentWeek / 40) * 0.6;
  }, [currentWeek]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleHotspotClick = (spot) => {
    setActiveHotspot(activeHotspot === spot ? null : spot);
  };

  return (
    <div className="screen" style={{ paddingBottom: 110, background: 'var(--color-warm-ivory)' }}>
      {/* Title */}
      <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 16 }}>
        <p className="serif-label">Little Heartbeat Companion</p>
        <h1 className="serif-display" style={{ fontSize: 32, color: 'var(--color-text-primary)', marginTop: 4 }}>
          Baby's Growth
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
          Week {currentWeek} · Trimester {stats.trimester} · {stats.remaining} Weeks Left
        </p>
      </div>

      {/* Main Interactive Hero Box (70% viewport area or approx 360px height) */}
      <div className="card-tint animate-fade-in delay-1" style={{
        position: 'relative',
        height: 380,
        borderRadius: 'var(--radius-hero)',
        overflow: 'hidden',
        background: 'radial-gradient(circle, rgba(253,228,228,0.4) 0%, rgba(243,236,252,0.6) 70%, rgba(250,246,240,0.8) 100%)',
        border: '1px solid rgba(91, 91, 214, 0.08)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Soft floating background particles */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="sos-pulse" style={{
              position: 'absolute',
              width: 12 + (i % 3) * 8,
              height: 12 + (i % 3) * 8,
              borderRadius: '50%',
              background: i % 2 === 0 ? 'var(--color-blush-pink)' : 'var(--color-lavender)',
              opacity: 0.35,
              top: `${(i * 13) % 90}%`,
              left: `${(i * 17) % 90}%`,
              animationDuration: `${4 + i * 2}s`,
              animationDelay: `${i * 0.5}s`
            }} />
          ))}
        </div>

        {/* Fetus Visualization Model (Amniotic Sac Container) */}
        <div style={{
          transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
          transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(8px)',
          border: '1.5px solid rgba(255, 255, 255, 0.5)',
          boxShadow: 'inset 0 0 30px rgba(255, 160, 137, 0.2), 0 10px 30px rgba(91, 91, 214, 0.06)'
        }}>
          {/* Animated Umbilical Cord line */}
          <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
            <path d="M 130 130 Q 110 160, 80 180 T 50 190" fill="none" stroke="rgba(255, 160, 137, 0.4)" strokeWidth="3" strokeDasharray="3 3" />
          </svg>

          {/* Stylized Fetus Fetal Heart / Shape Vector */}
          <div className="animate-heartbeat" style={{
            transform: `scale(${fetusScale})`,
            width: 140,
            height: 140,
            background: 'radial-gradient(circle, rgba(255,180,180,0.85) 0%, rgba(255,140,160,0.65) 50%, rgba(243,220,255,0.4) 100%)',
            borderRadius: '45% 55% 50% 50% / 55% 50% 50% 45%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(255, 160, 137, 0.25)',
            position: 'relative'
          }}>
            {/* Pulsing Heart Center */}
            <div style={{
              width: 14,
              height: 14,
              background: '#FFA089',
              borderRadius: '50%',
              boxShadow: '0 0 12px #FFA089',
              animation: 'heartbeat 1.2s infinite ease-in-out',
              position: 'absolute',
              top: '55%',
              left: '42%'
            }} />

            {/* Baby Fetus Face detail indicator */}
            <div style={{
              width: 8,
              height: 8,
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '50%',
              position: 'absolute',
              top: '25%',
              left: '60%'
            }} />
          </div>

          {/* Interactive HOTSPOTS */}
          {/* Brain Hotspot */}
          <div 
            onClick={() => handleHotspotClick('brain')}
            style={{
              position: 'absolute', top: '25%', left: '46%', cursor: 'pointer', zIndex: 10
            }}
          >
            <div className="sos-pulse" style={{ width: 24, height: 24, background: 'rgba(91, 91, 214, 0.4)' }} />
            <div style={{ width: 10, height: 10, background: '#5B5BD6', borderRadius: '50%', position: 'absolute', top: 7, left: 7 }} />
          </div>

          {/* Heart Hotspot */}
          <div 
            onClick={() => handleHotspotClick('heart')}
            style={{
              position: 'absolute', top: '56%', left: '42%', cursor: 'pointer', zIndex: 10
            }}
          >
            <div className="sos-pulse" style={{ width: 24, height: 24, background: 'rgba(255, 107, 107, 0.4)', animationDelay: '0.4s' }} />
            <div style={{ width: 10, height: 10, background: '#FFA089', borderRadius: '50%', position: 'absolute', top: 7, left: 7 }} />
          </div>

          {/* Limbs Hotspot */}
          <div 
            onClick={() => handleHotspotClick('limbs')}
            style={{
              position: 'absolute', top: '70%', left: '60%', cursor: 'pointer', zIndex: 10
            }}
          >
            <div className="sos-pulse" style={{ width: 24, height: 24, background: 'rgba(47, 191, 113, 0.4)', animationDelay: '0.8s' }} />
            <div style={{ width: 10, height: 10, background: '#2FBF71', borderRadius: '50%', position: 'absolute', top: 7, left: 7 }} />
          </div>
        </div>

        {/* Hotspot details overlay */}
        {activeHotspot && (
          <div className="animate-fade-in-up" style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(12px)',
            padding: 16,
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(91, 91, 214, 0.1)',
            zIndex: 30
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span className="label" style={{ color: 'var(--color-primary)', textTransform: 'uppercase', fontSize: 11 }}>
                {activeHotspot === 'brain' ? '🧠 Neural Development' : activeHotspot === 'heart' ? '❤️ Cardiovascular Growth' : '💪 Limb & Muscle Coordination'}
              </span>
              <button onClick={() => setActiveHotspot(null)} style={{ fontSize: 18, color: 'var(--color-text-muted)' }}>&times;</button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
              {activeHotspot === 'brain' ? stats.insights.brain : activeHotspot === 'heart' ? stats.insights.heart : stats.insights.limbs}
            </p>
          </div>
        )}

        {/* Top left controls */}
        <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button 
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2))}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}
          >
            +
          </button>
          <button 
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}
          >
            −
          </button>
        </div>

        {/* Top right rotation controls */}
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <button 
            onClick={() => setRotation(prev => (prev + 45) % 360)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: 14 }}
            title="Rotate"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Week selection slider bar */}
      <div className="card animate-fade-in-up delay-2" style={{ marginTop: 16, padding: '16px 20px', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Select Pregnancy Week</span>
          <span className="badge badge-primary" style={{ fontSize: 14, padding: '6px 12px' }}>Week {currentWeek}</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="40" 
          value={currentWeek} 
          onChange={(e) => setCurrentWeek(parseInt(e.target.value))}
          style={{
            width: '100%',
            accentColor: 'var(--color-primary)',
            height: 6,
            borderRadius: 3,
            outline: 'none',
            background: 'var(--color-warm-ivory)'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--color-text-muted)' }}>
          <span>Conception (W1)</span>
          <span>Week 20</span>
          <span>Due Date (W40)</span>
        </div>
      </div>

      {/* Numerical growth stats */}
      <div className="animate-fade-in-up delay-2" style={{
        marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12
      }}>
        <div className="card" style={{ padding: 14, textAlign: 'center', background: 'white' }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Length</span>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 4 }}>{stats.length} cm</p>
        </div>
        <div className="card" style={{ padding: 14, textAlign: 'center', background: 'white' }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Weight</span>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 4 }}>{stats.weight} g</p>
        </div>
        <div className="card" style={{ padding: 14, textAlign: 'center', background: 'white' }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Size of</span>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-primary)', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span>{stats.emoji}</span> <span style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{stats.size}</span>
          </p>
        </div>
      </div>

      {/* Size Comparison Card */}
      <div className="card-tint animate-fade-in-up delay-3" style={{
        marginTop: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 16,
        background: 'var(--color-peach)', border: '1px solid rgba(255, 160, 137, 0.15)'
      }}>
        <span style={{ fontSize: 36 }}>{stats.emoji}</span>
        <div>
          <h4 className="serif-title" style={{ fontSize: 18, color: 'var(--color-text-primary)', marginBottom: 2 }}>
            As big as {stats.fruit}
          </h4>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
            Your little one has reached the size of {stats.fruit}! Growth speeds up rapidly from this week forward.
          </p>
        </div>
      </div>

      {/* Expandable Development Guides */}
      <div className="animate-fade-in-up delay-3" style={{ marginTop: 24 }}>
        <h3 className="serif-label" style={{ fontSize: 14, marginBottom: 12 }}>Detailed Development Guides</h3>

        {/* Section Cards */}
        {[
          { id: 'body', label: '🤰 Mother\'s Body Changes', text: stats.insights.body },
          { id: 'lungs', label: '🫁 Lungs & Respiration', text: stats.insights.lungs },
          { id: 'senses', label: '👁️ Sensory Organs', text: stats.insights.senses },
          { id: 'nutrition', label: '🥗 Nutrition Tips', text: stats.insights.nutrition },
          { id: 'tips', label: '🩺 Medical Advice & Tips', text: stats.insights.tips }
        ].map((sec) => {
          const isExpanded = expandedSection === sec.id;
          return (
            <div key={sec.id} className="card" style={{ marginBottom: 10, overflow: 'hidden', background: 'white' }}>
              <div 
                onClick={() => toggleSection(sec.id)}
                style={{
                  padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                  background: isExpanded ? 'rgba(91, 91, 214, 0.02)' : 'white'
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>{sec.label}</span>
                <span style={{
                  fontSize: 12, transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--color-text-muted)'
                }}>
                  ▶
                </span>
              </div>
              {isExpanded && (
                <div style={{ padding: '0 20px 16px 20px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  <div className="divider" style={{ marginBottom: 12 }} />
                  <p>{sec.text}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
