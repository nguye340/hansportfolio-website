export type TimelineKind = 'work' | 'edu' | 'cert' | 'project' | 'future';

export type TimelineItem = {
  id: string;
  kind: TimelineKind;
  date: string;            // e.g. "Sep 2024 – Jan 2025" (shown in the rail)
  start: string;           // YYYY-MM (for sorting)
  title: string;           // pill title
  org?: string;            // subtitle
  location?: string;
  bullets?: string[];      // quick facts
  cta?: { label: string; href: string }[]; // links (repo, case study, etc.)
};

export const CYBER_TIMELINE: TimelineItem[] = [
  {
    id: 'peel',
    kind: 'work',
    start: '2024-09',
    date: 'Sep 2024 – Jan 2025',
    title: 'Technology Analyst (Co-op)',
    org: 'Region of Peel',
    location: 'Mississauga, ON',
    bullets: [
      'Triage & escalation to IAM/Infra/Sec with SLA trails.',
      'Bash imaging for secure laptop provisioning (−40% setup time).',
      'AD + Intune policy governance for compliance.',
    ],
  },
  {
    id: 'sheridan',
    kind: 'work',
    start: '2024-05',
    date: 'May 2024 – May 2025',
    title: 'IT Support Technologist (Part-time)',
    org: 'Sheridan College',
    location: 'Mississauga, ON',
    bullets: [
      'ServiceNow & Intune triage; handoff to IAM/Sec.',
      'CrowdStrike + Defender for Endpoint support.',
      'Patch/restore to maintain baseline.',
    ],
  },
  {
    id: 'td',
    kind: 'work',
    start: '2021-09',
    date: 'Sep 2021 – Sep 2022',
    title: 'Software Engineer (Co-op)',
    org: 'TD Bank',
    location: 'Toronto, ON',
    bullets: [
      'Basel & PCI DSS evidence; control reviews.',
      'SAS/COBOL metrics automation.',
      'CA-7 decommissioning risk analysis.',
    ],
  },
  {
    id: 'naryant',
    kind: 'work',
    start: '2021-01',
    date: 'Jan 2021 – May 2021',
    title: 'Junior .NET Developer (Co-op)',
    org: 'Naryant',
    location: 'Oakville, ON',
    bullets: [
      'Found & fixed IDOR; added 2FA; SQL injection hardening.',
      'Pen-testing + UAT for HIPAA on Azure CI/CD.',
    ],
  },
  // Add more items as needed
];
