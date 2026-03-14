"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  IndianRupee,
  Package,
  Users,
  IceCream,
  AlertTriangle,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { getBills } from "@/services/bills";
import { getVendors } from "@/services/vendors";
import { getProducts } from "@/services/products";
import { getLowStockItems } from "@/services/stock";
import { getProductionLogs } from "@/services/production";
import { formatDateTime } from "@/utils/format";
import type { Bill } from "@/types";
import type { ProductionLog } from "@/types";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [vendors, setVendors] = useState<Awaited<ReturnType<typeof getVendors>>>([]);
  const [products, setProducts] = useState<Awaited<ReturnType<typeof getProducts>>>([]);
  const [lowStock, setLowStock] = useState<Awaited<ReturnType<typeof getLowStockItems>>>([]);
  const [productionLogs, setProductionLogs] = useState<ProductionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getBills(),
      getVendors(),
      getProducts(),
      getLowStockItems(),
      getProductionLogs(),
    ])
      .then(([b, v, p, l, pr]) => {
        setBills(b);
        setVendors(v);
        setProducts(p);
        setLowStock(l);
        setProductionLogs(pr);
      })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const salesToday = bills.filter((b) => b.date === today).reduce((s, b) => s + b.total, 0);
  const productionToday = productionLogs.filter((p) => p.date === today).reduce((s, p) => s + p.quantity, 0);
  const pendingPayments = bills.filter((b) => b.status === "pending").reduce((s, b) => s + b.total, 0);

  const flavorSales = useMemo(() => {
    const map: Record<string, number> = {};
    bills.forEach((b) => {
      b.items.forEach((i) => {
        const name = i.productName;
        map[name] = (map[name] || 0) + i.quantity;
      });
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [bills]);

  const last7Days = useMemo(() => {
    const days: { date: string; sales: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const sales = bills.filter((b) => b.date === dateStr).reduce((s, b) => s + b.total, 0);
      days.push({ date: dateStr, sales });
    }
    return days;
  }, [bills]);

  const maxSales = Math.max(...last7Days.map((d) => d.sales), 1);

  const cards = [
    { label: "Sales Today", value: `₹${salesToday.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-emerald-600 bg-emerald-100" },
    { label: "Production Today", value: productionToday, icon: Package, color: "text-sky-600 bg-sky-100" },
    { label: "Total Vendors", value: vendors.length, icon: Users, color: "text-violet-600 bg-violet-100" },
    { label: "Total Products", value: products.length, icon: IceCream, color: "text-amber-600 bg-amber-100" },
    { label: "Low Stock Alerts", value: lowStock.length, icon: AlertTriangle, color: "text-red-600 bg-red-100" },
    { label: "Pending Vendor Payments", value: `₹${pendingPayments.toLocaleString("en-IN")}`, icon: CreditCard, color: "text-orange-600 bg-orange-100" },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Dashboard</h1>
          <p className="text-sm text-slate-500 sm:text-base">Overview of your ice cream factory</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Dashboard</h1>
        <p className="text-sm text-slate-500 sm:text-base">Overview of your ice cream factory</p>
      </div>

      <motion.div variants={container} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <motion.div key={c.label} variants={item}>
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{c.label}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-800">{c.value}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${c.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item}>
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-sky-600" />
              <h3 className="font-semibold text-slate-800">Daily Sales (Last 7 Days)</h3>
            </div>
            <div className="flex h-40 items-end gap-2">
              {last7Days.map((d) => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                  <motion.div
                    className="w-full rounded-t bg-sky-500"
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.sales / maxSales) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    style={{ minHeight: d.sales ? "4px" : 0 }}
                  />
                  <span className="text-xs text-slate-500">
                    {new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" })}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Max: ₹{maxSales.toLocaleString("en-IN")}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <IceCream className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-slate-800">Best Selling Flavors</h3>
            </div>
            <div className="space-y-3">
              {flavorSales.map(([name, qty], i) => {
                const maxQ = Math.max(...flavorSales.map(([, q]) => q), 1);
                const pct = (qty / maxQ) * 100;
                return (
                  <div key={name}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-700">{name}</span>
                      <span className="font-medium text-slate-800">{qty} units</span>
                    </div>
                    <motion.div
                      className="h-2 overflow-hidden rounded-full bg-slate-100"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        className="h-full rounded-full bg-amber-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                      />
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-violet-600" />
            <h3 className="font-semibold text-slate-800">Production Trends (Last 5)</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {productionLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="min-w-[120px] rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3"
              >
                <p className="text-xs text-slate-500">{formatDateTime(log.createdAt || log.date)}</p>
                <p className="font-semibold text-slate-800">{log.flavor}</p>
                <p className="text-sm text-slate-600">{log.quantity} units</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
