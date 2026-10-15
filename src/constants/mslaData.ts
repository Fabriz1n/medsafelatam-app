// src/constants/mslaData.ts

export const NOMBRES: Record<string, string> = {
  pediatria: "Pediatría",
  medicina_interna: "Medicina Interna",
  ginecologia: "Ginecología y Obstetricia",
  cirugia: "Cirugía",
  examen: "Examen final combinado"
};

export const ICONOS: Record<string, string> = {
  pediatria: "🧸",
  medicina_interna: "🫀",
  ginecologia: "🤰",
  cirugia: "🔪",
  examen: "🎓"
};

export const SPECS = ["pediatria", "medicina_interna", "ginecologia", "cirugia"];

export interface Question {
  id: string;
  q: string;
  ops: string[];
  c: number;
  x?: string;
}

export interface CaseStudy {
  id: string;
  t: string;
  p: string;
  preg: { q: string; ops: string[]; c: number }[];
  raz?: string;
}

export const BIB_BOLIVIA = [
  "Ministerio de Salud y Deportes de Bolivia. Norma Nacional de Atención Clínica de Pediatría. Doc. N.º 541. La Paz; 2025.",
  "Ministerio de Salud y Deportes de Bolivia. Norma Nacional de Atención Clínica de Medicina Interna. Doc. N.º 540. La Paz; 2025.",
  "Ministerio de Salud y Deportes de Bolivia. Norma Nacional de Atención Clínica de Urgencias y Emergencias. Doc. N.º 543. La Paz; 2025.",
  "Ministerio de Salud y Deportes de Bolivia. Norma Nacional de Atención Clínica de Traumatología. Doc. N.º 542. La Paz; 2025.",
  "Ministerio de Salud y Deportes de Bolivia. Norma Nacional de Atención Clínica de Neurología. Doc. N.º 538. La Paz; 2025.",
  "Ministerio de Salud y Deportes de Bolivia. Norma Nacional de Atención Clínica de Terapia Intensiva. Doc. N.º 539. La Paz; 2025.",
  "Ministerio de Salud y Deportes de Bolivia. Norma Nacional de Atención Clínica de los Cánceres Priorizados en la Niñez y Adolescencia. Doc. N.º 575. La Paz; 2025.",
  "Ministerio de Salud y Deportes de Bolivia. Normas y protocolos nacionales de atención materna, neonatal y salud sexual y reproductiva. La Paz; 2024–2026.",
  "Ministerio de Salud y Deportes de Bolivia. Normas y protocolos nacionales de vigilancia epidemiológica, enfermedades transmisibles e inmunización. La Paz; 2024–2026."
];

export const BIB_INTERNACIONAL = [
  "AHA. 2025 Guidelines for CPR and Emergency Cardiovascular Care. Circulation. 2025.",
  "AHA/AAP. Pediatric Basic and Advanced Life Support Guidelines. 2025.",
  "ILCOR. International Consensus on CPR Science (CoSTR). 2025.",
  "SCCM. Surviving Sepsis Campaign: Guidelines for Sepsis and Septic Shock. 2026.",
  "ADA. Standards of Care in Diabetes—2026. Diabetes Care. 2026.",
  "GINA. Global Strategy for Asthma Management and Prevention. 2025 Update.",
  "GOLD. Global Strategy for Prevention, Diagnosis and Management of COPD. 2026 Report.",
  "WHO. Guideline on Management of Pneumonia and Diarrhoea in Children up to 10 Years. Ginebra; 2024.",
  "ACOG. Gestational Hypertension and Preeclampsia. Practice Bulletin; 2024.",
  "Kliegman RM et al. Nelson Textbook of Pediatrics. 22nd ed. Elsevier.",
  "Jameson JL et al. Harrison's Principles of Internal Medicine. McGraw-Hill.",
  "Brunicardi FC et al. Schwartz's Principles of Surgery. McGraw-Hill.",
  "Tintinalli JE et al. Tintinalli's Emergency Medicine. McGraw-Hill."
];

