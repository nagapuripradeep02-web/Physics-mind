// =============================================================================
// thermodynamics_renderer.ts
// Pre-built p5.js + Plotly renderer for thermodynamics simulations.
// Engineer-written — NOT AI-generated.
//
// Architecture: reads window.SIM_CONFIG (ThermodynamicsConfig), draws:
//   LEFT panel:  p5.js — piston-cylinder / carnot engine / gas container
//   RIGHT panel: Plotly — PV diagram with process curves and work area shading
//
// Both panels update synchronously from the same SET_STATE message.
// This is a single-panel renderer that internally splits into two halves.
//
// Scenarios supported (via config.scenario_type):
//   piston_cylinder — cylinder with movable piston, gas particles, energy bars
//   carnot_engine   — hot/cold reservoir, engine block, heat/work arrows
//   gas_container   — rigid box, bouncing particles, pressure gauge
//
// postMessage bridge:
//   IN:  { type: 'SET_STATE', state: 'STATE_N' }
//        { type: 'INIT_CONFIG', config: ThermodynamicsConfig }
//        { type: 'PING' }
//   OUT: { type: 'SIM_READY' }          — on load
//        { type: 'STATE_REACHED', state: 'STATE_N' }  — on state apply
//        { type: 'PONG' }
// =============================================================================

// ── TypeScript interfaces (exported for config generation) ───────────────────

export interface ThermodynamicsConfig {
    scenario_type: 'piston_cylinder' | 'carnot_engine' | 'gas_container';
    gas: {
        type: 'ideal' | 'real';
        particle_count: number;
        particle_color: string;
        initial_temperature: number;   // Kelvin
        initial_pressure: number;      // kPa
        initial_volume: number;        // liters
        gamma: number;                 // Cp/Cv (1.4 for diatomic)
    };
    container: {
        type: 'cylinder_piston' | 'rigid_box' | 'engine_diagram';
        wall_color: string;
        piston_color?: string;
        show_heat_arrows: boolean;
        show_work_arrows: boolean;
    };
    pv_diagram: {
        show: boolean;
        x_label: string;    // "Volume (L)"
        y_label: string;    // "Pressure (kPa)"
        x_range: [number, number];
        y_range: [number, number];
        process_color: string;
        show_work_area: boolean;
    };
    energy_bars: {
        show: boolean;
        bar_labels: string[];   // ["Q", "ΔU", "W"]
        bar_colors: string[];
    };
    states: Record<string, {
        label: string;
        temperature: number;
        pressure: number;
        volume: number;
        Q: number;          // heat added
        W: number;          // work done by gas
        deltaU: number;     // change in internal energy
        caption: string;
        pv_points?: Array<[number, number]>;   // PV diagram path for this state
        show_work_area?: boolean;
        slider_active?: boolean;
    }>;
    pvl_colors?: {
        background: string; text: string; hot: string; cold: string; work: string;
    };
}

// ── HTML assembler ───────────────────────────────────────────────────────────

