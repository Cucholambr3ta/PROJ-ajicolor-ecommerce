import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { readdirSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

function tituloDesdeSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Set de prueba: cada diseño es UN producto con 3 variantes de color (negro,
// blanco, gris) × 5 talles. El gris reutiliza el arte claro hasta que llegue
// el arte real (confirmado con el dueño: este catálogo es solo de prueba).
const TALLES = ['S', 'M', 'L', 'XL', '2XL'];
const COLORES = ['Negro', 'Blanco', 'Gris'] as const;

async function main() {
  console.log('Seeding database...');

  // Admin user
  const passwordHash = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ajicolor.cl' },
    update: {},
    create: {
      email: 'admin@ajicolor.cl',
      passwordHash,
      rol: 'Propietario',
    },
  });
  console.log(`Admin: ${admin.email}`);

  // Customers
  const customerPasswordHash = await hash('cliente123', 12);
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        nombre: 'Camila Reyes',
        email: 'camila@test.cl',
        passwordHash: customerPasswordHash,
        telefono: '+56912345678',
        direccion: 'Santiago, Chile',
        backstagePass: true,
      },
    }),
    prisma.customer.create({
      data: {
        nombre: 'Mateo Soto',
        email: 'mateo@test.cl',
        telefono: '+56987654321',
        direccion: 'Valparaíso, Chile',
      },
    }),
    prisma.customer.create({
      data: {
        nombre: 'Valentina Díaz',
        email: 'valentina@test.cl',
        telefono: '+56911223344',
        direccion: 'Concepción, Chile',
      },
    }),
  ]);
  console.log(`Customers: ${customers.length}`);

  // Colección activa del mes
  const collection = await prisma.collection.create({
    data: {
      nombre: 'Drop Clásicos del Rock',
      slug: 'drop-clasicos-del-rock',
      descripcion: 'Colección de lanzamiento — poleras 100% serigrafía, tiraje limitado.',
      fechaLanzamiento: new Date(),
      fechaCierre: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      activa: true,
    },
  });
  console.log(`Collection: ${collection.nombre}`);

  // Un producto por diseño (arte de negras/, reusado como imagen principal;
  // claras/ se agrega como segunda imagen de galería)
  const publicDir = join(__dirname, '..', 'public', 'productos');
  const disenos = readdirSync(join(publicDir, 'negras'));

  const products = [];
  const allVariants: { id: string; color: string; talle: string }[] = [];

  for (let i = 0; i < disenos.length; i++) {
    const file = disenos[i];
    const slugBase = file.replace(/\.png$/, '');
    const slug = slugBase;
    const nombre = tituloDesdeSlug(slugBase);
    const disenoUrl = `/productos/negras/${file}`;
    const disenoClaro = `/productos/claras/${file}`;

    const product = await prisma.product.create({
      data: {
        nombre,
        slug,
        nombreSlug: `${slugBase}-negro`, // compat con datos legados
        descripcion: `Polera ${nombre} — 100% serigrafía, tiraje limitado.`,
        disenoUrl,
        artista: nombre,
        temporada: 'Bandas 2026',
        precio: 16990,
        costoUnitario: 5500,
        collectionId: collection.id,
        images: {
          create: [
            { url: disenoUrl, alt: `${nombre} negro`, orden: 0 },
            { url: disenoClaro, alt: `${nombre} claro`, orden: 1 },
          ],
        },
      },
    });
    products.push(product);

    const skuBase = `AJI${(i + 1).toString().padStart(3, '0')}`;
    for (const color of COLORES) {
      for (const talle of TALLES) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            talle,
            color,
            sku: `${skuBase}-${talle}-${color.slice(0, 3).toUpperCase()}`,
            // Bajo pedido: stock 0 por defecto, salvo un puñado de piezas
            // ya impresas (sobrantes) que se marcan aparte más abajo.
            stock: 0,
          },
        });
        allVariants.push({ id: variant.id, color: variant.color, talle: variant.talle });
      }
    }
  }
  console.log(`Products: ${products.length}`);
  console.log(`Variants: ${allVariants.length}`);

  // Suppliers
  const supplierTextil = await prisma.supplier.create({
    data: {
      nombre: 'Textil SpA',
      contacto: 'contacto@textilspa.cl',
      email: 'contacto@textilspa.cl',
      telefono: '+56221234567',
      tipo: 'insumos',
      leadTimeDias: 14,
      costoBase: 25000,
      calificacion: 4,
    },
  });
  await prisma.supplier.create({
    data: {
      nombre: 'Estampados del Sur',
      contacto: 'ventas@estampadosdelsur.cl',
      email: 'ventas@estampadosdelsur.cl',
      telefono: '+56229876543',
      tipo: 'taller',
      leadTimeDias: 10,
      costoBase: 18000,
      calificacion: 5,
    },
  });
  console.log('Suppliers: 2');

  // Insumos (materiales)
  await prisma.material.createMany({
    data: [
      { nombre: 'Polera lisa algodón', unidad: 'unidad', stock: 120, costo: 3200 },
      { nombre: 'Tinta plastisol negra', unidad: 'litro', stock: 8, costo: 15000 },
      { nombre: 'Tinta plastisol blanca', unidad: 'litro', stock: 5, costo: 16000 },
    ],
  });
  console.log('Materials: 3');

  // Pedidos de ejemplo cubriendo el flujo real: pendiente de pago, pagado,
  // en producción, listo, enviado, entregado, cancelado.
  const pick = () => allVariants[Math.floor(Math.random() * allVariants.length)];

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const orderSeeds = [
    { customerId: customers[0].id, canal: 'Web' as const, estado: 'Pendiente' as const, estadoPago: 'PendienteTransferencia' as const },
    { customerId: customers[1].id, canal: 'Instagram' as const, estado: 'Pagado' as const, estadoPago: 'Pagado' as const, pagadoAt: new Date(now - 1 * day) },
    { customerId: customers[2].id, canal: 'WhatsApp' as const, estado: 'EnProduccion' as const, estadoPago: 'Pagado' as const, pagadoAt: new Date(now - 3 * day) },
    { customerId: customers[0].id, canal: 'Web' as const, estado: 'ListoParaEnvio' as const, estadoPago: 'Pagado' as const, pagadoAt: new Date(now - 6 * day) },
    { customerId: customers[1].id, canal: 'Feria' as const, estado: 'Enviado' as const, estadoPago: 'Pagado' as const, pagadoAt: new Date(now - 9 * day) },
    { customerId: customers[2].id, canal: 'Web' as const, estado: 'Entregado' as const, estadoPago: 'Pagado' as const, pagadoAt: new Date(now - 15 * day) },
    { customerId: customers[0].id, canal: 'Instagram' as const, estado: 'Cancelado' as const, estadoPago: 'PendienteTransferencia' as const },
  ];

  const orders = [];
  for (const seed of orderSeeds) {
    const variant = pick();
    const precioUnit = 16990;
    const cantidad = 1;
    const subtotal = precioUnit * cantidad;
    const costoEnvio = 3000;

    const order = await prisma.order.create({
      data: {
        customerId: seed.customerId,
        canal: seed.canal,
        estado: seed.estado,
        estadoPago: seed.estadoPago,
        subtotal,
        costoEnvio,
        total: subtotal + costoEnvio,
        metodoEnvio: 'CorreosSucursal',
        pagadoAt: 'pagadoAt' in seed ? seed.pagadoAt : null,
        fechaCompromiso: 'pagadoAt' in seed && seed.pagadoAt ? new Date(seed.pagadoAt.getTime() + 7 * day) : null,
        envioNombre: 'Cliente de Prueba',
        envioTelefono: '+56912345678',
        envioCalle: 'Av. Siempre Viva',
        envioNumero: '123',
        envioComuna: 'Providencia',
        envioRegion: 'Región Metropolitana',
        notas: `Pedido de ejemplo — ${seed.estado}`,
        items: {
          create: {
            variantId: variant.id,
            cantidad,
            precioUnit,
            costoUnit: 5500,
          },
        },
      },
    });
    orders.push({ ...order, estado: seed.estado });

    if (seed.estado !== 'Pendiente' && seed.estado !== 'Cancelado') {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          monto: order.total,
          banco: 'Tenpo',
          referencia: `REF-${order.numero}`,
          estado: 'Pagado',
          confirmadoPorId: admin.id,
          confirmadoAt: 'pagadoAt' in seed ? seed.pagadoAt : new Date(),
        },
      });
    }
  }
  console.log(`Orders: ${orders.length}`);

  // Envíos para pedidos que ya avanzaron
  const conEnvio = orders.filter((o) => ['ListoParaEnvio', 'Enviado', 'Entregado'].includes(o.estado));
  for (const order of conEnvio) {
    const estadoEnvio =
      order.estado === 'Entregado' ? 'Entregado' : order.estado === 'Enviado' ? 'EnTransito' : 'Preparando';
    await prisma.shipment.create({
      data: {
        orderId: order.id,
        metodo: 'CorreosSucursal',
        trackingNumber: estadoEnvio === 'Preparando' ? null : `SK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        transportista: 'Correos de Chile',
        sucursal: 'Providencia',
        costo: 3000,
        fechaDespacho: estadoEnvio === 'Preparando' ? null : new Date(now - 2 * day),
        fechaEstimada: new Date(now + 2 * day),
        fechaEntrega: order.estado === 'Entregado' ? new Date(now - 1 * day) : null,
        estado: estadoEnvio,
      },
    });
  }
  console.log(`Shipments: ${conEnvio.length}`);

  // Lote de producción vinculado a ítems de pedidos pagados (bajo pedido real)
  const enProduccion = orders.find((o) => o.estado === 'EnProduccion');
  if (enProduccion) {
    const orderItem = await prisma.orderItem.findFirst({ where: { orderId: enProduccion.id } });
    if (orderItem) {
      await prisma.productionBatch.create({
        data: {
          supplierId: supplierTextil.id,
          costoTotal: 5500,
          fechaEstimada: new Date(now + 4 * day),
          estado: 'EnProgreso',
          items: {
            create: {
              variantId: orderItem.variantId,
              orderItemId: orderItem.id,
              cantidad: orderItem.cantidad,
              costoUnitario: 5500,
            },
          },
        },
      });
      console.log('Production batch created (linked to order item)');
    }
  }

  // Stock de piezas ya impresas (sobrantes de feria) — el resto del catálogo
  // queda en 0 porque el negocio es bajo pedido.
  const sobrantes = allVariants.slice(0, 6);
  for (const v of sobrantes) {
    await prisma.productVariant.update({ where: { id: v.id }, data: { stock: 3 } });
    await prisma.stockMovement.create({
      data: {
        variantId: v.id,
        userId: admin.id,
        cantidad: 3,
        tipo: 'Entrada',
        origen: 'Sobrante de feria',
        descripcion: 'Piezas ya impresas disponibles para despacho inmediato',
      },
    });
  }
  console.log(`Stock movements: ${sobrantes.length} (sobrantes de feria)`);

  // Configuración de la tienda con los datos reales ya recibidos del dueño
  await prisma.storeSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      emailContacto: 'ajicolorserigrafia28@gmail.com',
      telefonoContacto: '+56978283064',
      whatsapp: '+56978283064',
      instagram: 'el_aji_color_estampados',
      facebook: 'https://www.facebook.com/people/El-aji-color-dise%C3%B1o-y-estampados/100070478673256/',
      tiktok: 'el.aji.color.esta',
      horarioAtencion: 'Lunes a viernes 09:00–19:00 hrs, sábado 09:00–14:00 hrs',
      bancoTitular: 'Camilo Alexander Morales Opazo',
      bancoRut: '17.070.384-7',
      bancoNombre: 'Tenpo',
      bancoTipoCuenta: 'Cuenta Vista',
      bancoNumeroCuenta: '111117070384',
      bancoEmail: 'camilomoralesopazo@gmail.com',
      costoEnvioCorreos: 3000,
      plazoProduccionDias: 7,
    },
  });
  console.log('Store settings created');

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
