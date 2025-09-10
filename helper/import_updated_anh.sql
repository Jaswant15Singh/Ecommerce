--
-- PostgreSQL database dump
--

-- Dumped from database version 10.23
-- Dumped by pg_dump version 10.23

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

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: admin_def; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_def (
    id integer NOT NULL,
    user_name character varying,
    password character varying,
    email character varying,
    phone_no character varying,
    address character varying,
    pincode character varying
);


ALTER TABLE public.admin_def OWNER TO postgres;

--
-- Name: blogs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blogs (
    id integer NOT NULL,
    blog_image character varying,
    blog_header character varying,
    blog_content character varying,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    blog_visibility boolean DEFAULT true,
    updated_date timestamp without time zone
);


ALTER TABLE public.blogs OWNER TO postgres;

--
-- Name: blogs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blogs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.blogs_id_seq OWNER TO postgres;

--
-- Name: blogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blogs_id_seq OWNED BY public.blogs.id;


--
-- Name: brand_def; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brand_def (
    id integer NOT NULL,
    brand_name character varying,
    brand_image character varying,
    inserted_date timestamp without time zone,
    inserted_by integer,
    updated_date timestamp without time zone,
    updated_by integer,
    visibility boolean DEFAULT true
);


ALTER TABLE public.brand_def OWNER TO postgres;

--
-- Name: brand_def_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.brand_def_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.brand_def_id_seq OWNER TO postgres;

--
-- Name: brand_def_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.brand_def_id_seq OWNED BY public.brand_def.id;


--
-- Name: category_def; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category_def (
    id integer NOT NULL,
    category_name character varying,
    category_image character varying,
    inserted_by integer DEFAULT 1,
    inserted_date timestamp without time zone,
    updated_by integer,
    updated_date timestamp without time zone,
    visibility boolean DEFAULT false
);


ALTER TABLE public.category_def OWNER TO postgres;

--
-- Name: category_def_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.category_def_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.category_def_id_seq OWNER TO postgres;

--
-- Name: category_def_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.category_def_id_seq OWNED BY public.category_def.id;


--
-- Name: category_def_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category_def_log (
    id integer NOT NULL,
    category_def_id integer,
    category_name character varying,
    category_image character varying,
    inserted_by integer,
    inserted_date timestamp without time zone,
    updated_by integer,
    updated_date timestamp without time zone,
    visibility boolean DEFAULT true
);


ALTER TABLE public.category_def_log OWNER TO postgres;

--
-- Name: category_def_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.category_def_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.category_def_log_id_seq OWNER TO postgres;

--
-- Name: category_def_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.category_def_log_id_seq OWNED BY public.category_def_log.id;


--
-- Name: customer_def; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_def (
    id integer NOT NULL,
    customer_name character varying,
    customer_email character varying,
    customer_contact character varying,
    customer_address character varying,
    customer_pincode character varying,
    customer_city character varying,
    customer_state character varying
);


ALTER TABLE public.customer_def OWNER TO postgres;

--
-- Name: customer_def_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_def_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customer_def_id_seq OWNER TO postgres;

--
-- Name: customer_def_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_def_id_seq OWNED BY public.customer_def.id;


--
-- Name: customer_def_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_def_log (
    id integer NOT NULL,
    customer_name character varying,
    customer_email character varying,
    customer_contact character varying,
    customer_address character varying,
    customer_pincode character varying,
    customer_city character varying,
    customer_state character varying,
    inserted_date timestamp without time zone
);


ALTER TABLE public.customer_def_log OWNER TO postgres;

--
-- Name: customer_def_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_def_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customer_def_log_id_seq OWNER TO postgres;

--
-- Name: customer_def_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_def_log_id_seq OWNED BY public.customer_def_log.id;


--
-- Name: customer_review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_review (
    id integer NOT NULL,
    rating integer,
    review character varying,
    visiblity boolean DEFAULT true,
    inserted_date timestamp without time zone,
    updated_date timestamp without time zone,
    customer_review_name character varying
);


ALTER TABLE public.customer_review OWNER TO postgres;

--
-- Name: customer_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customer_review_id_seq OWNER TO postgres;

--
-- Name: customer_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_review_id_seq OWNED BY public.customer_review.id;


