/* =========================================================
   GUIONES — Speeches de WhatsApp y de llamada
   ---------------------------------------------------------
   PARA EDITAR UN SPEECH: buscá su bloque acá abajo y cambiá
   el texto entre las comillas invertidas (`). Nada más.

   Los *asteriscos* se ven en negrita en la pantalla y se copian
   tal cual, porque WhatsApp los usa para poner el texto en negrita.

   Estructura de cada categoría:
     tab        -> nombre del botón de arriba
     titulo     -> título que se ve en pantalla
     variantes  -> si hay más de una, aparecen sub-botones
     bloques    -> cada mensaje, con su etiqueta y su texto
     nota       -> recuadro amarillo "Tener en cuenta"
     conector   -> texto del separador entre un mensaje y el siguiente
   ========================================================= */

const REGLA_GENERAL = 'Leer el mensaje del cliente antes de enviar el saludo. Si ya indicó qué necesita, ir directamente al speech del caso. Trato de usted en todos los canales.';

/* --- Textos que se repiten, para no escribirlos dos veces --- */
const CONFIRMACION_AGENDA = `Gracias por aguardar 🙏

Su vehículo quedó agendado para el día *[DÍA]* a las *[HORA]* hs.

El día anterior nos comunicaremos con usted para confirmar el turno.

¡Que tenga un excelente día! 😊`;

const CIERRE_DERIVACION = `¡Gracias por la información! 🙌

Uno de nuestros asesores comerciales se pondrá en contacto con usted a la brevedad.

¡Que tenga un excelente día! 😊`;

const DATOS_AGENDA = `• Nombre completo:
• Teléfono:
• Correo electrónico:
• Matrícula:
• Kilometraje:
• Turno preferido: Mañana / Tarde`;

function speechRepuestos(marca){
  return `Buenos [días/tardes]!

Por consultas de repuestos y accesorios *${marca}*, puede comunicarse por los siguientes medios:

📱 WhatsApp: 094 842 743 — 094 843 044
📞 Central: 2924 7575

📍 Rondeau 2165 esq. Colombia (Aguada, Montevideo)
🕘 Lunes a viernes de 09:00 a 18:00 hs.

¡Quedamos a las órdenes! 😊`;
}


