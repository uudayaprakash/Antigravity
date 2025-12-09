"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import styles from "./Hero.module.css";

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.bgGlow} />

            <div className="container">
                <motion.div
                    className={styles.content}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <motion.div
                        className={styles.pill}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Sparkles size={16} className={styles.icon} />
                        <span>AI-Powered Career Assistant</span>
                    </motion.div>

                    <h1 className={styles.title}>
                        Land Your <span className="gradient-text">Dream Job</span> <br />
                        with <span className={styles.highlight}>AI Precision</span>
                    </h1>

                    <p className={styles.subtitle}>
                        Stop guessing. Instantly analyze your CV against any job description.
                        Get tailored insights, match scores, and ATS-ready rewrites in seconds.
                    </p>

                    <motion.button
                        className={styles.cta}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            document.getElementById("analyzer")?.scrollIntoView({ behavior: "smooth" });
                        }}
                    >
                        Start Free Analysis
                        <ArrowRight size={20} />
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
}
