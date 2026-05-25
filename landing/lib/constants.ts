// ─── Design Tokens (from UI/UX Pro Max MASTER.md) ───

export const COLORS = {
  primary: "#0EA5E9",
  secondary: "#38BDF8",
  cta: "#F97316",
  background: "#F0F9FF",
  text: "#0C4A6E",
  textMuted: "#475569",
} as const;

// ─── Navigation Links ───

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Agent Network", href: "#agents" },
  { label: "Architecture", href: "#architecture" },
] as const;

// ─── Features ───

export const FEATURES = [
  {
    title: "Auto PRD Generation",
    description:
      "Transform a raw product idea into a comprehensive Product Requirements Document in seconds. AI analyzes market fit, user personas, and technical feasibility automatically.",
    icon: "FileText" as const,
  },
  {
    title: "Sprint Planning AI",
    description:
      "Generate user stories, estimate story points, and organize sprints with AI that understands your product context. Agile workflows on autopilot.",
    icon: "Kanban" as const,
  },
  {
    title: "Architecture Designer",
    description:
      "Get production-ready database schemas, API specifications, UI wireframes, and cloud cost estimates — all generated from your product vision.",
    icon: "Boxes" as const,
  },
] as const;

// ─── Testimonials ───

export const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "VP of Product, TechFlow",
    quote:
      "We cut our planning cycle from 3 weeks to 2 days. The PRD quality is better than what we used to produce manually.",
    rating: 5,
  },
  {
    name: "Marcus Williams",
    role: "Head of Engineering, ScaleUp",
    quote:
      "The architecture suggestions are genuinely impressive. It caught database design issues we'd have found weeks into development.",
    rating: 5,
  },
  {
    name: "Elena Rodriguez",
    role: "Product Lead, Innovate Labs",
    quote:
      "AI PM became our secret weapon. Sprint planning that took days now happens in a single session. Our velocity jumped 40%.",
    rating: 5,
  },
] as const;

// ─── Company logos for social proof ───

export const COMPANY_LOGOS = [
  "Stripe",
  "Vercel",
  "Notion",
  "Linear",
  "Figma",
  "Slack",
] as const;

// ─── Pricing ───

export interface PricingTier {
  name: string;
  price: { monthly: number; annual: number };
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  badge?: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    price: { monthly: 0, annual: 0 },
    description: "For individual PMs exploring AI-powered workflows.",
    features: [
      "3 projects per month",
      "Auto PRD generation",
      "Basic sprint planning",
      "Community support",
      "Export to Markdown",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: { monthly: 29, annual: 23 },
    description: "For teams that ship fast and iterate often.",
    features: [
      "Unlimited projects",
      "Advanced PRD + User Stories",
      "Architecture & DB schema",
      "API specification generator",
      "Cloud cost estimator",
      "Priority support",
      "PDF & Notion export",
    ],
    cta: "Start Free Trial",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: { monthly: 99, annual: 79 },
    description: "For organizations with complex product portfolios.",
    features: [
      "Everything in Pro",
      "Custom AI model tuning",
      "SSO & SAML",
      "Dedicated account manager",
      "SLA & uptime guarantee",
      "Advanced analytics",
      "Custom integrations",
      "On-premise deployment",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

// ─── FAQ ───

export const FAQ_ITEMS = [
  {
    question: "How does AI Product Manager generate PRDs?",
    answer:
      "Our AI analyzes your product idea using advanced language models to produce structured PRDs with executive summaries, user personas, functional requirements, success metrics, and more. It draws on best practices from thousands of successful product launches.",
  },
  {
    question: "Can I customize the generated documents?",
    answer:
      "Absolutely. Every generated artifact — PRDs, user stories, schemas, wireframes — is fully editable. You can refine, add context, and regenerate specific sections without starting from scratch.",
  },
  {
    question: "Is my product data secure?",
    answer:
      "Yes. We use end-to-end encryption, never train our models on your data, and comply with SOC 2 Type II. Enterprise plans include on-premise deployment options for maximum data sovereignty.",
  },
  {
    question: "What AI models power the platform?",
    answer:
      "We use Google's Gemini models for generation tasks. The platform is model-agnostic by design — as better models emerge, your experience automatically improves.",
  },
  {
    question: "Can I integrate with Jira, Linear, or Notion?",
    answer:
      "Pro and Enterprise plans support direct export to Jira, Linear, Notion, and Confluence. We also provide a REST API for custom integrations with any tool in your stack.",
  },
  {
    question: "Is there a free trial for Pro features?",
    answer:
      "Yes! Every new account gets a 14-day free trial of Pro features. No credit card required. You can downgrade to Starter anytime if it's not the right fit.",
  },
] as const;

// ─── Stats ───

export const STATS = [
  { value: "2,000+", label: "Product Teams" },
  { value: "50,000+", label: "PRDs Generated" },
  { value: "10×", label: "Faster Planning" },
  { value: "98%", label: "Satisfaction Rate" },
] as const;
