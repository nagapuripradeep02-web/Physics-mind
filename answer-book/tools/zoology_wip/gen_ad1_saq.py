# -*- coding: utf-8 -*-
"""Unit 3 — Animal Diversity-I (Zoology): the 8 SAQ cards.

Chapter SAQs: book qno 24-29, SAQ chapter "6. ANIMAL DIVERSITY-I", book pp.35-36.
Walked boundary to boundary: the previous chapter closes with SAQ 23 (glandular
epithelium) and the next chapter opens with SAQ 30 (the four hallmarks of
chordates). The chapter's own footer points to the Star pages.
Star-Q SAQs: qno 180 (flukes, book p.64) and 181 (centipede vs millipede, p.65),
both printed under an ANIMAL DIVERSITY-I heading.

There is NO LAQ chapter for this unit, so no 8-mark form is authored.
"""
import json, io, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_ad1_figs import FIG as NEREIS_FIG

OUT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'questions'))

UNIT = {"number": 3, "name": "Animal Diversity-I (Zoology)"}
CHAPTER = "Animal Diversity-I"

NOTE_BASE = (
    "Sourced from the Sri Chaitanya Junior Fastrack zoology section "
    "(book p.{page}, SAQ {qno}). Zoology holds only ONE source book — the "
    "TSBIE Basic Learning Material in hand covers physics only, and no zoology "
    "board paper is in the corpus — so the two-book union check and the "
    "back-test are both structurally impossible for this card; 'not checked' "
    "does NOT mean 'checked and clean'. The mark split is a claim until a "
    "Telangana IPE teacher confirms it."
)


def ts(y):
    return {"year": y, "board": "ts_ipe"}


def ap(y):
    return {"year": y, "board": "ap_ipe"}


def card(qid, qno, page, text, appearances, split, steps, insider, extra_note=""):
    note = NOTE_BASE.format(page=page, qno=qno)
    if extra_note:
        note += " " + extra_note
    return {
        "schema_version": "answer_book_v1",
        "question_id": qid,
        "board": "ts_ipe",
        "board_label": "Telangana — Board of Intermediate Education",
        "subject": "zoology",
        "year_cycle": "first_year",
        "class_label": "Intermediate I Year (Class 11)",
        "unit": UNIT,
        "chapter": CHAPTER,
        "qtype": "SAQ",
        "marks_total": 4,
        "paper_section": "Section B",
        "expected_time_min": 8,
        "question_text": text,
        "appearances": appearances,
        "mark_split": split,
        "verification": {
            "status": "unverified",
            "needs_teacher_verification": True,
            "note": note,
        },
        "answer": {
            "page_header": [
                "Section B — Short Answer Question",
                "Animal Diversity-I (Zoology) · 4 marks",
            ],
            "steps": steps,
        },
        "insider_note": insider,
    }


def step(sid, kind, label, marks, mark_note, lines, why, cm, tip, margin, figure=None):
    s = {
        "id": sid,
        "kind": kind,
        "label": label,
        "marks": marks,
        "why": why,
        "common_mistakes": cm,
        "memory_tip": tip,
        "margin_note": margin,
    }
    if marks > 0:
        s["mark_note"] = mark_note
    if figure is not None:
        s["figure"] = figure
    else:
        s["lines"] = lines
    return s


def boxed(t):
    return {"text": t, "style": "boxed"}


CARDS = []

