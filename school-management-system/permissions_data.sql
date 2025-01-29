--
-- PostgreSQL database dump
--

-- Dumped from database version 13.16 (Debian 13.16-1.pgdg120+1)
-- Dumped by pg_dump version 15.8 (Debian 15.8-0+deb12u1)

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
96	view notification
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
\.


--
-- Name: permissions_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_permission_id_seq', 70, true);


--
-- PostgreSQL database dump complete
--

