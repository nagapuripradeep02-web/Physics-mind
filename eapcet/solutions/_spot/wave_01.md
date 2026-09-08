# Spot check — wave 1

Tick ONE box per item: `[x] pass` or `[x] fail`, and write a NOTE on every fail. Then `python scripts/eapcet/spot_check.py --ingest --wave 1`.

pass = a student who copies this solution into the exam gets the mark, and every line and every mistake entry is true for this question. Anything less is a fail.

## 1. tg_eapcet_2023_20230512_an_q083  sha=a182bf7e

**TG EAPCET 2023, 12 May, afternoon, Q83** — Motion in a Straight Line

The ratio of the displacements of a freely falling body during first, second and third seconds of its motion is

      (1) 1:1:1
**KEY** (2) 1:3:5
      (3) 1:2:3
      (4) 1:4:9

**Approach:** For free fall from rest, displacement in the nth second is proportional to (2n − 1), giving the first three seconds in ratio 1:3:5.

1. Write the distance covered in the nth second of free fall starting from rest.
       Sₙ = g/2 × (2n − 1)
2. Evaluate this for n = 1, 2 and 3, using g = 10 m s⁻².
       S₁ = 5 m, S₂ = 15 m, S₃ = 25 m
3. Write the ratio of these three distances in lowest terms.
       S₁ : S₂ : S₃ = 5 : 15 : 25 = 1 : 3 : 5

**Final:** option 2 — 1:3:5
- mistake (option 1): Assuming a falling body covers equal distances each second, which would only be true if it moved at constant velocity, not while accelerating.
- mistake (option 3): Assuming the distances grow in a simple linear count 1, 2, 3 instead of computing them from the odd-number rule for the nth second of free fall.
- mistake (option 4): Using the ratio of the squares of the times, 1:4:9, which gives the total distance fallen by each second, not the distance fallen during each second.

audit: verdict **ok**, auditor picked option 2 (W01-U-mixed-R1)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 2. tg_eapcet_2025_20250503_fn_q116  sha=b2840239

**TG EAPCET 2025, 3 May, morning, Q116** — Motion in a Straight Line

A person wearing a parachute jumps off a plane from a height of 2 km from the ground and falls freely for 20 m before his parachute opens. After his parachute opens if he continues to move uniformly with the velocity attained due to his freefall, the total time taken by the person to reach the ground is (Acceleration due to gravity = 10 ms⁻²)

      (1) 99 s
**KEY** (2) 101 s
      (3) 100 s
      (4) 102 s

**Approach:** Split the fall into a free-fall stage of 20 m and a constant-velocity stage for the remaining height, and add the two times.

1. Find the speed gained during the 20 m of free fall.
       v = √(2×10×20) = 20 ms⁻¹
2. Find the time taken for this free-fall stage.
       t₁ = v/g = 20/10 = 2 s
3. Find the remaining height to be covered at this constant speed.
       2000 − 20 = 1980 m
4. Find the time for the constant-velocity stage and add it to the free-fall time.
       t₂ = 1980/20 = 99 s; total = 2 + 99 = 101 s

**Final:** option 2 — 101 s
- mistake (option 1): Computing only the time for the constant-velocity stage, 1980/20 = 99 s, and forgetting to add the 2 s spent in free fall before the parachute opened.
- mistake (option 3): Dividing the entire 2000 m by the constant velocity of 20 ms⁻¹, treating the whole fall as if it happened at that one speed, which gives 100 s.
- mistake (option 4): Adding the 2 s free-fall time to the time for the full 2000 m at the constant velocity, 2000/20 = 100 s, instead of subtracting the 20 m already covered, giving 102 s.

audit: verdict **ok**, auditor picked option 2 (W01-U-p1-02)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 3. tg_eapcet_2021_20210804_an_q085  sha=a38d041c

**TG EAPCET 2021, 4 August, afternoon, Q85** — Motion in a Plane

The y-component of vector A⃗ is +3.0 m if A⃗ makes an angle of 30° counter clockwise from the positive y - axis, the magnitude of A⃗ is (assume A⃗ is in x - y plane)

**KEY** (1) 2√3 m
      (2) √11 m
      (3) √15 m
      (4) √21 m

**Approach:** The y-component of a vector equals its magnitude times the cosine of the angle the vector makes with the y-axis.

1. Write the y-component in terms of the magnitude and the angle measured from the y-axis.
       A_y = A cos30°
