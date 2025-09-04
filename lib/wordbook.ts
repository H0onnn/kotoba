export interface Word {
  id: string;
  word_jp: string;
  yomigana: string;
  meaning_kr: string;
  part_of_speech: string;
  homonyms: Omit<ExWord, 'yomigana'>[];
  synonyms: ExWord[];
  compounds: ExWord[];
  examples: {
    sentence_jp: string;
    yomigana?: string;
    meaning_kr: string;
    highlight_word: string;
    example_words: Omit<ExWord, 'meaning_kr'>[];
  }[];
  savedAt: number;
}

interface ExWord extends Pick<Word, 'word_jp' | 'yomigana' | 'meaning_kr'> {}

const STORAGE_KEY = 'kotoba-wordbook';

export function getWordbook(): Word[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// 외부 스토리지 구독 관련 함수
const listeners = new Set<() => void>();
let storageListenerInitialized = false;

function notifyWordbookSubscribers(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      console.error('Error notifying wordbook subscribers');
    }
  });
}

function ensureStorageListener(): void {
  if (storageListenerInitialized || typeof window === 'undefined') return;
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      notifyWordbookSubscribers();
    }
  });
  storageListenerInitialized = true;
}

export function subscribeWordbook(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  ensureStorageListener();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function saveWordToBook(wordData: Omit<Word, 'id' | 'savedAt'>): Word {
  const word: Word = {
    ...wordData,
    id: Date.now().toString(),
    savedAt: Date.now(),
  };

  const wordbook = getWordbook();
  const existingIndex = wordbook.findIndex((w) => w.word_jp === word.word_jp);

  if (existingIndex >= 0) {
    wordbook[existingIndex] = word;
  } else {
    wordbook.unshift(word);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(wordbook));
  notifyWordbookSubscribers();
  return word;
}

export function removeWordFromBook(wordJp: string): void {
  const wordbook = getWordbook();
  const filteredWords = wordbook.filter((word) => word.word_jp !== wordJp);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredWords));
  notifyWordbookSubscribers();
}

export function isWordSaved(wordJp: string): boolean {
  const wordbook = getWordbook();
  return wordbook.some((word) => word.word_jp === wordJp);
}

export function getWordById(wordId: string): Word | null {
  const wordbook = getWordbook();
  return wordbook.find((word) => word.id === wordId) || null;
}
