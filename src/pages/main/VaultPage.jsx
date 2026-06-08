import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser.js';
import databaseService from '../../services/databaseService.js';

function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{
      textAlign: 'center', padding: '48px 24px',
      background: 'var(--color-surface-tint)',
      borderRadius: 'var(--radius-card)',
      border: '1px dashed var(--color-border-strong)',
    }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{subtitle}</p>
    </div>
  );
}

const filterChips = ['All', 'Prescriptions', 'Lab Reports', 'Scans', 'Medical'];

export default function VaultPage() {
  const { user, loading: userLoading } = useUser();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    databaseService.getDocuments(user.id).then(docs => {
      setDocuments(docs || []);
      setLoading(false);
    });
  }, [user?.id]);

  const filtered = documents.filter(doc => {
    const matchFilter = activeFilter === 'All' || doc.category === activeFilter;
    const matchSearch = !search || (doc.title || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (userLoading || loading) {
    return (
      <div className="screen" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div className="sos-pulse" style={{ margin: '0 auto 16px' }} />
        <p className="text-secondary" style={{ fontSize: 14 }}>Loading your vault...</p>
      </div>
    );
  }

  return (
    <div className="screen" style={{ paddingTop: 20 }}>
      <header className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
            Health Vault
          </h1>
          <p className="small" style={{ marginTop: 4, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>{documents.length} document{documents.length !== 1 ? 's' : ''}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>🔒 Encrypted</span>
          </p>
        </div>
        <button className="btn btn-primary btn-sm" style={{ gap: 6, padding: '10px 16px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Upload
        </button>
      </header>

      <div className="animate-fade-in-up delay-1" style={{
        border: '2px dashed rgba(91,91,214,0.3)',
        background: 'var(--color-surface-tint)',
        borderRadius: 'var(--radius-card)', padding: '20px',
        textAlign: 'center', marginBottom: 20, cursor: 'pointer',
        transition: 'all var(--transition-normal)',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 10px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 16 12 12 8 16"/>
            <line x1="12" y1="12" x2="12" y2="21"/>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
          </svg>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
          Upload Prescription or Report
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 14 }}>
          Tap to scan, photograph or import
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {['Prescription', 'Lab Report', 'Scan'].map(t => (
            <button key={t} style={{
              padding: '6px 12px', borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--color-border-strong)',
              background: 'white', color: 'var(--color-primary)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-family)',
            }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-fade-in-up delay-1" style={{ marginBottom: 16 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            type="text"
            className="input"
            style={{ paddingLeft: 40 }}
            placeholder="Search prescriptions, reports..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="scroll-x animate-fade-in-up delay-2" style={{ marginBottom: 20 }}>
        {filterChips.map(chip => (
          <button
            key={chip}
            onClick={() => setActiveFilter(chip)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: activeFilter === chip ? 'var(--color-primary)' : 'white',
              color: activeFilter === chip ? 'white' : 'var(--color-text-secondary)',
              fontWeight: 600, fontSize: 13,
              border: activeFilter === chip ? 'none' : '1.5px solid var(--color-border-medium)',
              cursor: 'pointer', transition: 'all var(--transition-fast)',
              fontFamily: 'var(--font-family)', whiteSpace: 'nowrap',
              boxShadow: activeFilter === chip ? 'var(--shadow-primary)' : 'none',
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((doc, i) => (
            <DocumentCard key={doc.id} doc={doc} animIndex={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📂"
          title={documents.length === 0 ? 'No Documents Yet' : 'No Matching Documents'}
          subtitle={documents.length === 0
            ? 'Upload your first prescription, lab report, or scan to get AI-powered health insights.'
            : 'Try a different filter or search term.'}
        />
      )}
    </div>
  );
}

function DocumentCard({ doc, animIndex }) {
  const [expanded, setExpanded] = useState(false);

  const aiSummary = doc.ai_summary || doc.aiSummary;
  const tags = doc.tags || [];

  return (
    <div
      className={`card card-interactive animate-fade-in-up`}
      style={{ padding: 20, animationDelay: `${animIndex * 0.07}s` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3 mb-3">
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: doc.icon_bg || 'var(--color-primary-tint)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
        }}>
          {doc.icon || '📄'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>
            {doc.title}
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
            {doc.doctor_name ? ` · ${doc.doctor_name}` : ''}
          </p>
        </div>
        <div style={{ color: 'var(--color-text-muted)', flexShrink: 0, transition: 'transform var(--transition-fast)', transform: expanded ? 'rotate(180deg)' : 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-3">
        {tags.map(tag => (
          <span key={tag} className="badge badge-outline" style={{ fontSize: 11 }}>{tag}</span>
        ))}
        {doc.category && (
          <span className="badge badge-primary" style={{ fontSize: 11 }}>{doc.category}</span>
        )}
      </div>

      {expanded && aiSummary && (
        <div className="ai-summary" style={{ marginTop: 4 }}>
          <div className="flex items-center gap-2 mb-10" style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 14 }}>✨</span>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>
              AI Summary
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(Array.isArray(aiSummary) ? aiSummary : []).map((row, i) => (
              <div key={i} className="flex items-center justify-between">
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{row.label}</span>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{row.value}</span>
                  {row.status && (
                    <span className={`badge badge-${row.type || 'outline'}`} style={{ fontSize: 10 }}>{row.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {expanded && (
        <div className="flex gap-2 mt-4" onClick={e => e.stopPropagation()}>
          {['View', 'Share', 'Delete'].map((action) => (
            <button
              key={action}
              style={{
                flex: action === 'Delete' ? 'none' : 1,
                padding: '8px 12px', borderRadius: 10,
                background: action === 'Delete' ? 'var(--color-danger-tint)' : 'var(--color-surface-tint)',
                border: '1px solid ' + (action === 'Delete' ? 'rgba(255,107,107,0.2)' : 'var(--color-border)'),
                color: action === 'Delete' ? 'var(--color-danger)' : 'var(--color-text-primary)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-family)',
              }}
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
