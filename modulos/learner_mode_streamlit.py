import streamlit as st
import tempfile
import os
import sys
# Certifique-se de que o módulo 'chord_detector' está corretamente importado
from modulos import chord_detector
from st_audiorec import st_audiorec

def run_learner_mode():
    st.set_page_config(page_title="Modo Aprendiz 🎸", layout="centered")
    st.title("🎶 Modo Aprendiz — Treine seus acordes!")

    st.write("Grave seu som e o sistema vai tentar reconhecer o acorde!")

    # gravação do áudio direto do microfone
    audio_bytes = st_audiorec()

    if audio_bytes:
        # Cria um arquivo temporário para salvar o áudio gravado
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            temp_audio.write(audio_bytes)
            temp_path = temp_audio.name

        st.audio(audio_bytes, format="audio/wav")
        st.success("Áudio gravado com sucesso!")

        if st.button("Detectar acorde 🎧"):
            with st.spinner("Analisando o som..."):
                try:
                    # 💡 MUDANÇA AQUI: Captura o valor retornado pela função 'app'
                    # (Você deve garantir que chord_detector.app RETORNE o acorde)
                    detected_chord = chord_detector.app(temp_path)
                    
                    if detected_chord:
                        st.success("✅ Acorde detectado!")
                        # Exibe o acorde detectado na interface do Streamlit
                        st.info(f"O acorde detectado é: **{detected_chord}**")
                    else:
                        st.warning("O sistema não conseguiu detectar um acorde claro.")

                except Exception as e:
                    st.error(f"Erro ao processar: {e}")
                finally:
                    # Limpa o arquivo temporário
                    if os.path.exists(temp_path):
                        os.remove(temp_path)

    st.markdown("---")
    st.caption("Feito com ❤️ no modo aprendiz")