# ── SAQ 24 — anthozoans ───────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_anthozoa_features", 24, 35,
    "Write short notes on the salient features of the anthozoans.",
    [ap(2016), ts(2018), ts(2020)],
    [{"label": "What they are", "marks": 1}, {"label": "Body form", "marks": 1},
     {"label": "Cnidocytes and germ cells", "marks": 1}, {"label": "Examples", "marks": 1}],
    [
        step("s1_what", "text", "What the anthozoans are", 1, "What they are", [
            "Anthozoa is a class of the phylum Cnidaria.",
            "Its members are commonly called sea anemones",
            "and corals.",
            "They are marine and sedentary, that is, they",
            "stay fixed to the substratum.",
            "They may be solitary or colonial.",
        ],
            "The name Anthozoa means flower animal, and it records the ring of tentacles that a fixed polyp spreads round its mouth.",
            [
                "Calling Anthozoa a phylum. It is a CLASS of the phylum Cnidaria.",
                "Writing that they are free-swimming. They are sedentary and stay attached.",
            ],
            "Anthozoa means flower animal: sea anemones and corals, marine and fixed.",
            "Class, phylum, common names, habit. Four or five lines."),
        step("s2_body_form", "text", "Body form", 1, "Body form", [
            "Only the polyp form occurs in the life cycle.",
            "The medusa stage is absent.",
            "The gastrovascular cavity is divided by",
            "vertical partitions called mesenteries, or",
            "septa, which increase its inner surface.",
            "The mouth opens into a tube called the",
            "stomodaeum.",
        ],
            "With no medusa there is no swimming stage at all, so an anthozoan spends its whole life as a polyp fixed in one place.",
            [
                "Writing that both polyp and medusa occur. In Anthozoa the medusa is absent.",
                "Leaving out the mesenteries. The divided gastrovascular cavity is a mark of the class.",
            ],
            "Polyp only, no medusa, and the inside divided by mesenteries.",
            "The absent medusa and the mesenteries are the two facts marked here."),
        step("s3_cnidocytes", "text", "Cnidocytes, mesogloea, germ cells", 1, "Cnidocytes and germ cells", [
            "Cnidocytes are present in the ectoderm and",
            "also in the endoderm.",
            "The mesogloea is thick and contains",
            "connective tissue with cells in it.",
            "The germ cells arise from the endoderm.",
            "These features make the anthozoans the most",
            "advanced cnidarians.",
        ],
            "In the simpler cnidarians the cnidocytes and the germ cells are limited to one layer, so finding both layers involved is what places Anthozoa at the top of the class.",
            [
                "Writing that cnidocytes occur in the ectoderm only. In Anthozoa they occur in both layers.",
                "Placing the germ cells in the ectoderm. In Anthozoa they arise in the endoderm.",
            ],
            "Both layers carry cnidocytes, and the germ cells come from the inner layer.",
            "Three short facts. One line each is enough."),
        step("s4_examples", "boxed_final", "Examples", 1, "Examples", [
            boxed("Polyp only · Medusa absent · Mesenteries present"),
            "Examples:",
            "Adamsia — the sea anemone.",
            "Corallium rubrum — the red coral.",
            "Pennatula — the sea pen.",
        ],
            "Each example stands for one habit of the class: a solitary anemone, a colony that builds a stony skeleton, and a colony that grows in the shape of a feather.",
            [
                "Naming Hydra or Aurelia. Hydra is a hydrozoan and Aurelia is a scyphozoan.",
                "Giving no example. Two or three named animals are expected.",
            ],
            "Anemone, coral, sea pen: Adamsia, Corallium, Pennatula.",
            "Two or three examples with the common name beside each."),
    ],
    "This is a list question, so write it as a numbered list — the examiner ticks points, and a paragraph hides them.",
))

