"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

// Mock data
const mockedGyms = [
  { id: 1, name: "GymTech Centro", students: 450, trainers: 12, status: "Ativa" },
  { id: 2, name: "GymTech Sul", students: 320, trainers: 8, status: "Ativa" },
];

export default function SuperAdminDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  const handleAddGym = () => {
    alert("Funcionalidade: Adicionar Nova Academia (Modal em breve)");
  };

  const handleEdit = (id: number) => {
    alert(`Editar academia ID: ${id}`);
  };

  const handleSuspend = (id: number) => {
    if (confirm("Tem certeza que deseja suspender esta academia?")) {
      alert(`Academia ${id} suspensa com sucesso.`);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <h2>Painel Geral (Super Admin)</h2>
          <p>Gerenciamento de Redes e Academias</p>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>Sair</button>
      </header>

      <main className={styles.main}>
        <div className={styles.actionsBar}>
          <h3>Academias Cadastradas</h3>
          <button className={styles.addBtn} onClick={handleAddGym}>+ Nova Academia</button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome da Unidade</th>
                <th>Alunos</th>
                <th>Personais</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {mockedGyms.map(gym => (
                <tr key={gym.id}>
                  <td>#{gym.id}</td>
                  <td>{gym.name}</td>
                  <td>{gym.students}</td>
                  <td>{gym.trainers}</td>
                  <td><span className={styles.badge}>{gym.status}</span></td>
                  <td>
                    <button className={styles.actionBtn} onClick={() => handleEdit(gym.id)}>Editar</button>
                    <button className={styles.actionBtnDanger} onClick={() => handleSuspend(gym.id)}>Suspender</button>
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
