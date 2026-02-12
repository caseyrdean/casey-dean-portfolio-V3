/* Design Philosophy: Neon Apocalypse - Project data structure
 * Contains case study information based on Casey Dean's actual experience
 */

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  image: string;
  description: string;
  challenge: string;
  solution: string;
  results: string[];
  technologies: string[];
  architectureDiagram?: string;
  downloadUrl?: string;
}

export const projects: Project[] = [
  {
    id: "1",
    slug: "ai-agent-platform",
    title: "AI Agent Platform Architecture",
    subtitle: "Autonomous AI Solutions Design",
    category: "AI Solutions",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663293102400/pewmpkNIZPaOwYaP.png",
    description: "Lead Solutions Architect for AI-powered autonomous agent platform at Manus AI, translating complex business requirements into scalable, secure system designs across discovery, configuration, deployment, and post-go-live transition.",
    challenge: "Design and implement scalable architecture for an AI agent platform requiring complex integrations, data models, and compliance constraints while ensuring long-term extensibility and sustainable, supportable solutions for diverse client stakeholders.",
    solution: "Acted as primary architectural advisor to client stakeholders, guiding trade-off decisions across functionality, integrations, data models, compliance constraints, and long-term extensibility. Designed future-state architectures and workflows within Statement of Work boundaries, proactively identifying technical and operational risks related to integrations, data integrity, and adoption, mitigating them prior to production rollout.",
    results: [
      "Successfully bridged business, engineering, and support teams through comprehensive documentation",
      "Preserved architectural intent through implementation to operational handoff",
      "Enabled smooth transitions by documenting system workflows and configuration rationale",
      "Proactively identified and mitigated risks prior to production rollout"
    ],
    technologies: [
      "AWS",
      "AI/ML",
      "Serverless",
      "API Gateway",
      "Lambda",
      "System Design",
      "Solution Architecture"
    ],
    downloadUrl: "/documents/ai-platform-architecture.pdf"
  },
  {
    id: "2",
    slug: "dod-fedramp-solutions",
    title: "DoD FedRAMP Solutions",
    subtitle: "Federal Portfolio Management",
    category: "Security & Compliance",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663293102400/qPDeMdZFKHzSprHb.png",
    description: "Delivered 12 sensitive Department of Defense solutions at Sopheon, guiding secure, compliance-focused technical decisions and aligning architectures with mission goals and FedRAMP standards across $15M+ ARR in federal contracts.",
    challenge: "Design and deploy Portfolio Management solutions across $15M+ ARR in federal contracts while ensuring strict compliance with FedRAMP standards and DoD security requirements. Needed to work backwards from stakeholder needs to align SaaS platform capabilities with expected outcomes.",
    solution: "Drove design and deployment of Portfolio Management solutions by aligning delivery with customer goals and managing scope from concept to execution. Led complex migrations of SaaS platform implementations and deployments, ensuring seamless transitions and performance-optimized configurations across enterprise environments.",
    results: [
      "Drove $15M+ ARR in federal contract delivery",
      "Delivered 12 sensitive DoD solutions with FedRAMP compliance",
      "Reduced delivery time by 18% through stakeholder-aligned architecture",
      "Improved overall project efficiency across enterprise deployments"
    ],
    technologies: [
      "FedRAMP",
      "AWS GovCloud",
      "Security Architecture",
      "SaaS Platform",
      "Compliance",
      "DoD Standards"
    ],
    downloadUrl: "/documents/fedramp-architecture.pdf"
  },
  {
    id: "3",
    slug: "fortune-500-innovation",
    title: "Fortune 500 Innovation Architecture",
    subtitle: "Enterprise 0-1 Solutions",
    category: "Enterprise",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663293102400/SizwJSFEkwcpJTyz.png",
    description: "Coordinated cross-functional teams across product, engineering, and business groups for 4 Fortune 500 clients at Wilde Group, using research and design thinking workshops to define 0-1 solution opportunities that shaped early architecture direction.",
    challenge: "Translate research findings into prioritized technical focus areas while evaluating system constraints and technology gaps across multiple Fortune 500 enterprise environments. Needed to guide early architecture exploration and improve cross-team alignment during development planning.",
    solution: "Guided early architecture exploration by translating research findings into prioritized technical focus areas. Partnered with engineering leads to evaluate system constraints and technology gaps, producing modernization recommendations. Provided data-informed inputs to R&D-style planning efforts, strengthening C-suite clarity on technology priorities.",
    results: [
      "Contributed to launch of 9 enterprise innovation initiatives",
      "Reduced integration blockers by 25% across 3 business units",
      "Cut early-stage architectural alignment cycles by 30%",
      "Improved cross-team alignment during 0-N development planning"
    ],
    technologies: [
      "Enterprise Architecture",
      "Cloud Migration",
      "API Integration",
      "Design Thinking",
      "System Modernization"
    ],
    downloadUrl: "/documents/enterprise-architecture.pdf"
  },
  {
    id: "4",
    slug: "healthcare-iot-platform",
    title: "ER Patient Experience Platform",
    subtitle: "Healthcare IoT Innovation",
    category: "Healthcare IoT",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663293102400/cXjKakrlHWBvkTAE.png",
    description: "Founded Elegant Solutions and conceived an ER platform MVP with custom IoT-based mesh network, turning frontline insights from 200+ patient and staff interviews into a patient-focused design that improved hospital operations and led to company acquisition.",
    challenge: "Address ER inefficiencies, poor communication, lack of transparency, and low HCAHPS survey participation by designing solutions that improved patient transparency of process and boosted federal survey engagement across multiple HCA hospital regions.",
    solution: "Led discovery sessions with over 200 emergency room patients and hospital staff including executives across multiple HCA regions. Conceived and wireframed an ER platform MVP, oversaw development of a custom IoT-based mesh network independent of HL7, implemented timebound KPIs, and designed automated reporting tied to patient interactions enabling first-of-its-kind customer recovery tool for ERs.",
    results: [
      "Increased ER throughput by 5%",
      "Improved hospital survey participation by 65%",
      "Created first-of-its-kind customer recovery tool for ERs",
      "Platform success led to company acquisition in 2019"
    ],
    technologies: [
      "IoT",
      "Mesh Networks",
      "Healthcare IT",
      "Real-time Analytics",
      "Patient Experience",
      "Custom Hardware"
    ],
    downloadUrl: "/documents/healthcare-iot-architecture.pdf"
  }
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug);
}
