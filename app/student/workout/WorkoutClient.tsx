"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { finishWorkoutSession } from "@/app/actions/student";

type ExerciseDetail = {
  name: string;
  sets: number;
  reps: number;
};

export default function WorkoutClient({ routineId, routineName, exercises, currentStreak, currentCrystals }: { routineId: string, routineName: string, exercises: ExerciseDetail[], currentStreak: number, currentCrystals: number }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Se a ficha estiver vazia, exibe erro amigável
  if (exercises.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.finishedCard}>
          <h2>Sua ficha está vazia.</h2>
          <p>Peça ao seu personal para adicionar exercícios.</p>
          <button className={styles.primaryBtn} onClick={() => router.push("/student")}>Voltar</button>
        </div>
      </div>
    );
  }

  const currentExercise = exercises[currentIndex];
  const restTime = 60; // Fixo para o MVP, poderia vir do DB

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResting && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (isResting && timeLeft === 0) {
      setIsResting(false);
      advanceState();
    }
    return () => clearTimeout(timer);
  }, [isResting, timeLeft]);

  const advanceState = () => {
    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);
    } else {
      if (currentIndex < exercises.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setCurrentSet(1);
      } else {
        setIsFinished(true);
      }
    }
  };

  const handleFinishSet = () => {
    setTimeLeft(restTime);
    setIsResting(true);
  };

  const handleSkipExercise = () => {
    setIsResting(false);
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentSet(1);
    } else {
      setIsFinished(true);
    }
  };

  const finishWorkout = async () => {
    setIsSubmitting(true);
    const res = await finishWorkoutSession(routineId);
    if (res.error) {
      alert(res.error);
      setIsSubmitting(false);
    } else {
      router.push("/student");
    }
  };

  if (isFinished) {
    return (
      <div className={styles.container}>
        <div className={styles.finishedCard}>
          <div className={styles.trophy}>🏆</div>
          <h2>Treino Finalizado!</h2>
          <p>Você completou todos os exercícios do dia. Excelente trabalho!</p>
          <div className={styles.pointsEarned}>
            <span className={styles.plusPoints}>+50 pontos</span>
            <span className={styles.streakText}>🔥 Ofensiva mantida: {currentStreak + 1} dias</span>
            <span style={{color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.2rem'}}>💎 {currentCrystals} Escudos intactos para a semana</span>
          </div>
          <button className={styles.primaryBtn} onClick={finishWorkout} disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Resgatar Pontos e Voltar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push("/student")}>
          &larr; Sair
        </button>
        <div className={styles.progress}>
          Exercício {currentIndex + 1} de {exercises.length}
        </div>
        <button className={styles.finishEarlyBtn} onClick={() => setIsFinished(true)}>
          Encerrar Treino
        </button>
      </header>

      <main className={styles.main}>
        {isResting ? (
          <div className={styles.restScreen}>
            <div className={styles.timerCircle}>
              <span className={styles.timeText}>{timeLeft}s</span>
            </div>
            <h3>Descanso!</h3>
            <p>
              {currentSet < currentExercise.sets 
                ? `Prepare-se para a Série ${currentSet + 1} de ${currentExercise.sets}.`
                : `Exercício concluído! Prepare-se para o próximo.`}
            </p>
            <div className={styles.waterReminder}>
              💧 Aproveite para se hidratar! Beba água.
            </div>
            <div className={styles.actions}>
              <button className={styles.secondaryBtn} onClick={() => {
                setIsResting(false);
                advanceState();
              }}>
                Pular Descanso
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.exerciseCard}>
            <div className={styles.info}>
              <h2>{currentExercise.name}</h2>
              <p className={styles.description}>Preste atenção à execução.</p>
              
              <div className={styles.metrics}>
                <div className={styles.metricBox}>
                  <span>Série Atual</span>
                  <strong style={{ color: '#00f2fe' }}>{currentSet} / {currentExercise.sets}</strong>
                </div>
                <div className={styles.metricBox}>
                  <span>Repetições</span>
                  <strong>{currentExercise.reps}</strong>
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.primaryBtn} onClick={handleFinishSet}>
                  Concluir {currentSet === currentExercise.sets ? "Última Série" : `Série ${currentSet}`}
                </button>
                <button className={styles.secondaryBtn} onClick={handleSkipExercise}>
                  Pular Exercício
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
