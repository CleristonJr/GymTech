"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createStaffMember, removeUser } from "@/app/actions/manager";
import styles from "../admin/page.module.css"; // Reaproveitando estilos

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  _count?: { studentPlans?: number };
};

export default function ManagerClient({ gymName, trainers, students }: { gymName: string, trainers: UserData[], students: UserData[] }) {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"TRAINERS" | "STUDENTS">("TRAINERS");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogout = () => {
    // Para simplificar o logout sem biblioteca de sessão:
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "gymId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("userId");
    router.push("/");
  };

  const openAddModal = () => {
    setNewName("");
    setNewEmail("");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    
    setIsSubmitting(true);
    setErrorMsg("");
    
    const roleToCreate = activeTab === "TRAINERS" ? "TRAINERS" : "STUDENTS";
    const res = await createStaffMember(newName, newEmail, activeTab === "TRAINERS" ? "TRAINER" : "STUDENT");
    
    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setIsModalOpen(false);
    }
    setIsSubmitting(false);
  };

  const handleRemove = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover ${name}?`)) {
      const res = await removeUser(id);
      if (res?.error) alert(res.error);
    }
  };

  const currentList = activeTab === "TRAINERS" ? trainers : students;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <h2>Painel do Gestor (Gym Admin)</h2>
          <p>Unidade: {gymName}</p>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>Sair</button>
      </header>

      <main className={styles.main}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            style={{ padding: '0.8rem 1.5rem', background: activeTab === "TRAINERS" ? '#00f2fe' : 'transparent', color: activeTab === "TRAINERS" ? '#0f0f1a' : '#fff', border: '1px solid #00f2fe', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => setActiveTab("TRAINERS")}
          >
            Personais
          </button>
          <button 
            style={{ padding: '0.8rem 1.5rem', background: activeTab === "STUDENTS" ? '#00f2fe' : 'transparent', color: activeTab === "STUDENTS" ? '#0f0f1a' : '#fff', border: '1px solid #00f2fe', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => setActiveTab("STUDENTS")}
          >
            Alunos
          </button>
        </div>

        <div className={styles.actionsBar} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>{activeTab === "TRAINERS" ? "Personais da Unidade" : "Alunos Matriculados"}</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className={styles.actionBtn} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer' }} onClick={() => router.push('/trainer/templates')}>
              Modelos de Ficha da Academia
            </button>
            <button className={styles.addBtn} onClick={openAddModal}>
              + Adicionar {activeTab === "TRAINERS" ? "Personal" : "Aluno"}
            </button>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                {activeTab === "TRAINERS" && <th>Planos Prescritos</th>}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentList.length === 0 ? (
                <tr><td colSpan={4} style={{textAlign: 'center', padding: '2rem'}}>Nenhum registro encontrado.</td></tr>
              ) : currentList.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  {activeTab === "TRAINERS" && <td>{user._count?.studentPlans || 0}</td>}
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {activeTab === "STUDENTS" && (
                        <button className={styles.actionBtnPrimary} onClick={() => router.push(`/trainer/student/${user.id}`)}>
                          Ver Perfil
                        </button>
                      )}
                      <button className={styles.actionBtnSecondary} onClick={async () => {
                        if (confirm(`Resetar a senha de ${user.name} para "123456"?`)) {
                          const { resetUserPassword } = await import("@/app/actions/manager");
                          const res = await resetUserPassword(user.id);
                          if (res?.error) alert(res.error);
                          else alert("Senha resetada com sucesso!");
                        }
                      }}>
                        Resetar Senha
                      </button>
                      <button className={styles.actionBtnDanger} onClick={() => handleRemove(user.id, user.name)}>
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal de Criação */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#1e1e2f', padding: '2rem', borderRadius: '12px', width: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#00f2fe' }}>
              Novo {activeTab === "TRAINERS" ? "Personal" : "Aluno"}
            </h3>
            
            {errorMsg && <div style={{ color: '#ef4444', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem' }}>{errorMsg}</div>}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Nome Completo</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f0f1a', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>E-mail de Acesso</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f0f1a', color: '#fff' }}
                />
              </div>

              <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
                A senha inicial será <strong>123456</strong> e o usuário será forçado a alterar no primeiro acesso.
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid #334155', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
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
