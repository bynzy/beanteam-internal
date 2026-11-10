"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function EmployeeFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("query") || "");

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (!search.trim()) {
      params.delete("query");
    } else {
      params.set("query", search.trim());
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    router.push(pathname);
  };

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            placeholder="Search name, email, or job title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
          />
          <button
            type="submit"
            className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white"
          >
            Search
          </button>
        </form>

        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Status
            </label>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={searchParams.get("status") || ""}
              onChange={(e) => updateFilter("status", e.target.value)}
            >
              <option value="">All</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Missing
            </label>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={searchParams.get("missing") || ""}
              onChange={(e) => updateFilter("missing", e.target.value)}
            >
              <option value="">None</option>
              <option value="handbook">Missing handbook</option>
              <option value="nda">Missing NDA</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Certificate
            </label>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={searchParams.get("cert") || ""}
              onChange={(e) => updateFilter("cert", e.target.value)}
            >
              <option value="">All</option>
              <option value="expiring">Expiring in 30 days</option>
            </select>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}