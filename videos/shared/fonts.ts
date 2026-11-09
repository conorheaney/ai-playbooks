import {loadFont} from '@remotion/google-fonts/Inter';

// Remotion blocks rendering until the font is loaded, so no frame renders with a fallback face.
export const {fontFamily: FONT} = loadFont('normal', {
  weights: ['500', '700', '800'],
  subsets: ['latin'],
});
