import { subYears } from "date-fns";
import { eq, lt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { use } from "react";
import { db } from "~/server/db";
import {
  courses,
  user_assigned_courses,
  user_test_responses,
  users,
} from "~/server/db/schema";

export async function GET(req: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ status: "OK" });
}
