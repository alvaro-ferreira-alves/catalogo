import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cyyievhshktpfzpzgpfy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5eWlldmhzaGt0cGZ6cHpncGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NDg2MDEsImV4cCI6MjEwNTUyNDYwMX0.sVdPGv5QyDznPtEK1BFxtbdrZbl1ZHBvlMBCNoqP0hc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── CATEGORIAS (ordem de exibição) ──────────────────────────────────────────
const categories = [
  { name: 'Prato Feito',  sort_order: 1 },
  { name: 'Adicionais',   sort_order: 2 },
  { name: 'Porções',      sort_order: 3 },
  { name: 'Gourmet',      sort_order: 4 },
  { name: 'Cremes',       sort_order: 5 },
  { name: 'Lanches',      sort_order: 6 },
  { name: 'Bebidas',      sort_order: 7 },
];

// ── PRODUTOS por categoria ──────────────────────────────────────────────────
const productsByCategory = {
  'Prato Feito': [
    'PF de Bife',
    'PF de Frango',
    'PF de Bisteca Suína',
    'PF de Caranha',
    'PF de Surubim',
    'PF de Chambari',
  ],
  'Adicionais': [
    'Arroz',
    'Feijão',
    'Macarrão',
    'Salada',
    'Ovo',
    'Filé de Frango',
    'Bife',
    'Caranha',
    'Chambari',
  ],
  'Porções': [
    'Batata Frita',
    'Tilapia Empanada',
    'Frango a Passarinho',
  ],
  'Gourmet': [
    'Morango',
    'Chocolate',
    'Maracujá',
    'Cupuaçu',
    'Capuccino',
  ],
  'Cremes': [
    'Maracujá',
    'Cupuaçu',
    'Acerola',
    'Cajá',
  ],
  'Lanches': [
    'Tapioca de Carne de Sol',
    'Tapioca de Frango',
    'Tapioca de Calabresa',
    'Tapioca Misturado',
    'Cuscuz Carne de Sol',
    'Cuscuz de Frango',
    'Cuscuz de Calabresa',
    'Crepioca de Carne de Sol',
    'Crepioca de Frango',
    'Crepioca de Calabresa',
    'Crepioca Misturado',
  ],
  'Bebidas': [
    'Água c/ Gás',
    'Água Mineral',
    'Refrigerante Lata',
    'Refrigerante de 1L',
    'Refrigerante de 2L',
    'Suco Kapo',
    'Suco Dell Vale',
    'Suco Maracujá',
    'Suco Cupuaçu',
    'Suco Cajá',
    'Suco Acerola',
  ],
};

async function main() {
  console.log('🧹 Limpando banco de dados...');

  // Limpa na ordem correta (FK)
  const { error: e1 } = await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e1) console.error('Erro ao limpar order_items:', e1.message);

  const { error: e2 } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e2) console.error('Erro ao limpar orders:', e2.message);

  const { error: e3 } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e3) console.error('Erro ao limpar products:', e3.message);

  const { error: e4 } = await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e4) console.error('Erro ao limpar categories:', e4.message);

  console.log('✅ Banco limpo!\n');

  // Insere categorias e coleta IDs
  const categoryMap = {};
  for (const cat of categories) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...cat, active: true })
      .select()
      .single();

    if (error) {
      console.error(`Erro ao inserir categoria "${cat.name}":`, error.message);
      continue;
    }
    categoryMap[cat.name] = data.id;
    console.log(`📂 Categoria criada: ${cat.name} (${data.id})`);
  }

  // Insere produtos
  let totalProdutos = 0;
  for (const [catName, produtos] of Object.entries(productsByCategory)) {
    const categoryId = categoryMap[catName];
    if (!categoryId) {
      console.warn(`⚠️  Categoria não encontrada: ${catName}`);
      continue;
    }

    for (const nome of produtos) {
      const { error } = await supabase.from('products').insert({
        name: nome,
        category_id: categoryId,
        price: 0,       // sem preço fixo no cardápio visual
        active: true,
        description: null,
        image_url: null,
      });

      if (error) {
        console.error(`  ❌ Erro ao inserir "${nome}":`, error.message);
      } else {
        console.log(`  ✅ Produto inserido: ${nome} [${catName}]`);
        totalProdutos++;
      }
    }
  }

  console.log(`\n🎉 Concluído! ${categories.length} categorias e ${totalProdutos} produtos cadastrados.`);
}

main().catch(console.error);
