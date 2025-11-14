"""
API REST Flask para integração com o frontend React Native
Substitui as funcionalidades do Streamlit por endpoints HTTP
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import os
from werkzeug.utils import secure_filename
from modulos import chord_detector, comparador, extract_music_chords
import traceback
import requests

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Permite requisições do frontend de qualquer origem

# Middleware para logar todas as requisições
@app.before_request
def log_request_info():
    if request.path.startswith('/api/'):
        print("=" * 50)
        print(f"REQUEST RECEBIDA: {request.method} {request.path}")
        print(f"Content-Type: {request.content_type}")
        print(f"Files: {list(request.files.keys())}")
        print(f"Form: {list(request.form.keys())}")
        if 'audio' in request.form:
            audio_val = request.form.get('audio')
            print(f"Form['audio'] type: {type(audio_val)}, length: {len(str(audio_val)) if audio_val else 0}")
        print("=" * 50)

# Configurações
UPLOAD_FOLDER = 'temp_uploads'
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'm4a', 'ogg'}

# Criar pasta de uploads temporários se não existir
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file):
    """Salva arquivo enviado e retorna o caminho"""
    if not file:
        return None
    
    import time
    
    # Se não houver filename ou estiver vazio, usar um nome padrão
    if not file.filename or file.filename.strip() == '':
        filename = f"audio_{int(time.time())}.wav"
    else:
        filename = secure_filename(file.filename)
        # Se o filename não tiver extensão, adicionar .wav
        if '.' not in filename:
            filename += '.wav'
    
    # Verificar extensão permitida
    if not allowed_file(filename):
        return None
    
    # Criar nome único para evitar conflitos
    unique_filename = f"{int(time.time())}_{filename}"
    filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(filepath)
    return filepath

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de health check"""
    return jsonify({
        'status': 'ok',
        'message': 'API está funcionando'
    }), 200

@app.route('/api/detect-chord', methods=['POST'])
def detect_chord():
    """
    Detecta acorde de um áudio enviado
    Retorna o primeiro acorde detectado
    """
    try:
        file = None
        filepath = None
        
        # Tentar obter arquivo de request.files primeiro (formato padrão)
        if 'audio' in request.files:
            file = request.files['audio']
            if file.filename != '':
                filepath = save_uploaded_file(file)
        
        # Se não encontrou em files, pode ser que o arquivo tenha vindo incorretamente
        # No web, o FormData com Blob deveria aparecer em request.files
        # Se veio em form, provavelmente é um problema de envio
        if not filepath:
            print("⚠️ Arquivo não encontrado em request.files")
            print(f"   request.files: {list(request.files.keys())}")
            print(f"   request.form: {list(request.form.keys())}")
            if 'audio' in request.form:
                audio_val = request.form.get('audio')
                print(f"   request.form['audio']: tipo={type(audio_val)}, tamanho={len(str(audio_val))}")
                print(f"   Primeiros 100 chars: {str(audio_val)[:100]}")
        
        if not filepath:
            return jsonify({
                'error': 'Nenhum arquivo de áudio enviado ou erro ao processar arquivo',
                'debug': {
                    'files_keys': list(request.files.keys()),
                    'form_keys': list(request.form.keys()),
                    'content_type': request.content_type
                }
            }), 400
        
        try:
            # Detectar acordes
            workflow_id = request.form.get('workflow_id', 'untitled-workflow-18c7355')
            chords = chord_detector.get_chords_from_audio(filepath, workflow_id)
            
            # Retornar o primeiro acorde detectado (ou None se vazio)
            detected_chord = chords[0] if chords else None
            
            return jsonify({
                'success': True,
                'chord': detected_chord,
                'all_chords': chords,
                'message': f'Acorde detectado: {detected_chord}' if detected_chord else 'Nenhum acorde detectado'
            }), 200
            
        finally:
            # Limpar arquivo temporário
            if os.path.exists(filepath):
                os.remove(filepath)
                
    except Exception as e:
        print(f"DEBUG: Exceção capturada: {str(e)}")
        print(f"DEBUG: Traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro ao processar áudio',
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/compare-chords', methods=['POST'])
def compare_chords():
    """
    Compara dois áudios: gabarito (referência) e tocado (usuário)
    Retorna se o acorde tocado está correto
    """
    try:
        if 'gabarito' not in request.files or 'tocado' not in request.files:
            return jsonify({'error': 'É necessário enviar dois arquivos: gabarito e tocado'}), 400
        
        gabarito_file = request.files['gabarito']
        tocado_file = request.files['tocado']
        
        # Salvar arquivos temporários
        gabarito_path = save_uploaded_file(gabarito_file)
        tocado_path = save_uploaded_file(tocado_file)
        
        if not gabarito_path or not tocado_path:
            return jsonify({'error': 'Erro ao salvar arquivos'}), 400
        
        try:
            # Comparar acordes
            resultado = comparador.comparar_com_moises(gabarito_path, tocado_path)
            
            # Extrair informações do resultado
            is_correct = '✅' in resultado or 'Correto' in resultado
            chord_gabarito = None
            chord_tocado = None
            
            # Tentar extrair os acordes da mensagem
            if 'tocou' in resultado:
                parts = resultado.split('tocou')
                if len(parts) > 1:
                    chord_tocado = parts[1].split('!')[0].strip()
            if 'gabarito era' in resultado:
                parts = resultado.split('gabarito era')
                if len(parts) > 1:
                    chord_gabarito = parts[1].split(',')[0].strip()
            
            return jsonify({
                'success': True,
                'is_correct': is_correct,
                'message': resultado,
                'chord_gabarito': chord_gabarito,
                'chord_tocado': chord_tocado
            }), 200
            
        finally:
            # Limpar arquivos temporários
            if gabarito_path and os.path.exists(gabarito_path):
                os.remove(gabarito_path)
            if tocado_path and os.path.exists(tocado_path):
                os.remove(tocado_path)
                
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro ao comparar áudios'
        }), 500

