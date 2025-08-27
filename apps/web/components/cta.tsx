import Link from "next/link";

export const Cta = () => {
  return (
    <section className="my-[4rem] flex_center">
      <div className="fixed_width flex_center">
        <div className="border  border-dashed border-border p-7 w-full flex flex-col text-center p-3 py-12">
          <h4 className="text-3xl md:text-4xl font-bold tracking-[-1px]">
            Start Respecting User Privacy Today
          </h4>
          <p className="text-sm md:text-[1.28rem] text-center mb-7 mt-2 text-neutral-600 md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold text-center">
            Join the movement for a more private and ethical web. Get started
            with Supametrics for free.
          </p>
          <div className="mt-6 font-medium flex gap-2 flex-col md:w-[65%] md:mx-auto">
            <Link
              href="/signup"
              className="text-[0.9rem] px-6 md:px-7 py-2 md:py-3 bg-black dark:bg-white text-white dark:text-black rounded-3xl hover:bg-neutral-300 dark:hover:bg-neutral-200"
            >
              Start Now
            </Link>
            <Link
              href="/contact"
              className="font-medium text-[0.9rem] px-6 md:px-7 py-2 md:py-3 bg-white border text-black dark:bg-black text-400 rounded-3xl dark:text-neutral-500 dark:border-neutral-800 hover:bg-neutral-500 dark:hover:bg-neutral-900"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
