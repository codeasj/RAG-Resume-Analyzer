"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BsUpload, BsFileEarmarkPdf, BsXCircle } from "react-icons/bs";

const schema = z.object({
  jobDescription: z.string().min(50, "Please paste a proper job description (min 50 characters)"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (resumeText: string, jobDescription: string) => void;
  loading: boolean;
}

export default function UploadForm({ onSubmit, loading }: Props) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { jobDescription: "" },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPdfError("");
    if (!file) return;
    if (file.type !== "application/pdf") {
      setPdfError("Only PDF files allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPdfError("File too large. Max 5MB");
      return;
    }
    setPdfFile(file);
  };

  const handleSubmit = async (data: FormData) => {
    if (!pdfFile) {
      setPdfError("Please upload your resume PDF");
      return;
    }

    // Extract text from PDF on frontend using FormData
    // Send to a small extract endpoint or send file + jd together
    const formData = new FormData();
    formData.append("resume", pdfFile);
    formData.append("jobDescription", data.jobDescription);

    // Call parent with formData
    // We'll handle PDF extraction in API route
    const reader = new FileReader();
    reader.onload = async () => {
      // Pass file as base64 to API
      const base64 = (reader.result as string).split(",")[1];
      onSubmit(base64, data.jobDescription);
    };
    reader.readAsDataURL(pdfFile);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

        {/* PDF Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Resume PDF *
          </label>

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              pdfFile
                ? "border-green-300 bg-green-50"
                : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {pdfFile ? (
              <div className="flex items-center justify-center gap-3">
                <BsFileEarmarkPdf className="w-8 h-8 text-red-500" />
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-700">
                    {pdfFile.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {(pdfFile.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPdfFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="ml-2 text-slate-400 hover:text-red-500"
                >
                  <BsXCircle className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <BsUpload className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm text-slate-500">
                  Click to upload resume PDF
                </p>
                <p className="text-xs text-slate-400">Max 5MB</p>
              </div>
            )}
          </div>

          {pdfError && (
            <p className="text-xs text-red-500">{pdfError}</p>
          )}
        </div>

        {/* JD */}
        <FormField
          control={form.control}
          name="jobDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Paste the full job description here..."
                  className="min-h-40 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing... (this takes 10-15 seconds)
            </span>
          ) : (
            "Analyze Resume"
          )}
        </Button>
      </form>
    </Form>
  );
}