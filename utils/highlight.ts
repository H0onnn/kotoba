import React from 'react';

/**
 * 텍스트에서 특정 단어를 하이라이트 처리하는 유틸리티 함수들
 */

/**
 * 텍스트에서 하이라이트할 단어를 찾아 HTML로 감싸는 함수
 * @param text 원본 텍스트
 * @param highlightWord 하이라이트할 단어
 * @param className CSS 클래스명 (기본값: "bg-yellow-200 dark:bg-yellow-600")
 * @returns 하이라이트가 적용된 HTML 문자열
 */
export function highlightWord(
  text: string,
  highlightWord: string,
  className: string = 'bg-yellow-200 dark:bg-yellow-600',
): string {
  if (!highlightWord || !text) return text;

  // 정규식을 사용하여 대소문자 구분 없이 단어를 찾음
  const regex = new RegExp(`(${escapeRegExp(highlightWord)})`, 'gi');

  return text.replace(regex, `<span class="${className}">$1</span>`);
}

/**
 * 정규식 특수문자를 이스케이프하는 함수
 * @param string 이스케이프할 문자열
 * @returns 이스케이프된 문자열
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 여러 단어를 동시에 하이라이트 처리하는 함수
 * @param text 원본 텍스트
 * @param highlightWords 하이라이트할 단어들의 배열
 * @param className CSS 클래스명
 * @returns 하이라이트가 적용된 HTML 문자열
 */
export function highlightMultipleWords(
  text: string,
  highlightWords: string[],
  className: string = 'bg-yellow-200 dark:bg-yellow-600',
): string {
  if (!highlightWords || highlightWords.length === 0) return text;

  let result = text;

  // 각 단어를 순차적으로 하이라이트 처리
  for (const word of highlightWords) {
    if (word && word.trim()) {
      result = highlightWord(result, word.trim(), className);
    }
  }

  return result;
}

/**
 * 하이라이트된 HTML을 안전하게 렌더링하기 위한 함수
 * @param htmlString HTML 문자열
 * @returns 안전한 HTML 문자열
 */
export function sanitizeHtml(htmlString: string): string {
  // 기본적인 XSS 방지를 위한 간단한 필터링
  return htmlString
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * 텍스트에서 하이라이트할 단어를 찾아 배열로 반환하는 함수
 * @param text 원본 텍스트
 * @param highlightWord 하이라이트할 단어
 * @returns 하이라이트할 단어가 포함된 위치 정보 배열
 */
export function findHighlightPositions(
  text: string,
  highlightWord: string,
): Array<{ start: number; end: number; word: string }> {
  if (!highlightWord || !text) return [];

  const positions: Array<{ start: number; end: number; word: string }> = [];
  const regex = new RegExp(escapeRegExp(highlightWord), 'gi');
  let match;

  while ((match = regex.exec(text)) !== null) {
    positions.push({
      start: match.index,
      end: match.index + match[0].length,
      word: match[0],
    });
  }

  return positions;
}

/**
 * 하이라이트된 텍스트를 React 컴포넌트로 변환하는 함수
 * @param text 원본 텍스트
 * @param highlightWord 하이라이트할 단어
 * @param highlightClassName 하이라이트 CSS 클래스명
 * @returns React JSX 요소 배열
 */
export function createHighlightedElements(
  text: string,
  highlightWord: string,
  highlightClassName: string = 'bg-yellow-200 dark:bg-yellow-600',
): (string | React.ReactElement)[] {
  if (!highlightWord || !text) return [text];

  const positions = findHighlightPositions(text, highlightWord);

  if (positions.length === 0) return [text];

  const elements: (string | React.ReactElement)[] = [];
  let lastIndex = 0;

  positions.forEach((pos, index) => {
    // 하이라이트 전 텍스트
    if (pos.start > lastIndex) {
      elements.push(text.slice(lastIndex, pos.start));
    }

    // 하이라이트된 단어
    elements.push(
      React.createElement(
        'span',
        {
          key: index,
          className: highlightClassName,
        },
        pos.word,
      ),
    );

    lastIndex = pos.end;
  });

  // 마지막 하이라이트 후 텍스트
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements;
}
