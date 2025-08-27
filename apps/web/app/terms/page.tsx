import { Cta } from "@/components/cta";
import { Hero } from "@/components/shared-hero";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use - Supametrics",
};

const Page = () => {
  return (
    <>
      <Hero title="Terms of Use" subtitle="Last updated: 5 December, 2025" />
      <main>
        <div className="flex_center">
          <main className="max-w-5xl mx-auto px-6 py-12 text-gray-700 dark:text-gray-300">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="mb-7 text-[0.88em] leading-6">
                By accessing or using our services, you agree to be bound by
                these Terms of Service and our Privacy Policy. If you do not
                agree to these terms, you may not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                2. Description of Services
              </h2>
              <p className="mb-7 text-[0.88em] leading-6">
                Our platform provides real-time analytics, link tracking, and
                insights for your digital projects. We offer various tiers of
                service, from free to enterprise plans, each with specific
                features and limitations outlined on our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. User Obligations</h2>
              <p className="mb-4 text-[0.88em] leading-6">
                You agree to use our services in compliance with all applicable
                laws and regulations. You are responsible for maintaining the
                confidentiality of your account credentials and for all
                activities that occur under your account.
              </p>
              <ul className="list-disc ml-6 text-[0.88em] leading-6">
                <li className="mb-2">
                  Do not use the service for unlawful purposes or to distribute
                  harmful content.
                </li>
                <li className="mb-2">
                  Do not attempt to reverse engineer or exploit any part of the
                  platform.
                </li>
                <li className="mb-7">
                  Provide accurate and complete information when creating an
                  account.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                4. Data Collection and Privacy
              </h2>
              <p className="mb-7 text-[0.88em] leading-6">
                We collect, process, and store data as outlined in our{" "}
                <Link
                  href="/privacy"
                  className="text-main dark:text-white font-semibold hover:underline"
                >
                  Privacy Policy
                </Link>
                . By using our service, you consent to this data collection. We
                are committed to maintaining the confidentiality and security of
                your data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                5. Payment and Subscription
              </h2>
              <p className="mb-4 text-[0.88em] leading-6">
                For paid plans, you agree to provide a valid payment method and
                authorize us to charge for subscription fees. Failure to pay may
                result in suspension or termination of your account.
              </p>
              <p className="mb-4 text-[0.88em] leading-6">
                Subscriptions are billed on a recurring basis and renew
                automatically unless canceled in advance..
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Termination</h2>
              <p className="mb-4 text-[0.88em] leading-6">
                We reserve the right to suspend or terminate your account at any
                time for any reason, including violations of these terms. Upon
                termination, your right to use our services will cease
                immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                7. Limitation of Liability
              </h2>
              <p className="mb-4 text-[0.88em] leading-6">
                To the fullest extent permitted by law, we shall not be liable
                for any indirect, incidental, or consequential damages arising
                from your use of our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                8. Modifications to Terms
              </h2>
              <p className="mb-4 text-[0.88em] leading-6">
                We may update these terms from time to time. Continued use of
                our services after changes are made constitutes acceptance of
                the revised terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Governing Law</h2>
              <p className="mb-4 text-[0.88em] leading-6">
                These terms shall be governed by and construed in accordance
                with the laws of [Your Jurisdiction]. Any disputes shall be
                resolved in the courts of [Your Jurisdiction].
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
              <p className="mb-4 text-[0.88em] leading-6">
                If you have any questions about these Terms of Service, please
                contact us at{" "}
                <a
                  href="mailto:support@supametrics.com"
                  className="text-main dark:text-white font-semibold hover:underline"
                >
                  support@supametrics.com
                </a>
                .
              </p>
            </section>
          </main>
        </div>
        <Cta />
      </main>
    </>
  );
};

export default Page;
