import { writeFileSync } from 'node:fs';
import axios from 'axios';
import path from 'node:path';
import { app } from 'electron';

export const printStudentCard = async(_e, studentId) => {
    const address = `http://localhost:3006/api/getStudentCard/${studentId}`
    const res = await axios.get(address, {
        responseType: 'arraybuffer'
    })
    const pdfBuffer = Buffer.from(res.data)
    const filePath = path.join(app.getPath('downloads'), `Carnet ${studentId}.pdf`)
    writeFileSync(filePath, pdfBuffer)
    return {ok: true, path: filePath}
}