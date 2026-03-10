import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ShieldCheck,
  Activity,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { trustFeatures, faqs } from "@/data/home";
import ScrollAnimation from "@/components/ui/scroll-animation";
import { serviceApi } from "@/lib/api";

export default function PricingSection() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await serviceApi.getAll(true);
        setServices(data || []);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-[#f6f8f8] dark:bg-[#101f22] text-[#1b140d] dark:text-[#f3ede7] min-h-screen font-manrope">
      {/* Navigation - Assuming Main Layout handles this, but adding spacing just in case */}
      <div className="w-full px-4 md:px-10 py-12 lg:py-20 max-w-[1200px] mx-auto">

        {/* Page Heading */}
        <ScrollAnimation animation="fade-up">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Transparent Care for <br className="hidden md:block" /> Every Family
            </h1>
            <p className="text-[#9a734c] dark:text-[#c0a080] text-lg max-w-2xl mx-auto">
              Choose the right level of support for your loved ones with our flexible plans and expert oversight.
            </p>
          </div>
        </ScrollAnimation>

        {/* Pricing Cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-4xl text-[#0d8ca5]">progress_activity</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
            {services.map((service, index) => {
              const isPopular = index === 1; // Arbitrary highlight middle one
              const isTealCard = service.name.includes("Recovery") || service.name.includes("Intensive");

              return (
                <ScrollAnimation key={service.id} animation="fade-up" delay={index * 0.1}>
                  <div
                    className={`flex flex-col rounded-lg p-8 transition-transform hover:scale-[1.02] duration-300 relative h-full ${isPopular
                      ? "border-2 border-[#0d8ca5] bg-[#0d8ca5]/5 dark:bg-[#0d8ca5]/10 shadow-2xl shadow-[#0d8ca5]/10"
                      : isTealCard
                        ? "border border-[#14b8a6]/30 bg-white dark:bg-[#2d2218]"
                        : "border border-[#e7dbcf] dark:border-[#3d2e1f] bg-white dark:bg-[#2d2218]"
                      }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0d8ca5] text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                        Most Popular
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className={`text-lg font-bold mb-2 ${isTealCard ? "text-[#14b8a6]" : ""}`}>
                        {service.name}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.pricePerHour ?? service.PricePerHour ?? 0)}</span>
                        <span className={`text-sm font-bold ${isPopular ? "text-[#0d8ca5]" : "text-[#9a734c]"
                          }`}>
                          /giờ
                        </span>
                      </div>
                      <p className={`text-xs mt-2 font-medium ${isPopular ? "text-[#0d8ca5]/80 italic" : "text-[#9a734c]"
                        }`}>
                        Flexible scheduling options
                      </p>
                    </div>

                    <Link
                      to={`/family/contracts/new?packageId=${service.id}`}
                      className={`w-full rounded-full py-3 font-bold mb-8 transition-all text-center block ${isPopular
                        ? "bg-[#0d8ca5] hover:bg-[#0d8ca5]/90 text-white shadow-lg shadow-[#0d8ca5]/30"
                        : isTealCard
                          ? "border-2 border-[#14b8a6] text-[#14b8a6] hover:bg-[#14b8a6] hover:text-white"
                          : "bg-[#f3ede7] dark:bg-[#3d2e1f] hover:bg-[#ebdccb] text-[#1b140d] dark:text-[#f3ede7]"
                        }`}
                    >
                      Choose Plan
                    </Link>

                    <div className="space-y-4 flex-1">
                      {/* Split description by newline or comma if simple string, assume array lines for now or just display text */}
                      <div className="flex gap-3 text-sm font-medium">
                        {isPopular ? (
                          <ShieldCheck className="w-5 h-5 text-[#0d8ca5] shrink-0" />
                        ) : isTealCard ? (
                          <Activity className="w-5 h-5 text-[#14b8a6] shrink-0" />
                        ) : (
                          <CheckCircle2 className={`w-5 h-5 shrink-0 ${isTealCard ? "text-[#14b8a6]" : "text-[#0d8ca5]"}`} />
                        )}
                        <span className="whitespace-pre-line">{service.description}</span>
                      </div>
                    </div>
                  </div>
                </ScrollAnimation>
              );
            })}
          </div>
        )}

        {/* Trust Badges */}
        <ScrollAnimation animation="fade-in">
          <div className="bg-[#f3ede7] dark:bg-[#3d2e1f] rounded-lg p-10 mb-24">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold">Trust & Security Standards</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {trustFeatures.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center gap-4">
                  <div className="bg-white dark:bg-[#524131] size-16 rounded-full flex items-center justify-center text-[#0d8ca5] shadow-sm">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{feature.title}</h4>
                    <p className="text-sm text-[#9a734c]">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollAnimation>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-6">
          <ScrollAnimation animation="fade-up">
            <h2 className="text-3xl font-black text-center mb-10">Frequently Asked Questions</h2>
          </ScrollAnimation>
          {faqs.map((faq, index) => (
            <ScrollAnimation key={index} animation="fade-up" delay={index * 0.05}>
              <div className="border-b border-[#e7dbcf] dark:border-[#3d2e1f] pb-6">
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between text-left group"
                >
                  <span className="text-lg font-bold group-hover:text-[#0d8ca5] transition-colors pr-4">
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <ChevronUp className="text-[#0d8ca5] shrink-0" />
                  ) : (
                    <ChevronDown className="text-[#0d8ca5] shrink-0" />
                  )}
                </button>
                <div
                  className={`mt-4 text-[#9a734c] text-sm leading-relaxed overflow-hidden transition-all duration-300 ${openFaq === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  {faq.answer}
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>

        {/* Bottom CTA */}
        <ScrollAnimation animation="scale-up">
          <div className="mt-24 text-center bg-[#f3ede7] dark:bg-[#3d2e1f] rounded-lg p-12 border border-[#f3ede7] dark:border-[#3d2e1f]">
            <h2 className="text-3xl font-black mb-6">Need a custom plan?</h2>
            <p className="text-[#9a734c] mb-10 max-w-xl mx-auto">
              Our advisors are available for a 30-minute free consultation to discuss your family's unique situation and build a tailored care strategy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#0d8ca5] hover:bg-[#0d8ca5]/90 text-white rounded-full px-10 py-4 text-base font-bold transition-all shadow-xl shadow-[#0d8ca5]/30">
                Get a Free Consultation
              </button>
            </div>
          </div>
        </ScrollAnimation>

      </div>
    </div>
  );
}
