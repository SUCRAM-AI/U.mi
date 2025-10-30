import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("api_key")
if not API_KEY:
    raise RuntimeError("Coloque sua chave no .env")

headers = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}

def list_workflows():
    url = "https://api.music.ai/v1/workflow"
    resp = requests.get(url, headers=headers)
    print("Status:", resp.status_code)
    print("Resposta workflows:", resp.text)
    resp.raise_for_status()
    return resp.json()

if __name__ == "__main__":
    wfs = list_workflows()
    # imprime todos, para você inspecionar
    for wf in wfs.get("content", []):
        # Exemplo esperado: wf["name"], wf["slug"]
        print("Slug:", wf.get("slug"), "| Nome:", wf.get("name"))
