"use client";

import React, { useRef, useEffect, useMemo } from "react";

interface TypingDisplayProps {
  text: string;
  input: string;
  cursorPosition: number;
  inputValue: string;
  handleKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
  handleCompositionStart: React.CompositionEventHandler<HTMLInputElement>;
  handleCompositionEnd: React.CompositionEventHandler<HTMLInputElement>;
  handleInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export const TypingDisplay: React.FC<TypingDisplayProps> = ({
  text,
  input, cursorPosition,
  inputValue, handleKeyDown, handleCompositionStart, handleCompositionEnd,
  handleInput,
  inputRef,
}) => {
  const textDisplayRef = useRef<HTMLDivElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);

  const characters = useMemo(() => {
    let position = 0;
    const result: Array<{ char: string; index: number }> = [];
    for (const char of text) {
      result.push({ char, index: position });
      position += char.length;
    }
    return result;
  }, [text]);

  // Auto-scroll to current typing position
  useEffect(() => {
    if (currentCharRef.current && textDisplayRef.current) {
      currentCharRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [cursorPosition, text]);

  return (
    <div className="w-full max-w-4xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl p-8 mb-8 transition-colors">
      <div onClick={() => inputRef.current?.focus()}
        ref={textDisplayRef}
        data-testid="text-display"
        className="mb-8 text-3xl font-mono text-gray-900 dark:text-white leading-relaxed wrap-break-words relative tracking-wide whitespace-pre-wrap max-h-32 overflow-y-auto"
      >
        {characters.map(({ char, index }) => {
          let color = "text-gray-400 dark:text-gray-500";
          const isCurrentChar = index === cursorPosition;

          if (index < input.length) {
            color =
              input.slice(index, index + char.length) === char
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
          } else if (isCurrentChar) {
            color =
              "text-gray-900 dark:text-white border-b-2 border-blue-500 dark:border-blue-400";
          }
          return (
            <span
              key={index}
              data-current={isCurrentChar}
              ref={isCurrentChar ? currentCharRef : null}
              className={color}
            >
              {char}
            </span>
          );
        })}
      </div>

      <input
        data-testid="typing-input"
        ref={inputRef}
        type="text"
        value={inputValue}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        aria-label="Zone de frappe"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        onChange={handleInput}
        className="sr-only"
        autoFocus
      />
    </div>
  );
};
