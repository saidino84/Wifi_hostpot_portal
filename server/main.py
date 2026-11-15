import asyncio
import uuid
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, Optional

import requests
from fastapi import BackgroundTasks, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="Wi-Fi Hotspot & Captive Portal API",
    version="1.0.0",
    description="API para gestão de sessões Wi-Fi com pagamentos M-Pesa e e-Mola",
)

# Permite requisições do Frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# ENUMS E MODELOS DE DADOS
# ==========================================


class PaymentMethod(str, Enum):
    MPESA = "mpesa"
    EMOLA = "emola"


class PackageType(str, Enum):
    FREE_30MIN = "free_30m"
    ONE_HOUR = "1h"
    TWO_HOURS = "2h"
    DAILY = "24h"


# Catálogo de Pacotes
PACKAGES_DB = {
    PackageType.FREE_30MIN: {
        "name": "30 Minutos Grátis",
        "duration_minutes": 30,
        "price_mt": 0,
        "speed_mbps": 2,
    },
    PackageType.ONE_HOUR: {
        "name": "1 Hora",
        "duration_minutes": 60,
        "price_mt": 50,
        "speed_mbps": 5,
    },
    PackageType.TWO_HOURS: {
        "name": "2 Horas",
        "duration_minutes": 120,
        "price_mt": 80,
        "speed_mbps": 10,
    },
    PackageType.DAILY: {
        "name": "Passe 24 Horas",
        "duration_minutes": 1440,
        "price_mt": 150,
        "speed_mbps": 15,
    },
}

# Armazenamento em Memória (substitua por banco de dados em produção)
USERS_DB: Dict[str, dict] = {}
SESSIONS_DB: Dict[str, dict] = {}
TRANSACTIONS_DB: Dict[str, dict] = {}


# Schemas das Requisições
class UserRegisterSchema(BaseModel):
    name: str = Field(..., example="Saidino Adamo")
    phone: str = Field(..., example="841234567")
    mac_address: str = Field(..., example="AA:BB:CC:DD:EE:FF")
    ip_address: str = Field(..., example="192.168.43.50")


class CheckoutSchema(BaseModel):
    user_id: str
    package_id: PackageType
    payment_method: PaymentMethod
    phone_number: str = Field(
        ..., description="Número para STK Push (84/85 M-Pesa ou 86/87 e-Mola)"
    )


# ==========================================
# SERVIÇOS DE INTEGRAÇÃO DE PAGAMENTO
# ==========================================


class PaymentGateway:
    @staticmethod
    def process_mpesa_c2b(phone: str, amount: float, reference: str) -> bool:
        """Simulação de integração com a API da Vodacom M-Pesa (API C2B / APIX).

        Em produção, realiza um chamado HTTP POST para o endpoint C2B da Vodacom.
        """
        print(
            f"[M-Pesa] Enviando requisição STK Push para {phone} no valor de {amount} MT (Ref: {reference})"
        )
        # Exemplo da estrutura real da chamada HTTP:
        # payload = {
        #     "input_TransactionReference": reference,
        #     "input_CustomerMSISDN": phone,
        #     "input_Amount": str(amount),
        #     "input_ThirdPartyReference": reference,
        #     "input_ServiceProviderCode": "171717"
        # }
        # response = requests.post("https://api.sandbox.vm.co.mz/...", json=payload, headers=headers)
        return True

    @staticmethod
    def process_emola_c2b(phone: str, amount: float, reference: str) -> bool:
        """Simulação de integração com a API Movitel e-Mola (USSD Push / API).

        Em produção, realiza um chamado HTTP POST para o gateway e-Mola.
        """
        print(
            f"[e-Mola] Enviando requisição USSD Push para {phone} no valor de {amount} MT (Ref: {reference})"
        )
        return True


# ==========================================
# GERENCIADOR DE REDE E INTERCEPTAÇÃO
# ==========================================


def activate_user_network_access(
    mac_address: str, ip_address: str, speed_mbps: int
):
    """Executa os comandos de firewall no SO / Roteador para liberar o tráfego."""
    print(
        f"[REDE] Liberando tráfego para MAC={mac_address}, IP={ip_address} com limite de {speed_mbps}Mbps"
    )
    # Exemplo para Linux / Linux Gateway:
    # os.system(f"iptables -t nat -D PREROUTING -m mac --mac-source {mac_address} -j REDIRECT")
    # os.system(f"tc qdisc add dev wlan0 root handle 1: htb default 12")


def revoke_user_network_access(mac_address: str, ip_address: str):
    """Bloqueia o tráfego do usuário expirado."""
    print(
        f"[REDE] Bloqueando tráfego expirado para MAC={mac_address}, IP={ip_address}"
    )


