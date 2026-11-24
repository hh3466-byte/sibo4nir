-- הסתרת מסלול השבוע הקודם (מנאוסה, ללא מחיקה) כדי שמסלול השבוע מלבריון יהיה הפעיל.
update public.routes set hidden = true where id in ('cyclades-heart-2d', 'cyclades-heart-7d');
