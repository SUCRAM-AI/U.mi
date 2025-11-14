# ARQUIVO CRIADO PARA COMPARAR O ACORDE TOCADO PELO USUÁRIO E O DA MÚSICA

from modulos import chord_detector

def comparar_com_moises(gabarito, tocado):
    workflow = "untitled-workflow-18c7355"

    print("🎵 Processando gabarito...") 
    acordes_gabarito = chord_detector.get_chords_from_audio(gabarito, workflow)

    print("🎵 Processando áudio tocado...")
    acordes_tocado = chord_detector.get_chords_from_audio(tocado, workflow)

    # Comparação simples
    if not acordes_gabarito or not acordes_tocado:
        return "⚠️ Não foi possível detectar acordes em um dos áudios."

    if acordes_gabarito[0] == acordes_tocado[0]:
        return f"✅ Correto! Você tocou {acordes_tocado[0]}!"
    else:
        return f"❌ Errado! O gabarito era {acordes_gabarito[0]}, mas você tocou {acordes_tocado[0]}."


# Teste rápido
if __name__ == "__main__":
    gabarito = "acordes/A (Lá).wav"
    tocado = "acordes/A (Lá) 2.wav"
    print(comparar_com_moises(gabarito, tocado))
