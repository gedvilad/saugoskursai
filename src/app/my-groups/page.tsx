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
export const dynamic = "force-dynamic";

export default function Home() {
  const { userId } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!userId) return;
    setIsLoadingGroups(true);
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
    setIsLoadingGroups(false);
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

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        groups={groups}
        selectedGroup={selectedGroup}
        isLoadingGroups={isLoadingGroups}
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
    </div>
  );
}
