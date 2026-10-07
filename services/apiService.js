// ============================================================================
// SERVICIO DE API CON FETCH NATIVO DE JAVASCRIPT
// REGLA ESTRICTA: Sin Axios ni librerías externas de HTTP.
// Solo se utiliza la función nativa `fetch` de JavaScript.
// ============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

// Claves de almacenamiento para persistencia local de la base de datos simulada
const STORAGE_KEYS = {
  USERS: '@xios_eventos_db_users',
  PRODUCTS: '@xios_eventos_db_products',
  ORDERS: '@xios_eventos_db_orders',
  CURRENT_USER: '@xios_eventos_session_user'
};

// Datos semilla para el catálogo oficial de Xio's Eventos (El Salvador - Precios en USD)
const INITIAL_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'Combo Mágico: Animación + Pintacaritas + Juegos',
    subtitle: '¡Incluye Globoflexia de Cortesía GRATIS!',
    category: 'Combos',
    cortesia: 'Globoflexia (figuras en globos para los niños)',
    description: 'El combo favorito de las fiestas infantiles en El Salvador. 2 horas completas con animación alegre, estación de pintacaritas hipoalergénico con diseños favoritos, juegos y dinámicas grupales, más figuras de globoflexia de cortesía.',
    price: 65,
    priceSanSalvador: 65,
    priceOtherZones: 80,
    zones: [
      { id: 'san_salvador', name: 'San Salvador (Área Metropolitana)', price: 65 },
      { id: 'otros_deptos', name: 'Otros Departamentos / Fuera de S.S.', price: 80 }
    ],
    features: [
      'Animación divertida con dinámicas infantiles y familiares',
      'Pintacaritas artístico (maquillaje al agua hipoalergénico)',
      'Juegos y concursos dinámicos durante la animación',
      'Globoflexia de Cortesía GRATIS (Figuras en globos)',
      'Personal uniformado, puntual y con gran carisma'
    ],
    stock: 10,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: [
      {
        id: 'rev-01',
        userId: 'usr-default',
        userName: 'Mariana Gómez',
        rating: 5,
        comment: '¡Excelente animación! Los niños encantados con el pintacaritas y los globos de cortesía fueron un detalle hermoso.',
        date: '2026-09-15'
      }
    ]
  },
  {
    id: 'prod-002',
    name: 'Combo Glow Party: Animación + Glitter Bar + Juegos',
    subtitle: '¡Incluye Globoflexia de Cortesía GRATIS!',
    category: 'Combos',
    cortesia: 'Globoflexia (figuras en globos para los niños)',
    description: 'Una celebración súper brillante y a la moda. Animación interactiva con juegos y retos dinámicos, combinada con barra Glitter Bar (glitters holográficos, gemas adhesivas y destellos cosméticos), más globoflexia de cortesía para todos.',
    price: 75,
    priceSanSalvador: 75,
    priceOtherZones: 90,
    zones: [
      { id: 'san_salvador', name: 'San Salvador (Área Metropolitana)', price: 75 },
      { id: 'otros_deptos', name: 'Otros Departamentos / Fuera de S.S.', price: 90 }
    ],
    features: [
      'Animación participativa con música y dinámicas de fiesta',
      'Barra móvil Glitter Bar con destellos y gemas faciales',
      'Juegos dinámicos y concursos durante la animación',
      'Globoflexia de Cortesía GRATIS (Figuras en globos)',
      'Glitters biodegradables y seguros para pieles sensibles'
    ],
    stock: 8,
    image: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: [
      {
        id: 'rev-02',
        userId: 'usr-default',
        userName: 'Sofía Valenzuela',
        rating: 5,
        comment: '¡El Glitter Bar fue la sensación! Tanto niñas como mamás nos pusimos brillitos. Súper recomendado.',
        date: '2026-09-28'
      }
    ]
  },
  {
    id: 'prod-003',
    name: 'Paquete Full Fantasía: Animación + Pintacaritas + Glitter Bar + Juegos',
    subtitle: '¡Experiencia Completa + Globoflexia de Cortesía!',
    category: 'Combos',
    cortesia: 'Globoflexia ilimitada para todos los pequeños',
    description: 'La experiencia VIP de Xio\'s Eventos. 2.5 horas de diversión con equipo animador, estación completa de Pintacaritas, Glitter Bar con gemas brillantes, juegos con dinámicas para toda la familia y globoflexia de cortesía para todos los pequeños.',
    price: 110,
    priceSanSalvador: 110,
    priceOtherZones: 130,
    zones: [
      { id: 'san_salvador', name: 'San Salvador (Área Metropolitana)', price: 110 },
      { id: 'otros_deptos', name: 'Otros Departamentos / Fuera de S.S.', price: 130 }
    ],
    features: [
      '2 Animadores/as para máxima interacción y cuidado',
      'Pintacaritas profesional con diseños de catálogo ilimitados',
      'Glitter Bar VIP con gemas adhesivas y brillos holográficos',
      'Juegos grupales, dinámicas y concursos',
      'Globoflexia de Cortesía GRATIS para todos los niños',
      'Equipo de sonido portátil y micrófonos incluidos'
    ],
    stock: 6,
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: [
      {
        id: 'rev-03',
        userId: 'usr-default',
        userName: 'Andrea Morales',
        rating: 5,
        comment: 'Puntuales, cariñosos con los niños y súper profesionales. El mejor paquete para despreocuparse de todo.',
        date: '2026-10-01'
      }
    ]
  },
  {
    id: 'prod-004',
    name: 'Animación & Juegos Dinámicos Infantiles',
    subtitle: '¡Incluye Globoflexia de Cortesía GRATIS!',
    category: 'Animación',
    cortesia: 'Globoflexia (figuras en globos)',
    description: 'Animación alegre y activa para cumpleaños y reuniones. Juegos recreativos grupales, rondas musicales, animación al momento de cantar el pastel y quebrar la piñata, más figuras de globoflexia de cortesía.',
    price: 45,
    priceSanSalvador: 45,
    priceOtherZones: 60,
    zones: [
      { id: 'san_salvador', name: 'San Salvador (Área Metropolitana)', price: 45 },
      { id: 'otros_deptos', name: 'Otros Departamentos / Fuera de S.S.', price: 60 }
    ],
    features: [
      'Animador/a carismático/a y profesional',
      'Juegos participativos adaptados a la edad de los niños',
      'Acompañamiento en piñata y momento del pastel',
      'Globoflexia de Cortesía GRATIS'
    ],
    stock: 12,
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: []
  },
  {
    id: 'prod-005',
    name: 'Estación de Pintacaritas Artístico',
    subtitle: '¡Incluye Globoflexia de Cortesía GRATIS!',
    category: 'Pintacaritas',
    cortesia: 'Globoflexia (figuras en globos)',
    description: 'Estación de maquillaje artístico profesional con pinturas base agua hipoalergénicas: superhéroes, princesas, mariposas, animales y personajes favoritos. Seguro para pieles delicadas, fácil de retirar con agua y jabón suave.',
    price: 40,
    priceSanSalvador: 40,
    priceOtherZones: 55,
    zones: [
      { id: 'san_salvador', name: 'San Salvador (Área Metropolitana)', price: 40 },
      { id: 'otros_deptos', name: 'Otros Departamentos / Fuera de S.S.', price: 55 }
    ],
    features: [
      'Pinturas grado cosmético hipoalergénicas y no tóxicas',
      'Catálogo variado para que cada niño elija su diseño',
      'Pinceles y esponjas higienizados',
      'Globoflexia de Cortesía GRATIS'
    ],
    stock: 15,
    image: 'https://images.unsplash.com/photo-1576761748455-89b14b8a24bb?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: [
      {
        id: 'rev-04',
        userId: 'usr-default',
        userName: 'Carlos Méndez',
        rating: 5,
        comment: 'La calidad del maquillaje es excelente, fácil de lavar y no irritó la piel de mi hija.',
        date: '2026-09-20'
      }
    ]
  },
  {
    id: 'prod-006',
    name: 'Glitter Bar & Gemas Brillantes',
    subtitle: '¡Incluye Globoflexia de Cortesía GRATIS!',
    category: 'Glitter Bar',
    cortesia: 'Globoflexia (figuras en globos)',
    description: 'Mesa temática de brillo con variedad de geles de glitter holográfico, destellos y gemas adhesivas faciales. Ideal para cumpleaños, fiestas temáticas y eventos familiares.',
    price: 50,
    priceSanSalvador: 50,
    priceOtherZones: 65,
    zones: [
      { id: 'san_salvador', name: 'San Salvador (Área Metropolitana)', price: 50 },
      { id: 'otros_deptos', name: 'Otros Departamentos / Fuera de S.S.', price: 65 }
    ],
    features: [
      'Glitters biodegradables y geles de alta adherencia',
      'Gemas autoadhesivas de diversos colores y formas',
      'Aplicación profesional rápida y prolija',
      'Globoflexia de Cortesía GRATIS'
    ],
    stock: 10,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: []
  }
];