--
-- Name: customer_service_def; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_service_def (
    id integer NOT NULL,
    customer_contact character varying(10),
    customer_email character varying,
    customer_name character varying,
    customer_query character varying,
    inserted_date timestamp without time zone
);


ALTER TABLE public.customer_service_def OWNER TO postgres;

--
-- Name: customer_service_def_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_service_def_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customer_service_def_id_seq OWNER TO postgres;

--
-- Name: customer_service_def_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_service_def_id_seq OWNED BY public.customer_service_def.id;


--
-- Name: deleivery_def; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deleivery_def (
    id integer NOT NULL,
    deleivery_status character varying(50) DEFAULT 'PENDING'::character varying,
    updated_by integer DEFAULT 1,
    updated_date timestamp without time zone,
    order_id integer
);


ALTER TABLE public.deleivery_def OWNER TO postgres;

--
-- Name: deleivery_def_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.deleivery_def_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.deleivery_def_id_seq OWNER TO postgres;

--
-- Name: deleivery_def_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.deleivery_def_id_seq OWNED BY public.deleivery_def.id;


--
-- Name: deleted_product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deleted_product (
    id integer NOT NULL,
    product_id integer,
    update_date timestamp without time zone
);


ALTER TABLE public.deleted_product OWNER TO postgres;

--
-- Name: deleted_product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.deleted_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.deleted_product_id_seq OWNER TO postgres;

--
-- Name: deleted_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.deleted_product_id_seq OWNED BY public.deleted_product.id;


--
-- Name: email_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_log (
    id integer NOT NULL,
    customer_email character varying,
    subject character varying,
    send_date timestamp without time zone
);


ALTER TABLE public.email_log OWNER TO postgres;

--
-- Name: email_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.email_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.email_log_id_seq OWNER TO postgres;

--
-- Name: email_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.email_log_id_seq OWNED BY public.email_log.id;


--
-- Name: flavour_def; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flavour_def (
    id integer NOT NULL,
    flavour_name character varying,
    created_date timestamp without time zone,
    updated_date timestamp without time zone
);


ALTER TABLE public.flavour_def OWNER TO postgres;

--
-- Name: flavour_def_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.flavour_def_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.flavour_def_id_seq OWNER TO postgres;

--
-- Name: flavour_def_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.flavour_def_id_seq OWNED BY public.flavour_def.id;


--
-- Name: inventory_def; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_def (
    id integer NOT NULL,
    product_id integer,
    batch_id integer,
    in_stock numeric,
    inserted_by character varying,
    updated_by character varying,
    inserted_date timestamp without time zone,
    updated_date timestamp without time zone
);


ALTER TABLE public.inventory_def OWNER TO postgres;

--
-- Name: inventory_def_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_def_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_def_id_seq OWNER TO postgres;

--
-- Name: inventory_def_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_def_id_seq OWNED BY public.inventory_def.id;


--
-- Name: order_def; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_def (
    id integer NOT NULL,
    customer_id integer,
    total_price integer,
    order_status character varying,
    inserted_by integer DEFAULT 1,
    inserted_date timestamp without time zone,
    deleivery_status character varying(255) DEFAULT 'PENDING'::character varying,
    delivery_date timestamp without time zone,
    quantity_return boolean DEFAULT false,
    order_address character varying,
    order_pincode character varying,
    payment_mode character varying,
    new_customer_id integer
);


ALTER TABLE public.order_def OWNER TO postgres;

--
-- Name: order_def_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_def_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_def_id_seq OWNER TO postgres;

--
-- Name: order_def_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_def_id_seq OWNED BY public.order_def.id;


--
-- Name: order_items_def; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items_def (
    id integer NOT NULL,
    order_id integer,
    product_id integer,
    quantity integer,
    price numeric(10,2),
    total_price numeric(10,2),
    order_time timestamp without time zone,
    batch_id integer
);


ALTER TABLE public.order_items_def OWNER TO postgres;

--
-- Name: order_items_def_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_def_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_items_def_id_seq OWNER TO postgres;

--
-- Name: order_items_def_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_def_id_seq OWNED BY public.order_items_def.id;


--
-- Name: otp_def; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.otp_def (
    id integer NOT NULL,
    phone character varying,
    otp character varying,
    inserted_by integer,
    inserted_date timestamp without time zone
);


ALTER TABLE public.otp_def OWNER TO postgres;

