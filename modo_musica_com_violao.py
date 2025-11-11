import streamlit as st
import time
import json
import os
import random
import base64
import tempfile
import streamlit.components.v1 as components

# Suponha que essa função do seu arquivo detect_user_chord.py exista e esteja no PYTHONPATH
from modulos.chord_detector import get_chords_from_audio


# Estado inicial do jogo
if "game_started" not in st.session_state:
    st.session_state["game_started"] = False
if "start_time" not in st.session_state:
    st.session_state["start_time"] = None
if "indice" not in st.session_state:
    st.session_state["indice"] = 0
if "paused" not in st.session_state:
    st.session_state["paused"] = False
if "score" not in st.session_state:
    st.session_state["score"] = 0
if "last_index_with_choices" not in st.session_state:
    st.session_state["last_index_with_choices"] = -1
if "answered" not in st.session_state:
    st.session_state["answered"] = False
if "music_path" not in st.session_state:
    st.session_state["music_path"] = None
if "latency_offset" not in st.session_state:
    st.session_state["latency_offset"] = 0.0  # em segundos
if "audio_data_url" not in st.session_state:
    st.session_state["audio_data_url"] = None
if "player_nonce" not in st.session_state:
    st.session_state["player_nonce"] = 0
if "autoplay_requested" not in st.session_state:
    st.session_state["autoplay_requested"] = False
if "awaiting_next_guess" not in st.session_state:
    st.session_state["awaiting_next_guess"] = False
if "guess_target_index" not in st.session_state:
    st.session_state["guess_target_index"] = None
if "pause_armed_index" not in st.session_state:
    st.session_state["pause_armed_index"] = -1

st.title("Minigame: Adivinhe o Acorde (sincronizado com detecção por áudio)")
st.caption("A música toca e você tenta acertar o acorde tocando no violão quando a música pausa.")

# Escolha da música
audio_dir = "audios"
opcoes = [f for f in os.listdir(audio_dir) if f.lower().endswith((".mp3", ".wav"))] if os.path.isdir(audio_dir) else []
musica_escolhida = st.selectbox("Escolha uma música", options=opcoes, index=0 if opcoes else None, placeholder="Selecione um arquivo em audios/")

# Carregamento dos acordes relacionados
if musica_escolhida:
    nome_base = os.path.splitext(musica_escolhida)[0]
    path_chords = os.path.join("musics_chords", f"{nome_base}_chords.json")
    try:
        with open(path_chords, "r", encoding="utf-8") as arquivo:
            acordes = json.load(arquivo)
    except Exception as e:
        st.error(f"Erro ao carregar acordes para {musica_escolhida}: {e}")
        acordes = []

# Controles
col1, col2, col3 = st.columns(3)
with col1:
    iniciar = st.button("Iniciar", type="primary", disabled=not musica_escolhida)
with col2:
    pausar = st.button("Pausar", disabled=not st.session_state["game_started"])
with col3:
    reiniciar = st.button("Reiniciar")

# Preparar áudio
if musica_escolhida:
    st.session_state["music_path"] = os.path.join(audio_dir, musica_escolhida)
    try:
        with open(st.session_state["music_path"], "rb") as f:
            data = f.read()
        b64 = base64.b64encode(data).decode("utf-8")
        ext = os.path.splitext(st.session_state["music_path"])[1].lower()
        mime = "audio/mpeg" if ext == ".mp3" else "audio/wav"
        st.session_state["audio_data_url"] = f"data:{mime};base64,{b64}"
    except Exception:
        st.session_state["audio_data_url"] = None

if iniciar and musica_escolhida:
    st.session_state["game_started"] = True
    st.session_state["paused"] = False
    st.session_state["indice"] = 0
    st.session_state["score"] = 0
    st.session_state["answered"] = False
    st.session_state["last_index_with_choices"] = -1
    st.session_state["start_time"] = time.time()
    st.session_state["player_nonce"] += 1
    st.session_state["autoplay_requested"] = True

if pausar and st.session_state["game_started"]:
    st.session_state["paused"] = not st.session_state["paused"]
    if not st.session_state["paused"] and st.session_state["start_time"] is not None:
        st.session_state["start_time"] = time.time() - acordes[st.session_state["indice"]]["start"]

if reiniciar:
    st.session_state["game_started"] = False
    st.session_state["paused"] = False
    st.session_state["indice"] = 0
    st.session_state["score"] = 0
    st.session_state["answered"] = False
    st.session_state["last_index_with_choices"] = -1
    st.session_state["start_time"] = None
    st.session_state["awaiting_next_guess"] = False
    st.session_state["guess_target_index"] = None
    st.session_state["pause_armed_index"] = -1

