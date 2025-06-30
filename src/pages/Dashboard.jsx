import { useEffect, useState, useCallback } from "react";
import { FaQuestionCircle, FaHistory, FaArrowUp } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import AccountsPayableModal from "../components/AccountsPayableModal";
import RecurringDebtModal from "../components/RecurringDebtModal";
import {
  getFamilyById,
  getFamilyDebtById,
  getFamilyDebts,
  updateDebtPaymentStatus,
} from "../services/api";
import { useAuth } from "../hooks/useAuth";
import "../styles/Dashboard.css";
import DebtDetailsModal from "../components/DebtDetailsModal";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const [family, setFamily] = useState(null);
  const [debts, setDebts] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showLaunchAnimation, setShowLaunchAnimation] = useState(false);
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [debtToConfirm, setDebtToConfirm] = useState(null);
  const navigate = useNavigate();

  const fetchFamilyData = useCallback(async () => {
    if (!user?.familyId) return;
    try {
      const familyData = await getFamilyById(user.familyId);
      if (familyData) setFamily(familyData);
      const debtsSummary = await getFamilyDebts(user.familyId);
      if (debtsSummary?.length) {
        const detailedDebts = await Promise.all(
          debtsSummary.map((debt) =>
            getFamilyDebtById(user.familyId, debt.id)
          )
        );
        setDebts(detailedDebts.filter(Boolean));
      }
    } catch (error) {
      console.error("Erro ao buscar dados da família:", error);
    }
  }, [user?.familyId]);

  useEffect(() => {
    fetchFamilyData();
  }, [fetchFamilyData]);

  const markDebtAsPaid = async (debtId) => {
    try {
      await updateDebtPaymentStatus(user.familyId, debtId, "PAID");
      await fetchFamilyData();
      setShowCelebration(true);
      setShowConfirmModal(false);
      setTimeout(() => setShowCelebration(false), 3000);
    } catch (error) {
      console.error("Erro ao atualizar status da dívida:", error);
      alert("Erro ao tentar marcar dívida como quitada.");
    }
  };

  const filteredDebts = debts.filter((debt) => {
    if (!debt.dueDate) return false;
    const dueDate = new Date(debt.dueDate);
    return (
      dueDate.getFullYear() === selectedYear &&
      dueDate.getMonth() === selectedMonth
    );
  });

  const totalToPay = filteredDebts.reduce((acc, debt) => acc + debt.value, 0);
  const totalPaid = filteredDebts
    .filter((debt) => debt.paymentStatus.value === "PAID")
    .reduce((acc, debt) => acc + debt.value, 0);
  const totalOpen = totalToPay - totalPaid;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalOverdue = filteredDebts
    .filter((debt) => {
      const due = new Date(debt.dueDate);
      due.setHours(0, 0, 0, 0);
      return due < today && debt.paymentStatus.value !== "PAID";
    })
    .reduce((acc, debt) => acc + debt.value, 0);

  const getStatusInfo = (debt) => {
    const dueDate = new Date(debt.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    if (debt.paymentStatus.value === "PAID") {
      return { className: "status-paid", label: "Pago" };
    }
    if (dueDate < today) {
      return { className: "status-overdue", label: "Vencido" };
    }
    return { className: "status-open", label: "A Pagar" };
  };

  const handleDebtCreated = () => {
    fetchFamilyData();
    setShowLaunchAnimation(true);
    setTimeout(() => setShowLaunchAnimation(false), 3000);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        {showCelebration && (
          <div className="celebration-overlay">
            <div className="celebration-message">🎉 Conta quitada com sucesso!</div>
          </div>
        )}

        {showLaunchAnimation && (
          <div className="launch-animation-overlay">
            <div className="launch-animation-message">🚀 Conta lançada com sucesso!</div>
          </div>
        )}

        {!user?.familyId ? (
          <div className="no-family-container">
            <p>Você ainda não está vinculado a uma família.</p>
            <p>Para ser convidado, envie o seguinte código para quem irá te convidar:</p>
            <div className="hash-box">
              <code>{user?.inviteCode}</code>
            </div>
            <button className="create-family-btn" onClick={() => navigate("/create-family")}>
              Criar nova família
            </button>
          </div>
        ) : (
          <>
            <div className="family-section">
              <h3 className="family-name">Família: {family?.name || "Desconhecida"}</h3>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  className={`launch-debt-btn ${!user?.permissions?.includes("DEBT_ADD") ? "disabled-btn" : ""}`}
                  onClick={() => {
                    if (user?.permissions?.includes("DEBT_ADD")) {
                      setIsAccountsModalOpen(true);
                    }
                  }}
                  disabled={!user?.permissions?.includes("DEBT_ADD")}
                >
                  <FaArrowUp /> Nova Despesa
                </button>

                <button
                  className={`launch-debt-btn ${!user?.permissions?.includes("DEBT_ADD") ? "disabled-btn" : ""}`}
                  onClick={() => {
                    if (user?.permissions?.includes("DEBT_ADD")) {
                      setIsRecurringModalOpen(true);
                    }
                  }}
                  disabled={!user?.permissions?.includes("DEBT_ADD")}
                >
                  <FaHistory /> Despesa Recorrente
                </button>

              </div>
            </div>

            <div className="summary-container">
              <div className="summary-box summary-total">
                <h4>Total a Pagar</h4>
                <p>R$ {totalToPay.toFixed(2)}</p>
              </div>
              <div className="summary-box summary-paid">
                <h4>Total Quitado</h4>
                <p>R$ {totalPaid.toFixed(2)}</p>
              </div>
              <div className="summary-box summary-open">
                <h4>Total em Aberto</h4>
                <p>R$ {totalOpen.toFixed(2)}</p>
              </div>
              <div className="summary-box summary-today">
                <h4>Total Vencido</h4>
                <p>R$ {totalOverdue.toFixed(2)}</p>
              </div>
            </div>

            <div className="date-filter-container">
              <select
                className="year-selector"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              >
                {Array.from({ length: (new Date().getFullYear() + 5) - 2020 + 1 }, (_, i) => {
                  const year = 2020 + i;
                  return (
                    <option key={year} value={year}>{year}</option>
                  );
                })}
              </select>

              <div className="month-selector">
                {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((month, index) => (
                  <button
                    key={index}
                    className={`month-btn ${selectedMonth === index ? "selected" : ""}`}
                    onClick={() => setSelectedMonth(index)}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>

            <div className="family-info">
              <ul className="debt-list">
                {filteredDebts.length > 0 ? (
                  filteredDebts.map((debt) => {
                    const { className, label } = getStatusInfo(debt);
                    return (
                      <li key={debt.id} className="debt-item">
                        <div className="debt-info">
                          <div className="debt-title-row">
                            <span className="debt-title">{debt.title}</span>
                            <FaQuestionCircle
                              className="details-icon"
                              title="Ver detalhes"
                              onClick={() => setSelectedDebt(debt)}
                            />
                            <span className={`status-indicator ${className}`} data-tooltip={label} />
                          </div>
                          <div className="debt-meta">
                            <span className="debt-due-date">Vencimento: {new Date(debt.dueDate).toLocaleDateString()}</span>
                            <span className="debt-responsible">
                              Responsável: <strong>{debt.responsible?.name || "N/A"}</strong>
                            </span>
                          </div>
                        </div>
                        <div className="debt-actions">
                          <div className="debt-value">R$ {debt.value.toFixed(2)}</div>
                          {debt.paymentStatus.value !== "PAID" && (
                            <button
                              className="mark-paid-btn"
                              onClick={() => {
                                setDebtToConfirm(debt);
                                setShowConfirmModal(true);
                              }}
                            >
                              Marcar como Quitado
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <p className="no-debts-message">Nenhuma dívida encontrada no período selecionado.</p>
                )}
              </ul>
            </div>
          </>
        )}
      </div>

      {showConfirmModal && debtToConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Confirmar Quitação</h3>
            <p>Deseja realmente marcar esta dívida como quitada?</p>
            <div className="modal-actions">
              <button
                className="modal-btn confirm"
                onClick={() => markDebtAsPaid(debtToConfirm.id)}
              >
                Sim, Confirmar
              </button>
              <button
                className="modal-btn cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDebt && (
        <DebtDetailsModal
          debt={selectedDebt}
          familyId={user?.familyId} 
          onClose={() => setSelectedDebt(null)}
          onUpdate={fetchFamilyData}
        />
      )}

      <AccountsPayableModal
        isOpen={isAccountsModalOpen}
        onClose={() => setIsAccountsModalOpen(false)}
        familyId={user ? user.familyId : null}
        currentUserId={user ? user.id : null}
        onDebtCreated={handleDebtCreated}
      />

      <RecurringDebtModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        familyId={user ? user.familyId : null}
        currentUserId={user ? user.id : null}
        onRecurringCreated={handleDebtCreated}
      />
    </div>
  );
};

export default Dashboard;
