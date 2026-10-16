const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "komsan_ai_secure_webhook_token_2026";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || "YOUR_META_PAGE_ACCESS_TOKEN";

app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

app.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.object === 'instagram') {
        body.entry.forEach(async (entry) => {
            const changes = entry.changes || [];
            changes.forEach(async (change) => {
                if (change.field === 'comments') {
                    const commentData = change.value;
                    const commentId = commentData.id;
                    const commentText = (commentData.text || '').toLowerCase();
                    const userId = commentData.from ? commentData.from.id : null;

                    if (commentText.includes('أوامر') || commentText.includes('flow') || commentText.includes('فلو')) {
                        try {
                            await axios.post(`https://graph.facebook.com/v18.0/${commentId}/replies`, {
                                message: 'من عيوني يا هندسة! ابعتلك دليل الـ 100 أمر في الـ DM حالا 🚀🔥',
                                access_token: PAGE_ACCESS_TOKEN
                            });

                            if (userId) {
                                await axios.post(`https://graph.facebook.com/v18.0/me/messages`, {
                                    recipient: { id: userId },
                                    message: {
                                        text: 'أهلاً بيك في عالم KOMSAN AI 🐺✨\n\nتفضل رابط تحميل الدليل الشامل لأقوى 100 أمر سينمائي في Google Flow'
                                    },
                                    access_token: PAGE_ACCESS_TOKEN
                                });
                            }
                        } catch (error) {
                            console.error('Error:', error.message);
                        }
                    }
                }
            });
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
