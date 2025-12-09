import Hero from "@/components/Hero";
import Analyzer from "@/components/Analyzer";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <Hero />
      <Analyzer />
    </main>
  );
}
