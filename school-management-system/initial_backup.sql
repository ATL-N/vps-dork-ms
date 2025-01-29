--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: update_modified_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_modified_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_modified_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    attendance_id integer NOT NULL,
    student_id integer,
    class_id integer,
    attendance_date date NOT NULL,
    status character varying(10) NOT NULL,
    semester_id integer,
    staff_id integer
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- Name: attendance_attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attendance_attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.attendance_attendance_id_seq OWNER TO postgres;

--
-- Name: attendance_attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attendance_attendance_id_seq OWNED BY public.attendance.attendance_id;


--
-- Name: balance_adjustment_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.balance_adjustment_log (
    log_id integer NOT NULL,
    student_id integer,
    amount_adjusted numeric(10,2),
    reason text,
    adjusted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.balance_adjustment_log OWNER TO postgres;

--
-- Name: balance_adjustment_log_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.balance_adjustment_log_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.balance_adjustment_log_log_id_seq OWNER TO postgres;

--
-- Name: balance_adjustment_log_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.balance_adjustment_log_log_id_seq OWNED BY public.balance_adjustment_log.log_id;


--
-- Name: class_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.class_items (
    class_item_id integer NOT NULL,
    class_id integer,
    item_id integer,
    semester_id integer,
    quantity_per_student integer DEFAULT 0,
    supplied_by integer,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying
);


ALTER TABLE public.class_items OWNER TO postgres;

--
-- Name: class_items_class_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.class_items_class_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.class_items_class_item_id_seq OWNER TO postgres;

--
-- Name: class_items_class_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.class_items_class_item_id_seq OWNED BY public.class_items.class_item_id;


--
-- Name: classes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.classes (
    class_id integer NOT NULL,
    class_name character varying(50) NOT NULL,
    class_level character varying(50) NOT NULL,
    capacity integer,
    room_name character varying(50),
    staff_id integer,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT classes_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text, ('archived'::character varying)::text, ('deleted'::character varying)::text])))
);


ALTER TABLE public.classes OWNER TO postgres;

--
-- Name: classes_class_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.classes_class_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.classes_class_id_seq OWNER TO postgres;

--
-- Name: classes_class_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.classes_class_id_seq OWNED BY public.classes.class_id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    department_id integer NOT NULL,
    department_name character varying(50) NOT NULL,
    head_of_department integer,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.departments_department_id_seq OWNER TO postgres;

--
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- Name: evaluations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluations (
    evaluation_id integer NOT NULL,
    evaluatee_id integer,
    evaluation_date date NOT NULL,
    teaching_effectiveness numeric(2,1),
    classroom_management numeric(2,1),
    student_engagement numeric(2,1),
    professionalism numeric(2,1),
    overall_rating numeric(2,1) GENERATED ALWAYS AS (((((teaching_effectiveness + classroom_management) + student_engagement) + professionalism) / (4)::numeric)) STORED,
    comments text,
    years_of_experience integer,
    evaluator_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying,
    CONSTRAINT evaluations_classroom_management_check CHECK (((classroom_management >= (1)::numeric) AND (classroom_management <= (5)::numeric))),
    CONSTRAINT evaluations_professionalism_check CHECK (((professionalism >= (1)::numeric) AND (professionalism <= (5)::numeric))),
    CONSTRAINT evaluations_student_engagement_check CHECK (((student_engagement >= (1)::numeric) AND (student_engagement <= (5)::numeric))),
    CONSTRAINT evaluations_teaching_effectiveness_check CHECK (((teaching_effectiveness >= (1)::numeric) AND (teaching_effectiveness <= (5)::numeric)))
);


ALTER TABLE public.evaluations OWNER TO postgres;

--
-- Name: evaluations_evaluation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.evaluations_evaluation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.evaluations_evaluation_id_seq OWNER TO postgres;

--
-- Name: evaluations_evaluation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.evaluations_evaluation_id_seq OWNED BY public.evaluations.evaluation_id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    event_id integer NOT NULL,
    event_title character varying(100) NOT NULL,
    event_date date,
    start_time time without time zone,
    end_time time without time zone,
    location character varying(100),
    description text,
    event_type character varying(50),
    target_audience character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying,
    user_id integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: events_event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.events_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.events_event_id_seq OWNER TO postgres;

--
-- Name: events_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.events_event_id_seq OWNED BY public.events.event_id;


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    expense_id integer NOT NULL,
    recipient_name character varying(100),
    expense_category character varying(50),
    description text,
    amount numeric(10,2),
    expense_date date,
    invoice_number character varying(50),
    supplier_id integer,
    staff_id integer,
    user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: expenses_expense_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expenses_expense_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.expenses_expense_id_seq OWNER TO postgres;

--
-- Name: expenses_expense_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expenses_expense_id_seq OWNED BY public.expenses.expense_id;


--
-- Name: fee_collections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fee_collections (
    collection_id integer NOT NULL,
    student_id integer,
    payment_date date,
    amount_received numeric(10,2),
    old_balance numeric(10,2),
    new_balance numeric(10,2),
    fee_type character varying(50),
    payment_mode character varying(20),
    status character varying(50) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    received_by integer,
    comment text
);


ALTER TABLE public.fee_collections OWNER TO postgres;

--
-- Name: fee_collections_collection_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fee_collections_collection_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fee_collections_collection_id_seq OWNER TO postgres;

--
-- Name: fee_collections_collection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fee_collections_collection_id_seq OWNED BY public.fee_collections.collection_id;


--
-- Name: feeding_fee_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feeding_fee_payments (
    id integer NOT NULL,
    student_id integer NOT NULL,
    class_id integer NOT NULL,
    collected_by integer NOT NULL,
    feeding_fee numeric(10,2) NOT NULL,
    valid_until_feeding date NOT NULL,
    transport_fee numeric(10,2) NOT NULL,
    valid_until_transport date NOT NULL,
    total_fee numeric(10,2) NOT NULL,
    semester_id integer NOT NULL,
    payment_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.feeding_fee_payments OWNER TO postgres;

--
-- Name: feeding_fee_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.feeding_fee_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.feeding_fee_payments_id_seq OWNER TO postgres;

--
-- Name: feeding_fee_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.feeding_fee_payments_id_seq OWNED BY public.feeding_fee_payments.id;


--
-- Name: feeding_transport_fees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feeding_transport_fees (
    student_id integer NOT NULL,
    transportation_method character varying(100),
    pick_up_point character varying(100),
    feeding_fee numeric(10,2) NOT NULL,
    transport_fee numeric(10,2) NOT NULL
);


ALTER TABLE public.feeding_transport_fees OWNER TO postgres;

--
-- Name: grading_scheme; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grading_scheme (
    gradescheme_id integer NOT NULL,
    grade_name character varying(10) NOT NULL,
    minimum_mark numeric(5,2) NOT NULL,
    maximum_mark numeric(5,2) NOT NULL,
    grade_remark character varying(60),
    status character varying(10) DEFAULT 'active'::character varying
);


ALTER TABLE public.grading_scheme OWNER TO postgres;

--
-- Name: grading_scheme_grade_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grading_scheme_grade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.grading_scheme_grade_id_seq OWNER TO postgres;

--
-- Name: grading_scheme_grade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grading_scheme_grade_id_seq OWNED BY public.grading_scheme.gradescheme_id;


--
-- Name: health_incident; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.health_incident (
    incident_id integer NOT NULL,
    incident_date date,
    incident_description text,
    treatmentprovided text,
    user_id integer
);


ALTER TABLE public.health_incident OWNER TO postgres;

--
-- Name: health_incident_incident_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.health_incident_incident_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.health_incident_incident_id_seq OWNER TO postgres;

--
-- Name: health_incident_incident_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.health_incident_incident_id_seq OWNED BY public.health_incident.incident_id;


--
-- Name: inventory_class_semester; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_class_semester (
    inventory_id integer NOT NULL,
    class_id integer NOT NULL,
    semester_id integer NOT NULL
);


ALTER TABLE public.inventory_class_semester OWNER TO postgres;

--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_items (
    inventory_id integer NOT NULL,
    inventory_name character varying(150) NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    quantity_per_student integer,
    total_price numeric(12,2) NOT NULL,
    restock_level integer,
    status character varying(20) DEFAULT 'active'::character varying
);


ALTER TABLE public.inventory_items OWNER TO postgres;

--
-- Name: inventory_items_inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_items_inventory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_items_inventory_id_seq OWNER TO postgres;

--
-- Name: inventory_items_inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_items_inventory_id_seq OWNED BY public.inventory_items.inventory_id;


--
-- Name: invoice_class_semester; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_class_semester (
    invoice_id integer NOT NULL,
    class_id integer NOT NULL,
    semester_id integer NOT NULL
);


ALTER TABLE public.invoice_class_semester OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    invoice_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    description character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(30) DEFAULT 'active'::character varying
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: invoices_invoice_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoices_invoice_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.invoices_invoice_id_seq OWNER TO postgres;

--
-- Name: invoices_invoice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoices_invoice_id_seq OWNED BY public.invoices.invoice_id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    item_id integer NOT NULL,
    item_name character varying(250) NOT NULL,
    category character varying(150),
    description text,
    unit_price numeric(10,2) NOT NULL,
    quantity_desired integer,
    quantity_available integer DEFAULT 0,
    restock_level integer,
    status character varying(20) DEFAULT 'active'::character varying
);


