import { Suspense } from "react";
import SearchClient from "./SearchClient";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="safe-top px-4 py-10 text-center text-[13px] text-text-secondary">
          Đang tải kết quả...
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
