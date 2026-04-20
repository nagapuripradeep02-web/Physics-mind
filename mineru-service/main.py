from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import json
import re
from pathlib import Path

app = FastAPI(title="PhysicsMind MinerU Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "mineru"}

@app.post("/extract")
async def extract_equations(file: UploadFile = File(...)):
    """
    Accepts an image file (JPEG/PNG of a textbook page).
    Returns extracted equations as LaTeX strings and plain text.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    with tempfile.TemporaryDirectory() as tmpdir:
        # Save uploaded image
        input_path = os.path.join(tmpdir, "input_page.jpg")
        content = await file.read()
        with open(input_path, "wb") as f:
            f.write(content)

        output_dir = os.path.join(tmpdir, "output")
        os.makedirs(output_dir, exist_ok=True)

        # Run MinerU on the image
        import subprocess
        result = subprocess.run(
            ["mineru", "-p", input_path, "-o", output_dir, "-b", "pipeline"],
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"MinerU failed: {result.stderr[:500]}"
            )

        # Find the output markdown file
        md_files = list(Path(output_dir).rglob("*.md"))
        if not md_files:
            raise HTTPException(status_code=500, detail="MinerU produced no output")

        md_content = md_files[0].read_text(encoding="utf-8")

        # Extract LaTeX equations from markdown
        # MinerU wraps equations in $...$ (inline) and $$...$$ (block)
        block_equations = re.findall(r'\$\$(.*?)\$\$', md_content, re.DOTALL)
        inline_equations = re.findall(r'(?<!\$)\$(?!\$)(.*?)(?<!\$)\$(?!\$)', md_content)

        all_equations = []

        for eq in block_equations:
            eq = eq.strip()
            if eq and len(eq) > 2:
                all_equations.append({
                    "latex": eq,
                    "type": "block",
                    "display": f"$${eq}$$"
                })

        for eq in inline_equations:
            eq = eq.strip()
            if eq and len(eq) > 2:
                all_equations.append({
                    "latex": eq,
                    "type": "inline",
                    "display": f"${eq}$"
                })

        # Strip equations from markdown to get plain text
        plain_text = re.sub(r'\$\$.*?\$\$', '[EQUATION]', md_content, flags=re.DOTALL)
        plain_text = re.sub(r'(?<!\$)\$(?!\$).*?(?<!\$)\$(?!\$)', '[EQ]', plain_text)
        plain_text = re.sub(r'[#*`]', '', plain_text).strip()

        return {
            "success": True,
            "equations": all_equations,
            "equation_count": len(all_equations),
            "plain_text": plain_text[:2000],  # Cap at 2000 chars
            "raw_markdown": md_content[:3000]  # Cap at 3000 chars for debugging
        }


@app.post("/extract-pdf")
async def extract_pdf(file: UploadFile = File(...)):
    """
    For bulk PDF ingestion of HC Verma / DC Pandey books.
    Returns all equations and text from the full PDF.
    Used for pgvector embedding pipeline (Priority 7), not for live student uploads.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")

    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = os.path.join(tmpdir, "book.pdf")
        content = await file.read()
        with open(input_path, "wb") as f:
            f.write(content)

        output_dir = os.path.join(tmpdir, "output")
        os.makedirs(output_dir, exist_ok=True)

        import subprocess
        result = subprocess.run(
            ["mineru", "-p", input_path, "-o", output_dir, "-b", "pipeline"],
            capture_output=True,
            text=True,
            timeout=300  # 5 min for full PDF
        )

        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"MinerU failed: {result.stderr[:500]}"
            )

        md_files = list(Path(output_dir).rglob("*.md"))
        if not md_files:
            raise HTTPException(status_code=500, detail="MinerU produced no output")

        all_content = []
        for md_file in sorted(md_files):
            all_content.append(md_file.read_text(encoding="utf-8"))

        full_markdown = "\n\n---PAGE BREAK---\n\n".join(all_content)

        block_equations = re.findall(r'\$\$(.*?)\$\$', full_markdown, re.DOTALL)

        return {
            "success": True,
            "page_count": len(md_files),
            "equation_count": len(block_equations),
            "full_markdown": full_markdown,
            "equations": [{"latex": eq.strip(), "type": "block"} for eq in block_equations if eq.strip()]
        }
