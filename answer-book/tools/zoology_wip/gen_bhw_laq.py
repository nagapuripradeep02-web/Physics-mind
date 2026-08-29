# -*- coding: utf-8 -*-
"""Unit 6 (bhw) LAQ cards — book LAQ chapter 1 (qno 1-5). Figures injected later."""
from bhwlib import *

W = []

# ── LAQ 1 — Entamoeba histolytica ────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_laq_entamoeba_histolytica", "LAQ", "10", "LAQ 1",
    "Explain the structure and life cycle of Entamoeba histolytica with the help of neat labelled diagrams.",
    "ap:2015 ap:2018 ts:2019",
    [{"label": "Identity of the parasite", "marks": 1},
     {"label": "Diagram — the three stages", "marks": 2},
     {"label": "Trophozoite stage", "marks": 1},
     {"label": "Precystic and cystic stages", "marks": 1},
     {"label": "Life cycle diagram", "marks": 1},
     {"label": "Life cycle", "marks": 2}],
    [
        step("s1_identity", "text", "Identity of the parasite", 1, mark_note="Identity",
             lines=T("Entamoeba histolytica: Phylum Protozoa, Class "
                     "Rhizopodea.",
                     "It is a monogenetic histozoic parasite, so it "
                     "completes its life cycle in ONE host and lives in the "
                     "tissues of that host.",
                     "It lives in the large intestine of man and causes "
                     "amoebic dysentery.",
                     "Its structure passes through three stages: the "
                     "trophozoite stage, the precystic stage and the cystic "
                     "stage."),
             why="The opening fixes the parasite, the host and the count of stages, so the examiner knows the answer will describe three stages and not wander into another parasite.",
             cm=["Writing that Entamoeba has two hosts. It is monogenetic and needs only man.",
                 "Naming the small intestine. The parasite lives in the large intestine.",
                 "Skipping the three stage names, which are the plan of the whole structure section."],
             tip="One host, one gut, three stages: trophozoite, precystic, cystic.",
             margin="Four short lines. Name the phylum, the class, the host and the three stages."),
        step("s2_diagram_stages", "diagram", "Diagram — the three stages", 2, mark_note="Diagram",
             why="The three stages are told apart by their outline before anything else — irregular, oval, round — so drawing them side by side makes the sequence of the structure section visible at a glance.",
             cm=["Drawing the cyst as an oval. The cyst is ROUND; the precystic stage is the oval one.",
                 "Drawing fewer than four nuclei in the cyst. The mature cyst is tetranucleate.",
                 "Leaving the food vacuole with the red blood cell out of the trophozoite. It is a marked label."],
             tip="Irregular, oval, round: the outline alone tells you which stage you are drawing.",
             margin="Label the pseudopodium, ectoplasm, endoplasm, cart-wheel nucleus, food vacuoles, glycogen granules, chromatoid bars, cyst wall and the four nuclei."),
        step("s3_trophozoite", "text", "Trophozoite stage", 1, mark_note="Stage 1",
             lines=T("Trophozoite stage: it lives in the mucous and "
                     "submucous layers of the large intestine of man.",
                     "The body is bounded by a plasmalemma and puts out a "
                     "blunt pseudopodium for movement.",
                     "The cytoplasm is divided into an outer non-granular "
                     "ectoplasm and an inner granular endoplasm.",
                     "The endoplasm holds ribosomes, food vacuoles with "
                     "bacteria, food vacuoles with red blood cells, and a "
                     "cart-wheel shaped nucleus.",
                     "It secretes the tissue-digesting enzyme histolysin.",
                     "It is the most active, motile, feeding and "
                     "disease-causing stage."),
             why="This is the only stage that feeds and damages the host, so every feature named here is one the other two stages have lost — the pseudopodium, the food vacuoles and the enzyme.",
             cm=["Writing that the trophozoite is round. It is irregular and puts out a blunt pseudopodium.",
                 "Leaving out histolysin. It is the enzyme that makes the ulcers and it is a marked word.",
                 "Swapping ectoplasm and endoplasm. The outer layer is the non-granular ectoplasm."],
             tip="The trophozoite is the eating stage: pseudopodium to move, food vacuoles to feed, histolysin to dig in.",
             margin="Six short lines. The cart-wheel nucleus and histolysin must both appear."),
        step("s4_precystic_cystic", "text", "Precystic and cystic stages", 1, mark_note="Stages 2 and 3",
             lines=T("Precystic stage: it is found in the lumen of the "
                     "large intestine. It becomes small and oval.",
                     "Its cytoplasm holds glycogen granules and chromatoid "
                     "bars, which act as reserve food.",
                     "It is the non-feeding, non-motile and "
                     "non-pathogenic stage.",
                     "Cystic stage: it is round in shape and is found in "
                     "the lumen of the large intestine.",
                     "A thin, delicate and highly resistant cyst wall is "
                     "formed around it.",
                     "The nucleus divides twice by mitosis, so four nuclei "
                     "are formed. It is therefore called a tetranucleate "
                     "cyst, and it is the infective stage to man."),
             why="Both stages are resting stages that store food and stop feeding, so they are described together, and the difference between them is only the wall and the four nuclei.",
             cm=["Writing that the precystic stage causes the disease. It is non-pathogenic.",
                 "Giving two nuclei in the cyst. Two mitotic divisions give FOUR nuclei.",
                 "Calling the trophozoite the infective stage. The tetranucleate cyst is infective."],
             tip="Precystic packs the food, cystic builds the wall and makes four nuclei.",
             margin="Three lines for each stage. The words tetranucleate and infective stage carry the mark."),
        step("s5_diagram_cycle", "diagram", "Diagram — life cycle", 1, mark_note="Diagram",
             why="The cycle is a closed ring with one exit into the outside world and one entry back into a new host, and drawing it as a ring shows at once that the parasite returns to where it began.",
             cm=["Drawing the arrows the wrong way round. The ring runs trophozoite to cyst to new host to trophozoite.",
                 "Showing the cyst forming inside the intestinal wall. Encystation happens in the LUMEN.",
                 "Leaving the numbers off the stages. The numbered order is what makes the wheel readable."],
             tip="Draw the ring first, then place the stages on it in order and put the arrowheads on last.",
             margin="Eight numbered stages around the ring with the two halves marked: inside man, and outside in food and water."),
        step("s6_lifecycle", "boxed_final", "Life cycle", 2, mark_note="Life cycle",
             lines=B("Trophozoite - cyst - new host - trophozoite",
                     "1. The trophozoites in the large intestine feed on "
                     "bacteria and on host tissue, grow in size and "
                     "multiply by binary fission.",
                     "2. Some of them enter the lumen of the large "
                     "intestine and change into the precystic stage.",
                     "3. There the precystic stage develops into the cystic "
                     "stage, and each cyst becomes a tetranucleate cyst "
                     "within a few hours.",
                     "4. The tetranucleate cysts pass out with the faecal "
                     "matter. They remain alive for about 10 days.",
                     "5. The cysts reach a new host through contaminated "
                     "food and water.",
                     "6. In the small intestine of the new host the enzyme "
                     "trypsin ruptures the cyst wall and a tetranucleate "
                     "amoeba comes out. It is called the metacyst.",
                     "7. The four nuclei of the metacyst divide once more "
                     "by mitosis and produce eight daughter nuclei. Each "
                     "nucleus takes a little cytoplasm, so eight daughter "
                     "amoebae are formed.",
                     "8. They reach the wall of the large intestine and "
                     "become mature trophozoites, causing amoebic "
                     "dysentery.",
                     "Extra-intestinal amoebiasis: sometimes the "
                     "trophozoites reach the liver and form abscesses. From "
                     "there they may go to the lungs, heart, brain and "
                     "kidneys and cause severe conditions."),
             why="The cycle is a closed ring, so numbering the steps keeps the order fixed and makes it clear that the cyst is the form that leaves the body and the trophozoite is the form that returns.",
             cm=["Writing that the cyst breaks open in the large intestine. Trypsin opens it in the SMALL intestine.",
                 "Giving four daughter amoebae. Four nuclei divide once more, so EIGHT are produced.",
                 "Leaving out extra-intestinal amoebiasis, which is the last marked point of this answer."],
             tip="Four nuclei out of the body, eight amoebae into the new host: one more division on arrival.",
             margin="Eight numbered points, one or two lines each, then the extra-intestinal line. Two marks."),
    ],
    "The two numbers are what examiners check in this answer: FOUR nuclei in the cyst and EIGHT daughter amoebae from the metacyst.",
    "FIGURE SCOPE: the book prints three shaded stage drawings and an elaborate life-cycle plate with the human digestive tract drawn in the middle. This card draws the simplified exam figures — three stage outlines side by side, and a numbered ring of stages with no host organs drawn."))

