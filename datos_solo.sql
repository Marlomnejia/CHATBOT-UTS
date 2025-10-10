INSERT INTO `conversations` (`id`, `user_id`, `created_at`) VALUES
(5, 1, '2025-10-06 01:05:23');

INSERT INTO `conversation_messages` (`id`, `conversation_id`, `sender`, `message`, `timestamp`) VALUES
(17, 5, 'user', 'Hola chatbot!', '2025-10-06 01:10:47'),
(18, 5, 'bot', '¡Hola! ¡Qué chévere verte por aquí! 👋 Un excelente domingo para recargar energías y prepararnos para lo que viene. ¿En qué puedo echarte una mano hoy con todo lo de la UTS? ¡Estoy listo para ayudarte! 💪', '2025-10-06 01:10:47'),
(19, 5, 'user', 'Hola chatbot!', '2025-10-06 01:12:32'),
(20, 5, 'bot', '¡Justo a tiempo para lo que necesites! 😉 Dime, ¿en qué te puedo ayudar hoy? ¡Estoy aquí para resolver cualquier duda que tengas sobre la UTS! ✨', '2025-10-06 01:12:32'),
(21, 5, 'user', '¿Cuál es la capital de Santander? 1759695147747', '2025-10-06 01:12:37'),
(22, 5, 'bot', '¡Qué buena pregunta! 🤔 La capital de Santander es Bucaramanga. ¡Y justo ahí está nuestra increíble UTS, dándole vida a la ciudad! 🚀', '2025-10-06 01:12:37'),
(23, 5, 'user', 'Hola chatbot!', '2025-10-06 02:13:43'),
(24, 5, 'bot', '¡Hey de nuevo! ¡Este domingo por la tarde es perfecto para aclarar cualquier cosita! ¿En qué te echo una mano hoy? 😉', '2025-10-06 02:13:43'),
(25, 5, 'user', '¿Cuál es la capital de Santander? 1759698819458', '2025-10-06 02:13:51'),
(26, 5, 'bot', '¡Jaja, parece que Bucaramanga nos tiene fascinados hoy! 😄 Y con toda razón, ¡es una ciudad increíble!\n\nPara que no quede duda, ¡la capital de Santander es Bucaramanga! ✨ ¡Un dato clave que siempre viene bien recordar, sobre todo un domingo por la tarde para recargar energías antes de la semana! 😉', '2025-10-06 02:13:51'),
(27, 5, 'user', 'Hola chatbot!', '2025-10-06 02:20:28'),
(28, 5, 'bot', '¡Hola de nuevo! 😄 ¡Qué chévere verte por aquí otra vez! Dime, ¿en qué andas pensando o qué necesitas que revisemos hoy?', '2025-10-06 02:20:28'),
(29, 5, 'user', '¿Cuál es la capital de Santander? 1759699219851', '2025-10-06 02:20:31'),
(30, 5, 'bot', '¡Jajaja! ¡Parece que Bucaramanga nos tiene en un bucle mental hoy! 😄\n\nNo hay problema, ¡la respuesta sigue siendo la misma y con mucho orgullo utista!: la capital de Santander es Bucaramanga. ¡Siempre listo para confirmarlo! 😉', '2025-10-06 02:20:31'),
(31, 5, 'user', 'Hola chatbot!', '2025-10-06 02:24:55'),
(32, 5, 'bot', '¡Hola de nuevo! 👋 Jajaja, ¡parece que estamos en un modo "favorito de la semana" con Bucaramanga! 😉\n\n¡Claro que sí, con mucho gusto te lo confirmo una vez más!: la capital de Santander es Bucaramanga. ¡Siempre es un placer recordar datos importantes de nuestra región! 😄', '2025-10-06 02:24:55'),
(33, 5, 'user', '¿Cuál es la capital de Santander? 1759699489582', '2025-10-06 02:25:02'),
(34, 5, 'bot', '¡Ah, Bucaramanga, la protagonista de tu tarde! 🌟 ¡Y con razón! Sí, la respuesta sigue siendo la misma: la capital de Santander es Bucaramanga. ¡Así de claro y sin rodeos! 😉 ¡Que tengas un final de domingo espectacular! ✨', '2025-10-06 02:25:02');

