--
-- PostgreSQL database dump
--

-- Dumped from database version 13.12 (Debian 13.12-0+deb11u1)
-- Dumped by pg_dump version 15.7 (Debian 15.7-0+deb12u1)

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
    CONSTRAINT classes_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'archived'::character varying, 'deleted'::character varying])::text[])))
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
    status character varying DEFAULT 'active'::character varying
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
    received_by integer,
    received_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying DEFAULT 'active'::character varying
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
    other_names character varying(50) NOT NULL,
    date_of_birth date NOT NULL,
    gender character varying(10),
    class_id integer,
    amountowed integer,
    residential_address text,
    phone character varying(20),
    email character varying(100),
    enrollment_date date NOT NULL,
    national_id character varying(15),
    birth_cert_id character varying(20),
    role character varying(20) DEFAULT 'student'::character varying,
    user_id integer,
    status character varying DEFAULT 'active'::character varying
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
    user_email character varying(50) NOT NULL,
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
3	1	1	2024-09-08	present	1	\N
4	2	1	2024-09-08	present	1	\N
5	3	4	2024-09-08	present	1	\N
6	1	1	2024-09-10	late	1	\N
7	2	1	2024-09-10	present	1	\N
10	1	1	2024-09-11	present	1	\N
11	2	1	2024-09-11	absent	1	\N
12	1	1	2024-09-13	present	1	\N
13	2	1	2024-09-13	present	1	\N
14	3	4	2024-09-13	present	1	\N
1	1	1	2024-08-26	present	1	\N
21	3	4	2024-09-14	present	1	26
15	1	1	2024-09-14	absent	1	\N
16	2	1	2024-09-14	present	1	\N
25	1	1	2024-09-20	present	1	26
26	2	1	2024-09-20	present	1	26
27	3	4	2024-09-20	absent	1	26
\.


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.classes (class_id, class_name, class_level, capacity, room_name, staff_id, status, created_at, updated_at) FROM stdin;
1	class 2a	Pre School	50	room 5	2	active	2024-08-13 19:47:47.312142+00	2024-08-13 19:47:47.312142+00
2	class 2b	Pre School	60	room 5	2	active	2024-08-13 19:50:34.26825+00	2024-08-13 19:50:34.26825+00
3	class 1	Pre School	60	room 5	2	active	2024-08-13 19:51:30.390517+00	2024-08-13 19:51:30.390517+00
6	Nursery 1A	Pre School	33	New Block Room 2	3	active	2024-09-08 12:20:00.486043+00	2024-09-08 12:20:00.486043+00
5	Jhs 2c	JHS	45	50	3	deleted	2024-08-14 10:40:27.110367+00	2024-08-14 10:40:27.110367+00
4	JHS 2	JHS	60	Room 20	2	active	2024-08-13 19:56:41.411305+00	2024-08-13 19:56:41.411305+00
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (department_id, department_name, head_of_department, description, created_at, updated_at) FROM stdin;
1	Music Department	2	We Teach students music. \nmusic is life	2024-08-12 22:23:04.309118+00	2024-08-12 22:23:04.309118+00
\.


--
-- Data for Name: evaluations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evaluations (evaluation_id, evaluatee_id, evaluation_date, teaching_effectiveness, classroom_management, student_engagement, professionalism, comments, years_of_experience, evaluator_id, created_at, status) FROM stdin;
1	6	2024-09-19	5.0	3.0	4.0	2.0	This is the best comment ever	8	\N	2024-09-06 09:38:22.848046	active
2	12	2024-09-06	5.0	5.0	4.0	3.0	this is my second comment	10	\N	2024-09-06 14:30:46.262454	active
3	12	2024-09-10	3.0	4.0	4.0	5.0		11	\N	2024-09-25 17:34:02.25116	active
4	3	2024-09-25	1.0	1.0	1.0	1.0		1	\N	2024-09-25 17:37:51.391703	active
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (event_id, event_title, event_date, start_time, end_time, location, description, event_type, target_audience, created_at, status, user_id, updated_at) FROM stdin;
3	Sermon 	2024-07-28	03:13:00	03:13:00	office	discuss what is going on	Meeting	Students	2024-08-16 15:14:13.379533+00	active	6	2024-09-15 11:32:51.33743+00
2	End of first term exams 	2024-07-30	05:34:00	21:39:00	accra	gggjjgc	Sports	Parents	2024-08-14 03:38:07.836015+00	active	\N	2024-09-15 11:39:18.855637+00
4	Founders Day	2024-09-18	14:12:00	16:12:00	classroom	description 	Holiday	Staff	2024-09-15 13:13:27.802007+00	active	26	2024-09-15 13:13:27.802007+00
1	End of term exams 	2024-08-14	08:35:00	05:33:00	accra	organising a meeting for all staff	Meeting	Staff	2024-08-14 03:32:38.085418+00	deleted	6	2024-09-15 11:32:51.33743+00
5	Founders Day	2024-09-23	19:44:00	17:47:00	office	second founders day celebration edited 	Meeting	Parents	2024-09-20 17:48:54.109365+00	active	\N	2024-09-20 17:52:32.738468+00
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (expense_id, recipient_name, expense_category, description, amount, expense_date, invoice_number, supplier_id, staff_id, user_id, created_at) FROM stdin;
3		Supplies	supplies made	40.00	2024-09-16	401523	1	\N	26	2024-09-16 17:01:03.817017
2	Ernest  Wilson	Salaries	bawuliar updated	60.00	2024-08-28	40	\N	12	26	2024-08-29 07:45:29.013477
4	Amam Cobina	Utilities	this is the second item updated	700.00	2024-09-16	5jjhff	\N	\N	26	2024-09-16 21:40:14.099986
1	Ernest  Wilson	Salaries	this is the first description\ni am adding the user id	60.00	2024-08-28	50	1	12	26	2024-08-28 22:23:15.59297
5	Master Ebo	Maintenance	this is the latest item added	420.00	2024-09-20	invoice	\N	\N	26	2024-09-20 19:43:40.824753
\.


