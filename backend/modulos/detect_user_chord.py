import streamlit as st
import tempfile
import os
from modulos import comparador


def run_learner_mode():
    st.set_page_config(page_title="Modo Aprendiz 🎸", layout="centered")
    st.title("🎶 Modo Aprendiz — Treine seus acordes!")

    st.write("Envie dois áudios: o **gabarito** (acorde correto) e o **áudio tocado** (sua tentativa).")

    # Upload do áudio gabarito
    gabarito = st.file_uploader("📘 Envie o áudio do gabarito", type=["mp3", "wav"], key="gabarito")
    # Upload do áudio tocado
    tocado = st.file_uploader("🎸 Envie o áudio que você tocou", type=["mp3", "wav"], key="tocado")

    if gabarito and tocado:
        # Salvar arquivos temporários
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(gabarito.name)[1]) as gabarito_temp:
            gabarito_temp.write(gabarito.read())
            gabarito_path = gabarito_temp.name

        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(tocado.name)[1]) as tocado_temp:
            tocado_temp.write(tocado.read())
            tocado_path = tocado_temp.name

        st.audio(gabarito, format="audio/wav" if gabarito.name.endswith(".wav") else "audio/mp3")
        st.audio(tocado, format="audio/wav" if tocado.name.endswith(".wav") else "audio/mp3")

        st.success("✅ Áudios carregados com sucesso!")

        if st.button("Comparar acordes 🎧"):
            with st.spinner("Analisando os dois áudios... 🎶"):
                try:
                    resultado = comparador.comparar_com_moises(gabarito_path, tocado_path)
                    st.markdown("### 🧩 Resultado da comparação:")
                    st.write(resultado)

                except Exception as e:
                    st.error(f"❌ Erro ao processar os áudios: {e}")

                finally:
                    os.remove(gabarito_path)
                    os.remove(tocado_path)