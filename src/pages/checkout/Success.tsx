import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '../../../components/ui/button';

const Success = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center"
      >
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Payment Successful!</h1>
        <p className="text-neutral-600 mb-8">
          Welcome to the next level of your artist career. Your plan has been successfully upgraded.
        </p>
        <div className="space-y-4">
          <Link to="/dashboard" className={buttonVariants({ className: "w-full", size: "lg" })}>
            Go to Dashboard
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <a href="/#pricing" className={buttonVariants({ variant: "outline", className: "w-full" })}>
            View Plan Details
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Success;
