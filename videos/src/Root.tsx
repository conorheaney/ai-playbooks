import React from 'react';
import {HowAIGetsContext} from '../lessons/how-ai-gets-context/composition';
import {HowAIResponds} from '../lessons/how-ai-responds/composition';
import {HowAITakesAction} from '../lessons/how-ai-takes-action/composition';
import {HowAITrains} from '../lessons/how-ai-trains/composition';

// One Remotion project for every lesson. Each lesson lives in lessons/<lesson>/
// and exports its <Composition>; register it here to show it in Studio.
export const RemotionRoot: React.FC = () => (
  <>
    <HowAITrains />
    <HowAIResponds />
    <HowAIGetsContext />
    <HowAITakesAction />
  </>
);
