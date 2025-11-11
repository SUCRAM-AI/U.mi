import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("api_key")

if not API_KEY:
    raise RuntimeError("Coloque sua chave no .env como api_key")

HEADERS_JSON = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}

# ===============================
# Funções principais
# ===============================

def upload_audio(file_path):
    """Envia o áudio e retorna a URL pública para usar no job."""
    print(f"📤 Enviando arquivo: {file_path}")

    # 1️⃣ Pede a URL assinada pra upload
    upload_url = "https://api.music.ai/v1/upload"
    resp = requests.get(upload_url, headers=HEADERS_JSON)
    if resp.status_code != 200:
        raise RuntimeError(f"Erro ao obter URL de upload: {resp.text}")

    data = resp.json()

    if "uploadUrl" not in data or "downloadUrl" not in data:
        raise RuntimeError(f"Resposta inesperada da API: {data}")

    # 2️⃣ Faz o upload do arquivo
    with open(file_path, "rb") as f:
        put_resp = requests.put(data["uploadUrl"], data=f)
        if put_resp.status_code not in (200, 201):
            raise RuntimeError(f"Falha no upload: {put_resp.text}")

    print("✅ Upload concluído com sucesso!")
    # 3️⃣ Retorna a URL pública (downloadUrl)
    return data["downloadUrl"]


def create_job(audio_url, workflow_id):
    job_url = "https://api.music.ai/v1/job"
    payload = {
        "name": "Chord Detection Job",
        "workflow": workflow_id,
        "params": {
            "inputUrl": audio_url  # nome do campo deve ser inputUrl, exatamente assim!
        }
    }

    print(f"🚀 Criando job com payload:\n{payload}")

    resp = requests.post(job_url, headers=HEADERS_JSON, json=payload)

    try:
        data = resp.json()
    except Exception:
        raise RuntimeError(f"Erro inesperado na resposta da API: {resp.text}")

    print(f"📩 Resposta da API:\n{data}")

    if resp.status_code != 200 and resp.status_code != 201:
        raise RuntimeError(f"Erro ao criar job: {data}")

    if "id" not in data:
        raise RuntimeError(f"⚠️ Resposta inesperada da API (sem 'id'): {data}")

    return data


def get_job_status(job_id, max_wait=180, interval=3):
    """Verifica o status do job até estar pronto (timeout de 3 minutos)"""
    status_url = f"https://api.music.ai/v1/job/{job_id}"
    waited = 0
    while True:
        resp = requests.get(status_url, headers=HEADERS_JSON).json()
        print("DEBUG resposta status:", resp)
        status = resp.get("status")
        if status is None:
            raise RuntimeError(f"Job status response inválida: {resp}")
        if status == "SUCCEEDED" or status == "succeeded":
            return resp
        elif status == "FAILED" or status == "failed":
            raise RuntimeError("❌ O job falhou.")
        time.sleep(interval)
        waited += interval
        if waited >= max_wait:
            raise RuntimeError(f"Timeout: job não completou após {max_wait} segundos (status atual: {status})")


def extract_chords(job_data):
    """Extrai os acordes do resultado do job."""
    if "result" not in job_data or "chords" not in job_data["result"]:
        return []

    chords_url = job_data["result"]["chords"]
    resp = requests.get(chords_url)
    resp.raise_for_status()
    chords_json = resp.json()
    chords = []
    for c in chords_json:
        if c.get("chord_majmin") != "N":
            chords.append(c)
    return chords


# ===============================
# Função simplificada p/ uso direto
# ===============================

def get_chords_from_audio(audio_path, workflow_id="untitled-workflow-18c7355"):
    audio_url = upload_audio(audio_path)
    job = create_job(audio_url, workflow_id)
    job_id = job["id"]

    print("⏳ Processando job...")
    result = get_job_status(job_id)
    chords_data = extract_chords(result)

    acordes = [c["chord_majmin"] for c in chords_data]
    print(f"🎶 Acordes detectados: {acordes}")
    return acordes
