import React from 'react';
import {ModelCube as BaseCube, ModelCubeProps as BaseProps} from '../../../shared/components/ModelCube';
import {clamp} from '../../../shared/lib/math';
import {LOCK, SCENES} from '../timing';

const SPIN = 0.014; // rad per frame
const SLOW_START = SCENES.lockIn.from + LOCK.slowStart;
const STOP = SCENES.lockIn.from + LOCK.freeze;

// 0 while the model is still training, 1 once its weights are frozen in Scene 9.
export const frozenAmount = (absFrame: number) => clamp((absFrame - SLOW_START) / (STOP - SLOW_START), 0, 1);

// Driven by the absolute frame so the cube turns continuously across scenes, then decelerates
// linearly to a standstill when the weights freeze.
export const cubeYaw = (absFrame: number) => {
  const u = clamp(absFrame - SLOW_START, 0, STOP - SLOW_START);
  return 0.65 + Math.min(absFrame, SLOW_START) * SPIN + SPIN * (u - (u * u) / (2 * (STOP - SLOW_START)));
};

export type ModelCubeProps = Omit<BaseProps, 'yaw' | 'still'>;

export const ModelCube: React.FC<ModelCubeProps> = (props) => (
  <BaseCube {...props} yaw={cubeYaw(props.absFrame)} still={frozenAmount(props.absFrame)} />
);
