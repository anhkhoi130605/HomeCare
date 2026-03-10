import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Heart,
  Activity,
  Clock,
  ShieldAlert,
  Stethoscope,
  CheckCircle2,
  Award,
  ClipboardCheck,
  Star
} from "lucide-react";
import { features, steps, careCircle, certifications, heroSlides } from "@/data/home";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ScrollAnimation from "@/components/ui/scroll-animation";
import { PinContainer } from "@/components/ui/3d-pin";

const HomePublic = () => {
  const [api, setApi] = useState(null);

  useEffect(() => {
    if (!api) {
      return;
    }

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 5000); // Auto-scroll every 5 seconds

    return () => clearInterval(intervalId);
  }, [api]);

  return (
    <div className="flex-1 font-manrope bg-[#fcfcf9] dark:bg-[#101f22] text-[#181611] dark:text-white transition-colors duration-300">

      {/* Hero Section */}
      <section className="w-full pb-12">
        <ScrollAnimation animation="fade-in">
          <Carousel className="w-full" opts={{ loop: true }} setApi={setApi}>
            <CarouselContent>
              {heroSlides.map((slide, index) => (
                <CarouselItem key={index} className="w-full pl-0">
                  <div
                    className="relative w-full min-h-[calc(100vh-4rem)] flex items-center justify-center text-center p-8 bg-cover bg-center"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url("${slide.image}")`
                    }}
                  >
                    <div className="max-w-3xl space-y-6 relative z-10">
                      <ScrollAnimation animation="fade-up" delay={0.2}>
                        <h1 className="text-white text-4xl md:text-7xl font-extrabold leading-tight tracking-tight">
                          {slide.title}
                        </h1>
                      </ScrollAnimation>
                      <ScrollAnimation animation="fade-up" delay={0.4}>
                        <p className="text-white/95 text-lg md:text-xl font-medium max-w-xl mx-auto">
                          {slide.description}
                        </p>
                      </ScrollAnimation>
                      <ScrollAnimation animation="fade-up" delay={0.6}>
                        <div className="pt-4">
                          <button className="rounded-full h-14 px-10 bg-[#0d8ca5] text-white text-lg font-bold shadow-2xl hover:bg-[#0d8ca5]/90 transition-all">
                            {slide.cta}
                          </button>
                        </div>
                      </ScrollAnimation>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:block">
              <CarouselPrevious className="relative left-0 top-0 translate-y-0 h-10 w-10 border-white/20 bg-black/20 text-white hover:bg-black/40 hover:text-white" />
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block">
              <CarouselNext className="relative left-0 top-0 translate-y-0 h-10 w-10 border-white/20 bg-black/20 text-white hover:bg-black/40 hover:text-white" />
            </div>
          </Carousel>
        </ScrollAnimation>
      </section>

      {/* Challenges Section */}
      <section className="px-6 lg:px-20 py-20 bg-[#fffdf5]/50 dark:bg-[#101f22]">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-16">
            <ScrollAnimation animation="fade-up">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4">The Challenges of Modern Care</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
                Caring for loved ones in today's fast-paced world brings unique pressures that we help you navigate with empathy and expertise.
              </p>
            </ScrollAnimation>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              let Icon = Clock;
              if (feature.title.includes("safety")) Icon = ShieldAlert;
              if (feature.title.includes("expertise")) Icon = Stethoscope;

              return (
                <ScrollAnimation key={index} animation="fade-up" delay={index * 0.1}>
                  <div className="bg-white dark:bg-white/5 p-10 rounded-[32px] border border-[#f0eee6] dark:border-white/10 space-y-6 hover:shadow-2xl transition-all duration-300 h-full">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${feature.color} ${feature.iconColor}`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                </ScrollAnimation>
              );
            })}
          </div>
        </div>
      </section>

      {/* Care Circle Section */}
      <section className="px-6 lg:px-20 py-24 bg-white dark:bg-[#101f22]/30">
        <div className="max-w-[1200px] mx-auto text-center mb-16">
          <ScrollAnimation animation="fade-up">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Your Family's Dedicated Care Circle</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              We create a seamless network of support, ensuring that information flows freely and care is never interrupted.
            </p>
          </ScrollAnimation>
        </div>
        <div className="max-w-[1000px] mx-auto relative px-4 py-12">
          {/* Animated Circle Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] border-4 border-dashed border-[#d1e9ed] rounded-full animate-spin-slow opacity-50"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {careCircle.map((item, index) => {
              let Icon = Users;
              if (item.title === "Caregivers") Icon = Heart;
              if (item.title === "Admin Monitoring") Icon = Activity;

              return (
                <ScrollAnimation key={index} animation="scale-up" delay={index * 0.15}>
                  <div className={`flex flex-col items-center gap-6 p-10 bg-white dark:bg-white/5 rounded-[32px] shadow-2xl text-center border border-gray-50 dark:border-white/5 ${index === 1 ? "md:-mt-12" : ""}`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${item.bg} ${item.color}`}>
                      <Icon className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                </ScrollAnimation>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="px-6 lg:px-20 py-24 bg-[#fcfcf9] dark:bg-[#101f22]/50">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2 space-y-10">
              <ScrollAnimation animation="slide-right">
                <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">How it Works: Transparency at every step</h2>
              </ScrollAnimation>
              <div className="space-y-12">
                {steps.map((step, index) => (
                  <ScrollAnimation key={index} animation="fade-up" delay={index * 0.1}>
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#0d8ca5] flex items-center justify-center text-white font-bold text-xl">
                        {step.number}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                        <p className="text-gray-500 dark:text-gray-400">{step.description}</p>
                      </div>
                    </div>
                  </ScrollAnimation>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 h-[600px] flex items-center justify-center">
              <ScrollAnimation animation="slide-left">
                <div className="flex items-center justify-center">
                  <PinContainer
                    title="How It Works"
                    href="./how-it-works"
                    className="bg-[#e6f8fb] border-none"
                  >
                    <div className="flex basis-full flex-col p-4 tracking-tight text-gray-800 sm:basis-1/2 w-[30rem] h-[30rem]">
                      <h3 className="max-w-xs !pb-2 !m-0 font-bold text-xl text-gray-900">
                        Expert Caregivers
                      </h3>
                      <div className="text-base !m-0 !p-0 font-normal">
                        <span className="text-gray-600">
                          Providing professional home care with empathy and expertise.
                        </span>
                      </div>
                      <div className="flex flex-1 w-full rounded-2xl mt-4 overflow-hidden relative shadow-inner">
                        <img
                          alt="Caregiver assisting elderly person with a tablet"
                          className="w-full h-full object-cover absolute inset-0 transform scale-105 hover:scale-110 transition-transform duration-500"
                          src="/images/how.jpg"
                        />
                      </div>
                    </div>
                  </PinContainer>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial & Trust Section */}
      <section className="px-6 lg:px-20 py-24 bg-white dark:bg-[#101f22]">
        <div className="max-w-[1200px] mx-auto">
          <ScrollAnimation animation="fade-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-[32px] overflow-hidden border border-[#f0eee6] shadow-xl">
              {/* Quote */}
              <div className="p-12 lg:p-16 flex flex-col justify-center space-y-8 bg-white dark:bg-white/5">
                <div className="text-[#0d8ca5] flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <blockquote className="text-2xl font-semibold text-gray-800 dark:text-white leading-relaxed">
                  "HomeCare didn't just provide a service; they provided peace of mind. Our caregiver Sarah feels like a member of our family now. Knowing my mother is safe allows me to focus on being her daughter again, not just her manager."
                </blockquote>
                <div className="flex items-center gap-4 pt-4">
                  <div className="size-14 rounded-full bg-gray-300 overflow-hidden ring-4 ring-gray-50">
                    <img
                      alt="User portrait"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEh7HEC046F14txoVmSjEDV0cUExkfjhq1InyzU_PO9HE62YBYbhmIR2aMXS-Ihoe4gyCzTIOplHdP1MI9Ozj8GdoRGrnpiszb1Yk5lY34dK9G6bNii1Oer8EAcM09N_ewsFYZjoUODyzj3nQDe8Kvs-7_lbDLQYYGeGXMBWom3GSBcFA7pyy0o6hMlQo08NOy0w8HoZ-4h7rHwjlz4YvwwC-Fl8I1EHL3f6r2Towr1O1wLnb1Nm-biXXljmFqYnVm9QtOeA5gOR1G"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Elena Rodriguez</p>
                    <p className="text-sm text-gray-500">Daughter & Client since 2022</p>
                  </div>
                </div>
              </div>

              {/* CertificationsGrid */}
              <div className="bg-[#e6f3f6] dark:bg-[#0d8ca5]/10 p-12 lg:p-16 flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-10">Certified for Excellence</h3>
                <div className="grid grid-cols-2 gap-6">
                  {certifications.map((cert, index) => {
                    let Icon = CheckCircle2;
                    if (cert.icon === 'workspace_premium') Icon = Award;
                    if (cert.icon === 'clinical_notes') Icon = ClipboardCheck;
                    if (cert.icon === 'diversity_1') Icon = Users;

                    return (
                      <div key={index} className="p-8 bg-white dark:bg-[#1a282b] rounded-[32px] text-center space-y-4 shadow-sm">
                        <div className="flex justify-center">
                          <Icon className="text-[#0d8ca5] w-10 h-10" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{cert.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 lg:px-20 py-32 bg-[#0d8ca5] text-white">
        <div className="max-w-[850px] mx-auto text-center space-y-10">
          <ScrollAnimation animation="scale-up">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">Give them the care they deserve</h2>
          </ScrollAnimation>
          <ScrollAnimation animation="fade-up" delay={0.2}>
            <p className="text-xl md:text-2xl font-medium opacity-90 max-w-2xl mx-auto">
              Join thousands of families who have found the perfect balance between professional care and personal connection.
            </p>
          </ScrollAnimation>
          <ScrollAnimation animation="fade-up" delay={0.4}>
            <div className="pt-6">
              <button className="rounded-full h-16 px-12 bg-white text-[#0d8ca5] text-xl font-bold hover:shadow-2xl transition-all hover:-translate-y-1">
                Start Your Journey
              </button>
            </div>
            <p className="text-sm font-semibold opacity-70 mt-4">No credit card required to explore our network.</p>
          </ScrollAnimation>
        </div>
      </section>

    </div>
  );
};

export default HomePublic;
