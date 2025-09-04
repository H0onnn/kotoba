/**
 * 한글 자음/모음만으로 구성된 문자열인지 확인
 * @param text 검사할 문자열
 * @returns 자음/모음만으로 구성된 경우 true
 */
export const isOnlyJamo = (text: string): boolean => {
  // 한글 자음/모음만으로 구성된 문자열 패턴
  const jamoPattern = /^[ㄱ-ㅎㅏ-ㅣ]+$/;

  return jamoPattern.test(text);
};

/**
 * 영어 문자가 포함되어 있는지 확인
 * @param text 검사할 문자열
 * @returns 영어 문자가 포함된 경우 true
 */
export const containsEnglish = (text: string): boolean => {
  // 영어 문자 패턴 (대소문자)
  const englishPattern = /[a-zA-Z]/;

  return englishPattern.test(text);
};

/**
 * 부적절한 문자나 특수문자가 포함되어 있는지 확인
 * @param text 검사할 문자열
 * @returns 부적절한 문자가 포함된 경우 true
 */
export const containsInappropriateChars = (text: string): boolean => {
  // 부적절한 문자 패턴 (예: 뷁, 특수문자 등)
  const inappropriatePattern = /[뷁\u0000-\u001F\u007F-\u009F\uFFFD]/;

  return inappropriatePattern.test(text);
};

/**
 * 입력 문자열이 유효한지 검사
 * @param text 검사할 문자열
 * @returns 유효한 경우 true
 */
export const isValidInput = (text: string): boolean => {
  if (!text || text.trim().length === 0) return false;

  // 자음/모음만으로 구성된 경우 제외
  if (isOnlyJamo(text)) return false;

  // 영어 문자가 포함된 경우 제외
  if (containsEnglish(text)) return false;

  // 부적절한 문자가 포함된 경우 제외
  if (containsInappropriateChars(text)) return false;

  return true;
};

/**
 * 입력 문자열을 정리하고 유효성 검사
 * @param text 정리할 문자열
 * @returns 정리된 문자열과 유효성 여부
 */
export const sanitizeAndValidate = (
  text: string,
): {
  sanitized: string;
  isValid: boolean;
  error?: string;
} => {
  const trimmed = text.trim();

  if (!trimmed) {
    return { sanitized: '', isValid: false, error: '입력값이 비어있습니다.' };
  }

  if (isOnlyJamo(trimmed)) {
    return {
      sanitized: trimmed,
      isValid: false,
      error: '자음과 모음만으로는 검색할 수 없습니다.',
    };
  }

  if (containsEnglish(trimmed)) {
    return {
      sanitized: trimmed,
      isValid: false,
      error: '영어는 입력할 수 없습니다.',
    };
  }

  if (containsInappropriateChars(trimmed)) {
    return {
      sanitized: trimmed,
      isValid: false,
      error: '부적절한 문자가 포함되어 있습니다.',
    };
  }

  return { sanitized: trimmed, isValid: true };
};
