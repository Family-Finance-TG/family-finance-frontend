import React, { useState, useEffect } from "react";
import { 
  FaTint, 
  FaBolt, 
  FaWifi, 
  FaBuilding, 
  FaQuestion, 
  FaGasPump, 
  FaPhone, 
  FaShieldAlt, 
  FaTools 
} from "react-icons/fa";
import { createFamilyDebt, getFamilyWithMembers } from "../services/api";
import "../styles/AccountsPayableModal.css";

const titleOptions = [
  { label: "Água", value: "Água", icon: <FaTint /> },
  { label: "Energia", value: "Energia", icon: <FaBolt /> },
  { label: "Internet", value: "Internet", icon: <FaWifi /> },
  { label: "IPTU", value: "IPTU", icon: <FaBuilding /> },
  { label: "Gás", value: "Gás", icon: <FaGasPump /> },
  { label: "Telefone", value: "Telefone", icon: <FaPhone /> },
  { label: "Seguro", value: "Seguro", icon: <FaShieldAlt /> },
  { label: "Manutenção", value: "Manutenção", icon: <FaTools /> },
  { label: "Outros", value: "Outros", icon: <FaQuestion /> },
];

const AccountsPayableModal = ({ isOpen, onClose, familyId, currentUserId, onDebtCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [error, setError] = useState("");
  const [responsibleId, setResponsibleId] = useState("");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!isOpen || !familyId) return;

    const fetchMembers = async () => {
      try {
        const family = await getFamilyWithMembers(familyId);
        if (family?.members) {
          const ativos = family.members.filter((m) => m.active);
          setMembers(ativos);
        }

      } catch (err) {
        console.error("Erro ao buscar membros da família:", err);
      }
    };

    fetchMembers();
  }, [familyId, isOpen]);

  // 🔁 Limpa todos os campos do formulário sempre que o modal for aberto
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setValue("");
      setDueDate("");
      setSelectedIcon("");
      setError("");
      setResponsibleId("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedDueDate = new Date(dueDate).toISOString().split("T")[0] + "T00:00:00";

      const debtData = {
        title,
        description,
        value: parseFloat(value),
        creatorId: currentUserId,
        responsibleId,
        dueDate: formattedDueDate,
        paymentStatus: "TO_PAY",
        icon: selectedIcon,
      };

      await createFamilyDebt(familyId, debtData);
      onDebtCreated();
      onClose();
    } catch (err) {
      console.error("Erro ao criar dívida:", err);
      setError("Erro ao criar conta a pagar.");
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    const option = titleOptions.find(opt => opt.value === e.target.value);
    if (option) {
      setSelectedIcon(option.value);
    } else {
      setSelectedIcon("");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Lançar Conta a Pagar</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título</label>
            <input
              type="text"
              list="title-options"
              value={title}
              onChange={handleTitleChange}
              placeholder="Selecione ou digite um título"
              required
            />
            <datalist id="title-options">
              {titleOptions.map((opt) => (
                <option key={opt.value} value={opt.value} />
              ))}
            </datalist>
          </div>

          <div className="form-group icon-selection">
            <label>Ícone</label>
            <div className="icon-options">
              {titleOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  className={`icon-btn ${selectedIcon === opt.value ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedIcon(opt.value);
                    setTitle(opt.value);
                  }}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Valor</label>
            <input
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Data de Vencimento</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Responsável</label>
            <select
              value={responsibleId}
              onChange={(e) => setResponsibleId(e.target.value)}
              required
            >
              <option value="">Selecione um membro</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="modal-buttons">
            <button type="submit">Lançar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountsPayableModal;
