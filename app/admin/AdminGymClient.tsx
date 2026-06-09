"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGym, updateGym, toggleGymStatus } from "@/app/actions/gyms";
import styles from "./page.module.css";

type GymData = {
  id: string;
  name: string;
  status: string;
  _count: { users: number };
};

export default function AdminGymClient({ gyms }: { gyms: GymData[] }) {
  const router = useRouter();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGym, setEditingGym] = useState<{id: string, name: string} | null>(null);
  const [gymName, setGymName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => {
    router.push("/");
  };

  const openAddModal = () => {
    setEditingGym(null);
    setGymName("");
    setIsModalOpen(true);
  };

  const openEditModal = (gym: GymData) => {
    setEditingGym({ id: gym.id, name: gym.name });
    setGymName(gym.name);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGym(null);
    setGymName("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymName) return;
    
    setIsSubmitting(true);
    
    if (editingGym) {
      await updateGym(editingGym.id, gymName);
    } else {
      await createGym(gymName);
    }
    
    setIsSubmitting(false);
    closeModal();
  };

  const handleSuspend = async (id: string, currentStatus: string) => {
    const actionName = currentStatus === "ACTIVE" ? "suspender" : "reativar";
    if (confirm(`Tem certeza que deseja ${actionName} esta academia?`)) {
      await toggleGymStatus(id, currentStatus);
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
          <button className={styles.addBtn} onClick={openAddModal}>+ Nova Academia</button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome da Unidade</th>
                <th>Usuários Totais</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {gyms.length === 0 ? (
                <tr><td colSpan={5} style={{textAlign: 'center', padding: '2rem'}}>Nenhuma academia cadastrada.</td></tr>
              ) : gyms.map(gym => (
                <tr key={gym.id} style={{ opacity: gym.status === "SUSPENDED" ? 0.5 : 1 }}>
                  <td>#{gym.id.slice(0,5).toUpperCase()}</td>
                  <td>{gym.name}</td>
                  <td>{gym._count.users}</td>
                  <td>
                    <span className={styles.badge} style={{ background: gym.status === "ACTIVE" ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: gym.status === "ACTIVE" ? '#10b981' : '#ef4444' }}>
                      {gym.status === "ACTIVE" ? "Ativa" : "Suspensa"}
                    </span>
                  </td>
                  <td>
                    <button className={styles.actionBtn} onClick={() => openEditModal(gym)}>Editar</button>
                    <button className={styles.actionBtnDanger} onClick={() => handleSuspend(gym.id, gym.status)}>
                      {gym.status === "ACTIVE" ? "Suspender" : "Reativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#1e1e2f', padding: '2rem', borderRadius: '12px', width: '400px' }}>
            <h3 style={{ marginBottom: '1rem' }}>{editingGym ? "Editar Academia" : "Nova Academia"}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="Nome da Academia" 
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f0f1a', color: '#fff' }}
              />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid #334155', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '0.8rem', background: '#00f2fe', border: 'none', color: '#0f0f1a', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
