import { Button } from "@/components/ui/button";
import { LoadingBreadcrumb } from "@/components/ui/animated-loading-svg-text-shimmer";
import { Label } from "@/components/ui/label";
import { FileText, Upload, X } from "lucide-react";

interface FileUpload05Props {
  onFileChange?: (file: File | null) => void;
  onUpload?: () => void;
  onImprove?: () => void;
  onClear?: () => void;
  isUploading?: boolean;
  isImproving?: boolean;
  fileMeta?: { name?: string; size?: string; status?: string };
  uploadError?: string;
}

export default function FileUpload05({
  onFileChange,
  onUpload,
  onImprove,
  onClear,
  isUploading = false,
  isImproving = false,
  fileMeta = {},
  uploadError = "",
}: FileUpload05Props) {
  const fileName = fileMeta?.name || "No file selected";
  const fileSize = fileMeta?.size || "--";
  const status = fileMeta?.status || "Ready";
  const hasFile = fileName !== "No file selected";

  return (
    <div className="w-full">
      <form
        className="w-full"
        onSubmit={(event) => {
          event.preventDefault();
          onUpload?.();
        }}
      >
        <h3 className="text-lg font-semibold text-foreground">Resume Upload</h3>
        <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/3 px-6 py-8 sm:py-10 transition-colors hover:border-white/30">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <Upload
              className="h-8 w-8 text-muted-foreground"
              aria-hidden={true}
            />
            <div className="flex text-sm leading-6 text-foreground">
              <Label
                htmlFor="file-upload-4"
                className="relative cursor-pointer rounded-sm pl-1 font-medium text-primary hover:underline hover:underline-offset-4"
              >
                <span>Drag and drop or choose your resume</span>
                <input
                  id="file-upload-4"
                  name="file-upload-4"
                  type="file"
                  accept=".pdf,.docx,.txt,.rtf"
                  className="sr-only"
                  disabled={isUploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    onFileChange?.(file);
                  }}
                />
              </Label>
            </div>
          </div>
        </div>
        <p className="mt-2 flex items-center justify-between text-xs leading-5 text-muted-foreground">
          Recommended max. size: 10 MB, Accepted file types: PDF, DOCX, TXT, RTF.
        </p>
        {uploadError ? (
          <p className="mt-2 text-xs text-red-400">{uploadError}</p>
        ) : null}
        <div className="relative mt-6 rounded-2xl bg-muted/60 p-3">
          <div className="absolute right-2 top-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full p-2 text-muted-foreground hover:text-foreground"
              aria-label="Remove"
              onClick={() => onClear?.()}
              disabled={!hasFile && !uploadError}
            >
              <X className="size-4 shrink-0" aria-hidden={true} />
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background/80 shadow-sm ring-1 ring-inset ring-input">
              <FileText className="size-5 text-foreground" aria-hidden={true} />
            </span>
            <div className="w-full">
              <p className="text-xs font-medium text-foreground">{fileName}</p>
              <p className="mt-0.5 flex justify-between text-xs text-muted-foreground">
                <span>{fileSize}</span>
                <span>{isUploading ? "Uploading..." : status}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="whitespace-nowrap rounded-full border border-input px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-foreground"
            onClick={() => onClear?.()}
            disabled={!hasFile && !uploadError}
          >
            Clear
          </Button>
          <Button
            type="button"
            variant="glass"
            className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium"
            onClick={() => onImprove?.()}
            disabled={isImproving}
          >
            {isImproving ? (
              <LoadingBreadcrumb text="Cooking" className="text-sm" white />
            ) : (
              "Improve with AI"
            )}
          </Button>
          <Button
            type="submit"
            variant="default"
            className="whitespace-nowrap rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            disabled={!hasFile || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </form>
    </div>
  );
}