--
-- Name: otp_def_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.otp_def_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.otp_def_id_seq OWNER TO postgres;

--
-- Name: otp_def_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.otp_def_id_seq OWNED BY public.otp_def.id;


--
-- Name: payment_gateway; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_gateway (
    id integer NOT NULL,
    amount character varying,
    bank_name character varying,
    bank_reference_id integer,
    card_number character varying,
    card_holder character varying,
    customer_id integer,
    reference_id character varying,
    booking_id integer,
    payment_status character varying,
    name character varying,
    email character varying,
    phone character varying,
    zip_code character varying,
    hash_data character varying,
    order_id character varying,
    transaction_id character varying,
    payment_mode character varying,
    payment_channel character varying,
    payment_datetime timestamp without time zone,
    response_code integer,
    response_message character varying,
    hash character varying,
    admin_remark character varying,
    new_customer_id integer
);


ALTER TABLE public.payment_gateway OWNER TO postgres;

--
-- Name: payment_gateway_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_gateway_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payment_gateway_id_seq OWNER TO postgres;

--
-- Name: payment_gateway_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_gateway_id_seq OWNED BY public.payment_gateway.id;


--
-- Name: product_batch_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_batch_details (
    id integer NOT NULL,
    product_id integer,
    label_name character varying,
    batch_quantity character varying,
    discount_price integer,
    mrp integer,
    type character varying,
    visibility boolean DEFAULT true,
    flavour_id integer
);


ALTER TABLE public.product_batch_details OWNER TO postgres;

--
-- Name: product_batch_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_batch_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_batch_details_id_seq OWNER TO postgres;

--
-- Name: product_batch_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_batch_details_id_seq OWNED BY public.product_batch_details.id;


--
-- Name: product_batch_details_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_batch_details_log (
    id integer NOT NULL,
    product_id integer NOT NULL,
    label_name character varying(255),
    batch_quantity character varying(100),
    discount_price numeric(10,2),
    mrp numeric(10,2),
    inserted_by integer,
    inserted_date timestamp without time zone,
    updated_by integer,
    updated_date timestamp without time zone,
    in_stock numeric,
    prev_in_stock numeric,
    type character varying,
    operation character varying,
    amount numeric(6,2),
    batch_id integer,
    flavour_id integer
);


ALTER TABLE public.product_batch_details_log OWNER TO postgres;

--
-- Name: product_batch_details_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_batch_details_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_batch_details_log_id_seq OWNER TO postgres;

--
-- Name: product_batch_details_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_batch_details_log_id_seq OWNED BY public.product_batch_details_log.id;


--
-- Name: product_def; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_def (
    id integer NOT NULL,
    category_id integer,
    product_name character varying,
    product_price integer,
    in_stock numeric,
    product_image character varying,
    inserted_by integer DEFAULT 1,
    inserted_date timestamp without time zone,
    featured boolean,
    mrp_price integer,
    product_description character varying,
    updated_date timestamp without time zone,
    health_benefits character varying,
    product_image_two character varying,
    product_image_three character varying,
    batch jsonb,
    type character varying,
    product_type_subname character varying,
    product_code character varying,
    visibility boolean DEFAULT true,
    seo character varying,
    brand_id integer
);


ALTER TABLE public.product_def OWNER TO postgres;

--
-- Name: product_def_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_def_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_def_id_seq OWNER TO postgres;

--
-- Name: product_def_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_def_id_seq OWNED BY public.product_def.id;


--
-- Name: product_def_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_def_log (
    id integer NOT NULL,
    product_def_id integer,
    category_id integer,
    product_name character varying,
    product_description character varying,
    mrp_price integer,
    product_price integer,
    in_stock numeric,
    product_image character varying,
    featured boolean,
    inserted_by integer,
    inserted_date timestamp without time zone,
    updated_by integer,
    updated_date timestamp without time zone,
    health_benefits character varying,
    operation character varying,
    in_hand_stock numeric,
    count_change numeric,
    product_image_two character varying,
    product_image_three character varying,
    previous_stock numeric,
    seo character varying
);


ALTER TABLE public.product_def_log OWNER TO postgres;

--
-- Name: product_def_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_def_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_def_log_id_seq OWNER TO postgres;

--
-- Name: product_def_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_def_log_id_seq OWNED BY public.product_def_log.id;


