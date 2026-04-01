import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { app } from 'electron';

export const saveFile = async(_e, resData, fileName) => {
    const pdfBuffer = Buffer.from(resData)
    const filePath = path.join(app.getPath('downloads'), fileName)
    writeFileSync(filePath, pdfBuffer)
    return {ok: true, path: filePath}
}