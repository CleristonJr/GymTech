"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../admin/page.module.css"; // Reaproveitando os estilos do admin

const mockedTrainers = [
  { id: 101, name: "Carlos Silva", students: 15, status: "Ativo" },
  { id: 102, name: "Ana Souza", students: 22, status: "Ativo" },
];

export default function GymManagerDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  const handleAddTrainer = () => {
    alert("Funcionalidade: Adicionar Novo Personal (Modal em breve)");
  };

  const handleViewStudents = (id: number) => {
    alert(`Visualizar alunos do Personal ID: ${id}`);
  };

  const handleRemove = (id: number) => {
    if (confirm("Tem certeza que deseja remover este personal?")) {
      alert(`Personal ${id} removido com sucesso.`);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <h2>Painel do Gestor (Gym Admin)</h2>
          <p>Unidade: GymTech Centro</p>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>Sair</button>
      </header>

      <main className={styles.main}>
        <div className={styles.actionsBar}>
          <h3>Personais (Treinadores) da Unidade</h3>
          <button className={styles.addBtn} onClick={handleAddTrainer}>+ Adicionar Personal</button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome do Personal</th>
                <th>Alunos Vinculados</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {mockedTrainers.map(trainer => (
                <tr key={trainer.id}>
                  <td>#{trainer.id}</td>
                  <td>{trainer.name}</td>
                  <td>{trainer.students}</td>
                  <td><span className={styles.badge}>{trainer.status}</span></td>
                  <td>
                    <button className={styles.actionBtn} onClick={() => handleViewStudents(trainer.id)}>Ver Alunos</button>
                    <button className={styles.actionBtnDanger} onClick={() => handleRemove(trainer.id)}>Remover</button>
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
