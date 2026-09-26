import { useEffect, useState } from 'react';
import familyImage from '@/assets/images/ChatGPT_Image_23_ago_2026,_05_09_48_p.m..png';
import trophyImage from '@/assets/images/ChatGPT_Image_23_ago_2026,_05_09_51_p.m..png';
import notebookImage from '@/assets/images/ChatGPT_Image_23_ago_2026,_05_09_54_p.m..png';
import calendarImage from '@/assets/images/ChatGPT_Image_23_ago_2026,_05_09_57_p.m..png';
import backgroundImage from '@/assets/images/ChatGPT_Image_23_ago_2026,_05_19_53_p.m..png';
import logoImage from '@/assets/images/ChatGPT_Image_23_ago_2026,_05_10_00_p.m..png';
import schoolIllustration from '@/assets/icons/icon-vision-escuela.png';
import encourageIllustration from '@/assets/icons/ilustracion-companerismo.png';
import misionIcon from '@/assets/icons/icon-mision-meta.png';
import visionIcon from '@/assets/icons/icon-vision-ojo.png';
import boletinIcon from '@/assets/icons/icon-boletin-escolar.png';
import actividadesIcon from '@/assets/icons/icon-actividades-escolares.png';
import eventosIcon from '@/assets/icons/icon-eventos-civicos.png';
import calendarioIcon from '@/assets/icons/icon-calendario-escolar.png';
import graficasIcon from '@/assets/icons/icon-graficas-estudio.png';
import galeriaIcon from '@/assets/icons/icon-galeria-fotos.png';
import teacherImage from '@/assets/footer/teacher.png';
import paperPlaneImage from '@/assets/footer/paper-plane.png';
import galleryLectura from '@/assets/gallery/lectura.svg';
import galleryCivismo from '@/assets/gallery/civismo.svg';
import galleryCiencias from '@/assets/gallery/ciencias.svg';
import galleryMatematicas from '@/assets/gallery/matematicas.svg';
import galleryDeportes from '@/assets/gallery/deportes.svg';
import galleryArte from '@/assets/gallery/arte-cultura.svg';
import {
  ArrowRight,
  BarChart3,
  Brain,
  Calendar,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Facebook,
  FileText,
  Flag,
  Flame,
  GraduationCap,
  Heart,
  Home,
  Info,
  Instagram,
  Lightbulb,
  List,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  MessageCircle,
  Newspaper,
  Paperclip,
  Phone,
  Printer,
  Search,
  Send,
  Share2,
  SlidersHorizontal,
  Star,
  StickyNote,
  Target,
  TrendingUp,
  UsersRound,
  X,
} from 'lucide-react';

// Convierte el logo (importado como URL/asset por Vite) a un data URL en
// base64 una sola vez, para poder incrustarlo en los PDFs generados con
// jsPDF (que necesita los bytes de la imagen, no solo su URL). El archivo
// original es una imagen grande (para verse bien en la pantalla), así que
// aquí se reduce primero con un canvas: en el PDF el logo se ve chiquito,
// y sin este paso el PDF pesaría varios megabytes de más.
let logoDataUrlPromise: Promise<string> | null = null;
const getLogoDataUrl = (): Promise<string> => {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const size = 220;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo preparar el logo'));
          return;
        }
        const scale = Math.min(size / img.width, size / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        ctx.drawImage(img, (size - drawWidth) / 2, (size - drawHeight) / 2, drawWidth, drawHeight);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = logoImage;
    });
  }
  return logoDataUrlPromise;
};

type Announcement = {
  label: string;
  title: string;
  description: string;
  date: string;
  dateLabel: string;
  dateISO: string;
  tone: 'pink' | 'blue' | 'green' | 'yellow';
  image: string;
  fullDescription: string[];
  bullets: string[];
  fileName: string;
  // Todo aviso aparece automáticamente en el Calendario Escolar (no hace
  // falta marcarlo aparte): por defecto se muestra como "Eventos", pero
  // aquí se puede afinar el tipo y el lugar cuando aplique. Ver el bloque
  // de "Calendario Escolar" más abajo para el tipo CalendarEventType.
  calendarType?: CalendarEventType;
  calendarLocation?: string;
};

// Ayudantes de fechas para el contenido: a partir de la fecha ISO
// ("2025-09-26") arman el texto largo ("Viernes 26 de septiembre de 2025")
// para no escribirlo a mano en cada entrada (y evitar que el día de la
// semana no coincida con la fecha).
const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const partesFecha = (iso: string) => iso.split('-').map(Number) as [number, number, number];
const fechaLarga = (iso: string) => {
  const [y, m, d] = partesFecha(iso);
  return `${DIAS_SEMANA[new Date(y, m - 1, d).getDay()]} ${d} de ${MESES[m - 1]} de ${y}`;
};
const fechaCorta = (iso: string) => {
  const [y, m, d] = partesFecha(iso);
  return `${d} de ${MESES[m - 1]} de ${y}`;
};

const diaMes = (iso: string) => {
  const [, m, d] = partesFecha(iso);
  return `${d} de ${MESES[m - 1]}`;
};

// Arma un aviso completo: solo hay que escribir la fecha ISO y el resto de
// campos; el número del día y el texto largo de la fecha salen solos.
const aviso = (a: Omit<Announcement, 'date' | 'dateLabel'>): Announcement => ({
  ...a,
  date: String(partesFecha(a.dateISO)[2]),
  dateLabel: fechaLarga(a.dateISO),
});

const announcements: Announcement[] = [
  aviso({
    label: 'Aviso General',
    title: '¡Bienvenidos al ciclo escolar 2025-2026!',
    description: 'El lunes 1 de septiembre iniciamos clases en primaria y secundaria. Conoce horarios, entrada y lo que necesitas el primer día.',
    dateISO: '2025-09-01',
    tone: 'blue',
    image: calendarImage,
    fullDescription: [
      'Damos la más cordial bienvenida a estudiantes, familias y docentes al ciclo escolar 2025-2026. De acuerdo con el calendario oficial de la SEP, las clases inician el lunes 1 de septiembre de 2025 y concluyen el miércoles 15 de julio de 2026, con 185 días de clase.',
      'Durante las primeras semanas realizaremos la evaluación diagnóstica en ambos niveles. No es un examen para calificar: nos sirve para saber desde dónde parte cada estudiante y planear el reforzamiento que necesita.',
      'Primaria entra a las 8:00 AM y secundaria (telesecundaria) a las 7:30 AM. Los primeros días se permitirá que las familias de 1° de primaria acompañen a sus hijos hasta la puerta del salón.',
    ],
    bullets: [
      'Primaria: entrada 8:00 AM, salida 1:00 PM.',
      'Secundaria: entrada 7:30 AM, salida 1:40 PM.',
      'Traer uniforme o ropa cómoda, lonche saludable y botella de agua.',
      'Los libros de texto gratuitos se entregan en el salón durante la primera semana.',
    ],
    fileName: 'Circular_Inicio_Ciclo_2025-2026.pdf',
    calendarType: 'evento',
    calendarLocation: 'Toda la escuela',
  }),
  aviso({
    label: 'Información',
    title: 'Lista de útiles: primaria y secundaria',
    description: 'Materiales básicos por nivel. Reutiliza lo que ya tengas en casa: no se pide ningún producto de marca específica.',
    dateISO: '2025-09-05',
    tone: 'yellow',
    image: notebookImage,
    fullDescription: [
      'Compartimos la lista de materiales básicos por nivel. Te pedimos reutilizar cuadernos, colores y mochilas del ciclo anterior siempre que estén en buen estado. Ninguna escuela pública puede condicionar la inscripción o la entrada al salón a la compra de útiles o uniformes.',
      'Los libros de texto gratuitos de la Nueva Escuela Mexicana (en primaria: Proyectos de Aula, Proyectos Escolares, Proyectos Comunitarios, Nuestros Saberes y Múltiples Lenguajes) se entregan en la escuela sin costo. Te pedimos forrarlos y marcarlos con el nombre del estudiante.',
    ],
    bullets: [
      '1° y 2° de primaria: 2 cuadernos de cuadro grande, lápiz, goma, sacapuntas, colores y tijeras de punta roma.',
      '3° a 6° de primaria: 3 cuadernos (cuadro chico y raya), juego de geometría y diccionario escolar.',
      'Secundaria: un cuaderno por campo formativo, calculadora básica, juego de geometría y memoria USB (opcional).',
      'Material compartido del grupo: se acordará en la primera reunión con familias.',
    ],
    fileName: 'Lista_Utiles_2025-2026.pdf',
    calendarType: 'entrega',
  }),
  aviso({
    label: 'Aviso General',
    title: 'Suspensión de clases por Consejo Técnico Escolar',
    description: 'El viernes 26 de septiembre no hay clases: el personal docente participa en la primera sesión ordinaria del CTE.',
    dateISO: '2025-09-26',
    tone: 'pink',
    image: calendarImage,
    fullDescription: [
      'El Consejo Técnico Escolar (CTE) es el espacio donde el colectivo docente analiza el avance de los estudiantes, toma acuerdos y ajusta el Programa Analítico de la escuela. Por eso, el último viernes de cada mes (en los meses que marca el calendario oficial) no hay clases.',
      'En este ciclo, las sesiones ordinarias del CTE son: 26 de septiembre, 31 de octubre y 28 de noviembre de 2025; 30 de enero, 27 de febrero, 27 de marzo, 29 de mayo y 26 de junio de 2026. Todas aparecen en nuestro Calendario Escolar.',
    ],
    bullets: [
      'No hay clases en primaria ni en secundaria.',
      'Las clases se reanudan el lunes 29 de septiembre en horario habitual.',
      'Te recomendamos agendar desde hoy las 8 fechas de CTE del ciclo.',
    ],
    fileName: 'Circular_CTE_26_sep_2025.pdf',
    calendarType: 'suspension',
  }),
  aviso({
    label: 'Información',
    title: 'Reunión de familias: resultados del diagnóstico',
    description: 'Compartiremos cómo inició cada grupo en lectura, escritura y matemáticas, y el plan de reforzamiento del primer trimestre.',
    dateISO: '2025-10-08',
    tone: 'green',
    image: familyImage,
    fullDescription: [
      'Te esperamos para platicar sobre los resultados de la evaluación diagnóstica. En primaria revisamos fluidez y comprensión lectora, producción de textos y cálculo; en secundaria, comprensión lectora, resolución de problemas y hábitos de estudio.',
      'Cada docente explicará qué va a reforzar en el grupo durante el primer trimestre y cómo pueden apoyar desde casa con actividades sencillas de 15 a 20 minutos al día.',
    ],
    bullets: [
      'Primaria: 8:00 AM en el salón de cada grupo.',
      'Secundaria: 12:30 PM en el aula de medios.',
      'Duración aproximada: 45 minutos.',
      'Se firmará la carta compromiso de acompañamiento en casa.',
    ],
    fileName: 'Citatorio_Reunion_Diagnostico.pdf',
    calendarType: 'reunion',
    calendarLocation: 'Salón de cada grupo',
  }),
  aviso({
    label: 'Información',
    title: 'Vida saludable: reglas de alimentación en la escuela',
    description: 'Recordatorio: en las escuelas de educación básica no se venden alimentos ultraprocesados ni bebidas azucaradas.',
    dateISO: '2025-10-15',
    tone: 'green',
    image: familyImage,
    fullDescription: [
      'Desde el 29 de marzo de 2025 están en vigor los lineamientos generales de alimentación escolar de la estrategia “Vive saludable, vive feliz”, que prohíben la venta de productos con sellos de advertencia (comida chatarra y bebidas azucaradas) dentro de las escuelas de educación básica.',
      'La escuela promueve el consumo de agua simple, frutas, verduras y alimentos preparados en casa. Te compartimos ideas de lonche económico y nutritivo en el boletín del mes.',
    ],
    bullets: [
      'La cooperativa solo ofrece alimentos sin sellos de advertencia.',
      'Preferir agua simple en lugar de jugos o refrescos.',
      'Ideas de lonche: tacos de frijol, fruta picada, pepino con limón, huevo cocido.',
    ],
    fileName: 'Lineamientos_Alimentacion_Escolar.pdf',
    calendarType: 'evento',
  }),
  aviso({
    label: 'Información',
    title: 'Entrega de boletas del primer periodo',
    description: 'Reunión por grupo para entregar calificaciones del primer trimestre y acordar metas para el segundo.',
    dateISO: '2025-12-05',
    tone: 'green',
    image: familyImage,
    fullDescription: [
      'Con base en la evaluación formativa del primer trimestre, cada docente entregará la boleta y un reporte breve con fortalezas y áreas de oportunidad del estudiante.',
      'Pedimos la asistencia de madre, padre o tutor. Si no puedes asistir, acércate con la maestra o maestro titular para agendar otro horario.',
    ],
    bullets: [
      'Primaria: 12:00 PM · Secundaria: 1:00 PM.',
      'Se revisarán las evidencias del portafolio del estudiante.',
      'Se acordará una meta concreta para el segundo trimestre.',
    ],
    fileName: 'Citatorio_Entrega_Boletas_1er_Periodo.pdf',
    calendarType: 'entrega',
    calendarLocation: 'Salón de cada grupo',
  }),
  aviso({
    label: 'Aviso General',
    title: 'Vacaciones de invierno',
    description: 'Del 22 de diciembre al 6 de enero no hay clases. Regresamos el lunes 12 de enero de 2026.',
    dateISO: '2025-12-19',
    tone: 'pink',
    image: calendarImage,
    fullDescription: [
      'El viernes 19 de diciembre es el último día de clases de 2025. El periodo vacacional de invierno va del 22 de diciembre de 2025 al 6 de enero de 2026.',
      'Del 7 al 9 de enero el personal docente participa en el Taller Intensivo de formación continua, por lo que los estudiantes regresan a clases el lunes 12 de enero de 2026.',
    ],
    bullets: [
      'Último día de clases: viernes 19 de diciembre.',
      'Regreso de estudiantes: lunes 12 de enero de 2026.',
      'Sugerencia para vacaciones: leer 20 minutos diarios en familia.',
    ],
    fileName: 'Circular_Vacaciones_Invierno.pdf',
    calendarType: 'festivo',
  }),
  aviso({
    label: 'Información',
    title: 'Preinscripciones para el ciclo 2026-2027',
    description: 'Si tu hija o hijo entra a 1° de primaria o a 1° de secundaria el próximo ciclo, este es el momento de preinscribirlo.',
    dateISO: '2026-02-03',
    tone: 'yellow',
    image: notebookImage,
    fullDescription: [
      'Durante febrero se abre el periodo de preinscripciones para el ciclo escolar 2026-2027 en educación básica. Aplica para quienes ingresan a 1° de primaria, a 1° de secundaria, o cambian de escuela.',
      'Las fechas exactas y la plataforma de registro dependen de cada entidad; en Dirección te ayudamos a completar el trámite. Los estudiantes de 6° de nuestra escuela tienen lugar asegurado en 1° de secundaria, pero también deben registrarse.',
    ],
    bullets: [
      'Documentos: acta de nacimiento, CURP, comprobante de domicilio y boleta del último grado cursado.',
      'Edad para 1° de primaria: 6 años cumplidos al 31 de diciembre de 2026.',
      'La preinscripción en escuelas públicas no tiene costo.',
    ],
    fileName: 'Guia_Preinscripciones_2026-2027.pdf',
    calendarType: 'entrega',
    calendarLocation: 'Dirección escolar',
  }),
  aviso({
    label: 'Evento',
    title: 'Festival del Día de la Niña y el Niño',
    description: 'Una mañana de juegos, talleres y convivencia para estudiantes de primaria y secundaria.',
    dateISO: '2026-04-30',
    tone: 'blue',
    image: trophyImage,
    fullDescription: [
      'Celebramos el 30 de abril con una jornada de juegos tradicionales, talleres, música y convivencia. Los estudiantes de secundaria organizan y dirigen varias de las estaciones de juego para los grupos de primaria.',
      'Es también un día para recordar los derechos de niñas, niños y adolescentes: a jugar, a aprender, a participar y a ser escuchados.',
    ],
    bullets: [
      'Inicia a las 9:00 AM en la explanada principal.',
      'Asistir con ropa cómoda (no es necesario uniforme).',
      'Las familias están invitadas a partir de las 11:00 AM.',
    ],
    fileName: 'Programa_Dia_Nina_Nino_2026.pdf',
    calendarType: 'evento',
    calendarLocation: 'Explanada principal',
  }),
  aviso({
    label: 'Información',
    title: 'Entrega de documentación de fin de ciclo',
    description: 'Fechas para recoger boletas finales y certificados de 6° de primaria y 3° de secundaria.',
    dateISO: '2026-07-08',
    tone: 'yellow',
    image: notebookImage,
    fullDescription: [
      'Al cierre del ciclo se entregan las boletas finales de todos los grados. Los estudiantes que concluyen 6° de primaria y 3° de secundaria reciben además su certificado de terminación de estudios.',
      'Revisa que el nombre y la CURP del estudiante estén escritos correctamente antes de firmar de recibido.',
    ],
    bullets: [
      'Boletas de 1° a 5° de primaria y 1° y 2° de secundaria: en el salón de cada grupo.',
      'Certificados de 6° y 3°: en Dirección escolar.',
      'Traer identificación oficial de madre, padre o tutor.',
    ],
    fileName: 'Circular_Documentacion_Fin_Ciclo.pdf',
    calendarType: 'entrega',
    calendarLocation: 'Dirección escolar',
  }),
  aviso({
    label: 'Evento',
    title: 'Ceremonia de fin de cursos',
    description: 'Despedimos a la generación que concluye 6° de primaria y 3° de secundaria. ¡Toda la comunidad está invitada!',
    dateISO: '2026-07-10',
    tone: 'blue',
    image: trophyImage,
    fullDescription: [
      'Con una ceremonia sencilla y significativa celebramos a los estudiantes que concluyen una etapa: quienes pasan de la primaria a la secundaria y quienes inician la educación media superior.',
      'Habrá honores a la bandera, entrega simbólica de documentos, reconocimiento a la generación y un mensaje de las y los estudiantes.',
    ],
    bullets: [
      'Inicia a las 9:00 AM en la explanada principal.',
      'Estudiantes de la generación: uniforme de gala.',
      'Máximo 3 acompañantes por estudiante por cuestión de espacio.',
    ],
    fileName: 'Programa_Ceremonia_Fin_Cursos_2026.pdf',
    calendarType: 'evento',
    calendarLocation: 'Explanada principal',
  }),
];

// El carrusel principal y "Próximos avisos" solo muestran los 4 avisos
// más recientes: primero se ordena por fecha (el más actual primero) y,
// si dos avisos caen el mismo día, gana el que se agregó después a este
// arreglo (los últimos en la lista tienen prioridad en el empate, y así
// sucesivamente con los siguientes empates). El resto de los avisos
// sigue disponible en "Todos los Anuncios".
const carouselAnnouncements = announcements
  .map((announcement, addedOrder) => ({ announcement, addedOrder }))
  .sort((a, b) => {
    const byDate = new Date(b.announcement.dateISO).getTime() - new Date(a.announcement.dateISO).getTime();
    if (byDate !== 0) return byDate;
    return b.addedOrder - a.addedOrder;
  })
  .map((entry) => entry.announcement)
  .slice(0, 4);

const navItems = ['Inicio', 'Nosotros', 'Actividades', 'Eventos', 'Calendario', 'Seguimiento', 'Galería', 'Boletín Escolar', 'Contacto'];

// Un solo enlace, para todo el sitio: todos los botones "Contáctame" abren
// el grupo de WhatsApp de la escuela en una pestaña nueva. Sustituir por el
// enlace real del grupo antes de publicar el sitio.
const WHATSAPP_GROUP_LINK = 'https://chat.whatsapp.com/PLACEHOLDER-REEMPLAZAR-CON-ENLACE-REAL';

type QuickLink = {
  tone: 'purple' | 'pink' | 'orange' | 'blue' | 'green';
  icon: string;
  title: string;
  text: string;
  label: string;
};

const quickLinks: QuickLink[] = [
  { tone: 'purple', icon: boletinIcon, title: 'Boletín Escolar', text: 'Noticias, comunicados y avisos relevantes.', label: 'Ir al Boletín' },
  { tone: 'pink', icon: actividadesIcon, title: 'Actividades Escolares', text: 'Conoce las actividades del día a día en clase.', label: 'Ver Actividades' },
  { tone: 'orange', icon: eventosIcon, title: 'Eventos Cívicos y Culturales', text: 'Fechas importantes y eventos escolares.', label: 'Ver Eventos' },
  { tone: 'blue', icon: calendarioIcon, title: 'Calendario Escolar', text: 'Consulta el calendario de actividades y fechas importantes.', label: 'Ver Calendario' },
  { tone: 'green', icon: graficasIcon, title: 'Gráficas de Estudio', text: 'Seguimiento de avances y resultados del grupo.', label: 'Ver Gráficas' },
  { tone: 'purple', icon: galeriaIcon, title: 'Galería de Fotos', text: 'Momentos que nos inspiran.', label: 'Ver Galería' },
];

// Genera una sigla corta (p. ej. "Comprensión Lectora" → "CL") para
// mostrar junto a cada indicador del estudio destacado en la página
// principal, ya que los estudios solo guardan la etiqueta completa.
const siglaFor = (label: string) => {
  const words = label.split(' ').filter((w) => w.length > 2);
  const initials = words.map((w) => w[0]).join('').toUpperCase();
  return (initials || label.slice(0, 2).toUpperCase()).slice(0, 3);
};

type Newsletter = {
  title: string;
  monthLabel: string;
  dateLabel: string;
  dateISO: string;
  tone: 'purple' | 'orange' | 'blue' | 'green';
  category: string;
  description: string;
  messageQuote: string;
  messageAuthor: string;
  // Entrada tipo blog (opcional): secciones con subtítulo y párrafos. Es
  // lo que convierte al boletín en una guía útil para docentes de otras
  // escuelas; se muestra en la página y también se incluye en el PDF.
  article?: { heading: string; paragraphs: string[] }[];
  // Ideas concretas para llevar al aula (opcional).
  classroomTips?: string[];
  highlights: { title: string; description: string; image: string }[];
  bullets: string[];
  fileName: string;
  fileSize: string;
  pages: number;
  publishedBy: string;
};

