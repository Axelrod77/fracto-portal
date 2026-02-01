export type QuestionType = "mcq" | "multi-select" | "free-text" | "csv-upload";

export interface Option {
  label: string;
  score?: number;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: Option[];
  placeholder?: string;
}

export interface Section {
  id: string;
  title: string;
  questions: Question[];
}

export interface Module {
  id: string;
  title: string;
  shortTitle: string;
  sentTo: string;
  feedsInto: string[];
  icon: string;
  sections: Section[];
}

export const modules: Module[] = [
  // ─── Module 1: IT Infrastructure & Architecture ───
  {
    id: "mod-1",
    title: "IT Infrastructure & Architecture",
    shortTitle: "IT Infra",
    sentTo: "IT Lead / Head of Infrastructure",
    feedsInto: ["Software Robustness", "Automation Scale"],
    icon: "server",
    sections: [
      {
        id: "sec-1a",
        title: "Current State",
        questions: [
          {
            id: "q1.1",
            text: "What percentage of your applications are cloud-hosted (IaaS, PaaS, or SaaS) vs. on-premises?",
            type: "mcq",
            options: [
              { label: "0-20% cloud", score: 1 },
              { label: "21-40% cloud", score: 2 },
              { label: "41-60% cloud", score: 3 },
              { label: "61-80% cloud", score: 4 },
              { label: "81-100% cloud", score: 5 },
            ],
          },
          {
            id: "q1.2",
            text: "How would you describe the age of your core business applications (ERP, CRM, HRMS, etc.)?",
            type: "mcq",
            options: [
              { label: "Most are 10+ years old with minimal updates", score: 1 },
              { label: "Most are 5-10 years old with periodic upgrades", score: 2 },
              { label: "A mix of legacy and modern systems", score: 3 },
              { label: "Most have been modernized or replaced in the last 5 years", score: 4 },
              { label: "Most are current-generation, cloud-native platforms", score: 5 },
            ],
          },
          {
            id: "q1.3",
            text: "How would you characterize your API landscape?",
            type: "mcq",
            options: [
              { label: "Very few applications expose APIs; most integrations are file-based or manual", score: 1 },
              { label: "Some applications have APIs, but they are inconsistent and poorly documented", score: 2 },
              { label: "Most critical systems have APIs, with some standardization", score: 3 },
              { label: "Comprehensive API coverage with an API gateway or management layer", score: 4 },
              { label: "Mature API-first architecture with self-service developer portal and versioning", score: 5 },
            ],
          },
          {
            id: "q1.4",
            text: "How are integrations between systems typically handled?",
            type: "mcq",
            options: [
              { label: "Manual data entry or file transfers (CSV, email)", score: 1 },
              { label: "Point-to-point custom integrations", score: 2 },
              { label: "A mix of custom integrations and middleware/iPaaS", score: 3 },
              { label: "Centralized integration platform (MuleSoft, Dell Boomi, etc.)", score: 4 },
              { label: "Event-driven architecture with real-time data flows", score: 5 },
            ],
          },
          {
            id: "q1.5",
            text: "What is the state of your infrastructure-as-code and DevOps practices?",
            type: "mcq",
            options: [
              { label: "No automation — infrastructure is manually provisioned", score: 1 },
              { label: "Some scripting but no formal IaC", score: 2 },
              { label: "IaC for new deployments, but legacy infrastructure is still manual", score: 3 },
              { label: "Most infrastructure is managed via IaC with CI/CD pipelines", score: 4 },
              { label: "Fully automated provisioning, deployment, and monitoring with GitOps practices", score: 5 },
            ],
          },
          {
            id: "q1.6",
            text: "How frequently do you deploy changes to production for your core applications?",
            type: "mcq",
            options: [
              { label: "Quarterly or less", score: 1 },
              { label: "Monthly", score: 2 },
              { label: "Bi-weekly to weekly", score: 3 },
              { label: "Multiple times per week", score: 4 },
              { label: "On-demand / continuous deployment", score: 5 },
            ],
          },
          {
            id: "q1.7",
            text: "How do you handle environments (dev, staging, production)?",
            type: "mcq",
            options: [
              { label: "Development happens directly in production or a shared environment", score: 1 },
              { label: "We have separate environments but they drift from production", score: 2 },
              { label: "Defined environments with manual promotion between stages", score: 3 },
              { label: "Automated pipelines with environment parity", score: 4 },
              { label: "Fully automated with ephemeral environments and feature flags", score: 5 },
            ],
          },
        ],
      },
      {
        id: "sec-1b",
        title: "Scalability & Reliability",
        questions: [
          {
            id: "q1.8",
            text: "How would you rate your system uptime and incident management?",
            type: "mcq",
            options: [
              { label: "Frequent unplanned outages, no formal incident process", score: 1 },
              { label: "Occasional outages, reactive incident response", score: 2 },
              { label: "Defined SLAs, incident management process exists but inconsistent", score: 3 },
              { label: "Strong SLAs, formal incident management with post-mortems", score: 4 },
              { label: "99.9%+ uptime, automated alerting, proactive incident prevention", score: 5 },
            ],
          },
          {
            id: "q1.9",
            text: "Can your current infrastructure handle a 3x increase in workload without major re-architecture?",
            type: "mcq",
            options: [
              { label: "No — we would hit critical bottlenecks immediately", score: 1 },
              { label: "Unlikely — significant manual effort would be needed", score: 2 },
              { label: "Partially — some systems can scale, others cannot", score: 3 },
              { label: "Mostly — auto-scaling is in place for key workloads", score: 4 },
              { label: "Yes — elastic scaling is standard across our infrastructure", score: 5 },
            ],
          },
          {
            id: "q1.10",
            text: "How is monitoring and observability handled?",
            type: "mcq",
            options: [
              { label: "Minimal monitoring — we find out about issues from users", score: 1 },
              { label: "Basic server/infra monitoring (CPU, memory, disk)", score: 2 },
              { label: "Application-level monitoring with alerting", score: 3 },
              { label: "Centralized observability (logs, metrics, traces) with dashboards", score: 4 },
              { label: "Full-stack observability with AIOps or predictive alerting", score: 5 },
            ],
          },
        ],
      },
      {
        id: "sec-1c",
        title: "AI-Readiness of Infrastructure",
        questions: [
          {
            id: "q1.11",
            text: "Do you have GPU or ML-optimized compute available (on-prem or cloud)?",
            type: "mcq",
            options: [
              { label: "No, and we haven't considered it", score: 1 },
              { label: "No, but we are evaluating options", score: 2 },
              { label: "Yes, limited — experimental or single-project use", score: 3 },
              { label: "Yes, available for multiple teams on a shared basis", score: 4 },
              { label: "Yes, managed ML platform (SageMaker, Vertex AI, Azure ML, etc.)", score: 5 },
            ],
          },
          {
            id: "q1.12",
            text: "Do your core systems support real-time or near-real-time data access for analytics and automation?",
            type: "mcq",
            options: [
              { label: "No — data access is mostly batch/overnight", score: 1 },
              { label: "Some systems offer near-real-time, but most are batch", score: 2 },
              { label: "Real-time data available for some key systems via streaming or CDC", score: 3 },
              { label: "Most critical data is available in real-time", score: 4 },
              { label: "Comprehensive real-time data fabric across the organization", score: 5 },
            ],
          },
          {
            id: "q1.13",
            text: "How easily could a new AI/ML workload be deployed into your current environment?",
            type: "mcq",
            options: [
              { label: "Would require significant new infrastructure and approvals (months)", score: 1 },
              { label: "Possible but would take weeks of setup and coordination", score: 2 },
              { label: "We have some templates/patterns — could be done in days", score: 3 },
              { label: "Self-service deployment paths exist for standard workloads", score: 4 },
              { label: "Fully automated ML deployment pipelines with monitoring", score: 5 },
            ],
          },
          {
            id: "q1.14",
            text: "What are the top 3 infrastructure challenges that would slow down an AI or automation initiative?",
            type: "free-text",
            placeholder: "Describe the top 3 infrastructure challenges...",
          },
          {
            id: "q1.15",
            text: "Are there any planned infrastructure changes or migrations in the next 12 months that we should be aware of?",
            type: "free-text",
            placeholder: "Describe any planned infrastructure changes or migrations...",
          },
        ],
      },
    ],
  },

  // ─── Module 2: Data Maturity & Governance ───
  {
    id: "mod-2",
    title: "Data Maturity & Governance",
    shortTitle: "Data",
    sentTo: "Head of Data / Analytics Lead / CDO",
    feedsInto: ["Data Readiness", "AI/ML Current State"],
    icon: "database",
    sections: [
      {
        id: "sec-2a",
        title: "Data Quality & Accessibility",
        questions: [
          {
            id: "q2.1",
            text: "How would you describe data quality across your organization?",
            type: "mcq",
            options: [
              { label: "Poor — significant duplication, inconsistency, and gaps across systems", score: 1 },
              { label: "Below average — known quality issues in key datasets, limited remediation", score: 2 },
              { label: "Moderate — quality varies by domain, some cleansing processes exist", score: 3 },
              { label: "Good — active data quality management for critical datasets", score: 4 },
              { label: "High — automated data quality monitoring, profiling, and remediation across the org", score: 5 },
            ],
          },
          {
            id: "q2.2",
            text: "Is there a single source of truth (master data) for key entities like customers, products, and employees?",
            type: "mcq",
            options: [
              { label: "No — every system has its own version of truth", score: 1 },
              { label: "Partially — master data exists for 1-2 entities but not broadly adopted", score: 2 },
              { label: "In progress — MDM initiative underway", score: 3 },
              { label: "Yes, for most key entities, with defined governance", score: 4 },
              { label: "Yes, comprehensive MDM with automated sync and conflict resolution", score: 5 },
            ],
          },
          {
            id: "q2.3",
            text: "How accessible is data for analytical or reporting purposes?",
            type: "mcq",
            options: [
              { label: "Requires IT requests and custom queries — weeks of lead time", score: 1 },
              { label: "Some self-service via BI tools, but coverage is limited", score: 2 },
              { label: "Central data warehouse/lake exists, accessible to analyst teams", score: 3 },
              { label: "Self-service analytics widely available with governed datasets", score: 4 },
              { label: "Data marketplace or catalog with self-service access, lineage, and discovery", score: 5 },
            ],
          },
          {
            id: "q2.4",
            text: "How is unstructured data (documents, emails, images, PDFs) managed?",
            type: "mcq",
            options: [
              { label: "Scattered across file shares, email, and local drives — no central management", score: 1 },
              { label: "Some consolidation into document management systems, but no indexing", score: 2 },
              { label: "Centralized document management with basic search", score: 3 },
              { label: "Structured taxonomy and metadata tagging for key document types", score: 4 },
              { label: "Searchable, indexed, and classified — ready for NLP/AI use cases", score: 5 },
            ],
          },
          {
            id: "q2.5",
            text: "Do you have a data catalog or metadata management solution?",
            type: "mcq",
            options: [
              { label: "No", score: 1 },
              { label: "Informal/spreadsheet-based documentation", score: 2 },
              { label: "Data catalog tool in place but adoption is low", score: 3 },
              { label: "Actively used data catalog with ownership and lineage for key datasets", score: 4 },
              { label: "Comprehensive catalog integrated with governance, quality, and discovery workflows", score: 5 },
            ],
          },
        ],
      },
      {
        id: "sec-2b",
        title: "Data Governance & Privacy",
        questions: [
          {
            id: "q2.6",
            text: "Is there a formal data governance framework with defined roles (data owners, stewards)?",
            type: "mcq",
            options: [
              { label: "No formal governance", score: 1 },
              { label: "Governance exists on paper but not practiced", score: 2 },
              { label: "Governance in place for regulated/critical data only", score: 3 },
              { label: "Broad governance framework with active data owners and stewards", score: 4 },
              { label: "Mature governance integrated into daily workflows with automated policy enforcement", score: 5 },
            ],
          },
          {
            id: "q2.7",
            text: "How is personally identifiable information (PII) and sensitive data managed?",
            type: "mcq",
            options: [
              { label: "No systematic approach — PII is likely in many untracked locations", score: 1 },
              { label: "Basic awareness but no automated detection or classification", score: 2 },
              { label: "PII classified in key systems with access controls", score: 3 },
              { label: "Automated PII detection and classification with masking/encryption", score: 4 },
              { label: "Comprehensive data privacy platform with consent management and audit trails", score: 5 },
            ],
          },
          {
            id: "q2.8",
            text: "Do you have data retention and deletion policies that are actively enforced?",
            type: "mcq",
            options: [
              { label: "No formal policies", score: 1 },
              { label: "Policies exist but enforcement is manual and inconsistent", score: 2 },
              { label: "Automated retention for some systems, manual for others", score: 3 },
              { label: "Largely automated retention and deletion across key systems", score: 4 },
              { label: "Fully automated with compliance reporting and audit trails", score: 5 },
            ],
          },
          {
            id: "q2.9",
            text: "Is your organization prepared to handle AI-specific data requirements (training data curation, bias detection, model data lineage)?",
            type: "mcq",
            options: [
              { label: "Haven't considered it", score: 1 },
              { label: "Aware of the requirements but no capabilities in place", score: 2 },
              { label: "Some ad-hoc processes for specific AI projects", score: 3 },
              { label: "Defined processes for training data management and bias review", score: 4 },
              { label: "Mature MLOps practices including data versioning, bias monitoring, and model lineage", score: 5 },
            ],
          },
        ],
      },
      {
        id: "sec-2c",
        title: "Data Engineering & Pipelines",
        questions: [
          {
            id: "q2.10",
            text: "How mature are your data pipelines (ETL/ELT)?",
            type: "mcq",
            options: [
              { label: "Mostly manual data movement (exports, copies, email)", score: 1 },
              { label: "Some automated pipelines but fragile and poorly monitored", score: 2 },
              { label: "Reliable pipelines for core data flows with some monitoring", score: 3 },
              { label: "Modern data stack with orchestration, testing, and observability", score: 4 },
              { label: "Fully automated, tested, version-controlled pipelines with data contracts", score: 5 },
            ],
          },
          {
            id: "q2.11",
            text: "What is the typical latency of data available for decision-making?",
            type: "mcq",
            options: [
              { label: "Days to weeks (batch reports)", score: 1 },
              { label: "Overnight batch refresh", score: 2 },
              { label: "Intraday refreshes (every few hours)", score: 3 },
              { label: "Near-real-time (minutes)", score: 4 },
              { label: "Real-time streaming", score: 5 },
            ],
          },
          {
            id: "q2.12",
            text: "What are the top 3 data-related challenges that would slow down an AI initiative in your organization?",
            type: "free-text",
            placeholder: "Describe the top 3 data-related challenges...",
          },
          {
            id: "q2.13",
            text: "Describe any ongoing or planned data platform initiatives (migration, modernization, new tooling).",
            type: "free-text",
            placeholder: "Describe any ongoing or planned data platform initiatives...",
          },
        ],
      },
    ],
  },

  // ─── Module 3: Process & Automation Readiness ───
  {
    id: "mod-3",
    title: "Process & Automation Readiness",
    shortTitle: "Process",
    sentTo: "Head of Operations / Business Process Lead / COO office",
    feedsInto: ["Process Standardization", "Automation Scale"],
    icon: "workflow",
    sections: [
      {
        id: "sec-3a",
        title: "Process Documentation & Standardization",
        questions: [
          {
            id: "q3.1",
            text: "What percentage of your core business processes are formally documented (process maps, SOPs)?",
            type: "mcq",
            options: [
              { label: "Less than 10%", score: 1 },
              { label: "10-30%", score: 2 },
              { label: "31-50%", score: 3 },
              { label: "51-75%", score: 4 },
              { label: "Over 75%", score: 5 },
            ],
          },
          {
            id: "q3.2",
            text: "How standardized are processes across business units or geographies?",
            type: "mcq",
            options: [
              { label: "Every team/region does things differently", score: 1 },
              { label: "Some alignment, but significant local variations", score: 2 },
              { label: "Core processes are standardized, with approved regional exceptions", score: 3 },
              { label: "High standardization with a defined process governance framework", score: 4 },
              { label: "Fully standardized with continuous process mining and optimization", score: 5 },
            ],
          },
          {
            id: "q3.3",
            text: "How are process changes managed?",
            type: "mcq",
            options: [
              { label: "Informally — changes happen ad hoc without documentation", score: 1 },
              { label: "Change requests exist but are inconsistently followed", score: 2 },
              { label: "Formal change management for major processes", score: 3 },
              { label: "Defined process governance with impact assessment for all changes", score: 4 },
              { label: "Automated process change management integrated with digital workflows", score: 5 },
            ],
          },
          {
            id: "q3.4",
            text: "How are processes measured?",
            type: "mcq",
            options: [
              { label: "No formal process KPIs or metrics", score: 1 },
              { label: "Basic volume metrics (transactions processed, tickets closed)", score: 2 },
              { label: "Defined KPIs for major processes with periodic reporting", score: 3 },
              { label: "Real-time process dashboards with SLA monitoring", score: 4 },
              { label: "Process mining tools providing continuous insight into process performance and variants", score: 5 },
            ],
          },
        ],
      },
      {
        id: "sec-3b",
        title: "Current Automation Landscape",
        questions: [
          {
            id: "q3.5",
            text: "What is the current scale of automation (RPA, workflow automation, scripting) in your organization?",
            type: "mcq",
            options: [
              { label: "No formal automation — processes are manual", score: 1 },
              { label: "Pilot stage — a few bots or automations in limited areas", score: 2 },
              { label: "Departmental adoption — 10-50 automations in production", score: 3 },
              { label: "Scaled program — 50-200+ automations with a CoE", score: 4 },
              { label: "Enterprise-wide — automation is standard practice with self-service capabilities", score: 5 },
            ],
          },
          {
            id: "q3.6",
            text: "Which automation technologies are currently in use? (Select all that apply)",
            type: "multi-select",
            options: [
              { label: "None" },
              { label: "Custom scripts (Python, VBA, etc.)" },
              { label: "RPA (UiPath, Automation Anywhere, Blue Prism, Power Automate)" },
              { label: "Low-code/no-code platforms (Mendix, OutSystems, Appian)" },
              { label: "Workflow orchestration (ServiceNow, Camunda, Zapier)" },
              { label: "Intelligent document processing (IDP)" },
              { label: "Conversational AI / chatbots" },
              { label: "Other" },
            ],
          },
          {
            id: "q3.7",
            text: "How are automations managed and maintained?",
            type: "mcq",
            options: [
              { label: "Individual developers maintain their own automations", score: 1 },
              { label: "Informal team ownership", score: 2 },
              { label: "Central team manages automations but reactively", score: 3 },
              { label: "Automation CoE with defined SDLC, monitoring, and SLAs", score: 4 },
              { label: "Mature ops model with automated monitoring, alerting, and self-healing", score: 5 },
            ],
          },
          {
            id: "q3.8",
            text: "What is the typical ROI tracking approach for automation?",
            type: "mcq",
            options: [
              { label: "No ROI tracking", score: 1 },
              { label: 'Anecdotal — "it saves time" without measurement', score: 2 },
              { label: "Hours saved calculated at project level", score: 3 },
              { label: "Business-case driven with measured outcomes (hours saved, error reduction, cost)", score: 4 },
              { label: "Continuous value tracking dashboard with FTE impact and business KPIs", score: 5 },
            ],
          },
        ],
      },
      {
        id: "sec-3c",
        title: "Readiness for AI-Powered Automation",
        questions: [
          {
            id: "q3.9",
            text: "How would you describe the complexity of your most common manual processes?",
            type: "mcq",
            options: [
              { label: "Mostly simple, repetitive tasks (data entry, copy-paste, report generation)", score: 1 },
              { label: "Mix of repetitive and judgment-based tasks", score: 2 },
              { label: "Primarily judgment-based with some rules-based components", score: 3 },
              { label: "Complex, multi-system processes requiring human decision-making", score: 4 },
              { label: "Highly variable, exception-heavy processes with significant unstructured input", score: 5 },
            ],
          },
          {
            id: "q3.10",
            text: "What percentage of your processes involve unstructured inputs (emails, PDFs, scanned documents, voice)?",
            type: "mcq",
            options: [
              { label: "Less than 10%", score: 1 },
              { label: "10-25%", score: 2 },
              { label: "26-50%", score: 3 },
              { label: "51-75%", score: 4 },
              { label: "Over 75%", score: 5 },
            ],
          },
          {
            id: "q3.11",
            text: "Are there processes where AI could replace or augment human judgment today? How are these identified?",
            type: "mcq",
            options: [
              { label: "We haven't assessed this", score: 1 },
              { label: "Some informal ideas but no structured approach", score: 2 },
              { label: "We have a backlog of AI use cases from brainstorming sessions", score: 3 },
              { label: "Use cases are identified through a structured process-AI fit analysis", score: 4 },
              { label: "Active pipeline of AI use cases with prioritization, POCs, and a deployment path", score: 5 },
            ],
          },
          {
            id: "q3.12",
            text: "What is the biggest bottleneck to scaling automation or AI in your processes?",
            type: "multi-select",
            options: [
              { label: "Lack of process documentation" },
              { label: "Unstandardized / highly variable processes" },
              { label: "System limitations (no APIs, legacy UIs)" },
              { label: "Organizational resistance or skills gap" },
              { label: "Regulatory / compliance constraints" },
              { label: "Other" },
            ],
          },
          {
            id: "q3.13",
            text: "Name 3 processes that consume the most manual effort in your organization today.",
            type: "free-text",
            placeholder: "Describe the top 3 most manual-effort-intensive processes...",
          },
          {
            id: "q3.14",
            text: "Have any automation or AI initiatives been attempted and abandoned? If so, what went wrong?",
            type: "free-text",
            placeholder: "Describe any abandoned automation or AI initiatives and what went wrong...",
          },
        ],
      },
    ],
  },

  // ─── Module 4: Security, Compliance & Legal ───
  {
    id: "mod-4",
    title: "Security, Compliance & Legal Readiness",
    shortTitle: "Security",
    sentTo: "CISO / Head of Legal / Compliance Lead",
    feedsInto: ["Security & Compliance"],
    icon: "shield",
    sections: [
      {
        id: "sec-4a",
        title: "Security Posture",
        questions: [
          {
            id: "q4.1",
            text: "What security frameworks or certifications does your organization currently hold? (Select all that apply)",
            type: "multi-select",
            options: [
              { label: "None formally adopted" },
              { label: "ISO 27001" },
              { label: "SOC 2" },
              { label: "NIST Cybersecurity Framework" },
              { label: "CIS Controls" },
              { label: "Industry-specific (PCI-DSS, HIPAA, etc.)" },
              { label: "Other" },
            ],
          },
          {
            id: "q4.2",
            text: "How is access management handled across your application landscape?",
            type: "mcq",
            options: [
              { label: "Individual application-level credentials with no central management", score: 1 },
              { label: "Centralized identity provider (AD/LDAP) for some applications", score: 2 },
              { label: "SSO for most applications with role-based access control", score: 3 },
              { label: "Comprehensive IAM with SSO, MFA, and automated provisioning/deprovisioning", score: 4 },
              { label: "Zero-trust architecture with continuous authentication and least-privilege enforcement", score: 5 },
            ],
          },
          {
            id: "q4.3",
            text: "How are third-party vendors and SaaS applications assessed for security?",
            type: "mcq",
            options: [
              { label: "No formal vendor security assessment process", score: 1 },
              { label: "Ad hoc reviews for major vendors only", score: 2 },
              { label: "Standard security questionnaire for all new vendors", score: 3 },
              { label: "Formal third-party risk management program with ongoing monitoring", score: 4 },
              { label: "Automated TPRM with continuous risk scoring and contractual security requirements", score: 5 },
            ],
          },
          {
            id: "q4.4",
            text: "How mature is your vulnerability management program?",
            type: "mcq",
            options: [
              { label: "No formal program — patching is reactive", score: 1 },
              { label: "Periodic scans with manual remediation", score: 2 },
              { label: "Regular scanning with defined SLAs for remediation by severity", score: 3 },
              { label: "Automated scanning, prioritization, and patch management for most systems", score: 4 },
              { label: "Continuous vulnerability management with threat intelligence integration", score: 5 },
            ],
          },
        ],
      },
      {
        id: "sec-4b",
        title: "AI-Specific Risk Readiness",
        questions: [
          {
            id: "q4.5",
            text: "Does your organization have a policy or framework for responsible AI use?",
            type: "mcq",
            options: [
              { label: "No — haven't considered it", score: 1 },
              { label: "Informally discussed but nothing documented", score: 2 },
              { label: "Draft policy exists but not yet approved or enforced", score: 3 },
              { label: "Approved responsible AI policy covering bias, transparency, and accountability", score: 4 },
              { label: "Mature AI governance with review boards, model audits, and compliance monitoring", score: 5 },
            ],
          },
          {
            id: "q4.6",
            text: "How does your organization handle data used for training or fine-tuning AI models?",
            type: "mcq",
            options: [
              { label: "No AI models in use, haven't considered it", score: 1 },
              { label: "Ad hoc — data scientists use available data without formal process", score: 2 },
              { label: "Basic guidelines exist for training data sourcing and review", score: 3 },
              { label: "Formal process for training data curation, bias assessment, and documentation", score: 4 },
              { label: "Comprehensive MLOps with data versioning, lineage, bias monitoring, and model cards", score: 5 },
            ],
          },
          {
            id: "q4.7",
            text: "Is there a legal review process for deploying AI in customer-facing or decision-making roles?",
            type: "mcq",
            options: [
              { label: "No process exists", score: 1 },
              { label: "Legal is consulted informally on a case-by-case basis", score: 2 },
              { label: "Defined review process for high-risk AI use cases", score: 3 },
              { label: "All AI deployments go through legal and ethics review", score: 4 },
              { label: "Automated AI risk classification with tiered review requirements", score: 5 },
            ],
          },
          {
            id: "q4.8",
            text: "How prepared is your organization for AI-related regulations (EU AI Act, DPDP Act, etc.)?",
            type: "mcq",
            options: [
              { label: "Not aware of upcoming regulations", score: 1 },
              { label: "Aware but haven't started preparing", score: 2 },
              { label: "Initial assessment underway", score: 3 },
              { label: "Active compliance program for key regulations", score: 4 },
              { label: "Regulatory-ready with proactive monitoring of evolving AI legislation", score: 5 },
            ],
          },
        ],
      },
      {
        id: "sec-4c",
        title: "Data Privacy & Compliance",
        questions: [
          {
            id: "q4.9",
            text: "What data privacy regulations apply to your organization? (Select all that apply)",
            type: "multi-select",
            options: [
              { label: "GDPR" },
              { label: "DPDP Act (India)" },
              { label: "CCPA/CPRA" },
              { label: "HIPAA" },
              { label: "Industry-specific regulations" },
              { label: "Unsure" },
              { label: "Other" },
            ],
          },
          {
            id: "q4.10",
            text: "How is data privacy operationalized?",
            type: "mcq",
            options: [
              { label: "Policies exist on paper but are not systematically enforced", score: 1 },
              { label: "Manual processes for consent management, data subject requests, etc.", score: 2 },
              { label: "Some automation (privacy tool for DSARs, cookie consent management)", score: 3 },
              { label: "Comprehensive privacy program with DPO, automated processes, and regular audits", score: 4 },
              { label: "Privacy-by-design embedded into all new systems and processes", score: 5 },
            ],
          },
          {
            id: "q4.11",
            text: "What legal or compliance concerns would your team flag before approving an AI deployment?",
            type: "free-text",
            placeholder: "Describe legal or compliance concerns around AI deployment...",
          },
          {
            id: "q4.12",
            text: "Are there any ongoing regulatory audits or compliance initiatives that AI adoption should account for?",
            type: "free-text",
            placeholder: "Describe any ongoing regulatory audits or compliance initiatives...",
          },
        ],
      },
    ],
  },

  // ─── Module 5: Digital Culture & Change Management ───
  {
    id: "mod-5",
    title: "Digital Culture & Change Management",
    shortTitle: "Culture",
    sentTo: "CHRO / Head of Transformation / HR Business Partner",
    feedsInto: ["Digital Culture"],
    icon: "users",
    sections: [
      {
        id: "sec-5a",
        title: "Leadership & Strategy",
        questions: [
          {
            id: "q5.1",
            text: "Is there a documented digital transformation or AI strategy endorsed by the C-suite?",
            type: "mcq",
            options: [
              { label: "No strategy exists", score: 1 },
              { label: "Informal intent but no documented strategy", score: 2 },
              { label: "Strategy exists but is not widely communicated or acted upon", score: 3 },
              { label: "Clear strategy with executive sponsorship and budgeted initiatives", score: 4 },
              { label: "Living strategy with regular reviews, KPIs, and cross-functional ownership", score: 5 },
            ],
          },
          {
            id: "q5.2",
            text: "How aligned is leadership on the role of AI and automation in the company's future?",
            type: "mcq",
            options: [
              { label: "Significant disagreement or lack of interest", score: 1 },
              { label: "Some leaders are enthusiastic, others are skeptical or indifferent", score: 2 },
              { label: "General agreement on the need, but no alignment on approach or priorities", score: 3 },
              { label: "Aligned on vision and priorities with active executive sponsorship", score: 4 },
              { label: "Unified vision with leaders actively championing and modeling digital adoption", score: 5 },
            ],
          },
          {
            id: "q5.3",
            text: "How is the success of digital initiatives measured?",
            type: "mcq",
            options: [
              { label: "Not measured — initiatives are funded but not tracked", score: 1 },
              { label: "Activity metrics (number of projects, tools deployed)", score: 2 },
              { label: "Output metrics (cost saved, time reduced)", score: 3 },
              { label: "Business outcome metrics (revenue impact, customer satisfaction, NPS)", score: 4 },
              { label: "Balanced scorecard linking digital initiatives to strategic business goals", score: 5 },
            ],
          },
        ],
      },
      {
        id: "sec-5b",
        title: "Talent & Skills",
        questions: [
          {
            id: "q5.4",
            text: "How would you describe the digital/technical skill level of your non-IT workforce?",
            type: "mcq",
            options: [
              { label: "Minimal — most employees are uncomfortable with new technology", score: 1 },
              { label: "Basic — employees can use standard tools but resist new ones", score: 2 },
              { label: "Moderate — willingness to learn, with some power users across functions", score: 3 },
              { label: "Good — widespread comfort with digital tools and data-driven decisions", score: 4 },
              { label: "Advanced — employees proactively adopt tools and automate their own workflows", score: 5 },
            ],
          },
          {
            id: "q5.5",
            text: "Does the organization invest in upskilling employees for AI and automation?",
            type: "mcq",
            options: [
              { label: "No investment in digital upskilling", score: 1 },
              { label: "Ad hoc training when new tools are rolled out", score: 2 },
              { label: "Annual training programs covering digital literacy", score: 3 },
              { label: "Structured learning paths for AI/automation by role (e.g., citizen developer programs)", score: 4 },
              { label: "Continuous learning culture with dedicated budgets, certifications, and internal academies", score: 5 },
            ],
          },
          {
            id: "q5.6",
            text: "How easy is it to hire or retain technology talent?",
            type: "mcq",
            options: [
              { label: "Very difficult — high attrition, uncompetitive offers", score: 1 },
              { label: "Challenging — long hiring cycles, limited pipeline", score: 2 },
              { label: "Average — can fill roles but not always top-tier talent", score: 3 },
              { label: "Good — employer brand attracts solid candidates", score: 4 },
              { label: "Strong — talent magnet with competitive retention and internal mobility", score: 5 },
            ],
          },
        ],
      },
      {
        id: "sec-5c",
        title: "Change Readiness",
        questions: [
          {
            id: "q5.7",
            text: "How does the organization typically respond to new technology or process changes?",
            type: "mcq",
            options: [
              { label: "Strong resistance — changes are slow and often rolled back", score: 1 },
              { label: "Cautious — long pilot phases, heavy governance before adoption", score: 2 },
              { label: "Mixed — some teams adopt quickly, others resist", score: 3 },
              { label: "Generally positive — structured change management enables smooth adoption", score: 4 },
              { label: "Eagerly — culture of experimentation with fast adoption cycles", score: 5 },
            ],
          },
          {
            id: "q5.8",
            text: "Is there a formal change management practice or team?",
            type: "mcq",
            options: [
              { label: "No — change is managed ad hoc by project teams", score: 1 },
              { label: "Informal — some change management principles applied inconsistently", score: 2 },
              { label: "Defined practice for major initiatives (communications, training, go-live support)", score: 3 },
              { label: "Dedicated change management team or function", score: 4 },
              { label: "Mature change management integrated into all projects with adoption metrics", score: 5 },
            ],
          },
          {
            id: "q5.9",
            text: "How are failed technology initiatives perceived in the organization?",
            type: "mcq",
            options: [
              { label: "Blame-driven — failures are career-damaging and teams avoid risk", score: 1 },
              { label: "Quietly buried — no discussion, lessons not learned", score: 2 },
              { label: "Acknowledged but not formally analyzed", score: 3 },
              { label: "Post-mortems happen and lessons inform future decisions", score: 4 },
              { label: "Failures are openly discussed as learning opportunities, fast-fail culture is encouraged", score: 5 },
            ],
          },
          {
            id: "q5.10",
            text: "What is the relationship between business functions and IT?",
            type: "mcq",
            options: [
              { label: "Adversarial — business sees IT as a bottleneck, IT sees business as unreasonable", score: 1 },
              { label: "Transactional — IT takes requests, delivers, limited strategic collaboration", score: 2 },
              { label: "Collaborative on major projects but siloed day-to-day", score: 3 },
              { label: "Strong partnership with embedded IT in business functions", score: 4 },
              { label: "Fully integrated — technology decisions are co-owned by business and IT", score: 5 },
            ],
          },
          {
            id: "q5.11",
            text: "What was the most successful technology adoption in your organization in the last 3 years? What made it work?",
            type: "free-text",
            placeholder: "Describe the most successful technology adoption and what made it work...",
          },
          {
            id: "q5.12",
            text: "What is the single biggest cultural barrier to AI adoption in your organization?",
            type: "free-text",
            placeholder: "Describe the biggest cultural barrier to AI adoption...",
          },
        ],
      },
    ],
  },

  // ─── Module 6: Vendor & Partner Ecosystem ───
  {
    id: "mod-6",
    title: "Vendor & Partner Ecosystem",
    shortTitle: "Vendors",
    sentTo: "IT Procurement / Vendor Management / CIO office",
    feedsInto: ["Vendor Ecosystem"],
    icon: "handshake",
    sections: [
      {
        id: "sec-6a",
        title: "Current Partner Landscape",
        questions: [
          {
            id: "q6.1",
            text: "How many IT services/consulting partners does your organization actively engage with?",
            type: "mcq",
            options: [
              { label: "1-2", score: 1 },
              { label: "3-5", score: 2 },
              { label: "6-10", score: 3 },
              { label: "11-20", score: 4 },
              { label: "20+", score: 5 },
            ],
          },
          {
            id: "q6.2",
            text: "What types of engagements do your primary IT partners manage? (Select all that apply)",
            type: "multi-select",
            options: [
              { label: "Application development and maintenance" },
              { label: "Infrastructure management" },
              { label: "Business process outsourcing" },
              { label: "ERP/CRM implementation and support" },
              { label: "Data and analytics" },
              { label: "Cybersecurity" },
              { label: "Cloud migration" },
              { label: "AI/ML projects" },
              { label: "Other" },
            ],
          },
          {
            id: "q6.3",
            text: "How would you describe the relationship with your largest IT partner?",
            type: "mcq",
            options: [
              { label: "Heavily dependent — they run critical operations and switching would be very disruptive", score: 1 },
              { label: "Significant dependency — they manage key areas but we have some internal capability", score: 2 },
              { label: "Balanced — clear scope with defined handoffs and internal capabilities", score: 3 },
              { label: "Flexible — we can shift work between partners and in-house teams", score: 4 },
              { label: "Strategic — true partnership with shared goals, innovation clauses, and outcome-based pricing", score: 5 },
            ],
          },
          {
            id: "q6.4",
            text: "Are your IT partner contracts structured to incentivize automation and efficiency?",
            type: "mcq",
            options: [
              { label: "No — contracts are headcount/FTE-based (partner profits from more people, not efficiency)", score: 1 },
              { label: "Mostly headcount-based with some project-based components", score: 2 },
              { label: "Mix of FTE and outcome-based pricing", score: 3 },
              { label: "Primarily outcome-based or managed services pricing", score: 4 },
              { label: "Gain-sharing or innovation-incentive models where partner benefits from driving efficiency", score: 5 },
            ],
          },
          {
            id: "q6.5",
            text: "Has any IT partner proactively brought AI or automation proposals to you?",
            type: "mcq",
            options: [
              { label: "No", score: 1 },
              { label: "Yes, but they were vague or generic", score: 2 },
              { label: "Yes, with some specificity but no clear ROI or implementation plan", score: 3 },
              { label: "Yes, with clear proposals and we are evaluating them", score: 4 },
              { label: "Yes, and we are actively implementing partner-led AI/automation initiatives", score: 5 },
            ],
          },
        ],
      },
      {
        id: "sec-6b",
        title: "Vendor Lock-In & Flexibility",
        questions: [
          {
            id: "q6.6",
            text: "How easy would it be to switch your primary IT partner or bring work in-house?",
            type: "mcq",
            options: [
              { label: "Extremely difficult — heavy lock-in, proprietary tools, undocumented processes", score: 1 },
              { label: "Difficult — significant knowledge transfer required, 12+ month transition", score: 2 },
              { label: "Moderate — documented processes, 6-12 month transition with some risk", score: 3 },
              { label: "Manageable — well-documented, could transition in 3-6 months", score: 4 },
              { label: "Flexible — modular contracts, documented runbooks, could transition quickly", score: 5 },
            ],
          },
          {
            id: "q6.7",
            text: "Do your vendor contracts allow you to access your own data and IP freely?",
            type: "mcq",
            options: [
              { label: "Unclear — we haven't reviewed this recently", score: 1 },
              { label: "Some restrictions — data portability is limited for certain systems", score: 2 },
              { label: "Mostly — data is accessible but in vendor-specific formats", score: 3 },
              { label: "Yes — clear data ownership and portability clauses in all major contracts", score: 4 },
              { label: "Yes — with standardized export formats and API access to all our data", score: 5 },
            ],
          },
          {
            id: "q6.8",
            text: "If you could change one thing about your current IT partner relationships, what would it be?",
            type: "free-text",
            placeholder: "Describe one thing you would change about your IT partner relationships...",
          },
          {
            id: "q6.9",
            text: "Are there areas where you feel your organization is overly dependent on a single vendor or partner? Which ones?",
            type: "free-text",
            placeholder: "Describe areas of over-dependency on a single vendor or partner...",
          },
        ],
      },
    ],
  },

  // ─── Module 7: AI/ML Current State ───
  {
    id: "mod-7",
    title: "AI/ML Current State",
    shortTitle: "AI/ML",
    sentTo: "Head of Data Science / AI Lead / Innovation Lead",
    feedsInto: ["AI/ML Current State"],
    icon: "brain",
    sections: [
      {
        id: "sec-7a",
        title: "AI Capability Maturity",
        questions: [
          {
            id: "q7.1",
            text: "Where is your organization on the AI journey?",
            type: "mcq",
            options: [
              { label: "Not started — no AI initiatives or exploration", score: 1 },
              { label: "Exploring — reading, learning, attending conferences, but no projects", score: 2 },
              { label: "Experimenting — 1-3 POCs or pilots in progress", score: 3 },
              { label: "Deploying — some AI use cases in production delivering value", score: 4 },
              { label: "Scaling — AI is embedded in multiple processes with a systematic approach to new use cases", score: 5 },
            ],
          },
          {
            id: "q7.2",
            text: "Which AI/ML capabilities are currently in use or being piloted? (Select all that apply)",
            type: "multi-select",
            options: [
              { label: "None" },
              { label: "Chatbots / virtual assistants" },
              { label: "Document processing / OCR / extraction" },
              { label: "Predictive analytics / forecasting" },
              { label: "Recommendation engines" },
              { label: "Computer vision" },
              { label: "Natural language processing (search, summarization, classification)" },
              { label: "Generative AI (content creation, code generation)" },
              { label: "Autonomous agents / agentic workflows" },
              { label: "Other" },
            ],
          },
          {
            id: "q7.3",
            text: "Do you have dedicated AI/ML talent in-house?",
            type: "mcq",
            options: [
              { label: "No — no data scientists or ML engineers", score: 1 },
              { label: "1-3 individuals, often wearing multiple hats", score: 2 },
              { label: "Small dedicated team (4-10 people)", score: 3 },
              { label: "Established AI/ML team with defined roles (data scientists, ML engineers, MLOps)", score: 4 },
              { label: "Multiple AI teams across the org with a central AI CoE", score: 5 },
            ],
          },
          {
            id: "q7.4",
            text: "How are AI tools (including GenAI like ChatGPT, Copilot, etc.) being used by employees?",
            type: "mcq",
            options: [
              { label: "Blocked or not available", score: 1 },
              { label: "Unofficial/shadow use — employees use personal accounts", score: 2 },
              { label: "Approved for limited use with guidelines", score: 3 },
              { label: "Organization-wide deployment with governance and approved use cases", score: 4 },
              { label: "Deeply integrated into workflows with customization (fine-tuned models, custom agents, internal tools)", score: 5 },
            ],
          },
          {
            id: "q7.5",
            text: "What is the biggest barrier to AI adoption in your organization?",
            type: "multi-select",
            options: [
              { label: "Lack of use cases / unclear where to start" },
              { label: "Data quality and availability" },
              { label: "Talent / skills gap" },
              { label: "Infrastructure / technology readiness" },
              { label: "Budget / business case justification" },
              { label: "Security, compliance, or legal concerns" },
              { label: "Organizational resistance / cultural readiness" },
              { label: "Other" },
            ],
          },
        ],
      },
      {
        id: "sec-7b",
        title: "AI Governance & Operations",
        questions: [
          {
            id: "q7.6",
            text: "Is there a defined process for evaluating, approving, and deploying AI use cases?",
            type: "mcq",
            options: [
              { label: "No process — ad hoc experimentation", score: 1 },
              { label: "Informal — driven by individual initiative", score: 2 },
              { label: "Basic intake process with some evaluation criteria", score: 3 },
              { label: "Structured pipeline from ideation to deployment with stage gates", score: 4 },
              { label: "Mature AI product management with prioritization, experimentation frameworks, and scaled deployment", score: 5 },
            ],
          },
          {
            id: "q7.7",
            text: "How are AI models monitored post-deployment?",
            type: "mcq",
            options: [
              { label: "No AI in production yet", score: 1 },
              { label: "No monitoring — deploy and hope", score: 2 },
              { label: "Basic accuracy/performance checks periodically", score: 3 },
              { label: "Automated monitoring for drift, performance, and fairness", score: 4 },
              { label: "Comprehensive MLOps with automated retraining, A/B testing, and model governance", score: 5 },
            ],
          },
          {
            id: "q7.8",
            text: "What is leadership's expectation for AI ROI?",
            type: "mcq",
            options: [
              { label: "No specific expectations — exploring opportunistically", score: 1 },
              { label: "General expectation of cost savings but no defined targets", score: 2 },
              { label: "Specific ROI targets tied to individual use cases", score: 3 },
              { label: "Portfolio-level AI investment thesis with expected returns", score: 4 },
              { label: "AI is a strategic differentiator with board-level KPIs", score: 5 },
            ],
          },
          {
            id: "q7.9",
            text: "Describe your most successful AI or automation use case to date. What made it work?",
            type: "free-text",
            placeholder: "Describe your most successful AI or automation use case...",
          },
          {
            id: "q7.10",
            text: "If you had unlimited budget and no constraints, what would you automate or apply AI to first?",
            type: "free-text",
            placeholder: "Describe what you would automate or apply AI to first...",
          },
        ],
      },
    ],
  },

  // ─── Module 8: Software Stack Upload ───
  {
    id: "mod-8",
    title: "Software Stack Upload",
    shortTitle: "Stack",
    sentTo: "IT Asset Management / IT Procurement",
    feedsInto: ["Software Robustness", "Vendor Ecosystem"],
    icon: "layers",
    sections: [
      {
        id: "sec-8a",
        title: "Software Inventory Context",
        questions: [
          {
            id: "q8.1",
            text: "How confident are you that your organization has a complete inventory of all software in use?",
            type: "mcq",
            options: [
              { label: "Very low — significant shadow IT, no central tracking", score: 1 },
              { label: "Low — we track major systems but miss many SaaS and departmental tools", score: 2 },
              { label: "Moderate — most tools tracked via CMDB or asset management, some gaps", score: 3 },
              { label: "High — comprehensive tracking with regular audits", score: 4 },
              { label: "Very high — automated discovery and continuous SaaS management", score: 5 },
            ],
          },
          {
            id: "q8.2",
            text: "Where is the software inventory being exported from?",
            type: "multi-select",
            options: [
              { label: "ServiceNow" },
              { label: "Manual compilation (spreadsheet)" },
              { label: "SaaS management platform (Zylo, Productiv, Torii, etc.)" },
              { label: "CMDB / asset management tool" },
              { label: "Other" },
            ],
          },
          {
            id: "q8.3",
            text: "Does the export include usage/adoption data (active users vs. licensed users)?",
            type: "mcq",
            options: [
              { label: "No — just license/contract data", score: 1 },
              { label: "For some applications", score: 3 },
              { label: "Yes, for most applications", score: 5 },
            ],
          },
          {
            id: "q8.4",
            text: "Please upload your software inventory.",
            type: "csv-upload",
            placeholder: "Expected fields: Application Name, Vendor, Category (e.g., CRM, ERP, HR, Collaboration), Number of Licensed Users, Number of Active Users (if available), Annual Cost (if available), Business Function Served, Deployment Model (SaaS / On-Prem / Hybrid), Contract Renewal Date (if available)",
          },
          {
            id: "q8.5",
            text: "Are there any applications you already know you want to replace or retire? Which ones and why?",
            type: "free-text",
            placeholder: "List applications you want to replace or retire and explain why...",
          },
          {
            id: "q8.6",
            text: "Are there any applications that are considered critical and untouchable? Which ones and why?",
            type: "free-text",
            placeholder: "List applications considered critical and untouchable and explain why...",
          },
        ],
      },
    ],
  },
];