export function assembleThermodynamicsHtml(config: ThermodynamicsConfig): string {
    const bg = config.pvl_colors?.background ?? '#0a0a1a';
    return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<style>
html, body { margin: 0; padding: 0; overflow: hidden; background: ${bg}; width: 100%; height: 100%; }
</style>
</head><body>
<div id="main" style="display:flex;width:100%;height:100vh;">
  <div id="p5-panel" style="width:50%;height:100%;position:relative;">
    <div id="p5-legend" style="position:absolute;bottom:8px;left:8px;background:rgba(0,0,0,0.7);color:white;padding:6px;border-radius:4px;font-size:11px;font-family:monospace;z-index:10;"></div>
  </div>
  <div id="plotly-panel" style="width:50%;height:100%;"></div>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js" crossorigin="anonymous"><\/script>
<script src="https://cdn.plot.ly/plotly-2.27.0.min.js" charset="utf-8"><\/script>
<script>
window.SIM_CONFIG = ${JSON.stringify(config)};
<\/script>
<script>
${THERMODYNAMICS_RENDERER_CODE}
<\/script>
</body></html>`;
}

// ── Renderer code (p5.js + Plotly, embedded as string) ──────────────────────

export const THERMODYNAMICS_RENDERER_CODE = `
// ============================================================
// Thermodynamics Renderer — p5.js (left) + Plotly (right)
// Reads window.SIM_CONFIG (ThermodynamicsConfig)
// ============================================================

var TD_config = window.SIM_CONFIG || {};
var PM_currentState = 'STATE_1';
var TD_particles = [];
var TD_animating = false;
var TD_targetTemp = TD_config.gas ? TD_config.gas.initial_temperature : 300;
var TD_currentTemp = TD_targetTemp;
var TD_targetVolume = TD_config.gas ? TD_config.gas.initial_volume : 5;
var TD_currentVolume = TD_targetVolume;
var TD_targetPressure = TD_config.gas ? TD_config.gas.initial_pressure : 100;
var TD_currentPressure = TD_targetPressure;
var TD_currentQ = 0;
var TD_currentW = 0;
var TD_currentDeltaU = 0;
var TD_pvTraces = [];
var TD_plotlyInitialized = false;
var TD_p5Canvas = null;
var TD_stateTransitionResolve = null;

// ── Plotly setup ─────────────────────────────────────────────
function initPlotly() {
    if (TD_plotlyInitialized) return;
    var pvConfig = TD_config.pv_diagram || {};
    var xRange = pvConfig.x_range || [0, 20];
    var yRange = pvConfig.y_range || [0, 300];
    var layout = {
        paper_bgcolor: '#0a0a1a',
        plot_bgcolor: '#111122',
        font: { color: 'white', family: 'monospace', size: 11 },
        xaxis: {
            title: pvConfig.x_label || 'Volume (L)',
            color: 'white', gridcolor: '#333',
            range: xRange
        },
        yaxis: {
            title: pvConfig.y_label || 'Pressure (kPa)',
            color: 'white', gridcolor: '#333',
            range: yRange
        },
        margin: { t: 40, b: 50, l: 60, r: 20 },
        showlegend: false,
        title: { text: 'PV Diagram', font: { color: '#aaa', size: 13 } }
    };
    var initialTrace = {
        x: [], y: [], mode: 'lines+markers',
        line: { color: pvConfig.process_color || '#FF9800', width: 2 },
        marker: { size: 6, color: '#FF9800' },
        name: 'Process'
    };
    var stateMarker = {
        x: [], y: [], mode: 'markers+text',
        marker: { size: 10, color: '#FFD600', symbol: 'diamond' },
        text: [], textposition: 'top right',
        textfont: { color: '#FFD600', size: 10 },
        name: 'States'
    };
    var workArea = {
        x: [], y: [], fill: 'tozeroy',
        fillcolor: 'rgba(100,181,246,0.15)',
        line: { color: 'transparent' },
        name: 'Work',
        showlegend: false
    };
    Plotly.newPlot('plotly-panel', [initialTrace, stateMarker, workArea], layout, {
        responsive: true, displayModeBar: false
    });
    TD_plotlyInitialized = true;
}

function updatePlotly(stateId) {
    if (!TD_plotlyInitialized) return Promise.resolve();
    var stateConfig = TD_config.states[stateId];
    if (!stateConfig) return Promise.resolve();

    var pvPoints = stateConfig.pv_points || [[stateConfig.volume, stateConfig.pressure]];
    var processColor = TD_config.pv_diagram ? TD_config.pv_diagram.process_color : '#FF9800';

    // Accumulate PV path across states
    var allX = [];
    var allY = [];
    var stateIds = Object.keys(TD_config.states).sort();
    var currentIdx = stateIds.indexOf(stateId);
    for (var si = 0; si <= currentIdx; si++) {
        var sConf = TD_config.states[stateIds[si]];
        if (sConf && sConf.pv_points) {
            for (var pi = 0; pi < sConf.pv_points.length; pi++) {
                allX.push(sConf.pv_points[pi][0]);
                allY.push(sConf.pv_points[pi][1]);
            }
        } else if (sConf) {
            allX.push(sConf.volume);
            allY.push(sConf.pressure);
        }
    }

    // State markers for visited states
    var markerX = [];
    var markerY = [];
    var markerText = [];
    for (var mi = 0; mi <= currentIdx; mi++) {
        var ms = TD_config.states[stateIds[mi]];
        if (ms) {
            markerX.push(ms.volume);
            markerY.push(ms.pressure);
            markerText.push(stateIds[mi].replace('STATE_', 'S'));
        }
    }

    // Work area (shaded region under curve)
    var workX = [];
    var workY = [];
    if (stateConfig.show_work_area && allX.length > 1) {
        workX = allX.slice();
        workY = allY.slice();
    }

    var update = {
        x: [allX, markerX, workX],
        y: [allY, markerY, workY]
    };
    var traceUpdate = {
        'line.color': [processColor, undefined, undefined],
        'marker.color': [processColor, '#FFD600', undefined],
        text: [undefined, markerText, undefined]
    };
    return Plotly.update('plotly-panel', traceUpdate, {}, [0, 1, 2]).then(function() {
        return Plotly.restyle('plotly-panel', { x: [allX], y: [allY] }, [0]);
    }).then(function() {
        return Plotly.restyle('plotly-panel', { x: [markerX], y: [markerY], text: [markerText] }, [1]);
    }).then(function() {
        return Plotly.restyle('plotly-panel', { x: [workX], y: [workY] }, [2]);
    });
}

// ── p5.js setup ──────────────────────────────────────────────
function setup() {
    var panel = document.getElementById('p5-panel');
    var w = panel ? panel.offsetWidth : 400;
    var h = panel ? panel.offsetHeight : 400;
    TD_p5Canvas = createCanvas(w, h);
    TD_p5Canvas.parent('p5-panel');
    frameRate(30);

    // Initialize particles
    var count = TD_config.gas ? TD_config.gas.particle_count : 30;
    TD_particles = [];
    for (var i = 0; i < count; i++) {
        TD_particles.push({
            x: random(60, w - 60),
            y: random(60, h - 150),
            vx: random(-2, 2),
            vy: random(-2, 2),
            r: random(3, 5)
        });
    }

    initPlotly();

    // Apply initial state
    var initialState = TD_config.states ? TD_config.states['STATE_1'] : null;
    if (initialState) {
        TD_currentTemp = initialState.temperature;
        TD_targetTemp = initialState.temperature;
        TD_currentVolume = initialState.volume;
        TD_targetVolume = initialState.volume;
        TD_currentPressure = initialState.pressure;
        TD_targetPressure = initialState.pressure;
        TD_currentQ = initialState.Q || 0;
        TD_currentW = initialState.W || 0;
        TD_currentDeltaU = initialState.deltaU || 0;
    }

    updateLegend();
    updatePlotly('STATE_1');

    // Notify parent that sim is ready
    window.parent.postMessage({ type: 'SIM_READY' }, '*');
}

function draw() {
    var bg = (TD_config.pvl_colors && TD_config.pvl_colors.background) ? TD_config.pvl_colors.background : '#0a0a1a';
    background(bg);

    // Smooth interpolation
    TD_currentTemp += (TD_targetTemp - TD_currentTemp) * 0.08;
    TD_currentVolume += (TD_targetVolume - TD_currentVolume) * 0.08;
    TD_currentPressure += (TD_targetPressure - TD_currentPressure) * 0.08;

    var scenario = TD_config.scenario_type || 'piston_cylinder';
    if (scenario === 'piston_cylinder') {
        drawPistonCylinder();
    } else if (scenario === 'carnot_engine') {
        drawCarnotEngine();
    } else if (scenario === 'gas_container') {
        drawGasContainer();
    }

    // Check if animation converged
    if (TD_animating) {
        var tempDiff = Math.abs(TD_currentTemp - TD_targetTemp);
        var volDiff = Math.abs(TD_currentVolume - TD_targetVolume);
        if (tempDiff < 0.5 && volDiff < 0.05) {
            TD_animating = false;
            if (TD_stateTransitionResolve) {
                TD_stateTransitionResolve();
                TD_stateTransitionResolve = null;
            }
        }
    }
}

function windowResized() {
    var panel = document.getElementById('p5-panel');
    if (panel) {
        resizeCanvas(panel.offsetWidth, panel.offsetHeight);
    }
    Plotly.Plots.resize('plotly-panel');
}

// ── Piston-Cylinder scenario ─────────────────────────────────
function drawPistonCylinder() {
    var cw = width;
    var ch = height;
    var wallColor = TD_config.container ? TD_config.container.wall_color : '#4a4a5a';
    var pistonColor = TD_config.container ? (TD_config.container.piston_color || '#8888aa') : '#8888aa';
    var particleColor = TD_config.gas ? TD_config.gas.particle_color : '#FF6B35';
    var hotColor = (TD_config.pvl_colors && TD_config.pvl_colors.hot) ? TD_config.pvl_colors.hot : '#EF5350';
    var coldColor = (TD_config.pvl_colors && TD_config.pvl_colors.cold) ? TD_config.pvl_colors.cold : '#42A5F5';
    var workColor = (TD_config.pvl_colors && TD_config.pvl_colors.work) ? TD_config.pvl_colors.work : '#66BB6A';

    // Cylinder dimensions
    var cylLeft = 30;
    var cylTop = 30;
    var cylWidth = cw - 60;
    var cylHeight = ch * 0.45;
    var cylBottom = cylTop + cylHeight;

    // Piston position based on volume ratio
    var initVol = TD_config.gas ? TD_config.gas.initial_volume : 5;
    var volRatio = TD_currentVolume / Math.max(initVol, 0.1);
    volRatio = constrain(volRatio, 0.2, 2.0);
    var pistonX = cylLeft + cylWidth * 0.15 + (cylWidth * 0.7) * Math.min(volRatio / 2.0, 1.0);
    var pistonWidth = 12;

    // Draw cylinder walls
    stroke(wallColor);
    strokeWeight(3);
    noFill();
    // Bottom wall
    line(cylLeft, cylBottom, cylLeft + cylWidth, cylBottom);
    // Top wall
    line(cylLeft, cylTop, cylLeft + cylWidth, cylTop);
    // Left wall (closed end)
    line(cylLeft, cylTop, cylLeft, cylBottom);

    // Draw piston
    fill(pistonColor);
    stroke('#666');
    strokeWeight(2);
    rect(pistonX, cylTop + 2, pistonWidth, cylHeight - 4, 2);

    // Piston rod
    stroke(pistonColor);
    strokeWeight(4);
    line(pistonX + pistonWidth, cylTop + cylHeight / 2, cylLeft + cylWidth + 15, cylTop + cylHeight / 2);

    // Draw gas particles
    noStroke();
    var speedFactor = Math.sqrt(Math.max(TD_currentTemp, 10) / 300);
    for (var i = 0; i < TD_particles.length; i++) {
        var p = TD_particles[i];
        // Bounce within cylinder
        p.x += p.vx * speedFactor;
        p.y += p.vy * speedFactor;
        // Constrain to cylinder area
        if (p.x < cylLeft + 8) { p.x = cylLeft + 8; p.vx *= -1; }
        if (p.x > pistonX - 4) { p.x = pistonX - 4; p.vx *= -1; }
        if (p.y < cylTop + 8) { p.y = cylTop + 8; p.vy *= -1; }
        if (p.y > cylBottom - 8) { p.y = cylBottom - 8; p.vy *= -1; }

        var alpha = map(speedFactor, 0.3, 2, 120, 255);
        fill(particleColor + hex(constrain(Math.floor(alpha), 0, 255), 2).toLowerCase());
        ellipse(p.x, p.y, p.r * 2);
    }

    // Heat arrow (Q)
    var showHeat = TD_config.container ? TD_config.container.show_heat_arrows : true;
    if (showHeat && Math.abs(TD_currentQ) > 0.1) {
        var arrowY = cylBottom + 25;
        var arrowStartX = cylLeft + cylWidth * 0.2;
        var arrowEndX = cylLeft + cylWidth * 0.2;
        var arrowStartY = cylBottom + 50;
        var arrowEndY = cylBottom + 10;
        if (TD_currentQ < 0) {
            arrowStartY = cylBottom + 10;
            arrowEndY = cylBottom + 50;
        }
        stroke(hotColor);
        strokeWeight(3);
        line(arrowStartX, arrowStartY, arrowEndX, arrowEndY);
        // Arrow head
        var headDir = TD_currentQ > 0 ? -1 : 1;
        var headY = TD_currentQ > 0 ? arrowEndY : arrowEndY;
        line(arrowEndX, headY, arrowEndX - 6, headY + headDir * 8);
        line(arrowEndX, headY, arrowEndX + 6, headY + headDir * 8);
        noStroke();
        fill(hotColor);
        textSize(11);
        textAlign(CENTER);
        text('Q = ' + TD_currentQ.toFixed(0) + ' J', arrowStartX, cylBottom + 65);
    }

    // Work arrow (W)
    var showWork = TD_config.container ? TD_config.container.show_work_arrows : true;
    if (showWork && Math.abs(TD_currentW) > 0.1) {
        var wArrowY = cylTop + cylHeight / 2;
        stroke(workColor);
        strokeWeight(3);
        if (TD_currentW > 0) {
            line(pistonX + pistonWidth + 20, wArrowY, pistonX + pistonWidth + 55, wArrowY);
            line(pistonX + pistonWidth + 55, wArrowY, pistonX + pistonWidth + 45, wArrowY - 6);
            line(pistonX + pistonWidth + 55, wArrowY, pistonX + pistonWidth + 45, wArrowY + 6);
        } else {
            line(pistonX + pistonWidth + 55, wArrowY, pistonX + pistonWidth + 20, wArrowY);
            line(pistonX + pistonWidth + 20, wArrowY, pistonX + pistonWidth + 30, wArrowY - 6);
            line(pistonX + pistonWidth + 20, wArrowY, pistonX + pistonWidth + 30, wArrowY + 6);
        }
        noStroke();
        fill(workColor);
        textSize(11);
        textAlign(CENTER);
        text('W = ' + TD_currentW.toFixed(0) + ' J', pistonX + pistonWidth + 38, wArrowY - 12);
    }

    // Energy bars (Q = ΔU + W)
    drawEnergyBars(cw, ch);

    // State caption
    drawCaption(cw, ch);

    // Temperature & pressure readout
    drawReadout(cw, ch);
}

// ── Carnot Engine scenario ───────────────────────────────────
function drawCarnotEngine() {
    var cw = width;
    var ch = height;
    var hotColor = (TD_config.pvl_colors && TD_config.pvl_colors.hot) ? TD_config.pvl_colors.hot : '#EF5350';
    var coldColor = (TD_config.pvl_colors && TD_config.pvl_colors.cold) ? TD_config.pvl_colors.cold : '#42A5F5';
    var workColor = (TD_config.pvl_colors && TD_config.pvl_colors.work) ? TD_config.pvl_colors.work : '#66BB6A';
    var textColor = (TD_config.pvl_colors && TD_config.pvl_colors.text) ? TD_config.pvl_colors.text : '#ffffff';

    var midX = cw / 2;

    // Hot reservoir (top)
    fill(hotColor);
    stroke('#aa3333');
    strokeWeight(2);
    rect(midX - 70, 20, 140, 50, 6);
    noStroke();
    fill('white');
    textSize(13);
    textAlign(CENTER, CENTER);
    text('Hot Reservoir', midX, 35);
    textSize(11);
    text('T_H = ' + TD_currentTemp.toFixed(0) + ' K', midX, 55);

    // Cold reservoir (bottom)
    var coldY = ch - 100;
    fill(coldColor);
    stroke('#3366aa');
    strokeWeight(2);
    rect(midX - 70, coldY, 140, 50, 6);
    noStroke();
    fill('white');
    textSize(13);
    textAlign(CENTER, CENTER);
    text('Cold Reservoir', midX, coldY + 15);
    // Calculate T_cold from efficiency
    var stateConf = TD_config.states[PM_currentState];
    var T_H = stateConf ? stateConf.temperature : 600;
    // Use initial_temperature as T_C if available as secondary param
    var T_C = TD_config.gas ? Math.max(TD_config.gas.initial_temperature * 0.5, 250) : 300;
    if (stateConf && stateConf.deltaU !== undefined && T_H > 0) {
        // deltaU field repurposed for T_C in carnot_engine mode
        T_C = Math.abs(stateConf.deltaU) > 10 ? Math.abs(stateConf.deltaU) : T_C;
    }
    textSize(11);
    text('T_C = ' + T_C.toFixed(0) + ' K', midX, coldY + 37);

    // Engine block (middle)
    var engineY = 110;
    var engineH = coldY - 140;
    fill('#333344');
    stroke('#555');
    strokeWeight(2);
    rect(midX - 55, engineY, 110, engineH, 8);
    noStroke();
    fill(workColor);
    textSize(14);
    textAlign(CENTER, CENTER);
    text('ENGINE', midX, engineY + engineH / 2 - 10);

    // Efficiency
    var eta = T_C > 0 ? (1 - T_C / Math.max(T_H, 1)) * 100 : 0;
    eta = constrain(eta, 0, 99.9);
    fill('#FFD600');
    textSize(12);
    text('\\u03b7 = ' + eta.toFixed(1) + '%', midX, engineY + engineH / 2 + 12);

    // Q_H arrow (hot → engine)
    if (TD_currentQ > 0) {
        stroke(hotColor);
        strokeWeight(3);
        var qhX = midX;
        line(qhX, 75, qhX, engineY - 5);
        line(qhX, engineY - 5, qhX - 6, engineY - 15);
        line(qhX, engineY - 5, qhX + 6, engineY - 15);
        noStroke();
        fill(hotColor);
        textSize(10);
        textAlign(CENTER);
        text('Q_H = ' + Math.abs(TD_currentQ).toFixed(0) + ' J', qhX + 50, 95);
    }

    // Q_C arrow (engine → cold)
    var Q_C = Math.abs(TD_currentQ) - Math.abs(TD_currentW);
    if (Q_C > 0) {
        stroke(coldColor);
        strokeWeight(3);
        var qcX = midX;
        line(qcX, engineY + engineH + 5, qcX, coldY - 5);
        line(qcX, coldY - 5, qcX - 6, coldY - 15);
        line(qcX, coldY - 5, qcX + 6, coldY - 15);
        noStroke();
        fill(coldColor);
        textSize(10);
        textAlign(CENTER);
        text('Q_C = ' + Q_C.toFixed(0) + ' J', qcX + 50, engineY + engineH + 30);
    }

    // W arrow (engine → right)
    if (Math.abs(TD_currentW) > 0.1) {
        stroke(workColor);
        strokeWeight(3);
        var wY = engineY + engineH / 2;
        line(midX + 60, wY, midX + 110, wY);
        line(midX + 110, wY, midX + 100, wY - 6);
        line(midX + 110, wY, midX + 100, wY + 6);
        noStroke();
        fill(workColor);
        textSize(10);
        textAlign(LEFT);
        text('W = ' + Math.abs(TD_currentW).toFixed(0) + ' J', midX + 115, wY + 4);
    }

    drawCaption(cw, ch);
}

// ── Gas Container scenario ───────────────────────────────────
function drawGasContainer() {
    var cw = width;
    var ch = height;
    var wallColor = TD_config.container ? TD_config.container.wall_color : '#4a4a5a';
    var particleColor = TD_config.gas ? TD_config.gas.particle_color : '#FF6B35';

    // Box dimensions
    var boxLeft = 30;
    var boxTop = 30;
    var boxW = cw - 60;
    var boxH = ch * 0.5;
    var boxBottom = boxTop + boxH;

    // Draw box
    stroke(wallColor);
    strokeWeight(3);
    noFill();
    rect(boxLeft, boxTop, boxW, boxH);

    // Particles
    noStroke();
    var speedFactor = Math.sqrt(Math.max(TD_currentTemp, 10) / 300);
    var collisions = 0;
    for (var i = 0; i < TD_particles.length; i++) {
        var p = TD_particles[i];
        p.x += p.vx * speedFactor;
        p.y += p.vy * speedFactor;
        if (p.x < boxLeft + 6) { p.x = boxLeft + 6; p.vx *= -1; collisions++; }
        if (p.x > boxLeft + boxW - 6) { p.x = boxLeft + boxW - 6; p.vx *= -1; collisions++; }
        if (p.y < boxTop + 6) { p.y = boxTop + 6; p.vy *= -1; collisions++; }
        if (p.y > boxBottom - 6) { p.y = boxBottom - 6; p.vy *= -1; collisions++; }

        var alpha = map(speedFactor, 0.3, 2, 120, 255);
        fill(particleColor + hex(constrain(Math.floor(alpha), 0, 255), 2).toLowerCase());
        ellipse(p.x, p.y, p.r * 2);
    }

    // Pressure gauge (top-right)
    var gaugeX = boxLeft + boxW - 40;
    var gaugeY = boxTop + 25;
    fill('#222233');
    stroke('#555');
    strokeWeight(2);
    ellipse(gaugeX, gaugeY, 40, 40);
    // Needle angle based on pressure
    var maxP = TD_config.pv_diagram ? TD_config.pv_diagram.y_range[1] : 300;
    var needleAngle = map(TD_currentPressure, 0, maxP, -PI * 0.75, PI * 0.75);
    stroke('#EF5350');
    strokeWeight(2);
    line(gaugeX, gaugeY, gaugeX + cos(needleAngle) * 15, gaugeY + sin(needleAngle) * 15);
    noStroke();
    fill('#aaa');
    textSize(9);
    textAlign(CENTER);
    text('P', gaugeX, gaugeY + 30);

    // Temperature label
    fill('#FFD600');
    textSize(13);
    textAlign(LEFT);
    text('T = ' + TD_currentTemp.toFixed(0) + ' K', boxLeft + 10, boxBottom + 25);

    // Pressure label
    fill('#EF5350');
    text('P = ' + TD_currentPressure.toFixed(0) + ' kPa', boxLeft + 10, boxBottom + 45);

    // rms speed indicator
    var M = 0.028; // N2 molar mass
    var R = 8.314;
    var vrms = Math.sqrt(3 * R * TD_currentTemp / M);
    fill('#66BB6A');
    text('v_rms = ' + vrms.toFixed(0) + ' m/s', boxLeft + 10, boxBottom + 65);

    // Avg KE
    var kB = 1.38e-23;
    var avgKE = 1.5 * kB * TD_currentTemp;
    fill('#42A5F5');
    textSize(11);
    text('KE_avg = ' + avgKE.toExponential(2) + ' J', boxLeft + 10, boxBottom + 85);

    drawEnergyBars(cw, ch);
    drawCaption(cw, ch);
}

// ── Shared drawing helpers ───────────────────────────────────
function drawEnergyBars(cw, ch) {
    var ebConfig = TD_config.energy_bars;
    if (!ebConfig || !ebConfig.show) return;

    var barLabels = ebConfig.bar_labels || ['Q', '\\u0394U', 'W'];
    var barColors = ebConfig.bar_colors || ['#EF5350', '#FF9800', '#66BB6A'];
    var values = [TD_currentQ, TD_currentDeltaU, TD_currentW];

    var barAreaTop = ch * 0.65;
    var barAreaH = ch * 0.2;
    var barW = 35;
    var gap = 20;
    var totalW = barLabels.length * barW + (barLabels.length - 1) * gap;
    var startX = (cw - totalW) / 2;

    // Title
    noStroke();
    fill('#aaa');
    textSize(11);
    textAlign(CENTER);
    text('Energy (J)', cw / 2, barAreaTop - 8);

    // Find max value for scaling
    var maxVal = 1;
    for (var v = 0; v < values.length; v++) {
        if (Math.abs(values[v]) > maxVal) maxVal = Math.abs(values[v]);
    }

    for (var i = 0; i < barLabels.length; i++) {
        var x = startX + i * (barW + gap);
        var val = values[i];
        var barH = (Math.abs(val) / maxVal) * barAreaH * 0.8;
        var yBase = barAreaTop + barAreaH;

        // Bar
        fill(barColors[i] || '#888');
        noStroke();
        if (val >= 0) {
            rect(x, yBase - barH, barW, barH, 3, 3, 0, 0);
        } else {
            rect(x, yBase, barW, barH, 0, 0, 3, 3);
        }

        // Label
        fill('#ddd');
        textSize(10);
        textAlign(CENTER);
        text(barLabels[i], x + barW / 2, yBase + 15);
        // Value
        fill(barColors[i] || '#888');
        textSize(9);
        text(val.toFixed(0), x + barW / 2, val >= 0 ? yBase - barH - 5 : yBase + barH + 12);
    }
}

function drawCaption(cw, ch) {
    var stateConf = TD_config.states ? TD_config.states[PM_currentState] : null;
    if (!stateConf) return;
    noStroke();
    fill('#FFD600');
    textSize(12);
    textAlign(CENTER);
    var caption = stateConf.caption || stateConf.label || '';
    text(caption, cw / 2, ch - 12);
}

function drawReadout(cw, ch) {
    noStroke();
    fill('#ddd');
    textSize(11);
    textAlign(LEFT);
    text('T = ' + TD_currentTemp.toFixed(0) + ' K', 10, ch * 0.58);
    text('P = ' + TD_currentPressure.toFixed(0) + ' kPa', 10, ch * 0.58 + 16);
    text('V = ' + TD_currentVolume.toFixed(1) + ' L', 10, ch * 0.58 + 32);
}

function updateLegend() {
    var legendEl = document.getElementById('p5-legend');
    if (!legendEl) return;
    var stateConf = TD_config.states ? TD_config.states[PM_currentState] : null;
    if (!stateConf) return;
    legendEl.innerHTML = '<b>' + (stateConf.label || PM_currentState) + '</b>';
}

// ── State transition ─────────────────────────────────────────
function transitionToState(stateId) {
    return new Promise(function(resolve) {
        var stateConfig = TD_config.states[stateId];
        if (!stateConfig) {
            resolve();
            return;
        }

        PM_currentState = stateId;
        TD_targetTemp = stateConfig.temperature;
        TD_targetPressure = stateConfig.pressure;
        TD_targetVolume = stateConfig.volume;
        TD_currentQ = stateConfig.Q || 0;
        TD_currentW = stateConfig.W || 0;
        TD_currentDeltaU = stateConfig.deltaU || 0;
        TD_animating = true;
        TD_stateTransitionResolve = resolve;

        updateLegend();

        // Update Plotly in parallel
        updatePlotly(stateId);

        // Safety timeout — resolve after 3s even if animation hasn't converged
        setTimeout(function() {
            if (TD_animating) {
                TD_animating = false;
                if (TD_stateTransitionResolve) {
                    TD_stateTransitionResolve();
                    TD_stateTransitionResolve = null;
                }
            }
        }, 3000);
    });
}

// ── postMessage bridge ───────────────────────────────────────
window.addEventListener('message', function(event) {
    var data = event.data;
    if (!data || !data.type) return;

    if (data.type === 'INIT_CONFIG') {
        if (data.config) {
            TD_config = data.config;
            window.SIM_CONFIG = data.config;
            // Re-init particles for new config
            var count = TD_config.gas ? TD_config.gas.particle_count : 30;
            var panel = document.getElementById('p5-panel');
            var pw = panel ? panel.offsetWidth : 400;
            var ph = panel ? panel.offsetHeight : 400;
            TD_particles = [];
            for (var i = 0; i < count; i++) {
                TD_particles.push({
                    x: random(60, pw - 60),
                    y: random(60, ph - 150),
                    vx: random(-2, 2),
                    vy: random(-2, 2),
                    r: random(3, 5)
                });
            }
            // Re-init plotly
            TD_plotlyInitialized = false;
            initPlotly();
        }
        window.parent.postMessage({ type: 'SIM_READY' }, '*');
    }

    if (data.type === 'SET_STATE') {
        var stateId = data.state || data.stateId;
        if (stateId && TD_config.states && TD_config.states[stateId]) {
            transitionToState(stateId).then(function() {
                window.parent.postMessage({ type: 'STATE_REACHED', state: stateId }, '*');
            });
        }
    }

    if (data.type === 'PING') {
        window.parent.postMessage({ type: 'PONG' }, '*');
    }
});
`;