const newsletters: Newsletter[] = [
  {
    title: 'Boletín Escolar - Septiembre 2025: Evaluación diagnóstica que sí sirve',
    monthLabel: 'Septiembre 2025',
    dateLabel: fechaCorta('2025-09-30'),
    dateISO: '2025-09-30',
    tone: 'blue',
    category: 'Guía docente',
    description: 'Cómo diseñamos una evaluación diagnóstica breve para primaria y secundaria, y cómo la convertimos en un plan de reforzamiento real.',
    messageQuote: 'Un diagnóstico no sirve para etiquetar a nadie: sirve para saber por dónde empezar con cada estudiante.',
    messageAuthor: 'Dirección escolar',
    article: [
      {
        heading: 'Menos pruebas, más información útil',
        paragraphs: [
          'En lugar de aplicar exámenes largos, decidimos evaluar solo tres cosas en las dos primeras semanas: lectura (fluidez y comprensión), escritura (un texto breve libre) y pensamiento matemático (cálculo y resolución de un problema). Con eso tenemos un panorama suficiente para planear el primer trimestre.',
          'En 1° y 2° de primaria, la lectura se evalúa de forma individual, con el estudiante leyendo en voz alta un texto corto. De 3° de primaria a 3° de secundaria, registramos palabras por minuto con un texto adecuado al grado y hacemos tres preguntas de comprensión: una literal, una inferencial y una de opinión.',
        ],
      },
      {
        heading: 'Referentes para la fluidez lectora',
        paragraphs: [
          'Como punto de partida usamos los rangos de los Estándares Nacionales de Habilidad Lectora que publicó la SEP: aproximadamente 35 a 59 palabras por minuto al final de 1° de primaria, 85 a 99 en 3°, 115 a 124 en 5° y alrededor de 155 a 160 al terminar 3° de secundaria. No son metas absolutas, pero ayudan a detectar quién necesita apoyo urgente.',
          'Lo más importante no es la velocidad, sino que el estudiante entienda lo que lee. Un alumno que lee rápido pero no puede contar de qué trató el texto necesita un tipo de apoyo distinto al de uno que lee despacio pero comprende.',
        ],
      },
      {
        heading: 'Del dato al plan',
        paragraphs: [
          'Con los resultados formamos tres grupos de apoyo por nivel (requiere apoyo, en desarrollo, esperado) y los registramos en una tabla sencilla. Cada docente eligió una sola prioridad para el primer trimestre y la compartió en la sesión del Consejo Técnico Escolar.',
          'En secundaria, además, aplicamos un breve cuestionario de hábitos de estudio y bienestar, porque en telesecundaria un mismo docente atiende todas las asignaturas del grupo y conoce de cerca las condiciones de cada estudiante.',
        ],
      },
    ],
    classroomTips: [
      'Usa un solo texto por grado y cronometra 1 minuto de lectura: es rápido y confiable.',
      'Guarda el texto escrito del diagnóstico en el portafolio: al final del ciclo compáralo con uno nuevo.',
      'Comparte con las familias solo 1 o 2 acciones concretas para apoyar en casa.',
    ],
    highlights: [
      { title: 'Fiestas patrias', description: 'Primaria y secundaria celebraron la Independencia con una muestra de juegos y comida tradicional.', image: galleryCivismo },
      { title: 'Simulacro Nacional', description: 'Participamos en el Simulacro Nacional del 19 de septiembre con una evacuación ordenada en menos de 3 minutos.', image: galleryDeportes },
      { title: 'Evaluación diagnóstica', description: 'Todos los grupos concluyeron su diagnóstico de lectura, escritura y matemáticas.', image: galleryLectura },
    ],
    bullets: [
      'Inicio de clases: 1 de septiembre de 2025.',
      'Suspensión por día festivo: martes 16 de septiembre.',
      'Primera sesión de CTE (sin clases): viernes 26 de septiembre.',
      'Reunión de resultados del diagnóstico: 8 de octubre.',
    ],
    fileName: 'boletin_septiembre_2025.pdf',
    fileSize: '1.8 MB',
    pages: 6,
    publishedBy: 'Dirección escolar',
  },
  {
    title: 'Boletín Escolar - Octubre 2025: El Programa Analítico paso a paso',
    monthLabel: 'Octubre 2025',
    dateLabel: fechaCorta('2025-10-30'),
    dateISO: '2025-10-30',
    tone: 'purple',
    category: 'Guía docente',
    description: 'Cómo construimos en colectivo el Programa Analítico de la escuela a partir de los programas sintéticos del Plan de Estudios 2022.',
    messageQuote: 'El programa analítico no es un documento para entregar: es el acuerdo de todo el colectivo sobre qué necesita aprender nuestra comunidad.',
    messageAuthor: 'Dirección escolar',
    article: [
      {
        heading: '¿Qué es el Programa Analítico?',
        paragraphs: [
          'En el Plan de Estudios 2022 de la Nueva Escuela Mexicana, la SEP entrega programas sintéticos con los contenidos y procesos de desarrollo de aprendizaje (PDA) de cada fase. Cada escuela, en su Consejo Técnico, los adapta a su realidad: eso es el Programa Analítico.',
          'Se construye en tres planos: primero, la lectura de la realidad (qué pasa en la comunidad, qué problemas y saberes locales hay); segundo, la contextualización (qué contenidos del programa sintético se relacionan con esa realidad); y tercero, el codiseño (contenidos propios que la escuela agrega).',
        ],
      },
      {
        heading: 'Cómo lo hicimos en una escuela con primaria y telesecundaria',
        paragraphs: [
          'Hicimos un ejercicio de diagnóstico comunitario con estudiantes de 5°, 6° y secundaria: entrevistaron a sus familias sobre los problemas de la comunidad. Los tres temas más mencionados fueron el manejo de la basura, el cuidado del agua y la falta de espacios para jugar.',
          'Después, cada docente buscó en su programa sintético los contenidos que ayudan a trabajar esos temas. En primaria (Fases 3, 4 y 5) y en secundaria (Fase 6) encontramos contenidos en los cuatro campos formativos, lo que nos permitió diseñar un proyecto escolar común con actividades distintas por grado.',
        ],
      },
      {
        heading: 'Errores que evitamos',
        paragraphs: [
          'No copiamos programas analíticos de internet: cada comunidad es distinta. Tampoco intentamos contextualizar todos los contenidos a la vez; elegimos pocos problemas y los trabajamos a fondo durante el ciclo.',
          'El documento se revisa en cada sesión de CTE: si algo no funciona en el aula, se ajusta. Es un documento vivo.',
        ],
      },
    ],
    classroomTips: [
      'Empieza por una pregunta sencilla a tus estudiantes: ¿qué te gustaría cambiar de tu comunidad?',
      'Usa una tabla de 3 columnas: problema de la comunidad · contenido del programa · proyecto posible.',
      'Relaciona cada proyecto con al menos un eje articulador (por ejemplo, vida saludable o pensamiento crítico).',
    ],
    highlights: [
      { title: 'Diagnóstico comunitario', description: 'Estudiantes de secundaria entrevistaron a más de 60 familias sobre los retos de la comunidad.', image: galleryCivismo },
      { title: 'Huerto escolar', description: 'Arrancamos el huerto escolar como proyecto comunitario de primaria y secundaria.', image: galleryCiencias },
      { title: 'Ofrenda en construcción', description: 'Los grupos iniciaron la investigación para la ofrenda de Día de Muertos.', image: galleryArte },
    ],
    bullets: [
      'Reunión de resultados del diagnóstico: 8 de octubre.',
      'Arranque del proyecto de huerto escolar: 20 de octubre.',
      'Ofrenda y calaveritas literarias: jueves 30 de octubre.',
      'Sesión de CTE (sin clases): viernes 31 de octubre.',
    ],
    fileName: 'boletin_octubre_2025.pdf',
    fileSize: '2.0 MB',
    pages: 7,
    publishedBy: 'Dirección escolar',
  },
  {
    title: 'Boletín Escolar - Noviembre 2025: Tradiciones como proyecto interdisciplinario',
    monthLabel: 'Noviembre 2025',
    dateLabel: fechaCorta('2025-11-27'),
    dateISO: '2025-11-27',
    tone: 'orange',
    category: 'Eventos especiales',
    description: 'Día de Muertos, la Revolución Mexicana y el Día Naranja: cómo convertir las fechas del calendario cívico en aprendizajes de varios campos formativos.',
    messageQuote: 'Las fechas cívicas y las tradiciones son una oportunidad para aprender historia, lengua, arte y ciencia al mismo tiempo.',
    messageAuthor: 'Dirección escolar',
    article: [
      {
        heading: 'La ofrenda como proyecto, no solo como adorno',
        paragraphs: [
          'Cada grupo investigó el significado de un elemento de la ofrenda (el agua, la sal, el cempasúchil, el papel picado, el pan). En primaria, los más pequeños dibujaron y explicaron oralmente; en 3° y 4° escribieron fichas informativas; en 5°, 6° y secundaria redactaron textos expositivos y calaveritas literarias.',
          'En secundaria, además, se trabajó el origen prehispánico y colonial de la tradición (Historia), la química del papel y los pigmentos naturales (Ciencias) y la medición y el presupuesto del montaje (Matemáticas). Así un mismo proyecto toca los cuatro campos formativos.',
        ],
      },
      {
        heading: '20 de noviembre: más allá del desfile',
        paragraphs: [
          'Además de la tabla rítmica, cada grupo de secundaria preparó una línea del tiempo ilustrada de la Revolución Mexicana y la presentó a un grupo de primaria. Enseñar a otros es una de las formas más efectivas de aprender.',
        ],
      },
      {
        heading: 'Día Naranja: igualdad de género en el aula',
        paragraphs: [
          'Cada día 25 del mes se conmemora el Día Naranja, promovido por ONU Mujeres para prevenir la violencia contra mujeres y niñas; el 25 de noviembre es además el Día Internacional de la Eliminación de la Violencia contra la Mujer. Trabajamos con actividades por nivel: en primaria, reparto justo de tareas en casa y en el salón; en secundaria, análisis de estereotipos en publicidad y canciones.',
        ],
      },
    ],
    classroomTips: [
      'Asigna a cada grupo un elemento de la ofrenda y pídeles una “ficha de museo” para explicarlo.',
      'Las calaveritas literarias son ideales para practicar rima y métrica en 4° a 6° y en secundaria.',
      'Pide a secundaria que enseñe un tema a primaria: preparan mejor y los pequeños aprenden de un modelo cercano.',
    ],
    highlights: [
      { title: 'Ofrenda monumental', description: 'Primaria y secundaria montaron juntas la ofrenda con fichas explicativas hechas por los estudiantes.', image: galleryArte },
      { title: 'Tabla rítmica', description: 'Los grupos presentaron la tabla rítmica por el aniversario de la Revolución Mexicana.', image: galleryDeportes },
      { title: 'Día Naranja', description: 'Toda la escuela vistió de naranja y participó en actividades por la igualdad.', image: galleryCivismo },
    ],
    bullets: [
      'Suspensión por día festivo: lunes 17 de noviembre.',
      'Día Naranja: martes 25 de noviembre.',
      'Sesión de CTE (sin clases): viernes 28 de noviembre.',
      'Entrega de boletas del primer periodo: 5 de diciembre.',
    ],
    fileName: 'boletin_noviembre_2025.pdf',
    fileSize: '2.3 MB',
    pages: 8,
    publishedBy: 'Dirección escolar',
  },
  {
    title: 'Boletín Escolar - Diciembre 2025: Evaluación formativa y retroalimentación',
    monthLabel: 'Diciembre 2025',
    dateLabel: fechaCorta('2025-12-18'),
    dateISO: '2025-12-18',
    tone: 'green',
    category: 'Logros y reconocimientos',
    description: 'Cerramos el primer periodo con un balance de avances y compartimos cómo usamos la retroalimentación para que la calificación no sea lo único que importa.',
    messageQuote: 'La calificación dice dónde está un estudiante; la retroalimentación le dice cómo avanzar.',
    messageAuthor: 'Dirección escolar',
    article: [
      {
        heading: 'Evaluar para aprender',
        paragraphs: [
          'En la Nueva Escuela Mexicana la evaluación es principalmente formativa: se observa el proceso, se registran evidencias y se da retroalimentación durante el trimestre, no solo al final. La calificación de la boleta resume ese proceso.',
          'Las revisiones de la Education Endowment Foundation (Reino Unido) ubican la retroalimentación de calidad entre las prácticas con mayor impacto y menor costo: en promedio equivale a unos seis meses adicionales de avance en un año escolar.',
        ],
      },
      {
        heading: 'Cómo damos retroalimentación en grupos grandes',
        paragraphs: [
          'Usamos la técnica de “dos estrellas y un deseo”: dos cosas que el estudiante hizo bien y una concreta que puede mejorar. En secundaria, los estudiantes también se evalúan entre pares con una rúbrica sencilla de tres niveles.',
          'Para que la retroalimentación sirva, el estudiante debe tener oportunidad de usarla: reservamos 10 minutos para que corrijan o mejoren su trabajo en la misma semana.',
        ],
      },
    ],
    classroomTips: [
      'Retroalimenta sobre la tarea, no sobre la persona (“tu conclusión no usa datos”, en vez de “no eres bueno en ciencias”).',
      'Una rúbrica de 3 niveles con ejemplos es más útil que una de 5 niveles sin ejemplos.',
      'Pide al estudiante que escriba qué hará distinto la próxima vez.',
    ],
    highlights: [
      { title: 'Cuadro de honor', description: 'Reconocimos a estudiantes por mejora, constancia y compañerismo, no solo por promedio.', image: galleryMatematicas },
      { title: 'Posada escolar', description: 'Cerramos el año con una convivencia organizada por la asociación de familias.', image: galleryArte },
      { title: 'Portafolios', description: 'Cada estudiante presentó a su familia su portafolio de evidencias del trimestre.', image: galleryLectura },
    ],
    bullets: [
      'Entrega de boletas: viernes 5 de diciembre.',
      'Último día de clases del año: viernes 19 de diciembre.',
      'Vacaciones: del 22 de diciembre al 6 de enero.',
      'Regreso de estudiantes: lunes 12 de enero de 2026.',
    ],
    fileName: 'boletin_diciembre_2025.pdf',
    fileSize: '1.9 MB',
    pages: 6,
    publishedBy: 'Dirección escolar',
  },
  {
    title: 'Boletín Escolar - Enero 2026: Las cuatro metodologías sociocríticas',
    monthLabel: 'Enero 2026',
    dateLabel: fechaCorta('2026-01-29'),
    dateISO: '2026-01-29',
    tone: 'purple',
    category: 'Guía docente',
    description: 'Guía práctica de las metodologías que sugiere el Plan de Estudios 2022: cuándo usar cada una y un ejemplo para primaria y otro para secundaria.',
    messageQuote: 'No hay una metodología mejor que otra: hay una más adecuada para lo que queremos que los estudiantes aprendan.',
    messageAuthor: 'Coordinación académica',
    article: [
      {
        heading: '1. Aprendizaje basado en proyectos comunitarios (Lenguajes)',
        paragraphs: [
          'Se organiza en tres fases: planeación (identificar la necesidad y planear), acción (acercarse, comprender, producir y reconocer) e intervención (integrar, difundir y evaluar). Ejemplo en primaria: crear un periódico mural sobre las recetas tradicionales de la comunidad. En secundaria: producir un podcast con entrevistas a personas mayores sobre la historia local.',
        ],
      },
      {
        heading: '2. Indagación con enfoque STEAM (Saberes y Pensamiento Científico)',
        paragraphs: [
          'Parte de una pregunta que los estudiantes pueden investigar: introducción al tema, diseño de la investigación, organización y análisis de datos, presentación de resultados y metacognición. Ejemplo en primaria: ¿por qué unas plantas del huerto crecen más que otras? En secundaria: ¿qué tan limpia está el agua que llega a la escuela?',
        ],
      },
      {
        heading: '3. Aprendizaje basado en problemas (Ética, Naturaleza y Sociedades)',
        paragraphs: [
          'Se presenta un problema real y abierto, los estudiantes lo analizan, investigan, proponen soluciones y las evalúan. Ejemplo en primaria: el salón siempre queda sucio después del recreo. En secundaria: cómo reducir la basura que genera la comunidad escolar.',
        ],
      },
      {
        heading: '4. Aprendizaje servicio (De lo Humano y lo Comunitario)',
        paragraphs: [
          'Los estudiantes aprenden mientras realizan un servicio útil para su comunidad: punto de partida, lo que sé y lo que quiero saber, organización, vivir la experiencia y valoración. Ejemplo en primaria: una campaña de lavado de manos para preescolar. En secundaria: un círculo de lectura para estudiantes de 1° y 2° de primaria.',
        ],
      },
    ],
    classroomTips: [
      'Elige la metodología según el campo formativo principal del proyecto, pero no te limites: se pueden combinar.',
      'Un proyecto bien hecho de 3 semanas vale más que tres proyectos apresurados.',
      'Cierra siempre con metacognición: ¿qué aprendí?, ¿cómo lo aprendí?, ¿para qué me sirve?',
    ],
    highlights: [
      { title: 'Taller intensivo', description: 'El colectivo docente trabajó del 7 al 9 de enero en la mejora de sus proyectos.', image: galleryLectura },
      { title: 'Círculos de estudio', description: 'Iniciamos la tutoría entre pares: secundaria apoya a primaria en lectura.', image: galleryCiencias },
      { title: 'Regreso a clases', description: 'Recibimos a los estudiantes con una semana de repaso y reencuentro.', image: galleryDeportes },
    ],
    bullets: [
      'Regreso a clases: lunes 12 de enero.',
      'Inicio de círculos de estudio entre pares: 21 de enero.',
      'Sesión de CTE (sin clases): viernes 30 de enero.',
      'Suspensión por día festivo: lunes 2 de febrero.',
    ],
    fileName: 'boletin_enero_2026.pdf',
    fileSize: '2.2 MB',
    pages: 8,
    publishedBy: 'Coordinación académica',
  },
  {
    title: 'Boletín Escolar - Febrero 2026: Leer todos los días',
    monthLabel: 'Febrero 2026',
    dateLabel: fechaCorta('2026-02-26'),
    dateISO: '2026-02-26',
    tone: 'orange',
    category: 'Actividades escolares',
    description: 'Día de la Bandera, Día Internacional de la Lengua Materna y nuestra estrategia de 20 minutos diarios de lectura en toda la escuela.',
    messageQuote: 'Un estudiante que lee todos los días tiene en sus manos la llave de todas las demás materias.',
    messageAuthor: 'Dirección escolar',
    article: [
      {
        heading: '20 minutos que cambian el día',
        paragraphs: [
          'Desde febrero, toda la escuela dedica los primeros 20 minutos después del recreo a la lectura. En 1° y 2° de primaria el docente lee en voz alta y conversa con el grupo; de 3° a 6° alternamos lectura en voz alta, lectura en parejas y lectura independiente; en secundaria cada estudiante elige un libro de la biblioteca de aula.',
          'La lectura en voz alta por parte del docente es valiosa en todos los grados, también en secundaria: modela la entonación, amplía el vocabulario y despierta el gusto por los textos que los estudiantes todavía no pueden leer solos.',
        ],
      },
      {
        heading: 'Lengua materna e interculturalidad',
        paragraphs: [
          'El 21 de febrero es el Día Internacional de la Lengua Materna, proclamado por la UNESCO. En México se reconocen 68 lenguas indígenas nacionales. Invitamos a familias hablantes a compartir palabras, cuentos y canciones, y los estudiantes elaboraron un pequeño diccionario ilustrado.',
        ],
      },
    ],
    classroomTips: [
      'Lee en voz alta a tu grupo al menos 3 veces por semana, sin importar el grado.',
      'Deja que los estudiantes abandonen un libro que no les gusta: el objetivo es crear lectores.',
      'Registra en una tabla cuántos libros lee el grupo al mes y celebra las metas colectivas.',
    ],
    highlights: [
      { title: 'Día de la Bandera', description: 'Abanderamiento de la nueva escolta con la participación de primaria y secundaria.', image: galleryCivismo },
      { title: 'Lengua materna', description: 'Familias compartieron cuentos y canciones en lenguas originarias.', image: galleryLectura },
      { title: 'Asamblea escolar', description: 'Secundaria presentó propuestas para reducir la basura en la escuela.', image: galleryCiencias },
    ],
    bullets: [
      'Preinscripciones ciclo 2026-2027: durante febrero.',
      'Asamblea escolar sobre residuos: 18 de febrero.',
      'Día de la Bandera: martes 24 de febrero.',
      'Sesión de CTE (sin clases): viernes 27 de febrero.',
    ],
    fileName: 'boletin_febrero_2026.pdf',
    fileSize: '1.7 MB',
    pages: 6,
    publishedBy: 'Dirección escolar',
  },
  {
    title: 'Boletín Escolar - Marzo 2026: Estrategias para aula multigrado y telesecundaria',
    monthLabel: 'Marzo 2026',
    dateLabel: fechaCorta('2026-03-26'),
    dateISO: '2026-03-26',
    tone: 'blue',
    category: 'Guía docente',
    description: 'Lo que nos ha funcionado cuando un solo docente atiende varios grados o todas las asignaturas de un grupo.',
    messageQuote: 'En un aula con distintos niveles, la diversidad no es un problema que resolver: es un recurso para aprender unos de otros.',
    messageAuthor: 'Coordinación académica',
    article: [
      {
        heading: 'Tema común, actividades diferenciadas',
        paragraphs: [
          'En grupos multigrado de primaria planeamos un mismo tema para todo el grupo (por ejemplo, “el agua en nuestra comunidad”) y actividades distintas por nivel: los más pequeños dibujan y describen, los de en medio registran datos, los mayores explican causas y proponen soluciones. Todos comparten al final.',
          'Esta organización permite que el docente atienda de forma directa a un subgrupo mientras los otros trabajan con indicaciones claras y materiales preparados.',
        ],
      },
      {
        heading: 'El modelo de telesecundaria',
        paragraphs: [
          'La telesecundaria nació en México en 1968 para llevar la secundaria a comunidades rurales. Su rasgo distintivo es que un solo docente atiende todas las asignaturas de un grupo, apoyado por materiales audiovisuales y libros propios del modelo. Hoy es una de las modalidades de secundaria con más escuelas en el país.',
          'Esta característica es una ventaja: el docente puede diseñar proyectos que integren varias disciplinas sin coordinarse con otros profesores. Los videos son un apoyo, no la clase completa: funcionan mejor cuando se usan para detonar una pregunta o mostrar un fenómeno que no se puede observar en el aula.',
        ],
      },
      {
        heading: 'Tutoría entre pares',
        paragraphs: [
          'Organizamos parejas o tríos donde un estudiante más avanzado apoya a otro. La evidencia internacional (Education Endowment Foundation) indica que la tutoría entre pares bien estructurada beneficia a ambos: al que aprende y al que enseña. La clave es dar al tutor una guía breve y rotar los roles.',
        ],
      },
    ],
    classroomTips: [
      'Prepara “tarjetas de trabajo autónomo” por nivel para los momentos en que atiendes a otro subgrupo.',
      'Usa el video al inicio (para preguntar) o a la mitad (para explicar), no al final.',
      'Coloca en la pared una lista de “qué hago si termino” para evitar tiempos muertos.',
    ],
    highlights: [
      { title: 'Rally matemático', description: 'Equipos mixtos de primaria y secundaria resolvieron retos en 8 estaciones.', image: galleryMatematicas },
      { title: 'Desfile de primavera', description: 'Primaria recibió la primavera con un recorrido por la comunidad.', image: galleryArte },
      { title: 'Ceremonia 21 de marzo', description: 'Recordamos a Benito Juárez con una lectura de su biografía en voz alta.', image: galleryCivismo },
    ],
    bullets: [
      'Rally matemático: jueves 5 de marzo.',
      'Suspensión por día festivo: lunes 16 de marzo.',
      'Sesión de CTE (sin clases): viernes 27 de marzo.',
      'Vacaciones de primavera: del 30 de marzo al 10 de abril.',
    ],
    fileName: 'boletin_marzo_2026.pdf',
    fileSize: '2.1 MB',
    pages: 7,
    publishedBy: 'Coordinación académica',
  },
  {
    title: 'Boletín Escolar - Mayo 2026: Ciencia en la escuela con enfoque STEAM',
    monthLabel: 'Mayo 2026',
    dateLabel: fechaCorta('2026-05-28'),
    dateISO: '2026-05-28',
    tone: 'orange',
    category: 'Actividades escolares',
    description: 'Cómo organizamos la Feria de Ciencias para que todos los grados participen con proyectos de indagación, y lo que vivimos en abril y mayo.',
    messageQuote: 'La ciencia empieza con una pregunta hecha por un estudiante curioso: nuestro trabajo es no apagarla.',
    messageAuthor: 'Dirección escolar',
    article: [
      {
        heading: 'Una feria donde todos investigan',
        paragraphs: [
          'En lugar de premiar solo los proyectos más vistosos, pedimos que cada proyecto siga un ciclo de indagación: pregunta, predicción, experimento o registro, datos y conclusión. Usamos como guía el modelo de las 5E (enganchar, explorar, explicar, elaborar y evaluar), muy difundido en la enseñanza de las ciencias.',
          'En 1° y 2° de primaria los proyectos se hicieron en grupo con apoyo del docente (por ejemplo, qué objetos flotan). De 3° a 6° en equipos, con registro en tablas y gráficas sencillas. En secundaria, con variables controladas y conclusión escrita.',
        ],
      },
      {
        heading: 'Integrar arte, tecnología y matemáticas',
        paragraphs: [
          'El enfoque STEAM suma ciencia, tecnología, ingeniería, arte y matemáticas. En la práctica, cada equipo diseñó su cartel (arte), construyó un prototipo o instrumento (tecnología e ingeniería) y analizó sus datos con porcentajes o promedios (matemáticas).',
        ],
      },
    ],
    classroomTips: [
      'Pide a los estudiantes que escriban su predicción antes del experimento: así se ve lo que aprendieron.',
      'Evalúa el proceso con una lista de cotejo, no solo el cartel final.',
      'Invita a familias como público: explicar a otros consolida el aprendizaje.',
    ],
    highlights: [
      { title: 'Día de la Niña y el Niño', description: 'Secundaria organizó estaciones de juegos tradicionales para primaria.', image: galleryDeportes },
      { title: 'Maratón de lectura', description: 'Por el Día Mundial del Libro leímos durante toda la mañana en voz alta.', image: galleryLectura },
      { title: 'Feria de Ciencias', description: '32 proyectos de indagación presentados por todos los grados.', image: galleryCiencias },
    ],
    bullets: [
      'Día de las Madres: festival el viernes 8 de mayo.',
      'Suspensiones oficiales: 1, 5 y 15 de mayo.',
      'Feria de Ciencias: jueves 28 de mayo.',
      'Sesión de CTE (sin clases): viernes 29 de mayo.',
    ],
    fileName: 'boletin_mayo_2026.pdf',
    fileSize: '2.4 MB',
    pages: 8,
    publishedBy: 'Dirección escolar',
  },
  {
    title: 'Boletín Escolar - Junio 2026: Acompañar las transiciones',
    monthLabel: 'Junio 2026',
    dateLabel: fechaCorta('2026-06-25'),
    dateISO: '2026-06-25',
    tone: 'green',
    category: 'Comunicados generales',
    description: 'Cómo preparamos a los estudiantes de 6° de primaria para la secundaria y a los de 3° de secundaria para la educación media superior.',
    messageQuote: 'Cambiar de nivel es un gran paso; acompañarlo bien hace la diferencia entre el miedo y la ilusión.',
    messageAuthor: 'Dirección escolar',
    article: [
      {
        heading: 'De 6° de primaria a 1° de secundaria',
        paragraphs: [
          'Tener primaria y telesecundaria en la misma escuela es una gran ventaja: organizamos visitas de los grupos de 6° a las aulas de 1° de secundaria, donde los estudiantes mayores les explican cómo es un día de clases, cómo se usan los materiales y qué cambia.',
          'También trabajamos habilidades de organización: agenda de tareas, cómo estudiar para una evaluación y cómo pedir ayuda. Son pequeños hábitos que reducen la ansiedad del cambio.',
        ],
      },
      {
        heading: 'De 3° de secundaria a la media superior',
        paragraphs: [
          'Acompañamos a los estudiantes en el proceso de registro a bachillerato, que varía por entidad, y dedicamos sesiones de tutoría a la orientación vocacional: intereses, habilidades y opciones de bachillerato general, tecnológico o técnico cercanas a la comunidad.',
          'Hablamos también de la importancia de no abandonar los estudios. El acompañamiento de familias y docentes en este momento es clave para que los jóvenes continúen.',
        ],
      },
    ],
    classroomTips: [
      'Organiza un “día de intercambio” entre el último grado de un nivel y el primero del siguiente.',
      'Pide a los estudiantes de 3° que escriban una carta a quienes entran a 1°: es un gran ejercicio de escritura.',
      'Comparte con las familias las fechas de registro de su entidad con tiempo.',
    ],
    highlights: [
      { title: 'Visita a secundaria', description: 'Los grupos de 6° vivieron un día de clases en telesecundaria.', image: galleryLectura },
      { title: 'Día del Medio Ambiente', description: 'Primera cosecha del huerto escolar el 5 de junio.', image: galleryCiencias },
      { title: 'Convivencia deportiva', description: 'Torneo de fin de ciclo entre todos los grupos.', image: galleryDeportes },
    ],
    bullets: [
      'Día Mundial del Medio Ambiente: viernes 5 de junio.',
      'Sesión de CTE (sin clases): viernes 26 de junio.',
      'Entrega de documentación de fin de ciclo: 8 de julio.',
      'Ceremonia de fin de cursos: 10 de julio. Último día de clases: 15 de julio.',
    ],
    fileName: 'boletin_junio_2026.pdf',
    fileSize: '1.9 MB',
    pages: 6,
    publishedBy: 'Dirección escolar',
  },
];

const newsletterCategories = Array.from(new Set(newsletters.map((n) => n.category)));

/* =========================================================================
   Calendario Escolar
   ========================================================================= */

type CalendarEventType = 'festivo' | 'suspension' | 'examen' | 'entrega' | 'evento' | 'reunion';

type CalendarEvent = {
  title: string;
  dateISO: string;
  type: CalendarEventType;
  description?: string;
  location?: string;
  announcement?: Announcement;
  activity?: ActivityEntry;
  evento?: ActivityEntry;
};

const eventTypeInfo: Record<CalendarEventType, { label: string; description: string }> = {
  festivo: { label: 'Días festivos', description: 'Días oficiales de descanso.' },
  suspension: { label: 'Suspensiones', description: 'Suspensión de clases.' },
  examen: { label: 'Exámenes', description: 'Periodos de evaluación.' },
  entrega: { label: 'Entregas', description: 'Entrega de calificaciones y documentos.' },
  evento: { label: 'Eventos', description: 'Eventos escolares especiales.' },
  reunion: { label: 'Reuniones', description: 'Reuniones y juntas importantes.' },
};

