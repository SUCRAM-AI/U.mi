# PARA INICIAR DIGITE NO TERMINAL 'streamlit run app.py'


import streamlit as st
import tempfile
import os
import sys
from modulos import chord_detector
from st_audiorec import st_audiorec

def run_learner_mode():
    st.set_page_config(page_title="Modo Aprendiz 🎸", layout="centered")
    st.title("🎶 Modo Aprendiz — Treine seus acordes!")

    st.write("Grave seu som e o sistema vai tentar reconhecer o acorde!")

    # gravação do áudio direto do microfone
    audio_bytes = st_audiorec()

    if audio_bytes:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            temp_audio.write(audio_bytes)
            temp_path = temp_audio.name

        st.audio(audio_bytes, format="audio/wav")
        st.success("Áudio gravado com sucesso!")

        if st.button("Detectar acorde 🎧"):
            with st.spinner("Analisando o som..."):
                try:
                    chord_detector.app(temp_path)
                    st.success("✅ Acorde detectado! Veja o resultado no terminal.")
                except Exception as e:
                    st.error(f"Erro ao processar: {e}")

    st.markdown("---")
    st.caption("Feito com ❤️ no modo aprendiz")
