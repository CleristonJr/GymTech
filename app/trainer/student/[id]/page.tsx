"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

// Mock data
const mockStudent = {
  id: 201,
  name: "Lucas Fernandes",
  email: "lucas@email.com",
  plan: "Hipertrofia",
  objective: "Ganho de massa muscular",
  age: 26,
  weight: 78.5,
  height: 1.80,
  evolution: [
    { id: 1, date: "2026-05-10", note: "Iniciou o plano. Peso: 77kg. Relatou dificuldade em exercícios de perna." },
    { id: 2, date: "2026-05-25", note: "Adaptação concluída. Aumentamos a carga no supino. Peso: 78kg." },
  ]
};

export default function StudentDetails() {
  const [isEditing, setIsEditing] = useState(false);
  const [newEvolution, setNewEvolution] = useState("");

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    alert("Informações do aluno atualizadas com sucesso!");
  };

  const handleAddEvolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvolution.trim()) return;
    
    alert(`Evolução registrada:\n"${newEvolution}"\n(Isso aparecerá na linha do tempo do aluno)`);
    setNewEvolution("");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/trainer" className={styles.backBtn}>&larr; Voltar</Link>
          <div className={styles.userInfo}>
            <h2>{mockStudent.name}</h2>
            <p>ID: #{mockStudent.id}</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          
          {/* Coluna 1: Informações e Edição */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Informações do Aluno</h3>
              <button 
                className={styles.editBtn} 
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancelar" : "Editar"}
              </button>
            </div>

            {isEditing ? (
              <form className={styles.form} onSubmit={handleSaveInfo}>
                <div className={styles.inputGroup}>
                  <label>Nome Completo</label>
                  <input type="text" defaultValue={mockStudent.name} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Objetivo</label>
                  <input type="text" defaultValue={mockStudent.objective} />
                </div>
                <div className={styles.row}>
                  <div className={styles.inputGroup}>
                    <label>Idade</label>
                    <input type="number" defaultValue={mockStudent.age} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Peso (kg)</label>
                    <input type="number" step="0.1" defaultValue={mockStudent.weight} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Altura (m)</label>
                    <input type="number" step="0.01" defaultValue={mockStudent.height} />
                  </div>
                </div>
                <button type="submit" className={styles.saveBtn}>Salvar Alterações</button>
              </form>
            ) : (
              <div className={styles.infoList}>
                <p><strong>E-mail:</strong> {mockStudent.email}</p>
                <p><strong>Objetivo:</strong> {mockStudent.objective}</p>
                <p><strong>Ficha Atual:</strong> <span className={styles.badge}>{mockStudent.plan}</span></p>
                <div className={styles.statsRow}>
                  <div><span>Idade</span> <strong>{mockStudent.age}</strong></div>
                  <div><span>Peso</span> <strong>{mockStudent.weight}kg</strong></div>
                  <div><span>Altura</span> <strong>{mockStudent.height}m</strong></div>
                </div>
              </div>
            )}
          </section>

          {/* Coluna 2: Evolução / Progressão */}
          <section className={styles.card}>
            <h3>Acompanhamento e Evolução</h3>
            
            <form className={styles.evolutionForm} onSubmit={handleAddEvolution}>
              <textarea 
                placeholder="Registre medidas corporais, feedback do treino, aumento de cargas..."
                value={newEvolution}
                onChange={(e) => setNewEvolution(e.target.value)}
                rows={3}
              />
              <button type="submit" className={styles.addBtn}>+ Registrar Evolução</button>
            </form>

            <div className={styles.timeline}>
              {mockStudent.evolution.map(evo => (
                <div key={evo.id} className={styles.timelineItem}>
                  <div className={styles.timelineDate}>{new Date(evo.date).toLocaleDateString('pt-BR')}</div>
                  <div className={styles.timelineContent}>
                    <p>{evo.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
