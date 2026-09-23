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

  // Products — generados desde public/productos/{negras,claras}
  const publicDir = join(__dirname, '..', 'public', 'productos');
  const negras = readdirSync(join(publicDir, 'negras')).map((f) => ({
    file: f,
    color: 'Negro',
    disenoUrl: `/productos/negras/${f}`,
  }));
  const claras = readdirSync(join(publicDir, 'claras')).map((f) => ({
    file: f,
    color: 'Blanco',
    disenoUrl: `/productos/claras/${f}`,
  }));
  const catalogoFuente = [...negras, ...claras];

  const sizes = ['S', 'M', 'L', 'XL'];
  const products = [];
  const allVariants = [];

  for (const item of catalogoFuente) {
    const slugBase = item.file.replace(/\.png$/, '');
    const slug = `${slugBase}-${item.color.toLowerCase()}`;
    const nombre = tituloDesdeSlug(slugBase);

    const product = await prisma.product.create({
      data: {
        nombreSlug: slug,
        descripcion: `Polera ${nombre} - Colección Bandas`,
        disenoUrl: item.disenoUrl,
        artista: nombre,
        temporada: 'Bandas 2026',
        precio: 16990,
      },
    });
    products.push(product);

    const skuBase = `AJI${products.length.toString().padStart(3, '0')}`;
    for (const size of sizes) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          talle: size,
          color: item.color,
          sku: `${skuBase}-${size}-${item.color.slice(0, 3).toUpperCase()}`,
          stock: Math.floor(Math.random() * 20) + 5,
        },
      });
      allVariants.push(variant);
    }
  }
  console.log(`Products: ${products.length}`);
  console.log(`Variants: ${allVariants.length}`);

  // Orders
  const orderData = [
    { customerId: customers[0].id, total: 32000, estado: 'Pendiente', canal: 'Instagram' },
    { customerId: customers[1].id, total: 45000, estado: 'EnProduccion', canal: 'WhatsApp' },
    { customerId: customers[2].id, total: 32000, estado: 'Enviado', canal: 'Feria' },
    { customerId: customers[0].id, total: 64000, estado: 'Entregado', canal: 'Instagram' },
    { customerId: customers[1].id, total: 32000, estado: 'Pendiente', canal: 'WhatsApp' },
    { customerId: customers[2].id, total: 45000, estado: 'EnProduccion', canal: 'Feria' },
  ];

  const orders = [];
  for (const o of orderData) {
    const variant = allVariants[Math.floor(Math.random() * allVariants.length)];
    const order = await prisma.order.create({
      data: {
        customerId: o.customerId,
        subtotal: o.total,
        total: o.total,
        estado: o.estado,
        estadoPago: o.estado === 'Entregado' ? 'Pagado' : 'PendienteTransferencia',
        canal: o.canal,
        notas: `Pedido ${o.estado}`,
        items: {
          create: {
            variantId: variant.id,
            cantidad: 1,
            precioUnit: 16990,
          },
        },
      },
    });
    orders.push(order);
  }
  console.log(`Orders: ${orders.length}`);

  // Shipments for shipped/delivered orders
  const shippedOrders = orders.filter(o => ['Enviado', 'Entregado'].includes(o.estado));
  for (const order of shippedOrders) {
    await prisma.shipment.create({
      data: {
        orderId: order.id,
        trackingNumber: `SK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        transportista: 'Chilexpress',
        costo: 5000,
        fechaDespacho: new Date(),
        fechaEstimada: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        estado: order.estado === 'Entregado' ? 'Entregado' : 'En Tránsito',
      },
    });
  }
  console.log(`Shipments: ${shippedOrders.length}`);

  // Suppliers
  const supplierTextil = await prisma.supplier.create({
    data: {
      nombre: 'Textil SpA',
      contacto: 'contacto@textilspa.cl',
      leadTimeDias: 14,
      costoBase: 25000,
      calificacion: 4,
    },
  });
  await prisma.supplier.create({
    data: {
      nombre: 'Estampados del Sur',
      contacto: 'ventas@estampadosdelsur.cl',
      leadTimeDias: 10,
      costoBase: 18000,
      calificacion: 5,
    },
  });
  console.log('Suppliers: 2');

  // Production batch
  const loteVariants = allVariants.slice(0, 8);
  await prisma.productionBatch.create({
    data: {
      supplierId: supplierTextil.id,
      costoTotal: 280000,
      fechaEstimada: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      estado: 'EnProgreso',
      items: {
        create: loteVariants.map((v) => ({
          variantId: v.id,
          cantidad: 10,
          costoUnitario: 3500,
        })),
      },
    },
  });
  console.log('Production batch created');

  // Stock movements
  for (const v of allVariants.slice(0, 8)) {
    await prisma.stockMovement.create({
      data: {
        variantId: v.id,
        cantidad: 20,
        tipo: 'Entrada',
        origen: 'Producción',
        descripcion: 'Producción inicial The Music Drop',
      },
    });
  }
  console.log('Stock movements created');

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
