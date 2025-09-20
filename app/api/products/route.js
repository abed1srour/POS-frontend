import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const category_id = searchParams.get('category_id');
    const supplier_id = searchParams.get('supplier_id');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    
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
    
    if (category_id) backendParams.append('category_id', category_id);
    if (supplier_id) backendParams.append('supplier_id', supplier_id);
    if (search) backendParams.append('search', search);
    if (status) backendParams.append('status', status);
    
    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    try {
      const response = await fetch(`${backendUrl}/api/products?${backendParams.toString()}`, {
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
    console.error('Products API error:', error);
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
      const response = await fetch(`${backendUrl}/api/products`, {
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
    console.error('Product creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