# ── SAQ 25 — polychaetes ──────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_polychaeta_features", 25, 35,
    "What are the salient features exhibited by polychaetes?",
    [ts(2016), ts(2019), ap(2018), ap(2020)],
    [{"label": "What they are", "marks": 1}, {"label": "Head and parapodia", "marks": 1},
     {"label": "Breeding", "marks": 1}, {"label": "Examples", "marks": 1}],
    [
        step("s1_what", "text", "What the polychaetes are", 1, "What they are", [
            "Polychaeta is a class of the phylum Annelida.",
            "Its members are marine annelids, commonly",
            "called bristle worms or clam worms.",
            "Many are free-moving. Others live inside",
            "tubes that they build.",
        ],
            "Every later feature follows from a free-moving marine life, which is why the habit is stated before the organs.",
            [
                "Calling Polychaeta a phylum. It is a class of the phylum Annelida.",
                "Writing that they are fresh-water worms. Polychaetes are mainly marine.",
            ],
            "Marine annelids with bristles: free-moving forms and tube-living forms.",
            "Class, phylum, common names, habit. Four lines."),
        step("s2_head_parapodia", "text", "Head and parapodia", 1, "Head and parapodia", [
            "The head is distinct and carries sense",
            "organs: eyes, tentacles and palps.",
            "Parapodia are present, one pair on every",
            "segment. They are the locomotor organs.",
            "Each parapodium carries many chitinous setae,",
            "and that is what the name polychaete records.",
            "The parapodia are thin and hold many blood",
            "vessels, so they carry out respiration as",
            "well, in addition to the gills.",
        ],
            "The parapodium is a flap of the body wall with a large surface and a rich blood supply, which is why one organ serves both for movement and for the exchange of gases.",
            [
                "Writing that the head is not distinct. A distinct head is a mark of the class.",
                "Giving parapodia on a few segments only. They are on every segment.",
            ],
            "A distinct head in front, and a pair of bristly parapodia on every segment behind it.",
            "The head sense organs and the parapodia are the two blocks ticked here."),
        step("s3_diagram", "diagram", "Diagram — Nereis, a polychaete", 0, None, None,
            "The drawing puts the two marked features side by side: a distinct head at one end, and an identical pair of parapodia on every segment behind it.",
            [
                "Drawing parapodia on only part of the body. Every segment carries a pair.",
                "Leaving the head blank. The eyes, antennae and palps are what make the head distinct.",
            ],
            "Draw the tapering tube first, rule the segments across it, then hang one pair of parapodia on each segment.",
            "This question does not ask for a diagram, so it carries no marks. Draw it only if there is time — the four marks are all in the written points.",
            figure=NEREIS_FIG),
        step("s4_breeding", "text", "What is absent, and breeding", 1, "Breeding", [
            "A clitellum is absent, and gonoducts are",
            "absent.",
            "Polychaetes are unisexual. The sexes are",
            "separate.",
            "The sex cells are shed into the coelom and",
            "pass out through the nephridiopores.",
            "Fertilisation is external, in the sea water.",
            "The larva is a trochophore.",
        ],
            "With no gonoduct of their own the gametes have to leave by the excretory openings, which is why fertilisation can only take place outside the body. BOOK NOTE: the source book lists polychaetes as 'bisexual'; standard zoology, and the rest of that same list (gametes shed into the coelom, external fertilisation, trochophore larva), describe a UNISEXUAL animal, so this card is written as unisexual.",
            [
                "Writing that polychaetes are hermaphrodite. The sexes are separate.",
                "Giving them a clitellum. The clitellum belongs to the earthworm and the leech.",
            ],
            "No clitellum, no gonoducts, separate sexes, external fertilisation, trochophore larva.",
            "Two things absent, then four facts on breeding. One line each."),
        step("s5_examples", "boxed_final", "Examples", 1, "Examples", [
            boxed("Distinct head · Parapodia with many setae"),
            "Examples:",
            "Nereis — the sand worm or clam worm.",
            "Aphrodite — the sea mouse.",
            "Arenicola — the lugworm.",
        ],
            "The three named worms cover both habits of the class: Nereis moves about freely and Arenicola lives in a burrow.",
            [
                "Naming Pheretima or Hirudinaria. Those are an oligochaete and a leech.",
                "Giving no example. Two or three named worms are expected.",
            ],
            "Nereis, Aphrodite, Arenicola — sand worm, sea mouse, lugworm.",
            "Two or three examples with the common name. Close with the boxed line."),
    ],
    "Parapodia are what the word polychaete is built on, so a script that names them and their setae has already earned half the question.",
    extra_note=(
        "BOOK ERROR: the book's point 8 says polychaetes are 'bisexual'. The book uses "
        "'bisexual' to mean hermaphrodite (it uses it that way again for the flukes on p.64). "
        "Polychaetes are UNISEXUAL — the sexes are separate — and the book's own following "
        "points (gametes shed into the coelom, passed out through the nephridiopores, external "
        "fertilisation, trochophore larva) describe a unisexual animal. The card is written "
        "correctly and the book's wording is recorded in that step's `why`. The book also "
        "misspells lugworm as 'lugwarm'. FIGURE SCOPE: the book prints a shaded drawing of "
        "Nereis beside this question but does NOT ask for a diagram, so the diagram step "
        "carries 0 marks. The figure is an exam-standard simplified line drawing of the same "
        "animal: prostomium with four eyes, one pair of antennae and one pair of palps, the "
        "peristomium, seven trunk segments each with a pair of setae-bearing parapodia, and "
        "the anal cirri. The four pairs of peristomial (tentacular) cirri that a full "
        "anatomical drawing shows are deliberately NOT drawn — at exam scale they crowd the "
        "palps and the antennae, and they are not named in the book's answer."
    ),
))

