export function createSliderElement(
  variable: string,
  min: number,
  max: number,
  step: number,
  defaultVal: number,
  label: string,
  unit: string,
  onChange: (variable: string, value: number) => void
): HTMLDivElement {
  const container = document.createElement('div');
  container.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;';

  const labelEl = document.createElement('span');
  labelEl.style.cssText = 'font-size:12px;color:#6B7280;';
  labelEl.textContent = `${label}: ${defaultVal} ${unit}`;

  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(defaultVal);
  input.style.cssText = 'width:180px;';

  input.addEventListener('input', () => {
    const val = parseFloat(input.value);
    labelEl.textContent = `${label}: ${val} ${unit}`;
    onChange(variable, val);
  });

  container.appendChild(labelEl);
  container.appendChild(input);
  return container;
}
