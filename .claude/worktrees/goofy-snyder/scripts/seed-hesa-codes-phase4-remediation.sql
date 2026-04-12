-- Phase 4 Remediation: Add missing HESA coding frames
-- DOMICILE, NATION, SOCCLASS, TTACCOM, QUALENT3

-- ═══ DOMICILE (country of domicile) ═══
INSERT INTO hesa_code_tables (id, field, code, description, created_at, updated_at) VALUES
-- UK constituent countries
('hc-dom-xf','DOMICILE','XF','England',NOW(),NOW()),
('hc-dom-xi','DOMICILE','XI','Northern Ireland',NOW(),NOW()),
('hc-dom-xh','DOMICILE','XH','Scotland',NOW(),NOW()),
('hc-dom-xg','DOMICILE','XG','Wales',NOW(),NOW()),
('hc-dom-xk','DOMICILE','XK','Channel Islands',NOW(),NOW()),
('hc-dom-xl','DOMICILE','XL','Isle of Man',NOW(),NOW()),
('hc-dom-je','DOMICILE','JE','Jersey',NOW(),NOW()),
('hc-dom-gg','DOMICILE','GG','Guernsey',NOW(),NOW()),
-- EU key countries
('hc-dom-fr','DOMICILE','FR','France',NOW(),NOW()),
('hc-dom-de','DOMICILE','DE','Germany',NOW(),NOW()),
('hc-dom-es','DOMICILE','ES','Spain',NOW(),NOW()),
('hc-dom-it','DOMICILE','IT','Italy',NOW(),NOW()),
('hc-dom-ie','DOMICILE','IE','Ireland',NOW(),NOW()),
('hc-dom-pl','DOMICILE','PL','Poland',NOW(),NOW()),
('hc-dom-ro','DOMICILE','RO','Romania',NOW(),NOW()),
('hc-dom-nl','DOMICILE','NL','Netherlands',NOW(),NOW()),
('hc-dom-be','DOMICILE','BE','Belgium',NOW(),NOW()),
('hc-dom-pt','DOMICILE','PT','Portugal',NOW(),NOW()),
('hc-dom-gr','DOMICILE','GR','Greece',NOW(),NOW()),
('hc-dom-se','DOMICILE','SE','Sweden',NOW(),NOW()),
('hc-dom-cz','DOMICILE','CZ','Czech Republic',NOW(),NOW()),
('hc-dom-at','DOMICILE','AT','Austria',NOW(),NOW()),
('hc-dom-bg','DOMICILE','BG','Bulgaria',NOW(),NOW()),
('hc-dom-dk','DOMICILE','DK','Denmark',NOW(),NOW()),
('hc-dom-fi','DOMICILE','FI','Finland',NOW(),NOW()),
('hc-dom-hu','DOMICILE','HU','Hungary',NOW(),NOW()),
('hc-dom-sk','DOMICILE','SK','Slovakia',NOW(),NOW()),
('hc-dom-hr','DOMICILE','HR','Croatia',NOW(),NOW()),
('hc-dom-lt','DOMICILE','LT','Lithuania',NOW(),NOW()),
('hc-dom-lv','DOMICILE','LV','Latvia',NOW(),NOW()),
('hc-dom-ee','DOMICILE','EE','Estonia',NOW(),NOW()),
('hc-dom-si','DOMICILE','SI','Slovenia',NOW(),NOW()),
('hc-dom-cy','DOMICILE','CY','Cyprus',NOW(),NOW()),
('hc-dom-mt','DOMICILE','MT','Malta',NOW(),NOW()),
('hc-dom-lu','DOMICILE','LU','Luxembourg',NOW(),NOW()),
-- International key countries
('hc-dom-cn','DOMICILE','CN','China',NOW(),NOW()),
('hc-dom-in','DOMICILE','IN','India',NOW(),NOW()),
('hc-dom-ng','DOMICILE','NG','Nigeria',NOW(),NOW()),
('hc-dom-us','DOMICILE','US','United States',NOW(),NOW()),
('hc-dom-pk','DOMICILE','PK','Pakistan',NOW(),NOW()),
('hc-dom-bd','DOMICILE','BD','Bangladesh',NOW(),NOW()),
('hc-dom-hk','DOMICILE','HK','Hong Kong',NOW(),NOW()),
('hc-dom-my','DOMICILE','MY','Malaysia',NOW(),NOW()),
('hc-dom-sa','DOMICILE','SA','Saudi Arabia',NOW(),NOW()),
('hc-dom-ke','DOMICILE','KE','Kenya',NOW(),NOW()),
('hc-dom-gh','DOMICILE','GH','Ghana',NOW(),NOW()),
('hc-dom-ae','DOMICILE','AE','United Arab Emirates',NOW(),NOW()),
('hc-dom-sg','DOMICILE','SG','Singapore',NOW(),NOW()),
('hc-dom-jp','DOMICILE','JP','Japan',NOW(),NOW()),
('hc-dom-kr','DOMICILE','KR','South Korea',NOW(),NOW()),
('hc-dom-th','DOMICILE','TH','Thailand',NOW(),NOW()),
-- Catch-all
('hc-dom-zz','DOMICILE','ZZ','Not known',NOW(),NOW()),
('hc-dom-xc','DOMICILE','XC','Other European',NOW(),NOW()),
('hc-dom-xd','DOMICILE','XD','Other non-European',NOW(),NOW())
ON CONFLICT (field, code) DO NOTHING;