--
-- Name: product_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_log (
    log_id integer NOT NULL,
    product_id integer NOT NULL,
    field_name character varying(255) NOT NULL,
    old_value text,
    new_value text,
    updated_by character varying(255),
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    operation_type character varying(50) NOT NULL
);


ALTER TABLE public.product_log OWNER TO postgres;

--
-- Name: product_log_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_log_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_log_log_id_seq OWNER TO postgres;

--
-- Name: product_log_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_log_log_id_seq OWNED BY public.product_log.log_id;


--
-- Name: product_pieces_batch; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_pieces_batch (
    id integer NOT NULL,
    product_id integer,
    mrp integer,
    discount_price integer,
    label_name character varying,
    batch_quantity character varying
);


ALTER TABLE public.product_pieces_batch OWNER TO postgres;

--
-- Name: product_pieces_batch_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_pieces_batch_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_pieces_batch_id_seq OWNER TO postgres;

--
-- Name: product_pieces_batch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_pieces_batch_id_seq OWNED BY public.product_pieces_batch.id;


--
-- Name: product_review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_review (
    id integer NOT NULL,
    rating integer,
    review character varying,
    visiblity boolean DEFAULT true,
    inserted_date timestamp without time zone,
    updated_date timestamp without time zone,
    customer_review_name character varying,
    product_id integer
);


ALTER TABLE public.product_review OWNER TO postgres;

--
-- Name: product_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_review_id_seq OWNER TO postgres;

--
-- Name: product_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_review_id_seq OWNED BY public.product_review.id;


--
-- Name: product_type_def; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_type_def (
    id integer NOT NULL,
    product_type_name character varying,
    product_type_subname character varying,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_date timestamp without time zone,
    product_type_subname_shortname character varying
);


ALTER TABLE public.product_type_def OWNER TO postgres;

--
-- Name: product_type_def_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_type_def_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_type_def_id_seq OWNER TO postgres;

--
-- Name: product_type_def_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_type_def_id_seq OWNED BY public.product_type_def.id;


--
-- Name: product_unit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_unit (
    id integer NOT NULL,
    label_name character varying,
    batch_quantity character varying,
    inserted_date timestamp without time zone,
    quantity character varying,
    product_type_name character varying DEFAULT 'UNITS'::character varying
);


ALTER TABLE public.product_unit OWNER TO postgres;

--
-- Name: promotional_def; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotional_def (
    promotional_image character varying,
    id integer NOT NULL,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_date timestamp without time zone,
    banner_hidden boolean DEFAULT false
);


ALTER TABLE public.promotional_def OWNER TO postgres;

--
-- Name: promotional_def_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotional_def_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.promotional_def_id_seq OWNER TO postgres;

--
-- Name: promotional_def_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promotional_def_id_seq OWNED BY public.promotional_def.id;


--
-- Name: prouduct_unit_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prouduct_unit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.prouduct_unit_id_seq OWNER TO postgres;

--
-- Name: prouduct_unit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prouduct_unit_id_seq OWNED BY public.product_unit.id;


