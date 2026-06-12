import { Gauge1Duotone } from '@lineiconshq/free-icons';
import type { IconData } from './line-icon';
import { formatsFromConversionSlug } from './format-icons';

export interface RelatedTool {
  href: string;
  title: string;
  desc: string;
}

export interface RelatedToolCardProps {
  href: string;
  description: string;
  fromFormat?: string;
  toFormat?: string;
  title?: string;
  icon?: IconData;
}

export function toRelatedToolCard(tool: RelatedTool): RelatedToolCardProps {
  const slug = tool.href.replace(/^\/tools\//, '');

  if (slug === 'image-compressor') {
    return {
      href: tool.href,
      description: tool.desc,
      title: 'Image Compressor',
      icon: Gauge1Duotone,
    };
  }

  if (slug === 'heic-to-jpg') {
    return { href: tool.href, description: tool.desc, fromFormat: 'HEIC', toFormat: 'JPG' };
  }

  if (slug === 'img-to-pdf') {
    return { href: tool.href, description: tool.desc, fromFormat: 'IMG', toFormat: 'PDF' };
  }

  const formats = formatsFromConversionSlug(slug);
  if (formats) {
    return {
      href: tool.href,
      description: tool.desc,
      fromFormat: formats.from,
      toFormat: formats.to,
    };
  }

  return { href: tool.href, description: tool.desc, title: tool.title };
}
