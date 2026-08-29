# -*- coding: utf-8 -*-
"""Unit 1 - Diversity of Living World (Zoology). Emits 14 VSAQ + 7 SAQ cards,
the manifest fragment, and the one figure (taxonomic hierarchy ladder)."""
import json, os, io, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import figlib as F

QDIR = r"C:\Tutor\physics-mind-ipe-zoology\answer-book\questions"
SCRATCH = r"C:\Users\PRADEEEP\AppData\Local\Temp\claude\C--Tutor-physics-mind\40aee229-2ba0-40be-831f-912f984d9e01\scratchpad\zoology"

UNIT = {"number": 1, "name": "Diversity of Living World (Zoology)"}
CHAPTER = "Diversity of Living World"

BASE = ("Zoology holds only ONE source book \u2014 the TSBIE Basic Learning Material in hand covers "
        "physics only, and no zoology board paper is in the corpus \u2014 so the two-book union check "
        "and the back-test are both structurally impossible for this card; 'not checked' does NOT "
        "mean 'checked and clean'. The mark split is a claim until a Telangana IPE teacher confirms it.")


def note(page, qtag, extra=""):
    s = ("Sourced from the Sri Chaitanya Junior Fastrack zoology section (book p.%s, %s). " % (page, qtag)) + BASE
    if extra:
        s += " " + extra
    return s


def ap(*rows):
    """rows like ('ts',2019) / ('ap',2015) / (None,2014)"""
    out = []
    for b, y in rows:
        e = {"year": y}
        if b:
            e["board"] = "ts_ipe" if b == "ts" else "ap_ipe"
        out.append(e)
    return out


def step(id_, kind, label, marks, mark_note, lines, why, mistakes, tip, margin, figure=None):
    s = {"id": id_, "kind": kind, "label": label, "marks": marks}
    if marks > 0:
        s["mark_note"] = mark_note
    s["why"] = why
    s["common_mistakes"] = mistakes
    s["memory_tip"] = tip
    s["margin_note"] = margin
    if kind == "diagram":
        s["figure"] = figure
    else:
        s["lines"] = lines
    return s


CARDS = []


def card(qid, qtype, qtext, appearances, split, vnote, steps, insider):
    marks = 2 if qtype == "VSAQ" else 4
    sec = "Section A" if qtype == "VSAQ" else "Section B"
    hdr = ("Section A \u2014 Very Short Answer Question" if qtype == "VSAQ"
           else "Section B \u2014 Short Answer Question")
    q = {
        "schema_version": "answer_book_v1",
        "question_id": qid,
        "board": "ts_ipe",
        "board_label": "Telangana \u2014 Board of Intermediate Education",
        "subject": "zoology",
        "year_cycle": "first_year",
        "class_label": "Intermediate I Year (Class 11)",
        "unit": UNIT,
        "chapter": CHAPTER,
        "qtype": qtype,
        "marks_total": marks,
        "paper_section": sec,
        "expected_time_min": 4 if qtype == "VSAQ" else 8,
        "question_text": qtext,
        "appearances": appearances,
        "mark_split": [{"label": a, "marks": b} for a, b in split],
        "verification": {"status": "unverified", "needs_teacher_verification": True, "note": vnote},
        "answer": {
            "page_header": [hdr, "%s \u00b7 %d marks" % (UNIT["name"], marks)],
            "steps": steps,
        },
        "insider_note": insider,
    }
    CARDS.append(q)
    return q


# ==========================================================================
# VSAQ  (book pp.49-50, global qno 59-72)
# ==========================================================================

card("ts_ipe_z1_dlw_iczn_full_form", "VSAQ",
     "What does ICZN stand for?",
     ap(("ap", 2019), ("ts", 2019), ("ts", 2015), ("ts", 2022)),
     [("Full form", 1), ("What the code is used for", 1)],
     note("49", "VSAQ 59",
          "BOOK WORDING: the book writes that the code 'is used to name an identified organism'; the "
          "ICZN governs ANIMAL names only (plant names are governed by the botanical code), and the "
          "card says animals."),
     [
         step("s1_full_form", "text", "The full form", 1, "Full form",
              ["ICZN stands for the International Code of",
               "Zoological Nomenclature."],
              "The four words are the mark: Code says it is a set of rules, and Zoological says the rules cover animals.",
              ["Writing 'Botanical' in place of 'Zoological'. ICBN is the plant code; ICZN is the animal code.",
               "Writing 'Classification' in place of 'Nomenclature'. The code governs naming, not grouping."],
              "Read the letters in order: International, Code, Zoological, Nomenclature.",
              "One line. Write all four words in full; an abbreviation earns nothing."),
         step("s2_use", "boxed_final", "What the code is for", 1, "Use",
              [{"text": "ICZN = the agreed rules for naming animals", "style": "boxed"},
               "It is the agreed set of rules used to give a",
               "scientific name to an identified animal.",
               "The rules stop one animal from being given",
               "different names by different workers."],
              "A code exists so that the same animal is not called by different names in different places, so the second mark is for saying what the rules are for.",
              ["Stopping at the full form. The question carries a second mark for what the code does."],
              "Code means rules: one animal, one accepted scientific name everywhere.",
              "One sentence on what the code is used for. Two lines are enough."),
     ],
     "Both marks are quick ones \u2014 write the full form without a single abbreviation, then one line on what the code is for."),

card("ts_ipe_z1_dlw_biogenesis", "VSAQ",
     "What is biogenesis?",
     ap(("ap", 2018), ("ap", 2022)),
     [("Meaning", 1), ("What it states", 1)],
     note("49", "VSAQ 60",
          "BOOK ERROR: the book calls biogenesis 'a theory of evolution'. It is not a theory of "
          "evolution \u2014 it is the principle that living organisms arise only from pre-existing "
          "living organisms, established against abiogenesis (spontaneous generation) by the "
          "experiments of Redi and Pasteur. The card states it correctly and the book's wording is "
          "recorded in the step's `why`. ADDED BEYOND THE BOOK: the naming of abiogenesis and of "
          "Louis Pasteur is standard and is not printed in this book's answer."),
     [
         step("s1_meaning", "text", "What biogenesis means", 1, "Meaning",
              ["Biogenesis is the principle that a living",
               "organism arises only from another living",
               "organism that already exists.",
               "It is stated in short as 'life begets life',",
               "that is, life comes from life."],
              "The word carries the meaning: bio means life and genesis means origin, so biogenesis is about where a living thing comes from. NOTE: this book calls biogenesis 'a theory of evolution'; it is not one, and the card states it as the principle that living things come only from living things.",
              ["Calling biogenesis a theory of evolution. It is about the origin of a living organism, not about how species change.",
               "Mixing it with abiogenesis, which is the opposite idea that living things arise from non-living matter."],
              "Bio means life and genesis means origin: biogenesis = life from life.",
              "One sentence of meaning plus the short phrase. Two or three lines."),
         step("s2_states", "boxed_final", "What it states", 1, "Statement",
              [{"text": "Living beings come only from living beings", "style": "boxed"},
               "Living organisms are produced from other",
               "living organisms and never from non-living",
               "matter.",
               "This replaced abiogenesis, the older idea that",
               "living things arose from non-living matter.",
               "The experiments of Louis Pasteur supported",
               "biogenesis."],
              "The second mark is for the contrast: biogenesis is only clear against abiogenesis, the idea it replaced.",
              ["Writing that non-living matter can produce living beings. That is abiogenesis, the opposite idea."],
              "Biogenesis and abiogenesis are opposites: 'a' means not, so abiogenesis is life NOT from life.",
              "One line on what it states and one on the opposite idea. Do not write a paragraph."),
     ],
     "The examiner wants the two ideas separated \u2014 say clearly that living things come only from living things, and name abiogenesis as the opposite idea."),

