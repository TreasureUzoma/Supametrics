import { Cta } from "@/components/cta";
import { Hero } from "@/components/shared-hero";
import {
  IconBuilding,
  IconMessage,
  IconBrandYoutube,
  IconBrandTwitter,
  IconBrandLinkedin,
} from "@tabler/icons-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Supametrics",
};

const Page = () => {
  const socialLinks = [
    {
      icon: IconBrandYoutube,
      title: "Follow us on YouTube",
      description:
        "For tutorials on how to integrate Supametrics and learn more about us.",
      linkText: "Follow @supametrics",
      linkHref: "https://youtube.com/supametrics",
    },
    {
      icon: IconBrandTwitter,
      title: "Follow us on X",
      description: "Get the latest updates, tips, and news about our platform.",
      linkText: "Follow @supametrics",
      linkHref: "https://twitter.com/supametrics",
    },
    {
      icon: IconBrandLinkedin,
      title: "Connect on LinkedIn",
      description:
        "Build professional connections and stay updated with our latest announcements.",
      linkText: "Connect with us",
      linkHref: "https://linkedin.com/company/supametrics",
    },
  ];

  return (
    <>
      <Hero title="Contact Us" subtitle="We would love to hear from you!" />
      <main>
        <div className="flex_center">
          <div className="fixed_width md:px-12">
            <div className="grid md:grid-cols-2">
              <div className="border border-neutral-200 dark:border-neutral-900 flex flex-col px-9 py-10 gap-8">
                <IconMessage size={45} />
                <h3 className="font-semibold text-4xl">Product support.</h3>
                <p className="font-medium text-neutral-600 dark:text-neutral-400 md:text-lg">
                  Get help from the community. If you&apos;re on a paid plan,
                  submit a ticket to our support team.
                </p>
                <div className="font-semibold text-zinc-500 dark:text-zinc-400">
                  <a
                    href="mailto:support@analytix.dev"
                    className="text-[0.88rem] md:text-[0.96rem] px-6 md:px-7 py-2 md:py-3 bg-black dark:bg-white text-white dark:text-black rounded-3xl hover:bg-neutral-300 dark:hover:bg-neutral-200"
                  >
                    Email Us
                  </a>
                </div>
              </div>
              <div className="border border-neutral-200 dark:border-neutral-900 flex flex-col px-9 py-10 gap-8">
                <IconBuilding size={45} />
                <h3 className="font-semibold text-4xl">
                  Talk to our Sales team.
                </h3>
                <p className="font-medium text-neutral-600 dark:text-neutral-400 md:text-lg">
                  Discuss your requirements, learn about custom pricing, or
                  request a demonstration.
                </p>
                <div className="font-semibold text-zinc-500 dark:text-zinc-400">
                  <a
                    href="mailto:sales@analytix.dev"
                    className="text-[0.88rem] md:text-[0.96rem] px-6 md:px-7 py-2 md:py-3 bg-black dark:bg-white text-white dark:text-black rounded-3xl hover:bg-neutral-300 dark:hover:bg-neutral-200"
                  >
                    Email Sales Team
                  </a>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 mt-12 md:mt-0">
              {socialLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <div
                    key={index}
                    className="border border-neutral-200 dark:border-neutral-900 flex flex-col px-9 py-10 gap-8"
                  >
                    <Icon size={45} />
                    <p className="font-medium text-neutral-600 dark:text-neutral-400 md:text-lg">
                      <b className="text-black dark:text-white">{link.title}</b>
                      <br />
                      {link.description}
                    </p>
                    <div className="font-semibold text-zinc-500 dark:text-zinc-400">
                      <a
                        href={link.linkHref}
                        className="text-[0.88rem] md:text-[0.96rem] px-6 md:px-7 py-2 md:py-3 bg-white border text-black dark:bg-black text-400 rounded-3xl dark:text-zinc-500 dark:border-neutral-800 hover:bg-neutral-500 dark:hover:bg-neutral-900"
                      >
                        {link.linkText}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <Cta />
      </main>
    </>
  );
};

export default Page;
