"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data;
    },
  });

  const statItems = [
    {
      title: "Total Siswa",
      value: stats?.data?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Kursus",
      value: stats?.data?.totalCourses || 0,
      icon: BookOpen,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Total Enrollment",
      value: stats?.data?.totalEnrollments || 0,
      icon: GraduationCap,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Total Mentor",
      value: stats?.data?.totalMentors || 0,
      icon: CheckCircle,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  if (isLoading) {
    return <div>Loading stats...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Overview statistik platform PAPEDI.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
