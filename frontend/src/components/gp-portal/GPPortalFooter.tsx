const TERMS_URL = "https://raiseglobal.co/participation-terms";
const CONTACT_HREF = "mailto://raiseglobal.co";

export default function GPPortalFooter() {
  return (
    <footer className="w-full bg-white">
      <div className="h-[3px] w-full bg-[#78bce6]" />
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-xs text-slate-500 sm:flex-row sm:px-8 sm:text-left">
        <p>
          RAISE Global is presented by RAISE Conferences, LLC. under the following{" "}
          <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[#1B365D] hover:underline">
            Terms and Conditions
          </a>
        </p>
        <a href={CONTACT_HREF} className="hover:text-[#1B365D] hover:underline">
          Contact RAISE Conferences
        </a>
      </div>
    </footer>
  );
}
