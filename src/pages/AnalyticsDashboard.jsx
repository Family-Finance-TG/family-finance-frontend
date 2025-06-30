import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts";
import { getFamilyDebts, getFamilyDebtById } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import "../styles/Analytics.css";

const COLORS = ["#28a745", "#ffc107"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [debtData, setDebtData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.familyId) return;
      const summary = await getFamilyDebts(user.familyId);
      const detailed = await Promise.all(
        summary.map((d) => getFamilyDebtById(user.familyId, d.id))
      );
      setDebtData(detailed.filter(Boolean));
    };
    fetchData();
  }, [user, selectedMonth]);

  const filteredDebts = debtData.filter((d) => {
    const due = new Date(d.dueDate);
    return due.getMonth() === selectedMonth;
  });

  const paidVsOpen = [
    {
      name: "Pagas",
      value: filteredDebts.filter((d) => d.paymentStatus.value === "PAID").length,
    },
    {
      name: "Em aberto",
      value: filteredDebts.filter((d) => d.paymentStatus.value !== "PAID").length,
    },
  ];

  const amountByResponsible = filteredDebts.reduce((acc, d) => {
    const name = d.responsible?.name || "N/A";
    acc[name] = (acc[name] || 0) + d.value;
    return acc;
  }, {});
  const barByResponsible = Object.entries(amountByResponsible).map(([name, total]) => ({
    name, total
  }));

  const amountByDay = filteredDebts.reduce((acc, d) => {
    const day = new Date(d.dueDate).getDate();
    acc[day] = (acc[day] || 0) + d.value;
    return acc;
  }, {});
  const lineByDay = Object.entries(amountByDay).map(([day, total]) => ({
    day: `Dia ${day}`, total
  }));

  const amountByTitle = filteredDebts.reduce((acc, d) => {
    const key = d.title || "Sem título";
    acc[key] = (acc[key] || 0) + d.value;
    return acc;
  }, {});
  const barByTitle = Object.entries(amountByTitle).map(([title, total]) => ({
    name: title, total
  }));

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <h2 className="analytics-title">📊 Análise Financeira da Família</h2>
          <div className="filter-select">
            <label htmlFor="month">Mês:</label>
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

        <div className="analytics-layout">
          <div className="chart-panel analytics-box-1">
            <p>Total de Contas</p>
            <h3>{filteredDebts.length}</h3>
          </div>
          <div className="chart-panel analytics-box-2">
            <p>Contas Pagas</p>
            <h3>{paidVsOpen[0].value}</h3>
          </div>
          <div className="chart-panel analytics-box-3">
            <p>Em Aberto</p>
            <h3>{paidVsOpen[1].value}</h3>
          </div>

          <div className="chart-panel analytics-chart-1">
            <h4>Status das Contas</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={paidVsOpen} dataKey="value" nameKey="name" label>
                  {paidVsOpen.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-panel analytics-chart-2">
            <h4>Total por Responsável</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barByResponsible}>
                <XAxis dataKey="name" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip formatter={(value) => value.toFixed(2)} />
                <Legend />
                <Bar dataKey="total" fill="#00bfa5" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-panel analytics-chart-3">
            <h4>Total por Dia do Mês</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineByDay}>
                <XAxis dataKey="day" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip formatter={(value) => value.toFixed(2)} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#4dd0e1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-panel analytics-chart-4">
            <h4>Total por Tipo de Conta</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barByTitle}>
                <XAxis dataKey="name" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip formatter={(value) => value.toFixed(2)} />
                <Legend />
                <Bar dataKey="total" fill="#ffc107" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