# Player HTML5
if st.session_state["audio_data_url"] and st.session_state["game_started"]:
    nonce = st.session_state["player_nonce"]
    data_url = st.session_state["audio_data_url"]
    should_autoplay = "true" if st.session_state["autoplay_requested"] or (st.session_state["game_started"] and not st.session_state["paused"]) else "false"
    should_pause = "true" if st.session_state["paused"] else "false"
    components.html(
        f"""
        <audio id="player_{nonce}" controls src="{data_url}" playsinline></audio>
        <script>
        (function() {{
            const el = document.getElementById("player_{nonce}");
            if (!el) return;
            if ({should_autoplay}) {{
                try {{
                    el.muted = true;
                    const p = el.play && el.play();
                    if (p && p.then) {{
                        p.then(() => setTimeout(() => {{ el.muted = false; }}, 150));
                    }}
                }} catch (e) {{}}
            }}
            if ({should_pause}) {{
                try {{ el.pause && el.pause(); }} catch (e) {{}}
            }}
        }})();
        </script>
        """,
        height=110
    )
    if st.session_state["autoplay_requested"]:
        st.session_state["autoplay_requested"] = False

# Dados auxiliares
unique_chords = sorted(list({a["chord_majmin"] for a in acordes}))

def get_current_index_by_time(elapsed_seconds: float) -> int:
    left, right = 0, len(acordes) - 1
    current = 0
    while left <= right:
        mid = (left + right) // 2
        if acordes[mid]["start"] <= elapsed_seconds:
            current = mid
            left = mid + 1
        else:
            right = mid - 1
    return current

def generate_choices(correct: str) -> list:
    pool = [c for c in unique_chords if c != correct]
    distractors = random.sample(pool, k=2) if len(pool) >= 2 else pool[:2]
    options = distractors + [correct]
    random.shuffle(options)
    return options

# Loop do jogo
if st.session_state["game_started"]:
    if not st.session_state["paused"] and st.session_state["start_time"] is not None:
        elapsed = max(0.0, time.time() - st.session_state["start_time"])
        adjusted_elapsed = max(0.0, elapsed + float(st.session_state["latency_offset"]))
        idx = get_current_index_by_time(adjusted_elapsed)
        st.session_state["indice"] = idx

        acorde_atual = acordes[idx]["chord_majmin"]
        inicio = acordes[idx]["start"]
        fim = acordes[idx]["end"]
        duracao = max(0.001, fim - inicio)
        dentro_do_acorde = min(1.0, max(0.0, (adjusted_elapsed - inicio) / duracao))

        st.markdown(f"### Acorde atual: **{acorde_atual}**")
        st.progress(dentro_do_acorde)
        st.write(f"Tempo: {adjusted_elapsed:.2f}s (ajustado) | Acorde {idx+1}/{len(acordes)} | Pontos: {st.session_state['score']}")

        if (not st.session_state["awaiting_next_guess"]
            and idx + 1 < len(acordes)
            and st.session_state["pause_armed_index"] != idx
            and dentro_do_acorde >= 0.85):
            if random.random() < 0.3:
                st.session_state["paused"] = True
                st.session_state["awaiting_next_guess"] = True
                st.session_state["guess_target_index"] = idx + 1
                st.session_state["answered"] = False
                st.session_state["pause_armed_index"] = idx
                st.rerun()
            else:
                st.session_state["pause_armed_index"] = idx

        time.sleep(0.5)
        st.rerun()

    else:
        if st.session_state["awaiting_next_guess"] and st.session_state["guess_target_index"] is not None:
            alvo_idx = st.session_state["guess_target_index"]
            acorde_esperado = acordes[alvo_idx]["chord_majmin"]
            st.markdown(f"### Pausado no final do acorde. Toque o próximo acorde no violão e envie o áudio.")

            uploaded_audio = st.file_uploader("Envie o áudio do acorde tocado", type=["mp3", "wav"])

            if uploaded_audio is not None:
                with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(uploaded_audio.name)[1]) as tmp_file:
                    tmp_file.write(uploaded_audio.read())
                    caminho_audio_usuario = tmp_file.name

                with st.spinner("Detectando o acorde..."):
                    try:
                        acorde_detectado = get_chords_from_audio(caminho_audio_usuario)
                        st.write(f"Você tocou o acorde: **{acorde_detectado}**")
                        if acorde_detectado == acorde_esperado:
                            st.success("✅ Acertou! Retomando a música...")
                            st.session_state["score"] += 1
                            st.session_state["paused"] = False
                            st.session_state["awaiting_next_guess"] = False
                            st.session_state["indice"] = alvo_idx
                            st.session_state["start_time"] = time.time() - acordes[alvo_idx]["start"]
                            st.session_state["autoplay_requested"] = True
                            st.session_state["pause_armed_index"] = -1
                        else:
                            st.error(f"❌ Errou. O acorde correto é: {acorde_esperado}")
                    except Exception as e:
                        st.error(f"Erro na detecção do acorde: {e}")
                    finally:
                        os.remove(caminho_audio_usuario)
            else:
                st.info("Envie um áudio para detecção.")
        else:
            st.info("Jogo pausado.")
else:
    st.write("Selecione uma música e clique em Iniciar para jogar.")