-- Migration para adicionar informações de entrega

-- 1. Adicionar colunas delivery_type e delivery_address na tabela orders
ALTER TABLE public.orders
ADD COLUMN delivery_type TEXT,
ADD COLUMN delivery_address JSONB;

-- 2. Opcional: Atualizar os pedidos existentes para definirem um tipo (ex: 'retirada' como default para não ficar nulo)
UPDATE public.orders
SET delivery_type = 'retirada'
WHERE delivery_type IS NULL;