2. Substitute the given y-component and solve for the magnitude.
       3.0 = A × (√3/2)
3. Evaluate the magnitude.
       A = 6/√3 = 2√3 m

**Final:** option 1 — 2√3 m
- mistake: Using sin30° instead of cos30°, treating the given 3.0 m as if it were measured from the x-axis instead of the y-axis, gives 6 m.

audit: verdict **ok**, auditor picked option 1 (W01-U-p1-03)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 4. tg_eapcet_2021_20210804_an_q086  sha=e42a4711

**TG EAPCET 2021, 4 August, afternoon, Q86** — Motion in a Plane

Find the component of vector P⃗ = 2î + 3ĵ along the direction of vector Q⃗ = î + ĵ.

      (1) 2
      (2) 2√5
**KEY** (3) 5/√2
      (4) √2/5

**Approach:** The component of one vector along another equals their dot product divided by the magnitude of the second vector.

1. Compute the dot product of P and Q.
       P⃗·Q⃗ = (2)(1) + (3)(1) = 5
2. Compute the magnitude of Q.
       |Q⃗| = √(1²+1²) = √2
3. Divide the dot product by the magnitude of Q to get the component.
       component = 5/√2

**Final:** option 3 — 5/√2
- mistake (option 1): Taking only the x-components, 2×1 = 2, and ignoring the y-components and the division by |Q⃗|, gives 2.
- mistake (option 4): Inverting the formula and computing |Q⃗|/(P⃗·Q⃗) instead of (P⃗·Q⃗)/|Q⃗| gives √2/5.

audit: verdict **ok**, auditor picked option 3 (W01-U-p1-03)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 5. tg_eapcet_2021_20210805_an_q090  sha=e143952a

**TG EAPCET 2021, 5 August, afternoon, Q90** — Work Power Energy

Ball P of mass m moving with velocity 'v' collides with another ball Q of mass 2m, at rest. If v_P and v_Q are the final velocities of P and Q respectively, after collision, then: (Assume the coefficient of restitution is 1/3)

**KEY** (1) v_Q/v_P = 4
      (2) v_P/v_Q = 4
      (3) v_Q/v_P = 2
      (4) v_P/v_Q = 2

**Approach:** Momentum conservation and the restitution equation together fix both final velocities, giving the ratio that is asked for.

1. Write momentum conservation for the two balls.
       m·v = m·v_P + 2m·v_Q  →  v = v_P + 2v_Q
2. Write the restitution equation using the given coefficient.
       e = (v_Q − v_P)/v  →  v_Q − v_P = v/3
       why: The coefficient of restitution compares the separation speed after impact to the approach speed before impact.
3. Solve the two equations together for the final velocities.
       v_P = v/9,  v_Q = 4v/9
4. Divide to get the ratio asked for.
       v_Q/v_P = (4v/9)/(v/9) = 4

**Final:** option 1 — v_Q/v_P = 4
- mistake (option 2): Writing the ratio the other way round, v_P/v_Q instead of v_Q/v_P, attaches the 4 to the wrong ball.
- mistake (option 3): Assuming the collision is perfectly elastic instead of using the given coefficient of restitution 1/3 gives v_Q/v_P = 2.

audit: verdict **ok**, auditor picked option 1 (W01-U-p1-05)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 6. tg_eapcet_2022_20220718_fn_q088  sha=bb094b8f

**TG EAPCET 2022, 18 July, morning, Q88** — Work Power Energy

The potential energy of an object is U(x) = (5x² − 4x³) J, where x is the position in meter. The position at which the force becomes zero is

      (1) 1/2 m
**KEY** (2) 5/6 m
      (3) 1/3 m
      (4) 2/3 m

**Approach:** The force is the negative slope of the potential energy, so setting it to zero and solving for the nonzero position gives the answer.

1. Differentiate U(x) with respect to x.
       dU/dx = 10x − 12x²
2. Write the force and set it to zero.
       F = −dU/dx = 12x² − 10x = 0
3. Factor and solve, keeping the nonzero root.
       x(12x − 10) = 0  →  x = 0 or x = 5/6 m

**Final:** option 2 — 5/6 m
- mistake: Taking x = 0, the trivial root where the object has not moved at all, instead of the nonzero position asked for.

audit: verdict **ok**, auditor picked option 2 (W01-U-p1-05)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 7. tg_eapcet_2021_20210804_an_q094  sha=7d681199

