import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GroupsClient from "./GroupsClient";

import { getSession } from "@/lib/session";

export default async function GroupsAndRanking() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }
  const userId = session.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      groupMembers: {
        include: {
          group: {
            include: {
              members: {
                select: {
                  user: {
                    select: { id: true, name: true, points: true }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  // Ranking Geral (top 50 usuários de todo o sistema)
  const allUsers = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { points: "desc" },
    take: 50,
    select: { id: true, name: true, points: true }
  });

  // Formatando os grupos do usuário
  const myGroups = user.groupMembers.map(gm => {
    // Para cada grupo, ordene os membros por pontos decrescentes
    const sortedMembers = gm.group.members
      .map(m => ({
        id: m.user.id,
        name: m.user.name,
        points: m.user.points
      }))
      .sort((a, b) => b.points - a.points);

    return {
      id: gm.group.id,
      name: gm.group.name,
      inviteCode: gm.group.inviteCode,
      members: sortedMembers
    };
  });

  return (
    <GroupsClient 
      globalRanking={allUsers} 
      myGroups={myGroups} 
      userId={user.id} 
      points={user.points} 
    />
  );
}