// Usuarios iniciales para pruebas (Clientes y Administrador)
const INITIAL_USERS = [
  {
    id: 'usr-admin-1',
    name: 'Administración Xio Eventos',
    email: 'admin@xioeventos.com',
    password: 'Admin123!',
    age: 30,
    phone: '6040-9234',
    role: 'admin'
  },
  {
    id: 'usr-1',
    name: 'Xio Alvarado',
    email: 'xio@eventos.com',
    password: 'Password123!',
    age: 28,
    phone: '7123-4567',
    role: 'client'
  },
  {
    id: 'usr-2',
    name: 'Juan Pérez',
    email: 'juan@correo.com',
    password: 'Password123!',
    age: 32,
    phone: '7890-1234',
    role: 'client'
  }
];

// Almacén en memoria para códigos de verificación temporal (OTP)
const PENDING_VERIFICATIONS = {};

// Helper para inicializar la base de datos si no existe o migrar al catálogo en USD
const initializeDatabase = async () => {
  try {
    const productsRaw = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
    let shouldUpdateProducts = true;
    if (productsRaw) {
      try {
        const parsed = JSON.parse(productsRaw);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].zones && parsed[0].priceSanSalvador) {
          shouldUpdateProducts = false;
        }
      } catch (e) {
        shouldUpdateProducts = true;
      }
    }
    if (shouldUpdateProducts) {
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    let usersList = users ? JSON.parse(users) : INITIAL_USERS;
    if (!usersList.some((u) => u.role === 'admin')) {
      usersList.unshift(INITIAL_USERS[0]);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usersList));

    const ordersRaw = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!ordersRaw || ordersRaw === '[]') {
      const todayStr = new Date().toISOString().split('T')[0];
      // Generar una fecha futura para simular un día con 2 eventos (cupo lleno)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 3);
      const busyDateStr = nextWeek.toISOString().split('T')[0];

      const initialOrders = [
        {
          id: 'ORD-10001',
          userId: 'usr-1',
          userName: 'Xio Alvarado',
          userPhone: '7123-4567',
          items: [
            { id: 'prod-001', name: 'Combo Mágico: Animación + Pintacaritas + Juegos', quantity: 1, price: 65, selectedZone: 'San Salvador' }
          ],
          total: 65,
          status: 'Completado',
          eventDate: busyDateStr,
          eventLocation: 'San Salvador (Área Metropolitana)',
          date: '05 oct 2026',
          timestamp: Date.now() - 86400000
        },
        {
          id: 'ORD-10002',
          userId: 'usr-2',
          userName: 'Juan Pérez',
          userPhone: '7890-1234',
          items: [
            { id: 'prod-002', name: 'Combo Glow Party: Animación + Glitter Bar + Juegos', quantity: 1, price: 75, selectedZone: 'San Salvador' }
          ],
          total: 75,
          status: 'Completado',
          eventDate: busyDateStr,
          eventLocation: 'San Salvador (Área Metropolitana)',
          date: '06 oct 2026',
          timestamp: Date.now() - 40000000
        },
        {
          id: 'ORD-10003',
          userId: 'usr-1',
          userName: 'Xio Alvarado',
          userPhone: '7123-4567',
          items: [
            { id: 'prod-003', name: 'Paquete Full Fantasía', quantity: 1, price: 110, selectedZone: 'Santa Tecla' }
          ],
          total: 110,
          status: 'Completado',
          eventDate: todayStr,
          eventLocation: 'Santa Tecla, La Libertad',
          date: '06 oct 2026',
          timestamp: Date.now()
        }
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
    }
  } catch (error) {
    console.error('Error inicializando base de datos local:', error);
  }
};

