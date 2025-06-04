import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Link from '../components/Link';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Login.css';

const LoginPage = () => {
  const [accessName, setAccessName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // 🔄 Adicionado estado de carregamento
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(accessName, password);
      console.log("✅ Login bem-sucedido:", response);

      if (response && response.user) {
        if (response.user.id) {
          localStorage.setItem("userId", response.user.id);
          navigate('/dashboard');
        } else {
          console.error("⚠ Erro: `userId` ausente na resposta.");
          setError("Erro ao recuperar os dados do usuário.");
        }
      } else {
        console.error("⚠ Erro: Estrutura inesperada na resposta da API", response);
        setError("Erro ao autenticar. Verifique seus dados e tente novamente.");
      }
    } catch (error) {
      console.error("❌ Erro ao fazer login:", error);
      setError("Falha na autenticação. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleLogin}>
          <InputField
            label="Nome de Acesso"
            type="text"
            value={accessName}
            onChange={(e) => setAccessName(e.target.value)}
            placeholder="Digite seu nome de acesso"
            required
          />
          <InputField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
            required
          />
          {error && <p className="error-message">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <Link to="/signup" className="signup-link">
          Cadastrar-se
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
