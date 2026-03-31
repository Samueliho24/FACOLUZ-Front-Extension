import { writeFileSync } from 'node:fs';
import axios from 'axios';
import path from 'node:path';
import { app } from 'electron';
import { saveCertificate as apiMethod } from '../client/client';

export const saveCertificate = async(_e, resData) => {
    // const address = `http://localhost:3006/api/certificate/${certificate_id}`
    // const res = await axios.get(address, {
    //     responseType: 'arraybuffer',
    //     // headers: {'Authorization': `Bearer ${token}`}
    // })
    // const res = await apiMethod(certificate_id)
    // console.log(res)
    const pdfBuffer = Buffer.from(resData)
    const filePath = path.join(app.getPath('downloads'), "Certificado.pdf")
    writeFileSync(filePath, pdfBuffer)
    return {ok: true, path: filePath}
}