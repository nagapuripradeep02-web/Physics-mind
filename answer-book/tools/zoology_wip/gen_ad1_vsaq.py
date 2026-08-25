# -*- coding: utf-8 -*-
"""Unit 3 — Animal Diversity-I (Zoology): the 18 VSAQ cards, book qno 89-106.

Source: Sri Chaitanya Junior Fastrack zoology, VSAQ chapter "14. ANIMAL
DIVERSITY-I", book pp.53-54 (PDF 52-53). Walked boundary to boundary:
the previous chapter closes with VSAQ 88 (white vs grey matter) and the next
chapter opens with VSAQ 107 (characters shared by chordates and echinoderms).
"""
import json, io, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'questions')
OUT = os.path.abspath(OUT)

UNIT = {"number": 3, "name": "Animal Diversity-I (Zoology)"}
CHAPTER = "Animal Diversity-I"

NOTE_BASE = (
    "Sourced from the Sri Chaitanya Junior Fastrack zoology section "
    "(book p.{page}, VSAQ {qno}). Zoology holds only ONE source book — the "
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


def bare(y):
    return {"year": y}


def card(qid, qno, page, text, appearances, split, steps, insider, extra_note=""):
    note = NOTE_BASE.format(page=page, qno=qno)
    if extra_note:
        note += " " + extra_note
    q = {
        "schema_version": "answer_book_v1",
        "question_id": qid,
        "board": "ts_ipe",
        "board_label": "Telangana — Board of Intermediate Education",
        "subject": "zoology",
        "year_cycle": "first_year",
        "class_label": "Intermediate I Year (Class 11)",
        "unit": UNIT,
        "chapter": CHAPTER,
        "qtype": "VSAQ",
        "marks_total": 2,
        "paper_section": "Section A",
        "expected_time_min": 4,
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
                "Section A — Very Short Answer Question",
                "Animal Diversity-I (Zoology) · 2 marks",
            ],
            "steps": steps,
        },
        "insider_note": insider,
    }
    return q


def step(sid, kind, label, marks, mark_note, lines, why, cm, tip, margin):
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
    s["lines"] = lines
    return s


def boxed(t):
    return {"text": t, "style": "boxed"}


CARDS = []

# ── 89 ────────────────────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_sponge_canal_system_functions", 89, 53,
    "What are the functions of the canal system of sponges?",
    [ts(2022)],
    [{"label": "Water current", "marks": 1}, {"label": "Functions", "marks": 1}],
    [
        step("s1_water_path", "text", "The water current", 1, "Water current", [
            "The canal system is the network of pores and",
            "canals through which water flows through the",
            "body of a sponge.",
            "Water enters through the ostia, passes into",
            "the spongocoel, and leaves through the",
            "osculum.",
        ],
            "Every function of the canal system is carried out by the one water current that runs through it, so the path of the water is written first.",
            [
                "Writing that the water leaves through the ostia. Water enters by the ostia and leaves by the osculum.",
                "Calling the canal system a digestive system. It is a water current system.",
            ],
            "One current, three jobs: in through the ostia, out through the osculum.",
            "Name the parts of the water path first. Three short lines."),
        step("s2_functions", "boxed_final", "The three functions", 1, "Functions", [
            boxed("Nutrition · Respiration · Excretion"),
            "1) Nutrition: the current brings in food",
            "particles, which the choanocytes take up.",
            "2) Respiration: oxygen dissolved in the water",
            "is taken up and carbon dioxide is given out.",
            "3) Excretion: the outgoing current carries",
            "away the nitrogenous waste.",
            "The same current also carries out the sperms",
            "and the larvae at the breeding season.",
        ],
            "One current does three different things depending on what is taken from it or added to it, which is why a single structure answers three functions.",
            [
                "Giving only one function. The question asks for the functions, so name all three.",
                "Writing that the sponge pumps water with muscles. The flagella of the choanocytes drive the current.",
            ],
            "Food in, gases exchanged, waste out — all on the same stream of water.",
            "Three numbered functions, one line each. Name the process beside each one."),
    ],
    "Two marks for three functions, so the examiner is ticking the words nutrition, respiration and excretion — write all three even if the third takes only four words.",
))

