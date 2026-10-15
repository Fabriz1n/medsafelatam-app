import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import type { User } from '@supabase/supabase-js';
import { Ionicons } from '@expo/vector-icons';
import { supabase, type PaymentRequest, type Plan } from '../lib/supabase';
import STR from '../lib/strings.es';
import {
  ICONOS, NOMBRES,
  SPECS, type CaseStudy, type Question,
} from '../constants/mslaData';

const FULL_BANK_DATA: Record<string, Question[]> = {
  "pediatria": [
    {
      "id": "PED-001",
      "q": "Un recién nacido a término nace después de un parto vaginal. Al nacer presenta apnea, pero tiene frecuencia cardíaca de 80 lpm. Después de proporcionar calor, secar y estimular adecuadamente, continúa apneico. ¿Cuál es la intervención más importante?",
      "ops": [
        "Administrar adrenalina intravenosa",
        "Iniciar ventilación con presión positiva",
        "Realizar compresiones torácicas inmediatamente",
        "Administrar bicarbonato de sodio"
      ],
      "c": 1,
      "x": "En apnea o respiración ineficaz con FC <100 lpm tras medidas iniciales, la prioridad es iniciar VPP. La ventilación efectiva es la intervención crítica inicial."
    },
    {
      "id": "PED-002",
      "q": "Después de 30 segundos de ventilación con presión positiva correctamente realizada, un recién nacido presenta frecuencia cardíaca de 70 lpm. ¿Cuál es la conducta indicada?",
      "ops": [
        "Continuar solamente con estimulación táctil",
        "Iniciar compresiones torácicas coordinadas con ventilación",
        "Administrar atropina",
        "Suspender la ventilación"
      ],
      "c": 1,
      "x": "Si la FC permanece <60 lpm después de ventilación efectiva, se indican compresiones coordinadas con ventilación. Antes de comprimir, asegurar ventilación efectiva."
    },
    {
      "id": "PED-003",
      "q": "Un recién nacido de 24 horas presenta ictericia visible hasta el abdomen. ¿Cuál es la afirmación más correcta?",
      "ops": [
        "Es fisiológica y no requiere evaluación",
        "La ictericia durante las primeras 24 horas debe considerarse potencialmente patológica",
        "Es consecuencia habitual de la lactancia materna",
        "Se debe tratar siempre con fototerapia inmediatamente"
      ],
      "c": 1,
      "x": "La ictericia en las primeras 24 horas es signo de alarma y requiere evaluación para descartar hemólisis u otras causas patológicas."
    },
    {
      "id": "PED-004",
      "q": "¿Cuál de las siguientes situaciones aumenta especialmente la sospecha de hiperbilirrubinemia no fisiológica?",
      "ops": [
        "Ictericia después del tercer día de vida",
        "Lactancia materna exclusiva con buena evolución",
        "Ictericia en las primeras 24 horas",
        "Pérdida de peso fisiológica"
      ],
      "c": 2
    },
    {
      "id": "PED-005",
      "q": "Un recién nacido de 10 días presenta temperatura de 38,2 °C, rechazo del alimento y letargia. ¿Cuál es la conducta más apropiada?",
      "ops": [
        "Manejo domiciliario con paracetamol",
        "Solicitar únicamente hemograma ambulatorio",
        "Evaluación urgente para infección bacteriana grave e inicio de manejo apropiado",
        "Observar durante 48 horas"
      ],
      "c": 2,
      "x": "En lactantes pequeños, la fiebre puede representar infección bacteriana grave incluso con signos clínicos sutiles."
    },
    {
      "id": "PED-006",
      "q": "¿Cuál de los siguientes signos puede ser una manifestación de infección grave en un recién nacido?",
      "ops": [
        "Buen apetito",
        "Hipotonía o disminución de la actividad",
        "Ganancia ponderal adecuada",
        "Llanto vigoroso"
      ],
      "c": 1
    },
    {
      "id": "PED-007",
      "q": "Se considera prematuro al recién nacido cuya edad gestacional es:",
      "ops": [
        "<40 semanas",
        "<39 semanas",
        "<37 semanas",
        "<35 semanas"
      ],
      "c": 2
    },
    {
      "id": "PED-008",
      "q": "Un recién nacido de 30 semanas presenta dificultad respiratoria inmediatamente después del nacimiento. ¿Cuál es uno de los principales diagnósticos diferenciales?",
      "ops": [
        "Síndrome de dificultad respiratoria por déficit de surfactante",
        "Apendicitis",
        "Estenosis pilórica",
        "Enterocolitis por leche materna"
      ],
      "c": 0
    },
    {
      "id": "PED-009",
      "q": "El principal mecanismo fisiopatológico del síndrome de dificultad respiratoria del prematuro es:",
      "ops": [
        "Exceso de surfactante",
        "Déficit de surfactante",
        "Hipersecreción de moco",
        "Edema cerebral"
      ],
      "c": 1
    },
    {
      "id": "PED-010",
      "q": "¿Cuál de los siguientes hallazgos radiológicos es característico de enterocolitis necrosante?",
      "ops": [
        "Neumoperitoneo exclusivamente",
        "Neumatosis intestinal",
        "Cardiomegalia",
        "Derrame pleural"
      ],
      "c": 1
    },
    {
      "id": "PED-011",
      "q": "Un recién nacido hijo de madre con diabetes presenta temblores y dificultad para alimentarse. ¿Qué trastorno debe sospecharse especialmente?",
      "ops": [
        "Hipercalcemia",
        "Hipoglucemia",
        "Hipernatremia",
        "Hiperbilirrubinemia aislada"
      ],
      "c": 1
    },
    {
      "id": "PED-012",
      "q": "¿Cuál es la recomendación general de la OMS para lactancia materna exclusiva?",
      "ops": [
        "2 meses",
        "4 meses",
        "6 meses",
        "12 meses exclusivamente"
      ],
      "c": 2
    },
    {
      "id": "PED-013",
      "q": "¿Cuál de las siguientes características es compatible con un recién nacido pequeño para la edad gestacional?",
      "ops": [
        "Peso inferior al esperado para su edad gestacional",
        "Peso siempre inferior a 1.000 g",
        "Edad gestacional inferior a 28 semanas obligatoriamente",
        "Apgar inferior a 7 necesariamente"
      ],
      "c": 0
    },
    {
      "id": "PED-014",
      "q": "¿Cuál de los siguientes NO forma parte de los componentes clásicos de la puntuación de Apgar?",
      "ops": [
        "Frecuencia cardíaca",
        "Esfuerzo respiratorio",
        "Tono muscular",
        "Glucemia"
      ],
      "c": 3
    },
    {
      "id": "PED-015",
      "q": "La puntuación de Apgar se evalúa clásicamente a:",
      "ops": [
        "1 y 5 minutos",
        "10 y 20 minutos únicamente",
        "30 y 60 minutos",
        "2 y 4 horas"
      ],
      "c": 0
    },
    {
      "id": "PED-016",
      "q": "La persistencia del conducto arterioso es especialmente frecuente en:",
      "ops": [
        "Recién nacidos postérmino",
        "Prematuros",
        "Adolescentes sanos",
        "Niños con anemia ferropénica"
      ],
      "c": 1
    },
    {
      "id": "PED-017",
      "q": "La taquipnea transitoria del recién nacido se relaciona principalmente con:",
      "ops": [
        "Retraso en la eliminación del líquido pulmonar fetal",
        "Déficit absoluto de hemoglobina",
        "Hemorragia intracraneal",
        "Hipoglucemia materna"
      ],
      "c": 0
    },
    {
      "id": "PED-018",
      "q": "Un recién nacido presenta dificultad respiratoria y líquido amniótico meconial. ¿Cuál es una complicación respiratoria posible?",
      "ops": [
        "Síndrome de aspiración meconial",
        "Estenosis subaórtica",
        "Atresia esofágica adquirida",
        "Síndrome nefrótico"
      ],
      "c": 0
    },
    {
      "id": "PED-019",
      "q": "Un recién nacido presenta salivación excesiva, tos y episodios de cianosis durante la alimentación. ¿Qué diagnóstico debe sospecharse?",
      "ops": [
        "Atresia esofágica con posible fístula traqueoesofágica",
        "Estenosis pilórica",
        "Invaginación intestinal",
        "Reflujo gastroesofágico fisiológico"
      ],
      "c": 0
    },
    {
      "id": "PED-020",
      "q": "La asociación de polihidramnios, dificultad para pasar una sonda nasogástrica y salivación excesiva debe hacer sospechar:",
      "ops": [
        "Atresia esofágica",
        "Estenosis pilórica",
        "Megacolon adquirido",
        "Intususcepción"
      ],
      "c": 0
    },
    {
      "id": "PED-021",
      "q": "¿Cuál es el indicador antropométrico más útil para valorar el estado nutricional agudo?",
      "ops": [
        "Talla para la edad",
        "Peso para la talla",
        "Perímetro cefálico aislado",
        "Edad ósea"
      ],
      "c": 1
    },
    {
      "id": "PED-022",
      "q": "La talla baja para la edad se relaciona principalmente con:",
      "ops": [
        "Desnutrición crónica",
        "Deshidratación aguda",
        "Hipoglucemia",
        "Fiebre"
      ],
      "c": 0
    },
    {
      "id": "PED-023",
      "q": "¿Cuál de los siguientes datos orienta a desnutrición aguda grave?",
      "ops": [
        "Peso adecuado para la talla",
        "Emaciación marcada",
        "Talla elevada",
        "Perímetro cefálico aumentado"
      ],
      "c": 1
    },
    {
      "id": "PED-024",
      "q": "La lactancia materna exclusiva durante los primeros seis meses significa:",
      "ops": [
        "Leche materna más agua",
        "Leche materna más jugos",
        "Leche materna sin otros alimentos ni líquidos, salvo medicamentos o suplementos indicados",
        "Leche materna más leche de fórmula diaria"
      ],
      "c": 2
    },
    {
      "id": "PED-025",
      "q": "La alimentación complementaria debe comenzar aproximadamente a:",
      "ops": [
        "2 meses",
        "4 meses",
        "6 meses",
        "12 meses"
      ],
      "c": 2
    },
    {
      "id": "PED-026",
      "q": "Un niño con retraso ponderal debe evaluarse inicialmente considerando:",
      "ops": [
        "Alimentación, antecedentes médicos y crecimiento longitudinal",
        "Solo hemoglobina",
        "Solo radiografía de tórax",
        "Solo examen de orina"
      ],
      "c": 0
    },
    {
      "id": "PED-027",
      "q": "La anemia nutricional más frecuente en la infancia es:",
      "ops": [
        "Anemia ferropénica",
        "Anemia aplásica",
        "Anemia hemolítica autoinmune",
        "Anemia perniciosa"
      ],
      "c": 0
    },
    {
      "id": "PED-028",
      "q": "¿Cuál es un hallazgo compatible con anemia ferropénica?",
      "ops": [
        "Microcitosis e hipocromía",
        "Macrocitosis marcada",
        "Policitemia",
        "Leucocitosis aislada"
      ],
      "c": 0
    },
    {
      "id": "PED-029",
      "q": "¿Cuál de los siguientes nutrientes tiene especial importancia en la prevención de defectos del tubo neural?",
      "ops": [
        "Vitamina C",
        "Ácido fólico",
        "Vitamina K",
        "Vitamina D"
      ],
      "c": 1
    },
    {
      "id": "PED-030",
      "q": "El perímetro cefálico es especialmente importante para valorar:",
      "ops": [
        "Desarrollo renal",
        "Crecimiento cerebral",
        "Función hepática",
        "Masa muscular exclusivamente"
      ],
      "c": 1
    },
    {
      "id": "PED-031",
      "q": "Un niño de 18 meses no camina de forma independiente. ¿Cuál es la conducta más apropiada?",
      "ops": [
        "Considerarlo siempre normal hasta los 3 años",
        "Evaluar el desarrollo y buscar signos de alarma",
        "Indicar antibióticos",
        "Solicitar siempre una TAC cerebral de urgencia"
      ],
      "c": 1
    },
    {
      "id": "PED-032",
      "q": "¿Cuál de las siguientes áreas forma parte de la evaluación del desarrollo infantil?",
      "ops": [
        "Motor grueso",
        "Motor fino",
        "Lenguaje y área social",
        "Todas las anteriores"
      ],
      "c": 3
    },
    {
      "id": "PED-033",
      "q": "Un niño pierde habilidades que previamente había adquirido. Este hallazgo se denomina:",
      "ops": [
        "Variación normal",
        "Regresión del desarrollo",
        "Crecimiento compensatorio",
        "Maduración acelerada"
      ],
      "c": 1
    },
    {
      "id": "PED-034",
      "q": "¿Cuál de las siguientes condiciones puede contribuir al retraso del crecimiento?",
      "ops": [
        "Enfermedad crónica",
        "Malabsorción",
        "Ingesta insuficiente",
        "Todas las anteriores"
      ],
      "c": 3
    },
    {
      "id": "PED-035",
      "q": "La obesidad infantil aumenta el riesgo futuro de:",
      "ops": [
        "Diabetes mellitus tipo 2",
        "Hipertensión arterial",
        "Enfermedad cardiovascular",
        "Todas las anteriores"
      ],
      "c": 3
    },
    {
      "id": "PED-036",
      "q": "En la evaluación de obesidad pediátrica debe utilizarse principalmente:",
      "ops": [
        "IMC ajustado por edad y sexo",
        "Peso aislado",
        "Talla aislada",
        "Perímetro cefálico"
      ],
      "c": 0
    },
    {
      "id": "PED-037",
      "q": "¿Cuál es una consecuencia posible de la obesidad infantil?",
      "ops": [
        "Esteatosis hepática metabólica",
        "Hipertensión",
        "Alteraciones metabólicas",
        "Todas las anteriores"
      ],
      "c": 3
    },
    {
      "id": "PED-038",
      "q": "En un lactante con diarrea, continuar la lactancia materna:",
      "ops": [
        "Está contraindicado",
        "Debe suspenderse 24 horas",
        "Generalmente debe mantenerse",
        "Solo debe reiniciarse después de desaparecer la diarrea"
      ],
      "c": 2
    },
    {
      "id": "PED-039",
      "q": "Según recomendaciones recientes de la OMS, el manejo de la diarrea infantil incluye como elemento fundamental:",
      "ops": [
        "Suspender toda alimentación",
        "Rehidratación adecuada",
        "Antibióticos para todos los casos",
        "Antidiarreicos de rutina"
      ],
      "c": 1,
      "x": "La OMS mantiene la rehidratación oral como componente central y señala que el zinc reduce la duración del episodio."
    },
    {
      "id": "PED-040",
      "q": "¿Cuál de las siguientes medidas contribuye a prevenir enfermedad diarreica infantil?",
      "ops": [
        "Agua segura",
        "Higiene de manos",
        "Lactancia materna",
        "Todas las anteriores"
      ],
      "c": 3
    },
    {
      "id": "PED-041",
      "q": "Un niño de 3 años presenta fiebre, tos, taquipnea y tiraje. ¿Cuál es el diagnóstico sindrómico más probable?",
      "ops": [
        "Neumonía",
        "Gastritis",
        "Dermatitis",
        "Otitis externa"
      ],
      "c": 0
    },
    {
      "id": "PED-042",
      "q": "Según la guía OMS 2024, la actualización sobre neumonía infantil amplió específicamente el alcance de las recomendaciones hasta:",
      "ops": [
        "2 años",
        "5 años",
        "10 años",
        "18 años"
      ],
      "c": 2
    },
    {
      "id": "PED-043",
      "q": "En un niño con neumonía, ¿qué signo indica mayor gravedad?",
      "ops": [
        "Rinorrea aislada",
        "Dificultad respiratoria importante",
        "Tos leve",
        "Apetito conservado"
      ],
      "c": 1
    },
    {
      "id": "PED-044",
      "q": "En un niño con neumonía grave e hipoxemia, una intervención fundamental es:",
      "ops": [
        "Oxigenoterapia cuando está indicada",
        "Restricción absoluta de líquidos en todos los casos",
        "Antidiarreicos",
        "Suspender alimentación por varios días"
      ],
      "c": 0
    },
    {
      "id": "PED-045",
      "q": "En niños pequeños, una causa bacteriana importante de neumonía adquirida en la comunidad es:",
      "ops": [
        "Streptococcus pneumoniae",
        "Candida albicans",
        "Plasmodium vivax",
        "Giardia lamblia"
      ],
      "c": 0,
      "x": "La OMS continúa señalando a S. pneumoniae como causa bacteriana importante de neumonía infantil."
    },
    {
      "id": "PED-046",
      "q": "La vacunación contra neumococo contribuye principalmente a prevenir:",
      "ops": [
        "Neumonía y enfermedad neumocócica invasiva",
        "Diabetes",
        "Asma alérgica",
        "Apendicitis"
      ],
      "c": 0
    },
    {
      "id": "PED-047",
      "q": "Un niño presenta diarrea acuosa sin sangre y signos de deshidratación leve/moderada. La intervención inicial fundamental es:",
      "ops": [
        "Rehidratación oral",
        "Cirugía inmediata",
        "Antibiótico intravenoso obligatorio",
        "Ayuno absoluto"
      ],
      "c": 0
    },
    {
      "id": "PED-048",
      "q": "¿Cuál es un signo clínico de deshidratación?",
      "ops": [
        "Mucosas secas",
        "Edema pulmonar",
        "Hipertensión severa",
        "Bradicardia fisiológica"
      ],
      "c": 0
    },
    {
      "id": "PED-049",
      "q": "En la diarrea infantil, la presencia de sangre en las heces:",
      "ops": [
        "Siempre es normal",
        "Requiere evaluación clínica",
        "Descarta infección",
        "Indica automáticamente enfermedad viral"
      ],
      "c": 1
    },
    {
      "id": "PED-050",
      "q": "¿Cuál es una medida preventiva importante contra diarrea infantil?",
      "ops": [
        "Vacunación contra rotavirus según esquema vigente",
        "Evitar toda fruta",
        "Suspender lactancia",
        "Uso preventivo universal de antibióticos"
      ],
      "c": 0
    },
    {
      "id": "PED-051",
      "q": "Un niño presenta fiebre, tos, conjuntivitis y exantema que comenzó en cara y progresa hacia tronco. ¿Cuál es el diagnóstico?",
      "ops": [
        "Sarampión",
        "Varicela",
        "Escarlatina",
        "Rubéola exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "PED-052",
      "q": "La prevención primaria más importante del sarampión es:",
      "ops": [
        "Antibióticos",
        "Vacunación",
        "Corticoides",
        "Antifúngicos"
      ],
      "c": 1
    },
    {
      "id": "PED-053",
      "q": "Un niño presenta fiebre, odinofagia y exantema áspero, descrito clásicamente como “piel de lija”. ¿Cuál es el diagnóstico probable?",
      "ops": [
        "Escarlatina",
        "Sarampión",
        "Varicela",
        "Dengue"
      ],
      "c": 0
    },
    {
      "id": "PED-054",
      "q": "La escarlatina está asociada principalmente con:",
      "ops": [
        "Streptococcus pyogenes",
        "Escherichia coli",
        "Salmonella Typhi",
        "Mycoplasma exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "PED-055",
      "q": "Un niño presenta lesiones vesiculares en diferentes etapas evolutivas, incluyendo máculas, pápulas, vesículas y costras. ¿Qué diagnóstico es más probable?",
      "ops": [
        "Varicela",
        "Sarampión",
        "Eritema infeccioso",
        "Escarlatina"
      ],
      "c": 0
    },
    {
      "id": "PED-056",
      "q": "La enfermedad mano-pie-boca se asocia frecuentemente con:",
      "ops": [
        "Enterovirus",
        "Streptococcus pneumoniae",
        "Mycobacterium tuberculosis",
        "Candida"
      ],
      "c": 0
    },
    {
      "id": "PED-057",
      "q": "Un niño presenta fiebre prolongada, conjuntivitis bilateral no purulenta, cambios orales y exantema. ¿Qué diagnóstico debe considerarse?",
      "ops": [
        "Enfermedad de Kawasaki",
        "Varicela",
        "Otitis media",
        "Gastroenteritis"
      ],
      "c": 0
    },
    {
      "id": "PED-058",
      "q": "Una complicación cardiovascular importante de la enfermedad de Kawasaki es:",
      "ops": [
        "Aneurisma de arterias coronarias",
        "Coartación de aorta adquirida",
        "Tetralogía de Fallot",
        "Comunicación interauricular adquirida"
      ],
      "c": 0
    },
    {
      "id": "PED-059",
      "q": "Un niño presenta fiebre, cefalea, rigidez de nuca y alteración del estado de conciencia. ¿Cuál es la prioridad?",
      "ops": [
        "Considerar meningitis y realizar evaluación urgente",
        "Dar solo antipirético y observar",
        "Dar antidiarreico",
        "Alta inmediata"
      ],
      "c": 0
    },
    {
      "id": "PED-060",
      "q": "¿Cuál de los siguientes puede ser signo de meningitis en un lactante?",
      "ops": [
        "Irritabilidad o letargia",
        "Apetito aumentado",
        "Ganancia ponderal acelerada",
        "Tos aislada"
      ],
      "c": 0
    },
    {
      "id": "PED-061",
      "q": "La infección por meningococo puede producir:",
      "ops": [
        "Meningitis y sepsis",
        "Solo diarrea",
        "Solo otitis",
        "Solo hepatitis"
      ],
      "c": 0
    },
    {
      "id": "PED-062",
      "q": "En un niño con sospecha de tuberculosis, un elemento importante de la evaluación incluye:",
      "ops": [
        "Historia epidemiológica y evaluación clínica",
        "Solo hemoglobina",
        "Solo glucemia",
        "Solo examen de orina"
      ],
      "c": 0
    },
    {
      "id": "PED-063",
      "q": "¿Cuál de los siguientes favorece la transmisión de infecciones respiratorias?",
      "ops": [
        "Hacinamiento",
        "Buena ventilación",
        "Higiene de manos",
        "Vacunación"
      ],
      "c": 0
    },
    {
      "id": "PED-064",
      "q": "En pediatría, el uso racional de antibióticos implica:",
      "ops": [
        "Utilizarlos para todas las infecciones virales",
        "Utilizarlos cuando existe indicación clínica apropiada",
        "Cambiarlos diariamente sin motivo",
        "Utilizarlos preventivamente en todo niño febril"
      ],
      "c": 1,
      "x": "La OMS mantiene el enfoque AWaRe para promover el uso apropiado de antibióticos."
    },
    {
      "id": "PED-065",
      "q": "Un niño con infección viral respiratoria no complicada requiere generalmente:",
      "ops": [
        "Antibiótico obligatorio",
        "Tratamiento sintomático y vigilancia de signos de alarma",
        "Cirugía",
        "Corticoide sistémico siempre"
      ],
      "c": 1
    },
    {
      "id": "PED-066",
      "q": "Un lactante de 7 meses presenta rinorrea, tos, sibilancias y dificultad respiratoria durante una infección viral. El diagnóstico más probable es:",
      "ops": [
        "Bronquiolitis",
        "Apendicitis",
        "Meningitis",
        "Síndrome nefrótico"
      ],
      "c": 0
    },
    {
      "id": "PED-067",
      "q": "El virus clásicamente asociado con bronquiolitis es:",
      "ops": [
        "Virus sincitial respiratorio",
        "Virus de hepatitis B",
        "VIH",
        "Virus de Epstein-Barr"
      ],
      "c": 0
    },
    {
      "id": "PED-068",
      "q": "En bronquiolitis, la evaluación inicial debe centrarse especialmente en:",
      "ops": [
        "Trabajo respiratorio y oxigenación",
        "Talla exclusivamente",
        "Agudeza visual",
        "Examen dermatológico"
      ],
      "c": 0
    },
    {
      "id": "PED-069",
      "q": "¿Cuál es un factor de riesgo de enfermedad respiratoria grave en un lactante?",
      "ops": [
        "Prematuridad",
        "Buena nutrición",
        "Edad escolar",
        "Vacunación completa"
      ],
      "c": 0
    },
    {
      "id": "PED-070",
      "q": "Un niño de 6 años presenta episodios recurrentes de tos nocturna, sibilancias y disnea que mejoran con broncodilatador. ¿Cuál es el diagnóstico más probable?",
      "ops": [
        "Asma",
        "Neumotórax espontáneo",
        "Fibrosis pulmonar",
        "Tuberculosis miliar"
      ],
      "c": 0
    },
    {
      "id": "PED-071",
      "q": "Una característica típica del asma es:",
      "ops": [
        "Obstrucción variable del flujo aéreo",
        "Obstrucción fija en todos los pacientes",
        "Enfermedad exclusivamente infecciosa",
        "Ausencia de inflamación bronquial"
      ],
      "c": 0
    },
    {
      "id": "PED-072",
      "q": "¿Cuál de los siguientes puede desencadenar síntomas de asma?",
      "ops": [
        "Alérgenos",
        "Infecciones respiratorias",
        "Ejercicio",
        "Todos los anteriores"
      ],
      "c": 3
    },
    {
      "id": "PED-073",
      "q": "En una crisis asmática grave, un signo de alarma es:",
      "ops": [
        "Dificultad respiratoria intensa",
        "Habla normal sin disnea",
        "Ausencia total de síntomas",
        "Frecuencia respiratoria normal"
      ],
      "c": 0
    },
    {
      "id": "PED-074",
      "q": "En un niño con crisis asmática, un tratamiento broncodilatador de rescate habitual es:",
      "ops": [
        "Salbutamol",
        "Omeprazol",
        "Amoxicilina",
        "Furosemida"
      ],
      "c": 0
    },
    {
      "id": "PED-075",
      "q": "En una crisis asmática grave, además del broncodilatador, puede estar indicado:",
      "ops": [
        "Corticoide sistémico",
        "Antibiótico siempre",
        "Antidiarreico",
        "Antifúngico siempre"
      ],
      "c": 0
    },
    {
      "id": "PED-076",
      "q": "Un niño presenta tos perruna, disfonía y estridor inspiratorio. ¿Cuál es el diagnóstico más probable?",
      "ops": [
        "Crup viral",
        "Neumonía lobar",
        "Asma exclusivamente",
        "Tuberculosis"
      ],
      "c": 0
    },
    {
      "id": "PED-077",
      "q": "El estridor inspiratorio sugiere principalmente obstrucción:",
      "ops": [
        "De vía aérea superior",
        "De alvéolos exclusivamente",
        "Renal",
        "Intestinal"
      ],
      "c": 0
    },
    {
      "id": "PED-078",
      "q": "Un niño con dificultad respiratoria presenta saturación de oxígeno de 84%. La prioridad es:",
      "ops": [
        "Evaluar y tratar la hipoxemia",
        "Dar alimentos sólidos",
        "Realizar prueba de tolerancia oral",
        "Alta"
      ],
      "c": 0
    },
    {
      "id": "PED-079",
      "q": "¿Cuál es un signo de aumento del trabajo respiratorio?",
      "ops": [
        "Tiraje intercostal",
        "Bradicardia fisiológica",
        "Midriasis aislada",
        "Edema periférico aislado"
      ],
      "c": 0
    },
    {
      "id": "PED-080",
      "q": "En neumonía infantil, la taquipnea es:",
      "ops": [
        "Un signo clínico importante",
        "Siempre irrelevante",
        "Diagnóstica de asma",
        "Diagnóstica de meningitis"
      ],
      "c": 0
    },
    {
      "id": "PED-081",
      "q": "En un niño con tos crónica, pérdida de peso y contacto domiciliario con tuberculosis, debe considerarse:",
      "ops": [
        "Tuberculosis",
        "Apendicitis",
        "Gastroenteritis",
        "Otitis externa"
      ],
      "c": 0
    },
    {
      "id": "PED-082",
      "q": "La tos ferina se caracteriza clásicamente por:",
      "ops": [
        "Tos paroxística",
        "Diarrea sanguinolenta como signo principal",
        "Ictericia",
        "Hematuria"
      ],
      "c": 0
    },
    {
      "id": "PED-083",
      "q": "La vacunación constituye una medida preventiva fundamental frente a:",
      "ops": [
        "Tos ferina",
        "Tuberculosis",
        "Enfermedad neumocócica",
        "Todas las anteriores"
      ],
      "c": 3
    },
    {
      "id": "PED-084",
      "q": "En un niño con cuerpo extraño aspirado, la aparición súbita de tos y dificultad respiratoria debe hacer sospechar:",
      "ops": [
        "Aspiración de cuerpo extraño",
        "Bronquiolitis crónica",
        "Síndrome nefrótico",
        "Gastroenteritis"
      ],
      "c": 0
    },
    {
      "id": "PED-085",
      "q": "Un cuerpo extraño en vía aérea puede producir:",
      "ops": [
        "Obstrucción parcial o completa",
        "Solo fiebre",
        "Solo diarrea",
        "Solo anemia"
      ],
      "c": 0
    },
    {
      "id": "PED-086",
      "q": "Un lactante presenta vómitos recurrentes después de alimentarse, pero mantiene buen estado general y adecuado crecimiento. ¿Cuál es una posibilidad frecuente?",
      "ops": [
        "Reflujo gastroesofágico fisiológico",
        "Meningitis",
        "Apendicitis",
        "Sepsis"
      ],
      "c": 0
    },
    {
      "id": "PED-087",
      "q": "Un lactante de 5 semanas presenta vómitos proyectivos no biliosos después de las comidas y hambre persistente. ¿Qué diagnóstico debe sospecharse?",
      "ops": [
        "Estenosis hipertrófica del píloro",
        "Atresia duodenal",
        "Invaginación intestinal",
        "Gastroenteritis viral exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "PED-088",
      "q": "Un hallazgo clásico de estenosis hipertrófica del píloro es:",
      "ops": [
        "Vómito bilioso",
        "Vómito no bilioso proyectivo",
        "Hemoptisis",
        "Diarrea sanguinolenta"
      ],
      "c": 1
    },
    {
      "id": "PED-089",
      "q": "Un niño presenta dolor abdominal episódico intenso, llanto, flexión de las piernas y posteriormente heces con sangre y moco. ¿Cuál es el diagnóstico probable?",
      "ops": [
        "Invaginación intestinal",
        "Reflujo",
        "Gastritis",
        "Hepatitis"
      ],
      "c": 0
    },
    {
      "id": "PED-090",
      "q": "El tratamiento inicial de un niño con deshidratación leve/moderada por diarrea generalmente incluye:",
      "ops": [
        "Solución de rehidratación oral",
        "Ayuno absoluto",
        "Antibióticos para todos",
        "Cirugía"
      ],
      "c": 0
    },
    {
      "id": "PED-091",
      "q": "La diarrea persistente puede producir:",
      "ops": [
        "Desnutrición",
        "Deshidratación",
        "Alteraciones electrolíticas",
        "Todas las anteriores"
      ],
      "c": 3
    },
    {
      "id": "PED-092",
      "q": "Un niño presenta dolor abdominal que comienza periumbilical y luego se localiza en fosa ilíaca derecha, acompañado de fiebre y anorexia. ¿Qué diagnóstico debe sospecharse?",
      "ops": [
        "Apendicitis aguda",
        "Reflujo",
        "Hepatitis viral",
        "Estreñimiento funcional necesariamente"
      ],
      "c": 0
    },
    {
      "id": "PED-093",
      "q": "En apendicitis pediátrica, un hallazgo que aumenta la sospecha es:",
      "ops": [
        "Dolor migratorio hacia fosa ilíaca derecha",
        "Dolor exclusivamente torácico",
        "Hemoptisis",
        "Ictericia aislada"
      ],
      "c": 0
    },
    {
      "id": "PED-094",
      "q": "El estreñimiento funcional infantil puede asociarse con:",
      "ops": [
        "Heces duras y dolor al defecar",
        "Hemoptisis",
        "Estridor",
        "Convulsiones"
      ],
      "c": 0
    },
    {
      "id": "PED-095",
      "q": "La enfermedad celíaca se relaciona con una respuesta inmunológica frente a:",
      "ops": [
        "Gluten",
        "Lactosa exclusivamente",
        "Sacarosa",
        "Fructosa exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "PED-096",
      "q": "Un niño con enfermedad celíaca puede presentar:",
      "ops": [
        "Diarrea crónica",
        "Distensión abdominal",
        "Falta de crecimiento",
        "Todas las anteriores"
      ],
      "c": 3
    },
    {
      "id": "PED-097",
      "q": "Un niño presenta ictericia, coluria y elevación marcada de transaminasas. Debe evaluarse principalmente:",
      "ops": [
        "Enfermedad hepática",
        "Asma",
        "Otitis",
        "Dermatitis"
      ],
      "c": 0
    },
    {
      "id": "PED-098",
      "q": "En hepatitis aguda, un hallazgo frecuente puede ser:",
      "ops": [
        "Elevación de aminotransferasas",
        "Hipoglucemia obligatoria",
        "Policitemia",
        "Trombocitosis obligatoria"
      ],
      "c": 0
    },
    {
      "id": "PED-099",
      "q": "¿Cuál de las siguientes puede ser una causa de dolor abdominal recurrente funcional en escolares?",
      "ops": [
        "Trastorno funcional gastrointestinal",
        "Siempre apendicitis",
        "Siempre pancreatitis",
        "Siempre obstrucción intestinal"
      ],
      "c": 0
    },
    {
      "id": "PED-100",
      "q": "La presencia de dolor abdominal intenso acompañado de deterioro general y signos de irritación peritoneal requiere:",
      "ops": [
        "Evaluación urgente",
        "Alta automática",
        "Solo hidratación domiciliaria",
        "Antidiarreicos"
      ],
      "c": 0
    },
    {
      "id": "PED-101",
      "q": "Un niño presenta soplo holosistólico y signos de sobrecarga pulmonar. ¿Cuál de las siguientes cardiopatías debe considerarse?",
      "ops": [
        "Comunicación interventricular",
        "Comunicación interauricular exclusivamente",
        "Coartación exclusivamente",
        "Estenosis pulmonar aislada"
      ],
      "c": 0
    },
    {
      "id": "PED-102",
      "q": "La comunicación interventricular produce inicialmente:",
      "ops": [
        "Cortocircuito izquierda-derecha",
        "Cortocircuito derecha-izquierda siempre",
        "Ausencia de flujo pulmonar",
        "Flujo sistémico cero"
      ],
      "c": 0
    },
    {
      "id": "PED-103",
      "q": "Un lactante presenta cianosis marcada durante episodios de llanto y mejora al adoptar posición en cuclillas. ¿Qué cardiopatía debe considerarse?",
      "ops": [
        "Tetralogía de Fallot",
        "Comunicación interauricular simple",
        "Conducto arterioso pequeño",
        "Coartación leve"
      ],
      "c": 0
    },
    {
      "id": "PED-104",
      "q": "La tetralogía de Fallot pertenece al grupo de cardiopatías:",
      "ops": [
        "Cianóticas",
        "Exclusivamente acianóticas",
        "Adquiridas",
        "Infecciosas"
      ],
      "c": 0
    },
    {
      "id": "PED-105",
      "q": "La coartación de aorta puede producir:",
      "ops": [
        "Diferencia de pulsos y presión arterial entre extremidades",
        "Diarrea",
        "Ictericia",
        "Estridor aislado"
      ],
      "c": 0
    },
    {
      "id": "PED-106",
      "q": "Un soplo cardíaco en un niño debe evaluarse considerando:",
      "ops": [
        "Características del soplo",
        "Síntomas asociados",
        "Examen cardiovascular completo",
        "Todas las anteriores"
      ],
      "c": 3
    },
    {
      "id": "PED-107",
      "q": "La fiebre reumática se relaciona principalmente con infección previa por:",
      "ops": [
        "Streptococcus pyogenes",
        "Staphylococcus aureus exclusivamente",
        "E. coli",
        "Candida"
      ],
      "c": 0
    },
    {
      "id": "PED-108",
      "q": "Una complicación importante de fiebre reumática es:",
      "ops": [
        "Carditis",
        "Apendicitis",
        "Pancreatitis exclusivamente",
        "Nefrolitiasis"
      ],
      "c": 0
    },
    {
      "id": "PED-109",
      "q": "La endocarditis infecciosa puede manifestarse con:",
      "ops": [
        "Fiebre persistente",
        "Soplo nuevo o cambiado",
        "Fenómenos embólicos",
        "Todas las anteriores"
      ],
      "c": 3
    },
    {
      "id": "PED-110",
      "q": "En un niño con síncope relacionado con ejercicio debe descartarse especialmente:",
      "ops": [
        "Cardiopatía potencialmente grave",
        "Gastroenteritis",
        "Otitis",
        "Dermatitis"
      ],
      "c": 0
    },
    {
      "id": "PED-111",
      "q": "Un niño presenta una convulsión generalizada que dura 3 minutos y posteriormente recupera completamente la conciencia. Esto corresponde inicialmente a:",
      "ops": [
        "Crisis convulsiva autolimitada",
        "Estado epiléptico obligatoriamente",
        "Meningitis obligatoriamente",
        "Coma"
      ],
      "c": 0
    },
    {
      "id": "PED-112",
      "q": "Una convulsión febril simple ocurre típicamente en niños:",
      "ops": [
        "Entre aproximadamente 6 meses y 5 años",
        "Solo recién nacidos",
        "Solo adolescentes",
        "Solo adultos"
      ],
      "c": 0
    },
    {
      "id": "PED-113",
      "q": "¿Cuál es una característica de una convulsión febril simple?",
      "ops": [
        "Generalizada y de duración breve",
        "Siempre focal",
        "Siempre dura >30 minutos",
        "Siempre deja déficit neurológico permanente"
      ],
      "c": 0
    },
    {
      "id": "PED-114",
      "q": "Un niño presenta fiebre, rigidez de nuca y alteración del sensorio. ¿Cuál es el diagnóstico prioritario a descartar?",
      "ops": [
        "Meningitis",
        "Estreñimiento",
        "Otitis externa",
        "Reflujo"
      ],
      "c": 0
    },
    {
      "id": "PED-115",
      "q": "Un signo de hipertensión intracraneal puede ser:",
      "ops": [
        "Alteración progresiva del nivel de conciencia",
        "Apetito aumentado",
        "Tos aislada",
        "Diarrea"
      ],
      "c": 0
    },
    {
      "id": "PED-116",
      "q": "La hidrocefalia corresponde a:",
      "ops": [
        "Alteración del equilibrio de líquido cefalorraquídeo con aumento de los ventrículos",
        "Inflamación exclusiva del hígado",
        "Enfermedad renal",
        "Enfermedad intestinal"
      ],
      "c": 0
    },
    {
      "id": "PED-117",
      "q": "Un lactante presenta fontanela anterior abombada, fiebre e irritabilidad. ¿Qué debe considerarse?",
      "ops": [
        "Infección del sistema nervioso central",
        "Normalidad absoluta",
        "Estreñimiento",
        "Rinitis simple obligatoriamente"
      ],
      "c": 0
    },
    {
      "id": "PED-118",
      "q": "En un niño con sospecha de meningitis, el tratamiento debe:",
      "ops": [
        "Retrasarse varios días",
        "Iniciarse urgentemente según evaluación clínica y protocolos",
        "Evitarse siempre",
        "Sustituirse por vitaminas"
      ],
      "c": 1
    },
    {
      "id": "PED-119",
      "q": "La parálisis cerebral infantil se caracteriza por:",
      "ops": [
        "Trastornos permanentes del movimiento y la postura derivados de una lesión cerebral en desarrollo",
        "Enfermedad exclusivamente muscular",
        "Infección intestinal",
        "Enfermedad renal"
      ],
      "c": 0
    },
    {
      "id": "PED-120",
      "q": "La detección temprana de alteraciones del desarrollo permite:",
      "ops": [
        "Intervención precoz",
        "Evitar seguimiento",
        "Retrasar rehabilitación",
        "Suspender controles"
      ],
      "c": 0
    },
    {
      "id": "PED-121",
      "q": "Un niño presenta poliuria, polidipsia, pérdida de peso y glucemia elevada. ¿Cuál es el diagnóstico más probable?",
      "ops": [
        "Diabetes mellitus",
        "Hipotiroidismo",
        "Síndrome nefrótico",
        "Anemia"
      ],
      "c": 0
    },
    {
      "id": "PED-122",
      "q": "La diabetes mellitus tipo 1 se caracteriza principalmente por:",
      "ops": [
        "Déficit absoluto de insulina",
        "Exceso absoluto de insulina",
        "Ausencia de glucagón",
        "Hipercalcemia"
      ],
      "c": 0
    },
    {
      "id": "PED-123",
      "q": "Un niño con diabetes tipo 1 presenta vómitos, dolor abdominal, respiración profunda y glucemia elevada. ¿Qué complicación debe sospecharse?",
      "ops": [
        "Cetoacidosis diabética",
        "Hipotiroidismo",
        "Síndrome nefrótico",
        "Gastroenteritis simple necesariamente"
      ],
      "c": 0
    },
    {
      "id": "PED-124",
      "q": "La respiración profunda y rápida en la cetoacidosis diabética se denomina:",
      "ops": [
        "Respiración de Kussmaul",
        "Respiración atáxica",
        "Respiración paradójica",
        "Apnea obstructiva"
      ],
      "c": 0
    },
    {
      "id": "PED-125",
      "q": "Un niño con cetoacidosis diabética presenta alteraciones del potasio. Por ello debe monitorizarse especialmente:",
      "ops": [
        "Potasio sérico",
        "Bilirrubina exclusivamente",
        "Amilasa exclusivamente",
        "Hemoglobina exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "PED-126",
      "q": "El hipotiroidismo congénito no tratado puede producir:",
      "ops": [
        "Alteraciones importantes del desarrollo neurológico",
        "Solo diarrea transitoria",
        "Asma",
        "Apendicitis"
      ],
      "c": 0
    },
    {
      "id": "PED-127",
      "q": "Una manifestación posible de hipotiroidismo infantil es:",
      "ops": [
        "Estreñimiento",
        "Taquicardia persistente",
        "Pérdida de peso marcada obligatoria",
        "Hiperactividad extrema obligatoria"
      ],
      "c": 0
    },
    {
      "id": "PED-128",
      "q": "Un niño presenta talla baja y velocidad de crecimiento disminuida. Una evaluación inicial debe incluir:",
      "ops": [
        "Historia clínica y curva de crecimiento",
        "Solo radiografía de tórax",
        "Solo examen de orina",
        "Solo electrocardiograma"
      ],
      "c": 0
    },
    {
      "id": "PED-129",
      "q": "La pubertad precoz se caracteriza por:",
      "ops": [
        "Aparición de características sexuales secundarias antes de la edad esperada",
        "Ausencia total de crecimiento",
        "Hipoglucemia obligatoria",
        "Anemia obligatoria"
      ],
      "c": 0
    },
    {
      "id": "PED-130",
      "q": "La obesidad infantil puede asociarse con:",
      "ops": [
        "Resistencia a la insulina",
        "Hipertensión",
        "Alteraciones lipídicas",
        "Todas las anteriores"
      ],
      "c": 3
    },
    {
      "id": "PED-131",
      "q": "Un niño presenta edema periorbitario, proteinuria importante e hipoalbuminemia. ¿Qué síndrome debe sospecharse?",
      "ops": [
        "Síndrome nefrótico",
        "Síndrome nefrítico",
        "Diabetes insípida",
        "Tubulopatía exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "PED-132",
      "q": "La característica principal del síndrome nefrótico es:",
      "ops": [
        "Proteinuria significativa",
        "Hemoptisis",
        "Hiperglucemia",
        "Leucopenia"
      ],
      "c": 0
    },
    {
      "id": "PED-133",
      "q": "Un niño presenta edema, hematuria color “coca-cola” e hipertensión después de una infección faríngea. ¿Cuál es el diagnóstico probable?",
      "ops": [
        "Glomerulonefritis postestreptocócica",
        "Síndrome nefrótico puro",
        "Cistitis simple",
        "Diabetes mellitus"
      ],
      "c": 0
    },
    {
      "id": "PED-134",
      "q": "La glomerulonefritis postestreptocócica puede presentar:",
      "ops": [
        "Hematuria",
        "Edema",
        "Hipertensión",
        "Todas las anteriores"
      ],
      "c": 3
    },
    {
      "id": "PED-135",
      "q": "Un niño presenta fiebre, disuria y polaquiuria. ¿Qué diagnóstico debe considerarse?",
      "ops": [
        "Infección urinaria",
        "Neumonía",
        "Meningitis",
        "Asma"
      ],
      "c": 0
    },
    {
      "id": "PED-136",
      "q": "En un lactante con fiebre sin foco claro, la infección urinaria:",
      "ops": [
        "Puede ser una causa oculta de fiebre",
        "Nunca debe considerarse",
        "Solo ocurre en adolescentes",
        "No requiere evaluación"
      ],
      "c": 0
    },
    {
      "id": "PED-137",
      "q": "Una complicación importante de una infección urinaria febril recurrente en niños puede ser:",
      "ops": [
        "Daño renal",
        "Catarata",
        "Asma",
        "Apendicitis"
      ],
      "c": 0
    },
    {
      "id": "PED-138",
      "q": "Un niño presenta oliguria y aumento de creatinina después de un episodio de deshidratación severa. ¿Qué debe sospecharse?",
      "ops": [
        "Lesión renal aguda",
        "Síndrome de Kawasaki",
        "Asma",
        "Hepatitis"
      ],
      "c": 0
    },
    {
      "id": "PED-139",
      "q": "En lesión renal aguda, una medida fundamental es:",
      "ops": [
        "Identificar y tratar la causa",
        "Administrar líquidos indiscriminadamente a todos",
        "Evitar controlar electrolitos",
        "No monitorizar diuresis"
      ],
      "c": 0
    },
    {
      "id": "PED-140",
      "q": "La hipertensión arterial pediátrica debe evaluarse considerando:",
      "ops": [
        "Edad, sexo y talla",
        "Solo peso",
        "Solo temperatura",
        "Solo frecuencia cardíaca"
      ],
      "c": 0
    },
    {
      "id": "PED-141",
      "q": "Un niño inconsciente no respira normalmente y no presenta signos de circulación. La primera prioridad es:",
      "ops": [
        "Iniciar reanimación cardiopulmonar",
        "Dar agua",
        "Esperar 10 minutos",
        "Administrar antibiótico oral"
      ],
      "c": 0
    },
    {
      "id": "PED-142",
      "q": "En una emergencia pediátrica, la evaluación inicial debe identificar rápidamente:",
      "ops": [
        "Problemas de vía aérea, respiración y circulación",
        "Solo temperatura",
        "Solo peso",
        "Solo antecedentes familiares"
      ],
      "c": 0
    },
    {
      "id": "PED-143",
      "q": "Un niño presenta anafilaxia con dificultad respiratoria, hipotensión y urticaria generalizada. El tratamiento de primera línea es:",
      "ops": [
        "Adrenalina intramuscular",
        "Antihistamínico oral como único tratamiento",
        "Paracetamol",
        "Amoxicilina"
      ],
      "c": 0
    },
    {
      "id": "PED-144",
      "q": "La vía recomendada para administrar adrenalina en anafilaxia pediátrica inicialmente es:",
      "ops": [
        "Intramuscular",
        "Intradérmica",
        "Oral",
        "Subcutánea exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "PED-145",
      "q": "Un niño con shock hipovolémico por deshidratación grave presenta:",
      "ops": [
        "Perfusión periférica alterada y alteración del estado general",
        "Hipertensión obligatoria",
        "Bradicardia siempre",
        "Edema pulmonar obligatorio"
      ],
      "c": 0
    },
    {
      "id": "PED-146",
      "q": "En un niño con shock, una prioridad es:",
      "ops": [
        "Restaurar perfusión y tratar la causa",
        "Esperar sin intervención",
        "Dar alimentos sólidos",
        "Administrar antidiarreicos"
      ],
      "c": 0
    },
    {
      "id": "PED-147",
      "q": "Un niño presenta convulsión activa prolongada. La prioridad inicial incluye:",
      "ops": [
        "Proteger vía aérea, evaluar respiración/circulación y tratar la crisis según protocolo",
        "Introducir objetos en la boca",
        "Sujetar violentamente las extremidades",
        "Dar líquidos por vía oral durante la convulsión"
      ],
      "c": 0
    },
    {
      "id": "PED-148",
      "q": "Durante una convulsión, está contraindicado:",
      "ops": [
        "Introducir objetos en la boca",
        "Proteger al paciente de traumatismos",
        "Controlar el tiempo de duración",
        "Evaluar la respiración"
      ],
      "c": 0
    },
    {
      "id": "PED-149",
      "q": "Un niño presenta intoxicación accidental por una sustancia desconocida. La conducta inicial apropiada es:",
      "ops": [
        "Evaluación ABC y determinar sustancia, cantidad y tiempo de exposición",
        "Inducir siempre el vómito",
        "Dar leche obligatoriamente",
        "Esperar a que aparezcan síntomas"
      ],
      "c": 0
    },
    {
      "id": "PED-150",
      "q": "Un niño politraumatizado llega a urgencias con dificultad respiratoria. ¿Cuál debe ser la prioridad?",
      "ops": [
        "Evaluación sistemática de vía aérea y respiración con protección cervical cuando corresponda",
        "Solicitar primero una radiografía de mano",
        "Dar alimentos",
        "Evaluar crecimiento"
      ],
      "c": 0
    }
  ],
  "medicina_interna": [
    {
      "id": "MI-151",
      "q": "Un paciente de 62 años consulta por dolor retroesternal opresivo de 40 minutos, irradiado a brazo izquierdo, acompañado de diaforesis. ¿Cuál es el diagnóstico que debe descartarse de forma prioritaria?",
      "ops": [
        "ERGE",
        "Síndrome coronario agudo",
        "Costocondritis",
        "Neumonía"
      ],
      "c": 1,
      "x": "El cuadro es altamente sugestivo de síndrome coronario agudo y requiere ECG y evaluación urgente."
    },
    {
      "id": "MI-152",
      "q": "En un paciente con sospecha de síndrome coronario agudo, ¿qué estudio debe realizarse de manera prioritaria?",
      "ops": [
        "Ecografía abdominal",
        "ECG de 12 derivaciones",
        "Colonoscopia",
        "Espirometría"
      ],
      "c": 1
    },
    {
      "id": "MI-153",
      "q": "¿Cuál es un biomarcador fundamental para el diagnóstico de infarto agudo de miocardio?",
      "ops": [
        "Troponina cardíaca",
        "Bilirrubina",
        "Amilasa",
        "Fosfatasa alcalina"
      ],
      "c": 0
    },
    {
      "id": "MI-154",
      "q": "Un paciente presenta elevación persistente del segmento ST en derivaciones II, III y aVF. ¿Qué territorio está afectado?",
      "ops": [
        "Anterior",
        "Inferior",
        "Lateral",
        "Septal exclusivamente"
      ],
      "c": 1
    },
    {
      "id": "MI-155",
      "q": "En un paciente con infarto con elevación del ST, la estrategia de reperfusión preferida cuando está disponible oportunamente es:",
      "ops": [
        "Esperar resolución espontánea",
        "Intervención coronaria percutánea primaria",
        "Antibióticos",
        "Diuréticos exclusivamente"
      ],
      "c": 1
    },
    {
      "id": "MI-156",
      "q": "Un paciente con insuficiencia cardíaca presenta disnea, ortopnea, edema periférico y crepitantes pulmonares. ¿Cuál es el síndrome predominante?",
      "ops": [
        "Congestión",
        "Hipoglucemia",
        "Hemorragia",
        "Deshidratación"
      ],
      "c": 0
    },
    {
      "id": "MI-157",
      "q": "¿Cuál de los siguientes es un síntoma clásico de insuficiencia cardíaca izquierda?",
      "ops": [
        "Ortopnea",
        "Hematuria",
        "Diarrea",
        "Ictericia aislada"
      ],
      "c": 0
    },
    {
      "id": "MI-158",
      "q": "La disnea paroxística nocturna se caracteriza por:",
      "ops": [
        "Disnea exclusivamente durante ejercicio intenso",
        "Despertar nocturno con sensación de falta de aire",
        "Dolor abdominal nocturno",
        "Tos únicamente durante la alimentación"
      ],
      "c": 1
    },
    {
      "id": "MI-159",
      "q": "¿Cuál de los siguientes hallazgos sugiere congestión sistémica?",
      "ops": [
        "Edema periférico",
        "Hemoptisis aislada",
        "Midriasis",
        "Hipoglucemia"
      ],
      "c": 0
    },
    {
      "id": "MI-160",
      "q": "Un paciente con insuficiencia cardíaca presenta hipotensión, piel fría, oliguria y alteración del estado mental. ¿Qué debe sospecharse?",
      "ops": [
        "Shock cardiogénico",
        "Crisis hipertensiva",
        "Hipoglucemia aislada",
        "Bronquitis"
      ],
      "c": 0
    },
    {
      "id": "MI-161",
      "q": "La fibrilación auricular se caracteriza electrocardiográficamente por:",
      "ops": [
        "Ritmo irregularmente irregular y ausencia de ondas P organizadas",
        "Ritmo regular con ondas P normales",
        "Elevación difusa del ST",
        "Ondas delta"
      ],
      "c": 0
    },
    {
      "id": "MI-162",
      "q": "Una complicación importante de la fibrilación auricular es:",
      "ops": [
        "Accidente cerebrovascular embólico",
        "Apendicitis",
        "Pancreatitis",
        "Hipotiroidismo"
      ],
      "c": 0
    },
    {
      "id": "MI-163",
      "q": "Un paciente presenta taquicardia de complejo estrecho, regular, a 190 lpm, con estabilidad hemodinámica. ¿Cuál es una medida inicial apropiada?",
      "ops": [
        "Maniobras vagales",
        "Desfibrilación inmediata en todos los casos",
        "Bicarbonato",
        "Atropina"
      ],
      "c": 0
    },
    {
      "id": "MI-164",
      "q": "Un paciente con taquicardia presenta hipotensión, alteración del estado mental y dolor torácico isquémico. La conducta indicada es:",
      "ops": [
        "Cardioversión sincronizada",
        "Observación",
        "Maniobras vagales únicamente",
        "Alta"
      ],
      "c": 0
    },
    {
      "id": "MI-165",
      "q": "La hipertensión arterial se define clínicamente mediante:",
      "ops": [
        "Una única medición aislada siempre",
        "Evaluación adecuada y mediciones repetidas cuando corresponda",
        "Solo síntomas",
        "Solo frecuencia cardíaca"
      ],
      "c": 1
    },
    {
      "id": "MI-166",
      "q": "¿Cuál es un factor de riesgo cardiovascular modificable?",
      "ops": [
        "Tabaquismo",
        "Edad",
        "Antecedente familiar",
        "Sexo biológico"
      ],
      "c": 0
    },
    {
      "id": "MI-167",
      "q": "En hipertensión arterial, una intervención no farmacológica fundamental es:",
      "ops": [
        "Reducción de sodio y medidas de estilo de vida",
        "Aumentar el consumo de alcohol",
        "Suspender ejercicio",
        "Aumentar grasas trans"
      ],
      "c": 0
    },
    {
      "id": "MI-168",
      "q": "Un paciente hipertenso presenta PA 220/130 mmHg y edema agudo de pulmón. ¿Qué situación representa?",
      "ops": [
        "Hipertensión sin repercusión",
        "Emergencia hipertensiva",
        "Hipotensión",
        "Hipertensión de bata blanca"
      ],
      "c": 1
    },
    {
      "id": "MI-169",
      "q": "La característica que diferencia principalmente una emergencia hipertensiva es:",
      "ops": [
        "Presión elevada sin síntomas",
        "Daño agudo de órgano diana",
        "Edad avanzada",
        "Cefalea aislada"
      ],
      "c": 1
    },
    {
      "id": "MI-170",
      "q": "En un paciente con dolor torácico súbito y déficit de pulsos entre extremidades debe sospecharse:",
      "ops": [
        "Disección aórtica",
        "Gastritis",
        "Asma",
        "Anemia"
      ],
      "c": 0
    },
    {
      "id": "MI-171",
      "q": "Un paciente presenta síncope durante ejercicio. ¿Qué etiología debe descartarse especialmente?",
      "ops": [
        "Cardiopatía estructural o arritmia potencialmente grave",
        "Gastroenteritis",
        "Dermatitis",
        "Rinitis"
      ],
      "c": 0
    },
    {
      "id": "MI-172",
      "q": "¿Cuál es un hallazgo clásico de estenosis aórtica grave?",
      "ops": [
        "Síncope de esfuerzo",
        "Diarrea",
        "Hematuria",
        "Tos productiva exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "MI-173",
      "q": "La endocarditis infecciosa debe sospecharse especialmente ante:",
      "ops": [
        "Fiebre persistente y factores predisponentes",
        "Diarrea aislada",
        "Cefalea ocasional",
        "Dolor lumbar mecánico"
      ],
      "c": 0
    },
    {
      "id": "MI-174",
      "q": "Una complicación de la endocarditis infecciosa puede ser:",
      "ops": [
        "Embolia sistémica",
        "Miopía",
        "Hipotiroidismo",
        "Apendicitis"
      ],
      "c": 0
    },
    {
      "id": "MI-175",
      "q": "Un paciente con pericarditis aguda típicamente presenta dolor:",
      "ops": [
        "Pleurítico que puede mejorar al inclinarse hacia adelante",
        "Exclusivamente después de comer",
        "Solo al caminar",
        "Exclusivamente en hipogastrio"
      ],
      "c": 0
    },
    {
      "id": "MI-176",
      "q": "Un paciente de 68 años, fumador de larga data, presenta tos crónica, expectoración y disnea progresiva. ¿Qué diagnóstico debe considerarse?",
      "ops": [
        "EPOC",
        "Neumotórax espontáneo exclusivamente",
        "Tuberculosis obligatoria",
        "Edema pulmonar"
      ],
      "c": 0
    },
    {
      "id": "MI-177",
      "q": "La prueba fundamental para confirmar obstrucción persistente del flujo aéreo en EPOC es:",
      "ops": [
        "Espirometría",
        "Ecografía abdominal",
        "ECG exclusivamente",
        "Hemograma"
      ],
      "c": 0
    },
    {
      "id": "MI-178",
      "q": "Un paciente con EPOC presenta aumento de disnea, volumen de esputo y purulencia. ¿Qué situación debe considerarse?",
      "ops": [
        "Exacerbación de EPOC",
        "Hipotiroidismo",
        "Síndrome nefrótico",
        "Pancreatitis"
      ],
      "c": 0
    },
    {
      "id": "MI-179",
      "q": "En una exacerbación de EPOC, un tratamiento broncodilatador inicial puede incluir:",
      "ops": [
        "Beta-2 agonista inhalado de acción corta",
        "Insulina",
        "Hierro",
        "Antidiarreicos"
      ],
      "c": 0
    },
    {
      "id": "MI-180",
      "q": "Un paciente con EPOC grave presenta somnolencia y retención de CO₂. ¿Qué trastorno debe considerarse?",
      "ops": [
        "Insuficiencia respiratoria hipercápnica",
        "Hipoglucemia exclusivamente",
        "Alcalosis metabólica aislada",
        "Anemia"
      ],
      "c": 0
    },
    {
      "id": "MI-181",
      "q": "La neumonía adquirida en la comunidad se caracteriza generalmente por:",
      "ops": [
        "Infección aguda del parénquima pulmonar",
        "Enfermedad exclusivamente vascular",
        "Enfermedad renal",
        "Inflamación hepática"
      ],
      "c": 0
    },
    {
      "id": "MI-182",
      "q": "Un paciente con neumonía presenta PA 82/50 mmHg, confusión y lactato elevado. ¿Qué debe sospecharse?",
      "ops": [
        "Sepsis/shock séptico",
        "Neumonía leve",
        "Rinitis",
        "Asma estable"
      ],
      "c": 0
    },
    {
      "id": "MI-183",
      "q": "¿Cuál de los siguientes puede ser una complicación de neumonía?",
      "ops": [
        "Derrame pleural",
        "Hipotiroidismo",
        "Catarata",
        "Osteoporosis"
      ],
      "c": 0
    },
    {
      "id": "MI-184",
      "q": "Un paciente presenta dolor torácico súbito y disnea después de un viaje prolongado. ¿Qué diagnóstico debe considerarse?",
      "ops": [
        "Tromboembolismo pulmonar",
        "Gastritis",
        "Sinusitis",
        "Hepatitis"
      ],
      "c": 0
    },
    {
      "id": "MI-185",
      "q": "Un factor de riesgo importante para tromboembolismo venoso es:",
      "ops": [
        "Inmovilización prolongada",
        "Ejercicio regular",
        "Hidratación adecuada",
        "Edad joven exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "MI-186",
      "q": "En sospecha de embolia pulmonar, la estrategia diagnóstica debe comenzar por:",
      "ops": [
        "Evaluación de probabilidad clínica",
        "Cirugía inmediata en todos",
        "Antibiótico",
        "Endoscopia"
      ],
      "c": 0
    },
    {
      "id": "MI-187",
      "q": "Un paciente presenta hemoptisis masiva. La prioridad inicial es:",
      "ops": [
        "Protección de vía aérea y estabilización hemodinámica",
        "Dar anticoagulantes inmediatamente",
        "Alta",
        "Antidiarreicos"
      ],
      "c": 0
    },
    {
      "id": "MI-188",
      "q": "Un derrame pleural corresponde a:",
      "ops": [
        "Acumulación anormal de líquido en el espacio pleural",
        "Líquido dentro del pericardio exclusivamente",
        "Aire dentro del estómago",
        "Sangre en el colon"
      ],
      "c": 0
    },
    {
      "id": "MI-189",
      "q": "Un paciente presenta disnea súbita, hipotensión, desviación traqueal y ausencia unilateral de murmullo vesicular. ¿Qué debe sospecharse?",
      "ops": [
        "Neumotórax a tensión",
        "Neumonía leve",
        "EPOC estable",
        "Asma leve"
      ],
      "c": 0
    },
    {
      "id": "MI-190",
      "q": "El neumotórax a tensión requiere:",
      "ops": [
        "Descompresión inmediata",
        "Observación durante 24 horas",
        "Antibiótico oral exclusivamente",
        "Corticoide inhalado exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "MI-191",
      "q": "En tuberculosis pulmonar activa, un síntoma frecuente es:",
      "ops": [
        "Tos persistente",
        "Dolor de tobillo aislado",
        "Diarrea aguda exclusivamente",
        "Prurito generalizado"
      ],
      "c": 0
    },
    {
      "id": "MI-192",
      "q": "Un factor epidemiológico importante para tuberculosis es:",
      "ops": [
        "Contacto estrecho con persona infectada",
        "Ejercicio",
        "Dieta vegetariana",
        "Hipertensión"
      ],
      "c": 0
    },
    {
      "id": "MI-193",
      "q": "En un paciente con hipoxemia, la saturación de oxígeno:",
      "ops": [
        "Permite valorar la oxigenación periférica",
        "Evalúa directamente la función renal",
        "Diagnostica anemia",
        "Sustituye siempre a la gasometría"
      ],
      "c": 0
    },
    {
      "id": "MI-194",
      "q": "La gasometría arterial permite valorar principalmente:",
      "ops": [
        "Oxigenación, ventilación y equilibrio ácido-base",
        "Función hepática exclusivamente",
        "Coagulación",
        "Hemoglobina glicosilada"
      ],
      "c": 0
    },
    {
      "id": "MI-195",
      "q": "Un paciente presenta pH 7,25, PaCO₂ 60 mmHg y HCO₃ 26 mEq/L. El trastorno predominante es:",
      "ops": [
        "Acidosis respiratoria",
        "Alcalosis respiratoria",
        "Acidosis metabólica",
        "Alcalosis metabólica"
      ],
      "c": 0
    },
    {
      "id": "MI-196",
      "q": "Un paciente presenta pH 7,28, HCO₃ 14 mEq/L y PaCO₂ 30 mmHg. El trastorno primario es:",
      "ops": [
        "Acidosis metabólica",
        "Acidosis respiratoria",
        "Alcalosis metabólica",
        "Alcalosis respiratoria"
      ],
      "c": 0
    },
    {
      "id": "MI-197",
      "q": "La fibrosis pulmonar idiopática pertenece al grupo de:",
      "ops": [
        "Enfermedades pulmonares intersticiales",
        "Enfermedades gastrointestinales",
        "Enfermedades hematológicas",
        "Enfermedades renales"
      ],
      "c": 0
    },
    {
      "id": "MI-198",
      "q": "La apnea obstructiva del sueño se relaciona con:",
      "ops": [
        "Episodios repetidos de obstrucción de la vía aérea superior durante el sueño",
        "Apendicitis",
        "Hipoglucemia exclusivamente",
        "Hemorragia digestiva"
      ],
      "c": 0
    },
    {
      "id": "MI-199",
      "q": "Un factor de riesgo importante para apnea obstructiva del sueño es:",
      "ops": [
        "Obesidad",
        "Bajo peso exclusivamente",
        "Hipotensión",
        "Anemia leve"
      ],
      "c": 0
    },
    {
      "id": "MI-200",
      "q": "En un paciente con disnea de causa desconocida, el diagnóstico diferencial debe incluir:",
      "ops": [
        "Enfermedades cardíacas y pulmonares",
        "Solo enfermedades digestivas",
        "Solo enfermedades dermatológicas",
        "Solo enfermedades musculares"
      ],
      "c": 0
    },
    {
      "id": "MI-201",
      "q": "La diabetes mellitus tipo 2 se caracteriza principalmente por:",
      "ops": [
        "Resistencia a la insulina y deterioro progresivo de secreción de insulina",
        "Ausencia congénita de glucagón",
        "Déficit de cortisol",
        "Exceso de hormona tiroidea"
      ],
      "c": 0
    },
    {
      "id": "MI-202",
      "q": "Un paciente con poliuria, polidipsia y pérdida de peso presenta glucemia marcadamente elevada. ¿Qué diagnóstico debe considerarse?",
      "ops": [
        "Diabetes mellitus",
        "Hipotiroidismo",
        "Anemia",
        "Hiponatremia"
      ],
      "c": 0
    },
    {
      "id": "MI-203",
      "q": "Una complicación microvascular de diabetes mellitus es:",
      "ops": [
        "Retinopatía diabética",
        "Infarto exclusivamente",
        "Embolia pulmonar",
        "Apendicitis"
      ],
      "c": 0
    },
    {
      "id": "MI-204",
      "q": "Una complicación macrovascular de diabetes es:",
      "ops": [
        "Enfermedad coronaria",
        "Catarata exclusivamente",
        "Neuropatía periférica exclusivamente",
        "Retinopatía exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "MI-205",
      "q": "Un paciente diabético presenta glucemia 480 mg/dL, cetonas positivas y acidosis metabólica. ¿Cuál es el diagnóstico?",
      "ops": [
        "Cetoacidosis diabética",
        "Hipoglucemia",
        "Síndrome nefrótico",
        "Hipotiroidismo"
      ],
      "c": 0
    },
    {
      "id": "MI-206",
      "q": "El estado hiperosmolar hiperglucémico suele caracterizarse por:",
      "ops": [
        "Hiperglucemia muy marcada y elevada osmolaridad, con cetosis menos prominente",
        "Hipoglucemia",
        "Hipocalcemia aislada",
        "Acidosis láctica obligatoria"
      ],
      "c": 0
    },
    {
      "id": "MI-207",
      "q": "Un paciente diabético está sudoroso, tembloroso y confuso. Glucemia: 48 mg/dL. ¿Diagnóstico?",
      "ops": [
        "Hipoglucemia",
        "Hiperglucemia",
        "Cetoacidosis",
        "Hipercalcemia"
      ],
      "c": 0
    },
    {
      "id": "MI-208",
      "q": "En un paciente consciente con hipoglucemia leve/moderada, la intervención inicial suele ser:",
      "ops": [
        "Administrar carbohidrato de acción rápida",
        "Insulina",
        "Metformina",
        "Restricción de alimentos"
      ],
      "c": 0
    },
    {
      "id": "MI-209",
      "q": "La hemoglobina glucosilada refleja aproximadamente:",
      "ops": [
        "Control glucémico de los últimos meses",
        "Glucemia de los últimos 10 minutos",
        "Función renal",
        "Presión arterial"
      ],
      "c": 0
    },
    {
      "id": "MI-210",
      "q": "La obesidad abdominal se relaciona con:",
      "ops": [
        "Resistencia a la insulina",
        "Menor riesgo cardiovascular",
        "Hipoglucemia permanente",
        "Menor riesgo metabólico"
      ],
      "c": 0
    },
    {
      "id": "MI-211",
      "q": "Un paciente presenta pérdida de peso, intolerancia al calor, temblor y taquicardia. ¿Qué trastorno debe sospecharse?",
      "ops": [
        "Hipertiroidismo",
        "Hipotiroidismo",
        "Insuficiencia suprarrenal",
        "Hipoparatiroidismo"
      ],
      "c": 0
    },
    {
      "id": "MI-212",
      "q": "En hipotiroidismo primario, típicamente se encuentra:",
      "ops": [
        "TSH elevada y T4 libre disminuida",
        "TSH disminuida y T4 elevada",
        "TSH y T4 siempre elevadas",
        "TSH normal obligatoriamente"
      ],
      "c": 0
    },
    {
      "id": "MI-213",
      "q": "Un paciente presenta fatiga, aumento de peso, intolerancia al frío y estreñimiento. ¿Cuál es el diagnóstico más probable?",
      "ops": [
        "Hipotiroidismo",
        "Hipertiroidismo",
        "Feocromocitoma",
        "Diabetes insípida"
      ],
      "c": 0
    },
    {
      "id": "MI-214",
      "q": "La crisis tiroidea se caracteriza por:",
      "ops": [
        "Manifestaciones sistémicas graves de tirotoxicosis",
        "Hipoglucemia aislada",
        "Hipotiroidismo leve",
        "Hipocalcemia exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "MI-215",
      "q": "La insuficiencia suprarrenal primaria puede producir:",
      "ops": [
        "Hipotensión e hiperpigmentación",
        "Hipertensión obligatoria",
        "Hiperglucemia persistente",
        "Hipercalcemia siempre"
      ],
      "c": 0
    },
    {
      "id": "MI-216",
      "q": "Una crisis suprarrenal puede manifestarse con:",
      "ops": [
        "Hipotensión, alteraciones electrolíticas y deterioro sistémico",
        "Hipertensión aislada",
        "Obesidad aislada",
        "Bradicardia fisiológica"
      ],
      "c": 0
    },
    {
      "id": "MI-217",
      "q": "El síndrome de Cushing se caracteriza por:",
      "ops": [
        "Exceso de glucocorticoides",
        "Déficit de cortisol",
        "Déficit de insulina",
        "Exceso de hormona tiroidea exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "MI-218",
      "q": "Una manifestación del síndrome de Cushing puede ser:",
      "ops": [
        "Obesidad central",
        "Hipoglucemia persistente",
        "Hipotensión extrema obligatoria",
        "Pérdida marcada de masa grasa facial"
      ],
      "c": 0
    },
    {
      "id": "MI-219",
      "q": "La hipercalcemia puede producir:",
      "ops": [
        "Poliuria, estreñimiento y alteraciones neurológicas",
        "Solo tos",
        "Solo hemoptisis",
        "Estridor"
      ],
      "c": 0
    },
    {
      "id": "MI-220",
      "q": "Una causa frecuente de hipercalcemia en adultos hospitalizados es:",
      "ops": [
        "Malignidad",
        "Resfriado común",
        "Otitis",
        "Gastroenteritis viral exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "MI-221",
      "q": "La hiponatremia severa puede producir:",
      "ops": [
        "Convulsiones y alteración del estado mental",
        "Solo tos",
        "Ictericia",
        "Exantema"
      ],
      "c": 0
    },
    {
      "id": "MI-222",
      "q": "La hiperkalemia grave puede producir:",
      "ops": [
        "Arritmias potencialmente mortales",
        "Solo diarrea",
        "Tos",
        "Dermatitis"
      ],
      "c": 0
    },
    {
      "id": "MI-223",
      "q": "En hiperkalemia grave con cambios electrocardiográficos, una medida inmediata para estabilizar membrana cardíaca es:",
      "ops": [
        "Calcio intravenoso",
        "Hierro oral",
        "Vitamina C",
        "Paracetamol"
      ],
      "c": 0
    },
    {
      "id": "MI-224",
      "q": "Un paciente presenta debilidad muscular y ECG con ondas T picudas. Debe sospecharse:",
      "ops": [
        "Hiperkalemia",
        "Hipocalcemia",
        "Hipoglucemia",
        "Hipernatremia"
      ],
      "c": 0
    },
    {
      "id": "MI-225",
      "q": "La hipomagnesemia puede favorecer:",
      "ops": [
        "Arritmias cardíacas",
        "Apendicitis",
        "Neumonía bacteriana directamente",
        "Hepatitis"
      ],
      "c": 0
    },
    {
      "id": "MI-226",
      "q": "La lesión renal aguda se caracteriza por:",
      "ops": [
        "Deterioro agudo de la función renal",
        "Pérdida renal exclusivamente congénita",
        "Hipertensión aislada",
        "Proteinuria siempre masiva"
      ],
      "c": 0
    },
    {
      "id": "MI-227",
      "q": "Un paciente con vómitos prolongados desarrolla hipotensión y aumento de creatinina. ¿Qué causa de lesión renal aguda debe considerarse?",
      "ops": [
        "Hipoperfusión renal/prerrenal",
        "Glomerulonefritis obligatoria",
        "Obstrucción ureteral bilateral obligatoria",
        "Diabetes tipo 1"
      ],
      "c": 0
    },
    {
      "id": "MI-228",
      "q": "Una causa posrenal de lesión renal aguda es:",
      "ops": [
        "Obstrucción urinaria",
        "Deshidratación",
        "Sepsis exclusivamente",
        "Hemorragia digestiva"
      ],
      "c": 0
    },
    {
      "id": "MI-229",
      "q": "En lesión renal aguda es fundamental controlar:",
      "ops": [
        "Diuresis y función renal",
        "Solo temperatura",
        "Solo frecuencia cardíaca",
        "Solo peso una vez"
      ],
      "c": 0
    },
    {
      "id": "MI-230",
      "q": "La enfermedad renal crónica se define por:",
      "ops": [
        "Alteraciones estructurales o funcionales renales persistentes durante al menos 3 meses",
        "Cualquier aumento aislado de creatinina",
        "Hematuria de un día",
        "Hipertensión de una semana"
      ],
      "c": 0
    },
    {
      "id": "MI-231",
      "q": "Un marcador importante de daño renal es:",
      "ops": [
        "Albuminuria",
        "Bilirrubina",
        "Troponina exclusivamente",
        "Amilasa"
      ],
      "c": 0
    },
    {
      "id": "MI-232",
      "q": "La diabetes mellitus es una causa importante de:",
      "ops": [
        "Enfermedad renal crónica",
        "Apendicitis",
        "Asma",
        "Tuberculosis exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "MI-233",
      "q": "La hipertensión arterial puede ser:",
      "ops": [
        "Causa y consecuencia de enfermedad renal crónica",
        "Nunca relacionada con enfermedad renal",
        "Exclusivamente consecuencia de anemia",
        "Solo una enfermedad cardíaca"
      ],
      "c": 0
    },
    {
      "id": "MI-234",
      "q": "Un paciente con enfermedad renal avanzada presenta náuseas, prurito y alteraciones metabólicas. ¿Qué síndrome debe considerarse?",
      "ops": [
        "Uremia",
        "Hipertiroidismo",
        "Cetoacidosis",
        "Anafilaxia"
      ],
      "c": 0
    },
    {
      "id": "MI-235",
      "q": "Una indicación urgente de terapia de reemplazo renal puede ser:",
      "ops": [
        "Hiperkalemia grave refractaria",
        "Anemia leve",
        "Hipertensión controlada",
        "Cefalea ocasional"
      ],
      "c": 0
    },
    {
      "id": "MI-236",
      "q": "En un paciente con enfermedad renal crónica, el metabolismo mineral puede alterarse produciendo:",
      "ops": [
        "Trastorno calcio-fósforo y alteraciones de PTH",
        "Solo hipoglucemia",
        "Solo hipernatremia",
        "Solo hiperbilirrubinemia"
      ],
      "c": 0
    },
    {
      "id": "MI-237",
      "q": "Un paciente presenta proteinuria masiva, hipoalbuminemia y edema. ¿Qué síndrome debe considerarse?",
      "ops": [
        "Síndrome nefrótico",
        "Síndrome nefrítico",
        "Insuficiencia suprarrenal",
        "Hipertiroidismo"
      ],
      "c": 0
    },
    {
      "id": "MI-238",
      "q": "La hematuria glomerular puede asociarse con:",
      "ops": [
        "Eritrocitos dismórficos y cilindros hemáticos",
        "Cristales de glucosa exclusivamente",
        "Bilirrubina aislada",
        "Leucocitos exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "MI-239",
      "q": "Un paciente con edema, hipertensión y hematuria después de una infección debe evaluarse para:",
      "ops": [
        "Glomerulonefritis",
        "Asma",
        "EPOC",
        "Pancreatitis"
      ],
      "c": 0
    },
    {
      "id": "MI-240",
      "q": "La nefropatía por IgA suele asociarse temporalmente con:",
      "ops": [
        "Hematuria cercana a episodios infecciosos de mucosas",
        "Hematuria exclusivamente años después",
        "Hipoglucemia",
        "Ictericia"
      ],
      "c": 0
    },
    {
      "id": "MI-241",
      "q": "La hiperpotasemia es especialmente peligrosa porque puede producir:",
      "ops": [
        "Arritmias",
        "Cataratas",
        "Gastritis",
        "Neumonía"
      ],
      "c": 0
    },
    {
      "id": "MI-242",
      "q": "En una hiperkalemia grave, el ECG puede mostrar:",
      "ops": [
        "Ondas T picudas",
        "Siempre elevación del ST difusa",
        "Ondas P gigantes",
        "Ritmo sinusal normal obligatoriamente"
      ],
      "c": 0
    },
    {
      "id": "MI-243",
      "q": "La hiponatremia grave debe corregirse cuidadosamente porque:",
      "ops": [
        "Una corrección excesivamente rápida puede producir lesión neurológica osmótica",
        "Siempre produce insuficiencia hepática",
        "Nunca tiene consecuencias",
        "Produce apendicitis"
      ],
      "c": 0
    },
    {
      "id": "MI-244",
      "q": "Un paciente con ERC presenta anemia normocítica. Una causa importante es:",
      "ops": [
        "Déficit relativo de eritropoyetina",
        "Exceso de vitamina B12",
        "Hipertiroidismo",
        "Hemólisis obligatoria"
      ],
      "c": 0
    },
    {
      "id": "MI-245",
      "q": "Una medida fundamental para ralentizar la progresión de ERC es:",
      "ops": [
        "Control adecuado de presión arterial y factores de riesgo",
        "Aumentar tabaco",
        "Suspender todos los controles",
        "Evitar tratamiento de diabetes"
      ],
      "c": 0
    },
    {
      "id": "MI-246",
      "q": "Un paciente presenta dolor epigástrico, náuseas y lipasa elevada más de tres veces el límite superior. ¿Cuál es el diagnóstico?",
      "ops": [
        "Pancreatitis aguda",
        "Hepatitis",
        "Apendicitis",
        "Colitis"
      ],
      "c": 0
    },
    {
      "id": "MI-247",
      "q": "Una causa frecuente de pancreatitis aguda es:",
      "ops": [
        "Litiasis biliar",
        "Hipotiroidismo",
        "Asma",
        "Anemia"
      ],
      "c": 0
    },
    {
      "id": "MI-248",
      "q": "El dolor típico de pancreatitis puede irradiarse hacia:",
      "ops": [
        "Espalda",
        "Mano derecha exclusivamente",
        "Rodilla",
        "Cuello exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "MI-249",
      "q": "Un paciente presenta dolor en hipocondrio derecho, fiebre y leucocitosis. ¿Qué diagnóstico debe considerarse?",
      "ops": [
        "Colecistitis aguda",
        "Gastritis simple",
        "Asma",
        "Cistitis"
      ],
      "c": 0
    },
    {
      "id": "MI-250",
      "q": "La colecistitis aguda se asocia frecuentemente con:",
      "ops": [
        "Cálculos biliares",
        "Hipotiroidismo",
        "Diabetes insípida",
        "Tuberculosis exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "MI-251",
      "q": "Fiebre, dolor en hipocondrio derecho e ictericia constituyen clásicamente:",
      "ops": [
        "Tríada de Charcot",
        "Tríada de Virchow",
        "Tríada de Cushing",
        "Tríada de Beck"
      ],
      "c": 0
    },
    {
      "id": "MI-252",
      "q": "La tríada de Charcot sugiere:",
      "ops": [
        "Colangitis aguda",
        "Apendicitis",
        "Pancreatitis autoinmune",
        "Hepatitis crónica"
      ],
      "c": 0
    },
    {
      "id": "MI-253",
      "q": "La colangitis aguda puede complicarse con:",
      "ops": [
        "Sepsis",
        "Asma",
        "Hipotiroidismo",
        "Osteoporosis"
      ],
      "c": 0
    },
    {
      "id": "MI-254",
      "q": "Un paciente presenta hematemesis y melena. ¿Cuál es el diagnóstico sindrómico?",
      "ops": [
        "Hemorragia digestiva alta",
        "Hemorragia urinaria",
        "Hemoptisis",
        "Epistaxis"
      ],
      "c": 0
    },
    {
      "id": "MI-255",
      "q": "En hemorragia digestiva importante, la prioridad inicial es:",
      "ops": [
        "Estabilización hemodinámica",
        "Colonoscopia antes de valorar ABC",
        "Alta",
        "Antidiarreicos"
      ],
      "c": 0
    },
    {
      "id": "MI-256",
      "q": "Una causa frecuente de hemorragia digestiva alta es:",
      "ops": [
        "Úlcera péptica",
        "Apendicitis",
        "Diverticulitis exclusivamente",
        "Hemorroides"
      ],
      "c": 0
    },
    {
      "id": "MI-257",
      "q": "La melena corresponde a:",
      "ops": [
        "Heces negras, alquitranadas, por sangre digerida",
        "Sangre roja brillante exclusivamente",
        "Sangre en orina",
        "Vómito sanguinolento"
      ],
      "c": 0
    },
    {
      "id": "MI-258",
      "q": "Un paciente con cirrosis presenta ascitis y edema. Una complicación que debe descartarse ante dolor y fiebre es:",
      "ops": [
        "Peritonitis bacteriana espontánea",
        "Apendicitis obligatoria",
        "Neumotórax",
        "Meningitis"
      ],
      "c": 0
    },
    {
      "id": "MI-259",
      "q": "La hipertensión portal puede producir:",
      "ops": [
        "Várices esofágicas",
        "Asma",
        "Hipotiroidismo",
        "Neumonía"
      ],
      "c": 0
    },
    {
      "id": "MI-260",
      "q": "Un paciente con cirrosis presenta hematemesis masiva. Debe sospecharse:",
      "ops": [
        "Sangrado por várices esofagogástricas",
        "Cistitis",
        "Bronquiolitis",
        "Otitis"
      ],
      "c": 0
    },
    {
      "id": "MI-261",
      "q": "La encefalopatía hepática puede manifestarse con:",
      "ops": [
        "Alteración del estado mental y asterixis",
        "Solo fiebre",
        "Solo tos",
        "Solo hematuria"
      ],
      "c": 0
    },
    {
      "id": "MI-262",
      "q": "La enfermedad hepática crónica puede producir:",
      "ops": [
        "Coagulopatía",
        "Hipertensión portal",
        "Ascitis",
        "Todas las anteriores"
      ],
      "c": 3
    },
    {
      "id": "MI-263",
      "q": "Un paciente presenta diarrea crónica, pérdida de peso y anemia. Debe considerarse:",
      "ops": [
        "Enfermedad inflamatoria intestinal o malabsorción, entre otros diagnósticos",
        "Solo gastroenteritis viral",
        "Solo apendicitis",
        "Solo asma"
      ],
      "c": 0
    },
    {
      "id": "MI-264",
      "q": "La enfermedad de Crohn puede afectar:",
      "ops": [
        "Cualquier segmento del tracto gastrointestinal",
        "Solo recto",
        "Solo estómago",
        "Solo esófago"
      ],
      "c": 0
    },
    {
      "id": "MI-265",
      "q": "La colitis ulcerosa afecta principalmente:",
      "ops": [
        "Colon y recto",
        "Estómago exclusivamente",
        "Esófago exclusivamente",
        "Intestino delgado exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "MI-266",
      "q": "Un paciente con fiebre, hipotensión, taquicardia y lactato elevado presenta una infección sospechada. ¿Qué síndrome debe considerarse?",
      "ops": [
        "Sepsis con posible shock séptico",
        "Hipotiroidismo",
        "EPOC estable",
        "Gastritis"
      ],
      "c": 0
    },
    {
      "id": "MI-267",
      "q": "En sepsis, una prioridad fundamental es:",
      "ops": [
        "Reconocimiento precoz y tratamiento oportuno",
        "Esperar varios días",
        "Evitar cultivos siempre",
        "No monitorizar perfusión"
      ],
      "c": 0
    },
    {
      "id": "MI-268",
      "q": "Un paciente con fiebre, tos, sudoración nocturna y pérdida de peso durante meses debe evaluarse para:",
      "ops": [
        "Tuberculosis",
        "Gastroenteritis",
        "Hipotiroidismo",
        "Apendicitis"
      ],
      "c": 0
    },
    {
      "id": "MI-269",
      "q": "En VIH avanzado, aumenta el riesgo de:",
      "ops": [
        "Infecciones oportunistas",
        "Hipertensión exclusivamente",
        "Apendicitis únicamente",
        "Osteoartritis exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "MI-270",
      "q": "Un paciente con VIH debe recibir:",
      "ops": [
        "Seguimiento y tratamiento antirretroviral según indicación",
        "Antibióticos permanentes independientemente del cuadro",
        "Ningún control",
        "Solo vitaminas"
      ],
      "c": 0
    },
    {
      "id": "MI-271",
      "q": "La malaria debe sospecharse especialmente en:",
      "ops": [
        "Personas con exposición epidemiológica compatible y fiebre",
        "Todo paciente con hipertensión",
        "Todo paciente con tos",
        "Todo paciente con gastritis"
      ],
      "c": 0
    },
    {
      "id": "MI-272",
      "q": "Dengue puede presentar:",
      "ops": [
        "Fiebre, cefalea intensa, mialgias y signos de alarma en casos graves",
        "Solo tos",
        "Solo hematuria",
        "Solo ictericia"
      ],
      "c": 0
    },
    {
      "id": "MI-273",
      "q": "Un signo de alarma en dengue puede ser:",
      "ops": [
        "Dolor abdominal intenso y persistente",
        "Apetito aumentado",
        "Tos leve",
        "Rinorrea aislada"
      ],
      "c": 0
    },
    {
      "id": "MI-274",
      "q": "En dengue con riesgo hemorrágico, debe evitarse especialmente el uso innecesario de:",
      "ops": [
        "AINEs",
        "Paracetamol",
        "Soluciones de rehidratación",
        "Oxígeno cuando esté indicado"
      ],
      "c": 0
    },
    {
      "id": "MI-275",
      "q": "Una infección urinaria alta puede manifestarse con:",
      "ops": [
        "Fiebre y dolor lumbar",
        "Tos",
        "Hemoptisis",
        "Ictericia"
      ],
      "c": 0
    },
    {
      "id": "MI-276",
      "q": "La pielonefritis afecta principalmente:",
      "ops": [
        "Parénquima renal",
        "Colon",
        "Pulmón",
        "Hígado"
      ],
      "c": 0
    },
    {
      "id": "MI-277",
      "q": "Un paciente presenta fiebre, soplo cardíaco nuevo y hemocultivos positivos. Debe considerarse:",
      "ops": [
        "Endocarditis infecciosa",
        "Asma",
        "Pancreatitis",
        "Hipotiroidismo"
      ],
      "c": 0
    },
    {
      "id": "MI-278",
      "q": "La infección por Clostridioides difficile se asocia frecuentemente con:",
      "ops": [
        "Uso previo de antibióticos",
        "Ejercicio",
        "Hipertensión",
        "Hipotiroidismo"
      ],
      "c": 0
    },
    {
      "id": "MI-279",
      "q": "Un paciente hospitalizado desarrolla diarrea acuosa después de recibir antibióticos. ¿Qué diagnóstico debe considerarse?",
      "ops": [
        "Infección por C. difficile",
        "Apendicitis",
        "Pancreatitis obligatoria",
        "Hepatitis"
      ],
      "c": 0
    },
    {
      "id": "MI-280",
      "q": "En prevención de infecciones hospitalarias, una medida esencial es:",
      "ops": [
        "Higiene adecuada de manos",
        "Uso indiscriminado de antibióticos",
        "Evitar vacunación",
        "No utilizar equipos de protección"
      ],
      "c": 0
    },
    {
      "id": "MI-281",
      "q": "Un paciente presenta déficit motor súbito de hemicuerpo derecho y dificultad para hablar. ¿Qué diagnóstico debe sospecharse?",
      "ops": [
        "Accidente cerebrovascular",
        "Migraña simple obligatoria",
        "Gastritis",
        "Neumonía"
      ],
      "c": 0
    },
    {
      "id": "MI-282",
      "q": "Ante sospecha de ACV agudo, es fundamental determinar:",
      "ops": [
        "Hora de inicio o última vez conocido bien",
        "Grupo sanguíneo únicamente",
        "Peso hace 10 años",
        "Antecedente de gastritis"
      ],
      "c": 0
    },
    {
      "id": "MI-283",
      "q": "La fibrilación auricular aumenta el riesgo de:",
      "ops": [
        "ACV isquémico embólico",
        "Apendicitis",
        "Hepatitis",
        "Neumonía"
      ],
      "c": 0
    },
    {
      "id": "MI-284",
      "q": "Un paciente presenta cefalea súbita, máxima desde el inicio, descrita como “la peor de su vida”. ¿Qué debe sospecharse?",
      "ops": [
        "Hemorragia subaracnoidea",
        "Cefalea tensional obligatoria",
        "Gastritis",
        "Sinusitis simple"
      ],
      "c": 0
    },
    {
      "id": "MI-285",
      "q": "La meningitis puede producir:",
      "ops": [
        "Fiebre, cefalea y rigidez de nuca",
        "Solo diarrea",
        "Solo hipertensión",
        "Solo edema periférico"
      ],
      "c": 0
    },
    {
      "id": "MI-286",
      "q": "Una crisis epiléptica prolongada puede evolucionar a:",
      "ops": [
        "Estado epiléptico",
        "Hipotiroidismo",
        "EPOC",
        "Cirrosis"
      ],
      "c": 0
    },
    {
      "id": "MI-287",
      "q": "En una convulsión activa, la prioridad inicial incluye:",
      "ops": [
        "Seguridad, vía aérea, respiración y circulación",
        "Introducir objetos en la boca",
        "Dar líquidos por vía oral",
        "Sujetar violentamente al paciente"
      ],
      "c": 0
    },
    {
      "id": "MI-288",
      "q": "La enfermedad de Parkinson se caracteriza por:",
      "ops": [
        "Bradicinesia, rigidez y temblor de reposo entre sus manifestaciones clásicas",
        "Diarrea",
        "Hemoptisis",
        "Ictericia"
      ],
      "c": 0
    },
    {
      "id": "MI-289",
      "q": "Una causa frecuente de neuropatía periférica es:",
      "ops": [
        "Diabetes mellitus",
        "Rinitis",
        "Gastritis",
        "Hipertensión leve exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "MI-290",
      "q": "La miastenia gravis se caracteriza por:",
      "ops": [
        "Debilidad muscular fatigable",
        "Hipertonía permanente",
        "Hematuria",
        "Ictericia"
      ],
      "c": 0
    },
    {
      "id": "MI-291",
      "q": "Una anemia microcítica e hipocrómica con ferritina baja sugiere:",
      "ops": [
        "Deficiencia de hierro",
        "Déficit de B12",
        "Hemólisis aguda",
        "Aplasia medular"
      ],
      "c": 0
    },
    {
      "id": "MI-292",
      "q": "La anemia por déficit de vitamina B12 suele ser:",
      "ops": [
        "Macrocítica",
        "Microcítica",
        "Normocítica siempre",
        "Polictémica"
      ],
      "c": 0
    },
    {
      "id": "MI-293",
      "q": "Un paciente presenta trombocitopenia severa y sangrado mucocutáneo. ¿Qué debe evaluarse?",
      "ops": [
        "Trastorno plaquetario",
        "Asma",
        "Hipotiroidismo exclusivamente",
        "Gastritis"
      ],
      "c": 0
    },
    {
      "id": "MI-294",
      "q": "La leucemia aguda puede manifestarse con:",
      "ops": [
        "Anemia, infecciones y sangrado",
        "Solo hipertensión",
        "Solo diarrea",
        "Solo tos"
      ],
      "c": 0
    },
    {
      "id": "MI-295",
      "q": "Un paciente presenta dolor articular simétrico de pequeñas articulaciones, rigidez matutina prolongada y tumefacción. ¿Qué enfermedad debe considerarse?",
      "ops": [
        "Artritis reumatoide",
        "Osteoartritis exclusivamente",
        "Gota exclusivamente",
        "Fibromialgia obligatoria"
      ],
      "c": 0
    },
    {
      "id": "MI-296",
      "q": "La artritis reumatoide es una enfermedad:",
      "ops": [
        "Inflamatoria autoinmune sistémica",
        "Exclusivamente infecciosa",
        "Exclusivamente traumática",
        "Exclusivamente degenerativa"
      ],
      "c": 0
    },
    {
      "id": "MI-297",
      "q": "Un paciente presenta dolor intenso y súbito en la primera articulación metatarsofalángica, con eritema y edema. ¿Qué diagnóstico debe sospecharse?",
      "ops": [
        "Gota",
        "Artritis reumatoide",
        "Osteoporosis",
        "Artrosis cervical"
      ],
      "c": 0
    },
    {
      "id": "MI-298",
      "q": "La gota se relaciona con:",
      "ops": [
        "Depósito de cristales de urato monosódico",
        "Déficit de hierro",
        "Exceso de vitamina B12",
        "Depósito de glucosa"
      ],
      "c": 0
    },
    {
      "id": "MI-299",
      "q": "El lupus eritematoso sistémico puede afectar:",
      "ops": [
        "Múltiples órganos y sistemas",
        "Solo piel",
        "Solo articulaciones",
        "Solo riñones"
      ],
      "c": 0
    },
    {
      "id": "MI-300",
      "q": "Un paciente con lupus presenta proteinuria, hematuria y deterioro de función renal. Debe sospecharse:",
      "ops": [
        "Nefritis lúpica",
        "Cistitis simple",
        "Asma",
        "Gastritis"
      ],
      "c": 0
    }
  ],
  "ginecologia": [
    {
      "id": "GO-301",
      "q": "Una mujer de 24 años consulta por flujo vaginal homogéneo, grisáceo y con olor a pescado. El pH vaginal es 5,5 y se observan células guía. ¿Cuál es el diagnóstico?",
      "ops": [
        "Candidiasis vulvovaginal",
        "Vaginosis bacteriana",
        "Tricomoniasis",
        "Gonorrea"
      ],
      "c": 1
    },
    {
      "id": "GO-302",
      "q": "¿Cuál de los siguientes hallazgos es característico de la vaginosis bacteriana?",
      "ops": [
        "Pseudohifas",
        "Células guía",
        "Vesículas genitales",
        "Úlceras dolorosas"
      ],
      "c": 1
    },
    {
      "id": "GO-303",
      "q": "Una paciente presenta prurito vulvar intenso, eritema y flujo blanco grumoso. El pH vaginal es normal. ¿Cuál es el diagnóstico más probable?",
      "ops": [
        "Vaginosis bacteriana",
        "Candidiasis vulvovaginal",
        "Tricomoniasis",
        "Enfermedad inflamatoria pélvica"
      ],
      "c": 1
    },
    {
      "id": "GO-304",
      "q": "¿Cuál es el microorganismo más frecuentemente asociado a candidiasis vulvovaginal?",
      "ops": [
        "Candida albicans",
        "Gardnerella vaginalis",
        "Trichomonas vaginalis",
        "Neisseria gonorrhoeae"
      ],
      "c": 0
    },
    {
      "id": "GO-305",
      "q": "Una mujer presenta flujo vaginal amarillo-verdoso, espumoso, mal olor y prurito. ¿Qué diagnóstico debe sospecharse?",
      "ops": [
        "Candidiasis",
        "Tricomoniasis",
        "Vaginosis bacteriana",
        "Endometriosis"
      ],
      "c": 1
    },
    {
      "id": "GO-306",
      "q": "La tricomoniasis es causada por:",
      "ops": [
        "Un hongo",
        "Un protozoo",
        "Una bacteria grampositiva",
        "Un virus"
      ],
      "c": 1
    },
    {
      "id": "GO-307",
      "q": "Una paciente con infección por Trichomonas vaginalis debe recibir además:",
      "ops": [
        "Tratamiento exclusivo de la pareja",
        "Tratamiento de las parejas sexuales según indicación",
        "Solo antifúngicos",
        "Ningún tratamiento"
      ],
      "c": 1
    },
    {
      "id": "GO-308",
      "q": "La enfermedad inflamatoria pélvica puede comprometer principalmente:",
      "ops": [
        "Útero, trompas y estructuras pélvicas superiores",
        "Solo vulva",
        "Solo vagina",
        "Solo cuello uterino"
      ],
      "c": 0
    },
    {
      "id": "GO-309",
      "q": "Una mujer sexualmente activa presenta dolor pélvico bilateral, fiebre y dolor a la movilización cervical. ¿Cuál es el diagnóstico más probable?",
      "ops": [
        "Enfermedad inflamatoria pélvica",
        "Cistitis simple",
        "Vulvovaginitis",
        "Endometriosis obligatoriamente"
      ],
      "c": 0
    },
    {
      "id": "GO-310",
      "q": "Una complicación importante de la enfermedad inflamatoria pélvica es:",
      "ops": [
        "Infertilidad tubárica",
        "Hipotiroidismo",
        "Diabetes mellitus",
        "Miopía"
      ],
      "c": 0
    },
    {
      "id": "GO-311",
      "q": "Una paciente presenta dolor pélvico crónico que aumenta durante la menstruación y dispareunia profunda. ¿Qué enfermedad debe sospecharse?",
      "ops": [
        "Endometriosis",
        "Vaginosis bacteriana",
        "Candidiasis",
        "Cervicitis"
      ],
      "c": 0
    },
    {
      "id": "GO-312",
      "q": "La endometriosis consiste en:",
      "ops": [
        "Presencia de tejido similar al endometrio fuera de la cavidad uterina",
        "Ausencia completa de endometrio",
        "Infección del endometrio",
        "Cáncer obligatorio del útero"
      ],
      "c": 0
    },
    {
      "id": "GO-313",
      "q": "Una manifestación frecuente de endometriosis es:",
      "ops": [
        "Dismenorrea secundaria",
        "Amenorrea fisiológica permanente",
        "Fiebre alta obligatoria",
        "Hipertensión"
      ],
      "c": 0
    },
    {
      "id": "GO-314",
      "q": "Una mujer presenta menstruaciones muy abundantes y dolorosas. ¿Qué término describe específicamente el sangrado menstrual excesivo?",
      "ops": [
        "Amenorrea",
        "Sangrado menstrual abundante",
        "Oligomenorrea",
        "Metrorragia posmenopáusica"
      ],
      "c": 1
    },
    {
      "id": "GO-315",
      "q": "Una mujer de 47 años presenta menstruaciones irregulares, sofocos y alteraciones del sueño. ¿Qué etapa debe considerarse?",
      "ops": [
        "Perimenopausia",
        "Embarazo",
        "Pubertad",
        "Menopausia masculina"
      ],
      "c": 0
    },
    {
      "id": "GO-316",
      "q": "La menopausia se define clínicamente como:",
      "ops": [
        "Cese permanente de la menstruación por pérdida de actividad ovárica, diagnosticado retrospectivamente tras 12 meses de amenorrea",
        "Ausencia de menstruación durante 1 mes",
        "Menstruación irregular durante 3 meses",
        "Sangrado menstrual abundante"
      ],
      "c": 0
    },
    {
      "id": "GO-317",
      "q": "Un síntoma vasomotor típico de la menopausia es:",
      "ops": [
        "Sofoco",
        "Hemoptisis",
        "Ascitis",
        "Disuria obligatoria"
      ],
      "c": 0
    },
    {
      "id": "GO-318",
      "q": "La terapia hormonal de la menopausia debe individualizarse considerando:",
      "ops": [
        "Síntomas, edad, tiempo desde menopausia, riesgos y contraindicaciones",
        "Solo la edad",
        "Solo el peso",
        "Solo la presión arterial"
      ],
      "c": 0
    },
    {
      "id": "GO-319",
      "q": "Una mujer posmenopáusica presenta sangrado vaginal. ¿Cuál es la conducta apropiada?",
      "ops": [
        "Considerarlo siempre fisiológico",
        "Evaluarlo para descartar patología endometrial",
        "Administrar anticonceptivos inmediatamente",
        "No investigar"
      ],
      "c": 1
    },
    {
      "id": "GO-320",
      "q": "El mioma uterino es:",
      "ops": [
        "Tumor benigno del músculo liso uterino",
        "Tumor maligno obligatorio",
        "Infección uterina",
        "Tumor ovárico"
      ],
      "c": 0
    },
    {
      "id": "GO-321",
      "q": "Una manifestación frecuente de miomatosis uterina es:",
      "ops": [
        "Sangrado menstrual abundante",
        "Hemoptisis",
        "Ictericia",
        "Hipoglucemia"
      ],
      "c": 0
    },
    {
      "id": "GO-322",
      "q": "Un pólipo endometrial puede manifestarse con:",
      "ops": [
        "Sangrado uterino anormal",
        "Tos crónica",
        "Disnea",
        "Hipertensión"
      ],
      "c": 0
    },
    {
      "id": "GO-323",
      "q": "Una mujer con infertilidad presenta ciclos regulares y dolor pélvico intenso durante la menstruación. ¿Qué patología debe considerarse?",
      "ops": [
        "Endometriosis",
        "Candidiasis",
        "Vaginosis",
        "Tricomoniasis"
      ],
      "c": 0
    },
    {
      "id": "GO-324",
      "q": "La infertilidad se evalúa inicialmente considerando:",
      "ops": [
        "Factores femeninos y masculinos",
        "Solo anatomía uterina",
        "Solo edad de la mujer",
        "Solo niveles de estrógeno"
      ],
      "c": 0
    },
    {
      "id": "GO-325",
      "q": "En la evaluación inicial de infertilidad masculina es fundamental:",
      "ops": [
        "Seminograma",
        "Mamografía",
        "Colonoscopia",
        "Densitometría"
      ],
      "c": 0
    },
    {
      "id": "GO-326",
      "q": "¿Cuál de los siguientes métodos anticonceptivos ofrece protección frente a infecciones de transmisión sexual?",
      "ops": [
        "DIU de cobre",
        "Preservativo",
        "Implante subdérmico",
        "Anticonceptivo oral combinado"
      ],
      "c": 1
    },
    {
      "id": "GO-327",
      "q": "Los anticonceptivos orales combinados contienen:",
      "ops": [
        "Estrógeno y progestágeno",
        "Solo progesterona natural",
        "Testosterona y estrógeno",
        "Solo testosterona"
      ],
      "c": 0
    },
    {
      "id": "GO-328",
      "q": "Una contraindicación importante para anticonceptivos combinados es:",
      "ops": [
        "Migraña con aura",
        "Dismenorrea leve",
        "Edad de 20 años",
        "Acné"
      ],
      "c": 0
    },
    {
      "id": "GO-329",
      "q": "El tabaquismo adquiere especial importancia al valorar anticonceptivos combinados en:",
      "ops": [
        "Mujeres de mayor edad, particularmente ≥35 años",
        "Adolescentes exclusivamente",
        "Mujeres posmenopáusicas exclusivamente",
        "Todas las mujeres por igual independientemente de edad"
      ],
      "c": 0
    },
    {
      "id": "GO-330",
      "q": "El DIU de cobre actúa principalmente mediante:",
      "ops": [
        "Efecto espermicida local asociado a cobre",
        "Supresión permanente de la ovulación",
        "Bloqueo irreversible de las trompas",
        "Eliminación del endometrio"
      ],
      "c": 0
    },
    {
      "id": "GO-331",
      "q": "Una ventaja del DIU de cobre es:",
      "ops": [
        "Alta eficacia anticonceptiva y larga duración",
        "Protección completa contra VIH",
        "Tratamiento de todas las ITS",
        "Eliminación permanente de la fertilidad"
      ],
      "c": 0
    },
    {
      "id": "GO-332",
      "q": "Los métodos anticonceptivos reversibles de acción prolongada incluyen:",
      "ops": [
        "DIU e implantes",
        "Preservativos exclusivamente",
        "Coito interrumpido",
        "Método del calendario exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "GO-333",
      "q": "La anticoncepción de emergencia debe utilizarse:",
      "ops": [
        "Después de una relación sexual sin protección o falla anticonceptiva, dentro del tiempo recomendado para cada método",
        "Como anticoncepción mensual obligatoria",
        "Solo después de 30 días",
        "Únicamente durante la menopausia"
      ],
      "c": 0
    },
    {
      "id": "GO-334",
      "q": "¿Cuál de los siguientes puede utilizarse como anticoncepción de emergencia?",
      "ops": [
        "DIU de cobre",
        "Penicilina",
        "Insulina",
        "Levotiroxina"
      ],
      "c": 0
    },
    {
      "id": "GO-335",
      "q": "La anticoncepción de emergencia:",
      "ops": [
        "No interrumpe un embarazo ya establecido",
        "Siempre provoca aborto",
        "Produce infertilidad permanente",
        "Es un método anticonceptivo permanente"
      ],
      "c": 0
    },
    {
      "id": "GO-336",
      "q": "El implante anticonceptivo subdérmico es un método:",
      "ops": [
        "Reversible de larga duración",
        "Permanente",
        "Exclusivamente de barrera",
        "No hormonal"
      ],
      "c": 0
    },
    {
      "id": "GO-337",
      "q": "La esterilización tubárica es:",
      "ops": [
        "Método anticonceptivo permanente",
        "Método reversible inmediato",
        "Método de barrera",
        "Método natural"
      ],
      "c": 0
    },
    {
      "id": "GO-338",
      "q": "La vasectomía actúa mediante:",
      "ops": [
        "Interrupción de los conductos deferentes",
        "Extirpación testicular",
        "Supresión de testosterona",
        "Bloqueo de la próstata"
      ],
      "c": 0
    },
    {
      "id": "GO-339",
      "q": "Una característica importante del preservativo es:",
      "ops": [
        "Reduce el riesgo de diversas ITS cuando se utiliza correctamente",
        "Elimina totalmente el riesgo de todas las ITS",
        "Produce infertilidad",
        "Impide siempre la ovulación"
      ],
      "c": 0
    },
    {
      "id": "GO-340",
      "q": "Una mujer que utiliza anticonceptivos hormonales consulta por ausencia de menstruación. La primera evaluación debe considerar:",
      "ops": [
        "Embarazo",
        "Menopausia obligatoria",
        "Cáncer de ovario",
        "Endometriosis obligatoria"
      ],
      "c": 0
    },
    {
      "id": "GO-341",
      "q": "El virus del papiloma humano se relaciona especialmente con:",
      "ops": [
        "Cáncer de cuello uterino",
        "Cáncer renal exclusivamente",
        "Hipotiroidismo",
        "Cirrosis"
      ],
      "c": 0
    },
    {
      "id": "GO-342",
      "q": "La vacunación contra VPH constituye:",
      "ops": [
        "Una estrategia fundamental de prevención primaria",
        "Tratamiento de un cáncer invasivo establecido",
        "Tratamiento de la infertilidad",
        "Tratamiento de endometriosis"
      ],
      "c": 0
    },
    {
      "id": "GO-343",
      "q": "La prevención del cáncer cervical incluye:",
      "ops": [
        "Vacunación contra VPH y tamizaje apropiado",
        "Solo ecografía abdominal",
        "Solo hemograma",
        "Solo CA-125"
      ],
      "c": 0
    },
    {
      "id": "GO-344",
      "q": "Una infección por VPH de alto riesgo persistente puede producir:",
      "ops": [
        "Lesiones intraepiteliales cervicales y cáncer",
        "Diabetes",
        "Hipertensión",
        "Pancreatitis"
      ],
      "c": 0
    },
    {
      "id": "GO-345",
      "q": "El objetivo principal del tamizaje cervical es:",
      "ops": [
        "Detectar lesiones precancerosas o cáncer en etapas tempranas",
        "Diagnosticar embarazo",
        "Detectar endometriosis",
        "Evaluar reserva ovárica"
      ],
      "c": 0
    },
    {
      "id": "GO-346",
      "q": "La edad gestacional se calcula habitualmente desde:",
      "ops": [
        "Primer día de la última menstruación",
        "Día de la concepción exclusivamente",
        "Primera ecografía siempre",
        "Día del primer movimiento fetal"
      ],
      "c": 0
    },
    {
      "id": "GO-347",
      "q": "La duración aproximada de una gestación normal es:",
      "ops": [
        "40 semanas desde la FUM",
        "30 semanas",
        "20 semanas",
        "50 semanas"
      ],
      "c": 0
    },
    {
      "id": "GO-348",
      "q": "El primer trimestre comprende aproximadamente:",
      "ops": [
        "Hasta 13 semanas y 6 días",
        "14–27 semanas",
        "28–40 semanas",
        "30–42 semanas"
      ],
      "c": 0
    },
    {
      "id": "GO-349",
      "q": "El segundo trimestre comprende aproximadamente:",
      "ops": [
        "14–27 semanas y 6 días",
        "1–12 semanas",
        "28–40 semanas",
        "Solo 20–24 semanas"
      ],
      "c": 0
    },
    {
      "id": "GO-350",
      "q": "El tercer trimestre comienza aproximadamente en:",
      "ops": [
        "28 semanas",
        "14 semanas",
        "8 semanas",
        "20 semanas"
      ],
      "c": 0
    },
    {
      "id": "GO-351",
      "q": "Una prueba de embarazo positiva detecta principalmente:",
      "ops": [
        "β-hCG",
        "Progesterona exclusivamente",
        "Estriol exclusivamente",
        "FSH"
      ],
      "c": 0
    },
    {
      "id": "GO-352",
      "q": "La β-hCG es producida principalmente por:",
      "ops": [
        "Trofoblasto",
        "Hipófisis materna",
        "Tiroides fetal",
        "Hígado materno"
      ],
      "c": 0
    },
    {
      "id": "GO-353",
      "q": "Durante el embarazo, una función importante de la placenta es:",
      "ops": [
        "Intercambio materno-fetal y producción hormonal",
        "Producir eritrocitos maternos",
        "Sustituir permanentemente al hígado materno",
        "Eliminar todos los anticuerpos maternos"
      ],
      "c": 0
    },
    {
      "id": "GO-354",
      "q": "El control prenatal tiene como objetivo:",
      "ops": [
        "Identificar factores de riesgo y complicaciones, además de promover salud materno-fetal",
        "Realizar únicamente ecografías",
        "Controlar exclusivamente la presión arterial",
        "Determinar solamente el sexo fetal"
      ],
      "c": 0
    },
    {
      "id": "GO-355",
      "q": "En el control prenatal debe evaluarse sistemáticamente:",
      "ops": [
        "Presión arterial",
        "Solo peso fetal",
        "Solo frecuencia cardíaca materna",
        "Solo temperatura"
      ],
      "c": 0
    },
    {
      "id": "GO-356",
      "q": "La anemia durante el embarazo se evalúa principalmente mediante:",
      "ops": [
        "Hemograma",
        "ECG",
        "Radiografía",
        "Espirometría"
      ],
      "c": 0
    },
    {
      "id": "GO-357",
      "q": "La causa nutricional más frecuente de anemia durante el embarazo es:",
      "ops": [
        "Deficiencia de hierro",
        "Déficit de vitamina D",
        "Déficit de calcio",
        "Déficit de sodio"
      ],
      "c": 0
    },
    {
      "id": "GO-358",
      "q": "La suplementación con ácido fólico es especialmente importante para prevenir:",
      "ops": [
        "Defectos del tubo neural",
        "Diabetes gestacional",
        "Hipertensión crónica",
        "Placenta previa"
      ],
      "c": 0
    },
    {
      "id": "GO-359",
      "q": "El cierre del tubo neural ocurre:",
      "ops": [
        "Muy temprano durante el desarrollo embrionario",
        "Después de las 30 semanas",
        "Durante el trabajo de parto",
        "Después del nacimiento"
      ],
      "c": 0
    },
    {
      "id": "GO-360",
      "q": "Una mujer embarazada presenta bacteriuria asintomática. ¿Por qué es importante identificarla?",
      "ops": [
        "Puede aumentar el riesgo de pielonefritis y complicaciones obstétricas",
        "Nunca tiene importancia",
        "Siempre desaparece espontáneamente",
        "Solo produce vaginitis"
      ],
      "c": 0
    },
    {
      "id": "GO-361",
      "q": "La ecografía del primer trimestre puede ser especialmente útil para:",
      "ops": [
        "Confirmar localización y viabilidad, además de establecer edad gestacional",
        "Diagnosticar todas las malformaciones",
        "Determinar siempre el sexo fetal",
        "Diagnosticar diabetes gestacional"
      ],
      "c": 0
    },
    {
      "id": "GO-362",
      "q": "La translucencia nucal se evalúa principalmente durante:",
      "ops": [
        "Primer trimestre",
        "Tercer trimestre exclusivamente",
        "Puerperio",
        "Menopausia"
      ],
      "c": 0
    },
    {
      "id": "GO-363",
      "q": "La ecografía morfológica fetal se realiza habitualmente:",
      "ops": [
        "En el segundo trimestre",
        "Solo durante el puerperio",
        "Antes de la implantación",
        "Después del parto"
      ],
      "c": 0
    },
    {
      "id": "GO-364",
      "q": "El movimiento fetal percibido por la madre se denomina:",
      "ops": [
        "Percepción de movimientos fetales o “quickening”",
        "Amenorrea",
        "Lochia",
        "Menarquia"
      ],
      "c": 0
    },
    {
      "id": "GO-365",
      "q": "Una disminución marcada de movimientos fetales debe:",
      "ops": [
        "Evaluarse oportunamente",
        "Considerarse siempre normal",
        "Ignorarse",
        "Tratarse con antibióticos sin evaluación"
      ],
      "c": 0
    },
    {
      "id": "GO-366",
      "q": "La diabetes gestacional se caracteriza por:",
      "ops": [
        "Alteración de la regulación de glucosa diagnosticada durante el embarazo",
        "Diabetes exclusivamente neonatal",
        "Hipoglucemia materna",
        "Diabetes que siempre existía antes del embarazo"
      ],
      "c": 0
    },
    {
      "id": "GO-367",
      "q": "La diabetes gestacional aumenta el riesgo de:",
      "ops": [
        "Macrosomía fetal",
        "Hipotiroidismo fetal obligatorio",
        "Microcefalia obligatoria",
        "Agenesia renal obligatoria"
      ],
      "c": 0
    },
    {
      "id": "GO-368",
      "q": "Una complicación materna asociada con diabetes gestacional es:",
      "ops": [
        "Mayor riesgo de trastornos hipertensivos del embarazo",
        "Hipotensión permanente",
        "Anemia hemolítica obligatoria",
        "Tuberculosis"
      ],
      "c": 0
    },
    {
      "id": "GO-369",
      "q": "La vacuna durante el embarazo debe evaluarse según:",
      "ops": [
        "Tipo de vacuna, seguridad, momento y riesgo individual",
        "Todas están contraindicadas",
        "Ninguna puede administrarse",
        "Solo según el sexo fetal"
      ],
      "c": 0
    },
    {
      "id": "GO-370",
      "q": "Una recomendación fundamental durante el embarazo es:",
      "ops": [
        "Evitar alcohol y tabaco",
        "Aumentar consumo de alcohol",
        "Fumar menos de cinco cigarrillos siempre",
        "Evitar todos los controles"
      ],
      "c": 0
    },
    {
      "id": "GO-371",
      "q": "La hipertensión crónica en el embarazo corresponde a hipertensión:",
      "ops": [
        "Presente antes del embarazo o diagnosticada antes de las 20 semanas",
        "Diagnosticada exclusivamente después de 37 semanas",
        "Solo durante el parto",
        "Solo durante el puerperio"
      ],
      "c": 0
    },
    {
      "id": "GO-372",
      "q": "La hipertensión gestacional se caracteriza por:",
      "ops": [
        "Hipertensión de novo después de las 20 semanas sin criterios de preeclampsia al diagnóstico",
        "Hipertensión antes de la concepción exclusivamente",
        "Hipotensión durante el embarazo",
        "Hipertensión neonatal"
      ],
      "c": 0
    },
    {
      "id": "GO-373",
      "q": "La preeclampsia se caracteriza por hipertensión después de las 20 semanas asociada con:",
      "ops": [
        "Proteinuria y/o disfunción de órgano materno según criterios establecidos",
        "Solo fiebre",
        "Solo anemia",
        "Hipoglucemia"
      ],
      "c": 0
    },
    {
      "id": "GO-374",
      "q": "Una gestante de 34 semanas presenta PA 170/112 mmHg. ¿Qué debe considerarse?",
      "ops": [
        "Hipertensión severa",
        "Presión normal del embarazo",
        "Hipotensión",
        "Hipertensión fisiológica"
      ],
      "c": 0
    },
    {
      "id": "GO-375",
      "q": "Una complicación grave de la preeclampsia es:",
      "ops": [
        "Eclampsia",
        "Gastritis",
        "Cistitis simple",
        "Miopía"
      ],
      "c": 0
    },
    {
      "id": "GO-376",
      "q": "La eclampsia se define por:",
      "ops": [
        "Convulsiones en una paciente con trastorno hipertensivo del embarazo sin otra causa que las explique",
        "Hipertensión sin síntomas",
        "Proteinuria aislada",
        "Edema periférico aislado"
      ],
      "c": 0
    },
    {
      "id": "GO-377",
      "q": "El fármaco de elección para prevenir y tratar convulsiones asociadas con eclampsia es:",
      "ops": [
        "Sulfato de magnesio",
        "Diazepam como primera opción universal",
        "Paracetamol",
        "Insulina"
      ],
      "c": 0
    },
    {
      "id": "GO-378",
      "q": "Una gestante con preeclampsia presenta cefalea intensa, alteraciones visuales y dolor epigástrico. Estos síntomas:",
      "ops": [
        "Sugieren características de gravedad",
        "Son siempre fisiológicos",
        "Excluyen preeclampsia",
        "Indican diabetes gestacional"
      ],
      "c": 0
    },
    {
      "id": "GO-379",
      "q": "El síndrome HELLP incluye:",
      "ops": [
        "Hemólisis, elevación de enzimas hepáticas y plaquetas bajas",
        "Hiperglucemia, edema, leucocitosis y proteinuria",
        "Hipotensión, anemia y leucopenia",
        "Hipocalcemia, anemia y taquicardia"
      ],
      "c": 0
    },
    {
      "id": "GO-380",
      "q": "Una paciente con preeclampsia presenta plaquetas 72.000/mm³ y AST/ALT elevadas. ¿Qué debe sospecharse?",
      "ops": [
        "Síndrome HELLP",
        "Diabetes gestacional",
        "Placenta previa",
        "Corioamnionitis"
      ],
      "c": 0
    },
    {
      "id": "GO-381",
      "q": "Una complicación materna de preeclampsia grave es:",
      "ops": [
        "Accidente cerebrovascular",
        "Miopía",
        "Candidiasis",
        "Otitis"
      ],
      "c": 0
    },
    {
      "id": "GO-382",
      "q": "Una complicación fetal de los trastornos hipertensivos del embarazo es:",
      "ops": [
        "Restricción del crecimiento fetal",
        "Macrosomía obligatoria",
        "Polidactilia",
        "Anencefalia obligatoria"
      ],
      "c": 0
    },
    {
      "id": "GO-383",
      "q": "La aspirina a dosis baja puede estar indicada para:",
      "ops": [
        "Prevención de preeclampsia en gestantes con determinados factores de alto riesgo",
        "Todas las gestantes sin excepción",
        "Tratamiento de eclampsia",
        "Tratamiento de hemorragia posparto"
      ],
      "c": 0
    },
    {
      "id": "GO-384",
      "q": "Una paciente con eclampsia presenta una convulsión activa. La prioridad inicial es:",
      "ops": [
        "Estabilización materna y control de la convulsión",
        "Realizar inmediatamente cesárea sin estabilización",
        "Administrar antibióticos solamente",
        "Inducir vómito"
      ],
      "c": 0
    },
    {
      "id": "GO-385",
      "q": "En preeclampsia con hipertensión severa persistente, es importante:",
      "ops": [
        "Tratamiento antihipertensivo oportuno para reducir riesgo materno",
        "Esperar siempre hasta el parto espontáneo",
        "Evitar toda medicación",
        "Administrar diuréticos a todas las pacientes"
      ],
      "c": 0
    },
    {
      "id": "GO-386",
      "q": "La preeclampsia puede aparecer:",
      "ops": [
        "Incluso sin proteinuria, si existen criterios de disfunción de órgano materno",
        "Solo cuando existe proteinuria masiva",
        "Solo antes de 20 semanas",
        "Solo después del parto"
      ],
      "c": 0
    },
    {
      "id": "GO-387",
      "q": "Una mujer con hipertensión y trombocitopenia en el tercer trimestre requiere:",
      "ops": [
        "Evaluación urgente de trastorno hipertensivo grave",
        "Alta inmediata",
        "Ningún examen",
        "Antifúngicos"
      ],
      "c": 0
    },
    {
      "id": "GO-388",
      "q": "La hipertensión gestacional puede:",
      "ops": [
        "Evolucionar posteriormente a preeclampsia",
        "Nunca presentar complicaciones",
        "Transformarse en diabetes tipo 1",
        "Producir siempre eclampsia"
      ],
      "c": 0
    },
    {
      "id": "GO-389",
      "q": "Después del parto, una paciente que tuvo preeclampsia:",
      "ops": [
        "Continúa requiriendo vigilancia porque las complicaciones pueden presentarse en el puerperio",
        "Ya no tiene ningún riesgo",
        "Nunca requiere control de presión",
        "Debe suspender todos los medicamentos"
      ],
      "c": 0
    },
    {
      "id": "GO-390",
      "q": "Una complicación neurológica asociada con preeclampsia/eclampsia es:",
      "ops": [
        "Edema cerebral y encefalopatía posterior reversible",
        "Enfermedad de Parkinson",
        "Esclerosis múltiple",
        "Alzheimer"
      ],
      "c": 0
    },
    {
      "id": "GO-391",
      "q": "El sulfato de magnesio requiere vigilancia porque:",
      "ops": [
        "Puede producir toxicidad con depresión respiratoria y pérdida de reflejos",
        "Siempre causa hiperglucemia",
        "Produce hipertensión severa obligatoriamente",
        "No presenta efectos adversos"
      ],
      "c": 0
    },
    {
      "id": "GO-392",
      "q": "Un signo clínico de toxicidad por magnesio es:",
      "ops": [
        "Disminución o abolición de reflejos osteotendinosos",
        "Midriasis exclusivamente",
        "Hipertensión extrema",
        "Fiebre"
      ],
      "c": 0
    },
    {
      "id": "GO-393",
      "q": "El antídoto utilizado ante toxicidad grave por sulfato de magnesio es:",
      "ops": [
        "Gluconato de calcio",
        "Insulina",
        "Atropina",
        "Bicarbonato"
      ],
      "c": 0
    },
    {
      "id": "GO-394",
      "q": "Una gestante con preeclampsia presenta deterioro de función renal y alteraciones neurológicas. Estos hallazgos:",
      "ops": [
        "Pueden constituir criterios de gravedad",
        "Son fisiológicos",
        "Descarta preeclampsia",
        "Indican exclusivamente diabetes"
      ],
      "c": 0
    },
    {
      "id": "GO-395",
      "q": "La decisión sobre el momento del parto en preeclampsia debe considerar principalmente:",
      "ops": [
        "Edad gestacional, gravedad materna, estado fetal y condiciones clínicas",
        "Solo peso materno",
        "Solo sexo fetal",
        "Solo paridad"
      ],
      "c": 0
    },
    {
      "id": "GO-396",
      "q": "La hemorragia anteparto puede deberse a:",
      "ops": [
        "Placenta previa o desprendimiento placentario, entre otras causas",
        "Solo miomas",
        "Solo diabetes",
        "Solo infección urinaria"
      ],
      "c": 0
    },
    {
      "id": "GO-397",
      "q": "Una gestante de 32 semanas presenta sangrado vaginal rojo brillante, indoloro. ¿Qué diagnóstico debe considerarse?",
      "ops": [
        "Placenta previa",
        "Desprendimiento prematuro de placenta",
        "Rotura uterina",
        "Corioamnionitis"
      ],
      "c": 0
    },
    {
      "id": "GO-398",
      "q": "En una sospecha de placenta previa, debe evitarse inicialmente:",
      "ops": [
        "Tacto vaginal digital hasta determinar localización placentaria",
        "Control de signos vitales",
        "Ecografía",
        "Monitorización fetal"
      ],
      "c": 0
    },
    {
      "id": "GO-399",
      "q": "El desprendimiento prematuro de placenta suele asociarse con:",
      "ops": [
        "Dolor abdominal y sangrado vaginal, aunque el sangrado puede ser oculto",
        "Sangrado siempre indoloro",
        "Ausencia de dolor obligatoria",
        "Hipoglucemia"
      ],
      "c": 0
    },
    {
      "id": "GO-400",
      "q": "Una complicación fetal importante del desprendimiento placentario es:",
      "ops": [
        "Sufrimiento fetal agudo",
        "Macrosomía",
        "Polidactilia",
        "Hipotiroidismo"
      ],
      "c": 0
    },
    {
      "id": "GO-401",
      "q": "La hemorragia posparto primaria se relaciona frecuentemente con:",
      "ops": [
        "Atonía uterina",
        "Hipotiroidismo",
        "Candidiasis",
        "Migraña"
      ],
      "c": 0
    },
    {
      "id": "GO-402",
      "q": "Una puérpera presenta sangrado abundante y útero blando y aumentado de tamaño. ¿Cuál es la causa más probable?",
      "ops": [
        "Atonía uterina",
        "Rotura cervical obligatoria",
        "Coagulopatía aislada",
        "Placenta previa persistente"
      ],
      "c": 0
    },
    {
      "id": "GO-403",
      "q": "Las causas clásicas de hemorragia posparto pueden agruparse como:",
      "ops": [
        "Tono, trauma, tejido y trombina",
        "Pulmón, corazón, riñón y cerebro",
        "Fiebre, dolor, tos y vómitos",
        "Sangre, orina, bilis y linfa"
      ],
      "c": 0
    },
    {
      "id": "GO-404",
      "q": "La atonía uterina corresponde a:",
      "ops": [
        "Incapacidad del útero para contraerse adecuadamente después del parto",
        "Contracción uterina excesiva",
        "Infección del cuello uterino",
        "Rotura de membranas"
      ],
      "c": 0
    },
    {
      "id": "GO-405",
      "q": "Una intervención inicial ante atonía uterina incluye:",
      "ops": [
        "Masaje uterino y uterotónicos según protocolo",
        "Esperar espontáneamente",
        "Administrar anticoagulantes",
        "Suspender toda monitorización"
      ],
      "c": 0
    },
    {
      "id": "GO-406",
      "q": "El ácido tranexámico puede utilizarse en:",
      "ops": [
        "Hemorragia posparto como parte del tratamiento oportuno cuando está indicado",
        "Tratamiento de preeclampsia",
        "Tratamiento de diabetes gestacional",
        "Tratamiento de infección urinaria"
      ],
      "c": 0
    },
    {
      "id": "GO-407",
      "q": "Una mujer presenta sangrado posparto persistente pese a útero adecuadamente contraído. Debe considerarse:",
      "ops": [
        "Trauma del canal del parto o tejido retenido, entre otras causas",
        "Atonía exclusivamente",
        "Hipoglucemia",
        "Hipotiroidismo"
      ],
      "c": 0
    },
    {
      "id": "GO-408",
      "q": "La retención de productos placentarios puede provocar:",
      "ops": [
        "Hemorragia posparto",
        "Hipertensión crónica",
        "Diabetes",
        "Asma"
      ],
      "c": 0
    },
    {
      "id": "GO-409",
      "q": "Una complicación grave de la hemorragia obstétrica es:",
      "ops": [
        "Shock hipovolémico",
        "Hipotiroidismo",
        "Otitis",
        "Catarata"
      ],
      "c": 0
    },
    {
      "id": "GO-410",
      "q": "Una paciente con hemorragia obstétrica masiva requiere:",
      "ops": [
        "Activación de protocolo de hemorragia masiva según recursos disponibles",
        "Observación exclusivamente",
        "Alta",
        "Solo hierro oral"
      ],
      "c": 0
    },
    {
      "id": "GO-411",
      "q": "La placenta acreta/espectro de acretismo placentario se relaciona con:",
      "ops": [
        "Adherencia/invasión anormal de la placenta al miometrio",
        "Hipertensión esencial",
        "Diabetes tipo 1",
        "Endometriosis"
      ],
      "c": 0
    },
    {
      "id": "GO-412",
      "q": "Un factor de riesgo importante para espectro de placenta acreta es:",
      "ops": [
        "Placenta previa asociada a cesáreas previas",
        "Menarquia temprana exclusivamente",
        "Migraña",
        "Asma"
      ],
      "c": 0
    },
    {
      "id": "GO-413",
      "q": "La placenta acreta puede producir:",
      "ops": [
        "Hemorragia obstétrica masiva",
        "Hipoglucemia",
        "Neumonía",
        "Hipotiroidismo"
      ],
      "c": 0
    },
    {
      "id": "GO-414",
      "q": "Una paciente con cesárea previa presenta placenta previa y sospecha de acretismo. El manejo debe:",
      "ops": [
        "Planificarse en un centro con capacidad multidisciplinaria y recursos adecuados",
        "Realizarse siempre en domicilio",
        "Ignorarse hasta el parto",
        "Utilizar únicamente antibióticos"
      ],
      "c": 0
    },
    {
      "id": "GO-415",
      "q": "La rotura uterina se asocia especialmente con:",
      "ops": [
        "Cicatriz uterina previa, particularmente durante trabajo de parto en determinados contextos",
        "Candidiasis",
        "Hipotiroidismo",
        "Vaginosis"
      ],
      "c": 0
    },
    {
      "id": "GO-416",
      "q": "Una manifestación sugestiva de rotura uterina puede ser:",
      "ops": [
        "Alteración súbita de la frecuencia cardíaca fetal y dolor abdominal, entre otros signos",
        "Solo prurito",
        "Tos",
        "Diarrea"
      ],
      "c": 0
    },
    {
      "id": "GO-417",
      "q": "El shock hemorrágico obstétrico requiere:",
      "ops": [
        "Control de hemorragia y reanimación simultánea",
        "Solo reposo",
        "Solo oxígeno",
        "Solo hierro oral"
      ],
      "c": 0
    },
    {
      "id": "GO-418",
      "q": "En hemorragia obstétrica grave, debe solicitarse precozmente:",
      "ops": [
        "Hemograma y pruebas de coagulación, además de preparación de hemoderivados según gravedad",
        "Solo glucemia",
        "Solo examen de orina",
        "Solo TSH"
      ],
      "c": 0
    },
    {
      "id": "GO-419",
      "q": "La coagulopatía asociada a hemorragia masiva puede:",
      "ops": [
        "Agravar el sangrado",
        "Detener siempre la hemorragia",
        "Ser protectora",
        "No tener importancia"
      ],
      "c": 0
    },
    {
      "id": "GO-420",
      "q": "En una paciente con hemorragia posparto, la reevaluación continua debe incluir:",
      "ops": [
        "Signos vitales, pérdida sanguínea, respuesta a tratamiento y perfusión",
        "Solo temperatura",
        "Solo dolor",
        "Solo frecuencia cardíaca fetal"
      ],
      "c": 0
    },
    {
      "id": "GO-421",
      "q": "El trabajo de parto verdadero se caracteriza por:",
      "ops": [
        "Contracciones regulares con cambios cervicales progresivos",
        "Contracciones irregulares sin cambios cervicales",
        "Solo dolor lumbar",
        "Solo pérdida del tapón mucoso"
      ],
      "c": 0
    },
    {
      "id": "GO-422",
      "q": "La dilatación cervical completa corresponde a:",
      "ops": [
        "10 cm",
        "5 cm",
        "7 cm",
        "12 cm"
      ],
      "c": 0
    },
    {
      "id": "GO-423",
      "q": "La primera etapa del trabajo de parto termina cuando:",
      "ops": [
        "Se alcanza dilatación cervical completa",
        "Nace la placenta",
        "Se rompe la membrana obligatoriamente",
        "Comienza el puerperio"
      ],
      "c": 0
    },
    {
      "id": "GO-424",
      "q": "La segunda etapa del trabajo de parto comprende:",
      "ops": [
        "Desde dilatación completa hasta el nacimiento del recién nacido",
        "Desde concepción hasta dilatación",
        "Desde nacimiento hasta expulsión de placenta",
        "Solo el puerperio"
      ],
      "c": 0
    },
    {
      "id": "GO-425",
      "q": "La tercera etapa del parto comprende:",
      "ops": [
        "Desde el nacimiento hasta la expulsión de la placenta",
        "Desde la dilatación hasta el nacimiento",
        "Desde concepción hasta dilatación",
        "Desde puerperio hasta lactancia"
      ],
      "c": 0
    },
    {
      "id": "GO-426",
      "q": "La cuarta etapa se refiere generalmente a:",
      "ops": [
        "Vigilancia inmediata posterior al alumbramiento",
        "Primer trimestre",
        "Embarazo tardío",
        "Menopausia"
      ],
      "c": 0
    },
    {
      "id": "GO-427",
      "q": "Una presentación fetal cefálica significa:",
      "ops": [
        "La cabeza es la parte que se presenta hacia el canal del parto",
        "Las nalgas",
        "El hombro",
        "El dorso exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "GO-428",
      "q": "La presentación de nalgas corresponde a:",
      "ops": [
        "Presentación podálica",
        "Presentación cefálica",
        "Presentación facial obligatoria",
        "Presentación transversa"
      ],
      "c": 0
    },
    {
      "id": "GO-429",
      "q": "La situación fetal transversa implica:",
      "ops": [
        "Eje longitudinal fetal perpendicular al eje materno",
        "Eje fetal paralelo al materno",
        "Cabeza siempre abajo",
        "Nalgas siempre abajo"
      ],
      "c": 0
    },
    {
      "id": "GO-430",
      "q": "La monitorización fetal intraparto busca principalmente:",
      "ops": [
        "Detectar alteraciones de oxigenación fetal",
        "Diagnosticar diabetes materna",
        "Medir hemoglobina fetal directamente",
        "Diagnosticar endometriosis"
      ],
      "c": 0
    },
    {
      "id": "GO-431",
      "q": "Una desaceleración tardía recurrente puede sugerir:",
      "ops": [
        "Insuficiencia uteroplacentaria",
        "Hipoglucemia materna obligatoria",
        "Trabajo de parto normal siempre",
        "Fiebre fetal"
      ],
      "c": 0
    },
    {
      "id": "GO-432",
      "q": "Una desaceleración variable se relaciona frecuentemente con:",
      "ops": [
        "Compresión del cordón umbilical",
        "Hipertensión materna exclusivamente",
        "Diabetes gestacional",
        "Placenta acreta"
      ],
      "c": 0
    },
    {
      "id": "GO-433",
      "q": "El contacto piel con piel inmediatamente después del nacimiento, cuando las condiciones lo permiten:",
      "ops": [
        "Favorece adaptación neonatal y lactancia",
        "Está contraindicado en todos los recién nacidos",
        "Produce hipotermia inevitable",
        "Debe evitarse siempre"
      ],
      "c": 0
    },
    {
      "id": "GO-434",
      "q": "La OMS considera dentro de los cuidados esenciales del recién nacido:",
      "ops": [
        "Secado, mantenimiento de temperatura, evaluación de respiración y apoyo a lactancia",
        "Separación rutinaria de madre y recién nacido",
        "Baño inmediato obligatorio",
        "Suspender lactancia"
      ],
      "c": 0
    },
    {
      "id": "GO-435",
      "q": "El puerperio corresponde aproximadamente al período:",
      "ops": [
        "Posterior al parto durante el cual ocurren cambios de recuperación materna",
        "Antes de la concepción",
        "Primer trimestre exclusivamente",
        "Menopausia"
      ],
      "c": 0
    },
    {
      "id": "GO-436",
      "q": "La loquia corresponde a:",
      "ops": [
        "Secreción vaginal normal posterior al parto",
        "Orina",
        "Líquido amniótico",
        "Leche materna"
      ],
      "c": 0
    },
    {
      "id": "GO-437",
      "q": "Una puérpera presenta fiebre, dolor uterino y secreción vaginal maloliente. ¿Qué debe sospecharse?",
      "ops": [
        "Endometritis puerperal",
        "Menopausia",
        "Endometriosis",
        "Candidiasis exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "GO-438",
      "q": "Una complicación infecciosa importante del puerperio es:",
      "ops": [
        "Endometritis posparto",
        "Hipotiroidismo",
        "Diabetes tipo 1",
        "Asma"
      ],
      "c": 0
    },
    {
      "id": "GO-439",
      "q": "Una puérpera presenta dolor unilateral de pierna, edema y aumento de temperatura local. Debe sospecharse:",
      "ops": [
        "Trombosis venosa profunda",
        "Cistitis",
        "Mastitis",
        "Endometritis"
      ],
      "c": 0
    },
    {
      "id": "GO-440",
      "q": "El puerperio aumenta temporalmente el riesgo de:",
      "ops": [
        "Enfermedad tromboembólica venosa",
        "Hipotiroidismo obligatorio",
        "Endometriosis",
        "Miopía"
      ],
      "c": 0
    },
    {
      "id": "GO-441",
      "q": "Una mujer de 27 años presenta amenorrea, dolor pélvico unilateral y sangrado vaginal. La prueba de embarazo es positiva. ¿Qué diagnóstico debe descartarse prioritariamente?",
      "ops": [
        "Embarazo ectópico",
        "Menopausia",
        "Vaginosis",
        "Mioma"
      ],
      "c": 0
    },
    {
      "id": "GO-442",
      "q": "El sitio más frecuente de embarazo ectópico es:",
      "ops": [
        "Trompa de Falopio",
        "Ovario",
        "Cuello uterino",
        "Abdomen"
      ],
      "c": 0
    },
    {
      "id": "GO-443",
      "q": "Una paciente con embarazo ectópico presenta dolor abdominal intenso, hipotensión y signos de shock. ¿Qué debe sospecharse?",
      "ops": [
        "Rotura de embarazo ectópico con hemoperitoneo",
        "Embarazo normal",
        "Vaginitis",
        "Amenaza de aborto no complicada"
      ],
      "c": 0
    },
    {
      "id": "GO-444",
      "q": "En una paciente estable con sospecha de embarazo ectópico, una herramienta fundamental es:",
      "ops": [
        "β-hCG cuantitativa y ecografía transvaginal",
        "Radiografía de tórax exclusivamente",
        "Colonoscopia",
        "Mamografía"
      ],
      "c": 0
    },
    {
      "id": "GO-445",
      "q": "El embarazo ectópico puede ser tratado, según selección clínica, mediante:",
      "ops": [
        "Manejo expectante, tratamiento médico o cirugía",
        "Solo cesárea",
        "Solo antibióticos",
        "Solo progesterona"
      ],
      "c": 0
    },
    {
      "id": "GO-446",
      "q": "Una mujer con embarazo intrauterino confirmado presenta sangrado vaginal leve pero no tiene dolor y se documenta actividad cardíaca embriofetal. ¿Qué diagnóstico corresponde?",
      "ops": [
        "Amenaza de aborto",
        "Aborto inevitable",
        "Embarazo ectópico",
        "Mola hidatidiforme"
      ],
      "c": 0
    },
    {
      "id": "GO-447",
      "q": "En una paciente con sangrado durante embarazo temprano, la evaluación debe considerar:",
      "ops": [
        "Localización del embarazo, viabilidad y posibilidad de embarazo ectópico",
        "Solo hemoglobina",
        "Solo presión arterial",
        "Solo temperatura"
      ],
      "c": 0
    },
    {
      "id": "GO-448",
      "q": "Una paciente con aborto espontáneo confirmado y clínicamente estable puede recibir, según el caso:",
      "ops": [
        "Manejo expectante, médico o quirúrgico",
        "Solo cesárea",
        "Solo antibióticos",
        "Ningún seguimiento"
      ],
      "c": 0
    },
    {
      "id": "GO-449",
      "q": "Una gestante presenta sangrado, dolor abdominal intenso, hombro doloroso, hipotensión y abdomen agudo. ¿Cuál es la prioridad?",
      "ops": [
        "Sospechar embarazo ectópico roto y realizar estabilización urgente",
        "Dar de alta",
        "Esperar evolución espontánea",
        "Administrar anticonceptivos"
      ],
      "c": 0
    },
    {
      "id": "GO-450",
      "q": "En una paciente con embarazo ectópico, el objetivo principal del tratamiento es:",
      "ops": [
        "Resolver el embarazo ectópico y prevenir hemorragia y complicaciones maternas",
        "Mantener indefinidamente el embarazo ectópico",
        "Administrar hierro exclusivamente",
        "Evitar cualquier seguimiento"
      ],
      "c": 0
    }
  ],
  "cirugia": [
    {
      "id": "CIR-451",
      "q": "Un paciente presenta dolor que comenzó en epigastrio y posteriormente se localizó en fosa ilíaca derecha, acompañado de anorexia y náuseas. ¿Cuál es el diagnóstico más probable?",
      "ops": [
        "Colecistitis",
        "Apendicitis aguda",
        "Pancreatitis",
        "Diverticulitis"
      ],
      "c": 1,
      "x": "Apendicitis aguda."
    },
    {
      "id": "CIR-452",
      "q": "El punto de McBurney se localiza aproximadamente:",
      "ops": [
        "En el tercio lateral de la línea entre el ombligo y la espina ilíaca anterosuperior derecha",
        "En hipocondrio derecho",
        "En epigastrio",
        "En fosa ilíaca izquierda"
      ],
      "c": 0
    },
    {
      "id": "CIR-453",
      "q": "¿Cuál es una manifestación clásica de apendicitis aguda?",
      "ops": [
        "Dolor migratorio hacia fosa ilíaca derecha",
        "Hematemesis",
        "Ictericia aislada",
        "Hematuria masiva"
      ],
      "c": 0
    },
    {
      "id": "CIR-454",
      "q": "En un paciente con sospecha de apendicitis, ¿qué estudio de imagen es especialmente útil en adultos cuando el diagnóstico no es claro?",
      "ops": [
        "TC abdominal",
        "Mamografía",
        "Radiografía de cráneo",
        "Ecocardiograma"
      ],
      "c": 0
    },
    {
      "id": "CIR-455",
      "q": "Una complicación de la apendicitis no tratada es:",
      "ops": [
        "Perforación y peritonitis",
        "Hipotiroidismo",
        "Cirrosis",
        "Pancreatitis crónica"
      ],
      "c": 0
    },
    {
      "id": "CIR-456",
      "q": "Una paciente presenta dolor intenso en hipocondrio derecho después de comidas grasas, fiebre y vómitos. ¿Cuál es el diagnóstico más probable?",
      "ops": [
        "Colecistitis aguda",
        "Apendicitis",
        "Diverticulitis",
        "Hernia inguinal"
      ],
      "c": 0
    },
    {
      "id": "CIR-457",
      "q": "El signo de Murphy positivo sugiere:",
      "ops": [
        "Inflamación de la vesícula biliar",
        "Apendicitis",
        "Pancreatitis exclusivamente",
        "Obstrucción intestinal"
      ],
      "c": 0
    },
    {
      "id": "CIR-458",
      "q": "El estudio inicial de elección ante sospecha de colecistitis aguda suele ser:",
      "ops": [
        "Ecografía hepatobiliar",
        "TC cerebral",
        "Colonoscopia",
        "RM cerebral"
      ],
      "c": 0
    },
    {
      "id": "CIR-459",
      "q": "La causa más frecuente de colecistitis aguda es:",
      "ops": [
        "Obstrucción del conducto cístico por cálculo",
        "Trauma hepático",
        "Hepatitis viral",
        "Cáncer pancreático"
      ],
      "c": 0
    },
    {
      "id": "CIR-460",
      "q": "Una complicación de la colecistitis aguda es:",
      "ops": [
        "Perforación vesicular",
        "Hipotiroidismo",
        "Insuficiencia suprarrenal",
        "Migraña"
      ],
      "c": 0
    },
    {
      "id": "CIR-461",
      "q": "Un paciente presenta dolor epigástrico intenso irradiado a la espalda y elevación marcada de lipasa. ¿Cuál es el diagnóstico?",
      "ops": [
        "Pancreatitis aguda",
        "Apendicitis",
        "Hernia",
        "Diverticulitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-462",
      "q": "Una causa frecuente de pancreatitis aguda es:",
      "ops": [
        "Litiasis biliar",
        "Hipotiroidismo",
        "Asma",
        "Anemia"
      ],
      "c": 0
    },
    {
      "id": "CIR-463",
      "q": "Otra causa importante de pancreatitis aguda es:",
      "ops": [
        "Alcohol",
        "Rinitis",
        "Migraña",
        "Cistitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-464",
      "q": "Una complicación local de pancreatitis aguda es:",
      "ops": [
        "Necrosis pancreática",
        "Catarata",
        "Otitis",
        "Hernia inguinal"
      ],
      "c": 0
    },
    {
      "id": "CIR-465",
      "q": "Un paciente presenta dolor en fosa ilíaca izquierda, fiebre y cambios del hábito intestinal. ¿Qué diagnóstico debe considerarse?",
      "ops": [
        "Diverticulitis aguda",
        "Colecistitis",
        "Apendicitis típica",
        "Pancreatitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-466",
      "q": "La diverticulitis afecta con mayor frecuencia:",
      "ops": [
        "Colon sigmoide",
        "Esófago",
        "Estómago",
        "Duodeno"
      ],
      "c": 0
    },
    {
      "id": "CIR-467",
      "q": "Una complicación de diverticulitis es:",
      "ops": [
        "Absceso intraabdominal",
        "Hipertiroidismo",
        "Catarata",
        "Neumonía"
      ],
      "c": 0
    },
    {
      "id": "CIR-468",
      "q": "Un paciente presenta dolor abdominal intenso, distensión, vómitos y ausencia de eliminación de gases. ¿Qué síndrome debe sospecharse?",
      "ops": [
        "Obstrucción intestinal",
        "Gastritis",
        "Hepatitis",
        "Cistitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-469",
      "q": "En una obstrucción intestinal, un hallazgo frecuente es:",
      "ops": [
        "Distensión abdominal",
        "Bradicardia extrema obligatoria",
        "Ictericia",
        "Hemoptisis"
      ],
      "c": 0
    },
    {
      "id": "CIR-470",
      "q": "Una causa frecuente de obstrucción del intestino delgado en pacientes con cirugía abdominal previa es:",
      "ops": [
        "Adherencias",
        "Hepatitis",
        "Colelitiasis",
        "Pancreatitis crónica"
      ],
      "c": 0
    },
    {
      "id": "CIR-471",
      "q": "Una hernia incarcerada es aquella que:",
      "ops": [
        "No puede reducirse",
        "Siempre está estrangulada",
        "No contiene intestino",
        "Siempre es indolora"
      ],
      "c": 0
    },
    {
      "id": "CIR-472",
      "q": "Una hernia estrangulada se caracteriza por:",
      "ops": [
        "Compromiso del flujo sanguíneo del contenido herniario",
        "Ausencia completa de dolor",
        "Reducción espontánea siempre",
        "Solo defecto estético"
      ],
      "c": 0
    },
    {
      "id": "CIR-473",
      "q": "Una hernia dolorosa, irreductible, con signos de isquemia intestinal requiere:",
      "ops": [
        "Evaluación quirúrgica urgente",
        "Observación durante semanas",
        "Antibióticos exclusivamente",
        "Alta inmediata"
      ],
      "c": 0
    },
    {
      "id": "CIR-474",
      "q": "El abdomen agudo con rigidez involuntaria y rebote puede indicar:",
      "ops": [
        "Peritonitis",
        "Migraña",
        "Cistitis",
        "Rinitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-475",
      "q": "Una causa frecuente de peritonitis secundaria es:",
      "ops": [
        "Perforación de una víscera hueca",
        "Hipertensión",
        "Diabetes aislada",
        "Anemia"
      ],
      "c": 0
    },
    {
      "id": "CIR-476",
      "q": "Un paciente con perforación intestinal puede presentar:",
      "ops": [
        "Neumoperitoneo",
        "Hipoglucemia aislada",
        "Bradicardia obligatoria",
        "Edema cerebral"
      ],
      "c": 0
    },
    {
      "id": "CIR-477",
      "q": "La presencia de aire libre subdiafragmático en una radiografía puede sugerir:",
      "ops": [
        "Perforación de víscera hueca",
        "Colecistitis simple",
        "Apendicitis no complicada",
        "Hernia umbilical"
      ],
      "c": 0
    },
    {
      "id": "CIR-478",
      "q": "La sepsis intraabdominal requiere:",
      "ops": [
        "Control del foco + antibióticos apropiados + reanimación cuando corresponda",
        "Solo analgésicos",
        "Solo reposo",
        "Solo dieta líquida"
      ],
      "c": 0
    },
    {
      "id": "CIR-479",
      "q": "El control de foco en una infección intraabdominal puede requerir:",
      "ops": [
        "Drenaje o cirugía",
        "Solo vitaminas",
        "Antihistamínicos",
        "Hierro oral"
      ],
      "c": 0
    },
    {
      "id": "CIR-480",
      "q": "En un paciente con abdomen agudo y shock, una prioridad inicial es:",
      "ops": [
        "Evaluación y estabilización ABCDE simultáneamente con búsqueda de la causa",
        "Esperar resultados durante 24 horas",
        "Dar alimentos",
        "Alta domiciliaria"
      ],
      "c": 0
    },
    {
      "id": "CIR-481",
      "q": "En un paciente politraumatizado, la evaluación inicial sigue el enfoque:",
      "ops": [
        "ABCDE",
        "SOAP exclusivamente",
        "Glasgow solamente",
        "APGAR"
      ],
      "c": 0
    },
    {
      "id": "CIR-482",
      "q": "En trauma, la letra A corresponde a:",
      "ops": [
        "Airway/vía aérea con protección cervical",
        "Abdomen",
        "Analgesia",
        "Arritmia"
      ],
      "c": 0
    },
    {
      "id": "CIR-483",
      "q": "La letra B corresponde a:",
      "ops": [
        "Breathing/respiración",
        "Blood pressure exclusivamente",
        "Brain",
        "Bowel"
      ],
      "c": 0
    },
    {
      "id": "CIR-484",
      "q": "La letra C corresponde principalmente a:",
      "ops": [
        "Circulación y control de hemorragia",
        "Cerebro",
        "Columna",
        "Costillas"
      ],
      "c": 0
    },
    {
      "id": "CIR-485",
      "q": "La letra D corresponde a:",
      "ops": [
        "Disability/evaluación neurológica",
        "Diuresis exclusivamente",
        "Dolor exclusivamente",
        "Diabetes"
      ],
      "c": 0
    },
    {
      "id": "CIR-486",
      "q": "La letra E corresponde a:",
      "ops": [
        "Exposure/exposición y prevención de hipotermia",
        "ECG exclusivamente",
        "Endoscopia",
        "Ecografía"
      ],
      "c": 0
    },
    {
      "id": "CIR-487",
      "q": "En trauma grave, una causa potencialmente prevenible de muerte es:",
      "ops": [
        "Hemorragia masiva",
        "Miopía",
        "Dermatitis",
        "Rinitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-488",
      "q": "Un paciente traumatizado con hemorragia externa masiva requiere:",
      "ops": [
        "Control inmediato de la hemorragia",
        "Esperar laboratorio",
        "Solo analgesia",
        "Solo radiografía"
      ],
      "c": 0
    },
    {
      "id": "CIR-489",
      "q": "El torniquete está indicado principalmente:",
      "ops": [
        "En hemorragia externa grave de extremidad que no se controla adecuadamente con medidas iniciales",
        "En toda herida superficial",
        "En cefalea",
        "En fracturas cerradas sin sangrado"
      ],
      "c": 0
    },
    {
      "id": "CIR-490",
      "q": "Un paciente con trauma torácico presenta hipotensión, distensión yugular, ausencia unilateral de ruidos respiratorios y desviación traqueal. ¿Qué debe sospecharse?",
      "ops": [
        "Neumotórax a tensión",
        "Neumonía",
        "Derrame pleural crónico",
        "Asma"
      ],
      "c": 0
    },
    {
      "id": "CIR-491",
      "q": "El neumotórax a tensión es:",
      "ops": [
        "Una emergencia potencialmente mortal",
        "Una enfermedad crónica estable",
        "Una lesión sin importancia",
        "Una infección viral"
      ],
      "c": 0
    },
    {
      "id": "CIR-492",
      "q": "En un neumotórax a tensión con inestabilidad, la descompresión debe:",
      "ops": [
        "Realizarse inmediatamente según protocolo, sin esperar necesariamente una radiografía",
        "Esperar siempre a TC",
        "Esperar 24 horas",
        "Realizarse solo después del alta"
      ],
      "c": 0
    },
    {
      "id": "CIR-493",
      "q": "Un paciente presenta trauma torácico, hipotensión y ruidos cardíacos apagados. ¿Qué debe considerarse?",
      "ops": [
        "Taponamiento cardíaco",
        "Neumonía",
        "Asma",
        "Embolia séptica"
      ],
      "c": 0
    },
    {
      "id": "CIR-494",
      "q": "La tríada de Beck incluye:",
      "ops": [
        "Hipotensión, distensión yugular y ruidos cardíacos apagados",
        "Fiebre, tos y expectoración",
        "Dolor, vómitos y diarrea",
        "Hipertensión, bradicardia y fiebre"
      ],
      "c": 0
    },
    {
      "id": "CIR-495",
      "q": "El examen FAST en trauma busca principalmente:",
      "ops": [
        "Líquido libre en cavidades específicas",
        "Fracturas de cráneo",
        "Lesiones musculares menores",
        "Diabetes"
      ],
      "c": 0
    },
    {
      "id": "CIR-496",
      "q": "El eFAST amplía el examen FAST para evaluar también:",
      "ops": [
        "Neumotórax y hemotórax",
        "Tiroides",
        "Retina",
        "Próstata"
      ],
      "c": 0
    },
    {
      "id": "CIR-497",
      "q": "En trauma abdominal cerrado, un paciente inestable con líquido libre significativo puede requerir:",
      "ops": [
        "Control quirúrgico urgente según contexto",
        "Alta",
        "Colonoscopia ambulatoria",
        "Solo dieta"
      ],
      "c": 0
    },
    {
      "id": "CIR-498",
      "q": "La fractura pélvica inestable puede causar:",
      "ops": [
        "Hemorragia interna potencialmente masiva",
        "Hipoglucemia",
        "Neumonía",
        "Candidiasis"
      ],
      "c": 0
    },
    {
      "id": "CIR-499",
      "q": "En sospecha de fractura pélvica inestable, una medida inicial puede ser:",
      "ops": [
        "Estabilización pélvica apropiada",
        "Repetir múltiples maniobras de compresión pélvica",
        "Hacer caminar al paciente",
        "Alta"
      ],
      "c": 0
    },
    {
      "id": "CIR-500",
      "q": "Un paciente con trauma craneoencefálico presenta disminución progresiva del nivel de conciencia. Esto:",
      "ops": [
        "Requiere reevaluación urgente y búsqueda de lesión intracraneal",
        "Es siempre normal",
        "No requiere vigilancia",
        "Se trata únicamente con analgésicos"
      ],
      "c": 0
    },
    {
      "id": "CIR-501",
      "q": "La escala de Glasgow evalúa:",
      "ops": [
        "Apertura ocular, respuesta verbal y respuesta motora",
        "Presión, pulso y temperatura",
        "Dolor, fiebre y glucosa",
        "Pupilas exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "CIR-502",
      "q": "Una puntuación de Glasgow de 8 o menos indica:",
      "ops": [
        "Alteración grave de conciencia y necesidad de valoración de vía aérea",
        "Estado neurológico normal",
        "Ansiedad leve",
        "Hipertensión"
      ],
      "c": 0
    },
    {
      "id": "CIR-503",
      "q": "La anisocoria nueva después de trauma craneal puede indicar:",
      "ops": [
        "Compresión neurológica potencialmente grave",
        "Hallazgo siempre benigno",
        "Hipoglucemia obligatoria",
        "Deshidratación leve"
      ],
      "c": 0
    },
    {
      "id": "CIR-504",
      "q": "Una lesión penetrante de tórax con herida que succiona aire puede requerir:",
      "ops": [
        "Sellado apropiado de la herida y evaluación inmediata",
        "Solo antibiótico oral",
        "Alta",
        "Masaje cardíaco siempre"
      ],
      "c": 0
    },
    {
      "id": "CIR-505",
      "q": "En trauma, la hipotermia:",
      "ops": [
        "Puede empeorar la coagulopatía y la evolución del paciente",
        "Siempre protege al paciente",
        "No tiene relevancia",
        "Solo aparece en niños"
      ],
      "c": 0
    },
    {
      "id": "CIR-506",
      "q": "La denominada tríada letal del trauma incluye:",
      "ops": [
        "Hipotermia, acidosis y coagulopatía",
        "Fiebre, hipertensión y alcalosis",
        "Hipoglucemia, anemia y fiebre",
        "Hipertensión, hipercalcemia y fiebre"
      ],
      "c": 0
    },
    {
      "id": "CIR-507",
      "q": "La reanimación moderna del paciente con hemorragia grave busca:",
      "ops": [
        "Control precoz del sangrado y reanimación hemostática apropiada",
        "Administrar grandes volúmenes de cristaloides indiscriminadamente",
        "Evitar sangre siempre",
        "Esperar la normalización espontánea de la presión"
      ],
      "c": 0
    },
    {
      "id": "CIR-508",
      "q": "En un paciente con hemorragia traumática grave, el ácido tranexámico puede:",
      "ops": [
        "Considerarse cuando está indicado y se administra tempranamente",
        "Sustituir siempre la cirugía",
        "Reemplazar todos los hemoderivados",
        "Ser utilizado únicamente en hipertensión"
      ],
      "c": 0
    },
    {
      "id": "CIR-509",
      "q": "Una lesión vascular traumática puede manifestarse con:",
      "ops": [
        "Hemorragia pulsátil o hematoma expansivo",
        "Tos crónica",
        "Ictericia",
        "Diarrea"
      ],
      "c": 0
    },
    {
      "id": "CIR-510",
      "q": "El objetivo fundamental del manejo inicial del trauma es:",
      "ops": [
        "Identificar y tratar rápidamente amenazas vitales",
        "Completar primero todos los estudios secundarios",
        "Obtener una historia clínica extensa antes de intervenir",
        "Esperar laboratorio antes de tratar hemorragias visibles"
      ],
      "c": 0
    },
    {
      "id": "CIR-511",
      "q": "El cáncer colorrectal puede manifestarse con:",
      "ops": [
        "Cambio persistente del hábito intestinal y/o sangrado rectal",
        "Solo tos",
        "Solo fiebre",
        "Solo disuria"
      ],
      "c": 0
    },
    {
      "id": "CIR-512",
      "q": "Un factor de riesgo importante para cáncer colorrectal es:",
      "ops": [
        "Edad avanzada",
        "Miopía",
        "Otitis",
        "Rinitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-513",
      "q": "El estudio que permite visualizar directamente la mucosa colónica y obtener biopsias es:",
      "ops": [
        "Colonoscopia",
        "Ecocardiograma",
        "Espirometría",
        "EEG"
      ],
      "c": 0
    },
    {
      "id": "CIR-514",
      "q": "Un paciente presenta obstrucción intestinal y una masa de colon. Una complicación posible es:",
      "ops": [
        "Perforación",
        "Hipotiroidismo",
        "Asma",
        "Cistitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-515",
      "q": "El cáncer gástrico puede asociarse con:",
      "ops": [
        "Pérdida de peso, anemia y síntomas digestivos",
        "Hipertensión aislada",
        "Otitis",
        "Catarata"
      ],
      "c": 0
    },
    {
      "id": "CIR-516",
      "q": "La endoscopia digestiva alta permite:",
      "ops": [
        "Visualizar esófago, estómago y duodeno proximal y obtener biopsias",
        "Evaluar exclusivamente colon",
        "Diagnosticar fracturas",
        "Evaluar pulmones"
      ],
      "c": 0
    },
    {
      "id": "CIR-517",
      "q": "Una úlcera péptica perforada puede producir:",
      "ops": [
        "Peritonitis",
        "Hipoglucemia aislada",
        "Neumonía",
        "Artritis"
      ],
      "c": 0
    },
    {
      "id": "CIR-518",
      "q": "Un paciente con perforación de úlcera péptica puede presentar:",
      "ops": [
        "Dolor abdominal súbito intenso y abdomen rígido",
        "Solo prurito",
        "Tos",
        "Edema de miembros inferiores aislado"
      ],
      "c": 0
    },
    {
      "id": "CIR-519",
      "q": "Una causa importante de enfermedad ulcerosa péptica es:",
      "ops": [
        "Helicobacter pylori",
        "Candida exclusivamente",
        "VPH",
        "Influenza"
      ],
      "c": 0
    },
    {
      "id": "CIR-520",
      "q": "Los AINEs aumentan el riesgo de:",
      "ops": [
        "Úlcera y sangrado gastrointestinal",
        "Cataratas",
        "Hipotiroidismo",
        "Otitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-521",
      "q": "La hemorragia digestiva alta puede manifestarse con:",
      "ops": [
        "Hematemesis y/o melena",
        "Hematuria",
        "Epistaxis únicamente",
        "Hemoptisis"
      ],
      "c": 0
    },
    {
      "id": "CIR-522",
      "q": "La melena suele corresponder a:",
      "ops": [
        "Sangrado digestivo alto o proximal, aunque existen excepciones",
        "Sangrado urinario",
        "Sangrado pulmonar",
        "Sangrado cerebral"
      ],
      "c": 0
    },
    {
      "id": "CIR-523",
      "q": "Un paciente con hemorragia digestiva masiva y shock requiere inicialmente:",
      "ops": [
        "Reanimación hemodinámica y control de la hemorragia",
        "Alta",
        "Dieta libre",
        "Solo antiácidos"
      ],
      "c": 0
    },
    {
      "id": "CIR-524",
      "q": "Una complicación de la enfermedad diverticular es:",
      "ops": [
        "Fístula",
        "Hipotiroidismo",
        "Asma",
        "Anemia perniciosa obligatoria"
      ],
      "c": 0
    },
    {
      "id": "CIR-525",
      "q": "La enfermedad de Crohn puede producir:",
      "ops": [
        "Fístulas y estenosis intestinales",
        "Solo gastritis",
        "Hipertensión",
        "Cataratas"
      ],
      "c": 0
    },
    {
      "id": "CIR-526",
      "q": "La colitis ulcerosa afecta principalmente:",
      "ops": [
        "Colon y recto",
        "Esófago exclusivamente",
        "Hígado",
        "Vesícula"
      ],
      "c": 0
    },
    {
      "id": "CIR-527",
      "q": "Una complicación grave de colitis ulcerosa es:",
      "ops": [
        "Megacolon tóxico",
        "Hipotiroidismo",
        "Neumotórax",
        "Hernia inguinal"
      ],
      "c": 0
    },
    {
      "id": "CIR-528",
      "q": "Un paciente con megacolon tóxico presenta:",
      "ops": [
        "Distensión colónica importante y toxicidad sistémica",
        "Solo estreñimiento leve",
        "Hipertensión aislada",
        "Candidiasis"
      ],
      "c": 0
    },
    {
      "id": "CIR-529",
      "q": "La obstrucción intestinal puede clasificarse como:",
      "ops": [
        "Mecánica o funcional",
        "Solo infecciosa",
        "Solo vascular",
        "Solo endocrina"
      ],
      "c": 0
    },
    {
      "id": "CIR-530",
      "q": "El íleo paralítico se caracteriza por:",
      "ops": [
        "Alteración de la motilidad intestinal sin una obstrucción mecánica primaria",
        "Hernia estrangulada obligatoria",
        "Tumor gástrico obligatorio",
        "Apendicitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-531",
      "q": "Un paciente con obstrucción intestinal presenta vómitos persistentes. Una complicación es:",
      "ops": [
        "Deshidratación y alteraciones electrolíticas",
        "Hipotiroidismo",
        "Ceguera",
        "Dermatitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-532",
      "q": "En una obstrucción intestinal, la TC puede ayudar a:",
      "ops": [
        "Determinar el sitio, causa y complicaciones",
        "Diagnosticar exclusivamente diabetes",
        "Evaluar audición",
        "Medir presión intraocular"
      ],
      "c": 0
    },
    {
      "id": "CIR-533",
      "q": "Una hernia inguinal indirecta pasa:",
      "ops": [
        "Por el anillo inguinal profundo y puede atravesar el conducto inguinal",
        "Por el hiato esofágico",
        "Por el ombligo exclusivamente",
        "Por el diafragma"
      ],
      "c": 0
    },
    {
      "id": "CIR-534",
      "q": "Una hernia femoral tiene mayor riesgo de:",
      "ops": [
        "Incarceración y estrangulación",
        "Hipertensión",
        "Diabetes",
        "Neumonía"
      ],
      "c": 0
    },
    {
      "id": "CIR-535",
      "q": "Una hernia umbilical se localiza:",
      "ops": [
        "En la región umbilical",
        "En el tórax",
        "En el cuello",
        "En la región poplítea"
      ],
      "c": 0
    },
    {
      "id": "CIR-536",
      "q": "Una masa abdominal pulsátil debe hacer sospechar:",
      "ops": [
        "Aneurisma de aorta abdominal",
        "Hernia umbilical siempre",
        "Apendicitis",
        "Colecistitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-537",
      "q": "El aneurisma de aorta abdominal roto puede producir:",
      "ops": [
        "Dolor abdominal/lumbar, hipotensión y shock",
        "Solo fiebre",
        "Tos",
        "Diarrea leve"
      ],
      "c": 0
    },
    {
      "id": "CIR-538",
      "q": "La rotura de aneurisma de aorta abdominal es:",
      "ops": [
        "Emergencia quirúrgica/vascular",
        "Enfermedad ambulatoria",
        "Patología exclusivamente dermatológica",
        "Situación fisiológica"
      ],
      "c": 0
    },
    {
      "id": "CIR-539",
      "q": "La isquemia mesentérica aguda puede manifestarse inicialmente con:",
      "ops": [
        "Dolor abdominal intenso desproporcionado respecto al examen físico",
        "Solo ictericia",
        "Tos",
        "Hematuria"
      ],
      "c": 0
    },
    {
      "id": "CIR-540",
      "q": "Una complicación de la isquemia mesentérica es:",
      "ops": [
        "Necrosis intestinal y perforación",
        "Hipotiroidismo",
        "Otitis",
        "Catarata"
      ],
      "c": 0
    },
    {
      "id": "CIR-541",
      "q": "La coledocolitiasis corresponde a:",
      "ops": [
        "Cálculos en el conducto colédoco",
        "Cálculos exclusivamente renales",
        "Cálculos en colon",
        "Cálculos vesicales"
      ],
      "c": 0
    },
    {
      "id": "CIR-542",
      "q": "La coledocolitiasis puede producir:",
      "ops": [
        "Ictericia obstructiva",
        "Hipoglucemia",
        "Hipotensión obligatoria",
        "Anemia hemolítica siempre"
      ],
      "c": 0
    },
    {
      "id": "CIR-543",
      "q": "La colangitis aguda se asocia frecuentemente con:",
      "ops": [
        "Obstrucción e infección de la vía biliar",
        "Inflamación aislada de la piel",
        "Cistitis",
        "Neumonía"
      ],
      "c": 0
    },
    {
      "id": "CIR-544",
      "q": "La tríada de Charcot incluye:",
      "ops": [
        "Fiebre, ictericia y dolor en hipocondrio derecho",
        "Tos, fiebre y disnea",
        "Dolor, diarrea y vómitos",
        "Hipotensión, bradicardia y fiebre"
      ],
      "c": 0
    },
    {
      "id": "CIR-545",
      "q": "La pentada de Reynolds agrega a la tríada de Charcot:",
      "ops": [
        "Hipotensión y alteración del estado mental",
        "Hiperglucemia y anemia",
        "Tos y disnea",
        "Dolor torácico"
      ],
      "c": 0
    },
    {
      "id": "CIR-546",
      "q": "Una complicación grave de colangitis es:",
      "ops": [
        "Sepsis",
        "Catarata",
        "Hipotiroidismo",
        "Dermatitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-547",
      "q": "En colangitis con obstrucción biliar significativa, además de antibióticos puede requerirse:",
      "ops": [
        "Drenaje biliar",
        "Solo analgesia",
        "Colonoscopia",
        "Mamografía"
      ],
      "c": 0
    },
    {
      "id": "CIR-548",
      "q": "La CPRE puede utilizarse para:",
      "ops": [
        "Diagnóstico terapéutico y tratamiento de determinadas patologías de la vía biliar y pancreática",
        "Evaluar exclusivamente colon",
        "Diagnosticar fracturas",
        "Tratar neumotórax"
      ],
      "c": 0
    },
    {
      "id": "CIR-549",
      "q": "Una complicación de la CPRE es:",
      "ops": [
        "Pancreatitis post-CPRE",
        "Catarata",
        "Hipotiroidismo",
        "Apendicitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-550",
      "q": "El carcinoma de cabeza de páncreas puede producir:",
      "ops": [
        "Ictericia obstructiva",
        "Hematuria",
        "Otitis",
        "Neumotórax"
      ],
      "c": 0
    },
    {
      "id": "CIR-551",
      "q": "Una característica del cáncer de cabeza pancreática puede ser:",
      "ops": [
        "Ictericia progresiva con dilatación de la vía biliar",
        "Tos productiva",
        "Hemoptisis",
        "Dolor de rodilla"
      ],
      "c": 0
    },
    {
      "id": "CIR-552",
      "q": "La pancreatitis necrotizante se caracteriza por:",
      "ops": [
        "Necrosis del tejido pancreático y/o peripancreático",
        "Inflamación exclusiva de la piel",
        "Cálculos renales",
        "Hernia inguinal"
      ],
      "c": 0
    },
    {
      "id": "CIR-553",
      "q": "Una complicación tardía de pancreatitis puede ser:",
      "ops": [
        "Pseudoquiste pancreático",
        "Cistitis",
        "Hipotiroidismo",
        "Hernia femoral"
      ],
      "c": 0
    },
    {
      "id": "CIR-554",
      "q": "Un pseudoquiste pancreático es:",
      "ops": [
        "Colección encapsulada rica en líquido pancreático que aparece después de pancreatitis, habitualmente tras evolución suficiente para formar pared",
        "Tumor maligno obligatorio",
        "Cálculo biliar",
        "Absceso renal"
      ],
      "c": 0
    },
    {
      "id": "CIR-555",
      "q": "Una indicación de intervención sobre un pseudoquiste depende de:",
      "ops": [
        "Síntomas, complicaciones, tamaño/contexto y evolución",
        "Solo del sexo",
        "Solo de la edad",
        "Siempre debe operarse inmediatamente"
      ],
      "c": 0
    },
    {
      "id": "CIR-556",
      "q": "La hipertensión portal puede producir:",
      "ops": [
        "Várices esofagogástricas",
        "Neumotórax",
        "Apendicitis",
        "Hernia femoral obligatoria"
      ],
      "c": 0
    },
    {
      "id": "CIR-557",
      "q": "Una complicación potencialmente mortal de las várices esofágicas es:",
      "ops": [
        "Hemorragia digestiva masiva",
        "Hipoglucemia",
        "Otitis",
        "Catarata"
      ],
      "c": 0
    },
    {
      "id": "CIR-558",
      "q": "Un paciente cirrótico con hematemesis masiva requiere:",
      "ops": [
        "Reanimación y tratamiento urgente de hemorragia variceal según protocolo",
        "Alta",
        "Solo hierro oral",
        "Esperar espontáneamente"
      ],
      "c": 0
    },
    {
      "id": "CIR-559",
      "q": "La ascitis refractaria puede requerir:",
      "ops": [
        "Evaluación especializada y procedimientos como paracentesis o TIPS en pacientes seleccionados",
        "Solo dieta libre de sodio sin evaluación",
        "Antibiótico siempre",
        "Cirugía de colon"
      ],
      "c": 0
    },
    {
      "id": "CIR-560",
      "q": "El carcinoma hepatocelular se asocia frecuentemente con:",
      "ops": [
        "Cirrosis y enfermedad hepática crónica",
        "Cistitis",
        "Asma",
        "Hernia"
      ],
      "c": 0
    },
    {
      "id": "CIR-561",
      "q": "Una herramienta utilizada en vigilancia de carcinoma hepatocelular en pacientes de riesgo es:",
      "ops": [
        "Ecografía hepática",
        "Radiografía de mano",
        "ECG",
        "Espirometría"
      ],
      "c": 0
    },
    {
      "id": "CIR-562",
      "q": "La colecistectomía laparoscópica es:",
      "ops": [
        "Tratamiento quirúrgico habitual de la colelitiasis sintomática y colecistitis aguda en pacientes apropiados",
        "Tratamiento de apendicitis",
        "Tratamiento de hernia cerebral",
        "Tratamiento de pancreatitis alcohólica siempre"
      ],
      "c": 0
    },
    {
      "id": "CIR-563",
      "q": "Una complicación de la colecistectomía puede ser:",
      "ops": [
        "Lesión de la vía biliar",
        "Hipotiroidismo",
        "Cistitis obligatoria",
        "Neumonía obligatoria"
      ],
      "c": 0
    },
    {
      "id": "CIR-564",
      "q": "La identificación de la anatomía biliar antes de la sección durante colecistectomía es importante para:",
      "ops": [
        "Reducir el riesgo de lesión de la vía biliar",
        "Aumentar el sangrado",
        "Evitar la anestesia",
        "Diagnosticar diabetes"
      ],
      "c": 0
    },
    {
      "id": "CIR-565",
      "q": "La colangitis esclerosante primaria se relaciona con:",
      "ops": [
        "Enfermedad inflamatoria y estenosis de los conductos biliares",
        "Apendicitis",
        "Hernia inguinal",
        "Pancreatitis exclusivamente alcohólica"
      ],
      "c": 0
    },
    {
      "id": "CIR-566",
      "q": "El nódulo tiroideo debe evaluarse inicialmente con:",
      "ops": [
        "Historia clínica, examen físico y TSH, complementados con ecografía según el caso",
        "Colonoscopia",
        "ECG exclusivamente",
        "Radiografía de pelvis"
      ],
      "c": 0
    },
    {
      "id": "CIR-567",
      "q": "Una característica ecográfica sospechosa de malignidad tiroidea puede ser:",
      "ops": [
        "Microcalcificaciones y márgenes irregulares, entre otros hallazgos",
        "Quiste simple anecoico exclusivamente",
        "Ausencia de vascularización siempre",
        "Tamaño pequeño siempre"
      ],
      "c": 0
    },
    {
      "id": "CIR-568",
      "q": "La PAAF de un nódulo tiroideo sirve para:",
      "ops": [
        "Evaluación citológica",
        "Medir glucemia",
        "Evaluar función hepática",
        "Diagnosticar pancreatitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-569",
      "q": "El carcinoma papilar de tiroides suele diseminarse inicialmente por:",
      "ops": [
        "Vía linfática",
        "Vía fecal",
        "Vía urinaria",
        "Vía biliar"
      ],
      "c": 0
    },
    {
      "id": "CIR-570",
      "q": "El hiperparatiroidismo primario suele asociarse con:",
      "ops": [
        "Hipercalcemia",
        "Hipoglucemia",
        "Hiponatremia obligatoria",
        "Hipopotasemia obligatoria"
      ],
      "c": 0
    },
    {
      "id": "CIR-571",
      "q": "Una manifestación del hiperparatiroidismo puede ser:",
      "ops": [
        "Litiasis renal",
        "Neumonía",
        "Otitis",
        "Cistitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-572",
      "q": "Una lesión de piel que cambia de tamaño, forma o color debe:",
      "ops": [
        "Evaluarse para descartar melanoma u otra neoplasia cutánea",
        "Considerarse siempre benigna",
        "Cubrirse sin evaluación",
        "Tratarse con antibióticos"
      ],
      "c": 0
    },
    {
      "id": "CIR-573",
      "q": "El melanoma se origina en:",
      "ops": [
        "Melanocitos",
        "Osteocitos",
        "Hepatocitos",
        "Neuronas"
      ],
      "c": 0
    },
    {
      "id": "CIR-574",
      "q": "En una herida quirúrgica, una infección del sitio operatorio puede manifestarse con:",
      "ops": [
        "Eritema, calor, dolor, secreción purulenta y/o fiebre",
        "Solo prurito",
        "Hipoglucemia",
        "Bradicardia"
      ],
      "c": 0
    },
    {
      "id": "CIR-575",
      "q": "Un principio fundamental del manejo de heridas es:",
      "ops": [
        "Evaluar perfusión, contaminación, tejido desvitalizado e infección",
        "Suturar siempre inmediatamente",
        "Evitar limpiar la herida",
        "Aplicar antibiótico oral siempre"
      ],
      "c": 0
    },
    {
      "id": "CIR-576",
      "q": "Una herida contaminada con tejido necrótico puede requerir:",
      "ops": [
        "Desbridamiento",
        "Solo analgesia",
        "Inmovilización obligatoria",
        "Alta sin tratamiento"
      ],
      "c": 0
    },
    {
      "id": "CIR-577",
      "q": "Una infección necrotizante de tejidos blandos se caracteriza por:",
      "ops": [
        "Progresión rápida y compromiso sistémico potencialmente grave",
        "Evolución siempre lenta",
        "Ausencia completa de dolor",
        "Solo eritema superficial"
      ],
      "c": 0
    },
    {
      "id": "CIR-578",
      "q": "El tratamiento fundamental de una fascitis necrotizante incluye:",
      "ops": [
        "Desbridamiento quirúrgico urgente + antibióticos apropiados + soporte",
        "Solo antibióticos orales",
        "Solo reposo",
        "Corticoides exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "CIR-579",
      "q": "El dolor desproporcionado al examen físico puede ser una señal de:",
      "ops": [
        "Infección necrotizante de tejidos blandos",
        "Cistitis simple",
        "Rinitis",
        "Migraña"
      ],
      "c": 0
    },
    {
      "id": "CIR-580",
      "q": "Una quemadura de espesor parcial compromete:",
      "ops": [
        "Epidermis y parte de la dermis",
        "Solo epidermis siempre",
        "Solo músculo",
        "Hueso exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "CIR-581",
      "q": "Una quemadura de espesor total afecta:",
      "ops": [
        "Todo el espesor de la piel",
        "Solo epidermis",
        "Solo tejido subcutáneo",
        "Solo músculo"
      ],
      "c": 0
    },
    {
      "id": "CIR-582",
      "q": "Una quemadura extensa puede producir:",
      "ops": [
        "Pérdida importante de líquidos y shock",
        "Hipertensión permanente",
        "Hipoglucemia siempre",
        "Hipotiroidismo"
      ],
      "c": 0
    },
    {
      "id": "CIR-583",
      "q": "Una quemadura facial con signos de lesión inhalatoria requiere:",
      "ops": [
        "Evaluación precoz de la vía aérea",
        "Alta inmediata",
        "Solo crema tópica",
        "Esperar a que aparezca obstrucción completa"
      ],
      "c": 0
    },
    {
      "id": "CIR-584",
      "q": "En quemaduras eléctricas debe considerarse especialmente:",
      "ops": [
        "Lesión profunda y alteraciones cardíacas",
        "Solo lesión cutánea superficial",
        "Solo fiebre",
        "Solo deshidratación"
      ],
      "c": 0
    },
    {
      "id": "CIR-585",
      "q": "Una complicación de heridas quirúrgicas es:",
      "ops": [
        "Dehiscencia",
        "Hipotiroidismo",
        "Catarata",
        "Migraña"
      ],
      "c": 0
    },
    {
      "id": "CIR-586",
      "q": "Un paciente presenta dolor lumbar intenso irradiado a la ingle y hematuria. ¿Qué diagnóstico es probable?",
      "ops": [
        "Cólico renal por litiasis",
        "Colecistitis",
        "Apendicitis",
        "Pancreatitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-587",
      "q": "El estudio inicial en muchos pacientes con sospecha de litiasis urinaria depende de:",
      "ops": [
        "Contexto clínico, embarazo, disponibilidad y características del paciente",
        "Solo edad",
        "Solo sexo",
        "Solo presión arterial"
      ],
      "c": 0
    },
    {
      "id": "CIR-588",
      "q": "Una litiasis ureteral asociada a fiebre, obstrucción e infección urinaria constituye:",
      "ops": [
        "Emergencia urológica que puede requerir drenaje urgente",
        "Situación siempre ambulatoria",
        "Enfermedad dermatológica",
        "Patología ginecológica"
      ],
      "c": 0
    },
    {
      "id": "CIR-589",
      "q": "Un paciente presenta fiebre, dolor lumbar, obstrucción urinaria e hipotensión. ¿Qué debe sospecharse?",
      "ops": [
        "Sepsis urinaria obstructiva",
        "Cistitis simple",
        "Litiasis asintomática",
        "Hernia inguinal"
      ],
      "c": 0
    },
    {
      "id": "CIR-590",
      "q": "La torsión testicular se presenta típicamente con:",
      "ops": [
        "Dolor testicular súbito intenso",
        "Dolor crónico leve siempre",
        "Hematuria aislada",
        "Ictericia"
      ],
      "c": 0
    },
    {
      "id": "CIR-591",
      "q": "La torsión testicular es:",
      "ops": [
        "Emergencia urológica",
        "Enfermedad ambulatoria sin urgencia",
        "Infección viral",
        "Patología dermatológica"
      ],
      "c": 0
    },
    {
      "id": "CIR-592",
      "q": "En torsión testicular, el objetivo es:",
      "ops": [
        "Restaurar el flujo sanguíneo lo antes posible",
        "Esperar varios días",
        "Administrar únicamente antibióticos",
        "Realizar fisioterapia"
      ],
      "c": 0
    },
    {
      "id": "CIR-593",
      "q": "Un paciente presenta dolor escrotal, fiebre y síntomas urinarios de evolución gradual. ¿Qué diagnóstico puede considerarse?",
      "ops": [
        "Epididimo-orquitis",
        "Torsión obligatoria",
        "Hernia cerebral",
        "Pancreatitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-594",
      "q": "Una complicación del cáncer de próstata avanzado puede ser:",
      "ops": [
        "Obstrucción urinaria y metástasis óseas",
        "Neumonía obligatoria",
        "Hipoglucemia",
        "Colecistitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-595",
      "q": "El PSA es:",
      "ops": [
        "Antígeno prostático específico",
        "Antígeno pulmonar específico",
        "Proteína sérica pancreática",
        "Hormona tiroidea"
      ],
      "c": 0
    },
    {
      "id": "CIR-596",
      "q": "La hiperplasia prostática benigna puede producir:",
      "ops": [
        "Síntomas urinarios del tracto inferior",
        "Hemoptisis",
        "Ictericia",
        "Dolor torácico"
      ],
      "c": 0
    },
    {
      "id": "CIR-597",
      "q": "Una complicación de la obstrucción urinaria por hiperplasia prostática es:",
      "ops": [
        "Retención urinaria aguda",
        "Neumonía",
        "Colecistitis",
        "Pancreatitis"
      ],
      "c": 0
    },
    {
      "id": "CIR-598",
      "q": "La retención urinaria aguda generalmente requiere:",
      "ops": [
        "Descompresión vesical, habitualmente mediante cateterización cuando está indicada",
        "Solo analgésicos",
        "Alta sin tratamiento",
        "Colonoscopia"
      ],
      "c": 0
    },
    {
      "id": "CIR-599",
      "q": "Una indicación clásica de cirugía urgente en urología es:",
      "ops": [
        "Torsión testicular",
        "Cistitis no complicada",
        "Litiasis renal asintomática",
        "Incontinencia leve"
      ],
      "c": 0
    },
    {
      "id": "CIR-600",
      "q": "Un principio fundamental en cirugía de urgencias es:",
      "ops": [
        "Reconocer rápidamente amenazas vitales, estabilizar al paciente y controlar la causa",
        "Esperar siempre todos los estudios antes de tratar",
        "Evitar la cirugía en todas las emergencias",
        "Tratar únicamente el dolor"
      ],
      "c": 0
    }
  ],
  "examen": [
    {
      "id": "601",
      "q": "Niño de 2 años con diarrea aguda, ojos hundidos, sed intensa, irritabilidad y llenado capilar de 3 segundos. ¿Cuál es la mejor clasificación clínica?",
      "ops": [
        "Sin deshidratación",
        "Deshidratación",
        "Shock cardiogénico",
        "Hipervolemia"
      ],
      "c": 1
    },
    {
      "id": "602",
      "q": "Lactante de 8 meses presenta tos, taquipnea y tiraje subcostal. ¿Qué hallazgo indica mayor gravedad?",
      "ops": [
        "Rinorrea",
        "Tos",
        "Hipoxemia",
        "Estornudos"
      ],
      "c": 2
    },
    {
      "id": "603",
      "q": "Niño de 4 años con fiebre, tos, taquipnea y crépitos focales. ¿Qué diagnóstico debe considerarse principalmente?",
      "ops": [
        "Neumonía",
        "Bronquiolitis",
        "Laringitis",
        "Sinusitis"
      ],
      "c": 0
    },
    {
      "id": "604",
      "q": "Lactante de 5 meses con primer episodio de sibilancias después de infección respiratoria viral, rinorrea y dificultad respiratoria. ¿Cuál es el diagnóstico más probable?",
      "ops": [
        "Bronquiolitis",
        "Asma persistente",
        "Neumotórax",
        "Epiglotitis"
      ],
      "c": 0
    },
    {
      "id": "605",
      "q": "Niño con estridor inspiratorio, tos perruna y disfonía, sin babeo. ¿Cuál es el diagnóstico?",
      "ops": [
        "Crup",
        "Epiglotitis",
        "Neumonía",
        "Asma"
      ],
      "c": 0
    },
    {
      "id": "606",
      "q": "Un niño con epiglotitis presenta típicamente:",
      "ops": [
        "Babeo, disfagia y posición de trípode",
        "Tos perruna exclusivamente",
        "Diarrea",
        "Dolor abdominal"
      ],
      "c": 0
    },
    {
      "id": "607",
      "q": "Niño de 6 años presenta fiebre, petequias, alteración del estado mental y rigidez cervical. ¿Qué diagnóstico debe sospecharse?",
      "ops": [
        "Meningitis bacteriana",
        "Migraña",
        "Gastroenteritis",
        "Otitis externa"
      ],
      "c": 0
    },
    {
      "id": "608",
      "q": "En una convulsión febril simple, la duración habitual es:",
      "ops": [
        "Menor de 15 minutos",
        "Más de 60 minutos",
        "Siempre superior a 30 minutos",
        "Siempre superior a 24 horas"
      ],
      "c": 0
    },
    {
      "id": "609",
      "q": "Lactante de 2 meses con fiebre de 38,5 °C. ¿Cuál es la conducta más apropiada?",
      "ops": [
        "Considerarlo de bajo riesgo automáticamente",
        "Evaluación médica urgente",
        "Dar únicamente antipirético y alta",
        "Esperar una semana"
      ],
      "c": 1
    },
    {
      "id": "610",
      "q": "Niño con vómitos, respiración profunda, deshidratación y glucemia de 420 mg/dL. ¿Qué cuadro debe sospecharse?",
      "ops": [
        "Cetoacidosis diabética",
        "Hipoglucemia",
        "Gastroenteritis simple",
        "Diabetes insípida"
      ],
      "c": 0
    },
    {
      "id": "611",
      "q": "En cetoacidosis diabética pediátrica, una complicación particularmente importante es:",
      "ops": [
        "Edema cerebral",
        "Catarata aguda",
        "Otitis",
        "Apendicitis"
      ],
      "c": 0
    },
    {
      "id": "612",
      "q": "Niño con púrpura palpable en extremidades inferiores, dolor abdominal y artralgias. ¿Qué diagnóstico es más probable?",
      "ops": [
        "Vasculitis por IgA",
        "Hemofilia",
        "Leucemia",
        "Meningitis"
      ],
      "c": 0
    },
    {
      "id": "613",
      "q": "Niño con edema periorbitario, proteinuria importante e hipoalbuminemia. ¿Qué síndrome presenta?",
      "ops": [
        "Síndrome nefrótico",
        "Síndrome nefrítico",
        "Insuficiencia hepática",
        "Diabetes insípida"
      ],
      "c": 0
    },
    {
      "id": "614",
      "q": "Hematuria, hipertensión y edema después de una infección faríngea sugieren:",
      "ops": [
        "Glomerulonefritis postestreptocócica",
        "Síndrome nefrótico",
        "Cistitis simple",
        "Litiasis renal"
      ],
      "c": 0
    },
    {
      "id": "615",
      "q": "Niño con palidez, petequias, fiebre y dolor óseo. Hemograma muestra anemia, trombocitopenia y blastos. ¿Diagnóstico?",
      "ops": [
        "Leucemia aguda",
        "Anemia ferropénica",
        "Púrpura trombocitopénica inmune aislada",
        "Hemofilia"
      ],
      "c": 0
    },
    {
      "id": "616",
      "q": "La anemia ferropénica suele presentar:",
      "ops": [
        "Microcitosis e hipocromía",
        "Macrocitosis",
        "Esferocitosis obligatoria",
        "Policitemia"
      ],
      "c": 0
    },
    {
      "id": "617",
      "q": "Niño con diarrea crónica, distensión abdominal y bajo peso. ¿Qué enfermedad debe considerarse?",
      "ops": [
        "Enfermedad celíaca",
        "Apendicitis",
        "Colecistitis",
        "Meningitis"
      ],
      "c": 0
    },
    {
      "id": "618",
      "q": "Recién nacido con vómitos biliosos y distensión abdominal. ¿Cuál es la prioridad?",
      "ops": [
        "Descartar obstrucción intestinal quirúrgica",
        "Alta",
        "Alimentación inmediata",
        "Antitusivos"
      ],
      "c": 0
    },
    {
      "id": "619",
      "q": "Lactante con vómitos proyectivos no biliosos y masa palpable en epigastrio. ¿Diagnóstico?",
      "ops": [
        "Estenosis hipertrófica del píloro",
        "Atresia duodenal",
        "Invaginación intestinal",
        "Apendicitis"
      ],
      "c": 0
    },
    {
      "id": "620",
      "q": "Lactante con dolor abdominal episódico, llanto intenso y deposiciones en “jalea de grosella”. ¿Diagnóstico?",
      "ops": [
        "Invaginación intestinal",
        "Gastroenteritis simple",
        "Hernia umbilical",
        "Pilorostenosis"
      ],
      "c": 0
    },
    {
      "id": "621",
      "q": "Niño con fiebre prolongada, conjuntivitis, lengua aframbuesada y adenopatía cervical. ¿Diagnóstico?",
      "ops": [
        "Enfermedad de Kawasaki",
        "Sarampión",
        "Escarlatina exclusivamente",
        "Rubéola"
      ],
      "c": 0
    },
    {
      "id": "622",
      "q": "Una complicación importante de la enfermedad de Kawasaki es:",
      "ops": [
        "Aneurisma coronario",
        "Apendicitis",
        "Neumotórax",
        "Cirrosis"
      ],
      "c": 0
    },
    {
      "id": "623",
      "q": "Niño con fiebre, tos, conjuntivitis y exantema que comienza en cara y progresa al cuerpo. ¿Diagnóstico?",
      "ops": [
        "Sarampión",
        "Varicela",
        "Escarlatina",
        "Rubéola"
      ],
      "c": 0
    },
    {
      "id": "624",
      "q": "Adolescente con dolor testicular súbito, testículo elevado y reflejo cremastérico ausente. ¿Conducta?",
      "ops": [
        "Evaluación urológica urgente por probable torsión testicular",
        "Antibiótico oral y control en una semana",
        "Alta",
        "Analgésico únicamente"
      ],
      "c": 0
    },
    {
      "id": "625",
      "q": "Niño con dificultad respiratoria grave y bradicardia progresiva durante deterioro respiratorio. Esto puede indicar:",
      "ops": [
        "Hipoxia grave",
        "Recuperación",
        "Ansiedad",
        "Hipertensión"
      ],
      "c": 0
    },
    {
      "id": "626",
      "q": "En paro cardíaco pediátrico, una causa frecuente es:",
      "ops": [
        "Insuficiencia respiratoria/hipoxia",
        "Infarto coronario aterosclerótico",
        "Hipertensión crónica",
        "Endocarditis siempre"
      ],
      "c": 0
    },
    {
      "id": "627",
      "q": "En reanimación pediátrica, la identificación y tratamiento de causas reversibles es:",
      "ops": [
        "Fundamental",
        "Opcional",
        "Contraindicado",
        "Solo para adultos"
      ],
      "c": 0
    },
    {
      "id": "628",
      "q": "Niño con anafilaxia después de ingerir alimento presenta dificultad respiratoria e hipotensión. Tratamiento de primera línea:",
      "ops": [
        "Adrenalina intramuscular",
        "Antihistamínico únicamente",
        "Corticoide únicamente",
        "Salbutamol únicamente"
      ],
      "c": 0
    },
    {
      "id": "629",
      "q": "La vía preferida para adrenalina en anafilaxia inicial es:",
      "ops": [
        "Intramuscular",
        "Oral",
        "Intradérmica",
        "Subcutánea"
      ],
      "c": 0
    },
    {
      "id": "630",
      "q": "Niño con intoxicación por monóxido de carbono puede presentar:",
      "ops": [
        "Cefalea, alteración neurológica y exposición a combustión",
        "Ictericia exclusivamente",
        "Hematuria",
        "Diarrea aislada"
      ],
      "c": 0
    },
    {
      "id": "631",
      "q": "La oximetría de pulso puede ser engañosa en intoxicación por:",
      "ops": [
        "Monóxido de carbono",
        "Hierro",
        "Paracetamol",
        "Insulina"
      ],
      "c": 0
    },
    {
      "id": "632",
      "q": "Un niño con quemadura extensa requiere prioritariamente:",
      "ops": [
        "Evaluación de vía aérea, respiración, circulación y extensión de quemadura",
        "Solo crema antibiótica",
        "Alta",
        "Analgesia exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "633",
      "q": "Niño politraumatizado con Glasgow 7. ¿Qué debe preocupar especialmente?",
      "ops": [
        "Protección de la vía aérea",
        "Gastritis",
        "Otitis",
        "Diarrea"
      ],
      "c": 0
    },
    {
      "id": "634",
      "q": "En trauma pediátrico, la hipotermia:",
      "ops": [
        "Debe prevenirse",
        "Es beneficiosa",
        "No tiene relevancia",
        "Solo aparece en adultos"
      ],
      "c": 0
    },
    {
      "id": "635",
      "q": "Adolescente con pérdida de peso, poliuria y polidipsia. Glucemia 280 mg/dL. ¿Qué debe sospecharse?",
      "ops": [
        "Diabetes mellitus",
        "Diabetes insípida exclusivamente",
        "Hipotiroidismo",
        "Síndrome nefrótico"
      ],
      "c": 0
    },
    {
      "id": "636",
      "q": "Niño con fiebre, dolor localizado en cuadrante inferior derecho, anorexia y leucocitosis. ¿Qué diagnóstico debe descartarse?",
      "ops": [
        "Apendicitis",
        "Bronquiolitis",
        "Meningitis",
        "Otitis"
      ],
      "c": 0
    },
    {
      "id": "637",
      "q": "La deshidratación grave pediátrica puede producir:",
      "ops": [
        "Shock hipovolémico",
        "Hipertensión obligatoria",
        "Policitemia permanente",
        "Bradicardia fisiológica"
      ],
      "c": 0
    },
    {
      "id": "638",
      "q": "Las guías AHA/AAP 2025 actualizan específicamente:",
      "ops": [
        "Soporte vital básico y avanzado pediátrico",
        "Solo cirugía pediátrica",
        "Solo vacunación",
        "Solo nutrición infantil"
      ],
      "c": 0
    },
    {
      "id": "639",
      "q": "Paciente con dolor torácico opresivo, irradiado a brazo izquierdo, diaforesis y elevación del ST. ¿Diagnóstico?",
      "ops": [
        "IAM con elevación del ST",
        "Pericarditis viral",
        "Neumonía",
        "Reflujo"
      ],
      "c": 0
    },
    {
      "id": "640",
      "q": "En síndrome coronario agudo, el ECG debe obtenerse:",
      "ops": [
        "Lo antes posible",
        "Después de 24 horas",
        "Solo si hay fiebre",
        "Después del alta"
      ],
      "c": 0
    },
    {
      "id": "641",
      "q": "Troponina elevada indica:",
      "ops": [
        "Lesión miocárdica, cuya causa debe determinarse clínicamente",
        "Exclusivamente infarto tipo 1",
        "Siempre insuficiencia renal",
        "Siempre miocarditis"
      ],
      "c": 0
    },
    {
      "id": "642",
      "q": "Paciente con disnea súbita, dolor pleurítico y taquicardia después de inmovilización prolongada. ¿Diagnóstico?",
      "ops": [
        "Embolia pulmonar",
        "Neumonía crónica",
        "Asma",
        "Gastritis"
      ],
      "c": 0
    },
    {
      "id": "643",
      "q": "En un paciente con alta sospecha de embolia pulmonar, la prueba de imagen habitual para confirmación en muchos pacientes es:",
      "ops": [
        "Angio-TC pulmonar",
        "Colonoscopia",
        "Ecografía abdominal",
        "RM cerebral"
      ],
      "c": 0
    },
    {
      "id": "644",
      "q": "Paciente con disnea, ortopnea, edema bilateral y crépitos. ¿Diagnóstico?",
      "ops": [
        "Insuficiencia cardíaca descompensada",
        "Cistitis",
        "Apendicitis",
        "Pancreatitis"
      ],
      "c": 0
    },
    {
      "id": "645",
      "q": "Un biomarcador utilizado en evaluación de insuficiencia cardíaca es:",
      "ops": [
        "BNP/NT-proBNP",
        "Amilasa exclusivamente",
        "Bilirrubina",
        "PSA"
      ],
      "c": 0
    },
    {
      "id": "646",
      "q": "Paciente con fibrilación auricular presenta riesgo aumentado de:",
      "ops": [
        "Accidente cerebrovascular embólico",
        "Apendicitis",
        "Pancreatitis",
        "Colecistitis"
      ],
      "c": 0
    },
    {
      "id": "647",
      "q": "La decisión de anticoagulación en fibrilación auricular depende principalmente de:",
      "ops": [
        "Riesgo tromboembólico y hemorrágico individual",
        "Solo frecuencia cardíaca",
        "Solo edad",
        "Solo presión arterial"
      ],
      "c": 0
    },
    {
      "id": "648",
      "q": "Paciente con PA 220/130 mmHg y encefalopatía. ¿Diagnóstico?",
      "ops": [
        "Emergencia hipertensiva",
        "Hipertensión esencial no complicada",
        "Hipotensión",
        "Hipertensión de bata blanca"
      ],
      "c": 0
    },
    {
      "id": "649",
      "q": "La emergencia hipertensiva implica:",
      "ops": [
        "Elevación grave de PA con daño agudo de órgano diana",
        "Cualquier PA >140/90",
        "Hipertensión sin síntomas",
        "Solo cefalea"
      ],
      "c": 0
    },
    {
      "id": "650",
      "q": "Paciente diabético con glucemia 500 mg/dL, cetonas, acidosis metabólica y respiración de Kussmaul. ¿Diagnóstico?",
      "ops": [
        "Cetoacidosis diabética",
        "Hipoglucemia",
        "Estado hiperosmolar sin cetosis",
        "Acidosis respiratoria"
      ],
      "c": 0
    },
    {
      "id": "651",
      "q": "En la cetoacidosis diabética, el potasio sérico:",
      "ops": [
        "Puede estar elevado inicialmente pese a déficit corporal total",
        "Siempre está disminuido",
        "Siempre está normal",
        "No importa"
      ],
      "c": 0
    },
    {
      "id": "652",
      "q": "Paciente con glucemia 780 mg/dL, osmolaridad elevada y alteración de conciencia, sin cetosis significativa. ¿Diagnóstico?",
      "ops": [
        "Estado hiperosmolar hiperglucémico",
        "Cetoacidosis clásica",
        "Hipoglucemia",
        "Insuficiencia suprarrenal"
      ],
      "c": 0
    },
    {
      "id": "653",
      "q": "Según estándares contemporáneos de diabetes, ¿cuál es un criterio diagnóstico válido de diabetes?",
      "ops": [
        "HbA1c ≥6,5%",
        "HbA1c 4%",
        "Glucemia 80 mg/dL",
        "Insulina elevada aislada"
      ],
      "c": 0
    },
    {
      "id": "654",
      "q": "Paciente con hipotiroidismo primario suele presentar:",
      "ops": [
        "TSH elevada y T4 libre baja",
        "TSH baja y T4 alta",
        "TSH y T4 elevadas siempre",
        "TSH normal siempre"
      ],
      "c": 0
    },
    {
      "id": "655",
      "q": "Paciente con hipertiroidismo presenta:",
      "ops": [
        "TSH suprimida y T4/T3 elevadas",
        "TSH elevada y T4 baja",
        "TSH baja y T4 baja siempre",
        "TSH normal obligatoriamente"
      ],
      "c": 0
    },
    {
      "id": "656",
      "q": "Paciente con fiebre, taquicardia, alteración mental y foco infeccioso presenta hipotensión persistente pese a fluidos. ¿Qué debe sospecharse?",
      "ops": [
        "Shock séptico",
        "Shock cardiogénico exclusivamente",
        "Shock neurogénico",
        "Anafilaxia siempre"
      ],
      "c": 0
    },
    {
      "id": "657",
      "q": "El lactato elevado en sepsis puede indicar:",
      "ops": [
        "Alteración de perfusión/metabolismo y mayor gravedad",
        "Recuperación",
        "Hipoglucemia",
        "Hipotiroidismo"
      ],
      "c": 0
    },
    {
      "id": "658",
      "q": "Paciente con infección y disfunción orgánica aguda presenta:",
      "ops": [
        "Sepsis",
        "Colonización",
        "Infección localizada sin respuesta sistémica siempre",
        "Alergia"
      ],
      "c": 0
    },
    {
      "id": "659",
      "q": "Paciente con creatinina que aumenta rápidamente y oliguria. ¿Qué debe considerarse?",
      "ops": [
        "Lesión renal aguda",
        "ERC estable obligatoria",
        "Hipertiroidismo",
        "Hepatitis"
      ],
      "c": 0
    },
    {
      "id": "660",
      "q": "Una causa frecuente de lesión renal aguda prerrenal es:",
      "ops": [
        "Hipovolemia",
        "Hipercalcemia siempre",
        "Cáncer de tiroides",
        "Neumotórax"
      ],
      "c": 0
    },
    {
      "id": "661",
      "q": "Paciente con hiperpotasemia y cambios electrocardiográficos. ¿Cuál es la prioridad?",
      "ops": [
        "Tratamiento urgente para estabilizar membrana cardíaca y corregir la hiperpotasemia según gravedad",
        "Alta",
        "Dieta exclusivamente",
        "Esperar una semana"
      ],
      "c": 0
    },
    {
      "id": "662",
      "q": "El hallazgo ECG clásico de hiperpotasemia inicial puede ser:",
      "ops": [
        "Ondas T picudas",
        "Ondas U prominentes",
        "QT prolongado siempre",
        "Elevación del ST en todas las derivaciones"
      ],
      "c": 0
    },
    {
      "id": "663",
      "q": "Paciente con cirrosis presenta hematemesis abundante. ¿Qué causa debe considerarse?",
      "ops": [
        "Sangrado por várices esofagogástricas",
        "Cistitis",
        "Apendicitis",
        "Neumonía"
      ],
      "c": 0
    },
    {
      "id": "664",
      "q": "Paciente con cirrosis presenta confusión y asterixis. ¿Diagnóstico?",
      "ops": [
        "Encefalopatía hepática",
        "Meningitis obligatoria",
        "Hipoglucemia obligatoria",
        "ACV siempre"
      ],
      "c": 0
    },
    {
      "id": "665",
      "q": "Una causa frecuente de encefalopatía hepática es:",
      "ops": [
        "Factor precipitante como infección o hemorragia digestiva",
        "Miopía",
        "Otitis",
        "Fractura"
      ],
      "c": 0
    },
    {
      "id": "666",
      "q": "Paciente con EPOC presenta aumento de disnea, volumen de esputo y purulencia. ¿Qué debe considerarse?",
      "ops": [
        "Exacerbación de EPOC",
        "Infarto obligatorio",
        "Apendicitis",
        "Colecistitis"
      ],
      "c": 0
    },
    {
      "id": "667",
      "q": "En exacerbación de EPOC con hipercapnia y acidosis respiratoria, puede ser útil:",
      "ops": [
        "Ventilación no invasiva en pacientes seleccionados",
        "Antibiótico siempre como único tratamiento",
        "Alta inmediata",
        "Diurético siempre"
      ],
      "c": 0
    },
    {
      "id": "668",
      "q": "Paciente asmático con disnea grave, habla entrecortada y agotamiento. ¿Qué debe sospecharse?",
      "ops": [
        "Crisis asmática grave",
        "Asma leve",
        "Gastritis",
        "Cistitis"
      ],
      "c": 0
    },
    {
      "id": "669",
      "q": "Una señal de amenaza de paro respiratorio en asma grave es:",
      "ops": [
        "Disminución del nivel de conciencia o agotamiento",
        "Tos leve",
        "Rinorrea",
        "Estornudos"
      ],
      "c": 0
    },
    {
      "id": "670",
      "q": "Paciente con cefalea súbita “en trueno” y rigidez cervical. ¿Diagnóstico que debe descartarse?",
      "ops": [
        "Hemorragia subaracnoidea",
        "Migraña simple siempre",
        "Sinusitis",
        "Otitis"
      ],
      "c": 0
    },
    {
      "id": "671",
      "q": "Paciente con déficit neurológico focal súbito. ¿Qué diagnóstico debe descartarse inmediatamente?",
      "ops": [
        "Accidente cerebrovascular",
        "Gastritis",
        "Colecistitis",
        "Artritis"
      ],
      "c": 0
    },
    {
      "id": "672",
      "q": "En sospecha de ACV isquémico agudo, la imagen inicial habitual es:",
      "ops": [
        "TC cerebral sin contraste",
        "Radiografía abdominal",
        "Ecografía renal",
        "Colonoscopia"
      ],
      "c": 0
    },
    {
      "id": "673",
      "q": "Paciente con fiebre, hipotensión, dolor lumbar y puñopercusión positiva. ¿Diagnóstico?",
      "ops": [
        "Pielonefritis complicada/sepsis urinaria",
        "Gastritis",
        "Colecistitis",
        "Neumonía"
      ],
      "c": 0
    },
    {
      "id": "674",
      "q": "Paciente con anemia, glositis y macrocitosis. ¿Deficiencia que debe considerarse?",
      "ops": [
        "Vitamina B12 o folato",
        "Hierro exclusivamente",
        "Vitamina K",
        "Calcio"
      ],
      "c": 0
    },
    {
      "id": "675",
      "q": "Paciente con pérdida de peso, sudoración nocturna y adenopatías persistentes. ¿Qué debe considerarse?",
      "ops": [
        "Linfoma",
        "Cistitis",
        "Migraña",
        "Gastritis"
      ],
      "c": 0
    },
    {
      "id": "676",
      "q": "En un paciente con sospecha de sepsis, una intervención fundamental es:",
      "ops": [
        "Reconocer precozmente, obtener cultivos cuando corresponda, iniciar tratamiento antimicrobiano oportuno y controlar el foco",
        "Esperar varios días",
        "Evitar líquidos siempre",
        "Administrar únicamente antipiréticos"
      ],
      "c": 0
    },
    {
      "id": "677",
      "q": "Mujer de 27 años con amenorrea, dolor unilateral y sangrado vaginal. β-hCG positiva y ausencia de saco intrauterino con masa anexial. ¿Diagnóstico?",
      "ops": [
        "Embarazo ectópico",
        "Mola",
        "Mioma",
        "Endometriosis"
      ],
      "c": 0
    },
    {
      "id": "678",
      "q": "Embarazada con dolor abdominal, hipotensión, taquicardia y líquido libre abdominal. ¿Cuál es la prioridad?",
      "ops": [
        "Reanimación y control urgente de hemorragia por probable ectópico roto",
        "Alta",
        "Observación ambulatoria",
        "Antibiótico oral"
      ],
      "c": 0
    },
    {
      "id": "679",
      "q": "Embarazada de 34 semanas con PA 170/110 mmHg, cefalea y alteraciones visuales. ¿Diagnóstico?",
      "ops": [
        "Preeclampsia con características graves",
        "Hipertensión gestacional leve",
        "Hipotensión",
        "Diabetes gestacional"
      ],
      "c": 0
    },
    {
      "id": "680",
      "q": "Embarazada con preeclampsia que desarrolla convulsiones presenta:",
      "ops": [
        "Eclampsia",
        "Epilepsia primaria obligatoriamente",
        "Hipoglucemia",
        "ACV siempre"
      ],
      "c": 0
    },
    {
      "id": "681",
      "q": "El medicamento fundamental para prevenir/tratar convulsiones asociadas a eclampsia es:",
      "ops": [
        "Sulfato de magnesio",
        "Insulina",
        "Furosemida",
        "Warfarina"
      ],
      "c": 0
    },
    {
      "id": "682",
      "q": "Plaquetas bajas, hemólisis y elevación de enzimas hepáticas en embarazada hipertensa sugieren:",
      "ops": [
        "HELLP",
        "Diabetes gestacional",
        "Hipotiroidismo",
        "Placenta previa"
      ],
      "c": 0
    },
    {
      "id": "683",
      "q": "Sangrado vaginal rojo brillante, indoloro, en tercer trimestre sugiere:",
      "ops": [
        "Placenta previa",
        "Desprendimiento placentario",
        "Rotura uterina",
        "Eclampsia"
      ],
      "c": 0
    },
    {
      "id": "684",
      "q": "Sangrado vaginal doloroso con útero hipertónico en tercer trimestre sugiere:",
      "ops": [
        "Desprendimiento prematuro de placenta",
        "Placenta previa",
        "Vaginitis",
        "Cistitis"
      ],
      "c": 0
    },
    {
      "id": "685",
      "q": "En sospecha de placenta previa:",
      "ops": [
        "Debe evitarse el tacto vaginal digital hasta descartar placenta previa",
        "Debe realizarse tacto repetido",
        "Debe realizarse biopsia cervical inmediata",
        "Debe inducirse siempre el parto"
      ],
      "c": 0
    },
    {
      "id": "686",
      "q": "Hemorragia posparto con útero flácido sugiere:",
      "ops": [
        "Atonía uterina",
        "Rotura ectópica",
        "Placenta previa",
        "Endometriosis"
      ],
      "c": 0
    },
    {
      "id": "687",
      "q": "La causa más frecuente de hemorragia posparto primaria es:",
      "ops": [
        "Atonía uterina",
        "Cáncer cervical",
        "Endometriosis",
        "Embarazo ectópico"
      ],
      "c": 0
    },
    {
      "id": "688",
      "q": "Las causas clásicas de hemorragia posparto pueden recordarse como:",
      "ops": [
        "Tone, Trauma, Tissue, Thrombin",
        "ABCD",
        "SAMPLE",
        "OPQRST"
      ],
      "c": 0
    },
    {
      "id": "689",
      "q": "Mujer con fiebre, dolor uterino y loquios malolientes después de cesárea. ¿Diagnóstico?",
      "ops": [
        "Endometritis puerperal",
        "Mastitis",
        "Cistitis simple",
        "Preeclampsia"
      ],
      "c": 0
    },
    {
      "id": "690",
      "q": "Puérpera con mama dolorosa, eritematosa y fiebre. ¿Diagnóstico?",
      "ops": [
        "Mastitis",
        "Endometritis",
        "Placenta previa",
        "Eclampsia"
      ],
      "c": 0
    },
    {
      "id": "691",
      "q": "Mujer de 35 años con dolor pélvico súbito, náuseas y masa ovárica. ¿Diagnóstico?",
      "ops": [
        "Torsión ovárica",
        "Endometriosis crónica",
        "Vaginosis",
        "Mioma asintomático"
      ],
      "c": 0
    },
    {
      "id": "692",
      "q": "La torsión ovárica requiere:",
      "ops": [
        "Evaluación ginecológica urgente",
        "Observación durante semanas",
        "Antibiótico oral siempre",
        "Alta"
      ],
      "c": 0
    },
    {
      "id": "693",
      "q": "Mujer con dismenorrea intensa, dispareunia e infertilidad. ¿Qué diagnóstico debe considerarse?",
      "ops": [
        "Endometriosis",
        "Cistitis",
        "Miocarditis",
        "Colecistitis"
      ],
      "c": 0
    },
    {
      "id": "694",
      "q": "Sangrado uterino anormal en mujer posmenopáusica debe:",
      "ops": [
        "Evaluarse para descartar patología endometrial",
        "Considerarse fisiológico",
        "Tratarse siempre con antibiótico",
        "Ignorarse"
      ],
      "c": 0
    },
    {
      "id": "695",
      "q": "El VPH de alto riesgo está relacionado con:",
      "ops": [
        "Cáncer de cuello uterino",
        "Cáncer renal exclusivamente",
        "Apendicitis",
        "Colecistitis"
      ],
      "c": 0
    },
    {
      "id": "696",
      "q": "Sangrado poscoital recurrente requiere:",
      "ops": [
        "Evaluación cervical apropiada",
        "Alta sin estudio",
        "Antibióticos siempre",
        "Anticoagulación"
      ],
      "c": 0
    },
    {
      "id": "697",
      "q": "Embarazada con diabetes gestacional presenta feto grande para edad gestacional. ¿Complicación fetal?",
      "ops": [
        "Macrosomía",
        "Restricción obligatoria",
        "Anencefalia obligatoria",
        "Microcefalia obligatoria"
      ],
      "c": 0
    },
    {
      "id": "698",
      "q": "La diabetes gestacional aumenta el riesgo de:",
      "ops": [
        "Macrosomía fetal y complicaciones metabólicas neonatales",
        "Apendicitis",
        "Meningitis materna",
        "Placenta previa siempre"
      ],
      "c": 0
    },
    {
      "id": "699",
      "q": "Rotura prematura de membranas antes de las 37 semanas se denomina:",
      "ops": [
        "PPROM/rotura prematura pretérmino de membranas",
        "Placenta previa",
        "Eclampsia",
        "Trabajo de parto normal"
      ],
      "c": 0
    },
    {
      "id": "700",
      "q": "Fiebre materna, taquicardia fetal, sensibilidad uterina y líquido maloliente sugieren:",
      "ops": [
        "Infección intraamniótica",
        "Placenta previa",
        "Hipertensión gestacional",
        "Endometriosis"
      ],
      "c": 0
    },
    {
      "id": "701",
      "q": "Embarazada con fiebre y sospecha de infección intraamniótica requiere:",
      "ops": [
        "Antibióticos apropiados y manejo obstétrico según situación",
        "Alta",
        "Solo paracetamol",
        "Esperar 72 horas sin vigilancia"
      ],
      "c": 0
    },
    {
      "id": "702",
      "q": "En trabajo de parto, la fase activa de la primera etapa comienza aproximadamente desde:",
      "ops": [
        "6 cm de dilatación cervical",
        "1 cm",
        "2 cm",
        "20 cm"
      ],
      "c": 0
    },
    {
      "id": "703",
      "q": "La guía ACOG 2024 sobre trabajo de parto actualiza especialmente:",
      "ops": [
        "Manejo de la primera y segunda etapa del trabajo de parto",
        "Solo anticoncepción",
        "Solo cáncer cervical",
        "Solo menopausia"
      ],
      "c": 0
    },
    {
      "id": "704",
      "q": "La hemorragia posparto con placenta retenida corresponde a un problema de:",
      "ops": [
        "Tissue",
        "Tone",
        "Trauma",
        "Thrombin exclusivamente"
      ],
      "c": 0
    },
    {
      "id": "705",
      "q": "Laceración cervical o vaginal después del parto corresponde a:",
      "ops": [
        "Trauma",
        "Tone",
        "Tissue",
        "Thrombin"
      ],
      "c": 0
    },
    {
      "id": "706",
      "q": "Coagulopatía como causa de hemorragia posparto corresponde a:",
      "ops": [
        "Thrombin",
        "Tone",
        "Tissue",
        "Trauma"
      ],
      "c": 0
    },
    {
      "id": "707",
      "q": "Una paciente con embarazo molar puede presentar:",
      "ops": [
        "β-hCG marcadamente elevada y útero mayor que la edad gestacional en algunos casos",
        "β-hCG negativa",
        "Hematuria obligatoria",
        "Bradicardia materna"
      ],
      "c": 0
    },
    {
      "id": "708",
      "q": "Una complicación importante del embarazo molar es:",
      "ops": [
        "Enfermedad trofoblástica gestacional persistente",
        "Apendicitis",
        "Colecistitis",
        "Hernia"
      ],
      "c": 0
    },
    {
      "id": "709",
      "q": "Mujer con dolor pélvico, fiebre, secreción cervical y dolor a la movilización cervical. ¿Diagnóstico?",
      "ops": [
        "Enfermedad inflamatoria pélvica",
        "Endometriosis exclusivamente",
        "Mioma",
        "Cistitis simple"
      ],
      "c": 0
    },
    {
      "id": "710",
      "q": "Una complicación de enfermedad inflamatoria pélvica es:",
      "ops": [
        "Infertilidad y embarazo ectópico",
        "Hipotiroidismo",
        "Insuficiencia cardíaca",
        "Catarata"
      ],
      "c": 0
    },
    {
      "id": "711",
      "q": "En embarazo, el estudio de imagen inicial preferido para muchas patologías abdominales y obstétricas es:",
      "ops": [
        "Ecografía",
        "Radiografía de cráneo",
        "Colonoscopia",
        "PET siempre"
      ],
      "c": 0
    },
    {
      "id": "712",
      "q": "La ecografía obstétrica estándar permite evaluar:",
      "ops": [
        "Anatomía fetal, crecimiento, placenta y líquido amniótico",
        "Solo sexo fetal",
        "Solo peso fetal",
        "Solo frecuencia cardíaca"
      ],
      "c": 0
    },
    {
      "id": "713",
      "q": "La analgesia neuraxial durante el trabajo de parto:",
      "ops": [
        "Es una opción efectiva cuando no existen contraindicaciones",
        "Está absolutamente contraindicada",
        "Solo puede utilizarse después del parto",
        "Solo sirve para cesárea"
      ],
      "c": 0
    },
    {
      "id": "714",
      "q": "Paciente con dolor migratorio a fosa ilíaca derecha, fiebre y leucocitosis. ¿Diagnóstico?",
      "ops": [
        "Apendicitis aguda",
        "Colecistitis",
        "Pancreatitis",
        "Diverticulitis"
      ],
      "c": 0
    },
    {
      "id": "715",
      "q": "Paciente con abdomen rígido y neumoperitoneo. ¿Diagnóstico?",
      "ops": [
        "Perforación de víscera hueca",
        "Gastritis",
        "Hepatitis",
        "Cistitis"
      ],
      "c": 0
    },
    {
      "id": "716",
      "q": "Dolor epigástrico irradiado a espalda y lipasa elevada sugiere:",
      "ops": [
        "Pancreatitis aguda",
        "Apendicitis",
        "Diverticulitis",
        "Obstrucción urinaria"
      ],
      "c": 0
    },
    {
      "id": "717",
      "q": "Dolor en hipocondrio derecho, fiebre, Murphy positivo y engrosamiento vesicular sugieren:",
      "ops": [
        "Colecistitis aguda",
        "Apendicitis",
        "Pancreatitis crónica",
        "Gastritis"
      ],
      "c": 0
    },
    {
      "id": "718",
      "q": "Ictericia, fiebre y dolor en hipocondrio derecho constituyen:",
      "ops": [
        "Tríada de Charcot",
        "Tríada de Virchow",
        "Tríada de Cushing",
        "Tríada de Beck"
      ],
      "c": 0
    },
    {
      "id": "719",
      "q": "La colangitis grave puede requerir:",
      "ops": [
        "Drenaje urgente de la vía biliar",
        "Solo analgésicos",
        "Alta",
        "Colonoscopia"
      ],
      "c": 0
    },
    {
      "id": "720",
      "q": "Paciente con vómitos, distensión abdominal y ausencia de gases presenta:",
      "ops": [
        "Obstrucción intestinal",
        "Hepatitis",
        "Gastritis",
        "Colecistitis"
      ],
      "c": 0
    },
    {
      "id": "721",
      "q": "La causa más frecuente de obstrucción del intestino delgado en un paciente operado previamente es:",
      "ops": [
        "Adherencias",
        "Pancreatitis",
        "Colelitiasis",
        "Hepatitis"
      ],
      "c": 0
    },
    {
      "id": "722",
      "q": "Una hernia irreductible con compromiso vascular se denomina:",
      "ops": [
        "Hernia estrangulada",
        "Hernia reducible",
        "Hernia simple",
        "Lipoma"
      ],
      "c": 0
    },
    {
      "id": "723",
      "q": "Paciente con dolor abdominal desproporcionado al examen y fibrilación auricular. ¿Diagnóstico?",
      "ops": [
        "Isquemia mesentérica aguda",
        "Gastritis",
        "Colecistitis",
        "Hernia"
      ],
      "c": 0
    },
    {
      "id": "724",
      "q": "Una complicación de isquemia mesentérica no tratada es:",
      "ops": [
        "Necrosis intestinal",
        "Hipotiroidismo",
        "Catarata",
        "Otitis"
      ],
      "c": 0
    },
    {
      "id": "725",
      "q": "Paciente traumatizado con hipotensión, ausencia unilateral de ruidos respiratorios y deterioro respiratorio. ¿Diagnóstico?",
      "ops": [
        "Neumotórax a tensión",
        "Neumonía",
        "Asma",
        "Bronquitis"
      ],
      "c": 0
    },
    {
      "id": "726",
      "q": "En neumotórax a tensión con inestabilidad:",
      "ops": [
        "Se debe realizar descompresión inmediata según protocolo",
        "Esperar TC",
        "Esperar radiografía siempre",
        "Dar antibióticos"
      ],
      "c": 0
    },
    {
      "id": "727",
      "q": "Trauma torácico con hipotensión y ruidos cardíacos apagados sugiere:",
      "ops": [
        "Taponamiento cardíaco",
        "Neumonía",
        "Hemotórax simple",
        "Asma"
      ],
      "c": 0
    },
    {
      "id": "728",
      "q": "En trauma, el FAST busca principalmente:",
      "ops": [
        "Líquido libre en regiones anatómicas específicas",
        "Fracturas",
        "Lesiones cutáneas",
        "Diabetes"
      ],
      "c": 0
    },
    {
      "id": "729",
      "q": "El eFAST permite además evaluar:",
      "ops": [
        "Neumotórax y hemotórax",
        "Colon",
        "Tiroides",
        "Próstata"
      ],
      "c": 0
    },
    {
      "id": "730",
      "q": "Paciente politraumatizado con hemorragia externa masiva. La prioridad es:",
      "ops": [
        "Control de la hemorragia",
        "Radiografía",
        "Historia clínica completa",
        "Alta"
      ],
      "c": 0
    },
    {
      "id": "731",
      "q": "La tríada letal clásica del trauma incluye:",
      "ops": [
        "Hipotermia, acidosis y coagulopatía",
        "Hipertensión, fiebre y alcalosis",
        "Hipoglucemia, fiebre y anemia",
        "Hipercalcemia, fiebre y bradicardia"
      ],
      "c": 0
    },
    {
      "id": "732",
      "q": "La escala de Glasgow evalúa:",
      "ops": [
        "Apertura ocular, respuesta verbal y motora",
        "Dolor, pulso y temperatura",
        "Pupilas exclusivamente",
        "Presión arterial"
      ],
      "c": 0
    },
    {
      "id": "733",
      "q": "Paciente con quemadura facial, hollín y ronquera. ¿Qué debe considerarse?",
      "ops": [
        "Lesión inhalatoria y riesgo de compromiso de vía aérea",
        "Quemadura exclusivamente superficial",
        "Alta",
        "Cistitis"
      ],
      "c": 0
    },
    {
      "id": "734",
      "q": "La fascitis necrotizante requiere:",
      "ops": [
        "Desbridamiento quirúrgico urgente",
        "Solo antibiótico oral",
        "Observación",
        "Antihistamínicos"
      ],
      "c": 0
    },
    {
      "id": "735",
      "q": "El dolor desproporcionado al examen en una infección de tejidos blandos sugiere:",
      "ops": [
        "Infección necrotizante",
        "Celulitis leve",
        "Dermatitis",
        "Urticaria"
      ],
      "c": 0
    },
    {
      "id": "736",
      "q": "Paciente con aneurisma de aorta abdominal, dolor lumbar súbito e hipotensión. ¿Diagnóstico?",
      "ops": [
        "Rotura de aneurisma",
        "Cólico renal",
        "Gastritis",
        "Pancreatitis"
      ],
      "c": 0
    },
    {
      "id": "737",
      "q": "El aneurisma de aorta abdominal roto produce principalmente riesgo de:",
      "ops": [
        "Hemorragia interna masiva y shock",
        "Hipoglucemia",
        "Neumonía",
        "Hepatitis"
      ],
      "c": 0
    },
    {
      "id": "738",
      "q": "Paciente con hematemesis masiva e inestabilidad hemodinámica requiere inicialmente:",
      "ops": [
        "Reanimación y control urgente de la hemorragia",
        "Alta",
        "Solo antiácidos",
        "Colonoscopia ambulatoria"
      ],
      "c": 0
    },
    {
      "id": "739",
      "q": "En cirrosis, la hematemesis debe hacer considerar:",
      "ops": [
        "Hemorragia por várices esofagogástricas",
        "Apendicitis",
        "Cistitis",
        "Hernia"
      ],
      "c": 0
    },
    {
      "id": "740",
      "q": "Una complicación grave de una úlcera péptica es:",
      "ops": [
        "Perforación",
        "Hipotiroidismo",
        "Otitis",
        "Catarata"
      ],
      "c": 0
    },
    {
      "id": "741",
      "q": "Paciente con dolor testicular súbito y reflejo cremastérico ausente. ¿Diagnóstico?",
      "ops": [
        "Torsión testicular",
        "Epididimitis",
        "Varicocele",
        "Hidrocele"
      ],
      "c": 0
    },
    {
      "id": "742",
      "q": "La torsión testicular requiere:",
      "ops": [
        "Tratamiento urgente para restaurar perfusión",
        "Observación durante una semana",
        "Antibióticos exclusivamente",
        "Alta"
      ],
      "c": 0
    },
    {
      "id": "743",
      "q": "Paciente con fiebre, dolor lumbar y obstrucción ureteral por cálculo. ¿Conducta?",
      "ops": [
        "Drenaje urgente de la vía urinaria + tratamiento de infección",
        "Esperar expulsión espontánea siempre",
        "Alta",
        "Solo analgésicos"
      ],
      "c": 0
    },
    {
      "id": "744",
      "q": "Paciente con shock y perforación intestinal. La prioridad definitiva es:",
      "ops": [
        "Control del foco infeccioso además de reanimación y antibióticos",
        "Solo analgesia",
        "Dieta",
        "Alta"
      ],
      "c": 0
    },
    {
      "id": "745",
      "q": "En cirugía de control de daños, el objetivo inicial es:",
      "ops": [
        "Corregir amenazas fisiológicas graves y controlar rápidamente lesiones críticas",
        "Realizar siempre cirugía definitiva extensa",
        "Evitar transfusiones",
        "Retrasar el tratamiento"
      ],
      "c": 0
    },
    {
      "id": "746",
      "q": "Paciente con infección intraabdominal y shock séptico requiere:",
      "ops": [
        "Reanimación, antimicrobianos adecuados y control precoz del foco",
        "Solo antipiréticos",
        "Solo líquidos orales",
        "Alta"
      ],
      "c": 0
    },
    {
      "id": "747",
      "q": "La sepsis abdominal puede requerir:",
      "ops": [
        "Drenaje de absceso o cirugía",
        "Solo observación",
        "Antihistamínicos",
        "Anticoagulación siempre"
      ],
      "c": 0
    },
    {
      "id": "748",
      "q": "Una complicación potencialmente grave de una colecistitis es:",
      "ops": [
        "Perforación vesicular",
        "Hipotiroidismo",
        "Catarata",
        "Otitis"
      ],
      "c": 0
    },
    {
      "id": "749",
      "q": "Paciente con abdomen agudo, hipotensión y lactato elevado. La primera prioridad es:",
      "ops": [
        "Reanimación y búsqueda/tratamiento de una causa potencialmente mortal",
        "Alta",
        "Esperar laboratorio completo antes de intervenir",
        "Alimentación oral"
      ],
      "c": 0
    },
    {
      "id": "750",
      "q": "Un principio transversal de la medicina de urgencias y cirugía es:",
      "ops": [
        "Reconocer precozmente amenazas vitales, estabilizar al paciente y tratar la causa",
        "Esperar siempre el diagnóstico definitivo antes de estabilizar",
        "Tratar únicamente los síntomas",
        "Evitar intervenciones tempranas"
      ],
      "c": 0
    }
  ]
};

const FULL_CASES_DATA: Record<string, CaseStudy[]> = {
  "pediatria": [
    {
      "id": "PED-C01",
      "t": "Neumonía adquirida en la comunidad",
      "p": "Mateo R., 3 años, masculino. Vacunación incompleta. Fiebre hasta 39,2 °C y dificultad respiratoria de 2 días; tos productiva, apetito disminuido, taquipnea y hundimiento costal. SV: FC 138, FR 48, PA 94/58, T 39,1 °C, SatO₂ 89% AA. Examen: tiraje subcostal, disminución del murmullo vesicular y crepitantes en base derecha; sin meningismo. Lab: Hb 11,8; Leuc 18.400; Neut 84%; Plaq 355.000; PCR elevada.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico más probable?",
          "ops": [
            "Bronquiolitis",
            "Neumonía adquirida en la comunidad",
            "Crisis asmática",
            "Laringotraqueítis"
          ],
          "c": 1
        },
        {
          "q": "¿Qué dato indica mayor gravedad?",
          "ops": [
            "Tos",
            "Fiebre",
            "SatO₂ de 89%",
            "Anorexia"
          ],
          "c": 2
        },
        {
          "q": "¿Cuál es una intervención prioritaria?",
          "ops": [
            "Antitusígeno",
            "Oxigenoterapia y manejo de la neumonía según gravedad",
            "Antidiarreico",
            "Suspender líquidos"
          ],
          "c": 1
        }
      ],
      "raz": "Fiebre + tos + taquipnea + consolidación + hipoxemia = neumonía con manejo urgente. La dificultad respiratoria y la hipoxemia determinan gravedad."
    },
    {
      "id": "PED-C02",
      "t": "Bronquiolitis",
      "p": "Sofía M., 7 meses. 5 días de rinorrea; 48 h de tos, sibilancias y dificultad respiratoria. SV: FC 156, FR 58, PA 88/50, T 37,8 °C, SatO₂ 91%. Examen: tiraje subcostal moderado, sibilancias bilaterales, crepitantes dispersos, alimentación disminuida, sin focalidad.",
      "preg": [
        {
          "q": "Diagnóstico más probable:",
          "ops": [
            "Bronquiolitis aguda",
            "Neumonía bacteriana lobar",
            "Asma persistente",
            "Aspiración de cuerpo extraño"
          ],
          "c": 0
        },
        {
          "q": "¿Cuál es el agente etiológico más frecuente?",
          "ops": [
            "Virus sincitial respiratorio",
            "Streptococcus pyogenes",
            "E. coli",
            "Candida albicans"
          ],
          "c": 0
        },
        {
          "q": "¿Qué debe vigilarse especialmente?",
          "ops": [
            "Trabajo respiratorio, alimentación y oxigenación",
            "Solo temperatura",
            "Solo hemoglobina",
            "Solo frecuencia cardíaca"
          ],
          "c": 0
        }
      ],
      "raz": "Lactante <1 año con pródromo catarral + sibilancias y dificultad respiratoria = patrón típico de bronquiolitis."
    },
    {
      "id": "PED-C03",
      "t": "Crisis asmática grave",
      "p": "Diego A., 8 años, asma diagnosticada a los 5 años, sin controlador regular. Disnea intensa tras infección respiratoria, sin mejoría con salbutamol. SV: FC 142, FR 42, PA 105/65, T 37,2 °C, SatO₂ 86%. Examen: habla entrecortada, tiraje, uso de accesorios, sibilancias difusas, entrada de aire disminuida.",
      "preg": [
        {
          "q": "Diagnóstico:",
          "ops": [
            "Crisis asmática grave",
            "Bronquiolitis",
            "Neumotórax confirmado",
            "Laringitis"
          ],
          "c": 0
        },
        {
          "q": "¿Cuál es el tratamiento broncodilatador inicial?",
          "ops": [
            "Salbutamol inhalado",
            "Amoxicilina",
            "Furosemida",
            "Omeprazol"
          ],
          "c": 0
        },
        {
          "q": "¿Qué otro tratamiento puede estar indicado en una exacerbación grave?",
          "ops": [
            "Corticoide sistémico",
            "Antifúngico",
            "Antidiarreico",
            "Hierro"
          ],
          "c": 0
        }
      ],
      "raz": "La disminución marcada de ruidos en asmático muy grave puede significar flujo aéreo críticamente reducido, no mejoría."
    },
    {
      "id": "PED-C04",
      "t": "Deshidratación por diarrea",
      "p": "Valentina C., 2 años. Diarrea acuosa 3 días y vómitos. SV: FC 145, FR 32, PA 82/50, T 37,5 °C. Examen: sed intensa, mucosas secas, ojos hundidos, llenado capilar 3 s, pocas lágrimas, irritable. Lab: Na 137, K 3,4, HCO₃ 17, creatinina discretamente elevada.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico principal?",
          "ops": [
            "Deshidratación secundaria a diarrea aguda",
            "Síndrome nefrótico",
            "Diabetes mellitus",
            "Meningitis"
          ],
          "c": 0
        },
        {
          "q": "¿Qué intervención es fundamental?",
          "ops": [
            "Rehidratación adecuada",
            "Ayuno absoluto",
            "Antidiarreico de rutina",
            "Antibiótico obligatorio"
          ],
          "c": 0
        },
        {
          "q": "¿Qué alteración explica parcialmente la taquipnea?",
          "ops": [
            "Acidosis metabólica",
            "Alcalosis respiratoria primaria",
            "Hipercalcemia",
            "Policitemia"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "PED-C05",
      "t": "Cetoacidosis diabética",
      "p": "Andrés P., 11 años, sin diagnóstico previo. 3 semanas de poliuria, polidipsia y pérdida de peso; 24 h de vómitos, dolor abdominal y somnolencia. SV: FC 128, FR 34, PA 92/55, SatO₂ 98%. Examen: deshidratación, respiración profunda, aliento cetónico, somnolencia. Lab: Glucosa 480, pH 7,12, HCO₃ 8, cetonas positivas, Na 132, K 5,1.",
      "preg": [
        {
          "q": "Diagnóstico:",
          "ops": [
            "Hipoglucemia",
            "Cetoacidosis diabética",
            "Gastroenteritis simple",
            "Diabetes insípida"
          ],
          "c": 1
        },
        {
          "q": "¿Cómo se denomina la respiración observada?",
          "ops": [
            "Cheyne-Stokes",
            "Kussmaul",
            "Biot",
            "Apnéustica"
          ],
          "c": 1
        },
        {
          "q": "¿Qué electrolito requiere vigilancia estrecha durante el tratamiento?",
          "ops": [
            "Potasio",
            "Calcio exclusivamente",
            "Magnesio exclusivamente",
            "Hierro"
          ],
          "c": 0
        }
      ],
      "raz": "El K sérico inicial puede ser normal o elevado pese a déficit corporal total de potasio."
    },
    {
      "id": "PED-C06",
      "t": "Meningitis bacteriana",
      "p": "Lucas T., 4 años. Fiebre alta, cefalea intensa y vómitos de 12 h; luego somnolencia. SV: FC 145, FR 30, PA 90/55, T 39,6 °C, SatO₂ 96%. Examen: rigidez de nuca, fotofobia, alteración de conciencia, petequias en miembros inferiores. Lab: Leuc 22.000, Neut 91%, PCR elevada.",
      "preg": [
        {
          "q": "¿Qué diagnóstico debe sospecharse?",
          "ops": [
            "Meningitis/sepsis meningocócica",
            "Gastroenteritis",
            "Asma",
            "Hepatitis"
          ],
          "c": 0
        },
        {
          "q": "¿Qué debe hacerse?",
          "ops": [
            "Manejo urgente e inicio precoz de antibióticos apropiados",
            "Esperar 48 horas",
            "Dar únicamente paracetamol",
            "Alta domiciliaria"
          ],
          "c": 0
        },
        {
          "q": "Las petequias asociadas a fiebre y deterioro sistémico hacen sospechar especialmente:",
          "ops": [
            "Enfermedad meningocócica",
            "Varicela",
            "Dermatitis atópica",
            "Urticaria alimentaria simple"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "PED-C07",
      "t": "Síndrome nefrótico",
      "p": "Gabriel S., 5 años. Edema progresivo de párpados y miembros inferiores. SV: FC 108, FR 24, PA 100/60, T 36,8 °C. Examen: edema periorbitario, edema con fóvea, ascitis leve. Lab: Albúmina 1,8, Colesterol 320, proteinuria marcada, creatinina normal.",
      "preg": [
        {
          "q": "Diagnóstico:",
          "ops": [
            "Síndrome nefrótico",
            "Síndrome nefrítico",
            "Insuficiencia hepática",
            "Deshidratación"
          ],
          "c": 0
        },
        {
          "q": "¿Cuál es el hallazgo fundamental?",
          "ops": [
            "Proteinuria significativa",
            "Hemoptisis",
            "Hiperglucemia",
            "Hipercalcemia"
          ],
          "c": 0
        },
        {
          "q": "¿Qué alteración explica el edema?",
          "ops": [
            "Hipoalbuminemia",
            "Hiperglucemia",
            "Hipernatremia aislada",
            "Policitemia"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "PED-C08",
      "t": "Glomerulonefritis postestreptocócica",
      "p": "Sebastián V., 9 años. Faringitis 2 semanas atrás. Edema facial, orina oscura y cefalea. SV: FC 100, FR 22, PA 138/90, T 36,9 °C. Lab: Creatinina 1,2, C3 disminuido, ASO elevada, hematuria, proteinuria moderada.",
      "preg": [
        {
          "q": "Diagnóstico:",
          "ops": [
            "Glomerulonefritis postestreptocócica",
            "Síndrome nefrótico puro",
            "Cistitis",
            "Diabetes mellitus"
          ],
          "c": 0
        },
        {
          "q": "¿Qué característica orienta a síndrome nefrítico?",
          "ops": [
            "Hematuria e hipertensión",
            "Hipoglucemia",
            "Hipoalbuminemia extrema aislada",
            "Hipercalcemia"
          ],
          "c": 0
        },
        {
          "q": "¿Qué complemento puede estar disminuido?",
          "ops": [
            "C3",
            "B12",
            "Hierro",
            "Albúmina exclusivamente"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "PED-C09",
      "t": "Invaginación intestinal",
      "p": "Emilia G., 14 meses. Dolor abdominal episódico intenso con llanto y flexión de piernas; vómitos y deposiciones con sangre y moco. SV: FC 150, FR 30, PA 88/52, T 37,5 °C. Examen: abdomen doloroso y masa palpable.",
      "preg": [
        {
          "q": "Diagnóstico más probable:",
          "ops": [
            "Invaginación intestinal",
            "Reflujo gastroesofágico",
            "Gastritis",
            "Hepatitis"
          ],
          "c": 0
        },
        {
          "q": "¿Cuál es una presentación clásica?",
          "ops": [
            "Dolor abdominal cólico episódico",
            "Tos nocturna",
            "Ictericia aislada",
            "Cefalea"
          ],
          "c": 0
        },
        {
          "q": "¿Qué complicación puede aparecer si no se trata?",
          "ops": [
            "Isquemia y perforación intestinal",
            "Asma",
            "Meningitis",
            "Anemia perniciosa"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "PED-C10",
      "t": "Estenosis hipertrófica del píloro",
      "p": "Tomás L., 5 semanas. Vómitos proyectivos no biliosos progresivos, permanece hambriento. SV: FC 150, FR 38, PA 78/45, T 36,6 °C. Lab: Na 134, K 3,0, Cl 88, HCO₃ 32.",
      "preg": [
        {
          "q": "Diagnóstico:",
          "ops": [
            "Estenosis hipertrófica del píloro",
            "Atresia esofágica",
            "Invaginación",
            "Gastroenteritis"
          ],
          "c": 0
        },
        {
          "q": "El trastorno ácido-base esperado es:",
          "ops": [
            "Alcalosis metabólica hipoclorémica",
            "Acidosis metabólica",
            "Alcalosis respiratoria",
            "Acidosis respiratoria"
          ],
          "c": 0
        },
        {
          "q": "Antes de la corrección quirúrgica se debe:",
          "ops": [
            "Corregir deshidratación y alteraciones electrolíticas",
            "Operar sin estabilización",
            "Dar antidiarreicos",
            "Administrar hierro"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "PED-C11",
      "t": "Enfermedad de Kawasaki",
      "p": "Nicolás F., 3 años. Fiebre de 6 días. Examen: conjuntivitis bilateral no purulenta, labios fisurados, lengua aframbuesada, adenopatía cervical, exantema, eritema de manos. SV: FC 132, FR 28, PA 100/62, T 39 °C.",
      "preg": [
        {
          "q": "Diagnóstico:",
          "ops": [
            "Kawasaki",
            "Sarampión",
            "Escarlatina",
            "Varicela"
          ],
          "c": 0
        },
        {
          "q": "¿Qué complicación debe prevenirse especialmente?",
          "ops": [
            "Aneurismas coronarios",
            "Apendicitis",
            "Neumotórax",
            "Síndrome nefrótico"
          ],
          "c": 0
        },
        {
          "q": "El niño requiere:",
          "ops": [
            "Evaluación y tratamiento oportunos",
            "Alta sin seguimiento",
            "Solo antipirético",
            "Antibiótico oral como único tratamiento"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "PED-C12",
      "t": "Anafilaxia",
      "p": "Camila N., 7 años, alergia a maní. Minutos tras ingerir alimento: urticaria generalizada, edema labial, dificultad respiratoria y mareo. SV: FC 145, FR 36, PA 75/42, SatO₂ 87%. Examen: urticaria, edema facial, sibilancias, hipotensión.",
      "preg": [
        {
          "q": "Diagnóstico:",
          "ops": [
            "Anafilaxia",
            "Asma aislada",
            "Urticaria simple",
            "Neumonía"
          ],
          "c": 0
        },
        {
          "q": "Tratamiento de primera línea:",
          "ops": [
            "Adrenalina IM",
            "Antihistamínico oral como único tratamiento",
            "Paracetamol",
            "Amoxicilina"
          ],
          "c": 0
        },
        {
          "q": "¿Dónde se administra habitualmente?",
          "ops": [
            "Muslo, vía intramuscular",
            "Oral",
            "Intradérmica",
            "Subcutánea exclusivamente"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "PED-C13",
      "t": "Cetoacidosis diabética con riesgo de edema cerebral",
      "p": "Daniel H., 12 años, DM1. Ingresa por cetoacidosis; horas después presenta cefalea intensa, irritabilidad y disminución del nivel de conciencia. SV: FC 120, FR 28, PA 100/60, T 36,7 °C. Lab: Glucosa 260, pH 7,25, HCO₃ 13.",
      "preg": [
        {
          "q": "¿Qué complicación debe sospecharse?",
          "ops": [
            "Edema cerebral",
            "Apendicitis",
            "Bronquiolitis",
            "Hepatitis"
          ],
          "c": 0
        },
        {
          "q": "¿Qué hallazgo aumenta la preocupación?",
          "ops": [
            "Deterioro neurológico",
            "Mejoría de la glucemia",
            "Disminución de cetonas",
            "Ausencia de fiebre"
          ],
          "c": 0
        },
        {
          "q": "¿Qué debe hacerse?",
          "ops": [
            "Evaluación y tratamiento urgente de la complicación neurológica",
            "Dar alta",
            "Administrar líquidos por vía oral",
            "Suspender monitorización"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "PED-C14",
      "t": "Apendicitis aguda",
      "p": "Joaquín B., 10 años. Dolor periumbilical que migra a fosa ilíaca derecha; anorexia, náuseas y fiebre. SV: FC 118, FR 24, PA 105/65, T 38,3 °C. Examen: dolor en FID y defensa. Lab: Leuc 17.200, Neut 86%, PCR elevada.",
      "preg": [
        {
          "q": "Diagnóstico:",
          "ops": [
            "Apendicitis aguda",
            "Gastroenteritis viral simple",
            "Síndrome nefrótico",
            "Asma"
          ],
          "c": 0
        },
        {
          "q": "¿Qué elemento del cuadro es especialmente característico?",
          "ops": [
            "Migración del dolor hacia fosa ilíaca derecha",
            "Tos productiva",
            "Hematuria",
            "Ictericia"
          ],
          "c": 0
        },
        {
          "q": "¿Qué complicación debe evitarse?",
          "ops": [
            "Perforación",
            "Bronquiolitis",
            "Meningitis",
            "Hipotiroidismo"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "PED-C15",
      "t": "Desnutrición aguda grave",
      "p": "Luis E., 2 años. Pobre acceso a alimentos y diarrea repetida. Examen: marcada emaciación, debilidad, cabello fino, irritabilidad, edema bilateral leve. Lab: Hb 8,2, Glucosa 58, albúmina disminuida.",
      "preg": [
        {
          "q": "¿Cuál es el problema principal?",
          "ops": [
            "Desnutrición aguda grave",
            "Obesidad",
            "Hipertiroidismo",
            "Asma"
          ],
          "c": 0
        },
        {
          "q": "Una complicación metabólica importante es:",
          "ops": [
            "Hipoglucemia",
            "Hipercalcemia obligatoria",
            "Hiperglucemia obligatoria",
            "Policitemia"
          ],
          "c": 0
        },
        {
          "q": "El tratamiento debe ser:",
          "ops": [
            "Gradual y protocolizado",
            "Alimentación masiva inmediata sin vigilancia",
            "Ayuno",
            "Solo antibióticos"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "PED-C16",
      "t": "Sepsis neonatal",
      "p": "Valeria P., 18 días. Rechazo del alimento, somnolencia y temperatura inestable. SV: FC 178, FR 64, PA 62/35, T 35,8 °C, SatO₂ 91%. Examen: hipotonía, mala perfusión, llenado capilar 4 s, llanto débil. Lab: Leuc 4.100, Plaq 110.000, lactato y PCR elevados.",
      "preg": [
        {
          "q": "¿Qué diagnóstico debe sospecharse?",
          "ops": [
            "Sepsis neonatal",
            "Reflujo fisiológico",
            "Cólico del lactante",
            "Dermatitis"
          ],
          "c": 0
        },
        {
          "q": "¿Qué signo indica compromiso circulatorio?",
          "ops": [
            "Llenado capilar prolongado e hipotensión",
            "Apetito normal",
            "Llanto vigoroso",
            "Buena perfusión"
          ],
          "c": 0
        },
        {
          "q": "La conducta debe ser:",
          "ops": [
            "Evaluación y tratamiento urgente de posible infección bacteriana grave",
            "Observación domiciliaria",
            "Dar únicamente paracetamol",
            "Alta inmediata"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "PED-C17",
      "t": "Convulsión febril",
      "p": "Martina D., 20 meses. Fiebre de 39 °C con convulsión generalizada de 2 minutos durante la elevación térmica; recuperación completa. Examen posterior: neurológico normal, sin rigidez de nuca ni déficit focal.",
      "preg": [
        {
          "q": "Diagnóstico más probable:",
          "ops": [
            "Convulsión febril simple",
            "Estado epiléptico",
            "Meningitis confirmada",
            "Epilepsia refractaria"
          ],
          "c": 0
        },
        {
          "q": "Una característica de convulsión febril simple es:",
          "ops": [
            "Generalizada y breve",
            "Siempre focal",
            "Duración mayor a 30 minutos",
            "Déficit neurológico permanente"
          ],
          "c": 0
        },
        {
          "q": "¿Qué debe buscarse siempre?",
          "ops": [
            "Causa de la fiebre",
            "Solo glucosa",
            "Solo hemoglobina",
            "Solo radiografía de tórax"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "PED-C18",
      "t": "Tuberculosis pediátrica",
      "p": "Andrés M., 6 años. Padre tratado recientemente por TB pulmonar. Tos de 4 semanas, fiebre vespertina y pérdida de peso. SV: FC 108, FR 24, PA 98/60, T 37,9 °C, SatO₂ 96%. Lab: Hb 10,4, Leuc 8.900, PCR discretamente elevada.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico que debe investigarse prioritariamente?",
          "ops": [
            "Tuberculosis",
            "Asma",
            "Gastroenteritis",
            "Apendicitis"
          ],
          "c": 0
        },
        {
          "q": "¿Qué antecedente aumenta significativamente la sospecha?",
          "ops": [
            "Contacto domiciliario con tuberculosis",
            "Lactancia materna",
            "Vacunación completa",
            "Otitis previa"
          ],
          "c": 0
        },
        {
          "q": "La evaluación debe incluir:",
          "ops": [
            "Evaluación clínica, epidemiológica y estudios apropiados",
            "Solo hemograma",
            "Solo glucemia",
            "Ningún estudio"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "PED-C19",
      "t": "Meningococcemia",
      "p": "Bruno K., 5 años. Fiebre súbita, vómitos, decaimiento y púrpura de aparición rápida. SV: FC 155, FR 34, PA 72/40, T 40 °C, SatO₂ 93%. Examen: petequias y púrpura extensa, extremidades frías, llenado capilar 5 s, alteración del sensorio. Lab: Leuc 24.000, Plaq 65.000, lactato elevado, coagulograma alterado.",
      "preg": [
        {
          "q": "Diagnóstico más probable:",
          "ops": [
            "Meningococcemia con shock séptico",
            "Varicela",
            "Urticaria",
            "Sarampión"
          ],
          "c": 0
        },
        {
          "q": "¿Qué problema requiere atención inmediata?",
          "ops": [
            "Shock",
            "Tos",
            "Anorexia",
            "Exantema aislado"
          ],
          "c": 0
        },
        {
          "q": "¿Qué debe hacerse?",
          "ops": [
            "Tratamiento inmediato de sepsis y antibióticos apropiados",
            "Esperar cultivo antes de tratar",
            "Alta",
            "Antihistamínico únicamente"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "PED-C20",
      "t": "Emergencia por cuerpo extraño en vía aérea",
      "p": "Samuel J., 2 años. Mientras comía frutos secos: tos intensa súbita, cianosis y dificultad respiratoria. SV: FC 148, FR 44, PA 90/55, SatO₂ 82%. Examen: tos intensa, entrada de aire disminuida, estridor, cianosis peribucal.",
      "preg": [
        {
          "q": "Diagnóstico más probable:",
          "ops": [
            "Aspiración de cuerpo extraño",
            "Bronquiolitis",
            "Neumonía",
            "Asma crónica"
          ],
          "c": 0
        },
        {
          "q": "¿Qué antecedente es clave?",
          "ops": [
            "Inicio súbito durante la alimentación",
            "Fiebre de una semana",
            "Tos nocturna durante meses",
            "Contacto con tuberculosis"
          ],
          "c": 0
        },
        {
          "q": "¿Cuál es la prioridad?",
          "ops": [
            "Evaluar y manejar inmediatamente la obstrucción según sea parcial o completa",
            "Dar antibióticos",
            "Dar antitusivos",
            "Esperar radiografía antes de actuar en una obstrucción grave"
          ],
          "c": 0
        }
      ]
    }
  ],
  "medicina_interna": [
    {
      "id": "MI-C01",
      "t": "Síndrome coronario agudo",
      "p": "Juan Pérez, 64 años. HTA y tabaquismo. Dolor retroesternal opresivo de 60 min irradiado a brazo izquierdo con diaforesis y náuseas. PA 156/94, FC 104, FR 20, SpO₂ 94%, T 36,7 °C. Troponina I elevada; Hb 14,2; Leuc 11.800; Glucemia 142; Creatinina 1,0. ECG: elevación del ST en V2–V5.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico más probable?",
          "ops": [
            "Pericarditis aguda",
            "IAM con elevación del ST anterior",
            "Embolia pulmonar",
            "Disección aórtica"
          ],
          "c": 1
        }
      ],
      "raz": "Activar estrategia de reperfusión urgente, priorizando ICP primaria cuando esté disponible."
    },
    {
      "id": "MI-C02",
      "t": "Insuficiencia cardíaca aguda",
      "p": "María López, 72 años. HTA y cardiopatía isquémica. Disnea intensa progresiva, ortopnea y edema de MMII. PA 178/102, FC 118, FR 32, SpO₂ 82%. Crepitantes bilaterales, ingurgitación yugular, edema periférico. BNP elevado; Creatinina 1,3. Rx: congestión vascular y edema intersticial.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Edema agudo pulmonar cardiogénico",
            "Neumonía",
            "Crisis asmática",
            "Tromboembolismo pulmonar"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "MI-C03",
      "t": "Fibrilación auricular",
      "p": "Roberto Sánchez, 69 años. HTA y DM2. Palpitaciones, disnea y debilidad de 12 h. PA 128/76, FC 146, FR 20, SpO₂ 97%. ECG: taquicardia irregularmente irregular sin ondas P organizadas. Hb 13,8; K 4,2; TSH normal; Troponina negativa.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Flutter auricular",
            "Fibrilación auricular con respuesta ventricular rápida",
            "Taquicardia ventricular",
            "Taquicardia sinusal"
          ],
          "c": 1
        }
      ],
      "raz": "Además del control de frecuencia/ritmo, evaluar riesgo tromboembólico e indicación de anticoagulación."
    },
    {
      "id": "MI-C04",
      "t": "Emergencia hipertensiva",
      "p": "Carlos Méndez, 58 años. HTA sin tratamiento regular. Disnea intensa y dolor torácico. PA 232/138, FC 116, FR 34, SpO₂ 78%. Crepitantes bilaterales. Creatinina 2,1; Troponina elevada; BNP elevado. Rx: edema pulmonar.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Hipertensión arterial no complicada",
            "Emergencia hipertensiva",
            "Hipotensión",
            "Crisis de ansiedad"
          ],
          "c": 1
        }
      ],
      "raz": "HTA severa + daño agudo de órgano diana = emergencia hipertensiva."
    },
    {
      "id": "MI-C05",
      "t": "Neumonía adquirida en la comunidad",
      "p": "Ana Rojas, 67 años. DM2. Fiebre, tos productiva y disnea de 4 días. PA 104/62, FC 108, FR 28, SpO₂ 89%, T 39,1 °C. Leuc 18.500 (N 88%); PCR elevada; Creatinina 1,5. Rx: consolidación en lóbulo inferior derecho.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico más probable?",
          "ops": [
            "Neumonía adquirida en la comunidad",
            "Edema pulmonar",
            "Neumotórax",
            "Embolia pulmonar"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "MI-C06",
      "t": "EPOC exacerbado",
      "p": "Pedro Vargas, 71 años. Fumador 45 años, EPOC conocido. Aumento de disnea y expectoración purulenta. PA 142/84, FC 108, FR 30, SpO₂ 82%, T 37,8 °C. Gasometría: pH 7,29; PaCO₂ 64; PaO₂ 55; HCO₃ 29.",
      "preg": [
        {
          "q": "¿Qué trastorno presenta?",
          "ops": [
            "Insuficiencia respiratoria hipercápnica",
            "Alcalosis respiratoria",
            "Acidosis metabólica pura",
            "Hiperventilación psicógena"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "MI-C07",
      "t": "Tromboembolismo pulmonar",
      "p": "Luis Fernández, 45 años. Cirugía de rodilla hace 10 días. Disnea súbita y dolor torácico pleurítico. PA 110/70, FC 122, FR 30, SpO₂ 88%. Dímero D elevado; Troponina discretamente elevada. ECG: taquicardia sinusal.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico más probable?",
          "ops": [
            "Tromboembolismo pulmonar",
            "Neumonía lobar",
            "EPOC",
            "Pericarditis"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "MI-C08",
      "t": "Cetoacidosis diabética",
      "p": "Daniela Torres, 24 años. DM1. Vómitos, dolor abdominal, poliuria y polidipsia. PA 94/60, FC 124, FR 30. Glucosa 426; pH 7,18; HCO₃ 10; Cetonas positivas; Na 130; K 5,4.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Estado hiperosmolar",
            "Cetoacidosis diabética",
            "Hipoglucemia",
            "Acidosis respiratoria"
          ],
          "c": 1
        }
      ],
      "raz": "Reposición de volumen, insulina y manejo cuidadoso de electrolitos, especialmente potasio."
    },
    {
      "id": "MI-C09",
      "t": "Estado hiperosmolar hiperglucémico",
      "p": "José Ramírez, 76 años. DM2. Confusión, debilidad y poliuria. PA 88/54, FC 118, FR 22, SpO₂ 96%. Glucosa 780; Osmolaridad elevada; pH 7,34; HCO₃ 22; Cetonas mínimas.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Cetoacidosis diabética",
            "Estado hiperosmolar hiperglucémico",
            "Hipoglucemia",
            "Acidosis láctica aislada"
          ],
          "c": 1
        }
      ]
    },
    {
      "id": "MI-C10",
      "t": "Hipoglucemia grave",
      "p": "Elena Castro, 62 años. DM2 tratada con insulina. Alteración de conciencia. PA 138/82, FC 104, FR 18, SpO₂ 98%. Glucemia 38 mg/dL.",
      "preg": [
        {
          "q": "¿Cuál es la conducta inmediata?",
          "ops": [
            "Administrar glucosa según disponibilidad y estado de conciencia",
            "Administrar insulina",
            "Administrar metformina",
            "Suspender toda monitorización"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "MI-C11",
      "t": "Lesión renal aguda prerrenal",
      "p": "Miguel Flores, 70 años. HTA. Vómitos y diarrea 4 días. PA 88/56, FC 118, FR 20, SpO₂ 97%. Mucosas secas, oliguria. Creatinina 3,0; Urea elevada; Na urinario bajo.",
      "preg": [
        {
          "q": "¿Cuál es la causa más probable?",
          "ops": [
            "Lesión renal aguda prerrenal por hipovolemia",
            "Glomerulonefritis",
            "Obstrucción urinaria",
            "Síndrome nefrótico"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "MI-C12",
      "t": "Hiperkalemia",
      "p": "Sergio Molina, 65 años. ERC. Debilidad muscular. PA 110/68, FC 54, FR 18, SpO₂ 97%. K 7,1; Creatinina 4,2. ECG: ondas T picudas y ensanchamiento del QRS.",
      "preg": [
        {
          "q": "¿Cuál es una intervención inmediata para estabilizar el miocardio?",
          "ops": [
            "Calcio intravenoso",
            "Hierro intravenoso",
            "Vitamina B12",
            "Furosemida oral exclusivamente"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "MI-C13",
      "t": "Hemorragia digestiva alta",
      "p": "Andrés Silva, 59 años. Consumo frecuente de AINEs. Hematemesis y mareos. PA 86/52, FC 124, FR 24, SpO₂ 94%. Hb 7,8; Urea elevada; Creatinina 1,2.",
      "preg": [
        {
          "q": "¿Cuál es la prioridad inicial?",
          "ops": [
            "Estabilización hemodinámica",
            "Colonoscopia inmediata antes de estabilizar",
            "Alta domiciliaria",
            "Antidiarreicos"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "MI-C14",
      "t": "Pancreatitis aguda",
      "p": "Ricardo Gómez, 48 años. Consumo importante de alcohol. Dolor epigástrico intenso irradiado a espalda y vómitos. PA 105/68, FC 112, FR 22, T 38,0 °C. Lipasa 1.800; Leuc 16.000; Glucosa 180.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Pancreatitis aguda",
            "Colecistitis",
            "Apendicitis",
            "Hepatitis viral"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "MI-C15",
      "t": "Colangitis aguda",
      "p": "Patricia Herrera, 63 años. Colelitiasis conocida. Fiebre, dolor en hipocondrio derecho e ictericia. PA 92/58, FC 120, FR 24, T 39,3 °C. Bili total 6,8; FA y GGT elevadas; Leuc 19.000; PCR elevada.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Colangitis aguda",
            "Hepatitis autoinmune",
            "Gastritis",
            "Pancreatitis crónica"
          ],
          "c": 0
        }
      ],
      "raz": "Fiebre + dolor en hipocondrio derecho + ictericia = tríada de Charcot."
    },
    {
      "id": "MI-C16",
      "t": "Cirrosis descompensada",
      "p": "Manuel Ortiz, 57 años. Cirrosis hepática. Aumento progresivo del abdomen y somnolencia. PA 108/66, FC 96, FR 20, T 37,4 °C. Ascitis, edema periférico y asterixis. Albúmina 2,4; INR 1,8; Bili 3,2; Na 130.",
      "preg": [
        {
          "q": "¿Qué complicaciones están presentes?",
          "ops": [
            "Ascitis y encefalopatía hepática",
            "Solo gastritis",
            "Solo hepatitis aguda",
            "Solo pancreatitis"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "MI-C17",
      "t": "Sepsis de foco urinario",
      "p": "Laura Mendoza, 74 años. DM. Fiebre, escalofríos, disuria y confusión. PA 82/48, FC 126, FR 28, T 39,5 °C, SpO₂ 94%. Leuc 24.000; Lactato 4,5; Creatinina 2,2; PCR elevada. Orina: leucocituria y bacteriuria.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico sindrómico?",
          "ops": [
            "Shock séptico de probable foco urinario",
            "Hipertensión severa",
            "Insuficiencia cardíaca crónica estable",
            "Hipoglucemia"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "MI-C18",
      "t": "Accidente cerebrovascular isquémico",
      "p": "Fernando Ruiz, 68 años. FA sin anticoagulación. Inicio súbito de dificultad para hablar y pérdida de fuerza en hemicuerpo derecho. PA 174/96; FC 118 irregular; SpO₂ 97%. Afasia y hemiparesia derecha. TC sin contraste: sin hemorragia inicial.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico más probable?",
          "ops": [
            "ACV isquémico agudo",
            "Hemorragia subaracnoidea",
            "Hipoglucemia",
            "Meningitis"
          ],
          "c": 0
        }
      ],
      "raz": "Determinar hora de inicio/última vez conocido bien y valorar elegibilidad para reperfusión."
    },
    {
      "id": "MI-C19",
      "t": "Meningitis bacteriana",
      "p": "Jorge Salazar, 32 años. Fiebre alta, cefalea intensa, vómitos y rigidez de nuca. PA 118/70, FC 112, FR 22, T 39,4 °C, SpO₂ 96%. Leuc 18.000 con neutrofilia; PCR elevada. LCR turbio: pleocitosis neutrofílica, proteínas elevadas y glucosa disminuida.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico más probable?",
          "ops": [
            "Meningitis bacteriana",
            "Migraña",
            "Encefalopatía hepática",
            "Hipoglucemia"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "MI-C20",
      "t": "Artritis gotosa aguda",
      "p": "Eduardo Paredes, 56 años. HTA, ERC y episodios previos similares. Dolor súbito e intenso en primera articulación metatarsofalángica derecha. PA 146/88, FC 96, FR 18, T 38,1 °C. Articulación eritematosa, caliente, edematosa y muy dolorosa. Ácido úrico 9,2; Leuc 12.800; PCR elevada. Artrocentesis: cristales con birrefringencia negativa.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Artritis séptica",
            "Artritis gotosa aguda",
            "Artritis reumatoide",
            "Osteoartritis"
          ],
          "c": 1
        }
      ],
      "raz": "Cristales de urato monosódico con birrefringencia negativa apoyan el diagnóstico de gota."
    }
  ],
  "ginecologia": [
    {
      "id": "GO-C01",
      "t": "Embarazo ectópico tubárico",
      "p": "Valentina Rojas, 28 años. EIP previa. G2P0. Dolor hipogástrico derecho y sangrado vaginal escaso de 2 días. PA 108/68, FC 102, FR 18, SpO₂ 98%, T 36,8 °C. β-hCG 3.850 UI/L; Hb 11,8; Leuc 9.600. ETV: cavidad uterina sin saco gestacional; masa anexial derecha de 2,8 cm; escaso líquido libre.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico más probable?",
          "ops": [
            "Aborto espontáneo",
            "Embarazo ectópico tubárico",
            "Mola hidatidiforme",
            "Quiste folicular"
          ],
          "c": 1
        }
      ],
      "raz": "Embarazo positivo + ausencia de embarazo intrauterino visible + masa anexial + dolor/sangrado = sospecha de embarazo ectópico."
    },
    {
      "id": "GO-C02",
      "t": "Embarazo ectópico roto",
      "p": "Mariana Fernández, 31 años. Ectópico previo. Dolor abdominal súbito intenso, mareos y síncope. PA 78/46, FC 132, FR 28, SpO₂ 94%, T 36,5 °C. Abdomen doloroso, defensa y dolor referido al hombro. β-hCG 6.200; Hb 8,2; Lactato 4,2. Eco: líquido libre abundante y masa anexial.",
      "preg": [
        {
          "q": "¿Cuál es la conducta prioritaria?",
          "ops": [
            "Manejo expectante",
            "Estabilización hemodinámica y tratamiento quirúrgico urgente",
            "Antibióticos orales",
            "Alta domiciliaria"
          ],
          "c": 1
        }
      ]
    },
    {
      "id": "GO-C03",
      "t": "Aborto espontáneo",
      "p": "Camila Vargas, 26 años. G2P1, ~9 semanas. Sangrado vaginal y dolor tipo cólico. PA 112/70, FC 92, FR 18, SpO₂ 99%, T 36,7 °C. Hb 12,4; β-hCG positiva. ETV: saco gestacional intrauterino sin actividad embrionaria, hallazgos compatibles con pérdida gestacional.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Embarazo ectópico",
            "Aborto espontáneo",
            "Placenta previa",
            "Embarazo molar"
          ],
          "c": 1
        }
      ]
    },
    {
      "id": "GO-C04",
      "t": "Preeclampsia con características graves",
      "p": "Gabriela Mendoza, 34 años. 35 semanas. Cefalea intensa, visión borrosa y dolor epigástrico. PA 172/114, FC 96, FR 20, SpO₂ 97%, T 36,8 °C. Plaquetas 86.000; AST 126; ALT 118; Creatinina 1,4; Proteinuria positiva.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Hipertensión gestacional leve",
            "Preeclampsia con características graves",
            "Diabetes gestacional",
            "Hipotensión gestacional"
          ],
          "c": 1
        }
      ],
      "raz": "Hipertensión severa + síntomas neurológicos + alteración hepática, renal y hematológica."
    },
    {
      "id": "GO-C05",
      "t": "Eclampsia",
      "p": "Andrea Salinas, 22 años. 33 semanas, sin controles adecuados. Convulsión generalizada. Post-convulsión: PA 184/116, FC 110, FR 22, SpO₂ 93%. Plaquetas 102.000; AST elevada; Proteinuria positiva.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Epilepsia primaria",
            "Eclampsia",
            "Hipoglucemia",
            "ACV hemorrágico"
          ],
          "c": 1
        }
      ],
      "raz": "Estabilización materna, sulfato de magnesio, control de HTA severa y resolución del embarazo según situación materno-fetal."
    },
    {
      "id": "GO-C06",
      "t": "Síndrome HELLP",
      "p": "Patricia López, 36 años. 34 semanas. Dolor epigástrico intenso, náuseas y cefalea. PA 168/108, FC 104, FR 20, SpO₂ 96%. Hb 9,8; Plaquetas 58.000; AST 280; ALT 240; LDH elevada; Bili indirecta elevada.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Síndrome HELLP",
            "Hepatitis viral aislada",
            "Colecistitis",
            "Anemia ferropénica"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "GO-C07",
      "t": "Desprendimiento prematuro de placenta",
      "p": "Sofía Herrera, 30 años. HTA. 36 semanas. Dolor abdominal intenso y sangrado vaginal oscuro. PA 146/92, FC 118, FR 24, SpO₂ 95%, T 37,0 °C. Útero hipertónico y doloroso. Monitoreo: bradicardia fetal persistente.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico más probable?",
          "ops": [
            "Placenta previa",
            "Desprendimiento prematuro de placenta",
            "Trabajo de parto normal",
            "Rotura prematura de membranas"
          ],
          "c": 1
        }
      ]
    },
    {
      "id": "GO-C08",
      "t": "Placenta previa",
      "p": "Daniela Morales, 35 años. Tres cesáreas previas. 33 semanas. Sangrado vaginal abundante, rojo brillante, sin dolor. PA 118/76, FC 106, FR 18, SpO₂ 97%. Eco: placenta cubriendo el orificio cervical interno.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Desprendimiento placentario",
            "Placenta previa",
            "Rotura uterina",
            "Aborto"
          ],
          "c": 1
        }
      ],
      "raz": "Evitar tacto vaginal digital hasta haber descartado placenta previa."
    },
    {
      "id": "GO-C09",
      "t": "Hemorragia posparto por atonía uterina",
      "p": "Laura Castro, 29 años. Parto vaginal reciente de RN de 4.200 g. Sangrado vaginal abundante inmediato posparto. PA 84/50, FC 128, FR 24, SpO₂ 94%. Útero aumentado de tamaño y flácido. Hb 8,1; Lactato 4,0.",
      "preg": [
        {
          "q": "¿Cuál es la causa más probable?",
          "ops": [
            "Atonía uterina",
            "Endometritis",
            "Placenta previa",
            "Embarazo ectópico"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "GO-C10",
      "t": "Espectro de placenta acreta",
      "p": "Mónica Pérez, 38 años. Cuatro cesáreas previas y placenta previa. Control prenatal. Eco: placenta previa con múltiples lagunas vasculares y signos sugestivos de invasión anormal. Hb 10,1; Plaquetas 185.000.",
      "preg": [
        {
          "q": "¿Qué diagnóstico debe sospecharse?",
          "ops": [
            "Espectro de placenta acreta",
            "Desprendimiento placentario",
            "Embarazo ectópico",
            "Mola completa"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "GO-C11",
      "t": "Diabetes gestacional",
      "p": "Natalia Ríos, 32 años. Obesidad y madre con DM2. 28 semanas. PTOG: valores diagnósticos de diabetes gestacional. Eco: crecimiento fetal por encima del percentil esperado.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Diabetes mellitus tipo 1",
            "Diabetes gestacional",
            "Hipoglucemia gestacional",
            "Diabetes insípida"
          ],
          "c": 1
        }
      ]
    },
    {
      "id": "GO-C12",
      "t": "Corioamnionitis",
      "p": "Verónica Silva, 27 años. 39 semanas. Rotura de membranas de 22 horas. Fiebre y dolor uterino. PA 110/68, FC 118, FR 22, T 39,0 °C. Sensibilidad uterina y líquido amniótico maloliente. Leuc 19.000; PCR elevada.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Corioamnionitis/infección intraamniótica",
            "Placenta previa",
            "Preeclampsia",
            "Candidiasis"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "GO-C13",
      "t": "Rotura prematura de membranas pretérmino",
      "p": "Carolina Torres, 24 años. 31 semanas. Salida espontánea de líquido por vagina. PA 112/70, FC 94, FR 18, T 36,6 °C. Salida de líquido claro. Eco: líquido amniótico disminuido.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Rotura prematura de membranas pretérmino",
            "Incontinencia urinaria",
            "Placenta previa",
            "Vaginosis bacteriana"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "GO-C14",
      "t": "Restricción del crecimiento fetal",
      "p": "Elena Vargas, 29 años. HTA crónica. 34 semanas. Eco: peso fetal estimado < percentil 10, circunferencia abdominal disminuida y Doppler de arteria umbilical alterado.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Restricción del crecimiento fetal",
            "Macrosomía fetal",
            "Embarazo molar",
            "Polihidramnios"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "GO-C15",
      "t": "Macrosomía fetal asociada a diabetes",
      "p": "Rosa Mendoza, 36 años. Diabetes gestacional con control irregular. 38 semanas. Eco: peso fetal estimado > percentil 90, circunferencia abdominal aumentada y líquido amniótico aumentado.",
      "preg": [
        {
          "q": "¿Qué complicación fetal es más probable?",
          "ops": [
            "Macrosomía fetal",
            "Restricción del crecimiento",
            "Anencefalia",
            "Oligohidramnios"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "GO-C16",
      "t": "Endometritis puerperal",
      "p": "Claudia Fernández, 30 años. Cesárea hace 4 días. Fiebre y dolor abdominal bajo. PA 112/70, FC 112, FR 20, SpO₂ 98%, T 39,1 °C. Útero doloroso y secreción vaginal maloliente. Leuc 18.500; PCR elevada.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Endometritis puerperal",
            "Mastitis",
            "Cistitis simple",
            "Trombosis venosa profunda"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "GO-C17",
      "t": "Mastitis puerperal",
      "p": "Fernanda Salazar, 25 años. Parto vaginal hace 3 semanas. Lactancia materna. Dolor y enrojecimiento de mama derecha, fiebre y malestar. PA 116/72, FC 104, FR 18, T 38,7 °C. Área eritematosa, caliente y dolorosa en mama derecha. Leuc 14.500.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico más probable?",
          "ops": [
            "Mastitis puerperal",
            "Endometritis",
            "Preeclampsia",
            "Hemorragia posparto"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "GO-C18",
      "t": "Trombosis venosa profunda puerperal",
      "p": "Gabriela Ortiz, 33 años. Cesárea hace 8 días. Dolor e hinchazón de pierna izquierda. PA 118/74, FC 98, FR 18, SpO₂ 97%. Edema unilateral, aumento de temperatura y dolor en pantorrilla. Dímero D elevado.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico que debe descartarse?",
          "ops": [
            "Trombosis venosa profunda",
            "Mastitis",
            "Endometritis",
            "Celulitis facial"
          ],
          "c": 0
        }
      ],
      "raz": "Estudio de elección habitual: ecografía Doppler venosa de la extremidad afectada."
    },
    {
      "id": "GO-C19",
      "t": "Cáncer de cuello uterino",
      "p": "Teresa Ramírez, 48 años. Tamizaje irregular. VPH de alto riesgo persistente. Sangrado poscoital. PA 122/76, FC 88, FR 18, T 36,6 °C. Lesión friable en cuello uterino.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico que debe descartarse prioritariamente?",
          "ops": [
            "Cáncer de cuello uterino",
            "Candidiasis",
            "Vaginosis bacteriana",
            "Endometriosis"
          ],
          "c": 0
        }
      ],
      "raz": "Sangrado poscoital + lesión cervical visible + VPH de alto riesgo requiere evaluación diagnóstica."
    },
    {
      "id": "GO-C20",
      "t": "Torsión ovárica",
      "p": "Isabel Méndez, 23 años. Quiste ovárico conocido de 7 cm. Dolor pélvico súbito intenso derecho, náuseas y vómitos. PA 118/72, FC 108, FR 20, SpO₂ 98%, T 37,2 °C. Dolor intenso en FID. Leuc 13.800; β-hCG negativa; Hb 12,6. ETV: ovario derecho aumentado, edema estromal y flujo Doppler disminuido.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico más probable?",
          "ops": [
            "Torsión ovárica",
            "Embarazo ectópico",
            "Enfermedad inflamatoria pélvica",
            "Endometriosis"
          ],
          "c": 0
        }
      ],
      "raz": "Dolor pélvico súbito + masa ovárica + náuseas/vómitos = emergencia ginecológica hasta demostrar lo contrario."
    }
  ],
  "cirugia": [
    {
      "id": "CIR-C01",
      "t": "Apendicitis aguda",
      "p": "Juan Pérez, 22 años, masculino. Sin antecedentes relevantes. Dolor abdominal de 18 horas de evolución que inició en epigastrio y se localizó en fosa ilíaca derecha. Náuseas y anorexia. PA 118/72, FC 102, FR 18, SpO₂ 98%, T 38,1 °C. Examen: dolor en FID, defensa localizada y signos de irritación peritoneal. Lab: Leuc 15.800 (N 88%), PCR 86 mg/L, Hb 14,2. TC: apéndice aumentado de calibre con cambios inflamatorios periapendiculares.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico más probable?",
          "ops": [
            "Diverticulitis",
            "Apendicitis aguda",
            "Colecistitis",
            "Pancreatitis"
          ],
          "c": 1
        }
      ],
      "raz": "Dolor migratorio + fiebre + leucocitosis + hallazgos inflamatorios apendiculares."
    },
    {
      "id": "CIR-C02",
      "t": "Apendicitis perforada",
      "p": "Roberto Salinas, 47 años, masculino. DM2. Dolor abdominal intenso de 3 días, fiebre y deterioro general. PA 92/58, FC 124, FR 26, SpO₂ 94%, T 39,2 °C. Abdomen doloroso difusamente, defensa involuntaria. Lab: Leuc 22.400, Lactato 4,1, PCR 240, Creatinina 1,6. TC: apéndice perforado con colección pericecal.",
      "preg": [
        {
          "q": "¿Cuál es la complicación principal?",
          "ops": [
            "Apendicitis perforada con infección intraabdominal",
            "Gastritis",
            "Colelitiasis",
            "Pancreatitis crónica"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "CIR-C03",
      "t": "Colecistitis aguda calculosa",
      "p": "María Fernández, 42 años, femenino. Obesidad y cólicos biliares previos. Dolor en hipocondrio derecho de 18 h, fiebre y vómitos. PA 124/78, FC 104, FR 20, SpO₂ 97%, T 38,4 °C. Murphy positivo. Lab: Leuc 14.900, AST 72, ALT 81, Bili 1,6, PCR elevada. Eco: cálculo impactado en cuello vesicular, engrosamiento parietal y líquido perivesicular.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Colecistitis aguda calculosa",
            "Hepatitis viral",
            "Pancreatitis",
            "Apendicitis"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "CIR-C04",
      "t": "Coledocolitiasis",
      "p": "Elena Vargas, 58 años, femenino. Colelitiasis conocida. Ictericia progresiva y dolor en hipocondrio derecho. PA 120/74, FC 96, FR 18, SpO₂ 98%, T 37,2 °C. Lab: Bili total 7,2, Bili directa 5,9, FA 620, GGT 780, AST 140, ALT 168. Eco: dilatación de vía biliar.",
      "preg": [
        {
          "q": "¿Qué diagnóstico debe sospecharse?",
          "ops": [
            "Coledocolitiasis",
            "Apendicitis",
            "Pancreatitis autoinmune",
            "Diverticulitis"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "CIR-C05",
      "t": "Colangitis aguda",
      "p": "Carlos Mendoza, 67 años, masculino. Colelitiasis. Fiebre, ictericia y dolor abdominal. PA 88/54, FC 126, FR 24, SpO₂ 94%, T 39,5 °C. Confuso, ictérico, doloroso en hipocondrio derecho. Lab: Leuc 21.000, Bili total 8,5, FA 720, Lactato 4,5, Creatinina 1,8.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico más probable?",
          "ops": [
            "Colangitis aguda grave",
            "Colecistitis simple",
            "Hepatitis viral",
            "Gastritis"
          ],
          "c": 0
        }
      ],
      "raz": "Infección biliar + obstrucción + disfunción orgánica."
    },
    {
      "id": "CIR-C06",
      "t": "Pancreatitis aguda biliar",
      "p": "Andrés Rojas, 51 años, masculino. Cólicos biliares previos. Dolor epigástrico irradiado a espalda y vómitos. PA 108/68, FC 110, FR 22, SpO₂ 96%, T 37,8 °C. Lab: Lipasa 1.850, AST 280, ALT 360, Bili 3,2, Leuc 15.200. Eco: colelitiasis.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Pancreatitis aguda probablemente biliar",
            "Apendicitis",
            "Diverticulitis",
            "Obstrucción urinaria"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "CIR-C07",
      "t": "Úlcera péptica perforada",
      "p": "Miguel Torres, 55 años, masculino. Consumo frecuente de AINEs. Dolor epigástrico súbito intenso. PA 96/60, FC 118, FR 24, SpO₂ 96%, T 37,4 °C. Abdomen rígido, dolor difuso, defensa involuntaria. Lab: Leuc 17.600, Hb 12,8, Lactato 3,1. TC: neumoperitoneo y líquido libre.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Úlcera péptica perforada",
            "Gastritis",
            "Colelitiasis",
            "Pancreatitis crónica"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "CIR-C08",
      "t": "Obstrucción intestinal por adherencias",
      "p": "Luis Herrera, 64 años, masculino. Dos laparotomías previas. Dolor cólico, vómitos y ausencia de deposiciones y gases. PA 110/70, FC 108, FR 20, SpO₂ 97%, T 37,1 °C. Lab: Leuc 13.500, Na 131, K 3,2, Creatinina 1,2. TC: asas dilatadas con punto de transición.",
      "preg": [
        {
          "q": "¿Cuál es la causa más probable?",
          "ops": [
            "Adherencias posquirúrgicas",
            "Colecistitis",
            "Pancreatitis",
            "Hepatitis"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "CIR-C09",
      "t": "Hernia inguinal estrangulada",
      "p": "Pedro Castillo, 70 años, masculino. Hernia inguinal conocida. Aumento doloroso en región inguinal irreductible. PA 94/58, FC 120, FR 24, T 38,3 °C. Masa inguinal dolorosa, irreductible, cambios inflamatorios. Lab: Leuc 19.800, Lactato 3,8.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Hernia inguinal estrangulada",
            "Hernia reducible",
            "Lipoma",
            "Adenopatía"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "CIR-C10",
      "t": "Diverticulitis complicada",
      "p": "Rosa Aguilar, 62 años, femenino. Enfermedad diverticular. Dolor en FII, fiebre y estreñimiento. PA 112/70, FC 106, FR 20, SpO₂ 98%, T 38,7 °C. Lab: Leuc 17.200, PCR 185. TC: diverticulitis sigmoidea con colección pericólica de 5 cm.",
      "preg": [
        {
          "q": "¿Qué complicación presenta?",
          "ops": [
            "Absceso pericólico",
            "Pancreatitis",
            "Colecistitis",
            "Apendicitis"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "CIR-C11",
      "t": "Isquemia mesentérica aguda",
      "p": "Fernando López, 76 años, masculino. FA sin anticoagulación. Dolor abdominal intenso de inicio súbito. PA 102/64, FC 128 irregular, FR 26, SpO₂ 95%, T 37,2 °C. Dolor desproporcionado al examen. Lab: Leuc 18.900, Lactato 5,2, Creatinina 1,5. TC angio: oclusión de arteria mesentérica superior.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Isquemia mesentérica aguda embólica",
            "Gastritis",
            "Colecistitis",
            "Pancreatitis"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "CIR-C12",
      "t": "Aneurisma de aorta abdominal roto",
      "p": "Jorge Ramírez, 72 años, masculino. Tabaquismo y aneurisma conocido. Dolor abdominal y lumbar súbito con síncope. PA 68/42, FC 132, FR 28, SpO₂ 91%. Masa abdominal pulsátil. Lab: Hb 8,4, Lactato 6,1, Creatinina 1,4.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Rotura de aneurisma de aorta abdominal",
            "Cólico renal",
            "Pancreatitis",
            "Diverticulitis"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "CIR-C13",
      "t": "Neumotórax a tensión",
      "p": "Diego Morales, 29 años, masculino. Accidente de tránsito. Disnea progresiva tras trauma torácico. PA 78/48, FC 138, FR 34, SpO₂ 82%. Ausencia de ruidos respiratorios derechos, hiperresonancia y distensión yugular.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Neumotórax a tensión",
            "Neumonía",
            "Hemotórax simple",
            "Contusión pulmonar aislada"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "CIR-C14",
      "t": "Hemotórax masivo",
      "p": "Alejandro Silva, 35 años, masculino. Trauma torácico penetrante. Disnea intensa y mareos. PA 74/46, FC 140, FR 32, SpO₂ 86%. Disminución de ruidos en hemitórax izquierdo. Lab: Hb 7,5, Lactato 5,4. Rx: opacificación extensa.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Hemotórax masivo",
            "Neumotórax simple",
            "Asma",
            "Neumonía"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "CIR-C15",
      "t": "Taponamiento cardíaco traumático",
      "p": "Mauricio Pérez, 31 años, masculino. Herida penetrante precordial. PA 82/50, FC 128, FR 26, SpO₂ 93%. Distensión yugular, ruidos cardíacos apagados y shock. FAST: líquido pericárdico.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Taponamiento cardíaco traumático",
            "Neumotórax simple",
            "Broncoespasmo",
            "Embolia pulmonar crónica"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "CIR-C16",
      "t": "Fractura pélvica con hemorragia",
      "p": "Esteban Gómez, 40 años, masculino. Accidente de alta energía. Dolor pélvico intenso y mareos. PA 80/48, FC 136, FR 28, SpO₂ 94%. Lab: Hb 7,9, Lactato 5,0, INR 1,4. Rx: fractura pélvica inestable.",
      "preg": [
        {
          "q": "¿Cuál es la principal preocupación?",
          "ops": [
            "Hemorragia pélvica potencialmente masiva",
            "Gastritis",
            "Colecistitis",
            "Cistitis simple"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "CIR-C17",
      "t": "Quemadura extensa",
      "p": "Ricardo Núñez, 45 años, masculino. Quemaduras por incendio doméstico. PA 96/60, FC 124, FR 30, SpO₂ 94%, T 36,1 °C. Quemaduras extensas, hollín alrededor de boca y disfonía. Lab: Lactato 5,8, Hb 16,2, Na 146.",
      "preg": [
        {
          "q": "¿Cuál es la prioridad adicional especialmente importante?",
          "ops": [
            "Evaluación precoz de vía aérea por posible lesión inhalatoria",
            "Aplicar crema y alta",
            "Esperar edema de vía aérea establecido",
            "Realizar colonoscopia"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "CIR-C18",
      "t": "Fascitis necrotizante",
      "p": "Samuel Ortiz, 58 años, masculino. DM2 mal controlada. Dolor intenso y progresivo en miembro inferior derecho. PA 88/52, FC 126, FR 28, SpO₂ 95%, T 39,1 °C. Edema intenso, eritema, ampollas y dolor desproporcionado. Lab: Leuc 24.000, PCR 310, Lactato 4,8, Creatinina 2,0, Na 128.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Fascitis necrotizante",
            "Celulitis leve",
            "Trombosis venosa profunda aislada",
            "Dermatitis alérgica"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "CIR-C19",
      "t": "Torsión testicular",
      "p": "Nicolás Vargas, 17 años, masculino. Dolor testicular derecho súbito de 4 h con náuseas. PA 120/74, FC 108, FR 20, T 36,9 °C. Testículo derecho elevado, posición horizontal, reflejo cremastérico ausente. Lab: Leuc 10.800, PCR normal, orina sin infección.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico más probable?",
          "ops": [
            "Torsión testicular",
            "Epididimitis",
            "Orquitis viral",
            "Varicocele"
          ],
          "c": 0
        }
      ]
    },
    {
      "id": "CIR-C20",
      "t": "Sepsis abdominal por perforación intestinal",
      "p": "Antonio Cabrera, 63 años, masculino. Diverticulosis. Dolor abdominal intenso, fiebre y deterioro. PA 82/48, FC 132, FR 30, SpO₂ 92%, T 39,4 °C. Abdomen rígido, dolor difuso, irritación peritoneal. Lab: Leuc 25.600, Lactato 6,2, Creatinina 2,1, PCR 330, Procalcitonina elevada. TC: perforación de colon sigmoide, neumoperitoneo.",
      "preg": [
        {
          "q": "¿Cuál es el diagnóstico?",
          "ops": [
            "Sepsis/shock séptico de origen intraabdominal por perforación intestinal",
            "Gastroenteritis simple",
            "Colecistitis",
            "Pancreatitis"
          ],
          "c": 0
        }
      ]
    }
  ]
};

const BIB_BOLIVIA: string[] = [
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
const BIB_INTERNACIONAL: string[] = [
  "AHA. 2025 Guidelines for CPR and Emergency Cardiovascular Care. Circulation. 2025.",
  "AHA/AAP. Pediatric Basic and Advanced Life Support Guidelines. 2025.",
  "ILCOR. International Consensus on CPR Science (CoSTR). 2025.",
  "SCCM. Surviving Sepsis Campaign: Guidelines for Sepsis and Septic Shock. 2026.",
  "ADA. Standards of Care in Diabetes—2026. Diabetes Care. 2026.",
  "GINA. Global Strategy for Asthma Management and Prevention. 2025 Update.",
  "GOLD. Global Strategy for Prevention, Diagnosis and Management of COPD. 2026 Report.",
  "WHO. Guideline on Management of Pneumonia and Diarrhoea in Children up to 10 Years. Ginebra; 2024.",
  "WHO. Consolidated Guidelines for Postpartum Haemorrhage. Ginebra; 2025.",
  "WHO. Consolidated Guidelines for Postpartum Haemorrhage: Implementation Guide. Ginebra; 2026.",
  "ACOG. First and Second Stage Labor Management. Clinical Practice Guideline. 2024.",
  "ACOG. Gestational Hypertension and Preeclampsia. Practice Bulletin; 2024.",
  "ACOG. Postpartum Hemorrhage. Practice Bulletin; 2024–2025.",
  "ESC. 2024 Guidelines Chronic Coronary Syndromes. Eur Heart J. 2024.",
  "ESC. 2024 Guidelines Peripheral Arterial and Aortic Diseases. Eur Heart J. 2024.",
  "ESC. 2023 Guidelines Acute Coronary Syndromes. Eur Heart J. 2023.",
  "AAP. Red Book: 2024–2027 Report of the Committee on Infectious Diseases. 33rd ed.",
  "ACS-COT. Advanced Trauma Life Support (ATLS). 11th ed. 2025.",
  "WSES. Guidelines for Emergency General Surgery. 2024–2026.",
  "ACR. ACR Appropriateness Criteria. 2024–2026.",
  "AIUM. Practice Parameters and Technical Standards. 2024–2026.",
  "WFUMB. Guidelines and Recommendations. Vigentes.",
  "WHO. Clinical Guidelines and Recommendations. 2024–2026.",
  "CDC. Clinical Guidelines for Infectious Diseases. 2024–2026.",
  "Kliegman RM et al. Nelson Textbook of Pediatrics. 22nd ed. Elsevier.",
  "Jameson JL et al. Harrison's Principles of Internal Medicine. McGraw-Hill.",
  "Brunicardi FC et al. Schwartz's Principles of Surgery. McGraw-Hill.",
  "Tintinalli JE et al. Tintinalli's Emergency Medicine. McGraw-Hill."
];

type Screen = 'HOME' | 'PLANS' | 'STUDY' | 'CASES' | 'SIM' | 'PROFILE' | 'BIB';
type UserRecord = { id: string; email: string; name: string; plan: Plan };
type Progress = {
  spec: Record<string, Record<string, boolean>>;
  sim: { date: string; correct: number; total: number }[];
  xp: number; answered: number; correct: number; streak: number;
  lastStudyDate: string | null; dailyDate: string | null;
};
type Simulation = { list: Question[]; index: number; answers: (number | null)[]; seconds: number };

const C = {
  n9: '#081226', n8: '#0A1A33', n7: '#10264A', n6: '#16305C',
  gold: '#C9A24B', light: '#E6C87E', white: '#F7F5F0', muted: '#9AA7BD',
  ok: '#3FB27F', bad: '#E25555', border: 'rgba(201,162,75,0.32)',
};
const PLANS: Record<Plan, { name: string; price: string; amount: number; features: string[] }> = {
  free: { name: 'Free', price: 'Gratis', amount: 0, features: ['Hasta 5 preguntas por especialidad', 'Seguimiento de progreso', 'Acceso a la comunidad'] },
  regular: { name: 'Regular', price: '599 Bs', amount: 599, features: ['Todas las preguntas disponibles', 'Explicaciones detalladas', 'Progreso y estadísticas'] },
  pro: { name: 'Pro', price: '999 Bs', amount: 999, features: ['Todo lo del plan Regular', 'Casos clínicos integrados', 'Simulacros cronometrados', 'Historial de rendimiento'] },
};
const EMPTY: Progress = { spec: {}, sim: [], xp: 0, answered: 0, correct: 0, streak: 0, lastStudyDate: null, dailyDate: null };
const dateToday = () => new Date().toISOString().slice(0, 10);

function shuffleItems<T>(items: readonly T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function shuffleQuestionOptions<T extends { ops: string[]; c: number }>(question: T): T {
  const options = shuffleItems(question.ops.map((option, index) => ({
    option,
    isCorrect: index === question.c,
  })));
  return {
    ...question,
    ops: options.map(({ option }) => option),
    c: options.findIndex(({ isCorrect }) => isCorrect),
  };
}

export default function AppIndex() {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<UserRecord | null>(null);
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [screen, setScreen] = useState<Screen>('HOME');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [authError, setAuthError] = useState('');
  const [studyQuestions, setStudyQuestions] = useState<Question[]>([]);
  const [studySpec, setStudySpec] = useState('pediatria');
  const [studyIndex, setStudyIndex] = useState(0);
  const [studyCorrect, setStudyCorrect] = useState(0);
  const [studyFinished, setStudyFinished] = useState(false);
  const [dailyStudy, setDailyStudy] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [caseSpec, setCaseSpec] = useState('pediatria');
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [caseIndex, setCaseIndex] = useState(0);
  const [simCount, setSimCount] = useState(20);
  const [sim, setSim] = useState<Simulation | null>(null);
  const [simResult, setSimResult] = useState<{ list: Question[]; answers: (number | null)[]; correct: number } | null>(null);
  const [latestPaymentRequest, setLatestPaymentRequest] = useState<PaymentRequest | null>(null);
  const [payPlan, setPayPlan] = useState<Plan | null>(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const simulationRef = useRef<Simulation | null>(null);
  const finishSimulationRef = useRef<() => void>(() => undefined);
  const hasSimulation = sim !== null;

  const loadAccount = useCallback(async (authUser: User) => {
    if (!supabase) throw new Error('Falta configurar la conexión segura con Supabase.');
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
    if (error) throw error;

    const localUsername = authUser.email?.split('@')[0] ?? authUser.id.slice(0, 8);
    const rawProgress = await AsyncStorage.getItem(`msla_prog_${authUser.id}`);
    const { data: paymentRequest, error: paymentError } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (paymentError) throw paymentError;

    setUsername(localUsername);
    setUser({
      id: authUser.id,
      email: authUser.email ?? '',
      name: profile.display_name || localUsername,
      plan: profile.plan,
    });
    setLatestPaymentRequest(paymentRequest);
    setProgress(rawProgress ? { ...EMPTY, ...JSON.parse(rawProgress) } : EMPTY);
    setAuthenticated(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    const restore = async () => {
      try {
        if (!supabase) {
          setAuthError('Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY para habilitar las cuentas.');
          return;
        }
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (data.session) await loadAccount(data.session.user);
      } catch (error) {
        if (mounted) {
          setAuthError(error instanceof Error ? error.message : 'No se pudo cargar la cuenta.');
        }
      } finally {
        if (mounted) setReady(true);
      }
    };
    void restore();
    return () => { mounted = false; };
  }, [loadAccount]);

  useEffect(() => {
    if (authenticated && user) void AsyncStorage.setItem(`msla_prog_${user.id}`, JSON.stringify(progress));
  }, [authenticated, progress, user]);

  const plan = user?.plan ?? 'free';
  const level = Math.floor(progress.xp / 100) + 1;
  const questions = Object.values(FULL_BANK_DATA).flat();
  const casesTotal = Object.values(FULL_CASES_DATA).reduce((sum, list) => sum + list.length, 0);
  const daily = questions.length
    ? questions[dateToday().replace(/-/g, '').split('').reduce((sum, digit) => sum + Number(digit), 0) % questions.length]
    : null;

  const handleAuth = async () => {
    const email = authEmail.trim().toLowerCase();
    setAuthError('');
    if (!email || !password) return setAuthError('Completa el correo electrónico y la contraseña.');
    if (!supabase) return setAuthError('Falta configurar la conexión segura con Supabase.');
    try {
      if (authMode === 'register') {
        if (password.length < 8) return setAuthError('La contraseña debe tener al menos 8 caracteres.');
        if (password !== passwordConfirm) return setAuthError('Las contraseñas no coinciden.');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: authName.trim() || email.split('@')[0] } },
        });
        if (error) throw error;
        if (!data.session || !data.user) {
          setAuthError('Cuenta creada. Confirma tu correo electrónico y luego inicia sesión.');
          return;
        }
        await loadAccount(data.user);
        setScreen('PLANS');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.user) throw new Error('Supabase no devolvió una cuenta autenticada.');
        await loadAccount(data.user);
        setScreen('HOME');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'No fue posible completar el acceso.');
    }
  };

  const logout = async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('No se pudo cerrar sesión', error.message);
        return;
      }
    }
    setAuthenticated(false);
    setUsername('');
    setUser(null);
    setLatestPaymentRequest(null);
    setProgress(EMPTY);
    setAuthMode('login');
    setAuthName('');
    setAuthEmail('');
    setPassword('');
    setPasswordConfirm('');
    setAuthError('');
    setShowWelcome(true);
    setScreen('HOME');
  };

  const refreshAccount = async () => {
    if (!supabase) {
      Alert.alert('Conexión no configurada', 'Falta conectar el proyecto con Supabase.');
      return;
    }
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      Alert.alert('No se pudo actualizar el acceso', error.message);
      return;
    }
    if (!data.user) {
      Alert.alert('Sesión vencida', 'Inicia sesión nuevamente para consultar tu plan.');
      return;
    }
    try {
      await loadAccount(data.user);
    } catch (loadError) {
      Alert.alert(
        'No se pudo actualizar el acceso',
        loadError instanceof Error ? loadError.message : 'Inténtalo nuevamente.',
      );
    }
  };

  const startStudy = (key: string, isDaily = false) => {
    const list = isDaily && daily ? [daily] : FULL_BANK_DATA[key] ?? [];
    const allowed = plan === 'free' && !isDaily ? list.slice(0, 5) : list;
    if (!allowed.length) return Alert.alert('Banco no disponible', 'No hay preguntas cargadas en esta especialidad.');
    setStudySpec(key);
    setStudyQuestions(allowed.map(shuffleQuestionOptions));
    setStudyIndex(0);
    setStudyCorrect(0);
    setStudyFinished(false);
    setDailyStudy(isDaily);
    setPicked(null);
    setScreen('STUDY');
  };

  const awardAnswer = (correct: boolean, question: Question, specKey?: string) => {
    const date = dateToday();
    setProgress((current) => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const bonus = dailyStudy && correct && current.dailyDate !== date ? 25 : 0;
      const next: Progress = {
        ...current,
        xp: current.xp + (correct ? 10 : 3) + bonus,
        answered: current.answered + 1,
        correct: current.correct + (correct ? 1 : 0),
        streak: current.lastStudyDate === date ? current.streak : current.lastStudyDate === yesterday ? current.streak + 1 : 1,
        lastStudyDate: date,
        dailyDate: bonus ? date : current.dailyDate,
      };
      if (specKey) next.spec = { ...current.spec, [specKey]: { ...(current.spec[specKey] ?? {}), [question.id]: correct } };
      return next;
    });
  };

  const answer = (index: number) => {
    if (picked !== null) return;
    setPicked(index);
    if (screen === 'STUDY') {
      const question = studyQuestions[studyIndex];
      if (!question) return;
      const correct = index === question.c;
      awardAnswer(correct, question, dailyStudy ? undefined : studySpec);
      if (correct) setStudyCorrect((count) => count + 1);
    } else if (screen === 'CASES' && selectedCase) {
      const question = selectedCase.preg[caseIndex];
      if (question) awardAnswer(index === question.c, { ...question, id: `${selectedCase.id}-${caseIndex}` }, caseSpec);
    }
  };

  const nextStudy = () => {
    if (studyIndex + 1 < studyQuestions.length) {
      setStudyIndex((index) => index + 1);
      setPicked(null);
    } else {
      setStudyFinished(true);
      setProgress((current) => ({ ...current, xp: current.xp + 15 }));
    }
  };

  const nextCase = () => {
    if (!selectedCase) return;
    if (caseIndex + 1 < selectedCase.preg.length) {
      setCaseIndex((index) => index + 1);
      setPicked(null);
    } else {
      setSelectedCase(null);
      setPicked(null);
    }
  };

  const startSimulation = () => {
    const list = shuffleItems(questions)
      .slice(0, Math.min(simCount, questions.length))
      .map(shuffleQuestionOptions);
    if (!list.length) return Alert.alert('Banco no disponible', 'No hay preguntas para crear el simulacro.');
    setSimResult(null);
    setSim({ list, index: 0, answers: Array(list.length).fill(null), seconds: list.length * 90 });
  };

  const finishSimulation = () => {
    finishSimulationRef.current();
  };

  useEffect(() => {
    simulationRef.current = sim;
  }, [sim]);
  useEffect(() => {
    finishSimulationRef.current = () => {
      const current = simulationRef.current;
      if (!current) return;
      const correct = current.list.reduce((count, question, index) => count + (current.answers[index] === question.c ? 1 : 0), 0);
      setSimResult({ list: current.list, answers: current.answers, correct });
      setProgress((value) => ({ ...value, sim: [...value.sim, { date: new Date().toISOString(), correct, total: current.list.length }] }));
      setSim(null);
    };
  }, []);

  useEffect(() => {
    if (screen !== 'SIM' || !hasSimulation || simResult) return;
    const timer = setInterval(() => {
      const current = simulationRef.current;
      if (!current) return;
      if (current.seconds <= 1) finishSimulationRef.current();
      else setSim({ ...current, seconds: current.seconds - 1 });
    }, 1000);
    return () => clearInterval(timer);
  }, [screen, hasSimulation, simResult]);

  const clearProgress = () => Alert.alert('Borrar progreso', 'Se eliminarán las respuestas y simulacros de este perfil.', [
    { text: 'Borrar', style: 'cancel' },
    { text: 'Borrar', style: 'destructive', onPress: () => setProgress(EMPTY) },
  ]);

  const requestPlanActivation = async () => {
    if (!payPlan || payPlan === 'free' || !user || !supabase) {
      Alert.alert('No se pudo iniciar la solicitud', 'Verifica tu sesión y la configuración de Supabase.');
      return;
    }

    const requestedPlan = payPlan;
    setPaymentSubmitting(true);
    try {
      const { data: requestId, error } = await supabase.rpc('request_payment', {
        requested_plan: requestedPlan,
      });
      if (error) throw error;
      if (!requestId) throw new Error('Supabase no devolvió el número de solicitud.');

      const request: PaymentRequest = {
        id: requestId,
        user_id: user.id,
        plan: requestedPlan,
        amount_bob: PLANS[requestedPlan].amount,
        status: 'pending',
        created_at: new Date().toISOString(),
        reviewed_at: null,
      };
      setLatestPaymentRequest(request);
      setPayPlan(null);

      const message = [
        STR.paymentRequestGreeting,
        `${STR.paymentRequestPlanLabel} ${PLANS[requestedPlan].name} (${PLANS[requestedPlan].price})`,
        `${STR.paymentRequestAccountEmailLabel} ${user.email}`,
        `${STR.paymentRequestRequestLabel} ${requestId}`,
        STR.paymentRequestAttachProof,
      ].join('\n');
      try {
        // wa.me expects phone number without the leading plus or formatting
        const waPhone = STR.whatsappPhone.replace(/[^0-9]/g, '').replace(/^0+/, '');
        await Linking.openURL(`https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`);
      } catch (linkError) {
        Alert.alert(
          STR.whatsappFallbackTitle,
          STR.whatsappFallbackMessage(STR.whatsappPhone, requestId),
        );
        if (linkError instanceof Error) console.error('Could not open WhatsApp:', linkError);
      }
    } catch (error) {
      Alert.alert(
        'No se pudo registrar la solicitud',
        error instanceof Error ? error.message : 'Inténtalo nuevamente.',
      );
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const button = (label: string, action: () => void, secondary = false) => (
    <TouchableOpacity style={secondary ? s.secondaryButton : s.goldButton} onPress={action} activeOpacity={0.82}>
      <Text style={secondary ? s.secondaryButtonText : s.goldButtonText}>{label}</Text>
    </TouchableOpacity>
  );
  const heading = (title: string, subtitle?: string) => <View style={s.heading}><Text style={s.headingTitle}>{title}</Text>{subtitle ? <Text style={s.headingSubtitle}>{subtitle}</Text> : null}</View>;

  const questionCard = (question: Question, index: number, count: number, explanation?: string, next?: () => void, nextLabel = 'Siguiente pregunta') => (
    <View style={s.panel}>
      <View style={s.questionHeader}><Text style={s.tag}>{screen === 'CASES' ? 'CASO CLÍNICO' : dailyStudy ? 'RETO DEL DÍA' : NOMBRES[studySpec]}</Text><Text style={s.muted}>{index + 1} / {count}</Text></View>
      <Text style={s.question}>{question.q}</Text>
      {question.ops.map((option, optionIndex) => {
        const correct = question.c === optionIndex;
        const selected = picked === optionIndex;
        return <TouchableOpacity key={`${question.id}-${optionIndex}`} style={[s.option, picked !== null && correct && s.optionCorrect, picked !== null && selected && !correct && s.optionWrong]} onPress={() => answer(optionIndex)} disabled={picked !== null}>
          <Text style={[s.optionLetter, picked !== null && correct && s.letterCorrect, picked !== null && selected && !correct && s.letterWrong]}>{'ABCD'[optionIndex]}</Text><Text style={s.optionText}>{option}</Text>
        </TouchableOpacity>;
      })}
      {picked !== null && explanation ? <View style={s.explanation}><Text style={s.explanationTitle}>{screen === 'CASES' ? 'Razonamiento' : 'Explicación'}</Text><Text style={s.muted}>{explanation}</Text></View> : null}
      {picked !== null && next ? button(nextLabel, next) : null}
    </View>
  );

  const renderHome = () => {
    const badges: [string, string, boolean][] = [
      ['🔥', 'Primer día', progress.answered >= 1],
      ['🎯', '10 aciertos', progress.correct >= 10],
      ['⚡', '25 preguntas', progress.answered >= 25],
      ['🏅', '50 preguntas', progress.answered >= 50],
      ['🔥', 'Racha 3', progress.streak >= 3],
      ['👑', 'Nivel 5', level >= 5],
    ];
    const nextSpec = SPECS.reduce((best, key) =>
      Object.keys(progress.spec[key] ?? {}).length < Object.keys(progress.spec[best] ?? {}).length ? key : best,
      SPECS[0],
    );
    return <>
    <View style={s.welcome}><View style={s.avatar}><Text style={s.avatarLetter}>{user?.name.slice(0, 1).toUpperCase()}</Text></View><View style={s.welcomeText}><Text style={s.greeting}>Dra./Dr. {user?.name}</Text><Text style={s.muted}>@{username}</Text></View><Text style={s.planBadge}>{plan.toUpperCase()}</Text></View>
    <View style={s.xpPanel}><View style={s.spaceRow}><View><Text style={s.xpTitle}>Nivel {level} · Futuro especialista</Text><Text style={s.muted}>Sigue avanzando en tu preparación</Text></View><Text style={s.xpText}>{progress.xp} XP</Text></View><View style={s.progressTrack}><View style={[s.progressFill, { width: `${progress.xp % 100}%` }]} /></View><View style={s.spaceRow}><Text style={s.streak}>🔥 Racha de {progress.streak} {progress.streak === 1 ? 'día' : 'días'}</Text><Text style={s.muted}>{progress.answered} respuestas</Text></View></View>
    {plan !== 'pro' ? <TouchableOpacity style={s.upgrade} onPress={() => setScreen('PLANS')}><View style={{ flex: 1 }}><Text style={s.upgradeTitle}>Amplía tu preparación</Text><Text style={s.muted}>{casesTotal || 80} casos clínicos y simulacros disponibles con Pro.</Text></View><Ionicons name="arrow-forward-circle" size={27} color={C.light} /></TouchableOpacity> : null}
    {daily ? <View style={s.daily}><Text style={s.dailyKicker}>⚡ RETO DEL DÍA</Text><Text style={s.dailyTitle}>{progress.dailyDate === dateToday() ? 'Reto completado' : 'Gana +25 XP hoy'}</Text><Text style={s.muted}>{progress.dailyDate === dateToday() ? 'Nuevo reto disponible mañana.' : 'Una pregunta para mantener tu ritmo de estudio.'}</Text>{progress.dailyDate !== dateToday() ? button('Comenzar reto', () => startStudy('pediatria', true)) : null}</View> : null}
    <View style={s.stats}>{[[String(progress.answered), 'Respondidas'], [`${progress.answered ? Math.round(progress.correct / progress.answered * 100) : 0}%`, 'Acierto'], [String(progress.sim.length), 'Simulacros']].map(([value, label]) => <View key={label} style={s.stat}><Text style={s.statValue}>{value}</Text><Text style={s.statLabel}>{label}</Text></View>)}</View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.badges}>{badges.map(([icon, label, unlocked]) => <View key={label} style={[s.badge, !unlocked && s.badgeLocked]}><Text style={s.badgeIcon}>{icon}</Text><Text style={s.badgeLabel}>{label}</Text></View>)}</ScrollView>
    <View style={s.continueCard}><View style={s.continueIcon}><Text style={s.continueEmoji}>{ICONOS[nextSpec]}</Text></View><View style={s.continueCopy}><Text style={s.continueTitle}>Tu próxima misión</Text><Text style={s.muted}>{NOMBRES[nextSpec]} · {Object.keys(progress.spec[nextSpec] ?? {}).length} respondidas</Text></View><TouchableOpacity style={s.continueButton} onPress={() => startStudy(nextSpec)}><Text style={s.continueButtonText}>Seguir</Text></TouchableOpacity></View>
    {heading('Especialidades', 'EXAMEN DE GRADO · BOLIVIA')}
    {SPECS.map((key) => { const total = FULL_BANK_DATA[key]?.length ?? 0; const done = Object.keys(progress.spec[key] ?? {}).length; return <TouchableOpacity key={key} style={s.specialty} onPress={() => startStudy(key)}><Text style={s.specEmoji}>{ICONOS[key]}</Text><View style={{ flex: 1 }}><Text style={s.specName}>{NOMBRES[key]}</Text><View style={s.miniTrack}><View style={[s.progressFill, { width: `${total ? Math.min(done / total * 100, 100) : 0}%` }]} /></View></View><Text style={s.specCount}>{done}/{total}</Text><Ionicons name="chevron-forward" size={17} color={C.muted} /></TouchableOpacity>; })}
    </>;
  };

  const renderPlans = () => <>
    {heading(STR.plansHeading, STR.plansSubheading)}

    {latestPaymentRequest ? (
      <View style={s.panel}>
        <Text style={s.cardTitle}>{STR.requestRegistered}</Text>
        <Text style={s.muted}>{PLANS[latestPaymentRequest.plan].name} · {latestPaymentRequest.amount_bob} Bs · {latestPaymentRequest.id}</Text>
        <Text style={s.paymentStatus}>
          {latestPaymentRequest.status === 'pending' ? STR.statusPending : latestPaymentRequest.status === 'approved' ? STR.statusApproved : STR.statusRejected}
        </Text>
        {button(STR.updateStatusButton, () => void refreshAccount(), true)}
      </View>
    ) : null}

    {(Object.keys(PLANS) as Plan[]).map((key) => (
      <View key={key} style={[s.planCard, key === 'pro' && s.featured]}>
        {key === 'pro' ? <Text style={s.recommend}>{STR.recommended}</Text> : null}
        <Text style={s.planName}>{PLANS[key].name}</Text>
        <Text style={s.price}>{PLANS[key].price}</Text>
        {PLANS[key].features.map((feature) => (
          <View key={feature} style={s.feature}>
            <Ionicons name="checkmark-circle" size={16} color={C.gold} />
            <Text style={s.featureText}>{feature}</Text>
          </View>
        ))}

        {plan === key ? (
          <View style={s.currentPlan}>
            <Text style={s.currentText}>{STR.currentPlanText}</Text>
          </View>
        ) : key !== 'free' ? (
          button(STR.enrollButton, () => setPayPlan(key))
        ) : null}
      </View>
    ))}
  </>;

  const renderCases = () => {
    if (plan !== 'pro') return <View style={s.locked}><Ionicons name="lock-closed" size={34} color={C.gold} /><Text style={s.cardTitle}>Contenido del plan Pro</Text><Text style={s.muted}>Casos clínicos integrados con signos vitales y razonamiento.</Text>{button('Ver planes', () => setScreen('PLANS'))}</View>;
    if (selectedCase) {
      const q = selectedCase.preg[caseIndex];
      return <><TouchableOpacity style={s.back} onPress={() => { setSelectedCase(null); setPicked(null); }}><Ionicons name="arrow-back" size={17} color={C.muted} /><Text style={s.muted}>Casos clínicos</Text></TouchableOpacity><View style={s.panel}><Text style={s.cardTitle}>{selectedCase.t}</Text><Text style={s.muted}>{selectedCase.p}</Text></View>{q ? questionCard({ ...q, id: `${selectedCase.id}-${caseIndex}`, x: selectedCase.raz }, caseIndex, selectedCase.preg.length, selectedCase.raz || `Respuesta correcta: ${q.ops[q.c]}`, nextCase, caseIndex + 1 < selectedCase.preg.length ? 'Siguiente pregunta' : 'Volver a casos') : null}</>;
    }
    const available = FULL_CASES_DATA[caseSpec] ?? [];
    return <>{heading('Casos clínicos', 'RAZONAMIENTO DIAGNÓSTICO Y TERAPÉUTICO')}<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>{SPECS.map((key) => <TouchableOpacity key={key} style={[s.filter, caseSpec === key && s.filterActive]} onPress={() => setCaseSpec(key)}><Text style={[s.filterText, caseSpec === key && s.filterTextActive]}>{NOMBRES[key]}</Text></TouchableOpacity>)}</ScrollView>{available.length ? available.map((item) => <TouchableOpacity key={item.id} style={s.caseRow} onPress={() => { setSelectedCase({ ...item, preg: item.preg.map(shuffleQuestionOptions) }); setCaseIndex(0); setPicked(null); }}><Ionicons name="medkit-outline" size={21} color={C.gold} /><View style={{ flex: 1 }}><Text style={s.specName}>{item.t}</Text><Text style={s.muted}>{item.preg.length} pregunta(s)</Text></View><Ionicons name="chevron-forward" size={17} color={C.muted} /></TouchableOpacity>) : <Text style={s.empty}>No hay casos cargados en esta especialidad.</Text>}</>;
  };

  const renderSimulation = () => {
    if (plan !== 'pro') return <View style={s.locked}><Ionicons name="lock-closed" size={34} color={C.gold} /><Text style={s.cardTitle}>Simulacro de examen · Plan Pro</Text><Text style={s.muted}>Examen cronometrado con revisión de respuestas.</Text>{button('Desbloquear con Pro', () => setScreen('PLANS'))}</View>;
    if (simResult) { const pct = Math.round(simResult.correct / simResult.list.length * 100); return <><View style={s.panel}><Text style={s.cardTitle}>Resultado</Text><Text style={[s.resultPercent, { color: pct >= 51 ? C.ok : C.bad }]}>{pct}%</Text><Text style={s.muted}>{simResult.correct} correctas de {simResult.list.length} · {pct >= 51 ? 'APROBADO' : 'DESAPROBADO'}</Text></View><View style={s.panel}><Text style={s.cardTitle}>Revisión</Text>{simResult.list.map((q, i) => <View key={`${q.id}-${i}`} style={s.review}><Text style={s.reviewQuestion}>{i + 1}. {q.q}</Text><Text style={[s.muted, { color: simResult.answers[i] === q.c ? C.ok : C.bad }]}>Tu respuesta: {simResult.answers[i] === null ? '—' : q.ops[simResult.answers[i] ?? 0]}</Text><Text style={[s.muted, { color: C.ok }]}>Correcta: {q.ops[q.c]}</Text></View>)}</View>{button('Nuevo simulacro', () => setSimResult(null))}</>; }
    if (sim) { const q = sim.list[sim.index]; return <View style={s.panel}><View style={s.spaceRow}><Text style={s.timer}>⏱ {Math.floor(sim.seconds / 60)}:{String(sim.seconds % 60).padStart(2, '0')}</Text><Text style={s.muted}>{sim.index + 1} / {sim.list.length}</Text></View><Text style={s.question}>{q.q}</Text>{q.ops.map((option, i) => <TouchableOpacity key={i} style={[s.option, sim.answers[sim.index] === i && s.optionSelected]} onPress={() => setSim((current) => current ? { ...current, answers: current.answers.map((value, pos) => pos === current.index ? i : value) } : null)}><Text style={s.optionLetter}>{'ABCD'[i]}</Text><Text style={s.optionText}>{option}</Text></TouchableOpacity>)}<View style={s.simActions}><TouchableOpacity style={s.secondaryButton} disabled={sim.index === 0} onPress={() => setSim({ ...sim, index: sim.index - 1 })}><Text style={s.secondaryButtonText}>Anterior</Text></TouchableOpacity><TouchableOpacity style={s.secondaryButton} onPress={() => sim.index + 1 < sim.list.length ? setSim({ ...sim, index: sim.index + 1 }) : finishSimulation()}><Text style={s.secondaryButtonText}>{sim.index + 1 < sim.list.length ? 'Siguiente' : 'Finalizar'}</Text></TouchableOpacity></View><TouchableOpacity style={s.terminate} onPress={finishSimulation}><Text style={s.muted}>Terminar y calificar ahora</Text></TouchableOpacity></View>; }
    return <>{heading('Simulacro de examen', 'CONDICIONES REALES · CONTRA RELOJ')}<View style={s.panel}><Text style={s.muted}>90 segundos por pregunta. Las respuestas se revisan al finalizar.</Text><Text style={s.label}>NÚMERO DE PREGUNTAS</Text><View style={s.segments}>{[10, 20, 40].map((n) => <TouchableOpacity key={n} style={[s.segment, simCount === n && s.segmentActive]} onPress={() => setSimCount(n)}><Text style={[s.segmentText, simCount === n && s.segmentTextActive]}>{n}</Text></TouchableOpacity>)}</View>{button('Iniciar simulacro', startSimulation)}</View>{progress.sim.length ? <View style={s.panel}><Text style={s.cardTitle}>Historial</Text>{progress.sim.slice(-5).reverse().map((item, i) => <Text key={`${item.date}-${i}`} style={s.history}>{new Date(item.date).toLocaleDateString()} · {Math.round(item.correct / item.total * 100)}% ({item.correct}/{item.total})</Text>)}</View> : null}</>;
  };

  const renderProfile = () => <>{heading('Mi cuenta', 'MSLA · MEDSAFE LATAM ACADEMY')}<View style={s.profile}><View style={s.profileAvatar}><Text style={s.avatarLetter}>{user?.name.slice(0, 1).toUpperCase()}</Text></View><Text style={s.profileName}>{user?.name}</Text><Text style={s.muted}>@{username}</Text><Text style={s.planBadge}>PLAN {plan.toUpperCase()}</Text></View><View style={s.author}><Text style={s.authorName}>Dr. Carlos Vizcaya Mariangel</Text><Text style={s.muted}>Magíster en Dirección y Administración de Empresas · Diplomado en Ecografía</Text></View>{button('Cambiar / mejorar mi plan', () => setScreen('PLANS'))}{button('Referencias científicas', () => setScreen('BIB'), true)}{button('Borrar progreso', clearProgress, true)}<TouchableOpacity style={s.logout} onPress={() => void logout()}><Ionicons name="log-out-outline" color={C.bad} size={18} /><Text style={{ color: C.bad, fontWeight: '700' }}>Cerrar sesión</Text></TouchableOpacity><Text style={s.version}>MSLA · MedsafeLatam Academy v5.0 · Excelencia · Liderazgo · Ciencia</Text></>;

  const renderBibliography = () => <><TouchableOpacity style={s.back} onPress={() => setScreen('PROFILE')}><Ionicons name="arrow-back" size={17} color={C.muted} /><Text style={s.muted}>Perfil</Text></TouchableOpacity>{heading('Referencias científicas')}<Text style={s.bibHeading}>🇧🇴 Bibliografía nacional · Bolivia</Text>{BIB_BOLIVIA.map((item, i) => <Text key={`bo-${i}`} style={s.bibItem}>{item}</Text>)}<Text style={s.bibHeading}>🌎 Bibliografía internacional</Text>{BIB_INTERNACIONAL.map((item, i) => <Text key={`int-${i}`} style={s.bibItem}>{item}</Text>)}</>;

  const renderWelcome = () => (
    <View style={welcomeStyles.container}>
      <Image
        source={require('../../assets/images/msla-logo.png')}
        style={welcomeStyles.backgroundLogo}
        contentFit="contain"
        accessibilityLabel="Logotipo de MedsafeLatam Academy"
      />
      <View style={welcomeStyles.content}>
        <Text style={welcomeStyles.eyebrow}>MEDSAFE LATAM ACADEMY</Text>
        <Text style={welcomeStyles.title}>Bienvenido a MSLA</Text>
        <Text style={welcomeStyles.description}>
          Tu camino hacia la excelencia en medicina comienza aquí.
        </Text>
        <TouchableOpacity
          style={welcomeStyles.button}
          onPress={() => setShowWelcome(false)}
          accessibilityRole="button"
        >
          <Text style={welcomeStyles.buttonText}>Continuar</Text>
          <Ionicons name="arrow-forward" size={18} color={C.n9} />
        </TouchableOpacity>
        <Text style={welcomeStyles.tagline}>EXCELENCIA · LIDERAZGO · CIENCIA</Text>
      </View>
    </View>
  );

  const renderAuth = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.authScroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          style={welcomeStyles.backButton}
          onPress={() => setShowWelcome(true)}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={16} color={C.light} />
          <Text style={welcomeStyles.backText}>Bienvenido a MSLA</Text>
        </TouchableOpacity>
        <View style={s.brand}>
          <Image
            source={require('../../assets/images/msla-logo.png')}
            style={welcomeStyles.authLogo}
            contentFit="contain"
            accessibilityLabel="Logotipo de MedsafeLatam Academy"
          />
        </View>
        <View style={s.authPanel}>
          <View style={s.authTabs}>
            {(['login', 'register'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[s.authTab, authMode === mode && s.authTabActive]}
                onPress={() => {
                  setAuthMode(mode);
                  setAuthError('');
                }}
              >
                <Text style={[s.authTabText, authMode === mode && s.authTabTextActive]}>
                  {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {authMode === 'register' ? (
            <>
              <Text style={s.label}>NOMBRE COMPLETO</Text>
              <TextInput
                style={s.input}
                value={authName}
                onChangeText={setAuthName}
                placeholder="Tu nombre"
                placeholderTextColor={C.muted}
              />
            </>
          ) : null}
          <Text style={s.label}>CORREO ELECTRÓNICO</Text>
          <TextInput
            style={s.input}
            value={authEmail}
            onChangeText={setAuthEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={C.muted}
          />
          <Text style={s.label}>CONTRASEÑA</Text>
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Contraseña"
            placeholderTextColor={C.muted}
          />
          {authMode === 'register' ? (
            <>
              <Text style={s.label}>CONFIRMAR CONTRASEÑA</Text>
              <TextInput
                style={s.input}
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry
                placeholder="Repite la contraseña"
                placeholderTextColor={C.muted}
              />
            </>
          ) : null}
          {authError ? <Text style={s.error}>{authError}</Text> : null}
          {button(authMode === 'login' ? 'Ingresar' : 'Crear cuenta e inscribirme', () => void handleAuth())}
        </View>
        <View style={s.author}>
          <Text style={s.authorName}>Dr. Carlos Vizcaya Mariangel</Text>
          <Text style={s.muted}>
            Magíster en Dirección y Administración de Empresas · Diplomado en Ecografía
          </Text>
        </View>
        <Text style={s.authFooter}>
          Preparación para el Examen de Grado de Medicina · Bolivia
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  if (!ready) return <SafeAreaView style={s.safe}><StatusBar barStyle="light-content" backgroundColor={C.n9} /><View style={s.loading}><Ionicons name="medical" size={26} color={C.gold} /><Text style={s.muted}>Cargando MedsafeLatam Academy…</Text></View></SafeAreaView>;

  return <SafeAreaView style={s.safe}><StatusBar barStyle="light-content" backgroundColor={C.n9} />{!authenticated ? (showWelcome ? renderWelcome() : renderAuth()) : <View style={{ flex: 1 }}><ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    {screen === 'HOME' ? renderHome() : null}
    {screen === 'PLANS' ? renderPlans() : null}
    {screen === 'STUDY' ? <><TouchableOpacity style={s.back} onPress={() => setScreen('HOME')}><Ionicons name="arrow-back" size={17} color={C.muted} /><Text style={s.muted}>Especialidades</Text></TouchableOpacity>{studyFinished ? <View style={s.panel}><Text style={s.cardTitle}>Sesión completada</Text><Text style={s.resultPercent}>{studyQuestions.length ? Math.round(studyCorrect / studyQuestions.length * 100) : 0}%</Text><Text style={s.muted}>{studyCorrect} de {studyQuestions.length} correctas</Text>{button('Repetir sesión', () => startStudy(studySpec, dailyStudy))}{button('Volver al inicio', () => setScreen('HOME'), true)}</View> : studyQuestions[studyIndex] ? questionCard(studyQuestions[studyIndex], studyIndex, studyQuestions.length, studyQuestions[studyIndex].x || (picked === studyQuestions[studyIndex].c ? 'Respuesta correcta.' : `La respuesta correcta es: ${studyQuestions[studyIndex].ops[studyQuestions[studyIndex].c]}`), nextStudy, studyIndex + 1 < studyQuestions.length ? 'Siguiente pregunta' : 'Finalizar sesión') : null}</> : null}
    {screen === 'CASES' ? renderCases() : null}
    {screen === 'SIM' ? renderSimulation() : null}
    {screen === 'PROFILE' ? renderProfile() : null}
    {screen === 'BIB' ? renderBibliography() : null}
  </ScrollView><View style={s.nav}>{([['HOME', 'Inicio', 'home-outline'], ['CASES', 'Casos', 'clipboard-outline'], ['SIM', 'Simulacro', 'timer-outline'], ['PLANS', 'Plan', 'school-outline'], ['PROFILE', 'Perfil', 'person-outline']] as [Screen, string, keyof typeof Ionicons.glyphMap][]).map(([target, label, icon]) => <TouchableOpacity key={target} style={s.navItem} onPress={() => { setScreen(target); if (target === 'CASES') { setSelectedCase(null); setPicked(null); } if (target === 'SIM') { setSim(null); setSimResult(null); } }}><Ionicons name={icon} size={19} color={screen === target ? C.light : C.muted} /><Text style={[s.navLabel, screen === target && s.navLabelActive]}>{label}</Text></TouchableOpacity>)}</View></View>}
  <Modal
    visible={payPlan !== null}
    transparent
    animationType="fade"
    onRequestClose={() => setPayPlan(null)}
  >
    <View style={s.modalBackdrop}>
      <ScrollView
        style={s.modalScroll}
        contentContainerStyle={s.modal}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={s.close} onPress={() => setPayPlan(null)}>
          <Ionicons name="close" size={22} color={C.muted} />
        </TouchableOpacity>

        <Text style={s.modalTitle}>{STR.payModalTitle} {payPlan ? PLANS[payPlan].name : ''}</Text>
        <Text style={s.modalPrice}>{payPlan ? PLANS[payPlan].price : ''}</Text>

        <Image
          source={require('../../assets/images/banco-ganadero-qr.jpg')}
          style={s.qrImage}
          contentFit="contain"
          accessibilityLabel={STR.qrAccessibility}
        />

        <Text style={s.payInstructions}>{STR.payInstructionsText}</Text>
        <Text style={s.muted}>{STR.payModalNote}</Text>

        <TouchableOpacity
          style={[s.goldButton, paymentSubmitting && s.disabledButton]}
          onPress={() => void requestPlanActivation()}
          disabled={paymentSubmitting}
        >
          <Text style={s.goldButtonText}>{paymentSubmitting ? STR.registeringText : STR.sendProofButton}</Text>
        </TouchableOpacity>

        {button(STR.cancelLabel, () => setPayPlan(null), true)}
      </ScrollView>
    </View>
  </Modal>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  badges: { flexDirection: 'row', gap: 7, paddingHorizontal: 1, paddingVertical: 2, marginBottom: 10 }, badge: { minWidth: 63, alignItems: 'center', backgroundColor: C.n7, borderColor: C.border, borderWidth: 1, borderRadius: 9, paddingHorizontal: 5, paddingVertical: 7 }, badgeLocked: { opacity: 0.38 }, badgeIcon: { fontSize: 18 }, badgeLabel: { color: C.muted, fontSize: 8, textAlign: 'center', marginTop: 3 },
  continueCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.n7, borderColor: C.border, borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 13 }, continueIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.n6, alignItems: 'center', justifyContent: 'center' }, continueEmoji: { fontSize: 20 }, continueCopy: { flex: 1 }, continueTitle: { color: C.white, fontSize: 12, fontWeight: '700', marginBottom: 3 }, continueButton: { backgroundColor: C.n8, borderColor: C.gold, borderWidth: 1, borderRadius: 7, paddingHorizontal: 11, paddingVertical: 8 }, continueButtonText: { color: C.light, fontSize: 10, fontWeight: '700' },
  safe: { flex: 1, backgroundColor: C.n9 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  authScroll: { flexGrow: 1, justifyContent: 'center', padding: 22 }, brand: { alignItems: 'center', marginBottom: 20 }, brandIcon: { width: 54, height: 54, borderRadius: 15, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, brandTitle: { color: C.white, fontSize: 25, fontWeight: '700', textAlign: 'center' }, tagline: { color: C.gold, fontSize: 9, letterSpacing: 2, marginTop: 6 },
  authPanel: { backgroundColor: C.n8, borderColor: C.border, borderWidth: 1, borderRadius: 12, padding: 17 }, authTabs: { flexDirection: 'row', borderBottomColor: C.border, borderBottomWidth: 1, marginBottom: 10 }, authTab: { flex: 1, alignItems: 'center', paddingVertical: 11, borderBottomWidth: 2, borderBottomColor: 'transparent' }, authTabActive: { borderBottomColor: C.gold }, authTabText: { color: C.muted, fontSize: 12, fontWeight: '600' }, authTabTextActive: { color: C.light }, label: { color: C.muted, fontSize: 10, fontWeight: '700', marginTop: 12, marginBottom: 5 }, input: { backgroundColor: C.n9, borderColor: C.border, borderWidth: 1, borderRadius: 8, padding: 11, color: C.white, fontSize: 13 }, error: { color: C.bad, fontSize: 11, marginTop: 8 }, authFooter: { color: C.muted, fontSize: 10, textAlign: 'center', marginTop: 10 },
  author: { alignItems: 'center', marginTop: 18, gap: 4, paddingHorizontal: 8 }, authorName: { color: C.light, fontSize: 12, fontWeight: '700', textAlign: 'center' }, muted: { color: C.muted, fontSize: 10, lineHeight: 16 },
  scroll: { flex: 1 }, content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }, welcome: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 13 }, avatar: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.n6, alignItems: 'center', justifyContent: 'center' }, avatarLetter: { color: C.light, fontSize: 18, fontWeight: '800' }, welcomeText: { flex: 1 }, greeting: { color: C.white, fontSize: 15, fontWeight: '700' }, planBadge: { color: C.light, backgroundColor: C.n6, borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingHorizontal: 9, paddingVertical: 5, fontSize: 9, fontWeight: '800', overflow: 'hidden' },
  xpPanel: { backgroundColor: C.n7, borderColor: C.border, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 11 }, spaceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 9 }, xpTitle: { color: C.white, fontSize: 12, fontWeight: '700', marginBottom: 3 }, xpText: { color: C.light, fontWeight: '800', fontSize: 12 }, progressTrack: { height: 7, backgroundColor: C.n6, borderRadius: 4, overflow: 'hidden', marginVertical: 10 }, progressFill: { height: '100%', backgroundColor: C.gold }, streak: { color: '#FF9C9C', fontSize: 10, fontWeight: '700' }, upgrade: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.n8, borderColor: C.border, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 10 }, upgradeTitle: { color: C.light, fontSize: 12, fontWeight: '700', marginBottom: 3 }, daily: { backgroundColor: '#103441', borderColor: 'rgba(63,178,127,0.42)', borderWidth: 1, borderRadius: 11, padding: 13, marginBottom: 10 }, dailyKicker: { color: C.ok, fontSize: 9, fontWeight: '800' }, dailyTitle: { color: C.white, fontSize: 15, fontWeight: '700', marginTop: 5 },
  stats: { flexDirection: 'row', gap: 8, marginBottom: 16 }, stat: { flex: 1, alignItems: 'center', backgroundColor: C.n7, borderColor: C.border, borderWidth: 1, borderRadius: 9, paddingVertical: 10 }, statValue: { color: C.light, fontSize: 18, fontWeight: '800' }, statLabel: { color: C.muted, fontSize: 8, textTransform: 'uppercase', marginTop: 3 }, heading: { alignItems: 'center', marginVertical: 8 }, headingTitle: { color: C.white, fontSize: 18, fontWeight: '700', textAlign: 'center' }, headingSubtitle: { color: C.gold, fontSize: 9, fontWeight: '700', marginTop: 4 }, specialty: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.n7, borderColor: C.border, borderWidth: 1, borderRadius: 9, padding: 11, marginBottom: 8 }, specEmoji: { fontSize: 22, width: 38 }, specName: { color: C.white, fontSize: 12, fontWeight: '700', marginBottom: 4 }, miniTrack: { height: 4, backgroundColor: C.n6, borderRadius: 3, overflow: 'hidden' }, specCount: { color: C.light, fontSize: 10, fontWeight: '700' },
  panel: { backgroundColor: C.n7, borderColor: C.border, borderWidth: 1, borderRadius: 11, padding: 14, marginBottom: 10 }, cardTitle: { color: C.light, fontSize: 14, fontWeight: '700', marginBottom: 7 }, questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, tag: { color: C.light, backgroundColor: C.n6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 9, fontWeight: '800', overflow: 'hidden' }, question: { color: C.white, fontSize: 14, lineHeight: 22, marginBottom: 12 }, option: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, backgroundColor: C.n8, borderColor: C.border, borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 7 }, optionSelected: { borderColor: C.gold, backgroundColor: C.n6 }, optionCorrect: { borderColor: C.ok, backgroundColor: 'rgba(63,178,127,0.14)' }, optionWrong: { borderColor: C.bad, backgroundColor: 'rgba(226,85,85,0.14)' }, optionLetter: { width: 23, height: 23, borderRadius: 12, borderWidth: 1, borderColor: C.gold, color: C.light, textAlign: 'center', textAlignVertical: 'center', fontSize: 10, fontWeight: '800', overflow: 'hidden' }, letterCorrect: { backgroundColor: C.ok, borderColor: C.ok, color: C.white }, letterWrong: { backgroundColor: C.bad, borderColor: C.bad, color: C.white }, optionText: { flex: 1, color: C.white, fontSize: 11, lineHeight: 17, paddingTop: 2 }, explanation: { backgroundColor: C.n8, borderLeftColor: C.gold, borderLeftWidth: 3, borderRadius: 7, padding: 10, marginTop: 4 }, explanationTitle: { color: C.light, fontSize: 10, fontWeight: '700', marginBottom: 4 }, goldButton: { backgroundColor: C.gold, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 12 }, goldButtonText: { color: C.n9, fontSize: 12, fontWeight: '800' }, secondaryButton: { flex: 1, borderColor: C.gold, borderWidth: 1, borderRadius: 8, paddingVertical: 11, alignItems: 'center', marginTop: 8 }, secondaryButtonText: { color: C.light, fontSize: 11, fontWeight: '700' }, resultPercent: { color: C.light, textAlign: 'center', fontSize: 38, fontWeight: '800', marginVertical: 5 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, marginBottom: 5 }, locked: { alignItems: 'center', backgroundColor: C.n7, borderColor: C.border, borderWidth: 1, borderRadius: 11, padding: 19, marginTop: 16 }, filters: { gap: 7, paddingVertical: 7 }, filter: { backgroundColor: C.n7, borderColor: C.border, borderWidth: 1, borderRadius: 18, paddingVertical: 7, paddingHorizontal: 10 }, filterActive: { backgroundColor: C.gold, borderColor: C.gold }, filterText: { color: C.muted, fontSize: 9 }, filterTextActive: { color: C.n9, fontWeight: '700' }, caseRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.n7, borderColor: C.border, borderWidth: 1, borderRadius: 9, padding: 12, marginBottom: 7 }, empty: { color: C.muted, textAlign: 'center', padding: 20, fontSize: 11 },
  planCard: { backgroundColor: C.n7, borderColor: C.border, borderWidth: 1, borderRadius: 11, padding: 15, marginBottom: 10 }, featured: { borderColor: C.gold, borderWidth: 1.5 }, recommend: { color: C.n9, backgroundColor: C.gold, alignSelf: 'flex-end', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, fontSize: 8, fontWeight: '800', overflow: 'hidden' }, planName: { color: C.white, fontSize: 19, fontWeight: '700', marginTop: 5 }, price: { color: C.light, fontSize: 22, fontWeight: '800', marginVertical: 8 }, feature: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 }, featureText: { color: C.muted, fontSize: 10, flex: 1 }, currentPlan: { borderColor: C.gold, borderWidth: 1, borderRadius: 8, alignItems: 'center', padding: 10, marginTop: 8 }, currentText: { color: C.light, fontSize: 11, fontWeight: '700' },
  profile: { alignItems: 'center', backgroundColor: C.n7, borderColor: C.border, borderWidth: 1, borderRadius: 11, padding: 18, marginBottom: 10 }, profileAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.n6, borderColor: C.gold, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }, profileName: { color: C.white, fontSize: 16, fontWeight: '700', marginBottom: 4 }, logout: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, borderColor: C.bad, borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 8 }, version: { color: C.muted, textAlign: 'center', fontSize: 9, marginTop: 13 },
  bibHeading: { color: C.light, fontSize: 12, fontWeight: '700', marginTop: 12, marginBottom: 5 }, bibItem: { color: C.muted, fontSize: 10, lineHeight: 16, paddingVertical: 7, borderBottomColor: 'rgba(201,162,75,0.12)', borderBottomWidth: 1 },
  timer: { color: C.light, fontWeight: '800', fontSize: 13 }, simActions: { flexDirection: 'row', gap: 8 }, terminate: { alignItems: 'center', padding: 12 }, segments: { flexDirection: 'row', gap: 7, marginTop: 6 }, segment: { flex: 1, alignItems: 'center', padding: 9, borderColor: C.border, borderWidth: 1, borderRadius: 7 }, segmentActive: { backgroundColor: C.gold, borderColor: C.gold }, segmentText: { color: C.muted, fontWeight: '700', fontSize: 11 }, segmentTextActive: { color: C.n9 }, history: { color: C.muted, fontSize: 10, paddingTop: 7 }, review: { paddingVertical: 8, borderBottomColor: 'rgba(201,162,75,0.12)', borderBottomWidth: 1 }, reviewQuestion: { color: C.white, fontSize: 10, lineHeight: 15, marginBottom: 4 },
  nav: { position: 'absolute', bottom: 8, left: 13, right: 13, flexDirection: 'row', backgroundColor: C.n8, borderColor: C.border, borderWidth: 1, borderRadius: 12, paddingVertical: 6 }, navItem: { flex: 1, alignItems: 'center', gap: 3, minHeight: 38, justifyContent: 'center' }, navLabel: { color: C.muted, fontSize: 8, fontWeight: '700' }, navLabelActive: { color: C.light },
  paymentStatus: { color: C.light, fontSize: 11, fontWeight: '700', marginTop: 6 }, modalBackdrop: { flex: 1, backgroundColor: 'rgba(4,10,22,0.82)', justifyContent: 'center', padding: 20 }, modalScroll: { maxHeight: '92%' }, modal: { backgroundColor: C.n8, borderColor: C.gold, borderWidth: 1, borderRadius: 13, padding: 17 }, close: { alignSelf: 'flex-end', padding: 2 }, modalTitle: { color: C.light, textAlign: 'center', fontSize: 18, fontWeight: '700' }, modalPrice: { color: C.gold, textAlign: 'center', fontSize: 24, fontWeight: '800', marginVertical: 5 }, qrImage: { width: 220, height: 220, alignSelf: 'center', marginVertical: 10, backgroundColor: C.white, borderRadius: 8 }, payInstructions: { color: C.white, fontSize: 11, lineHeight: 17, textAlign: 'center', marginBottom: 8 }, disabledButton: { opacity: 0.6 },
});

const welcomeStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.n9, justifyContent: 'center', overflow: 'hidden' },
  backgroundLogo: { ...StyleSheet.absoluteFill, opacity: 0.14 },
  content: { alignItems: 'center', paddingHorizontal: 28 },
  eyebrow: { color: C.gold, fontSize: 11, fontWeight: '700', letterSpacing: 3, marginBottom: 12 },
  title: { color: C.white, fontSize: 30, fontWeight: '800', textAlign: 'center' },
  description: { color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 12, textAlign: 'center', maxWidth: 300 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.gold, borderRadius: 10, marginTop: 32, minWidth: 190, paddingHorizontal: 22, paddingVertical: 14 },
  buttonText: { color: C.n9, fontSize: 15, fontWeight: '800' },
  tagline: { color: C.light, fontSize: 9, fontWeight: '600', letterSpacing: 2, marginTop: 28, textAlign: 'center' },
  backButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 7, marginBottom: 10, paddingVertical: 8 },
  backText: { color: C.light, fontSize: 12, fontWeight: '600' },
  authLogo: { width: 190, height: 190 },
});