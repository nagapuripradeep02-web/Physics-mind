# -*- coding: utf-8 -*-
"""Unit 6 (bhw) VSAQ cards — book VSAQ chapter 17 (qno 131-147) + Star Q 176."""
from bhwlib import *

W = []

# ── 131 ──────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_parasitism_define", "VSAQ", "58", "VSAQ 131",
    "Define parasitism and justify this term.",
    "ap:2018",
    [{"label": "Definition", "marks": 1}, {"label": "Justification", "marks": 1}],
    [
        step("s1_define", "text", "Definition", 1, mark_note="Definition",
             lines=T("Parasitism is a close association between two "
                     "organisms of different species in which one, the "
                     "parasite, is benefited and the other, the host, is "
                     "harmed."),
             why="The definition has three parts — two different species, one benefited, one harmed — and a sentence that misses any one of them is not the definition the examiner is marking.",
             cm=["Writing only that one organism is benefited. The harm to the host is half the definition.",
                 "Calling it an association between two organisms of the SAME species."],
             tip="Two species, one gains, one is harmed. Miss the harm and it becomes commensalism.",
             margin="One full sentence carrying all three parts. Do not start the example before the definition is complete."),
        step("s2_justify", "boxed_final", "Justification", 1, mark_note="Example",
             lines=B("Plasmodium in man: parasite gains, host is harmed",
                     "Plasmodium vivax lives inside the liver cells and the "
                     "red blood cells of man.",
                     "It takes its food from the host and causes malaria.",
                     "The parasite is benefited and the host is harmed, so "
                     "the association is parasitism."),
             why="A justification is not a second definition: it names one real pair and shows that in that pair one side gains and the other side is damaged.",
             cm=["Naming the example but not saying who gains and who is harmed. The justification is the second half.",
                 "Writing 'Plasmodium' alone. Name the host as well."],
             tip="Name the pair, then say who gains and who is harmed in that same pair.",
             margin="One named pair and two short lines of justification. Three lines are enough for the second mark."),
    ],
    "The word 'justify' is the mark: a correct definition with no worked example scores only half."))

# ── 132 ──────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_hyper_parasite", "VSAQ", "58", "VSAQ 132",
    "What is a hyper-parasite? Mention the name of one hyper-parasite.",
    "ts:2022",
    [{"label": "Definition", "marks": 1}, {"label": "Example", "marks": 1}],
    [
        step("s1_define", "text", "Definition", 1, mark_note="Definition",
             lines=T("A parasite that lives on or inside the body of "
                     "another parasite is called a hyper-parasite."),
             why="The word 'hyper' here means one level higher, so the host of a hyper-parasite is itself a parasite — that second level is the whole idea being tested.",
             cm=["Writing that a hyper-parasite is a very harmful parasite. 'Hyper' names the level, not the strength.",
                 "Saying it lives on a host. Its host is another PARASITE."],
             tip="Parasite on a parasite: the host of the hyper-parasite is itself living on someone else.",
             margin="One line. The whole mark is in the words 'on another parasite'."),
        step("s2_example", "boxed_final", "Example", 1, mark_note="Example",
             lines=B("Nosema notabilis on Sphaerospora polymorpha",
                     "Nosema notabilis is a hyper-parasite.",
                     "It lives on Sphaerospora polymorpha, which is itself a "
                     "parasite in the urinary bladder of the toad fish."),
             why="The example only proves the point if the chain of three is written out — hyper-parasite, its parasite host, and the animal that parasite lives in.",
             cm=["Naming only Nosema notabilis. The parasite it lives on must be named too.",
                 "Writing the two names the other way round."],
             tip="Three names in a chain: Nosema on Sphaerospora, Sphaerospora in the toad fish.",
             margin="Both names, in order, and the animal at the end of the chain. Two lines."),
    ],
    "Only the paired names earn the second mark — an unnamed 'parasite on a parasite' example scores nothing."))

