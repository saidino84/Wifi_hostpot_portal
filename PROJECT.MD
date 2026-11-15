```htm
wifi-hotspot-portal/
├── backend/                  # API Python (FastAPI) gerenciada por 'uv'
│   ├── .venv/                # Ambiente virtual criado pelo uv
│   ├── pyproject.toml        # Configuração e dependências do Python
│   ├── main.py               # Código da API que criamos
│   └── README.md
│
├── frontend/                 # Aplicação React (Vite / Tailwind)
│   ├── src/                  # Componentes e telas (Captive Portal)
│   ├── package.json          # Dependências Node.js
│   └── vite.config.js
│
└── README.md                 # Documentação geral do projeto
```


# run server
> uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000

# To create ui
# Na raiz do projeto
> npm create vite@latest frontend -- --template react
> cd frontend
> npm install
> npm install lucide-react tailwindcss postcss autoprefixer

##CONECAO DO SERVER COM FRONT ENT

```javascript

// Exemplo de chamada de cadastro no React
const handleRegister = async (formData) => {
  const response = await fetch('http://localhost:8000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.name,
      phone: formData.phone,
      mac_address: "AA:BB:CC:DD:EE:FF", // Obtido via DHCP/Headers
      ip_address: "192.168.43.50"
    })
  });
  const data = await response.json();
  setUserId(data.user_id);
};

// Exemplo de pagamento com M-Pesa ou e-Mola
const handlePayment = async (packageId, paymentMethod, phoneNumber) => {
  const response = await fetch('http://localhost:8000/api/v1/payment/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      package_id: packageId,
      payment_method: paymentMethod, // 'mpesa' ou 'emola'
      phone_number: phoneNumber
    })
  });
  const data = await response.json();
  if (data.status === 'APPROVED') {
    // Redireciona para a tela do cronômetro
  }
};
'''
```