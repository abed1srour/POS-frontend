import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Get auth token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    try {
      const response = await fetch(`${backendUrl}/api/purchase-orders/${id}`, {
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
        return NextResponse.json({ error: 'Purchase order not found' }, { status: response.status });
      }
    } catch (fetchError) {
      return NextResponse.json({ error: 'Backend server not available' }, { status: 503 });
    }
    
  } catch (error) {
    console.error('Purchase order API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
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
      const response = await fetch(`${backendUrl}/api/purchase-orders/${id}`, {
        method: 'PUT',
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
    console.error('Purchase order update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Get auth token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    try {
      const response = await fetch(`${backendUrl}/api/purchase-orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
    console.error('Purchase order deletion API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