export const BANK_DATA: Record<string, Question[]> = {
  pediatria: [
    { id: "PED-001", q: "Un recién nacido a término nace después de un parto vaginal. Al nacer presenta apnea, pero tiene frecuencia cardíaca de 80 lpm. Después de proporcionar calor, secar y estimular adecuadamente, continúa apneico. ¿Cuál es la intervención más importante?", ops: ["Administrar adrenalina IV", "Iniciar ventilación con presión positiva", "Realizar compresiones torácicas inmediatamente", "Administrar bicarbonato de sodio"], c: 1, x: "En apnea o respiración ineficaz con FC <100 lpm tras medidas iniciales, la prioridad es iniciar VPP." },
    { id: "PED-002", q: "Después de 30 segundos de ventilación con presión positiva correctamente realizada, un recién nacido presenta frecuencia cardíaca de 70 lpm. ¿Cuál es la conducta indicada?", ops: ["Continuar solamente con estimulación táctil", "Iniciar compresiones torácicas coordinadas con ventilación", "Administrar atropina", "Suspender la ventilación"], c: 1, x: "Si la FC permanece <60 lpm después de ventilación efectiva, se indican compresiones coordinadas con ventilación." },
    { id: "PED-003", q: "Un recién nacido de 24 horas presenta ictericia visible hasta el abdomen. ¿Cuál es la afirmación más correcta?", ops: ["Es fisiológica y no requiere evaluación", "La ictericia durante las primeras 24 horas debe considerarse potencialmente patológica", "Es consecuencia habitual de la lactancia materna", "Se debe tratar siempre con fototerapia inmediatamente"], c: 1, x: "La ictericia en las primeras 24 horas es signo de alarma." },
    { id: "PED-012", q: "¿Cuál es la recomendación general de la OMS para lactancia materna exclusiva?", ops: ["2 meses", "4 meses", "6 meses", "12 meses exclusivamente"], c: 2, x: "La OMS recomienda 6 meses de lactancia materna exclusiva." }
  ],
  medicina_interna: [
    { id: "MI-151", q: "Un paciente de 62 años consulta por dolor retroesternal opresivo de 40 minutos, irradiado a brazo izquierdo, acompañado de diaforesis. ¿Cuál es el diagnóstico que debe descartarse de forma prioritaria?", ops: ["ERGE", "Síndrome coronario agudo", "Costocondritis", "Neumonía"], c: 1, x: "El cuadro es altamente sugestivo de síndrome coronario agudo." },
    { id: "MI-152", q: "En un paciente con sospecha de síndrome coronario agudo, ¿qué estudio debe realizarse de manera prioritaria?", ops: ["Ecografía abdominal", "ECG de 12 derivaciones", "Colonoscopia", "Espirometría"], c: 1, x: "ECG prioritario en primeros 10 minutos." }
  ],
  ginecologia: [
    { id: "GO-301", q: "Una mujer de 24 años consulta por flujo vaginal homogéneo, grisáceo y con olor a pescado. El pH vaginal es 5,5 y se observan células guía. ¿Cuál es el diagnóstico?", ops: ["Candidiasis vulvovaginal", "Vaginosis bacteriana", "Tricomoniasis", "Gonorrea"], c: 1, x: "Vaginosis bacteriana por criterios de Amsel." },
    { id: "GO-373", q: "La preeclampsia se caracteriza por HTA >20 semanas asociada con:", ops: ["Proteinuria y/o disfunción de órgano", "Solo fiebre", "Solo anemia", "Hipoglucemia"], c: 0, x: "Criterio diagnóstico fundamental." }
  ],
  cirugia: [
    { id: "CIR-451", q: "Un paciente presenta dolor que comenzó en epigastrio y posteriormente se localizó en fosa ilíaca derecha, acompañado de anorexia y náuseas. ¿Cuál es el diagnóstico más probable?", ops: ["Colecistitis", "Apendicitis aguda", "Pancreatitis", "Diverticulitis"], c: 1, x: "Migración clásica de dolor en apendicitis aguda." }
  ]
};

export const CASOS_DATA: Record<string, CaseStudy[]> = {
  pediatria: [
    { id: "PED-C01", t: "Neumonía adquirida en la comunidad", p: "Mateo R., 3 años, masculino. Vacunación incompleta. Fiebre hasta 39,2 °C y dificultad respiratoria de 2 días.", preg: [{ q: "¿Cuál es el diagnóstico más probable?", ops: ["Bronquiolitis", "Neumonía adquirida en la comunidad", "Crisis asmática", "Laringotraqueítis"], c: 1 }], raz: "Fiebre + tos + taquipnea + consolidación = neumonía." }
  ]
};