ALTER TABLE public.items OWNER TO postgres;

--
-- Name: items_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.items_item_id_seq OWNER TO postgres;

--
-- Name: items_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_item_id_seq OWNED BY public.items.item_id;


--
-- Name: items_movement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items_movement (
    supply_id integer NOT NULL,
    staff_id integer,
    recipient_name character varying(100),
    recipient_phone character varying(30),
    comments text,
    item_id integer,
    quantity integer NOT NULL,
    supplied_by integer,
    supplied_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'out'::character varying,
    movement_type character varying(20),
    returned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.items_movement OWNER TO postgres;

--
-- Name: items_movement_supply_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_movement_supply_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.items_movement_supply_id_seq OWNER TO postgres;

--
-- Name: items_movement_supply_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_movement_supply_id_seq OWNED BY public.items_movement.supply_id;


--
-- Name: items_supply; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items_supply (
    supply_id integer NOT NULL,
    student_id integer,
    item_id integer,
    quantity integer NOT NULL,
    supplied_by integer,
    supplied_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    semester_id integer,
    class_id integer,
    status character varying(20) DEFAULT 'active'::character varying
);


ALTER TABLE public.items_supply OWNER TO postgres;

--
-- Name: items_supply_supply_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_supply_supply_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.items_supply_supply_id_seq OWNER TO postgres;

--
-- Name: items_supply_supply_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_supply_supply_id_seq OWNED BY public.items_supply.supply_id;


--
-- Name: notification_recipients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_recipients (
    id integer NOT NULL,
    notification_id integer,
    recipient_id integer NOT NULL,
    recipient_type character varying(20) NOT NULL,
    is_read boolean DEFAULT false,
    read_at timestamp without time zone
);


ALTER TABLE public.notification_recipients OWNER TO postgres;

--
-- Name: notification_recipients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_recipients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notification_recipients_id_seq OWNER TO postgres;

--
-- Name: notification_recipients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notification_recipients_id_seq OWNED BY public.notification_recipients.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    notification_title character varying(255) NOT NULL,
    notification_message text NOT NULL,
    notification_type character varying(50) DEFAULT 'general'::character varying,
    priority character varying(20) DEFAULT 'normal'::character varying,
    sender_id integer,
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_read boolean DEFAULT false,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_notification_id_seq OWNER TO postgres;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- Name: parents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parents (
    parent_id integer NOT NULL,
    other_names character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    phone character varying(20),
    email character varying(100),
    address text,
    status character varying DEFAULT 'active'::character varying,
    user_id integer
);


ALTER TABLE public.parents OWNER TO postgres;

--
-- Name: parents_parent_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parents_parent_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.parents_parent_id_seq OWNER TO postgres;

--
-- Name: parents_parent_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parents_parent_id_seq OWNED BY public.parents.parent_id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    permission_id integer NOT NULL,
    permission_name character varying(100) NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permissions_permission_id_seq OWNER TO postgres;

--
-- Name: permissions_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_permission_id_seq OWNED BY public.permissions.permission_id;


--
-- Name: procurements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.procurements (
    procurement_id integer NOT NULL,
    item_id integer,
    supplier_id integer,
    unit_cost numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    total_cost numeric(12,2) NOT NULL,
    procurement_date date DEFAULT CURRENT_DATE,
    brought_by character varying(100),
    received_by integer,
    received_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(50) DEFAULT 'active'::character varying
);


ALTER TABLE public.procurements OWNER TO postgres;

--
-- Name: procurements_procurement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.procurements_procurement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.procurements_procurement_id_seq OWNER TO postgres;

--
-- Name: procurements_procurement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.procurements_procurement_id_seq OWNED BY public.procurements.procurement_id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    role_id integer NOT NULL,
    role_name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_role_id_seq OWNER TO postgres;

--
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    room_id integer NOT NULL,
    room_name character varying(50) NOT NULL
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- Name: rooms_room_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rooms_room_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rooms_room_id_seq OWNER TO postgres;

--
-- Name: rooms_room_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rooms_room_id_seq OWNED BY public.rooms.room_id;


--
-- Name: semesters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.semesters (
    semester_id integer NOT NULL,
    semester_name character varying(50) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status character varying(30) DEFAULT 'inactive'::character varying
);


ALTER TABLE public.semesters OWNER TO postgres;

--
-- Name: semesters_semester_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.semesters_semester_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.semesters_semester_id_seq OWNER TO postgres;

--
-- Name: semesters_semester_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.semesters_semester_id_seq OWNED BY public.semesters.semester_id;


--
-- Name: sms_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sms_logs (
    id integer NOT NULL,
    recipient_type character varying(50),
    message_type character varying(50),
    sender_id integer,
    recipients_id integer[],
    message_content text,
    total_attempeted integer,
    total_invalid_numbers integer,
    total_successful integer,
    total_failed integer,
    successful_recipients_ids integer[],
    failed_receipients_ids integer[],
    invalid_recipients_ids integer[],
    invalid_recippients_phone text[],
    api_response jsonb,
    send_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    total_sms_used integer
);


ALTER TABLE public.sms_logs OWNER TO postgres;

--
-- Name: sms_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sms_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sms_logs_id_seq OWNER TO postgres;

--
-- Name: sms_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sms_logs_id_seq OWNED BY public.sms_logs.id;


--
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    staff_id integer NOT NULL,
    user_id integer,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    middle_name character varying(50),
    date_of_birth date,
    gender character(1),
    marital_status character varying(20),
    address text,
    phone_number character varying(20),
    email character varying(100),
    emergency_contact character varying(100),
    date_of_joining date,
    designation character varying(50),
    department character varying(50),
    salary numeric(10,2),
    account_number character varying(30),
    contract_type character varying(50),
    employment_status character varying(50),
    qualification text,
    experience text,
    blood_group character varying(5),
    national_id character varying(50),
    passport_number character varying(20),
    photo text,
    teaching_subject character varying(50),
    class_teacher boolean,
    subject_in_charge boolean,
    house_in_charge boolean,
    bus_in_charge boolean,
    library_in_charge boolean,
    status character varying DEFAULT 'active'::character varying,
    role character varying(50) DEFAULT 'teaching staff'::character varying
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- Name: staff_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.staff_staff_id_seq OWNER TO postgres;

--
-- Name: staff_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_staff_id_seq OWNED BY public.staff.staff_id;


--
-- Name: student_grades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_grades (
    grade_id integer NOT NULL,
    student_id integer,
    subject_id integer,
    class_id integer,
    user_id integer,
    gradescheme_id integer,
    semester_id integer,
    class_score numeric(5,2),
    exams_score numeric(5,2),
    total_score numeric(5,2),
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.student_grades OWNER TO postgres;

--
-- Name: student_grades_grade_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_grades_grade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.student_grades_grade_id_seq OWNER TO postgres;

--
-- Name: student_grades_grade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_grades_grade_id_seq OWNED BY public.student_grades.grade_id;


--
-- Name: student_parent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_parent (
    student_id integer NOT NULL,
    parent_id integer NOT NULL,
    relationship character varying(50),
    status character varying(20) DEFAULT 'active'::character varying
);


ALTER TABLE public.student_parent OWNER TO postgres;

--
-- Name: student_remarks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_remarks (
    remark_id integer NOT NULL,
    student_id integer,
    class_id integer,
    semester_id integer,
    user_id integer,
    class_teachers_remark text,
    headteachers_remark text,
    remark_date date DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.student_remarks OWNER TO postgres;

--
-- Name: student_remarks_remark_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_remarks_remark_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.student_remarks_remark_id_seq OWNER TO postgres;

--
-- Name: student_remarks_remark_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_remarks_remark_id_seq OWNED BY public.student_remarks.remark_id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    student_id integer NOT NULL,
    photo text,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    other_names character varying(50),
    date_of_birth date NOT NULL,
    gender character varying(10),
    class_id integer,
    amountowed numeric(10,2),
    residential_address text,
    phone character varying(20),
    email character varying(100),
    enrollment_date date NOT NULL,
    national_id character varying(15),
    birth_cert_id character varying(20),
    role character varying(20) DEFAULT 'student'::character varying,
    user_id integer,
    status character varying DEFAULT 'active'::character varying,
    class_promoted_to integer
);


ALTER TABLE public.students OWNER TO postgres;

--
-- Name: students_student_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.students_student_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.students_student_id_seq OWNER TO postgres;

--
-- Name: students_student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.students_student_id_seq OWNED BY public.students.student_id;


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects (
    subject_id integer NOT NULL,
    subject_name character varying(100) NOT NULL,
    status character varying(10) DEFAULT 'active'::character varying
);


ALTER TABLE public.subjects OWNER TO postgres;

--
-- Name: subjects_subject_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subjects_subject_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subjects_subject_id_seq OWNER TO postgres;

--
-- Name: subjects_subject_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subjects_subject_id_seq OWNED BY public.subjects.subject_id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    supplier_id integer NOT NULL,
    supplier_name character varying(100) NOT NULL,
    contact_name character varying(100),
    contact_phone character varying(30),
    contact_email character varying(100),
    address text,
    details text,
    status character varying DEFAULT 'active'::character varying
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: suppliers_supplier_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.suppliers_supplier_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.suppliers_supplier_id_seq OWNER TO postgres;

--
-- Name: suppliers_supplier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suppliers_supplier_id_seq OWNED BY public.suppliers.supplier_id;


--
-- Name: timetable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.timetable (
    timetable_id integer NOT NULL,
    class_id integer,
    subject_id integer,
    teacher_id integer,
    room_id integer,
    day_of_week character varying(10),
    period_number integer,
    start_time time without time zone,
    end_time time without time zone,
    semester_id integer
);


ALTER TABLE public.timetable OWNER TO postgres;

--
-- Name: timetable_timetable_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.timetable_timetable_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.timetable_timetable_id_seq OWNER TO postgres;

--
-- Name: timetable_timetable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.timetable_timetable_id_seq OWNED BY public.timetable.timetable_id;


--
-- Name: user_health_record; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_health_record (
    user_id integer NOT NULL,
    medical_conditions text,
    allergies text,
    blood_group character varying(8),
    vaccination_status text,
    last_physical_exam_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    health_insurance_id character varying(20),
    status character varying(20) DEFAULT 'active'::character varying
);


ALTER TABLE public.user_health_record OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_id integer NOT NULL,
    role_id integer NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    user_name character varying(100) NOT NULL,
    user_email character varying(50),
    role character varying(20) DEFAULT 'user'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    password character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: attendance attendance_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance ALTER COLUMN attendance_id SET DEFAULT nextval('public.attendance_attendance_id_seq'::regclass);


--
-- Name: balance_adjustment_log log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.balance_adjustment_log ALTER COLUMN log_id SET DEFAULT nextval('public.balance_adjustment_log_log_id_seq'::regclass);


--
-- Name: class_items class_item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_items ALTER COLUMN class_item_id SET DEFAULT nextval('public.class_items_class_item_id_seq'::regclass);


--
-- Name: classes class_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes ALTER COLUMN class_id SET DEFAULT nextval('public.classes_class_id_seq'::regclass);


--
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- Name: evaluations evaluation_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluations ALTER COLUMN evaluation_id SET DEFAULT nextval('public.evaluations_evaluation_id_seq'::regclass);


--
-- Name: events event_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events ALTER COLUMN event_id SET DEFAULT nextval('public.events_event_id_seq'::regclass);


--
-- Name: expenses expense_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses ALTER COLUMN expense_id SET DEFAULT nextval('public.expenses_expense_id_seq'::regclass);


--
-- Name: fee_collections collection_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_collections ALTER COLUMN collection_id SET DEFAULT nextval('public.fee_collections_collection_id_seq'::regclass);


--
-- Name: feeding_fee_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feeding_fee_payments ALTER COLUMN id SET DEFAULT nextval('public.feeding_fee_payments_id_seq'::regclass);


--
-- Name: grading_scheme gradescheme_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grading_scheme ALTER COLUMN gradescheme_id SET DEFAULT nextval('public.grading_scheme_grade_id_seq'::regclass);


--
-- Name: health_incident incident_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_incident ALTER COLUMN incident_id SET DEFAULT nextval('public.health_incident_incident_id_seq'::regclass);


--
-- Name: inventory_items inventory_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items ALTER COLUMN inventory_id SET DEFAULT nextval('public.inventory_items_inventory_id_seq'::regclass);


--
-- Name: invoices invoice_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices ALTER COLUMN invoice_id SET DEFAULT nextval('public.invoices_invoice_id_seq'::regclass);


--
-- Name: items item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items ALTER COLUMN item_id SET DEFAULT nextval('public.items_item_id_seq'::regclass);


--
-- Name: items_movement supply_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_movement ALTER COLUMN supply_id SET DEFAULT nextval('public.items_movement_supply_id_seq'::regclass);


--
-- Name: items_supply supply_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_supply ALTER COLUMN supply_id SET DEFAULT nextval('public.items_supply_supply_id_seq'::regclass);


--
-- Name: notification_recipients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_recipients ALTER COLUMN id SET DEFAULT nextval('public.notification_recipients_id_seq'::regclass);


--
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- Name: parents parent_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parents ALTER COLUMN parent_id SET DEFAULT nextval('public.parents_parent_id_seq'::regclass);


--
-- Name: permissions permission_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN permission_id SET DEFAULT nextval('public.permissions_permission_id_seq'::regclass);


--
-- Name: procurements procurement_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurements ALTER COLUMN procurement_id SET DEFAULT nextval('public.procurements_procurement_id_seq'::regclass);


--
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- Name: rooms room_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms ALTER COLUMN room_id SET DEFAULT nextval('public.rooms_room_id_seq'::regclass);


--
-- Name: semesters semester_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.semesters ALTER COLUMN semester_id SET DEFAULT nextval('public.semesters_semester_id_seq'::regclass);


--
-- Name: sms_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sms_logs ALTER COLUMN id SET DEFAULT nextval('public.sms_logs_id_seq'::regclass);


--
-- Name: staff staff_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff ALTER COLUMN staff_id SET DEFAULT nextval('public.staff_staff_id_seq'::regclass);


--
-- Name: student_grades grade_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_grades ALTER COLUMN grade_id SET DEFAULT nextval('public.student_grades_grade_id_seq'::regclass);


--
-- Name: student_remarks remark_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_remarks ALTER COLUMN remark_id SET DEFAULT nextval('public.student_remarks_remark_id_seq'::regclass);


--
-- Name: students student_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students ALTER COLUMN student_id SET DEFAULT nextval('public.students_student_id_seq'::regclass);


--
-- Name: subjects subject_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects ALTER COLUMN subject_id SET DEFAULT nextval('public.subjects_subject_id_seq'::regclass);


--
-- Name: suppliers supplier_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN supplier_id SET DEFAULT nextval('public.suppliers_supplier_id_seq'::regclass);


--
-- Name: timetable timetable_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable ALTER COLUMN timetable_id SET DEFAULT nextval('public.timetable_timetable_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (attendance_id, student_id, class_id, attendance_date, status, semester_id, staff_id) FROM stdin;
\.


--
-- Data for Name: balance_adjustment_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.balance_adjustment_log (log_id, student_id, amount_adjusted, reason, adjusted_at) FROM stdin;
\.


--
-- Data for Name: class_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.class_items (class_item_id, class_id, item_id, semester_id, quantity_per_student, supplied_by, assigned_at, status) FROM stdin;
\.


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.classes (class_id, class_name, class_level, capacity, room_name, staff_id, status, created_at, updated_at) FROM stdin;
1	completed	completed	\N	\N	\N	active	2025-01-09 00:33:52.623152+00	2025-01-09 00:33:52.623152+00
13	Nursery 1A	Pre School	30		17	active	2025-01-11 11:12:52.695076+00	2025-01-11 11:12:52.695076+00
14	Nursery 1B 	Pre School	30		17	active	2025-01-11 11:13:26.879412+00	2025-01-11 11:13:26.879412+00
15	Nursery 2A	Pre School	30		17	active	2025-01-11 11:14:39.325905+00	2025-01-11 11:14:39.325905+00
16	Nursery 2B	Pre School	30		17	active	2025-01-11 11:15:01.808226+00	2025-01-11 11:15:01.808226+00
18	Nursery 2C	Pre School	30		17	active	2025-01-11 11:15:48.435129+00	2025-01-11 11:15:48.435129+00
17	Nursery 2C 	Pre School	30		17	deleted	2025-01-11 11:15:21.609646+00	2025-01-11 11:15:21.609646+00
19	KG 1A	Pre School	30		17	active	2025-01-11 11:17:28.50707+00	2025-01-11 11:17:28.50707+00
20	KG 1B	Pre School	30		17	active	2025-01-11 11:18:02.595046+00	2025-01-11 11:18:02.595046+00
21	KG 1C	Pre School	30		17	active	2025-01-11 11:18:48.254043+00	2025-01-11 11:18:48.254043+00
22	KG 2A	Pre School	30		17	active	2025-01-11 11:19:09.971665+00	2025-01-11 11:19:09.971665+00
23	KG 2B	Pre School	30		17	active	2025-01-11 11:24:24.951992+00	2025-01-11 11:24:24.951992+00
24	KG 2C 	Pre School	30		17	active	2025-01-11 11:24:58.931507+00	2025-01-11 11:24:58.931507+00
25	BS 1A	Primary	30		17	active	2025-01-11 11:25:46.230972+00	2025-01-11 11:25:46.230972+00
27	BS 1C 	Primary	30		17	active	2025-01-11 11:26:50.19139+00	2025-01-11 11:26:50.19139+00
28	BS 2A 	Primary	30		17	active	2025-01-11 11:27:14.048451+00	2025-01-11 11:27:14.048451+00
29	BS 2B 	Primary	30		17	active	2025-01-11 11:27:43.766222+00	2025-01-11 11:27:43.766222+00
30	BS 2C 	Primary	30		17	active	2025-01-11 11:28:10.593273+00	2025-01-11 11:28:10.593273+00
31	BS 3A 	Primary	30		17	active	2025-01-11 11:28:39.102402+00	2025-01-11 11:28:39.102402+00
32	BS 3B 	Primary	30		17	active	2025-01-11 11:29:04.23869+00	2025-01-11 11:29:04.23869+00
33	BS 3C 	Primary	30		17	active	2025-01-11 11:29:26.154957+00	2025-01-11 11:29:26.154957+00
34	BS 4A 	Primary	30		17	active	2025-01-11 11:29:55.700601+00	2025-01-11 11:29:55.700601+00
35	BS 4B 	Primary	30		17	active	2025-01-11 11:31:12.416794+00	2025-01-11 11:31:12.416794+00
36	BS 4C 	Primary	30		17	active	2025-01-11 11:31:45.15778+00	2025-01-11 11:31:45.15778+00
37	BS 5A 	Primary	30		17	active	2025-01-11 11:32:19.728214+00	2025-01-11 11:32:19.728214+00
38	BS 5B 	Primary	30		17	active	2025-01-11 11:32:56.959971+00	2025-01-11 11:32:56.959971+00
39	BS 5C	Primary	30		17	active	2025-01-11 11:33:21.428382+00	2025-01-11 11:33:21.428382+00
40	BS 6A 	Primary	30		17	active	2025-01-11 11:33:41.230006+00	2025-01-11 11:33:41.230006+00
41	BS 6B 	Primary	30		17	active	2025-01-11 11:34:02.464148+00	2025-01-11 11:34:02.464148+00
42	BS 6C 	Primary	30		17	active	2025-01-11 11:34:20.12055+00	2025-01-11 11:34:20.12055+00
43	BS 7A	Primary	30		17	active	2025-01-11 11:35:29.692474+00	2025-01-11 11:35:29.692474+00
44	BS 7B 	JHS	30		17	active	2025-01-11 11:36:01.01242+00	2025-01-11 11:36:01.01242+00
45	BS 8A 	JHS	30		17	active	2025-01-11 11:36:17.47492+00	2025-01-11 11:36:17.47492+00
46	BS 8B 	JHS	30		17	active	2025-01-11 11:36:34.498241+00	2025-01-11 11:36:34.498241+00
48	BS 9B 	JHS	30		17	active	2025-01-11 11:37:16.147981+00	2025-01-11 11:37:16.147981+00
26	BS 1B	Primary	30		19	active	2025-01-11 11:26:02.322704+00	2025-01-11 11:26:02.322704+00
47	BS 9A	JHS	30		21	active	2025-01-11 11:36:56.158235+00	2025-01-11 11:36:56.158235+00
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (department_id, department_name, head_of_department, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: evaluations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evaluations (evaluation_id, evaluatee_id, evaluation_date, teaching_effectiveness, classroom_management, student_engagement, professionalism, comments, years_of_experience, evaluator_id, created_at, status) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (event_id, event_title, event_date, start_time, end_time, location, description, event_type, target_audience, created_at, status, user_id, updated_at) FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (expense_id, recipient_name, expense_category, description, amount, expense_date, invoice_number, supplier_id, staff_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: fee_collections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fee_collections (collection_id, student_id, payment_date, amount_received, old_balance, new_balance, fee_type, payment_mode, status, created_at, received_by, comment) FROM stdin;
\.


--
-- Data for Name: feeding_fee_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feeding_fee_payments (id, student_id, class_id, collected_by, feeding_fee, valid_until_feeding, transport_fee, valid_until_transport, total_fee, semester_id, payment_date) FROM stdin;
\.


--
-- Data for Name: feeding_transport_fees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feeding_transport_fees (student_id, transportation_method, pick_up_point, feeding_fee, transport_fee) FROM stdin;
7	School Bus	grater grace 	5.00	3.00
\.


--
-- Data for Name: grading_scheme; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grading_scheme (gradescheme_id, grade_name, minimum_mark, maximum_mark, grade_remark, status) FROM stdin;
3	Grade 1	90.00	100.00	Highest	active
4	Grade 2 	80.00	89.00	Higher	active
5	Grade 3	70.00	79.00	High	active
6	Grade 4	60.00	69.00	High Average	active
7	Grade 5	55.00	59.00	Average	active
8	Grade 6	50.00	54.00	Low Average	active
9	Grade 7	40.00	49.00	Credit	active
10	Grade 8	35.00	39.00	Pass	active
11	Grade 9	0.00	34.00	Fail	active
\.


--
-- Data for Name: health_incident; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.health_incident (incident_id, incident_date, incident_description, treatmentprovided, user_id) FROM stdin;
\.


--
-- Data for Name: inventory_class_semester; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_class_semester (inventory_id, class_id, semester_id) FROM stdin;
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_items (inventory_id, inventory_name, unit_price, quantity_per_student, total_price, restock_level, status) FROM stdin;
\.


--
-- Data for Name: invoice_class_semester; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_class_semester (invoice_id, class_id, semester_id) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (invoice_id, amount, description, created_at, status) FROM stdin;
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items (item_id, item_name, category, description, unit_price, quantity_desired, quantity_available, restock_level, status) FROM stdin;
\.


--
-- Data for Name: items_movement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items_movement (supply_id, staff_id, recipient_name, recipient_phone, comments, item_id, quantity, supplied_by, supplied_at, status, movement_type, returned_at) FROM stdin;
\.


--
-- Data for Name: items_supply; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items_supply (supply_id, student_id, item_id, quantity, supplied_by, supplied_at, semester_id, class_id, status) FROM stdin;
\.


--
-- Data for Name: notification_recipients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_recipients (id, notification_id, recipient_id, recipient_type, is_read, read_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (notification_id, notification_title, notification_message, notification_type, priority, sender_id, sent_at, is_read, status, created_at) FROM stdin;
89	New Staff Added	A new staff(Alex) has joined the school.	general	normal	1	2025-01-11 11:08:15.793127	f	active	2025-01-11 11:08:15.793127
90	New Class Added	A new class "Nursery 1A" has been added to the system.	general	normal	1	2025-01-11 11:12:52.695076	f	active	2025-01-11 11:12:52.695076
91	New Class Added	A new class "Nursery 1B " has been added to the system.	general	normal	1	2025-01-11 11:13:26.879412	f	active	2025-01-11 11:13:26.879412
92	New Class Added	A new class "Nursery 2A" has been added to the system.	general	normal	1	2025-01-11 11:14:39.325905	f	active	2025-01-11 11:14:39.325905
93	New Class Added	A new class "Nursery 2B" has been added to the system.	general	normal	1	2025-01-11 11:15:01.808226	f	active	2025-01-11 11:15:01.808226
94	New Class Added	A new class "Nursery 2C " has been added to the system.	general	normal	1	2025-01-11 11:15:21.609646	f	active	2025-01-11 11:15:21.609646
95	New Class Added	A new class "Nursery 2C" has been added to the system.	general	normal	1	2025-01-11 11:15:48.435129	f	active	2025-01-11 11:15:48.435129
96	Class Removed	Class Nursery 2C  has been removed from the system.	general	normal	1	2025-01-11 11:16:55.349618	f	active	2025-01-11 11:16:55.349618
97	New Class Added	A new class "KG 1A" has been added to the system.	general	normal	1	2025-01-11 11:17:28.50707	f	active	2025-01-11 11:17:28.50707
98	New Class Added	A new class "KG 1B" has been added to the system.	general	normal	1	2025-01-11 11:18:02.595046	f	active	2025-01-11 11:18:02.595046
99	New Class Added	A new class "KG 1C" has been added to the system.	general	normal	1	2025-01-11 11:18:48.254043	f	active	2025-01-11 11:18:48.254043
100	New Class Added	A new class "KG 2A" has been added to the system.	general	normal	1	2025-01-11 11:19:09.971665	f	active	2025-01-11 11:19:09.971665
101	New Class Added	A new class "KG 2B" has been added to the system.	general	normal	1	2025-01-11 11:24:24.951992	f	active	2025-01-11 11:24:24.951992
102	New Class Added	A new class "KG 2C " has been added to the system.	general	normal	1	2025-01-11 11:24:58.931507	f	active	2025-01-11 11:24:58.931507
103	New Class Added	A new class "BS 1A" has been added to the system.	general	normal	1	2025-01-11 11:25:46.230972	f	active	2025-01-11 11:25:46.230972
104	New Class Added	A new class "BS 1B" has been added to the system.	general	normal	1	2025-01-11 11:26:02.322704	f	active	2025-01-11 11:26:02.322704
105	New Class Added	A new class "BS 1C " has been added to the system.	general	normal	1	2025-01-11 11:26:50.19139	f	active	2025-01-11 11:26:50.19139
106	New Class Added	A new class "BS 2A " has been added to the system.	general	normal	1	2025-01-11 11:27:14.048451	f	active	2025-01-11 11:27:14.048451
107	New Class Added	A new class "BS 2B " has been added to the system.	general	normal	1	2025-01-11 11:27:43.766222	f	active	2025-01-11 11:27:43.766222
108	New Class Added	A new class "BS 2C " has been added to the system.	general	normal	1	2025-01-11 11:28:10.593273	f	active	2025-01-11 11:28:10.593273
109	New Class Added	A new class "BS 3A " has been added to the system.	general	normal	1	2025-01-11 11:28:39.102402	f	active	2025-01-11 11:28:39.102402
110	New Class Added	A new class "BS 3B " has been added to the system.	general	normal	1	2025-01-11 11:29:04.23869	f	active	2025-01-11 11:29:04.23869
111	New Class Added	A new class "BS 3C " has been added to the system.	general	normal	1	2025-01-11 11:29:26.154957	f	active	2025-01-11 11:29:26.154957
112	New Class Added	A new class "BS 4A " has been added to the system.	general	normal	1	2025-01-11 11:29:55.700601	f	active	2025-01-11 11:29:55.700601
113	New Class Added	A new class "BS 4B " has been added to the system.	general	normal	1	2025-01-11 11:31:12.416794	f	active	2025-01-11 11:31:12.416794
114	New Class Added	A new class "BS 4C " has been added to the system.	general	normal	1	2025-01-11 11:31:45.15778	f	active	2025-01-11 11:31:45.15778
115	New Class Added	A new class "BS 5A " has been added to the system.	general	normal	1	2025-01-11 11:32:19.728214	f	active	2025-01-11 11:32:19.728214
116	New Class Added	A new class "BS 5B " has been added to the system.	general	normal	1	2025-01-11 11:32:56.959971	f	active	2025-01-11 11:32:56.959971
117	New Class Added	A new class "BS 5C" has been added to the system.	general	normal	1	2025-01-11 11:33:21.428382	f	active	2025-01-11 11:33:21.428382
118	New Class Added	A new class "BS 6A " has been added to the system.	general	normal	1	2025-01-11 11:33:41.230006	f	active	2025-01-11 11:33:41.230006
119	New Class Added	A new class "BS 6B " has been added to the system.	general	normal	1	2025-01-11 11:34:02.464148	f	active	2025-01-11 11:34:02.464148
120	New Class Added	A new class "BS 6C " has been added to the system.	general	normal	1	2025-01-11 11:34:20.12055	f	active	2025-01-11 11:34:20.12055
121	New Class Added	A new class "BS 7A" has been added to the system.	general	normal	1	2025-01-11 11:35:29.692474	f	active	2025-01-11 11:35:29.692474
122	New Class Added	A new class "BS 7B " has been added to the system.	general	normal	1	2025-01-11 11:36:01.01242	f	active	2025-01-11 11:36:01.01242
123	New Class Added	A new class "BS 8A " has been added to the system.	general	normal	1	2025-01-11 11:36:17.47492	f	active	2025-01-11 11:36:17.47492
124	New Class Added	A new class "BS 8B " has been added to the system.	general	normal	1	2025-01-11 11:36:34.498241	f	active	2025-01-11 11:36:34.498241
125	New Class Added	A new class "BS 9A" has been added to the system.	general	normal	1	2025-01-11 11:36:56.158235	f	active	2025-01-11 11:36:56.158235
126	New Class Added	A new class "BS 9B " has been added to the system.	general	normal	1	2025-01-11 11:37:16.147981	f	active	2025-01-11 11:37:16.147981
127	New Student Registration	A new student Christiana  Acquah has been registered with ID: 7	student	normal	51	2025-01-11 12:12:25.451746	f	active	2025-01-11 12:12:25.451746
128	New Staff Added	A new staff(Obed) has joined the school.	general	normal	1	2025-01-13 15:37:06.315031	f	active	2025-01-13 15:37:06.315031
129	New Staff Added	A new staff(Veronica) has joined the school.	general	normal	54	2025-01-13 16:03:02.988544	f	active	2025-01-13 16:03:02.988544
130	New Staff Added	A new staff(Isaac) has joined the school.	general	normal	54	2025-01-13 16:16:54.040653	f	active	2025-01-13 16:16:54.040653
131	New Staff Added	A new staff(Isaac) has joined the school.	general	normal	54	2025-01-13 16:22:15.40596	f	active	2025-01-13 16:22:15.40596
\.


--
-- Data for Name: parents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parents (parent_id, other_names, last_name, phone, email, address, status, user_id) FROM stdin;
10	Innocentia 	Fordjour 	0244997473			active	52
11	Alfred 	Acquah 	0244044846			active	53
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (permission_id, permission_name) FROM stdin;
70	view attendance
71	take attendance
72	view attendance report
73	view attendance analytics
74	view classes
75	add class
76	delete class
77	view events
78	add event
79	add expense
80	view feeding fee and tnt
81	take feeding and tnt
82	take fees
83	view finances
84	add bills
85	view examinations
86	record assessment
87	promote students
88	view masters sheet
89	view report cards
90	add remarks
91	add grading scheme
92	add health incident
93	view health record
94	send sms
95	view sms
97	send notification
98	view parents
99	delete parents
100	view semesters
101	close semester
102	add semester
103	delete semester
104	view staff
105	add staff
106	evaluate staff
107	delete staff
108	view students
109	add student
110	delete student
111	view subjects
112	add subjects
113	add subject
114	delete subject
115	add timetable
116	add role
117	delete user
118	assign roles
119	assign permissions
120	delete event
121	view fees
122	view student's payment history
123	view financial report
124	delete grading scheme
125	view users
126	view items
127	delete item
128	manage supply
129	view stock items
130	delete supply items
96	view notifications
\.


--
-- Data for Name: procurements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.procurements (procurement_id, item_id, supplier_id, unit_cost, quantity, total_cost, procurement_date, brought_by, received_by, received_at, status) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
1	84
1	75
1	78
1	79
1	91
1	92
1	90
1	116
1	102
1	105
1	109
1	113
1	112
1	115
1	119
1	118
1	101
1	76
1	120
1	124
1	127
1	99
1	103
1	107
1	110
1	114
1	130
1	117
1	106
1	128
1	87
1	86
1	97
1	94
1	71
1	81
1	82
1	70
1	73
1	72
1	74
1	77
1	85
1	80
1	121
1	83
1	123
1	93
1	126
1	88
1	96
1	98
1	89
1	100
1	95
1	104
1	129
1	122
1	108
1	111
1	125
2	75
2	78
2	79
2	91
2	90
2	102
2	105
2	113
2	112
2	115
2	101
2	76
2	109
2	120
2	124
2	99
2	103
2	107
2	110
2	114
2	106
2	128
2	87
2	97
2	94
2	71
2	81
2	82
2	70
2	73
2	72
2	74
2	77
2	85
2	80
2	121
2	83
2	123
2	126
2	88
2	96
2	98
2	89
2	100
2	95
2	104
2	129
2	122
2	108
2	111
2	125
3	70
3	71
3	72
3	73
3	74
3	77
3	85
3	88
3	89
3	90
3	92
3	98
3	100
3	104
3	108
3	111
3	126
3	129
3	96
3	109
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (role_id, role_name) FROM stdin;
1	Admin
2	Head Teacher
3	Teaching Staff
4	feeding fee collector
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rooms (room_id, room_name) FROM stdin;
\.


--
-- Data for Name: semesters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.semesters (semester_id, semester_name, start_date, end_date, status) FROM stdin;
9	First Term	2025-01-08	2025-03-28	active
\.


--
-- Data for Name: sms_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sms_logs (id, recipient_type, message_type, sender_id, recipients_id, message_content, total_attempeted, total_invalid_numbers, total_successful, total_failed, successful_recipients_ids, failed_receipients_ids, invalid_recipients_ids, invalid_recippients_phone, api_response, send_timestamp, total_sms_used) FROM stdin;
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff (staff_id, user_id, first_name, last_name, middle_name, date_of_birth, gender, marital_status, address, phone_number, email, emergency_contact, date_of_joining, designation, department, salary, account_number, contract_type, employment_status, qualification, experience, blood_group, national_id, passport_number, photo, teaching_subject, class_teacher, subject_in_charge, house_in_charge, bus_in_charge, library_in_charge, status, role) FROM stdin;
18	54	Obed	Takyi	Godsmal	1999-03-11	M	Single	BOTSIO	0559616009		0243761990	2022-01-11		JHS	0.00		Full-time	Active	HND IN COMPUTERS AND BUSINESS MANAGEMENT	6 YEARS		1234567		\N		\N	\N	\N	\N	\N	active	head teacher
19	55	Veronica	Aggrey		2002-07-07	F	Single	NSAWAM	0533213998		0540383063	2022-01-01		PRIMARY	0.00		Full-time	Active	WASSCE	3 YEARS		1234567		\N		\N	\N	\N	\N	\N	active	teaching staff
20	56	Isaac	Mankoe		2004-07-06	M	Single	MUMFORD	0242445132		0556866312	2025-01-08		JHS	0.00		Full-time	Active	WASSCE	0		1234567		\N	INTEGRATED SCIENCE	\N	\N	\N	\N	\N	active	teaching staff
17	47	Alex	Ankah 	Junior	1992-06-03	M	Single	P.O.Box 74\nApam	0249248800		0249248800	2017-01-01		JHS	0.00		Full-time	Active	Diploma	8 years experience	B+	1234567		\N	Fante	\N	\N	\N	\N	\N	active	teaching staff
21	57	Isaac	Danquah		1997-01-11	M	Single	BOTSIO	0559276180		0559276180	2024-01-08		JHS	0.00		Full-time	Active	DEGREE	7 YEARS		1234567		\N	MATHEMATICS	\N	\N	\N	\N	\N	active	teaching staff
\.


--
-- Data for Name: student_grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_grades (grade_id, student_id, subject_id, class_id, user_id, gradescheme_id, semester_id, class_score, exams_score, total_score, status, created_at) FROM stdin;
\.


--
-- Data for Name: student_parent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_parent (student_id, parent_id, relationship, status) FROM stdin;
7	10	Mother 	active
7	11	Father 	active
\.


--
-- Data for Name: student_remarks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_remarks (remark_id, student_id, class_id, semester_id, user_id, class_teachers_remark, headteachers_remark, remark_date) FROM stdin;
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (student_id, photo, first_name, last_name, other_names, date_of_birth, gender, class_id, amountowed, residential_address, phone, email, enrollment_date, national_id, birth_cert_id, role, user_id, status, class_promoted_to) FROM stdin;
7	\N	Christiana 	Acquah	Nhyira 	2017-06-22	Female	31	0.00	GREATER GRACE CAMPUS	0244997473		2019-01-01	0	1234567	student	51	active	31
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects (subject_id, subject_name, status) FROM stdin;
11	English Language	active
12	Mathematics	active
13	Integrated Science	active
14	History	active
15	Numeracy	active
16	Social Studies	active
17	Creative Arts	active
18	Career Technology	active
19	Computing	active
20	Fante	active
21	Our World Our People	active
22	Religious & Moral Education	active
23	Bible Knowledge	active
24	Music	active
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (supplier_id, supplier_name, contact_name, contact_phone, contact_email, address, details, status) FROM stdin;
\.


--
-- Data for Name: timetable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.timetable (timetable_id, class_id, subject_id, teacher_id, room_id, day_of_week, period_number, start_time, end_time, semester_id) FROM stdin;
\.


--
-- Data for Name: user_health_record; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_health_record (user_id, medical_conditions, allergies, blood_group, vaccination_status, last_physical_exam_date, created_at, updated_at, health_insurance_id, status) FROM stdin;
51	NONE 	NONE 	B+	POLIO	\N	2025-01-11 12:12:25.451746	2025-01-11 12:12:25.451746	1234567	active
54	NONE	NONE		NONE	\N	2025-01-13 15:37:06.315031	2025-01-13 15:37:06.315031	\N	active
55	NONE	NONE		NONE	\N	2025-01-13 16:03:02.988544	2025-01-13 16:03:02.988544	\N	active
56	NONE	NONE		NONE	\N	2025-01-13 16:16:54.040653	2025-01-13 16:16:54.040653	\N	active
47	None 	None 	B+	Yellow fever \nPolio\nHep. B	\N	2025-01-11 11:08:15.793127	2025-01-11 11:08:15.793127	\N	active
57	NONE	NONE		NONE	\N	2025-01-13 16:22:15.40596	2025-01-13 16:22:15.40596	\N	active
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (user_id, role_id) FROM stdin;
1	1
47	3
54	1
57	3
55	3
56	3
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, user_name, user_email, role, status, password) FROM stdin;
1	adminadmin	admin@admin	admin	active	$2a$10$dTYFyllq1uXxg0kYtDAkdufYdPmAhb14Nsr2rkoZEphIfIcnIztgC
51	christiana  acquah nhyira 		student	active	$2a$10$rA6oK1454fP4czac5gU/fek2ur1j.9eTXgaal0DuDEXf9bztagQKC
52	innocentia  fordjour 		parent	active	$2a$10$ixkilcCne9aXppReBlDfLu6Fd7r/N1Hnz5bQWxS7nKZjEMkzhelT6
53	alfred  acquah 		parent	active	$2a$10$rxW24lrCNuyG5yrC8xwBd.vXV1GlwVAzcRFkXhzRclXhEWS2R9THS
54	obed takyi godsmal		head teacher	active	$2a$10$k8mh5q3q9uWCunSE5hYlQu.K0eF8PgnFjjY65n9kl9.DvzPdt5WCm
55	veronica aggrey 		teaching staff	active	$2a$10$HThc1jaAuMUBr0MoI8mXIuBdvYfKyIG3n.BhzUYzFT/XKpMY0NRjG
56	isaac mankoe 		teaching staff	active	$2a$10$BflrsAo8m2K3/n4FDXsFK.p2z30pMn7q0jdXbu0n1dwGv67We3zkm
47	alex ankah  junior		teaching staff	active	$2a$10$H8/8JXGtHSdrHosXD6vsCObxj4a/SlXY29yLD7dfLWvC5hFmujh3K
57	isaac danquah 		teaching staff	active	$2a$10$A1gCNklruma4PKLIssI0yOt4mLEDd0DnfDhkxmYA3TRCmftsXeiPK
\.


--
-- Name: attendance_attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendance_attendance_id_seq', 30, true);


--
-- Name: balance_adjustment_log_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.balance_adjustment_log_log_id_seq', 2, true);


--
-- Name: class_items_class_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.class_items_class_item_id_seq', 15, true);


--
-- Name: classes_class_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.classes_class_id_seq', 48, true);


--
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 1, true);


--
-- Name: evaluations_evaluation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.evaluations_evaluation_id_seq', 5, true);


--
-- Name: events_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_event_id_seq', 5, true);


--
-- Name: expenses_expense_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expenses_expense_id_seq', 10, true);


--
-- Name: fee_collections_collection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fee_collections_collection_id_seq', 33, true);


--
-- Name: feeding_fee_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.feeding_fee_payments_id_seq', 4, true);


--
-- Name: grading_scheme_grade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grading_scheme_grade_id_seq', 11, true);


--
-- Name: health_incident_incident_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.health_incident_incident_id_seq', 12, true);


--
-- Name: inventory_items_inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_items_inventory_id_seq', 3, true);


--
-- Name: invoices_invoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoices_invoice_id_seq', 24, true);


--
-- Name: items_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_item_id_seq', 5, true);


--
-- Name: items_movement_supply_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_movement_supply_id_seq', 3, true);


--
-- Name: items_supply_supply_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_supply_supply_id_seq', 20, true);


--
-- Name: notification_recipients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notification_recipients_id_seq', 26, true);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 131, true);


--
-- Name: parents_parent_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parents_parent_id_seq', 11, true);


--
-- Name: permissions_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_permission_id_seq', 70, true);


--
-- Name: procurements_procurement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.procurements_procurement_id_seq', 8, true);


--
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 4, true);


--
-- Name: rooms_room_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rooms_room_id_seq', 1, false);


--
-- Name: semesters_semester_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.semesters_semester_id_seq', 9, true);


--
-- Name: sms_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sms_logs_id_seq', 76, true);


--
-- Name: staff_staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_staff_id_seq', 21, true);


--
-- Name: student_grades_grade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_grades_grade_id_seq', 29, true);


--
-- Name: student_remarks_remark_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_remarks_remark_id_seq', 3, true);


--
-- Name: students_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.students_student_id_seq', 7, true);


--
-- Name: subjects_subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subjects_subject_id_seq', 24, true);


--
-- Name: suppliers_supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_supplier_id_seq', 3, true);


--
-- Name: timetable_timetable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.timetable_timetable_id_seq', 31, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 57, true);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (attendance_id);


--
-- Name: balance_adjustment_log balance_adjustment_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.balance_adjustment_log
    ADD CONSTRAINT balance_adjustment_log_pkey PRIMARY KEY (log_id);


--
-- Name: class_items class_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_items
    ADD CONSTRAINT class_items_pkey PRIMARY KEY (class_item_id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (class_id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- Name: evaluations evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_pkey PRIMARY KEY (evaluation_id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (event_id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (expense_id);


--
-- Name: fee_collections fee_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_collections
    ADD CONSTRAINT fee_collections_pkey PRIMARY KEY (collection_id);


--
-- Name: feeding_fee_payments feeding_fee_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feeding_fee_payments
    ADD CONSTRAINT feeding_fee_payments_pkey PRIMARY KEY (id);


--
-- Name: feeding_transport_fees feeding_transport_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feeding_transport_fees
    ADD CONSTRAINT feeding_transport_fees_pkey PRIMARY KEY (student_id);


--
-- Name: grading_scheme grading_scheme_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grading_scheme
    ADD CONSTRAINT grading_scheme_pkey PRIMARY KEY (gradescheme_id);


--
-- Name: health_incident health_incident_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_incident
    ADD CONSTRAINT health_incident_pkey PRIMARY KEY (incident_id);


--
-- Name: inventory_class_semester inventory_class_semester_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_class_semester
    ADD CONSTRAINT inventory_class_semester_pkey PRIMARY KEY (inventory_id, class_id, semester_id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (inventory_id);


--
-- Name: invoice_class_semester invoice_class_semester_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_class_semester
    ADD CONSTRAINT invoice_class_semester_pkey PRIMARY KEY (invoice_id, class_id, semester_id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (invoice_id);


--
-- Name: items_movement items_movement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_movement
    ADD CONSTRAINT items_movement_pkey PRIMARY KEY (supply_id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (item_id);


--
-- Name: items_supply items_supply_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_supply
    ADD CONSTRAINT items_supply_pkey PRIMARY KEY (supply_id);


--
-- Name: notification_recipients notification_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_recipients
    ADD CONSTRAINT notification_recipients_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: parents parents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT parents_pkey PRIMARY KEY (parent_id);


--
-- Name: permissions permissions_permission_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_permission_name_key UNIQUE (permission_name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (permission_id);


--
-- Name: procurements procurements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurements
    ADD CONSTRAINT procurements_pkey PRIMARY KEY (procurement_id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (room_id);


--
-- Name: rooms rooms_room_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_room_name_key UNIQUE (room_name);


--
-- Name: semesters semesters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT semesters_pkey PRIMARY KEY (semester_id);


--
-- Name: sms_logs sms_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sms_logs
    ADD CONSTRAINT sms_logs_pkey PRIMARY KEY (id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (staff_id);


--
-- Name: student_grades student_grades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_grades
    ADD CONSTRAINT student_grades_pkey PRIMARY KEY (grade_id);


--
-- Name: student_parent student_parent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_parent
    ADD CONSTRAINT student_parent_pkey PRIMARY KEY (student_id, parent_id);


--
-- Name: student_remarks student_remarks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_remarks
    ADD CONSTRAINT student_remarks_pkey PRIMARY KEY (remark_id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (student_id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (subject_id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (supplier_id);


--
-- Name: timetable timetable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT timetable_pkey PRIMARY KEY (timetable_id);


--
-- Name: attendance unique_attendance_record; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT unique_attendance_record UNIQUE (student_id, class_id, attendance_date);


--
-- Name: class_items unique_class_item_semester; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_items
    ADD CONSTRAINT unique_class_item_semester UNIQUE (class_id, item_id, semester_id);


--
-- Name: classes unique_class_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT unique_class_name UNIQUE (class_name);


--
-- Name: staff unique_staff_user_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT unique_staff_user_id UNIQUE (user_id);


--
-- Name: student_grades unique_student_grade; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_grades
    ADD CONSTRAINT unique_student_grade UNIQUE (student_id, subject_id, class_id, semester_id);


--
-- Name: user_health_record user_health_record_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_health_record
    ADD CONSTRAINT user_health_record_pkey PRIMARY KEY (user_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: departments update_departments_modtime; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_departments_modtime BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: attendance attendance_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id);


--
-- Name: attendance attendance_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(semester_id);


--
-- Name: attendance attendance_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(user_id);


--
-- Name: attendance attendance_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id);


--
-- Name: balance_adjustment_log balance_adjustment_log_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.balance_adjustment_log
    ADD CONSTRAINT balance_adjustment_log_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id);


--
-- Name: class_items class_items_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_items
    ADD CONSTRAINT class_items_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id);


--
-- Name: class_items class_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_items
    ADD CONSTRAINT class_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(item_id);


--
-- Name: class_items class_items_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_items
    ADD CONSTRAINT class_items_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(semester_id);


--
-- Name: class_items class_items_supplied_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_items
    ADD CONSTRAINT class_items_supplied_by_fkey FOREIGN KEY (supplied_by) REFERENCES public.staff(user_id);


--
-- Name: classes classes_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id);


--
-- Name: evaluations evaluations_evaluatee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_evaluatee_id_fkey FOREIGN KEY (evaluatee_id) REFERENCES public.staff(staff_id) ON DELETE CASCADE;


--
-- Name: evaluations evaluations_evaluator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_evaluator_id_fkey FOREIGN KEY (evaluator_id) REFERENCES public.staff(user_id) ON DELETE CASCADE;


--
-- Name: events events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: expenses expenses_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id);


--
-- Name: expenses expenses_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(supplier_id);


--
-- Name: expenses expenses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: fee_collections fee_collections_received_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_collections
    ADD CONSTRAINT fee_collections_received_by_fkey FOREIGN KEY (received_by) REFERENCES public.users(user_id);


--
-- Name: fee_collections fee_collections_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_collections
    ADD CONSTRAINT fee_collections_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id);


--
-- Name: feeding_fee_payments feeding_fee_payments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feeding_fee_payments
    ADD CONSTRAINT feeding_fee_payments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id);


--
-- Name: feeding_fee_payments feeding_fee_payments_collected_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feeding_fee_payments
    ADD CONSTRAINT feeding_fee_payments_collected_by_fkey FOREIGN KEY (collected_by) REFERENCES public.staff(user_id);


--
-- Name: feeding_fee_payments feeding_fee_payments_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feeding_fee_payments
    ADD CONSTRAINT feeding_fee_payments_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(semester_id);


--
-- Name: feeding_fee_payments feeding_fee_payments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feeding_fee_payments
    ADD CONSTRAINT feeding_fee_payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id);


--
-- Name: feeding_transport_fees feeding_transport_fees_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feeding_transport_fees
    ADD CONSTRAINT feeding_transport_fees_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id);


--
-- Name: departments fk_head_of_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT fk_head_of_department FOREIGN KEY (head_of_department) REFERENCES public.staff(staff_id);


--
-- Name: health_incident health_incident_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_incident
    ADD CONSTRAINT health_incident_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: inventory_class_semester inventory_class_semester_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_class_semester
    ADD CONSTRAINT inventory_class_semester_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id);


--
-- Name: inventory_class_semester inventory_class_semester_inventory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_class_semester
    ADD CONSTRAINT inventory_class_semester_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory_items(inventory_id);


--
-- Name: inventory_class_semester inventory_class_semester_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_class_semester
    ADD CONSTRAINT inventory_class_semester_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(semester_id);


--
-- Name: invoice_class_semester invoice_class_semester_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_class_semester
    ADD CONSTRAINT invoice_class_semester_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id);


--
-- Name: invoice_class_semester invoice_class_semester_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_class_semester
    ADD CONSTRAINT invoice_class_semester_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(invoice_id);


--
-- Name: invoice_class_semester invoice_class_semester_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_class_semester
    ADD CONSTRAINT invoice_class_semester_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(semester_id);


--
-- Name: items_movement items_movement_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_movement
    ADD CONSTRAINT items_movement_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(item_id);


--
-- Name: items_movement items_movement_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_movement
    ADD CONSTRAINT items_movement_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id);


--
-- Name: items_movement items_movement_supplied_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_movement
    ADD CONSTRAINT items_movement_supplied_by_fkey FOREIGN KEY (supplied_by) REFERENCES public.staff(user_id);


--
-- Name: items_supply items_supply_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_supply
    ADD CONSTRAINT items_supply_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id);


--
-- Name: items_supply items_supply_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_supply
    ADD CONSTRAINT items_supply_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(item_id);


--
-- Name: items_supply items_supply_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_supply
    ADD CONSTRAINT items_supply_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(semester_id);


--
-- Name: items_supply items_supply_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_supply
    ADD CONSTRAINT items_supply_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id);


--
-- Name: items_supply items_supply_supplied_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_supply
    ADD CONSTRAINT items_supply_supplied_by_fkey FOREIGN KEY (supplied_by) REFERENCES public.staff(staff_id);


--
-- Name: notification_recipients notification_recipients_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_recipients
    ADD CONSTRAINT notification_recipients_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(notification_id);


--
-- Name: notifications notifications_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(user_id);


--
-- Name: parents parents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT parents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: procurements procurements_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurements
    ADD CONSTRAINT procurements_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(item_id);


--
-- Name: procurements procurements_received_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurements
    ADD CONSTRAINT procurements_received_by_fkey FOREIGN KEY (received_by) REFERENCES public.staff(staff_id);


--
-- Name: procurements procurements_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurements
    ADD CONSTRAINT procurements_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(supplier_id);


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(permission_id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE CASCADE;


--
-- Name: sms_logs sms_logs_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sms_logs
    ADD CONSTRAINT sms_logs_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(user_id);


--
-- Name: staff staff_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: student_grades student_grades_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_grades
    ADD CONSTRAINT student_grades_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id);


--
-- Name: student_grades student_grades_gradescheme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_grades
    ADD CONSTRAINT student_grades_gradescheme_id_fkey FOREIGN KEY (gradescheme_id) REFERENCES public.grading_scheme(gradescheme_id);


--
-- Name: student_grades student_grades_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_grades
    ADD CONSTRAINT student_grades_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(semester_id);


--
-- Name: student_grades student_grades_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_grades
    ADD CONSTRAINT student_grades_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id);


--
-- Name: student_grades student_grades_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_grades
    ADD CONSTRAINT student_grades_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id);


