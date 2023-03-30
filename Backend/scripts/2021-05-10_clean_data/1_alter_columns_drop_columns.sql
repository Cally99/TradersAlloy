/**
        Andrew Boddy
        2021-05-04

Radical redesign of data model, especially around these columns:
    ISIN . . . . . . . was primary key to company ... this was a mistake
    company_id . . . . was company or company_ref
    stock_id . . . . . was insref (Millistream generated) , ISIN is an alternate key.

*/
-- COMPANY
alter table company	add column company_id integer;

update company set company_id = CAST (company as INTEGER);


-- STOCK
alter table stock add column company_id INTEGER;
alter table stock rename column insref to stock_id;

UPDATE  stock A
SET     company_id = B.company_id
FROM    company B
WHERE   A.isin = B.isin;


--COMPANY CALENDAR
alter table company_calendar add column company_id integer;

update company_calendar set company_id = CAST (company as INTEGER);



-- COMPANY INSIDER TRADE  ==> STOCK_INSIDER_TRADE
alter table company_insider_trade add column stock_id integer;

UPDATE  company_insider_trade A
SET     stock_id = B.stock_id
FROM    stock B
WHERE   A.isin = B.isin;

/*
 20,000 rows do not have an ISIN ---> company relationship
 or ISIN provided is not available on Millistream...
 maybe guess with the name...
 either way we match by STOCK not company but should merge (display) by company?
*/

-- COMPANY NEWS ===> STOCK NEWS
alter table company_news add column stock_id integer;

update company_news A
set stock_id = B.stock_id
FROM stock B
where A.isin = B.isin;

alter table company_news rename to stock_news;
alter table company_insider_trade rename to stock_insider_trade;



--COMPANY REPORT
alter table company_report add column company_id integer;

update company_report set company_id = CAST (company as INTEGER);

alter table company_report add column pdf_link varchar(255);
alter table company_report add column pdf_language char(2);

update company_report A
set 	pdf_link = B.uuid,
		pdf_language = B.language
FROM  company_report_pdf B
where A.isin = B.isin
and   A.period = B.period
and   A.company_id = CAST(B.company AS integer);



-- Remove duplicates (stocks appearing as companies)
-- delete 'lesser rows'
delete from company A
USING company B
WHERE A.company_id = B.company_id
and   A.isin < B.isin;


select *
from company
where company_id in (
		select company_id
		from company
		group by company_id
		having count(*) > 1
	)
order by name;
-- return 149 rows


---------------------------------------------------------------------------------------------------------------------
-- remove subfixes from the name A B C D R 1 2  Pref PREF ser.
update company
set name = substring(name, 0, POSITION(' A' in name) )
where name ~ ' A$';

update company
set name = substring(name, 0, POSITION(' B' in name) )
where name ~ ' B$';

update company
set name = substring(name, 0, POSITION(' C' in name) )
where name ~ ' C$';

update company
set name = substring(name, 0, POSITION(' D' in name) )
where name ~ ' D$';

update company
set name = substring(name, 0, POSITION(' R' in name) )
where name ~ ' R$';

update company
set name = substring(name, 0, POSITION(' 1' in name) )
where name ~ ' 1$';

update company
set name = substring(name, 0, POSITION(' 2' in name) )
where name ~ ' 2$';

update company
set name = substring(name, 0, POSITION(' Pref' in name) )
where name ~ ' Pref$';

update company
set name = substring(name, 0, POSITION(' PREF' in name) )
where name ~ ' PREF$';

alter table stock_exchange drop column city_code;
--  Stock Exchange Update for TEST and PROD

/* Yo might have already run this */
alter table stock_exchange add column city char(2);
update stock_exchange set city = 'ST' where country ='SE';
update stock_exchange set city = 'HE' where country ='FI';
update stock_exchange set city = 'CO' where country ='DK';
update stock_exchange set city = 'OL' where country ='NO';

insert into stock_exchange values ('4680264', 'NGM','Nordic SME','SE','ST');


--- CLEAN UP !
alter table company
	drop column isin,
	drop column company;

alter table company_calendar
	drop column isin,
	drop column company;

/*alter table company_insider_trade
	drop column instrument_name;*/

alter table company_report
	drop column isin,
	drop column company;

alter table company rename column p_e to pe;
alter table company_report rename column p_e to pe;
alter table company_report rename column p_s to ps;

/// CONNECTION BROKE ...




DROP TABLE company_report_pdf;


-- old tables to be deleted ----------------
DROP TABLE "contact";
DROP TABLE "company_trigger";
DROP TABLE "Equity";
DROP TABLE "EquityFin";
DROP TABLE "News";
DROP TABLE "Sector";
DROP TABLE "StockExchange";
DROP TABLE "StockInsiderTrade";
DROP TABLE "StockReport";
DROP TABLE "StockReportPDF";
DROP TABLE "testtest";
DROP TABLE "User" CASCADE;
DROP TABLE "UserAward";
DROP TABLE "UserChartAnnotation";
DROP TABLE "UserFriend";
DROP TABLE "UserResearch";
DROP TABLE "UserTrade";
DROP TABLE "UserTradeTransaction";
DROP TABLE "UserWatchlist";
DROP TABLE "UserWatchlistItem";


--
alter table user_chart_lines rename column insref to stock_id;

--
alter table user_diary_item  rename column insref to stock_id;

--
alter table user_research  rename column insref to stock_id;

--
alter table user_trade  rename column insref to stock_id;

--
alter table user_trade_plan  rename column insref to stock_id;

--
alter table user_tx  add column stock_id INTEGER;

update user_tx A
set stock_id = B.stock_id
FROM stock B
where A.isin = B.isin;

--
alter table user_watchlist_item rename column insref to stock_id;

alter table user_watchlist_item rename column insref to stock_id;

alter table company rename column most_relevant_earnings_date to last_report_date;
alter table company rename column most_relevant_eps to last_eps_ttm;
alter table company rename column most_relevant_sales to last_sales;
alter table company add column last_pe integer;



-- Watchlist Item additions and clean up
ALTER TABLE user_watchlist_item ADD column company_id integer;

ALTER TABLE user_watchlist_item
		DROP column plan_entry_price,
        DROP column plan_stoploss_price,
        DROP column plan_target_price;

update user_watchlist_item A
set company_id = B.company_id
FROM stock B
where A.isin = B.isin;


alter table stock add column primary_listing boolean;

alter table company_insider_trade rename to stock_insider_trade;

alter table stock_insider_trade   add column company_id INTEGER;


update stock_insider_trade A
set company_id = B.company_id
FROM stock B
where A.isin = B.isin;

-- add ilb to company_report --
ALTER TABLE company_report
ADD column ibl double precision;

-- Finally ask Millistream what the Norwegian ticker  '____o' suffix is
