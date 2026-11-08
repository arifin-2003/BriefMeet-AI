/**
 * Mock User Profile Data
 * 
 * In Phase 1, this provides placeholder user profile data.
 * In Phase 2, this will be replaced with real user data from Supabase Auth (`supabase.auth.getUser()`).
 */

export const MOCK_USER = {
  id: "usr_demo_01",
  name: "Demo User",
  initials: "DU",
  email: "demo.user@briefmeet.ai",
  role: "Research Analyst",
  workspace: "Personal Workspace",
  avatarUrl: null, // null defaults to initials avatar
  tier: "Free Hackathon Tier",
  preferences: {
    theme: "beige",
    defaultMeetingTime: "10:00",
    defaultView: "onepage",
  }
};
