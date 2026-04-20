/**
 * Keyword-based topic detector for bookmarks.
 * Maps keywords found in text to a human-readable topic label.
 */

const TOPIC_MAP: [RegExp, string, string][] = [
    [/kcl|junction|current split|node analysis/i, "KCL", "bg-cyan-500/15 text-cyan-400 border-cyan-500/25"],
    [/kvl|loop|voltage law|mesh/i, "KVL", "bg-purple-500/15 text-purple-400 border-purple-500/25"],
    [/ohm'?s?|v\s*=\s*ir|resistiv/i, "Ohm's Law", "bg-blue-500/15 text-blue-400 border-blue-500/25"],
    [/wheatstone|bridge/i, "Wheatstone Bridge", "bg-amber-500/15 text-amber-400 border-amber-500/25"],
    [/potentiometer/i, "Potentiometer", "bg-green-500/15 text-green-400 border-green-500/25"],
    [/galvanometer/i, "Galvanometer", "bg-rose-500/15 text-rose-400 border-rose-500/25"],
    [/drift|mobility|mean free/i, "Drift Velocity", "bg-indigo-500/15 text-indigo-400 border-indigo-500/25"],
    [/kirchhoff/i, "Kirchhoff's Laws", "bg-violet-500/15 text-violet-400 border-violet-500/25"],
    [/emf|internal resistance|cell/i, "EMF & Cells", "bg-yellow-500/15 text-yellow-400 border-yellow-500/25"],
    [/power|energy|watt|joule|heating effect/i, "Power & Energy", "bg-orange-500/15 text-orange-400 border-orange-500/25"],
    [/ammeter|voltmeter|meter bridge/i, "Measuring Instruments", "bg-teal-500/15 text-teal-400 border-teal-500/25"],
    [/series|parallel|network|circuit/i, "Circuit Analysis", "bg-sky-500/15 text-sky-400 border-sky-500/25"],
    [/resistivity|conductivity/i, "Resistivity", "bg-lime-500/15 text-lime-400 border-lime-500/25"],
];

export interface TopicResult {
    name: string;
    colorClass: string;
}

export function detectTopic(text: string): TopicResult {
    for (const [regex, topic, color] of TOPIC_MAP) {
        if (regex.test(text)) return { name: topic, colorClass: color };
    }
    return { name: "Current Electricity", colorClass: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25" };
}
