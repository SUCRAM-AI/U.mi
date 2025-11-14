"""
API Flask para detecção de acordes em tempo real
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
import requests
from modulos.chord_detector import detect_chord_from_bytes, get_chords_from_audio

app = Flask(__name__)
CORS(app)  # Permitir requisições do frontend

# Chave da API OpenAI (pode ser movida para .env depois)
OPENAI_API_KEY = 'sk-hh8ANYrDLAsbXVKpAvlYoJX19ehWU8jOsaXXW1L1p8T3BlbkFJvAi2cgIWWmed4ITA-ITerZu2Yi_NpgBXs2yPKQhw0A'
OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

# Criar diretório temporário se não existir
TEMP_DIR = os.path.join(os.path.dirname(__file__), "temp_uploads")
os.makedirs(TEMP_DIR, exist_ok=True)


@app.route('/api/health', methods=['GET'])
def health():
    """Endpoint de health check"""
    return jsonify({
        "status": "ok",
        "message": "API está funcionando"
    }), 200


@app.route('/api/detect-chord', methods=['POST'])
def detect_chord():
    """
    Detecta acorde de um áudio enviado via FormData.
    
    Recebe:
        - audio: arquivo de áudio (mp3, wav, m4a, ogg, etc.)
    
    Retorna:
        {   
            "success": bool,
            "chord": str | null,  # Acorde detectado (ex: "C", "Am")
            "all_chords": list[str],  # Todos os acordes detectados
            "message": str
        }
    """
    try:
        # Verificar se o arquivo foi enviado
        if 'audio' not in request.files:
            return jsonify({
                "success": False,
                "chord": None,
                "all_chords": [],
                "message": "Nenhum arquivo de áudio foi enviado",
                "error": "Missing audio file"
            }), 400

        audio_file = request.files['audio']
        
        if audio_file.filename == '':
            return jsonify({
                "success": False,
                "chord": None,
                "all_chords": [],
                "message": "Arquivo de áudio vazio",
                "error": "Empty file"
            }), 400

        # Ler os dados do arquivo
        audio_bytes = audio_file.read()
        
        if not audio_bytes:
            return jsonify({
                "success": False,
                "chord": None,
                "all_chords": [],
                "message": "Arquivo de áudio está vazio",
                "error": "Empty audio data"
            }), 400

        print("[INFO] Recebido arquivo de audio: {}, tamanho: {} bytes".format(audio_file.filename, len(audio_bytes)))

        # Detectar acorde usando o chord_detector
        try:
            # Usar a função que aceita bytes diretamente
            acordes = get_chords_from_audio(audio_bytes, is_bytes=True)
            
            if not acordes:
                return jsonify({
                    "success": False,
                    "chord": None,
                    "all_chords": [],
                    "message": "Nenhum acorde foi detectado no áudio",
                    "error": "No chords detected"
                }), 200  # 200 porque não é erro do servidor, apenas não detectou

            # Pegar o primeiro acorde como principal
            acorde_principal = acordes[0]
            
            return jsonify({
                "success": True,
                "chord": acorde_principal,
                "all_chords": acordes,
                "message": "Acorde detectado: {}".format(acorde_principal)
            }), 200

        except Exception as e:
            print("[ERRO] Erro ao detectar acorde: {}".format(str(e)))
            return jsonify({
                "success": False,
                "chord": None,
                "all_chords": [],
                "message": "Erro ao processar audio: {}".format(str(e)),
                "error": str(e)
            }), 500

    except Exception as e:
        print("[ERRO] Erro geral: {}".format(str(e)))
        return jsonify({
            "success": False,
            "chord": None,
            "all_chords": [],
            "message": "Erro ao processar requisicao: {}".format(str(e)),
            "error": str(e)
        }), 500


@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    """
    Endpoint proxy para o chatbot OpenAI.
    
    Recebe:
        {
            "messages": [
                {"role": "user", "content": "mensagem do usuário"},
                ...
            ],
            "lessonContext": "contexto opcional da lição"
        }
    
    Retorna:
        {
            "success": bool,
            "message": str,  # Resposta do chatbot
            "error": str | null
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'messages' not in data:
            return jsonify({
                "success": False,
                "message": "Formato inválido. Envie 'messages' no corpo da requisição.",
                "error": "Invalid request format"
            }), 400
        
        messages = data.get('messages', [])
        lesson_context = data.get('lessonContext', '')
        
        # Preparar mensagem do sistema com contexto
        context_text = lesson_context if lesson_context else ''
        system_content = """Voce e um assistente virtual especializado em ensino de violao e musica. Sua funcao e ajudar estudantes durante o processo de aprendizado, respondendo duvidas sobre:
- Anatomia do violao e seus componentes
- Numeracao dos dedos e tecnicas de posicionamento
- Leitura de tablatura e notacao musical
- Acordes (maiores, menores, basicos)
- Escalas musicais
- Ritmo e simbolos ritmicos
- Progressoes de acordes
- Pratica de exercicios

{}

Seja claro, didatico e encorajador. Use linguagem simples e exemplos praticos quando possivel. Se nao souber algo, seja honesto e sugira que o estudante consulte a licao especifica ou pratique mais.""".format(context_text)
        
        system_message = {
            "role": "system",
            "content": system_content
        }
        
        all_messages = [system_message] + messages
        
        # Chamar API da OpenAI
        response = requests.post(
            OPENAI_API_URL,
            headers={
                'Content-Type': 'application/json',
                'Authorization': 'Bearer {}'.format(OPENAI_API_KEY),
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': all_messages,
                'temperature': 0.7,
                'max_tokens': 500,
            },
            timeout=30
        )
        
        if not response.ok:
            error_data = response.json() if response.content else {}
            error_msg = error_data.get('error', {}).get('message', 'Erro na API: {}'.format(response.status_code))
            print("[ERRO] Erro na API OpenAI: {}".format(error_msg))
            return jsonify({
                "success": False,
                "message": "Erro ao processar mensagem: {}".format(error_msg),
                "error": error_msg
            }), response.status_code
        
        result = response.json()
        assistant_message = result.get('choices', [{}])[0].get('message', {}).get('content', 'Desculpe, não consegui gerar uma resposta.')
        
        return jsonify({
            "success": True,
            "message": assistant_message,
            "error": None
        }), 200
        
    except requests.exceptions.Timeout:
        return jsonify({
            "success": False,
            "message": "Tempo de espera esgotado. Por favor, tente novamente.",
            "error": "Request timeout"
        }), 504
    except requests.exceptions.RequestException as e:
        print("[ERRO] Erro na requisicao: {}".format(str(e)))
        return jsonify({
            "success": False,
            "message": "Erro de conexao: {}".format(str(e)),
            "error": str(e)
        }), 500
    except Exception as e:
        print("[ERRO] Erro geral no chatbot: {}".format(str(e)))
        return jsonify({
            "success": False,
            "message": "Erro ao processar requisicao: {}".format(str(e)),
            "error": str(e)
        }), 500


if __name__ == '__main__':
    # Configurações para desenvolvimento
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    print("[INFO] Iniciando servidor Flask na porta {}".format(port))
    print("[INFO] Endpoints disponiveis:")
    print("   - GET  /api/health")
    print("   - POST /api/detect-chord")
    print("   - POST /api/chatbot")
    
    app.run(host='0.0.0.0', port=port, debug=debug)