# ── 133 ──────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_parasitic_castration", "VSAQ", "58", "VSAQ 133",
    "What do you mean by parasitic castration? Give one example.",
    "ap:2020 ts:2020 ts:2019",
    [{"label": "Definition", "marks": 1}, {"label": "Example", "marks": 1}],
    [
        step("s1_define", "text", "Definition", 1, mark_note="Definition",
             lines=T("Degeneration of the gonads of the host caused by the "
                     "presence of a parasite is called parasitic castration.",
                     "The host can no longer breed."),
             why="The definition names the organ that is damaged, the gonad, and the cause, the parasite — and the loss of breeding is what makes it 'castration'.",
             cm=["Writing that the parasite eats the host. The damage is to the gonads only.",
                 "Leaving out the word gonads and writing 'reproductive organs are affected'. Use the syllabus word."],
             tip="Castration means the gonad stops working; here a parasite, not surgery, causes it.",
             margin="One sentence naming the gonads and the parasite. A second short line on breeding is enough."),
        step("s2_example", "boxed_final", "Example", 1, mark_note="Example",
             lines=B("Sacculina causes ovary degeneration in crabs",
                     "Sacculina is a crustacean parasite of crabs.",
                     "Its presence causes the ovaries of the crab to "
                     "degenerate, so the crab cannot breed."),
             why="The example is marked as a pair — the parasite and the host it castrates — because either name alone does not show the effect.",
             cm=["Naming Sacculina without naming the crab.",
                 "Writing that Sacculina kills the crab. The crab lives on; only the gonads degenerate."],
             tip="Sacculina and crab: the parasite stays, the crab's ovaries go.",
             margin="Name both, then one line on what degenerates. Two lines."),
    ],
    "Both marks are name-bound: the definition must contain the word gonads and the example must contain both Sacculina and crab."))

# ── 134 ──────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_neoplasia", "VSAQ", "58", "VSAQ 134",
    "Define neoplasia. Give one example.",
    "ts:2022 ap:2019 ap:2022",
    [{"label": "Definition", "marks": 1}, {"label": "Example", "marks": 1}],
    [
        step("s1_define", "text", "Definition", 1, mark_note="Definition",
             lines=T("Neoplasia is the abnormal and uncontrolled growth of "
                     "host cells caused by the presence of a parasite.",
                     "The new mass of cells is called a neoplasm or tumour, "
                     "and it may become cancer."),
             why="Neoplasia is new growth, not swelling of one cell: the host cells keep dividing without control, which is why the end point is a tumour and not a bigger cell.",
             cm=["Writing that the SIZE of the host cell increases. That is hypertrophy, not neoplasia.",
                 "Writing that the number of cells increases without saying the growth is uncontrolled. Controlled increase in number is hyperplasia."],
             tip="Neo means new: neoplasia is new uncontrolled growth, hypertrophy is a bigger cell, hyperplasia is more cells.",
             margin="One sentence for the definition and one for the tumour. Keep it apart from hypertrophy in your own words."),
        step("s2_example", "boxed_final", "Example", 1, mark_note="Example",
             lines=B("Carcinoma caused by a virus",
                     "A virus in the host cells can cause carcinoma, a "
                     "cancer of the covering tissue."),
             why="One named growth is enough, and naming the causative agent shows the growth was caused by a parasite rather than arising on its own.",
             cm=["Writing 'cancer' alone with no named example or agent."],
             tip="Carcinoma from a virus: the parasite is the virus, the new growth is the carcinoma.",
             margin="One named example with its cause. One line."),
    ],
    "The examiner is separating three look-alike terms in this chapter, so the answer must say uncontrolled NEW growth, not 'increase in size'.",
    "BOOK ERROR: the book defines neoplasia as 'abnormal increase in size of the cell of the host due to presence of parasite', which is its own definition of HYPERTROPHY on p.44 (SAQ 46). Standard zoology defines neoplasia as new, abnormal and uncontrolled growth of host cells forming a neoplasm (tumour); this card is written correctly and the book's wording is recorded in the step's why field."))

