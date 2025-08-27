import { Info } from "lucide-react";
import { Card, CardBody } from "@heroui/card";

export const ImportantTips = () => {
  return (
    <Card className="w-full bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800">
      <CardBody className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Info size={20} className="text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-800 dark:text-green-200">
              알아두세요!
            </span>
          </div>
        </div>

        <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
          <p>• 새로고침, 페이지 이탈 시 요약 데이터가 유실돼요</p>
          <p>• 기사 내용에 따라 최대 1분까지 시간이 소요될 수 있어요</p>
        </div>
      </CardBody>
    </Card>
  );
};
