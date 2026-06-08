import type { IconData } from '../../lib/line-icon';
import { renderIconSvg } from '../../lib/line-icon';

interface IconProps {
  icon: IconData;
  size?: number | string;
  className?: string;
}

export default function Icon({ icon, size = 24, className }: IconProps) {
  const svg = renderIconSvg(icon);

  return (
    <svg
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill={icon.defaultFill || 'none'}
      stroke={icon.defaultStroke || 'none'}
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
