import { writeFileSync } from 'node:fs';
import axios from 'axios';
import path from 'node:path';
import { app } from 'electron';

export const printStudentCard = async(_e, resData, student_id) => {
    // const address = `http://localhost:3006/api/getStudentCard/${studentId}`
    // const res = await axios.get(address, {
    //     responseType: 'arraybuffer'
    // })
    const pdfBuffer = Buffer.from(resData)
    const filePath = path.join(app.getPath('downloads'), `Carnet ${student_id}.pdf`)
    writeFileSync(filePath, pdfBuffer)
    return {ok: true, path: filePath}
}