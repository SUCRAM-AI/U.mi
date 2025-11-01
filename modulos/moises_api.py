import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("api_key")
if not API_KEY:
    raise RuntimeError("Coloque sua chave no .env: MUSICAI_API_KEY")

HEADERS_JSON = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}

def get_signed_urls():
    url = "https://api.music.ai/v1/upload"
    resp = requests.get(url, headers={"Authorization": API_KEY})
    print("GET /upload →", resp.status_code)
    resp.raise_for_status()
    obj = resp.json()
    upload_url = obj.get("uploadUrl")
    download_url = obj.get("downloadUrl")
    if not upload_url or not download_url:
        raise RuntimeError("uploadUrl ou downloadUrl ausentes no GET /upload: " + str(obj))
    return upload_url, download_url

def upload_file_to_url(upload_url, file_path):
    if file_path.lower().endswith(".mp3"):
        ct = "audio/mpeg"
    elif file_path.lower().endswith(".wav"):
        ct = "audio/wav"
    else:
        ct = "application/octet-stream"

    headers = {"Content-Type": ct}
    with open(file_path, "rb") as f:
        resp = requests.put(upload_url, headers=headers, data=f)
    print("PUT upload →", resp.status_code)
    resp.raise_for_status()

def create_job(download_url, workflow_slug):
    url = "https://api.music.ai/v1/job"
    payload = {
        "name": "Detect chords job",
        "workflow": workflow_slug,
        "params": {"inputUrl": download_url}
    }
    resp = requests.post(url, headers=HEADERS_JSON, json=payload)
    print("POST /job →", resp.status_code)
    resp.raise_for_status()
    job_id = resp.json().get("id")
    if not job_id:
        raise RuntimeError("Job criado, mas sem ID: " + str(resp.json()))
    return job_id

def poll_job(job_id, interval=5):
    url = f"https://api.music.ai/v1/job/{job_id}"
    while True:
        resp = requests.get(url, headers={"Authorization": API_KEY})
        resp.raise_for_status()
        job = resp.json()
        status = job.get("status")
        print("Status:", status)
        if status == "SUCCEEDED":
            return job
        if status == "FAILED":
            raise RuntimeError("Job falhou: " + str(job))
        time.sleep(interval)

def extract_chords(job_result):
    res = job_result.get("result", {})
    chords_url = res.get("chords")
    if not chords_url:
        print("⚠️ Nenhum URL de acordes encontrado no job.result:", res)
        return []

    try:
        resp = requests.get(chords_url)
        resp.raise_for_status()
        chords_json = resp.json()
    except Exception as e:
        print("⚠️ Erro ao baixar ou ler o JSON de acordes:", e)
        return []

    # pegar a lista correta de objetos de acorde
    chords_list = []
    if "chords" in chords_json:
        chords_list = chords_json["chords"]
    elif "annotations" in chords_json and "chords" in chords_json["annotations"]:
        chords_list = chords_json["annotations"]["chords"]
    else:
        for item in chords_json:
            print(f"Start: {item['start']} // End: {item['end']} // Acorde: {item['chord_majmin']}")

    # filtrar apenas objetos válidos com chord_majmin
    clean_chords = [c for c in chords_list if isinstance(c, dict) and "chord_majmin" in c]
    return clean_chords


def main(file_path, workflow_slug):
    upload_url, download_url = get_signed_urls()
    upload_file_to_url(upload_url, file_path)
    time.sleep(2)  # espera o arquivo estabilizar no servidor
    job_id = create_job(download_url, workflow_slug)
    job_res = poll_job(job_id)

    chords = extract_chords(job_res)
    print("\n🎸 Acordes detectados (somente chord_majmin):")
    if not chords:
        print("Nenhum acorde encontrado.")
    else:
        # Filtrar só chord_majmin
        chords_majmin = [c["chord_majmin"] for c in chords]
        print(" ".join(chords_majmin))


def app(file):
    if __name__ == "__main__":
        arquivo = file
        workflow_slug = "untitled-workflow-18c7355"  # seu workflow para detecção de acordes
        main(arquivo, workflow_slug)


app("C:/Users/duart/OneDrive/Documentos/Trilha UFPB 2025.2/Hackathon/audios/Samurai.mp3")