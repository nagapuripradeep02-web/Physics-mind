# -*- coding: utf-8 -*-
"""Rebuild every unit-8 card and the manifest fragment. Run gen_figs.py first."""
import eelib
import gen_vsaq_a, gen_vsaq_b, gen_saq, gen_laq   # noqa: F401  (side effects)

FRAG = (r"C:\Users\PRADEEEP\AppData\Local\Temp\claude"
        r"\C--Tutor-physics-mind\40aee229-2ba0-40be-831f-912f984d9e01"
        r"\scratchpad\zoology\unit_08.json")
eelib.dump_manifest(FRAG)
print(f"cards written: {len(eelib.MANIFEST)}")
