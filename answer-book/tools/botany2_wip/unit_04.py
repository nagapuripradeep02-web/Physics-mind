# -*- coding: utf-8 -*-
"""Unit 4 — Photosynthesis in Higher Plants. Book SAQ ch.7 (p.25), VSAQ ch.14 (p.40),
Star Questions Plus (pp.52-53). Globals 17, 18, 19, 168 (SAQ) and 63-71 (VSAQ)."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from emit import Q, S, main
import figs_u4

U = 4
C = []

# ── the one DRAW question in the paper: the diagram carries all four marks ───
C.append(Q(U, 'chloroplast_diagram', 'SAQ', 'saq1', 17, 25,
    "Draw a neat labelled diagram of Chloroplast.",
    years=[('ap',2022),2014],
    split=[("Outline with both membranes",1),("Grana and stromal lamellae",1),
           ("Stroma with its contents",1),("All labels correct",1)],
    note_extra="This is the ONE question in the paper whose marks sit on the drawing: it says \"draw a "
               "neat labelled diagram\", so the figure step carries all four marks and there is no "
               "written answer to substitute. The book prints the figure alone with no prose.",
    insider="The word 'labelled' is worth a full mark on its own. Six labels — outer membrane, inner "
            "membrane, grana, stromal lamella, stroma, ribosomes — turn a sketch into an answer.",
    steps=[
      S('s1_diagram','diagram','Neat labelled diagram',4,'Neat labelled diagram',
        figure=figs_u4.CHLOROPLAST,
        why="The question asks for the drawing itself, so every mark is earned by what is on the paper: "
            "a double boundary, stacked grana joined by lamellae, and a labelled stroma.",
        mistakes=["Drawing a single boundary line. A chloroplast has an OUTER and an INNER membrane, so "
                  "the outline must be a double line.",
                  "Drawing the grana as solid blocks. Each granum is a STACK of flattened discs and the "
                  "separate discs must be visible.",
                  "Drawing grana with nothing joining them. The stromal lamellae connect the stacks and "
                  "are a named label."],
        tip="Two membranes, three stacks, the sheets between them, then six labels.",
        note="All four marks are here. Draw big: a small chloroplast leaves no room to show the separate "
             "discs in a granum, and the discs are what the second mark is for."),
      S('s2_checklist','text','What the examiner checks',0,None,
        lines=["The six labels the diagram must carry:",
               "1. Outer membrane   2. Inner membrane",
               "3. Grana            4. Stromal lamella",
               "5. Stroma           6. Ribosomes",
               "Starch granule and lipid droplet may be added.",
               "Light reaction happens in the GRANA.",
               "Dark reaction happens in the STROMA."],
        why="Writing the two reaction sites beside the drawing costs one line and answers the follow-up "
            "question an examiner most often asks about this figure.",
        mistakes=["Labelling the whole inside 'stroma' and stopping. The grana and lamellae are separate labels.",
                  "Swapping the reaction sites. Light reaction is in the GRANA, dark reaction in the STROMA."],
        tip="Grana for light, stroma for dark.",
        note="No marks here — this is the checklist to run over your own drawing before you move on.")]))

C.append(Q(U, 'c3_vs_c4', 'SAQ', 'saq2', 18, 25,
    "Tabulate any eight differences between C3 and C4 plants/cycles.",
    years=[('ap',2015),('ap',2017),('ts',2015),('ts',2017)],
    split=[("First product and climate",1),("Kranz anatomy and chloroplast dimorphism",1),
           ("Photorespiration and transpiration",1),("Efficiency, biomass and examples",1)],
    insider="The question says TABULATE. Draw the two columns and number the rows — an examiner marking "
            "eight differences in a paragraph will miss some, and that is entirely avoidable.",
    steps=[
      S('s1_product','text','First product and climate',1,'Product, climate',
        lines=["C3 CYCLE  |  C4 CYCLE",
               "1. First stable product is a 3-carbon",
               "compound, PGA (phosphoglyceric acid).",
               "   | First stable product is a 4-carbon",
               "   compound, OAA (oxaloacetic acid).",
               "2. Occurs mostly in TEMPERATE plants.",
               "   | Occurs in TROPICAL plants."],
        why="The names C3 and C4 come from the number of carbons in the first stable product, so that "
            "row explains where both names came from.",
        mistakes=["Saying the first product of C4 is PGA. PGA is the C3 product; OAA is the C4 product.",
                  "Swapping the climates. C3 is temperate, C4 is tropical."],
        tip="Three carbons for C3, four for C4: the name IS the first product.",
        note="Set up two columns on the first line and keep the row numbers aligned throughout."),
      S('s2_anatomy','text','Kranz anatomy and chloroplast dimorphism',1,'Anatomy',
        lines=["3. Leaves do NOT show Kranz anatomy.",
               "   | Leaves DO show Kranz anatomy.",
               "4. Chloroplast dimorphism is NOT seen.",
               "   | Chloroplast dimorphism IS seen."],
        why="Kranz anatomy is the wreath of bundle sheath cells that lets a C4 plant keep its two "
            "reactions apart, so it is the structural reason for every other difference in the table.",
        mistakes=["Giving Kranz anatomy to C3 plants. Only C4 leaves have it.",
                  "Leaving out chloroplast dimorphism. Two kinds of chloroplast is what Kranz anatomy holds."],
        tip="Kranz means wreath: only C4 leaves wear one.",
        note="Two rows, both about structure. These are the rows that explain the rest."),
      S('s3_photoresp','text','Photorespiration and transpiration',1,'Losses',
        lines=["5. Photorespiration is very HIGH.",
               "   | Photorespiration is NOT detectable.",
               "6. Transpiration is MORE.",
               "   | Transpiration is LESS."],
        why="Both rows are losses, and C4 plants avoid both because they concentrate carbon dioxide "
            "around RuBisCO instead of letting oxygen compete with it.",
        mistakes=["Saying C4 plants photorespire more. C4 photorespiration is NOT detectable.",
                  "Reversing the transpiration row. C4 plants lose LESS water."],
        tip="C4 wastes less of everything: less carbon lost, less water lost.",
        note="Two rows about what is lost. Both go the same way, which makes them easy to remember."),
      S('s4_yield','boxed_final','Efficiency, biomass and examples',1,'Yield, examples',
        lines=[{"text":"C4 fixes more carbon with less water lost","style":"boxed"},
               "7. Less efficient at using atmospheric CO2.",
               "   | MORE efficient at using atmospheric CO2.",
               "8. Biomass produced is LESS.",
               "   | Biomass produced is HIGH.",
               "9. Example: almost all dicot plants.",
               "   | Example: maize, sugarcane, sorghum."],
        why="The examples are the check on the whole table: maize and sugarcane are tropical grasses, "
            "which is exactly what rows 2 and 3 predict.",
        mistakes=["Giving no examples. The example row is part of the eight differences asked for.",
                  "Naming a C3 plant as C4. Maize, sugarcane and sorghum are the standard C4 three."],
        tip="Tropical grasses are the C4 plants: maize, sugarcane, sorghum.",
        note="Finish with the examples. Eight numbered rows is the target the question sets.")]))

C.append(Q(U, 'photorespiration', 'SAQ', 'saq3', 19, 25,
    "Describe in brief photorespiration.",
    years=[('ts',2019),('ts',2020)],
    split=[("RuBisCO and its two substrates",1),("What happens when oxygen wins",1),
           ("The products",1),("Why it is wasteful",1)],
    insider="The whole answer turns on one enzyme having two jobs. Say RuBisCO binds BOTH carbon dioxide "
            "and oxygen in the first two lines and the rest follows.",
    steps=[
      S('s1_rubisco','text','RuBisCO and its two substrates',1,'The enzyme',
        lines=["RuBisCO is the most abundant enzyme in the",
               "world.",
               "Its active site can bind BOTH carbon dioxide",
               "and oxygen. That is why it is named",
               "ribulose bisphosphate carboxylase-oxygenase.",
               "It has a much greater affinity for CO2 than",
               "for O2."],
        why="One active site that accepts two different gases is the whole cause of photorespiration, so "
            "the enzyme's double name is the first thing to write.",
        mistakes=["Saying RuBisCO binds only carbon dioxide. It binds oxygen too, and that is the point.",
                  "Saying it prefers oxygen. It has a much GREATER affinity for carbon dioxide."],
        tip="Carboxylase and oxygenase in one name: two jobs, one active site.",
        note="Name the enzyme in full and say it takes both gases. The affinity line matters."),
      S('s2_oxygen','equation','What happens when oxygen wins',1,'Oxygen binds',
        lines=["Normally CO2 binds and the Calvin cycle runs:",
               {"text":"RuBP + CO2  --RuBisCO-->  2 x 3-PGA","style":"eq"},
               "But if the oxygen concentration is HIGH,",
               "RuBisCO acts as an OXYGENASE and binds O2",
               "instead.",
               "This pathway is called PHOTORESPIRATION."],
        why="Which gas binds depends on which is more plentiful, so photorespiration is not a separate "
            "mechanism but the same enzyme meeting a different gas.",
        mistakes=["Saying photorespiration is a separate enzyme's work. It is the SAME enzyme, RuBisCO.",
                  "Leaving out the condition. It happens when the OXYGEN concentration is high."],
        tip="Same enzyme, different gas, different pathway.",
        note="Give the normal equation first so the departure from it is visible."),
      S('s3_products','text','The products',1,'Products',
        lines=["Instead of two molecules of PGA, the reaction",
               "gives only ONE:",
               "one molecule of phosphoglycerate and",
               "one molecule of PHOSPHOGLYCOLATE.",
               "Phosphoglycolate is a 2-carbon compound and is",
               "of no use to the Calvin cycle."],
        why="Half the usual product is lost to a two-carbon compound the cycle cannot use, which is the "
            "measurable cost of photorespiration.",
        mistakes=["Saying two PGA are still formed. Only ONE PGA is formed, plus phosphoglycolate.",
                  "Calling phosphoglycolate a 3-carbon compound. It has TWO carbons."],
        tip="Two products, only one of them useful.",
        note="Name both products and say which one is useless."),
      S('s4_wasteful','boxed_final','Why it is wasteful',1,'Wasteful',
        lines=[{"text":"No sugar, no ATP, no NADPH — and CO2 lost","style":"boxed"},
               "In photorespiration there is NO synthesis of",
               "sugar, NO synthesis of ATP and NO synthesis of",
               "NADPH.",
               "Carbon dioxide is RELEASED and ATP is USED UP.",
               "Photorespiration is therefore a wasteful",
               "process."],
        why="A pathway that consumes ATP, releases carbon dioxide and makes nothing is a net loss on "
            "every count, which is what the word wasteful is being asked to justify.",
        mistakes=["Saying photorespiration makes a little ATP. It makes NONE and consumes ATP.",
                  "Saying carbon dioxide is fixed. It is RELEASED."],
        tip="It spends ATP and gives back carbon dioxide: a loss on both sides.",
        note="Three negatives and one release. This is the mark for the word 'wasteful'.")]))

C.append(Q(U, 'calvin_cycle', 'SAQ', 'saq4', 168, 52,
    "Explain the Calvin cycle.",
    split=[("What the Calvin cycle is",1),("Carbon fixation phase",1),
           ("Reduction phase",1),("Regeneration phase",1)],
    note_extra="Printed under STAR QUESTIONS PLUS (pp.52-53), and the LAQ chapter cross-references it "
               "(\"For Calvin Cycle 'Q' Refer P.No: 52(168)\"), so the book treats it as major content: "
               "the printed answer runs two pages with a full cycle diagram. That is Section-C-grade "
               "material, but the 2022 blue print gives Photosynthesis 6 marks with NO Section-C slot, "
               "and the book prints it outside every LAQ chapter, so it is authored at 4 marks with NO "
               "8-mark form invented — the same discipline the junior botany track used for "
               "Section-C-grade content the book does not source as an LAQ. FOUNDER RULING 2026-08-29: "
               "stays at 4 marks. SETTLED, not open — do not re-raise it. If a real Telangana "
               "Botany-II paper ever sets this question at 8 marks, that is new evidence and the "
               "answer is a CUT over these same steps, not a second card.",
    insider="Three phases, in order, with the number of carbons at each step. Carbon fixation, reduction, "
            "regeneration — an answer that names all three in order has most of the marks already.",
    steps=[
      S('s1_what','text','What the Calvin cycle is',1,'Definition',
        lines=["The Calvin cycle is the cyclic process in which",
               "carbon dioxide from the air is converted into",
               "sugar.",
               "It occurs in the STROMA of the chloroplast.",
               "It is the dark reaction, or C3 pathway.",
               "It has THREE phases: carbon fixation,",
               "reduction and regeneration."],
        why="Naming the three phases in the first step turns the rest of the answer into three labelled "
            "paragraphs, which is how the marks are actually split.",
        mistakes=["Saying the Calvin cycle happens in the grana. It happens in the STROMA.",
                  "Calling it the light reaction. It is the DARK reaction."],
        tip="Stroma, three phases: fix, reduce, regenerate.",
        note="Definition, site, alternative names, the three phase names. Six lines."),
      S('s2_fixation','equation','Carbon fixation phase',1,'Fixation',
        lines=["1. CARBON FIXATION:",
               "CO2 combines with the 5-carbon compound RuBP",
               "(ribulose 1,5-bisphosphate).",
               "The enzyme is RuBisCO.",
               {"text":"6 RuBP + 6CO2 + 6H2O","style":"eq"},
               {"text":"   --RuBisCO-->  12 PGA (3C)","style":"eq"},
               "PGA is the first stable product, so this is",
               "called the C3 pathway."],
        why="A 5-carbon acceptor plus a 1-carbon gas gives a 6-carbon compound that splits at once into "
            "two 3-carbon molecules, which is why twelve PGA come from six RuBP.",
        mistakes=["Naming PEP as the acceptor. PEP is the C4 acceptor; RuBP is the C3 acceptor.",
                  "Writing RuBP as ribulose biphosphate. It is BISphosphate — two separate phosphates."],
        tip="Five carbons plus one makes six, which splits into two threes.",
        note="Acceptor, enzyme, equation, first product. The word bisphosphate matters."),
      S('s3_reduction','equation','Reduction phase',1,'Reduction',
        lines=["2. REDUCTION:",
               "A two step reaction that forms trioses (G-3-P).",
               "Step 1 uses ATP:",
               {"text":"12 PGA + 12 ATP --> 12 bisPGA + 12 ADP","style":"eq"},
               "Step 2 uses NADPH:",
               {"text":"12 bisPGA + 12 NADPH","style":"eq"},
               {"text":"   --> 12 G-3-P + 12 NADP+","style":"eq"},
               "Fixing ONE CO2 needs 3 ATP and 2 NADPH."],
        why="This is where the ATP and NADPH made in the light reaction are actually spent, which is what "
            "links the dark reaction back to the light one.",
        mistakes=["Saying the reduction phase uses NADH. It uses NADPH.",
                  "Giving the wrong ratio. Per carbon dioxide fixed it is 3 ATP and 2 NADPH."],
        tip="Three ATP and two NADPH buy one carbon.",
        note="Both steps with their equations, then the 3-and-2 ratio. The ratio is often asked alone."),
      S('s4_regeneration','boxed_final','Regeneration phase',1,'Regeneration',
        lines=[{"text":"RuBP is rebuilt, so the cycle can run again","style":"boxed"},
               "3. REGENERATION:",
               "The CO2 acceptor RuBP is formed again, so the",
               "cycle can continue.",
               "This needs ONE more ATP for phosphorylation.",
               "Of the twelve G-3-P formed, TEN are used to",
               "rebuild six RuBP; the other TWO leave the cycle",
               "as sugar."],
        why="The cycle only continues because most of its own product is spent rebuilding the acceptor, "
            "which is why so little sugar leaves per turn.",
        mistakes=["Saying all the G-3-P becomes sugar. Most of it is used to REBUILD RuBP.",
                  "Leaving out the extra ATP. Regeneration costs one more ATP per RuBP."],
        tip="Ten back into the cycle, two out as sugar.",
        note="Say what is rebuilt, what it costs, and how much product actually leaves."),
      S('s5_diagram','diagram','Diagram — the Calvin cycle',0,None,
        figure=figs_u4.CALVIN,
        why="The three phases only make sense as a ring: the compound the cycle ends by rebuilding is the "
            "same one it started by using, and a straight-line drawing hides that.",
        mistakes=["Drawing the cycle as a straight chain. It is a CYCLE; RuBP is regenerated.",
                  "Drawing the sugar leaving from RuBP. Sugar leaves from the TRIOSE PHOSPHATE stage.",
                  "Putting the ATP input only at reduction. Regeneration needs ATP as well."],
        tip="One ring, three numbered arcs, one arrow out.",
        note="No diagram mark — the question says explain. Draw it anyway: the ring makes the "
             "regeneration mark almost self-explaining.")]))

# ═══════════════════ VSAQ (Section A, 2 marks) ═══════════════════
def vs(slug, ref, gno, text, split, insider, steps, years=None, note_extra=None):
    C.append(Q(U, slug, 'VSAQ', ref, gno, 40, text, years=years, split=split,
               insider=insider, steps=steps, note_extra=note_extra))


vs('grana_stroma_processes','vsaq1',63,
   "Name the processes which take place in the grana and stroma regions of chloroplasts.",
   [("Grana",1),("Stroma",1)],
   "Two words, two places. Naming the reaction without naming the region, or the other way round, "
   "answers half the question.",
   [S('s1_grana','text','Grana',1,'Grana',
      lines=["The LIGHT REACTION takes place in the GRANA of",
             "the chloroplast.",
             "It is also called the photochemical phase."],
      why="The grana hold the chlorophyll-bearing thylakoid membranes, so the reaction that needs light "
          "has to happen there.",
      mistakes=["Saying the dark reaction happens in the grana. The LIGHT reaction does.",
                "Naming the region as thylakoid without saying grana. Grana is the word asked for."],
      tip="Grana are green stacks: green catches light.",
      note="Reaction name plus region. Three lines."),
    S('s2_stroma','boxed_final','Stroma',1,'Stroma',
      lines=[{"text":"Light in the grana, carbon in the stroma","style":"boxed"},
             "The DARK REACTION (carbon fixation) takes place",
             "in the STROMA of the chloroplast.",
             "It is also called the biosynthetic phase."],
      why="The Calvin cycle enzymes are dissolved in the stroma, so the carbon reactions happen in the "
          "fluid rather than on the membranes.",
      mistakes=["Calling the dark reaction 'the reaction in darkness'. It does not need darkness, only "
                "that it does not use light directly.",
                "Swapping the two regions. Grana for light, stroma for dark."],
      tip="Stroma is the fluid, and the sugar is built in it.",
      note="Mirror the grana line. The contrast is the whole answer.")])

vs('photolysis_of_water','vsaq2',64,
   "Where does the photolysis of H2O occur? What is its significance?",
   [("Where",1),("Significance",1)],
   "The significance is one sentence and it is a big claim: the oxygen in the air we breathe comes from "
   "here. Write it.",
   [S('s1_where','text','Where it occurs',1,'Where',
      lines=["Photolysis of water occurs in the GRANA of the",
             "chloroplast.",
             "It happens during the light reaction."],
      why="Splitting water needs light energy, so it happens where the light-absorbing membranes are.",
      mistakes=["Saying photolysis happens in the stroma. It happens in the GRANA.",
                "Saying it happens during the dark reaction. It is part of the LIGHT reaction."],
      tip="Water is split where the light is caught.",
      note="Region plus which reaction. Three lines."),
    S('s2_significance','boxed_final','Significance',1,'Significance',
      lines=[{"text":"The source of the oxygen in the atmosphere","style":"boxed"},
             "During photolysis, OXYGEN is evolved.",
             "This is the main source of atmospheric oxygen.",
             "The reaction also supplies electrons and protons",
             "to the light reaction."],
      why="Splitting water releases oxygen as a by-product, and because plants do this on an enormous "
          "scale it is where nearly all the oxygen in the air came from.",
      mistakes=["Saying the oxygen comes from carbon dioxide. It comes from WATER.",
                "Giving only 'oxygen is released'. The significance is that it is the atmosphere's source."],
      tip="The oxygen we breathe was once water in a leaf.",
      note="Oxygen, the atmosphere, and what else the split supplies. Four lines.")],
   years=[('ap',2017),('ap',2020),('ts',2019),('ts',2022)])

vs('action_vs_absorption_spectrum','vsaq3',65,
   "Distinguish between action spectrum and absorption spectrum.",
   [("Action spectrum",1),("Absorption spectrum",1)],
   "Both are graphs against wavelength. The difference is entirely in what is plotted up the y-axis, so "
   "name that quantity in each half.",
   [S('s1_action','text','Action spectrum',1,'Action',
      lines=["The ACTION spectrum is the graph showing the",
             "RATE OF PHOTOSYNTHESIS at different wavelengths",
             "of light."],
      why="It measures what the plant actually does with each colour, which is why it is called the "
          "action spectrum.",
      mistakes=["Saying it plots absorption. That is the OTHER spectrum.",
                "Leaving out 'at different wavelengths'. Both graphs run against wavelength."],
      tip="Action means what the plant DOES with the light.",
      note="Name the quantity on the y-axis. That is the whole mark."),
    S('s2_absorption','boxed_final','Absorption spectrum',1,'Absorption',
      lines=[{"text":"Rate of photosynthesis against light absorbed","style":"boxed"},
             "The ABSORPTION spectrum is the graph showing the",
             "ABSORPTION OF LIGHT by pigments at different",
             "wavelengths.",
             "The two curves nearly overlap, which shows",
             "chlorophyll a is the main pigment."],
      why="The two curves matching is the evidence that the light being absorbed is the same light "
          "driving photosynthesis.",
      mistakes=["Saying the absorption spectrum plots the rate of photosynthesis. It plots ABSORPTION.",
                "Leaving out the pigment. It is the PIGMENTS that absorb."],
      tip="Absorption means what the pigment TAKES IN.",
      note="Mirror the first half, then one line on why the two curves are compared."),
    ],
   years=[('ap',2016)])

vs('law_of_limiting_factors','vsaq4',66,
   "Define the law of limiting factors proposed by Blackman.",
   [("The law",1),("What it means in practice",1)],
   "This is a definition to write almost word for word. 'Relative minimal value' is the phrase the "
   "examiner is scanning for.",
   [S('s1_law','text','The law',1,'The law',
      lines=["Law of limiting factors (Blackman):",
             "In a process participated in by a number of",
             "separate factors, the RATE of the process is",
             "limited by the factor which is present in a",
             "RELATIVE MINIMAL VALUE."],
      why="The rate is set by whichever requirement is scarcest, so improving anything else changes "
          "nothing until that one is fixed.",
      mistakes=["Saying the rate is set by the largest factor. It is set by the one in shortest supply.",
                "Leaving out 'rate'. The law is about the RATE of the process."],
      tip="The scarcest ingredient sets the speed.",
      note="Write the definition in full. Five lines, and it is nearly the whole answer."),
    S('s2_practice','boxed_final','What it means in practice',1,'In practice',
      lines=[{"text":"Raise the scarcest factor and the rate rises","style":"boxed"},
             "In photosynthesis, light, carbon dioxide,",
             "temperature and water are all factors.",
             "If carbon dioxide is scarce, adding more light",
             "will NOT raise the rate.",
             "Raising the scarce factor is what raises the",
             "rate."],
      why="The worked case is what shows the law was understood rather than memorised, and it is what "
          "makes the definition useful.",
      mistakes=["Giving no example. One factor named as scarce makes the definition concrete.",
                "Saying every factor raises the rate equally. Only the limiting one does."],
      tip="Adding more of what you already have plenty of changes nothing.",
      note="One worked case in three lines. Name a real factor.")],
   years=[('ap',2016),('ap',2017),('ap',2019)])

vs('c3_acceptor_and_first_product','vsaq5',67,
   "What is the primary acceptor of CO2 in C3 plants? What is the first stable compound formed in a Calvin cycle?",
   [("The acceptor",1),("The first stable compound",1)],
   "Two names, two carbon counts. Adding '(5C)' and '(3C)' costs nothing and shows exactly where the "
   "name C3 comes from.",
   [S('s1_acceptor','text','The acceptor',1,'Acceptor',
      lines=["The primary acceptor of CO2 in C3 plants is",
             "RuBP — ribulose 1,5-BISphosphate.",
             "It is a 5-carbon compound."],
      why="A 5-carbon acceptor taking one carbon gives a 6-carbon compound, which is why the product "
          "splits into two 3-carbon molecules.",
      mistakes=["Naming PEP. PEP is the C4 acceptor, not the C3 one.",
                "Writing 'biphosphate'. It is BISphosphate — two separate phosphate groups."],
      tip="RuBP has five carbons and catches the sixth.",
      note="Full name with the carbon count. Watch the spelling of bisphosphate."),
    S('s2_product','boxed_final','The first stable compound',1,'First product',
      lines=[{"text":"RuBP (5C) catches CO2; PGA (3C) is what forms","style":"boxed"},
             "The first stable compound is PGA —",
             "3-phosphoglyceric acid.",
             "It is a 3-carbon compound, which is why the",
             "pathway is called the C3 cycle."],
      why="The pathway is named after the first stable product, so the carbon count here explains the "
          "name of the whole cycle.",
      mistakes=["Naming OAA. OAA is the first C4 product.",
                "Leaving out the carbon count. Three carbons is why it is called C3."],
      tip="Three carbons in the first product names the whole cycle.",
      note="Name it, give the carbon count, and connect it to the name C3.")],
   years=[('ap',2018),('ap',2019),('ap',2022)])

vs('c4_acceptor_and_first_product','vsaq6',68,
   "What is the primary acceptor of CO2 in C4 plants? What is the first compound formed as a result of primary carboxylation in the C4 pathway?",
   [("The acceptor",1),("The first compound",1)],
   "The exact mirror of the C3 question. Learn the two pairs together and neither can be confused for "
   "the other.",
   [S('s1_acceptor','text','The acceptor',1,'Acceptor',
      lines=["The primary acceptor of CO2 in C4 plants is",
             "PEP — phosphoenolpyruvic acid.",
             "It is a 3-carbon compound.",
             "The enzyme is PEP carboxylase."],
      why="PEP carboxylase has no affinity for oxygen at all, which is why a C4 plant can fix carbon "
          "without any photorespiration.",
      mistakes=["Naming RuBP. RuBP is the C3 acceptor.",
                "Saying the enzyme is RuBisCO. Primary carboxylation in C4 uses PEP CARBOXYLASE."],
      tip="PEP has three carbons and catches the fourth.",
      note="Full name, carbon count, enzyme. The enzyme is worth adding."),
    S('s2_product','boxed_final','The first compound',1,'First product',
      lines=[{"text":"PEP (3C) catches CO2; OAA (4C) is what forms","style":"boxed"},
             "The first compound formed is OAA —",
             "oxaloacetic acid.",
             "It is a 4-carbon compound, which is why the",
             "pathway is called the C4 cycle."],
      why="Three carbons plus one gives four, and the four-carbon product is what gives the pathway its "
          "name.",
      mistakes=["Naming PGA. PGA is the first C3 product.",
                "Leaving out the carbon count. Four carbons is why it is called C4."],
      tip="Four carbons in the first product names the C4 cycle.",
      note="Mirror the C3 answer exactly: name, count, and the link to the pathway name.")])

vs('phloem_transports_food','vsaq7',69,
   "Which tissue transports photosynthates? What experiment proves this?",
   [("The tissue",1),("The experiment",1)],
   "Name the experiment. 'Ringing' or 'girdling' is one word and it is a whole mark.",
   [S('s1_tissue','text','The tissue',1,'Tissue',
      lines=["PHLOEM is the tissue that transports",
             "photosynthates (the food made in the leaves).",
             "The transport is called translocation."],
      why="Phloem carries the products of photosynthesis while xylem carries water, and separating the "
          "two tissues by what they carry is the point of the question.",
      mistakes=["Naming xylem. Xylem carries water and minerals; PHLOEM carries food.",
                "Leaving out the word photosynthates or food. The tissue is named by what it carries."],
      tip="Phloem carries food; xylem carries water.",
      note="Name the tissue and what it carries. Add the word translocation."),
    S('s2_experiment','boxed_final','The experiment',1,'Experiment',
      lines=[{"text":"Ringing: remove the phloem and food stops","style":"boxed"},
             "The RINGING or GIRDLING experiment proves it.",
             "A ring of bark, containing the phloem, is removed",
             "from a stem.",
             "The part ABOVE the ring swells, because food",
             "collects there and cannot move down."],
      why="Removing only the phloem and watching food pile up above the cut is direct evidence that the "
          "phloem was the route, because the xylem was left intact.",
      mistakes=["Naming no experiment. Ringing or girdling is the named answer.",
                "Saying the part below swells. The swelling is ABOVE the ring."],
      tip="Cut the phloem and the food stops above the cut.",
      note="Name it, say what is removed, and say where the swelling appears.")])

vs('atp_nadph_per_co2','vsaq8',70,
   "How many molecules of ATP and NADPH are needed to fix a molecule of CO2 in C3 plants? Where does this process occur?",
   [("The numbers",1),("Where",1)],
   "Two numbers and one place. Three ATP and two NADPH, in the stroma. Nothing else is needed.",
   [S('s1_numbers','text','The numbers',1,'Numbers',
      lines=["To fix ONE molecule of carbon dioxide, a C3",
             "plant needs:",
             "3 molecules of ATP",
             "2 molecules of NADPH"],
      why="Both are made in the light reaction, so this ratio is the exact bill the dark reaction sends "
          "to the light reaction for every carbon fixed.",
      mistakes=["Swapping the numbers. It is 3 ATP and 2 NADPH, not 2 and 3.",
                "Writing NADH. It is NADPH in photosynthesis."],
      tip="Three ATP, two NADPH, one carbon.",
      note="Both numbers on their own lines. This mark is arithmetic, not prose."),
    S('s2_where','boxed_final','Where it occurs',1,'Where',
      lines=[{"text":"3 ATP + 2 NADPH per CO2, in the stroma","style":"boxed"},
             "The process occurs in the STROMA of the",
             "chloroplast.",
             "The ATP and NADPH come from the light reaction",
             "in the grana."],
      why="Naming both places shows where the two reactions meet: the products of the grana are spent in "
          "the stroma.",
      mistakes=["Saying it occurs in the grana. Carbon fixation happens in the STROMA.",
                "Leaving out where the ATP came from. The link to the grana is worth one line."],
      tip="Made in the grana, spent in the stroma.",
      note="Name the site and the source of the ATP. Four lines.")])

vs('calvin_drivers','vsaq9',71,
   "What products drive the Calvin cycle? What products regenerate them?",
   [("What drives it",1),("What regenerates them",1)],
   "This question is really asking how the two halves of photosynthesis connect. Say 'light reaction' "
   "in the second half.",
   [S('s1_drive','text','What drives the cycle',1,'Drivers',
      lines=["ATP and NADPH + H+ drive the Calvin cycle.",
             "ATP supplies the energy.",
             "NADPH supplies the reducing power (the",
             "hydrogen)."],
      why="Carbon dioxide has to be both energised and reduced to become sugar, which is why two "
          "different products are needed rather than one.",
      mistakes=["Naming only ATP. NADPH is needed too, and for a different job.",
                "Saying light drives the Calvin cycle directly. It does not; ATP and NADPH do."],
      tip="ATP is the energy, NADPH is the hydrogen.",
      note="Both names, and one line each on what the two supply."),
    S('s2_regen','boxed_final','What regenerates them',1,'Regeneration',
      lines=[{"text":"Spent in the dark reaction, remade in the light","style":"boxed"},
             "They are regenerated during the LIGHT REACTION.",
             "So the light reaction supplies the dark reaction,",
             "and the two run together."],
      why="The cycle would stop after one turn if nothing replaced the ATP and NADPH, so the light "
          "reaction is what keeps it running.",
      mistakes=["Saying they are regenerated in the Calvin cycle itself. They are made in the LIGHT reaction.",
                "Leaving out the link between the two reactions. That link is the point of the question."],
      tip="The light reaction pays for the dark one.",
      note="Name the light reaction and state the dependency. Four lines.")])

main(C, U)
