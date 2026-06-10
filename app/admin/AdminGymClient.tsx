"use client";

import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { createGym, updateGym, toggleGymStatus, deleteGym } from "@/app/actions/gyms";
import styles from "./page.module.css";

type GymData = {
  id: string;
  name: string;
  status: string;
  _count: { users: number };
  users: { id: string; name: string; email: string }[];
};

export default function AdminGymClient({ gyms }: { gyms: GymData[] }) {
  const router = useRouter();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGym, setEditingGym] = useState<{id: string, name: string} | null>(null);
  
  // Form Fields
  const [gymName, setGymName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogout = () => {
    router.push("/");
  };

  const openAddModal = () => {
    setEditingGym(null);
    setGymName("");
    setManagerEmail("");
    setManagerPassword("");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (gym: GymData) => {
    setEditingGym({ id: gym.id, name: gym.name });
    setGymName(gym.name);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGym(null);
    setGymName("");
    setManagerEmail("");
    setManagerPassword("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymName) return;
    
    setIsSubmitting(true);
    setErrorMsg("");
    
    let res;
    if (editingGym) {
      res = await updateGym(editingGym.id, gymName);
    } else {
      if (!managerEmail || !managerPassword) {
        setErrorMsg("Preencha o e-mail e a senha inicial do gestor.");
        setIsSubmitting(false);
        return;
      }
      res = await createGym(gymName, managerEmail, managerPassword);
    }
    
    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      closeModal();
    }
    setIsSubmitting(false);
  };

  const handleSuspend = async (id: string, currentStatus: string) => {
    const actionName = currentStatus === "ACTIVE" ? "suspender" : "reativar";
    if (confirm(`Tem certeza que deseja ${actionName} esta academia?`)) {
      await toggleGymStatus(id, currentStatus);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("ATENÇÃO: Tem certeza que deseja EXCLUIR esta academia e todos os usuários vinculados a ela? Esta ação é irreversível.")) {
      await deleteGym(id);
    }
  };

  const handleResetAdminPassword = async (adminId: string, adminName: string) => {
    if (confirm(`Resetar a senha do gestor ${adminName} para "123456"?`)) {
      const { resetAdminPassword } = await import("@/app/actions/admin");
      const res = await resetAdminPassword(adminId);
      if (res?.error) alert(res.error);
      else alert("Senha do gestor resetada com sucesso!");
    }
  };

  const handleRemoveAdmin = async (adminId: string, adminName: string) => {
    if (confirm(`Tem certeza que deseja remover o gestor ${adminName}? Ele perderá o acesso à academia.`)) {
      const { removeAdmin } = await import("@/app/actions/admin");
      const res = await removeAdmin(adminId);
      if (res?.error) alert(res.error);
      else alert("Gestor removido.");
    }
  };

  const handleChangeAdminEmail = async (adminId: string, currentEmail: string) => {
    const newEmail = prompt("Digite o novo e-mail para o gestor:", currentEmail);
    if (newEmail && newEmail !== currentEmail) {
      const { changeAdminEmail } = await import("@/app/actions/admin");
      const res = await changeAdminEmail(adminId, newEmail);
      if (res?.error) alert(res.error);
      else alert("E-mail atualizado com sucesso.");
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
                <Fragment key={gym.id}>
                  <tr style={{ opacity: gym.status === "SUSPENDED" ? 0.5 : 1 }}>
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
                      <button className={styles.actionBtn} style={{ borderColor: '#ef4444', color: '#ef4444', marginLeft: '8px' }} onClick={() => handleSuspend(gym.id, gym.status)}>
                        {gym.status === "ACTIVE" ? "Suspender" : "Reativar"}
                      </button>
                      <button className={styles.actionBtnDanger} style={{ marginLeft: '8px' }} onClick={() => handleDelete(gym.id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                  {gym.users && gym.users.length > 0 && (
                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <td colSpan={5} style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem' }}><strong>Gestores (Gym Admins):</strong></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {gym.users.map(admin => (
                            <div key={admin.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f0f1a', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155' }}>
                              <div>
                                <span style={{ fontWeight: 'bold', marginRight: '1rem' }}>{admin.name}</span>
                                <span style={{ color: '#94a3b8' }}>{admin.email}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className={styles.actionBtnSecondary} onClick={() => handleResetAdminPassword(admin.id, admin.name)}>Resetar Senha</button>
                                <button className={styles.actionBtnSecondary} onClick={() => handleChangeAdminEmail(admin.id, admin.email)}>Trocar E-mail</button>
                                <button className={styles.actionBtnDanger} onClick={() => handleRemoveAdmin(admin.id, admin.name)}>Excluir Gestor</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#1e1e2f', padding: '2rem', borderRadius: '12px', width: '450px' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#00f2fe' }}>{editingGym ? "Editar Academia" : "Nova Academia"}</h3>
            
            {errorMsg && <div style={{ color: '#ef4444', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem' }}>{errorMsg}</div>}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Nome da Unidade</label>
                <input 
                  type="text" 
                  placeholder="Ex: GymTech Matriz" 
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f0f1a', color: '#fff' }}
                />
              </div>

              {!editingGym && (
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed #334155' }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Dados do Gestor Principal</h4>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>E-mail de Acesso</label>
                    <input 
                      type="email" 
                      placeholder="gestor@academia.com" 
                      value={managerEmail}
                      onChange={(e) => setManagerEmail(e.target.value)}
                      required={!editingGym}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f0f1a', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Senha Temporária</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 123456" 
                      value={managerPassword}
                      onChange={(e) => setManagerPassword(e.target.value)}
                      required={!editingGym}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f0f1a', color: '#fff' }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>O gestor será forçado a alterar esta senha no primeiro login.</p>
                  </div>
                </div>
              )}

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
