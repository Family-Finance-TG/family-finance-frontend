import React, { useState, useEffect } from "react";
import {
  updateFamilyDebt,
  getFamilyWithMembers,
  deleteFamilyDebt,
} from "../services/api";
import "../styles/DebtDetailsModal.css";
import { useAuth } from "../hooks/useAuth";

const DebtDetailsModal = ({ debt, familyId, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [responsibleId, setResponsibleId] = useState("");
  const [members, setMembers] = useState([]);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (debt) {
      setTitle(debt.title || "");
      setValue(debt.value || "");
      setDueDate(debt.dueDate?.slice(0, 10) || "");
      setDescription(debt.description || "");
      setResponsibleId(debt.responsible?.id || "");
    }
  }, [debt]);

  useEffect(() => {
  const fetchMembers = async () => {
    try {
      const res = await getFamilyWithMembers(familyId);
        if (res && Array.isArray(res.members)) {
          const ativos = res.members.filter((m) => m.active);
          setMembers(ativos);
        }
    } catch (err) {
      console.error("Erro ao buscar membros da família", err);
    }
  };
  fetchMembers();
}, [familyId]);


  const handleUpdate = async () => {
    try {
      const formattedDate = new Date(dueDate).toISOString();
      await updateFamilyDebt(familyId, debt.id, {
        title,
        description,
        value: parseFloat(value),
        dueDate: formattedDate,
        responsibleId,
      });
      onUpdate();
      setIsEditing(false);
    } catch (err) {
      alert("Erro ao atualizar dívida.");
    }
  };

  const handleDeleteConfirmed = async () => {
    try {
      await deleteFamilyDebt(familyId, debt.id);
      setIsDeleted(true);
      setTimeout(() => {
        setIsDeleted(false);
        onUpdate();
        onClose();
      }, 1500);
    } catch (err) {
      alert("Erro ao excluir dívida.");
    }
  };

  if (!debt) return null;

  return (
    <div className="debt-modal-overlay">
      <div className="debt-modal-container">
        <h2 className="modal-title">📋 Detalhes da Dívida</h2>

        <div className="modal-content">
          {isEditing ? (
            <form className="form-grid">
              <div className="form-group">
                <label>Título:</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Valor:</label>
                <input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Vencimento:</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Responsável:</label>
                <select value={responsibleId} onChange={(e) => setResponsibleId(e.target.value)}>
                  <option value="">Selecione</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Observações:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </form>
          ) : (
            <div className="details-display">
              <p><strong>Título:</strong> {title}</p>
              <p><strong>Valor:</strong> R$ {Number(value).toFixed(2)}</p>
              <p><strong>Vencimento:</strong> {new Date(dueDate).toLocaleDateString()}</p>
              <p><strong>Responsável:</strong> {debt.responsible?.name || "N/A"}</p>
              <p><strong>Observações:</strong> {description?.trim() || "Nenhuma observação registrada."}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {isEditing ? (
            <>
              <button className="btn primary" onClick={handleUpdate}>Salvar</button>
              <button className="btn danger" onClick={() => setIsEditing(false)}>Cancelar</button>
            </>
          ) : (
            <>
              {user?.permissions?.includes("DEBT_EDIT") ? (
                <button className="btn primary" onClick={() => setIsEditing(true)}>Editar</button>
              ) : (
                <button className="btn primary btn-disabled" disabled>Editar</button>
              )}

              {user?.permissions?.includes("DEBT_DELETE") ? (
                <button className="btn danger" onClick={() => setShowConfirmDelete(true)}>🗑️ Excluir</button>
              ) : (
                <button className="btn danger btn-disabled" disabled>🗑️ Excluir</button>
              )}
            </>
          )}
          <button className="btn neutral" onClick={onClose}>Fechar</button>
        </div>
      </div>

      {showConfirmDelete && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>Tem certeza que deseja excluir este lançamento?</p>
            <div className="confirm-buttons">
              <button className="btn primary" onClick={handleDeleteConfirmed}>Confirmar</button>
              <button className="btn neutral" onClick={() => setShowConfirmDelete(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {isDeleted && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>✅ Lançamento excluído com sucesso!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtDetailsModal;
