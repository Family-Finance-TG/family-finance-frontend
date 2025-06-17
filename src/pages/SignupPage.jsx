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
  const [step, setStep] = useState(1); 
  const navigate = useNavigate();

  const [accessName, setAccessName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [name, setName] = useState(''); 
  const [dateBirth, setDateBirth] = useState('');
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
        setError('Erro ao carregar gêneros. Tente novamente.');
      }
    };
    fetchGenders();
  }, []);

  const formatDateTime = (date) => {
    return `${date}T00:00:00`; 
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

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

  if (!passwordRegex.test(password)) {
    setError(
      'A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.'
    );
    return false;
  }

  return true;
};


  const formatCPF = (value) => {
    let cpf = value.replace(/\D/g, ''); 
    cpf = cpf.slice(0, 11); // Limita a 11 caracteres

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

    if (!name || !dateBirth || !cpf || !gender) {
      setError('Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const selectedGender = genders.find((g) => g.value === gender); 

      const userData = {
        name, 
        accessName,
        password,
        dateBirth: formatDateTime(dateBirth), 
        cpf: cleanCPF(cpf),
        gender: selectedGender, 
      };

      await signup(userData);
      navigate('/login');
    } catch (error) {
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