-- ═══ NATION (nationality / citizenship) ═══
INSERT INTO hesa_code_tables (id, field, code, description, created_at, updated_at) VALUES
('hc-nat-gb','NATION','GB','British',NOW(),NOW()),
('hc-nat-ie','NATION','IE','Irish',NOW(),NOW()),
('hc-nat-fr','NATION','FR','French',NOW(),NOW()),
('hc-nat-de','NATION','DE','German',NOW(),NOW()),
('hc-nat-es','NATION','ES','Spanish',NOW(),NOW()),
('hc-nat-it','NATION','IT','Italian',NOW(),NOW()),
('hc-nat-pl','NATION','PL','Polish',NOW(),NOW()),
('hc-nat-ro','NATION','RO','Romanian',NOW(),NOW()),
('hc-nat-nl','NATION','NL','Dutch',NOW(),NOW()),
('hc-nat-be','NATION','BE','Belgian',NOW(),NOW()),
('hc-nat-pt','NATION','PT','Portuguese',NOW(),NOW()),
('hc-nat-gr','NATION','GR','Greek',NOW(),NOW()),
('hc-nat-se','NATION','SE','Swedish',NOW(),NOW()),
('hc-nat-cz','NATION','CZ','Czech',NOW(),NOW()),
('hc-nat-at','NATION','AT','Austrian',NOW(),NOW()),
('hc-nat-bg','NATION','BG','Bulgarian',NOW(),NOW()),
('hc-nat-dk','NATION','DK','Danish',NOW(),NOW()),
('hc-nat-fi','NATION','FI','Finnish',NOW(),NOW()),
('hc-nat-hu','NATION','HU','Hungarian',NOW(),NOW()),
('hc-nat-sk','NATION','SK','Slovak',NOW(),NOW()),
('hc-nat-hr','NATION','HR','Croatian',NOW(),NOW()),
('hc-nat-lt','NATION','LT','Lithuanian',NOW(),NOW()),
('hc-nat-lv','NATION','LV','Latvian',NOW(),NOW()),
('hc-nat-ee','NATION','EE','Estonian',NOW(),NOW()),
('hc-nat-si','NATION','SI','Slovenian',NOW(),NOW()),
('hc-nat-cy','NATION','CY','Cypriot',NOW(),NOW()),
('hc-nat-mt','NATION','MT','Maltese',NOW(),NOW()),
('hc-nat-lu','NATION','LU','Luxembourgish',NOW(),NOW()),
('hc-nat-cn','NATION','CN','Chinese',NOW(),NOW()),
('hc-nat-in','NATION','IN','Indian',NOW(),NOW()),
('hc-nat-ng','NATION','NG','Nigerian',NOW(),NOW()),
('hc-nat-us','NATION','US','American',NOW(),NOW()),
('hc-nat-pk','NATION','PK','Pakistani',NOW(),NOW()),
('hc-nat-bd','NATION','BD','Bangladeshi',NOW(),NOW()),
('hc-nat-hk','NATION','HK','Hong Konger',NOW(),NOW()),
('hc-nat-my','NATION','MY','Malaysian',NOW(),NOW()),
('hc-nat-sa','NATION','SA','Saudi',NOW(),NOW()),
('hc-nat-ke','NATION','KE','Kenyan',NOW(),NOW()),
('hc-nat-gh','NATION','GH','Ghanaian',NOW(),NOW()),
('hc-nat-ae','NATION','AE','Emirati',NOW(),NOW()),
('hc-nat-sg','NATION','SG','Singaporean',NOW(),NOW()),
('hc-nat-jp','NATION','JP','Japanese',NOW(),NOW()),
('hc-nat-kr','NATION','KR','South Korean',NOW(),NOW()),
('hc-nat-th','NATION','TH','Thai',NOW(),NOW()),
('hc-nat-zz','NATION','ZZ','Not known',NOW(),NOW())
ON CONFLICT (field, code) DO NOTHING;