**TG EAPCET 2021, 4 August, afternoon, Q94** — Gravitation

Four identical masses of m are kept at corners of a square. If the gravitational force exerted on one of masses by the other masses is ((2√2+1)/32) Gm²/L², then the length of the side of the square is

      (1) L
      (2) 2 L
**KEY** (3) 4 L
      (4) L/2

**Approach:** The two adjacent masses give a resultant √2 times one force, the diagonal mass adds along it; equate this standard formula to the given value to find the side.

1. Write the net force on one corner mass from the two adjacent masses (each Gm²/a², resultant √2Gm²/a²) plus the diagonal mass (Gm²/2a²).
       F = √2 Gm²/a² + Gm²/(2a²) = (2√2+1)/2 × Gm²/a²
2. Set this equal to the given force expression, which uses L instead of a.
       (2√2+1)/2 × Gm²/a² = (2√2+1)/32 × Gm²/L²
3. Cancel the common factor (2√2+1) and Gm² from both sides and solve for a.
       1/a² = 1/(16L²) → a² = 16L² → a = 4L

**Final:** option 3 — 4 L
- mistake (option 1): Treating the given expression as already describing a square of side L, without solving the equation for a, leads a student to pick L directly.
- mistake (option 2): Making an algebra slip, such as reaching a² = 4L² instead of a² = 16L², gives a = 2L instead of the correct 4L.

audit: verdict **ok**, auditor picked option 3 (W01-U-p1-08)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 8. tg_eapcet_2021_20210805_fn_q094  sha=6aa6eff6

**TG EAPCET 2021, 5 August, morning, Q94** — Gravitation

Two stars of equal masses M are orbiting in a circle of radius R. Their orbital time period is proportional to

**KEY** (1) R^(3/2)
      (2) R
      (3) R²
      (4) R^(1/2)

**Approach:** The mutual gravitational force supplies the centripetal force for each star's orbit of radius R; solving for the angular speed shows how the period depends on R.

1. Write the gravitational force between the two stars, separated by 2R, and set it equal to the centripetal force needed for one star moving on a circle of radius R.
       GM²/(2R)² = Mω²R
2. Solve for the angular speed ω.
       ω² = GM/(4R³)
3. Write the period as 2π/ω, square it, and see how it depends on R.
       T = 2π/ω → T² = 16π²R³/(GM) ∝ R³ → T ∝ √(R³)

**Final:** option 1 — R^(3/2)
- mistake (option 2): Mistaking the gravitational force law as varying with 1/R instead of 1/R² changes the balance and gives T proportional to R instead of R¹·⁵.
- mistake (option 3): Misremembering the centripetal acceleration as ω²R² instead of ω²R changes the power of R obtained, giving T proportional to R² instead of R¹·⁵.

audit: verdict **ok**, auditor picked option 1 (W01-U-mixed-R1)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 9. tg_eapcet_2023_20230512_an_q093  sha=0ad71232

**TG EAPCET 2023, 12 May, afternoon, Q93** — Mechanical Properties of Fluids

If the work done in blowing a soap bubble of radius R is W, then the work done in blowing the soap bubble of radius 2R is

      (1) 6W
      (2) 12W
**KEY** (3) 4W
      (4) 2W

**Approach:** The work done in blowing a soap bubble equals its surface energy, which is proportional to the square of its radius.

1. Write the work done in blowing a soap bubble of radius R as the surface energy of its two surfaces.
       W = T × 2 × 4πR² = 8πTR²
2. Write the same expression for a bubble of radius 2R.
       W' = 8πT(2R)² = 8πT × 4R² = 4 × (8πTR²)
       why: Doubling the radius quadruples the surface area, since area grows with the square of the radius.
3. Express W' in terms of W.
       W' = 4W

**Final:** option 3 — 4W
- mistake (option 4): Treating the work as proportional to the radius itself instead of its square, giving 2W for a doubled radius.
- mistake: Assuming the work scales with the bubble's volume rather than its surface area, giving 8W for a doubled radius, a value not printed among the options.

audit: verdict **ok**, auditor picked option 3 (W01-U-p1-10)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 10. tg_eapcet_2024_20240509_an_q094  sha=d5494ab5

**TG EAPCET 2024, 9 May, afternoon, Q94** — Mechanical Properties of Fluids

