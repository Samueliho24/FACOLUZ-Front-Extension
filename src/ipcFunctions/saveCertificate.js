import { writeFileSync } from 'node:fs';
import axios from 'axios';
import path from 'node:path';
import { app } from 'electron';

export const saveCertificate = async(_e, certificate_id) => {
    const address = `http://localhost:3006/api/certificate/${certificate_id}`
    const res = await axios.get(address, {
        responseType: 'arraybuffer'
    })
    const currentDate = new Date
    const reportDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
    const pdfBuffer = Buffer.from(res.data)
    const filePath = path.join(app.getPath('downloads'), "Certificado.pdf")
    writeFileSync(filePath, pdfBuffer)
    return {ok: true, path: filePath}
}