INSERT INTO `faqs` (`id`, `question`, `answer`, `created_by`, `created_at`, `updated_at`) VALUES
(14, '¿Dónde queda la UTS?', 'La sede principal de las Unidades Tecnológicas de Santander (UTS) está ubicada en Bucaramanga, Santander, en la Calle de los Estudiantes #9-82.', 2, '2025-10-06 01:00:46', '2025-10-06 01:00:46'),
(15, '¿Cuál es el número de teléfono de la UTS?', 'El número de contacto principal de las Unidades Tecnológicas de Santander es +57 607 6917700.', 2, '2025-10-06 01:00:55', '2025-10-06 01:00:55'),
(16, '¿Cuáles son los horarios de atención?', 'El horario de atención general es de lunes a viernes, de 7:30 a.m. a 12:00 a.m. y de 2:00 p.m. a 6:00 p.m.', 2, '2025-10-06 01:01:12', '2025-10-06 01:01:12'),
(17, '¿Cuándo se acaban las clases?', 'La finalización de clases para el segundo semestre de 2025 es el 22 de noviembre.', 2, '2025-10-06 01:01:23', '2025-10-06 01:01:23'),
(18, '¿En qué fechas son los primeros parciales?', 'El primer parcial del segundo semestre de 2025 está programado del 8 al 13 de septiembre.', 2, '2025-10-06 01:01:34', '2025-10-06 01:01:34'),
(19, '¿Cuándo son los exámenes finales?', 'El tercer parcial (exámenes finales) del segundo semestre de 2025 es del 24 al 29 de noviembre.', 2, '2025-10-06 01:01:43', '2025-10-06 01:01:43'),
(20, '¿Cuándo es el segundo parcial?', 'El segundo parcial está programado del 14 al 20 de octubre de 2025.', 2, '2025-10-06 01:01:51', '2025-10-06 01:01:51'),
(21, '¿Hasta cuándo puedo cancelar materias?', 'La fecha límite para la cancelación de cursos, según el calendario académico, es el 15 de noviembre de 2025.', 2, '2025-10-06 01:01:58', '2025-10-06 01:01:58'),
(22, '¿Quién es Omar Lengerke Pérez?', 'Rector de Unidades Tecnológicas de Santander.', 2, '2025-10-06 01:02:25', '2025-10-06 01:02:25'),
(24, '¿Cuál es la capital de Santander? 1759698819458', 'La capital de Santander es Bucaramanga.', 2, '2025-10-06 02:13:41', '2025-10-06 02:13:41'),
(25, '¿Cuál es la capital de Santander? 1759699219851', 'La capital de Santander es Bucaramanga.', 2, '2025-10-06 02:20:21', '2025-10-06 02:20:21'),
(26, '¿Cuál es la capital de Santander? 1759699489582', 'La capital de Santander es Bucaramanga.', 2, '2025-10-06 02:24:52', '2025-10-06 02:24:52');

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `isVerified`, `verificationToken`) VALUES
(1, 'Marlon Mejia', 'marlon@uts.edu.co', '$2b$08$If14nMbhhLLAl.zATkiW8uwidHrHOPd90V19NuSN9VRQLzjHD4RuG', 'student', '2025-10-06 00:57:10', 0, NULL),
(2, 'admin', 'admin@uts.edu.co', '$2b$08$Myf2eg7PVL4//H23/S5Dlu27ja7g7CPl.V6H4uUq5CgWycZGJ2iE2', 'admin', '2025-10-06 01:00:03', 0, NULL),
(5, 'NuevoUsuario', 'test1759698812492@uts.edu.co', '$2b$08$/lelYzMYRIaTeq2UqLLbMe.q6iIcgTXVl5vn0eQnyksqT2n7srepe', 'student', '2025-10-06 02:13:33', 0, NULL),
(6, 'NuevoUsuario', 'test1759699212865@uts.edu.co', '$2b$08$P/fAAHe3QUzaWBmyyLi60.mavV3YC/n6M92.PLUJ.mXnD.1iKhPTS', 'student', '2025-10-06 02:20:13', 0, NULL),
(7, 'NuevoUsuario', 'test1759699482028@uts.edu.co', '$2b$08$m7ucodnFJO8fuYmPELCcou4ViaGHcsZ8VjFJCYcJxP.7.wfVXTpw2', 'student', '2025-10-06 02:24:43', 0, NULL);

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('c8fd7856-13da-4b22-8d37-0dbaaa0de9b4', '119c4409ce34a45dd071a9570fa2aa1649b7e1d9866cb8d4b175df5ab9ec0169', '2025-10-05 19:56:03.553', '20250918095718_init', NULL, NULL, '2025-10-05 19:56:03.224', 1);