# ── 135 ──────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_amoebic_dysentery_symptoms", "VSAQ", "58", "VSAQ 135",
    "A person is suffering from bowel irregularity, abdominal pain, blood and mucus in stool, etc. Based on these symptoms, name the disease and its causative organism.",
    "ts:2015",
    [{"label": "Disease", "marks": 1}, {"label": "Causative organism", "marks": 1}],
    [
        step("s1_disease", "text", "Disease", 1, mark_note="Disease",
             lines=T("The symptoms given are those of amoebic dysentery, "
                     "also called intestinal amoebiasis."),
             why="Blood and mucus together in the stool point to ulcers in the wall of the large intestine, and that is what separates amoebic dysentery from ordinary loose motions.",
             cm=["Answering 'diarrhoea'. Blood and mucus in the stool make it dysentery.",
                 "Answering malaria or ascariasis. Those do not give blood and mucus in the stool."],
             tip="Blood and mucus in the stool means ulcers in the large intestine, and that means amoebic dysentery.",
             margin="One line. Give both names of the disease if you can."),
        step("s2_organism", "boxed_final", "Causative organism", 1, mark_note="Organism",
             lines=B("Entamoeba histolytica",
                     "The disease is caused by Entamoeba histolytica, which "
                     "lives in the large intestine of man.",
                     "Its trophozoites make ulcers in the intestinal wall, "
                     "and the ulcers ooze blood and mucus."),
             why="Naming the organism is only half the mark here; the link between its trophozoites and the ulcers is what explains the symptoms in the question.",
             cm=["Writing only 'Entamoeba'. Give the full name, Entamoeba histolytica.",
                 "Writing Entamoeba coli, which is a harmless species."],
             tip="Histolytica means tissue-dissolving, and that is exactly what makes the ulcers.",
             margin="Full binomial name first, then one line linking it to the symptoms."),
    ],
    "This is a symptom-to-name question, so both the disease name and the full binomial of the organism must appear; a half name loses the mark."))

# ── 136 ──────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_prepatent_period", "VSAQ", "58", "VSAQ 136",
    "Define prepatent period. What is its duration in the life cycle of Plasmodium vivax?",
    "",
    [{"label": "Definition", "marks": 1}, {"label": "Duration", "marks": 1}],
    [
        step("s1_define", "text", "Definition", 1, mark_note="Definition",
             lines=T("The interval between the first entry of Plasmodium "
                     "into the blood of man as sporozoites and its second "
                     "entry into the blood as cryptozoites is called the "
                     "prepatent period."),
             why="The period is defined by two entries into the BLOOD, and the gap between them is the time the parasite spends inside the liver cells where no test can find it.",
             cm=["Defining it as the time before the symptoms appear. That is the incubation period.",
                 "Writing only 'the time the parasite spends in the liver' without naming sporozoites and cryptozoites."],
             tip="Prepatent counts blood to blood: sporozoite in, cryptozoite back out.",
             margin="One sentence naming both stages. The two stage names carry the mark."),
        step("s2_duration", "boxed_final", "Duration", 1, mark_note="Duration",
             lines=B("Prepatent period = about 8 days",
                     "During this period no symptoms of malaria are seen."),
             why="The number is asked directly, and the extra line that no symptoms appear is what tells the examiner the student has not confused it with the incubation period.",
             cm=["Writing 10 to 14 days. That is the incubation period.",
                 "Writing that the whole life cycle takes 8 days. Only the prepatent period does."],
             tip="Prepatent 8 days, incubation 10 to 14 days. Prepatent is the shorter one.",
             margin="The number in a box and one line on symptoms. Two lines."),
    ],
    "Prepatent and incubation are asked as a pair in this chapter, so state the 8 days and add the no-symptoms line to keep them apart.",
    "BOOK ERROR: the book's second line reads 'The duration of life cycle of plasmodium vivax is nearly 8 days', which states the wrong quantity — 8 days is the duration of the PREPATENT PERIOD, not of the whole life cycle. This card gives the 8 days to the prepatent period."))

# ── 137 ──────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_incubation_period", "VSAQ", "58", "VSAQ 137",
    "Define incubation period. What is its duration in the life cycle of Plasmodium vivax?",
    "ap:2018",
    [{"label": "Definition", "marks": 1}, {"label": "Duration", "marks": 1}],
    [
        step("s1_define", "text", "Definition", 1, mark_note="Definition",
             lines=T("The period between the entry of the sporozoites into "
                     "the blood of man and the appearance of the first "
                     "symptoms of malaria is called the incubation period."),
             why="This period is measured from entry to SYMPTOMS, so it ends only when enough red blood cells burst together to give the first chill and fever.",
             cm=["Defining it as the gap between two entries into the blood. That is the prepatent period.",
                 "Starting the count from the mosquito bite in general. Start it from the entry of the sporozoites."],
             tip="Incubation ends with the first fever; prepatent ends with the parasite back in the blood.",
             margin="One sentence, ending at the word symptoms. That word carries the mark."),
        step("s2_duration", "boxed_final", "Duration", 1, mark_note="Duration",
             lines=B("Incubation period = about 10 to 14 days",
                     "The first chill and fever of malaria appear at the "
                     "end of this period."),
             why="The number is asked directly, and it is always longer than the prepatent period because symptoms need several erythrocytic cycles to build up.",
             cm=["Writing 8 days. That is the prepatent period.",
                 "Writing 48 hours. That is the length of one erythrocytic cycle."],
             tip="Three numbers, three meanings: 48 hours one cycle, 8 days prepatent, 10 to 14 days incubation.",
             margin="The number in a box and one line on the first fever. Two lines."),
    ],
    "Examiners set prepatent and incubation next to each other, so name the endpoint (symptoms) as well as the number."))

