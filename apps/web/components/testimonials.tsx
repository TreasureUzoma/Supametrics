import { SectionHeader } from "./section-header";
import { InfiniteMovingCards } from "@repo/ui/components/ui/infinite-moving-cards";

export const Testimonials = () => {
  return (
    <section className="my-[4.3rem] flex_center">
      <div className="fixed_width">
        <SectionHeader words="Loved by Privacy Consious Teams" />
        <p className="text-sm md:text-[1.28rem] text-center mb-7 mt-2 text-neutral-600 md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold text-center">
          Join hundreds of companies that have made the switch to ethical
          analytics.
        </p>
        <div className="w-full space-y-3">
          {/* Top grid moving left */}
          <InfiniteMovingCards
            items={testimonials}
            direction="left"
            speed="normal"
          />
          {/* Bottom grid moving right */}
          <InfiniteMovingCards
            items={testimonials}
            direction="right"
            speed="normal"
          />
        </div>
      </div>
    </section>
  );
};

const testimonials = [
  {
    quote:
      "Using Supametrics platform, we increased our user retention by 35% within three months. The insights provided were actionable and incredibly detailed.",
    name: "Sarah Johnson",
    title: "Product Manager",
  },
  {
    quote:
      "This tool transformed how we approach data. The real-time analytics helped us optimize our marketing campaigns effectively.",
    name: "LeoWave",
    title: "Full Stack Developer",
  },
  {
    quote:
      "The dashboards are incredibly intuitive, and the customization options allowed us to tailor reports for different stakeholders.",
    name: "Emily Davis",
    title: "Business Analyst at Innovate Solutions",
  },
  {
    quote:
      "With this platform, we identified our key growth channels and scaled our user base by 50% in just six months.",
    name: "Michael Brown",
    title: "CEO",
  },
  {
    quote:
      "The segmentation features were a game changer. We now have a clearer understanding of user behavior and trends.",
    name: "Daniel Nweke",
    title: "Data Scientist at Insight Labs",
  },
];
