import { FAMILY_MEMBERS } from "./patients";

export const CONTRACTS_LIST = [
    {
        id: 'C1',
        patient: { name: 'Martha Wilson', image: FAMILY_MEMBERS[0].image },
        caregiver: { name: 'Sarah Jenkins', image: FAMILY_MEMBERS[0].caregiver?.image },
        type: 'Elder Care',
        duration: '6 Months',
        status: 'ADMIN APPROVED',
        progress: 100
    },
    {
        id: 'C2',
        patient: { name: 'David Wilson', image: FAMILY_MEMBERS[1].image },
        caregiver: { name: 'Michael Chen', image: FAMILY_MEMBERS[1].caregiver?.image },
        type: 'Physical Therapy',
        duration: '3 Months',
        status: 'PAID',
        progress: 60
    }
];
