// Four canvas scenes, all real physics: dipole field (hero), cyclotron, AC generator, pendulum.
(function () {
  var CLAY = "#CB6843", CLAY_SOFT = "#E3A07F", SAGE = "#74B594";
  var INK = "#ECE9E2", INK_FAINT = "#726C63";
  var TAU = Math.PI * 2;

  function arrow(ctx, x, y, dx, dy, len, color, label) {
    var m = Math.hypot(dx, dy);
    if (m < 1e-6) return;
    var ux = dx / m, uy = dy / m;
    var tx = x + ux * len, ty = y + uy * len;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tx + ux * 7, ty + uy * 7);
    ctx.lineTo(tx - uy * 3.4, ty + ux * 3.4);
    ctx.lineTo(tx + uy * 3.4, ty - ux * 3.4);
    ctx.closePath();
    ctx.fill();
    if (label) {
      ctx.font = "italic 12px Georgia, serif";
      ctx.fillText(label, tx + ux * 13 - 3, ty + uy * 13 + 4);
    }
  }

  /* ---------- A · HERO: the 3D dipole field, slowly orbiting ---------- */
  // The field-line family is traced once in the meridian plane (the dipole field is
  // axisymmetric), revolved around the dipole axis, then perspective-projected with a
  // slow camera orbit. Depth shows as brightness and line weight, never as distortion.
  Motion.register(document.getElementById("heroField"), function (s) {
    var CAM = 7;                 // camera distance, world units (charges sit at x = ±1)
    var PLANES = 5, LPP = 12;    // meridian planes × lines per plane
    var STEP = 0.045, MAX_STEPS = 240, CHUNK = 12;
    var lines = [];              // {phi, pts:[[x,u],...]} in meridian coords
    var parts = [];              // advected charges: {x, u, phi}
    var glow = false;
    var P = [0, 0, 0, 0];        // projection scratch: sx, sy, depth z, scale k

    // E in the meridian plane of a unit dipole: +q at (−1,0), −q at (+1,0)
    function fieldAt(x, u) {
      var dx1 = x + 1, dx2 = x - 1;
      var r1 = dx1 * dx1 + u * u + 0.02;
      var r2 = dx2 * dx2 + u * u + 0.02;
      var f1 = 1 / (r1 * Math.sqrt(r1));
      var f2 = 1 / (r2 * Math.sqrt(r2));
      return [dx1 * f1 - dx2 * f2, u * f1 - u * f2];
    }

    // trace the family once — geometry is resolution-independent
    for (var pl = 0; pl < PLANES; pl++) {
      var phi = (pl / PLANES) * Math.PI; // u is signed, so π covers the full turn
      for (var li = 0; li < LPP; li++) {
        var a0 = ((li + 0.5) / LPP) * TAU;
        var x = -1 + Math.cos(a0) * 0.14, u = Math.sin(a0) * 0.14;
        var pts = [[x, u]];
        for (var st = 0; st < MAX_STEPS; st++) {
          var e = fieldAt(x, u);
          var m = Math.hypot(e[0], e[1]);
          if (m < 1e-9) break;
          x += (e[0] / m) * STEP;
          u += (e[1] / m) * STEP;
          if (st % 2 === 0) pts.push([x, u]);
          var ddx = x - 1;
          if (ddx * ddx + u * u < 0.02) { pts.push([x, u]); break; }
          if (x < -4 || x > 4 || u < -2.9 || u > 2.9) break;
        }
        if (pts.length > 3) lines.push({ phi: phi, pts: pts });
      }
    }

    function spawn(p) {
      var a = Math.random() * TAU;
      p.x = -1 + Math.cos(a) * 0.2;
      p.u = Math.sin(a) * 0.2;
      p.phi = Math.random() * Math.PI;
    }

    function advect(p, dt) {
      var e = fieldAt(p.x, p.u);
      var m = Math.hypot(e[0], e[1]);
      if (m < 1e-9) { spawn(p); return; }
      var speed = 0.22 + 1.1 * Math.min(1, m * 0.5);
      p.x += (e[0] / m) * speed * dt;
      p.u += (e[1] / m) * speed * dt;
      var ddx = p.x - 1;
      if (ddx * ddx + p.u * p.u < 0.03 || p.x < -4.2 || p.x > 4.2 || p.u < -3 || p.u > 3) spawn(p);
    }

    function resize(w, h) {
      glow = w >= 560;
      var n = Math.max(20, Math.min(54, Math.round((w * h) / 9500)));
      parts.length = 0;
      for (var i = 0; i < n; i++) {
        var p = { x: 0, u: 0, phi: 0 };
        spawn(p);
        // pre-advance so the field starts populated, not clumped at the + charge
        for (var k = 0; k < Math.random() * 200; k++) advect(p, 1 / 60);
        parts.push(p);
      }
    }

    function charge(ctx, x, y, r, color, sign) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = Math.max(1.2, r * 0.16);
      ctx.beginPath();
      ctx.moveTo(x - r * 0.42, y); ctx.lineTo(x + r * 0.42, y);
      if (sign > 0) { ctx.moveTo(x, y - r * 0.42); ctx.lineTo(x, y + r * 0.42); }
      ctx.stroke();
    }

    function draw(t, dt) {
      var ctx = s.ctx, w = s.w, h = s.h;
      var still = Motion.reduced();
      var yaw = still ? 0.8 : 0.8 + t * 0.16;              // the slow orbit
      var pitch = still ? 0.3 : 0.3 + Math.sin(t * 0.1) * 0.05;
      var cyw = Math.cos(yaw), syw = Math.sin(yaw);
      var cb = Math.cos(pitch), sb = Math.sin(pitch);
      var cx0 = w / 2, cy0 = h / 2;
      var f = Math.min(w * 0.85, h * 1.24);
      var k0 = f / CAM;

      // rotate (yaw about the vertical, then pitch), then perspective-project
      function proj(x, u, phi) {
        var Y = u * Math.cos(phi), Z = u * Math.sin(phi);
        var X1 = x * cyw + Z * syw, Z1 = -x * syw + Z * cyw;
        var Y1 = Y * cb - Z1 * sb, Z2 = Y * sb + Z1 * cb;
        var k = f / (CAM - Z2);
        P[0] = cx0 + X1 * k; P[1] = cy0 - Y1 * k; P[2] = Z2; P[3] = k;
      }

      ctx.clearRect(0, 0, w, h);

      // the dipole axis, faint
      proj(-1, 0, 0);
      var qx1 = P[0], qy1 = P[1], qz1 = P[2], qk1 = P[3];
      proj(1, 0, 0);
      var qx2 = P[0], qy2 = P[1], qz2 = P[2], qk2 = P[3];
      ctx.strokeStyle = "rgba(236,233,226,0.10)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(qx1, qy1); ctx.lineTo(qx2, qy2); ctx.stroke();

      // the far charge sits behind the field lines
      if (qz1 <= qz2) charge(ctx, qx1, qy1, 0.16 * qk1, CLAY, 1);
      else charge(ctx, qx2, qy2, 0.16 * qk2, SAGE, -1);

      // field lines in depth-graded chunks: nearer = brighter and heavier (never bigger)
      for (var i = 0; i < lines.length; i++) {
        var ln = lines[i], pts = ln.pts;
        var ci = 0;
        while (ci < pts.length - 1) {
          var end = Math.min(ci + CHUNK, pts.length - 1);
          proj(pts[ci][0], pts[ci][1], ln.phi);
          var zsum = P[2];
          ctx.beginPath();
          ctx.moveTo(P[0], P[1]);
          for (var j = ci + 1; j <= end; j++) {
            proj(pts[j][0], pts[j][1], ln.phi);
            ctx.lineTo(P[0], P[1]);
            zsum += P[2];
          }
          var depth = Math.max(0, Math.min(1, (zsum / (end - ci + 1) + 2.8) / 5.6));
          ctx.strokeStyle = "rgba(227,160,127," + (0.07 + depth * 0.3).toFixed(3) + ")";
          ctx.lineWidth = 0.7 + depth * 0.9;
          ctx.stroke();
          ci = end;
        }
      }

      // charges flowing along the 3D field
      if (!still) {
        if (glow) { ctx.shadowColor = CLAY; ctx.shadowBlur = 8; }
        for (var pj = 0; pj < parts.length; pj++) {
          advect(parts[pj], dt);
          proj(parts[pj].x, parts[pj].u, parts[pj].phi);
          var pd = Math.max(0, Math.min(1, (P[2] + 2.8) / 5.6));
          ctx.fillStyle = "rgba(227,160,127," + (0.22 + pd * 0.65).toFixed(3) + ")";
          ctx.beginPath();
          ctx.arc(P[0], P[1], (1.1 + pd * 1.1) * (P[3] / k0), 0, TAU);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      // the near charge, on top
      if (qz1 <= qz2) charge(ctx, qx2, qy2, 0.16 * qk2, SAGE, -1);
      else charge(ctx, qx1, qy1, 0.16 * qk1, CLAY, 1);

      ctx.fillStyle = INK_FAINT;
      ctx.font = "italic 13px Georgia, serif";
      ctx.fillText("+q", qx1 - 8, qy1 - 0.16 * qk1 - 7);
      ctx.fillText("−q", qx2 - 8, qy2 - 0.16 * qk2 - 7);
    }

    return { resize: resize, draw: draw };
  });

  /* ---------- B · CYCLOTRON: charges circling in uniform B (into page) ---------- */
  Motion.register(document.getElementById("cyclotron"), function (s) {
    var lattice = null;
    var trail = null, tctx = null; // dots leave trails on their own layer; overlays stay crisp
    var parts = [];

    function resize(w, h) {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      lattice = document.createElement("canvas");
      lattice.width = Math.round(w * dpr);
      lattice.height = Math.round(h * dpr);
      var lc = lattice.getContext("2d");
      lc.setTransform(dpr, 0, 0, dpr, 0, 0);
      lc.strokeStyle = "rgba(236,233,226,0.10)";
      lc.lineWidth = 1.2;
      for (var gx = 20; gx < w; gx += 36) {
        for (var gy = 20; gy < h - 26; gy += 36) {
          lc.beginPath();
          lc.moveTo(gx - 3.4, gy - 3.4); lc.lineTo(gx + 3.4, gy + 3.4);
          lc.moveTo(gx + 3.4, gy - 3.4); lc.lineTo(gx - 3.4, gy + 3.4);
          lc.stroke();
        }
      }
      lc.fillStyle = "rgba(236,233,226,0.35)";
      lc.font = "600 11px Inter, sans-serif";
      lc.fillText("B into page", 14, h - 12);

      trail = document.createElement("canvas");
      trail.width = Math.round(w * dpr);
      trail.height = Math.round(h * dpr);
      tctx = trail.getContext("2d");
      tctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      parts.length = 0;
      var base = Math.min(w, h);
      for (var i = 0; i < 5; i++) {
        var r = base * (0.14 + Math.random() * 0.16);
        var om = 0.9 + Math.random() * 0.7;
        parts.push({
          cx: w * (0.25 + Math.random() * 0.5),
          cy: h * (0.28 + Math.random() * 0.44),
          r: r, om: om, ph: Math.random() * TAU
        });
      }
    }

    function draw(t, dt) {
      var ctx = s.ctx, w = s.w, h = s.h;
      var still = Motion.reduced();

      // fade the trail layer, then stamp this frame's dots onto it
      if (!still && tctx) {
        tctx.globalCompositeOperation = "destination-out";
        tctx.fillStyle = "rgba(0,0,0,0.10)";
        tctx.fillRect(0, 0, w, h);
        tctx.globalCompositeOperation = "source-over";
      }

      ctx.clearRect(0, 0, w, h);
      if (lattice) ctx.drawImage(lattice, 0, 0, w, h);
      if (trail) ctx.drawImage(trail, 0, 0, w, h);

      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var a = p.ph + p.om * t;
        var x = p.cx + Math.cos(a) * p.r;
        var y = p.cy + Math.sin(a) * p.r;
        var lead = i === 0;

        if (still || lead) {
          ctx.strokeStyle = "rgba(227,160,127,0.22)";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 5]);
          ctx.beginPath();
          ctx.arc(p.cx, p.cy, p.r, 0, TAU);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        if (!still && tctx) {
          tctx.fillStyle = "rgba(227,160,127,0.45)";
          tctx.beginPath();
          tctx.arc(x, y, lead ? 3 : 2.2, 0, TAU);
          tctx.fill();
        }

        ctx.fillStyle = lead ? CLAY_SOFT : "rgba(227,160,127,0.75)";
        ctx.beginPath();
        ctx.arc(x, y, lead ? 5 : 3.4, 0, TAU);
        ctx.fill();

        if (lead) {
          // v is tangent; F points to the center (centripetal)
          arrow(ctx, x, y, -Math.sin(a) * p.om, Math.cos(a) * p.om, 36, CLAY_SOFT, "v");
          arrow(ctx, x, y, p.cx - x, p.cy - y, 30, SAGE, "F");
        }
      }
    }

    return { resize: resize, draw: draw };
  });

  /* ---------- C · AC GENERATOR: rotating coil + live EMF sine ---------- */
  Motion.register(document.getElementById("generator"), function (s) {
    var buf = [];
    var BUF_N = 300;
    var head = 0;
    var filled = false;
    var acc = 0;
    var SAMPLE_DT = 1 / 60; // fixed-rate sampling keeps the wave shape refresh-rate independent

    function resize() {
      buf.length = 0;
      for (var i = 0; i < BUF_N; i++) buf.push(0);
      head = 0;
      filled = false;
      acc = 0;
    }

    function draw(t, dt) {
      var ctx = s.ctx, w = s.w, h = s.h;
      var still = Motion.reduced();
      var cx = Math.min(w * 0.16, 130), cy = h / 2;
      var theta = still ? Math.PI / 4 : t * 2.2;
      var emf = Math.sin(theta);

      ctx.clearRect(0, 0, w, h);

      // pole pieces: N above, S below — B points straight down between them
      var pw = 84;
      ctx.fillStyle = "rgba(203,104,67,0.13)";
      ctx.fillRect(cx - pw / 2, cy - 58, pw, 14);
      ctx.fillStyle = "rgba(116,181,148,0.13)";
      ctx.fillRect(cx - pw / 2, cy + 44, pw, 14);
      ctx.fillStyle = INK_FAINT;
      ctx.font = "600 10px Inter, sans-serif";
      ctx.fillText("N", cx - 3, cy - 47);
      ctx.fillText("S", cx - 3, cy + 55);
      ctx.strokeStyle = "rgba(236,233,226,0.14)";
      ctx.lineWidth = 1;
      for (var fa = -1; fa <= 1; fa++) {
        var fx = cx + fa * 26;
        ctx.beginPath();
        ctx.moveTo(fx, cy - 40); ctx.lineTo(fx, cy + 40);
        ctx.moveTo(fx - 3, cy + 34); ctx.lineTo(fx, cy + 40); ctx.lineTo(fx + 3, cy + 34);
        ctx.stroke();
      }

      // the coil, edge-on: a rotating segment (vertical = plane parallel to B = peak EMF)
      var L = 33;
      var ex = Math.sin(theta) * L, ey = Math.cos(theta) * L;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx - ex, cy - ey);
      ctx.lineTo(cx + ex, cy + ey);
      ctx.stroke();
      ctx.fillStyle = CLAY_SOFT;
      ctx.beginPath(); ctx.arc(cx - ex, cy - ey, 3, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + ex, cy + ey, 3, 0, TAU); ctx.fill();
      ctx.fillStyle = INK_FAINT;
      ctx.beginPath(); ctx.arc(cx, cy, 2, 0, TAU); ctx.fill();

      // EMF trace
      var gx0 = cx + 90, gx1 = w - 24;
      var amp = h * 0.3;
      ctx.strokeStyle = "rgba(236,233,226,0.12)";
      ctx.beginPath(); ctx.moveTo(gx0, cy); ctx.lineTo(gx1, cy); ctx.stroke();
      ctx.fillStyle = INK_FAINT;
      ctx.font = "600 10px Inter, sans-serif";
      ctx.fillText("EMF", gx0, cy - amp - 8);

      ctx.strokeStyle = CLAY_SOFT;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      if (still) {
        for (var px2 = gx0; px2 <= gx1; px2++) {
          var ph = ((px2 - gx0) / (gx1 - gx0)) * TAU * 2;
          var yy = cy - Math.sin(ph) * amp;
          if (px2 === gx0) ctx.moveTo(px2, yy); else ctx.lineTo(px2, yy);
        }
        ctx.stroke();
        return;
      }
      acc += dt;
      while (acc >= SAMPLE_DT) {
        acc -= SAMPLE_DT;
        buf[head] = emf;
        head = (head + 1) % BUF_N;
        if (head === 0) filled = true;
      }
      var n = filled ? BUF_N : head;
      for (var k = 0; k < n; k++) {
        // oldest → newest, newest sample lands at gx1
        var idx = filled ? (head + k) % BUF_N : k;
        var gx = gx1 - (n - 1 - k) * ((gx1 - gx0) / (BUF_N - 1));
        var gy = cy - buf[idx] * amp;
        if (k === 0) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);
      }
      ctx.stroke();
      ctx.fillStyle = CLAY_SOFT;
      ctx.beginPath();
      ctx.arc(gx1, cy - emf * amp, 2.5 + 2 * Math.abs(emf), 0, TAU);
      ctx.fill();
    }

    return { resize: resize, draw: draw };
  });

  /* ---------- D · PENDULUM: a slider the visitor can actually use ---------- */
  Motion.register(document.getElementById("pendulum"), function (s) {
    var slider = document.getElementById("lenSlider");
    var out = document.getElementById("lenOut");
    var g = 9.8;
    var theta = 0.5, omega = 0;
    var auto = true;
    var stops = [30, 78, 45, 90, 20];
    var stopIdx = 0, stopT = 0;
    var val = 30;

    if (slider) {
      slider.addEventListener("input", function () { auto = false; }, { passive: true });
      slider.addEventListener("pointerdown", function () { auto = false; }, { passive: true });
    }

    function lengthM() {
      var v = slider ? Number(slider.value) : val;
      return 0.6 + (v / 100) * 1.0; // 0.6 m – 1.6 m
    }

    function draw(t, dt) {
      var ctx = s.ctx, w = s.w, h = s.h;
      var still = Motion.reduced();

      if (!still && auto && slider) {
        stopT += dt;
        if (stopT > 3.6) { stopT = 0; stopIdx = (stopIdx + 1) % stops.length; }
        val += (stops[stopIdx] - val) * Math.min(1, dt * 1.6);
        slider.value = String(Math.round(val));
      }
      var L = lengthM();
      if (out) out.textContent = L.toFixed(1) + " m";

      if (!still) {
        // semi-implicit Euler on the real equation of motion
        var steps = 2;
        for (var i = 0; i < steps; i++) {
          omega += (-(g / L) * Math.sin(theta) - 0.02 * omega) * (dt / steps);
          theta += omega * (dt / steps);
        }
      } else {
        theta = 0.38;
      }

      var pxv = w / 2, pyv = 26;
      var ppm = (h - 90) / 1.6; // px per metre
      var bx = pxv + Math.sin(theta) * L * ppm;
      var by = pyv + Math.cos(theta) * L * ppm;

      ctx.clearRect(0, 0, w, h);

      // ceiling
      ctx.strokeStyle = "rgba(236,233,226,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pxv - 44, pyv); ctx.lineTo(pxv + 44, pyv); ctx.stroke();
      ctx.strokeStyle = "rgba(236,233,226,0.10)";
      for (var hx = -40; hx <= 40; hx += 10) {
        ctx.beginPath(); ctx.moveTo(pxv + hx, pyv); ctx.lineTo(pxv + hx - 6, pyv - 7); ctx.stroke();
      }

      // swing arc
      ctx.strokeStyle = "rgba(227,160,127,0.18)";
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.arc(pxv, pyv, L * ppm, Math.PI / 2 - 0.55, Math.PI / 2 + 0.55);
      ctx.stroke();
      ctx.setLineDash([]);

      // rod + bob
      ctx.strokeStyle = "rgba(236,233,226,0.55)";
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(pxv, pyv); ctx.lineTo(bx, by); ctx.stroke();
      ctx.fillStyle = INK_FAINT;
      ctx.beginPath(); ctx.arc(pxv, pyv, 2.6, 0, TAU); ctx.fill();
      ctx.fillStyle = CLAY;
      ctx.shadowColor = CLAY; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(bx, by, 12, 0, TAU); ctx.fill();
      ctx.shadowBlur = 0;

      // the teaching line: period follows √L
      var T = TAU * Math.sqrt(L / g);
      ctx.fillStyle = INK_FAINT;
      ctx.font = "italic 13px Georgia, serif";
      ctx.fillText("T = 2π√(L/g) ≈ " + T.toFixed(1) + " s", 16, h - 16);
    }

    return { draw: draw };
  });
})();