card("ts_ipe_z1_dlw_histology_definition", "VSAQ",
     "Define the term histology. What is it otherwise called?",
     ap(("ap", 2019), ("ap", 2015)),
     [("Definition", 1), ("Other name", 1)],
     note("49", "VSAQ 61",
          "ENUMERATION NOTE: this book files histology under the Diversity of Living World VSAQ "
          "chapter although the topic belongs to Structural Organisation; the card follows the "
          "book's chapter placement so that the global question number and the unit agree."),
     [
         step("s1_definition", "text", "What histology is", 1, "Definition",
              ["Histology is the study of the microscopic",
               "structure of tissues.",
               "It is carried out with a microscope, because",
               "these details cannot be seen with the",
               "unaided eye."],
              "The definition names the level of study \u2014 tissues seen under a microscope \u2014 which is what separates histology from anatomy, the study of parts seen with the unaided eye.",
              ["Writing that histology is the study of cells. That is cytology; histology is the study of tissues.",
               "Writing that histology is the study of organs seen with the unaided eye. That is gross anatomy."],
              "Histo means tissue: histology is tissue study under a microscope.",
              "One sentence. Name tissues and the microscope."),
         step("s2_other_name", "boxed_final", "The other name", 1, "Other name",
              [{"text": "Histology is also called microanatomy", "style": "boxed"},
               "Anatomy is the study of structure seen with",
               "the unaided eye, so the study of structure",
               "seen under a microscope is called",
               "microanatomy."],
              "The second name is the first one explained: micro plus anatomy says exactly what histology does.",
              ["Writing 'micrology' or 'microbiology'. The other name is microanatomy."],
              "Micro plus anatomy: the same subject at a smaller scale.",
              "One word carries this mark. Write microanatomy and one line to justify it."),
     ],
     "The second half is a single word \u2014 microanatomy \u2014 and it is the half most students leave out, so write it even when you are short of time."),

card("ts_ipe_z1_dlw_trinomial_nomenclature", "VSAQ",
     "What is trinomial nomenclature? Give an example.",
     ap(("ap", 2015), ("ts", 2016)),
     [("Definition", 1), ("Example", 1)],
     note("49", "VSAQ 62",
          "ADDED BEYOND THE BOOK: the second example (Corvus splendens splendens) is standard and is "
          "not printed in this book's answer, which gives Homo sapiens sapiens only."),
     [
         step("s1_definition", "text", "What trinomial naming is", 1, "Definition",
              ["Trinomial nomenclature is naming an organism",
               "with three words \u2014 the generic name, the",
               "specific name and the subspecific name.",
               "It is used to name a subspecies, that is, a",
               "population of one species that differs from",
               "the rest of that species."],
              "Binomial naming has two words and stops at the species, so a third word is added only when a named subspecies has to be shown.",
              ["Writing only two words. Two words is binomial naming; trinomial naming has three.",
               "Putting the subspecies name first. The order is genus, species, subspecies."],
              "Tri means three: genus, species, subspecies \u2014 in that order.",
              "One sentence naming the three words in order, then the example."),
         step("s2_example", "boxed_final", "The example", 1, "Example",
              [{"text": "Homo sapiens sapiens", "style": "boxed"},
               "Homo is the generic name, sapiens is the",
               "specific name, and the second sapiens is the",
               "subspecific name.",
               "Another example is Corvus splendens splendens,",
               "the house crow."],
              "Writing the three parts of the name against the three ranks proves that the third word is the subspecies and not a repeat.",
              ["Giving a two-word name as the example. The example must have three words.",
               "Underlining only part of the name. All three words are written in italics, or each is underlined separately."],
              "Homo sapiens sapiens: the last word repeats, and that repeat is the subspecies.",
              "One example is enough. Say which word is which."),
     ],
     "The example carries a full mark, so label which word is the genus, which the species and which the subspecies \u2014 the name written alone earns less."),

card("ts_ipe_z1_dlw_tautonymy", "VSAQ",
     "What is meant by tautonymy? Give two examples.",
     ap(("ap", 2016), ("ap", 2017), ("ts", 2017), ("ts", 2020), ("ts", 2022)),
     [("Definition", 1), ("Two examples", 1)],
     note("49", "VSAQ 63",
          "ADDED BEYOND THE BOOK: the line that tautonymy is allowed in animal naming but not in "
          "plant naming is standard and is not printed in this book's answer."),
     [
         step("s1_definition", "text", "What tautonymy is", 1, "Definition",
              ["Tautonymy is the practice of naming an animal",
               "in which the generic name and the specific",
               "name are the same word.",
               "It is allowed in animal naming under the ICZN."],
              "The definition is about the two words matching, so the test for tautonymy is to read the scientific name and see the same word twice.",
              ["Confusing it with trinomial naming. Tautonymy has two words that are the same, not three words.",
               "Giving a plant example. Tautonymy is not allowed under the plant code, so every example is an animal."],
              "Tauto means same: the same word twice, genus then species.",
              "One sentence, then the two examples. Do not write more."),
         step("s2_examples", "boxed_final", "The two examples", 1, "Examples",
              [{"text": "Naja naja and Axis axis", "style": "boxed"},
               "Naja naja is the Indian cobra.",
               "Axis axis is the spotted deer."],
              "Two examples are asked, so each name is written with the animal it belongs to \u2014 the name alone does not show what it is.",
              ["Giving only one example. The question asks for two."],
              "Naja naja and Axis axis: read each name aloud and the word repeats.",
              "Two names with the animal each one belongs to. Two lines."),
     ],
     "Tautonymy is valid in zoology but not in botany, so a plant example scores nothing \u2014 keep to animals such as Naja naja and Axis axis."),

card("ts_ipe_z1_dlw_protostomia_vs_deuterostomia", "VSAQ",
     "Differentiate between Protostomia and Deuterostomia.",
     ap(("ap", 2022), ("ts", 2017), ("ts", 2018)),
     [("Protostomia", 1), ("Deuterostomia", 1)],
     note("49", "VSAQ 64"),
     [
         step("s1_protostomia", "text", "Protostomia", 1, "Protostomia",
              ["Protostomia:",
               "These are eumetazoans in which the blastopore",
               "of the embryo develops into the mouth.",
               "The anus is formed later, as a new opening.",
               "Examples: Annelida, Arthropoda and Mollusca."],
              "The two groups differ in one event of development \u2014 what the blastopore becomes \u2014 so the answer is that one fact stated twice, once for each group.",
              ["Writing that the blastopore becomes the anus in Protostomia. Proto means first, and the mouth forms first.",
               "Giving Echinodermata as an example. It is a deuterostome."],
              "Proto means first and stoma means mouth: in Protostomia the mouth comes first.",
              "The blastopore fact and the three phyla. Three lines."),
         step("s2_deuterostomia", "boxed_final", "Deuterostomia", 1, "Deuterostomia",
              [{"text": "Deuterostomia: the blastopore becomes the anus", "style": "boxed"},
               "Deuterostomia:",
               "These are eumetazoans in which the anus is",
               "formed from or near the blastopore.",
               "The mouth is formed later, as a new opening.",
               "Examples: Echinodermata, Hemichordata and",
               "Chordata."],
              "Deutero means second, so in this group the mouth is the second opening to form and the blastopore end is left as the anus.",
              ["Swapping the example groups. Chordata, which includes humans, is deuterostome."],
              "Deutero means second: the mouth is the second opening, so the blastopore end becomes the anus.",
              "The same fact reversed, plus the three phyla. Keep both halves the same length."),
     ],
     "Write it as a two-row table \u2014 what the blastopore becomes, then the example phyla \u2014 because a table shows the difference faster than a paragraph."),

card("ts_ipe_z1_dlw_ecological_diversity", "VSAQ",
     "What is ecological diversity? Mention the different types of ecological diversities.",
     [],
     [("Definition", 1), ("Types", 1)],
     note("49", "VSAQ 65",
          "BOOK WORDING: the book defines beta diversity as being 'based on endemic species between "
          "two adjacent ecosystems'; the standard meaning is the change in species composition "
          "between two neighbouring ecosystems, and the card uses that. The book prints no year "
          "citation for this question, so `appearances` is empty."),
     [
         step("s1_definition", "text", "What it is", 1, "Definition",
              ["Ecological diversity is diversity at the level",
               "of ecosystems.",
               "It is the variety of ecosystems present in a",
               "region.",
               "Examples: deserts, rain forests, mangroves,",
               "grasslands and coral reefs."],
              "Diversity is counted at three levels \u2014 genes, species and ecosystems \u2014 and ecological diversity is the highest of the three, so the definition must say ecosystem.",
              ["Writing that ecological diversity is the number of species. That is species diversity; ecological diversity counts ecosystems.",
               "Giving animals as examples. The examples are ecosystems, such as a desert or a mangrove."],
              "Three levels of diversity: genes, species, ecosystems. Ecological diversity is the ecosystem level.",
              "One sentence and two or three examples of ecosystems."),
         step("s2_types", "boxed_final", "The three types", 1, "Types",
              [{"text": "Alpha, beta and gamma diversity", "style": "boxed"},
               "Alpha diversity: the diversity within one",
               "community or ecosystem.",
               "Beta diversity: the change in species between",
               "two neighbouring ecosystems.",
               "Gamma diversity: the total diversity of all",
               "the ecosystems of an ecological region."],
              "The three types are three scales of the same count \u2014 inside one ecosystem, between two of them, and across a whole region \u2014 so keeping that order keeps them apart.",
              ["Mixing beta and gamma. Beta compares two neighbouring ecosystems; gamma covers the whole region."],
              "Alpha inside one, beta between two, gamma across the whole region.",
              "Three names with one line each. This is one mark, so keep the lines short."),
     ],
     "The three Greek names carry this question \u2014 write alpha, beta and gamma with one line each, because a general answer about 'many ecosystems' earns only the first mark."),

