import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const apiPublic = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// ✅ Adiciona automaticamente o token nas requisições autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Função para login
export const login = async (credentials) => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    delete api.defaults.headers.common["Authorization"];

    const response = await api.post("/auth/signin", credentials);

    if (response.data?.data?.accessToken) {
      const accessToken = response.data.data.accessToken;

      // Salva token e configura autenticação
      localStorage.setItem("token", accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      // Obtém os dados do usuário
      const userResponse = await getUserById(response.data.data.userId);
      return { token: accessToken, user: userResponse || null };
    }

    return null;
  } catch (error) {
    console.error("❌ Erro ao fazer login:", error);
    throw error;
  }
};

// ✅ Função de logout
export const logout = async () => {
  try {
    await api.post("/auth/signout");
  } catch (error) {
    console.error("❌ Erro ao fazer logout:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    delete api.defaults.headers.common["Authorization"];
  }
};

// ✅ Busca um usuário pelo ID e sua família
export const getUserById = async (userId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    const response = await api.get(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userData = response.data.data;

    if (userData.familyId) {
      // 🔍 Busca a família do usuário imediatamente
      const familyData = await getFamilyById(userData.familyId);
      return { ...userData, family: familyData };
    }

    return userData;
  } catch (error) {
    console.error(`Erro ao buscar usuário ID ${userId}:`, error.response ? error.response.data : error);
    return null;
  }
};

// ✅ Busca uma família pelo ID correto
export const getFamilyDebtById = async (familyId, debtId) => {
  try {
    const response = await api.get(`/families/${familyId}/debts/${debtId}`);
    return response.data.data;
  } catch (error) {
    return null;
  }
};

export const getFamilyById = async (familyId) => {
  try {
    const response = await api.get(`/families/${familyId}`);
    return response.data.data;
  } catch (error) {
    return null;
  }
};

// ✅ Busca gêneros (usando API pública)
export const getGenders = async () => {
  try {
    const response = await apiPublic.get("/genders");
    return response.data.data;
  } catch (error) {
    console.error("Erro ao buscar gêneros:", error);
    throw error;
  }
};

// ✅ Cadastra um novo usuário
export const signup = async (userData) => {
  try {
    const response = await apiPublic.post("/auth/signup", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (userId, data) => {
  try {
    const response = await api.put(`/users/${userId}`, data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// ✅ Cria uma nova família
export const createFamily = async (familyData) => {
  try {
    const response = await api.post("/families", familyData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ✅ Cria uma dívida para uma família
export const createFamilyDebt = async (familyId, debtData) => {
  try {
    const response = await api.post(`/families/${familyId}/debts`, debtData);
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 403) {
      toast.error("Você não tem permissão para lançar contas.");
    } else {
      toast.error("Erro ao criar dívida.");
    }
    throw error;
  }
};

export const getFamilyDebts = async (familyId) => {
  try {
    const response = await api.get(`/families/${familyId}/debts`);
    return response.data.data; // Retorna os débitos da família
  } catch (error) {
    return null;
  }
};

// ✅ Atualiza o status de pagamento de uma dívida
export const updateDebtPaymentStatus = async (familyId, debtId, status) => {
  try {
    const response = await api.patch(
      `/families/${familyId}/debts/${debtId}/payment-status`,
      { value: status }
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getFamilyWithMembers = async (familyId) => {
  try {
    const response = await api.get(`/families/${familyId}/members`);
    return response.data.data; // <- se for um array direto
  } catch (error) {
    console.error("Erro ao buscar membros da família:", error);
    return [];
  }
};

export const getFamilyInvites = async (familyId) => {
  try {
    const response = await api.get(`/families/${familyId}/invites`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const cancelInvite = async (familyId, inviteId) => {
  try {
    const response = await api.patch(
      `/families/${familyId}/invites/${inviteId}/cancel`
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// função para buscar os detalhes dos lancamentos
export const getUserInvites = async (userId) => {
  try {
    const summaryResponse = await api.get(`/users/${userId}/invites`);
    const summaries = summaryResponse.data.data;

    // 🔁 Carrega os detalhes completos com status e receiver
    const detailed = await Promise.all(
      summaries.map(async (invite) => {
        const res = await api.get(`/families/${invite.family.id}/invites/${invite.id}`);
        return res.data.data;
      })
    );

    return detailed;
  } catch (error) {
    console.error("Erro ao buscar convites recebidos detalhados:", error);
    return [];
  }
};


export const acceptInvite = async (userId, inviteId) => {
  try {
    await api.patch(`/users/${userId}/invites/${inviteId}/accept`);
  } catch (error) {
    throw error;
  }
};

export const rejectInvite = async (userId, inviteId) => {
  try {
    await api.patch(`/users/${userId}/invites/${inviteId}/reject`);
  } catch (error) {
    throw error;
  }
};

export const createInvite = async (familyId, receiverInviteCode) => {
  try {
    const response = await api.post(`/families/${familyId}/invites`, {
      receiverInviteCode,
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getFamilyInviteById = async (familyId, inviteId) => {
  try {
    const response = await api.get(`/families/${familyId}/invites/${inviteId}`);
    return response.data.data;
  } catch (error) {
    console.error("Erro ao buscar detalhes do convite:", error);
    return null;
  }
};

export const leaveFamily = async (userId) => {
  try {
    await api.patch(`/users/${userId}/leave-family`);
  } catch (error) {
    console.error("Erro ao sair da família:", error);
    throw error;
  }
};

export const updateFamilyDebt = async (familyId, debtId, data) => {
  try {
    const response = await api.patch(`/families/${familyId}/debts/${debtId}`, data);
    return response.data.data;
  } catch (error) {
    console.error("Erroooo ao atualizar dívida:", error.response?.data || error);
    throw error;
  }
};




export const deleteFamilyDebt = async (familyId, debtId) => {
  const response = await api.delete(`/families/${familyId}/debts/${debtId}`);
  return response.data.data;
};


export async function createRecurringDebts(familyId, data) {
  try {
    const response = await api.post(`/families/${familyId}/debts/recurring`, data);
    return response.data.data;
  } catch (error) {
    console.error("Erro ao lançar contas recorrentes:", error.response || error);
    throw new Error("Erro ao lançar contas recorrentes");
  }
}

//Deletar Usuário
export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// Atualiza permissões 
export const updateMemberPermissions = async (familyId, memberId, permissions) => {
  try {
    const response = await api.patch(`/families/${familyId}/members/${memberId}/permissions`, permissions);
    return response.data.data;
  } catch (error) {
    console.error("Erro ao atualizar permissões:", error.response?.data || error);
    throw error;
  }
};


export default api;
