import React from 'react';
import logoHOF from './assets/img/HOF.png';
import logoGovPE from './assets/img/GovPERGB.png';
import imgExamesImg from './assets/img/examesimg.jpg';
import imgExamesLab from './assets/img/exameslab.jpg';
import imgBiopsia from './assets/img/biopsia.jpg';
import bgHeader from './assets/img/BG.png';

function App() {
  const cardsData = [
    {
      id: 1,
      titulo: 'Exames de Imagem',
      descricao: 'Acesse seus resultados de Raio-X, Tomografia, Ressonância e Ultrassonografia.',
      imagem: imgExamesImg,
      url: 'https://portalexameshof.saude.pe.gov.br/login/1'
    },
    {
      id: 2,
      titulo: 'Exames de Laboratório',
      descricao: 'Acesse seus resultados de Sangue, Urina e demais análises clínicas.',
      imagem: imgExamesLab,
      url: 'https://portalexalabhof.saude.pe.gov.br/portal-laudos/#/login/'
    },
    {
      id: 3,
      titulo: 'Biópsia',
      descricao: 'Resultados de exames anatomopatológicos.',
      imagem: imgBiopsia,
      url: 'https://portalexameshof.saude.pe.gov.br/login/1'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg-light text-text-dark font-sans">
      
      <header style={{ backgroundImage: `url(${bgHeader})` }}className="flex flex-col items-center px-[6vw] md:px-[10vw] h-[18vh] md:h-30vh] bg-center bg-cover bg-no-repeat shadow-md" > 

        <div className="flex justify-between items-center w-full mt-4">
          <a href="/" className="transition-transform hover:scale-105">
            <img src={logoHOF} alt="Hospital Otávio de Freitas" className="w-[100px] md:w-[180px]" />
          </a>
          <a href="https://www.pe.gov.br/" target="_blank" rel="noreferrer" className="transition-transform hover:scale-105">
            <img src={logoGovPE} alt="Governo de Pernambuco" className="w-[150px] md:w-[220px]" />
          </a>
        </div>

        <div className="mt-2 md:mt-4 text-center">
          <h1 className="text-2xl md:text-4x1 font-bold text-white drop-shadow-md">
            Hospital Otávio de Freitas
          </h1>
        </div>
      </header>

      <main className="flex-grow w-full max-w-[1100px] mx-auto px-5 mt-10 md:mt-24 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {cardsData.map((card) => (
            <a 
              key={card.id}
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-[18px] p-6 text-center min-h-[360px] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              <img 
                src={card.imagem} 
                alt={card.titulo} 
                className="w-full h-[180px] object-cover rounded-[14px] mb-5"
              />
              <h3 className="text-xl font-semibold text-primary mb-3">
                {card.titulo}
              </h3>
              <p className="text-[0.95rem] leading-relaxed text-text-muted">
                {card.descricao}
              </p>
            </a>
          ))}

        </div>
      </main>

      <footer className="bg-primary text-white text-center py-4 px-5 text-sm md:text-[0.9rem] w-full">
        <p>Plataforma desenvolvida pela equipe interna do Hospital Otávio de Freitas. Direitos reservados.</p>
      </footer>

    </div>
  );
}

export default App;