--
-- Data for Name: fee_collections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fee_collections (collection_id, student_id, payment_date, amount_received, old_balance, new_balance, fee_type, payment_mode, status, created_at, received_by, comment) FROM stdin;
1	1	2024-08-23	50.00	80.00	30.00	\N	\N	active	2024-08-23 22:52:06.443503	26	\N
2	1	2024-08-23	50.00	30.00	0.00	\N	\N	active	2024-08-23 23:48:53.982245	26	\N
3	1	2024-08-23	-32.00	0.00	32.00	\N	\N	active	2024-08-23 23:56:33.864432	26	\N
4	1	2024-08-23	40.00	32.00	0.00	\N	\N	active	2024-08-23 23:59:51.816007	26	\N
5	1	2024-08-24	-50.00	0.00	-50.00	\N	\N	active	2024-08-24 00:02:45.215038	26	\N
6	3	2024-09-16	900.00	700.00	200.00	\N	\N	active	2024-09-16 21:37:42.335603	26	not a sensible comment
7	2	2024-09-17	850.00	800.00	50.00	\N	\N	active	2024-09-17 05:46:15.338171	26	not needed
\.


--
-- Data for Name: grading_scheme; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grading_scheme (gradescheme_id, grade_name, minimum_mark, maximum_mark, grade_remark, status) FROM stdin;
1	A	90.00	100.00	EXCELLENT	active
2	B	70.00	80.00	GOOD	active
\.


--
-- Data for Name: health_incident; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.health_incident (incident_id, incident_date, incident_description, treatmentprovided, user_id) FROM stdin;
1	2024-08-05	he is the latest legend in town 	given Jesus	\N
2	2024-08-05	he is the latest legend in town 	given Jesus	\N
3	2024-08-05	he is the latest legend in town 	given Jesus	\N
4	2024-08-05	he is the latest legend in town 	given Jesus	\N
5	2024-08-05	he is the latest legend in town 2024	given Jesus	\N
6	2024-08-05	he is the latest legend in town 2024	given Jesus	\N
7	2024-08-05	he is the latest legend in town 2024	given Jesush	\N
8	2024-08-05	he is the latest legend in town 2024	given Jesush	\N
9	2024-08-06	this is a serious emergency	sent to the hospital	\N
10	2024-08-06	this is a serious emergency	sent to the hospital	\N
11	2024-08-13	hhgfghj	ythjjuu	\N
\.


--
-- Data for Name: inventory_class_semester; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_class_semester (inventory_id, class_id, semester_id) FROM stdin;
1	1	1
2	1	1
3	1	1
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_items (inventory_id, inventory_name, unit_price, quantity_per_student, total_price, restock_level, status) FROM stdin;
1	uniform	15.00	3	45.00	50	active
2	Exercise Books 	5.00	10	50.00	10	active
3	My 2nd copy book	15.00	1	15.00	5	active
\.


