export interface IconData {
  name: string;
  svg: string;
  viewBox: string;
  defaultFill?: string;
  defaultStroke?: string;
  hasFill: boolean;
  hasStroke: boolean;
  hasStrokeWidth: boolean;
}

export function renderIconSvg(
  icon: IconData,
  color = 'currentColor',
  strokeWidth = 1.5,
): string {
  let svg = icon.svg;
  if (icon.hasFill) svg = svg.replace(/fill="{color}"/g, `fill="${color}"`);
  if (icon.hasStroke) svg = svg.replace(/stroke="{color}"/g, `stroke="${color}"`);
  if (strokeWidth && icon.hasStrokeWidth) {
    svg = svg.replace(/stroke-width="{strokeWidth}"/g, `stroke-width="${strokeWidth}"`);
  }
  // @lineiconshq/free-icons uses `//>` instead of `/>`, which breaks HTML parsing and React hydration.
  return svg.replace(/\/\/>/g, '/>');
}
