"use client";

import { useRouter } from "next/navigation";
import styles from "../admin/page.module.css";

type StudentData = {
  id: string;
  name: string;
  lastPlanName: string | null;
  lastSessionDate: Date | null;
};

export default function TrainerClient({ students }: { students: StudentData[] }) {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "gymId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("userId");
    router.push("/");
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Nunca treinou";
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <h2>Painel do Personal Trainer</h2>
          <p>Visão Geral de Alunos</p>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>Sair</button>
      </header>

      <main className={styles.main}>
        <div className={styles.actionsBar}>
          <h3>Alunos da Academia</h3>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome do Aluno</th>
                <th>Ficha Atual</th>
                <th>Último Treino</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={4} style={{textAlign: 'center', padding: '2rem'}}>Nenhum aluno cadastrado nesta academia.</td></tr>
              ) : students.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>
                    {student.lastPlanName ? (
                      <span className={styles.badge}>{student.lastPlanName}</span>
                    ) : (
                      <span className={styles.badge} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Sem Ficha</span>
                    )}
                  </td>
                  <td>{formatDate(student.lastSessionDate)}</td>
                  <td>
                    <button className={styles.actionBtn} onClick={() => router.push(`/trainer/student/${student.id}`)}>
                      Ver Aluno / Montar Treino
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
