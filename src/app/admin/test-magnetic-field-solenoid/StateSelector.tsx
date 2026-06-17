'use client';

import { useState } from 'react';

type StateEntry = {
    id: string;
    title: string;
    description: string;
    html: string;
};

export default function StateSelector({ states }: { states: StateEntry[] }) {
    const [activeId, setActiveId] = useState(states[0]?.id ?? 'STATE_1');
    const active = states.find((s) => s.id === activeId) ?? states[0];

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 12,
                }}
            >
                {states.map((s) => {
                    const isActive = s.id === activeId;
                    return (
                        <button
                            key={s.id}
                            onClick={() => setActiveId(s.id)}
                            style={{
                                padding: '6px 12px',
                                fontSize: 12,
                                fontFamily: 'system-ui, sans-serif',
                                background: isActive ? '#FCD34D' : '#1F2937',
                                color: isActive ? '#0A0A1A' : '#E5E7EB',
                                border: '1px solid #374151',
                                cursor: 'pointer',
                                fontWeight: isActive ? 600 : 400,
                            }}
                        >
                            {s.id}
                        </button>
                    );
                })}
            </div>
            {active && (
                <section>
                    <h2
                        style={{
                            fontSize: 14,
                            marginBottom: 4,
                            color: '#FCD34D',
                            fontFamily: 'system-ui, sans-serif',
                        }}
                    >
                        {active.id} — {active.title}
                    </h2>
                    <p
                        style={{
                            fontSize: 11,
                            opacity: 0.65,
                            marginBottom: 8,
                            maxWidth: 760,
                            fontFamily: 'system-ui, sans-serif',
                            color: '#E5E7EB',
                        }}
                    >
                        {active.description}
                    </p>
                    <iframe
                        key={active.id}
                        srcDoc={active.html}
                        style={{
                            width: 820,
                            height: 540,
                            border: '1px solid #1F2937',
                            backgroundColor: '#0A0A1A',
                        }}
                        title={`${active.id}-render`}
                    />
                </section>
            )}
        </div>
    );
}
