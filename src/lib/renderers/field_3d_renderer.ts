// =============================================================================
// field_3d_renderer.ts
// Pre-built Three.js renderer for electric & magnetic field simulations.
// Engineer-written — NOT AI-generated.
//
// Architecture: reads window.SIM_CONFIG (Field3DConfig), draws any
// field scenario from that config. Zero hardcoded physics — everything
// is driven by the JSON.
//
// Scenarios supported (via config.scenario_type):
//   point_charge_positive  — radial field lines from +q
//   point_charge_negative  — radial field lines into -q
//   dipole                 — curved lines from + to -
//   parallel_plates        — uniform parallel lines between plates
//   solenoid_field         — dense lines inside, sparse outside
//   bar_magnet             — N→S external loops
//   straight_wire_current  — concentric circles around wire
//   changing_flux          — coil + moving magnet + EMF
//
// postMessage bridge:
//   IN:  { type: 'SET_STATE', state: 'STATE_N' }
//        { type: 'INIT_CONFIG', config: Field3DConfig }
//        { type: 'PING' }
//   OUT: { type: 'SIM_READY' }          — on load
//        { type: 'STATE_REACHED', state: 'STATE_N' }  — on state apply
//        { type: 'PONG' }
// =============================================================================

// ── TypeScript interfaces (exported for config generation) ───────────────────

export interface Field3DConfig {
    scenario_type: 'point_charge_positive' | 'point_charge_negative' | 'dipole' |
        'parallel_plates' | 'solenoid_field' | 'bar_magnet' | 'straight_wire_current' | 'changing_flux';
    charges?: Array<{
        id: string;
        sign: number;           // +1 or -1
        magnitude: number;      // in units of e
        position: [number, number, number];
        label: string;
        color: string;
    }>;
    field_lines: {
        count: number;          // number of field lines per charge
        color_positive: string;
        color_negative: string;
        opacity: number;
        arrow_spacing: number;  // how often arrows appear on lines
    };
    equipotential?: {
        show: boolean;
        surfaces: number;       // number of equipotential surfaces
        opacity: number;
        color: string;
    };
    current?: {
        direction: [number, number, number];
        magnitude: number;
        wire_color: string;
    };
    coil?: {
        turns: number;
        radius: number;
        axis: [number, number, number];
    };
    states: Record<string, {
        label: string;
        visible_elements: string[];   // which elements to show
        camera_position?: [number, number, number];
        highlight?: string;
        caption: string;
        animate?: boolean;
        // ── Premium polish extras (session 60 polish iteration) ───────────────
        extras?: {
            right_hand?: {
                position: [number, number, number];
                thumb_direction: [number, number, number];
                finger_curl: 'cw' | 'ccw';
                scale?: number;
                animate_curl?: boolean;       // pulse the fingers to animate the rule
                // Case-specific overlay mode. 'A' = thumb-up Case A only (current up,
                // B counter-clockwise). 'B' = thumb-down Case B only (current down,
                // B clockwise). Omit (or 'both') = show both cases stacked.
                case?: 'A' | 'B' | 'both';
            };
            compass?: {
                position: [number, number, number];
                radius?: number;
                animate_swing?: boolean;       // swing from north to B-tangent over time
                swing_delay_ms?: number;       // when in state lifecycle to start swinging
            };
            highlighted_point?: {
                position: [number, number, number];
                label?: string;
                color?: string;
                radius?: number;
            };
        };
        // Show interactive I/r sliders + B readout overlay in this state
        show_sliders?: boolean;
        // Multi-line text shown in a corner of the canvas (formulas, numerics)
        formula_overlay?: string;
        // straight_wire_current scenario: rotate the field-line arrows around the
        // wire. 'ccw' (default) for current upward; 'cw' for reversed current.
        // Omitted = no rotation animation.
        field_rotation_direction?: 'cw' | 'ccw';
        // straight_wire_current scenario: animate yellow dots flowing along the
        // wire to visualize the conventional current direction. 'up' or 'down'.
        // Omitted = no dots shown.
        current_direction_indicator?: 'up' | 'down';
    }>;
    // Slider configuration (used when show_sliders: true on a state)
    slider_controls?: {
        I?: { min: number; max: number; step: number; default: number; label: string };
        r?: { min: number; max: number; step: number; default: number; label: string };
    };
    pvl_colors?: {
        background: string; text: string; positive: string; negative: string; field_line: string;
    };
}

// ── HTML assembler ───────────────────────────────────────────────────────────

export function assembleField3DHtml(config: Field3DConfig): string {
    const bg = config.pvl_colors?.background ?? '#0A0A1A';
    const textColor = config.pvl_colors?.text ?? '#D4D4D8';
    return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
html, body { margin: 0; padding: 0; overflow: hidden; background: ${bg}; width: 100%; height: 100%; }
canvas { display: block; width: 100%; height: 100%; }
#legend {
    position: fixed; bottom: 8px; left: 8px;
    background: rgba(0,0,0,0.85); color: ${textColor};
    padding: 10px 14px; border-radius: 6px; font: 12px/1.5 monospace;
    z-index: 10; max-width: 280px; pointer-events: none;
}
#caption {
    position: fixed; top: 12px; left: 50%; transform: translateX(-50%);
    background: rgba(0,0,0,0.8); color: ${textColor};
    padding: 8px 16px; border-radius: 8px; font: 14px/1.4 system-ui, sans-serif;
    z-index: 10; text-align: center; max-width: 80%; pointer-events: none;
}
#mobile-fallback {
    display: none; width: 100%; height: 100%;
    position: fixed; top: 0; left: 0; background: ${bg};
}
#sliders {
    position: fixed; top: 12px; right: 12px;
    background: rgba(0,0,0,0.85); color: ${textColor};
    padding: 10px 14px; border-radius: 8px;
    font: 12px/1.6 monospace; z-index: 10;
    min-width: 180px; display: none;
}
#sliders label { display: block; margin-bottom: 2px; }
#sliders input[type="range"] { width: 100%; margin-bottom: 8px; }
#sliders #b_readout {
    margin-top: 6px; padding-top: 6px;
    border-top: 1px solid rgba(255,255,255,0.2);
    color: #FFF176; font-weight: bold;
}
#formula_overlay {
    position: fixed; bottom: 12px; right: 12px;
    background: rgba(0,0,0,0.85); color: #FFF176;
    padding: 10px 14px; border-radius: 8px;
    font: 13px/1.5 monospace; z-index: 10;
    max-width: 300px; display: none;
    white-space: pre-line;
}
@keyframes rhrCurlSweep {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: -22; }
}
#rhr_overlay {
    position: fixed; top: 60px; right: 12px;
    background: rgba(0,0,0,0.86);
    border: 1px solid rgba(252,211,77,0.55);
    border-radius: 12px;
    padding: 10px 12px;
    z-index: 12;
    display: none;
    pointer-events: none;
    width: 230px;
    font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui, sans-serif;
    color: ${textColor};
}
#rhr_overlay .rhr-title {
    color: #FCD34D; font-size: 14px; font-weight: 700;
    text-align: center; margin-bottom: 8px;
    letter-spacing: 0.3px;
}
#rhr_overlay .rhr-case {
    margin-bottom: 8px;
    padding: 6px 8px 8px;
    background: rgba(255,255,255,0.05);
    border-radius: 8px;
}
#rhr_overlay .rhr-case:last-of-type { margin-bottom: 6px; }
#rhr_overlay .rhr-case-label {
    font-size: 11px; font-weight: 700; margin-bottom: 4px;
    letter-spacing: 0.2px;
}
#rhr_overlay .rhr-case-a-label { color: #FFB366; }
#rhr_overlay .rhr-case-b-label { color: #82B1FF; }
#rhr_overlay .rhr-row {
    display: flex; align-items: center; gap: 10px;
}
#rhr_overlay .rhr-hand {
    font-size: 52px; line-height: 1; flex-shrink: 0;
    text-shadow: 0 2px 6px rgba(0,0,0,0.5);
    user-select: none;
}
#rhr_overlay .rhr-curl-block { flex: 1; text-align: center; }
#rhr_overlay .rhr-curl-svg {
    width: 70px; height: 50px; display: block; margin: 0 auto;
}
#rhr_overlay .rhr-curl-text {
    font-size: 10px; margin-top: 2px; line-height: 1.25;
}
#rhr_overlay .rhr-curl-a .rhr-curl-text { color: #66BB6A; font-weight: 600; }
#rhr_overlay .rhr-curl-b .rhr-curl-text { color: #EF7B7B; font-weight: 600; }
#rhr_overlay .rhr-footer {
    font-size: 9px; text-align: center; margin-top: 4px;
    opacity: 0.78; font-style: italic;
}
#rhr_overlay .curl-arc { animation: rhrCurlSweep 1.4s linear infinite; }
#rhr_overlay.rhr-show-a-only .rhr-case-section-b,
#rhr_overlay.rhr-show-a-only .rhr-footer { display: none; }
#rhr_overlay.rhr-show-b-only .rhr-case-section-a,
#rhr_overlay.rhr-show-b-only .rhr-footer { display: none; }
</style>
</head><body>
<div id="caption"></div>
<div id="legend"></div>
<div id="mobile-fallback"></div>
<div id="sliders">
    <label>I = <span id="i_val">5</span> A</label>
    <input type="range" id="i_slider" min="0.5" max="20" step="0.5" value="5">
    <label>r = <span id="r_val">5</span> cm</label>
    <input type="range" id="r_slider" min="2" max="30" step="1" value="5">
    <div id="b_readout">B = 20.0 μT</div>
