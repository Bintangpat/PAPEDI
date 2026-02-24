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
import { BookOpen, Users, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
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

        <CardContent className="flex-1 p-4 pt-0">
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {course.description}
          </p>
        </CardContent>

        <CardFooter className="bg-muted/20 flex items-center justify-between border-t p-4 py-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={course.creator?.avatar || ""} />
              <AvatarFallback>
                <User className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[100px] truncate">
              {course.creator?.name || "Instruktur"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{course._count?.modules || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{course._count?.enrollments || 0}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
