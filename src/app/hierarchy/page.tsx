'use client';

import { useState, useEffect } from 'react';

interface Person {
    id: string;
    name: string;
    role: string;
    parentId?: string;
    email?: string;
}

export default function HierarchyPage() {
    const [people, setPeople] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/persons')
            .then(res => res.json())
            .then(data => {
                setPeople(data);
                setLoading(false);
            });
    }, []);

    const roots = people.filter(p => !p.parentId && (p.role === 'OWNER' || p.role === 'STAFF'));

    function renderTree(parentId: string, depth = 0) {
        const children = people.filter(p => p.parentId === parentId);
        if (children.length === 0) return null;

        return (
            <ul style={{ paddingLeft: 20, borderLeft: '1px solid rgba(255,255,255,0.1)', marginLeft: 10, marginTop: 10 }}>
                {children.map(child => (
                    <li key={child.id} style={{ listStyle: 'none', marginBottom: 15 }}>
                        <div className="hierarchy-node" style={{
                            background: 'var(--bg-secondary)',
                            padding: '10px 15px',
                            borderRadius: 8,
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'inline-block',
                            minWidth: 200
                        }}>
                            <div style={{ fontWeight: 'bold' }}>{child.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {child.role} {child.email && `· ${child.email}`}
                            </div>
                        </div>
                        {renderTree(child.id, depth + 1)}
                    </li>
                ))}
            </ul>
        );
    }

    if (loading) return <div>Loading Organization...</div>;

    return (
        <div className="container">
            <div className="page-header">
                <h1>Organization Hierarchy</h1>
                <p>Manage multi-level team structure and resource allocation</p>
            </div>

            <div className="hierarchy-viz" style={{ padding: '20px 0' }}>
                {roots.length === 0 && <p className="text-muted">No organizational structure defined yet.</p>}
                {roots.map(root => (
                    <div key={root.id} style={{ marginBottom: 40 }}>
                        <div className="hierarchy-node root" style={{
                            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                            color: 'white',
                            padding: '15px 25px',
                            borderRadius: 12,
                            display: 'inline-block',
                            minWidth: 240,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                        }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{root.name}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{root.role} (Top Level)</div>
                        </div>
                        {renderTree(root.id)}
                    </div>
                ))}
            </div>

            <div className="alert-note" style={{ marginTop: 40, opacity: 0.7 }}>
                💡 Tip: You can assign supervisors to staff and converted leads to create a hierarchical view of your operations.
            </div>
        </div>
    );
}
