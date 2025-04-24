import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import ptBR from 'date-fns/locale/pt-BR';

registerLocale('pt-BR', ptBR);
setDefaultLocale('pt-BR');

const Header = () => (
  <header className="header">
    <h1 style={{ fontSize: '1.8em' }}>Criar Calendário</h1>
  </header>
);

const FormFeriados = ({ feriados, adicionarFeriado, removerFeriado }) => (
  <div className="form-container">
    <h3>Adicionar Feriado</h3>
    <DatePicker
      selected={null}
      onChange={(date) => adicionarFeriado(date)}
      placeholderText="Selecione a data do feriado"
      isClearable
      locale="pt-BR"
    />
    <ul className="feriados-lista">
      {feriados.map((feriado, index) => (
        <li key={index}>
          {feriado.toLocaleDateString()}
          <button className="remove" onClick={() => removerFeriado(index)}>Remover</button>
        </li>
      ))}
    </ul>
  </div>
);

const FormPlantonistas = ({ plantonistas, adicionarPlantonista, removerPlantonista }) => (
  <div className="form-container">
    <h3>Adicionar Plantonista</h3>
    <input
      type="text"
      placeholder="Nome do Plantonista"
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target.value.trim() !== '') {
          adicionarPlantonista(e.target.value.trim());
          e.target.value = '';
        }
      }}
    />
    <ul className="plantonistas-lista">
      {plantonistas.map((pl, index) => (
        <li key={index}>
          {pl}
          <button className="remove" onClick={() => removerPlantonista(pl)}>Remover</button>
        </li>
      ))}
    </ul>
  </div>
);

const FeriasSection = ({
  plantonistas,
  setFerias,
  ferias,
  selectedPlantonista,
  setSelectedPlantonista,
  adicionarFeriasPlantonista,
}) => (
  <div className="form-container">
    <h3>Adicionar Férias</h3>
    <select onChange={(e) => setSelectedPlantonista(e.target.value)} value={selectedPlantonista}>
      <option value="">Selecione um Plantonista</option>
      {plantonistas.map((pl, index) => (
        <option key={index} value={pl}>{pl}</option>
      ))}
    </select>
    <div style={{ marginTop: '10px' }}>
      <DatePicker
        selected={ferias.start}
        onChange={(date) => setFerias({ ...ferias, start: date })}
        placeholderText="Início das Férias"
        locale="pt-BR"
      />
      <DatePicker
        selected={ferias.end}
        onChange={(date) => setFerias({ ...ferias, end: date })}
        placeholderText="Fim das Férias"
        locale="pt-BR"
      />
      <button onClick={adicionarFeriasPlantonista}>Adicionar Férias</button>
    </div>
  </div>
);

const Resumo = ({ feriados, plantonistas, feriasPlantonistas, escala }) => (
  <div className="resumo-container">
    <h3>Resumo</h3>
    <p><strong>Feriados:</strong> {feriados.map((f) => f.toLocaleDateString()).join(', ') || 'Nenhum'}</p>
    <p><strong>Plantonistas:</strong> {plantonistas.join(', ') || 'Nenhum'}</p>
    <h4>Férias dos Plantonistas:</h4>
    <ul>
      {feriasPlantonistas.map((f, i) => (
        <li key={i}>{f.nome} - {f.start.toLocaleDateString()} - {f.end.toLocaleDateString()}</li>
      ))}
    </ul>
    <h4>Escala:</h4>
    <ul>
      {escala.map((item, i) => (
        <li key={i}>{item.plantonista}: {item.datas.map(d => d.toLocaleDateString()).join(', ')}</li>
      ))}
    </ul>
  </div>
);