# ── 90 ────────────────────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_metagenesis", 90, 53,
    "What is metagenesis? Animals belonging to which phylum exhibit metagenesis?",
    [ap(2018)],
    [{"label": "Definition", "marks": 1}, {"label": "Phylum", "marks": 1}],
    [
        step("s1_definition", "text", "What metagenesis is", 1, "Definition", [
            "Metagenesis is the alternation of an asexual",
            "phase and a sexual phase in the life cycle of",
            "an animal.",
            "The asexual polyp produces medusae by budding.",
            "The sexual medusa produces the gametes.",
        ],
            "Each phase is named by the kind of reproduction it carries out, so the definition is complete only when both the asexual and the sexual generation are stated.",
            [
                "Writing only 'alternation of generations'. Say which phase is asexual and which is sexual.",
                "Calling it metamorphosis. Metamorphosis is a change of form within one animal; metagenesis is an alternation of two generations.",
            ],
            "Polyp buds, medusa makes gametes — the two phases follow each other.",
            "One sentence of definition, then name the two phases. Three lines."),
        step("s2_phylum", "boxed_final", "The phylum", 1, "Phylum", [
            boxed("Phylum Cnidaria shows metagenesis"),
            "Animals of the phylum Cnidaria show",
            "metagenesis.",
            "Example: Obelia. Its fixed polyp colony buds",
            "off free-swimming medusae, and the medusae",
            "produce the gametes.",
        ],
            "Only an animal that has two body forms can alternate them, and the polyp and the medusa are the two body forms of a cnidarian.",
            [
                "Naming Porifera. Sponges have no medusa, so they show no metagenesis.",
                "Leaving out the example. One named animal is expected.",
            ],
            "Two body forms, so two generations: only Cnidaria has both a polyp and a medusa.",
            "Name the phylum and give one example. Keep it to three lines."),
    ],
    "The mark for the phylum is lost more often than the mark for the definition — write the word Cnidaria plainly, and add Obelia beside it.",
))

# ── 91 ────────────────────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_flame_cells", 91, 53,
    "What are the excretory cells of flatworms called? What is the other important function of these specialized cells?",
    [],
    [{"label": "Flame cells", "marks": 1}, {"label": "Other function", "marks": 1}],
    [
        step("s1_name", "text", "The excretory cells", 1, "Flame cells", [
            "The excretory cells of flatworms are called",
            "flame cells or solenocytes.",
            "A flame cell is a hollow cell with a tuft of",
            "cilia inside it.",
            "The beating cilia look like a flame, and that",
            "is how the cell got its name.",
            "Groups of flame cells open into fine tubes",
            "called protonephridia.",
        ],
            "The name records what is seen down a microscope, a moving tuft of cilia, so the structure and the name are learnt together.",
            [
                "Calling them nephridia. Nephridia belong to annelids; flatworms have protonephridia built from flame cells.",
                "Writing that flame cells are found in roundworms. They belong to the flatworms.",
            ],
            "Flat worm, flame cell. The tuft of cilia inside is the flame.",
            "Give the name, then one line on what the cell looks like."),
        step("s2_function", "boxed_final", "The other function", 1, "Other function", [
            boxed("Excretion and osmoregulation"),
            "Besides excretion, flame cells carry out",
            "osmoregulation.",
            "They drive out the excess water and keep the",
            "amount of water and salts in the body steady.",
        ],
            "A flatworm has no other route by which water can leave the body, so the same cilia that drive out the waste also drive out the extra water.",
            [
                "Writing respiration as the second function. Flatworms exchange gases through the body surface.",
                "Answering only 'excretion'. The question asks for the OTHER function.",
            ],
            "Two jobs, one cell: waste out and water balance.",
            "Name the second function and say in one line what it means."),
    ],
    "The question already gives away the first half, so the mark that decides this answer is the word osmoregulation.",
))

# ── 92 ────────────────────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_amphids_vs_phasmids", 92, 53,
    "Distinguish between amphids and phasmids.",
    [ts(2019), ap(2019), ap(2022)],
    [{"label": "Amphids", "marks": 1}, {"label": "Phasmids", "marks": 1}],
    [
        step("s1_amphids", "text", "Amphids", 1, "Amphids", [
            "Amphids are a pair of sense organs in the head",
            "region of nematodes.",
            "Each amphid is a small pit in the cuticle,",
            "placed near the mouth.",
            "They are chemoreceptors, so they detect the",
            "chemicals around the animal.",
        ],
            "The two organs are told apart by position first, one at the front and one at the tail, and only after that by what each one does.",
            [
                "Writing that amphids are glands. They are cuticular pits that work as sense organs.",
                "Placing amphids at the tail end. They lie near the mouth.",
            ],
            "Amphids are at the anterior end; phasmids are at the posterior end.",
            "Position, structure, function. Two or three lines."),
        step("s2_phasmids", "boxed_final", "Phasmids", 1, "Phasmids", [
            boxed("Amphids: front, sensory · Phasmids: hind, glands"),
            "Phasmids are a pair of unicellular glands in",
            "the tail region of some nematodes.",
            "They are glandulo-sensory organs, that is,",
            "they are both glandular and sensory.",
            "Nematodes that have phasmids are placed in",
            "the class Phasmidia, and those without them",
            "in Aphasmidia.",
        ],
            "The presence of phasmids splits the whole phylum into two classes, which is why the small gland is worth a name of its own.",
            [
                "Placing phasmids at the head end. They lie in the tail region.",
                "Writing that both are pits. Amphids are cuticular pits; phasmids are glands.",
            ],
            "A-phasmid-ia means without phasmids, so the name of the class states the difference.",
            "One boxed contrast line, then the phasmid's own facts."),
    ],
    "This is a two-column question in disguise, so the safest layout is a small table: position, structure, function, one row each.",
))

