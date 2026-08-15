const https = require('https');

/**
 * Publica un mensaje en una página de Facebook usando Graph API
 */
function publishToFacebook(message, pageId, accessToken) {
    return new Promise((resolve, reject) => {
        if (!pageId || !accessToken) {
            return reject(new Error('Missing FB_PAGE_ID or META_ACCESS_TOKEN'));
        }

        const data = JSON.stringify({
            message: message,
            access_token: accessToken
        });

        const options = {
            hostname: 'graph.facebook.com',
            port: 443,
            path: `/v20.0/${pageId}/feed`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                const response = JSON.parse(body);
                if (response.error) {
                    reject(new Error(response.error.message));
                } else {
                    resolve(response.id); // Devuelve el ID del post
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(data);
        req.end();
    });
}

/**
 * Publica una imagen con mensaje en Instagram usando Graph API
 * Requiere una URL de imagen pública.
 */
function publishToInstagram(imageUrl, caption, igAccountId, accessToken) {
    return new Promise((resolve, reject) => {
        if (!igAccountId || !accessToken) {
            return reject(new Error('Missing IG_ACCOUNT_ID or META_ACCESS_TOKEN'));
        }

        if (!imageUrl) {
            return reject(new Error('Instagram requires an image URL'));
        }

        // Paso 1: Crear el contenedor multimedia
        const createMediaData = JSON.stringify({
            image_url: imageUrl,
            caption: caption,
            access_token: accessToken
        });

        const createMediaOptions = {
            hostname: 'graph.facebook.com',
            port: 443,
            path: `/v20.0/${igAccountId}/media`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': createMediaData.length
            }
        };

        const req1 = https.request(createMediaOptions, (res1) => {
            let body1 = '';
            res1.on('data', chunk => body1 += chunk);
            res1.on('end', () => {
                const response1 = JSON.parse(body1);
                if (response1.error) {
                    return reject(new Error('Error creating IG media: ' + response1.error.message));
                }
                
                const creationId = response1.id;

                // Paso 2: Publicar el contenedor
                const publishData = JSON.stringify({
                    creation_id: creationId,
                    access_token: accessToken
                });

                const publishOptions = {
                    hostname: 'graph.facebook.com',
                    port: 443,
                    path: `/v20.0/${igAccountId}/media_publish`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': publishData.length
                    }
                };

                const req2 = https.request(publishOptions, (res2) => {
                    let body2 = '';
                    res2.on('data', chunk => body2 += chunk);
                    res2.on('end', () => {
                        const response2 = JSON.parse(body2);
                        if (response2.error) {
                            reject(new Error('Error publishing IG media: ' + response2.error.message));
                        } else {
                            resolve(response2.id); // Devuelve el ID del post en IG
                        }
                    });
                });

                req2.on('error', e => reject(e));
                req2.write(publishData);
                req2.end();
            });
        });

        req1.on('error', e => reject(e));
        req1.write(createMediaData);
        req1.end();
    });
}

/**
 * Publica una foto o video en Facebook usando Graph API
 */
function publishMediaToFacebook(message, mediaUrl, mediaType, pageId, accessToken) {
    return new Promise((resolve, reject) => {
        if (!pageId || !accessToken) {
            return reject(new Error('Missing FB_PAGE_ID or META_ACCESS_TOKEN'));
        }

        let endpointPath = `/v20.0/${pageId}/photos`;
        let payload = {
            message: message,
            access_token: accessToken
        };

        if (mediaType === 'video') {
            endpointPath = `/v20.0/${pageId}/videos`;
            payload = {
                description: message,
                file_url: mediaUrl,
                access_token: accessToken
            };
        } else {
            payload.url = mediaUrl;
        }

        const data = JSON.stringify(payload);

        const options = {
            hostname: 'graph.facebook.com',
            port: 443,
            path: endpointPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                const response = JSON.parse(body);
                if (response.error) {
                    reject(new Error(response.error.message));
                } else {
                    resolve(response.id); // Devuelve el ID del post
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(data);
        req.end();
    });
}

module.exports = {
    publishToFacebook,
    publishToInstagram,
    publishMediaToFacebook
};
