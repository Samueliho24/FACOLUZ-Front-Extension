import { writeFileSync } from 'node:fs';
import axios from 'axios';
import path from 'node:path';
import { app } from 'electron';

export const getDailyReport = async(_e, resData) => {
    // const res = await axios.get('http://localhost:3006/api/getDailyReport', {
    //     responseType: 'arraybuffer'
    // })
    const currentDate = new Date
    const reportDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
    const pdfBuffer = Buffer.from(resData)
    const filePath = path.join(app.getPath('downloads'), `Reporte del ${reportDate.getMonth()+1}-${reportDate.getFullYear()}.pdf`)
    writeFileSync(filePath, pdfBuffer)
    return {ok: true, path: filePath}
}