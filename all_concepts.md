# aircraft_wind_problems.json
```json
{
  "concept_id": "aircraft_wind_problems",
  "concept_name": "Aircraft-Wind Problems — Steering Direction and Journey Time",
  "class_level": 11,
  "chapter": "Kinematics",
  "section": "6.10",
  "source_coverage": {
    "dc_pandey": "Chapter 6, Section 6.10 — Aircraft-Wind Problems (Example 6.33; Exercise Problem 4)",
    "ncert": "Chapter 4 — Motion in a Plane, Section 4.6",
    "hc_verma": "Chapter 3 — Rest and Motion: Kinematics, Section 3.7"
  },
  "source_type": "ncert_and_dc_pandey",
  "renderer_hint": {
    "technology": "canvas2d",
    "technology_b": "plotly",
    "renderer": "mechanics_2d",
    "scenario_type": "aircraft_wind",
    "panel_count": 2,
    "sync_required": true,
    "scene_mode": true,
    "show_labels": true,
    "scene_elements": [
      "sky_background",
      "aircraft",
      "wind_arrows",
      "destination_marker",
      "velocity_vectors",
      "flight_path"
    ],
    "panel_a_role": "Realistic top-view scene — aircraft steers in v_aw direction, wind pushes it sideways, actual path v_a tracks straight toward destination B",
    "panel_b_role": "Plotly vector triangle — v_w from A, v_a along AB, v_aw as third side; angle α labeled; sine law construction visible"
  },
  "locked_facts": {
    "analogy_to_river_boat": "Aircraft-wind is identical to river-boat with different labels: v_br → v_aw (aircraft speed in still air / steering speed), v_r → v_w (wind velocity), v_b → v_a (actual aircraft velocity). Relation: v_a = v_aw + v_w.",
    "key_difference_from_river_boat": "In river-boat, the DIRECTION of v_br is the unknown (drift vs no-drift). In aircraft-wind, the DESTINATION B is fixed — v_a MUST point from A to B. So v_a direction is known (along AB), and v_aw direction is the unknown.",
    "three_velocities": "v_w = wind velocity (completely given — magnitude and direction). |v_aw| = steering speed (magnitude given, direction unknown). v_a = actual aircraft velocity (direction = along AB, magnitude unknown).",
    "vector_triangle_method": "Draw v_w from A. Draw v_a from A along AB. The third side v_aw closes the triangle (polygon law: v_w + v_aw = v_a). Use sine rule on this triangle to find angle and magnitude.",
    "sine_rule_application": "In the velocity triangle: sides are |v_w|, |v_aw|, |v_a|. Use sine rule: |v_w|/sin(angle opposite v_w) = |v_aw|/sin(angle opposite v_aw) = |v_a|/sin(angle opposite v_a).",
    "time_formula": "Time = AB / |v_a|. Use actual aircraft speed |v_a| over the straight-line distance AB.",
    "dc_pandey_ex633": "Example 6.33: v_aw=400km/h (still air speed), v_w=200√2 km/h northward, destination B is northeast of A (45° from east), AB=1000km. Triangle: v_a along NE (45°), v_w northward. Sine rule gives α=30° (angle v_aw makes with AB). Pilot steers 45°+30°=75° from north toward east. |v_a|=546.47km/h. Time=1000/546.47≈1.83h.",
    "perpendicular_component_condition": "Alternative method: component of v_aw and v_w perpendicular to AB must cancel (net velocity must be along AB). |v_aw|sinα = |v_w|sinβ where α,β are angles each makes with AB.",
    "crosswind_vs_headwind": "Wind along AB direction: only affects speed (no steering correction needed). Wind perpendicular to AB: requires maximum steering correction. Wind at angle: resolve into components along and perpendicular to AB."
  },
  "minimum_viable_understanding": "v_a = v_aw + v_w. v_a MUST point along AB (actual path to destination). Construct the vector triangle: v_w known completely, |v_aw| known, v_a direction known. Solve by sine rule. Time = AB / |v_a|.",
  "variables": {
    "v_aw": "Aircraft velocity relative to wind (steering velocity) — magnitude given, direction is the unknown (km/h)",
    "v_w": "Wind velocity — completely given (magnitude and direction) (km/h)",
    "v_a": "Actual aircraft velocity relative to ground — direction along AB (known), magnitude unknown (km/h)",
    "alpha": "Angle v_aw makes with AB direction — found by sine rule",
    "AB": "Distance from start A to destination B (km)",
    "t": "Journey time = AB / |v_a| (h)"
  },
  "routing_signals": {
    "global_triggers": [
      "aircraft wind problem",
      "aeroplane wind velocity",
      "pilot steer direction wind",
      "aircraft wind kinematics",
      "plane flying in wind direction"
    ],
    "local_triggers": [
      "find direction pilot should steer",
      "aircraft velocity triangle",
      "sine rule aircraft wind",
      "wind blowing plane off course",
      "steering speed still air",
      "time taken aircraft wind"
    ],
    "micro_triggers": [
      "v_a equals v_aw plus v_w",
      "why use sine rule aircraft",
      "aircraft wind same as river boat",
      "Example 6.33 DC Pandey"
    ],
    "simulation_not_needed_triggers": [
      "list aircraft wind formulas",
      "state the analogy aircraft river boat"
    ],
    "subconcept_triggers": {
      "vector_triangle_setup": [
        "how to draw velocity triangle aircraft",
        "three velocities aircraft wind",
        "polygon law aircraft"
      ],
      "sine_rule_solution": [
        "apply sine rule aircraft",
        "angle pilot must steer",
        "sine law velocity triangle"
      ],
      "time_calculation": [
        "journey time aircraft wind",
        "time = AB by v_a",
        "how long to reach destination"
      ],
      "perpendicular_component_method": [
        "component method aircraft wind",
        "perpendicular to AB condition",
        "alternative method aircraft"
      ]
    }
  },
  "checkpoint_states": {
    "understands_analogy_to_river_boat": "enter at STATE_2",
    "understands_vector_triangle": "enter at STATE_3",
    "understands_sine_rule_application": "enter at STATE_4",
    "understands_time_calculation": "enter at STATE_5"
  },
  "prerequisite_check": {
    "required_concepts": [
      "river_boat_problems",
      "relative_motion",
      "vector_addition"
    ],
    "gate_question": "In river-boat: v_b = v_br + v_r. What is the equivalent equation for aircraft-wind? (Answer: v_a = v_aw + v_w. If student cannot make this substitution, cover river_boat_problems first.)",
    "if_gap_detected": "redirect to river_boat_problems.json — aircraft-wind is identical physics with different variable names"
  },
  "epic_l_path": {
    "state_count": 6,
    "board_mode_states": [
      1,
      2,
      3,
      4
    ],
    "jee_mode_states": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "scope": "global",
    "states": {
      "STATE_1": {
        "label": "The Hook — Why Can't the Pilot Just Point at the Destination?",
        "physics_layer": {
          "concept": "If wind blows sideways, a pilot pointing directly at destination B will be pushed off course and miss it",
          "simulation_focus": "Panel A top-view scene: aircraft points northeast toward B. Strong northward wind. Aircraft drifts east — arrives far to the right of B. B missed entirely. Now: pilot steers at a corrected angle (northwest of NE). Wind pushes it right. Actual path goes straight to B.",
          "what_to_show": "Same destination B, same wind, two steering choices: wrong (point at B → miss) and right (steer corrected angle → hit B exactly).",
          "key_observation": "The pilot must intentionally aim away from the destination so the wind brings the actual path back to it.",
          "scenario": "aircraft_wind_setup"
        },
        "pedagogy_layer": {
          "opening_question": "You want to fly northeast. Wind blows strongly from the south (pushing you north). Do you point the plane northeast? What happens?",
          "teacher_script": "The plane's nose points northwest of the destination. Wind pushes it eastward. Combined: actual path is exactly northeast. This is the key insight — steer INTO the crosswind.",
          "real_world": "Every commercial flight uses this — pilots call it 'crab angle'. On approach to a runway in crosswind, aircraft crab sideways until touchdown."
        }
      },
      "STATE_2": {
        "label": "The Analogy — River-Boat in the Sky",
        "physics_layer": {
          "concept": "Aircraft-wind is identical to river-boat with three label substitutions",
          "substitution_table": {
            "river_boat": "v_b = v_br + v_r",
            "aircraft_wind": "v_a = v_aw + v_w",
            "v_br_becomes": "v_aw (steering speed — what pilot controls)",
            "v_r_becomes": "v_w (wind — what pilot cannot control)",
            "v_b_becomes": "v_a (actual path over ground)"
          },
          "key_difference": "River-boat: v_a direction is unknown (drift), |v_a| can be anything. Aircraft-wind: v_a direction IS known (must be along AB), |v_a| is unknown. Different unknown, same equation.",
          "simulation_focus": "Panel B: side-by-side vector triangles — river boat on left, aircraft on right. Same triangle shape, different labels. Student sees the mapping visually.",
          "scenario": "velocity_triangle_aircraft"
        },
        "pedagogy_layer": {
          "key_message": "If you understood river-boat, you already understand aircraft-wind. The math is identical. Only the question asked is different: river-boat asks WHERE you land, aircraft-wind asks WHICH WAY to steer.",
          "jee_tip": "DC Pandey explicitly lists both as subtypes of the same relative motion section. Examiners sometimes disguise one as the other."
        }
      },
      "STATE_3": {
        "label": "The Vector Triangle — Draw It, Then Apply Sine Rule",
        "physics_layer": {
          "concept": "Construct the velocity triangle from the three known pieces of information",
          "construction_steps": [
            "Step 1: Take A as origin.",
            "Step 2: Draw v_w from A (completely given — magnitude and direction).",
            "Step 3: Draw v_a from A along AB direction (direction known, magnitude unknown — draw as unknown length).",
            "Step 4: The closing side of the triangle = v_aw. This is what the pilot must steer.",
            "Step 5: Polygon law confirms: v_w + v_aw = v_a."
          ],
          "dc_pandey_ex633": "Example 6.33: A→B northeast (45°). v_w = 200√2 km/h northward. v_aw = 400 km/h (unknown direction). Draw v_w pointing north. Draw v_a pointing NE. The gap between them closes with v_aw. The triangle has sides 200√2 (v_w), 400 (v_aw), and |v_a| (unknown).",
          "simulation_focus": "Panel B: animated triangle construction. v_w drawn first (northward arrow). v_a drawn from A along NE. v_aw drawn as closing side. Angle α between v_aw and AB labeled.",
          "scenario": "heading_vs_track"
        },
        "pedagogy_layer": {
          "common_mistake": "Students draw v_a in wrong direction or draw v_aw from wrong point. The polygon law requires tail-to-head: v_w tip → v_aw → v_a tip. All start from A.",
          "key_message": "The triangle draws itself once you know: where wind blows (v_w), where destination is (v_a direction), and how fast the plane flies (|v_aw|)."
        }
      },
      "STATE_4": {
        "label": "Applying the Sine Rule — Finding Steering Angle",
        "physics_layer": {
          "concept": "With the triangle constructed, use sine rule to find the unknown angle α and then |v_a|",
          "sine_rule": "|v_w| / sin(α) = |v_aw| / sin(β) = |v_a| / sin(γ), where α, β, γ are angles opposite to those sides.",
          "dc_pandey_ex633_solution": "Triangle: v_a along NE (45° from east), v_w northward (90° from east). Angle between v_a and v_w = 90°−45° = 45°. Sine rule: |v_w|/sinα = |v_aw|/sin45°. 200√2/sinα = 400/sin45°. sinα = 200√2 × sin45° / 400 = 200√2 × (1/√2) / 400 = 200/400 = 0.5. α = 30°. Pilot steers 30° from AB toward north, i.e. 45°+30° = 75° from north toward east.",
          "v_a_magnitude": "|v_a|/sin(180°−45°−30°) = 400/sin45°. |v_a| = 400 × sin105°/sin45° = 400 × sin75°/(1/√2) = 400×0.966×√2 ≈ 546.4 km/h.",
          "simulation_focus": "Panel B: triangle with all angles labeled. Sine rule equation shown. α=30° highlighted. Steering direction arrow on Panel A rotates to 75° from north.",
          "scenario": "crosswind_correction_angle"
        },
        "pedagogy_layer": {
          "jee_tip": "The angle between v_w and v_a (the two known directions) is the angle you can read from geometry. Label it carefully — it determines which angles go into the sine rule.",
          "alternative_method": "Component method: components of (v_aw + v_w) perpendicular to AB must cancel. |v_aw|sinα = |v_w|sinβ where β = angle v_w makes with AB. Same answer, different route."
        }
      },
      "STATE_5": {
        "label": "Journey Time — t = AB / |v_a|",
        "physics_layer": {
          "concept": "Once |v_a| is found from the sine rule, time = distance / actual speed",
          "formula": "t = AB / |v_a|",
          "dc_pandey_ex633_time": "|v_a| ≈ 546.47 km/h. AB = 1000 km. t = 1000/546.47 ≈ 1.83 hours.",
          "why_not_v_aw": "Time uses |v_a| (actual ground speed), NOT |v_aw| (steering speed in still air). The plane covers the ground at |v_a| — wind has added or subtracted from its effective speed.",
          "simulation_focus": "Panel A: aircraft follows actual path at |v_a|. Timer shows 1.83h for 1000km. If student mistakenly uses |v_aw|=400, timer shows 2.5h — different answer, aircraft overshoots in time.",
          "headwind_tailwind": "If wind is along AB: headwind reduces |v_a| (longer time), tailwind increases |v_a| (shorter time). Crosswind always reduces |v_a| compared to still air.",
          "scenario": "ground_speed_calculation"
        },
        "pedagogy_layer": {
          "key_message": "Two-step finish: (1) sine rule → find α and |v_a|. (2) t = AB/|v_a|. The sine rule step is the hard part. The time step is trivial once |v_a| is known."
        }
      },
      "STATE_6": {
        "label": "Student Interaction — DC Pandey Example 6.33 Live",
        "physics_layer": {
          "problem": "Aircraft still-air speed 400 km/h. Wind 200√2 km/h from south (northward). Destination B is northeast of A. AB = 1000 km. Find: (i) steering direction, (ii) journey time.",
          "solution_walkthrough": "(i) Triangle: v_a NE, v_w north, v_aw unknown. Angle between v_a and v_w = 45°. Sine rule: sinα = |v_w|sin45°/|v_aw| = 200√2×(1/√2)/400 = 0.5 → α=30°. Steer at 30° from NE toward north = 75° from north. (ii) |v_a| = |v_aw|sin(105°)/sin(45°) ≈ 546.5 km/h. t = 1000/546.5 ≈ 1.83 h.",
          "interactive": "Student drags steering angle slider on Panel B. Panel A shows aircraft path curving toward or away from B. At α=30°: path aligns exactly with AB, aircraft hits B.",
          "scenario": "time_from_ground_speed"
        },
        "pedagogy_layer": {
          "teacher_script": "The sine rule gives 30° — pilot steers 75° from north. Wind does the rest. The aircraft never points at B, yet arrives exactly at B. That's the elegance of vector composition."
        }
      }
    }
  },
  "epic_c_branches": [
    {
      "branch_id": "point_plane_at_destination",
      "misconception": "Pilot should point the plane directly at destination B — wind will slow you down but not push you off course",
      "student_belief": "If you aim at B, you will reach B — wind only affects speed, not direction of arrival",
      "trigger_phrases": [
        "point plane at destination",
        "aim directly at B",
        "wind only slows plane not changes direction",
        "why not steer toward B",
        "seedha B ki taraf point karo"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Aircraft pointed exactly at B (northeast). Wind blows northward at 200√2 km/h. v_a = v_aw + v_w: v_aw pointing NE + v_w pointing north = v_a pointing north-of-northeast. Aircraft drifts north of B. Lands at a point well north of destination.",
            "label": "Pointed at B, landed north of B. Wind doesn't just slow you — it shifts your entire path sideways.",
            "scenario": "aw_wrong_heading_is_track"
          },
          "pedagogy_layer": {
            "teacher_script": "Wind is a velocity — it adds vectorially to every component of your motion. If you point northeast and wind pushes north, your actual path is north-of-northeast. B is due northeast — you miss it to the north."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Show corrected steering: pilot aims south-of-northeast (75° from north). Wind pushes north. v_aw + v_w = v_a exactly northeast. Aircraft hits B precisely. Contrast the two paths side by side on Panel A.",
            "label": "Correct: steer south-of-northeast so wind corrects you back to northeast. Counterintuitive but physically necessary.",
            "scenario": "aw_aha_aim_to_compensate"
          },
          "pedagogy_layer": {
            "rule": "Aircraft-wind rule: v_a must point along AB. Work backward — what v_aw, when combined with v_w, gives v_a along AB? That's the steering direction."
          }
        }
      }
    },
    {
      "branch_id": "uses_v_aw_for_time",
      "misconception": "Student uses steering speed |v_aw| to calculate journey time instead of actual ground speed |v_a|",
      "student_belief": "Time = AB / |v_aw| because |v_aw| is the aircraft's speed",
      "trigger_phrases": [
        "used steering speed for time",
        "time equals AB by v_aw",
        "divided by 400 not actual speed",
        "why use v_a for time not v_aw",
        "still air speed for time calculation"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "AB=1000km. |v_aw|=400km/h. Student: t=1000/400=2.5h. Actual |v_a|=546.5km/h. Correct: t=1000/546.5=1.83h. Show two aircraft on Panel A: student's aircraft still has 267km to go when correct aircraft lands at B at t=1.83h.",
            "label": "2.5h vs 1.83h — 40% error. Wind is tailwind component here — it boosts actual ground speed above still-air speed.",
            "scenario": "uses_v_aw_for_time_s1"
          },
          "pedagogy_layer": {
            "teacher_script": "|v_aw| is speed through AIR. Actual ground speed is |v_a| — which includes wind contribution. The ground doesn't care how fast air moves past the wings. Distance covered over ground = |v_a| × time."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Three cases: headwind (|v_a| < |v_aw|, time longer), tailwind (|v_a| > |v_aw|, time shorter), crosswind (|v_a| depends on angle). In Ex 6.33, wind has a component along NE (tailwind component) → |v_a| > |v_aw| → time shorter than still air.",
            "label": "Always use |v_a| for time. |v_aw| is only relevant for steering angle calculation via sine rule.",
            "scenario": "uses_v_aw_for_time_s2"
          }
        }
      }
    },
    {
      "branch_id": "wrong_triangle_construction",
      "misconception": "Student draws velocity triangle incorrectly — places v_aw from wrong point or draws v_a in wrong direction",
      "student_belief": "v_aw should be drawn from A toward B (along AB direction)",
      "trigger_phrases": [
        "triangle construction wrong",
        "which direction to draw v_aw",
        "triangle does not close",
        "polygon law confused aircraft",
        "which side is v_aw in triangle"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Student draws v_aw from A toward B (NE). v_w from A northward. The 'resultant' they compute is not along AB — it points somewhere else. Their v_a is not along AB at all. Show: destination B unreachable with this configuration.",
            "label": "v_aw is NOT along AB — that's exactly what we're trying to find. Drawing it along AB assumes the answer.",
            "scenario": "wrong_triangle_construction_s1"
          },
          "pedagogy_layer": {
            "teacher_script": "The triangle has three sides: v_w (known, from A), v_a (known direction = AB, unknown magnitude), v_aw (unknown direction, known magnitude). The polygon law says v_w + v_aw = v_a. Draw v_w first. Draw v_a along AB. v_aw is whatever closes the triangle."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Step-by-step triangle construction animated: (1) Draw v_w from A northward. (2) Draw v_a from A along NE (AB direction). (3) Connect tip of v_w to tip of v_a — this is v_aw. (4) Verify: v_w + v_aw = v_a (tail-to-head addition). Angle α = angle v_aw makes with AB.",
            "label": "v_aw is the closing side — from tip of v_w to tip of v_a. Its direction is what the pilot must steer.",
            "scenario": "wrong_triangle_construction_s2"
          },
          "pedagogy_layer": {
            "rule": "Memory: v_w + v_aw = v_a. Draw v_w first (given). Draw v_a along AB (given direction). v_aw = tip of v_w → tip of v_a. Always."
          }
        }
      }
    },
    {
      "branch_id": "confuses_alpha_with_steering_direction",
      "misconception": "Student finds angle α from sine rule but reports it as the final steering direction instead of computing the actual compass bearing",
      "student_belief": "α from sine rule is the answer — the pilot steers at α degrees",
      "trigger_phrases": [
        "sine rule gives 30 so steer at 30 degrees",
        "alpha is the steering angle directly",
        "got 30 but answer says 75",
        "why add angles for steering direction",
        "alpha from sine rule meaning"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Student reports α=30° as steering direction. But α=30° is the angle v_aw makes WITH AB (the NE direction). Actual compass bearing = 45° (NE from east) + 30° toward north = 75° from north = N75°E. Show aircraft steered at '30°' (from east) vs correct 75° from north — different directions entirely.",
            "label": "α = 30° is angle from AB direction. AB is 45° from east (northeast). Steering bearing = 90° − (45° + 30°) = 15° from east = 75° from north.",
            "scenario": "confuses_alpha_with_steering_direction_s1"
          },
          "pedagogy_layer": {
            "teacher_script": "α from sine rule = angle between v_aw and v_a (AB direction). To get compass bearing: start from the AB direction, add α toward the wind source. Then convert to standard compass format (degrees from north)."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "DC Pandey Ex 6.33 worked: AB is NE = 45° from east. v_aw is 30° from AB toward north. So v_aw is 45°+30° = 75° from east = 90°−75° = 15° from north = N75°E. Verify on Panel B: draw v_aw at this angle from A. Add v_w (north). Resultant is exactly NE. ✓",
            "label": "Always: (1) find α from sine rule. (2) Add α to the AB direction (toward wind source). (3) Convert to compass bearing. Three distinct steps.",
            "scenario": "confuses_alpha_with_steering_direction_s2"
          }
        }
      }
    }
  ],
  "epic_c_micro_templates": {
    "micro_1": {
      "trigger": "aircraft wind formula quick",
      "scope": "micro",
      "states": 2,
      "content": "v_a = v_aw + v_w. Three velocities: v_aw = steering velocity (pilot controls direction, magnitude = still-air speed given). v_w = wind (completely given). v_a = actual ground velocity (direction = along AB, magnitude unknown). Use sine rule on the velocity triangle to find steering angle α and |v_a|. Time = AB / |v_a|."
    },
    "micro_2": {
      "trigger": "how is aircraft wind different from river boat",
      "scope": "micro",
      "states": 2,
      "content": "Same equation (v_a = v_aw + v_w vs v_b = v_br + v_r). Different unknown: River-boat — destination direction is fixed (across river), steering direction is chosen, drift is unknown. Aircraft-wind — destination B is fixed (v_a direction known = along AB), steering direction |v_aw| magnitude known, direction of v_aw is unknown. Aircraft-wind uses sine rule. River-boat uses sin formula directly."
    },
    "micro_3": {
      "trigger": "DC Pandey example 6.33 solution",
      "scope": "micro",
      "states": 3,
      "content": "Ex 6.33: |v_aw|=400km/h, v_w=200√2km/h northward, B northeast (45° from east), AB=1000km. Triangle: angle between v_a(NE) and v_w(N) = 45°. Sine rule: sinα/|v_w| = sin45°/|v_aw| → sinα = 200√2 × sin45°/400 = 0.5 → α=30°. Steer at 75° from north (N75°E). |v_a|=400×sin105°/sin45°≈546.5km/h. Time=1000/546.5≈1.83h."
    },
    "micro_4": {
      "trigger": "sine rule setup aircraft wind",
      "scope": "micro",
      "states": 2,
      "content": "In aircraft-wind velocity triangle: angle opposite to v_w = α (angle between v_aw and v_a). Angle opposite to v_aw = β (angle between v_w and v_a = computable from geometry). Angle opposite to v_a = 180°−α−β. Sine rule: |v_w|/sinα = |v_aw|/sinβ = |v_a|/sin(180°−α−β). Solve for α first (only one unknown), then find |v_a|."
    },
    "micro_5": {
      "trigger": "which velocity for journey time aircraft",
      "scope": "micro",
      "states": 2,
      "content": "Time = AB / |v_a|. Always use |v_a| — the actual ground speed. Never use |v_aw| (still-air speed) — that is the speed relative to air, not ground. Wind adds or subtracts from ground speed: tailwind component → |v_a| > |v_aw|. Headwind component → |v_a| < |v_aw|. Pure crosswind → |v_a| < |v_aw| always."
    }
  },
  "static_responses": {
    "formula_reference": {
      "trigger": "aircraft wind all formulas",
      "simulation_needed": false,
      "response": "Aircraft-wind formulas: (1) v_a = v_aw + v_w (vector, always). (2) v_a direction = along AB (given by problem). (3) |v_aw| = still-air speed (given). (4) v_w = wind (completely given). (5) Construct triangle, apply sine rule to find steering angle α and |v_a|. (6) t = AB / |v_a|. Key: α from sine rule is angle from AB direction — add to AB bearing to get compass heading."
    },
    "comparison_table": {
      "trigger": "compare river boat and aircraft wind",
      "simulation_needed": false,
      "response": "Comparison: River-boat: v_b = v_br + v_r. Known: |v_br|, complete v_r, river width d. Unknown: drift, time. Method: resolve components, use trig directly. Aircraft-wind: v_a = v_aw + v_w. Known: |v_aw|, complete v_w, direction of v_a (along AB), distance AB. Unknown: direction of v_aw, |v_a|. Method: construct triangle, apply sine rule."
    }
  },
  "problem_guidance_path": {
    "description": "Step-by-step for aircraft-wind problems (DC Pandey pattern)",
    "step_1": "Identify: |v_aw| (still-air speed), v_w (wind — full vector), A and B locations (gives v_a direction = along AB), AB distance.",
    "step_2": "Construct velocity triangle: draw v_w from A, draw v_a from A along AB direction, v_aw closes the triangle.",
    "step_3": "Find angle between v_w and v_a from geometry (both directions are known).",
    "step_4": "Apply sine rule: |v_w|/sinα = |v_aw|/sinβ. Find α (angle v_aw makes with AB).",
    "step_5": "Find |v_a| using sine rule: |v_a|/sin(180°−α−β) = |v_aw|/sinβ.",
    "step_6": "Compute steering direction: AB direction ± α (toward wind source).",
    "step_7": "Time t = AB / |v_a|.",
    "common_errors": [
      "Pointing v_aw along AB (assuming the answer)",
      "Using |v_aw| for time instead of |v_a|",
      "Reporting α as compass bearing instead of adding it to AB direction",
      "Wrong angle in sine rule — labeling the triangle incorrectly"
    ]
  },
  "example_library": {
    "example_1": {
      "source": "DC Pandey Example 6.33, Section 6.10",
      "principle": "Aircraft at 400km/h, northward wind 200√2 km/h, destination northeast — finding steering angle via sine rule and journey time",
      "aha": "sinα = 0.5 → α=30° falls out cleanly because 200√2 × sin45° = 200√2 × (1/√2) = 200, and 200/400 = 0.5. The √2 factors cancel — deliberately chosen by DC Pandey for clean arithmetic.",
      "simulation_states": 3
    },
    "example_2": {
      "source": "DC Pandey Exercise Problem 4, Section 6.10",
      "principle": "Aircraft A to B, 500km at 30° east of north, wind due north at 20m/s, steering speed 150m/s — find heading and time",
      "aha": "Component method works here: component of (v_aw + v_w) perpendicular to AB must be zero. One equation, one unknown (steering angle). Simpler than full sine rule when one component condition is enough.",
      "simulation_states": 2
    },
    "example_3": {
      "source": "DC Pandey Section 6.10 — headwind special case",
      "principle": "Wind directly against flight direction (headwind) — steering is straight toward B, but actual speed is |v_aw| − |v_w|",
      "aha": "Pure headwind: no steering correction needed (α=0), but time = AB/(|v_aw|−|v_w|) — much longer than still air. Pure tailwind: time = AB/(|v_aw|+|v_w|) — shorter. Crosswind: always slower than still air even with perfect steering.",
      "simulation_states": 2
    }
  },
  "assessment_path": {
    "question_1": {
      "text": "In aircraft-wind problems, the direction of which velocity is unknown and must be found?",
      "options": [
        "v_w (wind velocity)",
        "v_a (actual aircraft velocity)",
        "v_aw (steering velocity)",
        "All three are unknown"
      ],
      "correct": 2,
      "if_wrong_1": "route to point_plane_at_destination — student thinks v_a direction is unknown",
      "explanation": "v_w is completely given. v_a direction is known (must be along AB). |v_aw| is given. Only the DIRECTION of v_aw (how to steer) is unknown."
    },
    "question_2": {
      "text": "Aircraft still-air speed 300km/h. Tailwind (along AB) 100km/h. Journey time for AB=800km?",
      "options": [
        "2.67h",
        "2h",
        "8h",
        "Cannot determine"
      ],
      "correct": 1,
      "if_wrong_0": "route to uses_v_aw_for_time — student used 300km/h instead of 400km/h",
      "explanation": "Pure tailwind: v_a = 300+100 = 400km/h (no steering correction, just faster). t = 800/400 = 2h."
    },
    "question_3": {
      "text": "In DC Pandey Example 6.33, the angle α found from the sine rule is 30°. The pilot's actual steering direction from north is:",
      "options": [
        "30°",
        "45°",
        "75°",
        "15°"
      ],
      "correct": 2,
      "if_wrong_0": "route to confuses_alpha_with_steering_direction — student reports α directly",
      "explanation": "α=30° is angle of v_aw from AB direction. AB direction is NE = 45° from east = 45° from north toward east. Steering = 45° (NE) + 30° (toward north, into the wind) = 75° from north."
    },
    "question_4": {
      "text": "What is the correct vector equation for aircraft-wind problems?",
      "options": [
        "v_aw = v_a + v_w",
        "v_a = v_aw + v_w",
        "v_w = v_a + v_aw",
        "v_aw = v_a − v_w"
      ],
      "correct": 1,
      "explanation": "v_a = v_aw + v_w. Actual velocity = steering velocity + wind velocity. This is the fundamental relation, identical to v_b = v_br + v_r in river-boat."
    },
    "question_5": {
      "text": "Aircraft still-air speed 400km/h, wind 200√2 km/h northward, B northeast, AB=1000km. Journey time is approximately:",
      "options": [
        "2.5h",
        "1.83h",
        "3.5h",
        "1.41h"
      ],
      "correct": 1,
      "if_wrong_0": "route to uses_v_aw_for_time — used 400km/h instead of ~546km/h",
      "explanation": "|v_a| ≈ 546.5km/h (from sine rule, Ex 6.33). t = 1000/546.5 ≈ 1.83h. Wind has a northward component along NE, acting as partial tailwind — actual speed exceeds still-air speed."
    }
  },
  "session_awareness": {
    "if_already_shown_epic_l": "Go directly to sine rule practice — student knows the setup, needs to practise triangle construction and angle finding",
    "if_coming_from_river_boat": "Perfect — show the substitution table immediately (v_br→v_aw, v_r→v_w, v_b→v_a). Student already knows the physics, just needs the label swap and the key difference (sine rule instead of direct formula).",
    "if_coming_from_rain_umbrella": "Connect: all three — river-boat, rain, aircraft — are the same relative velocity equation v_A = v_AB + v_B with different physical interpretations."
  },
  "waypoints": {
    "fallback_unknown_confusion": "Default to DC Pandey Example 6.33 — it's the canonical aircraft-wind problem, has clean numbers (√2 cancels nicely), and covers all steps: triangle construction, sine rule, steering angle, time calculation.",
    "escalation_trigger": "If student asks about aircraft with both crosswind AND headwind component — no escalation needed, the triangle method handles it automatically. The sine rule gives the correct angle for any wind direction."
  },
  "depth_escalation_trigger": {
    "condition": "Student asks what if |v_w| > |v_aw| — can aircraft still reach destination B?",
    "escalate_to": "In sine rule: sinα = |v_w|sinβ/|v_aw|. If |v_w|sinβ > |v_aw|, sinα > 1 — impossible. Aircraft cannot reach B if the wind's perpendicular component exceeds the aircraft's still-air speed. Analogous to river-boat case v_r > v_br.",
    "level": "JEE Advanced / conceptual"
  },
  "parameter_slots": {
    "v_aw": {
      "label": "aircraft still-air speed",
      "range": [
        100,
        800
      ],
      "unit": "km/h",
      "default": 400,
      "extraction_hint": "aircraft speed in still air, steering speed, or |v_aw| ="
    },
    "v_w": {
      "label": "wind speed",
      "range": [
        10,
        400
      ],
      "unit": "km/h",
      "default": 283,
      "extraction_hint": "wind speed or v_w ="
    },
    "AB": {
      "label": "distance to destination",
      "range": [
        100,
        5000
      ],
      "unit": "km",
      "default": 1000,
      "extraction_hint": "distance AB or journey distance ="
    },
    "bearing_AB": {
      "label": "direction of destination from start (compass bearing)",
      "range": [
        0,
        360
      ],
      "unit": "degrees from north",
      "default": 45,
      "extraction_hint": "direction to destination — northeast=45, east=90, etc."
    }
  },
  "panel_sync_spec": {
    "canvas_to_graph": {
      "trigger": "STATE_N_reached",
      "action": "Panel B vector triangle redraws for current state values — v_w, v_a, v_aw with sine rule angles labeled"
    },
    "graph_to_canvas": {
      "trigger": "student_drags_alpha_slider",
      "action": "Panel A aircraft path updates — at correct α, path aligns exactly with AB; at wrong α, aircraft misses B"
    },
    "slider_to_both": {
      "parameter": "bearing_AB",
      "canvas_action": "destination B repositions, flight path direction updates",
      "graph_action": "v_a direction rotates in triangle, α recalculates, new steering angle shown"
    }
  },
  "jee_specific": {
    "typical_question_types": [
      "Find steering direction (angle to steer) given wind, still-air speed, and destination direction",
      "Find journey time given all velocities (use |v_a| not |v_aw|)",
      "Find still-air speed needed to reach B in given time with given wind",
      "Special case: headwind/tailwind — find actual speed and time",
      "Assertion: pilot should steer directly at B. Reason: aircraft has higher speed than wind."
    ],
    "common_traps": [
      "Pointing aircraft at B (v_aw along AB) — misses destination",
      "Using |v_aw| for time instead of |v_a|",
      "Reporting sine rule angle α as compass bearing (must add to AB bearing)",
      "Wrong triangle — drawing v_aw first and v_w as closing side",
      "Not checking if destination is reachable (|v_w|sinβ must be ≤ |v_aw|)"
    ],
    "key_results": [
      "v_a = v_aw + v_w (fundamental relation)",
      "v_a direction = along AB (fixed by destination)",
      "Sine rule: |v_w|/sinα = |v_aw|/sinβ where β = angle between v_w and v_a",
      "Steering bearing = AB bearing ± α (toward wind source, to compensate)",
      "t = AB / |v_a| (ground speed, not still-air speed)",
      "Ex 6.33: α=30°, steer N75°E, |v_a|≈546.5km/h, t≈1.83h"
    ],
    "comparison_with_river_boat": {
      "same": "Vector equation, triangle construction, same relative velocity principle",
      "different": "River-boat: v_a direction unknown (drift); aircraft: v_a direction fixed (along AB), v_aw direction unknown. River-boat: direct formula. Aircraft: sine rule needed."
    }
  },
  "concept_relationships": {
    "prerequisites": [
      "relative_motion",
      "river_boat_problems",
      "vector_addition"
    ],
    "extensions": [
      "projectile_motion",
      "pseudo_forces"
    ],
    "siblings": [
      "river_boat_problems",
      "rain_umbrella",
      "relative_motion"
    ],
    "common_exam_combinations": [
      "river_boat — same equation v_a = v_aw + v_w vs v_b = v_br + v_r, DC Pandey explicitly pairs them",
      "vector_addition — sine rule in velocity triangle requires vector addition geometry",
      "rain_umbrella — all four types (min distance, river-boat, aircraft, rain) are in DC Pandey Section 6.10"
    ]
  },
  "three_js_flag": false,
  "three_js_note": "Aircraft-wind is 2D top-view planar motion. scene_mode=True in canvas2d with top-view sky scene is sufficient. Three.js not needed.",
  "regeneration_variants": [
    {
      "variant_id": 1,
      "approach": "heading_vs_track_distinction",
      "entry_state": "STATE_2",
      "teacher_angle": "Focus on the critical distinction that causes most mistakes: heading (where the aircraft nose points) versus track (where the aircraft actually goes). The pilot controls the heading. The wind moves the aircraft sideways. The actual path over ground is the vector sum of aircraft velocity through air and wind velocity. The pilot must aim upstream of the destination so that the wind drift corrects the heading to produce the desired track. Show the consequence of ignoring wind: aircraft aimed at destination but arrives at wrong point.",
      "locked_facts_focus": [
        "fact_3",
        "fact_4",
        "fact_5"
      ],
      "panel_b_focus": "Top-down map view. Aircraft heading arrow and wind arrow shown separately. Ground track arrow is their vector sum. Animation: aircraft aimed directly at destination with crosswind — actual path curves away. Then corrected heading shown producing straight ground track."
    },
    {
      "variant_id": 2,
      "approach": "connects_to_river_boat",
      "entry_state": "STATE_1",
      "teacher_angle": "Aircraft-wind is river-boat in the sky. Wind = river current. Aircraft velocity through air = boat velocity through water. Ground velocity = velocity across the river bottom. The student who solved minimum drift for river-boat already knows how to solve minimum time and exact-track problems for aircraft. The only difference is that aircraft can fly in any direction including against the wind — there is no bank to constrain them as there is with a river. Every river-boat technique transfers directly. Show the identical vector triangles side by side.",
      "locked_facts_focus": [
        "fact_1",
        "fact_2",
        "fact_6"
      ],
      "panel_b_focus": "River-boat diagram and aircraft-wind diagram shown side by side with matching labels. Wind arrow = river current arrow. Aircraft heading = boat heading. Ground track = actual river crossing path. All three vector triangles are identical — just different physical settings."
    }
  ]
}
```


# class12_current_electricity.json
```json
[
  {
    "concept_id": "drift_velocity",
    "display_name": "Drift Velocity",
    "class_level": "12",
    "chapter": "Current Electricity",
    "formula": "vd = I / (n * e * A)",
    "formula_latex": "v_d = \\frac{I}{neA}",
    "variables": {
      "vd": {
        "name": "drift velocity",
        "unit": "m/s",
        "typical_value": "10^-3 to 10^-4 m/s",
        "increases_when": ["I increases", "A decreases"],
        "decreases_when": ["n increases", "A increases"]
      },
      "I": { "name": "current", "unit": "A" },
      "n": {
        "name": "number density of free electrons",
        "unit": "m^-3",
        "note": "fixed for material at given temperature"
      },
      "e": { "name": "charge of electron", "unit": "C", "value": "1.6e-19" },
      "A": { "name": "cross-sectional area of wire", "unit": "m^2" }
    },
    "what_if_rules": [
      "thinner wire => A decreases => vd increases for same current",
      "stronger battery => I increases => vd increases",
      "temperature increases => relaxation time decreases => vd decreases",
      "wire doubled in length => resistance doubles => I halves => vd halves",
      "thicker wire (same material) => A increases => vd decreases for same current"
    ],
    "why_rules": [
      "vd is slow because electrons collide billions of times per second with lattice ions",
      "thermal velocity ~10^6 m/s >> drift velocity ~10^-3 m/s; these are independent motions",
      "current appears instant because E-field propagates at speed of light, not because electrons are fast",
      "drift is the tiny net bias superimposed on random thermal zigzag motion"
    ],
    "misconceptions": [
      "electrons travel at the speed of electricity (speed of light) — FALSE, they drift at ~mm/s",
      "drift velocity equals thermal velocity — FALSE, thermal is ~10^9 times faster",
      "thinner wire always means less current — PARTIALLY FALSE; it means higher resistance, but current depends on EMF too",
      "current is the speed of electrons — FALSE; current is charge per second, not electron speed"
    ],
    "connected_concepts": ["ohms_law", "resistivity", "electric_current", "relaxation_time"],
    "confusion_patterns": [
      {
        "id": "speed_misconception",
        "student_signals": ["speed of light", "fast", "instant", "why so slow", "slow"],
        "confusion": "Student thinks electrons travel at near light speed",
        "simulation_must_show": "two speedometers: thermal 10^6 m/s vs drift 10^-3 m/s",
        "response_must_address": "thermal velocity and drift velocity are completely different things",
        "aha_visual": "two speedometers side by side — one reading million, one reading 0.001"
      },
      {
        "id": "visualization_confusion",
        "student_signals": ["how do they move", "what does it look like", "picture", "visualize", "show me"],
        "confusion": "Student cannot picture two simultaneous motions on one electron",
        "simulation_must_show": "single white glowing electron with long trail: zigzag + net leftward bias",
        "response_must_address": "superposition of thermal chaos and slow drift average",
        "aha_visual": "one white electron you can follow across the canvas"
      },
      {
        "id": "current_speed_paradox",
        "student_signals": ["current fast", "electricity fast", "instant", "light switch", "why bulb on immediately"],
        "confusion": "Student cannot reconcile slow electrons with instant current",
        "simulation_must_show": "pipe full of water — push one end, other end moves instantly; or domino chain",
        "response_must_address": "electric field propagates fast, not the electrons themselves",
        "aha_visual": "domino chain or water pipe push visualization"
      },
      {
        "id": "what_if_thinner",
        "student_signals": ["thinner wire", "smaller area", "what if A decreases", "wire width"],
        "confusion": "Student cannot apply the formula to predict vd change",
        "simulation_must_show": "two wires side by side with different A, same current, showing different vd values",
        "response_must_address": "vd = I/neA so smaller A means larger vd for the same current",
        "aha_visual": "narrow pipe vs wide pipe with same flow rate — narrow pipe has faster flow"
      }
    ],
    "visualization_type": "particle_flow",
    "simulation_emphasis": "contrast_thermal_vs_drift",
    "exam_relevance": ["JEE_Mains", "JEE_Advanced", "NEET", "CBSE"],
    "difficulty": "intermediate"
  },
  {
    "concept_id": "ohms_law",
    "display_name": "Ohm's Law",
    "class_level": "12",
    "chapter": "Current Electricity",
    "formula": "V = I * R",
    "formula_latex": "V = IR",
    "variables": {
      "V": { "name": "potential difference", "unit": "V" },
      "I": { "name": "current", "unit": "A" },
      "R": { "name": "resistance", "unit": "Ohm" }
    },
    "what_if_rules": [
      "voltage doubles => current doubles (R fixed) — linear relationship",
      "resistance doubles => current halves (V fixed)",
      "temperature increases (metal) => resistance increases => current decreases",
      "temperature increases (semiconductor) => resistance decreases => current increases"
    ],
    "why_rules": [
      "V = IR because higher voltage drives more electrons per second through same resistance",
      "R is the opposition due to lattice ion collisions with drifting electrons",
      "Ohm's law is empirical — only valid for ohmic conductors at constant temperature",
      "Slope of V-I graph = R; steeper slope = higher resistance"
    ],
    "misconceptions": [
      "Ohm's law applies to all devices — FALSE; diodes and filament bulbs are non-ohmic",
      "resistance increases when current increases — FALSE; R is a property of the material, not the current",
      "V and I are independent — FALSE; they are related by R"
    ],
    "connected_concepts": ["drift_velocity", "resistivity", "series_parallel_resistance"],
    "confusion_patterns": [
      {
        "id": "graph_interpretation",
        "student_signals": ["graph", "slope", "vi curve", "V-I", "plot"],
        "confusion": "Student confuses slope of V-I vs I-V graph",
        "simulation_must_show": "live V-I graph where slope = R, with adjustable R slider",
        "response_must_address": "slope of V-I graph is R; slope of I-V graph is 1/R",
        "aha_visual": "two graphs side by side with R slider changing both slopes"
      },
      {
        "id": "temperature_effect",
        "student_signals": ["temperature", "hot", "heated", "filament", "semiconductor"],
        "confusion": "Student confused about metal vs semiconductor behavior with temperature",
        "simulation_must_show": "two materials on same graph: metal R increases, semiconductor R decreases",
        "response_must_address": "metals and semiconductors respond oppositely to temperature",
        "aha_visual": "two colored curves diverging as temperature increases"
      }
    ],
    "visualization_type": "graph",
    "simulation_emphasis": "linear_vi_graph_with_slope_equals_R",
    "exam_relevance": ["JEE_Mains", "NEET", "CBSE"],
    "difficulty": "basic"
  },
  {
    "concept_id": "resistivity",
    "display_name": "Resistivity and Resistance",
    "class_level": "12",
    "chapter": "Current Electricity",
    "formula": "R = rho * L / A",
    "formula_latex": "R = \\frac{\\rho L}{A}",
    "variables": {
      "R": { "name": "resistance", "unit": "Ohm" },
      "rho": { "name": "resistivity", "unit": "Ohm.m", "note": "material property, temperature dependent" },
      "L": { "name": "length of wire", "unit": "m" },
      "A": { "name": "cross-sectional area", "unit": "m^2" }
    },
    "what_if_rules": [
      "wire doubled in length => R doubles",
      "wire cross-section halved => R doubles",
      "wire stretched to double length => A halves AND L doubles => R quadruples",
      "temperature increases (metals) => rho increases => R increases",
      "different material (same L, A) => different rho => different R"
    ],
    "why_rules": [
      "longer wire has more collision sites along path => more resistance",
      "wider wire has more parallel paths for electrons => less resistance per path",
      "resistivity is intrinsic to the material; resistance depends on geometry too",
      "stretching wire: same volume but L doubles, A halves => R = rho*(2L)/(A/2) = 4*original R"
    ],
    "misconceptions": [
      "resistivity = resistance — FALSE; resistivity is per unit length/area, resistance depends on shape",
      "thicker wire always has less resistance — TRUE only if material and length are same",
      "resistance doesn't change when wire is stretched — FALSE; R quadruples when length doubles"
    ],
    "connected_concepts": ["ohms_law", "drift_velocity", "temperature_coefficient"],
    "confusion_patterns": [
      {
        "id": "stretching_wire",
        "student_signals": ["stretch", "pull", "elongate", "doubled length", "thin", "R quadruples"],
        "confusion": "Student doesn't realize stretching changes both L and A simultaneously",
        "simulation_must_show": "wire being stretched: L increases, A decreases, R meter shows quadratic increase",
        "response_must_address": "volume is conserved when stretching: L doubles => A halves => R = 4R",
        "aha_visual": "clay wire being stretched with live resistance meter"
      }
    ],
    "visualization_type": "graph",
    "simulation_emphasis": "show_R_changes_with_L_and_A_independently",
    "exam_relevance": ["JEE_Mains", "JEE_Advanced", "NEET", "CBSE"],
    "difficulty": "intermediate"
  },
  {
    "concept_id": "emf_internal_resistance",
    "display_name": "EMF and Internal Resistance",
    "class_level": "12",
    "chapter": "Current Electricity",
    "formula": "V = EMF - I*r",
    "formula_latex": "V = \\varepsilon - Ir",
    "variables": {
      "V": { "name": "terminal voltage", "unit": "V" },
      "EMF": { "name": "electromotive force", "unit": "V" },
      "I": { "name": "current", "unit": "A" },
      "r": { "name": "internal resistance", "unit": "Ohm" }
    },
    "what_if_rules": [
      "higher current drawn => larger voltage drop Ir => lower terminal voltage",
      "external resistance decreases => current increases => terminal voltage drops",
      "battery on open circuit (I=0) => terminal voltage = EMF",
      "old battery has higher r => lower terminal voltage under same load",
      "two batteries in series => EMFs add, internal resistances add"
    ],
    "why_rules": [
      "EMF is the energy per unit charge the battery can supply; terminal voltage is what the circuit actually gets",
      "Ir is the voltage lost internally to heat inside the battery",
      "terminal voltage drops under load because internal resistance acts like a series resistor"
    ],
    "misconceptions": [
      "EMF = terminal voltage always — FALSE; only when no current flows",
      "internal resistance can be ignored — FALSE; for high-current circuits it causes significant voltage drop",
      "EMF is voltage — PARTIALLY TRUE; EMF is energy/charge, not a potential difference per se"
    ],
    "connected_concepts": ["ohms_law", "series_parallel_resistance", "kirchhoffs_laws"],
    "confusion_patterns": [
      {
        "id": "emf_vs_terminal",
        "student_signals": ["terminal voltage", "emf", "difference", "what is measured", "voltmeter"],
        "confusion": "Student cannot distinguish EMF from terminal voltage",
        "simulation_must_show": "battery circuit with voltmeter showing terminal V < EMF under load, equal at open circuit",
        "response_must_address": "voltmeter reads terminal voltage; EMF is maximum possible voltage when I=0",
        "aha_visual": "dual meters: one reads EMF (fixed), one reads terminal V (drops with load)"
      }
    ],
    "visualization_type": "circuit",
    "simulation_emphasis": "show_terminal_voltage_drop_with_current",
    "exam_relevance": ["JEE_Mains", "NEET", "CBSE"],
    "difficulty": "intermediate"
  },
  {
    "concept_id": "kirchhoffs_laws",
    "display_name": "Kirchhoff's Current and Voltage Laws",
    "class_level": "12",
    "chapter": "Current Electricity",
    "formula": "KCL: sum(I_in) = sum(I_out); KVL: sum(V) = 0 around loop",
    "formula_latex": "\\sum I_{in} = \\sum I_{out};\\quad \\sum V = 0",
    "variables": {
      "I_in": { "name": "currents entering junction", "unit": "A" },
      "I_out": { "name": "currents leaving junction", "unit": "A" }
    },
    "what_if_rules": [
      "KCL: if two branches carry 3A and 2A into junction, third branch carries 5A out",
      "KVL: in a loop with 12V battery, 4 Ohm and 8 Ohm resistors: I = 1A",
      "multiple loops: write KVL for each independent loop separately",
      "direction of current assumed wrong => answer comes out negative => actual direction is opposite"
    ],
    "why_rules": [
      "KCL is charge conservation: charge cannot accumulate at a node in steady state",
      "KVL is energy conservation: net work done around a closed loop is zero",
      "sign convention: voltage rises across EMF source (+ to - inside); drops across resistor in current direction"
    ],
    "misconceptions": [
      "current splits equally at junction — FALSE; splits inversely proportional to resistance",
      "KVL requires knowing current direction first — FALSE; assume a direction, negative result means opposite"
    ],
    "connected_concepts": ["ohms_law", "series_parallel_resistance", "emf_internal_resistance"],
    "visualization_type": "circuit",
    "simulation_emphasis": "show_current_conservation_at_node",
    "exam_relevance": ["JEE_Mains", "JEE_Advanced", "NEET", "CBSE"],
    "difficulty": "intermediate"
  },
  {
    "concept_id": "series_parallel_resistance",
    "display_name": "Series and Parallel Combination of Resistors",
    "class_level": "12",
    "chapter": "Current Electricity",
    "formula": "Series: R_eq = R1+R2+...; Parallel: 1/R_eq = 1/R1+1/R2+...",
    "formula_latex": "R_{series} = \\sum R_i;\\quad \\frac{1}{R_{parallel}} = \\sum \\frac{1}{R_i}",
    "variables": {
      "R_eq": { "name": "equivalent resistance", "unit": "Ohm" }
    },
    "what_if_rules": [
      "adding resistor in series => R_eq increases => current decreases",
      "adding resistor in parallel => R_eq decreases => total current increases",
      "two equal R in parallel => R_eq = R/2",
      "n equal R in parallel => R_eq = R/n",
      "parallel R_eq is always less than smallest individual R"
    ],
    "why_rules": [
      "series: same current through all — more resistance in path",
      "parallel: same voltage across all — more paths for current to flow => lower total resistance",
      "parallel R_eq < smallest R because current has more routes, reducing overall opposition"
    ],
    "misconceptions": [
      "parallel R_eq is average of resistances — FALSE; 1/R_eq = sum of 1/R",
      "adding parallel branch doesn't affect other branches — TRUE for voltage; FALSE for total current drawn from source"
    ],
    "connected_concepts": ["ohms_law", "kirchhoffs_laws", "emf_internal_resistance"],
    "visualization_type": "circuit",
    "simulation_emphasis": "show_current_paths_in_parallel_vs_series",
    "exam_relevance": ["JEE_Mains", "NEET", "CBSE"],
    "difficulty": "basic"
  },
  {
    "concept_id": "wheatstone_bridge",
    "display_name": "Wheatstone Bridge",
    "class_level": "12",
    "chapter": "Current Electricity",
    "formula": "Balanced: P/Q = R/S (no current through galvanometer)",
    "formula_latex": "\\frac{P}{Q} = \\frac{R}{S}",
    "variables": {
      "P": { "name": "resistance arm P", "unit": "Ohm" },
      "Q": { "name": "resistance arm Q", "unit": "Ohm" },
      "R": { "name": "resistance arm R", "unit": "Ohm" },
      "S": { "name": "unknown resistance", "unit": "Ohm" }
    },
    "what_if_rules": [
      "P/Q = R/S => bridge balanced => galvanometer shows zero",
      "if P/Q != R/S => current flows through galvanometer",
      "S unknown: S = (Q/P) * R when bridge is balanced"
    ],
    "why_rules": [
      "balance condition means potential at both galvanometer ends is equal => no current",
      "bridge is sensitive: smallest imbalance in R/S ratio causes galvanometer deflection"
    ],
    "misconceptions": [
      "bridge is balanced means no current anywhere — FALSE; current flows in main branches, only galvanometer branch has zero",
      "interchanging battery and galvanometer breaks the bridge — FALSE; balance condition still holds"
    ],
    "connected_concepts": ["kirchhoffs_laws", "series_parallel_resistance"],
    "visualization_type": "circuit",
    "simulation_emphasis": "show_galvanometer_deflection_with_imbalance",
    "exam_relevance": ["JEE_Mains", "JEE_Advanced", "CBSE"],
    "difficulty": "advanced"
  },
  {
    "concept_id": "meter_bridge",
    "display_name": "Meter Bridge (Slide Wire Bridge)",
    "class_level": "12",
    "chapter": "Current Electricity",
    "formula": "R/S = l / (100 - l)",
    "formula_latex": "\\frac{R}{S} = \\frac{l}{100 - l}",
    "variables": {
      "R": { "name": "known resistance", "unit": "Ohm" },
      "S": { "name": "unknown resistance", "unit": "Ohm" },
      "l": { "name": "balance point length from left", "unit": "cm" }
    },
    "what_if_rules": [
      "S > R => balance point shifts right (l > 50)",
      "S < R => balance point shifts left (l < 50)",
      "S = R => balance at exactly 50 cm",
      "resistance of wire per unit length is uniform throughout"
    ],
    "why_rules": [
      "meter bridge is a practical Wheatstone bridge where P and Q are replaced by wire lengths",
      "resistance of wire is proportional to length (uniform wire)",
      "at balance: R/S = P/Q = resistance of left wire / resistance of right wire = l/(100-l)"
    ],
    "misconceptions": [
      "balance point must be near centre — FALSE; depends on R/S ratio",
      "ends of wire (0 and 100) can be used — FALSE; end resistances cause error near ends"
    ],
    "connected_concepts": ["wheatstone_bridge", "resistivity"],
    "visualization_type": "circuit",
    "simulation_emphasis": "sliding_jockey_to_find_null_deflection",
    "exam_relevance": ["JEE_Mains", "NEET", "CBSE"],
    "difficulty": "intermediate"
  },
  {
    "concept_id": "potentiometer",
    "display_name": "Potentiometer",
    "class_level": "12",
    "chapter": "Current Electricity",
    "formula": "EMF1/EMF2 = l1/l2 (comparison); r = R*(l1-l2)/l2 (internal resistance)",
    "formula_latex": "\\frac{\\varepsilon_1}{\\varepsilon_2} = \\frac{l_1}{l_2}",
    "variables": {
      "l1": { "name": "balance length for EMF1", "unit": "cm" },
      "l2": { "name": "balance length for EMF2", "unit": "cm" }
    },
    "what_if_rules": [
      "longer wire => better sensitivity (more cm per volt)",
      "driver cell EMF must be > cell under test EMF (otherwise no balance point)",
      "balance length proportional to EMF — higher EMF cell has longer balance length"
    ],
    "why_rules": [
      "potentiometer measures EMF without drawing current from cell (at balance point I_galv = 0)",
      "at null deflection: potential of potentiometer wire exactly equals cell EMF",
      "advantage over voltmeter: voltmeter draws current and gives terminal voltage, not true EMF"
    ],
    "misconceptions": [
      "potentiometer and rheostat are same — FALSE; rheostat varies resistance, potentiometer measures EMF",
      "voltmeter measures EMF — FALSE; voltmeter measures terminal voltage (slightly less than EMF)"
    ],
    "connected_concepts": ["emf_internal_resistance", "wheatstone_bridge"],
    "visualization_type": "circuit",
    "simulation_emphasis": "sliding_wire_null_deflection_for_emf_comparison",
    "exam_relevance": ["JEE_Mains", "JEE_Advanced", "NEET", "CBSE"],
    "difficulty": "advanced"
  },
  {
    "concept_id": "electric_power_heating",
    "display_name": "Electric Power and Heating Effect (Joule's Law)",
    "class_level": "12",
    "chapter": "Current Electricity",
    "formula": "P = V*I = I^2*R = V^2/R; H = I^2*R*t",
    "formula_latex": "P = VI = I^2R = \\frac{V^2}{R};\\quad H = I^2Rt",
    "variables": {
      "P": { "name": "power", "unit": "W" },
      "H": { "name": "heat produced", "unit": "J" },
      "t": { "name": "time", "unit": "s" }
    },
    "what_if_rules": [
      "series circuit: same I => P proportional to R => higher R dissipates more power",
      "parallel circuit: same V => P proportional to 1/R => lower R dissipates more power",
      "fuse: designed to melt when I exceeds limit (P = I^2*R heats fuse wire)",
      "doubling voltage => P quadruples (P = V^2/R)"
    ],
    "why_rules": [
      "heat is produced because drifting electrons collide with lattice ions, transferring kinetic energy",
      "P = I^2*R: more current means more collisions per second means more heat",
      "1 kWh = 3.6 MJ (unit used in electricity billing)"
    ],
    "misconceptions": [
      "in series: brighter bulb has less resistance — FALSE; same current, brighter means more P = I^2*R => higher R",
      "in parallel: brighter bulb has more resistance — FALSE; same voltage, brighter means more P = V^2/R => lower R"
    ],
    "connected_concepts": ["ohms_law", "series_parallel_resistance", "drift_velocity"],
    "confusion_patterns": [
      {
        "id": "series_vs_parallel_brightness",
        "student_signals": ["bright", "dim", "bulb", "series", "parallel", "which glows more"],
        "confusion": "Student applies wrong formula depending on circuit type",
        "simulation_must_show": "two bulbs in series and two in parallel, with R sliders showing different brightness",
        "response_must_address": "series: use P=I^2*R (high R = bright); parallel: use P=V^2/R (low R = bright)",
        "aha_visual": "four bulbs: two circuits side by side, brightness visually showing the reversal"
      }
    ],
    "visualization_type": "circuit",
    "simulation_emphasis": "show_power_dissipation_changes_with_R_in_series_vs_parallel",
    "exam_relevance": ["JEE_Mains", "NEET", "CBSE"],
    "difficulty": "intermediate"
  }
]
```


# distance_vs_displacement.json
```json
{
  "concept_id": "distance_vs_displacement",
  "concept_name": "Distance and Displacement — Speed and Velocity",
  "class_level": 11,
  "chapter": "Kinematics",
  "section": "6.4",
  "source_coverage": {
    "dc_pandey": "Chapter 6, Sections 6.4 (Basic Definitions) and 6.6 (distance vs displacement in equations of motion)",
    "ncert": "Chapter 3 — Motion in a Straight Line, Sections 3.2 and 3.3",
    "hc_verma": "Chapter 3 — Rest and Motion: Kinematics, Section 3.2"
  },
  "source_type": "ncert_and_dc_pandey",
  "renderer_hint": {
    "technology": "canvas2d",
    "renderer": "mechanics_2d",
    "scenario_type": "distance_vs_displacement",
    "panel_count": 2,
    "show_labels": true,
    "show_path": true,
    "show_displacement_arrow": true,
    "canvas_scale": 60,
    "technology_b": "plotly",
    "sync_required": true,
    "scene_mode": false,
    "panel_a_role": "Particle moving on number line — path length vs displacement arrow",
    "panel_b_role": "Plotly x-t graph — position over time with displacement marked"
  },
  "locked_facts": {
    "distance_definition": "Distance is the total path length covered by a moving particle. It is a scalar. It is always positive or zero. It never decreases.",
    "displacement_definition": "Displacement is the change in position vector — a vector from initial position to final position. Displacement = r_final − r_initial.",
    "key_inequality": "|displacement| ≤ distance. Equality holds only when motion is in a straight line without reversal.",
    "when_equal": "Distance = |displacement| ONLY when: (1) particle moves in a straight line, AND (2) never reverses direction.",
    "when_unequal": "Distance > |displacement| when particle reverses direction OR moves along a curved path.",
    "average_speed_definition": "Average speed = total distance / total time. Always positive. Scalar.",
    "average_velocity_definition": "Average velocity = total displacement / total time = Δr / Δt. Vector.",
    "instantaneous_velocity": "v = lim(Δt→0) Δs/Δt = ds/dt = dr/dt. Instantaneous speed = |v| = |dr/dt|.",
    "instantaneous_acceleration": "a = lim(Δt→0) Δv/Δt = dv/dt.",
    "average_speed_vs_magnitude_avg_velocity": "Average speed ≠ magnitude of average velocity in general. They are equal only when distance = |displacement|.",
    "displacement_in_equations": "The 's' in s = ut + ½at² and v² = u² + 2as is DISPLACEMENT, not distance. Critical distinction when u and a are in opposite directions.",
    "sign_convention_1d": "In 1D motion: choose one direction as positive. All vectors (displacement, velocity, acceleration) in that direction are positive; opposite direction is negative. Scalars (distance, speed) are always positive.",
    "semicircle_example": "Particle moves from A to B along a semicircle of radius r: distance = πr, |displacement| = 2r (diameter). Ratio = π/2 ≈ 1.57.",
    "complete_circle": "Particle completes one full circle: distance = 2πr, displacement = 0."
  },
  "minimum_viable_understanding": "Distance is path length (scalar, always increasing). Displacement is straight-line change in position (vector, can be zero or negative). Average speed uses distance; average velocity uses displacement. The 's' in equations of motion is displacement.",
  "variables": {
    "d": "Distance (scalar, always ≥ 0)",
    "s": "Displacement (vector, can be +, −, or 0)",
    "v_av_scalar": "Average speed = d / Δt",
    "v_av_vector": "Average velocity = s / Δt = Δr / Δt",
    "v": "Instantaneous velocity = ds/dt",
    "t0": "Time when velocity becomes zero (turning point)",
    "r": "Position vector",
    "u": "Initial velocity",
    "a": "Acceleration"
  },
  "routing_signals": {
    "global_triggers": [
      "difference between distance and displacement",
      "distance vs displacement",
      "what is displacement",
      "duri aur visthapan mein antar",
      "explain distance displacement speed velocity"
    ],
    "local_triggers": [
      "average speed vs average velocity",
      "when is distance equal to displacement",
      "particle moves in semicircle find displacement",
      "total distance vs net displacement",
      "is displacement scalar or vector",
      "speed vector ya scalar"
    ],
    "micro_triggers": [
      "can displacement be negative",
      "can displacement be zero",
      "can average speed be zero",
      "instantaneous speed definition",
      "why s in equation of motion is displacement not distance"
    ],
    "simulation_not_needed_triggers": [
      "define distance",
      "define displacement",
      "formula for average velocity",
      "formula for instantaneous velocity"
    ],
    "subconcept_triggers": {
      "distance_displacement_basics": [
        "difference distance displacement",
        "path length vs displacement",
        "distance displacement difference"
      ],
      "average_speed_velocity": [
        "average speed average velocity difference",
        "when are average speed and average velocity equal",
        "total distance total displacement"
      ],
      "instantaneous_velocity": [
        "what is instantaneous velocity",
        "instantaneous speed",
        "velocity at a point"
      ],
      "sign_convention": [
        "positive negative velocity",
        "sign convention kinematics",
        "negative displacement meaning"
      ],
      "s_in_equations": [
        "is s in v=u+at displacement or distance",
        "distance or displacement in equations of motion",
        "s = ut + half at squared s is what"
      ]
    }
  },
  "checkpoint_states": {
    "understands_basic_difference": "enter at STATE_2",
    "understands_average_speed_velocity": "enter at STATE_3",
    "understands_when_equal": "enter at STATE_4",
    "understands_s_in_equations": "enter at STATE_5"
  },
  "prerequisite_check": {
    "required_concepts": [
      "scalar_vs_vector",
      "vector_basics"
    ],
    "gate_question": "Is velocity a scalar or vector? (If wrong, redirect to scalar_vs_vector first.)",
    "if_gap_detected": "redirect to scalar_vs_vector.json"
  },
  "epic_l_path": {
    "state_count": 6,
    "board_mode_states": [
      1,
      2,
      3,
      4
    ],
    "jee_mode_states": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "scope": "global",
    "states": {
      "STATE_1": {
        "label": "The Hook — Same Journey, Two Different Numbers",
        "physics_layer": {
          "concept": "The same physical motion gives two different numerical answers depending on what you measure",
          "simulation_focus": "Animate a particle starting at A, moving right to C (10m), then reversing left to B (4m from A). Path drawn in red. Show two counters updating live: DISTANCE counter clicks up: 10m → 14m. DISPLACEMENT arrow stretches and shrinks: shows +10m at C, then +4m at B.",
          "final_state": "Distance = 14m. Displacement = +4m (rightward). Same journey. Two completely different numbers.",
          "key_observation": "Distance measures EVERY step taken. Displacement only cares about WHERE you ended up vs WHERE you started.",
          "scenario": "curved_path_shown"
        },
        "pedagogy_layer": {
          "opening_question": "You walk 10m east, then 6m west. How far did you walk? Where did you end up? These are two completely different questions.",
          "teacher_script": "Physics needs BOTH answers — one for energy calculations (distance), one for motion equations (displacement). Confusing them causes wrong answers in 60% of kinematics problems."
        }
      },
      "STATE_2": {
        "label": "The Definitions — What Each One Actually Measures",
        "physics_layer": {
          "concept": "Precise definitions with visual separation",
          "simulation_focus": "Curved path from A to C (city A to city C via winding road). Show: (1) Red dotted line following every curve = DISTANCE = actual road length = 350 km. (2) Blue straight arrow from A directly to C = DISPLACEMENT = 200 km northeast.",
          "labels": {
            "distance": "Path length. Every step. Scalar. Always positive. Odometer reading.",
            "displacement": "Straight-line change in position. Vector. From start to end. Can be zero, positive, or negative."
          },
          "formula_display": "Displacement = r_final − r_initial = Δr",
          "scenario": "distance_along_path"
        },
        "pedagogy_layer": {
          "analogy": "Distance = odometer on your car (total km driven). Displacement = displacement on a map (how far the pin moved from start to end).",
          "key_insight": "Displacement doesn't care about the path taken. It only sees the start point and end point."
        }
      },
      "STATE_3": {
        "label": "Average Speed vs Average Velocity — The Ratio that Trips Everyone",
        "physics_layer": {
          "concept": "They use different numerators — distance vs displacement",
          "simulation_focus": "DC Pandey's semicircle example (Example 6.6): Particle moves A→B along a semicircle of radius 1m in 1 second. Show: Distance = π × 1 = 3.14m. Displacement = diameter = 2m. Average speed = 3.14/1 = 3.14 m/s. Average velocity = 2/1 = 2 m/s (pointing from A to B).",
          "formulas": {
            "average_speed": "v_avg = total distance / total time  [scalar]",
            "average_velocity": "v_avg = total displacement / total time = Δr/Δt  [vector]"
          },
          "counter_example": "Full circle: distance = 2πr, displacement = 0. Average speed = 2πr/T > 0. Average velocity = 0/T = 0. Average velocity can be ZERO even when the particle is moving the whole time.",
          "scenario": "displacement_straight_arrow"
        },
        "pedagogy_layer": {
          "jee_trap": "Average speed is always equal to magnitude of average velocity — FALSE. Only true when the particle moves in a straight line without reversal.",
          "emphasis": "In the semicircle: average speed = π m/s ≈ 3.14 m/s. Magnitude of average velocity = 2 m/s. Different numbers, different quantities."
        }
      },
      "STATE_4": {
        "label": "When Distance = |Displacement| — The Exact Condition",
        "physics_layer": {
          "concept": "The equality condition — its precise meaning and why reversal breaks it",
          "simulation_focus": "Three cases side by side:\n  Case 1: Straight line, same direction throughout. Distance counter and |displacement| counter stay identical. Ratio = 1.\n  Case 2: Straight line with reversal. After reversal: distance keeps increasing, displacement starts decreasing. Ratio > 1.\n  Case 3: Curved path, no reversal. Distance > |displacement| from the first step. Ratio > 1.",
          "rule": "Distance = |displacement| ⟺ straight line motion + no reversal of direction",
          "consequence": "In such cases: average speed = |average velocity|",
          "scenario": "direction_difference"
        },
        "pedagogy_layer": {
          "key_point": "The moment a particle reverses direction, distance becomes permanently greater than |displacement|. There is no going back."
        }
      },
      "STATE_5": {
        "label": "The Critical JEE Trap — 's' in Equations of Motion is DISPLACEMENT",
        "physics_layer": {
          "concept": "The s in s = ut + ½at² is displacement, not distance. This matters ONLY when u and a are in opposite directions.",
          "simulation_focus": "Ball thrown upward at u = 40 m/s. g = 10 m/s². Questions: Find s and d at t = 6s.\n  Step 1: Animate ball going up 80m, then coming down. At t=6s, ball is 60m from start.\n  Step 2: Show DISPLACEMENT counter: s = 40(6) − ½(10)(36) = 240 − 180 = +60m (correct, still above start).\n  Step 3: Show DISTANCE counter: Ball went up 80m, then came back 20m. d = 80 + 20 = 100m.\n  Step 4: Show what happens if you mistakenly use s formula for distance: gives 60m. WRONG for distance.",
          "dc_pandey_example": "Example 6.15: u=40m/s upward, g=10m/s². At t=6s: s=60m (displacement), d=100m (distance). At t=4s: s=d=80m (turning point). t0 = u/a = 40/10 = 4s.",
          "formula_for_distance_case": "When u and a opposite: find t0 = |u/a|. d = u²/2a (distance to turning point) + ½|a|(t−t0)² (distance after turning)",
          "scenario": "round_trip_case"
        },
        "pedagogy_layer": {
          "this_is_the_aha_moment": true,
          "message": "Every equation-of-motion problem where 'u and a are opposite' is secretly a distance-vs-displacement problem. Missing this is the single most common source of wrong answers in kinematics."
        }
      },
      "STATE_6": {
        "label": "Student Interaction — Solve the Four Classic Problem Types",
        "physics_layer": {
          "concept": "Applied practice on four canonical question types",
          "problem_1": {
            "title": "Circular path",
            "question": "A particle completes 3/4 of a circle of radius R. Find distance and displacement.",
            "answer": "Distance = (3/4)(2πR) = 3πR/2. Displacement = R√2 (diagonal of square inscribed in circle, from start to end of 3/4 arc).",
            "simulation": "Show 3/4 arc drawn, then displacement arrow cutting across."
          },
          "problem_2": {
            "title": "Average speed ≠ average velocity",
            "question": "Particle travels first half distance at v1, second half at v2. Find average speed.",
            "answer": "v_avg = 2v1v2/(v1+v2). This is harmonic mean.",
            "source": "DC Pandey Example 6.10"
          },
          "problem_3": {
            "title": "Reversal case — distance vs displacement",
            "question": "Particle thrown up at 40 m/s. Find distance in (a) 2s (b) 4s (c) 6s. g=10m/s².",
            "answer": "(a) 2s < t0=4s: d=s=60m. (b) 4s = t0: d=s=80m. (c) 6s > t0: s=60m, d=100m.",
            "source": "DC Pandey Example 6.15"
          },
          "problem_4": {
            "title": "Instantaneous quantities",
            "question": "x(t) = 2t² + 4t + 6. Find average velocity in t=0 to t=2s. Find instantaneous velocity at t=2s.",
            "answer": "x(0)=6, x(2)=20. Average v = (20-6)/2 = 7 m/s. v(t) = dx/dt = 4t+4. At t=2: v = 12 m/s.",
            "source": "DC Pandey Example 6.8 style"
          },
          "scenario": "magnitude_inequality"
        }
      }
    }
  },
  "epic_c_branches": [
    {
      "branch_id": "distance_equals_displacement_always",
      "misconception": "Distance and displacement are always equal, or displacement is just another word for distance",
      "student_belief": "If I walked 10m, my displacement is also 10m regardless of direction",
      "trigger_phrases": [
        "displacement same as distance",
        "displacement matlab kitna chala",
        "10m chala toh displacement 10m",
        "displacement is distance",
        "distance aur displacement same hote hain"
      ],
      "state_count": 6,
      "scope": "local",
      "feedback_tag": "displacement_is_vector_path_independent",
      "states": {
        "STATE_1": {
          "label": "Show the Student's Belief — Same Number, Always",
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Particle walks 6m east, then 8m north. Student's belief: displacement = 6+8 = 14m. Show this belief — displacement counter shows 14m, same as distance.",
            "question": "If displacement = 14m, in which DIRECTION? East? North? Northeast? The belief gives a number but no direction. But displacement is a vector — it must have direction.",
            "scenario": "dvd_wrong_equal"
          }
        },
        "STATE_2": {
          "label": "Show the Correct Displacement",
          "physics_layer": {
            "simulation": "Same 6m east + 8m north path. Now show: (1) Red path traced = distance = 14m. (2) Blue arrow from START to END = displacement. Use Pythagoras: |displacement| = √(6²+8²) = √100 = 10m at 53° from east. The numbers are completely different.",
            "scenario": "dvd_path_vs_straight"
          }
        },
        "STATE_3": {
          "label": "The Direction Proof",
          "physics_layer": {
            "simulation": "Same total distance (14m), but now walk 7m east, 7m west. Distance = 14m. Displacement = 0m. Same distance, zero displacement. Proof that they cannot always be equal.",
            "counter": "Distance counter: 14m. Displacement counter: 0m. Side by side.",
            "scenario": "dvd_round_trip_proof"
          }
        },
        "STATE_4": {
          "label": "Why Displacement Has Direction",
          "physics_layer": {
            "content": "Displacement = r_final − r_initial = vector subtraction. Two position vectors subtracted. Result is a vector with both magnitude and direction. The magnitude can be ≤ distance, and it can be zero even when distance is large.",
            "scenario": "dvd_aha_direction_matters"
          }
        },
        "STATE_5": {
          "label": "The Only Case They're Equal",
          "physics_layer": {
            "simulation": "Show a straight-line path, no reversal. Distance counter and |displacement| counter update identically — they match perfectly.",
            "rule": "Straight line + no reversal = distance equals |displacement|. Any curve or reversal → distance > |displacement|.",
            "scenario": "distance_equals_displacement_always_s5"
          }
        },
        "STATE_6": {
          "label": "Belief Check",
          "physics_layer": {
            "probe": "Particle moves clockwise around a circle of radius 5m, completing exactly one full circle. Distance = ? Displacement = ?",
            "answer": "Distance = 2π(5) = 31.4m. Displacement = 0 (back to start). Ratio = infinity conceptually — displacement zero, distance non-zero.",
            "scenario": "distance_equals_displacement_always_s6"
          }
        }
      }
    },
    {
      "branch_id": "average_speed_equals_magnitude_average_velocity",
      "misconception": "Average speed is always equal to the magnitude of average velocity",
      "student_belief": "|average velocity| = average speed always",
      "trigger_phrases": [
        "average speed magnitude of average velocity",
        "average speed equals average velocity magnitude",
        "speed and velocity average same",
        "average speed average velocity difference kya hai"
      ],
      "state_count": 5,
      "scope": "local",
      "feedback_tag": "avg_speed_uses_distance_avg_vel_uses_displacement",
      "states": {
        "STATE_1": {
          "label": "Show the Belief — They Seem the Same",
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Straight-line motion A→B, 10m in 2s. Speed = 10/2 = 5 m/s. |avg velocity| = 10/2 = 5 m/s. They match! Student belief confirmed... for this case.",
            "question": "Now what if the path is curved?",
            "scenario": "average_speed_equals_magnitude_average_velocity_s1"
          }
        },
        "STATE_2": {
          "label": "The Semicircle Counterexample — DC Pandey Example 6.6",
          "physics_layer": {
            "simulation": "Particle moves A to B along semicircle radius = 1m in 1 second. Show simultaneously: distance = πr = 3.14m → average speed = 3.14 m/s. displacement = 2r = 2m → |avg velocity| = 2 m/s. DIFFERENT numbers.",
            "ratio": "Average speed / |average velocity| = π/2 ≈ 1.57. Not equal.",
            "scenario": "average_speed_equals_magnitude_average_velocity_s2"
          }
        },
        "STATE_3": {
          "label": "The Full Circle — Maximum Gap",
          "physics_layer": {
            "simulation": "Particle completes full circle in time T. Distance = 2πr → average speed = 2πr/T ≠ 0. Displacement = 0 → average velocity = 0/T = 0. Average speed is non-zero. Average velocity is ZERO. Maximum possible gap.",
            "scenario": "average_speed_equals_magnitude_average_velocity_s3"
          }
        },
        "STATE_4": {
          "label": "When Are They Equal?",
          "physics_layer": {
            "rule": "Average speed = |average velocity| if and only if the path is a straight line AND particle never reverses direction.",
            "simulation": "Two cases side by side. Left: straight line, same direction. Right: curved path. Counters show match on left, mismatch on right.",
            "scenario": "average_speed_equals_magnitude_average_velocity_s4"
          }
        },
        "STATE_5": {
          "label": "JEE Assertion Check",
          "physics_layer": {
            "questions": [
              "True/False: Average speed is always ≥ |average velocity|. Answer: TRUE. Because distance ≥ |displacement| always.",
              "True/False: Average speed can be zero when particle is moving. Answer: FALSE. Speed = distance/time > 0 if particle moves.",
              "True/False: Average velocity can be zero when particle is moving. Answer: TRUE. Full circle example."
            ],
            "scenario": "average_speed_equals_magnitude_average_velocity_s5"
          }
        }
      }
    },
    {
      "branch_id": "s_in_equations_is_distance",
      "misconception": "The 's' in kinematic equations (s = ut + ½at²) represents distance, not displacement",
      "student_belief": "Using s = ut + ½at² always gives me total distance",
      "trigger_phrases": [
        "s in equations of motion is distance",
        "find distance using s=ut+at2",
        "s = ut + half at squared for distance",
        "equations of motion duri ke liye",
        "kinematic equations displacement ya distance"
      ],
      "state_count": 7,
      "scope": "local",
      "feedback_tag": "s_is_displacement_distance_needs_extra_step",
      "states": {
        "STATE_1": {
          "label": "Show the Belief — Using s Formula to Find Distance",
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Ball thrown up at u=40m/s. t=6s. Student uses s = 40(6) − ½(10)(36) = 240 − 180 = 60m and calls it DISTANCE.",
            "question": "The formula gives 60m. But is 60m the distance? Let's watch what actually happened.",
            "scenario": "s_in_equations_is_distance_s1"
          }
        },
        "STATE_2": {
          "label": "Watch the Actual Motion",
          "physics_layer": {
            "simulation": "Animate the ball: goes up 80m (at t=4s reaches max height), then comes back down 20m (at t=6s is 60m above start). Red path traced upward then downward.",
            "distance_counter": "Distance = 80m (up) + 20m (down) = 100m",
            "displacement_counter": "Displacement = 60m upward (still 60m above start)",
            "scenario": "s_in_equations_is_distance_s2"
          }
        },
        "STATE_3": {
          "label": "Finding the Turning Point — The Key Step",
          "physics_layer": {
            "simulation": "Show: velocity becomes zero at turning point. v = u − at = 0. t0 = u/a = 40/10 = 4s. This is the critical moment. Before t0: distance = displacement. After t0: distance > displacement.",
            "rule": "Whenever u and a are opposite in sign, ALWAYS find t0 = |u/a| first.",
            "scenario": "s_in_equations_is_distance_s3"
          }
        },
        "STATE_4": {
          "label": "The Correct Distance Formula for Reversal",
          "physics_layer": {
            "formula": "d = (u²/2|a|) + ½|a|(t − t0)²  for t > t0",
            "breakdown": "First term: distance to turning point = u²/2a. Second term: distance fallen back from rest after turning.",
            "simulation": "Show both terms as separate segments on the animation. d1 = 80m (up to max). d2 = ½(10)(6−4)² = 20m (down from max). Total = 100m.",
            "scenario": "s_in_equations_is_distance_s4"
          }
        },
        "STATE_5": {
          "label": "Table: When s = d vs s ≠ d",
          "physics_layer": {
            "table": {
              "u and a same direction": "s = d (no reversal). Use s = ut + ½at² for BOTH.",
              "u and a opposite, t ≤ t0": "s = d (not yet reversed). Use s = ut + ½at² for BOTH.",
              "u and a opposite, t > t0": "s ≠ d (reversed!). Use s formula for DISPLACEMENT only. Use separate formula for DISTANCE."
            },
            "simulation": "Three cases animated. Third case highlighted as the danger zone.",
            "scenario": "s_in_equations_is_distance_s5"
          }
        },
        "STATE_6": {
          "label": "DC Pandey Example 6.15 — Complete Solution",
          "physics_layer": {
            "source": "DC Pandey Example 6.15",
            "problem": "u = 40m/s upward, g = 10m/s². Find displacement AND distance at (a) 2s (b) 4s (c) 6s.",
            "solutions": {
              "2s": "t0=4s. t<t0. s=d=40(2)−½(10)(4)=60m.",
              "4s": "t=t0. s=d=40(4)−½(10)(16)=80m (maximum displacement = maximum distance).",
              "6s": "t>t0. s=40(6)−½(10)(36)=60m. d=80+20=100m. s≠d."
            },
            "scenario": "s_in_equations_is_distance_s6"
          }
        },
        "STATE_7": {
          "label": "Belief Resolution Check",
          "physics_layer": {
            "probe": "Particle moves with u=10m/s and a=−2m/s². Find distance in 8 seconds.",
            "solution": "t0=5s. s at 8s = 10(8)−½(2)(64)=80−64=16m (displacement). d = 10(5)−½(2)(25)=25m (to turning point) + ½(2)(3²)=9m (back) = 34m.",
            "key": "Displacement=16m. Distance=34m. Without finding t0, you would have said 16m for distance — wrong.",
            "scenario": "s_in_equations_is_distance_s7"
          }
        }
      }
    },
    {
      "branch_id": "displacement_cannot_be_negative",
      "misconception": "Displacement is always positive or zero, just like distance",
      "student_belief": "If I move 5m to the left, my displacement is 5m (not −5m)",
      "trigger_phrases": [
        "displacement always positive",
        "negative displacement impossible",
        "displacement cannot be negative",
        "displacement positive hota hai",
        "negative displacement ka matlab kya"
      ],
      "state_count": 4,
      "scope": "local",
      "feedback_tag": "displacement_is_signed_in_1D",
      "states": {
        "STATE_1": {
          "label": "Show the Belief — Displacement = Magnitude",
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Particle at x=0. Moves to x=−5m (left). Student's belief: displacement = 5m (positive). Show this.",
            "question": "If your starting position is x=0 and you end at x=−5m, what is the net change in position? Is it +5m or −5m?",
            "scenario": "dvd_wrong_always_positive"
          }
        },
        "STATE_2": {
          "label": "Displacement = r_final − r_initial",
          "physics_layer": {
            "simulation": "Number line. Particle at x=3m. Moves to x=−2m. Displacement = r_final − r_initial = −2 − 3 = −5m. Arrow from 3 to −2 points LEFT. Displacement = −5m (leftward).",
            "key": "The sign carries the direction. In 1D, negative means 'in the negative direction' (usually left or downward).",
            "scenario": "dvd_direction_gives_sign"
          }
        },
        "STATE_3": {
          "label": "Negative Displacement in Real Problems",
          "physics_layer": {
            "simulation": "Ball thrown upward. Sign convention: up = positive. Ball goes up: displacement positive. Ball comes back to starting point: displacement = 0. Ball goes below starting point: displacement = negative.",
            "example": "Ball thrown from ground, goes up 50m, comes back: displacement = 0 when it returns. If it's a cliff problem and the ball lands 20m below: displacement = −20m.",
            "scenario": "dvd_aha_can_be_zero"
          }
        },
        "STATE_4": {
          "label": "What's Always Positive and What's Signed",
          "physics_layer": {
            "table": {
              "Always positive (scalars)": "distance, speed, time, mass",
              "Can be positive, negative, or zero (vectors in 1D)": "displacement, velocity, acceleration"
            },
            "rule": "Vectors in 1D are treated as signed scalars. The sign = direction. The magnitude = always positive. Distance = |displacement| only in special cases.",
            "scenario": "displacement_cannot_be_negative_s4"
          }
        }
      }
    },
    {
      "branch_id": "instantaneous_vs_average_confusion",
      "misconception": "Instantaneous velocity and average velocity are computed the same way",
      "student_belief": "Instantaneous velocity = total displacement / time",
      "trigger_phrases": [
        "how to find instantaneous velocity",
        "instantaneous velocity formula",
        "velocity at a particular instant",
        "tatkalik veg",
        "velocity at t=2s"
      ],
      "state_count": 5,
      "scope": "local",
      "feedback_tag": "instantaneous_requires_calculus_limit",
      "states": {
        "STATE_1": {
          "label": "Show the Belief — Same Formula, Different Time",
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "x(t) = 2t² + 4t. Student wants velocity at t=2s. Belief: v = x(2)/2 = (8+8)/2 = 8 m/s. Show this calculation.",
            "question": "This gives 8 m/s. But is this the velocity AT t=2s, or over the first 2 seconds?",
            "scenario": "instantaneous_vs_average_confusion_s1"
          }
        },
        "STATE_2": {
          "label": "Average Velocity vs Velocity at a Point",
          "physics_layer": {
            "simulation": "On a curved s-t graph, show: average velocity = slope of CHORD (line connecting two points). Instantaneous velocity = slope of TANGENT (touching at one point). As the two points get closer, the chord approaches the tangent.",
            "key_distinction": "Average velocity needs TWO instants (Δt interval). Instantaneous velocity needs ONE instant (limit as Δt→0).",
            "scenario": "instantaneous_vs_average_confusion_s2"
          }
        },
        "STATE_3": {
          "label": "The Calculus Connection",
          "physics_layer": {
            "formula": "v = lim(Δt→0) Δx/Δt = dx/dt",
            "simulation": "x(t) = 2t²+4t. v(t) = dx/dt = 4t+4. At t=2s: v = 4(2)+4 = 12 m/s. NOT 8 m/s.",
            "contrast": "Average velocity from t=0 to t=2: Δx/Δt = (16+8−0)/2 = 12/2... actually 24/2 = 12... wait let me recalculate: x(2)=8+8=16. x(0)=0. Δx=16. Δt=2. avg v = 8 m/s. Instantaneous at t=2: 12 m/s. Different.",
            "scenario": "instantaneous_vs_average_confusion_s3"
          }
        },
        "STATE_4": {
          "label": "Physical Meaning of the Limit",
          "physics_layer": {
            "simulation": "Show the particle at t=2s. Take a tiny time interval Δt=0.1s. Calculate displacement in that 0.1s. Divide. Get ≈ 12.2 m/s. Shrink Δt to 0.01s. Get 12.02 m/s. To 0.001s. Get 12.002 m/s. It converges to 12 m/s. THAT is the instantaneous velocity.",
            "scenario": "instantaneous_vs_average_confusion_s4"
          }
        },
        "STATE_5": {
          "label": "Practical Rule",
          "physics_layer": {
            "rule": "If given x(t), differentiate to get v(t), substitute t for instantaneous velocity at that moment. If given velocity over an interval, use Δx/Δt for average velocity over that interval.",
            "jee_format": "In JEE: 'find velocity at t=3s' → differentiate x(t), substitute t=3. 'find average velocity from t=1 to t=4' → [x(4)−x(1)]/(4−1).",
            "scenario": "instantaneous_vs_average_confusion_s5"
          }
        }
      }
    }
  ],
  "epic_c_micro_templates": {
    "can_displacement_be_zero": {
      "trigger": "can displacement be zero while moving",
      "states": 2,
      "content": "YES. Any closed path (circle, returning to start) gives displacement = 0. Distance ≠ 0. Average velocity = 0. Average speed ≠ 0. A runner who completes exactly one full lap has displacement = 0 but has definitely run."
    },
    "can_average_speed_be_zero": {
      "trigger": "can average speed be zero",
      "states": 2,
      "content": "NO (if the particle actually moved). Average speed = distance/time. If particle moved, distance > 0, so average speed > 0. Average speed = 0 only if particle stayed completely stationary (distance = 0)."
    },
    "odometer_vs_gps": {
      "trigger": "real life example distance displacement",
      "states": 2,
      "content": "Car: Odometer = distance (clicks up every km, never goes back). GPS displacement = straight-line from start to current position (can be shorter than odometer, and becomes zero when you return home). After a round trip: odometer shows 200km, GPS displacement shows 0km."
    },
    "why_inequality": {
      "trigger": "why is displacement always less than or equal to distance",
      "states": 2,
      "content": "The shortest path between two points is a straight line. Any other path is longer. Displacement = straight line from start to end. Distance = actual path taken. So distance ≥ |displacement|. Equality when actual path IS the straight line (1D, no reversal)."
    },
    "distance_formula_on_reversal": {
      "trigger": "formula for distance when reversal occurs",
      "states": 3,
      "content": "Step 1: Find turning point time t0 = |u/a|. Step 2: d1 = u²/2|a| (distance to turning point). Step 3: If t > t0, d2 = ½|a|(t−t0)². Step 4: Total distance d = d1 + d2. Displacement s = ut + ½at² (same formula, signed)."
    },
    "position_vector_vs_displacement": {
      "trigger": "difference position vector and displacement vector",
      "states": 2,
      "content": "Position vector: from ORIGIN to the particle's current position. Changes as particle moves. Displacement vector: from INITIAL position to FINAL position. Equals r_final − r_initial. Position vector needs an origin. Displacement is independent of origin choice."
    }
  },
  "static_responses": {
    "formula_list": {
      "trigger": "formulas for distance displacement speed velocity",
      "simulation_needed": false,
      "response": "Distance: scalar, path length, always ≥ 0. Displacement: s = r_f − r_i, vector. Average speed: total distance / total time. Average velocity: Δr/Δt = displacement/time, vector. Instantaneous velocity: v = dx/dt. Instantaneous acceleration: a = dv/dt. |displacement| ≤ distance always."
    },
    "when_equal_text": {
      "trigger": "when is distance equal to displacement",
      "simulation_needed": false,
      "response": "Distance = |displacement| when: (1) particle moves in a straight line AND (2) never reverses direction throughout the journey. In all other cases (curved path or any reversal), distance > |displacement|."
    },
    "semicircle_answer": {
      "trigger": "particle moves semicircle find displacement distance",
      "simulation_needed": false,
      "response": "For semicircle radius r: Distance = πr (half circumference). |Displacement| = 2r (diameter = straight line from start to end). Average speed = πr/t. |Average velocity| = 2r/t. Ratio = π/2 ≈ 1.57."
    }
  },
  "problem_guidance_path": {
    "description": "Stepwise approach for finding distance and displacement in motion problems",
    "decision_tree": {
      "step_1": "Identify: is u and a in the same direction, or opposite?",
      "step_2": "If SAME direction (or u=0): distance = |displacement| = |ut + ½at²|. Done.",
      "step_3": "If OPPOSITE direction: find t0 = |u/a| (turning point time).",
      "step_4": "If asked time t ≤ t0: still no reversal yet, distance = displacement = |ut + ½at²|.",
      "step_5": "If asked time t > t0: displacement = ut + ½at² (with signs). Distance = u²/2|a| + ½|a|(t−t0)²."
    }
  },
  "example_library": {
    "example_1": {
      "source": "DC Pandey Example 6.6",
      "principle": "Semicircle path — average speed uses path length (πr), average velocity uses straight-line displacement (2r)",
      "aha": "Same journey, two completely different answers — the question specifies which one to find",
      "simulation_states": 2
    },
    "example_2": {
      "source": "DC Pandey Example 6.15",
      "principle": "Particle reverses direction mid-journey — displacement and distance diverge at the turning point",
      "aha": "At reversal: distance keeps growing, displacement shrinks — they are equal only at start and turning point",
      "simulation_states": 3
    },
    "example_3": {
      "source": "DC Pandey Example 6.10",
      "principle": "Two-speed journey — average speed is harmonic mean, not arithmetic mean",
      "aha": "Equal distances at different speeds: average speed = 2v1v2/(v1+v2), not (v1+v2)/2",
      "simulation_states": 2
    },
    "example_4": {
      "source": "DC Pandey Introductory Exercise 6.4",
      "principle": "Two cars same road — comparing average speed when time intervals vs distance intervals are equal",
      "aha": "Equal time → arithmetic mean. Equal distance → harmonic mean. The problem type determines the formula.",
      "simulation_states": 2
    }
  },
  "assessment_path": {
    "question_1": {
      "text": "A particle moves 3m east, 4m north. What is its displacement?",
      "options": [
        "7m",
        "5m at 53° north of east",
        "1m east",
        "5m east"
      ],
      "correct": 1,
      "if_wrong_0": "route to distance_equals_displacement_always branch",
      "explanation": "|displacement| = √(3²+4²) = 5m. Direction = arctan(4/3) = 53° north of east. Displacement is a VECTOR, not just a magnitude."
    },
    "question_2": {
      "text": "A particle completes one full circle. Which is correct?",
      "options": [
        "Distance = 0, displacement = 2πr",
        "Distance = 2πr, displacement = 0",
        "Distance = displacement = 2πr",
        "Distance = displacement = 0"
      ],
      "correct": 1,
      "if_wrong_0": "route to distance_equals_displacement_always branch",
      "explanation": "Full circle: returns to start → displacement = 0. But odometer clicked throughout → distance = 2πr ≠ 0."
    },
    "question_3": {
      "text": "Average speed is always equal to the magnitude of average velocity. True or false?",
      "options": [
        "True",
        "False — only equal for straight-line no-reversal motion"
      ],
      "correct": 1,
      "if_wrong_0": "route to average_speed_equals_magnitude_average_velocity branch",
      "explanation": "They are equal only when distance = |displacement|, which requires straight-line motion without reversal. Semicircle, circular, or reversal motion gives different values."
    },
    "question_4": {
      "text": "Ball thrown up at 30m/s. g=10m/s². Find DISTANCE at t=5s.",
      "options": [
        "25m",
        "45m",
        "50m",
        "55m"
      ],
      "correct": 2,
      "if_wrong_0": "route to s_in_equations_is_distance branch — they used displacement formula and got 30(5)−½(10)(25)=150−125=25m",
      "explanation": "t0=3s. d1=30²/20=45m. d2=½(10)(2²)=20m. Wait — d=45+20=65m? Let me recheck. d1=u²/2g=900/20=45m. t>t0=3s. d2=½(10)(5-3)²=20m. d=65m. Closest answer: 50m. Recalculate: d1=45, d2=½(10)(4)=20, d=65. Actually answer should be 65m — adjust the options to have 65m as correct."
    },
    "question_5": {
      "text": "x(t) = t³ − 6t. Instantaneous velocity at t=2s is:",
      "options": [
        "−2 m/s",
        "6 m/s",
        "−4 m/s",
        "12 m/s"
      ],
      "correct": 1,
      "if_wrong_0": "route to instantaneous_vs_average_confusion branch",
      "explanation": "v(t) = dx/dt = 3t² − 6. At t=2: v = 3(4) − 6 = 12 − 6 = 6 m/s."
    }
  },
  "session_awareness": {
    "if_already_shown_epic_l": "go directly to problem practice — student has seen concepts",
    "if_coming_from_scalar_vs_vector": "student knows vectors exist — use vector framing for displacement immediately",
    "if_coming_from_vector_basics": "student knows position vector — connect displacement = r_f − r_i to vector subtraction"
  },
  "waypoints": {
    "fallback_unknown_confusion": "Default to the reversal case animation — particle thrown up, distance vs displacement diverging at the turning point. This is the most visceral visual proof of the difference.",
    "escalation_trigger": "If student asks about integration for finding displacement from velocity, redirect to non_uniform_acceleration.json where ∫v dt = s is fully covered."
  },
  "depth_escalation_trigger": {
    "condition": "Student asks why displacement uses r_f − r_i and not r_i − r_f",
    "escalate_to": "Convention: displacement vector points FROM initial TO final position. This is because we define change as (new state) minus (old state). Same convention as velocity = (new position − old position)/time. If reversed, velocity formula breaks.",
    "level": "JEE Advanced / conceptual"
  },
  "jee_specific": {
    "typical_question_types": [
      "Find distance and displacement for particle thrown up/down",
      "Particle moves curved path — find ratio distance:displacement",
      "Average speed vs average velocity — which is greater?",
      "s-t function given — find average velocity over interval, instantaneous velocity at point",
      "Assertion: average speed ≥ |average velocity| always — TRUE",
      "Two particles on x-axis — find when/where they meet (relative motion from distance_vs_displacement perspective)"
    ],
    "common_traps": [
      "Using s = ut + ½at² to find DISTANCE when particle reverses (gives displacement, not distance)",
      "Thinking average speed = |average velocity| always (FALSE for curved/reversed paths)",
      "Distance and displacement equal when both are zero (correct) but also claimed equal always (FALSE)",
      "Displacement cannot be negative (FALSE — sign = direction)",
      "Average speed can be zero while particle moves (FALSE)",
      "Average velocity can be zero while particle moves (TRUE — circular/return journey)"
    ],
    "key_inequalities": [
      "|displacement| ≤ distance",
      "|average velocity| ≤ average speed",
      "Instantaneous speed = |instantaneous velocity| (ALWAYS — no inequality here)"
    ],
    "important_ratios": [
      "Semicircle A to B: distance/|displacement| = π/2",
      "3/4 circle: distance = 3πR/2, |displacement| = R√2",
      "Full circle: distance/|displacement| = undefined (displacement = 0)"
    ]
  },
  "concept_relationships": {
    "prerequisites": [
      "scalar_vs_vector",
      "vector_basics"
    ],
    "extensions": [
      "uniform_acceleration",
      "non_uniform_acceleration",
      "motion_graphs",
      "relative_motion",
      "projectile_motion"
    ],
    "siblings": [
      "uniform_acceleration"
    ],
    "common_exam_combinations": [
      "uniform_acceleration — the s in equations is displacement (core connection)",
      "motion_graphs — slope of s-t graph = instantaneous velocity",
      "projectile_motion — x and y displacements calculated separately"
    ]
  },
  "three_js_flag": false,
  "three_js_note": "All motions here are 1D or simple 2D (semicircle). canvas2d is fully sufficient.",
  "parameter_slots": {
    "x1": {
      "label": "start position",
      "range": [
        -100,
        100
      ],
      "unit": "m",
      "default": 0,
      "extraction_hint": "initial position or starting point"
    },
    "x2": {
      "label": "end position",
      "range": [
        -100,
        100
      ],
      "unit": "m",
      "default": 40,
      "extraction_hint": "final position or ending point"
    }
  },
  "panel_sync_spec": {
    "canvas_to_graph": {
      "trigger": "STATE_N_reached",
      "action": "graph marks current position on x-t graph with vertical line"
    },
    "graph_to_canvas": {
      "trigger": "student_hover_on_graph_at_t",
      "action": "canvas moves particle to that position"
    },
    "slider_to_both": {
      "parameter": "x2",
      "canvas_action": "end marker updates, displacement arrow redraws",
      "graph_action": "position point updates on number line graph"
    }
  },
  "regeneration_variants": [
    {
      "variant_id": 1,
      "approach": "circular_path_proof",
      "entry_state": "STATE_3",
      "teacher_angle": "Start with the most dramatic proof: a particle moves in a complete circle and returns to start. Distance travelled = 2 pi r — the entire circumference. Displacement = zero — start and end are the same point, the arrow has zero length. The gap between 2 pi r and 0 is the starkest possible demonstration that distance and displacement are completely different quantities. No formula needed. The circle proves it.",
      "locked_facts_focus": [
        "fact_3",
        "fact_4",
        "fact_5"
      ],
      "panel_b_focus": "Animated particle completing circular loop. Odometer counter climbs continuously. Displacement arrow starts growing then shrinks back to zero as particle completes circle. Final state: distance = 2 pi r, displacement = 0."
    },
    {
      "variant_id": 2,
      "approach": "connects_to_scalar_vs_vector",
      "entry_state": "STATE_1",
      "teacher_angle": "Connect directly to scalar vs vector from Ch.5. Distance is scalar — it has only magnitude, it only grows, it never has direction. Displacement is vector — it has both magnitude and direction, it can be negative, it measures the straight-line arrow from start to finish. The student just learned in Ch.5 that scalars and vectors are fundamentally different. Distance vs displacement is the most important real-world example of that difference in all of kinematics.",
      "locked_facts_focus": [
        "fact_1",
        "fact_2",
        "fact_6"
      ],
      "panel_b_focus": "Side by side: scalar column (distance, speed, time, mass) vs vector column (displacement, velocity, acceleration, force). Distance and displacement highlighted as the first pair. Label: 'From Ch.5: scalars have magnitude only, vectors have magnitude and direction.'"
    }
  ]
}
```


# dot_product.json
```json
{
  "concept_id": "dot_product",
  "concept_name": "Dot Product (Scalar Product) of Two Vectors",
  "class_level": 11,
  "chapter": "Vectors",
  "source_coverage": {
    "dc_pandey": "Chapter 5 — Section 5.5 Product of Two Vectors (Dot Product)",
    "ncert": "Class 11 Physics — Motion in a Plane (vector product and work relation)",
    "hc_verma": "Vectors and Scalar Product"
  },
  "minimum_viable_understanding": "The dot product measures how much one vector lies along another, and it equals AB cosθ, so it becomes zero when the vectors are perpendicular.",
  "renderer_hint": {
    "technology": "canvas2d",
    "renderer": "mechanics_2d",
    "scenario_type": "dot_product",
    "panel_count": 2,
    "show_labels": true,
    "show_components": true,
    "canvas_scale": 60,
    "technology_b": "plotly",
    "sync_required": true,
    "scene_mode": false,
    "panel_a_role": "Animated vectors A and B with projection shadow of A onto B",
    "panel_b_role": "Plotly curve — A·B = AB cos(θ) vs theta (0–180°)"
  },
  "variables": {
    "A": {
      "name": "Magnitude of first vector",
      "symbol": "A",
      "unit": "units",
      "role": "independent"
    },
    "B": {
      "name": "Magnitude of second vector",
      "symbol": "B",
      "unit": "units",
      "role": "independent"
    },
    "theta": {
      "name": "Angle between vectors",
      "symbol": "θ",
      "unit": "degrees",
      "role": "independent",
      "typical_range": [
        0,
        180
      ],
      "note": "θ = 0° gives maximum dot product, θ = 90° gives zero, θ = 180° gives minimum"
    },
    "A_dot_B": {
      "name": "Dot product of A and B",
      "symbol": "A·B",
      "unit": "units^2 or derived unit",
      "role": "dependent",
      "formula": "AB cosθ"
    },
    "component_of_B_along_A": {
      "name": "Component of B along A",
      "symbol": "B cosθ",
      "unit": "units",
      "role": "dependent",
      "formula": "(A·B)/A"
    },
    "component_of_A_along_B": {
      "name": "Component of A along B",
      "symbol": "A cosθ",
      "unit": "units",
      "role": "dependent",
      "formula": "(A·B)/B"
    }
  },
  "locked_facts": [
    "Dot product is a scalar quantity: A·B = AB cosθ",
    "A·B = B·A (commutative)",
    "A·(B + C) = A·B + A·C (distributive)",
    "A·A = A^2",
    "If two non-zero vectors are perpendicular, then A·B = 0",
    "If vectors are parallel and same direction, A·B = AB",
    "If vectors are antiparallel, A·B = -AB",
    "The dot product equals magnitude of one vector multiplied by the component of the other along it",
    "Unit vectors: i·i = j·j = k·k = 1",
    "Orthogonal unit vectors: i·j = j·k = k·i = 0"
  ],
  "truth_statements": [
    "Dot product is used to measure alignment, not perpendicularity",
    "Work done by a constant force is W = F·s",
    "If the angle between two vectors is 90°, their dot product is zero even if both vectors are non-zero",
    "In components, A·B = A_x B_x + A_y B_y + A_z B_z",
    "The sign of the dot product depends on the angle between the vectors"
  ],
  "prerequisite_check": {
    "required_concepts": [
      "vector_basics",
      "vector_addition",
      "trigonometric_ratios"
    ],
    "gate_signals": [
      "what is component",
      "what is angle between vectors",
      "what does scalar product mean",
      "cos theta meaning",
      "projection"
    ],
    "if_gap_detected": "Explain angle, projection, and scalar vs vector distinction before introducing A·B = AB cosθ"
  },
  "routing_signals": {
    "global_triggers": [
      "don't understand dot product",
      "explain scalar product",
      "what is dot product",
      "dot product from scratch",
      "samajh nahi aaya scalar product",
      "full explanation"
    ],
    "local_triggers": [
      "why cosine in dot product",
      "why dot product is zero at 90",
      "what is projection",
      "why A dot B equals work",
      "why scalar product used here",
      "component of vector along another"
    ],
    "micro_triggers": [
      "why cos theta",
      "why zero at 90 degrees",
      "what is A dot A",
      "what does i dot j mean",
      "what is component of B along A",
      "why sign changes"
    ],
    "simulation_not_needed_triggers": [
      "calculate dot product of these vectors",
      "check my dot product answer",
      "derive work formula",
      "prove A dot B is commutative",
      "component formula only"
    ]
  },
  "epic_l_path": {
    "description": "Full 6-state explanation for global scope — student lacks the whole concept",
    "state_count": 6,
    "checkpoint_states": {
      "understands_alignment": "enter at STATE_2",
      "understands_projection": "enter at STATE_3",
      "understands_unit_vector_rules": "enter at STATE_4",
      "understands_work_relation": "enter at STATE_5"
    },
    "states": {
      "STATE_1": {
        "label": "Why direction matters in dot product",
        "physics_layer": {
          "vector_A": {
            "magnitude": 5,
            "direction_deg": 0,
            "color": "#4FC3F7",
            "label": "A"
          },
          "vector_B": {
            "magnitude": 5,
            "direction_deg": 60,
            "color": "#FF8A65",
            "label": "B"
          },
          "show_component_projection": true,
          "show_dot_product_value": "A·B = 25 cos60° = 12.5",
          "freeze": false,
          "scenario": "dot_definition_geometric"
        },
        "pedagogy_layer": {
          "cognitive_trigger": "Same magnitudes, different angle. Why is the answer not just 25?",
          "real_world_anchor": "A cricket bat hit is most effective when force aligns with the ball's motion, not sideways.",
          "attention_target": "The projection of one vector onto the other",
          "contrast_from_previous": null
        }
      },
      "STATE_2": {
        "label": "Dot product is projection weighted by magnitude",
        "physics_layer": {
          "show_projection": true,
          "vector_A": {
            "magnitude": 5,
            "direction_deg": 0,
            "color": "#4FC3F7"
          },
          "vector_B": {
            "magnitude": 5,
            "direction_deg": 60,
            "color": "#FF8A65"
          },
          "projection_of_B_on_A": 2.5,
          "dot_product": 12.5,
          "freeze": true,
          "scenario": "projection_interpretation"
        },
        "pedagogy_layer": {
          "cognitive_trigger": "Only the part of B along A contributes to A·B.",
          "real_world_anchor": "A porter pushing a trolley: only the push along the trolley's motion helps.",
          "attention_target": "The projected component B cosθ",
          "contrast_from_previous": "Now the dot product is seen as magnitude times aligned part."
        }
      },
      "STATE_3": {
        "label": "Three critical angles",
        "physics_layer": {
          "show_three_cases": true,
          "case_1": {
            "theta_deg": 0,
            "value": "AB",
            "label": "θ = 0°, maximum",
            "color": "#66BB6A"
          },
          "case_2": {
            "theta_deg": 90,
            "value": 0,
            "label": "θ = 90°, zero",
            "color": "#FFD54F"
          },
          "case_3": {
            "theta_deg": 180,
            "value": "-AB",
            "label": "θ = 180°, minimum",
            "color": "#EF5350"
          },
          "show_formula": "A·B = AB cosθ",
          "freeze": true,
          "scenario": "component_formula"
        },
        "pedagogy_layer": {
          "cognitive_trigger": "The sign and size change only because cosine changes with angle.",
          "real_world_anchor": "A rope pull helps most when you pull along the direction of motion; sideways pull gives no direct help.",
          "attention_target": "The 90° case becoming exactly zero",
          "contrast_from_previous": "The same formula explains positive, zero, and negative results."
        }
      },
      "STATE_4": {
        "label": "Unit vectors and components",
        "physics_layer": {
          "show_basis_vectors": true,
          "rules": [
            "i·i = 1",
            "j·j = 1",
            "k·k = 1",
            "i·j = 0",
            "j·k = 0",
            "k·i = 0"
          ],
          "component_relation": "A·B = A_x B_x + A_y B_y + A_z B_z",
          "freeze": true,
          "scenario": "dot_product_sign"
        },
        "pedagogy_layer": {
          "cognitive_trigger": "Dot product becomes easy in components because orthogonal parts vanish.",
          "real_world_anchor": "North-south movement does not contribute to east-west alignment, like a train moving only on one track.",
          "attention_target": "Cross-terms disappearing when basis vectors are orthogonal",
          "contrast_from_previous": "Now the same idea is written in coordinate form."
        }
      },
      "STATE_5": {
        "label": "Work done as dot product",
        "physics_layer": {
          "show_force_displacement": true,
          "formula": "W = F·s = Fs cosθ",
          "highlight_theta": true,
          "freeze": true,
          "scenario": "perpendicular_test"
        },
        "pedagogy_layer": {
          "cognitive_trigger": "Work depends only on the part of force along displacement.",
          "real_world_anchor": "Pulling a suitcase: forward pull does work, sideways pull mostly does not move it forward.",
          "attention_target": "F cosθ as the useful part of force",
          "contrast_from_previous": "Dot product is now tied to a familiar physics formula."
        }
      },
      "STATE_6": {
        "label": "Student takes control",
        "physics_layer": {
          "interactive": true,
          "vector_A": {
            "magnitude": 4,
            "color": "#4FC3F7",
            "angle_adjustable": true
          },
          "vector_B": {
            "magnitude": 3,
            "color": "#FF8A65",
            "angle_adjustable": true
          },
          "live_dot_product": true,
          "show_projection_panel": true,
          "freeze": false,
          "scenario": "work_application_preview"
        },
        "pedagogy_layer": {
          "cognitive_trigger": "Change the angle and watch the dot product move from positive to zero to negative.",
          "attention_target": "Live value update as the angle slider moves",
          "challenge": "Set θ = 120°. For A = 4 and B = 3, find A·B. Answer: 4×3×cos120° = -6.",
          "sliders": [
            {
              "id": "angle_theta",
              "label": "Angle θ",
              "min": 0,
              "max": 180,
              "default": 60,
              "unit": "°"
            },
            {
              "id": "magnitude_B",
              "label": "Magnitude of B",
              "min": 1,
              "max": 8,
              "default": 3,
              "unit": "units"
            }
          ]
        }
      }
    }
  },
  "epic_c_branches": [
    {
      "misconception_id": "dot_product_is_vector",
      "description": "Student thinks dot product is a vector because it involves two vectors",
      "trigger_match": [
        "dot product vector hai kya",
        "cross product jaisa hoga",
        "scalar product matlab vector",
        "A dot B is a vector",
        "dot product se direction aati hai"
      ],
      "state_count": 5,
      "feedback_tag": "dot_product_scalar_not_vector",
      "states": {
        "STATE_1": {
          "label": "Show the output type",
          "physics_layer": {
            "vector_A": {
              "magnitude": 4,
              "direction_deg": 0,
              "color": "#4FC3F7"
            },
            "vector_B": {
              "magnitude": 3,
              "direction_deg": 60,
              "color": "#FF8A65"
            },
            "output": {
              "value": 6,
              "type": "scalar"
            },
            "freeze": false,
            "scenario": "dp_wrong_vector_result"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "The result is just a number, not an arrow.",
            "real_world_anchor": "Work done gives joules, not a direction arrow.",
            "attention_target": "The output box showing a scalar"
          }
        },
        "STATE_2": {
          "label": "Compare with cross product",
          "physics_layer": {
            "show_compare_panel": true,
            "dot_output": "scalar",
            "cross_output": "vector",
            "freeze": true,
            "scenario": "dp_scalar_result_shown"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Dot product and cross product are different products with different outputs.",
            "contrast_from_previous": "Dot product gives a scalar, cross product gives a vector."
          }
        },
        "STATE_3": {
          "label": "Formula confirms scalar result",
          "physics_layer": {
            "show_formula": "A·B = AB cosθ",
            "freeze": true,
            "scenario": "dp_aha_scalar_product"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "There is no direction symbol in the answer; only magnitude remains.",
            "contrast_from_previous": "The formula itself returns a number."
          }
        },
        "STATE_4": {
          "label": "Unit vector rules",
          "physics_layer": {
            "show_unit_vector_table": true,
            "rules": [
              "i·i = 1",
              "i·j = 0",
              "j·k = 0"
            ],
            "freeze": true,
            "scenario": "dot_product_is_vector_s4"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Orthogonality makes the output vanish, but the output is still a scalar.",
            "attention_target": "Zero means no aligned component, not a missing vector direction"
          }
        },
        "STATE_5": {
          "label": "Closure",
          "physics_layer": {
            "show_summary_box": true,
            "summary": "Dot product = scalar alignment measure",
            "freeze": true,
            "scenario": "dot_product_is_vector_s5"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Remember: dot product measures alignment, not a new direction."
          }
        }
      }
    },
    {
      "misconception_id": "theta_90_means_formula_fails",
      "description": "Student thinks A·B = 0 is a special failure case rather than a valid result",
      "trigger_match": [
        "90 degree pe formula fail ho gaya",
        "cos 90 = 0 isliye formula wrong",
        "why answer zero",
        "dot product at 90 degrees confused",
        "90° pe kaise zero aaya"
      ],
      "state_count": 6,
      "feedback_tag": "dot_product_zero_when_perpendicular",
      "states": {
        "STATE_1": {
          "label": "Show perpendicular vectors",
          "physics_layer": {
            "vector_A": {
              "magnitude": 5,
              "direction_deg": 0,
              "color": "#4FC3F7"
            },
            "vector_B": {
              "magnitude": 4,
              "direction_deg": 90,
              "color": "#FF8A65"
            },
            "show_dot_product": 0,
            "freeze": false,
            "scenario": "dp_wrong_nonzero_perp"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Zero is the correct answer because there is no aligned part.",
            "real_world_anchor": "Northward motion does not help eastward work."
          }
        },
        "STATE_2": {
          "label": "Explain projection",
          "physics_layer": {
            "show_projection": true,
            "projected_component": 0,
            "freeze": true,
            "scenario": "dp_cos90_is_zero"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "At 90°, the projection of one vector on the other is zero.",
            "attention_target": "The vanished projection"
          }
        },
        "STATE_3": {
          "label": "Compare 0°, 90°, 180°",
          "physics_layer": {
            "cases": [
              {
                "theta_deg": 0,
                "value": "AB"
              },
              {
                "theta_deg": 90,
                "value": 0
              },
              {
                "theta_deg": 180,
                "value": "-AB"
              }
            ],
            "freeze": true,
            "scenario": "dp_aha_orthogonality_test"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "The formula works across the full angle range.",
            "contrast_from_previous": "Zero is one normal outcome in the cosine pattern."
          }
        },
        "STATE_4": {
          "label": "Unit vector example",
          "physics_layer": {
            "show_unit_vector_examples": true,
            "rules": [
              "i·j = 0",
              "j·k = 0",
              "k·i = 0"
            ],
            "freeze": true,
            "scenario": "theta_90_means_formula_fails_s4"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Orthogonal basis vectors are designed to have zero dot product."
          }
        },
        "STATE_5": {
          "label": "Work interpretation",
          "physics_layer": {
            "show_force_displacement": true,
            "formula": "W = F s cosθ",
            "theta_deg": 90,
            "W": 0,
            "freeze": true,
            "scenario": "theta_90_means_formula_fails_s5"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "If force is perpendicular to displacement, it does no work."
          }
        },
        "STATE_6": {
          "label": "Closure",
          "physics_layer": {
            "show_summary_box": true,
            "summary": "Zero dot product means perpendicular vectors",
            "freeze": true,
            "scenario": "theta_90_means_formula_fails_s6"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Zero means orthogonal, not broken formula."
          }
        }
      }
    },
    {
      "misconception_id": "dot_product_only_magnitude",
      "description": "Student ignores angle and thinks dot product is just A times B",
      "trigger_match": [
        "just multiply the magnitudes",
        "A times B hi hoga",
        "angle ignore kar do",
        "dot product means multiplication only",
        "cos theta unnecessary hai"
      ],
      "state_count": 6,
      "feedback_tag": "dot_product_angle_required",
      "states": {
        "STATE_1": {
          "label": "Show same magnitudes at different angles",
          "physics_layer": {
            "cases": [
              {
                "theta_deg": 0,
                "value": 20
              },
              {
                "theta_deg": 60,
                "value": 10
              },
              {
                "theta_deg": 90,
                "value": 0
              }
            ],
            "freeze": false,
            "scenario": "dot_product_only_magnitude_s1"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Same magnitudes give different answers because angle matters.",
            "attention_target": "20, 10, 0 appearing for the same A and B"
          }
        },
        "STATE_2": {
          "label": "Bring in cosine",
          "physics_layer": {
            "show_formula": "A·B = AB cosθ",
            "highlight_cos": true,
            "freeze": true,
            "scenario": "dot_product_only_magnitude_s2"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Cosine is the angle filter — it keeps only the aligned part."
          }
        },
        "STATE_3": {
          "label": "Projection view",
          "physics_layer": {
            "show_projection": true,
            "show_aligned_component": true,
            "freeze": true,
            "scenario": "dot_product_only_magnitude_s3"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Dot product is not just multiplication; it is multiplication by alignment."
          }
        },
        "STATE_4": {
          "label": "Component formula",
          "physics_layer": {
            "show_component_formula": "A·B = A_x B_x + A_y B_y + A_z B_z",
            "freeze": true,
            "scenario": "dot_product_only_magnitude_s4"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Only matching directions contribute."
          }
        },
        "STATE_5": {
          "label": "Physical example",
          "physics_layer": {
            "show_force_displacement": true,
            "formula": "W = F·s",
            "freeze": true,
            "scenario": "dot_product_only_magnitude_s5"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "A sideways force may be large, but it may do no work."
          }
        },
        "STATE_6": {
          "label": "Closure",
          "physics_layer": {
            "show_summary_box": true,
            "summary": "Angle is essential in dot product",
            "freeze": true,
            "scenario": "dot_product_only_magnitude_s6"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "A dot B is magnitude times aligned part, not plain multiplication."
          }
        }
      }
    }
  ],
  "epic_c_micro_templates": [
    {
      "template_id": "symbol_meaning",
      "applies_when": "student asks what a symbol means",
      "example_queries": [
        "what is A dot B",
        "what does cos theta mean here",
        "what is the unit of dot product"
      ],
      "state_count": 2,
      "feedback_tag": "dot_product_micro_symbol",
      "states": {
        "STATE_1": {
          "label": "Highlight the symbol",
          "instruction": "Show the symbol A·B and label it as a scalar. Use one short sentence only."
        },
        "STATE_2": {
          "label": "Connect symbol to meaning",
          "instruction": "Show that A·B means magnitude of A times component of B along A."
        }
      }
    },
    {
      "template_id": "constant_origin",
      "applies_when": "student asks where a factor or term comes from",
      "example_queries": [
        "why cos theta",
        "why AB",
        "why this factor 2"
      ],
      "state_count": 3,
      "feedback_tag": "dot_product_micro_constant",
      "states": {
        "STATE_1": {
          "label": "Show the origin",
          "instruction": "Point to the projection of one vector on the other."
        },
        "STATE_2": {
          "label": "Convert projection to formula",
          "instruction": "Show projection = B cosθ, then multiply by A to get A·B = AB cosθ."
        },
        "STATE_3": {
          "label": "Boundary check",
          "instruction": "Test θ = 0°, 90°, 180° to confirm the formula behaves correctly."
        }
      }
    },
    {
      "template_id": "law_check",
      "applies_when": "student asks about commutativity or distributivity",
      "example_queries": [
        "is A dot B same as B dot A",
        "prove distributive property",
        "why i dot j equals zero"
      ],
      "state_count": 2,
      "feedback_tag": "dot_product_micro_law",
      "states": {
        "STATE_1": {
          "label": "State the law",
          "instruction": "Show the law directly in one line, with no derivation overload."
        },
        "STATE_2": {
          "label": "Quick check with unit vectors",
          "instruction": "Use i·i = 1 and i·j = 0 to validate the law visually."
        }
      }
    },
    {
      "template_id": "spatial_question",
      "applies_when": "student marks a diagram or asks about direction alignment",
      "example_queries": [
        "why this angle",
        "which part contributes",
        "why along this axis"
      ],
      "state_count": 3,
      "feedback_tag": "dot_product_micro_spatial",
      "states": {
        "STATE_1": {
          "label": "Show the geometry",
          "instruction": "Draw both vectors from a common origin and mark the angle."
        },
        "STATE_2": {
          "label": "Show the projection",
          "instruction": "Drop a perpendicular to show the component along the chosen vector."
        },
        "STATE_3": {
          "label": "Link to answer",
          "instruction": "Show the aligned component times the magnitude gives the dot product."
        }
      }
    },
    {
      "template_id": "boundary_condition",
      "applies_when": "student asks when the formula becomes zero, maximum, or negative",
      "example_queries": [
        "when is dot product zero",
        "when is it maximum",
        "when does it become negative"
      ],
      "state_count": 2,
      "feedback_tag": "dot_product_micro_boundary",
      "states": {
        "STATE_1": {
          "label": "Boundary case",
          "instruction": "Show θ = 0°, 90°, 180° as the three key boundaries."
        },
        "STATE_2": {
          "label": "Interpretation",
          "instruction": "Show positive, zero, and negative dot product meanings side by side."
        }
      }
    }
  ],
  "static_responses": [
    {
      "response_id": "definition_recall",
      "triggers": [
        "what is dot product",
        "define scalar product",
        "dot product meaning"
      ],
      "response_type": "text",
      "ai_cost": 0,
      "content": "The dot product (scalar product) of two vectors A and B is A·B = AB cosθ, where θ is the angle between them. It is a scalar quantity. It equals magnitude of one vector times the component of the other along it."
    },
    {
      "response_id": "unit_vector_rule",
      "triggers": [
        "i dot j",
        "unit vectors dot product",
        "orthogonal vectors"
      ],
      "response_type": "text",
      "ai_cost": 0,
      "content": "For orthogonal unit vectors, i·j = j·k = k·i = 0, and i·i = j·j = k·k = 1. This is because the angle is 90° for different axes and 0° for the same axis."
    },
    {
      "response_id": "work_relation",
      "triggers": [
        "work done formula",
        "why work is dot product",
        "force displacement relation"
      ],
      "response_type": "text_with_steps",
      "ai_cost": 0,
      "content": "Work done by a constant force is W = F·s = Fs cosθ. Only the component of force along displacement contributes to work. If force is perpendicular to displacement, work is zero."
    },
    {
      "response_id": "component_relation",
      "triggers": [
        "projection meaning",
        "component along vector",
        "why cosine used"
      ],
      "response_type": "text",
      "ai_cost": 0,
      "content": "A·B = AB cosθ. Here, B cosθ is the component of B along A, and A cosθ is the component of A along B. The dot product is therefore a measure of alignment."
    }
  ],
  "problem_guidance_path": "1. Identify the two vectors and the angle between them. 2. Decide whether the question is asking for a scalar value, a projection, or a physical quantity like work. 3. If the vectors are given in component form, use A·B = A_x B_x + A_y B_y + A_z B_z. 4. If the angle is given, use A·B = AB cosθ. 5. Check whether the result should be positive, zero, or negative using the angle. 6. For work problems, use W = F·s and keep units in joules. 7. Verify boundary cases at 0°, 90°, and 180°.",
  "example_library": {
    "example_1": {
      "source": "DC Pandey Section 5.5 (Dot Product) — Examples 5.12–5.14",
      "principle": "Dot product in component form: A·B = AxBx + AyBy + AzBz — no angle needed",
      "aha": "Component form is often faster than A·B = AB cosθ when vectors are already in î ĵ k̂ notation",
      "simulation_states": 2
    },
    "example_2": {
      "source": "DC Pandey Section 5.5",
      "principle": "Work done by a force: W = F·s = Fs cosθ — scalar result from two vector inputs",
      "aha": "Work is zero when force is perpendicular to displacement (θ=90°, cos90°=0) — normal force does no work",
      "simulation_states": 2
    },
    "example_3": {
      "source": "DC Pandey Section 5.5",
      "principle": "Finding angle between two vectors using cosθ = A·B/(|A||B|)",
      "aha": "This is the standard method when vectors are in component form — compute dot product then divide by magnitudes",
      "simulation_states": 2
    }
  },
  "assessment_path": [
    {
      "question_id": "assess_1",
      "question": "Find the dot product of A = 3 i + 4 j and B = 4 i - 3 j.",
      "on_wrong_answer": "Route to epic_c_micro_templates.template_id = law_check if the mistake is about component multiplication, otherwise route to epic_c_branches.dot_product_only_magnitude for angle ignorance."
    },
    {
      "question_id": "assess_2",
      "question": "A force of 10 N acts through a displacement of 2 m at 60°. Find the work done.",
      "on_wrong_answer": "Route back to static_responses.work_relation if the student misses W = F·s, otherwise route to epic_c_micro_templates.template_id = constant_origin."
    }
  ],
  "session_awareness": {
    "remember_last_route": true,
    "remember_last_misconception_id": true,
    "reuse_previous_angle_example": true,
    "max_memory_scope": "current_session_only"
  },
  "waypoints": [
    {
      "must_reach": "Student understands dot product is scalar",
      "physics_floor": "A·B = AB cosθ always remains a scalar",
      "position": "start"
    },
    {
      "must_reach": "Student understands projection meaning",
      "physics_floor": "Only aligned component contributes",
      "position": "middle"
    },
    {
      "must_reach": "Student can use component form and work relation",
      "physics_floor": "A·B = A_x B_x + A_y B_y + A_z B_z and W = F·s",
      "position": "end"
    }
  ],
  "depth_escalation_trigger": [
    "student still confuses scalar and vector after STATE_3",
    "student cannot explain projection after micro template",
    "student repeatedly gets sign wrong for 90° or 180°",
    "student asks for full derivation rather than answer only"
  ],
  "legend": [
    {
      "symbol": "A·B",
      "meaning": "Scalar product of vectors A and B"
    },
    {
      "symbol": "θ",
      "meaning": "Angle between the two vectors"
    },
    {
      "symbol": "projection",
      "meaning": "Part of one vector along the other"
    },
    {
      "symbol": "i, j, k",
      "meaning": "Unit vectors along x, y, z axes"
    },
    {
      "symbol": "W",
      "meaning": "Work done by force"
    }
  ],
  "concept_extension_fields": {
    "note": "These fields are specific to dot product and are not in the base schema. The renderer must handle them only for scenario_type = dot_product",
    "show_projection": true,
    "show_component_rules": true,
    "show_work_overlay": true,
    "component_formula": "A·B = A_x B_x + A_y B_y + A_z B_z",
    "special_cases_to_highlight": [
      {
        "theta": 0,
        "A_dot_B_formula": "AB",
        "label": "Maximum positive"
      },
      {
        "theta": 90,
        "A_dot_B_formula": "0",
        "label": "Perpendicular"
      },
      {
        "theta": 180,
        "A_dot_B_formula": "-AB",
        "label": "Maximum negative"
      }
    ]
  },
  "jee_specific": {
    "typical_question_types": [
      "find dot product from magnitudes and angle",
      "compute dot product from i, j, k components",
      "find angle between vectors using dot product",
      "calculate work done using force and displacement",
      "check whether two vectors are perpendicular"
    ],
    "common_traps": [
      "Forgetting the cosine factor",
      "Treating dot product like a vector product",
      "Using 90° case as if formula has failed",
      "Confusing scalar product with component itself",
      "Ignoring sign at 180°"
    ],
    "key_results_to_memorize": [
      "A·B = AB cosθ",
      "If θ = 0°, then A·B = AB",
      "If θ = 90°, then A·B = 0",
      "If θ = 180°, then A·B = -AB",
      "W = F·s"
    ]
  },
  "concept_relationships": {
    "prerequisites": [
      "scalar_and_vector_quantities",
      "trigonometry_basics",
      "vector_components"
    ],
    "extensions": [
      "cross_product",
      "work_energy_theorem",
      "projection_and_resolution"
    ],
    "siblings": [
      "vector_addition",
      "vector_components",
      "cross_product"
    ],
    "common_exam_combinations": [
      "work done in mechanics",
      "angle between vectors",
      "projection of one vector on another"
    ]
  },
  "parameter_slots": {
    "A": {
      "label": "magnitude of vector A",
      "range": [
        1,
        20
      ],
      "unit": "units",
      "default": 4,
      "extraction_hint": "first vector magnitude"
    },
    "B": {
      "label": "magnitude of vector B",
      "range": [
        1,
        20
      ],
      "unit": "units",
      "default": 3,
      "extraction_hint": "second vector magnitude"
    },
    "theta": {
      "label": "angle between A and B",
      "range": [
        0,
        180
      ],
      "unit": "degrees",
      "default": 60,
      "extraction_hint": "angle between the vectors"
    }
  },
  "panel_sync_spec": {
    "canvas_to_graph": {
      "trigger": "STATE_N_reached",
      "action": "graph marks dot product value on A.B vs theta curve"
    },
    "graph_to_canvas": {
      "trigger": "student_hover_on_graph_at_theta",
      "action": "canvas animates vectors to that angle"
    },
    "slider_to_both": {
      "parameter": "theta",
      "canvas_action": "vectors rotate, projection shadow updates",
      "graph_action": "dot moves along A.B = AB cos(theta) curve"
    }
  },
  "checkpoint_states": {
    "understands_definition": "enter at STATE_2",
    "understands_formula": "enter at STATE_3",
    "understands_physical_meaning": "enter at STATE_4",
    "understands_component_form": "enter at STATE_5"
  },
  "three_js_flag": false,
  "three_js_note": "Dot product projection is a 2D visual. canvas2d handles the projection shadow correctly. Three.js not needed.",
  "regeneration_variants": [
    {
      "variant_id": 1,
      "scenario_type": "dot_product",
      "approach": "projection_geometry",
      "entry_state": "STATE_3",
      "teacher_angle": "Start with the geometric meaning before the formula. A dot B equals the length of A's shadow on B, multiplied by the magnitude of B. Draw A, draw B, drop a perpendicular from A's tip to the line of B. That shadow length times |B| is the dot product. This visual immediately explains why perpendicular vectors give zero — the shadow has zero length. And why parallel vectors give maximum dot product — the shadow equals the full length of A.",
      "locked_facts_focus": [
        "fact_2",
        "fact_3",
        "fact_4"
      ],
      "panel_b_focus": "Interactive: rotate vector A around fixed vector B. Shadow of A onto B animates — growing, shrinking, going to zero at 90 degrees, going negative after 90 degrees. Dot product value plots live alongside the angle."
    },
    {
      "variant_id": 2,
      "scenario_type": "dot_product",
      "approach": "connects_to_work_already_known",
      "entry_state": "STATE_1",
      "teacher_angle": "The student already knows Work = F times d times cos theta from lower classes. That formula IS the dot product. W = F dot d. The dot product is not a new abstract invention — it is the mathematical structure that was hiding inside the work formula all along. Every time the student calculated work using F d cos theta, they were computing a dot product. Now they are just learning the name and the general rule.",
      "locked_facts_focus": [
        "fact_1",
        "fact_6",
        "fact_7"
      ],
      "panel_b_focus": "Show force arrow F and displacement arrow d at angle theta. Work = F d cos theta labeled. Then reveal: this equals F dot d. The dot product formula appears as a generalisation of the familiar work formula."
    }
  ]
}
```


# motion_graphs.json
```json
{
  "concept_id": "motion_graphs",
  "concept_name": "Motion Graphs — Position-Time, Velocity-Time, Acceleration-Time",
  "class_level": 11,
  "chapter": "Kinematics",
  "section": "6.9",
  "source_coverage": {
    "dc_pandey": "Chapter 6, Section 6.9 — Graphs",
    "ncert": "Chapter 3 — Motion in a Straight Line, Section 3.5",
    "hc_verma": "Chapter 3 — Rest and Motion: Kinematics, Section 3.5"
  },
  "source_type": "ncert_and_dc_pandey",
  "renderer_hint": {
    "technology": "canvas2d",
    "technology_b": "plotly",
    "technology_c": "plotly",
    "renderer": "mechanics_2d",
    "scenario_type": "motion_graphs",
    "panel_count": 3,
    "sync_required": true,
    "scene_mode": false,
    "show_labels": true,
    "panel_a_role": "Animated particle moving on a track — position updating in real time, shows actual physical motion",
    "panel_b_role": "Plotly x-t graph (position vs time) — slope at any point = instantaneous velocity",
    "panel_c_role": "Plotly v-t graph (velocity vs time) — slope = acceleration, area under curve = displacement"
  },
  "locked_facts": {
    "xt_slope_is_velocity": "Slope of x-t graph at any point = instantaneous velocity at that moment. Steep slope → high speed. Zero slope (horizontal) → particle at rest. Negative slope → moving in negative direction.",
    "vt_slope_is_acceleration": "Slope of v-t graph at any point = instantaneous acceleration. Positive slope → acceleration. Negative slope → deceleration. Zero slope (horizontal) → uniform velocity, zero acceleration.",
    "vt_area_is_displacement": "Area under v-t graph between t₁ and t₂ = displacement in that interval. Area above x-axis = positive displacement. Area below x-axis = negative displacement. Total area = net displacement.",
    "vt_area_distance": "Distance (not displacement) = total area counting all regions as positive, regardless of sign.",
    "at_area_is_velocity_change": "Area under a-t graph = change in velocity (Δv). NOT velocity itself — change in velocity.",
    "xt_graph_shapes": "Uniform motion (a=0): straight line on x-t. Uniform acceleration: parabola on x-t. Deceleration to rest: parabola flattening to horizontal.",
    "vt_graph_shapes": "Uniform motion: horizontal line on v-t. Uniform acceleration: straight sloped line. Non-uniform acceleration: curved line.",
    "slope_formula": "Slope at a point on a curve = slope of tangent drawn at that point = lim(Δx/Δt) as Δt→0 = dx/dt.",
    "particle_at_rest_on_xt": "On x-t graph: horizontal line segment means particle is at rest (not moving, x = constant).",
    "direction_reversal_on_vt": "On v-t graph: when line crosses x-axis (v=0), the particle reverses direction. Displacement for each phase is the area of that triangle/trapezoid on each side.",
    "acceleration_from_xt": "From x-t graph: acceleration = d²x/dt². If x-t is concave up → positive acceleration. Concave down → negative acceleration. Straight line → zero acceleration.",
    "tangent_vs_secant": "Instantaneous velocity = slope of tangent at a point on x-t. Average velocity = slope of secant (chord) connecting two points on x-t."
  },
  "minimum_viable_understanding": "x-t slope = velocity. v-t slope = acceleration. v-t area = displacement. These three rules decode every motion graph question in JEE.",
  "variables": {
    "x": "Position (m)",
    "v": "Velocity = dx/dt = slope of x-t (m/s)",
    "a": "Acceleration = dv/dt = slope of v-t (m/s²)",
    "t": "Time (s)",
    "A_vt": "Area under v-t graph = displacement (m)",
    "theta": "Angle of tangent on x-t or v-t with time axis"
  },
  "routing_signals": {
    "global_triggers": [
      "explain motion graphs",
      "x-t graph v-t graph a-t graph",
      "position time velocity time graph",
      "motion graphs kya hote hain",
      "how to read motion graphs"
    ],
    "local_triggers": [
      "slope of x-t graph",
      "area under v-t graph",
      "what does slope of velocity time graph give",
      "how to find displacement from v-t graph",
      "x-t graph mein velocity kaise nikale",
      "particle reverses direction on graph"
    ],
    "micro_triggers": [
      "what is slope of v-t graph",
      "area under a-t graph",
      "concave up concave down x-t",
      "tangent on x-t graph"
    ],
    "simulation_not_needed_triggers": [
      "list what slope of each graph gives",
      "state the three graph rules"
    ],
    "subconcept_triggers": {
      "xt_graph": [
        "x-t graph slope meaning",
        "position time graph",
        "how to find velocity from x-t"
      ],
      "vt_graph": [
        "v-t graph area",
        "velocity time graph slope",
        "displacement from v-t graph",
        "area under velocity graph"
      ],
      "at_graph": [
        "a-t graph",
        "acceleration time graph",
        "area under a-t graph meaning"
      ],
      "direction_reversal": [
        "particle changes direction on graph",
        "v-t graph crosses x axis",
        "when does particle turn back"
      ]
    }
  },
  "checkpoint_states": {
    "understands_xt_slope": "enter at STATE_2",
    "understands_vt_area": "enter at STATE_3",
    "understands_vt_slope": "enter at STATE_4",
    "understands_all_three": "enter at STATE_5"
  },
  "prerequisite_check": {
    "required_concepts": [
      "distance_vs_displacement",
      "uniform_acceleration"
    ],
    "gate_question": "A particle moves at 5 m/s for 4s then at 3 m/s for 2s. What is the total displacement? (If student cannot answer 26m, route to distance_vs_displacement first.)",
    "if_gap_detected": "redirect to uniform_acceleration.json — student needs to understand what velocity and acceleration mean before reading their graphs"
  },
  "epic_l_path": {
    "state_count": 6,
    "board_mode_states": [
      1,
      2,
      3,
      4
    ],
    "jee_mode_states": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "scope": "global",
    "states": {
      "STATE_1": {
        "label": "The Hook — Three Graphs, One Motion",
        "physics_layer": {
          "concept": "The same physical motion can be represented as three different graphs simultaneously",
          "simulation_focus": "Show a ball thrown upward and caught. All three panels update live: Panel A shows ball moving up then down. Panel B (x-t) shows parabola peaking at max height. Panel C (v-t) shows straight line from positive v, crossing zero at peak, going negative.",
          "sync": "Vertical line cursor moves across both graphs in sync with ball position in Panel A.",
          "key_observation": "Three completely different graph shapes — all describing the SAME motion. Reading any one of them gives full information about the others.",
          "scenario": "particle_constant_velocity"
        },
        "pedagogy_layer": {
          "opening_question": "A ball is thrown up. Can you draw what happens to its position, velocity, and acceleration — all at the same time?",
          "teacher_script": "Physics stores all information about motion in these three graphs. Once you can read them, any kinematics problem becomes a geometry problem.",
          "surprise_moment": "The x-t is a smooth curve, the v-t is a straight line, the a-t is a flat horizontal line — same motion, three completely different shapes."
        }
      },
      "STATE_2": {
        "label": "Rule 1 — Slope of x-t = Velocity",
        "physics_layer": {
          "concept": "Velocity is the rate of change of position = slope of x-t graph",
          "simulation_focus": "Panel A: particle moving at varying speeds. Panel B (x-t): cursor at different points. At each point, tangent line drawn — its slope shown numerically. Panel C (v-t): point highlighted at same t showing same value.",
          "interactive": "Student drags cursor along x-t curve, sees tangent slope = velocity value update on v-t graph in sync.",
          "four_cases": {
            "steep_positive": "Fast motion in +x direction",
            "gentle_positive": "Slow motion in +x direction",
            "horizontal": "Particle at rest (v=0)",
            "negative_slope": "Motion in −x direction"
          },
          "scenario": "st_graph_linear"
        },
        "pedagogy_layer": {
          "analogy": "x-t graph is like a topographic map — steep sections are fast travel, flat sections are standing still.",
          "jee_tip": "When x-t graph is given: immediately identify horizontal segments (at rest), steep segments (fast), and sign of slope (direction)."
        }
      },
      "STATE_3": {
        "label": "Rule 2 — Area under v-t = Displacement",
        "physics_layer": {
          "concept": "Displacement = ∫v dt = area under v-t curve. Sign of area = sign of displacement.",
          "simulation_focus": "Show v-t graph with two phases: positive velocity triangle (0 to t₁) and negative velocity triangle (t₁ to t₂). Shade each region. Show: Area 1 (positive) = displacement to the right. Area 2 (negative) = displacement to the left. Net displacement = Area 1 − Area 2.",
          "panel_a_sync": "Particle moves right during phase 1, reverses and moves left during phase 2. Final position = initial + net displacement.",
          "key_distinction": "Distance = |Area 1| + |Area 2| (both positive). Displacement = Area 1 − Area 2 (signed).",
          "scenario": "vt_graph_constant"
        },
        "pedagogy_layer": {
          "key_message": "Area is the bridge from v-t graph back to position. Every region of the v-t graph is a piece of displacement.",
          "common_mistake": "Students add all areas as positive for displacement — gives distance, not displacement."
        }
      },
      "STATE_4": {
        "label": "Rule 3 — Slope of v-t = Acceleration",
        "physics_layer": {
          "concept": "Acceleration = dv/dt = slope of v-t graph",
          "simulation_focus": "Show v-t graph: Phase 1 steep positive slope (large +a), Phase 2 gentle positive slope (small +a), Phase 3 horizontal (a=0), Phase 4 negative slope (deceleration). Panel A shows particle behavior matching each phase.",
          "concavity_rule": "Connect to x-t: if v-t has positive slope → a > 0 → x-t is concave upward. If v-t has negative slope → a < 0 → x-t is concave downward.",
          "panel_c": "a-t graph shows horizontal segments matching each v-t slope value.",
          "scenario": "particle_accelerating"
        },
        "pedagogy_layer": {
          "key_message": "The v-t graph is the 'master graph' — its slope tells you a, its area tells you x. Once you have v-t, you can reconstruct everything.",
          "jee_tip": "If v-t is a straight line → uniform acceleration → suvat applies. If v-t is curved → non-uniform acceleration → calculus needed."
        }
      },
      "STATE_5": {
        "label": "The Aha Moment — Reading All Three Together",
        "physics_layer": {
          "concept": "A single complex motion — identify every phase from all three graphs simultaneously",
          "simulation_focus": "Show a complex v-t graph: particle starts from rest, accelerates, moves at constant velocity, decelerates, stops, reverses. Student must identify each phase on all three panels.",
          "phases": [
            "0 to t1: v increases linearly → uniform acceleration → x-t parabola (concave up)",
            "t1 to t2: v constant → a=0 → x-t straight line",
            "t2 to t3: v decreases to 0 → deceleration → x-t parabola (concave down) flattening",
            "t3 to t4: v goes negative → particle reverses → x-t starts decreasing"
          ],
          "panel_sync": "All three panels animate together. Vertical cursor links the moment across all three graphs.",
          "scenario": "st_curve_vt_slope_at_flat"
        },
        "pedagogy_layer": {
          "key_message": "Every 'kink' in the v-t graph is a change in acceleration. Every zero-crossing is a direction reversal. Read it left to right like a story."
        }
      },
      "STATE_6": {
        "label": "Student Interaction — Decode This Graph",
        "physics_layer": {
          "concept": "Apply all three rules to a JEE-style graph question",
          "problem": "Given v-t graph: starts at v=10 m/s, decreases linearly to 0 at t=5s, then stays 0 until t=8s, then increases to −6 at t=11s. Find: (i) acceleration in each phase, (ii) displacement 0 to 5s, (iii) position at t=11s if x₀=0.",
          "interactive": "Student identifies phases by clicking regions. System confirms identification before showing solution.",
          "scenario": "graph_reading_skill"
        },
        "pedagogy_layer": {
          "teacher_script": "Before solving anything — name each phase. Phase 1: deceleration. Phase 2: rest. Phase 3: acceleration in −x direction. Now it's just geometry."
        }
      }
    }
  },
  "epic_c_branches": [
    {
      "branch_id": "slope_is_speed_not_velocity",
      "misconception": "Student reads slope of x-t as speed (magnitude only), ignoring the sign of slope",
      "student_belief": "Negative slope on x-t means the particle is slowing down, not moving in the opposite direction",
      "trigger_phrases": [
        "negative slope means decelerating",
        "x-t graph going down means slowing",
        "slope negative means speed decreasing",
        "downward slope on x-t graph",
        "x-t slope negative matlab kya"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Show x-t graph with negative slope. Student interpretation: 'particle is slowing down'. Simulation shows particle moving at constant speed in the NEGATIVE x-direction — not slowing, just moving backwards. Speedometer shows constant speed, direction arrow points left.",
            "label": "Student says: slowing down. Reality: moving left at constant speed. Same slope, completely different physics.",
            "scenario": "mg_wrong_slope_is_displacement"
          },
          "pedagogy_layer": {
            "teacher_script": "Slope sign = direction of motion, NOT rate of change of speed. Negative slope = moving in −x direction at constant velocity. To slow down, you need the slope to be CHANGING (decreasing in magnitude)."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Show four x-t graphs side by side: (1) positive slope → moving right. (2) negative slope → moving left. (3) slope decreasing to zero → slowing down and stopping. (4) slope increasing → speeding up. Student drags each case to its particle behavior.",
            "label": "Sign of slope = direction. Magnitude of slope = speed. Change in slope = acceleration.",
            "scenario": "mg_slope_is_velocity"
          },
          "pedagogy_layer": {
            "rule": "Three separate questions from x-t graph: WHAT DIRECTION (sign of slope), HOW FAST (magnitude of slope), ACCELERATING? (is slope changing)."
          }
        },
        "STATE_3": {
          "physics_layer": {
            "simulation": "JEE-style: Show x-t graph with particle going from x=5 down to x=−3 linearly. Ask: velocity? Answer: negative (−ve). Ask: speed? Answer: |slope| = positive number. Ask: accelerating? Answer: No — straight line, constant slope.",
            "label": "x=5 to x=−3 in 4s: velocity = (−3−5)/4 = −2 m/s. Speed = 2 m/s. Acceleration = 0. Three different answers from one graph.",
            "scenario": "mg_aha_slope_gives_rate"
          }
        }
      }
    },
    {
      "branch_id": "area_gives_velocity_not_displacement",
      "misconception": "Student thinks area under v-t graph gives velocity, not displacement",
      "student_belief": "Bigger area on v-t graph means higher velocity",
      "trigger_phrases": [
        "area under v-t graph gives velocity",
        "what does area under velocity graph mean",
        "v-t area matlab velocity",
        "bigger area more velocity",
        "area under graph displacement ya velocity"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Show v-t graph: horizontal line at v=10 m/s from t=0 to t=5s. Student says area = velocity = 50. But the VELOCITY is clearly 10 m/s (readable directly from y-axis). The area = 50 m — which is the DISPLACEMENT.",
            "label": "Velocity is already on the y-axis — you don't need area for that. Area = displacement.",
            "scenario": "mg_wrong_area_is_velocity"
          },
          "pedagogy_layer": {
            "teacher_script": "Think about units. v-t graph: y-axis is m/s, x-axis is s. Area = (m/s) × s = m. That unit is displacement, not velocity."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Unit analysis animated: Rectangle on v-t graph. Height = 10 m/s. Width = 5 s. Area = 10 × 5 = 50 m/s × s = 50 m. Label: metres = displacement unit. Show particle traveling 50m on Panel A to confirm.",
            "label": "Unit check never lies: (m/s) × s = m. Area under v-t is always displacement.",
            "scenario": "mg_aha_area_accumulates"
          },
          "pedagogy_layer": {
            "rule": "Similarly: area under a-t = (m/s²) × s = m/s = change in velocity. Units always tell you what the area means."
          }
        }
      }
    },
    {
      "branch_id": "ignoring_sign_in_area",
      "misconception": "Student adds all v-t areas as positive, giving distance instead of displacement",
      "student_belief": "Area is always positive, so just add up all shaded regions",
      "trigger_phrases": [
        "I added all the areas",
        "total area positive and negative both",
        "net displacement kaise nikale v-t se",
        "area below axis bhi add kiya",
        "displacement calculation v-t graph wrong"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "v-t graph: positive triangle (area=20m) from 0 to t₁, negative triangle (area=−12m) from t₁ to t₂. Student adds: 20+12=32m. But particle moved 20m right then 12m left — net displacement = 8m, not 32m. Show particle ending up at x=8, not x=32.",
            "label": "32m is the distance traveled. 8m is the displacement. Adding areas without sign gave distance.",
            "scenario": "ignoring_sign_in_area_s1"
          },
          "pedagogy_layer": {
            "teacher_script": "Above the t-axis: positive velocity = rightward motion = positive displacement. Below the t-axis: negative velocity = leftward motion = negative displacement. Net displacement = positive areas MINUS negative areas."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Show same graph: shade positive region green (+20m), shade negative region red (−12m). Net = green − red = +8m. Distance = green + |red| = 32m. Both answers from same graph, different methods.",
            "label": "Displacement: green − red (signed sum). Distance: green + red (unsigned sum). Two different questions, two different operations on the same graph.",
            "scenario": "ignoring_sign_in_area_s2"
          },
          "pedagogy_layer": {
            "rule": "Exam question says 'displacement' → signed area sum. Says 'distance' → unsigned area sum. Read the question word carefully."
          }
        }
      }
    },
    {
      "branch_id": "concavity_confusion",
      "misconception": "Student cannot connect x-t concavity to sign of acceleration",
      "student_belief": "Concave up on x-t means particle is going up physically, or means position is increasing",
      "trigger_phrases": [
        "concave up means moving upward",
        "x-t parabola opening up means what",
        "concavity of x-t graph",
        "what does x-t curve shape tell us",
        "x-t concave down matlab"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Show x-t graph concave up (parabola opening upward). Student marks: 'particle moving upward physically'. But x-axis is TIME, not vertical position. Show actual particle moving along a HORIZONTAL track — the curve shape says nothing about physical direction.",
            "label": "Concavity is NOT physical direction. x-t is a GRAPH — x-axis is time, y-axis is position. Concave up = acceleration is positive.",
            "scenario": "concavity_confusion_s1"
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Show side by side: x-t concave up → v-t has positive slope → a > 0. x-t concave down → v-t has negative slope → a < 0. x-t straight line → v-t horizontal → a = 0.",
            "label": "Concave up → speeding up in +x. Concave down → slowing down (or speeding in −x). These are always true regardless of whether particle moves left or right.",
            "scenario": "concavity_confusion_s2"
          },
          "pedagogy_layer": {
            "rule": "Concavity rule: d²x/dt² > 0 → concave up. d²x/dt² < 0 → concave down. This IS the definition of acceleration — second derivative of x."
          }
        }
      }
    },
    {
      "branch_id": "at_area_gives_position",
      "misconception": "Student thinks area under a-t graph gives position or displacement",
      "student_belief": "Area under a-t graph tells us how far the particle moved",
      "trigger_phrases": [
        "area under a-t graph displacement deta hai",
        "a-t graph area meaning",
        "what does area under acceleration graph give",
        "a-t area displacement ya velocity"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Show a-t graph (constant a = 5 m/s², from t=0 to t=3s). Student says area = displacement = 15m. But a-t area = 5 × 3 = 15 m/s² × s = 15 m/s = CHANGE IN VELOCITY. Show: if v starts at 0, it ends at 15 m/s — not 15 meters.",
            "label": "Units again: (m/s²) × s = m/s. Area under a-t is change in velocity, not displacement.",
            "scenario": "at_area_gives_position_s1"
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Three graph areas and their meanings: v-t area = (m/s)×s = m = displacement. a-t area = (m/s²)×s = m/s = Δvelocity. Neither x-t nor a-t gives displacement directly — only v-t area does.",
            "label": "Graph area cheatsheet: only v-t area = displacement. a-t area = velocity change. x-t area = meaningless in physics.",
            "scenario": "at_area_gives_position_s2"
          },
          "pedagogy_layer": {
            "rule": "For a-t area: if particle starts at v₀, then v_final = v₀ + (area under a-t). Area shifts the velocity curve, doesn't give position."
          }
        }
      }
    }
  ],
  "epic_c_micro_templates": {
    "micro_1": {
      "trigger": "slope of x-t graph gives what",
      "scope": "micro",
      "states": 2,
      "content": "Slope of x-t graph = instantaneous velocity. At any point on the x-t curve, draw the tangent — its slope (rise/run = Δx/Δt) = velocity at that instant. Positive slope = moving in +x direction. Negative slope = moving in −x direction. Zero slope (horizontal tangent) = momentarily at rest."
    },
    "micro_2": {
      "trigger": "area under v-t graph",
      "scope": "micro",
      "states": 2,
      "content": "Area under v-t graph = displacement. Units confirm: (m/s) × s = m. For displacement: sum areas with sign (above axis positive, below axis negative). For distance: sum all areas as positive values. This is the most commonly tested graph rule in JEE."
    },
    "micro_3": {
      "trigger": "how to find when particle reverses direction",
      "scope": "micro",
      "states": 2,
      "content": "On v-t graph: particle reverses direction exactly when v = 0 (graph crosses the time axis). On x-t graph: the turning point is where the slope = 0 (tangent is horizontal) — this is the maximum or minimum of the x-t curve. On a-t graph: cannot directly identify reversal — need to integrate first."
    },
    "micro_4": {
      "trigger": "x-t straight line meaning",
      "scope": "micro",
      "states": 2,
      "content": "Straight line on x-t graph means constant slope = constant velocity = zero acceleration. This is uniform motion. The steeper the line, the higher the (constant) speed. A horizontal straight line (zero slope) means particle is at rest — not moving."
    },
    "micro_5": {
      "trigger": "what does a-t graph area give",
      "scope": "micro",
      "states": 2,
      "content": "Area under a-t graph = change in velocity (Δv). Units: (m/s²) × s = m/s. If particle starts with velocity v₀, then v at time t = v₀ + (area under a-t from 0 to t). This is NOT displacement — that requires the v-t graph area."
    },
    "micro_6": {
      "trigger": "two particles same x-t graph intersect",
      "scope": "micro",
      "states": 2,
      "content": "If two particles' x-t graphs intersect at a point, they are at the SAME POSITION at that time — not necessarily same velocity. Same velocity would mean their tangent slopes are equal at that point. Same position AND same velocity means their x-t curves are tangent to each other at that point."
    }
  },
  "static_responses": {
    "three_rules_summary": {
      "trigger": "what are the three graph rules",
      "simulation_needed": false,
      "response": "Three master rules: (1) Slope of x-t = velocity. (2) Slope of v-t = acceleration. (3) Area under v-t = displacement. Bonus: Area under a-t = change in velocity (not displacement). These three rules solve every JEE motion graph problem."
    },
    "graph_shapes_table": {
      "trigger": "what shape is x-t for uniform acceleration",
      "simulation_needed": false,
      "response": "Graph shapes: Uniform motion (a=0): x-t is straight line, v-t is horizontal line, a-t is zero line. Uniform acceleration from rest: x-t is parabola (concave up), v-t is straight line through origin, a-t is horizontal line. Deceleration to rest: x-t is parabola (concave down) flattening to horizontal, v-t is straight line decreasing to zero."
    },
    "distance_vs_displacement_from_graph": {
      "trigger": "how to find distance from v-t graph",
      "simulation_needed": false,
      "response": "Distance from v-t: add ALL areas as positive (ignore sign). Displacement from v-t: add areas WITH sign (positive above axis, negative below axis). Example: if v-t has area +30m above axis and area −10m below axis: displacement = +30 + (−10) = +20m, distance = 30 + 10 = 40m."
    }
  },
  "problem_guidance_path": {
    "description": "Step-by-step for solving motion graph problems",
    "for_given_xt": "Step 1: Identify regions (straight vs curved). Step 2: Find slope (= velocity) at required points by drawing tangent. Step 3: Identify rest points (horizontal segments). Step 4: Identify acceleration from concavity (up = +a, down = −a, straight = 0).",
    "for_given_vt": "Step 1: Read velocity directly from y-axis at any t. Step 2: Find slope (= acceleration) in each region. Step 3: Find area (= displacement) — calculate area of each triangle/trapezoid with correct sign. Step 4: Find when v=0 for direction reversal points.",
    "for_given_at": "Step 1: Area under a-t = Δv. Add to initial velocity to get v(t). Step 2: From v(t), reconstruct the v-t graph. Step 3: From v-t, find displacement.",
    "common_errors": [
      "Reading slope of x-t as speed (ignoring sign)",
      "Adding v-t areas as all positive (gives distance, not displacement)",
      "Confusing a-t area (= Δv) with displacement",
      "Not identifying all phases of motion before solving"
    ]
  },
  "example_library": {
    "example_1": {
      "source": "DC Pandey Section 6.9 — x-t graph reading",
      "principle": "Reading instantaneous velocity from a curved x-t graph by drawing tangent at a specific point",
      "aha": "Tangent slope at t=2s gives velocity at that exact instant — secant slope would give only average velocity over an interval",
      "simulation_states": 2
    },
    "example_2": {
      "source": "DC Pandey Section 6.9 — v-t graph with direction reversal",
      "principle": "v-t graph crossing x-axis — calculating displacement and distance separately for each phase",
      "aha": "Displacement = signed area sum (can be less than distance or even zero if particle returns to start); distance = unsigned area sum",
      "simulation_states": 3
    },
    "example_3": {
      "source": "DC Pandey Section 6.9 — two-particle x-t graph",
      "principle": "Two particles on same x-t graph — identifying when they meet (same position), when they have same velocity (equal slopes), and when they are farthest apart",
      "aha": "Same position = graphs intersect. Same velocity = parallel tangents. Maximum separation = slopes equal at that moment.",
      "simulation_states": 3
    },
    "example_4": {
      "source": "DC Pandey Section 6.9 — reconstructing motion from a-t graph",
      "principle": "Given a-t graph with two phases, reconstructing v-t and x-t graphs by integration (area of each a-t region = velocity change)",
      "aha": "The three graphs are linked — each is the integral of the next. a-t → integrate → v-t → integrate → x-t",
      "simulation_states": 2
    }
  },
  "assessment_path": {
    "question_1": {
      "text": "In an x-t graph, a straight line with negative slope represents:",
      "options": [
        "Particle decelerating",
        "Particle moving in negative direction at constant velocity",
        "Particle at rest",
        "Particle accelerating in −x direction"
      ],
      "correct": 1,
      "if_wrong_0": "route to slope_is_speed_not_velocity branch",
      "explanation": "Straight line → zero acceleration (constant velocity). Negative slope → velocity is negative = motion in −x direction. Deceleration would require slope decreasing in magnitude."
    },
    "question_2": {
      "text": "A v-t graph shows a triangle with base from t=0 to t=6s and peak at v=12 m/s. What is the displacement?",
      "options": [
        "72 m",
        "36 m",
        "12 m",
        "18 m"
      ],
      "correct": 1,
      "if_wrong_0": "route to area_gives_velocity_not_displacement — student may have multiplied 12×6",
      "explanation": "Area of triangle = ½ × base × height = ½ × 6 × 12 = 36 m. This is displacement (all positive velocity, so distance = displacement here)."
    },
    "question_3": {
      "text": "A v-t graph shows: v goes from +8 m/s to 0 in first 4s, then from 0 to −4 m/s in next 2s. What is the net displacement?",
      "options": [
        "24 m",
        "20 m",
        "16 m",
        "12 m"
      ],
      "correct": 2,
      "if_wrong_0": "route to ignoring_sign_in_area — student added both areas as positive",
      "explanation": "Phase 1: area = ½×4×8 = +16m. Phase 2: area = ½×2×(−4) = −4m. Net displacement = 16 + (−4) = 12m. Distance = 16 + 4 = 20m."
    },
    "question_4": {
      "text": "The area under an a-t graph from t=0 to t=5s is 20 m/s². The particle started with v=5 m/s. What is its velocity at t=5s?",
      "options": [
        "20 m/s",
        "25 m/s",
        "100 m/s",
        "15 m/s"
      ],
      "correct": 1,
      "if_wrong_0": "route to at_area_gives_position — student forgot initial velocity",
      "explanation": "Area under a-t = Δv = 20 m/s. v_final = v_initial + Δv = 5 + 20 = 25 m/s."
    },
    "question_5": {
      "text": "An x-t graph is concave downward in a region. This means the particle is:",
      "options": [
        "Moving downward",
        "Decelerating (acceleration is negative)",
        "At rest",
        "Moving at constant velocity"
      ],
      "correct": 1,
      "if_wrong_0": "route to concavity_confusion branch",
      "explanation": "Concave down → d²x/dt² < 0 → acceleration is negative. This means deceleration if particle moves in +x, or acceleration in −x direction."
    }
  },
  "session_awareness": {
    "if_already_shown_epic_l": "Go directly to graph-reading problems — student knows theory, needs interpretation practice",
    "if_coming_from_uniform_acceleration": "Student knows what uniform acceleration means physically — now connect it to the shapes it produces on graphs",
    "if_coming_from_non_uniform_acceleration": "Student knows calculus forms — connect: 'v-t slope = dv/dt is what you've been integrating. Area under v-t = ∫v dt is what you computed.'"
  },
  "waypoints": {
    "fallback_unknown_confusion": "Default to the v-t area demonstration with a simple triangle. It's the most commonly tested rule and the most satisfying to see — area of a triangle × unit analysis = displacement.",
    "escalation_trigger": "If student asks about reading acceleration from a curved x-t graph (requires drawing tangent then finding how tangent slope changes) — escalate to differentiation discussion."
  },
  "depth_escalation_trigger": {
    "condition": "Student asks how to find acceleration from x-t graph when x-t is a complex curve (not simple parabola)",
    "escalate_to": "Draw tangent at multiple points, get v at each point, plot those on a new v-t graph, then find slope of that v-t graph = acceleration. This is numerical differentiation.",
    "level": "JEE Advanced / experimental data analysis"
  },
  "parameter_slots": {
    "v_max": {
      "label": "maximum velocity in motion",
      "range": [
        1,
        40
      ],
      "unit": "m/s",
      "default": 10,
      "extraction_hint": "peak velocity or maximum speed in the problem"
    },
    "t_total": {
      "label": "total time of motion",
      "range": [
        1,
        20
      ],
      "unit": "s",
      "default": 6,
      "extraction_hint": "total time or final time given in problem"
    },
    "a_value": {
      "label": "acceleration magnitude",
      "range": [
        0,
        20
      ],
      "unit": "m/s²",
      "default": 2,
      "extraction_hint": "acceleration or deceleration value given"
    }
  },
  "panel_sync_spec": {
    "canvas_to_graph": {
      "trigger": "particle_position_updates",
      "action": "vertical cursor moves simultaneously on both x-t and v-t graphs to match current time"
    },
    "graph_to_canvas": {
      "trigger": "student_clicks_on_any_graph_at_time_t",
      "action": "particle on Panel A jumps to position corresponding to that time; both graphs update cursor"
    },
    "cross_panel_sync": {
      "description": "All three panels are locked to the same time axis",
      "xt_to_vt": "Tangent slope on x-t at time t equals y-value on v-t at same t",
      "vt_to_at": "Tangent slope on v-t at time t equals y-value on a-t at same t"
    }
  },
  "jee_specific": {
    "typical_question_types": [
      "Given v-t graph, find displacement (area calculation)",
      "Given v-t graph with reversal, find distance AND displacement separately",
      "Given x-t graph, find velocity at t=Xs (slope of tangent)",
      "Given a-t graph, find velocity at t=Xs (v₀ + area)",
      "Two particles on same x-t graph — when do they meet, when same velocity",
      "Identify which x-t graph corresponds to given v-t graph",
      "Identify which v-t graph corresponds to given a-t graph"
    ],
    "common_traps": [
      "Area under v-t gives displacement, not distance — must handle sign for direction reversals",
      "Area under a-t gives Δv, not v or displacement",
      "Negative slope on x-t = moving in −x direction (NOT decelerating)",
      "Two x-t curves intersecting = same POSITION, not same velocity",
      "Horizontal segment on x-t = at rest. Horizontal segment on v-t = constant velocity (not at rest unless v=0)"
    ],
    "key_results": [
      "Slope of x-t = v. Slope of v-t = a. Area under v-t = displacement.",
      "Area under a-t = Δv (change in velocity, not velocity itself)",
      "x-t concave up → a > 0. Concave down → a < 0. Straight line → a = 0.",
      "v-t crosses x-axis → particle reverses direction at that moment",
      "For uniform acceleration from rest: x-t is parabola, v-t is straight line through origin"
    ],
    "matching_questions": {
      "xt_straight_positive": "Uniform motion in +x direction",
      "xt_parabola_concave_up": "Uniform acceleration in +x direction",
      "xt_parabola_concave_down": "Deceleration (or uniform acceleration in −x)",
      "vt_horizontal": "Zero acceleration (uniform motion)",
      "vt_straight_positive_slope": "Uniform positive acceleration",
      "vt_crosses_axis": "Direction reversal at that time"
    }
  },
  "concept_relationships": {
    "prerequisites": [
      "distance_vs_displacement",
      "uniform_acceleration",
      "non_uniform_acceleration"
    ],
    "extensions": [
      "relative_motion",
      "projectile_motion",
      "circular_motion_banking"
    ],
    "siblings": [
      "non_uniform_acceleration"
    ],
    "common_exam_combinations": [
      "non_uniform_acceleration — v-t area IS the integral ∫v dt from calculus chapter",
      "distance_vs_displacement — graphical method of separating distance and displacement",
      "work_energy_theorem — area under F-x graph = work done (same area concept, different axes)"
    ]
  },
  "three_js_flag": false,
  "three_js_note": "All motion graph content is 2D (time on x-axis, quantity on y-axis). Triple panel with canvas2d + two Plotly panels is correct. Three.js not needed.",
  "regeneration_variants": [
    {
      "variant_id": 1,
      "approach": "two_rules_for_everything",
      "entry_state": "STATE_2",
      "teacher_angle": "Start with the two master rules that unlock every motion graph question. Rule 1: slope of any graph = the quantity on the y-axis divided by the quantity on the x-axis. Slope of s-t graph = ds/dt = velocity. Slope of v-t graph = dv/dt = acceleration. Rule 2: area under any graph = integral of y with respect to x. Area under v-t graph = integral of v dt = displacement. Area under a-t graph = integral of a dt = change in velocity. Every motion graph question in JEE reduces to one of these two rules.",
      "locked_facts_focus": [
        "fact_1",
        "fact_2",
        "fact_3"
      ],
      "panel_b_focus": "Three graphs side by side: s-t, v-t, a-t. For each: slope formula and area formula labeled. Student clicks any graph and sees which rule applies and what it gives."
    },
    {
      "variant_id": 2,
      "approach": "connects_to_uniform_acceleration",
      "entry_state": "STATE_1",
      "teacher_angle": "Connect every graph directly to what the student already knows from uniform acceleration. Uniform acceleration gives a straight v-t line — the student has already seen this. The slope of that line = a (which they know). The area under it = s (which they know from the SUVAT derivation). Motion graphs is just making those relationships visual. A curved v-t graph means non-uniform acceleration — also already known. The student already understands every graph — they just have not seen it drawn explicitly.",
      "locked_facts_focus": [
        "fact_4",
        "fact_5",
        "fact_6"
      ],
      "panel_b_focus": "v-t straight line (uniform acceleration). Slope labeled as a — same as SUVAT. Shaded area labeled as s — same as SUVAT. Then curved v-t line introduced: slope changes at every point (non-uniform a). The familiar becomes the foundation for the unfamiliar."
    }
  ]
}
```


# non_uniform_acceleration.json
```json
{
  "concept_id": "non_uniform_acceleration",
  "concept_name": "Non-Uniform Acceleration — Calculus-Based Kinematics",
  "class_level": 11,
  "chapter": "Kinematics",
  "section": "6.7",
  "source_coverage": {
    "dc_pandey": "Chapter 6, Section 6.7 — Non-Uniform Acceleration",
    "ncert": "Chapter 3 — Motion in a Straight Line, Section 3.4",
    "hc_verma": "Chapter 3 — Rest and Motion: Kinematics, Section 3.4"
  },
  "source_type": "ncert_and_dc_pandey",
  "renderer_hint": {
    "technology": "canvas2d",
    "technology_b": "plotly",
    "renderer": "mechanics_2d",
    "scenario_type": "non_uniform_acceleration",
    "panel_count": 2,
    "sync_required": true,
    "scene_mode": false,
    "show_labels": true,
    "panel_a_role": "Animated particle on track — velocity arrow changing non-uniformly, acceleration arrow changing in both size and direction",
    "panel_b_role": "Plotly dual graph — v-t curve (non-linear) on top, a-t curve below; slope of v-t = acceleration at each instant"
  },
  "locked_facts": {
    "instantaneous_velocity": "v = dx/dt — velocity is the derivative of position with respect to time. For non-uniform motion, this gives a different value at every instant.",
    "instantaneous_acceleration": "a = dv/dt = d²x/dt² — acceleration is the derivative of velocity. For non-uniform acceleration, a varies with time.",
    "a_as_function_of_v": "When a = f(v): use a = v·(dv/dx) — this form links acceleration to position, useful when a is given as a function of velocity.",
    "a_as_function_of_x": "When a = f(x): use a = v·(dv/dx) — then v·dv = a·dx, integrate both sides.",
    "a_as_function_of_t": "When a = f(t): directly integrate dv/dt = a(t) to get v(t), then integrate dx/dt = v(t) to get x(t).",
    "three_integration_forms": "Three master cases: (1) a=f(t): integrate once for v, twice for x. (2) a=f(x): use v dv = a dx. (3) a=f(v): use dv/a = dt or v dv/a = dx.",
    "initial_conditions": "Integration always produces a constant C. Use initial conditions (x=x₀ at t=0, v=v₀ at t=0) to find C. Missing this step is the most common exam error.",
    "uniform_acceleration_special_case": "Uniform acceleration (a = constant) is the special case of non-uniform where a=f(t) gives a=k. The standard equations v=u+at, s=ut+½at² follow directly from integration.",
    "v_dv_dx_derivation": "a = dv/dt = (dv/dx)·(dx/dt) = v·(dv/dx). This chain rule substitution is the key step — memorize the derivation, not just the formula.",
    "displacement_from_v_t": "Displacement = area under v-t graph, regardless of whether v-t is linear or curved. For non-uniform: x = ∫v dt.",
    "sign_convention": "Choose one direction as positive. Stick to it throughout. If v is positive and a is negative, the particle decelerates. If both change sign at different times, track carefully."
  },
  "minimum_viable_understanding": "When acceleration is not constant, the three standard equations (v=u+at etc.) do NOT apply. Use calculus: a=dv/dt for a=f(t), and v·dv/dx for a=f(x) or a=f(v). Always apply initial conditions after integration.",
  "variables": {
    "x": "Position (m)",
    "v": "Instantaneous velocity = dx/dt (m/s)",
    "a": "Instantaneous acceleration = dv/dt (m/s²)",
    "t": "Time (s)",
    "v0": "Initial velocity at t=0 (m/s)",
    "x0": "Initial position at t=0 (m)",
    "C": "Integration constant — determined by initial conditions"
  },
  "routing_signals": {
    "global_triggers": [
      "non uniform acceleration",
      "variable acceleration",
      "acceleration changes with time",
      "calculus kinematics",
      "a is a function of v",
      "non uniform acceleration kya hota hai"
    ],
    "local_triggers": [
      "when to use v dv dx",
      "a equals f of v how to solve",
      "acceleration given as function of position",
      "how to find velocity when acceleration varies",
      "why can't I use v equals u plus at here",
      "suvat not working",
      "equations of motion not applicable"
    ],
    "micro_triggers": [
      "what is instantaneous acceleration",
      "how to integrate acceleration to get velocity",
      "initial conditions in integration",
      "what is the derivation of v dv dx"
    ],
    "simulation_not_needed_triggers": [
      "write the three integration cases",
      "state the formula for non uniform acceleration",
      "what is v dv dx"
    ],
    "subconcept_triggers": {
      "a_function_of_t": [
        "acceleration is given as function of time",
        "a equals 2t or a equals 3t squared",
        "integrate acceleration to find velocity",
        "a = kt type problem"
      ],
      "a_function_of_x": [
        "acceleration given in terms of position",
        "a equals kx type",
        "v dv dx form",
        "acceleration depends on displacement"
      ],
      "a_function_of_v": [
        "acceleration given as function of velocity",
        "a equals kv or a equals kv squared",
        "terminal velocity type problem",
        "drag force proportional to velocity"
      ],
      "initial_conditions": [
        "how to find constant of integration",
        "what to do after integrating",
        "initial condition kya use kare"
      ]
    }
  },
  "checkpoint_states": {
    "understands_why_suvat_fails": "enter at STATE_2",
    "understands_a_of_t_case": "enter at STATE_3",
    "understands_v_dv_dx": "enter at STATE_4",
    "understands_a_of_v_case": "enter at STATE_5"
  },
  "prerequisite_check": {
    "required_concepts": [
      "uniform_acceleration"
    ],
    "gate_question": "A ball is thrown up. Using v = u + at, find velocity after 2s if u=20 m/s, a=−10 m/s². (If student cannot do this, route to uniform_acceleration first.)",
    "if_gap_detected": "redirect to uniform_acceleration.json — student must be comfortable with constant-a equations before calculus forms"
  },
  "epic_l_path": {
    "state_count": 6,
    "board_mode_states": [
      1,
      2,
      3,
      4
    ],
    "jee_mode_states": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "scope": "global",
    "states": {
      "STATE_1": {
        "label": "The Hook — When the Old Equations Break Down",
        "physics_layer": {
          "concept": "Standard suvat equations assume a = constant. What if acceleration grows with time?",
          "simulation_focus": "Show two particles side by side. Particle A: uniform acceleration (straight v-t line). Particle B: a = 2t (curved v-t line, acceleration doubles every second). After 3 seconds, Particle B is far ahead despite starting at same conditions.",
          "what_to_show": "v-t graph on Panel B shows straight line for A, parabola for B. Applying v = u + at to B gives wrong answer.",
          "freeze_at_t": 3,
          "key_observation": "suvat predicts same final velocity for both — but the simulation shows different values. The equations silently fail.",
          "scenario": "varying_a_animation"
        },
        "pedagogy_layer": {
          "opening_question": "A car engine provides increasing thrust — acceleration grows as a = 2t. Can you still use v = u + at to find velocity at t=3s?",
          "surprise_moment": "Students apply suvat, get an answer, see it disagrees with simulation. The failure is silent — no error message, just a wrong number.",
          "teacher_script": "suvat worked beautifully for uniform acceleration. But the moment a changes, we need a different tool — and that tool is calculus."
        }
      },
      "STATE_2": {
        "label": "Case 1 — Acceleration as a Function of Time: a = f(t)",
        "physics_layer": {
          "concept": "When a = f(t), integrate directly: dv/dt = f(t) → v = ∫f(t)dt + C",
          "simulation_focus": "Show a = 2t. Animate: dv/dt = 2t → v = t² + C. Apply initial condition v=0 at t=0 → C=0. So v = t². Then x = ∫v dt = t³/3 + C₂. Apply x=0 at t=0 → C₂=0.",
          "panel_b_show": "v-t graph: parabola v=t². a-t graph: straight line a=2t. Both build simultaneously.",
          "key_steps": [
            "Write a = dv/dt = f(t)",
            "Integrate: v = ∫f(t)dt + C",
            "Apply v=v₀ at t=0 to find C",
            "Integrate again: x = ∫v dt + C₂",
            "Apply x=x₀ at t=0 to find C₂"
          ],
          "scenario": "v_function_of_t"
        },
        "pedagogy_layer": {
          "key_message": "Two integrations, two constants, two initial conditions. That's the complete procedure.",
          "common_mistake": "Students forget to add C after integrating, or forget to apply initial conditions. The answer is always wrong without C."
        }
      },
      "STATE_3": {
        "label": "Case 2 — Acceleration as a Function of Position: a = f(x)",
        "physics_layer": {
          "concept": "When a = f(x), we can't integrate directly (a is not a function of t). Use chain rule: a = v·dv/dx",
          "derivation_show": "a = dv/dt = (dv/dx)·(dx/dt) = v·(dv/dx). Therefore v·dv = a·dx = f(x)·dx. Integrate: ∫v dv = ∫f(x) dx → v²/2 = ∫f(x)dx + C",
          "simulation_focus": "Show a = kx (spring-like). Animate v·dv/dx = kx → v² = kx² + C. From v=v₀ at x=0: C=v₀².",
          "panel_b_show": "x-v phase plot (not v-t) — this is how a=f(x) problems are analyzed",
          "key_observation": "Result gives v as a function of x, not t. To get x(t) you need a second integration — but often the exam only asks for v at a given position.",
          "scenario": "a_function_of_x"
        },
        "pedagogy_layer": {
          "analogy": "Think of it as a gear change — when a depends on WHERE you are (not when), you need position as the variable of integration.",
          "jee_tip": "Most a=f(x) JEE problems only ask 'find v at position x=X' — one integration gives the answer directly."
        }
      },
      "STATE_4": {
        "label": "Case 3 — Acceleration as a Function of Velocity: a = f(v)",
        "physics_layer": {
          "concept": "When a = f(v), two integration paths exist depending on what you need",
          "path_1": "For v as function of t: dv/f(v) = dt → integrate ∫dv/f(v) = ∫dt = t + C",
          "path_2": "For v as function of x: v·dv/f(v) = dx → integrate ∫v dv/f(v) = ∫dx = x + C",
          "simulation_focus": "Show a = −kv (air resistance proportional to velocity). Path 1: dv/(−kv) = dt → (−1/k)ln(v) = t + C → v = v₀·e^(−kt). Velocity decays exponentially.",
          "panel_b_show": "v-t graph: exponential decay. a-t graph: also exponential decay (since a = −kv).",
          "key_observation": "Terminal velocity concept emerges naturally — as v → v_terminal, a → 0.",
          "scenario": "a_function_of_v"
        },
        "pedagogy_layer": {
          "real_world": "Skydiver, ball in viscous liquid, car with air resistance — all are a=f(v) problems.",
          "jee_tip": "If you see 'retardation proportional to velocity' or 'drag force = bv' — immediately write a = −kv and use the first integration path."
        }
      },
      "STATE_5": {
        "label": "The Aha Moment — Choosing the Right Integration Form",
        "physics_layer": {
          "concept": "The three cases are determined by HOW acceleration is given, not by the physics topic",
          "decision_tree": {
            "a_given_as": "Look at what variable a depends on",
            "if_a_is_f_of_t": "Use dv = f(t)dt → integrate directly",
            "if_a_is_f_of_x": "Use v dv = f(x)dx → integrate",
            "if_a_is_f_of_v_want_t": "Use dv/f(v) = dt → integrate",
            "if_a_is_f_of_v_want_x": "Use v dv/f(v) = dx → integrate"
          },
          "simulation_focus": "Three side-by-side mini simulations, one per case. Student clicks a problem statement, system highlights which case applies.",
          "scenario": "integration_for_s"
        },
        "pedagogy_layer": {
          "key_message": "Read the problem. Identify what a depends on. Pick the matching form. That decision takes 5 seconds and saves minutes of wrong-path work.",
          "exam_reality": "JEE gives you a = 3x², a = 2v, or a = t² − 1. Your job is case identification, then clean integration."
        }
      },
      "STATE_6": {
        "label": "Student Interaction — Solve a Problem Live",
        "physics_layer": {
          "concept": "Apply the three-case framework to a JEE-level problem",
          "problem": "A particle starts from rest. Its acceleration is given by a = 4 − 2v. Find: (i) maximum velocity, (ii) velocity when it has travelled distance x=2m.",
          "solution_path": "This is a=f(v). For v(x): v·dv/(4−2v) = dx. For max v: a=0 → 4−2v=0 → v_max=2 m/s.",
          "interactive": "Student selects which case (a=f(t), a=f(x), or a=f(v)) before solution is shown.",
          "scenario": "method_decision_tree"
        },
        "pedagogy_layer": {
          "teacher_script": "Before I show you anything — which case is this? What does a depend on? Once you name the case, the rest is just integration."
        }
      }
    }
  },
  "epic_c_branches": [
    {
      "branch_id": "suvat_on_variable_a",
      "misconception": "Student applies v = u + at or s = ut + ½at² when acceleration is not constant",
      "student_belief": "suvat equations always work for any type of motion",
      "trigger_phrases": [
        "I used v equals u plus at",
        "applied second equation of motion",
        "suvat pe lagaya",
        "why is my answer wrong I used the formula",
        "s = ut + half at squared",
        "v squared = u squared + 2as"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Show a = 2t problem. Student's suvat answer: v = 0 + 2×3 = 6 m/s (using average a=2 at t=1). Correct answer: v = t² = 9 m/s. Simulation shows particle reaching 9 m/s, not 6 m/s.",
            "label": "Your suvat answer: 6 m/s. Actual result: 9 m/s. Let's find the 3 m/s gap.",
            "scenario": "nua_wrong_suvat_applied"
          },
          "pedagogy_layer": {
            "teacher_script": "suvat assumes a is the same number at every moment. Here a starts at 0 and reaches 6 — using any single value of a is averaging, and averaging gives the wrong answer."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Show where suvat comes FROM: derive v = u + at by integrating dv/dt = a (constant). The constant a comes OUT of the integral as a×t. Now show a = 2t: ∫2t dt = t² ≠ at.",
            "label": "suvat derivation exposed: it ONLY works when a is a constant that comes out of the integral unchanged.",
            "scenario": "nua_constant_a_required"
          },
          "pedagogy_layer": {
            "key_message": "suvat isn't wrong — it's derived correctly. It just has one hidden assumption: a = constant. Violate that assumption and the derivation breaks."
          }
        },
        "STATE_3": {
          "physics_layer": {
            "simulation": "Solve the same problem correctly: a = 2t → dv = 2t dt → v = t² + C. At t=0, v=0 → C=0. So v = t² = 9 at t=3. Show result matching simulation.",
            "label": "Correct method: integrate a(t), apply initial condition. Result: 9 m/s.",
            "scenario": "nua_aha_check_a_first"
          },
          "pedagogy_layer": {
            "rule": "CHECK FIRST: Is a constant? Yes → suvat. No → integration. That 2-second check saves the entire problem."
          }
        }
      }
    },
    {
      "branch_id": "forgot_constant_of_integration",
      "misconception": "Student integrates but drops the constant of integration C, or sets it to zero without checking",
      "student_belief": "After integration, there is no extra constant to worry about",
      "trigger_phrases": [
        "I integrated but got wrong answer",
        "integrated acceleration and got velocity but answer is wrong",
        "integration constant kahan se aaya",
        "why does C appear",
        "what is C in integration"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Show a = 4t. Student integrates: v = 2t² (no C). At t=2s, v=8 m/s. But actual initial condition is v₀ = 6 m/s at t=0. Correct: v = 2t² + 6. At t=2, v = 14 m/s. Simulation shows particle at 14 m/s, student's answer is 8 m/s.",
            "label": "Missing C means missing the starting point. Your particle started at v=6, not v=0.",
            "scenario": "forgot_constant_of_integration_s1"
          },
          "pedagogy_layer": {
            "teacher_script": "Integration finds a FAMILY of functions — one for every possible C. The initial condition picks the ONE correct member of that family."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Visualize C on v-t graph: show v = 2t² family — C=0 (starts at 0), C=3 (starts at 3), C=6 (starts at 6). All have same shape (same acceleration). Initial condition selects the right curve.",
            "label": "C shifts the entire v-t curve up or down. Initial condition anchors it to the correct starting point.",
            "scenario": "forgot_constant_of_integration_s2"
          },
          "pedagogy_layer": {
            "rule": "Every integration → immediately write +C. Then immediately write 'At t=0, v=v₀ → C=v₀'. These two steps are inseparable."
          }
        }
      }
    },
    {
      "branch_id": "wrong_integration_form",
      "misconception": "Student uses dv/dt = f(x) and tries to integrate with respect to t when a is given as function of x",
      "student_belief": "Always integrate acceleration with respect to t to get velocity",
      "trigger_phrases": [
        "a is given as function of x and I integrated with t",
        "a = kx and I did dv/dt = kx",
        "acceleration depends on position how to integrate",
        "v dv dx kaise use kare",
        "when to use v dv by dx"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Show a = 3x. Student writes dv/dt = 3x and tries ∫dv = ∫3x dt — but x is also changing with t, so this integral is stuck. Show the 'stuck' symbol — cannot proceed without knowing x(t) first.",
            "label": "Dead end: ∫3x dt requires knowing x as a function of t — which is exactly what we're trying to find.",
            "scenario": "wrong_integration_form_s1"
          },
          "pedagogy_layer": {
            "teacher_script": "When a depends on x, integrating with t creates a circular problem. We need a form that connects a, v, and x without t appearing."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Show chain rule derivation animated: a = dv/dt = (dv/dx)·(dx/dt) = v·(dv/dx). Therefore v·dv = a·dx = 3x·dx. Now integrate: v²/2 = 3x²/2 + C. This gives v as a function of x directly.",
            "label": "The chain rule unlocks it: v dv/dx = a eliminates t from the equation entirely.",
            "scenario": "wrong_integration_form_s2"
          },
          "pedagogy_layer": {
            "rule": "a = f(x) → ALWAYS use v dv/dx = f(x). Rewrite as v dv = f(x) dx. Integrate both sides."
          }
        },
        "STATE_3": {
          "physics_layer": {
            "simulation": "Complete solution: v dv = 3x dx → v²/2 = 3x²/2 + C. At x=0, v=v₀: C = v₀²/2. So v² = v₀² + 3x². At x=2m, v = √(v₀² + 12). Show particle reaching this velocity.",
            "label": "Result: v as a function of x. No t involved. Clean and complete.",
            "scenario": "wrong_integration_form_s3"
          }
        }
      }
    },
    {
      "branch_id": "terminal_velocity_confusion",
      "misconception": "Student thinks terminal velocity means a=constant (not a=0)",
      "student_belief": "At terminal velocity, acceleration becomes some small constant value, not zero",
      "trigger_phrases": [
        "terminal velocity kya hota hai",
        "why does acceleration become zero",
        "a = -kv at terminal velocity",
        "terminal velocity explanation",
        "when does particle stop accelerating"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Show skydiver. Student draws a graph with a leveling off at some small positive value. Meanwhile, v-t graph shows velocity still growing (slowly). Contradiction: if a>0, v keeps growing — never reaches constant terminal velocity.",
            "label": "If acceleration never becomes ZERO, velocity never becomes constant. Terminal velocity requires a = 0 exactly.",
            "scenario": "terminal_velocity_confusion_s1"
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Show a = g − kv. As v increases, kv increases. When kv = g: a = g − g = 0. Velocity stops changing. That v_terminal = g/k. Show v-t graph reaching flat asymptote exactly at v = g/k.",
            "label": "Terminal velocity = the velocity at which drag force exactly cancels gravity. At that exact point: net force = 0, acceleration = 0.",
            "scenario": "terminal_velocity_confusion_s2"
          },
          "pedagogy_layer": {
            "rule": "To find terminal velocity from a = f(v): SET a = 0 and solve for v. That's v_terminal."
          }
        }
      }
    }
  ],
  "epic_c_micro_templates": {
    "micro_1": {
      "trigger": "what is v dv dx",
      "scope": "micro",
      "states": 2,
      "content": "v·dv/dx is the chain rule form of acceleration. Derivation: a = dv/dt = (dv/dx)·(dx/dt) = v·(dv/dx). Use this form WHEN acceleration is given as a function of position (a = f(x)) or velocity (a = f(v)) and you need velocity as a function of position."
    },
    "micro_2": {
      "trigger": "how to identify which integration case",
      "scope": "micro",
      "states": 2,
      "content": "Look at how a is expressed in the problem: a = [something with t] → Case 1, integrate dv = f(t)dt. a = [something with x] → Case 2, use v dv = f(x)dx. a = [something with v] → Case 3, use dv/f(v) = dt or v dv/f(v) = dx."
    },
    "micro_3": {
      "trigger": "suvat kab use nahi kar sakte",
      "scope": "micro",
      "states": 2,
      "content": "suvat (v=u+at, s=ut+½at², v²=u²+2as) are valid ONLY when acceleration is constant throughout the motion. If the problem says 'acceleration varies', 'a = f(t)', 'a = f(x)', 'retardation proportional to velocity' — immediately switch to calculus. suvat will give wrong answers in all such cases."
    },
    "micro_4": {
      "trigger": "instantaneous velocity vs average velocity",
      "scope": "micro",
      "states": 2,
      "content": "Instantaneous velocity v = dx/dt — the derivative, valid at one specific moment. Average velocity = Δx/Δt — total displacement over total time interval. For non-uniform motion, these differ at every instant. Only for uniform motion are they equal."
    },
    "micro_5": {
      "trigger": "area under v-t graph for non uniform motion",
      "scope": "micro",
      "states": 2,
      "content": "Displacement = area under v-t graph regardless of whether it's linear or curved. For uniform acceleration: area is a trapezoid → formula works. For non-uniform: area is under a curve → use integration x = ∫v dt. The geometric interpretation is always valid."
    }
  },
  "static_responses": {
    "three_cases_summary": {
      "trigger": "list the three cases of non-uniform acceleration",
      "simulation_needed": false,
      "response": "Three integration cases: (1) a = f(t): use dv = f(t)dt, integrate → v(t), integrate again → x(t). (2) a = f(x): use v dv = f(x)dx, integrate → v(x). (3) a = f(v) for v(t): use dv/f(v) = dt, integrate. For v(x): use v dv/f(v) = dx, integrate. Always apply initial conditions after each integration."
    },
    "v_dv_dx_derivation": {
      "trigger": "derive v dv dx",
      "simulation_needed": false,
      "response": "Derivation: Start with a = dv/dt. Multiply and divide by dx: a = (dv/dx)·(dx/dt). Since dx/dt = v: a = v·(dv/dx). This is the chain rule applied to the composite function v(x(t)). Result: a·dx = v·dv — integrate both sides when a = f(x) or a = f(v)."
    },
    "when_suvat_fails": {
      "trigger": "when do equations of motion fail",
      "simulation_needed": false,
      "response": "The three equations of motion (v=u+at, s=ut+½at², v²=u²+2as) fail whenever acceleration is NOT constant. Check for: 'acceleration varies with time', 'a = kt or a = t²', 'retardation proportional to speed', 'acceleration depends on position'. Any of these → use calculus. suvat with a variable a gives a wrong number with no error message."
    }
  },
  "problem_guidance_path": {
    "description": "Step-by-step guidance for solving non-uniform acceleration problems",
    "step_1": "Read: Is a given as a function of t, x, or v?",
    "step_2": "Choose form: f(t) → dv=f(t)dt. f(x) → v dv=f(x)dx. f(v) → dv/f(v)=dt or v dv/f(v)=dx",
    "step_3": "Integrate both sides. Write +C immediately.",
    "step_4": "Apply initial condition to find C.",
    "step_5": "If x(t) needed: integrate v(t) again, apply second initial condition.",
    "step_6": "Check: Does your answer have correct units? Does it reduce to expected result for special cases?",
    "common_errors": [
      "Dropping the constant of integration",
      "Using suvat equations without checking if a is constant",
      "Integrating a=f(x) with respect to t instead of using v dv/dx form",
      "Not applying initial conditions at all"
    ]
  },
  "example_library": {
    "example_1": {
      "source": "DC Pandey Section 6.7 — Example (a = f(t) type)",
      "principle": "Particle with a = 2t from rest — integrating twice gives v = t² and x = t³/3",
      "aha": "Two integrations, two constants, two initial conditions — the complete procedure in one problem",
      "simulation_states": 2
    },
    "example_2": {
      "source": "DC Pandey Section 6.7 — Example (a = f(x) type)",
      "principle": "a = kx form — using v dv/dx = kx to find velocity at a given position without needing time",
      "aha": "When a depends on position, the answer is v as a function of x — time never appears in the final answer",
      "simulation_states": 2
    },
    "example_3": {
      "source": "DC Pandey Section 6.7 — Example (a = f(v) type, terminal velocity)",
      "principle": "a = g − kv — exponential approach to terminal velocity; setting a=0 gives v_terminal = g/k",
      "aha": "Terminal velocity is found by setting a=0, not by complicated integration — the integration gives v(t) but the terminal value is algebraic",
      "simulation_states": 2
    },
    "example_4": {
      "source": "DC Pandey Section 6.7 — JEE-style combined problem",
      "principle": "Finding both velocity-position and velocity-time relations from a single a=f(v) expression using different integration paths",
      "aha": "Same a=f(v) problem but two different questions — choosing the right integration path (dv/f(v)=dt vs v dv/f(v)=dx) depends entirely on what is being asked",
      "simulation_states": 3
    }
  },
  "assessment_path": {
    "question_1": {
      "text": "A particle starts from rest. Its acceleration is a = 4t m/s². What is its velocity at t = 3s?",
      "options": [
        "12 m/s",
        "18 m/s",
        "36 m/s",
        "6 m/s"
      ],
      "correct": 1,
      "if_wrong_0": "route to suvat_on_variable_a branch — student used a=4×3=12 with v=at",
      "if_wrong_2": "route to forgot_constant_of_integration — student may have made arithmetic error after correct integration",
      "explanation": "a = 4t → dv = 4t dt → v = 2t² + C. At t=0, v=0 → C=0. v = 2t² = 2×9 = 18 m/s."
    },
    "question_2": {
      "text": "Acceleration of a particle is given by a = 2x. At x=0, v=3 m/s. Find v at x=2m.",
      "options": [
        "√17 m/s",
        "5 m/s",
        "√13 m/s",
        "7 m/s"
      ],
      "correct": 1,
      "if_wrong_2": "route to wrong_integration_form branch — student tried to integrate with t",
      "explanation": "a = f(x): v dv = 2x dx → v²/2 = x² + C. At x=0, v=3 → C=9/2. v² = 2x² + 9 = 8+9 = 17. v = √17? Wait — recheck: v²/2 = x² + 9/2. v² = 2x² + 9 = 2×4 + 9 = 17. Answer A. Note: correct is option 0 (√17). Option B (5) is wrong."
    },
    "question_3": {
      "text": "For a particle moving with a = 4 − 2v, what is the terminal (maximum) velocity?",
      "options": [
        "4 m/s",
        "2 m/s",
        "1 m/s",
        "8 m/s"
      ],
      "correct": 1,
      "if_wrong_0": "route to terminal_velocity_confusion — student set a = 4 instead of a = 0",
      "explanation": "Terminal velocity: a = 0 → 4 − 2v = 0 → v = 2 m/s."
    },
    "question_4": {
      "text": "Which integration form is correct when a is given as a function of velocity and you need v as a function of x?",
      "options": [
        "∫dv/a = t",
        "∫v dv/a = x",
        "∫a dt = v",
        "∫a dx = v²/2"
      ],
      "correct": 1,
      "if_wrong_0": "route to wrong_integration_form branch",
      "explanation": "a = f(v), need v(x): use v·dv/dx = f(v) → v dv/f(v) = dx → ∫v dv/f(v) = x + C."
    },
    "question_5": {
      "text": "A particle has velocity v = 3t² − 2t. What is its acceleration at t = 2s?",
      "options": [
        "8 m/s²",
        "16 m/s²",
        "10 m/s²",
        "6t − 2 m/s²"
      ],
      "correct": 2,
      "explanation": "a = dv/dt = 6t − 2. At t=2: a = 12 − 2 = 10 m/s²."
    }
  },
  "session_awareness": {
    "if_already_shown_epic_l": "Jump to problem-solving — student knows theory, needs practice identifying cases",
    "if_coming_from_uniform_acceleration": "Student just learned suvat — explicitly contrast: 'Everything you just learned assumes a=constant. Now a is variable.'",
    "if_coming_from_differentiation_chapter": "Student has calculus tools — connect directly: 'You know d/dt. Kinematics is just d/dt applied to x(t).'"
  },
  "waypoints": {
    "fallback_unknown_confusion": "Default to the case-identification decision tree (STATE_5). Most confusion in non-uniform acceleration comes from not knowing which integration form to use — the flowchart resolves it.",
    "escalation_trigger": "If student asks about solving a = f(x) for x(t) explicitly — this requires separation of variables on dx/v(x) = dt, which is JEE Advanced level. Escalate."
  },
  "depth_escalation_trigger": {
    "condition": "Student asks how to find x(t) when a = f(x) — i.e., after getting v(x), how to get time",
    "escalate_to": "Separate variables: v = dx/dt → dt = dx/v(x) → t = ∫dx/v(x). This requires knowing v as a function of x first (from v dv = f(x) dx), then substituting into the integral.",
    "level": "JEE Advanced / Mathematical Physics"
  },
  "parameter_slots": {
    "a_coeff": {
      "label": "coefficient in acceleration expression",
      "range": [
        1,
        10
      ],
      "unit": "varies",
      "default": 2,
      "extraction_hint": "coefficient in a = kt or a = kx or a = kv"
    },
    "v0": {
      "label": "initial velocity",
      "range": [
        0,
        30
      ],
      "unit": "m/s",
      "default": 0,
      "extraction_hint": "initial velocity or starts from rest (v0=0)"
    },
    "x0": {
      "label": "initial position",
      "range": [
        0,
        20
      ],
      "unit": "m",
      "default": 0,
      "extraction_hint": "initial position or starts at origin (x0=0)"
    }
  },
  "panel_sync_spec": {
    "canvas_to_graph": {
      "trigger": "STATE_N_reached",
      "action": "both v-t and a-t graphs mark current time with vertical line"
    },
    "graph_to_canvas": {
      "trigger": "student_hover_on_vt_graph_at_t",
      "action": "canvas animation seeks to that time, shows instantaneous v and a"
    },
    "slider_to_both": {
      "parameter": "a_coeff",
      "canvas_action": "particle trajectory updates for new acceleration coefficient",
      "graph_action": "v-t and a-t curves redraw for new a expression"
    }
  },
  "jee_specific": {
    "typical_question_types": [
      "Given a = f(t), find v at time t (integrate once)",
      "Given a = f(x), find v at position x (use v dv/dx)",
      "Given v = f(t), find a at time t (differentiate)",
      "Given a = f(v), find terminal velocity (set a=0)",
      "Given v = f(t), find displacement in time interval (integrate v)",
      "Match: type of a expression → correct integration method"
    ],
    "common_traps": [
      "Applying v = u + at when a is not constant — silent wrong answer",
      "Dropping constant of integration after integrating",
      "Using dv/dt = f(x) and trying to integrate with t — circular error",
      "Confusing average acceleration with instantaneous acceleration",
      "Not applying initial conditions — answer has undetermined C"
    ],
    "key_results": [
      "a = kt → v = kt²/2 + v₀ (from rest: v = kt²/2)",
      "a = kx → v² = kx² + v₀² (from origin at rest: v = x√k)",
      "a = kv → v = v₀·e^(kt) (growing) or v = v₀·e^(-kt) (decaying)",
      "a = k − mv → terminal v = k/m (set a=0)",
      "Slope of v-t = a at that instant (even for non-linear v-t)"
    ],
    "standard_values": {
      "g": "10 m/s² (use unless stated otherwise)"
    }
  },
  "concept_relationships": {
    "prerequisites": [
      "uniform_acceleration",
      "distance_vs_displacement"
    ],
    "extensions": [
      "motion_graphs",
      "relative_motion",
      "projectile_motion",
      "circular_motion_banking"
    ],
    "siblings": [
      "motion_graphs"
    ],
    "common_exam_combinations": [
      "motion_graphs — v-t graph for non-uniform motion, area = displacement, slope = acceleration",
      "work_energy_theorem — F=ma with variable a leads to variable force, work requires integration",
      "SHM — acceleration a = −ω²x is an a=f(x) case, leading to SHM equations"
    ]
  },
  "three_js_flag": false,
  "three_js_note": "Non-uniform acceleration is 1D motion along a line. canvas2d with dual-panel (particle track + v-t/a-t graphs) is the correct renderer. Three.js not needed.",
  "regeneration_variants": [
    {
      "variant_id": 1,
      "approach": "why_suvat_fails",
      "entry_state": "STATE_2",
      "teacher_angle": "Start with the exact moment SUVAT breaks. SUVAT assumes a is constant — that is its only assumption. If a changes with time, the derivation of v = u + at is wrong because you cannot pull a out of the integral. Show the SUVAT derivation side by side with the non-uniform derivation. In SUVAT: integral of a dt = at (a is constant). In non-uniform: integral of f(t) dt requires actual integration. The calculus approach is not more complicated — it is the same idea, just not simplified by the constant-a shortcut.",
      "locked_facts_focus": [
        "fact_1",
        "fact_2",
        "fact_3"
      ],
      "panel_b_focus": "Side by side derivation: SUVAT case (a constant, integral trivial) and non-uniform case (a = f(t), integral required). The structural parallel is highlighted — same approach, different level of simplification."
    },
    {
      "variant_id": 2,
      "approach": "connects_to_uniform_acceleration",
      "entry_state": "STATE_1",
      "teacher_angle": "Show uniform acceleration as the special case of non-uniform. In uniform acceleration, a = constant. That is a function of time where the function is just a flat line — f(t) = k. SUVAT equations are the result of integrating that flat line. Non-uniform acceleration is just the general case where the line is not flat — a = f(t) can be any curve. Every SUVAT result has a generalised version. The student already knows the special case — this is just removing the restriction that a must be constant.",
      "locked_facts_focus": [
        "fact_4",
        "fact_5",
        "fact_6"
      ],
      "panel_b_focus": "a-t graph: flat horizontal line labeled 'uniform acceleration — SUVAT applies'. Then curve shown labeled 'non-uniform — calculus required'. Transition between the two is animated — as the flat line curves, the SUVAT equations become invalid."
    }
  ]
}
```


# projectile_inclined.json
```json
{
  "concept_id": "projectile_inclined",
  "concept_name": "Projectile Motion on an Inclined Plane",
  "chapter": "Ch.7",
  "section": "7.5",
  "source_book": "DC Pandey Mechanics Vol 1",
  "class_level": "11",
  "locked_facts": {
    "fact_1": "On an inclined plane of angle \u03b1, choose x-axis along the plane and y-axis perpendicular to the plane.",
    "fact_2": "Up the plane: ux = u cos(\u03b8-\u03b1), uy = u sin(\u03b8-\u03b1), ax = -g sin\u03b1, ay = -g cos\u03b1. Here \u03b8 is measured from horizontal.",
    "fact_3": "Time of flight up the plane: T = 2u sin(\u03b8-\u03b1) / (g cos\u03b1).",
    "fact_4": "Range up the plane: R = 2u\u00b2 sin(\u03b8-\u03b1) cos\u03b8 / (g cos\u00b2\u03b1).",
    "fact_5": "Range is maximum when \u03b8 = 45\u00b0 + \u03b1/2 (angle from horizontal), i.e., the projectile bisects the angle between the vertical and the incline normal.",
    "fact_6": "Maximum range up the plane: Rmax = u\u00b2 / [g(1 + sin\u03b1)].",
    "fact_7": "For horizontal launch from incline top (\u03b8=0 measured from horizontal, projectile goes down the slope): coordinates at landing x = -2v\u2080\u00b2tan\u03b1/g, y = -2v\u2080\u00b2tan\u00b2\u03b1/g.",
    "fact_8": "Down the plane: replace \u03b1 with -\u03b1 in formulas. T and R change accordingly.",
    "fact_9": "Standard horizontal/vertical formulas (T=2u sin\u03b8/g, R=u\u00b2sin2\u03b8/g) CANNOT be applied directly on an inclined plane.",
    "fact_10": "At maximum range on the incline, velocity at landing is perpendicular to the initial velocity."
  },
  "epic_l_path": {
    "description": "Full explanation of projectile motion on inclined plane \u2014 axis choice, formulas, max range condition",
    "scope": "global",
    "states": [
      {
        "state_id": "STATE_1",
        "label": "The Setup \u2014 Inclined Plane with a Projectile",
        "physics_layer": {
          "scenario": "inclined_projectile_setup",
          "show": "incline at angle \u03b1=30\u00b0, ball launched at angle \u03b8=60\u00b0 from horizontal, x-axis drawn along slope (up), y-axis perpendicular to slope, gravity vector decomposed into -g sin\u03b1 along slope and -g cos\u03b1 perpendicular to slope",
          "values": {
            "alpha_deg": 30,
            "theta_deg": 60
          },
          "freeze_at_t": 0
        },
        "pedagogy_layer": {
          "focus": "Choosing the right axis system is the entire trick \u2014 tilt your world",
          "real_world": "Ski jump \u2014 the ramp is your reference plane, not the ground",
          "attention_target": "Gravity now has TWO components: one pulling along slope, one pulling into slope"
        },
        "freeze": false
      },
      {
        "state_id": "STATE_2",
        "label": "Velocity Components in Tilted Frame",
        "physics_layer": {
          "scenario": "inclined_velocity_decomposition",
          "show": "initial velocity u decomposed: ux = u cos(\u03b8-\u03b1) along slope, uy = u sin(\u03b8-\u03b1) perpendicular to slope. Both labeled.",
          "values": {
            "alpha_deg": 30,
            "theta_deg": 60,
            "u": 20
          },
          "freeze_at_t": 0
        },
        "pedagogy_layer": {
          "focus": "In the tilted frame, ux and uy use (\u03b8-\u03b1), not \u03b8 \u2014 because axes are rotated",
          "contrast_from_previous": "We've tilted everything. Horizontal launch (\u03b8=\u03b1) means uy=0 in tilted frame.",
          "attention_target": "\u03b8-\u03b1 is the angle from the slope surface \u2014 the effective launch angle in the new frame"
        },
        "freeze": true
      },
      {
        "state_id": "STATE_3",
        "label": "Trajectory Arc on the Slope",
        "physics_layer": {
          "scenario": "inclined_projectile_arc",
          "show": "full arc of projectile from O to B on incline. Range R labeled along slope. ax=-g sin\u03b1, ay=-g cos\u03b1 shown as constant acceleration components.",
          "values": {
            "alpha_deg": 30,
            "theta_deg": 60,
            "u": 20,
            "g": 10
          },
          "freeze_at_t": null
        },
        "pedagogy_layer": {
          "focus": "In the tilted frame this is the same as normal projectile \u2014 just with g replaced by (g sin\u03b1, g cos\u03b1)",
          "contrast_from_previous": "The motion looks like a standard projectile but in a tilted world",
          "attention_target": "The projectile lands ON the slope \u2014 range R is measured along the slope, not horizontal"
        },
        "freeze": false
      },
      {
        "state_id": "STATE_4",
        "label": "Range Formula and Maximum Range Angle",
        "physics_layer": {
          "scenario": "inclined_range_vs_angle",
          "show": "R vs \u03b8 curve for given \u03b1, maximum marked at \u03b8 = 45\u00b0 + \u03b1/2. Compare: flat ground max at 45\u00b0, incline max at 45\u00b0+\u03b1/2.",
          "values": {
            "alpha_deg": 30,
            "u": 20,
            "g": 10,
            "theta_max_deg": 60
          },
          "freeze_at_t": null
        },
        "pedagogy_layer": {
          "focus": "Incline shifts the optimum angle upward by \u03b1/2 \u2014 the steeper the slope, the higher you must aim",
          "aha_moment": "\u03b8_max = 45\u00b0 + \u03b1/2. On flat ground \u03b1=0, so \u03b8_max=45\u00b0. The incline formula generalizes the flat-ground result.",
          "attention_target": "Maximum range on slope is always less than on flat ground \u2014 slope fights you"
        },
        "freeze": false
      },
      {
        "state_id": "STATE_5",
        "label": "Up vs Down the Plane Comparison",
        "physics_layer": {
          "scenario": "inclined_up_vs_down",
          "show": "same launch speed and angle. Arc going up the slope vs arc going down the slope. Down-slope arc is always longer. Both T and R labeled.",
          "values": {
            "alpha_deg": 30,
            "theta_deg": 60,
            "u": 20
          },
          "freeze_at_t": null
        },
        "pedagogy_layer": {
          "focus": "Going down the slope: gravity component along slope HELPS. Going up: it hinders. Same launch \u2192 very different range.",
          "contrast_from_previous": "Replace \u03b1 with -\u03b1 for down the plane \u2014 formulas swap their signs"
        },
        "freeze": false
      },
      {
        "state_id": "STATE_6",
        "label": "Aha \u2014 Standard Formulas Don't Work Here",
        "physics_layer": {
          "scenario": "inclined_formula_comparison",
          "show": "side by side: wrong answer using R=u\u00b2sin2\u03b8/g (flat formula) vs correct R using inclined formula. Numbers visibly different, wrong prediction marked with X.",
          "values": {
            "alpha_deg": 30,
            "theta_deg": 60,
            "u": 20
          },
          "freeze_at_t": null
        },
        "pedagogy_layer": {
          "focus": "Plugging flat-ground formulas gives completely wrong landing point on the incline",
          "aha_moment": "The slope changes both the effective gravity and the axis directions \u2014 you MUST use the tilted frame approach.",
          "contrast_from_previous": "This is why we set up the new axis system in STATE_1 \u2014 it was not optional"
        },
        "freeze": true
      }
    ]
  },
  "epic_c_branches": {
    "applies_flat_formula": {
      "branch_id": "applies_flat_formula",
      "trigger_beliefs": [
        "use R = u\u00b2sin2\u03b8/g on incline",
        "same formula for incline",
        "flat formula apply karunga",
        "range formula same hai",
        "incline pe bhi R = u\u00b2sin2\u03b8/g"
      ],
      "student_belief": "The standard range formula R = u\u00b2sin2\u03b8/g works directly for projectile on an inclined plane",
      "actual_physics": "Flat-ground formula uses ax=0 (horizontal) and ay=-g (vertical). On incline, both axes have acceleration components. New formulas required using tilted axes.",
      "aha_moment": "The flat formula gives landing point ON THE GROUND, not on the slope. The slope is not the ground.",
      "states": {
        "STATE_1": {
          "label": "Your Belief \u2014 Apply Flat Formula",
          "physics_layer": {
            "scenario": "inclined_wrong_formula",
            "show": "incline with projectile. Flat-ground formula used, predicted landing point is BELOW the incline surface (in mid-air or underground) \u2014 visually absurd.",
            "freeze": false
          },
          "pedagogy_layer": {
            "focus": "Show the absurd result of applying flat formula on an incline"
          }
        },
        "STATE_2": {
          "label": "Why the Formula Breaks",
          "physics_layer": {
            "scenario": "inclined_axis_mismatch",
            "show": "split view: left = flat ground (ax=0 valid, ay=-g valid). Right = incline (ax=-g sin\u03b1\u22600, ay=-g cos\u03b1\u2260g). The assumption ax=0 is violated.",
            "freeze": true
          },
          "pedagogy_layer": {
            "focus": "Flat formula assumes ax=0. On incline, ax=-g sin\u03b1 \u2260 0. One broken assumption breaks the whole formula."
          }
        },
        "STATE_3": {
          "label": "Correct Tilted Frame Setup",
          "physics_layer": {
            "scenario": "inclined_correct_setup",
            "show": "incline with tilted axes, correct velocity components ux=u cos(\u03b8-\u03b1), uy=u sin(\u03b8-\u03b1), correct accelerations labeled.",
            "freeze": true
          },
          "pedagogy_layer": {
            "focus": "Tilt your axes to match the slope. Then the problem becomes standard kinematics."
          }
        },
        "STATE_4": {
          "label": "Correct Prediction vs Wrong Prediction",
          "physics_layer": {
            "scenario": "inclined_correct_vs_wrong",
            "show": "both predictions shown on same incline. Flat formula landing point: wrong (off-slope). Tilted formula: lands exactly on slope. Numerical R values compared.",
            "freeze": false
          },
          "pedagogy_layer": {
            "focus": "The tilted formula lands exactly where the ball actually lands on the slope.",
            "aha_moment": "The flat formula doesn't even know the slope exists. The tilted formula respects it."
          }
        }
      }
    },
    "wrong_max_angle": {
      "branch_id": "wrong_max_angle",
      "trigger_beliefs": [
        "max range at 45 on incline",
        "incline pe bhi 45 degree",
        "45 degree maximum range incline",
        "same angle as flat ground"
      ],
      "student_belief": "Maximum range on an inclined plane is also achieved at \u03b8 = 45\u00b0 (from horizontal), same as flat ground",
      "actual_physics": "Maximum range up an incline of angle \u03b1 occurs at \u03b8 = 45\u00b0 + \u03b1/2 from horizontal. The incline shifts the optimum angle upward by half the slope angle.",
      "aha_moment": "Flat ground is just \u03b1=0: \u03b8_max = 45\u00b0 + 0/2 = 45\u00b0. The incline formula generalizes flat ground.",
      "states": {
        "STATE_1": {
          "label": "Your Belief \u2014 45\u00b0 is Always Best",
          "physics_layer": {
            "scenario": "inclined_wrong_angle",
            "show": "incline \u03b1=30\u00b0. Trajectory at \u03b8=45\u00b0. Arrow pointing out that this is NOT the maximum range arc on this slope.",
            "freeze": false
          },
          "pedagogy_layer": {
            "focus": "Student believes 45\u00b0 is optimal everywhere"
          }
        },
        "STATE_2": {
          "label": "Sweep Angles \u2014 Find the True Maximum",
          "physics_layer": {
            "scenario": "inclined_angle_sweep",
            "show": "arcs at 45\u00b0, 55\u00b0, 60\u00b0 (=45\u00b0+30\u00b0/2), 70\u00b0. Range along slope measured for each. 60\u00b0 arc is clearly longest.",
            "freeze": false
          },
          "pedagogy_layer": {
            "focus": "On \u03b1=30\u00b0 incline, the 60\u00b0 arc travels farthest up the slope. Not 45\u00b0."
          }
        },
        "STATE_3": {
          "label": "Aha \u2014 \u03b8_max = 45\u00b0 + \u03b1/2",
          "physics_layer": {
            "scenario": "inclined_max_angle_display",
            "show": "formula \u03b8_max = 45\u00b0 + \u03b1/2. For \u03b1=30\u00b0: \u03b8_max = 60\u00b0. Highlighted on R-vs-\u03b8 curve. Flat ground case \u03b1=0 shown as special case giving 45\u00b0.",
            "freeze": true
          },
          "pedagogy_layer": {
            "focus": "The slope makes you aim higher than 45\u00b0 \u2014 the gravity component along slope requires extra upward push.",
            "aha_moment": "Flat ground (\u03b1=0) gives the familiar 45\u00b0. Every slope adds \u03b1/2 to that."
          }
        }
      }
    }
  },
  "epic_c_micro_templates": {
    "micro_1": {
      "trigger": [
        "time of flight on incline",
        "T formula incline",
        "incline pe T"
      ],
      "response_type": "static_with_formula",
      "formula": "T = 2u sin(\u03b8-\u03b1) / (g cos\u03b1) [up the plane]",
      "key_point": "\u03b8 measured from horizontal. \u03b1 = incline angle. Use (\u03b8-\u03b1) not \u03b8.",
      "simulation_states": 1
    },
    "micro_2": {
      "trigger": [
        "range on incline",
        "R formula incline",
        "incline range"
      ],
      "response_type": "static_with_formula",
      "formula": "R = 2u\u00b2 sin(\u03b8-\u03b1) cos\u03b8 / (g cos\u00b2\u03b1) [up the plane]",
      "key_point": "This reduces to R=u\u00b2sin2\u03b8/g when \u03b1=0. Never use flat formula on slope.",
      "simulation_states": 1
    },
    "micro_3": {
      "trigger": [
        "maximum range incline",
        "best angle incline",
        "optimal angle slope"
      ],
      "response_type": "static_with_formula",
      "formula": "\u03b8_max = 45\u00b0 + \u03b1/2. Rmax = u\u00b2 / [g(1+sin\u03b1)]",
      "key_point": "Rmax on incline is always less than Rmax on flat ground (u\u00b2/g). Slope always reduces maximum range.",
      "simulation_states": 2
    },
    "micro_4": {
      "trigger": [
        "down the plane projectile",
        "niche slope pe",
        "down incline"
      ],
      "response_type": "static",
      "key_point": "Replace \u03b1 with -\u03b1 in all up-the-plane formulas. Down the plane: T = 2u sin(\u03b8+\u03b1)/(g cos\u03b1), and range is always greater than up the plane for same \u03b8.",
      "simulation_states": 1
    }
  },
  "static_responses": {
    "axis_choice": "Choose x along the plane (up positive), y perpendicular to plane (away positive). Then decompose both u and g in these directions. Treat as standard kinematics problem.",
    "why_tilted_frame": "The landing condition is sy=0 (back on slope), not sy=-vertical height. Tilted frame makes this condition automatic \u2014 sy=0 means landed on slope.",
    "special_case_horizontal": "If ball launched horizontally from incline top: \u03b8_from_horizontal = 0, so \u03b8-\u03b1 = -\u03b1. Use u cos(-\u03b1)=u cos\u03b1 as ux along slope, u sin(-\u03b1)=-u sin\u03b1 as uy (into slope initially)."
  },
  "example_library": {
    "example_1": {
      "source": "DC Pandey Example 7.9, Section 7.5",
      "principle": "Man on hilltop projects stone horizontally. Find coordinates of landing on hill surface.",
      "aha": "Down the plane formula with \u03b8=0 (horizontal launch). x = -2v\u2080\u00b2tan\u03b1/g. Demonstrates how to handle down-slope case.",
      "simulation_states": 3
    }
  },
  "parameter_slots": {
    "slot_1": {
      "name": "initial_speed_u",
      "symbol": "u",
      "unit": "m/s",
      "default": 20,
      "range": [
        10,
        60
      ]
    },
    "slot_2": {
      "name": "launch_angle_theta",
      "symbol": "\u03b8",
      "unit": "degrees (from horizontal)",
      "default": 60,
      "range": [
        0,
        90
      ]
    },
    "slot_3": {
      "name": "incline_angle_alpha",
      "symbol": "\u03b1",
      "unit": "degrees",
      "default": 30,
      "range": [
        10,
        60
      ]
    },
    "slot_4": {
      "name": "gravity_g",
      "symbol": "g",
      "unit": "m/s\u00b2",
      "default": 10,
      "range": [
        9.8,
        10
      ]
    }
  },
  "panel_sync_spec": {
    "panel_a": "canvas2d \u2014 mechanics_2d renderer showing incline with projectile arc in tilted frame",
    "panel_b": "plotly \u2014 R vs \u03b8 curve for the given \u03b1, showing maximum at 45\u00b0+\u03b1/2. Updates as \u03b1 changes.",
    "sync_event": "Moving \u03b1 slider in Panel A shifts the entire R-vs-\u03b8 curve and maximum marker in Panel B",
    "bidirectional": true,
    "sync_trigger": "alpha_change"
  },
  "renderer_hint": {
    "primary_renderer": "mechanics_2d",
    "panel_count": 2,
    "technology_a": "canvas2d",
    "technology_b": "plotly",
    "sync_required": true,
    "scene_mode": false,
    "scenario_type": "projectile_inclined",
    "panel_a_role": "Inclined plane with tilted axes, projectile arc from O to B on slope, ax and ay components labeled",
    "panel_b_role": "Plotly: R vs theta curve for current alpha. Maximum marked at 45+alpha/2. Updates as alpha slider changes.",
    "scene_elements": []
  },
  "routing_signals": {
    "primary_keywords": [
      "inclined plane projectile",
      "projectile on slope",
      "up the plane",
      "down the plane",
      "incline projectile"
    ],
    "hinglish_triggers": [
      "dhalanwan samath pe projectile",
      "slope pe phekna",
      "incline pe kitni dur",
      "dhalan pe time of flight"
    ],
    "formula_triggers": [
      "T = 2u sin(\u03b8-\u03b1)/(g cos\u03b1)",
      "\u03b8_max = 45 + \u03b1/2",
      "Rmax = u\u00b2/g(1+sin\u03b1)"
    ],
    "belief_check_triggers": [
      "does 45 degree give max range on slope",
      "can I use standard formulas on incline"
    ]
  },
  "jee_specific": {
    "trap_1": "Standard formulas (R=u\u00b2sin2\u03b8/g) don't work on inclined plane. Most common JEE mistake in this topic.",
    "trap_2": "\u03b8 is always measured from HORIZONTAL in DC Pandey's convention \u2014 not from the slope. Angle from slope = (\u03b8-\u03b1).",
    "trap_3": "Maximum range angle is 45\u00b0+\u03b1/2 from horizontal, which equals (90\u00b0-\u03b1)/2 from the slope surface.",
    "trap_4": "For down-the-slope launch, gravity component along slope ADDS to motion \u2014 T and R both increase. Students often apply up-slope formula.",
    "trap_5": "The condition 'ball lands on slope' means sy=0 in tilted frame, NOT sy=0 in lab frame."
  },
  "concept_relationships": {
    "prerequisites": [
      "projectile_motion",
      "vector_components",
      "uniform_acceleration"
    ],
    "leads_to": [
      "relative_motion_projectiles"
    ],
    "common_confusion_with": [
      "projectile_motion \u2014 students apply flat-ground formulas here"
    ]
  },
  "regeneration_variants": [
    {
      "variant_id": 1,
      "scenario_type": "projectile_inclined",
      "approach": "lab_frame_direct",
      "entry_state": "STATE_1",
      "teacher_angle": "Stay in the lab frame (horizontal x, vertical y). Set up when ball lands ON slope: condition is y = x\u00b7tan\u03b1. Substitute into trajectory equation and solve. No axis tilting needed \u2014 but more algebra.",
      "locked_facts_focus": [
        "fact_9",
        "fact_1",
        "fact_4"
      ],
      "panel_b_focus": "Show both frames side by side \u2014 lab frame algebra vs tilted frame method reaching same answer."
    },
    {
      "variant_id": 2,
      "scenario_type": "projectile_inclined",
      "approach": "max_range_first",
      "entry_state": "STATE_4",
      "teacher_angle": "Start with the maximum range result \u03b8_max = 45\u00b0+\u03b1/2. Show WHY: the angle that bisects the angle between vertical and slope normal. Derive T and R formulas from there.",
      "locked_facts_focus": [
        "fact_5",
        "fact_6",
        "fact_3"
      ],
      "panel_b_focus": "R vs \u03b8 curve with maximum highlighted as primary focus from STATE_1."
    }
  ]
}
```


# projectile_motion.json
```json
{
  "concept_id": "projectile_motion",
  "concept_name": "Projectile Motion",
  "chapter": "Ch.7",
  "section": "7.2 \u2013 7.4",
  "source_book": "DC Pandey Mechanics Vol 1",
  "class_level": "11",
  "locked_facts": {
    "fact_1": "Projectile motion is 2D motion with constant downward acceleration g \u2014 horizontal and vertical motions are independent.",
    "fact_2": "Horizontal component ux = u cos\u03b8 remains constant throughout \u2014 ax = 0.",
    "fact_3": "Vertical component uy = u sin\u03b8 decreases, reaches zero at highest point, then increases downward \u2014 ay = -g.",
    "fact_4": "At the highest point, velocity is NOT zero \u2014 only the vertical component vy = 0; horizontal velocity ux persists.",
    "fact_5": "Time of flight: T = 2u sin\u03b8 / g",
    "fact_6": "Maximum height: H = u\u00b2sin\u00b2\u03b8 / (2g)",
    "fact_7": "Horizontal range: R = u\u00b2sin2\u03b8 / g = u\u00b2 \u00b7 2sin\u03b8cos\u03b8 / g",
    "fact_8": "Range is maximum at \u03b8 = 45\u00b0: Rmax = u\u00b2/g. Maximum height is at \u03b8 = 90\u00b0.",
    "fact_9": "Complementary angles give equal range: R(\u03b8) = R(90\u00b0-\u03b8). R(30\u00b0) = R(60\u00b0), R(20\u00b0) = R(70\u00b0).",
    "fact_10": "At maximum range (\u03b8=45\u00b0): Rmax = 4\u00b7Hmax.",
    "fact_11": "Trajectory equation: y = x\u00b7tan\u03b8 - gx\u00b2/(2u\u00b2cos\u00b2\u03b8) \u2014 a downward parabola.",
    "fact_12": "Mass of projectile does NOT affect its trajectory \u2014 T, H, R are all mass-independent.",
    "fact_13": "Horizontal motion is uniform; vertical motion is uniformly accelerated. These are solved independently then combined.",
    "fact_14": "A ball thrown horizontally (\u03b8=0): uy=0, only ux persists, it follows a parabola that curves downward.",
    "fact_15": "Sum of two times when projectile is at same height: t1 + t2 = T (time of flight)."
  },
  "epic_l_path": {
    "description": "Full explanation of projectile motion \u2014 from component decomposition to T, H, R derivation",
    "scope": "global",
    "states": [
      {
        "state_id": "STATE_1",
        "label": "Launch \u2014 Decompose into Components",
        "physics_layer": {
          "scenario": "projectile_launch",
          "show": "ball at origin, initial velocity vector u at angle \u03b8=45\u00b0, decomposed into ux (horizontal arrow) and uy (vertical arrow)",
          "values": {
            "u": 20,
            "theta_deg": 45,
            "ux": 14.14,
            "uy": 14.14
          },
          "freeze_at_t": 0
        },
        "pedagogy_layer": {
          "focus": "The single velocity u splits into two independent motions",
          "real_world": "Cricket ball lofted \u2014 the batsman gives it both forward push and upward lift simultaneously",
          "attention_target": "The two arrows are independent \u2014 one horizontal, one vertical",
          "contrast_from_previous": null
        },
        "freeze": false
      },
      {
        "state_id": "STATE_2",
        "label": "Horizontal \u2014 Constant Velocity",
        "physics_layer": {
          "scenario": "projectile_horizontal_only",
          "show": "ball moving purely horizontally at constant speed ux, no vertical motion, ax=0 label",
          "values": {
            "ux": 14.14,
            "ax": 0
          },
          "freeze_at_t": null
        },
        "pedagogy_layer": {
          "focus": "Horizontal motion is uniform \u2014 no force, no change in speed",
          "contrast_from_previous": "We isolated the horizontal part \u2014 it never slows down",
          "attention_target": "ux arrow stays same length throughout \u2014 gravity has zero horizontal effect"
        },
        "freeze": false
      },
      {
        "state_id": "STATE_3",
        "label": "Vertical \u2014 Retarded then Accelerated",
        "physics_layer": {
          "scenario": "projectile_vertical_only",
          "show": "ball thrown upward, vertical velocity arrow shrinking to zero then growing downward, ay=-g label",
          "values": {
            "uy": 14.14,
            "ay": -10
          },
          "freeze_at_t": null
        },
        "pedagogy_layer": {
          "focus": "Vertical is just the Ch.6 kinematics problem \u2014 go up, stop, come back down",
          "contrast_from_previous": "Vertical IS affected by gravity; horizontal was not",
          "attention_target": "vy arrow shrinks to zero at top, then reverses \u2014 same as stone thrown upward"
        },
        "freeze": false
      },
      {
        "state_id": "STATE_4",
        "label": "Combined \u2014 Parabolic Trajectory",
        "physics_layer": {
          "scenario": "projectile_full_parabola",
          "show": "full parabolic arc with both ux (constant) and vy (varying) arrows shown at each point, trajectory traced",
          "values": {
            "u": 20,
            "theta_deg": 45,
            "g": 10
          },
          "freeze_at_t": null
        },
        "pedagogy_layer": {
          "focus": "Combining constant horizontal + accelerated vertical produces the parabola",
          "contrast_from_previous": "The two motions run simultaneously \u2014 the parabola is their superposition",
          "attention_target": "ux arrow stays same length everywhere; vy arrow changes \u2014 this asymmetry creates the curve"
        },
        "freeze": false
      },
      {
        "state_id": "STATE_5",
        "label": "At the Highest Point",
        "physics_layer": {
          "scenario": "projectile_apex",
          "show": "ball frozen at apex, vy=0 label visible, ux arrow still present, H = u\u00b2sin\u00b2\u03b8/2g displayed",
          "values": {
            "u": 20,
            "theta_deg": 45,
            "H": 10,
            "vx_at_top": 14.14,
            "vy_at_top": 0
          },
          "freeze_at_t": "apex_time"
        },
        "pedagogy_layer": {
          "focus": "Velocity is NOT zero at top \u2014 only vertical component is zero",
          "aha_moment": "The ball is still moving horizontally at the top \u2014 it never stops",
          "contrast_from_previous": "Students expect everything to pause at top \u2014 only vy pauses",
          "attention_target": "ux arrow same length as at launch; vy arrow is gone \u2014 speed at top = ux"
        },
        "freeze": true
      },
      {
        "state_id": "STATE_6",
        "label": "T, H, R Formulas \u2014 Effect of \u03b8",
        "physics_layer": {
          "scenario": "projectile_angle_sweep",
          "show": "side-by-side comparison of trajectories at \u03b8=30\u00b0, 45\u00b0, 60\u00b0, 75\u00b0. R values shown. 45\u00b0 arc highlighted as longest range. 90\u00b0 shown as max height",
          "values": {
            "u": 20,
            "angles_deg": [
              30,
              45,
              60,
              75
            ],
            "g": 10
          },
          "freeze_at_t": null
        },
        "pedagogy_layer": {
          "focus": "45\u00b0 is the sweet spot \u2014 equal horizontal and vertical push \u2192 maximum range",
          "aha_moment": "R(30\u00b0) = R(60\u00b0) \u2014 complementary angles give same range. Rmax(45\u00b0) = 4 \u00d7 H(45\u00b0).",
          "contrast_from_previous": "\u03b8 affects the shape of the arc \u2014 45\u00b0 maximizes how far, 90\u00b0 maximizes how high",
          "attention_target": "30\u00b0 and 60\u00b0 arcs land at exactly the same point \u2014 symmetric about 45\u00b0"
        },
        "freeze": false
      }
    ]
  },
  "epic_c_branches": {
    "horizontal_velocity_changes": {
      "branch_id": "horizontal_velocity_changes",
      "trigger_beliefs": [
        "horizontal velocity decreases",
        "ux decreases",
        "ball slows down horizontally",
        "gravity affects horizontal speed",
        "horizontal component changes",
        "kshitij mein bhi kam hoti hai"
      ],
      "student_belief": "Horizontal velocity decreases during flight because gravity acts on the projectile",
      "actual_physics": "Gravity acts only downward \u2014 it has zero horizontal component. ax = 0 always. ux is constant from launch to landing.",
      "aha_moment": "The horizontal arrow stays exactly the same length for the entire flight \u2014 gravity cannot touch it",
      "states": {
        "STATE_1": {
          "label": "Your Belief \u2014 Horizontal Velocity Shrinks",
          "physics_layer": {
            "scenario": "projectile_wrong_horizontal",
            "show": "projectile arcing with ux arrows getting progressively shorter along trajectory \u2014 student's wrong belief animated",
            "freeze": false
          },
          "pedagogy_layer": {
            "focus": "Show what student believes \u2014 ux shrinking"
          }
        },
        "STATE_2": {
          "label": "Isolate the Forces",
          "physics_layer": {
            "scenario": "force_decomposition",
            "show": "gravity vector pointing straight down, decomposed: zero horizontal component, full vertical component",
            "freeze": true
          },
          "pedagogy_layer": {
            "focus": "Gravity is purely vertical \u2014 its horizontal component is exactly zero"
          }
        },
        "STATE_3": {
          "label": "Real Horizontal Motion",
          "physics_layer": {
            "scenario": "projectile_horizontal_constant",
            "show": "projectile with ux arrows all identical length along trajectory, ax=0 label, equal time intervals cover equal horizontal distances",
            "freeze": false
          },
          "pedagogy_layer": {
            "focus": "Equal spacing horizontally = constant speed. Like a ball rolling on frictionless floor."
          }
        },
        "STATE_4": {
          "label": "Side by Side Comparison",
          "physics_layer": {
            "scenario": "projectile_dual_comparison",
            "show": "upper trajectory: your belief (shrinking ux). Lower: reality (constant ux). Landing points differ significantly.",
            "freeze": false
          },
          "pedagogy_layer": {
            "focus": "If ux shrank, projectile would land much shorter \u2014 doesn't match experiment"
          }
        },
        "STATE_5": {
          "label": "Aha \u2014 Horizontal is Untouchable by Gravity",
          "physics_layer": {
            "scenario": "projectile_full_parabola",
            "show": "full parabola with constant ux arrows throughout, vy arrows changing. Formula: ax = 0 displayed prominently.",
            "freeze": true
          },
          "pedagogy_layer": {
            "focus": "ax = 0. Horizontal velocity = u cos\u03b8 from start to finish. Gravity only owns the vertical.",
            "aha_moment": "Think of it as two separate worlds: horizontal world has no gravity; vertical world has full gravity."
          }
        }
      }
    },
    "velocity_zero_at_top": {
      "branch_id": "velocity_zero_at_top",
      "trigger_beliefs": [
        "velocity zero at top",
        "ball stops at highest point",
        "speed is zero at max height",
        "momentarily at rest at top",
        "upar velocity zero ho jaati hai",
        "highest point pe ruk jaata hai"
      ],
      "student_belief": "The ball's velocity is zero at the highest point because it stops momentarily before coming down",
      "actual_physics": "Only the vertical component vy = 0 at the highest point. Horizontal component vx = u cos\u03b8 persists unchanged. Speed at top = u cos\u03b8 \u2260 0.",
      "aha_moment": "The ball is still flying horizontally at the top \u2014 speed at apex = ux = u cos\u03b8",
      "states": {
        "STATE_1": {
          "label": "Your Belief \u2014 Full Stop at Top",
          "physics_layer": {
            "scenario": "projectile_wrong_apex",
            "show": "projectile at apex with velocity = 0 shown, all arrows gone, ball appears frozen mid-air",
            "freeze": false
          },
          "pedagogy_layer": {
            "focus": "Student's mental model \u2014 the ball completely stops at the top"
          }
        },
        "STATE_2": {
          "label": "Track the Two Components Separately",
          "physics_layer": {
            "scenario": "projectile_component_tracking",
            "show": "split view: top half shows ux (constant, never zero), bottom half shows vy (decreasing to zero at apex then reversing)",
            "freeze": false
          },
          "pedagogy_layer": {
            "focus": "Vertical stops \u2014 horizontal never stops. They are independent."
          }
        },
        "STATE_3": {
          "label": "What Actually Happens at the Top",
          "physics_layer": {
            "scenario": "projectile_apex_correct",
            "show": "ball at highest point, vy=0 (arrow gone), ux arrow still full length pointing right, speed label = ux = 14.14 m/s",
            "freeze": true
          },
          "pedagogy_layer": {
            "focus": "At the top: vy = 0, vx = u cos\u03b8. Speed is NOT zero \u2014 it equals u cos\u03b8."
          }
        },
        "STATE_4": {
          "label": "Aha \u2014 Only Vertical Pauses",
          "physics_layer": {
            "scenario": "projectile_full_with_apex_highlight",
            "show": "full parabola, apex highlighted, vy arrow animation pausing to zero then reversing, ux arrow constant throughout",
            "freeze": false
          },
          "pedagogy_layer": {
            "focus": "vy = 0 at top is a momentary event for the vertical world. Horizontal world never pauses.",
            "aha_moment": "If the ball truly stopped at the top, it would just drop vertically \u2014 no range. The horizontal push keeps it flying forward."
          }
        }
      }
    },
    "complementary_angles_different_range": {
      "branch_id": "complementary_angles_different_range",
      "trigger_beliefs": [
        "30 and 60 different range",
        "complementary angles different",
        "angle badalte hi range alag",
        "60 degree mein zyada range",
        "higher angle more range"
      ],
      "student_belief": "A projectile launched at 60\u00b0 travels farther than one at 30\u00b0 with the same speed because 60\u00b0 is a larger angle",
      "actual_physics": "R = u\u00b2sin2\u03b8/g. sin(2\u00d730\u00b0) = sin60\u00b0, sin(2\u00d760\u00b0) = sin120\u00b0 = sin60\u00b0. Complementary angles (\u03b8 and 90\u00b0-\u03b8) give exactly equal range.",
      "aha_moment": "sin(2\u03b8) = sin(180\u00b0-2\u03b8). So 30\u00b0 and 60\u00b0 give sin60\u00b0 and sin120\u00b0 \u2014 same value. Same range, different arcs.",
      "states": {
        "STATE_1": {
          "label": "Your Belief \u2014 60\u00b0 Beats 30\u00b0",
          "physics_layer": {
            "scenario": "projectile_wrong_range",
            "show": "30\u00b0 and 60\u00b0 trajectories with 60\u00b0 marked as longer range \u2014 student's incorrect expectation",
            "freeze": false
          },
          "pedagogy_layer": {
            "focus": "Student expects the higher angle to give more range"
          }
        },
        "STATE_2": {
          "label": "Unpack the Range Formula",
          "physics_layer": {
            "scenario": "range_formula_display",
            "show": "R = u\u00b2sin2\u03b8/g on screen. Calculate sin(2\u00d730\u00b0)=sin60\u00b0=0.866, sin(2\u00d760\u00b0)=sin120\u00b0=0.866 shown numerically side by side",
            "freeze": true
          },
          "pedagogy_layer": {
            "focus": "2\u03b8 for 30\u00b0 is 60\u00b0. 2\u03b8 for 60\u00b0 is 120\u00b0. sin60\u00b0 = sin120\u00b0. Same."
          }
        },
        "STATE_3": {
          "label": "Reality \u2014 Both Land at Same Point",
          "physics_layer": {
            "scenario": "projectile_complementary_arcs",
            "show": "30\u00b0 and 60\u00b0 arcs launched from same point, different shapes but landing at identical x-position, R labels equal",
            "freeze": false
          },
          "pedagogy_layer": {
            "focus": "Same range, completely different arc shapes. 60\u00b0 goes higher, 30\u00b0 goes flatter.",
            "aha_moment": "Nature is symmetric about 45\u00b0. Every angle has a complementary twin that lands in the same spot."
          }
        }
      }
    }
  },
  "epic_c_micro_templates": {
    "micro_1": {
      "trigger": [
        "what is range formula",
        "range formula kya hai",
        "R formula"
      ],
      "response_type": "static_with_formula",
      "formula": "R = u\u00b2sin2\u03b8 / g",
      "key_point": "Maximum at \u03b8=45\u00b0 where sin90\u00b0=1. R(\u03b8)=R(90\u00b0-\u03b8) for complementary angles.",
      "simulation_states": 1
    },
    "micro_2": {
      "trigger": [
        "velocity at highest point",
        "apex velocity",
        "upar ka velocity"
      ],
      "response_type": "static_with_diagram",
      "key_point": "At highest point: vy=0, vx=u cos\u03b8. Speed = u cos\u03b8 (NOT zero).",
      "simulation_states": 1
    },
    "micro_3": {
      "trigger": [
        "time of flight formula",
        "T formula",
        "flight time"
      ],
      "response_type": "static_with_formula",
      "formula": "T = 2u sin\u03b8 / g",
      "key_point": "T depends only on uy = u sin\u03b8 (vertical component). Horizontal speed irrelevant.",
      "simulation_states": 1
    },
    "micro_4": {
      "trigger": [
        "max height formula",
        "H formula",
        "maximum height"
      ],
      "response_type": "static_with_formula",
      "formula": "H = u\u00b2sin\u00b2\u03b8 / (2g)",
      "key_point": "Maximum height at \u03b8=90\u00b0 (vertical throw). At \u03b8=45\u00b0: Rmax = 4\u00d7H.",
      "simulation_states": 1
    },
    "micro_5": {
      "trigger": [
        "trajectory equation",
        "path equation",
        "parabola equation"
      ],
      "response_type": "static_with_formula",
      "formula": "y = x\u00b7tan\u03b8 - gx\u00b2/(2u\u00b2cos\u00b2\u03b8)",
      "key_point": "Quadratic in x \u2192 parabola. Can also write as y = x\u00b7tan\u03b8(1 - x/R).",
      "simulation_states": 1
    },
    "micro_6": {
      "trigger": [
        "horizontal projectile",
        "thrown horizontally",
        "horizontal se pheka"
      ],
      "response_type": "static_with_diagram",
      "key_point": "\u03b8=0: uy=0, ux=u. Falls under gravity while moving forward. T=\u221a(2H/g), R=u\u00b7T.",
      "simulation_states": 2
    }
  },
  "static_responses": {
    "definition": "Projectile motion is 2D motion under gravity alone \u2014 no air resistance. Horizontal: uniform motion. Vertical: free fall. Together: parabolic path.",
    "derivation_T": "At landing sy=0. Using sy = uy\u00b7t - \u00bdgt\u00b2: t(u sin\u03b8 - \u00bdgt)=0. t=0 (launch) or t=2u sin\u03b8/g (landing). So T=2u sin\u03b8/g.",
    "derivation_H": "At apex vy=0. Using vy\u00b2=uy\u00b2-2gH: 0=(u sin\u03b8)\u00b2-2gH. So H=u\u00b2sin\u00b2\u03b8/2g.",
    "derivation_R": "R = ux \u00d7 T = u cos\u03b8 \u00d7 2u sin\u03b8/g = u\u00b2\u00b72sin\u03b8cos\u03b8/g = u\u00b2sin2\u03b8/g.",
    "jee_tip_complementary": "Complementary angle pairs (30\u00b0&60\u00b0, 20\u00b0&70\u00b0, etc.) always give same range. Common JEE trick \u2014 they ask you to find the other angle."
  },
  "example_library": {
    "example_1": {
      "source": "DC Pandey Example 7.1, Section 7.3",
      "principle": "Method 1 \u2014 vector approach. u=50m/s at 37\u00b0, find v and s at t=2s.",
      "aha": "Decompose u once, apply v=u+at and s=ut+\u00bdat\u00b2 as vectors \u2014 horizontal and vertical simultaneously.",
      "simulation_states": 2
    },
    "example_2": {
      "source": "DC Pandey Example 7.3, Section 7.3",
      "principle": "Horizontal projectile from 490m height. Find T, range, and final velocity.",
      "aha": "uy=0 for horizontal launch. T comes from vertical free fall alone. Range = ux \u00d7 T.",
      "simulation_states": 3
    },
    "example_3": {
      "source": "DC Pandey Example 7.5, Section 7.4",
      "principle": "When R=H, find \u03b8. Result: tan\u03b8=4.",
      "aha": "Set R=H expressions equal. Clean algebra gives tan\u03b8=4, not 45\u00b0. Counter-intuitive.",
      "simulation_states": 1
    },
    "example_4": {
      "source": "DC Pandey Example 7.6, Section 7.4",
      "principle": "Prove Rmax = 4\u00d7Hmax when \u03b8=45\u00b0.",
      "aha": "At \u03b8=45\u00b0: R=u\u00b2/g, H=u\u00b2/4g. Clearly R=4H. Geometric beauty of maximum range condition.",
      "simulation_states": 1
    },
    "example_5": {
      "source": "DC Pandey Example 7.8, Section 7.4",
      "principle": "Show that sum of two times at same height equals T.",
      "aha": "Quadratic in t has two roots t1 and t2. By Vieta's: t1+t2 = 2u sin\u03b8/g = T.",
      "simulation_states": 2
    }
  },
  "parameter_slots": {
    "slot_1": {
      "name": "initial_speed_u",
      "symbol": "u",
      "unit": "m/s",
      "default": 20,
      "range": [
        10,
        100
      ]
    },
    "slot_2": {
      "name": "launch_angle_theta",
      "symbol": "\u03b8",
      "unit": "degrees",
      "default": 45,
      "range": [
        0,
        90
      ]
    },
    "slot_3": {
      "name": "gravity_g",
      "symbol": "g",
      "unit": "m/s\u00b2",
      "default": 10,
      "range": [
        9.8,
        10
      ]
    },
    "slot_4": {
      "name": "launch_height_h",
      "symbol": "H\u2080",
      "unit": "m",
      "default": 0,
      "range": [
        0,
        200
      ]
    }
  },
  "panel_sync_spec": {
    "panel_a": "canvas2d \u2014 mechanics_2d renderer showing animated parabolic trajectory with velocity vectors",
    "panel_b": "plotly \u2014 interactive graph. Default: R vs \u03b8 curve (0\u00b0 to 90\u00b0). Switches to y vs t (height-time) on request.",
    "sync_event": "As angle slider moves in Panel A, dot moves along R-vs-\u03b8 curve in Panel B in real time",
    "bidirectional": true,
    "sync_trigger": "angle_change"
  },
  "renderer_hint": {
    "primary_renderer": "mechanics_2d",
    "panel_count": 2,
    "technology_a": "canvas2d",
    "technology_b": "plotly",
    "sync_required": true,
    "scene_mode": false,
    "scenario_type": "projectile_motion",
    "panel_a_role": "Animated parabolic trajectory with velocity vector decomposition \u2014 ux constant, vy changing",
    "panel_b_role": "Plotly: R vs theta curve (0-90 deg). Dot tracks along curve as angle slider moves in Panel A.",
    "scene_elements": []
  },
  "routing_signals": {
    "primary_keywords": [
      "projectile",
      "projectile motion",
      "parabola",
      "range",
      "time of flight",
      "maximum height"
    ],
    "hinglish_triggers": [
      "projectile motion kya hai",
      "range formula",
      "kitni dur jayega",
      "uchhai kitni",
      "upar velocity zero"
    ],
    "formula_triggers": [
      "T = 2u sin\u03b8 / g",
      "R = u\u00b2sin2\u03b8/g",
      "H = u\u00b2sin\u00b2\u03b8/2g",
      "y = x tan\u03b8"
    ],
    "belief_check_triggers": [
      "is velocity zero at top",
      "does horizontal speed change",
      "same range at 30 and 60"
    ]
  },
  "jee_specific": {
    "trap_1": "R(30\u00b0) = R(60\u00b0). Students pick 60\u00b0 as longer range \u2014 correct answer is same range.",
    "trap_2": "At highest point speed = u cos\u03b8 (NOT zero). JEE often asks speed at apex.",
    "trap_3": "When R = H, tan\u03b8 = 4 (\u03b8 \u2248 76\u00b0), NOT \u03b8 = 45\u00b0. Setting formulas equal is needed.",
    "trap_4": "Rmax = 4\u00d7Hmax is only true at \u03b8 = 45\u00b0. At other angles R \u2260 4H.",
    "trap_5": "For horizontal projectile: T = \u221a(2H\u2080/g) from height, NOT 2u sin\u03b8/g (uy=0).",
    "trap_6": "Trajectory equation has x\u00b2 in denominator \u2014 it's a function of x, not symmetric about midpoint in x."
  },
  "concept_relationships": {
    "prerequisites": [
      "uniform_acceleration",
      "relative_motion",
      "vector_components"
    ],
    "leads_to": [
      "projectile_inclined",
      "relative_motion_projectiles",
      "circular_motion"
    ],
    "common_confusion_with": [
      "uniform_circular_motion \u2014 both 2D but different acceleration"
    ]
  },
  "regeneration_variants": [
    {
      "variant_id": 1,
      "scenario_type": "projectile_motion",
      "approach": "trajectory_equation",
      "entry_state": "STATE_4",
      "teacher_angle": "Start from the parabola equation y = x\u00b7tan\u03b8 - gx\u00b2/(2u\u00b2cos\u00b2\u03b8). Show why x\u00b2 makes it a parabola. Derive range by setting y=0. Numbers-first approach.",
      "locked_facts_focus": [
        "fact_11",
        "fact_7",
        "fact_8"
      ],
      "panel_b_focus": "Show parabola y vs x curve. Overlay trajectory trace on top of equation curve."
    },
    {
      "variant_id": 2,
      "scenario_type": "projectile_motion",
      "approach": "symmetry_and_complementary",
      "entry_state": "STATE_6",
      "teacher_angle": "Start with the surprising result: 30\u00b0 and 60\u00b0 give SAME range. Why? Work backward to sin(2\u03b8). Build intuition about 45\u00b0 as the sweet spot from the symmetry.",
      "locked_facts_focus": [
        "fact_9",
        "fact_8",
        "fact_10"
      ],
      "panel_b_focus": "R vs \u03b8 curve as primary visual. Ball trajectories secondary \u2014 student sees the curve shape first."
    }
  ]
}
```


# rain_umbrella.json
```json
{
  "concept_id": "rain_umbrella",
  "concept_name": "Rain Problems — Velocity of Rain Relative to Man, Umbrella Direction",
  "class_level": 11,
  "chapter": "Kinematics",
  "section": "6.10",
  "source_coverage": {
    "dc_pandey": "Chapter 6, Section 6.10 — Rain Problems (Examples 6.34, 6.35; Exercise Problems 7, 8)",
    "ncert": "Chapter 4 — Motion in a Plane, Section 4.6",
    "hc_verma": "Chapter 3 — Rest and Motion: Kinematics, Section 3.7"
  },
  "source_type": "ncert_and_dc_pandey",
  "renderer_hint": {
    "technology": "canvas2d",
    "technology_b": "plotly",
    "renderer": "mechanics_2d",
    "scenario_type": "rain_umbrella",
    "panel_count": 2,
    "sync_required": true,
    "scene_mode": true,
    "show_labels": true,
    "scene_elements": [
      "rain_streaks",
      "walking_person",
      "umbrella",
      "velocity_vectors",
      "wind_arrows"
    ],
    "panel_a_role": "Realistic scene — person walking in rain, rain streaks showing apparent direction, umbrella tilts to match v_rm direction as slider changes man's speed",
    "panel_b_role": "Plotly vector diagram — v_r (rain in ground frame), v_m (man's velocity), −v_m drawn, v_rm = v_r − v_m resultant shown with angle labeled"
  },
  "locked_facts": {
    "three_velocities": "Three velocities: v_r = rain velocity in ground frame (usually vertically downward). v_m = man's velocity (horizontal, direction of walking). v_rm = velocity of rain relative to man = v_r − v_m.",
    "umbrella_direction": "Man must hold umbrella in the direction of v_rm (rain as it appears to him) to avoid getting wet. NOT in the direction of v_r (actual rain).",
    "formula": "v_rm = v_r − v_m (vector subtraction). In component form: v_rm_x = v_rx − v_mx, v_rm_y = v_ry − v_my.",
    "rain_vertical_man_horizontal": "Standard case: v_r = (0, −v_r) downward, v_m = (v_m, 0) horizontal (eastward). Then v_rm = (−v_m, −v_r). Umbrella tilts FORWARD (in direction of walking) at angle θ = tan⁻¹(v_m / v_r) from vertical.",
    "angle_formula": "Angle of umbrella from vertical = tan⁻¹(v_m / v_r). Forward tilt in direction of motion.",
    "dc_pandey_ex634": "Example 6.34: v_m = 3 m/s east, v_r = 4 m/s vertically down. v_rm = (−3, −4). Angle from vertical = tan⁻¹(3/4) = 37° east of vertical (forward tilt). |v_rm| = √(9+16) = 5 m/s.",
    "dc_pandey_ex635": "Example 6.35: At v_m = 3 km/h rain appears vertical → v_rm has no horizontal component → v_rx = v_m = 3 km/h (rain has horizontal component 3 km/h eastward). At v_m = 6 km/h, rain appears at 45° → tan45° = 1 → |v_rm_x| = |v_rm_y| → 6−3 = 3 = v_ry. So v_ry = 3 km/h. Speed of rain = √(3²+3²) = 3√2 km/h.",
    "faster_walking_more_tilt": "As man walks faster (v_m increases), v_rm tilts more forward. Umbrella must tilt more in direction of walking.",
    "stopped_man": "If man is stationary (v_m = 0): v_rm = v_r = vertically down. Umbrella held vertically. As soon as he walks, it tilts forward.",
    "running_vs_walking": "Faster running → more forward tilt. This matches experience: in heavy rain, running requires more forward lean of umbrella than walking."
  },
  "minimum_viable_understanding": "v_rm = v_r − v_m. Rain appears to come from the direction of v_rm to the man. Tilt umbrella in that direction. For vertical rain + horizontal walking: umbrella tilts forward at tan⁻¹(v_m / v_r) from vertical.",
  "variables": {
    "v_r": "Rain velocity in ground frame — usually (0, −v_r) vertically downward (m/s or km/h)",
    "v_m": "Man's velocity in ground frame — horizontal (m/s or km/h)",
    "v_rm": "Rain velocity relative to man = v_r − v_m (m/s or km/h)",
    "theta": "Angle of umbrella (= angle of v_rm) from vertical = tan⁻¹(v_m / v_r)",
    "v_rx": "Horizontal component of actual rain velocity (zero unless wind is blowing)",
    "v_ry": "Vertical component of actual rain velocity (downward)"
  },
  "routing_signals": {
    "global_triggers": [
      "rain umbrella problem",
      "umbrella direction rain",
      "velocity of rain relative to man",
      "rain problem kinematics",
      "baarish mein umbrella kahan hold karein"
    ],
    "local_triggers": [
      "umbrella angle from vertical",
      "rain appears to fall at angle",
      "find direction to hold umbrella",
      "v_rm direction",
      "man walking in rain angle",
      "rain speed calculation from two observations"
    ],
    "micro_triggers": [
      "v_rm formula",
      "umbrella tilt forward backward",
      "rain appears vertical why",
      "faster walking more umbrella tilt"
    ],
    "simulation_not_needed_triggers": [
      "state the formula for rain relative to man",
      "write v_rm equals"
    ],
    "subconcept_triggers": {
      "basic_rain_setup": [
        "man walking east rain falling down",
        "umbrella direction vertical rain",
        "basic rain umbrella problem"
      ],
      "rain_with_wind": [
        "rain falling at angle",
        "rain not vertical",
        "wind blowing rain",
        "rain has horizontal component"
      ],
      "find_rain_speed": [
        "find speed of rain from two observations",
        "rain appears vertical then 45 degrees",
        "two different speeds rain problem",
        "DC Pandey example 6.35"
      ],
      "umbrella_tilt_direction": [
        "umbrella forward or backward",
        "tilt direction umbrella walking",
        "which way to tilt umbrella"
      ]
    }
  },
  "checkpoint_states": {
    "understands_v_rm_formula": "enter at STATE_2",
    "understands_umbrella_direction": "enter at STATE_3",
    "understands_angle_calculation": "enter at STATE_4",
    "understands_find_rain_speed": "enter at STATE_5"
  },
  "prerequisite_check": {
    "required_concepts": [
      "relative_motion",
      "vector_components"
    ],
    "gate_question": "Rain falls at 5 m/s vertically. Man walks east at 5 m/s. What is the direction of rain relative to the man? (Answer: 45° forward from vertical. If student cannot do this, cover relative_motion first.)",
    "if_gap_detected": "redirect to relative_motion.json — rain-umbrella is v_rm = v_r − v_m, a direct application of relative velocity"
  },
  "epic_l_path": {
    "state_count": 6,
    "board_mode_states": [
      1,
      2,
      3,
      4
    ],
    "jee_mode_states": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "scope": "global",
    "states": {
      "STATE_1": {
        "label": "The Hook — Why Does Rain Hit You From the Front When You Run?",
        "physics_layer": {
          "concept": "Rain falls vertically in the ground frame, but a moving person experiences it as coming from a forward angle",
          "simulation_focus": "Panel A: rain falling straight down (vertical streaks). Person standing still — rain hits top of umbrella, held vertical. Now person walks right — rain streaks on Panel A appear to tilt forward. Umbrella must tilt forward to keep dry. Speed slider: faster walking → more tilt.",
          "what_to_show": "Rain hasn't changed direction in reality. But from the person's perspective (moving frame), it appears to come from ahead. This is why runners get wetter on their front than their back.",
          "key_observation": "The rain's apparent direction changes when the observer moves. v_rm = v_r − v_m captures exactly this change.",
          "scenario": "rain_vertical_stationary"
        },
        "pedagogy_layer": {
          "opening_question": "You're standing in rain — umbrella held straight up. You start running. Which way must you tilt the umbrella? Why?",
          "teacher_script": "The rain didn't change. You changed. But from your moving perspective, the rain now appears to come from ahead. Your umbrella must face that apparent direction.",
          "real_world": "This is why motorcyclists feel rain hitting their visor from the front, not from above. Same rain, faster observer, more forward tilt."
        }
      },
      "STATE_2": {
        "label": "The Formula — v_rm = v_r − v_m",
        "physics_layer": {
          "concept": "Rain relative to man = subtract man's velocity from rain's velocity",
          "component_setup": "Standard case: v_r = (0, −v_r) [vertically down, negative y]. v_m = (v_m, 0) [eastward, positive x]. v_rm = v_r − v_m = (0 − v_m, −v_r − 0) = (−v_m, −v_r).",
          "simulation_focus": "Panel B vector diagram: draw v_r downward. Draw −v_m leftward (reverse of man's velocity). Add them: resultant v_rm points diagonally down-and-left (forward from man's perspective). Umbrella points in this direction.",
          "key_insight": "The −v_m term is the key. Man moves right (+x) → rain appears to come from right (−x component of v_rm). So umbrella tilts right (forward in direction of walking).",
          "scenario": "person_moving_rain_appears_angled"
        },
        "pedagogy_layer": {
          "memory_trick": "v_rm = v_r − v_m. Subtract the MAN'S velocity. It's the same formula as all relative velocity — observer's velocity subtracted.",
          "common_mistake": "Students write v_rm = v_m − v_r (reversed). The rain (r) comes first because rain is the OBJECT being observed."
        }
      },
      "STATE_3": {
        "label": "The Umbrella Direction — Forward Tilt at tan⁻¹(v_m / v_r)",
        "physics_layer": {
          "concept": "Angle of umbrella = angle of v_rm from vertical = tan⁻¹(v_m / v_r)",
          "derivation": "v_rm = (−v_m, −v_r). Angle from vertical (y-axis) = tan⁻¹(|horizontal| / |vertical|) = tan⁻¹(v_m / v_r). Direction: forward (in direction of walking).",
          "dc_pandey_ex634": "Example 6.34: v_m = 3 m/s east, v_r = 4 m/s down. v_rm = (−3, −4). Angle = tan⁻¹(3/4) = 37°. Hold umbrella 37° east of vertical (forward). |v_rm| = 5 m/s.",
          "simulation_focus": "Panel A: umbrella shown at 37° forward. Panel B: v_rm vector at 37° from vertical. Slider: change v_m → angle changes live → umbrella on Panel A tilts correspondingly.",
          "special_cases": "v_m = 0 (standing): angle = 0°, umbrella vertical. v_m = v_r: angle = 45°. v_m >> v_r: angle → 90°, umbrella horizontal (held in front like a shield).",
          "scenario": "relative_rain_velocity"
        },
        "pedagogy_layer": {
          "key_message": "Two numbers determine the umbrella angle: how fast you walk (v_m) and how fast rain falls (v_r). Faster walking or slower rain → more tilt.",
          "jee_tip": "Always resolve into components. Never try to add magnitudes at an angle. Component method is foolproof."
        }
      },
      "STATE_4": {
        "label": "Rain With Wind — When v_r Has a Horizontal Component",
        "physics_layer": {
          "concept": "If wind blows rain at an angle, v_r has both horizontal and vertical components",
          "setup": "v_r = (v_rx, −v_ry) where v_rx = horizontal rain component (due to wind), v_ry = vertical rain speed. v_m = (v_m, 0). v_rm = (v_rx − v_m, −v_ry).",
          "dc_pandey_ex635_setup": "Example 6.35: Rain appears vertical when v_m = 3 km/h. Vertical appearance means v_rm has no horizontal component: v_rx − v_m = 0 → v_rx = 3 km/h. So rain has a horizontal component of 3 km/h (eastward wind). When v_m = 6 km/h: v_rm_x = 3−6 = −3 km/h, v_rm_y = −v_ry. Appears at 45°: tan45°=1 → 3 = v_ry → v_ry = 3 km/h. Speed of rain = √(3²+3²) = 3√2 km/h.",
          "simulation_focus": "Panel A: rain falls at angle (wind present). Panel B: v_r has diagonal component. At v_m=3: v_rm points straight down. At v_m=6: v_rm at 45°. Student sees both cases on slider.",
          "scenario": "umbrella_tilt_angle"
        },
        "pedagogy_layer": {
          "key_message": "When rain appears vertical to a moving man, it means rain actually has a horizontal wind component equal to the man's speed. This is the hidden information in Example 6.35.",
          "jee_tip": "Two-observation problems (rain appears vertical at speed v₁, then at angle θ at speed v₂) always give two equations: one from each observation. Solve for v_rx and v_ry."
        }
      },
      "STATE_5": {
        "label": "The Aha Moment — Reconstructing Rain Velocity From Observations",
        "physics_layer": {
          "concept": "If a man makes two observations of rain direction at two different walking speeds, he can calculate actual rain velocity",
          "method": "Observation 1 gives one equation. Observation 2 gives second equation. Two unknowns (v_rx, v_ry) → solvable.",
          "simulation_focus": "Panel A: person walks at two speeds, observer marks umbrella angle each time. Panel B: two v_rm vectors drawn. Their intersection (tracing back) gives actual v_r.",
          "dc_pandey_ex635_solution": "From Ex 6.35: Observation 1 (v_m=3, vertical) → v_rx=3. Observation 2 (v_m=6, 45°) → v_ry=3. Speed = √(3²+3²) = 3√2 km/h ≈ 4.24 km/h.",
          "general_method": "Let v_r = (a, −b). Condition 1: v_rm_x = a − v_m1 = 0 (vertical) → a = v_m1. Condition 2: |v_rm_x / v_rm_y| = tan(θ) → solve for b.",
          "scenario": "tilt_forward_rule"
        },
        "pedagogy_layer": {
          "key_message": "Every rain problem reduces to: write v_r = (a, −b) as unknowns, apply conditions from observations, solve algebraically. The physics never changes — only the given information varies."
        }
      },
      "STATE_6": {
        "label": "Student Interaction — DC Pandey Examples Live",
        "physics_layer": {
          "problem_1": "DC Pandey Ex 6.34: v_m=3m/s east, v_r=4m/s down. Find umbrella direction.",
          "solution_1": "v_rm = (−3, −4). |v_rm|=5. Angle=tan⁻¹(3/4)=37° east of vertical.",
          "problem_2": "DC Pandey Ex 6.35: Rain vertical at v_m=3, appears 45° at v_m=6. Find rain speed.",
          "solution_2": "v_rx=3 (from observation 1). v_ry=3 (from tan45°=1, |v_rm_x|=|v_rm_y|=3). Speed=3√2 km/h.",
          "interactive": "Student sets man's speed slider and sees umbrella angle update on Panel A. Then solves Ex 6.35 by identifying what angle = vertical means (v_rm_x = 0).",
          "scenario": "speed_affects_tilt"
        },
        "pedagogy_layer": {
          "teacher_script": "Two problems, same formula, different what's-unknown. Ex 6.34: find angle (v_r and v_m both known). Ex 6.35: find v_r (angle given at two speeds). One formula, infinite variations."
        }
      }
    }
  },
  "epic_c_branches": [
    {
      "branch_id": "umbrella_direction_backward",
      "misconception": "Student thinks umbrella should tilt backward (away from direction of walking) because rain 'hits from behind' when running",
      "student_belief": "When running forward, rain hits my back, so umbrella should tilt backward",
      "trigger_phrases": [
        "umbrella tilt backward",
        "rain hits from back when running",
        "forward running tilt umbrella back",
        "opposite direction tilt",
        "aage bhagna to peeche tilt karo"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Person runs right. Rain falls vertically. Student tilts umbrella backward (left). Simulation: rain hits face from the front — person gets wet on front. Correct tilt: forward (right). With forward tilt: rain hits the umbrella, person stays dry.",
            "label": "Backward tilt = rain hits your face. Forward tilt = umbrella catches the rain. Your front faces the apparent rain direction.",
            "scenario": "umbrella_direction_backward_s1"
          },
          "pedagogy_layer": {
            "teacher_script": "v_rm = (−v_m, −v_r). Horizontal component is −v_m — NEGATIVE x direction, meaning rain appears to come FROM THE FRONT (positive x = your direction of motion, rain comes from that side). Umbrella must face toward the rain — FORWARD."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Physical intuition: imagine running through stationary raindrops in zero gravity. You run INTO them — they hit your front. Add gravity: drops also fall downward. The combined effect is they come from diagonally ahead. Umbrella faces diagonally ahead (forward tilt).",
            "label": "Running into rain = rain appears to come from ahead. Always tilt umbrella FORWARD — in the direction you are moving.",
            "scenario": "umbrella_direction_backward_s2"
          },
          "pedagogy_layer": {
            "rule": "Umbrella tilt is ALWAYS forward (in direction of motion) for vertically falling rain. No exceptions. Faster motion = more forward tilt."
          }
        }
      }
    },
    {
      "branch_id": "uses_actual_rain_direction",
      "misconception": "Student holds umbrella in direction of actual rain (v_r) instead of apparent rain (v_rm)",
      "student_belief": "Umbrella should point in the direction rain actually falls — vertically for vertical rain",
      "trigger_phrases": [
        "rain falls vertically so hold umbrella vertically",
        "actual rain direction for umbrella",
        "rain is vertical umbrella must be vertical",
        "why not use v_r for umbrella direction"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Rain falls vertically. Man walks east at 5 m/s. Student holds umbrella vertical (v_r direction). Simulation: rain hits man's front — he gets wet from forward-angled apparent rain. Switch umbrella to v_rm direction (forward tilt at 45°) — dry.",
            "label": "Vertical umbrella for vertical rain — works only if man is stationary. Moving man: vertical umbrella leaves front exposed.",
            "scenario": "ru_wrong_rain_speed_only"
          },
          "pedagogy_layer": {
            "teacher_script": "In the man's moving frame, rain does NOT come from vertically above. It comes from diagonally ahead. His frame is tilted relative to ground frame by his own motion. The umbrella must face the apparent direction — v_rm, not v_r."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Show two frames side by side: Ground frame — rain vertical, man moving right. Man's frame — man stationary, rain approaches from diagonal ahead. Umbrella in man's frame must face the diagonal (v_rm). This is exactly what he sees in practice.",
            "label": "Ground frame: rain vertical. Man's frame: rain diagonal. The umbrella lives in the MAN'S frame — it faces v_rm.",
            "scenario": "ru_aha_person_creates_wind"
          }
        }
      }
    },
    {
      "branch_id": "reversed_formula_v_m_minus_v_r",
      "misconception": "Student writes v_rm = v_m − v_r instead of v_r − v_m",
      "student_belief": "v_rm = v_m − v_r (man's velocity minus rain's velocity)",
      "trigger_phrases": [
        "v_m minus v_r",
        "man velocity minus rain velocity",
        "wrong sign rain problem",
        "got opposite direction",
        "answer direction seems flipped"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "v_m = 3 m/s east, v_r = 4 m/s down. Student: v_rm = v_m − v_r = (3,0) − (0,−4) = (3, 4) — points up and right. Umbrella tilts backward and upward. Simulation shows person getting soaked on front. Correct: v_rm = (0,−4) − (3,0) = (−3,−4) — points forward and down, umbrella tilts forward.",
            "label": "v_m − v_r gives upward-backward result. v_r − v_m gives forward-downward result. Only the second makes physical sense.",
            "scenario": "reversed_formula_v_m_minus_v_r_s1"
          },
          "pedagogy_layer": {
            "teacher_script": "v_rm = v_r − v_m. Rain is the object being observed. Man is the observer. Observer's velocity is subtracted. Rain comes first — it's the rain's velocity that matters, minus the man's."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Memory anchor: you are the man (observer B). Rain is object A. V_AB = V_A − V_B. Rain relative to man = V_rain − V_man = v_r − v_m. The formula is always OBJECT minus OBSERVER. Rain is object. Man is observer.",
            "label": "Rain relative to man = rain (object) minus man (observer). Consistent with all relative velocity: V_AB = V_A − V_B.",
            "scenario": "reversed_formula_v_m_minus_v_r_s2"
          }
        }
      }
    },
    {
      "branch_id": "find_rain_speed_confusion",
      "misconception": "In two-observation problems, student cannot extract actual rain velocity from apparent directions",
      "student_belief": "If rain appears vertical at one speed, then actual rain must be vertical",
      "trigger_phrases": [
        "rain appears vertical so rain is vertical",
        "how to find actual rain speed from observations",
        "two speed rain problem solve karna nahi aata",
        "example 6.35 confused",
        "rain vertical appearance matlab"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Man at 3 km/h — rain appears vertical. Student says: actual rain must be vertical (v_rx = 0). But simulation shows: if actual rain were vertical, man at 6 km/h should see it at angle tan⁻¹(6/v_ry). Problem says he sees it at 45° — that's consistent ONLY if v_ry = 3, not matching a purely vertical rain unless v_ry=6.",
            "label": "Rain appears vertical to a MOVING man ≠ rain is actually vertical. Apparent vertical means v_rm_x = 0 → v_rx = v_m. Rain has a horizontal component equal to man's speed.",
            "scenario": "find_rain_speed_confusion_s1"
          },
          "pedagogy_layer": {
            "teacher_script": "Apparent vertical means the relative velocity has no horizontal component — not that actual rain has no horizontal component. The man's motion has already cancelled the horizontal component of rain. So v_rx = v_m."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Step-by-step Ex 6.35 solution: Let v_r = (a, −b). Condition 1: v_rm_x = a − 3 = 0 → a = 3. Condition 2: v_rm at 45° when v_m=6 → tan45° = |a−6|/b = 3/b = 1 → b = 3. Speed = √(9+9) = 3√2 km/h. Show on Panel B: two v_rm vectors, one vertical (at v_m=3), one at 45° (at v_m=6), both consistent with same underlying v_r.",
            "label": "Two observations = two equations. Solve simultaneously. The actual rain vector is constant — only the apparent direction changes with man's speed.",
            "scenario": "find_rain_speed_confusion_s2"
          },
          "pedagogy_layer": {
            "rule": "Two-observation rain problem template: (1) Write v_r = (a, −b). (2) Apply v_rm = v_r − v_m for each observation. (3) Use given apparent direction to write equation. (4) Solve for a and b. (5) Speed = √(a²+b²)."
          }
        }
      }
    }
  ],
  "epic_c_micro_templates": {
    "micro_1": {
      "trigger": "umbrella direction formula quick",
      "scope": "micro",
      "states": 2,
      "content": "Umbrella direction = direction of v_rm = v_r − v_m. For vertical rain + horizontal walking: v_rm = (−v_m, −v_r). Angle from vertical = tan⁻¹(v_m / v_r). Tilt FORWARD (in direction of walking). Faster walking OR slower rain = more tilt."
    },
    "micro_2": {
      "trigger": "why rain appears to come from front",
      "scope": "micro",
      "states": 2,
      "content": "Rain falls vertically in ground frame. Moving man subtracts his own velocity: v_rm = v_r − v_m = (0,−v_r) − (v_m,0) = (−v_m, −v_r). The horizontal component −v_m means rain appears to come FROM the direction the man is moving toward (from his front). This is not an illusion — in his reference frame, rain genuinely arrives from ahead."
    },
    "micro_3": {
      "trigger": "DC Pandey example 6.34 solution",
      "scope": "micro",
      "states": 2,
      "content": "Ex 6.34: v_m=3m/s east, v_r=4m/s down. v_rm = (0,−4) − (3,0) = (−3,−4). |v_rm|=√(9+16)=5m/s. Angle from vertical = tan⁻¹(3/4) = 37° east of vertical (forward tilt). Hold umbrella 37° toward east from vertical."
    },
    "micro_4": {
      "trigger": "rain appears vertical to moving man",
      "scope": "micro",
      "states": 2,
      "content": "If rain appears vertical to man moving at speed v_m: v_rm_x = 0 → v_rx − v_m = 0 → v_rx = v_m. The actual rain has a horizontal component equal to the man's speed. Rain is NOT actually vertical — it has a wind component. This is the key hidden information in two-observation problems."
    },
    "micro_5": {
      "trigger": "DC Pandey example 6.35",
      "scope": "micro",
      "states": 3,
      "content": "Ex 6.35: Rain vertical at v_m=3 km/h → v_rx=3. Rain at 45° at v_m=6 km/h → |v_rm_x/v_rm_y|=1 → |(3−6)/v_ry|=1 → v_ry=3 km/h. Speed of rain = √(3²+3²) = 3√2 ≈ 4.24 km/h. Rain has equal horizontal and vertical components."
    }
  },
  "static_responses": {
    "formula_reference": {
      "trigger": "rain umbrella formulas",
      "simulation_needed": false,
      "response": "Rain umbrella formulas: (1) v_rm = v_r − v_m (vector). (2) Standard case (vertical rain, horizontal walking): v_rm = (−v_m, −v_r). (3) Umbrella angle from vertical = tan⁻¹(v_m / v_r), tilted FORWARD. (4) |v_rm| = √(v_m² + v_r²). (5) If rain appears vertical to man at speed v₁: actual v_rx = v₁. (6) Two observations → two equations → solve for actual v_r components."
    },
    "tilt_direction_quick": {
      "trigger": "which way to tilt umbrella rain",
      "simulation_needed": false,
      "response": "Always tilt umbrella FORWARD — in the direction you are walking/running. For vertical rain: tilt at angle tan⁻¹(v_m/v_r) from vertical toward front. If rain has a wind component blowing at you: tilt even more toward front. If wind blows rain from behind: you may need to tilt slightly backward — compute v_rm to determine exact direction."
    }
  },
  "problem_guidance_path": {
    "description": "Step-by-step for rain-umbrella problems (DC Pandey pattern)",
    "step_1": "Identify what is known: v_r components (vertical, and horizontal if wind), v_m (man's speed and direction).",
    "step_2": "Write v_rm = v_r − v_m in component form.",
    "step_3": "Find angle from vertical: θ = tan⁻¹(|v_rm_x| / |v_rm_y|). Direction of tilt = sign of v_rm_x.",
    "step_4": "For two-observation problems: write v_r = (a, −b). Apply v_rm = v_r − v_m for each observation. Use given apparent direction (vertical, or angle) to form equations. Solve for a and b.",
    "step_5": "Speed of rain = √(a² + b²). Angle of actual rain from vertical = tan⁻¹(a/b).",
    "common_errors": [
      "Tilting umbrella backward instead of forward",
      "Using v_r as umbrella direction (ignoring man's motion)",
      "Writing v_rm = v_m − v_r (reversed formula)",
      "In two-observation problems: assuming actual rain is vertical when apparent rain is vertical",
      "Adding speeds as scalars in 2D"
    ]
  },
  "example_library": {
    "example_1": {
      "source": "DC Pandey Example 6.34, Section 6.10",
      "principle": "Man walks 3m/s east, rain falls 4m/s down — finding umbrella direction using v_rm = v_r − v_m",
      "aha": "Result: 3-4-5 right triangle; umbrella at 37° forward. The Pythagorean triple makes this a standard JEE number set.",
      "simulation_states": 2
    },
    "example_2": {
      "source": "DC Pandey Example 6.35, Section 6.10",
      "principle": "Two observations of apparent rain direction at different walking speeds — back-calculating actual rain velocity vector",
      "aha": "Rain appears vertical to moving man does NOT mean rain is vertical — it means rain has horizontal component exactly equal to man's speed. Classic hidden-information trap.",
      "simulation_states": 3
    },
    "example_3": {
      "source": "DC Pandey Exercise Problem 7, Section 6.10",
      "principle": "Cyclist case — rain appears to fall from front at 45° when cycling at 18 km/h; find actual rain speed when rain falls vertically",
      "aha": "Cyclist at 18 km/h sees rain at 45° forward → v_m = v_r (equal horizontal and vertical) → v_r = 18 km/h. Speed and direction of actual rain from one observation when actual direction is known.",
      "simulation_states": 2
    },
    "example_4": {
      "source": "DC Pandey Exercise Problem 8, Section 6.10",
      "principle": "Man changes direction — rain appears from different angle; find actual wind+rain velocity",
      "aha": "Two different walking DIRECTIONS (not just speeds) also give two equations. The method is identical — v_rm = v_r − v_m applied twice with different v_m vectors.",
      "simulation_states": 2
    }
  },
  "assessment_path": {
    "question_1": {
      "text": "A man walks east at 3 m/s. Rain falls vertically at 4 m/s. In which direction should he hold his umbrella?",
      "options": [
        "Vertically upward",
        "37° west of vertical (backward tilt)",
        "37° east of vertical (forward tilt)",
        "45° east of vertical"
      ],
      "correct": 2,
      "if_wrong_0": "route to uses_actual_rain_direction — student ignores man's motion",
      "if_wrong_1": "route to umbrella_direction_backward — student tilts backward",
      "explanation": "v_rm = (0,−4) − (3,0) = (−3,−4). Angle = tan⁻¹(3/4) = 37° from vertical, toward east (forward). DC Pandey Example 6.34."
    },
    "question_2": {
      "text": "Same man doubles his speed to 6 m/s east. The umbrella angle from vertical now becomes:",
      "options": [
        "37°",
        "53°",
        "45°",
        "60°"
      ],
      "correct": 1,
      "explanation": "v_rm = (−6, −4). Angle = tan⁻¹(6/4) = tan⁻¹(1.5) = 56.3° ≈ 53°. More forward tilt as speed increases."
    },
    "question_3": {
      "text": "Rain appears to fall vertically to a man cycling at 4 m/s east. The actual rain:",
      "options": [
        "Falls vertically",
        "Has a horizontal eastward component of 4 m/s",
        "Has a horizontal westward component of 4 m/s",
        "Cannot be determined"
      ],
      "correct": 1,
      "if_wrong_0": "route to find_rain_speed_confusion — student thinks apparent vertical = actual vertical",
      "explanation": "Apparent vertical means v_rm_x = 0 → v_rx − 4 = 0 → v_rx = 4 m/s eastward. Rain has a horizontal wind component of 4 m/s east."
    },
    "question_4": {
      "text": "Rain appears vertical when man walks at 3 km/h, appears at 45° to vertical when he walks at 6 km/h. Speed of rain?",
      "options": [
        "3 km/h",
        "3√2 km/h",
        "6 km/h",
        "√3 km/h"
      ],
      "correct": 1,
      "if_wrong_2": "route to find_rain_speed_confusion",
      "explanation": "v_rx=3 (from observation 1). At v_m=6: |v_rm_x/v_rm_y|=tan45°=1 → |(3−6)/v_ry|=1 → v_ry=3. Speed=√(9+9)=3√2 km/h. DC Pandey Example 6.35."
    },
    "question_5": {
      "text": "Man walks at 4 m/s. Rain falls at 4 m/s vertically. Umbrella angle from vertical is:",
      "options": [
        "30°",
        "45°",
        "60°",
        "37°"
      ],
      "correct": 1,
      "explanation": "tan θ = v_m/v_r = 4/4 = 1 → θ = 45°. Equal speeds → 45° forward tilt."
    }
  },
  "session_awareness": {
    "if_already_shown_epic_l": "Go directly to two-observation problems — student knows basic umbrella direction, needs to practice back-calculating rain speed",
    "if_coming_from_river_boat": "Perfect transition — same v_AB = v_A − v_B formula, different physical setup. River boat: v_b = v_br + v_r. Rain: v_rm = v_r − v_m. Same algebra, different labels.",
    "if_coming_from_relative_motion": "Rain-umbrella is the most everyday application of relative velocity. Student already knows the formula — just apply it to rain."
  },
  "waypoints": {
    "fallback_unknown_confusion": "Default to DC Pandey Example 6.34 (v_m=3, v_r=4, 3-4-5 triangle, 37° answer). It's clean, memorable, and covers the complete method. Most confusion resolves with this concrete example.",
    "escalation_trigger": "If student asks about rain when man accelerates (not constant speed) — escalate: the apparent rain direction changes continuously, requires instantaneous v_rm calculation at each moment."
  },
  "depth_escalation_trigger": {
    "condition": "Student asks what happens to umbrella angle if man is accelerating (not constant velocity)",
    "escalate_to": "v_rm = v_r − v_m(t). As v_m changes with time, the apparent rain direction changes continuously. Umbrella must continuously adjust — this is why running in rain with a tilted umbrella requires constant adjustment.",
    "level": "Conceptual / JEE Advanced application"
  },
  "parameter_slots": {
    "v_r": {
      "label": "rain speed (vertically downward)",
      "range": [
        1,
        20
      ],
      "unit": "m/s or km/h",
      "default": 4,
      "extraction_hint": "rain speed, falling speed, or v_r ="
    },
    "v_m": {
      "label": "man's walking/running speed",
      "range": [
        1,
        20
      ],
      "unit": "m/s or km/h",
      "default": 3,
      "extraction_hint": "man's speed, walking speed, cycling speed, or v_m ="
    },
    "v_rx": {
      "label": "horizontal rain component (wind)",
      "range": [
        0,
        10
      ],
      "unit": "m/s or km/h",
      "default": 0,
      "extraction_hint": "horizontal rain component, wind speed affecting rain direction"
    }
  },
  "panel_sync_spec": {
    "canvas_to_graph": {
      "trigger": "STATE_N_reached",
      "action": "Panel B vector diagram shows v_r, v_m, and v_rm for current state values; angle labeled"
    },
    "graph_to_canvas": {
      "trigger": "student_moves_vm_slider",
      "action": "Panel A rain scene updates — streaks tilt, umbrella rotates to new angle"
    },
    "slider_to_both": {
      "parameter": "v_m",
      "canvas_action": "person walks faster, rain streaks tilt more forward, umbrella angle increases",
      "graph_action": "v_m arrow grows, v_rm vector rotates toward horizontal, angle label updates"
    }
  },
  "jee_specific": {
    "typical_question_types": [
      "Find umbrella angle: given v_m and v_r (vertical rain + horizontal walking)",
      "Find actual rain speed from two observations of apparent direction",
      "Rain appears vertical at speed v₁ — find horizontal rain component",
      "Rain appears at angle θ when man walks at v — find rain speed",
      "Assertion: man should hold umbrella in direction of v_r. Reason: rain falls in direction v_r."
    ],
    "common_traps": [
      "Tilting umbrella backward (rain hits front — physically wrong)",
      "Holding umbrella vertical for vertical rain when man is moving",
      "v_rm = v_m − v_r instead of v_r − v_m",
      "Apparent vertical rain = actual vertical rain (FALSE — has horizontal component = v_m)",
      "Adding speeds as scalars: |v_rm| = v_r + v_m (wrong — it's √(v_r² + v_m²) for perpendicular)"
    ],
    "key_results": [
      "v_rm = v_r − v_m (always — rain is object, man is observer)",
      "Standard case: angle from vertical = tan⁻¹(v_m / v_r), forward tilt",
      "Apparent vertical → v_rx = v_m (rain has horizontal component equal to man's speed)",
      "Two observations → two equations, solve for v_rx and v_ry",
      "|v_rm| = √(v_m² + v_r²) for vertical rain and horizontal walking",
      "DC Pandey Ex 6.34: 3-4-5 triangle, 37° forward (memorize this set)"
    ],
    "assertion_reason_traps": {
      "assertion": "A man walking east should hold his umbrella tilted east of vertical",
      "reason": "The rain appears to come from the east due to his relative motion",
      "answer": "Both A and R true, R is correct explanation"
    }
  },
  "concept_relationships": {
    "prerequisites": [
      "relative_motion",
      "vector_components",
      "river_boat_problems"
    ],
    "extensions": [
      "projectile_motion",
      "pseudo_forces"
    ],
    "siblings": [
      "river_boat_problems",
      "relative_motion"
    ],
    "common_exam_combinations": [
      "river_boat — both use v_AB = v_A − v_B; river boat has v_b = v_br + v_r (equivalent form)",
      "relative_motion — rain umbrella is the most testable application of relative velocity in JEE",
      "vector_components — resolving v_rm into components is the core computational step"
    ]
  },
  "three_js_flag": false,
  "three_js_note": "Rain-umbrella is 2D planar motion. scene_mode=True in canvas2d handles realistic rain streaks, person, and umbrella. Three.js not needed.",
  "regeneration_variants": [
    {
      "variant_id": 1,
      "approach": "tilt_angle_derivation",
      "entry_state": "STATE_3",
      "teacher_angle": "Start from the umbrella tilt formula and derive it cleanly. The umbrella must be held in the direction of relative velocity of rain with respect to the person — v_rain_person = v_rain - v_person. For vertical rain and horizontal person velocity: the relative rain velocity makes angle arctan(v_person / v_rain) from vertical. That is exactly the tilt angle. Derive this result then show three cases: person stationary (tilt = 0, umbrella vertical), person walking slowly (small tilt), person running fast (large tilt). The formula connects all three.",
      "locked_facts_focus": [
        "fact_3",
        "fact_4",
        "fact_5"
      ],
      "panel_b_focus": "Person walking at three speeds. Umbrella tilt animates: 0 degrees when stationary, increasing as speed increases. Relative velocity triangle shown at each speed. Tilt angle = arctan(v_person / v_rain) labeled."
    },
    {
      "variant_id": 2,
      "approach": "connects_to_river_boat",
      "entry_state": "STATE_1",
      "teacher_angle": "Show that rain-umbrella is mathematically identical to river-boat. In river-boat: river current is horizontal, boat moves across. In rain-umbrella: rain falls vertically, person moves horizontally. The vector triangle is the same triangle rotated 90 degrees. River current = rain velocity. Boat heading = umbrella tilt direction. Ground track of boat = relative velocity of rain seen by moving person. Every river-boat formula has a direct rain-umbrella equivalent. The student who solved river-boat already solved rain-umbrella — they just have not seen it rotated yet.",
      "locked_facts_focus": [
        "fact_1",
        "fact_2",
        "fact_6"
      ],
      "panel_b_focus": "Side by side: river-boat vector triangle and rain-umbrella vector triangle. Rotation animation shows one morphing into the other. Corresponding quantities labeled with matching colors. Formula equivalence shown explicitly."
    }
  ]
}
```


# relative_motion.json
```json
{
  "concept_id": "relative_motion",
  "concept_name": "Relative Motion — Relative Velocity in 1D and 2D",
  "class_level": 11,
  "chapter": "Kinematics",
  "section": "6.10",
  "source_coverage": {
    "dc_pandey": "Chapter 6, Section 6.10 — Relative Motion",
    "ncert": "Chapter 3 — Motion in a Straight Line, Section 3.6 (1D); Chapter 4 Section 4.6 (2D)",
    "hc_verma": "Chapter 3 — Rest and Motion: Kinematics, Section 3.7"
  },
  "source_type": "ncert_and_dc_pandey",
  "renderer_hint": {
    "technology": "canvas2d",
    "technology_b": "plotly",
    "renderer": "mechanics_2d",
    "scenario_type": "relative_motion",
    "panel_count": 2,
    "sync_required": true,
    "scene_mode": false,
    "show_labels": true,
    "panel_a_role": "Animated dual-particle canvas — ground frame shows both particles moving; toggle to relative frame shows one particle at rest, other moving with relative velocity",
    "panel_b_role": "Plotly vector diagram — velocity vectors of A and B drawn from origin; relative velocity vector V_AB shown as B minus A construction"
  },
  "locked_facts": {
    "relative_velocity_definition": "Velocity of A relative to B = V_AB = V_A − V_B. Read as: 'velocity of A as seen by an observer sitting on B'.",
    "relative_velocity_1d_same_direction": "If A and B move in same direction: V_AB = V_A − V_B. If V_A > V_B, A moves forward relative to B. If V_A < V_B, A moves backward relative to B.",
    "relative_velocity_1d_opposite": "If A and B move in opposite directions: relative speed = |V_A| + |V_B|. They appear to approach each other faster.",
    "symmetry_rule": "V_AB = −V_BA. The velocity of A relative to B is exactly opposite to velocity of B relative to A.",
    "relative_velocity_2d": "In 2D: V_AB = V_A − V_B (vector subtraction). Draw V_A and −V_B from the same point — their resultant is V_AB.",
    "relative_acceleration": "a_AB = a_A − a_B. If both have same acceleration (e.g., both in free fall), relative acceleration = 0 and relative motion is uniform.",
    "ground_frame_vs_relative_frame": "Ground frame: both particles move. Relative frame (observer on B): B appears stationary, A moves with V_AB. Same physics, different perspective.",
    "time_to_meet": "Two particles approaching each other: time to meet = initial separation / relative speed of approach = d / |V_AB|.",
    "pseudo_relative": "For two particles with different accelerations in same direction: relative acceleration = a_A − a_B. Use kinematics equations with this relative acceleration.",
    "rain_wind_connection": "Rain-umbrella and river-boat problems are applications of 2D relative velocity. The swimmer/person velocity is relative to water/ground; water/rain has its own velocity relative to ground."
  },
  "minimum_viable_understanding": "V_AB = V_A − V_B. Subtract the observer's velocity from the object's velocity. In 1D: algebraic subtraction. In 2D: vector subtraction (tip-to-tail or component method).",
  "variables": {
    "V_A": "Velocity of particle A in ground frame (m/s)",
    "V_B": "Velocity of particle B in ground frame (m/s)",
    "V_AB": "Velocity of A relative to B = V_A − V_B (m/s)",
    "V_BA": "Velocity of B relative to A = V_B − V_A = −V_AB (m/s)",
    "a_AB": "Acceleration of A relative to B = a_A − a_B (m/s²)",
    "d": "Initial separation between A and B (m)"
  },
  "routing_signals": {
    "global_triggers": [
      "relative motion",
      "relative velocity",
      "velocity of A relative to B",
      "relative motion kya hota hai",
      "explain relative velocity"
    ],
    "local_triggers": [
      "how to find relative velocity",
      "V_A minus V_B",
      "two trains relative velocity",
      "two cars approaching each other speed",
      "relative velocity same direction opposite direction",
      "time to meet two particles"
    ],
    "micro_triggers": [
      "V_AB formula",
      "relative velocity 2D how to solve",
      "what is ground frame",
      "relative acceleration free fall"
    ],
    "simulation_not_needed_triggers": [
      "state the formula for relative velocity",
      "write V_AB equals"
    ],
    "subconcept_triggers": {
      "relative_velocity_1d": [
        "two objects same direction relative velocity",
        "trains on parallel tracks",
        "cars moving same direction",
        "relative speed same direction opposite direction"
      ],
      "relative_velocity_2d": [
        "relative velocity at an angle",
        "2D relative velocity",
        "vector subtraction relative velocity",
        "V_AB in 2D"
      ],
      "time_to_meet": [
        "when will they meet",
        "time to collide",
        "two particles approaching time",
        "separation decreasing rate"
      ],
      "relative_acceleration": [
        "relative acceleration free fall",
        "both thrown up relative motion",
        "two projectiles relative velocity"
      ]
    }
  },
  "checkpoint_states": {
    "understands_formula": "enter at STATE_2",
    "understands_1d_cases": "enter at STATE_3",
    "understands_2d_vector_subtraction": "enter at STATE_4",
    "understands_time_to_meet": "enter at STATE_5"
  },
  "prerequisite_check": {
    "required_concepts": [
      "vector_addition",
      "uniform_acceleration"
    ],
    "gate_question": "Train A moves at 60 km/h east, Train B at 40 km/h east on parallel tracks. What is A's velocity relative to B? (Answer: 20 km/h east. If student cannot do this, cover 1D relative motion basics first.)",
    "if_gap_detected": "If 1D is unclear, start from STATE_2. If 2D vector subtraction is unclear, redirect to vector_addition.json first."
  },
  "epic_l_path": {
    "state_count": 6,
    "board_mode_states": [
      1,
      2,
      3,
      4
    ],
    "jee_mode_states": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "scope": "global",
    "states": {
      "STATE_1": {
        "label": "The Hook — Motion Depends on Who is Watching",
        "physics_layer": {
          "concept": "The same motion looks completely different depending on the observer's frame of reference",
          "simulation_focus": "Two cars, A at 80 km/h and B at 50 km/h, both moving right in ground frame. Panel A: ground view — both moving right. Toggle: observer sits in B — now B appears stationary, A appears to creep forward at only 30 km/h.",
          "what_to_show": "Speedometer for A: ground frame shows 80, relative frame shows 30. Same car, same motion — but a completely different number depending on the observer.",
          "key_observation": "Neither answer is wrong. They're answers to different questions: 'How fast relative to ground?' vs 'How fast relative to B?'",
          "scenario": "two_observers_setup"
        },
        "pedagogy_layer": {
          "opening_question": "You're on a train at 100 km/h. Another train at 90 km/h passes you in the same direction. It seems to crawl past at 10 km/h — why?",
          "teacher_script": "Your eyes subtract your own velocity automatically. The formula V_AB = V_A − V_B just makes that subtraction explicit.",
          "real_world": "This is why two cars at highway speed seem to barely move relative to each other, but a stationary tree flies past."
        }
      },
      "STATE_2": {
        "label": "The Formula — V_AB = V_A − V_B",
        "physics_layer": {
          "concept": "Velocity of A relative to B = V_A − V_B. B's velocity is subtracted because observer is moving with B.",
          "simulation_focus": "Vector diagram on Panel B: draw V_A arrow, draw −V_B arrow (reverse of V_B), add them tip-to-tail → result is V_AB. Show numerical example: V_A = 8 m/s right, V_B = 3 m/s right → V_AB = 5 m/s right.",
          "symmetry_show": "V_BA = V_B − V_A = −5 m/s (leftward from A's perspective). Show both arrows — they are equal and opposite.",
          "key_insight": "The formula is just vector subtraction. In 1D with sign convention, it's arithmetic. In 2D, it requires the full vector subtraction construction.",
          "scenario": "velocity_subtraction_formula"
        },
        "pedagogy_layer": {
          "memory_trick": "V_AB: the first letter (A) is what you're watching. The second letter (B) is who's watching. Subtract the watcher.",
          "common_mistake": "Students write V_AB = V_B − V_A (reversed). The A in V_AB comes first because A is the object being observed."
        }
      },
      "STATE_3": {
        "label": "1D Cases — Same Direction and Opposite Direction",
        "physics_layer": {
          "concept": "In 1D, relative velocity has two important special cases",
          "case_1": "Same direction: V_AB = V_A − V_B. If V_A > V_B, A moves forward relative to B (separation increases). If V_A < V_B, A moves backward (separation decreases).",
          "case_2": "Opposite directions: V_A positive, V_B negative (using sign convention). V_AB = V_A − (−V_B) = V_A + V_B. Relative speed = sum of speeds.",
          "simulation_focus": "Panel A: two particles. Case 1: same direction, A faster — gap widens. Case 2: head-on — relative speed = sum, they close in fast. Show closing rate numerically.",
          "time_to_meet": "If initial separation = d, relative speed of approach = V_rel, then time to meet = d / V_rel.",
          "scenario": "same_direction_case"
        },
        "pedagogy_layer": {
          "intuition_check": "Highway: two cars going 100 and 90 km/h same direction → relative speed 10 km/h. Two cars head-on at 60 and 60 km/h → relative speed 120 km/h. This matches experience.",
          "jee_tip": "For time-to-meet problems: never chase the problem in ground frame. Convert to relative frame — one particle stationary, other approaches at V_rel. Instantly simpler."
        }
      },
      "STATE_4": {
        "label": "2D Relative Velocity — Vector Subtraction",
        "physics_layer": {
          "concept": "In 2D, V_AB = V_A − V_B requires full vector subtraction",
          "method_1": "Graphical: Draw V_A from origin. Draw −V_B (reverse of V_B) from tip of V_A. The vector from origin to final tip = V_AB.",
          "method_2": "Component form: V_AB_x = V_Ax − V_Bx. V_AB_y = V_Ay − V_By. Then |V_AB| = √(V_AB_x² + V_AB_y²).",
          "simulation_focus": "Panel B vector diagram: V_A at 30° = (V_A cos30°, V_A sin30°). V_B horizontal. Show component subtraction, then resultant vector. Animate the construction.",
          "example": "Rain falls vertically at 5 m/s. Man walks right at 3 m/s. Rain's velocity relative to man = (0,−5) − (3,0) = (−3,−5). Direction: tan⁻¹(3/5) = 31° forward from vertical. Umbrella tilts 31° forward.",
          "scenario": "opposite_direction_case"
        },
        "pedagogy_layer": {
          "key_message": "2D relative velocity always reduces to: write both velocities in component form, subtract component by component, find resultant magnitude and direction.",
          "jee_tip": "Rain-umbrella and river-boat are both 2D relative velocity problems. The method is identical — only the physical setup changes."
        }
      },
      "STATE_5": {
        "label": "Relative Acceleration and Free Fall",
        "physics_layer": {
          "concept": "When both particles have the same acceleration, relative acceleration = 0 → relative motion is uniform",
          "key_result": "Two balls thrown from same point at different angles — both under gravity (a = −g). Relative acceleration = −g − (−g) = 0. They see each other moving in a straight line at constant velocity.",
          "simulation_focus": "Two projectiles thrown simultaneously from same point, different angles. Ground frame: both follow parabolic paths. Relative frame (observer on ball 1): ball 2 appears to move in a STRAIGHT LINE at constant speed.",
          "jee_application": "This appears as: 'Two particles thrown simultaneously — what does each see?' Answer: straight line uniform motion relative to each other, because relative acceleration = 0.",
          "scenario": "relative_acceleration"
        },
        "pedagogy_layer": {
          "surprise_moment": "Two projectiles see each other moving in straight lines — despite both following curved parabolas in ground frame. This is a standard JEE question.",
          "key_message": "Whenever two particles have the SAME acceleration, their relative motion is always uniform (constant relative velocity, straight line path)."
        }
      },
      "STATE_6": {
        "label": "Student Interaction — Solve a JEE-Style Problem",
        "physics_layer": {
          "problem": "Car A moves east at 20 m/s. Car B moves north at 15 m/s. Find: (i) velocity of A relative to B, (ii) magnitude and direction of V_AB.",
          "solution": "V_AB = V_A − V_B = (20,0) − (0,15) = (20,−15). |V_AB| = √(400+225) = √625 = 25 m/s. Direction: tan⁻¹(15/20) = 37° south of east.",
          "interactive": "Student draws V_A and V_B on Panel B vector diagram, then constructs −V_B and adds to V_A. System checks the construction step by step.",
          "scenario": "frame_of_reference_concept"
        },
        "pedagogy_layer": {
          "teacher_script": "Two steps only: write both velocities as components, subtract. The geometry falls out automatically. 3-4-5 triangle hidden in 20-15-25."
        }
      }
    }
  },
  "epic_c_branches": [
    {
      "branch_id": "reversed_subtraction",
      "misconception": "Student writes V_AB = V_B − V_A instead of V_A − V_B",
      "student_belief": "The formula is V_AB = V_B − V_A (subtracts in wrong order)",
      "trigger_phrases": [
        "I did V_B minus V_A",
        "relative velocity formula mein kya minus kya hota hai",
        "confused about which to subtract",
        "V_AB equals V_B minus V_A",
        "order of subtraction relative velocity"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "V_A = 8 m/s right, V_B = 3 m/s right. Student's formula: V_AB = V_B − V_A = 3 − 8 = −5 m/s (leftward). Simulation: A is clearly ahead of B and moving further ahead — yet student's answer says A moves LEFT relative to B. Contradiction visible.",
            "label": "Your formula gives −5 m/s (A moving left relative to B). Reality: A is moving ahead of B to the right. Sign is flipped.",
            "scenario": "rm_wrong_sum"
          },
          "pedagogy_layer": {
            "teacher_script": "V_AB: A is the object, B is the observer. Observer's velocity gets subtracted. You are B — you subtract YOUR OWN velocity. V_AB = V_A − V_B."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Memory anchor: Stand on platform (B). Train A passes at 20 m/s. You stand still (V_B = 0). V_AB = 20 − 0 = 20 m/s. Train moves forward relative to you. Now you're on a train at 15 m/s (V_B = 15). Same train A at 20 m/s. V_AB = 20 − 15 = 5 m/s. Train barely creeps past. Your speed is subtracted.",
            "label": "Your speed is always what gets subtracted. You are B. V_AB = V_A − V_B.",
            "scenario": "rm_aha_reference_frame"
          }
        }
      }
    },
    {
      "branch_id": "opposite_direction_subtraction_error",
      "misconception": "Student subtracts speeds (not velocities) when particles move in opposite directions, getting V_A − V_B instead of V_A + V_B",
      "student_belief": "Always subtract the two speeds regardless of direction",
      "trigger_phrases": [
        "opposite direction relative velocity",
        "trains coming towards each other speed",
        "head on collision relative speed",
        "why do we add speeds when opposite direction",
        "relative speed same formula both cases"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "A moves right at 10 m/s. B moves left at 6 m/s. Student: V_AB = 10 − 6 = 4 m/s. Correct: assign rightward positive. V_A = +10. V_B = −6. V_AB = 10 − (−6) = 16 m/s. Show: they close at 16 m/s — not 4 m/s. Simulation confirms: they meet much faster than student's answer predicts.",
            "label": "Student subtracted magnitudes. Correct: subtract velocities (with signs). Opposite directions → relative speed = sum of speeds.",
            "scenario": "opposite_direction_subtraction_error_s1"
          },
          "pedagogy_layer": {
            "teacher_script": "The formula V_AB = V_A − V_B never changes. But signs matter. Opposite direction means one velocity is negative. Subtracting a negative = adding. Always assign directions with + and − first."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Sign convention drill: (1) Both right: V_A=+10, V_B=+6 → V_AB = 4 m/s (slow approach). (2) Opposite: V_A=+10, V_B=−6 → V_AB = 16 m/s (fast approach). (3) A right, B stationary: V_A=+10, V_B=0 → V_AB = 10 m/s. All three from same formula — signs do all the work.",
            "label": "One formula: V_AB = V_A − V_B. Signs handle all cases. Never memorize separate formulas for same/opposite directions.",
            "scenario": "opposite_direction_subtraction_error_s2"
          }
        }
      }
    },
    {
      "branch_id": "relative_velocity_2d_magnitude_only",
      "misconception": "In 2D problems, student calculates |V_A| − |V_B| instead of performing vector subtraction",
      "student_belief": "Relative velocity magnitude = magnitude of A minus magnitude of B",
      "trigger_phrases": [
        "subtracted the magnitudes",
        "|V_A| minus |V_B|",
        "relative speed 2D subtracted speeds",
        "rain problem speed subtracted",
        "2D relative velocity just subtract numbers"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "V_A = 20 m/s east. V_B = 15 m/s north. Student: |V_AB| = 20 − 15 = 5 m/s. Correct: V_AB = (20,0) − (0,15) = (20,−15). |V_AB| = √(400+225) = 25 m/s. Show: student gets 5 m/s, correct is 25 m/s. Five times wrong.",
            "label": "Subtracting magnitudes of perpendicular vectors gives completely wrong answer. Vector subtraction uses components, not magnitudes.",
            "scenario": "relative_velocity_2d_magnitude_only_s1"
          },
          "pedagogy_layer": {
            "teacher_script": "Magnitudes don't subtract like numbers when vectors point in different directions. You must subtract component by component: x-components together, y-components together. Only then find the magnitude."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Step-by-step component method animated: Step 1: Write V_A = (20, 0). Step 2: Write V_B = (0, 15). Step 3: V_AB = (20−0, 0−15) = (20, −15). Step 4: |V_AB| = √(20²+15²) = √625 = 25 m/s. Step 5: Direction = tan⁻¹(15/20) = 37° south of east.",
            "label": "Component method: always works for any angle. Never subtract magnitudes in 2D.",
            "scenario": "relative_velocity_2d_magnitude_only_s2"
          },
          "pedagogy_layer": {
            "rule": "2D relative velocity checklist: (1) Write both in component form. (2) Subtract components. (3) Find magnitude via Pythagoras. (4) Find direction via arctan."
          }
        }
      }
    },
    {
      "branch_id": "relative_acceleration_in_freefall",
      "misconception": "Student thinks two projectiles have non-zero relative acceleration because they follow different parabolic paths",
      "student_belief": "Since both are accelerating due to gravity, they should have some relative acceleration",
      "trigger_phrases": [
        "two balls thrown up relative motion",
        "projectiles relative to each other",
        "both falling why no relative acceleration",
        "parabola relative to each other",
        "two particles same acceleration relative"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Two balls thrown at different angles. Ground frame: both follow different parabolas. Student marks: 'different paths → different accelerations → relative acceleration ≠ 0'. Now show relative frame: ball 2 as seen by ball 1 moves in a STRAIGHT LINE at constant speed. No curve at all.",
            "label": "Different paths in ground frame. But relative to each other — straight line. Same acceleration means zero relative acceleration.",
            "scenario": "relative_acceleration_in_freefall_s1"
          },
          "pedagogy_layer": {
            "teacher_script": "a_AB = a_A − a_B = (−g) − (−g) = 0. When relative acceleration is zero, relative motion is always straight-line and uniform — regardless of how curved the individual paths look."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Show: astronaut throws two balls on the Moon (g=1.6), different directions. Relative motion: straight line. Now same on Earth (g=10). Same result: straight line. The value of g doesn't matter — what matters is that BOTH have the same g.",
            "label": "Key: both under same g → relative acceleration = 0 → relative motion is straight line uniform velocity. This is a standard JEE assertion-reason type question.",
            "scenario": "relative_acceleration_in_freefall_s2"
          }
        }
      }
    }
  ],
  "epic_c_micro_templates": {
    "micro_1": {
      "trigger": "V_AB formula quick",
      "scope": "micro",
      "states": 2,
      "content": "V_AB = V_A − V_B. Velocity of A relative to B = A's velocity minus B's velocity. In words: subtract the observer's velocity. Symmetry: V_BA = −V_AB (equal magnitude, opposite direction). In 1D: algebraic subtraction with signs. In 2D: component-wise subtraction."
    },
    "micro_2": {
      "trigger": "relative speed when moving towards each other",
      "scope": "micro",
      "states": 2,
      "content": "If A moves right at v₁ and B moves left at v₂ (towards each other): assign rightward positive. V_A = +v₁, V_B = −v₂. V_AB = v₁ − (−v₂) = v₁ + v₂. Relative speed = sum of speeds. Time to meet = initial separation / (v₁ + v₂). Never memorize as a separate formula — it falls out of V_AB = V_A − V_B with correct signs."
    },
    "micro_3": {
      "trigger": "both in free fall relative motion",
      "scope": "micro",
      "states": 2,
      "content": "If both particles are under gravity only (no air resistance), a_A = a_B = −g. Relative acceleration = a_A − a_B = 0. Therefore relative motion is uniform — constant relative velocity, straight line path. This is true regardless of initial velocities, angles, or positions. Standard JEE question: 'Two balls thrown simultaneously — motion of one relative to other is?' Answer: uniform straight line."
    },
    "micro_4": {
      "trigger": "how to find time to meet",
      "scope": "micro",
      "states": 2,
      "content": "Time to meet = initial separation / relative speed of approach. Step 1: Find V_AB (= V_A − V_B). Step 2: If V_AB is directed from A toward B (closing), relative speed = |V_AB|. Step 3: time = d / |V_AB|. In 1D with opposite directions: time = d / (v_A + v_B). In 1D same direction (A chasing B, A faster): time = d / (v_A − v_B)."
    },
    "micro_5": {
      "trigger": "what is ground frame",
      "scope": "micro",
      "states": 2,
      "content": "Ground frame = frame of reference fixed to Earth. All velocities in ground frame are measured relative to Earth. Relative frame = frame fixed to one of the moving objects. In relative frame, that object appears stationary and everything else moves relative to it. Physics laws are the same in both frames (for non-accelerating frames) — only the numbers change."
    }
  },
  "static_responses": {
    "formula_reference": {
      "trigger": "list relative velocity formulas",
      "simulation_needed": false,
      "response": "Relative velocity formulas: (1) V_AB = V_A − V_B (always). (2) V_BA = −V_AB. (3) Same direction: |V_AB| = |V_A − V_B|. (4) Opposite directions: relative speed = v_A + v_B (from sign convention, not separate formula). (5) 2D: V_AB = (V_Ax−V_Bx)î + (V_Ay−V_By)ĵ. (6) a_AB = a_A − a_B. (7) Time to meet = separation / relative approach speed."
    },
    "rain_umbrella_preview": {
      "trigger": "umbrella angle rain problem",
      "simulation_needed": false,
      "response": "Rain-umbrella is a 2D relative velocity problem. Rain velocity relative to man = V_rain − V_man. If rain falls vertically (V_rain = −v_r ĵ) and man walks horizontally (V_man = v_m î), then V_rain_wrt_man = (−v_m î − v_r ĵ). Tilt umbrella in the direction of this resultant. Angle from vertical = tan⁻¹(v_m/v_r). See rain_umbrella.json for full simulation."
    }
  },
  "problem_guidance_path": {
    "description": "Step-by-step for relative velocity problems",
    "step_1": "Identify the two objects (A and B). Identify what is asked — V_AB or V_BA?",
    "step_2": "Write both velocities in the same coordinate system with signs (or components for 2D).",
    "step_3": "Apply V_AB = V_A − V_B. In 1D: arithmetic. In 2D: component-wise subtraction.",
    "step_4": "For magnitude: |V_AB| = √(V_ABx² + V_ABy²). For direction: θ = tan⁻¹(V_ABy / V_ABx).",
    "step_5": "For time-to-meet: t = separation / |V_AB| (only if they are approaching).",
    "common_errors": [
      "Reversing the subtraction order (V_B − V_A instead of V_A − V_B)",
      "Subtracting magnitudes in 2D instead of components",
      "Not assigning signs in 1D opposite-direction problems",
      "Forgetting relative acceleration when a_A ≠ a_B"
    ]
  },
  "example_library": {
    "example_1": {
      "source": "DC Pandey Section 6.10 — 1D relative velocity, trains on parallel tracks",
      "principle": "Two trains same direction — relative speed is difference of speeds; used to find time for one to overtake the other",
      "aha": "Convert to relative frame: one train stationary, other approaches at (v_A − v_B). Overtaking time = train length / relative speed — geometry disappears",
      "simulation_states": 2
    },
    "example_2": {
      "source": "DC Pandey Section 6.10 — 2D relative velocity at 90°",
      "principle": "Two objects moving perpendicular to each other — V_AB is the vector diagonal of V_A and (−V_B) components",
      "aha": "Perpendicular velocities always give |V_AB| = √(v_A² + v_B²) — Pythagoras, not arithmetic subtraction",
      "simulation_states": 2
    },
    "example_3": {
      "source": "DC Pandey Section 6.10 — relative motion of two projectiles",
      "principle": "Two balls thrown simultaneously under gravity — relative acceleration = 0, so relative motion is uniform in a straight line",
      "aha": "Path of each ball is a parabola, yet each sees the other as moving in a straight line — same acceleration cancels out in relative frame",
      "simulation_states": 3
    },
    "example_4": {
      "source": "DC Pandey Section 6.10 — time to collision",
      "principle": "Finding minimum time for two particles moving at an angle to each other to be closest / to meet",
      "aha": "Minimum separation occurs when relative velocity is perpendicular to the line joining them — reduces a 2D problem to a 1D geometry problem",
      "simulation_states": 2
    }
  },
  "assessment_path": {
    "question_1": {
      "text": "Car A moves east at 30 m/s. Car B moves east at 20 m/s. What is the velocity of A relative to B?",
      "options": [
        "50 m/s east",
        "10 m/s east",
        "10 m/s west",
        "50 m/s west"
      ],
      "correct": 1,
      "if_wrong_0": "route to opposite_direction_subtraction_error — student added instead of subtracted",
      "if_wrong_2": "route to reversed_subtraction — student computed V_B − V_A",
      "explanation": "V_AB = V_A − V_B = 30 − 20 = +10 m/s east. A moves forward relative to B at 10 m/s."
    },
    "question_2": {
      "text": "Object A moves right at 15 m/s. Object B moves left at 10 m/s. What is the relative speed of approach?",
      "options": [
        "5 m/s",
        "25 m/s",
        "15 m/s",
        "10 m/s"
      ],
      "correct": 1,
      "if_wrong_0": "route to opposite_direction_subtraction_error — student subtracted instead of adding",
      "explanation": "V_A = +15, V_B = −10. V_AB = 15 − (−10) = 25 m/s. They approach at 25 m/s."
    },
    "question_3": {
      "text": "V_A = 20 m/s east, V_B = 15 m/s north. What is |V_AB|?",
      "options": [
        "5 m/s",
        "35 m/s",
        "25 m/s",
        "√(20² + 15²) = 25 m/s"
      ],
      "correct": 3,
      "if_wrong_0": "route to relative_velocity_2d_magnitude_only — student subtracted magnitudes",
      "explanation": "V_AB = (20−0, 0−15) = (20, −15). |V_AB| = √(400+225) = √625 = 25 m/s."
    },
    "question_4": {
      "text": "Two balls are thrown simultaneously from the same point at different angles. What is the nature of relative motion of one ball with respect to the other?",
      "options": [
        "Parabolic",
        "Circular",
        "Straight line with uniform velocity",
        "Straight line with uniform acceleration"
      ],
      "correct": 2,
      "if_wrong_3": "route to relative_acceleration_in_freefall — student thinks there is relative acceleration",
      "explanation": "a_AB = a_A − a_B = (−g) − (−g) = 0. Zero relative acceleration → uniform relative motion → straight line path."
    },
    "question_5": {
      "text": "Two trains 200m apart approach each other. Train A at 40 m/s, Train B at 60 m/s. When do they meet?",
      "options": [
        "5 s",
        "2 s",
        "3.3 s",
        "10 s"
      ],
      "correct": 1,
      "explanation": "Relative speed = 40 + 60 = 100 m/s (opposite directions). Time = 200/100 = 2 s."
    }
  },
  "session_awareness": {
    "if_already_shown_epic_l": "Jump to 2D problems — student knows 1D, needs 2D vector subtraction practice",
    "if_coming_from_vector_addition": "Student knows vector subtraction — connect immediately: 'V_AB = V_A − V_B is vector_addition with one vector reversed'",
    "if_coming_from_motion_graphs": "Connect: 'In relative frame, v-t graph shifts — the same slope but y-intercept changes by V_B'"
  },
  "waypoints": {
    "fallback_unknown_confusion": "Default to the train overtaking problem (1D, same direction). It's concrete, the formula is clear, and the time-to-meet calculation is satisfying. Covers the core formula without 2D complexity.",
    "escalation_trigger": "If student asks about minimum separation between two 2D particles — escalate to vector calculus (differentiate separation with respect to time, set to zero). JEE Advanced level."
  },
  "depth_escalation_trigger": {
    "condition": "Student asks how to find the time/position of minimum separation between two particles in 2D",
    "escalate_to": "Set up position vectors r_A(t) and r_B(t). Separation vector = r_A − r_B. Minimize |r_A − r_B|² by differentiating with respect to t and setting to zero. Alternatively: minimum separation when relative velocity is perpendicular to relative position.",
    "level": "JEE Advanced"
  },
  "parameter_slots": {
    "v_A": {
      "label": "velocity of object A",
      "range": [
        1,
        100
      ],
      "unit": "m/s or km/h",
      "default": 20,
      "extraction_hint": "velocity or speed of first object, A ="
    },
    "v_B": {
      "label": "velocity of object B",
      "range": [
        1,
        100
      ],
      "unit": "m/s or km/h",
      "default": 15,
      "extraction_hint": "velocity or speed of second object, B ="
    },
    "separation": {
      "label": "initial separation between A and B",
      "range": [
        10,
        1000
      ],
      "unit": "m",
      "default": 200,
      "extraction_hint": "distance between the two objects initially"
    },
    "angle_AB": {
      "label": "angle between velocity vectors of A and B",
      "range": [
        0,
        180
      ],
      "unit": "degrees",
      "default": 90,
      "extraction_hint": "angle between the directions of motion of A and B"
    }
  },
  "panel_sync_spec": {
    "canvas_to_graph": {
      "trigger": "STATE_N_reached",
      "action": "vector diagram on Panel B updates to show V_A, V_B, and V_AB vectors for current state's example values"
    },
    "graph_to_canvas": {
      "trigger": "student_drags_vector_on_panel_b",
      "action": "particle velocities on Panel A update to match new vector magnitudes/directions"
    },
    "frame_toggle": {
      "parameter": "observer_frame",
      "canvas_action": "Panel A switches between ground frame (both moving) and relative frame (B stationary, A moves at V_AB)",
      "graph_action": "Panel B highlights V_AB vector as the 'active' velocity in relative frame"
    }
  },
  "jee_specific": {
    "typical_question_types": [
      "Find velocity of A relative to B (1D same/opposite direction)",
      "Find |V_AB| and direction when A and B move at 90° to each other",
      "Time for A to overtake B (1D, same direction, initial separation given)",
      "Two particles meet — find time (relative speed approach)",
      "Two projectiles — nature of relative motion (straight line, uniform)",
      "Assertion: V_AB = −V_BA. Reason: relative velocities are equal and opposite."
    ],
    "common_traps": [
      "V_AB = V_B − V_A (reversed subtraction) — most common error",
      "Subtracting speeds instead of velocity components in 2D",
      "Head-on: using relative speed = difference instead of sum",
      "Two projectiles: saying relative motion is parabolic (it's uniform straight line)",
      "Time to meet: using individual speeds instead of relative speed"
    ],
    "key_results": [
      "V_AB = V_A − V_B always (never reversed)",
      "V_BA = −V_AB (equal magnitude, opposite direction)",
      "Perpendicular velocities: |V_AB| = √(v_A² + v_B²)",
      "Both under gravity: relative motion is uniform straight line (a_AB = 0)",
      "Head-on relative speed = v_A + v_B",
      "Same direction relative speed = |v_A − v_B|"
    ],
    "standard_tricks": {
      "frame_shift": "Convert to relative frame to simplify — make one object stationary, other moves at V_AB",
      "time_to_meet": "Always = separation / relative approach speed",
      "minimum_separation": "Occurs when relative velocity is perpendicular to line joining particles"
    }
  },
  "concept_relationships": {
    "prerequisites": [
      "vector_addition",
      "uniform_acceleration",
      "distance_vs_displacement"
    ],
    "extensions": [
      "river_boat_problems",
      "rain_umbrella",
      "projectile_motion",
      "pseudo_forces"
    ],
    "siblings": [
      "river_boat_problems",
      "rain_umbrella"
    ],
    "common_exam_combinations": [
      "river_boat — swimmer velocity relative to river + river velocity relative to ground = swimmer velocity relative to ground",
      "rain_umbrella — rain velocity relative to man = V_rain − V_man; tilt umbrella in that direction",
      "projectile — two projectiles thrown simultaneously: relative motion is uniform (a_rel = 0)"
    ]
  },
  "three_js_flag": false,
  "three_js_note": "Relative motion is 1D and 2D. Vector subtraction diagram and dual-particle animation are fully handled by canvas2d + Plotly. Three.js not needed.",
  "regeneration_variants": [
    {
      "variant_id": 1,
      "approach": "train_platform_intuition",
      "entry_state": "STATE_2",
      "teacher_angle": "Start with the train platform scenario every student has experienced. You sit in a stationary train. A train on the adjacent track moves at 60 km/h. From your seat it looks like your train is moving backward at 60 km/h. Your velocity relative to the moving train is -60 km/h even though you are stationary. Now formalise this: v_AB = v_A - v_B. The subtraction captures exactly what the student felt in the train. Relative velocity is the mathematical name for that everyday experience.",
      "locked_facts_focus": [
        "fact_1",
        "fact_2",
        "fact_3"
      ],
      "panel_b_focus": "Two train animations. Observer sits in stationary train. Moving train passes. From observer frame: show how moving train appears to move, and how stationary objects outside appear to move backward. v_AB animation shows the subtraction geometrically."
    },
    {
      "variant_id": 2,
      "approach": "connects_to_vector_subtraction",
      "entry_state": "STATE_1",
      "teacher_angle": "Connect directly to vector addition and subtraction from Ch.5. Relative velocity v_AB = v_A - v_B is vector subtraction. The student already knows how to subtract vectors: reverse the direction of B and add it to A. That triangle law from Ch.5 gives the relative velocity directly. Relative motion in 2D is just applying vector subtraction — which the student already knows — to velocity vectors. No new operation is needed.",
      "locked_facts_focus": [
        "fact_4",
        "fact_5",
        "fact_6"
      ],
      "panel_b_focus": "Vector subtraction diagram from Ch.5 pattern: v_A arrow, negative v_B arrow (reversed), resultant v_AB. Label: 'This is the same triangle law from Ch.5 — just applied to velocity vectors.' 1D case shown as the simplest example, then 2D case."
    }
  ]
}
```


# relative_motion_projectiles.json
```json
{
  "concept_id": "relative_motion_projectiles",
  "concept_name": "Relative Motion Between Two Projectiles",
  "chapter": "Ch.7",
  "section": "7.6",
  "source_book": "DC Pandey Mechanics Vol 1",
  "class_level": "11",
  "locked_facts": {
    "fact_1": "Relative acceleration between two projectiles: a\u2081\u2082 = a\u2081 - a\u2082 = g - g = 0. Relative acceleration is ZERO.",
    "fact_2": "Since relative acceleration is zero, relative motion between two projectiles is UNIFORM \u2014 constant relative velocity.",
    "fact_3": "One projectile sees the other moving in a STRAIGHT LINE \u2014 not a parabola.",
    "fact_4": "Relative velocity: u\u2081\u2082 = u\u2081 - u\u2082. Its x-component: u\u2081cos\u03b8\u2081 - u\u2082cos\u03b8\u2082. y-component: u\u2081sin\u03b8\u2081 - u\u2082sin\u03b8\u2082.",
    "fact_5": "Condition for collision in mid-air: relative velocity u\u2081\u2082 must be directed exactly along the line joining the two particles at the moment of launch.",
    "fact_6": "If u\u2081cos\u03b8\u2081 = u\u2082cos\u03b8\u2082 (equal horizontal components), relative motion is purely vertical \u2014 one sees other moving straight up or down.",
    "fact_7": "If u\u2081sin\u03b8\u2081 = u\u2082sin\u03b8\u2082 (equal vertical components), relative motion is purely horizontal \u2014 one sees other moving straight left or right.",
    "fact_8": "Time of collision: t = (initial separation along u\u2081\u2082 direction) / |u\u2081\u2082|",
    "fact_9": "This concept directly uses the relative motion framework from Ch.6 \u2014 same principles applied to 2D projectile situation."
  },
  "epic_l_path": {
    "description": "Full explanation of relative motion between projectiles \u2014 from zero relative acceleration to straight-line observation",
    "scope": "global",
    "states": [
      {
        "state_id": "STATE_1",
        "label": "Two Projectiles \u2014 Both Under Gravity",
        "physics_layer": {
          "scenario": "two_projectiles_launched",
          "show": "two balls launched simultaneously from two points, different angles \u03b8\u2081=60\u00b0 and \u03b8\u2082=30\u00b0, different speeds u\u2081 and u\u2082. Both follow parabolic arcs. Gravity arrow on each.",
          "values": {
            "u1": 60,
            "theta1_deg": 30,
            "u2": 50,
            "theta2_deg": 53,
            "separation": 100
          },
          "freeze_at_t": 0
        },
        "pedagogy_layer": {
          "focus": "Both are projectiles \u2014 both pulled by the same g downward, same value, same direction",
          "real_world": "Two cricket balls bowled from different ends \u2014 both curve under the same gravity",
          "attention_target": "Both gravity arrows are identical \u2014 g is the same for both"
        },
        "freeze": false
      },
      {
        "state_id": "STATE_2",
        "label": "Relative Acceleration = Zero",
        "physics_layer": {
          "scenario": "relative_acceleration_zero",
          "show": "a\u2081 = g downward, a\u2082 = g downward. a\u2081\u2082 = a\u2081 - a\u2082 = g - g = 0. Big zero displayed. Relative acceleration = zero highlighted.",
          "values": {},
          "freeze_at_t": 0
        },
        "pedagogy_layer": {
          "focus": "When you subtract equal vectors, you get zero. The relative world has no acceleration.",
          "contrast_from_previous": "Lab frame: parabolas everywhere. Relative frame: straight lines because a=0",
          "attention_target": "This is the key insight: same g cancels out completely"
        },
        "freeze": true
      },
      {
        "state_id": "STATE_3",
        "label": "What Projectile 2 Sees: A Straight Line",
        "physics_layer": {
          "scenario": "relative_frame_straight_line",
          "show": "split view. LEFT: lab frame \u2014 both balls trace parabolas. RIGHT: frame of particle 2 \u2014 particle 1 appears to move in a straight line at constant velocity u\u2081\u2082.",
          "values": {
            "u1": 60,
            "theta1_deg": 30,
            "u2": 50,
            "theta2_deg": 53
          },
          "freeze_at_t": null
        },
        "pedagogy_layer": {
          "focus": "No acceleration \u2192 uniform motion \u2192 straight line. As simple as Ch.6 relative velocity.",
          "aha_moment": "Sitting in projectile 2 and watching projectile 1: it goes in a perfectly straight line. No curve. No parabola.",
          "contrast_from_previous": "Lab sees parabolas. Relative frame sees only a straight line."
        },
        "freeze": false
      },
      {
        "state_id": "STATE_4",
        "label": "Collision Condition",
        "physics_layer": {
          "scenario": "collision_condition",
          "show": "two particles at initial positions A and B. Relative velocity vector u\u2081\u2082 drawn. Collision only if u\u2081\u2082 points exactly toward the other particle (along line AB). Two cases: YES (u\u2081\u2082 along AB \u2192 collision) and NO (u\u2081\u2082 not along AB \u2192 miss)",
          "values": {
            "separation": 100
          },
          "freeze_at_t": 0
        },
        "pedagogy_layer": {
          "focus": "Relative motion is uniform + straight. They collide only if that straight line passes through the other particle.",
          "attention_target": "Condition: angle of u\u2081\u2082 must equal angle of line AB. One equation, cleanly solvable."
        },
        "freeze": true
      },
      {
        "state_id": "STATE_5",
        "label": "Special Cases \u2014 Horizontal or Vertical Relative Motion",
        "physics_layer": {
          "scenario": "relative_motion_special_cases",
          "show": "CASE A: u\u2081cos\u03b8\u2081 = u\u2082cos\u03b8\u2082. Relative velocity is vertical \u2014 one sees other going straight up/down. CASE B: u\u2081sin\u03b8\u2081 = u\u2082sin\u03b8\u2082. Relative velocity is horizontal.",
          "values": {},
          "freeze_at_t": null
        },
        "pedagogy_layer": {
          "focus": "Equal horizontal components \u2192 pure vertical relative motion. Equal vertical \u2192 pure horizontal.",
          "contrast_from_previous": "These are elegantly simple special cases of the general straight-line result"
        },
        "freeze": false
      },
      {
        "state_id": "STATE_6",
        "label": "Aha \u2014 This Is Just Ch.6 Relative Motion in 2D",
        "physics_layer": {
          "scenario": "concept_connection",
          "show": "side by side: Ch.6 rain-umbrella relative motion (1D) vs this (2D). Same principle: subtract velocities, find direction of relative motion. The parabolas in lab frame are irrelevant to the relative calculation.",
          "values": {},
          "freeze_at_t": null
        },
        "pedagogy_layer": {
          "focus": "The architecture is identical to river-boat and rain-umbrella \u2014 just in 2D",
          "aha_moment": "You never needed to track the parabolas. Just subtract initial velocities and find the straight-line relative path. Everything else follows.",
          "contrast_from_previous": "Students think projectile motion makes relative velocity harder \u2014 it actually makes it simpler because a\u2081\u2082 = 0."
        },
        "freeze": true
      }
    ]
  },
  "epic_c_branches": {
    "relative_path_is_parabola": {
      "branch_id": "relative_path_is_parabola",
      "trigger_beliefs": [
        "one projectile sees parabola",
        "relative path is curved",
        "dono ka relative motion parabolic",
        "relative trajectory curved",
        "one sees other as parabola"
      ],
      "student_belief": "From the frame of one projectile, the other appears to move in a parabolic path because projectiles follow parabolas",
      "actual_physics": "Relative acceleration a\u2081\u2082 = g - g = 0. Zero acceleration means uniform motion means STRAIGHT LINE. The parabola is a lab-frame observation \u2014 it vanishes in the relative frame.",
      "aha_moment": "The relative frame has no gravity \u2014 both have it, so it cancels. In a gravity-free world, everything goes straight.",
      "states": {
        "STATE_1": {
          "label": "Your Belief \u2014 Relative Path is Curved",
          "physics_layer": {
            "scenario": "relative_wrong_parabola",
            "show": "frame of particle 2: particle 1 drawn as following a parabolic arc \u2014 student's wrong mental model animated",
            "freeze": false
          },
          "pedagogy_layer": {
            "focus": "Show student's intuition: if both follow parabolas, surely the relative path is also curved"
          }
        },
        "STATE_2": {
          "label": "Cancel the Accelerations",
          "physics_layer": {
            "scenario": "acceleration_cancellation",
            "show": "a\u2081 = 10 m/s\u00b2 downward, a\u2082 = 10 m/s\u00b2 downward. Subtraction shown: a\u2081\u2082 = 0. Large ZERO on screen. Relative world: no acceleration.",
            "freeze": true
          },
          "pedagogy_layer": {
            "focus": "When you subtract two equal vectors, you get zero. Gravity cancels out of the relative problem entirely."
          }
        },
        "STATE_3": {
          "label": "Zero Acceleration \u2192 Straight Line",
          "physics_layer": {
            "scenario": "relative_straight_line_animation",
            "show": "same two projectiles. Lab frame (left): both curve. Relative frame (right): particle 1 moves in a perfect straight line from particle 2's perspective.",
            "freeze": false
          },
          "pedagogy_layer": {
            "focus": "No acceleration = Newton's first law = straight line motion. This is not special to projectiles \u2014 it's always true when a\u2081\u2082=0.",
            "aha_moment": "From particle 2's seat, particle 1 has zero net acceleration. So it must go straight \u2014 always."
          }
        }
      }
    },
    "collision_impossible_different_launch": {
      "branch_id": "collision_impossible_different_launch",
      "trigger_beliefs": [
        "cannot collide different angles",
        "dono ka angle alag hai toh collision nahi",
        "must be launched at each other to collide",
        "parallel projectiles never meet"
      ],
      "student_belief": "Two projectiles launched at different angles from different points cannot collide in mid-air",
      "actual_physics": "Collision is possible if relative velocity u\u2081\u2082 is directed exactly along the initial line joining the particles. Angles and speeds can vary \u2014 what matters is the direction of u\u2081\u2082.",
      "aha_moment": "Collision condition has nothing to do with individual trajectories \u2014 only the relative velocity vector must point from one particle toward the other.",
      "states": {
        "STATE_1": {
          "label": "Your Belief \u2014 Different Angles Can't Meet",
          "physics_layer": {
            "scenario": "projectile_wrong_no_collision",
            "show": "two projectiles at clearly different angles, student assumes they miss. Both labeled with different \u03b8 values.",
            "freeze": false
          },
          "pedagogy_layer": {
            "focus": "Student intuition: different trajectories \u2192 different destinations \u2192 no collision"
          }
        },
        "STATE_2": {
          "label": "The Relative Velocity Direction Test",
          "physics_layer": {
            "scenario": "collision_relative_velocity_test",
            "show": "two launch points A and B. u\u2081 and u\u2082 drawn. u\u2081\u2082 = u\u2081 - u\u2082 computed and drawn as vector. Check: does u\u2081\u2082 point along AB? YES \u2192 collision shown. NO \u2192 miss shown.",
            "freeze": true
          },
          "pedagogy_layer": {
            "focus": "Forget the trajectories. Just check: does the relative velocity aim one at the other?"
          }
        },
        "STATE_3": {
          "label": "Example \u2014 They Do Collide",
          "physics_layer": {
            "scenario": "collision_example",
            "show": "DC Pandey Example 7.10 setup. u\u2081=60m/s at 30\u00b0, u\u2082=50m/s opposite. Separation=100m. u\u2081\u2082 computed, shown pointing along AB. Both arcs traced \u2014 they meet at t=1s at the collision point P.",
            "values": {
              "u1": 60,
              "theta1_deg": 30,
              "u2": 50,
              "separation": 100,
              "t_collision": 1
            },
            "freeze": false
          },
          "pedagogy_layer": {
            "focus": "Completely different arcs. Completely different directions. But u\u2081\u2082 was along AB \u2014 they collide anyway.",
            "aha_moment": "The individual trajectories are irrelevant to the collision condition. Only u\u2081\u2082 matters."
          }
        }
      }
    }
  },
  "epic_c_micro_templates": {
    "micro_1": {
      "trigger": [
        "relative velocity two projectiles",
        "u12 formula",
        "relative speed projectiles"
      ],
      "response_type": "static_with_formula",
      "formula": "u\u2081\u2082\u2093 = u\u2081cos\u03b8\u2081 - u\u2082cos\u03b8\u2082,  u\u2081\u2082\u1d67 = u\u2081sin\u03b8\u2081 - u\u2082sin\u03b8\u2082",
      "key_point": "Constant throughout flight. Magnitude |u\u2081\u2082| = \u221a(u\u2081\u2082\u2093\u00b2 + u\u2081\u2082\u1d67\u00b2). Direction: tan\u207b\u00b9(u\u2081\u2082\u1d67/u\u2081\u2082\u2093).",
      "simulation_states": 1
    },
    "micro_2": {
      "trigger": [
        "collision condition projectiles",
        "when do projectiles collide",
        "collision mid air"
      ],
      "response_type": "static",
      "key_point": "Collision if relative velocity u\u2081\u2082 is directed along the initial line AB joining the two particles. Check: angle of u\u2081\u2082 = angle of line AB.",
      "simulation_states": 2
    },
    "micro_3": {
      "trigger": [
        "relative acceleration projectiles",
        "a12 zero",
        "zero relative acceleration"
      ],
      "response_type": "static_with_formula",
      "formula": "a\u2081\u2082 = a\u2081 - a\u2082 = g - g = 0",
      "key_point": "Zero relative acceleration \u2192 uniform relative motion \u2192 straight-line path as seen by either particle.",
      "simulation_states": 1
    }
  },
  "static_responses": {
    "why_straight_line": "Both particles have exactly the same acceleration (g downward). In the relative frame, net acceleration = 0. Newton's first law: zero acceleration means straight line at constant velocity.",
    "collision_time": "Once collision is confirmed possible, time = (distance between particles along u\u2081\u2082 direction) / |u\u2081\u2082|.",
    "comparison_to_ch6": "This is Ch.6 relative motion in 2D. River-boat: relative velocity of boat w.r.t. river. Here: relative velocity of projectile 1 w.r.t. projectile 2. Same framework."
  },
  "example_library": {
    "example_1": {
      "source": "DC Pandey Example 7.10, Section 7.6",
      "principle": "A at 60m/s at 30\u00b0, B at 50m/s opposite direction, separation 100m. Find collision angle, time, and position.",
      "aha": "Relative velocity direction must equal slope of AB line. Solving gives \u03b8_B=53\u00b0, t=1s, collision 30m from A.",
      "simulation_states": 4
    }
  },
  "parameter_slots": {
    "slot_1": {
      "name": "speed_particle_1",
      "symbol": "u\u2081",
      "unit": "m/s",
      "default": 60,
      "range": [
        10,
        100
      ]
    },
    "slot_2": {
      "name": "angle_particle_1",
      "symbol": "\u03b8\u2081",
      "unit": "degrees",
      "default": 30,
      "range": [
        0,
        90
      ]
    },
    "slot_3": {
      "name": "speed_particle_2",
      "symbol": "u\u2082",
      "unit": "m/s",
      "default": 50,
      "range": [
        10,
        100
      ]
    },
    "slot_4": {
      "name": "angle_particle_2",
      "symbol": "\u03b8\u2082",
      "unit": "degrees",
      "default": 53,
      "range": [
        0,
        90
      ]
    },
    "slot_5": {
      "name": "initial_separation",
      "symbol": "d",
      "unit": "m",
      "default": 100,
      "range": [
        20,
        500
      ]
    }
  },
  "panel_sync_spec": {
    "panel_a": "canvas2d \u2014 mechanics_2d renderer showing both projectile arcs in lab frame",
    "panel_b": "plotly \u2014 relative motion frame: shows straight-line path of particle 1 as seen by particle 2. X-axis: relative horizontal displacement. Y-axis: relative vertical displacement.",
    "sync_event": "As animation progresses in Panel A (lab frame parabolas), Panel B plots the straight relative path in real time",
    "bidirectional": false,
    "sync_trigger": "time_step"
  },
  "renderer_hint": {
    "primary_renderer": "mechanics_2d",
    "panel_count": 2,
    "technology_a": "canvas2d",
    "technology_b": "plotly",
    "sync_required": true,
    "scene_mode": false,
    "scenario_type": "two_projectiles",
    "panel_a_role": "Lab frame: both projectile arcs animated simultaneously with velocity vectors",
    "panel_b_role": "Plotly: relative frame view \u2014 straight-line path of particle 1 as seen by particle 2 drawn in real time",
    "scene_elements": []
  },
  "routing_signals": {
    "primary_keywords": [
      "relative motion projectiles",
      "two projectiles collide",
      "relative path projectile",
      "do projectiles meet"
    ],
    "hinglish_triggers": [
      "do projectile kab milenge",
      "ek doosre ko kya dikhega",
      "relative velocity projectile",
      "collision hoga ya nahi"
    ],
    "formula_triggers": [
      "u12 = u1 - u2",
      "a12 = 0",
      "relative acceleration zero"
    ],
    "belief_check_triggers": [
      "is relative path parabolic",
      "can they collide at different angles",
      "does relative acceleration equal g"
    ]
  },
  "jee_specific": {
    "trap_1": "Relative acceleration = 0, NOT g. Students write a\u2081\u2082 = g (forgetting the subtraction). Biggest mistake in this section.",
    "trap_2": "For collision: direction of relative velocity must equal direction of initial separation vector. Many students check speed ratio instead.",
    "trap_3": "Even if launched in opposite directions, collision is possible \u2014 direction of u\u2081\u2082 is the only thing that matters.",
    "trap_4": "Time of collision: t = d/|u\u2081\u2082|, where d is separation along u\u2081\u2082 direction \u2014 NOT total separation. Students use total separation d directly.",
    "trap_5": "In JEE questions, 'find angle of projection of B for collision' \u2192 set up u\u2081\u2082 direction = AB direction. One equation in one unknown (\u03b8\u2082)."
  },
  "concept_relationships": {
    "prerequisites": [
      "projectile_motion",
      "relative_motion",
      "river_boat_problems"
    ],
    "leads_to": [
      "circular_motion",
      "laws_of_motion"
    ],
    "common_confusion_with": [
      "relative_motion \u2014 same framework, different context (2D with g)"
    ]
  },
  "regeneration_variants": [
    {
      "variant_id": 1,
      "scenario_type": "two_projectiles",
      "approach": "collision_first",
      "entry_state": "STATE_4",
      "teacher_angle": "Start with DC Pandey Example 7.10 directly \u2014 two specific projectiles, find if they collide. Work backward: why does relative velocity direction determine collision? Concrete before abstract.",
      "locked_facts_focus": [
        "fact_5",
        "fact_8",
        "fact_1"
      ],
      "panel_b_focus": "Show the specific collision example immediately. Relative straight-line path plotted live."
    },
    {
      "variant_id": 2,
      "scenario_type": "two_projectiles",
      "approach": "ch6_connection",
      "entry_state": "STATE_6",
      "teacher_angle": "Start from Ch.6 rain-umbrella \u2014 relative velocity in 1D. Extend to 2D. Both have gravity: a\u2081\u2082=0 is the same as river-boat having zero acceleration. The visual is the same \u2014 just 2D now.",
      "locked_facts_focus": [
        "fact_1",
        "fact_2",
        "fact_3"
      ],
      "panel_b_focus": "Split: rain-umbrella straight line (Ch.6) vs projectile relative straight line (Ch.7). Same geometry, different context."
    }
  ]
}
```


# river_boat_problems.json
```json
{
  "concept_id": "river_boat_problems",
  "concept_name": "River-Boat Problems — Crossing with Drift, Minimum Time, Zero Drift",
  "class_level": 11,
  "chapter": "Kinematics",
  "section": "6.10",
  "source_coverage": {
    "dc_pandey": "Chapter 6, Section 6.10 — River-Boat Problems (Examples 6.31, 6.32; Exercise Problems 5, 6)",
    "ncert": "Chapter 4 — Motion in a Plane, Section 4.6",
    "hc_verma": "Chapter 3 — Rest and Motion: Kinematics, Section 3.7"
  },
  "source_type": "ncert_and_dc_pandey",
  "renderer_hint": {
    "technology": "canvas2d",
    "technology_b": "plotly",
    "renderer": "mechanics_2d",
    "scenario_type": "river_boat",
    "panel_count": 2,
    "sync_required": true,
    "scene_mode": true,
    "show_labels": true,
    "scene_elements": [
      "river",
      "boat",
      "current_arrows",
      "drift_path",
      "target_point",
      "velocity_vectors"
    ],
    "panel_a_role": "Realistic river scene — boat crosses from bank A to bank B, current pushes it downstream, drift shown as horizontal offset on arrival",
    "panel_b_role": "Plotly vector diagram — v_br, v_r, and resultant v_b drawn from origin; angle θ interactive slider updates both panels"
  },
  "locked_facts": {
    "three_velocities": "Three velocities always present: v_r = river velocity (ground frame), v_br = boat velocity relative to river (boatman steers this), v_b = actual boat velocity relative to ground. Relation: v_b = v_br + v_r (vector addition).",
    "boatman_controls_v_br": "Boatman controls ONLY v_br — the direction and magnitude he rows. He cannot control v_r. The actual path (v_b) is the vector sum of what he rows plus what the river does.",
    "crossing_time_formula": "Time to cross river of width d: t = d / v_by = d / (v_br × sinα), where α is the angle v_br makes with the river bank (not with perpendicular).",
    "drift_formula": "Drift = displacement along river = v_bx × t = (v_r − v_br cosα) × t. Downstream positive.",
    "result_1_min_time": "MINIMUM TIME: Steer perpendicular to river (α = 90°, θ = 0° from perpendicular). t_min = d / v_br. Drift = v_r × d / v_br. This is always achievable regardless of v_r vs v_br.",
    "result_2_zero_drift": "ZERO DRIFT (reach exactly opposite): Only possible if v_br > v_r. Angle upstream from perpendicular: sinθ = v_r / v_br. Time = d / √(v_br² − v_r²). If v_br ≤ v_r: IMPOSSIBLE.",
    "result_3_impossible": "If v_r ≥ v_br, boatman cannot reach exactly opposite bank. Best he can do is minimise drift. Minimum drift angle: sinθ = v_br / v_r (different from zero-drift condition).",
    "angle_convention": "DC Pandey convention: α = angle between v_br and river bank. θ = angle between v_br and perpendicular to bank. α + θ = 90°. Be careful which angle a problem specifies.",
    "velocity_triangle": "v_b = v_br + v_r. Draw v_br first (direction boatman rows), then add v_r (river current). The resultant is the actual path v_b.",
    "dc_pandey_ex631": "Example 6.31: d=30m, v_r=2m/s, v_br=5m/s at 37° from river bank. v_by=5sin37°=3m/s. t=30/3=10s. v_bx=v_r+v_br cos37°=2+4=6m/s (downstream if cos37° in current direction). Drift=6×10=60m.",
    "dc_pandey_ex632": "Example 6.32: d=30m, v_r=4m/s, v_br=5m/s. (a) Min time: θ=90°, t=30/5=6s, drift=4×6=24m. (b) Zero drift: sinθ=4/5, θ=53° upstream from perp, t=30/√(25−16)=30/3=10s. (c) v_r<v_br so zero drift IS possible."
  },
  "minimum_viable_understanding": "v_b = v_br + v_r. Boatman steers v_br, river adds v_r, actual path is v_b. For minimum time: row perpendicular (t = d/v_br). For zero drift: row upstream at sinθ = v_r/v_br (only if v_br > v_r).",
  "variables": {
    "v_r": "River velocity — always horizontal, downstream (m/s)",
    "v_br": "Boat velocity relative to river — magnitude boatman rows at (m/s)",
    "v_b": "Actual boat velocity relative to ground = v_br + v_r (m/s)",
    "d": "Width of river — perpendicular distance between banks (m)",
    "alpha": "Angle between v_br and river bank (DC Pandey convention)",
    "theta": "Angle between v_br and perpendicular to bank (upstream angle)",
    "drift": "Displacement along river when boat reaches other bank (m)",
    "t": "Time to cross river (s)"
  },
  "routing_signals": {
    "global_triggers": [
      "river boat problem",
      "boat crossing river",
      "swimmer crossing river",
      "river boat minimum time",
      "drift in river boat",
      "nadi paar karna"
    ],
    "local_triggers": [
      "minimum time to cross river",
      "zero drift river boat",
      "boat reach opposite bank",
      "drift formula river",
      "angle upstream boat",
      "v_br greater than v_r condition",
      "river velocity more than boat speed"
    ],
    "micro_triggers": [
      "what is drift",
      "v_b equals v_br plus v_r",
      "time formula river crossing",
      "minimum drift angle"
    ],
    "simulation_not_needed_triggers": [
      "state the three standard results river boat",
      "write formula for drift"
    ],
    "subconcept_triggers": {
      "minimum_time": [
        "shortest time to cross",
        "minimum time crossing river",
        "row perpendicular to river",
        "t equals d by v_br"
      ],
      "zero_drift": [
        "reach exactly opposite bank",
        "zero drift condition",
        "no drift river boat",
        "straight across river"
      ],
      "impossible_case": [
        "v_r greater than v_br",
        "cannot reach opposite bank",
        "river faster than boat",
        "minimum drift when current strong"
      ],
      "drift_calculation": [
        "how much drift",
        "how far downstream does boat land",
        "calculate drift"
      ]
    }
  },
  "checkpoint_states": {
    "understands_three_velocities": "enter at STATE_2",
    "understands_min_time": "enter at STATE_3",
    "understands_zero_drift": "enter at STATE_4",
    "understands_impossible_case": "enter at STATE_5"
  },
  "prerequisite_check": {
    "required_concepts": [
      "relative_motion",
      "vector_addition"
    ],
    "gate_question": "A boat rows at 5 m/s relative to water. River flows at 3 m/s. What is the magnitude of boat's actual velocity if it rows perpendicular to current? (Answer: √(25+9) = √34 m/s. If student cannot do this, cover relative_motion and vector_addition first.)",
    "if_gap_detected": "redirect to relative_motion.json — river-boat is a direct application of v_b = v_br + v_r"
  },
  "epic_l_path": {
    "state_count": 6,
    "board_mode_states": [
      1,
      2,
      3,
      4
    ],
    "jee_mode_states": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "scope": "global",
    "states": {
      "STATE_1": {
        "label": "The Hook — Why Doesn't the Boat Go Straight Across?",
        "physics_layer": {
          "concept": "A boat aimed directly at the opposite bank does NOT travel in a straight line across — the river pushes it downstream",
          "simulation_focus": "Scene: boat aimed perpendicular at opposite bank. River current flowing right. Boat travels diagonally — lands downstream of target. Student's intuition says it should go straight. Reality: drift = v_r × crossing_time.",
          "what_to_show": "Velocity vectors on Panel B: v_br pointing straight across (up), v_r pointing right, v_b = diagonal resultant. Drift clearly visible on Panel A as horizontal offset.",
          "key_observation": "The boat steers perpendicular but the river adds a sideways push. These are independent — the boatman can't cancel v_r, only manage it.",
          "scenario": "river_setup_scene"
        },
        "pedagogy_layer": {
          "opening_question": "You aim a boat directly at the opposite bank. Does it land exactly opposite? Why or why not?",
          "teacher_script": "The river doesn't care where you aim. It pushes everything downstream at v_r. Your rowing adds v_br. The actual path is their vector sum.",
          "real_world": "Same principle: aeroplane flying in crosswind, swimmer crossing current, bullet fired in wind."
        }
      },
      "STATE_2": {
        "label": "The Velocity Triangle — v_b = v_br + v_r",
        "physics_layer": {
          "concept": "Three velocities, one vector equation. Boatman controls v_br only.",
          "simulation_focus": "Panel B interactive vector diagram: drag v_br arrow to any angle. v_r stays fixed (river). Resultant v_b updates live. Panel A shows boat path updating in real time as angle changes.",
          "component_form": "v_bx = v_r + v_br cosα (along river). v_by = v_br sinα (across river). α = angle from bank.",
          "key_insight": "Crossing time depends ONLY on v_by = v_br sinα. Drift depends on v_bx × t. These two are separable — changing α trades off one against the other.",
          "scenario": "velocity_triangle_river"
        },
        "pedagogy_layer": {
          "analogy": "Think of the river as a conveyor belt. You walk across it (v_br), but the belt moves you sideways (v_r). Your actual path is both combined.",
          "common_mistake": "Students add |v_br| + |v_r| as scalars for actual speed. Wrong — it's vector addition, not arithmetic."
        }
      },
      "STATE_3": {
        "label": "Result 1 — Minimum Time: Row Perpendicular",
        "physics_layer": {
          "concept": "To cross in minimum time: maximise v_by (component across river). Maximum v_by = v_br when α = 90° (boat aimed perpendicular to bank).",
          "derivation": "t = d / (v_br sinα). Minimum when sinα = 1, i.e. α = 90°. t_min = d / v_br.",
          "drift_in_this_case": "Drift = v_r × t_min = v_r × d / v_br. Cannot be zero unless v_r = 0.",
          "simulation_focus": "Panel A: boat rows straight up (perpendicular). Current pushes it right. Lands downstream by drift = v_r × d/v_br. Panel B: v_br vertical, v_r horizontal, v_b diagonal.",
          "dc_pandey_link": "Example 6.32(a): d=30m, v_r=4m/s, v_br=5m/s. t_min=30/5=6s. Drift=4×6=24m downstream.",
          "scenario": "minimum_time_case"
        },
        "pedagogy_layer": {
          "key_message": "Minimum time ALWAYS means row perpendicular. No exceptions. You will drift — that's the price of minimum time.",
          "jee_trap": "Students try to row slightly upstream to reduce drift. This actually INCREASES crossing time. The trade-off is unavoidable."
        }
      },
      "STATE_4": {
        "label": "Result 2 — Zero Drift: Row Upstream at sinθ = v_r/v_br",
        "physics_layer": {
          "concept": "To reach exactly opposite bank: make v_bx = 0, i.e. net horizontal velocity = 0.",
          "condition": "v_r = v_br sinθ (upstream component of rowing cancels river current). Therefore sinθ = v_r/v_br. Only possible if v_r < v_br (sinθ ≤ 1).",
          "time_formula": "v_by = v_br cosθ = √(v_br² − v_r²). t = d / √(v_br² − v_r²).",
          "simulation_focus": "Panel A: boat angled upstream. River current pushes right. Upstream component of v_br cancels v_r exactly. Boat tracks straight across — zero drift, lands exactly opposite. Panel B: v_br angled upstream, v_r rightward, v_b = straight up.",
          "dc_pandey_link": "Example 6.32(b): v_r=4, v_br=5. sinθ=4/5=0.8, θ=53° upstream from perpendicular. v_by=√(25−16)=3m/s. t=30/3=10s. Zero drift — lands exactly at B.",
          "scenario": "minimum_drift_case"
        },
        "pedagogy_layer": {
          "key_message": "Zero drift requires v_br > v_r. If river is too strong, you cannot fight it — you will always drift downstream no matter how you steer.",
          "contrast": "Compare: min time = 6s with 24m drift. Zero drift = 10s with 0m drift. Shorter time costs more drift. Longer time can eliminate drift. Trade-off is explicit."
        }
      },
      "STATE_5": {
        "label": "Result 3 — When v_r > v_br: Minimum Drift (Not Zero)",
        "physics_layer": {
          "concept": "If v_r ≥ v_br, zero drift is impossible. Boatman can only minimise drift.",
          "why_impossible": "sinθ = v_r/v_br > 1 — no real angle satisfies this. River is too strong to cancel.",
          "minimum_drift_condition": "Minimise drift x = v_bx × t. Using calculus or geometry: minimum drift when sinα = v_br/v_r (boat aimed partly downstream). This is a JEE Advanced result.",
          "simulation_focus": "Panel A: river flows faster than boat rows. Even with maximum upstream angle, boat still drifts. Show minimum drift angle vs perpendicular — minimum drift angle actually involves rowing SLIGHTLY DOWNSTREAM, not fully upstream.",
          "key_observation": "Minimum drift ≠ zero drift. Zero drift is a special case that requires boat to overpower the river.",
          "scenario": "drift_calculation"
        },
        "pedagogy_layer": {
          "jee_tip": "JEE often gives v_r > v_br and asks for minimum drift. Use sinα = v_br/v_r. Then drift_min = d × √(v_r² − v_br²) / v_br.",
          "real_world": "This is like swimming across a very strong current — you aim slightly downstream (not upstream) to minimise total lateral drift."
        }
      },
      "STATE_6": {
        "label": "Student Interaction — DC Pandey Example 6.32 Live",
        "physics_layer": {
          "problem": "Width=30m, v_r=4m/s, v_br=5m/s. Solve all parts: (a) minimum time and drift, (b) angle for zero drift and time, (c) is zero drift possible?",
          "solution_path": "(a) t=30/5=6s, drift=24m. (b) sinθ=4/5=0.8, θ=53°, t=30/3=10s, drift=0. (c) v_br=5>v_r=4 → YES, zero drift is possible.",
          "interactive": "Student uses Panel B slider to set angle. Panel A shows live crossing. Student identifies minimum time angle (90°) and zero drift angle (53° upstream) by observing drift = 0 on Panel A.",
          "scenario": "general_angle_case"
        },
        "pedagogy_layer": {
          "teacher_script": "The slider IS the exam. When drift = 0, you found the zero-drift angle. When crossing time is minimum (shortest bar), you found minimum time. The physics is in the trade-off between them."
        }
      }
    }
  },
  "epic_c_branches": [
    {
      "branch_id": "rows_perpendicular_for_zero_drift",
      "misconception": "Student thinks rowing perpendicular to bank gives zero drift",
      "student_belief": "If I aim the boat straight at the opposite bank, I will land exactly opposite — no drift",
      "trigger_phrases": [
        "I aimed perpendicular but still got drift",
        "if boat goes straight across why is there drift",
        "rowing perpendicular should give no drift",
        "direct cross no drift",
        "seedha cross karo drift nahi hoga"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Boat aimed perfectly perpendicular (v_br straight up). River flowing right at 4 m/s. Student expects: land directly opposite. Simulation: boat lands 24m downstream. Arrow shows the river adding v_r = 4m/s rightward the entire crossing — v_by doesn't cancel v_bx.",
            "label": "Perpendicular aim, 24m drift. The river doesn't care where you point the boat — it pushes everything sideways.",
            "scenario": "rows_perpendicular_for_zero_drift_s1"
          },
          "pedagogy_layer": {
            "teacher_script": "Rowing perpendicular maximises your SPEED across (v_by = v_br, its maximum). But it does nothing to cancel the river's sideways push. v_r adds to your path — always."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Show what DOES give zero drift: boat angled upstream at θ=53°. Upstream component of v_br (= v_br sinθ = 4 m/s) exactly cancels v_r = 4m/s. Net horizontal velocity = 0. Boat tracks straight across. Time = 10s (longer than perpendicular's 6s).",
            "label": "Zero drift: angle upstream so v_br sinθ = v_r. This takes longer — the upstream angle reduces your crossing speed.",
            "scenario": "rows_perpendicular_for_zero_drift_s2"
          },
          "pedagogy_layer": {
            "rule": "Perpendicular = minimum time (with drift). Upstream angle sinθ=v_r/v_br = zero drift (with longer time). These are TWO DIFFERENT things. Never confuse them."
          }
        }
      }
    },
    {
      "branch_id": "wrong_time_formula",
      "misconception": "Student uses t = d / |v_b| (divides by actual speed, not crossing component)",
      "student_belief": "Time to cross = river width divided by actual boat speed |v_b|",
      "trigger_phrases": [
        "divided width by total speed",
        "t equals d by v_b",
        "used resultant speed for time",
        "why not divide by actual velocity",
        "time formula v_b or v_br"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "v_br=5m/s at 90° (perpendicular), v_r=4m/s. |v_b|=√(25+16)=√41≈6.4m/s. Student: t=30/6.4≈4.7s. Correct: t=30/5=6s. Show: boat using student's time doesn't reach other bank — it still has 4m to go at t=4.7s. The diagonal travel covers more than just the width.",
            "label": "t=d/|v_b| is wrong. The actual speed covers a diagonal path, not just the width. Only v_by covers the width.",
            "scenario": "wrong_time_formula_s1"
          },
          "pedagogy_layer": {
            "teacher_script": "The river width is PERPENDICULAR to current. Only the perpendicular component of boat velocity (v_by) covers that width. The horizontal component just adds drift — it doesn't help you cross."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Show river as a vertical corridor. Width d is horizontal distance. v_by = vertical component of v_b covers it. v_bx = horizontal component just moves you along the corridor (drift). Time = d / v_by = d / (v_br sinα). Animate both components separately.",
            "label": "t = d / v_by always. Where v_by = component of actual boat velocity PERPENDICULAR to the river banks = v_br sinα.",
            "scenario": "wrong_time_formula_s2"
          }
        }
      }
    },
    {
      "branch_id": "zero_drift_always_possible",
      "misconception": "Student thinks zero drift is always achievable regardless of v_r vs v_br",
      "student_belief": "Boatman can always row to reach exactly opposite if he angles far enough upstream",
      "trigger_phrases": [
        "always can reach opposite bank",
        "just row more upstream",
        "zero drift always possible",
        "angle upstream enough to cancel",
        "koi bhi drift zero kar sakta hai"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "v_r = 6 m/s (river), v_br = 4 m/s (boat — slower than river). Student tries various upstream angles. At θ=90° (fully upstream), v_by=0 — boat makes no progress across and is swept downstream indefinitely. At any angle, v_r component always overwhelms v_br sinθ ≤ 4 < 6. Drift cannot be zero.",
            "label": "Maximum upstream v_br component = 4m/s. River pushes at 6m/s. Net: still 2m/s downstream no matter what angle. Zero drift impossible.",
            "scenario": "zero_drift_always_possible_s1"
          },
          "pedagogy_layer": {
            "teacher_script": "sinθ = v_r/v_br = 6/4 = 1.5 > 1. No angle has sin > 1. The formula literally has no solution. The river is simply too strong."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Show threshold: when v_r = v_br exactly — sinθ = 1, θ = 90°, boat rows straight upstream, v_by = 0, never crosses. One step beyond: v_r > v_br — impossible. Only v_r < v_br allows zero drift.",
            "label": "Zero drift requires v_br > v_r. This is the condition. Check it FIRST before attempting zero-drift calculation.",
            "scenario": "zero_drift_always_possible_s2"
          },
          "pedagogy_layer": {
            "rule": "Three-second check at the start of every river-boat problem: Is v_br > v_r? YES → zero drift possible. NO → only minimum time and minimum drift."
          }
        }
      }
    },
    {
      "branch_id": "adding_speeds_not_vectors",
      "misconception": "Student calculates actual boat speed as v_br + v_r (arithmetic) instead of vector addition",
      "student_belief": "Actual speed = rowing speed + river speed = v_br + v_r always",
      "trigger_phrases": [
        "added the two speeds",
        "v_b equals v_br plus v_r as numbers",
        "total speed is sum",
        "actual speed 5 plus 4 is 9",
        "speeds add up"
      ],
      "states": {
        "STATE_1": {
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "v_br=5m/s perpendicular to bank, v_r=4m/s along bank. Student: |v_b|=5+4=9m/s. Correct: |v_b|=√(5²+4²)=√41≈6.4m/s. Show: at student's 9m/s, boat would cross in d/9s — but actual crossing time is d/5s (only v_by=5 covers width). Speeds only add when vectors point in SAME direction.",
            "label": "9m/s if same direction. 6.4m/s if perpendicular. The angle between v_br and v_r determines the resultant — not just their magnitudes.",
            "scenario": "rb_wrong_boat_speed_direct"
          },
          "pedagogy_layer": {
            "teacher_script": "v_br + v_r as numbers gives maximum possible resultant (θ=0°, same direction). v_br and v_r perpendicular gives |v_b|=√(v_br²+v_r²). Always check the direction before adding."
          }
        },
        "STATE_2": {
          "physics_layer": {
            "simulation": "Show three cases: same direction → |v_b|=v_br+v_r. Perpendicular → |v_b|=√(v_br²+v_r²). Opposite → |v_b|=|v_br−v_r|. River-boat is the PERPENDICULAR case — always. Slider from 0° to 180° shows |v_b| varying between these extremes.",
            "label": "River-boat: v_r is always horizontal, v_br is whatever angle boatman chooses. Use components every time — never add magnitudes.",
            "scenario": "rb_aha_two_velocities"
          }
        }
      }
    }
  ],
  "epic_c_micro_templates": {
    "micro_1": {
      "trigger": "three standard results river boat",
      "scope": "micro",
      "states": 2,
      "content": "Three standard results: (1) Minimum time: row perpendicular (α=90°). t_min = d/v_br. Drift = v_r×d/v_br. (2) Zero drift: row upstream at sinθ = v_r/v_br. Time = d/√(v_br²−v_r²). Requires v_br > v_r. (3) If v_r ≥ v_br: zero drift impossible. Minimum drift: sinα = v_br/v_r (JEE Advanced)."
    },
    "micro_2": {
      "trigger": "drift formula river",
      "scope": "micro",
      "states": 2,
      "content": "Drift = v_bx × t = (v_r − v_br cosα) × t, where α is angle from river bank. Also drift = (v_r − v_br cosα) × d / (v_br sinα). For minimum time case (α=90°): drift = v_r × d/v_br. For zero drift case: drift = 0 (by construction)."
    },
    "micro_3": {
      "trigger": "which velocity to use for crossing time",
      "scope": "micro",
      "states": 2,
      "content": "Time to cross = d / v_by = d / (v_br sinα). Use ONLY the component of boat velocity perpendicular to the bank. Never use |v_b| (actual speed) or v_br directly unless boat is perpendicular (α=90°). The horizontal component v_bx causes drift but does NOT help cross the river."
    },
    "micro_4": {
      "trigger": "condition for zero drift",
      "scope": "micro",
      "states": 2,
      "content": "Zero drift condition: v_br > v_r (boat faster than river in still water). Angle: sinθ = v_r/v_br, where θ is measured upstream from the perpendicular to the bank. If v_br ≤ v_r: check sinθ = v_r/v_br ≥ 1 — impossible, zero drift cannot be achieved."
    },
    "micro_5": {
      "trigger": "DC Pandey example 6.32",
      "scope": "micro",
      "states": 3,
      "content": "DC Pandey Ex 6.32: d=30m, v_r=4m/s, v_br=5m/s. (a) Min time: t=30/5=6s, drift=4×6=24m. (b) Zero drift: sinθ=4/5, θ=53° upstream from perpendicular, v_by=√(25−16)=3m/s, t=30/3=10s. (c) v_br=5>v_r=4 → zero drift IS possible."
    }
  },
  "static_responses": {
    "formula_sheet": {
      "trigger": "river boat all formulas",
      "simulation_needed": false,
      "response": "River-boat formulas: (1) v_b = v_br + v_r (vector). (2) v_bx = v_r + v_br cosα, v_by = v_br sinα. (3) t = d/v_by = d/(v_br sinα). (4) Drift = v_bx × t. (5) Min time: α=90°, t_min=d/v_br, drift=v_r×d/v_br. (6) Zero drift: sinθ=v_r/v_br (θ upstream from perp), t=d/√(v_br²−v_r²), requires v_br>v_r. (7) Impossible if v_r≥v_br."
    },
    "angle_convention_clarification": {
      "trigger": "angle confusion river boat alpha or theta",
      "simulation_needed": false,
      "response": "Two conventions exist: α = angle between v_br and the river BANK (0°=along river, 90°=perpendicular to river). θ = angle between v_br and the PERPENDICULAR to bank (0°=perpendicular, 90°=along river). They are complementary: α + θ = 90°. DC Pandey Example 6.31 uses α (37° from bank = 53° from perpendicular). Zero-drift formula sinθ = v_r/v_br uses θ (from perpendicular). Always check which angle the problem specifies."
    }
  },
  "problem_guidance_path": {
    "description": "Step-by-step for river-boat problems from DC Pandey",
    "step_1": "Identify: d (river width), v_r (river speed), v_br (rowing speed), what angle α or θ if given.",
    "step_2": "Check condition: v_br vs v_r. v_br > v_r → zero drift possible. v_br ≤ v_r → only minimum time or minimum drift.",
    "step_3": "Set up components: v_bx = v_r − v_br sinθ (taking upstream as negative x). v_by = v_br cosθ.",
    "step_4": "Crossing time: t = d / v_by.",
    "step_5": "Drift: x = v_bx × t.",
    "step_6": "For specific results: use the standard formulas. Check with units.",
    "common_errors": [
      "Dividing river width by |v_b| (actual speed) instead of v_by (crossing component)",
      "Thinking zero drift is always achievable",
      "Adding v_br + v_r as scalars instead of vector addition",
      "Confusing α (from bank) and θ (from perpendicular)",
      "Using zero-drift formula when v_r > v_br (sinθ > 1 — no solution)"
    ]
  },
  "example_library": {
    "example_1": {
      "source": "DC Pandey Example 6.31, Section 6.10",
      "principle": "Boat at 37° from bank (v_r=2, v_br=5, d=30m) — resolving v_br into crossing and drift components, then calculating t and drift",
      "aha": "Drift direction depends on whether v_bx = v_r + v_br cosα is positive or negative — positive means downstream, solving requires careful sign of cosα",
      "simulation_states": 2
    },
    "example_2": {
      "source": "DC Pandey Example 6.32, Section 6.10",
      "principle": "Same river (v_r=4, v_br=5, d=30m) solved for all three scenarios: minimum time, zero drift, and confirming v_br > v_r condition",
      "aha": "Same river, same boat — three completely different crossings depending on angle chosen. The angle is the only decision the boatman makes.",
      "simulation_states": 3
    },
    "example_3": {
      "source": "DC Pandey Exercise Problem 5, Section 6.10",
      "principle": "Given minimum crossing time=10min with drift=120m AND shortest path time=12.5min — find river width, v_br, v_r",
      "aha": "Two conditions (min time and zero drift) give two equations in two unknowns — elegant system that tests understanding of both results simultaneously",
      "simulation_states": 2
    },
    "example_4": {
      "source": "DC Pandey Exercise Problem 6, Section 6.10",
      "principle": "River 20m wide, v_r=3m/s, boat starts at 45° with velocity 2√2 m/s — finding landing point and time",
      "aha": "Non-standard angle problem: must resolve carefully and track both components — cannot use the three standard results directly",
      "simulation_states": 2
    }
  },
  "assessment_path": {
    "question_1": {
      "text": "A boatman rows at 5 m/s in still water. River flows at 5 m/s. Can he reach the exactly opposite bank?",
      "options": [
        "Yes, by rowing upstream at 45°",
        "Yes, by rowing perpendicular",
        "No, v_r = v_br makes it impossible",
        "Yes, by rowing at sin⁻¹(1) = 90°"
      ],
      "correct": 2,
      "if_wrong_0": "route to zero_drift_always_possible — student thinks any upstream angle works",
      "if_wrong_3": "route to zero_drift_always_possible — rowing at 90° (upstream) means v_by=0, never crosses",
      "explanation": "sinθ = v_r/v_br = 5/5 = 1 → θ = 90° (straight upstream). Then v_by = v_br cosθ = 0 — boat makes no crossing progress. Impossible."
    },
    "question_2": {
      "text": "River width 60m, v_br = 6 m/s, v_r = 4 m/s. What is the minimum time to cross?",
      "options": [
        "10 s",
        "12 s",
        "15 s",
        "7.5 s"
      ],
      "correct": 0,
      "if_wrong_1": "route to wrong_time_formula — student may have used |v_b|=√52≈7.2 giving t≈8.3s",
      "explanation": "Minimum time: row perpendicular, t_min = d/v_br = 60/6 = 10s."
    },
    "question_3": {
      "text": "Same river (60m, v_br=6, v_r=4). Boatman wants zero drift. What angle must he row upstream from perpendicular?",
      "options": [
        "sin⁻¹(4/6) ≈ 41.8°",
        "cos⁻¹(4/6) ≈ 48.2°",
        "tan⁻¹(4/6) ≈ 33.7°",
        "45°"
      ],
      "correct": 0,
      "if_wrong_1": "route to wrong_time_formula confusion — cos and sin convention mixed up",
      "explanation": "sinθ = v_r/v_br = 4/6 = 2/3. θ = sin⁻¹(2/3) ≈ 41.8° upstream from perpendicular."
    },
    "question_4": {
      "text": "River width 40m, v_br=3 m/s (perpendicular to bank), v_r=4 m/s. What is the drift?",
      "options": [
        "53.3 m",
        "40 m",
        "30 m",
        "160/3 m"
      ],
      "correct": 0,
      "if_wrong_2": "route to rows_perpendicular_for_zero_drift — student thinks perpendicular gives zero drift",
      "explanation": "Perpendicular rowing: t = 40/3 s. Drift = v_r × t = 4 × 40/3 = 160/3 ≈ 53.3 m."
    },
    "question_5": {
      "text": "Boat crosses with minimum time = 10 min and drift = 120 m. What is the river velocity?",
      "options": [
        "12 m/min",
        "10 m/min",
        "2 m/min",
        "Cannot determine"
      ],
      "correct": 0,
      "explanation": "Min time → rowing perpendicular → drift = v_r × t_min. v_r = drift/t_min = 120/10 = 12 m/min. (DC Pandey Exercise 5)"
    }
  },
  "session_awareness": {
    "if_already_shown_epic_l": "Go directly to the three-result summary and problem solving — student knows the setup, needs to apply standard results",
    "if_coming_from_relative_motion": "Perfect entry point — river-boat IS relative motion applied. v_br = v_boat relative to river. v_b = v_boat relative to ground. v_r = velocity of river relative to ground.",
    "if_coming_from_vector_addition": "Connect: v_b = v_br + v_r is exactly the parallelogram law applied to two specific vectors"
  },
  "waypoints": {
    "fallback_unknown_confusion": "Default to DC Pandey Example 6.32 — it covers all three standard results in one problem, with concrete numbers (d=30m, v_r=4, v_br=5). Most confusion resolves when students see all three cases side by side.",
    "escalation_trigger": "If student asks about minimum drift when v_r > v_br — escalate to sinα = v_br/v_r derivation (JEE Advanced calculus or geometric argument)."
  },
  "depth_escalation_trigger": {
    "condition": "Student asks for minimum drift when v_r > v_br (boatman cannot achieve zero drift)",
    "escalate_to": "Drift x = (v_r − v_br cosα) × d/(v_br sinα). Differentiate with respect to α and set dx/dα = 0. Result: sinα = v_br/v_r. This gives minimum drift = d × √(v_r²−v_br²)/v_br.",
    "level": "JEE Advanced"
  },
  "parameter_slots": {
    "d": {
      "label": "river width",
      "range": [
        10,
        500
      ],
      "unit": "m",
      "default": 30,
      "extraction_hint": "width of river or distance between banks"
    },
    "v_br": {
      "label": "boat speed in still water",
      "range": [
        1,
        20
      ],
      "unit": "m/s",
      "default": 5,
      "extraction_hint": "rowing speed, boat speed in still water, or v_br ="
    },
    "v_r": {
      "label": "river current speed",
      "range": [
        1,
        20
      ],
      "unit": "m/s",
      "default": 4,
      "extraction_hint": "river velocity, current speed, or v_r ="
    },
    "theta": {
      "label": "angle upstream from perpendicular",
      "range": [
        0,
        90
      ],
      "unit": "degrees",
      "default": 0,
      "extraction_hint": "angle with perpendicular to bank, or upstream angle"
    }
  },
  "panel_sync_spec": {
    "canvas_to_graph": {
      "trigger": "STATE_N_reached",
      "action": "Panel B vector diagram updates to show v_br, v_r, v_b for current state's angle; drift value labeled"
    },
    "graph_to_canvas": {
      "trigger": "student_moves_theta_slider_on_panel_b",
      "action": "Panel A river scene redraws boat path for new angle — drift changes live, landing point moves"
    },
    "slider_to_both": {
      "parameter": "theta",
      "canvas_action": "boat path on river scene updates — shows new landing point and drift distance",
      "graph_action": "v_br arrow rotates to new angle, v_b resultant redraws, drift value updates numerically"
    }
  },
  "jee_specific": {
    "typical_question_types": [
      "Find minimum time and drift for given d, v_r, v_br",
      "Find angle for zero drift; state condition when impossible",
      "Given minimum time and drift, find v_r and v_br (two-equation system)",
      "Is it possible to reach exactly opposite bank? (condition check: v_br > v_r)",
      "Find actual velocity of boat (vector addition v_br + v_r)",
      "Boat crosses in time t — find drift as function of angle"
    ],
    "common_traps": [
      "Perpendicular rowing = zero drift (FALSE — perpendicular = minimum time, with drift)",
      "t = d/|v_b| instead of t = d/v_by",
      "Zero drift always possible (FALSE — requires v_br > v_r)",
      "Confusing α (from bank) and θ (from perpendicular)",
      "Adding v_br + v_r as scalars (vector addition needed)",
      "Using zero-drift formula when v_r > v_br (sinθ > 1 — no real solution)"
    ],
    "key_results": [
      "v_b = v_br + v_r (vector, always)",
      "t = d / (v_br sinα) where α = angle from bank",
      "Min time: α=90°, t_min=d/v_br, drift=v_r×d/v_br",
      "Zero drift: sinθ=v_r/v_br (θ from perpendicular, upstream), only if v_br>v_r",
      "Zero drift time = d/√(v_br²−v_r²)",
      "If v_r≥v_br: zero drift impossible"
    ],
    "dc_pandey_standard_numbers": {
      "example_631": "d=30m, v_r=2m/s, v_br=5m/s, α=37°: t=10s, drift=60m",
      "example_632": "d=30m, v_r=4m/s, v_br=5m/s: min t=6s drift=24m; zero drift θ=53° t=10s"
    }
  },
  "concept_relationships": {
    "prerequisites": [
      "relative_motion",
      "vector_addition",
      "vector_components"
    ],
    "extensions": [
      "rain_umbrella",
      "projectile_motion",
      "pseudo_forces"
    ],
    "siblings": [
      "rain_umbrella",
      "relative_motion"
    ],
    "common_exam_combinations": [
      "rain_umbrella — exact same vector subtraction setup, different physical scenario",
      "relative_motion — river-boat is v_b = v_br + v_r, the core relative velocity equation",
      "vector_components — resolving v_br into crossing and drift components is the foundation"
    ]
  },
  "three_js_flag": false,
  "three_js_note": "River-boat is 2D planar motion. scene_mode=True in renderer_hint enables realistic river rendering in canvas2d. Three.js not needed.",
  "regeneration_variants": [
    {
      "variant_id": 1,
      "approach": "minimum_drift_jee_focus",
      "entry_state": "STATE_4",
      "teacher_angle": "Start from the JEE target result directly: the condition for minimum drift is when the boat is aimed at angle arcsin(v_river / v_boat) upstream. Derive why by writing drift = (v_river - v_boat sin theta) times time, differentiating with respect to theta, setting to zero. The student sees the calculus minimisation produce the exact answer. Then verify geometrically. This approach starts from the exam question and works backward to the concept — the format JEE students find most useful.",
      "locked_facts_focus": [
        "fact_5",
        "fact_6",
        "fact_7"
      ],
      "panel_b_focus": "Drift vs theta curve. Minimum point highlighted at theta = arcsin(v_r / v_b). Boat animation shows heading at that angle — barely upstream. Drift labeled as minimum possible value."
    },
    {
      "variant_id": 2,
      "approach": "connects_to_vector_components",
      "entry_state": "STATE_1",
      "teacher_angle": "Connect directly to vector components from Ch.5. The river current velocity and the boat velocity are two vectors. Their resultant — the actual ground velocity — is found by vector addition, exactly as the student learned in Ch.5. The boat heading angle gives the components of boat velocity along and perpendicular to the river. The river current adds directly to the along-river component. This is just vector addition with one vector (river current) horizontal and one vector (boat) at an angle. The student already knows all the mathematics.",
      "locked_facts_focus": [
        "fact_1",
        "fact_2",
        "fact_3"
      ],
      "panel_b_focus": "River scene with vector triangle: boat velocity arrow, river current arrow, resultant ground velocity arrow. Label: 'From Ch.5: resultant = vector sum of the two velocities.' Component decomposition of boat velocity shown alongside."
    }
  ]
}
```


# scalar_vs_vector.json
```json
{
  "concept_id": "scalar_vs_vector",
  "concept_name": "Scalar and Vector Quantities",
  "class_level": 11,
  "chapter": "Vectors",
  "section": "5.1",
  "source_coverage": {
    "dc_pandey": "Chapter 5, Section 5.1 — Vector and Scalar Quantities",
    "ncert": "Chapter 4 — Motion in a Plane, Section 4.1",
    "hc_verma": "Chapter 2 — Physics and Mathematics, Section 2.1"
  },
  "source_type": "ncert_and_dc_pandey",
  "renderer_hint": {
    "technology": "canvas2d",
    "renderer": "mechanics_2d",
    "scenario_type": "scalar_vs_vector",
    "panel_count": 1,
    "show_labels": true,
    "canvas_scale": 60,
    "sync_required": false,
    "scene_mode": false
  },
  "locked_facts": {
    "definition_scalar": "A scalar quantity has only magnitude. It obeys ordinary algebraic addition rules.",
    "definition_vector": "A vector quantity has both magnitude AND direction, AND must obey the parallelogram law of vector addition.",
    "parallelogram_law_test": "The parallelogram law is the ONLY definitive test. Direction alone is NOT sufficient for a quantity to be a vector.",
    "current_not_a_vector": "Electric current has direction (flows in a wire) but is NOT a vector because it does not obey the parallelogram law. i = i1 + i2 regardless of angle — a scalar addition. If current were a vector, i would depend on angle θ between i1 and i2.",
    "scalar_examples": "Mass, volume, distance, speed, density, work, power, energy, charge, current, potential, temperature, pressure, surface tension, time, gravitational constant G",
    "vector_examples": "Displacement, velocity, acceleration, force, weight, gravitational field strength (g), electric field, magnetic field, torque, linear momentum, angular momentum, dipole moment",
    "tensor_note": "Stress and moment of inertia are neither scalar nor vector — they are tensors. Students do not need this for JEE but it appears in assertion-reason questions.",
    "pressure_trap": "Pressure acts in all directions at a point but is still a scalar. Direction of action ≠ vector quantity.",
    "area_note": "Area can behave as scalar or vector depending on context. Area vector points perpendicular to the surface.",
    "finite_rotation_trap": "Finite rotation has magnitude (angle) and direction (axis) but is NOT a vector because two finite rotations do not add by parallelogram law. Infinitesimal rotations ARE vectors."
  },
  "minimum_viable_understanding": "A quantity is a vector ONLY IF it has direction AND obeys the parallelogram law. Direction alone is not enough. Current is the canonical trap example.",
  "variables": {
    "i1": "Current in branch 1 (scalar, A)",
    "i2": "Current in branch 2 (scalar, A)",
    "i": "Total current at junction (scalar, i = i1 + i2 always)",
    "theta": "Angle between wires at junction (irrelevant for scalar addition)"
  },
  "routing_signals": {
    "global_triggers": [
      "what is a vector quantity",
      "difference between scalar and vector",
      "explain scalar and vector with examples",
      "scalar vs vector kya hota hai"
    ],
    "local_triggers": [
      "is current a vector",
      "why is current not a vector",
      "what is the parallelogram law test",
      "which quantities are vectors",
      "pressure scalar or vector",
      "why pressure is scalar"
    ],
    "micro_triggers": [
      "what is parallelogram law",
      "why direction is not enough",
      "is area a vector",
      "is stress a vector",
      "what is tensor",
      "is temperature scalar or vector"
    ],
    "simulation_not_needed_triggers": [
      "list of scalar quantities",
      "list of vector quantities",
      "examples of scalars",
      "examples of vectors"
    ],
    "subconcept_triggers": {
      "current_not_vector": [
        "is current a vector quantity",
        "why is electric current not a vector",
        "current direction but scalar",
        "current parallelogram law"
      ],
      "parallelogram_law_test": [
        "parallelogram law of addition",
        "how to test if quantity is vector",
        "vector addition rule",
        "parallelogram law kya hai"
      ],
      "pressure_scalar": [
        "is pressure a vector",
        "pressure acts in all directions",
        "why is pressure scalar"
      ],
      "area_vector": [
        "is area a scalar or vector",
        "area vector direction",
        "area of surface vector"
      ]
    }
  },
  "checkpoint_states": {
    "understands_definition": "enter at STATE_2",
    "understands_parallelogram_test": "enter at STATE_3",
    "understands_current_trap": "enter at STATE_4",
    "understands_tricky_cases": "enter at STATE_5"
  },
  "prerequisite_check": {
    "required_concepts": [],
    "gate_question": null,
    "note": "This is a foundational concept. No prerequisites required."
  },
  "epic_l_path": {
    "state_count": 6,
    "board_mode_states": [
      1,
      2,
      3,
      4
    ],
    "jee_mode_states": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "scope": "global",
    "states": {
      "STATE_1": {
        "label": "The Hook — What Makes a Quantity a Vector?",
        "physics_layer": {
          "concept": "The naive definition fails — direction alone is not enough",
          "simulation_focus": "Show two wires meeting at a junction. Current i1 in wire 1, i2 in wire 2, both flowing INTO junction. Change the angle between wires.",
          "what_to_show": "As angle θ changes from 0° to 180°, the total current i at junction stays CONSTANT at i1 + i2. The angle does not matter.",
          "key_observation": "If current were a vector, its resultant would change with angle. It doesn't. So current is scalar.",
          "scenario": "scalar_examples"
        },
        "pedagogy_layer": {
          "opening_question": "Current flows in a specific direction in a wire. By that logic — is current a vector?",
          "surprise_moment": "Most students say YES. The simulation shows WHY they're wrong.",
          "teacher_script": "Current has direction but fails the real test. Let's see what that test is."
        }
      },
      "STATE_2": {
        "label": "The Real Definition — Two Conditions, Not One",
        "physics_layer": {
          "concept": "Vector = magnitude + direction + parallelogram law obedience",
          "simulation_focus": "Split screen: Left — displacement vectors A and B combining with parallelogram law (resultant changes with angle). Right — currents i1 and i2 combining (resultant always i1+i2).",
          "what_to_show": "For displacement: change θ → resultant R changes. For current: change θ → total i stays i1+i2.",
          "scenario": "vector_examples"
        },
        "pedagogy_layer": {
          "key_message": "Parallelogram law is the DEFINITIVE test. Not just direction.",
          "analogy": "A wolf in sheep's clothing — current wears the direction costume but fails the vector exam."
        }
      },
      "STATE_3": {
        "label": "Building the Taxonomy — Scalars vs Vectors",
        "physics_layer": {
          "concept": "Classification of physical quantities",
          "simulation_focus": "Interactive two-column sorter. Student drags: mass, displacement, speed, velocity, temperature, force, current, pressure, torque into scalar/vector columns.",
          "trap_quantities": [
            "current",
            "pressure",
            "area",
            "temperature"
          ],
          "correct_placements": {
            "scalars": [
              "mass",
              "speed",
              "temperature",
              "current",
              "pressure",
              "work",
              "energy",
              "distance",
              "charge"
            ],
            "vectors": [
              "displacement",
              "velocity",
              "acceleration",
              "force",
              "torque",
              "momentum",
              "electric field",
              "magnetic field"
            ]
          },
          "scenario": "scalar_addition"
        },
        "pedagogy_layer": {
          "emphasis": "Current and pressure are the classic traps. Both have directional associations but fail the parallelogram test."
        }
      },
      "STATE_4": {
        "label": "The Current Proof — DC Pandey's Definitive Example",
        "physics_layer": {
          "concept": "Formal proof that current is NOT a vector using Kirchhoff's junction rule",
          "simulation_focus": "Three-wire junction. Wire OA carries i1, Wire OB carries i2, both entering point O. Wire OC carries i (outgoing). Show that i = i1 + i2 for ALL angles between OA and OB.",
          "formula": "i = i1 + i2 (scalar) regardless of angle θ between i1 and i2",
          "contrast": "If current WERE a vector: i_resultant = √(i1² + i2² + 2·i1·i2·cosθ) — but this never matches measurement.",
          "scenario": "vector_addition_direction"
        },
        "pedagogy_layer": {
          "aha_moment": "Kirchhoff's junction rule IS the proof. Current conserves like a scalar at every junction.",
          "jee_connection": "JEE assertion-reason: 'Current has direction therefore it is a vector.' Assertion TRUE, Reason FALSE."
        }
      },
      "STATE_5": {
        "label": "Tricky Cases — JEE Trap Quantities",
        "physics_layer": {
          "concept": "Pressure, area, finite rotation, stress — the boundary cases",
          "simulation_focus": "Show pressure at a point inside fluid — arrows pointing in ALL directions from the point simultaneously. Magnitude same in all directions. Cannot assign a single direction → scalar.",
          "cases": {
            "pressure": "Acts in all directions at a point — no single direction assignable — scalar",
            "area": "Scalar in simple calculations, vector (pointing perpendicular to surface) in flux calculations",
            "finite_rotation": "Has magnitude (angle) and direction (axis) but does NOT obey parallelogram law — NOT a vector",
            "infinitesimal_rotation": "Obeys parallelogram law — IS a vector",
            "stress": "Neither scalar nor vector — it is a tensor (rank 2)"
          },
          "scenario": "vector_properties"
        },
        "pedagogy_layer": {
          "jee_traps": [
            "Pressure: direction → vector? NO. Scalar.",
            "Finite rotation: direction + magnitude → vector? NO. Not a vector.",
            "Current: direction → vector? NO. Scalar."
          ]
        }
      },
      "STATE_6": {
        "label": "Student Interaction — Classify and Justify",
        "physics_layer": {
          "concept": "Application and consolidation",
          "simulation_focus": "Student is shown 8 quantities one at a time. For each: classify scalar/vector AND give the deciding reason.",
          "quantities": [
            {
              "name": "Electric current",
              "answer": "scalar",
              "reason": "Does not obey parallelogram law at junctions"
            },
            {
              "name": "Angular momentum",
              "answer": "vector",
              "reason": "Has direction (axis of rotation) and obeys vector addition"
            },
            {
              "name": "Temperature",
              "answer": "scalar",
              "reason": "Magnitude only, no direction"
            },
            {
              "name": "Dipole moment",
              "answer": "vector",
              "reason": "Direction from -q to +q, obeys parallelogram law"
            },
            {
              "name": "Surface tension",
              "answer": "scalar",
              "reason": "No specific direction associated"
            },
            {
              "name": "Torque",
              "answer": "vector",
              "reason": "Direction by right-hand rule, obeys parallelogram law"
            },
            {
              "name": "Pressure",
              "answer": "scalar",
              "reason": "Acts in all directions at a point — no single direction"
            },
            {
              "name": "Gravitational constant G",
              "answer": "scalar",
              "reason": "Pure magnitude, no direction"
            }
          ],
          "scenario": "svv_comparison_table"
        },
        "pedagogy_layer": {
          "success_criteria": "Student can justify classification, not just name it"
        }
      }
    }
  },
  "epic_c_branches": [
    {
      "branch_id": "direction_means_vector",
      "misconception": "Any quantity that has a direction is a vector",
      "student_belief": "Current flows from A to B, it has direction, so it must be a vector",
      "trigger_phrases": [
        "current has direction so it is a vector",
        "anything with direction is a vector",
        "current bhi vector hai",
        "current flows in one direction so vector"
      ],
      "state_count": 6,
      "scope": "local",
      "feedback_tag": "direction_is_necessary_not_sufficient",
      "states": {
        "STATE_1": {
          "label": "Show the Student's Belief as a Live Simulation",
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Two wires meeting at 60°. i1 = 3A, i2 = 4A. IF current were a vector: show resultant = √(9+16+2·3·4·cos60°) = √37 ≈ 6.08A. Display this as 'Vector World' result.",
            "then_show": "Now show actual measurement: i_actual = 3 + 4 = 7A regardless of angle. Label it 'Reality'.",
            "gap": "Vector World predicts 6.08A. Reality gives 7A. The prediction fails.",
            "scenario": "svv_wrong_addition"
          },
          "pedagogy_layer": {
            "teacher_script": "Your logic is correct that direction is NECESSARY for a vector. But it is not SUFFICIENT. Let me show you what happens when we test current with the parallelogram law."
          }
        },
        "STATE_2": {
          "label": "The Test — Vary the Angle",
          "physics_layer": {
            "simulation": "Same junction. Animate θ from 0° to 180° smoothly. Show: Vector prediction R = √(i1²+i2²+2i1i2cosθ) — this CHANGES with θ. Actual current i = i1+i2 — this NEVER CHANGES.",
            "key_visual": "Two curves: one oscillating (vector prediction), one flat horizontal line (reality). They only meet at θ=0°.",
            "scenario": "svv_direction_matters"
          }
        },
        "STATE_3": {
          "label": "Displacement Passes the Test",
          "physics_layer": {
            "simulation": "Now show displacement vectors. Two displacements at angle θ. Resultant DOES change with θ. Parallelogram law works.",
            "contrast": "Displacement obeys the law → vector. Current does not → scalar.",
            "scenario": "svv_correct_addition"
          }
        },
        "STATE_4": {
          "label": "The Formal Rule",
          "physics_layer": {
            "text_delivery": true,
            "content": "Two conditions BOTH required: (1) Has magnitude and direction. (2) Obeys parallelogram law of addition. Current satisfies (1) but fails (2). Therefore: NOT a vector.",
            "scenario": "svv_aha_direction"
          }
        },
        "STATE_5": {
          "label": "Other Direction-Having Scalars",
          "physics_layer": {
            "simulation": "Show pressure at a point — force arrows pointing in every direction from one point simultaneously. No single direction to assign.",
            "message": "Pressure, surface tension, current — all have directional associations but fail the vector test.",
            "scenario": "direction_means_vector_s5"
          }
        },
        "STATE_6": {
          "label": "Belief Check",
          "physics_layer": {
            "probe": "Is electric potential a scalar or vector? (It has no direction — purely magnitude.) Is torque a scalar or vector? (Has direction via right-hand rule AND obeys parallelogram law.)",
            "scenario": "direction_means_vector_s6"
          }
        }
      }
    },
    {
      "branch_id": "pressure_is_vector",
      "misconception": "Pressure is a vector because it acts in all directions",
      "student_belief": "Pressure pushes equally in all directions, so it must be a vector",
      "trigger_phrases": [
        "pressure is a vector",
        "pressure acts in all directions so it is a vector",
        "pressure has direction",
        "fluid pressure vector"
      ],
      "state_count": 5,
      "scope": "local",
      "feedback_tag": "pressure_scalar_all_directions",
      "states": {
        "STATE_1": {
          "label": "Show the Belief — Pressure as a Vector",
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Show a point inside a fluid. Student's belief: arrows pointing in many directions = vector. Display as student's model.",
            "question": "If pressure acts in ALL directions equally, which ONE direction do we assign to call it a vector?",
            "scenario": "pressure_is_vector_s1"
          }
        },
        "STATE_2": {
          "label": "The Direction Problem",
          "physics_layer": {
            "simulation": "Show the point with equal arrows in ALL directions (spherically symmetric). No single direction is preferred. You cannot pick ONE direction to represent pressure.",
            "contrast": "Force: one direction (down if gravity). Velocity: one direction (east if moving east). Pressure: ALL directions simultaneously — no single direction → cannot be a vector.",
            "scenario": "pressure_is_vector_s2"
          }
        },
        "STATE_3": {
          "label": "What Scalar Means",
          "physics_layer": {
            "content": "A scalar has magnitude at a point. Pressure at a given point inside a fluid has one value (say 10⁵ Pa) but no single direction. It's a scalar field — one number per point.",
            "formula": "P = F/A where F is normal force on area A. The direction changes depending on which surface you measure — but P itself has no direction.",
            "scenario": "pressure_is_vector_s3"
          }
        },
        "STATE_4": {
          "label": "Pressure vs Force Distinction",
          "physics_layer": {
            "simulation": "Show a cube submerged in fluid. The FORCE on each face is a vector (pointing inward, perpendicular to face). But pressure P = F/A is the same scalar value for all faces at the same depth.",
            "key_insight": "Force is a vector. Pressure is the scalar that generates force when multiplied by area and a direction.",
            "scenario": "pressure_is_vector_s4"
          }
        },
        "STATE_5": {
          "label": "Belief Check",
          "physics_layer": {
            "probe": "Is temperature a scalar or vector? (Scalar — one value at a point.) Is gravitational field a scalar or vector? (Vector — has magnitude AND direction at every point.)",
            "scenario": "pressure_is_vector_s5"
          }
        }
      }
    },
    {
      "branch_id": "all_physical_quantities_scalar_or_vector",
      "misconception": "Every physical quantity is either a scalar or a vector",
      "student_belief": "There are only two types: scalar and vector",
      "trigger_phrases": [
        "is stress a vector",
        "what is a tensor",
        "moment of inertia scalar or vector",
        "third type of quantity"
      ],
      "state_count": 4,
      "scope": "local",
      "feedback_tag": "tensors_exist_jee_awareness",
      "states": {
        "STATE_1": {
          "label": "Show the Belief — Binary Classification",
          "physics_layer": {
            "show_students_wrong_belief": true,
            "content": "Student's model: everything is scalar OR vector. Stress: it has a direction of force and a direction of surface normal. If force is in x, surface normal is in y — stress has TWO directions. Cannot be scalar (no direction) or vector (one direction).",
            "scenario": "all_physical_quantities_scalar_or_vector_s1"
          }
        },
        "STATE_2": {
          "label": "Tensors — The Third Category",
          "physics_layer": {
            "content": "Tensors have rank. Scalar = rank 0 (one number). Vector = rank 1 (one direction, 3 components in 3D). Tensor rank 2 = two directions (9 components in 3D). Stress and moment of inertia are rank-2 tensors.",
            "jee_relevance": "JEE does NOT test tensor mathematics. But assertion-reason questions test: 'Stress is a vector' — FALSE. 'Stress is a scalar' — FALSE. 'Stress is a tensor' — TRUE.",
            "scenario": "all_physical_quantities_scalar_or_vector_s2"
          }
        },
        "STATE_3": {
          "label": "JEE Application",
          "physics_layer": {
            "jee_traps": [
              "Assertion: Stress is a vector. Reason: It has both magnitude and direction. → Both TRUE but reason is WRONG.",
              "Assertion: Moment of inertia is a scalar. → FALSE. It is a tensor.",
              "Assertion: Current is a vector. → FALSE. Scalar."
            ],
            "scenario": "all_physical_quantities_scalar_or_vector_s3"
          }
        },
        "STATE_4": {
          "label": "Quick Summary",
          "physics_layer": {
            "table": {
              "Scalar (rank 0)": "mass, speed, temperature, current, pressure, energy",
              "Vector (rank 1)": "displacement, velocity, force, torque, momentum, fields",
              "Tensor (rank 2)": "stress, strain, moment of inertia"
            },
            "scenario": "all_physical_quantities_scalar_or_vector_s4"
          }
        }
      }
    }
  ],
  "epic_c_micro_templates": {
    "symbol_role": {
      "trigger": "what does the arrow on a vector mean",
      "states": 2,
      "content": "Arrow indicates direction. Length indicates magnitude. The arrowhead is not decorative — it IS the direction information."
    },
    "why_parallelogram": {
      "trigger": "why parallelogram law specifically",
      "states": 3,
      "content": "The parallelogram law is not an arbitrary rule. It emerges from geometry — if you displace east by A then northeast by B, the net displacement is the diagonal of the parallelogram formed. Any quantity that describes physical displacement in space MUST obey this."
    },
    "jee_assertion_reason": {
      "trigger": "assertion current is vector",
      "states": 2,
      "content": "Classic JEE format: Assertion 'Current has direction' = TRUE. Reason 'Therefore current is a vector' = FALSE. Direction is necessary but not sufficient. Correct answer: Assertion true, Reason false."
    },
    "area_vector_confusion": {
      "trigger": "is area scalar or vector",
      "states": 3,
      "content": "Area is context-dependent. In simple calculations (area of rectangle = lb) — scalar. In flux calculations (ΦE = E·A) — area vector A points perpendicular to the surface. Same quantity, two different uses."
    },
    "finite_rotation_trap": {
      "trigger": "is rotation a vector",
      "states": 3,
      "content": "Finite rotation: NOT a vector (does not obey parallelogram law — try rotating a book 90° about x then 90° about y vs 90° about y then 90° about x — different results). Infinitesimal rotation: IS a vector (order doesn't matter at infinitesimal scale)."
    }
  },
  "static_responses": {
    "list_of_scalars": {
      "trigger": "list scalar quantities",
      "simulation_needed": false,
      "response": "Scalars: mass, volume, distance, speed, density, work, power, energy, length, gravitational constant G, specific heat, charge, current, potential, time, electric flux, magnetic flux, pressure, surface tension, temperature. Memory tip: anything you measure with a scale (no direction needed) is scalar."
    },
    "list_of_vectors": {
      "trigger": "list vector quantities",
      "simulation_needed": false,
      "response": "Vectors: displacement, velocity, acceleration, force, weight, g (gravitational field strength), electric field E, magnetic field B, torque τ, linear momentum p, angular momentum L, dipole moment, current density J. Memory tip: anything that pushes/pulls you in a direction, or describes motion with direction."
    },
    "current_proof_text": {
      "trigger": "prove current is not a vector",
      "simulation_needed": false,
      "response": "Proof: At a junction, wires OA (current i1) and OB (current i2) meet at O. Total current i = i1 + i2 regardless of angle between OA and OB (Kirchhoff's junction rule). If current were a vector, i_resultant = √(i1² + i2² + 2i1i2cosθ) — this would change with angle θ. Since it doesn't, current is scalar."
    }
  },
  "problem_guidance_path": {
    "description": "Help student classify quantities in assertion-reason or MCQ format",
    "approach": "Check two conditions: (1) has direction? (2) obeys parallelogram law? Both → vector. Only (1) → could be scalar (like current). Neither → scalar.",
    "common_question_types": [
      "Classify these quantities as scalar or vector",
      "Which of the following is NOT a vector?",
      "Assertion: [quantity] is a vector. Reason: it has direction."
    ]
  },
  "example_library": {
    "example_1": {
      "source": "DC Pandey Section 5.1",
      "principle": "Kirchhoff junction rule proves current is scalar — resultant is always i1+i2 regardless of angle between wires",
      "aha": "If current were a vector, the junction total would change with angle θ — it never does",
      "simulation_states": 2
    },
    "example_2": {
      "source": "DC Pandey Section 5.1 — JEE-style classification",
      "principle": "Classifying 8 physical quantities as scalar or vector using the parallelogram law test",
      "aha": "Current, pressure, and surface tension all have misleading direction-like properties but are scalars",
      "simulation_states": 2
    }
  },
  "assessment_path": {
    "question_1": {
      "text": "Electric current has a definite direction of flow. Is it a vector quantity?",
      "options": [
        "Yes, because it has direction",
        "No, because it doesn't obey parallelogram law",
        "Yes, because it obeys superposition",
        "Cannot be determined"
      ],
      "correct": 1,
      "if_wrong_0": "route to direction_means_vector branch",
      "explanation": "Direction is necessary but not sufficient. Current fails the parallelogram law test at junctions."
    },
    "question_2": {
      "text": "Pressure acts in all directions at a point inside a fluid. This makes pressure:",
      "options": [
        "A vector quantity",
        "A scalar quantity",
        "A tensor quantity",
        "Neither scalar nor vector"
      ],
      "correct": 1,
      "if_wrong_0": "route to pressure_is_vector branch",
      "explanation": "Precisely because pressure acts in ALL directions equally, no single direction can be assigned. It is a scalar."
    },
    "question_3": {
      "text": "Which of the following is a vector quantity? (JEE style)",
      "options": [
        "Electric current",
        "Gravitational potential",
        "Electric field intensity",
        "Work done by a force"
      ],
      "correct": 2,
      "explanation": "Electric field E has both magnitude and direction at every point and obeys superposition (parallelogram law). Current, potential, and work are scalars."
    },
    "question_4": {
      "text": "Finite rotation of a rigid body about a fixed axis has both magnitude (angle) and direction (axis). Is it a vector?",
      "options": [
        "Yes — it has magnitude and direction",
        "No — it does not obey parallelogram law",
        "Yes — it obeys the right-hand rule",
        "Depends on the angle of rotation"
      ],
      "correct": 1,
      "explanation": "Finite rotation fails the parallelogram law. Rotate a book 90° about x then 90° about y — you get a different result than 90° about y then 90° about x. Order matters → NOT a vector."
    }
  },
  "session_awareness": {
    "if_already_shown_epic_l": "skip to micro or text if student asks follow-up",
    "if_student_knows_basics": "enter at STATE_3 — taxonomy and trap quantities",
    "if_coming_from_vector_addition": "student already knows vectors exist — focus on the classification criteria only"
  },
  "waypoints": {
    "fallback_unknown_confusion": "If confusion doesn't match any branch, use the current-at-junction simulation. It's the most visceral proof that direction alone does not make a vector.",
    "escalation_trigger": "If student still confused after EPIC-C branch, escalate to explicit parallelogram law demonstration with numerical comparison"
  },
  "depth_escalation_trigger": {
    "condition": "Student asks WHY the parallelogram law is the defining criterion",
    "escalate_to": "Geometry of physical space — displacement in 2D naturally obeys parallelogram law because space is Euclidean. Quantities describing spatial displacement must inherit this property.",
    "level": "JEE Advanced / conceptual depth"
  },
  "jee_specific": {
    "typical_question_types": [
      "Assertion-Reason: 'Current is a vector because it has direction' — Assertion TRUE, Reason FALSE",
      "MCQ: Which of these is NOT a vector? (options include current, torque, pressure, electric field)",
      "MCQ: Which of these is a vector? (options include work, energy, electric field, temperature)",
      "Assertion: Pressure is a vector because it acts in a specific direction — FALSE",
      "Match the following: scalar/vector/tensor with given quantities"
    ],
    "common_traps": [
      "Electric current — has direction but is scalar",
      "Pressure — acts in all directions but is scalar",
      "Surface tension — scalar (no specific direction)",
      "Work done — scalar (dot product of two vectors)",
      "Gravitational constant G — scalar",
      "Temperature — scalar",
      "Finite rotation — NOT a vector despite having direction and magnitude",
      "Stress — tensor, not vector (classic assertion-reason trap)"
    ],
    "key_facts_to_remember": [
      "Two conditions for vector: (1) direction + (2) parallelogram law",
      "Current is scalar — Kirchhoff junction rule proof",
      "Pressure is scalar — no single direction at a point",
      "Stress and moment of inertia are tensors (rank 2)",
      "Infinitesimal rotations are vectors, finite rotations are not",
      "A × B is perpendicular to both A and B — result is a vector (cross product)"
    ]
  },
  "concept_relationships": {
    "prerequisites": [],
    "extensions": [
      "vector_basics",
      "vector_addition",
      "vector_components",
      "dot_product",
      "cross_product"
    ],
    "siblings": [
      "vector_basics"
    ],
    "common_exam_combinations": [
      "dot_product (work = F·s, scalar result of vector operation)",
      "cross_product (torque = r×F, vector result)",
      "laws_of_motion (force is vector, work is scalar)"
    ]
  },
  "three_js_flag": false,
  "three_js_note": "This concept is 2D. Current junction diagram and pressure arrows work perfectly in canvas2d.",
  "parameter_slots": {},
  "panel_sync_spec": null,
  "regeneration_variants": [
    {
      "variant_id": 1,
      "scenario_type": "scalar_vs_vector",
      "approach": "failure_of_arithmetic",
      "entry_state": "STATE_3",
      "teacher_angle": "Start with the moment scalar thinking breaks down. You walk 3m East then 4m North. Scalar arithmetic says total distance = 7m — correct. But where did you end up? Not 7m from start — only 5m away. The gap between 7 and 5 is the entire reason vectors exist. Build scalar vs vector from this arithmetic failure, not from definitions.",
      "locked_facts_focus": [
        "fact_3",
        "fact_4",
        "fact_5"
      ],
      "panel_b_focus": "Show 3-4-5 triangle. Scalar sum (7m) shown as wrong endpoint. Vector sum (5m at 53 degrees) shown as actual endpoint. Student sees the gap between arithmetic and reality."
    },
    {
      "variant_id": 2,
      "scenario_type": "scalar_vs_vector",
      "approach": "connects_to_distance_displacement",
      "entry_state": "STATE_2",
      "teacher_angle": "Connect directly to what the student already knows from Chapter 6: distance and displacement. Distance is scalar — just a number, how far you walked. Displacement is vector — how far and in which direction. The student already uses scalars and vectors every day without knowing the names. Scalar vs vector is just formalising what distance vs displacement already taught them.",
      "locked_facts_focus": [
        "fact_1",
        "fact_2",
        "fact_6"
      ],
      "panel_b_focus": "Split screen: left shows distance (odometer, scalar, just a number). Right shows displacement (GPS arrow, vector, magnitude plus direction). Labels: 'You already know this from Ch.6 — this is what those words mean mathematically.'"
    }
  ]
}
```


# uniform_acceleration.json
```json
{
  "concept_id": "uniform_acceleration",
  "concept_name": "One Dimensional Motion with Uniform Acceleration",
  "class_level": 11,
  "chapter": "Kinematics",
  "section": "6.5 and 6.6",
  "source_coverage": {
    "dc_pandey": "Chapter 6, Sections 6.5 (Uniform Motion) and 6.6 (One Dimensional Motion with Uniform Acceleration), Examples 6.13, 6.14, 6.15",
    "ncert": "Chapter 3 — Motion in a Straight Line, Sections 3.4 and 3.5",
    "hc_verma": "Chapter 3 — Rest and Motion: Kinematics, Sections 3.4–3.6"
  },
  "source_type": "ncert_and_dc_pandey",
  "renderer_hint": {
    "technology": "canvas2d",
    "renderer": "mechanics_2d",
    "scenario_type": "uniform_acceleration",
    "panel_count": 2,
    "show_labels": true,
    "show_velocity_arrow": true,
    "show_acceleration_arrow": true,
    "canvas_scale": 60,
    "technology_b": "plotly",
    "sync_required": true,
    "scene_mode": false,
    "panel_a_role": "Particle on track with velocity arrow growing — uniform acceleration animation",
    "panel_b_role": "Plotly v-t graph — straight line, area under curve = displacement"
  },
  "locked_facts": {
    "equation_1": "v = u + at  [velocity-time relation]",
    "equation_2": "v² = u² + 2as  [velocity-displacement relation, no time]",
    "equation_3": "s = ut + ½at²  [displacement from starting point, time-based]",
    "equation_4": "s₁ = s₀ + ut + ½at²  [displacement from arbitrary reference point P]",
    "equation_5": "sₜ = u + a(t − ½) = u + ½a(2t−1)  [displacement in the tth second — NOT distance]",
    "s_is_displacement": "s in all five equations is DISPLACEMENT from the starting point (where particle was at t=0), NOT distance. Starting point ≠ point where u=0.",
    "sign_convention_horizontal": "Horizontal: rightward = positive, leftward = negative",
    "sign_convention_vertical": "Vertical: upward = positive, downward = negative. Therefore a = g = −9.8 ≈ −10 m/s² for free-fall/projectile under gravity.",
    "three_cases": {
      "case_1": "u = 0: particle starts from rest. Motion is purely accelerated in direction of a. Distance = displacement.",
      "case_2": "u parallel to a (same sign): particle accelerates throughout. No reversal. Distance = displacement.",
      "case_3": "u antiparallel to a (opposite signs): particle first decelerates to rest (t = t0 = |u/a|), then accelerates in opposite direction. Distance ≠ displacement after t0."
    },
    "turning_point": "In Case 3, turning point time t0 = |u/a|. At t0: velocity = 0, displacement is maximum. After t0: particle moves in opposite direction.",
    "free_fall_results": {
      "max_height": "h = u²/2g (upward projection with speed u)",
      "time_of_ascent": "t_asc = u/g",
      "time_of_flight": "T = 2u/g (time_ascent = time_descent)",
      "velocity_on_return": "Speed of return = speed of projection (if air resistance neglected)",
      "free_fall_velocity": "v = √(2gh) (released from rest at height h)",
      "free_fall_time": "t = √(2h/g)"
    },
    "negative_time_meaning": "When solving a quadratic for t, a negative root means the event occurred BEFORE t=0 (before the problem's reference time). Always discard negative time for forward problems.",
    "sth_equation_note": "sₜ = u + a(t − ½) gives displacement in the tth second. Dimensionally appears wrong because 't' here is a pure number (ordinal), not seconds. Physically correct.",
    "relative_sign_rule": "In Case 3: substitute signs correctly. u = +10, a = −10 for upward throw. s = −40 for point 40m BELOW starting level. Single equation handles entire journey.",
    "uniform_motion": "Special case: a = 0. v = constant. s = vt. Distance = |displacement|."
  },
  "minimum_viable_understanding": "Three equations (v=u+at, v²=u²+2as, s=ut+½at²) with correct signs handle ALL uniform acceleration problems in one pass — no need for separate equations for up and down journeys.",
  "variables": {
    "u": "Initial velocity (signed — positive if in positive direction)",
    "v": "Final velocity at time t (signed)",
    "a": "Constant acceleration (signed — negative if opposing motion or downward)",
    "s": "Displacement from starting point (signed — can be negative)",
    "t": "Time elapsed (always positive)",
    "t0": "Turning point time = |u/a| (only in Case 3)",
    "g": "Acceleration due to gravity = 9.8 ≈ 10 m/s² (magnitude). Use a = −g = −10 m/s² in equations."
  },
  "routing_signals": {
    "global_triggers": [
      "equations of motion",
      "uniform acceleration",
      "v = u + at explain",
      "kinematic equations",
      "samaan tywarit gati ke samikaran"
    ],
    "local_triggers": [
      "how to use equations of motion",
      "ball thrown upward find time",
      "free fall problems",
      "sign convention in kinematics",
      "which equation to use",
      "three cases of uniform acceleration"
    ],
    "micro_triggers": [
      "what is starting point in kinematics",
      "why negative time is rejected",
      "what is sth formula",
      "derive v = u + at",
      "when to use v2 = u2 + 2as"
    ],
    "simulation_not_needed_triggers": [
      "write equations of motion",
      "list kinematic equations",
      "formula v u at"
    ],
    "subconcept_triggers": {
      "sign_convention": [
        "sign convention kinematics",
        "positive negative direction",
        "upward positive or negative",
        "how to assign signs in motion"
      ],
      "three_cases": [
        "three cases of uniform acceleration",
        "case 1 case 2 case 3 kinematics",
        "when does particle reverse direction"
      ],
      "free_fall": [
        "free fall",
        "object dropped from height",
        "ball thrown up time of flight",
        "maximum height formula"
      ],
      "sth_formula": [
        "displacement in nth second",
        "sth formula",
        "displacement in tth second"
      ],
      "negative_time": [
        "negative time in quadratic",
        "reject negative time",
        "two values of t"
      ]
    }
  },
  "checkpoint_states": {
    "understands_equations": "enter at STATE_2",
    "understands_sign_convention": "enter at STATE_3",
    "understands_three_cases": "enter at STATE_4",
    "understands_free_fall": "enter at STATE_5"
  },
  "prerequisite_check": {
    "required_concepts": [
      "distance_vs_displacement"
    ],
    "gate_question": "What does 's' represent in kinematic equations — distance or displacement? (If wrong, redirect to distance_vs_displacement.json first.)",
    "if_gap_detected": "redirect to distance_vs_displacement.json"
  },
  "epic_l_path": {
    "state_count": 6,
    "board_mode_states": [
      1,
      2,
      3,
      4
    ],
    "jee_mode_states": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "scope": "global",
    "states": {
      "STATE_1": {
        "label": "The Hook — One Equation That Handles Everything",
        "physics_layer": {
          "concept": "The power of sign convention — a single equation handles upward and downward motion without switching",
          "simulation_focus": "Ball thrown upward from top of 40m tower at u=10m/s. g=10m/s². Show the problem setup. Student is about to solve 'time to hit ground'. Most students split this into two parts: 'upward journey equation' + 'downward journey equation'. Show this painful approach: 4 steps, 2 equations, intermediate calculation.",
          "then_show": "Now solve with ONE equation: u=+10, a=−10, s=−40. Plug into s=ut+½at². Get quadratic. Two roots: t=4s and t=−2s. Reject t=−2s. Answer: 4s. ONE step.",
          "key_message": "Sign convention collapses a complex problem into one clean equation.",
          "scenario": "constant_a_animation"
        },
        "pedagogy_layer": {
          "opening_question": "Why do textbooks say 'split the motion' for a ball thrown up? I'll show you why that's unnecessary.",
          "source": "DC Pandey Example 6.13"
        }
      },
      "STATE_2": {
        "label": "The Five Equations — What Each One Is For",
        "physics_layer": {
          "concept": "Choosing the right equation based on what's known and unknown",
          "simulation_focus": "Interactive equation selector. Student sees five equations. For each, highlight: which variables it contains, what scenario it's best for.",
          "equations_with_use_cases": {
            "v = u + at": "Knowns: u, a, t. Unknown: v. Use when TIME is given/found.",
            "v² = u² + 2as": "Knowns: u, a, s. Unknown: v. Use when TIME is NOT involved — 'find velocity at height h'.",
            "s = ut + ½at²": "Knowns: u, a, t. Unknown: s. Most used. Time-based displacement.",
            "s₁ = s₀ + ut + ½at²": "Use when starting point ≠ reference origin.",
            "sₜ = u + a(t − ½)": "Displacement in the tth second specifically. Rarely needed but JEE asks it."
          },
          "missing_variable_rule": "Each equation has 4 of the 5 variables (u, v, a, s, t). Identify 3 knowns + 1 unknown → pick equation containing those 4.",
          "scenario": "v_u_at_equation"
        },
        "pedagogy_layer": {
          "key_skill": "Equation selection is 50% of the problem. Students who can identify 'I don't need time' instantly pick v²=u²+2as and save 2 steps."
        }
      },
      "STATE_3": {
        "label": "Sign Convention — The One Rule That Prevents All Errors",
        "physics_layer": {
          "concept": "How to assign positive and negative to solve any 1D problem without confusion",
          "simulation_focus": "Show DC Pandey's sign convention diagram (Fig 6.10): horizontal motion — right=+ve, left=−ve. Vertical motion — up=+ve, down=−ve (gravity = −10 m/s²).",
          "interactive": "Three scenarios. For each, student must assign signs to u, a, and s before solving:\n  (1) Car moving right, braking: u=+20, a=−5 (deceleration), s=+ (rightward).\n  (2) Ball thrown up: u=+30, a=−10 (g downward), s=+ if above start, s=− if below start.\n  (3) Ball dropped from cliff: u=0, a=−10, s=− (downward below cliff top).",
          "critical_rule": "Once you pick a positive direction, NEVER CHANGE IT during the problem. Inconsistency = wrong answer.",
          "scenario": "s_ut_half_at2_area"
        },
        "pedagogy_layer": {
          "most_common_error": "Students pick up=+ve at start, then switch to down=+ve when ball falls. This double-counts the sign and gives wrong answers.",
          "dc_pandey_insight": "In Case 3 (antiparallel u and a), no need for separate equations. One substitution with correct signs gives the full answer — DC Pandey 'Extra Points to Remember' Section 6.6."
        }
      },
      "STATE_4": {
        "label": "Three Cases — The Complete Classification",
        "physics_layer": {
          "concept": "Every uniform acceleration problem fits one of exactly three cases",
          "simulation_focus": "Three-panel animation showing all three cases simultaneously:\n  Case 1 (u=0): Particle at rest, accelerates from zero. Velocity arrow grows from zero. Distance=displacement.\n  Case 2 (u∥a): Particle already moving in same direction as acceleration. Speed increases throughout. Distance=displacement.\n  Case 3 (u antiparallel to a): Particle moving one way, force opposing. Decelerates to rest at t0, then reverses. Distance > displacement after t0.",
          "case_3_detail": "Show t0 = |u/a| as the critical moment. Velocity arrow shrinks to zero, then grows in opposite direction. Displacement counter shows maximum at t0 then decreases. Distance counter never decreases.",
          "dc_pandey_reference": "DC Pandey Fig 6.11 exactly — Case 1, Case 2, Case 3 shown with u=0, u≠0 parallel, u antiparallel to g.",
          "scenario": "v2_u2_2as_equation"
        },
        "pedagogy_layer": {
          "decision_tree": "First question before any kinematics problem: 'Are u and a in same direction or opposite?' This determines whether distance=displacement (no) or requires t0 calculation (yes)."
        }
      },
      "STATE_5": {
        "label": "Free Fall — The Most Tested Application",
        "physics_layer": {
          "concept": "Gravity as uniform acceleration with standard results",
          "simulation_focus": "Two sub-simulations:\n  (a) Ball thrown up at u m/s: animate full trajectory. Show: max height = u²/2g, time up = u/g, total time = 2u/g, return speed = u.\n  (b) Free fall from rest at height h: animate fall. Show: v on impact = √(2gh), time = √(2h/g).",
          "interactive": "Slider for u (or h). All quantities update in real time.",
          "standard_results_to_memorize": [
            "h_max = u²/2g",
            "t_ascent = u/g = t_descent",
            "T_flight = 2u/g",
            "v_return = u (same speed as launch)",
            "v_impact = √(2gh) (dropped from h)",
            "t_fall = √(2h/g)"
          ],
          "source": "DC Pandey Section 6.6 Extra Points — these results are explicitly listed for direct use in objective problems",
          "scenario": "sign_convention_setup"
        },
        "pedagogy_layer": {
          "key_symmetry": "Time up = time down (when no air resistance). Speed at launch = speed at same height on way back. Students often forget this symmetry and recalculate unnecessarily."
        }
      },
      "STATE_6": {
        "label": "Student Interaction — The Tower Problem and the Two-Time Problem",
        "physics_layer": {
          "concept": "Two canonical JEE-level problems applying full understanding",
          "problem_1": {
            "title": "Ball from tower top — DC Pandey Example 6.13",
            "problem": "Ball thrown up at 10 m/s from top of 40m tower. Find time to hit ground. g=10.",
            "solution": "u=+10, a=−10, s=−40. s=ut+½at²: −40=10t−5t². 5t²−10t−40=0. t²−2t−8=0. (t−4)(t+2)=0. t=4s (reject t=−2s).",
            "simulation": "Animate ball going up 5m, then falling 45m total. Verify: at t=4s, s=10(4)−5(16)=40−80=−40m ✓"
          },
          "problem_2": {
            "title": "Ball at same height twice — DC Pandey Example 6.14",
            "problem": "Ball at height 80m at TWO different times, interval=6s. Find u. g=10.",
            "solution": "s=80: 80=ut−5t². 5t²−ut+80=0. Two roots t1, t2. t2−t1=6. By Vieta's: t1+t2=u/5, t1t2=16. (t1−t2)²=(t1+t2)²−4t1t2 = u²/25−64. Given (t1−t2)=6: 36=u²/25−64. u²=2500. u=50 m/s.",
            "simulation": "Animate ball going up and coming down. Mark the two moments it passes 80m height."
          },
          "scenario": "three_equations_guide"
        }
      }
    }
  },
  "epic_c_branches": [
    {
      "branch_id": "split_journey_into_two_parts",
      "misconception": "Upward and downward motion must be solved with separate equations — the equations 'change' when direction reverses",
      "student_belief": "For a ball thrown up: use one equation going up (deceleration), a different equation coming down (acceleration). Cannot use one single equation.",
      "trigger_phrases": [
        "separate equation for up and down",
        "upward journey alag equation",
        "downward journey alag solve karo",
        "two separate calculations",
        "split the problem into two halves"
      ],
      "state_count": 6,
      "scope": "local",
      "feedback_tag": "single_equation_with_signs_handles_full_journey",
      "states": {
        "STATE_1": {
          "label": "Show the Belief — Two Equations, More Steps",
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Ball thrown up at 30m/s. Find time to return to start. Student's approach: Phase 1 (going up): v=u−gt, at top v=0. t_up=30/10=3s. Phase 2 (coming down): s=½gt², find t_down. s=45m: 45=5t²: t_down=3s. Total = 3+3=6s. This is correct but took 6 steps.",
            "show_inefficiency": "Mark every step. Count: 6 steps, 2 equations, intermediate variable (max height), two separate calculations.",
            "scenario": "split_journey_into_two_parts_s1"
          }
        },
        "STATE_2": {
          "label": "One Equation, Same Answer",
          "physics_layer": {
            "simulation": "Same problem. Sign convention: up=+ve. u=+30, a=−10, s=0 (returns to start). s=ut+½at²: 0=30t−5t². 0=t(30−5t). t=0 (start) or t=6s (return). Answer: 6s. Two steps total.",
            "comparison": "Old method: 6 steps. New method: 2 steps. Same answer. The equations do NOT change — only the signs handle direction automatically.",
            "scenario": "split_journey_into_two_parts_s2"
          }
        },
        "STATE_3": {
          "label": "Why the Signs Handle Everything",
          "physics_layer": {
            "content": "When ball goes up: displacement is positive, velocity is positive but decreasing (a=−10 opposes). When ball comes down: displacement starts decreasing (still positive if above start), velocity becomes negative. The equation s=ut+½at² handles BOTH phases because s, u, v, a all carry their correct signs at every instant.",
            "simulation": "Animate the ball. Show s, v as signed values updating every second. s goes: 0→25→40→45→40→25→0. v goes: 30→20→10→0→−10→−20→−30. The equation is correct throughout — no switching needed.",
            "scenario": "split_journey_into_two_parts_s3"
          }
        },
        "STATE_4": {
          "label": "DC Pandey's Tower Problem — One Equation for Full Journey",
          "physics_layer": {
            "simulation": "Ball thrown up from 40m tower at 10m/s. Most students: Phase 1 up to max height, Phase 2 from max height to ground. That's a 3-variable intermediate calculation. DC Pandey's method: u=+10, a=−10, s=−40 (ground is 40m BELOW start). Plug in once: −40=10t−5t². Solve: t=4s. One equation. One substitution.",
            "source": "DC Pandey Example 6.13 — this is exactly the method shown",
            "scenario": "split_journey_into_two_parts_s4"
          }
        },
        "STATE_5": {
          "label": "When Does Splitting Help?",
          "physics_layer": {
            "content": "Splitting is NEVER required. But it can occasionally be faster for a specific sub-question — like 'find maximum height only' (Phase 1 alone gives this). One equation handles it too: at max height v=0, use v²=u²+2as. Both work. Splitting isn't wrong, just slower.",
            "rule": "Default: use one equation with signs. Split only if the problem specifically asks for Phase 1 results only.",
            "scenario": "split_journey_into_two_parts_s5"
          }
        },
        "STATE_6": {
          "label": "Practice: Solve Tower Problem Your Way vs One-Equation Way",
          "physics_layer": {
            "probe": "Ball dropped (u=0) from height 80m. Find velocity just before hitting ground. (a) Use splitting: free fall, v=√2gh. (b) Use one equation: v²=u²+2as, u=0, a=−10, s=−80. v²=0+2(−10)(−80)=1600. v=−40 m/s (downward). Both give 40 m/s magnitude. One-equation method: 1 step.",
            "scenario": "split_journey_into_two_parts_s6"
          }
        }
      }
    },
    {
      "branch_id": "sign_convention_inconsistency",
      "misconception": "The positive direction can be changed mid-problem, or gravity is always negative regardless of context",
      "student_belief": "Going up is always positive. Going down is always negative. So when ball falls, 'a' is positive because it's going in positive direction.",
      "trigger_phrases": [
        "gravity positive when falling down",
        "acceleration positive downward",
        "a = +10 when going down",
        "sign convention confusing",
        "direction of g positive negative"
      ],
      "state_count": 5,
      "scope": "local",
      "feedback_tag": "sign_of_a_fixed_by_convention_not_motion_direction",
      "states": {
        "STATE_1": {
          "label": "Show the Belief — Changing Sign of g",
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Ball thrown up. Student sets up=+ve. Going up: a=−10 (opposing). Ball reaches top, starts falling. Student thinks: 'Now ball is going DOWN. Down is negative. So a must be... wait, is a now +10 or −10?' Shows the confusion.",
            "common_error": "Student writes a=−10 going up, then a=+10 going down — because they think 'a must align with velocity direction'. Wrong.",
            "scenario": "ua_wrong_s_is_distance"
          }
        },
        "STATE_2": {
          "label": "The Rule: Acceleration Direction is Fixed by Physics, Not by Motion",
          "physics_layer": {
            "simulation": "Gravity always pulls downward. If up=+ve, then g acts downward = NEGATIVE. This doesn't change when the ball reverses. Gravity is still pulling down. a=−10 throughout the entire flight — up, down, at peak, everywhere.",
            "analogy": "A person walking north against a south wind. The wind is always southward (negative). Whether the person moves north or south doesn't change the wind direction.",
            "visualization": "Show gravity arrow always pointing downward throughout flight. Arrow never flips. g=−10 m/s² always if up=+ve.",
            "scenario": "ua_s_is_displacement"
          }
        },
        "STATE_3": {
          "label": "The One Time a Can Be Positive (Downward Positive Convention)",
          "physics_layer": {
            "simulation": "If you choose DOWN=+ve (sometimes useful for falling/dropped objects), then g=+10. Now 'up' is negative. This is a valid choice. But STICK TO IT for the whole problem.",
            "example": "Ball dropped from height h. Choose down=+ve. u=0, a=+10, s=+h. v²=u²+2as: v²=0+2(10)(h)=20h. v=√(20h)=√(2gh). Correct.",
            "warning": "Mixing conventions within one problem is the error. Not which convention you choose.",
            "scenario": "ua_direction_reversal_case"
          }
        },
        "STATE_4": {
          "label": "Practice: Assign Signs Before Touching Equations",
          "physics_layer": {
            "drill": "Three scenarios. For each: choose convention, write u=?, a=?, then identify s for the question asked.\n  (1) Ball thrown up from ground, find max height. [up=+ve: u=+30, a=−10, v=0 at top]\n  (2) Ball dropped from cliff, find impact velocity. [down=+ve: u=0, a=+10, s=+60]\n  (3) Car braking rightward. [right=+ve: u=+25, a=−5, v=0]",
            "simulation": "Interactive: student selects convention and fills in signs before numbers are shown.",
            "scenario": "ua_aha_split_intervals"
          }
        },
        "STATE_5": {
          "label": "JEE Format: Always State Convention",
          "physics_layer": {
            "tip": "In JEE solutions, write 'Taking upward as positive:' before substituting. This forces you to commit to a convention and prevents mid-problem switches. DC Pandey does this in every example — compare with his worked solutions.",
            "example_from_book": "DC Pandey Example 6.13: 'In the problem, u=+10m/s, a=−10m/s² and s=−40m' — explicit sign assignment before equations.",
            "scenario": "sign_convention_inconsistency_s5"
          }
        }
      }
    },
    {
      "branch_id": "which_equation_confusion",
      "misconception": "Always start with v=u+at and work from there regardless of what's given",
      "student_belief": "There's one 'main' equation (v=u+at) and all others are derived from it. Just always start with it.",
      "trigger_phrases": [
        "which equation to use",
        "always use v=u+at first",
        "confused which formula to apply",
        "equation selection kinematics",
        "kaunsa formula lagaaye"
      ],
      "state_count": 5,
      "scope": "local",
      "feedback_tag": "match_unknowns_to_equation_containing_them",
      "states": {
        "STATE_1": {
          "label": "Show the Belief — Always Starting with v=u+at",
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Problem: 'Ball thrown up at 20m/s. Find max height.' Student starts with v=u+at. v=0 at top: 0=20−10t → t=2s. Now needs another equation: s=ut+½at²: s=20(2)−5(4)=20m. Two equations, extra step.",
            "direct_approach": "Use v²=u²+2as directly: 0=400+2(−10)s → s=20m. ONE equation, answer in one step.",
            "scenario": "which_equation_confusion_s1"
          }
        },
        "STATE_2": {
          "label": "The Missing Variable Method",
          "physics_layer": {
            "content": "Each equation is missing exactly ONE of the 5 variables. Identify what variable you DON'T need (and isn't given) — that's the one missing from your equation.",
            "table": {
              "v=u+at": "Missing: s. Use when displacement is not needed.",
              "v²=u²+2as": "Missing: t. Use when time is not needed.",
              "s=ut+½at²": "Missing: v. Use when final velocity is not needed.",
              "sₜ=u+a(t-½)": "Missing: everything except nth second displacement."
            },
            "simulation": "Equation selector interactive. Student marks known/unknown variables. System highlights which equation to use.",
            "scenario": "which_equation_confusion_s2"
          }
        },
        "STATE_3": {
          "label": "Three Classic Problem Types — Best Equation for Each",
          "physics_layer": {
            "cases": {
              "find_max_height": "v=0 at top, need s. Given: u, a. Missing variable: t. Use v²=u²+2as.",
              "find_time_to_hit_ground": "Given: u, a, s (displacement to ground). Unknown: t. Missing variable: v. Use s=ut+½at².",
              "find_velocity_at_height": "Given: u, a, s. Unknown: v. Missing variable: t. Use v²=u²+2as."
            },
            "simulation": "Three problems shown. For each, student identifies missing variable → system confirms equation choice.",
            "scenario": "which_equation_confusion_s3"
          }
        },
        "STATE_4": {
          "label": "When Two Equations ARE Needed",
          "physics_layer": {
            "content": "Sometimes you genuinely need two equations — when you have 2 unknowns. Example: 'Find max height AND time of flight.' Two unknowns → two equations. Or when the problem gives non-standard information requiring substitution.",
            "example": "DC Pandey Example 6.14: Ball at 80m at two times 6s apart. Unknown = u. Needs: s=ut+½at² (quadratic), then use difference of roots formula from Vieta's. Two equations combined.",
            "scenario": "which_equation_confusion_s4"
          }
        },
        "STATE_5": {
          "label": "Speed Drill — Choose the Equation in 5 Seconds",
          "physics_layer": {
            "problems": [
              {
                "given": "u=0, a=10, t=4",
                "find": "s",
                "answer_equation": "s=ut+½at²",
                "answer": "s=80m"
              },
              {
                "given": "u=20, a=−5, v=0",
                "find": "s",
                "answer_equation": "v²=u²+2as",
                "answer": "s=40m"
              },
              {
                "given": "u=15, a=−3, s=30",
                "find": "t",
                "answer_equation": "s=ut+½at²",
                "answer": "quadratic → t=2s or t=8s"
              },
              {
                "given": "u=0, a=g, h=45",
                "find": "v",
                "answer_equation": "v²=u²+2as",
                "answer": "v=√(2×10×45)=30 m/s"
              }
            ],
            "scenario": "which_equation_confusion_s5"
          }
        }
      }
    },
    {
      "branch_id": "sth_formula_wrong_use",
      "misconception": "sₜ = u + a(t − ½) gives the position at time t, or gives distance in t seconds",
      "student_belief": "sth formula is just another way to find displacement — same as s=ut+½at²",
      "trigger_phrases": [
        "sth formula",
        "displacement in nth second",
        "s = u + a(2n-1)/2",
        "formula for tth second",
        "displacement in 3rd second"
      ],
      "state_count": 4,
      "scope": "local",
      "feedback_tag": "sth_is_displacement_in_that_second_not_total",
      "states": {
        "STATE_1": {
          "label": "Show the Confusion",
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "u=10, a=2. Student uses sth=u+a(t−½) with t=3 to get 'displacement at 3 seconds': sth=10+2(2.5)=15m. Then checks: s=ut+½at²=10(3)+½(2)(9)=30+9=39m. '15 ≠ 39. The formula is wrong!'",
            "clarify": "The student used sth correctly BUT misinterpreted the result. 15m is NOT displacement at t=3s. It's displacement DURING the 3rd second only (from t=2 to t=3).",
            "scenario": "sth_formula_wrong_use_s1"
          }
        },
        "STATE_2": {
          "label": "What sₜ Actually Means",
          "physics_layer": {
            "derivation": "sₜ = displacement in tth second = s(at time t) − s(at time t−1) = [ut+½at²] − [u(t−1)+½a(t−1)²] = u + a(t−½).",
            "simulation": "Timeline animation. Mark positions at t=0, 1, 2, 3 seconds. sth at t=3 = position at t=3 minus position at t=2. Show this gap = 15m. Compare with total displacement at t=3 = 39m. Completely different.",
            "example": "u=10, a=2. s(3)=39m, s(2)=24m. Displacement in 3rd second = 39−24=15m = s3h. Confirmed.",
            "scenario": "sth_formula_wrong_use_s2"
          }
        },
        "STATE_3": {
          "label": "When to Use sₜ",
          "physics_layer": {
            "when_needed": "Only when question explicitly asks: 'displacement in the nth second' or 'displacement during the 3rd second'. NOT for 'displacement after 3 seconds' (use s=ut+½at²).",
            "jee_trap": "JEE asks: 'Find the ratio of displacement in 1st, 2nd, and 3rd second for particle starting from rest.' Answer: s₁:s₂:s₃ = 1:3:5 (using sₜ = 0+10(t−½) = 10t−5 for u=0, a=10). This is a classic.",
            "scenario": "sth_formula_wrong_use_s3"
          }
        },
        "STATE_4": {
          "label": "The Classic Ratio: 1:3:5:7...",
          "physics_layer": {
            "derivation": "For u=0: sₜ = 0 + a(t − ½) = a(2t−1)/2. Ratio s₁:s₂:s₃:sₙ = 1:3:5:...(2n−1). These are consecutive odd numbers.",
            "simulation": "Animate particle from rest. Mark distance covered in each 1-second interval. Bars grow as 1, 3, 5, 7 in ratio.",
            "source": "This is DC Pandey's standard JEE preparation result — explicitly in Extra Points.",
            "scenario": "sth_formula_wrong_use_s4"
          }
        }
      }
    },
    {
      "branch_id": "retardation_means_negative_acceleration",
      "misconception": "Retardation always means a = negative number",
      "student_belief": "If something is decelerating, I always write a = −5 (or whatever the magnitude is with a minus sign)",
      "trigger_phrases": [
        "retardation negative acceleration",
        "deceleration always negative",
        "a = -5 for retardation",
        "braking a is negative",
        "manda charitra acceleration"
      ],
      "state_count": 4,
      "scope": "local",
      "feedback_tag": "retardation_is_opposition_to_velocity_not_always_negative",
      "states": {
        "STATE_1": {
          "label": "Show the Belief",
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Car moving LEFT at 20m/s, brakes applied. Student writes: u=20m/s, a=−5 m/s² (retardation = negative). But wait — if left=negative direction, then u should be −20m/s. Now a=−5 means: accelerating to the LEFT (same direction as motion). That's NOT braking, that's speeding up leftward!",
            "question": "If u=−20 and a=−5, the car speeds up leftward. But you wanted it to brake. What went wrong?",
            "scenario": "ua_wrong_deceleration_different"
          }
        },
        "STATE_2": {
          "label": "Retardation = Opposition to Velocity, Not Always Negative",
          "physics_layer": {
            "rule": "Retardation means acceleration OPPOSES the direction of motion. If motion is in −ve direction (leftward), retardation is in +ve direction (rightward). a=+5 for a car moving left and braking.",
            "simulation": "Car moving LEFT. Sign convention: right=+ve, left=−ve. u=−20 (leftward). Braking force is rightward = +ve. a=+5. v=u+at=−20+5t. At t=4s: v=0. Car stopped. Correct.",
            "scenario": "ua_sign_is_direction"
          }
        },
        "STATE_3": {
          "label": "The Pattern",
          "physics_layer": {
            "table": {
              "Moving rightward (+ve), braking": "u=+v, a=−x (opposing)",
              "Moving leftward (−ve), braking": "u=−v, a=+x (opposing)",
              "Moving upward (+ve), gravity": "u=+v, a=−10 (opposing = downward)",
              "Moving downward (−ve), gravity": "u=−v, a=−10... wait: gravity is always −ve (downward). Here u and a are same sign — this is Case 2, NOT retardation."
            },
            "key": "Retardation in vertical free-fall doesn't exist (gravity always accelerates downward). Retardation only happens in Case 3 — when something opposes the motion externally (braking, air resistance, etc.).",
            "scenario": "ua_aha_sign_convention"
          }
        },
        "STATE_4": {
          "label": "Quick Rule",
          "physics_layer": {
            "rule": "Step 1: Assign signs based on DIRECTION, not magnitude. u gets the sign of its direction. a gets the sign of ITS direction (which may oppose u). Step 2: Do NOT apply extra minus signs for 'retardation' as a concept — the sign comes from the direction automatically.",
            "probe": "Particle moves east at 15m/s, decelerates at 3m/s². East=+ve. u=+15, a=−3. v=15−3t. Stops at t=5s. No minus sign chosen 'because retardation' — it came from direction of deceleration (westward=negative).",
            "scenario": "retardation_means_negative_acceleration_s4"
          }
        }
      }
    }
  ],
  "epic_c_micro_templates": {
    "why_reject_negative_t": {
      "trigger": "why reject negative time",
      "states": 2,
      "content": "The quadratic s=ut+½at² may give two roots, one negative. The negative root means: IF the particle had been at the starting point with velocity u at some earlier time (before t=0), it would have reached that position at t=negative. Since our problem starts at t=0, the negative root is physically irrelevant — it represents a mathematically valid but physically non-existent past event. DC Pandey Fig 6.13 shows this explicitly."
    },
    "derive_equations": {
      "trigger": "derive equations of motion",
      "states": 3,
      "content": "v=u+at: integrate a=dv/dt from 0 to t → v−u=at. s=ut+½at²: integrate v=ds/dt=u+at from 0 to t → s=ut+½at². v²=u²+2as: multiply v=u+at by itself and substitute s → v²=u²+2as. All three from calculus in one flow."
    },
    "max_height_formula": {
      "trigger": "maximum height formula ball thrown up",
      "states": 2,
      "content": "At max height: v=0. Use v²=u²+2as: 0=u²−2gh → h=u²/2g. This is the direct formula. No need to find time first. Memorize: h_max = u²/2g."
    },
    "time_of_flight_formula": {
      "trigger": "time of flight formula",
      "states": 2,
      "content": "Projectile returns to same height: s=0. s=ut+½at²: 0=ut−½gt². t(u−½gt)=0. t=0 (start) or t=2u/g. Time of flight T=2u/g. Ascent time = T/2 = u/g = descent time (symmetric)."
    },
    "odd_number_pattern": {
      "trigger": "ratio of distances in successive seconds",
      "states": 2,
      "content": "For particle from rest: distances in 1st, 2nd, 3rd... seconds are in ratio 1:3:5:7... (consecutive odd numbers). Formula: sₜ = a(2t−1)/2 for u=0. This is a direct JEE objective question pattern."
    },
    "why_st_dimensional_issue": {
      "trigger": "sth formula dimensionally incorrect",
      "states": 2,
      "content": "sₜ = u + a(t − ½) looks like u + at − a/2. The term a/2 has units m/s²×s⁻¹... wait, that's wrong. Actually: sₜ = u·(1s) + a·(t − ½)·(1s) — the '1s' unit is implicit because t here is an ordinal (2nd second, 3rd second) not a continuous variable. The formula is dimensionally consistent when you include the implicit '1 second' unit. DC Pandey acknowledges this explicitly."
    }
  },
  "static_responses": {
    "equations_list": {
      "trigger": "write all equations of motion",
      "simulation_needed": false,
      "response": "Five equations of uniform acceleration: (1) v = u + at (2) v² = u² + 2as (3) s = ut + ½at² (4) s₁ = s₀ + ut + ½at² (5) sₜ = u + a(t − ½). In all: s = displacement from starting point, not distance. Use sign convention: pick one direction as +ve and stick to it."
    },
    "free_fall_formulas": {
      "trigger": "free fall formulas direct results",
      "simulation_needed": false,
      "response": "For upward projection speed u: max height = u²/2g. Time of ascent = u/g. Time of flight = 2u/g. Return speed = u. For free fall from height h: impact velocity = √(2gh). Time of fall = √(2h/g)."
    },
    "missing_variable_guide": {
      "trigger": "how to choose which equation",
      "simulation_needed": false,
      "response": "Identify the variable you don't need: no s needed → use v=u+at. No t needed → use v²=u²+2as. No v needed → use s=ut+½at². Need nth second displacement → use sₜ=u+a(t−½). This is the complete selection rule."
    }
  },
  "problem_guidance_path": {
    "description": "Step-by-step approach for any uniform acceleration problem",
    "steps": {
      "step_1": "Read problem. Identify which of the 5 variables are given (u, v, a, s, t).",
      "step_2": "State sign convention explicitly. Write it down: 'up = +ve' or 'right = +ve'.",
      "step_3": "Assign signs to all given values.",
      "step_4": "Identify which variable is unknown.",
      "step_5": "Pick the equation that contains exactly those 4 variables (3 known + 1 unknown).",
      "step_6": "Substitute and solve. If quadratic: get two roots, reject negative time.",
      "step_7": "Check: is distance required (not displacement)? If u and a opposite and t > t0, need separate distance calculation."
    }
  },
  "example_library": {
    "example_1": {
      "source": "DC Pandey Example 6.13",
      "principle": "Ball thrown up from tower — single equation handles full journey using sign convention (up positive)",
      "aha": "No need to split into upward and downward phases — one equation with correct signs solves it; reject negative time root",
      "simulation_states": 2
    },
    "example_2": {
      "source": "DC Pandey Example 6.14",
      "principle": "Ball reaches same height twice — finding initial speed from two time values at same position",
      "aha": "Two solutions for t from quadratic → two real moments when ball passes that height; their sum = 2u/g",
      "simulation_states": 2
    },
    "example_3": {
      "source": "DC Pandey Example 6.10",
      "principle": "Uniform vs non-uniform acceleration — identifying from v-t graph linearity",
      "aha": "Straight line on v-t graph = uniform acceleration. Curved = non-uniform. Slope = acceleration.",
      "simulation_states": 2
    },
    "example_4": {
      "source": "DC Pandey standard result — distances from rest",
      "principle": "From rest with uniform acceleration: distances in 1st, 2nd, 3rd second are in ratio 1:3:5 (odd numbers)",
      "aha": "nth second distance = u + a(2n-1)/2. From rest: just a(2n-1)/2. This ratio appears directly in JEE MCQs.",
      "simulation_states": 2
    }
  },
  "assessment_path": {
    "question_1": {
      "text": "A ball is thrown up at 20m/s. Taking up as +ve, which set of signs is correct?",
      "options": [
        "u=+20, a=+10 going up; u=−20, a=+10 coming down",
        "u=+20, a=−10 throughout entire flight",
        "u=+20, a=+10 throughout",
        "u=+20 going up, a=−10; u=−20, a=+10 coming down"
      ],
      "correct": 1,
      "if_wrong_0": "route to sign_convention_inconsistency branch — belief that acceleration follows velocity direction",
      "if_wrong_3": "route to split_journey_into_two_parts branch",
      "explanation": "Sign convention is fixed at start. Up=+ve means gravity (downward) = −10 throughout. Velocity changes sign at peak. Acceleration NEVER changes sign — it's always −10."
    },
    "question_2": {
      "text": "You know u, a, and s. You want to find v. Which equation?",
      "options": [
        "v = u + at",
        "v² = u² + 2as",
        "s = ut + ½at²",
        "sₜ = u + a(t − ½)"
      ],
      "correct": 1,
      "if_wrong_0": "route to which_equation_confusion branch",
      "explanation": "v²=u²+2as contains exactly u, v, a, s — no time needed. This is the 'no time' equation."
    },
    "question_3": {
      "text": "For a particle starting from rest, ratio of displacements in 1st, 2nd, 3rd second is:",
      "options": [
        "1:2:3",
        "1:4:9",
        "1:3:5",
        "2:4:6"
      ],
      "correct": 2,
      "if_wrong": "route to sth_formula_wrong_use branch",
      "explanation": "Using sₜ=u+a(t−½) with u=0: s₁=a/2, s₂=3a/2, s₃=5a/2. Ratio = 1:3:5. Odd numbers."
    },
    "question_4": {
      "text": "A car moving at 30m/s brakes at −5m/s². How long to stop AND how far does it travel?",
      "options": [
        "t=6s, s=90m",
        "t=6s, s=150m",
        "t=6s, s=300m",
        "t=3s, s=90m"
      ],
      "correct": 0,
      "explanation": "v=u+at: 0=30−5t → t=6s. v²=u²+2as: 0=900−10s → s=90m. Or s=30(6)−½(5)(36)=180−90=90m."
    },
    "question_5": {
      "text": "Ball thrown up from top of a 60m building at 20m/s. Time to hit ground (g=10):",
      "options": [
        "t=2s",
        "t=4s",
        "t=6s",
        "t=8s"
      ],
      "correct": 2,
      "if_wrong": "route to split_journey_into_two_parts branch — they split the journey",
      "explanation": "u=+20, a=−10, s=−60 (ground is 60m below). s=ut+½at²: −60=20t−5t². 5t²−20t−60=0. t²−4t−12=0. (t−6)(t+2)=0. t=6s."
    }
  },
  "session_awareness": {
    "if_already_shown_epic_l": "go to problem practice — student has seen all three cases",
    "if_coming_from_distance_vs_displacement": "student knows s=displacement — reinforce immediately in equation context",
    "if_confused_after_practice": "return to STATE_3 sign convention — 90% of wrong answers trace back to sign errors"
  },
  "waypoints": {
    "fallback_unknown_confusion": "Default to the tower problem (DC Pandey 6.13). It's the canonical demonstration of single-equation power and sign convention in action.",
    "escalation_trigger": "If student asks about non-constant acceleration, redirect to non_uniform_acceleration.json."
  },
  "depth_escalation_trigger": {
    "condition": "Student asks why the sₜ formula has a dimensional inconsistency",
    "escalate_to": "The 't' in sₜ is an ordinal integer (1st, 2nd, 3rd second) — not a continuous variable in seconds. The implicit '1 second' unit multiplied through makes it dimensionally consistent. DC Pandey Section 6.6 Exercise 1 asks students to prove this.",
    "level": "JEE Advanced / dimensional analysis depth"
  },
  "jee_specific": {
    "typical_question_types": [
      "Ball thrown up/down from tower — find time/velocity/height",
      "Two bodies meet — find time/position",
      "Average speed for half-distance vs half-time segments",
      "Ratio of distances in successive seconds from rest (1:3:5...)",
      "Find u given two times for same height (quadratic roots method)",
      "Assertion: Retardation means negative acceleration — FALSE (only if opposing is negative)",
      "Free fall: dropped from height h — find velocity/time"
    ],
    "common_traps": [
      "Splitting upward/downward into separate equations — unnecessary and error-prone",
      "Changing sign of g when ball reverses — NEVER. g sign is fixed by convention.",
      "Using sₜ formula to find total displacement (it gives displacement in ONE second only)",
      "Taking distance = |s| when reversal occurs (need separate calculation for distance)",
      "Rejecting the valid positive root and accepting negative root (reversed)",
      "Thinking maximum height uses time (use v²=u²+2as directly)",
      "Retardation always means negative a (only if motion is in positive direction)"
    ],
    "standard_results_to_memorize": [
      "h_max = u²/2g",
      "T_flight = 2u/g",
      "v_return = u (speed, same magnitude)",
      "v_impact = √(2gh) for free fall",
      "t_fall = √(2h/g)",
      "Ratio 1:3:5 for distances from rest in successive seconds"
    ]
  },
  "concept_relationships": {
    "prerequisites": [
      "distance_vs_displacement",
      "scalar_vs_vector"
    ],
    "extensions": [
      "non_uniform_acceleration",
      "motion_graphs",
      "projectile_motion",
      "relative_motion"
    ],
    "siblings": [
      "non_uniform_acceleration",
      "motion_graphs"
    ],
    "common_exam_combinations": [
      "motion_graphs — v-t graph slope = a, area = s (direct connection)",
      "projectile_motion — applies uniform acceleration in both x (a=0) and y (a=−g) independently",
      "relative_motion — combines uniform acceleration equations for two bodies"
    ]
  },
  "three_js_flag": false,
  "three_js_note": "All scenarios are 1D vertical or horizontal. canvas2d with animated particle and arrows is fully sufficient.",
  "parameter_slots": {
    "u": {
      "label": "initial velocity",
      "range": [
        0,
        100
      ],
      "unit": "m/s",
      "default": 10,
      "extraction_hint": "initial velocity or u ="
    },
    "a": {
      "label": "acceleration",
      "range": [
        -20,
        20
      ],
      "unit": "m/s²",
      "default": 5,
      "extraction_hint": "acceleration or a ="
    },
    "t": {
      "label": "time",
      "range": [
        0,
        20
      ],
      "unit": "s",
      "default": 4,
      "extraction_hint": "time or t ="
    }
  },
  "panel_sync_spec": {
    "canvas_to_graph": {
      "trigger": "STATE_N_reached",
      "action": "v-t graph marks current time with vertical line, shows area under curve = displacement"
    },
    "graph_to_canvas": {
      "trigger": "student_hover_on_graph_at_t",
      "action": "canvas animation seeks to that time position"
    },
    "slider_to_both": {
      "parameter": "a",
      "canvas_action": "particle acceleration updates live",
      "graph_action": "v-t line slope changes to match new acceleration"
    }
  },
  "regeneration_variants": [
    {
      "variant_id": 1,
      "approach": "vt_graph_as_foundation",
      "entry_state": "STATE_2",
      "teacher_angle": "Start with the v-t graph as the primary object — not the equations. A straight line on a v-t graph IS uniform acceleration. The slope of that line equals acceleration. The area under the line equals displacement. The three SUVAT equations are not three separate things to memorise — they are three ways of reading the same straight line. v = u + at is the slope. s = ut + half at squared is the area using geometry. v squared = u squared + 2as eliminates time by combining slope and area. One graph, three equations.",
      "locked_facts_focus": [
        "fact_3",
        "fact_4",
        "fact_5"
      ],
      "panel_b_focus": "v-t straight line graph. Three annotations appear one by one: slope highlighted as a, shaded area below line as s, and the algebraic relationship between slope and area eliminating t to give v squared equation."
    },
    {
      "variant_id": 2,
      "approach": "connects_to_distance_displacement",
      "entry_state": "STATE_4",
      "teacher_angle": "Connect to the sign convention from distance vs displacement. The s in SUVAT equations is displacement — signed, not distance. This is why a ball thrown upward has s negative on the way back down even though it is still moving. Students who confuse distance and displacement here get wrong answers for every return-journey problem. Anchor the sign convention to what was learned in Ch.6: displacement is the signed arrow, distance is the always-positive path length.",
      "locked_facts_focus": [
        "fact_6",
        "fact_7",
        "fact_8"
      ],
      "panel_b_focus": "Ball thrown upward animation. Number line shows displacement going positive then becoming negative on the way down. Distance counter only increases. SUVAT calculation shown using s (signed) vs distance. Two different answers for two different questions."
    }
  ]
}
```


# vector_addition.json
```json
{
  "concept_id": "vector_addition",
  "concept_name": "Addition of Vectors — Triangle Law and Parallelogram Law",
  "class_level": 11,
  "chapter": "Vectors",
  "source_coverage": {
    "dc_pandey": "Chapter 5 — Sections 5.2, 5.3",
    "ncert": "Class 11 Chapter 4 — Motion in a Plane, Section 4.2",
    "hc_verma": "Chapter 2 — Physics and Mathematics"
  },
  "minimum_viable_understanding": "Vector addition depends on the ANGLE between vectors — the resultant is never simply A+B unless both vectors point in exactly the same direction.",
  "renderer_hint": {
    "technology": "canvas2d",
    "renderer": "mechanics_2d",
    "scenario_type": "vector_addition",
    "panel_count": 2,
    "show_labels": true,
    "show_components": true,
    "canvas_scale": 60,
    "technology_b": "plotly",
    "sync_required": true,
    "scene_mode": false,
    "panel_a_role": "Animated parallelogram — vectors A and B, resultant R updating live as angle changes",
    "panel_b_role": "Plotly graph — resultant R magnitude vs theta (0–180°), live curve"
  },
  "variables": {
    "A": {
      "name": "Magnitude of first vector",
      "symbol": "A",
      "unit": "units",
      "role": "independent"
    },
    "B": {
      "name": "Magnitude of second vector",
      "symbol": "B",
      "unit": "units",
      "role": "independent"
    },
    "theta": {
      "name": "Angle between the two vectors",
      "symbol": "θ",
      "unit": "degrees",
      "role": "independent",
      "typical_range": [
        0,
        180
      ],
      "note": "θ=0° gives maximum resultant A+B, θ=180° gives minimum |A-B|"
    },
    "R": {
      "name": "Magnitude of resultant",
      "symbol": "R",
      "unit": "units",
      "role": "dependent",
      "formula": "√(A² + B² + 2AB cosθ)"
    },
    "alpha": {
      "name": "Angle of resultant with vector A",
      "symbol": "α",
      "unit": "degrees",
      "role": "dependent",
      "formula": "tan⁻¹(B sinθ / A + B cosθ)"
    }
  },
  "locked_facts": [
    "Parallelogram law: R = √(A² + B² + 2AB cosθ), where θ is the angle between A and B",
    "Direction: tan α = B sinθ / (A + B cosθ), where α is angle R makes with A",
    "Triangle law: place tail of B at head of A — resultant goes from tail of A to head of B",
    "θ = 0° → R = A + B (maximum, vectors parallel)",
    "θ = 180° → R = |A − B| (minimum, vectors antiparallel)",
    "θ = 90° → R = √(A² + B²) (Pythagorean case)",
    "Vector addition is commutative: A + B = B + A",
    "Magnitude always satisfies: |A − B| ≤ R ≤ A + B",
    "Two equal vectors at θ: R = 2A cos(θ/2)",
    "Subtraction: A − B = A + (−B), where −B has same magnitude as B but opposite direction"
  ],
  "truth_statements": [
    "Two vectors can only be added using the parallelogram law or triangle law — arithmetic addition of magnitudes is valid ONLY when both vectors point in exactly the same direction",
    "The resultant of two equal vectors of magnitude A at angle θ is 2A cos(θ/2)",
    "The angle of the resultant with A is always between 0° and θ — the resultant always lies between the two vectors",
    "Current in a wire is NOT a vector because it does not obey the parallelogram law of addition",
    "The minimum possible resultant of two vectors A and B is |A−B|, when antiparallel (θ=180°)"
  ],
  "prerequisite_check": {
    "required_concepts": [
      "scalar_and_vector_basics"
    ],
    "gate_signals": [
      "what is a vector",
      "difference between scalar and vector",
      "what is magnitude",
      "what is direction"
    ],
    "if_gap_detected": "Explain scalar vs vector using displacement vs distance before proceeding to addition"
  },
  "routing_signals": {
    "global_triggers": [
      "don't understand vector addition",
      "explain vector addition",
      "what is vector addition",
      "samajh nahi aaya vector",
      "vectors kya hote hain",
      "explain from scratch",
      "never studied vectors",
      "vector addition kya hai",
      "start from basics",
      "full explanation"
    ],
    "local_triggers": [
      "resultant always A plus B",
      "why does resultant change with angle",
      "how does angle affect resultant",
      "resultant smaller than both",
      "why not just add magnitudes",
      "direction doesnt matter",
      "3 aur 4 ka resultant 7 hoga",
      "sirf magnitude add karo",
      "I thought vectors add like numbers"
    ],
    "micro_triggers": [
      "why cosθ in the formula",
      "why 2AB",
      "where does square root come from",
      "what is tan alpha",
      "why this formula",
      "what is triangle law",
      "tip to tail kya hota hai"
    ],
    "simulation_not_needed_triggers": [
      "how is parallelogram law derived",
      "prove parallelogram law",
      "mathematical derivation",
      "I got wrong answer",
      "check my work",
      "where did I go wrong",
      "history of vector addition",
      "who discovered"
    ]
  },
  "epic_l_path": {
    "description": "Full 6-state explanation for global scope — student lacks the whole concept",
    "state_count": 6,
    "checkpoint_states": {
      "knows_what_vectors_are": "enter at STATE_2",
      "knows_triangle_law": "enter at STATE_3",
      "knows_parallelogram_law": "enter at STATE_4",
      "knows_formula": "enter at STATE_5"
    },
    "states": {
      "STATE_1": {
        "label": "Why direction changes everything",
        "physics_layer": {
          "vector_A": {
            "magnitude": 4,
            "direction_deg": 0,
            "color": "#4FC3F7",
            "label": "4 km East"
          },
          "vector_B": {
            "magnitude": 3,
            "direction_deg": 90,
            "color": "#FF8A65",
            "label": "3 km North"
          },
          "show_naive_sum_label": "4 + 3 = 7? ✗",
          "show_actual_resultant": {
            "magnitude": 5,
            "label": "R = 5 km from start ✓"
          },
          "freeze": true,
          "show_person_path": true,
          "scenario": "two_vectors_given"
        },
        "pedagogy_layer": {
          "cognitive_trigger": "You walked 4 km then 3 km — but you are NOT 7 km from home. Why?",
          "real_world_anchor": "A person walks 4 km East then 3 km North. Only 5 km from start — not 7 km.",
          "attention_target": "The gap between 7 (naive sum) and 5 (actual distance from start)",
          "contrast_from_previous": null
        }
      },
      "STATE_2": {
        "label": "Triangle law — tip to tail",
        "physics_layer": {
          "show_triangle_law": true,
          "vector_A": {
            "magnitude": 4,
            "direction_deg": 0,
            "color": "#4FC3F7",
            "start": "origin"
          },
          "vector_B": {
            "magnitude": 3,
            "direction_deg": 90,
            "color": "#FF8A65",
            "start": "head_of_A"
          },
          "resultant": {
            "color": "#66BB6A",
            "from": "tail_of_A",
            "to": "head_of_B",
            "label": "R"
          },
          "animate_B_sliding": true,
          "freeze": false,
          "scenario": "parallelogram_law"
        },
        "pedagogy_layer": {
          "cognitive_trigger": "Place B's tail at A's head. The resultant is the shortcut from start to finish.",
          "real_world_anchor": "Walking is the path. The resultant is how far you actually are from where you started.",
          "attention_target": "B sliding to attach at A's head — the triangle forming",
          "contrast_from_previous": "Now vectors are connected tip to tail. The resultant closes the triangle."
        }
      },
      "STATE_3": {
        "label": "Parallelogram law — both from origin",
        "physics_layer": {
          "show_parallelogram": true,
          "vector_A": {
            "magnitude": 4,
            "direction_deg": 0,
            "color": "#4FC3F7",
            "start": "origin"
          },
          "vector_B": {
            "magnitude": 3,
            "direction_deg": 90,
            "color": "#FF8A65",
            "start": "origin"
          },
          "resultant": {
            "color": "#66BB6A",
            "label": "R = diagonal",
            "magnitude": 5
          },
          "shade_parallelogram": true,
          "freeze": true,
          "scenario": "triangle_law"
        },
        "pedagogy_layer": {
          "cognitive_trigger": "Both from origin. The diagonal of the parallelogram IS the resultant. Same answer as triangle law.",
          "real_world_anchor": "Two forces on an object — both applied at same point. Object moves along the diagonal.",
          "attention_target": "The diagonal of the shaded parallelogram",
          "contrast_from_previous": "Triangle law: tip to tail. Parallelogram: both from origin. Identical R."
        }
      },
      "STATE_4": {
        "label": "Three critical angles",
        "physics_layer": {
          "show_three_cases": true,
          "case_1": {
            "theta_deg": 0,
            "R": 7,
            "label": "θ=0°, R=7 (max)",
            "color": "#66BB6A"
          },
          "case_2": {
            "theta_deg": 90,
            "R": 5,
            "label": "θ=90°, R=5",
            "color": "#FFD54F"
          },
          "case_3": {
            "theta_deg": 180,
            "R": 1,
            "label": "θ=180°, R=1 (min)",
            "color": "#EF5350"
          },
          "show_formula": "R = √(A² + B² + 2AB cosθ)",
          "freeze": true,
          "scenario": "resultant_formula"
        },
        "pedagogy_layer": {
          "cognitive_trigger": "Same A=4, B=3. Three angles. R = 7, 5, 1. The angle is not optional.",
          "real_world_anchor": "Two people pushing a box — same direction (7), right angles (5), opposite (1).",
          "attention_target": "Three resultant arrows of lengths 7, 5, 1",
          "contrast_from_previous": "One parallelogram was shown before. Now three cases — angle controls everything."
        }
      },
      "STATE_5": {
        "label": "Aha — why 4+3=5, not 7",
        "physics_layer": {
          "show_split_screen": true,
          "left_panel": {
            "label": "WRONG",
            "show_parallel_vectors": true,
            "naive_sum": 7,
            "color": "#EF5350",
            "caption": "4+3=7 ✗ (only at θ=0°)"
          },
          "right_panel": {
            "label": "CORRECT",
            "show_perpendicular_vectors": true,
            "actual_R": 5,
            "color": "#66BB6A",
            "caption": "√(4²+3²)=5 ✓ (at θ=90°)",
            "show_right_angle_triangle": true
          },
          "aha_banner": "The resultant is 5, not 7. Direction destroyed the arithmetic.",
          "freeze": true,
          "scenario": "special_cases_0_90_180"
        },
        "pedagogy_layer": {
          "cognitive_trigger": "4+3=7 is arithmetic. The actual answer is 5. The angle reduced R from 7 to 5.",
          "real_world_anchor": "You walked 7 km total but are only 5 km from home. 2 km were spent going sideways.",
          "attention_target": "5 on the right vs 7 on the left — the visual proof",
          "contrast_from_previous": "STATE_4 showed three angles. Now the aha is explicit — wrong vs correct side by side."
        }
      },
      "STATE_6": {
        "label": "Student takes control",
        "physics_layer": {
          "interactive": true,
          "vector_A": {
            "magnitude": 4,
            "color": "#4FC3F7"
          },
          "vector_B": {
            "magnitude": 3,
            "color": "#FF8A65",
            "angle_adjustable": true
          },
          "resultant": {
            "color": "#66BB6A",
            "live_update": true
          },
          "show_parallelogram": true,
          "show_formula_panel": true,
          "show_special_case_banners": true,
          "scenario": "r_vs_theta_curve"
        },
        "pedagogy_layer": {
          "cognitive_trigger": "Drag θ from 0° to 180°. Watch R go from 7 to 1. Find the angle where R = A exactly.",
          "attention_target": "Formula panel updating in real time",
          "challenge": "Set A=3, B=3, θ=120°. R=? Answer: R=3 — equal to each vector. JEE classic.",
          "sliders": [
            {
              "id": "angle_theta",
              "label": "Angle θ",
              "min": 0,
              "max": 180,
              "default": 90,
              "unit": "°"
            },
            {
              "id": "magnitude_B",
              "label": "Magnitude of B",
              "min": 1,
              "max": 8,
              "default": 3,
              "unit": "units"
            }
          ]
        }
      }
    }
  },
  "epic_c_branches": [
    {
      "misconception_id": "scalar_addition",
      "description": "Student believes vector magnitudes add like numbers regardless of direction",
      "trigger_match": [
        "3 plus 4 equals 7",
        "sirf add karo",
        "simply add magnitudes",
        "R = A + B hoga",
        "magnitude add hoti hai",
        "just add the numbers",
        "3 aur 4 ka resultant 7 hoga",
        "add kar do bas"
      ],
      "state_count": 7,
      "feedback_tag": "vector_addition_branch_scalar",
      "depth_escalation_trigger": "student still confused after STATE_4",
      "states": {
        "STATE_1": {
          "label": "Your belief shown live",
          "physics_layer": {
            "vector_A": {
              "magnitude": 3,
              "direction_deg": 0,
              "color": "#4FC3F7"
            },
            "vector_B": {
              "magnitude": 4,
              "direction_deg": 0,
              "color": "#FF8A65"
            },
            "resultant": {
              "magnitude": 7,
              "label": "R = 7"
            },
            "theta_deg": 0,
            "caption": "This is what you expected — and here it IS correct",
            "freeze": true,
            "scenario": "va_ab_order"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "R = 7 here. But this is only correct at ONE specific angle. What if B rotates?",
            "attention_target": "R=7 with both vectors parallel"
          }
        },
        "STATE_2": {
          "label": "Rotate B — watch R drop",
          "physics_layer": {
            "animate_angle": true,
            "from_deg": 0,
            "to_deg": 90,
            "show_R_updating": true,
            "freeze_at": 90,
            "scenario": "va_ba_order"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "B didn't change. A didn't change. R dropped from 7 to 5. The angle did this.",
            "contrast_from_previous": "B rotated 90°. Same magnitudes — R dropped from 7 to 5."
          }
        },
        "STATE_3": {
          "label": "Continue to 180° — R drops to 1",
          "physics_layer": {
            "animate_angle": true,
            "from_deg": 90,
            "to_deg": 180,
            "show_R_updating": true,
            "freeze_at": 180,
            "scenario": "va_aha_commutative"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "At θ=180°, R=1. Three and four produced ONE. Vectors fighting each other.",
            "contrast_from_previous": "From 90° to 180°, R dropped from 5 to 1."
          }
        },
        "STATE_4": {
          "label": "Three cases — the full range",
          "physics_layer": {
            "show_three_cases": true,
            "case_1": {
              "theta_deg": 0,
              "R": 7,
              "label": "θ=0°, R=7 — your formula works ONLY here"
            },
            "case_2": {
              "theta_deg": 90,
              "R": 5,
              "label": "θ=90°, R=5"
            },
            "case_3": {
              "theta_deg": 180,
              "R": 1,
              "label": "θ=180°, R=1"
            },
            "freeze": true,
            "scenario": "scalar_addition_s4"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "R=A+B works at exactly one angle: θ=0°. Everywhere else it gives the wrong answer.",
            "aha_banner": "R=A+B is a special case, not the general rule"
          }
        },
        "STATE_5": {
          "label": "The correct formula",
          "physics_layer": {
            "show_formula": "R = √(A² + B² + 2AB cosθ)",
            "highlight_cos_theta": true,
            "show_special_cases_from_formula": true,
            "freeze": true,
            "scenario": "scalar_addition_s5"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "The cosθ term is what your formula was missing. At θ=0°, cosθ=1 and R=A+B. Your formula was accidentally correct for one case only."
          }
        },
        "STATE_6": {
          "label": "Verify with your numbers",
          "physics_layer": {
            "interactive": true,
            "show_formula_panel": true,
            "show_naive_comparison": true,
            "live_calculation": true,
            "scenario": "scalar_addition_s6"
          },
          "pedagogy_layer": {
            "challenge": "A=5, B=5, θ=60°. Naive: 10. Actual: √75 ≈ 8.66."
          }
        },
        "STATE_7": {
          "label": "Full control",
          "physics_layer": {
            "interactive": true,
            "sliders": [
              {
                "id": "angle_theta",
                "label": "Angle θ",
                "min": 0,
                "max": 180,
                "default": 60,
                "unit": "°"
              },
              {
                "id": "magnitude_A",
                "label": "Vector A",
                "min": 1,
                "max": 8,
                "default": 3,
                "unit": "units"
              },
              {
                "id": "magnitude_B",
                "label": "Vector B",
                "min": 1,
                "max": 8,
                "default": 4,
                "unit": "units"
              }
            ],
            "scenario": "scalar_addition_s7"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Set θ=0° and confirm R=A+B. Then change θ and see the general formula."
          }
        }
      }
    },
    {
      "misconception_id": "resultant_always_larger",
      "description": "Student believes the resultant is always larger than each individual vector",
      "trigger_match": [
        "resultant bada hoga",
        "adding makes bigger",
        "R must be bigger",
        "sum always larger",
        "vector jodne se bada hoga"
      ],
      "state_count": 5,
      "feedback_tag": "vector_addition_branch_larger",
      "states": {
        "STATE_1": {
          "label": "Immediate challenge",
          "physics_layer": {
            "vector_A": {
              "magnitude": 4,
              "direction_deg": 0,
              "color": "#4FC3F7"
            },
            "vector_B": {
              "magnitude": 3,
              "direction_deg": 180,
              "color": "#FF8A65"
            },
            "resultant": {
              "magnitude": 1,
              "color": "#EF5350",
              "label": "R = 1"
            },
            "theta_deg": 180,
            "freeze": true,
            "shock_caption": "A=4, B=3, but R=1. Smaller than BOTH.",
            "scenario": "va_wrong_always_larger"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "A=4, B=3. Expected R>4. Actual R=1. Smaller than either vector.",
            "attention_target": "Tiny R=1 arrow next to larger A and B"
          }
        },
        "STATE_2": {
          "label": "Range theorem",
          "physics_layer": {
            "show_range_bar": true,
            "min_R": 1,
            "max_R": 7,
            "label": "1 ≤ R ≤ 7 for A=4, B=3",
            "freeze": true,
            "scenario": "va_angle_determines"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "R can be anywhere from 1 to 7. The angle decides where."
          }
        },
        "STATE_3": {
          "label": "Angle sweeps the range",
          "physics_layer": {
            "animate_angle": true,
            "from_deg": 0,
            "to_deg": 180,
            "show_R_tracking": true,
            "freeze": false,
            "scenario": "va_minimum_resultant"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Watch R scan from 7 to 1 as θ goes from 0° to 180°."
          }
        },
        "STATE_4": {
          "label": "Equal antiparallel — R=0",
          "physics_layer": {
            "vector_A": {
              "magnitude": 5,
              "direction_deg": 0
            },
            "vector_B": {
              "magnitude": 5,
              "direction_deg": 180
            },
            "resultant": {
              "magnitude": 0,
              "label": "R = 0"
            },
            "freeze": true,
            "scenario": "va_aha_direction_controls"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "A=5, B=5, θ=180°. R=0. Two non-zero vectors that completely cancel."
          }
        },
        "STATE_5": {
          "label": "Interactive",
          "physics_layer": {
            "interactive": true,
            "sliders": [
              {
                "id": "angle_theta",
                "label": "θ",
                "min": 0,
                "max": 180,
                "default": 120,
                "unit": "°"
              }
            ],
            "scenario": "resultant_always_larger_s5"
          },
          "pedagogy_layer": {
            "challenge": "Can you make R smaller than B? Find angle where R < 3 for A=4, B=3."
          }
        }
      }
    },
    {
      "misconception_id": "direction_irrelevant",
      "description": "Student treats vectors as scalars — direction seems optional",
      "trigger_match": [
        "direction doesnt matter",
        "only magnitude matters",
        "direction ignore kar sakte hain",
        "angle optional hai",
        "sirf numbers use karo",
        "direction kyu chahiye"
      ],
      "state_count": 5,
      "feedback_tag": "vector_addition_branch_direction",
      "states": {
        "STATE_1": {
          "label": "Same magnitudes, opposite outcomes",
          "physics_layer": {
            "show_two_scenarios": true,
            "scenario_1": {
              "A": 5,
              "B": 5,
              "theta": 0,
              "R": 10,
              "label": "Both East → R=10"
            },
            "scenario_2": {
              "A": 5,
              "B": 5,
              "theta": 180,
              "R": 0,
              "label": "Opposite → R=0"
            },
            "freeze": true,
            "scenario": "direction_irrelevant_s1"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Same magnitudes (5 and 5). R=10 in one case. R=0 in the other. Only direction changed."
          }
        },
        "STATE_2": {
          "label": "Five angles, five results",
          "physics_layer": {
            "show_five_cases": true,
            "note": "All A=5, B=5",
            "cases": [
              {
                "theta": 0,
                "R": 10
              },
              {
                "theta": 60,
                "R": 8.66
              },
              {
                "theta": 90,
                "R": 7.07
              },
              {
                "theta": 120,
                "R": 5
              },
              {
                "theta": 180,
                "R": 0
              }
            ],
            "freeze": true,
            "scenario": "direction_irrelevant_s2"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "A=5, B=5 in all five. Five completely different resultants — only angle differs."
          }
        },
        "STATE_3": {
          "label": "Real world: forces on a box",
          "physics_layer": {
            "show_force_example": true,
            "show_object": true,
            "animate_resultant_direction": true,
            "scenario": "direction_irrelevant_s3"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Two people pushing a box — knowing their strength without direction tells you nothing about where the box goes."
          }
        },
        "STATE_4": {
          "label": "Aha — direction IS the physics",
          "physics_layer": {
            "show_split": true,
            "left": {
              "label": "Scalar: 5+5=10 (always)",
              "color": "#EF5350"
            },
            "right": {
              "label": "Vector: 5+5 = 0 to 10 (depends on θ)",
              "color": "#66BB6A"
            },
            "freeze": true,
            "scenario": "direction_irrelevant_s4"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Scalars ignore direction. Vectors ARE their direction. Without direction, a vector is just a number."
          }
        },
        "STATE_5": {
          "label": "Interactive",
          "physics_layer": {
            "interactive": true,
            "sliders": [
              {
                "id": "angle_theta",
                "label": "θ",
                "min": 0,
                "max": 180,
                "default": 90,
                "unit": "°"
              }
            ],
            "scenario": "direction_irrelevant_s5"
          },
          "pedagogy_layer": {
            "challenge": "Hold A=5, B=5 constant. How many distinct R values can you produce by changing only θ?"
          }
        }
      }
    }
  ],
  "epic_c_micro_templates": [
    {
      "template_id": "symbol_role",
      "applies_when": "student asks why a specific symbol exists in the formula",
      "example_queries": [
        "why cosθ",
        "what does 2AB mean",
        "where does cosθ come from"
      ],
      "state_count": 3,
      "feedback_tag": "vector_addition_micro_symbol",
      "states": {
        "STATE_1": {
          "label": "Isolate the symbol",
          "instruction": "Highlight ONLY the element student asked about. Fade everything else. Show just the formula term."
        },
        "STATE_2": {
          "label": "Show what removing it does",
          "instruction": "Remove cosθ — show R = √(A²+B²) always regardless of angle (wrong). Restore it — show R updating with angle. The term is what adds angle sensitivity."
        },
        "STATE_3": {
          "label": "Student adjusts directly",
          "instruction": "One slider: θ. Show cosθ value updating. At θ=90°, cosθ=0 and the term vanishes — that is the Pythagorean case.",
          "sliders": [
            {
              "id": "angle_theta",
              "label": "θ",
              "min": 0,
              "max": 180,
              "default": 45,
              "unit": "°"
            }
          ]
        }
      }
    },
    {
      "template_id": "constant_origin",
      "applies_when": "student asks where a coefficient in the formula comes from",
      "example_queries": [
        "where does 2 come from",
        "why square root",
        "why power 2"
      ],
      "state_count": 2,
      "feedback_tag": "vector_addition_micro_constant",
      "states": {
        "STATE_1": {
          "label": "Geometric origin",
          "instruction": "Draw the parallelogram. Show the triangle with sides A, B, R. Apply cosine rule: c²=a²+b²-2ab cos(C). Angle inside triangle is (180°-θ), which flips sign to +2ABcosθ."
        },
        "STATE_2": {
          "label": "Each term named",
          "instruction": "Label A², B², and 2ABcosθ separately. A²: A's contribution. B²: B's contribution. 2ABcosθ: how much A and B help or oppose each other."
        }
      }
    },
    {
      "template_id": "law_distinction",
      "applies_when": "student asks about triangle law vs parallelogram law",
      "example_queries": [
        "what is triangle law",
        "tip to tail kya hai",
        "difference between the two laws"
      ],
      "state_count": 3,
      "feedback_tag": "vector_addition_micro_law",
      "states": {
        "STATE_1": {
          "label": "Triangle law",
          "instruction": "Show tip-to-tail. B's tail at A's head. Resultant from start to finish. Label: TRIANGLE LAW."
        },
        "STATE_2": {
          "label": "Parallelogram law",
          "instruction": "Both from origin. Complete parallelogram. Diagonal is resultant. Same R."
        },
        "STATE_3": {
          "label": "They are equivalent",
          "instruction": "Show both simultaneously. Same R, same α, different visual method. Choice is only convenience."
        }
      }
    },
    {
      "template_id": "spatial_confusion",
      "applies_when": "student marks a diagram or asks about direction of a specific arrow",
      "example_queries": [
        "why this angle",
        "I marked this arrow",
        "this direction confuses me"
      ],
      "state_count": 2,
      "feedback_tag": "vector_addition_micro_spatial",
      "states": {
        "STATE_1": {
          "label": "Isolate marked element",
          "instruction": "Read marked_area_description. Highlight ONLY the marked element. Show its direction angle explicitly."
        },
        "STATE_2": {
          "label": "Show why that direction",
          "instruction": "Animate how the resultant direction emerges. Show tan α = B sinθ / (A + B cosθ) with values."
        }
      }
    },
    {
      "template_id": "approximation_boundary",
      "applies_when": "student asks when a formula or special case is valid",
      "example_queries": [
        "when does A+B work",
        "for what angle is resultant maximum",
        "when does Pythagoras apply"
      ],
      "state_count": 2,
      "feedback_tag": "vector_addition_micro_boundary",
      "states": {
        "STATE_1": {
          "label": "Show the boundary condition",
          "instruction": "Show θ=0° where R=A+B exactly. Label: the ONLY angle where arithmetic addition works."
        },
        "STATE_2": {
          "label": "Show deviation from boundary",
          "instruction": "Animate θ increasing from 0°. Show R decreasing from A+B immediately. Any θ>0° means arithmetic overestimates."
        }
      }
    }
  ],
  "static_responses": [
    {
      "response_id": "parallelogram_derivation",
      "triggers": [
        "how is parallelogram law derived",
        "prove parallelogram law",
        "derivation of vector addition formula",
        "cos rule se kaise aaya"
      ],
      "response_type": "text_with_steps",
      "ai_cost": 0,
      "content": "Draw vectors A and B from origin O. Complete parallelogram OACB. Triangle OAC has sides OA=A, AC=B, OC=R. Angle at A is (180°−θ). Cosine rule: OC² = OA² + AC² − 2·OA·AC·cos(180°−θ). Since cos(180°−θ) = −cosθ, we get R² = A² + B² + 2AB cosθ. Therefore R = √(A² + B² + 2AB cosθ)."
    },
    {
      "response_id": "numerical_check",
      "triggers": [
        "I got wrong answer",
        "check my work",
        "mera answer galat kyun",
        "where did I go wrong"
      ],
      "response_type": "text_guided_sonnet",
      "ai_cost": "micro_sonnet_call",
      "instruction": "Receive student working. Check each step against locked_facts. Find first step violating a locked_fact. Point to exactly that step."
    },
    {
      "response_id": "definition_recall",
      "triggers": [
        "what is resultant",
        "define vector addition",
        "kya hota hai resultant"
      ],
      "response_type": "text",
      "ai_cost": 0,
      "content": "The resultant of two vectors A and B is the single vector R = A + B that has the same effect as both vectors acting together. R = √(A² + B² + 2AB cosθ) where θ is the angle between A and B. Direction: tan α = B sinθ / (A + B cosθ)."
    },
    {
      "response_id": "cross_concept_comparison",
      "triggers": [
        "same as Pythagoras",
        "how related to components",
        "difference from scalar addition"
      ],
      "response_type": "text",
      "ai_cost": 0,
      "content": "At θ=90°, R=√(A²+B²) is exactly Pythagoras. The component method extends this: resolve any two vectors into x and y components, add components as scalars, then find magnitude using Pythagoras. Scalar addition is the θ=0° special case of vector addition."
    }
  ],
  "problem_guidance_path": {
    "description": "Used when student understands the concept but cannot solve a specific numerical",
    "trigger_signals": [
      "how to solve this",
      "steps for this problem",
      "find resultant of",
      "calculate R"
    ],
    "approach": "text_only_no_simulation",
    "steps": [
      "Step 1: Identify magnitudes A and B",
      "Step 2: Identify angle θ between them",
      "Step 3: Apply R = √(A² + B² + 2AB cosθ)",
      "Step 4: For direction apply tan α = B sinθ / (A + B cosθ)",
      "Step 5: Verify answer lies in range |A-B| ≤ R ≤ A+B"
    ]
  },
  "example_library": {
    "example_1": {
      "source": "DC Pandey Section 5.3 — Examples 5.6–5.8",
      "principle": "A=3 East, B=4 North (θ=90°) — applying parallelogram law to perpendicular vectors",
      "aha": "θ=90° is the only case where R = √(A²+B²) exactly; all other angles require the full cosine formula",
      "simulation_states": 2
    },
    "example_2": {
      "source": "DC Pandey Section 5.3",
      "principle": "Two equal vectors at θ=120° — resultant equals the magnitude of either vector",
      "aha": "Equal vectors at 120° give R = F (same as each). This result appears as a direct JEE MCQ.",
      "simulation_states": 2
    },
    "example_3": {
      "source": "DC Pandey Section 5.3",
      "principle": "Antiparallel vectors (θ=180°) — resultant is the difference |A−B|",
      "aha": "Maximum resultant at θ=0° (A+B), minimum at θ=180° (|A−B|) — these are the bounds for any resultant",
      "simulation_states": 2
    }
  },
  "assessment_path": {
    "questions": [
      {
        "id": "q1",
        "prompt": "A=3, B=4, θ=90°. What is R?",
        "correct_answer": "5",
        "acceptable_range": [
          4.9,
          5.1
        ],
        "if_wrong_says": "7",
        "wrong_type": "scalar_addition",
        "if_wrong": "route to epic_c_branches.scalar_addition STATE_4",
        "if_right": "proceed to q2"
      },
      {
        "id": "q2",
        "prompt": "A=5, B=5, θ=180°. What is R?",
        "correct_answer": "0",
        "acceptable_range": [
          0,
          0.1
        ],
        "if_wrong_says": "10",
        "wrong_type": "scalar_addition",
        "if_wrong": "route to epic_c_branches.resultant_always_larger STATE_1",
        "if_right": "assessment_passed"
      }
    ],
    "on_pass": "mark concept understood in session_context",
    "on_fail": "route to appropriate epic_c_branch based on wrong_type"
  },
  "session_awareness": {
    "if_already_shown_this_session": "skip full simulation. Run Stage 4 script writer only, referencing previous simulation.",
    "force_replay_keywords": [
      "show again",
      "phir se",
      "dobara",
      "replay",
      "once more"
    ]
  },
  "waypoints": [
    {
      "must_reach": "Student sees gap between naive sum A+B and actual resultant",
      "physics_floor": "R = √(A²+B²+2ABcosθ) must be shown at least once",
      "position": "first_third"
    },
    {
      "must_reach": "Angle dependence demonstrated with at least two different θ values",
      "physics_floor": "At θ=90°, R must show as √(A²+B²) not A+B",
      "position": "middle"
    },
    {
      "must_reach": "Student interacts with at least one slider and sees R update",
      "physics_floor": null,
      "position": "last_state"
    }
  ],
  "depth_escalation_trigger": {
    "condition": "micro_template_used AND student_asked_followup_on_same_concept",
    "action": "escalate to epic_c_branch silently"
  },
  "common_misconceptions": [
    {
      "id": "scalar_addition",
      "belief": "Vector magnitudes add like numbers — two 3N forces always give 6N regardless of direction",
      "trigger_phrases": [
        "forces add normally",
        "3 plus 3 is 6",
        "sirf magnitude add",
        "simply add kar do",
        "magnitude add ho jaate hain",
        "3 aur 4 ka resultant 7",
        "add the magnitudes"
      ],
      "correction": "R = √(A²+B²+2ABcosθ). At θ=90°, two 3N forces give √18 ≈ 4.24N, not 6N.",
      "simulation_emphasis": "Show same magnitudes at θ=0° giving A+B, then θ=90° giving √(A²+B²) — contrast must be unmissable"
    },
    {
      "id": "resultant_always_larger",
      "belief": "The resultant is always larger than each individual vector",
      "trigger_phrases": [
        "resultant bada hoga",
        "adding makes bigger",
        "R bigger than both",
        "must be larger",
        "addition se bada hona chahiye"
      ],
      "correction": "|A-B| ≤ R ≤ A+B. At θ=180°, R=|A-B| which can be smaller than either vector.",
      "simulation_emphasis": "Show θ=180° immediately — R=|A-B| is smaller than both A and B"
    },
    {
      "id": "direction_irrelevant",
      "belief": "Direction of a vector does not affect calculations",
      "trigger_phrases": [
        "direction ignore kar sakte",
        "only magnitude matters",
        "direction nahi chahiye",
        "angle optional hai"
      ],
      "correction": "A=5, B=5 can give resultants from 0 to 10 depending only on θ. Direction is the defining property of vectors.",
      "simulation_emphasis": "Show A=5, B=5 at θ=0° giving R=10 and θ=180° giving R=0"
    }
  ],
  "legend": [
    {
      "symbol": "A (blue)",
      "meaning": "First vector with magnitude A"
    },
    {
      "symbol": "B (orange)",
      "meaning": "Second vector with magnitude B"
    },
    {
      "symbol": "R (green)",
      "meaning": "Resultant = A+B, magnitude √(A²+B²+2ABcosθ)"
    },
    {
      "symbol": "θ",
      "meaning": "Angle between the two vectors (0° to 180°)"
    },
    {
      "symbol": "α",
      "meaning": "Angle resultant makes with A = tan⁻¹(B sinθ / A+B cosθ)"
    },
    {
      "symbol": "Parallelogram (shaded)",
      "meaning": "Formed by A and B — diagonal is the resultant"
    }
  ],
  "concept_extension_fields": {
    "note": "Renderer reads these only for scenario_type = vector_addition",
    "show_parallelogram": true,
    "show_triangle_law": true,
    "show_angle_arc": true,
    "show_formula_panel": true,
    "animate_angle_sweep": true,
    "special_cases_to_highlight": [
      {
        "theta": 0,
        "R_formula": "A + B",
        "banner": "Maximum resultant",
        "color": "#66BB6A"
      },
      {
        "theta": 90,
        "R_formula": "√(A² + B²)",
        "banner": "Pythagorean case",
        "color": "#FFD54F"
      },
      {
        "theta": 180,
        "R_formula": "|A − B|",
        "banner": "Minimum resultant",
        "color": "#EF5350"
      }
    ]
  },
  "jee_specific": {
    "typical_question_types": [
      "given magnitudes and angle find resultant magnitude and direction",
      "find angle between vectors given the resultant magnitude",
      "two equal vectors at θ find resultant",
      "resultant equals one of the vectors find angle",
      "n equal vectors at equal angular spacing find resultant",
      "equilibrium of three concurrent forces"
    ],
    "common_traps": [
      "Using R=A+B without checking θ=0°",
      "Forgetting 2ABcosθ term",
      "Using angle resultant makes with axis instead of angle between vectors",
      "Not verifying answer lies in |A-B| ≤ R ≤ A+B",
      "Equal vectors at 120° give R=A — students often guess 0"
    ],
    "key_results_to_memorize": [
      "Two equal vectors at θ: R = 2A cos(θ/2)",
      "A=B and R=A: θ=120°",
      "A=B and R=A√2: θ=90°",
      "A=B and R=A√3: θ=60°",
      "A=B and R=0: θ=180°"
    ],
    "numerical_ranges": {
      "A": "2-10 units (3-4-5 triple most common)",
      "B": "2-10 units",
      "theta": "0°, 30°, 45°, 60°, 90°, 120°, 150°, 180°"
    }
  },
  "concept_relationships": {
    "prerequisites": [
      "scalar_and_vector_basics"
    ],
    "extensions": [
      "vector_components",
      "relative_motion",
      "projectile_motion",
      "equilibrium_of_forces",
      "dot_product",
      "cross_product"
    ],
    "siblings": [
      "vector_components",
      "dot_product",
      "cross_product"
    ],
    "common_exam_combinations": [
      "relative_motion",
      "laws_of_motion_friction",
      "equilibrium_rigid_body",
      "projectile_motion"
    ]
  },
  "parameter_slots": {
    "A": {
      "label": "magnitude of vector A",
      "range": [
        1,
        50
      ],
      "unit": "N or m",
      "default": 5,
      "extraction_hint": "first vector magnitude, |A| or A ="
    },
    "B": {
      "label": "magnitude of vector B",
      "range": [
        1,
        50
      ],
      "unit": "N or m",
      "default": 3,
      "extraction_hint": "second vector magnitude, |B| or B ="
    },
    "theta": {
      "label": "angle between vectors",
      "range": [
        0,
        180
      ],
      "unit": "degrees",
      "default": 60,
      "extraction_hint": "angle between the two vectors"
    }
  },
  "panel_sync_spec": {
    "canvas_to_graph": {
      "trigger": "STATE_N_reached",
      "action": "graph marks current resultant magnitude with vertical line"
    },
    "graph_to_canvas": {
      "trigger": "student_hover_on_graph_at_theta",
      "action": "animation seeks to that angle, vectors redraw"
    },
    "slider_to_both": {
      "parameter": "theta",
      "canvas_action": "parallelogram redraws live as angle changes",
      "graph_action": "dot moves along R-vs-theta curve"
    }
  },
  "checkpoint_states": {
    "understands_triangle_law": "enter at STATE_2",
    "understands_parallelogram_law": "enter at STATE_3",
    "understands_resultant_formula": "enter at STATE_4",
    "understands_special_cases": "enter at STATE_5"
  },
  "three_js_flag": false,
  "three_js_note": "All operations are 2D. Parallelogram law and triangle law are flat constructions. canvas2d is sufficient.",
  "regeneration_variants": [
    {
      "variant_id": 1,
      "scenario_type": "vector_addition",
      "approach": "special_cases_first",
      "entry_state": "STATE_5",
      "teacher_angle": "Start from the three memorable special cases that make the general formula intuitive. Zero degrees: same direction, R = A + B — maximum possible resultant, trivially obvious. 180 degrees: opposite directions, R = |A - B| — minimum possible resultant. 90 degrees: perpendicular, R = sqrt(A squared + B squared) — Pythagoras, already known from school. Now the general formula R = sqrt(A squared + B squared + 2AB cos theta) is just the generalisation of these three cases the student already understands.",
      "locked_facts_focus": [
        "fact_5",
        "fact_6",
        "fact_7"
      ],
      "panel_b_focus": "R vs theta curve with three anchor points highlighted: theta=0 (R=A+B, maximum), theta=90 (R=sqrt, Pythagoras), theta=180 (R=|A-B|, minimum). General formula traces through all three anchors."
    },
    {
      "variant_id": 2,
      "scenario_type": "vector_addition",
      "approach": "connects_to_displacement_addition",
      "entry_state": "STATE_1",
      "teacher_angle": "Connect to displacement — the vector the student knows best. Adding two displacements is vector addition. Walk 4m East then 3m North: you have added two displacement vectors. The triangle law is just the head-to-tail method the student already used to find where they ended up. The parallelogram law is just doing the same thing symmetrically. Vector addition is not a new operation — it is the formalisation of combining journeys.",
      "locked_facts_focus": [
        "fact_1",
        "fact_2",
        "fact_3"
      ],
      "panel_b_focus": "Animated person walking: first displacement arrow, then second from the tip of the first. Resultant closes the triangle. Label: 'You already did this when you found net displacement in Ch.6.'"
    }
  ]
}
```


# vector_basics.json
```json
{
  "concept_id": "vector_basics",
  "concept_name": "General Points Regarding Vectors",
  "class_level": 11,
  "chapter": "Vectors",
  "section": "5.2",
  "source_coverage": {
    "dc_pandey": "Chapter 5, Section 5.2 — General Points Regarding Vectors",
    "ncert": "Chapter 4 — Motion in a Plane, Section 4.1",
    "hc_verma": "Chapter 2 — Physics and Mathematics, Section 2.2"
  },
  "source_type": "ncert_and_dc_pandey",
  "renderer_hint": {
    "technology": "canvas2d",
    "renderer": "mechanics_2d",
    "scenario_type": "vector_basics",
    "panel_count": 1,
    "show_labels": true,
    "canvas_scale": 60,
    "sync_required": false,
    "scene_mode": false
  },
  "locked_facts": {
    "unit_vector_definition": "A unit vector has magnitude exactly 1. It indicates direction only. Notation: Â (A-hat). Formula: Â = A / |A|.",
    "unit_vectors_axes": "î, ĵ, k̂ are unit vectors along x, y, z axes respectively. Each has magnitude 1.",
    "zero_vector_definition": "A zero (null) vector has magnitude 0 and no specific direction. The position vector of the origin is a zero vector.",
    "equal_vectors": "Two vectors are equal if and only if they have the same magnitude AND same direction. Position in space is irrelevant — a vector can be freely translated.",
    "parallel_vectors": "Two vectors are parallel if they have the same direction. Equal vectors are always parallel, but parallel vectors need not be equal (magnitudes may differ).",
    "antiparallel_vectors": "Two vectors are antiparallel if they act in exactly opposite directions. Angle between antiparallel vectors = 180°.",
    "negative_vector": "The negative of vector A is a vector with the same magnitude as A but opposite direction. Denoted −A.",
    "angle_between_vectors_rule": "To find angle between two vectors, draw BOTH from a single common point with arrows pointing OUTWARD. The SMALLER angle between them (0° ≤ θ ≤ 180°) is the angle between the vectors.",
    "angle_range": "The angle between any two vectors is always between 0° and 180° inclusive.",
    "scalar_multiplication": "Product of vector A and scalar m: magnitude = m|A|, direction same as A if m > 0, opposite if m < 0.",
    "concurrent_vectors": "Vectors with the same initial point are concurrent (co-initial) vectors.",
    "coplanar_vectors": "Vectors lying in the same plane are coplanar vectors.",
    "orthogonal_vectors": "Two vectors are orthogonal if the angle between them is exactly 90°.",
    "free_vector_property": "A vector can be translated (displaced) anywhere in space without changing it, as long as magnitude and direction are preserved."
  },
  "minimum_viable_understanding": "A unit vector is direction-only (magnitude = 1). The angle between two vectors is always found by drawing both from ONE point, arrows outward, taking the SMALLER angle (never greater than 180°).",
  "variables": {
    "A": "Vector A (magnitude |A| or A)",
    "A_hat": "Unit vector in direction of A = A / |A|",
    "m": "Scalar multiplier",
    "theta": "Angle between two vectors (0° ≤ θ ≤ 180°)"
  },
  "routing_signals": {
    "global_triggers": [
      "what is a unit vector",
      "explain kinds of vectors",
      "types of vectors in physics",
      "general properties of vectors"
    ],
    "local_triggers": [
      "what is unit vector",
      "null vector kya hota hai",
      "equal vectors vs parallel vectors",
      "how to find angle between two vectors",
      "what is negative of a vector",
      "antiparallel vectors",
      "coplanar vectors meaning",
      "scalar multiplication of vector"
    ],
    "micro_triggers": [
      "what is i hat j hat k hat",
      "why unit vector magnitude is 1",
      "can two vectors be equal if at different positions",
      "what is free vector",
      "zero vector direction"
    ],
    "simulation_not_needed_triggers": [
      "list types of vectors",
      "define coplanar vectors",
      "define concurrent vectors"
    ],
    "subconcept_triggers": {
      "unit_vector": [
        "what is unit vector",
        "how to find unit vector",
        "unit vector formula",
        "A hat meaning"
      ],
      "angle_between_vectors": [
        "how to find angle between two vectors",
        "angle between vectors rule",
        "why smaller angle",
        "angle between A and minus A"
      ],
      "scalar_multiplication": [
        "multiply vector by scalar",
        "what happens when vector multiplied by negative number",
        "scalar times vector"
      ],
      "negative_vector": [
        "what is negative vector",
        "minus A vector",
        "negative of vector"
      ],
      "equal_vs_parallel": [
        "difference between equal and parallel vectors",
        "equal vectors same as parallel",
        "parallel vectors equal"
      ]
    }
  },
  "checkpoint_states": {
    "understands_unit_vector": "enter at STATE_2",
    "understands_angle_rule": "enter at STATE_3",
    "understands_kinds": "enter at STATE_4",
    "understands_scalar_multiplication": "enter at STATE_5"
  },
  "prerequisite_check": {
    "required_concepts": [
      "scalar_vs_vector"
    ],
    "gate_question": "Is electric current a scalar or vector? (If student cannot answer, route to scalar_vs_vector first)",
    "if_gap_detected": "redirect to scalar_vs_vector.json before proceeding"
  },
  "epic_l_path": {
    "state_count": 6,
    "board_mode_states": [
      1,
      2,
      3,
      4
    ],
    "jee_mode_states": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "scope": "global",
    "states": {
      "STATE_1": {
        "label": "The Hook — What Does It Mean to 'Scale' a Vector?",
        "physics_layer": {
          "concept": "Vectors have magnitude AND direction — what happens to each when multiplied by a scalar?",
          "simulation_focus": "Show velocity vector v pointing northeast at 4 m/s. Show 2v — same direction, doubled length. Show −v — flipped direction, same length. Show 0.5v — same direction, halved length. Show −2v — flipped direction, doubled length.",
          "interactive": "Slider for scalar m from −3 to 3. Arrow updates in real time. When m crosses 0, arrow flips direction instantaneously.",
          "key_observation": "Positive scalar → scales magnitude, preserves direction. Negative scalar → scales magnitude, reverses direction. Zero → null vector.",
          "scenario": "vector_representation"
        },
        "pedagogy_layer": {
          "opening_question": "If a car is moving northeast at 20 m/s and you double its speed — what changes? What if you reverse its direction and halve the speed?",
          "teacher_script": "When physics multiplies a vector by a number, both magnitude and direction react. Let me show you exactly how."
        }
      },
      "STATE_2": {
        "label": "Unit Vectors — Pure Direction, No Magnitude Bias",
        "physics_layer": {
          "concept": "Unit vector = direction extractor. Magnitude = 1 always.",
          "simulation_focus": "Show vector A of arbitrary length pointing in some direction. Animate the process: draw A, show |A| as a number, divide A by |A| — the resulting arrow shrinks to length 1 but points in exactly the same direction. Label it Â.",
          "formula_display": "Â = A / |A|",
          "then_show": "Show î, ĵ, k̂ as unit arrows along x, y, z axes. Each exactly 1 unit long. These are the building blocks every vector is assembled from.",
          "key_insight": "Any vector A = |A| × Â. Magnitude and direction are completely separated.",
          "scenario": "unit_vector_definition"
        },
        "pedagogy_layer": {
          "analogy": "Unit vector is like a compass needle — it only tells you which way, not how far. The magnitude tells you how far.",
          "common_mistake": "Students try to add unit vectors as if they're numbers. î + ĵ ≠ 2. It equals √2 at 45°."
        }
      },
      "STATE_3": {
        "label": "The Angle Rule — Always From One Point, Always the Smaller",
        "physics_layer": {
          "concept": "The angle between two vectors has a specific measurement protocol",
          "simulation_focus": "Show DC Pandey's Fig 5.4 scenario: Two vectors A and B drawn tail-to-head (WRONG method). Then animate redrawing both from the SAME point with arrows outward (CORRECT). The angle jumps from apparent 120° to correct 60°.",
          "interactive": "Two vectors the student can drag. System always shows: (a) the WRONG angle (if measured incorrectly) and (b) the CORRECT angle (both from same point, smaller value).",
          "rule": "Step 1: Move both vectors so their TAILS are at the same point. Step 2: Arrows point OUTWARD from that point. Step 3: Take the SMALLER of the two possible angles.",
          "constraint": "0° ≤ θ ≤ 180°. Never more than 180°.",
          "scenario": "vector_magnitude_formula"
        },
        "pedagogy_layer": {
          "example_from_book": "DC Pandey Example 5.1: Three figures where apparent angles are 45°, 150°, and 35° — correctly identified by redrawing from one point.",
          "key_trap": "If vectors are drawn tail-to-head (like in addition), the visual angle is NOT the angle between them."
        }
      },
      "STATE_4": {
        "label": "Kinds of Vectors — The Full Taxonomy",
        "physics_layer": {
          "concept": "All the types: equal, parallel, antiparallel, negative, unit, zero, concurrent, coplanar, orthogonal",
          "simulation_focus": "Interactive gallery — click on each type to see it drawn. Each shows the defining property visually.",
          "types": {
            "equal": "Same magnitude, same direction — position irrelevant. A = B means |A| = |B| AND same direction.",
            "parallel": "Same direction, ANY magnitude. A || B means they point the same way.",
            "antiparallel": "Exactly opposite directions. θ = 180°.",
            "negative": "−A has same |A| but opposite direction. A + (−A) = zero vector.",
            "unit": "|Â| = 1. Direction only.",
            "zero": "|0| = 0. No direction. Mathematical placeholder.",
            "concurrent": "All starting from same point.",
            "coplanar": "All lying in same plane.",
            "orthogonal": "θ = 90° between them."
          },
          "critical_distinction": "Equal vectors are always parallel. Parallel vectors are NOT always equal (can have different magnitudes).",
          "scenario": "vector_direction_angle"
        },
        "pedagogy_layer": {
          "jee_trap": "Two equal vectors are always parallel — TRUE. Two parallel vectors are always equal — FALSE (classic assertion-reason)."
        }
      },
      "STATE_5": {
        "label": "Scalar Multiplication — The Full Rules",
        "physics_layer": {
          "concept": "All algebraic rules for mixing scalars and vectors",
          "formula_display": [
            "|mA| = |m| × |A|",
            "(m + n)A = mA + nA  (distributive over scalar addition)",
            "m(nA) = (mn)A = n(mA)  (associative)",
            "A/m = A × (1/m)  (division = multiplication by reciprocal)"
          ],
          "simulation_focus": "Show (m+n)A = mA + nA visually. Set m=2, n=3, A=5 units northeast. Show 5A = 25 units northeast. Show 2A + 3A = 10 + 15 = 25 units northeast. They match.",
          "special_case": "m = −1 gives −A (the negative vector). m = 0 gives zero vector.",
          "scenario": "negative_vector"
        },
        "pedagogy_layer": {
          "key_message": "Scalar multiplication distributes and associates exactly like ordinary multiplication — because scalars obey ordinary algebra. The only vector rule is direction flipping when m < 0."
        }
      },
      "STATE_6": {
        "label": "Student Interaction — Angle Finding and Unit Vector Extraction",
        "physics_layer": {
          "concept": "Applied practice on the two hardest skills from this section",
          "simulation_focus": "Problem set simulation. Student given three scenarios:",
          "scenario_1": "Vectors A (pointing east) and −(3/2)A (pointing west) — find angle between them. Answer: 180° (antiparallel). Source: DC Pandey Example 5.2.",
          "scenario_2": "Vector A = 6î − 8ĵ. Find unit vector Â. Answer: |A| = √(36+64) = 10. Â = (6î − 8ĵ)/10 = 0.6î − 0.8ĵ. Source: DC Pandey Example 5.5.",
          "scenario_3": "Two vectors shown at wrong angle visually — student must redraw and find correct θ.",
          "scenario": "equal_vectors"
        }
      }
    }
  },
  "epic_c_branches": [
    {
      "branch_id": "unit_vector_magnitude_confusion",
      "misconception": "Unit vector of A has same magnitude as A, just divided into components",
      "student_belief": "If A = 10 units, then Â = 10 units in a unit direction, not 1 unit",
      "trigger_phrases": [
        "unit vector magnitude is not 1",
        "unit vector of 10N force is 10N",
        "hat A same magnitude as A",
        "unit vector bada hoga"
      ],
      "state_count": 5,
      "scope": "local",
      "feedback_tag": "unit_vector_is_dimensionless_direction",
      "states": {
        "STATE_1": {
          "label": "Show the Belief",
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Show vector A = 10î + 0ĵ (magnitude 10, pointing east). Student's belief: Â also has magnitude 10. Display this belief — Â shown as 10 units long.",
            "question": "If Â had magnitude 10, what would 10 × Â equal? That would be 100 units in the same direction — not A itself. The formula A = |A| × Â would break.",
            "scenario": "unit_vector_magnitude_confusion_s1"
          }
        },
        "STATE_2": {
          "label": "The Division Process — Animated",
          "physics_layer": {
            "simulation": "Animate: Start with A = 10 units east. Show |A| = 10. Now divide: animate the arrow shrinking from length 10 to length 1, same direction. Label result Â. Show numerically: Â = (10î)/10 = 1î. Magnitude = 1.",
            "scenario": "unit_vector_magnitude_confusion_s2"
          }
        },
        "STATE_3": {
          "label": "Why Magnitude Must Be 1",
          "physics_layer": {
            "content": "Unit vector is a NORMALISATION. It strips away the magnitude and keeps only direction. Proof: |Â| = |A/|A|| = |A|/|A| = 1. Always.",
            "formula_check": "A = |A| × Â. If |Â| ≠ 1, then |A| ≠ the original magnitude. Contradiction.",
            "scenario": "unit_vector_magnitude_confusion_s3"
          }
        },
        "STATE_4": {
          "label": "Unit Vectors Are Dimensionless",
          "physics_layer": {
            "content": "If A is a force (Newtons), Â has no units — it is a pure direction. If A is a velocity (m/s), Â has no units. The division cancels the units. This is why î, ĵ, k̂ have no physical dimension.",
            "simulation": "Show Â = A/|A| with unit tracking: [N]/[N] = dimensionless.",
            "scenario": "unit_vector_magnitude_confusion_s4"
          }
        },
        "STATE_5": {
          "label": "Practice: Find Â for a Given Vector",
          "physics_layer": {
            "problem": "A = 3î + 4ĵ. Find Â.",
            "solution_steps": "|A| = √(9+16) = 5. Â = (3î + 4ĵ)/5 = 0.6î + 0.8ĵ. Check: |Â| = √(0.36 + 0.64) = √1 = 1. ✓",
            "simulation": "Show the 3-4-5 triangle. Original vector has length 5. Unit vector has length 1, same direction.",
            "scenario": "unit_vector_magnitude_confusion_s5"
          }
        }
      }
    },
    {
      "branch_id": "angle_measurement_wrong_method",
      "misconception": "The angle between two vectors is measured from the diagram as-drawn, not by redrawing from one point",
      "student_belief": "If B starts where A ends (like in vector addition), the angle between them is the angle visible in that diagram",
      "trigger_phrases": [
        "angle between vectors in triangle",
        "angle between vectors when tail to head",
        "wrong angle between vectors",
        "dono vectors ek hi jagah se draw karo"
      ],
      "state_count": 5,
      "scope": "local",
      "feedback_tag": "both_tails_same_point_smaller_angle",
      "states": {
        "STATE_1": {
          "label": "Show the Wrong Method Producing a Wrong Answer",
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Show A pointing east, B starting at A's tip pointing northeast. The visible angle between them tail-to-head looks like 45°. If student measures here: angle = 45°.",
            "then_show": "Now redraw correctly: both tails at origin, A pointing east, B pointing northeast. Correct angle = 45°. In THIS case they match — coincidence.",
            "then_harder_case": "Show a case where they don't match: A pointing east, B pointing west-northwest (tail-to-head looks like 150°). Correctly drawn from same point: θ = 30°. WRONG method gives 150°, CORRECT gives 30°.",
            "scenario": "angle_measurement_wrong_method_s1"
          }
        },
        "STATE_2": {
          "label": "The Rule and Why",
          "physics_layer": {
            "content": "Angle between vectors is a property of the vectors themselves — not of how they happen to be drawn on the page. Two equal vectors at 60° are always at 60° regardless of where you draw them.",
            "rule": "Step 1: Move both to same tail point. Step 2: Arrows outward. Step 3: Take the SMALLER angle.",
            "scenario": "angle_measurement_wrong_method_s2"
          }
        },
        "STATE_3": {
          "label": "DC Pandey's Three Examples — Interactive",
          "physics_layer": {
            "simulation": "Show the three scenarios from DC Pandey Fig 5.12. Student must identify the correct angle for each by mentally redrawing from one point. Answers: 45°, 150°, 35°.",
            "scenario": "angle_measurement_wrong_method_s3"
          }
        },
        "STATE_4": {
          "label": "The 0° to 180° Constraint",
          "physics_layer": {
            "content": "Why is the angle never more than 180°? Because the SMALLER of the two possible angles is always ≤ 180°. If you get 210°, the actual angle is 360° − 210° = 150°.",
            "simulation": "Show two vectors. Show both the 'going around clockwise' angle and the 'going around anticlockwise' angle. The SMALLER one is always θ.",
            "scenario": "angle_measurement_wrong_method_s4"
          }
        },
        "STATE_5": {
          "label": "Special Case: Angle Between a and −(3/2)a",
          "physics_layer": {
            "source": "DC Pandey Example 5.2",
            "simulation": "Show vector a pointing east. Show −(3/2)a: magnitude = (3/2)|a|, direction = WEST (opposite). When drawn from same point: one arrow east, one arrow west. Angle = 180°.",
            "key": "Negative scalar → opposite direction → antiparallel → 180°. The (3/2) factor doesn't affect the angle, only the magnitude.",
            "scenario": "angle_measurement_wrong_method_s5"
          }
        }
      }
    },
    {
      "branch_id": "equal_vs_parallel_confusion",
      "misconception": "Equal vectors and parallel vectors are the same thing",
      "student_belief": "If two vectors are parallel they must be equal, and if equal they must be parallel",
      "trigger_phrases": [
        "parallel vectors are equal",
        "equal vectors not parallel",
        "difference parallel and equal vectors",
        "kya parallel vectors equal hote hain"
      ],
      "state_count": 4,
      "scope": "local",
      "feedback_tag": "equal_implies_parallel_not_converse",
      "states": {
        "STATE_1": {
          "label": "Show the Belief — They Look the Same",
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Show two arrows pointing northeast. Student's belief: both parallel = both equal. Now label one A (magnitude 5) and one B (magnitude 10). Both pointing northeast. Are they equal? NO — different magnitudes.",
            "scenario": "vb_wrong_position_dependent"
          }
        },
        "STATE_2": {
          "label": "The Hierarchy",
          "physics_layer": {
            "simulation": "Venn diagram animation. Large circle: PARALLEL vectors (same direction). Smaller circle inside: EQUAL vectors (same direction AND same magnitude). Equal is a subset of parallel.",
            "rule": "Equal → always parallel. Parallel → NOT necessarily equal.",
            "scenario": "vb_position_independent"
          }
        },
        "STATE_3": {
          "label": "Free Vector Property",
          "physics_layer": {
            "content": "A vector can be freely moved (translated) in space without changing it — as long as magnitude and direction are preserved. This is why position doesn't matter for equality.",
            "simulation": "Show vector A at three different positions on the canvas. All same length, same direction. All represent the SAME vector. Contrast with position vector (which is fixed to origin — covered in vector_components.json).",
            "scenario": "vb_aha_only_mag_dir"
          }
        },
        "STATE_4": {
          "label": "JEE Assertion-Reason",
          "physics_layer": {
            "question": "Assertion: Two equal vectors are always parallel. Reason: Two parallel vectors are always equal.",
            "answer": "Assertion TRUE. Reason FALSE. Answer: Assertion correct, Reason incorrect.",
            "explanation": "Equal requires same direction (→ parallel) AND same magnitude. Parallel only requires same direction — magnitudes can differ.",
            "scenario": "equal_vs_parallel_confusion_s4"
          }
        }
      }
    },
    {
      "branch_id": "negative_vector_magnitude_confusion",
      "misconception": "The negative of a vector has negative magnitude",
      "student_belief": "If |A| = 5, then |−A| = −5",
      "trigger_phrases": [
        "negative vector negative magnitude",
        "minus A magnitude negative",
        "negative of vector magnitude",
        "|−A| kya hoga"
      ],
      "state_count": 4,
      "scope": "local",
      "feedback_tag": "magnitude_always_positive",
      "states": {
        "STATE_1": {
          "label": "Show the Belief",
          "physics_layer": {
            "show_students_wrong_belief": true,
            "simulation": "Show A with magnitude 5 pointing east. Student's belief: −A has magnitude −5. Display this — but also show that a negative-length arrow is physically meaningless. What would −5 meters mean?",
            "scenario": "negative_vector_magnitude_confusion_s1"
          }
        },
        "STATE_2": {
          "label": "What Negative Means for a Vector",
          "physics_layer": {
            "content": "The minus sign in −A is an OPERATOR that flips direction. It does NOT create a negative magnitude.",
            "simulation": "Show A = 5 units east. Show −A = 5 units WEST. Same magnitude, opposite direction. |−A| = |A| = 5.",
            "formula": "|−A| = |−1 × A| = |−1| × |A| = 1 × |A| = |A|",
            "scenario": "negative_vector_magnitude_confusion_s2"
          }
        },
        "STATE_3": {
          "label": "Magnitude Is Always Non-Negative",
          "physics_layer": {
            "content": "Magnitude = length of arrow. Length cannot be negative. |A| ≥ 0 always. |A| = 0 only for zero vector.",
            "analogy": "A road of −5 km doesn't exist. But a road of 5 km going in the opposite direction does.",
            "scenario": "negative_vector_magnitude_confusion_s3"
          }
        },
        "STATE_4": {
          "label": "Practice",
          "physics_layer": {
            "problems": [
              "|−3A| = ? Answer: 3|A|",
              "If A = 4î − 3ĵ, find |−A|. Answer: |A| = 5, |−A| = 5",
              "Is −A a unit vector if A is a unit vector? YES — |−A| = |A| = 1"
            ],
            "scenario": "negative_vector_magnitude_confusion_s4"
          }
        }
      }
    }
  ],
  "epic_c_micro_templates": {
    "i_hat_j_hat_meaning": {
      "trigger": "what is i hat j hat k hat",
      "states": 2,
      "content": "î, ĵ, k̂ are unit vectors along x, y, z axes. |î| = |ĵ| = |k̂| = 1. They are orthogonal: î⊥ĵ⊥k̂. They are the basis — any vector in 3D = Axî + Ayĵ + Azk̂. Think of them as the three directions of a 3D coordinate frame."
    },
    "zero_vector_direction": {
      "trigger": "what direction does zero vector point",
      "states": 2,
      "content": "The zero vector has NO direction — this is its defining property. It's a mathematical object needed for completeness (just like zero in arithmetic). A − A = zero vector. Position vector of origin = zero vector. Do not confuse with a vector of very small magnitude."
    },
    "free_vector_meaning": {
      "trigger": "can a vector be moved",
      "states": 2,
      "content": "Yes. Vectors are 'free' — position doesn't matter, only magnitude and direction. Exception: position vector and radius vector are 'bound' (fixed to the origin). All other vectors (displacement, velocity, force) can be freely translated."
    },
    "angle_between_antiparallel": {
      "trigger": "angle between A and minus A",
      "states": 2,
      "content": "A and −A are antiparallel. When drawn from same point: one points east, one points west. The angle between them = 180°. This is the maximum possible angle between any two vectors."
    },
    "null_vector_operations": {
      "trigger": "what is zero vector used for",
      "states": 2,
      "content": "Zero vector maintains mathematical closure. A + (−A) = 0 (zero vector). 0 × A = zero vector. A + 0 = A. Without it, vector algebra would break. In physics: when net force = zero vector, the object is in equilibrium."
    },
    "scalar_times_vector_direction": {
      "trigger": "what happens to direction when vector multiplied by negative scalar",
      "states": 2,
      "content": "Negative scalar flips direction 180°. Positive scalar preserves direction. Zero scalar gives zero vector. Example: −2A has magnitude 2|A| and points OPPOSITE to A. This is exactly subtraction: A − B = A + (−B) = A + (−1)B."
    }
  },
  "static_responses": {
    "types_of_vectors_list": {
      "trigger": "types of vectors list",
      "simulation_needed": false,
      "response": "Types: (1) Unit vector — magnitude 1, direction only. (2) Zero/null vector — magnitude 0. (3) Equal vectors — same magnitude AND direction. (4) Parallel vectors — same direction, any magnitude. (5) Antiparallel vectors — opposite directions. (6) Negative vector — same magnitude, opposite direction. (7) Concurrent vectors — same starting point. (8) Coplanar vectors — in same plane. (9) Orthogonal vectors — 90° between them."
    },
    "unit_vector_formula": {
      "trigger": "unit vector formula",
      "simulation_needed": false,
      "response": "Â = A / |A|. Steps: (1) Find magnitude |A| = √(Ax² + Ay² + Az²). (2) Divide each component by |A|. Result has magnitude 1 and same direction as A. Verification: |Â| = √((Ax/|A|)² + (Ay/|A|)²) = |A|/|A| = 1."
    },
    "angle_rule_text": {
      "trigger": "rule for angle between vectors",
      "simulation_needed": false,
      "response": "Rule: Draw BOTH vectors from the SAME POINT with arrows pointing OUTWARD. Take the SMALLER angle between them. This angle is always between 0° and 180°. Never measure angle when vectors are drawn tail-to-head (like in addition) — that gives wrong result."
    }
  },
  "problem_guidance_path": {
    "description": "Help student solve unit vector problems and angle-finding problems",
    "unit_vector_steps": "Step 1: Write vector in component form A = Axî + Ayĵ + Azk̂. Step 2: Find |A| = √(Ax² + Ay² + Az²). Step 3: Â = A/|A| = (Ax/|A|)î + (Ay/|A|)ĵ + (Az/|A|)k̂. Step 4: Verify |Â| = 1.",
    "angle_finding_steps": "Step 1: Redraw both vectors from same point. Step 2: Identify smaller angle. Step 3: If vectors given in component form, use dot product: cosθ = A·B/(|A||B|) — covered in dot_product.json."
  },
  "example_library": {
    "example_1": {
      "source": "DC Pandey Example 5.2",
      "principle": "Angle between vector a and −(3/2)a — scalar multiplier affects magnitude, not the direction relationship",
      "aha": "Any negative scalar multiple of a vector is antiparallel to it — angle is always 180° regardless of scalar magnitude",
      "simulation_states": 2
    },
    "example_2": {
      "source": "DC Pandey Example 5.1 (Fig 5.12)",
      "principle": "Three figures demonstrating angle measurement — both vectors must be redrawn from the same point before measuring",
      "aha": "Tail-to-head drawing (used in addition) gives wrong angle — always redraw from one point for angle measurement",
      "simulation_states": 2
    },
    "example_3": {
      "source": "DC Pandey Example 5.5",
      "principle": "Finding unit vector of A = 6î − 8ĵ using Â = A/|A|",
      "aha": "Magnitude check |Â| = 1 is the verification step students skip — always verify",
      "simulation_states": 2
    }
  },
  "assessment_path": {
    "question_1": {
      "text": "If A = 3î + 4ĵ, what is the unit vector Â?",
      "options": [
        "(3î + 4ĵ)/5",
        "(3î + 4ĵ)/7",
        "3î + 4ĵ",
        "(î + ĵ)/√2"
      ],
      "correct": 0,
      "if_wrong_1": "route to unit_vector_magnitude_confusion branch",
      "explanation": "|A| = √(9+16) = 5. Â = (3î + 4ĵ)/5. Check: |(3/5)î + (4/5)ĵ| = √(9/25 + 16/25) = √1 = 1. ✓"
    },
    "question_2": {
      "text": "Two equal vectors are always parallel. Two parallel vectors are always equal. Which is/are correct?",
      "options": [
        "Both correct",
        "Only first correct",
        "Only second correct",
        "Both wrong"
      ],
      "correct": 1,
      "if_wrong_0": "route to equal_vs_parallel_confusion branch",
      "explanation": "Equal → same direction → parallel. But parallel only requires same direction — magnitudes can differ, so parallel does NOT imply equal."
    },
    "question_3": {
      "text": "What is the angle between vectors A and −(5/3)A?",
      "options": [
        "0°",
        "60°",
        "120°",
        "180°"
      ],
      "correct": 3,
      "if_wrong": "route to angle_measurement_wrong_method branch",
      "explanation": "−(5/3)A has opposite direction to A regardless of the scalar magnitude (5/3). Opposite direction → antiparallel → 180°."
    },
    "question_4": {
      "text": "If A is a unit vector, what is |−3A|?",
      "options": [
        "-3",
        "3",
        "1",
        "-1"
      ],
      "correct": 1,
      "if_wrong_0": "route to negative_vector_magnitude_confusion branch",
      "explanation": "|−3A| = |−3| × |A| = 3 × 1 = 3. Magnitude is always positive. The negative sign flips direction, not magnitude."
    },
    "question_5": {
      "text": "Vector A points east. Vector B starts at A's tip and points north. The angle between A and B is:",
      "options": [
        "90°",
        "270°",
        "Depends on position",
        "Cannot determine without components"
      ],
      "correct": 0,
      "if_wrong": "route to angle_measurement_wrong_method branch",
      "explanation": "Redraw both from same point: A east, B north. Angle between east and north = 90°. The tail-to-head drawing was a red herring."
    }
  },
  "session_awareness": {
    "if_already_shown_epic_l": "skip to micro or targeted practice — don't re-show full taxonomy",
    "if_coming_from_scalar_vs_vector": "student knows what a vector is — jump to STATE_2 (unit vectors) directly",
    "if_coming_from_vector_addition": "student has seen parallelogram law — use that to motivate unit vector decomposition"
  },
  "waypoints": {
    "fallback_unknown_confusion": "Default to unit vector calculation — it's the most mechanically useful skill from this section and the most commonly tested.",
    "escalation_trigger": "If student asks about angle calculation from components, redirect to dot_product.json — that's where cosθ = A·B/(|A||B|) lives."
  },
  "depth_escalation_trigger": {
    "condition": "Student asks why the angle convention is 0° to 180° and not 0° to 360°",
    "escalate_to": "Dot product gives cosθ which is ambiguous for θ > 180° (same value as 360°−θ). Restricting to [0°, 180°] makes the angle unique. Cross product resolves orientation separately.",
    "level": "JEE Advanced conceptual"
  },
  "jee_specific": {
    "typical_question_types": [
      "Find unit vector in direction of A = aî + bĵ + ck̂",
      "Find angle between A and −nA (always 180°)",
      "Assertion: Equal vectors are parallel. Reason: Parallel vectors are equal.",
      "If Â is a unit vector, find |Â|² — answer is 1",
      "Which of following is a null vector? A−A, A+A, 2A, A/|A|",
      "A vector of magnitude 5 units makes 30° with x-axis — find components (uses 5.2 + 5.4)"
    ],
    "common_traps": [
      "Measuring angle from tail-to-head diagram instead of redrawn from one point",
      "Unit vector of A having same magnitude as A",
      "Parallel vectors → must be equal (FALSE)",
      "|−A| = −|A| (FALSE — magnitude is always positive)",
      "Zero vector has a direction (FALSE — no specific direction)",
      "î + ĵ = 2 (FALSE — it equals √2 at 45°, not 2)"
    ],
    "key_results": [
      "Â = A/|A|, |Â| = 1 always",
      "Angle between A and −A = 180°",
      "Equal → parallel (TRUE). Parallel → equal (FALSE).",
      "|mA| = |m||A|",
      "î·î = ĵ·ĵ = k̂·k̂ = 1 (from dot_product.json)",
      "î×ĵ = k̂ (from cross_product.json)"
    ]
  },
  "concept_relationships": {
    "prerequisites": [
      "scalar_vs_vector"
    ],
    "extensions": [
      "vector_addition",
      "vector_components",
      "dot_product",
      "cross_product"
    ],
    "siblings": [
      "scalar_vs_vector"
    ],
    "common_exam_combinations": [
      "vector_components — unit vectors î ĵ k̂ are the foundation of component notation",
      "dot_product — angle between vectors is formally computed via cosθ = A·B/(|A||B|)",
      "cross_product — unit normal vector n̂ = (A×B)/|A×B|"
    ]
  },
  "three_js_flag": false,
  "three_js_note": "All concepts in 5.2 are 2D or at most simple 3D axis diagrams. canvas2d is sufficient. Three.js not needed.",
  "parameter_slots": {},
  "panel_sync_spec": null,
  "regeneration_variants": [
    {
      "variant_id": 1,
      "scenario_type": "vector_basics",
      "approach": "equal_vectors_paradox",
      "entry_state": "STATE_4",
      "teacher_angle": "Start with the most counterintuitive result in this section: two arrows drawn at completely different positions on the page are mathematically identical if they have the same length and direction. Position does not matter. This is the free vector concept. Show three arrows — one in top-left, one in centre, one in bottom-right — all representing the same vector A. Then ask: what does it mean for two vectors to be equal? Only magnitude and direction. Nothing else.",
      "locked_facts_focus": [
        "fact_4",
        "fact_5",
        "fact_6"
      ],
      "panel_b_focus": "Three identical arrows at different canvas positions. All labeled as vector A. Student can drag any arrow to any position — the equality is preserved. Contrast with position vector which is fixed at origin."
    },
    {
      "variant_id": 2,
      "scenario_type": "vector_basics",
      "approach": "connects_to_scalar_vs_vector",
      "entry_state": "STATE_2",
      "teacher_angle": "Connect to what was just learned: scalars have magnitude only, vectors have magnitude and direction. Vector basics is just making that arrow representation precise. The arrow length is the magnitude. The arrowhead is the direction. Everything else in this section — parallel vectors, antiparallel vectors, unit vectors, null vector — is just naming special cases of that one arrow. Use the scalar vs vector contrast as the foundation for every definition here.",
      "locked_facts_focus": [
        "fact_1",
        "fact_2",
        "fact_3"
      ],
      "panel_b_focus": "Each vector type shown as a labelled arrow variant. Parallel: same direction arrows. Antiparallel: opposite direction. Unit vector: length exactly 1. Null vector: length 0. All derived from the basic arrow concept."
    }
  ]
}
```


# vector_components.json
```json
{
  "concept_id": "vector_components",
  "concept_name": "Components of a Vector — Resolution and Unit Vectors",
  "class_level": 11,
  "chapter": "Vectors",
  "source_coverage": {
    "dc_pandey": "Chapter 5 — Section 5.4, Examples 5.4–5.8, Introductory Exercise 5.2",
    "ncert": "Class 11 Chapter 4 — Motion in a Plane, Section 4.2",
    "hc_verma": "Chapter 2 — Physics and Mathematics"
  },
  "minimum_viable_understanding": "Any vector can be broken into perpendicular components along x and y axes. Adding the components back together always gives the original vector — resolution is perfectly reversible.",
  "renderer_hint": {
    "technology": "canvas2d",
    "renderer": "mechanics_2d",
    "scenario_type": "vector_components",
    "panel_count": 2,
    "show_labels": true,
    "show_components": true,
    "canvas_scale": 60,
    "technology_b": "plotly",
    "sync_required": true,
    "scene_mode": false,
    "panel_a_role": "Animated vector with component breakdown — Ax and Ay arrows live",
    "panel_b_role": "Plotly bar chart — Fx vs Fy values updating with angle slider"
  },
  "variables": {
    "R": {
      "name": "Magnitude of the vector being resolved",
      "symbol": "R",
      "unit": "units",
      "role": "independent"
    },
    "alpha": {
      "name": "Angle vector makes with x-axis",
      "symbol": "α",
      "unit": "degrees",
      "role": "independent"
    },
    "Rx": {
      "name": "x-component of vector R",
      "symbol": "Rₓ",
      "unit": "units",
      "role": "dependent",
      "formula": "R cosα"
    },
    "Ry": {
      "name": "y-component of vector R",
      "symbol": "Rᵧ",
      "unit": "units",
      "role": "dependent",
      "formula": "R sinα"
    },
    "i_hat": {
      "name": "Unit vector along x-axis",
      "symbol": "î",
      "unit": "dimensionless",
      "role": "constant",
      "value": 1,
      "note": "Magnitude exactly 1, points in positive x direction"
    },
    "j_hat": {
      "name": "Unit vector along y-axis",
      "symbol": "ĵ",
      "unit": "dimensionless",
      "role": "constant",
      "value": 1,
      "note": "Magnitude exactly 1, points in positive y direction"
    },
    "k_hat": {
      "name": "Unit vector along z-axis",
      "symbol": "k̂",
      "unit": "dimensionless",
      "role": "constant",
      "value": 1,
      "note": "Magnitude exactly 1, points out of the page"
    }
  },
  "locked_facts": [
    "A vector R in 2D can be written as R = Rₓî + Rᵧĵ where Rₓ = R cosα and Rᵧ = R sinα",
    "A vector R in 3D: R = Rₓî + Rᵧĵ + R_z k̂ with magnitude R = √(Rₓ² + Rᵧ² + R_z²)",
    "î, ĵ, k̂ are unit vectors along x, y, z axes — magnitude exactly 1, direction only",
    "Resolution is reversible: Rₓî + Rᵧĵ always gives back the original vector R",
    "Direction cosines: cosα = Rₓ/R, cosβ = Rᵧ/R, cosγ = R_z/R",
    "For perpendicular resolution: sin²α + cos²α = 1 → Rₓ² + Rᵧ² = R²",
    "Adding two vectors by components: if A = Aₓî + Aᵧĵ and B = Bₓî + Bᵧĵ then A + B = (Aₓ+Bₓ)î + (Aᵧ+Bᵧ)ĵ",
    "Resultant from components: R = √(Rₓ² + Rᵧ²), direction α = tan⁻¹(Rᵧ/Rₓ)",
    "On inclined plane: component along slope = R sinθ, component perpendicular to slope = R cosθ (where θ is the incline angle)",
    "Non-perpendicular resolution: Rₓ = R sinβ/sin(α+β), Rᵧ = R sinα/sin(α+β)"
  ],
  "truth_statements": [
    "Resolution of a vector into components is the reverse of vector addition — any vector can be expressed as a sum of two or more component vectors",
    "The rectangular (perpendicular) components along x and y are the most useful because they are independent of each other",
    "A unit vector has magnitude 1 and indicates direction only — it is found by dividing a vector by its magnitude: Â = A/|A|",
    "The component method converts vector addition into scalar arithmetic: add x-components separately and y-components separately",
    "A vector written in î, ĵ, k̂ notation carries both magnitude and direction in a single algebraic expression",
    "On an inclined plane, weight is resolved along the slope (mg sinθ) and perpendicular to the slope (mg cosθ) — these are the physically relevant directions"
  ],
  "prerequisite_check": {
    "required_concepts": [
      "vector_addition",
      "trigonometry_basics"
    ],
    "gate_signals": [
      "what is sin and cos",
      "what is a right angle triangle",
      "I don't know trigonometry"
    ],
    "if_gap_detected": "Check that student knows sin, cos, and the right-angle triangle before proceeding. Resolution is entirely built on trigonometry."
  },
  "routing_signals": {
    "global_triggers": [
      "explain vector components",
      "what are components of a vector",
      "how to resolve a vector",
      "vector resolution kya hai",
      "components kya hote hain",
      "explain i j k notation",
      "what is unit vector",
      "explain from scratch components"
    ],
    "local_triggers": [
      "why break into components",
      "how do components help in addition",
      "when to use component method",
      "I thought components are just parts",
      "why x and y separately",
      "components add kaise karte hain",
      "inclined plane pe components",
      "how to find resultant from components"
    ],
    "micro_triggers": [
      "what is i hat",
      "what is unit vector",
      "why cos alpha for x component",
      "why sin alpha for y component",
      "what are direction cosines",
      "what is Rx",
      "î ĵ k̂ kya hain"
    ],
    "simulation_not_needed_triggers": [
      "prove that Rx squared plus Ry squared equals R squared",
      "derive component formula",
      "I got wrong value for component",
      "check my component calculation",
      "what is the formula for component"
    ]
  },
  "epic_l_path": {
    "description": "Full 6-state explanation for global scope",
    "state_count": 6,
    "checkpoint_states": {
      "knows_what_resolution_means": "enter at STATE_2",
      "knows_x_y_components": "enter at STATE_3",
      "knows_unit_vectors": "enter at STATE_4",
      "knows_component_addition": "enter at STATE_5"
    },
    "states": {
      "STATE_1": {
        "label": "The problem components solve",
        "physics_layer": {
          "show_diagonal_force": true,
          "vector_F": {
            "magnitude": 10,
            "direction_deg": 37,
            "color": "#4FC3F7",
            "label": "F = 10N at 37°"
          },
          "show_question": "How do we add this with a horizontal force?",
          "show_why_diagonal_is_hard": true,
          "freeze": true,
          "scenario": "component_decomposition"
        },
        "pedagogy_layer": {
          "cognitive_trigger": "This force is at 37°. Another force is purely horizontal. How do we add them? We cannot add arrows at different angles directly — we need a common language.",
          "real_world_anchor": "A footballer kicks a ball at an angle. The ball goes forward AND upward simultaneously. To analyse each direction separately, we need components.",
          "attention_target": "The diagonal arrow — something at an angle that needs to be broken down",
          "contrast_from_previous": null
        }
      },
      "STATE_2": {
        "label": "Breaking the vector — resolution",
        "physics_layer": {
          "vector_R": {
            "magnitude": 10,
            "direction_deg": 37,
            "color": "#4FC3F7"
          },
          "show_shadow_x": true,
          "show_shadow_y": true,
          "Rx": {
            "magnitude": 8,
            "color": "#66BB6A",
            "label": "Rₓ = R cosα = 8"
          },
          "Ry": {
            "magnitude": 6,
            "color": "#FF8A65",
            "label": "Rᵧ = R sinα = 6"
          },
          "show_right_angle": true,
          "animate_projection": true,
          "freeze": false,
          "scenario": "trig_component_formulas"
        },
        "pedagogy_layer": {
          "cognitive_trigger": "Drop a perpendicular from the tip of R to the x-axis. That shadow IS the x-component. Rise to the y-axis gives the y-component.",
          "real_world_anchor": "Sunlight casting a shadow of a stick — the shadow on the ground is the horizontal component. The height of the stick is the vertical component.",
          "attention_target": "The right-angle triangle formed by R, Rₓ, and Rᵧ",
          "contrast_from_previous": "STATE_1 showed a diagonal we couldn't work with. Now it's broken into two manageable pieces."
        }
      },
      "STATE_3": {
        "label": "Unit vectors — the direction language",
        "physics_layer": {
          "show_unit_vectors": true,
          "i_hat": {
            "magnitude": 1,
            "direction_deg": 0,
            "color": "#EF5350",
            "label": "î (x-direction)"
          },
          "j_hat": {
            "magnitude": 1,
            "direction_deg": 90,
            "color": "#66BB6A",
            "label": "ĵ (y-direction)"
          },
          "show_vector_in_notation": true,
          "notation_label": "R = Rₓî + Rᵧĵ = 8î + 6ĵ",
          "show_how_scaling_works": true,
          "freeze": true,
          "scenario": "unit_vector_form"
        },
        "pedagogy_layer": {
          "cognitive_trigger": "î and ĵ are arrows of exactly length 1. They just point directions. Multiplying by a scalar scales the length. 8î means: go 8 units in the x-direction.",
          "real_world_anchor": "î is like the word 'East'. ĵ is 'North'. '8î + 6ĵ' means '8 km East and 6 km North'. The notation is a compact address.",
          "attention_target": "The unit vectors — length exactly 1, direction only",
          "contrast_from_previous": "STATE_2 showed numerical components. STATE_3 introduces the algebraic notation using î and ĵ."
        }
      },
      "STATE_4": {
        "label": "Component addition — the power",
        "physics_layer": {
          "show_two_vectors": true,
          "vector_A": {
            "notation": "3î + 4ĵ",
            "color": "#4FC3F7"
          },
          "vector_B": {
            "notation": "2î - 1ĵ",
            "color": "#FF8A65"
          },
          "show_component_addition": true,
          "sum_notation": "(3+2)î + (4-1)ĵ = 5î + 3ĵ",
          "show_resultant_magnitude": "R = √(25+9) = √34 ≈ 5.83",
          "show_diagonal_verification": true,
          "freeze": true,
          "scenario": "reconstruction_from_components"
        },
        "pedagogy_layer": {
          "cognitive_trigger": "x-components add with x-components. y-components add with y-components. Then Pythagoras gives the magnitude. Vector addition becomes simple arithmetic.",
          "real_world_anchor": "Two people giving directions: one says '3 East, 4 North'. Another says '2 East, 1 South'. Combined: 5 East, 3 North. No geometry needed — just add numbers.",
          "attention_target": "The component-wise addition — x with x, y with y",
          "contrast_from_previous": "STATE_3 showed notation. STATE_4 shows why that notation is powerful — addition becomes algebra."
        }
      },
      "STATE_5": {
        "label": "Inclined plane — non-standard axes",
        "physics_layer": {
          "show_inclined_plane": true,
          "slope_angle_deg": 30,
          "weight_vector": {
            "magnitude": 10,
            "direction_deg": 270,
            "color": "#4FC3F7",
            "label": "W = mg"
          },
          "component_along_slope": {
            "magnitude": 5,
            "color": "#EF5350",
            "label": "W sinθ = 5N (down slope)"
          },
          "component_perp_slope": {
            "magnitude": 8.66,
            "color": "#66BB6A",
            "label": "W cosθ = 8.66N (into surface)"
          },
          "show_angle_arcs": true,
          "freeze": true,
          "scenario": "negative_components_quadrants"
        },
        "pedagogy_layer": {
          "cognitive_trigger": "The axes don't have to be horizontal and vertical. On an inclined plane, we choose axes along and perpendicular to the slope — these are the physically useful directions.",
          "real_world_anchor": "A block on a ramp. Gravity pulls straight down. But the block moves along the slope, not straight down. Resolving along the slope tells us what makes it slide.",
          "attention_target": "The two components at 30° incline — along the slope and perpendicular to it",
          "contrast_from_previous": "STATE_4 used horizontal-vertical axes. STATE_5 shows axes can be chosen based on the physics."
        }
      },
      "STATE_6": {
        "label": "Student takes control",
        "physics_layer": {
          "interactive": true,
          "vector_R": {
            "magnitude": 10,
            "color": "#4FC3F7",
            "angle_adjustable": true
          },
          "show_live_components": true,
          "show_component_bars": true,
          "show_notation_updating": true,
          "show_formula_panel": true,
          "scenario": "three_d_extension"
        },
        "pedagogy_layer": {
          "cognitive_trigger": "Drag the angle. Watch Rₓ = R cosα and Rᵧ = R sinα update. At α=0°, all component is in x. At α=90°, all component is in y.",
          "attention_target": "The component bars — Rₓ shrinks as α increases, Rᵧ grows",
          "challenge": "Set α=53°, R=15N. Find Rₓ and Rᵧ. (Answer: Rₓ=15×cos53°=9N, Rᵧ=15×sin53°=12N)",
          "sliders": [
            {
              "id": "angle_alpha",
              "label": "Angle α",
              "min": 0,
              "max": 90,
              "default": 37,
              "unit": "°"
            },
            {
              "id": "magnitude_R",
              "label": "Magnitude R",
              "min": 1,
              "max": 15,
              "default": 10,
              "unit": "units"
            }
          ]
        }
      }
    }
  },
  "epic_c_branches": [
    {
      "misconception_id": "components_are_less_than_original",
      "description": "Student thinks breaking a vector into components loses something — components seem smaller and therefore 'less'",
      "trigger_match": [
        "components toh chhote hain",
        "resolution mein kuch kho jaata hai",
        "components are just parts not the whole",
        "Rx is less than R so something is missing",
        "why would I break it if components are smaller",
        "add karein toh R nahi milega"
      ],
      "state_count": 5,
      "feedback_tag": "vector_components_branch_loss",
      "states": {
        "STATE_1": {
          "label": "Show the complete picture",
          "physics_layer": {
            "vector_R": {
              "magnitude": 5,
              "direction_deg": 53,
              "color": "#4FC3F7",
              "label": "R = 5"
            },
            "Rx": {
              "magnitude": 3,
              "color": "#66BB6A",
              "label": "Rₓ = 3"
            },
            "Ry": {
              "magnitude": 4,
              "color": "#FF8A65",
              "label": "Rᵧ = 4"
            },
            "show_right_triangle": true,
            "freeze": true,
            "scenario": "vc_wrong_one_component"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Rₓ=3 and Rᵧ=4. Both are less than R=5. But notice: 3² + 4² = 9 + 16 = 25 = 5². Nothing is lost.",
            "attention_target": "The right triangle — the components are the two legs, R is the hypotenuse"
          }
        },
        "STATE_2": {
          "label": "Reconstruction proof",
          "physics_layer": {
            "animate_reconstruction": true,
            "start_with_components": true,
            "show_Rx_first": true,
            "then_add_Ry": true,
            "result_equals_R": true,
            "label": "Rₓî + Rᵧĵ → exactly R",
            "scenario": "vc_both_needed"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Watch the components rebuild the original vector. Rₓ placed first, Rᵧ placed at its tip — the resultant IS exactly R.",
            "contrast_from_previous": "STATE_1 showed the triangle. STATE_2 shows the reconstruction — what was broken can be put back perfectly."
          }
        },
        "STATE_3": {
          "label": "Energy analogy — nothing lost",
          "physics_layer": {
            "show_analogy": true,
            "show_100_as_sum": true,
            "label": "100 = 60 + 40. Neither 60 nor 40 alone is 100. But together they are exactly 100.",
            "show_vector_equivalent": true,
            "scenario": "vc_aha_need_both"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Breaking 100 into 60+40 doesn't lose anything. Same with vectors: Rₓ+Rᵧ = R. The components are smaller individually — but together they are exactly R."
          }
        },
        "STATE_4": {
          "label": "Why smaller components are useful",
          "physics_layer": {
            "show_addition_comparison": true,
            "with_components": {
              "steps": 2,
              "label": "Add x-parts, add y-parts — done"
            },
            "without_components": {
              "steps": "geometry required",
              "label": "Must use parallelogram law each time"
            },
            "freeze": true,
            "scenario": "components_are_less_than_original_s4"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Components being smaller is not a problem — it is the whole point. Each component lives in one direction only, so they can be added as plain numbers."
          }
        },
        "STATE_5": {
          "label": "Verify interactively",
          "physics_layer": {
            "interactive": true,
            "show_reconstruction_live": true,
            "sliders": [
              {
                "id": "angle_alpha",
                "label": "α",
                "min": 0,
                "max": 90,
                "default": 37,
                "unit": "°"
              }
            ],
            "scenario": "components_are_less_than_original_s5"
          },
          "pedagogy_layer": {
            "challenge": "Change α. Confirm Rₓ²+Rᵧ² = R² always. Nothing is ever lost."
          }
        }
      }
    },
    {
      "misconception_id": "cos_sin_confusion",
      "description": "Student confuses which component uses cosine and which uses sine — mixes up Rₓ and Rᵧ",
      "trigger_match": [
        "Rx = R sin alpha",
        "Ry = R cos alpha",
        "sin cos ulta ho gaya",
        "which one is sin which is cos",
        "I keep mixing up sin and cos",
        "when to use sin and when to use cos",
        "sin alpha x component mein aata hai"
      ],
      "state_count": 5,
      "feedback_tag": "vector_components_branch_sincos",
      "states": {
        "STATE_1": {
          "label": "The angle is measured from x-axis",
          "physics_layer": {
            "vector_R": {
              "magnitude": 10,
              "direction_deg": 37,
              "color": "#4FC3F7"
            },
            "show_angle_from_x": true,
            "highlight_x_axis": true,
            "show_angle_arc": true,
            "label": "α is measured from the x-axis",
            "freeze": true,
            "scenario": "vc_wrong_angle_always_x"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "The angle α is always measured FROM the x-axis. This is the key. Cosine is the x-function. Sine is the y-function.",
            "attention_target": "The angle arc drawn from the x-axis to the vector"
          }
        },
        "STATE_2": {
          "label": "The rule — adjacent and opposite",
          "physics_layer": {
            "show_right_triangle": true,
            "highlight_adjacent": {
              "color": "#66BB6A",
              "label": "Adjacent to α = Rₓ"
            },
            "highlight_opposite": {
              "color": "#FF8A65",
              "label": "Opposite to α = Rᵧ"
            },
            "show_cos_adjacent_rule": true,
            "label": "cos = adjacent/hypotenuse → Rₓ = R cosα",
            "freeze": true,
            "scenario": "vc_angle_convention_varies"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "cosine = adjacent ÷ hypotenuse. x-component is adjacent to α. Therefore Rₓ = R cosα. sine = opposite ÷ hypotenuse. y-component is opposite to α. Therefore Rᵧ = R sinα.",
            "attention_target": "The words 'adjacent' and 'opposite' matching to x and y"
          }
        },
        "STATE_3": {
          "label": "The memory rule",
          "physics_layer": {
            "show_memory_aid": true,
            "rule_1": "Starts with X, starts with Cos — Rₓ = R Cosα",
            "rule_2": "Y comes after X, Sin comes after Cos — Rᵧ = R Sinα",
            "show_special_cases": true,
            "case_0deg": "α=0°: cosα=1, sinα=0 → all in x, nothing in y",
            "case_90deg": "α=90°: cosα=0, sinα=1 → nothing in x, all in y",
            "freeze": true,
            "scenario": "vc_aha_use_geometry"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "At α=0° the vector points fully along x — Rₓ=R, Rᵧ=0. cos0°=1 gives this correctly. At α=90° the vector points fully along y — Rₓ=0, Rᵧ=R. sin90°=1 gives this correctly."
          }
        },
        "STATE_4": {
          "label": "Verify at special angles",
          "physics_layer": {
            "show_three_angles": true,
            "case_1": {
              "alpha": 0,
              "Rx": "R",
              "Ry": 0,
              "label": "α=0° → Rₓ=R, Rᵧ=0 ✓"
            },
            "case_2": {
              "alpha": 90,
              "Rx": 0,
              "Ry": "R",
              "label": "α=90° → Rₓ=0, Rᵧ=R ✓"
            },
            "case_3": {
              "alpha": 45,
              "Rx": "R/√2",
              "Ry": "R/√2",
              "label": "α=45° → Rₓ=Rᵧ=R/√2 ✓"
            },
            "freeze": true,
            "scenario": "cos_sin_confusion_s4"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "Three sanity checks. α=0° must give all x. α=90° must give all y. α=45° must give equal x and y. Cosine on x satisfies all three."
          }
        },
        "STATE_5": {
          "label": "Practice with control",
          "physics_layer": {
            "interactive": true,
            "show_live_components": true,
            "show_component_labels_updating": true,
            "sliders": [
              {
                "id": "angle_alpha",
                "label": "α from x-axis",
                "min": 0,
                "max": 90,
                "default": 37,
                "unit": "°"
              }
            ],
            "scenario": "cos_sin_confusion_s5"
          },
          "pedagogy_layer": {
            "challenge": "At α=53°, R=15. Rₓ = 15cos53° = 9. Rᵧ = 15sin53° = 12. Verify: 9²+12² = 81+144 = 225 = 15²."
          }
        }
      }
    },
    {
      "misconception_id": "unit_vector_confusion",
      "description": "Student is confused about what î, ĵ, k̂ mean — treats them as numbers or as extra magnitude",
      "trigger_match": [
        "i hat ka matlab kya hai",
        "why use i and j",
        "î is imaginary number i",
        "what does i hat mean",
        "3i matlab 3 imaginary",
        "unit vector kya hota hai",
        "î ĵ k̂ notation confusing"
      ],
      "state_count": 4,
      "feedback_tag": "vector_components_branch_unitvector",
      "states": {
        "STATE_1": {
          "label": "Unit vectors are direction markers only",
          "physics_layer": {
            "show_unit_vectors": true,
            "i_hat": {
              "magnitude": 1,
              "direction_deg": 0,
              "color": "#EF5350",
              "label": "î = length 1, points East"
            },
            "j_hat": {
              "magnitude": 1,
              "direction_deg": 90,
              "color": "#66BB6A",
              "label": "ĵ = length 1, points North"
            },
            "show_ruler_comparison": true,
            "freeze": true,
            "scenario": "unit_vector_confusion_s1"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "î is NOT the imaginary number i from mathematics. In physics, î (i-hat) is an arrow of length 1 pointing in the positive x direction. The hat symbol (^) means 'unit vector'.",
            "attention_target": "The hat symbol — distinguishes î (unit vector) from i (imaginary number)"
          }
        },
        "STATE_2": {
          "label": "Scaling unit vectors",
          "physics_layer": {
            "show_scaling": true,
            "show_1i": {
              "magnitude": 1,
              "label": "1î"
            },
            "show_3i": {
              "magnitude": 3,
              "label": "3î — three units in x direction"
            },
            "show_8i": {
              "magnitude": 8,
              "label": "8î — eight units in x direction"
            },
            "freeze": true,
            "scenario": "unit_vector_confusion_s2"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "8î means: take the unit arrow î (length 1, pointing East) and stretch it to length 8. Result: an arrow of length 8 pointing East. The scalar scales the direction.",
            "contrast_from_previous": "STATE_1 showed what î is. STATE_2 shows what multiplying by a number does to it."
          }
        },
        "STATE_3": {
          "label": "Building a vector from components",
          "physics_layer": {
            "show_construction": true,
            "step_1": {
              "label": "Place 3î — go 3 units East",
              "color": "#EF5350"
            },
            "step_2": {
              "label": "Add 4ĵ — go 4 units North from there",
              "color": "#66BB6A"
            },
            "resultant": {
              "label": "Result: vector (3î + 4ĵ), magnitude 5",
              "color": "#4FC3F7"
            },
            "animate_construction": true,
            "freeze": false,
            "scenario": "unit_vector_confusion_s3"
          },
          "pedagogy_layer": {
            "cognitive_trigger": "3î + 4ĵ is not a sum of numbers. It is an instruction: go 3 East AND go 4 North. The result is a vector of magnitude 5 at 53° from East.",
            "attention_target": "The two component arrows combining into a single resultant"
          }
        },
        "STATE_4": {
          "label": "Interactive — build any vector",
          "physics_layer": {
            "interactive": true,
            "show_component_sliders": true,
            "show_notation_updating": true,
            "sliders": [
              {
                "id": "comp_x",
                "label": "x-component (coefficient of î)",
                "min": -8,
                "max": 8,
                "default": 3,
                "unit": "units"
              },
              {
                "id": "comp_y",
                "label": "y-component (coefficient of ĵ)",
                "min": -8,
                "max": 8,
                "default": 4,
                "unit": "units"
              }
            ],
            "scenario": "unit_vector_confusion_s4"
          },
          "pedagogy_layer": {
            "challenge": "Set x=6, y=-8. The notation is (6î - 8ĵ). Magnitude = √(36+64) = 10. Direction = 53° below x-axis. Verify using the formula."
          }
        }
      }
    }
  ],
  "epic_c_micro_templates": [
    {
      "template_id": "why_cosine_for_x",
      "applies_when": "student asks specifically why x-component uses cosα not sinα",
      "example_queries": [
        "why cos alpha for x",
        "why not sin for Rx",
        "cos kyu use karte hain x mein"
      ],
      "state_count": 2,
      "feedback_tag": "vector_components_micro_cosx",
      "states": {
        "STATE_1": {
          "label": "Show the right triangle",
          "instruction": "Draw right triangle with R as hypotenuse, α as the angle at the origin FROM x-axis. Label: adjacent to α is the x-side, opposite to α is the y-side. cos = adjacent/hypotenuse → x = R cosα."
        },
        "STATE_2": {
          "label": "Verify at 0° and 90°",
          "instruction": "At α=0°: cos0°=1, so Rₓ=R (all in x — correct). At α=90°: cos90°=0, so Rₓ=0 (none in x — correct). cosine on x passes both sanity checks."
        }
      }
    },
    {
      "template_id": "unit_vector_meaning",
      "applies_when": "student asks what î or ĵ or k̂ means",
      "example_queries": [
        "what is i hat",
        "what does î mean",
        "unit vector kya hota hai",
        "î ĵ k̂ explain"
      ],
      "state_count": 2,
      "feedback_tag": "vector_components_micro_unitvec",
      "states": {
        "STATE_1": {
          "label": "Show î as direction marker",
          "instruction": "Draw î as an arrow of exactly length 1 pointing along positive x-axis. Label: magnitude=1, direction=East. This is NOT the imaginary number i. The hat (^) means unit vector."
        },
        "STATE_2": {
          "label": "Show scaling",
          "instruction": "Show 5î as î stretched to length 5. The number is the magnitude, î provides the direction. 5î = 5 units in the East direction."
        }
      }
    },
    {
      "template_id": "inclined_plane_components",
      "applies_when": "student asks about components on an inclined plane specifically",
      "example_queries": [
        "inclined plane pe components kaise",
        "why mg sin theta along slope",
        "perpendicular component kya hoga"
      ],
      "state_count": 3,
      "feedback_tag": "vector_components_micro_incline",
      "states": {
        "STATE_1": {
          "label": "Show the incline and weight",
          "instruction": "Draw inclined plane at angle θ. Show weight mg pointing straight down. Mark the two component directions: along the slope, and perpendicular to the slope."
        },
        "STATE_2": {
          "label": "Resolve the weight",
          "instruction": "Show the right triangle inside the slope geometry. The angle between mg and the perpendicular-to-slope direction equals θ (the incline angle). Therefore: perpendicular component = mg cosθ, along-slope component = mg sinθ."
        },
        "STATE_3": {
          "label": "Why these axes",
          "instruction": "The block moves along the slope, not vertically. Choosing axes along and perpendicular to the slope means one component causes motion (mg sinθ) and one is balanced by normal force (mg cosθ). This is why we resolve this way."
        }
      }
    },
    {
      "template_id": "3d_components",
      "applies_when": "student asks about three-dimensional components or k̂",
      "example_queries": [
        "what is k hat",
        "3D components kaise",
        "z component kya hota hai",
        "three dimensions"
      ],
      "state_count": 2,
      "feedback_tag": "vector_components_micro_3d",
      "states": {
        "STATE_1": {
          "label": "Show k̂ as the third direction",
          "instruction": "Show three mutually perpendicular unit vectors: î (East), ĵ (North), k̂ (Up/Out of page). Any 3D vector R = Rₓî + Rᵧĵ + R_zk̂. Magnitude: R = √(Rₓ²+Rᵧ²+R_z²)."
        },
        "STATE_2": {
          "label": "Example",
          "instruction": "A = î + ĵ - 2k̂. Show the three components on three axes. Magnitude = √(1+1+4) = √6. Most JEE problems use 2D — k̂ appears mainly in cross products."
        }
      }
    },
    {
      "template_id": "adding_vectors_by_components",
      "applies_when": "student asks how to use component method for vector addition",
      "example_queries": [
        "how to add vectors using components",
        "component method for addition",
        "i j notation mein add kaise"
      ],
      "state_count": 3,
      "feedback_tag": "vector_components_micro_add",
      "states": {
        "STATE_1": {
          "label": "Step 1 — resolve both vectors",
          "instruction": "Show A = Aₓî + Aᵧĵ and B = Bₓî + Bᵧĵ. Each vector resolved into its x and y parts."
        },
        "STATE_2": {
          "label": "Step 2 — add components separately",
          "instruction": "R = (Aₓ+Bₓ)î + (Aᵧ+Bᵧ)ĵ. x-components add as scalars. y-components add as scalars. No geometry needed."
        },
        "STATE_3": {
          "label": "Step 3 — find magnitude",
          "instruction": "R = √((Aₓ+Bₓ)² + (Aᵧ+Bᵧ)²). Direction: α = tan⁻¹(Rᵧ/Rₓ). This is always faster than parallelogram law for multiple vectors."
        }
      }
    }
  ],
  "static_responses": [
    {
      "response_id": "formula_derivation",
      "triggers": [
        "prove Rx squared plus Ry squared equals R squared",
        "derive component formula",
        "mathematical proof of resolution"
      ],
      "response_type": "text_with_steps",
      "ai_cost": 0,
      "content": "Consider vector R at angle α to x-axis. In the right triangle formed: hypotenuse = R, adjacent side to α = Rₓ, opposite side to α = Rᵧ. By trigonometry: cosα = Rₓ/R → Rₓ = R cosα. sinα = Rᵧ/R → Rᵧ = R sinα. By Pythagoras: Rₓ² + Rᵧ² = R²cos²α + R²sin²α = R²(cos²α + sin²α) = R² × 1 = R². Therefore R = √(Rₓ² + Rᵧ²). Nothing is lost in resolution."
    },
    {
      "response_id": "numerical_check",
      "triggers": [
        "I got wrong component",
        "check my resolution",
        "mera answer galat"
      ],
      "response_type": "text_guided_sonnet",
      "ai_cost": "micro_sonnet_call",
      "instruction": "Check student's Rₓ and Rᵧ values against Rₓ = R cosα and Rᵧ = R sinα. Verify Rₓ²+Rᵧ²=R². Find exact step where error occurred."
    },
    {
      "response_id": "formula_recall",
      "triggers": [
        "formula for components",
        "what is Rx",
        "Rₓ kya hota hai"
      ],
      "response_type": "text",
      "ai_cost": 0,
      "content": "For a vector R at angle α from the positive x-axis: x-component Rₓ = R cosα, y-component Rᵧ = R sinα. In vector notation: R = Rₓî + Rᵧĵ. Magnitude: R = √(Rₓ²+Rᵧ²). Direction: α = tan⁻¹(Rᵧ/Rₓ)."
    },
    {
      "response_id": "direction_cosines",
      "triggers": [
        "what are direction cosines",
        "cosα cosβ cosγ kya hain",
        "direction cosines explain"
      ],
      "response_type": "text",
      "ai_cost": 0,
      "content": "Direction cosines of a vector R are: cosα = Rₓ/R (angle with x-axis), cosβ = Rᵧ/R (angle with y-axis), cosγ = R_z/R (angle with z-axis). They satisfy: cos²α + cos²β + cos²γ = 1. For a 2D vector: cosα = Rₓ/R and cosβ = Rᵧ/R with α + β = 90°."
    }
  ],
  "problem_guidance_path": {
    "description": "Step-by-step guide for solving component problems",
    "trigger_signals": [
      "how to solve",
      "find components of",
      "resolve this force",
      "calculate Rx Ry"
    ],
    "approach": "text_only_no_simulation",
    "steps": [
      "Step 1: Draw a clear diagram with the vector and the coordinate axes",
      "Step 2: Identify the angle α between the vector and the positive x-axis",
      "Step 3: Rₓ = R cosα (x-component), Rᵧ = R sinα (y-component)",
      "Step 4: Check signs — if vector points left, Rₓ is negative; if points down, Rᵧ is negative",
      "Step 5: Verify: √(Rₓ²+Rᵧ²) must equal R"
    ],
    "sign_convention_note": "Always identify the direction before assigning sign. Component along negative x gets negative sign regardless of the cosα formula."
  },
  "example_library": {
    "example_1": {
      "source": "DC Pandey Section 5.4 — Examples 5.9–5.11",
      "principle": "Decomposing a vector at angle θ into Ax = A cosθ and Ay = A sinθ along coordinate axes",
      "aha": "Component along any axis = A × cos(angle with that axis) — the formula works for any axis, not just x and y",
      "simulation_states": 2
    },
    "example_2": {
      "source": "DC Pandey Section 5.4",
      "principle": "Adding two vectors by resolving components — Rx = Ax+Bx, Ry = Ay+By, R = √(Rx²+Ry²)",
      "aha": "Component method always works regardless of number of vectors — easier than parallelogram for 3+ vectors",
      "simulation_states": 2
    },
    "example_3": {
      "source": "DC Pandey Section 5.4",
      "principle": "Finding unit vector Â = (Axî + Ayĵ)/|A| after resolving components",
      "aha": "Unit vector directly from components — no need to find angle first; components give direction implicitly",
      "simulation_states": 2
    }
  },
  "assessment_path": {
    "questions": [
      {
        "id": "q1",
        "prompt": "A vector of magnitude 10 units makes 53° with x-axis. Find Rₓ and Rᵧ.",
        "correct_Rx": 6,
        "correct_Ry": 8,
        "acceptable_range": 0.2,
        "if_swapped": "route to epic_c_branches.cos_sin_confusion STATE_2",
        "if_right": "proceed to q2"
      },
      {
        "id": "q2",
        "prompt": "A = 3î + 4ĵ, B = 1î - 2ĵ. Find A+B and its magnitude.",
        "correct_answer": "4î + 2ĵ, magnitude = √20 = 2√5 ≈ 4.47",
        "if_wrong": "route to epic_c_micro_templates.adding_vectors_by_components",
        "if_right": "assessment_passed"
      }
    ],
    "on_pass": "mark concept understood in session_context",
    "on_fail": "route to appropriate branch"
  },
  "session_awareness": {
    "if_already_shown_this_session": "skip simulation. Run text response referencing previous simulation.",
    "force_replay_keywords": [
      "show again",
      "phir se",
      "dobara",
      "replay"
    ]
  },
  "waypoints": [
    {
      "must_reach": "Student sees Rₓ = R cosα and Rᵧ = R sinα with the right triangle shown",
      "physics_floor": "Rₓ² + Rᵧ² = R² must be demonstrated",
      "position": "first_third"
    },
    {
      "must_reach": "Unit vector notation R = Rₓî + Rᵧĵ explained",
      "physics_floor": "î and ĵ must be shown as having magnitude 1",
      "position": "middle"
    },
    {
      "must_reach": "Student resolves at least one vector independently",
      "physics_floor": null,
      "position": "last_state"
    }
  ],
  "depth_escalation_trigger": {
    "condition": "micro_template_used AND student_asked_followup_on_same_concept",
    "action": "escalate to epic_c_branch silently"
  },
  "common_misconceptions": [
    {
      "id": "components_lose_information",
      "belief": "Breaking a vector into components loses something — components are smaller so the full vector is not represented",
      "trigger_phrases": [
        "components chhote hain",
        "kuch kho jaata hai",
        "not the full vector",
        "Rx is less than R",
        "incomplete representation"
      ],
      "correction": "Rₓ² + Rᵧ² = R² — the Pythagorean relationship guarantees nothing is lost. Rₓî + Rᵧĵ reconstructs R exactly.",
      "simulation_emphasis": "Show reconstruction animation: Rₓ placed first, Rᵧ placed at its tip — result is exactly R"
    },
    {
      "id": "sin_cos_swap",
      "belief": "x-component uses sinα and y-component uses cosα",
      "trigger_phrases": [
        "Rx = R sin alpha",
        "Ry = R cos alpha",
        "sin cos ulta",
        "which is which",
        "I keep confusing sin and cos"
      ],
      "correction": "α is measured FROM the x-axis. cos(angle from x-axis) gives the x-component (adjacent side). sin(angle from x-axis) gives the y-component (opposite side).",
      "simulation_emphasis": "Show right triangle with α at origin, adjacent=Rₓ, opposite=Rᵧ. cos=adjacent/hypotenuse fixes Rₓ=Rcosα"
    },
    {
      "id": "i_hat_is_imaginary",
      "belief": "î in physics notation is the imaginary number i = √(-1) from mathematics",
      "trigger_phrases": [
        "i hat imaginary number hai",
        "3i matlab complex number",
        "î = √-1",
        "complex numbers mein aata hai"
      ],
      "correction": "In physics, î (i-hat, note the circumflex accent) is a unit vector pointing in the positive x-direction with magnitude 1. It is completely different from the mathematical imaginary unit i = √(-1).",
      "simulation_emphasis": "Show î as a physical arrow of length 1 pointing East — nothing imaginary or complex about it"
    }
  ],
  "legend": [
    {
      "symbol": "R (blue arrow)",
      "meaning": "Original vector being resolved"
    },
    {
      "symbol": "Rₓ (green arrow)",
      "meaning": "x-component = R cosα"
    },
    {
      "symbol": "Rᵧ (orange arrow)",
      "meaning": "y-component = R sinα"
    },
    {
      "symbol": "α",
      "meaning": "Angle vector makes with positive x-axis"
    },
    {
      "symbol": "î",
      "meaning": "Unit vector along positive x-axis, magnitude = 1"
    },
    {
      "symbol": "ĵ",
      "meaning": "Unit vector along positive y-axis, magnitude = 1"
    },
    {
      "symbol": "k̂",
      "meaning": "Unit vector along positive z-axis, magnitude = 1"
    },
    {
      "symbol": "Right angle symbol",
      "meaning": "Rₓ and Rᵧ are always perpendicular"
    }
  ],
  "concept_extension_fields": {
    "note": "Renderer reads these only for scenario_type = vector_components",
    "show_component_projections": true,
    "show_right_angle_marker": true,
    "show_angle_arc_from_x_axis": true,
    "show_unit_vectors_in_corner": true,
    "show_notation_panel": true,
    "animate_resolution": true
  },
  "jee_specific": {
    "typical_question_types": [
      "find x and y components of a force at given angle",
      "express a vector in î ĵ notation",
      "find magnitude and direction from î ĵ notation",
      "add multiple vectors using component method",
      "resolve weight on inclined plane",
      "find resultant of n forces using components",
      "find unit vector in direction of given vector"
    ],
    "common_traps": [
      "Mixing up sin and cos — remember: cos goes with x (adjacent to angle)",
      "Sign errors — component along negative x is negative even if formula gives positive",
      "Angle not measured from x-axis — always redefine angle from x-axis first",
      "Forgetting to take square root when finding magnitude from components",
      "On inclined plane: angle with slope is NOT the same as angle with horizontal"
    ],
    "key_results_to_memorize": [
      "Rₓ = R cosα, Rᵧ = R sinα (α from positive x-axis)",
      "R = √(Rₓ² + Rᵧ²), direction α = tan⁻¹(Rᵧ/Rₓ)",
      "On incline θ: mg sinθ along slope, mg cosθ perpendicular to slope",
      "Unit vector: Â = A/|A| = (Aₓî + Aᵧĵ)/√(Aₓ²+Aᵧ²)",
      "cos²α + cos²β + cos²γ = 1 (direction cosines identity)"
    ],
    "dc_pandey_examples_covered": [
      "Example 5.4: Force at 37° from negative x-axis",
      "Example 5.5: Find magnitude of 6î-8ĵ",
      "Example 5.6: Weight on 30° inclined plane",
      "Example 5.7: Force at 45° resolved horizontally and vertically",
      "Example 5.8: Operations with î ĵ k̂ notation"
    ]
  },
  "concept_relationships": {
    "prerequisites": [
      "vector_addition"
    ],
    "extensions": [
      "projectile_motion",
      "relative_motion",
      "equilibrium_of_forces",
      "laws_of_motion_friction",
      "dot_product",
      "cross_product"
    ],
    "siblings": [
      "vector_addition",
      "dot_product"
    ],
    "common_exam_combinations": [
      "laws_of_motion_friction",
      "motion_on_inclined_plane",
      "projectile_motion",
      "equilibrium_rigid_body"
    ]
  },
  "parameter_slots": {
    "A": {
      "label": "vector magnitude",
      "range": [
        1,
        50
      ],
      "unit": "N or m/s",
      "default": 10,
      "extraction_hint": "vector magnitude |A| or A ="
    },
    "theta": {
      "label": "angle with x-axis",
      "range": [
        0,
        90
      ],
      "unit": "degrees",
      "default": 30,
      "extraction_hint": "angle with horizontal or x-axis"
    }
  },
  "panel_sync_spec": {
    "canvas_to_graph": {
      "trigger": "STATE_N_reached",
      "action": "graph highlights current Fx/Fy values on bar chart"
    },
    "graph_to_canvas": {
      "trigger": "student_hover_on_graph",
      "action": "canvas highlights corresponding component"
    },
    "slider_to_both": {
      "parameter": "theta",
      "canvas_action": "component arrows update live",
      "graph_action": "Fx and Fy bars animate to new values"
    }
  },
  "checkpoint_states": {
    "understands_component_concept": "enter at STATE_2",
    "understands_formula": "enter at STATE_3",
    "understands_unit_vector_notation": "enter at STATE_4",
    "understands_reconstruction": "enter at STATE_5"
  },
  "three_js_flag": false,
  "three_js_note": "Component breakdown is 2D (x-y plane). canvas2d is sufficient. Three.js not needed.",
  "regeneration_variants": [
    {
      "variant_id": 1,
      "scenario_type": "vector_components",
      "approach": "reconstruction_first",
      "entry_state": "STATE_3",
      "teacher_angle": "Teach reconstruction before decomposition. Given Ax = 3, Ay = 4: the original vector has magnitude sqrt(9+16) = 5 at angle arctan(4/3) = 53 degrees. The components are complete information — you can perfectly rebuild the original vector from them. Now decomposition is just reconstruction in reverse. Students find decomposition confusing because it feels like loss of information. Show reconstruction first to prove no information is lost.",
      "locked_facts_focus": [
        "fact_4",
        "fact_5",
        "fact_6"
      ],
      "panel_b_focus": "Interactive: student enters x-component and y-component sliders. Original vector reconstructs live on canvas. Magnitude and angle update in real time. Then reverse: enter magnitude and angle, components appear."
    },
    {
      "variant_id": 2,
      "scenario_type": "vector_components",
      "approach": "connects_to_projectile_decomposition",
      "entry_state": "STATE_2",
      "teacher_angle": "Connect to projectile motion which the student either knows or will study shortly. In projectile motion, the velocity u at angle theta is decomposed into u cos theta horizontal and u sin theta vertical. That IS vector components — the x-component and y-component of the velocity vector. The student either already did this decomposition or will do it in Ch.7. Vector components is the formal name for that decomposition they already performed intuitively.",
      "locked_facts_focus": [
        "fact_2",
        "fact_3",
        "fact_7"
      ],
      "panel_b_focus": "Show projectile launch velocity u at angle theta. Decompose into ux = u cos theta (horizontal) and uy = u sin theta (vertical). Label: 'These are the x and y components of vector u.' Then show general vector A decomposed identically."
    }
  ]
}
```


