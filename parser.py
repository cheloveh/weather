import json
import requests
from bs4 import BeautifulSoup

def parse_weather():
    url = "https://meteoinfo.ru/forecasts5000/russia/republic-udmurtia"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        forecast_table = soup.find('table', id='wd_content_id')
        temperature = "Н/Д"
        
        if forecast_table:
            for cell in forecast_table.find_all(['td', 'th']):
                text = cell.get_text(strip=True)
                if '°' in text:
                    clean_text = text.replace('°', '').replace('-', '').replace('+', '').strip()
                    if clean_text.isdigit():
                        temperature = text
                        break 
        
        if temperature == "Н/Д":
            for text in soup.stripped_strings:
                if '°' in text and text.replace('°', '').replace('-', '').replace('+', '').isdigit():
                    temperature = text
                    break

        data = {"city": "Ижевск", "temperature": temperature}
        with open('weather.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
            
        print(f"Успешно сохранено: {temperature}")

    except Exception as e:
        print(f"Ошибка парсинга: {e}")
        with open('weather.json', 'w', encoding='utf-8') as f:
            json.dump({"city": "Ижевск", "temperature": "Ошибка"}, f, ensure_ascii=False)

if __name__ == "__main__":
    parse_weather()
