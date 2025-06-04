import { useState } from "react";
import { createFamily } from "../services/api";
import Sidebar from "../components/Sidebar";
import "../styles/CreateFamily.css";

const CreateFamily = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createFamily({ name });
      setSuccess("Família criada com sucesso! Redirecionando...");
      setTimeout(() => {
        window.location.href = "/dashboard"; // força o reload da página
      }, 1500);
    } catch (err) {
      console.error("Erro ao criar família:", err);
      setError("Erro ao criar família. Tente novamente.");
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="create-family-box">
          <h2 className="create-title">🏡 Criar Nova Família</h2>

          <form className="create-family-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="family-input"
              placeholder="Nome da família"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button type="submit" className="create-btn" disabled={loading}>
              {loading ? "Criando..." : "Criar Família"}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>
      </div>
    </div>
  );
};

export default CreateFamily;
