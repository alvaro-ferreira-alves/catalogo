-- Migration para adicionar a coluna de telefone na tabela orders

ALTER TABLE public.orders
ADD COLUMN customer_phone TEXT;
