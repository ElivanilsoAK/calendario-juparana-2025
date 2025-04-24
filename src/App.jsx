import { Routes, Route, Link } from 'react-router-dom'
import { Home, List, User, Info } from 'lucide-react'; // Ícones para os links
import Criar from './pages/Criar'
import Lista from './pages/Lista'
import Plantonista from './pages/Plantonista'
import Sobre from './pages/Sobre'
import './App.css'; // Estilos personalizados

function App() {
  return (
    <div>
      {/* Navbar com animações */}
      <nav className="navbar">
        <Link to="/" className="nav-link">
          <Home className="nav-icon" /> Criar
        </Link>
        <Link to="/lista" className="nav-link">
          <List className="nav-icon" /> Lista
        </Link>
        <Link to="/plantonista" className="nav-link">
          <User className="nav-icon" /> Plantonista
        </Link>
        <Link to="/sobre" className="nav-link">
          <Info className="nav-icon" /> Sobre
        </Link>
      </nav>

      {/* Rotas de navegação */}
      <Routes>
        <Route path="/" element={<Criar />} />
        <Route path="/lista" element={<Lista />} />
        <Route path="/plantonista" element={<Plantonista />} />
        <Route path="/sobre" element={<Sobre />} />
      </Routes>
    </div>
  );
}

export default App;
