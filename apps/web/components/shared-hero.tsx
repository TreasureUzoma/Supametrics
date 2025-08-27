import { Spotlight } from "@repo/ui/components/ui/spotlight";

export function Hero({
  title = "Need real-time analytics?<br /> We've got you covered",
  subtitle = "Scale your success with a plan that fits. Simple <br className='hidden md:block'/> pricing, no hidden fees.",
}) {
  return (
    <div className="h-[25rem] w-full dark:bg-black bg-white relative flex items-center justify-center overflow-hidden">
      {/* Radial gradient for a fading effect */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white"></div>

      <div className="text-center px-8 md:w-[49%] text-black dark:text-white md:px-0 relative z-10">
        {/* Use dangerouslySetInnerHTML for HTML parsing */}
        <h1
          className="text-4xl sm:text-5xl tracking-[-1px] font-bold relative z-20"
          dangerouslySetInnerHTML={{ __html: title }}
        ></h1>
        <p
          className="text-[0.98rem] md:text-[1.2rem] mt-5 leading-[1.4rem] md:leading-[2.2rem] px-3 md:px-0"
          dangerouslySetInnerHTML={{ __html: subtitle }}
        ></p>
      </div>
      <Spotlight />
    </div>
  );
}