# ── 93 ────────────────────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_botryoidal_tissue", 93, 53,
    "What is botryoidal tissue?",
    [],
    [{"label": "What it is", "marks": 1}, {"label": "Functions", "marks": 1}],
    [
        step("s1_what", "text", "What it is", 1, "What it is", [
            "Botryoidal tissue is a tissue found only in",
            "leeches.",
            "In a leech the coelom is reduced to narrow",
            "channels, and this tissue fills the space",
            "around them.",
            "Its brown cells lie in rounded clusters.",
            "Botryoidal means grape-like.",
        ],
            "The tissue is defined by where it lies, because the leech coelom is reduced to channels and this tissue is what fills the rest of that space.",
            [
                "Naming it for the earthworm. Botryoidal tissue is characteristic of leeches.",
                "Writing that it lies in the gut. It lies in the coelomic space.",
            ],
            "Leech only. Botryoidal means grape-like, and the cells lie in clusters.",
            "Which animal, where it lies, what it looks like. Three or four lines."),
        step("s2_functions", "boxed_final", "Its functions", 1, "Functions", [
            boxed("Excretion · storage · new blood channels"),
            "Its functions are:",
            "1) Excretion of nitrogenous waste.",
            "2) Storage of iron and calcium.",
            "3) Formation of new blood channels in a part",
            "of the body that has been injured.",
        ],
            "The tissue lies in the coelomic channels themselves, which is why it can both clear waste from them and rebuild them after an injury.",
            [
                "Giving only excretion. Three functions are expected for the full mark.",
                "Writing that it stores food. It stores iron and calcium.",
            ],
            "Three jobs: clears waste, stores iron and calcium, rebuilds channels.",
            "Three numbered functions, one line each."),
    ],
    "A short question with a long answer — the second mark is for the list of three functions, not for a longer description of the tissue.",
))

# ── 94 ────────────────────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_living_fossil_arthropod", 94, 53,
    "Which arthropod is called a 'living fossil'? Name its respiratory organs.",
    [ap(2015), ap(2016), ap(2018)],
    [{"label": "The animal", "marks": 1}, {"label": "Respiratory organs", "marks": 1}],
    [
        step("s1_animal", "text", "The living fossil", 1, "The animal", [
            "Limulus, the king crab, is the arthropod",
            "called a living fossil.",
            "It belongs to the subphylum Chelicerata.",
            "It is called a living fossil because it has",
            "changed very little from its fossil ancestors,",
            "and its close relatives are all extinct.",
        ],
            "A living fossil is defined by the comparison with its own fossils, so the reason has to be written and not only the name.",
            [
                "Naming the cockroach. The living fossil arthropod is Limulus.",
                "Writing only the name. One line of reason is expected as well.",
            ],
            "Limulus, the king crab: an old design that is still alive.",
            "Name the animal, then one line saying why it carries the name."),
        step("s2_respiration", "boxed_final", "Its respiratory organs", 1, "Respiratory organs", [
            boxed("Limulus — respires by book gills"),
            "The respiratory organs of Limulus are book",
            "gills.",
            "They are flat plates of gill tissue stacked",
            "one over another like the pages of a book,",
            "and they lie on the abdominal appendages.",
            "Limulus is aquatic, so its book gills take up",
            "the oxygen dissolved in the water.",
        ],
            "The name of the organ describes its shape, so a student who pictures a stack of plates will not confuse book gills with the tracheae of an insect.",
            [
                "Writing book lungs. Book lungs are aerial and belong to the scorpion; Limulus is aquatic and has book gills.",
                "Writing gills alone. The organ has a name of its own: book gills.",
            ],
            "Limulus lives in water, so gills. The scorpion lives on land, so lungs.",
            "Name the organ, then one line on where it lies. Two or three lines."),
    ],
    "Both halves of this question are one word each, so nothing is gained by writing more — but 'gills' without the word 'book' has cost students the second mark.",
))

