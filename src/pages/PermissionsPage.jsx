import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getFamilyWithMembers, updateMemberPermissions, getUserById } from "../services/api";
import "../styles/PermissionsPage.css";

const permissionList = [
  { key: "canAdd", label: "Adicionar Lançamentos" },
  { key: "canEdit", label: "Editar Lançamentos" },
  { key: "canDelete", label: "Excluir Lançamentos" },
  { key: "canInvite", label: "Convidar Membros" },
  { key: "canRemove", label: "Expulsar Membros" },
];

const PermissionsPage = () => {
  const [members, setMembers] = useState([]);
  const [creatorId, setCreatorId] = useState(null);
  const [familyId, setFamilyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setError("Usuário não encontrado.");
          setLoading(false);
          return;
        }

        const user = await getUserById(userId);
        if (!user?.familyId) {
          setError("Você não está vinculado a uma família.");
          setLoading(false);
          return;
        }

        const family = await getFamilyWithMembers(user.familyId);
        if (family?.members) {
          const ativos = family.members.filter((m) => m.active);
          setMembers(ativos);
          setCreatorId(family.creatorId);
          setFamilyId(family.id);
        }

      } catch (err) {
        console.error("Erro ao buscar membros da família:", err);
        setError("Erro ao carregar membros da família.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const togglePermission = async (memberId, permissionKey) => {
    const updatedMembers = members.map((m) => {
      if (m.id === memberId) {
        const updatedPerms = {
          ...m.permissions,
          [permissionKey]: !m.permissions?.[permissionKey],
        };
        return { ...m, permissions: updatedPerms };
      }
      return m;
    });

    setMembers(updatedMembers);

    try {
      const member = updatedMembers.find((m) => m.id === memberId);
      await updateMemberPermissions(familyId, memberId, member.permissions);
    } catch (err) {
      console.error("Erro ao atualizar permissões:", err);
      setError("Falha ao salvar permissões.");
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <h2>
          <span role="img" aria-label="lock" style={{ fontSize: "1.8rem" }}>🔐</span>
          Gerenciar Permissões
        </h2>

        {loading ? (
          <p>Carregando...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <table className="permissions-table">
            <thead>
              <tr>
                <th>Membro</th>
                {permissionList.map((perm) => (
                  <th key={perm.key}>{perm.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className={member.id === creatorId ? "creator-row" : ""}
                >
                  <td style={{ fontWeight: member.id === localStorage.getItem("userId") ? "bold" : "normal" }}>
                    {member.name}
                  </td>
                  {permissionList.map((perm) => (
                    <td key={perm.key}>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={member.id === creatorId ? true : member.permissions?.[perm.key] || false}
                          onChange={() => togglePermission(member.id, perm.key)}
                          disabled={member.id === creatorId}
                        />
                        <span className="slider round"></span>
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PermissionsPage;
