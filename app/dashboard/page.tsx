import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, Brain, Settings, LogOut, FileText, Upload } from "lucide-react";
import Link from "next/link";
import { CreateStudyDialog } from "@/components/create-study-dialog";

const API_URL = "http://localhost:3005/api";

async function getUser(token: string) {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

async function getStudies(token: string) {
  try {
    const res = await fetch(`${API_URL}/studies`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.studies;
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const user = await getUser(token);
  if (!user) {
    redirect("/login");
  }

  const studies = await getStudies(token);
  const initials = user.email.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-semibold text-foreground">StudyTool</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action="/api/auth/logout" method="POST">
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Studies</h1>
            <p className="text-muted-foreground">
              {studies.length === 0
                ? "Create your first study to get started"
                : `You have ${studies.length} ${studies.length === 1 ? "study" : "studies"}`}
            </p>
          </div>
          <CreateStudyDialog />
        </div>

        {studies.length === 0 ? (
          /* Empty State */
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                No studies yet
              </h2>
              <p className="mb-6 max-w-sm text-muted-foreground">
                Create your first study by uploading PDFs or pasting your notes.
              </p>
              <CreateStudyDialog />
            </CardContent>
          </Card>
        ) : (
          /* Studies Grid */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {studies.map((study: any) => (
              <Link key={study._id} href={`/study/${study._id}`}>
                <Card className="h-full cursor-pointer transition-colors hover:border-primary/50">
                  <CardHeader>
                    <div className="mb-2 flex items-center gap-2">
                      {study.sourceType === "pdf" ? (
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-xs uppercase text-muted-foreground">
                        {study.sourceType === "pdf"
                          ? `${study.pdfFileNames?.length || 0} PDF${(study.pdfFileNames?.length || 0) !== 1 ? "s" : ""}`
                          : "Notes"}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-1">{study.title}</CardTitle>
                    {study.description && (
                      <CardDescription className="line-clamp-2">
                        {study.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {study.content.slice(0, 150)}...
                    </p>
                    <p className="mt-4 text-xs text-muted-foreground">
                      Created {new Date(study.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
