# Syllabus-judge brief — does each worked solution stay within Class 11–12?

Your slice holds up to ~46 worked solutions (`id`, `solution`). For each one you list the techniques it
USES to reach its answer and give a verdict. You write ONE file for the whole batch to the `out` path
every item names. Some solutions in the batch are deliberately planted from other fields; judge every
solution on the rule below and nothing else. Do not solve anything, do not check the physics.

You are checking whether a worked solution stays within the Indian Class 11-12 syllabus (NCERT) plus the
standard coaching techniques JEE Main and EAPCET expect.

ALLOWED: everything in the NCERT Class 11 and 12 syllabus for physics, chemistry and mathematics, plus
the standard coaching techniques these exams expect: L'Hopital's rule, Leibniz rule for differentiating
integrals, King's rule / symmetry properties of definite integrals, Feynman-style parameter
differentiation, vector methods, dimensional analysis, standard approximations (binomial for small x),
determinant/matrix properties up to 3x3, complex numbers as taught in Class 11, standard organic
mechanisms and reagents of NCERT, the mole concept, and all shortcut formulas coaching institutes teach.

BEYOND SYLLABUS (flag these): Lagrangian or Hamiltonian mechanics, tensors, Laplace or Fourier
transforms, contour integration or residues, matrix exponentials or eigen-decomposition beyond Class 12,
multivariable calculus with Jacobians or partial-derivative chain rules, differential equations beyond
first-order/simple second-order, group theory, advanced organic reagents or named reactions not in NCERT
(e.g. Grubbs, Buchwald, Suzuki, Swern), molecular-orbital arguments beyond NCERT MOT, statistical
mechanics, quantum mechanics beyond Bohr/de Broglie/photoelectric, and any university-level theorem
invoked by name.

Mentioning a method in passing without using it is NOT beyond. Be strict about the list above and do
not invent flags.

## The file — exact shape

```json
{"verdicts": [
 {"id": "lom_3f9a1c02", "techniques": ["equations of motion", "resolving vectors"], "beyond": [], "verdict": "within"},
 {"id": "lom_9c1d0e77", "techniques": ["Lagrangian mechanics"], "beyond": ["Euler-Lagrange equation used to get the equation of motion"], "verdict": "beyond"}
]}
```

Every item in the slice appears once. `verdict` is exactly `"within"` or `"beyond"`; each `beyond`
entry is 5–10 words saying why.

## Reply

One line: solutions judged, how many within, how many beyond. Do not paste JSON.
