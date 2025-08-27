import { Cta } from "@/components/cta";
import { Hero } from "@/components/shared-hero";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Supametrics",
};

const Page = () => {
  return (
    <>
      <Hero title="Privacy Pollicy" subtitle="Last updated: 13 June, 2025" />
      <main>
        <div className="max-w-5xl mx-auto px-7 py-12 text-gray-700 dark:text-gray-300">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              1. Information We Collect
            </h2>
            <p className="text-[0.88em] mb-4 leading-6">
              We collect the following types of information to provide and
              improve our services:
            </p>
            <ul className="list-disc ml-6 text-[0.88em] leading-6">
              <li className="mb-2">
                Personal information you provide during account creation (e.g.,
                name, email address).
              </li>
              <li className="mb-2">
                Usage data, such as your activity on the platform and features
                used.
              </li>
              <li>
                Device and browser information, such as IP address, operating
                system, and cookies.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-[0.88em] mb-4 leading-6">
              The information we collect is used for the following purposes:
            </p>
            <ul className="list-disc ml-6 text-[0.88em] leading-6">
              <li className="mb-2">To provide and maintain our services.</li>
              <li className="mb-2">
                To analyze usage and improve the platform&apos;s functionality.
              </li>
              <li className="mb-2">
                To send updates, promotional offers, or service-related
                notifications.
              </li>
              <li>To ensure the security and integrity of our services.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              3. Sharing of Information
            </h2>
            <p className="text-[0.88em] mb-4 leading-6">
              We do not sell your personal information. However, we may share
              your data with:
            </p>
            <ul className="list-disc ml-6 text-[0.88em] leading-6">
              <li className="mb-2">
                Third-party service providers who assist with platform
                functionality.
              </li>
              <li className="mb-2">
                Legal authorities or regulatory bodies when required by law.
              </li>
              <li>
                Affiliates or partners for joint projects, provided proper
                safeguards are in place.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Data Retention</h2>
            <p className="text-[0.88em] mb-4 leading-6">
              We retain your information only as long as necessary for the
              purposes outlined in this policy or as required by law. Upon
              account deletion, your data is securely erased within a reasonable
              timeframe.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Security</h2>
            <p className="text-[0.88em] mb-4 leading-6">
              We implement industry-standard security measures to protect your
              data from unauthorized access, alteration, disclosure, or
              destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              6. Cookies and Tracking Technologies
            </h2>
            <p className="text-[0.88em] mb-4 leading-6">
              We use cookies and similar technologies to enhance your experience
              and analyze usage. You can control cookie preferences through your
              browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              7. Children&apos;s Privacy
            </h2>
            <p className="text-[0.88em] mb-4 leading-6">
              Our services are not directed at children under 16. We do not
              knowingly collect information from children. If you believe a
              child has provided personal data, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              8. Changes to This Policy
            </h2>
            <p className="text-[0.88em] mb-4 leading-6">
              We may update this Privacy Policy periodically. We will notify you
              of significant changes through our website or email.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
            <p className="text-[0.88em] mb-4 leading-6">
              If you have any questions about this policy, please contact us at{" "}
              <a
                href="mailto:support@supametrics.com"
                className="text-main dark:text-white font-semibold hover:underline"
              >
                support@ysupametrics.com
              </a>
              .
            </p>
          </section>
        </div>
        <Cta />
      </main>
    </>
  );
};

export default Page;
