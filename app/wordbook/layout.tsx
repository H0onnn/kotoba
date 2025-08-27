export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="container flex-grow px-6 mx-auto max-w-7xl md:pt-16">
      <section className="flex flex-col gap-4 justify-center items-center py-8 md:py-10">
        <div className="inline-block justify-center text-center">
          {children}
        </div>
      </section>
    </main>
  );
}
