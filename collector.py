import yfinance as ticker
import requests
import json
import datetime
import os

# Default assets to track if none provided
STOCKS = ["AAPL", "TSLA", "NVDA", "005930.KS", "MSFT", "GOOGL"]
CRYPTOS = ["bitcoin", "ethereum", "solana", "ripple", "cardano"]

def get_prices():
    print(f"[{datetime.datetime.now()}] Starting data collection...")
    
    # 1. Stocks (yfinance)
    stock_data = {}
    for s in STOCKS:
        try:
            data = ticker.Ticker(s).history(period="1d")
            if not data.empty:
                stock_data[s] = round(data['Close'].iloc[-1], 2)
            else:
                print(f"Warning: No data for stock {s}")
        except Exception as e:
            print(f"Error fetching stock {s}: {e}")

    # 2. Cryptos (CoinGecko Public API)
    crypto_data = {}
    try:
        crypto_ids = ",".join(CRYPTOS)
        crypto_url = f"https://api.coingecko.com/api/v3/simple/price?ids={crypto_ids}&vs_currencies=usd"
        response = requests.get(crypto_url, timeout=10)
        if response.status_code == 200:
            res_json = response.json()
            for c in CRYPTOS:
                if c in res_json:
                    crypto_data[c.upper()] = res_json[c]['usd']
        else:
            print(f"Error fetching crypto prices: HTTP {response.status_code}")
    except Exception as e:
        print(f"Error fetching crypto: {e}")

    # 3. Exchange Rate (USD to KRW)
    usd_to_krw = 1400.0  # Fallback
    try:
        ex_url = "https://open.er-api.com/v6/latest/USD"
        ex_res = requests.get(ex_url, timeout=10).json()
        usd_to_krw = ex_res['rates']['KRW']
    except Exception as e:
        print(f"Error fetching exchange rate: {e}")

    # Final Data Structure
    result = {
        "metadata": {
            "last_updated": datetime.datetime.now().isoformat(),
            "status": "success" if stock_data and crypto_data else "partial_success"
        },
        "market": {
            "exchange_rate": usd_to_krw,
            "stocks": stock_data,
            "crypto": crypto_data
        }
    }

    # Save to data.json
    output_path = "data.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    
    print(f"[{datetime.datetime.now()}] Data collection complete. Saved to {output_path}")

if __name__ == "__main__":
    get_prices()
