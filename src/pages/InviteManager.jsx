import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  createInvite,
  getFamilyInvites,
  getFamilyInviteById,
  cancelInvite
} from "../services/api";
import Sidebar from "../components/Sidebar";
import "../styles/InviteManager.css";

const InviteManager = () => {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadInvites = useCallback(async () => {
    if (!user?.familyId) return;
    try {
      setLoading(true);

      // Busca os convites resumidos
      const inviteSummaries = await getFamilyInvites(user.familyId);

      // Para cada convite, busca os detalhes completos com receiver
      const detailedInvites = await Promise.all(
        inviteSummaries.map(async (invite) => {
          const detailed = await getFamilyInviteById(user.familyId, invite.id);
          return detailed;
        })
      );

      setInvites(detailedInvites);
    } catch (err) {
      console.error("Erro ao carregar convites:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.familyId]);

  useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  const handleCreateInvite = async () => {
    if (!inviteCode.trim()) return;
    try {
      await createInvite(user.familyId, inviteCode);
      setInviteCode("");
      await loadInvites();
    } catch (err) {
      console.error("Erro ao criar convite:", err);
      setError("Código inválido ou usuário não encontrado.");
    }
  };

  const handleCancelInvite = async (inviteId) => {
    try {
      await cancelInvite(user.familyId, inviteId);
      await loadInvites();
    } catch (err) {
      console.error("Erro ao cancelar convite:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="invite-manager-container">
          <h2>📨 Gerenciar Convites</h2>

          <div className="invite-form">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Código de convite do usuário"
            />
            <button onClick={handleCreateInvite}>Convidar</button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <h3>📋 Convites Enviados</h3>

          {loading ? (
            <p className="loading-message">Carregando convites...</p>
          ) : invites.length === 0 ? (
            <p className="no-invites">Nenhum convite enviado ainda.</p>
          ) : (
            <div className="invite-scroll-wrapper">
              <ul className="invite-list">
                {invites.map((invite) => {
                  const statusValue = invite.status?.value?.toUpperCase?.();
                  const statusFriendly = invite.status?.friendlyName || "Status desconhecido";

                  return (
                    <li key={invite.id} className="invite-item">
                      <div>
                        <strong>Destinatário:</strong> {invite.receiver?.name || "N/A"}<br />
                        <span className={`status ${statusValue?.toLowerCase() || "indefinido"}`}>
                          {statusFriendly}
                        </span>
                      </div>

                      {statusValue === "PENDING" && (
                        <button
                          className="cancel-btn"
                          onClick={() => handleCancelInvite(invite.id)}
                        >
                          Cancelar
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteManager;
