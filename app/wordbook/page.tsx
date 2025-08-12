import { title } from "@/components/primitives";
import { WordCardGrid } from "./_components";

export default function AboutPage() {
  return (
    <div className="w-full">
      <h1 className={title()}>내 단어</h1>

      <div className="mt-8">
        <WordCardGrid />
      </div>
    </div>
  );
}
