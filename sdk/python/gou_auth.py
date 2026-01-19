# GOU Auth SDK - Python Example

import requests
import hashlib
import platform
import uuid


class GouAuth:
    """SDK para integração com GOU Auth System"""
    
    def __init__(self, app_id: str, api_url: str = "http://localhost:3001"):
        self.app_id = app_id
        self.api_url = api_url
        self.token = None
        self.session_id = None
        self.user = None
    
    def _get_hwid(self) -> str:
        """Gera um HWID único para a máquina"""
        # Combina informações do sistema para criar ID único
        system_info = f"{platform.node()}{platform.machine()}{uuid.getnode()}"
        return hashlib.sha256(system_info.encode()).hexdigest()
    
    def _request(self, method: str, endpoint: str, data: dict = None, auth: bool = False):
        """Faz requisição para a API"""
        headers = {"Content-Type": "application/json"}
        
        if auth and self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        
        url = f"{self.api_url}/api{endpoint}"
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, params=data)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data)
            else:
                response = requests.request(method, url, headers=headers, json=data)
            
            return response.json()
        except Exception as e:
            return {"success": False, "error": {"code": "REQUEST_FAILED", "message": str(e)}}
    
    def login(self, username: str, password: str) -> dict:
        """Login com usuário e senha"""
        data = {
            "username": username,
            "password": password,
            "hwid": self._get_hwid(),
            "appId": self.app_id
        }
        
        result = self._request("POST", "/auth/login", data)
        
        if result.get("success"):
            self.token = result["data"]["token"]
            self.session_id = result["data"]["sessionId"]
            self.user = result["data"]["user"]
        
        return result
    
    def login_with_key(self, key: str) -> dict:
        """Login com chave de licença"""
        data = {
            "key": key,
            "hwid": self._get_hwid(),
            "appId": self.app_id
        }
        
        result = self._request("POST", "/auth/key", data)
        
        if result.get("success"):
            self.token = result["data"]["token"]
            self.session_id = result["data"]["sessionId"]
            self.user = result["data"]["user"]
        
        return result
    
    def validate_session(self) -> dict:
        """Valida a sessão atual"""
        if not self.token:
            return {"success": False, "error": {"code": "NO_SESSION", "message": "Not logged in"}}
        
        return self._request("GET", "/auth/session", auth=True)
    
    def logout(self) -> dict:
        """Encerra a sessão"""
        result = self._request("POST", "/auth/logout", auth=True)
        
        if result.get("success"):
            self.token = None
            self.session_id = None
            self.user = None
        
        return result
    
    def is_authenticated(self) -> bool:
        """Verifica se está autenticado"""
        if not self.token:
            return False
        
        result = self.validate_session()
        return result.get("success", False) and result.get("data", {}).get("valid", False)
    
    def get_user_info(self) -> dict:
        """Retorna informações do usuário logado"""
        return self.user


# ==================== Exemplo de Uso ====================

if __name__ == "__main__":
    # Inicializar SDK
    auth = GouAuth(
        app_id="seu-app-id-aqui",
        api_url="http://localhost:3001"
    )
    
    # Exemplo 1: Login com usuário e senha
    print("=== Login com Credenciais ===")
    result = auth.login("usuario123", "senha123")
    
    if result["success"]:
        print(f"✅ Logado como: {auth.user['username']}")
        print(f"📅 Expira em: {auth.user.get('subscriptionExpires', 'Lifetime')}")
    else:
        print(f"❌ Erro: {result['error']['message']}")
    
    # Exemplo 2: Login com key
    print("\n=== Login com Key ===")
    result = auth.login_with_key("GOU-XXXX-XXXX-XXXX")
    
    if result["success"]:
        print(f"✅ Key ativada com sucesso!")
        print(f"👤 Usuário: {auth.user['username']}")
    else:
        print(f"❌ Erro: {result['error']['message']}")
    
    # Exemplo 3: Validar sessão
    print("\n=== Validar Sessão ===")
    if auth.is_authenticated():
        print("✅ Sessão válida")
    else:
        print("❌ Sessão inválida ou expirada")
    
    # Logout
    auth.logout()
    print("\n✅ Deslogado com sucesso")
