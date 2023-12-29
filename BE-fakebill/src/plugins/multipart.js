import fp from "fastify-plugin";
import fMultipart from "@fastify/multipart"

import { fileURLToPath } from 'url';
import { pipeline } from 'stream'
import util from 'util'
import { createWriteStream, mkdirSync, existsSync } from 'fs'

import path from "path";
import { nanoid } from 'nanoid'
import sharp  from "sharp";
const pump = util.promisify(pipeline)

const tmpdir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../assets/upload')
if(!existsSync(tmpdir)){
    mkdirSync(tmpdir, {
        recursive: true
    })
}

async function onFile(part) {
    const {
        mimetype
    } = part

    const filename = nanoid(16) + path.extname(part.filename);
    const filepath = path.join(tmpdir, filename)
    const target = createWriteStream(filepath)
    await pump(part.file, target)
    const name76 = '76' + filename
    await sharp (`src/assets/upload/${filename}`)
    .resize(76, 76)
    .toFile(tmpdir + '/' + name76);
    part.value = {
        filename,
        filename2: name76,
        filepath,
        mimetype
    }
}

async function multipart(fastify, opts) {
    fastify.register(fMultipart, { attachFieldsToBody: 'keyValues', onFile })
}

export default fp(multipart, {
    name: "multipart-request",
});