--
-- Data for Name: invoice_class_semester; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_class_semester (invoice_id, class_id, semester_id) FROM stdin;
3	4	1
4	1	1
5	4	1
6	4	1
7	4	1
8	4	1
9	4	1
10	4	1
11	4	1
12	1	1
13	1	1
14	1	1
15	4	1
16	4	1
17	4	1
18	4	1
19	4	1
20	4	1
21	4	1
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (invoice_id, amount, description, created_at, status) FROM stdin;
1	400.00	Tuition fee	2024-08-14 01:08:29.880371	active
2	400.00	Tuition fee	2024-08-14 01:08:37.55462	active
3	400.00	Tuition fee	2024-08-14 01:09:29.081103	active
4	250.00	Transport Fee 	2024-08-14 01:11:23.098848	active
5	50.00	Tuition 	2024-08-15 14:17:44.989428	active
6	20.00	feeding 	2024-08-15 14:17:44.989428	active
7	50.00	Tuition 	2024-08-15 14:19:21.274302	active
8	20.00	feeding 	2024-08-15 14:19:21.274302	active
9	650.00	TRANSPORT FAIR 	2024-08-15 14:30:38.16187	active
10	720.00	FEEDING FEE	2024-08-15 14:30:38.16187	active
11	5.00	TAX	2024-08-15 14:30:38.16187	active
12	820.00	Books 	2024-08-17 22:08:37.538815	active
13	100.00	Uniform 	2024-08-17 22:08:37.538815	active
14	100.00	Jah 	2024-08-18 01:49:12.170517	active
15	400.00	Tuition fee	2024-09-19 12:22:18.547637	active
16	100.00	Tuition 	2024-09-19 12:22:18.547637	active
17	40.00	feeding 	2024-09-19 12:22:18.547637	active
18	650.00	TRANSPORT FAIR 	2024-09-19 12:22:18.547637	active
19	720.00	FEEDING FEE	2024-09-19 12:22:18.547637	active
20	5.00	TAX	2024-09-19 12:22:18.547637	active
21	50.00	Maintenance 	2024-09-19 12:22:18.547637	active
\.


--
-- Data for Name: notification_recipients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_recipients (id, notification_id, recipient_id, recipient_type, is_read, read_at) FROM stdin;
1	3	1	all users	f	\N
2	3	2	all users	f	\N
3	3	3	all users	f	\N
4	3	4	all users	f	\N
5	3	6	all users	f	\N
6	3	8	all users	f	\N
7	3	9	all users	f	\N
8	3	12	all users	f	\N
9	3	13	all users	f	\N
10	3	14	all users	f	\N
11	3	15	all users	f	\N
12	3	20	all users	f	\N
13	3	21	all users	f	\N
14	4	1	all users	f	\N
15	4	2	all users	f	\N
16	4	3	all users	f	\N
17	4	4	all users	f	\N
18	4	6	all users	f	\N
19	4	8	all users	f	\N
20	4	9	all users	f	\N
21	4	12	all users	f	\N
22	4	13	all users	f	\N
23	4	14	all users	f	\N
24	4	15	all users	f	\N
25	4	20	all users	f	\N
26	4	21	all users	f	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (notification_id, notification_title, notification_message, notification_type, priority, sender_id, sent_at, is_read, status, created_at) FROM stdin;
3	meeting	meeting	general	normal	6	2024-08-19 02:15:35.681418	f	active	2024-08-19 02:15:35.681418
4	Cooking 	this is the general message for you	alert	high	6	2024-08-19 03:04:51.148667	f	active	2024-08-19 03:04:51.148667
5	New Staff Added	A new staff(Ernest ) has joined the school.	general	normal	6	2024-08-19 15:32:17.380274	f	active	2024-08-19 15:32:17.380274
7	New Staff Added	A new staff(admin) has joined the school.	general	normal	6	2024-08-20 14:48:09.09222	f	active	2024-08-20 14:48:09.09222
8	New Procurement completed	A new procurement wort(2000) completed.	general	normal	26	2024-08-20 15:34:33.303374	f	active	2024-08-20 15:34:33.303374
9	New Procurement completed	A new procurement wort(3240) completed.	general	normal	26	2024-08-20 15:48:43.722116	f	active	2024-08-20 15:48:43.722116
10	Staff Member Removed	Staff member Ernest  Owusu  has been removed from the system.	general	normal	15	2024-09-06 10:33:19.895194	f	active	2024-09-06 10:33:19.895194
11	Staff Member Removed	Staff member Nelson Kweku  has been removed from the system.	general	normal	20	2024-09-06 10:36:40.468882	f	active	2024-09-06 10:36:40.468882
12	Staff Member Removed	Staff member Nelson Dorkordi has been removed from the system.	general	normal	8	2024-09-06 10:38:45.338737	f	active	2024-09-06 10:38:45.338737
13	subject Removed	subject Mathematics has been removed from the system.	general	normal	1	2024-09-06 23:03:22.458343	f	active	2024-09-06 23:03:22.458343
17	subject Removed	subject Fante has been removed from the system.	general	normal	6	2024-09-07 00:34:46.263186	f	active	2024-09-07 00:34:46.263186
19	subject Removed	subject RME has been removed from the system.	general	normal	4	2024-09-07 00:35:14.995547	f	active	2024-09-07 00:35:14.995547
20	subject Removed	subject Mathematics has been removed from the system.	general	normal	2	2024-09-07 00:35:33.755162	f	active	2024-09-07 00:35:33.755162
21	subject Removed	subject RME has been removed from the system.	general	normal	4	2024-09-07 00:37:57.496133	f	active	2024-09-07 00:37:57.496133
23	subject Removed	subject Fante has been removed from the system.	general	normal	6	2024-09-07 00:38:58.804955	f	active	2024-09-07 00:38:58.804955
25	subject Removed	subject Mathematics has been removed from the system.	general	normal	1	2024-09-07 08:26:07.769764	f	active	2024-09-07 08:26:07.769764
28	subject Removed	subject Biology has been removed from the system.	general	normal	26	2024-09-07 10:59:23.121808	f	active	2024-09-07 10:59:23.121808
29	subject Removed	subject Chemistry has been removed from the system.	general	normal	26	2024-09-07 11:00:23.519517	f	active	2024-09-07 11:00:23.519517
30	semester Removed	semester Third Term has been removed from the system.	general	normal	26	2024-09-08 01:09:00.897031	f	active	2024-09-08 01:09:00.897031
31	New Class Added	A new class "Nursery 1A" has been added to the system.	general	normal	3	2024-09-08 12:20:00.486043	f	active	2024-09-08 12:20:00.486043
32	class Removed	class Jhs 2c has been removed from the system.	general	normal	26	2024-09-08 19:39:56.716721	f	active	2024-09-08 19:39:56.716721
33	Event Added	Event Founders Day has been added to the system.	alert	normal	26	2024-09-15 13:13:27.802007	f	active	2024-09-15 13:13:27.802007
34	Event Removed	Event End of term exams  has been removed from the system.	alert	normal	26	2024-09-15 16:39:37.977906	f	active	2024-09-15 16:39:37.977906
35	subject Removed	subject French has been removed from the system.	general	normal	26	2024-09-15 17:56:05.134523	f	active	2024-09-15 17:56:05.134523
36	Event Added	Event Founders Day has been added to the system.	alert	normal	26	2024-09-20 17:48:54.109365	f	active	2024-09-20 17:48:54.109365
37	Grading scheme removed Removed	Event B has been removed from the system.	alert	normal	26	2024-09-23 01:48:19.376673	f	active	2024-09-23 01:48:19.376673
\.


