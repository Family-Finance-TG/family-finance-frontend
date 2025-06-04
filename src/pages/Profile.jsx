import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  getUserById,
  updateUser,
  getGenders,
  deleteUser,
  logout
} from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Profile.css";
import { leaveFamily } from "../services/api";

const formatCPF = (cpf) => {
  if (!cpf) return "";
  const cleaned = cpf.replace(/\D/g, "").slice(0, 11);
  return cleaned
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const cleanCPF = (cpf) => cpf.replace(/\D/g, "");

const Profile = () => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [genders, setGenders] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showGoodbye, setShowGoodbye] = useState(false);

  useEffect(() => {
    const load = async () => {
      const userId = localStorage.getItem("userId");
      const user = await getUserById(userId);
      const genderList = await getGenders();

      setGenders(genderList);

      setForm({
        ...user,
        cpf: formatCPF(user.cpf),
        gender: user.gender?.value || "",
        salary: user.salary?.toString() || "",
        percentageSalary: user.percentageSalary?.toString() || "",
      });

      setLoading(false);
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async () => {
    const updatedForm = { ...form };
    updatedForm.cpf = cleanCPF(updatedForm.cpf);
    updatedForm.salary = parseFloat(updatedForm.salary.replace(",", ".")) || 0;
    updatedForm.percentageSalary = parseFloat(updatedForm.percentageSalary) || 0;
    const selectedGender = genders.find((g) => g.value === form.gender);
    updatedForm.gender = selectedGender || null;

    try {
      const userId = localStorage.getItem("userId");
      await updateUser(userId, updatedForm);
      toast.success("Perfil atualizado com sucesso!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar perfil.");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const userId = localStorage.getItem("userId");
      await leaveFamily(userId); 
      await deleteUser(userId);
      setConfirmDelete(false);
      setShowGoodbye(true);
      setTimeout(async () => {
        await logout();
        window.location.href = "/login";
      }, 1800);
    } catch (error) {
      toast.error("Erro ao excluir conta.");
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="profile-page">
      <Sidebar />
      <div className="profile-container">
        <h2 className="profile-title"><i className="fas fa-user"></i> Meu Perfil</h2>

        <div className="profile-form">
          <label>Nome:</label>
          <input name="name" value={form.name || ""} onChange={handleChange} />

          <label>CPF:</label>
          <input name="cpf" value={form.cpf || ""} onChange={handleChange} disabled />

          <label>Gênero:</label>
          <select name="gender" value={form.gender || ""} onChange={handleChange}>
            <option value="">Selecione</option>
            {genders.map((g) => (
              <option key={g.value} value={g.value}>
                {g.friendlyName}
              </option>
            ))}
          </select>

          <label>Salário (R$):</label>
          <input name="salary" type="text" value={form.salary || ""} onChange={handleChange} />

          <label>% do Salário:</label>
          <input name="percentageSalary" type="text" value={form.percentageSalary || ""} onChange={handleChange} />

          <div className="button-group">
            <button className="primary-btn" onClick={handleSubmit}>Salvar Alterações</button>
            <button className="secondary-btn" onClick={() => setConfirmDelete(true)}>Excluir Conta</button>
          </div>
        </div>
      </div>

      {/* Modal de confirmação */}
      {confirmDelete && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>Tem certeza que deseja excluir sua conta?</p>
            <div className="confirm-buttons">
              <button className="btn primary" onClick={handleConfirmDelete}>Confirmar</button>
              <button className="btn neutral" onClick={() => setConfirmDelete(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Animação de despedida */}
      {showGoodbye && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>👋 Até logo! Sua conta foi excluída com sucesso.</p>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Profile;
