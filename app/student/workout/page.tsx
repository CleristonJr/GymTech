"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const workoutSequence = [
  {
    id: 1,
    name: "Supino Reto com Barra",
    sets: 4,
    reps: "10 a 12",
    rest: 60,
    gifUrl: "https://media.tenor.com/images/3f18e11cfc635df8527a2eb1f3edfb7b/tenor.gif",
    description: "Mantenha as escápulas retraídas, desça a barra até encostar no peito e empurre.",
  },
  {
    id: 2,
    name: "Supino Inclinado com Halteres",
    sets: 3,
    reps: "12 a 15",
    rest: 45,
    gifUrl: "https://media.tenor.com/images/7a0d42111d4e7d4d4205c6d32df149b5/tenor.gif",
    description: "Foque em contrair a parte superior do peitoral no topo do movimento.",
  },
  {
    id: 3,
    name: "Agachamento Livre",
    sets: 4,
    reps: "10",
    rest: 90,
    gifUrl: "https://makeagif.com/media/2-24-2016/5K1X9z.gif",
    description: "Desça quebrando a paralela, mantenha a coluna reta e o abdômen contraído.",
  }
];

export default function WorkoutExecution() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentExercise = workoutSequence[currentIndex];

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
    // Quando o descanso acaba ou é pulado, verificamos o que acontece
    if (currentSet < currentExercise.sets) {
      // Vai para a próxima série do MESMO exercício
      setCurrentSet(currentSet + 1);
    } else {
      // Terminou todas as séries deste exercício, vai para o PRÓXIMO exercício
      if (currentIndex < workoutSequence.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setCurrentSet(1); // Reseta a série para o novo exercício
      } else {
        setIsFinished(true); // Terminou todo o treino
      }
    }
  };

  const handleFinishSet = () => {
    // Concluiu uma série. Inicia o descanso.
    setTimeLeft(currentExercise.rest);
    setIsResting(true);
  };

  const handleSkipExercise = () => {
    setIsResting(false);
    // Pula direto para o próximo exercício
    if (currentIndex < workoutSequence.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentSet(1);
    } else {
      setIsFinished(true);
    }
  };

  const finishWorkout = () => {
    alert("Parabéns! Treino salvo e +50 pontos adicionados ao seu perfil!");
    router.push("/student");
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
            <span className={styles.streakText}>🔥 Ofensiva mantida: 12 dias</span>
            <span style={{color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.2rem'}}>💎 3 Escudos intactos para a semana</span>
          </div>
          <button className={styles.primaryBtn} onClick={finishWorkout}>
            Resgatar Pontos e Voltar
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
          Exercício {currentIndex + 1} de {workoutSequence.length}
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
            <div className={styles.gifContainer}>
              <img src={currentExercise.gifUrl} alt={currentExercise.name} className={styles.gif} />
            </div>

            <div className={styles.info}>
              <h2>{currentExercise.name}</h2>
              <p className={styles.description}>{currentExercise.description}</p>
              
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
