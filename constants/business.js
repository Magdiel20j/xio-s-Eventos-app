import { Linking, Alert } from 'react-native';

export const BUSINESS_INFO = {
  name: "Xio's Eventos",
  phone: '6040-9234',
  whatsappRaw: '50360409234',
  whatsappDisplay: '+503 6040-9234',
  currency: 'USD',
  currencySymbol: '$',
  country: 'El Salvador',
  zones: [
    { id: 'san_salvador', name: 'San Salvador (Área Metropolitana)', extraCost: 0 },
    { id: 'otros_deptos', name: 'Otros Departamentos / Fuera de S.S.', extraCost: 15 }
  ]
};

/**
 * Formatea una cantidad a dólares estadounidenses ($ USD)
 * @param {number|string} amount 
 * @returns {string} Ejemplo: "$45.00 USD"
 */
export const formatUSD = (amount) => {
  const num = Number(amount) || 0;
  return `$${num.toFixed(2)} USD`;
};

/**
 * Abre WhatsApp con mensaje seguro y estructurado para cotizar o pedir info
 */
export const contactWhatsApp = async ({
  comboName,
  zoneName,
  price,
  customMessage
}) => {
  try {
    let text = `¡Hola Xio's Eventos! 👋\nMe interesa consultar sobre sus servicios de eventos en El Salvador 🇸🇻\n\n`;

    if (comboName) {
      text += `🎈 *Servicio/Paquete:* ${comboName}\n`;
    }
    if (zoneName) {
      text += `📍 *Zona/Ubicación:* ${zoneName}\n`;
    }
    if (price !== undefined) {
      text += `💵 *Precio aproximado:* ${formatUSD(price)}\n`;
    }

    if (customMessage) {
      text += `\n💬 *Pregunta:* ${customMessage}\n`;
    } else {
      text += `\n¿Tienen disponibilidad de fecha y podrían brindarme más detalles? ¡Muchas gracias!`;
    }

    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${BUSINESS_INFO.whatsappRaw}?text=${encoded}`;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      // Fallback intentando abrir la URL directa en el navegador
      await Linking.openURL(url);
    }
  } catch (error) {
    Alert.alert(
      'Contacto WhatsApp',
      `Puedes escribirnos directamente a nuestro WhatsApp oficial: ${BUSINESS_INFO.whatsappDisplay}`
    );
  }
};
