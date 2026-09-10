# Spot check — wave 2

Tick ONE box per item: `[x] pass` or `[x] fail`, and write a NOTE on every fail. Then `python scripts/eapcet/spot_check.py --ingest --wave 2`.

pass = a student who copies this solution into the exam gets the mark, and every line and every mistake entry is true for this question. Anything less is a fail.

## 1. tg_eapcet_2021_20210804_fn_q083  sha=69e2520a

**TG EAPCET 2021, 4 August, morning, Q83** — Motion in a Straight Line

A car travels in a straight line along a road. Its distance 'x' from a stop sign is given as a function of 't' by the equation x(t) = αt + βt³, where α = 2.0 m/s, β = 0.01 m/s³. Calculate the average velocity of the car in the time interval t = 2.00 sec to 4.00 sec.

**KEY** (1) 2.28 m/s
      (2) 4.94 m/s
      (3) 3.34 m/s
      (4) 4.12 m/s

**Approach:** Average velocity over an interval equals the change in position divided by the change in time, using the given x(t).

1. Compute the position at the two given times using x(t) = αt + βt³ with α = 2.0 m/s and β = 0.01 m/s³.
       x(2) = 2×2 + 0.01×2³ = 4.08 m; x(4) = 2×4 + 0.01×4³ = 8.64 m
2. Divide the change in position by the change in time.
       v_avg = (8.64 − 4.08)/(4 − 2) = 4.56/2 = 2.28 m/s

**Final:** option 1 — 2.28 m/s
- mistake (option 2) [distractor]: No slip reaches 4.94 m/s: forgetting to divide by the 2 s interval gives 4.56 m/s, and averaging the instantaneous velocities at the two times gives 2.30 m/s.
- mistake (option 3) [distractor]: No slip reaches 3.34 m/s: using the instantaneous velocity at t = 2 s alone gives 2.12 m/s, and dividing the position change by t = 4 s alone gives 1.14 m/s.
- mistake (option 4) [distractor]: No slip reaches 4.12 m/s: dropping the interval and using x(4) − x(2) alone gives 4.56 m/s, and the instantaneous velocity at t = 4 s gives 2.48 m/s.
- right route: "I divided the change in x by time"

audit: verdict **ok**, auditor picked option 1 (W02-U-p1-02)

VERDICT: [ ] pass [ ] fail NOTE:

---

## 2. tg_eapcet_2022_20220718_fn_q083  sha=4e102efc

**TG EAPCET 2022, 18 July, morning, Q83** — Motion in a Straight Line

A body starts from the rest and acquires a velocity of 10 m/s in 2s. What is the acceleration of the body and the distance travelled

**KEY** (1) 5 m/s² and 10 m
      (2) 5 m/s² and 5 m
      (3) 5 m/s² and 6 m
      (4) 6 m/s² and 5 m

**Approach:** Find the acceleration from the change in velocity over the given time, then use it to find the distance travelled from rest.

1. Compute the acceleration from the initial and final velocities and the time taken.
       a = (v−u)/t = (10−0)/2 = 5 m/s²
2. Use this acceleration to find the distance travelled from rest in the same time.
       s = ½at² = ½×5×2² = 10 m

**Final:** option 1 — 5 m/s² and 10 m
- mistake (option 2) [calculation]: Forgetting to square the time in s = ½at², computing ½×5×2 = 5 m instead of ½×5×2² = 10 m.
- mistake (option 3) [distractor]: No slip reaches 6 m alongside 5 m/s²: dropping the square in s = ½at² gives 5 m, and forgetting the half gives 20 m; no route lands on 6 m.
- mistake (option 4) [distractor]: No slip reaches an acceleration of 6 m/s²: a = (v−u)/t gives 5 m/s², and doubling v or halving t gives 10 m/s²; nothing lands on 6 m/s² paired with 5 m.
- right route: "I found a using v minus u over t"

audit: verdict **ok**, auditor picked option 1 (W02-U-p1-02-R2)

VERDICT: [ ] pass [ ] fail NOTE:

---
