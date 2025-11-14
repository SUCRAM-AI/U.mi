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
        self.driver = webdriver.Remote("http://selenium:4444/wd/hub", options=options)

    def cifra(self, artist: str, song: str) -> dict:
        """Lê a página HTML e extrai a cifra e meta dados da música."""
        result = {}

        url = CIFRACLUB_URL + artist + "/" + song
        result['cifraclub_url'] = url
        try:
            print(f"🌐 Acessando URL: {url}")
            self.driver.get(url)
            
            # Espera a página carregar completamente - aumentar timeout
            wait = WebDriverWait(self.driver, 20)  # Aumentado de 10 para 20 segundos
            
            # Tentar encontrar o elemento cifra com diferentes estratégias
            cifra_element = None
            try:
                # Tentar primeiro com a classe 'cifra'
                cifra_element = wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'cifra')))
                print("✅ Elemento 'cifra' encontrado")
            except TimeoutException:
                try:
                    # Tentar esperar pelo body e depois buscar cifra
                    wait.until(EC.presence_of_element_located((By.TAG_NAME, 'body')))
                    print("⚠️ Elemento 'cifra' não encontrado, tentando buscar no body...")
                    # Dar um tempo extra para carregar
                    time.sleep(3)
                    cifra_element = self.driver.find_element(By.CLASS_NAME, 'cifra')
                    print("✅ Elemento 'cifra' encontrado após espera adicional")
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
            # Tentar encontrar o elemento cifra
            try:
                content = self.driver.find_element(By.CLASS_NAME, 'cifra').get_attribute('outerHTML')
            except NoSuchElementException:
                # Se não encontrar, tentar buscar no body
                print("⚠️ Elemento 'cifra' não encontrado em get_details, usando body")
                content = self.driver.find_element(By.TAG_NAME, 'body').get_attribute('outerHTML')
            
            soup = BeautifulSoup(content, 'html.parser')
            
            # Nome da música - tentar diferentes seletores
            h1 = soup.find('h1', class_='t1')
            if not h1:
                h1 = soup.find('h1')
            result['name'] = h1.text if h1 else 'Nome não encontrado'
            
            # Artista - tentar diferentes seletores
            h2 = soup.find('h2', class_='t3')
            if not h2:
                h2 = soup.find('h2')
            result['artist'] = h2.text if h2 else 'Artista não encontrado'

            # URL do YouTube - com tratamento de erro
            result['youtube_url'] = None
            try:
                player_div = soup.find('div', class_='player-placeholder')
                if player_div and player_div.img:
                    img_youtube = player_div.img.get('src', '')
                    if '/vi/' in img_youtube:
                        cod = img_youtube.split('/vi/')[1].split('/')[0]
                        result['youtube_url'] = f"https://www.youtube.com/watch?v={cod}"
                    else:
                        # Tentar outros formatos de URL do YouTube
                        if 'youtube.com' in img_youtube or 'youtu.be' in img_youtube:
                            if 'watch?v=' in img_youtube:
                                cod = img_youtube.split('watch?v=')[1].split('&')[0]
                                result['youtube_url'] = f"https://www.youtube.com/watch?v={cod}"
                            elif 'youtu.be/' in img_youtube:
                                cod = img_youtube.split('youtu.be/')[1].split('?')[0]
                                result['youtube_url'] = f"https://www.youtube.com/watch?v={cod}"
            except (AttributeError, IndexError, KeyError) as e:
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
            # Tentar diferentes seletores para encontrar a cifra
            content = None
            try:
                content = self.driver.find_element(By.CLASS_NAME, 'cifra_cnt').get_attribute('outerHTML')
            except NoSuchElementException:
                try:
                    # Tentar buscar qualquer pre tag
                    content = self.driver.find_element(By.TAG_NAME, 'pre').get_attribute('outerHTML')
                    print("⚠️ Usando tag 'pre' como fallback")
                except NoSuchElementException:
                    # Última tentativa: buscar no body
                    print("⚠️ Tentando buscar cifra no body completo")
                    content = self.driver.find_element(By.TAG_NAME, 'body').get_attribute('outerHTML')
            
            if content:
                soup = BeautifulSoup(content, 'html.parser')
                pre_tag = soup.find('pre')
                if pre_tag:
                    result['cifra'] = pre_tag.text.split('\n')
                else:
                    # Tentar buscar texto direto se não encontrar pre
                    text_content = soup.get_text()
                    if text_content:
                        result['cifra'] = text_content.split('\n')
                    else:
                        result['cifra'] = []
                        if 'error' not in result:
                            result['error'] = 'Cifra não encontrada na página'
            else:
                result['cifra'] = []
                if 'error' not in result:
                    result['error'] = 'Cifra não encontrada na página'
        except Exception as e:
            print(f"❌ Erro ao extrair cifra: {e}")
            result['cifra'] = []
            if 'error' not in result:
                result['error'] = f'Erro ao extrair cifra: {str(e)}'
