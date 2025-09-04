import { MessageCircleWarning } from 'lucide-react';
import { Tooltip } from '@heroui/tooltip';

export const Tips = () => {
  return (
    <Tooltip
      content={
        <div className='flex flex-col gap-1 items-center'>
          <div className='flex gap-2 items-center'>
            <p>일본어 단어를 검색하면 더 정확한 답변을 받을 수 있어요</p>
          </div>
          <p>ex: 期限, 降りる..</p>
        </div>
      }
      showArrow={true}
    >
      <MessageCircleWarning className='text-yellow-400 dark:text-yellow-600' size={24} />
    </Tooltip>
  );
};
