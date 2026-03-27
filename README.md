# Sistema Hospitalar – Gestão e Indicadores

## 📄 Sobre a Aplicação
O **Sistema Hospitalar** é uma plataforma completa para gerenciamento de informações hospitalares, com foco na organização de dados clínicos, indicadores de desempenho e facilitação da comunicação entre equipes.  

O sistema possui diferentes frentes de atuação:

- **Frontend Indicadores:** Dashboard para visualização de indicadores hospitalares.  
- **Frontend Interno:** Interface para uso da equipe interna do hospital.  
- **Frontend Público:** Portal com informações básicas para pacientes e público externo.  
- **Backend:** API responsável pelo processamento, armazenamento e consulta de dados.  

O sistema utiliza **Node.js**, **Prisma** como ORM e **React** para os frontends.

---

## 🎯 Objetivos
- Centralizar informações hospitalares de forma segura e organizada.  
- Fornecer indicadores em tempo real sobre atendimentos e desempenho do hospital.  
- Melhorar a comunicação entre profissionais de saúde e gestão hospitalar.  
- Permitir consultas públicas simplificadas de informações não sensíveis.  

---

## 👥 Equipe
- **Klaiven Ferreira de Castro** – Desenvolvedor Fullstack responsável pelo backend e integração dos frontends.  
- **Equipe do Hospital** – Fornecimento de dados, feedbacks e validação de processos internos.  

---

## 🗂 Estrutura do Projeto

hof

│

├── apps/

│ ├── backend/ # API Node.js + Prisma

│ ├── frontend-indicadores/ # Dashboard de indicadores (React)

│ ├── frontend-interno/ # Portal interno (React)

│ └── frontend-public/ # Portal público (React)


---

## ⚙️ Tecnologias Utilizadas
- Node.js  
- React  
- Prisma ORM  
- PostgreSQL (ou outro banco relacional)  
- Express.js  
- Axios  

---

## 🚀 Como Rodar Localmente

### 1. Pré-requisitos
- Node.js >= 18  
- npm ou yarn  
- Banco de dados PostgreSQL/MySQL local  
- Git  

### 2. Clonar o Repositório
```bash
git clone https://github.com/Klaiven/HOF.git
cd hof/apps
```


### 3. Instalar Dependências
```bash
cd hof/apps
Para cada pasta de frontend e backend:

cd backend
npm install

cd ../frontend-indicadores
npm install

cd ../frontend-interno
npm install

cd ../frontend-public
npm install
```

### 4. Configurar Variáveis de Ambiente
Crie um arquivo .env na pasta backend:
```bash
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco?schema=public"PORT=3000

HOSP_DB_USER= dba
HOSP_DB_PASS= 123456
HOSP_DB_TNS= tns-server
```

### 5. Configurar Banco de Dados com Prisma
```bash
cd backend
npx prisma generate      # Gera o client do Prisma
npx prisma migrate dev    # Cria as tabelas no banco de dados local
npx prisma studio         # Opcional: interface visual do Prisma
```

### 6. Rodar a Aplicação
```bash
Backend:
cd backend
npm run dev
Frontend Indicadores:
cd ../frontend-indicadores
npm start
Frontend Interno:
cd ../frontend-interno
npm start
Frontend Público:
cd ../frontend-public
npm start
```

Após isso, os frontends estarão disponíveis em http://localhost:3001, http://localhost:3002, etc., conforme configurado.


----
📝 Observações
Certifique-se de que o banco de dados esteja rodando antes de iniciar o backend.

Ajuste as portas dos frontends caso haja conflito.

Para testes de dados, use o Prisma Studio para inserir informações iniciais.
