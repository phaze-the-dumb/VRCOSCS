const http = require('http');
const { randomUUID } = require('crypto');
let servers = [];
let events = [];
let processKey = () => {};

class HTTPServer{
    constructor(name){
        this.name = name;
        this.id = randomUUID();
        this.server = null;
        this.routes = [];

        this.listener = ( req, res ) => {
            let route = this.routes.find(x => x.method === req.method && x.path === req.url);
            if(!route){
                res.writeHead(404, { 'X-Powered-By': 'VRCOSCS-Web' });
                res.end('Cannot '+req.method+' '+req.url);

                return;
            }

            events.forEach(event => {
                if(event.Hook !== route.resID)return;

                let eventDataCache = {
                    callback: ( data ) => {
                        res.writeHead(eventDataCache.statusCode, eventDataCache.headers);
                        res.end(data);
                    },
                    statusCode: 200,
                    headers: { 'X-Powered-By': 'VRCOSCS-Web' }
                };
                Object.keys(event).forEach(key => {
                    if(key === 'parent' || key === 'Hook')return;
                    let value = event[key];
        
                    processKey(key, value, [ null, null ], eventDataCache);
                })
            });
        }
    }
    listen(port){
        this.server = http.createServer(this.listener);
        this.server.listen(port);
    }
    addRoute(method, path, resID){
        this.routes.push({ method: method, path: path, resID: resID });
    }
}

let httpConfig = {
    modules: [],
    ignoreKeys: [ 'processRoute' ],
    init: ({ events: e, processKey: processFunc }) => {
        events = e;
        processKey = processFunc;
    },
    HTTPOpen: ({ value, values }) => {
        let serverName = value.split(' ')[0];
        let serverPort = parseInt(value.split(' ')[1]);

        let s = new HTTPServer(serverName);
        s.listen(serverPort);

        servers.push(s);
        values[serverName] = s.id;
    },
    HTTPRoute: ({ value, actionDataCache }) => {
        actionDataCache['HTTPServer'] = servers.find(x => x.id === value);
    },
    HTTPRoutes: ({ value, actionDataCache }) => {
        let routes = {};

        Object.keys(value).forEach(key => {
            if(key === 'parent')return;
            routes[key] = value[key];
        })

        let s = actionDataCache['HTTPServer'];

        Object.keys(routes).forEach(key =>
            s.addRoute(routes[key].Method, routes[key].Path, key.replace(':', '')))
    },
    HTTPCode: ({ value, actionDataCache }) => {
        actionDataCache.statusCode = value;
    },
    HTTPHeader: ({ value, actionDataCache }) => {
        actionDataCache.headers[value.split(': ')[0]] = value.split(': ')[1];
    },
    HTTPResponse: ({ value, actionDataCache }) => {
        actionDataCache.callback(value);
    }
}

module.exports = httpConfig;