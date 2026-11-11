-- Migration: adicionar taxa de entrega e formas de pagamento configuráveis

ALTER TABLE public.store_settings
ADD COLUMN delivery_fee NUMERIC(10,2) DEFAULT 0,
ADD COLUMN accepted_payment_methods TEXT[] DEFAULT ARRAY['pix','dinheiro','cartao_credito','cartao_debito'];
