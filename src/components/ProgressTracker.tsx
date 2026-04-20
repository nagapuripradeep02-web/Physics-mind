import { BookOpen, HelpCircle, Target } from "lucide-react";

interface ProgressTrackerProps {
    questionsAsked: number;
    understandingScore: number;
}

export default function ProgressTracker({
    questionsAsked,
    understandingScore
}: ProgressTrackerProps) {
    return (
        <aside className="w-full bg-zinc-900 border-r border-zinc-800 h-full p-6 flex flex-col gap-8 hidden md:flex">
            <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    PhysicsMind
                </h2>
                <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-semibold">
                    AI Tutor
                </p>
            </div>

            <div className="space-y-6 flex-1">
                <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50 shadow-inner">
                    <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-semibold text-zinc-200">Current Topic</h3>
                    </div>
                    <p className="text-sm text-zinc-300 font-medium">Kirchhoff&apos;s Laws</p>
                    <p className="text-xs text-zinc-500 mt-1">Current Electricity</p>
                </div>

                <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50 shadow-inner">
                    <div className="flex items-center gap-2 mb-3">
                        <HelpCircle className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-sm font-semibold text-zinc-200">Questions Asked</h3>
                    </div>
                    <p className="text-2xl font-bold text-zinc-100">{questionsAsked}</p>
                </div>

                <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50 shadow-inner">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-semibold text-zinc-200">Understanding</h3>
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                        <p className="text-2xl font-bold text-zinc-100">{understandingScore}%</p>
                    </div>
                    <div className="w-full bg-zinc-950 rounded-full h-2">
                        <div
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${understandingScore}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="text-center">
                <p className="text-xs text-zinc-600">Built for JEE & CBSE</p>
            </div>
        </aside>
    );
}