-- ═══ SOCCLASS (Socio-economic classification — NS-SEC) ═══
INSERT INTO hesa_code_tables (id, field, code, description, created_at, updated_at) VALUES
('hc-sec-1','SOCCLASS','1','Higher managerial, administrative and professional occupations',NOW(),NOW()),
('hc-sec-2','SOCCLASS','2','Lower managerial, administrative and professional occupations',NOW(),NOW()),
('hc-sec-3','SOCCLASS','3','Intermediate occupations',NOW(),NOW()),
('hc-sec-4','SOCCLASS','4','Small employers and own account workers',NOW(),NOW()),
('hc-sec-5','SOCCLASS','5','Lower supervisory and technical occupations',NOW(),NOW()),
('hc-sec-6','SOCCLASS','6','Semi-routine occupations',NOW(),NOW()),
('hc-sec-7','SOCCLASS','7','Routine occupations',NOW(),NOW()),
('hc-sec-8','SOCCLASS','8','Never worked and long-term unemployed',NOW(),NOW()),
('hc-sec-9','SOCCLASS','9','Not classified / not applicable',NOW(),NOW())
ON CONFLICT (field, code) DO NOTHING;

-- ═══ TTACCOM (Term-time accommodation) ═══
INSERT INTO hesa_code_tables (id, field, code, description, created_at, updated_at) VALUES
('hc-tta-1','TTACCOM','1','Provider maintained property',NOW(),NOW()),
('hc-tta-2','TTACCOM','2','Parental/guardian home',NOW(),NOW()),
('hc-tta-4','TTACCOM','4','Other rented accommodation',NOW(),NOW()),
('hc-tta-5','TTACCOM','5','Own residence',NOW(),NOW()),
('hc-tta-6','TTACCOM','6','Other',NOW(),NOW()),
('hc-tta-7','TTACCOM','7','Not known',NOW(),NOW()),
('hc-tta-8','TTACCOM','8','Not in attendance at the provider',NOW(),NOW())
ON CONFLICT (field, code) DO NOTHING;

-- ═══ QUALENT3 (Highest qualification on entry) ═══
INSERT INTO hesa_code_tables (id, field, code, description, created_at, updated_at) VALUES
('hc-qe3-c20','QUALENT3','C20','A-levels',NOW(),NOW()),
('hc-qe3-c30','QUALENT3','C30','AS-levels',NOW(),NOW()),
('hc-qe3-c90','QUALENT3','C90','T-levels',NOW(),NOW()),
('hc-qe3-h11','QUALENT3','H11','First degree with honours',NOW(),NOW()),
('hc-qe3-h71','QUALENT3','H71','Professional qualification at level 7',NOW(),NOW()),
('hc-qe3-i11','QUALENT3','I11','Foundation degree',NOW(),NOW()),
('hc-qe3-j10','QUALENT3','J10','BTEC Level 3 (National Certificate/Diploma)',NOW(),NOW()),
('hc-qe3-j30','QUALENT3','J30','Access to HE Diploma',NOW(),NOW()),
('hc-qe3-p41','QUALENT3','P41','International Baccalaureate Diploma',NOW(),NOW()),
('hc-qe3-x00','QUALENT3','X00','Higher education credit',NOW(),NOW()),
('hc-qe3-p01','QUALENT3','P01','Higher National Certificate (HNC)',NOW(),NOW()),
('hc-qe3-p02','QUALENT3','P02','Higher National Diploma (HND)',NOW(),NOW()),
('hc-qe3-x01','QUALENT3','X01','No formal qualification',NOW(),NOW()),
('hc-qe3-m71','QUALENT3','M71','Postgraduate diploma',NOW(),NOW()),
('hc-qe3-m11','QUALENT3','M11','Masters degree',NOW(),NOW()),
('hc-qe3-d11','QUALENT3','D11','Doctorate (PhD)',NOW(),NOW())
ON CONFLICT (field, code) DO NOTHING;

-- ═══ Populate PersonName from existing Person records ═══
INSERT INTO person_names (id, person_id, name_type, title, first_name, middle_names, last_name, start_date, end_date, created_at, updated_at, created_by)
SELECT
  'pn-' || p.id,
  p.id,
  'LEGAL',
  p.title,
  p.first_name,
  p.middle_names,
  p.last_name,
  COALESCE(p.created_at::date, '2023-09-01'),
  NULL,
  NOW(),
  NOW(),
  'system-migration'
FROM persons p
WHERE NOT EXISTS (
  SELECT 1 FROM person_names pn WHERE pn.person_id = p.id AND pn.name_type = 'LEGAL' AND pn.end_date IS NULL
);