const gerarEscala = (plantonistas, feriados, feriasPlantonistas) => {
  if (plantonistas.length === 0) return [];

  const ano = 2025;
  const datas = new Set(feriados.map(f => f.toDateString()));

  for (let month = 0; month < 12; month++) {
    for (let day = 1; day <= 31; day++) {
      const date = new Date(ano, month, day);
      if (date.getFullYear() !== ano) continue;
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        datas.add(date.toDateString());
      }
    }
  }

  const sortedDates = [...datas].map(d => new Date(d)).sort((a, b) => a - b);
  const escala = [];
  let index = 0;

  for (let i = 0; i < sortedDates.length; i++) {
    const grupo = [sortedDates[i]];
    for (let j = i + 1; j < sortedDates.length; j++) {
      const diff = Math.abs((sortedDates[j] - sortedDates[i]) / (1000 * 60 * 60 * 24));
      if (diff <= 3) {
        grupo.push(sortedDates[j]);
        i = j;
      } else {
        break;
      }
    }

    let attempts = 0;
    let plantonista;
    do {
      plantonista = plantonistas[index % plantonistas.length];
      index++;
      attempts++;
      if (attempts > plantonistas.length) {
        plantonista = 'Nenhum disponível';
        break;
      }
    } while (
      feriasPlantonistas.some((f) => {
        return f.nome === plantonista && grupo.some((data) => data >= f.start && data <= f.end);
      })
    );

    escala.push({ plantonista, datas: grupo });
  }

  return escala;
};

function Criar() {
  const [feriados, setFeriados] = useState([]);
  const [plantonistas, setPlantonistas] = useState([]);
  const [feriasPlantonistas, setFeriasPlantonistas] = useState([]);
  const [selectedPlantonista, setSelectedPlantonista] = useState('');
  const [ferias, setFerias] = useState({ start: null, end: null });
  const [escala, setEscala] = useState([]);

  const adicionarFeriado = (data) => {
    if (data && !feriados.some((f) => f.getTime() === data.getTime())) {
      setFeriados([...feriados, data]);
    } else {
      alert('Este feriado já foi adicionado ou a data é inválida!');
    }
  };

  const removerFeriado = (index) => {
    setFeriados(feriados.filter((_, i) => i !== index));
  };

  const adicionarPlantonista = (nome) => {
    if (nome && !plantonistas.includes(nome)) {
      setPlantonistas([...plantonistas, nome]);
    } else {
      alert('Nome inválido ou já adicionado!');
    }
  };

  const removerPlantonista = (nome) => {
    setPlantonistas(plantonistas.filter((pl) => pl !== nome));
    setFeriasPlantonistas(feriasPlantonistas.filter((f) => f.nome !== nome));
  };

  const adicionarFeriasPlantonista = () => {
    if (!selectedPlantonista || !ferias.start || !ferias.end) {
      alert('Selecione o plantonista e defina o intervalo de férias.');
      return;
    }

    setFeriasPlantonistas([
      ...feriasPlantonistas,
      { nome: selectedPlantonista, start: ferias.start, end: ferias.end },
    ]);

    setFerias({ start: null, end: null });
    setSelectedPlantonista('');
  };

  const gerarRelatorio = () => {
    if (plantonistas.length === 0) {
      alert('Adicione pelo menos um plantonista antes de gerar a escala.');
      return;
    }
    if (feriados.length === 0) {
      alert('Adicione pelo menos um feriado para gerar a escala.');
      return;
    }
  
    const novaEscala = gerarEscala(plantonistas, feriados, feriasPlantonistas);
    setEscala(novaEscala);
  };
  return (
    <div className="criar-container">
      <Header />
      <div className="grid gap-4 md:grid-cols-2">
        <FormFeriados
          feriados={feriados}
          adicionarFeriado={adicionarFeriado}
          removerFeriado={removerFeriado}
        />
        <FormPlantonistas
          plantonistas={plantonistas}
          adicionarPlantonista={adicionarPlantonista}
          removerPlantonista={removerPlantonista}
        />
      </div>
      <FeriasSection
        plantonistas={plantonistas}
        setFerias={setFerias}
        ferias={ferias}
        selectedPlantonista={selectedPlantonista}
        setSelectedPlantonista={setSelectedPlantonista}
        adicionarFeriasPlantonista={adicionarFeriasPlantonista}
      />
      <Resumo
        feriados={feriados}
        plantonistas={plantonistas}
        feriasPlantonistas={feriasPlantonistas}
        escala={escala}
      />
      <div className="form-container">
        <button className="px-4 py-2 mt-4 text-white bg-green-700 rounded hover:bg-green-800" onClick={gerarRelatorio}>Gerar Relatório</button>
      </div>
    </div>
  );
}

export default Criar;
