export type ExpItem = {
  id: string;
  start: string;             // YYYY-MM
  end?: string;              // YYYY-MM (omit for point-in-time)
  label: string;             // short label on the branch
  org?: string;
  where?: string;
  range?: string;            // pretty range (else auto from start/end)
  bullets?: string[];
  kind: "work" | "edu" | "cert" | "future";
};

export const CYBER_ITEMS: ExpItem[] = [
  {
    id: "peel",
    start: "2024-09",
    end: "2025-01",
    label: "Region of Peel (Co-op)",
    org: "Region of Peel",
    where: "Mississauga, ON",
    range: "Sep 2024 – Jan 2025",
    bullets: [
      "Triage & escalation to IAM/Infra/Sec with SLA trails.",
      "Bash imaging for secure laptop provisioning (−40% setup time).",
      "AD + Intune policy management for compliance.",
    ],
    kind: "work",
  },
  {
    id: "sheridan",
    start: "2024-05",
    end: "2025-05",
    label: "Sheridan (Part-time)",
    org: "Sheridan College",
    where: "Mississauga, ON",
    range: "May 2024 – May 2025",
    bullets: [
      "ServiceNow & Intune triage; escalated to IAM/Sec.",
      "CrowdStrike & Defender for Endpoint support.",
      "Patching & restore to maintain baseline.",
    ],
    kind: "work",
  },
  {
    id: "td",
    start: "2021-09",
    end: "2022-09",
    label: "TD Bank (Co-op)",
    org: "TD Bank",
    where: "Toronto, ON",
    range: "Sep 2021 – Sep 2022",
    bullets: [
      "Basel + PCI DSS evidence & reviews.",
      "SAS/COBOL metrics automation.",
      "CA-7 decommissioning risk analysis.",
    ],
    kind: "work",
  },
  {
    id: "naryant",
    start: "2021-01",
    end: "2021-05",
    label: "Naryant (Co-op)",
    org: "Naryant",
    where: "Oakville, ON",
    range: "Jan 2021 – May 2021",
    bullets: [
      "Found & fixed IDOR; added 2FA; hardened SQL injection surface.",
      "Pen-testing & UAT for HIPAA on Azure CI/CD.",
    ],
    kind: "work",
  },
];