--
-- Data for Name: parents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parents (parent_id, other_names, last_name, phone, email, address, status) FROM stdin;
1	christiana	Gyato	0244024457	parent@gmail.com	apam church servicef	active
2	Edward 	Attah	0249760060	parent2@gmail.com	apam church service	active
3	Cecilia 	Akwasikumah	0249760060	parent@gmail.com	Apam	active
4	Edward 	Nyarkoh	0244024457	edwardnyarkoh2@gmail.com	America	active
5	David 	Attah	0571141320	david@attah.nk	Wurupong Rc	inactive
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (permission_id, permission_name) FROM stdin;
1	Add Staff
2	Add Student
3	Add Subject
4	Add Invoice
5	Add Fees
6	Add Class
7	Add Grade Scheme
8	Add event
9	add timetable
10	view invoice
11	view health record
12	add supplier
13	update supplier
14	send notification
15	add permission
16	update inventory
17	add inventory
18	take attendance
19	update grades
20	add grades
21	update remarks
22	add remarks
23	view students
24	view student profile
25	view staff
26	update evaluation
27	add evaluation
28	edit attendance
29	delete event
30	view subjects
31	delete subject
\.


--
-- Data for Name: procurements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.procurements (procurement_id, item_id, supplier_id, unit_cost, quantity, total_cost, procurement_date, received_by, received_at, status) FROM stdin;
2	1	1	25.00	20	500.00	2024-08-20	15	2024-08-20 14:59:25.53081	active
3	3	1	80.00	25	2000.00	2024-08-29	15	2024-08-20 15:34:33.303374	active
4	1	1	60.00	54	3240.00	2024-08-20	15	2024-08-20 15:48:43.722116	active
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
1	1
1	2
1	3
1	4
1	5
1	6
1	7
1	8
1	9
1	10
1	11
1	12
1	13
1	14
1	15
1	16
1	17
1	18
1	19
1	20
1	21
1	22
1	23
1	24
2	2
2	6
2	7
2	5
1	25
1	26
1	27
1	28
1	29
1	30
1	31
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (role_id, role_name) FROM stdin;
1	Admin
2	Head Teacher
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
2	Second Term	2024-09-01	2024-09-30	completed
8	Third Term	2024-10-01	2024-11-07	upcoming
1	First Term	2024-07-28	2024-11-11	active
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff (staff_id, user_id, first_name, last_name, middle_name, date_of_birth, gender, marital_status, address, phone_number, email, emergency_contact, date_of_joining, designation, department, salary, account_number, contract_type, employment_status, qualification, experience, blood_group, national_id, passport_number, photo, teaching_subject, class_teacher, subject_in_charge, house_in_charge, bus_in_charge, library_in_charge, status, role) FROM stdin;
2	9	Matilda 	Attah 	Emefa	2024-07-29	F	Single	assemblies of god ghana	+233551577446	atlcoccus@gmail2.com	0504238397	2024-08-12		Mathematics	800.00	0702109023	Full-time	Active	degrees	worked with js	AB-	50865769		https://firebasestorage.googleapis.com/v0/b/school-management-e22be.appspot.com/o/images%2FIMG-20220401-WA0018.jpg2024-08-12T17%3A26%3A03.675Z?alt=media&token=f97ee86c-f2ef-473b-894f-211235022277	mathematics	\N	\N	\N	\N	\N	active	teaching staff
3	12	John 	Nyarkoh	Akwasikumah	2024-07-28	M	Single	assemblies of god ghana	+233551577446	atlcoccus@gmail123.com	0504238397	2024-08-13		English	500.00	0702109023	Full-time	Active	degree	worked with js	AB+	50865769	20540244	\N	English	\N	\N	\N	\N	\N	active	teaching staff
15	26	admin	admin	admin	2024-08-20	M	Single	admin	0551577446	admin@admin	0551577446	2024-08-20	Admin	admin	50000.00	8040750	Contract	Active	HND 	5 years	O+	54246	584455	https://firebasestorage.googleapis.com/v0/b/school-management-e22be.appspot.com/o/images%2Fphoto_2023-11-02_11-14-45.jpg2024-08-20T14%3A48%3A00.576Z?alt=media&token=922165c8-4b73-4878-bd36-338f04242ff2		\N	\N	\N	\N	\N	active	admin
13	22	Ernest 1	Nelson 	Tawiah	1996-02-19	M	Single	jkhgjgg	25844245	atlcoccus123@gmail.com25	0551577446	2024-08-19		Music	20.00	502856	Full-time	Active	HND 	5 years	AB+	54246	584455	https://firebasestorage.googleapis.com/v0/b/school-management-e22be.appspot.com/o/images%2Fdownload.jpeg2024-08-19T15%3A32%3A09.961Z?alt=media&token=f9a1c6aa-e655-4460-bd08-cae23bc38c76		\N	\N	\N	\N	\N	active	admin
6	15	Ernest 	Owusu 		2023-07-30	M	Divorced	assemblies of god ghana	+233551577446	atlcoccus@gmail7885.com	0502109023	2024-01-08		English	806.00	0702109023	Part-time	On Leave	degree	worked with jsx	AB-	50865769	20540244	https://firebasestorage.googleapis.com/v0/b/school-management-e22be.appspot.com/o/images%2FANGEL%20PROJECT%202-01.png2024-09-06T14%3A15%3A53.326Z?alt=media&token=af21a9b5-6f99-4e1b-b39c-d4c8908df40c	social	\N	\N	\N	\N	\N	active	non teaching
12	21	Ernest 	Wilson	Ernest 	2024-08-20	M	Single	newest staff	25844245	nelsodork@gmail24.com	0551577446	2024-08-12		Music	200.00	8040750	Full-time	On Leave	HND 	5 years	AB-	54246	584455	https://firebasestorage.googleapis.com/v0/b/school-management-e22be.appspot.com/o/images%2FIMG-20230627-WA0051.jpg2024-09-06T14%3A33%3A46.907Z?alt=media&token=42b62bb9-db20-476d-a367-594f8ba1e5e5		\N	\N	\N	\N	\N	active	head teacher
11	20	Nelson	Kweku 	Legend	2024-07-29	M	Married	fffjhng\nvcfgfg	25844245	nelsodork@gmail.com	0551577446	2024-07-31		Music	809.00	20	Full-time	On Leave	HND 	5 years	AB+	54246	584455	https://firebasestorage.googleapis.com/v0/b/school-management-e22be.appspot.com/o/images%2FdorkordiChannel4.jpeg2024-08-16T14%3A04%3A23.167Z?alt=media&token=bb14602c-940b-445b-86d5-bcea27f7b130	578	\N	\N	\N	\N	\N	active	teaching staff
1	8	Nelson	Dorkordi	Tawiah	2024-07-28	M	Single	assemblies of god ghana	+233551577446	atlcoccus@gmail1.com	0504238397	2024-08-12		Mathematics	400.00	0702109023	Contract	Active	degrees	worked with js	A+	50865769		https://firebasestorage.googleapis.com/v0/b/school-management-e22be.appspot.com/o/images%2Fphoto_2023-11-02_11-14-45.jpg2024-08-12T17%3A02%3A55.492Z?alt=media&token=0e663bd9-746b-4b01-a98c-665694a8b7bc	mathematics	\N	\N	\N	\N	\N	active	teaching staff
\.


