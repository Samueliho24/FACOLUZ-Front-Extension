import { newValidator } from './validators'

export function validateForm(fields) {
    const v = newValidator()
    for (const field of Object.keys(fields)) {
        fields[field](v)
    }
    const err = v.firstError()
    return err ? err.message : null
}

/**
 * Diajs -> `YYYY-MM-DD`.
 *
 * Se usa en vez de interpolar `$y/$M/$D` a mano porque `$M` es el mes en base
 * 0: enero daba `0`. Y `${birthDate.$D + 1}` sumaba uno al dia, no al mes, así
 * que un 15 de enero salia como dia 16 del mes 0.
 */
export function dayjsToISODate(dayjsValue) {
    if (!dayjsValue) return ''
    if (typeof dayjsValue.format === 'function') return dayjsValue.format('YYYY-MM-DD')
    const y = dayjsValue.$y
    const m = String(dayjsValue.$M + 1).padStart(2, '0')
    const d = String(dayjsValue.$D).padStart(2, '0')
    return `${y}-${m}-${d}`
}

/**
 * Saca un texto legible de la respuesta de error del backend.
 *
 * El backend responde 400 con `{error: 'Validacion', field, mensaje}` o con un
 * error de negocio en texto plano. Many modales hacia `res.response.data` a
 * la vista, y antd no sabe pintar un objeto, asi que se ve `[object Object]`.
 * Cuando no hay mensaje util, se cae al texto que pasa cada llamada.
 */
export function problemFromServer(res, fallback = 'Ocurrio un error') {
    const data = res?.response?.data

    if (typeof data === 'string' && data.trim() !== '') return data
    if (data && typeof data === 'object' && typeof data.message === 'string') return data.message
    if (typeof data?.message === 'string') return data.message

    return fallback
}