# ── SAQ 26 — crustaceans ──────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_crustacea_characters", 26, 35,
    "What are the chief characters of the crustaceans?",
    [ap(2017), ts(2015), ts(2017), ts(2019)],
    [{"label": "What they are", "marks": 1}, {"label": "Appendages", "marks": 1},
     {"label": "Organ systems", "marks": 1}, {"label": "Development and examples", "marks": 1}],
    [
        step("s1_what", "text", "What the crustaceans are", 1, "What they are", [
            "Crustacea is a class of mandibulate",
            "arthropods. Its members are mostly aquatic.",
            "The exoskeleton is a chitinous cuticle made",
            "hard by calcium carbonate.",
            "The head and the thorax are fused into one",
            "piece called the cephalothorax.",
        ],
            "The lime in the cuticle is what gives the class its name, because crusta means a hard shell.",
            [
                "Writing that the exoskeleton is only chitin. It is chitin hardened with calcium carbonate.",
                "Keeping the head and thorax separate. In crustaceans they are fused into a cephalothorax.",
            ],
            "Crusta means a hard shell: chitin plus lime, and the head fused with the thorax.",
            "Class, habitat, exoskeleton, body divisions. Four or five lines."),
        step("s2_appendages", "text", "Appendages", 1, "Appendages", [
            "The head bears five pairs of appendages:",
            "1) antennules 2) antennae 3) mandibles",
            "4) first maxillae 5) second maxillae.",
            "Two pairs of antennae is the mark of the",
            "class. No other arthropod has two pairs.",
            "The thoracic and the abdominal appendages",
            "are biramous, that is, each has two branches.",
        ],
            "Two pairs of antennae and a two-branched limb are the two features that separate a crustacean from an insect, so both are written out in full.",
            [
                "Giving one pair of antennae. Crustaceans have two pairs: antennules and antennae.",
                "Writing uniramous. Crustacean appendages are biramous; insect appendages are uniramous.",
            ],
            "Five pairs on the head, and every limb behind the head splits into two branches.",
            "Name the five pairs in order, then the word biramous. It carries a mark on its own."),
        step("s3_organs", "text", "Organ systems", 1, "Organ systems", [
            "Respiration is by gills, also called",
            "branchiae.",
            "The excretory organs are the green glands,",
            "also called antennary glands.",
            "The sense organs are the antennae, a pair of",
            "compound eyes, and the statocysts, which are",
            "the organs of balance.",
        ],
            "The excretory gland opens at the base of the antenna, which is why the same organ carries the two names green gland and antennary gland.",
            [
                "Naming Malpighian tubules. Those are the excretory organs of insects; crustaceans have green glands.",
                "Leaving out the statocyst. It is the organ of balance and is part of the marked list.",
            ],
            "Gills to breathe, green glands to excrete, statocysts to balance.",
            "Three systems, one line each. Give both names for the green gland."),
        step("s4_development", "boxed_final", "Development and examples", 1, "Development and examples", [
            boxed("Two pairs of antennae · Biramous appendages"),
            "Development is indirect. Several larval",
            "stages follow one another, such as the",
            "nauplius and the zoea.",
            "Examples:",
            "Palaemon — the fresh water prawn.",
            "Cancer — the crab.",
            "Daphnia — the water flea.",
        ],
            "An indirect development spreads the young into the plankton, which is why a bottom-living adult begins life as a swimming larva.",
            [
                "Writing that development is direct. It is indirect, with several larval stages.",
                "Giving no example. Two or three named animals are expected.",
            ],
            "Prawn, crab, water flea: Palaemon, Cancer, Daphnia.",
            "One line on development, then the examples. Close with the boxed pair of hallmarks."),
    ],
    "The two hallmarks of the class — two pairs of antennae and biramous appendages — are the lines that separate a full answer from a general one about arthropods.",
    extra_note=(
        "BOOK SPELLINGS corrected here: the book prints 'antinnules' for antennules, "
        "'Palamon' for Palaemon and 'Daphina' for Daphnia. The line 'two pairs of antennae "
        "is the mark of the class' is added by this card; the book lists the five head "
        "appendages but never says why the pair count matters."
    ),
))

# ── SAQ 27 — echinoids ────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_echinoidea_features", 27, 36,
    "What are the salient features of the echinoids?",
    [ap(2017), ap(2019), ap(2022)],
    [{"label": "What they are", "marks": 1}, {"label": "Test and spines", "marks": 1},
     {"label": "Aristotle's lantern", "marks": 1}, {"label": "Larva and examples", "marks": 1}],
    [
        step("s1_what", "text", "What the echinoids are", 1, "What they are", [
            "Echinoidea is a class of the phylum",
            "Echinodermata.",
            "Its members are the sea urchins, the heart",
            "urchins and the sand dollars.",
            "The body form is semi-globular or disc-like.",
            "Arms are absent.",
        ],
            "The class is defined by what it does not have — no arms — which is why the body closes into a globe or a disc instead of spreading into a star.",
            [
                "Giving them arms. Arms are absent in Echinoidea; it is the starfish that has arms.",
                "Calling Echinoidea a phylum. It is a class of the phylum Echinodermata.",
            ],
            "Echinoid means spiny and globular: a ball or a disc, with no arms.",
            "Class, phylum, body form, and the absence of arms. Four or five lines."),
        step("s2_test", "text", "Test, spines and pedicellariae", 1, "Test and spines", [
            "The calcareous ossicles are united to form a",
            "strong shell called the test, or corona.",
            "The spines over the body are movable.",
            "Pedicellariae are present. Each pedicellaria",
            "has three jaws.",
            "The ambulacral grooves are closed.",
        ],
            "The ossicles are locked together instead of lying loose in the skin, and that fixed test is what gives the spines a firm base to be worked from.",
            [
                "Writing that the spines are fixed. In echinoids the spines are movable.",
                "Giving the pedicellariae five jaws. A pedicellaria has three jaws; Aristotle's lantern has five.",
            ],
            "Three jaws for a pedicellaria, five jaws for the lantern. Keep the two counts apart.",
            "Test, spines, pedicellariae, grooves. Four short lines."),
        step("s3_lantern", "text", "Aristotle's lantern", 1, "Aristotle's lantern", [
            "The madreporite and the anus are aboral, that",
            "is, they lie on the surface away from the",
            "mouth.",
            "Aristotle's lantern is present. It is a",
            "five-jawed masticatory apparatus in the",
            "buccal cavity.",
            "It is present in the sea urchins and absent",
            "in the heart urchin.",
        ],
            "The mouth faces the rock the animal feeds on and the anus faces away from it, so the two openings lie on opposite surfaces of the test.",
            [
                "Placing the anus on the oral surface. In echinoids the anus is aboral.",
                "Writing that every echinoid has the lantern. It is absent in the heart urchin.",
            ],
            "Mouth below on the rock, anus above. The lantern is the five-jawed mill at the mouth.",
            "Position of the two openings, then the lantern. The five jaws carry the mark."),
        step("s4_larva", "boxed_final", "Larva and examples", 1, "Larva and examples", [
            boxed("Test · movable spines · Aristotle's lantern"),
            "The larva is the echinopluteus.",
            "Examples:",
            "Echinus — the sea urchin.",
            "Echinocardium — the heart urchin.",
            "Echinodiscus — the sand dollar.",
        ],
            "The larva is named after the class it belongs to, so echinopluteus goes with Echinoidea just as auricularia goes with Holothuroidea.",
            [
                "Naming the bipinnaria. That is the larva of a starfish; the echinoid larva is the echinopluteus.",
                "Giving no example. Two or three named animals are expected.",
            ],
            "Echinopluteus for the echinoid, and all three examples begin with Echino-.",
            "Larva in one line, then the examples. Close with the boxed hallmarks."),
    ],
    "Aristotle's lantern is asked as a 2-mark question of its own, so it is always worth a full line here — five jaws, in the buccal cavity of the sea urchin.",
    extra_note=(
        "BOOK SPELLING corrected here: the book prints 'Peidicellaria' for pedicellariae "
        "and 'calcarious' for calcareous."
    ),
))