card("ts_ipe_z1_dlw_species_richness", "VSAQ",
     "Define species richness.",
     ap(("ts", 2022), ("ap", 2017)),
     [("Definition", 1), ("Species-area relation", 1)],
     note("50", "VSAQ 66",
          "ADDED BEYOND THE BOOK: the line separating species richness from species diversity is "
          "standard and is not printed in this book's answer."),
     [
         step("s1_definition", "text", "What species richness is", 1, "Definition",
              ["Species richness is the number of species",
               "present per unit area.",
               "The more species an area holds, the greater",
               "its species richness."],
              "Species richness is a count and nothing more, so the definition must say number of species and name the area it is counted in.",
              ["Writing that species richness is the same as species diversity. Richness counts species only; diversity also takes in how many individuals each species has.",
               "Leaving out the area. Richness is always a number per unit area."],
              "Rich means how many: species richness is a head count of species in a given area.",
              "One sentence. Name the number and the unit area."),
         step("s2_relation", "equation", "The species-area relation", 1, "Relation",
              ["Species richness rises with the area studied.",
               {"text": "log S = log C + Z log A", "style": "eq"},
               "S = species richness",
               "A = area",
               "Z = slope of the line (regression coefficient)",
               "C = Y-intercept"],
              "The relation between the number of species and the area plots as a straight line on a log scale, so the equation is that straight line written out, with Z as its slope.",
              ["Writing the letters without saying what they stand for. Each symbol carries part of this mark.",
               "Reading Z as the area. Z is the slope of the line; A is the area."],
              "S for species, A for area, Z for the slope of the line joining them.",
              "The equation on its own line, then one short line for each letter."),
     ],
     "Write the species-area equation even though the question only says 'define' \u2014 the book's answer prints it, and the examiner expects every letter to be explained."),

card("ts_ipe_z1_dlw_sacred_groves_india", "VSAQ",
     "List out any four sacred groves in India.",
     [],
     [("What a sacred grove is", 1), ("The four groves", 1)],
     note("50", "VSAQ 67",
          "BOOK vs NCERT: the book places Sarguja and Bastar in Chhattisgarh and Chanda in Madhya "
          "Pradesh. NCERT groups all three (Sarguja, Chanda and Bastar) under Madhya Pradesh, which "
          "was correct before the state was divided in 2000; the card follows the book's current "
          "state boundaries. The book prints no year citation for this question, so `appearances` "
          "is empty."),
     [
         step("s1_meaning", "text", "What a sacred grove is", 1, "Meaning",
              ["Sacred groves are small patches of forest that",
               "local people protect and do not cut.",
               "Every plant and animal inside them is left",
               "undisturbed, so they hold many rare species."],
              "A sacred grove is protected by the people who live beside it rather than by law, which is why these small patches still hold species lost from the land around them.",
              ["Writing that sacred groves are government sanctuaries. They are protected by local communities.",
               "Describing them as large forests. They are small patches."],
              "A grove is a small patch of trees; here the local people leave it uncut.",
              "One sentence of meaning, then the list. Do not spend more than two lines here."),
         step("s2_four", "boxed_final", "The four groves", 1, "The four",
              [{"text": "Khasi-Jaintia, Aravalli, Sarguja-Bastar, Chanda", "style": "boxed"},
               "1) Khasi and Jaintia hills \u2014 Meghalaya",
               "2) Aravalli hills \u2014 Rajasthan and Gujarat",
               "3) Sarguja and Bastar \u2014 Chhattisgarh",
               "4) Chanda \u2014 Madhya Pradesh"],
              "The question asks for four named places, so each name is written with the state it lies in \u2014 a bare list of hills does not show which grove is meant.",
              ["Naming national parks instead. A sacred grove is not a national park.",
               "Giving fewer than four. All four are needed for the mark."],
              "Four groves, four states: Meghalaya, Rajasthan with Gujarat, Chhattisgarh, Madhya Pradesh.",
              "Four names with the state beside each. A numbered list is enough."),
     ],
     "This is a list question \u2014 four names with their states, written as a numbered list, and nothing more."),

card("ts_ipe_z1_dlw_iucn_red_data_book", "VSAQ",
     "Write the full form of IUCN. In which book are threatened species listed?",
     ap(("ap", 2020), ("ts", 2019)),
     [("Full form", 1), ("The book", 1)],
     note("50", "VSAQ 68",
          "QUESTION TEXT: the book prints 'In which book threatened species are enlisted.'; the card "
          "keeps the same two asks in corrected grammar."),
     [
         step("s1_full_form", "text", "The full form", 1, "Full form",
              ["IUCN stands for the International Union for",
               "Conservation of Nature and Natural Resources."],
              "The words of the expansion say what the body does: it is a union of countries and organisations that works on conserving nature.",
              ["Writing 'International Council' or 'Institute'. The first two words are International Union.",
               "Leaving out 'and Natural Resources', which is part of the full name."],
              "I-U-C-N: International Union for Conservation of Nature.",
              "One line, written out in full."),
         step("s2_red_data_book", "boxed_final", "The Red Data Book", 1, "The book",
              [{"text": "Threatened species are listed in the Red Data Book", "style": "boxed"},
               "The IUCN Red Data Book lists the species that",
               "are threatened with extinction.",
               "The list is kept up to date and is also called",
               "the IUCN Red List."],
              "The Red Data Book is the record the union publishes, and naming it is the whole of the second mark.",
              ["Writing 'Green Book' or 'Red Book of Animals'. The name is the Red Data Book."],
              "The Red Data Book is named for the colour used to mark danger, and it lists species in danger.",
              "Name the book in one line. Nothing more is asked."),
     ],
     "Two one-line answers \u2014 the full form and the Red Data Book \u2014 so this is a question to finish in under two minutes."),

card("ts_ipe_z1_dlw_metabolism_definition", "VSAQ",
     "Define the term metabolism. Give any one example.",
     [],
     [("Definition", 1), ("Example", 1)],
     note("50", "VSAQ 69",
          "BOOK WORDING: the book lists photosynthesis among its examples; photosynthesis is a "
          "metabolic reaction but is a plant process, so the card gives animal examples for a "
          "zoology paper. CROSS-BANK: botany asks the same definition in "
          "ts_ipe_b1_lw_metabolism_anabolism_catabolism with a different second half. The book "
          "prints no year citation for this question, so `appearances` is empty."),
     [
         step("s1_definition", "text", "What metabolism is", 1, "Definition",
              ["Metabolism is the sum of all the chemical",
               "reactions that take place inside the body of",
               "an organism.",
               "Every living organism shows metabolism, so it",
               "is a defining character of living things."],
              "Metabolism is a total, not a single reaction, so the definition must say all the chemical reactions of the body taken together.",
              ["Naming one reaction as the definition. One reaction is an example; metabolism is all of them together.",
               "Writing that non-living things show metabolism. They do not, and this is one of the marks of a living body."],
              "Metabolism is the whole sum: every chemical change of the body added together.",
              "One sentence of definition and one line on why it matters. Then the example."),
         step("s2_example", "boxed_final", "The example", 1, "Example",
              [{"text": "Examples: digestion, respiration, excretion", "style": "boxed"},
               "Digestion breaks large food molecules into",
               "small ones that the body can absorb.",
               "Respiration releases energy from food.",
               "Reactions that build molecules up are called",
               "anabolic, and those that break them down are",
               "called catabolic."],
              "One named reaction shows that the student can point to metabolism happening, and naming a building reaction beside a breaking one shows both halves of it.",
              ["Giving photosynthesis in a zoology paper. It is a metabolic reaction, but choose an animal example such as digestion or respiration."],
              "Anabolic builds up, catabolic breaks down; metabolism is both together.",
              "Only one example is asked. Name two or three at most."),
     ],
     "Only one example is asked, so do not spend time listing many \u2014 write the definition carefully and name digestion or respiration."),

