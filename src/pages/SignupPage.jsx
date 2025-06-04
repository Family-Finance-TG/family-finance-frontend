import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Link from '../components/Link';
import { getGenders, signup } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Login.css';

const cleanCPF = (cpf) => cpf.replace(/\D/g, '');
const SignupPage = () => {
  const [step, setStep] = useState(1); // Etapa atual do cadastro
  const navigate = useNavigate();

  // Estado para a primeira etapa
  const [accessName, setAccessName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estado para a segunda etapa
  const [name, setName] = useState(''); // Movido para a segunda etapa
  const [dateBirth, setDateBirth] = useState('');
  const [salary, setSalary] = useState('');
  const [percentageSalary, setPercentageSalary] = useState('');
  const [cpf, setCpf] = useState('');
  const [gender, setGender] = useState('');
  const [genders, setGenders] = useState([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGenders = async () => {
      try {
        const data = await getGenders();
        setGenders(data);
      } catch (error) {
        console.error('Erro ao buscar gêneros:', error);
        setError('Erro ao carregar gêneros. Tente novamente.');
      }
    };
    fetchGenders();
  }, []);

  // Função para converter a data para LocalDateTime esperado pelo backend
  const formatDateTime = (date) => {
    return `${date}T00:00:00`; // Adiciona a hora para compatibilidade com LocalDateTime
  };

  // Validação antes de avançar
  const validateStep1 = () => {
    if (!accessName || !password || !confirmPassword) {
      setError('Preencha todos os campos.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return false;
    }
    return true;
  };

  const formatCPF = (value) => {
    let cpf = value.replace(/\D/g, ''); // Remove caracteres não numéricos
    cpf = cpf.slice(0, 11); // Limita a 11 caracteres
  
    // Aplica a formatação: 000.000.000-00
    if (cpf.length <= 3) {
      return cpf;
    } else if (cpf.length <= 6) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
    } else if (cpf.length <= 9) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
    } else {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
    }
  };
  

  const handleNextStep = () => {
    if (validateStep1()) {
      setError('');
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !dateBirth || !salary || !percentageSalary || !cpf || !gender) {
      setError('Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const selectedGender = genders.find((g) => g.value === gender); // Garante value e friendlyName

      const userData = {
        name, // Movido para a segunda etapa
        accessName,
        password,
        dateBirth: formatDateTime(dateBirth), // Formata a data corretamente
        salary: parseFloat(salary),
        percentageSalary: parseFloat(percentageSalary),
        cpf: cleanCPF(cpf),
        gender: selectedGender, // Inclui value e friendlyName corretamente
      };

      await signup(userData);
      navigate('/login');
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setError('Erro ao cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Cadastre-se</h2>

        {step === 1 && (
          <>
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
            <InputField
              label="Confirmar Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua senha"
              required
            />
            {error && <p className="error-message">{error}</p>}
            <Button onClick={handleNextStep}>Próximo</Button>
          </>
        )}

        {step === 2 && (
          <>
            <InputField
              label="Nome Completo" // Movido para a segunda etapa
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome completo"
              required
            />
            <InputField
              label="Data de Nascimento"
              type="date"
              value={dateBirth}
              onChange={(e) => setDateBirth(e.target.value)}
              required
            />
            <InputField
              label="Salário"
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="Digite seu salário"
              required
            />
            <InputField
              label="Percentual de Salário"
              type="number"
              value={percentageSalary}
              onChange={(e) => setPercentageSalary(e.target.value)}
              placeholder="Digite o percentual do salário"
              required
            />
            <InputField
              label="CPF"
              type="text"
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              placeholder="Digite seu CPF"
              required
            />
            <div className="input-container">
              <label className="input-label">Gênero</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Selecione um gênero</option>
                {genders.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.friendlyName}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="error-message">{error}</p>}
            <Button onClick={handlePrevStep}>Voltar</Button>
            <Button onClick={handleSignup} disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </>
        )}

        <Link to="/login" className="signup-link">
          Já tem uma conta? Faça login.
        </Link>
      </div>
    </div>
  );
};

export default SignupPage;
