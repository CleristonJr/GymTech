"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../../admin/page.module.css";
import { createWorkoutTemplate, updateWorkoutPlan, deleteWorkoutTemplate, createExercise } from "@/app/actions/trainer";

type ExerciseData = { id: string; name: string };
type RoutineDraft = {
  name: string;
  exercises: { exerciseId: string; sets: number; reps: number | null; duration: string | null; restTimeSecs: number; observation: string | null }[];
};

export default function TemplatesClient({ initialTemplates, exercises: initialExercises, userRole }: { initialTemplates: any[], exercises: ExerciseData[], userRole: string }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [exercises, setExercises] = useState(initialExercises);
  const [newExerciseName, setNewExerciseName] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  
  const [planName, setPlanName] = useState("");
  const [planRoutines, setPlanRoutines] = useState<RoutineDraft[]>([{ name: "Treino A", exercises: [] }]);
  const [activeRoutineTab, setActiveRoutineTab] = useState(0);

  const openNewTemplate = () => {
    setEditingPlanId(null);
    setPlanName("");
    setPlanRoutines([{ name: "Treino A", exercises: [] }]);
    setActiveRoutineTab(0);
    setIsModalOpen(true);
  };

  const openEditTemplate = (tmpl: any) => {
    setEditingPlanId(tmpl.id);
    setPlanName(tmpl.name);
    setPlanRoutines(tmpl.routines.map((r: any) => ({
      name: r.name,
      exercises: r.exercises.map((e: any) => ({
        exerciseId: e.exerciseId,
        sets: e.sets,
        reps: e.reps
      }))
    })));
    setActiveRoutineTab(0);
    setIsModalOpen(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este modelo? Ele não afetará alunos que já o importaram.")) return;
    const res = await deleteWorkoutTemplate(id);
    if (res?.error) alert(res.error);
    else {
      setTemplates(templates.filter((t: any) => t.id !== id));
      alert("Modelo excluído com sucesso.");
    }
  };

  const addRoutine = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nextLetter = letters[planRoutines.length % letters.length];
    setPlanRoutines([...planRoutines, { name: `Treino ${nextLetter}`, exercises: [] }]);
    setActiveRoutineTab(planRoutines.length);
  };

  const removeRoutine = (index: number) => {
    if (planRoutines.length <= 1) return alert("A ficha precisa ter pelo menos um treino.");
    const updated = planRoutines.filter((_, i) => i !== index);
    setPlanRoutines(updated);
    setActiveRoutineTab(Math.max(0, index - 1));
  };

  const addExerciseToRoutine = (rIndex: number) => {
    const updated = [...planRoutines];
    updated[rIndex].exercises.push({ exerciseId: "", sets: 3, reps: 10, duration: "", restTimeSecs: 60, observation: "" });
    setPlanRoutines(updated);
  };

  const updateRoutineExercise = (rIndex: number, eIndex: number, field: string, value: string | number | null) => {
    const updated = [...planRoutines];
    (updated[rIndex].exercises[eIndex] as any)[field] = value;
    setPlanRoutines(updated);
  };

  const removeRoutineExercise = (rIndex: number, eIndex: number) => {
    const updated = [...planRoutines];
    updated[rIndex].exercises = updated[rIndex].exercises.filter((_, i) => i !== eIndex);
    setPlanRoutines(updated);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName) return alert("Dê um nome ao modelo.");
    
    for (let i = 0; i < planRoutines.length; i++) {
      if (planRoutines[i].exercises.length === 0) {
        return alert(`O "${planRoutines[i].name}" não possui exercícios. Adicione pelo menos um.`);
      }
      for (let j = 0; j < planRoutines[i].exercises.length; j++) {
        if (!planRoutines[i].exercises[j].exerciseId) {
          return alert(`Por favor, selecione qual é o exercício ${j + 1} do ${planRoutines[i].name}.`);
        }
      }
    }

    setIsSubmitting(true);
    let res;
    if (editingPlanId) {
      res = await updateWorkoutPlan(editingPlanId, planName, planRoutines);
    } else {
      res = await createWorkoutTemplate(planName, planRoutines);
    }

    if (res?.error) alert(res.error);
    else {
      alert(`Modelo ${editingPlanId ? "atualizado" : "criado"} com sucesso! Recarregue a página para ver a lista atualizada.`);
      setIsModalOpen(false);
      // Simplesmente recarregar para pegar a lista do server
      window.location.reload();
    }
    setIsSubmitting(false);
  };

  const handleCreateNewExercise = async () => {
    if (!newExerciseName) return;
    const res = await createExercise(newExerciseName);
    if (res.success && res.exercise) {
      setExercises([...exercises, res.exercise]);
      setNewExerciseName("");
      alert("Exercício cadastrado com sucesso!");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href={userRole === "GYM_ADMIN" ? "/manager" : "/trainer"} style={{ color: '#00f2fe', textDecoration: 'none', fontWeight: 'bold' }}>&larr; Voltar</Link>
          <div className={styles.userInfo}>
            <h2>Meus Modelos de Ficha</h2>
            <p>Crie fichas genéricas para reutilizar nos seus alunos</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.actionsBar} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Modelos Cadastrados</h3>
          <button 
            className={styles.actionBtn} 
            style={{ background: '#10b981', border: 'none', color: '#fff' }}
            onClick={openNewTemplate}
          >
            + Criar Novo Modelo
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome do Modelo</th>
                <th>Rotinas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr><td colSpan={3} style={{textAlign: 'center', padding: '2rem'}}>Nenhum modelo cadastrado ainda.</td></tr>
              ) : templates.map(tmpl => (
                <tr key={tmpl.id}>
                  <td><strong>{tmpl.name}</strong></td>
                  <td>{tmpl.routines.map((r: any) => r.name).join(", ")}</td>
                  <td>
                    <button className={styles.actionBtn} style={{ marginRight: '0.5rem' }} onClick={() => openEditTemplate(tmpl)}>Editar</button>
                    <button className={styles.actionBtn} style={{ background: '#ef4444', color: '#fff', border: 'none' }} onClick={() => handleDeleteTemplate(tmpl.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal de Ficha */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, overflowY: 'auto', padding: '2rem' }}>
          <div style={{ background: '#1e1e2f', padding: '2rem', borderRadius: '12px', width: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#00f2fe' }}>
              {editingPlanId ? "Editar Modelo" : "Novo Modelo"}
            </h3>
            
            <form onSubmit={handleSavePlan}>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nome do Modelo (Ex: Hipertrofia A/B/C)</label>
                <input 
                  type="text" 
                  value={planName}
                  onChange={e => setPlanName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f0f1a', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', borderBottom: '1px solid #334155', marginBottom: '1rem', overflowX: 'auto' }}>
                {planRoutines.map((routine, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveRoutineTab(idx)}
                    style={{ 
                      padding: '0.8rem 1.5rem', 
                      cursor: 'pointer',
                      borderBottom: activeRoutineTab === idx ? '2px solid #00f2fe' : 'none',
                      color: activeRoutineTab === idx ? '#00f2fe' : '#94a3b8',
                      fontWeight: activeRoutineTab === idx ? 'bold' : 'normal',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {routine.name}
                    {planRoutines.length > 1 && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeRoutine(idx); }} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}>&times;</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addRoutine} style={{ padding: '0.8rem 1.5rem', background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: 'bold' }}>
                  + Adicionar Treino
                </button>
              </div>
              
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', minHeight: '200px' }}>
                <h4 style={{ marginBottom: '1rem', color: '#cbd5e1' }}>Exercícios do {planRoutines[activeRoutineTab].name}</h4>
                
                {planRoutines[activeRoutineTab].exercises.length === 0 && (
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>Nenhum exercício adicionado a este treino ainda.</p>
                )}

                {planRoutines[activeRoutineTab].exercises.map((ex, eIndex) => (
                  <div key={eIndex} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold' }}>{eIndex + 1}.</span>
                      <select 
                        value={ex.exerciseId} 
                        onChange={e => updateRoutineExercise(activeRoutineTab, eIndex, "exerciseId", e.target.value)}
                        style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', background: '#0f0f1a', color: '#fff', border: '1px solid #334155' }}
                        required
                      >
                        <option value="" disabled>Selecione o exercício...</option>
                        {exercises.map(libEx => <option key={libEx.id} value={libEx.id}>{libEx.name}</option>)}
                      </select>
                      <button type="button" onClick={() => removeRoutineExercise(activeRoutineTab, eIndex)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem' }}>&times;</button>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 80px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Séries</label>
                        <input 
                          type="number" 
                          placeholder="Ex: 3" 
                          value={ex.sets || ""} 
                          onChange={e => updateRoutineExercise(activeRoutineTab, eIndex, "sets", parseInt(e.target.value) || 0)}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#0f0f1a', color: '#fff', border: '1px solid #334155' }}
                        />
                      </div>
                      <div style={{ flex: '1 1 80px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Repetições</label>
                        <input 
                          type="number" 
                          placeholder="Ex: 12" 
                          value={ex.reps || ""} 
                          onChange={e => updateRoutineExercise(activeRoutineTab, eIndex, "reps", e.target.value ? parseInt(e.target.value) : null)}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#0f0f1a', color: '#fff', border: '1px solid #334155' }}
                        />
                      </div>
                      <div style={{ flex: '1 1 120px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Tempo (Cardio/Isometria)</label>
                        <input 
                          type="text" 
                          placeholder="Ex: 15 min" 
                          value={ex.duration || ""} 
                          onChange={e => updateRoutineExercise(activeRoutineTab, eIndex, "duration", e.target.value)}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#0f0f1a', color: '#fff', border: '1px solid #334155' }}
                        />
                      </div>
                      <div style={{ flex: '1 1 120px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Descanso (segundos)</label>
                        <input 
                          type="number" 
                          placeholder="Ex: 60" 
                          value={ex.restTimeSecs || ""} 
                          onChange={e => updateRoutineExercise(activeRoutineTab, eIndex, "restTimeSecs", parseInt(e.target.value) || 0)}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#0f0f1a', color: '#fff', border: '1px solid #334155' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Observações (opcional)</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Cadência 4020, Focar no pico de contração..." 
                        value={ex.observation || ""} 
                        onChange={e => updateRoutineExercise(activeRoutineTab, eIndex, "observation", e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#0f0f1a', color: '#fff', border: '1px solid #334155' }}
                      />
                    </div>
                  </div>
                ))}

                <button type="button" onClick={() => addExerciseToRoutine(activeRoutineTab)} style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  + Adicionar Exercício
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="Cadastrar novo exercício no BD..." 
                    value={newExerciseName}
                    onChange={e => setNewExerciseName(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '6px', background: '#0f0f1a', color: '#fff', border: '1px solid #334155', fontSize: '0.8rem' }}
                  />
                  <button type="button" onClick={handleCreateNewExercise} style={{ padding: '0.5rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    Salvar
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid #334155', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '0.8rem', background: '#00f2fe', border: 'none', color: '#0f0f1a', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? "Salvando..." : "Finalizar Modelo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
