import { type DimensionScore } from "./scoring";

export interface Initiative {
  title: string;
  description: string;
  dimension: string;
  priority: "critical" | "high" | "medium";
  effort: "low" | "medium" | "high";
}

export interface Horizon {
  id: number;
  label: string;
  timeframe: string;
  subtitle: string;
  initiatives: Initiative[];
}

export interface RoadmapResult {
  horizons: Horizon[];
  strengths: string[];
  gaps: string[];
}

// Per-dimension initiatives keyed by maturity band:
// "low" (1.0–2.6), "mid" (2.7–3.4), "high" (3.5–5.0)
// Each band defines work for H1, H2, H3
const catalog: Record<
  string,
  Record<"low" | "mid" | "high", { h1: Initiative[]; h2: Initiative[]; h3: Initiative[] }>
> = {
  "Software Robustness": {
    low: {
      h1: [
        {
          title: "Cloud Migration Assessment",
          description:
            "Inventory on-prem workloads and build a prioritized cloud migration roadmap with cost-benefit analysis for each application tier.",
          dimension: "Software Robustness",
          priority: "critical",
          effort: "medium",
        },
        {
          title: "API-First Architecture Standards",
          description:
            "Define API design standards and implement an API gateway for the top 10 most-integrated systems.",
          dimension: "Software Robustness",
          priority: "high",
          effort: "medium",
        },
      ],
      h2: [
        {
          title: "Legacy Application Modernization",
          description:
            "Refactor or replace the oldest tier of business applications using cloud-native patterns and CI/CD pipelines.",
          dimension: "Software Robustness",
          priority: "high",
          effort: "high",
        },
        {
          title: "DevOps Maturity Program",
          description:
            "Establish Infrastructure-as-Code practices, automated testing, and deployment pipelines across development teams.",
          dimension: "Software Robustness",
          priority: "high",
          effort: "high",
        },
      ],
      h3: [
        {
          title: "Self-Healing Infrastructure",
          description:
            "Implement AIOps-driven infrastructure with predictive scaling, automated incident response, and chaos engineering practices.",
          dimension: "Software Robustness",
          priority: "medium",
          effort: "high",
        },
      ],
    },
    mid: {
      h1: [
        {
          title: "Observability Stack Enhancement",
          description:
            "Deploy centralized logging, metrics, and distributed tracing across all production services.",
          dimension: "Software Robustness",
          priority: "high",
          effort: "medium",
        },
      ],
      h2: [
        {
          title: "Platform Engineering Team",
          description:
            "Establish an internal developer platform with golden paths, self-service infrastructure, and standardized deployment templates.",
          dimension: "Software Robustness",
          priority: "medium",
          effort: "high",
        },
      ],
      h3: [
        {
          title: "AI-Augmented Development",
          description:
            "Integrate AI coding assistants and automated code review into development workflows to accelerate delivery velocity.",
          dimension: "Software Robustness",
          priority: "medium",
          effort: "medium",
        },
      ],
    },
    high: {
      h1: [
        {
          title: "Architecture Optimization Review",
          description:
            "Conduct cost and performance optimization across cloud workloads, right-sizing instances and eliminating waste.",
          dimension: "Software Robustness",
          priority: "medium",
          effort: "low",
        },
      ],
      h2: [
        {
          title: "Edge Computing Strategy",
          description:
            "Evaluate edge deployment patterns for latency-sensitive AI workloads and real-time processing needs.",
          dimension: "Software Robustness",
          priority: "medium",
          effort: "medium",
        },
      ],
      h3: [
        {
          title: "Autonomous Operations",
          description:
            "Move toward fully autonomous infrastructure operations with AI-driven capacity planning and zero-touch deployments.",
          dimension: "Software Robustness",
          priority: "medium",
          effort: "high",
        },
      ],
    },
  },

  "Data Readiness": {
    low: {
      h1: [
        {
          title: "Data Quality Baseline Assessment",
          description:
            "Profile key datasets across core systems to establish data quality scores and identify the most impactful remediation targets.",
          dimension: "Data Readiness",
          priority: "critical",
          effort: "medium",
        },
        {
          title: "Master Data Management Foundation",
          description:
            "Establish golden records for customers, products, and employees with defined ownership and reconciliation rules.",
          dimension: "Data Readiness",
          priority: "critical",
          effort: "high",
        },
      ],
      h2: [
        {
          title: "Modern Data Platform Build",
          description:
            "Implement a cloud data warehouse or lakehouse with automated ETL pipelines, data quality checks, and a self-service analytics layer.",
          dimension: "Data Readiness",
          priority: "high",
          effort: "high",
        },
      ],
      h3: [
        {
          title: "AI-Ready Data Fabric",
          description:
            "Build a unified data fabric with real-time streaming, feature stores, and automated data lineage for ML workloads.",
          dimension: "Data Readiness",
          priority: "high",
          effort: "high",
        },
      ],
    },
    mid: {
      h1: [
        {
          title: "Data Governance Operationalization",
          description:
            "Activate data stewards, define data quality SLAs, and implement automated monitoring for critical datasets.",
          dimension: "Data Readiness",
          priority: "high",
          effort: "medium",
        },
      ],
      h2: [
        {
          title: "Data Catalog & Discovery",
          description:
            "Deploy an enterprise data catalog with automated lineage, profiling, and self-service discovery for analysts and data scientists.",
          dimension: "Data Readiness",
          priority: "medium",
          effort: "medium",
        },
      ],
      h3: [
        {
          title: "Real-Time Data Products",
          description:
            "Transition from batch to real-time data products with event-driven architecture and streaming analytics.",
          dimension: "Data Readiness",
          priority: "medium",
          effort: "high",
        },
      ],
    },
    high: {
      h1: [
        {
          title: "ML Feature Store Implementation",
          description:
            "Build a centralized feature store to standardize feature engineering and enable rapid model development.",
          dimension: "Data Readiness",
          priority: "medium",
          effort: "medium",
        },
      ],
      h2: [
        {
          title: "Data Mesh Architecture",
          description:
            "Evolve toward domain-oriented data ownership with federated governance and self-serve data infrastructure.",
          dimension: "Data Readiness",
          priority: "medium",
          effort: "high",
        },
      ],
      h3: [
        {
          title: "Autonomous Data Management",
          description:
            "Leverage AI for automated data quality remediation, schema evolution, and intelligent data lifecycle management.",
          dimension: "Data Readiness",
          priority: "medium",
          effort: "high",
        },
      ],
    },
  },

  "Process Standardization": {
    low: {
      h1: [
        {
          title: "Process Mining & Documentation",
          description:
            "Deploy process mining tools to discover as-is process flows and create documentation for the top 20 highest-volume processes.",
          dimension: "Process Standardization",
          priority: "critical",
          effort: "medium",
        },
        {
          title: "Process Standardization Pilot",
          description:
            "Select 3-5 high-impact processes and standardize them across business units with defined KPIs and governance.",
          dimension: "Process Standardization",
          priority: "high",
          effort: "medium",
        },
      ],
      h2: [
        {
          title: "Enterprise Process Framework",
          description:
            "Roll out a process governance framework with ownership, change management, and continuous improvement cadences.",
          dimension: "Process Standardization",
          priority: "high",
          effort: "high",
        },
      ],
      h3: [
        {
          title: "Adaptive Process Intelligence",
          description:
            "Use AI-powered process mining for continuous optimization, variant detection, and automated compliance monitoring.",
          dimension: "Process Standardization",
          priority: "medium",
          effort: "high",
        },
      ],
    },
    mid: {
      h1: [
        {
          title: "Process KPI Dashboard",
          description:
            "Build real-time dashboards for process performance metrics including cycle time, throughput, and exception rates.",
          dimension: "Process Standardization",
          priority: "high",
          effort: "low",
        },
      ],
      h2: [
        {
          title: "Digital Twin of Operations",
          description:
            "Create digital process twins to simulate changes, predict bottlenecks, and optimize workflows before implementation.",
          dimension: "Process Standardization",
          priority: "medium",
          effort: "high",
        },
      ],
      h3: [
        {
          title: "AI-Orchestrated Processes",
          description:
            "Implement intelligent process orchestration where AI dynamically routes, prioritizes, and optimizes workflows in real-time.",
          dimension: "Process Standardization",
          priority: "medium",
          effort: "high",
        },
      ],
    },
    high: {
      h1: [
        {
          title: "Continuous Process Improvement Program",
          description:
            "Formalize a lean/six-sigma inspired continuous improvement program integrated with process mining insights.",
          dimension: "Process Standardization",
          priority: "medium",
          effort: "low",
        },
      ],
      h2: [
        {
          title: "Cross-Functional Process Integration",
          description:
            "Break down process silos by implementing end-to-end process visibility and orchestration across departments.",
          dimension: "Process Standardization",
          priority: "medium",
          effort: "medium",
        },
      ],
      h3: [
        {
          title: "Autonomous Process Optimization",
          description:
            "AI continuously identifies, tests, and implements process improvements with human oversight for exceptions only.",
          dimension: "Process Standardization",
          priority: "medium",
          effort: "high",
        },
      ],
    },
  },

  "Automation Scale": {
    low: {
      h1: [
        {
          title: "Automation Opportunity Assessment",
          description:
            "Identify and prioritize the top 20 automation candidates using a structured process-fit analysis methodology.",
          dimension: "Automation Scale",
          priority: "critical",
          effort: "low",
        },
        {
          title: "RPA Quick Wins Program",
          description:
            "Deploy 5-10 RPA bots for high-volume, rules-based tasks to demonstrate value and build organizational momentum.",
          dimension: "Automation Scale",
          priority: "high",
          effort: "medium",
        },
      ],
      h2: [
        {
          title: "Automation Center of Excellence",
          description:
            "Establish a CoE with governance, reusable components, ROI tracking, and a citizen developer program.",
          dimension: "Automation Scale",
          priority: "high",
          effort: "high",
        },
      ],
      h3: [
        {
          title: "Intelligent Automation Platform",
          description:
            "Combine RPA, AI, and process orchestration into a unified intelligent automation platform handling complex, judgment-based workflows.",
          dimension: "Automation Scale",
          priority: "high",
          effort: "high",
        },
      ],
    },
    mid: {
      h1: [
        {
          title: "Automation ROI Framework",
          description:
            "Implement standardized ROI measurement across all automations with a value dashboard visible to leadership.",
          dimension: "Automation Scale",
          priority: "high",
          effort: "low",
        },
      ],
      h2: [
        {
          title: "AI-Enhanced Automation",
          description:
            "Add document intelligence, NLP, and decision models to existing automations to handle unstructured inputs and exceptions.",
          dimension: "Automation Scale",
          priority: "high",
          effort: "medium",
        },
      ],
      h3: [
        {
          title: "Autonomous Agents at Scale",
          description:
            "Deploy AI agents that independently manage end-to-end business processes with human-in-the-loop for exceptions.",
          dimension: "Automation Scale",
          priority: "medium",
          effort: "high",
        },
      ],
    },
    high: {
      h1: [
        {
          title: "Hyperautomation Strategy",
          description:
            "Define a hyperautomation vision that combines process mining, RPA, AI, and low-code to automate end-to-end workflows.",
          dimension: "Automation Scale",
          priority: "medium",
          effort: "low",
        },
      ],
      h2: [
        {
          title: "Self-Service Automation Platform",
          description:
            "Empower business users with a governed self-service automation platform to build and deploy their own workflows.",
          dimension: "Automation Scale",
          priority: "medium",
          effort: "medium",
        },
      ],
      h3: [
        {
          title: "AI-Native Operations",
          description:
            "Transition to an AI-first operating model where automation is the default and manual intervention is the exception.",
          dimension: "Automation Scale",
          priority: "medium",
          effort: "high",
        },
      ],
    },
  },

  "Digital Culture": {
    low: {
      h1: [
        {
          title: "Digital Literacy Baseline Program",
          description:
            "Launch a company-wide digital literacy assessment and tiered training program covering core tools and data-driven decision making.",
          dimension: "Digital Culture",
          priority: "critical",
          effort: "medium",
        },
        {
          title: "Executive AI Immersion",
          description:
            "Conduct C-suite workshops on AI capabilities, strategic applications, and the leadership role in digital transformation.",
          dimension: "Digital Culture",
          priority: "critical",
          effort: "low",
        },
      ],
      h2: [
        {
          title: "Digital Champions Network",
          description:
            "Build a cross-functional network of change agents who advocate for and support digital adoption in every business unit.",
          dimension: "Digital Culture",
          priority: "high",
          effort: "medium",
        },
      ],
      h3: [
        {
          title: "Innovation Lab & Experimentation Culture",
          description:
            "Establish a safe-to-fail environment where teams can experiment with emerging technologies and AI-driven innovations.",
          dimension: "Digital Culture",
          priority: "medium",
          effort: "medium",
        },
      ],
    },
    mid: {
      h1: [
        {
          title: "AI Skills Acceleration Program",
          description:
            "Launch role-based AI training: prompt engineering for business users, ML fundamentals for analysts, MLOps for engineers.",
          dimension: "Digital Culture",
          priority: "high",
          effort: "medium",
        },
      ],
      h2: [
        {
          title: "Data-Driven Decision Culture",
          description:
            "Embed data literacy into performance reviews and decision processes, shifting from intuition-based to evidence-based management.",
          dimension: "Digital Culture",
          priority: "medium",
          effort: "medium",
        },
      ],
      h3: [
        {
          title: "AI-Augmented Workforce",
          description:
            "Redefine job roles and career paths to reflect AI collaboration, with continuous learning and human-AI teaming as core competencies.",
          dimension: "Digital Culture",
          priority: "medium",
          effort: "high",
        },
      ],
    },
    high: {
      h1: [
        {
          title: "Innovation Incentive Program",
          description:
            "Create formal incentives for employees who identify and implement digital improvements, including AI use case proposals.",
          dimension: "Digital Culture",
          priority: "medium",
          effort: "low",
        },
      ],
      h2: [
        {
          title: "Internal AI Community of Practice",
          description:
            "Build a thriving internal community sharing AI experiments, best practices, and reusable solutions across the organization.",
          dimension: "Digital Culture",
          priority: "medium",
          effort: "low",
        },
      ],
      h3: [
        {
          title: "AI-First Organization Design",
          description:
            "Restructure teams and workflows around AI-augmented capabilities, moving to a truly AI-native operating model.",
          dimension: "Digital Culture",
          priority: "medium",
          effort: "high",
        },
      ],
    },
  },

  "Security & Compliance": {
    low: {
      h1: [
        {
          title: "Security Posture Assessment",
          description:
            "Conduct a comprehensive security assessment aligned to NIST CSF or ISO 27001, identifying critical gaps and quick wins.",
          dimension: "Security & Compliance",
          priority: "critical",
          effort: "medium",
        },
        {
          title: "AI Governance Framework",
          description:
            "Draft and adopt a responsible AI policy covering bias, transparency, accountability, and data handling for AI workloads.",
          dimension: "Security & Compliance",
          priority: "critical",
          effort: "low",
        },
      ],
      h2: [
        {
          title: "Zero Trust Architecture Roadmap",
          description:
            "Design and begin implementing a zero-trust security model with identity-centric access controls and continuous verification.",
          dimension: "Security & Compliance",
          priority: "high",
          effort: "high",
        },
      ],
      h3: [
        {
          title: "AI-Powered Security Operations",
          description:
            "Deploy AI-driven threat detection, automated incident response, and predictive security analytics.",
          dimension: "Security & Compliance",
          priority: "high",
          effort: "high",
        },
      ],
    },
    mid: {
      h1: [
        {
          title: "AI Risk Classification System",
          description:
            "Implement a tiered AI risk classification system with appropriate review requirements for each risk level.",
          dimension: "Security & Compliance",
          priority: "high",
          effort: "low",
        },
      ],
      h2: [
        {
          title: "Automated Compliance Monitoring",
          description:
            "Deploy continuous compliance monitoring for AI systems including model audits, bias detection, and regulatory alignment.",
          dimension: "Security & Compliance",
          priority: "high",
          effort: "medium",
        },
      ],
      h3: [
        {
          title: "Adaptive Security & Compliance",
          description:
            "Implement AI-driven compliance that automatically adapts to regulatory changes and proactively identifies emerging risks.",
          dimension: "Security & Compliance",
          priority: "medium",
          effort: "high",
        },
      ],
    },
    high: {
      h1: [
        {
          title: "Privacy-Preserving AI Techniques",
          description:
            "Evaluate and pilot federated learning, differential privacy, and synthetic data to enable AI on sensitive datasets.",
          dimension: "Security & Compliance",
          priority: "medium",
          effort: "medium",
        },
      ],
      h2: [
        {
          title: "AI Model Governance Platform",
          description:
            "Implement a model governance platform with model cards, automated bias monitoring, explainability, and audit trails.",
          dimension: "Security & Compliance",
          priority: "medium",
          effort: "medium",
        },
      ],
      h3: [
        {
          title: "Autonomous Security Posture",
          description:
            "Achieve fully autonomous security operations with AI-driven threat hunting, self-healing systems, and proactive compliance.",
          dimension: "Security & Compliance",
          priority: "medium",
          effort: "high",
        },
      ],
    },
  },

  "Vendor Ecosystem": {
    low: {
      h1: [
        {
          title: "Vendor Dependency Audit",
          description:
            "Map all vendor dependencies, identify single-points-of-failure, and assess contract terms for AI readiness and data portability.",
          dimension: "Vendor Ecosystem",
          priority: "critical",
          effort: "low",
        },
        {
          title: "Vendor Contract Restructuring",
          description:
            "Renegotiate key contracts to move from FTE-based to outcome-based pricing and include automation-incentive clauses.",
          dimension: "Vendor Ecosystem",
          priority: "high",
          effort: "medium",
        },
      ],
      h2: [
        {
          title: "Multi-Vendor Strategy",
          description:
            "Develop a multi-vendor strategy that reduces lock-in, brings in AI-specialized partners, and maintains competitive tension.",
          dimension: "Vendor Ecosystem",
          priority: "high",
          effort: "medium",
        },
      ],
      h3: [
        {
          title: "AI Partner Ecosystem",
          description:
            "Build a curated ecosystem of AI-native partners for specialized capabilities with plug-and-play integration patterns.",
          dimension: "Vendor Ecosystem",
          priority: "medium",
          effort: "medium",
        },
      ],
    },
    mid: {
      h1: [
        {
          title: "Vendor AI Capability Assessment",
          description:
            "Evaluate existing vendors' AI capabilities and roadmaps to determine which can be partners vs. which need supplementing.",
          dimension: "Vendor Ecosystem",
          priority: "high",
          effort: "low",
        },
      ],
      h2: [
        {
          title: "Innovation Partnership Program",
          description:
            "Establish formal innovation partnerships with AI-focused vendors including co-development agreements and POC frameworks.",
          dimension: "Vendor Ecosystem",
          priority: "medium",
          effort: "medium",
        },
      ],
      h3: [
        {
          title: "Ecosystem Orchestration Platform",
          description:
            "Implement a vendor ecosystem management platform that orchestrates capabilities across partners for end-to-end AI solutions.",
          dimension: "Vendor Ecosystem",
          priority: "medium",
          effort: "high",
        },
      ],
    },
    high: {
      h1: [
        {
          title: "Vendor Collaboration Optimization",
          description:
            "Optimize vendor collaboration models with shared tooling, integrated workflows, and joint OKRs.",
          dimension: "Vendor Ecosystem",
          priority: "medium",
          effort: "low",
        },
      ],
      h2: [
        {
          title: "Co-Innovation Framework",
          description:
            "Formalize co-innovation with strategic vendors including shared IP, joint go-to-market, and technology exchange programs.",
          dimension: "Vendor Ecosystem",
          priority: "medium",
          effort: "medium",
        },
      ],
      h3: [
        {
          title: "Autonomous Vendor Management",
          description:
            "AI-driven vendor management with automated performance tracking, risk assessment, and contract optimization.",
          dimension: "Vendor Ecosystem",
          priority: "medium",
          effort: "medium",
        },
      ],
    },
  },

  "AI/ML Current State": {
    low: {
      h1: [
        {
          title: "AI Use Case Discovery Workshop",
          description:
            "Facilitate structured workshops with business leaders to identify, prioritize, and build business cases for the top 10 AI opportunities.",
          dimension: "AI/ML Current State",
          priority: "critical",
          effort: "low",
        },
        {
          title: "First AI Proof of Concept",
          description:
            "Select one high-impact, low-risk use case and deliver a working POC within 8 weeks to demonstrate value and build confidence.",
          dimension: "AI/ML Current State",
          priority: "critical",
          effort: "medium",
        },
      ],
      h2: [
        {
          title: "AI Platform & MLOps Foundation",
          description:
            "Implement an ML platform with experiment tracking, model registry, automated training pipelines, and deployment infrastructure.",
          dimension: "AI/ML Current State",
          priority: "high",
          effort: "high",
        },
        {
          title: "AI Talent Acquisition",
          description:
            "Hire or develop a core AI team (data scientists, ML engineers, AI product managers) to build internal capability.",
          dimension: "AI/ML Current State",
          priority: "high",
          effort: "medium",
        },
      ],
      h3: [
        {
          title: "Enterprise AI Operating Model",
          description:
            "Establish a mature AI operating model with a central AI CoE, federated execution teams, and a continuous innovation pipeline.",
          dimension: "AI/ML Current State",
          priority: "high",
          effort: "high",
        },
      ],
    },
    mid: {
      h1: [
        {
          title: "GenAI Enablement Program",
          description:
            "Deploy enterprise-approved GenAI tools with usage policies, governance guardrails, and role-based training.",
          dimension: "AI/ML Current State",
          priority: "high",
          effort: "medium",
        },
      ],
      h2: [
        {
          title: "AI Product Management Practice",
          description:
            "Build a product management discipline for AI with experimentation frameworks, success metrics, and scaling playbooks.",
          dimension: "AI/ML Current State",
          priority: "medium",
          effort: "medium",
        },
      ],
      h3: [
        {
          title: "Agentic AI Deployment",
          description:
            "Deploy autonomous AI agents for complex, multi-step business processes with appropriate human oversight and governance.",
          dimension: "AI/ML Current State",
          priority: "medium",
          effort: "high",
        },
      ],
    },
    high: {
      h1: [
        {
          title: "AI Portfolio Optimization",
          description:
            "Review and optimize the AI portfolio — double down on highest-ROI use cases, sunset underperformers, and identify gaps.",
          dimension: "AI/ML Current State",
          priority: "medium",
          effort: "low",
        },
      ],
      h2: [
        {
          title: "Custom Model Development",
          description:
            "Develop fine-tuned or custom models for domain-specific tasks that give competitive advantage over off-the-shelf solutions.",
          dimension: "AI/ML Current State",
          priority: "medium",
          effort: "high",
        },
      ],
      h3: [
        {
          title: "AI as Core Differentiator",
          description:
            "Embed AI as a core competitive differentiator with AI-powered products, services, and customer experiences.",
          dimension: "AI/ML Current State",
          priority: "medium",
          effort: "high",
        },
      ],
    },
  },
};

