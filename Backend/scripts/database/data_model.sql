--
-- PostgreSQL database dump
--

-- Dumped from database version 12.2 (Ubuntu 12.2-2.pgdg18.04+1)
-- Dumped by pg_dump version 12.2 (Ubuntu 12.2-2.pgdg18.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;



--
-- Name: company_news; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.company_news (
    id integer NOT NULL,
    isin character varying(255) NOT NULL,
    content jsonb,
    "timestamp" character varying(255)
);


ALTER TABLE public.company_news OWNER TO postgres;

--
-- Name: News_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public."News_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."News_id_seq" OWNER TO postgres;

--
-- Name: News_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public."News_id_seq" OWNED BY public.company_news.id;


--
-- Name: News_id_seq1; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public."News_id_seq1"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."News_id_seq1" OWNER TO postgres;

--
-- Name: News_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public."News_id_seq1" OWNED BY public."News".id;


--
-- Name: Sector; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public."Sector" (
    sector_id integer NOT NULL,
    sector_name character varying(255),
    parent_sector_id integer,
    insref character varying(255)
);


ALTER TABLE public."Sector" OWNER TO postgres;

--
-- Name: StockExchange; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public."StockExchange" (
    id character varying(255) NOT NULL,
    ticker character varying(255),
    name character varying(255),
    country character varying(2)
);


ALTER TABLE public."StockExchange" OWNER TO postgres;

--
-- Name: StockInsiderTrade; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public."StockInsiderTrade" (
    insider_trade_id integer NOT NULL,
    isin character varying(255),
    instrument_name character varying(255),
    person character varying(255),
    person_title character varying(255),
    volumne double precision,
    qty_or_amount character varying(10),
    price double precision,
    transaction_date date,
    transaction_currency character varying(3),
    transaction_nature character varying(100)
);


ALTER TABLE public."StockInsiderTrade" OWNER TO postgres;

--
-- Name: company_insider_trade; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.company_insider_trade (
    insider_trade_id integer NOT NULL,
    isin character varying(255),
    instrument_name character varying(255),
    person character varying(255),
    person_title character varying(255),
    volume double precision,
    qty_or_amount character varying(10),
    price double precision,
    transaction_date date,
    transaction_currency character varying(3),
    transaction_nature character varying(100)
);


ALTER TABLE public.company_insider_trade OWNER TO postgres;

--
-- Name: StockInsiderTrade_insider_trade_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public."StockInsiderTrade_insider_trade_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."StockInsiderTrade_insider_trade_id_seq" OWNER TO postgres;

--
-- Name: StockInsiderTrade_insider_trade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public."StockInsiderTrade_insider_trade_id_seq" OWNED BY public.company_insider_trade.insider_trade_id;


--
-- Name: StockInsiderTrade_insider_trade_id_seq1; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public."StockInsiderTrade_insider_trade_id_seq1"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."StockInsiderTrade_insider_trade_id_seq1" OWNER TO postgres;

--
-- Name: StockInsiderTrade_insider_trade_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public."StockInsiderTrade_insider_trade_id_seq1" OWNED BY public."StockInsiderTrade".insider_trade_id;


--
-- Name: StockReport; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public."StockReport" (
    id integer NOT NULL,
    isin character varying(255) NOT NULL,
    period character varying(255) NOT NULL,
    company character varying(255),
    ticker character varying(255),
    date_report character varying(255),
    type_report character varying(255),
    eps double precision,
    sales double precision,
    profit double precision,
    p_e double precision,
    p_s double precision,
    pdf_url character varying(255)
);


ALTER TABLE public."StockReport" OWNER TO postgres;

--
-- Name: StockReportPDF; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public."StockReportPDF" (
    id integer NOT NULL,
    isin character varying(255) NOT NULL,
    period character varying(255) NOT NULL,
    language character varying(2) NOT NULL,
    "UUID" character varying(255) NOT NULL,
    company character varying(255)
);


ALTER TABLE public."StockReportPDF" OWNER TO postgres;

--
-- Name: company_report_pdf; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.company_report_pdf (
    id integer NOT NULL,
    isin character varying(255) NOT NULL,
    period character varying(255) NOT NULL,
    language character varying(2) NOT NULL,
    uuid character varying(255) NOT NULL,
    company character varying(255),
    audio text
);


ALTER TABLE public.company_report_pdf OWNER TO postgres;

--
-- Name: StockReportPDF_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public."StockReportPDF_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."StockReportPDF_id_seq" OWNER TO postgres;

--
-- Name: StockReportPDF_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public."StockReportPDF_id_seq" OWNED BY public.company_report_pdf.id;


--
-- Name: StockReportPDF_id_seq1; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public."StockReportPDF_id_seq1"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."StockReportPDF_id_seq1" OWNER TO postgres;

--
-- Name: StockReportPDF_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public."StockReportPDF_id_seq1" OWNED BY public."StockReportPDF".id;


--
-- Name: StockReport_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."StockReport_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."StockReport_id_seq" OWNER TO postgres;

--
-- Name: StockReport_id_seq1; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public."StockReport_id_seq1"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."StockReport_id_seq1" OWNER TO postgres;

--
-- Name: StockReport_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public."StockReport_id_seq1" OWNED BY public."StockReport".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public."User" (
    user_id integer NOT NULL,
    email character varying(100),
    password character varying(100),
    type character varying(50),
    settings jsonb,
    account character varying(50),
    screen character varying(50),
    created_date date,
    last_login_date date
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: UserAward; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public."UserAward" (
    user_id integer NOT NULL,
    user_award_id integer NOT NULL,
    reason character varying(50),
    type character varying(4),
    date_awarded timestamp with time zone,
    date_expires timestamp with time zone
);


ALTER TABLE public."UserAward" OWNER TO trader;

--
-- Name: UserAward_user_award_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public."UserAward_user_award_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserAward_user_award_id_seq" OWNER TO postgres;

--
-- Name: UserAward_user_award_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public."UserAward_user_award_id_seq" OWNED BY public."UserAward".user_award_id;


--
-- Name: UserChartAnnotation; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public."UserChartAnnotation" (
    user_id integer NOT NULL,
    isin character varying(100) NOT NULL,
    content text
);


ALTER TABLE public."UserChartAnnotation" OWNER TO postgres;

--
-- Name: UserFriend; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public."UserFriend" (
    id integer NOT NULL,
    user_id integer,
    status character varying(255),
    friend_email character varying(255),
    last_update_date date
);


ALTER TABLE public."UserFriend" OWNER TO postgres;

--
-- Name: UserFriend_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public."UserFriend_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserFriend_id_seq" OWNER TO postgres;

--
-- Name: UserFriend_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public."UserFriend_id_seq" OWNED BY public."UserFriend".id;


--
-- Name: UserResearch; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public."UserResearch" (
    user_id integer NOT NULL,
    isin character varying(100) NOT NULL,
    ticker character varying(100),
    content text,
    last_update_date timestamp with time zone,
    is_shared boolean
);


ALTER TABLE public."UserResearch" OWNER TO postgres;

--
-- Name: UserTrade; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public."UserTrade" (
    user_id integer NOT NULL,
    user_trade_id integer NOT NULL,
    isin character varying(255),
    ticker character varying(7),
    entry_date date,
    entry_price double precision,
    entry_qty integer,
    status character varying(7),
    exit_date date,
    exit_price double precision,
    exit_qty integer,
    commission double precision,
    pl double precision,
    pl_pct double precision,
    notes text
);


ALTER TABLE public."UserTrade" OWNER TO postgres;

--
-- Name: UserTradeTransaction; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public."UserTradeTransaction" (
    user_id integer NOT NULL,
    user_trade_id integer NOT NULL,
    isin character varying(255),
    ticker character varying(7),
    buy_sell character varying(1),
    trade_date date,
    trade_price double precision,
    trade_qty integer,
    commission double precision,
    transaction_id character varying(20),
    notes character varying(300)
);


ALTER TABLE public."UserTradeTransaction" OWNER TO postgres;

--
-- Name: UserTradeTransaction_user_trade_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public."UserTradeTransaction_user_trade_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserTradeTransaction_user_trade_id_seq" OWNER TO postgres;

--
-- Name: UserTradeTransaction_user_trade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public."UserTradeTransaction_user_trade_id_seq" OWNED BY public."UserTradeTransaction".user_trade_id;


--
-- Name: UserTrade_user_trade_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public."UserTrade_user_trade_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserTrade_user_trade_id_seq" OWNER TO postgres;

--
-- Name: UserTrade_user_trade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public."UserTrade_user_trade_id_seq" OWNED BY public."UserTrade".user_trade_id;


--
-- Name: UserWatchlist; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public."UserWatchlist" (
    user_id integer NOT NULL,
    watchlist_id integer NOT NULL,
    name character varying(50),
    type character varying(7)
);


ALTER TABLE public."UserWatchlist" OWNER TO postgres;

--
-- Name: UserWatchlistItem; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public."UserWatchlistItem" (
    isin character varying(255) NOT NULL,
    user_id integer NOT NULL,
    watchlist_id integer NOT NULL,
    ticker character varying(20),
    name character varying(30),
    conviction integer,
    plan_entry_price double precision,
    plan_stoploss_price double precision,
    plan_target_price double precision,
    watched_since date,
    watched_since_price double precision,
    watchlist_item_id integer NOT NULL,
    tags text
);


ALTER TABLE public."UserWatchlistItem" OWNER TO postgres;

--
-- Name: UserWatchlistItem_watchlist_item_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public."UserWatchlistItem_watchlist_item_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserWatchlistItem_watchlist_item_id_seq" OWNER TO postgres;

--
-- Name: UserWatchlistItem_watchlist_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public."UserWatchlistItem_watchlist_item_id_seq" OWNED BY public."UserWatchlistItem".watchlist_item_id;


--
-- Name: user_watchlist; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.user_watchlist (
    user_id integer NOT NULL,
    watchlist_id integer NOT NULL,
    name character varying(50),
    type character varying(7)
);


ALTER TABLE public.user_watchlist OWNER TO postgres;

--
-- Name: UserWatchlist_watchlist_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public."UserWatchlist_watchlist_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserWatchlist_watchlist_id_seq" OWNER TO postgres;

--
-- Name: UserWatchlist_watchlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public."UserWatchlist_watchlist_id_seq" OWNED BY public.user_watchlist.watchlist_id;


--
-- Name: UserWatchlist_watchlist_id_seq1; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public."UserWatchlist_watchlist_id_seq1"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserWatchlist_watchlist_id_seq1" OWNER TO postgres;

--
-- Name: UserWatchlist_watchlist_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public."UserWatchlist_watchlist_id_seq1" OWNED BY public."UserWatchlist".watchlist_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(100),
    password character varying(100),
    type character varying(50),
    settings jsonb,
    account character varying(50),
    screen text,
    created_date date,
    last_login_date date,
    membership_year boolean,
    membership_date date,
    subscription_id character varying(100),
    tabs jsonb
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: User_user_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public."User_user_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_user_id_seq" OWNER TO postgres;

--
-- Name: User_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public."User_user_id_seq" OWNED BY public.users.user_id;


--
-- Name: User_user_id_seq1; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public."User_user_id_seq1"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_user_id_seq1" OWNER TO postgres;

--
-- Name: User_user_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public."User_user_id_seq1" OWNED BY public."User".user_id;


--
-- Name: company; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.company (
    isin character varying(255),
    name character varying(255),
    description text,
    company character varying(255),
    market_cap bigint,
    most_relevant_earnings_date date,
    most_relevant_eps double precision,
    most_relevant_sales double precision,
    p_e double precision,
    ceo_comments text
);


ALTER TABLE public.company OWNER TO postgres;

--
-- Name: company_calendar; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.company_calendar (
    id integer NOT NULL,
    isin character varying(255),
    period character varying(255),
    company character varying(255),
    date_report date,
    type_report integer
);


ALTER TABLE public.company_calendar OWNER TO postgres;

--
-- Name: company_calendar_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public.company_calendar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_calendar_id_seq OWNER TO postgres;

--
-- Name: company_calendar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public.company_calendar_id_seq OWNED BY public.company_calendar.id;


--
-- Name: company_report; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.company_report (
    id integer DEFAULT nextval('public."StockReport_id_seq"'::regclass) NOT NULL,
    isin character varying(255) NOT NULL,
    period character varying(255) NOT NULL,
    company character varying(255),
    date_report date,
    type_report character varying(255),
    eps double precision,
    sales double precision,
    profit double precision,
    p_e double precision,
    p_s double precision,
    gp bigint,
    ebitda bigint,
    ebit bigint,
    ptp bigint,
    intangibleasset bigint,
    fixedasset bigint,
    financialasset bigint,
    noncurrentasset bigint,
    cce bigint,
    currentassets bigint,
    totalassets bigint,
    shequity bigint,
    ltliabilities bigint,
    curliabilities bigint,
    totalnumberofshares bigint,
    costofgoodssold bigint,
    totalliabilities bigint,
    totalequityandliabilities bigint,
    currency character varying(3),
    price double precision,
    ibl double precision
);


ALTER TABLE public.company_report OWNER TO postgres;

--
-- Name: company_trigger; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.company_trigger (
    id integer NOT NULL,
    isin character varying(20),
    date_created date,
    date_range character varying(30),
    date_from date,
    date_to date,
    headline character varying(50),
    description text,
    source character varying(30),
    market character varying(30),
    tinyurl character varying(30)
);


ALTER TABLE public.company_trigger OWNER TO postgres;

--
-- Name: company_trigger_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public.company_trigger_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_trigger_id_seq OWNER TO postgres;

--
-- Name: company_trigger_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public.company_trigger_id_seq OWNED BY public.company_trigger.id;


--
-- Name: contact; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.contact (
    contact_id integer NOT NULL,
    name character varying(50),
    user_id character varying(50),
    email character varying(100)
);


ALTER TABLE public.contact OWNER TO postgres;

--
-- Name: stock; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.stock (
    isin character varying(255) NOT NULL,
    ticker character varying(255),
    insref double precision NOT NULL,
    sector_id integer,
    currency_trade character varying(255),
    stock_exchange_id character varying(255),
    price_today double precision,
    name character varying(50)
);


ALTER TABLE public.stock OWNER TO postgres;

--
-- Name: stock_exchange; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.stock_exchange (
    id character varying(255) NOT NULL,
    handle character varying(255),
    name character varying(255),
    country character varying(2)
);


ALTER TABLE public.stock_exchange OWNER TO postgres;

--
-- Name: stock_exchange_sector; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.stock_exchange_sector (
    sector_id integer NOT NULL,
    sector_name character varying(255),
    parent_sector_id integer,
    insref character varying(255)
);


ALTER TABLE public.stock_exchange_sector OWNER TO postgres;

--
-- Name: testtest; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.testtest (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(50) NOT NULL
);


ALTER TABLE public.testtest OWNER TO postgres;

--
-- Name: testtest_user_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public.testtest_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.testtest_user_id_seq OWNER TO postgres;

--
-- Name: testtest_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public.testtest_user_id_seq OWNED BY public.testtest.user_id;


--
-- Name: user_chart_lines; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.user_chart_lines (
    id integer NOT NULL,
    user_id integer,
    insref integer,
    content text
);


ALTER TABLE public.user_chart_lines OWNER TO postgres;

--
-- Name: user_chart_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public.user_chart_lines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_chart_lines_id_seq OWNER TO postgres;

--
-- Name: user_chart_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public.user_chart_lines_id_seq OWNED BY public.user_chart_lines.id;


--
-- Name: user_diary_item; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.user_diary_item (
    diary_item_id integer NOT NULL,
    user_id integer,
    insref integer,
    date_created date,
    note character varying(160),
    background character(10),
    color character(10),
    y integer
);


ALTER TABLE public.user_diary_item OWNER TO postgres;

--
-- Name: user_diary_item_diary_item_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public.user_diary_item_diary_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_diary_item_diary_item_id_seq OWNER TO postgres;

--
-- Name: user_diary_item_diary_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public.user_diary_item_diary_item_id_seq OWNED BY public.user_diary_item.diary_item_id;


--
-- Name: user_friend; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.user_friend (
    user_id integer NOT NULL,
    friend_id integer NOT NULL,
    status character varying(255)
);


ALTER TABLE public.user_friend OWNER TO postgres;

--
-- Name: user_research; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.user_research (
    user_id integer,
    insref double precision,
    ticker character varying(100),
    content text,
    last_update_date timestamp with time zone,
    is_shared boolean
);


ALTER TABLE public.user_research OWNER TO postgres;

--
-- Name: user_screen; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.user_screen (
    screen_id integer NOT NULL,
    user_id integer,
    name character varying(160),
    filter text,
    date_updated date,
    known_items character varying(20)[]
);


ALTER TABLE public.user_screen OWNER TO postgres;

--
-- Name: user_screen_screen_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public.user_screen_screen_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_screen_screen_id_seq OWNER TO postgres;

--
-- Name: user_screen_screen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public.user_screen_screen_id_seq OWNED BY public.user_screen.screen_id;


--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.user_settings (
    id integer NOT NULL,
    user_id integer,
    feature character varying(20),
    content text
);


ALTER TABLE public.user_settings OWNER TO postgres;

--
-- Name: user_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public.user_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_settings_id_seq OWNER TO postgres;

--
-- Name: user_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public.user_settings_id_seq OWNED BY public.user_settings.id;


--
-- Name: user_trade; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.user_trade (
    trade_id integer NOT NULL,
    user_id integer,
    insref integer,
    ticker character varying(10),
    instrument_type character varying(10),
    entry_price double precision,
    entry_date date,
    entry_qty double precision,
    exit_price double precision,
    exit_date date,
    exit_qty double precision,
    commission double precision,
    pnl double precision,
    notes text
);


ALTER TABLE public.user_trade OWNER TO postgres;

--
-- Name: user_trade_plan; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.user_trade_plan (
    trade_plan_id integer NOT NULL,
    user_id integer,
    insref integer,
    entry_price double precision,
    stoploss_price double precision,
    target_price double precision,
    entry_date numeric,
    exit_date numeric,
    long boolean,
    entry_alert_status character varying(10),
    stoploss_alert_status character varying(10),
    target_alert_status character varying(10)
);


ALTER TABLE public.user_trade_plan OWNER TO postgres;

--
-- Name: user_trade_plan_trade_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public.user_trade_plan_trade_plan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_trade_plan_trade_plan_id_seq OWNER TO postgres;

--
-- Name: user_trade_plan_trade_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public.user_trade_plan_trade_plan_id_seq OWNED BY public.user_trade_plan.trade_plan_id;


--
-- Name: user_trade_trade_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public.user_trade_trade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_trade_trade_id_seq OWNER TO postgres;

--
-- Name: user_trade_trade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public.user_trade_trade_id_seq OWNED BY public.user_trade.trade_id;


--
-- Name: user_tx; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.user_tx (
    tx_id integer NOT NULL,
    user_id integer,
    account character varying(10),
    tx_date date,
    tx_type text,
    isin character varying(20),
    description text,
    qty double precision,
    price double precision,
    amount double precision,
    commission double precision,
    currency character varying(3),
    exchange_rate double precision
);


ALTER TABLE public.user_tx OWNER TO postgres;

--
-- Name: user_tx_tx_id_seq; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public.user_tx_tx_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_tx_tx_id_seq OWNER TO postgres;

--
-- Name: user_tx_tx_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: trader
--

ALTER SEQUENCE public.user_tx_tx_id_seq OWNED BY public.user_tx.tx_id;


--
-- Name: user_watchlist_item_watchlist_item_id; Type: SEQUENCE; Schema: public; Owner: trader
--

CREATE SEQUENCE public.user_watchlist_item_watchlist_item_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_watchlist_item_watchlist_item_id OWNER TO postgres;

--
-- Name: user_watchlist_item; Type: TABLE; Schema: public; Owner: trader
--

CREATE TABLE public.user_watchlist_item (
    watchlist_item_id integer DEFAULT nextval('public.user_watchlist_item_watchlist_item_id'::regclass) NOT NULL,
    user_id integer,
    insref double precision,
    watchlist_id integer,
    ticker character varying(20),
    name character varying(255),
    isin character varying(255),
    conviction integer,
    plan_entry_price double precision,
    plan_stoploss_price double precision,
    plan_target_price double precision,
    watched_since date,
    watched_since_price double precision,
    tags text
);


ALTER TABLE public.user_watchlist_item OWNER TO postgres;

--
-- Name: News id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public."News" ALTER COLUMN id SET DEFAULT nextval('public."News_id_seq1"'::regclass);


--
-- Name: StockInsiderTrade insider_trade_id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public."StockInsiderTrade" ALTER COLUMN insider_trade_id SET DEFAULT nextval('public."StockInsiderTrade_insider_trade_id_seq1"'::regclass);


--
-- Name: StockReport id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public."StockReport" ALTER COLUMN id SET DEFAULT nextval('public."StockReport_id_seq1"'::regclass);


--
-- Name: StockReportPDF id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public."StockReportPDF" ALTER COLUMN id SET DEFAULT nextval('public."StockReportPDF_id_seq1"'::regclass);


--
-- Name: User user_id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public."User" ALTER COLUMN user_id SET DEFAULT nextval('public."User_user_id_seq1"'::regclass);


--
-- Name: UserAward user_award_id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public."UserAward" ALTER COLUMN user_award_id SET DEFAULT nextval('public."UserAward_user_award_id_seq"'::regclass);


--
-- Name: UserFriend id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public."UserFriend" ALTER COLUMN id SET DEFAULT nextval('public."UserFriend_id_seq"'::regclass);


--
-- Name: UserTrade user_trade_id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public."UserTrade" ALTER COLUMN user_trade_id SET DEFAULT nextval('public."UserTrade_user_trade_id_seq"'::regclass);


--
-- Name: UserTradeTransaction user_trade_id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public."UserTradeTransaction" ALTER COLUMN user_trade_id SET DEFAULT nextval('public."UserTradeTransaction_user_trade_id_seq"'::regclass);


--
-- Name: UserWatchlist watchlist_id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public."UserWatchlist" ALTER COLUMN watchlist_id SET DEFAULT nextval('public."UserWatchlist_watchlist_id_seq1"'::regclass);


--
-- Name: UserWatchlistItem watchlist_item_id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public."UserWatchlistItem" ALTER COLUMN watchlist_item_id SET DEFAULT nextval('public."UserWatchlistItem_watchlist_item_id_seq"'::regclass);


--
-- Name: company_calendar id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public.company_calendar ALTER COLUMN id SET DEFAULT nextval('public.company_calendar_id_seq'::regclass);


--
-- Name: company_insider_trade insider_trade_id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public.company_insider_trade ALTER COLUMN insider_trade_id SET DEFAULT nextval('public."StockInsiderTrade_insider_trade_id_seq"'::regclass);


--
-- Name: company_news id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public.company_news ALTER COLUMN id SET DEFAULT nextval('public."News_id_seq"'::regclass);


--
-- Name: company_report_pdf id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public.company_report_pdf ALTER COLUMN id SET DEFAULT nextval('public."StockReportPDF_id_seq"'::regclass);


--
-- Name: company_trigger id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public.company_trigger ALTER COLUMN id SET DEFAULT nextval('public.company_trigger_id_seq'::regclass);


--
-- Name: testtest user_id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public.testtest ALTER COLUMN user_id SET DEFAULT nextval('public.testtest_user_id_seq'::regclass);


--
-- Name: user_chart_lines id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public.user_chart_lines ALTER COLUMN id SET DEFAULT nextval('public.user_chart_lines_id_seq'::regclass);


--
-- Name: user_diary_item diary_item_id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public.user_diary_item ALTER COLUMN diary_item_id SET DEFAULT nextval('public.user_diary_item_diary_item_id_seq'::regclass);


--
-- Name: user_screen screen_id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public.user_screen ALTER COLUMN screen_id SET DEFAULT nextval('public.user_screen_screen_id_seq'::regclass);


--
-- Name: user_settings id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public.user_settings ALTER COLUMN id SET DEFAULT nextval('public.user_settings_id_seq'::regclass);


--
-- Name: user_trade trade_id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public.user_trade ALTER COLUMN trade_id SET DEFAULT nextval('public.user_trade_trade_id_seq'::regclass);


--
-- Name: user_trade_plan trade_plan_id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public.user_trade_plan ALTER COLUMN trade_plan_id SET DEFAULT nextval('public.user_trade_plan_trade_plan_id_seq'::regclass);


--
-- Name: user_tx tx_id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public.user_tx ALTER COLUMN tx_id SET DEFAULT nextval('public.user_tx_tx_id_seq'::regclass);


--
-- Name: user_watchlist watchlist_id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public.user_watchlist ALTER COLUMN watchlist_id SET DEFAULT nextval('public."UserWatchlist_watchlist_id_seq"'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: trader
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public."User_user_id_seq"'::regclass);

