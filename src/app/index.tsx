import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import {
  ICONOS, NOMBRES,
  SPECS, type CaseStudy, type Question,
} from '../constants/mslaData';
import { FULL_BANK_DATA } from '../constants/questionBank';
import STR from '../lib/strings.es';
import { supabase, type PaymentRequest, type Plan, type QuestionOverride } from '../lib/supabase';


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
type UserRecord = { id: string; email: string; name: string; plan: Plan; plan_expires_at: string | null };
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
  const router = useRouter();
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
  const [questionOverrides, setQuestionOverrides] = useState<QuestionOverride[]>([]);
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
    const { data: overrides, error: overridesError } = await supabase
      .from('question_overrides')
      .select('*');
    if (overridesError) throw overridesError;

    setUsername(localUsername);
    setUser({
      id: authUser.id,
      email: authUser.email ?? '',
      name: profile.display_name || localUsername,
      plan: profile.plan_expires_at && new Date(profile.plan_expires_at).getTime() <= Date.now()
        ? 'free'
        : profile.plan,
      plan_expires_at: profile.plan_expires_at,
    });
    setLatestPaymentRequest(paymentRequest);
    setQuestionOverrides(overrides);
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
        if (data.session?.user.app_metadata.role === 'admin') {
          router.replace('/admin');
        } else if (data.session) {
          await loadAccount(data.session.user);
        }
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
  }, [loadAccount, router]);

  useEffect(() => {
    if (authenticated && user) void AsyncStorage.setItem(`msla_prog_${user.id}`, JSON.stringify(progress));
  }, [authenticated, progress, user]);

  const expiryUserId = user?.id;
  const expiryPlan = user?.plan;
  const planExpiresAt = user?.plan_expires_at;
  useEffect(() => {
    if (!expiryUserId || expiryPlan === 'free' || !planExpiresAt) return;
    const expirationTime = new Date(planExpiresAt).getTime();
    const expirationCheck = setInterval(() => {
      if (Date.now() >= expirationTime) {
        setUser((currentUser) => currentUser?.id === expiryUserId
          ? { ...currentUser, plan: 'free' }
          : currentUser);
      }
    }, 60_000);
    return () => clearInterval(expirationCheck);
  }, [expiryUserId, expiryPlan, planExpiresAt]);

  const plan = user?.plan ?? 'free';
  const level = Math.floor(progress.xp / 100) + 1;
  const questionBank = useMemo<Record<string, Question[]>>(() => {
    const overridesById = new Map(questionOverrides.map((override) => [override.question_id, override]));
    return Object.fromEntries(Object.entries(FULL_BANK_DATA).map(([specialty, bank]) => [
      specialty,
      bank.map((question) => {
        const override = overridesById.get(question.id);
        return override
          ? {
              ...question,
              q: override.question_text,
              ops: override.options,
              c: override.correct_index,
              x: override.explanation ?? undefined,
            }
          : question;
      }),
    ]));
  }, [questionOverrides]);
  const questions = useMemo(() => Object.values(questionBank).flat(), [questionBank]);
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
        if (data.user.app_metadata.role === 'admin') {
          router.replace('/admin');
          return;
        }
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
    setQuestionOverrides([]);
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
    const list = isDaily && daily ? [daily] : questionBank[key] ?? [];
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
    {SPECS.map((key) => { const total = questionBank[key]?.length ?? 0; const done = Object.keys(progress.spec[key] ?? {}).length; return <TouchableOpacity key={key} style={s.specialty} onPress={() => startStudy(key)}><Text style={s.specEmoji}>{ICONOS[key]}</Text><View style={{ flex: 1 }}><Text style={s.specName}>{NOMBRES[key]}</Text><View style={s.miniTrack}><View style={[s.progressFill, { width: `${total ? Math.min(done / total * 100, 100) : 0}%` }]} /></View></View><Text style={s.specCount}>{done}/{total}</Text><Ionicons name="chevron-forward" size={17} color={C.muted} /></TouchableOpacity>; })}
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
          <TouchableOpacity
            onPress={() => router.push('/admin')}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Abrir modo administrador"
          >
            <Text style={s.authorName}>Dr. Carlos Vizcaya Mariangel</Text>
          </TouchableOpacity>
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