const SPEECHES_WPP = [

  {
    tab: 'Saludo',
    titulo: 'Saludo inicial',
    variantes: [{
      nombre: 'Marcas y Chevrolet',
      bloques: [{
        texto: `Buenos [días/tardes]! Mi nombre es [NOMBRE] de Grupo Fiancar.
¿En qué le puedo ayudar?`
      }]
    }]
  },

  {
    tab: 'Agenda',
    titulo: 'Agenda de taller',
    variantes: [
      {
        nombre: 'Marcas',
        bloques: [
          {
            etiqueta: 'Solicitud de datos',
            texto: `Gracias por comunicarse con Grupo Fiancar, mi nombre es [NOMBRE] 😊

A continuación le informo las fechas disponibles en nuestros talleres:

🔧 *Taller Carrasco:*
▸ [FECHA / HORARIO]

🔧 *Taller Rondeau:*
▸ [FECHA / HORARIO]

Para poder realizar la agenda, necesito los siguientes datos:

${DATOS_AGENDA}

Una vez que me indique en qué taller le queda mejor y me envíe los datos solicitados, procedemos. Le asignaremos la primera hora disponible. Si tiene preferencia por un horario en particular, indíquenoslo y le confirmamos disponibilidad.`,
            conector: 'cuando el cliente envía sus datos'
          },
          { etiqueta: 'Confirmación', texto: CONFIRMACION_AGENDA }
        ]
      },
      {
        nombre: 'Chevrolet',
        bloques: [
          {
            etiqueta: 'Solicitud de datos',
            texto: `Gracias por comunicarse con Chevrolet Montevideo, mi nombre es [NOMBRE] 😊

A continuación le informo las fechas disponibles en nuestro taller:

🔧 *Taller Chevrolet Montevideo:*
▸ [FECHA / HORARIO]

Para poder realizar la agenda, necesito los siguientes datos:

${DATOS_AGENDA}

Una vez que me envíe los datos, procedemos. Le asignaremos la primera hora disponible. Si tiene preferencia por un horario en particular, indíquenoslo y le confirmamos disponibilidad.`,
            conector: 'cuando el cliente envía sus datos'
          },
          { etiqueta: 'Confirmación', texto: CONFIRMACION_AGENDA }
        ]
      }
    ]
  },

  {
    tab: 'Consulta modelo',
    titulo: 'Consulta por un modelo',
    variantes: [
      {
        nombre: 'Marcas',
        bloques: [
          {
            etiqueta: 'Consulta inicial',
            texto: `Gracias por comunicarse con Grupo Fiancar, mi nombre es [NOMBRE] 😊

¿Qué sucursal prefiere?

🏢 Rondeau
🏢 Shopping de Autos
🏢 Carrasco

Para poder derivar su consulta a un asesor comercial, necesito los siguientes datos:

• Marca de interés:
• Modelo de interés:
• Nombre de contacto:
• Correo electrónico:`,
            conector: 'cuando el cliente envía sus datos'
          },
          { etiqueta: 'Cierre', texto: CIERRE_DERIVACION }
        ]
      },
      {
        nombre: 'Chevrolet',
        bloques: [
          {
            etiqueta: 'Consulta inicial',
            texto: `Gracias por comunicarse con Chevrolet Montevideo, mi nombre es [NOMBRE] 😊

Para poder derivar su consulta a un asesor comercial, necesito los siguientes datos:

• Modelo de interés:
• Nombre de contacto:
• Correo electrónico:`,
            conector: 'cuando el cliente envía sus datos'
          },
          { etiqueta: 'Cierre', texto: CIERRE_DERIVACION }
        ]
      }
    ]
  },

  {
    tab: 'Precios',
    titulo: 'Consulta de precios',
    variantes: [{
      nombre: 'Marcas y Chevrolet',
      bloques: [
        {
          etiqueta: 'Modelo con una sola versión',
          texto: `Buenos [días/tardes]! Mi nombre es [NOMBRE] de Grupo Fiancar.

El precio del *[MARCA] [MODELO]* es de USD [PRECIO].

Si desea recibir toda la información, indíquenos un contacto y nos comunicamos con usted para brindarle todos los detalles.`
        },
        {
          etiqueta: 'Modelo con más de una versión',
          texto: `Buenos [días/tardes]! Mi nombre es [NOMBRE] de Grupo Fiancar.

El modelo *[MARCA] [MODELO]* está disponible en [X] versiones:

▸ *[VERSIÓN 1]* — USD [PRECIO]
▸ *[VERSIÓN 2]* — USD [PRECIO]

Si desea conocer las diferencias entre las versiones y recibir toda la información, indíquenos un contacto y nos comunicamos con usted para brindarle todos los detalles.`,
          nota: 'Agregar o quitar líneas ▸ según la cantidad real de versiones y ajustar el número en [X]. <b>Toda consulta por precio cierra pidiendo datos de contacto</b>: sin eso no se genera el lead ni queda registro en Vtiger.'
        }
      ]
    }]
  },

  {
    tab: 'Ficha técnica',
    titulo: 'Envío de ficha técnica',
    variantes: [{
      nombre: 'Marcas y Chevrolet',
      bloques: [{
        texto: `Buenos [días/tardes]! Mi nombre es [NOMBRE] de Grupo Fiancar.

Le enviamos la ficha técnica del *[MARCA] [MODELO]* para que pueda ver el detalle 📄

Si desea recibir toda la información, indíquenos un contacto y nos comunicamos con usted para brindarle todos los detalles.`,
        nota: 'Adjuntar el PDF en el mismo envío que el mensaje, no en un mensaje aparte. Confirmar que la ficha corresponda a la versión consultada antes de enviarla.'
      }]
    }]
  },

  {
    tab: 'Financiación',
    titulo: 'Opciones de financiación',
    variantes: [{
      nombre: 'Marcas y Chevrolet',
      bloques: [{
        texto: `En Grupo Fiancar le ofrecemos múltiples opciones para financiar su vehículo nuevo o usado:

💳 *Financiación propia:*
▸ Hasta el 60% del valor
▸ Hasta 37 cuotas en dólares
▸ Hasta 24 cuotas en pesos o unidades indexadas

🏦 *Financiación externa:*
▸ 100% a través de Mi Auto Santander
▸ Con el banco de su preferencia

🔄 También podemos tomar su usado como parte de pago.

¿Desea que un asesor se comunique con usted para brindarle más detalles?`
      }]
    }]
  },

  {
    tab: 'Clearing',
    titulo: 'Cliente en clearing',
    variantes: [{
      nombre: 'Marcas y Chevrolet',
      bloques: [{
        texto: `Buenos [días/tardes]! Mi nombre es [NOMBRE] de Grupo Fiancar.

Si la persona que desea financiar el vehículo se encuentra en clearing, realizamos un *estudio crediticio integral* para evaluar la posibilidad de otorgar el crédito.

En ese caso quedaría descartada la financiación bancaria, ya que para el banco no estar en clearing es un requisito excluyente.

💳 *Crédito de la casa:*
▸ Entrega mínima inicial: 40% del valor del vehículo
▸ Saldo restante: hasta 37 cuotas en dólares

📄 *Documentación a presentar* (financiación propia o bancaria):

1. Cédula de identidad vigente de los titulares
2. Recibo de ente público (Antel, UTE, OSE, cable o gas)
3. Últimos 4 recibos de sueldo

¿Desea que un asesor se comunique con usted para avanzar con el estudio?`,
        nota: 'Nunca adelantar si el crédito va a salir ni estimar montos: el resultado lo define el área de créditos tras el estudio. El 40% de entrega es el <b>mínimo</b>, puede subir según el caso. No presentarlo como cifra cerrada.'
      }]
    }]
  },

  {
    tab: 'Permuta',
    titulo: 'Permuta de usado',
    variantes: [{
      nombre: 'Solo Marcas',
      bloques: [{
        texto: `Sí, podemos recibir su usado como parte de pago. Aceptamos vehículos de todas las marcas.

¿Desea que un asesor se comunique con usted para brindarle más información?`
      }]
    }]
  },

  {
    tab: 'Repuestos',
    titulo: 'Consulta de repuestos',
    variantes: [
      { nombre: 'Geely',      bloques: [{ texto: speechRepuestos('Geely') }] },
      { nombre: 'JAC',        bloques: [{ texto: speechRepuestos('JAC') }] },
      { nombre: 'Lynk & Co.', bloques: [{ texto: speechRepuestos('Lynk & Co.') }] },
      { nombre: 'Tata',       bloques: [{ texto: speechRepuestos('Tata') }] }
    ]
  },

  {
    tab: 'Tasaciones',
    titulo: 'Tasaciones',
    variantes: [{
      nombre: 'Marcas y Chevrolet',
      bloques: [{
        texto: `Las tasaciones no se realizan por este medio. Se llevan a cabo de forma presencial con un vendedor, quien podrá brindarle un precio de toma por su vehículo y la diferencia correspondiente.

¿Desea que un asesor se comunique con usted para coordinar?`
      }]
    }]
  },

  {
    tab: 'Modelo EX2',
    titulo: 'Modelo EX2 de Geely',
    variantes: [{
      nombre: 'Solo Marcas',
      bloques: [{
        texto: `Buenos [días/tardes]! Mi nombre es [NOMBRE] de Grupo Fiancar.

El modelo *EX2* de Geely se comercializa únicamente mediante preventa, por lo que no contamos con unidades para entrega inmediata.

Si lo desea, podemos ponerlo en contacto con uno de nuestros asesores comerciales para que le brinden mayor información.

También puede explorar el catálogo completo de vehículos disponibles (filtrando por marca, precio, 0km, usado, sucursal, etc.):

🔗 https://shoppingdeautos.uy/
🔗 https://vehiculos.grupofiancar.com/`
      }]
    }]
  },

  {
    tab: 'Novedades',
    titulo: 'Modelo sin confirmar o sin novedades',
    variantes: [{
      nombre: 'Marcas y Chevrolet',
      bloques: [
        {
          etiqueta: 'Opción A — cierre simple',
          texto: `Buenos [días/tardes]! Mi nombre es [NOMBRE] de Grupo Fiancar.

Por el momento no tenemos novedades sobre ese modelo. Lo invitamos a seguir nuestras redes sociales, donde publicamos constantemente nuestros lanzamientos 📲

¡Quedamos a las órdenes! 😊`
        },
        {
          etiqueta: 'Opción B — el cliente pide que le avisemos',
          texto: `Buenos [días/tardes]! Mi nombre es [NOMBRE] de Grupo Fiancar.

Por el momento no tenemos novedades sobre ese modelo. Lo invitamos a seguir nuestras redes sociales, donde publicamos constantemente nuestros lanzamientos 📲

Si lo desea, puede dejarnos su nombre y un contacto, y le avisamos ni bien tengamos información.`,
          nota: 'Usar la Opción B <b>solo si el contacto se carga en Vtiger</b>. Si no queda registrado, es una promesa que nadie va a cumplir y vuelve como reclamo. Nunca confirmar que el modelo va a llegar ni dar fechas estimadas.'
        }
      ]
    }]
  },

  {
    tab: 'Entrega demorada',
    titulo: 'Entrega demorada',
    variantes: [{
      nombre: 'Marcas y Chevrolet',
      bloques: [
        {
          etiqueta: 'Primer contacto — relevamiento del caso',
          texto: `Buenos [días/tardes]! Mi nombre es [NOMBRE] de Grupo Fiancar. Disculpe la demora en nuestra respuesta 🙏

Para poder verificar su caso y ayudarlo, necesitamos que nos brinde algunos datos. Le comentamos que las entregas están demoradas, pero estamos trabajando para que puedan realizarse lo antes posible.

Por favor, indíquenos:

• Nombre del asesor de ventas:
• En qué automotora realizó la compra:
• Qué modelo compró:

Quedamos atentos a su respuesta. ¡Gracias por su paciencia! 😊`,
          nota: 'No dar fechas ni plazos estimados. Con los datos que envía el cliente, <b>registrar el caso en Vtiger</b> y derivarlo al asesor o sucursal correspondiente antes de responder de nuevo.',
          conector: 'si el cliente insiste o vuelve a reclamar'
        },
        {
          etiqueta: 'Cliente insiste — caso ya registrado',
          texto: `Entendemos su preocupación y le pedimos disculpas por la espera 🙏

La entrega de su vehículo quedó registrada como *prioridad*. Estamos aguardando que la unidad sea liberada para poder coordinar la fecha de entrega.

Ni bien esto suceda, nos comunicamos con usted para coordinar día y horario.`,
          nota: 'Este mensaje se envía <b>solo si el caso ya fue elevado</b>. Si el cliente vuelve por tercera vez, no repetir el speech: escalar al responsable de la sucursal y avisar al coordinador.'
        }
      ]
    }]
  },

  {
    tab: 'Test drive',
    titulo: 'Test drive',
    variantes: [{
      nombre: 'Solo Marcas',
      bloques: [{
        texto: `Buenos [días/tardes]! Mi nombre es [NOMBRE] de Grupo Fiancar.

Nuestros vehículos *[MARCA]* los puede encontrar en las siguientes sucursales:

📍 *Rondeau* — Av. Gral. Rondeau 2165 esq. Colombia
 Lunes a viernes · 09:00 a 18:15 hs.

📍 *Carrasco* — Av. Giannattasio esq. Tacuarí
 Lunes a viernes · 10:00 a 18:30 hs.

📍 *Shopping de Autos* — Ruta Interbalnearia Km 22.500
 Todos los días · 10:00 a 19:00 hs.

¡Lo esperamos! 😊`
      }]
    }]
  }

];


