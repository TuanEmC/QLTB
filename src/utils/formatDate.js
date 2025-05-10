import { format } from 'date-fns'

export const formatNgayGio = (timestamp) => {
    if (!timestamp) return ''
    try {
        const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp.toDate?.() ?? timestamp
        return format(date, 'dd/MM/yyyy HH:mm')
    } catch (e) {
        return ''
    }
}