</div>
<div id="formula_overlay"></div>
<div id="rhr_overlay">
    <div class="rhr-title">Right-Hand Rule</div>
    <div class="rhr-case rhr-case-section-a">
        <div class="rhr-case-label rhr-case-a-label">Case A · I points UP ↑</div>
        <div class="rhr-row">
            <div class="rhr-hand">👍</div>
            <div class="rhr-curl-block rhr-curl-a">
                <svg class="rhr-curl-svg" viewBox="0 0 70 50" xmlns="http://www.w3.org/2000/svg">
                    <path class="curl-arc" d="M 60 28 A 24 16 0 1 0 12 28" stroke="#66BB6A" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="6 5"/>
                    <polygon points="6,28 18,22 18,34" fill="#66BB6A"/>
                </svg>
                <div class="rhr-curl-text">B counter-clockwise<br/>(viewed from above)</div>
            </div>
        </div>
    </div>
    <div class="rhr-case rhr-case-section-b">
        <div class="rhr-case-label rhr-case-b-label">Case B · I points DOWN ↓</div>
        <div class="rhr-row">
            <div class="rhr-hand">👎</div>
            <div class="rhr-curl-block rhr-curl-b">
                <svg class="rhr-curl-svg" viewBox="0 0 70 50" xmlns="http://www.w3.org/2000/svg">
                    <path class="curl-arc" d="M 10 28 A 24 16 0 1 0 58 28" stroke="#EF7B7B" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="6 5"/>
                    <polygon points="64,28 52,22 52,34" fill="#EF7B7B"/>
                </svg>
                <div class="rhr-curl-text">B clockwise<br/>(viewed from above)</div>
            </div>
        </div>
    </div>
    <div class="rhr-footer">Same RIGHT hand — flip thumb, B reverses too</div>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" crossorigin="anonymous"><\/script>
<script>
window.SIM_CONFIG = ${JSON.stringify(config)};
<\/script>
<script>
${FIELD_3D_RENDERER_CODE}
<\/script>
</body></html>`;
}

// ── Renderer code (Three.js, embedded as string) ────────────────────────────

export const FIELD_3D_RENDERER_CODE = `
// ============================================================
// Field 3D Renderer — Three.js global mode
// Reads window.SIM_CONFIG (Field3DConfig)
// ============================================================

