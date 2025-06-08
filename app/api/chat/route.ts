import { NextResponse } from 'next/server';

const MOONSHOT_API_KEY = 'sk-S8UI1WDL612ZD67NUSl9vgtUrVKwBuJTEys0XbHQDHp86w8u';
const MOONSHOT_API_URL = 'https://api.moonshot.cn/v1/chat/completions';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch(MOONSHOT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOONSHOT_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages,
        temperature: 0.7,
        stream: false,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 