# ── 138 ──────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_mammillated_egg", "VSAQ", "58", "VSAQ 138",
    "The eggs of Ascaris are called 'mammillated eggs'. Justify.",
    "ap:2019 ts:2018 ts:2019",
    [{"label": "The egg coat", "marks": 1}, {"label": "Justification", "marks": 1}],
    [
        step("s1_coat", "text", "The egg coat", 1, mark_note="Coat",
             lines=T("The egg of Ascaris lumbricoides is covered on the "
                     "outside by a protein coat.",
                     "This coat carries small rounded bumps called "
                     "papillae, so the surface of the egg looks rippled."),
             why="The name comes from the outermost layer alone, so the answer has to reach that layer and describe what its surface looks like.",
             cm=["Describing the shell as smooth. The outer protein coat is bumpy.",
                 "Writing that the bumps are inside the egg. They are on the outer coat."],
             tip="Mammillated means covered with small rounded bumps, and that is the outer protein coat.",
             margin="Two lines: the coat, then the bumps on it."),
        step("s2_justify", "boxed_final", "Justification", 1, mark_note="Justification",
             lines=B("Bumpy protein coat, so the egg is mammillated",
                     "Because the outer coat is covered with these rounded "
                     "bumps, the egg is called a mammillated egg."),
             why="A 'justify' question is answered by joining the observed feature to the name, so the last sentence must contain both the bumps and the word mammillated.",
             cm=["Repeating the definition without ever using the word mammillated.",
                 "Writing that the egg is mammillated because it is fertilised. The two are unrelated."],
             tip="Say the feature, then say the name it earns: bumps, so mammillated.",
             margin="One closing sentence joining the bumps to the name."),
    ],
    "A justify question is scored on the join: the rippled protein coat and the word mammillated must appear in the same sentence."))

# ── 139 ──────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_nocturnal_periodicity", "VSAQ", "59", "VSAQ 139",
    "What is meant by nocturnal periodicity with reference to the life history of a nematode parasite you have studied?",
    "ts:2017 ap:2015",
    [{"label": "The movement", "marks": 1}, {"label": "The term", "marks": 1}],
    [
        step("s1_movement", "text", "The movement", 1, mark_note="Movement",
             lines=T("The sheathed microfilaria larva of Wuchereria "
                     "bancrofti stays in the deep blood vessels of man "
                     "during the day.",
                     "At night, between 10 PM and 4 AM, it moves to the "
                     "peripheral blood vessels near the skin."),
             why="Both halves of the day must be described, because the point of the term is the regular change of position between day and night, not the night position alone.",
             cm=["Naming the wrong parasite. The nematode meant here is Wuchereria bancrofti.",
                 "Writing only where the larva is at night. The day position is half the answer."],
             tip="Deep by day, near the skin by night, between 10 PM and 4 AM.",
             margin="Two lines: day position, then night position with the timing."),
        step("s2_term", "boxed_final", "The term", 1, mark_note="Term",
             lines=B("Regular night movement to surface vessels",
                     "This regular movement of the microfilaria larva to "
                     "the surface blood vessels at night is called "
                     "nocturnal periodicity.",
                     "The Culex mosquito bites at night, so the larva is in "
                     "the surface vessels at the time it can be picked up."),
             why="The word periodicity means the movement repeats on a fixed timetable, and the last line links that timetable to the biting time of the vector, which is what the examiner looks for.",
             cm=["Writing that the larva hides during the day. Describe the position, not a purpose.",
                 "Leaving out the vector. The night biting of Culex is what makes the timing matter."],
             tip="Night biter, night larva: Culex bites at night and the larva is at the surface then.",
             margin="Name the term, then one line linking it to the night-biting Culex."),
    ],
    "Naming Wuchereria bancrofti is part of the mark, because the question says 'a nematode parasite you have studied' and expects that name."))

