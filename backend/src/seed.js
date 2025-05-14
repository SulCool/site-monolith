const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.product.deleteMany();
    await prisma.product.createMany({
        data: [
            { name: 'M100', description: 'Для подготовительных работ, фундаментов', price: 3200, stock: 100, category: 'Марка', label: 'Эконом' },
            { name: 'M200', description: 'Для фундаментов, полов, дорожек', price: 3500, stock: 100, category: 'Марка', label: 'Популярный' },
            { name: 'M300', description: 'Для монолитных стен, перекрытий', price: 3800, stock: 100, category: 'Марка', label: 'Премиум' },
            { name: 'M350', description: 'Для высокопрочных конструкций', price: 6600, stock: 100, category: 'Марка', label: 'Премиум' },
            { name: 'M400', description: 'Для мостов, колонн, высоконагруженных конструкций', price: 7300, stock: 100, category: 'Марка', label: 'Популярный' },
            { name: 'M450', description: 'Для специальных строительных объектов', price: 8500, stock: 100, category: 'Марка', label: 'Эконом' },
            { name: 'M500', description: 'Для экстремальных условий эксплуатации', price: 9100, stock: 100, category: 'Марка', label: 'Премиум' },
            { name: 'W2', description: 'Низкая водонепроницаемость для внутренних работ', price: 3000, stock: 100, category: 'Водонепроницаемость', label: 'Эконом' },
            { name: 'W4', description: 'Средняя водонепроницаемость для фундаментов', price: 4500, stock: 100, category: 'Водонепроницаемость', label: 'Популярный' },
            { name: 'W6', description: 'Для конструкций с умеренной влажностью', price: 5300, stock: 100, category: 'Водонепроницаемость', label: 'Популярный' },
            { name: 'W8', description: 'Для объектов с высокой влажностью', price: 5800, stock: 100, category: 'Водонепроницаемость', label: 'Эконом' },
            { name: 'W10', description: 'Для гидротехнических сооружений', price: 6700, stock: 100, category: 'Водонепроницаемость', label: 'Премиум' },
            { name: 'W15', description: 'Высокая водонепроницаемость для специальных объектов', price: 7200, stock: 100, category: 'Водонепроницаемость', label: 'Премиум' },
            { name: 'W20', description: 'Максимальная водонепроницаемость для экстремальных условий', price: 8700, stock: 100, category: 'Водонепроницаемость', label: 'Премиум' },
            { name: 'F50', description: 'Для регионов с мягкими зимами', price: 3200, stock: 100, category: 'Морозостойкость', label: 'Эконом' },
            { name: 'F100', description: 'Для умеренных климатических условий', price: 4100, stock: 100, category: 'Морозостойкость', label: 'Эконом' },
            { name: 'F150', description: 'Для холодных регионов', price: 4800, stock: 100, category: 'Морозостойкость', label: 'Эконом' },
            { name: 'F200', description: 'Для суровых зимних условий', price: 6100, stock: 100, category: 'Морозостойкость', label: 'Премиум' },
            { name: 'F250', description: 'Для высоких морозостойких требований', price: 5300, stock: 100, category: 'Морозостойкость', label: 'Популярный' },
            { name: 'F300', description: 'Для экстремально холодных регионов', price: 6900, stock: 100, category: 'Морозостойкость', label: 'Популярный' },
            { name: 'F350', description: 'Для специальных морозостойких конструкций', price: 7500, stock: 100, category: 'Морозостойкость', label: 'Популярный' },
            { name: 'F400', description: 'Для арктических условий', price: 8200, stock: 100, category: 'Морозостойкость', label: 'Премиум' },
            { name: 'F450', description: 'Для экстремальных морозостойких объектов', price: 9100, stock: 100, category: 'Морозостойкость', label: 'Премиум' },
            { name: 'F500', description: 'Максимальная морозостойкость', price: 10500, stock: 100, category: 'Морозостойкость', label: 'Премиум' },
        ],
    });
    console.log('Test products seeded successfully');
}

main()
    .catch(e => console.error('Error seeding database:', e))
    .finally(async () => await prisma.$disconnect());