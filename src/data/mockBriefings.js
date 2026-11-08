/**
 * Mock Data Repository for BriefMeet AI (Phase 1 Frontend Prototype)
 * 
 * NOTE: All entities, people, announcements, and citations in this file
 * are strictly FICTIONAL DEMO DATA created for UI demonstration.
 * In Phase 2, this layer will be replaced by real-time Tavily Search & Gemini AI synthesis.
 */

export const MOCK_BRIEFINGS = {
  // Demo 1: Fictional Company
  "acme robotics": {
    id: "bm-demo-001",
    targetName: "Acme Robotics Technologies",
    targetType: "company",
    tagline: "Autonomous intralogistics robotics for smart distribution centers",
    industry: "Industrial Automation & AI Robotics",
    headquarters: "Austin, Texas (Fictional)",
    founded: "2021",
    fundingStage: "Series B ($42M raised)",
    isDemo: true,
    executiveSummary: [
      "Acme Robotics recently completed a successful pilot across 14 distribution facilities, demonstrating a 38% decrease in warehouse cycle times.",
      "The leadership team is actively reorganizing after hiring former Amazon Robotics lead Clara Vance as VP of Autonomy.",
      "Currently rolling out their next-gen fleet software 'AcuFlow 3.0' while preparing for international expansion in Q3.",
      "Primary conversation focus: How their fleet orchestration scales across multi-tenant warehouse environments and their timeline for European certifications."
    ],
    newsLast30Days: [
      {
        id: "news-1",
        citationId: "cite-1",
        title: "Acme Robotics Deploys 500-Unit Autonomous Fleet with Global Logistics Partner",
        summary: "Announced wide commercial deployment of the SwiftCart-7 series, logging over 1.2M autonomous operational hours with zero safety incidents.",
        date: "October 24, 2026",
        category: "Commercial Milestone",
        sourceName: "RoboLogistics Weekly (Mock Publication)",
        sourceUrl: "https://demo.briefmeet.ai/citations/robologistics-acme-500",
        sentiment: "Positive"
      },
      {
        id: "news-2",
        citationId: "cite-2",
        title: "Supply Chain Resilience Award 2026 Conferred on Acme Robotics",
        summary: "Recognized for novel battery-swapping architecture that maintains 99.4% fleet uptime during peak holiday logistics surges.",
        date: "October 14, 2026",
        category: "Industry Recognition",
        sourceName: "Automated Commerce Review (Mock Publication)",
        sourceUrl: "https://demo.briefmeet.ai/citations/supply-chain-award-2026",
        sentiment: "Positive"
      },
      {
        id: "news-3",
        citationId: "cite-3",
        title: "Acme Robotics Opens European Testing Lab in Eindhoven",
        summary: "New test lab aims to fast-track CE machinery directive compliance and build regional engineering support for DACH logistics hubs.",
        date: "September 29, 2026",
        category: "Expansion",
        sourceName: "EuroTech Logistics Dispatch (Mock Publication)",
        sourceUrl: "https://demo.briefmeet.ai/citations/acme-eindhoven-hub",
        sentiment: "Neutral"
      }
    ],
    keyHires: [
      {
        id: "hire-1",
        citationId: "cite-4",
        name: "Dr. Clara Vance",
        role: "VP of Autonomous Systems",
        previousCompany: "Former Principal Engineer, Amazon Robotics",
        dateAnnounced: "October 18, 2026",
        significance: "Brought in to lead real-time multi-agent collision avoidance algorithms and SLAM mapping for dense warehouse aisles.",
        sourceName: "Tech Talent Radar (Mock Source)"
      },
      {
        id: "hire-2",
        citationId: "cite-5",
        name: "Marcus Sterling",
        role: "Chief Revenue Officer",
        previousCompany: "Former VP Sales, Symbotic",
        dateAnnounced: "September 22, 2026",
        significance: "Mandated to expand enterprise Fortune 500 3PL pipeline and recurring Software-as-a-Service contracts.",
        sourceName: "Executive Movement Wire (Mock Source)"
      }
    ],
    productLaunches: [
      {
        id: "prod-1",
        citationId: "cite-6",
        name: "AcuFlow 3.0 Fleet Operating System",
        type: "Software Platform",
        date: "October 08, 2026",
        description: "Cloud-native fleet orchestration system that supports dynamic rerouting around unexpected conveyor obstructions in under 12 milliseconds.",
        marketImpact: "Addresses a key pain point: legacy robots stop when paths are blocked; AcuFlow continuously negotiates alternative corridors.",
        sourceName: "Robotics Product Wire (Mock Source)"
      },
      {
        id: "prod-2",
        citationId: "cite-7",
        name: "SwiftCart Ultra-Payload Mod",
        type: "Hardware Module",
        date: "September 15, 2026",
        description: "Modular chassis upgrade enabling existing robots to carry up to 1,200 kg heavy industrial palletized loads.",
        marketImpact: "Unlocks heavy manufacturing and cold-storage distribution verticals.",
        sourceName: "Material Handling Digest (Mock Source)"
      }
    ],
    suggestedQuestions: [
      {
        id: "q-1",
        category: "Strategic Direction",
        question: "With the recent launch of AcuFlow 3.0 and the Eindhoven lab, how are you prioritizing European expansion versus deeper US warehouse penetration?",
        context: "Reveals their current bandwidth, CAPEX allocation, and regional go-to-market priorities."
      },
      {
        id: "q-2",
        category: "Product & Technology",
        question: "How has Dr. Clara Vance's arrival influenced your technical roadmap for multi-agent SLAM in high-density facilities?",
        context: "Shows respect for recent leadership hires and sparks deep technical discussion on their differentiation."
      },
      {
        id: "q-3",
        category: "Commercial & Operations",
        question: "What feedback are 3PL pilots giving on the battery-swapping architecture compared to traditional depot fast-charging?",
        context: "Directly relates to their October award and addresses ROI/TCO considerations for prospective buyers."
      },
      {
        id: "q-4",
        category: "Meeting Icebreaker",
        question: "Congratulations on crossing the 1.2M autonomous hours milestone with the SwiftCart-7 fleet! What was the biggest surprise during deployment?",
        context: "Positive opener acknowledging their team's verified recent accomplishment."
      }
    ],
    sources: [
      {
        id: "cite-1",
        refNumber: 1,
        title: "Commercial Deployment Release: SwiftCart-7 Logs 1.2M Safe Hours",
        publisher: "RoboLogistics Weekly (Mock Demo Source)",
        publishDate: "Oct 24, 2026",
        url: "https://mock-sources.briefmeet.ai/article/robologistics-acme-500",
        snippet: "Acme Robotics announced today the milestone deployment of 500 autonomous units with a tier-one logistics provider..."
      },
      {
        id: "cite-2",
        refNumber: 2,
        title: "2026 Supply Chain Excellence: Battery Innovation Spotlight",
        publisher: "Automated Commerce Review (Mock Demo Source)",
        publishDate: "Oct 14, 2026",
        url: "https://mock-sources.briefmeet.ai/article/acr-battery-awards-2026",
        snippet: "The annual resilience trophy was awarded to Acme Robotics for their modular hot-swap energy pack architecture..."
      },
      {
        id: "cite-3",
        refNumber: 3,
        title: "Acme Robotics Deepens European Presence with R&D Center",
        publisher: "EuroTech Logistics Dispatch (Mock Demo Source)",
        publishDate: "Sep 29, 2026",
        url: "https://mock-sources.briefmeet.ai/article/eurotech-eindhoven-hub",
        snippet: "Expanding outside the North American perimeter, Acme has established a 15,000 sq ft testing facility in the Brainport Eindhoven region..."
      },
      {
        id: "cite-4",
        refNumber: 4,
        title: "Autonomous Systems Leader Clara Vance Moves to Acme Robotics",
        publisher: "Tech Talent Radar (Mock Demo Source)",
        publishDate: "Oct 18, 2026",
        url: "https://mock-sources.briefmeet.ai/article/clara-vance-acme-vp",
        snippet: "Former Amazon Robotics veteran Dr. Clara Vance has been appointed VP of Autonomy at Acme Robotics..."
      },
      {
        id: "cite-5",
        refNumber: 5,
        title: "Marcus Sterling Joins Acme Robotics as CRO",
        publisher: "Executive Movement Wire (Mock Demo Source)",
        publishDate: "Sep 22, 2026",
        url: "https://mock-sources.briefmeet.ai/article/sterling-cro-symbotic-acme",
        snippet: "Targeting aggressive enterprise recurring revenue growth, Acme Robotics announced Marcus Sterling as Chief Revenue Officer..."
      },
      {
        id: "cite-6",
        refNumber: 6,
        title: "AcuFlow 3.0 Platform Overview: Sub-12ms Rerouting Benchmark",
        publisher: "Robotics Product Wire (Mock Demo Source)",
        publishDate: "Oct 08, 2026",
        url: "https://mock-sources.briefmeet.ai/article/acuflow-3-benchmarks",
        snippet: "Acme unveiled its 3rd generation fleet operating system with distributed obstacle resolution algorithms..."
      },
      {
        id: "cite-7",
        refNumber: 7,
        title: "SwiftCart Ultra-Payload Spec Sheet & Field Tests",
        publisher: "Material Handling Digest (Mock Demo Source)",
        publishDate: "Sep 15, 2026",
        url: "https://mock-sources.briefmeet.ai/article/swiftcart-ultra-payload-review",
        snippet: "Hardware testing confirmed payload capacities exceeding 1,200kg across varied concrete floor grades..."
      }
    ]
  },

  // Demo 2: Fictional Person
  "dr. elena vance": {
    id: "bm-demo-002",
    targetName: "Dr. Elena Vance",
    targetType: "person",
    tagline: "VP of Quantum Bio-Simulation at Veridian Genomics",
    industry: "Biotech & Quantum Computational Biology",
    headquarters: "Cambridge, Massachusetts (Fictional)",
    founded: "N/A",
    fundingStage: "Corporate Executive",
    isDemo: true,
    executiveSummary: [
      "Dr. Elena Vance is a leading computational biochemist specializing in hybrid classical-quantum molecular folding models.",
      "Recently published a landmark pre-print on de novo enzyme synthesis that reduced in-silico screening latency from months to 72 hours.",
      "Keynote speaker scheduled for the upcoming Global BioCompute Summit next month in Boston.",
      "Primary conversation focus: Commercial partnerships for Veridian's quantum enzyme pipeline and their computational chemistry infrastructure roadmap."
    ],
    newsLast30Days: [
      {
        id: "news-p1",
        citationId: "cite-p1",
        title: "Dr. Vance Keynote Announced for BioCompute Global 2026",
        summary: "Organizers confirmed Dr. Elena Vance will deliver the opening keynote on fault-tolerant quantum algorithms for antibody design.",
        date: "October 28, 2026",
        category: "Speaking Engagement",
        sourceName: "BioCompute World News (Mock Publication)",
        sourceUrl: "https://demo.briefmeet.ai/citations/vance-biocompute-keynote",
        sentiment: "Positive"
      },
      {
        id: "news-p2",
        citationId: "cite-p2",
        title: "Veridian Genomics Team Led by Vance Publishes Enzyme Synthesis Breakthrough",
        summary: "Peer-reviewed paper shows 84% accuracy in predicting non-natural peptide binding affinities using hybrid Hamiltonian simulations.",
        date: "October 11, 2026",
        category: "Research Publication",
        sourceName: "Journal of Computational Pharmacology (Mock)",
        sourceUrl: "https://demo.briefmeet.ai/citations/vance-enzyme-paper-2026",
        sentiment: "Positive"
      }
    ],
    keyHires: [
      {
        id: "hire-p1",
        citationId: "cite-p3",
        name: "Dr. Kenji Sato",
        role: "Principal Quantum Architect (Direct Report)",
        previousCompany: "Former Research Fellow, RIKEN Quantum Computing Center",
        dateAnnounced: "October 02, 2026",
        significance: "Dr. Vance recruited Sato to lead the compiler team interfacing molecular Hamiltonian maps with 256-qubit QPUs.",
        sourceName: "Cambridge Biotech Digest (Mock Source)"
      }
    ],
    productLaunches: [
      {
        id: "prod-p1",
        citationId: "cite-p4",
        name: "FoldQuantum API (Private Beta)",
        type: "Computational Service",
        date: "October 19, 2026",
        description: "Cloud API providing pharmaceutical partners early access to quantum accelerated ligand-target affinity scoring.",
        marketImpact: "Enables biopharma researchers to submit molecular structures and receive binding predictions in hours.",
        sourceName: "Life Science Cloud Insights (Mock Source)"
      }
    ],
    suggestedQuestions: [
      {
        id: "qp-1",
        category: "Research & Vision",
        question: "Your recent paper demonstrated an 84% accuracy rate on non-natural peptides. What are the key bottlenecks when scaling this to larger macromolecular complexes?",
        context: "Directly cites her latest research paper and demonstrates deep preparation."
      },
      {
        id: "qp-2",
        category: "Industry Transition",
        question: "How do you anticipate FoldQuantum API will alter the early drug discovery cycle for mid-tier biotechs lacking dedicated quantum teams?",
        context: "Connects her technical research to commercial market application."
      },
      {
        id: "qp-3",
        category: "Meeting Icebreaker",
        question: "I saw you're opening BioCompute in Boston next month. How is the preparation going for your keynote on fault-tolerant antibody design?",
        context: "Warm, relevant, and demonstrates you are tracking her public speaking schedule."
      }
    ],
    sources: [
      {
        id: "cite-p1",
        refNumber: 1,
        title: "BioCompute 2026 Keynote Announcement: Dr. Elena Vance",
        publisher: "BioCompute World News (Mock Demo Source)",
        publishDate: "Oct 28, 2026",
        url: "https://mock-sources.briefmeet.ai/article/vance-biocompute-keynote",
        snippet: "Opening the annual symposium, Dr. Elena Vance will present new methodologies for hybrid quantum-classical molecular screening..."
      },
      {
        id: "cite-p2",
        refNumber: 2,
        title: "Hybrid Quantum Hamiltonian Synthesis for Non-Natural Peptides",
        publisher: "Journal of Computational Pharmacology (Mock Demo Source)",
        publishDate: "Oct 11, 2026",
        url: "https://mock-sources.briefmeet.ai/article/vance-enzyme-paper-2026",
        snippet: "Lead author Dr. Elena Vance and colleagues demonstrated benchmark improvements over standard DFT algorithms..."
      },
      {
        id: "cite-p3",
        refNumber: 3,
        title: "Veridian Genomics Expands Cambridge R&D Leadership",
        publisher: "Cambridge Biotech Digest (Mock Demo Source)",
        publishDate: "Oct 02, 2026",
        url: "https://mock-sources.briefmeet.ai/article/sato-quantum-veridian",
        snippet: "Dr. Kenji Sato has joined Dr. Vance's quantum bio-simulation division from RIKEN..."
      },
      {
        id: "cite-p4",
        refNumber: 4,
        title: "Veridian Initiates FoldQuantum Beta for Pharma Research",
        publisher: "Life Science Cloud Insights (Mock Demo Source)",
        publishDate: "Oct 19, 2026",
        url: "https://mock-sources.briefmeet.ai/article/foldquantum-beta-rollout",
        snippet: "The newly released FoldQuantum API is now open to five select global pharmaceutical pilot partners..."
      }
    ]
  },

  // Demo 3: Fictional SaaS Company
  "solis energy ai": {
    id: "bm-demo-003",
    targetName: "Solis Energy AI",
    targetType: "company",
    tagline: "Predictive microgrid load balancing and solar generation forecasting",
    industry: "CleanTech & Grid Intelligence",
    headquarters: "Denver, Colorado (Fictional)",
    founded: "2022",
    fundingStage: "Series A ($18M raised)",
    isDemo: true,
    executiveSummary: [
      "Solis Energy AI provides real-time distributed grid intelligence that helps regional utility operators integrate high percentages of intermittent renewables.",
      "Recently signed a multi-year partnership with Colorado Clean Power to manage 450 Megawatts of community solar storage.",
      "Named former Tesla Energy lead Maya Chen as Chief Technology Officer.",
      "Primary conversation focus: Their microgrid battery dispatch API and integration timeframes with legacy SCADA power systems."
    ],
    newsLast30Days: [
      {
        id: "news-s1",
        citationId: "cite-s1",
        title: "Colorado Clean Power Selects Solis for 450MW Grid Optimization",
        summary: "Utility pilot contract finalized to balance renewable surges across mountain municipal grids.",
        date: "October 21, 2026",
        category: "Commercial Contract",
        sourceName: "CleanGrid Monthly (Mock Publication)",
        sourceUrl: "https://demo.briefmeet.ai/citations/solis-colorado-450mw",
        sentiment: "Positive"
      },
      {
        id: "news-s2",
        citationId: "cite-s2",
        title: "Solis Energy Achieves NERC CIP Critical Infrastructure Security Audit",
        summary: "Completed rigorous third-party penetration and reliability assessment required for high-voltage transmission integration.",
        date: "October 05, 2026",
        category: "Compliance & Security",
        sourceName: "Utility Cyber Sentinel (Mock Publication)",
        sourceUrl: "https://demo.briefmeet.ai/citations/solis-nerc-cip-certification",
        sentiment: "Positive"
      }
    ],
    keyHires: [
      {
        id: "hire-s1",
        citationId: "cite-s3",
        name: "Maya Chen",
        role: "Chief Technology Officer",
        previousCompany: "Former Staff Engineer, Tesla Energy Megapack Grid Software",
        dateAnnounced: "October 15, 2026",
        significance: "Brought in to scale distributed virtual power plant (VPP) aggregation algorithms.",
        sourceName: "CleanTech Talent Report (Mock Source)"
      }
    ],
    productLaunches: [
      {
        id: "prod-s1",
        citationId: "cite-s4",
        name: "GridPulse Edge 2.0 Gateway",
        type: "IoT & Edge Computing",
        date: "September 30, 2026",
        description: "Hardened edge device providing sub-second frequency regulation telemetry to substation engineers.",
        marketImpact: "Eliminates satellite latency delays for remote desert and mountain solar farms.",
        sourceName: "Energy Tech Daily (Mock Source)"
      }
    ],
    suggestedQuestions: [
      {
        id: "qs-1",
        category: "Integration & Architecture",
        question: "How does Solis handle protocol translation between modern MQTT/REST microgrid nodes and legacy DNP3/Modbus utility protocols?",
        context: "Touches on their recent NERC CIP audit and real-world deployment challenges with legacy infrastructure."
      },
      {
        id: "qs-2",
        category: "Market Expansion",
        question: "Following Maya Chen's appointment, how do you see Solis evolving from forecasting into automated virtual power plant (VPP) bidding?",
        context: "Draws insight from their key executive hire and explores their high-margin software roadmap."
      }
    ],
    sources: [
      {
        id: "cite-s1",
        refNumber: 1,
        title: "Colorado Clean Power Deploys Solis Grid Analytics Across 450MW",
        publisher: "CleanGrid Monthly (Mock Demo Source)",
        publishDate: "Oct 21, 2026",
        url: "https://mock-sources.briefmeet.ai/article/solis-colorado-450mw",
        snippet: "Colorado's largest renewable cooperative has selected Solis Energy AI for real-time load management..."
      },
      {
        id: "cite-s2",
        refNumber: 2,
        title: "Solis Energy Passes NERC CIP Compliance Verification",
        publisher: "Utility Cyber Sentinel (Mock Demo Source)",
        publishDate: "Oct 05, 2026",
        url: "https://mock-sources.briefmeet.ai/article/solis-nerc-cip-certification",
        snippet: "Third-party auditing firm verified Solis Energy AI meets all North American electric reliability criteria..."
      },
      {
        id: "cite-s3",
        refNumber: 3,
        title: "CleanTech Moves: Maya Chen Joins Solis Energy AI as CTO",
        publisher: "CleanTech Talent Report (Mock Demo Source)",
        publishDate: "Oct 15, 2026",
        url: "https://mock-sources.briefmeet.ai/article/maya-chen-solis-cto",
        snippet: "Bringing extensive Megapack and distributed energy software experience, Maya Chen joins Solis..."
      },
      {
        id: "cite-s4",
        refNumber: 4,
        title: "GridPulse Edge 2.0 Specs and Field Verification",
        publisher: "Energy Tech Daily (Mock Demo Source)",
        publishDate: "Sep 30, 2026",
        url: "https://mock-sources.briefmeet.ai/article/gridpulse-edge-launch",
        snippet: "The new hardware release enables sub-second telemetry without requiring dedicated fiber optic lines..."
      }
    ]
  }
};