# ── 140 ──────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_lymphadenitis_lymphangitis", "VSAQ", "59", "VSAQ 140",
    "Distinguish between lymphadenitis and lymphangitis.",
    "",
    [{"label": "Lymphangitis", "marks": 1}, {"label": "Lymphadenitis", "marks": 1}],
    [
        step("s1_angitis", "text", "Lymphangitis", 1, mark_note="Vessels",
             lines=T("Lymphangitis is the inflammation of the lymph "
                     "VESSELS.",
                     "In filariasis the worms and their dead bodies block "
                     "the lymph vessels and the vessels become inflamed."),
             why="The two words differ only in their middle part, so the answer must state which structure each one names before anything else is written.",
             cm=["Swapping the two. Angi- refers to the vessels.",
                 "Writing that lymphangitis is a swelling of the leg. That is elephantiasis, the end result."],
             tip="Angi- means vessel, as in angiogram: lymphangitis is the vessels.",
             margin="One line naming the structure, one line on the cause. Do not write a paragraph."),
        step("s2_adenitis", "boxed_final", "Lymphadenitis", 1, mark_note="Glands",
             lines=B("Angi- = vessels, aden- = glands",
                     "Lymphadenitis is the inflammation of the lymph GLANDS "
                     "(lymph nodes).",
                     "Both conditions are seen in a heavy infection of "
                     "Wuchereria bancrofti."),
             why="Aden- means gland in every medical word a student meets, so tying the answer to that root is what stops the pair being mixed up in the exam.",
             cm=["Writing that lymphadenitis affects the vessels.",
                 "Leaving out the parasite. Both conditions are asked here as effects of Wuchereria."],
             tip="Aden- means gland, as in adenoid: lymphadenitis is the glands.",
             margin="One line naming the structure, then one line naming the parasite that causes both."),
    ],
    "This pair is marked strictly on which structure each word names, so write VESSELS and GLANDS plainly before anything else."))

# ── 141 ──────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_tobacco_respiration", "VSAQ", "59", "VSAQ 141",
    "In which way does tobacco affect the respiration? Name the alkaloid found in tobacco.",
    "ap:2017",
    [{"label": "Effect on respiration", "marks": 1}, {"label": "The alkaloid", "marks": 1}],
    [
        step("s1_effect", "text", "Effect on respiration", 1, mark_note="Effect",
             lines=T("When tobacco is smoked, the carbon monoxide level in "
                     "the blood rises and the oxygen level falls.",
                     "Carbon monoxide binds to haemoglobin, so less oxygen "
                     "is carried to the tissues."),
             why="The effect is on the blood's carrying capacity, not on the lungs alone, so the answer names the gas that rises and the gas that falls.",
             cm=["Writing only that smoking is harmful to the lungs. Name carbon monoxide and oxygen.",
                 "Writing that nicotine reduces oxygen. It is carbon monoxide that does this."],
             tip="Carbon monoxide up, oxygen down: the blood carries the wrong gas.",
             margin="Two short lines naming both gases. That is the whole first mark."),
        step("s2_alkaloid", "boxed_final", "The alkaloid", 1, mark_note="Alkaloid",
             lines=B("Nicotine",
                     "The alkaloid found in tobacco is nicotine.",
                     "It stimulates the adrenal gland to release adrenaline "
                     "and noradrenaline, which raise the blood pressure and "
                     "the heart rate."),
             why="Nicotine is the one name the question asks for, and the extra line shows the student knows it acts on the adrenal gland rather than on the lungs.",
             cm=["Naming tar or carbon monoxide. Neither is an alkaloid.",
                 "Writing that nicotine is a gas. It is an alkaloid."],
             tip="One alkaloid, one name: nicotine, and it works through the adrenal gland.",
             margin="The name alone earns the mark. One extra line on its action is enough."),
    ],
    "This is a two-part question and each part carries its own mark, so answer the respiration part in full before naming nicotine."))