Water flows through a horizontal pipe of variable cross-section at the rate of 12π litre per minute. The velocity of the water at the point where the diameter of the pipe becomes 2 cm is

      (1) 6 ms⁻¹
      (2) 8 ms⁻¹
      (3) 4 ms⁻¹
**KEY** (4) 2 ms⁻¹

**Approach:** The equation of continuity gives the water's speed at any section as the flow rate divided by the cross-sectional area there.

1. Convert the flow rate to SI units.
       Q = 12π L/min = 12π × 10⁻³ m³ / 60 s = 2×10⁻⁴π m³/s
2. Find the cross-sectional area of the pipe where its diameter is 2 cm.
       r = 2 cm / 2 = 0.01 m; A = πr² = π × 10⁻⁴ m²
3. Find the speed of the water at this section.
       v = Q/A = 2×10⁻⁴π / (π×10⁻⁴) = 2 m/s
       why: The π cancels because both the flow rate and the area were expressed with the same π factor from the pipe's circular cross-section.

**Final:** option 4 — 2 ms⁻¹
- mistake (option 2): Halving the radius again after already converting the diameter to a radius, using 0.5 cm instead of 1 cm, gives 8 ms⁻¹.

audit: verdict **ok**, auditor picked option 4 (W01-U-p1-10)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 11. tg_eapcet_2021_20210804_an_q098  sha=d9b98a41

**TG EAPCET 2021, 4 August, afternoon, Q98** — Thermal Properties of Matter

A metal ball initially at pressure of 10⁵ Pa is heated from 20°C to 127°C keeping its volume constant. The coefficient of linear expansion of metal is 10⁻⁵ °C⁻¹ and bulk modulus of metal is 2 × 10¹¹ N/m². The pressure inside the ball becomes

      (1) 2 × 10⁸ Pa
**KEY** (2) 6 × 10⁸ Pa
      (3) 1 × 10⁹ Pa
      (4) 4 × 10⁸ Pa

**Approach:** Held at constant volume while heated, the metal is prevented from expanding volumetrically; the bulk modulus converts that blocked volume strain into a pressure rise.

1. Find the volume expansion coefficient from the linear expansion coefficient.
       γ = 3α = 3 × 10⁻⁵ °C⁻¹
2. Find the rise in temperature.
       ΔT = 127 − 20 = 107 °C
3. The blocked volume strain multiplied by the bulk modulus gives the extra pressure built up.
       ΔP = KγΔT = 2×10¹¹ × 3×10⁻⁵ × 107 = 6.42×10⁸ Pa
       why: Bulk modulus is the pressure needed per unit fractional volume change, so it converts the prevented volume expansion directly into pressure.
4. Add the extra pressure to the initial pressure.
       P = 10⁵ + 6.42×10⁸ ≈ 6×10⁸ Pa
       why: The initial pressure of 10⁵ Pa is smaller than the rise by a factor of thousands, so it does not change the rounded answer.

**Final:** option 2 — 6 × 10⁸ Pa
- mistake (option 1): Using the linear expansion coefficient directly as the volume expansion coefficient, without multiplying by 3, gives 2×10⁸ Pa.
- mistake (option 4): Using 2α, the coefficient for area expansion, in place of the volume coefficient 3α gives about 4×10⁸ Pa.

audit: verdict **ok**, auditor picked option 2 (W01-U-p1-11-R1)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 12. tg_eapcet_2022_20220718_fn_q097  sha=6f48ed96

**TG EAPCET 2022, 18 July, morning, Q97** — Thermal Properties of Matter

An object cools from 100°C to 40°C in 10 minutes, when the surrounding temperature is 10°C. Then the time taken by the object to cool from 70°C to 20°C is
[Take ln 2 = 0.7, ln 3 = 1.1, ln 6 = 1.8]

      (1) 30 min
      (2) 8.5 min
      (3) 22.4 min
**KEY** (4) 16.3 min

**Approach:** Newton's law of cooling gives an exponential decay toward the surrounding temperature, so the logarithm of the temperature excess ratio is proportional to time.

1. Write the exponential cooling law with the temperature excess decaying from the surrounding temperature.
       θ(t) − θ₀ = (θᵢ − θ₀) e⁻ᵏᵗ
2. Use the first cooling case to find the rate constant k.
       40 − 10 = (100 − 10) e⁻¹⁰ᵏ, so e⁻¹⁰ᵏ = 1/3 and 10k = ln 3 = 1.1