# ── SAQ 28 — Holothuroidea ────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_holothuroidea_features", 28, 36,
    "Mention the salient features of Holothuroidea.",
    [ap(2015)],
    [{"label": "What they are", "marks": 1}, {"label": "What is absent", "marks": 1},
     {"label": "Internal features", "marks": 1}, {"label": "Larva and examples", "marks": 1}],
    [
        step("s1_what", "text", "What the holothuroids are", 1, "What they are", [
            "Holothuroidea is a class of the phylum",
            "Echinodermata.",
            "Its members are the sea cucumbers. The body",
            "is soft and cucumber-shaped.",
            "The body is elongated along the oro-aboral",
            "axis, so the mouth is at one end and the",
            "anus at the other.",
            "The skin is leathery and holds small dermal",
            "spicules.",
        ],
            "The ossicles are reduced to loose spicules in the skin instead of a fixed test, and that is why a sea cucumber is soft while a sea urchin is rigid.",
            [
                "Writing that the body is flattened. It is elongated along the oro-aboral axis.",
                "Giving them a hard test. The skin is leathery, with only small spicules in it.",
            ],
            "Soft, long and leathery: the sea cucumber lies on its side, mouth at one end.",
            "Class, common name, body form, skin. Five lines."),
        step("s2_absent", "text", "What is absent, and the tentacles", 1, "What is absent", [
            "Arms, spines and pedicellariae are all",
            "absent.",
            "The mouth is surrounded by a ring of",
            "retractile tentacles. They are modified tube",
            "feet and are used to collect food.",
            "The ambulacral grooves are closed.",
            "Tube feet are present and are used in",
            "locomotion.",
        ],
            "The tentacles round the mouth are tube feet that took up feeding, which is why one water vascular system works both the feet below and the tentacles in front.",
            [
                "Giving them spines. Spines and pedicellariae are absent in this class.",
                "Writing that the tentacles are arms. They are modified tube feet.",
            ],
            "No arms, no spines, no pedicellariae — only a ring of tentacles round the mouth.",
            "Three absences in one line, then the tentacles and the tube feet."),
        step("s3_internal", "text", "Internal features", 1, "Internal features", [
            "The madreporite is internal. It lies inside",
            "the coelom and does not open on the surface.",
            "The respiratory organs are the respiratory",
            "trees, a pair of branched tubes that open",
            "into the cloaca.",
            "Water is drawn in and out through the cloaca,",
            "and the exchange of gases takes place in the",
            "walls of these trees.",
        ],
            "The respiratory tree is a branched sac inside the body, so a sea cucumber breathes by drawing water in and out through the cloaca instead of over a gill on the outside.",
            [
                "Writing that the madreporite is on the surface. In this class it is internal.",
                "Naming dermal branchiae. Those belong to the starfish; sea cucumbers have respiratory trees.",
            ],
            "Madreporite inside, respiratory trees inside, water in and out through the cloaca.",
            "Two internal structures. Say where each one opens."),
        step("s4_larva", "boxed_final", "Larva and examples", 1, "Larva and examples", [
            boxed("No arms or spines · Respiratory trees present"),
            "The larva is the auricularia.",
            "Examples:",
            "Holothuria — the sea cucumber.",
            "Synapta.",
            "Thyone.",
        ],
            "The auricularia is a bilaterally symmetrical swimming larva, so the sea cucumber, like every echinoderm, begins life bilateral and becomes radial later.",
            [
                "Naming the echinopluteus. That belongs to the sea urchin; the holothurian larva is the auricularia.",
                "Giving no example. Two or three named animals are expected.",
            ],
            "Auricularia for the sea cucumber; echinopluteus for the sea urchin.",
            "Larva in one line, then the examples. Close with the boxed hallmarks."),
    ],
    "This class is defined mostly by absences — no arms, no spines, no pedicellariae — so write those three in one line and spend the space on the tentacles and the respiratory trees.",
))

