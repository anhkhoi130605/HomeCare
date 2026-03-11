export const welcomeData = {
    user: {
        name: "Michael Aris",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGHG54qWNcYq17O8ImGtwAX3PgjtZRhN6G5XS-Cr4bu8CJQhHA-wM2gPrx8ZPPcQFLKwytTauGe8VRTPzvLAVuXMmEzWnSMIlD-OIYr3zRHHB2GpqCTEHZQiSw8T2pKpECUtjFe4DJXJxyesFpDuylZJFIDipmmunJRtRi2OjN3bUEUZftGlisTKT3vl8MjENkjlE08TKghZyayc6JFIzcldKySYbikNo_PQXuMXyQJkvinn9N6W8-Kw7Da0Mf6zkJd1PBv6CB2LBd",
    },
    sidebar: [
        { icon: "dashboard", label: "Dashboard" },
        { icon: "groups", label: "Patients" },
        { icon: "calendar_month", label: "Care Schedule" },
        { icon: "add_to_photos", label: "Book Service" },
        { icon: "list_alt", label: "Requests" },
        { icon: "description", label: "Contracts" },
        { icon: "payments", label: "Payments" },
        { icon: "health_metrics", label: "Health Report" },
    ],
    hero: {
        slides: [
            {
                badge: "Trusted Home Healthcare",
                title: {
                    main: "Professional Care",
                    highlight: "at Your Fingertips",
                },
                description: "Experience peace of mind with a dedicated team focused on your family's health and wellness journey. Friendly, professional, and always here for you.",
                bgImage: "/images/banner2.png",
            },
            {
                badge: "Compassionate Support",
                title: {
                    main: "Your Health",
                    highlight: "Our Priority",
                },
                description: "Personalized care plans designed to meet your unique needs. We treat you like family, ensuring the highest quality of life at home.",
                bgImage: "/images/hero2.jpeg",
            }
        ]
    },
    philosophy: {
        title: "Our Care Philosophy",
        subtitle: "We provide more than just medical support; we offer a companion for your loved one's wellness journey.",
        features: [
            {
                icon: "vital_signs",
                title: "Daily Monitoring",
                description: "Live health metrics and activity logs, ensuring you stay connected and informed about every heartbeat.",
                colSpan: "col-span-12 md:col-span-8",
                bgClass: "bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800",
                iconBg: "bg-primary/10",
                iconColor: "text-primary",
                subTitle: "Real-time Data"
            },
            {
                icon: "medication",
                title: "Medication",
                description: "Smart scheduling and refill alerts to keep treatment perfectly on track.",
                colSpan: "col-span-12 md:col-span-4",
                bgClass: "bg-warm-accent/30 dark:bg-stone-800/50 border-primary/10 dark:border-stone-700",
                iconBg: "bg-primary shadow-lg shadow-primary/20",
                iconColor: "text-white",
            },
            {
                icon: "exercise",
                title: "Physical Therapy",
                description: "Personalized mobility sessions delivered by certified experts at home.",
                colSpan: "col-span-12 md:col-span-4",
                bgClass: "bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800",
                iconBg: "bg-secondary-orange/10",
                iconColor: "text-secondary-orange",
            },
            {
                // Special card for emergency
                isEmergency: true,
                title: "24/7 Rapid Response",
                description: "Immediate assistance is just a button away. Our rapid dispatch team is trained for critical home care emergencies.",
                colSpan: "col-span-12 md:col-span-8",
                bgClass: "bg-stone-900 dark:bg-stone-800 text-white",
            }
        ]
    },
    story: {
        title: "Connecting Hearts,\nTransforming Lives",
        description: "We believe everyone deserves the dignity of professional healthcare in the comfort of their own home. Our platform was born from a desire to merge cutting-edge technology with the warmth of human touch.",
        stats: [
            { value: "98%", label: "Patient Satisfaction", color: "text-primary" },
            { value: "15k+", label: "Happy Families", color: "text-secondary-orange" }
        ],
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_ZslH6uEb1u_tH9CyfqNVM6KxlLmj5y08CDkVL01DcCBFGJ00QJ8mizxgobr8ZgcXmlmGmLRfEZTRRaUngagyQANw2rxrMCN-j1Zj19tPn0ZExndWp_40VSoyKMam49tG7UIHbSqPX5AvAG8yX_YhcWZUZUNRP1csmGskolk1oqWVnw_u3ZNQ6REuP07EyG5XqVJD_At3Ni_Pr4y8Wp1Oy6xeWmASN_ICLCCJZEDuU2YvH_delQDjAjpzqjrhYPMb-Fd37cdFgps_",
        testimonial: {
            text: "\"The care and attention my grandfather receives is truly world-class. It feels like family.\"",
            author: "Michael Aris"
        }
    },
    steps: {
        title: "How to Get Started",
        subtitle: "Three simple steps to transition your loved one into a world of professional care and comfort.",
        items: [
            { number: 1, title: "Register Patient", description: "Securely upload health records and share specific daily care preferences." },
            { number: 2, title: "Get Matched", description: "Our specialists find the perfect certified caregiver tailored to your needs." },
            { number: 3, title: "Track Real-time", description: "Monitor vitals and communicate with the care team through our secure portal." },
        ]
    },
    insights: [
        {
            title: "Tips for Quality Elder Care at Home",
            description: "Creating a safe and engaging environment for seniors requires a balance of safety and activity.",
            readTime: "5 min read",
            category: "Elder Care",
            icon: "elderly",
            bgHeader: "bg-warm-accent",
            iconColor: "text-primary"
        },
        {
            title: "Balanced Nutrition for Home Recovery",
            description: "Proper meal planning can accelerate recovery and boost energy levels for patients of all ages.",
            readTime: "8 min read",
            category: "Nutrition",
            icon: "restaurant",
            bgHeader: "bg-orange-100",
            iconColor: "text-secondary-orange"
        },
        {
            title: "Managing Daily Vitals Effectively",
            description: "Learn how to use digital tools to track blood pressure and oxygen levels without the stress.",
            readTime: "4 min read",
            category: "Health Tech",
            icon: "ecg_heart",
            bgHeader: "bg-amber-100",
            iconColor: "text-amber-600"
        }
    ],
    features: [
        {
            title: "Vetted Professionalism",
            description: "Rigorous background checks and skill assessments for every team member on our platform.",
            icon: "verified_user",
            iconBg: "bg-warm-accent",
            iconColor: "text-primary"
        },
        {
            title: "Honest Billing",
            description: "No hidden fees. Just clear, transparent invoicing for the high-quality care you receive.",
            icon: "receipt_long",
            iconBg: "bg-orange-50",
            iconColor: "text-secondary-orange"
        }
    ]
};