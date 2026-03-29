/*
 * WATCHLIST EXPLORER — Search 45,296 entities
 * Filters by list, entity type, country. Entity detail cards on click.
 */
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiskBadge } from "@/components/shared";
import { watchlistEntities, dataSources } from "@/lib/mockData";
import { Search, Globe, User, Building2, Ship, X } from "lucide-react";

const entityTypeIcons: Record<string, React.ElementType> = { Individual: User, Organization: Building2, Vessel: Ship };

const PAGE_SIZE = 25;

export default function Watchlist() {
  const [search, setSearch] = useState("");
  const [listFilter, setListFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return watchlistEntities.filter((e) => {
      const matchesSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.aliases.some(a => a.toLowerCase().includes(search.toLowerCase()));
      const matchesList = listFilter === "all" || e.list === listFilter;
      const matchesType = typeFilter === "all" || e.type === typeFilter;
      return matchesSearch && matchesList && matchesType;
    });
  }, [search, listFilter, typeFilter]);

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  useEffect(() => {
    setPage(1);
  }, [search, listFilter, typeFilter]);
  const pageSafe = Math.min(page, totalPages);
  const startIdx = (pageSafe - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, totalFiltered);
  const paginatedRows = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  const selected = watchlistEntities.find((e) => e.id === selectedEntity);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">Watchlist Explorer</h1>
        <p className="mt-1 text-sm text-slate-500 font-body">
          Search and explore 45,296 sanctioned entities across all monitored lists
        </p>
        <p className="mt-3 text-xs leading-relaxed text-slate-600 font-body">
          <span className="font-semibold text-slate-700">Last Updated:</span> Sanctions data last refreshed: March 29,
          2026 — Auto-updates every 6 hours from OFAC, EU, UN, UK OFSI
        </p>
      </div>

      {/* List proportion bars */}
      <div className="premium-card rounded-xl p-8">
        <h3 className="text-xs font-semibold text-slate-500 font-display uppercase tracking-wider mb-3">List Distribution</h3>
        <div className="space-y-3">
          {dataSources.map((source, i) => {
            const pct = ((source.count / 45296) * 100).toFixed(1);
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{source.flag}</span>
                <span className="w-24 text-xs font-medium text-slate-600 font-body">{source.name}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: i * 0.15 }}
                    className="h-full rounded-full bg-cyan-500"
                    style={{ opacity: 1 - i * 0.15 }}
                  />
                </div>
                <span className="text-xs font-data text-slate-500 w-20 text-right">{source.count.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="premium-card rounded-xl p-8">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or alias..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
            />
          </div>
          <select
            value={listFilter}
            onChange={(e) => setListFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            <option value="all">All Lists</option>
            <option value="OFAC SDN">OFAC SDN</option>
            <option value="EU Consolidated">EU Consolidated</option>
            <option value="UN Security Council">UN Security Council</option>
            <option value="UK OFSI">UK OFSI</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            <option value="all">All Types</option>
            <option value="Individual">Individual</option>
            <option value="Organization">Organization</option>
            <option value="Vessel">Vessel</option>
          </select>
        </div>
        <div className="mt-3 flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-data">
            {totalFiltered === 0
              ? "No matching entities"
              : `Showing ${startIdx + 1}–${endIdx} of ${totalFiltered} matching entries (${watchlistEntities.length.toLocaleString()} total indexed)`}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pageSafe <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-md border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="font-data text-slate-500">
                Page {pageSafe} of {totalPages}
              </span>
              <button
                type="button"
                disabled={pageSafe >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-md border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entity List */}
        <div className="lg:col-span-2 premium-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 font-display">ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 font-display">Entity</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 font-display">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 font-display">List</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 font-display">Country</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((entity) => {
                  const TypeIcon = entityTypeIcons[entity.type] || Globe;
                  return (
                    <tr
                      key={entity.id}
                      onClick={() => setSelectedEntity(entity.id)}
                      className={`border-t border-slate-100 cursor-pointer transition-colors ${selectedEntity === entity.id ? "bg-cyan-50/50" : "hover:bg-slate-50/50"}`}
                    >
                      <td className="py-2.5 px-4 font-data text-[11px] text-slate-400">{entity.id}</td>
                      <td className="py-2.5 px-4">
                        <span className="text-slate-800 font-medium font-body text-sm">{entity.name}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <TypeIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-500 font-body">{entity.type}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-xs font-data text-cyan-600">{entity.list}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-500 font-body">{entity.country}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Entity Detail */}
        <div className="premium-card rounded-xl p-8">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold font-display text-slate-900">Entity Detail</h3>
                  <button onClick={() => setSelectedEntity(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-slate-500 font-body mb-1">Name</div>
                    <div className="text-sm font-semibold text-slate-900 font-display">{selected.name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-500 font-body mb-1">Type</div>
                      <div className="text-sm text-slate-700 font-body">{selected.type}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-body mb-1">Country</div>
                      <div className="text-sm text-slate-700 font-body">{selected.country}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-body mb-1">Sanctions List</div>
                    <div className="text-sm font-data text-cyan-600">{selected.list}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-body mb-1">Program</div>
                    <div className="text-sm text-slate-700 font-body">{selected.program}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-body mb-1">Date Added</div>
                    <div className="text-sm font-data text-slate-700">{selected.dateAdded}</div>
                  </div>
                  {selected.aliases.length > 0 && (
                    <div>
                      <div className="text-xs text-slate-500 font-body mb-1">Aliases</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.aliases.map((alias, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-xs text-slate-600 font-body">{alias}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                <Globe className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-body">Select an entity to view details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
