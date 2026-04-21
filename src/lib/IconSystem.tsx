import React from 'react';
import { ICON_SIZE_PIXELS, type Transform, type Layer, type IconConfig, type IconSize } from '@/types/domain';

// --- Palette ---
export const ICON_PALETTE = ['#6C5CE7', '#00CEC9', '#A0A0A0'];

const iconDebugEndpoint = 'http://127.0.0.1:7575/ingest/829da6d3-87ba-471e-86c5-8ea6b8519a57';
const iconDebugSessionId = 'c93e4e';
const iconUnitSquare = 1;
const iconUnitCenter = 0.5;

function sendIconDebugLog(payload: {
  runId: string;
  hypothesisId: string;
  location: string;
  message: string;
  data: Record<string, unknown>;
}) {
  fetch(iconDebugEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': iconDebugSessionId,
    },
    body: JSON.stringify({
      sessionId: iconDebugSessionId,
      ...payload,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}
// --- Utils ---
function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function ensureNotMonochrome(layers: Layer[]): Layer[] {
  const firstColor = layers[0]?.color;
  if (!firstColor || layers.length < 2) return layers;

  const allSameColor = layers.every((layer) => layer.color === firstColor);
  if (!allSameColor) return layers;

  const paletteIndex = ICON_PALETTE.indexOf(firstColor);
  const nextColor =
    paletteIndex === -1
      ? ICON_PALETTE[0]
      : ICON_PALETTE[(paletteIndex + 1) % ICON_PALETTE.length];

  const randomLayerIndex = Math.floor(Math.random() * layers.length);
  return layers.map((layer, i) =>
    i === randomLayerIndex ? { ...layer, color: nextColor } : layer
  );
}

// --- Generator ---
export function generateIconConfig(): IconConfig {
  const layerCount = rand([2,3,4]);
  const layers: Layer[] = [];

  for (let i = 0; i < layerCount; i++) {
    const transforms: Transform[] = [];

    if (Math.random() < 0.7) {
      transforms.push({ type: 'scale', value: rand([0.33, 0.66, 1, 1.33, 1.66]) });
    }

    if (Math.random() < 0.7) {
      transforms.push({ type: 'rotate', deg: rand([0, 30, 60, 90]) });
    }

    if (Math.random() < 0.7) {
      transforms.push({
        type: 'translate',
        x: rand([-0.33, 0, 0.33]),
        y: rand([-0.33, 0, 0.33]),
      });
    }

    layers.push({
      shape: rand(['circle', 'square']),
      color: rand(ICON_PALETTE),
      transforms,
      reflect: Math.random() < 0.999 ? rand(['x', 'y']) : undefined,
    });
  }

  const normalizedLayers = ensureNotMonochrome(layers);
  return normalizedLayers === layers ? { layers } : { layers: normalizedLayers };
}

// --- Renderer helpers ---
function buildTransformString(transforms: Transform[]): string {
  const transformString = transforms
    .map((t) => {
      if (t.type === 'translate') {
        return `translate(${t.x * iconUnitSquare}, ${t.y * iconUnitSquare})`;
      }
      if (t.type === 'rotate') {
        return `rotate(${t.deg} ${iconUnitCenter} ${iconUnitCenter})`;
      }
      if (t.type === 'scale') {
        return `scale(${t.value}) translate(${(1 - t.value) * iconUnitCenter}, ${(1 - t.value) * iconUnitCenter})`;
      }
      return '';
    })
    .join(' ');

  // #region agent log
  sendIconDebugLog({
    runId: 'pre-fix',
    hypothesisId: 'H2',
    location: 'src/lib/IconSystem.tsx:64',
    message: 'Computed transform string',
    data: {
      transforms,
      transformString,
    },
  });
  // #endregion

  return transformString;
}

function renderShape(layer: Layer) {
  if (layer.shape === 'circle') {
    return <circle cx={iconUnitCenter} cy={iconUnitCenter} r={0.25} fill={layer.color} />;
  }
  return <rect x={0.25} y={0.25} width={0.5} height={0.5} fill={layer.color} />;
}
function renderWithReflection(layer: Layer, transform: string, key: number) {
  const base = (
    <g key={key} transform={transform}>
      {renderShape(layer)}
    </g>
  );

  if (!layer.reflect) return base;

  const mirrorTransform =
    layer.reflect === 'x'
      ? `translate(0 ${2 * iconUnitCenter}) scale(1 -1)`   // reflect about y = center
      : `translate(${2 * iconUnitCenter} 0) scale(-1 1)`;  // reflect about x = center

  return (
    <>
      {base}
      <g key={`${key}-ref`} transform={mirrorTransform}>
        <g transform={transform}>{renderShape(layer)}</g>
      </g>
    </>
  );
}
// function renderWithReflection(layer: Layer, transform: string, key: number) {
//   const base = (
//     <g key={key} transform={transform}>
//       {renderShape(layer)}
//     </g>
//   );

//   if (!layer.reflect) return base;

//   let reflectTransform = '';

//   if (layer.reflect === 'x') {
//     reflectTransform = `${transform} scale(1 -1) translate(0 -24)`;
//   } else if (layer.reflect === 'y') {
//     reflectTransform = `${transform} scale(-1 1) translate(-24 0)`;
//   }

//   return (
//     <>
//       {base}
//       <g key={`${key}-ref`} transform={reflectTransform}>
//         {renderShape(layer)}
//       </g>
//     </>
//   );
// }

// --- Renderer ---
export function IconRenderer({ config, iconSize }: { config: IconConfig; iconSize: IconSize }) {
  const finalSizeInPixels = ICON_SIZE_PIXELS[iconSize];

  // #region agent log
  sendIconDebugLog({
    runId: 'post-fix',
    hypothesisId: 'H5',
    location: 'src/lib/IconSystem.tsx:124',
    message: 'Computed layer scale factor',
    data: {
      iconSize,
      finalSizeInPixels,
      unitScaleSize: iconUnitSquare,
    },
  });
  // #endregion

  // #region agent log
  sendIconDebugLog({
    runId: 'pre-fix',
    hypothesisId: 'H1',
    location: 'src/lib/IconSystem.tsx:122',
    message: 'IconRenderer render start',
    data: {
      iconSize,
      finalSizeInPixels,
      layerCount: config.layers.length,
    },
  });
  // #endregion

  return (
    <svg width={finalSizeInPixels} height={finalSizeInPixels} viewBox={`0 0 ${iconUnitSquare} ${iconUnitSquare}`}>
      {/* <rect x="0" y="0" width={iconSquareSideLengthInPixels} height={iconSquareSideLengthInPixels} fill="#FFFFFF" /> */}
      {/* #region agent log */}
      {(() => {
        sendIconDebugLog({
          runId: 'pre-fix',
          hypothesisId: 'H3',
          location: 'src/lib/IconSystem.tsx:136',
          message: 'SVG viewport attributes',
          data: {
            width: finalSizeInPixels,
            height: finalSizeInPixels,
            viewBox: `0 0 ${iconUnitSquare} ${iconUnitSquare}`,
          },
        });
        return null;
      })()}
      {/* #endregion */}
      {config.layers.map((layer, i) => {
        const transform = buildTransformString(layer.transforms);
        // #region agent log
        sendIconDebugLog({
          runId: 'post-fix',
          hypothesisId: 'H4',
          location: 'src/lib/IconSystem.tsx:170',
          message: 'Layer render parameters',
          data: {
            index: i,
            reflect: layer.reflect ?? null,
            transform,
            shape: layer.shape,
            iconSize,
          },
        });
        // #endregion
        return renderWithReflection(layer, transform, i);
      })}
    </svg>
  );
}