3. Use the second cooling case with the same k to find the unknown time.
       20 − 10 = (70 − 10) e⁻ᵏᵗ, so e⁻ᵏᵗ = 1/6 and kt = ln 6 = 1.8
       why: The rate constant k depends only on the object and its surroundings, not on the starting temperature, so it carries over from the first case.
4. Solve for t using the value of k found in the first case.
       k = 1.1/10 = 0.11, t = 1.8/0.11 = 16.3 min

**Final:** option 4 — 16.3 min
- mistake: Assuming the object cools at a constant rate of 6°C per minute and scaling the 50°C drop proportionally gives about 8.3 min, ignoring that cooling slows near the surrounding temperature.

audit: verdict **ok**, auditor picked option 4 (W01-U-p1-11-R1)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 13. tg_eapcet_2022_20220718_fn_q099  sha=a593e193

**TG EAPCET 2022, 18 July, morning, Q99** — Thermodynamics

A monoatomic gas does 100 J of work when it is expanded isobarically. How much of heat is given to the gas in the process

      (1) 150 J
      (2) 200 J
**KEY** (3) 250 J
      (4) 300 J

**Approach:** At constant pressure, the heat supplied to a monatomic gas is Cp divided by R times the work it does, since the work equals nRΔT.

1. Write the work done in terms of the temperature rise.
       W = nRΔT = 100 J
2. Write the heat supplied using the molar heat capacity at constant pressure for a monatomic gas.
       Q = nCpΔT = (5/2)(nRΔT)
3. Substitute the work done for nRΔT and evaluate.
       Q = (5/2) × 100 = 250 J

**Final:** option 3 — 250 J
- mistake (option 1): Reporting only the change in internal energy, ΔU = (3/2) × 100 = 150 J, without adding the work done to it.
- mistake (option 2): Taking Cv = R instead of 3/2 R for a monatomic gas gives a change in internal energy of 100 J and a total heat of 200 J.

audit: verdict **ok**, auditor picked option 3 (W01-U-p1-12)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 14. tg_eapcet_2025_20250503_an_q097  sha=3849a877

**TG EAPCET 2025, 3 May, afternoon, Q97** — Thermodynamics

At constant pressure, equal amounts of heat are supplied to a monatomic gas and a diatomic gas separately. The ratio of the increases in internal energies of the two gases is

      (1) 1:1
      (2) 9:49
      (3) 3:7
**KEY** (4) 21:25

**Approach:** At constant pressure the fraction of heat that raises internal energy is Cv over Cp, so equal heat gives internal energy increases in the ratio of these two fractions.

1. Write Cv over Cp for the monatomic gas.
       (Cv/Cp)_mono = (3/2)/(5/2) = 3/5
2. Write Cv over Cp for the diatomic gas.
       (Cv/Cp)_dia = (5/2)/(7/2) = 5/7
3. The change in internal energy equals Cv over Cp times the heat supplied, and the heat supplied is the same for both gases, so take the ratio of the two fractions.
       dU_mono : dU_dia = 3/5 : 5/7 = 21 : 25

**Final:** option 4 — 21:25
- mistake (option 1): Assuming the same fraction of the heat raises the internal energy in both gases gives the wrong ratio, 1 : 1.
- mistake (option 3): Comparing Cv of the monatomic gas directly to Cp of the diatomic gas, instead of the ratio Cv over Cp for each gas separately, gives 3 : 7.

audit: verdict **ok**, auditor picked option 4 (W01-U-p1-12)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 15. tg_eapcet_2024_20240509_fn_q098  sha=ea2cc555

**TG EAPCET 2024, 9 May, morning, Q98** — Kinetic Theory

The total internal energy of 4 moles of a diatomic gas at a temperature of 27 °C is (Universal gas constant = 8.31 J mol⁻¹ K⁻¹)

      (1) 13.47 kJ
      (2) 4.98 kJ
**KEY** (3) 24.93 kJ
      (4) 14.96 kJ

**Approach:** The internal energy of a diatomic ideal gas is five halves of nRT, since it has five degrees of freedom at ordinary temperatures.

1. Write the internal energy formula for a diatomic gas.
       U = (5/2)nRT
       why: A diatomic molecule has three translational and two rotational degrees of freedom at room temperature, giving five in total.
2. Convert the temperature to kelvin.
       T = 27 + 273 = 300 K
3. Substitute the given values and evaluate.
       U = (5/2) × 4 × 8.31 × 300 = 24930 J = 24.93 kJ

