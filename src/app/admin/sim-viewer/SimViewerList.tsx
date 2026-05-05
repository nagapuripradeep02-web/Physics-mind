"use client";

import Link from "next/link";
import type { SimCacheRow } from "./page";

interface Props {
    rows: SimCacheRow[];
}

function formatRelativeTime(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    const days = Math.floor(ms / 86_400_000);
    if (days >= 1) return `${days}d ago`;
    const hrs = Math.floor(ms / 3_600_000);
    if (hrs >= 1) return `${hrs}h ago`;
    const mins = Math.floor(ms / 60_000);
    return `${mins}m ago`;
}

export function SimViewerList({ rows }: Props) {
    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-slate-800 text-slate-300">
                    <tr>
                        <th className="text-left px-4 py-2 font-mono">concept_key</th>
                        <th className="text-left px-4 py-2">sim_type</th>
                        <th className="text-right px-4 py-2">served</th>
                        <th className="text-right px-4 py-2">states</th>
                        <th className="text-center px-4 py-2">panel B</th>
                        <th className="text-right px-4 py-2">size</th>
                        <th className="text-left px-4 py-2">created</th>
                        <th className="text-right px-4 py-2">action</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id} className="border-t border-slate-800 hover:bg-slate-800/50">
                            <td className="px-4 py-2 font-mono text-emerald-300">{row.concept_key}</td>
                            <td className="px-4 py-2 text-slate-300">{row.sim_type ?? "—"}</td>
                            <td className="px-4 py-2 text-right tabular-nums text-slate-300">{row.served_count}</td>
                            <td className="px-4 py-2 text-right tabular-nums text-slate-300">
                                {row.state_count > 0 ? row.state_count : <span className="text-rose-400">0</span>}
                            </td>
                            <td className="px-4 py-2 text-center">
                                {row.has_panel_b ? (
                                    <span className="text-blue-300">✓</span>
                                ) : (
                                    <span className="text-slate-600">—</span>
                                )}
                            </td>
                            <td className="px-4 py-2 text-right tabular-nums text-slate-500">
                                {(row.sim_html_len / 1024).toFixed(0)}KB
                            </td>
                            <td className="px-4 py-2 text-slate-500 text-xs">{formatRelativeTime(row.created_at)}</td>
                            <td className="px-4 py-2 text-right">
                                {row.state_count > 0 ? (
                                    <Link
                                        href={`/admin/sim-viewer/${row.id}`}
                                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded"
                                    >
                                        Open
                                    </Link>
                                ) : (
                                    <span className="text-xs text-slate-600">no states</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