card("ts_ipe_z1_dlw_growth_living_vs_nonliving", "VSAQ",
     "How do you differentiate between growth in a living organism and growth in a non-living object?",
     [],
     [("Growth in living organisms", 1), ("Growth in non-living objects", 1)],
     note("50", "VSAQ 70",
          "CROSS-BANK: botany asks the same contrast in ts_ipe_b1_lw_growth_living_vs_nonliving. "
          "The book prints no year citation for this question, so `appearances` is empty."),
     [
         step("s1_living", "text", "Growth in a living organism", 1, "Living",
              ["Growth is an increase in size and mass.",
               "In a living organism growth takes place from",
               "inside the body, by an increase in the number",
               "of cells and in the size of the cells.",
               "It is therefore called growth from inside, or",
               "intrinsic growth.",
               "In animals growth stops at a certain age; in",
               "plants it goes on through life."],
              "Growth in a living body comes from cell division inside it, so new material is added within and not on the surface \u2014 that is the one difference the whole answer rests on.",
              ["Writing that living things grow by adding matter on the outside. That is how non-living objects grow.",
               "Writing that growth in animals continues for life. Animal growth stops at a certain age."],
              "Living growth is from inside by cell division; non-living growth is from outside by added matter.",
              "Definition first, then the living half. Three or four short lines."),
         step("s2_nonliving", "boxed_final", "Growth in a non-living object", 1, "Non-living",
              [{"text": "Living grows from inside, non-living from outside", "style": "boxed"},
               "In a non-living object growth takes place by",
               "the piling up (accretion) of matter on the",
               "outer surface.",
               "It is therefore called growth from outside, or",
               "extrinsic growth.",
               "Example: a mound of sand grows taller as more",
               "sand falls on it.",
               "Such growth is not counted as a sign of life."],
              "A non-living object gains material only where the outside world touches it, so its growth is a surface process and stops the moment nothing more is added.",
              ["Calling this true growth. It is only the piling up of matter, so it is not a sign of life."],
              "A sand mound grows only where sand lands on it: outside only.",
              "The contrast in the same words as the living half, plus one example."),
     ],
     "The mark is for the contrast, not for the definition \u2014 write 'from inside by cell division' against 'from outside by piling up of matter', and give one non-living example."),

card("ts_ipe_z1_dlw_zoos_tools_for_classification", "VSAQ",
     "'Zoos are tools for classification.' Explain.",
     [],
     [("What a zoo is", 1), ("How it helps classification", 1)],
     note("50", "VSAQ 71",
          "ADDED BEYOND THE BOOK: the closing line on breeding and protecting endangered animals is "
          "standard and is not printed in this book's answer. The book prints no year citation for "
          "this question, so `appearances` is empty."),
     [
         step("s1_zoo", "text", "What a zoo is", 1, "What a zoo is",
              ["A zoo is a place where wild animals are kept",
               "alive under human care, in enclosures that",
               "limit their movement.",
               "The animals are fed and looked after, so they",
               "can be watched over a long period."],
              "A zoo keeps the animal alive and in one place, and that is what makes it useful for study \u2014 a preserved specimen cannot be watched feeding or behaving.",
              ["Describing a zoo as a museum. A museum holds dead preserved specimens; a zoo holds living animals.",
               "Writing only about entertainment. The question asks about study and classification."],
              "A zoo holds animals alive; a museum holds them preserved.",
              "One sentence on what a zoo is. Two lines are enough."),
         step("s2_tool", "boxed_final", "How it helps classification", 1, "Use",
              [{"text": "Living characters decide the systematic position", "style": "boxed"},
               "In a zoo we can study the external characters,",
               "the feeding habits and the behaviour of a",
               "living animal.",
               "These characters are used to decide the",
               "systematic position of the animal in the",
               "animal kingdom.",
               "So a zoo works as a tool for classification.",
               "Zoos also help in breeding and protecting",
               "endangered animals."],
              "Classification is done on characters, and a zoo is the one place where the characters of a living animal \u2014 how it looks, what it eats, how it behaves \u2014 can be recorded directly.",
              ["Naming only the external characters. Feeding habits and behaviour are studied as well, and they carry the mark."],
              "Three things a zoo lets you record: what the animal looks like, what it eats, how it behaves.",
              "Three characters, then the systematic position. Close with the line the question asks for."),
     ],
     "The question hands you its own conclusion, so end with it in the examiner's words \u2014 the characters studied in a zoo decide the animal's systematic position."),

card("ts_ipe_z1_dlw_museum_preservation", "VSAQ",
     "Where and how do we preserve skeletons of animals, dry specimens etc.?",
     [],
     [("Where they are kept", 1), ("How they are prepared", 1)],
     note("50", "VSAQ 72",
          "The book prints no year citation for this question, so `appearances` is empty."),
     [
         step("s1_where", "text", "Where they are kept", 1, "Where",
              ["Skeletons and dry specimens are kept in a",
               "museum.",
               "A museum is a place where preserved animal",
               "material is stored and displayed for study."],
              "The question has two halves, and the first is a single word \u2014 the place \u2014 so it is written first and plainly.",
              ["Writing 'zoo'. A zoo holds living animals; a museum holds preserved ones.",
               "Writing 'herbarium'. A herbarium holds pressed and dried plants."],
              "Living animals go to a zoo; preserved animals go to a museum.",
              "One word answers the first half. Add one line on what a museum is."),
         step("s2_how", "boxed_final", "How they are prepared", 1, "How",
              [{"text": "Skeletons are articulated; skins are stuffed", "style": "boxed"},
               "Skeletons are first cleaned and bleached.",
               "The cleaned bones are then joined together in",
               "their natural position. This is called",
               "articulation.",
               "Animal skins are stuffed to give the shape of",
               "the living animal. This is called taxidermy.",
               "The prepared material is then put on display."],
              "Each step has a name the examiner looks for \u2014 cleaning and bleaching, articulation of the skeleton, and taxidermy for the skin \u2014 so the answer is those named steps in order.",
              ["Leaving out the word taxidermy, which names the stuffing of specimens.",
               "Writing that skeletons are preserved in a liquid. They are cleaned, bleached and articulated as dry material."],
              "Bones: clean, bleach, articulate. Skins: stuff, and that is taxidermy.",
              "Two named methods, articulation and taxidermy. One line each."),
     ],
     "The two technical words, articulation and taxidermy, are what the examiner ticks \u2014 a general answer about 'keeping them safely' earns nothing."),

# ==========================================================================
# SAQ  (book pp.30-31, global qno 13-17;  Star Q pp.63-64, qno 177-178)
# ==========================================================================

card("ts_ipe_z1_dlw_species_and_its_aspects", "SAQ",
     "Define species. Explain the various aspects of 'species'.",
     ap(("ts", 2016), ("ts", 2017), (None, 2014), ("ap", 2020), ("ap", 2022)),
     [("Species \u2014 the basic unit", 1), ("Definition of species", 1), ("Aspects of species", 2)],
     note("30", "SAQ 13",
          "BOOK ERROR: the book prints the whole definition \u2014 'an interbreeding group of similar "
          "individuals, sharing a common gene pool and producing fertile offspring' \u2014 as "
          "'Buffon's definition'. Buffon's criterion was interbreeding with fertile offspring; the "
          "'common gene pool' wording belongs to the modern biological species concept and could not "
          "have been Buffon's, so the card separates the two and records the book's attribution in "
          "the step's `why`. BOOK WORDING: the book writes that a species 'isolates reproductivity "
          "of individuals'; the card uses the standard wording, reproductively isolated from other "
          "species. CROSS-BANK: botany asks the definition of species in "
          "ts_ipe_b1_lw_species_basic_unit."),
     [
         step("s1_basic_unit", "text", "Species is the basic unit", 1, "Basic unit",
              ["Species is the basic unit of classification of",
               "living organisms.",
               "It is the lowest category in the taxonomic",
               "hierarchy.",
               "John Ray described a species on the basis of",
               "common descent, that is, the members of a",
               "species share common ancestors."],
              "Every larger group is built out of species, so the answer opens by placing the species at the bottom of the hierarchy and naming the worker who first defined it by descent.",
              ["Calling the genus the basic unit. The genus is a group of related species; the species is the basic unit.",
               "Crediting the common-descent idea to the wrong worker. John Ray described species on the basis of common descent."],
              "Species sits at the bottom of the hierarchy, so it is the unit everything above is built from.",
              "Two facts and one worker's name. Three or four lines."),
         step("s2_definition", "text", "Definition of species", 1, "Definition",
              ["Buffon defined a species as a group of similar",
               "individuals that interbreed among themselves",
               "and produce fertile offspring.",
               "The modern definition adds that the members of",
               "a species share a common gene pool.",
               "So a species is an interbreeding group of",
               "similar individuals, sharing a common gene",
               "pool and producing fertile offspring."],
              "Interbreeding is the test that separates one species from another: two groups that cannot produce fertile offspring together are two species, however alike they look. NOTE: this book prints the whole gene-pool wording as Buffon's definition; the gene-pool idea belongs to the modern biological species concept, and the card separates the two.",
              ["Leaving out 'fertile'. Offspring that are themselves sterile do not make the two parents one species.",
               "Defining a species only by appearance. Similar-looking populations that do not interbreed are separate species."],
              "Three words carry the definition: interbreeding, common gene pool, fertile offspring.",
              "Write the full definition as one sentence. It is worth a mark on its own."),
         step("s3_aspects", "boxed_final", "The five aspects", 2, "Aspects",
              [{"text": "Breeding, ecological, genetic, evolutionary, dynamic", "style": "boxed"},
               "1) Species is a breeding unit: its members",
               "breed among themselves and are reproductively",
               "isolated from other species.",
               "2) Species is an ecological unit: its members",
               "share the same ecological niche.",
               "3) Species is a genetic unit: its members show",
               "a similar karyotype, that is, a similar set",
               "of chromosomes.",
               "4) Species is an evolutionary unit: its",
               "members share similar structural and",
               "functional characters inherited from a common",
               "ancestor.",
               "5) Species is dynamic: it shows a continuous",
               "tendency to change, so new species can arise",
               "from it in time."],
              "Each aspect names one thing a species is a unit OF \u2014 breeding, niche, chromosomes, ancestry \u2014 so the list is not five separate facts but the same group looked at five ways.",
              ["Giving fewer than five aspects. Two marks are carried by this list.",
               "Writing that a species never changes. The fifth aspect says the opposite: a species is dynamic."],
              "Four units and one change: breeding, ecological, genetic, evolutionary \u2014 and dynamic.",
              "Two marks, so write all five. Name the unit first in each line, then one short reason."),
     ],
     "The five aspects are the bulk of the marks \u2014 write them as a numbered list with the unit named first in each line, because the examiner is counting the words breeding, ecological, genetic, evolutionary and dynamic."),

