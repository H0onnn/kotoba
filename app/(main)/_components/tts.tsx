'use client';

import { useSpeech } from 'react-text-to-speech';
import { TTS_LANG, VOICE_MODEL } from '@/constants/tts';
import { CirclePlayIcon, CirclePauseIcon } from 'lucide-react';
import { Button } from '@heroui/button';

interface TTSProps {
  text: string;
}

export const TTS = ({ text }: TTSProps) => {
  const { speechStatus, start, stop } = useSpeech({
    text: text,
    lang: TTS_LANG,
    voiceURI: VOICE_MODEL,
  });

  return (
    <div className='flex items-center'>
      <Button
        variant='flat'
        size='sm'
        isIconOnly
        onPress={start}
        isLoading={speechStatus === 'started'}
        className='bg-transparent rounded-full'
      >
        <CirclePlayIcon />
      </Button>

      <Button variant='flat' size='sm' isIconOnly onPress={stop} className='bg-transparent rounded-full'>
        <CirclePauseIcon />
      </Button>
    </div>
  );
};

export const TTSToggle = ({ text }: TTSProps) => {
  const { speechStatus, start, stop } = useSpeech({
    text: text,
    lang: TTS_LANG,
    voiceURI: VOICE_MODEL,
  });

  const isPlaying = speechStatus === 'started';

  const handleToggle = () => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  };

  return (
    <Button
      variant='light'
      size='sm'
      isIconOnly
      onPress={handleToggle}
      className='p-0 bg-transparent rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'
    >
      {isPlaying ? <CirclePauseIcon size={20} /> : <CirclePlayIcon size={20} />}
    </Button>
  );
};