/* =========================================================
   SPEECH DE LLAMADA — los 5 pasos, en orden
   ========================================================= */

const PASOS_LLAMADA = [
  {
    n: 1,
    titulo: 'Saludo',
    bloques: [{ texto: `Grupo Fiancar, buenos días/tardes…` }],
    nota: 'Siempre el nombre de la empresa según la línea que entra, y el saludo acorde a la hora. Evitar arrancar con "hola" o "¿aló?".'
  },
  {
    n: 2,
    titulo: 'Identificación',
    bloques: [{ texto: `…mi nombre es [NOMBRE], ¿en qué le puedo ayudar?` }],
    nota: 'El nombre propio va enseguida del saludo, en la misma frase, y se cierra con la pregunta abierta para que el cliente hable.'
  },
  {
    n: 3,
    titulo: 'Comprensión',
    bloques: [
      {
        etiqueta: 'Opción A — confirmar la solicitud',
        texto: `Perfecto, entonces para confirmar que entendí correctamente, lo que usted necesita es [RESUMEN DE LA SOLICITUD].`
      },
      {
        etiqueta: 'Opción B — confirmar consulta + problema',
        texto: `Permítame repetirlo para asegurarme de haber entendido bien: usted está consultando por [TEMA] y el problema es [DETALLE DEL PROBLEMA], ¿es correcto?`
      }
    ],
    nota: 'Repetir el pedido con palabras propias y esperar el "sí" del cliente antes de pasar a resolver. Decir solo "entiendo" no confirma nada.'
  },
  {
    n: 4,
    titulo: 'Resolución',
    bajada: 'Debe incluir qué se va a hacer · cuándo · cómo lo impacta',
    bloques: [{
      texto: `Vamos a elevar su caso al sector correspondiente. Le dejo este número como referencia de seguimiento: [N.º DE CASO].

Se estará comunicando con usted [PLAZO]. Mientras tanto, no necesita realizar ninguna gestión adicional.`
    }],
    nota: 'Nunca cerrar sin los tres datos: qué se hace, cuándo, y qué tiene que hacer el cliente. Si no se resuelve en la llamada, queda registrado en Vtiger y se le avisa.'
  },
  {
    n: 5,
    titulo: 'Saludo final',
    bloques: [{
      texto: `¿Hay algo más en lo que le pueda ayudar?

[Si no] Que tenga un excelente día/tarde. Gracias por llamar a Grupo Fiancar.`
    }],
    nota: 'Ofrecer ayuda adicional antes de despedirse y esperar a que el cliente corte primero. Sostener el trato de usted hasta el final de la llamada.'
  }
];
