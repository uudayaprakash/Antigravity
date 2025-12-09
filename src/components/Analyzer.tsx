"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, ChevronRight, CheckCircle, Loader2, Sparkles } from "lucide-react";
import styles from "./Analyzer.module.css";

// Interface for MVP
type AnalysisResult = {
    score: number;
    matchDetails: {
        skillsMatch: string[];
        missingSkills: string[];
    };
    rewrittenCV: string;
} | null;

export default function Analyzer() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [jdText, setJdText] = useState("");
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [result, setResult] = useState<AnalysisResult>(null);

    const handleJdSubmit = () => {
        if (jdText.trim().length > 20) {
            setStep(2);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCvFile(e.target.files[0]);
        }
    };

    const startAnalysis = async () => {
        if (!cvFile || !jdText) return;

        setStep(3);
        setIsAnalyzing(true);
        setResult(null);

        const formData = new FormData();
        formData.append("jdText", jdText);
        formData.append("cvFile", cvFile);

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Analysis failed");

            const data: AnalysisResult = await res.json();
            setResult(data);
        } catch (error) {
            console.error(error);
            alert("Something went wrong. Please try again.");
            setStep(1); // Reset on error
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <section id="analyzer" className={styles.section}>
            <div className="container">
                <div className={styles.wrapper}>
                    {/* Progress Steps */}
                    <div className={styles.progress}>
                        <StepIndicator current={step} step={1} label="Paste Job Description" icon={FileText} />
                        <div className={styles.connector} data-active={step >= 2} />
                        <StepIndicator current={step} step={2} label="Upload CV" icon={Upload} />
                        <div className={styles.connector} data-active={step >= 3} />
                        <StepIndicator current={step} step={3} label="Get Results" icon={CheckCircle} />
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', minHeight: '400px' }}>
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={styles.stepContent}
                                >
                                    <h2 className={styles.stepTitle}>Paste the Job Description</h2>
                                    <p className={styles.stepDesc}>Copy the full job description text here.</p>

                                    <textarea
                                        className={styles.textarea}
                                        placeholder="e.g. Senior Frontend Engineer... Responsibilities..."
                                        value={jdText}
                                        onChange={(e) => setJdText(e.target.value)}
                                    />

                                    <div className={styles.actionRow}>
                                        <button
                                            className={styles.primaryBtn}
                                            onClick={handleJdSubmit}
                                            disabled={jdText.trim().length < 20}
                                        >
                                            Next Step <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={styles.stepContent}
                                >
                                    <button className={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
                                    <h2 className={styles.stepTitle}>Upload your CV</h2>
                                    <p className={styles.stepDesc}>Upload your resume in PDF format.</p>

                                    <div className={styles.uploadZone}>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileUpload}
                                            id="cv-upload"
                                            className={styles.fileInput}
                                        />
                                        <label htmlFor="cv-upload" className={styles.fileLabel}>
                                            <Upload size={32} />
                                            <span>{cvFile ? cvFile.name : "Click to upload PDF"}</span>
                                        </label>
                                    </div>

                                    <div className={styles.actionRow}>
                                        <button
                                            className={styles.primaryBtn}
                                            onClick={startAnalysis}
                                            disabled={!cvFile}
                                        >
                                            Analyze Match <Sparkles size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={styles.stepContent}
                                >
                                    {isAnalyzing ? (
                                        <div className={styles.loadingState}>
                                            <Loader2 size={48} className={styles.spinner} />
                                            <h3>Analyzing your profile against the job...</h3>
                                            <p style={{ color: '#94a3b8' }}>Extracting skills, inferring context, and checking ATS compatibility...</p>
                                        </div>
                                    ) : result ? (
                                        <div className={styles.resultsGrid}>
                                            {/* Score Card */}
                                            <div className={styles.scoreCard}>
                                                <div className={styles.scoreCircle}>
                                                    <svg width="120" height="120" viewBox="0 0 120 120">
                                                        <circle cx="60" cy="60" r="54" fill="none" stroke="#334155" strokeWidth="8" />
                                                        <motion.circle
                                                            cx="60" cy="60" r="54"
                                                            fill="none"
                                                            stroke={result.score > 70 ? "#10b981" : result.score > 50 ? "#f59e0b" : "#ef4444"}
                                                            strokeWidth="8"
                                                            strokeDasharray="339.292"
                                                            initial={{ strokeDashoffset: 339.292 }}
                                                            animate={{ strokeDashoffset: 339.292 - (339.292 * result.score) / 100 }}
                                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                                            strokeLinecap="round"
                                                            transform="rotate(-90 60 60)"
                                                        />
                                                    </svg>
                                                    <div className={styles.scoreValue}>{result.score}%</div>
                                                </div>
                                                <h3>Match Score</h3>
                                                <p className={styles.scoreLabel}>
                                                    {result.score > 80 ? "Excellent Fit!" : result.score > 60 ? "Good Potential" : "Needs Improvement"}
                                                </p>
                                            </div>

                                            {/* Skills Analysis */}
                                            <div className={styles.detailsCard}>
                                                <h3>Skills Analysis</h3>
                                                <div className={styles.skillGroup}>
                                                    <h4>✅ Matched Skills</h4>
                                                    <div className={styles.tags}>
                                                        {result.matchDetails.skillsMatch.length > 0 ? (
                                                            result.matchDetails.skillsMatch.map(s => (
                                                                <span key={s} className={styles.tagMatch}>{s}</span>
                                                            ))
                                                        ) : <span className={styles.emptyText}>No direct matches found.</span>}
                                                    </div>
                                                </div>
                                                <div className={styles.skillGroup}>
                                                    <h4>⚠️ Missing / To Highlight</h4>
                                                    <div className={styles.tags}>
                                                        {result.matchDetails.missingSkills.length > 0 ? (
                                                            result.matchDetails.missingSkills.map(s => (
                                                                <span key={s} className={styles.tagMiss}>{s}</span>
                                                            ))
                                                        ) : <span className={styles.emptyText}>Great! You have all key skills.</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Rewritten CV */}
                                            <div className={styles.rewriteCard}>
                                                <div className={styles.cardHeader}>
                                                    <h3>ATS Optimized Summary</h3>
                                                    <button
                                                        className={styles.copyBtn}
                                                        onClick={() => navigator.clipboard.writeText(result.rewrittenCV)}
                                                    >
                                                        Copy Text
                                                    </button>
                                                </div>
                                                <pre className={styles.cvPreview}>
                                                    {result.rewrittenCV}
                                                </pre>
                                                <div className={styles.actionRow} style={{ marginTop: '1rem' }}>
                                                    <button className={styles.backBtn} onClick={() => { setStep(1); setJdText(''); setCvFile(null); }}>
                                                        Start New Analysis
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.errorState}>
                                            <p>Something went wrong. Please try again.</p>
                                            <button className={styles.primaryBtn} onClick={() => setStep(1)}>Try Again</button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}

function StepIndicator({ current, step, label, icon: Icon }: { current: number, step: number, label: string, icon: any }) {
    const isActive = current >= step;
    const isCurrent = current === step;

    return (
        <div className={styles.stepItem} data-active={isActive}>
            <div className={styles.stepIcon} data-current={isCurrent}>
                <Icon size={20} />
            </div>
            <span className={styles.stepLabel}>{label}</span>
        </div>
    );
}

// Helper icons
// function Sparkles(props: any) { ... } // Imported from lucide-react
