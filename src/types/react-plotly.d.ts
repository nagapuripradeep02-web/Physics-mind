declare module 'react-plotly.js' {
  import type { ComponentType } from 'react';
  interface PlotProps {
    data: unknown[];
    layout?: Record<string, unknown>;
    config?: Record<string, unknown>;
    style?: React.CSSProperties;
    useResizeHandler?: boolean;
    onInitialized?: (fig: unknown) => void;
    onUpdate?: (fig: unknown) => void;
  }
  const Plot: ComponentType<PlotProps>;
  export default Plot;
}
