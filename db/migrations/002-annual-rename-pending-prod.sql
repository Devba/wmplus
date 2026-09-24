-- V4 §8: YRLY -> Annual. Aplicado en hoamanager26_dev (2026-09-23).
-- PENDIENTE PROD: coordinar con Rick antes de aplicar en
-- hoamanager26 y webhoamanager (ambas con YRLY_AssmtRegister vacía al 2026-09-23).
RENAME TABLE YRLY_AssmtRegister TO Annual_AssmtRegister;
