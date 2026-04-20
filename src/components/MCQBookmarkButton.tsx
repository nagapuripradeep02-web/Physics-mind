"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useBookmarks, type MCQBookmark } from "@/contexts/BookmarkContext";

interface MCQBookmarkButtonProps {
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
    exam: string;
    difficulty: string;
    marks?: string;
    exam_tip?: string;
}

export default function MCQBookmarkButton(props: MCQBookmarkButtonProps) {
    const { addBookmark, removeBookmark } = useBookmarks();
    const [bookmarkId, setBookmarkId] = useState<string | null>(null);
    const [animating, setAnimating] = useState(false);

    const handleToggle = () => {
        if (bookmarkId) {
            removeBookmark(bookmarkId);
            setBookmarkId(null);
        } else {
            setAnimating(true);
            const payload: MCQBookmark = {
                type: "mcq_question",
                question: props.question,
                options: props.options,
                correct_index: props.correct_index,
                explanation: props.explanation,
                exam: props.exam,
                difficulty: props.difficulty,
                marks: props.marks,
                exam_tip: props.exam_tip,
            };
            const id = addBookmark(payload);
            setBookmarkId(id);
            setTimeout(() => setAnimating(false), 400);
        }
    };

    const saved = !!bookmarkId;

    return (
        <button
            onClick={handleToggle}
            title={saved ? "Remove bookmark" : "Bookmark this question"}
            className={`p-1.5 rounded-lg transition-all duration-200 ${animating ? "scale-125" : "scale-100"} ${saved
                ? "text-amber-400 bg-amber-400/10 border border-amber-400/25"
                : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 border border-transparent"
                }`}
        >
            {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
    );
}
