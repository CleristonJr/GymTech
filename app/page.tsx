"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function LandingPage() {
  const router = useRouter();

  const handleCTA = () => {
    alert("Solicitação enviada! Em breve nossa equipe entrará em contato.");
    router.push("/login");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>GymTech</div>
        <nav className={styles.nav}>
          <Link href="/login" className={styles.loginBtn}>
            Entrar
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>
            A Evolução no Gerenciamento da sua Academia
          </h1>
          <p className={styles.subtitle}>
            Ofereça aos seus alunos a melhor experiência de treino. 
            Controle de personais, criação de fichas dinâmicas com GIFs 
            e acompanhamento em tempo real.
          </p>
          <div className={styles.actions}>
            <button className={styles.ctaBtn} onClick={handleCTA}>Solicitar Orçamento</button>
            <button className={styles.secondaryBtn} onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}>Conhecer Mais</button>
          </div>
        </section>

        <section className={styles.features}>
          <div className={styles.featureCard}>
            <h3>Para Gestores</h3>
            <p>Tenha controle total sobre as unidades, professores e fluxo de alunos em um dashboard intuitivo.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Para Personais</h3>
            <p>Crie planos de treino de forma ágil, acompanhe o progresso e gerencie os alunos com facilidade.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Para Alunos</h3>
            <p>Treinos na palma da mão, com GIFs interativos, timer de descanso e acompanhamento de evolução.</p>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2026 GymTech. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