(function() {
    "use strict";

    var config = window.SIM_CONFIG;
    if (!config) { console.error("No SIM_CONFIG"); return; }

    var PM_currentState = "STATE_1";
    var scene, camera, renderer, animationId;
    var sceneObjects = [];
    var isDragging = false, prevMouse = { x: 0, y: 0 };
    var spherical = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 8 };
    var targetSpherical = { theta: spherical.theta, phi: spherical.phi, radius: spherical.radius };
    var animating = false;
    var isMobile = window.innerWidth < 768;

    // ── Mobile fallback: 2D SVG projection ────────────────────────────────
    if (isMobile) {
        showMobileFallback();
        setupPostMessage();
        return;
    }

    // ── Three.js setup ────────────────────────────────────────────────────
    scene = new THREE.Scene();
    scene.background = new THREE.Color(config.pvl_colors ? config.pvl_colors.background : "#0A0A1A");

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    updateCameraFromSpherical();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

    // Lighting
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // ── Manual orbit controls ─────────────────────────────────────────────
    renderer.domElement.addEventListener("mousedown", function(e) {
        isDragging = true;
        prevMouse.x = e.clientX; prevMouse.y = e.clientY;
    });
    renderer.domElement.addEventListener("mousemove", function(e) {
        if (!isDragging) return;
        var dx = e.clientX - prevMouse.x;
        var dy = e.clientY - prevMouse.y;
        spherical.theta -= dx * 0.005;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - dy * 0.005));
        targetSpherical.theta = spherical.theta;
        targetSpherical.phi = spherical.phi;
        prevMouse.x = e.clientX; prevMouse.y = e.clientY;
        updateCameraFromSpherical();
    });
    renderer.domElement.addEventListener("mouseup", function() { isDragging = false; });
    renderer.domElement.addEventListener("mouseleave", function() { isDragging = false; });
    renderer.domElement.addEventListener("wheel", function(e) {
        spherical.radius = Math.max(3, Math.min(20, spherical.radius + e.deltaY * 0.01));
        targetSpherical.radius = spherical.radius;
        updateCameraFromSpherical();
        e.preventDefault();
    }, { passive: false });

    // Touch support
    var touchStart = null;
    renderer.domElement.addEventListener("touchstart", function(e) {
        if (e.touches.length === 1) {
            touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    });
    renderer.domElement.addEventListener("touchmove", function(e) {
        if (!touchStart || e.touches.length !== 1) return;
        var dx = e.touches[0].clientX - touchStart.x;
        var dy = e.touches[0].clientY - touchStart.y;
        spherical.theta -= dx * 0.005;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - dy * 0.005));
        targetSpherical.theta = spherical.theta;
        targetSpherical.phi = spherical.phi;
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        updateCameraFromSpherical();
        e.preventDefault();
    }, { passive: false });
    renderer.domElement.addEventListener("touchend", function() { touchStart = null; });

    // ── Camera helpers ────────────────────────────────────────────────────
    function updateCameraFromSpherical() {
        var r = spherical.radius;
        camera.position.set(
            r * Math.sin(spherical.phi) * Math.cos(spherical.theta),
            r * Math.cos(spherical.phi),
            r * Math.sin(spherical.phi) * Math.sin(spherical.theta)
        );
        camera.lookAt(0, 0, 0);
    }

    function animateCameraTo(pos) {
        if (!pos) return;
        var r = Math.sqrt(pos[0]*pos[0] + pos[1]*pos[1] + pos[2]*pos[2]);
        targetSpherical.radius = r || 8;
        targetSpherical.phi = r > 0 ? Math.acos(Math.max(-1, Math.min(1, pos[1] / r))) : Math.PI / 3;
        targetSpherical.theta = Math.atan2(pos[2], pos[0]);
        animating = true;
    }

    function lerpSpherical() {
        if (!animating) return;
        var t = 0.05;
        spherical.theta += (targetSpherical.theta - spherical.theta) * t;
        spherical.phi += (targetSpherical.phi - spherical.phi) * t;
        spherical.radius += (targetSpherical.radius - spherical.radius) * t;
        if (Math.abs(spherical.theta - targetSpherical.theta) < 0.001 &&
            Math.abs(spherical.phi - targetSpherical.phi) < 0.001 &&
            Math.abs(spherical.radius - targetSpherical.radius) < 0.01) {
            spherical.theta = targetSpherical.theta;
            spherical.phi = targetSpherical.phi;
            spherical.radius = targetSpherical.radius;
            animating = false;
        }
        updateCameraFromSpherical();
    }

    // ── Scene management ──────────────────────────────────────────────────
    function clearScene() {
        for (var i = sceneObjects.length - 1; i >= 0; i--) {
            var obj = sceneObjects[i];
            scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(function(m) { m.dispose(); });
                } else {
                    obj.material.dispose();
                }
            }
        }
        sceneObjects = [];
    }

    function addToScene(obj) {
        scene.add(obj);
        sceneObjects.push(obj);
    }

    // ── Geometry helpers ──────────────────────────────────────────────────
    function hexToThreeColor(hex) {
        return new THREE.Color(hex);
    }

    function createChargeSphere(pos, color, radius) {
        var geo = new THREE.SphereGeometry(radius || 0.3, 24, 24);
        var mat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor(color),
            emissive: hexToThreeColor(color),
            emissiveIntensity: 0.4,
            shininess: 80
        });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(pos[0], pos[1], pos[2]);
        return mesh;
    }

    function createTubeLine(points, color, tubeRadius) {
        if (points.length < 2) return null;
        var vectors = points.map(function(p) { return new THREE.Vector3(p[0], p[1], p[2]); });
        var curve = new THREE.CatmullRomCurve3(vectors);
        var geo = new THREE.TubeGeometry(curve, Math.max(points.length * 4, 20), tubeRadius || 0.02, 8, false);
        var mat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor(color),
            transparent: true,
            opacity: config.field_lines.opacity || 0.8
        });
        var mesh = new THREE.Mesh(geo, mat);
        return mesh;
    }

    function createArrowHead(position, direction, color) {
        var geo = new THREE.ConeGeometry(0.06, 0.15, 8);
        var mat = new THREE.MeshPhongMaterial({ color: hexToThreeColor(color) });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(position[0], position[1], position[2]);
        // Orient cone along direction
        var dir = new THREE.Vector3(direction[0], direction[1], direction[2]).normalize();
        var up = new THREE.Vector3(0, 1, 0);
        var quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(up, dir);
        mesh.setRotationFromQuaternion(quaternion);
        return mesh;
    }

    function createPlate(width, height, position, color) {
        var geo = new THREE.BoxGeometry(width, height, 0.05);
        var mat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor(color),
            transparent: true,
            opacity: 0.6
        });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(position[0], position[1], position[2]);
        return mesh;
    }

    function createWire(start, end, color, radius) {
        var dir = new THREE.Vector3(end[0]-start[0], end[1]-start[1], end[2]-start[2]);
        var length = dir.length();
        dir.normalize();
        var geo = new THREE.CylinderGeometry(radius || 0.05, radius || 0.05, length, 12);
        var mat = new THREE.MeshPhongMaterial({ color: hexToThreeColor(color) });
        var mesh = new THREE.Mesh(geo, mat);
        var mid = [(start[0]+end[0])/2, (start[1]+end[1])/2, (start[2]+end[2])/2];
        mesh.position.set(mid[0], mid[1], mid[2]);
        var up = new THREE.Vector3(0, 1, 0);
        var quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(up, dir);
        mesh.setRotationFromQuaternion(quaternion);
        return mesh;
    }

    function createEquipotentialSurface(radius, color, opacity) {
        var geo = new THREE.SphereGeometry(radius, 32, 32);
        var mat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor(color),
            transparent: true,
            opacity: opacity || 0.12,
            wireframe: true,
            wireframeLinewidth: 1
        });
        var mesh = new THREE.Mesh(geo, mat);
        return mesh;
    }

    // ── Premium primitives (session-60 polish iteration) ─────────────────
    function createRightHand(spec) {
        // Builds a stylised right hand at spec.position with thumb pointing
        // along spec.thumb_direction, fingers curling spec.finger_curl
        // ('ccw' | 'cw') around the thumb axis. All composed of basic Three.js
        // primitives — no GLTF dependency.
        var grp = new THREE.Group();
        var s = spec.scale || 1;
        var skinColor = 0xFFCC9F;
        var skinMat = new THREE.MeshPhongMaterial({
            color: skinColor, emissive: 0x442211, emissiveIntensity: 0.18, shininess: 30
        });

        // Palm — slightly elongated sphere
        var palmGeo = new THREE.SphereGeometry(0.20 * s, 18, 14);
        var palm = new THREE.Mesh(palmGeo, skinMat);
        palm.scale.set(1.0, 0.85, 0.7);
        grp.add(palm);

        // Thumb — cylinder pointing local +Y, anchored on top of palm
        var thumbGeo = new THREE.CylinderGeometry(0.07 * s, 0.085 * s, 0.55 * s, 12);
        var thumb = new THREE.Mesh(thumbGeo, skinMat);
        thumb.position.set(0, 0.35 * s, 0.04 * s);
        grp.add(thumb);

        // Thumbnail (tiny dark cap) for clarity at the thumb tip
        var nailGeo = new THREE.SphereGeometry(0.06 * s, 8, 8);
        var nailMat = new THREE.MeshPhongMaterial({ color: 0xCC9966 });
        var nail = new THREE.Mesh(nailGeo, nailMat);
        nail.position.set(0, 0.62 * s, 0.05 * s);
        grp.add(nail);

        // 4 fingers — each a quarter-circle TubeGeometry curling around +Y
        var fingerLengths = [1.00, 1.05, 0.95, 0.80]; // index..pinky relative
        var dir = spec.finger_curl === 'cw' ? -1 : 1;
        var palmRadius = 0.22 * s;

        for (var fi = 0; fi < 4; fi++) {
            // each finger sits at a different Y along the palm and starts at a
            // different starting angle in XZ plane
            var fingerOffsetY = -0.05 * s + fi * 0.085 * s;
            var startTheta = -Math.PI / 2 - 0.2;        // start on the back side of the palm
            var sweepTheta = (Math.PI / 1.8) * fingerLengths[fi];  // ~100°

            var pts = [];
            var segments = 18;
            for (var t = 0; t <= segments; t++) {
                var u = t / segments;
                var theta = startTheta + dir * sweepTheta * u;
                var rad = palmRadius * (1 + 0.05 * Math.sin(u * Math.PI)); // slight bulge
                var x = rad * Math.cos(theta);
                var z = rad * Math.sin(theta);
                var y = fingerOffsetY - u * 0.04 * s;   // fingers droop slightly toward palm
                pts.push(new THREE.Vector3(x, y, z));
            }
            var curve = new THREE.CatmullRomCurve3(pts);
            var fingerGeo = new THREE.TubeGeometry(curve, 24, 0.045 * s * fingerLengths[fi], 8, false);
            var finger = new THREE.Mesh(fingerGeo, skinMat);
            finger.userData = { fingerIndex: fi };
            grp.add(finger);
        }

        // Wrist stub — small darker cylinder below the palm
        var wristGeo = new THREE.CylinderGeometry(0.16 * s, 0.13 * s, 0.30 * s, 12);
        var wristMat = new THREE.MeshPhongMaterial({ color: 0xE6B895 });
        var wrist = new THREE.Mesh(wristGeo, wristMat);
        wrist.position.set(0, -0.30 * s, 0);
        grp.add(wrist);

        // Position + orient so local +Y aligns with spec.thumb_direction
        grp.position.set(spec.position[0], spec.position[1], spec.position[2]);
        var thumbDir = new THREE.Vector3(
            spec.thumb_direction[0], spec.thumb_direction[1], spec.thumb_direction[2]
        ).normalize();
        var defaultUp = new THREE.Vector3(0, 1, 0);
        var quat = new THREE.Quaternion();
        quat.setFromUnitVectors(defaultUp, thumbDir);
        grp.setRotationFromQuaternion(quat);
        grp.userData = { elementType: 'right_hand', id: 'rhr_hand', animate_curl: !!spec.animate_curl };

        return grp;
    }

    function createCompass(spec) {
        // Compass disk + N/S needle. The needle's local +Z is the "north
        // pointer". When animate_swing is enabled, applyState rotates the
        // needle group toward the local B-field direction over time.
        var grp = new THREE.Group();
        var R = spec.radius || 0.45;

        // Disk base — flat cylinder lying in XZ plane
        var diskGeo = new THREE.CylinderGeometry(R, R, 0.04, 32);
        var diskMat = new THREE.MeshPhongMaterial({
            color: 0xEEEEEE, transparent: true, opacity: 0.55, shininess: 60
        });
        var disk = new THREE.Mesh(diskGeo, diskMat);
        grp.add(disk);

        // Disk rim
        var rimGeo = new THREE.TorusGeometry(R, 0.025, 8, 32);
        var rimMat = new THREE.MeshPhongMaterial({ color: 0x4A4A4A });
        var rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = Math.PI / 2;
        grp.add(rim);

        // Needle group — rotated as a whole for the swing animation
        var needleGrp = new THREE.Group();

        // North half — red, points +Z by default
        var northGeo = new THREE.BoxGeometry(R * 0.18, 0.06, R * 0.85);
        var northMat = new THREE.MeshPhongMaterial({
            color: 0xEF5350, emissive: 0x661111, emissiveIntensity: 0.4
        });
        var north = new THREE.Mesh(northGeo, northMat);
        north.position.set(0, 0.045, R * 0.42);
        needleGrp.add(north);

        // South half — white/grey, points -Z
        var southGeo = new THREE.BoxGeometry(R * 0.18, 0.06, R * 0.85);
        var southMat = new THREE.MeshPhongMaterial({ color: 0xE0E0E0 });
        var south = new THREE.Mesh(southGeo, southMat);
        south.position.set(0, 0.045, -R * 0.42);
        needleGrp.add(south);

        // Tiny pivot dot
        var pivotGeo = new THREE.SphereGeometry(0.05, 8, 8);
        var pivotMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
        var pivot = new THREE.Mesh(pivotGeo, pivotMat);
        pivot.position.set(0, 0.05, 0);
        needleGrp.add(pivot);

        // N/S labels on top
        var nMarkGeo = new THREE.SphereGeometry(0.04, 8, 8);
        var nMarkMat = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF, emissive: 0xFFFFFF, emissiveIntensity: 0.7
        });
        var nMark = new THREE.Mesh(nMarkGeo, nMarkMat);
        nMark.position.set(0, 0.07, R * 0.85);
        needleGrp.add(nMark);

        grp.add(needleGrp);
        grp.userData = {
            elementType: 'compass',
            id: 'compass_oersted',
            animate_swing: !!spec.animate_swing,
            swing_delay_ms: spec.swing_delay_ms || 1500,
            position_world: [spec.position[0], spec.position[1], spec.position[2]],
            needleGroup: needleGrp,
            target_angle: 0,
            current_angle: 0,
            swing_started_at: -1
        };
        grp.position.set(spec.position[0], spec.position[1], spec.position[2]);
        return grp;
    }

    function createHighlightedPoint(spec) {
        // A glowing point P with optional label-anchor sphere for callouts.
        var grp = new THREE.Group();
        var R = spec.radius || 0.10;
        var color = spec.color || '#FFF176';
        var geo = new THREE.SphereGeometry(R, 16, 16);
        var mat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor(color),
            emissive: hexToThreeColor(color),
            emissiveIntensity: 0.9,
            transparent: true,
            opacity: 0.9
        });
        var dot = new THREE.Mesh(geo, mat);
        grp.add(dot);

        // Outer glow halo
        var haloGeo = new THREE.SphereGeometry(R * 1.8, 16, 16);
        var haloMat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor(color),
            transparent: true,
            opacity: 0.18,
            emissive: hexToThreeColor(color),
            emissiveIntensity: 0.4
        });
        var halo = new THREE.Mesh(haloGeo, haloMat);
        grp.add(halo);

        grp.position.set(spec.position[0], spec.position[1], spec.position[2]);
        grp.userData = {
            elementType: 'highlighted_point',
            id: 'hp_point',
            label: spec.label || '',
            pulse: true
        };
        return grp;
    }

    // Track current dynamic extras so applyState can clear them between states
    var dynamicExtras = [];

    function clearDynamicExtras() {
        for (var i = 0; i < dynamicExtras.length; i++) {
            var obj = dynamicExtras[i];
            scene.remove(obj);
            // Sub-meshes share materials w/ scene objects; safe to skip dispose here
        }
        dynamicExtras = [];
        // Hide the 2D right-hand SVG overlay between states (session-60 polish: switched
        // from a 3D Three.js hand mesh that read as ambiguous geometry to a clear 2D SVG
        // pinned to the iframe corner — see #rhr_overlay in assembleField3DHtml).
        var rhrEl = document.getElementById("rhr_overlay");
        if (rhrEl) rhrEl.style.display = "none";
    }

    function applyExtras(extras) {
        if (!extras) return;
        if (extras.right_hand) {
            // Show the 2D SVG overlay pinned to the iframe corner instead of building
            // a 3D Three.js hand. The 3D mesh (createRightHand) is kept for backwards
            // compatibility but no longer rendered — the overlay is the canonical UX.
            // Case 'A' shows only the thumb-up section; case 'B' shows only the
            // thumb-down section; omitted/'both' shows both stacked.
            var rhrEl = document.getElementById("rhr_overlay");
            if (rhrEl) {
                rhrEl.classList.remove("rhr-show-a-only", "rhr-show-b-only");
                if (extras.right_hand.case === "A") rhrEl.classList.add("rhr-show-a-only");
                else if (extras.right_hand.case === "B") rhrEl.classList.add("rhr-show-b-only");
                rhrEl.style.display = "block";
            }
        }
        if (extras.compass) {
            var compass = createCompass(extras.compass);
            scene.add(compass);
            dynamicExtras.push(compass);
            compass.userData.swing_started_at = performance.now() + (compass.userData.swing_delay_ms || 0);
        }
        if (extras.highlighted_point) {
            var hp = createHighlightedPoint(extras.highlighted_point);
            scene.add(hp);
            dynamicExtras.push(hp);
        }
    }

    function createCoilGeometry(turns, radius, axis, length) {
        var group = new THREE.Group();
        var tubeRadius = 0.03;
        for (var t = 0; t < turns; t++) {
            var points = [];
            for (var a = 0; a <= 64; a++) {
                var angle = (a / 64) * Math.PI * 2;
                var x = radius * Math.cos(angle);
                var y = radius * Math.sin(angle);
                var z = (length || 3) * ((t + a / 64) / turns - 0.5);
                points.push(new THREE.Vector3(x, y, z));
            }
            var curve = new THREE.CatmullRomCurve3(points);
            var geo = new THREE.TubeGeometry(curve, 64, tubeRadius, 8, false);
            var mat = new THREE.MeshPhongMaterial({ color: 0xFFAB40 });
            group.add(new THREE.Mesh(geo, mat));
        }
        // Align coil to axis
        if (axis && (axis[0] !== 0 || axis[2] !== 0)) {
            var dir = new THREE.Vector3(axis[0], axis[1], axis[2]).normalize();
            var up = new THREE.Vector3(0, 0, 1);
            var q = new THREE.Quaternion();
            q.setFromUnitVectors(up, dir);
            group.setRotationFromQuaternion(q);
        }
        return group;
    }

    // ── Scenario builders ─────────────────────────────────────────────────

    function buildPointChargeField(charge, lineCount) {
        var color = charge.sign > 0
            ? (config.field_lines.color_positive || "#EF5350")
            : (config.field_lines.color_negative || "#42A5F5");
        var chargeColor = charge.color || color;

        // Charge sphere
        var sphere = createChargeSphere(charge.position, chargeColor, 0.3);
        sphere.userData = { elementType: "charge", id: charge.id };
        addToScene(sphere);

        // Field lines — radial distribution using golden angle
        var goldenAngle = Math.PI * (3 - Math.sqrt(5));
        for (var i = 0; i < lineCount; i++) {
            var y = 1 - (i / (lineCount - 1)) * 2;
            var radiusAtY = Math.sqrt(1 - y * y);
            var theta = goldenAngle * i;

            var dx = radiusAtY * Math.cos(theta);
            var dy = y;
            var dz = radiusAtY * Math.sin(theta);

            var points = [];
            var arrowPoints = [];
            var numSegments = 20;
            var lineLength = 3.5;
            for (var s = 0; s <= numSegments; s++) {
                var t = s / numSegments;
                var r = 0.35 + t * lineLength;
                var dir = charge.sign > 0 ? 1 : -1;
                points.push([
                    charge.position[0] + dx * r * dir,
                    charge.position[1] + dy * r * dir,
                    charge.position[2] + dz * r * dir
                ]);

                // Arrows at spacing intervals
                if (s > 0 && s % config.field_lines.arrow_spacing === 0) {
                    var prevIdx = s - 1;
                    arrowPoints.push({
                        pos: points[s],
                        dir: [
                            points[s][0] - points[prevIdx][0],
                            points[s][1] - points[prevIdx][1],
                            points[s][2] - points[prevIdx][2]
                        ]
                    });
                }
            }

            var tube = createTubeLine(points, color, 0.02);
            if (tube) {
                tube.userData = { elementType: "field_line", id: "fl_" + charge.id + "_" + i };
                addToScene(tube);
            }

            for (var a = 0; a < arrowPoints.length; a++) {
                var arrow = createArrowHead(arrowPoints[a].pos, arrowPoints[a].dir, color);
                arrow.userData = { elementType: "arrow", id: "arr_" + charge.id + "_" + i + "_" + a };
                addToScene(arrow);
            }
        }
    }

    function buildDipoleField(posCharge, negCharge, lineCount) {
        // Draw both charge spheres
        var posColor = posCharge.color || config.field_lines.color_positive || "#EF5350";
        var negColor = negCharge.color || config.field_lines.color_negative || "#42A5F5";

        var posSphere = createChargeSphere(posCharge.position, posColor, 0.3);
        posSphere.userData = { elementType: "charge", id: posCharge.id };
        addToScene(posSphere);

        var negSphere = createChargeSphere(negCharge.position, negColor, 0.3);
        negSphere.userData = { elementType: "charge", id: negCharge.id };
        addToScene(negSphere);

        // Curved field lines from + to -
        var p1 = posCharge.position;
        var p2 = negCharge.position;
        var midX = (p1[0] + p2[0]) / 2;
        var midY = (p1[1] + p2[1]) / 2;
        var midZ = (p1[2] + p2[2]) / 2;

        var goldenAngle = Math.PI * (3 - Math.sqrt(5));
        for (var i = 0; i < lineCount; i++) {
            var frac = 1 - (i / (lineCount - 1)) * 2;
            var radiusAtFrac = Math.sqrt(Math.max(0, 1 - frac * frac));
            var theta = goldenAngle * i;

            var bulge = 1.5 + Math.abs(frac) * 1.5;
            var offX = radiusAtFrac * Math.cos(theta) * bulge;
            var offY = frac * bulge;
            var offZ = radiusAtFrac * Math.sin(theta) * bulge;

            var points = [];
            var segments = 24;
            for (var s = 0; s <= segments; s++) {
                var t = s / segments;
                var cx = p1[0] * (1 - t) + p2[0] * t;
                var cy = p1[1] * (1 - t) + p2[1] * t;
                var cz = p1[2] * (1 - t) + p2[2] * t;
                var blend = Math.sin(t * Math.PI);
                points.push([cx + offX * blend, cy + offY * blend, cz + offZ * blend]);
            }

            var flColor = config.field_lines.color_positive || "#EF5350";
            var tube = createTubeLine(points, flColor, 0.018);
            if (tube) {
                tube.userData = { elementType: "field_line", id: "fl_dipole_" + i };
                addToScene(tube);
            }

            // Arrow at midpoint
            var midIdx = Math.floor(segments / 2);
            if (midIdx > 0 && midIdx < points.length) {
                var arrowDir = [
                    points[midIdx][0] - points[midIdx - 1][0],
                    points[midIdx][1] - points[midIdx - 1][1],
                    points[midIdx][2] - points[midIdx - 1][2]
                ];
                var arrowMesh = createArrowHead(points[midIdx], arrowDir, flColor);
                arrowMesh.userData = { elementType: "arrow", id: "arr_dipole_" + i };
                addToScene(arrowMesh);
            }
        }
    }

    function buildParallelPlatesField(config_unused) {
        var sep = 3;
        var plateW = 3, plateH = 3;
        var posColor = config.pvl_colors ? config.pvl_colors.positive : "#EF5350";
        var negColor = config.pvl_colors ? config.pvl_colors.negative : "#42A5F5";
        var flColor = config.field_lines.color_positive || "#FFF176";

        // Positive plate
        var posPlate = createPlate(plateW, plateH, [-sep/2, 0, 0], posColor || "#EF5350");
        posPlate.userData = { elementType: "plate_positive", id: "plate_pos" };
        addToScene(posPlate);

        // Negative plate
        var negPlate = createPlate(plateW, plateH, [sep/2, 0, 0], negColor || "#42A5F5");
        negPlate.userData = { elementType: "plate_negative", id: "plate_neg" };
        addToScene(negPlate);

        // + and - labels (using small spheres as markers)
        var plusMarker = createChargeSphere([-sep/2 - 0.15, plateH/2 + 0.3, 0], posColor || "#EF5350", 0.12);
        plusMarker.userData = { elementType: "label", id: "label_plus" };
        addToScene(plusMarker);
        var minusMarker = createChargeSphere([sep/2 + 0.15, plateH/2 + 0.3, 0], negColor || "#42A5F5", 0.12);
        minusMarker.userData = { elementType: "label", id: "label_minus" };
        addToScene(minusMarker);

        // Uniform field lines between plates
        var gridN = 4;
        for (var iy = 0; iy < gridN; iy++) {
            for (var iz = 0; iz < gridN; iz++) {
                var y = ((iy + 0.5) / gridN - 0.5) * (plateH * 0.7);
                var z = ((iz + 0.5) / gridN - 0.5) * (plateW * 0.7);
                var points = [];
                for (var s = 0; s <= 12; s++) {
                    var t = s / 12;
                    points.push([-sep/2 + 0.1 + t * (sep - 0.2), y, z]);
                }
                var tube = createTubeLine(points, flColor, 0.02);
                if (tube) {
                    tube.userData = { elementType: "field_line", id: "fl_plate_" + iy + "_" + iz };
                    addToScene(tube);
                }
                // Arrow at midpoint
                var mid = Math.floor(12 / 2);
                var arrowMesh = createArrowHead(points[mid], [1, 0, 0], flColor);
                arrowMesh.userData = { elementType: "arrow", id: "arr_plate_" + iy + "_" + iz };
                addToScene(arrowMesh);
            }
        }
    }

    function buildSolenoidField(config_unused) {
        var coilConf = config.coil || { turns: 8, radius: 0.8, axis: [0, 0, 1] };
        var solenoidLength = 4;
        var flColor = config.field_lines.color_positive || "#66BB6A";
        var lineCount = config.field_lines.count || 8;

        // Coil geometry
        var coilGroup = createCoilGeometry(coilConf.turns, coilConf.radius, coilConf.axis, solenoidLength);
        coilGroup.userData = { elementType: "coil", id: "solenoid_coil" };
        addToScene(coilGroup);

        // Internal field lines — dense, parallel to axis
        var internalLines = Math.max(4, Math.floor(lineCount * 0.6));
        for (var i = 0; i < internalLines; i++) {
            var angle = (i / internalLines) * Math.PI * 2;
            var r = coilConf.radius * 0.5;
            var x = r * Math.cos(angle);
            var y = r * Math.sin(angle);
            var points = [];
            for (var s = 0; s <= 16; s++) {
                var t = s / 16;
                points.push([x, y, -solenoidLength / 2 + t * solenoidLength]);
            }
            var tube = createTubeLine(points, flColor, 0.025);
            if (tube) {
                tube.userData = { elementType: "field_line_internal", id: "fl_int_" + i };
                addToScene(tube);
            }
            var mid = 8;
            var arrowMesh = createArrowHead(points[mid], [0, 0, 1], flColor);
            arrowMesh.userData = { elementType: "arrow", id: "arr_int_" + i };
            addToScene(arrowMesh);
        }

        // External field lines — curved loops from one end back to the other
        var externalLines = Math.max(3, Math.floor(lineCount * 0.4));
        for (var i = 0; i < externalLines; i++) {
            var angle = (i / externalLines) * Math.PI * 2;
            var bulge = 1.5 + (i / externalLines) * 1.5;
            var points = [];
            for (var s = 0; s <= 24; s++) {
                var t = s / 24;
                var z = -solenoidLength / 2 + t * solenoidLength;
                var blend = Math.sin(t * Math.PI);
                var extR = coilConf.radius + bulge * blend;
                points.push([extR * Math.cos(angle), extR * Math.sin(angle), z]);
            }
            var tube = createTubeLine(points, flColor, 0.015);
            if (tube) {
                tube.userData = { elementType: "field_line_external", id: "fl_ext_" + i };
                addToScene(tube);
            }
        }
    }

    function buildBarMagnetField(config_unused) {
        var magnetLength = 2;
        var flColor = config.field_lines.color_positive || "#66BB6A";
        var lineCount = config.field_lines.count || 10;
        var posColor = config.pvl_colors ? config.pvl_colors.positive : "#EF5350";
        var negColor = config.pvl_colors ? config.pvl_colors.negative : "#42A5F5";

        // Bar magnet body — two halves (N=red, S=blue)
        var nGeo = new THREE.BoxGeometry(0.6, 0.6, magnetLength / 2);
        var nMat = new THREE.MeshPhongMaterial({ color: hexToThreeColor(posColor || "#EF5350") });
        var nMesh = new THREE.Mesh(nGeo, nMat);
        nMesh.position.set(0, 0, magnetLength / 4);
        nMesh.userData = { elementType: "magnet_north", id: "magnet_n" };
        addToScene(nMesh);

        var sGeo = new THREE.BoxGeometry(0.6, 0.6, magnetLength / 2);
        var sMat = new THREE.MeshPhongMaterial({ color: hexToThreeColor(negColor || "#42A5F5") });
        var sMesh = new THREE.Mesh(sGeo, sMat);
        sMesh.position.set(0, 0, -magnetLength / 4);
        sMesh.userData = { elementType: "magnet_south", id: "magnet_s" };
        addToScene(sMesh);

        // External field lines — N to S loops
        var goldenAngle = Math.PI * (3 - Math.sqrt(5));
        for (var i = 0; i < lineCount; i++) {
            var frac = 1 - (i / (lineCount - 1)) * 2;
            var radiusAtFrac = Math.sqrt(Math.max(0, 1 - frac * frac));
            var theta = goldenAngle * i;

            var bulge = 1.2 + Math.abs(frac) * 1.8;
            var offX = radiusAtFrac * Math.cos(theta) * bulge;
            var offY = frac * bulge;

            var points = [];
            var segments = 28;
            var nPos = [0, 0, magnetLength / 2];
            var sPos = [0, 0, -magnetLength / 2];
            for (var s = 0; s <= segments; s++) {
                var t = s / segments;
                var cz = nPos[2] * (1 - t) + sPos[2] * t;
                var blend = Math.sin(t * Math.PI);
                points.push([offX * blend, offY * blend, cz]);
            }

            var tube = createTubeLine(points, flColor, 0.018);
            if (tube) {
                tube.userData = { elementType: "field_line", id: "fl_mag_" + i };
                addToScene(tube);
            }

            // Arrow at 1/3 point
            var aIdx = Math.floor(segments / 3);
            if (aIdx > 0) {
                var arrowDir = [
                    points[aIdx][0] - points[aIdx-1][0],
                    points[aIdx][1] - points[aIdx-1][1],
                    points[aIdx][2] - points[aIdx-1][2]
                ];
                var arrowMesh = createArrowHead(points[aIdx], arrowDir, flColor);
                arrowMesh.userData = { elementType: "arrow", id: "arr_mag_" + i };
                addToScene(arrowMesh);
            }
        }
    }

    function buildStraightWireField(config_unused) {
        var wireColor = (config.current && config.current.wire_color) ? config.current.wire_color : "#FFAB40";
        var flColor = config.field_lines.color_positive || "#66BB6A";
        var lineCount = config.field_lines.count || 6;

        // Vertical wire
        var wire = createWire([0, -3, 0], [0, 3, 0], wireColor, 0.08);
        wire.userData = { elementType: "wire", id: "wire_main" };
        addToScene(wire);

        // Current direction arrow on wire (head sits near top of wire by default;
        // hidden / flipped per state via the current_direction_indicator pipeline)
        var currArrow = createArrowHead([0, 1.5, 0], [0, 1, 0], wireColor);
        currArrow.userData = { elementType: "current_arrow", id: "curr_arr" };
        addToScene(currArrow);

        // Conventional-current flow visualization: 6 yellow dots evenly spaced
        // along the wire. animate() drives their Y-position based on the current
        // state's current_direction_indicator ('up' | 'down'). Hidden when the
        // state has no indicator set.
        var dotCount = 6;
        for (var di = 0; di < dotCount; di++) {
            var dotGeo = new THREE.SphereGeometry(0.10, 14, 14);
            var dotMat = new THREE.MeshPhongMaterial({
                color: 0xFFD54F, emissive: 0xFFAB00, emissiveIntensity: 0.7
            });
            var dot = new THREE.Mesh(dotGeo, dotMat);
            dot.userData = { elementType: "current_dot", id: "cdot_" + di, dotIndex: di, dotCount: dotCount };
            dot.position.set(0, -2.5 + (di / dotCount) * 5, 0);
            dot.visible = false; // applyState turns this on per-state
            addToScene(dot);
        }

        // Concentric circular field lines at different heights and radii.
        // Each tube is static (closed loop — rotation is invisible), each arrow
        // gets flow metadata so animate() can orbit it around the wire when the
        // state requests rotation.
        var heights = [-1.5, 0, 1.5];
        for (var h = 0; h < heights.length; h++) {
            for (var ri = 0; ri < lineCount; ri++) {
                var radius = 0.6 + ri * 0.5;
                var points = [];
                var segments = 48;
                for (var s = 0; s <= segments; s++) {
                    var angle = (s / segments) * Math.PI * 2;
                    points.push([radius * Math.cos(angle), heights[h], radius * Math.sin(angle)]);
                }
                var tube = createTubeLine(points, flColor, 0.015);
                if (tube) {
                    tube.userData = { elementType: "field_line", id: "fl_wire_" + h + "_" + ri };
                    addToScene(tube);
                }
                // Arrow at quarter circle. Stored flow metadata enables orbital
                // animation in animate(): the arrow walks around the circle of
                // radius 'radius' at height heights[h], maintaining tangent
                // orientation (sense flips with field_rotation_direction).
                var qIdx = Math.floor(segments / 4);
                if (qIdx > 0) {
                    var arrowDir = [
                        points[qIdx][0] - points[qIdx-1][0],
                        points[qIdx][1] - points[qIdx-1][1],
                        points[qIdx][2] - points[qIdx-1][2]
                    ];
                    var arrowMesh = createArrowHead(points[qIdx], arrowDir, flColor);
                    arrowMesh.userData = {
                        elementType: "arrow",
                        id: "arr_wire_" + h + "_" + ri,
                        flowRadius: radius,
                        flowHeight: heights[h],
                        flowAngleOffset: Math.PI / 2 // initial position = quarter circle (matches qIdx)
                    };
                    addToScene(arrowMesh);
                }
            }
        }
    }

    function buildChangingFluxField(config_unused) {
        var coilConf = config.coil || { turns: 5, radius: 1.0, axis: [0, 0, 1] };
        var flColor = config.field_lines.color_positive || "#66BB6A";

        // Coil
        var coilGroup = createCoilGeometry(coilConf.turns, coilConf.radius, coilConf.axis, 1.5);
        coilGroup.position.set(0, 0, 0);
        coilGroup.userData = { elementType: "coil", id: "induction_coil" };
        addToScene(coilGroup);

        // Bar magnet (moving)
        var magnetGeo = new THREE.BoxGeometry(0.4, 0.4, 1.5);
        var magnetMat = new THREE.MeshPhongMaterial({ color: 0xEF5350 });
        var magnetMesh = new THREE.Mesh(magnetGeo, magnetMat);
        magnetMesh.position.set(0, 0, 3);
        magnetMesh.userData = { elementType: "magnet", id: "moving_magnet" };
        addToScene(magnetMesh);

        // S pole half
        var sHalfGeo = new THREE.BoxGeometry(0.41, 0.41, 0.75);
        var sHalfMat = new THREE.MeshPhongMaterial({ color: 0x42A5F5 });
        var sHalfMesh = new THREE.Mesh(sHalfGeo, sHalfMat);
        sHalfMesh.position.set(0, 0, 3 - 0.375);
        sHalfMesh.userData = { elementType: "magnet_south_half", id: "magnet_s_half" };
        addToScene(sHalfMesh);

        // Field lines from magnet
        for (var i = 0; i < 6; i++) {
            var angle = (i / 6) * Math.PI * 2;
            var r = 0.3;
            var points = [];
            for (var s = 0; s <= 16; s++) {
                var t = s / 16;
                var z = 3.75 - t * 5;
                var blend = Math.sin(t * Math.PI);
                points.push([r * Math.cos(angle) * (1 + blend), r * Math.sin(angle) * (1 + blend), z]);
            }
            var tube = createTubeLine(points, flColor, 0.015);
            if (tube) {
                tube.userData = { elementType: "field_line", id: "fl_flux_" + i };
                addToScene(tube);
            }
        }

        // EMF indicator (small glow sphere at coil center)
        var emfGeo = new THREE.SphereGeometry(0.15, 16, 16);
        var emfMat = new THREE.MeshPhongMaterial({
            color: 0xFFF176,
            emissive: 0xFFF176,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.7
        });
        var emfMesh = new THREE.Mesh(emfGeo, emfMat);
        emfMesh.position.set(0, 0, 0);
        emfMesh.userData = { elementType: "emf_indicator", id: "emf_glow" };
        addToScene(emfMesh);
    }

    // ── Equipotential surfaces ────────────────────────────────────────────
    function buildEquipotentialSurfaces() {
        if (!config.equipotential || !config.equipotential.show) return;
        var nSurfaces = config.equipotential.surfaces || 3;
        var eqColor = config.equipotential.color || "#4FC3F7";
        var eqOpacity = config.equipotential.opacity || 0.12;
        for (var i = 0; i < nSurfaces; i++) {
            var radius = 1.0 + i * 1.2;
            var surf = createEquipotentialSurface(radius, eqColor, eqOpacity);
            surf.userData = { elementType: "equipotential", id: "eq_" + i };
            addToScene(surf);
        }
    }

    // ── Build scenario ────────────────────────────────────────────────────
    function buildScenario() {
        clearScene();

        var scenario = config.scenario_type;
        var charges = config.charges || [];

        switch (scenario) {
            case "point_charge_positive":
            case "point_charge_negative":
                var charge = charges[0] || {
                    id: "q1", sign: scenario === "point_charge_positive" ? 1 : -1,
                    magnitude: 1, position: [0, 0, 0],
                    label: scenario === "point_charge_positive" ? "+q" : "-q",
                    color: scenario === "point_charge_positive" ? "#EF5350" : "#42A5F5"
                };
                buildPointChargeField(charge, config.field_lines.count || 12);
                buildEquipotentialSurfaces();
                break;

            case "dipole":
                var posCharge = charges.find(function(c) { return c.sign > 0; }) || {
                    id: "q_pos", sign: 1, magnitude: 1, position: [-1.5, 0, 0], label: "+q", color: "#EF5350"
                };
                var negCharge = charges.find(function(c) { return c.sign < 0; }) || {
                    id: "q_neg", sign: -1, magnitude: 1, position: [1.5, 0, 0], label: "-q", color: "#42A5F5"
                };
                buildDipoleField(posCharge, negCharge, config.field_lines.count || 10);
                buildEquipotentialSurfaces();
                break;

            case "parallel_plates":
                buildParallelPlatesField();
                break;

            case "solenoid_field":
                buildSolenoidField();
                break;

            case "bar_magnet":
                buildBarMagnetField();
                break;

            case "straight_wire_current":
                buildStraightWireField();
                break;

            case "changing_flux":
                buildChangingFluxField();
                break;

            default:
                // Fallback: show a single positive charge
                buildPointChargeField(
                    { id: "q1", sign: 1, magnitude: 1, position: [0,0,0], label: "+q", color: "#EF5350" },
                    config.field_lines.count || 12
                );
        }

        applyState(PM_currentState);
    }

    // ── State management ──────────────────────────────────────────────────
    function applyState(stateId) {
        PM_currentState = stateId;
        var stateDef = config.states[stateId];
        if (!stateDef) return;

        // Update caption
        var captionEl = document.getElementById("caption");
        if (captionEl) captionEl.textContent = stateDef.caption || "";

        // Visibility — show only elements in visible_elements
        var vis = stateDef.visible_elements || [];
        var showAll = vis.length === 0 || vis.indexOf("all") >= 0;

        for (var i = 0; i < sceneObjects.length; i++) {
            var obj = sceneObjects[i];
            var ud = obj.userData;
            if (!ud || !ud.elementType) { obj.visible = true; continue; }

            if (showAll) {
                obj.visible = true;
            } else {
                // Check if any visible_elements token matches
                var match = false;
                for (var v = 0; v < vis.length; v++) {
                    if (ud.elementType === vis[v] || ud.id === vis[v] ||
                        ud.elementType.indexOf(vis[v]) >= 0 || (ud.id && ud.id.indexOf(vis[v]) >= 0)) {
                        match = true; break;
                    }
                }
                obj.visible = match;
            }
        }

        // Camera animation
        if (stateDef.camera_position) {
            animateCameraTo(stateDef.camera_position);
        }

        // Premium extras (right hand, compass, highlighted point)
        clearDynamicExtras();
        applyExtras(stateDef.extras);

        // Sliders + formula overlay visibility
        var slidersEl = document.getElementById("sliders");
        if (slidersEl) slidersEl.style.display = stateDef.show_sliders ? "block" : "none";

        var formulaEl = document.getElementById("formula_overlay");
        if (formulaEl) {
            if (stateDef.formula_overlay) {
                formulaEl.textContent = stateDef.formula_overlay;
                formulaEl.style.display = "block";
            } else {
                formulaEl.style.display = "none";
            }
        }

        // If sliders are shown for this state, refresh the field-line visual
        // feedback so the current slider values are reflected immediately.
        if (stateDef.show_sliders) refreshSliderVisuals();

        // Update legend
        updateLegend(stateDef);
    }

    function updateLegend(stateDef) {
        var legendEl = document.getElementById("legend");
        if (!legendEl) return;

        var scenario = config.scenario_type;
        var lines = [];
        lines.push("<b>" + (stateDef.label || PM_currentState) + "</b>");

        if (scenario.indexOf("charge") >= 0 || scenario === "dipole" || scenario === "gauss") {
            lines.push("\\u26aa Red sphere = +q");
            lines.push("\\u26aa Blue sphere = -q");
            lines.push("\\u26aa Lines = E field direction");
        } else if (scenario.indexOf("magnet") >= 0 || scenario === "solenoid_field") {
            lines.push("\\u26aa Red = N pole");
            lines.push("\\u26aa Blue = S pole");
            lines.push("\\u26aa Lines = B field");
        } else if (scenario === "straight_wire_current") {
            lines.push("\\u26aa Wire carries current I");
            lines.push("\\u26aa Circles = B field");
        } else if (scenario === "parallel_plates") {
            lines.push("\\u26aa Red plate = +");
            lines.push("\\u26aa Blue plate = \\u2212");
            lines.push("\\u26aa Lines = uniform E");
        } else if (scenario === "changing_flux") {
            lines.push("\\u26aa Coil = conductor");
            lines.push("\\u26aa Block = magnet");
            lines.push("\\u26aa Glow = induced EMF");
        }

        lines.push("<i>Drag to rotate \\u2022 Scroll to zoom</i>");
        legendEl.innerHTML = lines.join("<br>");
    }

    // ── Slider wiring (I and r — interactive in show_sliders states) ──────
    var MU_0 = 4 * Math.PI * 1e-7;

    function refreshSliderVisuals() {
        var slidersEl = document.getElementById("sliders");
        if (!slidersEl || slidersEl.style.display === "none") return;

        var iSlider = document.getElementById("i_slider");
        var rSlider = document.getElementById("r_slider");
        if (!iSlider || !rSlider) return;

        var I = parseFloat(iSlider.value);
        var r_cm = parseFloat(rSlider.value);
        var r_m = r_cm / 100;

        var B = (MU_0 * I) / (2 * Math.PI * r_m);
        var B_uT = B * 1e6;

        var iValEl = document.getElementById("i_val");
        var rValEl = document.getElementById("r_val");
        var bReadoutEl = document.getElementById("b_readout");
        if (iValEl) iValEl.textContent = I.toFixed(1);
        if (rValEl) rValEl.textContent = r_cm.toFixed(0);
        if (bReadoutEl) bReadoutEl.innerHTML = "B = " + B_uT.toFixed(1) + " μT";

        // Visual feedback: scale opacity by I (more current = brighter rings)
        // and highlight the ring closest to the slider's r.
        // Renderer builds 6 circles per height at radii 0.6, 1.1, 1.6, 2.1, 2.6, 3.1
        // (scene units). Map slider r (in m, 0.02 - 0.30) to scene units.
        var SCENE_R_MIN = 0.6, SCENE_R_MAX = 3.1;
        var sliderRMin = 0.02, sliderRMax = 0.30;
        var sceneR = SCENE_R_MIN + ((r_m - sliderRMin) / (sliderRMax - sliderRMin)) * (SCENE_R_MAX - SCENE_R_MIN);
        var closestRi = Math.round((sceneR - SCENE_R_MIN) / 0.5);
        if (closestRi < 0) closestRi = 0;
        if (closestRi > 5) closestRi = 5;

        var brightness = Math.min(1, Math.log(1 + I) / Math.log(21));
        var baseOpacity = 0.35 + brightness * 0.55;

        for (var i = 0; i < sceneObjects.length; i++) {
            var obj = sceneObjects[i];
            if (!obj.userData || !obj.material) continue;
            var et = obj.userData.elementType;
            var id = obj.userData.id || "";
            if (et === "field_line" || et === "arrow") {
                // Reset to default field-line color first
                if (obj.material.color && obj.material.color.setHex) {
                    obj.material.color.setHex(0x66BB6A);
                }
                obj.material.opacity = baseOpacity;
                // Highlight if this ring/arrow is at the closest radius
                var endsWithRi = id.endsWith("_" + closestRi);
                if (endsWithRi) {
                    if (obj.material.color && obj.material.color.setHex) {
                        obj.material.color.setHex(0xFFEB3B); // yellow highlight
                    }
                    obj.material.opacity = 1.0;
                }
            }
        }
    }

    function setupSliders() {
        var iSlider = document.getElementById("i_slider");
        var rSlider = document.getElementById("r_slider");
        if (!iSlider || !rSlider) return;

        // Apply slider_controls config to the input ranges if provided
        if (config.slider_controls) {
            if (config.slider_controls.I) {
                iSlider.min = String(config.slider_controls.I.min);
                iSlider.max = String(config.slider_controls.I.max);
                iSlider.step = String(config.slider_controls.I.step);
                iSlider.value = String(config.slider_controls.I.default);
            }
            if (config.slider_controls.r) {
                // r slider in cm — internal unit conversion handled in refresh
                rSlider.min = String(config.slider_controls.r.min * 100);
                rSlider.max = String(config.slider_controls.r.max * 100);
                rSlider.step = String(config.slider_controls.r.step * 100);
                rSlider.value = String(config.slider_controls.r.default * 100);
            }
        }

        iSlider.addEventListener("input", refreshSliderVisuals);
        rSlider.addEventListener("input", refreshSliderVisuals);
    }

    // ── Animation loop ────────────────────────────────────────────────────
    var time = 0;
    function animate() {
        animationId = requestAnimationFrame(animate);
        time += 0.016;

        lerpSpherical();

        // Animate dynamic extras (compass swing, hand pulse, point pulse)
        for (var di = 0; di < dynamicExtras.length; di++) {
            var dx = dynamicExtras[di];
            var dud = dx.userData;
            if (!dud) continue;
            if (dud.elementType === "compass" && dud.animate_swing && dud.needleGroup) {
                // Compute the physics-correct equilibrium direction the needle
                // should swing to:
                //   - For straight_wire_current: B at the compass position
                //     follows Biot-Savart's right-hand rule, B_hat = I_hat × r_hat,
                //     where r_hat is the perpendicular unit vector from the wire
                //     (Y-axis) to the compass. Sign of I from the active state's
                //     current_direction_indicator ('up' = +Y, 'down' = -Y).
                //   - For other scenarios, fall back to the legacy hardcoded -90°
                //     (matches Oersted's classic east-deflection in earlier states).
                if (dud.target_angle_rad == null) {
                    var stateDefC = config.states[PM_currentState] || {};
                    var iSign = (stateDefC.current_direction_indicator === "down") ? -1 :
                                (stateDefC.current_direction_indicator === "up") ? 1 : 1;
                    if (config.scenario_type === "straight_wire_current") {
                        var pos = dud.position_world || [0, 0, 0];
                        var rPerp = new THREE.Vector3(pos[0], 0, pos[2]);
                        if (rPerp.length() > 0.001) {
                            rPerp.normalize();
                            var ihat = new THREE.Vector3(0, iSign, 0);
                            var bDir = new THREE.Vector3().crossVectors(ihat, rPerp).normalize();
                            // Default needle "north" is +Z. atan2(x, z) gives the
                            // signed Y-axis rotation angle that takes +Z to bDir.
                            dud.target_angle_rad = Math.atan2(bDir.x, bDir.z);
                        } else {
                            dud.target_angle_rad = -Math.PI / 2;
                        }
                    } else {
                        dud.target_angle_rad = -Math.PI / 2; // legacy default
                    }
                }
                var now = performance.now();
                if (dud.swing_started_at > 0 && now >= dud.swing_started_at) {
                    var elapsed = (now - dud.swing_started_at) / 2000; // 2s sweep
                    var easeT = Math.min(1, elapsed);
                    var eased = 1 - Math.pow(1 - easeT, 3); // easeOutCubic
                    dud.current_angle = dud.target_angle_rad * eased;
                    dud.needleGroup.rotation.y = dud.current_angle;
                }
            }
            if (dud.elementType === "right_hand" && dud.animate_curl) {
                // Subtle pulse: scale fingers slightly to draw the eye
                var pulse = 1 + 0.04 * Math.sin(time * 2.5);
                for (var ci = 0; ci < dx.children.length; ci++) {
                    var ch = dx.children[ci];
                    if (ch.userData && typeof ch.userData.fingerIndex === "number") {
                        ch.scale.set(pulse, 1, pulse);
                    }
                }
            }
            if (dud.elementType === "highlighted_point" && dud.pulse) {
                var p = 1 + 0.15 * Math.sin(time * 3);
                dx.scale.set(p, p, p);
            }
        }

        // Animate moving magnet in changing_flux scenario
        var stateDef = config.states[PM_currentState];
        if (config.scenario_type === "changing_flux" && stateDef && stateDef.animate) {
            for (var i = 0; i < sceneObjects.length; i++) {
                var obj = sceneObjects[i];
                if (obj.userData && obj.userData.elementType === "magnet") {
                    obj.position.z = 3 + Math.sin(time * 1.5) * 2;
                }
                if (obj.userData && obj.userData.elementType === "magnet_south_half") {
                    obj.position.z = 3 + Math.sin(time * 1.5) * 2 - 0.375;
                }
                if (obj.userData && obj.userData.elementType === "emf_indicator") {
                    var emfIntensity = Math.abs(Math.cos(time * 1.5));
                    obj.material.emissiveIntensity = 0.2 + emfIntensity * 0.8;
                    obj.material.opacity = 0.3 + emfIntensity * 0.7;
                }
            }
        }

        // straight_wire_current scenario:
        //   1. Orbit field-line arrows around the wire's Y-axis (sense from
        //      stateDef.field_rotation_direction). Tubes are closed loops so
        //      they don't need rotation — rotating an arrow on a circle gives
        //      the visual "flow" the user sees as B-field motion.
        //   2. Animate yellow current_dot spheres along the wire to visualize
        //      the conventional current direction (stateDef.current_direction_indicator).
        if (config.scenario_type === "straight_wire_current" && stateDef) {
            var rotDirSign = stateDef.field_rotation_direction === "cw" ? -1 :
                             stateDef.field_rotation_direction === "ccw" ? 1 : 0;
            var rotRate = 0.6; // radians/second
            var curDirSign = stateDef.current_direction_indicator === "down" ? -1 :
                             stateDef.current_direction_indicator === "up" ? 1 : 0;
            var dotSpeed = 0.55; // wire-units per second along the 5-unit visible span

            for (var swi = 0; swi < sceneObjects.length; swi++) {
                var swObj = sceneObjects[swi];
                var swUd = swObj.userData;
                if (!swUd) continue;

                if (swUd.elementType === "arrow" && swUd.flowRadius != null && rotDirSign !== 0 && swObj.visible) {
                    var ang = (swUd.flowAngleOffset || 0) + time * rotRate * rotDirSign;
                    swObj.position.set(
                        swUd.flowRadius * Math.cos(ang),
                        swUd.flowHeight,
                        swUd.flowRadius * Math.sin(ang)
                    );
                    // Tangent direction along the circle, sense follows rotDirSign so
                    // arrowhead always points "downstream" of the rotation.
                    var tx = -Math.sin(ang) * rotDirSign;
                    var tz =  Math.cos(ang) * rotDirSign;
                    var qup = new THREE.Vector3(0, 1, 0);
                    var qdir = new THREE.Vector3(tx, 0, tz).normalize();
                    var arrowQuat = new THREE.Quaternion();
                    arrowQuat.setFromUnitVectors(qup, qdir);
                    swObj.setRotationFromQuaternion(arrowQuat);
                }

                if (swUd.elementType === "current_dot") {
                    if (curDirSign === 0) {
                        swObj.visible = false;
                    } else {
                        swObj.visible = true;
                        var dotCount = swUd.dotCount || 6;
                        var phase = (swUd.dotIndex || 0) / dotCount;
                        var loopT = ((time * dotSpeed) + phase) % 1;
                        // Up-flow: y goes -2.5 → +2.5; Down-flow: y goes +2.5 → -2.5
                        swObj.position.y = curDirSign > 0 ? (-2.5 + loopT * 5) : (2.5 - loopT * 5);
                    }
                }
            }
        }

        renderer.render(scene, camera);
    }

    // ── Resize ────────────────────────────────────────────────────────────
    window.addEventListener("resize", function() {
        if (!renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ── postMessage bridge ────────────────────────────────────────────────
    function setupPostMessage() {
        window.addEventListener("message", function(e) {
            var data = e.data;
            if (!data || !data.type) return;

            switch (data.type) {
                case "INIT_CONFIG":
                    if (data.config) {
                        window.SIM_CONFIG = data.config;
                        config = data.config;
                        if (!isMobile) {
                            buildScenario();
                        } else {
                            renderMobileSVG();
                        }
                    }
                    parent.postMessage({ type: "SIM_READY" }, "*");
                    break;

                case "SET_STATE":
                    var newState = data.state || data.payload;
                    if (newState && config.states[newState]) {
                        if (!isMobile) {
                            applyState(newState);
                        } else {
                            PM_currentState = newState;
                            renderMobileSVG();
                        }
                        parent.postMessage({ type: "STATE_REACHED", state: newState }, "*");
                    }
                    break;

                case "PING":
                    parent.postMessage({ type: "PONG" }, "*");
                    break;
            }
        });
    }

    // ── Mobile 2D SVG fallback ────────────────────────────────────────────
    function showMobileFallback() {
        var container = document.getElementById("mobile-fallback");
        if (container) container.style.display = "block";
        renderMobileSVG();
    }

    function renderMobileSVG() {
        var container = document.getElementById("mobile-fallback");
        if (!container) return;

        var w = window.innerWidth;
        var h = window.innerHeight;
        var cx = w / 2, cy = h / 2;
        var stateDef = config.states[PM_currentState] || {};
        var scenario = config.scenario_type;
        var textCol = config.pvl_colors ? config.pvl_colors.text : "#D4D4D8";
        var posCol = config.pvl_colors ? config.pvl_colors.positive : "#EF5350";
        var negCol = config.pvl_colors ? config.pvl_colors.negative : "#42A5F5";
        var flCol = config.field_lines ? config.field_lines.color_positive : "#FFF176";

        var svg = '<svg width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg">';
        svg += '<rect width="100%" height="100%" fill="' + (config.pvl_colors ? config.pvl_colors.background : '#0A0A1A') + '"/>';

        // Caption
        svg += '<text x="' + cx + '" y="30" fill="' + textCol + '" font-size="14" text-anchor="middle" font-family="system-ui">' + (stateDef.caption || '') + '</text>';

        if (scenario === "point_charge_positive" || scenario === "point_charge_negative") {
            var sign = scenario === "point_charge_positive" ? 1 : -1;
            var col = sign > 0 ? posCol : negCol;
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="20" fill="' + col + '"/>';
            svg += '<text x="' + cx + '" y="' + (cy + 5) + '" fill="white" font-size="16" text-anchor="middle">' + (sign > 0 ? '+' : '\\u2212') + '</text>';
            for (var i = 0; i < 8; i++) {
                var angle = (i / 8) * Math.PI * 2;
                var r1 = 30, r2 = 100;
                var x1 = cx + r1 * Math.cos(angle), y1 = cy + r1 * Math.sin(angle);
                var x2 = cx + r2 * Math.cos(angle), y2 = cy + r2 * Math.sin(angle);
                svg += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + flCol + '" stroke-width="2" opacity="0.7"/>';
                // arrowhead
                var ax = cx + (r2 - 10) * Math.cos(angle), ay = cy + (r2 - 10) * Math.sin(angle);
                svg += '<circle cx="' + ax + '" cy="' + ay + '" r="3" fill="' + flCol + '"/>';
            }
        } else if (scenario === "dipole") {
            svg += '<circle cx="' + (cx - 80) + '" cy="' + cy + '" r="18" fill="' + posCol + '"/>';
            svg += '<text x="' + (cx - 80) + '" y="' + (cy + 5) + '" fill="white" font-size="14" text-anchor="middle">+</text>';
            svg += '<circle cx="' + (cx + 80) + '" cy="' + cy + '" r="18" fill="' + negCol + '"/>';
            svg += '<text x="' + (cx + 80) + '" y="' + (cy + 5) + '" fill="white" font-size="14" text-anchor="middle">\\u2212</text>';
            for (var i = 0; i < 6; i++) {
                var offset = (i - 2.5) * 25;
                svg += '<path d="M' + (cx - 60) + ',' + (cy + offset) + ' Q' + cx + ',' + (cy + offset - 40) + ' ' + (cx + 60) + ',' + (cy + offset) + '" fill="none" stroke="' + flCol + '" stroke-width="1.5" opacity="0.6"/>';
            }
        } else if (scenario === "parallel_plates") {
            svg += '<rect x="' + (cx - 100) + '" y="' + (cy - 80) + '" width="8" height="160" fill="' + posCol + '"/>';
            svg += '<rect x="' + (cx + 92) + '" y="' + (cy - 80) + '" width="8" height="160" fill="' + negCol + '"/>';
            for (var i = 0; i < 5; i++) {
                var yy = cy - 60 + i * 30;
                svg += '<line x1="' + (cx - 88) + '" y1="' + yy + '" x2="' + (cx + 88) + '" y2="' + yy + '" stroke="' + flCol + '" stroke-width="1.5" opacity="0.6"/>';
            }
        } else {
            svg += '<text x="' + cx + '" y="' + cy + '" fill="' + textCol + '" font-size="16" text-anchor="middle">3D view — rotate on desktop</text>';
        }

        svg += '<text x="' + cx + '" y="' + (h - 15) + '" fill="' + textCol + '" font-size="11" text-anchor="middle" opacity="0.6">Rotate on desktop for full 3D</text>';
        svg += '</svg>';

        container.innerHTML = svg;

        // Also update caption
        var captionEl = document.getElementById("caption");
        if (captionEl) captionEl.textContent = stateDef.caption || "";
    }

    // ── Initialize ────────────────────────────────────────────────────────
    setupPostMessage();
    setupSliders();
    buildScenario();
    animate();

    // Fire SIM_READY after a short delay to ensure rendering is stable
    setTimeout(function() {
        parent.postMessage({ type: "SIM_READY" }, "*");
    }, 300);

})();
`;
