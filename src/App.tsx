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

const announcements: Announcement[] = [
  {
    label: 'Aviso General',
    title: 'Suspensión de clases',
    description: 'El próximo viernes 23 de mayo no habrá clases por Consejo Técnico Escolar.',
    date: '23',
    dateLabel: 'Viernes 23 de mayo de 2026',
    dateISO: '2026-05-23',
    tone: 'pink',
    image: calendarImage,
    fullDescription: [
      'Se informa a toda la comunidad educativa que el próximo viernes 23 de mayo no habrá clases debido a la realización del Consejo Técnico Escolar.',
      'Las actividades escolares se reanudarán con normalidad el lunes 26 de mayo en el horario habitual.',
    ],
    bullets: [
      'No habrá clases para todos los niveles educativos.',
      'El personal docente y administrativo participará en el Consejo Técnico Escolar.',
      'Agradecemos su comprensión y apoyo.',
    ],
    fileName: 'Circular_CT_23_mayo_2026.pdf',
    calendarType: 'suspension',
  },
  {
    label: 'Evento',
    title: 'Festival del Día del Estudiante',
    description: 'Celebremos juntos una jornada llena de actividades, juegos y sorpresas.',
    date: '16',
    dateLabel: 'Sábado 16 de mayo de 2026',
    dateISO: '2026-05-16',
    tone: 'blue',
    image: trophyImage,
    fullDescription: [
      'Como cada año, celebramos el Día del Estudiante con una jornada llena de juegos, concursos y sorpresas para toda la comunidad escolar.',
      'Habrá actividades deportivas, culturales y reconocimientos para los alumnos destacados del ciclo escolar.',
    ],
    bullets: [
      'El evento inicia a las 9:00 AM en la explanada principal.',
      'Se pide a los alumnos asistir con ropa cómoda.',
      'Padres de familia están cordialmente invitados a acompañarnos.',
    ],
    fileName: 'Programa_Festival_Estudiante.pdf',
    calendarType: 'evento',
    calendarLocation: 'Explanada principal',
  },
  {
    label: 'Información',
    title: 'Reunión con padres de familia',
    description: 'Te esperamos para compartir los avances de nuestros estudiantes.',
    date: '26',
    dateLabel: 'Martes 26 de mayo de 2026',
    dateISO: '2026-05-26',
    tone: 'green',
    image: familyImage,
    fullDescription: [
      'Te esperamos para compartir los avances académicos de nuestros estudiantes durante este periodo escolar.',
      'Es muy importante contar con la asistencia de al menos un padre, madre o tutor de cada alumno.',
    ],
    bullets: [
      'La reunión será por grupo, en el salón correspondiente.',
      'Se entregará el reporte de avances individual de cada alumno.',
      'Duración aproximada: 45 minutos por grupo.',
    ],
    fileName: 'Citatorio_Reunion_Padres.pdf',
    calendarType: 'reunion',
    calendarLocation: 'Salón correspondiente',
  },
  {
    label: 'Información',
    title: 'Material escolar',
    description: 'Revisa los materiales necesarios para las próximas actividades en clase.',
    date: '30',
    dateLabel: 'Sábado 30 de mayo de 2026',
    dateISO: '2026-05-30',
    tone: 'yellow',
    image: notebookImage,
    fullDescription: [
      'Revisa la lista de materiales necesarios para las próximas actividades en clase, correspondientes al cierre del ciclo escolar.',
      'Se recomienda adquirir los materiales con anticipación para no afectar el desarrollo de las actividades.',
    ],
    bullets: [
      'Cuaderno, colores y material de manualidades.',
      'El material se utilizará a partir de la próxima semana.',
      'Cualquier duda, favor de contactar a la maestra titular.',
    ],
    fileName: 'Lista_Material_Escolar.pdf',
    calendarType: 'entrega',
  },
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
  highlights: { title: string; description: string; image: string }[];
  bullets: string[];
  fileName: string;
  fileSize: string;
  pages: number;
  publishedBy: string;
};

