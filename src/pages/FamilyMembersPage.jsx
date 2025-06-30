import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import {
  getFamilyWithMembers,
  getUserById,
} from "../services/api";
import "../styles/FamilyPage.css";

const FamilyMembersPage = () => {
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [creatorId, setCreatorId] = useState(null);

  useEffect(() => {
    async function loadData() {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const user = await getUserById(userId);
      setCurrentUser(user);

      if (!user?.familyId) return;

      try {
        const family = await getFamilyWithMembers(user.familyId);
        const ativos = (family?.members || []).filter((m) => m.active);
        setMembers(ativos);
        setCreatorId(family.creatorId);
      } catch (err) {
        console.error("Erro ao buscar membros da família:", err);
      }
    }

    loadData();
  }, []);

  const handleRemove = async (userId) => {
    const confirm = window.confirm("Deseja realmente remover este membro?");
    if (!confirm) return;

    try {
      await api.delete(`/families/${currentUser.familyId}/users/${userId}`);
      window.location.reload();
    } catch (err) {
      alert("Erro ao remover usuário.");
    }
  };

  const hasRemovePermission = currentUser?.permissions?.includes("MEMBER_REMOVE");

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <h2 className="family-page-title">👨‍👩‍👧‍👦 Membros da Família</h2>

        {!currentUser?.familyId ? (
          <p style={{ color: "red" }}>Você não está vinculado a uma família.</p>
        ) : (
          <table className="family-table">
            <thead>
              <tr>
                <th>Nome</th>
                {hasRemovePermission && <th className="actions-cell">Ações</th>}
              </tr>
            </thead>
             <tbody>
                    {members.map((m) => (
                      <tr key={m.id}>
                        <td>{m.name}</td>
                        {hasRemovePermission && (
                      <td className="actions-cell">
                        {m.id !== creatorId && (
                          <button className="remove-btn" onClick={() => handleRemove(m.id)}>
                            Remover
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FamilyMembersPage;
