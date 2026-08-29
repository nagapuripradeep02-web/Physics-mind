# -*- coding: utf-8 -*-
"""Build the unit-3 manifest fragment FROM the written card files, so the
fragment can never drift from the questions it indexes."""
import json, io, os, glob

QDIR = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'questions'))
OUT = (r"C:\Users\PRADEEEP\AppData\Local\Temp\claude\C--Tutor-physics-mind"
       r"\40aee229-2ba0-40be-831f-912f984d9e01\scratchpad\zoology\unit_03.json")

# book global question numbers, keyed by question_id
QNO = {
    "ts_ipe_z1_ad1_sponge_canal_system_functions": 89,
    "ts_ipe_z1_ad1_metagenesis": 90,
    "ts_ipe_z1_ad1_flame_cells": 91,
    "ts_ipe_z1_ad1_amphids_vs_phasmids": 92,
    "ts_ipe_z1_ad1_botryoidal_tissue": 93,
    "ts_ipe_z1_ad1_living_fossil_arthropod": 94,
    "ts_ipe_z1_ad1_radula_function": 95,
    "ts_ipe_z1_ad1_aristotles_lantern": 96,
    "ts_ipe_z1_ad1_echinoderm_larva_symmetry": 97,
    "ts_ipe_z1_ad1_cnidarian_body_forms": 98,
    "ts_ipe_z1_ad1_nereis_parapodia": 99,
    "ts_ipe_z1_ad1_scorpion_cephalic_appendages": 100,
    "ts_ipe_z1_ad1_limulus_palamnaeus_respiration": 101,
    "ts_ipe_z1_ad1_antennae_chelicerata": 102,
    "ts_ipe_z1_ad1_ctenidium_osphradium": 103,
    "ts_ipe_z1_ad1_spermathecae_pheretima": 104,
    "ts_ipe_z1_ad1_haemocoel_arthropod": 105,
    "ts_ipe_z1_ad1_blood_glands_pheretima": 106,
    "ts_ipe_z1_ad1_anthozoa_features": 24,
    "ts_ipe_z1_ad1_polychaeta_features": 25,
    "ts_ipe_z1_ad1_crustacea_characters": 26,
    "ts_ipe_z1_ad1_echinoidea_features": 27,
    "ts_ipe_z1_ad1_holothuroidea_features": 28,
    "ts_ipe_z1_ad1_arachnida_characters": 29,
    "ts_ipe_z1_ad1_trematoda_flukes": 180,
    "ts_ipe_z1_ad1_centipede_vs_millipede": 181,
}

rows = []
files = sorted(glob.glob(os.path.join(QDIR, 'ts_ipe_z1_ad1_*.json')))
for p in files:
    q = json.load(io.open(p, encoding='utf-8'))
    qid = q['question_id']
    assert qid in QNO, f'no book number recorded for {qid}'
    n = QNO[qid]
    rows.append({
        "ref": f"{q['qtype'].lower()}{n}",
        "section": q['qtype'],
        "number": n,
        "stars": 0,
        "text": q['question_text'],
        "question_id": qid,
    })

assert len(rows) == len(QNO), f'{len(rows)} files vs {len(QNO)} numbers'
order = {"VSAQ": 0, "SAQ": 1, "LAQ": 2}
rows.sort(key=lambda r: (order[r['section']], r['number']))

frag = {
    "number": 3,
    "name": "Animal Diversity-I (Zoology)",
    "subject": "zoology",
    "questions": rows,
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with io.open(OUT, 'w', encoding='utf-8') as fh:
    json.dump(frag, fh, ensure_ascii=False, indent=2)
    fh.write('\n')

nv = sum(1 for r in rows if r['section'] == 'VSAQ')
ns = sum(1 for r in rows if r['section'] == 'SAQ')
print(f'unit_03.json: {len(rows)} questions ({nv} VSAQ, {ns} SAQ, 0 LAQ)')
print('  VSAQ ' + str([r['number'] for r in rows if r['section'] == 'VSAQ']))
print('  SAQ  ' + str([r['number'] for r in rows if r['section'] == 'SAQ']))