# ── SAQ 29 — Arachnida ────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_arachnida_characters", 29, 36,
    "Mention the general characters of Arachnida.",
    [ap(2019)],
    [{"label": "What they are", "marks": 1}, {"label": "Appendages", "marks": 1},
     {"label": "Organ systems", "marks": 1}, {"label": "Development and examples", "marks": 1}],
    [
        step("s1_what", "text", "What the arachnids are", 1, "What they are", [
            "Arachnida is a class of chelicerate",
            "arthropods. Its members are mostly",
            "terrestrial.",
            "The body is divided into two parts: the",
            "prosoma in front and the opisthosoma behind.",
            "Antennae are absent, as in every chelicerate.",
        ],
            "The chelicerates are named after their first pair of appendages, so the absence of antennae follows from the name of the subphylum itself.",
            [
                "Giving them a head, thorax and abdomen. The arachnid body has two parts, prosoma and opisthosoma.",
                "Giving them antennae. No chelicerate has antennae.",
            ],
            "Two body parts and no antennae: prosoma in front, opisthosoma behind.",
            "Class, subphylum, habitat, body divisions. Four or five lines."),
        step("s2_appendages", "text", "Appendages", 1, "Appendages", [
            "The prosoma carries six pairs of appendages:",
            "a) one pair of chelicerae",
            "b) one pair of pedipalps",
            "c) four pairs of walking legs.",
            "The spinnerets of a spider are modified",
            "abdominal appendages. They give out the silk",
            "the spider spins its web from.",
        ],
            "The count six is fixed for the class, and it is the four pairs of walking legs at the end of that list that separate an arachnid from an insect with three pairs.",
            [
                "Giving three pairs of walking legs. Three pairs belong to insects; arachnids have four pairs.",
                "Placing the spinnerets on the prosoma. They are modified appendages of the opisthosoma.",
            ],
            "Six pairs: chelicerae, pedipalps, then four pairs of legs. Four pairs, not three.",
            "List the six pairs as a, b, c. Then one line on the spinnerets."),
        step("s3_systems", "text", "Organ systems", 1, "Organ systems", [
            "Respiration is by book lungs, as in the",
            "scorpion, and by tracheae in some spiders.",
            "The respiratory pigment is haemocyanin,",
            "which contains copper.",
            "The excretory organs are the Malpighian",
            "tubules and the coxal glands.",
        ],
            "Haemocyanin carries copper where haemoglobin carries iron, which is why arachnid blood is not red.",
            [
                "Naming haemoglobin. The arachnid pigment is haemocyanin, and it holds copper.",
                "Giving only one excretory organ. Both Malpighian tubules and coxal glands are named.",
            ],
            "Copper pigment, not iron. Book lungs on land, tracheae in some spiders.",
            "Respiration, pigment, excretion. One line each."),
        step("s4_development", "boxed_final", "Development and examples", 1, "Development and examples", [
            boxed("Two body parts · Six pairs on the prosoma"),
            "Development is direct. There is no larval",
            "stage.",
            "Scorpions are viviparous. They give birth to",
            "young ones.",
            "Examples:",
            "Palamnaeus — the scorpion.",
            "Aranea — the spider.",
            "Sarcoptes — the itch mite.",
        ],
            "The young hatch already shaped like the adult, so no larval stage is needed, and in the scorpion they are carried until then inside the mother.",
            [
                "Writing that arachnids have a larval stage. Development is direct.",
                "Writing that scorpions lay eggs. Scorpions are viviparous.",
            ],
            "No larva at all, and the scorpion gives birth to live young.",
            "Development, then the scorpion's habit, then the examples."),
    ],
    "Four pairs of walking legs is the line that most often separates a correct arachnid answer from an insect answer written by mistake.",
))

