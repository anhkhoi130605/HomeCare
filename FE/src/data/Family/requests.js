export const REQUESTS_LIST = [
    {
        id: 'R1',
        title: 'Post-Op Recovery Plan',
        priority: 'URGENT',
        patient: 'Robert Jenkins',
        referralId: 'HOSP-8821',
        date: 'Oct 26, 2023',
        steps: [
            { name: 'Initial Evaluation', status: 'completed', desc: 'Nurse assessment completed' },
            { name: 'Admin Review', status: 'active', desc: 'Currently reviewing records' },
            { name: 'Caregiver Matching', status: 'pending', desc: 'Waiting for review' }
        ]
    },
    {
        id: 'R2',
        title: 'Full Care Setup',
        priority: 'STANDARD',
        patient: 'Eleanor Jenkins',
        referralId: 'HOSP-7729',
        date: 'Oct 24, 2023',
        steps: [
            { name: 'Initial Evaluation', status: 'completed', desc: 'Completed Oct 24' },
            { name: 'Admin Review', status: 'completed', desc: 'Completed Oct 25' },
            { name: 'Caregiver Matching', status: 'active', desc: 'Shortlisting 3 caregivers' }
        ]
    }
];