--
-- Data for Name: student_grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_grades (grade_id, student_id, subject_id, class_id, user_id, gradescheme_id, semester_id, class_score, exams_score, total_score, status, created_at) FROM stdin;
1	1	1	1	26	\N	1	40.00	50.00	90.00	active	2024-09-20 20:39:56.947281+00
4	1	3	1	26	2	1	40.00	35.00	75.00	active	2024-09-20 20:39:56.947281+00
6	1	7	1	26	\N	1	47.00	7.00	54.00	active	2024-09-20 20:39:56.947281+00
7	2	7	1	26	\N	1	25.00	35.00	60.00	active	2024-09-20 20:39:56.947281+00
3	1	2	1	26	1	1	45.00	45.00	90.00	active	2024-09-20 20:39:56.947281+00
9	2	2	1	26	1	1	40.00	47.00	87.00	active	2024-09-20 20:39:56.947281+00
10	3	8	4	26	2	1	40.00	30.00	70.00	active	2024-09-20 21:39:48.595818+00
12	2	8	1	26	\N	1	0.00	30.00	30.00	active	2024-09-23 02:25:48.345006+00
15	1	5	1	26	\N	1	0.00	41.00	41.00	active	2024-09-23 02:27:52.432508+00
16	2	5	1	26	\N	1	0.00	50.00	50.00	active	2024-09-23 02:27:52.432508+00
23	3	6	4	26	\N	1	40.00	0.00	40.00	active	2024-09-24 16:28:13.398494+00
19	1	6	1	26	\N	1	40.00	43.00	83.00	active	2024-09-23 02:35:19.136102+00
20	2	6	1	26	1	1	47.00	44.00	91.00	active	2024-09-23 02:35:19.136102+00
11	1	8	1	26	1	1	0.00	20.00	30.00	active	2024-09-23 02:25:48.345006+00
\.