# ── 95 ────────────────────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_radula_function", 95, 53,
    "What is the function of radula? Give the name of the group of molluscs which do not possess a radula.",
    [ap(2019), bare(2014)],
    [{"label": "Function", "marks": 1}, {"label": "Group without it", "marks": 1}],
    [
        step("s1_function", "text", "Function of the radula", 1, "Function", [
            "The radula is a ribbon of chitinous teeth in",
            "the buccal cavity of most molluscs.",
            "It is a rasping organ used for feeding.",
            "It scrapes food off a surface and carries the",
            "scraped particles back into the gut.",
        ],
            "The radula scrapes rather than bites, which is why the molluscs that use it feed on films of algae and not on large pieces of food.",
            [
                "Calling the radula a tongue. It is a toothed rasping ribbon, not a muscular tongue.",
                "Writing that it grinds food in the stomach. It works at the mouth, in the buccal cavity.",
            ],
            "Radula rasps: a ribbon of teeth that scrapes food off a surface.",
            "Say what it is and what it does. Two or three lines."),
        step("s2_absent", "boxed_final", "The group without a radula", 1, "Group without it", [
            boxed("Radula is absent in class Bivalvia"),
            "The radula is absent in the class Bivalvia,",
            "also called Pelecypoda.",
            "Bivalves are filter feeders. They strain food",
            "particles from the water with their gills, so",
            "no rasping organ is present.",
            "Examples: Unio, Pinctada (pearl oyster).",
        ],
            "The radula scrapes and the gill strains, so the animal that filters its food is the one that does without a radula.",
            [
                "Naming Gastropoda. Snails have a well developed radula; it is the bivalves that lack one.",
                "Writing 'oysters'. Name the class: Bivalvia or Pelecypoda.",
            ],
            "Bivalves filter with their gills, so they need no rasping ribbon.",
            "Name the class, then one line on why it does without a radula."),
    ],
    "Write both names for the class, Bivalvia and Pelecypoda, because different question papers have used each of them.",
))

# ── 96 ────────────────────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_aristotles_lantern", 96, 53,
    "What is Aristotle's lantern? Give one example of an animal possessing it.",
    [ap(2017), ts(2017), ap(2022), ts(2020)],
    [{"label": "What it is", "marks": 1}, {"label": "Example", "marks": 1}],
    [
        step("s1_what", "text", "What it is", 1, "What it is", [
            "Aristotle's lantern is the masticatory",
            "apparatus in the buccal cavity of a sea",
            "urchin.",
            "It is made of five calcareous jaws, each",
            "carrying one tooth, held together by muscles",
            "and ossicles.",
            "The five teeth meet at the mouth and scrape",
            "algae off the rock.",
        ],
            "The apparatus is named by its jaw count, so five jaws is the fact that carries the mark.",
            [
                "Giving the number of jaws as three. Three jaws belong to the pedicellariae; the lantern has five.",
                "Writing that it lies in the stomach. It lies in the buccal cavity, at the mouth.",
            ],
            "Five jaws matches the five-part symmetry of the echinoderm body.",
            "Say what it is, how many jaws it has, and where it lies."),
        step("s2_example", "boxed_final", "One example", 1, "Example", [
            boxed("Five jaws · Example: Echinus (sea urchin)"),
            "Example: Echinus, the sea urchin.",
            "It is present in sea urchins.",
            "It is absent in the heart urchin",
            "(Echinocardium) and in the sand dollar",
            "(Echinodiscus).",
        ],
            "The lantern is present only in the urchins that scrape hard surfaces, which is why the burrowing heart urchin and sand dollar do without it.",
            [
                "Naming a starfish. The lantern belongs to the sea urchins, class Echinoidea.",
                "Writing that every echinoid has one. The heart urchin and the sand dollar do not.",
            ],
            "Lantern goes with Echinoidea, and Echinus is the named example.",
            "One example is asked for. Add the two echinoids that lack it if there is room."),
    ],
    "The examiner is looking for two words, five-jawed and sea urchin; the name Echinus alone has earned the second mark.",
))

# ── 97 ────────────────────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_echinoderm_larva_symmetry", 97, 53,
    "What is the essential difference between the larvae and adults of echinoderms, symmetry wise?",
    [ts(2016)],
    [{"label": "The larva", "marks": 1}, {"label": "The adult", "marks": 1}],
    [
        step("s1_larva", "text", "The larva", 1, "The larva", [
            "The larva of an echinoderm is bilaterally",
            "symmetrical.",
            "It is small, free-swimming and lives in the",
            "plankton.",
            "Example: the bipinnaria larva of a starfish.",
        ],
            "The larva keeps the older symmetry of the group, so it is the larva and not the adult that shows where echinoderms belong in classification.",
            [
                "Writing that the larva is radial. Only the adult is radial.",
                "Writing that the larva is fixed to the bottom. The larva swims freely.",
            ],
            "Swimming larva is bilateral; settled adult is radial.",
            "One line for the symmetry and one for the habit."),
        step("s2_adult", "boxed_final", "The adult", 1, "The adult", [
            boxed("Larva bilateral · Adult pentamerous radial"),
            "The adult echinoderm is radially symmetrical.",
            "Its symmetry is pentamerous, that is, the",
            "body is built on five parts around a central",
            "axis.",
            "The radial symmetry is acquired later and is",
            "not the original symmetry of the group.",
            "This is why echinoderms are grouped with the",
            "bilaterally symmetrical animals.",
        ],
            "The adult settles on the sea bottom, where food can arrive from any direction, and a body built on five parts round an axis suits that position.",
            [
                "Writing radial alone. The adult symmetry is pentamerous radial symmetry.",
                "Writing that both stages have the same symmetry. The change of symmetry is the whole point of the question.",
            ],
            "Bilateral first, radial second — the five-part radial form comes later.",
            "The boxed contrast is the answer. Add the word pentamerous, it carries the mark."),
    ],
    "The word pentamerous is what separates a full answer from a half one — 'radial' on its own is only part of the adult's symmetry.",
))

