const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const exercises = [
  "Supino Reto (Barra)",
  "Supino Reto (Halter)",
  "Supino Inclinado (Barra)",
  "Supino Inclinado (Halter)",
  "Crucifixo Reto",
  "Voador (Peck Deck)",
  "Puxada Frontal (Pulley)",
  "Puxada Alta (Pulley)",
  "Remada Curvada (Barra)",
  "Remada Baixa (Polia)",
  "Remada Unilateral (Serrote)",
  "Levantamento Terra",
  "Desenvolvimento (Barra)",
  "Desenvolvimento (Halter)",
  "Elevação Lateral",
  "Elevação Frontal",
  "Crucifixo Inverso",
  "Rosca Direta (Barra)",
  "Rosca Alternada (Halter)",
  "Rosca Martelo",
  "Rosca Scott",
  "Tríceps Pulley (Corda)",
  "Tríceps Pulley (Barra)",
  "Tríceps Testa",
  "Tríceps Francês",
  "Agachamento Livre",
  "Agachamento no Smith",
  "Leg Press 45°",
  "Cadeira Extensora",
  "Cadeira Flexora",
  "Mesa Flexora",
  "Stiff",
  "Passada (Avanço)",
  "Elevação Pélvica",
  "Cadeira Abdutora",
  "Cadeira Adutora",
  "Panturrilha em Pé",
  "Panturrilha Sentado",
  "Abdominal Supra (Solo)",
  "Abdominal Infra",
  "Abdominal Oblíquo",
  "Prancha Isométrica",
  "Esteira (Cardio)",
  "Bicicleta Ergométrica",
  "Elíptico"
];

async function main() {
  console.log('Iniciando cadastro de exercícios...');
  
  let count = 0;
  for (const name of exercises) {
    // Check if exercise already exists
    const exists = await prisma.exercise.findFirst({
      where: { name }
    });
    
    if (!exists) {
      await prisma.exercise.create({
        data: { name }
      });
      count++;
    }
  }
  
  console.log(`Sucesso! ${count} novos exercícios foram cadastrados.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
