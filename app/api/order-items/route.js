import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const order_id = searchParams.get('order_id');
    const product_id = searchParams.get('product_id');
    
    // Get auth token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Build query parameters for backend
    const backendParams = new URLSearchParams();
    backendParams.append('limit', limit);
    backendParams.append('sort', sort);
    backendParams.append('order', order);
    
    if (order_id) backendParams.append('order_id', order_id);
    if (product_id) backendParams.append('product_id', product_id);
    
    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    try {
      const response = await fetch(`${backendUrl}/api/order-items?${backendParams.toString()}`, {
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
        return NextResponse.json({ error: 'Backend server error' }, { status: response.status });
      }
    } catch (fetchError) {
      return NextResponse.json({ error: 'Backend server not available' }, { status: 503 });
    }
    
  } catch (error) {
    console.error('Order-items API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Get auth token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const body = await request.json();
    
    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    try {
      const response = await fetch(`${backendUrl}/api/order-items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({ 
          error: errorData.message || 'Backend server error',
          details: errorData
        }, { status: response.status });
      }
    } catch (fetchError) {
      return NextResponse.json({ error: 'Backend server not available' }, { status: 503 });
    }
    
  } catch (error) {
    console.error('Order-item creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