# ==========================================
# ENDPOINTS DA API
# ==========================================


@app.get("/api/v1/packages")
def get_packages():
    """Retorna a lista de pacotes de internet disponíveis."""
    return {"packages": PACKAGES_DB}


@app.post("/api/v1/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegisterSchema):
    """Cadastra o usuário e retorna o ID da sessão inicial."""
    user_id = str(uuid.uuid4())
    user_record = {
        "id": user_id,
        "name": payload.name,
        "phone": payload.phone,
        "mac_address": payload.mac_address,
        "ip_address": payload.ip_address,
        "created_at": datetime.utcnow().isoformat(),
    }
    USERS_DB[user_id] = user_record
    return {
        "message": "Usuário registrado com sucesso",
        "user_id": user_id,
        "user": user_record,
    }


@app.post("/api/v1/payment/checkout")
def process_checkout(
    payload: CheckoutSchema, background_tasks: BackgroundTasks
):
    """Processa o pagamento via M-Pesa ou e-Mola e ativa o pacote contratado."""
    if payload.user_id not in USERS_DB:
        raise HTTPException(
            status_code=404, detail="Usuário não encontrado."
        )

    package = PACKAGES_DB.get(payload.package_id)
    if not package:
        raise HTTPException(status_code=400, detail="Pacote inválido.")

    user = USERS_DB[payload.user_id]
    transaction_id = f"TX-{uuid.uuid4().hex[:8].upper()}"

    # 1. Se o pacote for grátis, ativa direto
    if package["price_mt"] == 0:
        session = create_active_session(user, package)
        return {
            "status": "APPROVED",
            "message": "Pacote gratuito ativado!",
            "transaction_id": transaction_id,
            "session": session,
        }

    # 2. Processa pagamento por provedor
    payment_success = False
    if payload.payment_method == PaymentMethod.MPESA:
        payment_success = PaymentGateway.process_mpesa_c2b(
            phone=payload.phone_number,
            amount=package["price_mt"],
            reference=transaction_id,
        )
    elif payload.payment_method == PaymentMethod.EMOLA:
        payment_success = PaymentGateway.process_emola_c2b(
            phone=payload.phone_number,
            amount=package["price_mt"],
            reference=transaction_id,
        )

    if not payment_success:
        raise HTTPException(
            status_code=400,
            detail="Falha ao enviar cobrança no celular. Tente novamente.",
        )

    # 3. Registra transação como PENDING (aguardando webhook do gateway) ou simulada como APPROVED
    session = create_active_session(user, package)

    TRANSACTIONS_DB[transaction_id] = {
        "id": transaction_id,
        "user_id": user["id"],
        "package": payload.package_id,
        "amount": package["price_mt"],
        "method": payload.payment_method,
        "status": "APPROVED",
        "timestamp": datetime.utcnow().isoformat(),
    }

    return {
        "status": "APPROVED",
        "message": f"Solicitação enviada para o telefone {payload.phone_number}. Confirme a transação na tela do seu celular.",
        "transaction_id": transaction_id,
        "session": session,
    }


def create_active_session(user: dict, package: dict) -> dict:
    """Cria o registro da sessão e libera o acesso à internet."""
    now = datetime.utcnow()
    expires_at = now + timedelta(minutes=package["duration_minutes"])

    session_data = {
        "session_id": str(uuid.uuid4()),
        "user_id": user["id"],
        "mac_address": user["mac_address"],
        "ip_address": user["ip_address"],
        "package_name": package["name"],
        "speed_mbps": package["speed_mbps"],
        "started_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
        "is_active": True,
    }

    SESSIONS_DB[user["id"]] = session_data

    # Libera regras de tráfego na rede
    activate_user_network_access(
        mac_address=user["mac_address"],
        ip_address=user["ip_address"],
        speed_mbps=package["speed_mbps"],
    )

    return session_data


@app.get("/api/v1/session/status/{user_id}")
def check_session_status(user_id: str):
    """Consulta o tempo restante e status da sessão do usuário."""
    session = SESSIONS_DB.get(user_id)
    if not session:
        return {"is_active": False, "remaining_seconds": 0}

    expires_at = datetime.fromisoformat(session["expires_at"])
    now = datetime.utcnow()

    remaining_seconds = int((expires_at - now).total_seconds())

    if remaining_seconds <= 0:
        session["is_active"] = False
        revoke_user_network_access(session["mac_address"], session["ip_address"])
        return {
            "is_active": False,
            "remaining_seconds": 0,
            "message": "Sessão expirada.",
        }

    return {
        "is_active": True,
        "remaining_seconds": remaining_seconds,
        "package_name": session["package_name"],
        "speed_mbps": session["speed_mbps"],
        "expires_at": session["expires_at"],
    }