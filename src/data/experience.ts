export interface ExperienceItem {
  org: string;
  title: string;
  location: string;
  range: string;
  points: string[];
}

export const CYBER_ITEMS: ExperienceItem[] = [
  {
    org: "Region of Peel",
    title: "Technology Analyst (Co-op)",
    location: "Mississauga, ON",
    range: "Sep 2024 – Jan 2025",
    points: [
      "Triaged and troubleshot incidents; escalated to IAM/Infra/Sec with SLA & audit trails.",
      "Automated Bash deployment scripts for secure laptop provisioning (−40% setup time).",
      "Managed Active Directory & Intune policies to keep users/devices compliant.",
    ],
  },
  {
    org: "Sheridan College",
    title: "IT Support Technologist (Part-time)",
    location: "Mississauga, ON",
    range: "May 2024 – May 2025",
    points: [
      "Triaged endpoint/network incidents via ServiceNow & Intune; escalated to IAM/Sec.",
      "Supported CrowdStrike & Defender for Endpoint operations.",
      "Patched and restored systems to maintain baseline compliance & reliability.",
    ],
  },
  {
    org: "TD Bank",
    title: "Software Engineer (Co-op)",
    location: "Toronto, ON",
    range: "Sep 2021 – Sep 2022",
    points: [
      "Supported Basel Data Governance & PCI DSS audits with evidence & reviews.",
      "Automated incident/compliance metrics in SAS/COBOL to speed reporting.",
      "Risk impact analysis on CA-7 decommissioning to reduce legacy exposure.",
    ],
  },
  {
    org: "Naryant",
    title: "Junior .NET (C#) Developer (Co-op)",
    location: "Oakville, ON",
    range: "Jan 2021 – May 2021",
    points: [
      "Found & fixed IDOR; implemented 2FA; hardened MS SQL Server against injection.",
      "Pen-tested & wrote UAT cases for HIPAA deployments on Azure CI/CD.",
    ],
  },
];
