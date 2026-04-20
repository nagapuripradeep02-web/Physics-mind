"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export type AnnotationBounds = {
    x: number;      // left edge as fraction of image width  (0.0–1.0)
    y: number;      // top edge as fraction of image height  (0.0–1.0)
    width: number;  // width as fraction of image width      (0.0–1.0)
    height: number; // height as fraction of image height    (0.0–1.0)
};

type Props = {
    imageUrl: string;
    onAnnotationChange: (bounds: AnnotationBounds | null) => void;
};

function getPointerPos(
    e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent,
    canvas: HTMLCanvasElement
): { px: number; py: number } {
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ("touches" in e) {
        const touch = e.touches[0] ?? (e as TouchEvent).changedTouches[0];
        clientX = touch!.clientX;
        clientY = touch!.clientY;
    } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
    }
    return {
        px: (clientX - rect.left) / rect.width,
        py: (clientY - rect.top) / rect.height,
    };
}

export default function ImageAnnotator({ imageUrl, onAnnotationChange }: Props) {
    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [currentRect, setCurrentRect] = useState<AnnotationBounds | null>(null);
    const isDrawing = useRef(false);
    const startPoint = useRef<{ x: number; y: number } | null>(null);

    // Sync canvas size to image display size
    const syncCanvasSize = useCallback(() => {
        const img = imgRef.current;
        const canvas = canvasRef.current;
        if (!img || !canvas) return;
        canvas.width = img.offsetWidth;
        canvas.height = img.offsetHeight;
    }, []);

    useEffect(() => {
        const img = imgRef.current;
        if (!img) return;
        if (img.complete) syncCanvasSize();
        img.addEventListener("load", syncCanvasSize);
        window.addEventListener("resize", syncCanvasSize);
        return () => {
            img.removeEventListener("load", syncCanvasSize);
            window.removeEventListener("resize", syncCanvasSize);
        };
    }, [syncCanvasSize, imageUrl]);

    // Draw rectangle on canvas
    const drawRect = useCallback((rect: AnnotationBounds | null) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!rect) return;

        const x = rect.x * canvas.width;
        const y = rect.y * canvas.height;
        const w = rect.width * canvas.width;
        const h = rect.height * canvas.height;

        // Fill
        ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
        ctx.fillRect(x, y, w, h);

        // Stroke
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        // Corner handles
        const corners = [
            [x, y], [x + w, y],
            [x, y + h], [x + w, y + h],
        ];
        for (const [cx, cy] of corners) {
            ctx.beginPath();
            ctx.arc(cx, cy, 6, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();
            ctx.strokeStyle = "#3b82f6";
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }, []);

    // Redraw when rect changes
    useEffect(() => {
        drawRect(currentRect);
    }, [currentRect, drawRect]);

    // Normalize bounds so width/height are positive
    function normalizeBounds(
        sx: number, sy: number, ex: number, ey: number
    ): AnnotationBounds {
        const x = Math.min(sx, ex);
        const y = Math.min(sy, ey);
        return {
            x: Math.max(0, Math.min(1, x)),
            y: Math.max(0, Math.min(1, y)),
            width: Math.max(0, Math.min(1 - x, Math.abs(ex - sx))),
            height: Math.max(0, Math.min(1 - y, Math.abs(ey - sy))),
        };
    }

    function handlePointerDown(e: React.MouseEvent | React.TouchEvent) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const { px, py } = getPointerPos(e, canvas);
        isDrawing.current = true;
        startPoint.current = { x: px, y: py };
        setCurrentRect(null);
        onAnnotationChange(null);
    }

    function handlePointerMove(e: React.MouseEvent | React.TouchEvent) {
        if (!isDrawing.current || !startPoint.current) return;
        if ("touches" in e) e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const { px, py } = getPointerPos(e, canvas);
        const rect = normalizeBounds(startPoint.current.x, startPoint.current.y, px, py);
        setCurrentRect(rect);
    }

    function handlePointerUp(e: React.MouseEvent | React.TouchEvent) {
        if (!isDrawing.current || !startPoint.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const { px, py } = getPointerPos(e, canvas);
        isDrawing.current = false;

        const rect = normalizeBounds(startPoint.current.x, startPoint.current.y, px, py);
        startPoint.current = null;

        // Discard if too small
        if (rect.width < 0.02 || rect.height < 0.02) {
            setCurrentRect(null);
            onAnnotationChange(null);
            return;
        }

        setCurrentRect(rect);
        onAnnotationChange(rect);
    }

    function handleClear() {
        setCurrentRect(null);
        onAnnotationChange(null);
    }

    // Attach non-passive touchmove listener for preventDefault
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const onTouchMove = (e: TouchEvent) => {
            if (isDrawing.current) e.preventDefault();
        };
        canvas.addEventListener("touchmove", onTouchMove, { passive: false });
        return () => canvas.removeEventListener("touchmove", onTouchMove);
    }, []);

    return (
        <div className="relative w-full">
            <div className="relative inline-block w-full">
                <img
                    ref={imgRef}
                    src={imageUrl}
                    alt="Uploaded"
                    className="block w-full max-h-[300px] object-contain rounded-lg"
                    draggable={false}
                />
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ cursor: isDrawing.current ? "crosshair" : currentRect ? "default" : "crosshair" }}
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                    onTouchStart={handlePointerDown}
                    onTouchEnd={handlePointerUp}
                />
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1">
                {currentRect ? (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        Clear selection
                    </button>
                ) : (
                    <span className="text-[11px] text-zinc-500">
                        Drag to highlight what confuses you (optional)
                    </span>
                )}
            </div>
        </div>
    );
}