**Final:** option 3 — 24.93 kJ
- mistake (option 4): Using the monatomic formula with three degrees of freedom instead of five, which gives 14.96 kJ instead of 24.93 kJ.
- mistake (option 2): Leaving out the number of degrees of freedom and using U = ½nRT, which gives 4.98 kJ instead of 24.93 kJ.

audit: verdict **ok**, auditor picked option 3 (W01-U-p1-13)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 16. tg_eapcet_2025_20250503_fn_q117  sha=c1aa77a2

**TG EAPCET 2025, 3 May, morning, Q117** — Kinetic Theory

At constant pressure, equal amounts of heat are supplied to a monatomic gas and a diatomic gas separately. The ratio of the increases in internal energies of the two gases is

      (1) 9 : 49
      (2) 3 : 7
**KEY** (3) 21 : 25
      (4) 1 : 1

**Approach:** At constant pressure the increase in internal energy is the heat supplied times the ratio of specific heats, Cᵥ over Cₚ, which equals 1/γ for each gas.

1. At constant pressure, the heat supplied and the rise in internal energy are related through the specific heats.
       Q = nCₚΔT, ΔU = nCᵥΔT, so ΔU = Q × (Cᵥ/Cₚ) = Q/γ
       why: Only part of the heat supplied at constant pressure raises the internal energy; the rest goes into the work done as the gas expands.
2. Write 1/γ for each gas using its known ratio of specific heats.
       monatomic: γ = 5/3, so ΔU₁ = 3Q/5; diatomic: γ = 7/5, so ΔU₂ = 5Q/7
3. Form the ratio, which does not depend on the amount of gas since the same Q is supplied to both.
       ΔU₁/ΔU₂ = (3/5)/(5/7) = 21/25

**Final:** option 3 — 21 : 25
- mistake (option 4): Assuming the heat becomes internal energy for both gases as it would at constant volume, which wrongly gives an equal increase of 1:1.

audit: verdict **ok**, auditor picked option 3 (W01-U-mixed-R1)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 17. tg_eapcet_2022_20220719_fn_q101  sha=fe27e330

**TG EAPCET 2022, 19 July, morning, Q101** — Waves

Two strings A and B produce beat of frequency Δf₁>0. The tension in string A is slightly increased and the beat frequency is found to be Δf₂>0. If the original frequency of A is f₀ and Δf₂<Δf₁, then the frequency of B is

**KEY** (1) f₀ + Δf₁
      (2) f₀ + Δf₁ − Δf₂
      (3) f₀ − Δf₁
      (4) f₀ + (Δf₁ + Δf₂)/2

**Approach:** Raising the tension in A raises its frequency, and the beat frequency falls, so A must be moving towards B's higher frequency.

1. Increasing the tension in a string raises its frequency, so the new frequency of A is slightly above f₀.
       f_A(new) > f₀
2. The beat frequency falls from Δf₁ to Δf₂, so the new frequency of A has moved closer to the frequency of B.
       Δf₂ < Δf₁
3. A frequency that is rising can only get closer to f_B if f_B lies above f₀, so the original beat gap is f_B − f₀.
       f_B − f₀ = Δf₁
       why: If f_B were below f₀, raising f_A would move it further from f_B and the beat frequency would rise instead of fall.
4. Solve for the frequency of B.
       f_B = f₀ + Δf₁

**Final:** option 1 — f₀ + Δf₁
- mistake (option 3): Assuming B has the lower frequency and writing f_B = f₀ − Δf₁, without checking that this would make the beat frequency rise, not fall, when A's tension is increased.

audit: verdict **ok**, auditor picked option 1 (W01-U-p2-01)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 18. tg_eapcet_2025_20250503_fn_q114  sha=efefc69e

**TG EAPCET 2025, 3 May, morning, Q114** — Waves

The frequency of sound heard by an observer moving towards a stationary source with certain speed is n₁ and if the observer moves away from the same source with same speed, the frequency of sound heard by the observer is n₂. If the speed of sound in air is 340 ms⁻¹ and n₁ : n₂ = 71 : 65, then speed of observer is

      (1) 27 kmph
      (2) 15 kmph
**KEY** (3) 54 kmph
      (4) 36 kmph

**Approach:** Write the approaching and receding Doppler frequencies for the same observer speed, use their given ratio to solve for the observer's speed.

1. Write the frequency heard while approaching and while receding, for a stationary source and observer speed u.
       n₁ = f(v + u)/v,  n₂ = f(v − u)/v
