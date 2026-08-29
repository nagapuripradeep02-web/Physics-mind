# -*- coding: utf-8 -*-
"""Unit 5 — Respiration in Plants. Book LAQ ch.1 (pp.10-13) + Star Questions Plus (p.52).
Globals 1, 2 (LAQ — the only Section-C questions this unit sources) and 167 (SAQ).
The blue print gives Respiration 8 marks as a Section-C question and nothing else."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from emit import Q, S, main
import figs_u5

U = 5
C = []

C.append(Q(U, 'laq_glycolysis', 'LAQ', 'laq1', 1, 10,
    "Give an account of glycolysis. Where does it occur? What are the end products? "
    "Trace the fate of these products in both aerobic and anaerobic respiration.",
    years=[('ap',2015),('ap',2017),('ap',2020),('ts',2015),('ts',2017)],
    split=[("What glycolysis is, and where",1),("The end products",1),
           ("Fate of pyruvic acid",1),("Energy acquiring phase, steps 1-5",2),
           ("Energy releasing phase, steps 6-10",2),("Net yield",1)],
    note_extra="BOOK ERROR, corrected on this card: the printed answer lists the end products as "
               "\"pyruvic acid (PA), ATP, NADPH+H+\". Glycolysis reduces NAD⁺, not NADP⁺, so the "
               "product is NADH+H⁺. The book's own p.11 flow chart prints NAD⁺ → NADH correctly, so "
               "the guide contradicts itself within one page turn. Two spelling slips are also "
               "corrected: the text writes \"Fructose 1,6-biphosphate\" where its diagram writes "
               "BISphosphate, and \"3-phosglyceric acid\" for 3-phosphoglyceric acid.",
    insider="Four questions in one. Answer them in the order asked — what, where, end products, fate — "
            "then give the ten steps. A student who writes ten beautiful steps and never says "
            "'cytoplasm' has thrown away a mark that took two words.",
    steps=[
      S('s1_define','text','What glycolysis is, and where',1,'Definition, site',
        lines=["GLYCOLYSIS is the first step of respiration in",
               "ALL living organisms.",
               "It occurs in the CYTOPLASM of the cell.",
               "It is the PARTIAL oxidation of one molecule of",
               "glucose to form TWO molecules of pyruvic acid.",
               "It needs no oxygen, so it is common to both",
               "aerobic and anaerobic respiration.",
               "It is also called the EMP pathway, after",
               "Embden, Meyerhof and Parnas."],
        why="Glycolysis happens in the cytoplasm and needs no oxygen, which is exactly why it is the one "
            "stage every living organism shares.",
        mistakes=["Saying glycolysis occurs in the mitochondria. It occurs in the CYTOPLASM.",
                  "Calling it complete oxidation. It is PARTIAL oxidation — glucose only reaches pyruvate.",
                  "Saying it needs oxygen. It does not, which is why anaerobes use it too."],
        tip="First step, cytoplasm, no oxygen, one glucose into two pyruvates.",
        note="Definition, site, partial oxidation, the 1-into-2 count, and the EMP name. Answer the "
             "'where' here so it cannot be forgotten later."),
      S('s2_products','text','The end products',1,'End products',
        lines=["The END PRODUCTS of glycolysis are:",
               "1. Pyruvic acid (2 molecules)",
               "2. ATP (a net gain of 2)",
               "3. NADH + H+ (2 molecules)"],
        why="Three products means three things the next stage can use: a carbon skeleton, energy, and "
            "reducing power.",
        mistakes=["Writing NADPH. Glycolysis reduces NAD+, giving NADH + H+. NADPH belongs to "
                  "photosynthesis. The guide misprints this.",
                  "Giving one pyruvate. One glucose gives TWO pyruvic acid molecules.",
                  "Forgetting that the ATP figure is a NET gain. Four are made and two are spent."],
        tip="Two pyruvates, two ATP net, two NADH.",
        note="Three products with their counts. Say NADH, not NADPH."),
      S('s3_fate','text','Fate of pyruvic acid',1,'Fate',
        lines=["The fate of pyruvic acid depends on oxygen.",
               "In AEROBIC respiration, where oxygen is",
               "available, pyruvic acid is COMPLETELY oxidised",
               "to CO2 and H2O through the Krebs cycle.",
               "In ANAEROBIC respiration, where oxygen is not",
               "available, pyruvic acid is converted by",
               "FERMENTATION into ethyl alcohol (in yeast) or",
               "into lactic acid (in muscle)."],
        why="Oxygen is what decides the fate: with it the carbon is burned all the way to carbon dioxide, "
            "without it the pyruvate is only rearranged.",
        mistakes=["Saying pyruvate is fully oxidised in anaerobic respiration. It is not — fermentation "
                  "only rearranges it.",
                  "Giving one fermentation product. Ethyl alcohol AND lactic acid are both asked for.",
                  "Saying glycolysis itself needs oxygen. Only the FATE of its product depends on oxygen."],
        tip="Oxygen present, burn it to CO2; oxygen absent, ferment it.",
        note="Both routes, both named, with an example organism or tissue each. The question asks for "
             "BOTH, so a one-sided answer loses this mark."),
      S('s4_phase1','equation','Energy acquiring phase, steps 1-5',2,'Steps 1-5',
        lines=["Glycolysis is a chain of TEN enzyme catalysed",
               "reactions. The first five SPEND energy.",
               "1. Phosphorylation:",
               {"text":"Glucose + ATP --hexokinase--> G-6-P + ADP","style":"eq"},
               "2. Isomerisation:",
               {"text":"G-6-P --phosphohexose isomerase--> F-6-P","style":"eq"},
               "3. Phosphorylation:",
               {"text":"F-6-P + ATP --phosphofructokinase-->","style":"eq"},
               {"text":"   Fructose 1,6-BISphosphate + ADP","style":"eq"},
               "4. Cleavage:",
               {"text":"F-1,6-bisP --aldolase--> G-3-P + DHAP","style":"eq"},
               "5. Isomerisation:",
               {"text":"DHAP --triose phosphate isomerase--> G-3-P","style":"eq"}],
        why="Two ATP are spent here to make the six-carbon sugar unstable enough to split, which is why "
            "this half is called the energy acquiring phase even though it produces no energy.",
        mistakes=["Writing 'biphosphate'. It is BISphosphate — two separate phosphate groups. The guide's "
                  "text misprints it and its own diagram gets it right.",
                  "Naming no enzymes. Each named enzyme is part of the mark.",
                  "Stopping at four steps. The DHAP-to-G-3-P isomerisation is step 5 and is what makes "
                  "the second half run twice."],
        tip="Spend two ATP, split one six-carbon sugar into two three-carbon ones.",
        note="Two marks sit here. Number the steps, name the reaction type, name the enzyme. The "
             "equations alone can carry the mark if time runs short."),
      S('s5_phase2','equation','Energy releasing phase, steps 6-10',2,'Steps 6-10',
        lines=["The last five steps RELEASE energy, and each",
               "runs TWICE, once per triose.",
               "6. Oxidation:",
               {"text":"G-3-P + Pi + NAD⁺ --G-3-P dehydrogenase-->","style":"eq"},
               {"text":"   1,3-bisphosphoglyceric acid + NADH + H⁺","style":"eq"},
               "7. Dephosphorylation:",
               {"text":"1,3-bisPGA + ADP --phosphoglycerokinase-->","style":"eq"},
               {"text":"   3-phosphoglyceric acid + ATP","style":"eq"},
               "8. Intramolecular shift:",
               {"text":"3-PGA --phosphoglyceromutase--> 2-PGA","style":"eq"},
               "9. Dehydration:",
               {"text":"2-PGA --enolase--> PEP + H2O","style":"eq"},
               "10. Dephosphorylation:",
               {"text":"PEP + ADP --pyruvate kinase--> pyruvic acid","style":"eq"},
               {"text":"   + ATP","style":"eq"}],
        why="Every reaction from step 6 onward happens twice because step 4 made two three-carbon "
            "molecules, which is why four ATP are collected from a two-ATP investment.",
        mistakes=["Forgetting these steps run twice. That is why the ATP count doubles.",
                  "Writing NADPH at step 6. It is NAD+ that is reduced, to NADH + H+.",
                  "Naming the last enzyme 'pyruvic kinase'. It is PYRUVATE KINASE."],
        tip="Two ATP made at step 7 and two more at step 10: four in, two already spent.",
        note="Two marks. The oxidation at step 6 and the two ATP-making steps are the ones an examiner "
             "checks first."),
      S('s6_diagram','diagram','Diagram — the glycolysis chain',0,None,
        figure=figs_u5.GLYCOLYSIS,
        why="Seeing the ten compounds in one column makes the two halves obvious: ATP arrows point INTO "
            "the chain above the divider and OUT of it below.",
        mistakes=["Drawing ATP being made in the first half. The first half SPENDS ATP.",
                  "Drawing one pyruvate at the bottom. TWO pyruvates leave, because the chain splits in two.",
                  "Leaving the enzymes off the arrows. The enzyme names are what the written answer is "
                  "marked on, and the chart is where they are easiest to remember."],
        tip="Arrows in at the top, arrows out at the bottom: that is the whole shape.",
        note="No diagram mark — the question says 'give an account'. It is still the fastest way to "
             "check your own ten steps are in the right order."),
      S('s7_net','boxed_final','Net yield',1,'Net yield',
        lines=[{"text":"Per glucose: 2 pyruvate, 2 ATP net, 2 NADH","style":"boxed"},
               "4 ATP are produced but 2 are spent, so the NET",
               "gain is 2 ATP.",
               "2 NADH + H+ are produced.",
               "2 molecules of pyruvic acid leave the cytoplasm.",
               "Glycolysis alone releases only a small part of",
               "the energy in glucose; the rest is released in",
               "the Krebs cycle."],
        why="The net figure is what makes the point of the whole answer: glycolysis by itself is a poor "
            "return, which is why aerobic organisms go on to the Krebs cycle.",
        mistakes=["Writing 4 ATP as the answer. FOUR are made, TWO are spent, so the net gain is TWO.",
                  "Ending without a tally. The last line is the one an examiner scans for."],
        tip="Four made, two spent, two kept.",
        note="Give the net figures, not the gross ones. One closing line on why the story continues.")]))

C.append(Q(U, 'laq_krebs_cycle', 'LAQ', 'laq2', 2, 12,
    "Explain the reactions of Krebs cycle.",
    years=[('ap',2016),('ap',2017),('ap',2019),('ap',2019),('ap',2022),('ts',2017),('ts',2019),('ts',2019)],
    split=[("What the Krebs cycle is, and where",1),("The link reaction",1),
           ("Steps 1-5",2),("Steps 6-10",2),("The yield per turn",2)],
    note_extra="Two spelling slips corrected on this card: the guide prints \"Fumerase\" for FUMARASE "
               "and \"Fumeric acid\" and \"FAD⁺\" in its p.13 diagram for fumaric acid and FAD. The "
               "guide's mnemonic is printed partly in Telugu script; the product is English-only "
               "(Rule 30i), so a plain English memory device is given instead.",
    insider="Ten steps, but only four of them are the ones examiners check: the three oxidations that "
            "make NADH, and the one that makes FADH2. Get the tally right and the answer holds together "
            "even if a step name slips.",
    steps=[
      S('s1_define','text','What the Krebs cycle is, and where',1,'Definition, site',
        lines=["The KREBS CYCLE is a cyclic series of reactions",
               "that occurs in ALL AEROBIC organisms.",
               "It takes place in the MATRIX of the",
               "mitochondrion.",
               "In it, acetyl coenzyme A is completely oxidised",
               "to CO2 and H2O.",
               "ADP is converted into energy-rich ATP.",
               "It is also called the citric acid cycle or the",
               "tricarboxylic acid (TCA) cycle."],
        why="It is a cycle because the compound it ends by making, oxaloacetic acid, is the one it began "
            "by using — so the pathway can run again without any new acceptor.",
        mistakes=["Saying the Krebs cycle occurs in the cytoplasm. That is glycolysis; Krebs is in the "
                  "mitochondrial MATRIX.",
                  "Calling it partial oxidation. The Krebs cycle COMPLETELY oxidises acetyl CoA.",
                  "Saying it happens in anaerobic respiration. It needs oxygen."],
        tip="Mitochondrial matrix, complete oxidation, and it ends where it began.",
        note="Definition, site, what is oxidised, and the three names of the cycle."),
      S('s2_link','equation','The link reaction',1,'Link reaction',
        lines=["Pyruvic acid from glycolysis enters the",
               "mitochondrion first.",
               {"text": "There it undergoes OXIDATIVE", "style": "normal"},
               {"text": "DECARBOXYLATION:", "style": "normal"},
               {"text":"Pyruvic acid (3C) + CoA + NAD⁺","style":"eq"},
               {"text":"   --> Acetyl CoA (2C) + CO2 + NADH + H⁺","style":"eq"},
               "This is the LINK REACTION, joining glycolysis",
               "to the Krebs cycle.",
               "It is not part of the cycle itself."],
        why="The cycle can only accept a two-carbon acetyl group, so the three-carbon pyruvate must lose "
            "one carbon before it can enter — which is what the link reaction does.",
        mistakes=["Counting the link reaction as the first step of the cycle. It is a separate step BEFORE it.",
                  "Forgetting the CO2. One carbon is lost here, which is how 3C becomes 2C.",
                  "Saying pyruvate enters the cycle directly. It enters as ACETYL CoA."],
        tip="Three carbons in, two carbons on: one is lost before the cycle starts.",
        note="Name it, give the equation, and say it is NOT part of the cycle. That last point is the mark."),
      S('s3_steps1','equation','Steps 1-5',2,'Steps 1-5',
        lines=["1. Condensation:",
               {"text":"Acetyl CoA + oxaloacetic acid + H2O","style":"eq"},
               {"text":"   --citrate synthase--> citric acid + CoA","style":"eq"},
               "2. Dehydration:",
               {"text":"Citric acid --aconitase--> cis-aconitic acid","style":"eq"},
               {"text":"   + H2O","style":"eq"},
               "3. Hydration:",
               {"text":"cis-aconitic acid --aconitase--> isocitric acid","style":"eq"},
               "4. Oxidation I:",
               {"text":"Isocitric acid + NAD⁺ --dehydrogenase-->","style":"eq"},
               {"text":"   oxalosuccinic acid + NADH + H⁺","style":"eq"},
               "5. Decarboxylation:",
               {"text":"Oxalosuccinic acid --decarboxylase-->","style":"eq"},
               {"text":"   α-ketoglutaric acid + CO2","style":"eq"}],
        why="The first five steps turn a six-carbon acid into a five-carbon one, so the carbon that "
            "entered as acetyl has already begun leaving as carbon dioxide.",
        mistakes=["Naming the first enzyme 'citric acid'. The enzyme is CITRATE SYNTHASE.",
                  "Missing that aconitase catalyses steps 2 AND 3. The same enzyme does both.",
                  "Forgetting the first NADH. Step 4 is the first of three oxidations."],
        tip="Condense to six carbons, then lose the first carbon dioxide at step 5.",
        note="Two marks. Number every step, name the reaction TYPE and the enzyme. The reaction types "
             "are what make the ten steps memorable."),
      S('s4_steps2','equation','Steps 6-10',2,'Steps 6-10',
        lines=["6. Oxidation II:",
               {"text":"α-ketoglutaric acid + NAD⁺ + CoA","style":"eq"},
               {"text":"   --> succinyl CoA + NADH + H⁺ + CO2","style":"eq"},
               "7. Cleavage:",
               {"text":"Succinyl CoA + ADP + Pi --thiokinase-->","style":"eq"},
               {"text":"   succinic acid + ATP + CoA","style":"eq"},
               "8. Oxidation III:",
               {"text":"Succinic acid + FAD --dehydrogenase-->","style":"eq"},
               {"text":"   fumaric acid + FADH2","style":"eq"},
               "9. Hydration:",
               {"text":"Fumaric acid + H2O --fumarase--> malic acid","style":"eq"},
               "10. Oxidation IV:",
               {"text":"Malic acid + NAD⁺ --dehydrogenase-->","style":"eq"},
               {"text":"   oxaloacetic acid + NADH + H⁺","style":"eq"}],
        why="Step 10 regenerates oxaloacetic acid, the very compound step 1 used, and that is what closes "
            "the cycle and lets it run again.",
        mistakes=["Writing 'fumerase'. The enzyme is FUMARASE. The guide misprints it.",
                  "Saying step 8 reduces NAD+. Step 8 is the ONE step that reduces FAD, not NAD+.",
                  "Not saying that step 10 regenerates oxaloacetic acid. That is what makes it a cycle."],
        tip="Three steps reduce NAD, one reduces FAD, one makes ATP.",
        note="Two marks. Step 8 with FAD and step 10 closing the cycle are the two an examiner looks for."),
      S('s5_diagram','diagram','Diagram — the Krebs cycle',0,None,
        figure=figs_u5.KREBS,
        why="Drawn as a ring, the eight acids can be seen returning to the one they started from, and "
            "the per-turn tally written inside is the same tally the last written step is marked on.",
        mistakes=["Drawing acetyl CoA joining anything other than oxaloacetic acid. Step 1 is acetyl CoA "
                  "PLUS oxaloacetic acid.",
                  "Drawing three carbon dioxide molecules leaving the cycle. Only TWO leave the cycle; "
                  "the third came from the link reaction, outside it.",
                  "Drawing the ring anticlockwise. The order citric, isocitric, α-KG, succinyl CoA, "
                  "succinic, fumaric, malic, oxaloacetic runs CLOCKWISE here."],
        tip="Eight acids round, back to where it started: two CO2, three NADH, one FADH2, one ATP.",
        note="No diagram mark — the question says 'explain the reactions'. Drawing it is still the "
             "quickest way to check the tally in the final step."),
      S('s6_yield','boxed_final','The yield per turn',2,'Yield',
        lines=[{"text":"Per turn: 2 CO2, 3 NADH, 1 FADH2, 1 ATP","style":"boxed"},
               "Each turn of the cycle gives:",
               "2 molecules of CO2 (at steps 5 and 6)",
               "3 molecules of NADH + H+ (steps 4, 6 and 10)",
               "1 molecule of FADH2 (step 8)",
               "1 molecule of ATP (step 7)",
               "One glucose gives TWO acetyl CoA, so the cycle",
               "turns TWICE per glucose, and every figure above",
               "is doubled."],
        why="The reduced coenzymes are the real product: they carry their electrons to the electron "
            "transport chain, where most of the ATP is actually made.",
        mistakes=["Giving the yield per glucose as if it were per turn. The cycle turns TWICE per glucose.",
                  "Counting the link reaction's NADH as one of the three. The three come from steps 4, 6 and 10.",
                  "Saying the Krebs cycle makes most of the ATP directly. It makes only ONE ATP per turn; "
                  "the NADH and FADH2 do the rest, later."],
        tip="Two out as gas, four as reduced coenzymes, one as ATP.",
        note="Two marks. Give the per-turn figures, then double them for one glucose. Naming which step "
             "each product came from is what separates a full answer from a memorised list.")]))

C.append(Q(U, 'respiratory_quotient', 'SAQ', 'saq1', 167, 52,
    "Define RQ. Write a short note on RQ.",
    years=[('ts',2016)],
    split=[("Definition and formula",1),("What the value tells you",1),
           ("The worked example",1),("Why it never exceeds one for fats",1)],
    note_extra="BOOK ERROR, corrected on this card: under the correct formula (CO2 evolved over O2 "
               "consumed) the guide's own legend reads \"A - stands for volume of CO2 ABSORBED during "
               "respiration. B - stands for volume of O2 LIBERATED during respiration.\" Both are "
               "reversed, and they contradict the formula printed two lines above them. Respiration "
               "takes O2 IN and gives CO2 OUT.",
    insider="RQ is a ratio with a direction. Carbon dioxide is on top because it comes OUT; oxygen is "
            "underneath because it goes IN. Getting that the wrong way round inverts every value.",
    steps=[
      S('s1_define','equation','Definition and formula',1,'Definition',
        lines=[{"text": "The RESPIRATORY QUOTIENT (RQ) is the ratio", "style": "normal"},
               {"text": "of the volume of CO2 GIVEN OUT to the volume", "style": "normal"},
               {"text": "of O2 TAKEN IN, in a given time at standard", "style": "normal"},
               {"text": "temperature and pressure.", "style": "normal"},
               {"text":"RQ = volume of CO2 evolved","style":"eq"},
               {"text":"     ──────────────────","style":"eq"},
               {"text":"     volume of O2 consumed","style":"eq"}],
        why="Different foods need different amounts of oxygen for the carbon dioxide they release, so "
            "the ratio identifies which food is being respired.",
        mistakes=["Putting oxygen on top. CO2 given out is the NUMERATOR; O2 taken in is the denominator.",
                  "Writing 'CO2 absorbed' and 'O2 liberated'. Respiration takes oxygen IN and gives "
                  "carbon dioxide OUT. The guide's own legend reverses both."],
        tip="Out over in: carbon dioxide out on top, oxygen in underneath.",
        note="Definition then formula. The direction of each gas is the mark."),
      S('s2_values','text','What the value tells you',1,'The three cases',
        lines=["The value of RQ identifies the respiratory",
               "substrate:",
               "If RQ = 1, CARBOHYDRATES are being used.",
               "If RQ is LESS than 1, FATS are being used.",
               "If RQ is MORE than 1, ORGANIC ACIDS are being",
               "used."],
        why="A carbohydrate already carries as much oxygen as it needs, so it uses exactly as much oxygen "
            "as the carbon dioxide it gives out, and its RQ is exactly one.",
        mistakes=["Saying fats give an RQ above 1. Fats give LESS than 1 because they need extra oxygen.",
                  "Leaving out organic acids. All three cases are asked for."],
        tip="Carbohydrate exactly one, fat below one, organic acid above one.",
        note="Three cases, one line each. This mark is a list and should not be rushed."),
      S('s3_example','equation','The worked example',1,'Example',
        lines=["Example: TRIOLEIN, a fat.",
               {"text":"C57H104O6 + 80 O2 --> 57 CO2 + 52 H2O","style":"eq"},
               {"text":"RQ = 57 / 80 = 0.7","style":"eq"},
               "The value is less than 1, as expected for a",
               "fat."],
        why="The equation itself shows why: 80 oxygen molecules are needed to produce only 57 carbon "
            "dioxide molecules, so the ratio must fall below one.",
        mistakes=["Writing the ratio as 80/57. CO2 goes on TOP, so it is 57/80.",
                  "Giving the answer without the equation. The coefficients are where the ratio comes from."],
        tip="Fifty-seven out, eighty in: the fraction has to be less than one.",
        note="Equation, then the division, then the value. Three lines and the mark is safe."),
      S('s4_why','boxed_final','Why it never exceeds one for fats',1,'Reason',
        lines=[{"text":"A fat is poor in oxygen, so it needs more","style":"boxed"},
               "A fat molecule contains very little oxygen of",
               "its own.",
               "So more atmospheric oxygen must be taken in to",
               "oxidise it.",
               "The denominator is large, so RQ for fats is",
               "ALWAYS less than one."],
        why="The reason is in the molecule: the less oxygen a food already contains, the more must be "
            "supplied, and the smaller the ratio becomes.",
        mistakes=["Giving no reason. The last mark is for WHY, not for the value.",
                  "Saying fats release less carbon dioxide. They release plenty; they just need much "
                  "more oxygen to do it."],
        tip="Less oxygen in the food means more oxygen from the air, so a smaller ratio.",
        note="One reason in four lines. The oxygen content of the molecule is the whole explanation.")]))

main(C, U)
