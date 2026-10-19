-- M11 only: ephemeral PostgreSQL TEMP tables on a dedicated CI database.
-- Never execute in a live learner database or web app request.
CREATE TEMP TABLE musteriler (
  id integer PRIMARY KEY,
  ad text NOT NULL
);
CREATE TEMP TABLE siparisler (
  id integer PRIMARY KEY,
  musteri_id integer NOT NULL REFERENCES musteriler(id),
  tutar integer NOT NULL CHECK (tutar >= 0),
  durum text NOT NULL,
  teslim_tarihi date
);
INSERT INTO musteriler (id,ad) VALUES (1,'Ayşe'),(2,'Bora'),(3,'Can');
INSERT INTO siparisler (id,musteri_id,tutar,durum,teslim_tarihi) VALUES
  (10,1,120,'teslim','2026-10-01'),
  (11,1,80,'bekliyor',NULL),
  (12,2,200,'teslim','2026-10-02'),
  (13,2,50,'teslim','2026-10-03'),
  (14,1,100,'teslim','2026-10-04');
