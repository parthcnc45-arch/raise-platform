"use client";

import { useRef, type ChangeEvent } from "react";
import { BodyText, FieldError, PageTitle, SectionHeading, SelectInput, inputCls } from "./formUi";
import RichTextEditor from "./RichTextEditor";
import type { FinalSubmissionData } from "./types";

type FinalSubmissionStepProps = {
  value: FinalSubmissionData;
  onChange: (next: FinalSubmissionData) => void;
  companyName: string;
  contactName: string;
  errors: Record<string, string>;
};

function ImageUploadBox({
  title,
  emptyLabel,
  buttonLabel,
  fileName,
  previewUrl,
  boxClassName,
  onPick,
  onClear,
}: {
  title: string;
  emptyLabel: string;
  buttonLabel: string;
  fileName: string;
  previewUrl?: string;
  boxClassName: string;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onPick(file);
    event.target.value = "";
  };

  return (
    <div className="space-y-2">
      {/* min-h keeps both columns aligned even when one title wraps to two lines */}
      <p className="min-h-[2.5rem] break-words text-xs font-bold leading-snug text-slate-800">{title}</p>

      {/* Preview of the image the user selected */}
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt={title}
          className={`${boxClassName} rounded-md border border-slate-300 bg-white`}
        />
      ) : (
        <div
          className={`${boxClassName} flex items-center justify-center rounded-md border border-slate-300 bg-slate-200 px-2 text-center text-[10px] font-semibold text-slate-500`}
        >
          {fileName || emptyLabel}
        </div>
      )}

      {/* Fixed-height row so the upload buttons line up across both columns */}
      <p className="min-h-[1.25rem] break-all text-xs text-slate-800">
        {fileName && (
          <>
            {fileName}{" "}
            <button type="button" onClick={onClear} className="text-[#1F5FBF] hover:underline">
              (delete)
            </button>
          </>
        )}
      </p>

      <input ref={input} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="rounded-md bg-[#2d9ab7] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#258399]"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

export default function FinalSubmissionStep({
  value,
  onChange,
  companyName,
  contactName,
  errors,
}: FinalSubmissionStepProps) {
  type ImageKeys = "companyLogoName" | "headshotName";
  type UrlKeys = "companyLogoUrl" | "headshotUrl";

  // Keeps the selected image in the browser only (blob URL) so it can be previewed
  const pickImage = (file: File, nameKey: ImageKeys, urlKey: UrlKeys) => {
    const previous = value[urlKey];
    if (previous) URL.revokeObjectURL(previous);
    onChange({ ...value, [nameKey]: file.name, [urlKey]: URL.createObjectURL(file) });
  };

  const clearImage = (nameKey: ImageKeys, urlKey: UrlKeys) => {
    const previous = value[urlKey];
    if (previous) URL.revokeObjectURL(previous);
    onChange({ ...value, [nameKey]: "", [urlKey]: undefined });
  };

  return (
    <div className="space-y-8">
      <div>
        <PageTitle>{companyName.toUpperCase()}</PageTitle>
      </div>

      {/* EMERGING MANAGER DATABASE */}
      <section className="space-y-3">
        <SectionHeading>EMERGING MANAGER DATABASE</SectionHeading>
        <BodyText>
          The information you have provided will be made available to the Selection Committee and used privately by
          them to decide who will be invited to RAISE, and who will present. In addition, the information will be
          combined with the applications of other GPs to create an anonymous aggregate view of all the Emerging
          Managers.
        </BodyText>
        <BodyText>
          In addition to the above uses of this information, RAISE provides a searchable Emerging Manager Database
          to all attending LPs. Would you like to publish a profile to LPs?
        </BodyText>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-gray-800 cursor-pointer">
            <input
              type="radio"
              name="publishOption"
              checked={value.publishOption === "Yes"}
              onChange={() => onChange({ ...value, publishOption: "Yes" })}
              className="h-3.5 w-3.5 accent-[#1B365D]"
            />
            <span>Yes - I also want to publish this information on the RAISE Emerging Manager Database</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-800 cursor-pointer">
            <input
              type="radio"
              name="publishOption"
              checked={value.publishOption === "No"}
              onChange={() => onChange({ ...value, publishOption: "No" })}
              className="h-3.5 w-3.5 accent-[#1B365D]"
            />
            <span>No Thank You - let’s just submit this application</span>
          </label>
          <FieldError message={errors.publishOption} />
        </div>
      </section>

      {value.publishOption === "Yes" && (
        <>
          <section className="space-y-4">
            <SectionHeading>EMERGING MANAGER DATABASE DETAILS</SectionHeading>

            <div className="grid grid-cols-1 items-start gap-8 sm:grid-cols-2">
              <ImageUploadBox
                title={`Company Logo for ${companyName}`}
                emptyLabel="No Logo Uploaded"
                buttonLabel="Upload Logo"
                fileName={value.companyLogoName}
                previewUrl={value.companyLogoUrl}
                boxClassName="h-28 w-44 object-contain"
                onPick={(file) => pickImage(file, "companyLogoName", "companyLogoUrl")}
                onClear={() => clearImage("companyLogoName", "companyLogoUrl")}
              />

              <ImageUploadBox
                title={`Headshot for ${contactName}`}
                emptyLabel="No Headshot Uploaded"
                buttonLabel="Upload Headshot"
                fileName={value.headshotName}
                previewUrl={value.headshotUrl}
                boxClassName="h-28 w-28 object-cover"
                onPick={(file) => pickImage(file, "headshotName", "headshotUrl")}
                onClear={() => clearImage("headshotName", "headshotUrl")}
              />
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeading>EXECUTIVE SUMMARY</SectionHeading>
            <BodyText>
              Your headline is the distilled essence of who you are and what you do. In 20 words or less convey to
              LPs why they should open and look at your profile.
            </BodyText>
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <label className="w-24 text-xs text-gray-800 shrink-0">Headline:</label>
                <input
                  type="text"
                  value={value.headline}
                  onChange={(e) => onChange({ ...value, headline: e.target.value })}
                  className={`${inputCls} w-full`}
                />
              </div>
              {errors.headline && (
                <div className="text-right">
                  <FieldError message={errors.headline} />
                </div>
              )}
            </div>

            <BodyText>
              Please provide a concise summary of your firm below for inclusion in the Emerging Manager Database.
              Provide whatever data you want to share including links to external information as needed, but keep
              it brief (200 words or less).
            </BodyText>
            <RichTextEditor
              ariaLabel="Executive summary"
              value={value.executiveSummary}
              onChange={(html) => onChange({ ...value, executiveSummary: html })}
              minHeight={180}
            />
          </section>

          <section className="space-y-3">
            <SectionHeading>PERMISSIONS</SectionHeading>
            <BodyText>
              Please note that by submitting your profile to the RAISE Emerging Manager Database, you hereby grant
              RAISE the right to disclose your email address to RAISE Limited Partners.
            </BodyText>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs text-gray-800 sm:max-w-xl">
                Do you want to allow RAISE Limited Partners access to your fundraising deck via the RAISE Emerging
                Manager Database?
              </label>
              <SelectInput
                value={value.shareDeck}
                onChange={(next) => onChange({ ...value, shareDeck: next as FinalSubmissionData["shareDeck"] })}
                options={["Yes", "No"]}
              />
            </div>
            {errors.shareDeck && (
              <div className="text-right">
                <FieldError message={errors.shareDeck} />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