@app.route('/api/extract-chords', methods=['POST'])
def extract_chords():
    """
    Extrai todos os acordes de uma música com timestamps
    Retorna lista de acordes com start, end e chord_majmin
    """
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'Nenhum arquivo de áudio enviado'}), 400
        
        file = request.files['audio']
        
        # Salvar arquivo temporário
        filepath = save_uploaded_file(file)
        if not filepath:
            return jsonify({'error': 'Erro ao salvar arquivo ou tipo de arquivo não permitido'}), 400
        
        try:
            # Extrair acordes com timestamps
            workflow_id = request.form.get('workflow_id', 'untitled-workflow-18c7355')
            chords = extract_music_chords.main(filepath, workflow_id)
            
            return jsonify({
                'success': True,
                'chords': chords,
                'count': len(chords),
                'message': f'{len(chords)} acordes detectados'
            }), 200
            
        finally:
            # Limpar arquivo temporário
            if os.path.exists(filepath):
                os.remove(filepath)
                
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro ao extrair acordes'
        }), 500

@app.route('/api/detect-chord-first', methods=['POST'])
def detect_chord_first():
    """
    Detecta o primeiro acorde de um áudio (wrapper para usar extract_music_chords)
    Útil para quando você só quer o primeiro acorde com informações de timestamp
    """
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'Nenhum arquivo de áudio enviado'}), 400
        
        file = request.files['audio']
        
        filepath = save_uploaded_file(file)
        if not filepath:
            return jsonify({'error': 'Tipo de arquivo não permitido'}), 400
        
        try:
            workflow_id = request.form.get('workflow_id', 'untitled-workflow-18c7355')
            chords = extract_music_chords.main(filepath, workflow_id)
            
            if chords and len(chords) > 0:
                first_chord = chords[0]
                return jsonify({
                    'success': True,
                    'chord': first_chord.get('chord_majmin'),
                    'start': first_chord.get('start'),
                    'end': first_chord.get('end'),
                    'full_data': first_chord
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'message': 'Nenhum acorde detectado'
                }), 200
                
        finally:
            # Limpar arquivo temporário
            if os.path.exists(filepath):
                os.remove(filepath)
                
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ===== CIFRA CLUB API PROXY =====
CIFRACLUB_API_URL = os.getenv('CIFRACLUB_API_URL', 'http://localhost:3000')

