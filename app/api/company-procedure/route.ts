import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, history } = body;

    console.log('========================================');
    console.log('PROXY: Calling company procedure API');
    console.log('Question:', question);
    console.log('========================================');

    const response = await fetch('https://odinrealtime.cereinsight.com/api/teams/chat', {
      method: 'POST',
      headers: {
        'x-api-key': 'sk-rvzdhyxb1jyd2n0j4pwmgqj2zm3ck8vx2soi3pz65',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
        history: history || []
      })
    });

    if (!response.ok) {
      console.error(`❌ API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to retrieve information: ${response.statusText}`,
          answer: "I'm sorry, I couldn't retrieve that information at the moment. Please try again." 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ API Response received');
    console.log('========================================');

    return NextResponse.json({
      success: true,
      answer: data.answer || data.response || "Information retrieved successfully.",
      data: data
    });

  } catch (error) {
    console.error('========================================');
    console.error('❌ ERROR IN PROXY API ROUTE');
    console.error('Error:', error);
    console.error('========================================');
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to retrieve company procedure information",
        answer: "I apologize, but I'm having trouble accessing that information right now. Please try again in a moment." 
      },
      { status: 500 }
    );
  }
}

