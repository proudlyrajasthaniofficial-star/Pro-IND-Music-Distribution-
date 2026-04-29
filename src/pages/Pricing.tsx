import React from 'react';
import { motion } from 'motion/react';
import { Check, ArrowRight } from 'lucide-react';
import { PLANS, Plan } from '../constants/plans';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { toast } from 'sonner';

const Pricing = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleBuyNow = async (plan: Plan) => {
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          priceId: plan.stripePriceId,
          userId: user.uid,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to initiate checkout");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      toast.error("An error occurred during checkout initialization");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-neutral-900 mb-4"
          >
            Transparent Pricing for <span className="text-primary underline decoration-primary/30">ArtistPro</span>
          </motion.h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Choose the plan that fits your career stage. Get your music heard globally with ArtistPro's secure distribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative flex flex-col h-full border-2 ${plan.id === profile?.planId ? 'border-primary' : 'border-neutral-100'} hover:border-primary/50 transition-colors shadow-sm`}>
                {plan.id === profile?.planId && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Current Plan
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-neutral-500">/{plan.interval}</span>
                  </div>
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 group">
                        <div className="mt-1 p-0.5 rounded-full bg-emerald-100 text-emerald-600">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-neutral-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={plan.id === profile?.planId ? "outline" : "default"}
                    className="w-full group"
                    size="lg"
                    onClick={() => handleBuyNow(plan)}
                    disabled={plan.id === profile?.planId}
                  >
                    {plan.id === profile?.planId ? 'Active' : 'Get Started'}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
