import { FAMILY_MEMBERS } from '../Family/patients';

export const INCIDENTS_DATA = [
    {
        id: 0,
        date: 'May 24, 2024',
        time: '10:45 AM',
        initials: 'ES',
        name: FAMILY_MEMBERS[2].name, // Eleanor Smith
        patientId: FAMILY_MEMBERS[2].id,
        summary: 'Patient experienced mild dizziness after morning medication. Assisted to bed safely.',
        status: 'Pending Admin Review',
        color: 'bg-amber-100 text-amber-800',
        description: "Patient experienced sudden mild dizziness while attempting to stand up from the bed. Despite use of walker, lost balance. No loss of consciousness.",
        location: "Bedroom",
        witnesses: "None",
        actions: ["Assisted to bed", "Checked vitals (BP 132/84)", "Notified Nurse"]
    },
    {
        id: 1,
        date: 'May 21, 2024',
        time: '03:15 PM',
        initials: 'DW',
        name: FAMILY_MEMBERS[1].name, // David Wilson
        patientId: FAMILY_MEMBERS[1].id,
        summary: 'Small bruise noted on left forearm during bathing. Patient unable to recall cause.',
        status: 'Resolved',
        color: 'bg-emerald-100 text-emerald-800',
        description: "Noticed 2cm bruise on left forearm. Patient denies pain or trauma.",
        location: "Bathroom",
        witnesses: "None",
        actions: ["Documented in log", "Applied cold compress", "Monitored for changes"]
    },
    {
        id: 2,
        date: 'May 18, 2024',
        time: '09:00 AM',
        initials: 'MW',
        name: FAMILY_MEMBERS[0].name, // Martha Wilson
        patientId: FAMILY_MEMBERS[0].id,
        summary: 'Refusal of specialized diet meal. Alternatives provided as per care plan.',
        status: 'Resolved',
        color: 'bg-emerald-100 text-emerald-800',
        description: "Patient refused low-sodium lunch. Requested toast instead.",
        location: "Kitchen",
        witnesses: "Sarah Jenkins",
        actions: ["Provided excessive reassurance", "Offered approved alternative", "Notified Nutritionist"]
    },
    {
        id: 3,
        date: 'May 15, 2024',
        time: '01:30 PM',
        initials: 'DW',
        name: FAMILY_MEMBERS[1].name, // David Wilson again
        patientId: FAMILY_MEMBERS[1].id,
        summary: 'Front door lock found jammed upon arrival. Reported to maintenance.',
        status: 'In Progress',
        color: 'bg-blue-100 text-blue-800',
        description: "Key would not turn in lock. Required maintenance assistance to enter.",
        location: "Front Entrance",
        witnesses: "Maintenance Staff",
        actions: ["Called Maintenance", "Stayed with patient in garden", "Lock replaced"]
    }
];