# ── Star SAQ 180 — flukes ─────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_trematoda_flukes", 180, 64,
    "What is the class to which the flukes belong? Write short notes on the chief characters of that group.",
    [ts(2022)],
    [{"label": "The class", "marks": 1}, {"label": "Body and suckers", "marks": 1},
     {"label": "Gut and reproduction", "marks": 1}, {"label": "Life cycle and examples", "marks": 1}],
    [
        step("s1_class", "text", "The class", 1, "The class", [
            "Flukes belong to the class Trematoda of the",
            "phylum Platyhelminthes.",
            "All flukes are parasites.",
            "Most of them live inside the body of the",
            "host, in the liver, the gut or the blood",
            "vessels.",
        ],
            "The question asks for the class first, so the name Trematoda and its phylum are written before any character of the group.",
            [
                "Writing Cestoda. Cestoda is the class of the tapeworms; the flukes are Trematoda.",
                "Naming the phylum Nematoda. Flukes are flatworms, phylum Platyhelminthes.",
            ],
            "Trematoda for the flukes, Cestoda for the tapeworms, Turbellaria for the free-living flatworms.",
            "Class and phylum in the first line. That is the first mark."),
        step("s2_body", "text", "Body and suckers", 1, "Body and suckers", [
            "The body is covered by a thick tegument.",
            "The tegument resists the digestive juices of",
            "the host.",
            "Two suckers are generally present:",
            "1) an oral sucker around the mouth,",
            "2) a ventral sucker, called the acetabulum.",
            "The suckers hold the fluke to the wall of the",
            "organ it lives in.",
        ],
            "A parasite in a moving gut or a flowing blood vessel has to stay in place, so the suckers and the protective tegument are the two features every fluke shows.",
            [
                "Calling the covering a cuticle. In a fluke it is a living tegument.",
                "Naming only one sucker. The oral sucker and the ventral acetabulum are both expected.",
            ],
            "Two suckers: one at the mouth, one on the belly, and that one is the acetabulum.",
            "Covering, then the two suckers by name. Five or six lines."),
        step("s3_gut", "text", "Gut and reproduction", 1, "Gut and reproduction", [
            "The intestine is bifurcated, that is, it is",
            "forked into two blind branches.",
            "There is no anus. The undigested matter is",
            "thrown out through the mouth.",
            "Most flukes are bisexual, that is,",
            "hermaphrodite. One animal carries both the",
            "male and the female organs.",
            "Schistosoma, the blood fluke, is an",
            "exception. Its sexes are separate.",
        ],
            "A forked blind gut carries the food to both sides of a flat body, so no circulatory system is needed to distribute it. BOOK NOTE: the source book lists flukes flatly as 'bisexual' and names Schistosoma as an example on the same page; Schistosoma is unisexual, so this card states the general rule and the exception.",
            [
                "Giving the fluke an anus. The gut is blind; the waste leaves by the mouth.",
                "Writing that every fluke is hermaphrodite. Schistosoma has separate sexes.",
            ],
            "A forked blind gut, and one body with both sets of organs — except in Schistosoma.",
            "Gut in two lines, reproduction in two. Name the exception if there is room."),
        step("s4_lifecycle", "boxed_final", "Life cycle and examples", 1, "Life cycle and examples", [
            boxed("Two suckers · Forked blind gut · Many larvae"),
            "The life history passes through more than",
            "one host.",
            "There are several larval stages, in this",
            "order: miracidium, sporocyst, redia and",
            "cercaria.",
            "Examples:",
            "Fasciola — the liver fluke.",
            "Schistosoma — the blood fluke.",
        ],
            "Each larval stage multiplies in number inside the intermediate host, which is why a fluke with a two-host life cycle can still reach a new final host.",
            [
                "Giving the larval stages in the wrong order. It runs miracidium, sporocyst, redia, cercaria.",
                "Writing that the fluke needs one host only. There is more than one host in the life history.",
            ],
            "Miracidium, sporocyst, redia, cercaria — four stages, in that order, inside the snail.",
            "The list of larval stages is the marked part. Keep it in order, then close with the examples."),
    ],
    "The four larval names in the right order are worth as much here as the whole description of the body — write them as a chain, not as a set.",
    extra_note=(
        "BOOK IMPRECISION: the book's point 6 says flukes are 'bisexual' (its word for "
        "hermaphrodite) and its point 9 names Schistosoma as an example on the same page. "
        "Schistosoma is unisexual, so the two points contradict each other. The card states "
        "the general rule and names the exception, and the book's wording is recorded in that "
        "step's `why`."
    ),
))