card("ts_ipe_z1_dlw_evil_quartet", "SAQ",
     "What is the 'evil quartet'?",
     ap(("ts", 2015), ("ts", 2022), ("ap", 2015), ("ap", 2016), ("ap", 2018)),
     [("The four causes named", 1), ("Habitat loss and fragmentation", 1),
      ("Over-exploitation and alien species", 1), ("Co-extinctions", 1)],
     note("30", "SAQ 14"),
     [
         step("s1_meaning", "text", "The four causes", 1, "The four",
              ["The 'evil quartet' is the name given to the",
               "four major causes of the loss of biodiversity.",
               "They are:",
               "1) Habitat loss and fragmentation",
               "2) Over-exploitation",
               "3) Invasion by alien species",
               "4) Co-extinctions"],
              "Naming the four first fixes the order of the answer and secures a mark even if time runs out before all four are explained.",
              ["Giving only three causes. All four are needed.",
               "Writing 'pollution' as the fourth cause. Pollution comes under habitat loss; the fourth cause is co-extinction."],
              "Four causes in order: habitat lost, too many taken, alien species brought in, partner species lost.",
              "Name all four first, as a numbered list. The list alone is worth a mark."),
         step("s2_habitat", "text", "Habitat loss and fragmentation", 1, "Habitat loss",
              ["1) Habitat loss and fragmentation:",
               "Cutting down forests destroys the habitat of",
               "many species.",
               "Forest land turned into farm land and into",
               "built-up land removes habitat as well.",
               "Pollution lowers the quality of the habitat",
               "that is left.",
               "Fragmentation cuts one large habitat into",
               "small separated patches. Animals that need a",
               "large territory cannot survive in them, and",
               "their populations fall."],
              "This is the largest cause, and every part of it works the same way: the area of usable habitat falls, so the number of animals the area can hold falls with it.",
              ["Treating fragmentation as the same as habitat loss. Fragmentation breaks a habitat into small patches even when the total area is still large.",
               "Leaving out an example such as deforestation."],
              "Habitat loss removes the area; fragmentation cuts what is left into small pieces.",
              "Four short points: deforestation, farm land, pollution, fragmentation."),
         step("s3_over_alien", "text", "Over-exploitation and alien species", 1, "Two causes",
              ["2) Over-exploitation:",
               "When humans take a natural resource far faster",
               "than it can be replaced, the species declines",
               "and may be lost.",
               "Examples: Steller's sea cow and the passenger",
               "pigeon became extinct through",
               "over-exploitation.",
               "3) Invasion by alien species:",
               "When a species from another region is brought",
               "into a habitat, it may spread and establish",
               "itself at the cost of the native species.",
               "Example: the Nile perch introduced into Lake",
               "Victoria caused the extinction of many native",
               "fish species."],
              "Both causes are about numbers \u2014 over-exploitation removes individuals faster than they are replaced, and an alien species takes the food and the space the native species needs.",
              ["Giving an alien-species example for over-exploitation. Keep each example with its own cause.",
               "Writing that every introduced species is harmful. Only those that spread at the cost of native species are counted here."],
              "Steller's sea cow for taking too many; Nile perch for bringing one in.",
              "Two causes with one example each. Keep each to three or four lines."),
         step("s4_coextinction", "boxed_final", "Co-extinctions", 1, "Co-extinction",
              [{"text": "Co-extinction: the partner species is lost too", "style": "boxed"},
               "4) Co-extinctions:",
               "Two species may live in an obligate",
               "association, so that one cannot live without",
               "the other.",
               "When one of them becomes extinct, the other",
               "becomes extinct with it.",
               "Examples: a parasite dies out with its host,",
               "and a plant with only one pollinator is lost",
               "when that pollinator is lost."],
              "Obligate means the two species cannot live apart, so the extinction of one is automatically the extinction of the other \u2014 this is the cause students most often leave out.",
              ["Writing that any two species living together show co-extinction. The association must be obligate.",
               "Giving no example. The host with its parasite and the plant with its pollinator are the standard pairs."],
              "Obligate means cannot live apart: lose one, lose the other.",
              "Definition, then the two standard example pairs. One mark."),
     ],
     "Name all four causes before you explain any of them \u2014 an answer that explains two causes well but never names the other two loses half the marks."),

card("ts_ipe_z1_dlw_rivet_popper_hypothesis", "SAQ",
     "Explain the 'Rivet Popper' hypothesis.",
     ap(("ap", 2017), ("ts", 2017), ("ts", 2019), ("ts", 2022)),
     [("What the hypothesis explains", 1), ("The comparison", 1),
      ("Removing the rivets", 1), ("Which rivet is removed", 1)],
     note("31", "SAQ 15",
          "ADDED BEYOND THE BOOK: the hypothesis is credited to Paul Ehrlich, which is standard and "
          "is not printed in this book's answer."),
     [
         step("s1_what", "text", "What it explains", 1, "Purpose",
              ["The 'rivet popper' hypothesis was put forward",
               "by Paul Ehrlich.",
               "It explains what happens to an ecosystem when",
               "its species are lost one after another.",
               "It is stated as a comparison between an",
               "aeroplane and an ecosystem."],
              "The hypothesis is an argument about how much loss an ecosystem can take, so the answer must first say what question it answers before the comparison is described.",
              ["Writing that the hypothesis is about how new species are formed. It is about the effect of losing species.",
               "Leaving out what the aeroplane stands for. The aeroplane stands for the ecosystem."],
              "Rivets hold an aeroplane together; species hold an ecosystem together.",
              "Name the worker and say what the hypothesis explains. Three lines."),
         step("s2_comparison", "text", "The comparison", 1, "Comparison",
              ["In the comparison:",
               "The aeroplane stands for the ecosystem.",
               "The rivets that hold the parts of the",
               "aeroplane together stand for the species that",
               "make up the ecosystem.",
               "A passenger who removes the rivets one at a",
               "time stands for the loss of species caused by",
               "human activity."],
              "Every part of the comparison has to be matched to a real thing, because the marks are for the matching and not for the story.",
              ["Describing the aeroplane without saying what each part stands for. The matching is what carries the mark."],
              "Aeroplane = ecosystem, rivet = species, the passenger removing rivets = human activity.",
              "Three matched pairs. Write them as pairs, not as a story."),
         step("s3_removal", "text", "Removing the rivets", 1, "Effect",
              ["Removing one rivet may not damage the",
               "aeroplane, and it may still fly safely.",
               "As more and more rivets are removed, the",
               "aeroplane becomes weaker.",
               "After enough rivets are gone the aeroplane is",
               "no longer safe, and it crashes.",
               "In the same way, the loss of one species may",
               "not show at once, but the loss of many",
               "species slowly damages the whole ecosystem."],
              "The point of the hypothesis is that the damage does not show at first, so the answer must give both halves: one loss shows nothing, many losses bring the whole thing down.",
              ["Writing that the loss of a single species always destroys an ecosystem. The hypothesis says the effect builds up over many losses."],
              "One rivet gone, the plane still flies; many rivets gone, the plane comes down.",
              "The build-up is the point here. Three or four lines."),
         step("s4_which_rivet", "boxed_final", "Which rivet is removed", 1, "Key species",
              [{"text": "Losing a key species harms the whole ecosystem", "style": "boxed"},
               "Which rivet is removed also matters.",
               "A rivet taken from a seat is a small loss and",
               "the aeroplane still flies.",
               "A rivet taken from a wing is a serious loss",
               "and the aeroplane can crash.",
               "In the same way, the loss of a species with a",
               "small part in the ecosystem does little harm,",
               "but the loss of a key species affects the",
               "whole community and the ecosystem."],
              "Species are not equal in their effect, so the last mark is for saying that the place of the lost species in the ecosystem decides how much damage the loss does.",
              ["Treating all species as equally important. The hypothesis says a key species matters far more than a minor one.",
               "Ending at the crash. The last mark is for turning the aeroplane back into the ecosystem."],
              "A seat rivet or a wing rivet: a minor species or a key species.",
              "The seat-and-wing contrast, then the same point for species. This is the closing mark."),
     ],
     "The examiner looks for the matched pairs \u2014 aeroplane to ecosystem, rivet to species \u2014 and for the seat-versus-wing point at the end, which is the half most students never reach."),

