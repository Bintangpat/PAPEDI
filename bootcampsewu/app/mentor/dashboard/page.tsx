"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Users, BookOpen } from "lucide-react";

export default function MentorDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["mentor-stats"],
    queryFn: async () => {
      const res = await api.get("/mentor/stats");
      return res.data.data;
    },
  });

  const statItems = [
    {
      title: "Project Pending",
      value: stats?.pendingProjects || 0,
      icon: ClipboardList,
      color: "text-orange-600",
      bg: "bg-orange-100",
      desc: "Menunggu penilaian",
    },
    {
      title: "Total Siswa",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
      desc: "Terdaftar di kursus Anda",
    },
    {
      title: "Total Kursus",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: "text-purple-600",
      bg: "bg-purple-100",
      desc: "Kursus yang Anda buat",
    },
  ];

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Mentor</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali! Berikut ringkasan aktivitas Anda.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {statItems.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-muted-foreground mt-1 text-xs">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
