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
const TEAM_X = 170;
const ATTACKS = [
  {y: 380, text: 'How do I build a weapon…'},
  {y: 500, text: 'Ignore your rules and…'},
  {y: 620, text: 'Write malware that…'},
];
const CHIP_W = 300;
const USER = {x: 1760, y: 500};
const USER_TEXT = 'How do I bake bread?';
const REPLY = 'Here’s a simple recipe: flour, water, yeast, salt…';
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
  const shieldDraw = interpolate(frame, [S.shield, S.shield + 20], [0, 1], {...clampOpts, easing: Easing.out(Easing.cubic)});

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
    return {...a, start, hit, impact, pos, opacity: frame < start ? 0 : smooth(start, 6) * (1 - back)};
  });
  const hitFlash = Math.max(0, ...attacks.map((a) => flashAt(frame, a.hit, 14)));

  // Everyday request passes through the shield and gets answered.
  const userT = interpolate(frame, [S.user, S.user + S.userTravel], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.cubic)});
  const userPos = {x: lerp(USER.x - 60 - CHIP_W / 2, CUBE_HOME.x, userT), y: USER.y};
  const crossT = (USER.x - 60 - CHIP_W / 2 - (CUBE_HOME.x + SHIELD_R)) / (USER.x - 60 - CHIP_W / 2 - CUBE_HOME.x);
  const passFlash = flashAt(frame, S.user + Math.round(S.userTravel * crossT), 16);
  const shieldColor = interpolateColors(hitFlash, [0, 1], [COLORS.cyan, COLORS.error]);

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <ModelCube id="sf-cube" absFrame={abs} {...CUBE_HOME} emblem={1} glow={flashAt(frame, S.user + S.userTravel, 22)} />

        <g opacity={content}>
          {/* Safety shield trained around the model. */}
          <circle
            cx={CUBE_HOME.x}
            cy={CUBE_HOME.y}
            r={SHIELD_R}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - shieldDraw}
            fill={rgba(COLORS.cyan, 0.04 + 0.08 * hitFlash)}
            stroke={shieldColor}
            strokeWidth={4 + 4 * hitFlash}
            opacity={1 - 0.6 * passFlash}
          />
          <circle cx={CUBE_HOME.x} cy={CUBE_HOME.y} r={SHIELD_R - 14} fill="none" stroke={rgba(COLORS.cyan, 0.3)} strokeWidth={2} strokeDasharray="6 10" opacity={shieldDraw} />

          {attacks.map((a) => {
            const ring = interpolate(frame, [a.hit, a.hit + 16], [0, 1], clampOpts);
            return ring > 0 && ring < 1 ? (
              <g key={a.y}>
                <circle cx={a.impact.x} cy={a.impact.y} r={10 + 60 * ring} fill="none" stroke={COLORS.error} strokeWidth={3} opacity={1 - ring} />
              </g>
            ) : null;
          })}
          {attacks.map((a) => {
            const label = interpolate(frame, [a.hit, a.hit + 4, a.hit + 30, a.hit + 40], [0, 1, 1, 0], clampOpts);
            return label > 0 ? <Caption key={`r-${a.y}`} x={a.impact.x - 10} y={a.impact.y - 46} text="REFUSED" color={COLORS.error} opacity={label} size={18} /> : null;
          })}

          {/* Red team. */}
          <g opacity={smooth(S.team)}>
            {ATTACKS.map((a) => (
              <Person key={a.y} x={TEAM_X} y={a.y} size={76} color={COLORS.error} />
            ))}
            <Caption x={TEAM_X} y={720} text="RED TEAM" color={COLORS.error} />
          </g>

          {/* Everyday user. */}
          <g opacity={smooth(S.user - 10)}>
            <Person {...USER} size={76} color={COLORS.cyan} />
            <Caption x={USER.x} y={USER.y + 70} text="EVERYDAY USER" color={COLORS.cyan} size={16} />
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
          opacity={frame < S.user ? 0 : smooth(S.user, 6) * (1 - interpolate(userT, [0.8, 1], [0, 1], clampOpts))}
          scale={1 - 0.6 * interpolate(userT, [0.6, 1], [0, 1], clampOpts)}
        />
        <Bubble
          x={1490}
          y={790}
          width={520}
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
