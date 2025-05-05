import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    const response = await fetch('https://cerebrumhrtest.cereinsight.com/api/teams/chat', {
      method: 'POST',
      headers: {
        'x-api-key': 'sk-qeydv7bdaj3exellhyq3mgdokxaif2x521au0tmghrl',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in knowledge base search:', error);
    return NextResponse.json(
      { error: 'Failed to search knowledge base' },
      { status: 500 }
    );
  }
} 