--
-- Name: student_grades student_grades_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_grades
    ADD CONSTRAINT student_grades_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.staff(user_id);


--
-- Name: student_parent student_parent_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_parent
    ADD CONSTRAINT student_parent_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.parents(parent_id);


--
-- Name: student_parent student_parent_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_parent
    ADD CONSTRAINT student_parent_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id);


--
-- Name: student_remarks student_remarks_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_remarks
    ADD CONSTRAINT student_remarks_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id);


--
-- Name: student_remarks student_remarks_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_remarks
    ADD CONSTRAINT student_remarks_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(semester_id);


--
-- Name: student_remarks student_remarks_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_remarks
    ADD CONSTRAINT student_remarks_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id);


--
-- Name: student_remarks student_remarks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_remarks
    ADD CONSTRAINT student_remarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: students students_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id);


--
-- Name: students students_class_promoted_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_class_promoted_to_fkey FOREIGN KEY (class_promoted_to) REFERENCES public.classes(class_id);


--
-- Name: students students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: timetable timetable_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT timetable_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id);


--
-- Name: timetable timetable_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT timetable_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id);


--
-- Name: timetable timetable_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT timetable_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(semester_id);


--
-- Name: timetable timetable_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT timetable_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id);


--
-- Name: timetable timetable_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT timetable_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.staff(staff_id);


--
-- Name: user_health_record user_health_record_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_health_record
    ADD CONSTRAINT user_health_record_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

