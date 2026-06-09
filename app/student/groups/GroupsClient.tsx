"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { createGroup, joinGroup, leaveGroup } from "@/app/actions/groups";

type UserRank = {
  id: string;
  name: string;
  points: number;
};

type GroupData = {
  id: string;
  name: string;
  inviteCode: string;
  members: UserRank[];
};

export default function GroupsClient({ globalRanking, myGroups, userId, points }: { globalRanking: UserRank[], myGroups: GroupData[], userId: string, points: number }) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [activeRanking, setActiveRanking] = useState<string | null>(null);

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode) return;
    
    const res = await joinGroup(inviteCode);
    if (res.error) alert(res.error);
    else {
      alert("Você entrou no grupo com sucesso!");
      setInviteCode("");
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName) return;
    
    const res = await createGroup(newGroupName);
    if (res.error) alert(res.error);
    else {
      alert(`Grupo criado! Convide amigos com o código: ${res.inviteCode}`);
      setNewGroupName("");
      setIsCreatingGroup(false);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (confirm("Tem certeza que deseja sair deste grupo?")) {
      const res = await leaveGroup(groupId);
      if (res.error) alert(res.error);
      else if (activeRanking === groupId) setActiveRanking(null);
    }
  };

  const activeGroup = myGroups.find(g => g.id === activeRanking);
  const currentRankingData = activeGroup ? activeGroup.members : globalRanking;
  const currentRankingTitle = activeGroup ? `🏆 Ranking: ${activeGroup.name} (Cód: ${activeGroup.inviteCode})` : "🏆 Ranking Geral";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => router.push("/student")}>
            &larr; Voltar
          </button>
          <div className={styles.userInfo}>
            <h2>Desafios e Ligas</h2>
          </div>
        </div>
        <div className={styles.pointsBadge}>
          🏆 {points} pts
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          
          {/* Lado Esquerdo: Meus Grupos e Ações */}
          <section className={styles.leftCol}>
            
            <div className={styles.card}>
              <div className={styles.cardHeaderFlex}>
                <div>
                  <h3>Meus Grupos</h3>
                  <p className={styles.sub}>Participe de ligas com amigos.</p>
                </div>
                {activeRanking !== null && (
                  <button className={styles.viewGlobalBtn} onClick={() => setActiveRanking(null)}>
                    Ver Ranking Geral
                  </button>
                )}
              </div>
              
              <div className={styles.groupsList}>
                {myGroups.length === 0 && <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>Você não está em nenhum grupo.</p>}
                {myGroups.map(group => (
                  <div key={group.id} className={`${styles.groupItem} ${activeRanking === group.id ? styles.activeGroup : ""}`}>
                    <div>
                      <h4>{group.name}</h4>
                      <span>{group.members.length} membros</span>
                    </div>
                    <div className={styles.groupActions}>
                      <button className={styles.viewBtn} onClick={() => setActiveRanking(group.id)}>Ver Ranking</button>
                      <button className={styles.leaveBtn} onClick={() => handleLeaveGroup(group.id)}>Sair</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <h3>Entrar em um Grupo</h3>
              <form className={styles.formRow} onSubmit={handleJoinGroup}>
                <input 
                  type="text" 
                  placeholder="Código do convite (ex: G-A1B2C3)" 
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className={styles.input}
                />
                <button type="submit" className={styles.primaryBtn}>Entrar</button>
              </form>
            </div>

            <div className={styles.card}>
              <h3>Criar Novo Grupo</h3>
              {!isCreatingGroup ? (
                <button className={styles.outlineBtn} onClick={() => setIsCreatingGroup(true)}>
                  + Nova Liga
                </button>
              ) : (
                <form className={styles.formCol} onSubmit={handleCreateGroup}>
                  <input 
                    type="text" 
                    placeholder="Nome do grupo..." 
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className={styles.input}
                  />
                  <div className={styles.actions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => setIsCreatingGroup(false)}>Cancelar</button>
                    <button type="submit" className={styles.primaryBtn}>Criar</button>
                  </div>
                </form>
              )}
            </div>
            
          </section>

          {/* Lado Direito: Ranking Global / Grupo */}
          <section className={styles.rightCol}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>{currentRankingTitle}</h3>
              </div>
              
              <div className={styles.rankingList}>
                {currentRankingData.map((user, index) => (
                  <div key={user.id} className={`${styles.rankingItem} ${user.id === userId ? styles.highlight : ""}`}>
                    <div className={styles.rankPosition}>
                      {index + 1}º
                    </div>
                    <div className={styles.rankInfo}>
                      <h4>{user.id === userId ? "Você" : user.name}</h4>
                    </div>
                    <div className={styles.rankPoints}>
                      {user.points} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
