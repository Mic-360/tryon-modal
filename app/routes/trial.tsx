import type { Route } from "./+types/trial";
import VirtualTryOn from "~/trial/tryon";

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'TwinTry™' },
    {
      name: 'description',
      content:
        'Provides high quality and efficient virtual try on for all at your comfort.',
    },
    {
      name: 'og:title',
      content: 'TwinTry™ - Virtual Try on Experience',
    },
    {
      name: 'og:description',
      content:
        'Experience high quality and efficient virtual try on for all at your comfort.',
    },
    {
      name: 'og:image',
      content: '/tryon-preview.png',
    },
    {
      name: 'og:type',
      content: 'website',
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:title',
      content: 'TwinTry™ - Virtual Try on Experience',
    },
    {
      name: 'twitter:description',
      content:
        'Experience high quality and efficient virtual try on for all at your comfort.',
    },
    {
      name: 'twitter:image',
      content: '/tryon-preview.png',
    },
  ];
}

export default function Trial() {
  return <VirtualTryOn />;
}
