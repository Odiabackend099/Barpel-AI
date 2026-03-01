"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white text-[#102A33] flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <h1 className="text-9xl font-bold bg-gradient-to-r from-[#37A195] to-[#244B52] bg-clip-text text-transparent mb-4">
                    404
                </h1>
                <h2 className="text-2xl font-bold text-[#102A33] mb-6">Page Not Found</h2>
                <p className="text-[#6B7280] max-w-md mx-auto mb-10">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-6 py-3 bg-[#37A195] text-white rounded-lg font-bold shadow-lg shadow-[#37A195]/25 hover:shadow-xl hover:shadow-[#37A195]/35 hover:scale-105 active:scale-100 transition-all duration-200"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-[#37A195] rounded-lg font-bold border border-[#E5E7EB] hover:bg-gray-200 hover:scale-105 active:scale-100 transition-all duration-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
