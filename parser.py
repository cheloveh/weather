import json
import requests
from bs4 import BeautifulSoup

def parse_weather():
    url = "https://meteoinfo.ru/forecasts5000/russia/republic-udmurtia"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    # 1. Скачиваем страницу
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    
    temperature = None
    
   
    forecast_cells = soup.find_all('td')
    
    for cell in forecast_cells:
        text = cell.get_text().strip()
       
        if '°' in text and len(text) <= 4:  # Градусы обычно короткие, например "18°" или "+18°"
            temperature = text
            break # Нашли самую актуальную температуру на сегодня и выходим
            
    
    if not temperature:
        raise ValueError("Критическая ошибка: Не удалось найти ячейку с градусами на сайте!")

   
    data = {
        "city": "Ижевск",
        "temperature": temperature
    }
    
    with open('weather.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
        
    print(f"Парсер сработал! Записано значение: {temperature}")

if __name__ == "__main__":
    parse_weather()
