# Sistema de Captive Portal Wi-Fi (Full-Stack)

#$ Bem-vindo ao guia de estudo e documentação do seu projeto de gerenciamento de rede Wi-Fi com Captive Portal, pagamentos via M-Pesa / e-Mola e controle de pacotes de tempo.$

# **1. Estrutura Modular do Projeto**

Para Manter o código limpo e organizado, o projeto está dividido em duas pastas principais (<a href="localhost:5000">backend e frontend</a>):

```js
wifi-hotspot-portal/
├── backend/                  # API Python (FastAPI) gerenciada por 'uv'
│   ├── .venv/                # Ambiente virtual isolado
│   ├── pyproject.toml        # Dependências do projeto Python
│   └── main.py               # Lógica da API, pagamentos e controle de rede
│
└── frontend/                 # Aplicação React (Vite / Tailwind)
    ├── src/
    │   ├── components/       # Componentes modulares (Etapas do portal)
    │   ├── App.jsx           # Componente principal que gere as telas
    │   └── main.jsx          # Ponto de entrada do React
    ├── package.json          # Dependências do Node.js
    └── vite.config.js        # Configuração do empacotador Vite
```

# 2. Backend (Python + FastAPI + uv)

O backend foi construído com FastAPI devido à sua alta performance e documentação automática, e é gerenciado pelo uv (ferramenta ultrarrápida em Rust para gerenciar pacotes Python).

<a>uv init --app</a>: Cria a estrutura inicial do projeto Python e gera o arquivo pyproject.toml.


<a>> uv add fastapi uvicorn pydantic requests</a>
: Instala instantaneamente as dependências:

```ruby
fastapi: Framework web para criar as rotas da API.
```

```ruby
uvicorn: Servidor ASGI para rodar a aplicação Python.
```

```ruby
pydantic: Validação rigorosa dos dados enviados pelos usuários.
```

```ruby
requests:
 Para futuras requisições HTTP (como integração real com as APIs da Vodacom e Movitel)
 ```

## Análise Linha por Linha de backend/main.
```python
import uuid
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict
from fastapi import FastAPI, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

```
# Cria a instância principal da aplicação FastAPI
```python
app = FastAPI(
    title="Wi-Fi Hotspot & Captive Portal API",
    version="1.0.0"
)
```

# Configuração de CORS: Permite que o Frontend (rodando em outra porta) acesse esta API
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, substitua pelo domínio exato do front
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

# --- DEFINIÇÃO DE DADOS E ENUMS ---

```python
class PaymentMethod(str, Enum):
    MPESA = "mpesa"
    EMOLA = "emola"

class PackageType(str, Enum):
    FREE_30MIN = "free_30m"
    ONE_HOUR = "1h"
    TWO_HOURS = "2h"
    DAILY = "24h"
```

# Dicionário estático simulando o banco de dados de pacotes disponíveis
```python
PACKAGES_DB = {
    PackageType.FREE_30MIN: {"name": "30 Minutos Grátis", "duration_minutes": 30, "price_mt": 0, "speed_mbps": 2},
    PackageType.ONE_HOUR: {"name": "1 Hora", "duration_minutes": 60, "price_mt": 50, "speed_mbps": 5},
    # ... outros pacotes ...
}
```

# Bases de dados temporárias em memória RAM
```python
USERS_DB: Dict[str, dict] = {}
SESSIONS_DB: Dict[str, dict] = {}
```

# --- MODELOS DE ENTRADA (VALIDAÇÃO PYDANTIC) ---
```python
class UserRegisterSchema(BaseModel):
    name: str
    phone: str
    mac_address: str
    ip_address: str
```

# --- ENDPOINTS DA API ---

```python
@app.post("/api/v1/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegisterSchema):
    """Recebe os dados do usuário do Captive Portal, gera um ID único e grava na memória."""
    user_id = str(uuid.uuid4())
    user_record = {
        "id": user_id,
        "name": payload.name,
        "phone": payload.phone,
        "mac_address": payload.mac_address,
        "ip_address": payload.ip_address,
        "created_at": datetime.utcnow().isoformat()
    }
    USERS_DB[user_id] = user_record
    return {"message": "Usuário registrado com sucesso", "user_id": user_id}
```

- Como rodar o backend:
```console
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

# 3. Frontend (React + Vite + Tailwind CSS)
Para quem está aprendendo React, este projeto utiliza conceitos essenciais que você usará em qualquer aplicação moderna:

- <a>useState </a>: Hook para guardar e alterar estados locais (ex: alternar entre a tela de cadastro, escolha de pacotes e cronômetro ativo).

- <a>useEffect</a>: Hook ideal para lidar com efeitos colaterais e temporizadores (como o cronômetro regressivo da sessão).

- <a>Componentização</a>: Divisão de cada tela em blocos reutilizáveis.

###  Modularização Recomendada para o Frontend:

`````htm
frontend/src/
├── components/
│   ├── RegisterStep.jsx     # Formulário de captura de nome e telemóvel
│   ├── PackagesStep.jsx     # Vitrine de escolha de pacotes (Grátis, 1h, 2h...)
│   └── ActiveSession.jsx    # Tela do cronômetro regressivo e consumo de dados
├── App.jsx                  # Controla qual componente mostrar com base no estado 'step'
└── main.jsx                 # Renderiza o App no DOM
`````

## Explicação do Fluxo no React (App.jsx):
```javascript

import { useState, useEffect } from 'react';

export default function App() {
  // Estado que controla qual etapa o usuário está visualizando ('register', 'packages', 'session')
  const [step, setStep] = useState('register');
  const [userId, setUserId] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  // Função chamada ao submeter o formulário de cadastro
  const handleRegisterSuccess = (id) => {
    setUserId(id);
    setStep('packages'); // Avança para a escolha de pacotes
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      {step === 'register' && <RegisterStep onSuccess={handleRegisterSuccess} />}
      {step === 'packages' && <PackagesStep userId={userId} onSessionStarted={(session) => { setActiveSession(session); setStep('session'); }} />}
      {step === 'session' && <ActiveSession session={activeSession} />}
    </div>
  );
}
```

<a>https://developer.mpesa.vm.co.mz/documentation/</a>