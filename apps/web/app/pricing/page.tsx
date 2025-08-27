import { Cta } from "@/components/cta";
import { Hero } from "@/components/shared-hero";
import { Metadata } from "next";
import { Pricing } from "@/components/pricing";
import { Testimonials } from "@/components/testimonials";

export const metadata: Metadata = {
  title: "Pricing - Supametrics",
};
const Page = () => {
  return (
    <>
      <Hero />
      <main>
        <Pricing />
        <Testimonials />
        <Cta />
      </main>
    </>
  );
};

export default Page;
