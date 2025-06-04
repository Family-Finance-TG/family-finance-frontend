import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { getUserInvites, acceptInvite, rejectInvite } from "../services/api";
import Sidebar from "../components/Sidebar";
import "../styles/InviteManager.css";

const ReceivedInvites = () => {
  const { user } = useAuth();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadReceivedInvites = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await getUserInvites(user.id); // ✅ import corrigido
      setInvites(data);
    } catch (err) {
      console.error("Erro ao carregar convites recebidos:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadReceivedInvites();
  }, [loadReceivedInvites]);

  const handleAccept = async (inviteId) => {
    try {
      await acceptInvite(user.id, inviteId);
      await loadReceivedInvites();
      window.location.reload();
    } catch (err) {
      console.error("Erro ao aceitar convite:", err);
    }
  };

  const handleReject = async (inviteId) => {
    try {
      await rejectInvite(user.id, inviteId);
      await loadReceivedInvites();
    } catch (err) {
      console.error("Erro ao rejeitar convite:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="invite-manager-container">
          <h2>📥 Convites Recebidos</h2>

          {loading ? (
            <p className="loading-message">Carregando convites...</p>
          ) : invites.length === 0 ? (
            <p className="no-invites">Você não recebeu nenhum convite ainda.</p>
          ) : (
            <div className="invite-scroll-wrapper">
              <ul className="invite-list">
                {invites.map((invite) => (
                  <li key={invite.id} className="invite-item">
                    <div>
                      <strong>Família:</strong> {invite.family?.name || "N/A"}<br />
                      <span className={`status ${invite.status?.value?.toLowerCase?.() || "indefinido"}`}>
                        {invite.status?.friendlyName || "Status desconhecido"}
                      </span>
                    </div>
                    {invite.status?.value === "PENDING" && (
                      <div className="invite-actions">
                        <button className="accept-btn" onClick={() => handleAccept(invite.id)}>
                          Aceitar
                        </button>
                        <button className="reject-btn" onClick={() => handleReject(invite.id)}>
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceivedInvites;