# ── 142 ──────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_drug_abuse_define", "VSAQ", "59", "VSAQ 142",
    "Define drug abuse.",
    "ap:2022",
    [{"label": "Definition", "marks": 1}, {"label": "Result", "marks": 1}],
    [
        step("s1_define", "text", "Definition", 1, mark_note="Definition",
             lines=T("Taking a drug in excess, or taking it for a purpose "
                     "other than its medicinal use, is called drug abuse."),
             why="The definition has two separate arms, too much of a medicine and the wrong purpose for a medicine, and a student who writes only one of them has written half the definition.",
             cm=["Writing that any use of a drug is drug abuse. Medicinal use in the correct dose is not abuse.",
                 "Confusing it with addiction. Abuse is the act of taking; addiction is the attachment to the effect."],
             tip="Two arms: wrong amount, or right amount for the wrong reason.",
             margin="One sentence carrying both arms. Do not stop after 'in excess'."),
        step("s2_result", "boxed_final", "Result", 1, mark_note="Result",
             lines=B("Physical and psychological damage",
                     "Drug abuse leads to physical and psychological "
                     "disturbance.",
                     "Sometimes it causes damage to the body that cannot be "
                     "repaired."),
             why="The second mark is for what abuse does, and naming both the body and the mind keeps the answer from repeating the definition in other words.",
             cm=["Repeating the definition instead of stating the result.",
                 "Writing only 'it is bad for health'. Name the physical and the psychological damage."],
             tip="Damage on two sides: the body and the mind.",
             margin="Two short lines. Name both kinds of damage."),
    ],
    "A two-mark definition question expects a definition AND its consequence; a one-line definition alone caps the answer at one mark."))

# ── 143 ──────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_smack_and_coke", "VSAQ", "59", "VSAQ 143",
    "From which substances 'Smack' and 'Coke' are obtained?",
    "ap:2016",
    [{"label": "Smack", "marks": 1}, {"label": "Coke", "marks": 1}],
    [
        step("s1_smack", "text", "Smack", 1, mark_note="Smack",
             lines=T("Smack is another name for heroin.",
                     "It is obtained by the acetylation of morphine, and "
                     "morphine comes from the poppy plant Papaver "
                     "somniferum."),
             why="The question asks what each street name is made FROM, so the answer traces smack back one step to morphine and one more step to the plant.",
             cm=["Writing that smack is obtained from the poppy plant directly. It is made from morphine by acetylation.",
                 "Writing that smack is cocaine."],
             tip="Smack is heroin, and heroin is morphine with acetyl added.",
             margin="Two lines: the other name, then the substance it is made from."),
        step("s2_coke", "boxed_final", "Coke", 1, mark_note="Coke",
             lines=B("Smack from morphine, coke from cocaine",
                     "Coke, also called crack, is obtained from cocaine.",
                     "Cocaine is obtained from the coca plant, "
                     "Erythroxylum coca."),
             why="Coke is one step from cocaine and cocaine one step from its plant, which is the same two-step shape as the smack answer and is easy to remember as a pair.",
             cm=["Writing that coke comes from the poppy plant. That is the source of morphine.",
                 "Writing that cocaine and cannabis are the same. They come from different plants."],
             tip="Two names, two plants: smack from poppy through morphine, coke from coca through cocaine.",
             margin="Two lines. Name the plant if you can; the substance alone earns the mark."),
    ],
    "Both street names carry a mark each, so answer them separately and do not merge them into one sentence.",
    "ADDED BEYOND THE BOOK: the book prints only 'Coke (Crack) is obtained from Cocaine'; the source plant of cocaine (Erythroxylum coca) and the source plant of morphine (Papaver somniferum) are standard NCERT and are added here."))

# ── 144 ──────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_entamoeba_anaerobe", "VSAQ", "59", "VSAQ 144",
    "'Entamoeba histolytica is an obligatory anaerobe'. Justify.",
    "",
    [{"label": "Where it lives", "marks": 1}, {"label": "Justification", "marks": 1}],
    [
        step("s1_where", "text", "Where it lives", 1, mark_note="Habitat",
             lines=T("Entamoeba histolytica lives in the large intestine of "
                     "man.",
                     "Free oxygen is not available there, and the parasite "
                     "has no mitochondria in its body."),
             why="Two facts have to sit side by side — no oxygen outside the parasite and no mitochondria inside it — because together they leave the parasite no way to use oxygen at all.",
             cm=["Writing that it lives in the small intestine. It lives in the large intestine.",
                 "Leaving out the mitochondria. The absence of mitochondria is half the reason."],
             tip="No oxygen around it and no mitochondria in it: both halves are needed.",
             margin="Two lines. Name the habitat and the missing organelle."),
        step("s2_justify", "boxed_final", "Justification", 1, mark_note="Justification",
             lines=B("No oxygen, no mitochondria, so anaerobic only",
                     "It gets its energy without using oxygen.",
                     "It can live only in the absence of oxygen, so it is "
                     "called an obligatory anaerobe."),
             why="'Obligatory' means there is no alternative, so the closing sentence must say the parasite can live ONLY without oxygen, not merely that it does live without oxygen.",
             cm=["Writing that it can live with or without oxygen. That would be a facultative anaerobe.",
                 "Ending without using the words obligatory anaerobe."],
             tip="Obligatory means no choice: it cannot use oxygen at all.",
             margin="Two short lines ending in the term the question quotes."),
    ],
    "The word 'obligatory' is what is being tested — say the parasite can live ONLY without oxygen, not just that it does."))

