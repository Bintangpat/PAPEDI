"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Award, BookOpen, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PortfolioPage() {
  const { username } = useParams(); // Note: Route is /u/[username], but we use ID for now per backend

  const { data: user, isLoading } = useQuery({
    queryKey: ["portfolio", username],
    queryFn: async () => {
      const res = await api.get(`/portfolio/${username}`);
      return res.data.data;
    },
    enabled: !!username,
  });

  if (isLoading)
    return <div className="p-8 text-center">Loading profile...</div>;
  if (!user) return <div className="p-8 text-center">User not found.</div>;

  return (
    <div className="container max-w-4xl space-y-12 py-12">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-8 text-center md:flex-row md:text-left">
        <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground text-lg">
            {user.bio || "Belum ada bio."}
          </p>
          {user.portfolioUrl && (
            <a
              href={user.portfolioUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-blue-600 hover:underline"
            >
              <ExternalLink className="mr-1 h-4 w-4" />
              Website / Portfolio
            </a>
          )}
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Projects */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen className="text-primary h-6 w-6" />
            <h2 className="text-2xl font-bold">Project Selesai</h2>
          </div>
          {user.projectSubmissions?.length > 0 ? (
            <div className="grid gap-4">
              {user.projectSubmissions.map((sub: any) => (
                <Card key={sub.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {sub.course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      {sub.githubUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={sub.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Repo
                          </a>
                        </Button>
                      )}
                      {sub.demoUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={sub.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Demo
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Belum ada project yang diselesaikan.
            </p>
          )}
        </div>

        {/* Certificates */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-600" />
            <h2 className="text-2xl font-bold">Sertifikat</h2>
          </div>
          {user.certificates?.length > 0 ? (
            <div className="grid gap-4">
              {user.certificates.map((cert: any) => (
                <Card
                  key={cert.id}
                  className="border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/10"
                >
                  <CardHeader>
                    <CardTitle className="text-base text-yellow-800 dark:text-yellow-500">
                      {cert.course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-xs">
                      No. Seri: {cert.serialNumber}
                    </p>
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={`/certificates/${cert.serialNumber}`}>
                        Lihat Sertifikat
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Belum ada sertifikat.</p>
          )}
        </div>
      </div>
    </div>
  );
}
