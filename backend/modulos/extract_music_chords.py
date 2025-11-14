# ARQUIVO QUE CRIA UM JSON COM OS ACORDES DE UMA MÚSICA E OS SEUS TIMESTAMPS

import os
import time
import json
import requests
from dotenv import load_dotenv


load_dotenv()
API_KEY = os.getenv("api_key")
if not API_KEY:
    raise RuntimeError("Coloque sua chave no .env: api_key")

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
        data = resp.json()
    except Exception as e:
        print("⚠️ Erro ao baixar ou ler o JSON de acordes:", e)
        return []

    if isinstance(data, dict):
        if "chords" in data:
            chords_list = data["chords"]
        elif "annotations" in data and "chords" in data["annotations"]:
            chords_list = data["annotations"]["chords"]
        else:
            chords_list = data.get("segments") or data.get("items") or []
    else:
        chords_list = data

    normalized = []
    for item in chords_list:
        if not isinstance(item, dict):
            continue
        start_time = item.get("start") or item.get("startTime") or item.get("timeStart")
        end_time = item.get("end") or item.get("endTime") or item.get("timeEnd")
        chord_label = item.get("chord_majmin") or item.get("chord") or item.get("label")
        if start_time is not None and end_time is not None and chord_label:
            normalized.append({
                "start": start_time,
                "end": end_time,
                "chord_majmin": chord_label
            })

    with open("soosloucossabem_chords.json", "w", encoding="utf-8") as f:
        json.dump(normalized, f, ensure_ascii=False, indent=4)

    print("Dicionário convertido para JSON e salvo em 'creep_chords.json'")
    if not normalized:
        print("⚠️ Formato de acordes não reconhecido ou lista vazia")
    return normalized

def main(file_path, workflow_slug):
    upload_url, download_url = get_signed_urls()
    upload_file_to_url(upload_url, file_path)
    time.sleep(2)

    job_id = create_job(download_url, workflow_slug)
    job_res = poll_job(job_id)

    chords = extract_chords(job_res)
    chord_triplets = [
        {"start": c["start"], "end": c["end"], "chord_majmin": c["chord_majmin"]}
        for c in chords if isinstance(c, dict) and all(k in c for k in ("start", "end", "chord_majmin"))
    ]

    print("\n🎸 Acordes detectados:")
    if not chord_triplets:
        print("Nenhum acorde encontrado.")
    else:
        for c in chord_triplets:
            try:
                print(f"start: {c['start']}, end: {c['end']}, chord_majmin: {c['chord_majmin']}")
            except Exception:
                print(c)
    return chord_triplets

def app(file):
    if __name__ == "__main__":
        arquivo = file
        workflow_slug = "untitled-workflow-18c7355"  # seu workflow para detecção de acordes
        main(arquivo, workflow_slug)

        
app("audios/SoOsLoucosSabem.mp3")