--
-- Data for Name: student_parent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_parent (student_id, parent_id, relationship, status) FROM stdin;
1	1	Mother 	active
1	2	Father	active
2	3	Mother 	active
2	4	Father	active
3	5	Father 	inactive
3	3	Guardian	inactive
\.


--
-- Data for Name: student_remarks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_remarks (remark_id, student_id, class_id, semester_id, user_id, class_teachers_remark, headteachers_remark, remark_date) FROM stdin;
1	1	1	1	26	student details  \nclass teachers remark2	head teachers remark	2024-08-28
2	2	1	1	26		this is the headteachers remarks for nyarko	2024-09-25
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (student_id, photo, first_name, last_name, other_names, date_of_birth, gender, class_id, amountowed, residential_address, phone, email, enrollment_date, national_id, birth_cert_id, role, user_id, status) FROM stdin;
1	https://firebasestorage.googleapis.com/v0/b/school-management-e22be.appspot.com/o/images%2FdorkordiChannel.jpeg2024-08-21T22%3A50%3A58.566Z?alt=media&token=c4c32613-7f02-4936-84ad-fcb2e4b85767	nelson1	Dorkordi	coccus	1999-02-23	Male	1	-50	Swedru senior high school	0551577446	atlcoccus@gmail.comme	2024-08-21	54246	5454	student	29	active
2	https://firebasestorage.googleapis.com/v0/b/school-management-e22be.appspot.com/o/images%2Fdownload.jpeg2024-08-30T19%3A29%3A16.975Z?alt=media&token=9ef118ff-c2b5-4f65-9a61-5c2b2f0e4a23	John	Nyarkoh	Yaw	2017-09-22	Male	1	50	this is the second student	0551577446	atlcoccus@gmail23.com	2024-08-30	54246	5454	student	30	active
3	https://firebasestorage.googleapis.com/v0/b/school-management-e22be.appspot.com/o/images%2FANGEL%20PROJECT%202-01.png2024-08-31T17%3A35%3A26.002Z?alt=media&token=62a33d0a-2478-4f77-8a45-ca893f273b2a	Matilda 	Attah 	Emefa 	2009-05-16	Female	4	2165	Nkonya wurupong \nKwanyako	0504238397	emefa@emefa.com	2024-08-31	23564789	98745632	student	31	active
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects (subject_id, subject_name, status) FROM stdin;
3	Social Studies	active
2	Mathematics	active
1	Mathematics	deleted
4	RME	active
6	Fante	active
8	Biology	active
5	Chemistry	active
7	French	active
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (supplier_id, supplier_name, contact_name, contact_phone, contact_email, address, details, status) FROM stdin;
1	CEPME	Mr. Nelson	054732204	atl@nel.com	swedru 	basic school girls uniform	active
\.


