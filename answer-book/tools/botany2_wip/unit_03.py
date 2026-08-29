# -*- coding: utf-8 -*-
"""Unit 3 — Enzymes. Book SAQ ch.6 (p.24) + Star Questions Plus (p.50).
Globals 15, 16 (SAQ) and 155-158 (VSAQ)."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from emit import Q, S, main

U = 3
C = []

C.append(Q(U, 'enzyme_inhibitors', 'SAQ', 'saq1', 15, 24,
    "Write briefly about enzyme inhibitors.",
    years=[('ts',2017),('ts',2017),('ts',2019),('ap',2017),('ap',2019)],
    split=[("What an inhibitor is",1),("Competitive inhibitors",1),
           ("Non-competitive inhibitors",1),("Feedback inhibitors",1)],
    insider="Three types, three examples. Malonic acid against succinate is the example every examiner "
            "expects, so write it even if the other two examples are shorter.",
    steps=[
      S('s1_define','text','What an inhibitor is',1,'Definition',
        lines=["Enzyme inhibitors are chemicals that STOP or",
               "slow the activity of an enzyme.",
               "The process is called inhibition.",
               "There are three types:",
               "1. Competitive  2. Non-competitive",
               "3. Feedback"],
        why="Listing the three types before explaining them shows the shape of the answer, and each type "
            "is then defined by WHERE on the enzyme it acts.",
        mistakes=["Saying inhibitors destroy the enzyme. They stop its ACTIVITY; most do not destroy it.",
                  "Naming only two types. The guide gives three, and each is a mark."],
        tip="Three types, three places: the active site, elsewhere, and the end of the pathway.",
        note="Definition plus the three names. Number them so the next three steps can follow."),
      S('s2_competitive','text','Competitive inhibitors',1,'Competitive',
        lines=["1. COMPETITIVE INHIBITORS:",
               "These resemble the substrate in shape.",
               "They bind to the ACTIVE SITE and so compete",
               "with the substrate.",
               "Example: malonic acid resembles the substrate",
               "succinate and inhibits succinic dehydrogenase."],
        why="The inhibitor works only because it looks like the substrate, so the resemblance is the "
            "definition rather than an extra detail.",
        mistakes=["Saying a competitive inhibitor binds away from the active site. It binds AT the active site.",
                  "Leaving out the resemblance to the substrate. That is what makes it competitive."],
        tip="It looks like the substrate, so it takes the substrate's seat.",
        note="Resemblance, active site, example. All three parts of the mark."),
      S('s3_noncompetitive','text','Non-competitive inhibitors',1,'Non-competitive',
        lines=["2. NON-COMPETITIVE INHIBITORS:",
               "These have NO structural similarity to the",
               "substrate.",
               "They bind at a site OTHER than the active site.",
               "This changes the globular shape of the enzyme,",
               "so it can no longer work.",
               "Example: metal ions of copper and mercury."],
        why="Changing the enzyme's shape from somewhere else disables the active site indirectly, which "
            "is why adding more substrate cannot overcome this kind of inhibitor.",
        mistakes=["Saying it resembles the substrate. It does NOT — that is the competitive kind.",
                  "Leaving out the shape change. Changing the globular structure is how it works."],
        tip="It does not take the seat; it bends the chair.",
        note="No resemblance, a different site, the shape change, an example."),
      S('s4_feedback','boxed_final','Feedback inhibitors',1,'Feedback',
        lines=[{"text":"The end product switches its own pathway off","style":"boxed"},
               "3. FEEDBACK INHIBITION:",
               "A cellular control mechanism in which the",
               "enzyme's own END PRODUCT inhibits its activity.",
               "It is part of the homeostatic control of",
               "metabolism.",
               "It stops the cell making more of a product it",
               "already has enough of."],
        why="The product itself is the signal, so the cell needs no separate sensor to know when to stop.",
        mistakes=["Saying the substrate inhibits the enzyme. It is the END PRODUCT.",
                  "Leaving out the purpose. Feedback inhibition prevents wasteful overproduction."],
        tip="Enough product means stop making product.",
        note="Definition, the words 'end product', and one line on why the cell does it.")]))

C.append(Q(U, 'types_of_cofactors', 'SAQ', 'saq2', 16, 24,
    "Explain different types of cofactors.",
    years=[('ts',2019),('ts',2022),('ap',2016),('ap',2022)],
    split=[("What a cofactor is",1),("Prosthetic groups",1),("Co-enzymes",1),("Metal ions",1)],
    insider="Tightly bound against loosely bound is the difference between the first two types. Say "
            "'tightly' and 'loosely' in those words — it is the fastest way to show you know the contrast.",
    steps=[
      S('s1_define','text','What a cofactor is',1,'Definition',
        lines=["An enzyme with its non-protein part is called a",
               "HOLOENZYME.",
               "The protein part is the APOENZYME.",
               "The NON-PROTEIN part is the CO-FACTOR.",
               "Cofactors are of three types:",
               "1. Prosthetic groups  2. Co-enzymes",
               "3. Metal ions"],
        why="A cofactor is defined by what it is not — not protein — so the apoenzyme and holoenzyme have "
            "to be named first for the definition to mean anything.",
        mistakes=["Calling the cofactor the protein part. It is the NON-protein part.",
                  "Mixing up apoenzyme and holoenzyme. Apo is the protein alone; holo is the whole working enzyme."],
        tip="Apo is the protein, holo is the whole, cofactor is the rest.",
        note="Three named parts and the three types. This mark is vocabulary."),
      S('s2_prosthetic','text','Prosthetic groups',1,'Prosthetic',
        lines=["1. PROSTHETIC GROUPS:",
               "Organic compounds TIGHTLY bound to the",
               "apoenzyme.",
               "Example: the haem part of peroxidase.",
               "Peroxidase breaks hydrogen peroxide into water",
               "and oxygen.",
               {"text":"2H2O2  --peroxidase-->  2H2O + O2","style":"eq"}],
        why="Being tightly bound means the group stays with the enzyme through the reaction, which is the "
            "one thing that separates it from a coenzyme.",
        mistakes=["Saying prosthetic groups are loosely bound. They are TIGHTLY bound.",
                  "Naming no example. Haem in peroxidase is the standard one."],
        tip="Prosthetic is permanent: it does not leave the enzyme.",
        note="Tightly bound, one example, the equation. The word 'tightly' is the mark."),
      S('s3_coenzyme','text','Co-enzymes',1,'Co-enzymes',
        lines=["2. CO-ENZYMES:",
               "Organic compounds LOOSELY attached to the",
               "apoenzyme.",
               "They are derived from water soluble vitamins.",
               "Example: NAD and NADP both contain the vitamin",
               "NIACIN."],
        why="A loosely attached coenzyme can leave, carry something away and come back, which is exactly "
            "what NAD does when it carries hydrogen between reactions.",
        mistakes=["Saying coenzymes are tightly bound. They are LOOSELY attached.",
                  "Leaving out the vitamin link. Coenzymes come from water soluble vitamins."],
        tip="Coenzymes come and go, and they come from vitamins.",
        note="Loosely attached, the vitamin origin, one example with the vitamin named."),
      S('s4_metal','boxed_final','Metal ions',1,'Metal ions',
        lines=[{"text":"Tightly bound, loosely bound, or a metal ion","style":"boxed"},
               "3. METAL IONS:",
               "Many enzymes need metal ions to work.",
               "The ion forms coordination bonds with side",
               "chains at the ACTIVE SITE.",
               "Example: zinc is the cofactor for the",
               "proteolytic enzyme carboxypeptidase."],
        why="A metal ion is inorganic, so it is neither a prosthetic group nor a coenzyme and needs a "
            "third category of its own.",
        mistakes=["Calling metal ions organic. They are INORGANIC, which is why they are a separate type.",
                  "Naming no example. Zinc with carboxypeptidase is the standard one."],
        tip="Two organic types and one metal: that is the whole list.",
        note="Say where the ion binds and give the named example.")]))

# ── VSAQ, Star Questions Plus (p.50) ────────────────────────────────────────
C.append(Q(U, 'prosthetic_group_vs_cofactor', 'VSAQ', 'vsaq1', 155, 50,
    "How are prosthetic groups different from co-factors?",
    split=[("Prosthetic groups",1),("Co-factors",1)],
    insider="A prosthetic group IS a kind of cofactor, so the honest answer is that one is a subset of "
            "the other. Say that and the comparison makes sense.",
    steps=[
      S('s1_prosthetic','text','Prosthetic groups',1,'Prosthetic',
        lines=["Prosthetic groups are ORGANIC compounds that",
               "are TIGHTLY bound to the apoenzyme.",
               "Example: the haem group of peroxidase."],
        why="Prosthetic groups are one of the three kinds of cofactor, so their definition is narrower "
            "than the general term and adds the words 'organic' and 'tightly'.",
        mistakes=["Saying prosthetic groups are inorganic. They are ORGANIC.",
                  "Calling them loosely bound. Tightly bound is the defining feature."],
        tip="Prosthetic means organic and permanent.",
        note="Organic, tightly bound, one example. Three lines."),
      S('s2_cofactor','boxed_final','Co-factors',1,'Cofactors',
        lines=[{"text":"Every prosthetic group is a cofactor; not","style":"boxed"},
               {"text":"every cofactor is a prosthetic group","style":"boxed"},
               "A cofactor is the whole NON-PROTEIN part of a",
               "holoenzyme, bound to the enzyme to make it",
               "catalytically active.",
               "Cofactors include prosthetic groups, co-enzymes",
               "and metal ions."],
        why="The general term covers three kinds, and prosthetic groups are only one of them — which is "
            "the actual difference the question is asking about.",
        mistakes=["Treating the two as unrelated. A prosthetic group IS a cofactor, of one particular kind.",
                  "Saying cofactors are always organic. Metal ions are inorganic cofactors."],
        tip="Cofactor is the family; prosthetic group is one member of it.",
        note="Define the wider term, then list the three kinds. The subset point is the mark.")]))

C.append(Q(U, 'apoenzyme_vs_cofactor', 'VSAQ', 'vsaq2', 156, 50,
    "Distinguish between apoenzyme and cofactor.",
    years=[2014,('ts',2017),('ts',2020)],
    split=[("Apoenzyme",1),("Cofactor",1)],
    note_extra="BOOK NOTE: this answer prints \"It makes the enzyme CATABOLICALLY active\", while the "
               "guide's own answer to global 155 on the same page prints \"CATALYTICALLY active\" for "
               "the same claim. Catalytically is correct: a cofactor makes the enzyme able to catalyse, "
               "which has nothing to do with catabolism.",
    insider="Protein against non-protein. That single contrast answers the whole question, so write it in "
            "the first line of each half.",
    steps=[
      S('s1_apoenzyme','text','Apoenzyme',1,'Apoenzyme',
        lines=["The APOENZYME is the PROTEIN part of a",
               "holoenzyme.",
               "It is chemically proteinaceous.",
               "On its own it is not catalytically active."],
        why="The apoenzyme carries the shape of the active site but cannot work alone, which is why the "
            "cofactor is needed at all.",
        mistakes=["Calling the apoenzyme the non-protein part. It is the PROTEIN part.",
                  "Saying the apoenzyme works on its own. It needs its cofactor."],
        tip="Apo is the protein and it is not enough by itself.",
        note="Protein part, proteinaceous, inactive alone. Three lines."),
      S('s2_cofactor','boxed_final','Cofactor',1,'Cofactor',
        lines=[{"text":"Protein plus non-protein makes a working","style":"boxed"},
               {"text":"holoenzyme","style":"boxed"},
               "The CO-FACTOR is the NON-PROTEIN part of a",
               "holoenzyme.",
               "It makes the enzyme CATALYTICALLY active.",
               "Apoenzyme + cofactor = holoenzyme."],
        why="The equation at the end is the cleanest statement of the difference, because it shows the "
            "two parts are complements rather than alternatives.",
        mistakes=["Writing 'catabolically active'. It is CATALYTICALLY active. The guide misprints this.",
                  "Leaving out the sum. Apoenzyme plus cofactor equals holoenzyme is the closing line."],
        tip="Protein plus helper makes the working whole.",
        note="Non-protein part, what it does, and the sum line. Watch the word catalytically.")]))

C.append(Q(U, 'michaelis_constant', 'VSAQ', 'vsaq3', 157, 50,
    "Define Michaelis constant.",
    split=[("Definition",1),("What it measures",1)],
    insider="Half of the maximum rate, not half of the maximum substrate. Getting that the wrong way "
            "round is the single most common error on this question.",
    steps=[
      S('s1_define','text','Michaelis constant defined',1,'Definition',
        lines=["The Michaelis constant (Km) is the SUBSTRATE",
               "CONCENTRATION at which the reaction rate is",
               "HALF of its maximum rate."],
        why="Km is a concentration read off the point where the rate is half its maximum, so both halves "
            "of the sentence have to name different quantities.",
        mistakes=["Saying Km is half the maximum rate. Km is a CONCENTRATION, read at half the maximum rate.",
                  "Leaving out the word 'half'. It is what fixes the point on the curve."],
        tip="Km is a concentration, measured at half the top speed.",
        note="Three lines. The two quantities are different: concentration, and rate."),
      S('s2_meaning','boxed_final','What it measures',1,'Meaning',
        lines=[{"text":"Low Km means the enzyme grips its substrate","style":"boxed"},
               {"text":"more strongly","style":"boxed"},
               "Km measures how strongly an enzyme holds its",
               "substrate.",
               "A LOW Km means only a little substrate is",
               "needed to reach half the maximum rate."],
        why="A small Km means the enzyme reaches half speed at a low concentration, which only happens if "
            "it binds the substrate readily.",
        mistakes=["Saying a high Km means strong binding. It is the opposite: LOW Km means strong binding.",
                  "Giving only the definition. The second mark is for what the number tells you."],
        tip="Less substrate needed means a tighter hold.",
        note="One line on what a low Km means. This half is the mark most answers skip.")]))

C.append(Q(U, 'feedback_inhibition', 'VSAQ', 'vsaq4', 158, 50,
    "What is meant by 'Feed-back inhibition'?",
    split=[("Definition",1),("Why the cell does it",1)],
    insider="The words 'end product' are the mark. An answer that says an inhibitor stops the enzyme, "
            "without saying WHICH inhibitor, has not answered the question.",
    steps=[
      S('s1_define','text','Feedback inhibition defined',1,'Definition',
        lines=["Feedback inhibition is a cellular control",
               "mechanism in which an enzyme's activity is",
               "inhibited by the enzyme's own END PRODUCT."],
        why="The product of the pathway is also the signal that stops it, which is what makes the control "
            "a feedback rather than an ordinary inhibition.",
        mistakes=["Saying the substrate inhibits the enzyme. It is the END PRODUCT.",
                  "Calling it competitive inhibition. Feedback inhibition is its own named type."],
        tip="The product feeds back and shuts the tap.",
        note="Three lines. The phrase 'end product' has to appear."),
      S('s2_why','boxed_final','Why the cell does it',1,'Purpose',
        lines=[{"text":"Homeostatic control of metabolism","style":"boxed"},
               "It is part of the homeostatic control of",
               "metabolism.",
               "The cell stops making a product once it has",
               "enough, so raw material and energy are not",
               "wasted."],
        why="Without feedback, a pathway would keep running while its product piled up, which would waste "
            "both the starting material and the ATP spent on the pathway.",
        mistakes=["Giving no purpose. The reason the cell does it is the second mark.",
                  "Saying it speeds the reaction up. It SLOWS or stops the reaction."],
        tip="Stop when you have enough, and nothing is wasted.",
        note="Name it as homeostatic control and say what is saved.")]))

main(C, U)