// Fechas oficiales del ciclo escolar 2025-2026 (calendario de la SEP para
// educación básica, publicado en el DOF): inicio y fin de clases, días de
// descanso, vacaciones, sesiones del Consejo Técnico Escolar y taller
// intensivo. La sesión de CTE del 26 de septiembre no está aquí porque ya
// tiene su propio aviso (y todo aviso entra solo al calendario).
const fixedCalendarEvents: CalendarEvent[] = [
  { title: 'Fase intensiva del Consejo Técnico Escolar', dateISO: '2025-08-25', type: 'reunion', description: 'Del 25 al 29 de agosto: el colectivo docente planea el ciclo escolar antes del regreso de los estudiantes.' },
  { title: 'Día de la Independencia', dateISO: '2025-09-16', type: 'festivo', description: 'Día oficial de descanso. No hay clases.' },
  { title: 'Periodo de evaluación diagnóstica', dateISO: '2025-09-08', type: 'examen', description: 'Semanas 2 y 3 del ciclo: diagnóstico de lectura, escritura y matemáticas en primaria y secundaria.' },
  { title: 'Consejo Técnico Escolar (2ª sesión)', dateISO: '2025-10-31', type: 'suspension', description: 'Sesión ordinaria del CTE. No hay clases.' },
  { title: 'Aniversario de la Revolución Mexicana', dateISO: '2025-11-17', type: 'festivo', description: 'Descanso oficial (tercer lunes de noviembre). No hay clases.' },
  { title: 'Cierre del primer periodo de evaluación', dateISO: '2025-11-21', type: 'examen', description: 'Últimas actividades de evaluación formativa del primer trimestre.' },
  { title: 'Consejo Técnico Escolar (3ª sesión)', dateISO: '2025-11-28', type: 'suspension', description: 'Sesión ordinaria del CTE. No hay clases.' },
  { title: 'Inicio de vacaciones de invierno', dateISO: '2025-12-22', type: 'festivo', description: 'Del 22 de diciembre de 2025 al 6 de enero de 2026.' },
  { title: 'Taller intensivo de formación docente', dateISO: '2026-01-07', type: 'reunion', description: 'Del 7 al 9 de enero. Solo personal docente; los estudiantes regresan el 12 de enero.' },
  { title: 'Regreso a clases', dateISO: '2026-01-12', type: 'evento', description: 'Los estudiantes regresan a clases después de las vacaciones de invierno.' },
  { title: 'Consejo Técnico Escolar (4ª sesión)', dateISO: '2026-01-30', type: 'suspension', description: 'Sesión ordinaria del CTE. No hay clases.' },
  { title: 'Día de la Constitución', dateISO: '2026-02-02', type: 'festivo', description: 'Descanso oficial (primer lunes de febrero). No hay clases.' },
  { title: 'Consejo Técnico Escolar (5ª sesión)', dateISO: '2026-02-27', type: 'suspension', description: 'Sesión ordinaria del CTE. No hay clases.' },
  { title: 'Natalicio de Benito Juárez', dateISO: '2026-03-16', type: 'festivo', description: 'Descanso oficial (tercer lunes de marzo). No hay clases.' },
  { title: 'Cierre del segundo periodo de evaluación', dateISO: '2026-03-20', type: 'examen', description: 'Últimas actividades de evaluación formativa del segundo trimestre.' },
  { title: 'Consejo Técnico Escolar (6ª sesión)', dateISO: '2026-03-27', type: 'suspension', description: 'Sesión ordinaria del CTE. No hay clases.' },
  { title: 'Inicio de vacaciones de primavera', dateISO: '2026-03-30', type: 'festivo', description: 'Del 30 de marzo al 10 de abril. Regreso a clases el lunes 13 de abril.' },
  { title: 'Día del Trabajo', dateISO: '2026-05-01', type: 'festivo', description: 'Día oficial de descanso. No hay clases.' },
  { title: 'Batalla de Puebla', dateISO: '2026-05-05', type: 'festivo', description: 'Suspensión de labores según el calendario oficial.' },
  { title: 'Día del Maestro', dateISO: '2026-05-15', type: 'festivo', description: 'Suspensión de labores según el calendario oficial.' },
  { title: 'Consejo Técnico Escolar (7ª sesión)', dateISO: '2026-05-29', type: 'suspension', description: 'Sesión ordinaria del CTE. No hay clases.' },
  { title: 'Evaluación final del ciclo', dateISO: '2026-06-15', type: 'examen', description: 'Periodo de cierre de la evaluación del tercer trimestre.' },
  { title: 'Consejo Técnico Escolar (8ª sesión)', dateISO: '2026-06-26', type: 'suspension', description: 'Última sesión ordinaria del CTE del ciclo. No hay clases.' },
  { title: 'Fin del ciclo escolar 2025-2026', dateISO: '2026-07-15', type: 'evento', description: 'Último día de clases del ciclo escolar.' },
];

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WEEKDAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const monthKeyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}`;
const formatMonthLabel = (d: Date) => `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
const formatFullDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} de ${MONTH_NAMES[m - 1].toLowerCase()} de ${y}`;
};

// Ciclo escolar 2025-2026: de agosto de 2025 a julio de 2026, para el
// selector de mes. new Date normaliza el desbordamiento de mes (mes 19 →
// julio del año siguiente), así que esto genera los 12 meses en orden.
const schoolCycleMonths = Array.from({ length: 12 }, (_, i) => new Date(2025, 7 + i, 1));

function buildMonthMatrix(year: number, monthIndex0: number) {
  const startWeekday = new Date(year, monthIndex0, 1).getDay();
  const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndex0, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  const cells: { day: number; inMonth: boolean; dateISO: string }[] = [];
  for (let i = 0; i < totalCells; i++) {
    const cellIndex = i - startWeekday + 1;
    if (cellIndex < 1) {
      const day = daysInPrevMonth + cellIndex;
      cells.push({ day, inMonth: false, dateISO: isoDate(new Date(year, monthIndex0 - 1, day)) });
    } else if (cellIndex > daysInMonth) {
      const day = cellIndex - daysInMonth;
      cells.push({ day, inMonth: false, dateISO: isoDate(new Date(year, monthIndex0 + 1, day)) });
    } else {
      cells.push({ day: cellIndex, inMonth: true, dateISO: isoDate(new Date(year, monthIndex0, cellIndex)) });
    }
  }
  return cells;
}

/* =========================================================================
   Gráficas de Estudios
   ========================================================================= */

// Cada indicador siempre trae "before" (el valor de partida) y "percentage"
// (el valor actual), porque cada estudio siempre muestra dos gráficas que
// se complementan: una barra de progreso con el valor actual y una gráfica
// de comparación "antes / después" con el mismo indicador — nunca solo una.
type StudyMetric = { label: string; percentage: number; before: number; color: string };

type Study = {
  title: string;
  category: string;
  dateISO: string;
  dateLabel: string;
  readTime: string;
  description: string;
  fullDescription: string[];
  highlight: string;
  metrics: StudyMetric[];
  icon: 'chart' | 'brain' | 'target' | 'people' | 'idea';
  // Opcionales, pensados para que otros docentes puedan replicar el
  // estudio: los pasos que seguimos y las referencias en que se basa.
  steps?: string[];
  sources?: string[];
  // Bandera opcional: si algún estudio la trae en true, ese es el que se
  // muestra en la página principal, sin importar fecha. Si ninguno la
  // trae, se usa el más reciente por fecha y, en caso de empate, el
  // último agregado a este arreglo (mismo criterio que el carrusel de
  // avisos).
  featured?: boolean;
};

// Nota: las cifras de cada estudio son del seguimiento interno de nuestros
// grupos (porcentaje de estudiantes que alcanzan el nivel esperado en cada
// indicador, al inicio y al final de la intervención). Las metodologías y
// las referencias sí son reales y se pueden consultar.
const studies: Study[] = [
  {
    title: 'Balance del ciclo 2025-2026: primaria y secundaria',
    category: 'Avances del grupo',
    dateISO: '2026-07-03',
    dateLabel: fechaCorta('2026-07-03'),
    readTime: '8 min de lectura',
    description: 'Comparativo entre la evaluación diagnóstica de septiembre y la evaluación final de junio en los indicadores que la escuela priorizó en su Programa Analítico.',
    fullDescription: [
      'En septiembre elegimos cuatro indicadores comunes para toda la escuela: comprensión lectora, resolución de problemas matemáticos, producción de textos y convivencia. Medimos el porcentaje de estudiantes que alcanzaba el nivel esperado para su grado en la evaluación diagnóstica y volvimos a medir en junio con instrumentos equivalentes.',
      'El mayor avance se dio en comprensión lectora, que coincide con la estrategia de 20 minutos diarios de lectura iniciada en febrero. Matemáticas mejoró, pero sigue siendo la prioridad para el siguiente ciclo, especialmente en fracciones (5° y 6° de primaria) y álgebra (2° y 3° de secundaria).',
      'Los resultados se revisaron en la última sesión del Consejo Técnico Escolar y sirven como punto de partida para el Programa Analítico del ciclo 2026-2027.',
    ],
    highlight: 'Priorizar pocas metas comunes, medirlas igual al inicio y al final, y revisarlas en cada CTE permitió que toda la escuela avanzara en la misma dirección.',
    metrics: [
      { label: 'Comprensión Lectora', percentage: 74, before: 48, color: '#43ba58' },
      { label: 'Resolución de problemas', percentage: 63, before: 41, color: '#4295ed' },
      { label: 'Producción de textos', percentage: 68, before: 45, color: '#f5a623' },
      { label: 'Convivencia escolar', percentage: 86, before: 70, color: '#fb3d96' },
    ],
    icon: 'chart',
    steps: [
      'Elegir en CTE de 3 a 4 indicadores comunes para todos los grados.',
      'Definir qué significa “nivel esperado” en cada grado (con los programas sintéticos como referencia).',
      'Aplicar instrumentos breves y equivalentes en septiembre y junio.',
      'Revisar avances parciales en las sesiones de noviembre y marzo.',
    ],
    sources: [
      'SEP (2022). Plan de Estudio para la educación preescolar, primaria y secundaria.',
      'SEP. Orientaciones para las sesiones del Consejo Técnico Escolar, ciclo 2025-2026.',
    ],
  },
  {
    title: 'Lectura repetida para mejorar la fluidez (1° a 3° de primaria)',
    category: 'Lectura',
    dateISO: '2026-05-15',
    dateLabel: fechaCorta('2026-05-15'),
    readTime: '7 min de lectura',
    description: 'Durante 10 semanas aplicamos lectura repetida y lectura en voz alta modelada con los estudiantes que leían por debajo de lo esperado para su grado.',
    fullDescription: [
      'La lectura repetida consiste en leer el mismo texto corto varias veces (3 o 4) a lo largo de la semana, con modelado previo del docente y retroalimentación. Es una de las estrategias con más respaldo en la investigación para mejorar la fluidez lectora en los primeros grados.',
      'Trabajamos 15 minutos diarios con subgrupos de 4 a 6 estudiantes mientras el resto del grupo realizaba lectura independiente. Cada viernes el estudiante registraba en una gráfica sus palabras por minuto, lo que resultó muy motivador.',
      'La mejora en fluidez se acompañó de una mejora en comprensión: al leer con menos esfuerzo, los estudiantes pueden poner atención al significado del texto.',
    ],
    highlight: 'Que cada estudiante grafique su propio avance semanal fue tan importante como la estrategia misma: ver el progreso motiva a seguir leyendo.',
    metrics: [
      { label: 'Fluidez en nivel esperado', percentage: 71, before: 38, color: '#43ba58' },
      { label: 'Comprensión literal', percentage: 78, before: 55, color: '#4295ed' },
      { label: 'Gusto por la lectura', percentage: 84, before: 60, color: '#f5a623' },
    ],
    icon: 'target',
    steps: [
      'Elegir textos cortos (80 a 150 palabras) adecuados al grado.',
      'Lunes: el docente lee en voz alta como modelo; el estudiante sigue con el dedo.',
      'Martes a jueves: el estudiante relee en parejas o con el docente, con retroalimentación.',
      'Viernes: lectura cronometrada de 1 minuto y registro en su gráfica personal.',
    ],
    sources: [
      'SEP (2011). Estándares Nacionales de Habilidad Lectora.',
      'National Reading Panel (2000). Teaching Children to Read. NICHD, EUA.',
    ],
  },
  {
    title: 'Enseñar en el nivel adecuado: matemáticas en grupos multigrado',
    category: 'Estrategias',
    dateISO: '2026-04-24',
    dateLabel: fechaCorta('2026-04-24'),
    readTime: '7 min de lectura',
    description: 'Agrupamos a estudiantes de 3° a 6° de primaria por nivel de dominio y no por grado durante una hora diaria de matemáticas.',
    fullDescription: [
      'La metodología “Enseñar en el nivel adecuado” (Teaching at the Right Level, TaRL) fue desarrollada por la organización Pratham en India y evaluada en varias ocasiones por J-PAL con resultados muy positivos. Consiste en evaluar rápido a los estudiantes, agruparlos por lo que ya saben hacer y trabajar con actividades a su nivel, sin importar el grado.',
      'En nuestra escuela formamos cuatro niveles: conteo y valor posicional, suma y resta, multiplicación y división, y problemas con fracciones. Cada seis semanas se reevaluó y los estudiantes cambiaban de grupo al avanzar.',
      'Es una estrategia muy adecuada para escuelas multigrado, donde la diferencia de niveles ya es parte de la realidad del aula.',
    ],
    highlight: 'Trabajar al nivel real del estudiante, y no al del libro de su grado, permitió que quienes estaban más atrasados avanzaran más rápido.',
    metrics: [
      { label: 'Dominio de operaciones básicas', percentage: 72, before: 44, color: '#4295ed' },
      { label: 'Resolución de problemas', percentage: 61, before: 37, color: '#4e21c1' },
      { label: 'Confianza en matemáticas', percentage: 76, before: 52, color: '#43ba58' },
    ],
    icon: 'people',
    steps: [
      'Aplicar una evaluación oral breve (5 minutos por estudiante).',
      'Formar grupos por nivel de dominio, no por grado.',
      'Trabajar con material concreto y juegos, 1 hora diaria.',
      'Reevaluar cada 6 semanas y mover a los estudiantes de grupo.',
    ],
    sources: [
      'J-PAL. Teaching at the Right Level: evidencia y guías de implementación (povertyactionlab.org).',
      'Banerjee, A. et al. (2016). Mainstreaming an Effective Intervention: Evidence from Randomized Evaluations of “Teaching at the Right Level” in India.',
    ],
  },
  {
    title: 'Fracciones con el enfoque concreto-pictórico-abstracto',
    category: 'Matemáticas',
    dateISO: '2026-03-13',
    dateLabel: fechaCorta('2026-03-13'),
    readTime: '6 min de lectura',
    description: 'Secuencia para enseñar fracciones en 5° y 6° de primaria y 1° de secundaria usando material manipulable, dibujos y, al final, símbolos.',
    fullDescription: [
      'El enfoque concreto-pictórico-abstracto (CPA), popularizado por el llamado “método Singapur”, propone que los estudiantes primero manipulen objetos (tiras de papel, regletas, fichas), después representen con dibujos y modelos de barras, y solo al final trabajen con la notación simbólica.',
      'Durante cuatro semanas trabajamos fracciones equivalentes, comparación y suma de fracciones con este orden. En 1° de secundaria se usó como repaso antes de iniciar con números racionales y proporcionalidad.',
    ],
    highlight: 'El modelo de barras fue la herramienta que más ayudó a los estudiantes a entender problemas verbales con fracciones.',
    metrics: [
      { label: 'Fracciones equivalentes', percentage: 77, before: 46, color: '#4295ed' },
      { label: 'Comparación de fracciones', percentage: 70, before: 42, color: '#f5a623' },
      { label: 'Problemas con fracciones', percentage: 58, before: 33, color: '#fb3d96' },
    ],
    icon: 'idea',
    steps: [
      'Concreto: doblar y cortar tiras de papel del mismo tamaño en medios, tercios, cuartos.',
      'Pictórico: dibujar las tiras y usar modelos de barras para resolver problemas.',
      'Abstracto: pasar a la escritura numérica cuando el estudiante explica con dibujos.',
      'Cerrar cada sesión pidiendo que expliquen su procedimiento a un compañero.',
    ],
    sources: [
      'Bruner, J. (1966). Toward a Theory of Instruction. Harvard University Press.',
      'Ministry of Education Singapore. Mathematics Syllabus (Primary).',
    ],
  },
  {
    title: 'Indagación con el modelo 5E en Ciencias de secundaria',
    category: 'Ciencias',
    dateISO: '2026-02-20',
    dateLabel: fechaCorta('2026-02-20'),
    readTime: '6 min de lectura',
    description: 'Aplicamos el ciclo de indagación de las 5E en proyectos de Biología, Física y Química en los tres grados de telesecundaria.',
    fullDescription: [
      'El modelo 5E (enganchar, explorar, explicar, elaborar y evaluar) fue desarrollado por el Biological Sciences Curriculum Study (BSCS) y es compatible con la metodología de indagación con enfoque STEAM que sugiere el Plan de Estudios 2022 para el campo de Saberes y Pensamiento Científico.',
      'Cada proyecto partió de una pregunta cercana a la comunidad: ¿qué tan limpia está el agua del pozo? (1°), ¿cómo conviene poner un techo para que dé menos calor? (2°), ¿qué pasa con la basura orgánica si la enterramos? (3°).',
      'El video de telesecundaria se usó en la fase de explicar, después de que los estudiantes ya habían explorado el fenómeno por sí mismos.',
    ],
    highlight: 'Cuando el estudiante explora antes de que se le explique, la explicación posterior tiene mucho más sentido para él.',
    metrics: [
      { label: 'Formula preguntas investigables', percentage: 69, before: 35, color: '#43ba58' },
      { label: 'Registra y analiza datos', percentage: 72, before: 47, color: '#4295ed' },
      { label: 'Argumenta con evidencia', percentage: 60, before: 34, color: '#4e21c1' },
    ],
    icon: 'brain',
    steps: [
      'Enganchar: una pregunta o fenómeno sorprendente de la comunidad.',
      'Explorar: los estudiantes experimentan y registran antes de recibir la explicación.',
      'Explicar: se formaliza el concepto (aquí entra el video o el libro).',
      'Elaborar: aplican lo aprendido a una situación nueva. Evaluar: rúbrica y autoevaluación.',
    ],
    sources: [
      'Bybee, R. et al. (2006). The BSCS 5E Instructional Model: Origins and Effectiveness.',
      'SEP (2022). Plan de Estudio: metodología de indagación con enfoque STEAM.',
    ],
  },
  {
    title: 'Tutoría entre pares: secundaria apoya a primaria',
    category: 'Aprendizaje',
    dateISO: '2026-01-23',
    dateLabel: fechaCorta('2026-01-23'),
    readTime: '5 min de lectura',
    description: 'Estudiantes de 2° y 3° de secundaria fueron tutores de lectura de estudiantes de 1° a 3° de primaria dos veces por semana.',
    fullDescription: [
      'La tutoría entre pares es una de las estrategias con mejor relación costo-beneficio según el Teaching and Learning Toolkit de la Education Endowment Foundation, con un impacto promedio cercano a cinco meses adicionales de avance. Beneficia tanto al tutorado como al tutor.',
      'Cada tutor recibió una capacitación de dos sesiones y una tarjeta con cuatro pasos: leer juntos, preguntar, elogiar y registrar. Las sesiones duraban 20 minutos.',
      'Tener primaria y secundaria en la misma escuela hizo posible esta estrategia sin costo adicional, y fortaleció la convivencia entre niveles.',
    ],
    highlight: 'Los tutores de secundaria mejoraron su propia comprensión lectora y su sentido de responsabilidad: enseñar también es aprender.',
    metrics: [
      { label: 'Fluidez de los tutorados', percentage: 66, before: 40, color: '#43ba58' },
      { label: 'Comprensión de los tutores', percentage: 73, before: 58, color: '#4295ed' },
      { label: 'Sentido de pertenencia', percentage: 88, before: 64, color: '#fb3d96' },
    ],
    icon: 'people',
    steps: [
      'Formar parejas estables por 6 semanas y rotar después.',
      'Capacitar a los tutores con una guía de 4 pasos.',
      'Sesiones cortas (20 minutos), dos veces por semana, siempre a la misma hora.',
      'Reconocer públicamente a los tutores al final del periodo.',
    ],
    sources: [
      'Education Endowment Foundation. Teaching and Learning Toolkit: Peer tutoring.',
      'Topping, K. (2005). Trends in Peer Learning. Educational Psychology, 25(6).',
    ],
  },
  {
    title: 'Práctica de recuperación y repaso espaciado en secundaria',
    category: 'Cognitivo',
    dateISO: '2025-12-12',
    dateLabel: fechaCorta('2025-12-12'),
    readTime: '6 min de lectura',
    description: 'Sustituimos el repaso de “volver a leer” por cuestionarios breves sin calificación al inicio de cada clase, espaciados a lo largo de semanas.',
    fullDescription: [
      'La práctica de recuperación consiste en traer a la memoria lo aprendido (por ejemplo, contestar tres preguntas sin ver el cuaderno) en lugar de volver a leerlo. Combinada con el repaso espaciado (repasar un tema días o semanas después), es de las técnicas de estudio con más evidencia en psicología cognitiva.',
      'Durante el primer trimestre, cada clase de secundaria inició con 5 minutos de preguntas sobre temas de la clase anterior, de la semana pasada y del mes pasado. No contaban para la calificación, lo que redujo la ansiedad.',
      'También enseñamos a los estudiantes a usar tarjetas de estudio (pregunta de un lado, respuesta del otro) para preparar sus evaluaciones.',
    ],
    highlight: 'Cinco minutos al inicio de la clase, sin calificación, mejoraron más la retención que una sesión larga de repaso antes del examen.',
    metrics: [
      { label: 'Retención a un mes', percentage: 68, before: 42, color: '#4e21c1' },
      { label: 'Resultados en evaluación', percentage: 71, before: 55, color: '#4295ed' },
      { label: 'Confianza al estudiar', percentage: 74, before: 49, color: '#f5a623' },
    ],
    icon: 'brain',
    steps: [
      'Iniciar cada clase con 3 preguntas: una de ayer, una de la semana pasada, una del mes pasado.',
      'Respuestas en el cuaderno y revisión inmediata en grupo, sin calificación.',
      'Enseñar a elaborar tarjetas de estudio.',
      'Explicar a los estudiantes por qué funciona: esforzarse por recordar fortalece la memoria.',
    ],
    sources: [
      'Roediger, H. y Karpicke, J. (2006). Test-Enhanced Learning. Psychological Science, 17(3).',
      'Dunlosky, J. et al. (2013). Improving Students’ Learning With Effective Learning Techniques. Psychological Science in the Public Interest, 14(1).',
    ],
  },
  {
    title: 'Rutinas socioemocionales para iniciar el día',
    category: 'Bienestar emocional',
    dateISO: '2025-11-14',
    dateLabel: fechaCorta('2025-11-14'),
    readTime: '6 min de lectura',
    description: 'Implementamos una rutina de bienvenida de 10 minutos con registro de emociones en primaria y en las sesiones de tutoría de secundaria.',
    fullDescription: [
      'Cada mañana, los estudiantes señalan cómo se sienten en un “termómetro de emociones” en el salón y el grupo realiza una breve actividad de respiración o una pregunta de conversación. En secundaria se integró a la sesión semanal de Tutoría y Educación Socioemocional.',
      'Un metaanálisis de más de 200 programas de aprendizaje socioemocional (Durlak y colaboradores, 2011) encontró mejoras en conducta, actitudes y también en el rendimiento académico. El marco de CASEL organiza estas habilidades en cinco áreas: autoconciencia, autorregulación, conciencia social, habilidades de relación y toma de decisiones responsable.',
      'La rutina permitió a los docentes identificar a tiempo a estudiantes que atravesaban situaciones difíciles y canalizarlos con apoyo de Dirección y de las familias.',
    ],
    highlight: 'Diez minutos para escucharnos al inicio del día hicieron que el resto de la jornada fuera más tranquila y productiva.',
    metrics: [
      { label: 'Clima de aula positivo', percentage: 85, before: 62, color: '#43ba58' },
      { label: 'Autorregulación', percentage: 70, before: 51, color: '#4e21c1' },
      { label: 'Conflictos resueltos con diálogo', percentage: 76, before: 48, color: '#fb3d96' },
    ],
    icon: 'idea',
    steps: [
      'Colocar un termómetro o semáforo de emociones a la entrada del salón.',
      'Dedicar 10 minutos a respiración, pregunta del día o círculo de diálogo.',
      'Acordar con el grupo normas de respeto para compartir.',
      'Dar seguimiento privado a estudiantes que reportan emociones difíciles varios días seguidos.',
    ],
    sources: [
      'Durlak, J. et al. (2011). The Impact of Enhancing Students’ Social and Emotional Learning. Child Development, 82(1).',
      'CASEL. Marco de aprendizaje socioemocional (casel.org).',
    ],
  },
  {
    title: 'Técnica Pomodoro para organizar el trabajo autónomo',
    category: 'Estrategias',
    dateISO: '2025-10-24',
    dateLabel: fechaCorta('2025-10-24'),
    readTime: '5 min de lectura',
    description: 'Bloques de trabajo de 20 a 25 minutos con pausas activas para mejorar la concentración en 5°, 6° de primaria y secundaria.',
    fullDescription: [
      'La técnica Pomodoro, creada por Francesco Cirillo, organiza el trabajo en bloques de concentración seguidos de pausas breves. La adaptamos a la escuela con bloques de 20 minutos en primaria y 25 en secundaria, y pausas activas de 3 a 5 minutos.',
      'Resultó especialmente útil en los momentos de trabajo autónomo, cuando el docente atiende a un subgrupo o durante la revisión de los libros de proyectos.',
    ],
    highlight: 'Saber cuánto falta para la pausa ayudó a los estudiantes a mantener la atención y a terminar sus actividades a tiempo.',
    metrics: [
      { label: 'Concentración sostenida', percentage: 74, before: 56, color: '#4295ed' },
      { label: 'Tareas completadas a tiempo', percentage: 81, before: 60, color: '#43ba58' },
      { label: 'Percepción positiva del grupo', percentage: 86, before: 52, color: '#f5a623' },
    ],
    icon: 'target',
    steps: [
      'Escribir en el pizarrón la meta concreta del bloque.',
      'Usar un temporizador visible para todo el grupo.',
      'Pausa activa: estiramientos, agua o respiración, sin pantallas.',
      'Al final, cada estudiante marca si cumplió su meta del bloque.',
    ],
    sources: [
      'Cirillo, F. (2018). The Pomodoro Technique. Currency.',
    ],
  },
];

const studyCategories = Array.from(new Set(studies.map((s) => s.category)));

// Mismo criterio de selección que el carrusel de avisos: bandera
// "featured" explícita primero; si ninguna, el más reciente por fecha;
// si hay empate de fecha, el último agregado a este arreglo.
const featuredStudy = (() => {
  const flagged = studies.find((s) => s.featured);
  if (flagged) return flagged;
  return studies
    .map((study, addedOrder) => ({ study, addedOrder }))
    .sort((a, b) => {
      const byDate = new Date(b.study.dateISO).getTime() - new Date(a.study.dateISO).getTime();
      if (byDate !== 0) return byDate;
      return b.addedOrder - a.addedOrder;
    })[0].study;
})();

/* =========================================================================
   Actividades Escolares y Eventos Cívicos y Culturales — comparten el
   mismo modelo de datos y la misma plantilla de página (listado +
   detalle), ya que estructuralmente son el mismo tipo de contenido.
   ========================================================================= */

type ActivityEntry = {
  title: string;
  category: string;
  tone: 'pink' | 'blue' | 'green' | 'yellow';
  dateISO: string;
  dateLabel: string;
  time: string;
  location: string;
  description: string;
  fullDescription: string[];
  highlight: string;
  objectives: { title: string; description: string }[];
  details: { label: string; value: string }[];
  materials: string[];
  image: string;
  gallery: string[];
  announcement?: Announcement;
  // Condicional para decidir si esta actividad/evento aparece también en
  // el Calendario Escolar. Si ya tiene un "announcement" ligado (como el
  // Festival del Día del Estudiante), no se duplica: ese aviso ya se
  // agrega solo al calendario, y desde ahí se enlaza de vuelta aquí.
  enCalendario?: boolean;
  calendarType?: CalendarEventType;
  // Enlace al formulario de Google Forms para inscribirse. Es también la
  // condicional que decide si se muestra el botón "Inscribirme": solo
  // aparece cuando esta actividad/evento lo trae. Se deja sin definir en
  // las actividades/eventos de participación abierta o para todo el grupo
  // (donde no hace falta inscripción), y se agrega aquí cuando una nueva
  // entrada sí requiera registro previo.
  formLink?: string;
};

// Arma una actividad o evento completo: la fecha larga y la tabla de
// "Detalles" se generan solas a partir de los campos básicos, para no
// repetir la misma información dos veces en cada entrada.
type EntradaBase = Omit<ActivityEntry, 'dateLabel' | 'details'> & { audience: string; cost?: string; cupo?: string };
const entrada = ({ audience, cost, cupo, ...e }: EntradaBase): ActivityEntry => ({
  ...e,
  dateLabel: fechaCorta(e.dateISO),
  details: [
    { label: 'Fecha', value: fechaLarga(e.dateISO) },
    { label: 'Horario', value: e.time },
    { label: 'Lugar', value: e.location },
    { label: 'Dirigido a', value: audience },
    { label: 'Costo', value: cost ?? 'Actividad gratuita' },
    { label: 'Cupo', value: cupo ?? 'Todo el grupo' },
  ],
});

const activities: ActivityEntry[] = [
  entrada({
    title: 'Proyecto comunitario: huerto escolar',
    category: 'Proyecto Comunitario',
    tone: 'green',
    dateISO: '2025-10-20',
    time: '09:00 AM - 11:00 AM',
    location: 'Área verde de la escuela',
    audience: 'Primaria y secundaria (todos los grupos)',
    description: 'Arranque del huerto escolar como proyecto de aprendizaje servicio que integra ciencias, matemáticas, lenguaje y vida saludable.',
    fullDescription: [
      'El huerto surgió del diagnóstico comunitario: las familias señalaron la mala alimentación y el desperdicio de residuos orgánicos como problemas importantes. Con la metodología de aprendizaje servicio, los estudiantes aprenden mientras producen algo útil para su comunidad.',
      'Cada grado tiene una tarea: 1° y 2° de primaria riegan y observan el crecimiento; 3° y 4° miden y registran en tablas; 5° y 6° calculan áreas y cantidades de semilla; secundaria diseña la composta, analiza el suelo y documenta el proyecto.',
      'La cosecha se compartirá con las familias y se usará en talleres de alimentación saludable.',
    ],
    highlight: 'Un huerto es un laboratorio vivo: ahí se aprende a medir, observar, cooperar y comer mejor.',
    objectives: [
      { title: 'Aprender haciendo', description: 'Relacionar contenidos de varios campos formativos con una tarea real.' },
      { title: 'Vida saludable', description: 'Promover el consumo de verduras y el cuidado del ambiente.' },
      { title: 'Servir a la comunidad', description: 'Compartir la cosecha y lo aprendido con las familias.' },
    ],
    materials: ['Ropa que se pueda ensuciar', 'Gorra y botella de agua', 'Semillas o plántulas (opcional, donativo)'],
    image: galleryCiencias,
    gallery: [galleryDeportes, galleryMatematicas, galleryLectura],
    enCalendario: true,
  }),
  entrada({
    title: 'Taller para familias: acompañar las tareas en casa',
    category: 'Escuela para Familias',
    tone: 'yellow',
    dateISO: '2025-11-12',
    time: '08:15 AM - 09:30 AM',
    location: 'Aula de medios',
    audience: 'Madres, padres y tutores de primaria y secundaria',
    cupo: '40 familias',
    description: 'Estrategias sencillas para apoyar el estudio en casa sin hacer la tarea por los hijos.',
    fullDescription: [
      'Muchas familias quieren ayudar pero no saben cómo, sobre todo cuando los contenidos cambiaron respecto a lo que ellas estudiaron. En este taller compartimos estrategias concretas que no requieren conocimientos especiales.',
      'Trabajamos tres ideas: un horario y lugar fijo para estudiar, preguntar en lugar de resolver (“¿qué te pide el ejercicio?”, “¿cómo lo intentaste?”) y leer juntos 15 minutos diarios. Para secundaria, hablamos del uso responsable del celular y de cómo detectar señales de desánimo o acoso escolar.',
    ],
    highlight: 'Acompañar no es resolver: es preguntar, escuchar y reconocer el esfuerzo.',
    objectives: [
      { title: 'Rutinas de estudio', description: 'Establecer horario y espacio fijo para las tareas.' },
      { title: 'Preguntas que ayudan', description: 'Guiar sin dar la respuesta.' },
      { title: 'Comunicación escuela-familia', description: 'Saber cuándo y cómo acercarse al docente.' },
    ],
    materials: ['Libreta para notas'],
    image: familyImage,
    gallery: [galleryLectura, galleryArte, galleryCivismo],
    enCalendario: true,
    formLink: 'https://forms.gle/PLACEHOLDER-REEMPLAZAR-CON-FORMULARIO',
  }),
  entrada({
    title: 'Círculos de estudio entre pares',
    category: 'Actividad Colaborativa',
    tone: 'blue',
    dateISO: '2026-01-21',
    time: '11:30 AM - 11:50 AM (martes y jueves)',
    location: 'Biblioteca escolar y salones de primaria',
    audience: 'Tutores de 2° y 3° de secundaria; estudiantes de 1° a 3° de primaria',
    description: 'Estudiantes de secundaria acompañan la lectura de estudiantes de primaria en sesiones cortas dos veces por semana.',
    fullDescription: [
      'Los círculos de estudio son nuestra forma de aplicar la tutoría entre pares, una estrategia con fuerte respaldo en la investigación educativa. Cada tutor de secundaria acompaña a uno o dos estudiantes de primaria durante 20 minutos.',
      'Antes de iniciar, los tutores reciben dos sesiones de capacitación y una tarjeta con cuatro pasos: leer juntos, preguntar, elogiar y registrar. Consulta los resultados en la sección de Seguimiento.',
    ],
    highlight: 'Cuando un estudiante enseña a otro, los dos aprenden.',
    objectives: [
      { title: 'Mejorar la fluidez lectora', description: 'Más minutos de lectura acompañada para quien lo necesita.' },
      { title: 'Desarrollar liderazgo', description: 'Los tutores asumen una responsabilidad real.' },
      { title: 'Unir a los niveles', description: 'Convivencia positiva entre primaria y secundaria.' },
    ],
    materials: ['Libro de la biblioteca de aula', 'Tarjeta de registro del tutor'],
    image: galleryLectura,
    gallery: [galleryCivismo, galleryArte, galleryCiencias],
    enCalendario: true,
  }),
  entrada({
    title: 'Asamblea escolar: el problema de la basura',
    category: 'Aprendizaje Basado en Problemas',
    tone: 'pink',
    dateISO: '2026-02-18',
    time: '10:00 AM - 12:00 PM',
    location: 'Explanada principal',
    audience: 'Secundaria (presenta) · 5° y 6° de primaria (participa)',
    description: 'Los grupos de secundaria presentan su investigación y propuestas para reducir la basura en la escuela, y la comunidad vota las acciones.',
    fullDescription: [
      'Durante tres semanas, en Formación Cívica y Ética y Ciencias, los estudiantes de secundaria trabajaron con la metodología de aprendizaje basado en problemas: midieron cuánta basura se genera en un día, la clasificaron, investigaron alternativas y diseñaron propuestas.',
      'En la asamblea cada grupo presenta una propuesta y la comunidad escolar vota. Es un ejercicio de participación democrática que forma parte del eje de pensamiento crítico y de la formación ciudadana.',
    ],
    highlight: 'La democracia se aprende practicándola: proponer, argumentar, escuchar y votar.',
    objectives: [
      { title: 'Investigar un problema real', description: 'Recolectar y analizar datos de la propia escuela.' },
      { title: 'Argumentar con evidencia', description: 'Presentar propuestas sustentadas en datos.' },
      { title: 'Participación democrática', description: 'Decidir en comunidad qué acciones realizar.' },
    ],
    materials: ['Carteles con los datos de cada grupo', 'Boletas de votación'],
    image: galleryCivismo,
    gallery: [galleryCiencias, galleryMatematicas, galleryLectura],
    enCalendario: true,
  }),
  entrada({
    title: 'Rally matemático',
    category: 'Actividad Académica',
    tone: 'yellow',
    dateISO: '2026-03-05',
    time: '09:00 AM - 12:00 PM',
    location: 'Patio y salones',
    audience: 'Equipos mixtos de 3° de primaria a 3° de secundaria',
    description: 'Retos de cálculo mental, geometría, patrones y lógica en 8 estaciones, con equipos que mezclan grados.',
    fullDescription: [
      'Cada equipo integra estudiantes de distintos grados y recorre 8 estaciones con retos de diferente dificultad: cálculo mental, armado de figuras con tangram, patrones numéricos, estimación, medición, fracciones con material concreto, acertijos lógicos y un problema final de secundaria.',
      'El objetivo no es competir entre grupos sino mostrar que las matemáticas se pueden disfrutar y que cada integrante del equipo aporta algo distinto.',
    ],
    highlight: 'En un equipo mixto, el de 3° de primaria suele ver lo que al de secundaria se le escapa.',
    objectives: [
      { title: 'Gusto por las matemáticas', description: 'Resolver retos en un ambiente de juego.' },
      { title: 'Colaboración entre grados', description: 'Aprovechar las distintas fortalezas del equipo.' },
      { title: 'Estrategias propias', description: 'Explicar cómo se llegó a cada respuesta.' },
    ],
    materials: ['Lápiz y goma', 'Tabla de apoyo', 'Gorra y agua'],
    image: galleryMatematicas,
    gallery: [galleryDeportes, galleryCiencias, galleryLectura],
    enCalendario: true,
  }),
  entrada({
    title: 'Maratón de lectura: Día Mundial del Libro',
    category: 'Actividad Académica',
    tone: 'green',
    dateISO: '2026-04-23',
    time: '08:00 AM - 01:00 PM',
    location: 'Toda la escuela',
    audience: 'Todos los grupos y familias invitadas',
    cupo: 'Abierto a familias',
    description: 'Una mañana entera de lectura en voz alta, intercambio de libros y lectores invitados de la comunidad.',
    fullDescription: [
      'El 23 de abril, Día Mundial del Libro y del Derecho de Autor proclamado por la UNESCO, la escuela entera lee. Cada hora cambia la actividad: lectura en voz alta del docente, lectores invitados (familias, personas mayores de la comunidad), lectura en parejas entre primaria y secundaria y un tianguis de intercambio de libros.',
      'Cerramos con una recomendación de cada grupo: el libro favorito del ciclo, presentado en un cartel.',
    ],
    highlight: 'Cuando una comunidad lee junta, los estudiantes descubren que leer no es solo una tarea de la escuela.',
    objectives: [
      { title: 'Fomentar el gusto por leer', description: 'Vivir la lectura como algo disfrutable y compartido.' },
      { title: 'Involucrar a las familias', description: 'Invitar a la comunidad a leer en la escuela.' },
      { title: 'Circular libros', description: 'Intercambiar libros que ya leímos por otros nuevos.' },
    ],
    materials: ['Un libro para intercambiar (opcional)', 'Cojín o tapete para leer'],
    image: galleryLectura,
    gallery: [galleryArte, galleryCivismo, galleryMatematicas],
    enCalendario: true,
  }),
  entrada({
    title: 'Convivencia deportiva',
    category: 'Actividad Deportiva',
    tone: 'pink',
    dateISO: '2026-05-20',
    time: '09:00 AM - 12:00 PM',
    location: 'Campo deportivo',
    audience: 'Todos los estudiantes y familias',
    cupo: 'Abierto al público',
    description: 'Jornada de juegos tradicionales y deportes en equipo que fomenta la actividad física, la sana competencia y el compañerismo.',
    fullDescription: [
      'Primaria participa en juegos tradicionales (avión, resorte, carreras de costales, stop) y secundaria en torneos relámpago de fútbol, básquetbol y voleibol con equipos mixtos.',
      'La Organización Mundial de la Salud recomienda que niñas, niños y adolescentes realicen al menos 60 minutos diarios de actividad física moderada a intensa; esta jornada también es una invitación a las familias para moverse juntas.',
    ],
    highlight: 'Lo importante no es solo ganar, sino disfrutar y crecer juntos como comunidad.',
    objectives: [
      { title: 'Fomentar la actividad física', description: 'Promover hábitos de movimiento diario.' },
      { title: 'Fortalecer el compañerismo', description: 'Convivir de forma sana entre distintos grupos.' },
      { title: 'Rescatar juegos tradicionales', description: 'Compartir juegos que las familias conocen.' },
    ],
    materials: ['Ropa y calzado deportivo', 'Botella de agua', 'Gorra y bloqueador'],
    image: galleryDeportes,
    gallery: [galleryCiencias, galleryMatematicas, galleryCivismo],
    enCalendario: true,
  }),
  entrada({
    title: 'Feria de Ciencias STEAM 2026',
    category: 'Actividad Académica',
    tone: 'blue',
    dateISO: '2026-05-28',
    time: '09:00 AM - 01:00 PM',
    location: 'Patio central',
    audience: 'Todos los estudiantes y familias',
    cupo: 'Abierto al público',
    description: 'Presentación de proyectos de indagación de todos los grados, desde “¿qué flota?” en 1° de primaria hasta la calidad del agua en secundaria.',
    fullDescription: [
      'La Feria de Ciencias es el cierre de los proyectos de indagación con enfoque STEAM del ciclo. Cada proyecto sigue un ciclo completo: pregunta, predicción, experimento o registro, análisis de datos y conclusión.',
      'Los estudiantes explican su proyecto al público; se evalúa el proceso con una lista de cotejo y no solo la presentación final. Todos los proyectos reciben reconocimiento.',
    ],
    highlight: '¡Ven, descubre y aprende con las preguntas y descubrimientos de nuestros estudiantes!',
    objectives: [
      { title: 'Fomentar la indagación', description: 'Formular preguntas y buscar respuestas con evidencia.' },
      { title: 'Comunicar ciencia', description: 'Explicar a otros lo que se investigó.' },
      { title: 'Integrar disciplinas', description: 'Unir ciencia, tecnología, arte y matemáticas.' },
    ],
    materials: ['Proyecto ya elaborado', 'Cartel con pregunta, hipótesis, datos y conclusión', 'Bitácora del proyecto'],
    image: galleryCiencias,
    gallery: [galleryLectura, galleryMatematicas, galleryArte],
    enCalendario: true,
  }),
];

const civicEvents: ActivityEntry[] = [
  entrada({
    title: 'Honores a la bandera',
    category: 'Evento Cívico',
    tone: 'blue',
    dateISO: '2025-09-01',
    time: '08:00 AM - 08:30 AM (todos los lunes)',
    location: 'Explanada principal',
    audience: 'Toda la comunidad escolar',
    cupo: 'Abierto al público',
    description: 'Ceremonia cívica de cada lunes. Un grupo distinto la conduce cada semana e incluye una efeméride explicada por los estudiantes.',
    fullDescription: [
      'Cada lunes realizamos honores a la bandera. El grupo responsable prepara la conducción, la efeméride de la semana y una breve reflexión relacionada con un valor o un derecho.',
      'La rotación permite que todos los grupos, de 1° de primaria a 3° de secundaria, participen al menos una vez por trimestre. Para los más pequeños, la participación puede ser recitar una poesía o presentar un dibujo.',
    ],
    highlight: 'El respeto a nuestros símbolos patrios se construye todos los días, en comunidad.',
    objectives: [
      { title: 'Formación cívica', description: 'Conocer y respetar los símbolos patrios.' },
      { title: 'Expresión oral', description: 'Hablar en público con seguridad.' },
      { title: 'Memoria histórica', description: 'Conocer las efemérides y su significado.' },
    ],
    materials: ['Uniforme escolar completo'],
    image: galleryCivismo,
    gallery: [galleryArte, galleryLectura, galleryDeportes],
    enCalendario: true,
  }),
  entrada({
    title: 'Noche mexicana: celebración de fiestas patrias',
    category: 'Evento Cultural',
    tone: 'pink',
    dateISO: '2025-09-12',
    time: '09:00 AM - 12:30 PM',
    location: 'Explanada principal',
    audience: 'Todos los estudiantes y familias',
    cupo: 'Abierto al público',
    description: 'Ceremonia por el inicio de la Independencia, bailes regionales, juegos de feria y antojitos preparados por las familias.',
    fullDescription: [
      'Como el 16 de septiembre es día de descanso, celebramos el viernes anterior. Iniciamos con una ceremonia cívica y la representación del inicio de la Independencia por un grupo de secundaria.',
      'Después, cada grupo presenta un baile regional o una muestra cultural de un estado de la República que previamente investigó (ubicación, comida, vestimenta, música), lo que convierte la fiesta en un proyecto de Geografía e Historia.',
    ],
    highlight: 'Celebrar nuestra historia también es conocer la diversidad cultural del país.',
    objectives: [
      { title: 'Conocer nuestra historia', description: 'Recordar el inicio del movimiento de Independencia.' },
      { title: 'Valorar la diversidad', description: 'Investigar y compartir la cultura de otros estados.' },
      { title: 'Convivencia', description: 'Reunir a familias y escuela en un ambiente festivo.' },
    ],
    materials: ['Vestuario sencillo del baile asignado', 'Platillo para compartir (voluntario)'],
    image: galleryArte,
    gallery: [galleryCivismo, galleryDeportes, galleryLectura],
    enCalendario: true,
  }),
  entrada({
    title: 'Simulacro Nacional',
    category: 'Protección Civil',
    tone: 'yellow',
    dateISO: '2025-09-19',
    time: '12:00 PM',
    location: 'Toda la escuela',
    audience: 'Toda la comunidad escolar',
    description: 'Participamos en el Simulacro Nacional con una evacuación ordenada a los puntos de reunión.',
    fullDescription: [
      'Cada 19 de septiembre, en memoria de los sismos de 1985 y 2017, se realiza el Simulacro Nacional coordinado por Protección Civil. La escuela participa con la hipótesis de sismo y activa su plan de emergencia.',
      'Antes del simulacro, cada grupo repasa las rutas de evacuación y las reglas “no corro, no grito, no empujo”. En primaria se refuerza con juegos; en secundaria, las brigadas estudiantiles apoyan en primeros auxilios, evacuación y conteo.',
    ],
    highlight: 'Practicar hoy nos prepara para actuar con calma cuando más se necesita.',
    objectives: [
      { title: 'Cultura de prevención', description: 'Saber qué hacer antes, durante y después de un sismo.' },
      { title: 'Evacuación ordenada', description: 'Reducir el tiempo de evacuación.' },
      { title: 'Brigadas escolares', description: 'Formar estudiantes y docentes responsables.' },
    ],
    materials: ['Ninguno: se evacúa sin mochila'],
    image: galleryDeportes,
    gallery: [galleryCivismo, galleryCiencias, galleryMatematicas],
    enCalendario: true,
  }),
  entrada({
    title: 'Ofrenda de Día de Muertos y calaveritas literarias',
    category: 'Evento Cultural',
    tone: 'yellow',
    dateISO: '2025-10-30',
    time: '10:00 AM - 01:00 PM',
    location: 'Patio central',
    audience: 'Todos los estudiantes y familias',
    cupo: 'Abierto al público',
    description: 'Ofrenda monumental con fichas explicativas hechas por los estudiantes y concurso de calaveritas literarias.',
    fullDescription: [
      'La celebración del Día de Muertos fue inscrita por la UNESCO en la Lista del Patrimonio Cultural Inmaterial de la Humanidad en 2008. En la escuela la trabajamos como proyecto interdisciplinario: cada grupo investiga un elemento de la ofrenda y lo explica con una ficha.',
      'Los grupos de 4° de primaria a 3° de secundaria participan en el concurso de calaveritas literarias, que sirve para practicar rima, métrica y humor respetuoso. Consulta el boletín de noviembre para ver cómo lo organizamos.',
    ],
    highlight: 'Recordar a quienes ya no están es también una forma de conocer quiénes somos.',
    objectives: [
      { title: 'Preservar la tradición', description: 'Conocer el origen y significado de la ofrenda.' },
      { title: 'Escribir con creatividad', description: 'Componer calaveritas literarias con rima.' },
      { title: 'Trabajo interdisciplinario', description: 'Unir historia, arte, ciencia y lenguaje.' },
    ],
    materials: ['Elemento de ofrenda asignado al grupo', 'Calaverita escrita (4° a secundaria)'],
    image: galleryArte,
    gallery: [galleryCivismo, galleryLectura, galleryCiencias],
    enCalendario: true,
  }),
  entrada({
    title: 'Ceremonia y tabla rítmica: Revolución Mexicana',
    category: 'Evento Cívico',
    tone: 'blue',
    dateISO: '2025-11-14',
    time: '09:00 AM - 11:00 AM',
    location: 'Explanada principal',
    audience: 'Todos los estudiantes y familias',
    cupo: 'Abierto al público',
    description: 'Conmemoración del inicio de la Revolución Mexicana con tabla rítmica, activación física y líneas del tiempo hechas por secundaria.',
    fullDescription: [
      'Como el descanso oficial es el tercer lunes de noviembre, adelantamos la conmemoración al viernes. Primaria presenta tablas rítmicas y secundaria expone líneas del tiempo ilustradas de 1910 a 1917.',
      'Los grupos de secundaria explican su línea del tiempo a un grupo de primaria: enseñar a otros consolida su propio aprendizaje.',
    ],
    highlight: 'Conocer las causas de la Revolución nos ayuda a entender los derechos que hoy tenemos.',
    objectives: [
      { title: 'Comprender la historia', description: 'Identificar causas y consecuencias de la Revolución.' },
      { title: 'Actividad física', description: 'Preparar y presentar la tabla rítmica.' },
      { title: 'Aprender enseñando', description: 'Secundaria explica a primaria.' },
    ],
    materials: ['Uniforme deportivo', 'Línea del tiempo (secundaria)'],
    image: galleryDeportes,
    gallery: [galleryCivismo, galleryArte, galleryLectura],
    enCalendario: true,
  }),
  entrada({
    title: 'Día Naranja: por una escuela libre de violencia',
    category: 'Evento Cívico',
    tone: 'pink',
    dateISO: '2025-11-25',
    time: '08:00 AM - 09:00 AM',
    location: 'Salones y explanada',
    audience: 'Toda la comunidad escolar',
    description: 'Actividades por nivel para promover la igualdad de género y prevenir la violencia contra mujeres y niñas.',
    fullDescription: [
      'El 25 de noviembre es el Día Internacional de la Eliminación de la Violencia contra la Mujer, y el día 25 de cada mes se conmemora el Día Naranja. La comunidad escolar viste una prenda naranja y cada grupo realiza una actividad breve.',
      'En primaria: juegos y cuentos sobre reparto justo de tareas y respeto. En secundaria: análisis de estereotipos en canciones y publicidad, y elaboración de un decálogo de relaciones respetuosas. Se relaciona con el eje articulador de igualdad de género.',
    ],
    highlight: 'La igualdad se aprende desde el aula: en cómo nos hablamos, cómo trabajamos y cómo repartimos las tareas.',
    objectives: [
      { title: 'Igualdad de género', description: 'Reconocer y cuestionar estereotipos.' },
      { title: 'Prevención de la violencia', description: 'Identificar situaciones de riesgo y a quién acudir.' },
      { title: 'Convivencia respetuosa', description: 'Construir acuerdos de trato digno en el grupo.' },
    ],
    materials: ['Una prenda o listón naranja'],
    image: galleryCivismo,
    gallery: [galleryLectura, galleryArte, galleryDeportes],
    enCalendario: true,
  }),
  entrada({
    title: 'Posada y convivio de fin de año',
    category: 'Evento Cultural',
    tone: 'green',
    dateISO: '2025-12-18',
    time: '10:00 AM - 01:00 PM',
    location: 'Explanada principal',
    audience: 'Todos los estudiantes y familias',
    cupo: 'Abierto al público',
    description: 'Pastorela presentada por secundaria, villancicos de primaria y convivio organizado con la asociación de familias.',
    fullDescription: [
      'Cerramos el primer periodo con una posada tradicional. Los grupos de secundaria presentan una pastorela escrita por ellos mismos (proyecto de Lenguajes) y los grupos de primaria cantan villancicos.',
      'El convivio es organizado con la asociación de familias y se promueven alimentos saludables, de acuerdo con los lineamientos de alimentación escolar vigentes.',
    ],
    highlight: 'Cerrar el año juntos nos recuerda que la escuela es, antes que nada, una comunidad.',
    objectives: [
      { title: 'Convivencia', description: 'Compartir entre familias, estudiantes y docentes.' },
      { title: 'Expresión artística', description: 'Escribir, ensayar y presentar una pastorela.' },
      { title: 'Tradiciones', description: 'Conocer el origen de las posadas.' },
    ],
    materials: ['Vaso y plato reutilizables', 'Platillo saludable para compartir (voluntario)'],
    image: galleryArte,
    gallery: [galleryDeportes, galleryCivismo, galleryLectura],
    enCalendario: true,
  }),
  entrada({
    title: 'Día Internacional de la Lengua Materna',
    category: 'Evento Cultural',
    tone: 'green',
    dateISO: '2026-02-20',
    time: '10:00 AM - 11:30 AM',
    location: 'Biblioteca escolar',
    audience: 'Todos los grupos y familias hablantes invitadas',
    cupo: 'Abierto a familias',
    description: 'Familias hablantes de lenguas originarias comparten cuentos, canciones y palabras con los estudiantes.',
    fullDescription: [
      'La UNESCO proclamó el 21 de febrero como Día Internacional de la Lengua Materna. En México se reconocen 68 lenguas indígenas nacionales, con cientos de variantes. Como el 21 cae en sábado, lo celebramos el viernes.',
      'Invitamos a familias hablantes a compartir cuentos, canciones y palabras. Los estudiantes elaboran un diccionario ilustrado y en secundaria investigan qué lenguas se hablan en su municipio. Esta actividad se relaciona con el eje de interculturalidad crítica.',
    ],
    highlight: 'Cada lengua es una forma distinta de ver el mundo; cuidarla es cuidar nuestra riqueza cultural.',
    objectives: [
      { title: 'Valorar la diversidad lingüística', description: 'Reconocer las lenguas de la comunidad.' },
      { title: 'Interculturalidad', description: 'Aprender de los saberes de las familias.' },
      { title: 'Producción de textos', description: 'Elaborar un diccionario ilustrado.' },
    ],
    materials: ['Hojas y colores para el diccionario'],
    image: galleryLectura,
    gallery: [galleryArte, galleryCivismo, galleryCiencias],
    enCalendario: true,
  }),
  entrada({
    title: 'Día de la Bandera y abanderamiento de la escolta',
    category: 'Evento Cívico',
    tone: 'blue',
    dateISO: '2026-02-24',
    time: '08:00 AM - 09:30 AM',
    location: 'Explanada principal',
    audience: 'Toda la comunidad escolar',
    cupo: 'Abierto al público',
    description: 'Ceremonia especial con cambio de escolta, juramento a la bandera y explicación de la historia de nuestro lábaro patrio.',
    fullDescription: [
      'El 24 de febrero se conmemora el Día de la Bandera. En la ceremonia la escolta saliente entrega la bandera a la nueva escolta, integrada por estudiantes de primaria y de secundaria.',
      'Previamente, los grupos investigan la evolución de la bandera desde el estandarte de la Virgen de Guadalupe usado por Miguel Hidalgo hasta el diseño actual, y el significado de sus colores y su escudo.',
    ],
    highlight: 'La bandera nos representa a todas y todos: honrarla es comprometernos con nuestra comunidad.',
    objectives: [
      { title: 'Identidad nacional', description: 'Conocer la historia y el significado de la bandera.' },
      { title: 'Responsabilidad', description: 'Reconocer a la nueva escolta y su compromiso.' },
      { title: 'Participación', description: 'Involucrar a ambos niveles en la ceremonia.' },
    ],
    materials: ['Uniforme de gala'],
    image: galleryCivismo,
    gallery: [galleryArte, galleryDeportes, galleryLectura],
    enCalendario: true,
  }),
  entrada({
    title: 'Natalicio de Benito Juárez y desfile de primavera',
    category: 'Evento Cívico',
    tone: 'yellow',
    dateISO: '2026-03-20',
    time: '09:00 AM - 11:30 AM',
    location: 'Explanada y calles aledañas',
    audience: 'Primaria (desfile) · secundaria (ceremonia)',
    cupo: 'Abierto al público',
    description: 'Ceremonia en memoria de Benito Juárez y recorrido de primavera por la comunidad con los grupos de primaria.',
    fullDescription: [
      'Benito Juárez nació el 21 de marzo de 1806 en San Pablo Guelatao, Oaxaca. Secundaria prepara una lectura en voz alta de fragmentos de su biografía y una reflexión sobre la frase “entre los individuos, como entre las naciones, el respeto al derecho ajeno es la paz”.',
      'Los grupos de primaria realizan el tradicional desfile de primavera con disfraces elaborados con material reciclado, como parte del proyecto de cuidado ambiental.',
    ],
    highlight: 'Del respeto al derecho ajeno a la llegada de la primavera: un día para celebrar la vida en comunidad.',
    objectives: [
      { title: 'Memoria histórica', description: 'Conocer la vida y legado de Benito Juárez.' },
      { title: 'Cuidado ambiental', description: 'Elaborar disfraces con material reciclado.' },
      { title: 'Convivencia', description: 'Compartir con la comunidad el trabajo de los estudiantes.' },
    ],
    materials: ['Disfraz de material reciclado (primaria)', 'Gorra y agua'],
    image: galleryArte,
    gallery: [galleryCivismo, galleryCiencias, galleryDeportes],
    enCalendario: true,
  }),
  entrada({
    title: 'Festival del Día de la Niña y el Niño',
    category: 'Evento Cultural',
    tone: 'pink',
    dateISO: '2026-04-30',
    time: '09:00 AM - 01:00 PM',
    location: 'Explanada principal',
    audience: 'Todos los estudiantes y familias',
    cupo: 'Abierto al público',
    description: 'Juegos tradicionales, talleres y música, con estaciones organizadas por los estudiantes de secundaria.',
    fullDescription: [
      'Como cada año, celebramos a niñas, niños y adolescentes con una jornada llena de juegos, talleres y sorpresas. Los estudiantes de secundaria diseñan y dirigen las estaciones de juego para primaria.',
      'Aprovechamos para recordar los derechos de la infancia establecidos en la Convención sobre los Derechos del Niño y en la Ley General de los Derechos de Niñas, Niños y Adolescentes.',
    ],
    highlight: 'Un día para celebrar a quienes son el corazón de nuestra escuela: nuestros estudiantes.',
    objectives: [
      { title: 'Celebrar a la infancia', description: 'Dedicar una jornada especial a los estudiantes.' },
      { title: 'Conocer sus derechos', description: 'Recordar el derecho a jugar, aprender y participar.' },
      { title: 'Liderazgo de secundaria', description: 'Organizar actividades para los más pequeños.' },
    ],
    materials: ['Ropa cómoda'],
    image: trophyImage,
    gallery: [galleryArte, galleryCivismo, galleryDeportes],
    // Ya está ligado a un aviso (abajo), y ese aviso ya se agrega solo al
    // calendario — no marcamos enCalendario aquí para no duplicar la
    // misma fecha dos veces.
    announcement: announcements.find((a) => a.title === 'Festival del Día de la Niña y el Niño'),
  }),
  entrada({
    title: 'Festival del Día de las Madres',
    category: 'Evento Cultural',
    tone: 'green',
    dateISO: '2026-05-08',
    time: '10:00 AM - 12:00 PM',
    location: 'Explanada principal',
    audience: 'Familias de toda la escuela',
    cupo: 'Abierto al público',
    description: 'Bailes, poesía y cartas escritas por los estudiantes para sus mamás y las personas que los cuidan.',
    fullDescription: [
      'Como el 10 de mayo cae en domingo, el festival se realiza el viernes 8. Los grupos presentan bailes, poesías y canciones. Cada estudiante entrega una carta escrita en clase, que forma parte de un proyecto de producción de textos.',
      'Reconocemos que en muchas familias quien cuida es una abuela, una tía, un papá u otra persona: todas están invitadas y todas son celebradas.',
    ],
    highlight: 'Honramos a quienes nos cuidan: todas las familias son bienvenidas.',
    objectives: [
      { title: 'Expresión afectiva', description: 'Escribir y compartir mensajes de gratitud.' },
      { title: 'Expresión artística', description: 'Presentar bailes y poesías.' },
      { title: 'Inclusión', description: 'Reconocer la diversidad de las familias.' },
    ],
    materials: ['Vestuario sencillo del número asignado'],
    image: familyImage,
    gallery: [galleryArte, galleryLectura, galleryCivismo],
    enCalendario: true,
  }),
  entrada({
    title: 'Ceremonia de fin de cursos',
    category: 'Evento Cívico',
    tone: 'blue',
    dateISO: '2026-07-10',
    time: '09:00 AM - 11:30 AM',
    location: 'Explanada principal',
    audience: 'Generación 2026 de 6° de primaria y 3° de secundaria, y sus familias',
    cupo: '3 acompañantes por estudiante',
    description: 'Despedida de la generación que concluye la primaria y la secundaria, con honores, entrega simbólica de documentos y mensaje de los estudiantes.',
    fullDescription: [
      'Celebramos a los estudiantes que concluyen una etapa. La ceremonia incluye honores a la bandera, entrega simbólica de documentos, reconocimientos a la generación y un mensaje escrito por los propios estudiantes.',
      'La escolta saliente entrega la bandera a quienes la portarán el siguiente ciclo, simbolizando la continuidad de nuestra comunidad escolar.',
    ],
    highlight: 'Terminar una etapa es comenzar otra: les deseamos lo mejor en su nuevo camino.',
    objectives: [
      { title: 'Reconocer el esfuerzo', description: 'Celebrar la conclusión de un nivel educativo.' },
      { title: 'Motivar a continuar', description: 'Animar a seguir estudiando en el siguiente nivel.' },
      { title: 'Cerrar en comunidad', description: 'Compartir el logro con familias y docentes.' },
    ],
    materials: ['Uniforme de gala'],
    image: trophyImage,
    gallery: [galleryCivismo, galleryArte, galleryLectura],
    announcement: announcements.find((a) => a.title === 'Ceremonia de fin de cursos'),
  }),
];

// El Calendario Escolar se arma solo, a partir del contenido que ya existe
// en el sitio: además de las fechas fijas (días festivos, exámenes), TODO
// aviso se agrega automáticamente (usa su propio "calendarType"/
// "calendarLocation", o "evento" por defecto si no se especifica), y cada
// actividad o evento cívico se agrega solo si trae "enCalendario: true" —
// esa es la única "condicional" que hay que tocar para decidir si algo
// nuevo aparece o no en el calendario. Si una actividad/evento ya está
// ligada a un aviso (como el Festival del Día del Estudiante), no se
// duplica: ese aviso ya la representa en el calendario.
const calendarEvents: CalendarEvent[] = [
  ...fixedCalendarEvents,
  ...announcements.map((a) => ({
    title: a.title,
    dateISO: a.dateISO,
    type: a.calendarType ?? 'evento',
    description: a.description,
    location: a.calendarLocation,
    announcement: a,
  })),
  ...activities
    .filter((act) => act.enCalendario && !act.announcement)
    .map((act) => ({
      title: act.title,
      dateISO: act.dateISO,
      type: act.calendarType ?? 'evento',
      description: act.description,
      location: act.location,
      activity: act,
    })),
  ...civicEvents
    .filter((evt) => evt.enCalendario && !evt.announcement)
    .map((evt) => ({
      title: evt.title,
      dateISO: evt.dateISO,
      type: evt.calendarType ?? 'evento',
      description: evt.description,
      location: evt.location,
      evento: evt,
    })),
];

type View =
  | 'home'
  | 'all'
  | 'detail'
  | 'boletines'
  | 'boletinDetail'
  | 'calendar'
  | 'estudios'
  | 'estudioDetail'
  | 'actividades'
  | 'actividadDetail'
  | 'eventos'
  | 'eventoDetail'
  | 'galeria'
  | 'nosotros';

const categoryLabels: Record<Announcement['tone'], string> = {
  pink: 'General',
  blue: 'Eventos',
  green: 'Información',
  yellow: 'Información',
};
const categories = ['Todos', ...Array.from(new Set(announcements.map((a) => categoryLabels[a.tone])))];

/* =========================================================================
   Galería de Fotos — no es un banco de imágenes aparte: se arma sola a
   partir de las fotos que ya trae cada actividad, evento cívico y aviso
   (su imagen principal, y en actividades/eventos también su galería de
   ediciones anteriores), agrupadas por la categoría de cada entrada. En
   el sitio real, esas imágenes serían enlaces de Google Drive puestos
   directamente en "image"/"gallery" de cada entrada — aquí solo se
   recopilan y se reagrupan, nunca se inventan ni se suben aparte.
   ========================================================================= */

type GalleryPhoto = {
  title: string;
  image: string;
  category: string;
  tone: 'pink' | 'blue' | 'green' | 'yellow';
  dateISO: string;
  source: 'actividad' | 'evento' | 'aviso';
  activity?: ActivityEntry;
  evento?: ActivityEntry;
  announcement?: Announcement;
};

const galleryPhotos: GalleryPhoto[] = [
  ...activities.flatMap((activity) => [
    { title: activity.title, image: activity.image, category: activity.category, tone: activity.tone, dateISO: activity.dateISO, source: 'actividad' as const, activity },
    ...activity.gallery.map((image, index): GalleryPhoto => ({
      title: `${activity.title} — foto ${index + 2}`,
      image,
      category: activity.category,
      tone: activity.tone,
      dateISO: activity.dateISO,
      source: 'actividad' as const,
      activity,
    })),
  ]),
  ...civicEvents.flatMap((evento) => [
    // Si el evento ya está ligado a un aviso, su foto principal ya se
    // agrega desde ese aviso (mismo criterio que en el calendario) — solo
    // se agrega aquí la foto de portada cuando no hay ese aviso.
    ...(evento.announcement ? [] : [{ title: evento.title, image: evento.image, category: evento.category, tone: evento.tone, dateISO: evento.dateISO, source: 'evento' as const, evento }]),
    ...evento.gallery.map((image, index): GalleryPhoto => ({
      title: `${evento.title} — foto ${index + 2}`,
      image,
      category: evento.category,
      tone: evento.tone,
      dateISO: evento.dateISO,
      source: 'evento' as const,
      evento,
    })),
  ]),
  ...announcements.map((announcement): GalleryPhoto => ({
    title: announcement.title,
    image: announcement.image,
    category: categoryLabels[announcement.tone],
    tone: announcement.tone,
    dateISO: announcement.dateISO,
    source: 'aviso' as const,
    announcement,
  })),
];

const galleryCategories = Array.from(new Set(galleryPhotos.map((p) => p.category)));

// Tope de fotos para la cinta de "Momentos que Nos Inspiran": cargar las
// ~30+ fotos de la galería completa en un carrusel sería pesado, así que
// aquí solo se toman las más recientes y ese grupo (nunca la galería
// entera) es el que se repite para armar el bucle infinito.
const CAROUSEL_PHOTO_LIMIT = 12;
const carouselGalleryPhotos = [...galleryPhotos]
  .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
  .slice(0, CAROUSEL_PHOTO_LIMIT);

/* =========================================================================
   Nosotros — historia, misión, visión y plan de estudios. Es contenido
   institucional fijo (no se arma a partir de avisos/actividades como el
   calendario o la galería), pero vive aquí junto con el resto de los
   datos del sitio por la misma razón: para que sea fácil de encontrar y
   editar en un solo lugar. A propósito no se incluye al personal docente
   por nombre ni con fotografía.
   ========================================================================= */

const schoolValues = [
  { title: 'Docencia cercana', description: 'En telesecundaria un mismo docente acompaña al grupo en todas sus asignaturas; en primaria, el docente titular conoce a cada estudiante y a su familia.' },
  { title: 'Compromiso', description: 'Trabajamos por el desarrollo integral de cada estudiante, dentro y fuera del aula, desde 1° de primaria hasta 3° de secundaria.' },
  { title: 'Aprendizaje con sentido', description: 'Partimos de los problemas y saberes de nuestra comunidad para que lo aprendido sea útil en la vida diaria.' },
  { title: 'Comunidad', description: 'Escuela, familias y comunidad avanzando juntas hacia el mismo objetivo.' },
];

// Los siete ejes articuladores del Plan de Estudios 2022 (Nueva Escuela
// Mexicana). Atraviesan todos los campos formativos y todos los grados;
// aquí se describen con ejemplos de cómo los trabajamos en la escuela.
const pedagogicalAxes = [
  { title: 'Inclusión', description: 'Ajustamos actividades para que todos participen, con apoyos para estudiantes que lo necesitan.' },
  { title: 'Pensamiento crítico', description: 'Asambleas escolares y proyectos donde los estudiantes argumentan con evidencia.' },
  { title: 'Interculturalidad crítica', description: 'Valoramos las lenguas, saberes y tradiciones de las familias de la comunidad.' },
  { title: 'Igualdad de género', description: 'Reparto justo de tareas, Día Naranja y análisis de estereotipos.' },
  { title: 'Vida saludable', description: 'Huerto escolar, activación física y alimentación sin productos chatarra.' },
  { title: 'Apropiación de las culturas a través de la lectura y la escritura', description: '20 minutos diarios de lectura en toda la escuela y tutoría lectora entre pares.' },
  { title: 'Artes y experiencias estéticas', description: 'Ofrendas, pastorelas, bailes regionales y exposiciones de trabajos.' },
];

type GradePlan = { grade: string; focus: string; subjects: string[] };

// Cada nivel educativo es un bloque independiente con su propia
// condicional "show": para agregar un nivel nuevo (o quitarlo de la
// vista sin perder su información) solo hay que sumar/editar un objeto
// en este arreglo. La escuela atiende primaria y secundaria
// (telesecundaria), así que ambos niveles están visibles.
//
// Contenido basado en el Plan de Estudio 2022 (Nueva Escuela Mexicana):
// la primaria se organiza en Fases 3, 4 y 5 y la secundaria en la Fase 6,
// siempre con cuatro campos formativos (Lenguajes; Saberes y Pensamiento
// Científico; Ética, Naturaleza y Sociedades; De lo Humano y lo
// Comunitario). En secundaria, cada campo se trabaja por disciplinas.
type EducationLevel = {
  name: string;
  description: string;
  show: boolean;
  grades: GradePlan[];
};

const educationLevels: EducationLevel[] = [
  {
    name: 'Primaria',
    description: 'Seis grados, de 1° a 6°, organizados en tres fases del Plan de Estudio 2022. Los libros de texto se trabajan por proyectos (de aula, escolares y comunitarios).',
    show: true,
    grades: [
      {
        grade: '1er Grado · Fase 3',
        focus: 'Adquisición de la lectura y la escritura, conteo y primeras nociones de número, a partir del juego y la exploración.',
        subjects: ['Lenguajes (lectoescritura, expresión oral, artes)', 'Saberes y Pensamiento Científico (número, forma, cuerpo humano)', 'Ética, Naturaleza y Sociedades (familia, comunidad)', 'De lo Humano y lo Comunitario (emociones, juego, educación física)'],
      },
      {
        grade: '2do Grado · Fase 3',
        focus: 'Consolidación de la lectoescritura, suma y resta, y exploración del entorno natural y social.',
        subjects: ['Lenguajes (lectura, escritura de textos breves, inglés inicial)', 'Saberes y Pensamiento Científico (suma, resta, medición, seres vivos)', 'Ética, Naturaleza y Sociedades (derechos, cuidado del ambiente)', 'De lo Humano y lo Comunitario (convivencia, hábitos saludables)'],
      },
      {
        grade: '3er Grado · Fase 4',
        focus: 'Mayor autonomía en la lectura, multiplicación y primeras investigaciones sobre la comunidad.',
        subjects: ['Lenguajes (textos informativos, narrativos, inglés)', 'Saberes y Pensamiento Científico (multiplicación, fracciones sencillas, materiales)', 'Ética, Naturaleza y Sociedades (historia de la comunidad, entidad)', 'De lo Humano y lo Comunitario (educación socioemocional, vida saludable)'],
      },
      {
        grade: '4to Grado · Fase 4',
        focus: 'Comprensión lectora, división y fracciones; conocimiento de la entidad y su diversidad.',
        subjects: ['Lenguajes (argumentación oral, reseñas, inglés)', 'Saberes y Pensamiento Científico (división, fracciones, ecosistemas)', 'Ética, Naturaleza y Sociedades (geografía e historia de la entidad)', 'De lo Humano y lo Comunitario (toma de decisiones, actividad física)'],
      },
      {
        grade: '5to Grado · Fase 5',
        focus: 'Análisis de textos, operaciones con fracciones y decimales, y estudio de México en el tiempo.',
        subjects: ['Lenguajes (textos expositivos, debate, inglés)', 'Saberes y Pensamiento Científico (fracciones, decimales, energía, sexualidad y salud)', 'Ética, Naturaleza y Sociedades (historia de México, diversidad cultural)', 'De lo Humano y lo Comunitario (proyecto de vida, cuidado de sí)'],
      },
      {
        grade: '6to Grado · Fase 5',
        focus: 'Cierre de la primaria: proporcionalidad, proyectos de investigación y preparación para la secundaria.',
        subjects: ['Lenguajes (investigación, textos argumentativos, inglés)', 'Saberes y Pensamiento Científico (proporcionalidad, porcentajes, universo)', 'Ética, Naturaleza y Sociedades (México y el mundo, ciudadanía)', 'De lo Humano y lo Comunitario (transición a secundaria, orientación)'],
      },
    ],
  },
  {
    name: 'Secundaria (Telesecundaria)',
    description: 'Tres grados, de 1° a 3° (Fase 6). Un mismo docente atiende todas las disciplinas del grupo, con apoyo de materiales audiovisuales y libros propios del modelo.',
    show: true,
    grades: [
      {
        grade: '1er Grado · Fase 6',
        focus: 'Adaptación al modelo de telesecundaria, hábitos de estudio y bases de biología y geografía.',
        subjects: ['Español I', 'Inglés I', 'Artes I', 'Matemáticas I', 'Biología', 'Geografía', 'Historia I', 'Formación Cívica y Ética I', 'Tecnología I', 'Educación Física I', 'Tutoría y Educación Socioemocional I'],
      },
      {
        grade: '2do Grado · Fase 6',
        focus: 'Se profundiza el análisis, se inicia el álgebra formal y el estudio de la física.',
        subjects: ['Español II', 'Inglés II', 'Artes II', 'Matemáticas II', 'Física', 'Historia II', 'Formación Cívica y Ética II', 'Tecnología II', 'Educación Física II', 'Tutoría y Educación Socioemocional II'],
      },
      {
        grade: '3er Grado · Fase 6',
        focus: 'Cierre de la educación básica: química, consolidación académica y orientación hacia la educación media superior.',
        subjects: ['Español III', 'Inglés III', 'Artes III', 'Matemáticas III', 'Química', 'Historia III', 'Formación Cívica y Ética III', 'Tecnología III', 'Educación Física III', 'Tutoría y Educación Socioemocional III'],
      },
    ],
  },
];

const visibleEducationLevels = educationLevels.filter((level) => level.show);

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<View>('home');
  const [detailAnnouncement, setDetailAnnouncement] = useState<Announcement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [sortOrder, setSortOrder] = useState<'recientes' | 'alfabetico'>('recientes');
  const [detailNewsletter, setDetailNewsletter] = useState<Newsletter | null>(null);
  const [boletinSearch, setBoletinSearch] = useState('');
  const [boletinCategory, setBoletinCategory] = useState('Todos');
  const [boletinYear, setBoletinYear] = useState('Todos');
  const [boletinSort, setBoletinSort] = useState<'recientes' | 'alfabetico'>('recientes');
  const [calendarMonth, setCalendarMonth] = useState(new Date(2025, 8, 1));
  const [calendarViewMode, setCalendarViewMode] = useState<'mes' | 'lista'>('mes');
  const [calendarTooltip, setCalendarTooltip] = useState<{ events: CalendarEvent[]; x: number; y: number } | null>(null);
  const [detailStudy, setDetailStudy] = useState<Study | null>(null);
  const [estudioSearch, setEstudioSearch] = useState('');
  const [estudioCategory, setEstudioCategory] = useState('Todos');
  const [estudioSort, setEstudioSort] = useState<'recientes' | 'alfabetico'>('recientes');
  const [detailActivity, setDetailActivity] = useState<ActivityEntry | null>(null);
  const [detailEvent, setDetailEvent] = useState<ActivityEntry | null>(null);
  const [galeriaCategory, setGaleriaCategory] = useState('Todos');
  const activeAnnouncement = carouselAnnouncements[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % carouselAnnouncements.length);
    }, 5600);
    return () => window.clearInterval(timer);
  }, []);

  const goTo = (index: number) => setActiveIndex((index + carouselAnnouncements.length) % carouselAnnouncements.length);

  // Al cambiar de vista (inicio / listado / detalle) subimos la página al
  // inicio, igual que ocurriría al navegar a una página nueva.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [view]);

  const openDetail = (announcement: Announcement) => {
    setDetailAnnouncement(announcement);
    setView('detail');
  };
  const openAll = () => setView('all');
  const goHome = () => setView('home');
  const openBoletines = () => setView('boletines');
  const openBoletinDetail = (newsletter: Newsletter) => {
    setDetailNewsletter(newsletter);
    setView('boletinDetail');
  };
  const openCalendar = () => setView('calendar');
  const openEstudios = () => setView('estudios');
  const openStudyDetail = (study: Study) => {
    setDetailStudy(study);
    setView('estudioDetail');
  };
  const openActividades = () => setView('actividades');
  const openActividadDetail = (activity: ActivityEntry) => {
    setDetailActivity(activity);
    setView('actividadDetail');
  };
  const openEventos = () => setView('eventos');
  const openEventoDetail = (event: ActivityEntry) => {
    setDetailEvent(event);
    setView('eventoDetail');
  };
  const openGaleria = () => setView('galeria');
  const openNosotros = () => setView('nosotros');

  // Cada foto ya sabe de dónde viene (actividad, evento o aviso), así que
  // al hacer clic va directo a la publicación real en vez de abrir un
  // visor aparte sin más contexto.
  const openGalleryPhoto = (photo: GalleryPhoto) => {
    if (photo.activity) openActividadDetail(photo.activity);
    else if (photo.evento) openEventoDetail(photo.evento);
    else if (photo.announcement) openDetail(photo.announcement);
  };

  const shiftCalendarMonth = (delta: number) => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));

  const openCalendarTooltip = (events: CalendarEvent[], target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const x = Math.min(Math.max(rect.left + rect.width / 2, 140), window.innerWidth - 140);
    const y = rect.bottom + 10;
    setCalendarTooltip({ events, x, y });
  };

  // Cierra el tooltip del calendario al hacer clic fuera de él o con Escape.
  useEffect(() => {
    if (!calendarTooltip) return;
    const close = () => setCalendarTooltip(null);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setCalendarTooltip(null); };
    document.addEventListener('click', close);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [calendarTooltip]);

  const monthMatrix = buildMonthMatrix(calendarMonth.getFullYear(), calendarMonth.getMonth());
  const monthKey = monthKeyOf(calendarMonth);
  const eventsForDate = (iso: string) => calendarEvents.filter((e) => e.dateISO === iso);
  const monthEvents = calendarEvents
    .filter((e) => e.dateISO.startsWith(`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}`))
    .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime());
  const upcomingCalendarEvents = [...calendarEvents].sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()).slice(0, 3);

  // No existe un backend detrás del sitio, así que en vez de un "PDF"
  // simulado, "Descargar calendario (PDF)" e "Imprimir calendario" abren
  // el diálogo de impresión real del navegador — desde ahí se puede
  // guardar como PDF de verdad.
  const printCalendar = () => window.print();

  const downloadCalendarICS = () => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Telesecundaria Julian Carrillo//Calendario Escolar//ES'];
    calendarEvents.forEach((event, index) => {
      const [y, m, d] = event.dateISO.split('-').map(Number);
      const dateStamp = `${y}${pad(m)}${pad(d)}`;
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:evento-${index}-${dateStamp}@telesecundaria-julian-carrillo`);
      lines.push(`DTSTART;VALUE=DATE:${dateStamp}`);
      lines.push(`SUMMARY:${event.title.replace(/,/g, '\\,')}`);
      if (event.description) lines.push(`DESCRIPTION:${event.description.replace(/,/g, '\\,')}`);
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'calendario_escolar_2025_2026.ics';
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredStudies = studies
    .filter((s) => estudioCategory === 'Todos' || s.category === estudioCategory)
    .filter((s) => {
      const query = estudioSearch.trim().toLowerCase();
      if (!query) return true;
      return s.title.toLowerCase().includes(query) || s.description.toLowerCase().includes(query);
    })
    .sort((a, b) => (estudioSort === 'alfabetico' ? a.title.localeCompare(b.title) : new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()));

  const relatedStudies = detailStudy ? studies.filter((s) => s.title !== detailStudy.title).slice(0, 3) : [];
  const featuredStudies = [...studies].sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()).slice(0, 3);
  const topicCounts = studyCategories
    .map((category) => ({ category, count: studies.filter((s) => s.category === category).length }))
    .sort((a, b) => b.count - a.count);
  const maxTopicCount = Math.max(...topicCounts.map((t) => t.count));

  const studyIcon = (icon: Study['icon'], size = 26) => {
    switch (icon) {
      case 'brain': return <Brain size={size} />;
      case 'target': return <Target size={size} />;
      case 'people': return <UsersRound size={size} />;
      case 'idea': return <Lightbulb size={size} />;
      default: return <TrendingUp size={size} />;
    }
  };

  const sendStudySuggestion = () => {
    const subject = encodeURIComponent('Sugerencia para un estudio');
    const body = encodeURIComponent('Hola, me gustaría sugerir el siguiente tema de estudio:\n\n');
    window.location.href = `mailto:contacto@telesecundaria.edu.mx?subject=${subject}&body=${body}`;
  };

  // El botón "Inscribirme" ya no es un mailto: cada actividad/evento que
  // acepta inscripción trae su propio enlace a un formulario de Google
  // Forms (formLink) y ese enlace es también la condicional — si la
  // entrada no lo trae, es porque es informativa (participación abierta o
  // para todo el grupo) y en su lugar se muestra una nota, nunca un botón.

  const relatedActivities = detailActivity ? activities.filter((a) => a.title !== detailActivity.title).slice(0, 3) : [];
  const upcomingActivities = [...activities].sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()).slice(0, 3);
  const relatedEvents = detailEvent ? civicEvents.filter((e) => e.title !== detailEvent.title).slice(0, 3) : [];
  const upcomingCivicEvents = [...civicEvents].sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()).slice(0, 3);

  const filteredGalleryPhotos = galleryPhotos.filter((p) => galeriaCategory === 'Todos' || p.category === galeriaCategory);
  const galleryCategoryCounts = galleryCategories
    .map((category) => ({ category, count: galleryPhotos.filter((p) => p.category === category).length }))
    .sort((a, b) => b.count - a.count);

  const quickLinkActions: Record<string, () => void> = {
    'Boletín Escolar': openBoletines,
    'Actividades Escolares': openActividades,
    'Eventos Cívicos y Culturales': openEventos,
    'Calendario Escolar': openCalendar,
    'Gráficas de Estudio': openEstudios,
    'Galería de Fotos': openGaleria,
  };

  const navActions: Record<string, () => void> = {
    Inicio: goHome,
    Nosotros: openNosotros,
    Actividades: openActividades,
    Eventos: openEventos,
    Calendario: openCalendar,
    Seguimiento: openEstudios,
    Galería: openGaleria,
    'Boletín Escolar': openBoletines,
  };

  // A qué botón del menú corresponde cada vista, para resaltarlo — no solo
  // "Inicio" fijo, sino el que de verdad coincide con la sección en la que
  // se está (incluyendo sus vistas de detalle, como "actividadDetail").
  const viewToNavItem: Record<View, string> = {
    home: 'Inicio',
    nosotros: 'Nosotros',
    actividades: 'Actividades',
    actividadDetail: 'Actividades',
    eventos: 'Eventos',
    eventoDetail: 'Eventos',
    calendar: 'Calendario',
    estudios: 'Seguimiento',
    estudioDetail: 'Seguimiento',
    galeria: 'Galería',
    boletines: 'Boletín Escolar',
    boletinDetail: 'Boletín Escolar',
    all: 'Inicio',
    detail: 'Inicio',
  };
  const activeNavItem = viewToNavItem[view];

  const filteredAnnouncements = announcements
    .filter((a) => categoryFilter === 'Todos' || categoryLabels[a.tone] === categoryFilter)
    .filter((a) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return a.title.toLowerCase().includes(query) || a.description.toLowerCase().includes(query);
    })
    .sort((a, b) => (sortOrder === 'alfabetico' ? a.title.localeCompare(b.title) : new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()));

  const relatedAnnouncements = detailAnnouncement
    ? announcements.filter((a) => a.title !== detailAnnouncement.title).slice(0, 3)
    : [];

  const filteredNewsletters = newsletters
    .filter((n) => boletinCategory === 'Todos' || n.category === boletinCategory)
    .filter((n) => boletinYear === 'Todos' || n.dateISO.startsWith(boletinYear))
    .filter((n) => {
      const query = boletinSearch.trim().toLowerCase();
      if (!query) return true;
      return n.title.toLowerCase().includes(query) || n.description.toLowerCase().includes(query);
    })
    .sort((a, b) => (boletinSort === 'alfabetico' ? a.title.localeCompare(b.title) : new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()));

  const relatedNewsletters = detailNewsletter
    ? newsletters.filter((n) => n.title !== detailNewsletter.title).slice(0, 3)
    : [];

  const boletinCategoryIcon = (category: string) => {
    switch (category) {
      case 'Comunicados generales': return <Megaphone size={15} />;
      case 'Actividades escolares': return <Star size={15} />;
      case 'Eventos especiales': return <Calendar size={15} />;
      case 'Logros y reconocimientos': return <GraduationCap size={15} />;
      case 'Guía docente': return <Lightbulb size={15} />;
      default: return <Newspaper size={15} />;
    }
  };

  const shareContent = (content: { title: string; description: string }) => {
    if (navigator.share) {
      navigator.share({ title: content.title, text: content.description }).catch(() => {});
    }
  };

  // No existe un archivo PDF fijo guardado detrás de cada boletín, así que
  // en vez de simular una descarga que no pasa nada, este botón genera un
  // PDF real (con jsPDF) a partir del contenido del boletín, con un
  // formato cuidado: encabezado de la escuela, cita de la Dirección en un
  // recuadro y los anuncios como lista con viñetas.
  const downloadNewsletter = async (newsletter: Newsletter) => {
    try {
      // jsPDF se carga solo cuando alguien realmente descarga un boletín,
      // para no aumentar el tamaño inicial de la página para todos.
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 18;
      const contentWidth = pageWidth - marginX * 2;
      const purple: [number, number, number] = [78, 33, 193];
      const darkPurple: [number, number, number] = [23, 16, 78];
      const lightPurple: [number, number, number] = [244, 241, 255];
      const gray: [number, number, number] = [110, 102, 138];
      const ink: [number, number, number] = [40, 34, 74];

      // Encabezado morado con el logo y el nombre de la escuela.
      doc.setFillColor(...purple);
      doc.rect(0, 0, pageWidth, 34, 'F');
      try {
        const logoDataUrl = await getLogoDataUrl();
        doc.addImage(logoDataUrl, 'PNG', marginX, 8, 18, 18);
      } catch {
        // Si el logo no carga, el PDF se genera igual, solo sin la imagen.
      }
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('TELESECUNDARIA JULIÁN CARRILLO', marginX + 24, 16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Boletín Escolar', marginX + 24, 23);

      let y = 46;

      // Título y fecha.
      doc.setTextColor(...darkPurple);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(19);
      const titleLines = doc.splitTextToSize(newsletter.title, contentWidth);
      doc.text(titleLines, marginX, y);
      y += titleLines.length * 8 + 2;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(...gray);
      doc.text(`${newsletter.dateLabel}  ·  ${newsletter.category}`, marginX, y);
      y += 10;

      doc.setDrawColor(226, 217, 255);
      doc.setLineWidth(0.6);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 9;

      // Descripción.
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11.5);
      doc.setTextColor(...ink);
      const descLines = doc.splitTextToSize(newsletter.description, contentWidth);
      doc.text(descLines, marginX, y);
      y += descLines.length * 6 + 8;

      // Recuadro con el mensaje de la Dirección.
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(11);
      const quoteLines = doc.splitTextToSize(`"${newsletter.messageQuote}"`, contentWidth - 16);
      const authorLine = `— ${newsletter.messageAuthor}`;
      const quoteBoxHeight = quoteLines.length * 6 + 22;
      doc.setFillColor(...lightPurple);
      doc.roundedRect(marginX, y, contentWidth, quoteBoxHeight, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...purple);
      doc.text('MENSAJE DE LA DIRECCIÓN', marginX + 8, y + 9);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(11);
      doc.setTextColor(...darkPurple);
      doc.text(quoteLines, marginX + 8, y + 17);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...gray);
      doc.text(authorLine, marginX + 8, y + 17 + quoteLines.length * 6 + 4);
      y += quoteBoxHeight + 12;

      const ensureSpace = (needed: number) => {
        if (y + needed > pageHeight - 22) {
          doc.addPage();
          y = 20;
        }
      };

      // Entrada tipo blog (si el boletín la trae) y sugerencias para el aula.
      (newsletter.article ?? []).forEach((section) => {
        ensureSpace(16);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...darkPurple);
        const headingLines = doc.splitTextToSize(section.heading, contentWidth);
        doc.text(headingLines, marginX, y);
        y += headingLines.length * 6.5 + 3;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(...ink);
        section.paragraphs.forEach((paragraph) => {
          const paragraphLines: string[] = doc.splitTextToSize(paragraph, contentWidth);
          paragraphLines.forEach((line) => {
            ensureSpace(6);
            doc.text(line, marginX, y);
            y += 5.6;
          });
          y += 3;
        });
        y += 3;
      });

      if (newsletter.classroomTips && newsletter.classroomTips.length > 0) {
        ensureSpace(14);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...darkPurple);
        doc.text('Para llevar a tu aula', marginX, y);
        y += 9;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        newsletter.classroomTips.forEach((tip) => {
          const tipLines = doc.splitTextToSize(tip, contentWidth - 8);
          ensureSpace(tipLines.length * 6 + 4);
          doc.setFillColor(...purple);
          doc.circle(marginX + 1.4, y - 1.6, 1.1, 'F');
          doc.setTextColor(...ink);
          doc.text(tipLines, marginX + 6, y);
          y += tipLines.length * 6 + 4;
        });
        y += 4;
      }

      // Lista de anuncios importantes.
      ensureSpace(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...darkPurple);
      doc.text('Anuncios importantes', marginX, y);
      y += 9;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      newsletter.bullets.forEach((bullet) => {
        const bulletLines = doc.splitTextToSize(bullet, contentWidth - 8);
        ensureSpace(bulletLines.length * 6 + 4);
        doc.setFillColor(...purple);
        doc.circle(marginX + 1.4, y - 1.6, 1.1, 'F');
        doc.setTextColor(...ink);
        doc.text(bulletLines, marginX + 6, y);
        y += bulletLines.length * 6 + 4;
      });

      // Pie de página en todas las hojas.
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i += 1) {
        doc.setPage(i);
        doc.setDrawColor(230, 225, 250);
        doc.setLineWidth(0.4);
        doc.line(marginX, pageHeight - 16, pageWidth - marginX, pageHeight - 16);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...gray);
        doc.text('Telesecundaria Julián Carrillo', marginX, pageHeight - 10);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - marginX, pageHeight - 10, { align: 'right' });
      }

      doc.save(newsletter.fileName.replace(/\.pdf$/i, '') + '.pdf');
    } catch {
      // Si algo falla generando el PDF, no dejamos el botón en silencio.
      window.alert('No se pudo generar el PDF, intenta de nuevo.');
    }
  };

  return (
    <main className="site-shell" style={{ backgroundImage: `url("${backgroundImage}")` }}>
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Telesecundaria Julián Carrillo" onClick={(event) => { event.preventDefault(); goHome(); }}>
          <span className="brand-mark"><img src={logoImage} alt="Logo Telesecundaria Julián Carrillo" /></span>
          <span className="brand-copy"><strong>TELESECUNDARIA</strong><strong>JULIÁN CARRILLO</strong></span>
        </a>
        <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label="Abrir menú">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={menuOpen ? 'main-nav nav-open' : 'main-nav'}>
          {navItems.map((item) => {
            const action = navActions[item] as (() => void) | undefined;
            return (
              <a
                className={item === activeNavItem ? 'nav-link active-link' : 'nav-link'}
                href={action ? '#' : `#${item.toLowerCase()}`}
                key={item}
                onClick={(event) => {
                  if (action) { event.preventDefault(); action(); }
                  setMenuOpen(false);
                }}
              >{item}</a>
            );
          })}
        </nav>
      </header>

      {view === 'home' && (
      <>
      <section className="hero" id="inicio">
        <div className="hero-card">
          <button className="carousel-arrow arrow-left" onClick={() => goTo(activeIndex - 1)} aria-label="Aviso anterior"><ChevronLeft size={27} /></button>
          <div className="featured-panel">
            <div className="featured-row">
              <div className="featured-copy">
                <span className={`eyebrow eyebrow-${activeAnnouncement.tone}`}>{activeAnnouncement.label}</span>
                <h1>{activeAnnouncement.title}</h1>
                <p>{activeAnnouncement.description}</p>
                <button className="primary-button" onClick={() => openDetail(activeAnnouncement)}>Ver más <ArrowRight size={20} /></button>
              </div>
              <div className="featured-artwork">
                <img className="main-image" src={activeAnnouncement.image} alt="" />
              </div>
            </div>
            <div className="carousel-dots" aria-label="Seleccionar aviso">
              {carouselAnnouncements.map((announcement, index) => <button key={announcement.title} className={index === activeIndex ? 'dot selected-dot' : 'dot'} onClick={() => goTo(index)} aria-label={`Mostrar ${announcement.title}`} />)}
            </div>
          </div>
          <aside className="upcoming-panel">
            <div className="upcoming-list">
              {carouselAnnouncements.map((announcement, index) => {
                const isActive = index === activeIndex;
                return (
                  <div className={`upcoming-card upcoming-${announcement.tone} ${isActive ? 'upcoming-active' : ''}`} key={announcement.title}>
                    <button className="upcoming-card-select" onClick={() => goTo(index)} aria-label={`Mostrar ${announcement.title} en el aviso principal`} />
                    <span className="upcoming-content">
                      <small>{announcement.label}</small>
                      <strong>{announcement.title}</strong>
                      <em>{diaMes(announcement.dateISO)}</em>
                      <button className="small-action" onClick={() => openDetail(announcement)}>Ver más <ArrowRight size={13} /></button>
                    </span>
                    <img className="upcoming-image" src={announcement.image} alt="" />
                  </div>
                );
              })}
            </div>
            <button className="all-button" onClick={openAll}>Ver todos los avisos <ArrowRight size={18} /></button>
          </aside>
          <button className="carousel-arrow arrow-right" onClick={() => goTo(activeIndex + 1)} aria-label="Siguiente aviso"><ChevronRight size={27} /></button>
        </div>
      </section>

      <section className="values-strip">
        <div className="value-item"><span className="value-icon purple-icon"><GraduationCap /></span><span><strong>Docente</strong><small>Telesecundaria<br />Primaria y Secundaria</small></span></div>
        <div className="value-item"><span className="value-icon pink-icon"><Heart /></span><span><strong>Compromiso</strong><small>Formación integral<br />de cada alumno</small></span></div>
        <div className="value-item"><span className="value-icon yellow-icon"><Star /></span><span><strong>Aprendizaje</strong><small>Significativo<br />para la vida</small></span></div>
        <div className="value-item"><span className="value-icon blue-icon"><UsersRound /></span><span><strong>Comunidad</strong><small>Escuela, familia y<br />sociedad unidos</small></span></div>
      </section>

      <section className="quick-grid" id="secciones">
        {quickLinks.map((link) => {
          return (
            <article className={`quick-card quick-${link.tone}`} key={link.title}>
              <span className="quick-card-icon"><img src={link.icon} alt="" /></span>
              <h3>{link.title}</h3>
              <p>{link.text}</p>
              <button className="quick-card-btn" onClick={quickLinkActions[link.title]}>{link.label} <ArrowRight size={13} /></button>
            </article>
          );
        })}
      </section>

      <section className="mv-section" id="nosotros">
        <div className="mv-panel">
          <div className="mv-item">
            <span className="mv-icon"><img src={misionIcon} alt="" /></span>
            <div>
              <h3>Misión</h3>
              <p>Formar estudiantes críticos, responsables y solidarios, brindando una educación de calidad que promueva su desarrollo integral y les permita construir un mejor futuro.</p>
            </div>
          </div>
          <div className="mv-illustration"><img src={schoolIllustration} alt="Ilustración de la escuela" /></div>
          <div className="mv-item">
            <span className="mv-icon"><img src={visionIcon} alt="" /></span>
            <div>
              <h3>Visión</h3>
              <p>Ser una comunidad educativa reconocida por su compromiso con el aprendizaje significativo, la innovación y los valores que transforman vidas y comunidades.</p>
            </div>
          </div>
        </div>
        <button className="mv-more-btn" onClick={openNosotros}>Conocer más sobre nosotros <ArrowRight size={15} /></button>
      </section>

      <section className="tracking-section" id="seguimiento">
        <div className="tracking-head">
          <h2><BarChart3 /> Seguimiento y Avances</h2>
          <button className="tracking-more" onClick={openEstudios}>Ver más reportes <ArrowRight size={16} /></button>
        </div>
        <div className="tracking-grid">
          <div className="tracking-card">
            <h3>{featuredStudy.title}</h3>
            <p className="tracking-sub">Ciclo Escolar 2025 - 2026</p>
            <p className="tracking-desc">{featuredStudy.description}</p>
            <div className="progress-row">
              {featuredStudy.metrics.map((stat) => (
                <div key={stat.label}>
                  <div className="progress-line">
                    <span className="progress-line-label">
                      <span className="progress-tag" style={{ background: stat.color }}>{siglaFor(stat.label)}</span>
                      {stat.label}
                    </span>
                    <span>{stat.percentage}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-bar" style={{ width: `${stat.percentage}%`, background: stat.color }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="tracking-card-more" onClick={() => openStudyDetail(featuredStudy)}>Ver más <ArrowRight size={14} /></button>
          </div>

          <div className="tracking-card">
            <h3>Comparativo de Avances</h3>
            <p className="tracking-sub">Antes y Después de la Metodología</p>
            <div className="compare-legend">
              <span><i style={{ background: '#b7aed9' }} /> Antes</span>
              <span><i style={{ background: '#4e21c1' }} /> Después</span>
            </div>
            <div className="compare-chart">
              <div className="compare-axis" aria-hidden="true">
                <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
              </div>
              <div className="compare-bars">
                {featuredStudy.metrics.map((stat) => (
                  <div className="compare-group" key={stat.label}>
                    <div className="compare-pair">
                      <div className="compare-bar compare-bar-before" style={{ height: `${stat.before}%` }} title={`Antes: ${stat.before}%`} />
                      <div className="compare-bar compare-bar-after" style={{ height: `${stat.percentage}%` }} title={`Después: ${stat.percentage}%`} />
                    </div>
                    <span className="compare-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="encourage-card">
            <span className="encourage-emoji">☀️</span>
            <h3>¡Pequeños pasos, grandes cambios!</h3>
            <p>Con dedicación, empatía y estrategias adecuadas, seguimos creciendo juntos.</p>
            <img src={encourageIllustration} alt="Dos estudiantes celebrando sus logros" />
          </div>
        </div>
      </section>

      <section className="gallery-section" id="galería">
        <div className="gallery-head">
          <h2><Heart /> Momentos que Nos Inspiran</h2>
          <button className="gallery-more" onClick={openGaleria}>Ver galería completa <ArrowRight size={16} /></button>
        </div>
        {/* Cinta con auto-scroll infinito en bucle: la lista de fotos (ya
            con un tope, ver CAROUSEL_PHOTO_LIMIT) se pinta dos veces
            seguidas y una animación CSS recorre el primer tramo completo;
            al llegar exactamente a la mitad, el bucle reinicia sin salto
            porque la segunda mitad es idéntica a la primera — así nunca
            "termina". Se pausa al pasar el mouse o el foco para poder
            hacer clic con calma, y respeta "reducir movimiento". */}
        <div className="gallery-carousel">
          <div className="gallery-track gallery-track-loop" aria-hidden="true">
            {[...carouselGalleryPhotos, ...carouselGalleryPhotos].map((photo, index) => (
              <button className="gallery-item" key={`${photo.title}-${index}`} tabIndex={-1} onClick={() => openGalleryPhoto(photo)}>
                <img src={photo.image} alt="" loading="lazy" />
                <span className="gallery-caption">{photo.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
      </>
      )}

      {view === 'all' && (
      <>
      <section className="hero avisos-hero-wrap">
        <div className="avisos-hero">
          <div className="avisos-hero-decor" aria-hidden="true">
            <span className="ah-star ah-star-1">★</span>
            <span className="ah-star ah-star-2">★</span>
            <span className="ah-dot ah-dot-1" />
            <span className="ah-dot ah-dot-2" />
          </div>
          <div className="avisos-hero-copy">
            <button className="breadcrumb-back" onClick={goHome}><Home size={14} /> Inicio</button>
            <span className="eyebrow eyebrow-pink">Comunicados</span>
            <h1>Todos los Anuncios</h1>
            <p>Mantente al tanto de la información, eventos y avisos importantes de nuestra comunidad escolar.</p>
          </div>
          <span className="avisos-hero-icon"><Megaphone size={52} /></span>
        </div>
      </section>

      <section className="avisos-body">
        <div className="avisos-toolbar">
          <label className="avisos-search">
            <Search size={18} />
            <input type="text" placeholder="Buscar un aviso..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
          </label>
          <div className="avisos-filters">
            <span className="avisos-filters-label"><SlidersHorizontal size={15} /> Categoría</span>
            {categories.map((category) => (
              <button key={category} className={category === categoryFilter ? 'avisos-pill avisos-pill-active' : 'avisos-pill'} onClick={() => setCategoryFilter(category)}>{category}</button>
            ))}
          </div>
          <label className="avisos-sort">
            Ordenar por
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as 'recientes' | 'alfabetico')}>
              <option value="recientes">Más recientes</option>
              <option value="alfabetico">Alfabético (A-Z)</option>
            </select>
          </label>
        </div>

        {filteredAnnouncements.length > 0 ? (
          <div className="avisos-grid">
            {filteredAnnouncements.map((announcement) => (
              <article className={`avisos-card upcoming-${announcement.tone}`} key={announcement.title}>
                <div className="avisos-card-media">
                  <img src={announcement.image} alt="" />
                  <span className={`avisos-card-badge eyebrow-${announcement.tone}`}>{announcement.label}</span>
                  <span className="avisos-card-date"><Calendar size={12} /> {diaMes(announcement.dateISO)}</span>
                </div>
                <div className="avisos-card-body">
                  <h3>{announcement.title}</h3>
                  <p>{announcement.description}</p>
                  <button className="avisos-card-btn" onClick={() => openDetail(announcement)}>Ver más <ArrowRight size={13} /></button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="avisos-empty">No encontramos avisos que coincidan con tu búsqueda.</p>
        )}

        <div className="avisos-pagination">
          <button className="avisos-page-btn" disabled>‹ Anterior</button>
          <span className="avisos-page-current">1</span>
          <button className="avisos-page-btn" disabled>Siguiente ›</button>
        </div>
      </section>
      </>
      )}

      {view === 'detail' && detailAnnouncement && (
      <>
      <section className="hero aviso-detail-hero-wrap">
        <nav className="breadcrumb" aria-label="Ruta de navegación">
          <button onClick={goHome}><Home size={14} /> Inicio</button>
          <span>/</span>
          <button onClick={openAll}><Newspaper size={14} /> Todos los Anuncios</button>
          <span>/</span>
          <span className="breadcrumb-current">{detailAnnouncement.title}</span>
        </nav>
      </section>

      <section className="aviso-detail-body-section">
        <div className="aviso-detail-grid">
          <article className="aviso-detail-main">
            <div className="aviso-detail-media">
              <img src={detailAnnouncement.image} alt="" />
              <span className={`eyebrow eyebrow-${detailAnnouncement.tone} aviso-detail-badge`}>{detailAnnouncement.label}</span>
            </div>
            <div className="aviso-detail-body">
              <div className="aviso-detail-head">
                <h1>{detailAnnouncement.title}</h1>
                <button className="aviso-share-btn" onClick={() => shareContent(detailAnnouncement)}><Share2 size={16} /> Compartir</button>
              </div>
              <p className="aviso-detail-meta"><Calendar size={14} /> {detailAnnouncement.dateLabel}</p>

              <div className="aviso-detail-section">
                <h2>Descripción</h2>
                {detailAnnouncement.fullDescription.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>

              <div className="aviso-detail-section">
                <h2><CalendarClock size={17} /> Información importante</h2>
                <ul className="aviso-detail-bullets">
                  {detailAnnouncement.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              </div>

              <div className="aviso-detail-section">
                <h2><StickyNote size={17} /> Notas adicionales</h2>
                <p>Si tienes alguna duda sobre este aviso, no dudes en contactarnos a través de la sección de contacto o acércate directamente con la maestra titular.</p>
              </div>

              <div className="aviso-detail-section">
                <h2><FileText size={17} /> Archivos adjuntos</h2>
                <span className="aviso-file-chip"><Paperclip size={14} /> {detailAnnouncement.fileName}</span>
              </div>
            </div>
          </article>

          <aside className="aviso-detail-sidebar">
            <div className="sidebar-card">
              <h3>Anuncios relacionados</h3>
              <div className="sidebar-related-list">
                {relatedAnnouncements.map((announcement) => (
                  <button className="sidebar-related-item" key={announcement.title} onClick={() => openDetail(announcement)}>
                    <img src={announcement.image} alt="" />
                    <span>
                      <strong>{announcement.title}</strong>
                      <em>{diaMes(announcement.dateISO)}</em>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-card">
              <h3>Acciones rápidas</h3>
              <button className="sidebar-action" onClick={openAll}><Newspaper size={16} /> Ver todos los avisos</button>
              <button className="sidebar-action" onClick={goHome}><Home size={16} /> Volver al inicio</button>
            </div>

            <div className="sidebar-cta-card">
              <h3>¿Dudas o sugerencias?</h3>
              <p>Estoy aquí para escucharte.</p>
              <a className="sidebar-cta-btn" href={WHATSAPP_GROUP_LINK} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Contáctame</a>
            </div>
          </aside>
        </div>
      </section>
      </>
      )}

      {view === 'boletines' && (
      <>
      <section className="hero avisos-hero-wrap">
        <div className="avisos-hero boletines-hero">
          <div className="avisos-hero-decor" aria-hidden="true">
            <span className="ah-star ah-star-1">★</span>
            <span className="ah-star ah-star-2">★</span>
            <span className="ah-dot ah-dot-1" />
            <span className="ah-dot ah-dot-2" />
          </div>
          <div className="avisos-hero-copy">
            <button className="breadcrumb-back" onClick={goHome}><Home size={14} /> Inicio</button>
            <div className="boletines-hero-title-row">
              <span className="boletines-hero-icon-badge"><img src={boletinIcon} alt="" /></span>
              <h1>Boletín Escolar</h1>
            </div>
            <p>Mantente informado sobre las noticias, logros, actividades y comunicados importantes de nuestra comunidad educativa.</p>
            <div className="boletines-features">
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><Newspaper size={16} /></span>
                <span><strong>Noticias relevantes</strong><small>Información importante de la escuela.</small></span>
              </div>
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><Megaphone size={16} /></span>
                <span><strong>Actualizaciones</strong><small>Novedades y avisos de interés general.</small></span>
              </div>
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><UsersRound size={16} /></span>
                <span><strong>Comunidad unida</strong><small>Trabajando juntos por una mejor educación.</small></span>
              </div>
            </div>
          </div>
          <img className="boletines-hero-art" src={calendarImage} alt="" />
        </div>
      </section>

      <section className="avisos-body">
        <div className="boletines-layout">
          <div className="boletines-main">
            <div className="boletines-toolbar">
              <label className="avisos-search">
                <Search size={18} />
                <input type="text" placeholder="Buscar boletín..." value={boletinSearch} onChange={(event) => setBoletinSearch(event.target.value)} />
              </label>
              <select className="boletin-select" value={boletinYear} onChange={(event) => setBoletinYear(event.target.value)} aria-label="Filtrar por año">
                <option value="Todos">Todos los años</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
              <select className="boletin-select" value={boletinCategory} onChange={(event) => setBoletinCategory(event.target.value)} aria-label="Filtrar por categoría">
                <option value="Todos">Todas las categorías</option>
                {newsletterCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
              <select className="boletin-select" value={boletinSort} onChange={(event) => setBoletinSort(event.target.value as 'recientes' | 'alfabetico')} aria-label="Ordenar">
                <option value="recientes">Más recientes</option>
                <option value="alfabetico">Alfabético (A-Z)</option>
              </select>
            </div>

            {filteredNewsletters.length > 0 ? (
              <div className="boletines-list">
                {filteredNewsletters.map((newsletter) => (
                  <article className="boletin-card" key={newsletter.title}>
                    <div className={`boletin-card-cover quick-${newsletter.tone}`}>
                      <Newspaper size={28} />
                      <strong>BOLETÍN<br />ESCOLAR</strong>
                      <span className="boletin-card-badge">{newsletter.monthLabel}</span>
                    </div>
                    <div className="boletin-card-body">
                      <span className={`boletin-month-pill boletin-pill-${newsletter.tone}`}>{newsletter.monthLabel}</span>
                      <h3>{newsletter.title}</h3>
                      <p className="boletin-card-date"><Calendar size={13} /> {newsletter.dateLabel}</p>
                      <p className="boletin-card-desc">{newsletter.description}</p>
                      <div className="boletin-card-actions">
                        <button className="avisos-card-btn boletin-view-btn" onClick={() => openBoletinDetail(newsletter)}>Ver boletín <ArrowRight size={13} /></button>
                        <button className="boletin-download-btn" onClick={() => downloadNewsletter(newsletter)} aria-label={`Descargar ${newsletter.title}`}><FileText size={15} /></button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="avisos-empty">No encontramos boletines que coincidan con tu búsqueda.</p>
            )}

            <div className="avisos-pagination">
              <button className="avisos-page-btn" disabled>‹ Anterior</button>
              <span className="avisos-page-current">1</span>
              <button className="avisos-page-btn" disabled>Siguiente ›</button>
            </div>
          </div>

          <aside className="boletines-sidebar">
            <div className="sidebar-card">
              <h3>Categorías</h3>
              <div className="sidebar-category-list">
                <button className={boletinCategory === 'Todos' ? 'sidebar-category-item sidebar-category-active' : 'sidebar-category-item'} onClick={() => setBoletinCategory('Todos')}>
                  <span>{boletinCategoryIcon('Todos')} Todos los boletines</span>
                  <em>{newsletters.length}</em>
                </button>
                {newsletterCategories.map((category) => (
                  <button key={category} className={boletinCategory === category ? 'sidebar-category-item sidebar-category-active' : 'sidebar-category-item'} onClick={() => setBoletinCategory(category)}>
                    <span>{boletinCategoryIcon(category)} {category}</span>
                    <em>{newsletters.filter((n) => n.category === category).length}</em>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-card">
              <h3>Archivo por año</h3>
              {['2026', '2025'].map((year) => (
                <div className="sidebar-archive-item" key={year}><span>{year}</span><em>{newsletters.filter((n) => n.dateISO.startsWith(year)).length}</em></div>
              ))}
            </div>

            <div className="sidebar-card">
              <h3>Acciones rápidas</h3>
              <button className="sidebar-action" onClick={openAll}><Megaphone size={16} /> Ver todos los avisos</button>
              <button className="sidebar-action" onClick={goHome}><Home size={16} /> Volver al inicio</button>
            </div>

            <div className="sidebar-cta-card">
              <h3>¿Dudas o sugerencias?</h3>
              <p>Estoy aquí para escucharte.</p>
              <a className="sidebar-cta-btn" href={WHATSAPP_GROUP_LINK} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Contáctame</a>
            </div>
          </aside>
        </div>
      </section>
      </>
      )}

      {view === 'boletinDetail' && detailNewsletter && (
      <>
      <section className="hero aviso-detail-hero-wrap">
        <button className="breadcrumb-back" onClick={openBoletines}><ChevronLeft size={16} /> Volver a boletines</button>
        <nav className="breadcrumb" aria-label="Ruta de navegación">
          <button onClick={goHome}><Home size={14} /> Inicio</button>
          <span>/</span>
          <button onClick={openBoletines}><Newspaper size={14} /> Boletín Escolar</button>
          <span>/</span>
          <span className="breadcrumb-current">{detailNewsletter.title}</span>
        </nav>
      </section>

      <section className="aviso-detail-body-section">
        <div className="aviso-detail-grid">
          <article className="aviso-detail-main">
            <div className="boletin-detail-top">
              <div className="boletin-detail-copy">
                <span className={`boletin-month-pill boletin-pill-${detailNewsletter.tone}`}>{detailNewsletter.monthLabel}</span>
                <h1>{detailNewsletter.title}</h1>
                <p className="aviso-detail-meta"><Calendar size={14} /> {detailNewsletter.dateLabel} · Publicado por: {detailNewsletter.publishedBy}</p>
                <p className="boletin-detail-desc">{detailNewsletter.description}</p>
                <div className="boletin-detail-actions">
                  <button className="primary-button" onClick={() => downloadNewsletter(detailNewsletter)}><FileText size={16} /> Descargar resumen</button>
                  <button className="aviso-share-btn" onClick={() => shareContent(detailNewsletter)}><Share2 size={16} /> Compartir</button>
                </div>
              </div>
              <div className={`boletin-detail-cover quick-${detailNewsletter.tone}`}>
                <Newspaper size={40} />
                <strong>BOLETÍN<br />ESCOLAR</strong>
                <span className="boletin-card-badge">{detailNewsletter.monthLabel}</span>
              </div>
            </div>

            <div className="aviso-detail-body">
              <div className="aviso-detail-section">
                <h2><MessageCircle size={17} /> Mensaje de la Dirección</h2>
                <blockquote>
                  “{detailNewsletter.messageQuote}”
                  <footer>— {detailNewsletter.messageAuthor}</footer>
                </blockquote>
              </div>

              {detailNewsletter.article?.map((section) => (
                <div className="aviso-detail-section" key={section.heading}>
                  <h2><FileText size={17} /> {section.heading}</h2>
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              ))}

              {detailNewsletter.classroomTips && detailNewsletter.classroomTips.length > 0 && (
                <div className="aviso-detail-section">
                  <h2><Lightbulb size={17} /> Para llevar a tu aula</h2>
                  <ul className="aviso-detail-bullets">
                    {detailNewsletter.classroomTips.map((tip) => <li key={tip}>{tip}</li>)}
                  </ul>
                </div>
              )}

              <div className="aviso-detail-section">
                <h2><Star size={17} /> Noticias destacadas</h2>
                <div className="boletin-highlights">
                  {detailNewsletter.highlights.map((highlight) => (
                    <div className="boletin-highlight" key={highlight.title}>
                      <img src={highlight.image} alt="" />
                      <strong>{highlight.title}</strong>
                      <p>{highlight.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="aviso-detail-section">
                <h2><CalendarClock size={17} /> Anuncios importantes</h2>
                <ul className="aviso-detail-bullets">
                  {detailNewsletter.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              </div>

              <div className="boletin-thankyou">
                <Heart size={18} />
                <span>Gracias por ser parte de nuestra comunidad educativa. ¡Sigamos aprendiendo juntos!</span>
              </div>
            </div>
          </article>

          <aside className="aviso-detail-sidebar">
            <div className="sidebar-card">
              <h3>Acciones rápidas</h3>
              <button className="sidebar-action" onClick={openBoletines}><Newspaper size={16} /> Ver todos los boletines</button>
              <button className="sidebar-action" onClick={goHome}><Home size={16} /> Volver al inicio</button>
            </div>

            <div className="sidebar-card">
              <h3>Información del boletín</h3>
              <div className="boletin-info-list">
                <div className="boletin-info-row"><span className="boletin-info-label">Categoría</span><span className="boletin-info-pill">{detailNewsletter.category}</span></div>
                <div className="boletin-info-row"><span className="boletin-info-label">Archivo</span><span className="boletin-info-value"><FileText size={13} /> {detailNewsletter.fileName}</span></div>
                <div className="boletin-info-row"><span className="boletin-info-label">Tamaño</span><span className="boletin-info-value">{detailNewsletter.fileSize}</span></div>
                <div className="boletin-info-row"><span className="boletin-info-label">Páginas</span><span className="boletin-info-value">{detailNewsletter.pages}</span></div>
                <div className="boletin-info-row"><span className="boletin-info-label">Publicado</span><span className="boletin-info-value">{detailNewsletter.dateLabel}</span></div>
              </div>
            </div>

            <div className="sidebar-card">
              <h3>Boletines relacionados</h3>
              <div className="sidebar-related-list">
                {relatedNewsletters.map((newsletter) => (
                  <button className="sidebar-related-item" key={newsletter.title} onClick={() => openBoletinDetail(newsletter)}>
                    <span className={`sidebar-related-thumb quick-${newsletter.tone}`}><Newspaper size={16} /></span>
                    <span>
                      <strong>{newsletter.title}</strong>
                      <em>{newsletter.monthLabel}</em>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-cta-card">
              <h3>¿Dudas o sugerencias?</h3>
              <p>Estoy aquí para escucharte.</p>
              <a className="sidebar-cta-btn" href={WHATSAPP_GROUP_LINK} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Contáctame</a>
            </div>
          </aside>
        </div>
      </section>
      </>
      )}

      {view === 'calendar' && (
      <>
      <section className="hero avisos-hero-wrap">
        <div className="avisos-hero boletines-hero">
          <div className="avisos-hero-decor" aria-hidden="true">
            <span className="ah-star ah-star-1">★</span>
            <span className="ah-star ah-star-2">★</span>
            <span className="ah-dot ah-dot-1" />
            <span className="ah-dot ah-dot-2" />
          </div>
          <div className="avisos-hero-copy">
            <button className="breadcrumb-back" onClick={goHome}><Home size={14} /> Inicio</button>
            <div className="boletines-hero-title-row">
              <span className="boletines-hero-icon-badge"><img src={calendarioIcon} alt="" /></span>
              <h1>Calendario Escolar</h1>
            </div>
            <p>Consulta las fechas importantes del ciclo escolar: días festivos, exámenes, entregas y eventos especiales.</p>
            <div className="boletines-features">
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><CalendarClock size={16} /></span>
                <span><strong>Fechas clave</strong><small>Festivos, exámenes y entregas.</small></span>
              </div>
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><Flag size={16} /></span>
                <span><strong>Eventos escolares</strong><small>Actividades y celebraciones del ciclo.</small></span>
              </div>
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><Download size={16} /></span>
                <span><strong>Descarga y comparte</strong><small>Guárdalo en tu dispositivo.</small></span>
              </div>
            </div>
          </div>
          <img className="boletines-hero-art" src={calendarImage} alt="" />
        </div>
      </section>

      <section className="avisos-body">
        <div className="boletines-layout">
          <div className="boletines-main">
            <div className="calendar-card">
              <div className="calendar-toolbar">
                <div className="calendar-nav">
                  <button className="calendar-nav-btn" onClick={() => shiftCalendarMonth(-1)} aria-label="Mes anterior"><ChevronLeft size={18} /></button>
                  <select
                    className="calendar-month-select"
                    value={monthKey}
                    onChange={(event) => {
                      const found = schoolCycleMonths.find((m) => monthKeyOf(m) === event.target.value);
                      if (found) setCalendarMonth(found);
                    }}
                    aria-label="Seleccionar mes"
                  >
                    {schoolCycleMonths.map((m) => (
                      <option key={monthKeyOf(m)} value={monthKeyOf(m)}>{formatMonthLabel(m)}</option>
                    ))}
                  </select>
                  <button className="calendar-nav-btn" onClick={() => shiftCalendarMonth(1)} aria-label="Mes siguiente"><ChevronRight size={18} /></button>
                </div>
                <div className="calendar-view-toggle">
                  <button className={calendarViewMode === 'mes' ? 'calendar-view-btn calendar-view-btn-active' : 'calendar-view-btn'} onClick={() => setCalendarViewMode('mes')}>Mes</button>
                  <button className={calendarViewMode === 'lista' ? 'calendar-view-btn calendar-view-btn-active' : 'calendar-view-btn'} onClick={() => setCalendarViewMode('lista')}>Lista</button>
                </div>
              </div>

              {calendarViewMode === 'mes' ? (
                <>
                  <div className="calendar-weekdays">
                    {WEEKDAY_NAMES.map((w) => <span key={w}>{w.slice(0, 3)}</span>)}
                  </div>
                  <div className="calendar-grid">
                    {monthMatrix.map((cell) => {
                      const dayEvents = eventsForDate(cell.dateISO);
                      return (
                        <div className={cell.inMonth ? 'calendar-day' : 'calendar-day calendar-day-muted'} key={cell.dateISO}>
                          <span className="calendar-day-number">{cell.day}</span>
                          {dayEvents.length > 0 && (
                            <div className="calendar-day-events">
                              {dayEvents.length <= 2 ? (
                                dayEvents.map((event) => (
                                  <button
                                    key={event.title}
                                    className={`calendar-chip calendar-type-${event.type}`}
                                    onClick={(clickEvent) => { clickEvent.stopPropagation(); openCalendarTooltip([event], clickEvent.currentTarget); }}
                                  >
                                    <span className="calendar-chip-dot" />{event.title}
                                  </button>
                                ))
                              ) : (
                                <>
                                  <button
                                    className={`calendar-chip calendar-type-${dayEvents[0].type}`}
                                    onClick={(clickEvent) => { clickEvent.stopPropagation(); openCalendarTooltip([dayEvents[0]], clickEvent.currentTarget); }}
                                  >
                                    <span className="calendar-chip-dot" />{dayEvents[0].title}
                                  </button>
                                  <button
                                    className="calendar-chip calendar-chip-more"
                                    onClick={(clickEvent) => { clickEvent.stopPropagation(); openCalendarTooltip(dayEvents, clickEvent.currentTarget); }}
                                  >
                                    +{dayEvents.length - 1} más
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                monthEvents.length > 0 ? (
                  <div className="calendar-list">
                    {monthEvents.map((event) => {
                      const day = Number(event.dateISO.split('-')[2]);
                      return (
                        <div className="calendar-list-row" key={event.title + event.dateISO}>
                          <div className={`calendar-list-date calendar-type-${event.type}`}>
                            <strong>{day}</strong>
                            <span>{MONTH_NAMES[calendarMonth.getMonth()].slice(0, 3)}</span>
                          </div>
                          <div className="calendar-list-body">
                            <div className="calendar-list-head">
                              <h3>{event.title}</h3>
                              <span className={`calendar-type-pill calendar-type-${event.type}`}>{eventTypeInfo[event.type].label}</span>
                            </div>
                            {event.location && <p className="calendar-list-meta"><MapPin size={12} /> {event.location}</p>}
                            {event.description && <p>{event.description}</p>}
                            {event.announcement && (
                              <button className="calendar-list-link" onClick={() => openDetail(event.announcement!)}>Ver aviso completo <ArrowRight size={12} /></button>
                            )}
                            {event.activity && (
                              <button className="calendar-list-link" onClick={() => openActividadDetail(event.activity!)}>Ver actividad completa <ArrowRight size={12} /></button>
                            )}
                            {event.evento && (
                              <button className="calendar-list-link" onClick={() => openEventoDetail(event.evento!)}>Ver evento completo <ArrowRight size={12} /></button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="avisos-empty">No hay eventos registrados para este mes.</p>
                )
              )}
            </div>

            <div className="calendar-legend">
              {(Object.keys(eventTypeInfo) as CalendarEventType[]).map((type) => (
                <span className="calendar-legend-item" key={type}>
                  <span className={`calendar-legend-dot calendar-type-${type}`} />
                  {eventTypeInfo[type].label}
                </span>
              ))}
            </div>

            <div className="calendar-notice">
              <Info size={16} />
              <span>Las fechas pueden estar sujetas a cambios. Te recomendamos consultar esta página regularmente y estar atento a los avisos oficiales de la escuela.</span>
            </div>

            <div className="calendar-print-cta">
              <img src={notebookImage} alt="" />
              <div className="calendar-print-cta-copy">
                <h3>¿Necesitas el calendario a la mano?</h3>
                <p>Descárgalo en tu dispositivo o imprímelo para tenerlo siempre presente.</p>
              </div>
              <div className="calendar-print-cta-actions">
                <button className="primary-button" onClick={downloadCalendarICS}><Download size={16} /> Descargar (.ics)</button>
                <button className="aviso-share-btn" onClick={printCalendar}><Printer size={16} /> Imprimir</button>
              </div>
            </div>
          </div>

          <aside className="boletines-sidebar">
            <div className="sidebar-card">
              <h3>Acciones rápidas</h3>
              <button className="sidebar-action" onClick={downloadCalendarICS}><Download size={16} /> Descargar calendario (.ics)</button>
              <button className="sidebar-action" onClick={printCalendar}><Printer size={16} /> Imprimir calendario</button>
              <button className="sidebar-action" onClick={() => setCalendarViewMode(calendarViewMode === 'mes' ? 'lista' : 'mes')}><List size={16} /> Ver por {calendarViewMode === 'mes' ? 'lista' : 'mes'}</button>
              <button className="sidebar-action" onClick={goHome}><Home size={16} /> Volver al inicio</button>
            </div>

            <div className="sidebar-card">
              <h3>Próximos eventos</h3>
              <div className="sidebar-related-list">
                {upcomingCalendarEvents.map((event) => (
                  <button
                    className="sidebar-related-item"
                    key={event.title + event.dateISO}
                    onClick={(clickEvent) => openCalendarTooltip([event], clickEvent.currentTarget)}
                  >
                    <span className={`sidebar-related-thumb calendar-solid-thumb calendar-type-${event.type}`}><Calendar size={16} /></span>
                    <span>
                      <strong>{event.title}</strong>
                      <em>{formatFullDate(event.dateISO)}</em>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-card">
              <h3>Leyenda del calendario</h3>
              <div className="calendar-legend-list">
                {(Object.keys(eventTypeInfo) as CalendarEventType[]).map((type) => (
                  <div className="calendar-legend-row" key={type}>
                    <span className={`calendar-legend-dot calendar-type-${type}`} />
                    <span>
                      <strong>{eventTypeInfo[type].label}</strong>
                      <em>{eventTypeInfo[type].description}</em>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
      </>
      )}

      {calendarTooltip && (
        <div
          className="calendar-tooltip"
          style={{ left: calendarTooltip.x, top: calendarTooltip.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <button className="calendar-tooltip-close" onClick={() => setCalendarTooltip(null)} aria-label="Cerrar"><X size={14} /></button>
          {calendarTooltip.events.map((event) => (
            <div className="calendar-tooltip-item" key={event.title + event.dateISO}>
              <div className="calendar-tooltip-item-head">
                <span className={`calendar-dot calendar-type-${event.type}`} />
                <strong>{event.title}</strong>
              </div>
              <p className="calendar-tooltip-meta"><Calendar size={12} /> {formatFullDate(event.dateISO)}{event.location ? ` · ${event.location}` : ''}</p>
              {event.description && <p className="calendar-tooltip-desc">{event.description}</p>}
              {event.announcement && (
                <button className="calendar-tooltip-link" onClick={() => { setCalendarTooltip(null); openDetail(event.announcement!); }}>Ver aviso completo <ArrowRight size={12} /></button>
              )}
              {event.activity && (
                <button className="calendar-tooltip-link" onClick={() => { setCalendarTooltip(null); openActividadDetail(event.activity!); }}>Ver actividad completa <ArrowRight size={12} /></button>
              )}
              {event.evento && (
                <button className="calendar-tooltip-link" onClick={() => { setCalendarTooltip(null); openEventoDetail(event.evento!); }}>Ver evento completo <ArrowRight size={12} /></button>
              )}
            </div>
          ))}
        </div>
      )}

      {view === 'estudios' && (
      <>
      <section className="hero avisos-hero-wrap">
        <div className="avisos-hero boletines-hero">
          <div className="avisos-hero-decor" aria-hidden="true">
            <span className="ah-star ah-star-1">★</span>
            <span className="ah-star ah-star-2">★</span>
            <span className="ah-dot ah-dot-1" />
            <span className="ah-dot ah-dot-2" />
          </div>
          <div className="avisos-hero-copy">
            <button className="breadcrumb-back" onClick={goHome}><Home size={14} /> Inicio</button>
            <div className="boletines-hero-title-row">
              <span className="boletines-hero-icon-badge"><img src={graficasIcon} alt="" /></span>
              <h1>Gráficas de Estudios</h1>
            </div>
            <p>Consulta los estudios y análisis que realizamos para dar seguimiento al progreso académico y bienestar de nuestro grupo.</p>
            <div className="boletines-features">
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><BarChart3 size={16} /></span>
                <span><strong>Resultados claros</strong><small>Datos presentados de forma sencilla.</small></span>
              </div>
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><TrendingUp size={16} /></span>
                <span><strong>Seguimiento continuo</strong><small>Estudios actualizados cada ciclo.</small></span>
              </div>
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><Lightbulb size={16} /></span>
                <span><strong>Mejora constante</strong><small>Estrategias basadas en evidencia.</small></span>
              </div>
            </div>
          </div>
          <img className="boletines-hero-art" src={trophyImage} alt="" />
        </div>
      </section>

      <section className="avisos-body">
        <div className="boletines-layout">
          <div className="boletines-main">
            <div className="boletines-toolbar">
              <label className="avisos-search">
                <Search size={18} />
                <input type="text" placeholder="Buscar estudio..." value={estudioSearch} onChange={(event) => setEstudioSearch(event.target.value)} />
              </label>
              <select className="boletin-select" value={estudioCategory} onChange={(event) => setEstudioCategory(event.target.value)} aria-label="Filtrar por categoría">
                <option value="Todos">Todas las categorías</option>
                {studyCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
              <select className="boletin-select" value={estudioSort} onChange={(event) => setEstudioSort(event.target.value as 'recientes' | 'alfabetico')} aria-label="Ordenar">
                <option value="recientes">Más recientes</option>
                <option value="alfabetico">Alfabético (A-Z)</option>
              </select>
            </div>

            {filteredStudies.length > 0 ? (
              <div className="avisos-grid">
                {filteredStudies.map((study) => (
                  <article className="avisos-card estudio-card" key={study.title}>
                    <div className={`estudio-card-icon estudio-icon-${study.icon}`}>{studyIcon(study.icon, 30)}</div>
                    <div className="avisos-card-body">
                      <span className="estudio-category-pill">{study.category}</span>
                      <h3>{study.title}</h3>
                      <p>{study.description}</p>
                      <p className="estudio-card-meta"><Calendar size={12} /> {study.dateLabel} · {study.readTime}</p>
                      <button className="avisos-card-btn" onClick={() => openStudyDetail(study)}>Leer estudio <ArrowRight size={13} /></button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="avisos-empty">No encontramos estudios que coincidan con tu búsqueda.</p>
            )}

            <div className="avisos-pagination">
              <button className="avisos-page-btn" disabled>‹ Anterior</button>
              <span className="avisos-page-current">1</span>
              <button className="avisos-page-btn" disabled>Siguiente ›</button>
            </div>
          </div>

          <aside className="boletines-sidebar">
            <div className="sidebar-card">
              <h3>Temas más consultados</h3>
              <div className="progress-row">
                {topicCounts.map((topic) => (
                  <div key={topic.category}>
                    <div className="progress-line">
                      <span className="progress-line-label">{topic.category}</span>
                      <span>{topic.count}</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-bar" style={{ width: `${(topic.count / maxTopicCount) * 100}%`, background: '#4e21c1' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-card">
              <h3>Estudios destacados</h3>
              <div className="sidebar-related-list">
                {featuredStudies.map((study) => (
                  <button className="sidebar-related-item" key={study.title} onClick={() => openStudyDetail(study)}>
                    <span className={`sidebar-related-thumb estudio-icon-${study.icon}`}>{studyIcon(study.icon, 16)}</span>
                    <span>
                      <strong>{study.title}</strong>
                      <em>{study.dateLabel}</em>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-card">
              <h3>Acciones rápidas</h3>
              <button className="sidebar-action" onClick={goHome}><Home size={16} /> Volver al inicio</button>
            </div>

            <div className="sidebar-cta-card">
              <h3>¿Tienes una idea para un estudio?</h3>
              <p>Cuéntanos qué te gustaría que analicemos.</p>
              <button className="sidebar-cta-btn" onClick={sendStudySuggestion}><Send size={16} /> Sugerir tema</button>
            </div>
          </aside>
        </div>
      </section>
      </>
      )}

      {view === 'estudioDetail' && detailStudy && (
      <>
      <section className="hero aviso-detail-hero-wrap">
        <button className="breadcrumb-back" onClick={openEstudios}><ChevronLeft size={16} /> Volver a estudios</button>
        <nav className="breadcrumb" aria-label="Ruta de navegación">
          <button onClick={goHome}><Home size={14} /> Inicio</button>
          <span>/</span>
          <button onClick={openEstudios}><BarChart3 size={14} /> Gráficas de Estudios</button>
          <span>/</span>
          <span className="breadcrumb-current">{detailStudy.title}</span>
        </nav>
      </section>

      <section className="aviso-detail-body-section">
        <div className="aviso-detail-grid">
          <article className="aviso-detail-main">
            <div className="estudio-detail-top">
              <div className={`estudio-detail-icon estudio-icon-${detailStudy.icon}`}>{studyIcon(detailStudy.icon, 34)}</div>
              <div className="estudio-detail-copy">
                <span className="estudio-category-pill">{detailStudy.category}</span>
                <h1>{detailStudy.title}</h1>
                <p className="aviso-detail-meta"><Calendar size={14} /> {detailStudy.dateLabel} · {detailStudy.readTime}</p>
              </div>
            </div>

            <div className="aviso-detail-body">
              <div className="aviso-detail-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 0 }}>
                {detailStudy.fullDescription.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>

              <div className="aviso-detail-section">
                <h2><BarChart3 size={17} /> Resultados</h2>
                <div className="progress-row">
                  {detailStudy.metrics.map((stat) => (
                    <div key={stat.label}>
                      <div className="progress-line">
                        <span className="progress-line-label">
                          <span className="progress-tag" style={{ background: stat.color }}>{siglaFor(stat.label)}</span>
                          {stat.label}
                        </span>
                        <span>{stat.percentage}%</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-bar" style={{ width: `${stat.percentage}%`, background: stat.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="aviso-detail-section">
                <h2><TrendingUp size={17} /> Comparativo: Antes y Después</h2>
                <div className="compare-legend">
                  <span><i style={{ background: '#b7aed9' }} /> Antes</span>
                  <span><i style={{ background: '#4e21c1' }} /> Después</span>
                </div>
                <div className="compare-chart">
                  <div className="compare-axis" aria-hidden="true">
                    <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
                  </div>
                  <div className="compare-bars">
                    {detailStudy.metrics.map((stat) => (
                      <div className="compare-group" key={stat.label}>
                        <div className="compare-pair">
                          <div className="compare-bar compare-bar-before" style={{ height: `${stat.before}%` }} title={`Antes: ${stat.before}%`} />
                          <div className="compare-bar compare-bar-after" style={{ height: `${stat.percentage}%` }} title={`Después: ${stat.percentage}%`} />
                        </div>
                        <span className="compare-label">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="aviso-detail-section">
                <h2><Lightbulb size={17} /> Conclusión</h2>
                <blockquote>
                  “{detailStudy.highlight}”
                </blockquote>
              </div>

              {detailStudy.steps && detailStudy.steps.length > 0 && (
                <div className="aviso-detail-section">
                  <h2><List size={17} /> Cómo replicarlo en tu escuela</h2>
                  <ol className="aviso-detail-bullets">
                    {detailStudy.steps.map((step) => <li key={step}>{step}</li>)}
                  </ol>
                </div>
              )}

              {detailStudy.sources && detailStudy.sources.length > 0 && (
                <div className="aviso-detail-section">
                  <h2><FileText size={17} /> Referencias</h2>
                  <ul className="aviso-detail-bullets">
                    {detailStudy.sources.map((source) => <li key={source}>{source}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </article>

          <aside className="aviso-detail-sidebar">
            <div className="sidebar-card">
              <h3>Acciones rápidas</h3>
              <button className="sidebar-action" onClick={openEstudios}><BarChart3 size={16} /> Ver todos los estudios</button>
              <button className="sidebar-action" onClick={goHome}><Home size={16} /> Volver al inicio</button>
            </div>

            <div className="sidebar-card">
              <h3>Estudios relacionados</h3>
              <div className="sidebar-related-list">
                {relatedStudies.map((study) => (
                  <button className="sidebar-related-item" key={study.title} onClick={() => openStudyDetail(study)}>
                    <span className={`sidebar-related-thumb estudio-icon-${study.icon}`}>{studyIcon(study.icon, 16)}</span>
                    <span>
                      <strong>{study.title}</strong>
                      <em>{study.dateLabel}</em>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-cta-card">
              <h3>¿Dudas o sugerencias?</h3>
              <p>Estoy aquí para escucharte.</p>
              <a className="sidebar-cta-btn" href={WHATSAPP_GROUP_LINK} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Contáctame</a>
            </div>
          </aside>
        </div>
      </section>
      </>
      )}

      {view === 'actividades' && (
      <>
      <section className="hero avisos-hero-wrap">
        <div className="avisos-hero boletines-hero">
          <div className="avisos-hero-decor" aria-hidden="true">
            <span className="ah-star ah-star-1">★</span>
            <span className="ah-star ah-star-2">★</span>
            <span className="ah-dot ah-dot-1" />
            <span className="ah-dot ah-dot-2" />
          </div>
          <div className="avisos-hero-copy">
            <button className="breadcrumb-back" onClick={goHome}><Home size={14} /> Inicio</button>
            <div className="boletines-hero-title-row">
              <span className="boletines-hero-icon-badge"><img src={actividadesIcon} alt="" /></span>
              <h1>Actividades Escolares</h1>
            </div>
            <p>Descubre las actividades académicas, colaborativas y deportivas que forman parte de la vida diaria de nuestra escuela.</p>
            <div className="boletines-features">
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><Star size={16} /></span>
                <span><strong>Aprendizaje activo</strong><small>Actividades que refuerzan lo visto en clase.</small></span>
              </div>
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><UsersRound size={16} /></span>
                <span><strong>Trabajo en equipo</strong><small>Fomentamos la colaboración entre estudiantes.</small></span>
              </div>
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><Heart size={16} /></span>
                <span><strong>Comunidad</strong><small>Toda la familia escolar puede participar.</small></span>
              </div>
            </div>
          </div>
          <img className="boletines-hero-art" src={schoolIllustration} alt="" />
        </div>
      </section>

      <section className="avisos-body">
        <div className="boletines-layout">
          <div className="boletines-main">
            {activities.length > 0 ? (
              <div className="avisos-grid">
                {activities.map((activity) => (
                  <article className={`avisos-card upcoming-${activity.tone}`} key={activity.title}>
                    <div className="avisos-card-media">
                      <img src={activity.image} alt="" />
                      <span className={`avisos-card-badge eyebrow-${activity.tone}`}>{activity.category}</span>
                      <span className="avisos-card-date"><Calendar size={12} /> {activity.dateLabel}</span>
                    </div>
                    <div className="avisos-card-body">
                      <h3>{activity.title}</h3>
                      <p>{activity.description}</p>
                      <button className="avisos-card-btn" onClick={() => openActividadDetail(activity)}>Ver más <ArrowRight size={13} /></button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="avisos-empty">No hay actividades registradas por el momento.</p>
            )}

            <div className="avisos-pagination">
              <button className="avisos-page-btn" disabled>‹ Anterior</button>
              <span className="avisos-page-current">1</span>
              <button className="avisos-page-btn" disabled>Siguiente ›</button>
            </div>
          </div>

          <aside className="boletines-sidebar">
            <div className="sidebar-card">
              <h3>Acciones rápidas</h3>
              <button className="sidebar-action" onClick={openEventos}><Flag size={16} /> Ver eventos cívicos</button>
              <button className="sidebar-action" onClick={openCalendar}><Calendar size={16} /> Ir al calendario</button>
              <button className="sidebar-action" onClick={goHome}><Home size={16} /> Volver al inicio</button>
            </div>

            <div className="sidebar-card">
              <h3>Próximas actividades</h3>
              <div className="sidebar-related-list">
                {upcomingActivities.map((activity) => (
                  <button className="sidebar-related-item" key={activity.title} onClick={() => openActividadDetail(activity)}>
                    <img src={activity.image} alt="" />
                    <span>
                      <strong>{activity.title}</strong>
                      <em>{activity.dateLabel}</em>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-cta-card">
              <h3>¿Dudas o sugerencias?</h3>
              <p>Estoy aquí para escucharte.</p>
              <a className="sidebar-cta-btn" href={WHATSAPP_GROUP_LINK} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Contáctame</a>
            </div>
          </aside>
        </div>
      </section>
      </>
      )}

      {view === 'actividadDetail' && detailActivity && (
      <>
      <section className="hero aviso-detail-hero-wrap">
        <button className="breadcrumb-back" onClick={openActividades}><ChevronLeft size={16} /> Volver a actividades</button>
        <nav className="breadcrumb" aria-label="Ruta de navegación">
          <button onClick={goHome}><Home size={14} /> Inicio</button>
          <span>/</span>
          <button onClick={openActividades}><Star size={14} /> Actividades Escolares</button>
          <span>/</span>
          <span className="breadcrumb-current">{detailActivity.title}</span>
        </nav>
      </section>

      <section className="aviso-detail-body-section">
        <div className="aviso-detail-grid">
          <article className="aviso-detail-main">
            <div className="aviso-detail-media">
              <img src={detailActivity.image} alt="" />
              <span className={`eyebrow eyebrow-${detailActivity.tone} aviso-detail-badge`}>{detailActivity.category}</span>
            </div>
            <div className="aviso-detail-body">
              <div className="aviso-detail-head">
                <h1>{detailActivity.title}</h1>
                <button className="aviso-share-btn" onClick={() => shareContent(detailActivity)}><Share2 size={16} /> Compartir</button>
              </div>
              <p className="aviso-detail-meta"><Calendar size={14} /> {detailActivity.dateLabel} · <Clock size={14} /> {detailActivity.time} · <MapPin size={14} /> {detailActivity.location}</p>

              <div className="activity-detail-actions">
                {detailActivity.formLink ? (
                  <a className="primary-button" href={detailActivity.formLink} target="_blank" rel="noopener noreferrer"><Send size={16} /> Inscribirme</a>
                ) : (
                  <p className="activity-info-note"><Info size={16} /> Esta actividad es para todo el grupo: no requiere inscripción previa.</p>
                )}
              </div>

              <div className="aviso-detail-section">
                <h2>Descripción</h2>
                {detailActivity.fullDescription.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                <div className="activity-highlight-box"><Flame size={16} /> {detailActivity.highlight}</div>
              </div>

              <div className="aviso-detail-section">
                <h2><Target size={17} /> Objetivos</h2>
                <div className="activity-objectives">
                  {detailActivity.objectives.map((objective, index) => {
                    const icons = [Target, Lightbulb, Star];
                    const ObjectiveIcon = icons[index % icons.length];
                    return (
                      <div className="activity-objective" key={objective.title}>
                        <span className="activity-objective-icon"><ObjectiveIcon size={17} /></span>
                        <div>
                          <strong>{objective.title}</strong>
                          <p>{objective.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="aviso-detail-section">
                <h2><Info size={17} /> Detalles de la actividad</h2>
                <div className="activity-details-grid">
                  {detailActivity.details.map((detail) => (
                    <div className="activity-detail-row" key={detail.label}>
                      <span>{detail.label}</span>
                      <strong>{detail.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="aviso-detail-section">
                <h2><List size={17} /> Materiales necesarios</h2>
                <ul className="aviso-detail-bullets">
                  {detailActivity.materials.map((material) => <li key={material}>{material}</li>)}
                </ul>
              </div>

              <div className="aviso-detail-section">
                <h2><Star size={17} /> Galería de ediciones anteriores</h2>
                <div className="activity-gallery">
                  {detailActivity.gallery.map((image, index) => (
                    <img src={image} alt="" key={index} />
                  ))}
                </div>
              </div>
            </div>
          </article>

          <aside className="aviso-detail-sidebar">
            <div className="sidebar-card">
              <h3>Acciones rápidas</h3>
              <button className="sidebar-action" onClick={openActividades}><Star size={16} /> Ver todas las actividades</button>
              <button className="sidebar-action" onClick={openEventos}><Flag size={16} /> Ver eventos cívicos</button>
              <button className="sidebar-action" onClick={goHome}><Home size={16} /> Volver al inicio</button>
            </div>

            {detailActivity.announcement && (
              <div className="sidebar-card">
                <h3>Aviso relacionado</h3>
                <button className="sidebar-related-item" onClick={() => openDetail(detailActivity.announcement!)}>
                  <img src={detailActivity.announcement.image} alt="" />
                  <span>
                    <strong>{detailActivity.announcement.title}</strong>
                    <em>Ver aviso completo</em>
                  </span>
                </button>
              </div>
            )}

            <div className="sidebar-card">
              <h3>Actividades relacionadas</h3>
              <div className="sidebar-related-list">
                {relatedActivities.map((activity) => (
                  <button className="sidebar-related-item" key={activity.title} onClick={() => openActividadDetail(activity)}>
                    <img src={activity.image} alt="" />
                    <span>
                      <strong>{activity.title}</strong>
                      <em>{activity.dateLabel}</em>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-cta-card">
              {detailActivity.formLink ? (
                <>
                  <h3>¿Quieres participar?</h3>
                  <p>Inscríbete y sé parte de esta actividad.</p>
                  <a className="sidebar-cta-btn" href={detailActivity.formLink} target="_blank" rel="noopener noreferrer"><Send size={16} /> Inscribirme</a>
                </>
              ) : (
                <>
                  <h3>¿Dudas o sugerencias?</h3>
                  <p>Estoy aquí para escucharte.</p>
                  <a className="sidebar-cta-btn" href={WHATSAPP_GROUP_LINK} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Contáctame</a>
                </>
              )}
            </div>
          </aside>
        </div>
      </section>
      </>
      )}

      {view === 'eventos' && (
      <>
      <section className="hero avisos-hero-wrap">
        <div className="avisos-hero boletines-hero">
          <div className="avisos-hero-decor" aria-hidden="true">
            <span className="ah-star ah-star-1">★</span>
            <span className="ah-star ah-star-2">★</span>
            <span className="ah-dot ah-dot-1" />
            <span className="ah-dot ah-dot-2" />
          </div>
          <div className="avisos-hero-copy">
            <button className="breadcrumb-back" onClick={goHome}><Home size={14} /> Inicio</button>
            <div className="boletines-hero-title-row">
              <span className="boletines-hero-icon-badge"><img src={eventosIcon} alt="" /></span>
              <h1>Eventos Cívicos y Culturales</h1>
            </div>
            <p>Celebramos y fortalecemos nuestros valores cívicos y culturales a través de ceremonias, exposiciones y festivales.</p>
            <div className="boletines-features">
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><Flag size={16} /></span>
                <span><strong>Valores cívicos</strong><small>Respeto a nuestros símbolos patrios.</small></span>
              </div>
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><Star size={16} /></span>
                <span><strong>Expresión cultural</strong><small>Arte, música y tradiciones.</small></span>
              </div>
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><Heart size={16} /></span>
                <span><strong>Comunidad unida</strong><small>Toda la familia escolar puede participar.</small></span>
              </div>
            </div>
          </div>
          <img className="boletines-hero-art" src={encourageIllustration} alt="" />
        </div>
      </section>

      <section className="avisos-body">
        <div className="boletines-layout">
          <div className="boletines-main">
            {civicEvents.length > 0 ? (
              <div className="avisos-grid">
                {civicEvents.map((event) => (
                  <article className={`avisos-card upcoming-${event.tone}`} key={event.title}>
                    <div className="avisos-card-media">
                      <img src={event.image} alt="" />
                      <span className={`avisos-card-badge eyebrow-${event.tone}`}>{event.category}</span>
                      <span className="avisos-card-date"><Calendar size={12} /> {event.dateLabel}</span>
                    </div>
                    <div className="avisos-card-body">
                      <h3>{event.title}</h3>
                      <p>{event.description}</p>
                      <button className="avisos-card-btn" onClick={() => openEventoDetail(event)}>Ver más <ArrowRight size={13} /></button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="avisos-empty">No hay eventos registrados por el momento.</p>
            )}

            <div className="avisos-pagination">
              <button className="avisos-page-btn" disabled>‹ Anterior</button>
              <span className="avisos-page-current">1</span>
              <button className="avisos-page-btn" disabled>Siguiente ›</button>
            </div>
          </div>

          <aside className="boletines-sidebar">
            <div className="sidebar-card">
              <h3>Acciones rápidas</h3>
              <button className="sidebar-action" onClick={openActividades}><Star size={16} /> Ver actividades escolares</button>
              <button className="sidebar-action" onClick={openCalendar}><Calendar size={16} /> Ir al calendario</button>
              <button className="sidebar-action" onClick={goHome}><Home size={16} /> Volver al inicio</button>
            </div>

            <div className="sidebar-card">
              <h3>Próximos eventos</h3>
              <div className="sidebar-related-list">
                {upcomingCivicEvents.map((event) => (
                  <button className="sidebar-related-item" key={event.title} onClick={() => openEventoDetail(event)}>
                    <img src={event.image} alt="" />
                    <span>
                      <strong>{event.title}</strong>
                      <em>{event.dateLabel}</em>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-cta-card">
              <h3>¿Dudas o sugerencias?</h3>
              <p>Estoy aquí para escucharte.</p>
              <a className="sidebar-cta-btn" href={WHATSAPP_GROUP_LINK} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Contáctame</a>
            </div>
          </aside>
        </div>
      </section>
      </>
      )}

      {view === 'eventoDetail' && detailEvent && (
      <>
      <section className="hero aviso-detail-hero-wrap">
        <button className="breadcrumb-back" onClick={openEventos}><ChevronLeft size={16} /> Volver a eventos</button>
        <nav className="breadcrumb" aria-label="Ruta de navegación">
          <button onClick={goHome}><Home size={14} /> Inicio</button>
          <span>/</span>
          <button onClick={openEventos}><Flag size={14} /> Eventos Cívicos y Culturales</button>
          <span>/</span>
          <span className="breadcrumb-current">{detailEvent.title}</span>
        </nav>
      </section>

      <section className="aviso-detail-body-section">
        <div className="aviso-detail-grid">
          <article className="aviso-detail-main">
            <div className="aviso-detail-media">
              <img src={detailEvent.image} alt="" />
              <span className={`eyebrow eyebrow-${detailEvent.tone} aviso-detail-badge`}>{detailEvent.category}</span>
            </div>
            <div className="aviso-detail-body">
              <div className="aviso-detail-head">
                <h1>{detailEvent.title}</h1>
                <button className="aviso-share-btn" onClick={() => shareContent(detailEvent)}><Share2 size={16} /> Compartir</button>
              </div>
              <p className="aviso-detail-meta"><Calendar size={14} /> {detailEvent.dateLabel} · <Clock size={14} /> {detailEvent.time} · <MapPin size={14} /> {detailEvent.location}</p>

              <div className="activity-detail-actions">
                {detailEvent.formLink ? (
                  <a className="primary-button" href={detailEvent.formLink} target="_blank" rel="noopener noreferrer"><Send size={16} /> Inscribirme</a>
                ) : (
                  <p className="activity-info-note"><Info size={16} /> Este evento es para toda la comunidad escolar: no requiere inscripción previa.</p>
                )}
              </div>

              <div className="aviso-detail-section">
                <h2>Descripción</h2>
                {detailEvent.fullDescription.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                <div className="activity-highlight-box"><Flame size={16} /> {detailEvent.highlight}</div>
              </div>

              <div className="aviso-detail-section">
                <h2><Target size={17} /> Objetivos</h2>
                <div className="activity-objectives">
                  {detailEvent.objectives.map((objective, index) => {
                    const icons = [Target, Lightbulb, Star];
                    const ObjectiveIcon = icons[index % icons.length];
                    return (
                      <div className="activity-objective" key={objective.title}>
                        <span className="activity-objective-icon"><ObjectiveIcon size={17} /></span>
                        <div>
                          <strong>{objective.title}</strong>
                          <p>{objective.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="aviso-detail-section">
                <h2><Info size={17} /> Detalles del evento</h2>
                <div className="activity-details-grid">
                  {detailEvent.details.map((detail) => (
                    <div className="activity-detail-row" key={detail.label}>
                      <span>{detail.label}</span>
                      <strong>{detail.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="aviso-detail-section">
                <h2><List size={17} /> Materiales necesarios</h2>
                <ul className="aviso-detail-bullets">
                  {detailEvent.materials.map((material) => <li key={material}>{material}</li>)}
                </ul>
              </div>

              <div className="aviso-detail-section">
                <h2><Star size={17} /> Galería de ediciones anteriores</h2>
                <div className="activity-gallery">
                  {detailEvent.gallery.map((image, index) => (
                    <img src={image} alt="" key={index} />
                  ))}
                </div>
              </div>
            </div>
          </article>

          <aside className="aviso-detail-sidebar">
            <div className="sidebar-card">
              <h3>Acciones rápidas</h3>
              <button className="sidebar-action" onClick={openEventos}><Flag size={16} /> Ver todos los eventos</button>
              <button className="sidebar-action" onClick={openActividades}><Star size={16} /> Ver actividades escolares</button>
              <button className="sidebar-action" onClick={goHome}><Home size={16} /> Volver al inicio</button>
            </div>

            {detailEvent.announcement && (
              <div className="sidebar-card">
                <h3>Aviso relacionado</h3>
                <button className="sidebar-related-item" onClick={() => openDetail(detailEvent.announcement!)}>
                  <img src={detailEvent.announcement.image} alt="" />
                  <span>
                    <strong>{detailEvent.announcement.title}</strong>
                    <em>Ver aviso completo</em>
                  </span>
                </button>
              </div>
            )}

            <div className="sidebar-card">
              <h3>Eventos relacionados</h3>
              <div className="sidebar-related-list">
                {relatedEvents.map((event) => (
                  <button className="sidebar-related-item" key={event.title} onClick={() => openEventoDetail(event)}>
                    <img src={event.image} alt="" />
                    <span>
                      <strong>{event.title}</strong>
                      <em>{event.dateLabel}</em>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-cta-card">
              {detailEvent.formLink ? (
                <>
                  <h3>¿Quieres participar?</h3>
                  <p>Inscríbete y sé parte de este evento.</p>
                  <a className="sidebar-cta-btn" href={detailEvent.formLink} target="_blank" rel="noopener noreferrer"><Send size={16} /> Inscribirme</a>
                </>
              ) : (
                <>
                  <h3>¿Dudas o sugerencias?</h3>
                  <p>Estoy aquí para escucharte.</p>
                  <a className="sidebar-cta-btn" href={WHATSAPP_GROUP_LINK} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Contáctame</a>
                </>
              )}
            </div>
          </aside>
        </div>
      </section>
      </>
      )}

      {view === 'galeria' && (
      <>
      <section className="hero avisos-hero-wrap">
        <div className="avisos-hero boletines-hero">
          <div className="avisos-hero-decor" aria-hidden="true">
            <span className="ah-star ah-star-1">★</span>
            <span className="ah-star ah-star-2">★</span>
            <span className="ah-dot ah-dot-1" />
            <span className="ah-dot ah-dot-2" />
          </div>
          <div className="avisos-hero-copy">
            <button className="breadcrumb-back" onClick={goHome}><Home size={14} /> Inicio</button>
            <div className="boletines-hero-title-row">
              <span className="boletines-hero-icon-badge"><img src={galeriaIcon} alt="" /></span>
              <h1>Galería de Fotos</h1>
            </div>
            <p>Momentos que nos inspiran: fotos de nuestras actividades, eventos cívicos y culturales, y avisos recientes, organizadas por categoría.</p>
            <div className="boletines-features">
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><Heart size={16} /></span>
                <span><strong>Momentos reales</strong><small>Directo de cada actividad y evento.</small></span>
              </div>
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><SlidersHorizontal size={16} /></span>
                <span><strong>Organizada por categoría</strong><small>Filtra por el tipo que te interese.</small></span>
              </div>
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><Star size={16} /></span>
                <span><strong>Se actualiza sola</strong><small>Nueva foto, nueva entrada.</small></span>
              </div>
            </div>
          </div>
          <img className="boletines-hero-art" src={familyImage} alt="" />
        </div>
      </section>

      <section className="avisos-body">
        <div className="avisos-filters galeria-filters">
          <span className="avisos-filters-label"><SlidersHorizontal size={15} /> Categoría</span>
          {['Todos', ...galleryCategories].map((category) => (
            <button key={category} className={category === galeriaCategory ? 'avisos-pill avisos-pill-active' : 'avisos-pill'} onClick={() => setGaleriaCategory(category)}>{category}</button>
          ))}
        </div>

        <div className="boletines-layout">
          <div className="boletines-main">
            {filteredGalleryPhotos.length > 0 ? (
              <div className="galeria-grid">
                {filteredGalleryPhotos.map((photo) => (
                  <button className="gallery-item galeria-grid-item" key={photo.title} onClick={() => openGalleryPhoto(photo)}>
                    <img src={photo.image} alt={photo.title} loading="lazy" />
                    <span className={`galeria-item-tag eyebrow-${photo.tone}`}>{photo.category}</span>
                    <span className="gallery-caption">{photo.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="avisos-empty">No encontramos fotos en esta categoría.</p>
            )}
          </div>

          <aside className="boletines-sidebar">
            <div className="sidebar-card">
              <h3>Categorías</h3>
              <div className="sidebar-category-list">
                <button className={galeriaCategory === 'Todos' ? 'sidebar-category-item sidebar-category-active' : 'sidebar-category-item'} onClick={() => setGaleriaCategory('Todos')}>
                  <span><Star size={15} /> Todas las fotos</span>
                  <em>{galleryPhotos.length}</em>
                </button>
                {galleryCategoryCounts.map(({ category, count }) => (
                  <button key={category} className={galeriaCategory === category ? 'sidebar-category-item sidebar-category-active' : 'sidebar-category-item'} onClick={() => setGaleriaCategory(category)}>
                    <span><Star size={15} /> {category}</span>
                    <em>{count}</em>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-card">
              <h3>Acciones rápidas</h3>
              <button className="sidebar-action" onClick={openActividades}><Star size={16} /> Ver actividades</button>
              <button className="sidebar-action" onClick={openEventos}><Flag size={16} /> Ver eventos cívicos</button>
              <button className="sidebar-action" onClick={openAll}><Megaphone size={16} /> Ver todos los avisos</button>
              <button className="sidebar-action" onClick={goHome}><Home size={16} /> Volver al inicio</button>
            </div>

            <div className="sidebar-cta-card">
              <h3>¿Dudas o sugerencias?</h3>
              <p>Estoy aquí para escucharte.</p>
              <a className="sidebar-cta-btn" href={WHATSAPP_GROUP_LINK} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Contáctame</a>
            </div>
          </aside>
        </div>
      </section>
      </>
      )}

      {view === 'nosotros' && (
      <>
      <section className="hero avisos-hero-wrap">
        <div className="avisos-hero boletines-hero">
          <div className="avisos-hero-decor" aria-hidden="true">
            <span className="ah-star ah-star-1">★</span>
            <span className="ah-star ah-star-2">★</span>
            <span className="ah-dot ah-dot-1" />
            <span className="ah-dot ah-dot-2" />
          </div>
          <div className="avisos-hero-copy">
            <button className="breadcrumb-back" onClick={goHome}><Home size={14} /> Inicio</button>
            <div className="boletines-hero-title-row">
              <span className="boletines-hero-icon-badge"><img src={schoolIllustration} alt="" /></span>
              <h1>Nosotros</h1>
            </div>
            <p>Conoce nuestra historia, nuestra misión y visión, nuestro modelo pedagógico y lo que nuestros estudiantes aprenden en cada grado de primaria y telesecundaria.</p>
            <div className="boletines-features">
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><GraduationCap size={16} /></span>
                <span><strong>Primaria y Telesecundaria</strong><small>De 1° de primaria a 3° de secundaria.</small></span>
              </div>
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><Heart size={16} /></span>
                <span><strong>Formación integral</strong><small>Académica, cívica y en valores.</small></span>
              </div>
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><UsersRound size={16} /></span>
                <span><strong>Comunidad</strong><small>Escuela y familias, un mismo equipo.</small></span>
              </div>
            </div>
          </div>
          <img className="boletines-hero-art" src={encourageIllustration} alt="" />
        </div>
      </section>

      <section className="aviso-detail-body-section">
        <div className="aviso-detail-grid">
          <article className="aviso-detail-main">
            <div className="aviso-detail-media">
              <img src={schoolIllustration} alt="" />
            </div>
            <div className="aviso-detail-body">
              <div className="aviso-detail-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 0 }}>
                <h2><Clock size={17} /> Nuestra Historia</h2>
                <p>La Telesecundaria Julián Carrillo nació con un propósito claro: llevar educación secundaria de calidad a nuestra comunidad con el modelo de telesecundaria, creado en México en 1968 para que los jóvenes de comunidades rurales y semiurbanas pudieran continuar sus estudios sin salir de su localidad. En este modelo, un mismo docente acompaña al grupo en todas sus asignaturas, con apoyo de materiales audiovisuales y libros propios.</p>
                <p>Con el tiempo, la escuela creció para atender también la primaria. Hoy acompañamos a nuestros estudiantes desde 1° de primaria hasta 3° de secundaria: nueve años en la misma comunidad escolar. Esto nos permite dar continuidad a su aprendizaje, conocer de cerca a cada familia y organizar actividades donde los estudiantes mayores apoyan a los más pequeños.</p>
                <p>Trabajamos con el Plan de Estudio 2022 de la Nueva Escuela Mexicana: partimos de los problemas y saberes de nuestra comunidad, organizamos el trabajo por proyectos y buscamos formar no solo mejores estudiantes, sino mejores personas. Compartimos aquí nuestras experiencias para que puedan ser útiles a docentes de otras escuelas.</p>
              </div>

              <div className="aviso-detail-section">
                <h2><Target size={17} /> Misión</h2>
                <p>Formar estudiantes críticos, responsables y solidarios, brindando una educación de calidad que promueva su desarrollo integral y les permita construir un mejor futuro.</p>
              </div>

              <div className="aviso-detail-section">
                <h2><Lightbulb size={17} /> Visión</h2>
                <p>Ser una comunidad educativa reconocida por su compromiso con el aprendizaje significativo, la innovación y los valores que transforman vidas y comunidades.</p>
              </div>

              <div className="aviso-detail-section">
                <h2><Heart size={17} /> Nuestros Valores</h2>
                <div className="nosotros-values-grid">
                  {schoolValues.map((value, index) => {
                    const icons = [GraduationCap, Heart, Star, UsersRound];
                    const ValueIcon = icons[index % icons.length];
                    return (
                      <div className="activity-objective" key={value.title}>
                        <span className="activity-objective-icon"><ValueIcon size={17} /></span>
                        <div>
                          <strong>{value.title}</strong>
                          <p>{value.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="aviso-detail-section">
                <h2><Lightbulb size={17} /> Nuestro modelo pedagógico: los ejes articuladores</h2>
                <p>Los siete ejes articuladores de la Nueva Escuela Mexicana atraviesan todos los grados y campos formativos. Así los vivimos en la escuela:</p>
                <div className="nosotros-values-grid">
                  {pedagogicalAxes.map((axis, index) => {
                    const icons = [UsersRound, Brain, Heart, Star, Target, FileText, Lightbulb];
                    const AxisIcon = icons[index % icons.length];
                    return (
                      <div className="activity-objective" key={axis.title}>
                        <span className="activity-objective-icon"><AxisIcon size={17} /></span>
                        <div>
                          <strong>{axis.title}</strong>
                          <p>{axis.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="aviso-detail-section">
                <h2><GraduationCap size={17} /> ¿Qué aprenderán? Plan de estudios por grado</h2>
                <p>Con base en el Plan de Estudio 2022, el aprendizaje se organiza en cuatro campos formativos: Lenguajes; Saberes y Pensamiento Científico; Ética, Naturaleza y Sociedades; y De lo Humano y lo Comunitario. En primaria se trabajan de forma integrada por proyectos; en secundaria, cada campo se desarrolla por disciplinas.</p>
                {visibleEducationLevels.map((level) => (
                  <div className="grade-level-block" key={level.name}>
                    {visibleEducationLevels.length > 1 && (
                      <div className="grade-level-head">
                        <h3>{level.name}</h3>
                        <p>{level.description}</p>
                      </div>
                    )}
                    <div className="grade-cards">
                      {level.grades.map((plan) => (
                        <div className="grade-card" key={plan.grade}>
                          <h3>{plan.grade}</h3>
                          <p>{plan.focus}</p>
                          <div className="grade-subject-list">
                            {plan.subjects.map((subject) => <span className="grade-subject-pill" key={subject}>{subject}</span>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <aside className="aviso-detail-sidebar">
            <div className="sidebar-card">
              <h3>Acciones rápidas</h3>
              <button className="sidebar-action" onClick={openActividades}><Star size={16} /> Ver actividades</button>
              <button className="sidebar-action" onClick={openEventos}><Flag size={16} /> Ver eventos cívicos</button>
              <button className="sidebar-action" onClick={openCalendar}><Calendar size={16} /> Ver calendario escolar</button>
              <button className="sidebar-action" onClick={goHome}><Home size={16} /> Volver al inicio</button>
            </div>

            <div className="sidebar-card">
              <h3>Datos de contacto</h3>
              <ul className="contact-list sidebar-contact-list">
                <li><MapPin size={14} /> Escuela Telesecundaria Julián Carrillo</li>
                <li><Phone size={14} /> 1800 123 4567</li>
                <li><Mail size={14} /> contacto@telesecundaria.edu.mx</li>
                <li><Clock size={14} /> Lunes a Viernes · 7:00 AM - 3:00 PM</li>
              </ul>
            </div>

            <div className="sidebar-cta-card">
              <h3>¿Dudas o sugerencias?</h3>
              <p>Estoy aquí para escucharte.</p>
              <a className="sidebar-cta-btn" href={WHATSAPP_GROUP_LINK} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Contáctame</a>
            </div>
          </aside>
        </div>
      </section>
      </>
      )}

      <section className="footer-cta" id="contacto">
        <div className="footer-cta-decor" aria-hidden="true">
          <span className="fc-star fc-star-1">★</span>
          <span className="fc-star fc-star-2">★</span>
          <span className="fc-dot fc-dot-1" />
          <span className="fc-dot fc-dot-2" />
          <span className="fc-dot fc-dot-3" />
          <img className="fc-plane-big" src={paperPlaneImage} alt="" />
        </div>
        <img className="footer-cta-teacher" src={teacherImage} alt="Maestra saludando" />
        <div className="footer-cta-inner">
          <h2>¿Dudas o sugerencias?</h2>
          <p>Estoy aquí para escucharte. Juntos hacemos una mejor educación para nuestros estudiantes.</p>
          <a className="footer-cta-btn" href={WHATSAPP_GROUP_LINK} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Contáctame</a>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-columns">
            <div>
              <div className="footer-brand-row">
                <img src={logoImage} alt="" />
                <strong>Telesecundaria<br />Julián Carrillo</strong>
              </div>
              <p className="footer-copy">© {new Date().getFullYear()} Telesecundaria Julián Carrillo. Todos los derechos reservados.</p>
              <div className="footer-social">
                <a href="#" aria-label="Facebook"><Facebook size={15} /></a>
                <a href="#" aria-label="Instagram"><Instagram size={15} /></a>
                <a href="#" aria-label="WhatsApp"><MessageCircle size={15} /></a>
              </div>
            </div>
            <div>
              <h4>Enlaces Rápidos</h4>
              <ul>
                <li><a href="#inicio" onClick={(event) => { event.preventDefault(); goHome(); }}>Inicio</a></li>
                <li><a href="#nosotros" onClick={(event) => { event.preventDefault(); openNosotros(); }}>Nosotros</a></li>
                <li><a href="#actividades" onClick={(event) => { event.preventDefault(); openActividades(); }}>Actividades</a></li>
                <li><a href="#eventos" onClick={(event) => { event.preventDefault(); openEventos(); }}>Eventos</a></li>
              </ul>
            </div>
            <div>
              <h4>Secciones</h4>
              <ul>
                <li><a href="#calendario" onClick={(event) => { event.preventDefault(); openCalendar(); }}>Calendario</a></li>
                <li><a href="#seguimiento" onClick={(event) => { event.preventDefault(); openEstudios(); }}>Seguimiento</a></li>
                <li><a href="#galería" onClick={(event) => { event.preventDefault(); openGaleria(); }}>Galería</a></li>
                <li><a href="#boletin" onClick={(event) => { event.preventDefault(); openBoletines(); }}>Boletín Escolar</a></li>
              </ul>
            </div>
            <div>
              <h4>Contacto</h4>
              <ul className="contact-list">
                <li><MapPin size={14} /> Escuela Telesecundaria Julián Carrillo</li>
                <li><Phone size={14} /> 1800 123 4567</li>
                <li><Mail size={14} /> contacto@telesecundaria.edu.mx</li>
                <li><Clock size={14} /> Lunes a Viernes · 7:00 AM - 3:00 PM</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">Hecho con ❤️ para mis estudiantes</div>
        </div>
      </footer>

    </main>
  );
}

export default App;
