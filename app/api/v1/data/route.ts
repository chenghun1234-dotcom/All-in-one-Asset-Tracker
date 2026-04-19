import { NextResponse } from 'next/server';

const DATA_URL = "https://raw.githubusercontent.com/chenghun1234-dotcom/All-in-one-Asset-Tracker/main/data.json";

export async function GET() {
  try {
    const response = await fetch(DATA_URL, {
      next: { revalidate: 300 }, // Cache on Vercel Edge for 5 minutes
      headers: {
        'Cache-Control': 'no-cache',
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch market data from source.' },
        { status: 502 }
      );
    }

    const data = await response.json();

    // Standardize the response for API consumers
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        currency: 'USD',
        exchange_rate_krw: data.market.exchange_rate,
        stocks: data.market.stocks,
        crypto: data.market.crypto,
        last_updated: data.metadata.last_updated
      },
      provider: "All-In-One Asset Tracker API"
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
