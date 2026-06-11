"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { addMeasurement, createWorkoutPlan, createExercise } from "@/app/actions/trainer";

type MeasurementData = {
  id: string;
  date: Date;
  weight: number;
  bodyFat: number | null;
  note: string | null;
};

type ExerciseData = {
  id: string;
  name: string;
};

type StudentProfile = {
  id: string;
  name: string;
  email: string;
  shortId: string | null;
  measurements: MeasurementData[];
  currentPlan: string | null;
};

type RoutineDraft = {
  name: string;
  exercises: { exerciseId: string; sets: number; reps: number }[];
};

export default function StudentDetailClient({ student, exercises: initialExercises }: { student: StudentProfile, exercises: ExerciseData[] }) {
  const [exercises, setExercises] = useState(initialExercises);
  const [newNote, setNewNote] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [newBodyFat, setNewBodyFat] = useState("");
  const [isSubmittingEvo, setIsSubmittingEvo] = useState(false);

  // Modal de Ficha
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planRoutines, setPlanRoutines] = useState<RoutineDraft[]>([
    { name: "Treino A", exercises: [] }
  ]);
  const [activeRoutineTab, setActiveRoutineTab] = useState(0);
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);

  // Cadastro rápido de exercício
  const [newExerciseName, setNewExerciseName] = useState("");

  const handleAddEvolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return alert("O peso é obrigatório.");
    setIsSubmittingEvo(true);

    const res = await addMeasurement(student.id, parseFloat(newWeight), newBodyFat ? parseFloat(newBodyFat) : null, newNote);
    
    if (res?.error) alert(res.error);
    else {
      setNewNote("");
      setNewWeight("");
      setNewBodyFat("");
    }
    setIsSubmittingEvo(false);
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
    updated[rIndex].exercises.push({ exerciseId: "", sets: 3, reps: 10 });
    setPlanRoutines(updated);
  };

  const updateRoutineExercise = (rIndex: number, eIndex: number, field: string, value: string | number) => {
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
    if (!planName) return alert("Dê um nome à ficha.");
    
    // Validate if all routines have exercises and valid IDs
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

    setIsSubmittingPlan(true);
    const res = await createWorkoutPlan(student.id, planName, planRoutines);
    if (res?.error) alert(res.error);
    else {
      alert("Ficha criada com sucesso!");
      setIsPlanModalOpen(false);
      setPlanName("");
      setPlanRoutines([{ name: "Treino A", exercises: [] }]);
      setActiveRoutineTab(0);
    }
    setIsSubmittingPlan(false);
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
        <div className={styles.headerLeft}>
          <Link href="/trainer" className={styles.backBtn}>&larr; Voltar</Link>
          <div className={styles.userInfo}>
            <h2>{student.name}</h2>
            <p>E-mail: {student.email} | ID: <strong>{student.shortId || "Sem ID"}</strong></p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Ficha Atual</h3>
              <span className={styles.badge} style={{ fontSize: '1rem', padding: '0.4rem 1rem' }}>
                {student.currentPlan || "Nenhuma ficha ativa"}
              </span>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button 
                onClick={() => setIsPlanModalOpen(true)}
                style={{ width: '100%', padding: '1rem', background: '#00f2fe', color: '#0f0f1a', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                + Montar Nova Ficha de Treino
              </button>
            </div>
            
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <h4>Últimas Medidas</h4>
              {student.measurements.length > 0 ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <div><span>Peso Atual:</span> <strong style={{ color: '#00f2fe', fontSize: '1.2rem', marginLeft: '0.5rem' }}>{student.measurements[0].weight}kg</strong></div>
                  {student.measurements[0].bodyFat && <div><span>BF:</span> <strong style={{ color: '#00f2fe', fontSize: '1.2rem', marginLeft: '0.5rem' }}>{student.measurements[0].bodyFat}%</strong></div>}
                </div>
              ) : (
                <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Nenhuma avaliação registrada.</p>
              )}
            </div>
          </section>

          <section className={styles.card}>
            <h3>Acompanhamento e Avaliação</h3>
            
            <form className={styles.evolutionForm} onSubmit={handleAddEvolution}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Peso (kg)</label>
                  <input type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #334155', background: '#0f0f1a', color: '#fff' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Gordura Corporal (%)</label>
                  <input type="number" step="0.1" value={newBodyFat} onChange={e => setNewBodyFat(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #334155', background: '#0f0f1a', color: '#fff' }} />
                </div>
              </div>

              <textarea 
                placeholder="Anotações sobre a evolução, feedback do treino..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
              <button type="submit" className={styles.addBtn} disabled={isSubmittingEvo}>
                {isSubmittingEvo ? "Registrando..." : "+ Registrar Avaliação"}
              </button>
            </form>

            <div className={styles.timeline}>
              {student.measurements.map(evo => (
                <div key={evo.id} className={styles.timelineItem}>
                  <div className={styles.timelineDate}>{new Date(evo.date).toLocaleDateString('pt-BR')}</div>
                  <div className={styles.timelineContent}>
                    <p><strong>Peso:</strong> {evo.weight}kg {evo.bodyFat && `| BF: ${evo.bodyFat}%`}</p>
                    {evo.note && <p style={{ marginTop: '0.5rem', color: '#cbd5e1' }}>{evo.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      {/* Modal de Ficha de Treino */}
      {isPlanModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, overflowY: 'auto', padding: '2rem' }}>
          <div style={{ background: '#1e1e2f', padding: '2rem', borderRadius: '12px', width: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#00f2fe' }}>Montar Ficha Periodizada</h3>
            
            <form onSubmit={handleSavePlan}>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nome da Ficha (Ex: Hipertrofia A/B/C)</label>
                <input 
                  type="text" 
                  value={planName}
                  onChange={e => setPlanName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f0f1a', color: '#fff' }}
                />
              </div>

              {/* Abas das Rotinas (Treino A, Treino B...) */}
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
              
              {/* Conteúdo da Rotina Ativa */}
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', minHeight: '200px' }}>
                <h4 style={{ marginBottom: '1rem', color: '#cbd5e1' }}>Exercícios do {planRoutines[activeRoutineTab].name}</h4>
                
                {planRoutines[activeRoutineTab].exercises.length === 0 && (
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>Nenhum exercício adicionado a este treino ainda.</p>
                )}

                {planRoutines[activeRoutineTab].exercises.map((ex, eIndex) => (
                  <div key={eIndex} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{eIndex + 1}.</span>
                    <select 
                      value={ex.exerciseId} 
                      onChange={e => updateRoutineExercise(activeRoutineTab, eIndex, "exerciseId", e.target.value)}
                      style={{ flex: 2, padding: '0.6rem', borderRadius: '6px', background: '#0f0f1a', color: '#fff', border: '1px solid #334155' }}
                      required
                    >
                      <option value="" disabled>Selecione o exercício...</option>
                      {exercises.map(libEx => <option key={libEx.id} value={libEx.id}>{libEx.name}</option>)}
                    </select>
                    <input 
                      type="number" 
                      placeholder="Séries" 
                      value={ex.sets} 
                      onChange={e => updateRoutineExercise(activeRoutineTab, eIndex, "sets", parseInt(e.target.value))}
                      style={{ width: '80px', padding: '0.6rem', borderRadius: '6px', background: '#0f0f1a', color: '#fff', border: '1px solid #334155' }}
                    />
                    <input 
                      type="number" 
                      placeholder="Reps" 
                      value={ex.reps} 
                      onChange={e => updateRoutineExercise(activeRoutineTab, eIndex, "reps", parseInt(e.target.value))}
                      style={{ width: '80px', padding: '0.6rem', borderRadius: '6px', background: '#0f0f1a', color: '#fff', border: '1px solid #334155' }}
                    />
                    <button type="button" onClick={() => removeRoutineExercise(activeRoutineTab, eIndex)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
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
                <button type="button" onClick={() => setIsPlanModalOpen(false)} style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid #334155', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmittingPlan} style={{ flex: 1, padding: '0.8rem', background: '#00f2fe', border: 'none', color: '#0f0f1a', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', opacity: isSubmittingPlan ? 0.7 : 1 }}>
                  {isSubmittingPlan ? "Salvando..." : "Finalizar Ficha (Todos os Treinos)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