# ── 98 ────────────────────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_cnidarian_body_forms", 98, 54,
    "What are the two chief morphological 'body forms' of cnidarians? What are their chief functions?",
    [ap(2019)],
    [{"label": "Polyp", "marks": 1}, {"label": "Medusa", "marks": 1}],
    [
        step("s1_polyp", "text", "The polyp", 1, "Polyp", [
            "The two body forms of cnidarians are the",
            "polyp and the medusa.",
            "1) Polyp: a cylindrical form fixed to the",
            "substratum, with the mouth and the tentacles",
            "turned upwards.",
            "Its chief function is nutrition.",
            "It reproduces asexually, by budding.",
            "Example: Hydra.",
        ],
            "Each form is built for the work it does, and the fixed polyp is the form that feeds where it is attached.",
            [
                "Writing that the polyp swims. The polyp is fixed to the substratum.",
                "Giving the shape without the function. The question asks for both.",
            ],
            "Polyp is fixed and feeds. Medusa floats and forms gametes.",
            "Name the form, its shape, its chief function, one example. Keep each to a line."),
        step("s2_medusa", "boxed_final", "The medusa", 1, "Medusa", [
            boxed("Polyp: nutrition · Medusa: reproduction"),
            "2) Medusa: an umbrella-shaped, free-swimming",
            "form, with the mouth and the tentacles",
            "hanging downwards.",
            "Its chief function is sexual reproduction.",
            "Example: Aurelia, the jelly fish.",
        ],
            "The medusa swims away from the parent colony, so the gametes it makes are shed at a distance from where the polyp stands.",
            [
                "Swapping the two functions. The polyp feeds; the medusa reproduces sexually.",
                "Writing that the medusa is attached. The medusa is free-swimming.",
            ],
            "Umbrella hangs mouth-down and drifts; the cylinder stands mouth-up and feeds.",
            "One boxed contrast line, then the medusa's own facts."),
    ],
    "Four things are asked for in one 2-mark question — two forms and two functions — so a table of two rows is the fastest safe layout.",
))

# ── 99 ────────────────────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_nereis_parapodia", 99, 54,
    "What do you call the locomotor structures of Nereis? Why is Nereis called a polychaete?",
    [],
    [{"label": "Parapodia", "marks": 1}, {"label": "Why a polychaete", "marks": 1}],
    [
        step("s1_parapodia", "text", "The locomotor structures", 1, "Parapodia", [
            "The locomotor structures of Nereis are called",
            "parapodia. One is a parapodium.",
            "A parapodium is a flat, paired outgrowth on",
            "the side of every body segment.",
            "The parapodia are used for swimming and for",
            "crawling.",
            "They are thin and hold many blood vessels, so",
            "they also take part in respiration.",
        ],
            "The parapodium is a flap of the body wall itself, which is why one organ can serve both for movement and for the exchange of gases.",
            [
                "Writing setae. The setae are carried ON the parapodia; the locomotor organ is the parapodium.",
                "Writing that parapodia are present on a few segments only. They are present on every segment.",
            ],
            "Para-podium means side-foot: a foot on the side of each segment.",
            "Name the organ, say where it lies and what it does. Three or four lines."),
        step("s2_why_polychaete", "boxed_final", "Why it is a polychaete", 1, "Why a polychaete", [
            boxed("Poly = many, chaeta = seta"),
            "Nereis is called a polychaete because every",
            "parapodium bears many chitinous setae.",
            "Poly means many and chaeta means seta, so the",
            "name records the large number of setae.",
            "An earthworm has only a few setae in each",
            "segment, and it is therefore an oligochaete.",
        ],
            "The class name is a count of setae, so the answer is complete only when the number of setae per segment is stated.",
            [
                "Writing that the setae lie on the body wall. In Nereis they are carried on the parapodia.",
                "Answering 'many setae' alone. Say that they are borne on the parapodia of every segment.",
            ],
            "Poly-chaeta is many setae; oligo-chaeta is few setae. Count the setae, name the class.",
            "Explain the class name from the word itself. Two or three lines."),
    ],
    "The second mark is for taking the word apart — poly and chaeta — so write the meaning of the name, not just the fact that setae are present.",
))