# ── LAQ 2 — Plasmodium in man ────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_laq_plasmodium_in_man", "LAQ", "12", "LAQ 2",
    "Describe the life cycle of Plasmodium vivax in man.",
    "ap:2017 ts:2017",
    [{"label": "Identity and the two schizogonies", "marks": 1},
     {"label": "Pre-erythrocytic cycle", "marks": 1},
     {"label": "Exo-erythrocytic cycle", "marks": 1},
     {"label": "Diagram", "marks": 2},
     {"label": "Erythrocytic schizogony", "marks": 2},
     {"label": "Formation of gametocytes", "marks": 1}],
    [
        step("s1_identity", "text", "Identity and the two schizogonies", 1, mark_note="Identity",
             lines=T("Plasmodium vivax: Phylum Protozoa, Class Telosporea.",
                     "It is the malarial parasite of man.",
                     "It is a digenetic intracellular parasite, so it needs "
                     "two hosts. In man it lives inside the liver cells and "
                     "the red blood cells.",
                     "In man the parasite reproduces asexually by "
                     "schizogony. Schizogony in man is of two types: "
                     "hepatic schizogony in the liver cells and erythrocytic "
                     "schizogony in the red blood cells."),
             why="The whole answer is a two-part story, liver first and blood second, so naming the two schizogonies at the start gives the examiner the plan the rest of the answer follows.",
             cm=["Writing that Plasmodium is monogenetic. It is digenetic: man and the female Anopheles.",
                 "Calling the human phase sexual. The sexual phase takes place in the mosquito.",
                 "Naming only one kind of schizogony. Hepatic and erythrocytic are both asked."],
             tip="Two hosts, two schizogonies in man: liver first, then blood.",
             margin="Four short lines. The words digenetic, hepatic schizogony and erythrocytic schizogony carry the mark."),
        step("s2_pre_eryth", "text", "Pre-erythrocytic cycle", 1, mark_note="Liver 1",
             lines=T("Hepatic schizogony was discovered by Shortt and "
                     "Garnham. It has two cycles: pre-erythrocytic and "
                     "exo-erythrocytic.",
                     "Pre-erythrocytic cycle: when an infected female "
                     "Anopheles mosquito bites a healthy person, the "
                     "sporozoites enter the blood of man.",
                     "Within half an hour they reach the liver cells and "
                     "transform into trophozoites.",
                     "They become round, grow in size and are then called "
                     "schizonts.",
                     "The nucleus divides several times and the cytoplasm "
                     "then divides, producing 12,000 cryptozoites, which "
                     "are also called first generation merozoites.",
                     "They rupture the cell membrane of the schizont and "
                     "the liver cell, and enter the sinusoids of the liver. "
                     "This cycle takes 8 days."),
             why="The parasite must multiply before it can cause disease, and the liver is where the first multiplication happens quietly, which is why no symptoms appear during these 8 days.",
             cm=["Writing that the sporozoites enter the red blood cells first. They go to the liver cells first.",
                 "Giving the wrong count. One liver schizont gives 12,000 cryptozoites.",
                 "Writing that this cycle takes 48 hours. The pre-erythrocytic cycle takes 8 days."],
             tip="Sporozoite to liver cell, trophozoite to schizont, then 12,000 cryptozoites in 8 days.",
             margin="Six short lines following one chain. Give the number 12,000 and the 8 days."),
        step("s3_exo_eryth", "text", "Exo-erythrocytic cycle", 1, mark_note="Liver 2",
             lines=T("Exo-erythrocytic cycle: the cryptozoites that enter "
                     "fresh liver cells undergo schizogony again and "
                     "produce two kinds of metacryptozoites within two days.",
                     "Some are small and are called micro "
                     "metacryptozoites. They are the male forms and they "
                     "enter the red blood cells.",
                     "Others are large and are called macro "
                     "metacryptozoites. They are the female forms and they "
                     "continue hepatic schizogony.",
                     "Prepatent period: the interval between the first "
                     "entry of the parasite into the blood as sporozoites "
                     "and its second entry as cryptozoites is called the "
                     "prepatent period. It takes about 8 days and no "
                     "clinical symptoms are seen."),
             why="This second liver cycle is what keeps a reserve of parasites in the liver while the blood cycle begins, and it is where the prepatent period is defined.",
             cm=["Writing that all metacryptozoites enter the blood. Only the micro forms do.",
                 "Confusing the prepatent period with the incubation period. Prepatent is 8 days; incubation is 10 to 14 days.",
                 "Writing that symptoms appear in this period. No clinical symptoms are seen."],
             tip="Micro goes to the blood, macro stays in the liver: small out, large in.",
             margin="Four short blocks. Define the prepatent period here; it is a marked term."),
        step("s4_diagram", "diagram", "Diagram — the cycle in man", 2, mark_note="Diagram",
             why="The cycle in man is a ring with two loops on it, one in the liver and one in the blood, and the drawing has to show that the blood loop repeats while the liver loop happens once.",
             cm=["Drawing the signet ring stage as a plain circle. The vacuole must push the nucleus to one side.",
                 "Drawing the sporozoite as a round body. It is sickle shaped.",
                 "Putting the gametocytes inside the liver. They form inside the red blood cells."],
             tip="Draw the ring, then hang the stages on it in order and put the arrowheads on last.",
             margin="Label the sporozoite, liver cell, schizont, cryptozoites, signet ring stage, amoeboid stage, erythrocytic schizont, merozoites and the two gametocytes."),
        step("s5_erythrocytic", "text", "Erythrocytic schizogony", 2, mark_note="Blood cycle",
             lines=T("Erythrocytic schizogony is also called the Golgi "
                     "cycle. It was described by Golgi.",
                     "The cryptozoites or the micro metacryptozoites enter "
                     "fresh red blood cells and transform into "
                     "trophozoites.",
                     "A small vacuole appears in the trophozoite. It "
                     "enlarges and pushes the cytoplasm and the nucleus to "
                     "one side, so the parasite looks like a ring. This is "
                     "the signet ring stage.",
                     "The vacuole then disappears, pseudopodia develop and "
                     "the parasite changes to the amoeboid stage.",
                     "At this stage the red blood cell grows to almost "
                     "double its size. This condition is called "
                     "hypertrophy.",
                     "The parasite feeds on the globin part of haemoglobin "
                     "and grows. It converts the soluble haem into "
                     "insoluble haemozoin, which is called malaria pigment.",
                     "Small red dots appear in the cytoplasm of the red "
                     "blood cell. They are called Schuffner's dots.",
                     "The parasite becomes a round schizont. It undergoes "
                     "schizogony and produces 12 to 24 erythrocytic "
                     "merozoites.",
                     "The red blood cell finally bursts and releases the "
                     "merozoites and the haemozoin into the blood. The "
                     "release of haemozoin causes the chill and fever of "
                     "malaria.",
                     "The merozoites attack fresh red blood cells and the "
                     "cycle is repeated. One erythrocytic cycle takes 48 "
                     "hours.",
                     "Incubation period: the period between the entry of "
                     "the sporozoites into the blood and the first "
                     "appearance of the symptoms of malaria is called the "
                     "incubation period. It lasts 10 to 14 days."),
             why="This is the cycle a patient feels, so the answer follows one red blood cell from the moment the parasite enters it to the moment it bursts, and the fever is placed exactly where the bursting happens.",
             cm=["Writing that the parasite digests the haem. It digests the GLOBIN; the haem becomes haemozoin.",
                 "Giving the wrong merozoite count. One erythrocytic schizont gives 12 to 24 merozoites.",
                 "Writing that the fever comes from the merozoites. It comes from the released haemozoin."],
             tip="Ring, amoeba, schizont, burst: one red blood cell, four shapes, 48 hours.",
             margin="This is the longest part of the answer and carries two marks. Keep the named stages in order and give the three numbers."),
        step("s6_gametocytes", "boxed_final", "Formation of gametocytes", 1, mark_note="Gametocytes",
             lines=B("Gametocytes must reach the mosquito to develop",
                     "After several erythrocytic cycles some merozoites "
                     "enter red blood cells and transform into gametocytes "
                     "instead of continuing the cycle.",
                     "There are two kinds: the female (macro) gametocyte "
                     "and the male (micro) gametocyte.",
                     "The gametocytes do not develop any further in man. "
                     "They have to reach a female Anopheles mosquito.",
                     "They die if they do not reach a mosquito within a "
                     "week."),
             why="The human phase ends here on purpose: the gametocyte is the handover point between the two hosts, which is why the sexual phase can only begin inside the mosquito.",
             cm=["Writing that gametocytes fuse in man. They fuse only in the mosquito.",
                 "Writing that gametocytes are formed in the liver. They are formed in the red blood cells."],
             tip="The gametocyte is the ticket to the mosquito: no mosquito in a week and it dies.",
             margin="Four short lines closing the answer. Say plainly that they do not develop further in man."),
    ],
    "Four numbers decide this answer — 12,000 cryptozoites, 12 to 24 merozoites, 48 hours per cycle and 10 to 14 days of incubation.",
    "FIGURE SCOPE: the book prints a dense shaded plate of the whole human cycle. This card draws the simplified exam figure — a numbered ring of the named stages with no host organs drawn in the middle."))

