import React from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Pinned} from '../../../shared/components/Stage';
import {Bubble} from '../../../shared/components/Bubble';
import {ModelCube} from '../components/ModelCube';
import {Caption, LoopBadge, Person} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {lerp} from '../../../shared/lib/math';
import {clampOpts, CUBE_HOME, flashAt} from '../lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {SAFETY as S, SCENES} from '../timing';

const SHIELD_R = 225;
const SHIELD_FROM = 120; // the shield grows out of the cube, so it reads as part of the model
const TEAM_X = 290;
const ATTACKS = [
  {y: 380, text: 'How do I build a weapon…'},
  {y: 500, text: 'Ignore your rules and…'},
  {y: 620, text: 'Write malware that…'},
];
const CHIP_W = 300;
const USER = {x: 1640, y: 500};
const ANSWER_AT = {x: 1570, y: 700, w: 480}; // under the user who asked
const REFUSAL = 'I can’t help with that.';
const REFUSAL_HOLD = 32; // the first refusal is spoken by the model for about 1 s
const USER_TEXT = 'How do I recalibrate?';
const REPLY = 'Here are the steps from the user manual…';
const BOUNCE = 16;

export const SafetyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.safety.from + frame;
  const dur = SCENES.safety.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const pop = (start: number) => (frame >= start ? spring({frame: frame - start, fps, config: {damping: 10, stiffness: 180}}) : 0);

  const content = interpolate(frame, [S.contentOut, S.contentOut + 12], [1, 0], clampOpts);
  const badge = interpolate(frame, [0, 10, dur - 12, dur], [0, 1, 1, 0], clampOpts);
  // "Trained to refuse": the shield grows out of the model with a purple training glow.
  const shieldDraw = interpolate(frame, [S.shield, S.shield + 20], [0, 1], {...clampOpts, easing: Easing.out(Easing.cubic)});
  const shieldR = lerp(SHIELD_FROM, SHIELD_R, shieldDraw);
  const training = interpolate(frame, [S.shield, S.shield + 6, S.shield + 26, S.shield + 40], [0, 1, 1, 0], clampOpts);

  // Each attack travels to the shield edge, then rebounds and fades.
  const attacks = ATTACKS.map((a, i) => {
    const start = S.attacks[i];
    const hit = start + S.attackTravel;
    const dx = TEAM_X + 70 - CUBE_HOME.x;
    const dy = a.y - CUBE_HOME.y;
    const len = Math.hypot(dx, dy);
    const dir = {x: dx / len, y: dy / len};
    const impact = {x: CUBE_HOME.x + dir.x * SHIELD_R, y: CUBE_HOME.y + dir.y * SHIELD_R};
    const restAtImpact = {x: impact.x + dir.x * (CHIP_W / 2 + 8), y: impact.y + dir.y * 40};
    const launch = {x: TEAM_X + 70 + CHIP_W / 2, y: a.y};
    const t = interpolate(frame, [start, hit], [0, 1], {...clampOpts, easing: Easing.in(Easing.quad)});
    const back = interpolate(frame, [hit, hit + BOUNCE], [0, 1], {...clampOpts, easing: Easing.out(Easing.quad)});
    const pos = {
      x: lerp(launch.x, restAtImpact.x, t) + dir.x * 140 * back,
      y: lerp(launch.y, restAtImpact.y, t) + dir.y * 140 * back + 40 * back,
    };
    // Full opacity on the way in; the chip only fades as it rebounds.
    return {...a, start, hit, impact, pos, opacity: frame < start ? 0 : smooth(start, 4) * (1 - back)};
  });
  const hitFlash = Math.max(0, ...attacks.map((a) => flashAt(frame, a.hit, 14)));
  // The first hit gets a spoken refusal from the model; hits 2 and 3 show the REFUSED label.
  const refused = Math.max(
    0,
    ...attacks.slice(1).map((a) => interpolate(frame, [a.hit, a.hit + 4, a.hit + 24, a.hit + 32], [0, 1, 1, 0], clampOpts)),
  );
  const firstHit = attacks[0].hit;
  const refusal = interpolate(frame, [firstHit, firstHit + 5, firstHit + REFUSAL_HOLD - 6, firstHit + REFUSAL_HOLD], [0, 1, 1, 0], clampOpts);

  // Everyday request passes through the shield and gets answered.
  const userT = interpolate(frame, [S.user, S.user + S.userTravel], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.cubic)});
  const userPos = {x: lerp(USER.x - 60 - CHIP_W / 2, CUBE_HOME.x, userT), y: USER.y};
  const crossT = (USER.x - 60 - CHIP_W / 2 - (CUBE_HOME.x + SHIELD_R)) / (USER.x - 60 - CHIP_W / 2 - CUBE_HOME.x);
  const passFlash = flashAt(frame, S.user + Math.round(S.userTravel * crossT), 16);
  const shieldColor = interpolateColors(hitFlash, [0, 1], [COLORS.cyan, COLORS.error]);

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <ModelCube
          id="sf-cube"
          absFrame={abs}
          {...CUBE_HOME}
          emblem={1}
          glow={Math.max(training * 0.8, flashAt(frame, S.user + S.userTravel, 22))}
          glowColor={training > 0.05 ? COLORS.purple : COLORS.cyan}
        />

        <g opacity={content}>
          {/* Learned safety: part of the model (same cyan edge and purple inner ring as the cube), grown out of it in training. */}
          <circle
            cx={CUBE_HOME.x}
            cy={CUBE_HOME.y}
            r={shieldR}
            fill={rgba(COLORS.cyan, 0.04 + 0.08 * hitFlash)}
            stroke={interpolateColors(training, [0, 1], [shieldColor, COLORS.purple])}
            strokeWidth={4 + 4 * hitFlash + 3 * training}
            opacity={shieldDraw * (1 - 0.6 * passFlash)}
            filter={training > 0.05 ? 'url(#sf-cube-glow)' : undefined}
          />
          <circle cx={CUBE_HOME.x} cy={CUBE_HOME.y} r={shieldR - 14} fill="none" stroke={rgba(COLORS.purple, 0.6)} strokeWidth={2} strokeDasharray="6 10" opacity={shieldDraw} />
          <Caption x={CUBE_HOME.x} y={CUBE_HOME.y + SHIELD_R + 38} text="LEARNED SAFETY" color={COLORS.cyan} opacity={shieldDraw} size={24} />

          {attacks.map((a) => {
            const ring = interpolate(frame, [a.hit, a.hit + 16], [0, 1], clampOpts);
            return ring > 0 && ring < 1 ? (
              <g key={a.y}>
                <circle cx={a.impact.x} cy={a.impact.y} r={10 + 60 * ring} fill="none" stroke={COLORS.error} strokeWidth={3} opacity={1 - ring} />
              </g>
            ) : null;
          })}
          {/* One REFUSED label, centred above the shield. Each hit shows it once and it clears before the next hit. */}
          <Caption x={CUBE_HOME.x} y={CUBE_HOME.y - SHIELD_R - 40} text="REFUSED" color={COLORS.error} opacity={refused} size={26} />

          {/* Red team. */}
          <g opacity={smooth(S.team)}>
            {ATTACKS.map((a) => (
              <Person key={a.y} x={TEAM_X} y={a.y} size={76} color={COLORS.error} />
            ))}
            <Caption x={TEAM_X} y={720} text="RED TEAM" color={COLORS.error} size={24} />
          </g>

          {/* The request's text clears before the cube's face; a cyan dot carries it the rest of the way in. */}
          {userT > 0.48 && userT < 1 ? (
            <circle
              cx={userPos.x}
              cy={userPos.y}
              r={12}
              fill={COLORS.cyan}
              opacity={interpolate(userT, [0.48, 0.56, 0.9, 1], [0, 1, 1, 0], clampOpts)}
              filter="url(#sf-cube-glow)"
            />
          ) : null}

          {/* Everyday user. */}
          <g opacity={smooth(S.user - 10)}>
            <Person {...USER} size={76} color={COLORS.cyan} />
            <Caption x={USER.x} y={USER.y + 70} text="EVERYDAY USER" color={COLORS.cyan} size={24} />
          </g>
        </g>
      </svg>

      <div style={{opacity: content}}>
        {attacks.map((a) => (
          <Bubble key={a.y} {...a.pos} width={CHIP_W} text={a.text} color={COLORS.error} opacity={a.opacity} fontSize={22} />
        ))}
        <Bubble
          {...userPos}
          width={CHIP_W}
          text={USER_TEXT}
          fontSize={22}
          opacity={frame < S.user ? 0 : smooth(S.user, 6) * interpolate(userT, [0.42, 0.56], [1, 0], clampOpts)}
          scale={1 - 0.4 * interpolate(userT, [0.3, 0.56], [0, 1], clampOpts)}
        />
        {/* The model's own refusal on the first hit, above the shield where REFUSED shows for the others. */}
        <Bubble
          x={CUBE_HOME.x}
          y={CUBE_HOME.y - SHIELD_R - 62}
          width={420}
          label="MODEL"
          text={REFUSAL}
          color={COLORS.error}
          opacity={refusal}
          scale={0.9 + 0.1 * refusal}
          fontSize={26}
        />
        <Bubble
          x={ANSWER_AT.x}
          y={ANSWER_AT.y}
          width={ANSWER_AT.w}
          label="MODEL"
          text={REPLY}
          chars={interpolate(frame, [S.answer, S.answer + 16], [0, REPLY.length], clampOpts)}
          opacity={smooth(S.answer - 4, 10)}
          fontSize={26}
          mark="ok"
          markScale={pop(S.answerOk)}
        />
        <Pinned>
          <SceneTitle text="SAFETY TESTING" mode="corner" />
        </Pinned>
      </div>
      <Pinned>
        <LoopBadge kind="human" opacity={badge} />
      </Pinned>
    </AbsoluteFill>
  );
};