# ── 100 ───────────────────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_scorpion_cephalic_appendages", 100, 54,
    "What do you call the first and second pairs of cephalic appendages of a scorpion?",
    [ts(2022)],
    [{"label": "First pair", "marks": 1}, {"label": "Second pair", "marks": 1}],
    [
        step("s1_first", "text", "The first pair", 1, "First pair", [
            "The prosoma of a scorpion carries six pairs of",
            "appendages.",
            "The first pair are the chelicerae.",
            "They are small and pincer-like, and they tear",
            "the food before it is taken in.",
        ],
            "The two pairs are named in the order in which they lie from the front of the animal, so counting back from the mouth keeps them in the right order.",
            [
                "Calling the first pair antennae. Chelicerates have no antennae.",
                "Writing that the chelicerae are the large pincers. The large pincers are the pedipalps.",
            ],
            "Small pincers first (chelicerae), big pincers second (pedipalps).",
            "Name the pair and add one line on what it does."),
        step("s2_second", "boxed_final", "The second pair", 1, "Second pair", [
            boxed("First: chelicerae · Second: pedipalps"),
            "The second pair are the pedipalps.",
            "They are large pincers used to catch and hold",
            "the prey.",
            "The remaining four pairs are the walking legs.",
        ],
            "The pedipalps are the pair that reaches the prey first, which is why they are the largest appendages on the body.",
            [
                "Writing walking legs. The walking legs are the third to the sixth pairs.",
                "Naming only one of the two pairs. Both are asked for.",
            ],
            "Six pairs on the prosoma: chelicerae, pedipalps, then four pairs of legs.",
            "Two names is the whole answer. Two short lines each is enough."),
    ],
    "Two names carry the two marks; the sentence on what each pair does is what saves you if one name is misspelt.",
))

# ── 101 ───────────────────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_limulus_palamnaeus_respiration", 101, 54,
    "What are the respiratory structures of Limulus and Palamnaeus respectively?",
    [ts(2019)],
    [{"label": "Limulus", "marks": 1}, {"label": "Palamnaeus", "marks": 1}],
    [
        step("s1_limulus", "text", "Limulus", 1, "Limulus", [
            "Limulus, the king crab, is aquatic.",
            "Its respiratory organs are book gills.",
            "They are plates of gill tissue stacked one",
            "over another on the abdominal appendages,",
            "and they take up the oxygen dissolved in the",
            "water.",
        ],
            "The habitat decides the organ, so both halves of this answer follow from where each animal lives.",
            [
                "Writing book lungs for Limulus. Limulus is aquatic, so it has book gills.",
                "Writing gills alone. The organ has a name of its own: book gills.",
            ],
            "Water animal, book gills. Land animal, book lungs. Both are stacks of plates.",
            "Habitat, then organ. Two lines."),
        step("s2_palamnaeus", "boxed_final", "Palamnaeus", 1, "Palamnaeus", [
            boxed("Limulus: book gills · Palamnaeus: book lungs"),
            "Palamnaeus, the scorpion, is terrestrial.",
            "Its respiratory organs are book lungs.",
            "They are plates stacked inside pockets of the",
            "abdomen, and they take up oxygen from air.",
        ],
            "A gill collapses in air and a lung dries in water, so the same stacked-plate design is placed outside the body in one animal and inside a pocket in the other.",
            [
                "Writing tracheae for the scorpion. Tracheae are found in some spiders; the scorpion has book lungs.",
                "Giving one organ for both animals. The question asks for them respectively.",
            ],
            "Both are chelicerates and both use stacked plates; only the habitat differs.",
            "The word respectively means the order matters. Keep Limulus first."),
    ],
    "The word 'respectively' is the trap — an answer that names both organs but pairs them the wrong way round scores nothing.",
))

