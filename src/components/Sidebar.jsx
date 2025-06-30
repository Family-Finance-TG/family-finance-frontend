import React, { useEffect, useState } from "react";
import {
  FaHome,
  FaSignOutAlt,
  FaUser,
  FaUsers,
  FaUserPlus,
  FaUserCheck,
  FaDoorOpen,
  FaChartBar,
  FaIdBadge
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getUserById, leaveFamily } from "../services/api";
import "../styles/Sidebar.css";
import { FaUserShield } from "react-icons/fa";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        const userData = await getUserById(userId);
        setUser(userData);
      } catch (error) {
      }
    };
    fetchUser();
  }, []);

  const handleLeaveConfirmed = async () => {
  try {
    await leaveFamily(user.id);
    setConfirmLeave(false); 
    setShowSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    const message = error?.response?.data?.message || "Erro ao sair da família.";
    alert(message); 
  }
};
  

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-header">
          <FaUser className="user-icon" />
          <span className="user-name">{user ? user.name : "Usuário"}</span>
        </div>

        <ul className="sidebar-menu">
          <li
            className={location.pathname === "/dashboard" ? "active" : ""}
            onClick={() => navigate("/dashboard")}
          >
            <FaHome /> Painel
          </li>

          <li
            className={`${
              !user?.familyId || !user?.permissions?.includes("MEMBER_INVITE") ? "disabled" : ""
            } ${location.pathname === "/invites" ? "active" : ""}`}
            onClick={() => {
              if (!user?.familyId) {
                alert("Você não está vinculado a uma família.");
                return;
              }
              if (!user?.permissions?.includes("MEMBER_INVITE")) {
                alert("Você não tem permissão para convidar membros.");
                return;
              }
              navigate("/invites");
            }}
          >
            <FaUserPlus /> Convidar
          </li>


          {user?.familyId && (
            <li
              className={location.pathname === "/analytics" ? "active" : ""}
              onClick={() => navigate("/analytics")}
            >
              <FaChartBar /> Análises
            </li>
          )}

          {!user?.familyId && (
            <li
              className={location.pathname === "/received-invites" ? "active" : ""}
              onClick={() => navigate("/received-invites")}
            >
              <FaUserCheck /> Convites
            </li>
          )}

          <li
            className={location.pathname === "/profile" ? "active" : ""}
            onClick={() => navigate("/profile")}
          >
            <FaIdBadge /> Perfil
          </li>
        

        <li
          className={`${!user?.familyId || !user?.permissions?.includes("PERMISSION_MANAGE") ? "disabled" : ""} ${location.pathname === "/permissions" ? "active" : ""}`}
          onClick={() => {
            if (!user?.familyId || !user?.permissions?.includes("PERMISSION_MANAGE")) {
              alert("Você não tem permissão para acessar.");
              return;
            }
            navigate("/permissions");
          }}
        >
          <FaUserShield /> Permissões
        </li>
        <li
          className={`${!user?.familyId ? "disabled" : ""} ${location.pathname === "/family-members" ? "active" : ""}`}
          onClick={() => {
            if (!user?.familyId) {
              alert("Você não está vinculado a uma família.");
              return;
            }
            navigate("/family-members");
          }}
        >
          <FaUsers /> Família
        </li>


        </ul>


        <div className="sidebar-footer">
          {user?.familyId && (
            <button className="leave-family-btn" onClick={() => setConfirmLeave(true)}>
              <FaDoorOpen /> Sair da Família
            </button>
          )}

          <button
            className="logout-btn"
            onClick={() => {
              logout();
              localStorage.removeItem("userId");
              navigate("/login");
            }}
          >
            <FaSignOutAlt /> Sair
          </button>
        </div>
      </div>

      {confirmLeave && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>Tem certeza que deseja sair da família?</p>
            <div className="confirm-buttons">
              <button className="btn primary" onClick={handleLeaveConfirmed}>Confirmar</button>
              <button className="btn neutral" onClick={() => setConfirmLeave(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="confirm-overlay fade-out">
          <div className="success-animation">
            <p>👋 Até logo! Você saiu da família.</p>
          </div>
        </div>
      )}

    </>
  );
};

export default Sidebar;
