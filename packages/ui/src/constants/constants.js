export const HEADERS_AUTO_SUGGESTIONS = {
    keys: [
        'Accept', 'Accept-Encoding', 'Accept-Language', 'Authorization', 'Cache-Control', 'Connection', 'Content-Length',
        'Content-Type', 'Cookie', 'Date', 'Expect', 'Forwarded', 'From', 'Host', 'If-Match', 'If-Modified-Since',
        'If-None-Match', 'If-Range', 'If-Unmodified-Since', 'Max-Forwards', 'Origin', 'Pragma', 'Proxy-Authorization',
        'Range', 'Referer', 'TE', 'User-Agent', 'Upgrade', 'Via', 'Warning'
    ],
    values: {
        'Content-Type': [
            'application/json', 'application/xml', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/html',
            'text/plain', 'text/css', 'text/javascript', 'application/javascript', 'application/octet-stream', 'application/pdf',
            'application/zip', 'application/gzip', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg',
            'audio/ogg', 'audio/wav', 'video/mp4', 'video/mpeg', 'video/ogg', 'video/webm'
        ],
        'Accept': [
            'application/json', 'application/xml', 'text/html', 'text/plain', 'image/jpeg', 'image/png', '*/*'
        ],
        'Accept-Encoding': [
            'gzip', 'compress', 'deflate', 'br', 'identity', '*'
        ],
        'Accept-Language': [
            'en-US', 'en-GB', 'en', 'fr-FR', 'fr', 'de-DE', 'de', 'es-ES', 'es', 'zh-CN', 'zh'
        ],
        'Authorization': [
            'Basic <credentials>', 'Bearer <token>', 'Digest <credentials>'
        ],
        'Cache-Control': [
            'no-cache', 'no-store', 'max-age=<seconds>', 'max-stale', 'min-fresh=<seconds>', 'only-if-cached'
        ],
        'Connection': [
            'keep-alive', 'close'
        ],
        'Expect': [
            '100-continue'
        ],
        'Pragma': [
            'no-cache'
        ],
        'TE': [
            'trailers', 'deflate', 'gzip'
        ],
    }
}

export const ASSERT_OPERATORS = [
    'isGreaterThan',
    'isGreaterThenOrEqual',
    'isEqualTo',
    'isNotEqualTo',
    'isLessThen',
    'isLessThenOrEqual',
    'contains',
    'notContains',
    'startWith',
    'endWith',
    'matchesRegex',
    'notMatchesRegex',
    'between',
    'notBetween',
    'isEmpty',
    'isUnDefined',
    'isNull',
    'isTrue',
    'isFalse',
    'isTypeOf',
    // 'isInstanceOf', this needs to be added back
    'isArray',
    'isObject',
    'isString',
    'isNumber',
    'isBoolean',
    'hasLength',
]

export const APP_API_PATH = 'hawkClient'
export const APP_DISPLAT_NAME = 'HawkClient'
export const APP_VERSION = '1.11.1'