# ── Star SAQ 181 — centipede vs millipede ─────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_centipede_vs_millipede", 181, 65,
    "Compare briefly a centipede and a millipede.",
    [ap(2018)],
    [{"label": "What both are", "marks": 1}, {"label": "Centipede", "marks": 1},
     {"label": "Millipede", "marks": 1}, {"label": "Key differences", "marks": 1}],
    [
        step("s1_shared", "text", "What both are", 1, "What both are", [
            "Both are mandibulate arthropods and both are",
            "terrestrial.",
            "In both the body is divided into a head and",
            "a trunk.",
            "Both respire by tracheae.",
            "In both the excretory organs are the",
            "Malpighian tubules.",
        ],
            "The two animals share every class-level character, so the shared points are written first and the differences after, which is the shape a comparison question is marked in.",
            [
                "Writing that a centipede breathes by gills. Both groups respire by tracheae.",
                "Giving them a head, thorax and abdomen. The body is a head and a trunk only.",
            ],
            "Same phylum, same habitat, same breathing, same excretion — only the legs and the food differ.",
            "Shared points first. Four short lines is enough."),
        step("s2_centipede", "text", "Centipede", 1, "Centipede", [
            "Centipedes belong to the class Chilopoda.",
            "They are called hundred leggers.",
            "Each trunk segment carries ONE pair of",
            "clawed appendages.",
            "The first pair of trunk appendages is",
            "modified into poison claws.",
            "Centipedes are carnivorous.",
            "Examples: Scolopendra, Scutigera.",
        ],
            "One pair of legs on each segment gives a long stride and a fast animal, which suits a group that catches live prey.",
            [
                "Giving the centipede two pairs of legs per segment. That is the millipede.",
                "Writing that centipedes eat plants. They are carnivorous.",
            ],
            "Chilopoda: one pair per segment, poison claws in front, feeds on other animals.",
            "Class, legs per segment, poison claws, food, examples. One line each."),
        step("s3_millipede", "text", "Millipede", 1, "Millipede", [
            "Millipedes belong to the class Diplopoda.",
            "They are called thousand leggers.",
            "Each trunk segment carries TWO pairs of",
            "appendages.",
            "Poison claws are absent.",
            "Millipedes are herbivorous.",
            "Examples: Spirostreptus, Julus.",
        ],
            "Diplo means double, so the name of the class itself records the two pairs of legs on each segment.",
            [
                "Giving the millipede poison claws. Poison claws are found only in the centipede.",
                "Writing that millipedes are carnivorous. They are herbivorous.",
            ],
            "Diplopoda: diplo means double, so two pairs per segment, no poison claws, feeds on plants.",
            "The same five points as the centipede, in the same order, so the two columns line up."),
        step("s4_differences", "boxed_final", "The key differences", 1, "Key differences", [
            boxed("Chilopoda: 1 pair per segment · Diplopoda: 2"),
            "The three differences that decide the",
            "answer:",
            "1) Legs: the centipede has one pair per",
            "segment, the millipede two pairs.",
            "2) Poison claws: present in the centipede,",
            "absent in the millipede.",
            "3) Food: the centipede is carnivorous, the",
            "millipede is herbivorous.",
        ],
            "Three differences are enough for four marks, and the number of leg pairs is the one that names the two classes, so it is written first.",
            [
                "Listing only the number of legs. Give the poison claws and the food as well.",
                "Writing the differences as loose sentences. A comparison is marked as a table, one row per point.",
            ],
            "Chilo is one pair, Diplo is two pairs. Then claws, then food.",
            "If there is room, draw this as a two-column table — the examiner is ticking rows."),
    ],
    "Compare questions are marked row by row, so a two-column table with the same headings on both sides scores faster than two paragraphs.",
))


def main():
    bad = []
    for q in CARDS:
        tot = sum(s["marks"] for s in q["answer"]["steps"])
        if tot != q["marks_total"]:
            bad.append(f'{q["question_id"]}: steps sum {tot} != {q["marks_total"]}')
        sp = sum(s["marks"] for s in q["mark_split"])
        if sp != q["marks_total"]:
            bad.append(f'{q["question_id"]}: split sum {sp} != {q["marks_total"]}')
        if len(q["answer"]["steps"]) > 5:
            bad.append(f'{q["question_id"]}: {len(q["answer"]["steps"])} steps (SAQ allows 2-5)')
        for s in q["answer"]["steps"]:
            for ln in s.get("lines", []) or []:
                t = ln if isinstance(ln, str) else ln["text"]
                if len(t) > 52:
                    bad.append(f'{q["question_id"]}/{s["id"]}: line {len(t)} "{t}"')
            if not s.get("why") or not s.get("common_mistakes") or not s.get("memory_tip") or not s.get("margin_note"):
                bad.append(f'{q["question_id"]}/{s["id"]}: missing rail field')
            if s["marks"] > 0 and not s.get("mark_note"):
                bad.append(f'{q["question_id"]}/{s["id"]}: missing mark_note')
            if s["marks"] == 0 and s.get("mark_note"):
                bad.append(f'{q["question_id"]}/{s["id"]}: mark_note at 0 marks')
        p = os.path.join(OUT, q["question_id"] + ".json")
        with io.open(p, "w", encoding="utf-8") as fh:
            json.dump(q, fh, ensure_ascii=False, indent=2)
            fh.write("\n")
    print(f"wrote {len(CARDS)} SAQ cards")
    if bad:
        print("PROBLEMS:")
        for b in bad:
            print("  " + b)
    else:
        print("author-side checks clean")


if __name__ == "__main__":
    main()