--
-- Name: user_def; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_def (
    user_id integer NOT NULL,
    user_name character varying,
    phone_no character varying,
    email character varying,
    password character varying,
    token character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_def OWNER TO postgres;

--
-- Name: user_def_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_def_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_def_id_seq OWNER TO postgres;

--
-- Name: user_def_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_def_id_seq OWNED BY public.admin_def.id;


--
-- Name: user_def_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_def_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_def_user_id_seq OWNER TO postgres;

--
-- Name: user_def_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_def_user_id_seq OWNED BY public.user_def.user_id;


--
-- Name: admin_def id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_def ALTER COLUMN id SET DEFAULT nextval('public.user_def_id_seq'::regclass);


--
-- Name: blogs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blogs ALTER COLUMN id SET DEFAULT nextval('public.blogs_id_seq'::regclass);


--
-- Name: brand_def id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brand_def ALTER COLUMN id SET DEFAULT nextval('public.brand_def_id_seq'::regclass);


--
-- Name: category_def id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_def ALTER COLUMN id SET DEFAULT nextval('public.category_def_id_seq'::regclass);


--
-- Name: category_def_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_def_log ALTER COLUMN id SET DEFAULT nextval('public.category_def_log_id_seq'::regclass);


--
-- Name: customer_def id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_def ALTER COLUMN id SET DEFAULT nextval('public.customer_def_id_seq'::regclass);


--
-- Name: customer_def_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_def_log ALTER COLUMN id SET DEFAULT nextval('public.customer_def_log_id_seq'::regclass);


--
-- Name: customer_review id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_review ALTER COLUMN id SET DEFAULT nextval('public.customer_review_id_seq'::regclass);


--
-- Name: customer_service_def id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_service_def ALTER COLUMN id SET DEFAULT nextval('public.customer_service_def_id_seq'::regclass);


--
-- Name: deleivery_def id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deleivery_def ALTER COLUMN id SET DEFAULT nextval('public.deleivery_def_id_seq'::regclass);


--
-- Name: deleted_product id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deleted_product ALTER COLUMN id SET DEFAULT nextval('public.deleted_product_id_seq'::regclass);


--
-- Name: email_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_log ALTER COLUMN id SET DEFAULT nextval('public.email_log_id_seq'::regclass);


--
-- Name: flavour_def id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flavour_def ALTER COLUMN id SET DEFAULT nextval('public.flavour_def_id_seq'::regclass);


--
-- Name: inventory_def id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_def ALTER COLUMN id SET DEFAULT nextval('public.inventory_def_id_seq'::regclass);


--
-- Name: order_def id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_def ALTER COLUMN id SET DEFAULT nextval('public.order_def_id_seq'::regclass);


--
-- Name: order_items_def id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items_def ALTER COLUMN id SET DEFAULT nextval('public.order_items_def_id_seq'::regclass);


--
-- Name: otp_def id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otp_def ALTER COLUMN id SET DEFAULT nextval('public.otp_def_id_seq'::regclass);


--
-- Name: payment_gateway id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_gateway ALTER COLUMN id SET DEFAULT nextval('public.payment_gateway_id_seq'::regclass);


--
-- Name: product_batch_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_batch_details ALTER COLUMN id SET DEFAULT nextval('public.product_batch_details_id_seq'::regclass);


--
-- Name: product_batch_details_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_batch_details_log ALTER COLUMN id SET DEFAULT nextval('public.product_batch_details_log_id_seq'::regclass);


--
-- Name: product_def id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_def ALTER COLUMN id SET DEFAULT nextval('public.product_def_id_seq'::regclass);


--
-- Name: product_def_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_def_log ALTER COLUMN id SET DEFAULT nextval('public.product_def_log_id_seq'::regclass);


--
-- Name: product_log log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_log ALTER COLUMN log_id SET DEFAULT nextval('public.product_log_log_id_seq'::regclass);


--
-- Name: product_pieces_batch id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_pieces_batch ALTER COLUMN id SET DEFAULT nextval('public.product_pieces_batch_id_seq'::regclass);


--
-- Name: product_review id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_review ALTER COLUMN id SET DEFAULT nextval('public.product_review_id_seq'::regclass);


--
-- Name: product_type_def id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_type_def ALTER COLUMN id SET DEFAULT nextval('public.product_type_def_id_seq'::regclass);


--
-- Name: product_unit id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_unit ALTER COLUMN id SET DEFAULT nextval('public.prouduct_unit_id_seq'::regclass);


--
-- Name: promotional_def id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotional_def ALTER COLUMN id SET DEFAULT nextval('public.promotional_def_id_seq'::regclass);


--
-- Name: user_def user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_def ALTER COLUMN user_id SET DEFAULT nextval('public.user_def_user_id_seq'::regclass);


--
-- Name: blogs blogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);


--
-- Name: brand_def brand_def_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brand_def
    ADD CONSTRAINT brand_def_pkey PRIMARY KEY (id);


--
-- Name: category_def category_def_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_def
    ADD CONSTRAINT category_def_pkey PRIMARY KEY (id);


--
-- Name: customer_def_log customer_def_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_def_log
    ADD CONSTRAINT customer_def_log_pkey PRIMARY KEY (id);


--
-- Name: customer_def customer_def_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_def
    ADD CONSTRAINT customer_def_pkey PRIMARY KEY (id);


--
-- Name: customer_service_def customer_service_def_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_service_def
    ADD CONSTRAINT customer_service_def_pkey PRIMARY KEY (id);


--
-- Name: deleivery_def deleivery_def_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deleivery_def
    ADD CONSTRAINT deleivery_def_pkey PRIMARY KEY (id);