@app.route('/api/cifra/<artist>/<song>', methods=['GET'])
def get_cifra(artist, song):
    print("=" * 50)
    print(f"🎯 REQUISIÇÃO RECEBIDA: /api/cifra/{artist}/{song}")
    print(f"📝 Artista: {artist}, Música: {song}")
    print(f"🌐 CIFRACLUB_API_URL: {CIFRACLUB_API_URL}")
    print("=" * 50)
    
    try:
        # Normalizar artista e música para URL (já vem normalizado do frontend)
        artist_normalized = artist.lower().replace(' ', '-')
        song_normalized = song.lower().replace(' ', '-')
        
        # Fazer requisição para cifraclub-api
        url = f"{CIFRACLUB_API_URL}/artists/{artist_normalized}/songs/{song_normalized}"
        print(f"🔍 Buscando cifra: {url}")
        print(f"⏱️ Timeout configurado: 120 segundos")
        
        response = requests.get(url, timeout=120)  # Aumentado para 120 segundos (2 minutos)
        print(f"📥 Resposta recebida: status={response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Cifra encontrada: {data.get('name', 'N/A')} - {data.get('artist', 'N/A')}")
            
            # Logs detalhados da resposta
            print(f"📄 Estrutura da resposta:")
            print(f"   - Chaves: {list(data.keys())}")
            print(f"   - Tem 'cifra': {'cifra' in data}")
            if 'cifra' in data:
                cifra_value = data.get('cifra')
                print(f"   - Tipo de 'cifra': {type(cifra_value)}")
                if isinstance(cifra_value, list):
                    print(f"   - Tamanho da lista: {len(cifra_value)}")
                    if len(cifra_value) > 0:
                        # Mostrar primeiras 3 linhas não vazias
                        non_empty = [line for line in cifra_value[:10] if line.strip()]
                        print(f"   - Primeiras linhas não vazias: {non_empty[:3] if non_empty else 'nenhuma linha não vazia'}")
                    else:
                        print(f"   - ⚠️ Lista de cifra está VAZIA!")
                else:
                    print(f"   - ⚠️ 'cifra' não é uma lista! Tipo: {type(cifra_value)}")
            if 'error' in data:
                print(f"⚠️ Resposta contém erro: {data.get('error')}")
            
            return jsonify(data), 200
        else:
            print(f"❌ Erro na resposta: {response.status_code}")
            return jsonify({
                'error': f'Erro ao buscar cifra: {response.status_code}',
                'message': 'Não foi possível encontrar a cifra'
            }), response.status_code
            
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Erro de conexão: {e}")
        print(f"💡 Verifique se a cifraclub-api está rodando em {CIFRACLUB_API_URL}")
        return jsonify({
            'error': 'CifraClub API não está disponível',
            'message': 'Certifique-se de que a cifraclub-api está rodando na porta 3000'
        }), 503
    except requests.exceptions.Timeout as e:
        print(f"⏱️ Timeout: {e}")
        return jsonify({
            'error': 'Timeout ao buscar cifra',
            'message': 'A requisição demorou muito para responder (mais de 2 minutos)'
        }), 504
    except Exception as e:
        print(f"❌ Erro ao buscar cifra: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'message': 'Erro inesperado ao buscar cifra'
        }), 500

@app.route('/api/cifra/health', methods=['GET'])
def cifra_health():
    """Verifica se a cifraclub-api está disponível"""
    try:
        response = requests.get(f"{CIFRACLUB_API_URL}/", timeout=10)  # Aumentado de 5 para 10
        return jsonify({
            'cifraclub_api_available': response.status_code == 200,
            'cifraclub_api_url': CIFRACLUB_API_URL
        }), 200
    except:
        return jsonify({
            'cifraclub_api_available': False,
            'cifraclub_api_url': CIFRACLUB_API_URL
        }), 200

if __name__ == '__main__':
    # Configurar porta e host
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'True').lower() == 'true'
    
    print(f"🚀 Iniciando servidor Flask na porta {port}")
    print(f"📡 API disponível em http://localhost:{port}")
    print(f"🔍 Endpoints disponíveis:")
    print(f"   - GET  /api/health")
    print(f"   - POST /api/detect-chord")
    print(f"   - POST /api/compare-chords")
    print(f"   - POST /api/extract-chords")
    print(f"   - POST /api/detect-chord-first")
    print(f"   - GET  /api/cifra/<artist>/<song>")
    print(f"   - GET  /api/cifra/health")
    
    app.run(host='0.0.0.0', port=port, debug=debug)