card("ts_ipe_z1_dlw_tropics_greater_biodiversity", "SAQ",
     "What are the reasons for greater biodiversity in the tropics?",
     ap(("ts", 2018), ("ts", 2022), ("ap", 2019)),
     [("What the tropics are", 1), ("Long undisturbed evolutionary time", 1),
      ("Constant climate", 1), ("More solar energy", 1)],
     note("31", "SAQ 16",
          "BOOK WORDING: the book's last point reads 'Solar energy and water are abundant in nature. "
          "Hence food production also leads to greater biodiversity.' The standard reason is that "
          "more solar energy raises the productivity of the ecosystem, and higher productivity "
          "supports more species; the card states it that way. ADDED BEYOND THE BOOK: the latitude "
          "limits of the tropics and the naming of past glaciations are standard and are not printed "
          "in this book's answer."),
     [
         step("s1_tropics", "text", "What the tropics are", 1, "The tropics",
              ["The tropics are the regions on either side of",
               "the equator, between 23.5\u00b0 North and",
               "23.5\u00b0 South.",
               "A tropical forest holds far more species than",
               "a temperate forest of the same size.",
               "There are three main reasons for this."],
              "The question asks for reasons, so the answer first fixes which regions are being compared \u2014 the tropics against the temperate regions.",
              ["Writing that the tropics are simply hot regions. They are defined by their position on either side of the equator.",
               "Comparing tropical forests with deserts. The comparison is with temperate regions."],
              "The tropics lie on either side of the equator; the temperate regions lie beyond them.",
              "One sentence on where the tropics are, then announce the three reasons."),
         step("s2_time", "text", "Long undisturbed evolutionary time", 1, "Time",
              ["1) Long undisturbed evolutionary time:",
               "Temperate regions were covered by ice again",
               "and again during past glaciations.",
               "Tropical latitudes were not disturbed by these",
               "glaciations, so they have remained much the",
               "same for millions of years.",
               "This long undisturbed period let speciation go",
               "on without a break, and so more species were",
               "formed."],
              "Speciation is slow, so a region left undisturbed for longer has simply had more time to form species \u2014 which is why the answer starts with glaciation.",
              ["Writing only that the tropics are old. The mark is for saying that temperate regions were disturbed by glaciations and the tropics were not.",
               "Confusing speciation with migration. New species were formed there, not merely moved there."],
              "Ice reached the temperate regions again and again; the tropics were left alone, so speciation continued.",
              "The glaciation contrast, then the result. Three or four lines."),
         step("s3_climate", "text", "Constant climate", 1, "Climate",
              ["2) Constant and predictable climate:",
               "The tropical climate changes little from",
               "season to season.",
               "A constant environment allows a species to",
               "specialise for a narrow niche.",
               "More niches in the same area means more",
               "species can live side by side."],
              "A species can afford to specialise only where conditions stay the same, and specialisation is what packs many species into one area.",
              ["Writing that the tropics are hot and stopping there. The mark is for the climate being constant, not for it being hot.",
               "Leaving out the word niche, which is the word the examiner looks for here."],
              "Steady conditions allow narrow niches, and narrow niches allow more species in the same space.",
              "Constant climate, niche specialisation, more species. Three short lines."),
         step("s4_energy", "boxed_final", "More solar energy", 1, "Energy",
              [{"text": "More solar energy means higher productivity", "style": "boxed"},
               "3) More solar energy:",
               "The tropics receive more solar energy through",
               "the year than temperate regions do.",
               "More energy, together with plenty of water,",
               "raises the productivity of the ecosystem.",
               "Higher productivity means more food, and more",
               "food supports a greater number of species.",
               "These three reasons together \u2014 undisturbed",
               "time, a constant climate and high",
               "productivity \u2014 give the tropics their",
               "greater biodiversity."],
              "The energy entering an ecosystem sets how much food it can produce, and the amount of food sets how many species it can support.",
              ["Writing that more sunlight directly makes new species. It raises productivity, and higher productivity supports more species."],
              "Three reasons: undisturbed time, steady climate, more energy.",
              "One mark. Close by naming the three reasons together."),
     ],
     "Three reasons carry this answer \u2014 undisturbed evolutionary time, a constant climate and more solar energy \u2014 so name all three even if you can write only one line for each."),

card("ts_ipe_z1_dlw_biodiversity_hot_spots", "SAQ",
     "Explain in brief 'Biodiversity Hot Spots'.",
     ap(("ap", 2019)),
     [("What a hot spot is", 1), ("Features of a hot spot", 1),
      ("Examples", 1), ("Legal protection", 1)],
     note("31", "SAQ 17",
          "ADDED BEYOND THE BOOK: endemism (species found nowhere else) and the loss of a large part "
          "of the original vegetation are the two criteria by which hot spots are identified, and "
          "the term in-situ conservation for the four protected-area types; neither is printed in "
          "this book's answer. The book gives the count as 'about 34', which the card keeps."),
     [
         step("s1_what", "text", "What a hot spot is", 1, "Definition",
              ["The idea of the biodiversity hot spot was put",
               "forward by Norman Myers.",
               "A biodiversity hot spot is a biogeographic",
               "region that holds a large reservoir of",
               "biodiversity and is at the same time under",
               "threat of destruction by human activity."],
              "Two conditions have to be met together \u2014 very rich and badly threatened \u2014 and a region that meets only one of them is not a hot spot.",
              ["Writing only that a hot spot is rich in species. It must also be under threat.",
               "Writing that a hot spot is a protected area. It is a region identified as needing protection."],
              "Two tests for a hot spot: very rich in species, and badly threatened.",
              "The worker's name and the two-part definition. Three or four lines."),
         step("s2_features", "text", "Features", 1, "Features",
              ["Features of a hot spot:",
               "They are the biologically richest and the most",
               "threatened terrestrial ecoregions of the",
               "earth.",
               "They hold a large number of endemic species,",
               "that is, species found nowhere else.",
               "They have already lost a large part of their",
               "original vegetation.",
               "About 34 biodiversity hot spots have been",
               "named in the world."],
              "Endemic species are the reason a hot spot cannot be replaced: if the region is lost, those species are lost from the earth and not merely from that place.",
              ["Leaving out endemism. Species found nowhere else are what make the region irreplaceable.",
               "Giving the wrong number. The count began at 25 and now stands at about 34."],
              "Endemic means found nowhere else, so a lost hot spot is a species lost from the earth.",
              "Four short points, ending with the number. One mark."),
         step("s3_examples", "text", "Examples", 1, "Examples",
              ["Three hot spots cover parts of India:",
               "1) The Western Ghats and Sri Lanka",
               "2) Indo-Burma",
               "3) The Himalaya",
               "These regions hold many plants and animals",
               "that are found nowhere else."],
              "The examples show what a hot spot looks like on a map \u2014 a large named region with a boundary, not a single forest.",
              ["Naming a national park as a hot spot. A hot spot is a large biogeographic region, not one park.",
               "Giving fewer than the three that cover India."],
              "Three for India: Western Ghats with Sri Lanka, Indo-Burma, and the Himalaya.",
              "Three names as a numbered list. One mark."),
         step("s4_protection", "boxed_final", "Legal protection", 1, "Protection",
              [{"text": "Biosphere reserves, national parks, sanctuaries", "style": "boxed"},
               "Regions rich in biodiversity are given legal",
               "protection as:",
               "1) Biosphere reserves",
               "2) National parks",
               "3) Wildlife sanctuaries",
               "4) Sacred groves",
               "Protecting a species in its own habitat in",
               "this way is called in-situ conservation."],
              "All four are places where the species stays in its own habitat, which is why they are grouped together as in-situ conservation.",
              ["Naming zoos and botanical gardens here. Those are ex-situ conservation, outside the natural habitat.",
               "Giving fewer than four kinds of protected area."],
              "In-situ means in its own place: reserve, park, sanctuary, sacred grove.",
              "A four-item list and the term in-situ conservation. One mark."),
     ],
     "Four blocks, one mark each \u2014 Norman Myers and the two tests, the features, the three hot spots covering India, and the four kinds of protected area."),

