import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  SlidersHorizontal,
  Send,
} from "lucide-react";
import api from "../services/api";
import { useAuthStore } from "../stores/authStore";

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export default function ErrandsBrowse() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priority, setPriority] = useState("");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const params: Record<string, string | undefined> = {
    search: search || undefined,
    category_id: categoryId || undefined,
    priority: priority || undefined,
    sort,
  };

  const { data: errands, isLoading } = useQuery({
    queryKey: ["errands", params],
    queryFn: () => api.get("/requests/browse", { params }).then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => r.data.data),
  });

  const listings = errands?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Browse Errands</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-border hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search errands..."
            className="w-full border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-shadow bg-surface"
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border border-border rounded-xl px-4 py-3 text-sm bg-surface min-w-[160px]"
        >
          <option value="">All Categories</option>
          {categories?.map((cat: { id: string; name: string }) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-border rounded-xl px-4 py-3 text-sm bg-surface min-w-[140px]"
        >
          <option value="newest">Newest</option>
          <option value="deadline">Deadline</option>
          <option value="budget_asc">Budget: Low</option>
          <option value="budget_desc">Budget: High</option>
        </select>
      </div>

      {showFilters && (
        <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm text-text-secondary">Priority:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-surface"
            >
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-text-secondary">Loading errands...</p>
      ) : listings.length === 0 ? (
        <p className="text-text-secondary">No errands found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(
            (errand: {
              id: string;
              title: string;
              description: string;
              priority: string;
              location?: string;
              deadline?: string;
              budget_range?: number[];
              applications_count?: number;
              category?: { name: string };
              client?: { id: string; name: string };
            }) => {
              const isOwner = user && errand.client?.id === user.id;
              return (
                <div
                  key={errand.id}
                  onClick={() => navigate(`/errands/${errand.id}`)}
                  className="bg-surface rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow overflow-hidden flex flex-col cursor-pointer"
                >
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {errand.category && (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: "#FEF3C7",
                            color: "#92400E",
                          }}
                        >
                          {errand.category.name}
                        </span>
                      )}
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[errand.priority] || ""}`}
                      >
                        {errand.priority}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-1">
                      {errand.title}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                      {errand.description}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
                      {errand.budget_range &&
                        errand.budget_range.length === 2 && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />$
                            {errand.budget_range[0]} - ${errand.budget_range[1]}
                          </span>
                        )}
                      {errand.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(errand.deadline).toLocaleDateString()}
                        </span>
                      )}
                      {errand.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {errand.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="px-6 py-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {errand.applications_count ?? 0} applied
                    </span>
                    <div className="flex items-center gap-3">
                      {errand.client && (
                        <span>Posted by {errand.client.name}</span>
                      )}
                      {!isOwner && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!user) {
                              navigate("/login");
                            } else if (user.role !== "agent") {
                              navigate("/my-profile", {
                                state: { switchToAgent: true },
                              });
                            } else {
                              navigate(`/errands/${errand.id}`);
                            }
                          }}
                          className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-surface transition-colors"
                          style={{ backgroundColor: "#FF6B00" }}
                        >
                          <Send className="w-3 h-3" /> Apply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}
