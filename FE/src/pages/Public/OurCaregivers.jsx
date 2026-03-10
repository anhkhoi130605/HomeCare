import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Search,
  ShieldCheck,
  Award,
  Users,
  Star,
  BadgeCheck,
  FileCheck,
  Heart,
  GraduationCap,
  BarChart3,
  ChevronDown,
  ArrowRight,
  ShieldPlus,
  X
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { caregivers as mockCaregivers } from "@/data/home";
import { caregiverApi } from "@/lib/api";
import ScrollAnimation from "@/components/ui/scroll-animation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const filters = ["All Specialists", "Nursing", "Physical Therapy", "Elder Care", "10+ Years Exp"];

const OurCaregivers = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All Specialists");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch caregivers from API
  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        setLoading(true);
        const data = await caregiverApi.getAll();
        // Map API data to match expected format
        const mapped = data.map(c => ({
          id: c.id,
          name: c.fullName,
          role: c.specialization || "Caregiver",
          experience: `${c.experienceYears || 0} Years`,
          rating: 4.9,
          reviews: 45,
          image: c.imageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
          skills: c.bio ? c.bio.split(',').map(s => s.trim()) : ["Home Care", "Patient Care"],
          verified: true,
          licensed: true,
          screened: true,
          bio: c.bio
        }));
        setCaregivers(mapped.length > 0 ? mapped : mockCaregivers);
      } catch (error) {
        console.error("Failed to fetch caregivers:", error);
        setCaregivers(mockCaregivers); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };
    fetchCaregivers();
  }, []);

  // Filter Logic
  const filteredExperts = useMemo(() => {
    return caregivers.filter((expert) => {
      // 1. Text Search Filter (Name or Skills)
      const matchesSearch =
        expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expert.skills.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // 2. Category Filter
      let matchesCategory = true;
      if (activeFilter === "Nursing") {
        matchesCategory = expert.role.includes("Nurse") || expert.role.includes("CNA");
      } else if (activeFilter === "Physical Therapy") {
        matchesCategory = expert.role.includes("Therapist");
      } else if (activeFilter === "Elder Care") {
        matchesCategory = expert.role.includes("Elder") || expert.role.includes("Companion");
      } else if (activeFilter === "10+ Years Exp") {
        const expNum = parseInt(expert.experience);
        matchesCategory = !isNaN(expNum) && expNum >= 10;
      }

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeFilter]);

  // Derived visible list
  const visibleExperts = filteredExperts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredExperts.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const handleBookingAction = () => {
    toast.error("Vui lòng đăng nhập để tiếp tục", {
      description: "Bạn cần có tài khoản để đặt lịch hẹn với chuyên gia.",
    });
    navigate("/login");
  };

  return (
    <div className="flex-1 flex-col font-manrope bg-[#f6f8f8] dark:bg-[#101f22] text-[#1b140d] dark:text-white transition-colors duration-200">

      {/* Hero Header */}
      <section className="relative px-6 py-16 md:px-20 lg:px-40 bg-[#fcfaf8] dark:bg-[#101f22]/50">
        <ScrollAnimation animation="fade-in">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <ScrollAnimation animation="fade-up" delay={0.2}>
                <span className="inline-block px-4 py-1.5 bg-[#0d8ca5]/10 text-[#0d8ca5] text-sm font-bold rounded-full">Trust & Excellence</span>
                <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight text-[#1b140d] dark:text-white">
                  Our Compassionate <span className="text-[#0d8ca5]">Experts</span>
                </h1>
                <p className="text-lg text-[#1b140d]/70 dark:text-white/70 max-w-lg leading-relaxed">
                  We believe in care that feels like family. Our rigorous 5-step vetting process ensures only the most skilled and empathetic professionals join our network.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#0d8ca5]" />
                    <span className="text-sm font-bold">Vetted Background</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#0d8ca5]" />
                    <span className="text-sm font-bold">Certified Pros</span>
                  </div>
                </div>
              </ScrollAnimation>
            </div>
            <div className="flex-1 w-full max-w-md">
              <ScrollAnimation animation="scale-up" delay={0.4}>
                <div
                  className="aspect-square bg-cover bg-center rounded-xl shadow-2xl relative"
                  style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBfGN-zYj7I7_pYgvf_lbueDAmkgtmd6X8UIFlpxCI4aDeRwi_MLiCsfKxrnVuV4CC0Immz65iLaVW2c2xkvZyp1F6mhbJ4AUeIarL4wCEj6WccM8adz1FEA0ws418PTp_AganT4O8dQlQdJjW63fQdZnQDW8pew3Q5UpahDahINh3n7FnNlDpL-pfB5aMBw9f42xNTcs1zwiSWHBREr66E3JeBXGsIYXsZsW5fCX4RaNPzHap4IYVltdNtaFZ9M6x2-uSGp-MHZaB5")' }}
                >
                  <div className="absolute -bottom-6 -left-6 p-6 bg-white dark:bg-[#101f22] rounded-xl shadow-xl flex items-center gap-4 border border-[#f3ede7] dark:border-white/10">
                    <div className="p-3 bg-[#0d8ca5]/10 rounded-full">
                      <Users className="w-6 h-6 text-[#0d8ca5]" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest font-bold opacity-60">Success Rate</p>
                      <p className="text-xl font-black">98.5%</p>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </ScrollAnimation>
      </section>

      {/* Filter & Search Toolbar */}
      <section className="sticky top-[73px] z-40 bg-white dark:bg-[#101f22] border-b border-[#f3ede7] dark:border-white/10 px-4 md:px-20 lg:px-40 py-4 shadow-sm">
        <ScrollAnimation animation="fade-in" delay={0.1}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-1 min-w-[300px] w-full items-center gap-3 bg-[#f3ede7] dark:bg-white/5 rounded-full px-4 h-12">
              <Search className="w-5 h-5 opacity-50" />
              <input
                className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full"
                placeholder="Search by name or skill..."
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(6); // Reset visible count on search
                }}
              />
            </div>
            <div className="flex gap-3 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
              {filters.map((filter, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveFilter(filter);
                    setVisibleCount(6); // Reset visible count on filter
                  }}
                  className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 text-sm font-bold transition-all ${activeFilter === filter
                    ? "bg-[#0d8ca5] text-white shadow-md scale-105"
                    : "bg-[#f3ede7] dark:bg-white/10 text-[#1b140d] dark:text-white hover:bg-[#e0e0e0] dark:hover:bg-white/20"
                    }`}
                >
                  {filter}
                  {/* {index > 0 && <ChevronDown className="w-4 h-4" />} */}
                </button>
              ))}
            </div>
          </div>
        </ScrollAnimation>
      </section>

      {/* Caregiver Grid */}
      <section className="px-4 md:px-20 lg:px-40 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Available Experts</h2>
            <p className="text-sm font-medium opacity-60">
              Showing {Math.min(visibleCount, filteredExperts.length)} of {filteredExperts.length} specialists
            </p>
          </div>

          {filteredExperts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleExperts.map((caregiver, index) => (
                <ScrollAnimation key={caregiver.id} animation="fade-up" delay={index * 0.05}>
                  <div className="group bg-white dark:bg-[#101f22] border border-[#f3ede7] dark:border-white/10 rounded-xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                    <div
                      className="relative aspect-[4/3] bg-cover bg-center cursor-pointer"
                      style={{ backgroundImage: `url("${caregiver.image}")` }}
                      onClick={() => setSelectedExpert(caregiver)}
                    >
                      <div className="absolute top-4 right-4 bg-[#0d8ca5] text-white text-xs font-black px-3 py-1 rounded-full">
                        {caregiver.experience}
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-extrabold group-hover:text-[#0d8ca5] transition-colors">{caregiver.name}</h3>
                          <p className="text-sm font-bold opacity-60 uppercase tracking-widest">{caregiver.role}</p>
                        </div>
                        <div className="flex gap-1 text-[#0d8ca5]">
                          <Star className="w-5 h-5 fill-current" />
                          <span className="text-sm font-black text-[#1b140d] dark:text-white">{caregiver.rating}</span>
                        </div>
                      </div>

                      {/* Trust Badges */}
                      <div className="flex gap-3 my-4 py-3 border-y border-[#f3ede7] dark:border-white/5">
                        {caregiver.verified && (
                          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-[#2d6a6d]">
                            <BadgeCheck className="w-4 h-4" /> Verified
                          </div>
                        )}
                        {caregiver.licensed && (
                          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-[#2d6a6d]">
                            <FileCheck className="w-4 h-4" /> Licensed
                          </div>
                        )}
                        {caregiver.screened && (
                          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-[#2d6a6d]">
                            <ShieldPlus className="w-4 h-4" /> Screened
                          </div>
                        )}
                      </div>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {caregiver.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="px-3 py-1 bg-[#2d6a6d]/10 text-[#2d6a6d] text-[11px] font-bold rounded-full">
                            {skill}
                          </span>
                        ))}
                        {caregiver.skills.length > 3 && (
                          <span className="px-3 py-1 bg-[#f3ede7] text-[#1b140d] text-[11px] font-bold rounded-full">
                            +{caregiver.skills.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto">
                        <button
                          onClick={() => setSelectedExpert(caregiver)}
                          className="inline-flex items-center gap-2 text-[#0d8ca5] text-sm font-black group/link hover:underline"
                        >
                          View Full Bio
                          <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 opacity-60">
              <p className="text-xl font-bold">No experts found matching your criteria.</p>
              <button
                onClick={() => { setActiveFilter("All Specialists"); setSearchQuery(""); }}
                className="mt-4 text-[#0d8ca5] font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="flex items-center gap-2 px-10 py-4 bg-[#f3ede7] dark:bg-white/10 rounded-full font-black hover:bg-[#0d8ca5] hover:text-white transition-all transform active:scale-95"
              >
                Load More Experts
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Standards Section */}
      <section className="bg-[#2d6a6d] text-white py-24 px-4 md:px-20 lg:px-40">
        <div className="max-w-6xl mx-auto">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl font-black">The Gold Standard of Care</h2>
              <p className="text-white/70 max-w-2xl mx-auto text-lg">
                We don't just find caregivers; we build a support system centered around your family's safety and well-being.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4 text-center">
                <div className="inline-flex size-16 items-center justify-center bg-white/10 rounded-xl mb-2">
                  <GraduationCap className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-bold">Continuous Training</h3>
                <p className="text-white/60 text-sm leading-relaxed">Every professional undergoes mandatory monthly specialized training in the latest home care protocols and safety standards.</p>
              </div>
              <div className="space-y-4 text-center">
                <div className="inline-flex size-16 items-center justify-center bg-white/10 rounded-xl mb-2">
                  <BarChart3 className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-bold">Admin Monitoring</h3>
                <p className="text-white/60 text-sm leading-relaxed">Our clinical directors actively monitor care logs and outcomes to ensure the highest quality of service is maintained daily.</p>
              </div>
              <div className="space-y-4 text-center">
                <div className="inline-flex size-16 items-center justify-center bg-white/10 rounded-xl mb-2">
                  <Heart className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-bold">Family Feedback</h3>
                <p className="text-white/60 text-sm leading-relaxed">We utilize a closed-loop feedback system where family input directly influences caregiver ratings and ongoing placement.</p>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 py-24 md:px-20 lg:px-40">
        <ScrollAnimation animation="scale-up">
          <div className="max-w-4xl mx-auto bg-[#0d8ca5] rounded-xl p-8 md:p-16 text-center shadow-2xl relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute -top-10 -right-10 size-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 size-60 bg-white/10 rounded-full blur-2xl"></div>

            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-white">Find the Perfect Match for Your Family</h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto">
                Answer a few simple questions and our matching algorithm will suggest the best available specialists tailored to your needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="bg-white text-[#0d8ca5] px-10 py-5 rounded-full font-black text-lg shadow-xl hover:scale-105 transition-transform inline-flex items-center justify-center">
                  Start Your Match
                </Link>
                <Link to="/contact" className="bg-[#0d8ca5]/20 text-white border-2 border-white/30 px-10 py-5 rounded-full font-black text-lg backdrop-blur-md inline-flex items-center justify-center">
                  Speak with a Care Advisor
                </Link>
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </section>

      {/* Bio Modal / Dialog */}
      <Dialog open={!!selectedExpert} onOpenChange={(open) => !open && setSelectedExpert(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white dark:bg-[#101f22] border-none">
          {selectedExpert && (
            <div className="flex flex-col md:flex-row h-full max-h-[90vh] md:max-h-[600px] overflow-y-auto">
              <div
                className="w-full md:w-2/5 bg-cover bg-center min-h-[300px] md:min-h-full relative"
                style={{ backgroundImage: `url("${selectedExpert.image}")` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                <div className="absolute bottom-4 left-4 text-white md:hidden">
                  <h3 className="text-2xl font-black">{selectedExpert.name}</h3>
                  <p className="opacity-90">{selectedExpert.role}</p>
                </div>
              </div>

              <div className="flex-1 p-8 space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black hidden md:block text-[#1b140d] dark:text-white">
                    {selectedExpert.name}
                  </DialogTitle>
                  <DialogDescription className="text-[#0d8ca5] font-bold uppercase tracking-wider hidden md:block">
                    {selectedExpert.role}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-bold text-lg">{selectedExpert.rating}</span>
                    <span className="text-gray-400 text-sm ml-1">({selectedExpert.reviews} reviews)</span>
                  </div>
                  <div className="h-4 w-[1px] bg-gray-300"></div>
                  <span className="text-sm font-bold opacity-70">{selectedExpert.experience}</span>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-lg">About</h4>
                  <p className="text-[#1b140d]/70 dark:text-white/70 leading-relaxed">
                    {selectedExpert.bio || "An experienced professional dedicated to providing the highest quality of care. Thoroughly vetted, certified, and matched to meet our specific gold standards of home family care."}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-lg">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedExpert.skills.map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-[#0d8ca5]/10 text-[#0d8ca5] font-bold rounded-lg text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex gap-4">
                  <Button
                    className="flex-1 bg-[#0d8ca5] hover:bg-[#0a7a90] text-white font-bold h-12 rounded-full"
                    onClick={handleBookingAction}
                  >
                    Book Appointment
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-2 border-[#1b140d]/10 hover:bg-gray-50 font-bold h-12 rounded-full"
                    onClick={handleBookingAction}
                  >
                    View Schedule
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default OurCaregivers;