card("ts_ipe_z1_dlw_genetic_diversity", "SAQ",
     "What is genetic diversity and what are the different types of genetic diversity?",
     ap(("ts", 2020)),
     [("Definition", 1), ("Examples", 1), ("Types of genetic diversity", 2)],
     note("63", "Star Question 177",
          "BOOK WORDING: the book heads its three points as 'types of genetic diversity'; they are "
          "the three ways genetic diversity within a species is counted, and the card presents them "
          "that way while keeping the question's own word 'types'. This question is printed in the "
          "Star Questions Plus pages under the SAQ heading for Diversity of Living World, so it is "
          "authored at 4 marks."),
     [
         step("s1_definition", "text", "What genetic diversity is", 1, "Definition",
              ["Genetic diversity is the diversity of genes",
               "within a single species.",
               "It is the lowest of the three levels of",
               "biodiversity \u2014 genetic, species and",
               "ecological.",
               "A species spread over a wide range of areas",
               "usually shows high genetic diversity, because",
               "each population becomes adapted to its own",
               "conditions."],
              "The genes of one species are not the same everywhere it lives, and that variation is what lets the species adapt when its conditions change.",
              ["Writing that genetic diversity is the number of species. That is species diversity; genetic diversity is inside one species.",
               "Writing that all members of a species carry the same genes. They do not, and that variation is the whole point."],
              "Three levels of biodiversity: genes, species, ecosystems. Genetic diversity is the level inside one species.",
              "One sentence of definition and one on why a wide range raises it."),
         step("s2_examples", "text", "Examples", 1, "Examples",
              ["Example 1: India has more than 50,000",
               "genetically different strains of rice.",
               "Example 2: Rauwolfia vomitoria is a medicinal",
               "plant that grows in the Himalayas.",
               "It produces the drug reserpine, which is used",
               "to treat high blood pressure.",
               "The strength and the amount of reserpine",
               "differ from one growing region to another.",
               "That difference is genetic diversity within",
               "one species."],
              "Both examples show the same thing measured in different ways \u2014 one by counting varieties, the other by measuring how much of a chemical each population makes.",
              ["Naming the examples without saying what varies. The variation, not the plant, is the answer.",
               "Writing that the rice strains are different species. They are strains of one species."],
              "Rice counts the strains; Rauwolfia measures the reserpine.",
              "Two examples with the variation named in each. One mark."),
         step("s3_types", "boxed_final", "Types of genetic diversity", 2, "Types",
              [{"text": "Range of area, number of alleles, their frequency", "style": "boxed"},
               "Genetic diversity within a species is counted",
               "in three ways:",
               "1) The range of areas over which the species",
               "is spread. A wider range gives more variation",
               "in the genes.",
               "2) The number of different alleles present in",
               "the genes of the species. An allele is one",
               "form of a gene.",
               "3) The frequency with which each of those",
               "alleles appears in the population.",
               "Together these decide how much genetic",
               "variation a species carries."],
              "An allele is one form of a gene, so counting how many forms exist and how common each one is measures the variation directly.",
              ["Confusing alleles with genes. An allele is one form of a gene, and one gene may have several alleles.",
               "Leaving out frequency. Two populations with the same alleles can still differ in how common each allele is."],
              "How wide the range, how many alleles, and how often each allele appears.",
              "Three numbered points with one line each. Two marks, so do not shorten this."),
     ],
     "The two examples \u2014 50,000 rice strains and the reserpine of Rauwolfia \u2014 are what the examiner ticks first, so write them with the variation named, not just the two plant names."),

# --- SAQ 178: the one figure of this unit -----------------------------------

def hierarchy_figure():
    W, H = 480, 352
    CX = 170
    rows = [
        ("domain",  "Domain",  120, None),
        ("kingdom", "Kingdom", 110, "Animalia"),
        ("phylum",  "Phylum",  100, "Chordata"),
        ("classc",  "Class",    90, "Mammalia"),
        ("order",   "Order",    80, "Primata"),
        ("family",  "Family",   70, "Hominidae"),
        ("genus",   "Genus",    60, "Homo"),
        ("species", "Species",  45, "sapiens"),
    ]
    ys = [44 + 42 * i for i in range(8)]
    EXX = 305
    els = []

    els.append(F.pause("p1", "Step 1 \u2014 draw the seven boxes, widest at the top"))
    for i in range(1, 8):                       # kingdom .. species
        key, name, hw, ex = rows[i]
        y = ys[i]
        top, bot = y - 19, y + 7
        els.append(F.stroke("box_" + key, F.poly(
            [(CX - hw, top), (CX + hw, top), (CX + hw, bot), (CX - hw, bot)], close=True)))

    els.append(F.pause("p2", "Step 2 \u2014 write the seven category names"))
    for i in range(1, 8):
        key, name, hw, ex = rows[i]
        w = F.label_w(name, sm=True)
        els.append(F.label("lbl_" + key, round(CX - w / 2, 1), ys[i], name))

    els.append(F.pause("p3", "Step 3 \u2014 add the domain box above the kingdom"))
    key, name, hw, ex = rows[0]
    y = ys[0]
    els.append(F.stroke("box_domain", F.poly(
        [(CX - hw, y - 19), (CX + hw, y - 19), (CX + hw, y + 7), (CX - hw, y + 7)], close=True)))
    w = F.label_w(name, sm=True)
    els.append(F.label("lbl_domain", round(CX - w / 2, 1), y, name))

    els.append(F.pause("p4", "Step 4 \u2014 write one example beside each box"))
    # Header sits ABOVE the column, not on the Domain row: on that row it reads
    # as the domain's value. The worked example starts at Kingdom, which is where
    # the written answer starts it too.
    els.append(F.label("ex_head", EXX, 24, "Example: human"))
    for i in range(1, 8):
        key, name, hw, ex = rows[i]
        els.append(F.label("ex_" + key, EXX, ys[i], ex))

    bad = F.check(els, W, H, "dlw_taxonomic_hierarchy")
    if bad:
        raise SystemExit("FIGURE CHECK FAILED:\n" + "\n".join(bad))
    return {"id": "dlw_taxonomic_hierarchy", "width": W, "height": H, "elements": els}


