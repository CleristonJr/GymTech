"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

// Dados mockados baseados nos links de GIFs encontrados
const mockWorkout = {
  id: 1,
  name: "Treino A - Peito e Tríceps",
  exercises: [
    {
      id: 101,
      name: "Supino Reto com Barra",
      gifUrl: "https://media.tenor.com/images/3f18e11cfc635df8527a2eb1f3edfb7b/tenor.gif",
      sets: 4,
      reps: 12,
      restTimeSecs: 60,
    },
    {
      id: 102,
      name: "Supino Inclinado com Halteres",
      gifUrl: "https://media.tenor.com/images/7a0d42111d4e7d4d4205c6d32df149b5/tenor.gif",
      sets: 3,
      reps: 10,
      restTimeSecs: 45,
    }
  ]
};

export default function WorkoutExecution() {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const exercise = mockWorkout.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === mockWorkout.exercises.length - 1;

  const handleNext = () => {
    if (isLastExercise) {
      alert("Treino Concluído! Parabéns!");
      window.location.href = "/student";
    } else {
      setIsResting(true);
      setTimeLeft(exercise.restTimeSecs);
      // Aqui entraria a lógica de setInterval para o timer de descanso
      // Para demonstração, vamos apenas avançar
      setTimeout(() => {
        setIsResting(false);
        setCurrentExerciseIndex(prev => prev + 1);
      }, 2000); // Simulando descanso de 2s para o mockup
    }
  };

  const handleSkip = () => {
    if (isLastExercise) {
      alert("Treino Finalizado com exercícios pulados.");
      window.location.href = "/student";
    } else {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/student" className={styles.backBtn}>&larr; Voltar</Link>
        <div className={styles.progress}>
          {currentExerciseIndex + 1} / {mockWorkout.exercises.length}
        </div>
      </header>

      <main className={styles.main}>
        {isResting ? (
          <div className={styles.restScreen}>
            <h2>Descanso</h2>
            <div className={styles.timer}>{timeLeft}s</div>
            <p>Prepare-se para o próximo exercício</p>
            <button className={styles.skipRestBtn} onClick={() => setIsResting(false)}>
              Pular Descanso
            </button>
          </div>
        ) : (
          <div className={styles.exerciseCard}>
            <h1 className={styles.exerciseName}>{exercise.name}</h1>
            
            <div className={styles.gifContainer}>
              <img src={exercise.gifUrl} alt={exercise.name} className={styles.gif} />
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailBox}>
                <span className={styles.detailLabel}>Séries</span>
                <span className={styles.detailValue}>{exercise.sets}</span>
              </div>
              <div className={styles.detailBox}>
                <span className={styles.detailLabel}>Repetições</span>
                <span className={styles.detailValue}>{exercise.reps}</span>
              </div>
              <div className={styles.detailBox}>
                <span className={styles.detailLabel}>Descanso</span>
                <span className={styles.detailValue}>{exercise.restTimeSecs}s</span>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.skipBtn} onClick={handleSkip}>
                Pular Exercício
              </button>
              <button className={styles.doneBtn} onClick={handleNext}>
                {isLastExercise ? "Finalizar Treino" : "Concluir e Descansar"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
