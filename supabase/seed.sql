insert into public.price_tiers (label, price, is_preorder)
values
  ('XR au 11 Pro Max', 3000, false), ('12 au 13 Pro Max', 3500, false),
  ('14 au 14 Pro Max', 4000, false), ('15 au 15 Pro Max', 5000, false),
  ('16 au 16 Pro Max', 6000, false), ('17 au 17 Pro Max', 7000, true),
  ('18 au 18 Pro Max', 8000, true)
on conflict (label) do update set price = excluded.price, is_preorder = excluded.is_preorder;

insert into public.iphone_models (name, sort_order, price_tier_id)
select model.name, model.sort_order, tier.id
from (values
  ('iPhone XR', 1, 'XR au 11 Pro Max'), ('iPhone XS', 2, 'XR au 11 Pro Max'), ('iPhone XS Max', 3, 'XR au 11 Pro Max'),
  ('iPhone 11', 4, 'XR au 11 Pro Max'), ('iPhone 11 Pro', 5, 'XR au 11 Pro Max'), ('iPhone 11 Pro Max', 6, 'XR au 11 Pro Max'),
  ('iPhone 12 mini', 7, '12 au 13 Pro Max'), ('iPhone 12', 8, '12 au 13 Pro Max'), ('iPhone 12 Pro', 9, '12 au 13 Pro Max'), ('iPhone 12 Pro Max', 10, '12 au 13 Pro Max'),
  ('iPhone 13 mini', 11, '12 au 13 Pro Max'), ('iPhone 13', 12, '12 au 13 Pro Max'), ('iPhone 13 Pro', 13, '12 au 13 Pro Max'), ('iPhone 13 Pro Max', 14, '12 au 13 Pro Max'),
  ('iPhone 14', 15, '14 au 14 Pro Max'), ('iPhone 14 Plus', 16, '14 au 14 Pro Max'), ('iPhone 14 Pro', 17, '14 au 14 Pro Max'), ('iPhone 14 Pro Max', 18, '14 au 14 Pro Max'),
  ('iPhone 15', 19, '15 au 15 Pro Max'), ('iPhone 15 Plus', 20, '15 au 15 Pro Max'), ('iPhone 15 Pro', 21, '15 au 15 Pro Max'), ('iPhone 15 Pro Max', 22, '15 au 15 Pro Max'),
  ('iPhone 16', 23, '16 au 16 Pro Max'), ('iPhone 16 Plus', 24, '16 au 16 Pro Max'), ('iPhone 16 Pro', 25, '16 au 16 Pro Max'), ('iPhone 16 Pro Max', 26, '16 au 16 Pro Max'),
  ('iPhone 17', 27, '17 au 17 Pro Max'), ('iPhone 17 Air', 28, '17 au 17 Pro Max'), ('iPhone 17 Pro', 29, '17 au 17 Pro Max'), ('iPhone 17 Pro Max', 30, '17 au 17 Pro Max'),
  ('iPhone 18', 31, '18 au 18 Pro Max'), ('iPhone 18 Air', 32, '18 au 18 Pro Max'), ('iPhone 18 Pro', 33, '18 au 18 Pro Max'), ('iPhone 18 Pro Max', 34, '18 au 18 Pro Max')
) as model(name, sort_order, tier_label)
join public.price_tiers tier on tier.label = model.tier_label
on conflict (name) do update set sort_order = excluded.sort_order, price_tier_id = excluded.price_tier_id;

insert into public.categories (name, slug)
values ('Football', 'football'), ('Basketball', 'basketball'), ('Anime', 'anime'), ('Artistes', 'artistes'), ('Bracelets', 'bracelets'), ('Accessoires', 'accessoires')
on conflict (slug) do update set name = excluded.name;