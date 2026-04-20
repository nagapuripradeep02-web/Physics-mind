// =============================================================================
// graph_interactive_renderer.ts (v2, PCPL-native)
// Reads panel_b_config directly from the concept JSON:
//   - x_axis / y_axis
//   - traces[] with equation_expr (multi-variable expressions)
//   - live_dot with y_expr + sync_with_panel_a_sliders
//   - default_variables (injected at assembly time from physics_engine_config)
//   - annotations[] (Plotly layout annotations)
// Emits and listens for PARAM_UPDATE so bilateral sync with Panel A works
// data-drivenly (no hardcoded state gates, no A6/B6/th6 legacy keys).
// =============================================================================

export const GRAPH_INTERACTIVE_RENDERER_CODE = `
// ─── Globals ────────────────────────────────────────────────────────────────
var config;
var plotDiv;
var currentState = 'STATE_1';
var variables = {};         // live physics variable map (theta, m, g, ...)
var lastEmitted = {};       // last value posted per key — echo guard
var colors = { background: '#0a0a1a', grid: '#1e2030', axis: '#94a3b8', highlight: '#fbbf24' };

// ─── Expression evaluator (multi-variable, sandbox-safe) ─────────────────────
// Takes equation_expr referencing any variable + Math.*/PI/etc.
// Returns a function (vars) => number. On eval error, returns NaN.
function makeEvaluator(expr) {
  try {
    return new Function(
      'vars',
      'var PI=Math.PI;var E=Math.E;' +
      'var sin=Math.sin;var cos=Math.cos;var tan=Math.tan;' +
      'var asin=Math.asin;var acos=Math.acos;var atan=Math.atan;var atan2=Math.atan2;' +
      'var sqrt=Math.sqrt;var abs=Math.abs;var pow=Math.pow;var exp=Math.exp;var log=Math.log;' +
      'with(vars){ return (' + expr + '); }'
    );
  } catch (e) {
    console.error('[GraphRenderer] bad expression:', expr, e);
    return function() { return NaN; };
  }
}

function safeEval(fn, vars) {
  try {
    var v = fn(vars);
    return (typeof v === 'number' && isFinite(v)) ? v : NaN;
  } catch (e) {
    return NaN;
  }
}

// ─── v1 → v2 internal normalizer ────────────────────────────────────────────
// Single-panel concepts routed via runGraphPipeline still produce the old
// Sonnet-authored shape { lines[], states[STATE_N].active_lines, sliders[] }.
// Rather than keep two renderers, translate at boot: lines become traces,
// sliders become live_dot.sync_with_panel_a_sliders, active_lines drives
// per-state trace visibility. The renderer below only speaks v2 after this.
function normalizeV1ToV2(cfg) {
  if (!cfg) return cfg;
  // If already v2 (has traces), leave alone.
  if (Array.isArray(cfg.traces) && cfg.traces.length > 0) return cfg;
  if (!Array.isArray(cfg.lines)) return cfg;

  // lines[] → traces[] (convert slope+intercept OR formula into equation_expr)
  cfg.traces = cfg.lines.map(function(ln) {
    var xVar = (cfg.x_axis && cfg.x_axis.variable) || 'x';
    var expr;
    if (typeof ln.formula === 'string' && ln.formula.length > 0) {
      // v1 formula uses 'x' as the independent variable; rename to axis variable
      // if different. Replace whole-word 'x' only.
      expr = (xVar === 'x')
        ? ln.formula
        : ln.formula.replace(new RegExp('\\\\bx\\\\b', 'g'), xVar);
    } else {
      var slope = (typeof ln.slope === 'number') ? ln.slope : 0;
      var intercept = (typeof ln.intercept === 'number') ? ln.intercept : 0;
      expr = slope + ' * ' + xVar + ' + ' + intercept;
    }
    return {
      id: ln.id || ('trace_' + Math.random().toString(36).slice(2, 7)),
      equation_expr: expr,
      color: ln.color,
      label: ln.label,
      line_width: ln.width || ln.line_width,
      style: ln.style,
    };
  });

  // sliders[] + first-line formula → synthesize live_dot if missing.
  if (!cfg.live_dot && Array.isArray(cfg.sliders) && cfg.sliders.length > 0) {
    var primary = cfg.sliders[0];
    var xVarLd = (cfg.x_axis && cfg.x_axis.variable) || primary.id || 'x';
    var firstTrace = cfg.traces[0];
    cfg.live_dot = {
      x_variable: xVarLd,
      y_expr: firstTrace ? firstTrace.equation_expr : '0',
      color: '#F59E0B',
      size: 10,
      sync_with_panel_a_sliders: cfg.sliders.map(function(s) { return s.id; }),
    };
  }

  // variable_specs from v1 sliders (min/max/step/default/label/unit).
  if (!cfg.variable_specs && Array.isArray(cfg.sliders)) {
    cfg.variable_specs = {};
    for (var si = 0; si < cfg.sliders.length; si++) {
      var sl = cfg.sliders[si];
      if (!sl || !sl.id) continue;
      cfg.variable_specs[sl.id] = {
        min: sl.min, max: sl.max,
        step: typeof sl.step === 'number' ? sl.step : ((sl.max - sl.min) / 100),
        default: typeof sl.default === 'number' ? sl.default : sl.min,
        label: sl.label || sl.id,
        unit: sl.unit || (cfg.x_axis && cfg.x_axis.unit) || '',
      };
    }
  }

  // default_variables from slider defaults.
  if (!cfg.default_variables && Array.isArray(cfg.sliders)) {
    cfg.default_variables = {};
    for (var di = 0; di < cfg.sliders.length; di++) {
      var ds = cfg.sliders[di];
      if (!ds || !ds.id) continue;
      cfg.default_variables[ds.id] = (typeof ds.default === 'number') ? ds.default : ds.min;
    }
  }

  // Preserve active_lines → per-state visibility map on cfg._stateTraceMask.
  // buildAllTraces() uses this when currentState is set.
  if (cfg.states && typeof cfg.states === 'object') {
    cfg._stateTraceMask = {};
    for (var sk in cfg.states) {
      if (!Object.prototype.hasOwnProperty.call(cfg.states, sk)) continue;
      var st = cfg.states[sk];
      if (st && Array.isArray(st.active_lines)) {
        cfg._stateTraceMask[sk] = st.active_lines;
      }
    }
  }

  return cfg;
}

// ─── Boot ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  config = window.SIM_CONFIG;
  if (!config) {
    console.error('[GraphRenderer] No SIM_CONFIG');
    parent.postMessage({ type: 'SIM_READY' }, '*');
    return;
  }

  // Translate legacy v1 shape to v2 internally. No-op for v2 inputs.
  config = normalizeV1ToV2(config);

  var pc = config.pvl_colors || config.colors || {};
  colors = {
    background: pc.background || '#0a0a1a',
    grid: pc.grid || '#1e2030',
    axis: pc.axis || '#94a3b8',
    highlight: pc.highlight || '#fbbf24'
  };

  // Seed live variable map from config.default_variables (populated by
  // assembleGraphHTML from physics_engine_config.variables[*].default,
  // or synthesized by normalizeV1ToV2 from v1 slider defaults).
  if (config.default_variables && typeof config.default_variables === 'object') {
    for (var k in config.default_variables) {
      if (Object.prototype.hasOwnProperty.call(config.default_variables, k)) {
        variables[k] = config.default_variables[k];
      }
    }
  }

  plotDiv = document.getElementById('plot');
  try {
    initPlot();
    initSliders();
    initLegend();
  } catch(e) {
    console.error('[GraphRenderer] init error:', e);
  }
  parent.postMessage({ type: 'SIM_READY' }, '*');
});

// ─── Axis title helper ──────────────────────────────────────────────────────
function axisTitle(axis) {
  if (!axis) return '';
  if (axis.symbol && axis.label && axis.symbol !== axis.label) {
    return axis.symbol + ' (' + axis.label + ')';
  }
  return axis.label || axis.symbol || axis.variable || '';
}

// ─── Layout builder ─────────────────────────────────────────────────────────
function buildLayout(titleText) {
  var xa = config.x_axis || { min: 0, max: 10 };
  var ya = config.y_axis || { min: 0, max: 10 };
  var plotlyAnnotations = [];
  if (Array.isArray(config.annotations)) {
    for (var a = 0; a < config.annotations.length; a++) {
      var an = config.annotations[a];
      if (!an || !an.position) continue;
      plotlyAnnotations.push({
        x: an.position.x, y: an.position.y, xref: 'x', yref: 'y',
        text: an.text || '',
        showarrow: false,
        font: { color: an.color || colors.axis, size: 11 },
      });
    }
  }
  return {
    paper_bgcolor: colors.background,
    plot_bgcolor:  colors.grid,
    font: { color: colors.axis, size: 13, family: 'system-ui, sans-serif' },
    xaxis: {
      title: { text: axisTitle(xa), font: { size: 12 } },
      range: [xa.min, xa.max],
      gridcolor: '#2A2A3E',
      zerolinecolor: colors.axis,
      tickfont: { color: colors.axis },
    },
    yaxis: {
      title: { text: axisTitle(ya), font: { size: 12 } },
      range: [ya.min, ya.max],
      gridcolor: '#2A2A3E',
      zerolinecolor: colors.axis,
      tickfont: { color: colors.axis },
    },
    margin: { l: 60, r: 20, t: titleText ? 48 : 20, b: 60 },
    showlegend: true,
    legend: {
      bgcolor: 'rgba(0,0,0,0)',
      font: { color: colors.axis, size: 12 },
      x: 0.02, y: 0.98,
    },
    annotations: plotlyAnnotations,
    title: titleText
      ? { text: titleText, font: { color: colors.axis, size: 12 }, x: 0.5, xanchor: 'center' }
      : undefined,
  };
}

function initPlot() {
  Plotly.newPlot(plotDiv, buildAllTraces(), buildLayout(config.title || null), {
    responsive: true,
    displayModeBar: false,
    staticPlot: false,
  });
}

// ─── Trace builder — samples equation_expr across x range ───────────────────
// Per JSON: config.traces[] with { id, equation_expr, color, label, line_width, style }
// The x variable is config.x_axis.variable. All other variables come from the
// live variables map (seeded from default_variables, updated by PARAM_UPDATE).
function buildTraceFromSpec(traceSpec) {
  var xa = config.x_axis || { min: 0, max: 10, variable: 'x' };
  var xVar = xa.variable || 'x';
  var steps = 120;
  var xData = [];
  var yData = [];
  var fn = makeEvaluator(traceSpec.equation_expr || '0');
  var localVars = {};
  // Clone live variables so we don't mutate the live map mid-loop.
  for (var k in variables) {
    if (Object.prototype.hasOwnProperty.call(variables, k)) localVars[k] = variables[k];
  }
  for (var i = 0; i <= steps; i++) {
    var x = xa.min + (xa.max - xa.min) * i / steps;
    localVars[xVar] = x;
    var y = safeEval(fn, localVars);
    xData.push(x);
    yData.push(y);
  }
  return {
    x: xData,
    y: yData,
    type: 'scatter',
    mode: 'lines',
    name: traceSpec.label || traceSpec.id || '',
    line: {
      color: traceSpec.color || colors.highlight,
      width: traceSpec.line_width || 2,
      dash: traceSpec.style === 'dashed' ? 'dash' : (traceSpec.style === 'dotted' ? 'dot' : 'solid'),
    },
  };
}

function buildLiveDotTrace() {
  var ld = config.live_dot;
  if (!ld) return null;
  var xVar = ld.x_variable || (config.x_axis && config.x_axis.variable) || 'x';
  var xVal = (typeof variables[xVar] === 'number') ? variables[xVar] : null;
  if (xVal === null) return null;

  var yExprSrc = ld.y_expr || ld.equation_expr || '';
  // y_expr may reference Math.PI etc. using dotted syntax — normalize to bare
  // constants so the evaluator's shadowed globals (PI, cos) work for either form.
  yExprSrc = String(yExprSrc)
    .replace(/Math\\.PI/g, 'PI')
    .replace(/Math\\.E/g, 'E')
    .replace(/Math\\.(sin|cos|tan|asin|acos|atan|atan2|sqrt|abs|pow|exp|log)/g, '$1');
  var fn = makeEvaluator(yExprSrc);
  var yVal = safeEval(fn, variables);
  if (!isFinite(yVal)) return null;

  return {
    x: [xVal],
    y: [yVal],
    type: 'scatter',
    mode: 'markers',
    name: '_live_dot',
    marker: {
      color: ld.color || colors.highlight,
      size: ld.size || 10,
      symbol: 'circle',
      line: { color: '#000', width: 1 },
    },
    showlegend: false,
    hovertemplate: '(%{x:.1f}, %{y:.2f})<extra></extra>',
  };
}

function buildAllTraces() {
  var out = [];
  var traces = Array.isArray(config.traces) ? config.traces : [];
  // v1-normalized configs carry a per-state visibility mask; v2 concepts
  // (no _stateTraceMask) render all traces on every state.
  var mask = config._stateTraceMask && config._stateTraceMask[currentState];
  var maskSet = null;
  if (Array.isArray(mask)) {
    maskSet = {};
    for (var mi = 0; mi < mask.length; mi++) maskSet[mask[mi]] = true;
  }
  for (var i = 0; i < traces.length; i++) {
    var t = traces[i];
    if (maskSet && !maskSet[t.id]) continue;
    try { out.push(buildTraceFromSpec(t)); }
    catch (e) { console.error('[GraphRenderer] trace build failed:', t, e); }
  }
  var ld = buildLiveDotTrace();
  if (ld) out.push(ld);
  return out;
}

// ─── Sliders — DOM controls mirroring sync_with_panel_a_sliders ─────────────
// These bridge B→A: user drags → emits PARAM_UPDATE → DualPanelSimulation
// relays to Panel A. They stay visible so the student always has control.
function initSliders() {
  var slidersDiv = document.getElementById('sliders');
  if (!slidersDiv) return;
  slidersDiv.innerHTML = '';

  var ld = config.live_dot;
  var syncVars = (ld && Array.isArray(ld.sync_with_panel_a_sliders))
    ? ld.sync_with_panel_a_sliders
    : [];
  if (syncVars.length === 0) {
    slidersDiv.style.display = 'none';
    return;
  }
  slidersDiv.style.display = 'flex';

  var varSpecs = (config.variable_specs && typeof config.variable_specs === 'object')
    ? config.variable_specs : {};

  for (var i = 0; i < syncVars.length; i++) {
    var key = syncVars[i];
    var spec = varSpecs[key] || {};
    var minV = (typeof spec.min === 'number') ? spec.min : 0;
    var maxV = (typeof spec.max === 'number') ? spec.max : 100;
    var defV = (typeof variables[key] === 'number') ? variables[key]
              : ((typeof spec.default === 'number') ? spec.default : minV);
    var stepV = (typeof spec.step === 'number' && spec.step > 0)
      ? spec.step
      : (maxV - minV) / 100;

    var row = document.createElement('div');
    row.className = 'slider-row';

    var lbl = document.createElement('label');
    lbl.textContent = spec.label || (spec.name ? spec.name : key);
    lbl.setAttribute('for', 'slider-' + key);

    var input = document.createElement('input');
    input.type = 'range';
    input.id = 'slider-' + key;
    input.min = String(minV);
    input.max = String(maxV);
    input.step = String(stepV);
    input.value = String(defV);

    var val = document.createElement('span');
    val.className = 'val';
    val.id = 'val-' + key;
    val.textContent = String(defV) + (spec.unit ? (' ' + spec.unit) : '');

    (function(input_, val_, key_, spec_) {
      input_.addEventListener('input', function() {
        var v = parseFloat(input_.value);
        val_.textContent = v.toFixed(spec_.step && spec_.step < 1 ? 2 : 1) + (spec_.unit ? (' ' + spec_.unit) : '');
        // Update live variable + redraw
        variables[key_] = v;
        updatePlot();
        // Emit PARAM_UPDATE unless this is an echo
        if (lastEmitted[key_] !== v) {
          lastEmitted[key_] = v;
          parent.postMessage({ type: 'PARAM_UPDATE', key: key_, value: v }, '*');
        }
      });
    })(input, val, key, spec);

    row.appendChild(lbl);
    row.appendChild(input);
    row.appendChild(val);
    slidersDiv.appendChild(row);
  }
}

// ─── Plot refresh ────────────────────────────────────────────────────────────
function updatePlot() {
  if (!plotDiv) return;
  Plotly.react(plotDiv, buildAllTraces(), buildLayout(config.title || null));
}

// ─── Legend (bottom-left HTML overlay, unchanged from v1) ───────────────────
function initLegend() {
  var legend = config && config.legend;
  if (!legend || legend.length === 0) return;

  var div = document.createElement('div');
  div.id = 'sim-legend';
  div.style.cssText = [
    'position:absolute',
    'bottom:8px',
    'left:8px',
    'background:rgba(0,0,0,0.6)',
    'padding:6px 10px',
    'border-radius:4px',
    'font-size:10px',
    'font-family:system-ui,sans-serif',
    'line-height:1.6',
    'pointer-events:none',
    'z-index:10',
  ].join(';');

  legend.forEach(function(entry) {
    var row = document.createElement('div');
    var sym = document.createElement('span');
    sym.textContent = entry.symbol;
    sym.style.color = '#60A5FA';
    sym.style.marginRight = '4px';
    var meaning = document.createTextNode('\\u2014 ' + entry.meaning);
    var meaningSpan = document.createElement('span');
    meaningSpan.style.color = '#D4D4D8';
    meaningSpan.appendChild(meaning);
    row.appendChild(sym);
    row.appendChild(meaningSpan);
    div.appendChild(row);
  });

  var wrapper = document.getElementById('plot') || document.body;
  var parentEl = wrapper.parentElement || document.body;
  if (getComputedStyle(parentEl).position === 'static') {
    parentEl.style.position = 'relative';
  }
  parentEl.appendChild(div);
}

// ─── postMessage bridge — data-driven, no STATE_6 hardcode ──────────────────
window.addEventListener('message', function(e) {
  if (!e.data || !e.data.type) return;

  if (e.data.type === 'SET_STATE') {
    currentState = e.data.state;
    // Traces are concept-global, not state-gated. Redraw anyway so the
    // title / annotations can react if needed.
    updatePlot();
    parent.postMessage({ type: 'STATE_REACHED', state: currentState }, '*');
    return;
  }

  if (e.data.type === 'PARAM_UPDATE') {
    var key = e.data.key;
    var val = parseFloat(e.data.value);
    if (!key || !isFinite(val)) return;
    // Echo guard: drop messages matching what we just emitted.
    if (lastEmitted[key] === val) return;
    variables[key] = val;
    lastEmitted[key] = val; // prevent re-emit in slider input handler

    // Sync the DOM slider (if present) so the control tracks the value.
    var slider = document.getElementById('slider-' + key);
    if (slider) slider.value = String(val);
    var valLabel = document.getElementById('val-' + key);
    if (valLabel) {
      var varSpecs = (config.variable_specs && typeof config.variable_specs === 'object') ? config.variable_specs : {};
      var unit = varSpecs[key] && varSpecs[key].unit ? (' ' + varSpecs[key].unit) : '';
      valLabel.textContent = val.toFixed(1) + unit;
    }

    updatePlot();
  }
});
`;
