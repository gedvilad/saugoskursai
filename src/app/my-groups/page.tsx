"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import Sidebar from "../_components/_groupPage/Sidebar";
import InvitedGroupView from "../_components/_groupPage/InvitedGroupView";
import GroupContent from "../_components/_groupPage/GroupContent";
import {
  type Group,
  type ApiResponse,
  type Course,
  type ApiResponseCourses,
} from "../_components/_groupPage/types";
import { useRouter } from "next/navigation";
import { is } from "drizzle-orm";
import { ArrowRight, BookOpen, Users } from "lucide-react";
export const dynamic = "force-dynamic";

export default function Home() {
  const { userId } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    setIsLoadingGroups(true);
    if (!userId) return;

    const fetchGroups = async () => {
      try {
        const res = await fetch(`/api/groups?userId=${userId}`);
        const data = (await res.json()) as ApiResponse;
        if (data.groups && data.groups.length > 0) {
          setGroups(data.groups);
          setSelectedGroup(null);
        } else {
          setSelectedGroup(null);
        }
      } catch (error) {
        console.error("Request failed:", error);
      }
    };

    const fetchCourses = async () => {
      try {
        const res = await fetch(`/api/courses/userCourses?userId=${userId}`);
        const data = (await res.json()) as ApiResponseCourses;
        if (!res.ok) {
          toast.error(data.message);
          return;
        }
        setCourses(data.boughtCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchGroups().catch((error) =>
      console.error("Error fetching groups:", error),
    );
    fetchCourses().catch((error) =>
      console.error("Error fetching courses:", error),
    );
    setTimeout(() => setIsLoadingGroups(false), 1000);
  }, [userId]);

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
  };

  const refreshGroups = async () => {
    try {
      const res = await fetch(`/api/groups?userId=${userId}`);
      const data = (await res.json()) as ApiResponse;
      if (data.groups && data.groups.length > 0) {
        setGroups(data.groups);
        setSelectedGroup(data.groups[0]!);
      } else {
        setSelectedGroup(null);
        setGroups([]);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };
  if (isLoadingGroups) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute h-full w-full animate-spin rounded-full border-4 border-stone-300 border-t-stone-600"></div>
          <div className="h-12 w-12 rounded-full bg-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        groups={groups}
        courses={courses}
        selectedGroup={selectedGroup}
        isLoadingGroups={isLoadingGroups}
        isLoadingCourses={isLoadingGroups}
        userId={userId!}
        onGroupSelect={handleGroupSelect}
        onGroupsChange={refreshGroups}
      />

      {selectedGroup?.role === "Pakviestas" ? (
        <InvitedGroupView
          selectedGroup={selectedGroup}
          userId={userId!}
          onGroupAction={refreshGroups}
        />
      ) : (
        selectedGroup && (
          <GroupContent
            selectedGroup={selectedGroup}
            userId={userId!}
            courses={courses}
            onGroupsChange={refreshGroups}
          />
        )
      )}
      {!selectedGroup && (
        <div className="flex flex-1 flex-col items-center bg-stone-50 p-8">
          <div className="w-full max-w-md rounded-lg border border-stone-100 bg-white p-8 shadow-sm">
            <h1 className="mb-4 text-2xl font-bold text-stone-800">
              Grupių peržiūra ir valdymas
            </h1>
            <p className="mb-6 text-stone-600">
              Pasirinkite grupę esančiame meniu
            </p>

            <div className="space-y-4">
              <div className="flex items-start rounded-md bg-stone-50 p-4 transition-colors">
                <div className="mr-4 rounded-md bg-stone-200 p-2">
                  <Users size={20} className="text-stone-700" />
                </div>
                <div>
                  <h3 className="font-medium text-stone-800">Mano grupės</h3>
                  <p className="text-sm text-stone-500">
                    Peržiūrėkite ir valdykite savo grupes
                  </p>
                </div>
              </div>

              <div className="flex items-start rounded-md border-b border-stone-100 bg-stone-50 p-4 transition-colors">
                <div className="mr-4 rounded-md bg-stone-200 p-2">
                  <BookOpen size={20} className="text-stone-700" />
                </div>
                <div>
                  <h3 className="font-medium text-stone-800">Kursai</h3>
                  <p className="text-sm text-stone-500">
                    Priskirite kursus grupės nariams ir matykite jų rezultatus
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
