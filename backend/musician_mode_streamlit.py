# ARQUIVO CRIADO PRA TESTAR O MODO MÚSICO "COMPLETO" RODANDO


import streamlit as st
import time
import json
import tempfile
from modulos.chord_detector import get_chords_from_audio


with open("acordes.json", "r", encoding="utf-8") as arquivo:
    acordes = json.load(arquivo)


# Estado inicial
if "start_time" not in st.session_state:
    st.session_state["start_time"] = None
if "indice" not in st.session_state:
    st.session_state["indice"] = 0
if "tocando" not in st.session_state:
    st.session_state["tocando"] = False
if "paused" not in st.session_state:
    st.session_state["paused"] = False

st.title("Player com sincronização e reconhecimento de acorde")

# Upload da música principal
music_file = st.file_uploader("Envie a música para tocar", type=["mp3", "wav"])

if music_file:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        tmp.write(music_file.read())
        music_path = tmp.name

    st.audio(music_path)

    if not st.session_state["tocando"]:
        st.session_state["start_time"] = time.time()
        st.session_state["tocando"] = True
        st.session_state["indice"] = 0
        st.session_state["paused"] = False

    if not st.session_state["paused"]:
        elapsed = time.time() - st.session_state["start_time"]
        st.write(f"Tempo decorrido: {elapsed:.2f}s")
        st.write(f"Índice acorde atual: {st.session_state['indice']}")

        while (st.session_state["indice"] + 1 < len(acordes) and elapsed >= acordes[st.session_state["indice"] + 1]["start"]):
            st.session_state["indice"] += 1


        acorde_atual = acordes[st.session_state["indice"]]["chord_majmin"]
        st.write(f"Acorde atual: **{acorde_atual}**")

        # Pausa em um acorde específico para teste - exemplo índice 1
        if st.session_state["indice"] == 1:
            st.session_state["paused"] = True
            st.session_state["tocando"] = False
            st.write("Pausa! Toque o acorde e envie o arquivo do seu áudio para verificação.")

    if st.session_state["paused"]:
        user_audio = st.file_uploader("Envie o áudio do acorde que você tocou", type=["mp3", "wav"])

        if user_audio:
            # Salvar o áudio do usuário temporariamente
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_user:
                tmp_user.write(user_audio.read())
                user_audio_path = tmp_user.name

            # Aqui você chama sua função/api para reconhecer o acorde
            # Exemplo placeholder:
            acorde_reconhecido = get_chords_from_audio(user_audio)

            st.write(f"Acorde reconhecido: {acorde_reconhecido}")

            # Verifica se acertou
            if acorde_reconhecido == acordes[st.session_state["indice"]]["chord_majmin"]:
                st.success("✅ Acertou! Avançando para o próximo acorde.")
                st.session_state["indice"] += 1
                st.session_state["paused"] = False
                st.session_state["tocando"] = True
                st.session_state["start_time"] = time.time()  # reset timer para o próximo acorde
            else:
                st.error("❌ Acorde errado, tente novamente.")

    # Atualização da tela para manter sincronização
    time.sleep(1)
    st.rerun()

else:
    st.write("Envie o arquivo da música para começar a tocar.")
