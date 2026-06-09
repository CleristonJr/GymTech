"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from "./page.module.css";

// Mock data for Evolution
const evolutionData = [
  { date: 'Jan', peso: 82.5, bf: 22.0 },
  { date: 'Fev', peso: 81.0, bf: 20.5 },
  { date: 'Mar', peso: 79.8, bf: 19.0 },
  { date: 'Abr', peso: 78.5, bf: 17.5 },
  { date: 'Mai', peso: 78.0, bf: 16.8 },
];

export default function StudentDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  const handleStartWorkout = () => {
    router.push("/student/workout");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <h2>Olá, Aluno(a)!</h2>
          <p>GymTech - Unidade Centro</p>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>Sair</button>
      </header>

      <main className={styles.main}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>850</h3>
            <p>Seus Pontos</p>
            <button className={styles.pointsLink} onClick={() => router.push("/student/groups")}>
              Ver Ranking & Grupos
            </button>
          </div>
          <div className={styles.statCard}>
            <h3>12 <span style={{fontSize: '1.2rem'}}>🔥</span></h3>
            <p>Dias Consecutivos</p>
            <div className={styles.crystalsBadge} style={{
              background: 'rgba(0, 242, 254, 0.1)',
              color: '#00f2fe',
              padding: '0.4rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginTop: '0.5rem',
              fontWeight: 600,
              display: 'inline-block'
            }}>
              💎 3 Escudos Disponíveis
            </div>
          </div>
        </div>

        {/* Treino do Dia em Destaque */}
        <section className={styles.todayWorkout}>
          <div className={styles.workoutInfo}>
            <span className={styles.workoutBadge}>Treino do Dia</span>
            <h2>Treino A - Peito e Tríceps</h2>
            <p>Sequência recomendada pelo seu personal. 6 Exercícios • ~45 min</p>
          </div>
          <button className={styles.startHeroBtn} onClick={handleStartWorkout}>
            ▶ Iniciar Treino Agora
          </button>
        </section>

        {/* Gráficos de Evolução */}
        <section className={styles.evolutionSection}>
          <h3 className={styles.sectionTitle}>Sua Evolução Física</h3>
          
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h4>Peso Corporal (kg)</h4>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#00f2fe' }}
                    />
                    <Line type="monotone" dataKey="peso" stroke="#00f2fe" strokeWidth={3} dot={{ r: 4, fill: '#00f2fe' }} activeDot={{ r: 6 }} name="Peso" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.chartCard}>
              <h4>Bioimpedância (% Gordura)</h4>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={['dataMin - 1', 'dataMax + 2']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Line type="monotone" dataKey="bf" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} name="% Gordura" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
