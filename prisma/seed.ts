import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

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
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        nombre: 'Camila Reyes',
        email: 'camila@test.cl',
        telefono: '+56912345678',
        direccion: 'Santiago, Chile',
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

  // Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        nombreSlug: 'bass-line-anthem',
        descripcion: 'Polera Bass Line Anthem - Colección The Music Drop',
        disenoUrl: 'https://via.placeholder.com/600x800?text=BASS+LINE+TEE',
        artista: 'Ajicolor Studio',
        temporada: 'The Music Drop 2026',
      },
    }),
    prisma.product.create({
      data: {
        nombreSlug: 'funk-master-hoodie',
        descripcion: 'Polera Funk Master Hoodie - Colección The Music Drop',
        disenoUrl: 'https://via.placeholder.com/600x800?text=FUNK+MASTER',
        artista: 'Ajicolor Studio',
        temporada: 'The Music Drop 2026',
      },
    }),
    prisma.product.create({
      data: {
        nombreSlug: 'jazz-cat-pop-art',
        descripcion: 'Polera Jazz Cat Pop Art - Colección The Music Drop',
        disenoUrl: 'https://via.placeholder.com/600x800?text=JAZZ+CAT+POP',
        artista: 'Ajicolor Studio',
        temporada: 'The Music Drop 2026',
      },
    }),
  ]);
  console.log(`Products: ${products.length}`);

  // Variants
  const sizes = ['S', 'M', 'L', 'XL'];
  const colors = ['Negro', 'Blanco'];
  const allVariants = [];

  for (const product of products) {
    for (const color of colors) {
      for (const size of sizes) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            talle: size,
            color,
            sku: `${product.nombreSlug.toUpperCase().slice(0, 3)}-${size}-${color.slice(0, 3).toUpperCase()}`,
            stock: Math.floor(Math.random() * 20) + 5,
          },
        });
        allVariants.push(variant);
      }
    }
  }
  console.log(`Variants: ${allVariants.length}`);

  // Orders
  const orderData = [
    { customerId: customers[0].id, total: 32000, estado: 'Pendiente', canal: 'Instagram' },
    { customerId: customers[1].id, total: 45000, estado: 'En Producción', canal: 'WhatsApp' },
    { customerId: customers[2].id, total: 32000, estado: 'Enviado', canal: 'Feria' },
    { customerId: customers[0].id, total: 64000, estado: 'Entregado', canal: 'Instagram' },
    { customerId: customers[1].id, total: 32000, estado: 'Pendiente', canal: 'WhatsApp' },
    { customerId: customers[2].id, total: 45000, estado: 'En Producción', canal: 'Feria' },
  ];

  const orders = [];
  for (const o of orderData) {
    const order = await prisma.order.create({
      data: {
        customerId: o.customerId,
        total: o.total,
        estado: o.estado,
        canal: o.canal,
        notas: `Pedido ${o.estado}`,
        items: {
          create: {
            variantId: allVariants[Math.floor(Math.random() * allVariants.length)].id,
            cantidad: 1,
            precioUnit: o.total,
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

  // Production batch
  await prisma.productionBatch.create({
    data: {
      proveedor: 'Textil SpA',
      variantes: allVariants.slice(0, 8).map(v => v.sku).join(', '),
      unidadesPorVar: '10',
      costoTotal: 280000,
      fechaEstimada: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      estado: 'En Progreso',
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
