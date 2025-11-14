"""
API Flask para detecção de acordes em tempo real
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
from modulos.chord_detector import detect_chord_from_bytes, get_chords_from_audio

app = Flask(__name__)
CORS(app)  # Permitir requisições do frontend

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

        print(f"📥 Recebido arquivo de áudio: {audio_file.filename}, tamanho: {len(audio_bytes)} bytes")

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
                "message": f"Acorde detectado: {acorde_principal}"
            }), 200

        except Exception as e:
            print(f"❌ Erro ao detectar acorde: {str(e)}")
            return jsonify({
                "success": False,
                "chord": None,
                "all_chords": [],
                "message": f"Erro ao processar áudio: {str(e)}",
                "error": str(e)
            }), 500

    except Exception as e:
        print(f"❌ Erro geral: {str(e)}")
        return jsonify({
            "success": False,
            "chord": None,
            "all_chords": [],
            "message": f"Erro ao processar requisição: {str(e)}",
            "error": str(e)
        }), 500


if __name__ == '__main__':
    # Configurações para desenvolvimento
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"🚀 Iniciando servidor Flask na porta {port}")
    print(f"📡 Endpoints disponíveis:")
    print(f"   - GET  /api/health")
    print(f"   - POST /api/detect-chord")
    
    app.run(host='0.0.0.0', port=port, debug=debug)