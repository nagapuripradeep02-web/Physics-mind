"""The tagging taxonomy, one list per subject, taken from the IPE Answer Book's units.

Kept in one place because three things must agree on it: the brief handed to a transcribing
agent, the gate that rejects a chapter outside the list, and the frequency table. A chapter
string that drifts between them shows up as a silent hole in the table, not as an error.

'States of Matter' stays in the chemistry list. The 2026-27 IPE syllabus retired it, but the
2021-2025 papers tested it, and this taxonomy tags what those papers actually asked.
"""

PHYSICS_1 = [
    "Physical World and Measurement", "Motion in a Straight Line", "Motion in a Plane",
    "Laws of Motion", "Work Power Energy", "System of Particles and Rotational Motion",
    "Oscillations", "Gravitation", "Mechanical Properties of Solids",
    "Mechanical Properties of Fluids", "Thermal Properties of Matter", "Thermodynamics",
    "Kinetic Theory", "Physics of Emerging Technologies",
]
PHYSICS_2 = [
    "Waves", "Ray Optics and Optical Instruments", "Wave Optics", "Electric Charges and Fields",
    "Electric Potential and Capacitance", "Current Electricity", "Moving Charges and Magnetism",
    "Magnetism and Matter", "Electromagnetic Induction", "Alternating Current",
    "Electromagnetic Waves", "Dual Nature of Radiation and Matter", "Atoms", "Nuclei",
    "Semiconductor Electronics", "Communication System",
]
CHEMISTRY_1 = [
    "Atomic Structure", "Classification of Elements and Periodic Properties", "Chemical Bonding",
    "Stoichiometry", "Thermodynamics", "Chemical Equilibrium, Acids and Bases", "s-Block Elements",
    "p-Block Elements: Group 13", "p-Block Elements: Group 14", "General Organic Chemistry",
    "States of Matter", "Environmental Chemistry", "Hydrogen and its Compounds",
]
CHEMISTRY_2 = [
    "Solid State", "Solutions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry",
    "Metallurgy", "VA Group Elements", "VIA Group Elements", "VIIA Group Elements", "Noble Gases",
    "d and f Block Elements", "Coordination Compounds", "Polymers", "Biomolecules",
    "Chemistry in Everyday Life", "Haloalkanes and Haloarenes", "Alcohols, Phenols and Ethers",
    "Aldehydes, Ketones and Carboxylic Acids", "Organic Compounds Containing Nitrogen",
]
MATHS_1A = [
    "Sets and Relations", "Functions", "Sequences and Series", "Mathematical Induction",
    "Matrices", "Addition of Vectors", "Product of Vectors",
    "Trigonometric Ratios and Transformations", "Trigonometric Equations",
    "Inverse Trigonometric Functions", "Hyperbolic Functions", "Properties of Triangles",
]
MATHS_1B = [
    "Locus", "Transformation of Axes", "The Straight Line", "Pair of Straight Lines",
    "3D Coordinates", "Direction Cosines and Direction Ratios", "The Plane",
    "Limits and Continuity", "Differentiation", "Applications of Derivatives",
]
MATHS_2A = [
    "Complex Numbers", "De Moivre's Theorem", "Quadratic Expressions", "Theory of Equations",
    "Permutations and Combinations", "Binomial Theorem", "Partial Fractions",
    "Measures of Dispersion", "Probability", "Random Variables and Probability Distributions",
]
MATHS_2B = [
    "Circle", "System of Circles", "Parabola", "Ellipse", "Hyperbola", "Integration",
    "Definite Integrals", "Differential Equations",
]

SUBJECTS = {
    "maths": (1, 80),
    "physics": (81, 120),
    "chemistry": (121, 160),
}

# chapter -> the paper it belongs to, which is also the year_cycle the transcript records
CYCLE = {}
for _c in PHYSICS_1:
    CYCLE[_c] = "first_year"
for _c in PHYSICS_2:
    CYCLE[_c] = "second_year"

CHAPTERS = {
    "physics": PHYSICS_1 + PHYSICS_2,
    "chemistry": CHEMISTRY_1 + CHEMISTRY_2,
    "maths": MATHS_1A + MATHS_1B + MATHS_2A + MATHS_2B,
}
PAPER_OF = {}
for _c in CHEMISTRY_1:
    PAPER_OF[("chemistry", _c)] = "first_year"
for _c in CHEMISTRY_2:
    PAPER_OF[("chemistry", _c)] = "second_year"
for _lst, _p in ((MATHS_1A, "1a"), (MATHS_1B, "1b"), (MATHS_2A, "2a"), (MATHS_2B, "2b")):
    for _c in _lst:
        PAPER_OF[("maths", _c)] = _p
for _c in PHYSICS_1:
    PAPER_OF[("physics", _c)] = "first_year"
for _c in PHYSICS_2:
    PAPER_OF[("physics", _c)] = "second_year"


def subject_of(q_no):
    for s, (lo, hi) in SUBJECTS.items():
        if lo <= q_no <= hi:
            return s
    return None
