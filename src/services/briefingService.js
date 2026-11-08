/**
 * Briefing Service (Phase 1 Mock Implementation)
 * 
 * ARCHITECTURE NOTE FOR PHASE 2:
 * This service currently simulates the asynchronous pipeline using local mock data.
 * When migrating to Phase 2, this function's internals will be replaced with:
 * 1. Supabase auth & cache lookup (check if cached briefing exists)
 * 2. Tavily Search API calls (fetching recent news, press releases, leadership movements)
 * 3. Google Gemini API call (prompting model with retrieved sources to synthesize structured briefing JSON)
 * 4. Supabase database write (persisting briefing to the user's history)
 * 
 * The UI components consume this exact signature, ensuring zero UI refactoring later.
 */

import { MOCK_BRIEFINGS } from '../data/mockBriefings';

/**
 * Simulates a realistic multi-step async pipeline with delays.
 * @param {Object} params
 * @param {string} params.targetName - Company or person name
 * @param {string} params.meetingDate - Date of meeting (YYYY-MM-DD)
 * @param {string} params.meetingTime - Time of meeting (HH:MM or string)
 * @param {string} [params.meetingContext=""] - Optional meeting objective or goal
 * @param {boolean} [params.simulateError=false] - Explicit trigger for error testing
 * @param {function} [onProgress] - Optional callback for pipeline progress steps
 * @returns {Promise<Object>} The structured briefing object
 */
export async function generateBriefing({
  targetName,
  meetingDate,
  meetingTime,
  meetingContext = "",
  simulateError = false
}, onProgress = () => {}) {
  // Validate input parameters
  if (!targetName || !targetName.trim()) {
    throw new Error("Target company or person name is required.");
  }
  if (!meetingDate) {
    throw new Error("Meeting date is required.");
  }
  if (!meetingTime) {
    throw new Error("Meeting time is required.");
  }

  const normalizedInput = targetName.trim().toLowerCase();

  // Test error trigger: User typed "error", "fail", or toggled error simulation
  if (simulateError || normalizedInput === "error" || normalizedInput === "fail") {
    onProgress({ step: 1, message: "Initiating research crawler..." });
    await sleep(500);
    throw new Error(
      "Simulated Search Gateway Error: Tavily search service timeout or rate limit reached. Please verify your connection or try again."
    );
  }

  // Stage 1: Searching Sources
  onProgress({
    step: 1,
    title: "Searching Sources",
    message: `Querying 30-day announcements, news, and press releases for "${targetName.trim()}"...`
  });
  await sleep(600);

  // Stage 2: Analyzing Information
  onProgress({
    step: 2,
    title: "Analyzing Information",
    message: "Extracting leadership appointments, product launches, and strategic market signals..."
  });
  await sleep(600);

  // Stage 3: Generating Briefing
  onProgress({
    step: 3,
    title: "Generating Briefing",
    message: "Formulating executive summary, high-impact meeting questions, and verifying citations..."
  });
  await sleep(550);

  // Check if target matches one of our rich mock profiles
  const matchingKey = Object.keys(MOCK_BRIEFINGS).find(key => 
    normalizedInput.includes(key) || key.includes(normalizedInput)
  );

  // If a mock profile is found, return it augmented with meeting metadata
  if (matchingKey) {
    const profile = MOCK_BRIEFINGS[matchingKey];
    return {
      ...profile,
      meetingDate,
      meetingTime,
      meetingContext: meetingContext || `Executive briefing for discussion with ${profile.targetName}`,
      generatedAt: new Date().toISOString(),
      hasData: true
    };
  }

  // Check for explicit "empty" test or unrecognized entity
  if (normalizedInput.includes("empty") || normalizedInput.includes("unknown") || normalizedInput.includes("nobody")) {
    return {
      id: `empty-${Date.now()}`,
      targetName: targetName.trim(),
      targetType: "company",
      meetingDate,
      meetingTime,
      meetingContext,
      generatedAt: new Date().toISOString(),
      hasData: false, // Triggers EmptyState component!
      executiveSummary: [],
      newsLast30Days: [],
      keyHires: [],
      productLaunches: [],
      suggestedQuestions: [],
      sources: []
    };
  }

  // For any other custom input, generate a realistic template-based mock briefing
  return generateCustomMockBriefing({
    targetName: targetName.trim(),
    meetingDate,
    meetingTime,
    meetingContext
  });
}

/**
 * Utility helper to pause execution
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates an on-the-fly fictional briefing for arbitrary names entered by the user.
 */
