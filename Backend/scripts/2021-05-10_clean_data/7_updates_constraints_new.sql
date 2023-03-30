

 -- PROD
 alter table company_report
    alter column ebit type DOUBLE PRECISION,
    alter column ptp type DOUBLE PRECISION,
    alter column totalnumberofshares type DOUBLE PRECISION,
    alter column gp type DOUBLE PRECISION,
    alter column costofgoodssold type DOUBLE PRECISION,
    alter column ebitda type DOUBLE PRECISION,
    alter column intangibleasset type DOUBLE PRECISION,
    alter column fixedasset type DOUBLE PRECISION,
    alter column financialasset type DOUBLE PRECISION,
    alter column noncurrentasset type DOUBLE PRECISION,
    alter column cce type DOUBLE PRECISION,
    alter column currentassets type DOUBLE PRECISION,
    alter column totalassets type DOUBLE PRECISION,
    alter column shequity type DOUBLE PRECISION,
    alter column ltliabilities type DOUBLE PRECISION,
    alter column curliabilities type DOUBLE PRECISION,
    alter column totalliabilities type DOUBLE PRECISION,
    alter column totalequityandliabilities type DOUBLE PRECISION;





--  PROD

-- load the fresh data
DELETE FROM company_report a
       USING company_report b
WHERE  a.ctid < b.ctid
AND    a.company_id = b.company_id
AND    a.period = b.period;

drop index company_calendar_idx2;
CREATE UNIQUE INDEX CONCURRENTLY company_calendar_idx2 ON company_calendar (company_id, period);
alter table company_calendar add constraint company_calender_pk UNIQUE USING INDEX company_calendar_idx2;



-- load the fresh data
DELETE FROM company_calendar a
       USING company_calendar b
WHERE  a.ctid < b.ctid
AND    a.company_id = b.company_id
AND    a.period = b.period;


drop index company_report_idx2;
CREATE UNIQUE INDEX CONCURRENTLY company_report_idx2 ON company_report (company_id, period);
alter table company_report add constraint company_report_pk UNIQUE USING INDEX company_report_idx2;



--   PROD
UPDATE users
SET  tabs = '[5664, 42953, 772]';


UPDATE stock_insider_trade A
SET     company_id = B.company_id,
        stock_id = B.stock_id
FROM stock B
WHERE B.isin = A.isin;


alter table company add column next_report_date date;
alter table company add column status_flag varchar;

alter table stock add column price_updated date;
alter table stock add column status_flag  varchar;