--
-- Data for Name: timetable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.timetable (timetable_id, class_id, subject_id, teacher_id, room_id, day_of_week, period_number, start_time, end_time, semester_id) FROM stdin;
7	4	1	3	\N	Monday	1	08:00:00	09:00:00	\N
8	4	1	3	\N	Monday	2	09:00:00	12:22:00	\N
9	4	1	2	\N	Tuesday	1	08:00:00	09:00:00	\N
10	4	1	3	\N	Tuesday	2	09:00:00	12:22:00	\N
11	4	1	3	\N	Wednesday	1	08:00:00	09:00:00	\N
12	4	1	3	\N	Wednesday	2	09:00:00	12:22:00	\N
13	4	1	1	\N	Thursday	1	08:00:00	09:00:00	\N
14	4	3	1	\N	Thursday	2	09:00:00	12:22:00	\N
15	4	3	2	\N	Friday	1	08:00:00	09:00:00	\N
16	4	1	3	\N	Friday	2	09:00:00	12:22:00	\N
17	4	3	1	\N	Monday	1	08:00:00	09:00:00	1
18	4	2	3	\N	Tuesday	1	08:00:00	09:00:00	1
19	4	3	2	\N	Wednesday	1	08:00:00	09:00:00	1
20	4	1	3	\N	Thursday	1	08:00:00	09:00:00	1
21	4	1	3	\N	Friday	1	08:00:00	09:00:00	1
\.


--
-- Data for Name: user_health_record; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_health_record (user_id, medical_conditions, allergies, blood_group, vaccination_status, last_physical_exam_date, created_at, updated_at, health_insurance_id, status) FROM stdin;
26	admin	admin	O+	admin	\N	2024-08-20 14:48:09.09222	2024-08-20 14:48:09.09222	\N	active
29	headache	banku	AB+	none done yet	\N	2024-08-21 22:51:03.531866	2024-08-21 22:51:03.531866	2024	active
30	headache, asthma, allergies	banku, fufu, cassava	AB+	all vaccines completed	\N	2024-08-30 19:29:24.228615	2024-08-30 19:29:24.228615	2024	active
31	Rashes	Cassava	AB+	Yellow fever,\ncovid 19	\N	2024-08-31 17:41:24.380197	2024-08-31 17:41:24.380197	123456789	inactive
22	gvjhjh	bnnnv	AB+	jhjgjv	\N	2024-08-19 15:32:17.380274	2024-08-19 15:32:17.380274	\N	active
21	elephantiasis	Banku	AB-	none	\N	2024-08-17 22:27:00.425717	2024-08-17 22:27:00.425717	\N	active
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (user_id, role_id) FROM stdin;
6	1
6	2
2	2
1	2
13	2
26	1
26	2
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, user_name, user_email, role, status, password) FROM stdin;
1	nelson	atlcoccus@gmail.com	user	active	$2a$10$xasb8wrI9SuYEsaKv2zkhuV/s709ConTHiD4lNANszYCsw4pyuioe
2	John 	jhon@gmail.com	user	active	$2a$10$42RIJHDjCK3//Y7zXNbY7.RC0pMIjuKjorXm7hJcCAnk9GHfPR.jO
3	emefa	emefa@gmail.com	user	active	$2a$10$pGwshWA4F2Jir2b4yEFIl.xyEPFDgATtswzeu/YlaDELSZUSJ84Ly
4	nelson 2	nelson@gmail.com	user	active	$2a$10$bISsUI9RbE2sHqarSe0AWOXgXUSHitWKKh.BZ1vbkhre66gw2Cotq
6	nel	nel@gmail.com	admin	active	$2a$10$/tiqWC7kDu1PjVp1Lgy1X.t.5RIByDcPF5MLU6V7sMRu2.6tJEmmK
9	matilda attah emefa	atlcoccus@gmail2.com	user	active	$2a$10$jPXbX6Ed5jcVdKN80OItzO3hiJGwH/gIJCG3zRhHwbc8I12SpNxV2
12	john nyarkohakwasikumah	atlcoccus@gmail123.com	user	active	$2a$10$S302w9M0.Vze0iJUBES58e92eD1TyusxkbZ9WI0hsKtn4FTKo9z8.
13	nelson1dorkordiakwasikumah	atlcoccus@gmail586.com	user	active	$2a$10$w2JTMirgBPuskAHVZv7w5eBW8cYvqBxaFf4qXxFS6OGZJkybIs8ca
14	ernest owusunelson 	atlcoccus@gmail549.com	user	active	$2a$10$TSGDNQuOmoZMoN7PACravuEsJNwBgADKjOTjM6KdH.t3lutvPT4Gm
26	adminadmin	admin@admin	admin	active	$2a$10$dTYFyllq1uXxg0kYtDAkdufYdPmAhb14Nsr2rkoZEphIfIcnIztgC
29	nelsondorkordi	atlcoccus@gmail.comme	student	active	$2a$10$VYySt5Nq0MXgUIinIoQj1e8PdSLUAje6W/qkvHKYX2B4AhK9fS1DO
30	johnnyarkoh	atlcoccus@gmail23.com	student	active	$2a$10$78.kDR.q.eL8PC5MuONyU.88.InJTOYPxsSwnS.v1T5NCUdSgd0K6
31	matilda attah 	emefa@emefa.com	student	inactive	$2a$10$1l.pHigQnsc2uAW45hz3xuKEVaSViCs/8kxh1xQ.Gy8UpTyCWKljS
22	ernest nelson 	atlcoccus123@gmail.com25	admin	active	$2a$10$xRAuJ2oWFyC/eCeCFxyEH.qLGR0oZa9Z/XtMz1f6C2TP015i1h8/.
20	nelsonkweku 	nelsodork@gmail.com	teaching staff	inactive	$2a$10$sK5LemZWriAk67YfrTTfdO5GJyGRJy4R4JubyCh7qGZbii.qunsxS
8	nelsondorkorditawiah	atlcoccus@gmail1.com	user	inactive	$2a$10$lnaaC1NeS6H7W9WvWhUgQuhjUAbvMX3DxYqb5xPhBhKGOt4jyWbwa
15	ernest owusu 	atlcoccus@gmail7885.com	user	inactive	$2a$10$TV6yucTJPQL2dDej47WDUOvbQl2HTj/s5TV/TgPkJ/SnHdzeOxlqu
21	ernest wilson	nelsodork@gmail24.com	head teacher	active	$2a$10$KY9H03YJNm5UT2emzjnIredWRZmASoj/onj3WY8pmAdpc11b6ey8G
\.


