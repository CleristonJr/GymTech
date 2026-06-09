"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../admin/page.module.css"; // Reaproveitando estilos do admin

const mockedStudents = [
  { id: 201, name: "Lucas Fernandes", plan: "Hipertrofia", lastSeen: "Hoje, 08:30" },
  { id: 202, name: "Mariana Costa", plan: "Emagrecimento", lastSeen: "Ontem, 19:00" },
  { id: 203, name: "Pedro Gomes", plan: "Iniciante", lastSeen: "Há 3 dias" },
];

export default function TrainerDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  const handleAddStudent = () => {
    alert("Adicionar Novo Aluno (Modal em breve)");
  };

  const handleCreatePlan = (id: number) => {
    alert(`Montar ficha de treino para o aluno ID: ${id}`);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <h2>Painel do Personal Trainer</h2>
          <p>Unidade: GymTech Centro</p>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>Sair</button>
      </header>

      <main className={styles.main}>
        <div className={styles.actionsBar}>
          <h3>Seus Alunos</h3>
          <button className={styles.addBtn} onClick={handleAddStudent}>+ Adicionar Aluno</button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome do Aluno</th>
                <th>Ficha Atual</th>
                <th>Último Treino</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {mockedStudents.map(student => (
                <tr key={student.id}>
                  <td>#{student.id}</td>
                  <td>{student.name}</td>
                  <td><span className={styles.badge}>{student.plan}</span></td>
                  <td>{student.lastSeen}</td>
                  <td>
                    <button className={styles.actionBtn} onClick={() => router.push(`/trainer/student/${student.id}`)}>
                      Ver Aluno
                    </button>
                    <button className={styles.actionBtnDanger} onClick={() => handleCreatePlan(student.id)}>
                      Montar Treino
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