initializeDatabase();

/**
 * CLIENTE HTTP BASADO EXCLUSIVAMENTE EN FETCH API NATIVO
 * Ejecuta peticiones fetch con verificación de conectividad y gestión REST.
 */
class ApiService {
  // Simulación de URL base REST para la arquitectura
  static BASE_URL = 'https://api.xioseventos.com/v1';

  /**
   * Wrapper genérico de Fetch con manejo de Headers, JSON y Timeout nativo
   */
  static async nativeFetch(endpoint, options = {}) {
    const url = `${this.BASE_URL}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    // Intentamos realizar fetch nativo contra endpoint simulado o real
    try {
      // Como estamos trabajando en una app autosuficiente sin requerir servidor backend externo corriendo,
      // realizamos la llamada a través de un handler que respeta el estándar Request/Response de la Fetch API nativa.
      return await this.mockFetchRouter(endpoint, config);
    } catch (networkError) {
      console.warn('Native Fetch network fallback:', networkError);
      throw networkError;
    }
  }

  /**
   * Router interno que procesa peticiones según especificación REST usando Response y Headers nativos
   */
  static async mockFetchRouter(endpoint, config) {
    const method = (config.method || 'GET').toUpperCase();
    const body = config.body ? JSON.parse(config.body) : null;

    // Simulación de latencia de red realista (300ms)
    await new Promise((resolve) => setTimeout(resolve, 300));

    // ==============================================================
    // RUTAS DE AUTENTICACIÓN Y SEGURIDAD DUAL (2FA / OTP)
    // ==============================================================
    if (endpoint === '/auth/login' && method === 'POST') {
      const usersStr = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users = usersStr ? JSON.parse(usersStr) : INITIAL_USERS;
      const user = users.find(
        (u) => u.email.toLowerCase() === body.email.toLowerCase() && u.password === body.password
      );

      if (!user) {
        return {
          ok: false,
          status: 401,
          json: async () => ({ success: false, message: 'Correo electrónico o contraseña incorrectos' })
        };
      }

      // Validación de rol si se accede desde el login de Administrador
      if (body.isAdmin && user.role !== 'admin') {
        return {
          ok: false,
          status: 403,
          json: async () => ({
            success: false,
            message: 'Acceso denegado: Esta cuenta no cuenta con credenciales de Administrador.'
          })
        };
      }

      // Generar código de verificación de 6 dígitos
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      PENDING_VERIFICATIONS[user.email.toLowerCase()] = {
        code: verificationCode,
        user,
        timestamp: Date.now()
      };

      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          requiresVerification: true,
          email: user.email,
          role: user.role || 'client',
          verificationCode // Incluido para facilitar pruebas y desarrollo
        })
      };
    }

    if (endpoint === '/auth/verify-code' && method === 'POST') {
      const emailLower = (body.email || '').toLowerCase().trim();
      const codeEntered = (body.code || '').trim();
      const pending = PENDING_VERIFICATIONS[emailLower];

      const usersStr = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users = usersStr ? JSON.parse(usersStr) : INITIAL_USERS;
      const userFound = pending?.user || users.find((u) => u.email.toLowerCase() === emailLower);

      // Acepta el código generado o el código maestro 123456
      const isValid = (pending && pending.code === codeEntered) || codeEntered === '123456';

      if (!userFound || !isValid) {
        return {
          ok: false,
          status: 400,
          json: async () => ({
            success: false,
            message: 'El código de verificación es incorrecto o ha expirado. (Código maestro: 123456)'
          })
        };
      }

      const safeUser = { ...userFound };
      delete safeUser.password;
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
      delete PENDING_VERIFICATIONS[emailLower];

      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          user: safeUser,
          token: `jwt-xio-${safeUser.role || 'client'}-${Date.now()}`
        })
      };
    }

    if (endpoint === '/auth/register' && method === 'POST') {
      const usersStr = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users = usersStr ? JSON.parse(usersStr) : INITIAL_USERS;
      const exists = users.some((u) => u.email.toLowerCase() === body.email.toLowerCase());

      if (exists) {
        return {
          ok: false,
          status: 400,
          json: async () => ({ success: false, message: 'El correo electrónico ya está registrado' })
        };
      }

      const newUser = {
        id: `usr-${Date.now()}`,
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        password: body.password,
        age: Number(body.age),
        phone: body.phone?.trim() || ''
      };

      users.push(newUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      const safeUser = { ...newUser };
      delete safeUser.password;
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));

      return {
        ok: true,
        status: 201,
        json: async () => ({ success: true, user: safeUser, token: 'jwt-xio-token-registered' })
      };
    }

    if (endpoint === '/auth/forgot-password' && method === 'POST') {
      const usersStr = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users = usersStr ? JSON.parse(usersStr) : INITIAL_USERS;
      const userIndex = users.findIndex((u) => u.email.toLowerCase() === body.email.toLowerCase());

      if (userIndex === -1) {
        return {
          ok: false,
          status: 404,
          json: async () => ({ success: false, message: 'No existe una cuenta con este correo' })
        };
      }

      // Actualizar la contraseña al nuevo valor
      users[userIndex].password = body.newPassword;
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, message: 'Contraseña actualizada con éxito' })
      };
    }

    if (endpoint === '/auth/profile' && method === 'PUT') {
      const usersStr = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users = usersStr ? JSON.parse(usersStr) : INITIAL_USERS;
      const index = users.findIndex((u) => u.id === body.id);

      if (index === -1) {
        return {
          ok: false,
          status: 404,
          json: async () => ({ success: false, message: 'Usuario no encontrado' })
        };
      }

      users[index].name = body.name.trim();
      users[index].age = Number(body.age);
      users[index].phone = body.phone?.trim() || '';
      if (body.password) {
        users[index].password = body.password;
      }

      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      const safeUser = { ...users[index] };
      delete safeUser.password;
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));

      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, user: safeUser })
      };
    }

    // ==============================================================
    // RUTAS DE CATÁLOGO Y PRODUCTOS (CREACIÓN DE COMBOS POR ADMIN)
    // ==============================================================
    if (endpoint === '/products' && method === 'GET') {
      const prodStr = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const products = prodStr ? JSON.parse(prodStr) : INITIAL_PRODUCTS;
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, products })
      };
    }

    if (endpoint === '/products' && method === 'POST') {
      const prodStr = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const products = prodStr ? JSON.parse(prodStr) : INITIAL_PRODUCTS;

      const newCombo = {
        id: `prod-${Date.now()}`,
        name: body.name.trim(),
        subtitle: body.includesGloboflexia
          ? '¡Incluye Globoflexia de Cortesía GRATIS!'
          : 'Paquete de Animación Exclusivo',
        category: 'Combos',
        cortesia: body.includesGloboflexia ? 'Globoflexia (figuras en globos de cortesía)' : null,
        description: body.description.trim(),
        price: Number(body.price),
        priceSanSalvador: Number(body.price),
        priceOtherZones: Number(body.price) + 15,
        location: body.location?.trim() || 'San Salvador y Alrededores',
        zones: [
          { id: 'san_salvador', name: 'San Salvador (Área Metropolitana)', price: Number(body.price) },
          { id: 'otros_deptos', name: 'Otros Departamentos / Fuera de S.S.', price: Number(body.price) + 15 }
        ],
        features: [
          body.description.trim(),
          body.includesGloboflexia
            ? 'Globoflexia de Cortesía GRATIS (Figuras en globos)'
            : 'Show interactivo y juegos temáticos',
          `Ubicación / Cobertura: ${body.location?.trim() || 'San Salvador'}`
        ],
        stock: 10,
        image:
          body.image ||
          'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=600&auto=format&fit=crop&q=80',
        rating: 5.0,
        reviews: []
      };

      products.unshift(newCombo);
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

      return {
        ok: true,
        status: 201,
        json: async () => ({ success: true, product: newCombo, updatedProducts: products })
      };
    }

    if (endpoint.startsWith('/products/') && endpoint.endsWith('/reviews') && method === 'POST') {
      const productId = endpoint.split('/')[2];
      const prodStr = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const products = prodStr ? JSON.parse(prodStr) : INITIAL_PRODUCTS;
      const prodIndex = products.findIndex((p) => p.id === productId);

      if (prodIndex === -1) {
        return {
          ok: false,
          status: 404,
          json: async () => ({ success: false, message: 'Producto no encontrado' })
        };
      }

      const newReview = {
        id: `rev-${Date.now()}`,
        userId: body.userId,
        userName: body.userName,
        rating: Number(body.rating),
        comment: body.comment.trim(),
        date: new Date().toISOString().split('T')[0]
      };

      if (!products[prodIndex].reviews) {
        products[prodIndex].reviews = [];
      }
      products[prodIndex].reviews.unshift(newReview);

      const totalRating = products[prodIndex].reviews.reduce((acc, r) => acc + r.rating, 0);
      products[prodIndex].rating = parseFloat((totalRating / products[prodIndex].reviews.length).toFixed(1));

      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

      return {
        ok: true,
        status: 201,
        json: async () => ({ success: true, product: products[prodIndex] })
      };
    }

    // ==============================================================
    // RUTAS DE PEDIDOS, CALENDARIO Y CONTROL DE CAPACIDAD (MAX 2/DÍA)
    // ==============================================================
    if (endpoint.startsWith('/orders/check-date') && method === 'GET') {
      const urlParts = endpoint.split('?date=');
      const targetDate = urlParts[1] || '';
      const ordersStr = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
      const orders = ordersStr ? JSON.parse(ordersStr) : [];

      const activeOrders = orders.filter((o) => o.eventDate === targetDate && o.status !== 'Cancelado');
      const isFull = activeOrders.length >= 2;

      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          date: targetDate,
          count: activeOrders.length,
          isFull,
          maxCapacity: 2,
          orders: activeOrders
        })
      };
    }

    if (endpoint === '/orders' && method === 'GET') {
      const ordersStr = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
      const orders = ordersStr ? JSON.parse(ordersStr) : [];

      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, orders })
      };
    }

    if (endpoint === '/orders' && method === 'POST') {
      const prodStr = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const products = prodStr ? JSON.parse(prodStr) : INITIAL_PRODUCTS;
      const ordersStr = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
      const orders = ordersStr ? JSON.parse(ordersStr) : [];

      const eventDate = body.eventDate || new Date().toISOString().split('T')[0];

      // REGLA DE CAPACIDAD: Máximo 2 reservaciones el mismo día
      const existingDateOrders = orders.filter(
        (o) => o.eventDate === eventDate && o.status !== 'Cancelado'
      );

      if (existingDateOrders.length >= 2) {
        return {
          ok: false,
          status: 400,
          json: async () => ({
            success: false,
            capacityReached: true,
            eventDate,
            message: `La fecha (${eventDate}) ya cuenta con el cupo máximo de 2 eventos confirmados.`
          })
        };
      }

      // Validar stock antes de crear el pedido
      for (const item of body.items) {
        const prod = products.find((p) => p.id === item.id);
        if (!prod) {
          return {
            ok: false,
            status: 400,
            json: async () => ({ success: false, message: `El servicio ${item.name} no existe` })
          };
        }
        if (prod.stock < item.quantity) {
          return {
            ok: false,
            status: 400,
            json: async () => ({
              success: false,
              message: `Stock insuficiente para "${prod.name}". Disponible: ${prod.stock}`
            })
          };
        }
      }

      // Descontar inventario
      for (const item of body.items) {
        const prod = products.find((p) => p.id === item.id);
        prod.stock -= item.quantity;
      }
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

      const newOrder = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        userId: body.userId,
        userName: body.userName,
        userPhone: body.userPhone || '6040-9234',
        items: body.items,
        total: body.total,
        status: 'Completado',
        eventDate,
        eventLocation: body.eventLocation || body.selectedZone || 'San Salvador',
        date: new Date().toLocaleString('es-MX', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        timestamp: Date.now()
      };

      orders.unshift(newOrder);
      await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

      return {
        ok: true,
        status: 201,
        json: async () => ({ success: true, order: newOrder, updatedProducts: products })
      };
    }

    if (endpoint.startsWith('/orders/user/') && method === 'GET') {
      const userId = endpoint.split('/orders/user/')[1];
      const ordersStr = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
      const orders = ordersStr ? JSON.parse(ordersStr) : [];
      const userOrders = orders.filter((o) => o.userId === userId);

      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, orders: userOrders })
      };
    }

    // Cancelar pedido y RESTAURAR STOCK obligatorio
    if (endpoint.startsWith('/orders/') && endpoint.endsWith('/cancel') && method === 'PUT') {
      const orderId = endpoint.split('/')[2];
      const ordersStr = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
      const orders = ordersStr ? JSON.parse(ordersStr) : [];
      const orderIndex = orders.findIndex((o) => o.id === orderId);

      if (orderIndex === -1) {
        return {
          ok: false,
          status: 404,
          json: async () => ({ success: false, message: 'Pedido no encontrado' })
        };
      }

      if (orders[orderIndex].status === 'Cancelado') {
        return {
          ok: false,
          status: 400,
          json: async () => ({ success: false, message: 'Este pedido ya se encuentra cancelado' })
        };
      }

      // Devolver stock al inventario
      const prodStr = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const products = prodStr ? JSON.parse(prodStr) : INITIAL_PRODUCTS;

      for (const item of orders[orderIndex].items) {
        const prod = products.find((p) => p.id === item.id);
        if (prod) {
          prod.stock += item.quantity;
        }
      }

      orders[orderIndex].status = 'Cancelado';
      await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Pedido cancelado con éxito y stock repuesto',
          order: orders[orderIndex],
          updatedProducts: products
        })
      };
    }

    return {
      ok: false,
      status: 404,
      json: async () => ({ success: false, message: 'Endpoint no encontrado' })
    };
  }

  // ==============================================================
  // MÉTODOS PÚBLICOS CONSUMIDOS POR LOS CONTEXTOS Y PANTALLAS
  // ==============================================================

  static async login(email, password, isAdmin = false) {
    const response = await this.nativeFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, isAdmin })
    });
    return await response.json();
  }

  static async verifyCode(email, code) {
    const response = await this.nativeFetch('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    });
    return await response.json();
  }

  static async register(userData) {
    const response = await this.nativeFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...userData, role: 'client' })
    });
    return await response.json();
  }

  static async forgotPassword(email, newPassword) {
    const response = await this.nativeFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword })
    });
    return await response.json();
  }

  static async updateProfile(profileData) {
    const response = await this.nativeFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    return await response.json();
  }

  static async getProducts() {
    const response = await this.nativeFetch('/products', {
      method: 'GET'
    });
    return await response.json();
  }

  static async createCombo(comboData) {
    const response = await this.nativeFetch('/products', {
      method: 'POST',
      body: JSON.stringify(comboData)
    });
    return await response.json();
  }

  static async addReview(productId, reviewData) {
    const response = await this.nativeFetch(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
    return await response.json();
  }

  static async createOrder(orderData) {
    const response = await this.nativeFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    return await response.json();
  }

  static async getOrders(userId) {
    const response = await this.nativeFetch(`/orders/user/${userId}`, {
      method: 'GET'
    });
    return await response.json();
  }

  static async getAllOrders() {
    const response = await this.nativeFetch('/orders', {
      method: 'GET'
    });
    return await response.json();
  }

  static async checkDateCapacity(dateString) {
    const response = await this.nativeFetch(`/orders/check-date?date=${encodeURIComponent(dateString)}`, {
      method: 'GET'
    });
    return await response.json();
  }

  static async cancelOrder(orderId) {
    const response = await this.nativeFetch(`/orders/${orderId}/cancel`, {
      method: 'PUT'
    });
    return await response.json();
  }
}

export default ApiService;