--
-- Name: attendance_attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendance_attendance_id_seq', 27, true);


--
-- Name: classes_class_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.classes_class_id_seq', 6, true);


--
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 1, true);


--
-- Name: evaluations_evaluation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.evaluations_evaluation_id_seq', 4, true);


--
-- Name: events_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_event_id_seq', 5, true);


--
-- Name: expenses_expense_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expenses_expense_id_seq', 5, true);


--
-- Name: fee_collections_collection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fee_collections_collection_id_seq', 7, true);


--
-- Name: grading_scheme_grade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grading_scheme_grade_id_seq', 2, true);


--
-- Name: health_incident_incident_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.health_incident_incident_id_seq', 11, true);


--
-- Name: inventory_items_inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_items_inventory_id_seq', 3, true);


--
-- Name: invoices_invoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoices_invoice_id_seq', 21, true);


--
-- Name: notification_recipients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notification_recipients_id_seq', 26, true);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 37, true);


--
-- Name: parents_parent_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parents_parent_id_seq', 5, true);


--
-- Name: permissions_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_permission_id_seq', 31, true);


--
-- Name: procurements_procurement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.procurements_procurement_id_seq', 4, true);


--
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 2, true);


--
-- Name: rooms_room_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rooms_room_id_seq', 1, false);


--
-- Name: semesters_semester_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.semesters_semester_id_seq', 8, true);


--
-- Name: staff_staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_staff_id_seq', 15, true);


--
-- Name: student_grades_grade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_grades_grade_id_seq', 27, true);


--
-- Name: student_remarks_remark_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_remarks_remark_id_seq', 2, true);


--
-- Name: students_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.students_student_id_seq', 3, true);


--
-- Name: subjects_subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subjects_subject_id_seq', 8, true);


--
-- Name: suppliers_supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_supplier_id_seq', 1, true);


--
-- Name: timetable_timetable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.timetable_timetable_id_seq', 21, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 31, true);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (attendance_id);


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
-- Name: users users_user_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_email_key UNIQUE (user_email);


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
-- Name: procurements procurements_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurements
    ADD CONSTRAINT procurements_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(inventory_id);


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