function generateCustomMockBriefing({ targetName, meetingDate, meetingTime, meetingContext }) {
  const isPerson = /^(dr\.|mr\.|ms\.|mrs\.|prof\.)/i.test(targetName) || targetName.split(" ").length === 2;
  const entityType = isPerson ? "person" : "company";

  return {
    id: `custom-${Date.now()}`,
    targetName,
    targetType: entityType,
    tagline: isPerson 
      ? `Senior Technology Leader & Research Director`
      : `High-growth enterprise technology innovator`,
    industry: isPerson ? "Technology Strategy & Engineering" : "Enterprise Software & Cloud Platforms",
    headquarters: "San Francisco, California (Demo Placeholder)",
    founded: isPerson ? "N/A" : "2020",
    fundingStage: isPerson ? "Executive Leadership" : "Series A (Demo)",
    isDemo: true,
    meetingDate,
    meetingTime,
    meetingContext: meetingContext || `Strategic review with ${targetName}`,
    generatedAt: new Date().toISOString(),
    hasData: true,
    executiveSummary: [
      `Fictional prototype briefing generated for ${targetName}. In Phase 2, real web intelligence will be synthesized here via Tavily & Gemini API.`,
      `${targetName} has been actively scaling operational presence over the past quarter, with key initiatives focused on cloud automation and resilience.`,
      `Leadership recently reiterated a strategic focus on expanding cross-functional enterprise partnerships heading into the next fiscal cycle.`,
      `Primary objective for the upcoming meeting on ${meetingDate}: Explore synergies, understand technical timelines, and align on integration goals.`
    ],
    newsLast30Days: [
      {
        id: "cust-news-1",
        citationId: "cust-cite-1",
        title: `${targetName} Expands Multi-Region Strategic Pilot Program`,
        summary: `Announced early milestone results from enterprise pilot programs, highlighting improved workflow throughput and efficiency.`,
        date: "October 20, 2026",
        category: "Milestone",
        sourceName: "Tech Enterprise Wire (Mock Demo Source)",
        sourceUrl: "https://demo.briefmeet.ai/mock/enterprise-wire-expansion",
        sentiment: "Positive"
      },
      {
        id: "cust-news-2",
        citationId: "cust-cite-2",
        title: `Industry Review: Analyzing the Next-Generation Roadmap for ${targetName}`,
        summary: `Featured in an executive market report analyzing competitive positioning and modern architecture adoption.`,
        date: "October 08, 2026",
        category: "Market Analysis",
        sourceName: "Digital Innovation Journal (Mock Demo Source)",
        sourceUrl: "https://demo.briefmeet.ai/mock/digital-innovation-review",
        sentiment: "Neutral"
      }
    ],
    keyHires: [
      {
        id: "cust-hire-1",
        citationId: "cust-cite-3",
        name: "Alex Morgan",
        role: "VP of Product Strategy",
        previousCompany: "Former Director of Engineering, CloudScale",
        dateAnnounced: "October 12, 2026",
        significance: "Brought on to streamline product velocity and scale customer-facing enterprise integrations.",
        sourceName: "Executive Movement Wire (Mock Source)"
      }
    ],
    productLaunches: [
      {
        id: "cust-prod-1",
        citationId: "cust-cite-4",
        name: "CorePlatform v2.4",
        type: "Software Suite",
        date: "September 28, 2026",
        description: "Introduces real-time telemetry analytics, webhook integrations, and SOC-2 compliant audit logging.",
        marketImpact: "Significantly reduces enterprise onboarding cycle from weeks to under 48 hours.",
        sourceName: "Enterprise Release Radar (Mock Source)"
      }
    ],
    suggestedQuestions: [
      {
        id: "cust-q-1",
        category: "Strategic Direction",
        question: `How does the recent launch of CorePlatform v2.4 fit into your broader roadmap for enterprise customers over the next 6-12 months?`,
        context: "Examines their mid-term product trajectory and resource priorities."
      },
      {
        id: "cust-q-2",
        category: "Integration & Architecture",
        question: `What are the typical integration friction points your team encounters when deploying across client infrastructure?`,
        context: "Surfaces operational realities and reveals technical maturity."
      },
      {
        id: "cust-q-3",
        category: "Meeting Icebreaker",
        question: `Congratulations on the recent pilot expansion milestones! What has been the most encouraging feedback your team received so far?`,
        context: "Friendly opening acknowledging their recent public momentum."
      }
    ],
    sources: [
      {
        id: "cust-cite-1",
        refNumber: 1,
        title: `${targetName} Pilot Rollout Report`,
        publisher: "Tech Enterprise Wire (Mock Demo Source)",
        publishDate: "Oct 20, 2026",
        url: "https://mock-sources.briefmeet.ai/article/enterprise-wire-expansion",
        snippet: `Mock article excerpt demonstrating citation verification for ${targetName}...`
      },
      {
        id: "cust-cite-2",
        refNumber: 2,
        title: "Digital Innovation Executive Review",
        publisher: "Digital Innovation Journal (Mock Demo Source)",
        publishDate: "Oct 08, 2026",
        url: "https://mock-sources.briefmeet.ai/article/digital-innovation-review",
        snippet: "Mock industry report discussing growth metrics and market positioning..."
      },
      {
        id: "cust-cite-3",
        refNumber: 3,
        title: "Leadership Transition Wire",
        publisher: "Executive Movement Wire (Mock Demo Source)",
        publishDate: "Oct 12, 2026",
        url: "https://mock-sources.briefmeet.ai/article/alex-morgan-vp",
        snippet: "Mock appointment notice regarding executive leadership additions..."
      },
      {
        id: "cust-cite-4",
        refNumber: 4,
        title: "CorePlatform Release Highlights",
        publisher: "Enterprise Release Radar (Mock Demo Source)",
        publishDate: "Sep 28, 2026",
        url: "https://mock-sources.briefmeet.ai/article/coreplatform-release",
        snippet: "Mock software release notes and specification summary..."
      }
    ]
  };
}
