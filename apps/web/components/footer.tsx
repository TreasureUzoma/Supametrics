import Link from "next/link";
import footer from "@/data/footer.json";
import {
  BrandTwitter,
  BrandFacebook,
  BrandLinkedin,
  BrandYoutube,
  BrandGithub,
} from "tabler-icons-react";
import Logo from "./logo";
import { ModeToggle } from "./mode-toggle";

const Footer = () => {
  return (
    <footer className="py-8 flex_center mt-[5rem]">
      <div className="fixed_width">
        <div className="mb-12 md:hidden">
          <Logo />
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-8 md:flex md:flex-wrap md:justify-between">
          {Object.entries(footer).map(([sectionTitle, links]) => (
            <div key={sectionTitle} className="min-w-[150px]">
              <h4 className="text-base font-semibold mb-3">{sectionTitle}</h4>
              <ul className="space-y-2">
                {links.map((link) => {
                  const isExternal = link.url.startsWith("http");
                  return (
                    <li key={link.name} className="flex items-center space-x-2">
                      {isExternal ? (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="supametrics-link flex items-center space-x-2"
                        >
                          {/* Check if it's a social link */}
                          {link.name === "Twitter" && (
                            <BrandTwitter size={18} />
                          )}
                          {link.name === "Facebook" && (
                            <BrandFacebook size={18} />
                          )}
                          {link.name === "LinkedIn" && (
                            <BrandLinkedin size={18} />
                          )}
                          {link.name === "YouTube" && (
                            <BrandYoutube size={18} />
                          )}
                          {link.name === "Github" && <BrandGithub size={18} />}
                          <span>{link.name}</span>
                        </a>
                      ) : (
                        <Link
                          href={link.url}
                          className="supametrics-link flex items-center space-x-2"
                        >
                          <span>{link.name}</span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <div className="flex flex-col gap-4 mt-6">
            <div className="hidden md:block">
              <Logo />
            </div>
            <p className="text-[0.87rem]">
              &copy; Copyright {new Date().getFullYear()}
            </p>
          </div>
        </div>
        <div className="mt-6 border-t border-border pt-4 flex justify-between items-center text-sm">
          <div className="flex_between w-full">
            <a
              href="https://status.supametrics.com"
              target="_blank"
              rel="noreferrer"
              className="text-green-500 flex_center gap-2"
            >
              <span className="text-2xl">•</span>
              <span> All system working fine</span>
            </a>
            <ModeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