const newsletters: Newsletter[] = [
  {
    title: 'Boletín Escolar - Mayo 2026',
    monthLabel: 'Mayo 2026',
    dateLabel: '30 de mayo de 2026',
    dateISO: '2026-05-30',
    tone: 'purple',
    category: 'Comunicados generales',
    description: 'Conoce las actividades, anuncios importantes y logros de nuestra comunidad educativa durante el mes de mayo.',
    messageQuote: 'Gracias al esfuerzo conjunto de estudiantes, docentes y familias, seguimos construyendo una comunidad educativa fuerte, unida y en constante crecimiento.',
    messageAuthor: 'Dirección Académica',
    highlights: [
      { title: 'Feria de Ciencias', description: 'Nuestros estudiantes presentaron proyectos increíbles en la Feria de Ciencias. ¡Felicidades a todos!', image: galleryCiencias },
      { title: 'Convivencia deportiva', description: 'Compartimos una jornada de juegos y trabajo en equipo entre todos los grupos.', image: galleryDeportes },
      { title: 'Honores a la bandera', description: 'Reforzamos nuestros valores cívicos con la ceremonia mensual de honores a la bandera.', image: galleryCivismo },
    ],
    bullets: [
      'Suspensión de clases el viernes 23 de mayo por Consejo Técnico Escolar.',
      'Festival del Día del Estudiante el sábado 16 de mayo.',
      'Reunión con padres de familia el martes 26 de mayo.',
      'Revisión de materiales escolares para el cierre del ciclo.',
    ],
    fileName: 'boletin_mayo_2026.pdf',
    fileSize: '2.4 MB',
    pages: 8,
    publishedBy: 'Dirección Académica',
  },
  {
    title: 'Boletín Escolar - Abril 2026',
    monthLabel: 'Abril 2026',
    dateLabel: '30 de abril de 2026',
    dateISO: '2026-04-30',
    tone: 'orange',
    category: 'Actividades escolares',
    description: 'Resumen de actividades, eventos y comunicados de nuestra comunidad educativa durante el mes de abril.',
    messageQuote: 'Abril fue un mes de creatividad y esfuerzo: nuestros estudiantes demostraron una vez más su talento y compromiso.',
    messageAuthor: 'Dirección Académica',
    highlights: [
      { title: 'Arte y cultura', description: 'Realizamos una exposición de arte y cultura con trabajos elaborados por nuestros estudiantes.', image: galleryArte },
      { title: 'Actividades en el aula', description: 'Reforzamos la lectura y el trabajo colaborativo con dinámicas por grupo.', image: galleryMatematicas },
      { title: 'Trabajo en equipo', description: 'Nuestros alumnos participaron en proyectos colaborativos para fortalecer sus habilidades sociales.', image: galleryLectura },
    ],
    bullets: [
      'Exposición de arte y cultura en el patio principal.',
      'Actividades de lectura en voz alta por grupo.',
      'Entrega de trabajos del segundo periodo.',
      'Recordatorio: uniforme deportivo los viernes.',
    ],
    fileName: 'boletin_abril_2026.pdf',
    fileSize: '2.1 MB',
    pages: 6,
    publishedBy: 'Dirección Académica',
  },
  {
    title: 'Boletín Escolar - Marzo 2026',
    monthLabel: 'Marzo 2026',
    dateLabel: '31 de marzo de 2026',
    dateISO: '2026-03-31',
    tone: 'blue',
    category: 'Eventos especiales',
    description: 'Revisa las noticias más destacadas y los avances de nuestra escuela durante el mes de marzo.',
    messageQuote: 'Cada evento que organizamos busca fortalecer los lazos entre la escuela, los estudiantes y sus familias.',
    messageAuthor: 'Dirección Académica',
    highlights: [
      { title: 'Trabajo en equipo', description: 'Nuestros estudiantes fortalecieron sus habilidades de colaboración en distintas dinámicas grupales.', image: galleryLectura },
      { title: 'Feria de Ciencias', description: 'Iniciamos los preparativos para la Feria de Ciencias con la selección de proyectos por grupo.', image: galleryCiencias },
      { title: 'Arte y cultura', description: 'Los estudiantes exploraron distintas expresiones artísticas durante el taller mensual.', image: galleryArte },
    ],
    bullets: [
      'Inicio de preparativos para la Feria de Ciencias.',
      'Conferencia para padres sobre hábitos de estudio.',
      'Actualización del calendario de evaluaciones.',
      'Campaña de reforestación en el patio escolar.',
    ],
    fileName: 'boletin_marzo_2026.pdf',
    fileSize: '1.9 MB',
    pages: 6,
    publishedBy: 'Dirección Académica',
  },
  {
    title: 'Boletín Escolar - Febrero 2026',
    monthLabel: 'Febrero 2026',
    dateLabel: '28 de febrero de 2026',
    dateISO: '2026-02-28',
    tone: 'green',
    category: 'Logros y reconocimientos',
    description: 'Entérate de las actividades, logros y avisos importantes de nuestra comunidad educativa durante el mes de febrero.',
    messageQuote: 'Reconocemos con orgullo el esfuerzo de nuestros estudiantes y agradecemos a las familias que nos acompañan en este camino.',
    messageAuthor: 'Dirección Académica',
    highlights: [
      { title: 'Honores a la bandera', description: 'Reforzamos nuestros valores cívicos con la ceremonia mensual de honores a la bandera.', image: galleryCivismo },
      { title: 'Convivencia deportiva', description: 'Realizamos un torneo interescolar que fomentó el compañerismo y el deporte.', image: galleryDeportes },
      { title: 'Actividades en el aula', description: 'Reconocimos el esfuerzo de los alumnos con mejor desempeño del bimestre.', image: galleryMatematicas },
    ],
    bullets: [
      'Reconocimiento a los alumnos con mejor promedio del bimestre.',
      'Inicio del programa de tutorías entre compañeros.',
      'Entrega de reportes de evaluación bimestral.',
      'Convivencia deportiva interescolar.',
    ],
    fileName: 'boletin_febrero_2026.pdf',
    fileSize: '1.7 MB',
    pages: 5,
    publishedBy: 'Dirección Académica',
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

// Estas son las únicas fechas "fijas" del calendario (no salen de ningún
// otro contenido del sitio). Todo lo demás se agrega solo: el arreglo
// completo de calendarEvents se arma más abajo, después de declarar los
// avisos, las actividades y los eventos cívicos, para poder tomarlos
// automáticamente de ahí (ver el bloque "calendarEvents" al final de la
// sección de Actividades y Eventos Cívicos).
const fixedCalendarEvents: CalendarEvent[] = [
  { title: 'Día del Trabajo', dateISO: '2026-05-01', type: 'festivo', description: 'Día oficial de descanso en México.' },
  { title: 'Exámenes de mitad de curso', dateISO: '2026-05-13', type: 'examen', description: 'Periodo de evaluaciones del segundo periodo escolar.' },
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
  // Bandera opcional: si algún estudio la trae en true, ese es el que se
  // muestra en la página principal, sin importar fecha. Si ninguno la
  // trae, se usa el más reciente por fecha y, en caso de empate, el
  // último agregado a este arreglo (mismo criterio que el carrusel de
  // avisos).
  featured?: boolean;
};

const studies: Study[] = [
  {
    title: 'Avance del grupo: Febrero vs. Mayo 2026',
    category: 'Avances del grupo',
    dateISO: '2026-05-30',
    dateLabel: '30 de mayo de 2026',
    readTime: '8 min de lectura',
    description: 'Análisis comparativo del progreso académico del grupo en comprensión lectora y resolución de problemas matemáticos durante el ciclo escolar.',
    fullDescription: [
      'Comparamos los resultados de febrero y mayo para medir el impacto de las estrategias implementadas durante el ciclo escolar en curso.',
      'Los cuatro indicadores evaluados muestran una mejora sostenida, con avances especialmente notables en participación en clase y comprensión lectora.',
    ],
    highlight: 'El grupo mostró una mejora constante en los cuatro indicadores evaluados durante el ciclo escolar.',
    metrics: [
      { label: 'Comprensión Lectora', percentage: 85, before: 55, color: '#43ba58' },
      { label: 'Matemáticas', percentage: 78, before: 50, color: '#4295ed' },
      { label: 'Participación en Clase', percentage: 90, before: 60, color: '#f5a623' },
      { label: 'Conducta y Valores', percentage: 88, before: 65, color: '#fb3d96' },
    ],
    icon: 'chart',
  },
  {
    title: 'Detección de dificultades en memoria de trabajo',
    category: 'Cognitivo',
    dateISO: '2026-05-15',
    dateLabel: '15 de mayo de 2026',
    readTime: '6 min de lectura',
    description: 'Estudio realizado para identificar patrones de dificultad en memoria de trabajo y atención sostenida en el grupo.',
    fullDescription: [
      'Aplicamos una serie de ejercicios breves para identificar patrones de dificultad en memoria de trabajo y atención sostenida dentro del grupo.',
      'Los resultados nos permiten diseñar actividades específicas para reforzar estas habilidades durante las siguientes semanas.',
    ],
    highlight: 'La velocidad de procesamiento fue el indicador con mejor desempeño general del grupo.',
    metrics: [
      { label: 'Memoria de trabajo', percentage: 62, before: 48, color: '#fb3d96' },
      { label: 'Atención sostenida', percentage: 58, before: 42, color: '#4e21c1' },
      { label: 'Velocidad de procesamiento', percentage: 70, before: 55, color: '#4295ed' },
    ],
    icon: 'brain',
  },
  {
    title: 'Implementación de la técnica Pomodoro en clase',
    category: 'Estrategias',
    dateISO: '2026-05-02',
    dateLabel: '2 de mayo de 2026',
    readTime: '7 min de lectura',
    description: 'Resultados de la implementación de la técnica Pomodoro para mejorar la concentración y gestión del tiempo en actividades académicas.',
    fullDescription: [
      'Durante cuatro semanas implementamos la técnica Pomodoro en las actividades de clase para mejorar la concentración y la gestión del tiempo.',
      'La percepción positiva del grupo hacia la técnica fue uno de los resultados más destacados del estudio.',
    ],
    highlight: 'El 88% del grupo reportó una percepción positiva hacia la nueva forma de organizar el tiempo de clase.',
    metrics: [
      { label: 'Concentración sostenida', percentage: 74, before: 58, color: '#4295ed' },
      { label: 'Tareas completadas a tiempo', percentage: 81, before: 63, color: '#43ba58' },
      { label: 'Percepción positiva del grupo', percentage: 88, before: 52, color: '#f5a623' },
    ],
    icon: 'target',
  },
  {
    title: 'Aprendizaje colaborativo: resultados del proyecto',
    category: 'Aprendizaje',
    dateISO: '2026-04-18',
    dateLabel: '18 de abril de 2026',
    readTime: '5 min de lectura',
    description: 'Análisis del impacto del aprendizaje colaborativo en el desarrollo de habilidades sociales y rendimiento académico.',
    fullDescription: [
      'El grupo trabajó en proyectos colaborativos durante tres semanas, con roles rotativos dentro de cada equipo.',
      'Observamos mejoras tanto en habilidades sociales como en el rendimiento académico individual de los estudiantes.',
    ],
    highlight: 'El trabajo en equipo fue el indicador con mejor resultado dentro de este estudio.',
    metrics: [
      { label: 'Trabajo en equipo', percentage: 80, before: 60, color: '#4e21c1' },
      { label: 'Comunicación efectiva', percentage: 75, before: 58, color: '#4295ed' },
      { label: 'Rendimiento académico', percentage: 72, before: 61, color: '#43ba58' },
    ],
    icon: 'people',
  },
  {
    title: 'Estrategias para mejorar la motivación del grupo',
    category: 'Bienestar emocional',
    dateISO: '2026-04-05',
    dateLabel: '5 de abril de 2026',
    readTime: '6 min de lectura',
    description: 'Estudio sobre las acciones implementadas para aumentar la motivación y el compromiso estudiantil en el aula.',
    fullDescription: [
      'Implementamos pequeñas dinámicas de reconocimiento y metas grupales para fortalecer la motivación dentro del aula.',
      'El sentido de pertenencia del grupo fue el indicador que más mejoró durante el periodo evaluado.',
    ],
    highlight: 'El sentido de pertenencia al grupo aumentó de forma notable tras las nuevas dinámicas implementadas.',
    metrics: [
      { label: 'Motivación general', percentage: 79, before: 60, color: '#f5a623' },
      { label: 'Participación voluntaria', percentage: 68, before: 47, color: '#fb3d96' },
      { label: 'Sentido de pertenencia', percentage: 83, before: 55, color: '#43ba58' },
    ],
    icon: 'idea',
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

const activities: ActivityEntry[] = [
  {
    title: 'Feria de Ciencias 2026',
    category: 'Actividad Académica',
    tone: 'blue',
    dateISO: '2026-05-28',
    dateLabel: '28 de mayo de 2026',
    time: '09:00 AM - 01:00 PM',
    location: 'Patio central',
    description: 'Presentación de proyectos científicos desarrollados por nuestros estudiantes donde demuestran su creatividad, conocimiento y amor por la ciencia.',
    fullDescription: [
      'La Feria de Ciencias es un espacio donde los estudiantes presentan sus proyectos de investigación científica en diferentes áreas del conocimiento. Esta actividad fomenta el pensamiento crítico, la curiosidad y el trabajo en equipo, además de fortalecer el aprendizaje práctico.',
      'Invitamos a toda la comunidad escolar a participar y apoyar a nuestros jóvenes científicos.',
    ],
    highlight: '¡Ven, descubre y aprende con las increíbles ideas de nuestros estudiantes!',
    objectives: [
      { title: 'Fomentar la investigación', description: 'Promover la curiosidad científica y el deseo de aprender.' },
      { title: 'Desarrollar habilidades', description: 'Fortalecer el trabajo en equipo, la comunicación y la creatividad.' },
      { title: 'Reconocer el esfuerzo', description: 'Valorar el esfuerzo y dedicación de nuestros estudiantes.' },
    ],
    details: [
      { label: 'Fecha', value: 'Jueves 28 de mayo de 2026' },
      { label: 'Horario', value: '09:00 AM - 01:00 PM' },
      { label: 'Lugar', value: 'Patio central de la escuela' },
      { label: 'Dirigido a', value: 'Todos los estudiantes y familias' },
      { label: 'Costo', value: 'Actividad gratuita' },
      { label: 'Cupo', value: 'Abierto al público' },
    ],
    materials: ['Proyecto científico ya elaborado', 'Cartel o material de exposición', 'Bata o uniforme de laboratorio (opcional)'],
    image: galleryCiencias,
    gallery: [galleryLectura, galleryMatematicas, galleryArte],
    enCalendario: true,
  },
  {
    title: 'Trabajo en equipo',
    category: 'Actividad Colaborativa',
    tone: 'yellow',
    dateISO: '2026-05-11',
    dateLabel: '11 de mayo de 2026',
    time: '10:00 AM - 12:00 PM',
    location: 'Salón de clases',
    description: 'Dinámicas grupales para fortalecer la colaboración, la comunicación y la resolución de problemas entre los estudiantes.',
    fullDescription: [
      'A través de dinámicas y retos grupales, los estudiantes practican la colaboración, la escucha activa y la resolución de problemas en equipo.',
      'Esta actividad se realiza de forma periódica como parte de nuestro enfoque de formación integral.',
    ],
    highlight: 'Juntos llegamos más lejos: el trabajo en equipo es una habilidad que se practica todos los días.',
    objectives: [
      { title: 'Fortalecer la colaboración', description: 'Practicar la escucha activa y el apoyo mutuo entre compañeros.' },
      { title: 'Resolver problemas juntos', description: 'Enfrentar retos grupales con estrategias compartidas.' },
      { title: 'Reconocer el esfuerzo', description: 'Valorar la participación de cada integrante del equipo.' },
    ],
    details: [
      { label: 'Fecha', value: 'Lunes 11 de mayo de 2026' },
      { label: 'Horario', value: '10:00 AM - 12:00 PM' },
      { label: 'Lugar', value: 'Salón de clases' },
      { label: 'Dirigido a', value: 'Todos los grupos' },
      { label: 'Costo', value: 'Actividad gratuita' },
      { label: 'Cupo', value: 'Todo el grupo' },
    ],
    materials: ['Libreta de apuntes', 'Material que indique la maestra titular'],
    image: galleryLectura,
    gallery: [galleryCiencias, galleryDeportes, galleryCivismo],
    enCalendario: true,
  },
  {
    title: 'Actividades en el aula',
    category: 'Actividad Académica',
    tone: 'green',
    dateISO: '2026-05-08',
    dateLabel: '8 de mayo de 2026',
    time: '08:00 AM - 01:00 PM',
    location: 'Salón de clases',
    description: 'Dinámicas de lectura, matemáticas y trabajo colaborativo para reforzar el aprendizaje diario en el aula.',
    fullDescription: [
      'Durante la semana reforzamos la lectura, las matemáticas y el trabajo colaborativo a través de dinámicas dentro del aula.',
      'Estas actividades buscan afianzar los conocimientos vistos en clase de una forma práctica y participativa.',
    ],
    highlight: 'Aprender jugando también es aprender: cada actividad refuerza lo visto en clase.',
    objectives: [
      { title: 'Reforzar el aprendizaje', description: 'Afianzar los temas vistos en clase de forma práctica.' },
      { title: 'Fomentar la participación', description: 'Involucrar activamente a todo el grupo en cada dinámica.' },
      { title: 'Reconocer el esfuerzo', description: 'Valorar el avance individual de cada estudiante.' },
    ],
    details: [
      { label: 'Fecha', value: 'Viernes 8 de mayo de 2026' },
      { label: 'Horario', value: '08:00 AM - 01:00 PM' },
      { label: 'Lugar', value: 'Salón de clases' },
      { label: 'Dirigido a', value: 'Todos los grupos' },
      { label: 'Costo', value: 'Actividad gratuita' },
      { label: 'Cupo', value: 'Todo el grupo' },
    ],
    materials: ['Libro de texto', 'Cuaderno y colores'],
    image: galleryMatematicas,
    enCalendario: true,
    gallery: [galleryLectura, galleryArte, galleryDeportes],
  },
  {
    title: 'Convivencia deportiva',
    category: 'Actividad Deportiva',
    tone: 'pink',
    dateISO: '2026-05-20',
    dateLabel: '20 de mayo de 2026',
    time: '09:00 AM - 12:00 PM',
    location: 'Campo deportivo',
    description: 'Jornada de juegos y deportes en equipo que fomenta la sana competencia, el compañerismo y el trabajo en equipo.',
    fullDescription: [
      'Una jornada de juegos y deportes en equipo, pensada para fomentar la sana competencia y el compañerismo entre todos los grupos.',
      'Padres de familia están cordialmente invitados a acompañarnos y disfrutar de esta convivencia.',
    ],
    highlight: 'Lo importante no es solo ganar, sino disfrutar y crecer juntos como comunidad.',
    objectives: [
      { title: 'Fomentar el deporte', description: 'Promover hábitos de actividad física y trabajo en equipo.' },
      { title: 'Fortalecer el compañerismo', description: 'Convivir de forma sana entre distintos grupos.' },
      { title: 'Reconocer el esfuerzo', description: 'Valorar la participación y el espíritu deportivo.' },
    ],
    details: [
      { label: 'Fecha', value: 'Miércoles 20 de mayo de 2026' },
      { label: 'Horario', value: '09:00 AM - 12:00 PM' },
      { label: 'Lugar', value: 'Campo deportivo' },
      { label: 'Dirigido a', value: 'Todos los estudiantes y familias' },
      { label: 'Costo', value: 'Actividad gratuita' },
      { label: 'Cupo', value: 'Abierto al público' },
    ],
    materials: ['Ropa y calzado deportivo', 'Botella de agua'],
    enCalendario: true,
    image: galleryDeportes,
    gallery: [galleryCiencias, galleryMatematicas, galleryCivismo],
  },
];

const civicEvents: ActivityEntry[] = [
  {
    title: 'Honores a la bandera',
    category: 'Evento Cívico',
    tone: 'blue',
    dateISO: '2026-05-04',
    dateLabel: '4 de mayo de 2026',
    time: '08:00 AM - 08:30 AM',
    location: 'Explanada principal',
    description: 'Ceremonia mensual para reforzar nuestros valores cívicos y el respeto a los símbolos patrios.',
    fullDescription: [
      'Cada mes realizamos la ceremonia de honores a la bandera como parte de la formación cívica de nuestros estudiantes.',
      'Un grupo distinto participa cada mes en la escolta y en la conducción de la ceremonia.',
    ],
    highlight: 'El respeto a nuestros símbolos patrios se construye todos los días, en comunidad.',
    objectives: [
      { title: 'Fortalecer los valores cívicos', description: 'Promover el respeto a los símbolos patrios.' },
      { title: 'Fomentar la participación', description: 'Involucrar a un grupo distinto cada mes en la ceremonia.' },
      { title: 'Reconocer el esfuerzo', description: 'Valorar la disciplina de la escolta escolar.' },
    ],
    details: [
      { label: 'Fecha', value: 'Lunes 4 de mayo de 2026' },
      { label: 'Horario', value: '08:00 AM - 08:30 AM' },
      { label: 'Lugar', value: 'Explanada principal' },
      { label: 'Dirigido a', value: 'Toda la comunidad escolar' },
      { label: 'Costo', value: 'Actividad gratuita' },
      { label: 'Cupo', value: 'Abierto al público' },
    ],
    enCalendario: true,
    materials: ['Uniforme escolar completo'],
    image: galleryCivismo,
    gallery: [galleryArte, galleryLectura, galleryDeportes],
  },
  {
    title: 'Arte y cultura',
    category: 'Evento Cultural',
    tone: 'yellow',
    dateISO: '2026-04-24',
    dateLabel: '24 de abril de 2026',
    time: '10:00 AM - 01:00 PM',
    location: 'Patio central',
    description: 'Exposición de trabajos artísticos elaborados por nuestros estudiantes durante el ciclo escolar.',
    fullDescription: [
      'Nuestros estudiantes exponen pinturas, manualidades y trabajos artísticos elaborados durante el ciclo escolar.',
      'Esta actividad busca fomentar la creatividad y el aprecio por las distintas expresiones artísticas y culturales.',
    ],
    highlight: 'El arte es otra forma de aprender, expresarse y descubrir el talento de cada estudiante.',
    objectives: [
      { title: 'Fomentar la creatividad', description: 'Dar espacio a distintas formas de expresión artística.' },
      { title: 'Valorar la cultura', description: 'Promover el aprecio por el arte y las tradiciones.' },
      { title: 'Reconocer el esfuerzo', description: 'Celebrar el trabajo creativo de cada estudiante.' },
    ],
    details: [
      { label: 'Fecha', value: 'Viernes 24 de abril de 2026' },
      { label: 'Horario', value: '10:00 AM - 01:00 PM' },
      { label: 'Lugar', value: 'Patio central' },
      { label: 'Dirigido a', value: 'Todos los estudiantes y familias' },
      { label: 'Costo', value: 'Actividad gratuita' },
      { label: 'Cupo', value: 'Abierto al público' },
    ],
    enCalendario: true,
    materials: ['Trabajo artístico ya elaborado', 'Material para su exhibición'],
    image: galleryArte,
    gallery: [galleryCivismo, galleryCiencias, galleryMatematicas],
  },
  {
    title: 'Festival del Día del Estudiante',
    category: 'Evento Cultural',
    tone: 'pink',
    dateISO: '2026-05-16',
    dateLabel: '16 de mayo de 2026',
    time: '09:00 AM - 01:00 PM',
    location: 'Explanada principal',
    description: 'Celebremos juntos una jornada llena de actividades, juegos y sorpresas.',
    fullDescription: [
      'Como cada año, celebramos el Día del Estudiante con una jornada llena de juegos, concursos y sorpresas para toda la comunidad escolar.',
      'Habrá actividades deportivas, culturales y reconocimientos para los alumnos destacados del ciclo escolar.',
    ],
    highlight: 'Un día para celebrar a quienes son el corazón de nuestra escuela: nuestros estudiantes.',
    objectives: [
      { title: 'Celebrar a los estudiantes', description: 'Dedicar una jornada especial a la comunidad estudiantil.' },
      { title: 'Fomentar la convivencia', description: 'Reunir a estudiantes y familias en un ambiente festivo.' },
      { title: 'Reconocer el esfuerzo', description: 'Premiar a los alumnos destacados del ciclo escolar.' },
    ],
    details: [
      { label: 'Fecha', value: 'Sábado 16 de mayo de 2026' },
      { label: 'Horario', value: '09:00 AM - 01:00 PM' },
      { label: 'Lugar', value: 'Explanada principal' },
      { label: 'Dirigido a', value: 'Todos los estudiantes y familias' },
      { label: 'Costo', value: 'Actividad gratuita' },
      { label: 'Cupo', value: 'Abierto al público' },
    ],
    materials: ['Ropa cómoda'],
    image: trophyImage,
    gallery: [galleryArte, galleryCivismo, galleryDeportes],
    // Ya está ligado a un aviso (abajo), y ese aviso ya se agrega solo al
    // calendario — no marcamos enCalendario aquí para no duplicar la
    // misma fecha dos veces.
    announcement: announcements.find((a) => a.title === 'Festival del Día del Estudiante'),
  },
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
  { title: 'Docente', description: 'Formación de calidad en Telesecundaria, con acompañamiento cercano en cada grado.' },
  { title: 'Compromiso', description: 'Trabajamos por el desarrollo integral de cada estudiante, dentro y fuera del aula.' },
  { title: 'Aprendizaje', description: 'Buscamos que lo aprendido tenga sentido y utilidad para la vida diaria.' },
  { title: 'Comunidad', description: 'Escuela, familias y sociedad avanzando juntos hacia el mismo objetivo.' },
];

type GradePlan = { grade: string; focus: string; subjects: string[] };

// Cada nivel educativo es un bloque independiente con su propia
// condicional "show": para agregar un nivel nuevo (o quitarlo de la
// vista sin perder su información) solo hay que sumar/editar un objeto
// en este arreglo. Hoy la escuela solo ofrece Secundaria (Telesecundaria),
// así que "Primaria" queda ya preparada pero oculta — para publicarla,
// cambia su "show" a true y revisa/ajusta las asignaturas de cada grado.
type EducationLevel = {
  name: string;
  description: string;
  show: boolean;
  grades: GradePlan[];
};

const educationLevels: EducationLevel[] = [
  {
    name: 'Secundaria (Telesecundaria)',
    description: 'Tres grados, de 1° a 3°, con el modelo de telesecundaria.',
    show: true,
    grades: [
      {
        grade: '1er Grado',
        focus: 'La base: adaptación al modelo de Telesecundaria y a las herramientas de estudio.',
        subjects: ['Lengua Materna y Literatura I', 'Matemáticas I', 'Ciencias y Tecnología I (Biología)', 'Geografía', 'Formación Cívica y Ética I', 'Inglés I', 'Artes I', 'Educación Física I', 'Tecnología I'],
      },
      {
        grade: '2do Grado',
        focus: 'Se profundiza el análisis y se suma la perspectiva histórica del país y el mundo.',
        subjects: ['Lengua Materna y Literatura II', 'Matemáticas II', 'Ciencias y Tecnología II (Física)', 'Historia I', 'Formación Cívica y Ética II', 'Inglés II', 'Artes II', 'Educación Física II', 'Tecnología II'],
      },
      {
        grade: '3er Grado',
        focus: 'Cierre del ciclo: consolidación académica y orientación hacia la siguiente etapa educativa.',
        subjects: ['Lengua Materna y Literatura III', 'Matemáticas III', 'Ciencias y Tecnología III (Química)', 'Historia II', 'Formación Cívica y Ética III', 'Inglés III', 'Artes III', 'Educación Física III', 'Tecnología III'],
      },
    ],
  },
  {
    name: 'Primaria',
    description: 'Seis grados, de 1° a 6°.',
    // Oculto hasta que la escuela ofrezca este nivel. La información ya
    // está cargada para no partir de cero cuando llegue el momento.
    show: false,
    grades: [
      {
        grade: '1er Grado',
        focus: 'Primeros pasos en la lectura, la escritura y el conteo.',
        subjects: ['Lengua Materna I', 'Matemáticas I', 'Conocimiento del Medio I', 'Formación Cívica y Ética I', 'Educación Socioemocional I', 'Artes I', 'Educación Física I', 'Inglés I'],
      },
      {
        grade: '2do Grado',
        focus: 'Se afianza la lectoescritura y las operaciones básicas.',
        subjects: ['Lengua Materna II', 'Matemáticas II', 'Conocimiento del Medio II', 'Formación Cívica y Ética II', 'Educación Socioemocional II', 'Artes II', 'Educación Física II', 'Inglés II'],
      },
      {
        grade: '3er Grado',
        focus: 'Cierre del primer ciclo, con mayor autonomía en el trabajo escolar.',
        subjects: ['Lengua Materna III', 'Matemáticas III', 'Conocimiento del Medio III', 'Formación Cívica y Ética III', 'Educación Socioemocional III', 'Artes III', 'Educación Física III', 'Inglés III'],
      },
      {
        grade: '4to Grado',
        focus: 'Se separan Ciencias Naturales, Geografía e Historia como asignaturas propias.',
        subjects: ['Lengua Materna IV', 'Matemáticas IV', 'Ciencias Naturales I', 'Geografía I', 'Historia I', 'Formación Cívica y Ética IV', 'Educación Socioemocional IV', 'Artes IV', 'Educación Física IV', 'Inglés IV'],
      },
      {
        grade: '5to Grado',
        focus: 'Mayor profundidad y análisis en cada asignatura.',
        subjects: ['Lengua Materna V', 'Matemáticas V', 'Ciencias Naturales II', 'Geografía II', 'Historia II', 'Formación Cívica y Ética V', 'Educación Socioemocional V', 'Artes V', 'Educación Física V', 'Inglés V'],
      },
      {
        grade: '6to Grado',
        focus: 'Cierre de la primaria y preparación para el paso a Secundaria.',
        subjects: ['Lengua Materna VI', 'Matemáticas VI', 'Ciencias Naturales III', 'Geografía III', 'Historia III', 'Formación Cívica y Ética VI', 'Educación Socioemocional VI', 'Artes VI', 'Educación Física VI', 'Inglés VI'],
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
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 4, 1));
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
                      <em>{announcement.date} de mayo</em>
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
                  <span className="avisos-card-date"><Calendar size={12} /> {announcement.date} de mayo</span>
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
                      <em>{announcement.date} de mayo</em>
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
              <div className="sidebar-archive-item"><span>2026</span><em>{newsletters.length}</em></div>
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
            <p>Conoce nuestra historia, nuestra misión y visión, y lo que nuestros estudiantes aprenden en cada grado de la Telesecundaria.</p>
            <div className="boletines-features">
              <div className="boletines-feature">
                <span className="boletines-feature-icon"><GraduationCap size={16} /></span>
                <span><strong>Telesecundaria</strong><small>Primero, segundo y tercer grado.</small></span>
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
                <p>La Telesecundaria Julián Carrillo nació con un propósito claro: llevar educación secundaria de calidad a nuestra comunidad, combinando el modelo de telesecundaria (clases apoyadas en materiales audiovisuales) con el acompañamiento cercano de nuestros docentes en el salón, día a día.</p>
                <p>A lo largo de los ciclos escolares hemos crecido junto con las familias que confían en nosotros, sumando actividades académicas, deportivas, cívicas y culturales que buscan formar no solo mejores estudiantes, sino mejores personas.</p>
                <p>Hoy seguimos con el mismo compromiso: ofrecer una educación cercana, participativa y en constante mejora para cada generación que pasa por nuestras aulas.</p>
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
                <h2><GraduationCap size={17} /> ¿Qué aprenderán? Plan de estudios por grado</h2>
                <p>Estas son algunas de las principales asignaturas que se cursan en cada grado:</p>
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
