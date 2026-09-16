# model_probes

Measurement harness for "a student photographs a question and asks one line" — see `docs/MODEL_PROBES.md`
for every run, result and decision. `ds_probe.py` calls DeepSeek V4.1 Flash at four thinking settings;
`jee_extract.py` / `jee_figure_select.py` cut JEE Main 2024 crops from the Allen PDFs; `eapcet_figure_crop.py`
re-crops EAPCET figure questions from the source PDFs with the key redacted (run `gate` before `run`).
`review_probe.py` (Run 15) sends labelled handwritten pages (FERMAT + the founder's own) through the deployed `ep-review`
function and scores false-error / localisation / over-correction — `env → inspect → fermat|local → gate → gate --live → run → report`;
`inspect`/`fermat` need `pip install pyarrow` and `HF_TOKEN`; `gate` (the label-leak and scoring control) before any paid `run`.
Data lands in `docs/reports/model_probes/data/<run>/`; photos in `pdfs/probes/<run>/photos/` (gitignored).
