import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
        <FileQuestion className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">
        404 - Page Not Found
      </h1>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Link href="/">
          <Button variant="primary" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
