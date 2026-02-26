'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalProperties: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  activeLeads: number;
  totalInteractions: number;
}

interface InteractionItem {
  id: string;
  person: { name: string };
  room?: { number: string; building: { name: string } } | null;
  channel: string;
  direction: string;
  subject: string;
  content: string;
  tags: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    vacantRooms: 0,
    activeLeads: 0,
    totalInteractions: 0,
  });
  const [interactions, setInteractions] = useState<InteractionItem[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [propRes, roomRes, personRes, interRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/rooms'),
        fetch('/api/persons?role=LEAD'),
        fetch('/api/interactions?limit=5'),
      ]);
      const props = await propRes.json();
      const rooms = await roomRes.json();
      const leads = await personRes.json();
      const inters = await interRes.json();

      setStats({
        totalProperties: Array.isArray(props) ? props.length : 0,
        totalRooms: Array.isArray(rooms) ? rooms.length : 0,
        occupiedRooms: Array.isArray(rooms) ? rooms.filter((r: { status: string }) => r.status === 'OCCUPIED').length : 0,
        vacantRooms: Array.isArray(rooms) ? rooms.filter((r: { status: string }) => r.status === 'VACANT').length : 0,
        activeLeads: Array.isArray(leads) ? leads.length : 0,
        totalInteractions: Array.isArray(inters) ? inters.length : 0,
      });
      setInteractions(Array.isArray(inters) ? inters : []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      setToastMessage(data.message || 'Demo data created!');
      fetchData();
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Seed failed:', err);
      setToastMessage('Failed to seed data');
      setTimeout(() => setToastMessage(''), 3000);
    }
    setSeeding(false);
  }

  function getChannelIcon(channel: string) {
    switch (channel) {
      case 'PHONE': return '📞';
      case 'EMAIL': return '📧';
      case 'CHAT': return '💬';
      case 'WALK_IN': return '🚶';
      case 'LINE': return '💚';
      default: return '📝';
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  const occupancyRate = stats.totalRooms > 0
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
    : 0;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back — here is your property operations overview</p>
        </div>
        <button className="btn btn-primary" onClick={handleSeed} disabled={seeding}>
          {seeding ? '⏳ Seeding...' : '🌱 Seed Demo Data'}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">🏢</div>
          <div className="stat-value">{stats.totalProperties}</div>
          <div className="stat-label">Properties</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-icon">🏠</div>
          <div className="stat-value">{stats.totalRooms}</div>
          <div className="stat-label">Total Rooms</div>
          <div className="stat-change positive">{occupancyRate}% occupancy</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{stats.activeLeads}</div>
          <div className="stat-label">Active Leads</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">💬</div>
          <div className="stat-value">{stats.totalInteractions}</div>
          <div className="stat-label">Interactions</div>
        </div>
      </div>

      <div className="content-grid">
        <div>
          <div className="section-header">
            <h2>Recent Interactions</h2>
            <a href="/interactions" className="view-all">View all →</a>
          </div>
          <div className="interaction-feed">
            {interactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h3>No interactions yet</h3>
                <p>Click &ldquo;Seed Demo Data&rdquo; to get started with sample data, or create your first interaction.</p>
              </div>
            ) : (
              interactions.map((inter) => (
                <div key={inter.id} className="interaction-item">
                  <div className={`interaction-avatar ${inter.channel.toLowerCase().replace('_', '-')}`}>
                    {getChannelIcon(inter.channel)}
                  </div>
                  <div className="interaction-body">
                    <div className="interaction-header-row">
                      <span className="person-name">{inter.person.name}</span>
                      <span className="time">{timeAgo(inter.createdAt)}</span>
                    </div>
                    <div className="subject">{inter.subject}</div>
                    {inter.tags && (
                      <div className="tags">
                        {inter.tags.split(',').filter(Boolean).map((tag, i) => (
                          <span key={i} className="badge blue">{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <div className="section-header">
            <h2>Quick Stats</h2>
          </div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Room Status Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>🟢 Vacant</span>
                <span style={{ fontWeight: 700 }}>{stats.vacantRooms}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>🔵 Occupied</span>
                <span style={{ fontWeight: 700 }}>{stats.occupiedRooms}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>🟡 Maintenance</span>
                <span style={{ fontWeight: 700 }}>{stats.totalRooms > 0 ? stats.totalRooms - stats.occupiedRooms - stats.vacantRooms : 0}</span>
              </div>
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="/interactions" className="btn btn-secondary btn-sm">➕ New Interaction</a>
              <a href="/leads" className="btn btn-secondary btn-sm">🎯 View Lead Pipeline</a>
              <a href="/rooms" className="btn btn-secondary btn-sm">🏠 Room Status Board</a>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="toast success">
          ✅ {toastMessage}
        </div>
      )}
    </>
  );
}
