"use client";

import { useState, useEffect } from "react";
import { X, Key, Save, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./SettingsModal.module.css";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [provider, setProvider] = useState("openai");

    const [openaiKey, setOpenaiKey] = useState("");
    const [openaiModel, setOpenaiModel] = useState("gpt-3.5-turbo");

    const [googleKey, setGoogleKey] = useState("");
    const [googleModel, setGoogleModel] = useState("gemini-1.5-flash");

    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setOpenaiKey(localStorage.getItem("openai_api_key") || "");
        setOpenaiModel(localStorage.getItem("openai_model") || "gpt-3.5-turbo");

        setGoogleKey(localStorage.getItem("google_api_key") || "");
        setGoogleModel(localStorage.getItem("google_model") || "gemini-1.5-flash");

        setProvider(localStorage.getItem("ai_provider") || "openai");
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem("ai_provider", provider);

        localStorage.setItem("openai_api_key", openaiKey.trim());
        localStorage.setItem("openai_model", openaiModel);

        localStorage.setItem("google_api_key", googleKey.trim());
        localStorage.setItem("google_model", googleModel);

        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            onClose();
        }, 1000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className={styles.modal}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    >
                        <div className={styles.header}>
                            <h3><Key size={20} /> AI Configuration</h3>
                            <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
                        </div>

                        <div className={styles.body}>
                            {/* Provider Selector */}
                            <div className={styles.inputGroup} style={{ marginBottom: '1.5rem' }}>
                                <label>AI Provider</label>
                                <div className={styles.inputWrapper}>
                                    <select
                                        value={provider}
                                        onChange={(e) => setProvider(e.target.value)}
                                        className={styles.input}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <option value="openai">OpenAI (GPT Models)</option>
                                        <option value="google">Google (Gemini Models)</option>
                                    </select>
                                </div>
                            </div>

                            {provider === "openai" ? (
                                <>
                                    <div className={styles.inputGroup} style={{ marginBottom: '1.5rem' }}>
                                        <label>OpenAI API Key</label>
                                        <div className={styles.inputWrapper}>
                                            <input
                                                type="password"
                                                placeholder="sk-..."
                                                value={openaiKey}
                                                onChange={(e) => setOpenaiKey(e.target.value)}
                                                className={styles.input}
                                            />
                                        </div>
                                        <p className={styles.helperText}>
                                            <AlertCircle size={12} />
                                            Your key is stored locally in your browser.
                                        </p>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label>Model Selection</label>
                                        <div className={styles.inputWrapper}>
                                            <select
                                                value={openaiModel}
                                                onChange={(e) => setOpenaiModel(e.target.value)}
                                                className={styles.input}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast & Cheap)</option>
                                                <option value="gpt-4-turbo">GPT-4 Turbo (Smart & Balanced)</option>
                                                <option value="gpt-4o">GPT-4o (Most Advanced)</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={styles.inputGroup} style={{ marginBottom: '1.5rem' }}>
                                        <label>Google API Key</label>
                                        <div className={styles.inputWrapper}>
                                            <input
                                                type="password"
                                                placeholder="AIza..."
                                                value={googleKey}
                                                onChange={(e) => setGoogleKey(e.target.value)}
                                                className={styles.input}
                                            />
                                        </div>
                                        <p className={styles.helperText}>
                                            <AlertCircle size={12} />
                                            Get your key from Google AI Studio.
                                        </p>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label>Model Selection</label>
                                        <div className={styles.inputWrapper}>
                                            <select
                                                value={googleModel}
                                                onChange={(e) => setGoogleModel(e.target.value)}
                                                className={styles.input}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fastest)</option>
                                                <option value="gemini-pro">Gemini Pro (Legacy)</option>
                                                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Best Reasoning)</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={styles.footer}>
                            <button
                                className={styles.saveBtn}
                                onClick={handleSave}
                                disabled={(provider === "openai" ? !openaiKey : !googleKey) || isSaved}
                            >
                                {isSaved ? "Saved!" : <><Save size={16} /> Save Configuration</>}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
