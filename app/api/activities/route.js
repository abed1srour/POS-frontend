import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '5';
    
    // Get auth token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    try {
      const response = await fetch(`${backendUrl}/api/dashboard/activities?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        console.log(`Backend activities returned ${response.status}`);
        return NextResponse.json({ error: 'Backend server error' }, { status: response.status });
      }
    } catch (fetchError) {
      console.log('Backend activities connection failed:', fetchError.message);
      return NextResponse.json({ error: 'Backend server not available' }, { status: 503 });
    }
    
  } catch (error) {
    console.error('Activities API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