# ── 102 ───────────────────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_antennae_chelicerata", 102, 54,
    "What are antennae? What is the arthropod group without antennae?",
    [],
    [{"label": "Antennae", "marks": 1}, {"label": "Group without them", "marks": 1}],
    [
        step("s1_antennae", "text", "What antennae are", 1, "Antennae", [
            "Antennae are the paired, jointed sense organs",
            "borne on the head of an arthropod.",
            "They carry receptors for touch and for smell,",
            "so they are tactile and chemoreceptive.",
            "Insects and myriapods have one pair.",
            "Crustaceans have two pairs, the antennules",
            "and the antennae.",
        ],
            "The antenna is a head appendage that took up a sensory job, which is why the number of pairs differs from one arthropod class to another.",
            [
                "Writing that antennae are only for touch. They also carry receptors for smell.",
                "Giving crustaceans one pair. Crustaceans have two pairs.",
            ],
            "Antennae are jointed sense organs on the head: touch and smell.",
            "What they are and what they do. Two or three lines."),
        step("s2_group", "boxed_final", "The group without antennae", 1, "Group without them", [
            boxed("Subphylum Chelicerata has no antennae"),
            "The subphylum Chelicerata has no antennae.",
            "In a chelicerate the first pair of head",
            "appendages is the chelicerae, not antennae.",
            "Examples: Limulus (king crab), Palamnaeus",
            "(scorpion), Aranea (spider).",
        ],
            "The name of the subphylum states the answer, because the place an antenna would occupy is already taken by the chelicera.",
            [
                "Naming Crustacea. Crustaceans have two pairs of antennae, the largest number in the phylum.",
                "Writing 'spiders'. Name the whole group: subphylum Chelicerata.",
            ],
            "Chelicerata is named after its first appendage, the chelicera — so there is no antenna.",
            "Name the group and give one example. Three lines."),
    ],
    "Answering 'spiders' instead of Chelicerata is the common half-answer here — the examiner wants the name of the group.",
))

# ── 103 ───────────────────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_ctenidium_osphradium", 103, 54,
    "What is the other name for the gill of a mollusc? What is the function of osphradium?",
    [],
    [{"label": "Ctenidium", "marks": 1}, {"label": "Osphradium", "marks": 1}],
    [
        step("s1_ctenidium", "text", "The gill of a mollusc", 1, "Ctenidium", [
            "The gill of a mollusc is called a ctenidium.",
            "It lies in the mantle cavity.",
            "It has a central axis with rows of flat",
            "filaments on either side of it, so it is",
            "comb-like in shape.",
        ],
            "The gill is named after its shape, and the comb shape is what gives it the large surface the animal needs for the exchange of gases.",
            [
                "Writing 'gill'. The question asks for the OTHER name, which is ctenidium.",
                "Placing it outside the shell. The ctenidium lies inside the mantle cavity.",
            ],
            "Cteno means comb: the ctenidium is the comb-shaped gill.",
            "Give the name, where it lies, and its shape. Three lines."),
        step("s2_osphradium", "boxed_final", "Function of the osphradium", 1, "Osphradium", [
            boxed("Ctenidium = gill · Osphradium = water tester"),
            "The osphradium is a chemoreceptor lying at",
            "the base of the ctenidium, in the mantle",
            "cavity.",
            "It tests the water that enters the mantle",
            "cavity.",
            "It judges the chemical nature of that water",
            "and the amount of silt in it.",
            "It is present in gastropods and bivalves.",
        ],
            "The osphradium sits in the path of the incoming water, which is why it can test that water before the water reaches the gill.",
            [
                "Calling the osphradium a gill. It is a sense organ beside the gill.",
                "Writing that it helps in respiration. It is a chemoreceptor; the ctenidium does the respiration.",
            ],
            "The osphradium tests the water first; the ctenidium breathes it second.",
            "Say where it sits and what it tests. Three or four lines."),
    ],
    "Two separate one-word facts carry these two marks — ctenidium, and 'tests the incoming water'; there is nothing else the examiner is looking for.",
))

# ── 104 ───────────────────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_spermathecae_pheretima", 104, 54,
    "What are spermathecae on the body of Pheretima?",
    [],
    [{"label": "What they are", "marks": 1}, {"label": "What they do", "marks": 1}],
    [
        step("s1_what", "text", "What they are", 1, "What they are", [
            "Spermathecae are the sperm-storing sacs of",
            "Pheretima, the earthworm.",
            "There are four pairs of spermathecae.",
            "They lie one pair each in the 6th, 7th, 8th",
            "and 9th segments.",
            "Each pair opens to the outside on the ventral",
            "side of its segment.",
        ],
            "The sacs open to the outside, which is how sperm from another worm can reach them during copulation.",
            [
                "Writing that spermathecae produce sperm. The testes produce sperm; the spermathecae only store it.",
                "Giving the wrong segments. The four pairs lie in segments 6, 7, 8 and 9.",
            ],
            "Four pairs in four segments, 6 to 9. They store, they do not make.",
            "Number and position first. Three or four lines."),
        step("s2_function", "boxed_final", "What they do", 1, "What they do", [
            boxed("Four pairs, in segments 6 to 9"),
            "The earthworm is a hermaphrodite, but",
            "self-fertilisation does not occur.",
            "During copulation two worms exchange sperm.",
            "Each worm receives the other worm's sperm and",
            "stores it in the spermathecae.",
            "The stored sperm is used later to fertilise",
            "the eggs inside the cocoon.",
        ],
            "The sacs hold sperm from a second worm, and that is how an animal with both sets of organs still gets cross-fertilisation.",
            [
                "Writing that the sperm is used at once. It is stored and used later, in the cocoon.",
                "Writing that the worm fertilises its own eggs. The sperm in the spermathecae came from the other worm.",
            ],
            "Received, stored, used later in the cocoon — three stages, in that order.",
            "One line for each stage: exchange, store, use. Do not repeat the positions."),
    ],
    "Segment numbers are marked here — 6, 7, 8, 9 — and an answer that describes the sacs correctly but omits the segments has lost half of it.",
))

