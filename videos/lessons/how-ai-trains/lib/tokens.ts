import {interpolate} from 'remotion';
import {Camera, Vec3} from '../../../shared/lib/math';
import {CENTER} from '../../../shared/theme';
import {SCENES, TOKEN} from '../timing';

// Shared by Scene 2 (tokenize and map) and Scene 3 (the token points fly into the input chip).

// "The cat sprawled" is cut into four tokens: whole words, plus one word split into sub-word pieces.
// `w` is the token's block width; `textW` is the word's width at WORD_SIZE (Inter 700), used to butt
// "sprawl" and "ed" together before the cut so they read as one word.
export const TOKENS: {text: string; id: number; pos: Vec3; w: number; textW: number}[] = [
  {text: 'The', id: 464, pos: {x: -0.62, y: 0.48, z: 0.42}, w: 200, textW: 146},
  {text: 'cat', id: 3797, pos: {x: 0.3, y: 0.1, z: -0.3}, w: 200, textW: 119},
  {text: 'sprawl', id: 87214, pos: {x: -0.28, y: -0.46, z: -0.52}, w: 290, textW: 260},
  {text: 'ed', id: 276, pos: {x: -0.72, y: -0.12, z: 0.78}, w: 140, textW: 96},
];
export const CAT_INDEX = 1;
export const WORD_SIZE = 80;

// Projection of the 3D meaning space; it yaws slowly from the morph to the end of the scene.
export const tokenCamera = (frame: number): Camera => ({
  yaw: interpolate(frame, [TOKEN.morph, SCENES.tokenize.durationInFrames], [-0.55, 0.35], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }),
  pitch: -0.38,
  distance: 4.2,
  scale: 310,
  cx: CENTER.x,
  cy: CENTER.y - 60,
});
