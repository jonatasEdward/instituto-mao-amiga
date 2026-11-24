-- Contexto W3C do trace da requisição que gerou o evento (ex.: 00-<trace>-<span>-01).
alter table outbox_eventos add column traceparent varchar(64);
