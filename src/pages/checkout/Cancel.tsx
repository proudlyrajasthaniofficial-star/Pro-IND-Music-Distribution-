import React from 'react';
import { motion } from 'motion/react';
import { XCircle, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '../../../components/ui/button';

const Cancel = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center"
      >
        <div className="flex justify-center mb-6">
          <XCircle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Payment Cancelled</h1>
        <p className="text-neutral-600 mb-8">
          No worries! You weren't charged anything. If you're having trouble, our support team is here to help.
        </p>
        <div className="space-y-4">
          <a href="/#pricing" className={buttonVariants({ className: "w-full", size: "lg" })}>
            <RefreshCcw className="mr-2 w-4 h-4" />
            Try Again
          </a>
          <Link to="/dashboard" className={buttonVariants({ variant: "ghost", className: "w-full text-neutral-500" })}>
            Return to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Cancel;