export const maturityLevels = [
  { level: 1, min: 1.0, max: 1.8, label: "Foundational", description: "Minimal digital capabilities. Manual processes, no strategy.", color: "#e74c3c" },
  { level: 2, min: 1.9, max: 2.6, label: "Emerging", description: "Some awareness and pockets of effort. Inconsistent, fragmented.", color: "#e67e22" },
  { level: 3, min: 2.7, max: 3.4, label: "Developing", description: "Structured efforts underway. Key areas being addressed but gaps remain.", color: "#f1c40f" },
  { level: 4, min: 3.5, max: 4.2, label: "Advanced", description: "Strong capabilities across most dimensions. Ready for strategic AI.", color: "#8B8FCF" },
  { level: 5, min: 4.3, max: 5.0, label: "Leading", description: "Mature, integrated digital organization. AI-native practices.", color: "#3D1F3E" },
];

export const dimensions = [
  "Software Robustness",
  "Data Readiness",
  "Process Standardization",
  "Automation Scale",
  "Digital Culture",
  "Security & Compliance",
  "Vendor Ecosystem",
  "AI/ML Current State",
];

export const mockResults = {
  overall: 2.8,
  dimensions: [
    { name: "Software Robustness", score: 2.9 },
    { name: "Data Readiness", score: 2.3 },
    { name: "Process Standardization", score: 3.1 },
    { name: "Automation Scale", score: 2.4 },
    { name: "Digital Culture", score: 3.5 },
    { name: "Security & Compliance", score: 3.2 },
    { name: "Vendor Ecosystem", score: 2.1 },
    { name: "AI/ML Current State", score: 1.9 },
  ],
};