# ── LAQ 3 — Plasmodium in mosquito ───────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_laq_plasmodium_in_mosquito", "LAQ", "14", "LAQ 3",
    "Describe the life cycle of Plasmodium vivax in mosquito.",
    "ap:2016 ts:2016 ts:2017 ts:2022 ap:2020",
    [{"label": "Entry into the mosquito", "marks": 1},
     {"label": "Gametogony", "marks": 2},
     {"label": "Fertilization", "marks": 1},
     {"label": "Diagram", "marks": 2},
     {"label": "Ookinete and oocyst", "marks": 1},
     {"label": "Sporogony", "marks": 1}],
    [
        step("s1_entry", "text", "Entry into the mosquito", 1, mark_note="Entry",
             lines=T("The gametocytes of Plasmodium are formed in man, and "
                     "their further development takes place in the female "
                     "Anopheles mosquito. This phase is called the Ross "
                     "cycle.",
                     "When a female Anopheles mosquito bites a malaria "
                     "patient and sucks the blood, the gametocytes reach "
                     "the crop of the mosquito along with the other stages "
                     "of the erythrocytic cycle.",
                     "All the other stages are digested there. Only the "
                     "gametocytes survive.",
                     "The cycle in the mosquito has four phases: "
                     "gametogony, fertilization, formation of the ookinete "
                     "and the oocyst, and sporogony."),
             why="Only one stage survives the mosquito's gut, so saying which stage that is explains why the sexual phase can begin nowhere else, and the four phase names give the plan of the answer.",
             cm=["Writing that a male Anopheles carries the parasite. Only the FEMALE mosquito sucks blood.",
                 "Writing that all stages develop in the mosquito. All are digested except the gametocytes.",
                 "Skipping the four phase names, which are the headings of the rest of the answer."],
             tip="Only the gametocyte survives the crop, so only the gametocyte can start the mosquito cycle.",
             margin="Four short lines ending with the four phase names. Then take each phase in turn."),
        step("s2_gametogony", "text", "Gametogony", 2, mark_note="Phase 1",
             lines=T("Gametogony is the formation of male and female "
                     "gametes from the gametocytes. It occurs in the lumen "
                     "of the crop of the mosquito.",
                     "Formation of male gametes: the nucleus of the "
                     "microgametocyte divides into eight daughter nuclei.",
                     "The eight daughter nuclei pass into eight "
                     "flagella-like structures and form the male gametes.",
                     "The flagella-like structures then begin lashing "
                     "movements and get separated from the flagellated "
                     "body. This process is called exflagellation.",
                     "Formation of the female gamete: the female gametocyte "
                     "undergoes a few changes and transforms into a female "
                     "gamete. This process is called maturation.",
                     "The nucleus moves towards the periphery and the "
                     "cytoplasm forms a projection called the fertilization "
                     "cone."),
             why="The two gametes are made in completely different ways — the male splits into eight, the female stays one and grows a cone — and that difference is what the two marks of this step are for.",
             cm=["Writing that the female gametocyte also divides into eight. Only the MALE does.",
                 "Calling the female projection a flagellum. It is the fertilization cone.",
                 "Writing that gametogony happens in the salivary glands. It happens in the crop."],
             tip="Male splits into eight and lashes; female stays one and grows a cone.",
             margin="Two named sub-headings, three lines each. Exflagellation and fertilization cone are both marked words."),
        step("s3_fertilization", "text", "Fertilization", 1, mark_note="Phase 2",
             lines=T("Fertilization is the fusion of the male gamete with "
                     "the female gamete.",
                     "One of the active male gametes comes in contact with "
                     "the fertilization cone of the female gamete and "
                     "enters into it.",
                     "The pronuclei and the cytoplasm of the two gametes "
                     "fuse with each other, and a zygote is formed.",
                     "The two gametes are dissimilar in size, so this "
                     "process is called anisogamy."),
             why="The cone is the doorway: the male gamete enters exactly there, and because the two gametes are unlike in size the fusion has its own name, anisogamy.",
             cm=["Writing that many male gametes enter. Only ONE enters the female gamete.",
                 "Calling the fusion isogamy. The gametes are unlike in size, so it is anisogamy."],
             tip="One male gamete, one cone, one zygote, and unequal sizes, so anisogamy.",
             margin="Four short lines. The word anisogamy is the closing mark of this step."),
        step("s4_diagram", "diagram", "Diagram — the cycle in the mosquito", 2, mark_note="Diagram",
             why="The stages in the mosquito change shape in a fixed order — round gametocyte, lashing male, elongated ookinete, round oocyst, sickle sporozoite — so the drawing is really a sequence of five outlines.",
             cm=["Drawing the ookinete as a round body. It is elongated and motile.",
                 "Drawing the oocyst inside the crop cavity. It settles BENEATH the basement membrane of the crop wall.",
                 "Drawing the sporozoites as round bodies. They are sickle or spindle shaped."],
             tip="Five outlines in order: round gametocyte, lashing male, long ookinete, round oocyst, sickle sporozoite.",
             margin="Label the male and female gametocytes, exflagellation, fertilization cone, zygote, ookinete, oocyst on the crop wall, sporozoites and the salivary glands."),
        step("s5_ookinete", "text", "Ookinete and oocyst", 1, mark_note="Phase 3",
             lines=T("The zygote elongates and becomes motile within 18 to "
                     "24 hours. It is then called the ookinete or vermicule.",
                     "The ookinete pierces the wall of the crop and settles "
                     "beneath the basement membrane.",
                     "There it becomes round and secretes a cyst around its "
                     "body.",
                     "This encysted ookinete is called the oocyst."),
             why="The parasite has to get out of the gut cavity before it can multiply, so this step is a move and a change of shape: it bores through the wall, then rounds up and encysts.",
             cm=["Writing that the zygote becomes the oocyst directly. The ookinete stage comes in between.",
                 "Writing that the oocyst lies inside the crop cavity. It lies beneath the basement membrane."],
             tip="Long and moving is the ookinete; round and walled is the oocyst.",
             margin="Four short lines. Give the 18 to 24 hours and the basement membrane."),
        step("s6_sporogony", "boxed_final", "Sporogony", 1, mark_note="Phase 4",
             lines=B("Sporocyst bursts, sporozoites to salivary glands",
                     "The oocyst enlarges in size and begins sporogony.",
                     "According to Bano, the nucleus of the oocyst first "
                     "undergoes reduction division.",
                     "The nucleus then divides repeatedly by mitosis and "
                     "produces a large number of nuclei.",
                     "Each nucleus is surrounded by a little bit of "
                     "cytoplasm and transforms into a sickle shaped "
                     "sporozoite. An oocyst holding about 10,000 "
                     "sporozoites is called a sporocyst.",
                     "The sporocyst bursts and liberates the spindle shaped "
                     "sporozoites.",
                     "From there they travel into the salivary glands and "
                     "become ready to infect a healthy person.",
                     "The life cycle in the mosquito is completed in about "
                     "10 to 24 days."),
             why="Sporogony is the multiplication step, and it ends in the salivary glands because that is the only place from which the parasite can be injected back into man.",
             cm=["Writing that the first division of the oocyst nucleus is mitotic. According to Bano it is a reduction division.",
                 "Writing that the sporozoites stay in the gut. They travel to the salivary glands.",
                 "Giving 10 to 24 hours instead of 10 to 24 days for the mosquito cycle."],
             tip="One oocyst, about 10,000 sporozoites, and all of them end in the salivary glands.",
             margin="Seven short lines ending at the salivary glands. Give the 10,000 and the 10 to 24 days."),
    ],
    "The examiner follows the four phase names, so write Gametogony, Fertilization, Ookinete and oocyst, and Sporogony as headings in the answer.",
    "FIGURE SCOPE: the book prints a shaded plate showing the whole gut of the mosquito with the stages arranged inside it. This card draws the simplified exam figure — a numbered ring of the named stages with a short section of the crop wall where the oocyst sits."))