# ── 145 ──────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_haemozoin_granules", "VSAQ", "59", "VSAQ 145",
    "What are haemozoin granules? What is their significance?",
    "",
    [{"label": "What they are", "marks": 1}, {"label": "Significance", "marks": 1}],
    [
        step("s1_what", "text", "What they are", 1, mark_note="Identity",
             lines=T("Inside the red blood cell the malarial parasite "
                     "digests the globin part of haemoglobin.",
                     "It converts the soluble haem that is left into "
                     "insoluble crystalline granules called haemozoin, also "
                     "called malarial pigment."),
             why="Haemozoin is the leftover of a meal: the parasite uses the globin as food and cannot use the haem, so the haem is stacked away as an insoluble crystal.",
             cm=["Writing that the parasite digests the haem. It digests the globin; the haem is left over.",
                 "Writing that haemozoin is soluble. It is an insoluble crystalline granule."],
             tip="Globin is the food, haem is the leftover, and the leftover is haemozoin.",
             margin="Two lines: what is digested, then what is left as granules."),
        step("s2_significance", "boxed_final", "Significance", 1, mark_note="Significance",
             lines=B("Haemozoin release causes the chill and fever",
                     "When the red blood cell bursts, the haemozoin is "
                     "released into the blood along with the merozoites.",
                     "The released haemozoin causes the chill and fever of "
                     "malaria, which return every 48 hours in Plasmodium "
                     "vivax."),
             why="The significance is the symptom: the fever appears when the cells burst together, which is why the fever of Plasmodium vivax comes back on a fixed 48-hour timetable.",
             cm=["Writing that haemozoin gives the parasite energy. It is a waste product.",
                 "Leaving out the fever. The link to the fever is the whole significance."],
             tip="Cells burst, pigment out, fever on: that is the 48-hour malaria rhythm.",
             margin="Two lines linking the bursting cell to the fever. Give the 48 hours if you can."),
    ],
    "The second mark is only for the link to the fever, so the answer must not stop at describing the granule."))

# ── 146 ──────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_exflagellation", "VSAQ", "59", "VSAQ 146",
    "What is exflagellation and what are the resultant products called?",
    "",
    [{"label": "The process", "marks": 1}, {"label": "The products", "marks": 1}],
    [
        step("s1_process", "text", "The process", 1, mark_note="Process",
             lines=T("In the crop of the female Anopheles mosquito the "
                     "nucleus of the microgametocyte divides into eight "
                     "daughter nuclei.",
                     "These nuclei pass into eight thin flagella-like "
                     "structures. The structures then lash about and break "
                     "away from the parent body.",
                     "This liberation of the flagella-like male gametes is "
                     "called exflagellation."),
             why="The process is named for what is seen down the microscope — thin threads whipping off a body — so the answer describes the eight nuclei, the eight threads and the breaking away, in that order.",
             cm=["Writing that exflagellation happens in man. It happens in the crop of the mosquito.",
                 "Giving the wrong number. Eight daughter nuclei give eight male gametes."],
             tip="Eight nuclei, eight lashing threads, eight gametes break free.",
             margin="Three short lines in order: nuclei, threads, breaking away."),
        step("s2_products", "boxed_final", "The products", 1, mark_note="Products",
             lines=B("Eight male gametes (microgametes)",
                     "The products of exflagellation are the male gametes, "
                     "also called microgametes.",
                     "One of them later enters the fertilization cone of "
                     "the female gamete."),
             why="Naming the product also fixes the place of exflagellation in the cycle, because the very next event is fertilization inside the mosquito.",
             cm=["Calling the products sporozoites. Sporozoites are formed much later, in the oocyst.",
                 "Calling them gametocytes. The gametocyte is what the gametes were formed FROM."],
             tip="Gametocyte to gametes: exflagellation makes the male gametes, not the sporozoites.",
             margin="Name the product, then one line on what happens to it next."),
    ],
    "Half of this question is a counting mark — eight nuclei giving eight male gametes — so state the number plainly."))