# ── 105 ───────────────────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_haemocoel_arthropod", 105, 54,
    "What do you call the perivisceral cavity of an arthropod? Where from is it derived during development?",
    [],
    [{"label": "Haemocoel", "marks": 1}, {"label": "Its origin", "marks": 1}],
    [
        step("s1_name", "text", "The name of the cavity", 1, "Haemocoel", [
            "The perivisceral cavity of an arthropod is",
            "called a haemocoel.",
            "It is the space around the viscera, and it is",
            "filled with blood, that is, with haemolymph.",
            "The organs therefore lie bathed directly in",
            "blood.",
        ],
            "The cavity is named after what fills it, so the word haemocoel already states that blood and not coelomic fluid is inside.",
            [
                "Calling it a true coelom. The true coelom of an arthropod is reduced to small cavities.",
                "Writing that it is filled with coelomic fluid. It is filled with blood.",
            ],
            "Haemo means blood, coel means cavity: a cavity full of blood.",
            "Name the cavity and say what fills it. Three lines."),
        step("s2_origin", "boxed_final", "Where it comes from", 1, "Its origin", [
            boxed("Haemocoel = the blastocoel that persists"),
            "The haemocoel is not a true coelom.",
            "Most of it is formed from the blastocoel,",
            "the cavity of the blastula, which persists",
            "into the adult.",
            "The true coelom is reduced to small spaces",
            "around the gonads and the excretory organs.",
        ],
            "A true coelom is a cavity lined by mesoderm and the blastocoel is not, which is why the arthropod cavity keeps a separate name.",
            [
                "Writing that it is derived from the mesoderm. It is mainly the blastocoel that persists.",
                "Writing that arthropods have no coelom at all. A small true coelom remains around the gonads.",
            ],
            "The embryo's blastocoel never closes, so the adult keeps it as a blood space.",
            "Say what it is NOT, then what it comes from. Three or four lines."),
    ],
    "The second half is the one that is asked and skipped — write the word blastocoel, because 'from the embryo' earns nothing.",
))

# ── 106 ───────────────────────────────────────────────────────────────────────
CARDS.append(card(
    "ts_ipe_z1_ad1_blood_glands_pheretima", 106, 54,
    "What are blood glands in Pheretima?",
    [],
    [{"label": "What they are", "marks": 1}, {"label": "What they make", "marks": 1}],
    [
        step("s1_what", "text", "What they are", 1, "What they are", [
            "Blood glands are small glandular masses in",
            "the body of Pheretima, the earthworm.",
            "They lie in the 4th, 5th and 6th segments.",
        ],
            "The glands sit in three named segments near the front of the worm, and the segment numbers are the part of the answer a paper can mark.",
            [
                "Giving the wrong segments. The blood glands lie in segments 4, 5 and 6.",
                "Confusing them with the spermathecae, which lie in segments 6 to 9.",
            ],
            "Blood glands 4, 5, 6. Spermathecae 6, 7, 8, 9. Keep the two lists apart.",
            "Position is the first mark. Two or three lines."),
        step("s2_function", "boxed_final", "What they make", 1, "What they make", [
            boxed("Segments 4, 5, 6 — they make the blood"),
            "The blood glands produce the blood cells,",
            "that is, the corpuscles of the earthworm.",
            "They also produce the haemoglobin.",
            "In the earthworm the haemoglobin is dissolved",
            "in the plasma. It is not held inside the",
            "blood cells.",
        ],
            "The pigment is dissolved in the plasma and the cells are separate from it, so the gland has to make two separate products.",
            [
                "Writing that earthworm haemoglobin lies inside the corpuscles. It is dissolved in the plasma.",
                "Writing that the glands filter the blood. They produce blood cells and haemoglobin.",
            ],
            "The earthworm's red pigment floats in the plasma, not in the cells.",
            "Two products, then the one line that makes the earthworm different."),
    ],
    "The line examiners look for is that the haemoglobin is dissolved in the plasma — it is the fact that separates the earthworm from a vertebrate.",
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
        for s in q["answer"]["steps"]:
            for ln in s.get("lines", []):
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
    print(f"wrote {len(CARDS)} VSAQ cards")
    if bad:
        print("PROBLEMS:")
        for b in bad:
            print("  " + b)
    else:
        print("author-side checks clean")


if __name__ == "__main__":
    main()
