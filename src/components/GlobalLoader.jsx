import React from 'react';
import { motion } from 'framer-motion';
import './GlobalLoader.css'; // ✅ We'll create this next

export default function GlobalLoader() {
  return (
    <div className="global-loader">
      <motion.div
        className="loader-circle"
        animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.h4
        className="loader-text"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Streamify
      </motion.h4>
      <motion.p
        className="loader-sub"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Loading your experience...
      </motion.p>
    </div>
  );
}