2. Take the ratio of the two, which cancels the source frequency f and the speed of sound v.
       n₁/n₂ = (v + u)/(v − u) = 71/65
3. Cross-multiply and collect terms in u.
       65(v + u) = 71(v − u)  ⟹  136u = 6v
4. Solve for u using v = 340 m s⁻¹.
       u = 6×340/136 = 15 m s⁻¹
5. Convert to km/h.
       u = 15 × 18/5 = 54 kmph

**Final:** option 3 — 54 kmph
- mistake (option 2): Making an arithmetic slip while cross-multiplying the ratio 71:65 and reaching 15 kmph, an answer that is 15 m s⁻¹ read directly in kmph without converting the units.

audit: verdict **weak**, auditor picked option 3 (W01-U-p2-01)
- WEAK @ common_mistakes[0].text: "Making an arithmetic slip while cross-multiplying the ratio 71:65 and reaching 15 kmph" — No arithmetic slip is involved in reaching the printed 15 kmph. The cross-multiplication is done correctly and gives u = 15 m s⁻¹; the error is only that the unit is not converted, which the second half of the same sentence then states. The first clause misnames the cause of the mistake it is describing.

VERDICT: [ ] pass [ ] fail NOTE:

---

## 19. tg_eapcet_2023_20230512_an_q116  sha=cfe36a7c

**TG EAPCET 2023, 12 May, afternoon, Q116** — Nuclei

In the following nuclear reaction X is: ₁₃Al²⁷ + ₂He⁴ → ₀n¹ + X

      (1) ₁₅P³¹
      (2) ₁₄Si³⁰
**KEY** (3) ₁₅P³⁰
      (4) ₁₅Si³¹

**Approach:** In a nuclear reaction the total atomic number and the total mass number are each conserved, so both sides must balance separately.

1. List the atomic number Z and mass number A of every particle on the left side and of the neutron on the right.
       ₁₃Al²⁷: Z=13, A=27;  ₂He⁴: Z=2, A=4;  ₀n¹: Z=0, A=1
2. Conserve the atomic number to find the atomic number of X.
       Z(X) = 13 + 2 − 0 = 15
3. Conserve the mass number to find the mass number of X.
       A(X) = 27 + 4 − 1 = 30
4. The element with atomic number 15 is phosphorus, so X is phosphorus-30.
       X = ₁₅P³⁰
       why: Charge and mass number must each add up to the same total before and after a nuclear reaction.

**Final:** option 3 — ₁₅P³⁰
- mistake (option 1): Forgetting to subtract the mass number carried away by the neutron gives A = 27 + 4 = 31, leading to ₁₅P³¹.
- mistake (option 2): Wrongly treating the emitted neutron as if it carried a charge of +1 gives Z = 13 + 2 − 1 = 14, leading to ₁₄Si³⁰.

audit: verdict **ok**, auditor picked option 3 (W01-U-R2-B)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 20. tg_eapcet_2023_20230514_an_q113  sha=f0b8d223

**TG EAPCET 2023, 14 May, afternoon, Q113** — Nuclei

Energy released in the fission of a single uranium nucleus is 200 MeV. Then the number of fissions per second to produce 5 mW power is

**KEY** (1) 1.56×10⁸
      (2) 1.56×10¹³
      (3) 3.12×10⁸
      (4) 3.12×10¹³

**Approach:** Power equals the energy released per fission multiplied by the number of fissions per second, so divide the required power by the energy per fission.

1. Convert the energy released per fission from mega electron volts to joules.
       E = 200 MeV = 200 × 1.602×10⁻¹³ J = 3.204×10⁻¹¹ J
2. Divide the required power by the energy released per fission to get the number of fissions per second.
       n = P/E = 5×10⁻³ / 3.204×10⁻¹¹
3. Evaluate the division.
       n = 1.56×10⁸ fissions per second

**Final:** option 1 — 1.56×10⁸
- mistake (option 3): Using 100 MeV per fission instead of 200 MeV doubles the number of fissions needed to supply the same power, giving 3.12×10⁸.
- mistake: Forgetting to convert 5 mW to watts and dividing 5 (instead of 5×10⁻³) by the energy per fission inflates the count by a factor of a thousand, landing on no printed option.

audit: verdict **ok**, auditor picked option 1 (W01-U-p2-14)

VERDICT: [ ] pass [ ] fail NOTE:

---
