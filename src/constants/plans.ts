export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'lifetime';
  description: string;
  features: string[];
  variant: 'basic' | 'premium' | 'enterprise' | 'label' | 'unlimited-label';
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    currency: 'INR',
    interval: 'lifetime',
    description: 'Perfect for beginners starting their journey.',
    features: [
      "1 Song Release (per month)",
      "70% Royalty Earnings",
      "Basic Distribution",
      "Standard Delivery (7–10 days)",
      "Basic Artist Dashboard",
      "Track Status Monitoring"
    ],
    variant: 'basic'
  },
  {
    id: 'artist',
    name: 'Artist Plan',
    price: 1499,
    currency: 'INR',
    interval: 'year',
    description: 'Advanced tools for the serious artist.',
    features: [
      "Unlimited Song Releases",
      "85% Royalty Earnings",
      "150+ Platforms",
      "YouTube Content ID (Basic)",
      "Caller Tune (India)",
      "ISRC & UPC Generation",
      "Basic Analytics",
      "Lyrics Distribution",
      "Cover Song Support"
    ],
    variant: 'premium'
  },
  {
    id: 'pro',
    name: 'Pro Artist',
    price: 2499,
    currency: 'INR',
    interval: 'year',
    description: 'The ultimate toolkit for professional artists.',
    features: [
      "Everything in Artist Plan",
      "90% Royalty Earnings",
      "Fast Release (48 Hours)",
      "Instagram & Facebook Music",
      "YouTube OAC Support",
      "Advanced Analytics",
      "Smart Link / Pre-save",
      "Release Scheduling",
      "Priority Support (WhatsApp)"
    ],
    variant: 'enterprise'
  },
  {
    id: 'label',
    name: 'Label Plan',
    price: 4999,
    currency: 'INR',
    interval: 'year',
    description: 'For record labels and collectives.',
    features: [
      "Manage up to 10 Artists",
      "Unlimited Releases",
      "90% Royalty Earnings",
      "Team Access Dashboard",
      "Revenue Split System",
      "Label Name Branding",
      "Bulk Upload System",
      "YouTube Content ID (Adv)"
    ],
    variant: 'enterprise'
  }
];
