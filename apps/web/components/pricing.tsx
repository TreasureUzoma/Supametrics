import Link from "next/link";
import { Icons } from "@repo/ui/components/icons";
import tiers from "@repo/ui/data/pricing.json";

export const Pricing = () => {
  return (
    <section className="flex_center my-12 py-12 md:px-11">
      <div className="fixed_width">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-9 md:gap-4">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`border border-neutral-200 dark:border-neutral-900 md:min-h-[50rem] rounded-3xl p-6 border-2 flex flex-col justify-between ${
                index === 2 && "border-2 border-black dark:border-white"
              }`}
            >
              <div className="flex-col flex gap-8">
                <h5 className="font-semibold">{tier.name}</h5>
                <h4 className="font-bold text-4xl">{tier.price}</h4>
                <p className="text-[0.88rem]">{tier.description}</p>
                <ul className="space-y-4">
                  {tier.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="text-[0.88rem] flex items-center gap-3"
                    >
                      <Icons type="check" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-7 md:mt-0">
                <Link
                  href={tier.buttonLink}
                  className="border border-main dark:bg-main block text-center p-2 text-main dark:text-white rounded-sm"
                >
                  {tier.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