function getBand(score: number): "low" | "mid" | "high" {
  if (score <= 2.6) return "low";
  if (score <= 3.4) return "mid";
  return "high";
}

export function generateRoadmap(dimensionScores: DimensionScore[]): RoadmapResult {
  const h1Initiatives: Initiative[] = [];
  const h2Initiatives: Initiative[] = [];
  const h3Initiatives: Initiative[] = [];

  const strengths: string[] = [];
  const gaps: string[] = [];

  for (const dim of dimensionScores) {
    const band = getBand(dim.score);
    const dimCatalog = catalog[dim.name];
    if (!dimCatalog) continue;

    const items = dimCatalog[band];
    h1Initiatives.push(...items.h1);
    h2Initiatives.push(...items.h2);
    h3Initiatives.push(...items.h3);

    if (dim.score >= 3.5) {
      strengths.push(dim.name);
    } else if (dim.score <= 2.6) {
      gaps.push(dim.name);
    }
  }

  // Sort each horizon by priority (critical > high > medium)
  const priorityOrder = { critical: 0, high: 1, medium: 2 };
  const sortByPriority = (a: Initiative, b: Initiative) =>
    priorityOrder[a.priority] - priorityOrder[b.priority];

  h1Initiatives.sort(sortByPriority);
  h2Initiatives.sort(sortByPriority);
  h3Initiatives.sort(sortByPriority);

  return {
    horizons: [
      {
        id: 1,
        label: "Horizon 1",
        timeframe: "0–18 months",
        subtitle: "Foundation & Quick Wins",
        initiatives: h1Initiatives,
      },
      {
        id: 2,
        label: "Horizon 2",
        timeframe: "18–36 months",
        subtitle: "Strategic Transformation",
        initiatives: h2Initiatives,
      },
      {
        id: 3,
        label: "Horizon 3",
        timeframe: "36+ months",
        subtitle: "AI-Native Future",
        initiatives: h3Initiatives,
      },
    ],
    strengths,
    gaps,
  };
}
