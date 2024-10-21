import 'dotenv/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import express from 'express';
import bodyParser from 'body-parser';
import qrcode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
const PORT = process.env.PORT || 8000;

const app = express();
app.use(bodyParser.json());

const S3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY
    }
  });

app.get('/', (req, res) => {
    res.json({ message: 'Hello from server!' });
})

app.post('/generate', async (req, res) => {
    const url = req.body.url;
    try {
        const qrCode = await qrcode.toDataURL(url);

        try {
            const key = uuidv4();
            const uploadResult = await S3.send(new PutObjectCommand({
                Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
                Key: `${key}.png`,
                Body: Buffer.from(qrCode.split(',')[1], 'base64'),
                ContentType: 'image/png',
                ACL: 'public-read'
            }));

            res.json({ key });
        } catch (uploadError) {
            res.status(500).json({ message: 'Error uploading to S3', error: uploadError.message });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
