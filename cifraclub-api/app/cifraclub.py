"""CifraClub Module"""

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.firefox.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time

CIFRACLUB_URL = "https://www.cifraclub.com.br/"

class CifraClub():
    """CifraClub Class"""
    def __init__(self):
        options = Options()
        # Otimizações para velocidade
        options.add_argument('--headless')  # Modo headless (sem interface gráfica)
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        
        # Bloquear imagens e recursos desnecessários (mantém JS ativo pois o site precisa)
        options.set_preference('permissions.default.image', 2)  # Bloquear imagens
        options.set_preference('dom.webnotifications.enabled', False)
        options.set_preference('media.volume_scale', '0.0')
        
        # Desabilitar CSS e fontes para velocidade (opcional, pode quebrar layout mas acelera)
        # options.set_preference('permissions.default.stylesheet', 2)  # Descomentar se necessário
        
        self.driver = webdriver.Remote("http://selenium:4444/wd/hub", options=options)
        
        # Configurar timeouts mais agressivos
        self.driver.set_page_load_timeout(30)  # Timeout de carregamento de página
        self.driver.implicitly_wait(5)  # Espera implícita reduzida

    def cifra(self, artist: str, song: str) -> dict:
        """Lê a página HTML e extrai a cifra e meta dados da música."""
        result = {}

        url = CIFRACLUB_URL + artist + "/" + song
        result['cifraclub_url'] = url
        try:
            print(f"🌐 Acessando URL: {url}")
            self.driver.get(url)
            
            # Espera otimizada - reduzir timeout e usar estratégias mais eficientes
            wait = WebDriverWait(self.driver, 15)  # Reduzido de 20 para 15 segundos
            
            # Tentar encontrar o elemento cifra com estratégia otimizada
            cifra_element = None
            try:
                # Estratégia 1: Esperar pelo elemento cifra diretamente (mais rápido)
                cifra_element = wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'cifra')))
                print("✅ Elemento 'cifra' encontrado rapidamente")
            except TimeoutException:
                try:
                    # Estratégia 2: Esperar pelo body (mais rápido que esperar por tudo)
                    wait.until(EC.presence_of_element_located((By.TAG_NAME, 'body')))
                    print("⚠️ Esperando elemento 'cifra' aparecer...")
                    # Espera reduzida - verificar se elemento aparece
                    for i in range(6):  # 6 tentativas de 0.5s = 3s total (reduzido de 3s fixo)
                        try:
                            cifra_element = self.driver.find_element(By.CLASS_NAME, 'cifra')
                            print(f"✅ Elemento 'cifra' encontrado após {i * 0.5}s")
                            break
                        except NoSuchElementException:
                            time.sleep(0.5)  # Espera menor e mais frequente
                    else:
                        raise NoSuchElementException("Elemento não encontrado após espera")
                except NoSuchElementException:
                    print("❌ Elemento 'cifra' não encontrado na página")
                    result['error'] = 'Elemento da cifra não encontrado na página. A estrutura do site pode ter mudado.'
                    result['cifra'] = []
                    self.driver.quit()
                    return result
            
            if cifra_element:
                self.get_details(result)
                self.get_cifra(result)
            else:
                result['error'] = 'Não foi possível encontrar o elemento da cifra na página'
                result['cifra'] = []
            
            self.driver.quit()
        except Exception as e: # pylint: disable=broad-except
            result['error'] = str(e)
            print(f"❌ Erro ao buscar cifra: {e}")
            if self.driver:
                try:
                    self.driver.quit()
                except:
                    pass

        return result

    def get_details(self, result):
        """Obtêm os meta dados da música"""
        try:
            # Buscar elementos diretamente (mais rápido que parsear HTML completo)
            try:
                h1_element = self.driver.find_element(By.CSS_SELECTOR, 'h1.t1, h1')
                result['name'] = h1_element.text.strip() if h1_element else 'Nome não encontrado'
            except NoSuchElementException:
                result['name'] = 'Nome não encontrado'
            
            try:
                h2_element = self.driver.find_element(By.CSS_SELECTOR, 'h2.t3, h2')
                result['artist'] = h2_element.text.strip() if h2_element else 'Artista não encontrado'
            except NoSuchElementException:
                result['artist'] = 'Artista não encontrado'
            
            # URL do YouTube - buscar apenas se necessário (lazy loading)
            result['youtube_url'] = None
            try:
                # Buscar diretamente o elemento da imagem do YouTube
                player_div = self.driver.find_element(By.CSS_SELECTOR, 'div.player-placeholder img')
                img_youtube = player_div.get_attribute('src') if player_div else ''
                
                if img_youtube:
                    if '/vi/' in img_youtube:
                        cod = img_youtube.split('/vi/')[1].split('/')[0]
                        result['youtube_url'] = f"https://www.youtube.com/watch?v={cod}"
                    elif 'watch?v=' in img_youtube:
                        cod = img_youtube.split('watch?v=')[1].split('&')[0]
                        result['youtube_url'] = f"https://www.youtube.com/watch?v={cod}"
                    elif 'youtu.be/' in img_youtube:
                        cod = img_youtube.split('youtu.be/')[1].split('?')[0]
                        result['youtube_url'] = f"https://www.youtube.com/watch?v={cod}"
            except (NoSuchElementException, AttributeError, IndexError, KeyError) as e:
                # Se não conseguir extrair a URL do YouTube, continua sem ela
                print(f"⚠️ Não foi possível extrair URL do YouTube: {e}")
                result['youtube_url'] = None
        except Exception as e:
            print(f"❌ Erro ao obter detalhes: {e}")
            result['name'] = 'Erro ao obter nome'
            result['artist'] = 'Erro ao obter artista'

    def get_cifra(self, result):
        """Obtêm a cifra da música e converte para json"""
        try:
            # Estratégia otimizada: buscar diretamente o elemento pre (mais rápido)
            pre_element = None
            try:
                # Tentar primeiro o seletor mais específico e rápido
                pre_element = self.driver.find_element(By.CSS_SELECTOR, '.cifra_cnt pre, .cifra pre, pre')
                print("✅ Elemento 'pre' encontrado diretamente")
            except NoSuchElementException:
                try:
                    # Fallback: buscar dentro de cifra_cnt
                    cifra_cnt = self.driver.find_element(By.CLASS_NAME, 'cifra_cnt')
                    pre_element = cifra_cnt.find_element(By.TAG_NAME, 'pre')
                    print("✅ Elemento 'pre' encontrado dentro de cifra_cnt")
                except NoSuchElementException:
                    try:
                        # Último fallback: buscar qualquer pre
                        pre_element = self.driver.find_element(By.TAG_NAME, 'pre')
                        print("⚠️ Usando tag 'pre' como fallback")
                    except NoSuchElementException:
                        print("❌ Elemento 'pre' não encontrado")
                        result['cifra'] = []
                        if 'error' not in result:
                            result['error'] = 'Cifra não encontrada na página'
                        return
            
            # Extrair texto diretamente do elemento (mais rápido que parsear HTML)
            if pre_element:
                cifra_text = pre_element.text
                if cifra_text:
                    result['cifra'] = cifra_text.split('\n')
                    print(f"✅ Cifra extraída: {len(result['cifra'])} linhas")
                else:
                    result['cifra'] = []
                    if 'error' not in result:
                        result['error'] = 'Cifra encontrada mas está vazia'
            else:
                result['cifra'] = []
                if 'error' not in result:
                    result['error'] = 'Cifra não encontrada na página'
        except Exception as e:
            print(f"❌ Erro ao extrair cifra: {e}")
            result['cifra'] = []
            if 'error' not in result:
                result['error'] = f'Erro ao extrair cifra: {str(e)}'
