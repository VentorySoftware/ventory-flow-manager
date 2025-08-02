// Demo data for local development
export const demoProducts = [
  {
    id: '1',
    name: 'Laptop HP EliteBook',
    description: 'Laptop profesional HP EliteBook 14"',
    sku: 'LAP-HP-001',
    price: 1299.99,
    cost: 899.99,
    stock: 15,
    min_stock: 5,
    unit: 'unidad',
    active: true,
    image_url: null,
    category_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Mouse Inalámbrico',
    description: 'Mouse inalámbrico ergonómico',
    sku: 'MOU-WL-001',
    price: 29.99,
    cost: 15.99,
    stock: 50,
    min_stock: 10,
    unit: 'unidad',
    active: true,
    image_url: null,
    category_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Resma Papel A4',
    description: 'Resma de papel bond A4 75g',
    sku: 'PAP-A4-001',
    price: 12.99,
    cost: 8.99,
    stock: 100,
    min_stock: 20,
    unit: 'resma',
    active: true,
    image_url: null,
    category_id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const demoCustomers = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@email.com',
    phone: '555-0101',
    address: 'Calle Principal 123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria@email.com',
    phone: '555-0102',
    address: 'Av. Central 456',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const demoSales = [
  {
    id: '1',
    sale_number: 'V000001',
    customer_id: '1',
    total: 1329.98,
    subtotal: 1329.98,
    tax: 212.80,
    discount: 0,
    status: 'completed',
    payment_method: 'efectivo',
    notes: 'Primera venta del sistema',
    created_at: new Date(Date.now() - 86400000).toISOString(), // Ayer
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    customers: { name: 'Juan Pérez', email: 'juan@email.com' },
    sale_items: [
      {
        id: '1',
        quantity: 1,
        unit_price: 1299.99,
        subtotal: 1299.99,
        products: { name: 'Laptop HP EliteBook', sku: 'LAP-HP-001' }
      },
      {
        id: '2',
        quantity: 1,
        unit_price: 29.99,
        subtotal: 29.99,
        products: { name: 'Mouse Inalámbrico', sku: 'MOU-WL-001' }
      }
    ]
  },
  {
    id: '2',
    sale_number: 'V000002',
    customer_id: '2',
    total: 25.98,
    subtotal: 25.98,
    tax: 4.16,
    discount: 0,
    status: 'completed',
    payment_method: 'tarjeta',
    notes: null,
    created_at: new Date().toISOString(), // Hoy
    updated_at: new Date().toISOString(),
    customers: { name: 'María García', email: 'maria@email.com' },
    sale_items: [
      {
        id: '3',
        quantity: 2,
        unit_price: 12.99,
        subtotal: 25.98,
        products: { name: 'Resma Papel A4', sku: 'PAP-A4-001' }
      }
    ]
  }
]

// Mock functions for demo mode
export const createMockSupabaseClient = () => {
  let sales = [...demoSales]
  let products = [...demoProducts]
  let customers = [...demoCustomers]
  
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          data: table === 'products' ? products.filter(p => (p as any)[column] === value) : [],
          error: null
        }),
        gt: (column: string, value: any) => ({
          data: table === 'products' ? products.filter(p => (p as any)[column] > value) : [],
          error: null
        }),
        lt: (column: string, value: any) => ({
          data: table === 'products' ? products.filter(p => (p as any)[column] < value) : [],
          error: null
        }),
        gte: (column: string, value: any) => {
          if (table === 'sales') {
            const filtered = sales.filter(s => s.created_at >= value)
            return { data: filtered, error: null }
          }
          return { data: [], error: null }
        },
        order: (column: string, options?: any) => ({
          limit: (n: number) => ({
            data: table === 'sales' ? sales.slice(0, n) : [],
            error: null
          }),
          data: table === 'sales' ? sales : table === 'products' ? products : customers,
          error: null
        }),
        limit: (n: number) => ({
          data: table === 'sales' ? sales.slice(0, n) : [],
          error: null
        }),
        data: table === 'sales' ? sales : table === 'products' ? products : customers,
        error: null
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => {
            const newItem = { ...data, id: Math.random().toString() }
            if (table === 'sales') {
              sales.push(newItem)
            }
            return { data: newItem, error: null }
          }
        })
      }),
      count: 'exact' as const,
      head: true
    })
  }
}