--
-- Name: flavour_def flavour_def_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flavour_def
    ADD CONSTRAINT flavour_def_pkey PRIMARY KEY (id);


--
-- Name: inventory_def inventory_def_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_def
    ADD CONSTRAINT inventory_def_pkey PRIMARY KEY (id);


--
-- Name: order_def order_def_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_def
    ADD CONSTRAINT order_def_pkey PRIMARY KEY (id);


--
-- Name: order_items_def order_items_def_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items_def
    ADD CONSTRAINT order_items_def_pkey PRIMARY KEY (id);


--
-- Name: product_batch_details_log product_batch_details_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_batch_details_log
    ADD CONSTRAINT product_batch_details_log_pkey PRIMARY KEY (id);


--
-- Name: product_batch_details product_batch_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_batch_details
    ADD CONSTRAINT product_batch_details_pkey PRIMARY KEY (id);


--
-- Name: product_def product_def_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_def
    ADD CONSTRAINT product_def_pkey PRIMARY KEY (id);


--
-- Name: product_log product_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_log
    ADD CONSTRAINT product_log_pkey PRIMARY KEY (log_id);


--
-- Name: product_pieces_batch product_pieces_batch_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_pieces_batch
    ADD CONSTRAINT product_pieces_batch_pkey PRIMARY KEY (id);


--
-- Name: product_type_def product_type_def_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_type_def
    ADD CONSTRAINT product_type_def_pkey PRIMARY KEY (id);


--
-- Name: promotional_def promotional_def_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotional_def
    ADD CONSTRAINT promotional_def_pkey PRIMARY KEY (id);


--
-- Name: product_unit prouduct_unit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_unit
    ADD CONSTRAINT prouduct_unit_pkey PRIMARY KEY (id);


--
-- Name: user_def user_def_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_def
    ADD CONSTRAINT user_def_pkey PRIMARY KEY (user_id);


--
-- Name: order_items_def batch_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items_def
    ADD CONSTRAINT batch_foreign_key FOREIGN KEY (batch_id) REFERENCES public.product_batch_details(id);


--
-- Name: inventory_def batches_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_def
    ADD CONSTRAINT batches_id FOREIGN KEY (batch_id) REFERENCES public.product_batch_details(id);


--
-- Name: product_def fk_brand; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_def
    ADD CONSTRAINT fk_brand FOREIGN KEY (brand_id) REFERENCES public.brand_def(id);


--
-- Name: inventory_def fk_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_def
    ADD CONSTRAINT fk_key FOREIGN KEY (product_id) REFERENCES public.product_def(id);


--
-- Name: payment_gateway fk_key_orderid; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_gateway
    ADD CONSTRAINT fk_key_orderid FOREIGN KEY (booking_id) REFERENCES public.order_def(id);


--
-- Name: deleivery_def fk_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deleivery_def
    ADD CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES public.order_def(id);


--
-- Name: product_pieces_batch fk_pieces; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_pieces_batch
    ADD CONSTRAINT fk_pieces FOREIGN KEY (product_id) REFERENCES public.product_def(id);


--
-- Name: order_items_def fk_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items_def
    ADD CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES public.product_def(id) ON DELETE CASCADE;


--
-- Name: product_batch_details_log fk_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_batch_details_log
    ADD CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES public.product_def(id) ON DELETE CASCADE;


--
-- Name: product_batch_details fk_product_batch_details_product_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_batch_details
    ADD CONSTRAINT fk_product_batch_details_product_id FOREIGN KEY (product_id) REFERENCES public.product_def(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_batch_details flavour_fk_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_batch_details
    ADD CONSTRAINT flavour_fk_key FOREIGN KEY (flavour_id) REFERENCES public.flavour_def(id);


--
-- Name: order_def order_def_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_def
    ADD CONSTRAINT order_def_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customer_def(id);


--
-- Name: order_def order_def_fkkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_def
    ADD CONSTRAINT order_def_fkkey FOREIGN KEY (new_customer_id) REFERENCES public.customer_def_log(id);


--
-- Name: order_items_def order_items_def_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items_def
    ADD CONSTRAINT order_items_def_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.order_def(id);


--
-- Name: order_items_def order_items_def_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items_def
    ADD CONSTRAINT order_items_def_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product_def(id);


--
-- PostgreSQL database dump complete
--

