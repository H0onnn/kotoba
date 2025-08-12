import { title } from "@/components/primitives";
import { MainClient } from "./_components";

export default function Home() {
  return (
    <section className="flex flex-col gap-4 justify-center items-center py-8 md:py-10">
      <div className="inline-block justify-center max-w-xl text-center">
        <span className={title()}>오직&nbsp;</span>
        <span className={title({ color: "violet" })}>당신만의&nbsp;</span>
        <br />
        <span className={title()}>특별한 단어장을 만들어보세요.</span>
      </div>

      <div className="mt-8 w-full max-w-2xl">
        <MainClient />
      </div>
    </section>
  );
}
