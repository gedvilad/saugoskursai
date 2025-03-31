import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import {
  courses,
  user_assigned_courses,
  user_bought_courses,
} from "~/server/db/schema";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  //const groupId = url.searchParams.get("groupId");
  if (!userId) {
    return new Response(JSON.stringify({ message: "Nėra vartotojo ID" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.clerk_id, userId),
  });
  if (!user) {
    return new Response(
      JSON.stringify({ message: "Vartotojas su tokiu ID nerastas" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
  /*const group = await db.query.groups.findFirst({
    where: (groups,{eq}) => eq(groups.id, Number(groupId))
  });
  if(!group){
    return new Response(
      JSON.stringify({ message: "Grupė su tokiu ID nerasta" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
  const group_user = await db.query.userGroups.findFirst({
    where: (userGroups, {and}) => and(eq(userGroups.userId, userId), eq(userGroups.groupId, group.id))
  });
  if(!group_user){
    return new Response(
      JSON.stringify({ message: "Vartotojas nėra grupės narys" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
  if(group_user.role !== "Administratorius"){
    return new Response(
      JSON.stringify({ message: "Šį veiksmą gali atlikti tik grupės administratorius" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }*/
  const boughtCourses = await db
    .select({
      id: courses.id,
      name: courses.name,
    })
    .from(courses)
    .innerJoin(
      user_bought_courses,
      eq(courses.id, user_bought_courses.courseId),
    )
    .where(eq(user_bought_courses.userId, userId));

  const assignedCourses = await db
    .select({
      id: courses.id,
      name: courses.name,
    })
    .from(courses)
    .innerJoin(
      user_assigned_courses,
      eq(courses.id, user_assigned_courses.courseId),
    )
    .where(eq(user_assigned_courses.userId, userId));
  return NextResponse.json({
    boughtCourses: boughtCourses,
    assignedCourses: assignedCourses,
  });
}
