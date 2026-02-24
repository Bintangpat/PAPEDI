import Link from "next/link";
import { Course } from "@/types/course";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, User, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface EnrolledCourseCardProps {
  enrollment: {
    course: Course;
    enrolledAt: string;
    progress?: number; // Optional until backend supports it
  };
}

export function EnrolledCourseCard({ enrollment }: EnrolledCourseCardProps) {
  const { course } = enrollment;
  const progress = enrollment.progress || 0;

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-md">
      <div className="bg-muted relative aspect-video w-full overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
            <BookOpen className="h-10 w-10" />
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-white/90 text-black hover:bg-white/90">
          {course.level}
        </Badge>
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs">
            {course.category}
          </Badge>
          <CardTitle className="line-clamp-2 text-lg leading-tight">
            {course.title}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progres Belajar</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>

      <CardFooter className="bg-muted/20 border-t p-4">
        <Link href={`/learning/${course.id}`} className="w-full">
          <Button className="w-full">
            <PlayCircle className="mr-2 h-4 w-4" /> Lanjut Belajar
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
