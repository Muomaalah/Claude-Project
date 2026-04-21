-- Optional sample data. Run AFTER schema.sql, and AFTER you have signed in at
-- least once so a profile exists (or create the profile row manually).
-- Safe to re-run: uses ON CONFLICT DO NOTHING.

insert into public.applications (
  id, company, md, email, phone, postal, office, office_manned,
  warehouse, warehouse_desc, licence_type, app_type, status, fee
) values
  ('APP-2026-0018', 'Accra Plumbing Works Ltd', 'Kwame Boateng',
   'info@accraplumbing.com.gh', '+233 30 277 4421', 'P.O. Box AN 4421, Accra-North',
   '12 Farrar Avenue, Adabraka, Accra', 'Yes',
   'North Industrial Area, near Achimota',
   '600 sqm covered storage, pipe rack system, loading bay, office',
   'Plumbing Contractor', 'New', 'DRAFT', 250),

  ('APP-2026-0017', 'Takoradi Waterworks Co.', 'Akosua Nyarko',
   'admin@takoradiwaterworks.gh', '+233 31 202 3311', 'P.O. Box 221, Takoradi',
   'Plot 17 Harbour Road, Takoradi', 'Yes',
   'Effia-Kuma yard, Takoradi',
   'Open yard 400 sqm with secure fencing, covered shed',
   'Master Plumber', 'New', 'PENDING_APPROVAL', 250),

  ('APP-2026-0015', 'Tamale Pipe Services', 'Mohammed Abubakari',
   'tamalepipe@gmail.com', '+233 37 202 1144', 'P.O. Box TL 318, Tamale',
   'Education Ridge, Tamale', 'Yes',
   'Lamashegu Industrial Lot',
   'Walled compound 300 sqm, metal shed 120 sqm',
   'Plumbing Contractor', 'New', 'TOKEN_ISSUED', 250),

  ('APP-2025-0112', 'Cape Coast Hydraulics Ltd', 'Efua Annan',
   'hq@capecoasthydraulics.gh', '+233 33 213 5501', 'P.O. Box CC 219, Cape Coast',
   'University Rd, Cape Coast', 'Yes',
   'Abura industrial zone', 'Covered workshop 350 sqm',
   'Plumbing Contractor', 'New', 'REGISTERED', 250),

  ('APP-2025-0089', 'Greater Accra Waterworks Ltd', 'Kwabena Sarpong',
   'admin@gawworks.gh', '+233 30 277 9911', 'P.O. Box AN 9911, Accra',
   'Kwame Nkrumah Ave, Accra', 'Yes',
   'Spintex Rd warehouse',
   '1200 sqm enclosed, 2 loading docks, admin annex',
   'Master Plumber', 'New', 'REGISTERED', 250)
on conflict (id) do nothing;

-- Registered-row specifics for the two REGISTERED apps above
update public.applications
set grade = 'B', reg_no = 'GWCL/PLB/2025/0112',
    registration_date = now() - interval '320 days',
    expiry_date       = now() + interval '45 days',
    checklist_required = array[0,1,2,3,4,5,6,7,8,9],
    checklist_optional = array[0,3,5,7]
where id = 'APP-2025-0112';

update public.applications
set grade = 'A', reg_no = 'GWCL/PLB/2025/0089',
    registration_date = now() - interval '210 days',
    expiry_date       = now() + interval '155 days',
    checklist_required = array[0,1,2,3,4,5,6,7,8,9],
    checklist_optional = array[0,1,2,3,4,5,6,7]
where id = 'APP-2025-0089';
