"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Upload, X } from "lucide-react";

const API_URL = "http://localhost:3005/api";

export function CreateStudyDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setNotes("");
    setPdfFiles([]);
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfFilesOnly = files.filter((f) => f.type === "application/pdf");

    if (pdfFiles.length + pdfFilesOnly.length > 20) {
      setError("Maximum 20 PDF files allowed");
      return;
    }

    setPdfFiles((prev) => [...prev, ...pdfFilesOnly]);
    setError("");
  };

  const removeFile = (index: number) => {
    setPdfFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNotesSubmit = async () => {
    if (!title.trim() || !notes.trim()) {
      setError("Title and notes are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/studies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description, content: notes }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create study");
        return;
      }

      resetForm();
      setOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePdfSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (pdfFiles.length === 0) {
      setError("Please upload at least one PDF");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      pdfFiles.forEach((file) => formData.append("pdfs", file));

      const res = await fetch(`${API_URL}/studies/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create study");
        return;
      }

      resetForm();
      setOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Study
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Study</DialogTitle>
          <DialogDescription>
            Add your study material from notes or PDF files
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Biology Chapter 5"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">What are you studying for? (optional)</Label>
            <Input
              id="description"
              placeholder="Midterm, Final exam, Quiz, Class, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Tabs defaultValue="pdf" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                PDFs
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pdf" className="space-y-4">
              <div className="space-y-2">
                <Label>Upload PDFs (up to 20 files)</Label>
                <div
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload PDF files
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pdfFiles.length}/20 files selected
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {pdfFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files</Label>
                  <div className="max-h-[150px] space-y-2 overflow-y-auto rounded-lg border border-border p-2">
                    {pdfFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded bg-muted/50 px-3 py-2"
                      >
                        <span className="truncate text-sm">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handlePdfSubmit}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Extracting & Creating..." : "Create Study from PDFs"}
              </Button>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Your Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Paste or type your study notes here..."
                  className="min-h-[200px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button
                onClick={handleNotesSubmit}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Creating..." : "Create Study from Notes"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
