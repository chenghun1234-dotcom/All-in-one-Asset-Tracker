"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface MarketData {
  metadata: {
    last_updated: string;
    status: string;
  };
  market: {
    exchange_rate: number;
    stocks: Record<string, number>;
    crypto: Record<string, number>;
  };
}

interface PortfolioItem {
  id: string;
  type: 'stock' | 'crypto';
  symbol: string;
  amount: number;
}

interface ContextProps {
  marketData: MarketData | null;
  portfolio: PortfolioItem[];
  addAsset: (item: Omit<PortfolioItem, 'id'>) => void;
  removeAsset: (id: string) => void;
  isLoading: boolean;
}

const MarketContext = createContext<ContextProps | undefined>(undefined);

// Pointing to your personal GitHub repository for production data updates
const DATA_URL = "https://raw.githubusercontent.com/chenghun1234-dotcom/All-in-one-Asset-Tracker/main/data.json";

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load portfolio from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('asset-tracker-portfolio');
    if (saved) setPortfolio(JSON.parse(saved));
    
    // Fetch market data
    const fetchData = async () => {
      try {
        // Try local for dev, then fall back to GitHub Raw
        const sources = ['/data.json', DATA_URL];
        
        for (const url of sources) {
          try {
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
              const data = await res.json();
              setMarketData(data);
              console.log(`Fetched data from: ${url}`);
              break; // Stop if we got the data
            }
          } catch (e) {
            console.warn(`Failed to fetch from ${url}`, e);
          }
        }
      } catch (err) {
        console.error("Critical failure loading market data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('asset-tracker-portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  const addAsset = (item: Omit<PortfolioItem, 'id'>) => {
    setPortfolio(prev => [...prev, { ...item, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const removeAsset = (id: string) => {
    setPortfolio(prev => prev.filter(p => p.id !== id));
  };

  return (
    <MarketContext.Provider value={{ marketData, portfolio, addAsset, removeAsset, isLoading }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (context === undefined) throw new Error("useMarket must be used within MarketProvider");
  return context;
}