# ── 147 ──────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_anisogamy_plasmodium", "VSAQ", "59", "VSAQ 147",
    "Why is the syngamy found in Plasmodium called anisogamy?",
    "",
    [{"label": "Syngamy", "marks": 1}, {"label": "Why anisogamy", "marks": 1}],
    [
        step("s1_syngamy", "text", "Syngamy", 1, mark_note="Syngamy",
             lines=T("Syngamy is the complete fusion of a male gamete with "
                     "a female gamete to form a zygote.",
                     "In Plasmodium this fusion takes place in the crop of "
                     "the female Anopheles mosquito."),
             why="The answer starts from the general word so the special word has something to be measured against, and it fixes the place where the fusion happens.",
             cm=["Writing that syngamy takes place in man. It takes place in the mosquito.",
                 "Confusing syngamy with schizogony. Syngamy is fusion; schizogony is splitting."],
             tip="Syn- means together: syngamy is two gametes fusing into one zygote.",
             margin="One line for the definition, one for the place. Two lines."),
        step("s2_aniso", "boxed_final", "Why anisogamy", 1, mark_note="Reason",
             lines=B("Unequal gametes fuse, so it is anisogamy",
                     "The male gamete of Plasmodium is small and the female "
                     "gamete is large, so the two are dissimilar in size.",
                     "Fusion of two gametes that are unlike in size is "
                     "called anisogamy."),
             why="Aniso- means unequal, so the reason is a comparison of the two gametes: name both sizes and the term follows on its own.",
             cm=["Writing that the gametes are alike. Alike gametes would make it isogamy.",
                 "Giving the reason as a difference in number instead of a difference in size."],
             tip="Iso- equal, aniso- unequal: small male, large female, so anisogamy.",
             margin="Name both sizes, then close with the term. Two lines."),
    ],
    "The mark is on the word 'dissimilar in size'; a correct definition of syngamy with no size comparison does not answer the question asked."))

# ── 176 (Star Questions Plus, VSAQ) ──────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_steroids_banned_sports", "VSAQ", "63", "Star Q 176",
    "Why are cannabinoids and anabolic steroids banned in sports and games?",
    "",
    [{"label": "Anabolic steroids", "marks": 1}, {"label": "Cannabinoids", "marks": 1}],
    [
        step("s1_steroids", "text", "Anabolic steroids", 1, mark_note="Steroids",
             lines=T("Anabolic steroids are man-made substances that act "
                     "like the hormone testosterone.",
                     "They increase protein synthesis, so muscle tissue is "
                     "built up and the strength of the sportsperson rises "
                     "beyond the natural level."),
             why="The ban rests on an unfair advantage, so the answer must show HOW the drug raises performance — through testosterone-like action on protein synthesis and muscle.",
             cm=["Writing only that the drugs are harmful. Name the testosterone-like action and the muscle build-up.",
                 "Writing that anabolic steroids are obtained from a plant. They are man-made."],
             tip="Anabolic means building up: these drugs build muscle by acting like testosterone.",
             margin="Two lines: what they act like, then what they build. Do not describe cannabinoids here."),
        step("s2_cannabinoids", "boxed_final", "Cannabinoids", 1, mark_note="Cannabinoids",
             lines=B("Unfair gain and body damage, so both are banned",
                     "Cannabinoids are obtained from the hemp plant "
                     "Cannabis sativa. They act on the central nervous "
                     "system and on the heart and blood vessels.",
                     "Both groups of drugs change the result of a contest "
                     "unfairly and damage the body of the user, so they are "
                     "banned in sports and games."),
             why="The two groups are banned for two different reasons — one gives an unfair gain, the other harms the body and dulls judgement — and the closing line joins both to the ban.",
             cm=["Writing that cannabinoids act like testosterone. They act on the nervous system and the heart.",
                 "Ending without saying why the ban follows."],
             tip="Steroids build the body unfairly, cannabinoids damage the nerves and the heart. Both are banned.",
             margin="Name the source and the action, then close with the reason for the ban."),
    ],
    "Two drug groups, two separate reasons — an answer that gives one reason for both is treated as half an answer.",
    "BOOK ERROR: the book's answer reads 'Cannabinoid and anabolic drugs are called steroid drugs. They mimic the effect of testosterone', which treats cannabinoids as steroids. Cannabinoids come from Cannabis sativa and act on the central nervous system and the cardiovascular system; only anabolic steroids are testosterone-like. This card separates the two groups and gives each its own reason for the ban."))

report(W)
