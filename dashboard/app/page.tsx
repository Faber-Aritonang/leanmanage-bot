import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
import { CheckCircle2, Clock, AlertTriangle, Layers, Users, BarChart3 } from "lucide-react";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const dynamic = 'force-dynamic';

export default async function ExecutiveDashboard() {
  const tasks = await prisma.task.findMany({
    include: { reporter: true, assignee: true },
    orderBy: { createdAt: "desc" },
  });

  const users = await prisma.user.findMany({
    include: { tasksAssigned: true }
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = tasks.filter((t) => t.status === "WIP" || t.status === "REVIEW").length;
  
  const today = new Date();
  const overdueTasks = tasks.filter((t) => t.status !== "DONE" && t.dueDate && today > t.dueDate).length;
  const slaCompliance = totalTasks > 0 ? Math.round(((totalTasks - overdueTasks) / totalTasks) * 100) : 100;

  const statusCounts = {
    BACKLOG: tasks.filter(t => t.status === "BACKLOG").length,
    WIP: tasks.filter(t => t.status === "WIP").length,
    REVIEW: tasks.filter(t => t.status === "REVIEW").length,
    DONE: completedTasks,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <header className="mb-8 border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-500" /> Executive Dashboard | LeanManage
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Pusat Kendali Visual Operasional Berbasis Prinsip Lean System & Toyota Way
          </p>
        </div>
        <div className="mt-4 md:mt-0 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-xs text-slate-400">
          Status Database: <span className="text-emerald-400 font-semibold">● Connected (PostgreSQL)</span>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Total Task Aktif</span>
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold mt-2 text-white">{totalTasks}</div>
          <p className="text-xs text-slate-500 mt-1">Seluruh tiket dalam Kanban</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Dalam Pengerjaan (WIP)</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold mt-2 text-white">{inProgressTasks}</div>
          <p className="text-xs text-slate-500 mt-1">Sedang dikerjakan tim</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">SLA Compliance</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold mt-2 text-white">{slaCompliance}%</div>
          <p className="text-xs text-slate-500 mt-1">{overdueTasks} Task melewati batas waktu</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Overdue / Bottleneck</span>
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-3xl font-bold mt-2 text-rose-400">{overdueTasks}</div>
          <p className="text-xs text-slate-500 mt-1">Memerlukan perhatian manajerial</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl lg:col-span-1 shadow-sm">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            📊 Distribusi Status Kanban
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Backlog</span>
                <span className="font-semibold">{statusCounts.BACKLOG}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: `${totalTasks ? (statusCounts.BACKLOG / totalTasks) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">WIP (In Progress)</span>
                <span className="font-semibold">{statusCounts.WIP}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${totalTasks ? (statusCounts.WIP / totalTasks) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Review</span>
                <span className="font-semibold">{statusCounts.REVIEW}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full" style={{ width: `${totalTasks ? (statusCounts.REVIEW / totalTasks) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Done (Selesai)</span>
                <span className="font-semibold">{statusCounts.DONE}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${totalTasks ? (statusCounts.DONE / totalTasks) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl lg:col-span-2 shadow-sm">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" /> Beban Kerja Anggota Tim (Workload Balance)
          </h2>
          {users.length === 0 ? (
            <p className="text-slate-500 text-sm">Belum ada data pengguna terdaftar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase">
                    <th className="py-3 px-4">Nama Anggota</th>
                    <th className="py-3 px-4">Departemen</th>
                    <th className="py-3 px-4">Total Task Dipegang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-medium text-white">{user.name}</td>
                      <td className="py-3 px-4 text-slate-400">{user.department || "General"}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold">
                          {user.tasksAssigned.length} Task
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-white mb-4">📋 Daftar Task & Pantauan SLA Real-Time</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Judul Task</th>
                <th className="py-3 px-4">Prioritas</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Target SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {tasks.map((task) => {
                const isOverdue = task.status !== "DONE" && task.dueDate && today > task.dueDate;
                return (
                  <tr key={task.id} className="hover:bg-slate-800/50">
                    <td className="py-3 px-4 text-slate-500 font-mono">#{task.id}</td>
                    <td className="py-3 px-4 font-medium text-white">{task.title}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        task.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        task.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        task.status === 'WIP' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{task.assignee?.name || "Belum ada"}</td>
                    <td className="py-3 px-4">
                      {task.dueDate ? (
                        <span className={isOverdue ? "text-rose-400 font-semibold flex items-center gap-1" : "text-slate-300"}>
                          {isOverdue ? "⚠️ " : ""} {new Date(task.dueDate).toLocaleDateString("id-ID")}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