# ── LAQ 4 — Ascaris lumbricoides ─────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_laq_ascaris_lumbricoides", "LAQ", "16", "LAQ 4",
    "Describe the structure and life cycle of Ascaris lumbricoides with the help of a neat labelled diagram.",
    "ts:2015 ap:2017 ap:2018 ts:2019 ap:2019",
    [{"label": "Identity of the parasite", "marks": 1},
     {"label": "General structure", "marks": 1},
     {"label": "Male and female", "marks": 1},
     {"label": "Diagram — male and female", "marks": 2},
     {"label": "Eggs and larvae in soil", "marks": 1},
     {"label": "Life cycle diagram", "marks": 1},
     {"label": "Migration inside man", "marks": 1}],
    [
        step("s1_identity", "text", "Identity of the parasite", 1, mark_note="Identity",
             lines=T("Ascaris lumbricoides: Phylum Nematoda, Class "
                     "Phasmidia.",
                     "It is commonly called the common round worm.",
                     "It reaches the intestine of children through "
                     "contaminated water and food and causes ascariasis.",
                     "It is a dimorphic, monogenetic, pseudocoelomate and "
                     "enterozoic parasite, so the two sexes look different, "
                     "it needs only ONE host, its body cavity is a "
                     "pseudocoelom and it lives in the intestine."),
             why="Four labels open the answer and each one is used later: dimorphic sets up the male and female comparison, monogenetic explains why there is no second host in the cycle.",
             cm=["Writing that Ascaris is digenetic. It is monogenetic and needs only man.",
                 "Naming the phylum Platyhelminthes. Ascaris belongs to Nematoda.",
                 "Writing that it lives in the liver. The adult lives in the small intestine."],
             tip="One host, one gut, two sexes that look different.",
             margin="Four short lines. Explain each label in the same line rather than listing bare words."),
        step("s2_structure", "text", "General structure", 1, mark_note="Structure",
             lines=T("The sexes are separate and the sexual dimorphism is "
                     "distinct.",
                     "In both the male and the female the body is elongated "
                     "and cylindrical, and it tapers at both ends.",
                     "In both forms the mouth is at the anterior end and is "
                     "surrounded by three chitinous lips: one dorsal lip "
                     "and two ventro-lateral lips.",
                     "The excretory pore is present ventrally, close to the "
                     "mouth."),
             why="These are the features the male and the female share, so writing them once keeps the next step free to describe only the differences.",
             cm=["Giving two lips. Ascaris has THREE chitinous lips around the mouth.",
                 "Placing the excretory pore at the posterior end. It is ventral and close to the mouth."],
             tip="Same in both sexes: cylindrical body, three lips, excretory pore near the mouth.",
             margin="Four short lines of shared features. Keep the differences for the next step."),
        step("s3_male_female", "text", "Male and female", 1, mark_note="Dimorphism",
             lines=T("Male: it is short, and its posterior end is CURVED.",
                     "A cloaca is present in the curved end and bears a "
                     "pair of equal sized copulatory spicules, also called "
                     "pineal spicules.",
                     "Female: the body is long, and its posterior end is "
                     "STRAIGHT.",
                     "The anus is present at the posterior end.",
                     "The female genital pore, or vulva, is present at "
                     "about one third of the body length from the anterior "
                     "end."),
             why="The two sexes are told apart by the tail before anything else, so the answer pairs the two ends directly — curved with spicules against straight with an anus.",
             cm=["Giving the male a straight tail. The MALE tail is curved; the female tail is straight.",
                 "Placing the female genital pore at the posterior end. It is one third of the way from the ANTERIOR end.",
                 "Writing that the spicules are of unequal size. In Ascaris they are equal."],
             tip="Curved and short is the male, straight and long is the female.",
             margin="Two named sub-headings. The curved tail and the one-third genital pore are the marked facts."),
        step("s4_diagram_structure", "diagram", "Diagram — male and female", 2, mark_note="Diagram",
             why="A single drawing of the two worms side by side makes the whole dimorphism section visible at once, because the curved and the straight tail sit next to each other.",
             cm=["Drawing both tails the same. The curl on the male tail is the point of the figure.",
                 "Leaving the female genital pore unmarked. Its position, one third from the anterior end, is a mark.",
                 "Labelling the male as the longer worm. The female is longer."],
             tip="Draw the two bodies first, then curl the male tail and keep the female tail straight.",
             margin="Label the mouth, excretory pore, female genital pore, pineal spicules, curved tail, cloacal aperture, straight tail and anus."),
        step("s5_eggs", "text", "Eggs and larvae in soil", 1, mark_note="Eggs",
             lines=T("After copulation in the small intestine the female "
                     "releases about 200,000 eggs every day.",
                     "Each egg is surrounded by a rippled protein coat, so "
                     "it is called a mammillated egg.",
                     "The eggs are passed out along with the faecal matter.",
                     "In moist soil the development takes place inside the "
                     "egg and the first stage rhabditiform larva is formed.",
                     "It undergoes the first moulting and the second stage "
                     "rhabditiform larva is formed. This second stage larva "
                     "is the infective stage to man.",
                     "These eggs reach a new host through contaminated food "
                     "and water."),
             why="The parasite has no second host, so the soil does the work instead: the egg has to develop outside the body before it can infect anyone, and that is why the second-stage larva is the infective form.",
             cm=["Writing that the egg is infective as soon as it is passed out. It must develop in moist soil first.",
                 "Calling the first stage larva infective. The SECOND stage rhabditiform larva is infective.",
                 "Writing that the larva hatches in the soil. It stays inside the egg until it is swallowed."],
             tip="Two larval stages in the soil, and the second one is the one that infects.",
             margin="Six short lines from egg to infective stage. Give the number 200,000."),
        step("s6_diagram_cycle", "diagram", "Diagram — life cycle", 1, mark_note="Diagram",
             why="The cycle has two halves, one outside the body in the soil and one inside man, and the drawing must show the loop crossing from one to the other twice.",
             cm=["Drawing only the human half. The soil half carries the two rhabditiform stages.",
                 "Reversing the migration route. The order is liver, heart, lungs, then back to the small intestine.",
                 "Leaving the arrowheads off. The direction is what makes a cycle diagram readable."],
             tip="Draw the ring first, mark the two halves, then place the stages and the arrowheads on last.",
             margin="Show the adult worms, the mammillated egg, the two rhabditiform stages, then liver, heart, lungs and the return to the small intestine."),
        step("s7_migration", "boxed_final", "Migration inside man", 1, mark_note="Migration",
             lines=B("Liver - heart - lungs - back to small intestine",
                     "In the small intestine the shell of the egg is "
                     "dissolved and the larva is released. Here the larva "
                     "undertakes an extra-intestinal migration.",
                     "It reaches the liver through the hepatic portal vein.",
                     "It then goes to the heart through the post caval vein.",
                     "It reaches the lungs through the pulmonary arteries.",
                     "The second moulting takes place in the alveoli of the "
                     "lungs and the third stage larva is formed. The third "
                     "moulting also takes place in the alveoli and the "
                     "fourth stage larva is formed.",
                     "The larva then reaches the small intestine through "
                     "the bronchi, trachea, larynx, glottis, pharynx, "
                     "oesophagus and stomach.",
                     "The fourth and final moulting takes place in the "
                     "small intestine and the larva becomes a young round "
                     "worm. It attains sexual maturity in 8 to 10 weeks.",
                     "Pathogenicity: Ascaris causes ascariasis. A heavy "
                     "infection causes nutritional deficiency, severe "
                     "abdominal pain and stunted growth in children."),
             why="The larva ends where it started, in the small intestine, but it can only mature after passing through the lungs, so the route is written as one unbroken chain of named vessels and organs.",
             cm=["Writing that the larva stays in the intestine. It makes a full migration through liver, heart and lungs.",
                 "Naming the wrong vessel. Liver by the hepatic portal vein, heart by the post caval vein, lungs by the pulmonary arteries.",
                 "Counting three moultings. Ascaris undergoes FOUR moultings in all."],
             tip="Up through the blood and down through the throat: liver, heart, lungs, then swallowed back to the gut.",
             margin="One chain of named vessels and organs, then the four moultings and the pathogenicity line."),
    ],
    "The migration route and the four moultings are what separate a full answer from a half one, so name every vessel and organ in order.",
    "FIGURE SCOPE: the book prints one shaded plate of the two worms and a second elaborate life-cycle plate with the organs of man drawn inside it. This card draws the simplified exam figures — the two worms side by side, and a numbered ring of stages with the soil half and the man half marked."))