/**
 * Pre-populated demo presets to allow users and hackathon judges
 * to test the application in a single click.
 */
export const DEMO_PRESETS = [
  {
    label: "Acme Robotics",
    name: "Acme Robotics",
    type: "company",
    description: "Series B warehouse automation robotics startup",
    badge: "Company Demo"
  },
  {
    label: "Dr. Elena Vance",
    name: "Dr. Elena Vance",
    type: "person",
    description: "VP of Quantum Bio-Simulation at Veridian Genomics",
    badge: "Person Demo"
  },
  {
    label: "Solis Energy AI",
    name: "Solis Energy AI",
    type: "company",
    description: "CleanTech grid intelligence & microgrid forecasting",
    badge: "CleanTech Demo"
  }
];

/**
 * Recent briefings history (for sidebar / dashboard recent activity)
 */
export const INITIAL_RECENT_BRIEFINGS = [
  {
    id: "hist-001",
    targetName: "Acme Robotics Technologies",
    targetType: "company",
    meetingDate: "2026-11-12",
    meetingTime: "10:30 AM",
    generatedAt: "2 hours ago",
    status: "Ready",
    sourcesCount: 7
  },
  {
    id: "hist-002",
    targetName: "Dr. Elena Vance",
    targetType: "person",
    meetingDate: "2026-11-14",
    meetingTime: "02:00 PM",
    generatedAt: "Yesterday",
    status: "Ready",
    sourcesCount: 4
  },
  {
    id: "hist-003",
    targetName: "Solis Energy AI",
    targetType: "company",
    meetingDate: "2026-11-16",
    meetingTime: "11:15 AM",
    generatedAt: "3 days ago",
    status: "Ready",
    sourcesCount: 4
  }
];
