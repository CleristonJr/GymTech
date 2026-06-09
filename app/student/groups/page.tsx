"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

// Mock Data
const userProfile = { id: "#ALUNO-4412", name: "Você", points: 850 };
const mockGroups = [
  { id: 1, name: "Projeto Verão 2026", memberCount: 5, rank: 2 },
  { id: 2, name: "Amigos da GymTech", memberCount: 12, rank: 5 }
];

const mockGlobalRanking = [
  { name: "Lucas", points: 1250, id: "#ALUNO-1199" },
  { name: "Mariana", points: 940, id: "#ALUNO-8821" },
  { name: "Você", points: 850, id: "#ALUNO-4412" },
  { name: "Pedro", points: 420, id: "#ALUNO-0033" },
];

const mockGroupRankings: Record<number, any[]> = {
  1: [
    { name: "Julia", points: 1100, id: "#ALUNO-9922" },
    { name: "Você", points: 850, id: "#ALUNO-4412" },
    { name: "Marcos", points: 300, id: "#ALUNO-5511" },
  ],
  2: [
    { name: "Carlos", points: 2000, id: "#ALUNO-3344" },
    { name: "Ana", points: 1500, id: "#ALUNO-7766" },
    { name: "João", points: 900, id: "#ALUNO-2211" },
    { name: "Você", points: 850, id: "#ALUNO-4412" },
    { name: "Bia", points: 100, id: "#ALUNO-5599" },
  ]
};

export default function GroupsAndRanking() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [activeRanking, setActiveRanking] = useState<number | null>(null);

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode) return;
    alert(`Entrou no grupo com sucesso usando o código: ${inviteCode}!`);
    setInviteCode("");
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName) return;
    alert(`Grupo "${newGroupName}" criado! Convide seus amigos enviando seu ID.`);
    setNewGroupName("");
    setIsCreatingGroup(false);
  };

  const handleLeaveGroup = (groupId: number) => {
    if (confirm("Tem certeza que deseja sair deste grupo?")) {
      alert("Você saiu do grupo.");
      if (activeRanking === groupId) setActiveRanking(null);
    }
  };

  const currentRankingData = activeRanking === null 
    ? mockGlobalRanking 
    : mockGroupRankings[activeRanking];
    
  const currentRankingTitle = activeRanking === null
    ? "🏆 Ranking Geral"
    : `🏆 Ranking: ${mockGroups.find(g => g.id === activeRanking)?.name}`;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => router.push("/student")}>
            &larr; Voltar
          </button>
          <div className={styles.userInfo}>
            <h2>Desafios e Ligas</h2>
            <p>Seu ID para convites: <strong>{userProfile.id}</strong></p>
          </div>
        </div>
        <div className={styles.pointsBadge}>
          🏆 {userProfile.points} pts
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
                  <p className={styles.sub}>Participe de ligas com amigos, mesmo de outras academias!</p>
                </div>
                {activeRanking !== null && (
                  <button className={styles.viewGlobalBtn} onClick={() => setActiveRanking(null)}>
                    Ver Ranking Geral
                  </button>
                )}
              </div>
              
              <div className={styles.groupsList}>
                {mockGroups.map(group => (
                  <div key={group.id} className={`${styles.groupItem} ${activeRanking === group.id ? styles.activeGroup : ""}`}>
                    <div>
                      <h4>{group.name}</h4>
                      <span>{group.memberCount} membros • Você está no top {group.rank}</span>
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
                  placeholder="ID do convite ou do criador" 
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
                  <div key={user.id} className={`${styles.rankingItem} ${user.name === "Você" ? styles.highlight : ""}`}>
                    <div className={styles.rankPosition}>
                      {index + 1}º
                    </div>
                    <div className={styles.rankInfo}>
                      <h4>{user.name}</h4>
                      <span>{user.id}</span>
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