# ── LAQ 5 — Wuchereria bancrofti ─────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_laq_wuchereria_bancrofti", "LAQ", "18", "LAQ 5",
    "Describe the life cycle of Wuchereria bancrofti with a neat diagram.",
    "ts:2018",
    [{"label": "Identity of the parasite", "marks": 1},
     {"label": "Structure", "marks": 1},
     {"label": "Life cycle in man", "marks": 2},
     {"label": "Diagram", "marks": 2},
     {"label": "Life cycle in the mosquito", "marks": 1},
     {"label": "Return to man and pathogenicity", "marks": 1}],
    [
        step("s1_identity", "text", "Identity of the parasite", 1, mark_note="Identity",
             lines=T("Wuchereria bancrofti: Phylum Nematoda, Class "
                     "Phasmidia.",
                     "It is commonly called the filaria worm.",
                     "It is a digenetic, dimorphic, histozoic and "
                     "pseudocoelomate parasite, so it needs TWO hosts, the "
                     "two sexes look different and it lives in the tissues.",
                     "It lives in the lymph vessels of man. Its secondary "
                     "host is the female Culex mosquito."),
             why="Two hosts and one tissue decide the whole answer: the worm lives in the lymph vessels of man and the larva must reach a Culex mosquito, so the cycle has two halves from the start.",
             cm=["Writing that the vector is Anopheles. The vector of Wuchereria is the female CULEX mosquito.",
                 "Writing that the adult lives in the blood. The adult lives in the LYMPH vessels.",
                 "Calling it monogenetic. It is digenetic: man and the mosquito."],
             tip="Lymph vessels of man, Culex mosquito outside: two hosts, two halves.",
             margin="Four short lines. Culex and the lymph vessels are both marked facts."),
        step("s2_structure", "text", "Structure", 1, mark_note="Structure",
             lines=T("The sexes are separate and the sexual dimorphism is "
                     "distinct.",
                     "The body is long and thread-like, that is filiform. "
                     "The anterior end is blunt and the posterior end is "
                     "pointed.",
                     "The mouth is at the anterior end and it has no lips.",
                     "Male: the posterior end is curved. It bears a cloaca "
                     "and a pair of UNEQUAL copulatory spicules.",
                     "Female: the anus is at the straight posterior end. "
                     "The female genital pore is at about one third of the "
                     "body length from the mouth, and the female is "
                     "ovoviviparous."),
             why="Wuchereria is compared with Ascaris in the exam, and the two differences that matter are the lips and the spicules: Wuchereria has no lips and unequal spicules.",
             cm=["Giving Wuchereria three lips. Ascaris has three lips; Wuchereria has NONE.",
                 "Writing that the spicules are equal. In Wuchereria they are UNEQUAL.",
                 "Writing that the female lays eggs. It is ovoviviparous, so it releases larvae."],
             tip="No lips, unequal spicules, and the young come out alive: that is Wuchereria, not Ascaris.",
             margin="Five short lines, with the male and female as named sub-headings."),
        step("s3_in_man", "text", "Life cycle in man", 2, mark_note="In man",
             lines=T("Wuchereria completes its life cycle in two hosts: man "
                     "and the female Culex mosquito.",
                     "In man: the male and female worms remain coiled "
                     "together in the lymph vessels.",
                     "After copulation the female releases sheathed "
                     "microfilaria larvae.",
                     "Each larva is surrounded by a loose cuticular sheath.",
                     "The larva lives in the deep blood vessels during the "
                     "day time and comes to the periphery during the night, "
                     "between 10 PM and 4 AM. This is called nocturnal "
                     "periodicity.",
                     "The Culex mosquito bites at night, so the larva is at "
                     "the surface at the time it can be taken up.",
                     "The larva can live for 70 days, and within that time "
                     "it has to enter a mosquito."),
             why="The larva can go no further inside man, so everything in this half of the cycle is about getting into a mosquito, and the night-time movement is what makes that possible.",
             cm=["Writing that the microfilaria develops further in man. It only develops inside the mosquito.",
                 "Giving the wrong hours. The larva comes to the periphery between 10 PM and 4 AM.",
                 "Writing 70 hours instead of 70 days for the life of the larva."],
             tip="Deep by day, surface by night, and 70 days to catch a mosquito.",
             margin="Seven short lines. Nocturnal periodicity and the 70 days are the two marked facts."),
        step("s4_diagram", "diagram", "Diagram — life cycle", 2, mark_note="Diagram",
             why="The cycle is a ring split into two labelled halves, in man and in the mosquito, and the two crossing points are the mosquito bite and the return bite.",
             cm=["Drawing the microfilaria without its sheath. The sheathed larva is what the mosquito takes up.",
                 "Placing the moultings in man. The first two moultings happen inside the MOSQUITO.",
                 "Leaving out the labium of the mosquito, which is where the infective larva waits."],
             tip="Draw the ring, split it into IN MAN and IN MOSQUITO, then place the stages and the arrowheads on last.",
             margin="Label the adult worms in the lymph vessels, the sheathed microfilaria, the midgut, the thoracic muscles, the three larval stages and the labium."),
        step("s5_in_mosquito", "text", "Life cycle in the mosquito", 1, mark_note="In mosquito",
             lines=T("When a female Culex mosquito bites an infected "
                     "person, the microfilariae enter the midgut of the "
                     "mosquito.",
                     "The sheath is dissolved in the midgut.",
                     "The larva penetrates the gut wall, reaches the "
                     "haemocoel and then the thoracic muscles.",
                     "In two days it becomes the first stage microfilaria.",
                     "It undergoes two moultings and becomes the long, "
                     "slender, infective third stage microfilaria.",
                     "The third stage larva then moves to the labium of the "
                     "mosquito."),
             why="The larva grows but does not multiply inside the mosquito, so this half of the cycle is a chain of moves and moultings that ends at the mouth parts, ready for the next bite.",
             cm=["Writing that the parasite multiplies in the mosquito. It only grows and moults.",
                 "Writing that the larva stays in the gut. It reaches the thoracic muscles through the haemocoel.",
                 "Calling the first stage infective. The THIRD stage larva is the infective one."],
             tip="Sheath off, wall through, muscles in, two moults, then out to the labium.",
             margin="Six short lines in one chain. The third stage larva and the labium close the step."),
        step("s6_back", "boxed_final", "Return to man and pathogenicity", 1, mark_note="Result",
             lines=B("Third stage larva returns and matures in man",
                     "When the infected mosquito bites a healthy person, "
                     "the third stage larva enters the blood circulation "
                     "and finally reaches the lymphatic vessels.",
                     "It undergoes the third and the fourth moultings and "
                     "becomes a young filarial worm.",
                     "It attains maturity in 5 to 6 months.",
                     "Pathogenicity: a light infection causes filarial "
                     "fever. A heavy infection causes inflammation of the "
                     "lymph vessels and the lymph glands. The final "
                     "condition is elephantiasis."),
             why="Four moultings are shared between the two hosts, two in the mosquito and two in man, so the cycle only closes when the last two happen back inside the lymph vessels.",
             cm=["Writing that all four moultings happen in the mosquito. The third and fourth happen in man.",
                 "Giving 5 to 6 weeks for maturity. It takes 5 to 6 months.",
                 "Leaving out elephantiasis, which is the marked end point of this answer."],
             tip="Two moults in the mosquito, two in man: four in all, and the worm matures in 5 to 6 months.",
             margin="Four short lines closing the ring, then the pathogenicity line. Elephantiasis must appear."),
    ],
    "This is the LAQ the printed hit list leaves out, so it is often unprepared — the four moultings split two and two between the hosts is the fact examiners look for.",
    "INVENTORY NOTE: the book's own 'TOP 10+ LAQ' hit list skips this question, but it is printed as a full 8-mark LAQ answer on book p.18 (global qno 5) and is asked in the book's Guess Paper 5. FIGURE SCOPE: the book prints an elaborate plate with the mosquito and the man drawn in; this card draws the simplified exam figure — a numbered ring of the named stages split into an IN MAN half and an IN MOSQUITO half."))

report(W)
