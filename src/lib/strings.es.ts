const STR = {
  // Payment & WhatsApp
  paymentRequestGreeting: 'Hola, quiero solicitar la activación de mi plan en MedsafeLatam Academy.',
  paymentRequestPlanLabel: 'Plan:',
  paymentRequestAccountEmailLabel: 'Correo de la cuenta:',
  paymentRequestRequestLabel: 'Solicitud:',
  paymentRequestAttachProof: 'Adjunto el comprobante de pago para su revisión.',
  whatsappPhone: '+59169171236',
  whatsappFallbackTitle: 'Solicitud registrada',
  whatsappFallbackMessage: (phone: string, requestId: string) => `No se pudo abrir WhatsApp. Envía el comprobante al ${phone} e incluye el número de solicitud ${requestId}.`,
  paymentRegisterErrorTitle: 'No se pudo registrar la solicitud',
  paymentRegisterRetryMessage: 'Inténtalo nuevamente.',

  // Plans screen
  plansHeading: 'Planes',
  plansSubheading: 'PAGO CON QR · REVISIÓN MANUAL DEL COMPROBANTE',
  statusPending: 'Pendiente de revisión por WhatsApp',
  statusApproved: 'Pago aprobado',
  statusRejected: 'Solicitud rechazada',

  // Payment modal / flow
  payModalTitle: 'Pagar plan',
  payInstructionsText: 'Escanea el QR con tu app bancaria o de pagos y realiza el pago por el monto indicado.',
  payModalNote: 'Después, solicita la revisión por WhatsApp y adjunta el comprobante. El plan se habilitará cuando el administrador apruebe el pago.',
  sendProofButton: 'Enviar comprobante por WhatsApp',
  registeringText: 'Registrando solicitud…',
  cancelLabel: 'Cancelar',
  qrAccessibility: 'Código QR de pago',

  // Plans / CTA labels
  updateStatusButton: 'Actualizar estado del plan',
  recommended: 'RECOMENDADO',
  currentPlanText: 'Plan actual',
  enrollButton: 'Inscribirme ahora',

  // Generic navigation / simulation labels
  nextLabel: 'Siguiente',
  previousLabel: 'Anterior',
  finishLabel: 'Finalizar',
  startSimulation: 'Iniciar simulacro',

  // Cases / tests
  caseLabel: 'CASO CLÍNICO',
  dailyChallengeLabel: 'RETO DEL DÍA',

  // Profile / misc
  requestRegistered: 'Solicitud registrada',
  openWhatsApp: 'Abrir WhatsApp',
};

export default STR;
