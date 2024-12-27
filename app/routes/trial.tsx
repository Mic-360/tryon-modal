import type { Route } from "./+types/home";
import VirtualTryOn from "~/trial/tryon";

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'TwinTry™' },
    {
      name: 'Virtual Try on Experience',
      content:
        'Provides high quality and efficient virtual try on for all at your comfort.',
    },
  ];
}

export default function Trial() {
  return <VirtualTryOn />;
}