card("ts_ipe_z1_dlw_hierarchy_of_classification", "SAQ",
     "Explain the hierarchy of classification.",
     [],
     [("Classification and Linnaeus", 1), ("The seven categories", 2), ("Species and domain", 1)],
     note("64", "Star Question 178",
          "BOOK ERROR: the book writes 'Kingdom includes all multicellular, heterotrophs'. That "
          "describes the kingdom Animalia, not the category kingdom, which is simply the highest "
          "category and includes one or more related phyla; the card states it correctly and the "
          "book's wording is recorded in the step's `why`. FIGURE SCOPE: the book prints no diagram "
          "for this question and none is asked for, so the ladder carries 0 marks and all four marks "
          "sit on the written steps. ADDED BEYOND THE BOOK: the worked example (human) shown in the "
          "figure and named in the written answer is the standard NCERT example and is not printed "
          "in this book's answer. This question is printed in the Star Questions Plus pages under "
          "the SAQ heading for Diversity of Living World, so it is authored at 4 marks."),
     [
         step("s1_classification", "text", "What classification is", 1, "Classification",
              ["Classification is the grouping of living",
               "organisms on the basis of their similarities",
               "and differences.",
               "The groups are arranged one inside another in",
               "a fixed order, from the largest to the",
               "smallest. This arrangement is called the",
               "taxonomic hierarchy.",
               "Hierarchical classification was introduced by",
               "Carolus Linnaeus."],
              "Every group in the hierarchy is contained inside the group above it, so the order is not a list to memorise but a set of boxes inside boxes.",
              ["Writing the categories in the wrong direction. The hierarchy runs from kingdom, the largest, down to species, the smallest.",
               "Crediting the hierarchy to the wrong worker. Carolus Linnaeus introduced it."],
              "Boxes inside boxes: a kingdom holds phyla, a phylum holds classes, and so on down to the species.",
              "Definition, the idea of a hierarchy, and the name Linnaeus. Three or four lines."),
         step("s2_ladder", "diagram", "Diagram \u2014 the ladder of categories", 0, None, None,
              "Drawing the categories as a ladder fixes their order, and the order is the first thing the examiner checks.",
              ["Swapping order and family. The order lies above the family.",
               "Drawing the ladder with species at the top. Species is the smallest category and sits at the bottom."],
              "Read the ladder from the top: Kingdom, Phylum, Class, Order, Family, Genus, Species.",
              "No diagram is asked for in this question, so the ladder carries no marks and all four marks sit on the written steps. Draw it only as a check on your order.",
              figure=hierarchy_figure()),
         step("s3_categories", "text", "The seven categories", 2, "Seven categories",
              ["The taxonomic hierarchy has seven categories.",
               "From the highest to the lowest they are:",
               "Kingdom, Phylum, Class, Order, Family, Genus",
               "and Species.",
               "Each category includes one or more related",
               "members of the category below it: a kingdom",
               "includes related phyla, a phylum includes",
               "related classes, a class includes related",
               "orders, an order includes related families, a",
               "family includes related genera, and a genus",
               "includes related species.",
               "In zoology the kingdom is Animalia.",
               "Example: the human is placed in Animalia,",
               "Chordata, Mammalia, Primata, Hominidae, Homo,",
               "sapiens."],
              "Each category is defined by the one below it, so the whole block can be written from a single pattern: every category includes one or more related members of the next category down. NOTE: this book writes 'Kingdom includes all multicellular, heterotrophs', which describes the kingdom Animalia and not the category kingdom; the card states the category first and then names Animalia.",
              ["Giving fewer than seven categories. All seven are needed, and they carry two marks.",
               "Using 'division' in place of phylum. Division is the plant equivalent; in animals the category is the phylum."],
              "Kingdom, Phylum, Class, Order, Family, Genus, Species \u2014 seven names, largest to smallest.",
              "Two marks. Write all seven in order first, then the pattern that links them, then one worked example."),
         step("s4_species_domain", "boxed_final", "Species and domain", 1, "Species, domain",
              [{"text": "Species is the lowest unit, domain the highest", "style": "boxed"},
               "Species is the basic unit of classification.",
               "It includes similar individuals that",
               "interbreed among themselves.",
               "Domain is a category placed above the",
               "kingdom.",
               "Besides the seven main categories there are",
               "intermediate categories such as sub-phylum,",
               "sub-class and sub-family."],
              "The seven categories are the compulsory ones, and both the domain above them and the sub-categories between them are additions to that fixed frame.",
              ["Placing the domain below the kingdom. The domain lies above it.",
               "Counting sub-family or sub-class among the seven main categories. They are intermediate categories."],
              "Above the seven sits the domain; between them sit the sub-categories.",
              "Species, domain and the intermediate categories. One mark."),
     ],
     "The seven categories in the right order are worth two of the four marks, so write them out as a list before explaining anything \u2014 and remember the domain sits above the kingdom, not below it."),


# ==========================================================================
# write out
# ==========================================================================

def linetext(L):
    return L if isinstance(L, str) else L["text"]


problems = []
for q in CARDS:
    qid = q["question_id"]
    tot = sum(s["marks"] for s in q["answer"]["steps"])
    if tot != q["marks_total"]:
        problems.append("%s: steps sum %d != %d" % (qid, tot, q["marks_total"]))
    if sum(m["marks"] for m in q["mark_split"]) != q["marks_total"]:
        problems.append("%s: mark_split sum wrong" % qid)
    for s in q["answer"]["steps"]:
        if s["marks"] == 0 and "mark_note" in s:
            problems.append("%s/%s: mark_note at 0 marks" % (qid, s["id"]))
        if s["marks"] > 0 and not s.get("mark_note"):
            problems.append("%s/%s: missing mark_note" % (qid, s["id"]))
        if not s.get("why") or not s.get("common_mistakes") or not s.get("memory_tip") or not s.get("margin_note"):
            problems.append("%s/%s: missing rail field" % (qid, s["id"]))
        if len(s.get("common_mistakes", [])) > 3:
            problems.append("%s/%s: >3 common_mistakes" % (qid, s["id"]))
        if s["kind"] == "diagram":
            if not s.get("figure"):
                problems.append("%s/%s: diagram without figure" % (qid, s["id"]))
        else:
            if not s.get("lines"):
                problems.append("%s/%s: no lines" % (qid, s["id"]))
            for L in s["lines"]:
                t = linetext(L)
                if len(t) > 52:
                    problems.append("%s/%s: line %d chars: %s" % (qid, s["id"], len(t), t))
    if not q.get("insider_note"):
        problems.append("%s: no insider_note" % qid)

if problems:
    print("PROBLEMS:")
    for p in problems:
        print("  " + p)
    raise SystemExit(1)

for q in CARDS:
    p = os.path.join(QDIR, q["question_id"] + ".json")
    with io.open(p, "w", encoding="utf-8") as fh:
        json.dump(q, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    print("wrote", q["question_id"])

# manifest fragment ---------------------------------------------------------
REFS = {
    "ts_ipe_z1_dlw_iczn_full_form": ("VSAQ", 59),
    "ts_ipe_z1_dlw_biogenesis": ("VSAQ", 60),
    "ts_ipe_z1_dlw_histology_definition": ("VSAQ", 61),
    "ts_ipe_z1_dlw_trinomial_nomenclature": ("VSAQ", 62),
    "ts_ipe_z1_dlw_tautonymy": ("VSAQ", 63),
    "ts_ipe_z1_dlw_protostomia_vs_deuterostomia": ("VSAQ", 64),
    "ts_ipe_z1_dlw_ecological_diversity": ("VSAQ", 65),
    "ts_ipe_z1_dlw_species_richness": ("VSAQ", 66),
    "ts_ipe_z1_dlw_sacred_groves_india": ("VSAQ", 67),
    "ts_ipe_z1_dlw_iucn_red_data_book": ("VSAQ", 68),
    "ts_ipe_z1_dlw_metabolism_definition": ("VSAQ", 69),
    "ts_ipe_z1_dlw_growth_living_vs_nonliving": ("VSAQ", 70),
    "ts_ipe_z1_dlw_zoos_tools_for_classification": ("VSAQ", 71),
    "ts_ipe_z1_dlw_museum_preservation": ("VSAQ", 72),
    "ts_ipe_z1_dlw_species_and_its_aspects": ("SAQ", 13),
    "ts_ipe_z1_dlw_evil_quartet": ("SAQ", 14),
    "ts_ipe_z1_dlw_rivet_popper_hypothesis": ("SAQ", 15),
    "ts_ipe_z1_dlw_tropics_greater_biodiversity": ("SAQ", 16),
    "ts_ipe_z1_dlw_biodiversity_hot_spots": ("SAQ", 17),
    "ts_ipe_z1_dlw_genetic_diversity": ("SAQ", 177),
    "ts_ipe_z1_dlw_hierarchy_of_classification": ("SAQ", 178),
}
byid = {q["question_id"]: q for q in CARDS}
rows = []
for sec in ("VSAQ", "SAQ"):
    for qid, (s, n) in sorted(REFS.items(), key=lambda kv: kv[1][1]):
        if s != sec:
            continue
        rows.append({
            "ref": ("vsaq%d" % n) if s == "VSAQ" else ("saq%d" % n),
            "section": s, "number": n, "stars": 0,
            "text": byid[qid]["question_text"],
            "question_id": qid,
        })
frag = {"number": 1, "name": UNIT["name"], "subject": "zoology", "questions": rows}
if not os.path.isdir(SCRATCH):
    os.makedirs(SCRATCH)
with io.open(os.path.join(SCRATCH, "unit_01.json"), "w", encoding="utf-8") as fh:
    json.dump(frag, fh, ensure_ascii=False, indent=2)
    fh.write("\n")
print("wrote fragment: %d rows" % len(rows))
print("cards: %d  (VSAQ %d, SAQ %d)" % (
    len(CARDS), sum(1 for q in CARDS if q["qtype"] == "VSAQ"), sum(1 for q in CARDS if q["qtype"] == "SAQ")))
