# ARQUIVO PRA TESTAR A FUNCIONALIDADE DE DETECTAR O ACORDE TOCADO PELO USUÁRIO

import streamlit as st
from modulos.detect_user_chord import run_learner_mode

def main():
    st.set_page_config(page_title="U.mi 🎸", layout="centered")

    st.sidebar.title("🎵 Navegação")
    page = st.sidebar.radio("Escolha o modo:", ["Modo Aprendiz"])

    if page == "Modo Aprendiz":
        run_learner_mode()

if __name__ == "__main__":
    main()