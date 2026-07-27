/**
 * IA Predictiva — Plan Enterprise
 * Motor de remediación con LLM local (Ollama) por entidad.
 */

import { useState } from 'react'
import { Brain, Zap, Shield, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { DEMO_ENTITIES } from '@/api/mockData'

const AI_SUGGESTIONS_UMG = [
  {
    vuln: 'CVE-2021-44228 — Log4Shell en Portal Académico',
    severity: 'critical',
    model: 'llama3:8b',
    analysis: 'La presencia de Log4Shell en el portal académico representa un riesgo crítico de explotación remota. Dado que el portal es accesible públicamente y procesa autenticación de 40,000 estudiantes, la ventana de exposición es máxima.',
    steps: [
      'Actualizar Log4j a versión 2.21.0 o superior de forma inmediata',
      'Aplicar regla de mitigación temporal: -Dlog4j2.formatMsgNoLookups=true',
      'Implementar regla WAF: bloquear patrones ${jndi:, ${env:, ${java:',
      'Revisar logs de Tomcat/Apache de los últimos 90 días',
      'Escanear el sistema de archivos en busca de webshells (.jsp, .jspx)',
    ],
    effort: '3-5 horas',
    risk_reduction: '94%',
  },
  {
    vuln: 'CVE-2020-1472 — Zerologon en Active Directory',
    severity: 'critical',
    model: 'llama3:8b',
    analysis: 'Zerologon en el Controlador de Dominio permite a cualquier atacante en la red interna obtener privilegios de Domain Admin en segundos. Con 6,000 cuentas corporativas en el AD, el impacto de un compromiso sería catastrófico.',
    steps: [
      'Aplicar KB4571729 (parche de agosto 2020) de forma urgente',
      'Habilitar modo enforcement en Netlogon (reg add HKLM\\SYSTEM\\...)',
      'Revisar eventos 5827-5829 en el Event Viewer del DC',
      'Forzar cambio de contraseña en todas las cuentas privilegiadas',
      'Implementar Microsoft Defender Credential Guard',
    ],
    effort: '2-4 horas',
    risk_reduction: '99%',
  },
]

const AI_SUGGESTIONS_HOSPITAL = [
  {
    vuln: 'CVE-2024-3400 — PAN-OS RCE en Firewall Palo Alto',
    severity: 'critical',
    model: 'llama3:8b',
    analysis: 'El firewall que segmenta la red médica crítica (UCI, quirófanos) tiene una vulnerabilidad RCE sin autenticación. Si se compromete, el atacante tiene visibilidad y control total sobre los equipos médicos conectados. El riesgo para pacientes es directo.',
    steps: [
      'Actualizar PAN-OS a versión 11.1.2-h3 o superior INMEDIATAMENTE',
      'Desactivar temporalmente GlobalProtect si no es operativamente crítico',
      'Revisar logs del device para actividad sospechosa en /var/log/pan/gp-pand.log',
      'Aislar el firewall de la gestión remota hasta aplicar el parche',
      'Notificar al CERT-GT según Ley de Ciberseguridad Guatemala (Art. 12, 72h)',
    ],
    effort: '1-2 horas',
    risk_reduction: '97%',
  },
  {
    vuln: 'Transmisión HL7 sin cifrado — Resultados de laboratorio',
    severity: 'high',
    model: 'mistral:7b',
    analysis: 'Los mensajes HL7 v2 se transmiten en texto plano entre el LIS y el HIS. Cualquier dispositivo en la VLAN hospitalaria puede capturar resultados de exámenes, diagnósticos y datos de pacientes. Esto constituye una violación directa de la confidencialidad médica y las regulaciones HIPAA/MSPAS.',
    steps: [
      'Implementar TLS 1.3 en el HL7 Interface Engine (stunnel o HAProxy como proxy TLS)',
      'Segmentar la VLAN médica con ACLs para aislar el tráfico HL7',
      'Certificado SSL: usar Let\'s Encrypt o PKI interna del MSPAS',
      'Verificar compatibilidad de versiones HL7 con todos los equipos de laboratorio',
      'Documentar el cambio para auditoría HIPAA §164.312(e)(1)',
    ],
    effort: '6-8 horas',
    risk_reduction: '88%',
  },
]

export function AIPage() {
  const { activeEntityId } = useAuthStore()
  const [expanded, setExpanded] = useState<number | null>(0)
  const [generating, setGenerating] = useState<number | null>(null)
  const entity = DEMO_ENTITIES.find(e => e.id === activeEntityId)
  const suggestions = activeEntityId === 'hospital' ? AI_SUGGESTIONS_HOSPITAL : AI_SUGGESTIONS_UMG

  const simulateGenerate = (i: number) => {
    setGenerating(i)
    setTimeout(() => { setGenerating(null); setExpanded(i) }, 2500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-900/30 rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">IA Predictiva</h1>
          <p className="text-gray-500 text-sm">{entity?.name} — Motor de remediación con LLM local (Ollama)</p>
        </div>
      </div>

      {/* Badge soberanía */}
      <div className="bg-purple-900/10 border border-purple-800/30 rounded-xl px-4 py-3 flex items-start gap-3">
        <Shield className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-purple-300 text-sm font-semibold">IA Soberana — Sin datos en la nube</p>
          <p className="text-gray-500 text-xs">Los análisis se procesan en el contenedor Ollama local. Ningún dato de pacientes, estudiantes ni activos sale de la red del cliente.</p>
        </div>
      </div>

      {/* Sugerencias de remediación */}
      <div className="space-y-3">
        {suggestions.map((s, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <button
              className="w-full px-5 py-4 flex items-start justify-between gap-4 hover:bg-gray-800/30 transition-colors text-left"
              onClick={() => expanded === i ? setExpanded(null) : setExpanded(i)}
            >
              <div className="flex items-start gap-3 min-w-0">
                <Zap className={`w-4 h-4 mt-0.5 flex-shrink-0 ${s.severity === 'critical' ? 'text-red-400' : 'text-orange-400'}`} />
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm">{s.vuln}</p>
                  <p className="text-gray-500 text-xs mt-0.5">Modelo: {s.model} · Reducción de riesgo: <span className="text-green-400 font-semibold">{s.risk_reduction}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.severity === 'critical' ? 'bg-red-900/30 text-red-400' : 'bg-orange-900/30 text-orange-400'}`}>
                  {s.severity.toUpperCase()}
                </span>
                {expanded === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            {expanded === i && (
              <div className="border-t border-gray-800 p-5 space-y-4">
                <div className="bg-gray-800/40 rounded-xl p-4">
                  <p className="text-xs font-semibold text-purple-400 mb-1 flex items-center gap-1"><Brain className="w-3 h-3" /> Análisis de la IA</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{s.analysis}</p>
                </div>
                <div>
                  <p className="text-white font-semibold text-xs mb-2">Plan de Remediación ({s.effort})</p>
                  <ol className="space-y-1.5">
                    {s.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-gray-300">
                        <span className="w-5 h-5 rounded-full bg-blue-900/40 text-blue-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">{j + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {expanded !== i && (
              <div className="px-5 pb-4">
                <button
                  onClick={() => simulateGenerate(i)}
                  disabled={generating === i}
                  className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-60"
                >
                  {generating === i ? <><Loader2 className="w-3 h-3 animate-spin" /> Generando con {s.model}...</> : <><Brain className="w-3 h-3" /> Regenerar análisis</>}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
