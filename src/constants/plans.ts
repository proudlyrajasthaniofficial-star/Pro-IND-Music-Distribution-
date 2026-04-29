export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  stripePriceId: string;
  variant: 'basic' | 'premium' | 'enterprise';
}

export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Standard Artist',
    price: 99,
    currency: 'USD',
    interval: 'year',
    description: 'Perfect for getting your music on stores.',
    features: [
      'Unlimited Releases',
      'Spotify & Apple Music',
      'keep 100% Royalties',
      'Basic Analytics',
      'Standard Support'
    ],
    stripePriceId: 'price_basic_placeholder', // User will update this
    variant: 'basic'
  },
  {
    id: 'premium',
    name: 'Pro Artist',
    price: 199,
    currency: 'USD',
    interval: 'year',
    description: 'Advanced tools for the professional artist.',
    features: [
      'Everything in Standard',
      'Content ID (YouTube/TikTok)',
      'Advanced Analytics',
      'Priority Artist Support',
      'Official Artist Channel (OAC)'
    ],
    stripePriceId: 'price_premium_placeholder', // User will update this
    variant: 'premium'
  },
  {
    id: 'enterprise',
    name: 'Indie Label',
    price: 499,
    currency: 'USD',
    interval: 'year',
    description: 'For record labels and collectives.',
    features: [
      'Everything in Pro',
      'Unlimited Artists',
      'Royalties Splitting',
      'White-label Support',
      'Dedicated Account Manager'
    ],
    stripePriceId: 'price_enterprise_placeholder', // User will update this
    variant: 'enterprise'
  }
];
