"use client";

import { useState, useEffect } from 'react';
import type { KeyboardLayoutId, KeyDefinition } from '../types/keyboard';
import { getLayout } from '../config/layouts';
import { highlightedKeys, type CharacterInputPlan } from '../utils/inputPlan';

interface KeyboardProps {
  target: CharacterInputPlan;
  layoutId: KeyboardLayoutId;
  showHands: boolean;
  showColors: boolean;
  showEnglishHints?: boolean; // Show English characters as hints on non-English layouts
  lastPressedKey?: string | null; // Last key that was physically pressed (for highlighting)
}

export const Keyboard: React.FC<KeyboardProps> = ({
  target,
  layoutId,
  showHands,
  showColors,
  showEnglishHints = false,
  lastPressedKey = null
}) => {
  const layout = getLayout(layoutId);
  const enLayout = layoutId !== 'en-us' ? getLayout('en-us') : null;

  // Only show English hints after mount to prevent hydration mismatch
  // Server always renders without hints, client enables after hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => { setMounted(true); }, 0);
    return () => clearTimeout(timer);
  }, []);

  const effectiveShowEnglishHints = mounted && showEnglishHints;

  const targetIds = highlightedKeys(target, layout);
  const pressedKeyId = lastPressedKey;
  const spaceHand = targetIds.includes('space') ? 'r' : null;

  // Color mapping based on hands2.png - centralized for easy maintenance
  const getGroupColor = (group: number | null, opacity: number = 1): { backgroundColor: string } | null => {
    if (group === null) return null;

    // hands2.png color mapping
    const colors: Record<number, string> = {
      1: '#AD7FA8', // Left pinky - light purple
      2: '#729FCF', // Left index - light blue
      3: '#73D216', // Left middle - bright green
      4: '#FCAF3E', // Left ring - orange
      5: '#FCE94F', // Right index - yellow
      6: '#FCAF3E', // Right middle - orange
      7: '#729FCF', // Right ring - light blue
      8: '#AD7FA8', // Right pinky - light purple
    };

    const color = colors[group];
    if (!color) return null;

    // Convert hex to rgba for opacity support
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity})`
    };
  };

  const getKeyClass = (keyId: string, group?: number): { className: string; style?: React.CSSProperties } => {
    let classes = "key flex justify-center items-center border border-gray-800 rounded m-0.5 text-lg transition-colors duration-100 relative ";
    let style: React.CSSProperties | undefined;

    // Size classes based on width property
    const key = layout.keys.find(k => k.id === keyId);
    if (key?.width === 'tab') classes += "w-[82px] h-[55px] ";
    else if (key?.width === 'caps') classes += "w-[98px] h-[55px] ";
    else if (key?.width === 'enter') classes += "w-[98px] h-[55px] ";
    else if (key?.width === 'shift') classes += "w-[128px] h-[55px] ";
    else if (key?.width === 'space') classes += "w-[330px] h-[55px] ";
    else classes += "w-[55px] h-[55px] ";

    // Override group for shift keys: both left and right shift use left pinky (group 1)
    // Assign groups to special keys that don't have them in layout
    let effectiveGroup = group;
    if (keyId === 'shift-l' || keyId === 'shift-r') {
      effectiveGroup = 1; // Both shift keys use left pinky
    } else if (keyId === 'tab' || keyId === 'caps_lock') {
      effectiveGroup = 1; // Tab and Caps Lock use left pinky
    } else if (keyId === 'backspace' || keyId === 'enter') {
      effectiveGroup = 8; // Backspace and Enter use right pinky
    }

    // Space uses gray color (thumbs)
    const isSpace = keyId === 'space';

    // Active state (correct key)
    const isActive = targetIds.includes(keyId);

    // Pressed state (any key pressed, even if incorrect)
    const isPressed = keyId === pressedKeyId || (pressedKeyId === 'space' && keyId === 'space');

    if (isActive) {
      // Active: full color from hands2.png - always white text on colored background
      if (isSpace) {
        style = { backgroundColor: '#727272' };
      } else if (effectiveGroup) {
        const colorStyle = getGroupColor(effectiveGroup, 1);
        if (colorStyle) style = colorStyle;
      }
      classes += "text-black border-2 border-gray-800 ";
      if (showHands) classes += "key-target ";
    } else if (isPressed) {
      // Pressed: gray highlight - white text on gray background
      classes += "bg-gray-400 text-white border-2 border-gray-600 transition-all duration-200 ";
    } else {
      // Passive: lighter colors if showColors is enabled - dark text on light background
      if (showColors) {
        if (isSpace) {
          style = { backgroundColor: 'rgba(114, 114, 114, 0.3)' };
        } else if (effectiveGroup) {
          const colorStyle = getGroupColor(effectiveGroup, 0.3);
          if (colorStyle) style = colorStyle;
        } else {
          classes += "bg-gray-100 ";
        }
      } else {
        classes += "bg-gray-100 ";
      }
      // Always dark text on light backgrounds (keyboard colors are consistent across themes)
      classes += "text-gray-900 ";
    }

    // Use effectiveGroup for CSS class to ensure correct hand visualization
    if (effectiveGroup) classes += `group-${effectiveGroup} `;
    if (keyId === 'space' && spaceHand === 'r') classes += "righthand ";

    return { className: classes, style };
  };

  // Render key content with optional English hints
  const renderKeyContent = (keyDef: KeyDefinition) => {
    // Special keys
    if (['tab', 'caps_lock', 'shift-l', 'shift-r', 'backspace', 'enter', 'space'].includes(keyDef.id)) {
      if (layout.language === 'fr') {
        const labels: Record<string, string> = { tab: 'Tab', caps_lock: 'Verr. Maj', 'shift-l': 'Maj', 'shift-r': 'Maj', backspace: '⌫', enter: 'Entrée', space: 'Espace' };
        return <span className="text-base">{labels[keyDef.id]}</span>;
      }
      return keyDef.id === 'backspace' ? '⌫' : keyDef.primary.replace('-', ' ');
    }

    // Show English hints for non-English layouts (only after mount to prevent hydration mismatch)
    if (effectiveShowEnglishHints && enLayout) {
      const enKey = enLayout.keys.find(k => k.id === keyDef.id);
      if (enKey && enKey.primary !== keyDef.primary) {
        return (
          <div className="flex flex-col items-center justify-center leading-tight">
            <span className="text-[10px] opacity-60">{enKey.primary}</span>
            <span className="text-sm font-medium">{keyDef.primary}</span>
          </div>
        );
      }
    }

    return <div className="flex flex-col items-center leading-tight"><span className="text-xs">{keyDef.shifted} {keyDef.altGr && `· ${keyDef.altGr}`}</span><span>{keyDef.primary}</span></div>;
  };

  // Get keys for each row using a more robust row detection system
  // This determines rows based on key positions relative to row markers
  const rowKeys = (() => {
    const keys = layout.keys;
    const tabIndex = keys.findIndex(k => k.id === 'tab');
    const capsIndex = keys.findIndex(k => k.id === 'caps_lock');
    const shiftLIndex = keys.findIndex(k => k.id === 'shift-l');
    const spaceIndex = keys.findIndex(k => k.id === 'space');

    // Determine which row each key belongs to based on its position
    const getKeyRow = (keyIndex: number): number => {
      if (keyIndex < tabIndex || (tabIndex === -1 && keyIndex < capsIndex)) return 1;
      if (keyIndex >= tabIndex && keyIndex < capsIndex) return 2;
      if (keyIndex >= capsIndex && keyIndex < shiftLIndex) return 3;
      if (keyIndex >= shiftLIndex && keyIndex < spaceIndex) return 4;
      if (keyIndex === spaceIndex) return 5;
      return 0; // Unknown
    };

    const rows: KeyDefinition[][] = [[], [], [], [], []];
    keys.forEach((key, index) => {
      const row = getKeyRow(index);
      if (row > 0 && row <= 5) {
        rows[row - 1].push(key);
      }
    });

    return rows;
  })();

  const [row1Keys, row2Keys, row3Keys, row4Keys, row5Keys] = rowKeys;
  const spaceKey = row5Keys?.[0];

  return (
    <div data-testid="virtual-keyboard" className="flex flex-col items-center justify-center mt-6 select-none opacity-100 transition-opacity duration-200 w-full max-w-[855px] mx-auto">
      {/* Row 1 - Number row */}
      <div className="flex w-full">
        {row1Keys.map(key => {
          const { className, style } = getKeyClass(key.id, key.group);
          return (
            <div key={key.id} id={key.id} data-target={targetIds.includes(key.id)} data-pressed={pressedKeyId === key.id} className={className} style={style}>
              {renderKeyContent(key)}
            </div>
          );
        })}
      </div>

      {/* Row 2 - Top letter row */}
      <div className="flex w-full">
        {row2Keys.map(key => {
          const { className, style } = getKeyClass(key.id, key.group);
          return (
            <div key={key.id} id={key.id} data-target={targetIds.includes(key.id)} data-pressed={pressedKeyId === key.id} className={className} style={style}>
              {renderKeyContent(key)}
            </div>
          );
        })}
      </div>

      {/* Row 3 - Home row */}
      <div className="flex w-full">
        {row3Keys.map(key => {
          const { className, style } = getKeyClass(key.id, key.group);
          return (
            <div key={key.id} id={key.id} data-target={targetIds.includes(key.id)} data-pressed={pressedKeyId === key.id} className={className} style={style}>
              {renderKeyContent(key)}
            </div>
          );
        })}
      </div>

      {/* Row 4 - Bottom row */}
      <div className="flex w-full">
        {row4Keys.map(key => {
          const { className, style } = getKeyClass(key.id, key.group);
          return (
            <div key={key.id} id={key.id} data-target={targetIds.includes(key.id)} data-pressed={pressedKeyId === key.id} className={className} style={style}>
              {renderKeyContent(key)}
            </div>
          );
        })}
      </div>

      {/* Row 5 - Space bar and right Alt modifier */}
      <div className="flex w-full justify-center h-[60px]">
        {spaceKey && spaceKey.id === 'space' && (() => {
          const { className, style } = getKeyClass('space');
          return <div id="space" data-target={targetIds.includes("space")} data-pressed={pressedKeyId === "space"} className={className} style={style}>Espace</div>;
        })()}
        <div id="altgr" data-target={targetIds.includes('altgr')} data-pressed={pressedKeyId === 'altgr'} className={getKeyClass('altgr').className + ' ml-4'} style={targetIds.includes('altgr') ? { backgroundColor: '#FCE94F' } : undefined}>AltGr</div>
      </div>
    </div>
  );
};
