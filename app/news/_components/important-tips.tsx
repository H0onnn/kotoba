import { CircleAlert } from "lucide-react";
import { Tooltip } from "@heroui/tooltip";

export const ImportantTips = () => {
  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-1 items-center">
          <p>1. 새로고침, 페이지 이탈 시 요약 데이터가 유실돼요</p>
          <p>2. 최대 1분 까지 시간이 소요될 수 있어요</p>
        </div>
      }
      showArrow={true}
    >
      <CircleAlert size={24} className="text-red-400 dark:text-red-600" />
    </Tooltip>
  );
};
