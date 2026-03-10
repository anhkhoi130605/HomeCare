export const FAMILY_MEMBERS = [
    {
        id: '1',
        name: 'Martha Wilson',
        age: 72,
        relation: 'Mother',
        status: 'At Home',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgvXVVJ-FSEwwUODcavLYCRc3dCboT8nivjza3_oTCsH-DxhUdSHSua9meeALdeA4mT9ldROP8uQ0p5pptTGQhQZeySCa5B9SAqygR6UixfKy72EfpWnACawNFZRnloOzu-seM-ynkCkda1qRpQt5WXXWxfD2Otkjtc3YcrzpV-lf3M69VmVlxQtu7RmcrF1HQMfAgOctolmKRct2kIQOjakhM7d4WMs4GPNbl48APiJJBbVyTY1L9ih3vVgwW7cbpScr-hREJr6hX',
        address: "123 Maple Avenue, Springfield",
        coordinates: "40.7128° N, 74.0060° W",
        locationImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
        caregiver: {
            name: 'Sarah Jenkins',
            role: 'Caregiver',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbGJnVqywB1647H8ch8MCLHmzqx5NkrdcOcOAB9z1mQUQ9-7_JJXrJyyjHEH2Yads21_tvcaBw6s7g5la6ZK9deMqARuPgIPnGAyHWr8dULaenGZrRZVuQcnHlJQlNK4RueYveHk6yUr0Gb1oIgWlD4GOdK40-PNCA8X0afkQXlyvj3B-VF9WhBH_RH3meA-zWOdvW5jNIaNFLMJ0zLmTlmNRTr9djHq17b3RfVlWOko886WLtnNMIgO7yx_-cbCI0HcXYw0COWPGm'
        },
        nextVisit: 'Today at 2:00 PM'
    },
    {
        id: '2',
        name: 'David Wilson',
        age: 75,
        relation: 'Father',
        status: 'Check-up',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGGGP8vxKYAGg3FukhQM522K5CGsnuLQDUVwUC4Ts5XFof2S7orFEGQVqLol8JdAenlDf_XG7EVZowbaEJkEuaNJx9w959b1WQJGE5V8QUq3fKANnNpuQAMiq55ORT51JWDTbyDiIYlNkreELXb9ceG7_l1Z23dt0nW0q2FxCMPrDcqaU4efKbG8ceyUXoo1bGDOqmFceQIScUpxVEUuypY9zCKq-PPlRRUNXGPxIRjy5kWhm7pNL5_Rxu9c3NY5w7H7tIz4KdFbbE',
        address: "45 Pine Street, Oakville",
        coordinates: "34.0522° N, 118.2437° W",
        locationImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
        caregiver: {
            name: 'Dr. Michael Chen',
            role: 'Doctor',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeqnjkQP6FBquFUma4Xi8c7oAyE2zxCTQD9N-NZeTwdQD_rlQ8c1vuwdzyMOc4U9DoxDkuTo_SEf3YRKCtTVdURT7b23N0VA92_kIngEwPCMhE47j9EUSpECxnCPypuvWNDHrwWFia20faw1NZBzntMvLKo2wXsDAV5qMUZCbXB4CR1P8twXXNgaGhK070JnlyCM5w75zLcxV8i9qJKE0bh7MPxBTvT1LilQWIT6GWEmwTrjFp25nH8c3LT80QK66KnAO3YPWEpO3-'
        },
        nextVisit: "4:30 PM (St. Mary's)"
    },
    {
        id: '3',
        name: 'Eleanor Smith',
        age: 68,
        relation: 'Aunt',
        status: 'Resting',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtOZoww0fEJef7ZtJecJARhC1k4AwrLTO1aWIEZbFFrOb3uI7rpCFa5-ZCpTAhhD2Kv20pQJbaMrEEVrmu09JhZOahBQg4AZCOXcWTetI9VmHhBzLg5B7xiASLjjTMQR0BYFKL7Bi-GyFBiwx1FhPJJm_5nTgRyITtyo28ee7v-GhJQlB4q9ZoklRB8EcWYemGVvqJ-el5URzA_cDqJEoEua6jVkc1Ye2SZ7r_WzGJcsg92bDJfzmBj_VzOr_mU-QT9U6YXHNlCTdK',
        address: "789 Birch Lane, Willow Creek",
        coordinates: "51.5074° N, 0.1278° W",
        locationImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop",
        caregiver: {
            name: 'Anna Rodriguez',
            role: 'Caregiver',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC__eM56cnKN_Vp1xmdqJfl3Ns6f4EJ7XNbYNP-VjKgo7oxAopcKSG3x3Y07gqzZDMmxNaZNSNug0K0RTTXSXAsWsTjWyP3PviVgfWN9dYcS5uKDimiiLf2jVJKE2jYsTqU-cHX63e9xsKth0kLrd6f4j90QuPourMPv-BFxzpl2NrhrJE9DUD1K2ZlD1IDg9WXAN0AcHKS8YA1vx1xwsiVeQ7Kf8GFgTdIjDwjTB8pEzWp83PTV0gDAHEZdmXdX5UChbRy3iJ8kP5k'
        },
        lastCheck: '2h ago'
    }
];
