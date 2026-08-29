# -*- coding: utf-8 -*-
"""Unit 2 — Mineral Nutrition. Book SAQ ch.5 (p.23) + Star Questions Plus (pp.50, 52).
Globals 13, 14 (SAQ), 166 (SAQ, confirmed by Guess Paper 4 Section B) and 151-154 (VSAQ)."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from emit import Q, S, main
import figs_u2

U = 2
C = []

C.append(Q(U, 'root_nodule_formation', 'SAQ', 'saq1', 13, 23,
    "Explain the steps involved in the formation of root nodule.",
    years=[('ap',2017),('ap',2019),('ap',2019),('ts',2016),('ts',2017),('ts',2020)],
    split=[("Attraction and attachment",1),("Curling and the infection thread",1),
           ("Nodule formation",1),("Vascular connection",1)],
    insider="Ten steps in the book, four marks on the paper. Group them: attract, attach, curl, thread, "
            "divide, differentiate, connect. Numbering the steps is what makes this answer readable.",
    steps=[
      S('s1_attract','text','Attraction and attachment',1,'Attraction',
        lines=["1. The roots of the host legume release sugars",
               "and amino acids into the soil.",
               "2. These attract Rhizobium bacteria.",
               "3. The bacteria multiply and colonise the soil",
               "around the root.",
               "4. They attach to the epidermis of the root",
               "hair cells."],
        why="The legume calls the bacteria in rather than being invaded, which is why the association is "
            "a partnership and not an infection in the ordinary sense.",
        mistakes=["Saying the bacteria find the root by chance. The root RELEASES chemicals that attract them.",
                  "Naming the wrong bacterium. It is Rhizobium, in the roots of LEGUMES."],
        tip="The root advertises with sugar; the bacteria answer the advertisement.",
        note="Four numbered steps. Name Rhizobium and name the legume host."),
      S('s2_thread','text','Curling and the infection thread',1,'Infection thread',
        lines=["5. The root hair CURLS, forming a hook.",
               "6. The bacteria spread into the cortex of the",
               "root.",
               "7. An INFECTION THREAD is produced.",
               "8. The thread carries the bacteria inward,",
               "into the cortex."],
        why="The bacteria never travel free through the plant; the thread is the tube that carries them "
            "in, which is why the curl has to form first.",
        mistakes=["Leaving out the infection thread. It is the named structure of this mark.",
                  "Saying the bacteria enter the xylem. They enter the CORTEX."],
        tip="Curl, then thread, then cortex: the bacteria never travel loose.",
        note="Curl, thread, destination. The words 'infection thread' are the mark."),
      S('s3_nodule','text','Nodule formation',1,'Nodule',
        lines=["9. The bacteria in the cortical cells stimulate",
               "the host cells to DIVIDE.",
               "10. This produces specialised nitrogen fixing",
               "cells.",
               "11. These cells form the root nodule."],
        why="The nodule is built from the plant's own dividing cells, not from bacterial tissue, which is "
            "why it is an organ of the root rather than a growth on it.",
        mistakes=["Saying the bacteria build the nodule. The HOST cells divide and build it.",
                  "Calling the nodule a disease swelling. It is a specialised nitrogen fixing organ."],
        tip="The bacteria give the signal; the plant builds the room.",
        note="Division, differentiation, nodule. Three lines."),
      S('s4_vascular','boxed_final','Vascular connection',1,'Connection',
        lines=[{"text":"A direct vascular link, so nutrients can be","style":"boxed"},
               {"text":"exchanged both ways","style":"boxed"},
               "12. The mature nodule establishes a direct",
               "vascular connection with the host.",
               "This allows the exchange of nutrients: the",
               "plant supplies food, the bacteria supply fixed",
               "nitrogen."],
        why="Without a vascular link the fixed nitrogen would be trapped in the nodule, so the connection "
            "is what makes the whole arrangement useful to the plant.",
        mistakes=["Ending at 'nodule is formed'. The vascular connection is the last mark.",
                  "Saying only the plant benefits. Both partners exchange nutrients."],
        tip="No pipe, no profit: the vascular link is what makes it a partnership.",
        note="Close on the vascular connection and say what moves each way."),
      S('s5_diagram','diagram','Diagram — root nodule formation',0,None,
        figure=figs_u2.NODULE,
        why="The four stages drawn side by side show that the curl, the thread and the nodule are the "
            "same root hair at three later moments, not three separate structures.",
        mistakes=["Drawing the nodule on the root tip. It forms in the CORTEX, on the side of the root.",
                  "Drawing the infection thread outside the root. It runs INWARD, into the cortex.",
                  "Drawing four unrelated pictures. It is ONE root hair at four stages."],
        tip="One hair, four moments: straight, hooked, threaded, swollen.",
        note="The question says explain, not draw, so there is NO diagram mark; all four marks sit on the "
             "written steps. The four panels are worth sketching because they replace half the words.")]))

C.append(Q(U, 'amino_acid_synthesis', 'SAQ', 'saq2', 14, 23,
    "Write in brief how plants synthesize amino acids.",
    years=[('ts',2017),('ap',2016),('ap',2017)],
    split=[("The two ways",1),("Reductive amination",1),("Transamination",1),("The named enzymes",1)],
    insider="Two named processes and two named enzymes. Write both equations — an examiner can award the "
            "enzyme mark from the equation even if the sentence around it is thin.",
    steps=[
      S('s1_two','text','The two ways',1,'Two routes',
        lines=["Plants make amino acids in TWO ways:",
               "1. Reductive amination",
               "2. Transamination"],
        why="Naming both routes first means the rest of the answer only has to explain them, and an "
            "examiner can see the shape of the answer from the first line.",
        mistakes=["Naming only one route. The question asks how plants synthesise amino acids in general.",
                  "Calling the second one 'deamination'. It is TRANSamination — a transfer, not a removal."],
        tip="One route builds the first amino acid; the other passes it on.",
        note="Name both routes in the first three lines."),
      S('s2_reductive','equation','Reductive amination',1,'Reductive amination',
        lines=["1. REDUCTIVE AMINATION:",
               "Ammonia reacts with alpha-ketoglutaric acid to",
               "form the amino acid glutamic acid.",
               {"text":"alpha-ketoglutaric acid + NH4+ + NADPH + H+","style":"eq"},
               {"text":"   --> glutamate + H2O + NADP+","style":"eq"},
               {"text": "The enzyme is GLUTAMATE DEHYDROGENASE.", "style": "normal"}],
        why="This is where nitrogen first enters an organic molecule, so every other amino acid in the "
            "plant traces back to this one reaction.",
        mistakes=["Writing the product as glutamine. The product here is GLUTAMIC ACID (glutamate).",
                  "Leaving out the enzyme. Glutamate dehydrogenase is part of the mark."],
        tip="Ammonia meets a keto acid and becomes an amino acid: the first nitrogen in.",
        note="Equation plus the enzyme name. The guide prints NADPH-; the reductant is NADPH + H+."),
      S('s3_transamination','equation','Transamination',1,'Transamination',
        lines=["2. TRANSAMINATION:",
               "An amino group is transferred from an amino",
               "acid to the keto group of a keto acid.",
               "Glutamic acid is the main donor of the NH2",
               "group.",
               {"text":"amino acid 1 + keto acid 2","style":"eq"},
               {"text":"   <--> keto acid 1 + amino acid 2","style":"eq"}],
        why="Transamination makes every other amino acid by moving one group, so the plant needs the "
            "reductive amination step only once and can build the rest from it.",
        mistakes=["Saying a new nitrogen atom is added. The SAME amino group is moved from one acid to another.",
                  "Forgetting that glutamic acid is the usual donor. That is what links the two routes."],
        tip="Transamination does not make nitrogen, it passes nitrogen along.",
        note="Say what is transferred, from what, to what. Name glutamic acid as the donor."),
      S('s4_enzyme','boxed_final','The named enzymes',1,'Enzymes',
        lines=[{"text":"Glutamate dehydrogenase, then transaminase","style":"boxed"},
               "Reductive amination uses glutamate",
               "dehydrogenase.",
               "Transamination uses TRANSAMINASE.",
               "Between them the plant builds all twenty amino",
               "acids it needs."],
        why="The two enzymes are the shortest correct summary of the whole answer, which is why they are "
            "worth stating once more on their own line.",
        mistakes=["Writing 'transanimase'. The enzyme is TRANSAMINASE. The guide misprints it.",
                  "Naming no enzyme at all. Both enzyme names carry this mark."],
        tip="Dehydrogenase to start, transaminase to spread.",
        note="Both enzyme names on their own lines. Watch the spelling of transaminase.")]))

C.append(Q(U, 'absorption_of_essential_elements', 'SAQ', 'saq3', 166, 52,
    "Explain in brief how plants absorb essential elements.",
    years=[('ts',2019)],
    split=[("The two phases",1),("Apoplast: the passive phase",1),("Symplast: the active phase",1),("Flux, influx and efflux",1)],
    note_extra="Printed under STAR QUESTIONS PLUS (p.52), not in an SAQ chapter, but Guess Paper 4 sets "
               "it as a Section B question and cites P 52(166) — so it is authored at 4 marks.",
    insider="Passive against active is the whole answer. If you write only that ions enter the root, "
            "without saying which phase costs energy, half the marks are gone.",
    steps=[
      S('s1_phases','text','The two phases',1,'Two phases',
        lines=["Absorption of essential elements happens in TWO",
               "phases:",
               "a) the apoplast phase",
               "b) the symplast phase"],
        why="The two phases differ in whether a membrane is crossed, and that single difference decides "
            "everything else in the answer — speed, direction and energy cost.",
        mistakes=["Naming one phase only. The question needs both.",
                  "Calling them 'active and passive' without the names. Apoplast and symplast are the terms."],
        tip="Outside the cells, then inside them: apoplast then symplast.",
        note="Name both phases before explaining either."),
      S('s2_apoplast','text','Apoplast: the passive phase',1,'Apoplast',
        lines=["a) APOPLAST:",
               "Ions are taken up rapidly into the outer space",
               "or free space of the cells.",
               "The movement is ALONG the concentration",
               "gradient.",
               "No membrane is crossed and no energy is used.",
               "So it is a PASSIVE process."],
        why="Moving down a gradient releases energy rather than costing it, which is why nothing has to "
            "be spent for the apoplast phase.",
        mistakes=["Calling the apoplast phase active. It is PASSIVE.",
                  "Saying ions cross membranes here. They do not; that is the symplast."],
        tip="Downhill and outside the cells: nothing to pay.",
        note="Speed, direction relative to the gradient, and the word passive."),
      S('s3_symplast','text','Symplast: the active phase',1,'Symplast',
        lines=["b) SYMPLAST:",
               "Ions are taken SLOWLY into the inner space of",
               "the cells.",
               "The movement is AGAINST the concentration",
               "gradient.",
               "It requires metabolic energy.",
               "So it is an ACTIVE process."],
        why="Going against the gradient always costs energy, so the symplast phase must be active and is "
            "necessarily slower than the apoplast phase.",
        mistakes=["Saying the symplast is faster. It is SLOWER, because energy has to be spent.",
                  "Leaving out 'metabolic energy'. It is what makes the process active."],
        tip="Uphill and inside the cells: it has to be paid for.",
        note="Mirror the apoplast lines point for point: speed, direction, energy, name."),
      S('s4_flux','boxed_final','Flux, influx and efflux',1,'Flux terms',
        lines=[{"text":"Flux in = influx; flux out = efflux","style":"boxed"},
               "The movement of ions is called FLUX.",
               "Inward movement into the cells is INFLUX.",
               "Outward movement out of the cells is EFFLUX."],
        why="These three words are the vocabulary the rest of the chapter uses, so the question is partly "
            "a check that the terms are known.",
        mistakes=["Swapping influx and efflux. IN is influx; OUT is efflux.",
                  "Leaving the three terms out. They are a whole mark and take three lines."],
        tip="In-flux goes in, ef-flux exits.",
        note="Three short definitions. Do not skip this mark; it is the cheapest one here.")]))

# ── VSAQ, from Star Questions Plus (p.50) ───────────────────────────────────
C.append(Q(U, 'hydroponics', 'VSAQ', 'vsaq1', 151, 50,
    "Define hydroponics.",
    years=[2014],
    split=[("Definition",1),("What it shows",1)],
    insider="A one-line definition question. Say 'without soil' explicitly — that is the whole point of "
            "the technique and the word the examiner looks for.",
    steps=[
      S('s1_define','text','Hydroponics defined',1,'Definition',
        lines=["Hydroponics is the technique of growing plants",
               "in a specified nutrient solution, WITHOUT soil."],
        why="Soil normally supplies both support and minerals, so removing it is what lets each mineral "
            "be supplied on its own and studied.",
        mistakes=["Leaving out 'without soil'. That is the defining feature.",
                  "Saying plants are grown in water alone. It is a NUTRIENT solution, not plain water."],
        tip="Hydro means water: the roots sit in solution, not soil.",
        note="Two lines. The words 'nutrient solution' and 'without soil' are both needed."),
      S('s2_use','boxed_final','What it shows',1,'Use',
        lines=[{"text":"Leave one element out and see what fails","style":"boxed"},
               "Because every element in the solution is known,",
               "hydroponics is used to find which elements are",
               "essential and what their deficiency symptoms",
               "are."],
        why="A known solution can have exactly one element removed, and whatever goes wrong afterwards "
            "must be that element's job.",
        mistakes=["Giving only the definition. The second mark is for what hydroponics is used for.",
                  "Saying it is used to grow crops faster. Its use here is to study essential elements."],
        tip="Control the solution and the plant tells you what is missing.",
        note="One line on the purpose. This is the half most answers skip.")]))

C.append(Q(U, 'leghaemoglobin', 'VSAQ', 'vsaq2', 152, 50,
    "Explain the role of the pink colour pigment in the root nodule of legume plants. What is it called?",
    years=[('ap',2015),('ts',2015)],
    split=[("What it is called",1),("Its role",1)],
    insider="The name and the job. The job is one word long — oxygen scavenger — and it is the mark most "
            "often left out.",
    steps=[
      S('s1_name','text','What it is called',1,'Name',
        lines=["The pink pigment in the root nodules of legume",
               "plants is called LEG-HAEMOGLOBIN."],
        why="The name says what it is: a haemoglobin-like pigment, and haemoglobin is a molecule that "
            "binds oxygen — which is already the answer to the second half.",
        mistakes=["Calling it haemoglobin. It is LEG-haemoglobin, found in legume nodules.",
                  "Calling it chlorophyll. Chlorophyll is green; this pigment is pink."],
        tip="Legume plus haemoglobin: the name carries both the place and the job.",
        note="One line. Spell leg-haemoglobin in full."),
      S('s2_role','boxed_final','Its role',1,'Role',
        lines=[{"text":"It keeps oxygen away from nitrogenase","style":"boxed"},
               "Leg-haemoglobin binds oxygen inside the nodule.",
               "This protects the NITROGENASE enzyme, which is",
               "highly sensitive to oxygen.",
               "So nitrogen fixation can go on."],
        why="Nitrogenase is destroyed by oxygen, so nitrogen fixation is only possible if something keeps "
            "the oxygen level inside the nodule very low.",
        mistakes=["Saying it carries oxygen TO the bacteria. Its job is to keep oxygen AWAY from nitrogenase.",
                  "Naming no enzyme. Nitrogenase is what is being protected, and it is the mark."],
        tip="Pink pigment, oxygen sponge: it mops up what the enzyme cannot survive.",
        note="Name the enzyme and say why it needs protecting. The guide writes 'dinitrogenase' for the "
             "same enzyme complex; NCERT writes nitrogenase.")]))

C.append(Q(U, 'nitrogen_fixation_equation', 'VSAQ', 'vsaq3', 153, 50,
    "Write the balanced equation of nitrogen fixation.",
    years=[('ts',2016)],
    split=[("The equation",1),("What it shows",1)],
    insider="Write the equation exactly, coefficients and all. Sixteen ATP is the number examiners check.",
    steps=[
      S('s1_equation','equation','The equation',1,'Equation',
        lines=[{"text":"N2 + 8H+ + 8e- + 16ATP","style":"eq"},
               {"text":"   --> 2NH3 + H2 + 16ADP + 16Pi","style":"eq"}],
        why="The equation is the whole answer, so the coefficients are the content rather than decoration.",
        mistakes=["Writing NH3 without the coefficient 2. One N2 gives TWO ammonia molecules.",
                  "Leaving out the 16 ATP. The energy cost is the point of the equation."],
        tip="Sixteen ATP for one nitrogen molecule: the most expensive reaction in the plant.",
        note="Two lines, both coefficients correct. Nothing else is needed for this mark."),
      S('s2_meaning','boxed_final','What it shows',1,'Meaning',
        lines=[{"text":"Sixteen ATP to break one N triple bond","style":"boxed"},
               "Nitrogen fixation converts atmospheric N2 into",
               "ammonia.",
               "It is catalysed by NITROGENASE.",
               "The 16 ATP show how much energy it costs to",
               "break the triple bond in N2."],
        why="The N triple bond is one of the strongest in nature, which is why the reaction needs so much "
            "ATP and why only a few organisms can do it.",
        mistakes=["Naming no enzyme. Nitrogenase carries out the reaction.",
                  "Saying nitrogen is converted to nitrate here. The product of FIXATION is ammonia."],
        tip="A triple bond is expensive to break, and the ATP count says how expensive.",
        note="Name the enzyme, the product and why the ATP cost is high.")]))

C.append(Q(U, 'essential_elements_deficiency', 'VSAQ', 'vsaq4', 154, 50,
    "Name any two essential elements and the deficiency diseases caused by them.",
    split=[("Two elements",1),("Their deficiency symptoms",1)],
    note_extra="BOOK NOTE: the guide answers \"Deficiency of N and K in plants cause a disease called "
               "Chlorosis\", giving one symptom for both elements. Nitrogen deficiency does cause "
               "chlorosis; potassium deficiency causes MOTTLED chlorosis with marginal necrosis of the "
               "leaves. The card names both correctly and records the guide's single label.",
    insider="Name the element and its own symptom. Giving one symptom for two different elements is the "
            "guide's own shortcut and is not worth copying.",
    steps=[
      S('s1_elements','text','Two essential elements',1,'Elements',
        lines=["Two essential elements are:",
               "1. Nitrogen (N)",
               "2. Potassium (K)",
               "Both are macronutrients, needed in large",
               "amounts."],
        why="Both are macronutrients, so their shortage shows quickly and visibly — which is why they are "
            "the standard pair for this question.",
        mistakes=["Naming a micronutrient and calling it a macronutrient. N and K are MACROnutrients.",
                  "Naming only one element. The question asks for two."],
        tip="N and K: the two the plant needs most and misses first.",
        note="Two named elements with symbols. Add the word macronutrient."),
      S('s2_symptoms','boxed_final','Their deficiency symptoms',1,'Symptoms',
        lines=[{"text":"Nitrogen: chlorosis. Potassium: mottled","style":"boxed"},
               {"text":"chlorosis with dead leaf margins","style":"boxed"},
               "Nitrogen deficiency causes CHLOROSIS, the",
               "yellowing of leaves from loss of chlorophyll.",
               "Potassium deficiency causes mottled chlorosis",
               "and NECROSIS of the leaf tips and margins."],
        why="Each element does a different job, so a shortage of each produces a different symptom rather "
            "than one shared one.",
        mistakes=["Giving chlorosis as the answer for both. Only nitrogen deficiency gives plain chlorosis.",
                  "Defining chlorosis nowhere. One line saying it is the yellowing of leaves earns the mark."],
        tip="Yellow all over is nitrogen; dead edges are potassium.",
        note="One symptom per element, each defined in a few words.")]))

main(C, U)
