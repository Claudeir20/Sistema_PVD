-- Migração inicial: marca o começo do histórico do banco.
-- As tabelas entram nas próximas versões (V2, V3...), uma por seção do roteiro.
-- Nunca altere uma migração já aplicada: crie sempre uma nova.
--
-- Convenções do projeto:
--   * valores em dinheiro: BIGINT em centavos (ex.: price_in_cents);
--   * datas e horas: TIMESTAMP WITH TIME ZONE, gravadas em UTC;
--   * identificadores: UUID.
SELECT 1;
